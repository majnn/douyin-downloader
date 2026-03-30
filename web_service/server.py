"""
抖音下载器 Web 服务
提供 REST API 和 WebSocket 接口供浏览器扩展调用
"""
import asyncio
import logging
import sys
import uuid
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Dict, Any, Optional

import yaml
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import uvicorn

# 添加项目根目录到 Python 路径
# 注意：目录名是 douyin-downloader（带连字符），需要添加到路径中
project_root = Path(__file__).parent.parent / "douyin-downloader"
if project_root.exists():
    sys.path.insert(0, str(project_root))
else:
    # 备选方案：尝试父目录
    project_root = Path(__file__).parent.parent
    sys.path.insert(0, str(project_root))

# 直接导入（从 douyin-downloader 目录运行时可以工作）
from config import ConfigLoader
from auth import CookieManager
from storage import Database, FileManager
from control import QueueManager, RateLimiter, RetryHandler
from core import DouyinAPIClient, URLParser, DownloaderFactory

logger = logging.getLogger("WebService")
logging.basicConfig(level=logging.INFO)


# ============== 请求/响应模型 ==============

class DownloadRequest(BaseModel):
    """下载请求模型"""
    url: str = Field(..., description="抖音视频/用户/合集链接")
    mode: Optional[str] = Field(None, description="下载模式: post(作品)/like(喜欢)/mix(合集)")
    save_path: Optional[str] = Field(None, description="保存路径")
    options: Optional[Dict[str, Any]] = Field(default_factory=dict, description="下载选项")


class TaskStatusResponse(BaseModel):
    """任务状态响应"""
    task_id: str
    status: str  # queued, downloading, completed, failed
    progress: float = 0.0
    current_file: Optional[str] = None
    downloaded: int = 0
    total: int = 0
    message: Optional[str] = None
    error: Optional[str] = None


class HistoryItem(BaseModel):
    """历史记录项"""
    aweme_id: str
    title: str
    author: str
    download_time: str
    file_path: str


class HistoryResponse(BaseModel):
    """历史记录响应"""
    items: list[HistoryItem]
    total: int


# ============== 任务管理器 ==============

class TaskManager:
    """管理下载任务"""

    def __init__(self):
        self.tasks: Dict[str, Dict[str, Any]] = {}
        self.websocket_connections: Dict[str, WebSocket] = {}

    def create_task(self, url: str, mode: Optional[str] = None,
                    save_path: Optional[str] = None,
                    options: Optional[Dict[str, Any]] = None) -> str:
        """创建新任务"""
        task_id = str(uuid.uuid4())
        self.tasks[task_id] = {
            "task_id": task_id,
            "url": url,
            "mode": mode,
            "save_path": save_path,
            "options": options or {},
            "status": "queued",
            "progress": 0.0,
            "current_file": None,
            "downloaded": 0,
            "total": 0,
            "message": "任务已创建，等待处理",
            "error": None,
        }
        return task_id

    def get_task(self, task_id: str) -> Optional[Dict[str, Any]]:
        """获取任务信息"""
        return self.tasks.get(task_id)

    def update_task(self, task_id: str, **kwargs):
        """更新任务状态"""
        if task_id in self.tasks:
            self.tasks[task_id].update(kwargs)
            # 推送更新到 WebSocket
            asyncio.create_task(self._push_update(task_id))

    async def _push_update(self, task_id: str):
        """推送更新到 WebSocket 连接"""
        if task_id in self.websocket_connections:
            ws = self.websocket_connections[task_id]
            try:
                task = self.tasks[task_id]
                await ws.send_json({
                    "task_id": task_id,
                    "status": task.get("status"),
                    "progress": task.get("progress", 0),
                    "current_file": task.get("current_file"),
                    "downloaded": task.get("downloaded", 0),
                    "total": task.get("total", 0),
                    "message": task.get("message"),
                    "error": task.get("error"),
                })
            except Exception as e:
                logger.warning(f"Failed to push update to WebSocket: {e}")

    def register_websocket(self, task_id: str, websocket: WebSocket):
        """注册 WebSocket 连接"""
        self.websocket_connections[task_id] = websocket

    def unregister_websocket(self, task_id: str):
        """注销 WebSocket 连接"""
        if task_id in self.websocket_connections:
            del self.websocket_connections[task_id]


# 全局任务管理器
task_manager = TaskManager()

# 全局配置
config: Optional[ConfigLoader] = None
cookie_manager: Optional[CookieManager] = None
database: Optional[Database] = None


# ============== 进度报告器 ==============

class WebSocketProgressReporter:
    """通过 WebSocket 报告进度"""

    def __init__(self, task_id: str):
        self.task_id = task_id

    def update(self, progress: float, current_file: str = None,
               downloaded: int = 0, total: int = 0, message: str = None):
        """更新进度"""
        task_manager.update_task(
            self.task_id,
            progress=progress,
            current_file=current_file,
            downloaded=downloaded,
            total=total,
            message=message,
        )


# ============== FastAPI 应用 ==============

@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    global config, cookie_manager, database

    # 启动时初始化
    logger.info("Initializing Web Service...")

    # 加载配置
    config_path = project_root / "config.yml"
    if config_path.exists():
        config = ConfigLoader(str(config_path))
        logger.info(f"Config loaded from {config_path}")
    else:
        logger.warning(f"Config file not found: {config_path}, using defaults")
        config = ConfigLoader(None)

    # 初始化 Cookie 管理器
    cookie_manager = CookieManager()
    cookies = config.get_cookies()
    cookie_manager.set_cookies(cookies)
    logger.info("Cookie manager initialized")

    # 初始化数据库
    db_path = config.get('database_path', 'dy_downloader.db')
    if db_path:
        database = Database(db_path=str(db_path))
        await database.initialize()
        logger.info(f"Database initialized: {db_path}")

    yield

    # 关闭时清理
    if database:
        await database.close()
    logger.info("Web Service shutdown")


# 创建 FastAPI 应用
app = FastAPI(
    title="抖音下载器 Web 服务",
    description="提供 REST API 和 WebSocket 接口供浏览器扩展调用",
    version="1.0.0",
    lifespan=lifespan,
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "chrome-extension://*",
        "moz-extension://*",
        "http://localhost:*",
        "http://127.0.0.1:*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============== API 端点 ==============

@app.get("/api/health")
async def health_check():
    """健康检查"""
    return {"status": "ok", "service": "douyin-downloader"}


@app.post("/api/v1/download")
async def create_download(request: DownloadRequest, background_tasks: BackgroundTasks):
    """创建下载任务"""
    if not config:
        raise HTTPException(status_code=503, detail="Service not initialized")

    # 解析 URL 确定类型
    parsed = URLParser.parse(request.url)
    if not parsed:
        raise HTTPException(status_code=400, detail=f"无法解析 URL: {request.url}")

    url_type = parsed.get('type')
    mode = request.mode

    # 根据类型自动确定模式
    if url_type == 'user' and not mode:
        mode = 'post'  # 默认下载作品
    elif url_type == 'collection' and not mode:
        mode = 'mix'

    # 创建任务
    task_id = task_manager.create_task(
        url=request.url,
        mode=mode,
        save_path=request.save_path or config.get('path', './Downloaded/'),
        options=request.options,
    )

    # 在后台执行下载
    background_tasks.add_task(execute_download, task_id, request)

    return {
        "task_id": task_id,
        "status": "queued",
        "message": "任务已创建",
        "url_type": url_type,
    }


@app.get("/api/v1/download/{task_id}/status", response_model=TaskStatusResponse)
async def get_task_status(task_id: str):
    """获取任务状态"""
    task = task_manager.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")

    return TaskStatusResponse(**task)


@app.get("/api/v1/history")
async def get_history(limit: int = 20, offset: int = 0):
    """获取下载历史"""
    if not database:
        return {"items": [], "total": 0}

    # 从 aweme 表获取最近下载的视频
    db = await database._get_conn()
    cursor = await db.execute(
        '''SELECT aweme_id, title, author_name, download_time, file_path
           FROM aweme
           WHERE download_time IS NOT NULL
           ORDER BY download_time DESC
           LIMIT ? OFFSET ?''',
        (limit, offset)
    )
    rows = await cursor.fetchall()

    items = []
    for row in rows:
        from datetime import datetime
        download_time = datetime.fromtimestamp(row[3]).strftime('%Y-%m-%d %H:%M:%S') if row[3] else ''
        items.append({
            "aweme_id": row[0] or "",
            "title": row[1] or "",
            "author": row[2] or "",
            "download_time": download_time,
            "file_path": row[4] or "",
        })

    # 获取总数
    count_cursor = await db.execute('SELECT COUNT(*) FROM aweme WHERE download_time IS NOT NULL')
    total_row = await count_cursor.fetchone()
    total = total_row[0] if total_row else 0

    return {"items": items, "total": total}


@app.get("/api/v1/config")
async def get_config():
    """获取当前配置（敏感信息已过滤）"""
    if not config:
        raise HTTPException(status_code=503, detail="Service not initialized")

    safe_config = {
        k: v for k, v in config.config.items()
        if k not in ("cookies", "cookie")
    }
    return safe_config


@app.delete("/api/v1/download/{task_id}")
async def cancel_task(task_id: str):
    """取消任务"""
    task = task_manager.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")

    if task["status"] in ["completed", "failed"]:
        raise HTTPException(status_code=400, detail="任务已结束，无法取消")

    task_manager.update_task(task_id, status="cancelled", message="任务已取消")
    return {"message": "任务已取消"}


# ============== WebSocket 端点 ==============

@app.websocket("/ws/{task_id}")
async def websocket_endpoint(websocket: WebSocket, task_id: str):
    """WebSocket 端点，用于实时推送进度"""
    await websocket.accept()

    task = task_manager.get_task(task_id)
    if not task:
        await websocket.close(code=1008, reason="任务不存在")
        return

    task_manager.register_websocket(task_id, websocket)

    try:
        # 发送当前状态
        await websocket.send_json({
            "task_id": task_id,
            "status": task.get("status"),
            "progress": task.get("progress", 0),
            "current_file": task.get("current_file"),
            "downloaded": task.get("downloaded", 0),
            "total": task.get("total", 0),
            "message": task.get("message"),
        })

        # 保持连接并接收消息
        while True:
            data = await websocket.receive_text()
            # 可以处理客户端发送的控制消息
            if data == "ping":
                await websocket.send_text("pong")

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for task {task_id}")
    finally:
        task_manager.unregister_websocket(task_id)


# ============== 下载执行函数 ==============

async def execute_download(task_id: str, request: DownloadRequest):
    """执行下载任务"""
    task = task_manager.get_task(task_id)
    if not task:
        return

    try:
        # 更新状态为下载中
        task_manager.update_task(task_id, status="downloading", message="开始下载...")

        # 创建下载组件
        file_manager = FileManager(request.save_path or config.get('path', './Downloaded/'))
        rate_limiter = RateLimiter(max_per_second=float(config.get('rate_limit', 2) or 2))
        retry_handler = RetryHandler(max_retries=config.get('retry_times', 3))
        queue_manager = QueueManager(max_workers=int(config.get('thread', 5) or 5))

        # 更新 cookies
        cookies = cookie_manager.get_cookies()
        if not cookies:
            task_manager.update_task(
                task_id,
                status="failed",
                error="Cookies 未配置或已过期，请检查配置文件"
            )
            return

        async with DouyinAPIClient(cookies, proxy=config.get("proxy")) as api_client:
            # 解析 URL
            url = request.url

            # 处理短链
            if url.startswith('https://v.douyin.com'):
                task_manager.update_task(task_id, message="解析短链中...")
                resolved_url = await api_client.resolve_short_url(url)
                if resolved_url:
                    url = resolved_url
                else:
                    task_manager.update_task(
                        task_id,
                        status="failed",
                        error="短链解析失败"
                    )
                    return

            # 解析 URL
            parsed = URLParser.parse(url)
            if not parsed:
                task_manager.update_task(
                    task_id,
                    status="failed",
                    error=f"URL 解析失败: {url}"
                )
                return

            # 创建进度报告器
            progress_reporter = WebSocketProgressReporter(task_id)

            # 创建下载器
            downloader = DownloaderFactory.create(
                parsed['type'],
                config,
                api_client,
                file_manager,
                cookie_manager,
                database,
                rate_limiter,
                retry_handler,
                queue_manager,
                progress_reporter=progress_reporter,
            )

            if not downloader:
                task_manager.update_task(
                    task_id,
                    status="failed",
                    error=f"不支持的 URL 类型: {parsed['type']}"
                )
                return

            # 执行下载
            result = await downloader.download(parsed)

            # 更新最终状态
            if result:
                task_manager.update_task(
                    task_id,
                    status="completed",
                    progress=100.0,
                    downloaded=result.success,
                    total=result.total,
                    message=f"下载完成：成功 {result.success} / 失败 {result.failed} / 跳过 {result.skipped}",
                )
            else:
                task_manager.update_task(
                    task_id,
                    status="failed",
                    error="下载失败，未返回结果"
                )

    except Exception as e:
        logger.exception(f"Download task {task_id} failed: {e}")
        task_manager.update_task(
            task_id,
            status="failed",
            error=str(e),
        )


# ============== 主函数 ==============

def load_server_config(config_path: str = None) -> Dict[str, Any]:
    """加载服务器配置"""
    if config_path is None:
        config_path = project_root / "web_service_config.yml"

    default_config = {
        "server": {
            "host": "127.0.0.1",
            "port": 8848,
        },
    }

    if Path(config_path).exists():
        with open(config_path, "r", encoding="utf-8") as f:
            return yaml.safe_load(f) or default_config
    return default_config


def main():
    """启动 Web 服务"""
    server_config = load_server_config()
    host = server_config.get("server", {}).get("host", "127.0.0.1")
    port = server_config.get("server", {}).get("port", 8848)

    logger.info(f"Starting Douyin Downloader Web Service on {host}:{port}")
    logger.info(f"API docs available at http://{host}:{port}/docs")

    uvicorn.run(
        "server:app",
        host=host,
        port=port,
        reload=False,
        log_level="info",
    )


if __name__ == "__main__":
    main()

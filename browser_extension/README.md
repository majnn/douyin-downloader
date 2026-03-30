# 抖音下载器 - 浏览器扩展

将现有的 douyin-downloader 命令行工具改造为**浏览器插件 + 本地 Web 服务**的架构，让你在浏览抖音时可以一键下载视频。

## 功能特性

- ✅ **一键下载**：在视频页面直接点击下载按钮
- ✅ **批量下载**：用户主页作品、喜欢、收藏夹一键批量下载
- ✅ **合集下载**：支持视频合集批量下载
- ✅ **右键菜单**：右键点击链接即可下载
- ✅ **实时进度**：WebSocket 实时推送下载进度
- ✅ **下载历史**：查看下载历史记录
- ✅ **状态管理**：活动任务管理和状态追踪

## 系统架构

```
┌─────────────────────────────────────────┐
│           浏览器 (Chrome/Edge)           │
│  ┌───────────────────────────────────┐  │
│  │  浏览器扩展                        │  │
│  │  ├── Content Script (注入页面)    │  │
│  │  ├── Background (后台服务)        │  │
│  │  └── Popup (弹出界面)             │  │
│  └───────────────────────────────────┘  │
│              ↓ HTTP/WebSocket             │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│           本地电脑                        │
│  ┌───────────────────────────────────┐  │
│  │  FastAPI Web 服务 (端口 8848)    │  │
│  │  ├── REST API                     │  │
│  │  ├── WebSocket                    │  │
│  │  └── 调用现有下载逻辑             │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## 安装步骤

### 1. 安装 Python 依赖

```bash
# 创建虚拟环境（可选）
python -m venv venv

# 激活虚拟环境
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt
pip install -r web_service/requirements.txt
```

### 2. 启动本地 Web 服务

#### Windows:
```bash
start.bat
```

#### Linux/Mac:
```bash
chmod +x start.sh
./start.sh
```

服务启动后会在 `http://127.0.0.1:8848` 运行。

### 3. 安装浏览器扩展

#### Chrome/Edge:

1. 打开浏览器，访问 `chrome://extensions/` (Chrome) 或 `edge://extensions/` (Edge)
2. 启用右上角的「开发者模式」
3. 点击「加载已解压的扩展程序」
4. 选择项目中的 `browser_extension` 文件夹
5. 扩展安装完成！

## 使用方法

### 下载单个视频

1. 打开抖音视频页面
2. 页面上会自动显示「下载视频」按钮
3. 点击按钮即可开始下载

### 批量下载用户作品

1. 打开抖音用户主页
2. 页面顶部会显示批量下载按钮：
   - 📥 下载作品
   - ❤️ 下载喜欢
3. 选择对应的按钮即可批量下载

### 下载收藏夹

1. 打开个人主页 → 收藏
2. 点击「⭐ 下载收藏」按钮

### 右键菜单下载

- 右键点击任何抖音链接
- 选择「下载此视频」或「下载当前页面」

### 查看下载状态

- 点击浏览器工具栏中的扩展图标
- 查看「活动任务」和「最近下载」

## 配置说明

### 本地服务配置

编辑 `web_service/web_service_config.yml`:

```yaml
server:
  host: "127.0.0.1"
  port: 8848

download:
  default_path: "./Downloaded/"
  default_thread: 5
  max_concurrent_tasks: 3
```

### 下载器配置

编辑项目根目录的 `config.yml` 来配置：
- Cookies（必需）
- 保存路径
- 线程数
- 代理设置等

## API 文档

启动本地服务后，访问 http://127.0.0.1:8848/docs 查看完整的 API 文档。

### 主要端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/health` | GET | 健康检查 |
| `/api/v1/download` | POST | 创建下载任务 |
| `/api/v1/download/{task_id}/status` | GET | 查询任务状态 |
| `/api/v1/history` | GET | 获取下载历史 |
| `/ws/{task_id}` | WebSocket | 实时进度推送 |

## 目录结构

```
douyin-downloader/
├── web_service/              # Web 服务
│   ├── server.py            # FastAPI 主服务
│   ├── requirements.txt     # 服务依赖
│   └── web_service_config.yml  # 服务配置
│
├── browser_extension/        # 浏览器扩展
│   ├── manifest.json        # 扩展配置
│   ├── icons/               # 图标资源
│   ├── content_scripts/     # 内容脚本
│   │   ├── douyin.js        # 注入脚本
│   │   └── styles.css       # 样式
│   ├── background/          # 后台服务
│   │   └── service_worker.js
│   └── popup/               # 弹出界面
│       ├── popup.html
│       ├── popup.js
│       └── popup.css
│
├── start.bat                # Windows 启动脚本
├── start.sh                 # Linux/Mac 启动脚本
└── config.yml               # 主配置文件
```

## 常见问题

### 1. 扩展显示「服务离线」

**原因**：本地 Web 服务未启动

**解决**：
1. 运行 `start.bat` (Windows) 或 `./start.sh` (Linux/Mac)
2. 确保看到类似输出：`Uvicorn running on http://127.0.0.1:8848`

### 2. 点击下载按钮没有反应

**检查**：
1. 打开浏览器控制台 (F12) 查看错误信息
2. 确认本地服务正在运行
3. 检查 Cookies 是否配置正确

### 3. 下载失败：Cookies 相关错误

**解决**：
1. 更新 `config.yml` 中的 Cookies
2. 或者在扩展设置中重新获取 Cookies

### 4. 端口 8848 被占用

**解决**：
编辑 `web_service/web_service_config.yml`，修改端口号。

## 技术栈

- **本地服务**: FastAPI + Uvicorn + WebSocket
- **浏览器扩展**: Manifest V3 + Vanilla JavaScript
- **下载核心**: 现有的 douyin-downloader 项目

## 开发说明

### 调试扩展

1. Chrome DevTools 调试 Content Script：
   - 在抖音页面按 F12
   - Console 中查看日志

2. 调试 Background Service Worker：
   - 访问 `chrome://extensions/`
   - 点击「Service Worker」链接

3. 调试本地服务：
   - 服务启动后访问 `/docs` 查看 API 文档
   - 查看终端输出的日志

### 构建扩展（可选）

如果需要打包扩展：
1. 在 `chrome://extensions/` 点击「打包扩展」
2. 选择 `browser_extension` 文件夹
3. 生成 `.crx` 文件

## 许可证

本项目遵循原 douyin-downloader 项目的许可证。

## 贡献

欢迎提交 Issue 和 Pull Request！

## 更新日志

### v1.0.0 (2024-03-19)

- ✨ 首次发布
- ✅ 支持视频单一下载
- ✅ 支持用户作品/喜欢批量下载
- ✅ 支持收藏夹下载
- ✅ 支持合集下载
- ✅ WebSocket 实时进度推送
- ✅ 下载历史记录
- ✅ 右键菜单集成

# 抖音下载器浏览器扩展

将现有的 douyin-downloader 命令行工具改造为**浏览器插件 + 本地 Web 服务**的架构，让用户在浏览抖音时可以一键下载视频。

## 快速开始

### 1. 启动本地服务

#### Windows:
```bash
start.bat
```

#### Linux/Mac:
```bash
chmod +x start.sh
./start.sh
```

### 2. 安装浏览器扩展

1. 打开 Chrome/Edge，访问 `chrome://extensions/` 或 `edge://extensions/`
2. 启用「开发者模式」
3. 点击「加载已解压的扩展程序」
4. 选择 `browser_extension` 文件夹

### 3. 开始使用

- **下载单个视频**：在抖音视频页面点击「下载视频」按钮
- **批量下载用户作品**：在用户主页点击「📥 下载作品」
- **下载收藏**：在收藏页面点击「⭐ 下载收藏」
- **右键下载**：右键点击抖音链接选择下载

## 功能特性

| 功能 | 说明 |
|------|------|
| 单个视频下载 | 视频页面一键下载 |
| 批量下载 | 用户主页作品、喜欢、收藏夹批量下载 |
| 合集下载 | 支持视频合集批量下载 |
| 右键菜单 | 右键点击链接即可下载 |
| 实时进度 | WebSocket 实时推送下载进度 |
| 下载历史 | 查看下载历史记录 |
| 状态管理 | 活动任务管理和状态追踪 |

## 系统架构

```
浏览器扩展 (Chrome/Edge)
        ↓
   HTTP/WebSocket
        ↓
本地 Web 服务 (FastAPI:8848)
        ↓
现有下载核心 (douyin-downloader)
```

## 文档

详细文档请查看 [browser_extension/README.md](browser_extension/README.md)

## 项目结构

```
douyin-downloader/
├── web_service/              # Web 服务
│   ├── server.py            # FastAPI 主服务
│   ├── requirements.txt     # 服务依赖
│   └── web_service_config.yml  # 服务配置
│
├── browser_extension/        # 浏览器扩展
│   ├── manifest.json        # 扩展配置
│   ├── content_scripts/     # 内容脚本
│   ├── background/          # 后台服务
│   └── popup/               # 弹出界面
│
├── start.bat                # Windows 启动脚本
└── start.sh                 # Linux/Mac 启动脚本
```

## 配置

### 本地服务配置

编辑 `web_service/web_service_config.yml`:

```yaml
server:
  host: "127.0.0.1"
  port: 8848
```

### 下载器配置

编辑 `config.yml` 配置 Cookies、保存路径等。

## API 文档

启动服务后访问 http://127.0.0.1:8848/docs

## 常见问题

### 服务离线
确保本地服务已启动：运行 `start.bat` 或 `start.sh`

### 下载失败
1. 检查 `config.yml` 中的 Cookies 是否有效
2. 查看浏览器控制台 (F12) 的错误信息

## 技术栈

- **本地服务**: FastAPI + Uvicorn + WebSocket
- **浏览器扩展**: Manifest V3 + Vanilla JavaScript

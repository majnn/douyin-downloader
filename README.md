# 🎬 抖音下载器

一个功能强大的抖音视频下载工具，支持单个视频下载、批量下载用户作品、收藏夹下载等功能。采用 **浏览器扩展 + 本地Web服务** 的架构，提供一键下载的便捷体验。

![GitHub Repo stars](https://img.shields.io/github/stars/majnn/douyin-downloader)
![GitHub forks](https://img.shields.io/github/forks/majnn/douyin-downloader)
![GitHub issues](https://img.shields.io/github/issues/majnn/douyin-downloader)
![GitHub license](https://img.shields.io/github/license/majnn/douyin-downloader)

## ✨ 功能特性

### 核心功能

| 功能 | 说明 |
|------|------|
| 🎥 **单个视频下载** | 在抖音视频页面点击「下载视频」按钮一键下载 |
| 📦 **批量下载** | 用户主页作品、喜欢、收藏夹批量下载 |
| 📚 **合集下载** | 支持视频合集批量下载 |
| 🖱️ **右键菜单** | 右键点击抖音链接即可下载 |
| 📊 **实时进度** | WebSocket 实时推送下载进度 |
| 📝 **下载历史** | 查看下载历史记录 |
| ⚙️ **状态管理** | 活动任务管理和状态追踪 |

### 技术亮点

- 🚀 **高性能**：基于 FastAPI 的异步 Web 服务
- 🔌 **易于使用**：浏览器扩展一键安装，即装即用
- 📡 **实时通信**：WebSocket 支持实时进度更新
- 🛡️ **安全可靠**：本地服务运行，数据不泄露
- 🎨 **现代界面**：简洁优雅的用户界面

## 📋 系统要求

### 运行环境

- **操作系统**: Windows / Linux / macOS
- **Python 版本**: Python 3.8 或更高版本
- **浏览器**: Chrome / Edge (支持 Manifest V3 扩展)

### 依赖库

主要依赖在 `requirements.txt` 和 `web_service/requirements.txt` 中定义：

```
fastapi
uvicorn
websockets
pyyaml
```

## 📥 下载安装

### 方式一：从 GitHub Releases 下载 ⭐ 推荐

**[🚀 下载最新版本](https://github.com/majnn/douyin-downloader/releases/latest)**

#### 下载选项：

| 文件 | 说明 | 推荐度 |
|------|------|--------|
| **douyin-downloader.zip** | 完整项目包，包含所有文件，开箱即用 | ⭐⭐⭐⭐⭐ |
| **browser-extension.zip** | 仅浏览器扩展，适合已有Web服务的用户 | ⭐⭐⭐ |

**详细安装说明**: 查看 [INSTALL.md](INSTALL.md) 获取完整的图文安装指南。

### 方式二：从源代码安装

```bash
git clone https://github.com/majnn/douyin-downloader.git
cd douyin-downloader
```

然后按照下面的"快速开始"章节进行操作。

## 🚀 快速开始

### 方式一：使用启动脚本（推荐）

#### Windows 系统

```bash
start.bat
```

#### Linux/macOS 系统

```bash
chmod +x start.sh
./start.sh
```

启动脚本会自动：
1. 检查 Python 环境
2. 创建虚拟环境（如不存在）
3. 安装所需依赖
4. 启动 Web 服务

### 方式二：手动安装

1. **克隆项目**

```bash
git clone https://github.com/majnn/douyin-downloader.git
cd douyin-downloader
```

2. **创建虚拟环境**

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/macOS
source venv/bin/activate
```

3. **安装依赖**

```bash
pip install -r requirements.txt
pip install -r web_service/requirements.txt
```

4. **启动服务**

```bash
python web_service/server.py
```

服务启动后：
- Web 服务地址: **http://127.0.0.1:8848**
- API 文档: **http://127.0.0.1:8848/docs**

## 🔧 安装浏览器扩展

### Chrome/Edge 浏览器

1. 打开浏览器扩展管理页面
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`

2. 启用「**开发者模式**」（右上角开关）

3. 点击「**加载已解压的扩展程序**」

4. 选择项目中的 `browser_extension` 文件夹

5. 扩展安装完成！

### 验证安装

访问 [抖音](https://www.douyin.com)，在视频页面应该能看到「**下载视频**」按钮。

## 📖 使用指南

### 下载单个视频

1. 打开任意抖音视频页面
2. 点击页面上的「**下载视频**」按钮
3. 等待下载完成，视频会保存到 `Downloaded` 目录

### 批量下载用户作品

1. 访问用户主页
2. 点击「**📥 下载作品**」按钮
3. 选择要下载的内容类型：
   - 全部作品
   - 喜欢的视频
   - 收藏夹
   - 合集

### 右键菜单下载

1. 复制抖音视频链接
2. 在页面任意位置右键点击
3. 选择「**下载抖音视频**」

### 查看下载历史

点击扩展图标，可以查看：
- 当前下载任务
- 下载历史记录
- 下载进度和状态

## ⚙️ 配置说明

### Web 服务配置

编辑 `web_service/web_service_config.yml`：

```yaml
server:
  host: "127.0.0.1"  # 服务监听地址
  port: 8848         # 服务端口

download:
  save_path: "Downloaded"  # 视频保存目录
  max_concurrent: 3        # 最大并发下载数
```

### 下载器配置

编辑 `config.yml` 配置 Cookies 和其他选项：

```yaml
cookies:
  # 你的抖音 Cookies，用于获取视频信息

headers:
  User-Agent: "Mozilla/5.0..."
```

#### 如何获取 Cookies

1. 打开抖音网页版 (https://www.douyin.com)
2. 登录你的账号
3. 按 F12 打开开发者工具
4. 切换到 **Network** 标签
5. 刷新页面，找到任意请求
6. 复制请求头中的 `Cookie` 值

## 📚 API 文档

### 主要 API 端点

启动服务后访问 **http://127.0.0.1:8848/docs** 查看完整 API 文档（Swagger UI）。

#### 1. 下载单个视频

```http
POST /api/download
Content-Type: application/json

{
  "url": "https://www.douyin.com/video/..."
}
```

#### 2. 批量下载

```http
POST /api/batch-download
Content-Type: application/json

{
  "user_id": "...",
  "type": "posts"  # posts / likes / favorites
}
```

#### 3. WebSocket 进度推送

```javascript
const ws = new WebSocket('ws://127.0.0.1:8848/ws/download');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('进度:', data.progress);
};
```

## 🏗️ 项目结构

```
douyin-downloader/
├── browser_extension/          # 浏览器扩展
│   ├── manifest.json          # 扩展配置清单
│   ├── popup/                 # 弹出界面
│   │   ├── popup.html
│   │   ├── popup.css
│   │   └── popup.js
│   ├── content_scripts/       # 内容脚本
│   │   ├── douyin.js
│   │   └── styles.css
│   ├── background/            # 后台服务
│   │   └── service_worker.js
│   ├── icons/                 # 扩展图标
│   ├── README.md              # 扩展详细文档
│   └── IMPLEMENTATION_SUMMARY.md
│
├── web_service/               # Web 服务
│   ├── server.py             # FastAPI 主服务
│   ├── requirements.txt      # 服务依赖
│   └── web_service_config.yml # 服务配置
│
├── douyin-downloader/        # 核心下载模块
│
├── Downloaded/               # 下载文件保存目录（.gitignore）
├── start.bat                # Windows 启动脚本
├── start.sh                 # Linux/macOS 启动脚本
├── .gitignore               # Git 忽略文件
└── README.md                # 本文档
```

## 🔍 常见问题

### 1. 服务无法启动

**问题**: 运行启动脚本后服务没有启动

**解决方案**:
- 检查 Python 版本是否为 3.8+
- 确保端口 8848 未被占用
- 查看错误日志，检查依赖是否正确安装

### 2. 浏览器扩展显示"服务离线"

**问题**: 扩展图标显示离线状态

**解决方案**:
- 确保本地 Web 服务已启动
- 访问 http://127.0.0.1:8848 测试服务是否可访问
- 检查防火墙设置

### 3. 下载失败

**问题**: 点击下载按钮后没有反应或下载失败

**解决方案**:
1. 检查 `config.yml` 中的 Cookies 是否有效
2. 打开浏览器控制台 (F12) 查看错误信息
3. 确认网络连接正常
4. 尝试重新获取 Cookies

### 4. 视频保存位置

**问题**: 下载的视频保存在哪里？

**解决方案**:
- 默认保存在项目目录的 `Downloaded` 文件夹
- 可以在配置文件中修改保存路径

### 5. 合集下载功能不可用

**问题**: 无法下载合集视频

**解决方案**:
- 确保抖音账号已登录
- 检查是否有访问该合集的权限
- 部分私密合集可能无法下载

## 🛠️ 技术栈

### 后端

- **FastAPI**: 现代化的 Python Web 框架
- **Uvicorn**: ASGI 服务器
- **WebSocket**: 实时双向通信

### 前端

- **Manifest V3**: 浏览器扩展标准
- **Vanilla JavaScript**: 原生 JavaScript，无框架依赖
- **CSS3**: 现代样式设计

### 下载核心

- **Python 3.8+**: 核心下载逻辑
- **Requests**: HTTP 请求库
- **PyYAML**: 配置文件解析

## 🤝 贡献指南

欢迎贡献代码、报告 Bug 或提出新功能建议！

### 如何贡献

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 开发建议

- 保持代码简洁清晰
- 添加适当的注释
- 遵循现有代码风格
- 测试新功能是否正常工作

## 📦 版本发布（维护者）

### 发布新版本

1. **打包项目**
   ```bash
   # Windows
   build.bat

   # Linux/Mac
   chmod +x build.sh
   ./build.sh
   ```

2. **创建 GitHub Release**
   ```bash
   # Windows
   release.bat

   # Linux/Mac
   ./release.sh
   ```

3. **发布说明会自动生成**，包含下载说明和功能介绍

### 依赖要求

- 安装 [GitHub CLI](https://cli.github.com/)
- 运行 `gh auth login` 完成认证

## 📝 更新日志

### v1.0.0 (2025-03-30)

- ✨ 初始版本发布
- ✅ 支持单个视频下载
- ✅ 支持批量下载用户作品
- ✅ 支持收藏夹和合集下载
- ✅ 浏览器扩展集成
- ✅ WebSocket 实时进度推送
- ✅ 下载历史记录功能

## 📄 许可证

本项目采用 **MIT 许可证** - 查看 [LICENSE](LICENSE) 文件了解详情。

## ⚠️ 免责声明

本工具仅供学习交流使用，请勿用于商业用途。使用本工具下载的内容请遵守抖音的服务条款和版权法律。作者不对使用本工具造成的任何后果负责。

## 📮 联系方式

- **GitHub**: [majnn](https://github.com/majnn)
- **Issues**: [GitHub Issues](https://github.com/majnn/douyin-downloader/issues)

## 🌟 Star History

如果这个项目对你有帮助，请给个 ⭐ Star 支持一下！

---

<div align="center">
  <sub>用 ❤️ 制作</sub>
</div>

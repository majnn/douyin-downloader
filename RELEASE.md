# 📤 如何创建 GitHub Release

## 方法一：使用 GitHub CLI（推荐）

如果已安装 GitHub CLI (gh)，运行：

```bash
# Windows
release.bat

# Linux/Mac
./release.sh
```

## 方法二：手动创建 Release

### 步骤 1: 打包文件

```bash
# Windows
build.bat

# Linux/Mac
chmod +x build.sh
./build.sh
```

打包完成后，`build/` 目录会包含：
- `browser-extension.zip` - 浏览器扩展包
- `douyin-downloader.zip` - 完整项目包
- `version.txt` - 版本信息

### 步骤 2: 在 GitHub 上创建 Release

1. 访问 GitHub 仓库的 Releases 页面：
   https://github.com/majnn/douyin-downloader/releases

2. 点击 "Draft a new release"

3. 填写 Release 信息：
   - **Tag**: 输入版本号，例如 `2026.03.30`
   - **Title**: `抖音下载器 v2026.03.30`
   - **Description**: 复制下面的Release说明

### 步骤 3: 上传文件

在 "Binary release" 部分，点击 "Attach binaries" 并选择：
- `build/browser-extension.zip`
- `build/douyin-downloader.zip`

### 步骤 4: 发布 Release

点击 "Publish release" 按钮

---

## Release 说明模板

复制以下内容到 Release Description：

```markdown
# 抖音下载器 vVERSION

## 📦 下载说明

### 方式一：浏览器扩展包（推荐快速使用）

1. 下载 `browser-extension.zip`
2. 解压到任意目录
3. 打开 Chrome/Edge 的扩展管理页面
4. 启用「开发者模式」
5. 点击「加载已解压的扩展程序」
6. 选择解压后的 `browser_extension` 文件夹

**注意**: 使用浏览器扩展仍需要启动本地Web服务。

### 方式二：完整项目包（推荐完整部署）⭐

1. 下载 `douyin-downloader.zip`
2. 解压到任意目录
3. 根据系统运行启动脚本：
   - Windows: `start.bat`
   - Linux/Mac: `chmod +x start.sh && ./start.sh`
4. 安装浏览器扩展（同方式一）
5. 开始使用！

## 📋 系统要求

- Python 3.8+
- Chrome 或 Edge 浏览器
- Windows / Linux / macOS

## ✨ 主要功能

- 单个视频一键下载
- 批量下载用户作品
- 收藏夹和合集下载
- 实时下载进度显示
- 浏览器扩展集成

## 📖 完整文档

查看 [README.md](https://github.com/majnn/douyin-downloader/blob/main/README.md) 了解详细使用说明。

查看 [INSTALL.md](https://github.com/majnn/douyin-downloader/blob/main/INSTALL.md) 获取详细安装指南。

## ⚠️ 注意事项

- 本工具仅供学习交流使用
- 请遵守抖音服务条款和版权法律
- 下载的内容请勿用于商业用途

## 🐛 问题反馈

如遇到问题，请在 [Issues](https://github.com/majnn/douyin-downloader/issues) 中反馈。
```

---

## 安装 GitHub CLI（可选）

如需使用自动化脚本，请安装 GitHub CLI：

### Windows
```bash
winget install --id GitHub.cli
```

### Linux
```bash
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh
```

### macOS
```bash
brew install gh
```

安装后运行：`gh auth login`

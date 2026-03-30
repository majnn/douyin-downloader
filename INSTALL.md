# 📥 下载和使用指南

## 🚀 快速开始

### 方式一：从 GitHub Releases 下载（推荐）

1. **访问 Releases 页面**
   - 打开：https://github.com/majnn/douyin-downloader/releases
   - 下载最新版本的文件

2. **选择下载内容**

   **浏览器扩展包** (`browser-extension.zip`)
   - 体积小，下载快
   - 仅包含浏览器扩展文件
   - 适合已有Web服务环境的用户

   **完整项目包** (`douyin-downloader.zip`) ⭐ 推荐
   - 包含所有文件
   - 开箱即用，无需额外配置
   - 适合首次使用的用户

### 方式二：从源代码安装

```bash
# 克隆仓库
git clone https://github.com/majnn/douyin-downloader.git
cd douyin-downloader

# 启动服务
# Windows
start.bat

# Linux/Mac
chmod +x start.sh
./start.sh
```

## 📋 安装步骤

### 步骤 1: 解压下载的文件

将下载的 zip 文件解压到任意目录，例如：
- Windows: `C:\douyin-downloader`
- Linux/Mac: `~/douyin-downloader`

### 步骤 2: 启动本地服务

#### Windows 系统

双击运行 `start.bat` 文件，或在命令行中：

```cmd
cd C:\douyin-downloader
start.bat
```

#### Linux/macOS 系统

```bash
cd ~/douyin-downloader
chmod +x start.sh
./start.sh
```

启动脚本会自动：
- ✅ 检查 Python 环境
- ✅ 创建虚拟环境
- ✅ 安装所需依赖
- ✅ 启动 Web 服务（端口 8848）

**看到以下信息表示启动成功：**
```
[提示] 服务地址: http://127.0.0.1:8848
[提示] API 文档: http://127.0.0.1:8848/docs
```

### 步骤 3: 安装浏览器扩展

1. **打开浏览器扩展管理页面**
   - Chrome: 地址栏输入 `chrome://extensions/`
   - Edge: 地址栏输入 `edge://extensions/`

2. **启用开发者模式**
   - 在页面右上角找到「开发者模式」开关
   - 打开开关

3. **加载扩展**
   - 点击「加载已解压的扩展程序」按钮
   - 选择项目中的 `browser_extension` 文件夹
   - 点击「选择文件夹」

4. **验证安装**
   - 扩展列表中会出现「抖音下载器」
   - 浏览器工具栏会出现扩展图标

### 步骤 4: 配置 Cookies（重要）

**为什么需要配置 Cookies？**

抖音需要登录状态才能获取视频信息。配置 Cookies 后，下载器可以模拟你的登录状态。

**获取 Cookies 方法：**

1. 打开抖音网页版：https://www.douyin.com
2. 登录你的抖音账号
3. 按 `F12` 打开开发者工具
4. 切换到 `Network`（网络）标签
5. 刷新页面
6. 点击任意请求
7. 在请求头中找到 `Cookie` 字段
8. 复制完整的 Cookie 值

**配置 Cookies：**

在项目根目录创建或编辑 `config.yml` 文件：

```yaml
cookies:
  # 粘贴你复制的 Cookie
  your_cookie_here

headers:
  User-Agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
```

## 🎯 使用方法

### 下载单个视频

1. 打开抖音网站，找到想下载的视频
2. 在视频页面点击「**下载视频**」按钮
3. 等待下载完成
4. 视频保存在 `Downloaded` 文件夹

### 批量下载

**下载用户所有作品：**
1. 访问用户主页
2. 点击「**📥 下载作品**」按钮
3. 选择「全部作品」
4. 等待批量下载完成

**下载收藏的视频：**
1. 访问用户主页
2. 点击「喜欢」或「收藏」标签
3. 点击「**⭐ 下载收藏**」按钮

**下载合集：**
1. 打开视频合集页面
2. 点击「**📚 下载合集**」按钮

### 右键菜单下载

1. 复制抖音视频链接
2. 在网页任意位置右键点击
3. 选择「**下载抖音视频**」

### 查看下载历史

1. 点击浏览器工具栏的扩展图标
2. 查看「下载历史」标签
3. 可以看到所有下载记录和状态

## 🔧 验证服务状态

### 检查 Web 服务

访问：http://127.0.0.1:8848

如果看到服务信息，说明 Web 服务运行正常。

### 检查扩展状态

1. 点击浏览器扩展图标
2. 如果显示「**在线**」绿色状态，说明连接正常
3. 如果显示「**离线**」红色状态，请检查：
   - Web 服务是否已启动
   - 端口 8848 是否被占用
   - 防火墙是否阻止了连接

## ❓ 常见问题

### Q: 双击 start.bat 后闪退

**A:** 可能是 Python 未安装或版本过低

1. 检查 Python 版本：`python --version`
2. 确保 Python 版本 >= 3.8
3. 如果没有安装，访问 https://www.python.org/downloads/

### Q: 浏览器扩展显示"服务离线"

**A:** Web 服务未启动或连接失败

1. 检查是否已运行 `start.bat` 或 `start.sh`
2. 查看启动脚本的控制台输出
3. 确认没有报错信息
4. 尝试访问 http://127.0.0.1:8848 测试服务

### Q: 下载失败或提示 Cookies 无效

**A:** Cookie 过期或格式错误

1. 重新获取 Cookies（参考上面的步骤）
2. 确保 Cookie 完整复制，不要遗漏
3. Cookie 通常会过期，需要定期更新
4. 尝试重新登录抖音后再获取

### Q: 下载的视频保存在哪里？

**A:** 默认保存在项目目录的 `Downloaded` 文件夹

- 可以在配置文件中修改保存路径
- 每个视频都会创建独立的文件夹
- 文件名包含视频标题和日期

### Q: 可以下载其他用户的视频吗？

**A:** 可以，但有限制

- 公开视频：可以下载
- 私密视频：需要登录且有访问权限
- 部分版权保护视频可能无法下载

## 📚 更多帮助

- **完整文档**: 查看 [README.md](README.md)
- **问题反馈**: [GitHub Issues](https://github.com/majnn/douyin-downloader/issues)
- **更新日志**: 查看 Releases 页面

## ⚠️ 重要提示

1. **仅供学习使用**: 本工具仅用于个人学习和研究
2. **遵守法律**: 请遵守版权法律和服务条款
3. **禁止商用**: 不得用于商业用途
4. **尊重版权**: 下载的内容请勿传播或用于盈利

## 🎉 开始使用

现在你已经完成了所有配置，可以开始使用了！

访问 https://www.douyin.com，找到你想下载的视频，点击「下载视频」按钮即可。

---

如有任何问题，欢迎在 GitHub Issues 中反馈！

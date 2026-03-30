# 抖音下载器浏览器扩展 - 快速开始指南

## 安装前准备

1. 确保已安装 Python 3.8 或更高版本
2. 确保已有有效的抖音 Cookies（在 `config.yml` 中配置）

## 安装步骤

### 步骤 1: 生成图标（可选）

如果需要自定义图标，可以运行图标生成脚本：

```bash
cd browser_extension/icons
python generate_icons.py
```

或者使用已有的 SVG 图标，Chrome 会自动使用。

### 步骤 2: 安装 Python 依赖

```bash
# 创建虚拟环境（推荐）
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

### 步骤 3: 启动本地服务

#### Windows:
双击运行 `start.bat` 或在命令行中执行：
```bash
start.bat
```

#### Linux/Mac:
```bash
chmod +x start.sh
./start.sh
```

看到以下输出表示启动成功：
```
INFO:     Started server process
INFO:     Uvicorn running on http://127.0.0.1:8848
```

### 步骤 4: 安装浏览器扩展

#### Chrome / Edge:

1. 打开扩展管理页面：
   - Chrome: 地址栏输入 `chrome://extensions/`
   - Edge: 地址栏输入 `edge://extensions/`

2. 启用「开发者模式」：
   - 右上角打开开关

3. 加载扩展：
   - 点击「加载已解压的扩展程序」
   - 选择项目中的 `browser_extension` 文件夹
   - 点击「选择文件夹」

4. 确认安装：
   - 扩展列表中会出现「抖音视频下载器」
   - 浏览器工具栏会显示扩展图标

## 使用方法

### 下载单个视频

1. 访问抖音视频页面，如：https://www.douyin.com/video/123456789
2. 页面上会显示红色的「下载视频」按钮
3. 点击按钮开始下载
4. 点击扩展图标查看下载进度

### 批量下载用户作品

1. 访问抖音用户主页
2. 页面顶部会显示批量下载按钮：
   - **📥 下载作品**：下载用户发布的所有视频
   - **❤️ 下载喜欢**：下载用户喜欢的视频
3. 点击对应按钮开始批量下载

### 下载收藏夹

1. 访问个人主页 → 收藏
2. 点击「⭐ 下载收藏」按钮

### 右键菜单下载

在任何抖音页面上：
1. 右键点击视频链接
2. 选择「下载此视频」

### 查看 Popup 面板

点击浏览器工具栏中的扩展图标，可以：
- 快速下载（粘贴链接）
- 查看活动任务
- 查看下载历史
- 检查服务状态

## 验证安装

### 1. 检查本地服务

访问 http://127.0.0.1:8848/api/health

应该返回：
```json
{"status": "ok", "service": "douyin-downloader"}
```

### 2. 检查扩展状态

点击扩展图标，查看右上角状态指示器：
- 🟢 绿色 = 服务在线
- 🔴 红色 = 服务离线

### 3. 测试下载

1. 打开任意抖音视频页面
2. 检查是否显示下载按钮
3. 点击下载按钮测试

## 常见问题

### Q: 扩展显示「服务离线」？

**A:** 本地服务未启动。请运行 `start.bat` (Windows) 或 `./start.sh` (Linux/Mac)。

### Q: 点击下载按钮没反应？

**A:** 请检查：
1. 本地服务是否正在运行
2. 浏览器控制台 (F12) 是否有错误信息
3. `config.yml` 中的 Cookies 是否有效

### Q: 下载失败，提示 Cookies 错误？

**A:** 需要更新 `config.yml` 中的 Cookies：
1. 打开浏览器开发者工具 (F12)
2. 访问 douyin.com
3. 在 Application -> Cookies 中复制相关 Cookie
4. 更新到 `config.yml` 中

### Q: 端口 8848 被占用？

**A:** 编辑 `web_service/web_service_config.yml`，修改端口号。

## 卸载

### 卸载扩展

1. 访问 `chrome://extensions/`
2. 找到「抖音视频下载器」
3. 点击「移除」

### 停止服务

在运行服务的命令行窗口按 `Ctrl+C`

## 下一步

- 查看 [README.md](README.md) 了解详细功能
- 访问 http://127.0.0.1:8848/docs 查看 API 文档
- 根据需要调整 `config.yml` 配置

@echo off
chcp 65001 >nul
echo ========================================
echo 发布到 GitHub Releases
echo ========================================
echo.

REM 检查是否已安装gh CLI
where gh >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到 GitHub CLI (gh)
    echo 请安装: https://cli.github.com/
    pause
    exit /b 1
)

REM 生成版本号
set VERSION=%date:~0,4%.%date:~5,2%.%date:~8,2%
echo [信息] 版本: %VERSION%

REM 创建Release说明文件
set NOTES_FILE=release-notes.md
(
echo # 抖音下载器 v%VERSION%
echo.
echo ## 📦 下载说明
echo.
echo ### 方式一：浏览器扩展包（推荐快速使用）
echo.
echo 1. 下载 `browser-extension.zip`
echo 2. 解压到任意目录
echo 3. 打开 Chrome/Edge 的扩展管理页面
echo 4. 启用「开发者模式」
echo 5. 点击「加载已解压的扩展程序」
echo 6. 选择解压后的 `browser_extension` 文件夹
echo.
echo **注意**: 使用浏览器扩展仍需要启动本地Web服务。
echo.
echo ### 方式二：完整项目包（推荐完整部署）
echo.
echo 1. 下载 `douyin-downloader.zip`
echo 2. 解压到任意目录
echo 3. 根据系统运行启动脚本：
echo    - Windows: `start.bat`
echo    - Linux/Mac: `chmod +x start.sh ^&^& ./start.sh`
echo 4. 安装浏览器扩展（同方式一）
echo 5. 开始使用！
echo.
echo ## 📋 系统要求
echo.
echo - Python 3.8+
echo - Chrome 或 Edge 浏览器
echo - Windows / Linux / macOS
echo.
echo ## ✨ 主要功能
echo.
echo - 单个视频一键下载
echo - 批量下载用户作品
echo - 收藏夹和合集下载
echo - 实时下载进度显示
echo - 浏览器扩展集成
echo.
echo ## 📖 完整文档
echo.
echo 查看 [README.md](https://github.com/majnn/douyin-downloader/blob/main/README.md) 了解详细使用说明。
echo.
echo ## ⚠️ 注意事项
echo.
echo - 本工具仅供学习交流使用
echo - 请遵守抖音服务条款和版权法律
echo - 下载的内容请勿用于商业用途
echo.
echo ## 🐛 问题反馈
echo.
echo 如遇到问题，请在 [Issues](https://github.com/majnn/douyin-downloader/issues) 中反馈。
) > "%NOTES_FILE%"

REM 创建Release
echo [信息] 正在创建 Release...

gh release create "%VERSION%" ^
    build/browser-extension.zip ^
    build/douyin-downloader.zip ^
    --notes-file "%NOTES_FILE%" ^
    --title "抖音下载器 v%VERSION%"

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✓ 发布成功！
    echo ========================================
    echo.
    echo Release 地址: https://github.com/majnn/douyin-downloader/releases/tag/%VERSION%
    echo.
    del "%NOTES_FILE%"
) else (
    echo.
    echo [错误] 发布失败
    del "%NOTES_FILE%"
    pause
    exit /b 1
)

pause

@echo off
chcp 65001 >nul
echo ========================================
echo 抖音下载器 - 打包脚本
echo ========================================
echo.

REM 创建临时目录
set BUILD_DIR=build
if exist %BUILD_DIR% rmdir /s /q %BUILD_DIR%
mkdir %BUILD_DIR%

echo [1/3] 打包浏览器扩展...
powershell -Command "Compress-Archive -Path browser_extension\* -DestinationPath %BUILD_DIR%\browser-extension.zip -Force"
echo ✓ 浏览器扩展打包完成: browser-extension.zip

echo.
echo [2/3] 打包完整项目...
powershell -Command "$exclude = @('build\*','venv\*','__pycache__\*','*.pyc','.git\*','.DS_Store','Downloaded\*','*.db','.cookies.json','.claude\*'); Get-ChildItem -Recurse | Where-Object { $file = $_.FullName.Replace((Get-Location).Path + '\', ''); -not ($exclude | Where-Object { $file -like ($_ -replace '\*', '') }) } | Compress-Archive -DestinationPath %BUILD_DIR%\douyin-downloader.zip -Force"
echo ✓ 完整项目打包完成: douyin-downloader.zip

echo.
echo [3/3] 生成版本信息...
set VERSION=%date:~0,4%.%date:~5,2%.%date:~8,2%
echo 版本: %VERSION% > %BUILD_DIR%\version.txt
echo 构建时间: %date% %time% >> %BUILD_DIR%\version.txt
for /f "delims=" %%i in ('git rev-parse --short HEAD') do echo Git提交: %%i >> %BUILD_DIR%\version.txt
echo ✓ 版本信息已生成

echo.
echo ========================================
echo 打包完成！
echo ========================================
echo.
echo 生成的文件:
dir /b %BUILD_DIR%
echo.
echo 提示: 运行 release.bat 发布到GitHub Releases
pause

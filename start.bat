@echo off
chcp 65001 > nul
echo ========================================
echo 抖音下载器 Web 服务启动脚本
echo ========================================
echo.

REM 检查 Python 是否安装
python --version > nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Python，请先安装 Python 3.8+
    pause
    exit /b 1
)

REM 进入项目目录
cd /d "%~dp0"

REM 检查虚拟环境
if not exist "venv" (
    echo [提示] 未找到虚拟环境，正在创建...
    python -m venv venv
    if errorlevel 1 (
        echo [错误] 创建虚拟环境失败
        pause
        exit /b 1
    )
)

REM 激活虚拟环境
call venv\Scripts\activate.bat

REM 安装/更新依赖
echo [提示] 检查依赖...
pip install -q -r requirements.txt
pip install -q -r web_service/requirements.txt

REM 启动 Web 服务
echo.
echo [提示] 正在启动 Web 服务...
echo [提示] 服务地址: http://127.0.0.1:8848
echo [提示] API 文档: http://127.0.0.1:8848/docs
echo.
echo [提示] 请确保浏览器扩展已正确安装
echo [提示] 按 Ctrl+C 停止服务
echo.

python web_service/server.py

pause

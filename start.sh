#!/bin/bash

echo "========================================"
echo "抖音下载器 Web 服务启动脚本"
echo "========================================"
echo ""

# 检查 Python
if ! command -v python3 &> /dev/null; then
    echo "[错误] 未检测到 Python3，请先安装 Python 3.8+"
    exit 1
fi

# 进入项目目录
cd "$(dirname "$0")"

# 检查虚拟环境
if [ ! -d "venv" ]; then
    echo "[提示] 未找到虚拟环境，正在创建..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "[错误] 创建虚拟环境失败"
        exit 1
    fi
fi

# 激活虚拟环境
source venv/bin/activate

# 安装/更新依赖
echo "[提示] 检查依赖..."
pip install -q -r requirements.txt
pip install -q -r web_service/requirements.txt

# 启动 Web 服务
echo ""
echo "[提示] 正在启动 Web 服务..."
echo "[提示] 服务地址: http://127.0.0.1:8848"
echo "[提示] API 文档: http://127.0.0.1:8848/docs"
echo ""
echo "[提示] 请确保浏览器扩展已正确安装"
echo "[提示] 按 Ctrl+C 停止服务"
echo ""

python web_service/server.py

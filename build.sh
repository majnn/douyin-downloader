#!/bin/bash

echo "========================================"
echo "抖音下载器 - 打包脚本"
echo "========================================"
echo ""

# 创建临时目录
BUILD_DIR="build"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

echo "[1/3] 打包浏览器扩展..."
cd browser_extension
zip -r ../"$BUILD_DIR"/browser-extension.zip . -x "*.pyc" "__pycache__/*" ".DS_Store"
cd ..
echo "✓ 浏览器扩展打包完成: browser-extension.zip"

echo ""
echo "[2/3] 打包完整项目..."
# 排除不必要的文件
zip -r "$BUILD_DIR"/douyin-downloader.zip . \
    -x "build/*" \
    -x "venv/*" \
    -x "__pycache__/*" \
    -x "*.pyc" \
    -x ".git/*" \
    -x ".DS_Store" \
    -x "Downloaded/*" \
    -x "*.db" \
    -x ".cookies.json" \
    -x ".claude/*"
echo "✓ 完整项目打包完成: douyin-downloader.zip"

echo ""
echo "[3/3] 生成版本信息..."
VERSION=$(date +%Y.%m.%d)
echo "版本: $VERSION" > "$BUILD_DIR/version.txt"
echo "构建时间: $(date)" >> "$BUILD_DIR/version.txt"
echo "Git提交: $(git rev-parse --short HEAD)" >> "$BUILD_DIR/version.txt"
echo "✓ 版本信息已生成"

echo ""
echo "========================================"
echo "打包完成！"
echo "========================================"
echo ""
echo "生成的文件:"
ls -lh "$BUILD_DIR"
echo ""
echo "提示: 运行 ./release.sh 发布到GitHub Releases"

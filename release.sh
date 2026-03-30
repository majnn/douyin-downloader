#!/bin/bash

echo "========================================"
echo "发布到 GitHub Releases"
echo "========================================"
echo ""

# 检查是否已安装gh CLI
if ! command -v gh &> /dev/null; then
    echo "[错误] 未找到 GitHub CLI (gh)"
    echo "请安装: https://cli.github.com/"
    exit 1
fi

# 检查是否已登录
if ! gh auth status &> /dev/null; then
    echo "[错误] 未登录 GitHub"
    echo "请运行: gh auth login"
    exit 1
fi

# 生成版本号
VERSION=$(date +%Y.%m.%d)
echo "[信息] 版本: $VERSION"

# 检查是否已存在release
if gh release view "$VERSION" &> /dev/null; then
    echo "[警告] Release $VERSION 已存在"
    read -p "是否删除现有release并重新创建？(y/N): " confirm
    if [[ $confirm == [yY] ]]; then
        gh release delete "$VERSION" --yes
        echo "[信息] 已删除现有release"
    else
        echo "[信息] 取消发布"
        exit 0
    fi
fi

# 生成Release说明
NOTES_FILE="release-notes.md"
cat > "$NOTES_FILE" << EOF
# 抖音下载器 v$VERSION

## 📦 下载说明

### 方式一：浏览器扩展包（推荐快速使用）

1. 下载 \`browser-extension.zip\`
2. 解压到任意目录
3. 打开 Chrome/Edge 的扩展管理页面
4. 启用「开发者模式」
5. 点击「加载已解压的扩展程序」
6. 选择解压后的 \`browser_extension\` 文件夹

**注意**: 使用浏览器扩展仍需要启动本地Web服务。

### 方式二：完整项目包（推荐完整部署）

1. 下载 \`douyin-downloader.zip\`
2. 解压到任意目录
3. 根据系统运行启动脚本：
   - Windows: \`start.bat\`
   - Linux/Mac: \`chmod +x start.sh && ./start.sh\`
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

## ⚠️ 注意事项

- 本工具仅供学习交流使用
- 请遵守抖音服务条款和版权法律
- 下载的内容请勿用于商业用途

## 🐛 问题反馈

如遇到问题，请在 [Issues](https://github.com/majnn/douyin-downloader/issues) 中反馈。
EOF

# 创建Release
echo "[信息] 正在创建 Release..."

gh release create "$VERSION" \
    build/browser-extension.zip \
    build/douyin-downloader.zip \
    --notes-file "$NOTES_FILE" \
    --title "抖音下载器 v$VERSION" \
    --discussion-category "Announcements"

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "✓ 发布成功！"
    echo "========================================"
    echo ""
    echo "Release 地址: https://github.com/majnn/douyin-downloader/releases/tag/$VERSION"
    echo ""
    rm -f "$NOTES_FILE"
else
    echo ""
    echo "[错误] 发布失败"
    rm -f "$NOTES_FILE"
    exit 1
fi

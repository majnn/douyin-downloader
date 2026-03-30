#!/usr/bin/env python3
import os
import zipfile
from datetime import datetime

def create_browser_extension_zip():
    """打包浏览器扩展"""
    print("[1/3] 打包浏览器扩展...")
    with zipfile.ZipFile('build/browser-extension.zip', 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk('browser_extension'):
            # 过滤不需要的文件
            dirs[:] = [d for d in dirs if d not in ['__pycache__', '.git']]

            for file in files:
                if file.endswith(('.pyc', '.DS_Store')):
                    continue

                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, 'browser_extension')
                zipf.write(file_path, arcname)

    print("OK 浏览器扩展打包完成")

def create_project_zip():
    """打包完整项目"""
    print("[2/3] 打包完整项目...")

    # 需要包含的文件和目录
    include_items = [
        'browser_extension',
        'douyin-downloader',
        'web_service',
        'start.bat',
        'start.sh',
        'README.md',
        'README_BROWSER_EXTENSION.md',
        'INSTALL.md',
        '.gitignore',
    ]

    with zipfile.ZipFile('build/douyin-downloader.zip', 'w', zipfile.ZIP_DEFLATED) as zipf:
        for item in include_items:
            if not os.path.exists(item):
                continue

            if os.path.isfile(item):
                zipf.write(item)
                print(f"  添加文件: {item}")
            elif os.path.isdir(item):
                for root, dirs, files in os.walk(item):
                    # 过滤不需要的目录
                    dirs[:] = [d for d in dirs if d not in [
                        '__pycache__', '.git', 'venv', 'build', 'Downloaded', '.claude'
                    ]]

                    for file in files:
                        if file.endswith(('.pyc', '.db', '.DS_Store', '.cookies.json')):
                            continue

                        file_path = os.path.join(root, file)
                        arcname = file_path
                        zipf.write(file_path, arcname)
                        print(f"  添加文件: {file_path}")

    print("OK 完整项目打包完成")

def create_version_info():
    """生成版本信息"""
    print("[3/3] 生成版本信息...")
    version = datetime.now().strftime('%Y.%m.%d')

    try:
        import subprocess
        git_commit = subprocess.check_output(['git', 'rev-parse', '--short', HEAD],
                                           stderr=subprocess.DEVNULL).decode().strip()
    except:
        git_commit = "unknown"

    with open('build/version.txt', 'w', encoding='utf-8') as f:
        f.write(f"版本: {version}\n")
        f.write(f"构建时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Git提交: {git_commit}\n")

    print("OK 版本信息已生成")

if __name__ == '__main__':
    print("========================================")
    print("抖音下载器 - 打包脚本")
    print("========================================")
    print()

    # 创建build目录
    os.makedirs('build', exist_ok=True)

    create_browser_extension_zip()
    print()
    create_project_zip()
    print()
    create_version_info()

    print()
    print("========================================")
    print("打包完成！")
    print("========================================")
    print()
    print("生成的文件:")
    for file in os.listdir('build'):
        file_path = os.path.join('build', file)
        size = os.path.getsize(file_path)
        print(f"  {file} ({size:,} bytes)")

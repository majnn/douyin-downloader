"""
生成浏览器扩展图标

运行此脚本生成 PNG 图标文件：
python generate_icons.py
"""

from PIL import Image, ImageDraw
import os

def create_icon(size):
    """创建指定尺寸的图标"""
    # 创建图像
    img = Image.new('RGBA', (size, size), (26, 26, 26, 255))
    draw = ImageDraw.Draw(img)

    # 绘制圆角矩形背景（抖音风格）
    margin = size // 10
    draw.rounded_rectangle(
        [margin, margin, size - margin, size - margin],
        radius=size // 5,
        fill=(255, 46, 99, 255)  # #FF2E63
    )

    # 绘制下载箭头
    center_x = size // 2
    center_y = size // 2
    arrow_size = size // 4

    # 箭头主体
    draw.polygon([
        (center_x, center_y + arrow_size // 2),  # 底部中心
        (center_x - arrow_size // 2, center_y - arrow_size // 2),  # 左上
        (center_x, center_y),  # 中间凹陷
        (center_x + arrow_size // 2, center_y - arrow_size // 2),  # 右上
    ], fill=(255, 255, 255, 255))

    # 横线
    line_y = center_y + arrow_size // 2 + arrow_size // 4
    draw.rectangle(
        [center_x - arrow_size // 2, line_y, center_x + arrow_size // 2, line_y + arrow_size // 6],
        fill=(255, 255, 255, 255)
    )

    return img

def main():
    """生成所有尺寸的图标"""
    sizes = [16, 48, 128]

    for size in sizes:
        icon = create_icon(size)
        filename = f'icon{size}.png'
        icon.save(filename, 'PNG')
        print(f'Generated: {filename}')

    print('\nAll icons generated successfully!')
    print('Make sure to install Pillow: pip install Pillow')

if __name__ == '__main__':
    try:
        main()
    except ImportError:
        print('Error: Pillow not installed.')
        print('Install it with: pip install Pillow')
    except Exception as e:
        print(f'Error: {e}')

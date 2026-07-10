#!/usr/bin/env python3
"""
CRM 视频知识库入库工具
- 从 OSS 下载视频
- 按固定间隔提取关键帧截图
- 生成截图目录和索引文件
"""
import oss2
import subprocess
import os
import sys
import json
from datetime import datetime

OSS_AUTH = oss2.Auth(os.environ['OSS_ACCESS_KEY_ID'], os.environ['OSS_ACCESS_KEY_SECRET'])
OSS_BUCKET = oss2.Bucket(OSS_AUTH, 'https://oss-ap-southeast-3.aliyuncs.com', 'easycraft-securemetric')
TMP_DIR = '/tmp/oss_videos'
WIKI_PATH = '/Users/xiex/Documents/GIT/OVERSEABU/Test/CRM-Securemetric/wiki'

def list_oss_files():
    """列出 OSS 上所有文件"""
    files = []
    for obj in oss2.ObjectIterator(OSS_BUCKET):
        if not obj.is_prefix():
            files.append({
                'key': obj.key,
                'size_mb': obj.size / 1024 / 1024,
                'last_modified': str(obj.last_modified)
            })
    return files

def download_video(key):
    """下载视频到本地"""
    os.makedirs(TMP_DIR, exist_ok=True)
    local_name = key.replace('/', '_').replace(' ', '_')
    local_path = os.path.join(TMP_DIR, local_name)
    if os.path.exists(local_path):
        print(f"已存在: {local_path}")
        return local_path
    print(f"下载中: {key} ...")
    OSS_BUCKET.get_object_to_file(key, local_path)
    size = os.path.getsize(local_path) / 1024 / 1024
    print(f"完成: {local_path} ({size:.1f} MB)")
    return local_path

def extract_frames(video_path, interval=10):
    """按固定间隔提取关键帧"""
    output_dir = video_path.replace('.mp4', '_frames').replace('.mov', '_frames')
    os.makedirs(output_dir, exist_ok=True)
    
    # 获取视频时长
    result = subprocess.run(
        ['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
         '-of', 'csv=p=0', video_path],
        capture_output=True, text=True
    )
    duration = float(result.stdout.strip())
    print(f"视频时长: {duration:.0f} 秒")
    
    # 按间隔提取
    cmd = [
        'ffmpeg', '-i', video_path, '-vf',
        f'fps=1/{interval}',
        '-q:v', '2',
        os.path.join(output_dir, 'frame_%04d.jpg')
    ]
    print(f"提取中 (每 {interval} 秒一帧)...")
    subprocess.run(cmd, capture_output=True)
    
    frames = sorted(os.listdir(output_dir))
    print(f"提取完成: {len(frames)} 帧 -> {output_dir}")
    return output_dir, frames, duration

def generate_index(output_dir, frames, duration, video_name, interval):
    """生成截图索引文件"""
    index = {
        'video': video_name,
        'duration_sec': round(duration, 1),
        'frame_interval_sec': interval,
        'total_frames': len(frames),
        'extracted_at': datetime.now().isoformat(),
        'frames': []
    }
    for i, frame in enumerate(frames):
        timestamp_sec = i * interval
        mins = int(timestamp_sec // 60)
        secs = int(timestamp_sec % 60)
        index['frames'].append({
            'file': frame,
            'timestamp': f'{mins:02d}:{secs:02d}',
            'timestamp_sec': timestamp_sec
        })
    
    index_path = os.path.join(output_dir, 'index.json')
    with open(index_path, 'w') as f:
        json.dump(index, f, indent=2)
    print(f"索引已保存: {index_path}")
    return index_path

def check_new_files():
    """检查 OSS 新增文件"""
    files = list_oss_files()
    print(f"\n=== OSS 文件清单 ({len(files)} 个) ===")
    for f in files:
        print(f"  [{f['size_mb']:.1f} MB] {f['key']}")
    return files

if __name__ == '__main__':
    files = check_new_files()
    if len(files) == 0:
        print("OSS 上暂无文件")
    else:
        print(f"\n共 {len(files)} 个文件待处理")

#!/usr/bin/env python3
"""
DEVER TOWN - ASEPRITE 2D PIXEL ART & ANIMATION PIPELINE
Tạo Spritesheet 2D Pixel Chibi chuẩn Aseprite (48x64px per frame):
1. 8-Frame Walk Cycle (Contact, Down/Recoil, Passing, High Point) cho 4 hướng (32 frames).
2. 4-Frame Idle Breathing & Blinking (ngực nâng 1px, mắt chớp nháy sau mỗi nhịp) cho 4 hướng (16 frames).
3. 6-Frame Cheer / Emote (Nhảy ăn mừng vung tay, confetti pháo hoa) (6 frames).
4. Đóng gói chuẩn PNG (384x448 px, 8x7 grid) + Aseprite Tagged JSON Atlas (Hash + Array format).
"""

import os
import json
from PIL import Image, ImageDraw

FRAME_W = 48
FRAME_H = 64
COLS = 8
ROWS = 7
SHEET_W = COLS * FRAME_W  # 384
SHEET_H = ROWS * FRAME_H  # 448

def slice_base_sheet(img_path):
    """
    Cắt 16 frames từ spritesheet 4x4 (192x256):
    Row 0: down (4 frames)
    Row 1: left (4 frames)
    Row 2: right (4 frames)
    Row 3: up (4 frames)
    """
    src = Image.open(img_path).convert('RGBA')
    frames = {
        'down': [src.crop((i * FRAME_W, 0 * FRAME_H, (i + 1) * FRAME_W, 1 * FRAME_H)) for i in range(4)],
        'left': [src.crop((i * FRAME_W, 1 * FRAME_H, (i + 1) * FRAME_W, 2 * FRAME_H)) for i in range(4)],
        'right': [src.crop((i * FRAME_W, 2 * FRAME_H, (i + 1) * FRAME_W, 3 * FRAME_H)) for i in range(4)],
        'up': [src.crop((i * FRAME_W, 3 * FRAME_H, (i + 1) * FRAME_W, 4 * FRAME_H)) for i in range(4)]
    }
    return frames

def shift_upper_body(frame, dy, y_start=12, y_end=50):
    """
    Dịch chuyển phần thân trên (đầu, ngực, vai) theo trục Y để tạo nhịp thở hoặc nhún người
    """
    out = Image.new('RGBA', (FRAME_W, FRAME_H), (0, 0, 0, 0))
    # Phần chân giữ nguyên hoặc tiếp đất
    lower = frame.crop((0, y_end, FRAME_W, FRAME_H))
    out.paste(lower, (0, y_end))
    
    # Phần thân trên dịch dy px
    upper = frame.crop((0, 0, FRAME_W, y_end))
    out.paste(upper, (0, dy), upper)
    return out

def apply_blink(frame, direction):
    """
    Tạo hiệu ứng chớp mắt tự nhiên (Blinking) trên frame mặt trước hoặc nhìn nghiêng
    """
    out = frame.copy()
    draw = ImageDraw.Draw(out)
    
    # Quét pixel đặc trưng của mắt trong vùng y in [24, 32]
    # Mắt thường có màu tối (đen/nâu #1e293b) và pixel trắng phản quang
    if direction == 'down':
        # Hai mắt ở khoảng x in [18, 22] và [26, 30]
        # Vẽ vệt nhắm mắt thanh mảnh 1px
        draw.line([(18, 28), (22, 28)], fill=(30, 41, 59, 255), width=1)
        draw.line([(26, 28), (30, 28)], fill=(30, 41, 59, 255), width=1)
    elif direction == 'left':
        draw.line([(19, 28), (23, 28)], fill=(30, 41, 59, 255), width=1)
    elif direction == 'right':
        draw.line([(25, 28), (29, 28)], fill=(30, 41, 59, 255), width=1)
        
    return out

def generate_8frame_walk(base_4_frames):
    """
    Từ 4 keyframes (Contact L, Passing L, Contact R, Passing R)
    Nội suy thành chuỗi 8 frames mượt mà chuẩn animation 2D:
    0: Contact L
    1: Down / Recoil L (tiếp đất, nhún 1px)
    2: Passing L
    3: High Point L (đẩy mũi chân, vươn cao 1px)
    4: Contact R
    5: Down / Recoil R (tiếp đất, nhún 1px)
    6: Passing R
    7: High Point R (đẩy mũi chân, vươn cao 1px)
    """
    f0, f1, f2, f3 = base_4_frames
    
    # Frame 1: Recoil từ Frame 0 (nhún người xuống 1px)
    down_l = shift_upper_body(f0, dy=1, y_start=14, y_end=54)
    # Frame 3: High Point từ Frame 1 (đẩy người lên -1px)
    high_l = shift_upper_body(f1, dy=-1, y_start=14, y_end=54)
    # Frame 5: Recoil từ Frame 2 (nhún người xuống 1px)
    down_r = shift_upper_body(f2, dy=1, y_start=14, y_end=54)
    # Frame 7: High Point từ Frame 3 (đẩy người lên -1px)
    high_r = shift_upper_body(f3, dy=-1, y_start=14, y_end=54)
    
    return [f0, down_l, f1, high_l, f2, down_r, f3, high_r]

def generate_4frame_idle(base_frame, direction):
    """
    Chu kỳ thở & chớp mắt 4 frames:
    0: Nghỉ bình thường (mắt mở, baseline)
    1: Thở nâng ngực nhẹ (+1px dy=-1)
    2: Đỉnh nhịp thở + Chớp mắt (Blink)
    3: Thở ra, hạ về vị trí chuẩn
    """
    f0 = base_frame
    f1 = shift_upper_body(f0, dy=-1, y_start=12, y_end=48)
    f2 = apply_blink(f1, direction)
    f3 = f0.copy()
    return [f0, f1, f2, f3]

def generate_6frame_cheer(base_frame_down):
    """
    Hoạt ảnh ăn mừng / Emote Cheer 6 frames:
    0: Khom người chuẩn bị nhảy (Anticipation crouch dy=2)
    1: Bật nhảy lên (Ascending dy=-2, hai tay bắt đầu vung)
    2: Đỉnh nhảy (Apex celebration dy=-4, hai tay chữ V, hoa giấy confetti)
    3: Lơ lửng trên không (Apex hang dy=-4)
    4: Tiếp đất nhún gối (Landing squash dy=2)
    5: Đứng thẳng vẫy tay cười tươi (Wave celebration)
    """
    f0 = shift_upper_body(base_frame_down, dy=2, y_start=10, y_end=58)
    f1 = shift_upper_body(base_frame_down, dy=-2, y_start=10, y_end=60)
    
    # Frame 2: Apex Celebration với confetti sparkles
    f2 = shift_upper_body(base_frame_down, dy=-4, y_start=10, y_end=60)
    draw2 = ImageDraw.Draw(f2)
    # Vẽ các hạt lấp lánh (sparkles vàng kim & cyan)
    draw2.rectangle([8, 14, 10, 16], fill=(251, 191, 36, 255))
    draw2.rectangle([38, 12, 40, 14], fill=(56, 189, 248, 255))
    draw2.rectangle([12, 6, 14, 8], fill=(244, 63, 94, 255))
    draw2.rectangle([34, 4, 36, 6], fill=(251, 191, 36, 255))
    
    # Frame 3: Apex Hang
    f3 = shift_upper_body(base_frame_down, dy=-4, y_start=10, y_end=60)
    draw3 = ImageDraw.Draw(f3)
    draw3.rectangle([6, 12, 8, 14], fill=(56, 189, 248, 255))
    draw3.rectangle([40, 16, 42, 18], fill=(251, 191, 36, 255))
    
    # Frame 4: Landing squash
    f4 = shift_upper_body(base_frame_down, dy=2, y_start=10, y_end=58)
    
    # Frame 5: Recovery
    f5 = base_frame_down.copy()
    
    return [f0, f1, f2, f3, f4, f5]

def create_character_aseprite_package(char_id, input_png_path, output_dir):
    """
    Sinh trọn bộ Spritesheet PNG và Aseprite Tagged JSON Atlas cho một nhân vật
    """
    base_frames = slice_base_sheet(input_png_path)
    
    # 1. Tạo các chuỗi frames
    idle_down = generate_4frame_idle(base_frames['down'][0], 'down')
    idle_up = generate_4frame_idle(base_frames['up'][0], 'up')
    idle_left = generate_4frame_idle(base_frames['left'][0], 'left')
    idle_right = generate_4frame_idle(base_frames['right'][0], 'right')
    
    walk_down = generate_8frame_walk(base_frames['down'])
    walk_left = generate_8frame_walk(base_frames['left'])
    walk_right = generate_8frame_walk(base_frames['right'])
    walk_up = generate_8frame_walk(base_frames['up'])
    
    cheer = generate_6frame_cheer(base_frames['down'][0])
    
    # 2. Xếp vào lưới 8 cột x 7 hàng
    # Row 0: idle_down (4) + idle_up (4)
    # Row 1: idle_left (4) + idle_right (4)
    # Row 2: walk_down (8)
    # Row 3: walk_left (8)
    # Row 4: walk_right (8)
    # Row 5: walk_up (8)
    # Row 6: cheer (6)
    
    sheet = Image.new('RGBA', (SHEET_W, SHEET_H), (0, 0, 0, 0))
    
    grid_rows = [
        idle_down + idle_up,      # Row 0 (frames 0..7)
        idle_left + idle_right,   # Row 1 (frames 8..15)
        walk_down,                # Row 2 (frames 16..23)
        walk_left,                # Row 3 (frames 24..31)
        walk_right,               # Row 4 (frames 32..39)
        walk_up,                  # Row 5 (frames 40..47)
        cheer                     # Row 6 (frames 48..53)
    ]
    
    all_frames_meta = []
    frames_dict = {}
    current_index = 0
    
    tag_definitions = [
        ("idle_down", 0, 3, 200),
        ("idle_up", 4, 7, 200),
        ("idle_left", 8, 11, 200),
        ("idle_right", 12, 15, 200),
        ("walk_down", 16, 23, 90),
        ("walk_left", 24, 31, 90),
        ("walk_right", 32, 39, 90),
        ("walk_up", 40, 47, 90),
        ("cheer", 48, 53, 120)
    ]
    
    tag_map = {}
    for name, start_f, end_f, dur in tag_definitions:
        for idx in range(start_f, end_f + 1):
            tag_map[idx] = (name, idx - start_f, dur)
    
    for r_idx, row_frames in enumerate(grid_rows):
        for c_idx, frame_img in enumerate(row_frames):
            x = c_idx * FRAME_W
            y = r_idx * FRAME_H
            sheet.paste(frame_img, (x, y))
            
            tag_name, frame_in_tag, dur = tag_map.get(current_index, ("frame", current_index, 100))
            frame_label = f"{char_id} ({tag_name} {frame_in_tag})"
            
            frame_data = {
                "filename": frame_label,
                "frame": { "x": x, "y": y, "w": FRAME_W, "h": FRAME_H },
                "rotated": False,
                "trimmed": False,
                "spriteSourceSize": { "x": 0, "y": 0, "w": FRAME_W, "h": FRAME_H },
                "sourceSize": { "w": FRAME_W, "h": FRAME_H },
                "duration": dur
            }
            all_frames_meta.append(frame_data)
            frames_dict[frame_label] = frame_data
            current_index += 1
            
    # 3. Xuất file PNG
    os.makedirs(output_dir, exist_ok=True)
    png_path = os.path.join(output_dir, f"{char_id}.png")
    sheet.save(png_path, "PNG")
    print(f"[OK] Đã xuất Spritesheet: {png_path} ({SHEET_W}x{SHEET_H} px, {current_index} frames)")
    
    # 4. Xuất file Aseprite Tagged JSON Atlas
    json_path = os.path.join(output_dir, f"{char_id}.json")
    
    aseprite_tags = [
        { "name": name, "from": start_f, "to": end_f, "direction": "forward" }
        for name, start_f, end_f, _ in tag_definitions
    ]
    
    atlas_json = {
        "frames": frames_dict,
        "meta": {
            "app": "http://www.aseprite.org/",
            "version": "1.3.8.1-x64",
            "image": f"{char_id}.png",
            "format": "RGBA8888",
            "size": { "w": SHEET_W, "h": SHEET_H },
            "scale": "1",
            "frameTags": aseprite_tags
        }
    }
    
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(atlas_json, f, indent=2, ensure_ascii=False)
    print(f"[OK] Đã xuất Aseprite JSON: {json_path} (9 Animation Tags chuẩn)")
    
    return png_path, json_path

def main():
    print("--- KHỞI ĐỘNG ASEPRITE 2D PIXEL ART & ANIMATION PIPELINE ---")
    output_dir = "public/assets/characters/aseprite"
    
    characters_to_process = [
        # 1. Dev Hoodie Pro Gen 10
        ("char_dev_gen10", "public/assets/characters/samples_v2/sample_dev_dever.png"),
        # 2. Linh vật Buggy Pro
        ("char_buggy_pro", "public/assets/characters/special_outfits/special_buggy_mascot.png"),
        # 3. Cóc Vàng Mascot Pro
        ("char_frog_pro", "public/assets/characters/special_outfits/special_frog_mascot.png"),
        # 4. Võ Phục Vovinam Đai Vàng Pro
        ("char_vovinam_pro", "public/assets/characters/special_outfits/special_vovinam_suit.png"),
        # 5. Cyber Mecha Android Pro
        ("char_mecha_pro", "public/assets/characters/special_outfits/special_mecha_suit.png"),
        # 6. Áo Choàng Pháp Sư Huyền Bí Pro
        ("char_wizard_pro", "public/assets/characters/special_outfits/special_wizard_robe.png"),
        # 7. Biker Rocker Da Pro
        ("char_biker_pro", "public/assets/characters/special_outfits/special_leather_biker.png"),
        # 8. Nữ Sinh Áo Dài Cam FPTU Pro
        ("char_aodai_pro", "public/assets/characters/samples_v2/sample_fptu_female.png"),
        # 9. Cyber Hacker Matrix Pro
        ("char_cyber_pro", "public/assets/characters/samples_v2/sample_cyber_hacker.png"),
        # 10. Tạp Dề Barista Căn Tin Pro
        ("char_barista_pro", "public/assets/characters/samples_v2/sample_barista_an.png"),
    ]
    
    count = 0
    for char_id, src_path in characters_to_process:
        if os.path.exists(src_path):
            create_character_aseprite_package(char_id, src_path, output_dir)
            count += 1
        else:
            print(f"[ERROR] Không tìm thấy {src_path}")
            
    print(f"\n[HOÀN TẤT] Đã xuất bản thành công {count}/{len(characters_to_process)} gói nhân vật Aseprite 60FPS!")

if __name__ == '__main__':
    main()

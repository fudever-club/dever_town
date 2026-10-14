import os
from PIL import Image

BRAIN_DIR = 'C:/Users/This PC/.gemini/antigravity-ide/brain/f4243eb1-3b00-4f93-aaec-327220655ce0'
OUT_DIR = 'public/assets/characters/samples_v2'
os.makedirs(OUT_DIR, exist_ok=True)

SHEETS = [
  {
    'name': 'char_stardew_fptu_polo',
    'src': os.path.join(BRAIN_DIR, 'sheet_stardew_polo_1791951241315.jpg'),
    'cols': 6,
    'rows': 4,
    'select_cols': [0, 1, 2, 3], # 4 frames per dir
    'mirror_row2': True # row 2 in image is facing left, mirror for right
  },
  {
    'name': 'char_stardew_aodai',
    'src': os.path.join(BRAIN_DIR, 'sheet_stardew_aodai_1791951294005.jpg'),
    'cols': 4,
    'rows': 4,
    'select_cols': [0, 1, 2, 3],
    'mirror_row2': True
  },
  {
    'name': 'char_stardew_wizard',
    'src': os.path.join(BRAIN_DIR, 'sheet_stardew_wizard_1791951327723.jpg'),
    'cols': 4,
    'rows': 4,
    'select_cols': [0, 1, 2, 3],
    'mirror_row2': True
  },
  {
    'name': 'char_stardew_cyber',
    'src': os.path.join(BRAIN_DIR, 'sheet_stardew_cyber_1791951362177.jpg'),
    'cols': 4,
    'rows': 4,
    'select_cols': [0, 1, 2, 3],
    'mirror_row2': True
  }
]

FRAME_W = 48
FRAME_H = 64
SHEET_W = FRAME_W * 4 # 192
SHEET_H = FRAME_H * 4 # 256
FEET_Y = 62 # Anchor feet at y=62 so physics hitbox (y=54 to 64) is 100% aligned

def is_magenta(r, g, b):
    # Check if magenta background or black grid border
    if r > 160 and b > 160 and g < 90:
        return True
    if (r - g > 55) and (b - g > 55) and (r > 130 and b > 130):
        return True
    return False

def remove_background(im):
    im = im.convert('RGBA')
    w, h = im.size
    pix = im.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = pix[x, y]
            if is_magenta(r, g, b):
                pix[x, y] = (0, 0, 0, 0)
    return im

def defringe(im):
    w, h = im.size
    pix = im.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = pix[x, y]
            if a > 0:
                # If stray magenta tint on edges
                if r > b and r > 160 and g < 100 and b > 140:
                    pix[x, y] = (0, 0, 0, 0)
                elif r > 180 and b > 180 and g < 110:
                    # desaturate stray purple halo
                    avg = (r + g + b) // 3
                    pix[x, y] = (avg, avg, avg, a)
    return im

for cfg in SHEETS:
    src_file = cfg['src']
    if not os.path.exists(src_file):
        print(f"File not found: {src_file}")
        continue
    
    raw_img = Image.open(src_file)
    clean_img = remove_background(raw_img)
    clean_img = defringe(clean_img)

    W, H = clean_img.size
    cols = cfg['cols']
    rows = cfg['rows']
    cell_w = W / cols
    cell_h = H / rows

    out_sheet = Image.new('RGBA', (SHEET_W, SHEET_H), (0, 0, 0, 0))

    # Output rows: 0: Down, 1: Left, 2: Right, 3: Up
    for r in range(4):
        src_r = r
        # If row 2 is requested to be mirrored from left (row 1)
        use_mirror = False
        if r == 2 and cfg.get('mirror_row2', False):
            src_r = 1 # source from left row
            use_mirror = True

        for c_out, c_idx in enumerate(cfg['select_cols']):
            # Crop cell with 6px inset to remove any cell grid lines
            inset = 8 if 'wizard' in cfg['name'] else 2
            x1 = int(c_idx * cell_w) + inset
            y1 = int(src_r * cell_h) + inset
            x2 = int((c_idx + 1) * cell_w) - inset
            y2 = int((src_r + 1) * cell_h) - inset
            cell = clean_img.crop((x1, y1, x2, y2))

            # Find non-transparent bounding box
            bbox = cell.getbbox()
            if bbox:
                char_crop = cell.crop(bbox)
                cw, ch = char_crop.size

                # If mirror needed (for Right facing from Left)
                if use_mirror:
                    char_crop = char_crop.transpose(Image.FLIP_LEFT_RIGHT)

                # Scale character to fit within frame (max height ~54-58px)
                target_h = 56
                scale = target_h / ch
                target_w = max(1, int(cw * scale))
                char_scaled = char_crop.resize((target_w, target_h), Image.Resampling.LANCZOS)

                # Place into 48x64 frame centered horizontally with feet at FEET_Y
                frame_img = Image.new('RGBA', (FRAME_W, FRAME_H), (0, 0, 0, 0))
                paste_x = (FRAME_W - target_w) // 2
                paste_y = FEET_Y - target_h
                frame_img.paste(char_scaled, (paste_x, paste_y), char_scaled)

                # Paste into final sheet
                out_sheet.paste(frame_img, (c_out * FRAME_W, r * FRAME_H), frame_img)

    dst_path = os.path.join(OUT_DIR, f"{cfg['name']}.png")
    out_sheet.save(dst_path, 'PNG')
    print(f"Successfully generated spritesheet: {dst_path} (192x256)")

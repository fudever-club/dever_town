import os
from PIL import Image

BRAIN_DIR = 'C:/Users/This PC/.gemini/antigravity-ide/brain/f4243eb1-3b00-4f93-aaec-327220655ce0'
OUT_DIR = 'public/assets/characters/samples_v2'
os.makedirs(OUT_DIR, exist_ok=True)

SHEETS = [
  {
    'name': 'char_stardew_dev_hoodie',
    'src': os.path.join(BRAIN_DIR, 'char_stardew_dev_hoodie_1791949570834.jpg'),
    'cols': 4,
    'rows': 4,
    'select_cols': [0, 1, 2, 3],
    'mirror_row2': True,
    'target_h': 108
  },
  {
    'name': 'char_stardew_fptu_polo',
    'src': os.path.join(BRAIN_DIR, 'sheet_stardew_polo_1791951241315.jpg'),
    'cols': 6,
    'rows': 4,
    'select_cols': [0, 1, 2, 3],
    'mirror_row2': True,
    'target_h': 108
  },
  {
    'name': 'char_stardew_aodai',
    'src': os.path.join(BRAIN_DIR, 'sheet_stardew_aodai_1791951294005.jpg'),
    'cols': 4,
    'rows': 4,
    'select_cols': [0, 1, 2, 3],
    'mirror_row2': True,
    'target_h': 108
  },
  {
    'name': 'char_stardew_wizard',
    'src': os.path.join(BRAIN_DIR, 'sheet_stardew_wizard_1791951327723.jpg'),
    'cols': 4,
    'rows': 4,
    'select_cols': [0, 1, 2, 3],
    'mirror_row2': True,
    'target_h': 116
  },
  {
    'name': 'char_stardew_cyber',
    'src': os.path.join(BRAIN_DIR, 'sheet_stardew_cyber_1791951362177.jpg'),
    'cols': 4,
    'rows': 4,
    'select_cols': [0, 1, 2, 3],
    'mirror_row2': True,
    'target_h': 108
  }
]

FRAME_W = 96
FRAME_H = 128
SHEET_W = FRAME_W * 4  # 384
SHEET_H = FRAME_H * 4  # 512
FEET_Y = 122  # Leaves 6px bottom floor margin

def is_magenta(r, g, b):
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
                if r > b and r > 160 and g < 100 and b > 140:
                    pix[x, y] = (0, 0, 0, 0)
                elif r > 180 and b > 180 and g < 110:
                    avg = (r + g + b) // 3
                    pix[x, y] = (avg, avg, avg, a)
    return im

def process_sheets():
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

        inset = 8 if 'wizard' in cfg['name'] else 2
        ref_cell = clean_img.crop((inset, inset, int(cell_w) - inset, int(cell_h) - inset))
        ref_bbox = ref_cell.getbbox()
        ref_h = (ref_bbox[3] - ref_bbox[1]) if ref_bbox else 225
        char_scale = cfg['target_h'] / ref_h

        out_sheet = Image.new('RGBA', (SHEET_W, SHEET_H), (0, 0, 0, 0))

        # Output rows: 0: Down, 1: Left, 2: Right, 3: Up
        for r in range(4):
            src_r = r
            use_mirror = False
            if r == 2 and cfg.get('mirror_row2', False):
                src_r = 1  # mirror from left row
                use_mirror = True

            for c_out, c_idx in enumerate(cfg['select_cols']):
                x1 = int(c_idx * cell_w) + inset
                y1 = int(src_r * cell_h) + inset
                x2 = int((c_idx + 1) * cell_w) - inset
                y2 = int((src_r + 1) * cell_h) - inset
                cell = clean_img.crop((x1, y1, x2, y2))

                bbox = cell.getbbox()
                if bbox:
                    char_crop = cell.crop(bbox)
                    cw, ch = char_crop.size

                    if use_mirror:
                        char_crop = char_crop.transpose(Image.FLIP_LEFT_RIGHT)

                    target_w = max(1, int(cw * char_scale))
                    target_h = max(1, int(ch * char_scale))
                    char_scaled = char_crop.resize((target_w, target_h), Image.Resampling.LANCZOS)

                    frame_img = Image.new('RGBA', (FRAME_W, FRAME_H), (0, 0, 0, 0))
                    paste_x = (FRAME_W - target_w) // 2
                    paste_y = FEET_Y - target_h
                    frame_img.paste(char_scaled, (paste_x, paste_y), char_scaled)

                    out_sheet.paste(frame_img, (c_out * FRAME_W, r * FRAME_H), frame_img)

        dst_path = os.path.join(OUT_DIR, f"{cfg['name']}.png")
        out_sheet.save(dst_path, 'PNG')
        print(f"Generated: {dst_path} ({SHEET_W}x{SHEET_H}, frame: {FRAME_W}x{FRAME_H})")

if __name__ == '__main__':
    process_sheets()

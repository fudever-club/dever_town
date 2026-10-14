"""
build_painted_rooms_v1.py
Renders high-fidelity 1376x768 2.5D pixel-art painted backgrounds for the 3 remaining rooms:
1. memory_room: Museum Exhibition Gallery & Hall of Fame (warm mahogany, parquet, red carpet runner, golden frog pedestal, trophy showcases, milestone frames).
2. web_room: Web & Media Studio Hub (soundproof acoustic walls, cyber epoxy floor, triple-monitor video editing desk, podcast booth, green screen studio, big LED dashboard wall).
3. server_dungeon: Subterranean Server Faults Bunker (reinforced concrete walls, steel grating, high-density server racks with pulsing LEDs, 3 bug anomaly containment zones, mainframe terminal).
"""

import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

WIDTH = 1376
HEIGHT = 768

def create_wood_parquet(w, h):
    """Warm oak herringbone / parquet pattern with grain."""
    base = np.zeros((h, w, 3), dtype=np.uint8)
    # Warm golden-brown oak base
    base[:, :] = [182, 134, 88]
    
    # Planks: 48x16 px
    pw, ph = 48, 16
    for y in range(0, h, ph):
        for x in range(0, w, pw):
            shade = ((x // pw * 17 + y // ph * 31) % 5) - 2 # -2 to 2
            r = np.clip(182 + shade * 8, 150, 210)
            g = np.clip(134 + shade * 6, 110, 160)
            b = np.clip(88 + shade * 4, 70, 110)
            base[y:y+ph, x:x+pw] = [r, g, b]
            # Groove
            base[y, x:x+pw] = [120, 80, 50]
            base[y:y+ph, x] = [120, 80, 50]
            
    # Add subtle organic noise
    noise = (np.random.RandomState(42).randn(h, w, 3) * 4).astype(np.int16)
    res = np.clip(base.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    return Image.fromarray(res)

def create_cyber_floor(w, h):
    """Polished dark tech epoxy floor with subtle cyan grid lines."""
    base = np.zeros((h, w, 3), dtype=np.uint8)
    base[:, :] = [26, 32, 44] # slate navy
    
    grid = 32
    for x in range(0, w, grid):
        base[:, x] = [38, 52, 70]
    for y in range(0, h, grid):
        base[y, :] = [38, 52, 70]
        
    # Major grid lines every 128px
    for x in range(0, w, 128):
        base[:, x:x+2] = [45, 90, 110]
    for y in range(0, h, 128):
        base[y:y+2, :] = [45, 90, 110]
        
    noise = (np.random.RandomState(101).randn(h, w, 3) * 3).astype(np.int16)
    res = np.clip(base.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    return Image.fromarray(res)

def create_steel_grate_floor(w, h):
    """Subterranean bunker floor: steel grating over glowing cyan/amber conduits."""
    base = np.zeros((h, w, 3), dtype=np.uint8)
    base[:, :] = [18, 20, 24] # very dark subterranean
    
    # Subterranean conduit glow underneath
    conduit_y = [220, 380, 540]
    for cy in conduit_y:
        for x in range(w):
            glow = int(35 + 25 * math.sin(x * 0.05))
            base[cy-6:cy+6, x] = [10, glow, glow + 20]
            
    # Steel diamond grating plates (64x64)
    gw = 64
    for y in range(0, h, gw):
        for x in range(0, w, gw):
            # Plate border
            base[y:y+gw, x:x+2] = [45, 48, 55]
            base[y:y+2, x:x+gw] = [55, 58, 65]
            base[y+gw-2:y+gw, x:x+gw] = [28, 30, 35]
            base[y:y+gw, x+gw-2:x+gw] = [28, 30, 35]
            # Diamond cross hatches
            for d in range(8, gw, 16):
                if y + d < h and x + d < w:
                    base[y+d:y+d+2, x+8:x+gw-8] = [36, 40, 48]
                    
    noise = (np.random.RandomState(777).randn(h, w, 3) * 3).astype(np.int16)
    res = np.clip(base.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    return Image.fromarray(res)

def draw_wall_base(draw, wall_h, top_color, wall_color, molding_color, baseboard_color):
    """Draws upper ceiling band, 2.5D perspective wall, crown molding, and baseboard."""
    # Ceiling / top border
    draw.rectangle([0, 0, WIDTH, 32], fill=top_color)
    # Crown molding
    draw.rectangle([0, 32, WIDTH, 44], fill=molding_color)
    draw.rectangle([0, 44, WIDTH, 48], fill=(int(molding_color[0]*0.7), int(molding_color[1]*0.7), int(molding_color[2]*0.7)))
    # Main wall face
    draw.rectangle([0, 48, WIDTH, wall_h], fill=wall_color)
    # Baseboard
    draw.rectangle([0, wall_h - 18, WIDTH, wall_h - 6], fill=baseboard_color)
    draw.rectangle([0, wall_h - 6, WIDTH, wall_h], fill=(30, 20, 15)) # drop shadow to floor

def draw_drop_shadow(draw, x, y, w, h, blur_layers=3):
    """Draws multi-layered drop shadow for 2.5D depth."""
    for i in range(blur_layers, 0, -1):
        alpha = int(40 / i)
        offset = i * 2
        draw.rectangle([x - offset, y - offset, x + w + offset, y + h + offset], fill=(0, 0, 0, alpha))

# ==============================================================================
# ROOM 1: MEMORY ROOM (Gallery of Fame & Memorial Hall)
# ==============================================================================
def render_memory_room():
    im = create_wood_parquet(WIDTH, HEIGHT).convert("RGBA")
    draw = ImageDraw.Draw(im)
    
    wall_h = 240
    # Mahogany wood panel walls
    draw_wall_base(draw, wall_h, (50, 28, 18), (115, 62, 34), (160, 95, 52), (80, 40, 22))
    
    # Wall panels detailing (wainscoting rectangles along the wall)
    panel_w, panel_h = 100, 130
    for x in range(60, WIDTH - 60, 120):
        # Outer panel frame
        draw.rectangle([x, 65, x + panel_w, 65 + panel_h], fill=(95, 50, 28), outline=(145, 80, 45), width=2)
        # Inner panel inset
        draw.rectangle([x + 6, 71, x + panel_w - 6, 65 + panel_h - 6], fill=(125, 68, 38), outline=(75, 38, 20), width=1)
        
    # Central Crimson Velvet Carpet Runner
    carpet_x1, carpet_x2 = 560, 816
    draw.rectangle([carpet_x1 - 4, wall_h, carpet_x2 + 4, HEIGHT], fill=(160, 120, 30)) # Gold trim border
    draw.rectangle([carpet_x1, wall_h, carpet_x2, HEIGHT], fill=(150, 24, 34)) # Rich crimson velvet
    # Carpet center runner pattern
    for cy in range(wall_h, HEIGHT, 24):
        draw.line([carpet_x1 + 16, cy, carpet_x2 - 16, cy], fill=(130, 20, 28), width=1)
        
    # 4 Major Exhibition Frames on Wall
    frames = [
        (120, 80, 160, 100, "9+ NAM PHAT TRIEN", (210, 180, 140)),
        (380, 80, 160, 100, "20+ GIAI THUONG ICPC", (230, 200, 130)),
        (836, 80, 160, 100, "TEAMBUILDING GIAN KET", (210, 180, 140)),
        (1096, 80, 160, 100, "TECH TALK WORKSHOP", (200, 210, 220))
    ]
    for fx, fy, fw, fh, title, inner_col in frames:
        # Gold frame shadow
        draw.rectangle([fx + 4, fy + 4, fx + fw + 4, fy + fh + 4], fill=(40, 20, 10))
        # Ornate gold frame
        draw.rectangle([fx, fy, fx + fw, fy + fh], fill=(215, 175, 65), outline=(140, 105, 30), width=3)
        # White matte
        draw.rectangle([fx + 8, fy + 8, fx + fw - 8, fy + fh - 8], fill=(245, 240, 230))
        # Photo / Document center
        draw.rectangle([fx + 16, fy + 16, fx + fw - 16, fy + fh - 16], fill=inner_col)
        # Decorative banner lines
        draw.line([fx + 24, fy + 40, fx + fw - 24, fy + 40], fill=(100, 80, 60), width=2)
        draw.line([fx + 24, fy + 55, fx + fw - 24, fy + 55], fill=(130, 110, 90), width=1)
        draw.line([fx + 24, fy + 68, fx + fw - 24, fy + 68], fill=(130, 110, 90), width=1)
        # Brass nameplate below frame
        draw.rectangle([fx + 25, fy + fh + 4, fx + fw - 25, fy + fh + 18], fill=(220, 180, 70), outline=(120, 90, 25), width=1)
        
    # Central Monument: The Golden Frog (Linh Vat Coc Vang FUDA) on Carved Pedestal
    ped_cx, ped_cy = 688, 440
    # Pedestal Shadow
    draw.ellipse([ped_cx - 85, ped_cy + 30, ped_cx + 85, ped_cy + 85], fill=(40, 10, 15))
    # Octagonal Marble Pedestal Base
    draw.polygon([
        (ped_cx - 70, ped_cy + 25), (ped_cx - 40, ped_cy + 55),
        (ped_cx + 40, ped_cy + 55), (ped_cx + 70, ped_cy + 25),
        (ped_cx + 70, ped_cy - 10), (ped_cx + 40, ped_cy - 35),
        (ped_cx - 40, ped_cy - 35), (ped_cx - 70, ped_cy - 10)
    ], fill=(235, 230, 220), outline=(160, 150, 140))
    # Pedestal Pillar
    draw.rectangle([ped_cx - 50, ped_cy - 35, ped_cx + 50, ped_cy + 15], fill=(215, 210, 200), outline=(140, 130, 120))
    # Golden Frog Statue (Stylized iconic golden toad on gold ingot)
    # Gold base ingot
    draw.ellipse([ped_cx - 42, ped_cy - 48, ped_cx + 42, ped_cy - 22], fill=(230, 185, 30), outline=(170, 130, 10))
    # Frog body
    draw.ellipse([ped_cx - 34, ped_cy - 72, ped_cx + 34, ped_cy - 35], fill=(245, 205, 45), outline=(180, 140, 15))
    # Frog head & eyes
    draw.ellipse([ped_cx - 24, ped_cy - 85, ped_cx + 24, ped_cy - 55], fill=(255, 215, 55))
    draw.ellipse([ped_cx - 20, ped_cy - 88, ped_cx - 8, ped_cy - 76], fill=(255, 240, 120), outline=(160, 120, 10))
    draw.ellipse([ped_cx + 8, ped_cy - 88, ped_cx + 20, ped_cy - 76], fill=(255, 240, 120), outline=(160, 120, 10))
    # Jade coin in mouth
    draw.ellipse([ped_cx - 8, ped_cy - 68, ped_cx + 8, ped_cy - 56], fill=(45, 185, 110), outline=(20, 110, 60))
    
    # 2 Glass Showcase Towers (Trophy & Medal Display)
    showcases = [(240, 360), (1050, 360)]
    for scx, scy in showcases:
        scw, sch = 150, 180
        # Shadow
        draw.rectangle([scx - 10, scy + sch - 15, scx + scw + 10, scy + sch + 25], fill=(80, 50, 30))
        # Mahogany cabinet base
        draw.rectangle([scx, scy + 110, scx + scw, scy + sch], fill=(95, 48, 26), outline=(140, 75, 40), width=2)
        # Glass showcase upper
        draw.rectangle([scx + 6, scy, scx + scw - 6, scy + 110], fill=(210, 235, 245, 120), outline=(180, 150, 90), width=2)
        # Glass shelves
        draw.line([scx + 10, scy + 40, scx + scw - 10, scy + 40], fill=(255, 255, 255, 200), width=2)
        draw.line([scx + 10, scy + 75, scx + scw - 10, scy + 75], fill=(255, 255, 255, 200), width=2)
        # Golden cups & medals on shelves
        # Shelf 1 cups
        draw.polygon([(scx + 35, scy + 36), (scx + 45, scy + 36), (scx + 40, scy + 20)], fill=(245, 200, 40))
        draw.polygon([(scx + 70, scy + 36), (scx + 80, scy + 36), (scx + 75, scy + 15)], fill=(245, 200, 40))
        draw.polygon([(scx + 105, scy + 36), (scx + 115, scy + 36), (scx + 110, scy + 22)], fill=(210, 210, 210)) # Silver cup
        # Shelf 2 robotics trophy
        draw.rectangle([scx + 65, scy + 55, scx + 85, scy + 72], fill=(230, 180, 35), outline=(150, 110, 10))
        
    # Museum Velvet Stanchions (Rope barriers)
    stanchion_x = [480, 896]
    for sx in stanchion_x:
        # Base
        draw.ellipse([sx - 16, 520, sx + 16, 536], fill=(215, 175, 40), outline=(130, 95, 20))
        # Post
        draw.rectangle([sx - 4, 460, sx + 4, 525], fill=(235, 195, 55))
        # Top ball
        draw.ellipse([sx - 9, 445, sx + 9, 463], fill=(255, 215, 70), outline=(150, 110, 25))
    # Red velvet rope hanging between
    draw.arc([480, 430, 896, 510], 0, 180, fill=(160, 25, 35), width=6)
    
    # 2 Polished Oak Museum Benches along left and right lower walls
    benches = [(140, 590), (1076, 590)]
    for bx, by in benches:
        bw, bh = 160, 50
        draw.rectangle([bx + 4, by + bh - 6, bx + bw + 4, by + bh + 14], fill=(70, 45, 25)) # shadow
        # Bench seat
        draw.rectangle([bx, by, bx + bw, by + 22], fill=(130, 80, 42), outline=(165, 105, 55), width=2)
        # Legs
        draw.rectangle([bx + 12, by + 22, bx + 24, by + bh], fill=(70, 40, 20))
        draw.rectangle([bx + bw - 24, by + 22, bx + bw - 12, by + bh], fill=(70, 40, 20))
        
    # Exit Portal Archway to Alpha Interior at top center/left
    draw.rectangle([636, 120, 740, wall_h], fill=(30, 15, 10), outline=(190, 140, 50), width=4)
    # Exit Sign
    draw.rectangle([650, 100, 726, 116], fill=(20, 120, 60), outline=(220, 240, 220), width=1)
    
    # Lighting Pass: Soft warm spotlights on the frames and pedestal
    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    odraw = ImageDraw.Draw(overlay)
    # Spotlights on frames
    for fx, fy, fw, fh, _, _ in frames:
        odraw.ellipse([fx - 30, fy - 20, fx + fw + 30, fy + fh + 80], fill=(255, 235, 180, 45))
    # Central Golden Frog spotlight
    odraw.ellipse([ped_cx - 130, ped_cy - 120, ped_cx + 130, ped_cy + 90], fill=(255, 245, 190, 65))
    
    im = Image.alpha_composite(im, overlay)
    return im.convert("RGB")

# ==============================================================================
# ROOM 2: WEB ROOM (Web & Media Studio Hub)
# ==============================================================================
def render_web_room():
    im = create_cyber_floor(WIDTH, HEIGHT).convert("RGBA")
    draw = ImageDraw.Draw(im)
    
    wall_h = 240
    # Soundproof acoustic studio wall (Charcoal / dark slate with cyan accents)
    draw_wall_base(draw, wall_h, (20, 24, 30), (38, 45, 56), (56, 178, 172), (24, 28, 36))
    
    # Acoustic wedge foam patterns on back wall
    for ax in range(40, WIDTH - 40, 60):
        # Foam tile 50x120
        draw.rectangle([ax, 60, ax + 50, 190], fill=(32, 38, 48), outline=(50, 60, 75))
        # Pyramid texture
        draw.line([ax, 60, ax + 25, 125], fill=(45, 55, 70), width=1)
        draw.line([ax + 50, 60, ax + 25, 125], fill=(25, 30, 40), width=1)
        draw.line([ax, 190, ax + 25, 125], fill=(25, 30, 40), width=1)
        draw.line([ax + 50, 190, ax + 25, 125], fill=(45, 55, 70), width=1)
        
    # Massive LED Social Media Dashboard Wall (Center-Right)
    dw_x, dw_y, dw_w, dw_h = 760, 65, 520, 140
    # Screen bezel
    draw.rectangle([dw_x - 6, dw_y - 6, dw_x + dw_w + 6, dw_y + dw_h + 6], fill=(15, 18, 22), outline=(56, 178, 172), width=2)
    # Screen face (Dark cyber cyan glowing display)
    draw.rectangle([dw_x, dw_y, dw_x + dw_w, dw_y + dw_h], fill=(12, 28, 38))
    # Dashboard widgets
    # Widget 1: FPTU Student Portal & Helpdesk
    draw.rectangle([dw_x + 15, dw_y + 15, dw_x + 160, dw_y + dw_h - 15], fill=(18, 42, 58), outline=(40, 110, 130))
    draw.rectangle([dw_x + 25, dw_y + 25, dw_x + 150, dw_y + 45], fill=(245, 130, 32)) # FPT Orange header
    draw.line([dw_x + 25, dw_y + 60, dw_x + 130, dw_y + 60], fill=(100, 180, 200), width=3)
    draw.line([dw_x + 25, dw_y + 75, dw_x + 110, dw_y + 75], fill=(70, 140, 160), width=2)
    draw.line([dw_x + 25, dw_y + 90, dw_x + 140, dw_y + 90], fill=(70, 140, 160), width=2)
    # Widget 2: GitHub Commit Activity Graph
    draw.rectangle([dw_x + 180, dw_y + 15, dw_x + 335, dw_y + dw_h - 15], fill=(18, 42, 58), outline=(40, 110, 130))
    # GitHub green squares
    for gx in range(dw_x + 195, dw_x + 325, 14):
        for gy in range(dw_y + 40, dw_y + 110, 14):
            gh_col = (38, 166, 65) if (gx + gy) % 3 == 0 else (14, 68, 41)
            draw.rectangle([gx, gy, gx + 10, gy + 10], fill=gh_col)
    # Widget 3: Live Media Feeds (TikTok / Facebook / Member Portal)
    draw.rectangle([dw_x + 355, dw_y + 15, dw_x + dw_w - 15, dw_y + dw_h - 15], fill=(18, 42, 58), outline=(40, 110, 130))
    draw.ellipse([dw_x + 375, dw_y + 35, dw_x + 405, dw_y + 65], fill=(24, 119, 242)) # FB blue
    draw.ellipse([dw_x + 435, dw_y + 35, dw_x + 465, dw_y + 65], fill=(238, 29, 82)) # TikTok pink
    draw.line([dw_x + 370, dw_y + 85, dw_x + 480, dw_y + 85], fill=(56, 178, 172), width=3)
    draw.line([dw_x + 370, dw_y + 100, dw_x + 450, dw_y + 100], fill=(40, 120, 120), width=2)
    
    # Green Screen Studio Zone (Top Left)
    gs_x, gs_y, gs_w, gs_h = 80, 70, 260, 220
    # Hanging chroma green backdrop roll
    draw.rectangle([gs_x, gs_y, gs_x + gs_w, gs_y + 140], fill=(0, 177, 64), outline=(0, 120, 45), width=3)
    # Green floor spill
    draw.rectangle([gs_x + 10, wall_h, gs_x + gs_w - 10, wall_h + 50], fill=(0, 145, 52, 160))
    # Studio Softbox Lights (Left & Right of green screen)
    for lx in [gs_x - 25, gs_x + gs_w + 15]:
        # Light stand
        draw.line([lx, wall_h + 80, lx, wall_h - 40], fill=(50, 55, 65), width=4)
        # Softbox diffuser
        draw.polygon([(lx - 20, wall_h - 40), (lx + 20, wall_h - 40), (lx + 30, wall_h - 90), (lx - 30, wall_h - 90)], fill=(245, 250, 255), outline=(60, 65, 75))
        # Tripod legs
        draw.line([lx, wall_h + 80, lx - 20, wall_h + 110], fill=(50, 55, 65), width=3)
        draw.line([lx, wall_h + 80, lx + 20, wall_h + 110], fill=(50, 55, 65), width=3)
        
    # Heavy Cinema Camera on Heavy Duty Tripod facing green screen
    cam_x, cam_y = 200, 440
    # Tripod legs
    draw.line([cam_x, cam_y, cam_x - 30, cam_y + 60], fill=(40, 45, 55), width=4)
    draw.line([cam_x, cam_y, cam_x + 30, cam_y + 60], fill=(40, 45, 55), width=4)
    draw.line([cam_x, cam_y, cam_x, cam_y + 65], fill=(30, 35, 45), width=4)
    # Camera body
    draw.rectangle([cam_x - 22, cam_y - 30, cam_x + 22, cam_y], fill=(25, 28, 35), outline=(60, 65, 75))
    # Big lens facing upward
    draw.polygon([(cam_x - 14, cam_y - 30), (cam_x + 14, cam_y - 30), (cam_x + 20, cam_y - 50), (cam_x - 20, cam_y - 50)], fill=(40, 45, 55))
    # Monitor screen on side of camera
    draw.rectangle([cam_x + 22, cam_y - 25, cam_x + 42, cam_y - 8], fill=(0, 200, 100), outline=(20, 25, 30))
    
    # Central Video Editing Workstation (Media Production Desk)
    vdx, vdy, vdw, vdh = 460, 320, 320, 130
    # Shadow
    draw.rectangle([vdx + 8, vdy + 25, vdx + vdw + 8, vdy + vdh + 35], fill=(12, 16, 22))
    # Sleek dark matte desk surface
    draw.rectangle([vdx, vdy, vdx + vdw, vdy + vdh], fill=(42, 48, 60), outline=(65, 75, 95), width=2)
    # Triple Ultrawide Monitors
    # Center Monitor
    draw.rectangle([vdx + 90, vdy - 65, vdx + 230, vdy + 15], fill=(10, 12, 15), outline=(56, 178, 172), width=2)
    draw.rectangle([vdx + 94, vdy - 61, vdx + 226, vdy + 11], fill=(20, 35, 48))
    # Premiere Pro timeline tracks on center monitor
    draw.line([vdx + 100, vdy - 20, vdx + 220, vdy - 20], fill=(56, 178, 172), width=3)
    draw.line([vdx + 100, vdy - 8, vdx + 200, vdy - 8], fill=(238, 130, 238), width=3)
    draw.line([vdx + 100, vdy + 4, vdx + 215, vdy + 4], fill=(70, 180, 80), width=3)
    # Left Angled Monitor
    draw.polygon([(vdx + 10, vdy - 55), (vdx + 80, vdy - 62), (vdx + 80, vdy + 12), (vdx + 10, vdy + 18)], fill=(15, 25, 35), outline=(50, 60, 75))
    # Right Angled Monitor
    draw.polygon([(vdx + 240, vdy - 62), (vdx + 310, vdy - 55), (vdx + 310, vdy + 18), (vdx + 240, vdy + 12)], fill=(15, 25, 35), outline=(50, 60, 75))
    # Studio Monitor Speakers (Audio monitors)
    draw.rectangle([vdx + 15, vdy + 25, vdx + 45, vdy + 75], fill=(20, 22, 28), outline=(50, 55, 65))
    draw.ellipse([vdx + 22, vdy + 45, vdx + 38, vdy + 65], fill=(220, 180, 40)) # Yellow cone
    draw.rectangle([vdx + vdw - 45, vdy + 25, vdx + vdw - 15, vdy + 75], fill=(20, 22, 28), outline=(50, 55, 65))
    draw.ellipse([vdx + vdw - 38, vdy + 45, vdx + vdw - 22, vdy + 65], fill=(220, 180, 40))
    # Keyboard, RGB mousepad & Audio mixing console
    draw.rectangle([vdx + 70, vdy + 60, vdx + 250, vdy + 115], fill=(25, 30, 38))
    draw.rectangle([vdx + 90, vdy + 70, vdx + 175, vdy + 105], fill=(45, 52, 65)) # Keyboard
    draw.rectangle([vdx + 190, vdy + 68, vdx + 240, vdy + 108], fill=(35, 40, 50)) # Audio mixer with sliders
    
    # Ergonomic Mesh Studio Chairs
    for cx in [vdx + 80, vdx + 210]:
        # Chair shadow
        draw.ellipse([cx - 20, vdy + vdh + 35, cx + 20, vdy + vdh + 50], fill=(10, 14, 18))
        # 5-star caster base
        draw.line([cx - 18, vdy + vdh + 38, cx + 18, vdy + vdh + 38], fill=(60, 65, 75), width=3)
        draw.line([cx, vdy + vdh + 22, cx, vdy + vdh + 38], fill=(80, 85, 95), width=4)
        # Seat cushion
        draw.rectangle([cx - 18, vdy + vdh + 8, cx + 18, vdy + vdh + 22], fill=(40, 45, 55), outline=(60, 65, 75))
        # High mesh backrest
        draw.rectangle([cx - 16, vdy + vdh - 25, cx + 16, vdy + vdh + 8], fill=(30, 35, 45), outline=(56, 178, 172))
        
    # Podcast & Voiceover Recording Booth (Bottom Right)
    pbx, pby, pbw, pbh = 880, 500, 420, 200
    # Acoustic booth glass partition
    draw.rectangle([pbx, pby, pbx + pbw, pby + pbh], fill=(28, 34, 44), outline=(56, 178, 172), width=3)
    # Inside round discussion table
    draw.ellipse([pbx + 60, pby + 40, pbx + 260, pby + 160], fill=(55, 62, 75), outline=(75, 85, 100), width=2)
    # Broadcast boom arm microphones (Shure SM7B style)
    draw.line([pbx + 120, pby + 80, pbx + 150, pby + 60], fill=(20, 20, 25), width=3)
    draw.ellipse([pbx + 145, pby + 52, pbx + 160, pby + 68], fill=(30, 30, 35), outline=(70, 70, 80))
    draw.line([pbx + 200, pby + 120, pbx + 170, pby + 100], fill=(20, 20, 25), width=3)
    draw.ellipse([pbx + 160, pby + 92, pbx + 175, pby + 108], fill=(30, 30, 35), outline=(70, 70, 80))
    # Sound recording light ("ON AIR" glowing red badge)
    draw.rectangle([pbx + pbw - 110, pby + 15, pbx + pbw - 20, pby + 42], fill=(180, 20, 20), outline=(240, 100, 100), width=1)
    
    # IT Helpdesk Server Mini-Rack in Bottom-Left corner
    srx, sry, srw, srh = 80, 520, 100, 180
    draw.rectangle([srx, sry, srx + srw, sry + srh], fill=(22, 26, 32), outline=(50, 60, 75), width=2)
    # Server trays
    for u in range(sry + 15, sry + srh - 15, 20):
        draw.rectangle([srx + 8, u, srx + srw - 8, u + 16], fill=(32, 38, 48), outline=(45, 52, 65))
        # Activity LEDs
        draw.ellipse([srx + 15, u + 5, srx + 21, u + 11], fill=(56, 178, 172)) # Cyan LED
        draw.ellipse([srx + 25, u + 5, srx + 31, u + 11], fill=(72, 187, 120)) # Green LED
        draw.ellipse([srx + 35, u + 5, srx + 41, u + 11], fill=(237, 137, 54)) # Amber LED
        
    # Exit Portal Archway on Left Wall back to Main Hall
    draw.rectangle([16, wall_h + 80, 48, wall_h + 200], fill=(15, 20, 28), outline=(56, 178, 172), width=3)
    
    # Atmospheric Studio Lighting (Teal edge glow + Softbox beams)
    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    odraw = ImageDraw.Draw(overlay)
    # Green screen studio lighting glow
    odraw.ellipse([gs_x - 30, gs_y - 20, gs_x + gs_w + 30, wall_h + 80], fill=(0, 255, 100, 30))
    # Big LED Dashboard ambient cyan glow
    odraw.rectangle([dw_x - 20, dw_y - 20, dw_x + dw_w + 20, dw_y + dw_h + 40], fill=(56, 178, 172, 35))
    # Editing monitors glow
    odraw.ellipse([vdx + 50, vdy - 80, vdx + vdw - 50, vdy + 80], fill=(56, 178, 172, 45))
    
    im = Image.alpha_composite(im, overlay)
    return im.convert("RGB")

# ==============================================================================
# ROOM 3: SERVER DUNGEON (Gamma Subterranean Server Faults Bunker)
# ==============================================================================
def render_server_dungeon():
    im = create_steel_grate_floor(WIDTH, HEIGHT).convert("RGBA")
    draw = ImageDraw.Draw(im)
    
    wall_h = 240
    # Reinforced dark concrete bunker wall with steel support columns
    draw_wall_base(draw, wall_h, (15, 18, 22), (32, 36, 42), (80, 90, 100), (20, 22, 26))
    
    # Heavy I-beam steel columns along the back wall
    for bx in range(40, WIDTH, 160):
        draw.rectangle([bx, 32, bx + 24, wall_h], fill=(45, 50, 58), outline=(65, 72, 82), width=2)
        # Steel rivets
        for ry in range(48, wall_h - 10, 24):
            draw.ellipse([bx + 4, ry, bx + 10, ry + 6], fill=(85, 95, 105))
            draw.ellipse([bx + 14, ry, bx + 20, ry + 6], fill=(85, 95, 105))
            
    # Exposed overhead conduit pipes with warning hazard paint
    draw.rectangle([0, 55, WIDTH, 70], fill=(55, 60, 68)) # Main steam / coolant pipe
    draw.rectangle([0, 75, WIDTH, 85], fill=(35, 40, 48)) # Cable tray
    # Warning chevron stripe on main conduit
    for cx in range(0, WIDTH, 40):
        draw.polygon([(cx, 55), (cx + 20, 55), (cx + 35, 70), (cx + 15, 70)], fill=(230, 180, 20))
        
    # High-Density 42U Server Racks (Bank A: Left, Bank B: Right)
    rack_banks = [
        (100, wall_h + 30, 320, 150),
        (950, wall_h + 30, 320, 150)
    ]
    for rx, ry, rw, rh in rack_banks:
        # Shadow
        draw.rectangle([rx + 8, ry + 15, rx + rw + 8, ry + rh + 25], fill=(8, 10, 14))
        # Outer steel chassis frame
        draw.rectangle([rx, ry, rx + rw, ry + rh], fill=(24, 28, 34), outline=(50, 60, 70), width=3)
        # 4 rack bays in each bank
        bay_w = rw // 4
        for b in range(4):
            bx = rx + b * bay_w
            draw.rectangle([bx + 4, ry + 6, bx + bay_w - 4, ry + rh - 6], fill=(16, 18, 22), outline=(38, 44, 52))
            # Rack server chassis slots
            for sy in range(ry + 14, ry + rh - 14, 16):
                draw.rectangle([bx + 8, sy, bx + bay_w - 8, sy + 12], fill=(28, 32, 38))
                # Status lights (Server running / activity)
                led_col = (0, 255, 180) if (b + sy) % 3 == 0 else (255, 180, 0)
                draw.rectangle([bx + 12, sy + 3, bx + 16, sy + 7], fill=led_col)
                draw.rectangle([bx + 20, sy + 3, bx + 24, sy + 7], fill=(0, 220, 255))
                # Exhaust grill louvers
                draw.line([bx + 30, sy + 6, bx + bay_w - 12, sy + 6], fill=(12, 14, 18), width=1)
                
    # 3 BUG ANOMALY CONTAINMENT ZONES
    # Zone 1: NullPointerException Containment Chamber (Left Middle)
    np_x, np_y, np_w, np_h = 160, 480, 240, 180
    # Yellow hazard perimeter stripe
    draw.rectangle([np_x - 12, np_y - 12, np_x + np_w + 12, np_y + np_h + 12], outline=(230, 180, 20), width=4)
    # Heavy containment base
    draw.rectangle([np_x, np_y, np_x + np_w, np_y + np_h], fill=(20, 24, 32), outline=(0, 190, 255), width=2)
    # High-voltage laser containment pillars at corners
    for px, py in [(np_x, np_y), (np_x + np_w, np_y), (np_x, np_y + np_h), (np_x + np_w, np_y + np_h)]:
        draw.ellipse([px - 14, py - 14, px + 14, py + 14], fill=(45, 52, 65), outline=(0, 220, 255), width=2)
        draw.ellipse([px - 6, py - 6, px + 6, py + 6], fill=(0, 255, 255))
    # Glowing blue containment core with floating glitch anomaly
    draw.ellipse([np_x + 60, np_y + 40, np_x + np_w - 60, np_y + np_h - 40], fill=(0, 140, 240, 140), outline=(0, 255, 255), width=2)
    draw.rectangle([np_x + 95, np_y + 70, np_x + np_w - 95, np_y + np_h - 70], fill=(255, 255, 255), outline=(0, 200, 255))
    # Label plate: NullPointerException
    draw.rectangle([np_x + 30, np_y - 8, np_x + np_w - 30, np_y + 12], fill=(10, 12, 16), outline=(0, 200, 255))
    
    # Zone 2: Memory Leak Slime Containment Pool (Right Middle)
    ml_x, ml_y, ml_w, ml_h = 970, 480, 240, 180
    # Hazard border
    draw.rectangle([ml_x - 12, ml_y - 12, ml_x + ml_w + 12, ml_y + ml_h + 12], outline=(230, 180, 20), width=4)
    draw.rectangle([ml_x, ml_y, ml_x + ml_w, ml_y + ml_h], fill=(18, 26, 20), outline=(50, 205, 50), width=2)
    # Toxic emerald slime pool
    draw.ellipse([ml_x + 30, ml_y + 30, ml_x + ml_w - 30, ml_y + ml_h - 30], fill=(20, 160, 45, 180), outline=(70, 240, 90), width=3)
    # Slime bubbles
    for bx, by, br in [(ml_x + 80, ml_y + 80, 16), (ml_x + 150, ml_y + 100, 22), (ml_x + 120, ml_y + 60, 12)]:
        draw.ellipse([bx - br, by - br, bx + br, by + br], fill=(100, 255, 120), outline=(40, 180, 60))
    # Label plate: Memory Leak Anomaly
    draw.rectangle([ml_x + 30, ml_y - 8, ml_x + ml_w - 30, ml_y + 12], fill=(10, 16, 12), outline=(50, 205, 50))
    
    # Zone 3: Central Infinite Loop Matrix Core (Center Ground)
    cx, cy = 688, 570
    # Pulsing golden/magenta loop rings
    for r, col, w in [(90, (230, 180, 30), 4), (65, (215, 60, 180), 3), (40, (0, 220, 255), 3)]:
        draw.ellipse([cx - r, cy - r // 2, cx + r, cy + r // 2], outline=col, width=w)
    # Center infinity glyph marker
    draw.ellipse([cx - 16, cy - 8, cx + 16, cy + 8], fill=(255, 240, 120))
    
    # Main Central Terminal & Control Mainframe (Center Top Wall)
    tx, ty, tw, th = 510, wall_h - 40, 356, 180
    # Shadow
    draw.rectangle([tx + 8, ty + 20, tx + tw + 8, ty + th + 25], fill=(6, 8, 12))
    # Mainframe chassis
    draw.rectangle([tx, ty, tx + tw, ty + th], fill=(30, 35, 42), outline=(70, 80, 95), width=3)
    # Multi-screen CRT Bank
    # Main Screen (Green Phosphor Terminal)
    draw.rectangle([tx + 78, ty + 15, tx + tw - 78, ty + 100], fill=(10, 22, 14), outline=(35, 180, 75), width=2)
    # Diagnostic text lines
    for ly in range(ty + 25, ty + 90, 12):
        draw.line([tx + 90, ly, tx + tw - 90, ly], fill=(50, 220, 90), width=2)
    # Side Screen Left (CPU Activity Oscilloscope)
    draw.rectangle([tx + 16, ty + 25, tx + 68, ty + 90], fill=(15, 20, 28), outline=(0, 190, 240), width=1)
    draw.line([tx + 22, ty + 55, tx + 62, ty + 55], fill=(0, 220, 255), width=2)
    # Side Screen Right (Memory Gauge Matrix)
    draw.rectangle([tx + tw - 68, ty + 25, tx + tw - 16, ty + 90], fill=(25, 15, 20), outline=(240, 60, 60), width=1)
    draw.rectangle([tx + tw - 60, ty + 35, tx + tw - 24, ty + 80], fill=(220, 40, 40)) # 98% RAM Alert
    # Control deck with mechanical switches, levers & big red emergency killswitch
    draw.rectangle([tx + 20, ty + 110, tx + tw - 20, ty + 165], fill=(45, 52, 62), outline=(75, 85, 100))
    # Big Red Emergency Killswitch
    draw.ellipse([tx + tw // 2 - 18, ty + 125, tx + tw // 2 + 18, ty + 155], fill=(220, 20, 20), outline=(255, 100, 100), width=2)
    
    # Top Staircase Portal Archway up to Tech Lab (dever_lab)
    draw.rectangle([636, 90, 740, wall_h - 40], fill=(10, 12, 16), outline=(230, 180, 20), width=4)
    # Steel hazard stairs descending
    for sy in range(100, wall_h - 40, 14):
        draw.line([640, sy, 736, sy], fill=(65, 75, 88), width=3)
        
    # Dramatic Subterranean Lighting (Cyan / Red / Emerald Volumetric Glow)
    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    odraw = ImageDraw.Draw(overlay)
    # Blue laser glow over NullPointer
    odraw.ellipse([np_x - 30, np_y - 30, np_x + np_w + 30, np_y + np_h + 30], fill=(0, 180, 255, 50))
    # Emerald toxic glow over Memory Leak
    odraw.ellipse([ml_x - 30, ml_y - 30, ml_x + ml_w + 30, ml_y + ml_h + 30], fill=(50, 255, 80, 50))
    # Central loop golden pulse
    odraw.ellipse([cx - 120, cy - 70, cx + 120, cy + 70], fill=(255, 215, 50, 45))
    # Mainframe green phosphor reflection
    odraw.ellipse([tx + 30, ty + 40, tx + tw - 30, ty + 180], fill=(50, 220, 90, 40))
    
    im = Image.alpha_composite(im, overlay)
    return im.convert("RGB")

def main():
    os.makedirs('public', exist_ok=True)
    
    print("[Paint] Rendering Room 1: memory_room (Exhibition Gallery & Hall of Fame)...")
    mem_im = render_memory_room()
    mem_path = os.path.join('public', 'devertown_memory_room_v1.jpg')
    mem_im.save(mem_path, quality=95)
    print(f"[Done] Saved: {mem_path} ({os.path.getsize(mem_path)} bytes)")
    
    print("[Paint] Rendering Room 2: web_room (Web & Media Studio Hub)...")
    web_im = render_web_room()
    web_path = os.path.join('public', 'devertown_web_room_v1.jpg')
    web_im.save(web_path, quality=95)
    print(f"[Done] Saved: {web_path} ({os.path.getsize(web_path)} bytes)")
    
    print("[Paint] Rendering Room 3: server_dungeon (Subterranean Server Faults Bunker)...")
    srv_im = render_server_dungeon()
    srv_path = os.path.join('public', 'devertown_server_dungeon_v1.jpg')
    srv_im.save(srv_path, quality=95)
    print(f"[Done] Saved: {srv_path} ({os.path.getsize(srv_path)} bytes)")

if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""
Create npc_thuky_anh.png for Thư ký CLB Nguyễn Thị Ngọc Ánh (K20):
- Gather.town v2 chibi standard (48x64px per frame, 192x256px total).
- Female student, Áo Dài FPTU (Orange #EA580C with Navy #002147 trim, white silk trousers).
- Ponytail hair (Dark Charcoal #1E293B with Amber hairband #F26F21).
- Smart dev glasses (Silver/Gold thin rim), warm smiling face.
"""

from PIL import Image, ImageOps, ImageDraw
import numpy as np

# Load template female base & aodai
aodai_img = Image.open('/mnt/d/THStudy/DeverClub/DEVER_TOWN/public/assets/characters/outfits/full_aodai_fuda.png').convert('RGBA')
sample_female = Image.open('/mnt/d/THStudy/DeverClub/DEVER_TOWN/public/assets/characters/samples_v2/sample_fptu_female.png').convert('RGBA')

w, h = 192, 256
fw, fh = 48, 64

# We create the canvas
thuky_img = Image.new('RGBA', (w, h), (0, 0, 0, 0))

# 1. Base body and aodai outfit from full_aodai_fuda
thuky_img.paste(aodai_img, (0, 0))

# 2. Add smart glasses to Row 0 (Down/Front) and Row 1/2 (Left/Right)
# In front view (Row 0): add fine smart glasses on eyes (y ~ 24, x ~ 20..28)
draw = ImageDraw.Draw(thuky_img)

# Silver-amber thin rim glasses
glass_color = (226, 232, 240, 230)
glass_lens = (186, 230, 253, 110)

# Add glasses to Row 0 frames
for c in range(4):
    bx = c * fw
    by = 0
    # Left lens
    draw.rectangle([bx + 18, by + 22, bx + 22, by + 25], outline=glass_color, fill=glass_lens)
    # Right lens
    draw.rectangle([bx + 25, by + 22, bx + 29, by + 25], outline=glass_color, fill=glass_lens)
    # Bridge
    draw.line([bx + 22, by + 23, bx + 25, by + 23], fill=glass_color)

# Add glasses to Row 1 (Left facing)
for c in range(4):
    bx = c * fw
    by = 1 * fh
    # Side glass on visible left eye (x ~ 19..23, y ~ 22..25)
    draw.rectangle([bx + 17, by + 22, bx + 22, by + 25], outline=glass_color, fill=glass_lens)
    draw.line([bx + 22, by + 23, bx + 25, by + 23], fill=glass_color)

# Add glasses to Row 2 (Right facing)
for c in range(4):
    bx = c * fw
    by = 2 * fh
    # Side glass on visible right eye (x ~ 25..29, y ~ 22..25)
    draw.rectangle([bx + 25, by + 22, bx + 30, by + 25], outline=glass_color, fill=glass_lens)
    draw.line([bx + 22, by + 23, bx + 25, by + 23], fill=glass_color)

thuky_img.save('/mnt/d/THStudy/DeverClub/DEVER_TOWN/public/assets/characters/npcs/npc_thuky_anh.png', format='PNG')
print("Successfully generated public/assets/characters/npcs/npc_thuky_anh.png!")

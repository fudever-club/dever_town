#!/usr/bin/env python3
"""
FU-DEVER Spritesheet Direction Normalizer
Ensures 100% directional consistency for 4x4 Gather.town spritesheets:
- Row 0 (Y: 0..64): All 4 frames face DOWN (Front)
- Row 1 (Y: 64..128): All 4 frames face strictly LEFT (no rogue right frames)
- Row 2 (Y: 128..192): All 4 frames face strictly RIGHT (no rogue left frames)
- Row 3 (Y: 192..256): All 4 frames face UP (Back)
"""

import os
import sys
from PIL import Image, ImageOps
import numpy as np

def detect_facing_dir(cell_img):
    """
    Returns 'L' (Left), 'R' (Right), or 'C' (Center/Front/Back).
    Examines the head region (Y: 10..38) for skin tone or prominent asymmetric facial features.
    """
    arr = np.array(cell_img)
    if arr.shape[0] < 40 or arr.shape[1] < 40:
        return 'C'
    
    # Head slice
    head = arr[10:38, :, :]
    alpha = head[:, :, 3] > 60
    
    # Check skin / bright facial pixels (R > 150, G > 110, B > 80)
    skin_mask = alpha & (head[:, :, 0] > 150) & (head[:, :, 1] > 110) & (head[:, :, 2] > 80)
    y_pts, x_pts = np.where(skin_mask)
    
    if len(x_pts) < 15:
        # Check non-transparent foreground in head
        y_pts, x_pts = np.where(alpha)
        if len(x_pts) == 0:
            return 'C'
            
    left_count = np.sum(x_pts < 24)
    right_count = np.sum(x_pts >= 24)
    
    # Ratio test
    ratio = max(left_count, right_count) / (min(left_count, right_count) + 1)
    if ratio < 1.3:
        return 'C'
    return 'L' if left_count > right_count else 'R'

def normalize_spritesheet(filepath):
    img = Image.open(filepath).convert('RGBA')
    w, h = img.size
    if w != 192 or h != 256:
        print(f"Skipping {filepath}: unexpected size {w}x{h}")
        return False
        
    fw, fh = 48, 64
    rows = []
    for r in range(4):
        cols = [img.crop((c*fw, r*fh, (c+1)*fw, (r+1)*fh)) for c in range(4)]
        rows.append(cols)
        
    r1_cols = rows[1] # Expected LEFT
    r2_cols = rows[2] # Expected RIGHT
    
    r1_dirs = [detect_facing_dir(c) for c in r1_cols]
    r2_dirs = [detect_facing_dir(c) for c in r2_cols]
    
    # Identify clean left and right frames across Row 1 and Row 2
    all_left_frames = []
    all_right_frames = []
    
    for c, d in zip(r1_cols, r1_dirs):
        if d == 'L':
            all_left_frames.append(c)
        elif d == 'R':
            all_right_frames.append(c)
            
    for c, d in zip(r2_cols, r2_dirs):
        if d == 'L':
            all_left_frames.append(c)
        elif d == 'R':
            all_right_frames.append(c)
            
    # Process Row 1: ensure all 4 frames face LEFT
    new_r1 = []
    for idx in range(4):
        cell = r1_cols[idx]
        d = r1_dirs[idx]
        if d == 'R':
            # It's facing right! Mirror it to face left
            new_r1.append(ImageOps.mirror(cell))
        else:
            new_r1.append(cell)
            
    # Process Row 2: ensure all 4 frames face RIGHT
    new_r2 = []
    for idx in range(4):
        cell = r2_cols[idx]
        d = r2_dirs[idx]
        if d == 'L':
            # It's facing left! Mirror it to face right
            new_r2.append(ImageOps.mirror(cell))
        else:
            new_r2.append(cell)
            
    # Verification: check if new_r1 and new_r2 are 100% correct
    v1 = [detect_facing_dir(c) for c in new_r1]
    v2 = [detect_facing_dir(c) for c in new_r2]
    
    # If Row 2 still has ambiguity or lacks symmetry, mirror new_r1 for perfect fidelity
    if any(d == 'L' for d in v2) or any(d == 'R' for d in v1):
        for idx in range(4):
            new_r2[idx] = ImageOps.mirror(new_r1[idx])
            
    # Build output image
    out_img = Image.new('RGBA', (192, 256), (0, 0, 0, 0))
    # Row 0
    for c in range(4):
        out_img.paste(rows[0][c], (c*fw, 0))
    # Row 1
    for c in range(4):
        out_img.paste(new_r1[c], (c*fw, 1*fh))
    # Row 2
    for c in range(4):
        out_img.paste(new_r2[c], (c*fw, 2*fh))
    # Row 3
    for c in range(4):
        out_img.paste(rows[3][c], (c*fw, 3*fh))
        
    out_img.save(filepath, format='PNG')
    final_v1 = [detect_facing_dir(out_img.crop((c*fw, 64, (c+1)*fw, 128))) for c in range(4)]
    final_v2 = [detect_facing_dir(out_img.crop((c*fw, 128, (c+1)*fw, 192))) for c in range(4)]
    print(f"Fixed {os.path.basename(filepath)}: Row 1={final_v1}, Row 2={final_v2}")
    return True

if __name__ == '__main__':
    target_dirs = [
        '/mnt/d/THStudy/DeverClub/DEVER_TOWN/public/assets/characters/samples_v2',
        '/mnt/d/THStudy/DeverClub/DEVER_TOWN/public/assets/characters/npcs',
        '/mnt/d/THStudy/DeverClub/DEVER_TOWN/public/assets/characters/outfits',
        '/mnt/d/THStudy/DeverClub/DEVER_TOWN/public/assets/characters/special_outfits',
        '/mnt/d/THStudy/DeverClub/DEVER_TOWN/public/assets/characters/bases'
    ]
    total_fixed = 0
    for d in target_dirs:
        if not os.path.exists(d): continue
        for fname in sorted(os.listdir(d)):
            if fname.endswith('.png'):
                fp = os.path.join(d, fname)
                if normalize_spritesheet(fp):
                    total_fixed += 1
    print(f"\nSuccessfully normalized {total_fixed} spritesheets!")

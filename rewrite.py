import os
import re

file_path = r'D:\THStudy\DeverClub\DEVER_TOWN\src\utils\TextureGenerator.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Split at static generateCharacterSpritesheet(scene, config) {
parts = content.split("static generateCharacterSpritesheet(scene, config) {")
if len(parts) != 2:
    print("Could not find split point")
    exit(1)

new_code = """static generateCharacterSpritesheet(scene, config) {
    const frameW = 48;
    const frameH = 64;
    const cols = 4;
    const rows = 4;

    const canvas = document.createElement('canvas');
    canvas.width = frameW * cols;
    canvas.height = frameH * rows;
    const ctx = canvas.getContext('2d');

    const directions = ['down', 'left', 'right', 'up'];

    for (let r = 0; r < rows; r++) {
      const dir = directions[r];
      for (let c = 0; c < cols; c++) {
        const frameX = c * frameW;
        const frameY = r * frameH;
        this.drawCharacterFrame(ctx, frameX, frameY, dir, c, config);
      }
    }

    const key = `char_${config.id}`;
    if (scene.textures.exists(key)) {
      scene.textures.remove(key);
    }

    scene.textures.addSpriteSheet(key, canvas, {
      frameWidth: frameW,
      frameHeight: frameH
    });

    this.createCharacterAnimations(scene, config.id);
  }

  static generateCustomAvatar(scene, wardrobeConfig, textureKey) {
    if (!wardrobeConfig || typeof wardrobeConfig !== 'object') return null;

    const frameW = 48;
    const frameH = 64;
    const cols = 4;
    const rows = 4;

    const canvas = document.createElement('canvas');
    canvas.width = frameW * cols;
    canvas.height = frameH * rows;
    const ctx = canvas.getContext('2d');

    const config = {
      gender: wardrobeConfig.gender || 'male',
      hairstyle: wardrobeConfig.hairstyle || (wardrobeConfig.gender === 'female' ? 'long' : 'short'),
      hair: wardrobeConfig.hairColor || '#0f172a',
      skin: wardrobeConfig.skinColor || wardrobeConfig.skin || '#fbd1a2',
      skinTone: wardrobeConfig.skinTone || 'skin_natural',
      facialHair: wardrobeConfig.facialHair || 'none',
      expression: wardrobeConfig.expression || 'expr_focus',
      outfitType: wardrobeConfig.outfitType || 'hoodie',
      shirt: wardrobeConfig.hoodieColor || wardrobeConfig.outfitColor || '#f26f21',
      collarColor: wardrobeConfig.collarColor || '#002147',
      pants: wardrobeConfig.pantsColor || (wardrobeConfig.outfitType === 'aodai' ? '#ffffff' : (wardrobeConfig.outfitType === 'dress' || wardrobeConfig.outfitType === 'sailor' ? '#38bdf8' : '#1e293b')),
      accessory: wardrobeConfig.accessory || 'none',
      inHandItem: wardrobeConfig.inHandItem || wardrobeConfig.equippedItemId || null
    };

    const directions = ['down', 'left', 'right', 'up'];
    for (let r = 0; r < rows; r++) {
      const dir = directions[r];
      for (let c = 0; c < cols; c++) {
        this.drawCharacterFrame(ctx, c * frameW, r * frameH, dir, c, config);
      }
    }

    const actualKey = scene.textures.exists(textureKey)
      ? `${textureKey}_v${Date.now()}`
      : textureKey;

    scene.textures.addSpriteSheet(actualKey, canvas, {
      frameWidth: frameW,
      frameHeight: frameH
    });

    this.createCharacterAnimations(scene, actualKey.replace('char_', ''));

    if (!TextureGenerator._keyRegistry) TextureGenerator._keyRegistry = {};
    TextureGenerator._keyRegistry[textureKey] = actualKey;

    return actualKey;
  }

  static getActualKey(logicalKey) {
    if (TextureGenerator._keyRegistry && TextureGenerator._keyRegistry[logicalKey]) {
      return TextureGenerator._keyRegistry[logicalKey];
    }
    return logicalKey;
  }

  static cleanupOldKey(scene, logicalKey, oldKey) {
    if (oldKey && oldKey !== logicalKey && scene.textures.exists(oldKey)) {
      scene.textures.remove(oldKey);
    }
  }

  static drawCharacterFrame(ctx, x, y, direction, frameIndex, config) {
    const {
      gender = 'male',
      hairstyle = (gender === 'female' ? 'long' : 'short'),
      hair = '#0f172a',
      skin = '#fbd1a2',
      skinTone = 'skin_natural',
      facialHair = 'none',
      expression = 'expr_focus',
      outfitType = 'hoodie',
      shirt = '#f26f21',
      collarColor = '#002147',
      pants = '#1e293b',
      accessory = 'none',
      inHandItem = null
    } = config;

    const skinMap = {
      skin_fair: { base: '#fed7aa', highlight: '#ffedd5', shadow: '#fdba74' },
      skin_natural: { base: '#fbd1a2', highlight: '#fde68a', shadow: '#f59e0b' },
      skin_tan: { base: '#d97706', highlight: '#f59e0b', shadow: '#b45309' },
      skin_deep: { base: '#92400e', highlight: '#b45309', shadow: '#78350f' },
      skin_ebony: { base: '#573016', highlight: '#78350f', shadow: '#3b1d08' },
      skin_cyber: { base: '#bae6fd', highlight: '#e0f2fe', shadow: '#7dd3fc' }
    };
    const activeSkin = skinMap[skinTone] || { base: skin, highlight: skin, shadow: skin };

    ctx.clearRect(x, y, 48, 64);

    // 1. Shadow ellipse (x+24, y+60, rx=16, ry=5)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x + 24, y + 60, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Leg offset logic for walk animation
    // Frame 0: idle
    // Frame 1: left leg fwd, right leg back -> diff logic
    // Frame 2: idle
    // Frame 3: right leg fwd, left leg back
    let leftLegOffset = 0;
    let rightLegOffset = 0;
    
    if (direction === 'left' || direction === 'right') {
        if (frameIndex === 1) { leftLegOffset = -4; rightLegOffset = 4; }
        else if (frameIndex === 3) { leftLegOffset = 4; rightLegOffset = -4; }
    } else {
        if (frameIndex === 1) { leftLegOffset = -2; rightLegOffset = 2; }
        else if (frameIndex === 3) { leftLegOffset = 2; rightLegOffset = -2; }
    }

    // --- LEGS & SHOES ---
    // Legs: 2 separate legs 6px wide each, y+45 to y+58
    // Shoes: y+58 to y+64
    
    // Draw legs
    if (outfitType === 'aodai') {
        ctx.fillStyle = '#ffffff';
        if (direction === 'left' || direction === 'right') {
            ctx.fillRect(x + 21 + (frameIndex % 2 === 1 ? -3 : 0), y + 45, 6, 13);
        } else {
            ctx.fillRect(x + 16, y + 45 + leftLegOffset, 6, 13);
            ctx.fillRect(x + 26, y + 45 + rightLegOffset, 6, 13);
        }
    } else if (outfitType === 'croptop' || outfitType === 'dress' || outfitType === 'sailor' || outfitType === 'yukata') {
        ctx.fillStyle = skin;
        if (direction === 'left' || direction === 'right') {
            ctx.fillRect(x + 21 + (frameIndex % 2 === 1 ? -2 : 0), y + 45, 6, 13);
        } else {
            ctx.fillRect(x + 16, y + 45 + leftLegOffset, 6, 13);
            ctx.fillRect(x + 26, y + 45 + rightLegOffset, 6, 13);
        }
    } else {
        ctx.fillStyle = pants;
        if (direction === 'left' || direction === 'right') {
            ctx.fillRect(x + 21 + (frameIndex % 2 === 1 ? -3 : 0), y + 45, 6, 13);
        } else {
            ctx.fillRect(x + 16, y + 45 + leftLegOffset, 6, 13);
            ctx.fillRect(x + 26, y + 45 + rightLegOffset, 6, 13);
        }
    }

    // Draw shoes (y+58 to y+64, 2-tone)
    ctx.fillStyle = '#0f172a';
    ctx.fillStyle = (outfitType === 'aodai' || outfitType === 'suit') ? '#000000' : '#1e293b';
    const soleColor = '#475569';
    if (direction === 'left' || direction === 'right') {
        let lx = x + 21 + (frameIndex % 2 === 1 ? -3 : 0);
        ctx.fillRect(lx, y + 58, 8, 4);
        ctx.fillStyle = soleColor;
        ctx.fillRect(lx, y + 62, 8, 2);
    } else {
        ctx.fillRect(x + 15, y + 58 + leftLegOffset, 8, 4);
        ctx.fillRect(x + 25, y + 58 + rightLegOffset, 8, 4);
        ctx.fillStyle = soleColor;
        ctx.fillRect(x + 15, y + 62 + leftLegOffset, 8, 2);
        ctx.fillRect(x + 25, y + 62 + rightLegOffset, 8, 2);
    }

    // --- LOWER BODY / OUTFIT SKIRT (if applicable) ---
    if (outfitType === 'aodai') {
        ctx.fillStyle = shirt;
        if (direction === 'down' || direction === 'up') {
            ctx.fillRect(x + 13, y + 27, 22, 22);
            // Xẻ tà
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.fillRect(x + 23, y + 35, 2, 14);
        } else if (direction === 'left' || direction === 'right') {
            ctx.fillRect(x + 16, y + 27, 16, 22);
        }
    } else if (outfitType === 'dress' || outfitType === 'sailor' || outfitType === 'yukata') {
        ctx.fillStyle = shirt;
        ctx.fillRect(x + 13, y + 36, 22, 12);
        if (outfitType === 'sailor') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + 13, y + 45, 22, 2);
        } else if (outfitType === 'yukata') {
            ctx.fillStyle = collarColor;
            ctx.fillRect(x + 13, y + 36, 22, 4);
        }
    } else if (outfitType === 'wizard' || outfitType === 'cardigan' || outfitType === 'martial') {
        ctx.fillStyle = shirt;
        ctx.fillRect(x + 13, y + 36, 22, 12);
        if (outfitType === 'martial') {
            ctx.fillStyle = collarColor;
            ctx.fillRect(x + 13, y + 38, 22, 3);
        }
    } else if (outfitType === 'croptop') {
        ctx.fillStyle = pants;
        ctx.fillRect(x + 15, y + 40, 18, 6);
    } else {
        ctx.fillStyle = pants;
        ctx.fillRect(x + 15, y + 42, 18, 5);
    }

    // --- TORSO / SHIRT ---
    // y+27 to y+44 (18px)
    ctx.fillStyle = shirt;
    ctx.fillRect(x + 14, y + 27, 20, 15);
    if (outfitType === 'croptop') {
        ctx.fillStyle = activeSkin.base;
        ctx.fillRect(x + 15, y + 36, 18, 4);
    }

    // Details on Torso
    if (outfitType === 'polo') {
        ctx.fillStyle = collarColor;
        ctx.fillRect(x + 21, y + 27, 6, 4);
        ctx.fillRect(x + 23, y + 31, 2, 4);
    } else if (outfitType === 'sailor') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 16, y + 27, 16, 3);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(x + 22, y + 30, 4, 4);
    } else if (outfitType === 'suit') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 21, y + 27, 6, 8);
        ctx.fillStyle = collarColor;
        ctx.fillRect(x + 23, y + 28, 2, 7);
    } else if (outfitType === 'jersey') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 20, y + 30, 8, 8);
        ctx.fillStyle = shirt;
        ctx.fillRect(x + 22, y + 32, 4, 4);
    } else if (outfitType === 'bomber' || outfitType === 'biker') {
        ctx.fillStyle = collarColor;
        ctx.fillRect(x + 23, y + 27, 2, 15);
    } else if (outfitType === 'barista') {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(x + 16, y + 28, 16, 14);
        ctx.fillStyle = collarColor;
        ctx.fillRect(x + 21, y + 31, 6, 4);
    } else if (outfitType === 'mecha') {
        ctx.fillStyle = collarColor;
        ctx.fillRect(x + 20, y + 30, 8, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 22, y + 32, 4, 2);
    } else if (outfitType === 'frog') {
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(x + 18, y + 30, 12, 10);
    }

    // --- ARMS WITH SWING LOGIC ---
    // ARM SWING LOGIC:
    // direction === 'down' || 'up':
    // Frame 0: left arm x+8, y+28; right arm x+32, y+28 (both thả dọc)
    // Frame 1: left arm x+6, y+26; right arm x+34, y+30 (right arm fwd)
    // Frame 2: same as frame 0
    // Frame 3: left arm x+6, y+30; right arm x+34, y+26 (left arm fwd)
    const isShortSleeve = ['tee', 'dress', 'croptop', 'polo'].includes(outfitType);
    let lArmX, lArmY, rArmX, rArmY;
    let lArmW = 6, lArmH = 16, rArmW = 6, rArmH = 16;
    
    if (direction === 'down' || direction === 'up') {
        if (frameIndex === 0 || frameIndex === 2) {
            lArmX = x + 8; lArmY = y + 28;
            rArmX = x + 34; rArmY = y + 28;
        } else if (frameIndex === 1) {
            lArmX = x + 6; lArmY = y + 26; lArmH = 18;
            rArmX = x + 36; rArmY = y + 30; rArmH = 14;
        } else if (frameIndex === 3) {
            lArmX = x + 6; lArmY = y + 30; lArmH = 14;
            rArmX = x + 36; rArmY = y + 26; rArmH = 18;
        }
    } else if (direction === 'left') {
        if (frameIndex === 0 || frameIndex === 2) {
            lArmX = x + 20; lArmY = y + 28; lArmW = 8; lArmH = 16;
        } else if (frameIndex === 1) {
            lArmX = x + 16; lArmY = y + 26; lArmW = 10; lArmH = 18;
        } else if (frameIndex === 3) {
            lArmX = x + 22; lArmY = y + 30; lArmW = 8; lArmH = 14;
        }
    } else if (direction === 'right') {
        if (frameIndex === 0 || frameIndex === 2) {
            rArmX = x + 20; rArmY = y + 28; rArmW = 8; rArmH = 16;
        } else if (frameIndex === 1) {
            rArmX = x + 22; rArmY = y + 30; rArmW = 8; rArmH = 14;
        } else if (frameIndex === 3) {
            rArmX = x + 16; rArmY = y + 26; rArmW = 10; rArmH = 18;
        }
    }

    const drawArm = (ax, ay, aw, ah, side) => {
        if (!ax) return;
        ctx.fillStyle = shirt;
        if (isShortSleeve) {
            ctx.fillRect(ax, ay, aw, ah/2);
            ctx.fillStyle = activeSkin.base;
            ctx.fillRect(ax, ay + ah/2, aw, ah/2);
        } else {
            ctx.fillRect(ax, ay, aw, ah);
            // hand
            ctx.fillStyle = activeSkin.base;
            ctx.fillRect(ax + 1, ay + ah, aw - 2, 4);
        }
    };

    if (direction !== 'left') drawArm(rArmX, rArmY, rArmW, rArmH, 'right');
    if (direction !== 'right') drawArm(lArmX, lArmY, lArmW, lArmH, 'left');

    // --- HEAD SKIN BASE ---
    // y+6 to y+20, 14px wide centered at x+24 (x+17 to x+31)
    ctx.fillStyle = activeSkin.base;
    ctx.fillRect(x + 17, y + 6, 14, 14);
    ctx.fillStyle = activeSkin.shadow;
    ctx.fillRect(x + 17, y + 18, 14, 2); // jaw shadow

    // --- FACE FEATURES ---
    // Eyes: 3x2, Catchlight: 1x1, Mouth: 4x1, Nose: 1x1
    ctx.fillStyle = '#0f172a';
    if (direction === 'down') {
        if (expression === 'expr_smile') {
            ctx.fillRect(x + 19, y + 11, 3, 1);
            ctx.fillRect(x + 26, y + 11, 3, 1);
            ctx.fillRect(x + 18, y + 12, 1, 1);
            ctx.fillRect(x + 22, y + 12, 1, 1);
            ctx.fillRect(x + 25, y + 12, 1, 1);
            ctx.fillRect(x + 29, y + 12, 1, 1);
        } else if (expression === 'expr_cool') {
            ctx.fillRect(x + 19, y + 11, 3, 2);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + 19, y + 11, 1, 1);
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(x + 26, y + 11, 3, 1);
        } else if (expression === 'expr_shock') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + 18, y + 10, 4, 4);
            ctx.fillRect(x + 26, y + 10, 4, 4);
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(x + 19, y + 11, 2, 2);
            ctx.fillRect(x + 27, y + 11, 2, 2);
        } else if (expression === 'expr_chill') {
            ctx.fillRect(x + 19, y + 12, 3, 1);
            ctx.fillRect(x + 26, y + 12, 3, 1);
        } else {
            ctx.fillRect(x + 19, y + 11, 3, 2);
            ctx.fillRect(x + 26, y + 11, 3, 2);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + 19, y + 11, 1, 1);
            ctx.fillRect(x + 26, y + 11, 1, 1);
        }
        
        // Nose dot
        ctx.fillStyle = activeSkin.shadow;
        ctx.fillRect(x + 23, y + 14, 1, 1);

        // Mouth
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 22, y + 16, 4, 1);

        if (gender === 'female') {
            ctx.fillStyle = '#f472b6';
            ctx.fillRect(x + 17, y + 13, 2, 2);
            ctx.fillRect(x + 29, y + 13, 2, 2);
        }
    } else if (direction === 'left') {
        ctx.fillRect(x + 17, y + 11, 3, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 17, y + 11, 1, 1);
        ctx.fillStyle = activeSkin.shadow;
        ctx.fillRect(x + 16, y + 14, 1, 1);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 16, y + 16, 2, 1);
    } else if (direction === 'right') {
        ctx.fillRect(x + 28, y + 11, 3, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 30, y + 11, 1, 1);
        ctx.fillStyle = activeSkin.shadow;
        ctx.fillRect(x + 31, y + 14, 1, 1);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 30, y + 16, 2, 1);
    }

    // --- FACIAL HAIR ---
    if (facialHair && facialHair !== 'none' && direction !== 'up') {
        const beardColor = facialHair === 'grey_beard' ? '#94a3b8' : hair;
        ctx.fillStyle = beardColor;
        if (facialHair === 'full_beard' || facialHair === 'grey_beard') {
            if (direction === 'down') {
                ctx.fillRect(x + 17, y + 13, 2, 5);
                ctx.fillRect(x + 29, y + 13, 2, 5);
                ctx.fillRect(x + 19, y + 17, 10, 3);
            } else if (direction === 'left') {
                ctx.fillRect(x + 16, y + 13, 4, 5);
                ctx.fillRect(x + 18, y + 17, 6, 3);
            } else if (direction === 'right') {
                ctx.fillRect(x + 28, y + 13, 4, 5);
                ctx.fillRect(x + 24, y + 17, 6, 3);
            }
        } else if (facialHair === 'mustache') {
            if (direction === 'down') {
                ctx.fillRect(x + 20, y + 15, 8, 1);
            } else if (direction === 'left') {
                ctx.fillRect(x + 16, y + 15, 4, 1);
            } else if (direction === 'right') {
                ctx.fillRect(x + 28, y + 15, 4, 1);
            }
        } else if (facialHair === 'goatee') {
            if (direction === 'down') {
                ctx.fillRect(x + 22, y + 17, 4, 2);
            } else if (direction === 'left') {
                ctx.fillRect(x + 17, y + 17, 3, 2);
            } else if (direction === 'right') {
                ctx.fillRect(x + 28, y + 17, 3, 2);
            }
        } else if (facialHair === 'stubble') {
            ctx.fillStyle = 'rgba(30, 41, 59, 0.45)';
            if (direction === 'down') {
                ctx.fillRect(x + 18, y + 16, 12, 3);
            } else if (direction === 'left') {
                ctx.fillRect(x + 17, y + 16, 6, 3);
            } else if (direction === 'right') {
                ctx.fillRect(x + 25, y + 16, 6, 3);
            }
        }
    }

    // --- HAIRSTYLES ---
    ctx.fillStyle = hair;
    // Scale hair from 32x32 to 48x64. (approx * 1.5 in width, and * 1.5-2 in height)
    // Let's implement generic scaling for hair to fit x+14 to x+34, y+2 to y+24
    if (hairstyle === 'long') {
        if (direction === 'down') {
            ctx.fillRect(x + 15, y + 4, 18, 6);
            ctx.fillRect(x + 14, y + 8, 4, 18);
            ctx.fillRect(x + 30, y + 8, 4, 18);
        } else if (direction === 'up') {
            ctx.fillRect(x + 14, y + 4, 20, 22);
        } else if (direction === 'left') {
            ctx.fillRect(x + 15, y + 4, 18, 6);
            ctx.fillRect(x + 25, y + 7, 7, 19);
        } else if (direction === 'right') {
            ctx.fillRect(x + 15, y + 4, 18, 6);
            ctx.fillRect(x + 16, y + 7, 7, 19);
        }
    } else if (hairstyle === 'ponytail') {
        if (direction === 'down') {
            ctx.fillRect(x + 15, y + 4, 18, 6);
            ctx.fillRect(x + 15, y + 8, 3, 6);
            ctx.fillRect(x + 30, y + 8, 3, 6);
            ctx.fillRect(x + 32, y + 4, 5, 10);
        } else if (direction === 'up') {
            ctx.fillRect(x + 15, y + 4, 18, 12);
            ctx.fillRect(x + 22, y + 1, 4, 10);
        } else if (direction === 'left') {
            ctx.fillRect(x + 15, y + 4, 18, 6);
            ctx.fillRect(x + 31, y + 6, 6, 9);
        } else if (direction === 'right') {
            ctx.fillRect(x + 15, y + 4, 18, 6);
            ctx.fillRect(x + 11, y + 6, 6, 9);
        }
    } else if (hairstyle === 'twintails') {
        if (direction === 'down' || direction === 'up') {
            ctx.fillRect(x + 15, y + 4, 18, 6);
            if (direction === 'up') ctx.fillRect(x + 14, y + 4, 20, 12);
            ctx.fillRect(x + 10, y + 6, 5, 14);
            ctx.fillRect(x + 33, y + 6, 5, 14);
        } else if (direction === 'left') {
            ctx.fillRect(x + 15, y + 4, 18, 6);
            ctx.fillRect(x + 29, y + 6, 6, 14);
        } else if (direction === 'right') {
            ctx.fillRect(x + 15, y + 4, 18, 6);
            ctx.fillRect(x + 13, y + 6, 6, 14);
        }
    } else if (hairstyle === 'bob') {
        if (direction === 'down') {
            ctx.fillRect(x + 15, y + 4, 18, 6);
            ctx.fillRect(x + 14, y + 8, 4, 10);
            ctx.fillRect(x + 30, y + 8, 4, 10);
        } else if (direction === 'up') {
            ctx.fillRect(x + 14, y + 4, 20, 14);
        } else if (direction === 'left') {
            ctx.fillRect(x + 15, y + 4, 18, 6);
            ctx.fillRect(x + 24, y + 8, 7, 10);
        } else if (direction === 'right') {
            ctx.fillRect(x + 15, y + 4, 18, 6);
            ctx.fillRect(x + 17, y + 8, 7, 10);
        }
    } else if (hairstyle === 'space_buns') {
        if (direction === 'down' || direction === 'up') {
            ctx.fillRect(x + 15, y + 4, 18, 6);
            ctx.fillRect(x + 12, y + 1, 6, 6);
            ctx.fillRect(x + 30, y + 1, 6, 6);
        } else if (direction === 'left') {
            ctx.fillRect(x + 15, y + 4, 18, 6);
            ctx.fillRect(x + 27, y + 1, 6, 6);
        } else if (direction === 'right') {
            ctx.fillRect(x + 15, y + 4, 18, 6);
            ctx.fillRect(x + 15, y + 1, 6, 6);
        }
    } else if (hairstyle === 'bald_professor') {
        if (direction === 'down') {
            ctx.fillRect(x + 14, y + 8, 4, 9);
            ctx.fillRect(x + 30, y + 8, 4, 9);
            ctx.fillRect(x + 13, y + 11, 3, 6);
            ctx.fillRect(x + 32, y + 11, 3, 6);
        } else if (direction === 'up') {
            ctx.fillRect(x + 14, y + 8, 20, 12);
            ctx.fillStyle = activeSkin.base;
            ctx.fillRect(x + 18, y + 6, 12, 6);
            ctx.fillStyle = hair;
        } else if (direction === 'left') {
            ctx.fillRect(x + 24, y + 7, 8, 12);
            ctx.fillRect(x + 21, y + 11, 6, 7);
        } else if (direction === 'right') {
            ctx.fillRect(x + 16, y + 7, 8, 12);
            ctx.fillRect(x + 21, y + 11, 6, 7);
        }
    } else {
        // Default short crop
        if (direction === 'down') {
            ctx.fillRect(x + 15, y + 4, 18, 6);
            ctx.fillRect(x + 15, y + 8, 3, 5);
            ctx.fillRect(x + 30, y + 8, 3, 5);
        } else if (direction === 'up') {
            ctx.fillRect(x + 15, y + 4, 18, 14);
        } else if (direction === 'left') {
            ctx.fillRect(x + 15, y + 4, 18, 6);
            ctx.fillRect(x + 25, y + 8, 6, 7);
        } else if (direction === 'right') {
            ctx.fillRect(x + 15, y + 4, 18, 6);
            ctx.fillRect(x + 17, y + 8, 6, 7);
        }
    }

    // --- ACCESSORIES ---
    if (accessory === 'glasses_smart' && direction !== 'up') {
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 18, y + 10, 5, 4);
        ctx.strokeRect(x + 25, y + 10, 5, 4);
        ctx.fillRect(x + 23, y + 11, 2, 1);
    } else if (accessory === 'sunglasses_cool' && direction !== 'up') {
        ctx.fillStyle = '#18181b';
        ctx.fillRect(x + 18, y + 10, 6, 4);
        ctx.fillRect(x + 24, y + 10, 6, 4);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x + 20, y + 10, 2, 2);
        ctx.fillRect(x + 26, y + 10, 2, 2);
    } else if (accessory === 'headphones_rgb') {
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(x + 14, y + 10, 3, 7);
        ctx.fillRect(x + 31, y + 10, 3, 7);
        ctx.fillRect(x + 15, y + 3, 18, 3);
    } else if (accessory === 'cat_ears') {
        ctx.fillStyle = '#f472b6';
        ctx.fillRect(x + 15, y + 1, 4, 4);
        ctx.fillRect(x + 29, y + 1, 4, 4);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 16, y + 2, 2, 2);
        ctx.fillRect(x + 30, y + 2, 2, 2);
    } else if (accessory === 'frog_crown') {
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(x + 18, y + 1, 12, 4);
        ctx.fillRect(x + 17, y + 1, 3, 3);
        ctx.fillRect(x + 28, y + 1, 3, 3);
        ctx.fillRect(x + 23, y + 0, 3, 3);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(x + 23, y + 3, 3, 2);
    }

    // --- IN-HAND ITEMS ---
    if (inHandItem && inHandItem !== 'none') {
        this.drawInHandEquipment(ctx, x, y, direction, frameIndex, inHandItem, leftLegOffset);
    }
  }

  static drawInHandEquipment(ctx, x, y, direction, frameIndex, itemId, legOffset = 0) {
    if (!itemId || itemId === 'none') return;

    ctx.save();
    if (itemId === 'macbook_dev') {
      if (direction === 'down') {
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(x + 15, y + 25, 18, 10);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x + 16, y + 26, 16, 7);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 23, y + 29, 2, 2);
        ctx.fillStyle = '#fbd1a2';
        ctx.fillRect(x + 14, y + 28, 3, 4);
        ctx.fillRect(x + 31, y + 28, 3, 4);
      } else if (direction === 'left') {
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(x + 16, y + 25, 7, 10);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x + 15, y + 26, 2, 7);
      } else if (direction === 'right') {
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(x + 25, y + 25, 7, 10);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x + 31, y + 26, 2, 7);
      } else if (direction === 'up') {
        ctx.fillStyle = '#64748b';
        ctx.fillRect(x + 16, y + 27, 16, 9);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(x + 23, y + 30, 2, 2);
      }
    } else if (itemId === 'danang_salt_coffee' || itemId === 'thermos_coffee') {
      const cupX = direction === 'left' ? x + 12 : x + 31;
      const cupY = y + 25;
      ctx.fillStyle = itemId === 'danang_salt_coffee' ? '#78350f' : '#f59e0b';
      ctx.fillRect(cupX, cupY, 6, 9);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(cupX - 1, cupY - 1, 8, 3);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillRect(cupX + 1, cupY - 6, 2, 3);
      ctx.fillRect(cupX + 4, cupY - 9, 2, 3);
    } else if (itemId === 'golden_frog_plush') {
      if (direction !== 'up') {
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(x + 24, y + 27, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(x + 22, y + 18, 3, 3);
      }
    } else if (itemId === 'football_ball' || itemId === 'basketball_ball') {
      const ballX = direction === 'left' ? x + 10 : x + 38;
      const ballY = y + 28;
      ctx.fillStyle = itemId === 'basketball_ball' ? '#ea580c' : '#ffffff';
      ctx.beginPath();
      ctx.arc(ballX, ballY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (itemId === 'dever_flag') {
      const flagX = direction === 'left' ? x + 10 : x + 38;
      ctx.fillStyle = '#78350f';
      ctx.fillRect(flagX, y + 4, 3, 30);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(flagX + (direction === 'left' ? -12 : 3), y + 4, 12, 9);
    }
    ctx.restore();
  }

  static createCharacterAnimations(scene, avatarId) {
    if (!scene || !scene.anims) return;
    const key = `char_${avatarId}`;
    const dirs = [
      { name: 'down', row: 0 },
      { name: 'left', row: 1 },
      { name: 'right', row: 2 },
      { name: 'up', row: 3 }
    ];

    dirs.forEach(({ name, row }) => {
      const baseFrame = row * 4;

      const walkKey = `walk_${name}_${avatarId}`;
      if (scene.anims.exists(walkKey)) scene.anims.remove(walkKey);
      scene.anims.create({
        key: walkKey,
        frames: scene.anims.generateFrameNumbers(key, {
          frames: [baseFrame, baseFrame + 1, baseFrame + 2, baseFrame + 3]
        }),
        frameRate: 8,
        repeat: -1
      });

      const idleKey = `idle_${name}_${avatarId}`;
      if (scene.anims.exists(idleKey)) scene.anims.remove(idleKey);
      scene.anims.create({
        key: idleKey,
        frames: [{ key, frame: baseFrame }],
        frameRate: 1
      });
      
      const breatheKey = `idle_breathe_${name}_${avatarId}`;
      if (scene.anims.exists(breatheKey)) scene.anims.remove(breatheKey);
      scene.anims.create({
        key: breatheKey,
        frames: [{ key, frame: baseFrame }, { key, frame: baseFrame + 2 }],
        frameRate: 0.8,
        repeat: -1
      });
    });
  }

  static generateNPCPortrait(scene, npcConfig, key) {
    const canvas = document.createElement('canvas');
    canvas.width = 80;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = npcConfig.shirt || '#f26f21';
    ctx.fillRect(16, 28, 48, 68); 
    ctx.fillStyle = npcConfig.skin || '#fbd1a2';
    ctx.fillRect(29, 6, 22, 22); 

    if (scene.textures.exists(key)) scene.textures.remove(key);
    scene.textures.addImage(key, canvas);
    return key;
  }
}
"""

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(parts[0] + new_code)

/**
 * TextureGenerator: Sinh bộ Texture Pixel Art Tileset và 4 Bộ Avatar Spritesheets trong bộ nhớ.
 */
export class TextureGenerator {
  /**
   * Tạo Canvas Tileset 32x32
   */
  static generateTileset(scene, key = 'town_tileset') {
    if (scene.textures.exists(key)) return;

    const tileSize = 32;
    const cols = 8;
    const rows = 2;
    const canvas = document.createElement('canvas');
    canvas.width = cols * tileSize; // 256
    canvas.height = rows * tileSize; // 64
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const drawTile = (col, row, drawFn) => {
      ctx.save();
      ctx.translate(col * tileSize, row * tileSize);
      drawFn(ctx, tileSize);
      ctx.restore();
    };

    // 1. Tile 0: Grass (Cỏ xanh)
    drawTile(0, 0, (c, s) => {
      c.fillStyle = '#4ade80';
      c.fillRect(0, 0, s, s);
      c.fillStyle = '#22c55e';
      c.fillRect(4, 6, 2, 4);
      c.fillRect(6, 4, 4, 2);
      c.fillRect(18, 12, 4, 2);
      c.fillRect(20, 14, 2, 4);
      c.fillRect(10, 24, 4, 2);
      c.fillRect(26, 22, 2, 4);
      c.fillStyle = '#15803d';
      c.fillRect(6, 6, 2, 2);
      c.fillRect(20, 12, 2, 2);
    });

    // 2. Tile 1: Wood Floor (Sàn gỗ CLB)
    drawTile(1, 0, (c, s) => {
      c.fillStyle = '#d97706';
      c.fillRect(0, 0, s, s);
      c.fillStyle = '#b45309';
      c.fillRect(0, 0, s, 1);
      c.fillRect(0, 16, s, 1);
      c.fillRect(16, 0, 1, 16);
      c.fillRect(8, 16, 1, 16);
      c.fillRect(24, 16, 1, 16);
      c.fillStyle = '#f59e0b';
      c.fillRect(2, 2, 12, 2);
      c.fillRect(18, 18, 12, 2);
    });

    // 3. Tile 2: Brick Wall (Tường gạch)
    drawTile(2, 0, (c, s) => {
      c.fillStyle = '#475569';
      c.fillRect(0, 0, s, s);
      c.fillStyle = '#64748b';
      c.fillRect(2, 2, 12, 6);
      c.fillRect(16, 2, 14, 6);
      c.fillRect(2, 10, 28, 2);
      c.fillRect(2, 14, 28, 6);
      c.fillRect(2, 22, 13, 6);
      c.fillRect(17, 22, 13, 6);
      c.fillStyle = '#334155';
      c.fillRect(0, s - 4, s, 4);
      c.fillStyle = '#94a3b8';
      c.fillRect(0, 0, s, 2);
    });

    // 4. Tile 3: Bookshelf (Kệ sách)
    drawTile(3, 0, (c, s) => {
      c.fillStyle = '#78350f';
      c.fillRect(0, 0, s, s);
      c.fillStyle = '#451a03';
      c.fillRect(2, 2, 28, 12);
      c.fillRect(2, 16, 28, 12);
      const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
      for (let i = 0; i < 5; i++) {
        c.fillStyle = colors[i % colors.length];
        c.fillRect(4 + i * 5, 4, 4, 10);
      }
      for (let i = 0; i < 5; i++) {
        c.fillStyle = colors[(i + 2) % colors.length];
        c.fillRect(4 + i * 5, 18, 4, 10);
      }
      c.fillStyle = '#92400e';
      c.fillRect(0, 14, s, 2);
      c.fillRect(0, 28, s, 4);
    });

    // 5. Tile 4: Desk (Bàn làm việc)
    drawTile(4, 0, (c, s) => {
      c.fillStyle = '#854d0e';
      c.fillRect(2, 4, 28, 24);
      c.fillStyle = '#ca8a04';
      c.fillRect(4, 6, 24, 20);
      c.fillStyle = '#0f172a';
      c.fillRect(10, 10, 12, 8);
      c.fillStyle = '#38bdf8';
      c.fillRect(11, 11, 10, 6);
      c.fillStyle = '#94a3b8';
      c.fillRect(10, 19, 12, 4);
      c.fillStyle = '#ef4444';
      c.fillRect(24, 12, 3, 4);
    });

    // 6. Tile 5: Stone Path (Đường đá)
    drawTile(5, 0, (c, s) => {
      c.fillStyle = '#334155';
      c.fillRect(0, 0, s, s);
      c.fillStyle = '#64748b';
      c.fillRect(3, 3, 10, 10);
      c.fillRect(16, 4, 12, 8);
      c.fillRect(4, 17, 12, 11);
      c.fillRect(19, 15, 9, 13);
      c.fillStyle = '#94a3b8';
      c.fillRect(5, 5, 4, 4);
      c.fillRect(18, 6, 5, 3);
      c.fillRect(6, 19, 5, 4);
    });

    // 7. Tile 6: Carpet (Thảm hội trường)
    drawTile(6, 0, (c, s) => {
      c.fillStyle = '#1e3a8a';
      c.fillRect(0, 0, s, s);
      c.fillStyle = '#3b82f6';
      c.fillRect(2, 2, 28, 28);
      c.fillStyle = '#60a5fa';
      c.fillRect(6, 6, 20, 20);
      c.fillStyle = '#93c5fd';
      c.fillRect(12, 12, 8, 8);
    });

    // 8. Tile 7: Flowers (Vườn hoa)
    drawTile(7, 0, (c, s) => {
      c.fillStyle = '#22c55e';
      c.fillRect(0, 0, s, s);
      c.fillStyle = '#facc15';
      c.fillRect(6, 8, 4, 4);
      c.fillRect(22, 18, 4, 4);
      c.fillStyle = '#f43f5e';
      c.fillRect(18, 6, 4, 4);
      c.fillRect(8, 20, 4, 4);
      c.fillStyle = '#ffffff';
      c.fillRect(7, 9, 2, 2);
      c.fillRect(23, 19, 2, 2);
      c.fillRect(19, 7, 2, 2);
      c.fillRect(9, 21, 2, 2);
    });

    scene.textures.addSpriteSheet(key, canvas, {
      frameWidth: tileSize,
      frameHeight: tileSize
    });
  }

  /**
   * Cấu hình bảng màu cho 4 phong cách Avatar
   */
  static AVATAR_PALETTES = {
    dev_hoodie: {
      id: 'dev_hoodie',
      name: 'Developer Hoodie',
      skin: '#fcd34d',
      hair: '#1e1b4b',
      shirt: '#2563eb',
      pants: '#1e293b',
      shoes: '#f87171',
      backpack: '#f59e0b',
      accessory: null
    },
    cyberpunk_pink: {
      id: 'cyberpunk_pink',
      name: 'Cyberpunk Neon',
      skin: '#fed7aa',
      hair: '#06b6d4',
      shirt: '#ec4899',
      pants: '#0f172a',
      shoes: '#a855f7',
      backpack: '#06b6d4',
      accessory: 'visor'
    },
    red_gamer: {
      id: 'red_gamer',
      name: 'Red Gamer Pro',
      skin: '#fde047',
      hair: '#d97706',
      shirt: '#ef4444',
      pants: '#334155',
      shoes: '#38bdf8',
      backpack: '#1e293b',
      accessory: 'headset'
    },
    green_coder: {
      id: 'green_coder',
      name: 'Emerald Coder',
      skin: '#ffedd5',
      hair: '#78350f',
      shirt: '#10b981',
      pants: '#1e1b4b',
      shoes: '#f59e0b',
      backpack: '#059669',
      accessory: 'glasses'
    }
  };

  /**
   * Sinh toàn bộ 4 bộ Spritesheet Avatar
   */
  static generateAllAvatars(scene) {
    for (const [key, palette] of Object.entries(this.AVATAR_PALETTES)) {
      this.generateAvatarSpritesheet(scene, `avatar_${key}`, palette);
    }
    // Tạo alias cho key mặc định player_sprites
    if (!scene.textures.exists('player_sprites')) {
      this.generateAvatarSpritesheet(scene, 'player_sprites', this.AVATAR_PALETTES.dev_hoodie);
    }
  }

  static generateAvatarSpritesheet(scene, key, palette) {
    if (scene.textures.exists(key)) return;

    const frameW = 32;
    const frameH = 32;
    const cols = 3;
    const rows = 4; // 0: Down, 1: Left, 2: Right, 3: Up

    const canvas = document.createElement('canvas');
    canvas.width = cols * frameW; // 96
    canvas.height = rows * frameH; // 128
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const { skin, hair, shirt, pants, shoes, backpack, accessory } = palette;

    const drawChibiFrame = (col, row, dir, walkPhase) => {
      ctx.save();
      ctx.translate(col * frameW, row * frameH);

      const legOffsetL = walkPhase === -1 ? 2 : walkPhase === 1 ? -2 : 0;
      const legOffsetR = walkPhase === 1 ? 2 : walkPhase === -1 ? -2 : 0;
      const armSwing = walkPhase !== 0 ? walkPhase * 2 : 0;

      if (dir === 'down') {
        // Chân & Giày
        ctx.fillStyle = pants;
        ctx.fillRect(10, 20, 5, 6 + legOffsetL);
        ctx.fillRect(17, 20, 5, 6 + legOffsetR);
        ctx.fillStyle = shoes;
        ctx.fillRect(9, 25 + legOffsetL, 6, 4);
        ctx.fillRect(17, 25 + legOffsetR, 6, 4);

        // Áo
        ctx.fillStyle = shirt;
        ctx.fillRect(9, 13, 14, 8);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(13, 15, 6, 3); // Logo áo

        // Tay áo
        ctx.fillStyle = shirt;
        ctx.fillRect(6, 14 + armSwing, 3, 6);
        ctx.fillRect(23, 14 - armSwing, 3, 6);
        ctx.fillStyle = skin;
        ctx.fillRect(6, 19 + armSwing, 3, 3);
        ctx.fillRect(23, 19 - armSwing, 3, 3);

        // Đầu & Mặt
        ctx.fillStyle = skin;
        ctx.fillRect(8, 4, 16, 10);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(11, 8, 3, 3);
        ctx.fillRect(18, 8, 3, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(11, 8, 1, 1);
        ctx.fillRect(18, 8, 1, 1);
        ctx.fillStyle = '#fca5a5';
        ctx.fillRect(9, 11, 2, 2);
        ctx.fillRect(21, 11, 2, 2);

        // Tóc
        ctx.fillStyle = hair;
        ctx.fillRect(7, 2, 18, 5);
        ctx.fillRect(6, 5, 3, 5);
        ctx.fillRect(23, 5, 3, 5);
        ctx.fillRect(10, 6, 4, 2);
        ctx.fillRect(18, 6, 4, 2);

        // Phụ kiện
        if (accessory === 'visor') {
          ctx.fillStyle = '#06b6d4';
          ctx.fillRect(9, 7, 14, 4);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(11, 8, 4, 2);
        } else if (accessory === 'headset') {
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(6, 6, 3, 6);
          ctx.fillRect(23, 6, 3, 6);
          ctx.fillRect(8, 2, 16, 2);
        } else if (accessory === 'glasses') {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(10, 7, 5, 4);
          ctx.fillRect(17, 7, 5, 4);
          ctx.fillRect(15, 8, 2, 1);
          ctx.fillStyle = '#bae6fd';
          ctx.fillRect(11, 8, 3, 2);
          ctx.fillRect(18, 8, 3, 2);
        }
      } else if (dir === 'up') {
        // Hướng nhìn lên
        ctx.fillStyle = pants;
        ctx.fillRect(10, 20, 5, 6 + legOffsetL);
        ctx.fillRect(17, 20, 5, 6 + legOffsetR);
        ctx.fillStyle = shoes;
        ctx.fillRect(10, 25 + legOffsetL, 5, 4);
        ctx.fillRect(17, 25 + legOffsetR, 5, 4);

        ctx.fillStyle = shirt;
        ctx.fillRect(9, 13, 14, 8);
        ctx.fillStyle = backpack;
        ctx.fillRect(11, 14, 10, 7);

        ctx.fillStyle = shirt;
        ctx.fillRect(6, 14 - armSwing, 3, 6);
        ctx.fillRect(23, 14 + armSwing, 3, 6);

        ctx.fillStyle = hair;
        ctx.fillRect(7, 2, 18, 12);
        ctx.fillRect(6, 5, 20, 8);

        if (accessory === 'headset') {
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(6, 6, 3, 6);
          ctx.fillRect(23, 6, 3, 6);
          ctx.fillRect(8, 2, 16, 2);
        }
      } else if (dir === 'left') {
        // Hướng nhìn sang trái
        ctx.fillStyle = pants;
        ctx.fillRect(12 + legOffsetL, 20, 6, 6);
        ctx.fillStyle = shoes;
        ctx.fillRect(10 + legOffsetL, 25, 7, 4);

        ctx.fillStyle = shirt;
        ctx.fillRect(11, 13, 11, 8);
        ctx.fillStyle = backpack;
        ctx.fillRect(20, 14, 4, 6);

        ctx.fillStyle = shirt;
        ctx.fillRect(13, 14 + armSwing, 4, 6);
        ctx.fillStyle = skin;
        ctx.fillRect(13, 19 + armSwing, 3, 3);

        ctx.fillStyle = skin;
        ctx.fillRect(9, 4, 14, 10);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(11, 8, 3, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(11, 8, 1, 1);

        ctx.fillStyle = hair;
        ctx.fillRect(8, 2, 16, 5);
        ctx.fillRect(16, 5, 8, 8);
        ctx.fillRect(9, 6, 4, 2);

        if (accessory === 'visor') {
          ctx.fillStyle = '#06b6d4';
          ctx.fillRect(8, 7, 8, 4);
        } else if (accessory === 'headset') {
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(14, 6, 4, 6);
        } else if (accessory === 'glasses') {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(10, 7, 5, 4);
        }
      } else if (dir === 'right') {
        // Hướng nhìn sang phải
        ctx.fillStyle = pants;
        ctx.fillRect(14 - legOffsetL, 20, 6, 6);
        ctx.fillStyle = shoes;
        ctx.fillRect(15 - legOffsetL, 25, 7, 4);

        ctx.fillStyle = shirt;
        ctx.fillRect(10, 13, 11, 8);
        ctx.fillStyle = backpack;
        ctx.fillRect(8, 14, 4, 6);

        ctx.fillStyle = shirt;
        ctx.fillRect(15, 14 - armSwing, 4, 6);
        ctx.fillStyle = skin;
        ctx.fillRect(16, 19 - armSwing, 3, 3);

        ctx.fillStyle = skin;
        ctx.fillRect(9, 4, 14, 10);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(18, 8, 3, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(18, 8, 1, 1);

        ctx.fillStyle = hair;
        ctx.fillRect(8, 2, 16, 5);
        ctx.fillRect(8, 5, 8, 8);
        ctx.fillRect(19, 6, 4, 2);

        if (accessory === 'visor') {
          ctx.fillStyle = '#06b6d4';
          ctx.fillRect(16, 7, 8, 4);
        } else if (accessory === 'headset') {
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(14, 6, 4, 6);
        } else if (accessory === 'glasses') {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(17, 7, 5, 4);
        }
      }

      ctx.restore();
    };

    const dirs = ['down', 'left', 'right', 'up'];
    const walkPhases = [-1, 0, 1];

    dirs.forEach((dir, rowIndex) => {
      walkPhases.forEach((phase, colIndex) => {
        drawChibiFrame(colIndex, rowIndex, dir, phase);
      });
    });

    scene.textures.addSpriteSheet(key, canvas, {
      frameWidth: frameW,
      frameHeight: frameH
    });
  }
}

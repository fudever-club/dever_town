/**
 * TextureGenerator: Sinh bộ Texture Pixel Art Tileset 16 Tiles & 4 Bộ Avatar Spritesheets trong bộ nhớ.
 */
export class TextureGenerator {
  /**
   * Tạo Canvas Tileset 16 Tiles (8 cột x 2 hàng, kích thước 32x32 mỗi ô)
   */
  static generateTileset(scene, key = 'town_tileset') {
    if (scene.textures.exists(key)) return;

    const tileSize = 32;
    const cols = 8;
    const rows = 2; // Tổng 16 tiles
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

    // Hàng 0: Tiles cơ bản
    // 0. Cỏ xanh (Grass)
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

    // 1. Sàn gỗ CLB (Wood Parquet)
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

    // 2. Tường gạch CLB (Brick Wall)
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

    // 3. Tủ sách kỹ thuật (Bookshelf)
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

    // 4. Bàn làm việc & Laptop (Work Desk)
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

    // 5. Đường đá cuội (Stone Path)
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

    // 6. Thảm xanh Sảnh (Blue Carpet)
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

    // 7. Vườn hoa CLB (Flower Grass)
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

    // Hàng 1: Tiles nâng cao cho Tech Lab & Library Lounge
    // 8. Server Rack Máy chủ (Tech Server Rack)
    drawTile(0, 1, (c, s) => {
      c.fillStyle = '#0f172a';
      c.fillRect(2, 0, 28, s);
      c.fillStyle = '#1e293b';
      c.fillRect(4, 2, 24, 6);
      c.fillRect(4, 10, 24, 6);
      c.fillRect(4, 18, 24, 6);
      c.fillRect(4, 26, 24, 5);
      // Đèn tín hiệu nhấp nháy LED
      c.fillStyle = '#22c55e';
      c.fillRect(6, 4, 3, 2);
      c.fillRect(6, 12, 3, 2);
      c.fillRect(6, 20, 3, 2);
      c.fillStyle = '#38bdf8';
      c.fillRect(11, 4, 3, 2);
      c.fillRect(11, 12, 3, 2);
      c.fillStyle = '#f59e0b';
      c.fillRect(16, 20, 3, 2);
      c.fillRect(21, 28, 4, 2);
    });

    // 9. Sàn công nghệ Tech Slate (Cyan Cyber Floor)
    drawTile(1, 1, (c, s) => {
      c.fillStyle = '#0f172a';
      c.fillRect(0, 0, s, s);
      c.fillStyle = '#1e293b';
      c.fillRect(1, 1, s - 2, s - 2);
      c.fillStyle = '#06b6d4';
      c.fillRect(0, 0, s, 1);
      c.fillRect(0, 0, 1, s);
      c.fillStyle = '#0284c7';
      c.fillRect(s - 1, 0, 1, s);
      c.fillRect(0, s - 1, s, 1);
      // Mạch điện tử trang trí
      c.fillStyle = '#38bdf8';
      c.fillRect(14, 14, 4, 4);
    });

    // 10. Cổng dịch chuyển Portal Pad (Warp Portal)
    drawTile(2, 1, (c, s) => {
      c.fillStyle = '#1e1b4b';
      c.fillRect(0, 0, s, s);
      c.fillStyle = '#8b5cf6';
      c.beginPath();
      c.arc(s / 2, s / 2, 13, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#c084fc';
      c.beginPath();
      c.arc(s / 2, s / 2, 9, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#ffffff';
      c.beginPath();
      c.arc(s / 2, s / 2, 4, 0, Math.PI * 2);
      c.fill();
    });

    // 11. Thảm đỏ Lounge thư giãn (Red Carpet)
    drawTile(3, 1, (c, s) => {
      c.fillStyle = '#881337';
      c.fillRect(0, 0, s, s);
      c.fillStyle = '#e11d48';
      c.fillRect(2, 2, 28, 28);
      c.fillStyle = '#fb7185';
      c.fillRect(6, 6, 20, 20);
      c.fillStyle = '#fecdd3';
      c.fillRect(12, 12, 8, 8);
    });

    // 12. Bảng trắng Whiteboard / Projector
    drawTile(4, 1, (c, s) => {
      c.fillStyle = '#475569';
      c.fillRect(1, 2, 30, 28);
      c.fillStyle = '#f8fafc';
      c.fillRect(3, 4, 26, 24);
      // Nét vẽ sơ đồ kiến trúc trên bảng
      c.fillStyle = '#2563eb';
      c.fillRect(6, 8, 8, 4);
      c.fillRect(18, 8, 8, 4);
      c.fillStyle = '#dc2626';
      c.fillRect(14, 16, 6, 8);
      c.fillStyle = '#10b981';
      c.fillRect(6, 16, 6, 2);
    });

    // 13. Chậu cây cảnh Decor (Potted Plant)
    drawTile(5, 1, (c, s) => {
      c.fillStyle = '#d97706';
      c.fillRect(0, 0, s, s); // Nền sàn gỗ
      // Chậu gốm
      c.fillStyle = '#b45309';
      c.fillRect(8, 18, 16, 12);
      c.fillStyle = '#d97706';
      c.fillRect(6, 16, 20, 3);
      // Tán cây xanh
      c.fillStyle = '#15803d';
      c.beginPath();
      c.arc(16, 11, 9, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#22c55e';
      c.beginPath();
      c.arc(16, 9, 6, 0, Math.PI * 2);
      c.fill();
    });

    // 14. Quầy Cà phê & Drinks (Coffee Bar)
    drawTile(6, 1, (c, s) => {
      c.fillStyle = '#78350f';
      c.fillRect(0, 0, s, s);
      c.fillStyle = '#a16207';
      c.fillRect(2, 2, 28, 28);
      // Máy pha cà phê
      c.fillStyle = '#0f172a';
      c.fillRect(6, 6, 12, 14);
      c.fillStyle = '#ef4444';
      c.fillRect(22, 10, 4, 5); // Tách cà phê đỏ
      c.fillStyle = '#ffffff';
      c.fillRect(22, 7, 2, 3); // Làn khói
    });

    // 15. Vách kính văn phòng hiện đại (Glass Wall)
    drawTile(7, 1, (c, s) => {
      c.fillStyle = '#0f172a';
      c.fillRect(0, 0, s, s);
      c.fillStyle = '#0284c7';
      c.fillRect(2, 2, 28, 28);
      c.fillStyle = '#38bdf8';
      c.fillRect(4, 4, 24, 24);
      // Vệt phản chiếu ánh sáng kính
      c.fillStyle = '#e0f2fe';
      c.fillRect(6, 6, 3, 20);
      c.fillRect(16, 6, 2, 16);
    });

    scene.textures.addSpriteSheet(key, canvas, {
      frameWidth: tileSize,
      frameHeight: tileSize
    });
  }

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

  static generateAllAvatars(scene) {
    for (const [key, palette] of Object.entries(this.AVATAR_PALETTES)) {
      this.generateAvatarSpritesheet(scene, `avatar_${key}`, palette);
    }
    if (!scene.textures.exists('player_sprites')) {
      this.generateAvatarSpritesheet(scene, 'player_sprites', this.AVATAR_PALETTES.dev_hoodie);
    }
  }

  static generateAvatarSpritesheet(scene, key, palette) {
    if (scene.textures.exists(key)) return;

    const frameW = 32;
    const frameH = 32;
    const cols = 3;
    const rows = 4;

    const canvas = document.createElement('canvas');
    canvas.width = cols * frameW;
    canvas.height = rows * frameH;
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
        ctx.fillStyle = pants;
        ctx.fillRect(10, 20, 5, 6 + legOffsetL);
        ctx.fillRect(17, 20, 5, 6 + legOffsetR);
        ctx.fillStyle = shoes;
        ctx.fillRect(9, 25 + legOffsetL, 6, 4);
        ctx.fillRect(17, 25 + legOffsetR, 6, 4);

        ctx.fillStyle = shirt;
        ctx.fillRect(9, 13, 14, 8);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(13, 15, 6, 3);

        ctx.fillStyle = shirt;
        ctx.fillRect(6, 14 + armSwing, 3, 6);
        ctx.fillRect(23, 14 - armSwing, 3, 6);
        ctx.fillStyle = skin;
        ctx.fillRect(6, 19 + armSwing, 3, 3);
        ctx.fillRect(23, 19 - armSwing, 3, 3);

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

        ctx.fillStyle = hair;
        ctx.fillRect(7, 2, 18, 5);
        ctx.fillRect(6, 5, 3, 5);
        ctx.fillRect(23, 5, 3, 5);
        ctx.fillRect(10, 6, 4, 2);
        ctx.fillRect(18, 6, 4, 2);

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

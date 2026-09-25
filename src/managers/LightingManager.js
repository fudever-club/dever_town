/**
 * DEVER TOWN - LIGHTING MANAGER (DELVERIUM INSPIRED)
 * Hệ thống Ánh Sáng Ambient 2D & Vầng Sáng Dưới Chân (Foot Aura):
 * 1. Phủ màn đêm mờ ảo (Ambient Darkness) lên các phòng tối (Hầm Server, Căn tin đêm, Tòa Gamma Lab).
 * 2. Vầng sáng dịu nhẹ (Foot Aura / Lantern Glow) tỏa ra dưới chân người chơi và các NPC.
 * 3. Nhịp thở ánh sáng hữu cơ (Organic Breathing & Candle Flicker) 60 FPS.
 */

export const ROOM_LIGHTING_PROFILES = {
  server_dungeon: {
    darknessAlpha: 0.78,
    ambientColor: 0x030712,
    lightColor: 0x38bdf8, // Cyber Cyan
    baseRadius: 85,
    flicker: 0.04
  },
  canteen_cafe: {
    darknessAlpha: 0.32,
    ambientColor: 0x0f172a,
    lightColor: 0xfef08a, // Warm Yellow
    baseRadius: 75,
    flicker: 0.02
  },
  dever_lab: {
    darknessAlpha: 0.38,
    ambientColor: 0x090d16,
    lightColor: 0x67e8f9,
    baseRadius: 80,
    flicker: 0.03
  },
  default: {
    darknessAlpha: 0.0,
    ambientColor: 0x000000,
    lightColor: 0xffedd5,
    baseRadius: 70,
    flicker: 0.0
  }
};

export class LightingManager {
  /**
   * @param {Object} scene
   */
  constructor(scene) {
    this.scene = scene;
    this.currentRoom = null;
    this.profile = ROOM_LIGHTING_PROFILES.default;

    // Graphics cho lớp bóng tối và ánh sáng
    this.darknessLayer = null;
    this.lightGraphics = null;
    this.renderTexture = null;

    this.flickerTimer = 0;
    this.currentRadiusOffset = 0;

    this.init();
  }

  init() {
    if (!this.scene) return;

    const width = this.scene.scale?.width || 1280;
    const height = this.scene.scale?.height || 720;

    // Tạo Graphics layer để vẽ vầng sáng foot aura
    if (this.scene.add) {
      this.lightGraphics = this.scene.add.graphics();
      this.lightGraphics.setDepth(999990); // Nằm ngay trên bản đồ & nhân vật, dưới HUD UI
    }

    // Lắng nghe thay đổi kích thước màn hình
    this.scene.scale?.on?.('resize', this.handleResize, this);
  }

  handleResize(gameSize) {
    if (this.lightGraphics) {
      this.lightGraphics.clear();
    }
  }

  setRoom(roomId) {
    this.currentRoom = roomId;
    this.profile = ROOM_LIGHTING_PROFILES[roomId] || ROOM_LIGHTING_PROFILES.default;

    if (this.lightGraphics) {
      this.lightGraphics.clear();
      this.lightGraphics.setVisible(this.profile.darknessAlpha > 0);
    }
  }

  update(time, delta) {
    if (!this.profile || this.profile.darknessAlpha <= 0) {
      if (this.lightGraphics && this.lightGraphics.visible) {
        this.lightGraphics.clear();
        this.lightGraphics.setVisible(false);
      }
      return;
    }

    if (this.lightGraphics && !this.lightGraphics.visible) {
      this.lightGraphics.setVisible(true);
    }

    const player = this.scene?.player;
    if (!player || !this.lightGraphics) return;

    const cam = this.scene.cameras?.main;
    if (!cam) return;

    // Hiệu ứng bập bùng nhẹ của ngọn đèn (Flicker)
    this.flickerTimer += (delta || 16) * 0.003;
    const flicker = Math.sin(this.flickerTimer * 4) * this.profile.flicker;
    const currentRadius = this.profile.baseRadius * (1 + flicker);

    this.lightGraphics.clear();

    // 1. Phủ lớp bóng tối toàn màn hình (theo tọa độ camera)
    const viewLeft = cam.scrollX - 50;
    const viewTop = cam.scrollY - 50;
    const viewWidth = (cam.width / (cam.zoom || 1)) + 100;
    const viewHeight = (cam.height / (cam.zoom || 1)) + 100;

    this.lightGraphics.fillStyle(this.profile.ambientColor, this.profile.darknessAlpha);
    this.lightGraphics.fillRect(viewLeft, viewTop, viewWidth, viewHeight);

    // 2. Vầng hào quang dưới chân người chơi (Foot Aura)
    const px = player.x;
    const py = player.y + 16; // Chân nhân vật

    this.drawRadialAura(px, py, currentRadius, this.profile.lightColor);

    // 3. Vầng hào quang dưới chân các NPC gần đó
    if (this.scene.npcGroup) {
      this.scene.npcGroup.forEach(npc => {
        if (npc.active && npc.visible) {
          const dist = Math.hypot(player.x - npc.x, player.y - npc.y);
          if (dist < 400) {
            this.drawRadialAura(npc.x, npc.y + 16, currentRadius * 0.75, 0xfef08a);
          }
        }
      });
    }

    // 4. Vầng hào quang của Remote Players (nếu có)
    if (this.scene.remotePlayers) {
      for (const remote of this.scene.remotePlayers.values()) {
        if (remote.active && remote.visible) {
          const dist = Math.hypot(player.x - remote.x, player.y - remote.y);
          if (dist < 400) {
            this.drawRadialAura(remote.x, remote.y + 16, currentRadius * 0.7, 0x67e8f9);
          }
        }
      }
    }
  }

  drawRadialAura(cx, cy, maxRadius, colorHex) {
    // Sử dụng kỹ thuật Multi-ring Falloff mềm mại, tương thích mọi WebGL/Canvas renderer
    const steps = 6;
    for (let i = steps; i >= 1; i--) {
      const stepRadius = (maxRadius / steps) * i;
      const stepAlpha = (0.28 / steps) * (steps - i + 1);

      this.lightGraphics.fillStyle(colorHex, stepAlpha);
      this.lightGraphics.fillCircle(cx, cy, stepRadius);
    }
  }

  destroy() {
    if (this.scene?.scale) {
      this.scene.scale.off('resize', this.handleResize, this);
    }
    if (this.lightGraphics) {
      this.lightGraphics.destroy();
      this.lightGraphics = null;
    }
  }
}

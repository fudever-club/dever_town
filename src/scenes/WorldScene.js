import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig.js';
import { MAPS_CONFIG } from '../config/maps.js';
import { InputController } from '../config/controls.js';
import { Player } from '../entities/Player.js';
import { RemotePlayer } from '../entities/RemotePlayer.js';
import { SocketManager } from '../network/SocketManager.js';
import {
  ChatBox,
  AuthModal,
  InteractiveModal,
  InventoryModal,
  WardrobeModal,
  SettingsModal,
  OnboardingGuide,
  TouchControls,
  QuestModal,
  NetworkStatusOverlay,
  MinimapOverlay,
  RoomBanner,
  EmoteBar,
  SpeedCodeDuel
} from '../ui/index.js';
import { InteractionManager } from '../managers/InteractionManager.js';
import { InventoryManager } from '../managers/InventoryManager.js';
import { questManager } from '../managers/QuestManager.js';
import { authService } from '../services/AuthService.js';
import { TextureGenerator } from '../utils/TextureGenerator.js';
import { audioManager } from '../utils/AudioManager.js';
import { i18n } from '../config/i18n.js';
import { AmbientEnvironmentManager } from '../managers/AmbientEnvironmentManager.js';
import { JuiceManager } from '../managers/JuiceManager.js';
import { AchievementManager } from '../managers/AchievementManager.js';
import { CampusTicker } from '../ui/common/CampusTicker.js';

export class WorldScene extends Phaser.Scene {
  constructor() {
    super('WorldScene');
    this.currentRoomId = 'main_hall';
    this.remotePlayers = new Map();
    this.isTeleporting = false;
    this.lastTeleportTime = 0;
    this.teleportGraceUntil = 0;
    this.tileSprites = [];
    this.portalLabels = [];
    this.audioManager = audioManager;
    this.i18n = i18n;
  }

  create() {
    this.physics.world.setBounds(0, 0, GAME_CONFIG.MAP_WIDTH, GAME_CONFIG.MAP_HEIGHT);

    // 0. Khởi tạo Juice, Môi trường hạt & Thành tựu
    this.juiceManager = new JuiceManager(this);
    this.ambientManager = new AmbientEnvironmentManager(this);
    this.achievementManager = new AchievementManager({ scene: this, juiceManager: this.juiceManager });
    this.campusTicker = new CampusTicker();

    // 1. Khởi tạo Local Player
    const user = authService.getUser();
    const mapData = MAPS_CONFIG[this.currentRoomId] || MAPS_CONFIG.main_hall;
    const spawnX = mapData.spawnPoint.x;
    const spawnY = mapData.spawnPoint.y;

    let wardrobeConfig = user?.wardrobe_config || null;
    const savedWardrobeRaw = localStorage.getItem('dever_wardrobe_config');
    if (!wardrobeConfig && savedWardrobeRaw) {
      try { wardrobeConfig = JSON.parse(savedWardrobeRaw); } catch (e) {}
    } else if (wardrobeConfig) {
      try { localStorage.setItem('dever_wardrobe_config', JSON.stringify(wardrobeConfig)); } catch (e) {}
    }

    const initialName = user ? (user.display_name || user.displayName) : (localStorage.getItem('dever_nickname') || 'Dever Member');
    const initialRole = user ? user.role : (authService.isLoggedIn() ? 'dev' : 'guest');
    const initialEquipped = (user && user.equipped_item_id) || localStorage.getItem('dever_equipped_item') || null;
    const initialAvatar = wardrobeConfig ? 'custom_wardrobe' : (user ? (user.avatar_id || user.avatarId) : 'dev_hoodie');

    this.player = new Player(this, spawnX, spawnY, {
      name: initialName,
      avatarId: initialAvatar,
      role: initialRole,
      equippedItemId: initialEquipped,
      wardrobeConfig: wardrobeConfig,
      isCurrentPlayer: true
    });

    // 2. Khởi tạo Controllers & Managers
    this.inputController = new InputController(this);

    this.interactionManager = new InteractionManager(this, {
      onInteract: (zoneData) => {
        if (this.interactiveModal) {
          this.interactiveModal.show({ ...zoneData, roomId: this.currentRoomId });
        }
      }
    });

    this.inventoryManager = new InventoryManager(this, {
      onInventoryChange: () => {
        if (this.inventoryModal && this.inventoryModal.isOpen()) {
          this.inventoryModal.render();
        }
      },
      onEquipChange: (item) => {
        if (this.inventoryModal && this.inventoryModal.isOpen()) {
          this.inventoryModal.render();
        }
        if (item && (item.id === 'item_macbook_m3' || item.id === 'item_custom_keyboard') && this.achievementManager) {
          this.achievementManager.unlock('tech_pro');
        }
      }
    });

    // 3. Xây dựng bản đồ phòng
    this.loadRoom(this.currentRoomId, spawnX, spawnY, false);

    // 4. Camera Follow với vùng đệm rộng rãi (Headroom Padding)
    // Giúp khi đi lên phía Bắc (North) camera có không gian mở rộng thoáng đãng, không bị gò bó hoặc che khuất tên phòng
    const camera = this.cameras.main;
    const PADDING_X = 64;
    const PADDING_Y = 96;
    camera.setBounds(-PADDING_X, -PADDING_Y, GAME_CONFIG.MAP_WIDTH + PADDING_X * 2, GAME_CONFIG.MAP_HEIGHT + PADDING_Y * 2);
    camera.startFollow(this.player, true, 0.08, 0.08);
    camera.setRoundPixels(true);

    // Kích hoạt PostFX Vignette làm sâu sắc góc nhìn (nếu WebGL hỗ trợ)
    if (camera.postFX) {
      try {
        camera.postFX.addVignette(0.5, 0.5, 0.72, 0.3);
      } catch (e) {}
    }

    this.updateCameraZoom();

    window.addEventListener('resize', () => this.updateCameraZoom());
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.updateCameraZoom(), 150);
    });

    // 5. HUD & Network
    this.createHUD();
    this.socketManager = new SocketManager(this);

    // 6. UI Modals & Network Monitor
    this.initUI();

    // 7. Connect Realtime Socket
    this.socketManager.connect();

    // 8. Subscribe Language Changes
    if (this.i18n) {
      this.i18n.subscribe(() => this.refreshSceneLanguage());
    }
  }

  updateCameraZoom() {
    if (!this.cameras || !this.cameras.main) return;
    const camera = this.cameras.main;
    const isMobile = window.innerWidth <= 1024 || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    if (isMobile) {
      const isPortrait = window.innerHeight > window.innerWidth;
      if (isPortrait) {
        // Màn hình dọc: Tối ưu nhân vật và map to rõ, vừa tầm mắt
        const zoom = Math.max(1.15, Math.min(1.35, window.innerWidth / 340));
        camera.setZoom(zoom);
      } else {
        // Màn hình ngang (Landscape): Tầm nhìn rộng rãi bao quát căn phòng
        const zoom = Math.max(1.1, Math.min(1.3, window.innerHeight / 360));
        camera.setZoom(zoom);
      }
    } else {
      // Desktop: Zoom 1.32x bám sát điện ảnh, nhân vật rõ nét, phòng ấm cúng
      camera.setZoom(1.32);
    }
  }

  refreshSceneLanguage() {
    const mapData = MAPS_CONFIG[this.currentRoomId];
    if (!mapData) return;

    if (this.hudText) {
      const roomName = this.i18n ? (this.i18n.get(`rooms.${this.currentRoomId}`) || mapData.name) : mapData.name;
      this.hudText.setText(`DEVER TOWN | ${roomName}`);
    }

    if (this.portalLabels && this.portalLabels.length > 0 && mapData.portals) {
      this.portalLabels.forEach((lbl, idx) => {
        const p = mapData.portals[idx];
        if (p && lbl) {
          const portalText = this.i18n ? (this.i18n.get(`portals.${p.targetRoomId}`) || p.label) : p.label;
          lbl.setText(portalText);
        }
      });
    }

    if (this.interactionManager) {
      this.interactionManager.setZones(mapData.zones || []);
    }
  }

  loadRoom(roomId, spawnX, spawnY, notifySocket = true) {
    const mapData = MAPS_CONFIG[roomId];
    if (!mapData) return;

    this.currentRoomId = roomId;
    questManager.recordRoomVisit(roomId);

    if (this.hudText) {
      const roomName = this.i18n ? (this.i18n.get(`rooms.${roomId}`) || mapData.name) : mapData.name;
      this.hudText.setText(`DEVER TOWN | ${roomName}`);
    }

    if (this.tileSprites && this.tileSprites.length > 0) {
      this.tileSprites.forEach(t => t.destroy());
      this.tileSprites = [];
    }
    if (this.portalLabels && this.portalLabels.length > 0) {
      this.portalLabels.forEach(lbl => lbl.destroy());
      this.portalLabels = [];
    }
    if (this.obstacleGroup) {
      this.obstacleGroup.clear(true, true);
    }
    if (this.portalGroup) {
      this.portalGroup.clear(true, true);
    }

    for (const remote of this.remotePlayers.values()) {
      remote.destroy();
    }
    this.remotePlayers.clear();

    this.obstacleGroup = this.physics.add.staticGroup();
    this.portalGroup = this.physics.add.staticGroup();

    const cols = GAME_CONFIG.MAP_WIDTH_TILES;
    const rows = GAME_CONFIG.MAP_HEIGHT_TILES;
    const tileSize = GAME_CONFIG.TILE_SIZE;

    // Solid obstacles
    const solidTiles = new Set([2, 3, 4, 8, 12, 14, 15, 16, 17, 19, 20, 21, 22, 25, 26, 27, 29, 30, 31]);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const tileType = mapData.layout[r][c];
        const posX = c * tileSize + tileSize / 2;
        const posY = r * tileSize + tileSize / 2;

        const tileSprite = this.add.image(posX, posY, 'town_tileset', tileType);
        tileSprite.setDepth(0);
        this.tileSprites.push(tileSprite);

        if (solidTiles.has(tileType)) {
          const obstacle = this.obstacleGroup.create(posX, posY, 'town_tileset', tileType);
          obstacle.setVisible(false);
          obstacle.refreshBody();
        }
      }
    }

    // Portals
    if (mapData.portals) {
      // 1. Tạo physical portal objects cho toàn bộ portals (giữ nguyên physics collision)
      mapData.portals.forEach(p => {
        const posX = p.tileX * tileSize + tileSize / 2;
        const posY = p.tileY * tileSize + tileSize / 2;

        const portalObj = this.portalGroup.create(posX, posY, null);
        portalObj.setSize(tileSize, tileSize);
        portalObj.setVisible(false);
        portalObj.portalData = p;
      });

      // 2. Nhóm các cổng liền kề có cùng targetRoomId để hiển thị 1 nhãn thống nhất, tránh đè chữ
      const processed = new Set();
      mapData.portals.forEach((p, idx) => {
        if (processed.has(idx)) return;
        processed.add(idx);

        const group = [p];
        mapData.portals.forEach((other, oIdx) => {
          if (processed.has(oIdx)) return;
          if (other.targetRoomId === p.targetRoomId) {
            const distTiles = Math.abs(other.tileX - p.tileX) + Math.abs(other.tileY - p.tileY);
            if (distTiles <= 1.5) {
              group.push(other);
              processed.add(oIdx);
            }
          }
        });

        // Tính tọa độ trung bình cho nhóm nhãn
        const avgX = group.reduce((sum, item) => sum + item.tileX * tileSize + tileSize / 2, 0) / group.length;
        const avgY = group.reduce((sum, item) => sum + item.tileY * tileSize + tileSize / 2, 0) / group.length;
        const portalText = this.i18n ? (this.i18n.get(`portals.${p.targetRoomId}`) || p.label) : p.label;

        // So le nhẹ vị trí Y cho các nhóm cổng liền kề để chống chồng đè chữ lẫn nhau
        const isStaggeredPortal = idx % 2 === 1;
        const targetY = isStaggeredPortal ? (avgY - 26) : (avgY - 14);
        const clampedY = Phaser.Math.Clamp(targetY, 18, rows * tileSize - 18);

        const label = this.add.text(avgX, clampedY, portalText, {
          fontFamily: "'Outfit', -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
          fontSize: '10px',
          fontWeight: '700',
          color: '#c084fc',
          backgroundColor: 'rgba(15, 23, 42, 0.88)',
          padding: { x: 6, y: 2 }
        }).setOrigin(0.5, 0.5).setDepth(99999);

        // Kẹp tọa độ X động theo bề rộng thực tế + fallback độ dài ký tự (phòng khi webfont chưa tải xong)
        const estWidth = Math.max(label.width || 0, portalText.length * 8 + 16);
        const halfW = estWidth / 2;
        label.x = Phaser.Math.Clamp(avgX, halfW + 12, cols * tileSize - halfW - 12);
        this.portalLabels.push(label);
      });
    }

    // Zones
    if (this.interactionManager) {
      this.interactionManager.setZones(mapData.zones || []);
    }

    // Pickups for this room
    if (this.inventoryManager) {
      this.inventoryManager.loadPickupsForRoom(roomId);
    }

    // Colliders & Overlaps
    if (this.playerCollider) this.playerCollider.destroy();
    this.playerCollider = this.physics.add.collider(this.player, this.obstacleGroup);

    if (this.portalOverlap) this.portalOverlap.destroy();
    this.portalOverlap = this.physics.add.overlap(
      this.player,
      this.portalGroup,
      (player, portal) => this.handlePortalOverlap(portal.portalData)
    );

    if (spawnX !== undefined && spawnY !== undefined) {
      this.player.setPosition(spawnX, spawnY);
      this.player.body.reset(spawnX, spawnY);
    }

    this.teleportGraceUntil = performance.now() + 2000;

    // Cập nhật hiệu ứng hạt môi trường cho phòng
    if (this.ambientManager) {
      this.ambientManager.setRoom(roomId);
    }

    // Kiểm tra mở khóa Tân Thủ DEVER khi đến Sảnh Alpha
    if (this.achievementManager && roomId === 'main_hall') {
      this.achievementManager.unlock('first_arrival');
    }

    if (this.hudText) {
      this.hudText.setText(`DEVER TOWN | ${mapData.name}`);
    }

    const roomSelector = document.getElementById('room-selector');
    if (roomSelector && roomSelector.value !== roomId) {
      roomSelector.value = roomId;
    }

    if (notifySocket && this.socketManager) {
      this.socketManager.switchRoom(roomId, spawnX, spawnY);
    }

    // Cập nhật Minimap & Room Banner
    if (this.minimap) {
      this.minimap.setRoom(roomId);
    }
    if (this.roomBanner) {
      this.roomBanner.show(roomId, this.remotePlayers.size + 1);
    }
  }

  handlePortalOverlap(portalData) {
    if (this.isTeleporting) return;

    const now = performance.now();
    if (now < this.teleportGraceUntil) return;
    if (now - this.lastTeleportTime < 2000) return;

    this.isTeleporting = true;
    this.lastTeleportTime = now;

    if (this.audioManager) {
      this.audioManager.playTeleport();
    }

    this.cameras.main.fadeOut(200, 11, 15, 25);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.loadRoom(
        portalData.targetRoomId,
        portalData.targetSpawn.x,
        portalData.targetSpawn.y,
        true
      );
      this.cameras.main.fadeIn(250, 11, 15, 25);
      this.cameras.main.once('camerafadeincomplete', () => {
        this.isTeleporting = false;
        this.teleportGraceUntil = performance.now() + 2000;
      });
    });
  }

  createHUD() {
    const mapData = MAPS_CONFIG[this.currentRoomId] || MAPS_CONFIG.main_hall;
    const roomName = this.i18n ? (this.i18n.get(`rooms.${this.currentRoomId}`) || mapData.name) : mapData.name;

    this.hudText = this.add.text(14, 14, `DEVER TOWN | ${roomName}`, {
      fontFamily: "'Outfit', -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
      fontSize: '11px',
      fontWeight: '700',
      color: '#38bdf8',
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      padding: { x: 10, y: 6 }
    });
    this.hudText.setScrollFactor(0);
    this.hudText.setDepth(1000000);

    // Lắng nghe thay đổi ngôn ngữ
    this.i18n.subscribe(() => {
      const curMap = MAPS_CONFIG[this.currentRoomId] || MAPS_CONFIG.main_hall;
      const rName = this.i18n.get(`rooms.${this.currentRoomId}`) || curMap.name;
      if (this.hudText) {
        this.hudText.setText(`DEVER TOWN | ${rName}`);
      }
    });
  }

  initUI() {
    // 1. Chat Box
    this.chatBox = new ChatBox({
      onSendMessage: (message) => {
        this.socketManager.sendChatMessage(message);
        questManager.incrementProgress('chat_connect', 1);
      }
    });

    // 2. Interactive Modal
    this.interactiveModal = new InteractiveModal({
      onOpen: () => {
        if (this.inputController) this.inputController.disableInput();
        if (this.player && this.player.body) this.player.body.setVelocity(0, 0);
      },
      onClose: () => {
        if (this.inputController) this.inputController.enableInput();
        if (this.game && this.game.canvas) this.game.canvas.focus();
      }
    });

    // 3. Inventory Modal
    this.inventoryModal = new InventoryModal({
      inventoryManager: this.inventoryManager
    });

    // 4. Wardrobe Modal
    this.wardrobeModal = new WardrobeModal({
      scene: this,
      onApply: (config) => {
        console.log('Đã áp dụng trang phục mới:', config);
      }
    });

    // 5. Settings Modal
    if (window.__SETTINGS_MODAL__) {
      this.settingsModal = window.__SETTINGS_MODAL__;
      this.settingsModal.scene = this;
    } else {
      this.settingsModal = new SettingsModal({
        scene: this
      });
      window.__SETTINGS_MODAL__ = this.settingsModal;
    }

    // 6. Quests & Points Modal
    this.questModal = new QuestModal();

    // 7. Auth Modal
    this.authModal = new AuthModal({
      onAuthSuccess: ({ user, isGuest }) => {
        const name = user.display_name || user.displayName;
        const avatarId = user.avatar_id || user.avatarId || 'dev_hoodie';
        const role = user.role || (isGuest ? 'guest' : 'dev');

        if (this.player) {
          this.player.updateProfile({ name, avatarId, role });
        }

        // Tự động khôi phục trang phục từ Database nếu có
        if (user.wardrobe_config && typeof user.wardrobe_config === 'object') {
          if (this.player) {
            // setCustomWardrobe tự xử lý generate + swap an toàn
            this.player.setCustomWardrobe('custom_wardrobe', user.wardrobe_config);
          }
        }

        const equippedItem = localStorage.getItem('dever_equipped_item');
        if (equippedItem && this.player && this.player.setEquippedItem) {
          this.player.setEquippedItem(equippedItem);
        }

        this.updateHeaderProfile(user);

        if (this.inputController) {
          this.inputController.enableInput();
        }
        if (this.game && this.game.canvas) {
          this.game.canvas.focus();
        }

        if (this.socketManager) {
          this.socketManager.reconnectWithAuth();
        }
      }
    });

    // 8. Onboarding Guide & Mobile Touch Controls
    this.onboardingGuide = new OnboardingGuide();
    this.onboardingGuide.checkAndShow();

    this.touchControls = new TouchControls({
      inputController: this.inputController,
      scene: this
    });

    // 9. Network Status & Lag Spinner Overlay
    this.networkStatusOverlay = new NetworkStatusOverlay({
      socketManager: this.socketManager
    });

    // 10. Minimap Radar HUD
    this.minimap = new MinimapOverlay({
      scene: this
    });

    // 11. Room Banner Transition
    this.roomBanner = new RoomBanner();

    // 12. Emote Bar (Biểu cảm nhanh & Nhảy múa)
    this.emoteBar = new EmoteBar({
      onSelectEmote: (emoteId) => this.handleLocalEmote(emoteId)
    });

    // 13. Minigame Đấu Trí Siêu Tốc (Speed Code Duel)
    this.speedCodeDuel = new SpeedCodeDuel();

    // 7. Header Buttons
    const invBtn = document.getElementById('header-inventory-btn');
    if (invBtn) {
      invBtn.addEventListener('click', () => {
        this.inventoryModal.toggle();
      });
    }

    const wardrobeBtn = document.getElementById('header-wardrobe-btn');
    if (wardrobeBtn) {
      wardrobeBtn.addEventListener('click', () => {
        this.wardrobeModal.show();
      });
    }

    const fptuPortalBtn = document.getElementById('header-fptu-portal-btn');
    if (fptuPortalBtn) {
      fptuPortalBtn.addEventListener('click', () => {
        audioManager.playClick();
        this.interactiveModal.openForZone({
          id: 'quick_fptu_portal',
          type: 'fptu_student_portal',
          name: 'Cổng Tiện Ích Học Vụ & Phần Mềm Thi FPTU',
          label: 'Cổng FPTU & Thi'
        });
      });
    }

    const emoteBtn = document.getElementById('header-emote-btn');
    if (emoteBtn) {
      emoteBtn.addEventListener('click', () => {
        this.emoteBar.toggle();
      });
    }

    const speedDuelBtn = document.getElementById('header-speed-duel-btn');
    if (speedDuelBtn) {
      speedDuelBtn.addEventListener('click', () => {
        audioManager.playClick();
        this.speedCodeDuel.show();
      });
    }

    const bgmBtn = document.getElementById('header-bgm-btn');
    if (bgmBtn) {
      bgmBtn.addEventListener('click', () => {
        const isPlaying = audioManager.toggleBgm();
        bgmBtn.classList.toggle('active', isPlaying);
      });
    }

    const questsBtn = document.getElementById('header-quests-btn');
    if (questsBtn) {
      questsBtn.addEventListener('click', () => {
        this.questModal.show();
      });
    }

    const authBtn = document.getElementById('header-auth-btn');
    if (authBtn) {
      authBtn.addEventListener('click', () => {
        if (authService.isLoggedIn()) {
          this.authModal.show('profile');
        } else {
          this.authModal.show('login');
        }
      });
    }

    const logoutBtn = document.getElementById('header-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        authService.logout();
        this.player.updateProfile({
          name: `Khách #${Math.floor(1000 + Math.random() * 9000)}`,
          avatarId: 'dev_hoodie',
          role: 'guest'
        });
        this.updateHeaderProfile(null);
        this.socketManager.reconnectWithAuth();
      });
    }

    // 7. Quick Room Selector
    const roomSelector = document.getElementById('room-selector');
    if (roomSelector) {
      roomSelector.addEventListener('change', (e) => {
        const targetRoom = e.target.value;
        if (targetRoom && targetRoom !== this.currentRoomId) {
          const mapData = MAPS_CONFIG[targetRoom];
          if (mapData) {
            this.isTeleporting = false;
            this.teleportGraceUntil = performance.now() + 1500;
            this.lastTeleportTime = performance.now();
            this.loadRoom(targetRoom, mapData.spawnPoint.x, mapData.spawnPoint.y, true);
          }
        }
      });
    }

    // 8. Fullscreen API
    const fsBtn = document.getElementById('fullscreen-btn');
    if (fsBtn) {
      fsBtn.addEventListener('click', () => this.toggleFullscreen());
    }

    document.addEventListener('fullscreenchange', () => {
      this.updateFullscreenIcon();
    });

    const currentUser = authService.getUser();
    this.updateHeaderProfile(currentUser);
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn('Error attempting to enable fullscreen:', err.message);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  updateFullscreenIcon() {
    const isFs = !!document.fullscreenElement;
    const expandIcon = document.getElementById('fullscreen-icon-expand');
    const compressIcon = document.getElementById('fullscreen-icon-compress');

    if (expandIcon && compressIcon) {
      if (isFs) {
        expandIcon.classList.add('hidden');
        compressIcon.classList.remove('hidden');
      } else {
        expandIcon.classList.remove('hidden');
        compressIcon.classList.add('hidden');
      }
    }
  }

  updateHeaderProfile(user) {
    const nameEl = document.getElementById('header-user-name');
    const roleEl = document.getElementById('header-user-role');
    const authBtnText = document.getElementById('auth-btn-text');
    const logoutBtn = document.getElementById('header-logout-btn');

    if (user && user.display_name) {
      if (nameEl) nameEl.textContent = user.display_name;
      if (roleEl) {
        roleEl.className = `role-tag ${user.role || 'dev'}`;
        roleEl.textContent = user.role === 'admin' ? 'Admin' :
                             user.role === 'leader' ? 'Leader' :
                             user.role === 'dev' ? 'Dev' : 'Khách';
      }
      if (authBtnText) authBtnText.textContent = 'Hồ Sơ';
      if (logoutBtn) logoutBtn.classList.remove('hidden');
    } else {
      if (nameEl) nameEl.textContent = 'Khách vãng lai';
      if (roleEl) {
        roleEl.className = 'role-tag guest';
        roleEl.textContent = 'Khách';
      }
      if (authBtnText) authBtnText.textContent = 'Đăng Nhập';
      if (logoutBtn) logoutBtn.classList.add('hidden');
    }
  }

  handleCurrentPlayers(players, myId) {
    for (const [id, pData] of Object.entries(players)) {
      if (id !== myId && !this.remotePlayers.has(id)) {
        if (pData.wardrobeConfig) {
          TextureGenerator.generateCustomAvatar(this, pData.wardrobeConfig, `char_${id}`);
        }

        const remote = new RemotePlayer(this, pData.x, pData.y, {
          name: pData.name,
          avatarId: pData.wardrobeConfig ? id : (pData.avatarId || 'dev_hoodie'),
          role: pData.role || 'dev',
          equippedItemId: pData.equippedItemId,
          id
        });
        this.remotePlayers.set(id, remote);
      }
    }
  }

  handleNewPlayer(pData) {
    if (!this.remotePlayers.has(pData.id)) {
      if (pData.wardrobeConfig) {
        TextureGenerator.generateCustomAvatar(this, pData.wardrobeConfig, `char_${pData.id}`);
      }

      const remote = new RemotePlayer(this, pData.x, pData.y, {
        name: pData.name,
        avatarId: pData.wardrobeConfig ? pData.id : (pData.avatarId || 'dev_hoodie'),
        role: pData.role || 'dev',
        equippedItemId: pData.equippedItemId,
        id: pData.id
      });
      this.remotePlayers.set(pData.id, remote);
    }
  }

  handleRemoteMovement({ id, x, y, direction, isMoving }) {
    const remote = this.remotePlayers.get(id);
    if (remote) {
      remote.setTargetPosition(x, y, direction, isMoving);
    }
  }

  handlePlayerUpdated({ id, name, avatarId, role, equippedItemId, wardrobeConfig }) {
    const remote = this.remotePlayers.get(id);
    if (remote) {
      if (wardrobeConfig && typeof wardrobeConfig === 'object') {
        const logicalKey = `char_${id}`;
        const oldActualKey = remote.texture ? remote.texture.key : null;
        // Tạo texture mới an toàn (versioned key)
        const newActualKey = TextureGenerator.generateCustomAvatar(this, wardrobeConfig, logicalKey);
        const keyToUse = newActualKey || logicalKey;
        if (this.textures.exists(keyToUse)) {
          remote.setTexture(keyToUse, 0);
          // Cleanup old versioned key sau khi Sprite đã swap
          TextureGenerator.cleanupOldKey(this, logicalKey, oldActualKey);
        }
        avatarId = id;
      }
      remote.updateProfile({ name, avatarId, role, equippedItemId });
    }
  }

  handlePlayerDisconnected(socketId) {
    const remote = this.remotePlayers.get(socketId);
    if (remote) {
      remote.destroy();
      this.remotePlayers.delete(socketId);
    }
  }

  handleNewChatMessage({ id, name, role, avatarId, message, timestamp }) {
    const isSelf = this.socketManager.socket?.id === id;

    if (this.chatBox) {
      this.chatBox.addMessage({ name, role, avatarId, message, isSelf, timestamp });
    }

    if (isSelf && this.player) {
      this.player.showSpeechBubble(message);
    } else {
      const remote = this.remotePlayers.get(id);
      if (remote) {
        remote.showSpeechBubble(message);
      }
    }
  }

  handleLocalEmote(emoteId) {
    if (this.player) {
      this.player.showEmote(emoteId);
    }
    if (emoteId === 'dance' && this.achievementManager) {
      this.achievementManager.unlock('stage_dancer');
    }
    if (this.socketManager) {
      this.socketManager.sendEmote(emoteId);
    }
  }

  handleRemoteEmote({ id, emoteId }) {
    const isSelf = this.socketManager?.socket?.id === id;
    if (isSelf) return;

    const remote = this.remotePlayers.get(id);
    if (remote) {
      remote.showEmote(emoteId);
      audioManager.playEmoteSound(emoteId);
    }
  }

  update(time, delta) {
    if (this.player && this.inputController && !this.isTeleporting) {
      const inputData = this.inputController.getMovementVector();
      this.player.update(inputData);

      if (inputData.isMoving) {
        if (this.audioManager) {
          this.audioManager.playFootstep();
        }
        if (this.ambientManager && Math.random() < 0.22) {
          this.ambientManager.spawnFootstepDust(this.player.x, this.player.y);
        }
      }

      if (this.socketManager) {
        this.socketManager.sendMovement(
          this.player.x,
          this.player.y,
          this.player.currentDirection,
          inputData.isMoving
        );
      }
    }

    if (this.interactionManager && this.player) {
      this.interactionManager.update(this.player);
    }

    if (this.inventoryManager && this.player) {
      this.inventoryManager.update(this.player);
    }

    for (const remote of this.remotePlayers.values()) {
      remote.update(time, delta);
    }

    if (this.minimap) {
      this.minimap.render();
    }
  }
}

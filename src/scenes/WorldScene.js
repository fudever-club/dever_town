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
  SpeedCodeDuel,
  DailyGoalHUD,
  PlayerProfileModal,
  FriendRequestModal,
  FriendsListModal,
  AvatarSelectorModal,
  UNLOCKABLE_AVATARS
} from '../ui/index.js';
import { BestiePetFollower } from '../entities/BestiePetFollower.js';
import { friendManager } from '../managers/FriendManager.js';
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
import { TilePool } from '../utils/TilePool.js';
import { telemetry } from '../utils/Telemetry.js';
import { FloorManager } from '../managers/FloorManager.js';
import { WindSlashFX } from '../ui/common/WindSlashFX.js';

export class WorldScene extends Phaser.Scene {
  constructor() {
    super('WorldScene');
    this.currentRoomId = 'main_hall';
    this.remotePlayers = new Map();
    this.isTeleporting = false;
    this.lastTeleportTime = 0;
    this.teleportGraceUntil = 0;
    this.tilePool = null;
    this.tileSprites = [];
    this.portalLabels = [];
    this.obstacleShadows = [];
    this.audioManager = audioManager;
    this.i18n = i18n;
    this.playerSessionActive = false;
  }

  create() {
    this.physics.world.setBounds(0, 0, GAME_CONFIG.MAP_WIDTH, GAME_CONFIG.MAP_HEIGHT);

    // 0. Khởi tạo Juice, Môi trường hạt & Thành tựu
    this.tilePool = new TilePool(this, 550);
    this.juiceManager = new JuiceManager(this);
    this.ambientManager = new AmbientEnvironmentManager(this);
    this.achievementManager = new AchievementManager({ scene: this, juiceManager: this.juiceManager });
    this.campusTicker = new CampusTicker();
    this.floorManager = new FloorManager(this);

    // 1. Khởi tạo Local Player
    const user = authService.getUser();
    const mapData = this.floorManager.getCurrentFloorData(this.currentRoomId) || MAPS_CONFIG.main_hall;
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
        if (zoneData.type === 'stair_transition') {
          if (this.floorManager) {
            const targetFloor = zoneData.targetFloor;
            const spawnX = targetFloor === 0 ? 112 : (targetFloor === 1 ? 112 : 680);
            const spawnY = targetFloor === 0 ? 100 : 80;
            this.floorManager.transitionToFloor(targetFloor, { spawnX, spawnY });
          }
          return;
        }
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
        if (item && (item.id === 'macbook_dev' || item.id === 'keychron_kb') && this.achievementManager) {
          this.achievementManager.unlock('tech_pro');
        }
      }
    });

    // 3. Xây dựng bản đồ phòng
    this.windSlashFX = new WindSlashFX(this);
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

    // Dùng named reference để có thể removeEventListener trong shutdown()
    this._resizeHandler = () => this.updateCameraZoom();
    this._orientationHandler = () => setTimeout(() => this.updateCameraZoom(), 150);
    window.addEventListener('resize', this._resizeHandler);
    window.addEventListener('orientationchange', this._orientationHandler);

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

    // 9. Bestie Pet Follower & Global Scene Ref
    window.__WORLD_SCENE__ = this;
    this.initBestiePetFollower();
  }

  initBestiePetFollower() {
    const highestPet = friendManager.getHighestStreakPet();
    if (highestPet && highestPet.level >= 2 && this.player) {
      if (!this.bestiePetFollower) {
        this.bestiePetFollower = new BestiePetFollower(this, this.player, highestPet);
      } else {
        this.bestiePetFollower.setPetData(highestPet);
      }
    }

    // Tự động cập nhật linh thú đồng hành khi kết bạn mới hoặc streak thay đổi
    friendManager.subscribe(() => {
      const pet = friendManager.getHighestStreakPet();
      if (pet && pet.level >= 2 && this.player) {
        if (!this.bestiePetFollower) {
          this.bestiePetFollower = new BestiePetFollower(this, this.player, pet);
        } else {
          this.bestiePetFollower.setPetData(pet);
        }
      } else if (this.bestiePetFollower && (!pet || pet.level < 2)) {
        this.bestiePetFollower.destroy();
        this.bestiePetFollower = null;
      }
    });
  }

  openPlayerProfile(playerData) {
    if (!this.playerProfileModal || !playerData) return;
    const data = {
      id: playerData.id || playerData.socketId || playerData.name,
      name: playerData.name || 'Người chơi',
      role: playerData.role || 'dev',
      avatarId: playerData.avatarId || 'dev_hoodie',
      x: playerData.x,
      y: playerData.y,
      isOnline: true
    };
    this.playerProfileModal.show(data);
    if (this.audioManager) {
      this.audioManager.playClick();
    }
  }

  handleFriendRequestReceived(data) {
    if (this.friendRequestModal) {
      this.friendRequestModal.show(data);
    }
  }

  handleFriendRequestResponse(data) {
    friendManager.clearPending(data.fromName);
    if (data.fromSocketId) friendManager.clearPending(data.fromSocketId);

    if (data.accepted) {
      // Đối phương đã đồng ý kết bạn
      friendManager.addFriend({
        id: data.fromSocketId,
        name: data.fromName,
        role: data.fromRole,
        avatarId: data.fromAvatarId
      });
      if (this.audioManager && this.audioManager.playFanfare) {
        this.audioManager.playFanfare();
      }
      this.showToast(`${data.fromName} đã đồng ý kết bạn! Chuỗi Streak ngày 1 đã bắt đầu.`);
    } else {
      // Đối phương từ chối
      this.showToast(`${data.fromName} đã từ chối lời mời kết bạn.`);
    }

    if (this.playerProfileModal && this.playerProfileModal.isOpen) {
      this.playerProfileModal.renderFriendshipContent();
    }
  }

  handleFriendRequestSent(data) {
    this.showToast(`Đã gửi lời mời kết bạn tới ${data.targetName}. Đang chờ phản hồi...`);
  }

  handleFriendRequestFailed(data) {
    this.showToast(`${data.message || 'Không thể gửi lời mời kết bạn.'}`);
    if (this.playerProfileModal && this.playerProfileModal.isOpen) {
      this.playerProfileModal.renderFriendshipContent();
    }
  }

  handleNewPrivateMessage(data) {
    if (this.chatBox) {
      this.chatBox.addPrivateMessage({
        senderId: data.senderId,
        senderName: data.senderName,
        senderRole: data.senderRole,
        senderAvatarId: data.senderAvatarId,
        targetName: data.targetName,
        message: data.message,
        timestamp: data.timestamp,
        isSelf: false
      });
    }
    if (this.audioManager && this.audioManager.playMessage) {
      this.audioManager.playMessage();
    }
  }

  handlePrivateMessageSent(data) {
    // Delivery confirmed
  }

  handlePrivateMessageFailed(data) {
    this.showToast(`${data.targetName}: ${data.message || 'Không thể gửi tin nhắn riêng.'}`);
  }

  showToast(message) {
    let toast = document.getElementById('dever-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'dever-toast';
      toast.className = 'dever-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
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
    if (this.currentRoomId !== roomId && this.floorManager) {
      this.floorManager.resetFloor();
    }

    const mapData = this.floorManager ? this.floorManager.getCurrentFloorData(roomId) : MAPS_CONFIG[roomId];
    if (!mapData) return;

    this.currentRoomId = roomId;
    this.mapData = mapData;
    questManager.recordRoomVisit(roomId);

    if (this.hudText) {
      const roomName = this.i18n ? (this.i18n.get(`rooms.${roomId}`) || mapData.name) : mapData.name;
      const floorCount = this.floorManager ? this.floorManager.getFloorCount(roomId) : 1;
      const floorIdx = this.floorManager ? this.floorManager.currentFloor : 0;
      const floorSuffix = floorCount > 1 ? ` — Tầng ${floorIdx + 1}/${floorCount}` : '';
      this.hudText.setText(`DEVER TOWN | ${roomName}${floorSuffix}`);
    }

    if (this.tilePool) {
      this.tilePool.releaseAll();
    } else if (this.tileSprites && this.tileSprites.length > 0) {
      this.tileSprites.forEach(t => t.destroy());
      this.tileSprites = [];
    }
    if (this.portalLabels && this.portalLabels.length > 0) {
      this.portalLabels.forEach(lbl => lbl.destroy());
      this.portalLabels = [];
    }
    if (this.obstacleShadows && this.obstacleShadows.length > 0) {
      this.obstacleShadows.forEach(s => s.destroy());
      this.obstacleShadows = [];
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
        const isSolid = solidTiles.has(tileType);

        // S2.D: Y-sort depth system (Floor = 0; Obstacles = posY + 15)
        const tileDepth = isSolid ? (posY + (tileSize / 2) - 1) : 0;

        if (this.tilePool) {
          this.tilePool.acquire(posX, posY, tileType, tileDepth);
        } else {
          const tileSprite = this.add.image(posX, posY, 'town_tileset', tileType);
          tileSprite.setDepth(tileDepth);
          this.tileSprites.push(tileSprite);
        }

        if (isSolid) {
          const obstacle = this.obstacleGroup.create(posX, posY, 'town_tileset', tileType);
          obstacle.setVisible(false);
          obstacle.refreshBody();

          // S2.D: Drop shadow mềm mại dưới chân các vật thể đứng trên sàn (trừ tường phẳng 2 và 15)
          if (tileType !== 2 && tileType !== 15) {
            const shadow = this.add.ellipse(
              posX,
              posY + tileSize * 0.38,
              tileSize * 0.72,
              tileSize * 0.24,
              0x000000,
              0.22
            );
            shadow.setDepth(1); // Trên mặt sàn (0), dưới chân người chơi và obstacle
            this.obstacleShadows.push(shadow);
          }
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
          fontSize: '11px',
          fontWeight: '700',
          color: '#e9d5ff',
          stroke: '#1e1b4b',
          strokeThickness: 3,
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          padding: { x: 8, y: 3 },
          resolution: typeof window !== 'undefined' && window.devicePixelRatio ? Math.min(window.devicePixelRatio, 2) : 2
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
      this.player.body.setVelocity(0, 0);
      if (this.bestiePetFollower) {
        this.bestiePetFollower.setPosition(spawnX, spawnY);
      }
    }

    this.teleportGraceUntil = performance.now() + 3500;
    this.lastTeleportTime = performance.now();

    // Cập nhật hiệu ứng hạt môi trường cho phòng
    if (this.ambientManager) {
      this.ambientManager.setRoom(roomId);
    }

    // Kiểm tra mở khóa Tân Thủ DEVER khi đến Sảnh Alpha
    if (this.playerSessionActive && this.achievementManager && roomId === 'main_hall') {
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
    if (now - this.lastTeleportTime < 2500) return;

    this.isTeleporting = true;
    this.lastTeleportTime = now;

    if (this.audioManager) {
      this.audioManager.playTeleport();
    }

    telemetry.track('room_visit', { room_id: portalData.targetRoomId });

    // Hiệu ứng chớp sáng trắng nhanh (Pokemon GBA flash) trước khi fade to black
    this.cameras.main.flash(70, 255, 255, 255, false);
    this.time.delayedCall(70, () => {
      this.cameras.main.fadeOut(180, 11, 15, 25);
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
    // 1. Chat Box (Kênh Phòng & Bạn Bè Riêng Tư)
    this.chatBox = new ChatBox({
      onSendMessage: (message) => {
        this.socketManager.sendChatMessage(message);
        questManager.incrementProgress('chat_connect', 1);
      },
      onSendPrivateMessage: ({ targetSocketId, targetName, message }) => {
        this.socketManager.sendPrivateMessage({ targetSocketId, targetName, message });
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
      },
      onAchievement: (achievementId) => this.achievementManager?.unlock(achievementId)
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
    this.dailyGoalHud = new DailyGoalHUD({
      onOpenQuests: (triggerEl) => this.questModal.show(triggerEl)
    });

    // 7. Auth Modal
    this.authModal = new AuthModal({
      onAuthSuccess: ({ user, isGuest }) => {
        this.activatePlayerSession();
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
    this.speedCodeDuel = new SpeedCodeDuel({ scene: this });

    // 14. Hồ Sơ Bạn Bè & Thú Cưng Đồng Hành (Player Profile Modal)
    this.playerProfileModal = new PlayerProfileModal({
      onWhisper: (p) => {
        if (this.chatBox && p && p.name) {
          const friend = friendManager.getFriend(p.name);
          if (friend) {
            this.chatBox.openPrivateChatWith(friend);
          } else {
            this.chatBox.openPrivateChatWith({ id: p.id, name: p.name, role: p.role, avatarId: p.avatarId });
          }
        }
      },
      onTeleportTo: (p) => {
        if (this.player && p && p.x !== undefined && p.y !== undefined) {
          this.player.setPosition(p.x + 24, p.y);
          if (this.player.body) this.player.body.reset(p.x + 24, p.y);
          if (this.audioManager) this.audioManager.playTeleport();
        }
      }
    });

    // 15. Modal Duyệt Lời Mời Kết Bạn Realtime (2-Way Handshake)
    this.friendRequestModal = new FriendRequestModal({
      onAccept: (req) => {
        if (this.socketManager) {
          this.socketManager.respondFriendRequest({ fromSocketId: req.fromSocketId, accepted: true });
        }
        friendManager.addFriend({
          id: req.fromSocketId,
          name: req.fromName,
          role: req.fromRole,
          avatarId: req.fromAvatarId
        });
        if (this.audioManager && this.audioManager.playFanfare) {
          this.audioManager.playFanfare();
        }
        this.showToast(`Bạn và ${req.fromName} đã trở thành bạn bè! Chuỗi Streak ngày 1 đã bắt đầu.`);
      },
      onDecline: (req) => {
        if (this.socketManager) {
          this.socketManager.respondFriendRequest({ fromSocketId: req.fromSocketId, accepted: false });
        }
        this.showToast(`Đã từ chối lời mời kết bạn từ ${req.fromName}.`);
      }
    });

    // 16. Modal Danh Sách Bạn Bè (Friends List Modal)
    this.friendsListModal = new FriendsListModal({
      onViewProfile: (friend) => {
        if (this.playerProfileModal) {
          this.playerProfileModal.show({
            id: friend.id,
            name: friend.name,
            role: friend.role,
            avatarId: friend.avatarId,
            equippedItemId: friend.equippedItemId
          });
        }
      },
      onChatWith: (friend) => {
        if (this.chatBox) {
          this.chatBox.openPrivateChatWith(friend);
        }
      }
    });

    // 17. Modal Đổi Avatar Cá Nhân & Mở Khóa (Avatar Selector Modal)
    this.avatarSelectorModal = new AvatarSelectorModal({
      onAvatarChanged: (avatarData) => {
        const avatarWrap = document.getElementById('header-user-avatar-wrap');
        if (avatarWrap) {
          if (avatarData.customUrl) {
            avatarWrap.innerHTML = `<img src="${avatarData.customUrl}" alt="Avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`;
          } else {
            const item = UNLOCKABLE_AVATARS.find(a => a.id === avatarData.avatarId);
            avatarWrap.innerHTML = `<span>${item?.icon || '🧑‍💻'}</span>`;
          }
        }

        if (this.player) {
          this.player.avatarId = avatarData.avatarId;
          this.player.customAvatarUrl = avatarData.customUrl;
        }

        if (this.socketManager && this.socketManager.socket && this.socketManager.socket.connected) {
          this.socketManager.socket.emit('updateProfile', {
            avatarId: avatarData.avatarId,
            customAvatarUrl: avatarData.customUrl
          });
        }
      }
    });

    // 7. Header Buttons
    const avatarBtn = document.getElementById('header-avatar-btn');
    if (avatarBtn) {
      avatarBtn.addEventListener('click', () => {
        this.avatarSelectorModal.toggle();
      });
    }

    const userBadge = document.getElementById('header-user-badge');
    if (userBadge) {
      userBadge.addEventListener('click', () => {
        if (this.playerProfileModal) {
          const customUrl = localStorage.getItem('dever_custom_avatar_url');
          const avatarId = localStorage.getItem('dever_current_avatar') || 'avatar_dev_hoodie';
          const user = authService.getUser();
          this.playerProfileModal.show({
            id: 'me',
            isMe: true,
            name: user?.display_name || this.player?.name || 'Bạn',
            role: user?.role || 'dev',
            avatarId: avatarId,
            customAvatarUrl: customUrl,
            wardrobeConfig: this.player?.wardrobeConfig,
            equippedItemId: this.inventoryManager?.equippedItem?.id
          });
        }
      });
    }

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

    const friendsBtn = document.getElementById('header-friends-btn');
    if (friendsBtn) {
      friendsBtn.addEventListener('click', () => {
        this.friendsListModal.toggle();
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

    const authBtn = document.getElementById('header-auth-btn');
    if (authBtn) {
      authBtn.addEventListener('click', () => {
        if (authService.isLoggedIn()) {
          // Bấm vào Hồ Sơ ở header mở ngay Player Profile với hoạt ảnh 360 độ
          if (this.playerProfileModal) {
            const customUrl = localStorage.getItem('dever_custom_avatar_url');
            const avatarId = localStorage.getItem('dever_current_avatar') || 'avatar_dev_hoodie';
            const user = authService.getUser();
            this.playerProfileModal.show({
              id: 'me',
              isMe: true,
              name: user?.display_name || this.player?.name || 'Bạn',
              role: user?.role || 'dev',
              avatarId: avatarId,
              customAvatarUrl: customUrl,
              wardrobeConfig: this.player?.wardrobeConfig,
              equippedItemId: this.inventoryManager?.equippedItem?.id
            });
          }
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
            this.teleportGraceUntil = performance.now() + 3500;
            this.lastTeleportTime = performance.now();
            if (this.player && this.player.body) {
              this.player.body.setVelocity(0, 0);
            }
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

  activatePlayerSession() {
    this.playerSessionActive = true;
    questManager.startSession({ currentRoomId: this.currentRoomId });
    if (this.currentRoomId === 'main_hall' && this.achievementManager) {
      this.achievementManager.unlock('first_arrival');
    }

    const isGuest = !authService.isLoggedIn();
    telemetry.init({ isGuest });
    telemetry.track('world_entered', { room_id: this.currentRoomId });
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

    // Cập nhật Avatar trên header badge
    const avatarWrap = document.getElementById('header-user-avatar-wrap');
    if (avatarWrap) {
      const customUrl = localStorage.getItem('dever_custom_avatar_url');
      const avatarId = localStorage.getItem('dever_current_avatar') || 'avatar_dev_hoodie';
      if (customUrl) {
        avatarWrap.innerHTML = `<img src="${customUrl}" alt="Avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`;
      } else {
        const item = UNLOCKABLE_AVATARS.find(a => a.id === avatarId);
        avatarWrap.innerHTML = `<span>${item?.icon || '🧑‍💻'}</span>`;
      }
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

      // Kích hoạt hoạt ảnh võ thuật & hành động tương tác (Phím J: Đấm, Phím K: Đá, Phím X: Ngồi)
      if (this.inputController.isPunchJustDown()) {
        this.player.punch();
      } else if (this.inputController.isKickJustDown()) {
        this.player.kick();
      } else if (this.inputController.isSitJustDown()) {
        this.player.sit();
      }

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

    if (this.windSlashFX) {
      this.windSlashFX.update(delta / 1000);
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

    if (this.bestiePetFollower) {
      this.bestiePetFollower.update();
    }

    if (this.minimap) {
      this.minimap.render();
    }
  }

  shutdown() {
    if (this.windSlashFX) {
      this.windSlashFX.destroy();
      this.windSlashFX = null;
    }
    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler);
      this._resizeHandler = null;
    }
    if (this._orientationHandler) {
      window.removeEventListener('orientationchange', this._orientationHandler);
      this._orientationHandler = null;
    }

    if (this.tilePool) {
      this.tilePool.destroy();
      this.tilePool = null;
    }

    if (this.obstacleShadows && this.obstacleShadows.length > 0) {
      this.obstacleShadows.forEach(s => s.destroy());
      this.obstacleShadows = [];
    }

    if (this._toastTimer) {
      clearTimeout(this._toastTimer);
      this._toastTimer = null;
    }
  }
}


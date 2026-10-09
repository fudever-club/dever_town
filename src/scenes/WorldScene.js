import Phaser from 'phaser';
import { NPC } from '../entities/NPC.js';
import { NPC_CONFIG } from '../config/npcs.js';
import { NPCDialogueModal } from '../ui/gameplay/NPCDialogueModal.js';
import { GAME_CONFIG, PORTAL_LABEL_CONFIG } from '../config/gameConfig.js';
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
  RadialEmoteWheel,
  SpeedCodeDuel,
  DailyGoalHUD,
  PlayerProfileModal,
  FriendRequestModal,
  FriendsListModal,
  AvatarSelectorModal,
  UNLOCKABLE_AVATARS,
  CampusTimeHUD
} from '../ui/index.js';
import { DAY_NIGHT_CYCLE_ENABLED } from '../config/lightingConfig.js';
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
import { LightingManager } from '../managers/LightingManager.js';
import { JuiceManager } from '../managers/JuiceManager.js';
import { AchievementManager } from '../managers/AchievementManager.js';
import { CampusTicker } from '../ui/common/CampusTicker.js';
import { HelpOverlay } from '../ui/common/HelpOverlay.js';
import { FocusMode } from '../ui/common/FocusMode.js';
import { HeaderOverflowMenu } from '../ui/common/HeaderOverflowMenu.js';
import { TilePool } from '../utils/TilePool.js';
import { ZoomControls } from '../ui/hud/ZoomControls.js';
import {
  CAMERA_VIEW_W,
  CAMERA_VIEW_H,
  CAMERA_BOUNDS_PAD_X,
  CAMERA_BOUNDS_PAD_Y,
  CAMERA_ZOOM,
  XRAY,
  computeMinZoom,
  clampZoom,
  snapZoom,
  parseStoredZoom,
  computeDefaultMobileZoom,
  isOccluderTileType,
  shouldXrayFade,
  worldPointAt,
  zoomToPointScroll
} from '../config/cameraConfig.js';
import { telemetry } from '../utils/Telemetry.js';
import { PERF_CONFIG } from '../config/perfConfig.js';
import { isInCulledView } from '../utils/culling.js';
import { FloorManager } from '../managers/FloorManager.js';
import { SceneTransitionManager } from '../managers/SceneTransitionManager.js';

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
    this._portalLabelTimer = 0;
    this.obstacleShadows = [];
    // Camera zoom (x-ray): tile che khuất, zoom người dùng, tween/pinch state
    this.occluderTiles = [];
    this.zoomControls = null;
    this._userZoom = null;
    // true = zoom tự động theo viewport (tính lại khi resize); false = người dùng đã chỉnh tay.
    this._zoomIsAuto = true;
    this._zoomTween = null;
    this._xrayTimer = 0;
    this._tileCullTimer = 0;
    this._wheelHandler = null;
    this._pinchPointers = new Map();
    this._pinchStart = null;
    this.npcGroup = [];
    this.npcDialogueModal = null;
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
    this.lightingManager = new LightingManager(this);
    // L2: tắt chu kỳ ngày/đêm thì không cần HUD đồng hồ (luôn sáng như gather.town)
    this.campusTimeHUD = DAY_NIGHT_CYCLE_ENABLED
      ? new CampusTimeHUD({ lightingManager: this.lightingManager })
      : null;
    this.achievementManager = new AchievementManager({ scene: this, juiceManager: this.juiceManager });
    this.campusTicker = new CampusTicker();
    this.helpOverlay = new HelpOverlay();
    this.focusMode = new FocusMode();
    this.headerOverflowMenu = new HeaderOverflowMenu();
    this.floorManager = new FloorManager(this);
    this.transitionManager = new SceneTransitionManager(this);

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
            // Đọc spawn từ floor config thay vì hardcode
            const currentMapConfig = MAPS_CONFIG[this.currentRoomId] || {};
            const floorData = (currentMapConfig.floors || [])[targetFloor];
            const spawnX = zoneData.spawnX ?? floorData?.spawnPoint?.x ?? 400;
            const spawnY = zoneData.spawnY ?? floorData?.spawnPoint?.y ?? 350;
            this.floorManager.transitionToFloor(targetFloor, { spawnX, spawnY });
          }
          return;
        }
        // Ghế/sofa ngồi: E bật/tắt tư thế ngồi qua Player FSM (interface từ Player worker).
        // Guard typeof để an toàn nếu Player worker chưa merge sit()/standUp().
        if (zoneData.type === 'sit_chair' || zoneData.type === 'sit_sofa') {
          const player = this.player;
          if (player) {
            const sitting = typeof player.isSitting === 'function' ? player.isSitting() : !!player.pose;
            if (sitting) {
              if (typeof player.standUp === 'function') player.standUp();
            } else {
              const pose = zoneData.type === 'sit_chair' ? 'upright' : 'leanback';
              if (typeof player.sit === 'function') player.sit(pose);
            }
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

    // 3. Khởi tạo NPC Group & Dialogue Modal
    this.npcGroup = [];
    this.npcDialogueModal = new NPCDialogueModal(this);

    if (this.input?.keyboard) {
      this.input.keyboard.on('keydown-E', () => {
        if (this.npcDialogueModal?.isOpen) return;
        if (!this.player) return;

        let closestNPC = null;
        let minDistance = Infinity;
        const INTERACTION_MAX_DIST = 56; // Bán kính tương tác thực tế (~1.75 tile)

        (this.npcGroup || []).forEach(npc => {
          if (!npc || npc.state === 'talking') return;
          const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
          if (dist < minDistance && dist <= INTERACTION_MAX_DIST) {
            minDistance = dist;
            closestNPC = npc;
          }
        });

        if (closestNPC) {
          closestNPC.state = 'talking';
          this.npcDialogueModal.show(closestNPC);
          return;
        }
      });
    }

    // 4. Xây dựng bản đồ phòng
    this.loadRoom(this.currentRoomId, spawnX, spawnY, false);

    // 5. Camera Follow với vùng đệm rộng rãi (Headroom Padding)
    // Giúp khi đi lên phía Bắc (North) camera có không gian mở rộng thoáng đãng, không bị gò bó hoặc che khuất tên phòng.
    // Chế độ RESIZE: updateCameraBounds() mở rộng bounds theo viewport thực tế
    // để player luôn ở giữa màn hình và vùng thế giới hiển thị tăng theo kích
    // thước màn hình (không chỉ phóng to điểm ảnh).
    const camera = this.cameras.main;
    camera.startFollow(this.player, true, 0.08, 0.08);
    camera.setRoundPixels(true);

    this.updateCameraBounds();
    this.updateCameraZoom();

    // Dùng named reference để có thể removeEventListener trong shutdown()
    this._resizeHandler = () => this.updateCameraZoom();
    this._orientationHandler = () => setTimeout(() => this.updateCameraZoom(), 150);
    window.addEventListener('resize', this._resizeHandler);
    window.addEventListener('orientationchange', this._orientationHandler);
    // Phaser.Scale.RESIZE: ScaleManager xử lý window 'resize' qua dirty flag ở
    // frame kế tiếp (listener của window chạy trước, this.scale.width còn cũ) —
    // lắng nghe sự kiện 'resize' của ScaleManager để cập nhật bounds theo đúng
    // kích thước game mới nhất.
    this._scaleResizeHandler = () => this.updateCameraBounds();
    this.scale.on('resize', this._scaleResizeHandler);

    // 6. HUD & Network
    this.createHUD();
    // Camera zoom do người chơi điều khiển: wheel/pinch trên canvas + nút +/−
    this.setupZoomControls();
    this.zoomControls = new ZoomControls({ scene: this });
    this._refreshZoomUI();
    this.socketManager = new SocketManager(this);

    // 7. UI Modals & Network Monitor
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

  // ---------------------------------------------------------------------------
  // Camera zoom do người chơi điều khiển (wheel / pinch / nút +/−)
  // ---------------------------------------------------------------------------

  /** Khoảng zoom cho phép: [fit-room tính động, 2.5]. */
  getZoomRange() {
    const mapData = this.mapData || MAPS_CONFIG[this.currentRoomId] || MAPS_CONFIG.main_hall;
    let roomW = GAME_CONFIG.MAP_WIDTH;
    let roomH = GAME_CONFIG.MAP_HEIGHT;
    if (mapData && Array.isArray(mapData.layout) && mapData.layout.length > 0) {
      roomW = mapData.layout[0].length * GAME_CONFIG.TILE_SIZE;
      roomH = mapData.layout.length * GAME_CONFIG.TILE_SIZE;
    }
    return { min: computeMinZoom(roomW, roomH), max: CAMERA_ZOOM.MAX };
  }

  /**
   * Zoom mặc định: desktop = vừa khít phòng theo viewport thực tế (RESIZE),
   * mobile giữ công thức adaptive cũ.
   *
   * Trước đây desktop luôn 1.0 → trên màn hình lớn (1920x1080) phòng chỉ chiếm
   * một phần nhỏ giữa biển đen. Giờ tính fit-zoom động: min(viewW/roomW, viewH/roomH)
   * để phòng luôn lấp đầy viewport ở mọi kích thước màn hình.
   */
  computeDefaultZoom() {
    const isMobile = window.innerWidth <= 1024 || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (isMobile) {
      // Màn hình dọc: tối ưu nhân vật và map to rõ, vừa tầm mắt
      // Màn hình ngang: tầm nhìn rộng rãi bao quát căn phòng
      return computeDefaultMobileZoom(window.innerWidth, window.innerHeight);
    }
    // Desktop: auto-fit phòng vào viewport thực tế (chế độ RESIZE).
    const mapData = this.mapData || MAPS_CONFIG[this.currentRoomId] || MAPS_CONFIG.main_hall;
    let roomW = GAME_CONFIG.MAP_WIDTH;
    let roomH = GAME_CONFIG.MAP_HEIGHT;
    if (mapData && Array.isArray(mapData.layout) && mapData.layout.length > 0) {
      roomW = mapData.layout[0].length * GAME_CONFIG.TILE_SIZE;
      roomH = mapData.layout.length * GAME_CONFIG.TILE_SIZE;
    }
    const viewW = (this.scale && this.scale.width) || window.innerWidth;
    const viewH = (this.scale && this.scale.height) || window.innerHeight;
    const fitZoom = computeMinZoom(roomW, roomH, viewW, viewH);
    const range = this.getZoomRange();
    return snapZoom(clampZoom(fitZoom, range.min, CAMERA_ZOOM.MAX));
  }

  /** Zoom mà người chơi đang dùng (target, không phải giá trị tween giữa chừng). */
  getCurrentZoom() {
    if (this._userZoom != null) return this._userZoom;
    const camera = this.cameras && this.cameras.main;
    return camera ? camera.zoom : 1;
  }

  _loadStoredZoom() {
    try {
      const raw = localStorage.getItem(CAMERA_ZOOM.STORAGE_KEY);
      if (raw == null) return null;
      const range = this.getZoomRange();
      return parseStoredZoom(raw, range.min, range.max);
    } catch (e) {
      return null;
    }
  }

  _persistZoom(zoom) {
    try {
      localStorage.setItem(CAMERA_ZOOM.STORAGE_KEY, String(zoom));
    } catch (e) {}
  }

  /**
   * Chốt scroll về đúng tâm follow khi lerp bị kẹt (stall).
   * Phaser Camera.preRender với roundPixels: scroll = floor(lerp(scroll, target, 0.08)).
   * Khi |target − scroll| < 1/0.08 = 12.5 thì floor nuốt trọn bước lerp → scroll kẹt
   * vĩnh viễn, player lệch khỏi tâm tới 12.5 scroll-px (≈31 screen-px ở zoom 2.5).
   * Chỉ snap khi player đứng yên (giữ nguyên cảm giác camera "trailing" mượt khi di
   * chuyển), trong dải kẹt (không phá smoothing của lerp ở xa), và bỏ qua khi đang
   * tween zoom (giữ zoom-to-cursor) hoặc pan effect chạy.
   * Tâm scroll đúng theo Camera.preRender: scroll → follow − followOffset − w/2
   * (followOffset = 0: Phaser tự giữ tâm đúng ở mọi zoom, không cần hiệu chỉnh).
   */
  _snapFollowSettle() {
    const camera = this.cameras && this.cameras.main;
    if (!camera || !this.player || !this.player.body) return;
    if (camera._follow !== this.player) return;
    if (this._zoomTween) return;
    if (camera.panEffect && camera.panEffect.isRunning) return;
    const vel = this.player.body.velocity;
    if (Math.hypot(vel.x, vel.y) >= 1) return; // đang di chuyển: giữ lerp smoothing
    const lerpX = camera.lerp.x;
    const lerpY = camera.lerp.y;
    if (!(lerpX > 0) || !(lerpY > 0)) return;
    // Tâm scroll đúng theo Camera.preRender: scroll → follow − followOffset − w/2.
    const targetX = this.player.x - camera.followOffset.x - camera.width / 2;
    const targetY = this.player.y - camera.followOffset.y - camera.height / 2;
    if (Math.abs(targetX - camera.scrollX) <= 1 / lerpX) camera.scrollX = targetX;
    if (Math.abs(targetY - camera.scrollY) <= 1 / lerpY) camera.scrollY = targetY;
  }

  _refreshZoomUI() {
    if (this.zoomControls) {
      this.zoomControls.refresh(this.getCurrentZoom());
    }
  }

  /**
   * Áp zoom ngay lập tức về một điểm màn hình (dùng cho pinch, resize).
   * screenPt: tọa độ game-px tính từ góc trái-trên canvas.
   */
  applyZoomImmediate(newZoom, screenPt) {
    const camera = this.cameras && this.cameras.main;
    if (!camera) return;
    const range = this.getZoomRange();
    newZoom = snapZoom(clampZoom(newZoom, range.min, range.max));
    this._userZoom = newZoom;
    // Người dùng đã chỉnh tay → tắt auto-zoom, resize sau này giữ nguyên lựa chọn.
    this._zoomIsAuto = false;
    this._persistZoom(newZoom);
    if (screenPt) {
      const ox = camera.width / 2, oy = camera.height / 2;
      const wp = worldPointAt(screenPt.x, screenPt.y, camera.x, camera.y, camera.scrollX, camera.scrollY, camera.zoom, ox, oy);
      const sc = zoomToPointScroll(wp.x, wp.y, screenPt.x, screenPt.y, camera.x, camera.y, newZoom, ox, oy);
      camera.setZoom(newZoom);
      camera.scrollX = sc.scrollX;
      camera.scrollY = sc.scrollY;
    } else {
      camera.setZoom(newZoom);
    }
    this.updateCameraBounds(newZoom);
    this._refreshZoomUI();
  }

  /**
   * Zoom tới một điểm màn hình, mượt ~150ms (kiểu Google Maps).
   * Giữ nguyên điểm thế giới đang nằm dưới con trỏ.
   */
  setZoomAt(screenPt, newZoom, smooth = true) {
    const camera = this.cameras && this.cameras.main;
    if (!camera) return;
    const range = this.getZoomRange();
    newZoom = snapZoom(clampZoom(newZoom, range.min, range.max));
    this._userZoom = newZoom;
    // Người dùng đã chỉnh tay → tắt auto-zoom, resize sau này giữ nguyên lựa chọn.
    this._zoomIsAuto = false;
    this._persistZoom(newZoom);

    const ox = camera.width / 2, oy = camera.height / 2;
    const wp = worldPointAt(screenPt.x, screenPt.y, camera.x, camera.y, camera.scrollX, camera.scrollY, camera.zoom, ox, oy);
    const target = zoomToPointScroll(wp.x, wp.y, screenPt.x, screenPt.y, camera.x, camera.y, newZoom, ox, oy);

    if (this._zoomTween) {
      this._zoomTween.stop();
      this._zoomTween = null;
    }

    if (!smooth || Math.abs(newZoom - camera.zoom) < 0.005) {
      this.applyZoomImmediate(newZoom, screenPt);
      return;
    }

    const from = { zoom: camera.zoom, sx: camera.scrollX, sy: camera.scrollY };
    const scene = this;
    this._zoomTween = this.tweens.add({
      targets: from,
      zoom: newZoom,
      sx: target.scrollX,
      sy: target.scrollY,
      duration: CAMERA_ZOOM.SMOOTH_MS,
      ease: 'Sine.easeOut',
      onUpdate: () => {
        camera.setZoom(from.zoom);
        camera.scrollX = from.sx;
        camera.scrollY = from.sy;
      },
      onComplete: () => {
        this._zoomTween = null;
        scene.updateCameraBounds(newZoom);
        this._refreshZoomUI();
      }
    });
    // Cập nhật bounds theo zoom đích ngay để follow không bị kẹt clamp giữa tween.
    this.updateCameraBounds(newZoom);
    this._refreshZoomUI();
  }

  /** Zoom theo hệ số quanh tâm màn hình (dùng cho nút +/−). */
  zoomByStep(factor) {
    // RESIZE: tâm = kích thước camera thực tế, không còn cố định 800x600.
    const camera = this.cameras && this.cameras.main;
    const center = camera
      ? { x: camera.width / 2, y: camera.height / 2 }
      : { x: CAMERA_VIEW_W / 2, y: CAMERA_VIEW_H / 2 };
    this.setZoomAt(center, this.getCurrentZoom() * factor, true);
  }

  /**
   * Cập nhật camera bounds theo viewport hiện tại (dành cho Phaser.Scale.RESIZE).
   *
   * Bounds = max(phòng + headroom padding, vùng nhìn thấy ở zoom hiện tại),
   * căn giữa theo phòng:
   * - Viewport nhỏ (mobile/800x600): giữ nguyên bounds cũ (phòng + padding),
   *   hành vi không đổi so với trước đây.
   * - Viewport lớn: mở rộng bounds đúng bằng vùng camera nhìn thấy → player
   *   luôn ở giữa màn hình (startFollow không bị kẹt clamp), vùng thế giới
   *   hiển thị tăng theo kích thước màn hình thay vì chỉ phóng to điểm ảnh.
   *   Phần ngoài phòng là nền #070a12 (trùng màu nền trang).
   *
   * @param {number} [zoomOverride] - dùng zoom mục tiêu khi đang tween zoom.
   */
  updateCameraBounds(zoomOverride) {
    const camera = this.cameras && this.cameras.main;
    if (!camera) return;
    const zoom = (zoomOverride > 0 ? zoomOverride : camera.zoom) || 1;
    // this.scale.width/height = kích thước game thực tế ở chế độ RESIZE
    // (= kích thước CSS px của #game-container).
    const viewW = this.scale.width / zoom;
    const viewH = this.scale.height / zoom;
    const roomW = GAME_CONFIG.MAP_WIDTH;
    const roomH = GAME_CONFIG.MAP_HEIGHT;
    const w = Math.max(roomW + CAMERA_BOUNDS_PAD_X * 2, viewW);
    const h = Math.max(roomH + CAMERA_BOUNDS_PAD_Y * 2, viewH);
    camera.setBounds((roomW - w) / 2, (roomH - h) / 2, w, h);
  }

  updateCameraZoom() {
    if (!this.cameras || !this.cameras.main) return;
    const camera = this.cameras.main;
    const range = this.getZoomRange();

    // Chế độ auto (người dùng chưa chỉnh tay): tính lại fit-zoom theo viewport
    // hiện tại mỗi khi resize → phòng luôn lấp đầy màn hình ở mọi kích thước.
    // Chế độ manual (đã chỉnh tay hoặc có zoom lưu): giữ nguyên lựa chọn, chỉ re-clamp.
    // range.min vẫn tính theo mốc tham chiếu 800x600 (0.99–2.5 được giữ nguyên).
    let zoom;
    if (this._zoomIsAuto === false && this._userZoom != null) {
      zoom = this._userZoom;
    } else {
      zoom = this._loadStoredZoom();
      if (zoom == null) {
        zoom = this.computeDefaultZoom();
        this._zoomIsAuto = true;
      } else {
        // Có zoom đã lưu từ lần trước → coi như lựa chọn của người dùng.
        this._zoomIsAuto = false;
      }
    }
    zoom = snapZoom(clampZoom(zoom, range.min, range.max));
    this._userZoom = zoom;

    camera.setZoom(zoom);
    // Bounds phụ thuộc zoom (view = viewport/zoom): cập nhật để giữ tâm follow.
    this.updateCameraBounds(zoom);
    this._refreshZoomUI();
  }

  /** Wheel trên canvas → zoom tới con trỏ. CHỈ preventDefault trên canvas, trang vẫn cuộn được. */
  _screenPointFromClient(canvas, clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    // RESIZE: game-px = CSS-px (canvas lấp đầy container); giữ tỉ lệ scale để
    // vẫn đúng nếu CSS scale canvas khác kích thước game (VD mobile cũ).
    const sx = this.scale.width / (rect.width || 1);
    const sy = this.scale.height / (rect.height || 1);
    return {
      x: (clientX - rect.left) * sx,
      y: (clientY - rect.top) * sy
    };
  }

  setupZoomControls() {
    const canvas = this.game && this.game.canvas;
    if (!canvas || this._wheelHandler) return;

    this._wheelHandler = (e) => {
      e.preventDefault();
      const delta = e.deltaMode === 1 ? e.deltaY * 33 : e.deltaY;
      const factor = delta > 0 ? 1 / CAMERA_ZOOM.WHEEL_STEP : CAMERA_ZOOM.WHEEL_STEP;
      this.setZoomAt(this._screenPointFromClient(canvas, e.clientX, e.clientY), this.getCurrentZoom() * factor, true);
      this._showZoomHintOnce();
    };
    canvas.addEventListener('wheel', this._wheelHandler, { passive: false });

    // Pinch 2 ngón trên canvas (touch-action:none đã set trong zoom-controls.css)
    this._pinchPointers = new Map();
    this._pinchStart = null;

    this._pointerDownHandler = (e) => {
      if (e.pointerType !== 'touch') return;
      this._pinchPointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (this._pinchPointers.size === 2) {
        const pts = [...this._pinchPointers.values()];
        this._pinchStart = {
          dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y),
          zoom: this.getCurrentZoom()
        };
      }
    };
    this._pointerMoveHandler = (e) => {
      if (e.pointerType !== 'touch' || !this._pinchPointers.has(e.pointerId)) return;
      this._pinchPointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (this._pinchPointers.size === 2 && this._pinchStart && this._pinchStart.dist > 0) {
        const pts = [...this._pinchPointers.values()];
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        const midClient = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
        // Direct manipulation: áp ngay, không tween (tránh trễ)
        this.applyZoomImmediate(
          this._pinchStart.zoom * (dist / this._pinchStart.dist),
          this._screenPointFromClient(canvas, midClient.x, midClient.y)
        );
        this._showZoomHintOnce();
      }
    };
    const endPinch = (e) => {
      this._pinchPointers.delete(e.pointerId);
      if (this._pinchPointers.size < 2) this._pinchStart = null;
    };
    this._pointerUpHandler = endPinch;
    this._pointerCancelHandler = endPinch;

    canvas.addEventListener('pointerdown', this._pointerDownHandler);
    canvas.addEventListener('pointermove', this._pointerMoveHandler);
    canvas.addEventListener('pointerup', this._pointerUpHandler);
    canvas.addEventListener('pointercancel', this._pointerCancelHandler);
  }

  _removeZoomControls() {
    const canvas = this.game && this.game.canvas;
    if (canvas) {
      if (this._wheelHandler) canvas.removeEventListener('wheel', this._wheelHandler);
      if (this._pointerDownHandler) canvas.removeEventListener('pointerdown', this._pointerDownHandler);
      if (this._pointerMoveHandler) canvas.removeEventListener('pointermove', this._pointerMoveHandler);
      if (this._pointerUpHandler) canvas.removeEventListener('pointerup', this._pointerUpHandler);
      if (this._pointerCancelHandler) canvas.removeEventListener('pointercancel', this._pointerCancelHandler);
    }
    this._wheelHandler = null;
    this._pointerDownHandler = null;
    this._pointerMoveHandler = null;
    this._pointerUpHandler = null;
    this._pointerCancelHandler = null;
    if (this._zoomTween) {
      this._zoomTween.stop();
      this._zoomTween = null;
    }
    if (this.zoomControls) {
      this.zoomControls.destroy();
      this.zoomControls = null;
    }
  }

  /** Toast gợi ý zoom, text thuần túy, chỉ hiện 1 lần duy nhất. */
  _showZoomHintOnce() {
    try {
      if (localStorage.getItem(CAMERA_ZOOM.HINT_STORAGE_KEY)) return;
      localStorage.setItem(CAMERA_ZOOM.HINT_STORAGE_KEY, '1');
    } catch (e) {
      return;
    }
    this.showToast('Cuộn chuột / pinch để zoom');
  }

  // ---------------------------------------------------------------------------
  // X-ray ("xuyên thấu"): tile che khuất mờ khi player đứng sau
  // ---------------------------------------------------------------------------

  /**
   * Trigger A (luôn bật) + Trigger B dollhouse (cờ XRAY.DOLLHOUSE_ENABLED).
   * Rẻ: AABB với player, throttle 100ms, tween 150ms, state-tracked chống churn.
   */
  _updateXray() {
    if (!this.occluderTiles || this.occluderTiles.length === 0 || !this.player) return;
    const camera = this.cameras && this.cameras.main;
    const zoom = camera ? camera.zoom : 1;
    const px = this.player.x;
    const py = this.player.y;
    const tileSize = GAME_CONFIG.TILE_SIZE;

    for (const o of this.occluderTiles) {
      const behindA = shouldXrayFade(px, py, o.x, o.y, tileSize);
      // Dollhouse chỉ khi zoom dưới mức tối thiểu (auto-zoom mặc định có thể
      // là 0.99 nên ngưỡng 1.0 cũ sẽ kích hoạt nhầm ở chế độ mặc định).
      const dollhouse = XRAY.DOLLHOUSE_ENABLED && zoom < this.getZoomRange().min && o.row <= XRAY.DOLLHOUSE_MAX_ROW;
      const targetAlpha = behindA ? XRAY.FADE_ALPHA : (dollhouse ? XRAY.DOLLHOUSE_ALPHA : 1.0);
      if (o.targetAlpha === targetAlpha) continue;
      o.targetAlpha = targetAlpha;
      if (o.fadeTween) o.fadeTween.stop();
      o.fadeTween = this.tweens.add({
        targets: o.sprite,
        alpha: targetAlpha,
        duration: XRAY.FADE_MS,
        ease: 'Linear'
      });
    }
  }

  /**
   * Camera frustum culling cho map tiles (perf fix #4, 2026-10-06 investigation).
   *
   * Mỗi tile là một Image riêng lẻ nên Phaser không tự cull (chỉ TilemapLayer
   * được cull). Đo được ở zoom 2.5: 81.2% object nằm ngoài màn hình vẫn bị
   * submit vào WebGL batch mỗi frame.
   *
   * Dùng camera.worldView (RESIZE-aware: phản ánh đúng viewport thực tế, không
   * hardcode 800x600) mở rộng TILE_CULL_MARGIN px, AABB-test từng tile sprite
   * trong TilePool.active và bật/tắt `visible`. Shadow ellipse của obstacle
   * cull cùng tile của nó qua shadow._tileSprite.
   *
   * CHỈ toggle `visible` — không destroy/reposition → không xung đột TilePool
   * (acquire() luôn reset visible=true, releaseAll() reset về pool).
   */
  _cullTiles() {
    const camera = this.cameras && this.cameras.main;
    if (!camera) return;
    const tiles = this.tilePool ? this.tilePool.active : (this.tileSprites || []);
    const shadows = this.obstacleShadows || [];

    if (!PERF_CONFIG.TILE_CULL_ENABLED) {
      // Master switch tắt: khôi phục tất cả về visible
      for (let i = 0; i < tiles.length; i++) {
        if (!tiles[i].visible) tiles[i].setVisible(true);
      }
      for (let i = 0; i < shadows.length; i++) {
        if (!shadows[i].visible) shadows[i].setVisible(true);
      }
      return;
    }

    const view = camera.worldView;
    const margin = PERF_CONFIG.TILE_CULL_MARGIN;
    const half = GAME_CONFIG.TILE_SIZE / 2;

    for (let i = 0; i < tiles.length; i++) {
      const t = tiles[i];
      const inView = isInCulledView(t.x, t.y, half, half, view, margin);
      if (t.visible !== inView) t.setVisible(inView);
    }

    // Shadow đi cùng tile của nó: tile ẩn → shadow ẩn, tile hiện → shadow hiện
    for (let i = 0; i < shadows.length; i++) {
      const s = shadows[i];
      const tile = s._tileSprite;
      const v = tile ? tile.visible : true;
      if (s.visible !== v) s.setVisible(v);
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
          const inner = lbl.getData ? lbl.getData('txt') : null;
          if (inner) {
            inner.setText(portalText);
            this._layoutPortalPill(lbl);
          } else if (lbl.setText) {
            lbl.setText(portalText);
          }
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
      this.portalLabels.forEach(lbl => {
        const dot = lbl.getData ? lbl.getData('dot') : null;
        if (dot) {
          this.tweens.killTweensOf(dot);
          dot.destroy();
        }
        lbl.destroy();
      });
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
    // Phase 0: đổi phòng phải dọn texture avatar động của remote (chặn leak GPU).
    // Chỉ dọn key của remote (char_<socketId> + bản versioned), KHÔNG đụng
    // texture preload (char_hoodie_dever...), NPC (char_npc_*) hay local player.
    for (const socketId of this.remotePlayers.keys()) {
      this._cleanupRemoteAvatarTexture(socketId);
    }
    this.remotePlayers.clear();

    this.obstacleGroup = this.physics.add.staticGroup();
    this.portalGroup = this.physics.add.staticGroup();

    // X-ray: reset danh sách tile che khuất của phòng cũ
    this.occluderTiles = [];

    const cols = GAME_CONFIG.MAP_WIDTH_TILES;
    const rows = GAME_CONFIG.MAP_HEIGHT_TILES;
    const tileSize = GAME_CONFIG.TILE_SIZE;

    // Solid obstacles
    const solidTiles = new Set([2, 3, 4, 8, 12, 14, 15, 16, 17, 19, 20, 21, 22, 25, 26, 27, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39]);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const tileType = mapData.layout[r][c];
        const posX = c * tileSize + tileSize / 2;
        const posY = r * tileSize + tileSize / 2;
        const isSolid = solidTiles.has(tileType);

        // S2.D: Y-sort depth system (Floor = 0; Obstacles = posY + 15)
        const tileDepth = isSolid ? (posY + (tileSize / 2) - 1) : 0;

        let tileSprite = null;
        if (this.tilePool) {
          tileSprite = this.tilePool.acquire(posX, posY, tileType, tileDepth);
        } else {
          tileSprite = this.add.image(posX, posY, 'town_tileset', tileType);
          tileSprite.setDepth(tileDepth);
          this.tileSprites.push(tileSprite);
        }

        // X-ray Trigger A/B: tile "cao" che khuất (tường, nội thất) được track riêng
        if (tileSprite && isOccluderTileType(tileType)) {
          this.occluderTiles.push({
            sprite: tileSprite,
            type: tileType,
            x: posX,
            y: posY,
            row: r,
            col: c,
            targetAlpha: 1.0,
            fadeTween: null
          });
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
            // Tile culling: shadow đi cùng tile của nó (cull theo cặp qua visible)
            shadow._tileSprite = tileSprite;
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

        // Nhãn portal: pill tối + viền tím + chữ trắng Be Vietnam Pro — cùng ngôn ngữ
        // thị giác với prompt [E] (viền cam) và badge zone (viền màu zone).
        const labelText = this.add.text(0, 0, portalText, {
          fontFamily: "'Be Vietnam Pro', -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
          fontSize: '11px',
          fontWeight: '700',
          color: '#ffffff',
          stroke: '#0f172a',
          strokeThickness: 2,
          resolution: typeof window !== 'undefined' && window.devicePixelRatio ? Math.min(window.devicePixelRatio, 2) : 2
        }).setOrigin(0.5, 0.5);
        const labelBg = this.add.graphics();
        const label = this.add.container(avgX, clampedY, [labelBg, labelText]);
        label.setDepth(99999);
        label.setData('txt', labelText);
        label.setData('bg', labelBg);
        this._layoutPortalPill(label);

        // Kẹp tọa độ X động theo bề rộng thực tế + fallback độ dài ký tự (phòng khi webfont chưa tải xong)
        const estWidth = Math.max(labelText.width || 0, portalText.length * 8 + 16) + 20;
        const halfW = estWidth / 2;
        label.x = Phaser.Math.Clamp(avgX, halfW + 12, cols * tileSize - halfW - 12);

        // Contextual labels (critique #1): lưu vị trí portal + vị trí gốc để
        // fade theo khoảng cách và chống đè chữ trong _updatePortalLabels().
        label.setData('portalX', avgX);
        label.setData('portalY', avgY);
        label.setData('baseX', label.x);
        label.setData('baseY', label.y);

        // Chấm marker tím: hiện khi portal ở xa (thay cho nhãn chữ).
        const dot = this.add.circle(avgX, avgY, PORTAL_LABEL_CONFIG.DOT_RADIUS, 0xa78bfa, 0.9);
        dot.setDepth(99998);
        dot.setStrokeStyle(1.5, 0xffffff, 0.9);
        dot.setVisible(false);
        dot.setAlpha(PORTAL_LABEL_CONFIG.DOT_ALPHA);
        label.setData('dot', dot);
        // Nhịp "thở" nhẹ để marker dễ nhận ra mà không gây chú ý quá mức
        this.tweens.add({
          targets: dot,
          scaleX: 1.35,
          scaleY: 1.35,
          duration: 900,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });

        this.portalLabels.push(label);
      });
    }

    // Zones
    if (this.interactionManager) {
      this.interactionManager.setZones(mapData.zones || []);
    }

    // Spawn NPCs cho room hiện tại
    if (this.npcGroup && Array.isArray(this.npcGroup)) {
      this.npcGroup.forEach(n => {
        try { n.destroy(); } catch (e) {}
      });
      this.npcGroup = [];
    }
    // Chỉ spawn NPC của main_hall khi đang ở tầng 1 (floorIndex = 0)
    const isMainHallUpperFloor = roomId === 'main_hall' && (this.floorManager?.currentFloor || 0) > 0;
    if (!isMainHallUpperFloor) {
      const roomNPCs = NPC_CONFIG[roomId] || [];
      const playerName = (this.player?.name || authService.getUser()?.display_name || '').toLowerCase();
      const isPlayerNhat = playerName.includes('nhat') || playerName.includes('nhật');

      roomNPCs.forEach(cfg => {
        try {
          // Nếu người chơi chính là Đặng Quang Nhật, ẩn NPC Chủ nhiệm để tránh thấy bản thể sao chép
          if (cfg.id === 'npc_chunhiem_nhat' && isPlayerNhat) {
            return;
          }

          const npcX = cfg.tileX * tileSize + tileSize / 2;
          const npcY = cfg.tileY * tileSize + tileSize / 2;
          const npc = new NPC(this, npcX, npcY, cfg);
          this.npcGroup.push(npc);
        } catch (err) {
          console.warn('Lỗi khi spawn NPC:', cfg?.id, err);
        }
      });
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
    if (roomSelector) {
      if (roomSelector.value !== roomId) {
        roomSelector.value = roomId;
      }
      if (typeof document !== 'undefined' && document.activeElement === roomSelector) {
        roomSelector.blur();
        const canvas = this.game?.canvas || document.querySelector('#game-container canvas');
        if (canvas) canvas.focus();
      }
    }

    if (notifySocket && this.socketManager) {
      this.socketManager.switchRoom(roomId, spawnX, spawnY);
    }

    // Cập nhật Minimap & Room Banner
    if (this.minimap) {
      this.minimap.setRoom(roomId);
    }
    if (this.lightingManager) {
      this.lightingManager.setRoom(roomId);
    }
    if (this.roomBanner) {
      this.roomBanner.show(roomId, this.remotePlayers.size + 1);
    }

    // Culling lần đầu ngay sau khi load phòng (trước khi timer 200ms chạy)
    this._cullTiles();
  }

  // Vẽ lại pill nền cho nhãn portal theo đúng bề rộng text hiện tại
  // (dùng khi tạo mới và khi đổi ngôn ngữ qua refreshSceneLanguage).
  _layoutPortalPill(label) {
    const txt = label.getData('txt');
    const bg = label.getData('bg');
    if (!txt || !bg) return;
    const w = Math.max(txt.width || 0, 40) + 20;
    const h = Math.max(txt.height || 0, 14) + 10;
    bg.clear();
    bg.fillStyle(0x0f172a, 0.92);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
    bg.lineStyle(1.5, 0xa78bfa, 0.95); // Viền tím = nhận diện portal
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
    // Lưu kích thước cho pass chống đè chữ trong _updatePortalLabels()
    label.setData('w', w);
    label.setData('h', h);
  }

  // Nhãn portal theo ngữ cảnh (critique 2026-10-09 item #1): fade theo khoảng
  // cách tới người chơi + chống đè chữ giữa các nhãn đang hiện.
  // - Gần (< NEAR_PX): nhãn đầy đủ.
  // - Giữa: alpha/scale giảm dần theo khoảng cách.
  // - Xa (> FAR_PX): ẩn nhãn chữ, chỉ hiện chấm marker tím trên ô portal.
  // Chạy throttle 150ms từ update() — không hardcode hằng số ở đây.
  _updatePortalLabels() {
    const labels = this.portalLabels;
    if (!labels || labels.length === 0) return;
    const cfg = PORTAL_LABEL_CONFIG;
    const player = this.player;
    const px = player ? player.x : null;
    const py = player ? player.y : null;

    // Pass 1: khoảng cách → alpha/scale/nhãn-chữ vs chấm marker
    const visible = [];
    for (const label of labels) {
      if (!label || !label.active) continue;
      // Reset về vị trí gốc trước pass chống đè
      label.x = label.getData('baseX');
      label.y = label.getData('baseY');

      const portalX = label.getData('portalX');
      const portalY = label.getData('portalY');
      const dist = (px == null || portalX == null)
        ? 0
        : Math.hypot(portalX - px, portalY - py);

      let t; // 1 = gần (đầy đủ), 0 = xa (chỉ marker)
      if (dist <= cfg.NEAR_PX) t = 1;
      else if (dist >= cfg.FAR_PX) t = 0;
      else t = 1 - (dist - cfg.NEAR_PX) / (cfg.FAR_PX - cfg.NEAR_PX);

      const txt = label.getData('txt');
      const bg = label.getData('bg');
      const dot = label.getData('dot');
      if (t <= 0.001) {
        label.setVisible(false);
        if (dot && dot.active) dot.setVisible(true);
      } else {
        label.setVisible(true);
        if (dot && dot.active) dot.setVisible(false);
        if (txt) txt.setVisible(true);
        if (bg) bg.setVisible(true);
        label.setAlpha(cfg.MIN_ALPHA + (1 - cfg.MIN_ALPHA) * t);
        label.setScale(0.82 + 0.18 * t);
        if (t > 0.45) visible.push(label);
      }
    }

    // Pass 2: chống đè chữ — đẩy nhãn thấp hơn xuống khi rect chồng nhau.
    // Kẹp trong biên map để không phá test vision-inspection (y ≤ 592).
    visible.sort((a, b) => a.y - b.y);
    for (let i = 1; i < visible.length; i++) {
      const prev = visible[i - 1];
      const cur = visible[i];
      const prevW = (prev.getData('w') || 80) * prev.scaleX;
      const curW = (cur.getData('w') || 80) * cur.scaleX;
      const prevH = (prev.getData('h') || 24) * prev.scaleY;
      const curH = (cur.getData('h') || 24) * cur.scaleY;
      const xOverlap = Math.abs(cur.x - prev.x) < (prevW + curW) / 2 - cfg.DEOVERLAP_PAD;
      const yOverlap = Math.abs(cur.y - prev.y) < (prevH + curH) / 2;
      if (xOverlap && yOverlap) {
        const push = (prevH + curH) / 2 - Math.abs(cur.y - prev.y) + 4;
        cur.y = Math.min(cur.y + push, GAME_CONFIG.MAP_HEIGHT - 18);
      }
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

    // Hiệu ứng chuyển cảnh kiểu Pokémon: flash trắng nhanh rồi pixel-dissolve
    // (Bayer dithering, không mờ nhòe canvas). Swap phòng ở giữa lúc đen toàn màn.
    const doSwap = () => {
      this.loadRoom(
        portalData.targetRoomId,
        portalData.targetSpawn.x,
        portalData.targetSpawn.y,
        true
      );
    };
    if (this.transitionManager) {
      this.transitionManager.transition(doSwap).then(() => {
        this.isTeleporting = false;
        this.teleportGraceUntil = performance.now() + 2000;
      });
    } else {
      // Fallback nếu chưa có transitionManager
      this.cameras.main.flash(70, 255, 255, 255, false);
      this.time.delayedCall(70, () => {
        this.cameras.main.fadeOut(180, 11, 15, 25);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          doSwap();
          this.cameras.main.fadeIn(250, 11, 15, 25);
          this.cameras.main.once('camerafadeincomplete', () => {
            this.isTeleporting = false;
            this.teleportGraceUntil = performance.now() + 2000;
          });
        });
      });
    }
  }

  createHUD() {
    const mapData = MAPS_CONFIG[this.currentRoomId] || MAPS_CONFIG.main_hall;
    const roomName = this.i18n ? (this.i18n.get(`rooms.${this.currentRoomId}`) || mapData.name) : mapData.name;

    this.hudText = this.add.text(14, 14, `DEVER TOWN | ${roomName}`, {
      fontFamily: "'Tilt Neon', 'Be Vietnam Pro', -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
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
      inventoryManager: this.inventoryManager,
      scene: this
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
          this.player.updateProfile({
            name,
            avatarId: user.wardrobe_config ? (user.wardrobe_config.characterId || user.wardrobe_config.outfitId || avatarId) : avatarId,
            role,
            wardrobeConfig: user.wardrobe_config
          });
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
      scene: this,
      onSelectEmote: (emoteId) => this.handleLocalEmote(emoteId)
    });

    // 12b. Vòng xoay biểu cảm nhanh (Radial Emote Wheel - Delverium Inspired)
    this.radialEmoteWheel = new RadialEmoteWheel({
      scene: this,
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
          const targetX = p.x + 24;
          const targetY = p.y;
          this.teleportGraceUntil = performance.now() + 3500;
          this.lastTeleportTime = performance.now();
          if (p.roomId && p.roomId !== this.currentRoomId) {
            this.loadRoom(p.roomId, targetX, targetY, true);
          } else {
            this.player.setPosition(targetX, targetY);
            if (this.player.body) {
              this.player.body.reset(targetX, targetY);
              this.player.body.setVelocity(0, 0);
            }
          }
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
      let lastSelectorSwitch = 0;

      roomSelector.addEventListener('change', (e) => {
        const now = performance.now();
        // Chống kích hoạt đúp / spam phím liên tục trong 800ms
        if (now - lastSelectorSwitch < 800) {
          if (roomSelector.value !== this.currentRoomId) {
            roomSelector.value = this.currentRoomId;
          }
          return;
        }

        const targetRoom = e.target.value;
        if (targetRoom && targetRoom !== this.currentRoomId) {
          const mapData = MAPS_CONFIG[targetRoom];
          if (mapData) {
            lastSelectorSwitch = now;
            this.isTeleporting = false;
            this.teleportGraceUntil = now + 3500;
            this.lastTeleportTime = now;
            if (this.player && this.player.body) {
              this.player.body.setVelocity(0, 0);
              this.player.stopMovement();
            }
            this.loadRoom(targetRoom, mapData.spawnPoint.x, mapData.spawnPoint.y, true);
          }
        }

        // BẮT BUỘC: Lập tức nhả focus khỏi dropdown và trả lại focus cho Canvas game
        // Ngăn chặn trình duyệt bắt phím WASD / Mũi tên để tìm kiếm (type-ahead) sang phòng khác (ví dụ: phím 'A' nhảy sang Arcade)
        roomSelector.blur();
        const canvas = this.game?.canvas || document.querySelector('#game-container canvas');
        if (canvas) {
          canvas.focus();
        }
        if (this.inputController) {
          this.inputController.enableInput();
        }
      });

      // Ngăn chặn các phím điều khiển game (WASD, Mũi tên, Space) kích hoạt type-ahead hoặc đổi phòng trên <select>
      roomSelector.addEventListener('keydown', (e) => {
        const movementCodes = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'];
        const movementKeys = ['w', 'a', 's', 'd', 'W', 'A', 'S', 'D'];
        if (movementCodes.includes(e.code) || movementKeys.includes(e.key)) {
          e.preventDefault();
          e.stopPropagation();
          roomSelector.blur();
          const canvas = this.game?.canvas || document.querySelector('#game-container canvas');
          if (canvas) {
            canvas.focus();
          }
          if (this.inputController) {
            this.inputController.enableInput();
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
    // Phase 0: chặn leak GPU — texture avatar riêng của remote không bao giờ
    // được xóa trước đây, người ra/vào liên tục làm memory tăng vô hạn.
    this._cleanupRemoteAvatarTexture(socketId);
  }

  /**
   * Xóa texture avatar động của một remote player (logical key + bản versioned
   * trong TextureGenerator._keyRegistry). An toàn: không đụng texture preload,
   * NPC hay của local player.
   */
  _cleanupRemoteAvatarTexture(socketId) {
    if (!socketId) return;
    const logicalKey = `char_${socketId}`;
    try {
      const actualKey = (typeof TextureGenerator.getActualKey === 'function')
        ? TextureGenerator.getActualKey(logicalKey)
        : logicalKey;
      if (actualKey && actualKey !== logicalKey && this.textures.exists(actualKey)) {
        this.textures.remove(actualKey);
      }
      if (this.textures.exists(logicalKey)) {
        this.textures.remove(logicalKey);
      }
      if (TextureGenerator._keyRegistry) {
        delete TextureGenerator._keyRegistry[logicalKey];
      }
    } catch (e) {
      // Dọn texture không được phép làm crash game — log nhẹ và bỏ qua.
      console.warn('[WorldScene] Không dọn được avatar texture:', logicalKey, e?.message);
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

  /**
   * Xử lý trạng thái hoạt động từ người chơi khác (ví dụ: đang mơ),
   * kèm tư thế ngồi/đứng đồng bộ cùng channel.
   */
  handleRemoteActivity({ id, activity, pose }) {
    const isSelf = this.socketManager?.socket?.id === id;
    if (isSelf) return;

    const remote = this.remotePlayers.get(id);
    if (remote && remote.setActivity) {
      remote.setActivity(activity);
    }
    if (remote && remote.setPose) {
      remote.setPose(pose || 'stand');
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

    if (this.npcGroup && this.player) {
      this.npcGroup.forEach(npc => {
        npc.update(this.player.x, this.player.y);
      });
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

    if (this.lightingManager) {
      this.lightingManager.update(time, delta);
    }

    // X-ray "xuyên thấu": kiểm tra throttle 100ms, AABB rẻ với player
    this._xrayTimer += delta;
    if (this._xrayTimer >= CAMERA_ZOOM.XRAY_CHECK_MS) {
      this._xrayTimer = 0;
      this._updateXray();
    }

    // Tile frustum culling: throttle 200ms, AABB từng tile vs camera.worldView
    this._tileCullTimer += delta;
    if (this._tileCullTimer >= PERF_CONFIG.TILE_CULL_INTERVAL_MS) {
      this._tileCullTimer = 0;
      this._cullTiles();
    }

    // Nhãn portal theo ngữ cảnh: fade theo khoảng cách + chống đè chữ
    this._portalLabelTimer += delta;
    if (this._portalLabelTimer >= PORTAL_LABEL_CONFIG.UPDATE_MS) {
      this._portalLabelTimer = 0;
      this._updatePortalLabels();
    }

    // Chốt tâm follow sau zoom: sửa stall lerp+roundPixels làm view lệch khỏi player
    this._snapFollowSettle();
  }

  shutdown() {
    // Dọn zoom controls (wheel/pinch listeners + DOM + tween) trước các manager
    this._removeZoomControls();

    if (this.campusTimeHUD) {
      this.campusTimeHUD.destroy();
      this.campusTimeHUD = null;
    }

    if (this.lightingManager) {
      this.lightingManager.destroy();
      this.lightingManager = null;
    }

    if (this.radialEmoteWheel) {
      this.radialEmoteWheel.destroy();
      this.radialEmoteWheel = null;
    }

    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler);
      this._resizeHandler = null;
    }
    if (this._orientationHandler) {
      window.removeEventListener('orientationchange', this._orientationHandler);
      this._orientationHandler = null;
    }
    if (this._scaleResizeHandler && this.scale) {
      this.scale.off('resize', this._scaleResizeHandler);
      this._scaleResizeHandler = null;
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

    if (this.npcGroup) {
      this.npcGroup.forEach(n => n.destroy());
      this.npcGroup = [];
    }
    if (this.npcDialogueModal) {
      this.npcDialogueModal.destroy();
      this.npcDialogueModal = null;
    }
  }
}


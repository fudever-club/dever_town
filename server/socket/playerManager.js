/**
 * PlayerManager: Quản lý trạng thái In-Memory của tất cả người chơi đang online.
 * Hỗ trợ User ID, Display Name, Avatar ID và Role (Admin, Leader, Dev, Guest).
 */
class PlayerManager {
  constructor() {
    this.players = new Map(); // key: socketId, value: PlayerData
  }

  /**
   * Thêm hoặc khởi tạo người chơi mới
   */
  addPlayer(socketId, data = {}, authUser = null) {
    const player = {
      id: socketId,
      userId: authUser ? authUser.id : (data.userId || null),
      name: authUser ? authUser.displayName : (data.name || `Khách #${socketId.substring(0, 4)}`),
      avatarId: authUser ? authUser.avatarId : (data.avatarId || 'dev_hoodie'),
      role: authUser ? authUser.role : (data.role || 'guest'),
      x: data.x || 336,
      y: data.y || 272,
      direction: data.direction || 'down',
      isMoving: false,
      roomId: data.roomId || 'main-hall',
      joinedAt: Date.now()
    };

    this.players.set(socketId, player);
    return player;
  }

  getPlayer(socketId) {
    return this.players.get(socketId);
  }

  updateMovement(socketId, { x, y, direction, isMoving }) {
    const player = this.players.get(socketId);
    if (!player) return null;

    player.x = x;
    player.y = y;
    player.direction = direction;
    player.isMoving = isMoving;
    return player;
  }

  updateProfile(socketId, { name, avatarId }) {
    const player = this.players.get(socketId);
    if (!player) return null;

    if (name) player.name = name.trim().substring(0, 20);
    if (avatarId) player.avatarId = avatarId;

    return player;
  }

  removePlayer(socketId) {
    const player = this.players.get(socketId);
    if (player) {
      this.players.delete(socketId);
      return player;
    }
    return null;
  }

  getAllPlayers(roomId = null) {
    const result = {};
    for (const [id, p] of this.players.entries()) {
      if (!roomId || p.roomId === roomId) {
        result[id] = p;
      }
    }
    return result;
  }

  getOnlineCount() {
    return this.players.size;
  }
}

export const playerManager = new PlayerManager();

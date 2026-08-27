/**
 * PlayerManager: Quản lý trạng thái In-Memory của tất cả người chơi đang online.
 * Sẵn sàng mở rộng cho cơ chế lưu phiên và gán User ID trong Bước 3 & Bước 4.
 */
class PlayerManager {
  constructor() {
    this.players = new Map(); // key: socketId, value: PlayerData
  }

  /**
   * Thêm người chơi mới khi tham gia
   */
  addPlayer(socketId, data = {}) {
    const player = {
      id: socketId,
      name: data.name || `Dev #${socketId.substring(0, 4)}`,
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

  /**
   * Lấy thông tin 1 người chơi
   */
  getPlayer(socketId) {
    return this.players.get(socketId);
  }

  /**
   * Cập nhật vị trí và hướng di chuyển
   */
  updateMovement(socketId, { x, y, direction, isMoving }) {
    const player = this.players.get(socketId);
    if (!player) return null;

    player.x = x;
    player.y = y;
    player.direction = direction;
    player.isMoving = isMoving;
    return player;
  }

  /**
   * Cập nhật Nickname
   */
  updateNickname(socketId, newName) {
    const player = this.players.get(socketId);
    if (!player) return null;
    player.name = newName.trim().substring(0, 20) || player.name;
    return player;
  }

  /**
   * Xóa người chơi khi disconnect
   */
  removePlayer(socketId) {
    const player = this.players.get(socketId);
    if (player) {
      this.players.delete(socketId);
      return player;
    }
    return null;
  }

  /**
   * Lấy danh sách tất cả người chơi trong phòng (hoặc toàn server)
   */
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

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const roomsFilePath = path.join(__dirname, '../data/rooms.json');

/**
 * PlayerManager: Quản lý trạng thái In-Memory của tất cả người chơi theo từng Phòng (Data-Driven Room Isolation).
 */
class PlayerManager {
  constructor() {
    this.players = new Map(); // key: socketId, value: PlayerData
  }

  addPlayer(socketId, data = {}, authUser = null) {
    const wardrobeConfig = data.wardrobeConfig || (authUser ? authUser.wardrobeConfig : null);
    const equippedItemId = data.equippedItemId || (authUser ? authUser.equippedItemId : null);

    const player = {
      id: socketId,
      userId: authUser ? authUser.id : (data.userId || null),
      name: (authUser ? authUser.displayName : (data.name || `Khách #${socketId.substring(0, 4)}`)).normalize('NFC'),
      avatarId: wardrobeConfig ? socketId : (authUser ? authUser.avatarId : (data.avatarId || 'dev_hoodie')),
      role: authUser ? authUser.role : (data.role || 'guest'),
      equippedItemId: equippedItemId,
      wardrobeConfig: wardrobeConfig,
      x: data.x || 400,
      y: data.y || 350,
      direction: data.direction || 'down',
      isMoving: false,
      roomId: data.roomId || 'main_hall',
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

  updateProfile(socketId, { name, avatarId, equippedItemId }) {
    const player = this.players.get(socketId);
    if (!player) return null;

    if (name) player.name = Array.from(name.normalize('NFC').trim()).slice(0, 24).join('');
    if (avatarId) player.avatarId = avatarId;
    if (equippedItemId !== undefined) player.equippedItemId = equippedItemId;

    return player;
  }

  equipItem(socketId, itemId) {
    const player = this.players.get(socketId);
    if (!player) return null;

    player.equippedItemId = itemId || null;
    return player;
  }

  updateWardrobe(socketId, wardrobeConfig) {
    const player = this.players.get(socketId);
    if (!player) return null;

    player.wardrobeConfig = wardrobeConfig;
    player.avatarId = 'custom_wardrobe';
    return player;
  }

  switchRoom(socketId, newRoomId, x = 400, y = 350) {
    const player = this.players.get(socketId);
    if (!player) return null;

    const oldRoomId = player.roomId;
    player.roomId = newRoomId;
    player.x = x;
    player.y = y;
    player.isMoving = false;

    return { player, oldRoomId, newRoomId };
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

  getRoomCounts() {
    const counts = { total: this.players.size };

    try {
      if (fs.existsSync(roomsFilePath)) {
        const raw = fs.readFileSync(roomsFilePath, 'utf-8');
        const roomsData = JSON.parse(raw);
        for (const rId of Object.keys(roomsData)) {
          counts[rId] = 0;
        }
      }
    } catch (e) {
      counts.main_hall = 0;
      counts.dever_lab = 0;
      counts.library_lounge = 0;
      counts.memory_room = 0;
      counts.web_room = 0;
      counts.media_hub = 0;
      counts.sports_complex = 0;
    }

    for (const p of this.players.values()) {
      if (counts[p.roomId] !== undefined) {
        counts[p.roomId]++;
      } else {
        counts[p.roomId] = 1;
      }
    }

    return counts;
  }
}

export const playerManager = new PlayerManager();

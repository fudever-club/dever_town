import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const roomsFilePath = path.join(__dirname, '../data/rooms.json');

function getRoomsData() {
  try {
    if (fs.existsSync(roomsFilePath)) {
      const raw = fs.readFileSync(roomsFilePath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading rooms.json:', e);
  }
  return {};
}

export const roomController = {
  /**
   * GET /api/rooms - Lấy danh sách metadata của tất cả các phòng
   */
  getRoomsSummary(req, res) {
    const rooms = getRoomsData();
    const summary = Object.values(rooms).map(r => ({
      id: r.id,
      name: r.name,
      description: r.description,
      spawnPoint: r.spawnPoint,
      zoneCount: (r.zones || []).length,
      portalCount: (r.portals || []).length
    }));

    return res.json({
      success: true,
      data: summary
    });
  },

  /**
   * GET /api/rooms/:id - Lấy toàn bộ layout và dữ liệu chi tiết của 1 phòng
   */
  getRoomDetail(req, res) {
    const rooms = getRoomsData();
    const room = rooms[req.params.id];

    if (!room) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy phòng với ID '${req.params.id}'`
      });
    }

    return res.json({
      success: true,
      data: room
    });
  }
};

import express from 'express';
import { roomController } from '../controllers/roomController.js';

const router = express.Router();

/**
 * GET /api/rooms - Lấy danh sách metadata của tất cả các phòng
 */
router.get('/', roomController.getRoomsSummary);

/**
 * GET /api/rooms/:id - Lấy toàn bộ layout và dữ liệu chi tiết của 1 phòng
 */
router.get('/:id', roomController.getRoomDetail);

export default router;

import jwt from 'jsonwebtoken';
import { getDB } from '../db/index.js';

let JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';

if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('[FATAL] JWT_SECRET environment variable bắt buộc phải set trong môi trường Production!');
    process.exit(1);
  } else {
    JWT_SECRET = 'dever_town_dev_secret_key_2026_super_secure_development_only';
    console.warn('[AUTH WARNING] JWT_SECRET chưa được set trong .env. Đang dùng development secret fallback.');
  }
}

/**
 * Loại bỏ trường password_hash trước khi trả về client
 */
export function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash, ...safe } = user;
  return safe;
}

/**
 * Tạo JWT token từ user record
 */
export function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    avatarId: user.avatar_id,
    role: user.role
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Express Middleware xác thực Bearer Token
 */
export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Yêu cầu token xác thực!' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = getDB();
    const user = await db.getUserById(decoded.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại!' });
    }

    req.user = sanitizeUser(user);
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn!' });
  }
}

/**
 * Xác thực token dành riêng cho Socket.io Handshake
 */
export async function verifySocketToken(token) {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = getDB();
    const user = await db.getUserById(decoded.id);
    return sanitizeUser(user);
  } catch (err) {
    return null;
  }
}

/**
 * Socket Rate Limiter Utility
 * Giới hạn tần suất gọi event theo từng socket để chống spam/DDoS
 */

/**
 * Tạo một rate limiter cho socket event cụ thể.
 * @param {number} maxRequests - Số lượng request tối đa trong cửa sổ thời gian
 * @param {number} windowMs - Cửa sổ thời gian (milliseconds)
 * @returns {Function} - Hàm kiểm tra (socket, eventKey) => boolean
 */
export function createSocketRateLimiter(maxRequests, windowMs) {
  return function checkRateLimit(socket, eventKey) {
    const key = `_rl_${eventKey}`;
    const now = Date.now();

    if (!socket[key]) socket[key] = [];

    // Xóa các timestamp cũ ngoài cửa sổ
    socket[key] = socket[key].filter(ts => now - ts < windowMs);

    if (socket[key].length >= maxRequests) {
      console.warn(`[RateLimit] Socket ${socket.id} vượt giới hạn [${eventKey}]: ${socket[key].length}/${maxRequests} trong ${windowMs}ms`);
      return false; // Bị block
    }

    socket[key].push(now);
    return true; // Cho phép
  };
}

/**
 * Rate limiter đơn giản dựa trên cooldown (thời gian tối thiểu giữa 2 lần gọi)
 * @param {number} cooldownMs - Thời gian chờ tối thiểu giữa 2 lần gọi
 * @returns {Function}
 */
export function createCooldownLimiter(cooldownMs) {
  return function checkCooldown(socket, eventKey) {
    const key = `_cd_${eventKey}`;
    const now = Date.now();

    if (socket[key] && now - socket[key] < cooldownMs) {
      return false; // Còn trong cooldown
    }

    socket[key] = now;
    return true;
  };
}

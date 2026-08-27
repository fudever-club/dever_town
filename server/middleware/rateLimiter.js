/**
 * In-Memory Token Bucket / Sliding Window Rate Limiter Middleware
 * Chống Brute-force & Spam API không cần phụ thuộc thư viện ngoài.
 */
export function createRateLimiter({
  windowMs = 15 * 60 * 1000, // 15 phút
  maxRequests = 30,           // Tối đa 30 requests / window
  message = 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau!'
} = {}) {
  const ipRequests = new Map();

  // Dọn dẹp các IP đã hết hạn định kỳ mỗi 5 phút
  setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of ipRequests.entries()) {
      if (now - data.startTime > windowMs) {
        ipRequests.delete(ip);
      }
    }
  }, 5 * 60 * 1000);

  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();

    let record = ipRequests.get(ip);
    if (!record || (now - record.startTime > windowMs)) {
      record = { count: 1, startTime: now };
      ipRequests.set(ip, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, maxRequests - record.count);
    const resetTime = Math.ceil((record.startTime + windowMs - now) / 1000);

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetTime);

    if (record.count > maxRequests) {
      res.setHeader('Retry-After', resetTime);
      return res.status(429).json({
        success: false,
        message,
        retryAfterSeconds: resetTime
      });
    }

    next();
  };
}

/**
 * Middleware chống XSS: Làm sạch chuỗi ký tự HTML độc hại trong req.body
 */
export function sanitizeInput(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        // Loại bỏ thẻ HTML nguy hiểm (<script>, <iframe>, javascript:)
        req.body[key] = req.body[key]
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/javascript:/gi, '');
      }
    }
  }
  next();
}

/**
 * HTML Sanitize Utility — Ngăn XSS khi insert user data vào DOM
 */

/**
 * Escape HTML entities để an toàn khi dùng với innerHTML
 * @param {*} str
 * @returns {string}
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;');
}

/**
 * Strip toàn bộ HTML tags khỏi string (để lấy text thuần)
 * @param {string} html
 * @returns {string}
 */
export function stripHtml(html) {
  if (!html) return '';
  return String(html).replace(/<[^>]*>/g, '').trim();
}

/**
 * Sanitize player name: bỏ HTML chars, normalize whitespace, giới hạn độ dài
 * @param {string} name
 * @param {number} maxLength
 * @returns {string}
 */
export function sanitizeName(name, maxLength = 30) {
  if (!name) return 'Dever Member';
  const cleaned = String(name)
    .replace(/<[^>]*>/g, '')    // Strip toàn bộ HTML tags hoàn toàn
    .replace(/[<>"'`&]/g, '')   // Strip các ký tự nhúng đặc biệt còn sót lại
    .replace(/\s+/g, ' ')       // Chuẩn hóa khoảng trắng
    .trim()
    .slice(0, maxLength);
  return cleaned || 'Dever Member';
}

/**
 * Sanitize chat message: normalize NFC, giới hạn 150 ký tự Unicode
 * @param {string} msg
 * @param {number} maxLen
 * @returns {string}
 */
export function sanitizeChatMessage(msg, maxLen = 150) {
  if (!msg) return '';
  return Array.from(String(msg).normalize('NFC').trim())
    .slice(0, maxLen)
    .join('');
}

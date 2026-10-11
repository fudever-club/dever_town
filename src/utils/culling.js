/**
 * Culling helpers: pure AABB predicates for camera frustum culling.
 * Dùng camera.worldView (viewport thực tế, RESIZE-aware) + margin chống pop-in.
 */

/**
 * Kiểm tra một AABB có giao với vùng nhìn camera (đã mở rộng margin) không.
 *
 * @param {number} x - tọa độ world X của tâm object
 * @param {number} y - tọa độ world Y của tâm object
 * @param {number} halfW - nửa chiều rộng object
 * @param {number} halfH - nửa chiều cao object
 * @param {{x:number, y:number, right:number, bottom:number}} view - camera.worldView
 * @param {number} margin - pixel margin mở rộng quanh view
 * @returns {boolean} true nếu object (một phần) nằm trong view + margin
 */
export function isInCulledView(x, y, halfW, halfH, view, margin) {
  const left = view.x - margin;
  const right = view.right + margin;
  const top = view.y - margin;
  const bottom = view.bottom + margin;
  return x + halfW > left && x - halfW < right && y + halfH > top && y - halfH < bottom;
}

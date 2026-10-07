/**
 * DEVER TOWN - POSE CONFIG
 * Cấu hình FSM (Finite State Machine) cho tư thế của nhân vật: đứng / ngồi.
 *
 * FSM: STAND <-> SIT_UPRIGHT <-> SIT_LEANBACK
 *  - Ngồi upright: pose ngồi thẳng (học tập / làm việc trên ghế)
 *  - Ngồi leanback: pose ngả lưng thư giãn (nghỉ ngơi / chơi / ăn)
 *
 * Luồng chuyển đổi cho phép:
 *  - STAND -> SIT_UPRIGHT | SIT_LEANBACK
 *  - SIT_UPRIGHT -> STAND | SIT_LEANBACK   (đổi ghế/kiểu ngồi)
 *  - SIT_LEANBACK -> STAND | SIT_UPRIGHT   (đổi ghế/kiểu ngồi)
 *
 * Các hằng số liên quan đến cảm giác di chuyển đặt tại đây, không hardcode
 * trong Player.update() (theo quy chuẩn AGENTS.md).
 */

export const POSE = {
  STAND: 'stand',
  SIT_UPRIGHT: 'sit_upright',
  SIT_LEANBACK: 'sit_leanback',
};

/**
 * Tên animation tag theo frameTags của spritesheet, dùng để dựng key
 * animation đầy đủ: `${tag}_${avatarId}` (ví dụ: `sit_upright_hoodie_dever`).
 * Sprite pipeline sẽ tạo animation theo quy ước đặt tên này.
 */
export const SIT_ANIM = {
  [POSE.SIT_UPRIGHT]: 'sit_upright',
  [POSE.SIT_LEANBACK]: 'sit_leanback',
};

/**
 * Kiểu ngồi hợp lệ nhận vào Player.sit(type):
 *  - 'upright'  -> POSE.SIT_UPRIGHT
 *  - 'leanback' -> POSE.SIT_LEANBACK
 */
export const SIT_TYPE_TO_POSE = {
  upright: POSE.SIT_UPRIGHT,
  leanback: POSE.SIT_LEANBACK,
};

// Bảng chuyển đổi FSM: pose hiện tại -> danh sách pose được phép chuyển tới.
// Gồm cả trường hợp giữ nguyên pose (no-op) để tránh báo lỗi thừa.
const POSE_TRANSITIONS = {
  [POSE.STAND]: [POSE.STAND, POSE.SIT_UPRIGHT, POSE.SIT_LEANBACK],
  [POSE.SIT_UPRIGHT]: [POSE.STAND, POSE.SIT_UPRIGHT, POSE.SIT_LEANBACK],
  [POSE.SIT_LEANBACK]: [POSE.STAND, POSE.SIT_UPRIGHT, POSE.SIT_LEANBACK],
};

/**
 * Kiểm tra một chuyển đổi pose có hợp lệ theo FSM không.
 * @param {string} fromPose - pose hiện tại
 * @param {string} toPose - pose muốn chuyển tới
 * @returns {boolean}
 */
export function canTransitionPose(fromPose, toPose) {
  const allowed = POSE_TRANSITIONS[fromPose];
  return Array.isArray(allowed) && allowed.includes(toPose);
}

/**
 * Chuyển type ngồi ('upright' | 'leanback') thành POSE tương ứng.
 * @param {string} type
 * @returns {string|null} POSE đích, hoặc null nếu type không hợp lệ
 */
export function sitTypeToPose(type) {
  return SIT_TYPE_TO_POSE[type] ?? null;
}

/**
 * Kiểm tra pose có phải pose ngồi không.
 * @param {string} pose
 * @returns {boolean}
 */
export function isSitPose(pose) {
  return pose === POSE.SIT_UPRIGHT || pose === POSE.SIT_LEANBACK;
}

export const POSE_MOVEMENT = {
  // Khi đang ngồi: giữ phím di chuyển liên tục ít nhất N frame thì tự đứng dậy.
  // Ngưỡng này chống "joystick drift" (giật nhẹ tay cầm) gây đứng dậy ngoài ý muốn.
  autoStandUpFrames: 8,

  // Vector di chuyển tối thiểu (bình phương độ dài) để tính là "cố tình di chuyển".
  // Phím WASD/joystick khi nhấn cho vector chuẩn hoá độ dài 1 -> 1 > 0.16, drift nhẹ dưới ngưỡng bị bỏ qua.
  autoStandUpMinMagnitudeSq: 0.16,
};

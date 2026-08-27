/**
 * Bộ Phân Giải URL YouTube Thông Minh & Danh Sách 5 Preset Lofi Tuyển Chọn
 */
export function extractYouTubeVideoId(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return 'jfKfPfyJRdk';

  const clean = rawUrl.trim();

  // 1. Dạng Embed
  if (clean.includes('youtube.com/embed/')) {
    const id = clean.split('youtube.com/embed/')[1].split(/[?&]/)[0];
    return id || 'jfKfPfyJRdk';
  }

  // 2. Dạng Shorts: youtube.com/shorts/VIDEO_ID
  if (clean.includes('youtube.com/shorts/')) {
    const id = clean.split('youtube.com/shorts/')[1].split(/[?&]/)[0];
    return id || 'jfKfPfyJRdk';
  }

  // 3. Dạng rút gọn: youtu.be/VIDEO_ID
  if (clean.includes('youtu.be/')) {
    const id = clean.split('youtu.be/')[1].split(/[?&]/)[0];
    return id || 'jfKfPfyJRdk';
  }

  // 4. Dạng chuẩn: youtube.com/watch?v=VIDEO_ID
  const match = clean.match(/[?&]v=([^&]+)/);
  if (match && match[1]) {
    return match[1];
  }

  // 5. Nếu người dùng chỉ nhập 11 ký tự Video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    return clean;
  }

  return 'jfKfPfyJRdk';
}

export const LOFI_PRESETS = [
  {
    id: 'lofi_girl',
    name: '☕ Lofi Girl - Beats to Relax/Study',
    videoId: 'jfKfPfyJRdk',
    desc: 'Livestream Lofi huyền thoại giúp thư giãn và tập trung cao độ.'
  },
  {
    id: 'synthwave_radio',
    name: '🌃 Synthwave Cyberpunk - Code Đêm',
    videoId: '4xDzrJKXOOY',
    desc: 'Âm hưởng Retro Synthwave sôi động cho các buổi lập trình đêm khuya.'
  },
  {
    id: 'fptu_focus',
    name: '🌿 FPTU Coding Chill - Sóng Não Alpha',
    videoId: 'WPni755-Krg',
    desc: 'Giai điệu nhẹ nhàng tăng 200% khả năng tập trung làm bài tập & dự án.'
  },
  {
    id: 'danang_rain',
    name: '🌧️ Mưa Bán Đảo Sơn Trà Đà Nẵng Lofi',
    videoId: 'lTRiuFIWV54',
    desc: 'Tiếng mưa rơi êm dịu hòa cùng tiếng đàn guitar mộc mạc.'
  },
  {
    id: 'acoustic_vietnam',
    name: '🍵 Vietnamese Lofi Chillhop Quán Quen',
    videoId: '5qap5aO4i9A',
    desc: 'Tuyển tập các bản tình ca acoustic Việt Nam phối phong cách Lofi nhẹ nhàng.'
  }
];

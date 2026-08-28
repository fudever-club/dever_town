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

export const MUSIC_GENRES = [
  { id: 'all', name: '🔥 Tất Cả' },
  { id: 'lofi', name: '☕ Lofi & Code' },
  { id: 'vietnam', name: '🇻🇳 Việt Nam Chill' },
  { id: 'gaming', name: '🎮 Gaming & Synth' },
  { id: 'piano', name: '🎹 Piano & Ghibli' },
  { id: 'jazz', name: '🌧️ Mưa & Jazz Cafe' }
];

export const LOFI_PRESETS = [
  {
    id: 'lofi_girl',
    genre: 'lofi',
    name: '☕ Lofi Girl - Beats to Relax/Study',
    videoId: 'jfKfPfyJRdk',
    desc: 'Livestream Lofi 24/7 huyền thoại giúp tăng 200% khả năng tập trung lập trình & học tập.'
  },
  {
    id: 'fptu_focus',
    genre: 'lofi',
    name: '🌿 Deep Focus Coding - Sóng Não Alpha',
    videoId: 'WPni755-Krg',
    desc: 'Giai điệu Lofi êm dịu, loại bỏ tiếng ồn xung quanh để hoàn thành đồ án & bài tập.'
  },
  {
    id: 'vietnam_lofi_1',
    genre: 'vietnam',
    name: '🍵 Nhạc Lofi Việt Nam Nhẹ Nhàng Cực Chill',
    videoId: '5qap5aO4i9A',
    desc: 'Tuyển tập các bản ballad & acoustic Việt Nam êm ái phong cách Lofi Quán Quen.'
  },
  {
    id: 'vietnam_acoustic',
    genre: 'vietnam',
    name: '🎸 Acoustic Guitar Việt Nam - Chill Trà Chiều',
    videoId: 'DWcJFNfaw9c',
    desc: 'Giai điệu guitar mộc mạc và giọng hát nhẹ nhàng cho những buổi chiều thảnh thơi.'
  },
  {
    id: 'synthwave_radio',
    genre: 'gaming',
    name: '🌃 Synthwave Cyberpunk - Code Đêm',
    videoId: '4xDzrJKXOOY',
    desc: 'Âm hưởng Retro 80s & Cyberpunk sôi động cho các lập trình viên cú đêm.'
  },
  {
    id: 'ncs_gaming',
    genre: 'gaming',
    name: '⚡ NCS 24/7 Gaming & High Energy',
    videoId: 'N3oCS85HvpY',
    desc: 'Nhạc điện tử EDM/Gaming năng lượng cao giúp đẩy nhanh tiến độ làm dự án.'
  },
  {
    id: 'ghibli_piano',
    genre: 'piano',
    name: '🎹 Ghibli Relaxing Piano Collection',
    videoId: '4Tr0otuiQuU',
    desc: 'Những khúc dương cầm kinh điển từ Studio Ghibli, êm dịu và chữa lành tâm hồn.'
  },
  {
    id: 'peaceful_piano',
    genre: 'piano',
    name: '🌸 Peaceful Piano - Thư Giãn Tinh Thần',
    videoId: '1fueZCTYkpA',
    desc: 'Tiếng piano trong trẻo giúp xua tan áp lực thi cử và các deadline căng thẳng.'
  },
  {
    id: 'danang_rain',
    genre: 'jazz',
    name: '🌧️ Mưa Đà Nẵng & Tiếng Mưa Rơi Bờ Biển',
    videoId: 'lTRiuFIWV54',
    desc: 'Tiếng mưa rơi rả rích hòa cùng tiếng đàn êm dịu thư thái tuyệt đối.'
  },
  {
    id: 'jazz_cafe',
    genre: 'jazz',
    name: '☕ Warm Bossa Nova Cafe Ambience',
    videoId: 'e3L1VGfz1u0',
    desc: 'Không gian quán cà phê ấm cúng với tiếng nhạc Jazz Bossa Nova du dương.'
  }
];

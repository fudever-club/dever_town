/**
 * Bộ Phân Giải URL YouTube Thông Minh & Danh Sách 5 Preset Lofi Tuyển Chọn
 */
export function extractYouTubeVideoId(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return 'm7Wya6Z-QdM';

  const clean = rawUrl.trim();

  // 1. Dạng Embed
  if (clean.includes('youtube.com/embed/')) {
    const id = clean.split('youtube.com/embed/')[1].split(/[?&]/)[0];
    return id || 'm7Wya6Z-QdM';
  }

  // 2. Dạng Shorts: youtube.com/shorts/VIDEO_ID
  if (clean.includes('youtube.com/shorts/')) {
    const id = clean.split('youtube.com/shorts/')[1].split(/[?&]/)[0];
    return id || 'm7Wya6Z-QdM';
  }

  // 3. Dạng rút gọn: youtu.be/VIDEO_ID
  if (clean.includes('youtu.be/')) {
    const id = clean.split('youtu.be/')[1].split(/[?&]/)[0];
    return id || 'm7Wya6Z-QdM';
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

  return 'm7Wya6Z-QdM';
}

export const MUSIC_GENRES = [
  { id: 'all', name: 'Tất Cả' },
  { id: 'vietnam', name: 'V-Pop & Acoustic Chill' },
  { id: 'motivation', name: 'Cày Deadline & Động Lực' },
  { id: 'lofi', name: 'Lofi & Học Tập' },
  { id: 'classical', name: 'Cổ Điển & Piano Trí Não' },
  { id: 'gaming', name: 'Synthwave Cyberpunk' }
];

export const LOFI_PRESETS = [
  // 1. V-Pop & Acoustic Chill
  {
    id: 'vpop_hits_chill',
    genre: 'vietnam',
    name: 'V-Pop Chill - Từng Là, Thu Cuối, Có Em Chờ',
    videoId: 'm7Wya6Z-QdM',
    desc: 'Tuyển tập những bản hit nhạc trẻ Việt Nam nhẹ nhàng cực chill cho những buổi học tập và làm việc thảnh thơi.'
  },
  {
    id: 'trieu_view_acoustic',
    genre: 'vietnam',
    name: 'Chill Triệu View - Không Buông, Tìm Em (HNGLE x Bảo Anh)',
    videoId: 'wVLhvXB2flE',
    desc: 'Những giai điệu acoustic ballad triệu view cực chill giúp thả lỏng tâm trí và giảm căng thẳng.'
  },

  // 2. Cày Deadline & Động Lực Học Tập
  {
    id: 'fake_love_mashup_remix',
    genre: 'motivation',
    name: 'Mashup Fake Love Remix - Nhạc Động Lực Ôn Thi & Chạy Dự Án',
    videoId: 'mM8bNIndTbw',
    desc: 'Giai điệu remix năng lượng cao cực truyền động lực, xua tan cơn buồn ngủ khi chạy đua với deadline đồ án.'
  },
  {
    id: 'deadline_motivation_x2',
    genre: 'motivation',
    name: 'Deadline Music X2 Động Lực - Nhạc Dí Deadline Bốc Lửa',
    videoId: '0nO6OwUUF2k',
    desc: 'Playlist remix tăng tốc độ tập trung, đánh thức năng lượng hoàn thành kịp tiến độ mọi bài tập và dự án.'
  },

  // 3. Lofi & Học Tập Thư Giãn
  {
    id: 'lofi_dog_warm',
    genre: 'lofi',
    name: 'Tiếng Chó Sủa Lofi 12H - Chill & Ấm Áp',
    videoId: 'IsezUTX-Yog',
    desc: 'Giai điệu Lofi độc đáo kết hợp tiếng cún cưng sủa nhẹ nhàng, tạo cảm giác thân thuộc, vui vẻ và ấm cúng.'
  },
  {
    id: 'morning_coffee_lofi',
    genre: 'lofi',
    name: 'Morning Coffee Lofi Hip Hop',
    videoId: '1fueZCTYkpA',
    desc: 'Giai điệu cà phê sáng êm dịu, khởi đầu ngày mới ngập tràn cảm hứng sáng tạo.'
  },
  {
    id: 'night_study_session',
    genre: 'lofi',
    name: '1 A.M Night Study Session Lofi',
    videoId: 'lTRiuFIWV54',
    desc: 'Không gian học đêm yên tĩnh, hỗ trợ lập trình viên và sinh viên thức khuya làm bài.'
  },

  // 4. Cổ Điển & Piano Trí Não
  {
    id: 'classical_brain_power',
    genre: 'classical',
    name: 'Nhạc Cổ Điển Kích Hoạt Não Bộ - Mozart, Beethoven, Vivaldi',
    videoId: '0UN_HbOTTcI',
    desc: 'Tuyển tập kiệt tác giao hưởng cổ điển giúp kích thích sóng não Alpha, tăng cường trí nhớ và tư duy logic.'
  },
  {
    id: 'autumn_rain_piano',
    genre: 'classical',
    name: 'Autumn Rain - 1 Giờ Piano Mưa Thu Êm Đềm',
    videoId: 'D_twEhvSwHY',
    desc: 'Tiếng dương cầm nhẹ nhàng kết hợp tiếng mưa rơi rả rích, giúp thư giãn sâu và tăng khả năng đọc sách.'
  },
  {
    id: 'moonlight_sonata',
    genre: 'classical',
    name: 'Beethoven - Moonlight Sonata (Ánh Trăng Tuyệt Phẩm)',
    videoId: '4Tr0otuiQuU',
    desc: 'Bản sonata ánh trăng kinh điển của Beethoven với giai điệu sâu lắng, thanh lọc tâm hồn.'
  },
  {
    id: 'alpha_waves_focus',
    genre: 'classical',
    name: 'Sóng Não Alpha Tăng Cường Tập Trung Sâu',
    videoId: 'WPni755-Krg',
    desc: 'Tần số sóng não Alpha chuyên biệt giúp loại bỏ tạp âm và duy trì độ tập trung kéo dài.'
  },

  // 5. Gaming & Synthwave
  {
    id: 'synthwave_cyberpunk',
    genre: 'gaming',
    name: 'Synthwave Cyberpunk Radio - Beats to Chill & Game',
    videoId: '4xDzrJKXOOY',
    desc: 'Âm hưởng Retro 80s & Cyberpunk sôi động đồng hành cùng các lập trình viên cú đêm.'
  }
];

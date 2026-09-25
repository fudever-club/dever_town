/**
 * Cấu hình Hệ Thống Nhân Vật Hoàn Chỉnh (Character Presets) & Túi Đồ Cầm Tay FU-DEVER
 * Mỗi nhân vật là một tạo hình Chibi hoàn chỉnh đã tích hợp sẵn tóc, trang phục, khuôn mặt và phụ kiện.
 */

export const CHARACTER_PRESETS = [
  // --- NHÂN VẬT NAM (MALE CHARACTERS) ---
  {
    id: 'sample_dev_dever',
    name: 'Áo Hoodie Xanh Dev FU-DEVER',
    role: 'Trang Phục Coder • FU-DEVER',
    gender: 'male',
    color: '#0066CC',
    spriteKey: 'char_sample_dev_dever',
    desc: 'Tóc undercut đen tuyền highlight xám tro, kính dev bạc, áo hoodie xanh công nghệ FU-DEVER sắc nét chuẩn Gather.town v2.',
    tags: ['Mới', 'Gather.town v2', 'FU-DEVER']
  },
  {
    id: 'sample_cyber_hacker',
    name: 'Cyber Hacker Dị Sắc',
    role: 'Matrix Specialist • Security',
    gender: 'male',
    color: '#06b6d4',
    spriteKey: 'char_sample_cyber_hacker',
    desc: 'Tóc wolf cut xanh neon cyber, mắt 2 màu dị sắc (cyan & gold), tai nghe RGB, áo bomber viền mạch điện Matrix phát sáng.',
    tags: ['Mới', 'Anime', 'Cyber']
  },
  {
    id: 'sample_biker_rocker',
    name: 'Biker Rocker Đỏ Ruby',
    role: 'Rebel Edge • Streetwear',
    gender: 'male',
    color: '#e11d48',
    spriteKey: 'char_sample_biker_rocker',
    desc: 'Tóc anime spiky đỏ ruby rực lửa, áo da biker có khóa kéo và đinh tán bạc, biểu cảm sắc sảo cá tính.',
    tags: ['Mới', 'Anime', 'Rocker']
  },
  {
    id: 'sample_barista_an',
    name: 'Tạp Dề Barista Cà Phê Muối',
    role: 'Đồng Phục Cà Phê • Căn Tin',
    gender: 'male',
    color: '#d97706',
    spriteKey: 'char_sample_barista_an',
    desc: 'Tóc búi củ tỏi nâu socola, kính tròn gọng vàng, tạp dề cà phê thêu Cóc Vàng, phong cách pha chế ấm áp.',
    tags: ['Mới', 'Gather.town v2', 'Barista']
  },
  {
    id: 'hoodie_dever',
    name: 'Áo Hoodie Xanh Cổ Điển',
    role: 'Áo Khoác Nỉ CLB • FU-DEVER',
    gender: 'male',
    color: '#0066CC',
    spriteKey: 'char_hoodie_dever',
    desc: 'Tóc ngắn undercut đen, kính cận thông minh, áo hoodie xanh CLB FU-DEVER nhiệt huyết.',
    tags: ['CLB', 'Developer', 'Hoodie']
  },
  {
    id: 'polo_dever',
    name: 'Áo Polo Xanh CLB FU-DEVER',
    role: 'Đồng Phục Ban Cán Sự CLB',
    gender: 'male',
    color: '#2563eb',
    spriteKey: 'char_polo_dever',
    desc: 'Tóc wolf cut lịch lãm, áo Polo xanh phối cổ trắng FU-DEVER chính khóa, phong thái tự tin.',
    tags: ['Đồng Phục', 'Polo', 'FU-DEVER']
  },
  {
    id: 'hoodie_fuda',
    name: 'Áo Hoodie Cam Năng Động FPTU',
    role: 'Đồng Phục Sinh Viên • FPTU',
    gender: 'male',
    color: '#f26f21',
    spriteKey: 'char_hoodie_fuda',
    desc: 'Tóc nâu bồng bềnh, áo hoodie cam FPTU đặc trưng, tai nghe gaming, năng động trẻ trung.',
    tags: ['FPTU', 'Sinh Viên', 'Cam']
  },
  {
    id: 'polo_fuda',
    name: 'Áo Polo Cam Chính Khóa FPTU',
    role: 'Đồng Phục Cơ Bản • FPTU',
    gender: 'male',
    color: '#ea580c',
    spriteKey: 'char_polo_fuda',
    desc: 'Áo Polo cam FPTU viền xanh navy, quần âu đen chỉn chu trong mọi buổi lễ và sự kiện.',
    tags: ['FPTU', 'Polo', 'Chính Khóa']
  },
  {
    id: 'tee_dev_black',
    name: 'Áo Thun Đen Hackathon Builder',
    role: 'Trang Phục Lập Trình Viên',
    gender: 'male',
    color: '#0f172a',
    spriteKey: 'char_tee_dev_black',
    desc: 'Áo thun đen bản sắc lập trình viên, thức trắng đêm cùng CI/CD và giải đấu hackathon.',
    tags: ['Hackathon', 'Áo Thun', 'Coder']
  },
  {
    id: 'suit_formal',
    name: 'Bộ Vest Công Nghệ Lịch Lãm',
    role: 'Trang Phục Thuyết Trình • Pitching',
    gender: 'male',
    color: '#1e293b',
    spriteKey: 'char_suit_formal',
    desc: 'Bộ vest đen sang trọng, cà vạt xanh, tóc vuốt ngược pompadour lịch lãm tại hội thảo.',
    tags: ['Vest', 'Formal', 'CEO']
  },
  {
    id: 'jersey_sport',
    name: 'Đồng Phục Thể Thao Sân Cỏ',
    role: 'Áo Bóng Đá FPTU Số 10',
    gender: 'male',
    color: '#16a34a',
    spriteKey: 'char_jersey_sport',
    desc: 'Băng đô thể thao, áo jersey xanh lá số 10, giày thể thao sẵn sàng cho mọi trận cầu.',
    tags: ['Thể Thao', 'Bóng Đá', 'Số 10']
  },
  {
    id: 'hoodie_terminal',
    name: 'Áo Hoodie Matrix Terminal',
    role: 'Trang Phục Hacker • Linux',
    gender: 'male',
    color: '#15803d',
    spriteKey: 'char_hoodie_terminal',
    desc: 'Tóc bạc neon, kính râm đen, áo hoodie in họa tiết dòng lệnh terminal xanh lá bí ẩn.',
    tags: ['Cyber', 'Terminal', 'Hacker']
  },
  {
    id: 'leather_biker',
    name: 'Áo Khoác Da Biker Classic',
    role: 'Streetwear • Phong Cách Bụi',
    gender: 'male',
    color: '#18181b',
    spriteKey: 'char_leather_biker',
    desc: 'Áo khoác da biker đen bụi bặm, găng tay da, phong cách đường phố tự do và cá tính.',
    tags: ['Biker', 'Áo Da', 'Rocker']
  },
  {
    id: 'base_male',
    name: 'Set Đồ Sinh Viên Cơ Bản (Nam)',
    role: 'Thư Sinh Học Đường',
    gender: 'male',
    color: '#3b82f6',
    spriteKey: 'char_base_male',
    desc: 'Phong cách thư sinh nhẹ nhàng, dễ mến của chàng sinh viên năm nhất trường FPT.',
    tags: ['Basic', 'Thư Sinh']
  },

  // --- NHÂN VẬT NỮ (FEMALE CHARACTERS) ---
  {
    id: 'sample_fptu_female',
    name: 'Set Áo Polo & Váy Tennis FPTU',
    role: 'Đồng Phục Nữ Sinh • FPTU',
    gender: 'female',
    color: '#f26f21',
    spriteKey: 'char_sample_fptu_female',
    desc: 'Tóc đuôi ngựa nâu hạt dẻ cài nơ cam, áo polo cam FPTU có cổ, chân váy tennis xếp ly navy, nụ cười tươi má hồng cam đào.',
    tags: ['Mới', 'FPTU', 'Gather.town v2']
  },
  {
    id: 'sample_wizard_sorceress',
    name: 'Set Phù Thủy Thuật Toán Code',
    role: 'Trang Phục Ảo Thuật • Fantasy',
    gender: 'female',
    color: '#c084fc',
    spriteKey: 'char_sample_wizard_sorceress',
    desc: 'Tóc twintails bạch kim tím pastel, nón phù thủy mini ngôi sao, áo choàng tím viền vàng, biểu cảm nháy mắt tinh nghịch.',
    tags: ['Mới', 'Anime', 'Fantasy']
  },
  {
    id: 'aodai_white',
    name: 'Áo Dài Trắng Nữ Sinh Tinh Khôi',
    role: 'Áo Dài Truyền Thống Việt Nam',
    gender: 'female',
    color: '#f8fafc',
    spriteKey: 'char_aodai_white',
    desc: 'Tóc dài thắt bím truyền thống, tà áo dài lụa trắng thướt tha, nét đẹp duyên dáng Việt Nam.',
    tags: ['Áo Dài', 'Truyền Thống', 'Nữ Sinh']
  },
  {
    id: 'aodai_fuda',
    name: 'Áo Dài Cam Cách Tân FPTU',
    role: 'Lễ Phục Nữ Sinh • FUDA',
    gender: 'female',
    color: '#ea580c',
    spriteKey: 'char_aodai_fuda',
    desc: 'Áo dài cách tân sắc cam FPTU viền xanh navy quý phái, tóc đuôi ngựa đen óng ả.',
    tags: ['Áo Dài', 'FPTU', 'Cách Tân']
  },
  {
    id: 'hoodie_gaming',
    name: 'Áo Hoodie Gaming & Tai Nghe Mèo',
    role: 'Trang Phục Streamer Esport',
    gender: 'female',
    color: '#dc2626',
    spriteKey: 'char_hoodie_gaming',
    desc: 'Tóc song mã (twintails) tím pastel, tai nghe mèo RGB, áo hoodie gaming đỏ đen rực lửa.',
    tags: ['Streamer', 'Gaming', 'Cyber']
  },
  {
    id: 'apron_barista',
    name: 'Set Tạp Dề Nữ Barista Căn Tin',
    role: 'Đồng Phục Cà Phê Căn Tin',
    gender: 'female',
    color: '#854d0e',
    spriteKey: 'char_apron_barista',
    desc: 'Khăn turban đội đầu, tạp dề pha chế nâu ấm áp, nụ cười tỏa nắng bên quầy pha chế.',
    tags: ['Căn Tin', 'Cà Phê', 'Barista']
  },
  {
    id: 'base_female',
    name: 'Set Đồ Sinh Viên Cơ Bản (Nữ)',
    role: 'Nữ Sinh Trẻ Trung',
    gender: 'female',
    color: '#ec4899',
    spriteKey: 'char_base_female',
    desc: 'Tóc nâu hạt dẻ ngang vai, trang phục học đường đơn giản, xinh xắn và thông minh.',
    tags: ['Basic', 'Dễ Thương']
  },
  {
    id: 'npc_thuky_anh',
    name: 'Áo Dài Cam Kính Cận Tri Thức',
    role: 'Đồng Phục Nữ Sinh • FPTU',
    gender: 'female',
    color: '#ea580c',
    spriteKey: 'char_npc_thuky_anh',
    desc: 'Tóc ponytail đen gọn gàng, kính cận thông minh, áo dài cam FPTU thướt tha, trang nhã.',
    tags: ['Áo Dài', 'Nữ Sinh', 'Tri Thức']
  },

  // --- NHÂN VẬT ĐẶC BIỆT & LINH THÚ (UNISEX / SPECIAL CHARACTERS) ---
  {
    id: 'vovinam_suit',
    name: 'Võ Phục Vovinam Truyền Thống',
    role: 'Việt Võ Đạo • Tinh Thần Thượng Võ',
    gender: 'unisex',
    color: '#0284c7',
    spriteKey: 'char_vovinam_suit',
    desc: 'Võ phục Vovinam xanh lam truyền thống, đai vàng kiêu hãnh, biểu tượng môn võ rèn thể chất FPTU.',
    tags: ['Vovinam', 'Võ Thuật', 'Đai Vàng']
  },
  {
    id: 'wizard_robe',
    name: 'Áo Choàng Pháp Sư Huyền Bí',
    role: 'Trang Phục Magic Developer',
    gender: 'unisex',
    color: '#4c1d95',
    spriteKey: 'char_wizard_robe',
    desc: 'Áo choàng pháp sư tím huyền bí, mũ chóp đính sao, cây trượng triệu hồi các thuật toán tối ưu.',
    tags: ['Pháp Sư', 'Thuật Toán', 'Huyền Bí']
  },
  {
    id: 'mecha_suit',
    name: 'Bộ Giáp Mecha Chiến Binh AI',
    role: 'Bộ Giáp Sci-Fi Tương Lai',
    gender: 'unisex',
    color: '#0891b2',
    spriteKey: 'char_mecha_suit',
    desc: 'Bộ giáp mecha tương lai bọc hợp kim cyan, hệ thống LED neon phát sáng dọc thân mình.',
    tags: ['Mecha', 'Robot', 'AI']
  },
  {
    id: 'frog_mascot',
    name: 'Trang Phục Mascot Cóc Vàng FPTU',
    role: 'Mascot May Mắn • Điểm A+',
    gender: 'unisex',
    color: '#eab308',
    spriteKey: 'char_frog_mascot',
    desc: 'Bộ mascot Cóc Vàng FPTU siêu đáng yêu, biểu tượng của sự may mắn, vượt qua mọi kỳ thi qua môn.',
    tags: ['Cóc Vàng', 'Mascot', 'May Mắn']
  },
  {
    id: 'buggy_mascot',
    name: 'Trang Phục Mascot Bọ Buggy CLB',
    role: 'Linh Vật Chính Thức • FU-DEVER',
    gender: 'unisex',
    color: '#ef4444',
    spriteKey: 'char_buggy_mascot',
    desc: 'Chú bọ cánh cam Buggy đáng yêu với lớp cánh đỏ chấm bi đen, 2 râu anten tinh nghịch, biểu tượng của sự may mắn và sạch bug code.',
    tags: ['Mascot', 'Buggy', 'FU-DEVER', 'Mới']
  }
];

export const WARDROBE_CONFIG = {
  // Danh sách Tab lọc danh mục nhân vật
  tabs: [
    { id: 'all', name: 'Tất Cả' },
    { id: 'male', name: 'Nhân Vật Nam' },
    { id: 'female', name: 'Nhân Vật Nữ' },
    { id: 'special', name: 'Mascot & Linh Vật' }
  ],

  // Hệ thống Nhân Vật Hoàn Chỉnh (Character Presets)
  characters: CHARACTER_PRESETS,
  outfits: CHARACTER_PRESETS, // Tương thích ngược

  // Túi Đồ & Vật Phẩm Cầm Tay Trực Tiếp (In-Hand Equipments)
  inHandEquipments: [
    { id: 'none', name: 'Tay Không', icon: '✕', desc: 'Không cầm đồ vật' },
    { id: 'macbook_dev', name: 'MacBook Pro Dev', icon: '💻', desc: 'Mở máy gõ phím với màn hình phát sáng' },
    { id: 'danang_salt_coffee', name: 'Ly Cà Phê Muối Đà Nẵng', icon: '☕', desc: 'Cầm ly cafe bốc khói nghi ngút' },
    { id: 'golden_frog_plush', name: 'Gấu Bông Cóc Vàng', icon: '🐸', desc: 'Ôm gấu bông may mắn trước ngực' },
    { id: 'football_ball', name: 'Quả Bóng Đá 11M', icon: '⚽', desc: 'Kẹp bóng bên hông sân cỏ' },
    { id: 'basketball_ball', name: 'Quả Bóng Rổ FPTU', icon: '🏀', desc: 'Đập bóng nảy nhẹ trên sàn' },
    { id: 'dever_flag', name: 'Cờ CLB FU-DEVER', icon: '🚩', desc: 'Cầm cán cờ phấp phới tự hào' }
  ],

  // Mẫu nhân vật tương lai đang ấp ủ phát triển
  upcomingOutfits: [
    { id: 'dress_fuda', name: 'Đầm Nữ Sinh FUDA Thanh Lịch', type: 'dress', color: '#38bdf8' },
    { id: 'aodai_red', name: 'Áo Dài Cách Tân Đỏ Lễ Hội', type: 'aodai', color: '#dc2626' },
    { id: 'sailor_uniform', name: 'Đồng Phục Thủy Thủ Sailor Nữ', type: 'sailor', color: '#1e3a8a' },
    { id: 'bomber_cyber', name: 'Áo Khoác Bomber Cyberpunk Neon', type: 'bomber', color: '#7e22ce' },
    { id: 'hacker_matrix', name: 'Áo Choàng Hacker Matrix Dark', type: 'bomber', color: '#064e3b' },
    { id: 'tee_opensource', name: 'Áo Thun Open Source Linux Tux', type: 'tee', color: '#334155' },
    { id: 'jersey_basketball', name: 'Áo Bóng Rổ Ba Lỗ Bulls Đỏ', type: 'jersey', color: '#b91c1c' },
    { id: 'cardigan_autumn', name: 'Áo Len Cardigan Mùa Thu Pastel', type: 'cardigan', color: '#d97706' },
    { id: 'denim_overall', name: 'Váy Yếm Denim Jean Nữ Sinh', type: 'dress', color: '#2563eb' }
  ]
};

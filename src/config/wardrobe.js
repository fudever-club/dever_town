/**
 * Cấu hình Hệ Thống Nhân Vật Hoàn Chỉnh (Character Presets) & Túi Đồ Cầm Tay FU-DEVER
 * Mỗi nhân vật là một tạo hình Chibi hoàn chỉnh đã tích hợp sẵn tóc, trang phục, khuôn mặt và phụ kiện.
 */

export const CHARACTER_PRESETS = [
  // --- NHÂN VẬT NAM (MALE CHARACTERS) ---
  {
    id: 'sample_dev_dever',
    name: 'Nam Dev FU-DEVER (V2 Remaster)',
    role: 'Core Builder • Tech Lead',
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
    name: 'Barista An Cà Phê Muối (V2)',
    role: 'Host Thân Thiện • Cà Phê Muối',
    gender: 'male',
    color: '#d97706',
    spriteKey: 'char_sample_barista_an',
    desc: 'Tóc búi củ tỏi nâu socola, kính tròn gọng vàng, tạp dề cà phê thêu Cóc Vàng, nụ cười hiền từ chu đáo.',
    tags: ['Mới', 'Gather.town v2', 'Barista']
  },
  {
    id: 'hoodie_dever',
    name: 'Nam Dev FU-DEVER',
    role: 'Core Member • Web/AI',
    gender: 'male',
    color: '#0066CC',
    spriteKey: 'char_hoodie_dever',
    desc: 'Tóc ngắn undercut đen, kính cận thông minh, áo hoodie xanh CLB FU-DEVER nhiệt huyết.',
    tags: ['CLB', 'Developer', 'Hoodie']
  },
  {
    id: 'polo_dever',
    name: 'Nam Leader K20 FU-DEVER',
    role: 'Ban Chủ Nhiệm • Ban Điều Hành',
    gender: 'male',
    color: '#2563eb',
    spriteKey: 'char_polo_dever',
    desc: 'Tóc wolf cut lịch lãm, áo Polo xanh FU-DEVER chính khóa, phong thái lãnh đạo tự tin.',
    tags: ['Ban Chủ Nhiệm', 'Polo', 'Leader']
  },
  {
    id: 'hoodie_fuda',
    name: 'Nam Sinh Viên FPTU',
    role: 'Sinh Viên K20 • ĐH FPT',
    gender: 'male',
    color: '#f26f21',
    spriteKey: 'char_hoodie_fuda',
    desc: 'Tóc nâu bồng bềnh, áo hoodie cam FPTU đặc trưng, tai nghe gaming, năng động trẻ trung.',
    tags: ['FPTU', 'Sinh Viên', 'Cam']
  },
  {
    id: 'polo_fuda',
    name: 'Nam Cán Bộ FPTU Đà Nẵng',
    role: 'Đồng Phục Chính Khóa',
    gender: 'male',
    color: '#ea580c',
    spriteKey: 'char_polo_fuda',
    desc: 'Áo Polo cam FPTU viền xanh navy, quần âu đen chỉn chu trong mọi buổi lễ và sự kiện.',
    tags: ['FPTU', 'Polo', 'Chính Khóa']
  },
  {
    id: 'tee_dev_black',
    name: 'Nam Dev Hackathon Đêm',
    role: 'Hacker • Full-Stack Coder',
    gender: 'male',
    color: '#0f172a',
    spriteKey: 'char_tee_dev_black',
    desc: 'Áo thun đen bản sắc lập trình viên, thức trắng đêm cùng CI/CD và giải đấu hackathon.',
    tags: ['Hackathon', 'Áo Thun', 'Coder']
  },
  {
    id: 'suit_formal',
    name: 'Nam Thuyết Trình Tech CEO',
    role: 'Startup Founder • Pitching',
    gender: 'male',
    color: '#1e293b',
    spriteKey: 'char_suit_formal',
    desc: 'Bộ vest đen sang trọng, cà vạt xanh, tóc vuốt ngược pompadour lịch lãm tại hội thảo.',
    tags: ['Vest', 'Formal', 'CEO']
  },
  {
    id: 'jersey_sport',
    name: 'Nam Vận Động Viên FPTU',
    role: 'Cầu Thủ Sân Cỏ Số 10',
    gender: 'male',
    color: '#16a34a',
    spriteKey: 'char_jersey_sport',
    desc: 'Băng đô thể thao, áo jersey xanh lá số 10, giày thể thao sẵn sàng cho mọi trận cầu.',
    tags: ['Thể Thao', 'Bóng Đá', 'Số 10']
  },
  {
    id: 'hoodie_terminal',
    name: 'Cyber Hacker Terminal',
    role: 'Security Engineer • Linux',
    gender: 'male',
    color: '#15803d',
    spriteKey: 'char_hoodie_terminal',
    desc: 'Tóc bạc neon, kính râm đen, áo hoodie in họa tiết dòng lệnh terminal xanh lá bí ẩn.',
    tags: ['Cyber', 'Terminal', 'Hacker']
  },
  {
    id: 'leather_biker',
    name: 'Biker Phượt Thủ Đường Phố',
    role: 'Streetwear • Rocker',
    gender: 'male',
    color: '#18181b',
    spriteKey: 'char_leather_biker',
    desc: 'Áo khoác da biker đen bụi bặm, găng tay da, phong cách đường phố tự do và cá tính.',
    tags: ['Biker', 'Áo Da', 'Rocker']
  },
  {
    id: 'base_male',
    name: 'Nam Sinh Viên Thanh Lịch',
    role: 'Thư Sinh • Basic',
    gender: 'male',
    color: '#3b82f6',
    spriteKey: 'char_base_male',
    desc: 'Phong cách thư sinh nhẹ nhàng, dễ mến của chàng sinh viên năm nhất trường FPT.',
    tags: ['Basic', 'Thư Sinh']
  },

  // --- NHÂN VẬT NỮ (FEMALE CHARACTERS) ---
  {
    id: 'sample_fptu_female',
    name: 'Nữ Sinh FPTU Tươi Tắn (V2)',
    role: 'Campus Ambassador • FPTU',
    gender: 'female',
    color: '#f26f21',
    spriteKey: 'char_sample_fptu_female',
    desc: 'Tóc đuôi ngựa nâu hạt dẻ cài nơ cam, áo polo cam FPTU có cổ, chân váy tennis xếp ly navy, nụ cười tươi má hồng cam đào.',
    tags: ['Mới', 'FPTU', 'Gather.town v2']
  },
  {
    id: 'sample_wizard_sorceress',
    name: 'Phù Thủy Thuật Toán (Anime)',
    role: 'Algorithm Sorceress • Fantasy',
    gender: 'female',
    color: '#c084fc',
    spriteKey: 'char_sample_wizard_sorceress',
    desc: 'Tóc twintails bạch kim tím pastel, nón phù thủy mini ngôi sao, áo choàng tím viền vàng, biểu cảm nháy mắt tinh nghịch.',
    tags: ['Mới', 'Anime', 'Fantasy']
  },
  {
    id: 'aodai_white',
    name: 'Nữ Sinh Áo Dài Trắng',
    role: 'Nữ Sinh Tinh Khôi • FPTU',
    gender: 'female',
    color: '#f8fafc',
    spriteKey: 'char_aodai_white',
    desc: 'Tóc dài thắt bím truyền thống, tà áo dài lụa trắng thướt tha, nét đẹp duyên dáng Việt Nam.',
    tags: ['Áo Dài', 'Truyền Thống', 'Nữ Sinh']
  },
  {
    id: 'aodai_fuda',
    name: 'Nữ Sinh Áo Dài FPTU',
    role: 'Đại Sứ Thương Hiệu FUDA',
    gender: 'female',
    color: '#ea580c',
    spriteKey: 'char_aodai_fuda',
    desc: 'Áo dài cách tân sắc cam FPTU viền xanh navy quý phái, tóc đuôi ngựa đen óng ả.',
    tags: ['Áo Dài', 'FPTU', 'Cách Tân']
  },
  {
    id: 'hoodie_gaming',
    name: 'Nữ Streamer Cyber Gamer',
    role: 'Game Dev & Esport Caster',
    gender: 'female',
    color: '#dc2626',
    spriteKey: 'char_hoodie_gaming',
    desc: 'Tóc song mã (twintails) tím pastel, tai nghe mèo RGB, áo hoodie gaming đỏ đen rực lửa.',
    tags: ['Streamer', 'Gaming', 'Cyber']
  },
  {
    id: 'apron_barista',
    name: 'Nữ Barista Cà Phê Căn Tin',
    role: 'Chuyên Viên Cà Phê Muối',
    gender: 'female',
    color: '#854d0e',
    spriteKey: 'char_apron_barista',
    desc: 'Khăn turban đội đầu, tạp dề pha chế nâu ấm áp, nụ cười tỏa nắng bên quầy pha chế.',
    tags: ['Căn Tin', 'Cà Phê', 'Barista']
  },
  {
    id: 'base_female',
    name: 'Nữ Sinh Viên Dễ Thương',
    role: 'Nữ Coder • Basic',
    gender: 'female',
    color: '#ec4899',
    spriteKey: 'char_base_female',
    desc: 'Tóc nâu hạt dẻ ngang vai, trang phục học đường đơn giản, xinh xắn và thông minh.',
    tags: ['Basic', 'Dễ Thương']
  },
  {
    id: 'npc_thuky_anh',
    name: 'Thư Ký Ngọc Ánh',
    role: 'Thư Ký CLB FU-DEVER • K20',
    gender: 'female',
    color: '#ea580c',
    spriteKey: 'char_npc_thuky_anh',
    desc: 'Tóc ponytail đen gọn gàng, kính thông minh, áo dài cam FPTU thướt tha, chu đáo và nhiệt tình.',
    tags: ['Thư Ký', 'Ban Quản Trị', 'Áo Dài']
  },

  // --- NHÂN VẬT ĐẶC BIỆT & LINH THÚ (UNISEX / SPECIAL CHARACTERS) ---
  {
    id: 'vovinam_suit',
    name: 'Võ Sinh Vovinam FPTU',
    role: 'Việt Võ Đạo • Tinh Thần Thượng Võ',
    gender: 'unisex',
    color: '#0284c7',
    spriteKey: 'char_vovinam_suit',
    desc: 'Võ phục Vovinam xanh lam truyền thống, đai vàng kiêu hãnh, biểu tượng môn võ rèn thể chất FPTU.',
    tags: ['Vovinam', 'Võ Thuật', 'Đai Vàng']
  },
  {
    id: 'wizard_robe',
    name: 'Phù Thủy Thuật Toán Code',
    role: 'Algorithm Wizard • Magic Dev',
    gender: 'unisex',
    color: '#4c1d95',
    spriteKey: 'char_wizard_robe',
    desc: 'Áo choàng pháp sư tím huyền bí, mũ chóp đính sao, cây trượng triệu hồi các thuật toán tối ưu.',
    tags: ['Pháp Sư', 'Thuật Toán', 'Huyền Bí']
  },
  {
    id: 'mecha_suit',
    name: 'Cyber Mecha Android',
    role: 'Robot AI Tương Lai • Sci-Fi',
    gender: 'unisex',
    color: '#0891b2',
    spriteKey: 'char_mecha_suit',
    desc: 'Bộ giáp mecha tương lai bọc hợp kim cyan, hệ thống LED neon phát sáng dọc thân mình.',
    tags: ['Mecha', 'Robot', 'AI']
  },
  {
    id: 'frog_mascot',
    name: 'Linh Vật Cóc Vàng FPTU',
    role: 'Mascot May Mắn • Điểm A+',
    gender: 'unisex',
    color: '#eab308',
    spriteKey: 'char_frog_mascot',
    desc: 'Bộ mascot Cóc Vàng FPTU siêu đáng yêu, biểu tượng của sự may mắn, vượt qua mọi kỳ thi qua môn.',
    tags: ['Cóc Vàng', 'Mascot', 'May Mắn']
  }
];

export const WARDROBE_CONFIG = {
  // Danh sách Tab lọc theo giới tính
  tabs: [
    { id: 'all', name: 'Chung (Tất Cả)', icon: '👥' },
    { id: 'male', name: 'Nhân Vật Nam', icon: '👦' },
    { id: 'female', name: 'Nhân Vật Nữ', icon: '👧' }
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

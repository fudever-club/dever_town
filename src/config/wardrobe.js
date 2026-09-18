/**
 * Cấu hình Tủ đồ & Tùy chỉnh nhân vật nâng cao FUDA & FU-DEVER (Wardrobe Customizer)
 * Mở rộng 32 Bộ Trang Phục & 20 Kiểu Tóc Thời Thượng Đa Dạng Nam & Nữ
 */
export const WARDROBE_CONFIG = {
  genders: [
    { id: 'male', name: 'Nam Sinh FUDA', icon: '👦' },
    { id: 'female', name: 'Nữ Sinh FUDA', icon: '👧' }
  ],

  skinTones: [
    { id: 'skin_fair', name: 'Trắng Sáng Tinh Khôi', color: '#fed7aa', highlight: '#ffedd5', shadow: '#fdba74' },
    { id: 'skin_natural', name: 'Vàng Tự Nhiên Á Đông', color: '#fbd1a2', highlight: '#fde68a', shadow: '#f59e0b' },
    { id: 'skin_tan', name: 'Bánh Mật Năng Động', color: '#d97706', highlight: '#f59e0b', shadow: '#b45309' },
    { id: 'skin_deep', name: 'Nâu Khỏe Khoắn', color: '#92400e', highlight: '#b45309', shadow: '#78350f' },
    { id: 'skin_ebony', name: 'Ngăm Đậm Thời Thượng', color: '#573016', highlight: '#78350f', shadow: '#3b1d08' },
    { id: 'skin_cyber', name: 'Cyborg Android Xanh', color: '#bae6fd', highlight: '#e0f2fe', shadow: '#7dd3fc' }
  ],

  facialHairs: [
    { id: 'none', name: 'Mặt Nhẵn Nhụi', icon: '✕', desc: 'Thư sinh, trẻ trung' },
    { id: 'full_beard', name: 'Râu Quai Nón Senior Dev', icon: '🧔', desc: 'Viền râu quai hàm rậm rạp uy lực' },
    { id: 'mustache', name: 'Ria Mép Lịch Lãm', icon: '👨', desc: 'Hàng ria mép tỉa gọn gàng phong độ' },
    { id: 'goatee', name: 'Râu Cằm / Râu Dê', icon: '🐐', desc: 'Chòm râu cằm sắc sảo, cá tính' },
    { id: 'stubble', name: 'Râu Lún Phún Deadline', icon: '✨', desc: 'Vệt râu xanh cày code thâu đêm' },
    { id: 'grey_beard', name: 'Râu Bạc Giáo Sư', icon: '👴', desc: 'Phong thái thông thái của giảng viên' }
  ],

  expressions: [
    { id: 'expr_focus', name: 'Tập Trung Cao Độ', icon: '🎯', desc: 'Mắt sắc bén tập trung fix bug' },
    { id: 'expr_smile', name: 'Vui Tươi Rạng Rỡ', icon: '😊', desc: 'Khóe mắt cười híp và má hồng' },
    { id: 'expr_cool', name: 'Nháy Mắt Tự Tin', icon: '😉', desc: 'Nháy một bên mắt cực ngầu' },
    { id: 'expr_shock', name: 'Sốc Vì Gặp Bug', icon: '😲', desc: 'Mắt tròn xoe ngạc nhiên' },
    { id: 'expr_chill', name: 'Thư Thái Lofi', icon: '😌', desc: 'Mắt khép hờ nhâm nhi cà phê' }
  ],

  inHandEquipments: [
    { id: 'none', name: 'Tay Không', icon: '✕', desc: 'Không cầm đồ vật' },
    { id: 'macbook_dev', name: 'MacBook Pro Dev', icon: '💻', desc: 'Mở máy gõ phím với màn hình phát sáng' },
    { id: 'danang_salt_coffee', name: 'Ly Cà Phê Muối Đà Nẵng', icon: '☕', desc: 'Cầm ly cafe bốc khói nghi ngút' },
    { id: 'golden_frog_plush', name: 'Gấu Bông Cóc Vàng', icon: '🐸', desc: 'Ôm gấu bông may mắn trước ngực' },
    { id: 'football_ball', name: 'Quả Bóng Đá 11M', icon: '⚽', desc: 'Kẹp bóng bên hông sân cỏ' },
    { id: 'basketball_ball', name: 'Quả Bóng Rổ FPTU', icon: '🏀', desc: 'Đập bóng nảy nhẹ trên sàn' },
    { id: 'dever_flag', name: 'Cờ CLB FU-DEVER', icon: '🚩', desc: 'Cầm cán cờ phấp phới tự hào' }
  ],

  outfits: [
    // 1. Học Đường & Đồng Phục FPTU / FU-DEVER (Pre-baked Chibi HD)
    { id: 'hoodie_fuda', name: 'Áo Hoodie FUDA Cam', type: 'hoodie', color: '#f26f21', collarColor: '#002147', desc: 'Màu cam nhiệt huyết biểu tượng trường FPTU Đà Nẵng' },
    { id: 'polo_fuda', name: 'Áo Polo Đồng Phục FPTU Cam', type: 'polo', color: '#ea580c', collarColor: '#002147', desc: 'Đồng phục chính khóa sinh viên FUDA' },
    { id: 'hoodie_dever', name: 'Áo Hoodie Xanh FU-DEVER', type: 'hoodie', color: '#0066CC', collarColor: '#0f172a', desc: 'Màu xanh công nghệ của CLB Lập Trình FU-DEVER' },
    { id: 'polo_dever', name: 'Áo Polo Xanh FU-DEVER Core', type: 'polo', color: '#2563eb', collarColor: '#1d4ed8', desc: 'Đồng phục Ban Điều Hành & Ban Chủ Nhiệm FU-DEVER' },
    { id: 'tee_dev_black', name: 'Áo Thun Dev FU-DEVER Hackathon', type: 'tee', color: '#0f172a', collarColor: '#38bdf8', desc: 'Áo thun lập trình viên thức đêm cày code' },
    { id: 'aodai_white', name: 'Áo Dài Trắng Nữ Sinh Tinh Khôi', type: 'aodai', color: '#f8fafc', collarColor: '#e2e8f0', desc: 'Nét đẹp truyền thống duyên dáng của nữ sinh Việt Nam' },
    { id: 'aodai_fuda', name: 'Áo Dài Nữ Sinh FPTU Cách Tân', type: 'aodai', color: '#ea580c', collarColor: '#002147', desc: 'Áo dài cách tân sắc cam trường FPTU rạng rỡ' },

    // 2. Phong Cách & Nghề Nghiệp (Career & Campus Life)
    { id: 'suit_formal', name: 'Bộ Vest Công Sở Tech CEO Lịch Lãm', type: 'suit', color: '#1e293b', collarColor: '#ffffff', desc: 'Bộ vest quyền lực của nhà sáng lập Startup' },
    { id: 'jersey_sport', name: 'Áo Thể Thao FPTU Sân Cỏ Số 10', type: 'jersey', color: '#16a34a', collarColor: '#ffffff', desc: 'Trang phục thể thao năng động trên sân bóng FPTU' },
    { id: 'hoodie_gaming', name: 'Áo Hoodie Gaming Esport Đỏ Đen', type: 'hoodie', color: '#dc2626', collarColor: '#18181b', desc: 'Phong cách thi đấu Game Jam & Esport rực lửa' },
    { id: 'hoodie_terminal', name: 'Áo Hoodie Terminal Hacker Xanh Lá', type: 'hoodie', color: '#15803d', collarColor: '#0f172a', desc: 'Họa tiết dòng lệnh terminal hacker bí ẩn' },
    { id: 'apron_barista', name: 'Tạp Dề Barista Cà Phê Muối Nâu', type: 'barista', color: '#854d0e', collarColor: '#fef08a', desc: 'Trang phục chuyên gia pha chế Căn Tin FUDA' },

    // 3. Bộ Trang Phục Đặc Biệt (Special Legendary Outfits)
    { id: 'vovinam_suit', name: 'Võ Phục Vovinam FPTU Đai Vàng', type: 'martial', color: '#0284c7', collarColor: '#eab308', desc: 'Võ phục Việt Võ Đạo rèn luyện thể chất FPTU' },
    { id: 'leather_biker', name: 'Áo Khoác Da Biker Rocker Đen', type: 'biker', color: '#18181b', collarColor: '#94a3b8', desc: 'Phong cách cá tính, bụi bặm của dân phượt' },
    { id: 'wizard_robe', name: 'Áo Choàng Pháp Sư Huyền Bí', type: 'wizard', color: '#4c1d95', collarColor: '#fbbf24', desc: 'Phù thủy công nghệ triệu hồi mã code kỳ diệu' },
    { id: 'frog_mascot', name: 'Bộ Đồ Cóc Vàng Mascot FUDA', type: 'frog', color: '#eab308', collarColor: '#15803d', desc: 'Linh vật Cóc Vàng mang lại may mắn và điểm A+' },
    { id: 'mecha_suit', name: 'Bộ Giáp Mecha Android Tương Lai', type: 'mecha', color: '#0891b2', collarColor: '#22d3ee', desc: 'Thiết kế người máy công nghệ cao siêu ngầu' }
  ],

  get hoodies() {
    return this.outfits;
  },

  /**
   * Kho lưu trữ các mẫu trang phục đang phát triển (Sẽ mở khóa ở các bản cập nhật tiếp theo)
   */
  upcomingOutfits: [
    { id: 'dress_fuda', name: 'Đầm Nữ Sinh FUDA Thanh Lịch', type: 'dress', color: '#38bdf8' },
    { id: 'aodai_red', name: 'Áo Dài Cách Tân Đỏ Lễ Hội', type: 'aodai', color: '#dc2626' },
    { id: 'sailor_uniform', name: 'Đồng Phục Thủy Thủ Sailor Nữ', type: 'sailor', color: '#1e3a8a' },
    { id: 'shirt_tie', name: 'Sơ Mi Trắng & Cà Vạt Học Viện', type: 'suit', color: '#f8fafc' },
    { id: 'bomber_cyber', name: 'Áo Khoác Bomber Cyberpunk Neon', type: 'bomber', color: '#7e22ce' },
    { id: 'hacker_matrix', name: 'Áo Choàng Hacker Matrix Dark', type: 'bomber', color: '#064e3b' },
    { id: 'tee_opensource', name: 'Áo Thun Open Source Linux Tux', type: 'tee', color: '#334155' },
    { id: 'jersey_basketball', name: 'Áo Bóng Rổ Ba Lỗ Bulls Đỏ', type: 'jersey', color: '#b91c1c' },
    { id: 'gym_croptop', name: 'Đồ Thể Thao Nữ Crop-top Gym & Dance', type: 'croptop', color: '#ec4899' },
    { id: 'swimsuit_sport', name: 'Đồ Bơi Thể Thao Nữ Beach Surf', type: 'croptop', color: '#06b6d4' },
    { id: 'oversize_hiphop', name: 'Áo Thun Oversize Streetwear Hip-Hop', type: 'tee', color: '#6366f1' },
    { id: 'cardigan_autumn', name: 'Áo Len Cardigan Mùa Thu Pastel', type: 'cardigan', color: '#d97706' },
    { id: 'denim_overall', name: 'Váy Yếm Denim Jean Nữ Sinh', type: 'dress', color: '#2563eb' },
    { id: 'windbreaker_retro', name: 'Áo Khoác Gió Retro 90s Block', type: 'bomber', color: '#059669' },
    { id: 'trench_coat', name: 'Áo Măng Tô Dạ Dáng Dài Quý Phái', type: 'cardigan', color: '#78350f' },
    { id: 'blazer_female', name: 'Bộ Suit Nữ Blazer Công Sở Hiện Đại', type: 'suit', color: '#475569' },
    { id: 'lab_coat', name: 'Áo Blouse Trắng Bác Sĩ & Lab Tech', type: 'suit', color: '#f8fafc' },
    { id: 'yukata_sakura', name: 'Kimono Yukata Hoa Anh Đào', type: 'yukata', color: '#f472b6' },
    { id: 'princess_gown', name: 'Đầm Công Chúa Dạ Hội Dạ Quang', type: 'dress', color: '#a855f7' }
  ],

  hairstyles: [
    // --- KIỂU TÓC NAM (MALE HAIRSTYLES) ---
    { id: 'short', name: 'Tóc Ngắn Thể Thao (Short Crop)' },
    { id: 'parted', name: 'Tóc Mái 7/3 Lãng Tử (Side Part)' },
    { id: 'undercut', name: 'Tóc Undercut Vuốt Ngược' },
    { id: 'curly_perm', name: 'Tóc Xoăn Xù Mì Hàn Quốc' },
    { id: 'bowl_cut', name: 'Tóc Đầu Nấm Dễ Thương (Bowl Cut)' },
    { id: 'man_bun', name: 'Tóc Búi Củ Tỏi Samurai (Man Bun)' },
    { id: 'spiky_anime', name: 'Tóc Dựng Anime Gai Nhọn' },
    { id: 'dreadlocks', name: 'Tóc Dreadlocks Hip-Hop' },
    { id: 'wolf_cut', name: 'Tóc Wolf Cut Layered Bụi Bặm' },
    { id: 'buzz_cut', name: 'Tóc Đầu Đinh Huấn Luyện (Buzz Cut)' },
    { id: 'bald_professor', name: 'Tóc Hói Giáo Sư / Senior Dev (Bald with Side Hair)' },

    // --- KIỂU TÓC NỮ (FEMALE HAIRSTYLES) ---
    { id: 'long', name: 'Tóc Dài Suôn Mượt Nữ Sinh' },
    { id: 'ponytail', name: 'Tóc Đuôi Ngựa Năng Động' },
    { id: 'twintails', name: 'Tóc Hai Chùm Twintails Anime' },
    { id: 'bob', name: 'Tóc Bob Ngắn Ngang Cằm' },
    { id: 'wavy_long', name: 'Tóc Uốn Sóng Nước Bồng Bềnh' },
    { id: 'space_buns', name: 'Tóc Búi Hai Bên Na Tra / Pucca' },
    { id: 'hime_cut', name: 'Tóc Hime Mái Bằng Công Chúa' },
    { id: 'braids', name: 'Tóc Tết Bím Hai Bên Dịu Dàng' },
    { id: 'pixie_cut', name: 'Tóc Pixie Nữ Ngắn Cá Tính' },
    { id: 'afro_curly', name: 'Tóc Xoăn Xù Hippie Bồng Bềnh' }
  ],

  hairColors: [
    { id: 'black', name: 'Đen Tuyền', color: '#0f172a' },
    { id: 'brown', name: 'Nâu Hạt Dẻ', color: '#78350f' },
    { id: 'chocolate', name: 'Nâu Socola', color: '#451a03' },
    { id: 'gold', name: 'Vàng Cát', color: '#f59e0b' },
    { id: 'platinum', name: 'Vàng Bạch Kim', color: '#fef08a' },
    { id: 'silver', name: 'Xám Bạc Cyber', color: '#cbd5e1' },
    { id: 'ruby', name: 'Đỏ Ruby Gamer', color: '#ef4444' },
    { id: 'pink', name: 'Hồng Pastel Anime', color: '#f472b6' },
    { id: 'purple', name: 'Tím Khói Huyền Ảo', color: '#a855f7' },
    { id: 'cyber', name: 'Xanh Neon Cyber', color: '#06b6d4' },
    { id: 'emerald', name: 'Xanh Ngọc Lục Bảo', color: '#10b981' }
  ],

  accessories: [
    { id: 'none', name: 'Không phụ kiện', icon: '✕', desc: 'Phong cách tối giản' },
    { id: 'glasses_smart', name: 'Kính Cận Dev FUDA', icon: '⚯', desc: 'Tăng 50% độ thông minh khi gõ code' },
    { id: 'sunglasses_cool', name: 'Kính Râm Cool Ngầu', icon: '🕶', desc: 'Phong cách ngầu đét khi debug' },
    { id: 'headphones_rgb', name: 'Tai Nghe Gaming RGB', icon: '🎧', desc: 'Cách ly 100% tiếng ồn xung quanh' },
    { id: 'ribbon_cute', name: 'Nơ Băng Đô Nữ Xinh', icon: '🎀', desc: 'Phụ kiện dễ thương cho nữ sinh' },
    { id: 'frog_crown', name: 'Vương Miện Cóc Vàng', icon: '👑', desc: 'Vinh quang Cóc Vàng may mắn FUDA' },
    { id: 'cat_ears', name: 'Tai Mèo Neko Kawaii', icon: '🐱', desc: 'Phụ kiện tai mèo siêu cấp đáng yêu' },
    { id: 'mask_cyber', name: 'Khẩu Trang Hacker', icon: '😷', desc: 'Ẩn danh bí mật trong không gian số' }
  ]
};


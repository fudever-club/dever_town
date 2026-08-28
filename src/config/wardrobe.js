/**
 * Cấu hình Tủ đồ & Tùy chỉnh nhân vật nâng cao FUDA & FU-DEVER (Wardrobe Customizer)
 * Mở rộng 32 Bộ Trang Phục & 20 Kiểu Tóc Thời Thượng Đa Dạng Nam & Nữ
 */
export const WARDROBE_CONFIG = {
  genders: [
    { id: 'male', name: 'Nam Sinh FUDA', icon: '👦' },
    { id: 'female', name: 'Nữ Sinh FUDA', icon: '👧' }
  ],

  outfits: [
    // 1. Học Đường & Đồng Phục FPTU / FU-DEVER
    { id: 'hoodie_fuda', name: 'Áo Hoodie FUDA Cam', type: 'hoodie', color: '#f26f21', collarColor: '#002147', desc: 'Màu cam nhiệt huyết biểu tượng trường FUDA' },
    { id: 'hoodie_dever', name: 'Áo Hoodie Xanh FU-DEVER', type: 'hoodie', color: '#0066CC', collarColor: '#0f172a', desc: 'Màu xanh công nghệ của CLB FU-DEVER' },
    { id: 'polo_fuda', name: 'Áo Polo Đồng Phục FPTU', type: 'polo', color: '#ea580c', collarColor: '#002147', desc: 'Đồng phục chính khóa sinh viên FUDA' },
    { id: 'dress_fuda', name: 'Đầm Nữ Sinh FUDA Thanh Lịch', type: 'dress', color: '#38bdf8', collarColor: '#0284c7', desc: 'Trang phục nữ sinh FPTU trẻ trung, tươi tắn' },
    { id: 'aodai_white', name: 'Áo Dài Trắng Nữ Sinh Tinh Khôi', type: 'aodai', color: '#f8fafc', collarColor: '#e2e8f0', desc: 'Nét đẹp truyền thống duyên dáng của nữ sinh Việt Nam' },
    { id: 'aodai_red', name: 'Áo Dài Cách Tân Đỏ Lễ Hội', type: 'aodai', color: '#dc2626', collarColor: '#fbbf24', desc: 'Áo dài đỏ may mắn rực rỡ trong các dịp sự kiện lớn' },
    { id: 'sailor_uniform', name: 'Đồng Phục Thủy Thủ Sailor Nữ', type: 'sailor', color: '#1e3a8a', collarColor: '#ffffff', desc: 'Phong cách nữ sinh Anime Nhật Bản dễ thương' },
    { id: 'shirt_tie', name: 'Sơ Mi Trắng & Cà Vạt Học Viện', type: 'suit', color: '#f8fafc', collarColor: '#1e293b', desc: 'Phong cách nam sinh học viện lịch lãm, chỉn chu' },

    // 2. Lập Trình Viên, Công Nghệ & Cyberpunk
    { id: 'tee_dev_black', name: 'Áo Thun Dev FU-DEVER Hackathon', type: 'tee', color: '#0f172a', collarColor: '#38bdf8', desc: 'Áo thun lập trình viên thức đêm cày code' },
    { id: 'bomber_cyber', name: 'Áo Khoác Bomber Cyberpunk Neon', type: 'bomber', color: '#7e22ce', collarColor: '#f59e0b', desc: 'Phong cách Cyberpunk tương lai chất lừ' },
    { id: 'hacker_matrix', name: 'Áo Choàng Hacker Matrix Dark', type: 'bomber', color: '#064e3b', collarColor: '#10b981', desc: 'Thời trang hacker bí ẩn trong không gian số' },
    { id: 'mecha_suit', name: 'Bộ Giáp Mecha Android Tương Lai', type: 'mecha', color: '#0891b2', collarColor: '#22d3ee', desc: 'Thiết kế người máy công nghệ cao siêu ngầu' },
    { id: 'tee_opensource', name: 'Áo Thun Open Source Linux Tux', type: 'tee', color: '#334155', collarColor: '#e2e8f0', desc: 'Biểu tượng tinh thần mã nguồn mở cộng đồng dev' },

    // 3. Thể Thao & Năng Động (Sports Complex)
    { id: 'jersey_football', name: 'Áo Bóng Đá FPTU Sân Cỏ Số 10', type: 'jersey', color: '#16a34a', collarColor: '#ffffff', desc: 'Trang phục tiền đạo sân cỏ nhân tạo FUDA' },
    { id: 'jersey_basketball', name: 'Áo Bóng Rổ Ba Lỗ Bulls Đỏ', type: 'jersey', color: '#b91c1c', collarColor: '#000000', desc: 'Trang phục ném bóng rổ 3 điểm siêu cháy' },
    { id: 'gym_croptop', name: 'Đồ Thể Thao Nữ Crop-top Gym & Dance', type: 'croptop', color: '#ec4899', collarColor: '#1e293b', desc: 'Năng động, quyến rũ cho các buổi tập nhảy & gym' },
    { id: 'vovinam_suit', name: 'Võ Phục Vovinam FPTU Đai Vàng', type: 'martial', color: '#0284c7', collarColor: '#eab308', desc: 'Võ phục truyền thống rèn luyện thể chất FPTU' },
    { id: 'swimsuit_sport', name: 'Đồ Bơi Thể Thao Nữ Beach Surf', type: 'croptop', color: '#06b6d4', collarColor: '#0891b2', desc: 'Trang phục bơi lội mát mẻ tại hồ bơi FUDA' },

    // 4. Streetwear & Thời Trang Xu Hướng
    { id: 'leather_biker', name: 'Áo Khoác Da Biker Rocker Đen', type: 'biker', color: '#18181b', collarColor: '#94a3b8', desc: 'Phong cách cá tính, bụi bặm của dân phượt' },
    { id: 'oversize_hiphop', name: 'Áo Thun Oversize Streetwear Hip-Hop', type: 'tee', color: '#6366f1', collarColor: '#ffffff', desc: 'Thời trang đường phố thụng rộng chất chơi' },
    { id: 'cardigan_autumn', name: 'Áo Len Cardigan Mùa Thu Pastel', type: 'cardigan', color: '#d97706', collarColor: '#fef3c7', desc: 'Giai điệu ấm áp cho những ngày se lạnh' },
    { id: 'denim_overall', name: 'Váy Yếm Denim Jean Nữ Sinh', type: 'dress', color: '#2563eb', collarColor: '#f8fafc', desc: 'Phong cách Y2K denim năng động, đáng yêu' },
    { id: 'windbreaker_retro', name: 'Áo Khoác Gió Retro 90s Block', type: 'bomber', color: '#059669', collarColor: '#f59e0b', desc: 'Thời trang thể thao retro thập niên 90s' },
    { id: 'trench_coat', name: 'Áo Măng Tô Dạ Dáng Dài Quý Phái', type: 'cardigan', color: '#78350f', collarColor: '#451a03', desc: 'Phong cách quý phái chuẩn thanh lịch mùa đông' },

    // 5. Công Sở & Nghề Nghiệp (Career & Barista)
    { id: 'barista_apron', name: 'Tạp Dề Barista Cà Phê Muối Nâu', type: 'barista', color: '#854d0e', collarColor: '#fef08a', desc: 'Trang phục chuyên gia pha chế quán quen FUDA' },
    { id: 'suit_ceo', name: 'Bộ Vest Công Sở Tech CEO Lịch Lãm', type: 'suit', color: '#1e293b', collarColor: '#ffffff', desc: 'Bộ vest quyền lực của nhà sáng lập Startup' },
    { id: 'blazer_female', name: 'Bộ Suit Nữ Blazer Công Sở Hiện Đại', type: 'suit', color: '#475569', collarColor: '#f472b6', desc: 'Thanh lịch, tự tin cho các nữ lập trình viên' },
    { id: 'lab_coat', name: 'Áo Blouse Trắng Bác Sĩ & Lab Tech', type: 'suit', color: '#f8fafc', collarColor: '#0284c7', desc: 'Trang phục nghiên cứu khoa học phòng Tech Lab' },

    // 6. Cosplay & Lễ Hội (Anime / Fantasy)
    { id: 'wizard_robe', name: 'Áo Choàng Pháp Sư Huyền Bí', type: 'wizard', color: '#4c1d95', collarColor: '#fbbf24', desc: 'Phù thủy công nghệ triệu hồi mã code kỳ diệu' },
    { id: 'yukata_sakura', name: 'Kimono Yukata Hoa Anh Đào', type: 'yukata', color: '#f472b6', collarColor: '#dc2626', desc: 'Trang phục lễ hội truyền thống xứ sở hoa anh đào' },
    { id: 'princess_gown', name: 'Đầm Công Chúa Dạ Hội Dạ Quang', type: 'dress', color: '#a855f7', collarColor: '#fdf4ff', desc: 'Lộng lẫy và tỏa sáng trong đêm tiệc Gala Prom' },
    { id: 'frog_mascot', name: 'Bộ Đồ Cóc Vàng Mascot FUDA', type: 'frog', color: '#eab308', collarColor: '#15803d', desc: 'Linh vật Cóc Vàng mang lại may mắn và điểm A+' }
  ],

  get hoodies() {
    return this.outfits;
  },

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


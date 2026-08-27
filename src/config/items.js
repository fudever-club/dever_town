/**
 * Danh mục 7 Vật phẩm chuẩn nhận diện FPT University Đà Nẵng & Lập trình viên FU-DEVER
 */
export const ITEMS_DATABASE = {
  macbook_dev: {
    id: 'macbook_dev',
    name: 'MacBook Pro Dev FPTU',
    icon: '💻',
    rarity: 'legendary',
    tag: 'Thiết Bị Coder',
    desc: 'Laptop chuyên dụng của Coder FPTU Đà Nẵng, cài sẵn Linux, Docker, Node.js và VS Code.',
    accentColor: '#38bdf8'
  },
  keychron_kb: {
    id: 'keychron_kb',
    name: 'Bàn phím cơ Keychron Custom',
    icon: '⌨️',
    rarity: 'epic',
    tag: 'Gaming & Dev',
    desc: 'Bàn phím cơ Switch Gateron Pro, âm thanh gõ lách cách tạo cảm hứng lập trình xuyên đêm.',
    accentColor: '#c084fc'
  },
  gaming_mouse: {
    id: 'gaming_mouse',
    name: 'Chuột Gaming Công Thái Học',
    icon: '🖱️',
    rarity: 'rare',
    tag: 'Gaming & Dev',
    desc: 'Chuột siêu nhẹ chuẩn công thái học, hỗ trợ thao tác kéo thả và fix bug tốc độ cao.',
    accentColor: '#34d399'
  },
  golden_frog_plush: {
    id: 'golden_frog_plush',
    name: 'Gấu bông Cóc Vàng FPTU May Mắn',
    icon: '🐸',
    rarity: 'mythic',
    tag: 'Linh Vật FPTU',
    desc: 'Gấu bông Linh vật Cóc Vàng Thiềm Thừ FPTU, mang lại may mắn 100% qua mọi kỳ thi Pass PE.',
    accentColor: '#fbbf24'
  },
  fptu_keychain: {
    id: 'fptu_keychain',
    name: 'Móc khóa Thẻ Sinh Viên FPTU',
    icon: '🔑',
    rarity: 'common',
    tag: 'Phụ Kiện Sinh Viên',
    desc: 'Dây đeo thẻ sinh viên FPT University Da Nang màu cam FPT nổi bật.',
    accentColor: '#f26f21'
  },
  thermos_coffee: {
    id: 'thermos_coffee',
    name: 'Cốc Cà Phê Dev Giữ Nhiệt',
    icon: '☕',
    rarity: 'uncommon',
    tag: 'Đồ Uống Coder',
    desc: 'Cốc giữ nhiệt 24h chứa đầy cà phê nguyên chất, xua tan cơn buồn ngủ khi chạy deadline.',
    accentColor: '#f59e0b'
  },
  hackathon_trophy: {
    id: 'hackathon_trophy',
    name: 'Cúp Vô Địch Hackathon Mini',
    icon: '🏆',
    rarity: 'legendary',
    tag: 'Cúp Vinh Danh',
    desc: 'Cúp vàng vinh danh các chiến thần lập trình DEVER xuất sắc đoạt ngôi vô địch.',
    accentColor: '#eab308'
  }
};

/**
 * Danh sách vị trí xuất hiện vật phẩm (Pickup Spots) trên 7 bản đồ
 */
export const PICKUP_SPOTS = [
  // Sảnh chính
  { roomId: 'main_hall', tileX: 2, tileY: 13, itemId: 'fptu_keychain', respawnTime: 60 },
  { roomId: 'main_hall', tileX: 22, tileY: 13, itemId: 'golden_frog_plush', respawnTime: 120 },

  // Tech Lab
  { roomId: 'dever_lab', tileX: 6, tileY: 4, itemId: 'macbook_dev', respawnTime: 180 },
  { roomId: 'dever_lab', tileX: 18, tileY: 4, itemId: 'keychron_kb', respawnTime: 180 },

  // Thư viện
  { roomId: 'library_lounge', tileX: 16, tileY: 1, itemId: 'thermos_coffee', respawnTime: 60 },
  { roomId: 'library_lounge', tileX: 6, tileY: 11, itemId: 'gaming_mouse', respawnTime: 120 },

  // Phòng Kỷ niệm
  { roomId: 'memory_room', tileX: 10, tileY: 5, itemId: 'hackathon_trophy', respawnTime: 300 },

  // Khu Thể thao
  { roomId: 'sports_complex', tileX: 4, tileY: 10, itemId: 'thermos_coffee', respawnTime: 60 },
  { roomId: 'sports_complex', tileX: 21, tileY: 15, itemId: 'fptu_keychain', respawnTime: 60 }
];

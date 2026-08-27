/**
 * Danh mục 7 Vật phẩm chuẩn nhận diện FUDA & Lập trình viên FU-DEVER
 */
export const ITEMS_DATABASE = {
  macbook_dev: {
    id: 'macbook_dev',
    name: 'MacBook Pro Dev FUDA',
    icon: '💻',
    rarity: 'legendary',
    tag: 'Thiết Bị Coder',
    desc: 'Laptop chuyên dụng của Coder FUDA, cài sẵn Linux, Docker, Node.js và VS Code.',
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
    name: 'Gấu bông Cóc Vàng FUDA May Mắn',
    icon: '🐸',
    rarity: 'mythic',
    tag: 'Linh Vật FUDA',
    desc: 'Gấu bông Linh vật Cóc Vàng Thiềm Thừ FUDA, mang lại may mắn 100% qua mọi kỳ thi Pass PE.',
    accentColor: '#fbbf24'
  },
  fptu_keychain: {
    id: 'fptu_keychain',
    name: 'Móc khóa Thẻ Sinh Viên FUDA',
    icon: '🔑',
    rarity: 'common',
    tag: 'Phụ Kiện Sinh Viên',
    desc: 'Dây đeo thẻ sinh viên FUDA màu cam FPT nổi bật.',
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
    rarity: 'mythic',
    tag: 'Vinh Danh Coder',
    desc: 'Biểu tượng chiến thắng danh giá tại cuộc thi Hackathon FU-DEVER & FUDA.',
    accentColor: '#eab308'
  }
};

/**
 * Danh sách các điểm nhặt vật phẩm phân bố trên 7 bản đồ
 */
export const PICKUP_SPOTS = [
  { id: 'spot_macbook', itemId: 'macbook_dev', roomId: 'dever_lab', tileX: 4, tileY: 4 },
  { id: 'spot_keychron', itemId: 'keychron_kb', roomId: 'dever_lab', tileX: 20, tileY: 4 },
  { id: 'spot_mouse', itemId: 'gaming_mouse', roomId: 'web_room', tileX: 4, tileY: 4 },
  { id: 'spot_frog', itemId: 'golden_frog_plush', roomId: 'main_hall', tileX: 11, tileY: 5 },
  { id: 'spot_keychain', itemId: 'fptu_keychain', roomId: 'library_lounge', tileX: 2, tileY: 4 },
  { id: 'spot_coffee', itemId: 'thermos_coffee', roomId: 'library_lounge', tileX: 16, tileY: 3 },
  { id: 'spot_trophy', itemId: 'hackathon_trophy', roomId: 'memory_room', tileX: 10, tileY: 2 }
];

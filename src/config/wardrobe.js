/**
 * Cấu hình Tủ đồ & Tùy chỉnh nhân vật nâng cao FUDA & FU-DEVER (Wardrobe Customizer)
 */
export const WARDROBE_CONFIG = {
  genders: [
    { id: 'male', name: 'Nam Sinh FUDA', icon: 'M' },
    { id: 'female', name: 'Nữ Sinh FUDA', icon: 'F' }
  ],

  outfits: [
    { id: 'hoodie_fuda', name: 'Áo Hoodie FUDA Cam', type: 'hoodie', color: '#f26f21', desc: 'Màu cam nhiệt huyết biểu tượng trường FUDA' },
    { id: 'hoodie_dever', name: 'Áo Hoodie Xanh FU-DEVER', type: 'hoodie', color: '#0066CC', desc: 'Màu xanh công nghệ của CLB FU-DEVER' },
    { id: 'polo_fuda', name: 'Áo Polo Đồng Phục FUDA', type: 'polo', color: '#ea580c', collarColor: '#002147', desc: 'Đồng phục chính khóa sinh viên FUDA' },
    { id: 'tee_dev_black', name: 'Áo Thun Dev FU-DEVER', type: 'tee', color: '#0f172a', desc: 'Áo thun lập trình viên hackathon năng động' },
    { id: 'bomber_cyber', name: 'Áo Khoác Cyber Bomber', type: 'bomber', color: '#7e22ce', desc: 'Phong cách Cyberpunk tương lai chất lừ' },
    { id: 'dress_fuda', name: 'Đầm / Chân Váy FUDA', type: 'dress', color: '#38bdf8', desc: 'Trang phục nữ sinh FUDA thanh lịch, trẻ trung' },
    { id: 'jersey_sports', name: 'Áo Thể Thao Số 10', type: 'jersey', color: '#16a34a', desc: 'Trang phục thi đấu thể thao tại Khu Thể Thao FUDA' }
  ],

  get hoodies() {
    return this.outfits;
  },

  hairstyles: [
    { id: 'short', name: 'Tóc Ngắn Thể Thao' },
    { id: 'parted', name: 'Tóc Mái Lãng Tử' },
    { id: 'long', name: 'Tóc Dài Nữ Sinh' },
    { id: 'ponytail', name: 'Tóc Đuôi Ngựa' },
    { id: 'bob', name: 'Tóc Bob Cá Tính' }
  ],

  hairColors: [
    { id: 'black', name: 'Đen Tuyền', color: '#0f172a' },
    { id: 'brown', name: 'Nâu Hạt Dẻ', color: '#78350f' },
    { id: 'gold', name: 'Vàng Cát', color: '#f59e0b' },
    { id: 'silver', name: 'Bạch Kim', color: '#e2e8f0' },
    { id: 'ruby', name: 'Đỏ Gamer', color: '#ef4444' },
    { id: 'pink', name: 'Hồng Pastel', color: '#f472b6' },
    { id: 'cyber', name: 'Xanh Cyber', color: '#06b6d4' }
  ],

  accessories: [
    { id: 'none', name: 'Không phụ kiện', icon: '✕', desc: 'Phong cách tối giản' },
    { id: 'glasses_smart', name: 'Kính Cận Dev FUDA', icon: '⚯', desc: 'Tăng 50% độ thông minh khi gõ code' },
    { id: 'sunglasses_cool', name: 'Kính Râm Cool Ngầu', icon: '🕶', desc: 'Phong cách ngầu đét khi debug' },
    { id: 'headphones_rgb', name: 'Tai Nghe Gaming RGB', icon: '🎧', desc: 'Cách ly 100% tiếng ồn xung quanh' },
    { id: 'ribbon_cute', name: 'Nơ / Băng Đô Nữ Xinh', icon: '🎀', desc: 'Phụ kiện dễ thương cho nữ sinh' },
    { id: 'frog_crown', name: 'Vương Miện Cóc Vàng', icon: '👑', desc: 'Vinh quang Cóc Vàng may mắn FUDA' },
    { id: 'mask_cyber', name: 'Khẩu Trang Hacker', icon: '😷', desc: 'Ẩn danh bí mật trong không gian số' }
  ]
};

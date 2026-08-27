/**
 * Cấu hình toàn bộ Interactive Presets cho DEVER TOWN
 * Tích hợp dữ liệu chính thức từ FU-DEVER (FUDA)
 */
export const INTERACTION_PRESETS = {
  // 1. Màn chiếu Slide / Bảng vẽ Excalidraw
  whiteboard_slides: {
    title: 'Màn Chiếu & Slide Thuyết Trình FU-DEVER',
    description: 'Tài liệu đào tạo, slide bài giảng công nghệ và sơ đồ kiến trúc hệ thống CLB.',
    defaultUrl: 'https://docs.google.com/presentation/d/e/2PACX-1vRe10Qn1JbT0t1U5jXw7qYm8K4Zz2/embed?start=false&loop=false&delayms=3000',
    excalidrawUrl: 'https://excalidraw.com'
  },

  // 2. Sân khấu họp nhóm Video Call
  meeting_stage: {
    title: 'Phòng Họp Trực Tuyến & Sân Khấu FU-DEVER',
    description: 'Không gian họp video trực tiếp cho thành viên CLB (Jitsi Meet / Google Meet).',
    getJitsiUrl: (roomName) => `https://meet.jit.si/FU_DEVER_${encodeURIComponent(roomName || 'Alpha')}`
  },

  // 3. Bàn Lập Trình & Sổ tay Markdown
  code_editor: {
    title: 'Bàn Lập Trình Live Code & Sổ Tay Sinh Viên FUDA',
    description: 'Thực thi mã nguồn JavaScript trực tiếp và lưu trữ ghi chú cá nhân.',
    defaultCode: `// 🚀 Chào mừng bạn đến với FU-DEVER Code Sandbox!\n// Slogan: WORK HARD - PLAY HARD\n\nconst club = {\n  name: 'FU-DEVER',\n  campus: 'FUDA',\n  pillars: ['2D Game', 'Web App', 'Mobile App', 'Model AI'],\n  members: '50+ Members',\n  years: '9+ Years of Passion'\n};\n\nconsole.log("=== THÔNG TIN CLB FU-DEVER ===");\nconsole.log("Tên CLB:", club.name);\nconsole.log("Cơ sở:", club.campus);\nconsole.log("Các mảng chuyên môn:", club.pillars.join(", "));\nconsole.log("Đam mê kiến tạo tương lai!");`,
    defaultNotes: `# 📝 SỔ TAY HỌC TẬP FU-DEVER\n\n- **CLB:** FU-DEVER - FUDA\n- **Slogan:** WORK HARD - PLAY HARD\n- **Địa chỉ:** Khu đô thị FPT City, Ngũ Hành Sơn, Đà Nẵng\n- **Hotline:** +84 828 828 497\n- **Email:** club.dever@gmail.com\n\n## Mục tiêu tuần này:\n1. Hoàn thiện đồ họa 2D Pixel Town.\n2. Thực hành WebSockets & Phaser 3 Game Engine.\n3. Chuẩn bị sự kiện Tech Talk & Workshop sắp tới.`
  },

  // 4. Quầy Cà phê Lofi & Pomodoro Timer
  coffee_lofi: {
    title: 'Quầy Cà Phê Chill Radio & Pomodoro FU-DEVER',
    description: 'Không gian âm nhạc lofi thư giãn và bộ đếm thời gian tập trung 25/5 phút.',
    getEmbedUrl: (videoId) => `https://www.youtube.com/embed/${videoId || 'jfKfPfyJRdk'}?autoplay=1&mute=0&controls=1`
  },

  // 5. Phòng Triển Lãm Kỷ Niệm (Gallery)
  gallery_memory: {
    title: 'Phòng Triển Lãm Kỷ Niệm & Bảng Vàng FU-DEVER',
    description: 'Lưu trữ hành trình 9+ năm hoạt động, 20+ giải thưởng và các cột mốc lịch sử.',
    memories: [
      {
        id: 'founding',
        title: 'Hành Trình 9+ Năm Phát Triển FU-DEVER',
        date: 'Từ Năm 2017 - Nay',
        tag: 'Cột mốc lịch sử',
        accentColor: '#0066CC',
        story: 'Khởi đầu từ một nhóm sinh viên đam mê lập trình tại FUDA, FU-DEVER đã vươn mình trở thành câu lạc bộ học thuật công nghệ hàng đầu với hơn 50+ thành viên năng động, 15+ dự án thực chiến và 20+ giải thưởng danh giá.'
      },
      {
        id: 'hackathon',
        title: '20+ Giải Thưởng ICPC & Hackathon Toàn Quốc',
        date: '2020 - 2026',
        tag: 'Bảng vàng vinh danh',
        accentColor: '#f26f21',
        story: 'Các thế hệ thành viên FU-DEVER liên tục ghi danh tại các kỳ thi Lập trình sinh viên Quốc tế ICPC, FPT Edu Hackathon, FPT Edu ResFes với những giải pháp công nghệ xuất sắc về AI, Web3 và Hệ thống phân tán.'
      },
      {
        id: 'teambuilding',
        title: 'Work Hard - Play Hard: Teambuilding Gắn Kết',
        date: 'Hàng Năm',
        tag: 'Văn hóa CLB',
        accentColor: '#10b981',
        story: 'Bên cạnh những giờ code căng thẳng, FU-DEVER luôn duy trì tinh thần Work Hard - Play Hard với các chuyến dã ngoại Sơn Trà, cắm trại biển Đà Nẵng và các buổi sinh hoạt giao lưu gắn kết các thế hệ.'
      },
      {
        id: 'workshop',
        title: 'Chuỗi Workshop Tech Talk: 2D Game, Web App & AI',
        date: 'Định kỳ hàng tháng',
        tag: 'Học thuật & Đào tạo',
        accentColor: '#8b5cf6',
        story: 'Tổ chức các buổi chia sẻ chuyên sâu về 4 trụ cột công nghệ: 2D Game Engine (Phaser), Web/Mobile Application (Next.js, Flutter) và Mô hình Trí tuệ Nhân tạo (Machine Learning/LLMs) cho sinh viên toàn trường.'
      }
    ]
  },

  // 6. Không Gian Website Showroom (Landing Page & Portals)
  club_website: {
    title: 'Showroom Cổng Thông Tin & Website Chính Thức FU-DEVER',
    description: 'Khám phá Landing Page, Member Portal, Admin Portal và Kho dự án của CLB.',
    defaultUrl: 'https://fu-dever-landingpage-v2.vercel.app/',
    portals: [
      { name: '🌐 Landing Page Chính Thức', url: 'https://fu-dever-landingpage-v2.vercel.app/' },
      { name: '📝 Đơn Đăng Ký Thành Viên', url: 'https://forms.gle/2us1yB5Qp2HYejj28' },
      { name: '📘 Fanpage FU-DEVER', url: 'https://www.facebook.com/FPTUDever' },
      { name: '🏛️ Fanpage FUDA', url: 'https://www.facebook.com/daihocfptdanang' },
      { name: '🎵 TikTok FUDA', url: 'https://www.tiktok.com/@daihocfptdanang' },
      { name: '🐙 GitHub FU-DEVER', url: 'https://github.com/fudever-club' },
      { name: '👤 Member Portal', url: 'https://dever-client-sigma.vercel.app' },
      { name: '🛡️ Admin Portal', url: 'https://dever-admin-three.vercel.app' }
    ]
  }
};

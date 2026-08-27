/**
 * Cấu hình toàn bộ Interactive Presets cho DEVER TOWN
 * Tích hợp dữ liệu chính thức từ FU-DEVER & FPT University Đà Nẵng
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
  },

  // 7. CỔNG TIỆN ÍCH HỌC VỤ & KHO PHẦN MỀM THI (FPTU Đà Nẵng)
  fptu_student_portal: {
    title: 'Cổng Tiện Ích Sinh Viên FPTU & Kho Phần Mềm Thi',
    description: 'Truy cập nhanh các trang web chính thống của trường và tải phần mềm thi Progress Test, Final Exam & Practical Exam.',
    systems: [
      {
        id: 'fap',
        name: '🌐 FAP Portal',
        desc: 'Cổng thông tin sinh viên, thời khóa biểu, bảng điểm & học vụ',
        url: 'https://fap.fpt.edu.vn/',
        badge: 'Cổng chính',
        color: '#f26f21'
      },
      {
        id: 'flm',
        name: '📖 FLM Portal',
        desc: 'Tra cứu Syllabus, đề cương chi tiết & tài liệu học phần',
        url: 'https://flm.fpt.edu.vn/',
        badge: 'Học tập',
        color: '#0284c7'
      },
      {
        id: 'lms',
        name: '🎓 LMS Đà Nẵng',
        desc: 'Hệ thống nộp bài tập, tài liệu bài giảng & kiểm tra online',
        url: 'https://lmsdn.fpt.edu.vn/',
        badge: 'Khóa học',
        color: '#10b981'
      },
      {
        id: 'reset_pass',
        name: '🔑 Đổi Mật Khẩu WiFi & EOS',
        desc: 'Trang đổi mật khẩu mạng WiFi trường và mật khẩu phòng thi EOS',
        url: 'https://resetdn.fpt.edu.vn/',
        badge: 'Bảo mật',
        color: '#eab308'
      },
      {
        id: 'it_helpdesk',
        name: '🛠️ Hướng Dẫn & Hỗ Trợ IT',
        desc: 'Trang hỗ trợ kỹ thuật, xử lý sự cố máy tính và mạng trường',
        url: 'https://lmsdn.fpt.edu.vn/hd/',
        badge: 'IT Support',
        color: '#8b5cf6'
      },
      {
        id: 'e360',
        name: '✅ E360 Portal',
        desc: 'Trang web checkout & khảo sát chất lượng sau khi hoàn thành bài thi',
        url: 'https://e360.fpt.edu.vn/',
        badge: 'Khảo sát',
        color: '#ec4899'
      }
    ],
    examApps: [
      {
        id: 'seb',
        name: '📥 Safe Exam Browser (SEB)',
        purpose: 'Phần mềm thi Progress Test (Điểm thành phần các môn)',
        url: 'https://drive.google.com/drive/u/0/folders/1RmjeKAvef6BXg_qlAl6JnZx2ZkY3qj_3',
        tag: 'Thi Progress Test',
        guide: 'Tải bộ cài SEB và file cấu hình (.seb) của môn thi trước giờ thi 15 phút.'
      },
      {
        id: 'eos',
        name: '📥 EOS Client (Exam on Online Server)',
        purpose: 'Phần mềm thi Final Exam (Cuối môn)',
        url: 'https://lmsdn.fpt.edu.vn/hd/eos/',
        tag: 'Thi Final Exam',
        guide: 'Lấy mật khẩu EOS tại resetdn.fpt.edu.vn để đăng nhập phòng thi Final.'
      },
      {
        id: 'pea',
        name: '📥 PEA Client (Practical Exam App)',
        purpose: 'Phần mềm thi Practical Exam (Thực hành Code)',
        url: 'https://lmsdn.fpt.edu.vn/hd/pea/',
        tag: 'Thi Thực Hành PE',
        guide: 'Dùng nộp bài thi thực hành lập trình các môn C, Java, Web, Database, SWE...'
      }
    ]
  },

  // 8. THỰC ĐƠN CĂN TIN FPTU THỰC TẾ (3 MENU HÌNH ẢNH)
  canteen_menus: {
    title: 'Thực Đơn Căn Tin Trường Đại Học FPT Đà Nẵng',
    description: 'Thực đơn món ăn sáng, trưa, tối và cơm phần sinh viên tại Căn tin FUDA.',
    tabs: [
      {
        id: 'huong_vi_viet',
        name: '🍱 Căn Tin Hương Vị Việt (Tầng 1)',
        image: '/assets/canteen/canteen_menu1.jpg',
        desc: 'Thực đơn tuần từ Thứ 2 đến Thứ 6',
        highlights: [
          '☀️ Bữa Sáng: Bún chả cá, bún thịt nướng, cao lầu, mì quảng, xôi gà, bánh bột lọc, bánh mì, hotdog...',
          '🍚 Bữa Trưa: Cá mực chiên mắm, sườn non rim me, cánh gà chiên mắm, cơm gà rôti, cơm cuộn kimbap, canh bí đao...',
          '🌙 Bữa Tối: Bánh mì que, mì tôm các loại, cơm cuộn kimbap...'
        ]
      },
      {
        id: 'high_deli',
        name: '🍜 The High Deli (Tầng 2)',
        image: '/assets/canteen/canteen_menu2.jpg',
        desc: 'Thực đơn món nước & cơm phần tầng 2',
        highlights: [
          '☀️ Bữa Sáng: Mì xào xá xíu, phở bò, phở gà, mì quảng tôm thịt, bún bò, mì Ý...',
          '🍚 Bữa Trưa: Gà sốt bơ tỏi, thịt kho tôm, tôm chiên xù, xíu mại viên, sườn nướng, khổ qua xào trứng...',
          '🌙 Bữa Tối: Sườn hầm, đùi gà chiên xù, bánh tôm, mì xào thịt, canh cải ngọt...'
        ]
      },
      {
        id: 'fc_canteen',
        name: '🍛 F.C Canteen (Tầng 2)',
        image: '/assets/canteen/canteen_menu3.jpg',
        desc: 'Thực đơn cơm trưa & bún phở sinh viên',
        highlights: [
          '☀️ Bữa Sáng: Bún bò, phở bò, phở gà, mì xá xíu, mì Ý, bánh canh...',
          '🍚 Bữa Trưa: Đùi gà sốt cay, cánh gà chiên mắm, đùi gà chiên xù, sườn non rim, cá rim ngọt, đậu khuôn sốt cà...'
        ]
      }
    ]
  },

  // 9. SƠ ĐỒ BẢN ĐỒ CAMPUS ĐẠI HỌC FPT ĐÀ NẴNG
  campus_map: {
    title: 'Sơ Đồ Bản Đồ Đại Học FPT Đà Nẵng (FUDA Campus)',
    description: 'Khu đô thị công nghệ FPT, phường Hòa Hải, quận Ngũ Hành Sơn, Đà Nẵng',
    mapImage: '/assets/campus/fuda_map.webp',
    campusImage: '/assets/campus/fuda_mau.webp',
    locations: [
      { num: 1, name: 'Tòa Alpha', desc: 'Tòa nhà biểu tượng chính, hội trường trung tâm, phòng học & sảnh chính' },
      { num: 2, name: 'Tòa Gamma', desc: 'Khu nghiên cứu công nghệ, phòng Lab AI/Game và văn phòng' },
      { num: 3, name: 'Tòa Beta', desc: 'Thư viện trường, khu tự học và giảng đường' },
      { num: 4, name: 'KTX Dorm A', desc: 'Ký túc xá sinh viên khối A' },
      { num: 5, name: 'KTX Dorm B', desc: 'Ký túc xá sinh viên khối B' },
      { num: 6, name: 'Nhà Võ Vovinam', desc: 'Võ đường Vovinam Việt Võ Đạo trường FPT' },
      { num: 7, name: 'Nhà Giữ Xe', desc: 'Khu vực gửi xe sinh viên và cán bộ' },
      { num: 8, name: 'Căn Tin FUDA', desc: 'Khu ăn uống Tầng 1 Hương Vị Việt & Tầng 2 The High Deli / F.C Canteen' },
      { num: 9, name: 'Sân Bóng Đá & Thể Thao', desc: 'Sân bóng đá cỏ nhân tạo, bóng rổ, hồ bơi' }
    ]
  },

  // 10. QUY CHẾ HOẠT ĐỘNG CLB & CẨM NANG PE SWE201c
  dever_charter: {
    title: 'Quy Chế Tổ Chức & Hoạt Động CLB FU-DEVER',
    description: 'Quy định chính thức về sứ mệnh, cơ cấu 4 ban, quyền lợi và nghĩa vụ thành viên.',
    mission: 'Tạo lập môi trường học tập, nghiên cứu và phát triển sản phẩm công nghệ thực chiến cho sinh viên Đại học FPT Đà Nẵng.',
    vision: 'Trở thành Câu lạc bộ lập trình uy tín hàng đầu, ươm mầm các thế hệ Kỹ sư Phần mềm xuất sắc.',
    fee: '50.000 VNĐ / Kỳ',
    roles: [
      { title: 'Chủ Nhiệm CLB', desc: 'Lập kế hoạch tổng thể, điều hành các cuộc họp, đại diện chính thức của CLB.' },
      { title: 'Phó Chủ Nhiệm CLB', desc: 'Hỗ trợ quản lý và đảm bảo hoạt động diễn ra theo kế hoạch.' },
      { title: 'Thư Ký & Thủ Quỹ', desc: 'Quản lý tài liệu và thu giữ quỹ hoạt động CLB.' },
      { title: 'Trưởng Ban Học Thuật', desc: 'Chịu trách nhiệm mảng chuyên môn, tổ chức workshop, đào tạo 4 trụ cột công nghệ.' },
      { title: 'Trưởng Ban Sự Kiện', desc: 'Tổ chức các sự kiện văn hóa, teambuilding, hậu cần.' },
      { title: 'Trưởng Ban Truyền Thông', desc: 'Xây dựng chiến lược truyền thông, quản lý Fanpage, Website & TikTok.' }
    ]
  },

  swe201c_guide: {
    title: 'Siêu Cẩm Nang Ôn Thi PE Môn SWE201c v2.0 (FU-DEVER)',
    description: 'Bộ tài liệu cứu cánh PE kỳ 4: Template 100% tiếng Anh, ví dụ nghiệp vụ thực tế & chiến thuật bao đậu.',
    authors: 'Đặng Quang Nhật & Lê Hồ Anh Duy',
    topics: [
      { name: '1. Software Development Lifecycle (SDLC)', desc: 'Waterfall, Agile, Scrum, Kanban & V-Model so sánh ưu nhược điểm chi tiết.' },
      { name: '2. Requirements Engineering (SRS)', desc: 'Functional & Non-functional Requirements, Use Case Specification chuẩn Quốc tế.' },
      { name: '3. UML Diagrams (Use Case, Class, Sequence)', desc: 'Quy chuẩn vẽ biểu đồ Class, Sequence Diagram theo nghiệp vụ đề thi EOS.' },
      { name: '4. Software Architecture & Design Patterns', desc: 'Layered Architecture, MVC Pattern, Factory & Singleton Pattern.' },
      { name: '5. Software Testing & QA Strategy', desc: 'Unit Test, Integration Test, Black-box & White-box Test Case Matrix.' }
    ]
  }
};

/**
 * Danh sách Slide & Tài liệu Đề xuất Chuyên Biệt cho Từng Phòng & Căn Tin
 */
export const ROOM_SLIDE_PRESETS = [
  {
    id: 'main_intro',
    room: 'main_hall',
    roomName: 'Tòa Alpha',
    title: '🌟 Giới Thiệu Tổng Quan FU-DEVER & FUDA',
    desc: 'Lịch sử 2017, Sứ mệnh "Code your dream", 4 Trụ cột chuyên môn & Cơ cấu 4 ban',
    url: 'https://docs.google.com/presentation/d/e/2PACX-1vRe10Qn1JbT0t1U5jXw7qYm8K4Zz2/embed?start=false&loop=false&delayms=3000'
  },
  {
    id: 'main_handbook',
    room: 'main_hall',
    roomName: 'Tòa Alpha',
    title: '📖 Sổ Tay Sinh Viên & Cẩm Nang Tân Binh FUDA',
    desc: 'Bí kíp sinh tồn đồ án OJT, bản đồ Campus Alpha và các câu lạc bộ học thuật',
    url: 'https://docs.google.com/presentation/d/e/2PACX-1vRe10Qn1JbT0t1U5jXw7qYm8K4Zz2/embed?start=false&loop=false&delayms=3000'
  },
  {
    id: 'lab_roadmap',
    room: 'dever_lab',
    roomName: 'Tòa Gamma',
    title: '💻 Tech Roadmap 2026: Game 2D, Web App & AI Models',
    desc: 'Lộ trình đào tạo lập trình viên: Frontend, Backend, Phaser 3, Next.js và Machine Learning',
    url: 'https://docs.google.com/presentation/d/e/2PACX-1vRe10Qn1JbT0t1U5jXw7qYm8K4Zz2/embed?start=false&loop=false&delayms=3000'
  },
  {
    id: 'lab_git_hackathon',
    room: 'dever_lab',
    roomName: 'Tòa Gamma',
    title: '🚀 Cẩm Nang Thi Đấu Hackathon & Chuẩn Git Flow',
    desc: 'Quy trình chạy deadline 24h, phân chia vai trò nhóm, Pitching và bảo mật mã nguồn',
    url: 'https://docs.google.com/presentation/d/e/2PACX-1vRe10Qn1JbT0t1U5jXw7qYm8K4Zz2/embed?start=false&loop=false&delayms=3000'
  },
  {
    id: 'lib_pe_fe',
    room: 'library_lounge',
    roomName: 'Tòa Beta',
    title: '📚 Tài Liệu Ôn Thi PE & FE: PRF192, PRO192, CSD201',
    desc: 'Bộ đề thi thực hành mẫu môn C/Java/Cấu trúc dữ liệu & giải thuật có đáp án chi tiết',
    url: 'https://docs.google.com/presentation/d/e/2PACX-1vRe10Qn1JbT0t1U5jXw7qYm8K4Zz2/embed?start=false&loop=false&delayms=3000'
  },
  {
    id: 'lib_icpc',
    room: 'library_lounge',
    roomName: 'Tòa Beta',
    title: '🧠 100 Thuật Toán Tuyển Chọn Luyện Thi ICPC Quốc Tế',
    desc: 'Dynamic Programming, Graph Theory, Segment Tree và giải thuật tối ưu hóa',
    url: 'https://docs.google.com/presentation/d/e/2PACX-1vRe10Qn1JbT0t1U5jXw7qYm8K4Zz2/embed?start=false&loop=false&delayms=3000'
  },
  {
    id: 'canteen_menu',
    room: 'canteen_cafe',
    roomName: 'Căn Tin FUDA',
    title: '🍱 Thực Đơn Căn Tin Sinh Viên & Công Thức Cà Phê Muối',
    desc: 'Menu cơm gà 25k, mì tôm đêm Hackathon và bí kíp pha chế Cà phê muối Đà Nẵng béo ngậy',
    url: 'https://docs.google.com/presentation/d/e/2PACX-1vRe10Qn1JbT0t1U5jXw7qYm8K4Zz2/embed?start=false&loop=false&delayms=3000'
  },
  {
    id: 'canteen_nutrition',
    room: 'canteen_cafe',
    roomName: 'Căn Tin FUDA',
    title: '☕ Dinh Dưỡng Giữ Tỉnh Táo & Healthy Coding Life',
    desc: 'Chế độ ăn uống khoa học cho Lập trình viên tránh kiệt sức khi chạy deadline dự án',
    url: 'https://docs.google.com/presentation/d/e/2PACX-1vRe10Qn1JbT0t1U5jXw7qYm8K4Zz2/embed?start=false&loop=false&delayms=3000'
  },
  {
    id: 'memory_awards',
    room: 'memory_room',
    roomName: 'Phòng Kỷ Niệm',
    title: '🏆 Bảng Vàng Vinh Danh 20+ Giải Thưởng ICPC & Hackathon',
    desc: 'Các thế hệ thành viên xuất sắc ghi danh tại ResFes, ICPC Vietnam và FPT Edu Hackathon',
    url: 'https://docs.google.com/presentation/d/e/2PACX-1vRe10Qn1JbT0t1U5jXw7qYm8K4Zz2/embed?start=false&loop=false&delayms=3000'
  },
  {
    id: 'sports_ergonomics',
    room: 'sports_complex',
    roomName: 'Khu Thể Thao',
    title: '⚽ Điều Lệ DEVER Cup & Bài Tập Chống Đau Cổ Vai Gáy',
    desc: 'Hướng dẫn giãn cơ 5 phút mỗi 2 tiếng ngồi code và giải bóng đá giao hữu sinh viên',
    url: 'https://docs.google.com/presentation/d/e/2PACX-1vRe10Qn1JbT0t1U5jXw7qYm8K4Zz2/embed?start=false&loop=false&delayms=3000'
  }
];

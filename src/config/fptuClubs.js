/**
 * Danh mục 25 Câu Lạc Bộ Chính Thức tại Đại học FPT Đà Nẵng
 * Phân bổ tại các tầng Tòa Alpha (DEVER TOWN)
 */
export const FPTU_CLUBS = {
  // --- HỌC THUẬT: CÔNG NGHỆ ---
  itsc: {
    id: 'itsc',
    prefix: 'ITSC',
    nameEn: 'Innovative Technology Student Club',
    nameVi: 'CLB Công nghệ đổi mới',
    group: 'Học thuật',
    subgroup: 'Công nghệ',
    boothNumber: 10,
    floor: 2,
    themeColor: '#38bdf8',
    icon: '💻',
    slogan: 'Innovation Beyond Limits',
    description: 'Nghiên cứu và ứng dụng các công nghệ tiên phong: AI Agents, Cloud Computing, IoT, phát triển giải pháp thực tiễn cho sinh viên và doanh nghiệp.',
    activities: [
      'Workshop chuyên sâu về AI & Điện toán đám mây',
      'Đào tạo GenAI & Hackathon đổi mới sáng tạo',
      'Dự án hợp tác công nghệ liên CLB (ITSC x FU-DEVER)'
    ],
    roles: 'Lập trình viên, Nhà nghiên cứu AI, Quản trị hệ thống Cloud'
  },
  src: {
    id: 'src',
    prefix: 'SRC',
    nameEn: 'Security Research Club',
    nameVi: 'CLB An toàn thông tin',
    group: 'Học thuật',
    subgroup: 'Công nghệ',
    boothNumber: 15,
    floor: 2,
    themeColor: '#ef4444',
    icon: '🛡️',
    slogan: 'Defend & Conquer The Cyberspace',
    description: 'Cái nôi của các Cyber Warriors FPTU Đà Nẵng, chuyên sâu về An toàn thông tin, Capture The Flag (CTF), điều tra số và bảo mật mạng.',
    activities: [
      'Tập luyện và thi đấu các giải CTF trong nước và quốc tế',
      'Nghiên cứu lỗ hổng bảo mật, Pentest và phân tích mã độc',
      'Chia sẻ kiến thức bảo mật số cho cộng đồng sinh viên'
    ],
    roles: 'Pentesters, CTF Players, Security Analysts'
  },
  dever: {
    id: 'dever',
    prefix: 'DEVER',
    nameEn: 'Developer Club',
    nameVi: 'CLB Lập trình FU-DEVER',
    group: 'Học thuật',
    subgroup: 'Công nghệ',
    boothNumber: 5,
    floor: 2,
    themeColor: '#f97316',
    icon: '🚀',
    slogan: 'Code. Ship. Scale.',
    description: 'CLB Kỹ thuật phần mềm hàng đầu FPTU Đà Nẵng với 4 phân ban (Web, AI, Mobile, Game). Xây dựng sản phẩm thực tế, đào tạo mentor 1:1 và tổ chức Hackathon.',
    activities: [
      'Phát triển thế giới ảo DEVER TOWN & các dự án mã nguồn mở',
      'Đào tạo lập trình thực chiến Full-stack, AI, Mobile, Game',
      'Chuỗi sự kiện Hacknight, Tech Workshops & Hackathon'
    ],
    roles: 'Full-Stack Developers, AI Engineers, Game Devs, Designers'
  },

  // --- HỌC THUẬT: KINH TẾ & KHỞI NGHIỆP ---
  resup: {
    id: 'resup',
    prefix: 'RESUP',
    nameEn: 'Research & StartUp',
    nameVi: 'CLB Nghiên cứu và Khởi nghiệp',
    group: 'Học thuật',
    subgroup: 'Kinh tế',
    boothNumber: 24,
    floor: 2,
    themeColor: '#10b981',
    icon: '🌱',
    slogan: 'From Ideas to Reality',
    description: 'Cộng đồng ươm mầm các ý tưởng kinh doanh và nghiên cứu khoa học, kết nối sinh viên đam mê khởi nghiệp với các nhà đầu tư và mentor doanh nghiệp.',
    activities: [
      'Phát triển mô hình kinh doanh Canvas & Pitching thực chiến',
      'Hỗ trợ dự án tham gia các cuộc thi khởi nghiệp sinh viên',
      'Tọa đàm gặp gỡ các Founders & CEOs'
    ],
    roles: 'Project Managers, Business Analysts, Researchers'
  },
  fic: {
    id: 'fic',
    prefix: 'FIC',
    nameEn: 'Financial Investing Club',
    nameVi: 'CLB Tài chính & Đầu tư',
    group: 'Học thuật',
    subgroup: 'Kinh tế',
    boothNumber: 4,
    floor: 2,
    themeColor: '#f59e0b',
    icon: '📈',
    slogan: 'Master Your Financial Future',
    description: 'Nơi quy tụ các tài năng trẻ đam mê thị trường tài chính, chứng khoán, quản trị rủi ro và hoạch định tài chính cá nhân chuyên nghiệp.',
    activities: [
      'Phân tích kỹ thuật & kinh tế vĩ mô',
      'Mô phỏng sàn giao dịch chứng khoán sinh viên',
      'Quản lý danh mục đầu tư và tài chính cá nhân'
    ],
    roles: 'Financial Analysts, Risk Managers, Market Researchers'
  },
  tss: {
    id: 'tss',
    prefix: 'TSS',
    nameEn: 'FU Startup Club',
    nameVi: 'CLB Khởi nghiệp Trẻ FPTU',
    group: 'Học thuật',
    subgroup: 'Kinh tế',
    boothNumber: 13,
    floor: 2,
    themeColor: '#6366f1',
    icon: '💡',
    slogan: 'Ignite The Startup Spark',
    description: 'Môi trường thúc đẩy tinh thần đổi mới sáng tạo, hiện thực hóa các ý tưởng kinh doanh sinh viên thành các startup có giá trị thương mại.',
    activities: [
      'Vườn ươm dự án khởi nghiệp tiềm năng',
      'Networking với hệ sinh thái khởi nghiệp miền Trung',
      'Workshop kỹ năng kêu gọi vốn và xây dựng MVP'
    ],
    roles: 'Co-Founders, Marketers, Product Builders'
  },

  // --- HỌC THUẬT: NGÔN NGỮ & VĂN HÓA ---
  mirai_jc: {
    id: 'mirai_jc',
    prefix: 'MIRAI-JC',
    nameEn: 'Mirai Japanese Club',
    nameVi: 'CLB Ngôn ngữ và Văn hoá Nhật Bản',
    group: 'Học thuật',
    subgroup: 'Ngôn ngữ',
    boothNumber: 16,
    floor: 2,
    themeColor: '#ec4899',
    icon: '🌸',
    slogan: 'Chạm Vào Văn Hóa Xứ Sở Hoa Anh Đào',
    description: 'Giao lưu văn hóa Nhật Bản, rèn luyện tiếng Nhật giao tiếp, cosplay, lễ hội truyền thống và cơ hội làm việc tại các doanh nghiệp Nhật Bản.',
    activities: [
      'Lễ hội văn hóa Nhật Bản (Bunkasai, Tanabata)',
      'Lớp học hội thoại tiếng Nhật từ N5 đến N2',
      'Workshop Trà đạo, Thư pháp & Cosplay'
    ],
    roles: 'Biên dịch viên, MC tiếng Nhật, Ban Sự kiện Văn hóa'
  },
  fkc: {
    id: 'fkc',
    prefix: 'FKC',
    nameEn: 'FPT Korean Club',
    nameVi: 'CLB Tiếng Hàn & Văn Hóa Hàn Quốc',
    group: 'Học thuật',
    subgroup: 'Ngôn ngữ',
    boothNumber: 25,
    floor: 2,
    themeColor: '#06b6d4',
    icon: '🇰🇷',
    slogan: 'K-Wave & Language Passion',
    description: 'Cộng đồng những bạn trẻ đam mê ngôn ngữ, âm nhạc, điện ảnh và văn hóa Hàn Quốc, tạo môi trường học tập và trải nghiệm năng động.',
    activities: [
      'CLB học tiếng Hàn giao tiếp và ôn thi TOPIK',
      'Giao lưu văn hóa K-Pop, ẩm thực Hàn Quốc',
      'Sự kiện trải nghiệm Hanbok và trò chơi truyền thống'
    ],
    roles: 'Giao lưu ngôn ngữ, Biên tập viên nội dung, Điều phối viên'
  },
  fucc: {
    id: 'fucc',
    prefix: 'FUCC',
    nameEn: 'FUDA Chinese Club',
    nameVi: 'CLB Tiếng Trung & Hán Ngữ',
    group: 'Học thuật',
    subgroup: 'Ngôn ngữ',
    boothNumber: 7,
    floor: 2,
    themeColor: '#dc2626',
    icon: '🏮',
    slogan: 'Kết Nối Văn Hóa Phương Đông',
    description: 'Không gian học tập tiếng Trung, giao lưu văn hóa Trung Hoa, luyện thi HSK và tìm hiểu cơ hội du học, việc làm đa quốc gia.',
    activities: [
      'Góc đàm thoại tiếng Trung mỗi tuần',
      'Giao lưu văn hóa Hán tự, Trà nghệ, Lễ hội Trung Thu',
      'Tập huấn phát âm chuẩn và kỹ năng dịch thuật'
    ],
    roles: 'Biên dịch viên, Tác giả content, Điều phối viên văn hóa'
  },

  // --- KỸ NĂNG & SÁNG TẠO ---
  fcs: {
    id: 'fcs',
    prefix: 'FCS',
    nameEn: "FUDA's Creative Space",
    nameVi: 'Không gian Sáng tạo',
    group: 'Kỹ Năng',
    subgroup: 'Thiết kế',
    boothNumber: 20,
    floor: 3,
    themeColor: '#8b5cf6',
    icon: '🎨',
    slogan: 'Unleash Your Creative Power',
    description: 'Ngôi nhà chung của các Designer, Illustrator và người yêu nghệ thuật thị giác tại FPTU Đà Nẵng. Nơi biến trí tưởng tượng thành các ấn phẩm đỉnh cao.',
    activities: [
      'Workshop UI/UX, Graphic Design, 3D Modeling',
      'Triển lãm nghệ thuật số & thiết kế sinh viên',
      'Thiết kế bộ nhận diện sự kiện cho trường'
    ],
    roles: 'Graphic Designers, UI/UX Designers, Illustrators'
  },
  fum: {
    id: 'fum',
    prefix: 'FUM',
    nameEn: 'Media Club',
    nameVi: 'CLB Truyền thông FPTU',
    group: 'Kỹ Năng',
    subgroup: 'Truyền thông',
    boothNumber: 1,
    floor: 3,
    themeColor: '#f43f5e',
    icon: '📸',
    slogan: 'Tell Stories Through The Lens',
    description: 'Đội ngũ phụ trách ghi lại những khoảnh khắc đẹp nhất của sinh viên FPTU, chuyên nghiệp trong nhiếp ảnh, quay dựng video và quản trị kênh truyền thông.',
    activities: [
      'Bắt trọn khoảnh khắc tại mọi sự kiện lớn nhỏ của trường',
      'Sản xuất Video Viral, Phim ngắn sinh viên & Podcast',
      'Đào tạo kỹ năng máy ảnh, ánh sáng và hậu kỳ Premiere/After Effects'
    ],
    roles: 'Photographers, Videographers, Video Editors, Content Creators'
  },
  evo: {
    id: 'evo',
    prefix: 'EVo',
    nameEn: "FUDA's Event Club",
    nameVi: 'CLB Sự kiện FPTU',
    group: 'Kỹ Năng',
    subgroup: 'Sự kiện',
    boothNumber: 23,
    floor: 3,
    themeColor: '#0ea5e9',
    icon: '🎉',
    slogan: 'Mastermind Behind Big Moments',
    description: 'Những con người đứng sau thành công của các đại nhạc hội, ngày hội Club Day, Prom Night và các sự kiện quy mô hàng ngàn sinh viên tại FPTU.',
    activities: [
      'Lên ý tưởng, kịch bản chương trình & sân khấu biểu diễn',
      'Điều phối nhân sự, hậu cần và quản trị rủi ro sự kiện',
      'Tổ chức các hoạt động Teambuilding & Bonding'
    ],
    roles: 'Event Coordinators, Stage Managers, Logistics Leads'
  },

  // --- CỘNG ĐỒNG & ẨM THỰC ---
  f2k: {
    id: 'f2k',
    prefix: 'F2K',
    nameEn: "FPT's Kindness Krew",
    nameVi: 'CLB Thiện nguyện F2K',
    group: 'Cộng đồng',
    subgroup: 'Thiện nguyện',
    boothNumber: 6,
    floor: 3,
    themeColor: '#10b981',
    icon: '🤝',
    slogan: 'Lan Tỏa Yêu Thương - Sẻ Chia Trách Nhiệm',
    description: 'Tổ chức các chiến dịch tình nguyện ý nghĩa, tiếp sức mùa thi, quyên góp sách vở cho trẻ em vùng cao và các hoạt động bảo vệ môi trường.',
    activities: [
      'Chiến dịch Đông Ấm vùng cao & Mùa Hè Xanh',
      'Thăm hỏi mái ấm tình thương và viện dưỡng lão',
      'Các ngày hội đổi rác lấy cây xanh bảo vệ môi trường'
    ],
    roles: 'Điều phối viên tình nguyện, Truyền thông thiện nguyện'
  },
  fenious: {
    id: 'fenious',
    prefix: 'FENIOUS',
    nameEn: 'Cultural Cuisine Club',
    nameVi: 'CLB Văn hoá ẩm thực',
    group: 'Cộng đồng',
    subgroup: 'Ẩm thực',
    boothNumber: 12,
    floor: 3,
    themeColor: '#f97316',
    icon: '🍲',
    slogan: 'Taste The Culture, Feel The Warmth',
    description: 'Nơi gắn kết những tâm hồn yêu ẩm thực, khám phá tinh hoa món ăn truyền thống 3 miền và văn hóa ẩm thực các nước trên thế giới.',
    activities: [
      'Hội thi nấu ăn sinh viên MasterChef FPTU',
      'Trải nghiệm và review ẩm thực đặc sản Đà Nẵng',
      'Giao lưu làm bánh, pha chế thức uống và workshop dinh dưỡng'
    ],
    roles: 'Đầu bếp sinh viên, Reviewer ẩm thực, Hậu cần trải nghiệm'
  },

  // --- NGHỆ THUẬT & ÂM NHẠC ---
  tia: {
    id: 'tia',
    prefix: 'TIA',
    nameEn: 'FPT Traditional Instruments Abide Club',
    nameVi: 'CLB Nhạc cụ dân tộc TIA',
    group: 'Nghệ Thuật',
    subgroup: 'Nhạc cụ',
    boothNumber: 21,
    floor: 3,
    themeColor: '#b45309',
    icon: '🪕',
    slogan: 'Gìn Giữ Hồn Quê - Thăng Hoa Âm Sắc',
    description: 'Tự hào lưu giữ và lan tỏa tình yêu đối với các nhạc cụ truyền thống Việt Nam: Đàn Tranh, Đàn Bầu, Đàn Nhị, Sáo Trúc, T’rưng trong môi trường đại học hiện đại.',
    activities: [
      'Biểu diễn hòa tấu nhạc cụ dân tộc tại các lễ khai giảng, hội nghị',
      'Phối khí kết hợp nhạc cụ dân tộc và phong cách hiện đại (EDM/Pop)',
      'Lớp học đàn tranh, sáo trúc miễn phí cho tân sinh viên'
    ],
    roles: 'Nhạc công, Nghệ sĩ hòa tấu, Biên đạo âm nhạc'
  },
  rhythm: {
    id: 'rhythm',
    prefix: 'RHYTHM',
    nameEn: 'RHYTHM',
    nameVi: 'Xưởng làm nhạc RHYTHM',
    group: 'Nghệ Thuật',
    subgroup: 'Sản xuất âm nhạc',
    boothNumber: 2,
    floor: 3,
    themeColor: '#8b5cf6',
    icon: '🎵',
    slogan: 'Feel The Beat, Create The Hit',
    description: 'Studio âm nhạc của các Producers, Beatmakers, Rapper và Ca sĩ FPTU. Nơi sản xuất các bản thu âm, ca khúc chủ đề và biểu diễn live acoustic.',
    activities: [
      'Sản xuất âm nhạc, thu âm và mix/mastering bài hát',
      'Đêm nhạc Acoustic chillout tại khuôn viên trường',
      'Sáng tác các bài hát chủ đề đại diện cho sinh viên FPTU'
    ],
    roles: 'Music Producers, Vocalists, Rappers, Audio Engineers'
  },
  mic: {
    id: 'mic',
    prefix: 'MIC',
    nameEn: "MIC's Home - FUDA MC Club",
    nameVi: 'CLB Dẫn chương trình & Hùng biện',
    group: 'Nghệ Thuật',
    subgroup: 'MC',
    boothNumber: 17,
    floor: 3,
    themeColor: '#0284c7',
    icon: '🎙️',
    slogan: 'Giọng Nói Kết Nối Triệu Trái Tim',
    description: 'Đào tạo kỹ năng làm chủ sân khấu, dẫn chương trình truyền hình, sự kiện và kỹ năng hùng biện tự tin trước công chúng.',
    activities: [
      'Cầm trịch vị trí MC tại toàn bộ sự kiện chính khóa của trường',
      'Cuộc thi Tìm kiếm tài năng MC & Hùng biện sinh viên',
      'Tập luyện kỹ năng xử lý tình huống và kiểm soát giọng nói'
    ],
    roles: 'Sự kiện MC, Voice Talents, Diễn giả trẻ'
  },
  dfp: {
    id: 'dfp',
    prefix: 'DfP',
    nameEn: 'Dance for Passion',
    nameVi: 'CLB Nhảy DfP',
    group: 'Nghệ Thuật',
    subgroup: 'Nhảy hiện đại',
    boothNumber: 8,
    floor: 3,
    themeColor: '#e11d48',
    icon: '💃',
    slogan: 'Dance Your Heart Out',
    description: 'CLB vũ đạo hàng đầu FPTU Đà Nẵng, quy tụ các vũ công nhiệt huyết với đa dạng thể loại: Hip-hop, Choreography, K-pop Dance Cover, Jazz Funk.',
    activities: [
      'Trình diễn tại các sân khấu đại nhạc hội và ngày hội sinh viên',
      'Thi đấu các giải Dance Battle khu vực miền Trung',
      'Sản xuất các video Dance Showcase chất lượng cao'
    ],
    roles: 'Dancers, Choreographers, Video Planners'
  },
  noise_makers: {
    id: 'noise_makers',
    prefix: 'Noise Makers',
    nameEn: 'Noise Makers',
    nameVi: 'CLB Vũ đạo & Street Dance',
    group: 'Nghệ Thuật',
    subgroup: 'Nhảy đường phố',
    boothNumber: 9,
    floor: 3,
    themeColor: '#a855f7',
    icon: '🕺',
    slogan: 'Make Some Noise, Break The Floor',
    description: 'Đậm chất văn hóa đường phố với Popping, Locking, Breaking và Waacking. Đam mê tự do, bùng nổ năng lượng và tinh thần đoàn kết anh em.',
    activities: [
      'Giao lưu Street Dance Jam và Cypher hàng tuần',
      'Thi đấu vũ đạo đường phố tại các giải quy mô toàn quốc',
      'Workshop kỹ thuật nhảy cơ bản cho người mới bắt đầu'
    ],
    roles: 'B-boys, B-girls, Freestylers, Battle Dancers'
  },

  // --- THỂ THAO (Đại diện gian hàng & Bảng vinh danh) ---
  fufc: {
    id: 'fufc',
    prefix: 'FUFC',
    nameEn: 'FPTU Football Club',
    nameVi: 'CLB Bóng đá FPTU',
    group: 'Thể thao',
    subgroup: 'Bóng',
    boothNumber: 14,
    floor: 3,
    themeColor: '#16a34a',
    icon: '⚽',
    slogan: 'Đam Mê Bất Tận Trên Sân Cỏ',
    description: 'Đội tuyển bóng đá nam và nữ đại diện cho FPTU tại các giải đấu sinh viên toàn thành phố, duy trì tập luyện tại Sân bóng đá cỏ nhân tạo FUDA.',
    activities: [
      'Giải bóng đá FPTU Champions League thường niên',
      'Tập luyện chuyên môn và thi đấu giao hữu hàng tuần',
      'Đại diện trường tham gia giải bóng đá sinh viên Đà Nẵng'
    ],
    roles: 'Cầu thủ, Huấn luyện viên sinh viên, Hậu cần thể thao'
  },
  fhg: {
    id: 'fhg',
    prefix: 'FHG',
    nameEn: 'FUDA Hoops Gene',
    nameVi: 'CLB Bóng rổ FPTU',
    group: 'Thể thao',
    subgroup: 'Bóng',
    boothNumber: 3,
    floor: 3,
    themeColor: '#ea580c',
    icon: '🏀',
    slogan: 'Shoot For The Stars',
    description: 'Cộng đồng bóng rổ năng động với sân tập bóng rổ tiêu chuẩn tại Khu Thể Thao FUDA. Đam mê những cú 3 điểm và những pha bứt phá trên sân.',
    activities: [
      'Giải bóng rổ 3x3 và 5x5 nội bộ FPTU',
      'Giao hữu với các CLB bóng rổ đại học trên địa bàn',
      'Buổi tập kỹ năng ném rổ, phòng ngự và thể lực'
    ],
    roles: 'Ballers, Trọng tài sinh viên, Ban Truyền thông Thể thao'
  },
  fub: {
    id: 'fub',
    prefix: 'FUB',
    nameEn: 'FUDA Badminton Club',
    nameVi: 'CLB Cầu lông FPTU',
    group: 'Thể thao',
    subgroup: 'Cầu lông',
    boothNumber: 22,
    floor: 3,
    themeColor: '#059669',
    icon: '🏸',
    slogan: 'Vung Vợt Đam Mê - Cháy Cùng Đồng Đội',
    description: 'Nơi gặp gỡ của những bạn trẻ đam mê cầu lông, rèn luyện sức khỏe, kỹ thuật đập cầu và tham gia các giải đấu phong trào.',
    activities: [
      'Giải cầu lông FPTU Open thường niên',
      'Sinh hoạt tập luyện kỹ thuật đánh đơn, đánh đôi',
      'Giao lưu giao hữu thể thao cuối tuần'
    ],
    roles: 'Vận động viên, Trọng tài, Hậu cần sân bãi'
  },
  fdn: {
    id: 'fdn',
    prefix: 'FDN',
    nameEn: 'Nunchaku Club',
    nameVi: 'CLB Đức Nam Nhị Khúc Côn',
    group: 'Thể thao',
    subgroup: 'Võ thuật',
    boothNumber: 19,
    floor: 3,
    themeColor: '#ca8a04',
    icon: '🥢',
    slogan: 'Tốc Độ, Chuẩn Xác & Tinh Thần Thượng Võ',
    description: 'Nghiên cứu và tập luyện môn nghệ thuật côn nhị khúc, rèn luyện sự dẻo dai, phản xạ thần tốc và tinh thần kỷ luật tự giác.',
    activities: [
      'Biểu diễn côn nhị khúc nghệ thuật tại các lễ hội',
      'Luyện tập kỹ thuật cơ bản và nâng cao',
      'Giao lưu võ thuật liên CLB'
    ],
    roles: 'Võ sinh, Nghệ sĩ biểu diễn côn nhị khúc'
  },
  vct: {
    id: 'vct',
    prefix: 'VCT',
    nameEn: 'VCT - FPTU Club',
    nameVi: 'CLB Võ Cổ Truyền FPTU',
    group: 'Thể thao',
    subgroup: 'Võ thuật',
    boothNumber: 11,
    floor: 3,
    themeColor: '#b91c1c',
    icon: '🥋',
    slogan: 'Hào Khí Võ Việt - Tôn Sư Trọng Đạo',
    description: 'Gìn giữ và phát huy tinh hoa võ học dân tộc Việt Nam qua các bài quyền, thế đánh tự vệ và tinh thần thượng võ kiên cường.',
    activities: [
      'Tập luyện các bài quyền truyền thống và đối kháng',
      'Tham gia thi đấu các giải võ cổ truyền sinh viên',
      'Huấn luyện kỹ năng tự vệ cho nữ sinh viên'
    ],
    roles: 'Võ sinh, Đội tuyển thi đấu đối kháng'
  },
  fvc: {
    id: 'fvc',
    prefix: 'FVC',
    nameEn: 'FPTU Vovinam Club',
    nameVi: 'CLB Vovinam FPTU',
    group: 'Thể thao',
    subgroup: 'Võ thuật',
    boothNumber: 18,
    floor: 3,
    themeColor: '#2563eb',
    icon: '🥋',
    slogan: 'Việt Võ Đạo - Bàn Tay Thép Đặt Lên Trái Tim Từ Ái',
    description: 'CLB Vovinam đại diện cho môn học đặc trưng truyền thống của sinh viên FPTU, nổi tiếng với các đòn chân tấn công và tinh thần Việt Võ Đạo.',
    activities: [
      'Đại hội võ thuật Vovinam toàn quốc FPT Edu',
      'Biểu diễn đòn chân kẹp cổ ngoạn mục tại các ngày hội trường',
      'Hỗ trợ luyện tập môn học Giáo dục thể chất Vovinam'
    ],
    roles: 'Việt Võ Sinh, Huấn luyện viên thể chất'
  }
};

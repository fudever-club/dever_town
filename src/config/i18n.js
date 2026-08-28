/**
 * Hệ thống Đa ngôn ngữ (i18n) cho DEVER TOWN: Tiếng Việt 🇻🇳 & English 🇬🇧
 */
export const TRANSLATIONS = {
  vi: {
    // Header & Navigation
    brandTag: 'FUDA',
    roomSelect: 'Chọn phòng nhanh',
    inventoryBtn: 'Túi Đồ [I]',
    wardrobeBtn: 'Tủ Đồ',
    fptuPortalBtn: 'Cổng FPTU & Thi',
    questsBtn: 'Nhiệm Vụ',
    profileBtn: 'Hồ Sơ',
    settingsBtn: 'Cài Đặt',
    logoutBtn: 'Đăng xuất',
    guestTag: 'Khách',
    guestName: 'Khách vãng lai',
    fullscreenTitle: 'Bật / Tắt Toàn màn hình',
    onlineText: 'Online',
    offlineText: 'Mất kết nối',
    goodPing: 'Tốt',

    // 8 Rooms (Tên phòng chuẩn đồng bộ)
    rooms: {
      main_hall: 'Sảnh Alpha',
      dever_lab: 'Tech Lab',
      library_lounge: 'Thư Viện FUDA',
      memory_room: 'Phòng Kỷ Niệm',
      web_room: 'Không Gian Web',
      media_hub: 'Media & MXH',
      sports_complex: 'Khu Thể Thao',
      canteen_cafe: 'Căn Tin & Cafe',
      game_arcade: 'Tòa Gamma Plus - Arcade Gaming & Robot Studio'
    },

    // Portals (Cổng dịch chuyển trên mặt sàn)
    portals: {
      main_hall: 'Về Sảnh Chính',
      dever_lab: 'Sang Tech Lab',
      library_lounge: 'Sang Thư Viện',
      memory_room: 'Sang Phòng Kỷ Niệm',
      web_room: 'Sang Không Gian Web',
      media_hub: 'Sang Media Hub',
      sports_complex: 'Sang Khu Thể Thao',
      canteen_cafe: 'Sang Căn Tin & Cafe',
      game_arcade: 'Sang Arcade & Robot'
    },

    // Interactive Zones Tooltips (Đầy đủ tất cả Zone theo từng phòng)
    zones: {
      // Sảnh Alpha (Main Hall)
      zone_main_frog: 'Linh Vật Cóc Vàng FUDA',
      zone_main_campus_map: 'Sơ Đồ Bản Đồ FPTU',
      zone_main_slides: 'Màn Chiếu Sảnh Đón Tiếp',
      zone_main_meeting: 'Sân Khấu Họp Toàn Thể',
      zone_main_coffee: 'Vườn Trà FUDA & Thư Giãn',

      // Tech & AI Lab (Dever Lab)
      zone_lab_whiteboard: 'Bảng Sơ Đồ Kiến Trúc',
      zone_lab_code_a: 'Bàn Hackathon Đội Alpha',
      zone_lab_meeting: 'Bàn Thảo Luận Lab',
      zone_lab_code_b: 'Bàn Hackathon Đội Beta',

      // Thư Viện (Library Lounge)
      zone_lib_swe: 'Cẩm Nang Ôn Thi SWE201c',
      zone_lib_charter: 'Quy Chế Hoạt Động CLB',
      zone_lib_coffee: 'Quầy Cà Phê & Pomodoro',
      zone_lib_slides: 'Khu Đọc Tài Liệu Ôn Thi',
      zone_lib_code: 'Bàn Tự Học & Sổ Tay',

      // Phòng Kỷ Niệm (Memory Room)
      zone_mem_founding: 'Hành Trình 9+ Năm FU-DEVER',
      zone_mem_hackathon: '20+ Cúp ICPC & Hackathon',
      zone_mem_teambuilding: 'Album Teambuilding & Gắn Kết',
      zone_mem_workshop: 'Chuỗi Workshop Tech Talk',

      // Không Gian Web & IT Helpdesk (Web Room)
      zone_web_fptu_portal: 'IT Helpdesk & Phần Mềm Thi',
      zone_web_main: 'Landing Page Chính Thức',
      zone_web_member_portal: 'Member Portal Thành Viên',
      zone_web_projects: 'Kho Dự Án Game, AI & Web',
      zone_web_recruitment: 'Đăng Ký Thành Viên FU-DEVER',

      // Media Hub & Mạng Xã Hội (Media Hub)
      zone_media_portal: 'Cổng Tiện Ích & Phần Mềm Thi',
      zone_media_facebook: 'Fanpage Facebook FU-DEVER',
      zone_media_tiktok: 'Kênh TikTok & Media FUDA',
      zone_media_github: 'Kho GitHub Organization',
      zone_media_recruitment: 'Cổng Tuyển Quân FU-DEVER',

      // Khu Thể Thao (Sports Complex)
      zone_sports_football: 'Sút Phạt Đền Mini',
      zone_sports_basketball: 'Ném Bóng Rổ 3 Điểm',
      zone_sports_volleyball: 'Sân Bóng Chuyền & Cầu Lông',
      zone_sports_pool: 'Hồ Bơi Sinh Viên FUDA',
      zone_soccer: 'Sút Phạt Đền Mini',
      zone_basketball: 'Ném Bóng Rổ 3 Điểm',
      zone_swimming: 'Hồ Bơi Sinh Viên FUDA',

      // Căn Tin & Cafe (Canteen & Cafe Lounge)
      zone_canteen_food: 'Thực Đơn Căn Tin FUDA',
      zone_cafe_barista: 'Pha Chế Cà Phê Muối & Trà Sữa',
      zone_cafe_acoustic: 'Góc Nhạc Acoustic Cafe',
      zone_cafe_meeting: 'Bàn Tròn Thảo Luận Căn Tin',

      // Arcade Gaming (Game Arcade)
      zone_arcade_snake: 'Máy Game: Rắn Săn Mồi Cyber Snake',
      zone_arcade_sokoban: 'Máy Game: Buggy Đẩy Hộp (Sokoban)',
      zone_arcade_goldminer: 'Máy Game: Cóc Vàng Đào Kho Báu',
      zone_arcade_robot_hub: 'Trạm Trưng Bày & Tải Game Robot',
      zone_arcade_meeting: 'Bàn Đấu Game & Livestream',

      // Fallback Generic Zones
      zone_whiteboard: 'Màn Chiếu Slide',
      zone_meeting: 'Phòng Họp Nhóm',
      zone_code: 'Bàn Live Code',
      zone_coffee: 'Quầy Cà Phê Lofi',
      zone_memory: 'Khung Ảnh Kỷ Niệm',
      zone_website: 'Showroom Web CLB'
    },

    // Welcome Gate
    gateTitle: 'DEVER TOWN',
    gateSlogan: 'WORK HARD - PLAY HARD',
    gateDesc: 'Thế giới ảo Pixel 2D Gather.town style kết nối cộng đồng lập trình viên FUDA. Học tập, giao lưu, tổ chức workshop, sút bóng đá và khám phá 8 phân khu chức năng sống động!',
    gateFeat1Title: '8 Phân Khu 2D',
    gateFeat1Desc: 'Sảnh Alpha, Tech Lab, Thư viện, Kỷ niệm, Web, Media, Thể thao, Căn tin & Cafe',
    gateFeat2Title: 'Multiplayer Realtime',
    gateFeat2Desc: 'Gặp gỡ bạn bè, trò chuyện bong bóng thoại & chat tiếng Việt',
    gateFeat3Title: 'Túi Đồ & Trang Bị',
    gateFeat3Desc: 'Vật phẩm FUDA/Dev đặc sản, nhặt đồ và cầm trực tiếp trên tay',
    gateFeat4Title: 'Tủ Đồ Custom',
    gateFeat4Desc: 'Tùy biến Áo FUDA, kiểu tóc Nam/Nữ, tai nghe, kính râm, vương miện Cóc',
    gateTabGuest: 'Chơi Nhanh',
    gateTabLogin: 'Đăng Nhập',
    gateTabRegister: 'Đăng Ký',
    gateGuestLabel: 'Nhập Biệt danh (Hỗ trợ tiếng Việt & dấu cách):',
    gateGuestPlaceholder: 'Ví dụ: Dev Alpha FUDA',
    gateGuestBtn: 'Bắt Đầu Khám Phá DEVER TOWN',
    gateGuestHint: 'Chế độ Khách cho phép bạn trải nghiệm đầy đủ bản đồ và tương tác ngay.',
    gateLoginEmailLabel: 'Email Sinh viên / Thành viên:',
    gateLoginPassLabel: 'Mật khẩu:',
    gateLoginBtn: 'Đăng Nhập Thành Viên',
    gateRegNameLabel: 'Tên hiển thị:',
    gateRegEmailLabel: 'Email FUDA / Cá nhân:',
    gateRegPassLabel: 'Mật khẩu (Tối thiểu 6 ký tự):',
    gateRegBtn: 'Tạo Tài Khoản Thành Viên',

    // Onboarding Guide
    onboardingBadge: 'HƯỚNG DẪN TÂN THỦ',
    onboardingTitle: 'Chào mừng bạn đến với DEVER TOWN! 🎮',
    onboardingStep1Title: 'Di chuyển 4 hướng',
    onboardingStep1Desc: 'Dùng phím Mũi tên hoặc W A S D (Điện thoại có D-Pad ảo).',
    onboardingStep2Title: 'Tương tác phím [E]',
    onboardingStep2Desc: 'Tiến gần Màn chiếu, Bàn code, Minigame và bấm [E].',
    onboardingStep3Title: 'Túi đồ phím [I]',
    onboardingStep3Desc: 'Nhặt vật phẩm rơi trên sàn, trang bị và cầm trên tay.',
    onboardingStep4Title: 'Khám phá 8 Phòng',
    onboardingStep4Desc: 'Bước qua các cổng dịch chuyển màu tím để sang phòng khác.',
    onboardingDismissBtn: 'Đã Hiểu, Bắt Đầu Chơi Ngay 🚀',

    // Chat Box
    chatTitle: 'Kênh Chat FUDA & DEVER',
    chatSub: 'Kênh phòng Realtime',
    chatWelcomeTitle: 'Chào mừng đến với DEVER TOWN!',
    chatWelcomeDesc: 'Di chuyển nhân vật bằng Arrow keys / WASD, nhấn [E] để tương tác, nhấn [I] mở Túi đồ. Chat tự do tiếng Việt có dấu!',
    chatPlaceholder: 'Nhập tin nhắn...',
    chatSendBtn: 'Gửi',

    // Footer
    footerBrand: 'FU-DEVER • FUDA',
    footerSlogan: 'DEVER TOWN v0.8.5 • WORK HARD PLAY HARD',
    footerMove: 'WASD/Mũi tên: Di chuyển',
    footerInteract: '[E]: Tương tác',
    footerInv: '[I]: Túi đồ',

    // Settings Modal
    settingsTitle: 'Cài Đặt Hệ Thống',
    settingsSub: 'Tùy chỉnh âm thanh, ngôn ngữ và hiển thị trong DEVER TOWN.',
    settingsLangLabel: 'Ngôn Ngữ Giao Diện (Language):',
    settingsAudioTitle: 'Âm Thanh & Hiệu Ứng Game:',
    settingsMasterMute: 'Tắt Toàn Bộ Âm Thanh (Master Mute)',
    settingsVolumeLabel: 'Âm Lượng Tổng Thể:',
    settingsFootsteps: 'Bật Tiếng Bước Chân Khi Di Chuyển',
    settingsSfx: 'Bật Hiệu Ứng Âm Thanh (Click, Portal, Nhặt Đồ)',
    settingsControlsTitle: 'Phím Tắt Điều Khiển:',
    settingsControlsDesc: 'W, A, S, D hoặc Phím Mũi Tên: Di chuyển | [E]: Tương tác | [I]: Mở túi đồ | [ESC]: Đóng cửa sổ'
  },

  en: {
    // Header & Navigation
    brandTag: 'FUDA',
    roomSelect: 'Quick Room Switcher',
    inventoryBtn: 'Inventory [I]',
    wardrobeBtn: 'Wardrobe',
    fptuPortalBtn: 'FPTU & Exams',
    questsBtn: 'Quests',
    profileBtn: 'Profile',
    settingsBtn: 'Settings',
    logoutBtn: 'Logout',
    guestTag: 'Guest',
    guestName: 'Guest Visitor',
    fullscreenTitle: 'Toggle Fullscreen',
    onlineText: 'Online',
    offlineText: 'Offline',
    goodPing: 'Good',

    // 8 Rooms (Standardized English Names)
    rooms: {
      main_hall: 'Alpha Main Hall',
      dever_lab: 'Tech Lab',
      library_lounge: 'FUDA Library',
      memory_room: 'Memory Gallery',
      web_room: 'Web Showroom',
      media_hub: 'Media & Social',
      sports_complex: 'Sports Complex',
      canteen_cafe: 'Canteen & Cafe',
      game_arcade: 'Arcade Gaming & Robot Studio'
    },

    // Portals (Ground portals)
    portals: {
      main_hall: 'To Alpha Hall',
      dever_lab: 'To Tech Lab',
      library_lounge: 'To Library',
      memory_room: 'To Memory Gallery',
      web_room: 'To Web Showroom',
      media_hub: 'To Media Hub',
      sports_complex: 'To Sports Complex',
      canteen_cafe: 'To Canteen & Cafe',
      game_arcade: 'To Arcade & Robot'
    },

    // Interactive Zones Tooltips (Full zones mapped per room)
    zones: {
      // Alpha Hall
      zone_main_frog: 'FUDA Golden Frog Motto',
      zone_main_campus_map: 'FPTU Da Nang Campus Map',
      zone_main_slides: 'Welcome Hall Presentation',
      zone_main_meeting: 'General Meeting Stage',
      zone_main_coffee: 'FUDA Tea Garden & Chill',

      // Tech & AI Lab
      zone_lab_whiteboard: 'AI Architecture Board',
      zone_lab_code_a: 'Alpha Hackathon Sandbox',
      zone_lab_meeting: 'Lab Tech Discussion',
      zone_lab_code_b: 'Beta Hackathon Sandbox',

      // Library Lounge
      zone_lib_swe: 'SWE201c Exam Guide',
      zone_lib_charter: 'DEVER Club Regulations',
      zone_lib_coffee: 'Coffee & Pomodoro Station',
      zone_lib_slides: 'Exam Study Materials',
      zone_lib_code: 'Study Desk & Notebook',

      // Memory Room
      zone_mem_founding: '9+ Years of FU-DEVER',
      zone_mem_hackathon: '20+ ICPC & Hackathon Trophies',
      zone_mem_teambuilding: 'Teambuilding & Family Album',
      zone_mem_workshop: 'Tech Talk Workshops Series',

      // Web Showroom & IT Helpdesk
      zone_web_fptu_portal: 'IT Helpdesk & Exam Software',
      zone_web_main: 'Official Landing Page',
      zone_web_member_portal: 'Club Member Portal',
      zone_web_projects: 'Game, AI & Web Showcase',
      zone_web_recruitment: 'Join FU-DEVER Registration',

      // Media Hub
      zone_media_portal: 'Student & Exam Portal',
      zone_media_facebook: 'Official Facebook Fanpage',
      zone_media_tiktok: 'FUDA TikTok & Media',
      zone_media_github: 'GitHub Organization',
      zone_media_recruitment: 'Recruitment Registration',

      // Sports Complex
      zone_sports_football: 'Penalty Shootout Mini',
      zone_sports_basketball: 'Basketball 3-Point Shootout',
      zone_sports_volleyball: 'Volleyball & Badminton Court',
      zone_sports_pool: 'FUDA Student Swimming Pool',
      zone_soccer: 'Penalty Shootout Mini',
      zone_basketball: 'Basketball 3-Point Shootout',
      zone_swimming: 'FUDA Student Swimming Pool',

      // Canteen & Cafe Lounge
      zone_canteen_food: 'FUDA Canteen Menus',
      zone_cafe_barista: 'Salt Coffee & Milk Tea Barista',
      zone_cafe_acoustic: 'Acoustic Chill & Lofi',
      zone_cafe_meeting: 'Canteen Group Discussion',

      // Arcade Gaming (Game Arcade)
      zone_arcade_snake: 'Arcade: Cyber Snake',
      zone_arcade_sokoban: 'Arcade: Buggy Sokoban',
      zone_arcade_goldminer: 'Arcade: FPTU Gold Miner',
      zone_arcade_robot_hub: 'Club Robot Games Download',
      zone_arcade_meeting: 'Game Match & Livestream Desk',

      // Fallback Generic Zones
      zone_whiteboard: 'Slide Presentation',
      zone_meeting: 'Meeting Stage',
      zone_code: 'Live Code Sandbox',
      zone_coffee: 'Lofi Chill Station',
      zone_memory: 'Memory Frames',
      zone_website: 'Club Website Showroom'
    },

    // Welcome Gate
    gateTitle: 'DEVER TOWN',
    gateSlogan: 'WORK HARD - PLAY HARD',
    gateDesc: '2D Pixel Gather.town metaverse connecting the FUDA developer community. Study, network, host tech workshops, play soccer, and explore 8 interactive districts!',
    gateFeat1Title: '8 2D Districts',
    gateFeat1Desc: 'Alpha Hall, Tech Lab, Library, Memorial, Web, Media, Sports, Canteen & Cafe',
    gateFeat2Title: 'Realtime Multiplayer',
    gateFeat2Desc: 'Meet club members, live speech bubbles & instant room chat',
    gateFeat3Title: 'Inventory & Items',
    gateFeat3Desc: 'Collect iconic FUDA/Dev items and hold them directly in hand',
    gateFeat4Title: 'Custom Wardrobe',
    gateFeat4Desc: 'Customize FUDA hoodies, Male/Female hairs, headphones, sunglasses, Golden Frog crown',
    gateTabGuest: 'Quick Play',
    gateTabLogin: 'Login',
    gateTabRegister: 'Register',
    gateGuestLabel: 'Enter Nickname (Spaces & accents supported):',
    gateGuestPlaceholder: 'E.g.: Dev Alpha FUDA',
    gateGuestBtn: 'Enter DEVER TOWN Metaverse',
    gateGuestHint: 'Guest mode lets you immediately explore all maps and interact with live members.',
    gateLoginEmailLabel: 'Student / Member Email:',
    gateLoginPassLabel: 'Password:',
    gateLoginBtn: 'Login Member',
    gateRegNameLabel: 'Display Name:',
    gateRegEmailLabel: 'FUDA / Personal Email:',
    gateRegPassLabel: 'Password (At least 6 chars):',
    gateRegBtn: 'Create Member Account',

    // Onboarding Guide
    onboardingBadge: 'BEGINNER GUIDE',
    onboardingTitle: 'Welcome to DEVER TOWN! 🎮',
    onboardingStep1Title: '4-Direction Movement',
    onboardingStep1Desc: 'Use Arrow keys or W A S D (Virtual D-Pad on mobile).',
    onboardingStep2Title: 'Interact with [E]',
    onboardingStep2Desc: 'Approach Slides, Code Desk, Minigames and press [E].',
    onboardingStep3Title: 'Inventory with [I]',
    onboardingStep3Desc: 'Pick up items on the floor, equip and hold in hand.',
    onboardingStep4Title: 'Explore 8 Rooms',
    onboardingStep4Desc: 'Walk through purple portals to teleport to other rooms.',
    onboardingDismissBtn: 'Got it, Let\'s Play Now 🚀',

    // Chat Box
    chatTitle: 'FUDA & DEVER Live Chat',
    chatSub: 'Realtime Room Channel',
    chatWelcomeTitle: 'Welcome to DEVER TOWN!',
    chatWelcomeDesc: 'Move character with Arrow keys / WASD, press [E] to interact, press [I] for Inventory. Enjoy chatting!',
    chatPlaceholder: 'Type a message...',
    chatSendBtn: 'Send',

    // Footer
    footerBrand: 'FU-DEVER • FUDA',
    footerSlogan: 'DEVER TOWN v0.8.5 • WORK HARD PLAY HARD',
    footerMove: 'WASD/Arrows: Move',
    footerInteract: '[E]: Interact',
    footerInv: '[I]: Inventory',

    // Settings Modal
    settingsTitle: 'System Settings',
    settingsSub: 'Customize audio, language, and display options in DEVER TOWN.',
    settingsLangLabel: 'Interface Language:',
    settingsAudioTitle: 'Audio & Sound FX:',
    settingsMasterMute: 'Mute All Game Sounds (Master Mute)',
    settingsVolumeLabel: 'Master Volume:',
    settingsFootsteps: 'Enable Footstep Sounds While Walking',
    settingsSfx: 'Enable Sound Effects (Click, Portal, Pickups)',
    settingsControlsTitle: 'Controls Cheatsheet:',
    settingsControlsDesc: 'W, A, S, D or Arrow Keys: Move | [E]: Interact | [I]: Open Inventory | [ESC]: Close Dialogs'
  }
};

class I18nManager {
  constructor() {
    this.currentLang = 'vi';
    this.listeners = [];
    this.loadLanguage();
  }

  loadLanguage() {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    try {
      const saved = localStorage.getItem('dever_lang');
      if (saved === 'en' || saved === 'vi') {
        this.currentLang = saved;
      }
    } catch (e) {
      console.warn('Lỗi nạp ngôn ngữ:', e);
    }
  }

  setLanguage(lang) {
    if (lang !== 'vi' && lang !== 'en') return;
    this.currentLang = lang;
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('dever_lang', lang);
      } catch (e) {}
    }

    this.applyToDOM();
    this.listeners.forEach(fn => fn(lang));
  }

  get(key, fallback = null) {
    if (!key || typeof key !== 'string') return fallback;
    const keys = key.split('.');
    let obj = TRANSLATIONS[this.currentLang];
    for (const k of keys) {
      if (obj && obj[k] !== undefined) {
        obj = obj[k];
      } else {
        return fallback;
      }
    }
    return obj !== undefined && obj !== null ? obj : fallback;
  }

  subscribe(fn) {
    this.listeners.push(fn);
  }

  applyToDOM() {
    if (typeof document === 'undefined') return;

    // Apply data-i18n attributes
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = this.get(key);
      if (val && typeof val === 'string') {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = val;
        } else {
          el.textContent = val;
        }
      }
    });

    // Update Room Selector options for all 8 rooms
    const roomSelect = document.getElementById('room-selector');
    if (roomSelect) {
      const roomKeys = [
        'main_hall', 'dever_lab', 'library_lounge', 'memory_room',
        'web_room', 'media_hub', 'sports_complex', 'canteen_cafe', 'game_arcade'
      ];
      roomKeys.forEach(r => {
        const opt = document.getElementById(`opt-${r}`);
        if (opt) {
          const count = opt.textContent.match(/\(\d+\)/)?.[0] || '(0)';
          opt.textContent = `${this.get(`rooms.${r}`)} ${count}`;
        }
      });
    }

    // Update Chat Welcome Box
    const chatWelcomeTitle = document.querySelector('.chat-welcome .welcome-title') || document.querySelector('.chat-welcome-box strong');
    const chatWelcomeDesc = document.querySelector('.chat-welcome .welcome-desc') || document.querySelector('.chat-welcome-box p');
    if (chatWelcomeTitle) chatWelcomeTitle.textContent = this.get('chatWelcomeTitle');
    if (chatWelcomeDesc) chatWelcomeDesc.textContent = this.get('chatWelcomeDesc');
  }
}

export const i18n = new I18nManager();

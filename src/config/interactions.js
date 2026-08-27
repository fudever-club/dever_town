/**
 * Định nghĩa cấu hình, URL mặc định và Presets cho các Interactive Zones trong DEVER TOWN.
 */
export const INTERACTION_PRESETS = {
  whiteboard_slides: {
    type: 'whiteboard_slides',
    name: 'Màn Chiếu & Slide Thuyết Trình',
    icon: 'presentation',
    defaultUrl: 'https://docs.google.com/presentation/d/e/2PACX-1vR6Z4eB-b3w2hG9g4q5i8u7y6t5r4e3w2q1a/embed?start=false&loop=false&delayms=3000',
    presets: [
      {
        title: 'Giới thiệu DEVER Club & Tech Roadmap',
        url: 'https://docs.google.com/presentation/d/e/2PACX-1vR6Z4eB-b3w2hG9g4q5i8u7y6t5r4e3w2q1a/embed?start=false&loop=false&delayms=3000',
        note: 'Tài liệu định hướng và kế hoạch hoạt động CLB'
      },
      {
        title: 'Bảng Vẽ & Kiến Trúc Excalidraw',
        url: 'https://excalidraw.com',
        note: 'Bảng trắng vẽ sơ đồ hệ thống realtime'
      }
    ]
  },

  meeting_stage: {
    type: 'meeting_stage',
    name: 'Phòng Họp & Video Call Trực Tuyến',
    icon: 'video',
    defaultRoom: 'DeverTown_MainHall',
    getJitsiUrl: (roomName) => `https://meet.jit.si/${roomName || 'DeverTown_VirtualClub'}#config.prejoinPageEnabled=false&config.startWithAudioMuted=true`
  },

  code_editor: {
    type: 'code_editor',
    name: 'Bàn Lập Trình & Sổ Tay Ghi Chú',
    icon: 'code',
    defaultCode: `// Chào mừng đến với DEVER Code Sandbox!
function calculateClubGrowth(members, months) {
  const growthRate = 1.25; // Tăng trưởng 25% mỗi tháng
  const total = Math.round(members * Math.pow(growthRate, months));
  return \`Sau \${months} tháng, CLB sẽ đạt khoảng \${total} thành viên!\`;
}

console.log(calculateClubGrowth(15, 6));
`,
    defaultNotes: `# Ghi Chú Sinh Hoạt CLB DEVER TOWN
- [x] Triển khai thành công Phaser 3 + Vite Game Engine.
- [x] Hoàn thiện Multiplayer Realtime với Socket.io.
- [x] Tích hợp Authentication JWT và 4 Avatar Pixel Art.
- [x] Xây dựng hệ sinh thái 5 Không gian (Sảnh, Lab, Thư viện, Kỷ niệm, Web).
- [x] Kích hoạt các vùng tương tác Proximity Interactive Zones.
`
  },

  coffee_lofi: {
    type: 'coffee_lofi',
    name: 'Quầy Cà Phê & Pomodoro Study Timer',
    icon: 'coffee',
    youtubeId: 'jfKfPfyJRdk',
    getEmbedUrl: (id) => `https://www.youtube-nocookie.com/embed/${id || 'jfKfPfyJRdk'}?autoplay=1&mute=0`
  },

  gallery_memory: {
    type: 'gallery_memory',
    name: 'Triển Lãm Kỷ Niệm & Cột Mốc CLB',
    icon: 'image',
    memories: [
      {
        id: 'founding',
        title: 'Lễ Ra Mắt & Thành Lập CLB Lập Trình DEVER',
        date: 'Tháng 09/2023',
        tag: 'Cột mốc lịch sử',
        story: 'Ngày hội tụ đầu tiên của các thành viên đam mê công nghệ, chính thức đặt nền móng xây dựng ngôi nhà chung DEVER TOWN và phát triển các sản phẩm công nghệ sinh viên.',
        accentColor: '#3b82f6'
      },
      {
        id: 'hackathon',
        title: 'Vô Địch Cuộc Thi Lập Trình Hackathon Toàn Quốc',
        date: 'Tháng 12/2024',
        tag: 'Chiến tích vàng',
        story: 'Đội ngũ DEVER Club xuất sắc vượt qua hơn 50 đội thi toàn quốc với giải pháp ứng dụng AI & Realtime Collaboration phục vụ giáo dục.',
        accentColor: '#fbbf24'
      },
      {
        id: 'teambuilding',
        title: 'Chuyến Dã Ngoại & Gắn Kết Mùa Hè',
        date: 'Mùa Hè 2025',
        tag: 'Gắn kết thành viên',
        story: 'Những khoảnh khắc bùng nổ năng lượng, đốt lửa trại và chia sẻ kinh nghiệm học tập, định hướng nghề nghiệp giữa các thế hệ thành viên CLB.',
        accentColor: '#10b981'
      },
      {
        id: 'workshop',
        title: 'Workshop Chuyên Đề: Làm Chủ Fullstack & Realtime Systems',
        date: 'Định kỳ hàng tháng',
        tag: 'Đào tạo kỹ thuật',
        story: 'Các buổi chia sẻ chuyên sâu về Node.js, WebSockets, Phaser 3, Kiến trúc Microservices và Clean Code do các anh chị Leader hướng dẫn.',
        accentColor: '#a855f7'
      }
    ]
  },

  club_website: {
    type: 'club_website',
    name: 'Không Gian Trải Nghiệm Website CLB',
    icon: 'globe',
    defaultUrl: 'https://deverclub.com',
    fallbackUrl: 'https://github.com'
  }
};

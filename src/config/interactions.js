/**
 * Định nghĩa cấu hình, URL mặc định và Presets cho các Interactive Zones trong DEVER TOWN.
 */
export const INTERACTION_PRESETS = {
  whiteboard_slides: {
    type: 'whiteboard_slides',
    name: 'Màn Chiếu & Slide Thuyết Trình',
    icon: '📊',
    defaultUrl: 'https://docs.google.com/presentation/d/e/2PACX-1vR6Z4eB-b3w2hG9g4q5i8u7y6t5r4e3w2q1a/embed?start=false&loop=false&delayms=3000',
    presets: [
      {
        title: '📘 Giới thiệu DEVER Club & Tech Roadmap',
        url: 'https://docs.google.com/presentation/d/e/2PACX-1vR6Z4eB-b3w2hG9g4q5i8u7y6t5r4e3w2q1a/embed?start=false&loop=false&delayms=3000',
        note: 'Tài liệu định hướng và kế hoạch hoạt động CLB'
      },
      {
        title: '⚡ Bảng Vẽ & Kiến Trúc Excalidraw',
        url: 'https://excalidraw.com',
        note: 'Bảng trắng vẽ sơ đồ hệ thống realtime'
      }
    ]
  },

  meeting_stage: {
    type: 'meeting_stage',
    name: 'Phòng Họp & Video Call Trực Tuyến',
    icon: '🎤',
    defaultRoom: 'DeverTown_MainHall',
    getJitsiUrl: (roomName) => `https://meet.jit.si/${roomName || 'DeverTown_VirtualClub'}#config.prejoinPageEnabled=false&config.startWithAudioMuted=true`
  },

  code_editor: {
    type: 'code_editor',
    name: 'Bàn Lập Trình & Sổ Tay Ghi Chú',
    icon: '🖥️',
    defaultCode: `// 🚀 Chào mừng đến với DEVER Code Sandbox!
function calculateClubGrowth(members, months) {
  const growthRate = 1.25; // Tăng trưởng 25% mỗi tháng
  const total = Math.round(members * Math.pow(growthRate, months));
  return \`Sau \${months} tháng, CLB sẽ đạt khoảng \${total} thành viên!\`;
}

console.log(calculateClubGrowth(15, 6));
`,
    defaultNotes: `# 📝 Ghi Chú Sinh Hoạt CLB DEVER TOWN
- [x] Triển khai thành công Phaser 3 + Vite Game Engine.
- [x] Hoàn thiện Multiplayer Realtime với Socket.io.
- [x] Tích hợp Authentication JWT và 4 Avatar Pixel Art.
- [x] Xây dựng hệ sinh thái 3 Không gian: Sảnh chính, Dever Lab, Thư viện.
- [x] Kích hoạt các vùng tương tác Proximity Interactive Zones.
`
  },

  coffee_lofi: {
    type: 'coffee_lofi',
    name: 'Quầy Cà Phê & Pomodoro Study Timer',
    icon: '☕',
    youtubeId: 'jfKfPfyJRdk', // Lofi Girl Radio Live Stream
    getEmbedUrl: (id) => `https://www.youtube-nocookie.com/embed/${id || 'jfKfPfyJRdk'}?autoplay=1&mute=0`
  }
};

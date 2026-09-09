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

  // 3. Bàn Lập Trình Multi-Language & Sổ tay Markdown
  code_editor: {
    title: 'Bàn Lập Trình Live Code Multi-Language & Sổ Tay Sinh Viên FUDA',
    description: 'Biên dịch và thực thi trực tiếp đa ngôn ngữ: C, C++, Java, Pascal, Python, JavaScript, Go, Rust, C#, PHP.',
    languages: [
      {
        id: 'javascript',
        name: 'JavaScript (Node.js)',
        badge: 'JS',
        wandboxCompiler: 'nodejs-20.17.0',
        sample: `// FU-DEVER Code Sandbox - JavaScript
const club = {
  name: 'FU-DEVER',
  campus: 'FPT University Da Nang (FUDA)',
  pillars: ['2D Game', 'Web App', 'Mobile App', 'Model AI'],
  members: '50+ Members',
  slogan: 'WORK HARD - PLAY HARD'
};

console.log("=== THÔNG TIN CLB FU-DEVER ===");
console.log("CLB:", club.name);
console.log("Cơ sở:", club.campus);
console.log("Chuyên môn:", club.pillars.join(", "));
console.log("Slogan:", club.slogan);`
      },
      {
        id: 'python',
        name: 'Python 3',
        badge: 'Python',
        wandboxCompiler: 'cpython-3.12.7',
        sample: `# FU-DEVER Code Sandbox - Python 3
club = {
    "name": "FU-DEVER",
    "campus": "FPT University Da Nang",
    "pillars": ["AI & Machine Learning", "2D Game Dev", "Fullstack Web", "Mobile App"],
    "slogan": "WORK HARD - PLAY HARD"
}

print("=== CLB FU-DEVER PYTHON RUNNER ===")
print(f"Chào mừng bạn đến với {club['name']} @ {club['campus']}!")
print("Các trụ cột công nghệ:")
for i, pillar in enumerate(club["pillars"], 1):
    print(f"  {i}. {pillar}")
print(f"Tôn chỉ hoạt động: {club['slogan']}")`
      },
      {
        id: 'c',
        name: 'C (GCC)',
        badge: 'C',
        wandboxCompiler: 'gcc-13.2.0-c',
        sample: `// FU-DEVER Code Sandbox - Ngôn ngữ C
#include <stdio.h>

int main() {
    printf("=========================================\\n");
    printf("  FU-DEVER - FPT UNIVERSITY DA NANG      \\n");
    printf("  Chao mung tan sinh vien den voi CLB!   \\n");
    printf("=========================================\\n");
    printf("Slogan: WORK HARD - PLAY HARD\\n");
    printf("Ngon ngu lap trinh C co ban & cau truc du lieu\\n");
    return 0;
}`
      },
      {
        id: 'cpp',
        name: 'C++ (G++)',
        badge: 'C++',
        wandboxCompiler: 'gcc-13.2.0',
        sample: `// FU-DEVER Code Sandbox - C++ (ICPC & Competitive Programming)
#include <iostream>
#include <vector>
#include <string>

using namespace std;

int main() {
    cout << "=== CLB FU-DEVER C++ RUNNER ===" << endl;
    vector<string> tracks = {"2D Game Development", "AI/ML Engineering", "Competitive Programming"};
    
    cout << "Cac mang hoat dong noi bat:" << endl;
    for (size_t i = 0; i < tracks.size(); ++i) {
        cout << " [" << i + 1 << "] " << tracks[i] << endl;
    }
    cout << "Slogan: WORK HARD - PLAY HARD!" << endl;
    return 0;
}`
      },
      {
        id: 'java',
        name: 'Java (OpenJDK)',
        badge: 'Java',
        wandboxCompiler: 'openjdk-jdk-22+36',
        sample: `// FU-DEVER Code Sandbox - Java (SWE201c & OOP)
class Main {
    public static void main(String[] args) {
        System.out.println("=== FU-DEVER JAVA SANDBOX ===");
        System.out.println("Chao mung ban den voi bo mon SWE201c & Lap trinh huong doi tuong (OOP)!");
        System.out.println("CLB FU-DEVER • FPT University Da Nang");
        System.out.println("Slogan: WORK HARD - PLAY HARD");
    }
}`
      },
      {
        id: 'pascal',
        name: 'Pascal (Free Pascal)',
        badge: 'Pascal',
        wandboxCompiler: 'fpc-3.2.2',
        sample: `// FU-DEVER Code Sandbox - Pascal (Free Pascal Compiler)
program FUDeverPascal;

begin
    writeln('=============================================');
    writeln('  FU-DEVER PASCAL SANDBOX - FPT UNIVERSITY   ');
    writeln('=============================================');
    writeln('Chao mung ban den voi ngon ngu lap trinh Pascal!');
    writeln('CLB FU-DEVER: WORK HARD - PLAY HARD');
end.`
      },
      {
        id: 'go',
        name: 'Go (Golang)',
        badge: 'Go',
        wandboxCompiler: 'go-1.23.2',
        sample: `// FU-DEVER Code Sandbox - Go
package main

import "fmt"

func main() {
    fmt.Println("=== FU-DEVER GO RUNNER ===")
    fmt.Println("Cloud Computing, Microservices & High-Performance Backends")
    fmt.Println("CLB FU-DEVER • WORK HARD - PLAY HARD")
}`
      },
      {
        id: 'rust',
        name: 'Rust',
        badge: 'Rust',
        wandboxCompiler: 'rust-1.82.0',
        sample: `// FU-DEVER Code Sandbox - Rust
fn main() {
    println!("=== FU-DEVER RUST SANDBOX ===");
    println!("Safe, Concurrent & Ultra-fast Systems Programming");
    println!("CLB FU-DEVER • WORK HARD - PLAY HARD");
}`
      },
      {
        id: 'csharp',
        name: 'C# (.NET / Mono)',
        badge: 'C#',
        wandboxCompiler: 'mono-6.12.0.199',
        sample: `// FU-DEVER Code Sandbox - C#
using System;

class Program {
    static void Main() {
        Console.WriteLine("=== FU-DEVER C# RUNNER ===");
        Console.WriteLine(".NET Game Dev & Enterprise Software");
        Console.WriteLine("CLB FU-DEVER • WORK HARD - PLAY HARD");
    }
}`
      },
      {
        id: 'php',
        name: 'PHP',
        badge: 'PHP',
        wandboxCompiler: 'php-8.3.12',
        sample: `<?php
// FU-DEVER Code Sandbox - PHP
echo "=== FU-DEVER PHP RUNNER ===\\n";
echo "Web Development & Backend Services\\n";
echo "Slogan: WORK HARD - PLAY HARD\\n";
?>`
      }
    ],
    defaultNotes: `# SỔ TAY HỌC TẬP FU-DEVER\n\n- **CLB:** FU-DEVER - FUDA\n- **Slogan:** WORK HARD - PLAY HARD\n- **Địa chỉ:** Khu đô thị FPT City, Ngũ Hành Sơn, Đà Nẵng\n- **Hotline:** +84 828 828 497\n- **Email:** club.dever@gmail.com\n\n## Mục tiêu tuần này:\n1. Hoàn thiện đồ họa 2D Pixel Town.\n2. Thực hành WebSockets & Phaser 3 Game Engine.\n3. Chuẩn bị sự kiện Tech Talk & Workshop sắp tới.`
  },

  // 4. Quầy Cà phê Lofi & Pomodoro Timer
  coffee_lofi: {
    title: 'Quầy Cà Phê Chill Radio & Pomodoro FU-DEVER',
    description: 'Không gian âm nhạc lofi thư giãn và bộ đếm thời gian tập trung 25/5 phút.',
    getEmbedUrl: (videoId) => `https://www.youtube.com/embed/${videoId || 'm7Wya6Z-QdM'}?autoplay=1&mute=0&controls=1`
  },

  // 5. Phòng Triển Lãm Kỷ Niệm (Gallery)
  gallery_memory: {
    title: 'Phòng Triển Lãm Kỷ Niệm & Bảng Vàng FU-DEVER',
    description: 'Lưu trữ hành trình 9+ năm hoạt động, 20+ giải thưởng và các cột mốc lịch sử.',
    memories: [
      {
        id: 'founding',
        title: 'Hành Trình 9+ Năm Phát Triển FU-DEVER',
        date: 'Từ 27/10/2017 – Nay',
        tag: 'Cột mốc lịch sử',
        icon: '🏛️',
        accentColor: '#00B2FF',
        story: 'Khởi đầu từ một nhóm sinh viên đam mê lập trình tại ĐH FPT Đà Nẵng, FU-DEVER đã vươn mình trở thành câu lạc bộ học thuật công nghệ hàng đầu với 4 phân ban chuyên môn (Web, AI, Mobile, Game), hàng chục dự án thực chiến và bảng vàng thành tích rực rỡ.'
      },
      {
        id: 'hackathon',
        title: 'Quán Quân FPT Hackathon Đà Nẵng – Team NEUROSHIP',
        date: '2024',
        tag: 'Vô địch Hackathon',
        icon: '🥇',
        accentColor: '#fbbf24',
        story: 'Xuất sắc vượt qua hàng chục đội thi công nghệ tài năng, Team NEUROSHIP đại diện cho CLB FU-DEVER đã giành ngôi vị Quán quân Bảng A khu vực Đà Nẵng tại đấu trường lập trình danh giá FPT Hackathon.'
      },
      {
        id: 'game_craft_doclap',
        title: 'Quán Quân Game Craft Arena 2025 – Đội Game ĐỘC LẬP',
        date: '2025',
        tag: 'Vô địch Game Dev',
        icon: '🎮',
        accentColor: '#f26f21',
        story: 'Sau hơn 1 tháng tranh tài gay cấn tại cuộc thi lập trình game Game Craft Arena 2025 do FPT Đà Nẵng tổ chức, đội thi ĐỘC LẬP thuộc phân ban Game Dev của FU-DEVER đã xuất sắc nâng cao cúp vô địch.'
      },
      {
        id: 'devfest_ai',
        title: 'Á Quân 1 DEVFEST AI Hackathon 2023 Miền Trung',
        date: '2023',
        tag: 'Á quân Miền Trung',
        icon: '🥈',
        accentColor: '#38bdf8',
        story: 'Đội tuyển CLB Lập trình FU-DEVER xuất sắc vượt qua các vòng code hackathon xuyên đêm để giành danh hiệu Á Quân 1 trong cuộc thi "DEVFEST - AI HACKATHON 2023" khu vực Miền Trung.'
      },
      {
        id: 'codemosaic',
        title: 'Chung Kết CodeMosaic 2025 – DeverLastHope K20',
        date: '2025',
        tag: 'Chung kết thuật toán',
        icon: '⚡',
        accentColor: '#c084fc',
        story: 'Tại Chung kết CodeMosaic 2025, sau 4 tiếng thi đấu thuật toán căng thẳng và kịch tính, đội DeverLastHope K20 đã thi đấu kiên cường và mang về niềm tự hào lớn cho đại gia đình FU-DEVER.'
      },
      {
        id: 'resconnect_2026',
        title: 'Giải Khuyến Khích ResConnect 2026 & FPT Edu ResFes 2026',
        date: '2026',
        tag: 'NCKH & AI Model',
        icon: '🎖️',
        accentColor: '#10b981',
        story: 'Team Absolutely Inefficient (AI) của FU-DEVER xuất sắc giành trọn cú đúp Giải Khuyến khích tại cả Hội thảo Khoa học Sinh viên ResConnect 2026 và Chung kết Toàn quốc FPT Edu ResFes 2026 với đề tài nghiên cứu chuyên sâu về mô hình AI "Low-Light Image Enhancement Under Challenging Environments".'
      },
      {
        id: 'shecodes',
        title: 'Giải Thưởng Sáng Tạo SHECODES – SPOIL TEAM',
        date: '2023 - 2024',
        tag: 'Nữ sinh công nghệ',
        icon: '🏅',
        accentColor: '#f472b6',
        story: 'Tại cuộc thi phát triển sản phẩm công nghệ dành cho phái nữ SHECODES, SPOIL TEAM của FU-DEVER đã tỏa sáng rực rỡ với giải pháp sáng tạo, khẳng định bản lĩnh của các nữ kỹ sư phần mềm DEVER.'
      },
      {
        id: 'coc_vang',
        title: 'Vinh Danh Cóc Vàng FUDA – Sinh Viên Tiêu Biểu',
        date: 'Thường niên mỗi kỳ',
        tag: 'Vinh danh cá nhân',
        icon: '🐸',
        accentColor: '#eab308',
        story: 'Vinh danh các thành viên CLB FU-DEVER đã nỗ lực không ngừng nghỉ và chạm tay tới danh hiệu Cóc Vàng danh giá — phần thưởng học thuật và phong trào cao quý nhất của Đại học FPT Đà Nẵng.'
      },
      {
        id: 'teambuilding',
        title: 'Work Hard - Play Hard: Teambuilding Gắn Kết',
        date: 'Hàng Năm',
        tag: 'Văn hóa CLB',
        icon: '🏕️',
        accentColor: '#10b981',
        story: 'Bên cạnh những giờ code căng thẳng, FU-DEVER luôn duy trì tinh thần Work Hard - Play Hard với các chuyến dã ngoại Sơn Trà, cắm trại biển Đà Nẵng và các buổi sinh hoạt giao lưu gắn kết các thế hệ.'
      },
      {
        id: 'workshop',
        title: 'Chuỗi Workshop Tech Talk: 2D Game, Web App & AI',
        date: 'Định kỳ hàng tháng',
        tag: 'Học thuật & Đào tạo',
        icon: '💻',
        accentColor: '#8b5cf6',
        story: 'Tổ chức các buổi chia sẻ chuyên sâu về 4 trụ cột công nghệ: 2D Game Engine (Phaser), Web/Mobile Application (Next.js, Flutter) và Mô hình Trí tuệ Nhân tạo (Machine Learning/LLMs) cho sinh viên toàn trường.'
      }
    ]
  },

  // 6. Không Gian Website Showroom (Landing Page & Portals)
  club_website: {
    title: 'Showroom Cổng Thông Tin & Website Chính Thức FU-DEVER',
    description: 'Khám phá Landing Page, Member Portal, Admin Portal và Kho dự án của CLB.',
    defaultUrl: 'https://www.fudever.com/',
    portals: [
      { name: 'Landing Page Chính Thức', url: 'https://www.fudever.com/' },
      { name: 'Đơn Đăng Ký Thành Viên', url: 'https://forms.gle/2us1yB5Qp2HYejj28' },
      { name: 'Fanpage FU-DEVER', url: 'https://www.facebook.com/FPTUDever' },
      { name: 'Fanpage FUDA', url: 'https://www.facebook.com/daihocfptdanang' },
      { name: 'TikTok FUDA', url: 'https://www.tiktok.com/@daihocfptdanang' },
      { name: 'GitHub FU-DEVER', url: 'https://github.com/fudever-club' },
      { name: 'Member Portal', url: 'https://client.fudever.com' },
      { name: 'Admin Portal', url: 'https://admin.fudever.com' }
    ]
  },

  // 7. CỔNG TIỆN ÍCH HỌC VỤ & KHO PHẦN MỀM THI (FPTU Đà Nẵng)
  fptu_student_portal: {
    title: 'Cổng Tiện Ích Sinh Viên FPTU & Kho Phần Mềm Thi',
    description: 'Truy cập nhanh các trang web chính thống của trường và tải phần mềm thi Progress Test, Final Exam & Practical Exam.',
    systems: [
      {
        id: 'fap',
        name: 'FAP Portal',
        desc: 'Cổng thông tin sinh viên, thời khóa biểu, bảng điểm & học vụ',
        url: 'https://fap.fpt.edu.vn/',
        badge: 'Cổng chính',
        color: '#f26f21'
      },
      {
        id: 'flm',
        name: 'FLM Portal',
        desc: 'Tra cứu Syllabus, đề cương chi tiết & tài liệu học phần',
        url: 'https://flm.fpt.edu.vn/',
        badge: 'Học tập',
        color: '#0284c7'
      },
      {
        id: 'lms',
        name: 'LMS Đà Nẵng',
        desc: 'Hệ thống nộp bài tập, tài liệu bài giảng & kiểm tra online',
        url: 'https://lmsdn.fpt.edu.vn/',
        badge: 'Khóa học',
        color: '#10b981'
      },
      {
        id: 'edunext',
        name: 'EduNext',
        desc: 'Nền tảng học liệu, thảo luận nhóm, nộp bài tập, slide bài giảng',
        url: 'https://fu-edunext.fpt.edu.vn/login',
        badge: 'Kiến tạo',
        color: '#059669'
      },
      {
        id: 'reset_pass',
        name: 'Đổi Mật Khẩu WiFi & EOS',
        desc: 'Trang đổi mật khẩu mạng WiFi trường và mật khẩu phòng thi EOS',
        url: 'https://resetdn.fpt.edu.vn/',
        badge: 'Bảo mật',
        color: '#eab308'
      },
      {
        id: 'it_helpdesk',
        name: 'Hướng Dẫn & Hỗ Trợ IT',
        desc: 'Trang hỗ trợ kỹ thuật, xử lý sự cố máy tính và mạng trường',
        url: 'https://lmsdn.fpt.edu.vn/hd/',
        badge: 'IT Support',
        color: '#8b5cf6'
      },
      {
        id: 'e360',
        name: 'E360 Portal',
        desc: 'Trang web checkout & khảo sát chất lượng sau khi hoàn thành bài thi',
        url: 'https://e360.fpt.edu.vn/',
        badge: 'Khảo sát',
        color: '#ec4899'
      }
    ],
    examApps: [
      {
        id: 'seb',
        name: 'Safe Exam Browser (SEB)',
        purpose: 'Phần mềm thi Progress Test (Điểm thành phần các môn)',
        url: 'https://drive.google.com/drive/u/0/folders/1RmjeKAvef6BXg_qlAl6JnZx2ZkY3qj_3',
        tag: 'Thi Progress Test',
        guide: 'Tải bộ cài SEB và file cấu hình (.seb) của môn thi trước giờ thi 15 phút.'
      },
      {
        id: 'eos',
        name: 'EOS Client (Exam on Online Server)',
        purpose: 'Phần mềm thi Final Exam (Cuối môn)',
        url: 'https://lmsdn.fpt.edu.vn/hd/eos/',
        tag: 'Thi Final Exam',
        guide: 'Lấy mật khẩu EOS tại resetdn.fpt.edu.vn để đăng nhập phòng thi Final.'
      },
      {
        id: 'pea',
        name: 'PEA Client (Practical Exam App)',
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
        name: 'Căn Tin Hương Vị Việt (Tầng 1)',
        image: '/assets/canteen/canteen_menu1.jpg',
        desc: 'Thực đơn tuần từ Thứ 2 đến Thứ 6',
        highlights: [
          'Bữa Sáng: Bún chả cá, bún thịt nướng, cao lầu, mì quảng, xôi gà, bánh bột lọc, bánh mì, hotdog...',
          'Bữa Trưa: Cá mực chiên mắm, sườn non rim me, cánh gà chiên mắm, cơm gà rôti, cơm cuộn kimbap, canh bí đao...',
          'Bữa Tối: Bánh mì que, mì tôm các loại, cơm cuộn kimbap...'
        ]
      },
      {
        id: 'high_deli',
        name: 'The High Deli (Tầng 2)',
        image: '/assets/canteen/canteen_menu2.jpg',
        desc: 'Thực đơn món nước & cơm phần tầng 2',
        highlights: [
          'Bữa Sáng: Mì xào xá xíu, phở bò, phở gà, mì quảng tôm thịt, bún bò, mì Ý...',
          'Bữa Trưa: Gà sốt bơ tỏi, thịt kho tôm, tôm chiên xù, xíu mại viên, sườn nướng, khổ qua xào trứng...',
          'Bữa Tối: Sườn hầm, đùi gà chiên xù, bánh tôm, mì xào thịt, canh cải ngọt...'
        ]
      },
      {
        id: 'fc_canteen',
        name: 'F.C Canteen (Tầng 2)',
        image: '/assets/canteen/canteen_menu3.jpg',
        desc: 'Thực đơn cơm trưa & bún phở sinh viên',
        highlights: [
          'Bữa Sáng: Bún bò, phở bò, phở gà, mì xá xíu, mì Ý, bánh canh...',
          'Bữa Trưa: Đùi gà sốt cay, cánh gà chiên mắm, đùi gà chiên xù, sườn non rim, cá rim ngọt, đậu khuôn sốt cà...'
        ]
      }
    ]
  },

  // 9. SƠ ĐỒ BẢN ĐỒ CAMPUS ĐẠI HỌC FPT ĐÀ NẴNG
  campus_map: {
    title: 'Sơ Đồ Bản Đồ Đại Học FPT Đà Nẵng (FUDA Campus)',
    description: 'Khu đô thị công nghệ FPT, phường Hòa Hải, quận Ngũ Hành Sơn, Đà Nẵng',
    maps: [
      {
        id: 'newbie_k22',
        tabName: 'Bản Đồ Newbie K22',
        title: 'Check Map Trường F Cho Newbie K22',
        subTitle: 'Danh Mục Địa Điểm Newbie K22 Cần Biết',
        image: '/assets/campus/campus_map.webp',
        rawImage: '/assets/campus/campus_map.jpg',
        locations: [
          { num: '1', name: 'Tòa Nhà Alpha', desc: 'Các phòng học, Phòng Dịch vụ sinh viên, Phòng Tuyển sinh, Hệ thống phòng Lab' },
          { num: '2', name: 'Tòa Nhà Gamma', desc: 'Các phòng học, Thư viện, Khu vực Hỗ trợ CNTT, Hệ thống phòng Lab' },
          { num: '3', name: 'Tòa Nhà Beta', desc: 'Phòng học, giảng đường và không gian tự học' },
          { num: '4', name: 'Ký Túc Xá DOM A & DOM B', desc: 'Khu nội trú sinh viên FUDA hiện đại, an ninh và tiện nghi' },
          { num: '5', name: 'Khu Học Võ Vovinam', desc: 'Võ đường Vovinam Việt Võ Đạo rèn luyện thể chất và tinh thần thượng võ' },
          { num: '6', name: 'Căng Tin FUDA', desc: 'Khu ẩm thực 2 tầng: Căn tin Hương Vị Việt, The High Deli và F.C Canteen' },
          { num: '7', name: 'Sân Thể Thao (Bóng Đá & Bóng Rổ)', desc: 'Sân bóng đá cỏ nhân tạo và sân bóng rổ ngoài trời phục vụ rèn luyện' },
          { num: '8', name: 'Khu Street Workout', desc: 'Khu rèn luyện thể hình, xà đơn, xà kép ngoài trời' },
          { num: '9', name: 'Vườn Cây Con Cá & Hồ Sen', desc: 'Khuôn viên sinh thái xanh mát thư giãn giữa các giờ học' },
          { num: '10', name: 'Quảng Trường & Nhà Để Xe', desc: 'Không gian tổ chức sự kiện văn hóa, sinh hoạt chung và bãi đỗ xe máy' }
        ]
      },
      {
        id: 'fuda_overview',
        tabName: 'Sơ Đồ 9 Phân Khu',
        title: 'Sơ Đồ Bản Đồ Quy Hoạch FPTU Đà Nẵng',
        subTitle: 'Danh Mục 9 Phân Khu Campus FUDA',
        image: '/assets/campus/fuda_map.webp',
        rawImage: '/assets/campus/fuda_map.webp',
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
      }
    ],
    mapImage: '/assets/campus/campus_map.webp',
    overviewImage: '/assets/campus/fuda_map.webp',
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
    title: 'Giới Thiệu Tổng Quan FU-DEVER',
    desc: 'Lịch sử, Sứ mệnh, 4 Phân ban chuyên môn và Cơ cấu CLB',
    url: '',
    slides: [
      {
        bg: 'linear-gradient(135deg,#070c18 0%,#0f2240 50%,#081226 100%)',
        content: `
          <div style="text-align:center;padding:12px 0">
            <img src="/assets/logos/dever_logo_nontext.png" style="width:68px;height:68px;object-fit:contain;margin-bottom:6px;filter:drop-shadow(0 0 12px rgba(0,180,255,0.45))" alt="DEVER Logo" />
            <h1 style="font-size:1.85rem;font-weight:900;color:#00B2FF;margin:0 0 4px;letter-spacing:1px">FU-DEVER</h1>
            <p style="font-size:1.02rem;color:#e2e8f0;font-weight:700;margin:0 0 12px">CLB Lập Trình · Đại học FPT Đà Nẵng</p>
            <div style="background:rgba(0,178,255,0.12);border:1px solid rgba(0,178,255,0.35);border-radius:12px;padding:12px 24px;display:inline-block">
              <p style="color:#FFB800;font-size:0.92rem;font-weight:800;margin:0;letter-spacing:0.5px">&ldquo;WORK HARD — PLAY HARD&rdquo;</p>
              <p style="color:#94a3b8;font-size:0.75rem;margin:4px 0 0">Nghiên Cứu · Xây Dựng Dự Án · Tổ Chức Sự Kiện CNTT</p>
            </div>
          </div>
        `
      },
      {
        bg: 'linear-gradient(135deg,#0d172e 0%,#0a1020 100%)',
        content: `
          <h2 style="color:#00B2FF;font-size:1.25rem;font-weight:800;margin:0 0 12px;display:flex;align-items:center;gap:8px">
            Lịch Sử & Tôn Chỉ Hoạt Động
          </h2>
          <div style="display:grid;gap:8px;font-size:0.83rem">
            <div style="background:rgba(0,178,255,0.08);border-left:3px solid #00B2FF;padding:10px 14px;border-radius:0 8px 8px 0">
              <strong style="color:#FFB800">27/10 Hằng Năm:</strong> <span style="color:#e2e8f0">Ngày kỷ niệm thành lập chính thức của FU-DEVER (FPT University Developer).</span>
            </div>
            <div style="background:rgba(0,178,255,0.08);border-left:3px solid #10b981;padding:10px 14px;border-radius:0 8px 8px 0">
              <strong style="color:#10b981">Đơn Vị Trực Thuộc:</strong> <span style="color:#e2e8f0">Cộng đồng sinh viên ĐH FPT Đà Nẵng, hoạt động dưới sự bảo trợ của Phòng IC-PDC.</span>
            </div>
            <div style="background:rgba(0,178,255,0.08);border-left:3px solid #f26f21;padding:10px 14px;border-radius:0 8px 8px 0">
              <strong style="color:#f26f21">Mục Đích Cốt Lõi:</strong> <span style="color:#cbd5e1">Xây dựng môi trường học thuật mở, hỗ trợ dự án thực chiến và tổ chức các sự kiện lập trình quy mô toàn trường.</span>
            </div>
          </div>
        `
      },
      {
        bg: 'linear-gradient(135deg,#070d1e 0%,#151030 100%)',
        content: `
          <h2 style="color:#c084fc;font-size:1.25rem;font-weight:800;margin:0 0 12px;display:flex;align-items:center;gap:8px">
            4 Phân Ban Chuyên Môn Cốt Lõi
          </h2>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div style="background:rgba(0,178,255,0.1);border:1px solid rgba(0,178,255,0.25);border-radius:10px;padding:12px;text-align:left">
              <strong style="color:#00B2FF;font-size:0.86rem;display:flex;align-items:center;gap:6px">Web Development</strong>
              <p style="color:#94a3b8;font-size:0.75rem;margin:4px 0 0">React, Next.js, Node.js, Express, Cloud & REST API kiến trúc phân tán.</p>
            </div>
            <div style="background:rgba(192,132,252,0.1);border:1px solid rgba(192,132,252,0.25);border-radius:10px;padding:12px;text-align:left">
              <strong style="color:#c084fc;font-size:0.86rem;display:flex;align-items:center;gap:6px">AI & Data Science</strong>
              <p style="color:#94a3b8;font-size:0.75rem;margin:4px 0 0">Python, Machine Learning, Deep Learning, Computer Vision, GenAI & LLMs.</p>
            </div>
            <div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.25);border-radius:10px;padding:12px;text-align:left">
              <strong style="color:#10b981;font-size:0.86rem;display:flex;align-items:center;gap:6px">Mobile Development</strong>
              <p style="color:#94a3b8;font-size:0.75rem;margin:4px 0 0">Flutter, React Native, Mobile Architecture & tối ưu giao diện di động.</p>
            </div>
            <div style="background:rgba(255,140,0,0.1);border:1px solid rgba(255,140,0,0.25);border-radius:10px;padding:12px;text-align:left">
              <strong style="color:#fb923c;font-size:0.86rem;display:flex;align-items:center;gap:6px">Game Development</strong>
              <p style="color:#94a3b8;font-size:0.75rem;margin:4px 0 0">Phaser 3, Unity, Godot, 2D Pixel Metaverse & Realtime Socket.io.</p>
            </div>
          </div>
        `
      },
      {
        bg: 'linear-gradient(135deg,#0e1526 0%,#091d2c 100%)',
        content: `
          <h2 style="color:#fbbf24;font-size:1.25rem;font-weight:800;margin:0 0 12px;display:flex;align-items:center;gap:8px">
            Ban Chủ Nhiệm & Bộ Máy Điều Hành
          </h2>
          <div style="display:grid;gap:7px;font-size:0.80rem">
            <div style="background:rgba(255,255,255,0.04);border-radius:8px;padding:8px 12px;display:flex;gap:10px;align-items:flex-start">
              
              <div><strong style="color:#fbbf24">Ban Chủ Nhiệm (BCN):</strong> <span style="color:#cbd5e1">Đặng Quang Nhật (Chủ nhiệm · K20), Nguyễn Thái Hưng (Phó chủ nhiệm · K20), Nguyễn Thị Ngọc Ánh (Thư ký · K20).</span></div>
            </div>
            <div style="background:rgba(255,255,255,0.04);border-radius:8px;padding:8px 12px;display:flex;gap:10px;align-items:flex-start">
              
              <div><strong style="color:#38bdf8">Ban Học Thuật:</strong> <span style="color:#cbd5e1">Lương Văn Tuấn Kiệt (Trưởng ban), Lưu Thành Đạt (Phó ban) · Phụ trách Bootcamp, PE/FE & Workshop.</span></div>
            </div>
            <div style="background:rgba(255,255,255,0.04);border-radius:8px;padding:8px 12px;display:flex;gap:10px;align-items:flex-start">
              
              <div><strong style="color:#f26f21">Ban Sự Kiện & Đối Ngoại:</strong> <span style="color:#cbd5e1">Hồ Quốc Thắng (Trưởng ban · K20), Tạ Thị Bích Loan (Phó ban), Nguyễn Thúc Hoàng Phương (Phó ban).</span></div>
            </div>
            <div style="background:rgba(255,255,255,0.04);border-radius:8px;padding:8px 12px;display:flex;gap:10px;align-items:flex-start">
              
              <div><strong style="color:#c084fc">Ban Truyền Thông:</strong> <span style="color:#cbd5e1">Đoàn Phước Trường Hải (Trưởng ban), Nguyễn Minh Hiển (Phó ban) · Phụ trách Media & Fanpage.</span></div>
            </div>
            <div style="background:rgba(0,178,255,0.08);border-left:3px solid #00B2FF;border-radius:0 8px 8px 0;padding:6px 12px">
              <strong style="color:#00B2FF">Tiểu Ban Kỹ Thuật:</strong> <span style="color:#e2e8f0">Lê Đức Anh Phương (FE), Lê Đình Đăng Khoa (BE), Nguyễn Lê Đăng Thành (Game), Phạm Đức Truyền (Giải thuật).</span>
            </div>
          </div>
        `
      },
      {
        bg: 'linear-gradient(135deg,#0f1a2e 0%,#0a2228 100%)',
        content: `
          <h2 style="color:#10b981;font-size:1.25rem;font-weight:800;margin:0 0 12px;display:flex;align-items:center;gap:8px">
            Dự Án Thực Chiến Nổi Bật
          </h2>
          <div style="display:grid;gap:8px;font-size:0.83rem">
            <div style="background:rgba(16,185,129,0.08);border-left:3px solid #10b981;padding:9px 13px;border-radius:0 8px 8px 0">
              <strong style="color:#10b981">DEVER TOWN:</strong> <span style="color:#e2e8f0">Nền tảng Gather.town 2D kết nối cộng đồng FUDA, 9 phân khu chức năng, minigame realtime.</span>
            </div>
            <div style="background:rgba(56,189,248,0.08);border-left:3px solid #38bdf8;padding:9px 13px;border-radius:0 8px 8px 0">
              <strong style="color:#38bdf8">Bộ Cẩm Nang Ôn Thi PE SWE201c:</strong> <span style="color:#e2e8f0">Học liệu thực hành độc quyền hướng dẫn chi tiết bài tập, lý thuyết và cấu trúc đề thi.</span>
            </div>
            <div style="background:rgba(251,191,36,0.08);border-left:3px solid #fbbf24;padding:9px 13px;border-radius:0 8px 8px 0">
              <strong style="color:#fbbf24">Căn Tin Số & Cổng Tiện Ích:</strong> <span style="color:#e2e8f0">Hệ sinh thái web tra cứu thực đơn, IT Helpdesk, hỗ trợ đời sống sinh viên FPTU Đà Nẵng.</span>
            </div>
            <div style="background:rgba(242,111,33,0.08);border-left:3px solid #f26f21;padding:9px 13px;border-radius:0 8px 8px 0">
              <strong style="color:#f26f21">Đấu Trường Hackathon & ICPC:</strong> <span style="color:#e2e8f0">Đào tạo đội tuyển tham gia các giải thuật toán, lập trình sinh viên quy mô quốc gia.</span>
            </div>
          </div>
        `
      },
      {
        bg: 'linear-gradient(135deg,#1c1204 0%,#2a1c04 50%,#101a2e 100%)',
        content: `
          <h2 style="color:#fbbf24;font-size:1.25rem;font-weight:800;margin:0 0 12px;display:flex;align-items:center;gap:8px">
            Bảng Vàng Thành Tích & Đấu Trường
          </h2>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:0.80rem">
            <div style="background:rgba(251,191,36,0.09);border-left:3px solid #fbbf24;padding:8px 10px;border-radius:0 8px 8px 0">
              <strong style="color:#fbbf24">Quán Quân FPT Hackathon:</strong><br/>
              <span style="color:#cbd5e1">Bảng A Đà Nẵng · Team NEUROSHIP</span>
            </div>
            <div style="background:rgba(242,111,33,0.09);border-left:3px solid #f26f21;padding:8px 10px;border-radius:0 8px 8px 0">
              <strong style="color:#f26f21">Quán Quân Game Craft Arena:</strong><br/>
              <span style="color:#cbd5e1">FPT Đà Nẵng 2025 · Team ĐỘC LẬP</span>
            </div>
            <div style="background:rgba(56,189,248,0.09);border-left:3px solid #38bdf8;padding:8px 10px;border-radius:0 8px 8px 0">
              <strong style="color:#38bdf8">Á Quân 1 DEVFEST AI 2023:</strong><br/>
              <span style="color:#cbd5e1">Khu vực Miền Trung · CLB FU-DEVER</span>
            </div>
            <div style="background:rgba(192,132,252,0.09);border-left:3px solid #c084fc;padding:8px 10px;border-radius:0 8px 8px 0">
              <strong style="color:#c084fc">Chung Kết CodeMosaic 2025:</strong><br/>
              <span style="color:#cbd5e1">4h thi thuật toán · Team DeverLastHope K20</span>
            </div>
            <div style="background:rgba(16,185,129,0.09);border-left:3px solid #10b981;padding:8px 10px;border-radius:0 8px 8px 0">
              <strong style="color:#10b981">ResConnect & ResFes 2026:</strong><br/>
              <span style="color:#cbd5e1">Giải Khuyến khích NCKH & Toàn quốc · Team AI</span>
            </div>
            <div style="background:rgba(244,114,182,0.09);border-left:3px solid #f472b6;padding:8px 10px;border-radius:0 8px 8px 0">
              <strong style="color:#f472b6">Giải Thưởng SHECODES Tech:</strong><br/>
              <span style="color:#cbd5e1">Sản phẩm công nghệ nữ · Team SPOIL</span>
            </div>
          </div>
          <div style="margin-top:8px;background:rgba(255,255,255,0.04);border-radius:6px;padding:6px 12px;font-size:0.75rem;text-align:center;color:#94a3b8">
            Vinh danh các thành viên đạt danh hiệu <strong style="color:#fbbf24">Cóc Vàng FUDA</strong> qua các học kỳ
          </div>
        `
      },
      {
        bg: 'linear-gradient(135deg,#0a1224 0%,#180f28 100%)',
        content: `
          <h2 style="color:#c084fc;font-size:1.25rem;font-weight:800;margin:0 0 12px;display:flex;align-items:center;gap:8px">
            Quyền Lợi & Gia Nhập CLB
          </h2>
          <div style="display:grid;gap:8px;font-size:0.83rem">
            <div style="background:rgba(192,132,252,0.08);border-left:3px solid #c084fc;padding:9px 13px;border-radius:0 8px 8px 0">
              <strong style="color:#c084fc">Quyền Lợi Thành Viên:</strong> <span style="color:#e2e8f0">Học tập theo nhóm chuyên sâu, được mentor kèm 1:1, code dự án thật theo Git Flow và CI/CD.</span>
            </div>
            <div style="background:rgba(0,178,255,0.08);border-left:3px solid #00B2FF;padding:9px 13px;border-radius:0 8px 8px 0">
              <strong style="color:#00B2FF">Đợt Tuyển Quân:</strong> <span style="color:#e2e8f0">Mở đơn vào đầu mỗi học kỳ (Fall, Spring, Summer) dành cho toàn thể sinh viên đam mê CNTT tại FUDA.</span>
            </div>
            <div style="background:rgba(255,255,255,0.04);padding:10px 14px;border-radius:8px;display:flex;justify-content:space-around;text-align:center;margin-top:4px">
              <div><strong style="color:#00B2FF;display:block">Fanpage</strong><span style="color:#94a3b8;font-size:0.75rem">fb.com/FPTUDever</span></div>
              <div><strong style="color:#10b981;display:block">Website</strong><span style="color:#94a3b8;font-size:0.75rem">fudever.com</span></div>
              <div><strong style="color:#f26f21;display:block">Email</strong><span style="color:#94a3b8;font-size:0.75rem">club.dever@gmail.com</span></div>
            </div>
          </div>
        `
      }
    ]
  },
  {
    id: 'main_handbook',
    room: 'main_hall',
    roomName: 'Tòa Alpha',
    title: 'Cẩm Nang Tân Binh FUDA',
    desc: 'Bí kíp sống sót đồ án, OJT và lịch học FPTU',
    url: '',
    slides: [
      {
        bg: 'linear-gradient(135deg,#081020 0%,#162a45 50%,#0c1a2e 100%)',
        content: `
          <div style="text-align:center;padding:12px 0">
            <img src="/assets/stickers/buggy/1.png" style="width:70px;height:70px;object-fit:contain;margin-bottom:6px;filter:drop-shadow(0 0 10px rgba(255,184,0,0.4))" alt="Buggy Mascot" />
            <h1 style="color:#38bdf8;font-size:1.7rem;font-weight:900;margin:6px 0 4px">CẨM NANG TÂN BINH</h1>
            <p style="color:#94a3b8;font-size:0.92rem;margin:0 0 10px">FPT University Đà Nẵng • Khóa K18 - K22</p>
            <div style="background:rgba(56,189,248,0.12);border:1px solid rgba(56,189,248,0.3);border-radius:10px;padding:8px 18px;display:inline-block">
              <span style="color:#fbbf24;font-size:0.82rem;font-weight:700">Tất cả bí kíp học vụ, đồ án & cổng thông tin cần nằm lòng</span>
            </div>
          </div>
        `
      },
      {
        bg: 'linear-gradient(135deg,#0f172a 0%,#1a2744 100%)',
        content: `
          <h2 style="color:#f26f21;font-size:1.25rem;font-weight:800;margin:0 0 12px;display:flex;align-items:center;gap:8px">
            <span>⏰</span> Thời Khóa Biểu & 3 Ca Học FPTU
          </h2>
          <div style="display:grid;gap:8px;font-size:0.84rem">
            <div style="background:rgba(56,189,248,0.1);border-radius:8px;padding:10px 14px;display:flex;gap:12px;align-items:center">
              <div><strong style="color:#38bdf8">Ca Sáng (Ca 1):</strong> <span style="color:#e2e8f0">Slot 1: 07:30–09:00 | Slot 2: 09:15–10:45 | Slot 3: 11:00–12:30</span></div>
            </div>
            <div style="background:rgba(242,111,33,0.1);border-radius:8px;padding:10px 14px;display:flex;gap:12px;align-items:center">
              <div><strong style="color:#f26f21">Ca Chiều (Ca 2):</strong> <span style="color:#e2e8f0">Slot 4: 13:00–14:30 | Slot 5: 14:45–16:15 | Slot 6: 16:30–18:00</span></div>
            </div>
            <div style="background:rgba(16,185,129,0.1);border-radius:8px;padding:10px 14px;display:flex;gap:12px;align-items:center">
              <div><strong style="color:#10b981">Ca Tối (Ca 3):</strong> <span style="color:#e2e8f0">Slot 7: 18:15–19:45 | Slot 8: 20:00–21:30 (Thường dành cho ngoại ngữ/ôn thi)</span></div>
            </div>
            <div style="background:rgba(251,191,36,0.1);border-radius:8px;padding:10px 14px;display:flex;gap:12px;align-items:center">
              <div><strong style="color:#fbbf24">Lưu ý Thi Cử:</strong> <span style="color:#e2e8f0">Thi PE thực hành code phòng máy. Thi FE lý thuyết offline bắt buộc đúng giờ.</span></div>
            </div>
          </div>
        `
      },
      {
        bg: 'linear-gradient(135deg,#0c1a2e 0%,#132438 100%)',
        content: `
          <h2 style="color:#38bdf8;font-size:1.25rem;font-weight:800;margin:0 0 12px;display:flex;align-items:center;gap:8px">
            5 Cổng Thông Tin Bắt Buộc Cần Nằm Lòng
          </h2>
          <div style="display:grid;gap:7px;font-size:0.82rem">
            <div style="background:rgba(255,255,255,0.04);border-left:3px solid #38bdf8;padding:8px 12px;border-radius:0 8px 8px 0">
              <strong style="color:#38bdf8">FAP / myFAP:</strong> <span style="color:#e2e8f0">Tra cứu Thời khóa biểu, điểm danh từng slot, bảng điểm tổng kết và nộp đơn từ trực tuyến.</span>
            </div>
            <div style="background:rgba(255,255,255,0.04);border-left:3px solid #10b981;padding:8px 12px;border-radius:0 8px 8px 0">
              <strong style="color:#10b981">CMS / LMS:</strong> <span style="color:#e2e8f0">Tải tài liệu bài giảng hàng tuần, nộp Assignment và Lab thực hành theo hạn deadline.</span>
            </div>
            <div style="background:rgba(255,255,255,0.04);border-left:3px solid #fbbf24;padding:8px 12px;border-radius:0 8px 8px 0">
              <strong style="color:#fbbf24">FLM (Curriculum):</strong> <span style="color:#e2e8f0">Tra cứu khung chương trình toàn khóa, đề cương môn học (Syllabus) và môn tiên quyết.</span>
            </div>
            <div style="background:rgba(255,255,255,0.04);border-left:3px solid #c084fc;padding:8px 12px;border-radius:0 8px 8px 0">
              <strong style="color:#c084fc">Coursera (Môn đuôi "c"):</strong> <span style="color:#e2e8f0">Học trực tuyến qua tài khoản trường cấp; bắt buộc pass 100% để đủ điều kiện thi thẩm định.</span>
            </div>
            <div style="background:rgba(255,255,255,0.04);border-left:3px solid #f26f21;padding:8px 12px;border-radius:0 8px 8px 0">
              <strong style="color:#f26f21">EduNext:</strong> <span style="color:#e2e8f0">Nền tảng học nhóm, trả lời câu hỏi phản biện và chấm điểm chéo bạn cùng lớp.</span>
            </div>
          </div>
        `
      },
      {
        bg: 'linear-gradient(135deg,#0c1a2e 0%,#1e293b 100%)',
        content: `
          <h2 style="color:#10b981;font-size:1.25rem;font-weight:800;margin:0 0 12px;display:flex;align-items:center;gap:8px">
            4 Quy Chế Đào Tạo Sống Còn
          </h2>
          <div style="display:grid;gap:8px;font-size:0.83rem">
            <div style="background:rgba(239,68,68,0.1);border-left:3px solid #ef4444;padding:8px 12px;border-radius:0 6px 6px 0">
              <strong style="color:#f87171">Chuyên Cần 20%:</strong> <span style="color:#cbd5e1">Nghỉ quá 20% thời lượng slot môn học vì bất kỳ lý do gì sẽ bị đánh trượt (F). Khiếu nại điểm danh trong vòng 48h.</span>
            </div>
            <div style="background:rgba(56,189,248,0.1);border-left:3px solid #38bdf8;padding:8px 12px;border-radius:0 6px 6px 0">
              <strong style="color:#38bdf8">Điều Kiện Đi OJT:</strong> <span style="color:#cbd5e1">Sinh viên phải tích lũy và hoàn thành tối thiểu 90% số tín chỉ khung chương trình trước kỳ thực tập.</span>
            </div>
            <div style="background:rgba(168,85,247,0.1);border-left:3px solid #a855f7;padding:8px 12px;border-radius:0 6px 6px 0">
              <strong style="color:#c084fc">Hạ Bậc Xếp Loại Tốt Nghiệp:</strong> <span style="color:#cbd5e1">Nếu học lại quá 5% tổng số tín chỉ, sinh viên xếp loại Giỏi/Xuất sắc sẽ bị giảm 1 bậc tốt nghiệp.</span>
            </div>
            <div style="background:rgba(251,191,36,0.1);border-left:3px solid #fbbf24;padding:8px 12px;border-radius:0 6px 6px 0">
              <strong style="color:#fbbf24">Thẩm Định Môn Coursera:</strong> <span style="color:#cbd5e1">Bắt buộc tham gia kỳ thi thẩm định offline tại cơ sở trường mới được công nhận điểm chính thức.</span>
            </div>
          </div>
        `
      },
      {
        bg: 'linear-gradient(135deg,#1a1040 0%,#0f172a 100%)',
        content: `
          <h2 style="color:#c084fc;font-size:1.25rem;font-weight:800;margin:0 0 12px;display:flex;align-items:center;gap:8px">
            Bí Kíp Sống Sót Đồ Án & Làm Việc Nhóm
          </h2>
          <div style="display:grid;gap:8px;font-size:0.84rem">
            ${[
              ['1', 'Khởi Động Ngay Từ Tuần 1', 'Không chờ deadline mới lập trình. Lập Backlog và phân công công việc từ ngày đầu tiên.'],
              ['2', 'Phân Chia Trách Nhiệm Minh Bạch', 'Sử dụng Trello/Notion/Jira. Mỗi thành viên chịu trách nhiệm độc lập từng User Story.'],
              ['3', 'Quy Chuẩn Git Flow', 'Phân nhánh feature/..., tuyệt đối không push thẳng main. Viết commit message rõ ràng.'],
              ['4', 'Kết Nối Mentor FU-DEVER', 'Thành viên CLB được mentor 1:1, hỗ trợ tháo gỡ bug hóc búa tại Tòa Gamma Tech Lab.']
            ].map(([icon, title, desc]) => `
              <div style="display:flex;gap:12px;background:rgba(255,255,255,0.05);border-radius:8px;padding:9px 12px;align-items:flex-start">
                <span style="font-size:20px;flex-shrink:0">${icon}</span>
                <div><strong style="color:#c084fc">${title}:</strong> <span style="color:#94a3b8">${desc}</span></div>
              </div>
            `).join('')}
          </div>
        `
      }
    ]
  },
  {
    id: 'lab_roadmap',
    room: 'dever_lab',
    roomName: 'Tòa Gamma',
    title: 'Tech Roadmap 2026',
    desc: 'Lộ trình đào tạo lập trình viên FU-DEVER',
    url: '',
    slides: [
      {
        bg: 'linear-gradient(135deg,#0f172a 0%,#0c1a2e 100%)',
        content: `
          <div style="text-align:center">
            
            <h1 style="color:#38bdf8;font-size:1.6rem;font-weight:900;margin:12px 0 6px">TECH ROADMAP 2026</h1>
            <p style="color:#94a3b8">FU-DEVER • FUDA</p>
            <div style="display:inline-flex;gap:8px;margin-top:14px;flex-wrap:wrap;justify-content:center">
              ${['Game 2D','Web App','AI/ML','Mobile'].map(t => `<span style="background:rgba(242,111,33,0.2);border:1px solid rgba(242,111,33,0.4);color:#f26f21;padding:4px 12px;border-radius:20px;font-size:0.82rem;font-weight:700">${t}</span>`).join('')}
            </div>
          </div>
        `
      },
      {
        bg: 'linear-gradient(135deg,#0c1a2e 0%,#0f172a 100%)',
        content: `
          <h2 style="color:#10b981;font-size:1.2rem;font-weight:800;margin:0 0 12px">Lộ Trình Web Fullstack</h2>
          <div style="display:grid;gap:6px;font-size:0.82rem">
            ${[
              {phase:'Tháng 1-2', items:['HTML/CSS/JS cơ bản','Git & GitHub','Responsive Design'], color:'#38bdf8'},
              {phase:'Tháng 3-4', items:['React.js & Hooks','REST API','Node.js + Express'], color:'#f26f21'},
              {phase:'Tháng 5-6', items:['Next.js (SSR/SSG)','PostgreSQL/MongoDB','Deploy Vercel/Railway'], color:'#10b981'}
            ].map(p => `
              <div style="background:rgba(255,255,255,0.04);border-left:3px solid ${p.color};border-radius:0 8px 8px 0;padding:8px 12px">
                <strong style="color:${p.color}">${p.phase}</strong> &#8212; 
                <span style="color:#94a3b8">${p.items.join(' &bull; ')}</span>
              </div>
            `).join('')}
          </div>
        `
      },
      {
        bg: 'linear-gradient(135deg,#0f172a 0%,#1a0f2e 100%)',
        content: `
          <h2 style="color:#c084fc;font-size:1.2rem;font-weight:800;margin:0 0 12px">Lộ Trình 2D Game Dev</h2>
          <div style="display:grid;gap:6px;font-size:0.82rem">
            ${[
              {phase:'Cơ bản', items:['JavaScript ES6+', 'Canvas 2D API', 'Vật lý tưới'], color:'#fbbf24'},
              {phase:'Phaser 3', items:['Scene System','Tilemap & Collider','Sprite Animation'], color:'#f26f21'},
              {phase:'Multiplayer', items:['Socket.io Real-time','Server Node.js','DB SQLite/Supabase'], color:'#c084fc'}
            ].map(p => `
              <div style="background:rgba(255,255,255,0.04);border-left:3px solid ${p.color};border-radius:0 8px 8px 0;padding:8px 12px">
                <strong style="color:${p.color}">${p.phase}</strong> &#8212; 
                <span style="color:#94a3b8">${p.items.join(' &bull; ')}</span>
              </div>
            `).join('')}
          </div>
        `
      }
    ]
  },
  {
    id: 'lab_git_hackathon',
    room: 'dever_lab',
    roomName: 'Tòa Gamma',
    title: 'Cẩm Nang Hackathon & Git Flow',
    desc: 'Quy trình chạy deadline, phân chia vai trò và Pitching',
    url: '',
    slides: [
      {
        bg: 'linear-gradient(135deg,#0f172a 0%,#1f1a09 100%)',
        content: `
          <div style="text-align:center">
            
            <h1 style="color:#fbbf24;font-size:1.6rem;font-weight:900;margin:12px 0 6px">HACKATHON GUIDE</h1>
            <p style="color:#94a3b8">Quy trình 24h • Từ Ý Tưởng → Sản Phẩm</p>
          </div>
        `
      },
      {
        bg: 'linear-gradient(135deg,#1f1a09 0%,#0f172a 100%)',
        content: `
          <h2 style="color:#fbbf24;font-size:1.2rem;font-weight:800;margin:0 0 12px">&#9201; Dòng Thời Gian 24h</h2>
          <div style="display:grid;gap:7px;font-size:0.83rem">
            ${[
              ['00:00–03:00', 'Brainstorm + Chọn đề tài + Lập plan', '#fbbf24'],
              ['03:00–09:00', 'Dev sprint cật lực — mỗi người 1 module', '#f26f21'],
              ['09:00–15:00', 'Integrate + Test + Fix bug', '#10b981'],
              ['15:00–21:00', 'Slide + Demo + Chuẩn bị Pitch 3 phút', '#38bdf8'],
              ['21:00–24:00', 'Submit + Pitch + Q&A + Celebrate', '#c084fc']
            ].map(([time,task,c]) => `
              <div style="display:grid;grid-template-columns:100px 1fr;gap:10px;background:rgba(255,255,255,0.04);border-radius:8px;padding:8px 12px;align-items:center">
                <span style="color:${c};font-weight:700;font-size:0.78rem">${time}</span>
                <span style="color:#e2e8f0">${task}</span>
              </div>
            `).join('')}
          </div>
        `
      },
      {
        bg: 'linear-gradient(135deg,#0f172a 0%,#0c1a0a 100%)',
        content: `
          <h2 style="color:#10b981;font-size:1.2rem;font-weight:800;margin:0 0 12px">Git Flow Chuẩn CLB</h2>
          <div style="background:#0d1117;border-radius:10px;padding:14px;font-family:monospace;font-size:0.82rem;line-height:1.8;color:#e2e8f0;border:1px solid rgba(255,255,255,0.08)">
            <span style="color:#fbbf24"># Khởi tạo dự án</span><br>
            git checkout -b <span style="color:#10b981">develop</span><br>
            git checkout -b <span style="color:#38bdf8">feature/ten-tinh-nang</span><br><br>
            <span style="color:#fbbf24"># Commit theo format</span><br>
            git commit -m <span style="color:#f26f21">&quot;feat(ui): add login page&quot;</span><br>
            git commit -m <span style="color:#f26f21">&quot;fix(api): null check for user&quot;</span><br><br>
            <span style="color:#fbbf24"># Merge về develop, không push thẳng main!</span><br>
            git checkout develop && git merge feature/...
          </div>
        `
      }
    ]
  },
  {
    id: 'lib_pe_fe',
    room: 'library_lounge',
    roomName: 'Tòa Beta',
    title: 'Tài Liệu Ôn Thi PE & FE',
    desc: 'Bộ đề mẫu + cấu trúc thi thực hành FPTU',
    url: '',
    slides: [
      {
        bg: 'linear-gradient(135deg,#0f172a 0%,#1a2744 100%)',
        content: `
          <div style="text-align:center">
            
            <h1 style="color:#38bdf8;font-size:1.6rem;font-weight:900;margin:12px 0 6px">ÔN THI PE & FE</h1>
            <p style="color:#94a3b8">PRF192 • PRO192 • CSD201 • SWE201c</p>
          </div>
        `
      },
      {
        bg: 'linear-gradient(135deg,#1a2744 0%,#0f172a 100%)',
        content: `
          <h2 style="color:#f26f21;font-size:1.2rem;font-weight:800;margin:0 0 12px">Cấu Trúc Thi</h2>
          <div style="display:grid;gap:8px;font-size:0.85rem">
            ${[
              {mon:'PRF192 (C cơ bản)',pe:'15 MCQ (30p)',fe:'Code thực hành 90p',c:'#38bdf8'},
              {mon:'PRO192 (C OOP)',pe:'20 MCQ (30p)',fe:'OOP Problem 90p',c:'#f26f21'},
              {mon:'CSD201 (CTDL)',pe:'20 MCQ + Trace',fe:'Implement DSA 90p',c:'#10b981'},
              {mon:'SWE201c',pe:'25 MCQ (45p)',fe:'Case study 90p',c:'#c084fc'}
            ].map(r => `
              <div style="background:rgba(255,255,255,0.04);border-left:3px solid ${r.c};border-radius:0 8px 8px 0;padding:8px 12px">
                <strong style="color:${r.c}">${r.mon}</strong><br>
                <span style="color:#94a3b8;font-size:0.78rem">PE: ${r.pe} &bull; FE: ${r.fe}</span>
              </div>
            `).join('')}
          </div>
        `
      },
      {
        bg: 'linear-gradient(135deg,#0f172a 0%,#1a1040 100%)',
        content: `
          <h2 style="color:#c084fc;font-size:1.2rem;font-weight:800;margin:0 0 12px">Tips Ôn Thi Hiệu Quả</h2>
          <div style="display:grid;gap:9px;font-size:0.85rem">
            ${[
              ['\ud83d\udcdd','Làm lại đề cu lầu x3','Không xem đáp án làm lại từ đầu'],
              ['\u23f0','Pomodoro 25-5','25p code, 5p nghỉ. Não hấp thụ tốt hơn'],
              ['\ud83e\udd1d','Học nhóm','Giải thích cho người khác = hiểu sâu nhất'],
              ['\ud83d\udcda','CLB DEVER','Mentor trực tiếp + tài liệu cu mỗi kỳ']
            ].map(([i,t,d]) => `
              <div style="display:flex;gap:10px;background:rgba(255,255,255,0.04);border-radius:8px;padding:9px 12px">
                <span style="font-size:20px;flex-shrink:0">${i}</span>
                <div><strong style="color:#e2e8f0">${t}</strong><br><span style="color:#64748b">${d}</span></div>
              </div>
            `).join('')}
          </div>
        `
      }
    ]
  },
  {
    id: 'lib_icpc',
    room: 'library_lounge',
    roomName: 'Tòa Beta',
    title: '100 Thuật Toán Luyện Thi ICPC',
    desc: 'DP, Graph, Sorting, Segment Tree — tự đánh tay',
    url: '',
    slides: [
      {
        bg: 'linear-gradient(135deg,#0f172a 0%,#1a1040 100%)',
        content: `
          <div style="text-align:center">
            
            <h1 style="color:#c084fc;font-size:1.6rem;font-weight:900;margin:12px 0 6px">100 BÀI CODE</h1>
            <p style="color:#94a3b8">Thuật toán luyện thi ICPC & Competitive Programming</p>
          </div>
        `
      },
      {
        bg: 'linear-gradient(135deg,#1a1040 0%,#0f172a 100%)',
        content: `
          <h2 style="color:#f26f21;font-size:1.2rem;font-weight:800;margin:0 0 12px">Lộ Trình 100 Bài</h2>
          <div style="display:grid;gap:8px;font-size:0.83rem">
            ${[
              {cat:'Bài 1–20: Nền Tảng', items:['Array/String','Sorting cơ bản','Two Pointers','Binary Search'], c:'#38bdf8'},
              {cat:'Bài 21–50: Tư Duy', items:['Recursion & Backtrack','DP cơ bản (knapsack, LCS)','Greedy'], c:'#f26f21'},
              {cat:'Bài 51–80: Đồ Thị', items:['BFS/DFS','Dijkstra/Bellman-Ford','Union Find (DSU)'], c:'#10b981'},
              {cat:'Bài 81–100: Nâng Cao', items:['Segment Tree','Convex Hull','Game Theory'], c:'#c084fc'}
            ].map(g => `
              <div style="background:rgba(255,255,255,0.04);border-left:3px solid ${g.c};border-radius:0 8px 8px 0;padding:8px 12px">
                <strong style="color:${g.c}">${g.cat}</strong><br>
                <span style="color:#94a3b8">${g.items.join(' &bull; ')}</span>
              </div>
            `).join('')}
          </div>
        `
      },
      {
        bg: 'linear-gradient(135deg,#0f172a 0%,#0c1a0a 100%)',
        content: `
          <h2 style="color:#10b981;font-size:1.2rem;font-weight:800;margin:0 0 10px">Mẫu Code: Binary Search</h2>
          <div style="background:#0d1117;border-radius:10px;padding:14px;font-family:monospace;font-size:0.8rem;line-height:1.8;color:#e2e8f0;border:1px solid rgba(255,255,255,0.08);overflow:auto">
            <span style="color:#c084fc">function</span> <span style="color:#38bdf8">binarySearch</span>(arr, target) {<br>
            &nbsp;&nbsp;<span style="color:#c084fc">let</span> lo = <span style="color:#fbbf24">0</span>, hi = arr.length - <span style="color:#fbbf24">1</span>;<br>
            &nbsp;&nbsp;<span style="color:#c084fc">while</span> (lo &lt;= hi) {<br>
            &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#c084fc">const</span> mid = (lo + hi) &gt;&gt; <span style="color:#fbbf24">1</span>;<br>
            &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#c084fc">if</span> (arr[mid] === target) <span style="color:#c084fc">return</span> mid;<br>
            &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#c084fc">else if</span> (arr[mid] &lt; target) lo = mid + <span style="color:#fbbf24">1</span>;<br>
            &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#c084fc">else</span> hi = mid - <span style="color:#fbbf24">1</span>;<br>
            &nbsp;&nbsp;}<br>
            &nbsp;&nbsp;<span style="color:#c084fc">return</span> <span style="color:#fbbf24">-1</span>;<br>
            }
          </div>
        `
      }
    ]
  },
  {
    id: 'canteen_menu',
    room: 'canteen_cafe',
    roomName: 'Căn Tin FUDA',
    title: 'Thực Đơn Căn Tin & Cà Phê Muối',
    desc: 'Menu cơm gà, mì tôm đêm Hackathon & công thức cà phê',
    url: '',
    slides: [
      {
        bg: 'linear-gradient(135deg,#1a0c04 0%,#2d1a08 100%)',
        content: `
          <div style="text-align:center">
            
            <h1 style="color:#fbbf24;font-size:1.6rem;font-weight:900;margin:12px 0 6px">CĂN TIN FUDA</h1>
            <p style="color:#94a3b8">Cơm sinh viên tờ mỏ • Cà phê giữ tiểu tinh</p>
          </div>
        `
      },
      {
        bg: 'linear-gradient(135deg,#2d1a08 0%,#1a0c04 100%)',
        content: `
          <h2 style="color:#f26f21;font-size:1.2rem;font-weight:800;margin:0 0 12px">Menu Hôm Nay</h2>
          <div style="display:grid;gap:8px;font-size:0.85rem">
            ${[
              {name:'Cơm Gà Rán sạch',price:'25.000đ',note:'Best seller • Được cả CLB yêu',e:'\ud83c\udf57'},
              {name:'Bánh mì pa tê trứng',price:'15.000đ',note:'Sore khủng cho buổi sáng',e:'\ud83e\udd56'},
              {name:'Mì tôm trứng (Hackathon)',price:'8.000đ',note:'Staple đêm deploy',e:'\ud83c\udf5c'},
              {name:'Cà phê muối Đà Nẵng',price:'20.000đ',note:'Bí quyết giữ tiỉnh thâu đêm',e:'\u2615'}
            ].map(m => `
              <div style="display:flex;justify-content:space-between;background:rgba(255,255,255,0.05);border-radius:8px;padding:9px 12px;align-items:center">
                <div><span style="font-size:18px">${m.e}</span> <strong style="color:#e2e8f0">${m.name}</strong><br><span style="color:#64748b;font-size:0.76rem">${m.note}</span></div>
                <strong style="color:#fbbf24;font-size:1rem;flex-shrink:0;margin-left:10px">${m.price}</strong>
              </div>
            `).join('')}
          </div>
        `
      },
      {
        bg: 'linear-gradient(135deg,#1a0c04 0%,#0f172a 100%)',
        content: `
          <h2 style="color:#fbbf24;font-size:1.2rem;font-weight:800;margin:0 0 12px">Công Thức Cà Phê Muối</h2>
          <div style="display:grid;gap:8px;font-size:0.85rem">
            <div style="background:#0d1117;border-radius:10px;padding:14px;border:1px solid rgba(242,111,33,0.2)">
              <p style="color:#94a3b8;font-size:0.8rem;margin:0 0 10px">Nguyên liệu cho 1 ly:</p>
              ${['Cà phê đầu 15ml (espresso mạnh)','Muối biển 1/4 muỗng cà phê','Whipped cream (kem tươi đánh bông)','Condensed milk 2 muỗng + đá viên'].map(i => `
                <div style="display:flex;gap:8px;align-items:center;margin:6px 0">
                  <span style="color:#f26f21">•</span><span style="color:#e2e8f0">${i}</span>
                </div>
              `).join('')}
              <p style="color:#64748b;font-size:0.78rem;margin:12px 0 0"><em>Muối triệt tiêu vị đắng → hương cà phê nổi rõ và trộn hơn!</em></p>
            </div>
          </div>
        `
      }
    ]
  },
  {
    id: 'canteen_nutrition',
    room: 'canteen_cafe',
    roomName: 'Căn Tin FUDA',
    title: 'Dinh Dưỡng & Healthy Coding Life',
    desc: 'Chế độ dinh dưỡng giữ tỉnh táo và chống burnout',
    url: '',
    slides: [
      {
        bg: 'linear-gradient(135deg,#0a1f0a 0%,#112211 100%)',
        content: `
          <div style="text-align:center">
            
            <h1 style="color:#10b981;font-size:1.5rem;font-weight:900;margin:12px 0 6px">HEALTHY CODING LIFE</h1>
            <p style="color:#94a3b8">Dinh dưỡng khoa học cho Developer FUDA</p>
          </div>
        `
      },
      {
        bg: 'linear-gradient(135deg,#112211 0%,#0f172a 100%)',
        content: `
          <h2 style="color:#10b981;font-size:1.2rem;font-weight:800;margin:0 0 12px">Thực Phẩm Giữ Tỉnh</h2>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:0.82rem">
            ${[
              {e:'\ud83e\uddd0',name:'Quả óc chó',desc:'Tăng tập trung, tốt cho não',c:'#fbbf24'},
              {e:'\ud83e\ude78',name:'Trứng luộc',desc:'Protein cao, no lâu 4-5h',c:'#38bdf8'},
              {e:'\ud83c\udf4c',name:'Chuối vàng',desc:'Potassium + đường nhanh',c:'#f26f21'},
              {e:'\ud83e\udd6c',name:'Rau cần tây',desc:'Hydrate, giảm stress',c:'#10b981'},
              {e:'\ud83d\udc1f',name:'Cá hồi',desc:'Omega-3, bảo vệ mắt khi code',c:'#c084fc'},
              {e:'\ud83c\udf2d',name:'Yến mạch',desc:'Năng lượng ổn định suốt buổi',c:'#f26f21'}
            ].map(f => `
              <div style="background:rgba(255,255,255,0.04);border-left:3px solid ${f.c};border-radius:0 8px 8px 0;padding:8px 10px">
                <span style="font-size:20px">${f.e}</span> <strong style="color:${f.c}">${f.name}</strong><br>
                <span style="color:#64748b;font-size:0.75rem">${f.desc}</span>
              </div>
            `).join('')}
          </div>
        `
      },
      {
        bg: 'linear-gradient(135deg,#0f172a 0%,#112211 100%)',
        content: `
          <h2 style="color:#38bdf8;font-size:1.2rem;font-weight:800;margin:0 0 12px">Bài Tập Giãn Cơ Cho Dev</h2>
          <p style="color:#64748b;font-size:0.8rem;margin:0 0 10px">Thực hiện mỗi 2 tiếng ngồi code (5 phút)</p>
          <div style="display:grid;gap:7px;font-size:0.83rem">
            ${[
              ['\ud83d\udc40','Mắt','Nhìn xa 6m trong 20 giây. Lặp 3 lần (Quy tắc 20-20-20)'],
              ['\ud83d\udc46','Cổ tay','Xoay cổ tay 10 vòng mỗi hướng. Chống CTS.'],
              ['\ud83e\uddd1\u200d\ud83d\udcbb','Cổ gáy','Ngưới xuống chạm ngực 10 giây, lần lượt trái/phải'],
              ['\ud83d\ude4a','Lưng','Nghiêng người sang 2 bên, giữ 15 giây mỗi bên'],
              ['\ud83d\udc63','Chân','Cầm ghế tại chỗ, gô đạp gót 20 cái, khởi động máu']
            ].map(([i,p,d]) => `
              <div style="display:flex;gap:10px;background:rgba(255,255,255,0.04);border-radius:8px;padding:8px 10px">
                <span style="font-size:18px;flex-shrink:0">${i}</span>
                <div><strong style="color:#38bdf8">${p}:</strong> <span style="color:#94a3b8">${d}</span></div>
              </div>
            `).join('')}
          </div>
        `
      }
    ]
  },
  {
    id: 'memory_awards',
    room: 'memory_room',
    roomName: 'Phòng Kỷ Niệm',
    title: 'Bảng Vàng Vinh Danh',
    desc: 'Bảng vàng thành tích & cúp vô địch các giải đấu lớn của FU-DEVER',
    url: '',
    slides: [
      {
        bg: 'linear-gradient(135deg,#1a1000 0%,#2a1a00 100%)',
        content: `
          <div style="text-align:center">
            
            <h1 style="color:#fbbf24;font-size:1.6rem;font-weight:900;margin:12px 0 6px">BẢNG VÀNG VINH DANH</h1>
            <p style="color:#94a3b8">FU-DEVER • Đấu Trường Công Nghệ & Giải Đấu Sinh Viên</p>
          </div>
        `
      },
      {
        bg: 'linear-gradient(135deg,#2a1a00 0%,#1a1000 100%)',
        content: `
          <h2 style="color:#fbbf24;font-size:1.2rem;font-weight:800;margin:0 0 12px">Cúp Vô Địch & Quán Quân</h2>
          <div style="display:grid;gap:8px;font-size:0.85rem">
            ${[
              {award:'Quán Quân FPT Hackathon Đà Nẵng','team':'Team NEUROSHIP · Bảng A Đà Nẵng','year':'Quán quân','color':'#fbbf24'},
              {award:'Quán Quân Game Craft Arena 2025','team':'Đội Game ĐỘC LẬP · FPT Đà Nẵng','year':'Vô địch','color':'#f26f21'},
              {award:'Á Quân 1 DEVFEST AI Hackathon 2023','team':'CLB FU-DEVER · Khu Vực Miền Trung','year':'Á Quân 1','color':'#38bdf8'}
            ].map(r => `
              <div style="display:flex;justify-content:space-between;background:rgba(251,191,36,0.07);border-left:3px solid ${r.color};border-radius:0 8px 8px 0;padding:9px 14px;align-items:center">
                <div><strong style="color:#e2e8f0">${r.award}</strong><br><span style="color:#94a3b8;font-size:0.78rem">${r.team}</span></div>
                <span style="color:${r.color};font-weight:700;font-size:0.82rem">${r.year}</span>
              </div>
            `).join('')}
          </div>
        `
      },
      {
        bg: 'linear-gradient(135deg,#121b2d 0%,#091220 100%)',
        content: `
          <h2 style="color:#38bdf8;font-size:1.2rem;font-weight:800;margin:0 0 12px">Giải Thưởng & Dấu Ấn Chuyên Môn</h2>
          <div style="display:grid;gap:8px;font-size:0.85rem">
            ${[
              {award:'Chung Kết CodeMosaic 2025','team':'Đội DeverLastHope K20 · Đấu thuật toán 4h','year':'Chung kết','color':'#c084fc'},
              {award:'ResConnect 2026 & FPT Edu ResFes 2026','team':'Team Absolutely Inefficient (AI) · Cú đúp Giải Khuyến khích','year':'ResFes 2026','color':'#10b981'},
              {award:'Giải Thưởng Sáng Tạo SHECODES','team':'SPOIL TEAM · Sản phẩm công nghệ nữ sinh','year':'SheCodes','color':'#f472b6'},
              {award:'Danh Hiệu Cóc Vàng FUDA','team':'Thành viên tiêu biểu CLB qua các học kỳ','year':'Danh hiệu','color':'#fbbf24'}
            ].map(r => `
              <div style="display:flex;justify-content:space-between;background:rgba(255,255,255,0.04);border-left:3px solid ${r.color};border-radius:0 8px 8px 0;padding:8px 14px;align-items:center">
                <div><strong style="color:#e2e8f0">${r.award}</strong><br><span style="color:#94a3b8;font-size:0.78rem">${r.team}</span></div>
                <span style="color:${r.color};font-weight:700;font-size:0.82rem">${r.year}</span>
              </div>
            `).join('')}
          </div>
        `
      }
    ]
  },
  {
    id: 'sports_ergonomics',
    room: 'sports_complex',
    roomName: 'Khu Thể Thao',
    title: 'Điều Lệ DEVER Cup & Giãn Cơ',
    desc: 'Hướng dẫn thi đấu thể thao và bài tập chống đau',
    url: '',
    slides: [
      {
        bg: 'linear-gradient(135deg,#0a1f0a 0%,#112211 100%)',
        content: `
          <div style="text-align:center">
            
            <h1 style="color:#10b981;font-size:1.6rem;font-weight:900;margin:12px 0 6px">DEVER CUP 2026</h1>
            <p style="color:#94a3b8">Điều lệ giải bóng đá giao hữu sinh viên FUDA</p>
          </div>
        `
      },
      {
        bg: 'linear-gradient(135deg,#112211 0%,#0f172a 100%)',
        content: `
          <h2 style="color:#10b981;font-size:1.2rem;font-weight:800;margin:0 0 12px">Điều Lệ Thi Đấu</h2>
          <div style="display:grid;gap:8px;font-size:0.84rem">
            ${[
              ['\ud83d\udc65','Thành Phần','5 người/đội. Tối đa 8 đội/giải. Mỗi người chỉ đăng ký 1 đội.'],
              ['\u23f1️','Thời Gian','2 hiập x 15 phút. Nghỉ 5 phút giữia hiập.'],
              ['\ud83c','Tính Điểm','Thắng 3 điểm, hòa 1, thua 0. Top 2 vào chung kết.'],
              ['\ud83d','Quy Tắc','Không cóm trền bạo lực. Tranh luận lịch sự. Tinh thần fair play.']
            ].map(([i,t,d]) => `
              <div style="display:flex;gap:10px;background:rgba(255,255,255,0.04);border-radius:8px;padding:8px 12px">
                <span style="font-size:20px;flex-shrink:0">${i}</span>
                <div><strong style="color:#10b981">${t}:</strong> <span style="color:#94a3b8">${d}</span></div>
              </div>
            `).join('')}
          </div>
        `
      }
    ]
  }
];

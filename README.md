<div align="center">

# 🎮 DEVER TOWN

### Thế Giới Pixel 2D Multiplayer của CLB FU-DEVER · FPT University Đà Nẵng

[![License: MIT](https://img.shields.io/badge/License-MIT-f26f21.svg?style=for-the-badge)](./LICENSE)
[![Version](https://img.shields.io/badge/version-0.3.0-0066CC.svg?style=for-the-badge)](./package.json)
[![Phaser](https://img.shields.io/badge/Phaser-3.88-22c55e.svg?style=for-the-badge)](https://phaser.io)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101.svg?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)

> **WORK HARD - PLAY HARD** · Không gian sinh hoạt kỹ thuật số dành riêng cho thành viên CLB  
> Gặp gỡ, học tập, tương tác và thi đấu thể thao ảo ngay trong thế giới pixel 2D

🌐 [Landing Page](https://fu-dever-landingpage-v2.vercel.app) &nbsp;·&nbsp; 📘 [Fanpage FU-DEVER](https://www.facebook.com/FPTUDever) &nbsp;·&nbsp; 📝 [Đăng Ký Thành Viên](https://forms.gle/2us1yB5Qp2HYejj28)

</div>

---

## ✨ Tính Năng Nổi Bật

### 🌍 Thế Giới Pixel 2D Multiplayer
- **7 Phòng chức năng** kết nối qua Cổng Dịch Chuyển (Portal): Sảnh Chính, Phòng Lab, Thư Viện Kỹ Thuật, Media Hub, Phòng Họp, Phòng Kỷ Niệm, Khu Phức Hợp Thể Thao FUDA
- **Realtime Multiplayer** — nhìn thấy avatar thành viên khác di chuyển trực tiếp với lerp mượt mà
- **Live Chat** toàn phòng với bong bóng hội thoại bay trên đầu nhân vật, hỗ trợ tiếng Việt đầy đủ dấu

### 🎒 Nhân Vật & Trang Phục
- **Wardrobe Customizer**: Đổi màu áo Hoodie, màu tóc, kiểu tóc, phụ kiện (kính, tai nghe Gaming RGB, Vương miện Cóc Vàng)
- **Nam / Nữ** với preview canvas thời gian thực
- **Túi đồ `[I]`**: Thu thập 7 vật phẩm FPTU — MacBook Pro, Bàn phím cơ Keychron, Gấu Cóc Vàng, Thẻ SV, Cốc Cà Phê Dev, Cúp Hackathon
- Trang bị cầm tay **đồng bộ realtime** cho mọi người chơi khác nhìn thấy

### ⚡ Vùng Tương Tác Chức Năng `[E]`

| Zone | Tính năng |
|:---|:---|
| 📽️ Màn Chiếu Slide | Nhúng Google Slides / Excalidraw bài giảng CLB |
| 💻 Bàn Lập Trình | Live JavaScript Sandbox + Markdown Notepad |
| 🎵 Quầy Lofi Radio | YouTube Lofi embed + Pomodoro Timer 25/5p |
| 🖥️ Phòng Họp Online | Jitsi Meet / Google Meet tích hợp trực tiếp |
| 🏛️ Phòng Kỷ Niệm | Gallery hành trình 9+ năm FU-DEVER |
| 🌐 Media Hub | Fanpage, TikTok FUDA, GitHub Org, Đơn Tuyển Quân |

### ⚽🏀 Minigame Thể Thao Arcade
- **Sút Phạt Đền 11m**: Timing Power Bar + chọn góc sút + AI thủ môn ngẫu nhiên + chuỗi thắng liên tiếp 🔥
- **Ném Bóng Rổ 3 Điểm**: 10 quả/phiên + tỷ lệ chính xác (%) + danh hiệu *Tay Ném Vàng FUDA ⭐*
- Lưu kỷ lục vào Database + Bảng Xếp Hạng top người chơi

### 🔐 Bảo Mật & Hệ Thống
- **JWT Authentication** + bcrypt password hashing
- **Rate Limiter** chống brute-force (30 req/15 phút) + **XSS Sanitization**
- **Hybrid Database**: Tự động dùng JSON file (Local Dev) hoặc PostgreSQL (Production)

### 📱 Đa Nền Tảng
- **Web Responsive** — máy tính, laptop
- **Mobile Touch Controls** — D-Pad ảo + nút `[E]` `[I]` tự động xuất hiện trên điện thoại/máy tính bảng
- **Desktop Native App** — đóng gói thành `.exe` Windows / `.dmg` macOS qua Electron

---

## 🛠️ Tech Stack

```
Frontend     │  Phaser 3.88 (2D Game Engine) + Vite 6 + Vanilla JavaScript ES Modules
Backend      │  Node.js 18+ + Express 4 + Socket.io 4 (WebSocket realtime)
Auth         │  JWT (jsonwebtoken) + bcrypt password hashing
Database     │  JSON File Adapter (Dev) / PostgreSQL — Supabase (Production, auto-detect)
Styling      │  CSS Variables + Glassmorphism Design System
Desktop      │  Electron (optional)
Deploy       │  Vercel (Frontend) + Render.com (Backend) + Supabase (Database)
```

---

## 🚀 Chạy Thử Trên Máy (Local Development)

### Yêu Cầu
- **Node.js** >= 18.0.0 &nbsp;·&nbsp; **npm** >= 9.0.0

### Cài Đặt & Khởi Chạy

```bash
# 1. Clone repo
git clone https://github.com/huanight19RaH/DEVER_TOWN.git
cd DEVER_TOWN

# 2. Cài dependencies
npm install

# 3. Tạo file môi trường
cp .env.example .env

# 4. Chạy cả Frontend + Backend cùng lúc
npm run dev:all
```

Mở trình duyệt tại **http://localhost:3000** và bắt đầu chơi 🎮

```bash
# Hoặc chạy riêng từng phần:
npm run server   # Backend (port 3001)
npm run dev      # Frontend (port 3000)

# Build production
npm run build
```

---

## 🌐 Triển Khai Online — Miễn Phí 100%

### Bước 1 · Tạo Database (Supabase)
Đăng ký tại [supabase.com](https://supabase.com) → **New Project** → Copy **Connection String URI**

### Bước 2 · Deploy Backend (Render.com)
```
Build Command  :  npm install
Start Command  :  npm run server
Env Variables  :
  NODE_ENV     = production
  JWT_SECRET   = <chuỗi bí mật>
  DATABASE_URL = <connection string Supabase>
```

### Bước 3 · Deploy Frontend (Vercel)
```
Env Variables  :
  VITE_SERVER_URL = https://<ten-service>.onrender.com
```

Nhấn **Deploy** → Nhận URL web game multiplayer chạy trực tuyến! 🎉

> Xem hướng dẫn chi tiết từng bước: [`DEPLOYMENT_GUIDE_3_HUONG.md`](./docs/deployment/DEPLOYMENT_GUIDE_3_HUONG.md)

---

## 💻 Desktop App (Electron)

```bash
# Cài Electron (chạy 1 lần)
npm install -D electron

# Mở cửa sổ native app
npm run build
npm run app:desktop

# Xuất file .exe để gửi cho mọi người cài
npm install -D electron-builder
npx electron-builder --win
# → File DeverTown-Setup.exe xuất ra trong thư mục dist_electron/
```

---

## 📁 Cấu Trúc Dự Án

```
DEVER_TOWN/
├── 📁 electron/            # Desktop App (Electron main process)
├── 📁 public/              # Assets tĩnh (favicon, logo, hình ảnh)
├── 📁 server/              # Backend Node.js
│   ├── 📁 db/              # Database Adapters (File / PostgreSQL)
│   ├── 📁 middleware/      # Rate Limiter, XSS Sanitizer, Auth JWT
│   ├── 📁 routes/          # REST API (auth, game scores, leaderboard)
│   ├── 📁 socket/          # Socket.io Realtime Handler
│   └── server.js           # Entry point backend
├── 📁 src/                 # Frontend Source Code
│   ├── 📁 config/          # Game config, maps, controls, i18n
│   ├── 📁 entities/        # Player, RemotePlayer (pixel art)
│   ├── 📁 managers/        # Interaction, Inventory Manager
│   ├── 📁 network/         # Socket.io Client Manager
│   ├── 📁 scenes/          # Phaser Scenes (BootScene, WorldScene)
│   ├── 📁 services/        # Auth Service
│   ├── 📁 styles/          # CSS Design System (Glassmorphism)
│   ├── 📁 ui/              # UI Components (Modal, Chat, Wardrobe, TouchControls...)
│   └── 📁 utils/           # TextureGenerator, AudioManager (Web Audio API)
├── index.html              # App Entry HTML
├── vite.config.js          # Vite Build Config
├── render.yaml             # Render.com Deploy Config
├── vercel.json             # Vercel Deploy Config
└── package.json
```

---

## 🎮 Phím Điều Khiển

| Hành động | Phím |
|:---|:---|
| Di chuyển | `W A S D` hoặc `↑ ← ↓ →` |
| Tương tác với Zone | `E` (khi đứng trong vùng sáng) |
| Mở Túi đồ | `I` |
| Đóng Modal | `Escape` |
| Fullscreen Desktop | `F11` |
| **Mobile** | D-Pad ảo + nút `E` / `I` cảm ứng xuất hiện tự động |

---

## 🤝 Đóng Góp

Pull requests luôn được chào đón! Quy trình chuẩn:

1. **Fork** repo này
2. Tạo branch mới: `git checkout -b feat/ten-tinh-nang`
3. Commit rõ ràng: `git commit -m "feat: mô tả ngắn gọn"`
4. Mở **Pull Request** với mô tả đầy đủ

> ⚠️ Vui lòng đọc [`AGENTS.md`](./AGENTS.md) trước khi chỉnh sửa — đặc biệt là quy tắc **Zero-Regression** khi sửa map, portal, spawn points để không ảnh hưởng các phòng khác.

---

## 📜 License

Dự án được phát hành dưới giấy phép **[MIT License](./LICENSE)**.

© 2026 **FU-DEVER Club · FPT University Đà Nẵng (FUDA)**  
Tác giả: [RaH11](https://github.com/huanight19RaH) · `hungnguyen.190206@gmail.com`

---

<div align="center">

**Made with ❤️ by FU-DEVER · WORK HARD - PLAY HARD**

[🌐 Landing Page](https://fu-dever-landingpage-v2.vercel.app) &nbsp;·&nbsp;
[📘 Fanpage FU-DEVER](https://www.facebook.com/FPTUDever) &nbsp;·&nbsp;
[🏛️ Fanpage FUDA](https://www.facebook.com/daihocfptdanang) &nbsp;·&nbsp;
[🎵 TikTok FUDA](https://www.tiktok.com/@daihocfptdanang) &nbsp;·&nbsp;
[🐙 GitHub Org](https://github.com/fudever-club)

</div>

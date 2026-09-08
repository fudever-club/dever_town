# Changelog

All notable changes to **DEVER TOWN** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),  
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added — Reliable Daily Momentum
- Thêm Daily Goal HUD gọn, responsive và truy cập được để chỉ ra mục tiêu tiếp theo, tiến độ rương ngày, trạng thái lưu local/tài khoản và thao tác retry.
- Thêm behavioral E2E cho claim reward, reload, hydration tài khoản, offline retry, serialized sync, achievement và bố cục mobile.
- Khởi tạo roadmap + project wiki cho chiến lược retention có metric và guardrail rõ ràng.

### Fixed
- Hợp nhất điểm, daily quest, achievement và authenticated profile sync theo local-first state path; batch sync được debounce, tuần tự hóa và phục hồi đầy đủ sau lỗi mạng.
- Giữ explorer progress đơn điệu qua reload và chỉ khởi tạo daily session sau khi danh tính người chơi đã sẵn sàng.
- Khôi phục trigger thật cho `speed_coder`, `striker`, `tech_pro`; Speed Code Duel không còn ghi nhầm tiến trình Pomodoro.
- Sửa stress-test JavaScript, room IDs và summary teardown; đồng bộ copy 9 khu cùng version `v0.4.1`.

---

## [0.4.1] — 2026-09-04

### Fixed & Enhanced — Autonomous Gameplay Audit & Layout Polish
- **Autonomous In-Game Playthrough Tooling** (`scripts/play_game_audit.js`): Kịch bản tự hành toàn diện kiểm tra tương tác Cóc Vàng, mở túi đồ, kích hoạt thanh biểu cảm, nhảy múa, giải đố Speed Duel và chuyển phòng.
- **Radar HUD Footer Isolation**: Căn chỉnh `position: fixed; bottom: 96px; left: 20px;`, loại bỏ triệt để xung đột chồng đè với thanh Footer và điều hướng WASD.
- **Dynamic Text Width Clamping**: Bổ sung ước lượng chuỗi ký tự tự động `Math.max(label.width, text.length * 8 + 16)` cho toàn bộ nhãn cổng dịch chuyển và huy hiệu zone, ngăn chặn xén chữ mép màn hình.
- **Header Button Streamlining**: Rút gọn văn phong nút bấm trên Header Desktop, giải phóng không gian cho bộ đếm điểm nhiệm vụ hiển thị trọn vẹn 100%.
- **Global Shortcut KeyZ**: Đăng ký sự kiện bàn phím toàn cục cho Speed Code Duel.
- **Overlay Centering on Game Canvas**: Căn giữa Emote Bar, Room Arrival Banner và Achievement Toast theo trục tâm màn hình game 800px.
- **Vertical Staggering for Nearby Labels**: Tự động so le trục Y (`posY - 32` vs `posY - 16`) cho các nhãn zone và portal nằm liền kề.

---

## [0.4.0] — 2026-09-04

### Added — Gamification, Juice & Ambient Environment Engine
- **Dynamic Ambient Particle Engine** (`AmbientEnvironmentManager.js`): Hạt WebGL 60fps mô phỏng khí quyển đặc thù cho 9 phòng (cánh hoa trà, khói cafe, hạt neon lab, bụi nắng thư viện, bọt nước thể thao, tia lửa arcade, bụi bước chân).
- **Game Feel & "Juice" Feedback** (`JuiceManager.js`): Chữ số bay đàn hồi (Floating Combat/Score Text), micro-camera shake 120ms, pháo hoa Confetti ăn mừng và nhịp nảy DOM Pulse.
- **Achievement Mastery System** (`AchievementManager.js`): 8 danh hiệu kỷ lục độc bản (*Tân Thủ DEVER, Coder Thần Tốc, Cà Phê Muối Đà Nẵng, Lộc Cóc Vàng, Tiền Đạo FUDA, Tín Đồ Công Nghệ, Vũ Công Sàn Diễn, Sinh Viên Gương Mẫu*), slide-in Golden Toast Banner với kèn Fanfare 8-bit.
- **Radar Minimap HUD** (`MinimapOverlay.js`): Quét 2D 25x19 realtime, hiển thị vị trí người chơi và tương tác; auto-collapse trên mobile.
- **Speed Code Duel** (`SpeedCodeDuel.js`): Minigame 10 câu hỏi thuật toán/toán nhẩm nhịp độ cao, hệ số nhân combo (`x1.5` -> `x3 🔥🔥`).
- **Quick Emotes & Dance Wheel** (`EmoteBar.js`): 6 biểu cảm tương tác với animation nhún nhảy sprite theo nhịp điệu.
- **Live Campus Ticker** (`CampusTicker.js`): Thanh tin tức trực tiếp luân phiên cập nhật mẹo khám phá ở chân trang.
- **Chiptune 8-Bit BGM Synthesizer**: Trình tổng hợp âm thanh Web Audio API procedural không cần tải file ngoài.
- **Linh Vật Cóc Vàng Tâm Linh**: Tương tác rút quẻ bói vận may hàng ngày (Thượng Thượng Quẻ, Đại Cát).

### Added — Mobile Ergonomics & Quality Assurance
- **Dual-Row Thumb Arc Ergonomics**: Bố trí cụm nút điều khiển ngón cái khoa học (`[⚡]`, `[✨]`, `[💬]`, `[🎒]`, `[🅴]`).
- **Zero-Overflow Mobile Viewports**: Tối ưu hóa tuyệt đối cho iPhone SE (375px), iPhone 14 (390px), Galaxy S20 (412px) và iPad Mini (768px).
- **Playwright Test Suite**: 58 bài kiểm thử tự động (100% pass rate) kiểm soát toàn vẹn hệ thống và an toàn bản đồ.

### Added — Database & Security
- **PostgreSQL Supabase Production Pooler**: Kết nối trực tiếp AWS Singapore qua SSL tự động, tạo schema bảng `users`, `game_scores`, `password_resets`.
- **API Documentation**: Tài liệu kỹ thuật chi tiết tại `docs/API_DOCUMENTATION.md`.

---

## [0.3.0] — 2026-08-27

### Added — 3-Way Deployment Support
- **Mobile Touch Virtual Controls**: D-Pad ảo 4 hướng + nút cảm ứng `[E]` `[I]` `💬` tự động xuất hiện trên thiết bị <= 1024px
- **Responsive CSS `@media`**: Canvas game scale đúng tỷ lệ 4:3 trên mọi kích thước màn hình
- **Electron Desktop App**: `electron/main.cjs` + script `npm run app:desktop` để chạy cửa sổ native
- **`render.yaml`**: 1-click deploy backend lên Render.com
- **`vercel.json`**: SPA routing + security headers cho Vercel frontend
- **`VITE_SERVER_URL`**: Hỗ trợ biến môi trường Vite để cấu hình backend URL khi deploy

### Added — Plan Add-on v3 (Security, Minigames, Onboarding, Links)
- **Rate Limiter** (`server/middleware/rateLimiter.js`): Sliding window 30 req/15 phút cho `/api/auth`, chống brute-force
- **XSS Input Sanitizer**: Lọc ký tự HTML nguy hiểm khỏi mọi request body
- **Customization Persistence**: `PUT /api/auth/customization` lưu Wardrobe config và equipped item vào DB
- **Game Scores API**: `POST /api/game/score` + `GET /api/game/leaderboard/:gameType`
- **FileDatabaseAdapter nâng cấp**: `saveGameScore()`, `getLeaderboard()`, `updateCustomization()`
- **PostgresDatabaseAdapter nâng cấp**: Schema migration cho bảng `game_scores`, `UPSERT` kỷ lục
- **Timing Arcade Sports Minigames**:
  - ⚽ Penalty Shootout: Power Bar + chọn hướng + AI thủ môn ngẫu nhiên + Streak tracking
  - 🏀 Basketball 3-Point Shootout: 10 quả/phiên + tỷ lệ chính xác + danh hiệu Tay Ném Vàng
- **First-time Onboarding Guide**: Overlay hướng dẫn WASD, `[E]`, `[I]`, Portal — tự ẩn sau lần đầu
- **Official Links**: Form tuyển quân `forms.gle/2us1yB5Qp2HYejj28`, Fanpage FU-DEVER & FUDA, TikTok FUDA
- **WardrobeModal**: Tự động sync cấu hình lên DB khi bấm Áp Dụng
- **InventoryManager**: Tự động sync equipped item lên DB khi trang bị / tháo vật phẩm

### Added — Project Files
- `README.md`: Tài liệu dự án đầy đủ với badges, tech stack, setup guide
- `LICENSE`: MIT License
- `CONTRIBUTING.md`: Hướng dẫn đóng góp
- `CODE_OF_CONDUCT.md`: Bộ quy tắc ứng xử cộng đồng
- `CHANGELOG.md`: File này
- `.env.example`: Template biến môi trường
- `DEPLOYMENT_GUIDE_3_HUONG.md`: Hướng dẫn triển khai 3 hướng chi tiết

---

## [0.2.5] — 2026-08-27

### Fixed
- Media Hub portal bị chặn bởi kệ sách ở `main_hall` row 13 — đã mở thông đường
- Chat input box bị hiển thị lỗi (quá nhỏ, mất styling) — đã fix CSS selector
- Modal kích thước nhỏ khó tương tác — nâng cấp lên `95vw / 88vh`

### Added — Dever Town Engineering Skill
- Tạo skill `dever-town-engineering` với quy tắc Zero-Regression
- Hệ thống Multi-Agent Sub-agent Delegation workflow
- Web Audio API 8-bit sound effects (AudioManager.js)
- Internationalization i18n Tiếng Việt / English
- Settings modal (âm lượng, ngôn ngữ, controls guide)

---

## [0.2.0] — 2026-08-26

### Added — Expansion v3 (7 Rooms, Inventory, Wardrobe, Sports Complex)
- Mở rộng từ 5 lên **7 phòng** với layout 25×19 tiles (800×608px)
- **Khu Phức Hợp Thể Thao FUDA** (`sports_complex`): sân bóng đá, bóng rổ, cầu lông, hồ bơi
- **Media Hub** (`media_hub`): 4 trạm truyền thông CLB
- **Inventory System** `[I]`: 7 vật phẩm FPTU, pickup spots, cầm tay đồng bộ realtime
- **Wardrobe Customizer**: 5 màu áo, 6 màu tóc, 4 kiểu tóc, 4 phụ kiện, preview live canvas
- **Animated Beacons**: Vòng sáng nhấp nháy + floating badge trên mọi zone tương tác
- **Smart YouTube URL Loader**: Nhận diện tất cả dạng link YouTube
- 5 Lofi Presets tuyển chọn

---

## [0.1.0] — 2026-08-25

### Added — Core Foundation
- Phaser 3 + Vite 6 game engine setup
- Pixel art TextureGenerator (canvas procedural generation)
- WASD + Arrow keys movement với Vector Normalization
- Arcade Physics hitbox (18×14px chân nhân vật)
- Realtime Multiplayer (Node.js + Socket.io + lerp interpolation)
- Live Chat + Speech Bubble trên đầu nhân vật
- JWT Authentication + bcrypt + Hybrid PostgreSQL/JSON Database
- Multi-Room Portal system (7 phòng, cooldown 1.5s)
- Interactive Zones với Proximity Detection (Hysteresis algorithm)
- Avatar system (4 role badges: Admin, Leader, Dev, Guest)

---

[0.3.0]: https://github.com/huanight19RaH/DEVER_TOWN/compare/v0.2.5...v0.3.0
[0.2.5]: https://github.com/huanight19RaH/DEVER_TOWN/compare/v0.2.0...v0.2.5
[0.2.0]: https://github.com/huanight19RaH/DEVER_TOWN/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/huanight19RaH/DEVER_TOWN/releases/tag/v0.1.0

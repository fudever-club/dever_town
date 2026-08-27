# Changelog

All notable changes to **DEVER TOWN** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),  
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

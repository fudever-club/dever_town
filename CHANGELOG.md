# Changelog

All notable changes to **DEVER TOWN** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),  
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [Unreleased]

---

## [0.7.1] — 2026-09-14

### Added — Pokémon FireRed/HGSS 48×64 Sprite Engine Overhaul
- **Frame Size nâng cấp 48×64 px**: Spritesheet mới `192×256 px` (4 cột × 4 hàng), thay thế chuẩn cũ — nhân vật sắc nét, chi tiết giải phẫu rõ ràng và đẹp mắt tại mọi mức zoom màn hình.
- **Walk Animation 4 Frames Thực Thụ**: Arm swing rõ ràng — Frame 0 neutral thả tay, Frame 1 bước chân trái & tay phải vung trước, Frame 2 mid-stride, Frame 3 bước chân phải & tay trái vung trước. Đúng chuẩn chuyển động nhân vật Pokémon GBA.
- **Idle Breathing Animation**: Hoạt ảnh `idle_breathe` 2-frame với chu kỳ co giãn ngực `scaleY 1.0 ↔ 1.01` tần suất 0.8fps — nhân vật đứng yên có nhịp thở sống động.
- **Face & Anatomy Chi Tiết Cao**: Đôi mắt 3×2px có đốm sáng phản quang (catchlight), miệng 4×1px, điểm mũi 1px — thể hiện rõ cảm xúc khuôn mặt.
- **20 Hairstyles + 15+ Outfits + Accessories Rescale**: Toàn bộ trang phục, kiểu tóc và phụ kiện đã được tái cấu trúc tọa độ và tỷ lệ hiển thị khớp chuẩn 48×64.
- **`generateNPCPortrait(scene, config, key)`**: Trình sinh đồ họa Canvas tạo chân dung bán thân (Half-body shot 80×96 px) phục vụ đối thoại tương tác.

### Added — NPC System v1.0
- **`src/entities/NPC.js`**: Lớp thực thể NPC độc lập với máy trạng thái FSM 3 cấp (`idle → aware → talking`), breathing tween, bán kính phát hiện tương tác 80px, tự động quay mặt về người chơi (`lookAtPlayer`).
- **`src/config/npcs.js`**: Hệ thống 8 NPC đặc trưng trải đều 8 phân khu sinh hoạt:
  - *Sảnh Alpha*: Mentor Thinh (Senior Dev • Web Team)
  - *Căn Tin & Cafe*: Barista An (Quán Cà Phê FUDA)
  - *Thư Viện Tri Thức*: Thủ Thư Linh (Library Keeper)
  - *Tech & AI Lab*: Gamer Bảo (Game Team Lead)
  - *Khu Thể Thao*: HLV Minh (Sports Coach)
  - *Media Hub*: Phóng Viên Hà (Media Hub Reporter)
  - *Phòng Kỷ Niệm*: Sử Quan Đức (Lịch Sử CLB)
  - *Không Gian Web*: Senior Dev Khoa (Full-Stack • AI Team)
- **Hộp Thoại Hội Thoại Pokémon HGSS (`NPCDialogueModal.js`)**:
  - Khung hội thoại trượt nổi slide-up từ cạnh dưới màn hình.
  - Chân dung NPC 80×96 px sắc nét, nhãn tên và chức vụ nổi bật.
  - Hiệu ứng máy đánh chữ (Typewriter Effect) tốc độ 30ms/ký tự.
  - Phím `[E]` hoặc `Space` chuyển câu nhanh / skip hiển thị, `[F]` hoặc `Esc` đóng hội thoại tức thì.
  - Tự động khóa di chuyển nhân vật trong lúc đang đối thoại, tránh trôi vị trí.
- **`···` Speech Indicator Bubble**: Bong bóng dấu ba chấm nhấp nháy bồng bềnh trên đầu NPC khi người chơi bước vào bán kính gần (không dùng emoji thô sơ).
- **WorldScene Integration**: Tự động spawn danh sách NPC khi chuyển phòng (`loadRoom`), cập nhật vòng lặp khoảng cách và ưu tiên phím `[E]` tương tác NPC trước zone.

### Fixed & Enhanced — Arcade & Sports Engine Polish
- **Volleyball Rally**: Sửa triệt để lỗi `rallyCount` không reset khi người chơi ghi điểm; đồng bộ giới hạn biên lưới `net.x - 30`; bổ sung tỷ lệ đánh trượt 25% cho Bot AI giúp trận đấu chân thực hơn; nâng cấp nền khán đài gradient và vạch phân làn nét đứt.
- **Basketball Shootout**: Bổ sung thanh đo lực ném (Power Bar) 3 màu trực quan (xanh/vàng/đỏ); thêm cơ chế dao động góc ném parabol 40°–70°; phủ ánh sáng đèn rọi spotlight từ đỉnh trần.
- **Penalty Shootout**: Bổ sung đường ngắm chấm nét đứt và hồng tâm vàng góc chữ A khi lấy đà sút; thêm dải gradient bầu trời đêm và đèn pha sân vận động.
- **Gold Miner**: Thêm cơ chế kiểm tra khoảng cách spawn chống hiện tượng khoáng sản đè chồng lên nhau; bổ sung hiệu ứng hào quang phát sáng `shadowBlur=12` cho kim cương và vàng lớn; văng tia lửa đất đá khi móc trúng.
- **Snake**: Vẽ thân rắn nối liền dạng vector path bo tròn mượt mà thay vì các chấm tròn rời rạc; sửa thuật toán nam châm (Magnet) hút mồi tiệm cận chính xác về ô; thêm viền cảnh báo nguy hiểm đỏ khi áp sát mép tường.
- **System & Engine**:
  - BUG-005: Tọa độ spawn cầu thang đọc tự động từ `floorData.spawnPoint` thay vì hardcode.
  - BUG-007: Emote float tween bám theo tọa độ người chơi theo thời gian thực (`onUpdate`).
  - BUG-008: Cơ chế dọn dẹp texture key an toàn với try-catch và bộ đệm 500ms chống rò rỉ VRAM.
  - Hitbox vật lý: Chuẩn hóa body `24×10px, offset (12, 54)` khớp với chân nhân vật 48×64.
  - Đồng bộ chiều sâu: Chuẩn hóa y-offset cho bóng đổ `y+30`, depth sorting `y+30`, thẻ tên `y-38`, bong bóng thoại `y-64`.

---

## [0.7.0] — 2026-09-10

### Added — HD Character Graphics 48x48, In-Hand Equipment & Profile Sync (PLAN_v0.7)
- **Đồ Họa Nhân Vật HD 48x48 Pixel Grid**: Nâng cấp từ 32x32 lên 48x48 pixel (tăng gấp 2.25 lần mật độ điểm ảnh), khắc họa giải phẫu cơ thể sinh viên Nam & Nữ FUDA rõ ràng.
- **Kiến Trúc 7 Lớp Đồ Họa Độc Lập (Layered Compositor 2.0)**:
  - Layer 1: Base Body & 6 tông màu da (Trắng sáng, Vàng tự nhiên Á Đông, Bánh mật, Nâu khỏe, Ngăm đậm, Cyborg Android).
  - Layer 2: Quần tây, quần jean nếp gấp 3D, váy xếp ly, giày sneaker thể thao đế cao su.
  - Layer 3: Áo Polo FPTU gập cổ, Hoodie cam/xanh, Áo dài thướt tha, võ phục Vovinam, vest CEO, hacker matrix,...
  - Layer 4: Mắt 3x3px có đốm sáng phản quang (catchlight), chớp mắt tự nhiên Blink Loop mỗi 3.5s, 5 biểu cảm khuôn mặt.
  - Layer 5: Bộ sưu tập 21 kiểu tóc 3 lớp sáng tối highlight (Undercut, Wolf cut, Hime cut, Ponytail, Bald Senior Dev,...).
  - Layer 6: Bộ sưu tập râu & phụ kiện (Râu quai nón Senior Dev, ria mép, râu lún phún deadline, kính cận, tai nghe RGB).
  - Layer 7: In-Hand Equipment cầm tay trực tiếp.
- **Trang Bị Cầm Tay Thực Tế `[I]` (In-Hand Equipment)**: Gắn trực tiếp lên tay nhân vật thay cho bong bóng lơ lửng cũ (MacBook Pro Dev, Ly cà phê muối bốc khói, Cờ CLB, Gấu bông Cóc Vàng, Quả bóng thể thao,...).
- **Hồ Sơ Cá Nhân & Đồng Bộ Thành Tích Thể Thao**: Tự động đồng bộ các kỷ lục penalty streak, basketball high, volleyball rally và điểm barista lên cơ sở dữ liệu qua `syncFullProfile`.

---

## [0.6.0] — 2026-09-10

### Added — Arcade & Sports Minigame Overhaul 2.0 (PLAN_v0.6)
- **Kiến Trúc Sub-Engine Facade Mới**: Tách nhỏ hệ thống minigame thành các engine độc lập, dễ bảo trì và mở rộng:
  - `PenaltyShootoutEngine`: Sút phạt đền 11M, sút bóng cong 3D parabol, hàng rào người nhảy chắn, bia hồng tâm góc chữ A, thủ môn AI bay người cản phá, đổi vai làm thủ môn đeo găng bắt bóng, lưới khung thành lò xo đa điểm Spring-Mass Grid.
  - `BasketballShootoutEngine`: Quỹ đạo ném xiên vật lý, va chạm đàn hồi bảng rổ mica & chốt vành kim loại (Rim Rattle), cơ chế SWISH xé lưới, chuỗi bốc lửa ON FIRE! 🔥, trụ rổ di chuyển đung đưa ở điểm cao.
  - `VolleyballRallyEngine`: Vật lý vòm đầu bán nguyệt đàn hồi cao, bật nhảy đập bóng Power Spike Jump dồn vệt lửa, va chạm lưới giữa sân có positional separation triệt tiêu kẹt bóng.
  - `BaristaSimulatorEngine`: Mô phỏng pha chế 4 trạm tương tác (đong đá, rót cà phê, bọt kem béo muối hồng, vẽ Latte Art tự do), mô phỏng vật lý phân tầng chất lỏng.
  - `SnakeEngine`: Chuyển động trườn 60fps mượt mà, cơ chế Xả thân bứt tốc (Boost-Burn), 5 loại vật phẩm (táo, ớt tốc độ, nam châm hút mồi), đầu rắn Buggy có mắt chuyển hướng.
  - `SokobanEngine`: 15 màn giải đố Microban kinh điển, hỗ trợ Undo không giới hạn, sàn trượt băng quán tính, nút dẫm áp lực và cổng teleport.
  - `GoldMinerEngine`: Dây tời xích sắt cơ học, móc kẹp kim loại đóng mở tự nhiên, nổ dây chuyền thùng thuốc nổ TNT, 7 loại khoáng sản, kíp nổ Dynamite hủy vật nặng.
- **Hệ Thống Game Feel "Juice" (`CanvasJuiceFX.js`)**: Tích hợp rung chấn camera screen shake, pháo hoa giấy Confetti, chữ điểm bay đàn hồi floating text, tia lửa hạt va chạm.

---

## [0.5.0] — 2026-09-10

### Added — Social Features & Friend System
- **Player Profile Modal**: Hồ sơ cá nhân hiển thị trang phục, kỷ lục minigame và danh sách thành tựu.
- **2-Way Realtime Friend Request Handshake** (`FriendManager.js`): Lời mời kết bạn 2 chiều qua Socket.io; modal duyệt lời mời với nút Đồng Ý / Từ Chối.
- **Bestie Streak** — chuỗi ngày tương tác liên tiếp giữa 2 người chơi, reset về 1 khi bị đứt quá 1 ngày.
- **Buggy Pet Companion** — linh vật tiến hóa 4 cấp (`Trứng Ấp Ủ → Chibi → Kỹ Sư → Hoàng Gia`) theo streak, hiển thị follower trên bản đồ.
- **Taskbar Friends Menu** — menu nổi trên thanh Footer truy cập nhanh danh sách bạn bè, tìm kiếm theo Player ID, direct chat.
- **Private Direct Chat** — mở kênh chat riêng tư theo tên/ID mà không cần cùng phòng.

### Added — Guest-to-Account Progression Merge (RET-008)
- **`captureGuestSnapshot()`** trong `AuthService`: Chụp toàn bộ tiến trình Guest từ localStorage trước khi overwrite.
- **`mergeGuestProgressToAccount()`**: Merge an toàn khi Guest đăng nhập/đăng ký — `MAX(points)`, `MAX(quest progress per quest)`, `Union(items, friends, rooms)`. Không cộng dồn điểm tránh farming.
- Hook vào cả `login()`, `register()`, `loginWithGoogle()` — merge chỉ khi snapshot hợp lệ, sync best-effort không block flow đăng nhập.

### Added — Privacy-safe Journey Telemetry (INS-001)
- **`src/utils/Telemetry.js`**: Module offline-first, buffer localStorage tối đa 200 events, flush định kỳ 60s hoặc khi đầy lên `/api/telemetry/batch`. Whitelist cứng: chỉ `room_id`, `quest_id`, `action_type`, `minigame_type`, `score`, `is_guest` — nghiêm cấm lưu tên, email, IP, nội dung chat.
- **`POST /api/telemetry/batch`** (`server/routes/telemetryRoutes.js`): Endpoint append-only JSONL, validate whitelist server-side, rate-limited 60 req/phút, không yêu cầu JWT.
- **Wire vào game**: `world_entered` khi vào session, `room_visit` khi qua portal, `quest_claimed` khi nhận thưởng, `meaningful_action` khi tăng tiến trình quest.
- **`scripts/heart_dashboard.js`**: Script Node.js đọc `telemetry_log.jsonl` và xuất báo cáo HEART baseline (Happiness, Engagement, Adoption, Retention, Task Success).

### Added — WebRTC Voice Chat (Discord-style Sync Lounge)
- **`VoiceService.js`**: WebRTC P2P Mesh với `RTCPeerConnection`, Socket.io signaling, Listen-Only fallback khi không có microphone.
- Tự động theo dõi thay đổi quyền micro (PermissionStatus API), nâng cấp từ listen-only lên active khi được cấp quyền.
- Phân biệt rõ `NotFoundError` (không có phần cứng) vs permission denial.

### Added — Hall of Fame (SOC-001 partial)
- 7 giải thưởng chính thức của CLB tích hợp vào slides Sảnh Alpha và Memory Room.
- Canvas art Award Gallery với navigation buttons đã fix.

### Added — Phase 1 Security Hardening
- **Socket Rate Limiter** (`server/utils/rateLimiter.js`): Sliding-window per-event và cooldown limiter chống spam/DDoS cho mọi socket event.
- **XSS Sanitizer** (`src/utils/sanitize.js`): `escapeHtml()`, `sanitizeName()`, `sanitizeChatMessage()` áp dụng cho mọi user input trước khi render vào DOM.
- Auth Middleware và SocketHandler hardening chống injection và replay.

### Added — Phase 1 Performance Optimization
- **TilePool Object Pooling** (`src/utils/TilePool.js`): Pre-allocate 600 tile sprites, tái sử dụng khi chuyển phòng, triệt tiêu GC spike và micro-stutter.
- RemotePlayer render optimization giảm tải CPU khi nhiều người chơi cùng phòng.

### Added — Daily Momentum HUD (Retention Iteration 1)
- **`DailyGoalHUD.js`**: HUD compact hiển thị mục tiêu tiếp theo, tiến độ rương ngày, trạng thái sync local/server và nút Retry khi mất mạng. Đầy đủ ARIA accessibility.
- Behavioral E2E test suite (`retention-loop.spec.js`): claim, reload, hydration, offline retry, achievement, mobile layout.

### Fixed
- Hợp nhất điểm, daily quest, achievement và authenticated profile sync theo local-first state path; batch sync được debounce, tuần tự hóa và phục hồi đầy đủ sau lỗi mạng.
- Giữ explorer progress đơn điệu qua reload và chỉ khởi tạo daily session sau khi danh tính người chơi đã sẵn sàng.
- Khôi phục trigger thật cho `speed_coder`, `striker`, `tech_pro`; Speed Code Duel không còn ghi nhầm tiến trình Pomodoro.
- Sửa stress-test JavaScript, room IDs và summary teardown.

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

[0.7.1]: https://github.com/huanight19RaH/DEVER_TOWN/compare/v0.7.0...v0.7.1
[0.7.0]: https://github.com/huanight19RaH/DEVER_TOWN/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/huanight19RaH/DEVER_TOWN/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/huanight19RaH/DEVER_TOWN/compare/v0.4.1...v0.5.0
[0.4.1]: https://github.com/huanight19RaH/DEVER_TOWN/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/huanight19RaH/DEVER_TOWN/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/huanight19RaH/DEVER_TOWN/compare/v0.2.5...v0.3.0
[0.2.5]: https://github.com/huanight19RaH/DEVER_TOWN/compare/v0.2.0...v0.2.5
[0.2.0]: https://github.com/huanight19RaH/DEVER_TOWN/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/huanight19RaH/DEVER_TOWN/releases/tag/v0.1.0

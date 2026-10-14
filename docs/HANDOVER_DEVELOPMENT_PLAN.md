# DEVER TOWN — MASTER DEVELOPMENT HANDOVER PLAN
### TÀI LIỆU BÀN GIAO PHÁT TRIỂN & HƯỚNG DẪN TRIỂN KHAI TOÀN DIỆN CHO AGENT KẾ NHIỆM

**Dự án:** DEVER TOWN (Metaverse 2D Pixel Sinh Viên FPT University Đà Nẵng & CLB FU-DEVER)  
**Nhánh Git:** `develop_hung` (Repo: `d:\THStudy\DeverClub\DEVER_TOWN`)  
**Tác giả bàn giao:** Lead Visual & System Architect (CLB FU-DEVER)  
**Phiên bản hiện tại:** `v0.9.5-stardew-hd`  
**Trạng thái hệ thống:** 12/12 phòng hoàn thiện Painted Map V2 (1376×768 px), Hệ thống Avatar Chibi Anime Stardew Valley HD (128×192 px frame) đã tích hợp và kiểm thử trực quan 100%.

---

## 📌 MỤC LỤC
0. [Bản Chỉ Lệnh Sẵn Sàng Copy-Paste Cho Agent Kế Nhiệm (Ready-to-Use Agent Directive)](#0-bản-chỉ-lệnh-sẵn-sàng-copy-paste-cho-agent-kế-nhiệm-ready-to-use-agent-directive)
1. [Quy Tắc Vận Hành Bắt Buộc (Critical Rules)](#1-quy-tắc-vận-hành-bắt-buộc-critical-rules)
2. [Hiện Trạng & Kiến Trúc 12 Phân Khu (12-Room Universe Topology)](#2-hiện-trạng--kiến-trúc-12-phân-khu-12-room-universe-topology)
3. [Hệ Thống Nhân Vật Stardew Valley HD (128×192 px Standard)](#3-hệ-thống-nhân-vật-stardew-valley-hd-128192-px-standard)
4. [Cơ Chế Va Chạm (Collision Rects) & Chiều Sâu 2.5D (Depth Sorting)](#4-cơ-chế-va-chạm-collision-rects--chiều-sâu-25d-depth-sorting)
5. [Hệ Thống Tọa Độ Ngồi (Seating & Chair Anchors)](#5-hệ-thống-tọa-độ-ngồi-seating--chair-anchors)
6. [Lộ Trình Triển Khai Tiếp Theo (Actionable Implementation Backlog)](#6-lộ-trình-triển-khai-tiếp-theo-actionable-implementation-backlog)
7. [Quy Chuẩn Kiểm Thử & Nghiệm Thu (Verification Gate)](#7-quy-chuẩn-kiểm-thử--nghiệm-thu-verification-gate)

---

## 0. BẢN CHỈ LỆNH SẴN SÀNG COPY-PASTE CHO AGENT KẾ NHIỆM (READY-TO-USE AGENT DIRECTIVE)

> [!TIP]
> **Người dùng chỉ cần copy toàn bộ nội dung trong khối code dưới đây và dán trực tiếp vào khung chat của Agent mới để bắt đầu ngay:**

```text
Chào bạn, bạn là Lead Gameplay & Systems Engineer tiếp quản dự án DEVER TOWN (Metaverse 2D Pixel Sinh Viên FPT University Đà Nẵng & CLB FU-DEVER) tại workspace:
`d:\THStudy\DeverClub\DEVER_TOWN`.

Dự án hiện đã hoàn tất 100% phần Visual & Architecture: Toàn bộ 12/12 phân khu đã được nâng cấp lên chuẩn Painted Map V2 (1376×768 px) bằng Nano Banana AI, và hệ thống Avatar Chibi Anime Stardew Valley HD (128×192 px frame, sheet 512×768 px) đã tích hợp sâu vào Phaser 3.

Nhiệm vụ của bạn là hiện thực hóa các cơ chế Gameplay, Minigames, 11 NPCs và Multiplayer Synchronization theo tài liệu bàn giao.

TRƯỚC KHI BẮT ĐẦU, BẠN BẮT BUỘC TUÂN THỦ CÁC QUY TẮC SAU:
1. Đọc kỹ 2 tài liệu kim chỉ nam trong workspace:
   - `docs/HANDOVER_DEVELOPMENT_PLAN.md` (Toàn bộ kiến trúc 12 phòng, hệ thống Stardew HD, va chạm, tọa độ ghế ngồi, backlog chi tiết).
   - `../PROJECT_MEMORY.md` (Nhật ký bàn giao ca và bối cảnh tích hợp).
2. Quy tắc Git nghiêm ngặt:
   - Luôn làm việc và commit trên nhánh `develop_hung` (`git checkout develop_hung`).
   - TUYỆT ĐỐI KHÔNG PUSH REMOTE (`origin`, `org`), chỉ commit local với cờ tác giả:
     `git commit -m "feat/fix: ..." --author="RaH11 <hungnguyen.190206@gmail.com>"`.
   - Không để lại uncommitted changes khi kết thúc ca làm việc.
3. Quy tắc Emoji (Strict 0% Budget):
   - CẤM 100% Emoji trên tất cả nhãn zone tương tác lơ lửng khi bấm [E], tên event, nút bấm CTA, tabs, toast popup và console logs.
4. Ưu tiên triển khai:
   - Gói 1: 4 Minigames (Bóng rổ 3 điểm, Bóng bàn FPTU, Barista Cà phê muối, Săn bug Server Dungeon) áp dụng FSM và tách rời config tại `src/config/minigamesConfig.js`.
   - Gói 2: Tích hợp 11 NPC vào 12 phòng theo tọa độ chuẩn và chuỗi 5 nhiệm vụ Orientation Quests cho tân sinh viên qua `QuestManager.js`.
   - Gói 3: Đồng bộ RemotePlayer 128×192 px và trạng thái ngồi bàn/ghế qua Socket.io.
5. Nghiệm thu:
   - Chạy `cmd /c npm run build` (phải PASS 100% không lỗi).
   - Chạy `node scripts/capture_new_rooms_live.mjs` để kiểm tra trực quan in-game.

Bây giờ hãy đọc `docs/HANDOVER_DEVELOPMENT_PLAN.md`, xác nhận hiện trạng và bắt đầu triển khai nhiệm vụ đầu tiên!
```

---

## 1. QUY TẮC VẬN HÀNH BẮT BUỘC (CRITICAL RULES)

Agent kế nhiệm **BẮT BUỘC TUÂN THỦ 100%** các nguyên tắc sau:

1. **QUY TẮC GIT BRANCHING & COMMIT:**
   - **Nhánh làm việc duy nhất:** Luôn checkout và commit trên nhánh **`develop_hung`** (`git status`, `git branch`).
   - **TUYỆT ĐỐI KHÔNG PUSH REMOTE:** Toàn bộ commit phải giữ ở local (`develop_hung`). Chỉ push lên origin hoặc merge vào `main` khi có lệnh trực tiếp từ người dùng.
   - **Tác giả commit bắt buộc:** Luôn commit với cờ tác giả:  
     `git commit -m "feat/fix: ..." --author="RaH11 <hungnguyen.190206@gmail.com>"`
   - **Không để uncommitted changes:** Luôn kết thúc phiên với working tree clean.

2. **QUY TẮC KIỂM SOÁT EMOJI (STRICT 0% - 20% BUDGET):**
   - **CẤM 100% EMOJI trên nhãn Zone / Object khi bấm [E]:**  
     BẮT BUỘC: `Slide CLB`, `Bàn Hackathon Đội Alpha`, `Linh Vật Cóc Vàng FUDA`, `Khu Thể Thao`...  
     CẤM TUYỆT ĐỐI: `📊 Slide CLB`, `💻 Bàn Hackathon`, `🐸 Cóc Vàng`...
   - **CẤM EMOJI trên Nút Bấm (CTA) & Tabs:** Dùng nhãn text thanh lịch (`Gửi Lời Mời`, `Đồng Ý`, `Từ Chối`, `Tải Game`...).
   - **CẤM EMOJI trong Log / Toast:** Dùng tiền tố kỹ thuật chuẩn (`[Info]`, `[Warning]`, `[Error]`).
   - Emoji chỉ được phép dùng duy nhất cho biểu cảm chat (`:smile:`, `:fire:`) hoặc hiển thị streak gamification.

3. **CÔNG NGHỆ & BUILD:**
   - Chạy lệnh build trên Windows bằng: `cmd /c npm run build`.
   - Đảm bảo `npm run build` luôn PASS không có lỗi syntax/import trước khi bàn giao.

---

## 2. HIỆN TRẠNG & KIẾN TRÚC 12 PHÂN KHU (12-ROOM UNIVERSE TOPOLOGY)

Toàn bộ 12 phòng hiện đã được nâng cấp lên chuẩn **Painted Map V2 (1376×768 px)**. Mỗi phòng đều có:
- File ảnh nền sạch vẽ tay trong `public/` (đã đăng ký trong `src/scenes/BootScene.js`).
- Khai báo `paintedBackground` trong `src/config/maps.js`.
- Bảng va chạm vô hình (`collisionRects`) chuẩn xác từng pixel.
- Tọa độ `spawnPoint` hợp lý (không bị kẹt trong tường/bàn ghế).
- Cổng dịch chuyển liên thông (`portals`) hai chiều chính xác.

### Bảng Tra Cứu 12 Phân Khu Vũ Trụ DEVER TOWN:

| STT | Room ID | Tên Tiếng Việt | Image File (`public/`) | Kích thước | Tọa độ Spawn | Kết nối chính (Portals) |
| :---: | :--- | :--- | :--- | :---: | :---: | :--- |
| **1** | `main_hall` | Tòa Alpha - Sảnh Ngoài Trời & Sân Cóc | `devertown_map_v2_debanded.jpg` | 1376×768 | `(746, 620)` | `alpha_interior` (Cửa chính 746, 290)<br>`dorm_room` (150, 615)<br>`web_room` (1336, 400)<br>`sports_complex` (1336, 550)<br>`canteen_cafe` (600, 620) |
| **2** | `alpha_interior` | Sảnh Lễ Tân Tòa Alpha | `devertown_alpha_interior_v3.jpg` | 1376×768 | `(680, 580)` | `main_hall` (680, 720)<br>`dever_lab` (445, 255)<br>`library_lounge` (700, 280)<br>`meeting_room` (1000, 520)<br>`memory_room` (950, 280)<br>`main_hall` Tầng 2 Booths (1055, 350) |
| **3** | `dever_lab` | Tech & AI Lab FU-DEVER | `devertown_tech_lab_v2.jpg` | 1376×768 | `(650, 700)` | `alpha_interior` (650, 735)<br>`game_arcade` (1310, 130)<br>`server_dungeon` (260, 330) |
| **4** | `canteen_cafe` | Căn Tin FUDA & The High Deli Lounge | `devertown_canteen_cafe_v1.jpg` | 1376×768 | `(290, 680)` | `main_hall` (290, 735) |
| **5** | `library_lounge` | Thư Viện Tri Thức & Lounge Tự Học | `devertown_library_lounge_v1.jpg` | 1376×768 | `(400, 350)` | `alpha_interior` (720, 735) |
| **6** | `game_arcade` | Tòa Gamma Plus - Arcade & Esport | `devertown_game_arcade_v1.jpg` | 1376×768 | `(380, 680)` | `dever_lab` (380, 735) |
| **7** | `meeting_room` | Phòng Họp & Lớp Học Chuyên Đề | `devertown_meeting_room_v1.jpg` | 1376×768 | `(400, 336)` | `alpha_interior` (720, 735) |
| **8** | `dorm_room` | Ký Túc Xá FUDA - Phòng Sinh Hoạt | `devertown_dorm_room_v1.jpg` | 1376×768 | `(384, 400)` | `main_hall` (384, 735) |
| **9** | `sports_complex` | Khu Thể Thao & Võ Đường Vovinam | `devertown_sports_complex_v1.jpg` | 1376×768 | `(680, 680)` | `main_hall` (680, 735) |
| **10** | `memory_room` | Phòng Kỷ Niệm & Bảng Vàng CLB | `devertown_memory_room_v1.jpg` | 1376×768 | `(688, 640)` | `alpha_interior` (688, 735) |
| **11** | `web_room` | Web & Media Studio Hub | `devertown_web_room_v1.jpg` | 1376×768 | `(200, 440)` | `main_hall` (50, 440) |
| **12** | `server_dungeon` | Hầm Sự Cố Máy Chủ (Server Faults) | `devertown_server_dungeon_v1.jpg` | 1376×768 | `(688, 680)` | `dever_lab` (688, 735) |

---

## 3. HỆ THỐNG NHÂN VẬT STARDEW VALLEY HD (128×192 PX STANDARD)

Hệ thống avatar người chơi đã được chuẩn hóa theo tỷ lệ chuẩn Stardew Valley Anime Chibi HD.
- **Kích thước khung hình (Frame Size):** `128 × 192 px`
- **Kích thước tấm Spritesheet tổng:** `512 × 768 px` (4 cột hướng nhìn × 4 hàng frame hoạt ảnh)
  - Hàng 0: Đi xuống (Down Walk Cycle: frames 0, 1, 2, 3)
  - Hàng 1: Đi sang trái (Left Walk Cycle: frames 4, 5, 6, 7)
  - Hàng 2: Đi sang phải (Right Walk Cycle: frames 8, 9, 10, 11)
  - Hàng 3: Đi lên trên (Up Walk Cycle: frames 12, 13, 14, 15)

### Danh Sách 5 Spritesheet Stardew Valley Chính:
1. `public/assets/characters/samples_v2/char_stardew_fptu_polo.png`: Nam sinh viên Áo Cam Polo FPTU, quần jeans tối màu.
2. `public/assets/characters/samples_v2/char_stardew_aodai.png`: Nữ sinh viên Áo Dài trắng truyền thống FPTU thướt tha.
3. `public/assets/characters/samples_v2/char_stardew_wizard.png`: Phù thủy công nghệ áo choàng tím sao vàng và trượng code.
4. `public/assets/characters/samples_v2/char_stardew_cyber.png`: Cyber hacker đường phố, kính thực tế ảo VR, áo jacket neon cyan/magenta.
5. `public/assets/characters/samples_v2/char_stardew_dev_hoodie.png`: Lập trình viên áo hoodie đen in logo FU-DEVER.

### Công Thức Tham Số Hình Học Động (Dynamic Offsets Engine):
Đã được cấu hình hoàn chỉnh trong `src/entities/Player.js` và `src/entities/RemotePlayer.js`:
- **Physics Hitbox (Va chạm bàn chân):**  
  `body.setSize(40, 18); body.setOffset(44, 166);`
- **Bóng Đổ Dưới Chân (Ellipse Shadow):**  
  Bán kính `46 × 16 px`, vị trí y: `player.y + 88`.
- **Bảng Tên Sinh Viên (Nametag):**  
  Vị trí y: `player.y - 92`.
- **Bong Bóng Chat (Speech Bubble):**  
  Vị trí y: `player.y - 128`.

---

## 4. CƠ CHẾ VA CHẠM (COLLISION RECTS) & CHIỀU SÂU 2.5D (DEPTH SORTING)

Mỗi phòng painted map sử dụng danh sách các hình chữ nhật va chạm `collisionRects: [ { x, y, w, h }, ... ]` trong `src/config/maps.js`:

### Cơ Chế Hoạt Động (`src/scenes/WorldScene.js`):
1. Phaser đọc `pb = mapData.paintedBackground`.
2. Tạo hình chữ nhật tĩnh vô hình (`this.add.rectangle(x + w/2, y + h/2, w, h)`).
3. Đưa vào `this.obstacleGroup` (Static Arcade Physics Body).
4. Thiết lập ranh giới thế giới: `this.physics.world.setBounds(0, 0, pb.width, pb.height)`.

### Quy Chuẩn Depth Y-Sorting:
- Nền vẽ tay: `setDepth(0)`
- Nhân vật & NPC: `setDepth(this.y + 80)` — Đảm bảo khi nhân vật đi ra phía trước bàn/ghế, nhân vật che nội thất; khi đi vòng ra sau bàn/ghế, nội thất che chân nhân vật.
- Bong bóng chat & Nametag: `setDepth(this.y + 2000)`

---

## 5. HỆ THỐNG TỌA ĐỘ NGỒI (SEATING & CHAIR ANCHORS)

Tính năng ngồi ghế (`sit_chair`) và ngồi sofa (`sit_sofa`) cho phép nhân vật ngồi học bài, làm việc hackathon hoặc chill cà phê:

### Cấu Trúc Khai Báo Zone Ngồi Trong `maps.js`:
```javascript
{
  id: 'zone_canteen_sit_1',
  type: 'sit_chair',       // hoặc 'sit_sofa'
  x: 160,
  y: 445,
  name: 'Bàn Ăn Căn Tin 1',
  label: 'Ngồi Bàn Ăn',
  direction: 'up'          // 'up' | 'down' | 'left' | 'right' (hướng quay mặt khi ngồi)
}
```

### Cơ Chế Cắt Thân Dưới (Sitting Crop Engine):
Khi nhân vật kích hoạt trạng thái ngồi:
- Nếu ngồi hướng lên (`up`): Thân dưới được ẩn sau mép bàn thông qua scissor/crop `128 × 140 px`.
- Nếu ngồi hướng xuống/ngang (`down`/`side`): Hiển thị chân ngồi gập tự nhiên `128 × 155 px`.
- Vị trí bóng đổ tự động thu nhỏ: `y + 42`.
- Nhấn các phím di chuyển (WASD / Mũi tên) hoặc nhấn phím `[E]` lần nữa để đứng dậy.

---

## 6. LỘ TRÌNH TRIỂN KHAI TIẾP THEO (ACTIONABLE IMPLEMENTATION BACKLOG)

Agent kế nhiệm hãy thực hiện theo thứ tự ưu tiên các gói công việc sau:

### Gói 1: Hoàn Thiện 4 Minigames Thể Thao & Kỹ Thuật (Priority High)

#### 1. Minigame Ném Bóng Rổ 3 Điểm (`sports_complex` - zone `zone_sports_basketball`)
- **Tọa độ kích hoạt:** `x: 680, y: 470` trong `sports_complex`.
- **File triển khai:** `src/minigames/BasketballGame.js` (hoặc mở rộng `MinigameModal.js`).
- **File config:** `src/config/minigamesConfig.js` (đã có sẵn `BASKETBALL_CONFIG` với thông số vành rổ, bảng mica, góc ném và hệ số điểm).
- **Máy trạng thái (FSM):**
  `IDLE -> AIMING (Góc ném) -> CHARGING (Căn lực Power Gauge) -> SHOOTING (Phóng bóng parabol) -> BALL_PHYSICS (Va chạm vành/bảng mica/xé lưới Swish) -> RESULT -> IDLE`.
- **Game Feel & Juice:** Lò xo lưới rổ rung lắc khi bóng lọt rổ, hiệu ứng combo ngọn lửa Streetball (x2 điểm sau 3 quả liên tiếp, x3 sau 6 quả), floating text `+3 SWISH!`.
- **Phần thưởng:** 30 D-Coin khi hoàn thành phiên 10 quả (kết nối nhiệm vụ `basketball_shoot` trong `QuestManager.js`).

#### 2. Minigame Đánh Bóng Bàn FPTU (`sports_complex` - zone `zone_sports_pingpong`)
- **Tọa độ kích hoạt:** `x: 1170, y: 510` trong `sports_complex`.
- **File triển khai:** `src/minigames/PingPongGame.js`.
- **Cơ chế:**
  - Bàn bóng bàn nhìn nghiêng 2.5D, người chơi điều khiển vợt phía dưới bằng chuột/phím mũi tên.
  - Vật lý bóng có xoáy (Topspin, Backspin) và độ nảy mặt bàn gỗ.
  - Chế độ chơi: Đấu đơn với Bot AI (3 cấp độ: Tân sinh viên, Tuyển trường, Kiện tướng FPTU) hoặc 2 người chơi qua Socket.io.
- **Tiêu chuẩn kết thúc:** Thi đấu 1 hiệp 11 điểm.

#### 3. Minigame Pha Chế Barista Cà Phê Muối & Trà Sữa (`canteen_cafe` - zone `zone_cafe_barista`)
- **Tọa độ kích hoạt:** `x: 880, y: 340` tại Quầy Bar Căn Tin.
- **File triển khai:** `src/minigames/BaristaGame.js`.
- **Cơ chế:**
  - Trò chơi nhịp điệu (Rhythm Action Bar với các phím `Q - W - E - R`).
  - Thanh nhịp điệu trượt từ phải sang trái, người chơi bấm trúng vùng Hitbox "Perfect" hoặc "Great" để rót đúng định lượng nguyên liệu:
    * Cà phê muối: Phin Cà Phê (Q) -> Sữa Đặc (W) -> Đá Viên (E) -> Lớp Kem Muối Béo (R).
    * Bạc xỉu 3 tầng: Sữa Đặc (Q) -> Sữa Tươi (W) -> Cà Phê (E) -> Đá Viên (R).
  - Đánh giá chất lượng ly nước (1 sao đến 3 sao), phục vụ NPC khách hàng để nhận D-Coin và hoàn thành nhiệm vụ `barista_coffee`.

#### 4. Minigame Hầm Ngục Săn Bug Server (`server_dungeon`)
- **Các trạm sự cố:**
  - `zone_dungeon_nullpointer` tại `(240, 520)`: Buồng lồng laser xanh lam giam giữ lỗi NullPointer.
  - `zone_dungeon_memoryleak` tại `(688, 590)`: Hồ xoáy slime xanh lục chứa rò rỉ bộ nhớ RAM.
  - `zone_dungeon_infiniteloop` tại `(1120, 540)`: Vòng tròn vi mạch vàng chứa vòng lặp vô tận.
  - `zone_dungeon_terminal` tại `(688, 320)`: Máy trạm kiểm soát trung tâm.
- **File triển khai:** `src/minigames/ServerDebugGame.js` (kế thừa FSM từ `QuizEngine.js`).
- **Cơ chế:**
  - Khi tương tác `[E]`, hiển thị màn hình Console CRT hiển thị đoạn code lỗi thực tế (Java, JavaScript, C++).
  - Người chơi chọn 1 trong 4 phương án vá lỗi (Quick Patch) hoặc kéo thả lệnh sửa code đúng trong vòng 20 giây.
  - Vá lỗi thành công sẽ giải phóng buồng giam, nhận Logic Shards và D-Coin.

---

### Gói 2: Hệ Thống 11 NPC & Chuỗi Nhiệm Vụ Orientation Quests

#### 1. Bảng Tọa Độ & Phân Khu Chuẩn Hóa Của 11 NPC:

| STT | Tên NPC | Chức Vụ / Vai Trò | Room ID | Tọa Độ (x, y) | Hướng | Vai Trò Gameplay |
| :---: | :--- | :--- | :--- | :---: | :---: | :--- |
| **1** | **Nguyễn Thị Ngọc Ánh** | Thư Ký CLB • K20 | `alpha_interior` | `(684, 350)` | Down | Quầy Lễ Tân: Nhận nhiệm vụ tân sinh viên, cấp thẻ thành viên. |
| **2** | **Đặng Quang Nhật** | Chủ Nhiệm CLB • K20 | `alpha_interior` | `(520, 320)` | Down | Bảng tin CLB: Giới thiệu 4 track chuyên môn (Web, AI, Mobile, Game). |
| **3** | **Nguyễn Thái Hưng** | Phó Chủ Nhiệm CLB • K20 | `alpha_interior` | `(430, 440)` | Right | Vách kính Lab: Giới thiệu Metaverse DEVER TOWN & Đấu trường Arena. |
| **4** | **Cô Y Tá** | Trạm Y Tế FPTU | `alpha_interior` | `(1040, 440)` | Down | Góc Sofa Y Tế: Hồi sinh 50 HP, phát vật phẩm Vitamin C. |
| **5** | **Barista An** | Chuyên Gia Pha Chế | `canteen_cafe` | `(880, 340)` | Down | Quầy Bar: Hướng dẫn minigame pha chế cà phê muối. |
| **6** | **Lương Văn Tuấn Kiệt** | Trưởng Ban Học Thuật | `library_lounge` | `(600, 350)` | Down | Bàn học Thư Viện: Tặng đề cương ôn thi SWE201c, CSD201. |
| **7** | **Phạm Đức Truyền** | Lead Ban Thuật Toán | `dever_lab` | `(650, 450)` | Down | Bàn Hackathon Lab: Hướng dẫn giải thuật ICPC và chấm code tự động. |
| **8** | **Nguyễn Lê Đăng Thành** | Game Lead DEVER TOWN | `game_arcade` | `(450, 350)` | Down | Máy Arcade: Mở khóa các game thùng Retro và máy gắp gấu. |
| **9** | **Hồ Quốc Thắng** | Trưởng Ban Sự Kiện | `sports_complex` | `(450, 300)` | Down | Khán đài Thể Thao: Tổ chức giải đấu bóng rổ & bóng chuyền. |
| **10** | **Sử Quan Đức** | Biên Niên Sử FU-DEVER | `memory_room` | `(380, 400)` | Down | Bàn Triển Lãm: Thuyết minh truyền thống 9+ năm qua 10 thế hệ CLB. |
| **11** | **Lê Đình Đăng Khoa & Đoàn Phước Trường Hải** | Cố Vấn Tech & Trưởng Ban Media | `web_room` | Khoa: `(580, 500)`<br>Hải: `(760, 500)` | Khoa: Up<br>Hải: Up | Bàn Dựng Phim: Khoa review kiến trúc vi dịch vụ, Hải hướng dẫn làm media. |

#### 2. Chuỗi 5 Nhiệm Vụ Tân Sinh Viên (FPTU Campus Orientation Quest Chain):
Triển khai thông qua `src/managers/QuestManager.js`:
- **Nhiệm vụ 1: "Thủ Tục Nhập Học"** -> Nói chuyện với Thư Ký Ánh tại Quầy Lễ Tân Tòa Alpha. Nhận 50 D-Coin & Thẻ Sinh Viên.
- **Nhiệm vụ 2: "Năng Lượng Sáng Tạo"** -> Đến Căn Tin gặp Barista An, hoàn thành 1 ly cà phê muối đạt Perfect Brew.
- **Nhiệm vụ 3: "Bí Kíp Qua Môn"** -> Vào Thư Viện gặp Trưởng ban Học thuật Kiệt để nhận Cẩm nang ôn thi SWE201c.
- **Nhiệm vụ 4: "Cội Nguồn Truyền Thống"** -> Đến Phòng Kỷ Niệm gặp Sử Quan Đức và bái Linh vật Cóc Vàng.
- **Nhiệm vụ 5: "Thử Thách Đầu Đời"** -> Xuống Hầm Máy Chủ xử lý sự cố NullPointerException đầu tiên.

---

### Gói 3: Tối Ưu Mạng Đa Người Chơi (Multiplayer Synchronization)

1. **Chuẩn Hóa RemotePlayer (`src/entities/RemotePlayer.js`):**
   - Đảm bảo `RemotePlayer` tải đúng các spritesheet Stardew Valley Chibi HD (`char_stardew_fptu_polo`, `char_stardew_aodai`, `char_stardew_wizard`, `char_stardew_cyber`, `char_stardew_dev_hoodie`).
   - Cài đặt đúng kích thước khung hình `128×192 px` và Dynamic Character Offsets:
     * Hitbox va chạm: `body.setSize(40, 18); body.setOffset(44, 166);`
     * Bóng đổ: `shadowEllipse` tại `y + 88`.
     * Nametag: `nameTagContainer` tại `y - 92`.
2. **Đồng Bộ Trạng Thái Ngồi Ghế (`sit_chair` / `sit_sofa`) Qua Socket.io:**
   - Khi người chơi bấm `[E]` ngồi xuống bàn/ghế, gửi socket event `player_sit: { roomId, zoneId, seatX, seatY, direction }`.
   - Các client khác nhận event `player_sit` và tự động cập nhật tư thế ngồi của `RemotePlayer` tương ứng (crop thân dưới và ẩn chân sau mặt bàn).
   - Khi đứng dậy, gửi `player_stand` để khôi phục animation đi lại bình thường.

---

### Gói 4: Hệ Thống Kinh Tế D-Coin, Bảng Xếp Hạng & Phần Thưởng

1. **Quản lý D-Coin (`src/config/economyConfig.js`):**
   - Lưu trữ số dư D-Coin an toàn trong LocalStorage / Backend Database.
   - Bảng quy đổi:
     * Thắng minigame thể thao: +10 – 30 D-Coin.
     * Hoàn thành Daily Quest: +15 – 30 D-Coin.
     * Vá lỗi Server Bug: +30 – 100 D-Coin.
2. **Cửa Hàng Quà Tặng & Danh Hiệu:**
   - Mua vật phẩm thời trang (áo hoodie CLB, kính hacker neon, đàn guitar).
   - Mở khóa danh hiệu hiển thị trên Nametag (`[Tân Binh]`, `[Chuyên Gia Barista]`, `[Thợ Săn Bug]`, `[Kiện Tướng ICPC]`).

---

## 7. QUY CHUẨN KIỂM THỬ & NGHIỆM THU (VERIFICATION GATE)

Trước khi hoàn thành mỗi nhiệm vụ, Agent phải kiểm tra qua 3 bước:

1. **Kiểm tra cú pháp & Build:**
   ```powershell
   cmd /c npm run build
   ```
   *Yêu cầu:* `✓ built in ...s` không có lỗi.

2. **Kiểm tra giao diện & Chụp ảnh trực tiếp (Live In-Game Verification):**
   - Sử dụng script:
     ```powershell
     node scripts/capture_new_rooms_live.mjs
     ```
   - Đối chiếu ảnh chụp màn hình trong `public/screenshots/` và thư mục artifacts để xác nhận tỷ lệ nhân vật, nội thất và không có lỗi vỡ layout.

3. **Commit cục bộ trên nhánh `develop_hung`:**
   ```powershell
   git add -A
   git commit -m "feat(module): mô tả ngắn gọn tính năng" --author="RaH11 <hungnguyen.190206@gmail.com>"
   ```

---
*Tài liệu này là kim chỉ nam chính thức cho toàn bộ giai đoạn phát triển tiếp theo của DEVER TOWN.*

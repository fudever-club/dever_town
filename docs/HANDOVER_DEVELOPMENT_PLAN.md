# DEVER TOWN — MASTER DEVELOPMENT HANDOVER PLAN
### TÀI LIỆU BÀN GIAO PHÁT TRIỂN & HƯỚNG DẪN TRIỂN KHAI TOÀN DIỆN CHO AGENT KẾ NHIỆM

**Dự án:** DEVER TOWN (Metaverse 2D Pixel Sinh Viên FPT University Đà Nẵng & CLB FU-DEVER)  
**Nhánh Git:** `develop_hung` (Repo: `d:\THStudy\DeverClub\DEVER_TOWN`)  
**Tác giả bàn giao:** Lead Visual & System Architect (CLB FU-DEVER)  
**Phiên bản hiện tại:** `v0.9.5-stardew-hd`  
**Trạng thái hệ thống:** 12/12 phòng hoàn thiện Painted Map V2 (1376×768 px), Hệ thống Avatar Chibi Anime Stardew Valley HD (128×192 px frame) đã tích hợp và kiểm thử trực quan 100%.

---

## 📌 MỤC LỤC
1. [Quy Tắc Vận Hành Bắt Buộc (Critical Rules)](#1-quy-tắc-vận-hành-bắt-buộc-critical-rules)
2. [Hiện Trạng & Kiến Trúc 12 Phân Khu (12-Room Universe Topology)](#2-hiện-trạng--kiến-trúc-12-phân-khu-12-room-universe-topology)
3. [Hệ Thống Nhân Vật Stardew Valley HD (128×192 px Standard)](#3-hệ-thống-nhân-vật-stardew-valley-hd-128192-px-standard)
4. [Cơ Chế Va Chạm (Collision Rects) & Chiều Sâu 2.5D (Depth Sorting)](#4-cơ-chế-va-chạm-collision-rects--chiều-sâu-25d-depth-sorting)
5. [Hệ Thống Tọa Độ Ngồi (Seating & Chair Anchors)](#5-hệ-thống-tọa-độ-ngồi-seating--chair-anchors)
6. [Lộ Trình Triển Khai Tiếp Theo (Actionable Implementation Backlog)](#6-lộ-trình-triển-khai-tiếp-theo-actionable-implementation-backlog)
7. [Quy Chuẩn Kiểm Thử & Nghiệm Thu (Verification Gate)](#7-quy-chuẩn-kiểm-thử--nghiệm-thu-verification-gate)

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
| **10** | `memory_room` | Phòng Kỷ Niệm & Bảng Vàng CLB | `devertown_memory_room_v1.jpg` | 1376×768 | `(688, 650)` | `alpha_interior` (688, 735) |
| **11** | `web_room` | Web & Media Studio Hub | `devertown_web_room_v1.jpg` | 1376×768 | `(120, 400)` | `main_hall` (50, 400) |
| **12** | `server_dungeon` | Hầm Sự Cố Máy Chủ (Server Faults) | `devertown_server_dungeon_v1.jpg` | 1376×768 | `(688, 260)` | `dever_lab` (688, 220) |

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

### Gói 1: Hoàn Thiện Minigames Thể Thao & Giải Trí (Priority High)
1. **Minigame Ném Bóng Rổ 3 Điểm (`sports_complex` - zone `zone_sports_basketball`):**
   - Vị trí: `x: 680, y: 470`.
   - Cơ chế: Căn lực ném bóng (Angle & Power Gauge), mô phỏng quỹ đạo parabol, tính điểm combo ném vào rổ liên tiếp trong 60 giây. Thưởng D-Coin theo bậc xếp hạng.
2. **Minigame Đánh Bóng Bàn FPTU (`sports_complex` - zone `zone_sports_pingpong`):**
   - Vị trí: `x: 1170, y: 510`.
   - Cơ chế: Phản xạ đánh bóng qua lại với AI hoặc người chơi thứ 2 qua socket.
3. **Minigame Pha Chế Barista Cà Phê Muối & Trà Sữa (`canteen_cafe` - zone `zone_cafe_barista`):**
   - Vị trí: `x: 880, y: 340`.
   - Cơ chế: Rhythm game (Q-W-E-R timing bar). Chọn đúng nguyên liệu: Cà phê phin, kem muối béo, sữa đặc, đá viên. Đạt điểm "Perfect Brew" để phục vụ khách hàng NPC.
4. **Minigame Hầm Ngục Săn Bug Server (`server_dungeon`):**
   - 3 sự cố: `NullPointerException` (280, 570), `Memory Leak Slime` (1090, 570), `Infinite Loop` (688, 570).
   - Cơ chế: Câu đố sửa code trực tiếp (Quick Debug Quiz), chọn đáp án hoặc gõ dòng lệnh vá lỗi đúng để giải phóng hệ thống và nhận mảnh Logic Shards.

### Gói 2: Hệ Thống Nhiệm Vụ Tân Sinh Viên (Orientation Quests & 11 NPCs)
1. **Kết nối 11 NPC vào đúng vị trí theo sơ đồ tại `docs/plans/PLAN_v0.9_CAMPUS_ROOMS_PAINTED_ART_AND_PORTAL_ROUTING.md`:**
   - Đảm bảo khi nói chuyện hiển thị đúng ảnh chân dung `portrait_npc_...` từ `public/assets/characters/portraits/`.
2. **Chuỗi nhiệm vụ "FPTU Tour - Hành Trình Khám Phá Campus":**
   - Nhiệm vụ 1: Gặp Thư Ký Ánh tại Quầy Lễ Tân Tòa Alpha làm thủ tục thẻ sinh viên.
   - Nhiệm vụ 2: Đến Căn Tin thử cà phê muối của Barista An.
   - Nhiệm vụ 3: Vào Thư Viện nhận cẩm nang ôn thi SWE201c từ Trưởng ban Học thuật Kiệt.
   - Nhiệm vụ 4: Tham quan Phòng Kỷ Niệm và bái Linh vật Cóc Vàng.
   - Nhiệm vụ 5: Xuống Hầm Máy Chủ xử lý sự cố NullPointerException đầu tiên.

### Gói 3: Tối Ưu Mạng Đa Người Chơi (Multiplayer Synchronization)
1. **Đồng bộ hóa Animation Stardew Valley cho Remote Players (`src/entities/RemotePlayer.js`):**
   - Đảm bảo `RemotePlayer` tải đúng spritesheet `char_stardew_...` và render mượt mà 128×192 px.
   - Đồng bộ trạng thái ngồi (`sit_chair`, `sit_sofa`) qua socket để người chơi khác nhìn thấy đồng đội đang ngồi bàn làm việc.

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

# DEVER TOWN v0.7 — Kế Hoạch Nâng Cấp Toàn Diện Đồ Họa Nhân Vật 2D, Trang Bị Cầm Tay Thực Tế & Đồng Bộ Hồ Sơ

> **Nhánh phát triển:** `develop_hung` (hoặc `feature/v0.7-character-visual-upgrade`)  
> **Tài liệu & Hình ảnh tham chiếu:**  
> - Video & Sprite Sheet tham khảo: `https://www.facebook.com/reel/4410934335826489` (Hình ảnh Sprite Sheet 4x4 chuyển động võ thuật Đấm/Đá có vệt khí chém, nhân vật có kính cận, đầu hói giáo sư, râu quai nón, nếp gấp quần áo chi tiết).  
> - Các tựa game 2D kinh điển benchmark: *Stardew Valley* (Layered Paperdoll Clothes), *Terraria* (In-Hand Weapon & Tool Hold), *The Spike - Volleyball Story* (Wind Arc Slash FX), *MapleStory* (Expressions & Facial Features).  
> **Mục tiêu cốt lõi:**  
> 1. Đại tu toàn diện diện mạo nhân vật 2D: Thêm **màu da**, **râu**, **biểu cảm khuôn mặt**, **kiểu tóc giáo sư/senior dev** như ảnh tham khảo.  
> 2. **Xóa bỏ hoàn toàn bong bóng lơ lửng** của vật phẩm cầm tay $\rightarrow$ Chuyển thành **Vật Phẩm Cầm Trên Tay Thật (In-Hand Real Equipment)** với hành động gõ phím laptop, cầm ly cafe muối bốc khói, kẹp bóng, cầm cờ.  
> 3. Bổ sung **hoạt ảnh võ thuật & hành động tương tác** (Đấm & Đá có vệt khí chém Wind Slash Arc FX, Ngồi ghế, Gõ code).  
> 4. Đồng bộ hóa 100% thời gian thực giữa **Tủ Đồ (Wardrobe)**, **Hồ Sơ Cá Nhân (Player Profile 360°)** và **Thế Giới Game (In-Game World)** qua Socket.io & Database.

---

## 1. Phân Tích Hình Ảnh Tham Khảo & Benchmark Thị Trường

### 1.1. Giải Mã Hình Ảnh Tham Khảo (GPT-Image 2.5 Motion Sprite Sheet)
Từ 3 hình ảnh người dùng cung cấp:
- **Tạo hình nhân vật đặc trưng**:
  - Tóc: Đầu hói trên đỉnh, tóc xoăn ôm hai bên tai (kiểu Senior Dev / Giáo Sư công nghệ).
  - Phụ kiện mặt: Kính cận đen gọng vuông, râu quai nón rậm quanh cằm và ria mép.
  - Trang phục: Áo polo xanh đậm có cổ bẻ gọn gàng, thắt lưng da nâu có khóa kim loại, quần tây xám có nếp gấp vải co giãn theo bước chuyển động, giày da nâu đậm.
- **Hoạt ảnh võ thuật & Vệt khí (Wind Slash Arc FX)**:
  - *Tư thế Idle & Thủ Thế (Combat Stance)*: Hai chân mở rộng ngang vai, hạ thấp trọng tâm, hai tay nắm đấm co trước ngực.
  - *Cú Đấm Trực Diện (Straight Punch)*: Thân người xoay trục, cánh tay vung thẳng về phía trước, xuất hiện **vệt khí chém hình vòng cung màu xanh bán nguyệt (Wind Arc Particle)** tăng cảm giác uy lực.
  - *Cú Đá Chân Cao (High Kick)*: Một chân trụ vững, chân kia co gối rồi phóng thẳng lên cao, tạo đường vòng cung vệt gió chém sắc lẹm.

### 1.2. Hạn Chế Của Hệ Thống Cũ Trong DEVER TOWN
- **Vật phẩm cầm tay lỏ**: Đang dùng một container bong bóng tròn gắn icon emoji lơ lửng bên cạnh đầu nhân vật (`Player.js:113-136`). Không có cảm giác cầm nắm thật, nhìn rời rạc và thiếu tự nhiên.
- **Diện mạo nhân vật thiếu chiều sâu**: Màu da bị cố định 1 tông màu vàng duy nhất (`skin: '#fbd1a2'`), không có râu, không có biểu cảm mắt thay đổi, không có kiểu tóc hói trí thức.
- **Hoạt ảnh nghèo nàn**: Chỉ có 3 frame đi bộ đơn giản cho 4 hướng, thiếu các động tác võ thuật, gõ máy tính, uống nước, ngồi nghỉ.

---

## 2. Thiết Kế Kiến Trúc Hệ Thống: Modular Layered Paperdoll 2.0

Nhân vật không còn là một khối vẽ dính liền mà được cấu trúc thành **7 Lớp Đồ Họa Độc Lập (Layered Sprite Compositor)**:

```
                          CẤU TRÚC 7 LỚP NHÂN VẬT v0.7
                                       │
  Layer 7: Handheld Held Item  ─── (Laptop gõ phím / Ly cafe bốc khói / Bóng kẹp hông)
  Layer 6: Accessories & Beard ─── (Kính cận / Râu quai nón / Tai nghe RGB)
  Layer 5: Hairstyle & Color   ─── (Tóc hói giáo sư / Undercut / Đuôi ngựa)
  Layer 4: Facial Expressions  ─── (Mắt chớp / Mắt kính / Lông mày tập trung)
  Layer 3: Top Clothing        ─── (Áo polo gập cổ / Hoodie / Thắt lưng)
  Layer 2: Bottom Clothing     ─── (Quần tây nếp gấp / Quần jean / Giày da)
  Layer 1: Base Body & Skin    ─── (6 Tông màu da / Dáng người / Giải phẫu bàn tay)
                                       │
                              BÓNG ĐỔ ELIP SÀN (Depth 0)
```

---

### 2.1. Danh Mục Mới: Màu Da, Biểu Cảm, Râu & Kiểu Tóc

#### A. 🎨 6 Tông Màu Da Đa Dạng (Skin Tones)
| ID | Tên màu da | Mã Hex chính | Highlight | Shadow | Ý nghĩa |
|---|---|---|---|---|---|
| `skin_fair` | Trắng Sáng Tinh Khôi | `#fed7aa` | `#ffedd5` | `#fdba74` | Làn da trắng hồng thanh tú |
| `skin_natural` | Vàng Tự Nhiên Á Đông | `#fbd1a2` | `#fde68a` | `#f59e0b` | Tông da chuẩn sinh viên Việt Nam |
| `skin_tan` | Bánh Mật Khỏe Khoắn | `#d97706` | `#f59e0b` | `#b45309` | Làn da phơi nắng thể thao năng động |
| `skin_deep` | Nâu Rám Nắng | `#92400e` | `#b45309` | `#78350f` | Tông da rám nắng cá tính, mạnh mẽ |
| `skin_ebony` | Ngăm Đậm Phong Cách | `#573016` | `#78350f` | `#3b1d08` | Làn da ngăm đậm khỏe khoắn |
| `skin_cyber` | Cyborg Android Xanh | `#bae6fd` | `#e0f2fe` | `#7dd3fc` | Người máy sinh học tương lai |

#### B. 🧔 Bộ Sưu Tập Râu & Chi Tiết Khuôn Mặt (Facial Hair)
1. `none`: Không râu (Mặt nhẵn nhụi, thư sinh).
2. `full_beard`: **Râu Quai Nón Senior Dev** (Đúng chuẩn nhân vật trong hình tham khảo: râu quai nón rậm viền quanh quai hàm và cằm, phong thái lập trình viên kỳ cựu).
3. `mustache`: **Ria Mép Lịch Lãm** (Hàng ria mép tỉa gọn gàng phong cách quý ông).
4. `goatee`: **Râu Dê / Râu Cằm Ngắn** (Chòm râu nhỏ dưới môi dưới và đỉnh cằm sắc sảo).
5. `stubble`: **Râu Lún Phún Đêm Deadline** (Bụi râu xanh lún phún của dev cày cuốc qua đêm).
6. `grey_beard`: **Râu Bạc Giáo Sư** (Râu quai nón pha bạc thông thái của giảng viên trường).

#### C. 👀 Biểu Cảm Khuôn Mặt & Chớp Mắt (Facial Expressions)
- **Hoạt ảnh chớp mắt tự nhiên (Blink Animation)**: Mỗi 3.5 giây, mắt nhân vật nhắm lại 1 frame rồi mở ra, tạo cảm giác nhân vật "có linh hồn".
- **5 Trạng thái biểu cảm**:
  1. `expr_focus`: Mắt tập trung cao độ, lông mày nghiêm nghị khi đang di chuyển hoặc gõ code.
  2. `expr_smile`: Mắt cười hình trăng khuyết vui tươi, má ửng hồng.
  3. `expr_cool`: Nháy một bên mắt (Wink) tinh nghịch, tự tin.
  4. `expr_shock`: Mắt mở to tròn khi phát hiện bug hoặc thua minigame.
  5. `expr_chill`: Mắt nhắm thư thái khi đang cầm ly cà phê muối hoặc ngồi thiền.

#### D. ✂️ Bổ Sung Kiểu Tóc Mới
- `bald_professor`: **Tóc Hói Giáo Sư / Senior Dev** (Đỉnh đầu hói bóng loáng, hai bên tai có tóc xoăn dày màu đen/xám — Tái hiện 100% nguyên mẫu trong hình tham khảo).

---

### 2.2. Đồ Cầm Tay Thật Sự (In-Hand Real Equipment — XÓA BỎ BONG BÓNG)

Không còn hiển thị bong bóng tròn lơ lửng cạnh đầu. Vật phẩm được vẽ **trực tiếp lên bàn tay nhân vật** với tư thế và hoạt ảnh tương tác riêng:

```
               BẢNG TƯ TẾ CẦM VẬT PHẨM TRÊN TAY THẬT
                                 │
     ┌───────────────────────────┼───────────────────────────┐
     ▼                           ▼                           ▼
💻 MACBOOK PRO M-SERIES     ☕ LY CÀ PHÊ MUỐI           ⚽ QUẢ BÓNG ĐÁ / RỔ
- Di chuyển: Kẹp ngang hông - Cầm chắc trên tay         - Cầm kẹp bên nách
- Đứng yên: Mở máy gõ phím  - Có khói ấm bốc lên        - Đứng yên: Xoay tròn bóng
  với màn hình phát sáng      nghi ngút; thỉnh thoảng     trên đầu ngón tay
  và đèn bàn phím lách cách   nhấp ngụm cafe
```

1. 💻 **MacBook Pro M-Series (`macbook_dev`)**:
   - Khi di chuyển: Cầm ngang hông như một chiếc laptop gập màu xám không gian (Space Grey) có logo phát sáng.
   - Khi đứng yên (Idle > 2s): Nhân vật nâng hai tay lên trước ngực, mở nắp laptop 90 độ, màn hình hắt ánh sáng xanh cyber lên mặt nhân vật, hai bàn tay cử động gõ phím nhẹ nhàng!
2. ☕ **Ly Cà Phê Muối / Trà Sữa (`cafe_cup`)**:
   - Nhân vật cầm chắc chắn chiếc ly thủy tinh hoặc ly giữ nhiệt trên tay phải.
   - Lớp hơi nước ấm (`spawnSteam`) bốc nhẹ lên từng đợt.
   - Khi đứng yên mỗi 6 giây: Nhân vật có hoạt ảnh nâng ly lên miệng nhấp một ngụm, kèm icon biểu cảm thư thái.
3. ⚽ **Quả Bóng Đá 11M (`football_ball`)**:
   - Cầm kẹp quả bóng đen trắng chắc chắn bên mạn sườn.
   - Khi đứng yên: Nhân vật tâng nhẹ quả bóng hoặc xoay tròn quả bóng trên đầu ngón tay.
4. 🏀 **Quả Bóng Rổ FPTU (`basketball_ball`)**:
   - Cầm bóng rổ màu cam rãnh đen. Khi đứng yên, bóng nhấp nháy nhịp đập bóng (Dribble) nhẹ xuống sàn.
5. 🏸 **Vợt Cầu Lông / Kiếm Gỗ Vovinam (`badminton_racket`)**:
   - Cầm cán vợt vát chéo 45 độ sẵn sàng trong tư thế chuẩn bị thi đấu.
6. 🚩 **Cờ CLB FU-DEVER (`dever_flag`)**:
   - Tay nắm cán cờ gỗ, lá cờ xanh mang logo CLB phấp phới gợn sóng theo hướng di chuyển.
7. 🎒 **Balo Lập Trình Viên (`dev_backpack`)**:
   - Vẽ trực tiếp 2 quai đeo qua vai nhân vật; khi nhân vật quay lưng (hướng Up), hiển thị trọn vẹn chiếc balo chống gù công nghệ màu xám đậm có logo DEVER phản quang.

---

### 2.3. Hoạt Ảnh Hành Động Mới (Punch, Kick & Wind Slash Arc FX)
Lấy cảm hứng trực tiếp từ video & sprite sheet tham khảo:

1. **Cú Đấm Quyền Thuật (Punch Strike — Phím `J` hoặc Nút Action)**:
   - Thân người xoay trục ngang, nắm đấm vung mạnh về phía trước 12px.
   - Xuất hiện **Vệt Khí Chém Vòng Cung (Wind Slash Arc FX)** màu trắng xanh bán nguyệt phía trước nắm đấm kéo dài 120ms.
   - Âm thanh: Tiếng vút gió "WHOOSH!" + tiếng đấm dứt khoát `playKick(1.2)`.
2. **Cú Đá Chân Cao (High Kick — Phím `K`)**:
   - Chân trụ hơi chùng xuống, chân kia vung quét một góc 90 độ lên cao.
   - Vệt khí hình lưỡi liềm (Crescent Arc FX) chém dọc theo đường đá.
   - Camera rung nhẹ 2px (`juiceFX.shake(3, 0.1)`).
3. **Tư Thế Ngồi Thư Giãn (Sit Action — Phím `X`)**:
   - Nhân vật gập chân ngồi bệt xếp bằng trên sàn hoặc ngồi ngay ngắn khi đứng gần ghế/bàn làm việc.
   - Tự động chuyển biểu cảm sang thư giãn, lơ lửng nốt nhạc chill lofi.

---

## 3. Nâng Cấp Giao Diện: Wardrobe Modal & Profile Modal 2.0

### 3.1. Tủ Đồ Nâng Cấp (Wardrobe Modal 2.0)
Giao diện Tủ đồ được mở rộng hệ thống Tab chọn khoa học:
- **Tab 1: Màu Da (Skin Tone)**: 6 ô màu tròn chọn nhanh sắc thái da.
- **Tab 2: Khuôn Mặt & Râu**: Chọn Biểu cảm (Focus, Smile, Wink...) và Kiểu râu (Quai nón, Ria mép, Râu dê...).
- **Tab 3: Tóc & Màu Tóc**: 21 kiểu tóc (bổ sung *Tóc Hói Giáo Sư*) và 11 màu nhuộm.
- **Tab 4: Trang Phục (Outfits)**: 32 bộ trang phục học đường, thể thao, streetwear, công sở.
- **Tab 5: Đồ Cầm Tay (In-Hand Equipment)**: Chọn laptop, ly cafe, quả bóng, cờ, balo.
- **Bảng Trình Diễn Live 360° Preview**:
  - 4 nút xoay hướng: `Nhìn Trước`, `Nhìn Sau`, `Nhìn Trái`, `Nhìn Phải`.
  - 4 nút thử nghiệm hoạt ảnh sống động: `Đi Bộ`, `Thủ Thế`, `Đấm (Punch)`, `Đá (Kick)`, `Mở Laptop`.

### 3.2. Hồ Sơ Cá Nhân (Player Profile Modal 2.0)
- Khung nhân vật bên trái nâng cấp độ phân giải HiDPI, hiển thị đầy đủ 100% các chi tiết mới: Màu da, Râu quai nón, Mắt kính, Trang phục và Đồ cầm tay đang trang bị.
- Đồng bộ tự động 1:1: Mọi thay đổi trong Tủ đồ sẽ cập nhật tức thời sang Profile Modal, hiển thị lên đầu nhân vật trong phòng và đồng bộ qua Socket.io tới tất cả người chơi khác.

---

## 4. Cấu Trúc File & Kỹ Thuật Triển Khai

```
src/
├── config/
│   ├── wardrobe.js              <-- [NÂNG CẤP] Thêm skinTones, facialHairs, expressions, inHandProps
│   └── items.js                 <-- [NÂNG CẤP] Định nghĩa tọa độ Hand Socket & sprite cho từng item
├── utils/
│   ├── TextureGenerator.js      <-- [ĐẠI TU] Modular Layered Compositor (vẽ da, râu, biểu cảm, đồ cầm tay)
│   └── WindSlashFX.js           <-- [MỚI] Render vệt khí chém vòng cung khi đấm/đá
├── entities/
│   ├── Player.js                <-- [NÂNG CẤP] Xóa bong bóng, tích hợp In-Hand Layer, phím J/K đấm đá
│   └── RemotePlayer.js          <-- [NÂNG CẤP] Đồng bộ hoạt ảnh đấm đá và đồ cầm tay qua mạng
└── ui/
    └── gameplay/
        ├── WardrobeModal.js     <-- [NÂNG CẤP] Thêm tab Da, Râu, Biểu cảm, Đồ cầm tay & Preview action
        └── PlayerProfileModal.js<-- [NÂNG CẤP] Hiển thị nhân vật toàn diện chuẩn HiDPI
```

---

## 5. Lộ Trình Triển Khai 5 Sprint (Roadmap)

### Sprint 1: Mở Rộng Cấu Hình Dữ Liệu (`wardrobe.js` & `items.js`)
- [ ] Thêm 6 `skinTones` vào `WARDROBE_CONFIG`.
- [ ] Thêm 6 `facialHairs` (Full beard, Mustache, Goatee, Stubble, Grey beard).
- [ ] Thêm 5 `expressions` (Focus, Smile, Wink, Shock, Chill).
- [ ] Thêm kiểu tóc `bald_professor` (Tóc hói giáo sư / Senior Dev).
- [ ] Mở rộng `items.js` với các thuộc tính vẽ In-Hand: `inHandSprite`, `holdOffset`, `actionType`.

### Sprint 2: Đại Tu Engine Đồ Họa Nhân Vật (`TextureGenerator.js` & `WindSlashFX.js`)
- [ ] Refactor `drawCharacterFrame` thành chuỗi 7 hàm thành phần:
  - `drawBaseBody(ctx, x, y, dir, frame, skin)`
  - `drawLegsAndPants(ctx, x, y, dir, frame, pants, outfitType)`
  - `drawTorsoAndTop(ctx, x, y, dir, frame, shirt, collarColor, outfitType)`
  - `drawFaceAndEyes(ctx, x, y, dir, skin, expression)`
  - `drawFacialHair(ctx, x, y, dir, beard, hairColor)`
  - `drawHairstyle(ctx, x, y, dir, hairstyle, hairColor)`
  - `drawInHandEquipment(ctx, x, y, dir, frame, equippedItem)`
- [ ] Xây dựng `WindSlashFX.js`: Render vệt khí vòng cung bán nguyệt phát sáng khi tung đòn đấm/đá.
- [ ] Mở rộng Sprite Sheet từ 3x4 lên 6x4 (hỗ trợ frame thủ thế, đấm và đá).

### Sprint 3: Loại Bỏ Bong Bóng & Triển Khai Cầm Tay Thật Trong `Player.js` & `RemotePlayer.js`
- [ ] Xóa bỏ hoàn toàn `equippedContainer` bóng tròn lơ lửng.
- [ ] Tích hợp đồ cầm tay trực tiếp vào sprite nhân vật hoặc container bàn tay bám sát chuyển động cơ thể.
- [ ] Đăng ký sự kiện phím `KeyJ` (Đấm) và `KeyK` (Đá) kích hoạt animation võ thuật và vệt khí Wind Slash.
- [ ] Đồng bộ hóa trạng thái hành động đấm/đá qua socket event `playerAction`.

### Sprint 4: Nâng Cấp Giao Diện Tủ Đồ & Hồ Sơ Cá Nhân (`WardrobeModal.js` & `PlayerProfileModal.js`)
- [ ] Thiết kế lại `WardrobeModal.js` với 6 Tabs: `Màu Da`, `Khuôn Mặt & Râu`, `Kiểu Tóc`, `Trang Phục`, `Đồ Cầm Tay`.
- [ ] Thêm các nút tương tác xoay 360° và nút thử nghiệm hoạt ảnh: *Đi Bộ*, *Đấm*, *Đá*, *Gõ Laptop*.
- [ ] Cập nhật `PlayerProfileModal.js` hiển thị nhân vật toàn thân với đầy đủ râu, kính, màu da và đồ cầm tay thật.

### Sprint 5: Kiểm Thử Tự Động, Tối Ưu Mobile & Nghiệm Thu
- [ ] Kiểm tra tương thích lưu trữ: LocalStorage `dever_wardrobe_config` và Supabase DB `users.wardrobe_config`.
- [ ] Chạy kiểm thử tự động Playwright xác nhận Zero-Regression cho toàn bộ test suite.
- [ ] Kiểm tra hiển thị nút đấm/đá trên giao diện cảm ứng điện thoại (Virtual Touch Controls).
- [ ] Chạy `npm run build` xác nhận 0 lỗi biên dịch.

---

## 6. Tiêu Chuẩn Nghiệm Thu (Acceptance Criteria)

| Tiêu chí | Mô tả đạt chuẩn |
|---|---|
| **Màu Da & Râu** | Người chơi có thể tự do chọn 6 màu da và 6 kiểu râu (đặc biệt có Râu quai nón và Tóc hói giáo sư chuẩn hình tham khảo). |
| **Đồ Cầm Tay Thật** | 100% không còn bong bóng lơ lửng; Laptop, ly cafe muối, quả bóng, cờ được cầm chắc chắn trên tay nhân vật với hoạt ảnh gõ phím / bốc khói. |
| **Hoạt Ảnh Võ Thuật** | Nhấn phím J đấm hoặc phím K đá hiển thị vệt chém khí vòng cung (Wind Slash Arc FX) mượt mà có âm thanh dứt khoát. |
| **Đồng Bộ Hồ Sơ** | Tủ Đồ 2.0 có 6 Tabs và nút xoay 360°; Hồ sơ cá nhân và thế giới game hiển thị đồng nhất 100%. |
| **Bảo Toàn Hệ Thống** | 100% test Playwright pass, `npm run build` thành công 0 lỗi cú pháp, 0% emoji trên buttons/tabs theo chuẩn `AGENTS.md`. |

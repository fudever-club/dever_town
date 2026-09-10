# DEVER TOWN v0.7 — Kế Hoạch Nâng Cấp Toàn Diện Đồ Họa Nhân Vật HD 48x48, Trang Bị Cầm Tay Thực Tế & Đồng Bộ Hồ Sơ

> **Nhánh phát triển:** `develop_hung` (hoặc `feature/v0.7-hd-character-overhaul`)  
> **Hình ảnh & Tài liệu tham chiếu:**  
> - Facebook Reel & Motion Sprite Sheet: `https://www.facebook.com/reel/4410934335826489` (Hình mẫu chuyển động đấm/đá võ thuật có vệt khí chém Wind Arc, chi tiết nếp gấp quần áo, thắt lưng và giải phẫu).  
> - Tựa game tham chiếu phong cách đồ họa: *Stardew Valley* (Layered Clothes), *Pokemon GBA Remastered* (Student Proportions), *MapleStory* (Expressive Eyes & Poses), *Terraria* (In-Hand Weapon/Prop Grip).  
> **Định hướng mỹ thuật cốt lõi:**  
> 1. **Giữ vững bản sắc Sinh Viên FPTU hiện tại (Nam Sinh & Nữ Sinh FUDA)**, không biến thành ông già/giáo sư như meme; chỉ bổ sung kiểu râu và tóc giáo sư như một tùy chọn phụ vui nhộn trong tủ đồ.  
> 2. **Nâng cấp độ phân giải từ 32x32 lên chuẩn HD 48x48 Pixel Grid** (tăng gấp 2.25 lần mật độ pixel) để khắc họa rõ nét giải phẫu cơ thể, mắt long lanh, tóc bồng bềnh, nếp nhăn vải và bàn tay cầm đồ vật thật.  
> 3. **Không cần cài đặt hay phụ thuộc vào Blender**: Ứng dụng **Procedural Canvas Layered Compositor 2.0** thuần Web, cho phép người chơi phối hàng triệu biến thể trang phục và tải ngay tức thì 0ms trên cả Desktop lẫn Mobile.  
> 4. **Xóa bỏ triệt để bong bóng lơ lửng** $\rightarrow$ Nhân vật trực tiếp cầm laptop, ly cafe muối bốc khói, quả bóng, cờ CLB trên tay thật.

---

## 1. Phân Tích Kỹ Thuật: Có Cần Sử Dụng Blender Không?

### 1.1. So Sánh Hai Phương Pháp Kỹ Thuật

| Tiêu chí | Phương án A: Dựng & Render bằng Blender | Phương án B: HD 48x48 Procedural Canvas Compositor (Đề Xuất) |
|---|---|---|
| **Cài đặt & Môi trường** | **Bắt buộc** cài Blender, Python, bake texture và render thủ công từng frame. Máy người dùng/server phải có GPU. | **Không cần Blender**. Chạy 100% bằng JavaScript Canvas trên trình duyệt, không cần cài đặt thêm phần mềm nào. |
| **Khả năng Tùy Biến Realtime** | **Rất kém**: Nếu người chơi đổi màu da, đổi 32 loại áo, 20 kiểu tóc, 6 kiểu râu $\rightarrow$ Cần render trước hơn **2.000.000 file sprite sheet** (bất khả thi về dung lượng lưu trữ trên web). | **Vô hạn (Realtime 0ms)**: Ghép 7 lớp đồ họa ngay trong bộ nhớ canvas chỉ mất **2ms**, người chơi đổi màu áo hay da là hiển thị tức thì. |
| **Hiệu năng & Dung lượng** | Tải hàng chục MB file ảnh pre-rendered, tốn băng thông đường truyền. | Dung lượng 0KB ảnh tải thêm; toàn bộ sprite được tổng hợp procedural siêu nhẹ, mượt mà 60fps trên cả iPhone và laptop yếu. |
| **Độ Sắc Nét Pixel Art** | Dễ bị mờ (blur) do thuật toán khử răng cưa 3D thu nhỏ. | Chuẩn **Pixel-Perfect**: từng pixel được vẽ sắc nét, viền stroke tương phản cao chuẩn phong cách Stardew Valley. |

> **KẾT LUẬN:** **KHÔNG CẦN DÙNG BLENDER.**  
> Việc nâng cấp Canvas Sprite Compositor lên **chuẩn HD 48x48 Pixel Grid** là giải pháp tối ưu nhất: vừa tăng gấp đôi độ chi tiết, vừa giữ vững khả năng tùy biến triệu bộ đồ realtime mà không làm nặng game.

---

## 2. Nâng Cấp Độ Chi Tiết Nhân Vật 2D Dựa Trên Nam Sinh & Nữ Sinh FUDA

Nâng cấp kích thước khung từ **32x32** lên **48x48 pixel** (tăng vùng vẽ từ 1.024 pixels lên **2.304 pixels**), cho phép phân bổ tỷ lệ cơ thể theo chuẩn Chibi Hoàng Gia 1:2.2:

```
                      GIẢI PHẪU CHI TIẾT KHUNG HÌNH 48x48 PIXEL
                                         │
     ┌───────────────────────────────────┴───────────────────────────────────┐
     ▼                                                                       ▼
NAM SINH FUDA (Male Student)                           NỮ SINH FUDA (Female Student)
- Chiều cao: 38px, vai rộng 14px                      - Chiều cao: 36px, thắt eo mềm mại 10px
- Khung vai vuông vức, dáng đứng vững chãi            - Vai thon, bước chân thanh thoát
- Áo Polo FPTU / Hoodie có gập cổ & thắt lưng da      - Váy xếp ly nữ sinh / Áo Dài xẻ tà lụa
- Quần tây/jean có nếp nhăn 3D ở đầu gối              - Chân thon gọn, giày búp bê / sneaker nữ
- Giày Sneaker đế trắng thể thao năng động            - Mắt to long lanh 2 tầng có lông mi, má hồng
- Khuôn mặt nam tính, mắt sáng, tùy chọn râu tỉa       - Tóc uốn sóng nước có highlight bóng mượt
```

---

### 2.1. Hệ Thống 7 Lớp Đồ Họa Độc Lập (Layered Compositor 2.0)

```
                            7 LỚP ĐỒ HỌA HD 48x48
                                     │
  Layer 7: In-Hand Equipment  ─── (Laptop gõ phím / Ly cafe bốc khói / Bóng kẹp hông)
  Layer 6: Accessories & Beard ── (Kính cận viền đen / Râu quai nón tỉa / Tai nghe RGB)
  Layer 5: Hair & Highlights  ─── (Tóc nhiều lớp: Lọn tóc chính + Dải sáng bóng mượt)
  Layer 4: Eyes & Expressions ─── (Mắt 2 tầng tròng + Chớp mắt Blink + Má hồng đào)
  Layer 3: Top Clothing       ─── (Áo Polo gập cổ / Hoodie / Nếp gấp vải / Thắt lưng)
  Layer 2: Bottom Clothing    ─── (Quần tây xếp nếp / Váy xếp ly / Sneaker đế cao su)
  Layer 1: Base Anatomy Body  ─── (6 Tông màu da / Khớp tay cầm nắm / Dáng Nam & Nữ)
                                     │
                         BÓNG ĐỔ ELIP SÀN (Depth 0)
```

---

### 2.2. Chi Tiết Từng Lớp Đồ Họa Nâng Cấp

#### A. Tầng 1: Base Body & 6 Tông Màu Da (Skin Tones)
Mỗi màu da được tô với 3 sắc độ (Màu sáng highlight, Màu gốc, Màu bóng tối shadow) tạo khối nổi 3D:
1. `skin_fair`: **Trắng Sáng Tinh Khôi** (Sáng tuyết thanh tú của nữ sinh).
2. `skin_natural`: **Vàng Tự Nhiên Á Đông** (Chuẩn sinh viên Việt Nam FPTU).
3. `skin_tan`: **Bánh Mật Năng Động** (Làn da rám nắng thể thao).
4. `skin_deep`: **Nâu Khỏe Khoắn** (Cá tính, phong trần).
5. `skin_ebony`: **Ngăm Đậm Nổi Bật** (Tông da ngăm thời thượng).
6. `skin_cyber`: **Cyborg Android** (Xanh lam nhạt vi mạch công nghệ cao).

#### B. Tầng 2: Khuôn Mặt, Đôi Mắt Long Lanh & Chớp Mắt Tự Nhiên
- **Cấu trúc mắt HD**: Không còn là chấm vuông 1 pixel thô sơ.
  - Đôi mắt kích thước 3x3 pixel: Tròng đen/nâu + Đốm sáng phản quang màu trắng ở góc trên (Catchlight).
  - Nhân vật Nữ: Có thêm lông mi mảnh ở đuôi mắt và 2 vệt má hồng đào (`#f472b6`) dễ thương.
- **Hoạt ảnh chớp mắt (Blink Loop)**: Mỗi 3.5s, mi mắt khép lại trong 120ms rồi mở to, giúp nhân vật luôn sống động.
- **5 Biểu cảm khuôn mặt**:
  - `expr_focus`: Lông mày nhíu nhẹ, mắt sáng tập trung khi gõ code hoặc thi đấu.
  - `expr_smile`: Khóe mắt cong hình trăng khuyết, khóe miệng cười tươi.
  - `expr_cool`: Nháy một bên mắt (Wink) tự tin.
  - `expr_shock`: Mắt mở to tròn khi code gặp bug hoặc sút trượt bóng.
  - `expr_chill`: Mắt khép hờ thư thái khi nhâm nhi cà phê muối.

#### C. Tầng 3: Râu & Chi Tiết Khuôn Mặt (Dành Cho Ai Thích Style Trưởng Thành)
- `none`: Mặt nhẵn nhụi, trẻ trung (Mặc định cho sinh viên).
- `full_beard`: **Râu Quai Nón Senior Dev** (Đúng như ảnh tham khảo: viền râu ôm sát quai hàm và cằm, tạo vẻ ngoài đàn anh coder dày dặn kinh nghiệm).
- `mustache`: **Ria Mép Lịch Lãm** (Hàng ria mép tỉa gọn gàng).
- `goatee`: **Râu Cằm / Râu Dê** (Chòm râu cằm cá tính).
- `stubble`: **Râu Lún Phún Đêm Deadline** (Bụi râu xanh mờ của dev cày đêm).
- `grey_beard`: **Râu Bạc Giáo Sư** (Tùy chọn vui cho bạn nào thích đóng vai giảng viên).

#### D. Tầng 4: Bộ Tóc HD 3 Lớp Sáng Tối
- Bổ sung dải sáng bóng mượt (Hair Highlights) trên đỉnh đầu và đuôi tóc.
- Thêm kiểu tóc `bald_professor` (Tóc hói giáo sư: đỉnh đầu hói bóng, hai bên tai tóc xoăn dày như hình mẫu tham khảo).
- Nâng cấp 20 kiểu tóc cũ (Side part 7/3, Undercut, Tóc uốn sóng nước, Đuôi ngựa, Twintails) với độ bồng bềnh chân thực.

#### E. Tầng 5: Trang Phục Chi Tiết & Nếp Gấp Vải 3D
- **Nam Sinh**: Áo Polo FPTU có cổ bẻ rõ 2 lá cổ, thắt lưng da nâu có mặt khóa kim loại vàng sáng, nếp nhăn vải ở khuỷu tay và khớp gối quần tây, đế giày sneaker trắng có rãnh cao su.
- **Nữ Sinh**: Áo Dài có độ thướt tha xẻ tà hai bên hông lộ quần lụa trắng bên trong; Váy xếp ly có bóng đổ từng nếp gấp; Áo croptop thể thao lộ eo thon gọn.

---

## 3. Xóa Bỏ Bong Bóng $\rightarrow$ Cầm Đồ Trên Tay Thật (In-Hand Real Equipment)

Toàn bộ các vật phẩm trang bị được vẽ **trực tiếp vào bàn tay nhân vật** với tư thế cầm nắm giải phẫu chính xác:

```
               MINH HỌA VẬT PHẨM CẦM TAY TRỰC TIẾP v0.7
                                 │
     ┌───────────────────────────┼───────────────────────────┐
     ▼                           ▼                           ▼
💻 MACBOOK PRO CÔNG NGHỆ    ☕ LY CÀ PHÊ MUỐI ĐÀ NẴNG   ⚽ QUẢ BÓNG ĐÁ / RỔ
- Di chuyển: Kẹp ngang hông - Cầm chắc trên tay phải    - Cầm kẹp bên nách
- Đứng yên: Mở nắp gõ phím  - Bốc làn khói ấm ASMR      - Đứng yên: Tâng bóng nhẹ
  với màn hình phát sáng      và hoạt ảnh nhấp ngụm       hoặc xoay tròn đầu ngón
```

1. 💻 **MacBook Pro M-Series (`macbook_dev`)**:
   - Khi di chuyển: Cầm kẹp ngang hông như sinh viên IT lên giảng đường.
   - Khi đứng yên (Idle): Hai tay nâng máy tính trước ngực, nắp máy mở 90°, màn hình hắt ánh sáng xanh cyber lên khuôn mặt, ngón tay cử động gõ phím lách cách.
2. ☕ **Ly Cà Phê Muối / Trà Sữa (`cafe_cup`)**:
   - Cầm chắc chắn ly thủy tinh trên tay phải, thấy rõ phân tầng 3 màu nước và ống hút.
   - Làn khói ấm bốc lên nhẹ nhàng; thỉnh thoảng có hoạt ảnh nâng ly lên miệng uống.
3. ⚽ **Quả Bóng Đá 11M (`football_ball`)**:
   - Kẹp quả bóng bên sườn; khi đứng yên tâng bóng nhịp nhàng trên mũi giày.
4. 🏀 **Quả Bóng Rổ FPTU (`basketball_ball`)**:
   - Đập bóng nảy nhẹ trên mặt sàn (Dribble idle).
5. 🏸 **Vợt Cầu Lông / Kiếm Vovinam (`badminton_racket`)**:
   - Cầm cán vợt vát chéo 45° sẵn sàng trong tư thế chuẩn bị thi đấu.
6. 🚩 **Cờ CLB FU-DEVER (`dever_flag`)**:
   - Tay nắm cán cờ gỗ cao qua đầu, lá cờ xanh bay phấp phới theo hướng gió.
7. 🎒 **Balo Lập Trình Viên (`dev_backpack`)**:
   - Đeo trực tiếp 2 quai trên vai nhân vật (hiển thị rõ khi quay lưng).

---

## 4. Hoạt Ảnh Võ Thuật & Hiệu Ứng Vệt Khí Chém (Punch, Kick & Wind Slash Arc FX)

Áp dụng đúng tinh thần võ thuật và hoạt ảnh từ video tham khảo:

1. **Cú Đấm Quyền Thuật (Punch Strike — Phím `J` / Nút Cảm Ứng Đấm)**:
   - Nhân vật hạ thấp trọng tâm, xoay hông và vung mạnh nắm đấm về phía trước.
   - Xuất hiện **Vệt Khí Chém Bán Nguyệt (Wind Slash Arc FX)** màu trắng xanh phát sáng trước nắm đấm kéo dài 140ms.
   - Âm thanh vút gió uy lực `playKick(1.2)` và micro-camera shake 2px.
2. **Cú Đá Chân Cao (High Kick — Phím `K` / Nút Cảm Ứng Đá)**:
   - Bật xoay người quét một cú đá vòng cung 90° lên cao.
   - Vệt gió lưỡi liềm (Crescent Arc FX) chém dọc theo đường quét của bàn chân.
3. **Tư Thế Ngồi Thư Giãn (Sit Action — Phím `X`)**:
   - Nhân vật gập chân ngồi bệt xếp bằng trên sàn hoặc ngồi ngay ngắn vào ghế làm việc / ghế cafe.

---

## 5. Đồng Bộ Hóa Toàn Diện Với Hồ Sơ Cá Nhân (Profile & Wardrobe 360°)

### 5.1. Tủ Đồ Nâng Cấp (Wardrobe Modal 2.0)
- **6 Tab Chọn Khoa Học**:
  1. `Màu Da`: 6 ô màu tròn chọn nhanh sắc thái da.
  2. `Gương Mặt & Râu`: Chọn biểu cảm mắt và 6 kiểu râu (Quai nón, Ria mép, Râu cằm...).
  3. `Kiểu Tóc`: 21 kiểu tóc thời thượng (có Tóc hói giáo sư) & 11 màu nhuộm.
  4. `Trang Phục`: 32 bộ quần áo Nam/Nữ học đường, thể thao, streetwear, công sở.
  5. `Đồ Cầm Tay`: Laptop, ly cafe, quả bóng, cờ, balo.
- **Khung Preview 360° Sống Động**:
  - Nút xoay 4 hướng: `Trước`, `Sau`, `Trái`, `Phải`.
  - Nút thử nghiệm động tác: `Đi Bộ`, `Thủ Thế`, `Đấm (Punch)`, `Đá (Kick)`, `Mở Laptop`.

### 5.2. Hồ Sơ Cá Nhân (Player Profile Modal 2.0)
- Mô hình nhân vật hiển thị lớn ở khung bên trái với độ phân giải cao HD, thể hiện trọn vẹn từng đường nét da, râu, kính, trang phục và đồ cầm tay thật.
- Đồng bộ Realtime 100%: Lưu vào `wardrobe_config` trên database và broadcast qua Socket.io để tất cả bạn bè trong phòng nhìn thấy ngay lập tức.

---

## 6. Lộ Trình Triển Khai 5 Sprint (Roadmap)

- **Sprint 1 (Dữ liệu cấu hình):** Mở rộng `src/config/wardrobe.js` (6 màu da, 6 kiểu râu, 5 biểu cảm, kiểu tóc mới) và `src/config/items.js` (Hand Socket data).
- **Sprint 2 (Engine HD 48x48 & Wind Slash FX):** Nâng cấp `TextureGenerator.js` lên canvas 48x48 với 7 lớp đồ họa độc lập và xây dựng `src/ui/common/WindSlashFX.js`.
- **Sprint 3 (Đồ cầm tay thật & Hoạt ảnh võ thuật):** Xóa bỏ bong bóng lơ lửng trong `Player.js` & `RemotePlayer.js`, gắn đồ lên tay thật, tích hợp phím `J` (đấm) và `K` (đá).
- **Sprint 4 (Nâng cấp giao diện Tủ đồ & Hồ sơ):** Nâng cấp `WardrobeModal.js` 6 tabs và `PlayerProfileModal.js` hiển thị nhân vật HD 360°.
- **Sprint 5 (Kiểm thử & Nghiệm thu):** Chạy `npm run build`, pass 100% Playwright test suite, tối ưu giao diện cảm ứng Mobile và đồng bộ database Supabase.

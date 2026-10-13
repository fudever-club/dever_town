# BẢN QUY HOẠCH TOÀN CẢNH: HỆ THỐNG PHÒNG ỐC VẼ MỚI & SƠ ĐỒ ĐIỀU HƯỚNG CAMPUS
### DỰ ÁN DEVER TOWN V0.9 — ĐẠI HỌC FPT ĐÀ NẴNG & CLB LẬP TRÌNH FU-DEVER

**Mã tài liệu:** `DEVER-TOWN-PLAN-ROOMS-V0.9`  
**Nhánh Git:** `develop_hung`  
**Tác giả:** Lead Game Architect & Visual Designer (CLB FU-DEVER)  
**Tiêu chuẩn đồ họa:** Hybrid Painted Map V2 (1376×768 px, Stardew Valley × GraalOnline Era aesthetic, Zero Banding, HiDPI).

---

## 1. TỔNG QUAN & HIỆN TRẠNG 12 PHÒNG CAMPUS

DEVER TOWN hiện có 12 không gian phân khu. Trong đó:
- **Đã hoàn thiện Painted Map V2 (2 phòng):**
  1. `main_hall` (Sân Alpha - Ngoài trời): Nền vẽ tay `devertown_map_v2_debanded.jpg` (1376×768).
  2. `alpha_interior` (Sảnh Lễ Tân Tòa Alpha - Trong nhà): Nền vẽ tay `devertown_alpha_interior_v3.jpg` (1376×768).
- **10 phòng còn lại hiện đang dùng Tilemap cổ điển (25×19 ô):**
  Cần nâng cấp đồng bộ sang chuẩn Hybrid Painted Map V2 với đồ họa vẽ tay ấm áp, chi tiết nội thất tinh xảo, ánh sáng Stardew Valley, và bảng va chạm (Collision Rects) chuẩn xác từng pixel.

---

## 2. SƠ ĐỒ TOPO MẠNG LƯỚI KẾT NỐI (PORTAL TOPOLOGY MAP)

Cấu trúc luồng di chuyển mô phỏng thực tế kiến trúc campus Đại học FPT Đà Nẵng:

```text
                                 [ KÝ TÚC XÁ (dorm_room) ]
                                            │
                                            │ (Cổng trái 150, 615)
                                            ▼
[ CĂN TIN & CAFE (canteen_cafe) ] ◄─── [ SÂN ALPHA (main_hall) ] ───► [ KHU THỂ THAO (sports_complex) ]
       (Cổng hồ 600, 620)                   │            │                   (Cổng phải 1336, 550)
                                            │            │
                                (Cửa chính  │            │ (Cổng Media
                                 746, 290)  │            │  1336, 400)
                                            ▼            ▼
                                [ SẢNH TÒA ALPHA ]  [ WEB & MEDIA HUB ]
                                (alpha_interior)      (web_room)
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            ▼                          ▼                          ▼
   [ TECH & AI LAB ]          [ THƯ VIỆN & LOUNGE ]     [ PHÒNG HỌP & LỚP HỌC ]
     (dever_lab)                (library_lounge)            (meeting_room)
      │          │                     │                          │
      │          ▼                     └────────────┬─────────────┘
      │     [ ARCADE HUB ]                          ▼
      │     (game_arcade)                 [ PHÒNG KỶ NIỆM CLB ]
      ▼                                      (memory_room)
[ SERVER & BUG DUNGEON ]
   (server_dungeon)
```

---

## 3. QUY HOẠCH VỊ TRÍ 11 NPC CLB THEO PHÂN KHU CHUYÊN MÔN

| STT | Tên NPC | Chức vụ / Vai trò | Phân khu (Room ID) | Tọa độ chuẩn (x, y) | Hướng nhìn | Nội dung đối thoại đặc trưng |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **1** | **Nguyễn Thị Ngọc Ánh** | Thư Ký CLB • K20 | `alpha_interior` | `(684, 350)` | Xuống (Down) | Đón tiếp tại Quầy Lễ Tân, hướng dẫn thủ tục gia nhập CLB, quản lý quỹ và hồ sơ. |
| **2** | **Đặng Quang Nhật** | Chủ Nhiệm CLB • K20 | `alpha_interior` | `(520, 320)` | Xuống (Down) | Đứng cạnh Bảng Tin CLB, giới thiệu 4 sub-team (Web, AI, Mobile, Game), định hướng văn hóa Builder. |
| **3** | **Nguyễn Thái Hưng** | Phó Chủ Nhiệm CLB • K20 | `alpha_interior` | `(430, 440)` | Phải (Right) | Đứng cạnh Vách kính Lab, giới thiệu Metaverse DEVER TOWN, đấu trường Arena và hệ sinh thái kỹ thuật. |
| **4** | **Cô Y Tá** | Trạm Y Tế FPTU | `alpha_interior` & `main_hall` | `(1040, 440)` | Xuống (Down) | Đứng tại Góc Sofa Y Tế, sơ cứu hồi sinh 50 HP, phát Vitamin C cho sinh viên thức khuya chạy deadline. |
| **5** | **Barista An** | Chuyên Gia Pha Chế | `canteen_cafe` | `(256, 256)` | Xuống (Down) | Đứng sau Quầy Bar Căn Tin, nhận đơn pha cà phê muối, bạc xỉu qua minigame nhịp điệu Q-W-E-R. |
| **6** | **Lương Văn Tuấn Kiệt** | Trưởng Ban Học Thuật | `library_lounge` | `(384, 192)` | Xuống (Down) | Bàn nghiên cứu Thư Viện, chia sẻ đề cương ôn PE (CSD201, PRF192, MAS291), kho tài liệu SWE201c. |
| **7** | **Phạm Đức Truyền** | Lead Ban Thuật Toán | `dever_lab` | `(384, 192)` | Xuống (Down) | Dàn máy Lab Lập Trình, hướng dẫn luyện Codeforces/ICPC, test runner sandbox và thuật toán đồ thị. |
| **8** | **Nguyễn Lê Đăng Thành** | Game Lead DEVER TOWN | `game_arcade` | `(384, 192)` | Xuống (Down) | Máy Arcade trung tâm, giới thiệu 11 minigames Phaser 3, vật lý bóng rổ, bóng chuyền, Sokoban. |
| **9** | **Hồ Quốc Thắng** | Trưởng Ban Sự Kiện | `sports_complex` | `(320, 160)` | Xuống (Down) | Khán đài Khu Thể Thao, điều phối các giải đấu Futsal, giải súng nước và sự kiện Club Day. |
| **10** | **Sử Quan Đức** | Biên Niên Sử FU-DEVER | `memory_room` | `(320, 192)` | Xuống (Down) | Bàn lưu trữ kỷ niệm, kể câu chuyện thành lập CLB từ Gen 1 đến Gen 10, các cúp vô địch Hackathon. |
| **11** | **Lê Đình Đăng Khoa & Đoàn Phước Trường Hải** | Cố Vấn Tech & Trưởng Ban Media | `web_room` | Khoa: `(192, 224)`<br>Hải: `(448, 224)` | Khoa: Phải<br>Hải: Trái | Bàn làm việc Web & Media Hub: Khoa review kiến trúc backend/Docker, Hải quản lý máy ảnh và sản xuất ấn phẩm truyền thông. |

---

## 4. LỘ TRÌNH TRIỂN KHAI VẼ PHÔI NỀN THEO 3 CỤM (PHASE 2)

### 🎨 Cụm 1: Học Thuật & Công Nghệ Cao (Academic & High-Tech Cluster)
1. **Phòng Tech & AI Lab (`dever_lab`):**
   - *Mô tả visual:* Dàn PC màn hình kép rực sáng code xanh cyan, server racks phát đèn tín hiệu, bảng trắng tràn ngập sơ đồ kiến trúc vi dịch vụ, ghế gaming công thái học, cờ FU-DEVER treo tường.
   - *Kích thước:* 1376×768 px.
2. **Thư Viện Tri Thức & Lounge (`library_lounge`):**
   - *Mô tả visual:* Giá sách gỗ sồi cao kịch trần, đèn bàn chụp xanh retro, thảm len êm ái, cây xanh trong nhà, bàn học nhóm rộng rãi và ánh nắng chiếu xiên qua cửa sổ vòm.
3. **Phòng Server & Hầm Sự Cố Bug Dungeon (`server_dungeon`):**
   - *Mô tả visual:* Không gian hầm lạnh ngắt với ánh đèn LED đỏ/xanh cảnh báo, dàn máy chủ server khổng lồ, dây cáp mạng bọc sàn, khói tản nhiệt CO2 bốc mờ ảo.

### 🍱 Cụm 2: Đời Sống & Sinh Hoạt Sinh Viên (Student Life & Living Cluster)
1. **Căn Tin FUDA & The High Deli Lounge (`canteen_cafe`):**
   - *Mô tả visual:* Quầy pha chế cà phê muối ấm cúng với máy pha espresso sáng bóng, tủ bánh ngọt, bàn ghế gỗ sáng màu phong cách Minimalist Nordic, góc nhìn ra mặt hồ vịt.
2. **Khu Phức Hợp Thể Thao & Võ Đường Vovinam (`sports_complex`):**
   - *Mô tả visual:* Sàn gỗ bóng tiêu chuẩn thi đấu bóng rổ/bóng chuyền, thảm tập võ Vovinam xanh dương có logo FPTU, khán đài bậc gỗ, tủ đựng bóng và cúp vàng vinh danh.
3. **Ký Túc Xá Sinh Viên (`dorm_room`):**
   - *Mô tả visual:* Phòng KTX ấm cúng với giường tầng gỗ, bàn học decor đèn RGB, tủ sách, poster anime, đàn guitar góc phòng và ban công thoáng đãng nhìn ra khuôn viên FPT.

### 🎮 Cụm 3: Sáng Tạo, Truyền Thông & Sự Kiện (Creative, Media & Events Cluster)
1. **Khu Máy Game Arcade Hub (`game_arcade`):**
   - *Mô tả visual:* Phòng máy game retro neon rực rỡ phong cách Akihabara, dãy máy thùng arcade cổ điển, bảng điểm LED kỷ lục, thảm sàn họa tiết pixel 8-bit.
2. **Web & Media Hub (`web_room`):**
   - *Mô tả visual:* Xưởng sáng tạo với phông xanh quay phim, bàn dựng phim iMac 5K, dàn máy ảnh kỹ thuật số, bảng storyboard chiến dịch truyền thông và sofa nghỉ ngơi.
3. **Phòng Họp & Lớp Học Chuyên Đề (`meeting_room`):**
   - *Mô tả visual:* Phòng họp hiện đại với bàn hội nghị oval lớn, màn hình TV LED 85 inch trình chiếu slide, bảng kính viết bút dạ và micro hội nghị.
4. **Phòng Truyền Thống & Kỷ Niệm FU-DEVER (`memory_room`):**
   - *Mô tả visual:* Gian triển lãm trang trọng với tủ kính trưng bày kỷ vật, áo đồng phục các thời kỳ Gen 1 - Gen 10, bằng khen nghiên cứu khoa học và bảng vàng cựu thành viên thành đạt.

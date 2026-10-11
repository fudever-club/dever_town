# KẾ HOẠCH MASTER PLAN: TÁI THIẾT KẾ ĐỒ HỌA & LOGIC GAMEPLAY DEVER TOWN
### DỰA TRÊN CƠ CHẾ KINH ĐIỂN CỦA "GRAALONLINE ERA" (2D PIXEL MMO)

**Mã tài liệu:** `DEVER-TOWN-GRAAL-2026-V1`  
**Dự án:** `DEVER_TOWN` — Thế giới 2D Pixel CLB FU-DEVER · Đại học FPT Đà Nẵng  
**Mục tiêu:** Nâng cấp từ mô hình Gather.town cơ bản thành tựa game 2D Pixel MMO thế giới mở sinh viên FPTU: vừa chill, vừa cày cuốc, vừa giao lưu, vừa có những trận "var nhau" nảy lửa nhưng mang tinh thần học thuật và thể thao lành mạnh.

---

## 1. TỔNG QUAN & TẦM NHÌN HỌC HỎI TỪ GRAALONLINE ERA

**GraalOnline Era** là một trong những tựa game 2D Pixel MMO hiếm hoi duy trì được cộng đồng trung thành suốt hơn 16 năm (2010 – 2026). Sức hút lâu dài của nó đến từ 4 yếu tố cốt lõi:
1. **Thế giới mở sống động (Open-world sandbox):** Không bó hẹp người chơi vào một luồng tuyến tính; ai thích chill thì câu cá, trang trí nhà, ai thích quẩy thì lập băng đảng chiếm căn cứ.
2. **Kinh tế cày cuốc công nhân (Job-based Economy):** Mọi tài sản lớn đều bắt đầu từ việc làm công nhân nhỏ (lượm rác, đào mỏ, đào ốc, làm pizza).
3. **Chiếm cứ điểm băng đảng (Gang Forts & Wars):** Tạo động lực cạnh tranh tập thể mãnh liệt.
4. **Tính tùy biến cao (UGC & Housing):** Cho phép tự upload skin và trang trí nhà riêng.

Khi chuyển thể vào **DEVER TOWN** (Đại Học FPT Đà Nẵng & CLB Lập Trình FU-DEVER), các cơ chế trên sẽ được "Việt hóa" và "FPT-hóa" một cách dí dỏm, thực tế và đầy bản sắc sinh viên công nghệ.

---

## 2. 8 TRỤ CỘT CƠ CHẾ HỌC HỎI & CHUYỂN THỂ CHO DEVER TOWN

### 🛡️ Trụ cột 1: Phân Vùng An Toàn (Safe Zones) vs Vùng Thách Đấu (Challenge / Var Zones)
- **Chuẩn Máu 50 HP:** Người chơi có thanh thể lực 50 HP (chuẩn GraalOnline).
- **Safe Zones (Vùng An Toàn Tuyệt Đối):**
  - *Địa điểm:* Thư Viện Tầng 3, Giảng Đường Thi PE Exam, Sảnh Lễ Tân Tòa Alpha, Văn phòng CLB FU-DEVER.
  - *Cơ chế:* Hiển thị huy hiệu `[VÙNG AN TOÀN - SAFE ZONE]` xanh ngọc trên HUD. Tại đây người chơi hồi phục 100% HP, không thể bị thách đấu, là nơi học nhóm, nghe workshop và nghỉ ngơi.
- **Challenge Zones (Vùng Var Nhau Lành Mạnh):**
  - *Sân Bóng Đá FPT:* Trận bóng đá 2D 3v3 hoặc 5v5.
  - *Sân Cỏ Thể Thao:* Trận địa bắn súng nước (Water Gun Skirmish) hoặc ném bóng nước mùa hè.
  - *Phòng Lab Alpha / ICPC Arena:* Đấu trường Code Duel 1v1 gõ thuật toán tính giờ.
- **Cơ Chế Bệnh Viện / Trạm Y Tế:** Khi hết 50 HP (bị gục trong trận súng nước hoặc bị deadline dí), người chơi hồi sinh tại **Trạm Y Tế FPTU (Tòa Alpha)** với NPC Cô Y Tá phát Vitamin C. Người chơi giữ nguyên 100% trang bị và tiền bạc trong balo (không bị rơi đồ).

---

### 💼 Trụ cột 2: Hệ Thống Việc Làm Sinh Viên Cày Tiền (Campus Jobs)
Thay vì các công việc chung chung, DEVER TOWN tích hợp 5 nghề sinh viên đậm chất FPTU để kiếm D-Coin:
1. **Lao Công Sân Trường (Campus Cleaner):**
   - *Cách chơi:* Nhặt ly trà sữa, chai nhựa, hộp xôi vương trên cỏ quanh Sân Alpha và bờ hồ. Bỏ vào thùng rác phân loại (Vô cơ / Hữu cơ).
   - *Thưởng:* +15 D-Coin/món và tăng điểm "Sinh Viên Xanh".
2. **Barista Căn Tin FPT:**
   - *Cách chơi:* Đứng quầy Căn tin nhận đơn pha cà phê muối, bạc xỉu, trà đào cam sả. Mini-game bấm phím đúng nhịp (Q, W, E, R).
   - *Thưởng:* +25 D-Coin/ly.
3. **Shipper Cơm Trưa KTX (Campus Delivery):**
   - *Cách chơi:* Nhận đơn cơm từ Căn tin Tòa Alpha, chạy bộ thần tốc giao sang các phòng KTX sinh viên trong vòng 60 giây.
   - *Thưởng:* +35 D-Coin/chuyến.
4. **Bug Hunter (Bắt Bọ & Fix Bug Sân Trường):**
   - *Cách chơi:* Dùng vợt bắt những chú bọ Buggy phát sáng nhảy nhót quanh vườn hoa giấy. Khi bắt được, trả lời 1 câu trắc nghiệm nhanh về Git/Python/JavaScript.
   - *Thưởng:* +40 D-Coin/chú bọ.
5. **Câu Cá & Vớt Bèo Hồ Alpha:**
   - *Cách chơi:* Thả cần câu giải trí bên Hồ Vịt, săn cá rô phi và vớt bèo làm sạch hồ nước.

---

### 🏰 Trụ cột 3: Bang Hội & Chiếm Giữ Căn Cứ (Clans & Base Forts)
- **4 Đại Clan Chuyên Môn FU-DEVER:**
  - *Clan Web Builders:* Trấn giữ Căn cứ Phòng Lab Alpha.
  - *Clan AI Core:* Trấn giữ Thư Viện Tầng 3 (Data Lab).
  - *Clan Mobile Masters:* Trấn giữ Bàn Tròn Căn Tin.
  - *Clan Game Developers:* Trấn giữ Đấu Trường Arcade Hub.
- **Cuộc Chiến Căn Cứ Hàng Tuần (Fort Battles):**
  - Vào tối Chủ Nhật, diễn ra sự kiện chiếm giữ "Server Room Tòa Alpha".
  - Clan nào giữ được căn cứ trong thời gian dài nhất sẽ nhận cờ hiệu Clan cắm tại Sân Alpha, Áo choàng đồng phục độc quyền và quỹ D-Coin chia đều cho thành viên.

---

### 📊 Trụ cột 4: Sàn Trao Đổi Hàng Hóa Sinh Viên (Trade Market)
- Sinh viên có thể mở cửa sổ Trade trực tiếp với người chơi khác:
  - Trao đổi giáo trình PE (PRF192, PRO197, CSD201, MAS291...).
  - Trao đổi linh kiện bàn phím cơ, keycap custom, sticker linh vật Buggy.
  - Đổi bánh mì cho vịt, cà phê tăng lực.
- Thị trường có biến động giá theo cung cầu (Trochus/D-Coin Economy).

---

### 🏠 Trụ cột 5: Phòng KTX & Bàn Học Cá Nhân (Dormitory Housing)
- Mỗi cư dân được cấp một căn phòng KTX (Dorm Room) tại Tòa Dom FPTU:
  - Tự do mua sắm và kê nội thất: Bàn học công thái học, Dàn PC 3 màn hình LED RGB, Ghế gaming, Tủ sách thuật toán, Poster anime/hackathon.
  - Tính năng **Upvote Nhà Đẹp:** Bạn bè ghé thăm có thể bấm thả tim. Bảng xếp hạng hàng tuần vinh danh Top 3 Phòng KTX đẹp nhất với huy hiệu Cóc Vàng.

---

### 🎨 Trụ cột 6: Tùy Biến Skin Tự Vẽ (User-Generated Content Skin)
- Giống GraalOnline Era: Mở cổng cho phép sinh viên tự vẽ file spritesheet PNG 48×64 px (theo template chuẩn của CLB) và tải lên để nhân vật mặc trong game.
- Tiêu tốn 100 D-Coin để nộp duyệt tự động qua AI filter (chống ảnh phản cảm), giúp ai cũng sở hữu bộ trang phục độc nhất vô nhị.

---

### 🎉 Trụ cột 7: Lễ Hội & Sự Kiện Theo Mùa (Campus Festivals)
- **Halloween "Trick or Code":** Đi gõ cửa các phòng KTX xin kẹo hoặc sticker ma máy, săn mặt nạ bí ngô.
- **Tết FUDA:** Cây mai vàng tại Sân Alpha, lì xì D-Coin may mắn.
- **DevDay & Hackathon Night:** Sự kiện cày cuốc thâu đêm với dàn máy server và trà sữa không giới hạn.

---

### 👑 Trụ cột 8: Mô Hình VIP Cày Cuốc F2P (Free-to-Play VIP)
- Trong DEVER TOWN, **tuyệt đối không có nạp tiền thật (Pay-to-Win)**.
- Gói VIP "Cóc Vàng Danh Dự" được mua bằng **D-Coin** tích lũy từ việc làm (Jobs) và minigames hàng ngày:
  - Khi kích hoạt VIP: Tăng 20% tốc độ chạy, nhận hào quang ánh sáng quanh nhân vật, nhận bộ trang phục Áo Dài / Vest Dạ Hội độc quyền hàng tháng.

---

## 3. KẾ HOẠCH TÁI CẤU TRÚC ĐỒ HỌA (GRAPHICS ARCHITECTURE)

### 3.1. Bản Đồ Môi Trường (Map Environments)
- **Loại bỏ triệt để lỗi sọc ngang / scanline glitch:**
  - Map Sân Alpha được nâng cấp lên **Phôi nền V2 (Pristine Pixel Art 1376×768)** với lối đi lát đá cobblestone đối xứng, hồ vịt trong xanh, đài phun nước trung tâm và khu vườn Tượng Tư Tưởng hoàn mỹ.
  - Không sử dụng các filter CSS tạo đường kẻ ngang gây khó chịu cho mắt người chơi.
- **Hệ thống Tilemap Phân Tầng:**
  - *Layer 0 (Ground):* Đá lát đường, thảm cỏ, lòng hồ.
  - *Layer 1 (Obstacles / Y-Sort):* Tường Tòa Alpha, đài phun nước, tượng, ghế đá, cây cối, bờ hồ.
  - *Layer 2 (Fringe / Canopy):* Tán lá cây cao, mái che bậc tam cấp cho phép nhân vật đi khuất phía dưới.
  - *Layer 3 (Lightmap & FX):* Quầng sáng đèn lồng Stardew 60 FPS, phản chiếu mặt hồ, đom đóm đêm.

### 3.2. Chuẩn Hoạt Ảnh Nhân Vật (Chibi Character Sprites)
- Tỉ lệ Chibi: 1:1.2 (đầu to dáng tròn dễ thương phong cách Gather.town & GraalOnline).
- Spritesheet: 48×64 px mỗi frame, 4 hướng xoay (Xuống, Trái, Phải, Lên), 4 frames bước chân.
- Bóng đổ mềm elip dưới chân + hạt bụi bước chân khi chạy.

---

## 4. KẾ HOẠCH TÁI CẤU TRÚC GIAO DIỆN (CYBER-GLASS HYBRID UI)

### 4.1. Thanh Trạng Thái In-Game HUD
- **Trái:** Avatar tròn, Tên nhân vật, Level, **Thanh 50 HP (đỏ rực)** và Thanh XP.
- **Giữa:** Huy hiệu **`VÙNG AN TOÀN (SAFE ZONE)`** phát sáng xanh ngọc + Đồng hồ thời gian thực.
- **Phải:** Ví D-Coin phát sáng + **Radar Mini tròn quét 360°** theo dõi vị trí thực tế của bạn bè và NPC.

### 4.2. Thanh Phím Tắt Thao Tác Nhanh (Action Dock)
Hệ thống 6 phím tắt số thuận tiện cho cả bàn phím máy tính lẫn màn hình cảm ứng:
- `[1]` Balo Túi Đồ (7 ngăn trang bị).
- `[2]` Việc Làm Cày Tiền (Campus Jobs).
- `[3]` Bang Hội & Căn Cứ (Clans & Forts).
- `[4]` Phòng Máy Minigames (Arcade Hub).
- `[5]` Chợ Trao Đổi (Trade Market).
- `[6]` Phòng KTX Cá Nhân (Dormitory Housing).
- `[G]` Vòng xoay biểu cảm (Emote Wheel).
- `[Enter]` Gõ chat bong bóng thoại tiếng Việt.
- `[L]` Đổi giờ (Hoàng Hôn 🌅 / Đêm Cyber 🌙 / Ban Ngày ☀️).

---

## 5. LỘ TRÌNH TRIỂN KHAI 4 GIAI ĐOẠN (ROADMAP)

| Giai đoạn | Nội dung thực hiện | Trạng thái |
| :--- | :--- | :--- |
| **Phase 1: Visuals & Core HUD** | - Sửa sạch lỗi gạch ngang trên map.<br>- Nạp phôi Map V2 sắc nét 1376×768.<br>- Tích hợp chuẩn 50 HP & Safe Zone badge lên HUD.<br>- Bản Playable Demo HTML hoàn thiện. | **ĐÃ HOÀN THÀNH (Local)** |
| **Phase 2: Campus Jobs & Economy** | - Triển khai logic nhặt rác sân trường (`litterItems`).<br>- Mini-game pha cà phê Barista Căn tin.<br>- Nhiệm vụ giao cơm trưa KTX tính giờ.<br>- Tích lũy D-Coin và lưu `localStorage`. | Sẵn sàng tích hợp |
| **Phase 3: Clans & Combat Arenas** | - Phân chia 4 Clan chuyên môn.<br>- Cơ chế thách đấu súng nước tại Sân Thể Thao.<br>- Đấu trường Code Duel 1v1 tại Lab Alpha.<br>- Hồi sinh tại Trạm Y Tế FPTU khi hết 50 HP. | Dự kiến Sprint tiếp |
| **Phase 4: UGC Skins & Dorm Housing** | - Sàn giao dịch Trade Market giữa người chơi.<br>- Phòng KTX cá nhân và cơ chế bình chọn Upvote.<br>- Cổng tải lên Custom Spritesheet 48×64 px. | Dự kiến Sprint mở rộng |

---

*Tài liệu được bảo tồn cục bộ tại workspace FU-DEVER. Cam kết tuân thủ quy chuẩn không push remote khi chưa có yêu cầu để tiết kiệm quota Vercel.*

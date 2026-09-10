<div align="center">

<a href="https://github.com/huanight19RaH/DEVER_TOWN">
  <img src="./public/assets/logos/dever_logo_nontext.png" alt="FU-DEVER Logo" width="110" height="110" />
</a>

# 🎮 DEVER TOWN

### Thế Giới Pixel 2D Multiplayer của CLB FU-DEVER · FPT University Đà Nẵng

[![Status](https://img.shields.io/badge/Project-FU--DEVER%20Exclusive-f26f21.svg?style=for-the-badge)](https://www.fudever.com/)
[![Version](https://img.shields.io/badge/version-0.7.0-0066CC.svg?style=for-the-badge)](./package.json)
[![Phaser](https://img.shields.io/badge/Phaser-3.88-22c55e.svg?style=for-the-badge)](https://phaser.io)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101.svg?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![i18n](https://img.shields.io/badge/i18n-VN%20%7C%20EN-purple.svg?style=for-the-badge)](./src/config/i18n.js)

<p align="center">
  <img src="./.github/assets/social-preview.png" alt="DEVER TOWN Preview Banner" width="780" />
</p>

> **WORK HARD - PLAY HARD** · Không gian sinh hoạt kỹ thuật số Gather.town style dành riêng cho cộng đồng lập trình viên FUDA.  
> Gặp gỡ, học tập chuyên sâu, giải trí arcade, thi đấu thể thao ảo và khám phá 9 phân khu chức năng sống động!

🌐 [Landing Page](https://www.fudever.com/) &nbsp;·&nbsp; 📘 [Fanpage FU-DEVER](https://www.facebook.com/FPTUDever) &nbsp;·&nbsp; 📝 [Đăng Ký Thành Viên](https://forms.gle/2us1yB5Qp2HYejj28) &nbsp;·&nbsp; 🐙 [GitHub Org](https://github.com/fudever-club)

</div>

---

## 🌟 Tổng Quan Tính Năng Hệ Thống

DEVER TOWN là một nền tảng Metaverse 2D Pixel Art hoàn chỉnh, kết hợp giữa môi trường cộng đồng (Gather.town style), không gian học thuật CNTT và hệ sinh thái giải trí đa tầng.

```
                                  ┌───────────────────────┐
                                  │   TÒA ALPHA (SẢNH)   │
                                  │   Linh vật Cóc Vàng   │
                                  └───────────┬───────────┘
                 ┌────────────────────────────┼────────────────────────────┐
                 ▼                            ▼                            ▼
      ┌───────────────────────┐   ┌───────────────────────┐   ┌───────────────────────┐
      │   TÒA GAMMA (LAB)     │   │ TÒA BETA (THƯ VIỆN)   │   │  KHU THỂ THAO FUDA    │
      │ Code Sandbox + Server │   │ PE SWE201c + Lofi Pomo│   │ 11m + Bóng Rổ + Bơi   │
      └──────────┬────────────┘   └───────────────────────┘   └───────────────────────┘
                 │
                 ▼
      ┌───────────────────────┐   ┌───────────────────────┐   ┌───────────────────────┐
      │ ARCADE & ROBOT HUB    │   │  KHÔNG GIAN WEB & IT  │   │  CĂN TIN & CAFE LOUNGE│
      │ Snake, Sokoban, Gold  │   │ Landing + IT Helpdesk │   │ Thực đơn thật + Barista│
      └───────────────────────┘   └───────────────────────┘   └───────────────────────┘
```

---

## 🗺️ 1. Bản Đồ, Hệ Thống Đa Tầng & 25 CLB FPTU Đà Nẵng

Hệ thống gồm 9 bản đồ (Map Grid 25x19 tiles = 800x608 px) kết nối liền mạch qua các **Cổng Dịch Chuyển (Portal)** có cơ chế Cooldown chống kẹt cổng an toàn. Đặc biệt, **Tòa Alpha mở rộng hệ thống 3 Tầng Độc Lập** với cơ sở dữ liệu và ấn phẩm của **25 CLB chính thức trường ĐH FPT Đà Nẵng**:

| Phân Khu | Tên & Đặc Điểm | Vùng Tương Tác `[E]` Nổi Bật |
|:---|:---|:---|
| 🏛️ **Tòa Alpha (3 Tầng)** | **Tầng 1:** Sảnh đón tiếp, Cóc Vàng tâm linh & Hội trường<br>**Tầng 2:** Hub Học Thuật & Khởi Nghiệp (9 gian hàng CLB)<br>**Tầng 3:** Hub Nghệ Thuật, Kỹ Năng & Thể Thao (10 gian hàng CLB) | 24 Logo CLB chính thức + 19 Backdrop 3mx3m offline (0ms delay), Cầu thang đa tầng chuyển tầng mượt mà, Sân khấu họp toàn thể, Cóc Vàng Tâm Linh |
| 💻 **Tòa Gamma (Tech & AI Lab)** | Không gian Hackathon, trạm máy chủ và trạm code nhóm | Code Lab Sandbox hỗ trợ Judge0 CE + Paiza.io fallback, Bảng sơ đồ kiến trúc, Bàn họp kỹ thuật |
| 🕹️ **Tòa Gamma Plus (Arcade Studio)** | Khu vực máy game retro cổ điển & trung tâm game robot CLB | Rắn Săn Mồi 2.0 (Smooth 60fps), Đẩy Hộp Sokoban 2.0 (15 màn Microban), Vua Đào Vàng 2.0 (Nổ TNT dây chuyền) |
| 📚 **Tòa Beta (Thư Viện Tri Thức)** | Phòng tự học yên tĩnh, tài liệu ôn thi và quầy cafe | Tủ Cẩm nang ôn thi PE SWE201c, Quy chế hoạt động CLB, Quầy Cafe Lofi & Pomodoro, Bàn sổ tay code |
| 🏆 **Phòng Triển Lãm Kỷ Niệm** | Bảo tàng vinh danh thành tích & lịch sử 9+ năm FU-DEVER | Trạm Lịch sử 9+ năm, Bảng vàng 20+ giải thưởng ICPC & Hackathon, Album Teambuilding Biển Sơn Trà |
| 🌐 **Không Gian Web & IT Helpdesk** | Không gian số nhúng các cổng thông tin và dự án CLB | Cổng phần mềm thi EOS/PE & IT Helpdesk, Landing Page CLB, Member Portal, Kho dự án GitHub, Đơn tuyển quân |
| 📰 **Media Hub Học Vụ** | Cổng tiện ích học tập FPTU và mạng xã hội truyền thông | Cổng FAP, FLM, LMS FPTU, Fanpage CLB, TikTok FUDA, Kho GitHub Org |
| ⚽🏀 **Khu Phức Hợp Thể Thao** | Sân bóng cỏ nhân tạo, sân bóng rổ, cầu lông, hồ bơi | Sút Phạt Đền 11M 2.0, Ném Bóng Rổ Parabol & Swish 2.0, Bóng Chuyền 1v1 Vòm Đầu Đàn Hồi & Spike 2.0 |
| ☕🍽️ **Căn Tin & The High Deli** | Không gian ẩm thực sinh viên & lounge đồ uống | Quầy thực đơn 3 căn tin thực tế, Barista Simulator 2.0 (4 trạm: phân tầng chất lỏng & vẽ Latte Art tự do) |
| ↳ 🍵 **Vùng Vườn Trà FUDA (thuộc Tòa Alpha)** | Không gian sân vườn ngoài trời tĩnh lặng, thoáng đãng | Bàn trà đàm đạo, ghế đá thư giãn dưới tán hoa anh đào và làn gió thoảng |

---

## 👗 2. Hệ Thống Tủ Đồ & Tùy Biến Nhân Vật HD (Wardrobe Customizer 2.0)

Hệ thống đồ họa Pixel Art HD 48x48 với Canvas Preview xoay 360° thời gian thực:
- **Giới Tính & Giải Phẫu Riêng Biệt**:
  - *Nam Sinh FUDA*: Khung vai rộng 14px nam tính, ngực áo polo/hoodie có gập cổ, thắt lưng da nâu có mặt khóa kim loại vàng, nếp nhăn quần 3D, giày sneaker thể thao.
  - *Nữ Sinh FUDA*: Thon gọn 10px eo mềm mại, tà Áo Dài xẻ hông thướt tha, váy xếp ly đổ bóng sáng tối, mắt to long lanh có lông mi và má hồng đào.
- **6 Tông Màu Da Chân Thực (Skin Tones)**: Trắng Sáng Tinh Khôi, Vàng Tự Nhiên Á Đông, Bánh Mật Thể Thao, Nâu Khỏe Khoắn, Ngăm Đậm, Cyborg Android Xanh.
- **Đôi Mắt Có Hồn & Chớp Mắt Tự Nhiên (Blink Loop)**: Mỗi 3.5s chớp mắt tự nhiên; 5 biểu cảm: Tập trung code, Vui tươi, Nháy mắt cool, Ngạc nhiên, Thư thái.
- **Bộ Sưu Tập Râu & Chi Tiết Khuôn Mặt**: Không râu, Râu Quai Nón Senior Dev (`full_beard`), Ria Mép Lịch Lãm, Râu Cằm / Râu Dê, Râu Lún Phún Deadline, Râu Bạc Giáo Sư.
- **32 Bộ Trang Phục Đa Phong Cách**:
  - *Học đường & Đồng phục*: Áo Hoodie FUDA Cam, Áo Hoodie Xanh DEVER, Áo Polo FPTU, Đầm Nữ Sinh, Áo Dài Trắng Tinh Khôi, Áo Dài Cách Tân Đỏ, Đồng Phục Thủy Thủ Sailor, Sơ Mi Cà Vạt Học Viện.
  - *Công nghệ & Coder*: Áo Thun Dev Hackathon, Áo Bomber Cyberpunk Neon, Áo Choàng Hacker Matrix Dark, Bộ Giáp Mecha Android, Áo Open Source Linux Tux.
  - *Thể thao*: Áo Bóng Đá Số 10 Sân Cỏ, Áo Bóng Rổ Bulls Ba Lỗ, Đồ Gym Crop-top Nữ, Võ Phục Vovinam Đai Vàng, Đồ Bơi Surf.
  - *Streetwear & Nghề nghiệp*: Áo Da Biker, Áo Hip-hop Oversize, Cardigan Pastel, Yếm Denim Jean, Tạp Dề Barista Cà Phê Muối, Vest CEO, Blazer Nữ Công Sở, Áo Blouse Lab.
  - *Cosplay & Linh vật*: Áo Choàng Pháp Sư, Kimono Yukata Sakura, Đầm Dạ Hội Gala Prom, Bộ Đồ Mascot Cóc Vàng FUDA.
- **21 Kiểu Tóc & Bảng Màu Tóc Tùy Chỉnh**: Bổ sung *Tóc Hói Giáo Sư / Senior Dev (Bald with Side Hair)*, Short Dev, Long Wavy, Side Part, Ponytail, Undercut, Bob, Anime Spiky, Braids, Twin Tails,...
- **Phụ Kiện Đi Kèm**: Kính Cận Dev, Kính Râm Cyber, Tai Nghe Gaming RGB, Khẩu Trang Đen, Băng Đô Thể Thao, Vương Miện Cóc Vàng Hoàng Gia.

---

## 🎒 3. Hệ Thống Vật Phẩm Cầm Tay Thật Sự `[I]` (In-Hand Real Equipment)

Toàn bộ vật phẩm trang bị được gắn **trực tiếp lên bàn tay nhân vật** (xóa bỏ hoàn toàn bong bóng tròn lơ lửng cũ) với hoạt ảnh tương tác sống động:

1. 💻 **MacBook Pro Dev FUDA** *(Legendary)* — Mở nắp màn hình hắt sáng xanh cyber lên mặt nhân vật, hai tay gõ phím; kẹp hông khi di chuyển.
2. ☕ **Ly Cà Phê Muối Đặc Sản Đà Nẵng** *(Epic)* — Cầm ly cà phê trên tay phải, thấy rõ phân tầng chất lỏng và làn khói ấm bốc lên nghi ngút.
3. ⚽ **Quả Bóng Đá 11M FUDA** *(Rare)* — Cầm kẹp quả bóng bên sườn; tâng bóng nhịp nhàng trên mũi giày khi đứng yên.
4. 🏀 **Quả Bóng Rổ 3 Điểm FUDA** *(Rare)* — Đập bóng nảy nhẹ trên sàn thi đấu.
5. 🐸 **Gấu bông Cóc Vàng FUDA May Mắn** *(Mythic)* — Ôm chú Cóc Vàng may mắn trước ngực.
6. 🚩 **Cờ Hiệu CLB FU-DEVER** *(Legendary)* — Cầm cán cờ gỗ, lá cờ xanh phấp phới bay theo hướng di chuyển.
7. ⌨️ **Bàn phím cơ Keychron Custom** *(Epic)* — Switch Gateron Pro gõ lách cách tạo cảm hứng xuyên đêm.
8. 🖱️ **Chuột Gaming Công Thái Học** *(Rare)* — Siêu nhẹ, hỗ trợ fix bug tốc độ cao.
9. 🔑 **Móc khóa Thẻ Sinh Viên FUDA** *(Common)* — Dây đeo thẻ cam FPT nhận diện thương hiệu.
10. 🏆 **Cúp Vô Địch Hackathon FUDA** *(Mythic)* — Biểu tượng vinh quang của nhà vô địch lập trình.

---

## 🎯 4. Hệ Thống Nhiệm Vụ Hàng Ngày & Điểm Thưởng (Quests & DEVER Points)

- **8 Nhiệm Vụ Hàng Ngày Tự Động Reset**:
  - 🌅 *Điểm Danh Mỗi Ngày* (+20 pts)
  - ⚽ *Chân Sút Vàng 11m* (+30 pts)
  - 🏀 *Tay Ném 3 Điểm FUDA* (+30 pts)
  - ☕ *Coding Focus Lofi & Pomodoro* (+20 pts)
  - 🗺️ *Nhà Thám Hiểm FUDA* (+25 pts) — Đi qua ít nhất 3 phân khu
  - 💬 *Giao Lưu Kết Nối* (+15 pts) — Gửi tin nhắn chat trong phòng
  - ☕ *Thợ Pha Chế Barista* (+25 pts) — Pha thành công 1 ly Cà Phê Muối / Trà Sữa
  - 🔥 *Duy Trì Streak Bạn Thân* (+30 pts) — Tương tác bạn bè nuôi Pet Buggy
- **Các Mốc Điểm Danh Vọng**: Đạt 50, 100, 150 DEVER Points nhận danh hiệu và phần thưởng cá nhân.

---

## 🕹️ 5. Trung Tâm Trò Chơi Mini-Games Arcade 2.0 (Kiến Trúc Sub-Engines)

### ⚽🏀 Minigame Thể Thao Arcade 2.0 ([SportsArcade.js](file:///D:/THStudy/DeverClub/DEVER_TOWN/src/ui/minigames/SportsArcade.js))
- **Sút Phạt Đền & Đối Kháng 2 Chiều 11M (PenaltyShootoutEngine)**:
  - *Lượt Tiền Đạo:* Sút bóng uốn lượn có hàng rào chắn người nhảy cản phá, bia hồng tâm điểm thưởng treo ở góc chữ A (+150đ) và xà ngang.
  - *Lượt Thủ Môn:* Đảo góc nhìn từ trong khung thành ra sân; điều khiển đôi găng tay phản xạ đón bắt bóng của đối thủ trong thời gian thực (+120đ).
  - *Lưới bóng đá lò xo:* Spring-Mass Net Grid 8x6 rung sóng vật lý chân thực khi bóng vào lưới.
- **Ném Bóng Rổ Parabol & Swish Streak (BasketballShootoutEngine)**:
  - Quỹ đạo ném xiên parabol hoàn chỉnh ($v_x, v_y, g$), va chạm đàn hồi bảng rổ ($e=0.68$) và rung giật vành kim loại (Rim Rattle).
  - Cơ chế **SWISH!** xé lưới (+5đ); 3 quả liên tiếp kích hoạt bốc lửa **ON FIRE! 🔥** (nhân đôi điểm). Trụ rổ di chuyển đung đưa ở điểm số cao.
- **Bóng Chuyền 1v1 Vòm Đầu Đàn Hồi & Spike (VolleyballRallyEngine)**:
  - Vòm đầu bán nguyệt đàn hồi cao phản xạ góc bóng theo điểm tiếp xúc; nhảy đập bóng Spike uy lực dồn vệt lửa cắm sân đối phương; bot AI 3 cấp độ biết chắn lưới (Block). Triệt tiêu 100% lỗi dính lưới qua Positional Separation.
- **Barista FPTU Simulator 2.0 (BaristaSimulatorEngine)**:
  - Mô phỏng 4 trạm tương tác thực tế: Nhận đơn hàng khách FPTU kèm thanh kiên nhẫn $\rightarrow$ Thả đá & Rót chất lỏng phân tầng tỷ trọng $\rightarrow$ Đánh bọt kem vi mô đo độ sánh mịn $\rightarrow$ Rót bọt sữa vẽ Latte Art tự do với thuật toán chấm điểm 1–5 sao và thưởng tiền tips.

### 👾 Minigame Cổ Điển Arcade 2.0 ([RetroArcade.js](file:///D:/THStudy/DeverClub/DEVER_TOWN/src/ui/minigames/RetroArcade.js))
- **Rắn Săn Mồi Siêu Cấp 60FPS (SnakeEngine)**: Thân rắn uốn lượn mượt mà (không giật ô), cơ chế xả thân bứt tốc (Boost-Burn), 5 loại vật phẩm (Táo đỏ, Ớt cay, Nam châm, Kem tuyết, Cổng Portal) + Bộ lọc CRT Scanlines.
- **Đẩy Hộp Trí Tuệ 15 Màn Microban (SokobanEngine)**: Bộ 15 màn chơi kinh điển từ dễ đến cực khó, cơ chế sàn băng trơn (Ice Floor), ngăn xếp Hoàn Tác vô hạn (Undo qua phím U), thuật toán phát hiện kẹt góc Deadlock Detector và đánh giá 3 sao.
- **Vua Đào Vàng Nổ Dây Chuyền TNT (GoldMinerEngine)**: Cáp tời xích sắt cơ học, móc kẹp đóng mở, thùng thuốc nổ TNT nổ dây chuyền quét sạch chướng ngại vật, cửa hàng mua thuốc nổ Dynamite (bấm Space nổ đứt đá) và nước tăng lực.

---

## 📚 6. Không Gian Học Tập, Làm Việc & Đa Phương Tiện

- **Màn Chiếu Slide & Whiteboard**: Nhúng trực tiếp Google Slides thuyết trình, Excalidraw bảng vẽ kiến trúc hệ thống.
- **Live JavaScript Sandbox & Markdown Notepad**: Trình biên tập mã nguồn trực tiếp trên web + Sổ tay ghi chú lập trình.
- **Quầy Lofi Radio 6 Thể Loại & Bộ Đếm Pomodoro**:
  - Tích hợp YouTube Audio Embed với 6 phong cách: Chill Lofi, Coding Focus, Synthwave 80s, Acoustic Cafe Đà Nẵng, Jazz Hop, Piano Study.
  - Đồng hồ Pomodoro 25 phút làm việc / 5 phút nghỉ ngơi kèm âm thanh chuông báo Web Audio API.
- **Phòng Họp Trực Tuyến Video**: Tích hợp Jitsi Meet / Google Meet kết nối micro & camera ngay trong không gian 2D.
- **Cẩm Nang Ôn Thi SWE201c & Quy Chế CLB**: Tài liệu ôn tập PE, quy chế và định hướng phát triển dành cho thành viên.

---

## 💬 7. Live Chat Realtime & Bộ Sticker Độc Quyền

- **Trò Chuyện Đa Kênh**: Chat nội bộ toàn phòng theo thời gian thực với font chữ tiếng Việt hỗ trợ Unicode đầy đủ.
- **Bong Bóng Thoại Bay (Speech Bubbles)**: Tin nhắn tự động hiển thị trên đầu nhân vật và biến mất sau 5 giây.
- **Kho Sticker Nhận Diện Độc Quyền**:
  - Bộ 20 Sticker **Buggy Mascot** vui nhộn.
  - Bộ 11 Sticker **FU-DEVER Club** biểu cảm đa dạng.

---

## 🔐 8. Bảo Mật, Đa Thiết Bị & Quản Lý Tài Khoản

- **Chế Độ Khách (Guest Mode)**: Vào trải nghiệm ngay lập tức không cần đăng ký, tự do đặt biệt danh (tự động chặn các tên cấm / trùng tên hệ thống).
- **Tài Khoản Thành Viên & Ban Quản Trị**:
  - Đăng ký/đăng nhập qua Email & Mật khẩu mã hóa **bcrypt** (salt rounds = 10).
  - Cấp mã thông báo **JWT (JSON Web Token)** phiên bản bảo mật cao.
  - Hệ thống phân quyền Role Badges: `guest`, `dev`, `leader`, `admin`.
  - Tự động đồng bộ toàn diện Profile, Wardrobe, Inventory, Quests và Game Records vào Database.
- **Bảo Vệ Đăng Nhập Đa Thiết Bị (Single Character In World Handoff)**:
  - Khi một tài khoản đang hoạt động mà có lượt đăng nhập từ máy khác, hệ thống sẽ bảo vệ phiên và bật **Device Approval Modal** yêu cầu thiết bị cũ Chấp thuận / Từ chối (kèm IP, thời gian và User-Agent).
- **Hạ Tầng Bảo Mật Toàn Diện**:
  - **Rate Limiter**: Giới hạn tần suất gọi API (chống DDoS / brute-force mật khẩu).
  - **XSS Sanitization**: Tự động lọc các thẻ HTML độc hại trong form nhập liệu.
  - **Security Headers**: HSTS, nosniff, frame-guard, XSS protection.

---

## 🎵 9. Âm Thanh 8-Bit Chiptune & Đa Ngôn Ngữ (Audio Engine & i18n)

- **Web Audio API Synthesizer**: Trình tổng hợp âm thanh procedural 8-bit tự tạo trực tiếp qua trình duyệt (bước chân, portal warp, tiếng còi sân cỏ, tiếng ghi bàn, mở túi đồ, nhặt item, click UI, tiếng chuông combo).
- **Nhạc Nền Chiptune Procedural**: Bản giao hưởng 8-bit vui tươi (C Major / Pentatonic) tự sinh nốt qua Oscillator, không cần tải bất kỳ file MP3 ngoài nào, có nút bật/tắt BGM trên Header.
- **Chuyển Đổi Song Ngữ Tức Thì (i18n)**: Hỗ trợ chuyển đổi nhanh giữa **Tiếng Việt 🇻🇳** và **English 🇬🇧** trên toàn bộ giao diện, modal, HUD và menu cài đặt.

---

## ⚡ 10. Radar HUD, Đấu Trí Siêu Tốc & Biểu Cảm (Gamification)

- **Radar Minimap HUD (`MinimapOverlay.js`)**: Bản đồ radar quét 2D thời gian thực trên lưới 25x19 hiển thị vị trí người chơi, cổng portal và các trạm tương tác. Phím tắt `[M]`, tự động co gọn dạng viên thuốc `[RADAR HUD ⌄]` trên điện thoại.
- **Đấu Trí Lập Trình Siêu Tốc (`SpeedCodeDuel.js`)**: Minigame 10 câu hỏi code Python, thuật toán và toán nhẩm nhịp độ cao. Cơ chế nhân điểm Combo Streak (`x1.5` -> `x3 🔥🔥`), bảng đếm ngược khẩn cấp và xếp hạng danh hiệu (*Huyền Thoại DEVER 🏆, Bậc Thầy Tính Nhẩm ⭐*). Phím tắt `[Z]` hoặc nút `[⚡]`.
- **Thanh Biểu Cảm & Nhảy Múa (`EmoteBar.js`)**: Phím tắt `[G]` hoặc nút `[✨]`. Cung cấp 6 biểu cảm: Vẫy chào 👋, Thả tim ❤️, Lửa cháy 🔥, Vỗ tay 👏, Nhảy múa 🕺 (kèm animation nhún nhảy sprite), Dấu hỏi ❓.

---

## 🌟 11. Hạt Khí Quyển, Game Feel "Juice" & Hệ Thống Danh Hiệu

- **Hạt Môi Trường Động Học (`AmbientEnvironmentManager.js`)**: Hệ thống hạt WebGL 60fps mô phỏng khí quyển riêng biệt cho 9 phòng (cánh hoa trà ở Vườn Trà, khói cafe ở Căn Tin, hạt neon ở Lab, bụi nắng ở Thư Viện, bọt nước ở Bể bơi, tia lửa ở Arcade, bụi bước chân khi chạy).
- **Động Cơ Xúc Cảm Phản Hồi ("Juice" - `JuiceManager.js`)**: Chữ số bay đàn hồi (Floating Score Text: `+10 ĐIỂM!`, `+100 ĐIỂM!`), rung camera micro-shake 120ms, pháo hoa giấy Confetti ăn mừng và hiệu ứng nảy số điểm (DOM Pulse).
- **Hệ Thống 8 Danh Hiệu Thành Tựu (`AchievementManager.js`)**: Mở khóa các danh hiệu độc bản (*Tân Thủ DEVER, Coder Thần Tốc, Cà Phê Muối Đà Nẵng, Lộc Cóc Vàng, Tiền Đạo FUDA, Tín Đồ Công Nghệ, Vũ Công Sàn Diễn, Sinh Viên Gương Mẫu*), hiển thị Golden Toast Banner kèm kèn Fanfare 8-bit hào hùng.
- **Live Campus Ticker (`CampusTicker.js`)**: Thanh tin tức trực tiếp luân phiên cập nhật các mẹo khám phá và sự kiện ở chân trang.

---

## 📱 12. Đa Nền Tảng & Bảng Phím Điều Khiển

| Thao Tác | Phím Tắt PC | Nút Cảm Ứng Mobile / Tablet |
|:---|:---|:---|
| **Di Chuyển 4 Hướng** | `W A S D` hoặc `Phím Mũi Tên` | Cụm D-Pad Ảo (Bên Trái) |
| **Tương Tác Sự Kiện / Zone** | `Phím E` hoặc `Space` | Nút Lớn `[E]` (Bên Phải, Cam Dạ Quang) |
| **Mở Túi Đồ & Trang Bị** | `Phím I` | Nút `[🎒]` (Hàng Dưới Ngón Cái) |
| **Biểu Cảm & Nhảy Múa** | `Phím G` | Nút `[✨]` (Hàng Cung Ngón Cái, Tím Neon) |
| **Đấu Trí Lập Trình Siêu Tốc** | `Phím Z` | Nút `[⚡]` (Hàng Cung Ngón Cái, Cyan Neon) |
| **Bật / Tắt Radar HUD** | `Phím M` | Chạm vào thanh `[RADAR HUD ⌄]` |
| **Trò Chuyện Trực Tiếp** | `Phím Enter` | Nút `[💬]` (Bên Cạnh Cụm Ngón Cái) |
| **Đóng Cửa Sổ / Thoát** | `Phím Esc` | Nút `✕` trên thanh tiêu đề Modal |
| **Toàn Màn Hình** | `Phím F11` | Tự động thích ứng Viewport |

> 💡 **Công Thái Học Mobile (Zero-Overflow)**: Giao diện đạt chuẩn không tràn viền 100% trên mọi kích thước màn hình từ iPhone SE (375px) đến iPad Mini (768px).

---

## 🛠️ Tech Stack, Database & Tài Liệu API

```
Frontend     │  Phaser 3.88 (2D WebGL Engine) + Vite 6 + Vanilla JS ES Modules
Backend      │  Node.js 18+ + Express 4 + Socket.io 4 (WebSocket Realtime)
Database     │  PostgreSQL Supabase (Production AWS Singapore) + JSON File Adapter (Dev Fallback)
Testing      │  Playwright Test Suite (58/58 Tests Passed 100% trên Desktop & Mobile)
Mail Service │  Resend API & Nodemailer (Mã OTP 6 số phục hồi mật khẩu)
Styling      │  CSS Glassmorphism Design System + Cyberpunk Neon Accents
Audio        │  Web Audio API Synthesizer 8-bit procedural chip
Desktop      │  Electron Native Wrapper
API Docs     │  Xem chi tiết tại docs/API_DOCUMENTATION.md
```

📖 **Xem tài liệu chi tiết:**
- 📡 [Đặc Tả Toàn Diện REST API & Realtime Socket.io](./docs/API_DOCUMENTATION.md)
- 📘 [Báo Cáo Tiến Trình Dự Án](./docs/progress/TIEN_TRINH_DU_AN.md)
- 🚀 [Hướng Dẫn Triển Khai Deployment 3 Hướng](./docs/deployment/DEPLOYMENT_GUIDE_3_HUONG.md)

---

## 📁 Cấu Trúc Thư Mục Dự Án

```
DEVER_TOWN/
├── 📁 docs/                # Toàn bộ tài liệu, plans, deployment & content
│   ├── 📁 content/         # Kịch bản & nội dung thực tế FUDA
│   ├── 📁 deployment/      # Hướng dẫn triển khai 3 hướng chi tiết
│   ├── 📁 media/           # Raw assets & sticker sources gốc
│   ├── 📁 plans/           # Kế hoạch phát triển các phiên bản (v1, v2, v3)
│   └── 📁 progress/        # Tiến trình & nhật ký dự án
├── 📁 electron/            # Desktop App (Electron main process)
├── 📁 public/              # Assets tĩnh cho Web Game (campus, logos, stickers)
├── 📁 scripts/             # Kịch bản kiểm thử tải (Stress test)
├── 📁 server/              # Backend Node.js
│   ├── 📁 controllers/     # Controller layer (authController, roomController, gameController)
│   ├── 📁 data/            # JSON DB files (chế độ local development)
│   ├── 📁 db/              # Database Adapters (File Adapter / PostgreSQL Adapter)
│   ├── 📁 middleware/      # Rate Limiter, XSS Sanitizer, Auth JWT
│   ├── 📁 routes/          # REST API endpoints (auth, room, game)
│   ├── 📁 services/        # Mail & business services
│   ├── 📁 socket/          # Socket.io Realtime Handler & Player Manager
│   └── server.js           # Entry point Backend Server
├── 📁 src/                 # Frontend Source Code (Phaser 3 + Vanilla JS)
│   ├── 📁 config/          # Cấu hình maps, items, controls, i18n, wardrobe, robotGames
│   ├── 📁 entities/        # Player, RemotePlayer (Pixel Art Sprites & Animations)
│   ├── 📁 managers/        # EventBus, InteractionManager, InventoryManager, QuestManager
│   ├── 📁 network/         # Socket.io Client Manager & Single Character Sync
│   ├── 📁 scenes/          # Phaser Scenes (BootScene, WorldScene)
│   ├── 📁 services/        # API Client Services (AuthService)
│   ├── 📁 styles/          # CSS Design System (Glassmorphism & Game HUD)
│   ├── 📁 ui/              # UI Components (Phân nhóm theo module)
│   │   ├── 📁 auth/        # WelcomeGate, AuthModal, NicknameModal, DeviceApprovalModal
│   │   ├── 📁 gameplay/    # InteractiveModal, InventoryModal, QuestModal, WardrobeModal
│   │   ├── 📁 minigames/   # SportsArcade, RetroArcade, PomodoroTimer
│   │   ├── 📁 common/      # ChatBox, SettingsModal, TouchControls, OnboardingGuide, NetworkStatusOverlay
│   │   └── index.js        # Barrel export tập trung
│   └── 📁 utils/           # TextureGenerator, AudioManager (Web Audio API)
├── index.html              # App Entry HTML
├── vite.config.js          # Vite Build Config
├── render.yaml             # Render.com Deploy Config
├── vercel.json             # Vercel Deploy Config
└── package.json
```

---

## 💡 Nguồn Cảm Hứng & Tri Ân (Inspirations & Credits)

DEVER TOWN là dự án sinh thái kỹ thuật số nội bộ, phi thương mại phục vụ sinh viên và thành viên CLB Lập trình FU-DEVER. Dự án được phát triển from scratch dựa trên nguồn cảm hứng từ các tựa game và nền tảng kinh điển:

- **Gather.town** — Cảm hứng về mô hình không gian số 2D tương tác cộng đồng, hội họp và kết nối trực tuyến theo khoảng cách lân cận (*proximity video/voice interaction*).
- **Pokémon GBA Series (Game Freak / Nintendo)** — Cảm hứng về phong cách nghệ thuật Pixel Art Top-down overworld, cơ chế di chuyển theo lưới ô vuông và các hiệu ứng tương tác sinh động với môi trường.
- **Stardew Valley (ConcernedApe)** — Cảm hứng về phối cảnh Oblique 2.5D, sắp xếp chiều sâu layer hiển thị (*Y-sort depth*), không gian ấm cúng và trải nghiệm đa tầng.
- **Phaser 3 Game Engine (Photon Storm)** — Nền tảng game engine 2D mã nguồn mở mạnh mẽ vận hành thế giới WebGL / Canvas của DEVER TOWN.

> ⚖️ **Tuyên bố sở hữu trí tuệ & miễn trừ trách nhiệm**: Mọi thương hiệu, tên thương mại, phong cách nghệ thuật gợi nhớ và quyền sở hữu trí tuệ của các tựa game/nền tảng kể trên đều thuộc quyền sở hữu của các tác giả và đơn vị phát hành tương ứng. DEVER TOWN được xây dựng hoàn toàn từ đầu bởi đội ngũ kỹ thuật CLB FU-DEVER phục vụ học thuật, rèn luyện kỹ năng và phong trào sinh viên Đại học FPT Đà Nẵng.

---

## 📜 Bản Quyền & Quyền Sở Hữu Độc Quyền

Dự án là sản phẩm độc quyền được sáng lập, sở hữu và phát triển nội bộ bởi tác giả và **CLB Lập trình FU-DEVER · FPT University Đà Nẵng (FUDA)**.

- Toàn bộ mã nguồn, thiết kế đồ họa pixel, bản quyền phân khu và tài nguyên dự án thuộc quyền quản trị nội bộ của CLB FU-DEVER.
- Dự án không tiếp nhận đóng góp bên ngoài (Closed for external contributions & PRs). Mọi quyền sửa đổi, nâng cấp và phát hành thuộc độc quyền của tác giả và ban kỹ thuật CLB.

© 2026 **FU-DEVER Club · FPT University Đà Nẵng (FUDA)**  
Tác giả & Trưởng dự án: [RaH11 (Nguyen Thai Hung)](https://github.com/huanight19RaH) · `hungnguyen.190206@gmail.com`

<div align="center">

**Made with ❤️ by FU-DEVER · WORK HARD - PLAY HARD**

[🌐 Landing Page](https://www.fudever.com/) &nbsp;·&nbsp;
[📘 Fanpage FU-DEVER](https://www.facebook.com/FPTUDever) &nbsp;·&nbsp;
[🏛️ Fanpage FUDA](https://www.facebook.com/daihocfptdanang) &nbsp;·&nbsp;
[🎵 TikTok FUDA](https://www.tiktok.com/@daihocfptdanang) &nbsp;·&nbsp;
[🐙 GitHub Org](https://github.com/fudever-club)

</div>

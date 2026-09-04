# DEVER TOWN — PRODUCT SPECIFICATION & OPERATIONS BLUEPRINT
**Tài liệu Đặc Tả Sản Phẩm & Quy Chuẩn Vận Hành Toàn Diện**  
*Dự án: DEVER TOWN (Thế giới ảo Pixel 2D Gather.town style cho CLB FU-DEVER & Sinh viên FPTU)*  
*Phiên bản: 1.0 (Áp dụng từ v0.4.1+)*  
*Đơn vị phát triển: FU-DEVER Club — FPT University Đà Nẵng*

---

## 1. TỔNG QUAN VÀ TẦM NHÌN SẢN PHẨM (EXECUTIVE SUMMARY)

DEVER TOWN là không gian số tương tác thời gian thực (Real-time 2D Pixel Metaverse) mang phong cách Gather.town, được thiết kế chuyên biệt cho sinh viên Đại học FPT Đà Nẵng (FUDA) và cộng đồng lập trình viên FU-DEVER. Nền tảng hợp nhất ba trụ cột: **Kết nối cộng đồng (Social)**, **Học thuật & Công nghệ (Learn)** và **Giải trí tương tác (Play)** trong một không gian pixel art ấm cúng, mượt mà trên cả máy tính và thiết bị di động.

---

## 2. BẢN ĐẶC TẢ CHI TIẾT 18 TIÊU CHÍ CHIẾN LƯỢC & VẬN HÀNH

### 1. Chân Dung Người Chơi Ưu Tiên (Target Personas)
* **Nhóm trọng tâm số 1 (Core Persona):** Sinh viên chuyên ngành Kỹ thuật Phần mềm (SE), An toàn Thông tin (IA), Trí tuệ Nhân tạo (AI), Thiết kế Đồ họa (GD) tại Đại học FPT Đà Nẵng. Nhu cầu chính: Tra cứu tài liệu thi, gặp gỡ bạn cùng khóa, khám phá không gian số của trường.
* **Nhóm trọng tâm số 2 (Active Members):** Thành viên chính thức và ứng viên các thế hệ của CLB FU-DEVER (Admin, Leader, Dev). Nhu cầu: Sinh hoạt nội bộ, tổ chức workshop, quản lý dự án và thi đấu lập trình.
* **Nhóm mở rộng (Community):** Tân sinh viên (K20, K21...) chuẩn bị nhập học FPTU, học sinh THPT tham quan trải nghiệm văn hóa công nghệ trường và cộng đồng lập trình viên đối tác.
* **Khuyến nghị Game Design (Recommendation):** Định vị DEVER TOWN như một *"Digital Clubhouse"* (ngôi nhà số ấm cúng của CLB) thay vì một game cày cuốc; chú trọng cảm giác thân thuộc, gần gũi với giảng đường và văn hóa FPTU.

### 2. Nhân Khẩu Học, Nền Tảng & Thiết Bị (Demographics & Platforms)
* **Độ tuổi:** 18 – 23 tuổi (Gen Z, yêu thích công nghệ, chuộng tương tác trực quan và đồ họa pixel art).
* **Nền tảng & Thiết bị mục tiêu:**
  1. *Desktop / Laptop (70% thời lượng):* Trình duyệt Chrome, Edge, Brave, Firefox trên Windows & macOS. Độ phân giải phổ biến: 1366x768 đến 1920x1080.
  2. *Mobile Web (30% thời lượng):* Safari (iOS), Chrome (Android) với màn hình 360px – 430px. Tích hợp Touch D-Pad, các nút kích hoạt nhanh ngón cái (Quick Emotes, Speed Duel) và tự động gập gọn Radar HUD để tối ưu không gian nhìn.
* **Khuyến nghị Game Design (Recommendation):** Duy trì tỷ lệ khung hình chuẩn 16:9 với camera zoom 1.32x trên Desktop; trên Mobile Web tự động ẩn thanh địa chỉ trình duyệt khi cuộn và hỗ trợ xoay ngang (landscape) để bao quát toàn phòng.

### 3. Mục Tiêu Giữ Chân Người Dùng (Retention & Engagement Targets)
* **Day-1 Retention (D1):** $\ge 40\%$ (Mục tiêu cao, đạt được nhờ cơ chế Chơi Ngay không cần tạo tài khoản + Quẻ bói Cóc Vàng Tâm Linh mỗi ngày).
* **Day-7 Retention (D7):** $\ge 20\%$ (Duy trì nhờ chuỗi nhiệm vụ tuần, bảng vinh danh Hall of Fame và lịch sinh hoạt CLB).
* **Thời lượng phiên trung bình (Session Length):** 12 – 18 phút/phiên.
* **Tỷ lệ quay lại hàng tháng (MWR):** $\ge 30\%$.
* **Khuyến nghị Game Design (Recommendation):** Thiết lập cơ chế *"Daily Ritual"* (Nghi thức hàng ngày) — người chơi vào game để xin quẻ Cóc Vàng, kiểm tra nhiệm vụ ngày và điểm danh streak để giữ chân người chơi tự nhiên.

### 4. Hiện Trạng Chỉ Số Cơ Sở (Baseline Metrics)
* **DAU / WAU giai đoạn v0.4.1:** 30 – 50 DAU (các đợt playtest nội bộ); 120 – 150 WAU.
* **Tỷ lệ Onboarding Conversion:** $\ge 95\%$ người dùng nhập nickname và bước vào Sảnh Alpha thành công trong vòng 5 giây đầu tiên (Bounce rate < 5%).
* **Khuyến nghị Game Design (Recommendation):** Tích hợp bộ ghi sự kiện nội bộ nhẹ (Internal Lightweight Telemetry) thay vì nhúng Google Analytics nặng nề, đo chính xác phễu chuyển đổi qua từng phòng và thời gian dừng lại ở từng zone.

### 5. Hạ Tầng Triển Khai & Quyền Hạn Hệ Thống (Infrastructure & Access Control)
* **Production Client:** Vercel Hosting tự động triển khai từ nhánh `main` (Domain tùy biến `town.fudever.com`).
* **Production Server / Realtime Socket:** Máy chủ Render / VPS chạy Node.js + Socket.io.
* **Staging / QA Environment:** Vercel Preview Deployments tự động từ các nhánh tính năng (`develop_hung`, `develop`).
* **Phân quyền hệ thống:** `guest` $\rightarrow$ `dev` $\rightarrow$ `leader` $\rightarrow$ `admin`. Ban Quản Trị có quyền xem log hệ thống, cơ sở dữ liệu PostgreSQL và số liệu người chơi trực tuyến.

### 6. Chính Sách Dữ Liệu, Telemetry & Quyền Riêng Tư (Privacy & Telemetry Guard)
* **Dữ liệu được phép thu thập:** Lượt vào phòng, kỷ lục minigame, tiến trình nhiệm vụ, báo cáo lỗi JavaScript ẩn danh.
* **QUY ĐỊNH BẤT KHẢ XÂM PHẠM — DỮ LIỆU TUYỆT ĐỐI KHÔNG ĐƯỢC LƯU:**
  * Tuyệt đối không lưu mật khẩu dạng văn bản thô (Plain-text Password) — bắt buộc băm bằng `bcrypt` salt 10 rounds.
  * Không lưu mã OTP sau khi người dùng đã đổi mật khẩu thành công.
  * Không can thiệp clipboard hoặc dữ liệu bên ngoài tab game.
  * Không thu thập thông tin CCCD, thẻ sinh viên hoặc tài khoản ngân hàng.

### 7. Trọng Tâm Sản Phẩm & Thứ Tự Ưu Tiên (Core Product Pillars)
Quyết định chiến lược đã phê duyệt:
$$\text{Social (50\%)} > \text{Learn (30\%)} > \text{Play (20\%)}$$
1. **Social (50% - Trọng tâm số 1):** Metaverse kết nối bạn bè, bong bóng chat trực tiếp, biểu cảm nhảy múa, tụ tập tại Vườn Trà Sảnh Alpha, Góc Cafe Acoustic Căn Tin và Bàn Thảo Luận Tech Lab.
2. **Learn (30% - Giá trị lâu dài):** Tủ Cẩm nang ôn thi PE/FE SWE201c, IT Helpdesk & phần mềm thi FPTU (EOS, FAP, FLM, LMS), Slide đào tạo kỹ thuật, Kho dự án thực chiến của CLB.
3. **Play (20% - Gia vị giữ chân):** Hệ thống Minigames tốc độ cao (Sút bóng penalty, ném bóng rổ, pha chế cà phê muối, Cyber Snake, Buggy Sokoban, Đào vàng Cóc Vàng, Speed Code Duel) đóng vai trò xúc tác tạo niềm vui và điểm thưởng giao lưu.
* **Khuyến nghị Game Design (Recommendation):** Learn là *"Lý do chính đáng để vào"* (học tập, tra cứu), Play là *"Gia vị xả stress"*, và Social là *"Chất keo giữ chân vĩnh viễn"*.

### 8. Thống Kê Hành Vi: Hoạt Động Yêu Thích vs Bỏ Dở (Behavioral Insights)
* **Hoạt động yêu thích nhất:**
  * Tùy biến trang phục trong Tủ đồ (Hoodie FUDA, phụ kiện tai nghe, kính râm, tóc nam/nữ).
  * Xin quẻ Cóc Vàng Tâm Linh tại Sảnh Alpha (`zone_main_frog`).
  * Đấu trí Speed Code Duel và các minigame thể thao / pha chế.
  * Chat bong bóng và biểu cảm icon nhảy múa cùng đồng đội.
* **Hoạt động dễ bị bỏ dở (Cần tối ưu UX):**
  * Các tài liệu/slide có khối lượng chữ quá dày đặc mà không có infographic tóm tắt.
  * Đọc thực đơn nếu danh sách món quá dài không có bộ lọc phân loại giá tiền.

### 9. Đúc Kết Từ Playtest & Phỏng Vấn Thực Tế (Playtest Feedback)
* *Khảo sát 1:* Người chơi đánh giá rất cao việc được vào game tức thì bằng Guest Mode 1-click.
* *Khảo sát 2:* Cần duy trì phím tắt công thái học đồng nhất (`[E]` tương tác, `[I]` túi đồ, `[M]` radar minimap, `[G]` thanh biểu cảm, `[Escape]` đóng modal).
* *Khảo sát 3:* Trải nghiệm di chuyển và kích hoạt phím `[E]` phải hoàn toàn chuẩn xác, không bị delay hoặc kẹt góc tường (đã giải quyết triệt để tại v0.4.1).

### 10. Vận Hành Cộng Đồng & Chuỗi Sự Kiện (Community Operations)
* **Workshop Kỹ Thuật (Hàng tháng):** Tổ chức trực tiếp tại phòng Tech Lab (`dever_lab`) và Sảnh Đón Tiếp (`main_hall`), diễn giả đứng trên bục `zone_lab_meeting`, chiếu slide chính thức của CLB.
* **Giải Đấu Speed Code & Esports Arcade (Định kỳ):** Tổ chức tại Bàn Thi Đấu Game & Livestream (`zone_arcade_meeting`).
* **Đội ngũ phụ trách:** Ban Nội dung & Ban Kỹ thuật FU-DEVER định kỳ bảo trì ngân hàng câu hỏi lập trình, tài liệu học phần và thực đơn căn tin.

### 11. Nền Kinh Tế Điểm Thưởng & Chống Gian Lận (Economy & Anti-Farming)
* **Cơ chế tích lũy Dever Points (DP):**
  * Hoàn thành Nhiệm Vụ Hàng Ngày (Daily Quests): +20 đến +50 DP/nhiệm vụ.
  * Khám phá đủ 8 phân khu chức năng: +100 DP (Thành tựu Tân thủ).
  * Thắng trận đấu Speed Code Duel: +30 DP.
  * Kỷ lục Minigames (Bóng đá, bóng rổ, pha chế, đào vàng): +10 đến +25 DP.
* **Giá trị sử dụng của Dever Points:**
  * Mở khóa trang phục, kiểu tóc, phụ kiện độc quyền trong Tủ đồ (Wardrobe).
  * Đổi danh hiệu hiển thị trên đầu nhân vật.
  * Đổi vé tham gia Workshop VIP, quà tặng hiện vật (Sticker pack, áo CLB, móc khóa FUDA) tại các sự kiện offline.
* **Quy tắc Chống Farming (Anti-Farming Rules):**
  * Giới hạn trần điểm kiếm từ minigame: Tối đa **500 DP / ngày / tài khoản**.
  * Quẻ Cóc Vàng chỉ phát quà 1 lần duy nhất mỗi ngày (reset lúc 00:00).
  * Xác thực điểm và token bảo mật qua API `PUT /api/auth/sync-profile` phía server (Zero-trust client score).

### 12. Cơ Chế Chuyển Đổi Guest Sang Account & Đồng Bộ (Guest Migration & Sync)
* **Zero Friction Entry:** Người chơi vào game tức thì với tư cách Guest, tiến trình tạm thời được lưu trong `localStorage`.
* **Auto-Merge Khi Đăng Ký / Đăng Nhập:**
  * Khi người dùng từ Guest tiến hành Đăng ký hoặc Đăng nhập tài khoản chính thức, hệ thống tự động gộp (merge) toàn bộ Dever Points, trạng thái nhiệm vụ, tủ đồ và kỷ lục trò chơi của Guest vào tài khoản server.
* **Multi-Device Synchronization:**
  * Mọi thay đổi về tủ đồ, trang bị và điểm số của tài khoản chính thức được đồng bộ tức thì lên Database thông qua `authService.syncFullProfile()`.

### 13. Kiểm Soát Nội Dung & An Toàn Cộng Đồng (Moderation & Safety)
* **Bộ lọc từ cấm tự động (Profanity Filter):** Chạy ở cả Client và Server, tự động phát hiện và thay thế từ ngữ tục tĩu bằng ký tự `***`.
* **Client-side Ignore/Mute:** Người chơi có thể tự ẩn tin nhắn từ đối tượng làm phiền trên màn hình cá nhân.
* **Quyền hạn Ban Quản Trị:** Lệnh quản trị `/kick <username>` và `/mute <username> <minutes>` gửi qua Socket dành riêng cho role `admin` hoặc `leader` để xử lý vi phạm tức thì.

### 14. Nguồn Chuẩn Duy Nhất Cho Bản Đồ (Single Source of Truth - SSOT)
* **Kiến trúc chuẩn hóa (Architectural Decision):**
  * Chọn Client `src/config/maps.js` (hoặc thư mục dùng chung `shared/maps.json`) làm **Master Single Source of Truth (SSOT)**.
  * Server backend sẽ import trực tiếp file này lúc khởi động, loại bỏ hoàn toàn nguy cơ lệch metadata tọa độ zone hoặc portal giữa frontend và backend khi cập nhật.

### 15. Ngân Sách Hiệu Năng & Giới Hạn Phần Cứng (Performance Budget)
* **Cấu hình sàn hỗ trợ (Lowest Hardware Spec):**
  * Thiết bị: Smartphone Android RAM 2GB, chip Snapdragon 450 / Helio P35.
  * Mạng: 3G/4G ổn định với độ trễ $\le 150\text{ms}$.
* **Chỉ số hiệu năng cam kết:**
  * Tốc độ khung hình: Duy trì ổn định $55 - 60\text{ FPS}$.
  * Heap Memory tiêu thụ trên trình duyệt: $\le 25\text{ MB}$.
  * Dung lượng Bundle sản phẩm (Vite build gzipped): $\le 500\text{ KB}$ JS.
  * Tần số đồng bộ Socket: Throttling vị trí người chơi ở mức $40 - 50\text{ms}$/lần (chỉ gửi khi vị trí có sự thay đổi).

### 16. Lộ Trình Phát Triển & Giới Hạn Thay Đổi (Release Roadmap & Scope)
* **Phiên bản hiện tại (v0.4.1):** Ổn định hoàn hảo hệ thống tương tác phím `[E]`, chuẩn hóa tọa độ 8 phân khu, diệt trừ lỗi crash auth, kiểm thử Playwright đạt 100% xanh.
* **Mốc phát triển tiếp theo (v0.5.0 - Trong 2-3 tuần tới):**
  * Trọng tâm: Hoàn thiện Tính Năng Xã Hội (Social).
  * Hạng mục cụ thể: Cơ chế Auto-merge Guest sang Account, Bảng vinh danh Hall of Fame, và Thử nghiệm WebRTC Proximity Voice Chat cho các buổi họp nhóm nhỏ.
* **Quy tắc cô lập:** Tuyệt đối không thay đổi collider, spawn point hoặc map layout của các phòng đang vận hành ổn định.

### 17. Bộ Quy Chuẩn Thương Hiệu & Mỹ Thuật (Brand Identity & Assets)
* **Bảng màu nhận diện chính:**
  * FPT Orange: `#F26F21` (Điểm nhấn, viền tương tác, thông báo quan trọng).
  * DEVER Sky Blue: `#38BDF8` / `#0066CC` (Màu thương hiệu công nghệ CLB).
  * Deep Space Navy: `#0F172A` (Nền giao diện đêm sang trọng, không gây chói mắt).
  * Emerald Green: `#10B981` (Thành tựu, điểm thưởng, trạng thái online).
* **Mỹ thuật Pixel Art:**
  * Kích thước Tile chuẩn: $32 \times 32\text{ px}$.
  * Nhân vật: $32 \times 48\text{ px}$ với đầy đủ 4 hướng chuyển động (idle/walk).
* **Âm thanh:** Âm thanh Chiptune 8-Bit độc quyền được tạo tự động bằng bộ tổng hợp dao động Web Audio API, không tốn dung lượng tải file âm thanh ngoài.

### 18. Thử Nghiệm A/B & Feature Flags (Experimentation Framework)
* **Cơ chế Feature Flag:** Tích hợp bộ cờ bật/tắt tính năng thông qua `GAME_CONFIG.FEATURES` và `localStorage` (ví dụ: `FEATURE_VOICE_CHAT: false`, `FEATURE_RADAR_COLLAPSE: true`).
* **Quy trình thử nghiệm:** Cho phép tài khoản Tester/Dev kích hoạt thử nghiệm tính năng mới trên người dùng thật trước khi rollout rộng rãi cho toàn thể sinh viên FPTU.

### 19. Sức Chứa Phòng & Phân Kênh Tự Động (Room Capacity & Auto-Instancing)
* **Ngưỡng sức chứa tiêu chuẩn:** Tối đa **40 – 50 người chơi / phòng**.
* **Cơ chế phân kênh (Dynamic Channeling):** Khi một phòng đạt quá 50 người cùng lúc (ví dụ trong sự kiện lớn), máy chủ Socket.io sẽ tự động mở Channel mới (ví dụ: `main_hall-ch1`, `main_hall-ch2`). Người chơi có thể tự do chọn chuyển kênh hoặc tự động ghép vào kênh có bạn bè.
* **Mục đích:** Bảo vệ hiệu năng render của Phaser 3, tránh quá tải CPU và giật lag trên các dòng điện thoại hoặc máy tính cấu hình thấp.

### 20. Đàm Thoại Giọng Nói Cự Ly Gần (Proximity Voice Chat)
* **Cơ chế âm thanh không gian (Spatial Audio):** Người chơi di chuyển lại gần nhau trong bán kính **100px** sẽ tự động nghe thấy giọng nói của nhau; âm lượng tăng dần khi lại gần và nhỏ dần khi đi xa (chuẩn Gather.town).
* **Kiến trúc kỹ thuật:** Sử dụng WebRTC Mesh P2P cho nhóm nhỏ ($\le 6$ người cùng nói), tích hợp các phím tắt nhanh: `[Mute Mic]` và `[Deafen Audio]` hiển thị rõ trên thanh công cụ.

### 21. Định Hướng Gameplay Minigames (Single-player with Global Leaderboards)
* **Mô hình triển khai:** Toàn bộ Minigames (Sút bóng, bóng rổ, bóng chuyền, pha chế cà phê, Snake, Sokoban, Đào vàng) hoạt động theo mô hình **Single-player cục bộ kết hợp Bảng Xếp Hạng Toàn Cầu**.
* **Lý do lựa chọn:** Đảm bảo độ trễ vật lý $0\text{ms}$, mượt mà tuyệt đối kể cả khi mạng yếu; điểm số được tự động đồng bộ lên Database thông qua `authService.syncFullProfile()` để cạnh tranh thứ hạng trên Hall of Fame.

### 22. Chính Sách Tài Khoản & Quyền Lợi Bình Đẳng (Universal Account & Equal Access)
* **Chính sách mở rộng:** Chấp nhận tất cả tài khoản đăng ký qua Email thường hoặc Google OAuth cá nhân; không bắt buộc độc quyền email trường.
* **Quyền lợi:** Mọi thành viên đăng ký đều có quyền bình đẳng trong việc tích lũy Dever Points, sở hữu tủ đồ, tham gia sự kiện và đua Top bảng xếp hạng.

### 23. Chính Sách Vật Phẩm & Chống Chợ Đen (Account-Bound Items & Anti-Trading)
* **Quy tắc sở hữu:** Toàn bộ vật phẩm thu thập (Móc khóa FUDA, Cúp Hackathon, Cà phê muối, v.v.), trang phục Tủ đồ và Danh hiệu đều là **Account-bound (Gắn chặt với tài khoản)**.
* **Không mở giao dịch tự do (No P2P Trading):** Triệt tiêu hoàn toàn nguy cơ phát sinh thị trường chợ đen, cày thuê tài khoản và lạm phát điểm Dever Points trong cộng đồng sinh viên.

### 24. Cơ Chế Tái Kết Nối Tự Động & Chống Mất Dữ Liệu (Auto-Reconnect & State Resilience)
* **Khả năng phục hồi:** Khi gặp sự cố mạng (WiFi gián đoạn, chuyển sóng 4G hoặc thu nhỏ tab điện thoại), SocketManager tự động kích hoạt cơ chế tái kết nối với thuật toán Exponential Backoff (1s, 2s, 4s, 8s, tối đa 5 lần).
* **Bảo toàn trạng thái:** Giữ nguyên vị trí nhân vật, phòng đang đứng và nội dung nhập dở; không điều hướng người chơi trở lại cổng Welcome Gate khi rớt mạng tạm thời.

### 25. Chính Sách Tên Nhân Vật & Tự Do Sáng Tạo (Nickname Policy & Filter)
* **Tự do sáng tạo:** Người chơi (cả Guest và Member) được thoải mái đặt biệt danh mang dấu ấn cá nhân, có hỗ trợ dấu tiếng Việt và khoảng trắng tự nhiên.
* **Bộ lọc vi phạm:** Tự động chặn các biệt danh chứa từ ngữ thô tục, công kích bạo lực, vi phạm pháp luật hoặc thuần phong mỹ tục học đường.

### 26. Chu Kỳ Mùa Giải & Sảnh Vinh Danh (Leaderboard Seasonality & Hall of Fame)
* **Chu kỳ mùa giải:** Bảng Xếp Hạng Dever Points và minigame được làm mới (Reset) theo từng **Học kỳ FPTU (Spring, Summer, Fall)**.
* **Bảo tồn giá trị người chơi:**
  * Toàn bộ trang phục, kiểu tóc, vật phẩm trong Tủ đồ đã mở khóa được **bảo lưu vĩnh viễn**.
  * Thành tích và Top người chơi của mùa cũ được ghi danh trang trọng vào **Sảnh Vinh Danh (Hall of Fame)** để lưu lại dấu ấn lịch sử CLB.
  * Việc reset điểm đua Top theo kỳ giúp tân sinh viên các khóa mới luôn có động lực công bằng để vươn lên bảng vàng.

### 27. Vòng Đời Dữ Liệu & Hủy Tài Khoản (Account Deletion & Data Privacy)
* **Chính sách Soft Delete:** Khi sinh viên tốt nghiệp hoặc gửi yêu cầu xóa tài khoản (Right to be Forgotten):
  * Hệ thống tiến hành vô hiệu hóa tài khoản (`is_active = false`), hủy session JWT và ẩn thông tin người dùng khỏi tất cả các bảng xếp hạng công khai.
  * Thông tin nhận dạng cá nhân (Email, IP) được ẩn danh hóa (Anonymized) nhưng giữ lại mã định danh nội bộ để bảo toàn tính toàn vẹn của lịch sử hệ thống.

---

## 3. KẾT LUẬN & CAM KẾT TRIỂN KHAI

Tài liệu này là kim chỉ nam chính thức định hình mọi bước phát triển, nâng cấp và vận hành của DEVER TOWN. Toàn bộ các mô-đun mã nguồn, tài liệu API và quy trình kỹ thuật phải tuân thủ nghiêm ngặt các điều khoản trong tài liệu này để đảm bảo sản phẩm luôn giữ vững tính chuyên nghiệp, tính ổn định và giá trị phục vụ cộng đồng sinh viên Đại học FPT Đà Nẵng.

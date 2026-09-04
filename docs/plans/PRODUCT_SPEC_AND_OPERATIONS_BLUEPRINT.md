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
* **Nhóm trọng tâm số 1 (Core):** Sinh viên chuyên ngành Kỹ thuật Phần mềm (SE), An toàn Thông tin (IA), Trí tuệ Nhân tạo (AI), Thiết kế Đồ họa (GD) tại Đại học FPT Đà Nẵng.
* **Nhóm trọng tâm số 2 (Active Members):** Thành viên chính thức và ứng viên các thế hệ của CLB FU-DEVER.
* **Nhóm mở rộng (Community):** Tân sinh viên chuẩn bị nhập học FPTU, học sinh THPT tham quan trải nghiệm văn hóa công nghệ trường và cộng đồng lập trình viên đối tác.

### 2. Nhân Khẩu Học, Nền Tảng & Thiết Bị (Demographics & Platforms)
* **Độ tuổi:** 18 – 23 tuổi (Gen Z, am hiểu công nghệ, ưa chuộng trải nghiệm tương tác trực quan).
* **Nền tảng mục tiêu:**
  1. *Desktop / Laptop (Ưu tiên số 1):* Trình duyệt Chrome, Edge, Brave, Firefox trên Windows / macOS / Linux. Độ phân giải phổ biến: 1366x768 đến 1920x1080.
  2. *Mobile Web (Ưu tiên số 2):* Safari (iOS), Chrome (Android) với thiết kế Responsive (360px – 430px), tích hợp Touch D-Pad, nút chạm kích hoạt nhanh (Quick Emotes, Speed Code, Radar HUD tự động gập gọn).

### 3. Mục Tiêu Giữ Chân Người Dùng (Retention & Engagement Targets)
* **Day-1 Retention (D1):** $\ge 40\%$ (Đạt được nhờ cơ chế Chơi Ngay không rào cản + Quẻ bói Cóc Vàng hàng ngày).
* **Day-7 Retention (D7):** $\ge 20\%$ (Đạt được nhờ chuỗi nhiệm vụ tuần, sự kiện workshop và bảng xếp hạng minigame).
* **Thời lượng phiên trung bình (Session Length):** 12 – 18 phút/phiên.
* **Tỷ lệ quay lại hàng tháng (MWR):** $\ge 30\%$.

### 4. Hiện Trạng Chỉ Số Cơ Sở (Baseline Metrics)
* **DAU / WAU:** 30 – 50 DAU (các đợt playtest nội bộ); 120 – 150 WAU.
* **Onboarding Conversion:** $\ge 95\%$ người dùng nhập nickname và bước vào Sảnh Alpha thành công trong vòng 5 giây đầu tiên.
* **Tỷ lệ tương tác Zone:** Trung bình mỗi phiên người chơi ghé thăm ít nhất 3 phòng chức năng và tương tác với ít nhất 2 Minigames / Tủ đồ.

### 5. Hạ Tầng Triển Khai & Quyền Hạn Hệ Thống (Infrastructure & Access Control)
* **Production Client:** Vercel Hosting tự động triển khai từ nhánh `main` (Domain tùy biến `town.fudever.com` / Vercel Edge Network).
* **Production Server / Realtime Socket:** Máy chủ Render / VPS chạy Node.js + Socket.io.
* **Staging / QA Environment:** Vercel Preview Deployments tự động từ các nhánh tính năng (`develop_hung`, `develop`).
* **Quyền hạn truy cập:**
  * *Guest:* Trải nghiệm toàn bộ phòng và tính năng game.
  * *Dev / Member:* Lưu trữ tủ đồ, nhiệm vụ, thành tựu lên Database.
  * *Leader / Admin:* Quyền quản trị nội dung thông báo, kick/mute người vi phạm và quản lý phòng họp.

### 6. Chính Sách Dữ Liệu, Telemetry & Quyền Riêng Tư (Privacy & Telemetry Guard)
* **Dữ liệu được phép thu thập:** Lượt vào phòng (room visits), điểm kỷ lục minigame, tiến trình nhiệm vụ, báo cáo lỗi JavaScript ẩn danh.
* **Chính sách Consent:** Thông báo điều khoản sử dụng và phiên làm việc cookie minh bạch tại cổng Welcome Gate.
* **QUY ĐỊNH BẤT KHẢ XÂM PHẠM — DỮ LIỆU TUYỆT ĐỐI KHÔNG ĐƯỢC LƯU:**
  * Tuyệt đối không lưu mật khẩu dạng văn bản thô (Plain-text Password) — bắt buộc băm bằng `bcrypt` salt 10 rounds.
  * Không lưu mã OTP xác thực sau khi người dùng đã đổi mật khẩu thành công.
  * Không lưu trữ lịch sử chat riêng tư nếu không có yêu cầu điều tra vi phạm.
  * Không truy cập danh bạ, camera/mic (trừ khi người dùng chủ động cho phép WebRTC), và dữ liệu ngoài phạm vi trình duyệt.

### 7. Trọng Tâm Sản Phẩm & Thứ Tự Ưu Tiên (Core Product Pillars)
Dựa trên định hướng chiến lược đã phê duyệt:
$$\text{Social (50\%)} > \text{Learn (30\%)} > \text{Play (20\%)}$$
1. **Social (50% - Trọng tâm cốt lõi):** Metaverse kết nối bạn bè, bong bóng chat trực tiếp, biểu cảm nhảy/múa, tụ tập tại Vườn Trà Sảnh Alpha, Góc Cafe Acoustic Căn Tin và Bàn Thảo Luận Tech Lab.
2. **Learn (30% - Giá trị lâu dài):** Tủ Cẩm nang ôn thi PE/FE SWE201c, IT Helpdesk & phần mềm thi FPTU (EOS, FAP, FLM, LMS), Slide đào tạo kỹ thuật, Kho dự án thực chiến của CLB.
3. **Play (20% - Gia vị giữ chân):** Hệ thống Minigames tốc độ cao (Sút bóng penalty, ném bóng rổ, pha chế cà phê muối, Cyber Snake, Buggy Sokoban, Đào vàng Cóc Vàng, Speed Code Duel) đóng vai trò là chất xúc tác tạo niềm vui và điểm thưởng giao lưu.

### 8. Thống Kê Hành Vi: Hoạt Động Yêu Thích vs Bỏ Dở (Behavioral Insights)
* **Hoạt động yêu thích nhất:**
  * Tùy biến trang phục trong Tủ đồ (Hoodie FUDA, phụ kiện tai nghe, kính râm, tóc nam/nữ).
  * Xin quẻ Cóc Vàng Tâm Linh tại Sảnh Alpha (`zone_main_frog`).
  * Đấu trí Speed Code Duel và các minigame thể thao / pha chế.
  * Chat bong bóng và biểu cảm icon nhảy múa cùng đồng đội.
* **Hoạt động dễ bị bỏ dở (Cần tối ưu UX):**
  * Các tài liệu/slide có khối lượng chữ quá dày đặc mà không có infographic tóm tắt.
  * Đọc thực đơn nếu danh sách món quá dài không có bộ lọc phân loại.

### 9. Đúc Kết Từ Playtest & Phỏng Vấn Thực Tế (Playtest Feedback)
* *Khảo sát 1:* Người chơi rất hài lòng khi hệ thống cho phép vào chơi ngay bằng Guest mà không bắt buộc tạo tài khoản ngay lập tức.
* *Khảo sát 2:* Cần duy trì phím tắt công thái học đồng nhất (`[E]` tương tác, `[I]` túi đồ, `[M]` radar minimap, `[G]` thanh biểu cảm, `[Escape]` đóng modal).
* *Khảo sát 3:* Trải nghiệm di chuyển và kích hoạt phím `[E]` phải hoàn toàn chuẩn xác, không bị delay hoặc kẹt góc tường.

### 10. Vận Hành Cộng Đồng & Chuỗi Sự Kiện (Community Operations)
* **Workshop Kỹ Thuật (Hàng tháng):** Tổ chức trực tiếp tại phòng Tech Lab (`dever_lab`) và Sảnh Đón Tiếp (`main_hall`), chiếu slide chính thức của CLB.
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
  * Xác thực điểm và token bảo mật qua API `PUT /api/auth/sync-profile`.

### 12. Cơ Chế Chuyển Đổi Guest Sang Account & Đồng Bộ (Guest Migration & Sync)
* **Zero Friction Entry:** Người chơi vào game tức thì với tư cách Guest, tiến trình tạm thời được lưu trong `localStorage`.
* **Auto-Merge Khi Đăng Ký / Đăng Nhập:**
  * Khi người dùng từ Guest tiến hành Đăng ký hoặc Đăng nhập tài khoản chính thức, hệ thống tự động gộp toàn bộ Dever Points, trạng thái nhiệm vụ, tủ đồ và kỷ lục trò chơi của Guest vào tài khoản server.
* **Multi-Device Synchronization:**
  * Mọi thay đổi về tủ đồ, trang bị và điểm số của tài khoản chính thức được đồng bộ tức thì lên Database thông qua `authService.syncFullProfile()`.

### 13. Kiểm Soát Nội Dung & An Toàn Cộng Đồng (Moderation & Safety)
* **Bộ lọc từ cấm tự động (Profanity Filter):** Tự động phát hiện và che giấu các từ ngữ tục tĩu, công kích cá nhân hoặc spam link độc hại trên kênh chat thế giới và bong bóng thoại.
* **Client-side Ignore/Mute:** Người chơi có thể ẩn tin nhắn từ một đối tượng cụ thể trên giao diện cá nhân.
* **Quyền hạn Ban Quản Trị:** Tài khoản Role `admin` hoặc `leader` có thẩm quyền kick khỏi phòng hoặc cấm chat đối với tài khoản cố tình vi phạm quy chuẩn ứng xử văn minh của trường.

### 14. Nguồn Chuẩn Duy Nhất Cho Bản Đồ (Single Source of Truth - SSOT)
* **Hiện trạng v0.4.1:** Đã đồng bộ hoàn toàn giữa Client [`src/config/maps.js`](file:///D:/THStudy/DeverClub/DEVER_TOWN/src/config/maps.js) và Server [`server/data/rooms.json`](file:///D:/THStudy/DeverClub/DEVER_TOWN/server/data/rooms.json).
* **Chuẩn hóa kiến trúc tương lai:**
  * Thiết lập một file cấu hình duy nhất dùng chung `shared/maps.json` (hoặc Client là Master SSOT) để Server nạp trực tiếp, loại bỏ vĩnh viễn rủi ro lệch metadata tọa độ zone hoặc điểm dịch chuyển giữa hai phía.

### 15. Ngân Sách Hiệu Năng & Giới Hạn Phần Cứng (Performance Budget)
* **Cấu hình sàn hỗ trợ (Lowest Hardware Spec):**
  * Thiết bị: Smartphone Android RAM 2GB, vi xử lý tầm trung (Snapdragon 450, MediaTek Helio P35).
  * Kết nối: 3G/4G ổn định với độ trễ $\le 150\text{ms}$.
* **Chỉ số hiệu năng cam kết:**
  * Tốc độ khung hình: Duy trì ổn định $55 - 60\text{ FPS}$.
  * Heap Memory tiêu thụ trên trình duyệt: $\le 25\text{ MB}$.
  * Dung lượng Bundle sản phẩm (Vite build gzipped): $\le 500\text{ KB}$ JS.
  * Tần số đồng bộ Socket: Throttling vị trí người chơi ở mức $40 - 50\text{ms}$/lần để bảo vệ băng thông và CPU máy chủ.

### 16. Lộ Trình Phát Triển & Giới Hạn Thay Đổi (Release Roadmap & Scope)
* **Phiên bản hiện tại (v0.4.1):** Ổn định hoàn hảo hệ thống tương tác phím `[E]`, chuẩn hóa tọa độ 8 phân khu, diệt trừ lỗi crash auth, kiểm thử Playwright đạt 100% xanh.
* **Phiên bản tiếp theo (v0.5.0):**
  * Hoàn thiện giao diện gộp điểm tự động (Auto-Merge UI) khi Guest đăng ký tài khoản.
  * Bảng vinh danh Top Điểm Thưởng CLB (Club Hall of Fame).
  * Thử nghiệm âm thanh WebRTC Proximity Voice Chat cho các buổi họp nhóm nhỏ.
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
* **Cơ chế Feature Flag:** Tích hợp bộ cờ bật/tắt tính năng thông qua `localStorage` và biến môi trường (ví dụ: `FEATURE_VOICE_CHAT`, `FEATURE_RADAR_COLLAPSE`).
* **Quy trình triển khai an toàn:** Mọi tính năng mới phải được kiểm thử E2E tự động qua Playwright, sau đó kích hoạt thử nghiệm cho nhóm Tester nội bộ (Beta group) trước khi mở rộng cho toàn thể sinh viên FPTU.

---

## 3. KẾT LUẬN & CAM KẾT TRIỂN KHAI

Tài liệu này là kim chỉ nam chính thức định hình mọi bước phát triển, nâng cấp và vận hành của DEVER TOWN. Toàn bộ các mô-đun mã nguồn, tài liệu API và quy trình kỹ thuật phải tuân thủ nghiêm ngặt các điều khoản trong tài liệu này để đảm bảo sản phẩm luôn giữ vững tính chuyên nghiệp, tính ổn định và giá trị phục vụ cộng đồng sinh viên Đại học FPT Đà Nẵng.

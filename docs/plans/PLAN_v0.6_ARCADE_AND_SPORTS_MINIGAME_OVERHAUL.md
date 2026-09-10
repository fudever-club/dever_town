# DEVER TOWN v0.6 — Kế Hoạch Nâng Cấp Toàn Diện Minigame Thể Thao & Arcade
## (Juice, Physics & Open-Source Engine Architecture)

> **Nhánh phát triển:** `develop_hung` (hoặc `feature/v0.6-minigames-overhaul`)  
> **Tài liệu tham chiếu:** Cẩm nang phát triển game với AI Agent, Blender MCP, Three.js & Superpowers (`thinhnguyen94/H-ng-d-n-t-o-game-b-ng-ChatGPT-Blender-MCP-Three-js-v-Superpowers-3d5afe0c56278065be83ca7108de1431`)  
> **Mục tiêu cốt lõi:** Đại tu triệt để toàn bộ các minigame thể thao và arcade từ dạng đồ họa thô sơ (prototype phẳng, chuyển động giật cục, thiếu chiều sâu) thành các trò chơi đạt chuẩn **Arcade thương phẩm**: cơ chế vật lý chân thực, chuyển động mượt mà 60fps, hiệu ứng Game Feel / "Juice" bùng nổ, âm thanh procedural sống động, hệ thống màn chơi và logic gây nghiện cao.

---

## 1. Phân Tích Hiện Trạng & Triết Lý Thiết Kế Từ Hướng Dẫn Notion

### 1.1. Hiện Trạng Các Minigame Hiện Tại (Pain Points)
- **Minigame Thể Thao (`SportsArcade.js`)**:
  - *Sút Phạt Đền 11M*: Chỉ có 1 thanh ngắm dao động đơn điệu, không có lực sút, không có góc cao/thấp, không có xoáy bóng (Magnus effect). Thủ môn chỉ là các khối chữ nhật màu cam flat di chuyển cứng nhắc 3 vị trí. Khung thành và lưới là các nét vẽ tĩnh, không có cảm giác bóng cắm vào lưới.
  - *Bóng Rổ*: Bản chất là một bản clone của Flappy Bird khoác áo bóng rổ (bóng nảy vô lý qua các vành rổ trôi nổi trên không), hoàn toàn không có cảm giác ném rổ, không có bảng rổ đàn hồi, không có quỹ đạo parabol chân thực, không có cơ chế ném sạch "Swish".
  - *Bóng Chuyền / Cầu Lông*: 2 khối hộp nhảy thẳng đứng, va chạm đập bóng sơ sài, thiếu cơ chế đập bóng úp (spike) và cứu bóng (dive).
  - *Pha Chế Barista*: Chỉ là thanh canh thời gian phẳng, thiếu tương tác pha chế và công thức thức uống thực tế của FPTU Đà Nẵng.
- **Minigame Cổ Điển (`RetroArcade.js`)**:
  - *Rắn Săn Mồi (Snake)*: Khối vuông pixel nhảy ô giật cục trên nền đen tuyền, 1 loại mồi cố định, không có animation hay vật phẩm hỗ trợ.
  - *Đẩy Hộp (Sokoban)*: Chỉ có đúng 1 màn chơi mini 6x5 ô vuông, không có texture gạch đá, không có hệ thống màn tăng độ khó, không có phát hiện kẹt hộp (deadlock).
  - *Đào Vàng (Gold Miner)*: Dây kéo chỉ là đoạn thẳng đơn sơ, khoáng sản là các hình tròn tô màu ngẫu nhiên, không có ròng rọc cơ khí, không có thùng thuốc nổ TNT, không có cửa hàng nâng cấp giữa các màn.

### 1.2. Triết Lý Thiết Kế Rút Ra Từ Cẩm Nang Notion
Dựa trên bài học từ quy trình tạo game với ChatGPT + Superpowers + Three.js/Canvas trong tài liệu:
1. **Tách Biệt Thông Số Cân Bằng (Balancing Configuration) Khỏi Game Logic**:
   - Toàn bộ tham số vật lý (trọng lực, ma sát, độ đàn hồi), thời gian phản xạ AI, kích thước hitbox, điểm số và xác suất rơi vật phẩm phải được tập trung tại `src/config/minigamesConfig.js`. Không hardcode số ma thuật (magic numbers) trong vòng lặp game.
2. **Finite State Machine (FSM) Minh Bạch Cho Từng Trò Chơi**:
   - Mỗi minigame hoạt động theo máy trạng thái xác định rõ ràng: `IDLE` -> `AIMING/PREPARE` -> `IN_ACTION` -> `RESOLUTION` -> `CELEBRATION/GAMEOVER` -> `NEXT_ROUND`. Triệt tiêu hoàn toàn lỗi chồng chéo sự kiện khi bấm phím liên tục.
3. **Kỹ Thuật Đồ Họa & Game Feel ("Juice") 60FPS**:
   - Render sắc nét chuẩn HiDPI (`window.devicePixelRatio`), đổ bóng đối tượng (shadow casting), chuyển động co giãn (squash-and-stretch), chữ số điểm bay đàn hồi (floating combat text), camera shake nhẹ khi sút mạnh hoặc nổ bom, pháo hoa ăn mừng và hiệu ứng hạt bụi.
4. **Âm Thanh Procedural 8-Bit Nâng Cao Qua Web Audio API**:
   - Mở rộng `AudioManager.js` với các âm thanh tổng hợp đa tầng: tiếng sút bóng căng "THUD!", tiếng bóng nảy xà ngang "CLANG!", tiếng xé lưới rổ "SWISH!", tiếng kéo ròng rọc xích sắt "CLANK-CLANK", và tiếng nổ thùng thuốc nổ "BOOM!".
5. **Tuân Thủ Nghiêm Ngặt Workspace Rules**:
   - **0% Emoji trên toàn bộ buttons và tabs** điều hướng (chỉ dùng text thanh lịch: `Ném Bóng`, `Đập Bóng`, `Bắn Móc`, `Hoàn Tác`, `Màn Tiếp`).
   - Tỷ lệ emoji khống chế dưới 15% chỉ dành cho các danh hiệu và biểu tượng streak (`🔥`, `⭐`).
   - Giữ nguyên 100% các ID phần tử DOM và interface để đảm bảo test suite Playwright không bị hồi quy (Zero-Regression).

---

## 2. Nghiên Cứu Open-Source & Thiết Kế Chi Tiết Từng Trò Chơi

```
                      HỆ THỐNG MINIGAME v0.6
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
SPORTS ARCADE 2.0 (4 Chế độ)            RETRO ARCADE 2.0 (3 Trò chơi)
├── ⚽ Sút Phạt Đền 11M (3-Phase Kick)   ├── 🐍 Rắn Săn Mồi (Smooth + 4 Items)
├── 🏀 Ném Bóng Rổ 3 Điểm (Parabola)     ├── 📦 Đẩy Hộp Sokoban (15 Màn Microban)
├── 🏐 Bóng Chuyền 1v1 (Arc Physics)     └── ⛏️ Vua Đào Vàng (Shop + TNT + Winch)
└── ☕ Barista FPTU (Crafting 4 bước)
```

---

### 2.1. SPORTS ARCADE 2.0 (`SportsArcade.js`)

#### A. ⚽ Sút Phạt Đền 11M (Penalty Shootout 2.0)
*Tham chiếu Open-Source:* Flash Soccer Penalty, Penalty Kick Online, Phaser Soccer Physics.
- **Cơ Chế Điều Khiển 3 Nhịp (3-Phase Kicking System)**:
  1. *Nhịp 1 — Hướng Sút (Aim Slider)*: Con lắc dao động ngang từ trái sang phải, người chơi bấm để khóa góc ngang.
  2. *Nhịp 2 — Lực Sút & Độ Cao (Elevation & Power Gauge)*: Thanh năng lượng dâng từ đáy lên đỉnh. Vùng tối ưu (Sweet Spot) nằm ở 75% - 88% lực sút (bóng găm góc chết). Nếu dưới 50%, cú sút đi chìm nhẹ; nếu trên 95%, bóng sẽ sút vọt xà ngang hoặc đập xà nảy ra ngoài!
  3. *Nhịp 3 — Điểm Tiếp Xúc Bóng (Curve/Spin - Hiệu ứng Magnus)*: Chấm đỏ trên quả bóng cho phép vuốt nhẹ sang trái/phải để tạo đường cong uốn lượn né tầm với thủ môn.
- **Goalkeeper AI 2.0**:
  - Thủ môn không chỉ di chuyển 3 điểm cố định. AI tính toán thời gian phản ứng (reaction delay 100-180ms tùy độ khó), tính toán góc cản phá với hitbox dạng Capsule động (hai găng tay, thân người, cẳng chân).
  - 4 kết quả cản phá: Bắt dính bóng (Catch), Đẩy bóng vọt xà (Tip over bar), Đẩy bóng chạm cột dọc bật ra ngoài (Post deflect), hoặc Phán đoán sai hướng đổ người.
- **Lưới Bóng Đá Vật Lý (Spring-Mass Net Grid 8x6)**:
  - Khung thành dựng theo phối cảnh 2.5D có chiều sâu.
  - Lưới được xây dựng bằng mạng lò xo liên kết 48 điểm nút: khi bóng bay vào lưới, vị trí va chạm lún sâu về sau và các mắt lưới xung quanh gợn sóng lan tỏa chân thực.
- **Đồ Họa & Juice**:
  - Mặt cỏ sọc đậm nhạt Oblique 2.5D, khán đài có cổ động viên pixel nhấp nhô.
  - Sprite thủ môn có hoạt ảnh: Đứng nhún chân nhử bóng, Bật nhảy bay người ngang, Ôm đầu tiếc nuối khi thủng lưới.
  - Camera Dolly-in phóng nhanh vào khung thành theo đường bay của bóng; chữ bay nổi "GOLAZO! 🔥", "GÓC CHỮ A!".

---

#### B. 🏀 Ném Bóng Rổ 3 Điểm & Ném Phạt (Basketball 3-Point Shootout 2.0)
*Tham chiếu Open-Source:* NBA 3-Point Contest Arcade, Ketchapp Basketball, Box2D/Verlet Basketball Physics.
- **Loại Bỏ Hoàn Toàn Cơ Chế Flappy Bird**: Chuyển sang mô phỏng ném bóng rổ chuẩn quỹ đạo parabol ném xiên.
- **Hệ Thống Vật Lý Ném Parabol Chân Thực**:
  - Phương trình chuyển động:  
    $$x(t) = x_0 + v_0 \cos(\theta) \cdot t$$  
    $$y(t) = y_0 - (v_0 \sin(\theta) \cdot t - \frac{1}{2} g t^2)$$
  - Cơ chế ném linh hoạt:
    - *Desktop*: Nhấn giữ phím Space / Chuột để tăng lực ném + canh góc vòng cung (Angle & Power Meter).
    - *Mobile*: Vuốt ngón tay (Drag-to-Aim & Release) với đường ngắm chấm bi hỗ trợ trong 3 quả đầu.
- **Vật Lý Bảng Rổ, Vành Rổ & Lưới (Rim & Backboard Collision)**:
  - Bảng rổ mica trong suốt có hệ số nảy $e = 0.65$.
  - Vành rổ là 2 chốt cứng tròn (Rigid Circle Pegs) có độ đàn hồi $e = 0.55$. Quả bóng có thể nảy tưng nhiều nhịp quanh mép vành trước khi lọt xuống hoặc bật ra ngoài (Rim Rattle suspense).
  - **Cơ chế "SWISH!"**: Bóng rơi thẳng vào rổ không chạm vành hay bảng -> Thưởng điểm x2 + âm thanh "Swish!" xé lưới giòn giã + Lưới co rút nhịp nhàng.
- **Chế Độ Chơi & Vòng Lặp Điểm Số**:
  - *3-Point Shootout*: Đứng ném ở các cự ly khác nhau quanh vòng cung 3 điểm trong 60 giây. Quả bóng thứ 5 mỗi vị trí là "Money Ball" nhân đôi điểm số.
  - *Combo "ON FIRE! 🔥"*: Ghi 3 quả Swish liên tiếp sẽ kích hoạt chế độ bốc lửa, bóng có vệt khói lửa bùng cháy và nhân 3 điểm số cho đến khi ném trượt.
  - *Rổ Di Chuyển*: Từ điểm số thứ 10 trở đi, trụ rổ di chuyển đung đưa trái phải nhẹ nhàng để gia tăng thử thách.

---

#### C. 🏐 Bóng Chuyền & Cầu Lông 1v1 (Volleyball / Badminton Rally 2.0)
*Tham chiếu Open-Source:* Slime Volleyball, Pikachu Volleyball (kinh điển tuổi thơ), Blobby Volley.
- **Arc-Body Elastic Collision Physics**:
  - Đỉnh đầu nhân vật được cấu tạo từ nửa đường tròn đàn hồi cao ($e = 0.85$).
  - Vị trí bóng tiếp xúc trên vòm đầu quyết định góc bật ra:
    - Tiếp xúc phía trước trán: Bóng vọt tới với góc nhọn nguy hiểm.
    - Tiếp xúc chính đỉnh đầu: Bóng nảy bổng thẳng đứng (dùng để làm bóng chuẩn bị đập).
    - Tiếp xúc sau gáy: Bóng bật ngược về sau sân cứu nguy.
- **Cơ Chế Đập Bóng (Spike Mechanics)**:
  - Khi người chơi nhảy lên không trung đúng độ cao bóng và nhấn nút [Hành Động] -> Thực hiện cú đập bóng uy lực (Spike): bóng chuyển sang màu đỏ rực, gia tốc bay tăng gấp 2.2 lần và cắm thẳng xuống sân đối phương.
- **AI Đối Thủ 3 Cấp Độ (Bot Difficulty Tiers)**:
  - *Cấp 1 (Tân Thủ)*: Di chuyển chậm, chỉ biết đón và tâng bóng bổng sang sân.
  - *Cấp 2 (Bán Chuyên)*: Biết phán đoán điểm rơi quả bóng và nhảy chắn lưới (Block).
  - *Cấp 3 (Đội Trưởng FPTU)*: Biết phối hợp nhịp 1 tâng bóng tự làm điểm rơi, nhịp 2 bật nhảy đập bóng hiểm hóc vào góc chết.
- **Đồ Họa & Sân Đấu**:
  - Sân đấu cát vàng bãi biển hoặc sàn thi đấu nhà đa năng FPTU với lưới căng ở giữa sân.
  - Bóng đổ tròn theo dõi độ cao của quả bóng trên mặt sàn.
  - Bảng lật số điểm cơ học ở góc trên màn hình.

---

#### D. ☕ Pha Chế Cà Phê Muối & Trà Sữa (Barista FPTU Simulator 2.0)
*Tham chiếu Open-Source:* Coffee Talk, Papa's Freezeria, Overcooked Drink Mechanics.
- **Hệ Thống Đơn Hàng FPTU (Campus Drink Tickets)**:
  - Sinh viên và giảng viên ghé quầy gọi các món đồ uống đặc trưng:
    1. *Cà Phê Muối Đà Nẵng* (Cốt cafe phin đậm + Sữa đặc + Lớp kem béo mặn + Muối hồng).
    2. *Bạc Xỉu 3 Tầng* (Sữa đặc đáy ly + Sữa tươi tầng giữa + Bọt cafe bồng bềnh).
    3. *Trà Đào Cam Sả* (Cốt trà đen ủ lạnh + Nước cốt đào + Lát cam vàng + Thanh sả).
    4. *Trà Sữa Oolong Nướng Trân Châu Hoàng Kim*.
- **Quy Trình Pha Chế 4 Bước Tương Tác**:
  1. *Bước 1 — Chọn Cốc & Lượng Đá*: Canh nút dừng mức đá phù hợp (Ít đá, Vừa, Nhiều đá).
  2. *Bước 2 — Chiết Xuất Cốt Trà / Cà Phê*: Thanh đong đo dung tích ml — giữ chuột/phím và nhả đúng vạch chuẩn.
  3. *Bước 3 — Đánh Bọt Kem Muối (Whisking Minigame)*: Nhấp phím luân phiên [Trái] - [Phải] hoặc lắc chuột theo nhịp điệu để tạo độ bông xốp mịn cho lớp kem.
  4. *Bước 4 — Rắc Topping & Trang Trí*: Thêm trân châu, lát đào hoặc rắc bột quế hoàn thiện.
- **Đánh Giá & Doanh Thu**:
  - Hệ thống chấm điểm 1 - 5 sao dựa trên độ chuẩn xác của tỷ lệ nguyên liệu và thời gian hoàn thành.
  - Tích lũy tiền tips để mở khóa các loại ly thủy tinh độc lạ và danh hiệu "Bàn Tay Vàng Làng Barista".

---

### 2.2. RETRO ARCADE 2.0 (`RetroArcade.js`)

#### A. 🐍 Rắn Săn Mồi Siêu Cấp (Snake 2.0 Smooth & Dynamic)
*Tham chiếu Open-Source:* Google Snake, Slither.io HTML5 Canvas, Nokia 3310 Remastered.
- **Di Chuyển Nội Suy Mượt Mà 60FPS (Position Interpolation Lerp)**:
  - Loại bỏ chuyển động nhảy ô cục mịch. Tọa độ các khớp thân rắn được lerp liên tục giữa các frame, tạo cảm giác thân rắn trườn uốn lượn mượt mà như game hiện đại.
- **Hệ Sinh Thái 4 Loại Vật Phẩm (Power-ups)**:
  - 🍎 *Táo Đỏ FPTU*: Mồi cơ bản (+10 điểm, tăng thêm 1 đốt thân).
  - ⚡ *Ớt Cay Siêu Tốc*: Tăng tốc độ gấp đôi trong 5 giây (+30 điểm, húc vỡ đá chướng ngại vật).
  - 🧲 *Nam Châm Vàng*: Tự động hút mồi trong bán kính 4 ô trong vòng 7 giây.
  - ❄️ *Kem Tuyết Giảm Tốc*: Làm chậm tốc độ 50% trong 6 giây, cứu nguy khi thân rắn đã quá dài.
- **Cổng Dịch Chuyển Không Gian (Portal Warp)**:
  - Hai cổng dịch chuyển xanh/tím ngẫu nhiên trên bàn cờ, rắn chui vào cổng này sẽ xuất hiện ở cổng kia.
- **Đồ Họa & CRT Filter**:
  - Đầu rắn có animation mắt nhìn theo hướng rẽ, miệng mở khi sắp chạm vào mồi.
  - Tùy chọn nút gạt bật/tắt **Bộ lọc CRT Retro**: Thêm đường quét scanlines, hiệu ứng cong thấu kính màn hình lồi và viền sáng phát quang nhẹ (phosphor glow).

---

#### B. 📦 Đẩy Hộp Trí Tuệ (Sokoban 2.0 — 15 Màn Microban)
*Tham chiếu Open-Source:* Boxxle Game Boy, Microban by David W. Skinner, Sokoban JS Engine.
- **Bộ 15 Màn Chơi Tinh Tuyển (Progressive Microban Level Pack)**:
  - Cấp 1 (Màn 1-5): Nhập môn làm quen logic đẩy hộp không kẹt góc.
  - Cấp 2 (Màn 6-10): Câu đố không gian hẹp đòi hỏi tính toán thứ tự trước sau.
  - Cấp 3 (Màn 11-15): Cực hạn hack não dành cho coder chuyên nghiệp.
- **Tính Năng Chuyên Nghiệp Hỗ Trợ Người Chơi**:
  - *Undo Stack Vô Hạn*: Phím `U` hoặc nút "Hoàn Tác" cho phép lùi lại từng bước không giới hạn.
  - *Deadlock Detection (Phát hiện kẹt hộp thông minh)*: Khi một chiếc hộp bị đẩy vào góc tường chết (corner deadlock) mà không phải đích đến, một biểu tượng cảnh báo tinh tế xuất hiện bên cạnh hộp để nhắc người chơi nên Undo, không để rơi vào ngõ cụt bế tắc.
  - *Hệ Thống 3 Sao*: Đánh giá 3 sao nếu hoàn thành dưới số bước chuẩn (Par Moves), 2 sao nếu gấp 1.5 lần, 1 sao nếu vượt qua.
- **Đồ Họa Oblique Server Room**:
  - Thay khối màu phẳng bằng sàn gạch server lab mát lạnh, hộp kim loại viền neon có bóng đổ, ô đích là socket vi mạch phát sáng rực rỡ khi hộp khớp vị trí.

---

#### C. ⛏️ Vua Đào Vàng (Gold Miner 2.0 — Buggy Gold Rush)
*Tham chiếu Open-Source:* Gold Miner Classic (Flash huyền thoại), Phaser Gold Digger Engine.
- **Hệ Thống Ròng Rọc & Cáp Kéo Vật Lý**:
  - Con lắc ròng rọc dao động tự nhiên theo hàm $\theta(t) = \theta_{max} \sin(\omega t)$.
  - Dây cáp được vẽ từng mắt xích liên kết cơ khí, đầu móc kẹp bằng thép mở rộng khi phóng xuống và kẹp chặt khi chạm vật thể.
- **Hệ Thống Khoáng Sản Đa Dạng**:
  - 🪙 *Vàng Nhỏ*: Giá trị $50, kích thước nhỏ, kéo nhanh vèo trong 2.5s.
  - 🥇 *Vàng Vừa*: Giá trị $150, kích thước vừa, kéo trong 5s.
  - 👑 *Vàng Hoàng Gia Cực Đại*: Giá trị $500, siêu nặng, kéo chậm rãi trong 10s.
  - 💎 *Kim Cương Lấp Lánh*: Giá trị $600, kích thước tí hon, kéo siêu nhanh trong 2s.
  - 🪨 *Đá Tảng Vô Dụng*: Giá trị $15 - $25, siêu nặng kéo mất 9s (chướng ngại vật chiến thuật).
  - 💣 *Thùng Thuốc Nổ TNT*: Móc trúng sẽ kích hoạt nổ dây chuyền, phá hủy toàn bộ khoáng sản trong bán kính 90px!
  - 🎁 *Túi Quà Bí Ẩn (Mystery Bag)*: Ngẫu nhiên mang lại từ $1 đến $800, hoặc tăng sức mạnh kéo tức thì, hoặc... một khối thuốc nổ phát nổ.
  - 🦔 *Chuột Chũi Chạy Ngang*: Chú chuột chũi ngậm kim cương chạy lắt léo dưới đáy hầm, đòi hỏi ngắm chuẩn xác từng phần mười giây.
- **Cửa Hàng Giữa Các Ngày (In-Game Store)**:
  - *Thuốc Tăng Lực (Strength Drink)*: Tăng tốc độ kéo vật nặng lên 250% ở ngày tiếp theo.
  - *Thuốc Nổ Dynamite (Phím Space)*: Khi lỡ móc phải cục đá tảng nặng nề, bấm Space để nổ đứt dây cáp, thu móc về ngay tức thì!
  - *Sách Thẩm Định Kim Cương*: Tăng giá trị kim cương từ $600 lên $900.
  - *Cỏ 4 Lá May Mắn*: Túi bí ẩn luôn mở ra phần thưởng giá trị cao nhất.
- **Đồ Họa & Hoạt Ảnh**:
  - Linh vật Buggy thợ mỏ đội mũ gắn đèn pin, tay quay tời mồ hôi nhễ nhại khi kéo vật nặng.
  - Đất đá tầng sâu chia 3 tầng địa chất màu sắc phong phú, hiệu ứng khói bụi bốc lên khi thuốc nổ phát nổ.

---

## 3. Kiến Trúc Mã Nguồn & Cấu Trúc File Mới

Để code sạch sẽ, dễ bảo trì và không biến `SportsArcade.js` thành một file khổng lồ > 3000 dòng, kiến trúc v0.6 áp dụng nguyên tắc **Modular Sub-Engines**:

```
src/
├── config/
│   ├── minigamesConfig.js            <-- [MỚI] Tách toàn bộ thông số cân bằng, vật lý, điểm số
│   └── sokobanLevels.js              <-- [MỚI] Bộ 15 màn chơi Microban chuẩn hóa
├── ui/
│   └── minigames/
│       ├── SportsArcade.js           <-- [FACADE] Router điều phối các môn thể thao
│       ├── RetroArcade.js            <-- [FACADE] Router điều phối các game retro
│       ├── sports/                   <-- [MỚI] Module hóa từng môn thể thao
│       │   ├── PenaltyShootoutEngine.js
│       │   ├── BasketballShootoutEngine.js
│       │   ├── VolleyballRallyEngine.js
│       │   └── BaristaSimulatorEngine.js
│       ├── retro/                    <-- [MỚI] Module hóa từng game retro
│       │   ├── SnakeEngine.js
│       │   ├── SokobanEngine.js
│       │   └── GoldMinerEngine.js
│       └── common/
│           ├── CanvasJuiceFX.js      <-- [MỚI] Screen shake, floating numbers, confetti, sparkles
│           └── CRTScreenOverlay.js   <-- [MỚI] Bộ lọc retro scanlines & glow
└── utils/
    └── AudioManager.js               <-- [NÂNG CẤP] Bổ sung procedural sounds (Swish, Clang, Boom, etc.)
```

---

## 4. Lộ Trình Triển Khai Chi Tiết (Sprint Breakdown)

### Sprint 1: Nền Tảng Cấu Hình & Engine Âm Thanh Procedural
- [ ] Tạo `src/config/minigamesConfig.js`: Lưu trữ toàn bộ hằng số vật lý (trọng lực, ma sát, độ đàn hồi), bảng điểm, tỷ lệ rơi đồ, danh sách đồ uống Barista.
- [ ] Tạo `src/config/sokobanLevels.js`: Tích hợp 15 màn Microban kinh điển với tọa độ ô tường, hòm và đích.
- [ ] Nâng cấp `src/utils/AudioManager.js`: Thêm các bộ tổng hợp Web Audio API:
  - `playKick()`: Âm trầm đập mạnh khi sút bóng.
  - `playGoal()`: Kèn fanfare cổ vũ ngắn khi ghi bàn.
  - `playPostClang()`: Âm vang kim loại khi bóng đập xà/cột dọc.
  - `playSwish()`: Tiếng xé lưới rổ giòn tan.
  - `playExplosion()`: Tiếng nổ TNT trong Gold Miner.
  - `playPowerup()`: Âm chiptune nảy nở khi ăn vật phẩm trong Snake.
- [ ] Xây dựng `src/ui/minigames/common/CanvasJuiceFX.js`: Quản lý screen shake, floating score text đàn hồi, hạt bụi, hạt khói và pháo hoa.

### Sprint 2: Đại Tu Minigame Thể Thao (Sports Arcade 2.0)
- [ ] Phát triển `PenaltyShootoutEngine.js`:
  - Cơ chế 3 nhịp: Góc sút -> Vạch lực (Sweet Spot 75-88%) -> Xoáy bóng Magnus.
  - Thủ môn AI 2.0 phản xạ theo hitbox Capsule, 4 kịch bản cản phá.
  - Mạng lưới khung thành đàn hồi đa điểm (Spring-Mass Net Grid 8x6).
- [ ] Phát triển `BasketballShootoutEngine.js`:
  - Quỹ đạo ném xiên parabol hoàn chỉnh, vạch canh góc & lực hoặc kéo thả ngón tay.
  - Va chạm đàn hồi bảng rổ & vành rổ kim loại, cơ chế Swish và hiệu ứng chuỗi "On Fire! 🔥".
  - Hoạt ảnh rổ di chuyển ở điểm số cao.
- [ ] Phát triển `VolleyballRallyEngine.js`:
  - Vật lý vòm đầu bán nguyệt phản xạ góc bóng theo điểm tiếp xúc.
  - Cơ chế nhảy đập bóng Spike và trượt cứu bóng Dive.
  - Bot AI 3 cấp độ (Tân thủ, Bán chuyên, Đội trưởng FPTU).
- [ ] Tích hợp vào `SportsArcade.js`, kết nối HUD và hệ thống nút bấm hành động.

### Sprint 3: Đại Tu Minigame Cổ Điển (Retro Arcade 2.0)
- [ ] Phát triển `SnakeEngine.js`:
  - Nội suy chuyển động trườn 60fps mượt mà giữa các mắt xích thân rắn.
  - Hệ sinh thái 4 vật phẩm (Táo đỏ, Ớt siêu tốc, Nam châm, Kem tuyết) + Cổng Portal.
  - Đầu rắn Buggy có animation mắt và miệng, bộ lọc CRT Retro Scanlines.
- [ ] Phát triển `SokobanEngine.js`:
  - Load 15 màn Microban từ `sokobanLevels.js`.
  - Cơ chế Undo vô hạn với phím `U` / nút Hoàn Tác.
  - Thuật toán Deadlock Detector phát hiện hộp kẹt góc tường.
  - Đồ họa phòng máy chủ DEVER vi mạch phát sáng, tính điểm 3 sao.
- [ ] Phát triển `GoldMinerEngine.js`:
  - Dao động con lắc cơ khí, cáp xích sắt và móc kẹp kim loại đóng mở.
  - 8 loại khoáng sản: Vàng 3 kích cỡ, Kim cương, Đá cuội, Thùng nổ TNT, Túi bí ẩn, Chuột chũi.
  - Cửa hàng trang bị giữa các ngày: Nước tăng lực, Thuốc nổ Dynamite (phím Space), Thẩm định kim cương, Cỏ 4 lá.
- [ ] Tích hợp vào `RetroArcade.js`, kết nối bàn phím và giao diện cảm ứng.

### Sprint 4: Nâng Cấp Barista Simulator & Hệ Thống Kỷ Lục Database
- [ ] Phát triển `BaristaSimulatorEngine.js`:
  - Hệ thống đơn hàng FPTU (Cà phê muối, Bạc xỉu 3 tầng, Trà đào cam sả, Trà sữa oolong).
  - 4 công đoạn pha chế: Chọn đá -> Rót cốt trà/cafe -> Đánh bọt kem muối -> Rắc topping.
  - Chấm điểm 5 sao và tích lũy tiền tips.
- [ ] Mở rộng bảng lưu trữ kỷ lục trong `AuthService.js` và Postgres Adapter:
  - Đồng bộ kỷ lục cho đủ 7 minigame: `penalty_high`, `penalty_streak`, `basketball_high`, `volleyball_high`, `barista_high`, `snake_high`, `sokoban_stars`, `goldminer_high`.
- [ ] Bổ sung các danh hiệu mới (Achievements) trong `AchievementManager.js`:
  - *Vua Phạt Đền* (Đạt chuỗi 5 quả penalty liên tiếp).
  - *Tay Ném Ba Điểm* (Đạt chuỗi 3 quả Swish liên tiếp).
  - *Buggy Bất Tử* (Đạt 500 điểm trong Snake 2.0).
  - *Kiện Tướng Sokoban* (Vượt qua 15/15 màn chơi).
  - *Đại Phú Hộ Hầm Mỏ* (Đạt mốc $3000 trong Vua Đào Vàng).

### Sprint 5: Kiểm Thử Tự Động, Bảo Toàn Hệ Thống & Tinh Chỉnh Cuối Cùng
- [ ] Chạy kiểm thử Playwright toàn bộ test suite (`tests/e2e/ux-enhancements.spec.js`, `tests/e2e/retention-loop.spec.js`).
- [ ] Đảm bảo 100% không gãy vỡ các ID HTML (`#sports-arcade-canvas`, `#sports-action-btn`, `#retro-arcade-canvas`).
- [ ] Kiểm tra khả năng tương thích màn hình cảm ứng điện thoại (iPhone SE, iPad, Android).
- [ ] Rà soát bộ lọc văn phong & Emoji Budget: xác nhận 0% emoji trên buttons/tabs, tuân thủ AGENTS.md.
- [ ] Chạy `npm run build` kiểm tra bundle Vite không có cảnh báo hoặc lỗi cú pháp.

---

## 5. Chiến Lược Giảm Thiểu Rủi Ro & Rollback (Safety & Contingency)

1. **Bảo toàn giao diện ngoài (Public Interface Preservation)**:
   - Cả `SportsArcade` và `RetroArcade` giữ nguyên 100% chữ ký constructor:  
     `new SportsArcade(canvasEl, options)` và `new RetroArcade(canvasEl, options)`.
   - Giữ nguyên các hàm `start()`, `stop()`, `destroy()`, `setGame(type)`, `onActionTrigger()`, `updateHUD()`.
   - Toàn bộ code mới chỉ mở rộng bên trong các sub-engines, không làm thay đổi cách gọi từ `InteractiveModal.js`.
2. **Kế hoạch Rollback tức thời**:
   - Sao lưu file gốc trước khi refactor: `SportsArcade.legacy.js` và `RetroArcade.legacy.js`.
   - Nếu xảy ra lỗi nghiêm trọng trong quá trình chơi, chỉ cần switch flag `USE_LEGACY_ARCADE = true` trong config là game lập tức quay về trạng thái ổn định cũ mà không cần revert git.

---

## 6. Tiêu Chuẩn Nghiệm Thu (Acceptance Criteria)

| Hạng mục | Tiêu chí đạt chuẩn |
|---|---|
| **Penalty 2.0** | Cơ chế 3 nhịp hoạt động chuẩn, thủ môn AI có 4 trạng thái phản xạ, lưới bóng co giãn vật lý khi bóng vào lưới. |
| **Bóng Rổ 2.0** | Bóng bay theo quỹ đạo parabol ném xiên, va chạm vành & bảng rổ có độ nảy, có hiệu ứng "Swish!" và bốc lửa khi đạt chuỗi 3 điểm. |
| **Bóng Chuyền 2.0** | Vòm đầu nhân vật phản xạ góc bóng chuẩn xác, có chiêu đập bóng Spike tạo vệt sáng, bot AI biết chắn lưới và đập bóng. |
| **Barista 2.0** | 4 món đồ uống FPTU với 4 công đoạn tương tác, hiệu ứng bọt kem muối sủi bọt, chấm điểm 1-5 sao. |
| **Snake 2.0** | Chuyển động uốn lượn 60fps không giật cục, đủ 4 loại power-ups và cổng dịch chuyển portal, tùy chọn CRT scanlines. |
| **Sokoban 2.0** | Đầy đủ 15 màn chơi Microban, tính năng Undo vô hạn hoạt động hoàn hảo, cảnh báo kẹt góc deadlock chính xác. |
| **Gold Miner 2.0** | Dây cáp xích sắt chuyển động tự nhiên, đủ 8 loại khoáng sản và thùng thuốc nổ TNT, cửa hàng mua thuốc nổ/thuốc tăng lực hoạt động trơn tru. |
| **QA & Tests** | 100% test Playwright pass, `npm run build` 0 lỗi, 0 emoji trên buttons/tabs theo chuẩn `AGENTS.md`. |

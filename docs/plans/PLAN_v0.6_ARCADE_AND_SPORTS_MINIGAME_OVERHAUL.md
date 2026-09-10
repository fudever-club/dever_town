# DEVER TOWN v0.6 — Kế Hoạch Nâng Cấp Toàn Diện Minigame Thể Thao & Arcade
## (Juice, Physics, Modern Gameplay Mechanics & Open-Source Engine Architecture)

> **Nhánh phát triển:** `develop_hung` (hoặc `feature/v0.6-minigames-overhaul`)  
> **Tài liệu tham chiếu:**  
> - Cẩm nang phát triển game với AI Agent, Blender MCP, Three.js & Superpowers (`thinhnguyen94/H-ng-d-n-t-o-game-b-ng-ChatGPT-Blender-MCP-Three-js-v-Superpowers-3d5afe0c56278065be83ca7108de1431`)  
> - Khảo sát các tựa game thành công trên thị trường: *Good Pizza, Great Pizza*, *Coffee Talk*, *Score! Hero*, *Flick Kick Football*, *The Spike - Volleyball Story*, *Slither.io*, *Patrick's Parabox*, *Gold Miner Vegas*.  
> **Mục tiêu cốt lõi:** Xóa bỏ hoàn toàn định kiến "minigame lỏ / sơ sài" (chỉ bấm vào vạch xanh hoặc sút bóng 1 nút đơn điệu), xây dựng lại toàn bộ các trò chơi thành các **Arcade Sub-Games có chiều sâu gameplay, cơ chế điều khiển trực quan, vật lý chân thực, đồ họa Oblique 2.5D sắc nét và trải nghiệm gây nghiện cao**.

---

## 1. Nghiên Cứu Thị Trường & Phân Tích Hiện Trạng (Market Research & Gap Analysis)

### 1.1. Hiện Trạng Hiện Tại Của DEVER TOWN ("Tại Sao Bị Xem Là Lỏ?")
| Minigame | Cơ chế hiện tại trong Code | Điểm yếu chí mạng (Pain Points) |
|---|---|---|
| **☕ Barista FPTU** | Một thanh chạy qua lại, người chơi canh bấm vào vạch xanh (`SportsArcade.js:1157-1220`). | **Cực kỳ tẻ nhạt**: Không có thao tác pha chế, không có nguyên liệu, không có khách hàng, không thể hiện được nét văn hóa Cà Phê Muối Đà Nẵng hay nghệ thuật Barista. |
| **⚽ Bóng Đá** | Con lắc góc sút lắc lư trái phải, nhấn Space là bóng bay thẳng (`SportsArcade.js:193-270`). | **1 chiều và thụ động**: Không có lực sút, không có độ xoáy bóng, không có hàng rào, không có cơ chế làm thủ môn bắt bóng, không có chuyền bóng hay thử thách góc chết. |
| **🏀 Bóng Rổ** | Clone Flappy Bird (nhấn Space bóng nảy lên trên các rổ trôi lơ lửng). | **Vô lý và phi thể thao**: Không giống bóng rổ, không có bảng rổ, không có vành rổ nảy đàn hồi, không có quỹ đạo ném xiên parabol, không có cảm giác ném sạch "Swish". |
| **🏐 Bóng Chuyền** | 2 khối hộp nhảy thẳng đứng, va chạm đập bóng phẳng lì. | **Thiếu nhịp điệu**: Thiếu chuỗi 3 pha phối hợp (Đỡ bước 1 $\rightarrow$ Chuyền bước 2 $\rightarrow$ Bật nhảy đập bóng Spike), thiếu chắn bóng (Block) và bỏ nhỏ (Tip). |
| **🐍 Snake** | Khối vuông nhảy ô giật cục trên nền đen, 1 loại táo cố định. | **Lỗi thời**: Không có nội suy chuyển động trườn 60fps, thiếu vật phẩm biến đổi tốc độ/tính năng, thiếu chướng ngại vật động. |
| **📦 Sokoban** | Đúng 1 màn chơi mini 6x5 ô vuông phẳng. | **Cụt cụt**: Không có độ thử thách, không có cơ chế giải đố hiện đại (băng trượt, cổng teleport, nút kích hoạt), không có phát hiện kẹt hộp. |
| **⛏️ Đào Vàng** | Đoạn thẳng lắc lư đơn điệu, các vật phẩm là hình tròn đơn sắc. | **Đơn sơ**: Thiếu tương tác dây xích cơ khí, thiếu thùng thuốc nổ TNT liên hoàn, thiếu cửa hàng nâng cấp chiến thuật giữa các ngày. |

---

### 1.2. Bài Học Từ Các Game Đỉnh Cao Trên Thị Trường Hiện Nay

```
                                  BENCHMARK THỊ TRƯỜNG
                                           │
         ┌──────────────────┬──────────────┴─────┬──────────────────┐
         ▼                  ▼                    ▼                  ▼
  COFFEE TALK &      SCORE! HERO &         THE SPIKE &        SLITHER.IO &
GOOD PIZZA, GREAT... FLICK KICK FOOTBALL   PIKACHU VOLLEYBALL PATRICK'S PARABOX
  - Dialogue Order     - Freeform Curve      - 3-Touch Rally   - Smooth Lerp
  - Liquid Density       Flick (Vẽ bóng cong)- Spike Smash     - Ice Floor Mechanics
  - Freeform Latte     - Dual-Role: Sút &    - Block & Tip     - Dynamic Portals
    Art Canvas           Làm Thủ Môn Đeo Găng- Smart AI Tiers  - Boost-Burn Mechanic
```

1. **Từ *Good Pizza, Great Pizza* & *Coffee Talk***:
   - **Tương tác tay trực tiếp (Hands-on Interactivity)**: Người chơi phải tự tay đong đá, rót cà phê, đánh bọt sữa và rắc topping.
   - **Vật lý phân tầng chất lỏng (Liquid Density Layering)**: Sữa đặc chìm đáy, trà/cafe tầng giữa, bọt kem béo muối hồng bồng bềnh trên mặt.
   - **Tự tay vẽ bọt sữa (Freeform Latte Art Pouring)**: Dùng chuột/ngón tay rót sữa tạo hình (trái tim, chiếc lá, Buggy) với thuật toán chấm điểm độ tương đồng!
   - **Cá tính khách hàng FPTU (Customer Dialogue & Patience)**: Khách hàng có thanh kiên nhẫn, yêu cầu theo "ngôn ngữ coder" hoặc "ngôn ngữ sinh viên".
2. **Từ *Score! Hero* & *Flick Kick Football***:
   - **Vẽ quỹ đạo bóng cong tự do (Freeform Curve Flick)**: Dùng chuột/vuốt ngón tay vẽ đường cong, bóng bay đúng quỹ đạo uốn lượn né hàng rào và găm góc chữ A.
   - **Đối kháng 2 chiều (Dual-Role Shootout Duel)**: Hiệp 1 làm Tiền Đạo sút bóng, Hiệp 2 vào vai Thủ Môn đeo găng phản xạ đỡ bóng thời gian thực!
   - **Thử thách hàng rào & Bia hồng tâm**: Cầu thủ hàng rào nhảy lên cản phá, chai nước đặt góc chữ A để tập sút trúng đích.
3. **Từ *NBA 3-Point Contest* & *Ketchapp Basketball***:
   - Cơ chế ném parabol ném xiên chính xác, va chạm bảng rổ đàn hồi, rung vành rổ (Rim Rattle), cơ chế "Swish!" xé lưới giòn giã và chuỗi bốc lửa "ON FIRE! 🔥".
4. **Từ *The Spike - Volleyball Story* & *Pikachu Volleyball***:
   - Chuỗi 3 chạm: Bước 1 (Đệm bóng) $\rightarrow$ Bước 2 (Chuyền bổng) $\rightarrow$ Bước 3 (Bật nhảy đập bóng uy lực dồn vệt lửa).

---

## 2. Thiết Kế Chi Tiết Toàn Bộ 7 Minigame Mới (Gameplay Logic & Visual Engine)

---

### 2.1. ☕ BARISTA FPTU SIMULATOR 2.0 — ĐẠI TU TOÀN DIỆN
> *Thay thế hoàn toàn cơ chế canh vạch xanh đơn điệu bằng trải nghiệm làm Barista đích thực.*

```
                                QUY TRÌNH BARISTA 4 TRẠM
                                           │
  ┌───────────────────┬────────────────────┴───────────────────┬───────────────────┐
  ▼                   ▼                                        ▼                   ▼
TRẠM 1: ORDER       TRẠM 2: TRÍCH XUẤT & PHÂN TẦNG           TRẠM 3: ĐÁNH KEM   TRẠM 4: LATTE ART & TOPPING
- Khách hàng FPTU   - Kéo thả đá viên lách cách              - Xoay ca đánh bọt - Tự do rót bọt sữa vẽ hình
- Thanh kiên nhẫn   - Rót sữa đặc chìm đáy ly (Tỷ trọng cao)   theo nhịp điệu   - Thuật toán chấm điểm Canvas
- Đơn hàng đa dạng  - Rót cà phê tầng giữa bốc khói          - Đo độ sánh mịn   - Rắc bột quế / trân châu
```

#### A. Logic Gameplay Chi Tiết:
1. **Trạm 1: Nhận Order Từ Khách Hàng FPTU (Customer Dialogue & Patience)**:
   - Khách hàng sinh viên và giảng viên ghé quầy với lời thoại dí dỏm và thanh kiên nhẫn (Patience Bar) đếm lùi:
     - *Dev IT thức khuya fix bug*: "Cho 1 ly Cà Phê Muối Đà Nẵng đậm đặc x2 espresso, ít ngọt, nhiều bọt kem béo để gánh deadline đồ án!"
     - *Nữ sinh Kinh Tế*: "1 ly Trà Đào Cam Sả mát lạnh, nhiều đá, ngọt thanh để chuẩn bị pitching dự án khởi nghiệp!"
     - *Giảng viên FPTU*: "1 ly Bạc Xỉu 3 Tầng phân lớp chuẩn chỉ, ít sữa đặc, lớp cafe thơm lừng!"
     - *Chủ nhiệm CLB*: "1 ly Cà Phê Trứng bọt vàng nghệ thuật vẽ logo DEVER!"
2. **Trạm 2: Trích Xuất & Phân Tầng Chất Lỏng Vật Lý (Liquid Density Layering)**:
   - Không bấm nút thụ động: Người chơi tương tác trực tiếp trên ly thủy tinh trong suốt:
     - *Thêm đá*: Kéo thả các viên đá lạnh rơi tưng tưng kêu "keng keng" vào ly (1-5 viên tùy yêu cầu).
     - *Rót sữa đặc / Siro*: Nhấn giữ vòi rót chất lỏng sẫm màu đặc sánh lắng xuống đáy ly (chất lỏng tỷ trọng cao $d > 1.2$).
     - *Rót cốt Cà phê phin / Trà ủ lạnh*: Kéo cần máy pha hoặc mở khóa phin, lớp cà phê màu nâu cánh gián bốc hơi nghi ngút nổi lên tầng giữa.
3. **Trạm 3: Đánh Bọt Kem Muối Hồng / Kem Trứng (Interactive Whisking Rhythm)**:
   - Người chơi dùng chuột hoặc ngón tay xoay tròn ca đánh bọt theo nhịp điệu (Circular Whisking Movement).
   - Đồng hồ áp kế hiển thị độ sánh mịn (Cream Texture):
     - Dưới 40%: Kem quá lỏng, sẽ bị chìm nghỉm vào cafe.
     - 70% - 88%: **Vùng Hoàn Hảo (Velvety Microfoam)** — lớp kem bông xốp mịn màng như nhung.
     - Trên 95%: Kem bị đánh quá tay, tách nước!
4. **Trạm 4: Tự Do Rót Bọt Sữa Vẽ Latte Art & Topping (Freeform Latte Art Pouring)**:
   - **Cơ chế Vẽ Bọt Sữa Tự Do**:
     - Người chơi cầm một ca sữa ảo (Milk Pitcher) nghiêng góc trên mặt ly cà phê.
     - Nhấn giữ chuột/ngón tay để dòng sữa trắng mịn tuôn trào trên bề mặt nâu sánh.
     - Di chuyển chuột uyển chuyển để tạo hình: Trái tim, Chiếc lá Rosetta, Mặt linh thú Buggy, hoặc vẽ tự do chữ "DEVER".
   - **Thuật toán Chấm Điểm Nghệ Thuật (Latte Art Recognizer)**:
     - Phân tích ma trận pixel trên mặt cốc: Tính toán độ đối xứng (symmetry score) và độ tương đồng với hình mẫu mẫu để thưởng điểm từ 1 đến 5 sao!
   - **Rắc Topping Decor**:
     - Lắc hũ gia vị rắc bột quế/cacao qua khuôn stencil logo CLB hoặc xúc trân châu đen giòn tan.
5. **Kinh Tế & Tiến Trình Nâng Cấp Quán (Progression & Upgrade Shop)**:
   - Kiếm được tiền tips và Cóc Vàng Coin để mua máy xay retro, mở khóa ly giữ nhiệt DEVER độc quyền và công thức bí truyền.

#### B. Đồ Họa & Âm Thanh Barista:
- **Giao diện Oblique 2.5D**: Quầy bar gỗ ấm áp, ánh đèn vàng thư thái phong cách lofi cafe.
- **Hiệu ứng chất lỏng**: Màu nước phân tầng rõ rệt (Trắng kem $\rightarrow$ Nâu cafe $\rightarrow$ Trắng sữa đặc) với bọt sóng lăn tăn và khói ấm bay lượn.
- **Âm thanh ASMR sống động**: Tiếng đá rơi lách cách, tiếng rót nước róc rách, tiếng đánh bọt kem xào xạc, tiếng chuông cửa quán cà phê "Keng-keng!".

---

### 2.2. ⚽ SÚT PHẠT ĐỀN & ĐÁ PHẠT HÀNG RÀO 2.0 (FOOTBALL SHOOTOUT & FREE-KICK DUEL)
> *Nâng cấp từ sút 1 nút thụ động thành game bóng đá kỹ thuật cao với đối kháng 2 chiều.*

```
                       CƠ CHẾ ĐÁ BÓNG 2 CHIỀU v0.6
                                    │
        ┌───────────────────────────┴───────────────────────────┐
        ▼                                                       ▼
LƯỢT TIỀN ĐẠO: VẼ QUỸ ĐẠO BÓNG CONG 3D                  LƯỢT THỦ MÔN: ĐEO GĂNG BẮT BÓNG PHẢN XẠ
- Vuốt/Kéo vẽ đường cong uốn lượn né hàng rào           - Điều khiển đôi găng tay thời gian thực
- Cầu thủ hàng rào nhảy lên cản phá                     - Phán đoán góc sút của đối thủ AI
- Bia hồng tâm & chai nước treo góc chữ A               - Bay người đấm bóng / bắt dính bóng
```

#### A. Logic Gameplay Chi Tiết:
1. **Cơ Chế Vẽ Quỹ Đạo Bóng Cong Tự Do (Freeform Curve Flick & Swipe Physics)**:
   - Thay vì canh thanh lắc lư: Người chơi dùng chuột hoặc vuốt ngón tay vẽ một đường cong uốn lượn trên màn hình.
   - Quả bóng bay theo đúng quỹ đạo 3D được vẽ:
     - Vuốt thẳng nhanh: Cú sút mu chính diện căng như kẻ chỉ (Knuckleball) xuyên thủng lưới.
     - Vẽ đường cong vòng cung: Hiệu ứng xoáy má trong/má ngoài (Magnus Effect) uốn cong quả bóng vòng qua hàng rào rồi ngoặc vào góc hiểm.
     - Vuốt nhẹ từ dưới lên: Cú bấm bóng tinh tế (Panenka) đánh lừa thủ môn đang đổ người.
2. **Hàng Rào Người Chắn (Defensive Wall Physics)**:
   - 3 đến 4 cầu thủ đối phương đứng làm hàng rào chắn góc gần. Khi người chơi chạm bóng, hàng rào bật nhảy lên cản phá.
   - Nếu sút quá thấp $\rightarrow$ bóng đập ngực hàng rào bật ngược lại. Người chơi phải vẽ đường bóng lượn qua khe hở hoặc vòng qua sườn hàng rào!
3. **Chế Độ Luân Lưu 2 Chiều Đối Kháng (5-Round Penalty Shootout Duel)**:
   - **Lượt 1 (Bạn là Tiền Đạo)**: Vẽ bóng ghi bàn đánh bại thủ môn AI.
   - **Lượt 2 (Bạn là Thủ Môn Đeo Găng)**:
     - Góc nhìn đổi về phía sau lưng khung thành nhìn ra chấm phạt đền.
     - Cầu thủ đối phương lấy đà sút bóng. Bạn điều khiển đôi găng tay di chuyển theo chuột/ngón tay để đón bắt quả bóng đang bay tới trong thời gian thực!
     - Cản phá thành công nếu găng tay tiếp xúc bóng đúng khoảnh khắc.
4. **Thử Thách Tập Luyện Hồng Tâm (Target Bullseye Challenge)**:
   - Khung thành treo các tấm bia hồng tâm điểm thưởng (+50đ, +100đ), chai nước khoáng đặt trên góc chữ A và chuông đồng treo ở xà ngang để người chơi thử thách kỹ năng sút tỉa góc chết.
5. **Mạng Lưới Khung Thành Vật Lý Đa Điểm (Spring-Mass Grid 8x6)**:
   - Khi bóng bay găm vào lưới, các mắt lưới đàn hồi co giãn và rung sóng lan tỏa cực kỳ đã mắt.

---

### 2.3. 🏀 BÓNG RỔ ARCADE & 3-POINT SHOOTOUT 2.0
> *Xóa bỏ hoàn toàn Flappy Bird, xây dựng game bóng rổ ném xiên parabol chuẩn arcade.*

#### A. Logic Gameplay Chi Tiết:
1. **Quỹ Đạo Parabol Ném Xiên Hoàn Chỉnh (Projectile Motion Physics)**:
   - Người chơi kéo ngược quả bóng về sau (Slingshot Drag Mechanism) hoặc nhấn giữ vạch canh lực/góc.
   - Đường ngắm chấm bi hiển thị quỹ đạo dự đoán (Trajectory Line).
   - Thả tay: Bóng bay vút theo phương trình chuyển động ném xiên có trọng lực $g$ và lực cản không khí.
2. **Va Chạm Đàn Hồi Bảng Rổ & Rung Vành Rổ (Rim Rattle)**:
   - Bảng rổ có hệ số đàn hồi $e = 0.65$: bóng nảy bật bảng chính xác theo góc tới bằng góc phản xạ.
   - Vành rổ là 2 chốt tròn cứng đàn hồi: bóng có thể nảy tưng nhiều nhịp quanh mép vành trước khi lọt xuống hoặc rơi ra ngoài, tạo cảm giác hồi hộp tột độ.
3. **Cơ Chế "SWISH!" & Chuỗi Bốc Lửa "ON FIRE! 🔥"**:
   - Bóng lọt thẳng vào tâm rổ mà không chạm vành hay bảng $\rightarrow$ **SWISH!** (Thưởng gấp đôi điểm, âm thanh xé lưới vang dội).
   - Ghi 3 quả Swish liên tiếp kích hoạt **Chế độ Bốc Lửa**: bóng bốc cháy ngùn ngụt, cổ động viên hò reo vang dội, điểm thưởng x3 cho đến khi ném trượt.
4. **Chướng Ngại Vật & Trụ Rổ Di Động (Dynamic Trickshots)**:
   - Từ điểm số 10 trở đi: Trụ rổ bắt đầu di chuyển lên xuống hoặc đung đưa nhịp nhàng.
   - Thêm các chướng ngại vật: Quạt gió thổi luồng khí đẩy lệch bóng, tấm chắn bay qua lại chắn bóng.

---

### 2.4. 🏐 BÓNG CHUYỀN & CẦU LÔNG 1v1 (VOLLEYBALL 3-TOUCH RALLY 2.0)
> *Chuyển hóa từ 2 khối hộp nhảy đứng thành trận cầu đỉnh cao phong cách The Spike & Pikachu Volleyball.*

#### A. Logic Gameplay Chi Tiết:
1. **Cơ Chế Phối Hợp 3 Pha Chuẩn Quốc Tế (3-Touch Rally Mechanics)**:
   - *Pha 1 — Đỡ Bước 1 (Dig/Receive)*: Di chuyển đón bóng đúng điểm rơi, đệm bóng bổng lên trời tạo thời gian chuẩn bị.
   - *Pha 2 — Chuyền Bước 2 (Toss/Set)*: Nhảy lên chuyền bóng đặt bóng điểm rơi ngay sát mép lưới ở tầm cao thuận lợi.
   - *Pha 3 — Bật Nhảy Đập Bóng Sấm Sét (Run-up & Power Spike)*: Lấy đà 2 bước, bật nhảy dậm chân lên không trung, canh đúng khoảnh khắc bóng đạt đỉnh và nhấn nút [Đập Bóng] $\rightarrow$ bóng phóng vọt sang sân đối phương với tốc độ x2.5 kèm vệt lửa rực rỡ!
2. **Kỹ Thuật Chiến Thuật Nâng Cao**:
   - *Bỏ nhỏ (Tip/Dink)*: Nhấn nút bỏ nhỏ khi thấy đối thủ lùi sâu, bóng rơi nhẹ sát mép lưới đối phương.
   - *Chắn bóng trên lưới (Block Timing)*: Nhảy lên cùng lúc đối thủ đập bóng để cản phá bóng bật ngược lại ngay tại lưới.
3. **AI Đối Thủ 3 Cấp Độ Bản Lĩnh**:
   - Cấp 1: Chỉ đỡ bóng cơ bản.
   - Cấp 2: Biết chuyền 2 và nhảy chắn lưới.
   - Cấp 3 (Đội Trưởng FPTU): Biết phối hợp bài bản, quan sát vị trí người chơi để đập bóng chéo sân hoặc bỏ nhỏ vào góc chết.

---

### 2.5. 🐍 RẮN SĂN MỒI SIÊU CẤP 2.0 (SNAKE SMOOTH & POWER-UPS)
#### A. Logic Gameplay Chi Tiết:
1. **Nội Suy Chuyển Động Trườn Mượt Mà 60FPS (Position Interpolation Lerp)**:
   - Các đốt thân rắn nối với nhau bằng các khớp mềm, trườn uốn lượn liên tục thay vì nhảy giật cục từng ô vuông 20px.
2. **Cơ Chế "Xả Thân Tăng Tốc" (Boost-Burn Mechanic như Slither.io)**:
   - Giữ phím Space để tăng tốc độ gấp đôi, nhưng mỗi 2 giây sẽ tiêu hao 1 đốt thân rắn rơi ra thành thức ăn trên sàn! Đòi hỏi tính toán rủi ro chiến thuật.
3. **Hệ Thống 5 Loại Vật Phẩm Đặc Trưng**:
   - 🍎 Táo Đỏ FPTU (+10đ, dài thêm 1 đốt).
   - ⚡ Ớt Siêu Tốc (+30đ, bứt tốc 5s húc vỡ gạch chướng ngại vật).
   - 🧲 Nam Châm Vàng (+25đ, hút mồi xung quanh bán kính 4 ô).
   - ❄️ Kem Tuyết Giảm Tốc (+15đ, làm chậm thời gian khi thân rắn quá dài).
   - 🌀 Cổng Portal 2 Chiều: Chui vào cổng xanh vọt ra từ cổng tím ở góc đối diện.
4. **Tùy Chọn Bộ Lọc CRT Retro Scanlines**: Thêm hiệu ứng màn hình lồi bóng đèn phosphor xanh neon hoài niệm.

---

### 2.6. 📦 ĐẨY HỘP TRÍ TUỆ SOKOBAN 2.0 (15 MÀN MICROBAN & CƠ CHẾ HIỆN ĐẠI)
#### A. Logic Gameplay Chi Tiết:
1. **Bộ 15 Màn Chơi Tinh Tuyển Microban**: Chia 3 cấp độ (5 màn Dễ $\rightarrow$ 5 màn Trung Bình $\rightarrow$ 5 màn Cực Khó).
2. **Cơ Chế Giải Đố Hiện Đại (Modern Puzzle Elements)**:
   - *Sàn Băng Trơn (Ice Floor)*: Khi đẩy hộp lên ô sàn băng, hộp trượt liên tục theo quán tính đến khi gặp chướng ngại vật hoặc ô sàn thường.
   - *Nút Kích Hoạt Cầu (Pressure Plate)*: Khi một chiếc hộp đè lên nút, cây cầu nối qua hào nước sẽ mở ra.
   - *Cổng Dịch Chuyển Portal*: Đẩy hộp vào cổng xanh, hộp văng ra từ cổng cam.
3. **Tính Năng Hỗ Trợ Đỉnh Cao**:
   - **Undo Stack Vô Hạn**: Bấm phím `U` hoặc nút Hoàn Tác để lùi lại bất kỳ bước đi nào.
   - **Deadlock Detector (Phát hiện kẹt góc thông minh)**: Tự động phát hiện khi hộp bị đẩy vào góc tường 90 độ chết không thể cứu vãn $\rightarrow$ hiển thị icon cảnh báo tinh tế nhắc người chơi nên Undo, không để lãng phí thời gian.
   - **Hệ Thống 3 Sao**: Chấm điểm dựa trên số bước di chuyển tối ưu (Par moves).

---

### 2.7. ⛏️ VUA ĐÀO VÀNG 2.0 (BUGGY GOLD RUSH & DYNAMITE CHAIN)
#### A. Logic Gameplay Chi Tiết:
1. **Dây Cáp Xích Sắt & Móc Kẹp Cơ Khí**:
   - Ròng rọc cơ khí quay tít với dây xích từng mắt cử động mềm mại. Móc kẹp 2 càng kim loại mở rộng khi phóng xuống và khép chặt khi ngoạm vật phẩm.
2. **Khoáng Sản Đa Dạng & Nổ Dây Chuyền TNT (Chain Reaction)**:
   - Vàng 3 kích cỡ ($50, $150, $500 với trọng lượng khác nhau).
   - Kim cương xanh ($600, siêu nhẹ kéo 2 giây).
   - Đá tảng vô dụng ($15, siêu nặng kéo mất 10 giây).
   - Thùng thuốc nổ TNT: Khi móc trúng, kích nổ chuỗi phá hủy toàn bộ khoáng sản xung quanh, tạo cơ hội mở đường vào mỏ kim cương tầng sâu!
   - Chuột chũi ngậm kim cương chạy lắt léo dưới đáy hầm.
3. **Cửa Hàng Nâng Cấp Giữa Các Màn (Shop System)**:
   - *Thuốc Nổ Dynamite (Phím Space)*: Khi lỡ móc phải đá tảng nặng nề, bấm Space để kích nổ bỏ vật phẩm, thu móc về ngay lập tức!
   - *Nước Tăng Lực*: Kéo vật nặng nhanh gấp 2.5 lần ở màn tiếp theo.
   - *Kính Soi Kho Báu*: Soi sáng nội dung bên trong Túi Bí Ẩn trước khi phóng móc.

---

## 3. Kiến Trúc Mã Nguồn Module Hóa (Sub-Engines Architecture)

Để tránh file `SportsArcade.js` hoặc `RetroArcade.js` bị phình to mất kiểm soát, toàn bộ logic được chia thành các Sub-Engine độc lập, chuẩn Clean Code:

```
src/
├── config/
│   ├── minigamesConfig.js            <-- Toàn bộ hằng số vật lý, điểm số, công thức đồ uống
│   └── sokobanLevels.js              <-- 15 màn chơi Microban chuẩn hóa
├── ui/
│   └── minigames/
│       ├── SportsArcade.js           <-- Facade Router kết nối UI và điều phối 4 môn thể thao
│       ├── RetroArcade.js            <-- Facade Router điều phối 3 game retro
│       ├── sports/
│       │   ├── PenaltyShootoutEngine.js    <-- Vuốt vẽ bóng cong 3D, hàng rào, bắt găng thủ môn
│       │   ├── BasketballShootoutEngine.js <-- Quỹ đạo parabol, va chạm vành, Swish & On-fire
│       │   ├── VolleyballRallyEngine.js    <-- Phối hợp 3 chạm, đập bóng Spike, chắn bóng Block
│       │   └── BaristaSimulatorEngine.js   <-- 4 trạm: Order FPTU, phân tầng chất lỏng, đánh kem, Latte Art
│       ├── retro/
│       │   ├── SnakeEngine.js              <-- Nội suy trườn 60fps, xả thân tăng tốc, 5 items
│       │   ├── SokobanEngine.js            <-- 15 màn, sàn băng trượt, deadlock detection, undo
│       │   └── GoldMinerEngine.js          <-- Móc xích sắt, TNT nổ dây chuyền, shop dynamite
│       └── common/
│           ├── CanvasJuiceFX.js            <-- Screen shake, floating score text đàn hồi, confetti
│           ├── LatteArtRecognizer.js       <-- Thuật toán so khớp ma trận pixel chấm điểm bọt sữa
│           └── CRTScreenOverlay.js         <-- Bộ lọc scanlines & ánh sáng phosphor cổ điển
└── utils/
    └── AudioManager.js                     <-- Nâng cấp procedural sound synth (Swish, Clang, Boom, ASMR Barista)
```

---

## 4. Lộ Trình Triển Khai 5 Sprint (Roadmap & Milestones)

### Sprint 1: Nền Tảng Cấu Hình, Procedural Audio & Engine Hiệu Ứng Juice
- [ ] Tạo `src/config/minigamesConfig.js`: Lưu trữ toàn bộ tham số cân bằng, vật lý, tốc độ, bảng điểm, công thức pha chế 4 món đồ uống FPTU.
- [ ] Tạo `src/config/sokobanLevels.js`: 15 màn chơi Microban chuẩn hóa.
- [ ] Mở rộng `src/utils/AudioManager.js`: Thêm các hàm tổng hợp Web Audio API:
  - `playKick(power)`, `playPostClang()`, `playGoalFanfare()`.
  - `playSwish()`, `playRimBounce()`, `playOnFire()`.
  - `playSpikeSmash()`, `playBlock()`.
  - `playIceClink()`, `playLiquidPour()`, `playWhisking()`.
  - `playExplosion()`, `playWinchCrank()`.
- [ ] Xây dựng `src/ui/minigames/common/CanvasJuiceFX.js` (Screen shake, floating text, confetti, khói ấm, tia lửa).
- [ ] Xây dựng `src/ui/minigames/common/LatteArtRecognizer.js` (So khớp ma trận vẽ bọt sữa).

### Sprint 2: Đại Tu Minigame Barista FPTU & Penalty Shootout
- [ ] Xây dựng `BaristaSimulatorEngine.js`:
  - Trạm 1: Khách hàng sinh viên IT, Kinh tế, Thiết kế với thanh kiên nhẫn.
  - Trạm 2: Đong đá viên rơi tưng tưng + phân tầng chất lỏng tỷ trọng (Sữa đặc $\rightarrow$ Cafe $\rightarrow$ Kem).
  - Trạm 3: Đánh bọt kem vi mô nhịp nhàng đo độ sánh mịn.
  - Trạm 4: Rót bọt sữa vẽ Latte Art tự do + chấm điểm nghệ thuật + rắc topping.
- [ ] Xây dựng `PenaltyShootoutEngine.js`:
  - Cơ chế vuốt vẽ đường cong 3D (Freeform Curve Flick) uốn bóng né hàng rào.
  - Hàng rào chắn người nhảy cản phá.
  - Chế độ đối kháng 2 chiều: Lượt sút bóng $\leftrightarrow$ Lượt đeo găng tay bắt bóng thời gian thực.
  - Thử thách bia hồng tâm góc chết.
  - Lưới bóng đá lò xo đa điểm (Spring-Mass Net Grid 8x6).

### Sprint 3: Hoàn Thiện Basketball 3-Point & Volleyball 3-Touch Rally
- [ ] Xây dựng `BasketballShootoutEngine.js`:
  - Quỹ đạo parabol ném xiên hoàn chỉnh, cơ chế kéo thả Slingshot hoặc vạch lực.
  - Va chạm bảng rổ đàn hồi & vành rổ kim loại (Rim Rattle).
  - Cơ chế Swish xé lưới + chuỗi bốc lửa "ON FIRE! 🔥" + trụ rổ di động.
- [ ] Xây dựng `VolleyballRallyEngine.js`:
  - Chuỗi 3 chạm: Đệm bóng bước 1 $\rightarrow$ Chuyền bóng bổng bước 2 $\rightarrow$ Bật nhảy đập bóng Spike vệt lửa bước 3.
  - Kỹ thuật bỏ nhỏ (Tip) và nhảy chắn bóng (Block).
  - Bot AI 3 cấp độ (Tân thủ $\rightarrow$ Bán chuyên $\rightarrow$ Đội trưởng FPTU).

### Sprint 4: Đại Tu 3 Minigame Cổ Điển (Snake, Sokoban, Gold Miner)
- [ ] Xây dựng `SnakeEngine.js`:
  - Nội suy chuyển động trườn 60fps mượt mà giữa các mắt xích thân rắn.
  - Cơ chế xả thân bứt tốc (Boost-Burn) tiêu hao đốt thân.
  - 5 loại vật phẩm (Táo, Ớt, Nam châm, Kem tuyết, Portal) + tùy chọn CRT Scanlines.
- [ ] Xây dựng `SokobanEngine.js`:
  - Tải 15 màn Microban, cơ chế sàn băng trượt (Ice floor) và nút mở cầu.
  - Undo vô hạn với phím `U` / nút Hoàn Tác.
  - Thuật toán Deadlock Detector phát hiện hộp kẹt góc tường.
- [ ] Xây dựng `GoldMinerEngine.js`:
  - Móc xích sắt chuyển động tự nhiên, 8 loại khoáng sản và thùng thuốc nổ TNT liên hoàn.
  - Cửa hàng trang bị: Thuốc nổ Dynamite (phím Space nổ đứt dây kéo), Nước tăng lực.

### Sprint 5: Kết Nối Facade, Database Sync, QA Playwright & Mobile Ergonomics
- [ ] Cập nhật `SportsArcade.js` và `RetroArcade.js` làm Facade Router chuyển hướng mượt mà sang các sub-engines mới.
- [ ] Mở rộng bảng lưu trữ kỷ lục trong `AuthService.js` và đồng bộ Postgres Supabase cho toàn bộ 7 minigames:
  - `barista_high`, `football_duel_high`, `basketball_swish_streak`, `volleyball_rally_high`, `snake_smooth_high`, `sokoban_stars_total`, `goldminer_cash_high`.
- [ ] Kiểm tra tính tương thích cảm ứng Mobile (iPhone SE, iPad, Android): hỗ trợ kéo vuốt mượt mà.
- [ ] Chạy toàn bộ test suite Playwright (`tests/e2e/ux-enhancements.spec.js`, `tests/e2e/retention-loop.spec.js`).
- [ ] Xác nhận Zero-Regression: 100% ID DOM được giữ nguyên (`#sports-arcade-canvas`, `#sports-action-btn`, `#retro-arcade-canvas`).
- [ ] Xác nhận 0% Emoji trên toàn bộ buttons và tabs điều hướng theo đúng quy chuẩn `AGENTS.md`.

---

## 5. Tiêu Chuẩn Nghiệm Thu (Acceptance Criteria)

| Minigame | Tiêu chuẩn chất lượng bản v0.6 |
|---|---|
| **☕ Barista FPTU** | Đầy đủ 4 trạm tương tác; khách hàng FPTU có hội thoại và thanh kiên nhẫn; đong đá và rót chất lỏng phân tầng vật lý; đánh bọt kem vi mô có đo độ sánh; tự do rót bọt sữa vẽ Latte Art với thuật toán chấm điểm 1-5 sao. |
| **⚽ Bóng Đá** | Hỗ trợ vuốt vẽ bóng cong 3D (Freeform Curve Flick); hàng rào chắn người nhảy cản phá; thi đấu luân lưu 2 chiều (vừa sút bóng vừa làm thủ môn đeo găng cản phá); lưới khung thành lò xo đa điểm phập phồng vật lý. |
| **🏀 Bóng Rổ** | Quỹ đạo ném xiên parabol hoàn chỉnh; va chạm bảng rổ & vành rổ nảy đàn hồi; âm thanh và hoạt ảnh Swish xé lưới giòn giã; kích hoạt chuỗi bốc lửa "ON FIRE! 🔥" khi đạt 3 quả Swish liên tiếp; trụ rổ di chuyển ở điểm cao. |
| **🏐 Bóng Chuyền** | Cơ chế 3 pha phối hợp (Đỡ $\rightarrow$ Chuyền $\rightarrow$ Đập bóng Spike vệt lửa); có kỹ thuật bỏ nhỏ và nhảy chắn lưới Block; bot AI 3 cấp độ đối kháng hấp dẫn. |
| **🐍 Snake** | Thân rắn trườn uốn lượn 60fps không giật cục; cơ chế xả thân bứt tốc tiêu hao đốt thân; 5 loại vật phẩm phong phú và cổng dịch chuyển Portal; tùy chọn bộ lọc CRT scanlines. |
| **📦 Sokoban** | Đầy đủ 15 màn chơi Microban; cơ chế sàn băng trơn và nút kích hoạt cầu; tính năng Undo vô hạn và cảnh báo kẹt góc Deadlock Detector hoạt động chính xác. |
| **⛏️ Đào Vàng** | Dây cáp xích sắt cơ học; nổ dây chuyền thùng thuốc nổ TNT; cửa hàng trang bị giữa các màn (phím Space kích nổ Dynamite khi móc phải đá); 8 loại khoáng sản phong phú. |
| **Quy Chuẩn Hệ Thống** | 100% Playwright tests pass; `npm run build` không có lỗi; 0% emoji trên buttons/tabs theo chuẩn `AGENTS.md`. |

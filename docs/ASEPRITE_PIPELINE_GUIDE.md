# Cẩm Nang Tích Hợp Đồ Họa & Hoạt Ảnh Aseprite 2D Pixel Vào DEVER_TOWN

Tài liệu hướng dẫn quy chuẩn thiết kế Pixel Art, tạo animation mượt mà bằng **Aseprite** và tích hợp trực tiếp vào engine Phaser 3 của **DEVER_TOWN**.

---

## 1. Bản Chất Của Aseprite & Tại Sao Animation Mượt Hơn Gấp Bội?

### So sánh kỹ thuật: 4-Frame Grid hiện tại vs Chuẩn Aseprite 8-Frame Tagged Atlas

| Tiêu chí | Hệ thống 4-Frame Lưới Hiện Tại | Chuẩn Aseprite 8-Frame Tagged Atlas |
| :--- | :--- | :--- |
| **Walk Cycle** | 4 frames (chân bước thô, cảm giác robot) | **8 frames** (Contact, Down, Pass, Up, Contact 2, Down 2, Pass 2, Up 2) |
| **Idle (Đứng Yên)** | 1 frame tĩnh (bất động như tượng) | **4-6 frames** (Thở nhẹ phập phồng, mắt chớp nháy sau mỗi 3s) |
| **Cadence (Nhịp)** | 9 FPS cứng nhắc cho mọi hành động | **Frame Duration linh hoạt** (Ví dụ frame giẫm chân 120ms, frame lăng chân 80ms) |
| **Độ mượt mà** | Cảm giác pixel game thập niên 90 | Đạt chuẩn **60 FPS Indie mượt mà** (*Celeste*, *Stardew Valley*) |
| **Phụ kiện nảy** | Mũ áo, quai balo dính chết vào người | **Secondary Motion**: Tóc bay, dây hoodie đung đưa theo bước chạy |

---

## 2. Quy Chuẩn Kích Thước & Thiết Lập Trong Aseprite

Khi mở Aseprite để vẽ nhân vật cho `DEVER_TOWN`:
1. **Kích thước Canvas mỗi Frame:** `48 × 64` px (Tỷ lệ vàng Chibi 1:1.2).
2. **Color Mode:** `RGB Color` (hoặc `Indexed` với bảng màu chuẩn FPTU: Xanh Navy `#0a0f24`, Cam FPT `#f26f21`, Trắng ngà `#f8fafc`).
3. **Màu nền phôi:** Để nền trong suốt (Transparent Checkerboard) hoặc Solid Magenta `#FF00FF` nếu xuất dạng chroma-key.

---

## 3. Cấu Trúc Tag Animation Chuẩn Hóa

Trong Timeline của Aseprite, bôi đen các frame và bấm phím tắt `F2` để tạo Tag:

```text
Tags Timeline:
├── idle_down   (Frame 0 - 3,   Duration: 200ms/frame) -> Thở nhẹ ngực nâng 1px
├── idle_left   (Frame 4 - 7,   Duration: 200ms/frame)
├── idle_right  (Frame 8 - 11,  Duration: 200ms/frame)
├── idle_up     (Frame 12 - 15, Duration: 200ms/frame)
├── walk_down   (Frame 16 - 23, Duration: 90ms/frame)  -> 8 bước chân sải dài
├── walk_left   (Frame 24 - 31, Duration: 90ms/frame)
├── walk_right  (Frame 32 - 39, Duration: 90ms/frame)
├── walk_up     (Frame 40 - 47, Duration: 90ms/frame)
└── cheer       (Frame 48 - 53, Duration: 120ms/frame) -> Nhảy vẫy tay ăn mừng
```

---

## 4. Cách Xuất File Từ Aseprite (Export Settings)

1. Chọn Menu: **File -> Export Sprite Sheet** (hoặc tổ hợp phím `Ctrl + Alt + Shift + S`).
2. Tab **Layout**:
   - Sheet Type: `Packed` (hoặc `By Rows`).
3. Tab **Sprite**:
   - Frames: `All frames`.
   - Layers: `Visible layers`.
4. Tab **Borders**:
   - Trim Sprite: `Bỏ chọn` (để giữ nguyên hitbox 48x64px).
5. Tab **Output**:
   - [x] **Output File**: Đặt tên `char_hero.png`.
   - [x] **JSON Data**: Đặt tên `char_hero.json`.
   - Data Format: `Hash` hoặc `Array`.
   - [x] **Item Filename**: `{title} ({tag} {tagframe})`.
   - [x] **Open JSON**: Bật tùy chọn `Tags`.

---

## 5. Tích Hợp Vào Phaser 3 Trong `DEVER_TOWN`

Phaser 3 hỗ trợ nạp tệp Aseprite native cực kỳ tinh gọn:

### Bước 1: Nạp trong Scene Preload (Ví dụ `BootScene.js`)
```javascript
preload() {
  // Load cặp file PNG và JSON xuất từ Aseprite
  this.load.aseprite('char_pro_hero', 'assets/characters/char_pro_hero.png', 'assets/characters/char_pro_hero.json');
}
```

### Bước 2: Tự động khởi tạo Animation
Phaser 3 sẽ tự động phân tích các Tag và tạo anims:
```javascript
create() {
  // Tạo sprite và chạy ngay tag idle_down từ Aseprite JSON
  const player = this.physics.add.sprite(400, 300, 'char_pro_hero');
  player.play({ key: 'idle_down', repeat: -1 });
  
  // Khi di chuyển, chuyển sang tag walk_down (8 frames mượt mà)
  // player.play({ key: 'walk_down', repeat: -1 });
}
```
Không cần phải tính toán chia dòng `row * 4` hay hardcode số frame như trước!

---

## 6. Lộ Trình Triển Khai (Roadmap)
1. **Giai đoạn 1 (Đã hoàn thành):** Đưa nhịp thở hữu cơ `idle_breathe` và Squash & Stretch vào `Player.js`, loại bỏ hoàn toàn tình trạng nhân vật chết đơ khi dừng lại.
2. **Giai đoạn 2 (Thiết kế mẫu):** Họa sĩ sử dụng cẩm nang này trên Aseprite để vẽ bộ trang phục đầu tiên (Gen 10 Builder) với chu kỳ 8-frame walk cycle.
3. **Giai đoạn 3 (Nạp tự động):** Tích hợp loader Aseprite vào `TextureGenerator.js` để ưu tiên nạp file JSON nếu có, tự động fallback về Canvas procedural nếu chạy offline.

# 📘 BÁO CÁO TIẾN TRÌNH DỰ ÁN DEVER TOWN (2D PIXEL GATHER.TOWN)

*Cập nhật tự động bởi hệ thống Autonomous Agents*  
*Tác giả Git:* **RaH11** `<hungnguyen.190206@gmail.com>`

---

## 🎯 TỔNG QUAN TIẾN ĐỘ

```
[✅ Init] ➔ [✅ Bước 1: 2D Engine] ➔ [✅ Bước 2: Multiplayer Realtime] ➔ [🔄 Bước 3: Auth & DB] ➔ [⏳ Bước 4: Multi-Room] ➔ [⏳ Bước 5: Interactive Zones]
```

---

## 📋 CHI TIẾT TỪNG BƯỚC THỰC HIỆN

### ✅ BƯỚC 1: Khởi tạo Game Client 2D Top-Down (Hoàn thành)
- **Engine:** Phaser 3.88 + Vite 6 (JavaScript module ES6).
- **Đồ họa Pixel Art:** Tự sinh bộ texture trên Canvas trong bộ nhớ qua `TextureGenerator.js` (8 loại tile + Spritesheet 4 hướng x 3 frame).
- **Hệ thống điều khiển:** WASD + phím Mũi tên với Vector Normalization (chống lỗi tăng tốc khi đi chéo).
- **Vật lý & Chiều sâu:** Arcade Physics với hitbox chỉ ở phần chân (18x14px), phân lớp 2.5D Depth (`depth = y`), va chạm chuẩn xác với tường gạch, giá sách, bàn ghế.
- **Camera & UI:** Camera Lerp follow mượt mà, viền bản đồ cố định.
- **Git Commit:** `6cab84b` - *feat(step-1): initialize Phaser 3 game client, pixel art map 20x15, 4-dir movement, animations, camera follow, and obstacle collision*

---

### ✅ BƯỚC 2: Multiplayer Realtime & Live Chatbox (Hoàn thành)
- **Backend Realtime:** Node.js + Express + Socket.io trên cổng `3001` (hỗ trợ WebSocket & HTTP Long-polling).
- **Đồng bộ vị trí mượt mà:**
  - Client gửi gói tin di chuyển Throttled 30 FPS với Dirty Checking.
  - Remote Player sử dụng thuật toán nội suy tuyến tính (Linear Interpolation - Lerp) để triệt tiêu hiện tượng giật lag (jitter).
- **Live Chat & Speech Bubble:**
  - Khung chat Glassmorphism hiện đại phía dưới/phải, phím tắt `Enter` mở chat và gửi tin.
  - Cách ly sự kiện bàn phím: khi đang gõ chat, phím WASD không làm nhân vật di chuyển.
  - Bong bóng thoại (Speech Bubble) bay lơ lửng trên đầu nhân vật, tự động mờ dần và biến mất sau 4.5 giây.
- **Quản lý Nickname & Người online:**
  - Modal nhập Biệt danh khi vào thị trấn, lưu LocalStorage.
  - Đổi tên linh hoạt tức thì, đồng bộ Name Tag tới toàn bộ người chơi khác.
  - Tự động xóa nhân vật khi ngắt kết nối (Disconnect).
- **Kiểm thử thực tế:** Đã chạy thử nghiệm với nhiều người chơi đồng thời trên trình duyệt thành công 100%.

---

### 🔄 BƯỚC 3: Authentication, User Profile & Database (Đang thực hiện)
- Thiết kế hệ thống Đăng ký / Đăng nhập (JWT + Passwords).
- Chọn bộ sưu tập Avatar Pixel Art (nhiều màu áo/tóc/phong cách).
- Cơ chế lưu trữ tài khoản người dùng, vai trò (Admin, Leader, Member).

---

### ⏳ BƯỚC 4: Quản lý Club & Đa bản đồ (Multi-Room) (Sắp tới)
- Hệ thống nhiều phòng: Sảnh chính (Main Hall), Phòng CLB Code (Dever Lab), Phòng Thư viện, Khu Vườn ngoài trời.
- Cửa dịch chuyển (Teleport Portals) giữa các phòng.

---

### ⏳ BƯỚC 5: Khu vực tương tác (Interactive Zones) (Sắp tới)
- Vùng tương tác bàn học, sân khấu: Phím `[E]` mở popup nhúng Google Slides, Google Meet, YouTube, Whiteboard.

---

*Tài liệu này được cập nhật và commit vào Git sau mỗi bước hoàn thành.*

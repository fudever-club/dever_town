# 📘 BÁO CÁO TIẾN TRÌNH DỰ ÁN DEVER TOWN (2D PIXEL GATHER.TOWN)

*Cập nhật tự động bởi hệ thống Autonomous Agents*  
*Tác giả Git:* **RaH11** `<hungnguyen.190206@gmail.com>`

---

## 🎯 TỔNG QUAN TIẾN ĐỘ

```
[✅ Init] ➔ [✅ Bước 1: 2D Engine] ➔ [✅ Bước 2: Multiplayer Realtime] ➔ [✅ Bước 3: Auth & Database] ➔ [🔄 Bước 4: Multi-Room & Clubs] ➔ [⏳ Bước 5: Interactive Zones]
```

---

## 📋 CHI TIẾT TỪNG BƯỚC THỰC HIỆN

### ✅ BƯỚC 1: Khởi tạo Game Client 2D Top-Down (Hoàn thành)
- **Engine:** Phaser 3.88 + Vite 6 (JavaScript module ES6).
- **Đồ họa Pixel Art:** Tự sinh bộ texture trên Canvas trong bộ nhớ qua `TextureGenerator.js` (8 loại tile + Spritesheet 4 hướng x 3 frame).
- **Hệ thống điều khiển:** WASD + phím Mũi tên với Vector Normalization.
- **Vật lý & Chiều sâu:** Arcade Physics với hitbox phần chân (18x14px), phân lớp 2.5D Depth (`depth = y`), va chạm chuẩn xác với tường gạch, giá sách, bàn ghế.
- **Camera & UI:** Camera Lerp follow mượt mà, viền bản đồ cố định.
- **Git Commit:** `6cab84b`

---

### ✅ BƯỚC 2: Multiplayer Realtime & Live Chatbox (Hoàn thành)
- **Backend Realtime:** Node.js + Express + Socket.io trên cổng `3001` (hỗ trợ WebSocket & HTTP Long-polling).
- **Đồng bộ vị trí mượt mà:**
  - Client gửi gói tin di chuyển Throttled 30 FPS với Dirty Checking.
  - Remote Player sử dụng thuật toán nội suy tuyến tính (Linear Interpolation - Lerp) để triệt tiêu hiện tượng giật lag.
- **Live Chat & Speech Bubble:**
  - Khung chat Glassmorphism hiện đại phía dưới/phải, phím tắt `Enter` mở chat và gửi tin.
  - Cách ly sự kiện bàn phím: khi đang gõ chat, phím WASD không làm nhân vật di chuyển.
  - Bong bóng thoại (Speech Bubble) bay lơ lửng trên đầu nhân vật, tự động mờ dần và biến mất sau 4.5 giây.
- **Quản lý Nickname & Người online:**
  - Modal nhập Biệt danh khi vào thị trấn, lưu LocalStorage.
  - Đổi tên linh hoạt tức thì, đồng bộ Name Tag tới toàn bộ người chơi khác.
  - Tự động xóa nhân vật khi ngắt kết nối (Disconnect).
- **Git Commit:** `42a23a7`

---

### ✅ BƯỚC 3: Authentication, Profiles & Hybrid Database Layer (Hoàn thành)
- **REST API Xác thực:**
  - `POST /api/auth/register`: Đăng ký tài khoản (băm mật khẩu `bcryptjs` 10 salt rounds).
  - `POST /api/auth/login`: Đăng nhập cấp phát JWT token an toàn (`jsonwebtoken`).
  - `GET /api/auth/me`: Xác thực token lấy thông tin người dùng.
  - `PUT /api/auth/profile`: Cập nhật tên hiển thị và đổi avatar.
- **Hybrid Database Architecture (Zero-Crash Fallback):**
  - Tự động kết nối PostgreSQL khi có biến môi trường `DATABASE_URL`.
  - Tự động fallback an toàn sang `server/data/users.json` với cơ chế ghi file nguyên tử (Atomic file write), kèm 2 tài khoản mẫu (Admin: `admin@devertown.com` / `admin123`, Leader: `leader@devertown.com` / `leader123`).
- **Bộ sưu tập 4 Avatar Pixel Art & Role Badges:**
  - `dev_hoodie` (Developer truyền thống: Áo hoodie xanh, balo cam).
  - `cyberpunk_pink` (Cyberpunk Neon: Áo hồng neon, tóc cyan, kính VR).
  - `red_gamer` (Gamer Pro: Áo đỏ, tai nghe gaming).
  - `green_coder` (Emerald Hacker: Áo bomber xanh ngọc, kính mắt tri thức).
  - Hệ thống huy hiệu vai trò: 👑 Admin, ⭐ Leader, 💻 Dev, 👤 Khách hiển thị trên Name Tag và trong từng tin nhắn Chat.
- **Socket.io Handshake Auth:** Xác thực JWT token ngay tại Socket Handshake Middleware, liên kết danh tính người dùng và ngăn chặn giả mạo vai trò.
- **Kiểm thử tự động:** Đạt 6/6 bài test API & Socket Authentication 100% PASSED.
- **Git Commit:** *Chờ commit Bước 3*

---

### 🔄 BƯỚC 4: Quản lý Club & Đa bản đồ (Multi-Room) (Đang thực hiện)
- Hệ thống phòng:
  - 🏛️ **Sảnh chính (Main Hall)**: Khu giao lưu chung, sân vườn, thảm họp.
  - 💻 **Phòng CLB Dever Lab (Code Room)**: Dãy bàn máy tính, bảng ý tưởng, giá sách công nghệ.
  - 📚 **Thư viện Yên tĩnh (Library Lounge)**: Khu tự học, sofa, sách chuyên ngành.
  - 🌿 **Khu Vườn Ngoài Trời (Outdoor Garden)**: Cây cối, đài phun nước, thảm cỏ dã ngoại.
- Cửa chuyển phòng (Teleport Doors / Portals) tự động chuyển Scene và chuyển Socket Room (`socket.join(roomId)`).

---

### ⏳ BƯỚC 5: Khu vực tương tác (Interactive Zones) (Sắp tới)
- Vùng tương tác bàn học, sân khấu: Phím `[E]` mở popup nhúng Google Slides, Google Meet, YouTube, Whiteboard.

---

*Tài liệu này được cập nhật và commit vào Git sau mỗi bước hoàn thành.*

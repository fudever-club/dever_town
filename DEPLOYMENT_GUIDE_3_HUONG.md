# 🚀 HƯỚNG DẪN TRIỂN KHAI TOÀN DIỆN DEVER TOWN (3 HƯỚNG)

Tài liệu này hướng dẫn chi tiết từng bước để triển khai **DEVER TOWN** theo cả 3 phương án:
1. **Hướng A: Chơi Trực Tiếp Trên Điện Thoại (Mobile Responsive & Touch Virtual D-Pad)**
2. **Hướng B: Đưa Lên Mạng Online Miễn Phí (Supabase PostgreSQL + Render Backend + Vercel Frontend)**
3. **Hướng C: Đóng Gói Ứng Dụng Tải Về Máy Tính (.exe Windows / Mac App)**

---

## 📱 HƯỚNG A: TRẢI NGHIỆM TRÊN ĐIỆN THOẠI (ĐÃ HOÀN THIỆN SẴN)

Hệ thống đã được tích hợp bộ điều khiển cảm ứng ảo **Mobile Touch Virtual Controls**:
- **🕹️ D-Pad ảo (Góc trái dưới)**: 4 nút điều hướng **Lên, Xuống, Trái, Phải** phản hồi xúc giác nhanh.
- **⚡ Nút Tròn Tương Tác [E] (Góc phải dưới)**: Chạm để tương tác với màn chiếu Slide, Bàn Code, Quầy Lofi, Minigame Sút bóng / Ném bóng rổ.
- **🎒 Nút Túi Đồ [I]**: Chạm để mở nhanh Túi đồ FPTU.
- **💬 Nút Mở Chat**: Chạm để mở/đóng khung chat Realtime.
- **Tự động kích hoạt**: Khi truy cập từ điện thoại/máy tính bảng hoặc màn hình <= 1024px, bộ phím ảo sẽ tự động xuất hiện.

---

## 🌐 HƯỚNG B: ĐƯA LÊN MẠNG ONLINE (WEB MULTIPLAYER CLOUD)

### BƯỚC 1: Tạo Database PostgreSQL Miễn Phí Trên Supabase
1. Truy cập [Supabase.com](https://supabase.com) và đăng nhập bằng GitHub / Google.
2. Nhấn **New Project** -> Đặt tên dự án: `dever-town-db` -> Nhập mật khẩu Database.
3. Vào mục **Project Settings** -> **Database** -> Copy chuỗi **Connection String (URI)**:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres
   ```

---

### BƯỚC 2: Deploy Backend Realtime Server (Render.com)
1. Đăng ký/Đăng nhập tại [Render.com](https://render.com).
2. Chọn **New +** -> **Web Service** -> Chọn Repository GitHub của bạn (`DEVER_TOWN`).
3. Cấu hình các thông số:
   - **Name**: `dever-town-server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run server`
   - **Plan**: `Free`
4. Tại mục **Environment Variables** (Biến môi trường), thêm 3 biến:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = `dever_town_secure_jwt_secret_2026`
   - `DATABASE_URL` = *(Dán chuỗi Connection String Supabase ở Bước 1 vào đây)*
5. Nhấn **Create Web Service**. Sau 1-2 phút, bạn sẽ nhận được đường dẫn Backend, ví dụ:
   `https://dever-town-server.onrender.com`

---

### BƯỚC 3: Deploy Frontend Client (Vercel.com)
1. Đăng nhập [Vercel.com](https://vercel.com) -> Nhấn **Add New...** -> **Project**.
2. Chọn Repository GitHub `DEVER_TOWN`.
3. Tại phần **Environment Variables**, thêm biến:
   - **Name**: `VITE_SERVER_URL`
   - **Value**: `https://dever-town-server.onrender.com` *(Link backend Render vừa tạo)*
4. Nhấn **Deploy**.
5. 🎉 **HOÀN TẤT!** Vercel sẽ cấp cho bạn tên miền trực tuyến tốc độ cao (ví dụ: `https://dever-town.vercel.app`), mọi người có thể vào chơi multiplayer cùng lúc trên máy tính và điện thoại.

---

## 💻 HƯỚNG C: ĐÓNG GÓI BẢN CÀI ĐẶT TRÊN MÁY TÍNH (.EXE WINDOWS)

Nếu bạn muốn tạo file cài đặt `.exe` để thành viên CLB tải về máy mở lên chơi:

### Cách 1: Chạy thử cửa sổ Native App Desktop
Đảm bảo đã cài `electron` (nếu chưa cài, chạy `npm install -D electron`):
```bash
npm run build
npm run app:desktop
```

### Cách 2: Xuất file cài đặt `DEVER_TOWN_Setup.exe`
1. Cài đặt công cụ đóng gói:
   ```bash
   npm install -D electron-builder
   ```
2. Chạy lệnh xuất file `.exe`:
   ```bash
   npx electron-builder --win
   ```
3. File cài đặt `.exe` sẽ được tạo ra trong thư mục `dist_electron/`. Bạn có thể gửi file này cho bạn bè hoặc upload lên Google Drive cho mọi người tải về.

---

## 🏆 TỔNG KẾT TÍNH NĂNG ĐÃ SẴN SÀNG

| Hạng mục | Trạng thái | Ghi chú |
| :--- | :---: | :--- |
| **Giao diện & Nút bấm Mobile** | ✅ ĐÃ TÍCH HỢP | D-Pad ảo, Nút [E], Nút [I], Chat toggle |
| **Dual Database Adapter** | ✅ ĐÃ TÍCH HỢP | Tự động chạy JSON Local hoặc Postgres Supabase |
| **Cấu hình Vercel & Render** | ✅ ĐÃ TÍCH HỢP | `vercel.json` và `render.yaml` đã sẵn sàng |
| **Desktop Native App** | ✅ ĐÃ TÍCH HỢP | `electron/main.cjs` và script `app:desktop` |
| **7 Phòng & Minigame Thể Thao** | ✅ ĐÃ TÍCH HỢP | Zero-Regression, an toàn tuyệt đối |

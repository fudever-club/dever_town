---
name: production-deploy-guard
description: >-
  Quy chuẩn thẩm định, kiểm thử tự động End-to-End (Playwright CLI), diệt trừ AI Slop / Cliche (Impeccable Design & Tone),
  rà soát toàn vẹn Entity/Codebase và quản trị Deploy Production lên Vercel & Render cho DEVER TOWN.
---

# 🛡️ DEVER TOWN Production Deploy Guard & Quality Protocol

Quy trình thẩm định bắt buộc thực hiện **trước mọi lần deploy lên môi trường Production (Vercel / Render)** nhằm đảm bảo chất lượng hoàn hảo (Impeccable Quality), không lỗi thời gian thực (Zero Runtime Glitches) và bản sắc văn hóa FUDA chuẩn xác.

---

## 📋 1. Quy Trình Thẩm Định 4 Bước (Pre-Deploy Production Gate)

```
[ BƯỚC 1: E2E TESTING (Playwright CLI) ]
             ▼
[ BƯỚC 2: DIỆT TRỪ AI SLOP & CLICHÉ (Impeccable Tone) ]
             ▼
[ BƯỚC 3: RÀ SOÁT TOÀN VẸN SOURCE CODE & ENTITY ]
             ▼
[ BƯỚC 4: DEPLOY VERCEL PRODUCTION (Vercel CLI) ]
```

---

## 🧪 2. Bước 1: End-to-End Testing Bằng Playwright CLI

Trước khi deploy, chạy bộ test tự động giả lập trình duyệt Desktop và Mobile:

```bash
# 1. Cài đặt browser engines của Playwright (nếu chạy lần đầu)
npx playwright install chromium

# 2. Chạy toàn bộ test suite E2E
npx playwright test

# 3. Xem báo cáo kiểm thử trực quan
npx playwright show-report
```

### Các kịch bản kiểm thử cốt lõi:
1. **Welcome Gate Flow**: Khởi tạo cổng đón tiếp, chuyển đổi 3 tab (Khách, Đăng nhập, Đăng ký), kiểm tra chặn tên cấm.
2. **Canvas Phaser 3 Lifecycle**: Khởi động WebGL/Canvas game 800x600, render nhân vật không rớt frame.
3. **Phím Tắt & Modals**: Phím `I` (Túi đồ), `E` (Tương tác), `Esc` (Đóng modal), menu Settings, Quest Modal.
4. **Hệ Thống Đa Ngôn Ngữ (i18n)**: Toggle Tiếng Việt 🇻🇳 và English 🇬🇧 không bị gãy layout.
5. **Realtime Socket & Chat**: Gửi tin nhắn tiếng Việt có dấu, bong bóng thoại bay trên đầu nhân vật.
6. **Mobile Touch Responsive**: Giả lập mobile viewport hiển thị D-Pad ảo và nút cảm ứng.

---

## 🎨 3. Bước 2: Impeccable Design & Diệt Trừ AI Slop / Cliche

Triệt tiêu hoàn toàn các biểu hiện "AI Slop" (nội dung vô hồn, văn mẫu chung chung của máy móc, placeholder rác):

### 🚫 Các Từ Khóa Cấm & Lỗi Cần Tránh (Anti-Cliché Checklist):
- ❌ **Không dùng văn mẫu AI rập khuôn**: Tránh các cụm từ như *"Chào mừng bạn đến với thế giới kỳ diệu"*, *"Một trải nghiệm đỉnh cao chưa từng có"*, *"Nền tảng đột phá thay đổi tương lai"*.
- ❌ **Không dùng dữ liệu giả generic**: Không dùng "Lorem ipsum", "John Doe", "Room 1 2 3", "Item test".
- ❌ **Không gãy chữ tiếng Việt**: Kiểm tra font `Outfit` và `JetBrains Mono` hiển thị trơn tru, không lỗi dấu Unicode.
- ❌ **Không dùng màu sắc nhạt nhẽo / lệch theme**: Tuân thủ bảng màu chuẩn FPT Cam (`#f26f21`), Xanh DEVER (`#0066CC`), Nền tối Cyber Dark (`#070a12`, `#0f172a`) và hiệu ứng Glassmorphism.

### ✅ Giữ Đúng Bản Sắc Văn Hóa Sinh Viên FUDA:
- Tôn chỉ: **"WORK HARD - PLAY HARD"**.
- Địa danh thực tế: Tòa Alpha, Tòa Gamma Lab, Tòa Beta Thư viện, Khu Vovinam, Căn tin Tầng 1 & 2, Bờ biển Sơn Trà, Cầu Rồng Đà Nẵng.
- Món ăn đặc sản: **Cà Phê Muối Đà Nẵng**, Trà Sữa Đào Kem Cheese.
- Học thuật thực tế: Môn thi PE SWE201c, ICPC, Hackathon, Linux, Docker, VS Code.

---

## 🔍 4. Bước 3: Rà Soát Toàn Vẹn Mã Nguồn & Toàn Bộ Entity

Đọc và kiểm tra tính toàn vẹn của các thực thể và cấu hình:

1. **Entity Player & RemotePlayer (`src/entities/`)**:
   - Tọa độ di chuyển, hướng nhìn (`up`, `down`, `left`, `right`), tốc độ di chuyển (`160px/s`).
   - Sprite layers: Thân người, tóc, trang phục, vật phẩm cầm tay (Equipped Handheld Sprite).
   - Tên hiển thị và bong bóng chat không bị lệch tâm.
2. **8 Bản Đồ & Spawn Points (`src/config/maps.js`)**:
   - `spawnPoint` và `targetSpawn` của 8 phòng nằm cách tường tối thiểu >= 2 ô (>= 64px), không đè lên tile portal `10`.
   - Cooldown teleport >= 1.5s để chống vòng lặp nhảy cổng vô tận.
3. **Backend Controllers & Routes (`server/controllers/`, `server/routes/`)**:
   - Rate limiter hoạt động đúng trên các endpoint nhạy cảm (Đăng ký, Đăng nhập, Gửi điểm minigame).
   - XSS sanitization lọc sạch chuỗi độc hại trước khi lưu DB.
   - Fallback DB giữa JSON File Adapter và PostgreSQL Supabase mượt mà.
4. **Kiểm Tra Build Bundle**:
   - Chạy `npm run build` để kiểm tra độ tương thích bundle của Vite (0 errors, 0 broken module imports).

---

## 🚀 5. Bước 4: Triển Khai Lên Vercel Bằng Vercel CLI

Sử dụng Vercel CLI để quản lý deployment:

```bash
# 1. Đăng nhập Vercel (nếu chưa đăng nhập)
vercel login

# 2. Liên kết dự án với Vercel Project
vercel link

# 3. Kiểm tra bản Preview trước
vercel

# 4. Deploy trực tiếp lên Production (Môi trường chính thức)
vercel --prod
```

### Biến môi trường bắt buộc trên Vercel:
- `VITE_SERVER_URL`: Đường dẫn URL Backend đang chạy trên Render (ví dụ: `https://dever-town-server.onrender.com`).

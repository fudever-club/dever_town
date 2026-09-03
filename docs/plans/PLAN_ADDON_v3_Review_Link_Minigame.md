# 📘 PLAN ADD-ON v3 — DEVER TOWN
### Review Expansion v3 + Hướng dẫn định dạng Link + Logic Minigame Thể Thao

---

## 1. Đánh giá Expansion v3

**Đã làm tốt:** kiến trúc data-driven rooms, Unicode fix đúng gốc rễ, QA test 6/6 pass, production build sạch, tốc độ mở rộng tính năng rất nhanh.

**Cần xử lý trước khi mời người CLB thật vào test:**

### 1.1. Bảo mật (ưu tiên cao)
```
Kiểm tra và xác nhận các điểm bảo mật sau trước khi deploy production:
1. JWT secret key có đang nằm trong file .env (không commit lên git) không? Nếu đang hardcode trong code, chuyển ngay sang biến môi trường.
2. Endpoint /api/auth/login và /api/auth/register có rate-limiting không (ví dụ express-rate-limit)? Nếu chưa có, thêm để chống brute-force.
3. Kiểm tra file .gitignore đã loại trừ .env, node_modules, server/data/users.json (nếu chứa password hash) chưa.
4. Input chat/nickname có được sanitize chống XSS trước khi hiển thị trong DOM không (đặc biệt vì chat đã chuyển sang DOM overlay để fix Unicode)?
```

### 1.2. Xác nhận Database production
```
Xác nhận: khi deploy production, DATABASE_URL trỏ đúng tới PostgreSQL thật (không fallback về JSON file).
JSON file fallback chỉ nên dùng cho môi trường dev local, vì ghi file đồng thời từ nhiều user
có thể gây race condition dù đã có atomic write.
```

### 1.3. Lưu trạng thái cá nhân hóa
```
Kiểm tra: lựa chọn Wardrobe (màu hoodie, tóc, phụ kiện) và Inventory (vật phẩm đã trang bị)
có đang được lưu vào DB gắn với user_id không, hay chỉ lưu tạm trong session/state và mất khi refresh?
Nếu chưa lưu, thêm cột vào bảng users hoặc bảng riêng user_customization để lưu lại.
```

### 1.4. Onboarding cho người chơi lần đầu
```
Thêm 1 bước hướng dẫn ngắn khi người dùng vào game lần đầu tiên (có thể dùng cookie/localStorage
để chỉ hiện 1 lần): tooltip hoặc overlay giới thiệu nhanh WASD di chuyển, phím [E] tương tác,
phím [I] mở túi đồ, cách đổi phòng qua Quick Room Selector.
```

### 1.5. Deploy production
```
Deploy server game chính (hiện đang chạy localhost:3000 + 3001) lên Railway/Render/VPS,
tách biệt với landing page đã deploy (https://www.fudever.com/).
Đảm bảo CORS được cấu hình đúng giữa domain landing page và domain game nếu chúng liên kết nhau.
```

---

## 2. Định dạng Link chính xác theo từng loại vùng tương tác

### 2.1. Màn Chiếu Slide / Bài giảng (main_hall, dever_lab, library_lounge)
- **Google Slides**: KHÔNG dùng link `/edit` hoặc `/present` thông thường — sẽ bị chặn nhúng iframe.
  - Cách lấy link đúng: mở Slides → `File > Share > Publish to web` → chọn tab "Embed" → copy link dạng:
    `https://docs.google.com/presentation/d/e/2PACX-xxxxx/embed?start=false&loop=false&delayms=3000`
- **PDF tài liệu**: dùng Google Drive preview link:
  `https://drive.google.com/file/d/FILE_ID/preview`
  (File cần để chế độ chia sẻ "Anyone with the link can view")

### 2.2. Phòng họp Video Call (meeting_stage)
- Google Meet: dùng link phòng cố định (Meet cho phép tạo "Nickname" cố định qua Google Workspace nếu có, hoặc dùng link tạo mới mỗi lần cho phiên họp).
- Jitsi Meet (khuyến nghị cho phòng cố định miễn phí): `https://meet.jit.si/TenPhongCLBCuaBan` — chỉ cần đặt tên phòng cố định, không cần tài khoản, ai có link đều vào được ngay.
- Can tim hieu xem thu ung dung nao mien phi va khong mat nhieu thoi gian de cai dat cung nhu ho tro tieng anh nhu gg meet thoi, hoac tu dong tao link khi vao

### 2.3. Bảng trắng / Sơ đồ kiến trúc (whiteboard)
- Excalidraw: mặc định `https://excalidraw.com` (mỗi phiên tạo link riêng nếu muốn lưu — dùng tính năng "Live collaboration" để lấy link phòng cố định, hoặc dùng Excalidraw+ nếu cần lưu trữ lâu dài).
- Miro: cần tài khoản, lấy link board cụ thể dạng `https://miro.com/app/board/xxxxx/`.

### 2.4. Form đăng ký / Google Form
- Dùng thẳng link chia sẻ bình thường (KHÔNG cần bản `/embed`), ví dụ: `https://docs.google.com/forms/d/xxxxx/viewform`
- Nếu muốn nhúng trực tiếp trong iframe thay vì mở tab mới: lấy link `/viewform?embedded=true`
- Form dang ky thanh vien: https://forms.gle/2us1yB5Qp2HYejj28

### 2.5. Mạng xã hội (Facebook, TikTok, GitHub)
- Hầu hết các nền tảng này **chặn nhúng iframe** (X-Frame-Options: DENY) — chỉ nên dùng nút "Mở trong tab mới" trỏ thẳng tới link trang, không cố nhúng iframe.
- Fanpage Dever: https://www.facebook.com/FPTUDever
- Fanpage FUDA:  https://www.facebook.com/daihocfptdanang
- Kenh Tiktok FUDA: https://www.tiktok.com/@daihocfptdanang
### 2.6. YouTube Lofi/Nhạc
- Đã có Smart Loader tự nhận diện — chỉ cần dán link bất kỳ dạng nào (thường, `youtu.be`, `shorts`), không cần xử lý gì thêm.
- Ban tu dong kiem mot vai playlist nhac tre hien nay de dan vao
---

## 3. Logic Minigame Khu Thể Thao (Sports Complex)

**Nguyên tắc chung**: dùng cơ chế arcade timing-based, không làm vật lý bóng thật — đơn giản để code, đủ vui để trải nghiệm.

### 3.1. Sút phạt đền (bóng đá)
```
Cơ chế:
1. Hiện thanh lực (power bar) chạy qua lại liên tục trên UI.
2. Người chơi nhấn phím lần 1 để chọn hướng sút (trái/giữa/phải, dùng phím mũi tên hoặc A/D + Space).
3. Nhấn phím lần 2 (thời điểm trên thanh lực) để xác định lực sút.
4. Thủ môn AI chọn hướng cản ngẫu nhiên, có % lệch theo độ khó tăng dần sau mỗi lần ghi bàn liên tiếp (streak).
5. Hiển thị kết quả (Vào/Bị cản) bằng animation đơn giản, lưu streak cao nhất vào DB theo user_id.
Trạng thái lưu: bảng game_scores(user_id, game_type='penalty', high_score, updated_at)
```

### 3.2. Ném bóng rổ 3 điểm
```
Cơ chế tương tự: thanh lực + thời điểm nhấn quyết định độ chính xác quỹ đạo.
Tính % ném trúng qua N lượt (ví dụ 10 lượt/phiên), hiển thị kết quả cuối phiên,
lưu high_score (số lần trúng nhiều nhất trong 1 phiên) vào cùng bảng game_scores với game_type='basketball'.
```

### 3.3. Cầu lông / Bóng chuyền / Hồ bơi
```
Không cần minigame phức tạp — giữ làm không gian trang trí + điểm tụ họp xã hội
(đứng gần nhau vẫn dùng được chat/proximity chat hiện có). Có thể để dành làm minigame
ở phiên bản sau nếu có nhu cầu thực tế, tránh đầu tư dàn trải quá sớm.
```

---

## 4. Thứ tự đề xuất thực hiện tiếp theo
1. Bảo mật (mục 1.1) — bắt buộc trước khi có người ngoài CLB vào thật
2. Xác nhận DB production + lưu customization (mục 1.2, 1.3)
3. Điền link thật vào các vùng tương tác theo hướng dẫn định dạng ở mục 2 (đã có sẵn danh sách bạn tự soạn)
4. Logic minigame Sút phạt đền + Ném bóng rổ theo mục 3 (Cầu lông/bóng chuyền/hồ bơi để trang trí, không minigame)
5. Onboarding (mục 1.4)
6. Deploy production (mục 1.5)

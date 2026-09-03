# Plan: Thế giới Pixel 2D cho CLB / Trường (kiểu Gather.town)
### Phiên bản: Solo builder + AI coding tools (Claude Code)

## 0. Bối cảnh & giả định
- Người thực hiện: nền tảng AI/kỹ thuật tốt, nhưng chưa biết code truyền thống (web/game dev).
- Cách làm: xây một mình, dùng **Claude Code** làm người viết/chạy/sửa code; bạn đóng vai trò product owner + reviewer.
- Quy mô mục tiêu dài hạn: vài trăm người dùng đồng thời, nhiều CLB.
- Chiến lược: **tự xây từ đầu với kiến trúc đơn giản** (không fork WorkAdventure ngay — codebase đó quá lớn để debug an toàn khi bạn chưa đọc hiểu code). Có thể tham khảo WorkAdventure sau này khi cần tính năng nâng cao.

---

## 1. Vai trò của bạn khi làm việc với Claude Code

Vì bạn không tự viết code, hiệu quả của dự án phụ thuộc vào cách bạn **giao việc và review**, không phải vào việc bạn gõ bao nhiêu dòng. Quy trình lặp lại mỗi bước:

1. **Mô tả tính năng cụ thể** — càng chi tiết càng tốt (bạn đã làm tốt điều này). Ví dụ: "Tạo map 20x15 ô, người chơi đi bằng phím mũi tên, không đi xuyên tường."
2. **Để Claude Code viết + tự chạy thử** (nó có thể chạy server, mở trình duyệt kiểm tra).
3. **Bạn tự tay chạy lại và thử nghiệm** — đây là bước quan trọng nhất bạn không thể bỏ qua, vì bạn là người biết "đúng ý" hay chưa, AI không biết.
4. **Phản hồi cụ thể** — "nhân vật đi xuyên tường ở góc trên bên trái" tốt hơn nhiều so với "chưa đúng".
5. **Yêu cầu giải thích khi cần** — hỏi "đoạn code này làm gì" để tích lũy hiểu biết dần, không cần hiểu hết nhưng đủ để không bị phụ thuộc hoàn toàn.
6. **Commit từng bước nhỏ (git)** — để có thể quay lại nếu bước sau làm hỏng bước trước. Nhờ Claude Code tạo git repo và commit sau mỗi tính năng chạy ổn.

---

## 2. Kiến trúc đơn giản hóa (dễ debug một mình)

| Lớp | Công nghệ | Lý do chọn |
|---|---|---|
| Client render | **Phaser 3** (JavaScript) | Chuẩn ngành cho game 2D top-down trên web, tài liệu/ví dụ nhiều để AI tham chiếu |
| Map | **Tiled Map Editor** → export JSON | Công cụ GUI kéo-thả, không cần code để thiết kế map |
| Realtime sync | **Node.js + Socket.io** | 1 server duy nhất, không tách microservices — dễ debug khi có lỗi |
| Database | **PostgreSQL** | Lưu user, club, room, lịch sử |
| Auth | JWT + email/password (giai đoạn đầu) | Đơn giản, chưa cần SSO vội |
| Video call | Nhúng link Google Meet/Jitsi có sẵn (giai đoạn đầu) | Tránh tự làm WebRTC — phần khó nhất, để dành sau |
| Hosting | 1 VPS hoặc Railway/Render | Không cần Kubernetes ở quy mô vài trăm người |

**Nguyên tắc**: không tối ưu/scale sớm cho vấn đề chưa xảy ra. Redis, microservices, Kubernetes chỉ thêm khi đã có bằng chứng thực tế là cần (ví dụ server thật sự bị nghẽn).

---

## 3. Database — thiết kế sơ bộ

```
users
  id, email, password_hash, display_name, avatar_id, role (student/staff/admin), created_at

clubs
  id, name, description, map_id, owner_id

club_members
  club_id, user_id, role (member/leader), joined_at

rooms
  id, club_id (nullable nếu là room chung), name, map_json_url, capacity

sessions
  id, user_id, room_id, joined_at, left_at

events
  id, room_id, title, start_time, end_time, host_id
```

---

## 4. Roadmap các bước đầu tiên (mỗi bước = 1 lần giao việc cho Claude Code)

### Bước 1 — Khởi tạo project & nhân vật di chuyển trên map tĩnh
**Mục tiêu**: mở trình duyệt thấy 1 map pixel, điều khiển 1 nhân vật đi lại, không xuyên tường.

Prompt gợi ý để đưa cho Claude Code:
```
Tạo một project game 2D top-down bằng Phaser 3 + Vite (JavaScript, không cần TypeScript).
Yêu cầu:
- 1 map tilemap đơn giản 20x15 ô (dùng tileset free có sẵn, hoặc tạo placeholder màu để test trước, tôi sẽ thay ảnh thật sau)
- 1 nhân vật điều khiển bằng phím mũi tên (WASD cũng được), di chuyển 4 hướng, có animation đi bộ đơn giản
- Có va chạm với tường/vật cản trên map, không đi xuyên qua được
- Camera follow theo nhân vật
- Set up sẵn cấu trúc thư mục rõ ràng để sau này thêm multiplayer
Sau khi tạo xong, chạy dev server và cho tôi biết lệnh để tôi tự mở trình duyệt kiểm tra.
```

### Bước 2 — Multiplayer cơ bản (nhiều người thấy nhau)
**Mục tiêu**: 2 tab trình duyệt mở cùng lúc, thấy 2 nhân vật, mỗi tab điều khiển 1 nhân vật, di chuyển realtime đồng bộ cho nhau thấy.

Prompt gợi ý:
```
Thêm backend Node.js + Socket.io vào project để đồng bộ vị trí nhân vật realtime giữa nhiều người chơi.
Yêu cầu:
- Khi 1 client di chuyển, các client khác thấy nhân vật đó di chuyển gần như tức thời
- Khi 1 người ngắt kết nối, nhân vật của họ biến mất khỏi màn hình người khác
- Mỗi người chơi có tên hiển thị phía trên đầu nhân vật (tạm thời cho nhập tên khi vào, chưa cần đăng nhập)
Giải thích ngắn gọn cách Socket.io đồng bộ vị trí hoạt động để tôi hiểu luồng dữ liệu.
```

### Bước 3 — Đăng nhập & Database
**Mục tiêu**: có tài khoản, lưu thông tin user vào PostgreSQL.

Prompt gợi ý:
```
Thêm hệ thống đăng ký/đăng nhập bằng email + mật khẩu (JWT), lưu user vào PostgreSQL theo schema:
users(id, email, password_hash, display_name, avatar_id, role, created_at)
Sau khi đăng nhập, tên và avatar của user hiển thị đúng trong game thay vì nhập tay.
```

### Bước 4 — Club & Room
**Mục tiêu**: có nhiều "phòng" (map) khác nhau cho từng CLB, người chơi chọn vào phòng nào.

### Bước 5 — Khu vực tương tác (bàn học, sân khấu bài giảng)
**Mục tiêu**: đứng vào 1 vùng đặc biệt trên map thì hiện iframe (Google Slides/Meet/YouTube nhúng).

### Bước 6 — Deploy thử nghiệm
**Mục tiêu**: đưa lên Railway/Render để bạn bè trong CLB test thật, thu thập phản hồi trước khi làm tiếp.

---

## 5. Tài nguyên tham khảo
- Phaser 3 examples: https://phaser.io/examples
- Socket.io docs: https://socket.io/docs/v4/
- Tiled Map Editor: https://doc.mapeditor.org/
- (Tham khảo sau này khi cần tính năng nâng cao) WorkAdventure: https://github.com/thecodingmachine/workadventure

# DEVER TOWN - MANDATORY PROJECT RULES & GUIDELINES

## 1. Zero-Regression & Scope Isolation (Quy Tắc Cô Lập Thay Đổi)
- Khi phát triển tính năng mới hoặc sửa lỗi, **CHỈ CHỈNH SỬA ĐÚNG VÙNG MỤC TIÊU**.
- Tuyệt đối không làm thay đổi các map layout, collider, spawn points hoặc logic các phòng khác đang hoạt động tốt.
- Mọi thay đổi map / config phải kiểm tra tính tương thích trên toàn bộ 7 phòng.

## 2. Multi-Agent Delegation Workflow (Quy Trình Sub-Agents)
- Với mỗi yêu cầu phức tạp, phân chia các Sub-Agents theo vai trò:
  1. `Research & Risk Analyst`: Phân tích rủi ro và vị trí code cần sửa.
  2. `Specialist Implementation`: Thực hiện code cô lập.
  3. `QA Verifier`: Chạy kiểm thử tự động `npm run build` và test suite.

## 3. Map & Portal Safety (An Toàn Điểm Spawn & Cổng Dịch Chuyển)
- Mọi điểm `spawnPoint` và `targetSpawn` phải nằm trên ô sàn đi lại an toàn (Open Floor Tile), cách xa cổng teleport và tường tối thiểu 2 ô (>= 64px).
- Tuyệt đối không spawn đè lên portal tile `10`.
- WorldScene phải duy trì teleport cooldown >= 1.5s để chống vòng lặp kẹt cổng.

## 4. Git Commit Author Rule
- Mọi commit git bắt buộc phải chỉ định author:
  `--author="RaH11 <hungnguyen.190206@gmail.com>"`

## 5. Anti-AI-Slop & Impeccable UI Rule (Chống Lạm Dụng Emoji & Văn Phong AI Slop)
- Tuyệt đối không lạm dụng emoji tràn lan ở tiêu đề, nút bấm (CTA), thông báo hệ thống hoặc nội dung email.
- Emoji chỉ được dùng có chọn lọc ở những nơi thực sự cần biểu thị trực quan (như icon vật phẩm túi đồ, avatar, danh sách phòng).
- Mọi nút bấm, thông báo lỗi/thành công và email bảo mật phải dùng văn phong tinh gọn, trang nhã, chuẩn mực kỹ thuật và chuyên nghiệp.

---
name: dever-vision-and-map-inspector
description: >-
  Quy trình kiểm toán thị giác tự động (Vision QA), phát hiện lỗi tràn text, chồng lấn nhãn, kẹp biên canvas
  và kiểm tra hoạt ảnh chuyển động trên 9 bản đồ DEVER TOWN.
---

# DEVER TOWN - Vision & Map Inspection Protocol

Quy trình chuẩn hóa dành cho AI Agent và nhà phát triển nhằm tự động hóa việc kiểm tra thị giác, phát hiện sớm các lỗi đồ họa, chồng chéo văn bản và tràn khung trên toàn bộ các bản đồ của DEVER TOWN.

---

## 1. Mục Tiêu & Tiêu Chuẩn Thị Giác Bắt Buộc

Mọi bản đồ và thành phần giao diện khi được thêm mới hoặc chỉnh sửa phải đáp ứng các tiêu chuẩn sau:

1. **Không Tràn Text (Zero Horizontal Overflow)**:
   - Tất cả các container văn bản phải thỏa mãn `scrollWidth <= clientWidth`.
   - Các nhãn trong dropdown (`<select id="room-selector">`) phải ngắn gọn, không bị cắt dấu ba chấm `...`.
2. **An Toàn Biên Màn Hình (Canvas Boundary Clamping)**:
   - Các nhãn cổng (portals) và nhãn khu vực (zones) không được vượt ra ngoài khung nhìn 800x608.
   - Luôn sử dụng hàm kẹp: `Phaser.Math.Clamp(posX, 60, cols * tileSize - 60)` và `Phaser.Math.Clamp(posY, 20, rows * tileSize - 20)`.
3. **Chống Va Chạm Nhãn Cổng Liền Kề (Merged Adjacent Portal Labels)**:
   - Khi hai hoặc nhiều ô cổng liền kề (khoảng cách <= 1.5 tile) cùng dẫn đến một phòng đích, thuật toán phải tự động gộp thành **1 nhãn duy nhất** đặt tại vị trí trung bình giữa các cổng.
4. **Loại Bỏ Hiện Tượng Bóng Ma Đè Chữ (Ghost Double Text Prevention)**:
   - Khi người chơi bước vào vùng kích hoạt tương tác, nhãn hiển thị cố định của zone phải được ẩn tạm thời hoặc đồng bộ liền mạch với `#interaction-prompt`.
   - Không để 2 khối văn bản có nội dung tương tự nhau hiển thị đè lên nhau lệch vài pixel.
5. **Cách Ly Tên Người Chơi (Name Tag Protection)**:
   - Khung tương tác (`#interaction-prompt`) phải có khoảng cách an toàn với tên người chơi (cách >= 48px phía trên đầu nhân vật hoặc neo trực tiếp tại tâm vật thể).

---

## 2. Kịch Bản Kiểm Toán Tự Động (Automated Vision Crawler)

Hệ thống cung cấp script Playwright chuyên dụng để thu thập toàn bộ ảnh chụp màn hình 9 phòng và 11 loại modal:

```bash
# Chạy crawler kiểm toán toàn bộ phòng và chuyển động 4 hướng:
node scripts/inspect_all_maps_vision.js
```

### Cấu trúc kết quả được lưu tại thư mục `vision_audit/`:
- `{roomId}_01_overview.png`: Ảnh tổng quan ngay khi vào phòng.
- `{roomId}_02_move_up.png`: Ảnh khi nhấn giữ phím W (di chuyển lên).
- `{roomId}_03_move_right.png`: Ảnh khi nhấn giữ phím D (di chuyển phải).
- `{roomId}_04_move_down.png`: Ảnh khi nhấn giữ phím S (di chuyển xuống).
- `{roomId}_05_move_left.png`: Ảnh khi nhấn giữ phím A (di chuyển trái).
- `modal_{type}.png`: Ảnh chụp các modal khi mở (whiteboard, code_editor, campus_map, etc.).
- `audit_report.json`: Bản ghi chi tiết các metrics DOM và danh sách ảnh.

---

## 3. Checklist Giám Định Thị Giác Đa Giác Quan (Vision Agent Checklist)

Trước khi xác nhận hoàn tất bất kỳ tính năng map hoặc UI nào, Agent phải dùng `view_file` để kiểm tra trực quan các ảnh đã chụp:

- [ ] **Sảnh Alpha (`main_hall`)**: Kiểm tra cụm tượng Cóc Vàng, cổng đôi xuống Căn Tin chỉ hiện 1 nhãn duy nhất `"Sang Căn Tin & Cafe"`.
- [ ] **Tech Lab (`dever_lab`)**: Bàn Hackathon và bảng sơ đồ kiến trúc hiển thị rõ ràng, không bị che bởi thanh chat.
- [ ] **Thư Viện (`library_lounge`)**: Cổng đôi về Sảnh Chính không bị đè chữ; các bàn tự học có khoảng trống di chuyển an toàn.
- [ ] **Phòng Kỷ Niệm (`memory_room`)**: Cổng bên mép phải không bị cắt chữ; khung tranh kỷ niệm hiển thị trọn vẹn.
- [ ] **Media Hub (`media_hub`)**: Màn hình LED và cổng teleport biên phải không bị tràn ra ngoài biên canvas.
- [ ] **Khu Thể Thao (`sports_complex`)**: Nhãn zone hàng trên cùng (`Sút Phạt Đền`, `Ném Bóng Rổ`) không chạm mép trên màn hình; mặt nước hồ bơi có gợn sóng lấp lánh mềm mại, không có vạch kẻ đường cam.
- [ ] **Căn Tin (`canteen_cafe`)**: Quầy thức ăn và bàn thảo luận không bị vòng tròn tương tác che lấp món ăn.
- [ ] **Arcade & Robot (`game_arcade`)**: Đấu trường game và showcase robot có lối đi thông thoáng.
- [ ] **Modal Campus Map**: Toàn bộ danh mục 9 phân khu campus FPTU Đà Nẵng hiển thị đầy đủ, có thanh cuộn mượt mà.

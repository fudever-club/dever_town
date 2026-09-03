---
name: dever-arcade-and-gamification
description: >-
  Chuẩn thiết kế và kỹ thuật phát triển Gamification, Minigames siêu tốc, Radar HUD,
  hệ thống Biểu cảm tương tác đa người chơi (Emotes/Dance) và âm thanh tổng hợp Chiptune 8-Bit Web Audio API cho DEVER TOWN.
---

# DEVER TOWN Arcade, Gamification & Juicy Gameplay Standards

## 1. Triết Lý Thiết Kế Trò Chơi (Game Feel & Fun-First)
- **Mục tiêu cốt lõi**: Tạo ra trải nghiệm vui chơi sống động, kết nối và hào hứng cho sinh viên/thành viên CLB, tránh biến game thành nơi "show-off" nặng nề hay nhàm chán.
- **Nhịp độ nhanh (High Pacing)**:
  - Minigame đố vui (Speed Code Duel): 10 giây/câu, phép tính nhẩm nhanh, Python snippet 1 dòng thú vị, bẫy logic hài hước của giới lập trình.
  - Phản hồi tức thì: Điểm số hiển thị lập tức, combo streak nhân điểm (x1.5, x2, x3), hiệu ứng âm thanh kích thích.
- **Anti-AI-Slop & Impeccable Aesthetics**:
  - Giao diện Glassmorphism cao cấp, dark mode sang trọng (`#0f172a`, `#1e293b`), viền neon mềm mại (`#38bdf8`, `#c084fc`, `#f26f21`).
  - Không lạm dụng emoji tràn lan; chỉ dùng emoji có chủ đích cho reaction hoặc biểu tượng đại diện.

## 2. Hệ Thống Radar HUD / Minimap Overlay
- **Tọa độ & Tỷ lệ hiển thị**:
  - Kích thước canvas chuẩn: 150x114px đại diện cho bản đồ 25x19 ô (mỗi ô tương đương 6x6px).
  - Tọa độ người chơi được chuẩn hóa: `(player.x / 800) * canvasWidth`, `(player.y / 608) * canvasHeight`.
  - Hiệu ứng Radar Pulse: Chấm người chơi phát xung ánh sáng tuần hoàn `pulseRadius = 3.5 + sin(time) * 1.5` để tăng tính định vị.
- **Tiện ích người dùng**:
  - Hỗ trợ phím tắt `M` và nút bấm trực quan để thu nhỏ / mở rộng không che khuất tầm nhìn.

## 3. Realtime Emote & Animation Sync (Biểu Cảm & Nhảy Múa)
- **Danh mục 6 biểu cảm chuẩn**:
  - `wave` (Vẫy chào 👋), `heart` (Thả tim ❤️), `fire` (Cháy quá 🔥), `clap` (Vỗ tay 👏), `dance` (Nhảy múa 🕺), `question` (Thắc mắc ❓).
- **Quy chuẩn hiển thị hoạt ảnh**:
  - Bong bóng biểu cảm xuất hiện phía trên đỉnh đầu nhân vật (`y - 48px`), trôi bồng bềnh lên cao (`y - 68px`) và mờ dần trong 2.6s.
  - Khi chọn `dance`: Kích hoạt tween lắc hông / nghiêng góc (`angle: -8 to 8`) và nảy nhẹ (`y - 6px`) trong 6 nhịp liên tiếp.
- **Giao thức Socket.io**:
  - Client gửi: `socket.emit('playerEmote', { emoteId })`.
  - Server xác thực trong danh sách hợp lệ và broadcast trong cùng phòng: `io.to(player.roomId).emit('playerEmote', { id: socket.id, emoteId })`.

## 4. Procedural Chiptune Web Audio Synth (Âm Thanh Trò Chơi Không Cần File Ngoài)
- Sử dụng trực tiếp `AudioContext` của trình duyệt, không tốn băng thông tải asset mp3:
  - **BGM 8-Bit Vui Nhộn**: Lặp chu kỳ các nốt vui tươi (C5, E5, G5, B5, A5, G5, E5, D5) với bộ lọc Lowpass ấm áp (`Q: 3`, `cutoff: 900Hz`).
  - **Chime Đúng (Rising Arpeggio)**: Tần số tăng dần theo chuỗi combo `streak` (523Hz -> 659Hz -> 784Hz -> 1046Hz).
  - **Boop Sai (Comic Bass Drop)**: Tần số tụt nhanh từ 220Hz xuống 70Hz tạo cảm giác hoạt hình hài hước.
  - **Autoplay Handling**: Tự động mở khóa `AudioContext` sau cử chỉ người dùng đầu tiên (`pointerdown`, `keydown`).

## 5. Quy Chuẩn Tác Giả & Git Commit
Mọi commit trên repository bắt buộc chỉ định author hợp lệ:
`git commit -m "<message>" --author="qnhat1504 <dangquangnhat1504@gmail.com>"`
hoặc `--author="RaH11 <hungnguyen.190206@gmail.com>"`.

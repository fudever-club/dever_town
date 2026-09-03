---
name: dever-town-engineering
description: >-
  Kỹ thuật phát triển, bảo trì và mở rộng hệ thống DEVER TOWN (Phaser 3 + Socket.io + Web Audio + i18n).
  Bắt buộc tuân thủ quy tắc Zero-Regression (cách ly phạm vi thay đổi), quy trình Multi-Agent Subagent Delegation,
  an toàn Map Grid/Physics/Spawn Point và chuẩn Git Commit Author.
---

# DEVER TOWN Engineering & Zero-Regression Standards

## 1. Nguyên Tắc Cốt Lõi: Zero-Regression & Scope Isolation
- **Chỉ sửa đúng phạm vi yêu cầu**: Khi sửa một bug hoặc thêm tính năng mới, KHÔNG BAO GIỜ được thay đổi cấu trúc, map layout, spawn point, colliders hoặc dữ liệu của các phòng / tính năng đang chạy ổn định.
- **Bảo toàn dữ liệu cũ**: Mọi cấu hình mở rộng (Wardrobe, Items, Maps, Portals) phải duy trì tính tương thích ngược (Backward Compatibility).

## 2. Quy Trình Phân Chia Sub-Agents (Multi-Agent Protocol)
Khi nhận một nhiệm vụ phức tạp từ người dùng, luôn phân rã nhiệm vụ và phối hợp các Sub-Agents chuyên trách:
1. **Research & Risk Analyst**: Khảo sát codebase, phân tích rủi ro kỹ thuật, kiểm tra tác động đến các module hiện có.
2. **Specialist Implementer**: Triển khai code theo đúng phạm vi cô lập (Scope Isolation).
3. **QA Verifier & Bug Hunter**: Chạy test suite, kiểm tra tính toàn vẹn của tất cả 7 phòng, build kiểm tra và rà soát console/network.

## 3. Bản Đồ, Vật Lý & Điểm Spawn An Toàn (Map Grid Safety)
- **Kích thước Map**: 25 cột x 19 dòng (Tile 32x32 = 800x608 px).
- **Spawn Point & Portal Target Spawn**:
  - BẮT BUỘC đặt trên ô sàn đi lại an toàn (Open Floor Tile), cách xa tối thiểu 2 ô (>= 64px) so với tường và cổng teleport.
  - TUYỆT ĐỐI KHÔNG spawn đè lên Portal Tile hoặc collider vật cản.
- **Portal Teleport Cooldown**: Phải có thời gian chờ (Grace Period / Cooldown >= 1.5s) khi vừa vào phòng để tránh loop teleport.

## 4. Hệ Thống Âm Thanh & Đa Ngữ (Audio & i18n)
- Âm thanh: Sử dụng Web Audio API synthesizer nhẹ, không phụ thuộc file ngoài, có master mute và lưu LocalStorage.
- Đa ngữ: Hỗ trợ chuyển đổi Tiếng Việt 🇻🇳 và English 🇬🇧 tức thì trên toàn bộ UI và HUD.

## 5. Quy Chuẩn Git Commit
- Mọi commit bắt buộc phải có cờ author của người dùng:
  `git commit -m "<message>" --author="RaH11 <hungnguyen.190206@gmail.com>"`

## 6. Anti-AI-Slop & Impeccable UI Rule
- Không lạm dụng emoji tràn lan trên các nút bấm, thông báo và email hệ thống.
- Văn phong tinh gọn, trang nhã, chuyên nghiệp, thể hiện đẳng cấp sản phẩm của CLB Lập trình.

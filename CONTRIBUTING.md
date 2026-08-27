# Contributing to DEVER TOWN

Cảm ơn bạn đã quan tâm đóng góp cho **DEVER TOWN**! 🎮  
Dưới đây là hướng dẫn để mọi thứ diễn ra suôn sẻ và nhất quán.

---

## 📋 Trước Khi Bắt Đầu

1. Đọc kỹ [`README.md`](./README.md) để hiểu dự án
2. Đọc [`AGENTS.md`](./AGENTS.md) để nắm quy tắc **Zero-Regression** — bắt buộc tuân thủ khi sửa map, portal, spawn points
3. Đọc [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) để hiểu tiêu chuẩn ứng xử

---

## 🚀 Quy Trình Đóng Góp

### 1. Fork & Clone

```bash
git fork https://github.com/huanight19RaH/DEVER_TOWN.git
git clone https://github.com/<your-username>/DEVER_TOWN.git
cd DEVER_TOWN
npm install
```

### 2. Tạo Branch Mới

```bash
# Tính năng mới
git checkout -b feat/ten-tinh-nang

# Sửa lỗi
git checkout -b fix/mo-ta-loi

# Cải thiện hiệu năng
git checkout -b perf/ten-phan
```

### 3. Quy Tắc Commit (Conventional Commits)

```
feat:  thêm tính năng mới
fix:   sửa lỗi
perf:  cải thiện hiệu năng
docs:  cập nhật tài liệu
style: thay đổi CSS/UI không ảnh hưởng logic
refactor: tái cấu trúc code
test:  thêm/sửa test
chore: thay đổi build, deps, config
```

Ví dụ:
```bash
git commit -m "feat: add room selector dropdown in header nav"
git commit -m "fix: resolve portal loop in lab_room spawn"
```

### 4. Kiểm Tra Trước Khi Tạo PR

```bash
# Chạy test tự động
node .agent_system/test-addon-v3.js

# Build production (phải 0 lỗi)
npm run build
```

### 5. Mở Pull Request

- Đặt tiêu đề PR theo convention: `feat: ...` hoặc `fix: ...`
- Mô tả rõ những gì đã thay đổi và lý do
- Đính kèm screenshot nếu thay đổi UI
- Chỉ thay đổi đúng phạm vi mục tiêu, không làm ảnh hưởng các phòng/module khác

---

## 🗺️ Những Gì Cần Ưu Tiên

Bạn có thể tham khảo danh sách tính năng còn thiếu tại **Issues** của repo.

Một số hướng đóng góp hữu ích:
- 🌏 Thêm ngôn ngữ mới (i18n) cho i18n.js
- 🎨 Thiết kế thêm bộ trang phục / phụ kiện cho Wardrobe
- 🗺️ Tạo phòng mới (tuân thủ quy tắc Zero-Regression với 8 phòng hiện có)
- 🐛 Báo cáo và sửa lỗi

---

## ❓ Hỏi & Liên Hệ

- **Email CLB:** `club.dever@gmail.com`
- **Fanpage:** [facebook.com/FPTUDever](https://www.facebook.com/FPTUDever)
- **Issues:** [github.com/huanight19RaH/DEVER_TOWN/issues](https://github.com/huanight19RaH/DEVER_TOWN/issues)

---

**FU-DEVER Club · WORK HARD - PLAY HARD** 🚀

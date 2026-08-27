# 📦 CONTENT PACK v1 — DEVER TOWN
### Nội dung thật từ tài liệu CLB (Quy chế, Logo, Bản đồ, Menu, Link hệ thống)

---

## 1. Bộ nhận diện thương hiệu (Brand Assets)

| File | Mục đích sử dụng |
|---|---|
| `dever_logo_blue.png` | Logo chính FU-DEVER (nền sáng) |
| `dever_logo_white.png` | Logo trắng — CHỈ dùng trên nền tối (navy/đen), trong suốt trên nền trắng |
| `dever_logo_nontext.png` | Icon logo không chữ (dùng cho favicon, avatar nhỏ) |
| `2021-FPTU-Eng.png` | Logo FPT Education + FPT University |
| `2021-FPTU-Eng_Duong_ban-01.png` | ⚠️ Cần xác nhận lại — file hiển thị gần như trống, có thể là bản outline dùng cho mục đích khác (in ấn/khắc), không nên dùng trực tiếp cho UI web |

**Slogan chính thức**: "Work hard, Play hard" (theo logo)
**Bảng màu**: Cam FPT (theo logo FPT: cam/xanh dương/xanh lá), Navy/Xanh dương đậm (theo logo FU-DEVER), Đỏ nhấn (theo chi tiết logo FU-DEVER)

---

## 2. Thông tin chính thức CLB (trích từ Quy chế tổ chức và hoạt động)

- **Tên đầy đủ**: Câu lạc bộ Lập trình Đại học FPT — FU-DEVER (FPT University Developer)
- **Ngày thành lập**: 27/10 hằng năm (ngày kỷ niệm)
- **Trực thuộc**: Cộng đồng sinh viên trường Đại học FPT Đà Nẵng
- **Chức năng**: Nghiên cứu, Xây dựng dự án, Tổ chức sự kiện CNTT, Sinh hoạt tập thể
- **Mục đích**: Xây dựng môi trường chia sẻ - học hỏi - phát triển kiến thức lập trình, thúc đẩy sáng tạo trong CNTT/kỹ thuật phần mềm
- **Tầm nhìn**: Trở thành CLB lập trình uy tín tại FPT Đà Nẵng, nơi sinh viên phát triển qua dự án và sự kiện sáng tạo

### Cơ cấu Ban Chủ nhiệm (6 vị trí)
1. **Chủ nhiệm CLB** — lập kế hoạch tổng thể, điều hành họp, đại diện chính thức
2. **Phó chủ nhiệm CLB** — hỗ trợ quản lý, đảm bảo hoạt động đúng kế hoạch
3. **Thư ký** — quản lý tài liệu, thu giữ quỹ, quản lý tài chính
4. **Trưởng Ban học thuật** — định hướng hoạt động học thuật, tổ chức workshop/lớp học
5. **Trưởng Ban sự kiện** — tổ chức sự kiện, hậu cần
6. **Trưởng Ban truyền thông** — chiến lược truyền thông, quản lý Fanpage/website

### 3 mảng hoạt động chính
- **Học nhóm**: nhóm học tập theo chuyên ngành (Front-end, Back-end, Game...)
- **Xây dựng dự án**: Website, Mobile App, Game
- **Sinh hoạt ngoại khóa**: cắm trại, trò chơi lớn, gắn kết thành viên

### Thành viên
- Điều kiện: sinh viên FPT Đà Nẵng, đạo đức tốt, tinh thần học hỏi, có hồ sơ gia nhập
- **Lệ phí hoạt động**: 50.000 VNĐ / kỳ
- Khen thưởng: giấy khen/hiện vật cho đóng góp xuất sắc
- Kỷ luật: Nhắc nhở → Nhắc nhở trước CLB → Khiển trách → Khai trừ

---

## 3. Bản đồ Campus thật — Đề xuất mapping vào Game

Theo bản đồ chính thức FPT University Đà Nẵng (Khu đô thị công nghệ FPT, phường Hòa Hải, quận Ngũ Hành Sơn):

| # trên bản đồ thật | Tên tòa | Đề xuất vai trò trong game |
|---|---|---|
| 1 | Tòa Alpha | ⚠️ **Cần bạn xác nhận**: Sảnh chính (main_hall) — kiến trúc đặc biệt nhất, có bảng hiệu FPT UNIVERSITY |
| 2 | Tòa Gamma | Dever Lab hoặc Sảnh chính (tùy bạn chọn ở trên) |
| 3 | Tòa Beta | Thư viện (library_lounge) |
| 4/5 | KTX Dorm A/B | (Có thể làm phòng mới sau: không gian Dorm/Chill nếu muốn mở rộng) |
| 6 | Nhà võ | (Có thể gộp vào Sports Complex nếu muốn thêm bộ môn võ) |
| 7 | Nhà xe | Không cần mô phỏng (không phải không gian sinh hoạt) |
| 8 | Căn tin | canteen_cafe (đã có kế hoạch từ trước) |
| 9 | Sân bóng | sports_complex (đã có) |

**Prompt gợi ý cho Claude Code:**
```
Redesign layout các map hiện có dựa theo bố cục thật của campus FPT University Đà Nẵng
(đính kèm ảnh bản đồ + ảnh thật tòa nhà). Tòa Alpha làm Sảnh chính (main_hall) với kiến trúc
đặc trưng khối kính so le nhiều tầng. Giữ nguyên toàn bộ logic game hiện có, chỉ điều chỉnh
texture/bố cục map cho gần với thực tế hơn.
[ĐÍNH KÈM: fuda_map.webp, fuda_mau.webp]
```

---

## 4. 🆕 PHÒNG MỚI ĐỀ XUẤT: "Cổng Thông Tin Sinh Viên" (student_portal)

Gom toàn bộ link hệ thống trường vào 1 khu vực tương tác riêng, tránh sinh viên phải tự tìm — đây là tính năng có giá trị thực tế rất cao, nên ưu tiên làm sớm.

### Danh sách link (dùng nút mở tab mới, KHÔNG nhúng iframe vì đây là hệ thống có đăng nhập)

**Nhóm A — Cổng thông tin học tập:**
| Tên | Link | Mục đích |
|---|---|---|
| FAP — Cổng thông tin trường | https://fap.fpt.edu.vn/ | Cổng chính, điểm số, lịch học |
| FLM — Syllabus môn học | https://flm.fpt.edu.vn/ | Xem chương trình học, đề cương môn |
| Reset mật khẩu Wifi/EOS | https://resetdn.fpt.edu.vn/ | Đổi mật khẩu |
| LMS Đà Nẵng — Hỗ trợ IT | https://lmsdn.fpt.edu.vn/hd/ | Hướng dẫn kỹ thuật |
| LMS Đà Nẵng — Học/kiểm tra | https://lmsdn.fpt.edu.vn/ | Một số môn giáo viên yêu cầu học qua đây |
| E360 — Checkout sau thi | https://e360.fpt.edu.vn/ | Xác nhận sau khi thi xong |

**Nhóm B — Tải phần mềm thi:**
| Tên | Link | Dùng cho |
|---|---|---|
| SEB | https://drive.google.com/drive/u/0/folders/1RmjeKAvef6BXg_qlAl6JnZx2ZkY3qj_3 | Progress Test (điểm thành phần) |
| EOS | https://lmsdn.fpt.edu.vn/hd/eos/ | Final Exam (thi cuối môn) |
| PEA | https://lmsdn.fpt.edu.vn/hd/pea/ | Practical Exam (thi thực hành) |

**Prompt gợi ý cho Claude Code:**
```
Thêm 1 Proximity Zone mới "student_portal" trong phòng [chọn phòng phù hợp, ví dụ Sảnh chính],
mở modal hiển thị 2 nhóm link: "Cổng thông tin học tập" và "Tải phần mềm thi",
mỗi link là 1 nút bấm mở tab mới (KHÔNG dùng iframe vì đây là hệ thống yêu cầu đăng nhập
riêng của trường, nhúng iframe sẽ không hoạt động và có thể vi phạm bảo mật).
Danh sách link:
[dán bảng link ở trên]
```

---

## 5. Menu Căn tin — Lưu ý quan trọng

3 menu đính kèm (Cần tin Hương Vị Việt, The High Deli, F.C Canteen) đều ghi theo tuần cụ thể (10/10–14/10) → **sẽ lỗi thời nhanh nếu hardcode**.

**Đề xuất 2 hướng, bạn chọn 1:**
- **Hướng nhanh**: hiển thị làm "Menu mẫu tham khảo" trong modal Căn tin, không ghi ngày cụ thể, kèm dòng chú thích "Menu có thể thay đổi theo tuần, cập nhật tại căn tin thật"
- **Hướng bền vững hơn**: lưu menu vào database (bảng `canteen_menu`), có trang admin đơn giản để người phụ trách CLB tự cập nhật theo tuần mà không cần sửa code — phù hợp nếu có người duy trì lâu dài

---

## 6. ✅ Checklist còn thiếu — cần bạn bổ sung
- [ ] Xác nhận file `2021-FPTU-Eng_Duong_ban-01.png` có đúng ý muốn không (hiện hiển thị gần trống)
- [ ] Quyết định: Tòa Alpha hay Gamma làm Sảnh chính
- [ ] Ảnh/thông tin thật cho Phòng Triển lãm Kỷ niệm (giải thưởng, năm, tên đội) — vẫn chưa có
- [ ] Link website CLB thật (đã có landing page `fu-dever-landingpage-v2.vercel.app`, `dever-client-sigma.vercel.app`, `dever-admin-three.vercel.app`, GitHub `github.com/fudever-club` từ báo cáo trước — xác nhận các link này vẫn đúng/còn hoạt động)
- [ ] Chọn hướng xử lý Menu Căn tin (mục 5)
- [ ] Ảnh tham chiếu thật (nếu có) cho nội thất phòng CLB thật, để mô phỏng pixel art chi tiết hơn

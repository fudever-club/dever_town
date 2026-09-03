# 📘 PLAN ADD-ON v2 — DEVER TOWN
### Bổ sung sau khi hoàn thành 5 bước cốt lõi (dựa trên TIEN_TRINH_DU_AN.md)

---

## 0. Đánh giá nhanh so với plan gốc

| Hạng mục plan gốc | Trạng thái | Ghi chú |
|---|---|---|
| Phaser + multiplayer + auth + multi-room + interactive zones | ✅ Hoàn thành, vượt kỳ vọng | Chi tiết kỹ thuật tốt (Lerp, Hysteresis, Depth sorting) |
| Bảng `clubs`, `club_members`, `rooms`, `events` (data-driven) | ⚠️ Cần xác nhận | Hiện tại 3 phòng có vẻ hardcode trong code, không phải load từ DB. Nếu đúng vậy, **nên refactor sang data-driven trước khi thêm phòng mới** để scale tốt hơn (thêm phòng = thêm dữ liệu, không cần sửa code) |
| Deploy thử nghiệm (Railway/Render) | ❓ Chưa thấy đề cập | Cần làm trước khi mời người ngoài test |

**Khuyến nghị**: Trước khi làm các bước dưới đây, nên hỏi Claude Code xác nhận kiến trúc phòng hiện tại có phải hardcode không — nếu có, cân nhắc refactor sang bảng `rooms` trong DB trước khi thêm 2 phòng mới, để tránh nợ kỹ thuật chồng chất.

---

## 1. 🐛 BƯỚC 6A: Sửa lỗi Chat (Unicode / Encoding)

**Vấn đề**: Chat tiếng Việt lỗi, chat tiếng Anh cũng lỗi → nghi vấn không phải lỗi font mà lỗi tầng truyền/xử lý dữ liệu.

**Prompt gợi ý đưa cho Claude Code (chẩn đoán trước khi sửa):**
```
Chat trong game hiện đang bị lỗi hiển thị cả với tiếng Việt lẫn tiếng Anh. Hãy kiểm tra và chẩn đoán theo thứ tự:
1. Kiểm tra Content-Type / charset trong Express server có set 'application/json; charset=utf-8' đầy đủ không.
2. Kiểm tra Socket.io payload có bị escape/sanitize sai cách (cắt byte giữa ký tự multi-byte) không.
3. Kiểm tra hàm hiển thị Speech Bubble và Chat box: đang dùng Phaser BitmapText (không hỗ trợ đầy đủ Unicode) hay Phaser Text/DOM Text thường?
4. Nếu dùng BitmapText, chuyển sang Phaser Text (dùng font hệ thống hỗ trợ Unicode) hoặc render chat box bằng DOM/HTML overlay thay vì canvas.
5. Kiểm tra input HTML có set <meta charset="UTF-8"> và input field không bị giới hạn ký tự sai (substring cắt theo byte thay vì theo ký tự).
Sau khi tìm ra nguyên nhân gốc, sửa và test bằng cả câu tiếng Việt có dấu và câu tiếng Anh thường.
```

---

## 2. 🎨 BƯỚC 6B: Cải tiến giao diện tổng thể

**Yêu cầu:**
- Giảm bớt/bỏ emoji trong UI (hiện đang dùng khá nhiều: 🔑📍💬✨👑⭐💻👤) — thay bằng icon SVG/icon font (ví dụ Lucide, Font Awesome) để trông chuyên nghiệp, "dev" hơn.
- Thêm nút **Fullscreen** (dùng Fullscreen API của trình duyệt).
- Redesign giao diện (header, modal, badge vai trò, chat box) theo bộ nhận diện **Dever** dựa trên logo CLB có sẵn — cần bạn cung cấp file logo để trích màu chủ đạo, font, phong cách.

**Prompt gợi ý:**
```
Redesign giao diện UI ngoài game (header, chat box, modal đăng nhập, badge vai trò) theo hướng:
- Loại bỏ hầu hết emoji, thay bằng icon từ thư viện Lucide Icons (hoặc tương đương)
- Thêm nút Fullscreen ở góc màn hình dùng Fullscreen API (document.documentElement.requestFullscreen())
- Áp dụng bảng màu và phong cách theo logo đính kèm: [ĐÍNH KÈM FILE LOGO Ở ĐÂY]
- Giữ nguyên toàn bộ logic game, chỉ chỉnh phần UI/CSS
```
> ⚠️ Bạn cần **upload file logo Dever** (PNG/SVG) trước khi đưa prompt này cho Claude Code, để nó trích màu/phong cách chính xác thay vì đoán.

---

## 3. 🏠 BƯỚC 7: Thêm 2 phòng mới

### 3.1. Phòng "Memory" — kỷ niệm CLB
Phòng trưng bày ảnh kỷ niệm dạng gallery trong không gian pixel (giống một "bảo tàng ảnh" nhỏ).

**Yêu cầu:**
- Thiết kế map dạng phòng triển lãm/hành lang treo tranh (dùng Tiled, thêm vào cùng flow với 3 map hiện có)
- Các "khung ảnh" trên tường là vùng tương tác (giống cơ chế Proximity Zone đã có ở Bước 5) — đứng gần, nhấn `[E]` mở modal xem ảnh full-size + caption
- Ảnh lấy từ thư mục assets do bạn cung cấp (cần bạn chuẩn bị bộ ảnh kỷ niệm CLB)

**Prompt gợi ý:**
```
Thêm 1 phòng mới "memory_room" theo đúng kiến trúc Multi-Room hiện có (portal + Quick Room Selector).
Thiết kế map dạng hành lang triển lãm với các khung ảnh trên tường.
Mỗi khung ảnh là 1 Proximity Zone dùng lại cơ chế Hysteresis đã có (R_in=52px, R_out=70px), nhấn [E] mở modal hiển thị ảnh full-size kèm caption.
Ảnh lấy từ thư mục /assets/memory/ (tôi sẽ bổ sung file ảnh sau).
```

### 3.2. Phòng "Web CLB" — nhúng website có sẵn
**Yêu cầu:**
- 1 khu vực tương tác (kiểu bàn máy tính như `code_editor` đã có) nhúng iframe website CLB
- Cần bạn cung cấp link website cụ thể

**Prompt gợi ý:**
```
Thêm 1 Proximity Zone mới "club_website" dùng lại cơ chế Interactive Zone hiện có (giống whiteboard_slides),
nhấn [E] mở modal nhúng iframe website: [ĐIỀN LINK WEBSITE CLB Ở ĐÂY]
Modal cần có nút mở tab mới (phòng trường hợp website chặn nhúng iframe do X-Frame-Options).
```
> ⚠️ Lưu ý kỹ thuật: nếu website CLB có header `X-Frame-Options: DENY` hoặc CSP chặn nhúng, iframe sẽ không hiển thị được — cần có fallback (nút "Mở trong tab mới") phòng trường hợp này.

---

## 4. 🖼️ BƯỚC 8: Quy trình chỉnh thiết kế trong game dựa trên ảnh thật

Bạn muốn mô phỏng lại không gian/vật thể ngoài đời thật (ví dụ: phòng CLB thật, logo, vật dụng) thành pixel art trong game. Đây là quy trình thực tế (không có cách "AI tự động 100%" đáng tin cậy cho pixel art game-ready, cần công đoạn thủ công/bán tự động):

### Cách 1 — AI hỗ trợ tạo pixel art từ ảnh (nhanh, cần chỉnh sửa tay)
1. Dùng công cụ AI tạo ảnh (có thể dùng ngay trong Claude qua tính năng tạo hình ảnh, hoặc Midjourney/Stable Diffusion với LoRA pixel-art) với prompt mô tả object dựa trên ảnh thật + từ khóa "pixel art, 16-bit, top-down game asset, transparent background".
2. Import ảnh AI tạo ra vào **Piskel** (piskeljs.com, miễn phí, chạy trên web) hoặc **Aseprite** (trả phí, chuyên nghiệp hơn) để chỉnh tay: cắt về đúng kích thước tile (thường 16x16, 32x32 px), sửa màu cho khớp bảng màu chung của game, xóa nhiễu.
3. Export sang PNG, đưa vào thư mục `/assets/`, cập nhật Tiled tileset.

### Cách 2 — Vẽ tay dựa trên ảnh tham chiếu (chuẩn nhất, tốn thời gian hơn)
1. Mở ảnh thật làm layer tham chiếu (reference layer) trong Piskel/Aseprite.
2. Vẽ đè pixel art theo bố cục/màu sắc của ảnh thật, giữ đúng kích thước lưới tile của map hiện tại.
3. Đây là cách các game pixel chuyên nghiệp làm — chậm nhưng đảm bảo nhất quán phong cách.

### Cách 3 — Đưa ảnh thật trực tiếp cho Claude Code làm reference
```
Đây là ảnh chụp [mô tả: phòng CLB thật / logo / vật dụng]. Hãy tạo texture pixel art
lấy cảm hứng bố cục/màu sắc từ ảnh này, dùng TextureGenerator.js hiện có trong project
(generate trên Canvas trong bộ nhớ, giống cách các texture khác đang được tạo),
kích thước [XxX px], style nhất quán với bộ texture hiện tại của map.
[ĐÍNH KÈM ẢNH THAM CHIẾU]
```
> Vì project đang dùng `TextureGenerator.js` để tự sinh texture bằng code (không dùng file ảnh có sẵn), cách này có thể tận dụng được — mô tả ảnh thật bằng lời + đính kèm ảnh, để AI viết code sinh texture pixel giống phong cách hiện tại. Phù hợp cho vật thể đơn giản (bàn, ghế, biểu tượng); với ảnh phức tạp (khung cảnh thật) nên dùng Cách 1 hoặc 2.

---

## 5. ✅ Checklist việc bạn cần chuẩn bị trước khi giao cho Claude Code
- [ ] File logo Dever (PNG/SVG, càng nét càng tốt) — cho Bước 6B
- [ ] Bộ ảnh kỷ niệm CLB muốn trưng bày — cho Bước 7.1
- [ ] Link website CLB chính xác — cho Bước 7.2
- [ ] Ảnh tham chiếu thực tế (nếu có) cho các vật thể/không gian muốn mô phỏng — cho Bước 8
- [ ] Xác nhận với Claude Code: kiến trúc phòng hiện tại là hardcode hay data-driven từ DB — quyết định có refactor trước khi thêm phòng mới không

---

## 6. Thứ tự đề xuất thực hiện
1. Bước 6A (sửa lỗi chat) — ưu tiên cao nhất vì ảnh hưởng trải nghiệm cơ bản
2. Xác nhận kiến trúc room (hardcode vs DB) — quyết định có refactor không
3. Bước 7 (2 phòng mới) — tận dụng cơ chế Proximity Zone đã có, không cần logic mới nhiều
4. Bước 6B (UI redesign) — làm sau cùng vì cần asset logo, và làm sau khi tính năng ổn định để tránh phải chỉnh UI nhiều lần
5. Bước 8 (asset thật) — làm song song/lặp lại liên tục khi cần thêm nội dung

# BÁO CÁO AUDIT PHASE 0 — DEVER TOWN v2.0

**Ngày:** 2026-10-01 · **Nhánh:** `develop_hung` (commit `653e69a`) · **Phạm vi:** audit-only, không đổi kiến trúc
**Baseline:** `npm run build` pass (19.4s) · 38 test Playwright (8 file) · 8 node verify scripts · chưa có CI

---

## 1. VOICE / VIDEO (WebRTC P2P)

**Kết luận lớn: chưa có proximity voice.** Hiện tại là voice channel kiểu Discord gắn theo zone `meeting_stage` — người chơi phải mở modal mới join được, remote audio phát full volume qua `<audio>` element, không có GainNode nào để điều chỉnh theo khoảng cách.

| # | Vấn đề | Mức độ |
|---|--------|--------|
| V1 | Không có TURN server (chỉ 3 STUN Google) → rớt kết nối sau symmetric NAT, đặc biệt 4G mobile VN | Nghiêm trọng |
| V2 | Không ICE restart: rớt mạng chốc lát → voice chết vĩnh viễn, phải join lại tay | Nghiêm trọng |
| V3 | Không tự rejoin khi socket.io reconnect (socket id đổi, peerConnections key theo id cũ) | Nghiêm trọng |
| V4 | Mesh P2P thuần: giới hạn thực tế ~6–8 người bật video, audio-only ~15–20 người | Thiết kế |
| V5 | Glare khi 2 người join đồng thời (cả 2 đều initiator) → kết nối treo nửa vời | Trung bình |
| V6 | `voice:signal` không validate cùng voice room | Trung bình |
| V7 | `voiceRooms` lưu trong RAM process → chặn scale multi-instance | Trung bình |
| V8 | Đóng modal = rời voice (kể cả vô tình) | Trung bình |
| V9 | Không có push-to-talk → nguy cơ feedback khi nhiều thành viên ngồi chung phòng vật lý (đúng use-case CLB) | Trung bình |
| V10 | Tile remote không hiện badge "đang chia sẻ màn hình" | Nhỏ |

**Fix Phase 0 (không đổi kiến trúc):** thêm TURN server → ICE restart → tự rejoin khi socket reconnect → validate `voice:signal` → đo tỉ lệ kết nối 2/4/8 người trên wifi + 4G làm baseline.
**Phase 1:** spatial voice cần refactor đường audio remote sang Web Audio graph (bắt buộc); quyết định SFU (LiveKit) cho event >15 người.

## 2. MOBILE SUPPORT — 18 vấn đề (4 nghiêm trọng, 7 trung bình, 7 nhẹ)

**Nghiêm trọng:**
- **M1.** Nút Chat trên mobile gãy hoàn toàn: `TouchControls.js:152` gọi `chatBox.toggleMobileChat()` không tồn tại → `TypeError`, mobile không có cách nào mở chat.
- **M2.** Bàn phím ảo iOS che ô nhập chat (không xử lý `visualViewport`, dùng `100vh` thay vì `100dvh`).
- **M3.** iOS auto-zoom khi focus input < 16px (`.chat-input`, `.modal-input` đang 13px).
- **M4.** Không cap `devicePixelRatio`: máy DPR=3 render canvas 2400×1800 cho game 800×600; lighting/particles không có nhánh giảm chất lượng trên mobile → lag/nóng máy.

**Trung bình:** minimap đè lên D-pad; không đăng xuất được trên mobile; thiếu `touch-action: none` trên canvas; không chặn long-press/contextmenu; D-pad hiện nhầm trên desktop thu nhỏ <1024px; `pointerleave` làm khựng di chuyển (thiếu `setPointerCapture`); D-pad 4 nút rời rạc → đi chéo khó.

**PWA/installable:** đã có `site.webmanifest` + icons, nhưng **thiếu Service Worker** (Chrome yêu cầu SW mới hiện install prompt) → hiện tại không cài được lên điện thoại.

## 3. BUG DUNGEON (`server_dungeon` — Hầm Sự Cố)

**Kết luận: đây không phải dungeon crawler mà là 4 "máy bán điểm" đặt trong phòng tối.** Loop: vào hầm → đi tới 1 trong 4 zone cố định → bấm E → bấm nút "Khắc Phục" → chờ 500ms giả lập → +coin. Không quái, không combat, không HP, không boss, không loot, không procedural, không fail state (100% thành công).

**Bug nghiêm trọng: farm D-Coin vô hạn** — `setupBugDungeonView` luôn bật lại nút mỗi lần mở modal, không cooldown, không giới hạn/ngày → spam E + click cày 100 coin/0.5s. Phá vỡ kinh tế game. **Đã fix trong Phase 0** (cooldown 10 phút/bug + cap 500 coin/ngày).

Thiếu sót khác: type `bug_dungeon_hunt` không đăng ký trong `interactions.js` (switch-case cứng trong modal); số liệu terminal tĩnh gây lừa ("SYSTEM INTEGRITY: 87%"); nhập nhằng Points vs D-Coin; giải cứu talent luôn lấy `lockedTalents[0]`.

**Hướng Dungeon 2.0 (Phase 4):** D1 chống farm → D4 torch/darkness thật → D2 bug-monster (NullPointer Slime, MemoryLeak Blob, InfiniteLoop Wisp, AI lang thang → đuổi theo) → D3 combat "Búa Debug" + HP 2 bên + phạt chết kiểu Pokémon blackout → D5 procedural-lite (random vị trí spawn quái theo seed) → D6 mini-boss "Kernel Panic".

## 4. HIỆU NĂNG — mục tiêu 20+ người/phòng

**Network (tốt):** client gửi tối đa 30 events/s (throttle 30Hz, chỉ khi di chuyển); server cap 20/s + delta compression + broadcast `volatile` đúng room. Ở 20 người/phòng ≈ 7.6k gói/s ≈ 7 Mbps outbound — không phải nút thắt. **Đã fix:** hạ client tick xuống 20/s cho khớp server (bỏ emit thừa).

**Bottleneck là client render:**
- RemotePlayer không có frustum culling: người ở góc map xa vẫn render + depth-sort toàn bộ display list mỗi frame.
- `LightingManager.renderLighting()` vẽ lại toàn bộ mỗi frame khi trời tối (120–200 ellipse triangulations/frame).
- Minimap vẽ lại 475 tiles **mỗi frame** dù layer tĩnh.
- Footstep dust tạo ParticleEmitter mới liên tục (~13 emitter + 13 timer/giây khi di chuyển).
- **Leak GPU thật:** texture avatar `char_${socketId}` không bao giờ bị xóa khi disconnect/đổi phòng → memory tăng vô hạn. **Đã fix trong Phase 0.**

**Ngưỡng an toàn hiện tại:** desktop 12–18 người/phòng mượt; mobile 8–12 người. Lên 20–30 người chỉ cần fix client (culling, minimap cache, lighting theo nhịp), không cần đụng server.

## 5. VIỆC ĐÃ LÀM TRONG PHASE 0

| Việc | Trạng thái |
|------|-----------|
| Audit voice/mobile/dungeon/hiệu năng (4 báo cáo chi tiết) | Xong (file này là bản tổng hợp) |
| `npm run build` pass | Xong (19.4s) |
| CI tối thiểu: `.github/workflows/ci.yml` (build + verify scripts + Playwright Chromium mỗi push/PR vào `develop_hung`) | Xong, chờ merge |
| Fix farm D-Coin vô hạn (cooldown 10'/bug + cap 500/ngày) | Xong |
| Fix nút chat mobile gãy | Xong |
| Fix iOS auto-zoom (input 16px) + cap DPR ≤ 2 | Xong |
| Fix leak GPU texture avatar | Xong |
| Client tick 30/s → 20/s | Xong |
| Test suite mở rộng (spatial voice zone, phòng họp, quiz host) | Chuyển sang đầu Phase 1 (cần code Phase 1 tồn tại mới viết test được) |
| Dọn hằng số vào `src/config/` | Lồng vào từng fix (không hardcode mới) |

**Đính chính so với plan:** test suite hiện có **38 test** (8 file), không phải 58 như plan ghi.

## 6. RỦI RO CÒN LẠI → PHASE 1

1. Voice mesh không chịu nổi event toàn CLB (>15 người) — cần quyết định SFU (LiveKit) hoặc giới hạn zone + overflow room ở Phase 1.
2. TURN server chưa có — voice trên 4G vẫn rớt cho tới khi bổ sung (đề xuất dùng dịch vụ TURN hoặc tự host coturn).
3. Spatial voice là refactor lớn (Web Audio graph) — ước tính 1–2 tuần dev.
4. PWA install được sau khi thêm Service Worker (đã liệt kê, chưa làm — thuộc Phase 7 mobile packaging).

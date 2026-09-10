# Tiến Trình Phát Triển DEVER TOWN — Phase 2: Visual & Movement Upgrade

> **Tài liệu tham chiếu:** `docs/plans/PLAN_v0.5_STABILIZATION_AND_VISUAL_UPGRADE.md`  
> **Nhánh phát triển:** `develop_hung`  
> **Cập nhật lần cuối:** 10/09/2026

---

## 1. Trạng Thái Tổng Thể

| Phase / Sprint | Nội dung | Trạng thái | Commit |
|---|---|:---:|---|
| **PHASE 1** | Stabilization (Security, Performance, RET-008, INS-001, v0.5.0) | Hoàn thành 100% | `aed29f4`, `c5efb09`, `cd2b70a`, `cdd7db6` |
| **S2.A (Sprint 4)** | Label Clarity: Chữ sắc nét, HiDPI resolution, PixelArt render | Hoàn thành 100% | Đang commit |
| **S2.B (Sprint 5-6)** | Pokemon GBA Effects: Grass rustle, Shadow ellipse, Footstep variation, Room flash | Hoàn thành 100% | Đang commit |
| **S2.C (Sprint 7-9)** | Multi-Floor System: FloorManager, Thang bộ, Ghost floor, Floor HUD | Chuẩn bị triển khai | — |
| **S2.D (Sprint 10-12)** | Oblique 2.5D: Y-sort depth, Ambient lighting, Oblique tiles | Đã triển khai Ambient Lighting | — |

---

## 2. Chi Tiết Các Hạng Mục Đã Hoàn Thành

### Sprint 4 (S2.A): Label Clarity — Chữ & Nhãn Sắc Nét
- [x] `src/main.js`: Thiết lập cấu hình render `antialias: false, roundPixels: true, pixelArt: true`.
- [x] `src/scenes/WorldScene.js`: Portal text nhãn cổng dịch chuyển có `resolution: Math.min(window.devicePixelRatio || 2, 2)`, stroke viền `#1e1b4b` dày 3px, nền kính mờ `rgba(15, 23, 42, 0.92)`.
- [x] `src/managers/InteractionManager.js`: Tooltip `[E] Tương tác` và Badge tên khu vực được bổ sung `resolution: 2` và stroke viền chống mờ trên màn hình Retina/HiDPI.

### Sprint 5-6 (S2.B): Hiệu Ứng Phong Cách Pokemon GBA & Game Feel
- [x] `src/managers/JuiceManager.js`: Thêm hàm `spawnGrassRustle(x, y)` tạo particle cỏ xòe khi dẫm lên tile cỏ.
- [x] `src/entities/Player.js` & `RemotePlayer.js`:
  - Thêm bóng elip bán trong suốt dưới chân (`shadowEllipse`), co giãn nhẹ (bobbing scale) theo bước đi.
  - Căn chỉnh trục Y-depth theo bàn chân nhân vật (`this.y + 14`).
  - Kích hoạt tiếng bước chân theo chất liệu mặt sàn (cỏ, gỗ, đá, cyber).
  - Thêm hiệu ứng nảy nhẹ (`ease: Back.easeOut`) cho NameTag nhân vật khi xuất hiện.
  - Dọn dẹp bóng elip an toàn trong `destroy()`.
- [x] `src/utils/AudioManager.js`: Mở rộng `playFootstep(surfaceType)` tổng hợp âm thanh 8-bit theo mặt sàn (cỏ, gỗ, đá, cyber) qua Web Audio API.
- [x] `src/scenes/WorldScene.js`: Thêm hiệu ứng chớp sáng trắng nhanh (`cameras.main.flash(70, 255, 255, 255)`) phong cách Pokemon GBA trước khi chuyển phòng.
- [x] `src/managers/AmbientEnvironmentManager.js`: Thêm `applyAmbientLight(roomId)` phủ sắc thái ánh sáng ấm/lạnh đặc trưng từng phòng kiểu Stardew Valley.

---

## 3. Hạng Mục Tiếp Theo Cần Làm

### Sprint 7-9 (S2.C): Hệ Thống Đa Tầng (Multi-Floor kiểu Stardew Valley)
- [ ] Mở rộng dữ liệu `maps.js` hỗ trợ cấu trúc `floors: []`.
- [ ] Tạo module `src/managers/FloorManager.js`.
- [ ] Bổ sung Stair Zones và Floor Badge hiển thị số tầng.

### Sprint 10-12 (S2.D): Oblique 2.5D Hoàn Thiện
- [ ] Cập nhật đồ họa tile tường và bàn ghế theo góc chiếu Oblique 2.5D trong `TextureGenerator.js`.
- [ ] Drop shadow cho vật thể tĩnh (obstacles).

---

## 4. Nhật Ký Tiến Trình (Activity Log)

- **10/09/2026 09:35**: Xác minh Phase 1 đã hoàn thiện 100%. Sao chép file plan gốc vào `docs/plans/PLAN_v0.5_STABILIZATION_AND_VISUAL_UPGRADE.md`. Khởi tạo tài liệu tiến trình Phase 2.
- **10/09/2026 09:40**: Hoàn thành Sprint 4 (S2.A - Label Clarity) & Sprint 5-6 (S2.B - Pokemon GBA Effects & Movement Foundations + Ambient Lighting). Build test thành công 0 errors (`✓ built in 4.76s`).

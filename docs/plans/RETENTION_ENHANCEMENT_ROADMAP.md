# DEVER TOWN — Retention Enhancement Roadmap

**Status:** Active on `develop`

**Started:** 2026-09-04

**Iteration 1:** Implemented and validated 2026-09-04
**North-star goal:** tăng số người chơi quay lại và thực hiện ít nhất một hoạt động có chủ đích, không dùng dark pattern hoặc phần thưởng gây áp lực.

## 1. Product diagnosis

DEVER TOWN đã có độ rộng nội dung tốt: 9 khu, realtime chat, daily quests, achievements, customization, inventory, học tập và nhiều minigame. Khoảng trống lớn nhất không phải là thiếu feature, mà là thiếu một hành trình rõ ràng nối các feature thành vòng chơi có ý nghĩa.

Current loop:

`Vào game → thấy nhiều lựa chọn → tự khám phá → nhận feedback rời rạc → rời game`

Target loop:

`Vào game → thấy mục tiêu phù hợp → hành động → progress/reward nhất quán → chọn mục tiêu tiếp → gặp người khác hoặc khám phá nội dung mới → có lý do quay lại`

### Evidence captured before Iteration 1

- Daily quest có 7 nhiệm vụ nhưng modal fallback ghi `4/6`; flow quest chưa có behavioral E2E test. **Đã sửa trong Iteration 1.**
- Achievement reward chỉ thay đổi số điểm trên DOM, không đi qua nguồn state/persistence chính. **Đã sửa trong Iteration 1.**
- Bốn subsystem gọi `authService.syncFullProfile()` nhưng method này chưa tồn tại. **Đã sửa trong Iteration 1; sync được debounce, tuần tự hóa và retry không làm mất batch cũ.**
- Auth có thể ghi state server vào localStorage sau khi singleton QuestManager đã load, làm in-memory state bị cũ. **Đã sửa trong Iteration 1.**
- Gameplay audit còn giữ một lỗi Major: tương tác Cóc Vàng bằng phím `E` không mở modal.
- `npm run test:e2e` pass 58 cases, nhưng đó là 29 declarations chạy trên hai device projects; nhiều test gọi thẳng manager thay vì đi qua hành vi người chơi.
- `npm run test:load` không parse được và dùng room IDs cũ. **Đã sửa trong Iteration 1; performance acceptance vẫn cần một load run dài hơn.**
- UI footer ghi `v0.8.5`, trong khi package và changelog đang ở `v0.4.1`. **Đã đồng bộ lại copy trong Iteration 1.**

### Product contract synchronized from `main`

`PRODUCT_SPEC_AND_OPERATIONS_BLUEPRINT.md` now resolves the previously missing direction:

- Core users are FPT University Da Nang technology/design students and FU-DEVER members; the wider community is secondary.
- Product priority is **Social 50% > Learn 30% > Play 20%**.
- Targets are D1 >= 40%, D7 >= 20%, 12–18 minute sessions and monthly return >= 30%.
- The supplied v0.4.1 baseline is 30–50 DAU, 120–150 WAU and >= 95% onboarding conversion. These remain product-provided figures until telemetry artifacts verify them.
- Allowed telemetry is room visits, minigame records, quest progress and anonymous JavaScript errors; sensitive identity, clipboard and raw credential collection is prohibited.
- v0.5.0 prioritizes guest-to-account merge, Hall of Fame and a gated small-group proximity voice experiment.

Terminology is normalized here: **`MWR-7`** means Meaningful Weekly Return; **`MRR-30`** means the Product Spec's monthly return target.

## 2. Research framework

Mỗi enhancement phải đi qua bốn lớp:

1. **MDA:** chỉ rõ mechanic được thêm, dynamic dự kiến và cảm xúc cần tạo. Tham chiếu: [MDA: A Formal Approach to Game Design and Game Research](https://www.cs.northwestern.edu/~hunicke/MDA.pdf).
2. **Self-Determination:** đánh giá tác động lên competence, autonomy và relatedness. Nghiên cứu về game cho thấy ba nhu cầu này dự báo enjoyment và ý định chơi tiếp: [Ryan, Rigby & Przybylski, 2006](https://doi.org/10.1007/s11031-006-9051-8).
3. **Player journey:** enhancement phải cải thiện ít nhất một bước `activation → meaningful action → return → social loop`.
4. **HEART:** đặt goal, signal và metric trước khi triển khai rộng. Tham chiếu: [Google Research — HEART framework](https://research.google/pubs/measuring-the-user-experience-on-a-large-scale-user-centered-metrics-for-web-applications/).

Daily quests không được biến thành checklist bắt buộc. Nghiên cứu về daily quest ủng hộ phần thưởng theo chặng, quyền tự chọn nhiệm vụ và feedback hoàn tất rõ ràng; đồng thời cảnh báo lặp lại có thể gây nhàm chán: [Ahn & Lee, 2019](https://doi.org/10.17210/jhsk.2019.05.14.2.83).

## 3. Measurement contract

### North-star metric

**Meaningful Weekly Return (`MWR-7`):** tỷ lệ người chơi có một `meaningful_action` trong ít nhất 2 ngày khác nhau của cửa sổ 7 ngày.

Một `meaningful_action` là một trong: hoàn thành/claim quest, tương tác zone thật, hoàn thành minigame, gửi chat được server xác nhận, trang bị/customize và lưu thành công.

### Supporting metrics

| Journey stage | Metric | Initial target |
| --- | --- | --- |
| Activation | Median time từ `world_entered` đến meaningful action đầu tiên | < 3 phút |
| Activation | Tỷ lệ người mới claim reward đầu tiên | >= 60% |
| Engagement | Meaningful actions trên một session | tăng, không đổi lỗi/crash |
| Return | D1 và D7 meaningful return | đo baseline trước khi đặt uplift |
| Progression | Tỷ lệ quest hoàn thành được claim | >= 80% |
| Social | Tỷ lệ session có peer-confirmed chat/emote/co-play | đo baseline |
| Task success | Sync success, retry success, duplicate reward rate | >= 99%, duplicate = 0 |

Guardrails: page error, lost progress, duplicate reward, map/portal regression, mobile overflow, time-to-interactive và opt-out/consent cho telemetry.

## 4. Prioritized backlog

Điểm ưu tiên dùng thang 1–5: `(retention leverage × confidence) / (effort × regression risk)`.

| ID | Task | Value | Confidence | Effort | Risk | Priority |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| RET-001 | Authoritative progression: points, quest hydration, sync, monotonic explorer progress | 5 | 5 | 2 | 2 | 6.25 |
| RET-002 | Daily Momentum HUD: next goal, claim-ready, sync/retry, all-done states | 5 | 4 | 3 | 1 | 6.67 |
| RET-003 | Behavioral E2E: first reward, reload, authenticated hydration, offline retry | 5 | 5 | 2 | 1 | 12.50 |
| RET-004 | Repair achievement triggers and verify organic unlock paths | 4 | 5 | 2 | 1 | 10.00 |
| QA-001 | Repair multiplayer stress-test script and current room IDs | 4 | 5 | 1 | 1 | 20.00 |
| INS-001 | Privacy-aware journey events and HEART dashboard baseline | 5 | 4 | 3 | 2 | 3.33 |
| RET-005 | First-session guided mission with a choice of Learn / Play / Social | 5 | 4 | 3 | 2 | 3.33 |
| RET-008 | Conflict-safe guest-to-account progression merge | 5 | 5 | 3 | 2 | 4.17 |
| SOC-001 | Hall of Fame and semester-based leaderboard seasons | 5 | 4 | 4 | 2 | 2.50 |
| RET-006 | Social rendezvous: scheduled club activities + occupied-room signal | 5 | 3 | 4 | 2 | 1.88 |
| RET-007 | Weekly content rotation and returning-player recap | 4 | 3 | 4 | 2 | 1.50 |
| PERF-001 | Split the 1.88 MB minified client bundle and measure TTI | 4 | 5 | 3 | 2 | 3.33 |
| MAP-NEW | Add another map before validating current loops | 2 | 2 | 5 | 5 | 0.16 |

## 5. Iteration 1 — Reliable Daily Momentum

### User flow

- **User:** first-time or returning FU-DEVER/FUDA player.
- **Entry:** world becomes playable after guest/account selection.
- **Primary action:** inspect the suggested daily goal, then claim or pursue it.
- **Success:** reward updates header, modal, local persistence and authenticated server state exactly once.
- **Recovery:** if sync fails, local progress remains intact and the UI offers a retry.

### Scope

- Implement `syncFullProfile()` with debounced patch merging and explicit status.
- Hydrate QuestManager only after player identity/server data are ready.
- Make explorer progress monotonic and persist visited room IDs in the existing quest state JSON.
- Route achievement points through QuestManager.
- Add an accessible compact Daily Goal HUD with loading/local/sync/error/claim/all-done states.
- Correct all seven-quest copy and remove duplicate quest-button listeners.
- Add real interaction tests for claim, persistence, achievement reward and mobile layout.

### Frozen boundaries

- No edits to `src/config/maps.js`, map layouts, colliders, portal tiles, `spawnPoint`, `targetSpawn`, or teleport cooldown.
- No new economy, paid mechanic, push notification or streak-loss pressure.
- Existing storage keys remain backward-compatible.

### Definition of done

- Build and focused/full Playwright pass.
- Guest progress survives reload.
- Authenticated server state wins over stale pre-login browser state.
- Achievement points survive reload and cannot be duplicated.
- Explorer progress never decreases.
- Desktop and 375 px mobile retain visible focus, no overflow and no overlap with core controls.
- Offline sync failure is honest, local-first and retryable.

### Validation result

- Production build passed; the existing `.env` `NODE_ENV` warning and 1.89 MB minified client chunk remain open performance work.
- Final post-main Playwright passed: 75 passed, 1 intentional Desktop skip for a mobile-only geometry assertion; the same scenario passed on Pixel 5.
- Stress-test connectivity smoke passed with 1/1 bot, zero connection errors and zero unexpected drops. This is a smoke result, not a performance acceptance claim.
- `src/config/maps.js` and `server/data/rooms.json` remained byte-identical to `HEAD`.
- Independent QA caught and closed two pre-gate blockers: overlapping profile sync could discard a failed full batch, and a late network banner could block the mobile retry action.

## 6. Feedback loop

For every iteration:

1. Record the exact hypothesis and target metric.
2. Ship one isolated mechanic/dynamic change.
3. Exercise normal, loading, success, error, empty and disabled states.
4. Run behavioral QA plus map safety checks.
5. Review observed signals and player feedback.
6. Keep, tune or revert; update this roadmap and the project wiki.

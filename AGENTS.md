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
- Mọi commit git bắt buộc phải chỉ định author của người dùng:
  `--author="qnhat1504 <dangquangnhat1504@gmail.com>"` (hoặc `--author="RaH11 <hungnguyen.190206@gmail.com>"`)


## 5. Strict Emoji Control & Anti-AI-Slop Protocol (Quy Chuẩn Kiểm Soát Emoji & Văn Phong Game)
- **Tỷ lệ sử dụng Emoji (Strict 10 - 20% Budget)**: Cả game chỉ dùng tối đa **10 – 20%** emoji cho những vị trí thực sự cần thiết để minh họa gameplay và gamification (như ngọn lửa Bestie Streak `🔥`, linh thú Buggy các cấp `🥚`, `🐞`, `⚡`, `👑`, biểu cảm emote trong chat).
- **CẤM gắn Emoji vào tên Event / Zone khi bấm [E]**: Mọi nhãn lơ lửng trên đầu vật thể, tooltip gợi ý phím `[E]`, tiêu đề khu vực tương tác tuyệt đối 100% không dùng emoji (BẮT BUỘC: `Slide CLB`, `Bàn Hackathon Đội Alpha`, `Linh Vật Cóc Vàng FUDA`...; CẤM: `📊 Slide CLB`, `💻 Bàn Hackathon`...).
- **CẤM rải Emoji vào Nút bấm (Buttons) & Tabs**: Mọi nút bấm (CTA) và tab chuyển đổi phải dùng text thuần túy, sạch sẽ (BẮT BUỘC: `Gửi Lời Mời Kết Bạn`, `Đồng Ý Kết Bạn`, `Từ Chối`, `Nhắn Tin`, `Tải Game`...; CẤM: `<span>🤝</span> Kết Bạn`, `<span>✅</span> Đồng Ý`...).
- **CẤM rải Emoji vào Thông báo hệ thống (Toast & Console Logs)**: Thông báo popup và log hệ thống phải dùng văn phong tinh gọn, chuyên nghiệp theo chuẩn kỹ thuật (`[Error]`, `[Warning]`, `[Info]`), không chèn emoji đầu dòng.

## 6. Game Development & Upgrade Protocol (Notion Superpowers Framework)
> Áp dụng quy chuẩn phát triển game hiện đại từ tài liệu: `thinhnguyen94/H-ng-d-n-t-o-game-b-ng-ChatGPT-Blender-MCP-Three-js-v-Superpowers-3d5afe0c56278065be83ca7108de1431`
- **Tách Biệt Hằng Số Cân Bằng (Balancing Configuration)**:
  - Mọi thông số vật lý (gia tốc $g$, ma sát, độ đàn hồi), vận tốc di chuyển, kích thước hitbox, bảng điểm, tỷ lệ xuất hiện vật phẩm BẮT BUỘC phải đặt trong thư mục `src/config/` (ví dụ `minigamesConfig.js`). Tuyệt đối không hardcode số ma thuật trong vòng lặp `update()` hay render.
- **Finite State Machine (FSM) Bắt Buộc Cho Từng Minigame**:
  - Mọi trò chơi phải có cỗ máy trạng thái tường minh (`IDLE`, `AIMING/PREPARING`, `IN_ACTION`, `RESOLUTION`, `CELEBRATING/GAMEOVER`). Không dùng các cờ boolean rời rạc gây chồng chéo sự kiện khi bấm phím liên tục.
- **Game Feel & "Juice" 60FPS**:
  - Tích hợp phản hồi giác quan: Camera shake (100–150ms khi sút mạnh/nổ bom), chữ số điểm bay đàn hồi (Floating Combat Text), hạt bụi/khói/pháo hoa, chuyển động co giãn đàn hồi (squash & stretch), âm thanh tổng hợp Web Audio API sinh động.
- **Tránh Gameplay Hời Hợt (Non-Trivial & Hands-on Mechanics)**:
  - Tuyệt đối không thiết kế game chỉ bằng 1 nút bấm đơn điệu hay canh vạch xanh vô vị. Phải nghiên cứu cơ chế chuẩn từ thị trường (vuốt vẽ quỹ đạo, phối hợp đa nhịp, vật lý phân tầng chất lỏng, kéo thả cao su, đối kháng 2 chiều).
- **Quy Trình Kiểm Tra Trước Khi Cập Nhật (Pre-Update Verification Checklist)**:
  - Mỗi khi nâng cấp hoặc bổ sung tính năng minigame:
    1. Nghiên cứu benchmark game cùng thể loại trên thị trường.
    2. Viết specification rõ ràng và cập nhật kế hoạch vào `docs/plans/`.
    3. Bảo toàn 100% ID DOM và API interface để không gây gãy vỡ test suite (Zero-Regression).
    4. Chạy build `npm run build` và test suite Playwright kiểm chứng trước khi kết thúc tác vụ.

## Agent skills

### Issue tracker

Issues and specs live in GitHub Issues for `fudever-club/dever_town`. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the default mattpocock/skills triage labels. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repository. See `docs/agents/domain.md`.

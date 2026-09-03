# 📡 DEVER TOWN — Tài Liệu Đặc Tả API & Realtime Socket.io

Tài liệu kỹ thuật chi tiết về hệ thống REST API, Socket.io Realtime Events, Cơ sở dữ liệu và Cơ chế Bảo mật của DEVER TOWN (Phiên bản v0.4.0+).

---

## 🌐 1. Tổng Quan Kiến Trúc Mạng

```
[Phaser 3 + HTML5 Client]
       │
       ├─── HTTP/REST ───► Express Server (:3001) ───► PostgreSQL Supabase / File Adapter
       │                   ├── /api/auth
       │                   ├── /api/rooms
       │                   ├── /api/game
       │                   └── /api/health
       │
       └─── WebSocket ───► Socket.io Server (:3001) ───► Multi-Room In-Memory State
                           ├── joinRoom / switchRoom
                           ├── move (Throttled 30fps)
                           ├── chatMessage & stickers
                           └── emote & dance sync
```

- **Base URL API:** `http://localhost:3001` (Dev) hoặc URL triển khai Render/Vercel.
- **WebSocket Gateway:** `ws://localhost:3001` (Socket.io v4.8+).
- **Cơ chế xác thực:** Bearer Token qua header `Authorization: Bearer <JWT_TOKEN>`.
- **Global Rate Limit:** Tối đa 120 requests / 1 phút / IP.

---

## 🔐 2. REST API Endpoints

### A. Authentication & User Profile (`/api/auth`)

#### 1. Đăng ký tài khoản mới
- **Method:** `POST`
- **Endpoint:** `/api/auth/register`
- **Rate Limit:** 10 requests / 15 phút.
- **Request Body:**
```json
{
  "email": "student@fpt.edu.vn",
  "password": "SecurePassword123!",
  "displayName": "Nguyen Van A",
  "avatarId": "dev_hoodie"
}
```
- **Response (201 Created):**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr_9a8b7c6d5e",
    "email": "student@fpt.edu.vn",
    "displayName": "Nguyen Van A",
    "role": "dev",
    "avatarId": "dev_hoodie",
    "deverPoints": 0
  }
}
```

#### 2. Đăng nhập tài khoản
- **Method:** `POST`
- **Endpoint:** `/api/auth/login`
- **Rate Limit:** 15 requests / 15 phút.
- **Request Body:**
```json
{
  "email": "student@fpt.edu.vn",
  "password": "SecurePassword123!",
  "deviceId": "dev_xyz123"
}
```
- **Response (200 OK):**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

#### 3. Lấy thông tin phiên hiện tại
- **Method:** `GET`
- **Endpoint:** `/api/auth/me`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Response (200 OK):** Trả về đầy đủ profile, tủ đồ (wardrobe), túi đồ (inventory), điểm và tiến độ nhiệm vụ.

#### 4. Cập nhật hồ sơ & trang bị
- **Method:** `PUT`
- **Endpoint:** `/api/auth/profile`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Request Body:**
```json
{
  "displayName": "Van A Coder",
  "equippedItemId": "item_macbook_m3",
  "wardrobeConfig": {
    "gender": "male",
    "outfitId": "dev_hoodie_cam",
    "hairStyle": "short_dev",
    "hairColor": "#1e293b",
    "accessory": "glasses_nerd"
  }
}
```

#### 5. Quên mật khẩu & Gửi mã OTP
- **Method:** `POST`
- **Endpoint:** `/api/auth/forgot-password`
- **Request Body:** `{ "email": "student@fpt.edu.vn" }`
- **Cơ chế:** Gửi OTP 6 chữ số qua Resend API hoặc Nodemailer; hiệu lực 10 phút.

#### 6. Xác thực mã OTP khôi phục
- **Method:** `POST`
- **Endpoint:** `/api/auth/verify-reset-otp`
- **Request Body:** `{ "email": "student@fpt.edu.vn", "otp": "839102" }`
- **Response (200 OK):** `{ "status": "success", "message": "Mã xác thực hợp lệ" }`

#### 7. Đặt lại mật khẩu qua OTP
- **Method:** `POST`
- **Endpoint:** `/api/auth/reset-password`
- **Request Body:**
```json
{
  "email": "student@fpt.edu.vn",
  "otp": "839102",
  "newPassword": "NewStrongPassword456!"
}
```

#### 8. Đổi mật khẩu trong game
- **Method:** `PUT`
- **Endpoint:** `/api/auth/change-password`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewStrongPassword456!"
}
```

#### 9. Đồng bộ toàn diện hồ sơ (Profile Sync)
- **Method:** `PUT`
- **Endpoint:** `/api/auth/sync-profile`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Request Body:**
```json
{
  "wardrobeConfig": { ... },
  "inventoryItems": { ... },
  "equippedItemId": "item_macbook_m3",
  "questsState": { ... },
  "gameRecords": { ... },
  "deverPoints": 1250
}
```

#### 10. Lưu cấu hình trang phục & trang bị
- **Method:** `PUT`
- **Endpoint:** `/api/auth/customization`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Request Body:**
```json
{
  "wardrobeConfig": { ... },
  "equippedItemId": "item_keychron_k2"
}
```

#### 11. Kiểm tra tính khả dụng của tên nhân vật
- **Method:** `GET`
- **Endpoint:** `/api/auth/check-name?name=DeverHero`
- **Response (200 OK):** `{ "available": true, "message": "Tên khả dụng" }`

---

### B. Room Engine (`/api/rooms`)

#### 1. Lấy danh sách toàn bộ phòng
- **Method:** `GET`
- **Endpoint:** `/api/rooms`
- **Response (200 OK):** Trả về danh sách 9 phòng kèm số lượng người chơi đang online tại mỗi phòng.

#### 2. Lấy dữ liệu chi tiết một phòng
- **Method:** `GET`
- **Endpoint:** `/api/rooms/:roomId`
- **Chi tiết trả về:** Grid size, spawnPoint, portals (danh sách cổng), zones (các vùng tương tác) và pickups (vật phẩm).

---

### C. Game Records & Leaderboard (`/api/game`)

#### 1. Lưu điểm kỷ lục minigame
- **Method:** `POST`
- **Endpoint:** `/api/game/score`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Rate Limit:** 30 requests / 1 phút.
- **Request Body:**
```json
{
  "gameType": "speed_code_duel",
  "score": 2850,
  "streak": 10
}
```

#### 2. Xem Bảng Xếp Hạng Top Cao Thủ
- **Method:** `GET`
- **Endpoint:** `/api/game/leaderboard/:gameType`
- **Ví dụ:** `/api/game/leaderboard/speed_code_duel`
- **Response (200 OK):** Danh sách top 10 người chơi có điểm số cao nhất cùng chuỗi streak ấn tượng.

---

### D. Hệ Thống Kiểm Tra Sức Khỏe (`/api/health`)
- **Method:** `GET`
- **Endpoint:** `/api/health`
- **Response (200 OK):**
```json
{
  "status": "ok",
  "game": "DEVER TOWN",
  "version": "0.4.0",
  "time": "2026-09-04T00:00:00.000Z"
}
```

---

## ⚡ 3. Realtime Socket.io Events

### Client ➔ Server (Phát từ Client)

| Event Name | Tham Số Payload | Mô Tả |
|:---|:---|:---|
| `joinRoom` | `{ roomId, name, avatarId, role, wardrobeConfig, equippedItemId, deviceId }` | Tham gia vào một phòng 2D |
| `move` | `{ x, y, direction, isMoving }` | Đồng bộ vị trí (Throttled 30 FPS với dirty check) |
| `switchRoom` | `{ targetRoomId, targetSpawn }` | Chuyển phòng qua Cổng Dịch Chuyển (Portal) |
| `chatMessage` | `{ text }` | Gửi tin nhắn chat hoặc sticker `[sticker:dever:1]` |
| `emote` | `{ emoteId }` | Gửi biểu cảm hoặc điệu nhảy (`wave`, `heart`, `fire`, `clap`, `dance`, `question`) |
| `deviceApprovalResponse` | `{ approved, targetSocketId }` | Phê duyệt hoặc từ chối lượt đăng nhập từ thiết bị mới |

### Server ➔ Client (Nhận từ Server)

| Event Name | Dữ Liệu Nhận Được | Mô Tả |
|:---|:---|:---|
| `currentPlayers` | `Array<PlayerState>` | Danh sách toàn bộ người chơi đang có mặt trong phòng khi mới vào |
| `playerJoined` | `PlayerState` | Một người chơi mới vừa bước vào phòng |
| `playerMoved` | `{ id, x, y, direction, isMoving }` | Cập nhật tọa độ di chuyển của người chơi khác (nội suy mượt mà) |
| `playerLeft` | `{ id }` | Một người chơi đã thoát hoặc chuyển sang phòng khác |
| `chatMessage` | `{ id, sender, text, time, role }` | Tin nhắn mới nhận được từ người chơi trong phòng |
| `emote` | `{ id, emoteId }` | Hiển thị biểu cảm bay hoặc điệu nhảy của người chơi khác |
| `deviceApprovalRequest` | `{ ip, time, userAgent, socketId }` | Yêu cầu phê duyệt phiên đăng nhập từ thiết bị khác |

---

## 🗄️ 4. Cơ Sở Dữ Liệu PostgreSQL (Supabase)

### Bảng `users`
```sql
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(50) NOT NULL,
  avatar_id VARCHAR(50) NOT NULL DEFAULT 'dev_hoodie',
  role VARCHAR(20) NOT NULL DEFAULT 'dev',
  wardrobe_config JSONB DEFAULT '{}',
  inventory_items JSONB DEFAULT '{}',
  equipped_item_id VARCHAR(50) DEFAULT NULL,
  dever_points INTEGER DEFAULT 0,
  quests_state JSONB DEFAULT '{}',
  quest_date VARCHAR(50) DEFAULT NULL,
  quest_milestone BOOLEAN DEFAULT FALSE,
  game_records JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Bảng `game_scores`
```sql
CREATE TABLE IF NOT EXISTS game_scores (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  player_name VARCHAR(50) NOT NULL,
  game_type VARCHAR(50) NOT NULL,
  high_score INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  last_played TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, game_type)
);
```

### Bảng `password_resets`
```sql
CREATE TABLE IF NOT EXISTS password_resets (
  email VARCHAR(255) PRIMARY KEY,
  otp_code VARCHAR(20) NOT NULL,
  expires_at BIGINT NOT NULL,
  attempts INTEGER DEFAULT 0
);
```

---

## ⌨️ 5. Phím Tắt Toàn Cục & Điều Khiển Client (Global Shortcuts)

| Phím Tắt | Hành Động | Ghi Chú |
|:---|:---|:---|
| `[Z]` | Mở / Đóng Đấu Trí Lập Trình Siêu Tốc (`SpeedCodeDuel.js`) | Kích hoạt tức thì khi không gõ trong input/textarea |
| `[G]` | Mở / Đóng Thanh Biểu Cảm & Nhảy Múa (`EmoteBar.js`) | Hỗ trợ 6 cảm xúc & animation nhảy múa |
| `[I]` | Mở / Đóng Túi Đồ & Trang Bị (`InventoryManager.js`) | Hiển thị 7 vật phẩm Dev & FPTU |
| `[M]` | Thu Gọn / Mở Rộng Radar HUD (`MinimapOverlay.js`) | Tự động chuyển dạng pill nhỏ trên Mobile |
| `[E]` / `Space` | Tương tác với Thực thể / Zone gần nhất | Hỗ trợ Hysteresis chống chớp giật |
| `WASD` / `Mũi Tên` | Di chuyển nhân vật 4 hướng | Chuẩn hóa Vector tốc độ chéo 140px/s |
| `Escape` | Đóng toàn bộ Modal / Hướng dẫn đang mở | Phục hồi tiêu điểm (Focus) an toàn |

---

## ⚙️ 6. Cấu Hình Biến Môi Trường (`.env`)

```env
# Server Runtime
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:3030

# Supabase PostgreSQL (Transaction Pooler / Direct)
DATABASE_URL=postgresql://postgres.xxx:yyy@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres

# JSON Web Token
JWT_SECRET=dever_town_jwt_super_secret_key_production_2026_fuda

# Email Delivery (Resend API)
RESEND_API_KEY=re_xxx
EMAIL_FROM=onboarding@resend.dev
```

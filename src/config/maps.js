/**
 * Cấu hình 7 bản đồ mở rộng (25x19 tiles = 800x608 px) chuẩn nhận diện FUDA & CLB FU-DEVER.
 *
 * Danh mục Tile Indices:
 * 0: Cỏ, 1: Sàn gỗ, 2: Tường gạch, 3: Kệ sách, 4: Bàn làm việc, 5: Đá cuội, 6: Thảm xanh, 7: Hoa
 * 8: Server Rack, 9: Sàn Cyan Cyber, 10: Cổng Portal, 11: Thảm đỏ, 12: Bảng trắng, 13: Cây cảnh, 14: Quầy cà phê, 15: Vách kính
 * 16: Khung tranh kỷ niệm, 17: Bục cúp vàng, 18: Sàn lưới Cyber Web, 19: Cóc Vàng FUDA, 20: Biển hiệu FUDA,
 * 21: Neon DEVER Club, 22: Cột cờ FPT, 23: Sàn gạch Alpha FUDA, 24: Cỏ sân bóng, 25: Khung thành, 26: Rổ bóng rổ,
 * 27: Lưới bóng chuyền, 28: Hồ bơi FUDA, 29: Màn hình LED Media Hub, 30: Quầy Căn Tin, 31: Bàn Cà Phê
 * 32: Giường Ngủ KTX, 33: PC Để Bàn, 34: Bàn Ghế Học Sinh, 35: Bảng Đen Lớp Học, 36: Sofa, 37: Tủ Quần Áo
 * 38: Bàn Họp, 39: Màn Chiếu, 40: Ghế Ngồi, 41: Sofa Ngồi, 42: Hồ Vườn FUDA (nước tự nhiên, chặn đi bộ)
 */

export const MAPS_CONFIG = {
  main_hall: {
    id: 'main_hall',
    name: 'Tòa Alpha - Sảnh Chính & Hội Trường FPTU',
    description: 'Hội trường trung tâm FUDA, tượng Cóc Vàng và kết nối 6 phân khu chức năng.',
    // Phase C — Cờ vùng (Masterplan Trụ cột 1): 'safe' = vùng an toàn tuyệt
    // đối (không nhận sát thương, hồi đầy HP khi vào). Phòng không khai báo
    // cờ mặc định 'safe' (xem DEFAULT_ZONE trong src/config/combatConfig.js).
    // Ánh xạ masterplan: main_hall = Sảnh Lễ Tân Tòa Alpha.
    zone: 'safe',
    // Hybrid painted map: nền vẽ tay V2 cho sân Tòa Alpha (1376x768).
    // layout tile giữ lại làm fallback nếu texture chưa load.
        paintedBackground: {
      imageKey: 'map_alpha_v2',
      imagePath: 'devertown_map_v2_debanded.jpg', // public/ served at root
      width: 1376, height: 768,
      spawnPoint: { x: 746, y: 620 },
      collisionRects: [
        // border walls
        { x: 0, y: 0, w: 1376, h: 16 }, { x: 0, y: 752, w: 1376, h: 16 },
        { x: 0, y: 0, w: 16, h: 768 }, { x: 1360, y: 0, w: 16, h: 768 },
        // Alpha building facade + entrance stairs
        { x: 475, y: 0, w: 543, h: 265 }, { x: 1008, y: 105, w: 82, h: 160 },
        // Duck pond water (chặn vùng nước thực tế x: 65..390, y: 290..580)
        { x: 65, y: 290, w: 325, h: 290 },
        // Central fountain (bể đá đài phun nước tròn tâm 717, 450)
        { x: 664, y: 398, w: 106, h: 105 },
        // Flower beds trên bên trái (bồn hoa gỗ dài & bồn vuông hoa đỏ)
        { x: 555, y: 312, w: 125, h: 36 }, { x: 515, y: 315, w: 42, h: 80 },
        // Flower beds trên bên phải (bồn hoa gỗ dài & bồn vuông bụi cây)
        { x: 752, y: 312, w: 124, h: 36 }, { x: 876, y: 315, w: 44, h: 80 },
        // Bãi cỏ dưới bên trái (bụi hoa lớn)
        { x: 345, y: 525, w: 215, h: 115 },
        // Bãi cỏ dưới bên phải (bồn hoa gỗ & ghế gỗ đứng)
        { x: 842, y: 545, w: 118, h: 35 }, { x: 932, y: 580, w: 26, h: 75 },
        // Thinker statue & pedestal (tượng người suy tưởng & bệ đá)
        { x: 1138, y: 325, w: 70, h: 143 },
        // Benches xung quanh tượng người suy tưởng
        { x: 1080, y: 348, w: 58, h: 38 }, { x: 1210, y: 348, w: 58, h: 38 },
        { x: 1078, y: 522, w: 58, h: 30 }, { x: 1210, y: 522, w: 58, h: 30 },
        { x: 1052, y: 366, w: 26, h: 158 }, { x: 1278, y: 386, w: 24, h: 148 },
        // Hàng rào hoa bao quanh vườn tượng bên phải
        { x: 1050, y: 260, w: 280, h: 55 }, { x: 1300, y: 260, w: 76, h: 400 },
        // Hàng cây xanh rìa trái
        { x: 16, y: 30, w: 70, h: 640 },
      ],
    },
    spawnPoint: { x: 746, y: 620 },
    layout: [
      // 0   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18  19  20  21  22  23  24
      [  2,  2,  2, 10, 10, 10,  2, 10,  2, 20, 20,  2, 21, 21, 10, 20, 20,  2, 10,  2, 10,  2,  2,  0,  0 ],
      [  2, 13, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 13,  0,  7 ],
      [  2, 23, 23, 23,  4,  4, 23, 23,  4,  4, 23, 23, 23, 23, 23,  4,  4, 23, 23,  4,  4, 23, 23,  0,  5 ],
      [  2, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,  5,  5 ],
      [  2, 23,  4, 23, 23,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6, 23, 23,  4, 23, 23,  0,  5 ],
      [  2, 23,  4, 23, 23,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6, 23, 23,  4, 23, 23,  7,  5 ],
      [  2, 23, 23, 23, 23,  6,  6,  6,  6,  6, 19, 19, 19,  6,  6,  6,  6,  6, 23, 23, 23, 23, 23,  0,  5 ],
      [ 10, 23, 23, 23, 23,  6,  6,  6,  6,  6, 19, 19, 19,  6,  6,  6,  6,  6, 23, 23, 23, 23, 10,  5,  5 ],
      [  2, 23, 23, 23, 23,  6,  6,  6,  6,  6, 19, 19, 19,  6,  6,  6,  6,  6, 23, 23, 23, 23, 23,  5,  0 ],
      [  2, 23,  4, 23, 23,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6, 23, 23,  4, 23, 23,  7,  0 ],
      [  2, 23,  4, 23, 23,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6, 23, 23,  4, 23, 23,  0,  0 ],
      [  2, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,  5,  5 ],
      [  2, 23,  4, 23, 23,  4,  4, 23, 23,  4,  4, 23, 23,  4,  4, 23, 23,  4,  4, 23, 23,  4, 23,  5,  7 ],
      [ 10, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,  5, 10 ],
      [  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2, 10, 10,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  5,  0 ],
      [  0,  0,  7,  0, 22, 22,  0,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  0, 22, 22,  0,  7,  5,  0 ],
      [  0, 42, 42, 42, 42, 42,  0,  5,  0,  0,  0,  7,  0,  0,  0,  7,  0,  5,  0,  0,  0,  0,  0,  5,  0 ],
      [  0, 42, 42, 42, 42, 42,  0,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  0,  0,  7,  0,  0,  5,  0 ],
      [  0, 42, 42, 42, 42, 42,  0,  0,  0,  7,  0,  0,  0,  0,  7,  0,  0,  0,  0,  7,  0,  0,  0,  7,  0 ]
    ],
    portals: [
      { x: 746, y: 290, targetRoomId: 'alpha_interior', targetSpawn: { x: 680, y: 580 }, label: 'Vào Tòa Alpha' },
      // Thư Viện / Phòng Họp / Phòng Kỷ Niệm đã dời vào trong sảnh Alpha (alpha_interior)
      // — phân cấp: phòng học đi qua nội thất Tòa Alpha, không vào thẳng từ sân.
      { x: 150, y: 615, targetRoomId: 'dorm_room', targetSpawn: { x: 384, y: 400 }, label: 'Ký Túc Xá' },
      { x: 1336, y: 400, targetRoomId: 'web_room', targetSpawn: { x: 360, y: 240 }, label: 'Web & Media Hub' },
      { x: 1336, y: 550, targetRoomId: 'sports_complex', targetSpawn: { x: 340, y: 220 }, label: 'Khu Thể Thao' },
      { x: 600, y: 620, targetRoomId: 'canteen_cafe', targetSpawn: { x: 400, y: 250 }, label: 'Căn Tin & Cafe' },
      { x: 776, y: 690, targetRoomId: 'canteen_cafe', targetSpawn: { x: 400, y: 250 }, label: 'Căn Tin & Cafe' },
    ],
    zones: [
      { id: 'zone_main_frog', type: 'golden_frog_fortune', x: 717, y: 450, name: 'Linh Vật Cóc Vàng FUDA', label: 'Bái Cóc Vàng' },
      { id: 'zone_main_campus_map', type: 'campus_map', x: 680, y: 560, name: 'Sơ Đồ Bản Đồ Toàn Cảnh FUDA', label: 'Bản Đồ FPTU' },
      { id: 'zone_main_slides', type: 'whiteboard_slides', x: 550, y: 275, name: 'Màn Chiếu Sảnh Đón Tiếp', label: 'Slide CLB' },
      { id: 'zone_main_meeting', type: 'meeting_stage', x: 717, y: 350, name: 'Sân Khấu Họp Toàn Thể', label: 'Họp Video' },
      { id: 'zone_main_coffee', type: 'coffee_lofi', x: 1140, y: 480, name: 'Vườn Trà FUDA & Thư Giãn', label: 'Lofi & Pomodoro' },
      // Cầu thang lên khu gian hàng đã dời vào sảnh Alpha (cổng 'Khu Gian Hàng CLB'
      // trong alpha_interior, targetFloor 1) — sân chỉ còn cổng ngoài trời.
      { id: 'zone_main_fishing', type: 'job_fishing', x: 405, y: 460, name: 'Hồ Vịt Câu Cá', label: 'Câu Cá Kiếm D-Coin', metadata: { job: 'fishing' } }
    ],
    decorations: [
      // Tượng + vườn hoa đã vẽ trực tiếp trong art V2 — không spawn sprite trùng.
    ],
    floors: [
      {
        floorIndex: 0,
        name: 'Tòa Alpha — Tầng 1 (Sảnh Đón Tiếp & Hội Trường)',
        description: 'Hội trường trung tâm FUDA, tượng Cóc Vàng và kết nối 6 phân khu chức năng.',
        spawnPoint: { x: 746, y: 620 },
        // Hybrid painted map (giống top-level): nền vẽ tay V2, layout tile làm fallback.
        paintedBackground: {
          imageKey: 'map_alpha_v2',
          imagePath: 'devertown_map_v2_debanded.jpg', // public/ served at root
          width: 1376, height: 768,
          spawnPoint: { x: 746, y: 620 },
          collisionRects: [
            // border walls
            { x: 0, y: 0, w: 1376, h: 16 }, { x: 0, y: 752, w: 1376, h: 16 },
            { x: 0, y: 0, w: 16, h: 768 }, { x: 1360, y: 0, w: 16, h: 768 },
            // Alpha building facade + entrance stairs
            { x: 475, y: 0, w: 543, h: 265 }, { x: 1008, y: 105, w: 82, h: 160 },
            // Duck pond water (chặn vùng nước thực tế x: 65..390, y: 290..580)
            { x: 65, y: 290, w: 325, h: 290 },
            // Central fountain (bể đá đài phun nước tròn tâm 717, 450)
            { x: 664, y: 398, w: 106, h: 105 },
            // Flower beds trên bên trái (bồn hoa gỗ dài & bồn vuông hoa đỏ)
            { x: 555, y: 312, w: 125, h: 36 }, { x: 515, y: 315, w: 42, h: 80 },
            // Flower beds trên bên phải (bồn hoa gỗ dài & bồn vuông bụi cây)
            { x: 752, y: 312, w: 124, h: 36 }, { x: 876, y: 315, w: 44, h: 80 },
            // Bãi cỏ dưới bên trái (bụi hoa lớn)
            { x: 345, y: 525, w: 215, h: 115 },
            // Bãi cỏ dưới bên phải (bồn hoa gỗ & ghế gỗ đứng)
            { x: 842, y: 545, w: 118, h: 35 }, { x: 932, y: 580, w: 26, h: 75 },
            // Thinker statue & pedestal (tượng người suy tưởng & bệ đá)
            { x: 1138, y: 325, w: 70, h: 143 },
            // Benches xung quanh tượng người suy tưởng
            { x: 1080, y: 348, w: 58, h: 38 }, { x: 1210, y: 348, w: 58, h: 38 },
            { x: 1078, y: 522, w: 58, h: 30 }, { x: 1210, y: 522, w: 58, h: 30 },
            { x: 1052, y: 366, w: 26, h: 158 }, { x: 1278, y: 386, w: 24, h: 148 },
            // Hàng rào hoa bao quanh vườn tượng bên phải
            { x: 1050, y: 260, w: 280, h: 55 }, { x: 1300, y: 260, w: 76, h: 400 },
            // Hàng cây xanh rìa trái
            { x: 16, y: 30, w: 70, h: 640 },
          ],
        },
        layout: [
          [  2,  2,  2, 10, 10, 10,  2, 10,  2, 20, 20,  2, 21, 21, 10, 20, 20,  2, 10,  2, 10,  2,  2,  0,  0 ],
          [  2, 13, 11, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 13,  0,  7 ],
          [  2, 23, 23, 23,  4,  4, 23, 23,  4,  4, 23, 23, 23, 23, 23,  4,  4, 23, 23,  4,  4, 23, 23,  0,  5 ],
          [  2, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,  5,  5 ],
          [  2, 23,  4, 23, 23,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6, 23, 23,  4, 23, 23,  0,  5 ],
          [  2, 23,  4, 23, 23,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6, 23, 23,  4, 23, 23,  7,  5 ],
          [  2, 23, 23, 23, 23,  6,  6,  6,  6,  6, 19, 19, 19,  6,  6,  6,  6,  6, 23, 23, 23, 23, 23,  0,  5 ],
          [ 10, 23, 23, 23, 23,  6,  6,  6,  6,  6, 19, 19, 19,  6,  6,  6,  6,  6, 23, 23, 23, 23, 10,  5,  5 ],
          [  2, 23, 23, 23, 23,  6,  6,  6,  6,  6, 19, 19, 19,  6,  6,  6,  6,  6, 23, 23, 23, 23, 23,  5,  0 ],
          [  2, 23,  4, 23, 23,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6, 23, 23,  4, 23, 23,  7,  0 ],
          [  2, 23,  4, 23, 23,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6, 23, 23,  4, 23, 23,  0,  0 ],
          [  2, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,  5,  5 ],
          [  2, 23,  4, 23, 23,  4,  4, 23, 23,  4,  4, 23, 23,  4,  4, 23, 23,  4,  4, 23, 23,  4, 23,  5,  7 ],
          [ 10, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,  5, 10 ],
          [  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2, 10, 10,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  5,  0 ],
          [  0,  0,  7,  0, 22, 22,  0,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  0, 22, 22,  0,  7,  5,  0 ],
          [  0, 42, 42, 42, 42, 42,  0,  5,  0,  0,  0,  7,  0,  0,  0,  7,  0,  5,  0,  0,  0,  0,  0,  5,  0 ],
          [  0, 42, 42, 42, 42, 42,  0,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  0,  0,  7,  0,  0,  5,  0 ],
          [  0, 42, 42, 42, 42, 42,  0,  0,  0,  7,  0,  0,  0,  0,  7,  0,  0,  0,  0,  7,  0,  0,  0,  7,  0 ]
        ],
        portals: [
          { x: 746, y: 290, targetRoomId: 'alpha_interior', targetSpawn: { x: 680, y: 580 }, label: 'Vào Tòa Alpha' },
          // (giống top-level) Thư Viện / Phòng Họp / Phòng Kỷ Niệm đã dời vào sảnh Alpha.
          { x: 150, y: 615, targetRoomId: 'dorm_room', targetSpawn: { x: 384, y: 400 }, label: 'Ký Túc Xá' },
          { x: 1336, y: 400, targetRoomId: 'web_room', targetSpawn: { x: 360, y: 240 }, label: 'Web & Media Hub' },
          { x: 1336, y: 550, targetRoomId: 'sports_complex', targetSpawn: { x: 340, y: 220 }, label: 'Khu Thể Thao' },
          { x: 600, y: 620, targetRoomId: 'canteen_cafe', targetSpawn: { x: 400, y: 250 }, label: 'Căn Tin & Cafe' },
          { x: 776, y: 690, targetRoomId: 'canteen_cafe', targetSpawn: { x: 400, y: 250 }, label: 'Căn Tin & Cafe' },
        ],
        zones: [
          { id: 'zone_main_frog', type: 'golden_frog_fortune', x: 717, y: 450, name: 'Linh Vật Cóc Vàng FUDA', label: 'Bái Cóc Vàng' },
          { id: 'zone_main_campus_map', type: 'campus_map', x: 680, y: 560, name: 'Sơ Đồ Bản Đồ Toàn Cảnh FUDA', label: 'Bản Đồ FPTU' },
          { id: 'zone_main_slides', type: 'whiteboard_slides', x: 550, y: 275, name: 'Màn Chiếu Sảnh Đón Tiếp', label: 'Slide CLB' },
          { id: 'zone_main_meeting', type: 'meeting_stage', x: 717, y: 350, name: 'Sân Khấu Họp Toàn Thể', label: 'Họp Video' },
          { id: 'zone_main_coffee', type: 'coffee_lofi', x: 1140, y: 480, name: 'Vườn Trà FUDA & Thư Giãn', label: 'Lofi & Pomodoro' },
          // (giống top-level) Cầu thang lên gian hàng đã dời vào sảnh Alpha.
          { id: 'zone_main_fishing', type: 'job_fishing', x: 405, y: 460, name: 'Hồ Vịt Câu Cá', label: 'Câu Cá Kiếm D-Coin', metadata: { job: 'fishing' } }
        ],
        decorations: [
          // Tượng + vườn hoa đã vẽ trực tiếp trong art V2 — không spawn sprite trùng.
        ]
      },
      {
        floorIndex: 1,
        name: 'Tòa Alpha — Tầng 2 (Hub Học Thuật, Công Nghệ & Khởi Nghiệp)',
        description: 'Trung tâm học thuật quy tụ các CLB Công nghệ tiên phong, Khởi nghiệp & Ngôn ngữ quốc tế.',
        spawnPoint: { x: 112, y: 80 },
        layout: [
          [  2,  2,  2,  2,  2, 20, 20,  2,  2, 21, 21,  2,  2,  2,  2, 20, 20,  2,  2,  2,  2,  2,  2,  2,  2 ],
          [  2, 13, 11, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 11, 13,  2 ],
          [  2, 23, 23, 23,  4,  4, 23, 23,  4,  4, 23, 23, 23, 23,  4,  4, 23, 23,  4,  4, 23, 23, 23, 23,  2 ],
          [  2, 23, 23, 23,  8,  4, 23, 23, 12,  4, 23, 23, 23, 23,  9,  4, 23, 23,  8,  4, 23, 23, 23, 23,  2 ],
          [  2, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,  2 ],
          [  2, 23, 23, 23,  6,  6,  6,  6,  6,  6,  6, 23, 23,  6,  6,  6,  6,  6,  6,  6, 23, 23, 23, 23,  2 ],
          [  2, 23, 23, 23,  6,  4,  4,  6,  6,  4,  4,  6, 23,  6,  4,  4,  6,  6,  4,  4,  6, 23, 23, 23,  2 ],
          [  2, 23, 23, 23,  6,  4,  4,  6,  6,  4,  4,  6, 23,  6,  4,  4,  6,  6,  4,  4,  6, 23, 23, 23,  2 ],
          [  2, 23, 23, 23,  6,  6,  6,  6,  6,  6,  6, 23, 23,  6,  6,  6,  6,  6,  6,  6, 23, 23, 23, 23,  2 ],
          [  2, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,  2 ],
          [  2, 23, 23, 23, 11, 11, 11, 11, 23, 23, 11, 11, 11, 11, 23, 23, 11, 11, 11, 11, 23, 23, 23, 23,  2 ],
          [  2, 23, 23, 23, 11,  4,  4, 11, 23, 23, 11,  4,  4, 11, 23, 23, 11,  4,  4, 11, 23, 23, 23, 23,  2 ],
          [  2, 23, 23, 23, 11,  7,  4, 11, 23, 23, 11,  7,  4, 11, 23, 23, 11,  7,  4, 11, 23, 23, 23, 23,  2 ],
          [  2, 23, 23, 23, 11, 11, 11, 11, 23, 23, 11, 11, 11, 11, 23, 23, 11, 11, 11, 11, 23, 23, 23, 23,  2 ],
          [  2, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,  2 ],
          [  2, 13, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 13,  2 ],
          [  2, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,  2 ],
          [  2, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,  2 ],
          [  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2 ]
        ],
        portals: [],
        zones: [
          { id: 'zone_main_stair_f2_f1', type: 'stair_transition', tileX: 2, tileY: 1, targetFloor: 0, name: 'Cầu Thang Xuống Tầng 1', label: 'Xuống Tầng 1' },
          { id: 'zone_main_stair_f2_f3', type: 'stair_transition', tileX: 22, tileY: 1, targetFloor: 2, name: 'Cầu Thang Lên Tầng 3', label: 'Lên Tầng 3' },
          { id: 'booth_dever', type: 'club_booth', clubId: 'dever', tileX: 5, tileY: 3, name: 'Gian Hàng CLB Lập Trình FU-DEVER (#5)', label: 'CLB DEVER' },
          { id: 'booth_itsc', type: 'club_booth', clubId: 'itsc', tileX: 9, tileY: 3, name: 'Gian Hàng CLB Công Nghệ Đổi Mới ITSC (#10)', label: 'CLB ITSC' },
          { id: 'booth_src', type: 'club_booth', clubId: 'src', tileX: 15, tileY: 3, name: 'Gian Hàng CLB An Toàn Thông Tin SRC (#15)', label: 'CLB SRC' },
          { id: 'booth_resup', type: 'club_booth', clubId: 'resup', tileX: 5, tileY: 7, name: 'Gian Hàng Nghiên Cứu & Khởi Nghiệp RESUP (#24)', label: 'CLB RESUP' },
          { id: 'booth_fic', type: 'club_booth', clubId: 'fic', tileX: 9, tileY: 7, name: 'Gian Hàng Tài Chính & Đầu Tư FIC (#4)', label: 'CLB FIC' },
          { id: 'booth_tss', type: 'club_booth', clubId: 'tss', tileX: 15, tileY: 7, name: 'Gian Hàng Khởi Nghiệp Trẻ TSS (#13)', label: 'CLB TSS' },
          { id: 'booth_mirai_jc', type: 'club_booth', clubId: 'mirai_jc', tileX: 5, tileY: 12, name: 'Gian Hàng Tiếng Nhật MIRAI-JC (#16)', label: 'MIRAI-JC' },
          { id: 'booth_fkc', type: 'club_booth', clubId: 'fkc', tileX: 11, tileY: 12, name: 'Gian Hàng Tiếng Hàn FKC (#25)', label: 'CLB FKC' },
          { id: 'booth_fucc', type: 'club_booth', clubId: 'fucc', tileX: 17, tileY: 12, name: 'Gian Hàng Tiếng Trung FUCC (#7)', label: 'CLB FUCC' }
        ]
      },
      {
        floorIndex: 2,
        name: 'Tòa Alpha — Tầng 3 (Hub Nghệ Thuật, Kỹ Năng & Sự Kiện)',
        description: 'Không gian sáng tạo, nghệ thuật, âm nhạc và bảng vàng vinh danh thể thao sinh viên FPTU.',
        spawnPoint: { x: 680, y: 80 },
        layout: [
          [  2,  2,  2,  2,  2, 20, 20,  2,  2, 21, 21,  2,  2,  2,  2, 20, 20,  2,  2,  2,  2,  2,  2,  2,  2 ],
          [  2, 13, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 11, 13,  2 ],
          [  2, 23, 23, 23,  4,  4, 23, 23,  4,  4, 23, 23, 23, 23,  4,  4, 23, 23,  4,  4, 23, 23, 23, 23,  2 ],
          [  2, 23, 23, 23, 16,  4, 23, 23, 12,  4, 23, 23, 23, 23, 29,  4, 23, 23, 16,  4, 23, 23, 23, 23,  2 ],
          [  2, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,  2 ],
          [  2, 23, 23, 23,  6,  6,  6,  6,  6,  6,  6, 23, 23,  6,  6,  6,  6,  6,  6,  6, 23, 23, 23, 23,  2 ],
          [  2, 23, 23, 23,  6,  4,  4,  6,  6,  4,  4,  6, 23,  6,  4,  4,  6,  6,  4,  4,  6, 23, 23, 23,  2 ],
          [  2, 23, 23, 23,  6,  4,  4,  6,  6,  4,  4,  6, 23,  6,  4,  4,  6,  6,  4,  4,  6, 23, 23, 23,  2 ],
          [  2, 23, 23, 23,  6,  6,  6,  6,  6,  6,  6, 23, 23,  6,  6,  6,  6,  6,  6,  6, 23, 23, 23, 23,  2 ],
          [  2, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,  2 ],
          [  2, 23, 23, 23,  1,  1,  1,  1, 23, 23,  1,  1,  1,  1, 23, 23, 17, 17, 17, 17, 23, 23, 23, 23,  2 ],
          [  2, 23, 23, 23,  1,  4,  4,  1, 23, 23,  1,  4,  4,  1, 23, 23, 17,  4,  4, 17, 23, 23, 23, 23,  2 ],
          [  2, 23, 23, 23,  1, 16,  4,  1, 23, 23,  1, 14, 31,  1, 23, 23, 17, 17, 17, 17, 23, 23, 23, 23,  2 ],
          [  2, 23, 23, 23,  1,  1,  1,  1, 23, 23,  1,  1,  1,  1, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,  2 ],
          [  2, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,  2 ],
          [  2, 13, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 13,  2 ],
          [  2, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,  2 ],
          [  2, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,  2 ],
          [  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2 ]
        ],
        portals: [],
        zones: [
          { id: 'zone_main_stair_f3_f2', type: 'stair_transition', tileX: 22, tileY: 1, targetFloor: 1, name: 'Cầu Thang Xuống Tầng 2', label: 'Xuống Tầng 2' },
          { id: 'booth_fcs', type: 'club_booth', clubId: 'fcs', tileX: 5, tileY: 3, name: 'Gian Hàng Sáng Tạo FCS (#20)', label: 'CLB FCS' },
          { id: 'booth_fum', type: 'club_booth', clubId: 'fum', tileX: 9, tileY: 3, name: 'Gian Hàng Truyền Thông FUM (#1)', label: 'CLB FUM' },
          { id: 'booth_evo', type: 'club_booth', clubId: 'evo', tileX: 15, tileY: 3, name: 'Gian Hàng Sự Kiện EVo (#23)', label: 'CLB EVo' },
          { id: 'booth_f2k', type: 'club_booth', clubId: 'f2k', tileX: 5, tileY: 7, name: 'Gian Hàng Thiện Nguyện F2K (#6)', label: 'CLB F2K' },
          { id: 'booth_fenious', type: 'club_booth', clubId: 'fenious', tileX: 9, tileY: 7, name: 'Gian Hàng Ẩm Thực FENIOUS (#12)', label: 'FENIOUS' },
          { id: 'booth_tia', type: 'club_booth', clubId: 'tia', tileX: 15, tileY: 7, name: 'Gian Hàng Nhạc Cụ Dân Tộc TIA (#21)', label: 'CLB TIA' },
          { id: 'booth_rhythm', type: 'club_booth', clubId: 'rhythm', tileX: 5, tileY: 12, name: 'Xưởng Làm Nhạc RHYTHM (#2)', label: 'RHYTHM' },
          { id: 'booth_mic', type: 'club_booth', clubId: 'mic', tileX: 11, tileY: 12, name: 'Gian Hàng MC & Hùng Biện MIC (#17)', label: 'CLB MIC' },
          { id: 'booth_dance', type: 'club_booth', clubId: 'dfp', tileX: 15, tileY: 12, name: 'Sàn Vũ Đạo DfP (#8) & Noise Makers (#9)', label: 'DfP & Noise' },
          { id: 'booth_sports_hall', type: 'club_booth', clubId: 'fufc', tileX: 18, tileY: 12, name: 'Bảng Vàng Thể Thao FPTU (FUFC, FHG, FUB, FDN, VCT, FVC)', label: 'Thể Thao FUDA' }
        ]
      }
    ]
  },

  alpha_interior: {
    id: 'alpha_interior',
    name: 'Tòa Alpha - Nội Thất Sảnh & Lab',
    description: 'Sảnh lễ tân trong nhà Tòa Alpha: quầy lễ tân, phòng lab nhìn qua vách kính, cầu thang lên tầng 2.',
    // Phase C — Cờ vùng: 'safe' = vùng an toàn tuyệt đối (nội thất Tòa Alpha).
    zone: 'safe',
    // Hybrid painted map: nền vẽ tay V1 cho nội thất Tòa Alpha (1376x768),
    // cùng họ palette với sân V2 (gỗ ấm, kem, teal). layout tile giữ lại làm
    // fallback nếu texture chưa load.
    paintedBackground: {
      imageKey: 'map_alpha_interior',
      imagePath: 'devertown_alpha_interior_v3.jpg', // public/ served at root
      width: 1376, height: 768,
      spawnPoint: { x: 680, y: 580 },
      collisionRects: [
        // border walls (khung gỗ bao quanh)
        { x: 0, y: 0, w: 1376, h: 18 }, { x: 0, y: 750, w: 1376, h: 18 },
        { x: 0, y: 0, w: 18, h: 768 }, { x: 1358, y: 0, w: 18, h: 768 },
        // tường trên: cửa sổ, bảng tin
        { x: 18, y: 18, w: 1340, h: 214 },
        // Kệ cúp vàng
        { x: 775, y: 175, w: 72, h: 180 },
        // cầu thang lên tầng 2 (cánh phải - thân cầu thang và chân bậc)
        { x: 1080, y: 30, w: 278, h: 280 },
        { x: 1025, y: 225, w: 60, h: 185 },
        { x: 1070, y: 280, w: 100, h: 120 },
        // cánh lab trái: vách kính + nội thất lab
        { x: 18, y: 18, w: 335, h: 712 },
        // chậu cây và ghế dọc vách kính lab bên trái
        { x: 355, y: 200, w: 55, h: 140 },
        { x: 355, y: 440, w: 55, h: 95 },
        { x: 355, y: 535, w: 55, h: 210 },
        // quầy lễ tân tròn (khớp chính xác vòng tròn gỗ tâm 690, 435)
        { x: 595, y: 355, w: 180, h: 155 },
        // tường ngăn phía dưới (chặn dẫm lên tường gỗ, chừa cửa mở thông thoáng x: 615-760)
        { x: 0, y: 668, w: 615, h: 100 },
        { x: 760, y: 668, w: 616, h: 100 },
        // sofa góc thư giãn (cánh phải)
        { x: 1108, y: 405, w: 122, h: 80 }, // sofa ngang
        { x: 1074, y: 450, w: 64, h: 44 },  // bàn trà cạnh sofa ngang
        { x: 1238, y: 430, w: 62, h: 140 }, // sofa dọc trên
        { x: 1205, y: 725, w: 60, h: 42 },  // bàn trà cạnh sofa dọc dưới
        { x: 1238, y: 580, w: 62, h: 145 }, // sofa dọc dưới
        // chậu cây góc phải
        { x: 1120, y: 350, w: 180, h: 55 },
      ],
    },
    spawnPoint: { x: 680, y: 580 },
    layout: [
      [  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2 ],
      [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
      [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
      [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
      [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
      [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
      [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
      [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
      [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
      [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
      [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
      [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
      [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
      [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
      [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
      [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
      [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
      [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
      [  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2 ]
    ],
    portals: [
      { x: 680, y: 720, targetRoomId: 'main_hall', targetSpawn: { x: 746, y: 330 }, label: 'Ra Sân Tòa Alpha' },
      { x: 445, y: 255, targetRoomId: 'dever_lab', targetSpawn: { x: 650, y: 700 }, label: 'Phòng Lab Hóa' },
      { x: 445, y: 610, targetRoomId: 'dever_lab', targetSpawn: { x: 650, y: 700 }, label: 'Phòng Server' },
      // Phân cấp phòng học: vào qua nội thất Tòa Alpha (dời từ sân ngoài trời).
      { x: 700, y: 280, targetRoomId: 'library_lounge', targetSpawn: { x: 400, y: 350 }, label: 'Sang Thư Viện' },
      { x: 1000, y: 520, targetRoomId: 'meeting_room', targetSpawn: { x: 400, y: 336 }, label: 'Sang Phòng Họp & Lớp Học' },
      { x: 950, y: 280, targetRoomId: 'memory_room', targetSpawn: { x: 360, y: 240 }, label: 'Sang Phòng Kỷ Niệm' },
      // Khu gian hàng triển lãm CLB = main_hall tầng 2 (targetFloor 1).
      { x: 1055, y: 350, targetRoomId: 'main_hall', targetFloor: 1, targetSpawn: { x: 112, y: 80 }, labelKey: 'portals.main_hall_booths', label: 'Khu Gian Hàng CLB' },
    ],
    zones: [
      { id: 'zone_alpha_reception', type: 'club_booth', x: 690, y: 520, name: 'Quầy Lễ Tân Tòa Alpha', label: 'Quầy Lễ Tân' },
      { id: 'zone_alpha_notice', type: 'whiteboard_slides', x: 548, y: 260, name: 'Bảng Tin Hoạt Động CLB', label: 'Bảng Tin CLB' },
      { id: 'zone_alpha_lofi', type: 'coffee_lofi', x: 1105, y: 430, name: 'Góc Lofi Thư Giãn', label: 'Góc Thư Giãn' },
      { id: 'zone_alpha_stair_up', type: 'stair_transition', x: 1055, y: 350, name: 'Cầu Thang Lên Tầng 2', label: 'Lên Tầng 2', targetFloor: 1 },
    ],
    decorations: [
      // Nội thất đã vẽ trực tiếp trong art V1 — không spawn sprite trùng.
    ],
    floors: [
      {
        floorIndex: 0,
        name: 'Tòa Alpha — Tầng Trệt (Sảnh Lễ Tân)',
        description: 'Sảnh lễ tân trong nhà Tòa Alpha: quầy lễ tân, phòng lab nhìn qua vách kính, cầu thang lên tầng 2.',
        spawnPoint: { x: 680, y: 580 },
        // Hybrid painted map (giống top-level): nền vẽ tay V1, layout tile làm fallback.
        paintedBackground: {
          imageKey: 'map_alpha_interior',
          imagePath: 'devertown_alpha_interior_v3.jpg', // public/ served at root
          width: 1376, height: 768,
          spawnPoint: { x: 680, y: 580 },
          collisionRects: [
            // border walls (khung gỗ bao quanh)
            { x: 0, y: 0, w: 1376, h: 18 }, { x: 0, y: 750, w: 1376, h: 18 },
            { x: 0, y: 0, w: 18, h: 768 }, { x: 1358, y: 0, w: 18, h: 768 },
            // tường trên: cửa sổ, bảng tin
            { x: 18, y: 18, w: 1340, h: 214 },
            // Kệ cúp vàng
            { x: 775, y: 175, w: 72, h: 180 },
            // cầu thang lên tầng 2 (cánh phải - thân cầu thang và chân bậc)
            { x: 1080, y: 30, w: 278, h: 280 },
            { x: 1025, y: 225, w: 60, h: 185 },
            { x: 1070, y: 280, w: 100, h: 120 },
            // cánh lab trái: vách kính + nội thất lab
            { x: 18, y: 18, w: 335, h: 712 },
            // chậu cây và ghế dọc vách kính lab bên trái
            { x: 355, y: 200, w: 55, h: 140 },
            { x: 355, y: 440, w: 55, h: 95 },
            { x: 355, y: 535, w: 55, h: 210 },
            // quầy lễ tân tròn (khớp chính xác vòng tròn gỗ tâm 690, 435)
            { x: 595, y: 355, w: 180, h: 155 },
            // tường ngăn phía dưới (chặn dẫm lên tường gỗ, chừa cửa mở thông thoáng x: 615-760)
            { x: 0, y: 668, w: 615, h: 100 },
            { x: 760, y: 668, w: 616, h: 100 },
            // sofa góc thư giãn (cánh phải)
            { x: 1108, y: 405, w: 122, h: 80 }, // sofa ngang
            { x: 1074, y: 450, w: 64, h: 44 },  // bàn trà cạnh sofa ngang
            { x: 1238, y: 430, w: 62, h: 140 }, // sofa dọc trên
            { x: 1205, y: 725, w: 60, h: 42 },  // bàn trà cạnh sofa dọc dưới
            { x: 1238, y: 580, w: 62, h: 145 }, // sofa dọc dưới
            // chậu cây góc phải
            { x: 1120, y: 350, w: 180, h: 55 },
          ],
        },
        layout: [
          [  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2 ],
          [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
          [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
          [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
          [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
          [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
          [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
          [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
          [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
          [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
          [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
          [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
          [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
          [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
          [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
          [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
          [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
          [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
          [  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2 ]
        ],
        portals: [
          { x: 680, y: 720, targetRoomId: 'main_hall', targetSpawn: { x: 746, y: 330 }, label: 'Ra Sân Tòa Alpha' },
          { x: 445, y: 255, targetRoomId: 'dever_lab', targetSpawn: { x: 650, y: 700 }, label: 'Phòng Lab Hóa' },
          { x: 445, y: 610, targetRoomId: 'dever_lab', targetSpawn: { x: 650, y: 700 }, label: 'Phòng Server' },
          // (giống top-level) Phân cấp phòng học qua nội thất Tòa Alpha.
          { x: 700, y: 280, targetRoomId: 'library_lounge', targetSpawn: { x: 400, y: 350 }, label: 'Sang Thư Viện' },
          { x: 1000, y: 520, targetRoomId: 'meeting_room', targetSpawn: { x: 400, y: 336 }, label: 'Sang Phòng Họp & Lớp Học' },
          { x: 950, y: 280, targetRoomId: 'memory_room', targetSpawn: { x: 360, y: 240 }, label: 'Sang Phòng Kỷ Niệm' },
          { x: 1055, y: 350, targetRoomId: 'main_hall', targetFloor: 1, targetSpawn: { x: 112, y: 80 }, labelKey: 'portals.main_hall_booths', label: 'Khu Gian Hàng CLB' },
        ],
        zones: [
          { id: 'zone_alpha_reception', type: 'club_booth', x: 690, y: 520, name: 'Quầy Lễ Tân Tòa Alpha', label: 'Quầy Lễ Tân' },
          { id: 'zone_alpha_notice', type: 'whiteboard_slides', x: 548, y: 260, name: 'Bảng Tin Hoạt Động CLB', label: 'Bảng Tin CLB' },
          { id: 'zone_alpha_lofi', type: 'coffee_lofi', x: 1105, y: 430, name: 'Góc Lofi Thư Giãn', label: 'Góc Thư Giãn' },
          { id: 'zone_alpha_stair_up', type: 'stair_transition', x: 1055, y: 350, name: 'Cầu Thang Lên Tầng 2', label: 'Lên Tầng 2', targetFloor: 1 },
        ],
        decorations: [
          // Nội thất đã vẽ trực tiếp trong art V1 — không spawn sprite trùng.
        ]
      },
      {
        floorIndex: 1,
        name: 'Tòa Alpha — Tầng 2 (Phòng Lab AI)',
        description: 'Phòng lab tầng 2: dãy server, bảng kiến trúc, bàn hackathon AI của hai đội Alpha & Beta.',
        spawnPoint: { x: 400, y: 528 },
        layout: [
          [ 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15 ],
          [ 15, 13,  9,  9,  9,  9,  9,  9,  9,  9, 12, 12,  9, 12, 12,  9,  9,  9,  9,  9,  9,  9,  9, 13, 15 ],
          [ 15,  9,  9,  8,  8,  8,  8,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  8,  8,  8,  8,  9,  9, 15 ],
          [ 15,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9, 15 ],
          [ 15,  9,  9,  9,  4,  4,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  4,  4,  9,  9,  9, 15 ],
          [ 15,  9,  9,  9,  4,  4,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  4,  4,  9,  9,  9, 15 ],
          [ 15,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9, 15 ],
          [ 15,  9,  9,  9,  9,  9,  9,  9,  9,  9,  6,  6,  6,  6,  6,  9,  9,  9,  9,  9,  9,  9,  9,  9, 15 ],
          [ 15,  9,  9,  9,  9,  9,  9,  9,  9,  9,  6,  6,  6,  6,  6,  9,  9,  9,  9,  9,  9,  9,  9,  9, 15 ],
          [ 15,  9,  9,  9,  9,  9,  9,  9,  9,  9,  6,  6,  6,  6,  6,  9,  9,  9,  9,  9,  9,  9,  9,  9, 15 ],
          [ 15,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9, 15 ],
          [ 15,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9, 15 ],
          [ 15,  9,  9,  9,  9,  9,  9,  9,  9,  9,  4,  4,  4,  4,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9, 15 ],
          [ 15,  9,  9,  9,  4,  4,  9,  9,  9,  9,  4,  4,  4,  4,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9, 15 ],
          [ 15,  9,  9,  9,  4,  4,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9, 15 ],
          [ 15,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9, 15 ],
          [ 15,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9, 15 ],
          [ 15, 13,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9, 15 ],
          [ 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15 ]
        ],
        portals: [],
        zones: [
          { id: 'zone_alpha_stair_down', type: 'stair_transition', tileX: 12, tileY: 16, targetFloor: 0, name: 'Cầu Thang Xuống Sảnh', label: 'Xuống Sảnh' },
          { id: 'zone_alpha_lab_board', type: 'whiteboard_slides', tileX: 10, tileY: 1, name: 'Bảng Kiến Trúc Lab', label: 'Bảng Lab' },
          { id: 'zone_alpha_lab_bench_a', type: 'code_editor', tileX: 4, tileY: 4, name: 'Bàn Lab AI Đội Alpha', label: 'Mở Code Sandbox' },
          { id: 'zone_alpha_lab_bench_b', type: 'code_editor', tileX: 19, tileY: 4, name: 'Bàn Lab AI Đội Beta', label: 'Mở Code Sandbox' }
        ]
      }
    ]
  },


  dever_lab: {
    id: 'dever_lab',
    name: 'Tòa Gamma - Tech & AI Lab (DEVER)',
    description: 'Không gian Hackathon, trạm máy chủ và góc lập trình chuyên sâu của thành viên CLB DEVER.',
    zone: 'safe',
    paintedBackground: {
      imageKey: 'map_dever_lab',
      imagePath: 'devertown_tech_lab_v2.jpg', // public/ served at root
      width: 1376, height: 768,
      spawnPoint: { x: 650, y: 700 },
      collisionRects: [
        // border walls
        { x: 0, y: 0, w: 1376, h: 115 },
        { x: 0, y: 0, w: 32, h: 768 },
        { x: 1344, y: 0, w: 32, h: 768 },
        // tường đáy phòng (chặn dẫm lên tường gỗ, chừa khe cửa chính x: 580-720)
        { x: 0, y: 728, w: 580, h: 40 },
        { x: 720, y: 728, w: 656, h: 40 },
        // cụm tủ Server Racks góc trên-trái
        { x: 32, y: 80, w: 315, h: 220 },
        // bảng Whiteboard 1 (bảng thông báo ghi chú bên trái)
        { x: 345, y: 115, w: 130, h: 185 },
        // bảng Whiteboard 2 (bảng sơ đồ kiến trúc hệ thống lớn)
        { x: 475, y: 95, w: 310, h: 205 },
        // kệ sách & tủ case đứng góc trên-giữa
        { x: 820, y: 110, w: 185, h: 185 },
        // khu Sofa Lounge góc trên-phải
        { x: 1080, y: 95, w: 200, h: 110 },
        { x: 1005, y: 235, w: 85, h: 105 },
        { x: 1260, y: 235, w: 65, h: 145 },
        { x: 1105, y: 250, w: 135, h: 65 },
        { x: 1080, y: 390, w: 175, h: 85 },
        // dãy bàn dev cá nhân tường trái
        { x: 32, y: 350, w: 105, h: 380 },
        // dãy bàn Hackathon trên (chặn mặt bàn & màn hình y: 270-405, chừa ghế ngồi y: 410-480)
        { x: 360, y: 270, w: 640, h: 135 },
        // dãy bàn Hackathon dưới (chặn mặt bàn & màn hình y: 540-675, chừa ghế ngồi y: 680-745)
        { x: 360, y: 540, w: 640, h: 135 },
        // quầy cà phê & máy espresso góc dưới-phải
        { x: 1200, y: 560, w: 144, h: 180 },
      ],
    },
    spawnPoint: { x: 650, y: 700 },
    layout: [
      [ 15, 15, 15, 15, 15, 21, 21, 15, 15, 12, 12, 15, 15, 12, 12, 15, 15, 21, 21, 15, 15, 15, 15, 15, 15 ],
      [ 15,  8,  8, 10,  9,  9,  9,  9,  8,  8,  8,  8,  9,  8,  8,  8,  8,  9,  9,  9,  9, 10,  8, 13, 15 ],
      [ 15,  8,  8,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  8,  9, 15 ],
      [ 15,  9,  9,  9,  4,  4,  9,  9,  4,  4,  4,  4,  9,  4,  4,  4,  4,  9,  9,  4,  4,  9,  9,  9, 15 ],
      [ 15,  9,  9,  9,  4,  4,  9,  9,  4,  4,  4,  4,  9,  4,  4,  4,  4,  9,  9,  4,  4,  9,  9,  9, 15 ],
      [ 15,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9, 15 ],
      [ 15, 13,  9,  9,  4,  4,  9,  9,  6,  6,  6,  6,  6,  6,  6,  6,  9,  9,  4,  4,  9,  9, 13,  9, 15 ],
      [ 15,  9,  9,  9,  4,  4,  9,  9,  6,  6,  6,  6,  6,  6,  6,  6,  9,  9,  4,  4,  9,  9,  9,  9, 15 ],
      [ 15,  9,  9,  9,  9,  9,  9,  9,  6,  6,  6, 19, 19,  6,  6,  6,  9,  9,  9,  9,  9,  9,  9,  9, 15 ],
      [ 15,  9,  9,  9,  4,  4,  9,  9,  6,  6,  6,  6,  6,  6,  6,  6,  9,  9,  4,  4,  9,  9,  9,  9, 15 ],
      [ 15,  9,  9,  9,  4,  4,  9,  9,  4,  4,  4,  4,  9,  4,  4,  4,  4,  9,  9,  4,  4,  9,  9,  9, 15 ],
      [ 15,  9,  9,  9,  9,  9,  9,  9,  4,  4,  4,  4,  9,  4,  4,  4,  4,  9,  9,  9,  9,  9,  9,  9, 15 ],
      [ 15, 13,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9, 13,  9, 15 ],
      [ 15,  8,  8,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  8,  8,  9, 15 ],
      [ 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,  9, 10, 10,  9, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15 ],
      [ 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15 ],
      [ 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15 ],
      [ 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15 ],
      [ 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15 ]
    ],
    portals: [
      { x: 650, y: 735, tileX: 12, tileY: 14, targetRoomId: 'alpha_interior', targetSpawn: { x: 680, y: 580 }, labelKey: 'portals.back_to_alpha', label: 'Về Sảnh Alpha' },
      { x: 1310, y: 130, tileX: 21, tileY: 1, targetRoomId: 'game_arcade', targetSpawn: { x: 400, y: 350 }, label: 'Sang Arcade & Robot' },
      { x: 260, y: 330, tileX: 3, tileY: 1, targetRoomId: 'server_dungeon', targetSpawn: { x: 384, y: 100 }, label: 'Xuống Hầm Sự Cố' }
    ],
    zones: [
      { id: 'zone_lab_hackathon_a1', type: 'sit_chair', x: 425, y: 440, name: 'Bàn Hackathon Alpha 1', label: 'Ngồi Ghế Hackathon Alpha 1', direction: 'up' },
      { id: 'zone_lab_hackathon_a3', type: 'sit_chair', x: 685, y: 440, name: 'Bàn Hackathon Alpha 3', label: 'Ngồi Ghế Hackathon Alpha 3', direction: 'up' },
      { id: 'zone_lab_hackathon_a5', type: 'sit_chair', x: 940, y: 440, name: 'Bàn Hackathon Alpha 5', label: 'Ngồi Ghế Hackathon Alpha 5', direction: 'up' },
      { id: 'zone_lab_hackathon_b1', type: 'sit_chair', x: 425, y: 710, name: 'Bàn Hackathon Beta 1', label: 'Ngồi Ghế Hackathon Beta 1', direction: 'up' },
      { id: 'zone_lab_hackathon_b2', type: 'sit_chair', x: 555, y: 710, name: 'Bàn Hackathon Beta 2', label: 'Ngồi Ghế Hackathon Beta 2', direction: 'up' },
      { id: 'zone_lab_hackathon_b3', type: 'sit_chair', x: 685, y: 710, name: 'Bàn Hackathon Beta 3', label: 'Ngồi Ghế Hackathon Beta 3', direction: 'up' },
      { id: 'zone_lab_hackathon_b4', type: 'sit_chair', x: 812, y: 710, name: 'Bàn Hackathon Beta 4', label: 'Ngồi Ghế Hackathon Beta 4', direction: 'up' },
      { id: 'zone_lab_hackathon_b5', type: 'sit_chair', x: 940, y: 710, name: 'Bàn Hackathon Beta 5', label: 'Ngồi Ghế Hackathon Beta 5', direction: 'up' },
      { id: 'zone_lab_sofa', type: 'sit_sofa', x: 1140, y: 195, name: 'Sofa Da Thư Giãn Lab', label: 'Ngồi Sofa Thư Giãn', direction: 'down' },
      { id: 'zone_lab_server', type: 'terminal_status', x: 195, y: 310, name: 'Cụm Trạm Server Racks CLB', label: 'Kiểm Tra Server CLB' },
      { id: 'zone_lab_whiteboard', type: 'whiteboard_slides', x: 630, y: 310, name: 'Bảng Sơ Đồ Kiến Trúc Lab', label: 'Xem Kiến Trúc Hệ Thống' },
      { id: 'zone_lab_coffee', type: 'coffee_machine', x: 1220, y: 590, name: 'Máy Pha Cà Phê Espresso', label: 'Pha Cà Phê Dev' }
    ]
  },

  game_arcade: {
    id: 'game_arcade',
    name: 'Tòa Gamma Plus - Arcade Gaming & Robot Studio',
    description: 'Không gian máy game arcade cổ điển, đấu robot và thử tài các mini-game của CLB DEVER.',
    spawnPoint: { x: 400, y: 450 },
    layout: [
      [ 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15 ],
      [ 15,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9, 15 ],
      [ 15,  9, 18, 18, 18,  9,  9, 18, 18, 18,  9,  9, 18, 18, 18,  9,  9, 18, 18, 18,  9,  9, 18,  9, 15 ],
      [ 15,  9, 18, 18, 18,  9,  9, 18, 18, 18,  9,  9, 18, 18, 18,  9,  9, 18, 18, 18,  9,  9, 18,  9, 15 ],
      [ 15,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9, 15 ],
      [ 15,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9, 15 ],
      [ 15,  9, 18, 18, 18,  9,  9, 18, 18, 18,  9,  9, 18, 18, 18,  9,  9, 18, 18, 18,  9,  9,  9,  9, 15 ],
      [ 15,  9, 18, 18, 18,  9,  9, 18, 18, 18,  9,  9, 18, 18, 18,  9,  9, 18, 18, 18,  9,  9,  9,  9, 15 ],
      [ 15,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9, 15 ],
      [ 15,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  4,  4,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9, 15 ],
      [ 15,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  4,  4,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9, 15 ],
      [ 15,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9, 15 ],
      [ 15,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9, 15 ],
      [ 15,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9, 15 ],
      [ 15,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9, 15 ],
      [ 15,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9, 15 ],
      [ 15,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9, 15 ],
      [ 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 10, 10, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15 ],
      [ 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15 ]
    ],
    portals: [
      { tileX: 12, tileY: 17, targetRoomId: 'dever_lab', targetSpawn: { x: 400, y: 450 }, label: 'Về Tech Lab' },
      { tileX: 13, tileY: 17, targetRoomId: 'main_hall', targetSpawn: { x: 746, y: 620 }, label: 'Về Sảnh Chính' }
    ],
    zones: [
      { id: 'zone_arcade_snake', type: 'arcade_games', defaultGame: 'snake', tileX: 4, tileY: 4, name: 'Máy Game: Rắn Săn Mồi Cyber Snake', label: 'Chơi Rắn Săn Mồi' },
      { id: 'zone_arcade_sokoban', type: 'arcade_games', defaultGame: 'sokoban', tileX: 10, tileY: 4, name: 'Máy Game: Buggy Đẩy Hộp (Sokoban)', label: 'Chơi Đẩy Hộp' },
      { id: 'zone_arcade_goldminer', type: 'arcade_games', defaultGame: 'goldminer', tileX: 16, tileY: 4, name: 'Máy Game: Cóc Vàng Đào Kho Báu', label: 'Chơi Đào Vàng' },
      { id: 'zone_arcade_robot_hub', type: 'robot_showcase', tileX: 21, tileY: 4, name: 'Trạm Trưng Bày & Tải Game Robot CLB', label: 'Tải Game Robot' },
      { id: 'zone_arcade_flappybug', type: 'arcade_games', defaultGame: 'flappybug', tileX: 4, tileY: 8, name: 'Máy Game: Flappy Buggy', label: 'Chơi Flappy Bug' },
      { id: 'zone_arcade_geometrydash', type: 'arcade_games', defaultGame: 'geometrydash', tileX: 10, tileY: 8, name: 'Máy Game: Dever Dash 3.0', label: 'Chơi Dever Dash' },
      { id: 'zone_arcade_match3', type: 'arcade_games', defaultGame: 'match3', tileX: 16, tileY: 8, name: 'Máy Game: Cyber Candy Match', label: 'Chơi Cyber Match' },
      { id: 'zone_arcade_pacman', type: 'arcade_games', defaultGame: 'pacman', tileX: 19, tileY: 8, name: 'Máy Game: Cyber Pac-Man', label: 'Chơi Pac-Man' },
      { id: 'zone_arcade_meeting', type: 'meeting_stage', tileX: 12, tileY: 11, name: 'Bàn Đấu Game & Livestream', label: 'Livestream Game' }
    ]
  },

  library_lounge: {
    id: 'library_lounge',
    name: 'Tòa Beta - Thư Viện Tri Thức & Phòng Tự Học',
    description: 'Không gian tự học yên tĩnh, tài liệu ôn thi SWE201c, quy chế CLB và quầy cà phê giao lưu.',
    // Phase C — Vùng an toàn (Masterplan: Thư Viện Tầng 3).
    zone: 'safe',
    paintedBackground: {
      imageKey: 'map_library_lounge',
      imagePath: 'devertown_library_lounge_v1.jpg',
      width: 1376, height: 768,
      spawnPoint: { x: 692, y: 680 },
      collisionRects: [
        // border walls
        { x: 0, y: 0, w: 940, h: 40 },
        { x: 940, y: 0, w: 436, h: 420 }, // Tủ sách cao kịch trần góc trên phải
        { x: 0, y: 0, w: 32, h: 768 },
        { x: 1344, y: 0, w: 32, h: 768 },
        // bottom walls chừa cửa ra vào x: 645 - 740
        { x: 0, y: 725, w: 645, h: 43 },
        { x: 740, y: 725, w: 636, h: 43 },
        // Tủ sách thấp & cây giữa 2 cửa sổ trên
        { x: 375, y: 320, w: 240, h: 100 },
        { x: 620, y: 330, w: 130, h: 90 },
        // Dãy tủ sách thấp đáy phòng bên trái
        { x: 60, y: 640, w: 540, h: 90 },
        // Bàn đọc nhỏ góc dưới và dãy tủ sách thấp đáy phòng bên phải
        { x: 775, y: 650, w: 120, h: 80 },
        { x: 940, y: 640, w: 400, h: 90 },
        // 3 Bàn học dài trung tâm (gồm bàn + ghế có sinh viên ngồi)
        { x: 140, y: 450, w: 160, h: 260 }, // Bàn 1 (trái)
        { x: 370, y: 450, w: 160, h: 260 }, // Bàn 2 (giữa)
        { x: 600, y: 450, w: 160, h: 260 }, // Bàn 3 (phải)
        // Khu sofa đọc sách thảm Ba Tư bên phải
        { x: 1010, y: 440, w: 90, h: 90 }, // Ghế bành trên-trái
        { x: 1180, y: 440, w: 90, h: 90 }, // Ghế bành trên-phải
        { x: 1095, y: 510, w: 85, h: 85 }, // Bàn tròn giữa thảm
        { x: 1010, y: 640, w: 90, h: 85 }, // Ghế bành dưới-trái
        { x: 1180, y: 640, w: 90, h: 85 }  // Ghế bành dưới-phải
      ]
    },
    spawnPoint: { x: 692, y: 680 },
    portals: [
      { x: 692, y: 735, tileX: 11, tileY: 13, targetRoomId: 'alpha_interior', targetSpawn: { x: 700, y: 350 }, labelKey: 'portals.back_to_alpha', label: 'Về Sảnh Alpha' }
    ],
    zones: [
      { id: 'zone_lib_swe', type: 'swe201c_guide', x: 1050, y: 380, name: 'Tủ Cẩm Nang Ôn Thi PE SWE201c', label: 'Cẩm Nang SWE201c' },
      { id: 'zone_lib_charter', type: 'dever_charter', x: 490, y: 420, name: 'Bàn Quy Chế Hoạt Động CLB', label: 'Quy Chế CLB' },
      { id: 'zone_lib_coffee', type: 'coffee_lofi', x: 835, y: 645, name: 'Quầy Cà Phê & Pomodoro', label: 'Cà Phê & Lofi' },
      { id: 'zone_lib_slides', type: 'whiteboard_slides', x: 860, y: 380, name: 'Khu Đọc Tài Liệu Ôn Thi', label: 'Tài Liệu Sách' },
      { id: 'zone_lib_code', type: 'code_editor', x: 230, y: 550, name: 'Bàn Tự Học & Sổ Tay', label: 'Sổ Tay & Code' },
      { id: 'zone_lib_sit_sofa', type: 'sit_sofa', x: 1135, y: 485, name: 'Sofa Đọc Sách Thư Viện', label: 'Ngồi Đọc Sách' },
      { id: 'zone_lib_sit_desk', type: 'sit_chair', x: 790, y: 530, name: 'Ghế Bàn Học Thư Viện', label: 'Ngồi Tự Học' }
    ]
  },

  memory_room: {
    id: 'memory_room',
    name: 'Phòng Triển Lãm Kỷ Niệm & Bảng Vàng FU-DEVER',
    description: 'Không gian bảo tàng lưu trữ các cột mốc FPT Edu Hackathon, Lễ vinh danh Cóc Vàng và lịch sử 9+ năm.',
    spawnPoint: { x: 360, y: 240 },
    layout: [
      [  2,  2,  2,  2,  2,  2,  2,  2,  2, 20, 20,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2 ],
      [  2, 16,  1, 16,  1, 16,  1, 17, 17,  1, 17, 17,  1, 16,  1, 16,  1, 16,  1, 17, 17,  1, 16, 13,  2 ],
      [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
      [  2,  1, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11,  1,  1,  2 ],
      [  2, 16, 11,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1, 11,  1, 16,  1,  2 ],
      [  2,  1, 11,  1, 17,  1,  4,  4,  1,  1, 19, 19,  1,  1,  4,  4,  1, 17,  1,  1, 11,  1,  1,  1,  2 ],
      [  2,  1, 11,  1,  1,  1,  1,  1,  1,  1, 19, 19,  1,  1,  1,  1,  1,  1,  1,  1, 11,  1, 10,  1,  2 ],
      [  2, 16, 11,  1, 17,  1,  4,  4,  1,  1,  1,  1,  1,  1,  4,  4,  1, 17,  1,  1, 11,  1,  1,  1,  2 ],
      [  2,  1, 11,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1, 11,  1, 16,  1,  2 ],
      [  2,  1, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11,  1,  1,  2 ],
      [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
      [  2, 16,  1, 16,  1, 16,  1, 17, 17,  1,  1,  1,  1, 17, 17,  1, 16,  1, 16,  1, 16,  1, 16, 13,  2 ],
      [  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2 ],
      [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0 ],
      [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0 ],
      [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0 ],
      [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0 ],
      [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0 ],
      [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0 ]
    ],
    portals: [
      { tileX: 22, tileY: 6, targetRoomId: 'alpha_interior', targetSpawn: { x: 950, y: 350 }, labelKey: 'portals.back_to_alpha', label: 'Về Sảnh Alpha' }
    ],
    zones: [
      {
        id: 'zone_mem_founding',
        type: 'gallery_memory',
        tileX: 3,
        tileY: 1,
        name: 'Hành Trình 9+ Năm FU-DEVER',
        label: 'Xem Lịch Sử CLB',
        metadata: {
          title: 'Hành Trình 9+ Năm Phát Triển FU-DEVER',
          date: '2017 - Nay',
          story: 'Khởi đầu từ một nhóm sinh viên đam mê lập trình tại FUDA, FU-DEVER đã vươn mình thành cộng đồng công nghệ uy tín.',
          imgId: 'founding'
        }
      },
      {
        id: 'zone_mem_hackathon',
        type: 'gallery_memory',
        tileX: 10,
        tileY: 1,
        name: '20+ Giải Thưởng ICPC & Hackathon',
        label: 'Xem Cúp Vinh Danh',
        metadata: {
          title: 'Bảng Vàng 20+ Giải Thưởng ICPC & Hackathon',
          date: '2020 - 2026',
          story: 'Thế hệ thành viên FU-DEVER liên tục ghi danh tại các kỳ thi Lập trình sinh viên Quốc tế ICPC và Hackathon toàn quốc.',
          imgId: 'hackathon'
        }
      },
      {
        id: 'zone_mem_teambuilding',
        type: 'gallery_memory',
        tileX: 17,
        tileY: 1,
        name: 'Work Hard - Play Hard Teambuilding',
        label: 'Xem Album Gắn Kết',
        metadata: {
          title: 'Teambuilding Biển Đà Nẵng & Sơn Trà',
          date: 'Hàng Năm',
          story: 'Những khoảnh khắc bùng nổ năng lượng, gắn kết tình đồng đội giữa các thế hệ thành viên FU-DEVER.',
          imgId: 'teambuilding'
        }
      },
      {
        id: 'zone_mem_workshop',
        type: 'gallery_memory',
        tileX: 1,
        tileY: 7,
        name: 'Chuỗi Workshop Tech Talk FUDA',
        label: 'Xem Workshop Chuyên Đề',
        metadata: {
          title: 'Chuỗi Workshop Tech Talk Chuyên Sâu',
          date: 'Hàng Tháng',
          story: 'Các buổi chia sẻ chuyên sâu về 2D Game, Web/Mobile App và Mô hình AI cho sinh viên toàn trường.',
          imgId: 'workshop'
        }
      }
    ]
  },

  web_room: {
    id: 'web_room',
    name: 'Web & Media Hub FU-DEVER',
    description: 'Trung tâm số của CLB: cổng học vụ FPTU, IT helpdesk, landing page, mạng xã hội và kho dự án FU-DEVER.',
    spawnPoint: { x: 380, y: 280 },
    layout: [
      [ 15, 15, 15, 15, 15, 15, 15, 15, 15, 21, 21, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15 ],
      [ 15,  8,  8, 18, 18, 18, 18,  8,  8,  8,  8, 18, 18, 18, 18,  8,  8, 18, 18, 18, 18,  8,  8, 13, 15 ],
      [ 15, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 15 ],
      [ 15, 18,  4,  4, 18, 18,  4,  4, 18, 18,  4,  4, 18, 18,  4,  4, 18, 18,  4,  4, 18, 18,  4, 18, 15 ],
      [ 15, 18,  4,  4, 18, 18,  4,  4, 18, 18,  4,  4, 18, 18,  4,  4, 18, 18,  4,  4, 18, 18,  4, 18, 15 ],
      [ 15, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 15 ],
      [ 15, 10, 18, 18,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6, 18, 18, 18, 18, 18, 18, 18, 18, 15 ],
      [ 15, 18, 18, 18,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6, 18, 18, 18, 18, 18, 18, 18, 18, 15 ],
      [ 15, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 15 ],
      [ 15, 18,  4,  4, 18, 18,  4,  4, 18, 18,  4,  4, 18, 18,  4,  4, 18, 18,  4,  4, 18, 18,  4, 18, 15 ],
      [ 15, 18,  4,  4, 18, 18,  4,  4, 18, 18,  4,  4, 18, 18,  4,  4, 18, 18,  4,  4, 18, 18,  4, 18, 15 ],
      [ 15, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 15 ],
      [ 15,  8,  8, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18,  8,  8, 13, 15 ],
      [ 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15 ],
      [ 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15 ],
      [ 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15 ],
      [ 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15 ],
      [ 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15 ],
      [ 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15 ]
    ],
    portals: [
      { tileX: 1, tileY: 6, targetRoomId: 'main_hall', targetSpawn: { x: 1280, y: 400 }, label: 'Về Sảnh Chính' }
    ],
    zones: [
      {
        id: 'zone_web_fptu_portal',
        type: 'fptu_student_portal',
        tileX: 7,
        tileY: 3,
        name: 'Trạm IT Helpdesk & Cổng Phần Mềm Thi',
        label: 'Phần Mềm Thi'
      },
      {
        id: 'zone_web_main',
        type: 'club_website',
        tileX: 11,
        tileY: 6,
        name: 'Landing Page Chính Thức FU-DEVER',
        label: 'Mở Landing Page',
        metadata: {
          url: 'https://www.fudever.com/',
          title: 'FU-DEVER LANDING PAGE - WORK HARD PLAY HARD'
        }
      },
      {
        id: 'zone_web_member_portal',
        type: 'club_website',
        tileX: 3,
        tileY: 3,
        name: 'Member Portal - Hệ Thống Thành Viên',
        label: 'Mở Member Portal',
        metadata: {
          url: 'https://client.fudever.com',
          title: 'FU-DEVER MEMBER PORTAL'
        }
      },
      {
        id: 'zone_web_projects',
        type: 'club_website',
        tileX: 19,
        tileY: 3,
        name: 'Kho Dự Án (2D Game, AI, Web, Mobile)',
        label: 'Showcase Sản Phẩm',
        metadata: {
          url: 'https://github.com/fudever-club',
          title: 'KHO SẢN PHẨM & DỰ ÁN FU-DEVER'
        }
      },
      {
        id: 'zone_web_facebook',
        type: 'club_website',
        tileX: 11,
        tileY: 3,
        name: 'Trạm Fanpage Facebook FU-DEVER',
        label: 'Xem Fanpage',
        metadata: {
          url: 'https://www.facebook.com/FPTUDever',
          title: 'FANPAGE CHÍNH THỨC FU-DEVER'
        }
      },
      {
        id: 'zone_web_tiktok',
        type: 'club_website',
        tileX: 15,
        tileY: 3,
        name: 'Trạm TikTok & Media FUDA',
        label: 'Kênh TikTok',
        metadata: {
          url: 'https://www.tiktok.com/@daihocfptdanang',
          title: 'KÊNH TIKTOK FUDA'
        }
      },
      {
        id: 'zone_web_github',
        type: 'club_website',
        tileX: 22,
        tileY: 3,
        name: 'Trạm GitHub Organization FU-DEVER',
        label: 'Kho GitHub',
        metadata: {
          url: 'https://github.com/fudever-club',
          title: 'GITHUB ORGANIZATION FU-DEVER'
        }
      },
      {
        id: 'zone_web_recruitment',
        type: 'club_website',
        tileX: 11,
        tileY: 11,
        name: 'Cổng Đăng Ký Thành Viên FU-DEVER',
        label: 'Đăng Ký Thành Viên',
        metadata: {
          url: 'https://forms.gle/2us1yB5Qp2HYejj28',
          title: 'ĐƠN ĐĂNG KÝ THÀNH VIÊN FU-DEVER'
        }
      }
    ]
  },

  sports_complex: {
    id: 'sports_complex',
    name: 'Khu Phức Hợp Thể Thao & Nhà Võ Vovinam',
    // Phase C — Vùng an toàn (Masterplan: Giảng Đường Thi PE Exam).
    // Phase E sẽ định nghĩa vùng thách đấu (súng nước, bóng đá 3v3) tại đây.
    zone: 'safe',
    description: 'Sân bóng đá cỏ nhân tạo, sân bóng rổ, sân cầu lông, nhà võ Vovinam và hồ bơi sinh viên FUDA.',
    spawnPoint: { x: 400, y: 336 },
    layout: [
      // 0   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18  19  20  21  22  23  24
      [  2,  2,  2,  2,  2,  2,  2,  2,  2,  2, 20, 20, 20,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2 ],
      [  2, 25, 24, 24, 24, 24, 24, 24, 24, 25,  2,  5,  5,  5,  2, 26, 23, 23, 23, 23, 23, 23, 23, 26,  2 ],
      [  2, 24, 24, 24, 24, 24, 24, 24, 24, 24,  2,  5,  5,  5,  2, 23, 23, 23, 23, 23, 23, 23, 23, 23,  2 ],
      [  2, 24, 24, 24, 24, 24, 24, 24, 24, 24,  2,  5,  5,  5,  2, 23, 23, 23, 23, 23, 23, 23, 23, 23,  2 ],
      [  2, 24, 24, 24, 24, 24, 24, 24, 24, 24,  2,  5,  5,  5,  2, 23, 23, 23, 23, 23, 23, 23, 23, 23,  2 ],
      [  2, 24, 24, 24, 24, 24, 24, 24, 24, 24,  2,  5,  5,  5,  2, 23, 23, 23, 23, 23, 23, 23, 23, 23,  2 ],
      [  2, 24, 24, 24, 24, 24, 24, 24, 24, 24,  2,  5,  5,  5,  2, 23, 23, 23, 23, 23, 23, 23, 23, 23,  2 ],
      [  2, 25, 24, 24, 24, 24, 24, 24, 24, 25,  2,  5,  5,  5,  2, 26, 23, 23, 23, 23, 23, 23, 23, 26,  2 ],
      [  2,  2,  2,  5,  5,  5,  5,  5,  2,  2,  2,  5,  5,  5,  2,  2,  2,  5,  5,  5,  5,  5,  2,  2,  2 ],
      [  2, 10,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  2 ],
      [  2,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  2 ],
      [  2,  2,  2,  5,  5,  5,  5,  5,  2,  2,  2,  5,  5,  5,  2,  2,  2,  5,  5,  5,  5,  5,  2,  2,  2 ],
      [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2,  5,  5,  5,  2,  5,  5,  5,  5,  5,  5,  5,  5,  5,  2 ],
      [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2,  5,  5,  5,  2,  5, 28, 28, 28, 28, 28, 28, 28,  5,  2 ],
      [  2,  1,  1, 27, 27, 27, 27, 27,  1,  1,  2,  5,  5,  5,  2,  5, 28, 28, 28, 28, 28, 28, 28,  5,  2 ],
      [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2,  5,  5,  5,  2,  5, 28, 28, 28, 28, 28, 28, 28,  5,  2 ],
      [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2,  5,  5,  5,  2,  5, 28, 28, 28, 28, 28, 28, 28,  5,  2 ],
      [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2,  5,  5,  5,  2,  5,  5,  5,  5,  5,  5,  5,  5,  5,  2 ],
      [  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2 ]
    ],
    portals: [
      { tileX: 1, tileY: 9, targetRoomId: 'main_hall', targetSpawn: { x: 1280, y: 600 }, label: 'Về Sảnh Chính' }
    ],
    zones: [
      {
        id: 'zone_sports_football',
        type: 'sports_activity',
        tileX: 5,
        tileY: 4,
        name: 'Sân Bóng Đá Mini Cỏ Nhân Tạo FUDA',
        label: 'Sút Phạt Đền Mini',
        metadata: { sport: 'football', title: 'SÚT BÓNG VÀO LƯỚI FUDA' }
      },
      {
        id: 'zone_sports_basketball',
        type: 'sports_activity',
        tileX: 19,
        tileY: 4,
        name: 'Sân Bóng Rổ FUDA',
        label: 'Ném Bóng 3 Điểm',
        metadata: { sport: 'basketball', title: 'THỬ THÁCH NÉM BÓNG RỔ FUDA' }
      },
      {
        id: 'zone_sports_volleyball',
        type: 'sports_activity',
        tileX: 5,
        tileY: 13,
        name: 'Sân Bóng Chuyền & Cầu Lông FUDA',
        label: 'Đập Bóng Chuyền',
        metadata: { sport: 'volleyball', title: 'SÂN BÓNG CHUYỀN & CẦU LÔNG' }
      },
      {
        id: 'zone_sports_pool',
        type: 'coffee_lofi',
        tileX: 19,
        tileY: 12,
        name: 'Hồ Bơi Sinh Viên FUDA & Ghế Thư Giãn',
        label: 'Lofi Thư Giãn Bờ Hồ',
        metadata: { sport: 'pool', title: 'HỒ BƠI SINH VIÊN FUDA' }
      }
    ]
  },

  canteen_cafe: {
    id: 'canteen_cafe',
    name: 'Căn Tin FUDA & The High Deli Lounge',
    description: 'Không gian ẩm thực sinh viên, thực đơn 3 căn tin thực tế, quầy cà phê muối Đà Nẵng và pha chế barista.',
    zone: 'safe',
    paintedBackground: {
      imageKey: 'map_canteen_cafe',
      imagePath: 'devertown_canteen_cafe_v1.jpg',
      width: 1376, height: 768,
      spawnPoint: { x: 690, y: 680 },
      collisionRects: [
        // border walls
        { x: 0, y: 0, w: 1376, h: 40 },
        { x: 0, y: 0, w: 32, h: 768 },
        // vách kính nhìn ra sân vườn bên phải
        { x: 1040, y: 0, w: 336, h: 768 },
        // tường đáy, chừa lối đi cửa ra vào x: 610-770
        { x: 0, y: 730, w: 610, h: 38 },
        { x: 770, y: 730, w: 606, h: 38 },
        // Quầy cơm & tủ mát cafeteria góc trên-trái
        { x: 32, y: 40, w: 560, h: 290 },
        // Quầy cà phê & máy espresso góc trên-giữa
        { x: 730, y: 40, w: 310, h: 290 },
        // Bàn ăn 1 (trái)
        { x: 80, y: 430, w: 200, h: 140 },
        // Bàn ăn 2 (giữa-trái)
        { x: 360, y: 410, w: 200, h: 160 },
        // Bàn ăn 3 (giữa-phải)
        { x: 610, y: 410, w: 200, h: 160 },
        // Bàn ăn 4 (phải)
        { x: 870, y: 430, w: 150, h: 150 },
        // Bàn ăn dưới-trái
        { x: 80, y: 620, w: 200, h: 120 },
        // Bàn ăn dưới-giữa
        { x: 610, y: 610, w: 200, h: 130 },
      ]
    },
    spawnPoint: { x: 690, y: 680 },
    portals: [
      { x: 690, y: 735, tileX: 11, tileY: 18, targetRoomId: 'main_hall', targetSpawn: { x: 600, y: 650 }, label: 'Về Sảnh Chính' }
    ],
    zones: [
      {
        id: 'zone_canteen_food',
        type: 'canteen_menus',
        x: 230,
        y: 350,
        name: 'Quầy Thực Đơn Căn Tin FUDA (Tầng 1 & 2)',
        label: 'Thực Đơn Thật',
        metadata: { title: 'THỰC ĐƠN CĂN TIN FUDA' }
      },
      {
        id: 'zone_cafe_barista',
        type: 'sports_activity',
        x: 880,
        y: 350,
        name: 'Quầy Barista Cà Phê Muối & Trà Sữa DEVER',
        label: 'Pha Chế Cà Phê',
        metadata: { sport: 'barista', title: 'PHA CHẾ CÀ PHÊ MUỐI & TRÀ SỮA' }
      },
      {
        id: 'zone_canteen_sit_1',
        type: 'sit_chair',
        x: 180,
        y: 420,
        name: 'Bàn Ăn Căn Tin 1',
        label: 'Ngồi Bàn Ăn'
      },
      {
        id: 'zone_canteen_sit_2',
        type: 'sit_chair',
        x: 460,
        y: 400,
        name: 'Bàn Ăn Căn Tin 2',
        label: 'Ngồi Bàn Ăn'
      },
      {
        id: 'zone_cafe_acoustic',
        type: 'coffee_lofi',
        x: 120,
        y: 610,
        name: 'Góc Nhạc Acoustic Cafe & Pomodoro',
        label: 'Acoustic Chill',
        metadata: { title: 'NHẠC ACOUSTIC CAFE ĐÀ NẴNG' }
      }
    ]
  },

  server_dungeon: {
    id: 'server_dungeon',
    name: 'Tầng Hầm Tòa Gamma — Phòng Máy Chủ Sự Cố (Server Faults)',
    description: 'Khu vực hầm ngục kỹ thuật ngầm, nơi xảy ra các sự cố rò rỉ mã lỗi hệ thống và rò rỉ bộ nhớ RAM.',
    spawnPoint: { x: 384, y: 100 },
    layout: [
      [  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2, 10, 10,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2 ],
      [  2,  8,  8,  9,  9,  9,  9,  9,  8,  8,  9,  9,  9,  9,  8,  8,  9,  9,  9,  9,  9,  8,  8,  9,  2 ],
      [  2,  8,  8,  9,  9,  9,  9,  9,  8,  8,  9,  9,  9,  9,  8,  8,  9,  9,  9,  9,  9,  8,  8,  9,  2 ],
      [  2,  9,  9,  9, 18, 18, 18,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9, 18, 18, 18,  9,  9,  9,  9,  2 ],
      [  2,  9,  9,  9, 18,  8, 18,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9, 18,  8, 18,  9,  9,  9,  9,  2 ],
      [  2,  9,  9,  9, 18, 18, 18,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9, 18, 18, 18,  9,  9,  9,  9,  2 ],
      [  2,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  2 ],
      [  2,  8,  8,  9,  9,  9,  9,  9,  8,  8,  9,  9,  9,  9,  8,  8,  9,  9,  9,  9,  9,  8,  8,  9,  2 ],
      [  2,  8,  8,  9,  9,  9,  9,  9,  8,  8,  9,  9,  9,  9,  8,  8,  9,  9,  9,  9,  9,  8,  8,  9,  2 ],
      [  2,  9,  9,  9,  9,  9,  9,  9,  9,  9, 18, 18, 18,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  2 ],
      [  2,  9,  9,  9,  9,  9,  9,  9,  9,  9, 18,  8, 18,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  2 ],
      [  2,  9,  9,  9,  9,  9,  9,  9,  9,  9, 18, 18, 18,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  2 ],
      [  2,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  2 ],
      [  2,  8,  8,  9,  9,  9,  9,  9,  8,  8,  9,  9,  9,  9,  8,  8,  9,  9,  9,  9,  9,  8,  8,  9,  2 ],
      [  2,  9,  9,  9,  4,  4,  4,  9,  9,  9,  4,  4,  4,  9,  9,  9,  4,  4,  4,  9,  9,  9,  9,  9,  2 ],
      [  2,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  2 ],
      [  2,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  2 ],
      [  2, 13,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9, 13,  2 ],
      [  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2 ]
    ],
    portals: [
      { tileX: 11, tileY: 0, targetRoomId: 'dever_lab', targetSpawn: { x: 100, y: 100 }, label: 'Lên Tech Lab' },
      { tileX: 12, tileY: 0, targetRoomId: 'dever_lab', targetSpawn: { x: 100, y: 100 }, label: 'Lên Tech Lab' }
    ],
    zones: [
      {
        id: 'zone_dungeon_nullpointer',
        type: 'bug_dungeon_hunt',
        bugType: 'null_pointer',
        tileX: 5,
        tileY: 4,
        name: 'Sự Cố: NullPointerException Bug',
        label: 'Bắt Lỗi NullPointer',
        metadata: {
          title: 'SỰ CỐ NULL POINTER EXCEPTION',
          reward: 50,
          desc: 'Phát hiện biến con trỏ null trôi nổi gây sập hệ thống xác thực. Hãy xử lý ngay!',
          code: 'String userRole = user.getProfile().getRole(); // user.getProfile() is NULL!'
        }
      },
      {
        id: 'zone_dungeon_memoryleak',
        type: 'bug_dungeon_hunt',
        bugType: 'memory_leak',
        tileX: 18,
        tileY: 4,
        name: 'Sự Cố: Memory Leak Slime',
        label: 'Dọn Rác RAM',
        metadata: {
          title: 'SỰ CỐ RÒ RỈ BỘ NHỚ RAM (MEMORY LEAK)',
          reward: 75,
          desc: 'Event Listener không được gỡ bỏ khiến bộ nhớ RAM bị đầy 98%. Kích hoạt Garbage Collector!',
          code: 'window.addEventListener("scroll", handler); // Missing removeEventListener!'
        }
      },
      {
        id: 'zone_dungeon_infiniteloop',
        type: 'bug_dungeon_hunt',
        bugType: 'infinite_loop',
        tileX: 11,
        tileY: 10,
        name: 'Sự Cố: Infinite Loop Matrix',
        label: 'Ngắt Vòng Lặp',
        metadata: {
          title: 'SỰ CỐ VÒNG LẶP VÔ TẬN (INFINITE LOOP)',
          reward: 100,
          desc: 'CPU đạt 100% do điều kiện dừng vòng lặp while không bao giờ thỏa mãn. Chèn lệnh break ngay!',
          code: 'while (balance > 0) { /* balance is never updated */ }'
        }
      },
      {
        id: 'zone_dungeon_terminal',
        type: 'bug_dungeon_hunt',
        bugType: 'terminal_status',
        tileX: 11,
        tileY: 14,
        name: 'Máy Trạm Trung Tâm Hầm Ngục',
        label: 'Báo Cáo Máy Chủ',
        metadata: {
          title: 'TRUNG TÂM KIỂM SOÁT HỆ THỐNG SERVER',
          reward: 30,
          desc: 'Theo dõi tình trạng tải server, kiểm tra số lượng bug đã săn và chuyển đổi Logic Shards thành D-Coin.',
          code: 'STATUS: ACTIVE • ACTIVE BUGS: 3 • SYSTEM INTEGRITY: 87%'
        }
      }
    ]
  },

  // ===== 3 PHÒNG MỚI KIỂU GATHER.TOWN =====
  dorm_room: {
    id: 'dorm_room',
    name: 'Ký Túc Xá FUDA - Phòng Sinh Hoạt Chung',
    description: 'Không gian nghỉ ngơi ấm cúng: giường ngủ, tủ đồ cá nhân, bàn học và góc sofa thư giãn.',
    zone: 'safe',
    paintedBackground: {
      imageKey: 'map_dorm_room',
      imagePath: 'devertown_dorm_room_v1.jpg',
      width: 1376, height: 768,
      spawnPoint: { x: 680, y: 680 },
      collisionRects: [
        // border walls
        { x: 0, y: 0, w: 555, h: 40 },
        { x: 820, y: 0, w: 556, h: 40 },
        { x: 0, y: 0, w: 32, h: 768 },
        { x: 1344, y: 0, w: 32, h: 768 },
        // bottom walls chừa cửa ra vào x: 620 - 740
        { x: 0, y: 725, w: 620, h: 43 },
        { x: 740, y: 725, w: 636, h: 43 },
        // Ban công kính & dàn chậu cây phía trên
        { x: 555, y: 0, w: 265, h: 310 },
        // Góc sinh viên 1 (trên-trái): Tủ đồ, Giường tầng, Bàn học
        { x: 55, y: 80, w: 130, h: 340 },
        { x: 185, y: 95, w: 185, h: 340 },
        { x: 375, y: 235, w: 175, h: 195 },
        // Góc sinh viên 2 (trên-phải): Bàn học, Giường tầng, Tủ đồ
        { x: 830, y: 235, w: 170, h: 195 },
        { x: 1005, y: 95, w: 185, h: 340 },
        { x: 1190, y: 80, w: 135, h: 350 },
        // Góc sinh viên 3 (dưới-trái): Tủ đồ, Giường tầng, Bàn học
        { x: 40, y: 535, w: 125, h: 195 },
        { x: 165, y: 490, w: 190, h: 240 },
        { x: 355, y: 585, w: 170, h: 145 },
        // Góc sinh viên 4 (dưới-phải): Bàn học, Giường tầng, Tủ đồ
        { x: 915, y: 585, w: 170, h: 145 },
        { x: 1010, y: 490, w: 195, h: 240 },
        { x: 1205, y: 540, w: 130, h: 190 },
        // Bàn tròn trà & Sofa sinh hoạt chung ở giữa
        { x: 630, y: 510, w: 85, h: 155 },
        { x: 740, y: 460, w: 100, h: 225 }
      ]
    },
    spawnPoint: { x: 680, y: 680 },
    portals: [
      { x: 680, y: 735, tileX: 11, tileY: 13, targetRoomId: 'main_hall', targetSpawn: { x: 200, y: 670 }, label: 'Về Sảnh Chính' }
    ],
    zones: [
      { id: 'zone_dorm_rest_1', type: 'rest_bed', x: 280, y: 440, name: 'Giường Ngủ KTX FUDA 1', label: 'Nghỉ Ngơi' },
      { id: 'zone_dorm_rest_2', type: 'rest_bed', x: 1100, y: 440, name: 'Giường Ngủ KTX FUDA 2', label: 'Nghỉ Ngơi' },
      { id: 'zone_dorm_study_1', type: 'code_editor', x: 460, y: 435, name: 'Bàn Học & Coder Station 1', label: 'Học Bài & Code' },
      { id: 'zone_dorm_study_2', type: 'code_editor', x: 915, y: 435, name: 'Bàn Học & Coder Station 2', label: 'Học Bài & Code' },
      { id: 'zone_dorm_sit_sofa', type: 'sit_sofa', x: 715, y: 585, name: 'Sofa KTX FUDA', label: 'Ngồi Thư Giãn' },
      { id: 'zone_dorm_balcony', type: 'coffee_lofi', x: 688, y: 320, name: 'Ban Công Nắng & Cây Xanh KTX', label: 'Ngắm Cảnh Ban Công' }
    ]
  },

  meeting_room: {
    id: 'meeting_room',
    name: 'Phòng Họp & Lớp Học CLB FU-DEVER',
    // Phase C — Vùng an toàn (Masterplan: Văn phòng CLB FU-DEVER).
    zone: 'safe',
    description: 'Không gian họp và dạy học kiểu Gather.town: bàn hội nghị chữ U, màn chiếu projector, bảng trắng cho buổi họp và lớp học CLB.',
    spawnPoint: { x: 400, y: 336 },
    layout: [
      [  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2 ],
      [  2, 35,  1,  1,  1,  1,  1,  1,  1,  1, 39, 39, 39,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
      [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
      [  2,  1,  1, 36,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1, 36,  1,  1,  2 ],
      [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
      [  2,  1,  1,  1,  1, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
      [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
      [  2,  1,  1,  1,  1, 38, 38,  1,  1,  1,  1,  1,  1,  1, 38, 38,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
      [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
      [  2,  1,  1,  1,  1, 38, 38,  1,  1,  1,  1,  1,  1,  1, 38, 38,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
      [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
      [  2,  1,  4,  4,  1,  1,  1,  4,  4,  1,  1,  1,  1,  4,  4,  1,  1,  1,  4,  4,  1,  1,  1,  1,  2 ],
      [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
      [  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2, 10, 10,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2 ],
      [  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2 ],
      [  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2 ],
      [  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2 ],
      [  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2 ],
      [  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2 ]
    ],
    portals: [
      { tileX: 11, tileY: 13, targetRoomId: 'alpha_interior', targetSpawn: { x: 1000, y: 590 }, labelKey: 'portals.back_to_alpha', label: 'Về Sảnh Alpha' },
      { tileX: 12, tileY: 13, targetRoomId: 'alpha_interior', targetSpawn: { x: 1000, y: 590 }, labelKey: 'portals.back_to_alpha', label: 'Về Sảnh Alpha' }
    ],
    zones: [
      { id: 'zone_meet_screen', type: 'whiteboard_slides', tileX: 11, tileY: 1, name: 'Màn Chiếu Phòng Họp CLB', label: 'Slide Họp CLB' },
      { id: 'zone_meet_stage', type: 'meeting_stage', tileX: 10, tileY: 6, name: 'Bàn Họp Chữ U FU-DEVER', label: 'Họp Video' },
      { id: 'zone_meet_board', type: 'whiteboard_slides', tileX: 1, tileY: 1, name: 'Bảng Trắng Phòng Họp', label: 'Ghi Chú Họp' }
    ]
  },
};


/**
 * Cấu hình 5 bản đồ mở rộng (25x19 tiles = 800x608 px) chuẩn nhận diện Đại học FPT Đà Nẵng & CLB DEVER.
 *
 * Danh mục Tile Indices:
 * 0: Cỏ, 1: Sàn gỗ, 2: Tường gạch, 3: Kệ sách, 4: Bàn làm việc & Laptop, 5: Đá cuội, 6: Thảm xanh, 7: Hoa
 * 8: Server Rack, 9: Sàn Cyan Cyber, 10: Cổng Portal, 11: Thảm đỏ, 12: Bảng trắng, 13: Cây cảnh, 14: Quầy cà phê, 15: Vách kính
 * 16: Khung tranh kỷ niệm, 17: Bục cúp vàng, 18: Sàn lưới Cyber Web, 19: Cóc Vàng FPTU, 20: Biển hiệu FPTU ĐN,
 * 21: Neon DEVER Club, 22: Cột cờ FPT, 23: Sàn gạch Alpha FPTU
 */

export const MAPS_CONFIG = {
  main_hall: {
    id: 'main_hall',
    name: 'Sảnh Chính Giảng Đường Alpha - FPTU Đà Nẵng',
    description: 'Hội trường trung tâm FPT University Đà Nẵng, tượng Cóc Vàng và kết nối 4 phân khu.',
    spawnPoint: { x: 400, y: 350 },
    layout: [
      // 0   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18  19  20  21  22  23  24
      [  2,  2,  2, 10,  2,  2,  2,  2,  2, 20, 20,  2, 21, 21,  2, 20, 20,  2,  2,  2, 10,  2,  2,  0,  0 ], // Row 0
      [  2, 13, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 13,  0,  7 ], // Row 1
      [  2, 23, 23, 23,  4,  4, 23, 23,  4,  4, 23, 23, 23, 23, 23,  4,  4, 23, 23,  4,  4, 23, 23,  0,  5 ], // Row 2
      [  2, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,  5,  5 ], // Row 3
      [  2, 23,  4, 23, 23,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6, 23, 23,  4, 23, 23,  0,  5 ], // Row 4
      [  2, 23,  4, 23, 23,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6, 23, 23,  4, 23, 23,  7,  5 ], // Row 5
      [  2, 23, 23, 23, 23,  6,  6,  6,  6,  6, 19, 19, 19,  6,  6,  6,  6,  6, 23, 23, 23, 23, 23,  0,  5 ], // Row 6 (Tượng Cóc Vàng FPTU Col 10-12)
      [ 10, 23, 23, 23, 23,  6,  6,  6,  6,  6, 19, 19, 19,  6,  6,  6,  6,  6, 23, 23, 23, 23, 10,  5,  5 ], // Row 7 (Portals trái sang Kỷ niệm, phải sang Web)
      [  2, 23, 23, 23, 23,  6,  6,  6,  6,  6, 19, 19, 19,  6,  6,  6,  6,  6, 23, 23, 23, 23, 23,  5,  0 ], // Row 8
      [  2, 23,  4, 23, 23,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6, 23, 23,  4, 23, 23,  7,  0 ], // Row 9
      [  2, 23,  4, 23, 23,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6,  6, 23, 23,  4, 23, 23,  0,  0 ], // Row 10
      [  2, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,  5,  5 ], // Row 11
      [  2, 23,  4, 23, 23,  4,  4, 23, 23,  4,  4, 23, 23,  4,  4, 23, 23,  4,  4, 23, 23,  4, 23,  5,  7 ], // Row 12
      [  2,  3,  3, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,  3,  3,  5,  0 ], // Row 13
      [  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  5,  0 ], // Row 14
      [  0,  0,  7,  0, 22, 22,  0,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  0, 22, 22,  0,  7,  5,  0 ], // Row 15 (Cột cờ FPT Col 4-5, 19-20)
      [  0,  7,  0,  0,  0,  0,  0,  5,  0,  0,  0,  7,  0,  0,  0,  7,  0,  5,  0,  0,  0,  0,  0,  5,  0 ], // Row 16
      [  0,  0,  0,  7,  0,  0,  0,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  0,  0,  7,  0,  0,  5,  0 ], // Row 17
      [  0,  7,  0,  0,  0,  7,  0,  0,  0,  7,  0,  0,  0,  0,  7,  0,  0,  0,  0,  7,  0,  0,  0,  7,  0 ]  // Row 18
    ],
    portals: [
      { tileX: 3, tileY: 0, targetRoomId: 'dever_lab', targetSpawn: { x: 400, y: 500 }, label: 'Sang Tech Lab' },
      { tileX: 20, tileY: 0, targetRoomId: 'library_lounge', targetSpawn: { x: 400, y: 500 }, label: 'Sang Thư Viện' },
      { tileX: 0, tileY: 7, targetRoomId: 'memory_room', targetSpawn: { x: 720, y: 300 }, label: 'Phòng Kỷ Niệm' },
      { tileX: 22, tileY: 7, targetRoomId: 'web_room', targetSpawn: { x: 80, y: 300 }, label: 'Không Gian Web' }
    ],
    zones: [
      { id: 'zone_main_frog', type: 'whiteboard_slides', tileX: 11, tileY: 6, name: 'Linh Vật Cóc Vàng FPTU', label: 'Xem Tôn Chỉ FPT' },
      { id: 'zone_main_slides', type: 'whiteboard_slides', tileX: 5, tileY: 2, name: 'Màn Chiếu Sảnh Đón Tiếp', label: 'Xem Slide CLB' },
      { id: 'zone_main_meeting', type: 'meeting_stage', tileX: 11, tileY: 9, name: 'Sân Khấu Họp Toàn Thể', label: 'Họp Nhóm Video' },
      { id: 'zone_main_coffee', type: 'coffee_lofi', tileX: 23, tileY: 4, name: 'Vườn Trà FPTU & Thư Giãn', label: 'Nhạc Lofi & Pomodoro' }
    ]
  },

  dever_lab: {
    id: 'dever_lab',
    name: 'Phòng Nghiên Cứu & Sáng Tạo Dever Lab',
    description: 'Không gian Hackathon, trạm máy chủ và góc lập trình chuyên sâu của thành viên CLB DEVER.',
    spawnPoint: { x: 400, y: 500 },
    layout: [
      [ 15, 15, 15, 15, 15, 21, 21, 15, 15, 12, 12, 15, 15, 12, 12, 15, 15, 21, 21, 15, 15, 15, 15, 15, 15 ],
      [ 15,  8,  8,  9,  9,  9,  9,  9,  8,  8,  8,  8,  9,  8,  8,  8,  8,  9,  9,  9,  9,  8,  8, 13, 15 ],
      [ 15,  8,  8,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  8,  8,  9, 15 ],
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
      { tileX: 12, tileY: 14, targetRoomId: 'main_hall', targetSpawn: { x: 100, y: 100 }, label: 'Về Sảnh Chính' },
      { tileX: 13, tileY: 14, targetRoomId: 'main_hall', targetSpawn: { x: 100, y: 100 }, label: 'Về Sảnh Chính' }
    ],
    zones: [
      { id: 'zone_lab_whiteboard', type: 'whiteboard_slides', tileX: 10, tileY: 1, name: 'Bảng Sơ Đồ Kiến Trúc Hệ Thống', label: 'Bảng Kiến Trúc' },
      { id: 'zone_lab_code_a', type: 'code_editor', tileX: 5, tileY: 3, name: 'Bàn Hackathon Đội Alpha', label: 'Mở Code Sandbox' },
      { id: 'zone_lab_meeting', type: 'meeting_stage', tileX: 12, tileY: 8, name: 'Bàn Thảo Luận Kỹ Thuật Lab', label: 'Họp Kỹ Thuật' },
      { id: 'zone_lab_code_b', type: 'code_editor', tileX: 19, tileY: 3, name: 'Bàn Hackathon Đội Beta', label: 'Mở Code Sandbox' }
    ]
  },

  library_lounge: {
    id: 'library_lounge',
    name: 'Thư Viện Tri Thức FPTU & Chill Lounge',
    description: 'Không gian tự học yên tĩnh, giá sách công nghệ và quầy cà phê giao lưu.',
    spawnPoint: { x: 400, y: 500 },
    layout: [
      [  2,  2,  2,  2,  2,  2,  2,  2,  2, 20, 20,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2 ],
      [  2,  3,  3,  3,  3,  1,  1,  3,  3,  3,  3,  3,  1,  1, 14, 14, 14, 13,  1,  3,  3,  3,  3, 13,  2 ],
      [  2,  3,  3,  3,  3,  1,  1,  3,  3,  3,  3,  3,  1,  1, 14, 14, 14,  1,  1,  3,  3,  3,  3,  1,  2 ],
      [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
      [  2,  1,  4,  4,  1, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11,  1,  4,  4,  1, 13,  1,  1,  1,  2 ],
      [  2,  1,  4,  4,  1, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11,  1,  4,  4,  1,  1,  1,  1,  1,  2 ],
      [  2,  1,  1,  1,  1, 11, 11, 11, 11, 11, 19, 19, 11, 11, 11, 11,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
      [  2,  1,  4,  4,  1, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11,  1,  4,  4,  1, 13,  1,  1,  1,  2 ],
      [  2,  1,  4,  4,  1, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11,  1,  4,  4,  1,  1,  1,  1,  1,  2 ],
      [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ],
      [  2,  3,  3,  1,  1,  4,  4,  1,  1,  1,  1,  1,  1,  1,  1,  4,  4,  1,  1,  3,  3,  1,  1,  3,  2 ],
      [  2,  3,  3,  1,  1,  4,  4,  1,  1,  1,  1,  1,  1,  1,  1,  4,  4,  1,  1,  3,  3,  1,  1,  3,  2 ],
      [  2, 13,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1, 13,  1,  2 ],
      [  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  1, 10, 10,  1,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2 ],
      [  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2 ],
      [  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2 ],
      [  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2 ],
      [  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2 ],
      [  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2 ]
    ],
    portals: [
      { tileX: 11, tileY: 13, targetRoomId: 'main_hall', targetSpawn: { x: 650, y: 100 }, label: 'Về Sảnh Chính' },
      { tileX: 12, tileY: 13, targetRoomId: 'main_hall', targetSpawn: { x: 650, y: 100 }, label: 'Về Sảnh Chính' }
    ],
    zones: [
      { id: 'zone_lib_coffee', type: 'coffee_lofi', tileX: 15, tileY: 2, name: 'Quầy Cà Phê Sách & Pomodoro', label: 'Cà Phê & Lofi' },
      { id: 'zone_lib_slides', type: 'whiteboard_slides', tileX: 11, tileY: 6, name: 'Khu Đọc Tài Liệu Chuyên Ngành', label: 'Tài Liệu Sách' },
      { id: 'zone_lib_code', type: 'code_editor', tileX: 5, tileY: 11, name: 'Bàn Tự Học & Ghi Chú Bài Tập', label: 'Sổ Tay & Code' }
    ]
  },

  memory_room: {
    id: 'memory_room',
    name: 'Phòng Triển Lãm Kỷ Niệm & Cúp Vinh Danh FPTU',
    description: 'Không gian bảo tàng lưu trữ các cột mốc FPT Edu Hackathon, Lễ vinh danh Cóc Vàng và lịch sử CLB.',
    spawnPoint: { x: 720, y: 300 },
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
      { tileX: 22, tileY: 6, targetRoomId: 'main_hall', targetSpawn: { x: 80, y: 250 }, label: 'Về Sảnh Chính' }
    ],
    zones: [
      {
        id: 'zone_mem_founding',
        type: 'gallery_memory',
        tileX: 3,
        tileY: 1,
        name: 'Lễ Thành Lập CLB DEVER FPTU',
        label: 'Xem Kỷ Niệm Thành Lập',
        metadata: {
          title: 'Lễ Ra Mắt CLB Lập Trình DEVER - FPTU Đà Nẵng',
          date: 'Tháng 09/2023',
          story: 'Ngày hội tụ đầu tiên của các coder FPTU Đà Nẵng, chính thức đặt nền móng phát triển cộng đồng công nghệ sinh viên.',
          imgId: 'founding'
        }
      },
      {
        id: 'zone_mem_hackathon',
        type: 'gallery_memory',
        tileX: 10,
        tileY: 1,
        name: 'Chiến Tích Vô Địch Hackathon FPT Edu',
        label: 'Xem Cúp Vô Địch Hackathon',
        metadata: {
          title: 'Vô Địch Cuộc Thi Lập Trình Hackathon Toàn Quốc',
          date: 'Tháng 12/2024',
          story: 'Đội ngũ DEVER Club xuất sắc vượt qua hơn 50 đội thi với giải pháp ứng dụng AI & Realtime Collaboration.',
          imgId: 'hackathon'
        }
      },
      {
        id: 'zone_mem_teambuilding',
        type: 'gallery_memory',
        tileX: 17,
        tileY: 1,
        name: 'Teambuilding Biển Đà Nẵng',
        label: 'Xem Album Teambuilding',
        metadata: {
          title: 'Chuyến Dã Ngoại Bán Đảo Sơn Trà & Gắn Kết Mùa Hè',
          date: 'Mùa Hè 2025',
          story: 'Những khoảnh khắc bùng nổ năng lượng, gắn kết tình đồng đội giữa các thế hệ thành viên DEVER FPTU.',
          imgId: 'teambuilding'
        }
      },
      {
        id: 'zone_mem_workshop',
        type: 'gallery_memory',
        tileX: 1,
        tileY: 7,
        name: 'Chuỗi Workshop Tech Talk FPTU',
        label: 'Xem Workshop Chuyên Đề',
        metadata: {
          title: "Workshop 'Làm Chủ Fullstack & Game 2D'",
          date: 'Hàng Tháng',
          story: 'Các buổi chia sẻ chuyên sâu về Node.js, WebSockets, Phaser 3 và Kiến trúc hệ thống phân tán tại Giảng đường Alpha.',
          imgId: 'workshop'
        }
      }
    ]
  },

  web_room: {
    id: 'web_room',
    name: 'Showroom Không Gian Web CLB DEVER & FPTU',
    description: 'Không gian công nghệ số Cyberpunk nhúng Cổng thông tin & Website CLB DEVER.',
    spawnPoint: { x: 80, y: 300 },
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
      { tileX: 1, tileY: 6, targetRoomId: 'main_hall', targetSpawn: { x: 680, y: 250 }, label: 'Về Sảnh Chính' }
    ],
    zones: [
      {
        id: 'zone_web_main',
        type: 'club_website',
        tileX: 11,
        tileY: 6,
        name: 'Landing Page Chính Thức FU-DEVER',
        label: 'Mở Landing Page',
        metadata: {
          url: 'https://fu-dever-landingpage-v2.vercel.app/',
          fallbackUrl: 'https://github.com/fudever-club',
          title: 'FU-DEVER LANDING PAGE - WORK HARD PLAY HARD'
        }
      },
      {
        id: 'zone_web_member_portal',
        type: 'club_website',
        tileX: 3,
        tileY: 3,
        name: 'Member Portal - Hệ Thống Thành Viên FU-DEVER',
        label: 'Mở Member Portal',
        metadata: {
          url: 'https://dever-client-sigma.vercel.app',
          title: 'FU-DEVER MEMBER PORTAL'
        }
      },
      {
        id: 'zone_web_projects',
        type: 'club_website',
        tileX: 19,
        tileY: 3,
        name: 'Kho Dự Án & Sản Phẩm Công Nghệ (2D Game, AI, Web, Mobile)',
        label: 'Showcase Sản Phẩm',
        metadata: {
          url: 'https://github.com/fudever-club',
          title: 'KHO SẢN PHẨM & DỰ ÁN FU-DEVER'
        }
      },
      {
        id: 'zone_web_recruitment',
        type: 'club_website',
        tileX: 11,
        tileY: 11,
        name: 'Cổng Đăng Ký Thành Viên Mới FU-DEVER',
        label: 'Đăng Ký Thành Viên',
        metadata: {
          url: 'https://docs.google.com/forms/d/1zr-qtjxbWkFvV10AWEyRnlsdq2IzqqOrewaHWXKIuDQ/prefill',
          title: 'ĐƠN ĐĂNG KÝ THÀNH VIÊN FU-DEVER'
        }
      }
    ]
  }
};

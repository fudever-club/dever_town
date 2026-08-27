/**
 * Định nghĩa cấu hình 3 bản đồ chuyên biệt cho DEVER TOWN:
 * 1. main_hall: Sảnh chính tiếp đón & hội trường chung
 * 2. dever_lab: Phòng nghiên cứu công nghệ & Hackathon
 * 3. library_lounge: Thư viện tri thức & Chill lounge
 *
 * Danh mục Tile Indices:
 * 0: Cỏ, 1: Sàn gỗ, 2: Tường gạch, 3: Kệ sách, 4: Bàn làm việc & Laptop, 5: Đá cuội, 6: Thảm xanh, 7: Hoa
 * 8: Server Rack, 9: Sàn Cyan Cyber, 10: Cổng Portal, 11: Thảm đỏ, 12: Bảng trắng, 13: Cây cảnh, 14: Quầy cà phê, 15: Vách kính
 */

export const MAPS_CONFIG = {
  main_hall: {
    id: 'main_hall',
    name: '🏛️ Sảnh Chính Dever Town',
    description: 'Khu vực giao lưu chung, sảnh đón tiếp và thảm họp lớn.',
    spawnPoint: { x: 320, y: 280 },
    layout: [
      // 0   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18  19
      [  2,  2, 10,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2, 10,  2,  2,  0,  0,  7,  0 ], // Row 0
      [  2, 13,  1, 13,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1, 13,  2,  0,  5,  0,  0 ], // Row 1
      [  2,  1,  1,  1,  4,  4,  1,  1,  4,  4,  1,  1,  1,  1,  1,  2,  0,  5,  0,  7 ], // Row 2 (Bàn thuyết trình col 4-5)
      [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2,  0,  5,  5,  5 ], // Row 3
      [  2,  1,  4,  1,  1,  6,  6,  6,  6,  6,  6,  1,  1,  4,  1,  2,  0,  0,  0,  5 ], // Row 4 (Thảm họp trung tâm col 5-10)
      [  2,  1,  4,  1,  1,  6,  6,  6,  6,  6,  6,  1,  1,  4,  1,  2,  7,  0,  0,  5 ], // Row 5
      [  2,  1,  1,  1,  1,  6,  6,  6,  6,  6,  6,  1,  1,  1,  1,  1,  5,  5,  5,  5 ], // Row 6
      [  2,  1,  1,  1,  1,  6,  6,  6,  6,  6,  6,  1,  1,  1,  1,  1,  5,  0,  0,  0 ], // Row 7
      [  2,  1,  4,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  4,  1,  2,  7,  0,  7,  0 ], // Row 8
      [  2,  1,  4,  1,  1,  4,  4,  1,  1,  4,  4,  1,  1,  4,  1,  2,  0,  0,  0,  0 ], // Row 9
      [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2,  0,  5,  5,  5 ], // Row 10
      [  2,  3,  3,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  3,  3,  2,  0,  5,  0,  7 ], // Row 11
      [  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  0,  5,  0,  0 ], // Row 12
      [  0,  0,  7,  0,  0,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  0,  0 ], // Row 13
      [  0,  7,  0,  0,  0,  0,  0,  7,  0,  0,  0,  7,  0,  0,  0,  0,  0,  0,  7,  0 ]  // Row 14
    ],
    portals: [
      {
        tileX: 2,
        tileY: 0,
        targetRoomId: 'dever_lab',
        targetSpawn: { x: 320, y: 380 },
        label: '💻 Sang Tech Lab'
      },
      {
        tileX: 13,
        tileY: 0,
        targetRoomId: 'library_lounge',
        targetSpawn: { x: 320, y: 380 },
        label: '📚 Sang Thư Viện'
      }
    ],
    zones: [
      {
        id: 'zone_main_slides',
        type: 'whiteboard_slides',
        tileX: 5,
        tileY: 2,
        name: 'Màn Chiếu Sảnh Đón Tiếp',
        label: '📊 [E] Xem Slide CLB'
      },
      {
        id: 'zone_main_meeting',
        type: 'meeting_stage',
        tileX: 8,
        tileY: 5,
        name: 'Sân Khấu Họp Toàn Thể',
        label: '🎤 [E] Họp Nhóm Video'
      },
      {
        id: 'zone_main_coffee',
        type: 'coffee_lofi',
        tileX: 17,
        tileY: 4,
        name: 'Vườn Trà & Thư Giãn',
        label: '☕ [E] Nhạc Lofi & Pomodoro'
      }
    ]
  },

  dever_lab: {
    id: 'dever_lab',
    name: '💻 Phòng Nghiên Cứu Dever Lab',
    description: 'Khu vực Hackathon, bàn máy tính cấu hình cao, máy chủ Server Racks.',
    spawnPoint: { x: 320, y: 380 },
    layout: [
      // 0   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18  19
      [ 15, 15, 15, 15, 15, 12, 12, 15, 15, 15, 15, 15, 12, 12, 15, 15, 15, 15, 15, 15 ], // Row 0 (Bảng trắng col 5-6, 12-13)
      [ 15,  8,  8,  9,  9,  9,  9,  9,  8,  8,  8,  8,  9,  9,  9,  9,  9,  8,  8, 15 ], // Row 1
      [ 15,  8,  8,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  8,  8, 15 ], // Row 2
      [ 15,  9,  9,  9,  4,  4,  9,  9,  4,  4,  4,  4,  9,  9,  4,  4,  9,  9,  9, 15 ], // Row 3
      [ 15,  9,  9,  9,  4,  4,  9,  9,  4,  4,  4,  4,  9,  9,  4,  4,  9,  9,  9, 15 ], // Row 4
      [ 15,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9, 15 ], // Row 5
      [ 15, 13,  9,  9,  4,  4,  9,  9,  6,  6,  6,  6,  9,  9,  4,  4,  9,  9, 13, 15 ], // Row 6 (Bàn thảo luận trung tâm)
      [ 15,  9,  9,  9,  4,  4,  9,  9,  6,  6,  6,  6,  9,  9,  4,  4,  9,  9,  9, 15 ], // Row 7
      [ 15,  9,  9,  9,  9,  9,  9,  9,  6,  6,  6,  6,  9,  9,  9,  9,  9,  9,  9, 15 ], // Row 8
      [ 15,  9,  9,  9,  4,  4,  9,  9,  4,  4,  4,  4,  9,  9,  4,  4,  9,  9,  9, 15 ], // Row 9
      [ 15,  9,  9,  9,  4,  4,  9,  9,  4,  4,  4,  4,  9,  9,  4,  4,  9,  9,  9, 15 ], // Row 10
      [ 15, 13,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9, 13, 15 ], // Row 11
      [ 15,  8,  8,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  8,  8, 15 ], // Row 12
      [ 15, 15, 15, 15, 15, 15, 15, 15,  9, 10, 10,  9, 15, 15, 15, 15, 15, 15, 15, 15 ], // Row 13
      [ 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15 ]  // Row 14
    ],
    portals: [
      {
        tileX: 9,
        tileY: 13,
        targetRoomId: 'main_hall',
        targetSpawn: { x: 80, y: 80 },
        label: '🏛️ Về Sảnh Chính'
      },
      {
        tileX: 10,
        tileY: 13,
        targetRoomId: 'main_hall',
        targetSpawn: { x: 80, y: 80 },
        label: '🏛️ Về Sảnh Chính'
      }
    ],
    zones: [
      {
        id: 'zone_lab_whiteboard',
        type: 'whiteboard_slides',
        tileX: 6,
        tileY: 1,
        name: 'Bảng Sơ Đồ Kiến Trúc Hệ Thống',
        label: '📊 [E] Bảng Kiến Trúc'
      },
      {
        id: 'zone_lab_code_a',
        type: 'code_editor',
        tileX: 5,
        tileY: 3,
        name: 'Bàn Lập Trình Hackathon Đội A',
        label: '🖥️ [E] Mở Code Sandbox'
      },
      {
        id: 'zone_lab_meeting',
        type: 'meeting_stage',
        tileX: 10,
        tileY: 7,
        name: 'Bàn Thảo Luận Kỹ Thuật Lab',
        label: '🎤 [E] Họp Kỹ Thuật'
      },
      {
        id: 'zone_lab_code_b',
        type: 'code_editor',
        tileX: 15,
        tileY: 3,
        name: 'Bàn Lập Trình Hackathon Đội B',
        label: '🖥️ [E] Mở Code Sandbox'
      }
    ]
  },

  library_lounge: {
    id: 'library_lounge',
    name: '📚 Thư Viện Tri Thức & Chill Lounge',
    description: 'Không gian tự học yên tĩnh, giá sách chuyên ngành, thảm đọc sách và quầy cà phê.',
    spawnPoint: { x: 320, y: 380 },
    layout: [
      // 0   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18  19
      [  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2 ], // Row 0
      [  2,  3,  3,  3,  3,  1,  1,  3,  3,  3,  3,  3,  1,  1, 14, 14, 14, 13,  1,  2 ], // Row 1
      [  2,  3,  3,  3,  3,  1,  1,  3,  3,  3,  3,  3,  1,  1, 14, 14, 14,  1,  1,  2 ], // Row 2
      [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ], // Row 3
      [  2,  1,  4,  4,  1, 11, 11, 11, 11, 11, 11, 11, 11,  1,  4,  4,  1, 13,  1,  2 ], // Row 4
      [  2,  1,  4,  4,  1, 11, 11, 11, 11, 11, 11, 11, 11,  1,  4,  4,  1,  1,  1,  2 ], // Row 5
      [  2,  1,  1,  1,  1, 11, 11, 11, 11, 11, 11, 11, 11,  1,  1,  1,  1,  1,  1,  2 ], // Row 6
      [  2,  1,  4,  4,  1, 11, 11, 11, 11, 11, 11, 11, 11,  1,  4,  4,  1, 13,  1,  2 ], // Row 7
      [  2,  1,  4,  4,  1, 11, 11, 11, 11, 11, 11, 11, 11,  1,  4,  4,  1,  1,  1,  2 ], // Row 8
      [  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2 ], // Row 9
      [  2,  3,  3,  1,  1,  4,  4,  1,  1,  1,  1,  1,  1,  4,  4,  1,  1,  3,  3,  2 ], // Row 10
      [  2,  3,  3,  1,  1,  4,  4,  1,  1,  1,  1,  1,  1,  4,  4,  1,  1,  3,  3,  2 ], // Row 11
      [  2, 13,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1, 13,  2 ], // Row 12
      [  2,  2,  2,  2,  2,  2,  2,  2,  1, 10, 10,  1,  2,  2,  2,  2,  2,  2,  2,  2 ], // Row 13
      [  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2 ]  // Row 14
    ],
    portals: [
      {
        tileX: 9,
        tileY: 13,
        targetRoomId: 'main_hall',
        targetSpawn: { x: 430, y: 80 },
        label: '🏛️ Về Sảnh Chính'
      },
      {
        tileX: 10,
        tileY: 13,
        targetRoomId: 'main_hall',
        targetSpawn: { x: 430, y: 80 },
        label: '🏛️ Về Sảnh Chính'
      }
    ],
    zones: [
      {
        id: 'zone_lib_coffee',
        type: 'coffee_lofi',
        tileX: 15,
        tileY: 2,
        name: 'Quầy Cà Phê Sách & Pomodoro',
        label: '☕ [E] Cà Phê & Lofi'
      },
      {
        id: 'zone_lib_slides',
        type: 'whiteboard_slides',
        tileX: 9,
        tileY: 6,
        name: 'Khu Đọc Tài Liệu Chuyên Ngành',
        label: '📊 [E] Tài Liệu Sách'
      },
      {
        id: 'zone_lib_code',
        type: 'code_editor',
        tileX: 5,
        tileY: 11,
        name: 'Bàn Tự Học & Ghi Chú Bài Tập',
        label: '🖥️ [E] Sổ Tay & Code'
      }
    ]
  }
};

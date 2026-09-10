/**
 * DEVER TOWN - SOKOBAN 15 PROGRESSIVE LEVELS
 * Bộ 15 màn chơi Sokoban tinh tuyển từ dễ đến khó (dựa trên chuẩn Microban Collection)
 * Ký hiệu mã hóa ô:
 * 0 = Sàn đi lại (Floor)
 * 1 = Tường chắn (Wall)
 * 2 = Điểm đích (Target Socket)
 * 3 = Hộp kim loại (Box)
 * 4 = Hộp đã khớp điểm đích (Box on Target)
 * 5 = Người chơi (Player)
 * 6 = Người chơi đứng trên đích (Player on Target)
 * 7 = Sàn băng trơn (Ice Floor - trượt theo quán tính)
 */

export const SOKOBAN_LEVELS = [
  // --- CẤP ĐỘ 1: NHẬP MÔN (LEVEL 1 - 5) ---
  {
    name: 'Màn 1: Căn Bản Server Room',
    difficulty: 'Dễ',
    parMoves: 8,
    map: [
      [1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 1],
      [1, 0, 3, 2, 0, 1],
      [1, 5, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1]
    ]
  },
  {
    name: 'Màn 2: Hai Hộp Song Song',
    difficulty: 'Dễ',
    parMoves: 14,
    map: [
      [1, 1, 1, 1, 1, 1, 1],
      [1, 0, 2, 0, 2, 0, 1],
      [1, 0, 3, 0, 3, 0, 1],
      [1, 0, 0, 5, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1]
    ]
  },
  {
    name: 'Màn 3: Góc Hẹp Hành Lang',
    difficulty: 'Dễ',
    parMoves: 18,
    map: [
      [1, 1, 1, 1, 1, 1, 1],
      [1, 5, 0, 1, 0, 2, 1],
      [1, 0, 3, 0, 3, 2, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1]
    ]
  },
  {
    name: 'Màn 4: Sàn Băng Thử Thử Nghiệm',
    difficulty: 'Dễ',
    parMoves: 12,
    map: [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 5, 0, 7, 7, 3, 2, 1],
      [1, 0, 0, 7, 7, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1]
    ]
  },
  {
    name: 'Màn 5: Tam Giác Ba Hộp',
    difficulty: 'Dễ',
    parMoves: 24,
    map: [
      [1, 1, 1, 1, 1, 1, 1],
      [1, 2, 0, 3, 0, 2, 1],
      [1, 0, 3, 5, 3, 0, 1],
      [1, 0, 0, 2, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1]
    ]
  },

  // --- CẤP ĐỘ 2: TRUNG BÌNH (LEVEL 6 - 10) ---
  {
    name: 'Màn 6: Trục Đổi Hướng',
    difficulty: 'Trung bình',
    parMoves: 28,
    map: [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 2, 2, 0, 0, 1],
      [1, 0, 1, 3, 3, 1, 0, 1],
      [1, 0, 0, 0, 5, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1]
    ]
  },
  {
    name: 'Màn 7: Phòng Chữ U',
    difficulty: 'Trung bình',
    parMoves: 32,
    map: [
      [1, 1, 1, 1, 1, 1, 1],
      [1, 2, 0, 1, 0, 2, 1],
      [1, 0, 3, 1, 3, 0, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 0, 5, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1]
    ]
  },
  {
    name: 'Màn 8: Ngã Tư Đường Hầm',
    difficulty: 'Trung bình',
    parMoves: 36,
    map: [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 2, 1, 0, 0, 1],
      [1, 0, 3, 0, 0, 3, 0, 1],
      [1, 2, 0, 5, 0, 0, 2, 1],
      [1, 0, 3, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1]
    ]
  },
  {
    name: 'Màn 9: Sàn Băng Chéo',
    difficulty: 'Trung bình',
    parMoves: 26,
    map: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 5, 0, 7, 7, 0, 2, 0, 1],
      [1, 0, 3, 7, 7, 3, 0, 2, 1],
      [1, 0, 0, 1, 1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
  },
  {
    name: 'Màn 10: Vòng Xoáy Bốn Hộp',
    difficulty: 'Trung bình',
    parMoves: 42,
    map: [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 2, 0, 0, 2, 0, 1],
      [1, 0, 3, 1, 1, 3, 0, 1],
      [1, 0, 3, 5, 0, 3, 0, 1],
      [1, 0, 2, 0, 0, 2, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1]
    ]
  },

  // --- CẤP ĐỘ 3: THỬ THÁCH HACK NÃO (LEVEL 11 - 15) ---
  {
    name: 'Màn 11: Mê Cung Microban I',
    difficulty: 'Khó',
    parMoves: 48,
    map: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 0, 3, 2, 1, 2, 3, 0, 1],
      [1, 0, 0, 0, 5, 0, 0, 0, 1],
      [1, 0, 3, 2, 1, 2, 3, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
  },
  {
    name: 'Màn 12: Hốc Tường Ép Góc',
    difficulty: 'Khó',
    parMoves: 54,
    map: [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 2, 2, 0, 0, 0, 1],
      [1, 0, 1, 3, 3, 3, 0, 1],
      [1, 0, 0, 0, 1, 0, 5, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1]
    ]
  },
  {
    name: 'Màn 13: Băng & Lửa',
    difficulty: 'Khó',
    parMoves: 44,
    map: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 5, 0, 7, 7, 7, 0, 0, 1],
      [1, 0, 3, 7, 1, 7, 3, 0, 1],
      [1, 0, 0, 7, 7, 7, 2, 2, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
  },
  {
    name: 'Màn 14: Lò Luyện Hacker DEVER',
    difficulty: 'Khó',
    parMoves: 60,
    map: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 2, 0, 1, 0, 2, 0, 1],
      [1, 0, 3, 0, 3, 0, 3, 0, 1],
      [1, 2, 0, 1, 5, 1, 0, 2, 1],
      [1, 0, 3, 0, 3, 0, 3, 0, 1],
      [1, 0, 2, 0, 1, 0, 2, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
  },
  {
    name: 'Màn 15: Chung Kết Sokoban Đại Pháp',
    difficulty: 'Cực khó',
    parMoves: 72,
    map: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 1, 2, 2, 1, 0, 0, 1],
      [1, 0, 3, 0, 0, 0, 0, 3, 0, 1],
      [1, 0, 0, 3, 5, 0, 3, 0, 0, 1],
      [1, 1, 0, 0, 1, 1, 0, 0, 1, 1],
      [1, 2, 2, 0, 0, 0, 0, 2, 2, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
  }
];

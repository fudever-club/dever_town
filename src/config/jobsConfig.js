/**
 * DEVER TOWN — CẤU HÌNH VIỆC LÀM CAMPUS (PHASE D1)
 *
 * Mọi hằng số cân bằng việc làm BẮT BUỘC nằm ở đây, không hardcode trong
 * các job class (CleanerJob, DeliveryJob, BugHunterJob) hay UI (JobsModal).
 *
 * CONTRACT VỚI WORKER ĐỒNG THỜI (sibling: Fishing + Barista reskin):
 *   - Worker đọc JOBS_CONFIG.wages.barista và JOBS_CONFIG.wages.fishing
 *     (khóa CHÍNH XÁC như bên dưới). Không đổi tên/đổi cấu trúc các khóa này
 *     khi chưa bàn với worker.
 *   - jobsConfig.js do worker Phase D1 sở hữu; worker sibling CHỈ đọc wages.
 */

export const JOBS_CONFIG = {
  /**
   * Tiền công D-Coin cho mỗi việc. Khóa 'fishing' là object { common, rare }
   * phục vụ worker sibling — giữ nguyên hình dạng này.
   */
  wages: {
    cleaner: 15,    // +15 D-Coin cho mỗi lần phân loại rác ĐÚNG
    barista: 25,    // worker sibling (BaristaSimulatorEngine reskin)
    delivery: 35,   // +35 D-Coin khi giao đúng giờ
    bugHunter: 40,  // +40 D-Coin cho mỗi con bọ bắt đúng quiz
    fishing: {      // worker sibling (Fishing)
      common: 20,
      rare: 50,
    },
  },

  /** Bán kính tương tác E chung cho mọi vật thể việc làm (px). */
  interactRadius: 56,

  /** Phòng Sảnh Alpha — nơi chạy Cleaner + Bug Hunter. */
  mainHallRoomId: 'main_hall',

  // ------------------------------------------------------ LAO CÔNG ------
  cleaner: {
    /** Số rác sinh ra mỗi ca. */
    litterCount: 8,
    /** Ô cỏ gần hồ vườn sân Tòa Alpha (tile 0 = cỏ, đi bộ được).
     *  Né zone câu cá của worker sibling tại (6,17) — cách ≥ 2 ô để tooltip
     *  [E] không chồng lấn. */
    litterTiles: [
      { tileX: 10, tileY: 16, kind: 'cup' },
      { tileX: 12, tileY: 16, kind: 'bottle' },
      { tileX: 13, tileY: 16, kind: 'banana' },
      { tileX: 14, tileY: 16, kind: 'cup' },
      { tileX: 8, tileY: 18, kind: 'bottle' },
      { tileX: 10, tileY: 18, kind: 'apple' },
      { tileX: 12, tileY: 18, kind: 'cup' },
      { tileX: 14, tileY: 18, kind: 'banana' },
    ],
    /** Hai thùng phân loại đặt trên cỏ cạnh hồ (không chặn lối đi). */
    bins: {
      inorganic: { tileX: 8, tileY: 16, label: 'Thùng Vô Cơ' },
      organic: { tileX: 9, tileY: 16, label: 'Thùng Hữu Cơ' },
    },
    /** Ánh xạ loại rác → thùng đúng. */
    kindToBin: {
      cup: 'inorganic',     // cốc trà sữa (nhựa) → Vô cơ
      bottle: 'inorganic',  // chai nhựa → Vô cơ
      banana: 'organic',    // vỏ chuối → Hữu cơ
      apple: 'organic',     // lõi táo → Hữu cơ
    },
    kindLabels: {
      cup: 'Cốc trà sữa',
      bottle: 'Chai nhựa',
      banana: 'Vỏ chuối',
      apple: 'Lõi táo',
    },
    walletSource: 'job_cleaner',
  },

  // --------------------------------------------------- GIAO HÀNG ------
  delivery: {
    /** Giới hạn thời gian giao hàng (giây) — hằng số cân bằng chính. */
    timeLimitSec: 60,
    /** Điểm nhận đơn: Quầy Thực Đơn Căn Tin FUDA (canteen_cafe). */
    pickup: {
      roomId: 'canteen_cafe',
      tileX: 4,
      tileY: 2,
      label: 'Quầy Căn Tin',
    },
    /** Điểm giao: Bàn Học Cá Nhân KTX (dorm_room) — ô sàn kề bàn. */
    target: {
      roomId: 'dorm_room',
      tileX: 8,
      tileY: 4,
      label: 'Bàn Học KTX',
    },
    walletSource: 'job_delivery',
  },

  // ------------------------------------------------- SĂN BỌ (BUG HUNTER) ------
  bugHunter: {
    /** Số bọ phát sáng lang thang quanh vườn hoa mỗi ca. */
    bugCount: 4,
    /** Vùng lang thang (px) — vườn hoa sân Tòa Alpha, tiles (10..15, 16..19). */
    bounds: { x0: 320, y0: 512, x1: 480, y1: 608 },
    speedMin: 26,   // px/s — bọ bò chậm, dễ đuổi kịp
    speedMax: 44,
    steerTimeMin: 1.5, // s giữa các lần đổi hướng
    steerTimeMax: 3.5,
    glowPeriod: 1.6,   // s chu kỳ nhấp nháy phát sáng
    /** Nhóm câu hỏi quiz từ src/config/quizQuestions.js (Git/JS chưa có
     *  trong ngân hàng — dùng Python + Toán, ghi nhận deviation). */
    quizCategories: ['python', 'math'],
    walletSource: 'job_bug_hunter',
  },
};

/**
 * Metadata 5 việc làm hiển thị trên JobsModal. 'engineKey' cho biết class
 * nội bộ (cleaner/delivery/bugHunter) hay worker sibling (barista/fishing).
 */
export const JOBS_LIST = [
  {
    id: 'cleaner',
    engineKey: 'cleaner',
    name: 'Lao Công Campus',
    wageText: `+${JOBS_CONFIG.wages.cleaner} D-Coin / lần phân loại`,
    description: 'Nhặt rác quanh hồ vườn sân Tòa Alpha, phân loại đúng thùng Vô cơ / Hữu cơ.',
  },
  {
    id: 'barista',
    engineKey: 'barista',
    name: 'Barista Căn Tin',
    wageText: `+${JOBS_CONFIG.wages.barista} D-Coin / ca`,
    description: 'Pha chế cà phê muối & trà sữa tại quầy Căn Tin (đang hoàn thiện).',
  },
  {
    id: 'delivery',
    engineKey: 'delivery',
    name: 'Giao Hàng KTX',
    wageText: `+${JOBS_CONFIG.wages.delivery} D-Coin / đơn`,
    description: `Nhận đơn tại Căn Tin, giao đến KTX trong ${JOBS_CONFIG.delivery.timeLimitSec} giây.`,
  },
  {
    id: 'bugHunter',
    engineKey: 'bugHunter',
    name: 'Săn Bọ Đêm',
    wageText: `+${JOBS_CONFIG.wages.bugHunter} D-Coin / con`,
    description: 'Vợt bọ phát sáng trong vườn hoa, trả lời quiz code để giữ chiến lợi phẩm.',
  },
  {
    id: 'fishing',
    engineKey: 'fishing',
    name: 'Câu Cá Hồ Vườn',
    wageText: `+${JOBS_CONFIG.wages.fishing.common} / +${JOBS_CONFIG.wages.fishing.rare} D-Coin`,
    description: 'Thả câu bên hồ vườn: cá thường +20, cá hiếm +50 (đang hoàn thiện).',
  },
];

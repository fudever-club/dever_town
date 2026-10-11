/**
 * DEVER TOWN — CẤU HÌNH KINH TẾ TRUNG TÂM (CENTRAL ECONOMY)
 *
 * Mọi hằng số cân bằng kinh tế D-Coin BẮT BUỘC nằm ở đây (AGENTS.md §6),
 * không hardcode trong managers, engines hay UI.
 *
 * Phase B: nền tảng kinh tế cho hướng GraalOnline (việc làm campus,
 * clan, shop). WalletManager là ví trung tâm duy nhất được phép
 * cộng/trừ D-Coin; các engine/modal chỉ gọi walletManager.earn()/spend().
 */
export const ECONOMY_CONFIG = {
  /** Key localStorage lưu số dư ví D-Coin trung tâm. */
  walletStorageKey: 'devertown_wallet_v1',

  /** Số dư khởi đầu của ví mới (người chơi mới bắt đầu từ 0 D-Coin). */
  startingBalance: 0,
};

/**
 * BaseDatabaseAdapter: Giao diện chuẩn cho tất cả Database Adapters.
 */
export class BaseDatabaseAdapter {
  async init() {
    throw new Error('Method init() must be implemented');
  }

  async getUserById(id) {
    throw new Error('Method getUserById() must be implemented');
  }

  async getUserByEmail(email) {
    throw new Error('Method getUserByEmail() must be implemented');
  }

  async getUserByDisplayName(displayName) {
    throw new Error('Method getUserByDisplayName() must be implemented');
  }

  async createUser({ email, passwordHash, displayName, avatarId, role }) {
    throw new Error('Method createUser() must be implemented');
  }

  async updateUser(id, updateData) {
    throw new Error('Method updateUser() must be implemented');
  }

  async updateCustomization(id, { wardrobeConfig, equippedItemId, deverPoints }) {
    throw new Error('Method updateCustomization() must be implemented');
  }

  async saveGameScore(userId, { gameType, score, streak, playerName }) {
    throw new Error('Method saveGameScore() must be implemented');
  }

  async getGameScores(userId) {
    throw new Error('Method getGameScores() must be implemented');
  }

  async getLeaderboard(gameType, limit = 10) {
    throw new Error('Method getLeaderboard() must be implemented');
  }

  async getAllUsers() {
    throw new Error('Method getAllUsers() must be implemented');
  }

  async updatePasswordByEmail(email, passwordHash) {
    throw new Error('Method updatePasswordByEmail() must be implemented');
  }

  async saveOtp(email, otpCode, expiresAt) {
    throw new Error('Method saveOtp() must be implemented');
  }

  async getOtp(email) {
    throw new Error('Method getOtp() must be implemented');
  }

  async incrementOtpAttempts(email) {
    throw new Error('Method incrementOtpAttempts() must be implemented');
  }

  async deleteOtp(email) {
    throw new Error('Method deleteOtp() must be implemented');
  }
}

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

  async createUser({ email, passwordHash, displayName, avatarId, role }) {
    throw new Error('Method createUser() must be implemented');
  }

  async updateUser(id, updateData) {
    throw new Error('Method updateUser() must be implemented');
  }

  async getAllUsers() {
    throw new Error('Method getAllUsers() must be implemented');
  }
}

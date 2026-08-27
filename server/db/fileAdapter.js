import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { BaseDatabaseAdapter } from './baseAdapter.js';

export class FileDatabaseAdapter extends BaseDatabaseAdapter {
  constructor(filePath = path.resolve('server/data/users.json')) {
    super();
    this.filePath = filePath;
    this.users = new Map();
    this.writePromise = Promise.resolve();
  }

  async init() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const list = JSON.parse(raw || '[]');
        this.users.clear();
        for (const u of list) {
          this.users.set(u.id, u);
        }
        console.log(`📁 [FileDB] Đã nạp ${this.users.size} tài khoản từ ${this.filePath}`);
      } catch (err) {
        console.warn(`⚠️ [FileDB] Không thể đọc file users.json, tạo mới:`, err.message);
        await this.seedDefaults();
      }
    } else {
      await this.seedDefaults();
    }
  }

  async seedDefaults() {
    this.users.clear();

    const adminHash = await bcrypt.hash('admin123', 10);
    const leaderHash = await bcrypt.hash('leader123', 10);

    const adminUser = {
      id: 'usr_admin_001',
      email: 'admin@devertown.com',
      password_hash: adminHash,
      display_name: 'Dever Admin',
      avatar_id: 'cyberpunk_pink',
      role: 'admin',
      created_at: new Date().toISOString()
    };

    const leaderUser = {
      id: 'usr_leader_002',
      email: 'leader@devertown.com',
      password_hash: leaderHash,
      display_name: 'Club President',
      avatar_id: 'red_gamer',
      role: 'leader',
      created_at: new Date().toISOString()
    };

    this.users.set(adminUser.id, adminUser);
    this.users.set(leaderUser.id, leaderUser);

    await this.saveToFile();
    console.log(`✨ [FileDB] Đã khởi tạo 2 tài khoản mẫu (admin@devertown.com / admin123, leader@devertown.com / leader123)`);
  }

  async saveToFile() {
    this.writePromise = this.writePromise.then(async () => {
      const data = Array.from(this.users.values());
      const tempPath = `${this.filePath}.tmp`;
      await fs.promises.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      await fs.promises.rename(tempPath, this.filePath);
    });
    return this.writePromise;
  }

  async getUserById(id) {
    return this.users.get(id) || null;
  }

  async getUserByEmail(email) {
    const cleanEmail = email.toLowerCase().trim();
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === cleanEmail) {
        return u;
      }
    }
    return null;
  }

  async createUser({ email, passwordHash, displayName, avatarId, role = 'dev' }) {
    const id = `usr_${crypto.randomUUID().substring(0, 8)}`;
    const newUser = {
      id,
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      display_name: displayName.trim(),
      avatar_id: avatarId || 'dev_hoodie',
      role: role || 'dev',
      created_at: new Date().toISOString()
    };

    this.users.set(id, newUser);
    await this.saveToFile();
    return newUser;
  }

  async updateUser(id, { displayName, avatarId }) {
    const user = this.users.get(id);
    if (!user) return null;

    if (displayName) user.display_name = displayName.trim();
    if (avatarId) user.avatar_id = avatarId;

    await this.saveToFile();
    return user;
  }

  async getAllUsers() {
    return Array.from(this.users.values()).map(u => {
      const { password_hash, ...safe } = u;
      return safe;
    });
  }
}

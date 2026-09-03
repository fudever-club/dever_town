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

  async getUserByDisplayName(displayName) {
    const cleanName = (displayName || '').toLowerCase().trim();
    if (!cleanName) return null;
    for (const u of this.users.values()) {
      if ((u.display_name || '').toLowerCase().trim() === cleanName) {
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

  async updateCustomization(id, { wardrobeConfig, equippedItemId, deverPoints }) {
    const user = this.users.get(id);
    if (!user) return null;

    if (wardrobeConfig !== undefined) user.wardrobe_config = wardrobeConfig;
    if (equippedItemId !== undefined) user.equipped_item_id = equippedItemId;
    if (deverPoints !== undefined) user.dever_points = deverPoints;

    await this.saveToFile();
    return user;
  }

  async syncFullUserProfile(id, {
    wardrobeConfig,
    inventoryItems,
    equippedItemId,
    deverPoints,
    questsState,
    questDate,
    questMilestone,
    gameRecords
  }) {
    const user = this.users.get(id);
    if (!user) return null;

    if (wardrobeConfig !== undefined) user.wardrobe_config = wardrobeConfig;
    if (inventoryItems !== undefined) user.inventory_items = inventoryItems;
    if (equippedItemId !== undefined) user.equipped_item_id = equippedItemId;
    if (deverPoints !== undefined) user.dever_points = deverPoints;
    if (questsState !== undefined) user.quests_state = questsState;
    if (questDate !== undefined) user.quest_date = questDate;
    if (questMilestone !== undefined) user.quest_milestone = questMilestone;
    if (gameRecords !== undefined) {
      user.game_records = {
        ...(user.game_records || {}),
        ...gameRecords
      };
    }

    await this.saveToFile();
    return user;
  }

  getGameScoresFilePath() {
    return path.resolve('server/data/game_scores.json');
  }

  async readGameScores() {
    const filePath = this.getGameScoresFilePath();
    if (!fs.existsSync(filePath)) return [];
    try {
      const raw = await fs.promises.readFile(filePath, 'utf-8');
      return JSON.parse(raw || '[]');
    } catch {
      return [];
    }
  }

  async writeGameScores(scores) {
    const filePath = this.getGameScoresFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const tempPath = `${filePath}.tmp`;
    await fs.promises.writeFile(tempPath, JSON.stringify(scores, null, 2), 'utf-8');
    await fs.promises.rename(tempPath, filePath);
  }

  async saveGameScore(userId, { gameType, score = 0, streak = 0, playerName = 'Thành viên' }) {
    const scores = await this.readGameScores();
    let record = scores.find(s => s.user_id === userId && s.game_type === gameType);

    if (record) {
      record.player_name = playerName;
      record.high_score = Math.max(record.high_score || 0, score);
      record.best_streak = Math.max(record.best_streak || 0, streak);
      record.last_played = new Date().toISOString();
    } else {
      record = {
        id: `sc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        user_id: userId,
        player_name: playerName,
        game_type: gameType,
        high_score: score,
        best_streak: streak,
        last_played: new Date().toISOString()
      };
      scores.push(record);
    }

    await this.writeGameScores(scores);
    return record;
  }

  async getGameScores(userId) {
    const scores = await this.readGameScores();
    return scores.filter(s => s.user_id === userId);
  }

  async getLeaderboard(gameType, limit = 10) {
    const scores = await this.readGameScores();
    return scores
      .filter(s => s.game_type === gameType)
      .sort((a, b) => (b.high_score || 0) - (a.high_score || 0))
      .slice(0, limit);
  }

  async getAllUsers() {
    return Array.from(this.users.values()).map(u => {
      const { password_hash, ...safe } = u;
      return safe;
    });
  }

  async updatePasswordByEmail(email, passwordHash) {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    user.password_hash = passwordHash;
    await this.saveToFile();
    return user;
  }

  async saveOtp(email, otpCode, expiresAt) {
    if (!this.otps) this.otps = new Map();
    this.otps.set(email.toLowerCase().trim(), {
      otp: String(otpCode).trim(),
      expiresAt: Number(expiresAt),
      attempts: 0
    });
  }

  async getOtp(email) {
    if (!this.otps) this.otps = new Map();
    return this.otps.get(email.toLowerCase().trim()) || null;
  }

  async incrementOtpAttempts(email) {
    if (!this.otps) this.otps = new Map();
    const cleanEmail = email.toLowerCase().trim();
    const record = this.otps.get(cleanEmail);
    if (record) record.attempts = (record.attempts || 0) + 1;
  }

  async deleteOtp(email) {
    if (!this.otps) this.otps = new Map();
    this.otps.delete(email.toLowerCase().trim());
  }
}

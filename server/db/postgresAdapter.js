import { BaseDatabaseAdapter } from './baseAdapter.js';

export class PostgresDatabaseAdapter extends BaseDatabaseAdapter {
  constructor(connectionString) {
    super();
    this.connectionString = connectionString;
    this.pool = null;
  }

  async init() {
    try {
      const { Pool } = await import('pg');
      this.pool = new Pool({
        connectionString: this.connectionString,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });

      // Tạo bảng users & game_scores theo schema thiết kế
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(50) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          display_name VARCHAR(50) NOT NULL,
          avatar_id VARCHAR(50) NOT NULL DEFAULT 'dev_hoodie',
          role VARCHAR(20) NOT NULL DEFAULT 'dev',
          wardrobe_config JSONB DEFAULT '{}',
          equipped_item_id VARCHAR(50) DEFAULT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS game_scores (
          id VARCHAR(50) PRIMARY KEY,
          user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          player_name VARCHAR(50) NOT NULL,
          game_type VARCHAR(50) NOT NULL,
          high_score INTEGER NOT NULL DEFAULT 0,
          best_streak INTEGER NOT NULL DEFAULT 0,
          last_played TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE (user_id, game_type)
        );
      `);

      console.log(`🐘 [PostgresDB] Đã kết nối thành công và khởi tạo bảng users, game_scores.`);
    } catch (err) {
      console.warn(`⚠️ [PostgresDB] Lỗi khởi tạo PostgreSQL:`, err.message);
      throw err;
    }
  }

  async getUserById(id) {
    const res = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0] || null;
  }

  async getUserByEmail(email) {
    const res = await this.pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    return res.rows[0] || null;
  }

  async createUser({ email, passwordHash, displayName, avatarId, role = 'dev' }) {
    const id = `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const query = `
      INSERT INTO users (id, email, password_hash, display_name, avatar_id, role, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *;
    `;
    const values = [id, email.toLowerCase().trim(), passwordHash, displayName.trim(), avatarId || 'dev_hoodie', role];
    const res = await this.pool.query(query, values);
    return res.rows[0];
  }

  async updateUser(id, { displayName, avatarId }) {
    const query = `
      UPDATE users
      SET display_name = COALESCE($2, display_name),
          avatar_id = COALESCE($3, avatar_id)
      WHERE id = $1
      RETURNING *;
    `;
    const res = await this.pool.query(query, [id, displayName, avatarId]);
    return res.rows[0] || null;
  }

  async updateCustomization(id, { wardrobeConfig, equippedItemId }) {
    const query = `
      UPDATE users
      SET wardrobe_config = COALESCE($2, wardrobe_config),
          equipped_item_id = COALESCE($3, equipped_item_id)
      WHERE id = $1
      RETURNING *;
    `;
    const res = await this.pool.query(query, [id, wardrobeConfig ? JSON.stringify(wardrobeConfig) : null, equippedItemId]);
    return res.rows[0] || null;
  }

  async saveGameScore(userId, { gameType, score = 0, streak = 0, playerName = 'Thành viên' }) {
    const query = `
      INSERT INTO game_scores (id, user_id, player_name, game_type, high_score, best_streak, last_played)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (user_id, game_type) DO UPDATE
      SET player_name = EXCLUDED.player_name,
          high_score = GREATEST(game_scores.high_score, EXCLUDED.high_score),
          best_streak = GREATEST(game_scores.best_streak, EXCLUDED.best_streak),
          last_played = NOW()
      RETURNING *;
    `;
    const id = `sc_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const res = await this.pool.query(query, [id, userId, playerName, gameType, score, streak]);
    return res.rows[0];
  }

  async getGameScores(userId) {
    const res = await this.pool.query('SELECT * FROM game_scores WHERE user_id = $1', [userId]);
    return res.rows;
  }

  async getLeaderboard(gameType, limit = 10) {
    const res = await this.pool.query(
      'SELECT * FROM game_scores WHERE game_type = $1 ORDER BY high_score DESC LIMIT $2',
      [gameType, limit]
    );
    return res.rows;
  }

  async getAllUsers() {
    const res = await this.pool.query('SELECT id, email, display_name, avatar_id, role, wardrobe_config, equipped_item_id, created_at FROM users');
    return res.rows;
  }
}

import { GAME_CONFIG } from '../config/gameConfig.js';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('dever_token') || null;
    this.user = null;
    try {
      const stored = localStorage.getItem('dever_user');
      this.user = stored ? JSON.parse(stored) : null;
    } catch (e) {
      this.user = null;
    }
  }

  getBaseUrl() {
    return GAME_CONFIG.NETWORK.SERVER_URL;
  }

  isLoggedIn() {
    return !!this.token && !!this.user;
  }

  getToken() {
    return this.token;
  }

  getUser() {
    return this.user;
  }

  async register({ email, password, displayName, avatarId }) {
    const res = await fetch(`${this.getBaseUrl()}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName, avatarId })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Đăng ký thất bại');
    }

    this.saveSession(data.token, data.user);
    return data.user;
  }

  async login({ email, password }) {
    const res = await fetch(`${this.getBaseUrl()}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Đăng nhập thất bại');
    }

    this.saveSession(data.token, data.user);
    return data.user;
  }

  async fetchMe() {
    if (!this.token) return null;

    try {
      const res = await fetch(`${this.getBaseUrl()}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        this.user = data.user;
        localStorage.setItem('dever_user', JSON.stringify(data.user));
        this.applyUserServerData(data.user);
        return data.user;
      }
    } catch (err) {
      console.warn('⚠️ Lỗi kiểm tra phiên đăng nhập:', err);
    }
    return null;
  }

  async updateProfile({ displayName, avatarId }) {
    if (!this.token) {
      // Khách vãng lai: Lưu tạm vào LocalStorage
      const guestUser = this.user || { role: 'guest' };
      guestUser.display_name = displayName;
      guestUser.avatar_id = avatarId;
      this.user = guestUser;
      localStorage.setItem('dever_user', JSON.stringify(guestUser));
      localStorage.setItem('dever_nickname', displayName);
      return guestUser;
    }

    const res = await fetch(`${this.getBaseUrl()}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({ displayName, avatarId })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Cập nhật thất bại');
    }

    this.user = data.user;
    localStorage.setItem('dever_user', JSON.stringify(data.user));
    localStorage.setItem('dever_nickname', data.user.display_name);
    return data.user;
  }

  applyUserServerData(user) {
    if (!user) return;
    try {
      if (user.wardrobe_config) {
        localStorage.setItem('dever_wardrobe_config', JSON.stringify(user.wardrobe_config));
        window.__currentWardrobe = user.wardrobe_config;
      }
      if (user.inventory_items) {
        localStorage.setItem('dever_inventory_items', JSON.stringify(user.inventory_items));
      }
      if (user.equipped_item_id) {
        localStorage.setItem('dever_equipped_item', user.equipped_item_id);
      }
      if (user.dever_points !== undefined && user.dever_points !== null) {
        localStorage.setItem('dever_points', user.dever_points.toString());
      }
      if (user.quests_state) {
        localStorage.setItem('dever_quests_state', JSON.stringify(user.quests_state));
      }
      if (user.quest_date) {
        localStorage.setItem('dever_quest_date', user.quest_date);
      }
      if (user.quest_milestone !== undefined && user.quest_milestone !== null) {
        localStorage.setItem('dever_quest_milestone', user.quest_milestone.toString());
      }
      if (user.game_records) {
        if (user.game_records.footballHigh !== undefined) {
          localStorage.setItem('dever_penalty_high', user.game_records.footballHigh.toString());
        }
        if (user.game_records.footballStreak !== undefined) {
          localStorage.setItem('dever_penalty_streak', user.game_records.footballStreak.toString());
        }
        if (user.game_records.basketballHigh !== undefined) {
          localStorage.setItem('dever_basketball_high', user.game_records.basketballHigh.toString());
        }
        if (user.game_records.volleyballHigh !== undefined) {
          localStorage.setItem('dever_volleyball_high', user.game_records.volleyballHigh.toString());
        }
        if (user.game_records.baristaScore !== undefined) {
          localStorage.setItem('dever_barista_score', user.game_records.baristaScore.toString());
        }
      }
    } catch (e) {
      console.warn('Lỗi đồng bộ dữ liệu người dùng từ máy chủ:', e);
    }
  }

  saveSession(token, user) {
    this.token = token;
    this.user = user;
    localStorage.setItem('dever_token', token);
    localStorage.setItem('dever_user', JSON.stringify(user));
    localStorage.setItem('dever_nickname', user.display_name);
    this.applyUserServerData(user);
  }

  async syncFullProfile(payload = {}) {
    if (!this.token) {
      // Khách vãng lai: cập nhật nhanh vào local memory
      return null;
    }

    try {
      const res = await fetch(`${this.getBaseUrl()}/api/auth/sync-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        this.user = data.user;
        localStorage.setItem('dever_user', JSON.stringify(data.user));
        return data.user;
      }
    } catch (err) {
      console.warn('⚠️ Lỗi đồng bộ dữ liệu người dùng lên máy chủ:', err);
    }
    return null;
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('dever_token');
    localStorage.removeItem('dever_user');
  }

  setGuestSession(displayName, avatarId) {
    this.token = null;
    this.user = {
      id: null,
      display_name: displayName,
      avatar_id: avatarId,
      role: 'guest'
    };
    localStorage.removeItem('dever_token');
    localStorage.setItem('dever_user', JSON.stringify(this.user));
    localStorage.setItem('dever_nickname', displayName);
    return this.user;
  }
}

export const authService = new AuthService();

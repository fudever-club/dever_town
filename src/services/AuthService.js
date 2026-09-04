import { GAME_CONFIG } from '../config/gameConfig.js';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('dever_token') || null;
    this.user = null;
    this.pendingSyncData = {};
    this.syncTimer = null;
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

  getDeviceId() {
    let deviceId = localStorage.getItem('dever_device_id');
    if (!deviceId) {
      deviceId = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem('dever_device_id', deviceId);
    }
    return deviceId;
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

  isAdmin() {
    if (!this.isLoggedIn() || !this.user) return false;
    const role = (this.user.role || '').toLowerCase();
    return role === 'admin' || role === 'leader';
  }

  saveSession(token, user) {
    this.token = token;
    this.user = user;
    if (token) localStorage.setItem('dever_token', token);
    if (user) {
      localStorage.setItem('dever_user', JSON.stringify(user));
      if (user.display_name) localStorage.setItem('dever_nickname', user.display_name);
      this.applyUserServerData(user);
    }
    this.touchSession();
  }

  touchSession() {
    localStorage.setItem('dever_last_active', Date.now().toString());
  }

  isSessionValid(maxIdleHours = 24) {
    const lastActive = Number(localStorage.getItem('dever_last_active') || 0);
    if (!lastActive) return false;
    const maxIdleMs = maxIdleHours * 60 * 60 * 1000;
    const isFresh = (Date.now() - lastActive) < maxIdleMs;
    const hasUser = !!this.user || !!localStorage.getItem('dever_user');
    return isFresh && hasUser;
  }

  setGuestSession(nickname) {
    this.token = null;
    this.user = {
      id: `guest_${Date.now()}`,
      display_name: nickname,
      displayName: nickname,
      role: 'guest',
      avatar_id: 'dev_hoodie'
    };
    localStorage.removeItem('dever_token');
    localStorage.setItem('dever_user', JSON.stringify(this.user));
    localStorage.setItem('dever_nickname', nickname);
    this.touchSession();
    return this.user;
  }

  async checkNameAvailability(name) {
    if (!name || !name.trim()) return { success: false, available: false, message: 'Tên không hợp lệ!' };
    try {
      const res = await fetch(`${this.getBaseUrl()}/api/auth/check-name?name=${encodeURIComponent(name.trim())}`);
      const data = await res.json();
      return data;
    } catch (e) {
      const cleanLower = name.trim().toLowerCase();
      const RESERVED = ['admin', 'bqt', 'leader', 'moderator', 'system', 'root', 'bot', 'fu-dever'];
      if (RESERVED.some(r => cleanLower === r || cleanLower.startsWith(`${r} `))) {
        return { success: true, available: false, message: 'Biệt danh này chứa từ khóa bảo vệ hệ thống!' };
      }
      return { success: true, available: true };
    }
  }

  async register({ email, password, displayName, avatarId }) {
    try {
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
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Máy chủ đang khởi động lại hoặc kết nối mạng bị gián đoạn. Vui lòng thử lại sau vài giây!');
      }
      throw err;
    }
  }

  async login({ email, password }) {
    try {
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
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Máy chủ đang khởi động lại hoặc kết nối mạng bị gián đoạn. Vui lòng thử lại sau vài giây!');
      }
      throw err;
    }
  }

  async loginWithGoogle({ email, displayName }) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = displayName ? displayName.trim() : cleanEmail.split('@')[0];
    const googleUser = {
      id: `google_${Date.now()}`,
      email: cleanEmail,
      display_name: cleanName,
      displayName: cleanName,
      role: 'dev',
      avatar_id: 'dev_hoodie',
      auth_provider: 'google',
      provider: 'google',
      dever_points: Number(localStorage.getItem('dever_points') || 0)
    };
    const mockToken = `google_token_${Date.now()}_${btoa(cleanEmail)}`;
    this.saveSession(mockToken, googleUser);
    return googleUser;
  }

  async requestPasswordReset(email) {
    try {
      const res = await fetch(`${this.getBaseUrl()}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Yêu cầu gửi mã OTP thất bại!');
      }
      return data;
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Máy chủ đang khởi động lại hoặc kết nối mạng bị gián đoạn. Vui lòng thử lại sau vài giây!');
      }
      throw err;
    }
  }

  async verifyResetOtp({ email, otpCode }) {
    try {
      const res = await fetch(`${this.getBaseUrl()}/api/auth/verify-reset-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otpCode: String(otpCode).trim() })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Mã OTP không hợp lệ!');
      }
      return data;
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Máy chủ đang khởi động lại hoặc kết nối mạng bị gián đoạn. Vui lòng thử lại sau vài giây!');
      }
      throw err;
    }
  }

  async resetPassword({ email, otpCode, newPassword }) {
    try {
      const res = await fetch(`${this.getBaseUrl()}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otpCode: String(otpCode).trim(),
          newPassword
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Đặt lại mật khẩu thất bại!');
      }
      return data;
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Máy chủ đang khởi động lại hoặc kết nối mạng bị gián đoạn. Vui lòng thử lại sau vài giây!');
      }
      throw err;
    }
  }

  async changePassword({ oldPassword, newPassword }) {
    if (!this.token) {
      throw new Error('Bạn cần đăng nhập tài khoản thành viên để đổi mật khẩu!');
    }
    try {
      const res = await fetch(`${this.getBaseUrl()}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Đổi mật khẩu thất bại!');
      }
      return data;
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Máy chủ đang khởi động lại hoặc kết nối mạng bị gián đoạn. Vui lòng thử lại sau vài giây!');
      }
      throw err;
    }
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
        this.touchSession();
        return data.user;
      }
    } catch (err) {
      console.warn('⚠️ Lỗi kiểm tra phiên đăng nhập:', err);
    }
    return null;
  }

  async updateProfile({ displayName, avatarId }) {
    if (!this.token) {
      const guestUser = this.user || { role: 'guest' };
      guestUser.display_name = displayName;
      guestUser.avatar_id = avatarId;
      this.user = guestUser;
      localStorage.setItem('dever_user', JSON.stringify(guestUser));
      localStorage.setItem('dever_nickname', displayName);
      this.touchSession();
      return guestUser;
    }

    try {
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
      this.touchSession();
      return data.user;
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Máy chủ đang khởi động lại hoặc kết nối mạng bị gián đoạn. Vui lòng thử lại sau vài giây!');
      }
      throw err;
    }
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
      console.warn('⚠️ Lỗi parse dữ liệu người dùng từ server:', e);
    }
  }

  /**
   * Đồng bộ toàn diện hồ sơ (Wardrobe, Quests, Items, Game Records) lên Database
   * @param {Object} data - Đối tượng chứa các trường dữ liệu cần đồng bộ
   * @returns {Promise<Object|null>}
   */
  syncFullProfile(data = {}) {
    if (!data || typeof data !== 'object') return Promise.resolve(null);

    // Deep merge gameRecords nếu có để không ghi đè mất kỷ lục các môn khác
    if (data.gameRecords && typeof data.gameRecords === 'object') {
      this.pendingSyncData.gameRecords = {
        ...(this.pendingSyncData.gameRecords || {}),
        ...data.gameRecords
      };
    }

    // Merge các thuộc tính còn lại
    Object.keys(data).forEach(key => {
      if (key !== 'gameRecords' && data[key] !== undefined) {
        this.pendingSyncData[key] = data[key];
      }
    });

    this.touchSession();

    if (!this.token) {
      return Promise.resolve(null);
    }

    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
    }

    return new Promise((resolve) => {
      this.syncTimer = setTimeout(async () => {
        const dataToSend = { ...this.pendingSyncData };
        this.pendingSyncData = {};
        this.syncTimer = null;

        try {
          const res = await fetch(`${this.getBaseUrl()}/api/auth/sync-profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify(dataToSend)
          });

          const resData = await res.json();
          if (res.ok && resData.success && resData.user) {
            this.user = resData.user;
            localStorage.setItem('dever_user', JSON.stringify(resData.user));
            resolve(resData.user);
          } else {
            resolve(null);
          }
        } catch (err) {
          console.warn('⚠️ Lỗi đồng bộ dữ liệu người dùng lên máy chủ:', err);
          resolve(null);
        }
      }, 400);
    });
  }

  queueProfileSync(field, value) {
    return this.syncFullProfile({ [field]: value });
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('dever_token');
    localStorage.removeItem('dever_user');
    localStorage.removeItem('dever_last_active');
  }
}

export const authService = new AuthService();

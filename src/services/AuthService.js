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

  saveSession(token, user) {
    this.token = token;
    this.user = user;
    localStorage.setItem('dever_token', token);
    localStorage.setItem('dever_user', JSON.stringify(user));
    localStorage.setItem('dever_nickname', user.display_name);
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

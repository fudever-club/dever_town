import { GAME_CONFIG } from '../config/gameConfig.js';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('dever_token') || null;
    this.user = null;
    this.pendingSyncData = {};
    this.syncTimer = null;
    this.syncResolvers = [];
    this.syncInFlight = false;
    this.syncRequestId = 0;
    this.activeSyncRequestId = null;
    this.activeSyncResolvers = [];
    this.syncAbortController = null;
    this.failedSyncData = null;
    this.syncStatus = { state: 'idle', error: null, lastSyncedAt: null };
    this.syncStatusListeners = new Set();
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
    if (this.user?.id && user?.id && this.user.id !== user.id) {
      this.clearPendingSync();
    }
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
    this.clearPendingSync();
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

  captureGuestSnapshot() {
    if (this.token) return null;

    const parseJSON = (key, defaultVal) => {
      try {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : defaultVal;
      } catch (e) {
        return defaultVal;
      }
    };

    const points = Number(localStorage.getItem('dever_points') || 0);
    const questsState = parseJSON('dever_quests_state', null);
    const questDate = localStorage.getItem('dever_quest_date') || null;
    const questMilestone = Number(localStorage.getItem('dever_quest_milestone') || 0);
    const wardrobeConfig = parseJSON('dever_wardrobe_config', null);
    const inventoryItems = parseJSON('dever_inventory_items', null);
    const friendsData = parseJSON('dever_friends_data', null);
    const exploredRooms = parseJSON('dever_explored_rooms', null);

    if (!points && !questsState && !inventoryItems && !wardrobeConfig && !friendsData && !exploredRooms) {
      return null;
    }

    return { points, questsState, questDate, questMilestone, wardrobeConfig, inventoryItems, friendsData, exploredRooms };
  }

  async mergeGuestProgressToAccount(snapshot, accountUser) {
    if (!snapshot || !accountUser) return;

    let mergedStats = { points: 0, quests: 0, items: 0 };
    const syncPayload = {};
    const oldPoints = accountUser.dever_points || 0;

    if (snapshot.points > oldPoints) {
      accountUser.dever_points = snapshot.points;
      localStorage.setItem('dever_points', snapshot.points.toString());
      syncPayload.dever_points = snapshot.points;
      mergedStats.points = snapshot.points;
    } else {
      mergedStats.points = oldPoints;
    }

    if (snapshot.questsState) {
      let currentQuests = accountUser.quests_state;
      if (typeof currentQuests === 'string') {
        try { currentQuests = JSON.parse(currentQuests); } catch(e) { currentQuests = {}; }
      }
      currentQuests = currentQuests || {};
      let updatedQuests = false;
      let questCount = 0;

      for (const [questId, guestProgress] of Object.entries(snapshot.questsState)) {
        const accountProgress = currentQuests[questId] || 0;
        if (guestProgress > accountProgress) {
          currentQuests[questId] = guestProgress;
          updatedQuests = true;
          questCount++;
        }
      }
      
      if (updatedQuests) {
        accountUser.quests_state = currentQuests;
        localStorage.setItem('dever_quests_state', JSON.stringify(currentQuests));
        syncPayload.quests_state = currentQuests;
        mergedStats.quests = questCount;
        
        if (snapshot.questDate) {
          accountUser.quest_date = snapshot.questDate;
          localStorage.setItem('dever_quest_date', snapshot.questDate);
          syncPayload.quest_date = snapshot.questDate;
        }
        if (snapshot.questMilestone !== undefined) {
          accountUser.quest_milestone = snapshot.questMilestone;
          localStorage.setItem('dever_quest_milestone', snapshot.questMilestone.toString());
          syncPayload.quest_milestone = snapshot.questMilestone;
        }
      }
    }

    if (snapshot.wardrobeConfig && (!accountUser.wardrobe_config || Object.keys(accountUser.wardrobe_config).length === 0)) {
      accountUser.wardrobe_config = snapshot.wardrobeConfig;
      localStorage.setItem('dever_wardrobe_config', JSON.stringify(snapshot.wardrobeConfig));
      window.__currentWardrobe = snapshot.wardrobeConfig;
      syncPayload.wardrobe_config = snapshot.wardrobeConfig;
    }

    if (snapshot.inventoryItems && Array.isArray(snapshot.inventoryItems)) {
      let currentItems = accountUser.inventory_items;
      if (typeof currentItems === 'string') {
        try { currentItems = JSON.parse(currentItems); } catch(e) { currentItems = []; }
      }
      currentItems = currentItems || [];
      if (!Array.isArray(currentItems)) currentItems = [];

      let newItemsCount = 0;
      const accountItemIds = new Set(currentItems.map(item => item.id || item));
      
      for (const guestItem of snapshot.inventoryItems) {
        const itemId = guestItem.id || guestItem;
        if (!accountItemIds.has(itemId)) {
          currentItems.push(guestItem);
          accountItemIds.add(itemId);
          newItemsCount++;
        }
      }

      if (newItemsCount > 0) {
        accountUser.inventory_items = currentItems;
        localStorage.setItem('dever_inventory_items', JSON.stringify(currentItems));
        syncPayload.inventory_items = currentItems;
        mergedStats.items = newItemsCount;
      }
    }

    if (snapshot.friendsData && Array.isArray(snapshot.friendsData)) {
      let currentFriends = accountUser.friends_data;
      if (typeof currentFriends === 'string') {
        try { currentFriends = JSON.parse(currentFriends); } catch(e) { currentFriends = []; }
      }
      currentFriends = currentFriends || [];
      if (!Array.isArray(currentFriends)) currentFriends = [];

      let newFriends = 0;
      const accountFriendIds = new Set(currentFriends.map(f => f.id));
      
      for (const guestFriend of snapshot.friendsData) {
        if (guestFriend.id && !accountFriendIds.has(guestFriend.id)) {
          currentFriends.push(guestFriend);
          accountFriendIds.add(guestFriend.id);
          newFriends++;
        }
      }

      if (newFriends > 0) {
        accountUser.friends_data = currentFriends;
        localStorage.setItem('dever_friends_data', JSON.stringify(currentFriends));
        syncPayload.friends_data = currentFriends;
      }
    }

    if (snapshot.exploredRooms && Array.isArray(snapshot.exploredRooms)) {
      let currentRooms = accountUser.explored_rooms;
      if (typeof currentRooms === 'string') {
        try { currentRooms = JSON.parse(currentRooms); } catch(e) { currentRooms = []; }
      }
      currentRooms = currentRooms || [];
      if (!Array.isArray(currentRooms)) currentRooms = [];

      let newRooms = 0;
      const accountRoomIds = new Set(currentRooms);
      
      for (const guestRoom of snapshot.exploredRooms) {
        if (!accountRoomIds.has(guestRoom)) {
          currentRooms.push(guestRoom);
          accountRoomIds.add(guestRoom);
          newRooms++;
        }
      }

      if (newRooms > 0) {
        accountUser.explored_rooms = currentRooms;
        localStorage.setItem('dever_explored_rooms', JSON.stringify(currentRooms));
        syncPayload.explored_rooms = currentRooms;
      }
    }

    console.log(`[GuestMerge] Merging guest progress: { points: ${oldPoints} \u2192 ${mergedStats.points}, quests: ${mergedStats.quests}, items: ${mergedStats.items} }`);

    if (Object.keys(syncPayload).length > 0) {
      this.syncFullProfile(syncPayload).catch(e => console.warn('[GuestMerge] Sync failed', e));
    }
  }

  async register({ email, password, displayName, avatarId }) {
    try {
      const guestSnapshot = this.captureGuestSnapshot();
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
      if (guestSnapshot) {
        await this.mergeGuestProgressToAccount(guestSnapshot, this.user);
      }
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
      const guestSnapshot = this.captureGuestSnapshot();
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
      if (guestSnapshot) {
        await this.mergeGuestProgressToAccount(guestSnapshot, this.user);
      }
      return data.user;
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Máy chủ đang khởi động lại hoặc kết nối mạng bị gián đoạn. Vui lòng thử lại sau vài giây!');
      }
      throw err;
    }
  }

  async loginWithGoogle({ email, displayName }) {
    const guestSnapshot = this.captureGuestSnapshot();
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
    if (guestSnapshot) {
      await this.mergeGuestProgressToAccount(guestSnapshot, this.user);
    }
    return this.user;
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

  getSyncStatus() {
    return { ...this.syncStatus };
  }

  subscribeToSyncStatus(callback) {
    if (typeof callback !== 'function') return () => {};
    this.syncStatusListeners.add(callback);
    callback(this.getSyncStatus());
    return () => this.syncStatusListeners.delete(callback);
  }

  setSyncStatus(state, error = null) {
    this.syncStatus = {
      state,
      error,
      lastSyncedAt: state === 'success' ? Date.now() : this.syncStatus.lastSyncedAt
    };
    const snapshot = this.getSyncStatus();
    this.syncStatusListeners.forEach(callback => {
      try {
        callback(snapshot);
      } catch (err) {
        console.warn('[AuthService] Lỗi cập nhật trạng thái đồng bộ:', err);
      }
    });
  }

  mergeSyncPatch(target, patch) {
    const merged = { ...target, ...patch };
    if (target.gameRecords || patch.gameRecords) {
      merged.gameRecords = {
        ...(target.gameRecords || {}),
        ...(patch.gameRecords || {})
      };
    }
    return merged;
  }

  /**
   * Đồng bộ local-first toàn bộ tiến trình người chơi. Các cập nhật gần nhau
   * được gộp lại để minigame không tạo một request cho mỗi frame/điểm số.
   */
  syncFullProfile(profilePatch = {}) {
    if (!profilePatch || typeof profilePatch !== 'object') {
      return Promise.resolve(null);
    }

    this.touchSession();

    if (!this.token) {
      this.setSyncStatus('local');
      return Promise.resolve(null);
    }

    const retryBase = this.mergeSyncPatch(this.failedSyncData || {}, this.pendingSyncData);
    this.pendingSyncData = this.mergeSyncPatch(retryBase, profilePatch);
    this.failedSyncData = null;
    this.setSyncStatus('pending');
    if (this.syncTimer) clearTimeout(this.syncTimer);

    const promise = new Promise(resolve => {
      this.syncResolvers.push(resolve);
    });

    this.syncTimer = setTimeout(() => this.flushProfileSync(), 400);
    return promise;
  }

  async flushProfileSync() {
    // A debounce timer can fire while the previous request is still awaiting a
    // response. Leave the queued patch untouched; the active request's finally
    // block will schedule the next serialized flush.
    this.syncTimer = null;
    if (this.syncInFlight) return null;
    if (!this.token || Object.keys(this.pendingSyncData).length === 0) return null;

    const dataToSend = { ...this.pendingSyncData };
    const resolvers = this.syncResolvers.splice(0);
    this.pendingSyncData = {};
    const requestId = ++this.syncRequestId;
    this.syncInFlight = true;
    this.activeSyncRequestId = requestId;
    this.activeSyncResolvers = resolvers;
    this.syncAbortController = new AbortController();
    this.setSyncStatus('pending');

    try {
      const res = await fetch(`${this.getBaseUrl()}/api/auth/sync-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify(dataToSend),
        signal: this.syncAbortController.signal
      });

      const data = await res.json();
      if (this.activeSyncRequestId !== requestId) return null;
      if (!res.ok || !data.success || !data.user) {
        throw new Error(data.message || 'Không thể đồng bộ tiến trình');
      }

      this.user = data.user;
      localStorage.setItem('dever_user', JSON.stringify(data.user));
      this.failedSyncData = null;
      this.setSyncStatus('success');
      resolvers.forEach(resolve => resolve(data.user));
      this.activeSyncResolvers = [];
      return data.user;
    } catch (err) {
      if (this.activeSyncRequestId !== requestId) return null;
      // A later request represents newer local state and must win when failed
      // batches are folded into the retry queue.
      this.failedSyncData = this.mergeSyncPatch(this.failedSyncData || {}, dataToSend);
      this.setSyncStatus('error', err.message || 'Mất kết nối máy chủ');
      resolvers.forEach(resolve => resolve(null));
      this.activeSyncResolvers = [];
      return null;
    } finally {
      if (this.activeSyncRequestId !== requestId) return;
      this.syncInFlight = false;
      this.activeSyncRequestId = null;
      this.activeSyncResolvers = [];
      this.syncAbortController = null;

      if (Object.keys(this.pendingSyncData).length > 0) {
        // Recover every field from the failed batch, then overlay the newer
        // queued values. A later partial patch can never erase older fields.
        this.pendingSyncData = this.mergeSyncPatch(
          this.failedSyncData || {},
          this.pendingSyncData
        );
        this.failedSyncData = null;
        this.setSyncStatus('pending');
        if (!this.syncTimer) {
          this.syncTimer = setTimeout(() => this.flushProfileSync(), 0);
        }
      }
    }
  }

  retryProfileSync() {
    if (!this.failedSyncData) return Promise.resolve(null);
    const retryData = this.mergeSyncPatch(this.failedSyncData, this.pendingSyncData);
    this.failedSyncData = null;
    this.pendingSyncData = {};
    return this.syncFullProfile(retryData);
  }

  clearPendingSync() {
    if (this.syncTimer) clearTimeout(this.syncTimer);
    if (this.syncAbortController) this.syncAbortController.abort();
    this.syncTimer = null;
    this.pendingSyncData = {};
    this.failedSyncData = null;
    this.syncResolvers.splice(0).forEach(resolve => resolve(null));
    this.activeSyncResolvers.splice(0).forEach(resolve => resolve(null));
    this.syncInFlight = false;
    this.activeSyncRequestId = null;
    this.syncAbortController = null;
    this.setSyncStatus('idle');
  }

  queueProfileSync(field, value) {
    return this.syncFullProfile({ [field]: value });
  }

  logout() {
    this.clearPendingSync();
    this.token = null;
    this.user = null;
    localStorage.removeItem('dever_token');
    localStorage.removeItem('dever_user');
    localStorage.removeItem('dever_last_active');
  }
}

export const authService = new AuthService();

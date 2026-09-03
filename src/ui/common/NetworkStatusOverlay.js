export class NetworkStatusOverlay {
  constructor({ socketManager } = {}) {
    this.socketManager = socketManager;
    this.overlayEl = document.getElementById('lag-spinner-overlay');
    this.spinnerTextEl = document.getElementById('lag-spinner-text');
    this.spinnerSubEl = document.getElementById('lag-spinner-sub');
    this.closeBtnEl = document.getElementById('lag-spinner-close-btn');
    this.pingBadgeEl = document.getElementById('network-ping-badge');
    this.currentPing = 0;
    this.isLagging = false;
    this.isManuallyDismissed = false;
    this.pingInterval = null;
    this.disconnectTimer = null;
    this.consecutiveHighPing = 0;

    this.init();
  }

  init() {
    if (this.closeBtnEl) {
      this.closeBtnEl.addEventListener('click', () => {
        this.isManuallyDismissed = true;
        this.hideLagSpinner();
      });
    }

    if (!this.socketManager) return;

    // Check if socket is already connected
    if (this.socketManager.socket) {
      this.bindSocketEvents(this.socketManager.socket);

      if (this.socketManager.socket.connected) {
        this.updateStatus(true, 35);
        this.hideLagSpinner();
      }
    }

    this.startPingLoop();
  }

  bindSocketEvents(socket) {
    if (!socket) return;

    socket.on('pongCheck', (clientTs) => {
      const ping = Math.max(1, Math.round(performance.now() - clientTs));
      this.handlePingResult(ping);
    });

    socket.on('connect', () => {
      this.clearDisconnectTimer();
      this.isManuallyDismissed = false;
      this.updateStatus(true, this.currentPing || 35);
      this.hideLagSpinner();
    });

    socket.on('disconnect', () => {
      this.updateStatus(false, 0);
      this.scheduleDisconnectWarning('⚠️ Mất kết nối tới máy chủ', 'Đang tự động kết nối lại trong nền (bạn vẫn có thể chơi bình thường)...');
    });

    socket.on('connect_error', () => {
      this.updateStatus(false, 0);
      this.scheduleDisconnectWarning('🔄 Máy chủ đang bận hoặc đang khởi động', 'Đang tự động kết nối lại... Bạn có thể tiếp tục di chuyển và khám phá.');
    });

    socket.on('reconnect_attempt', (attempt) => {
      this.updateStatus(false, 0);
      if (attempt > 3) {
        this.scheduleDisconnectWarning(`🔄 Đang thử kết nối lại (Lần ${attempt})...`, 'Hệ thống đang tìm kiếm đường truyền ổn định nhất...');
      }
    });

    socket.on('reconnect', () => {
      this.clearDisconnectTimer();
      this.isManuallyDismissed = false;
      this.hideLagSpinner();
      this.updateStatus(true, this.currentPing || 35);
    });
  }

  scheduleDisconnectWarning(title, sub) {
    if (this.disconnectTimer) return;

    // Chờ 4 giây nếu mất kết nối thực sự kéo dài mới hiện thông báo
    this.disconnectTimer = setTimeout(() => {
      if (!this.socketManager || !this.socketManager.isConnected) {
        if (!this.isManuallyDismissed) {
          this.showLagSpinner(title, sub);
        }
      }
      this.disconnectTimer = null;
    }, 4000);
  }

  clearDisconnectTimer() {
    if (this.disconnectTimer) {
      clearTimeout(this.disconnectTimer);
      this.disconnectTimer = null;
    }
  }

  startPingLoop() {
    if (this.pingInterval) clearInterval(this.pingInterval);

    this.pingInterval = setInterval(() => {
      if (this.socketManager && this.socketManager.socket && this.socketManager.isConnected) {
        this.socketManager.socket.emit('pingCheck', performance.now());
      }
    }, 2500);
  }

  handlePingResult(ping) {
    this.currentPing = ping;
    this.updateStatus(true, ping);

    if (ping > 350) {
      this.consecutiveHighPing++;
      if (this.consecutiveHighPing >= 2 && !this.isManuallyDismissed) {
        this.showLagSpinner(
          `⚠️ Đường truyền đang giật lag (${ping}ms)`,
          'Máy chủ đang tối ưu hóa và nội suy lại dữ liệu chuyển động...'
        );
      }
    } else {
      this.consecutiveHighPing = 0;
      if (this.isLagging) {
        this.hideLagSpinner();
      }
    }
  }

  updateStatus(online, ping) {
    if (!this.pingBadgeEl) return;

    if (!online) {
      this.pingBadgeEl.className = 'network-ping-badge offline';
      this.pingBadgeEl.innerHTML = '<span class="ping-dot red"></span> Mất kết nối';
      return;
    }

    let pingClass = 'good';
    let dotClass = 'green';

    if (ping > 300) {
      pingClass = 'high';
      dotClass = 'red';
    } else if (ping > 120) {
      pingClass = 'fair';
      dotClass = 'yellow';
    }

    this.pingBadgeEl.className = `network-ping-badge ${pingClass}`;
    this.pingBadgeEl.innerHTML = `<span class="ping-dot ${dotClass}"></span> ${ping}ms`;
  }

  showLagSpinner(title, sub) {
    this.isLagging = true;
    if (!this.overlayEl) return;

    if (this.spinnerTextEl) this.spinnerTextEl.textContent = title;
    if (this.spinnerSubEl) this.spinnerSubEl.textContent = sub;

    this.overlayEl.classList.remove('hidden');
  }

  hideLagSpinner() {
    this.isLagging = false;
    if (!this.overlayEl) return;
    this.overlayEl.classList.add('hidden');
  }

  destroy() {
    this.clearDisconnectTimer();
    if (this.pingInterval) clearInterval(this.pingInterval);
  }
}

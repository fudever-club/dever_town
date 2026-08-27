export class NetworkStatusOverlay {
  constructor({ socketManager } = {}) {
    this.socketManager = socketManager;
    this.overlayEl = document.getElementById('lag-spinner-overlay');
    this.spinnerTextEl = document.getElementById('lag-spinner-text');
    this.spinnerSubEl = document.getElementById('lag-spinner-sub');
    this.pingBadgeEl = document.getElementById('network-ping-badge');
    this.currentPing = 0;
    this.isLagging = false;
    this.pingInterval = null;
    this.consecutiveHighPing = 0;

    this.init();
  }

  init() {
    if (!this.socketManager) return;

    // Listen for socket events
    if (this.socketManager.socket) {
      this.bindSocketEvents(this.socketManager.socket);
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
      this.updateStatus(true, this.currentPing);
      this.hideLagSpinner();
    });

    socket.on('disconnect', () => {
      this.updateStatus(false, 0);
      this.showLagSpinner('⚠️ Mất kết nối tới máy chủ', 'Đang tự động thử kết nối lại...');
    });

    socket.on('connect_error', () => {
      this.showLagSpinner('🔄 Máy chủ đang bận hoặc gián đoạn', 'Đang kết nối lại...');
    });

    socket.on('reconnect_attempt', (attempt) => {
      this.showLagSpinner(`🔄 Đang thử kết nối lại (Lần ${attempt})...`, 'Vui lòng chờ trong giây lát...');
    });

    socket.on('reconnect', () => {
      this.hideLagSpinner();
      this.updateStatus(true, this.currentPing);
    });
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
      if (this.consecutiveHighPing >= 2) {
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
    if (this.pingInterval) clearInterval(this.pingInterval);
  }
}

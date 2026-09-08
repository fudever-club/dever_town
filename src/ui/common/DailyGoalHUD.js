import { questManager } from '../../managers/QuestManager.js';
import { authService } from '../../services/AuthService.js';
import { audioManager } from '../../utils/AudioManager.js';

/**
 * Compact, non-blocking session compass. QuestManager remains the only source
 * of truth; this component only renders its next-action projection.
 */
export class DailyGoalHUD {
  constructor({ onOpenQuests } = {}) {
    this.onOpenQuests = onOpenQuests;
    this.root = document.getElementById('daily-goal-hud');
    this.titleEl = document.getElementById('daily-goal-title');
    this.descriptionEl = document.getElementById('daily-goal-description');
    this.progressEl = document.getElementById('daily-goal-progress');
    this.progressTextEl = document.getElementById('daily-goal-progress-text');
    this.actionBtn = document.getElementById('daily-goal-action');
    this.collapseBtn = document.getElementById('daily-goal-collapse');
    this.syncEl = document.getElementById('daily-goal-sync-status');
    this.retryBtn = document.getElementById('daily-goal-retry');
    this.questState = questManager.getState();
    this.syncStatus = authService.getSyncStatus();

    if (!this.root) return;
    this.bindEvents();
    this.unsubscribeQuest = questManager.subscribe(state => {
      this.questState = state;
      this.render();
    });
    this.unsubscribeSync = authService.subscribeToSyncStatus(status => {
      this.syncStatus = status;
      this.renderSyncStatus();
    });
  }

  bindEvents() {
    this.actionBtn?.addEventListener('click', () => {
      audioManager.playClick();
      if (this.onOpenQuests) this.onOpenQuests(this.actionBtn);
    });

    this.collapseBtn?.addEventListener('click', () => {
      const collapsed = !this.root.classList.contains('collapsed');
      this.root.classList.toggle('collapsed', collapsed);
      this.collapseBtn.setAttribute('aria-expanded', String(!collapsed));
      this.collapseBtn.setAttribute(
        'aria-label',
        collapsed ? 'Mở mục tiêu hôm nay' : 'Thu gọn mục tiêu hôm nay'
      );
    });

    this.retryBtn?.addEventListener('click', () => {
      this.retryBtn.disabled = true;
      authService.retryProfileSync();
    });
  }

  cleanTitle(title = '') {
    return title.replace(/[\p{Extended_Pictographic}\uFE0F]/gu, '').replace(/\s+/g, ' ').trim();
  }

  render() {
    if (!this.root) return;
    const state = this.questState;
    if (!state?.sessionActive) {
      this.root.classList.add('hidden');
      return;
    }

    this.root.classList.remove('hidden');
    const goal = state.nextGoal;
    this.root.dataset.goalKind = goal.kind;
    this.titleEl.textContent = this.cleanTitle(goal.title);
    this.descriptionEl.textContent = goal.description;
    this.actionBtn.textContent = goal.actionLabel;

    const chestTarget = 4;
    const chestProgress = Math.min(chestTarget, state.completedCount);
    const chestPercent = Math.round((chestProgress / chestTarget) * 100);
    this.progressEl.style.width = `${chestPercent}%`;
    this.progressEl.parentElement?.setAttribute('aria-valuenow', String(chestProgress));
    this.progressTextEl.textContent = state.milestoneClaimed
      ? `${state.completedCount}/${state.totalCount} nhiệm vụ`
      : `${chestProgress}/${chestTarget} tới rương ngày`;

    this.root.classList.toggle('goal-ready', goal.kind === 'claim' || goal.kind === 'milestone');
    this.root.classList.toggle('goal-complete', goal.kind === 'complete');
    this.renderSyncStatus();
  }

  renderSyncStatus() {
    if (!this.syncEl || !this.retryBtn) return;
    const status = this.syncStatus || { state: 'idle' };
    this.root.dataset.syncState = status.state;
    this.retryBtn.classList.add('hidden');
    this.retryBtn.disabled = false;

    if (!authService.isLoggedIn() || status.state === 'local' || status.state === 'idle') {
      this.syncEl.textContent = 'Đã lưu trên thiết bị';
      return;
    }

    if (status.state === 'pending') {
      this.syncEl.textContent = 'Đang đồng bộ tiến trình…';
      return;
    }

    if (status.state === 'success') {
      this.syncEl.textContent = 'Đã đồng bộ tài khoản';
      return;
    }

    this.syncEl.textContent = 'Chưa đồng bộ — tiến trình vẫn an toàn trên thiết bị';
    this.retryBtn.classList.remove('hidden');
  }

  destroy() {
    this.unsubscribeQuest?.();
    this.unsubscribeSync?.();
  }
}

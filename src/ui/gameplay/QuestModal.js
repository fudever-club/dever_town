import { questManager } from '../../managers/QuestManager.js';
import { audioManager } from '../../utils/AudioManager.js';

export class QuestModal {
  constructor() {
    this.modalEl = document.getElementById('quest-modal');
    this.init();
  }

  init() {
    if (!this.modalEl) return;

    const closeBtn = document.getElementById('quest-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }

    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) {
        this.hide();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.hide();
      }
    });

    const headerBtn = document.getElementById('header-quests-btn');
    if (headerBtn) {
      headerBtn.addEventListener('click', () => {
        this.toggle();
        audioManager.playClick();
      });
    }

    const milestoneBtn = document.getElementById('quest-claim-milestone-btn');
    if (milestoneBtn) {
      milestoneBtn.addEventListener('click', () => {
        questManager.claimMilestone();
      });
    }

    // Subscribe to updates to update UI and Header badge
    questManager.subscribe((state) => {
      this.updateHeaderBadge(state);
      if (this.isOpen()) {
        this.render(state);
      }
    });
  }

  updateHeaderBadge(state) {
    const pointsEl = document.getElementById('header-points-display');
    if (pointsEl) {
      pointsEl.textContent = state.points.toLocaleString('vi-VN');
    }
  }

  isOpen() {
    return this.modalEl && !this.modalEl.classList.contains('hidden');
  }

  show() {
    if (!this.modalEl) return;
    this.modalEl.classList.remove('hidden');
    this.render(questManager.getState());
  }

  hide() {
    if (!this.modalEl) return;
    this.modalEl.classList.add('hidden');
  }

  toggle() {
    if (this.isOpen()) {
      this.hide();
    } else {
      this.show();
    }
  }

  render(state) {
    const rankEl = document.getElementById('quest-user-rank');
    const pointsEl = document.getElementById('quest-user-points');
    const progTextEl = document.getElementById('quest-prog-text');
    const progFillEl = document.getElementById('quest-prog-fill');
    const listEl = document.getElementById('quest-items-list');
    const milestoneBox = document.getElementById('quest-milestone-box');
    const milestoneBtn = document.getElementById('quest-claim-milestone-btn');

    if (rankEl) {
      rankEl.textContent = state.rank.title;
      rankEl.style.color = state.rank.color;
    }
    if (pointsEl) {
      pointsEl.textContent = `${state.points.toLocaleString('vi-VN')} DEVER Points`;
    }
    if (progTextEl) {
      progTextEl.textContent = `${state.completedCount} / ${state.totalCount} Hoàn thành`;
    }
    if (progFillEl) {
      const pct = Math.round((state.completedCount / state.totalCount) * 100);
      progFillEl.style.width = `${pct}%`;
    }

    // Milestone Check
    if (milestoneBtn) {
      if (state.milestoneClaimed) {
        milestoneBtn.textContent = '✅ Đã Nhận Thưởng';
        milestoneBtn.disabled = true;
        milestoneBtn.className = 'milestone-btn claimed';
      } else if (state.completedCount >= 4) {
        milestoneBtn.textContent = '🎁 MỞ RƯƠNG (+50 🪙)';
        milestoneBtn.disabled = false;
        milestoneBtn.className = 'milestone-btn ready pulse-anim';
      } else {
        milestoneBtn.textContent = `Khóa (Cần ${4 - state.completedCount} NV nữa)`;
        milestoneBtn.disabled = true;
        milestoneBtn.className = 'milestone-btn locked';
      }
    }

    // Render Quests List
    if (listEl) {
      listEl.innerHTML = '';
      state.quests.forEach((q) => {
        const item = document.createElement('div');
        item.className = `quest-item-card ${q.completed ? 'completed' : ''} ${q.claimed ? 'claimed' : ''}`;

        const pct = Math.min(100, Math.round((q.progress / q.target) * 100));

        item.innerHTML = `
          <div class="quest-icon-badge">${q.icon}</div>
          <div class="quest-info-block">
            <div class="quest-header-row">
              <span class="quest-item-title">${q.title}</span>
              <span class="quest-reward-tag">+${q.points} 🪙</span>
            </div>
            <p class="quest-item-desc">${q.desc}</p>
            <div class="quest-bar-row">
              <div class="quest-progress-track">
                <div class="quest-progress-fill" style="width: ${pct}%"></div>
              </div>
              <span class="quest-progress-count">${q.progress} / ${q.target}</span>
            </div>
          </div>
          <div class="quest-action-col">
            ${
              q.claimed
                ? '<button type="button" class="quest-claim-btn done" disabled>Đã Nhận</button>'
                : q.completed
                ? `<button type="button" class="quest-claim-btn ready" data-quest-id="${q.id}">Nhận +${q.points} 🪙</button>`
                : '<button type="button" class="quest-claim-btn in-prog" disabled>Chưa xong</button>'
            }
          </div>
        `;

        const claimBtn = item.querySelector('.quest-claim-btn.ready');
        if (claimBtn) {
          claimBtn.addEventListener('click', () => {
            questManager.claimQuestReward(q.id);
          });
        }

        listEl.appendChild(item);
      });
    }
  }
}

/**
 * DEVER TOWN — JOBS MODAL (VIỆC LÀM CAMPUS) — Phase D1
 *
 * Modal cyber-glass liệt kê 5 việc làm campus (JOBS_LIST trong
 * src/config/jobsConfig.js). Mở từ dock button [2] / phím 2 (GraalHUD).
 *
 * - cleaner / delivery / bugHunter: engine nội bộ Phase D1 (CleanerJob,
 *   DeliveryJob, BugHunterJob). Mỗi thời điểm chỉ 1 việc chạy.
 * - barista / fishing: worker sibling đồng thời. Nếu scene đã có
 *   scene.baristaJob / scene.fishingJob với hàm start() thì ủy quyền,
 *   ngược lại toast "đang hoàn thiện" — KHÔNG phụ thuộc cứng.
 *
 * Theo mẫu InventoryModal: markup trong index.html (#jobs-modal),
 * styles trong src/styles/jobs.css, không emoji, Tilt Neon / Be Vietnam Pro.
 */
import { JOBS_LIST } from '../../config/jobsConfig.js';
import { CleanerJob } from './CleanerJob.js';
import { DeliveryJob } from './DeliveryJob.js';
import { BugHunterJob } from './BugHunterJob.js';
import { walletManager } from '../../managers/WalletManager.js';
import { toastManager } from '../common/ToastManager.js';

export class JobsModal {
  /**
   * @param {Object} options
   * @param {Phaser.Scene} options.scene - WorldScene
   */
  constructor({ scene } = {}) {
    this.scene = scene || null;
    this.modalEl = typeof document !== 'undefined' ? document.getElementById('jobs-modal') : null;
    this.gridEl = typeof document !== 'undefined' ? document.getElementById('jobs-grid') : null;
    this.statusEl = typeof document !== 'undefined' ? document.getElementById('jobs-status-pill') : null;
    this.activeJob = null;   // { id, instance }
    this._jobs = {};         // cache instance theo id
    this.initEvents();
  }

  // ------------------------------------------------------------- open/close
  open() {
    if (!this.modalEl) return;
    this.render();
    this.modalEl.classList.remove('hidden');
  }

  close() {
    if (!this.modalEl) return;
    this.modalEl.classList.add('hidden');
  }

  toggle() {
    if (this.isOpen()) this.close();
    else this.open();
  }

  isOpen() {
    return !!(this.modalEl && !this.modalEl.classList.contains('hidden'));
  }

  // ------------------------------------------------------------- render
  render() {
    if (!this.gridEl) return;
    this.gridEl.innerHTML = '';
    for (const job of JOBS_LIST) {
      const card = document.createElement('article');
      card.className = 'jobs-card';
      const isActive = this.activeJob && this.activeJob.id === job.id;
      const isInternal = ['cleaner', 'delivery', 'bugHunter'].includes(job.engineKey);
      card.innerHTML = `
        <div class="jobs-card-head">
          <h3 class="jobs-card-name"></h3>
          <span class="jobs-wage-pill"></span>
        </div>
        <p class="jobs-card-desc"></p>
        <button type="button" class="jobs-start-btn" data-job="${job.id}"></button>`;
      card.querySelector('.jobs-card-name').textContent = job.name;
      card.querySelector('.jobs-wage-pill').textContent = job.wageText;
      card.querySelector('.jobs-card-desc').textContent = job.description;
      const btn = card.querySelector('.jobs-start-btn');
      if (isActive) {
        btn.textContent = 'Đang làm — Dừng';
        btn.classList.add('is-active');
      } else if (this.activeJob) {
        btn.textContent = 'Đang bận việc khác';
        btn.disabled = true;
      } else {
        btn.textContent = isInternal ? 'Bắt đầu' : 'Bắt đầu';
      }
      btn.addEventListener('click', () => this._onStartClick(job));
      this.gridEl.appendChild(card);
    }
  }

  _onStartClick(job) {
    // Đang chạy việc này → dừng.
    if (this.activeJob && this.activeJob.id === job.id) {
      this._stopActive('Đã dừng việc. Có thể bắt đầu lại bất cứ lúc nào.');
      this.render();
      return;
    }
    if (this.activeJob) return; // nút đã disabled
    this._startJob(job);
    this.render();
  }

  _startJob(job) {
    // Engine sibling (barista / fishing): ủy quyền nếu đã có, không phụ thuộc cứng.
    if (job.engineKey === 'barista' || job.engineKey === 'fishing') {
      const sibling = job.engineKey === 'barista' ? this.scene?.baristaJob : this.scene?.fishingJob;
      if (sibling && typeof sibling.start === 'function') {
        const ok = sibling.start();
        if (ok) this.close();
        return;
      }
      toastManager.toast(`${job.name}: đang được hoàn thiện — quay lại sau.`);
      return;
    }

    let instance = this._jobs[job.id];
    if (!instance) {
      const deps = {
        scene: this.scene,
        wallet: walletManager,
        toast: toastManager,
        setStatus: (t) => this.setStatus(t),
      };
      if (job.engineKey === 'cleaner') instance = new CleanerJob(deps);
      else if (job.engineKey === 'delivery') instance = new DeliveryJob(deps);
      else if (job.engineKey === 'bugHunter') instance = new BugHunterJob(deps);
      this._jobs[job.id] = instance;
    }
    const ok = instance.start();
    if (ok) {
      this.activeJob = { id: job.id, instance };
      this.close();
    }
  }

  _stopActive(msg) {
    if (this.activeJob) {
      try { this.activeJob.instance.stop(); } catch (e) { /* noop */ }
      this.activeJob = null;
    }
    this.setStatus(null);
    if (msg) toastManager.toast(msg);
  }

  // ------------------------------------------------------------- per-frame
  /**
   * WorldScene.update() gọi mỗi frame — ủy quyền cho job đang chạy.
   * Job tự stop() khi xong; ở đây dọn activeJob khi job về IDLE/DONE.
   */
  update(time, delta) {
    if (!this.activeJob) return;
    const inst = this.activeJob.instance;
    try {
      if (typeof inst.update === 'function') inst.update(time, delta);
      const s = typeof inst.getState === 'function' ? inst.getState() : null;
      if (s === 'idle' || s === 'done') {
        this.activeJob = null;
        this.setStatus(null);
      }
    } catch (e) { /* job lỗi không được crash game loop */ }
  }

  // ------------------------------------------------------------- status pill
  setStatus(text) {
    if (!this.statusEl) return;
    if (text) {
      this.statusEl.textContent = text;
      this.statusEl.classList.remove('hidden');
    } else {
      this.statusEl.classList.add('hidden');
    }
  }

  // ------------------------------------------------------------- events
  initEvents() {
    if (!this.modalEl) return;
    const closeBtn = document.getElementById('jobs-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.close();
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) this.close();
    });
  }
}

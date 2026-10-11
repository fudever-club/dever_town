/**
 * DEVER TOWN — FISHING JOB MODAL (Phase D2 — Campus Jobs: Câu Cá Hồ Vịt)
 *
 * Modal wrapper tự quản lý overlay riêng (không dùng pane của
 * InteractiveModal): DOM cyber-glass + canvas + FishingEngine + input.
 *
 * Mở bằng: FishingJob.open(zoneData) — gọi từ InteractiveModal.base
 * (case 'job_fishing'). Class 'modal-backdrop' giúp InteractionManager
 * chặn phím E khi job đang mở; controls.js chặn di chuyển nhân vật khi
 * overlay hiện (xem isModalOpen).
 */

import { FishingEngine } from '../minigames/sports/FishingEngine.js';
import { CanvasJuiceFX } from '../minigames/common/CanvasJuiceFX.js';
import { audioManager } from '../../utils/AudioManager.js';
import { isTouchDevice } from '../minigames/common/touchHints.js';

export class FishingJob {
  static _active = null;

  static isOpen() {
    return !!FishingJob._active;
  }

  static open(zoneData = {}) {
    if (FishingJob._active) return FishingJob._active;
    const job = new FishingJob(zoneData);
    job.mount();
    FishingJob._active = job;
    return job;
  }

  static close() {
    if (FishingJob._active) {
      FishingJob._active.destroy();
      FishingJob._active = null;
    }
  }

  constructor(zoneData = {}) {
    this.zoneData = zoneData;
    this.isTouch = isTouchDevice();
    this.overlay = null;
    this.canvas = null;
    this.engine = null;
    this.juiceFX = null;
    this.animId = null;
    this.running = false;
    this.actionBtn = null;
  }

  mount() {
    // --- DOM overlay (cyber-glass, xem src/styles/jobs-cyberglass.css).
    const overlay = document.createElement('div');
    overlay.id = 'fishing-job-overlay';
    overlay.className = 'modal-backdrop graal-job-overlay';
    overlay.innerHTML = `
      <div class="graal-job-modal" role="dialog" aria-modal="true" aria-labelledby="fishing-job-title">
        <div class="graal-job-header">
          <div class="graal-job-title-wrap">
            <span id="fishing-job-title" class="graal-job-title">CÂU CÁ HỒ VỊT</span>
            <span class="graal-job-wage">Thường +20 · Hiếm +50 D-Coin</span>
          </div>
          <button type="button" class="graal-job-close" aria-label="Đóng">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="graal-job-canvas-wrap">
          <canvas id="fishing-job-canvas" width="640" height="360"></canvas>
        </div>
        <div class="graal-job-controls">
          <button type="button" id="fishing-action-btn" class="graal-job-action">GIỮ ĐỂ QUĂNG CẦN</button>
          <span class="graal-job-hint">${this.isTouch ? 'Chạm-giữ nút hoặc kéo trên mặt hồ' : 'Phím E / Space — Esc để thoát'}</span>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    this.overlay = overlay;

    this.canvas = overlay.querySelector('#fishing-job-canvas');
    this.actionBtn = overlay.querySelector('#fishing-action-btn');
    overlay.querySelector('.graal-job-close').addEventListener('click', () => {
      audioManager.playClick?.();
      FishingJob.close();
    });

    // --- Engine + juice.
    this.juiceFX = new CanvasJuiceFX();
    this.engine = new FishingEngine(this.canvas, this.juiceFX, {
      onStateChange: (s) => this.syncActionButton(s),
      onCatch: () => this.syncActionButton(this.engine.state),
      onEscape: () => {},
    });

    // Hook cho test/screenshot (Playwright).
    window.__FISHING_JOB__ = this;

    this.bindEvents();
    this.syncActionButton('idle');
    this.start();
  }

  syncActionButton(state) {
    if (!this.actionBtn) return;
    const labels = {
      idle: this.isTouch ? 'GIỮ ĐỂ QUĂNG CẦN' : 'GIỮ [E] ĐỂ QUĂNG CẦN',
      casting: 'THẢ RA ĐỂ QUĂNG!',
      waiting: 'ĐANG CHỜ CÁ...',
      hooked: 'GIẬT CẦN NGAY!',
      minigame: this.isTouch ? 'GIỮ ĐỂ NÂNG THANH' : 'GIỮ [E] ĐỂ NÂNG THANH',
      caught: 'BẮT ĐƯỢC CÁ!',
      escaped: 'THỬ LẠI',
    };
    this.actionBtn.textContent = labels[state] || 'CÂU CÁ';
    this.actionBtn.classList.toggle('urgent', state === 'hooked');
    this.actionBtn.disabled = state === 'waiting';
  }

  toEngineCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  bindEvents() {
    this.handleKeyDown = (e) => {
      if (!this.running) return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return;
      if (e.code === 'Escape') {
        e.preventDefault();
        FishingJob.close();
        return;
      }
      if (e.repeat) return;
      if (['Space', 'KeyE', 'Enter'].includes(e.code)) {
        e.preventDefault();
        this.engine.handleKeyDown(e);
        this.syncActionButton(this.engine.state);
      }
    };
    this.handleKeyUp = (e) => {
      if (!this.running) return;
      if (['Space', 'KeyE', 'Enter'].includes(e.code)) {
        this.engine.handleKeyUp(e);
        this.syncActionButton(this.engine.state);
      }
    };
    this.handlePointerDown = (e) => {
      if (!this.running) return;
      e.preventDefault();
      const { x, y } = this.toEngineCoords(e);
      this.engine.handlePointerDown(x, y);
      this.syncActionButton(this.engine.state);
    };
    this.handlePointerMove = (e) => {
      if (!this.running) return;
      const { x, y } = this.toEngineCoords(e);
      this.engine.handlePointerMove(x, y);
    };
    this.handlePointerUp = () => {
      if (!this.running) return;
      this.engine.handlePointerUp();
      this.syncActionButton(this.engine.state);
    };
    this.handleActionBtnDown = (e) => {
      if (!this.running) return;
      e.preventDefault();
      this.engine.handleActionDown();
      this.syncActionButton(this.engine.state);
    };
    this.handleActionBtnUp = () => {
      if (!this.running) return;
      this.engine.handleActionUp();
      this.syncActionButton(this.engine.state);
    };

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    this.canvas.addEventListener('mousedown', this.handlePointerDown);
    this.canvas.addEventListener('mousemove', this.handlePointerMove);
    window.addEventListener('mouseup', this.handlePointerUp);
    this.canvas.addEventListener('touchstart', this.handlePointerDown, { passive: false });
    this.canvas.addEventListener('touchmove', this.handlePointerMove, { passive: false });
    window.addEventListener('touchend', this.handlePointerUp);
    this.actionBtn.addEventListener('pointerdown', this.handleActionBtnDown);
    window.addEventListener('pointerup', this.handleActionBtnUp);
  }

  unbindEvents() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.canvas?.removeEventListener('mousedown', this.handlePointerDown);
    this.canvas?.removeEventListener('mousemove', this.handlePointerMove);
    window.removeEventListener('mouseup', this.handlePointerUp);
    this.canvas?.removeEventListener('touchstart', this.handlePointerDown);
    this.canvas?.removeEventListener('touchmove', this.handlePointerMove);
    window.removeEventListener('touchend', this.handlePointerUp);
    this.actionBtn?.removeEventListener('pointerdown', this.handleActionBtnDown);
    window.removeEventListener('pointerup', this.handleActionBtnUp);
  }

  start() {
    if (this.running) return;
    this.running = true;
    let lastTime = performance.now();
    const loop = (now) => {
      if (!this.running) return;
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      this.juiceFX.update(dt);
      this.engine.update(dt);
      this.engine.render();
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  destroy() {
    this.stop();
    this.unbindEvents();
    this.overlay?.remove();
    this.overlay = null;
    this.canvas = null;
    this.actionBtn = null;
    this.engine = null;
    if (window.__FISHING_JOB__ === this) delete window.__FISHING_JOB__;
  }
}

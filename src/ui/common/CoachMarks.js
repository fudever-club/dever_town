/**
 * CoachMarks: first-run spotlight tour + one-time chat tab hint (2026-10-09).
 *
 * Onboarding rescue (critique item #3): the old tutorial lived only inside the
 * chat panel, which now defaults to collapsed. This module shows a short
 * (4-step) sequential tour on first launch, pointing at real UI elements with
 * a spotlight cutout. Skippable, never nags (localStorage `dever_onboarded_v1`).
 *
 * Also owns the one-time pulsing hint on the collapsed chat tab
 * ("Nhấn C để mở chat"), dismissed on first chat open (`dever:chat-opened`).
 */
export class CoachMarks {
  constructor() {
    this.tourKey = 'dever_onboarded_v1';
    this.hintKey = 'dever_chat_hint_seen';
    this.currentStep = -1;
    this.root = null;
    this.highlight = null;
    this.card = null;
    this.hintEl = null;
    this.hintTarget = null;

    this.steps = [
      {
        id: 'move',
        count: '1 / 4',
        title: 'Di chuyển nhân vật',
        desc: 'Dùng phím W A S D hoặc phím mũi tên để đi lại trong thị trấn.',
        mobileDesc: 'Dùng cụm D-pad ảo ở góc trái màn hình để di chuyển nhân vật.',
        keys: ['W', 'A', 'S', 'D'],
        mobileKeys: ['D-pad'],
        targets: [],
        mobileTargets: ['#mobile-touch-controls'],
      },
      {
        id: 'interact',
        count: '2 / 4',
        title: 'Tương tác với thế giới',
        desc: 'Đi đến gần vật phát sáng, cổng tím hoặc NPC rồi nhấn E để tương tác.',
        mobileDesc: 'Đi đến gần vật phát sáng, cổng tím hoặc NPC rồi chạm nút E trên màn hình.',
        keys: ['E'],
        mobileKeys: ['E'],
        targets: [],
        mobileTargets: [],
      },
      {
        id: 'chat',
        count: '3 / 4',
        title: 'Mở khung chat',
        desc: 'Nhấn phím C hoặc bấm vào thẻ chat bên phải để trò chuyện với mọi người trong phòng.',
        mobileDesc: 'Chạm nút chat để trò chuyện với mọi người trong phòng.',
        keys: ['C'],
        mobileKeys: [],
        targets: ['#chat-tab-toggle'],
        mobileTargets: ['#touch-btn-chat'],
      },
      {
        id: 'help',
        count: '4 / 4',
        title: 'Trợ giúp và tập trung',
        desc: 'Bấm nút ? để xem toàn bộ phím tắt và hướng dẫn. Nhấn H để ẩn giao diện, ngắm trọn thị trấn.',
        mobileDesc: 'Bấm nút ? để xem hướng dẫn đầy đủ bất cứ lúc nào.',
        keys: ['?', 'H'],
        mobileKeys: ['?'],
        targets: ['#footer-help-btn'],
        mobileTargets: ['#footer-help-btn'],
      },
    ];

    this._onResize = () => this.layout();
    this._onKey = (e) => {
      if (e.key === 'Escape' && this.currentStep >= 0) this.skip();
    };
    this._onChatOpened = () => this.dismissChatHint(true);

    window.addEventListener('dever:chat-opened', this._onChatOpened);
    // Hint check runs shortly after boot; tour (if any) suppresses it while running.
    setTimeout(() => this.maybeShowChatHint(), 1500);
  }

  // --- state ---------------------------------------------------------------
  isMobileLayout() {
    return window.matchMedia('(max-width: 1024px)').matches;
  }

  hasCompleted() {
    try {
      return localStorage.getItem(this.tourKey) === '1';
    } catch (e) {
      return true; // storage blocked: don't nag
    }
  }

  markCompleted() {
    try {
      localStorage.setItem(this.tourKey, '1');
    } catch (e) {}
  }

  hintSeen() {
    try {
      return localStorage.getItem(this.hintKey) === '1';
    } catch (e) {
      return true;
    }
  }

  markHintSeen() {
    try {
      localStorage.setItem(this.hintKey, '1');
    } catch (e) {}
  }

  // --- tour ----------------------------------------------------------------
  maybeStart() {
    if (this.hasCompleted() || this.currentStep >= 0) return;
    // Small delay so the game canvas and HUD settle before spotlighting.
    setTimeout(() => {
      if (!this.hasCompleted() && this.currentStep < 0) this.start();
    }, 1200);
  }

  start() {
    if (this.currentStep >= 0) return;
    // A hint shown before the welcome card was dismissed must not linger
    // under the tour (both would say "press C").
    this.dismissChatHint(false);
    this.buildDOM();
    this.currentStep = 0;
    document.body.classList.add('coach-marks-open');
    window.addEventListener('resize', this._onResize);
    window.addEventListener('keydown', this._onKey);
    this.renderStep();
  }

  finish() {
    this.teardown();
    this.markCompleted();
    this.markHintSeen(); // tour covered the chat step
    if (this.hintEl) this.hintEl.classList.add('hidden');
  }

  skip() {
    this.teardown();
    this.markCompleted();
    // Skipped users still get the one-time chat hint later.
    setTimeout(() => this.maybeShowChatHint(), 800);
  }

  teardown() {
    this.currentStep = -1;
    document.body.classList.remove('coach-marks-open');
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('keydown', this._onKey);
    if (this.root && this.root.parentElement) {
      this.root.parentElement.removeChild(this.root);
    }
    this.root = this.highlight = this.card = null;
  }

  buildDOM() {
    this.root = document.createElement('div');
    this.root.id = 'coach-marks-root';
    this.root.innerHTML =
      '<div class="coach-dim"></div>' +
      '<div id="coach-highlight"></div>' +
      '<div id="coach-card" role="dialog" aria-live="polite">' +
      '  <span class="coach-step-count"></span>' +
      '  <h3 class="coach-title"></h3>' +
      '  <p class="coach-desc"></p>' +
      '  <div class="coach-keys"></div>' +
      '  <div class="coach-actions">' +
      '    <button type="button" class="coach-skip">Bỏ qua</button>' +
      '    <button type="button" class="coach-next">Tiếp theo</button>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(this.root);
    this.highlight = this.root.querySelector('#coach-highlight');
    this.card = this.root.querySelector('#coach-card');

    this.root.querySelector('.coach-skip').addEventListener('click', () => this.skip());
    this.root.querySelector('.coach-next').addEventListener('click', () => this.next());
    // Clicking the dim background also advances (forgiving), but the
    // spotlight cutout itself never intercepts (pointer-events: none).
    this.root.querySelector('.coach-dim').addEventListener('click', () => this.next());
  }

  resolveTarget(step) {
    const sels = this.isMobileLayout() ? step.mobileTargets : step.targets;
    for (const sel of sels || []) {
      const el = document.querySelector(sel);
      if (el && el.offsetParent !== null) return el;
    }
    return null;
  }

  next() {
    if (this.currentStep < 0) return;
    if (this.currentStep >= this.steps.length - 1) {
      this.finish();
      return;
    }
    this.currentStep++;
    this.renderStep();
  }

  renderStep() {
    const step = this.steps[this.currentStep];
    if (!step || !this.card) return;
    const mobile = this.isMobileLayout();

    this.card.querySelector('.coach-step-count').textContent = step.count;
    this.card.querySelector('.coach-title').textContent = step.title;
    this.card.querySelector('.coach-desc').textContent = mobile ? step.mobileDesc : step.desc;
    const keysBox = this.card.querySelector('.coach-keys');
    keysBox.innerHTML = '';
    for (const k of mobile ? step.mobileKeys : step.keys) {
      const kbd = document.createElement('kbd');
      kbd.textContent = k;
      keysBox.appendChild(kbd);
    }
    this.card.querySelector('.coach-next').textContent =
      this.currentStep === this.steps.length - 1 ? 'Bắt đầu chơi' : 'Tiếp theo';

    this.layout();
  }

  layout() {
    if (this.currentStep < 0 || !this.card || !this.highlight) return;
    const step = this.steps[this.currentStep];
    const target = this.resolveTarget(step);
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const pad = 10;

    if (target) {
      this.highlight.classList.remove('no-ring');
      const r = target.getBoundingClientRect();
      this.highlight.style.left = `${Math.max(0, r.left - pad)}px`;
      this.highlight.style.top = `${Math.max(0, r.top - pad)}px`;
      this.highlight.style.width = `${r.width + pad * 2}px`;
      this.highlight.style.height = `${r.height + pad * 2}px`;

      // Tooltip: prefer below the target, else above, clamped to viewport.
      this.card.classList.remove('centered');
      const cardW = Math.min(340, vw - 32);
      const estH = 230;
      let left = r.left + r.width / 2 - cardW / 2;
      left = Math.max(12, Math.min(left, vw - cardW - 12));
      let top = r.bottom + 16;
      if (top + estH > vh - 12) top = r.top - estH - 16;
      if (top < 12) top = 12;
      this.card.style.left = `${left}px`;
      this.card.style.top = `${Math.max(12, top)}px`;
      this.card.style.transform = 'none';
    } else {
      // No anchor element: full dim, no ring, card centered on screen.
      this.highlight.classList.add('no-ring');
      this.highlight.style.left = '50%';
      this.highlight.style.top = '50%';
      this.highlight.style.width = '0px';
      this.highlight.style.height = '0px';
      this.card.classList.add('centered');
      this.card.style.transform = 'translate(-50%, -50%)';
    }
  }

  // --- one-time chat tab hint ----------------------------------------------
  isChatCurrentlyOpen() {
    const main = document.getElementById('main-content');
    const wrapper = document.getElementById('chat-wrapper');
    if (this.isMobileLayout()) {
      return !!(wrapper && wrapper.classList.contains('mobile-open'));
    }
    return !!(main && !main.classList.contains('chat-collapsed'));
  }

  maybeShowChatHint() {
    if (this.hintSeen() || this.currentStep >= 0) return;
    if (this.isChatCurrentlyOpen()) return;
    // Don't pop the hint while the welcome card is still up — the skip()
    // path re-checks after dismissal, and the tour start() hides any hint.
    const welcome = document.getElementById('onboarding-guide-overlay');
    if (welcome && !welcome.classList.contains('hidden')) return;

    const sel = this.isMobileLayout() ? '#touch-btn-chat' : '#chat-tab-toggle';
    const target = document.querySelector(sel);
    if (!target || target.offsetParent === null) return;

    if (!this.hintEl) {
      this.hintEl = document.createElement('div');
      this.hintEl.id = this.isMobileLayout() ? 'touch-chat-hint' : 'chat-tab-hint';
      this.hintEl.className = 'chat-tab-hint hidden';
      this.hintEl.setAttribute('role', 'status');
      const kbd = this.isMobileLayout() ? '' : 'Nhấn <kbd>C</kbd> để ';
      this.hintEl.innerHTML = `${kbd}mở chat`;
      document.body.appendChild(this.hintEl);
    }
    this.hintTarget = target;
    // Unhide BEFORE measuring: positionChatHint needs real dimensions.
    this.hintEl.classList.remove('hidden');
    this.positionChatHint();
    window.addEventListener('resize', this._onResizeHint || (this._onResizeHint = () => this.positionChatHint()));
  }

  positionChatHint() {
    if (!this.hintEl || !this.hintTarget) return;
    // Skip measuring while display:none (offsetWidth would be 0); the caller
    // unhides before positioning, and dismissChatHint removes the listener.
    if (this.hintEl.classList.contains('hidden')) return;
    const r = this.hintTarget.getBoundingClientRect();
    const vw = window.innerWidth;
    // Place the bubble to the left of the target, vertically centered.
    this.hintEl.style.visibility = 'hidden';
    this.hintEl.style.left = '0px';
    this.hintEl.style.top = '0px';
    this.hintEl.classList.remove('hidden');
    const hw = this.hintEl.offsetWidth;
    const hh = this.hintEl.offsetHeight;
    let left = r.left - hw - 12;
    if (left < 12) left = Math.min(r.right + 12, vw - hw - 12);
    let top = r.top + r.height / 2 - hh / 2;
    top = Math.max(12, Math.min(top, window.innerHeight - hh - 12));
    this.hintEl.style.left = `${left}px`;
    this.hintEl.style.top = `${top}px`;
    this.hintEl.style.visibility = 'visible';
  }

  dismissChatHint(persist) {
    if (persist) this.markHintSeen();
    if (this.hintEl) this.hintEl.classList.add('hidden');
    if (this._onResizeHint) window.removeEventListener('resize', this._onResizeHint);
  }
}

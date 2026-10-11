/**
 * DEVER TOWN — CLAN MODAL (BANG HỘI & SỰ KIỆN PHÁO ĐÀI) — Phase E
 *
 * Modal cyber-glass: 4 thẻ bang hội (tên, màu, base, số thành viên local,
 * nút "Tham gia") + trạng thái bang hiện tại + nút "Rời clan" + khu vực
 * test event pháo đài (nút "Tổ chức test event" — chỉ dành cho test, sẽ ẩn
 * khi ra mắt chính thức).
 *
 * Mở từ dock button [3] / phím 3 (GraalHUD). Theo mẫu JobsModal: markup
 * trong index.html (#clan-modal), styles trong src/styles/clans.css,
 * không emoji, Tilt Neon / Be Vietnam Pro.
 */
import { clanManager } from '../../managers/ClanManager.js';
import { fortEventManager } from '../../managers/FortEventManager.js';
import { FORT_EVENT_STATES } from '../../config/combatConfig.js';
import { toastManager } from '../common/ToastManager.js';

const S = FORT_EVENT_STATES;

export class ClanModal {
  /**
   * @param {Object} options
   * @param {Phaser.Scene} options.scene - WorldScene
   */
  constructor({ scene } = {}) {
    this.scene = scene || null;
    const doc = typeof document !== 'undefined' ? document : null;
    this.modalEl = doc ? doc.getElementById('clan-modal') : null;
    this.gridEl = doc ? doc.getElementById('clan-grid') : null;
    this.statusEl = doc ? doc.getElementById('clan-status-row') : null;
    this.eventStatusEl = doc ? doc.getElementById('clan-event-status') : null;
    this.eventScoresEl = doc ? doc.getElementById('clan-event-scores') : null;
    this.eventReportEl = doc ? doc.getElementById('clan-event-report') : null;
    this.startBtn = doc ? doc.getElementById('clan-start-event-btn') : null;

    this._unsubClan = clanManager.onChange(() => this.render());
    this._unsubFort = fortEventManager.onChange((ev) => this._onFortEvent(ev));
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
    this._renderStatus();
    this._renderCards();
    this._renderEvent();
  }

  _renderStatus() {
    if (!this.statusEl) return;
    const myClan = clanManager.getMyClan();
    this.statusEl.innerHTML = '';
    const label = document.createElement('span');
    label.className = 'clan-status-label';
    const tagWrap = document.createElement('span');
    if (myClan) {
      label.textContent = 'Bang của bạn:';
      const tag = document.createElement('span');
      tag.className = 'clan-tag';
      tag.style.setProperty('--clan-color', myClan.color);
      tag.textContent = myClan.name;
      tagWrap.appendChild(tag);
      const leaveBtn = document.createElement('button');
      leaveBtn.type = 'button';
      leaveBtn.className = 'clan-leave-btn';
      leaveBtn.textContent = 'Rời clan';
      leaveBtn.addEventListener('click', () => {
        clanManager.leaveClan();
        toastManager.toast('Đã rời bang hội.');
      });
      tagWrap.appendChild(leaveBtn);
    } else {
      label.textContent = 'Bạn chưa tham gia bang nào — chọn một bang bên dưới.';
    }
    this.statusEl.appendChild(label);
    this.statusEl.appendChild(tagWrap);
  }

  _renderCards() {
    if (!this.gridEl) return;
    this.gridEl.innerHTML = '';
    const myClanId = clanManager.getMyClanId();
    for (const clan of clanManager.getClans()) {
      const card = document.createElement('article');
      card.className = 'clan-card';
      card.style.setProperty('--clan-color', clan.color);
      const isMine = myClanId === clan.id;
      const count = clanManager.getMemberCount(clan.id);
      card.innerHTML = `
        <div class="clan-card-colorbar" aria-hidden="true"></div>
        <div class="clan-card-head">
          <h3 class="clan-card-name"></h3>
          <span class="clan-member-pill"></span>
        </div>
        <p class="clan-card-base"></p>
        <p class="clan-card-desc"></p>
        <button type="button" class="clan-join-btn"></button>`;
      card.querySelector('.clan-card-name').textContent = clan.name;
      card.querySelector('.clan-member-pill').textContent =
        `${count} thành viên`;
      card.querySelector('.clan-card-base').textContent = `Base: ${clan.baseName}`;
      card.querySelector('.clan-card-desc').textContent = clan.description;
      const btn = card.querySelector('.clan-join-btn');
      if (isMine) {
        btn.textContent = 'Đang ở đây';
        btn.disabled = true;
        btn.classList.add('is-current');
      } else {
        btn.textContent = 'Tham gia';
        btn.addEventListener('click', () => {
          clanManager.joinClan(clan.id);
          toastManager.toast(`Đã gia nhập bang ${clan.name}.`);
        });
      }
      this.gridEl.appendChild(card);
    }
    const note = document.createElement('p');
    note.className = 'clan-roster-note';
    note.textContent = 'Roster local (v1) — thành viên thật sẽ đồng bộ khi có server bang hội.';
    this.gridEl.appendChild(note);
  }

  _renderEvent() {
    if (!this.eventStatusEl) return;
    const snap = fortEventManager.getSnapshot();
    const stateText = {
      [S.IDLE]: 'Chưa có sự kiện nào.',
      [S.COUNTDOWN]: `Đếm ngược: mở cổng sau ${snap.secondsLeft}s.`,
      [S.ACTIVE]: `ĐANG DIỄN RA — còn ${snap.secondsLeft}s. Đứng trong ${snap.fortName} để ghi điểm cho bang.`,
      [S.ENDED]: 'Đang tổng kết...',
      [S.PAYOUT]: 'Đã trao thưởng. Xem bảng bên dưới.',
    }[snap.state] || '';
    this.eventStatusEl.textContent = stateText;

    if (this.startBtn) {
      const busy = snap.state === S.COUNTDOWN || snap.state === S.ACTIVE || snap.state === S.ENDED;
      this.startBtn.disabled = busy;
      this.startBtn.textContent = busy ? 'Sự kiện đang chạy' : 'Tổ chức test event';
    }

    // Bảng điểm live.
    if (this.eventScoresEl) {
      this.eventScoresEl.innerHTML = '';
      const scores = snap.scores || {};
      const ids = Object.keys(scores);
      if (ids.length === 0) {
        this.eventScoresEl.textContent = 'Chưa có điểm.';
      } else {
        const sorted = ids.sort((a, b) => scores[b] - scores[a]);
        for (const clanId of sorted) {
          const clan = clanManager.getClans().find((c) => c.id === clanId);
          const row = document.createElement('div');
          row.className = 'clan-score-row' + (snap.leaderClanId === clanId ? ' is-leader' : '');
          const dot = document.createElement('span');
          dot.className = 'clan-score-dot';
          dot.style.background = clan ? clan.color : '#888';
          const name = document.createElement('span');
          name.textContent = clan ? clan.name : clanId;
          const pts = document.createElement('span');
          pts.className = 'clan-score-pts';
          pts.textContent = `${scores[clanId]} điểm`;
          row.append(dot, name, pts);
          this.eventScoresEl.appendChild(row);
        }
      }
    }

    // Bảng trao thưởng (luật Graal 2026: chia cho mọi participant).
    if (this.eventReportEl) {
      this.eventReportEl.innerHTML = '';
      const report = snap.lastReport;
      if (report && report.participants.length > 0) {
        const title = document.createElement('h4');
        title.className = 'clan-report-title';
        title.textContent = `Trao thưởng: ${report.distributed}/${report.prizePool} D-Coin cho ${report.participantCount} người tham gia`;
        this.eventReportEl.appendChild(title);
        const table = document.createElement('div');
        table.className = 'clan-report-table';
        for (const p of report.participants) {
          const row = document.createElement('div');
          row.className = 'clan-report-row';
          const who = document.createElement('span');
          who.textContent = `${p.name}${p.isBot ? ' (test)' : ''}${p.isLocal ? ' (bạn)' : ''}`;
          const amt = document.createElement('span');
          amt.className = 'clan-report-amt';
          amt.textContent = `+${p.amount} D-Coin · ${p.timeSec}s trong fort`;
          row.append(who, amt);
          table.appendChild(row);
        }
        this.eventReportEl.appendChild(table);
      } else if (snap.state === S.PAYOUT) {
        this.eventReportEl.textContent = 'Không có người tham gia đạt ngưỡng — quỹ thưởng được giữ lại.';
      }
    }
  }

  // -------------------------------------------------------------- events
  _onFortEvent(ev) {
    if (!ev) return;
    if (ev.type === 'state' || ev.type === 'tick') {
      if (this.isOpen()) this._renderEvent();
      return;
    }
    if (ev.type === 'payout' && ev.report) {
      const r = ev.report;
      toastManager.toast(
        `Sự kiện pháo đài kết thúc: ${r.distributed} D-Coin chia cho ${r.participantCount} người tham gia.`,
      );
      if (this.isOpen()) this._renderEvent();
    }
  }

  _onStartEventClick() {
    try {
      fortEventManager.startTestEvent();
      toastManager.toast('Đã mở test event pháo đài. Cổng mở sau 10 giây.');
      this._renderEvent();
    } catch (e) {
      toastManager.toast('Không thể bắt đầu sự kiện lúc này.');
    }
  }

  initEvents() {
    if (!this.modalEl) return;
    const closeBtn = document.getElementById('clan-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.close();
    });
    if (this.startBtn) {
      this.startBtn.addEventListener('click', () => this._onStartEventClick());
    }
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) this.close();
    });
  }

  destroy() {
    if (this._unsubClan) this._unsubClan();
    if (this._unsubFort) this._unsubFort();
  }
}

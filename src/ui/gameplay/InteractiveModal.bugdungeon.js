/**
 * InteractiveModal.bugdungeon — Hầm ngục sự cố server / săn Dever Coin (dungeon config).
 *
 * Prototype patch module, following the established pattern from
 * InteractiveModal.dream.js: methods are attached to
 * InteractiveModal.prototype at import time. The class itself lives in
 * InteractiveModal.base.js; this file must be imported (via
 * InteractiveModal.js) before any instance is created.
 */
import { InteractiveModal } from './InteractiveModal.base.js';
import { questManager } from '../../managers/QuestManager.js';
import { audioManager } from '../../utils/AudioManager.js';
import { escapeHtml } from '../../utils/sanitize.js';
import { clubSettlementManager, TALENT_ROSTER_DEF } from '../../managers/ClubSettlementManager.js';
import { DUNGEON_BALANCE, getDungeonCooldownRemainingMs, setDungeonCooldown, getDungeonDailyRemaining, addDungeonDailyEarn } from '../../config/dungeonConfig.js';

/**
 * Thiết lập giao diện Hầm Ngục Sự Cố Server & Săn Dever Coin (Bug Dungeon / Server Faults)
 * @param {Object} zoneData
 */
InteractiveModal.prototype.setupBugDungeonView = function(zoneData) {
  const pane = document.getElementById('pane-bug-dungeon');
  if (!pane) return;
  pane.classList.remove('hidden');

  const meta = zoneData.metadata || {};
  const titleEl = document.getElementById('bug-dungeon-title');
  const descEl = document.getElementById('bug-dungeon-desc');
  const rewardEl = document.getElementById('bug-dungeon-reward');
  const severityEl = document.getElementById('bug-dungeon-severity');
  const codeEl = document.getElementById('bug-dungeon-code');
  const feedbackEl = document.getElementById('bug-action-feedback');
  const fixBtn = document.getElementById('btn-fix-bug');
  const closeBtn = document.getElementById('btn-close-dungeon-pane');

  if (titleEl) titleEl.textContent = meta.title || zoneData.name || 'Sự Cố Lập Trình Hệ Thống';
  if (descEl) descEl.textContent = meta.desc || 'Phát hiện sự cố bất thường trong mã nguồn hệ thống.';
  const reward = meta.reward || 50;
  if (rewardEl) rewardEl.textContent = `+${reward} D-Coin`;
  if (severityEl) {
    severityEl.textContent = zoneData.bugType === 'terminal_status' ? 'SYSTEM DIAGNOSTIC' : 'CRITICAL FAULT';
  }
  if (codeEl) codeEl.textContent = meta.code || '// Lỗi hệ thống: Code StackTrace';

  if (feedbackEl) {
    feedbackEl.style.display = 'none';
    feedbackEl.className = 'bug-action-feedback';
    feedbackEl.textContent = '';
  }

  if (closeBtn) {
    closeBtn.onclick = () => this.hide();
  }

  if (fixBtn) {
    // Phase 0 — chống farm D-Coin vô hạn: cooldown từng bug + trần coin/ngày.
    const zoneKey = zoneData.id || zoneData.bugType || 'bug_unknown';
    const cooldownLeftMs = getDungeonCooldownRemainingMs(zoneKey);
    const dailyLeft = getDungeonDailyRemaining();
    const cooldownMin = Math.ceil(cooldownLeftMs / 60000);

    if (cooldownLeftMs > 0) {
      fixBtn.disabled = true;
      fixBtn.textContent = `Hệ Thống Đang Hồi Phục (${cooldownMin} phút)`;
    } else if (dailyLeft <= 0) {
      fixBtn.disabled = true;
      fixBtn.textContent = `Đã Chạm Trần ${DUNGEON_BALANCE.dailyCoinCap} D-Coin/Ngày`;
    } else {
      fixBtn.disabled = false;
      fixBtn.textContent = zoneData.bugType === 'terminal_status' ? 'Đồng Bộ Hóa Dữ Liệu (+30 D-Coin)' : 'Khắc Phục Lỗi Ngay';
    }
    fixBtn.onclick = () => {
      // Chặn double-click / race: kiểm tra lại ngay lúc bấm.
      if (getDungeonCooldownRemainingMs(zoneKey) > 0 || getDungeonDailyRemaining() <= 0) return;
      fixBtn.disabled = true;
      fixBtn.textContent = 'Đang Xử Lý Debug...';

      setTimeout(() => {
        try {
          audioManager.playSuccess();
          // Áp trần ngày: chỉ thưởng phần còn lại trong hạn mức.
          const grant = Math.min(reward, getDungeonDailyRemaining());
          questManager.addPoints(grant, 'Săn Bug Hầm Ngục');
          addDungeonDailyEarn(grant);
          setDungeonCooldown(zoneKey);

          const currentPoints = parseInt(localStorage.getItem('dever_points') || '1250', 10);
          const coinEl = document.getElementById('wardrobe-dcoins-val');
          if (coinEl) coinEl.textContent = currentPoints.toLocaleString('vi-VN');

          // Kiểm tra giải cứu tài năng mới từ Bug Dungeon
          const lockedTalents = TALENT_ROSTER_DEF.filter(t => {
            const available = clubSettlementManager.getAvailableTalents().some(a => a.id === t.id);
            let stationed = false;
            for (const c in clubSettlementManager.settlements) {
              if (clubSettlementManager.settlements[c]?.memberIds?.includes(t.id)) stationed = true;
            }
            return !available && !stationed;
          });

          let rescueText = '';
          if (lockedTalents.length > 0) {
            const rescued = lockedTalents[0];
            clubSettlementManager.unlockTalent(rescued.id);
            rescueText = `<br/><span style="color: #facc15; font-weight: 700;">[GIẢI CỨU THÀNH CÔNG]</span> Bạn đã giải cứu: <strong>${escapeHtml(rescued.name)}</strong> (${escapeHtml(rescued.title)})! Hãy đến gian hàng CLB để định cư thành viên này và nhận D-Coin thụ động mỗi ngày!`;
          }

          if (feedbackEl) {
            feedbackEl.style.display = 'block';
            feedbackEl.className = 'bug-action-feedback success';
            feedbackEl.innerHTML = `Khắc phục lỗi thành công! Bạn nhận được +${grant} D-Coin. Số dư hiện tại: ${currentPoints.toLocaleString('vi-VN')} D-Coin.${rescueText}`;
          }

          fixBtn.textContent = 'Đã Khắc Phục Thành Công';
          questManager.incrementProgress('explorer_rooms', 1);
          window.__DEVER_GAME__?.scene?.keys?.WorldScene?.achievementManager?.unlock('bug_hunter');
        } catch (e) {
          console.warn('Lỗi khi thưởng D-Coin:', e);
        }
      }, 500);
    };
  }
}

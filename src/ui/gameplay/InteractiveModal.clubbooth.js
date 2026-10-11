/**
 * InteractiveModal.clubbooth — Gian hàng CLB FPTU (clubs, talent roster, backdrop lightbox).
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
import { FPTU_CLUBS } from '../../config/fptuClubs.js';
import { clubSettlementManager } from '../../managers/ClubSettlementManager.js';

/**
 * Thiết lập giao diện Gian Hàng Câu Lạc Bộ FPTU (Club Booth Showcase)
 * @param {Object} zoneData
 */
InteractiveModal.prototype.setupClubBoothView = function(zoneData) {
  const pane = document.getElementById('pane-club-booth');
  if (!pane) return;
  pane.classList.remove('hidden');

  const club = FPTU_CLUBS[zoneData.clubId] || {
    prefix: zoneData.name || 'FPTU Club',
    nameEn: zoneData.name || 'FPT University Club',
    nameVi: zoneData.label || 'Câu Lạc Bộ Sinh Viên',
    group: 'Học thuật',
    subgroup: 'Sinh viên',
    boothNumber: 0,
    floor: 2,
    themeColor: '#38bdf8',
    icon: '🏛️',
    slogan: 'Năng Động - Sáng Tạo - Gắn Kết',
    description: 'Không gian sinh hoạt, rèn luyện kỹ năng và giao lưu học hỏi của sinh viên Đại học FPT Đà Nẵng.',
    activities: ['Sinh hoạt chuyên đề hàng tuần', 'Workshop kỹ năng thực tế', 'Hoạt động giao lưu teambuilding'],
    roles: 'Thành viên thế hệ mới'
  };

  const headerEl = document.getElementById('club-booth-header');
  const bodyEl = document.getElementById('club-booth-body');
  const footerEl = document.getElementById('club-booth-footer');

  const logoSrc = club.logoUrl || (club.logoId ? `https://lh3.googleusercontent.com/d/${club.logoId}=w400` : null);

  const logoHtml = logoSrc ? `
    <div class="club-avatar-badge club-logo-box" style="border: 2px solid ${club.themeColor}; background: ${club.themeColor}1a;">
      <img src="${escapeHtml(logoSrc)}" 
           class="club-real-logo" 
           alt="${escapeHtml(club.prefix)} Logo" 
           loading="lazy"
           onerror="if (this.src.indexOf('lh3.googleusercontent.com') === -1 && '${club.logoId || ''}') { this.src = 'https://lh3.googleusercontent.com/d/${club.logoId}=w400'; } else { this.style.display='none'; if (this.nextElementSibling) this.nextElementSibling.style.display='flex'; }" />
      <span class="club-fallback-icon" style="display: none;">${club.icon || '🏛️'}</span>
    </div>
  ` : `
    <div class="club-avatar-badge club-logo-box" style="border: 2px solid ${club.themeColor}; background: ${club.themeColor}1a;">
      <span class="club-fallback-icon">${club.icon || '🏛️'}</span>
    </div>
  `;

  if (headerEl) {
    headerEl.innerHTML = `
      <div class="club-card-badge-row">
        <span class="club-booth-tag" style="background: ${club.themeColor}22; color: ${club.themeColor}; border: 1px solid ${club.themeColor}55;">
          Gian Hàng #${club.boothNumber}
        </span>
        <span class="club-group-tag">${escapeHtml(club.group)} • ${escapeHtml(club.subgroup || '')}</span>
        <span class="club-floor-tag">Tòa Alpha — Tầng ${club.floor || 2}</span>
        ${club.memberCount ? `<span class="club-members-tag">${club.memberCount} Thành viên</span>` : ''}
      </div>
      <div class="club-hero-title-row">
        ${logoHtml}
        <div class="club-hero-info">
          <h2 class="club-hero-name" style="color: ${club.themeColor};">[${escapeHtml(club.prefix)}] ${escapeHtml(club.nameVi)}</h2>
          <p class="club-hero-en">${escapeHtml(club.nameEn)}</p>
        </div>
      </div>
      <p class="club-slogan">"${escapeHtml(club.slogan || '')}"</p>
    `;
  }

  if (bodyEl) {
    // Khối Backdrop Gian hàng 3x3m
    const backdropSrc = club.backdropLocalPath || (club.backdropId ? `https://lh3.googleusercontent.com/d/${club.backdropId}=w800` : null);
    const lightboxBackdropSrc = club.backdropLocalPath || (club.backdropId ? `https://lh3.googleusercontent.com/d/${club.backdropId}=w1600` : null);

    const backdropSection = (club.backdropLocalPath || club.backdropId) ? `
      <div class="club-detail-section club-backdrop-section">
        <div class="club-backdrop-header-row">
          <h4 class="club-section-title">Backdrop Gian Hàng 3x3m Chính Thức</h4>
          <span class="club-backdrop-badge">Tiêu Chuẩn Ngày Hội CLB</span>
        </div>
        <div class="club-backdrop-preview-wrap" id="club-backdrop-wrap">
          <img src="${escapeHtml(backdropSrc)}" 
               class="club-backdrop-img" 
               alt="Backdrop 3x3m ${escapeHtml(club.prefix)}" 
               loading="lazy"
               id="img-club-backdrop"
               onerror="if (this.src.indexOf('lh3.googleusercontent.com') === -1 && '${club.backdropId || ''}') { this.src = 'https://lh3.googleusercontent.com/d/${club.backdropId}=w800'; }" />
          <div class="club-backdrop-overlay">
            <span class="club-backdrop-hint">Bấm để phóng to toàn màn hình</span>
          </div>
        </div>
        ${club.backdropUrl ? `
          <div class="club-backdrop-meta">
            <a href="${escapeHtml(club.backdropUrl)}" target="_blank" rel="noopener noreferrer" class="club-backdrop-link">
              Tải file gốc trên Google Drive
            </a>
          </div>
        ` : ''}
      </div>
    ` : '';

    // Khối Đạo Cụ & Thiết Kế Gian Hàng
    const propsSection = (club.props || club.costume || club.videoConcept) ? `
      <div class="club-detail-section">
        <h4 class="club-section-title">Nhận Diện & Thiết Kế Gian Hàng</h4>
        <div class="club-specs-grid">
          ${club.props ? `
            <div class="club-spec-item">
              <span class="club-spec-label">Đạo Cụ Trưng Bày</span>
              <span class="club-spec-value">${escapeHtml(club.props)}</span>
            </div>
          ` : ''}
          ${club.costume ? `
            <div class="club-spec-item">
              <span class="club-spec-label">Trang Phục Đại Diện</span>
              <span class="club-spec-value">${escapeHtml(club.costume)}</span>
            </div>
          ` : ''}
          ${club.videoConcept ? `
            <div class="club-spec-item full-width">
              <span class="club-spec-label">Ý Tưởng / Concept Video</span>
              <span class="club-spec-value">${escapeHtml(club.videoConcept)}</span>
            </div>
          ` : ''}
        </div>
      </div>
    ` : '';

    // Khối Ban Quản Lý & Đại Diện
    const managementSection = (club.officer || club.leads) ? `
      <div class="club-detail-section">
        <h4 class="club-section-title">Ban Đại Diện & Liên Hệ</h4>
        <div class="club-specs-grid">
          ${club.officer ? `
            <div class="club-spec-item">
              <span class="club-spec-label">Cán Bộ Phụ Trách</span>
              <span class="club-spec-value">${escapeHtml(club.officer)}</span>
            </div>
          ` : ''}
          ${club.leads ? `
            <div class="club-spec-item full-width">
              <span class="club-spec-label">Đại Diện Gian Hàng / Hotline</span>
              <span class="club-spec-value">${escapeHtml(club.leads)}</span>
            </div>
          ` : ''}
        </div>
      </div>
    ` : '';

    bodyEl.innerHTML = `
      <div class="club-detail-section">
        <h4 class="club-section-title">Giới Thiệu & Định Hướng</h4>
        <p class="club-section-desc">${escapeHtml(club.description)}</p>
      </div>

      ${backdropSection}

      ${propsSection}

      <div class="club-detail-section">
        <h4 class="club-section-title">Hoạt Động Tiêu Biểu</h4>
        <ul class="club-activities-list">
          ${(club.activities || []).map(act => `
            <li class="club-act-item">
              <span class="club-act-bullet" style="background: ${club.themeColor};"></span>
              <span>${escapeHtml(act)}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <div class="club-detail-section">
        <h4 class="club-section-title">Hệ Thống Định Cư CLB (Delverium Settlement)</h4>
        <p class="club-section-desc">Chiêu mộ và định cư các sinh viên tài năng về gian hàng CLB để nâng cao Danh Vọng và tạo nguồn thu D-Coin thụ động.</p>
        ${(() => {
          const clubId = zoneData.clubId || 'itsc';
          const settlement = clubSettlementManager.getClubSettlement(clubId);
          const availableTalents = clubSettlementManager.getAvailableTalents();
          const accumulated = clubSettlementManager.getAccumulatedCoins();
          const tierNames = { 1: 'Khởi Sắc', 2: 'Tinh Hoa (+25% D-Coin)', 3: 'Huyền Thoại (+50% D-Coin)' };

          let slotsHtml = '';
          for (let i = 0; i < settlement.maxSlots; i++) {
            const member = settlement.members[i];
            if (member) {
              const isAffinity = member.affinities && member.affinities.includes(clubId);
              const memberYield = (member.baseYieldPerMin || 0.5) * (isAffinity ? 2.0 : 1.0) * (settlement.level === 3 ? 1.5 : (settlement.level === 2 ? 1.25 : 1.0));
              slotsHtml += `
                <div class="club-settlement-slot-card">
                  <div class="club-slot-member-top">
                    <img src="assets/characters/aseprite/${member.avatarKey}.png" class="club-slot-avatar-img" alt="${escapeHtml(member.name)}" />
                    <div class="club-slot-member-meta">
                      <span class="club-slot-member-name">${escapeHtml(member.name)}</span>
                      <span class="club-slot-member-title">${escapeHtml(member.title)}</span>
                    </div>
                  </div>
                  ${isAffinity ? `<span class="club-slot-affinity-tag">Đúng Chuyên Môn (+100% Sản Lượng)</span>` : ''}
                  <div class="club-slot-actions">
                    <span class="club-slot-yield-val">+${memberYield.toFixed(1)} D-Coin/phút</span>
                    <button type="button" class="btn-unstation-talent" data-talent-id="${member.id}" data-club-id="${clubId}">Rút Về</button>
                  </div>
                </div>
              `;
            } else {
              slotsHtml += `
                <div class="club-settlement-slot-card empty-slot">
                  <span style="font-size: 11px; color: #64748b; margin-bottom: 6px;">Ô Định Cư Trống (${i + 1}/${settlement.maxSlots})</span>
                  ${availableTalents.length > 0 ? `
                    <button type="button" class="btn-primary-sm btn-open-station-picker" data-club-id="${clubId}" style="background: ${club.themeColor}; font-size: 11px; padding: 4px 10px;">
                      Định Cư Thành Viên
                    </button>
                  ` : `
                    <span style="font-size: 10px; color: #94a3b8;">(Hết tài năng chờ - Săn thêm ở Hầm Ngục)</span>
                  `}
                </div>
              `;
            }
          }

          return `
            <div class="club-settlement-overview">
              <div class="club-settlement-header">
                <span class="club-settlement-tier">Cấp ${settlement.level} • ${tierNames[settlement.level]} (${settlement.reputation} Danh Vọng)</span>
                <span class="club-settlement-yield-rate">Sản Lượng Gian Hàng: +${settlement.yieldPerMin.toFixed(1)} D-Coin/phút</span>
              </div>
              <div class="club-settlement-slots-grid">
                ${slotsHtml}
              </div>
              <div class="club-passive-yield-banner">
                <div class="club-passive-yield-info">
                  <span>Tổng D-Coin Thụ Động Chờ Thu Hoạch: +${accumulated.toLocaleString('vi-VN')} D-Coin</span>
                  <span>Sản lượng toàn campus: +${clubSettlementManager.getTotalYieldPerMinute().toFixed(1)} D-Coin/phút</span>
                </div>
                <button type="button" class="btn-claim-settlement-coins" id="btn-claim-settlement" ${accumulated <= 0 ? 'disabled' : ''}>
                  Thu Hoạch Tất Cả
                </button>
              </div>
            </div>
          `;
        })()}
      </div>

      ${managementSection}
    `;

    // Xử lý rút thành viên khỏi CLB
    bodyEl.querySelectorAll('.btn-unstation-talent').forEach(btn => {
      btn.onclick = () => {
        const talentId = btn.getAttribute('data-talent-id');
        const clubId = btn.getAttribute('data-club-id');
        const res = clubSettlementManager.unstationTalent(talentId, clubId);
        if (res.success) {
          audioManager.playClick?.();
          this.setupClubBoothView(zoneData);
        }
      };
    });

    // Xử lý định cư thành viên mới vào CLB
    bodyEl.querySelectorAll('.btn-open-station-picker').forEach(btn => {
      btn.onclick = () => {
        const clubId = btn.getAttribute('data-club-id');
        const available = clubSettlementManager.getAvailableTalents();
        if (available.length === 0) {
          alert('Không có nhân vật nào trong danh sách chờ. Hãy xuống Hầm Ngục Server Faults để giải cứu thêm sinh viên tài năng!');
          return;
        }
        const matchAffinity = available.find(t => t.affinities && t.affinities.includes(clubId)) || available[0];
        const confirmMsg = `Bạn có muốn định cư ${matchAffinity.name} (${matchAffinity.title}) về CLB này không?${matchAffinity.affinities?.includes(clubId) ? ' (ĐÚNG CHUYÊN MÔN: +100% Sản Lượng D-Coin)' : ''}`;
        if (confirm(confirmMsg)) {
          const res = clubSettlementManager.stationTalent(matchAffinity.id, clubId);
          if (res.success) {
            this.setupClubBoothView(zoneData);
          } else {
            alert(res.message);
          }
        }
      };
    });

    // Xử lý thu hoạch D-Coin thụ động
    const claimBtn = document.getElementById('btn-claim-settlement');
    if (claimBtn) {
      claimBtn.onclick = () => {
        const res = clubSettlementManager.claimPassiveCoins();
        if (res.success) {
          alert(res.message);
          this.setupClubBoothView(zoneData);
        } else {
          alert(res.message);
        }
      };
    }

    // Thiết lập sự kiện phóng to Backdrop Lightbox
    const backdropWrap = document.getElementById('club-backdrop-wrap');
    if (backdropWrap && (club.backdropLocalPath || club.backdropId)) {
      backdropWrap.onclick = () => {
        this.showBackdropLightbox(
          lightboxBackdropSrc,
          `Backdrop Gian Hàng 3x3m — [${club.prefix}] ${club.nameVi}`,
          club.backdropUrl
        );
      };
    }
  }

  if (footerEl) {
    footerEl.innerHTML = `
      <div class="club-actions-row">
        <button type="button" class="btn-primary-sm btn-club-register" id="btn-club-interest" style="background: ${club.themeColor};">
          Đăng Ký Quan Tâm Gian Hàng #${club.boothNumber}
        </button>
        ${(club.backdropLocalPath || club.backdropId) ? `
          <button type="button" class="btn-secondary-sm" id="btn-club-zoom-backdrop">
            Xem Backdrop 3x3m
          </button>
        ` : ''}
        <button type="button" class="btn-secondary-sm" id="btn-club-visit-web">
          Đóng
        </button>
      </div>
    `;

    const interestBtn = document.getElementById('btn-club-interest');
    if (interestBtn) {
      interestBtn.onclick = () => {
        audioManager.playSuccess();
        interestBtn.textContent = 'Đã Lưu Vào Danh Sách Quan Tâm';
        interestBtn.disabled = true;
        questManager.incrementProgress('explorer_rooms', 1);
      };
    }

    const zoomBackdropBtn = document.getElementById('btn-club-zoom-backdrop');
    if (zoomBackdropBtn && (club.backdropLocalPath || club.backdropId)) {
      const lightboxSrc = club.backdropLocalPath || (club.backdropId ? `https://lh3.googleusercontent.com/d/${club.backdropId}=w1600` : null);
      zoomBackdropBtn.onclick = () => {
        audioManager.playClick();
        this.showBackdropLightbox(
          lightboxSrc,
          `Backdrop Gian Hàng 3x3m — [${club.prefix}] ${club.nameVi}`,
          club.backdropUrl
        );
      };
    }

    const visitBtn = document.getElementById('btn-club-visit-web');
    if (visitBtn) {
      visitBtn.onclick = () => {
        audioManager.playClick();
        this.hide();
      };
    }
  }
}

/**
 * Hiển thị Lightbox phóng to ảnh Backdrop 3x3m chất lượng cao
 * @param {string} imageUrl
 * @param {string} title
 * @param {string} driveUrl
 */
InteractiveModal.prototype.showBackdropLightbox = function(imageUrl, title, driveUrl) {
  let lightbox = document.getElementById('club-backdrop-lightbox');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'club-backdrop-lightbox';
    lightbox.className = 'club-lightbox-modal hidden';
    document.body.appendChild(lightbox);
  }

  lightbox.innerHTML = `
    <div class="club-lightbox-backdrop"></div>
    <div class="club-lightbox-card">
      <div class="club-lightbox-header">
        <h3 class="club-lightbox-title">${escapeHtml(title)}</h3>
        <button type="button" class="club-lightbox-close" id="btn-close-lightbox">Đóng</button>
      </div>
      <div class="club-lightbox-body">
        <img src="${imageUrl}" class="club-lightbox-fullimg" alt="${escapeHtml(title)}" />
      </div>
      ${driveUrl ? `
        <div class="club-lightbox-footer">
          <a href="${escapeHtml(driveUrl)}" target="_blank" rel="noopener noreferrer" class="club-lightbox-drive-btn">
            Mở liên kết Drive gốc
          </a>
        </div>
      ` : ''}
    </div>
  `;

  lightbox.classList.remove('hidden');

  const closeBtn = document.getElementById('btn-close-lightbox');
  const bgOverlay = lightbox.querySelector('.club-lightbox-backdrop');

  const closeLightbox = () => {
    audioManager.playClick();
    lightbox.classList.add('hidden');
  };

  if (closeBtn) closeBtn.onclick = closeLightbox;
  if (bgOverlay) bgOverlay.onclick = closeLightbox;
}

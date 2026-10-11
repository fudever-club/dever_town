/**
 * InteractiveModal.frog — Cóc Vàng tâm linh / rút quẻ coder.
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

/**
 * Thiết lập view Bái Cóc Vàng Tâm Linh & Rút Quẻ Coder Mỗi Ngày
 */
InteractiveModal.prototype.setupGoldenFrogFortuneView = function(zoneData) {
  const pane = document.getElementById('pane-golden-frog');
  if (!pane) return;
  pane.classList.remove('hidden');

  const fortunes = [
    { grade: 'ĐẠI CÁT', title: 'Code Không Bug - Deadline Không Dí', desc: 'Build một phát ăn ngay, 0 warnings. Mọi API hôm nay phản hồi 200 OK với tốc độ ánh sáng.', reward: 25 },
    { grade: 'THƯỢNG CÁT', title: 'Logic Sáng Nước - Senior Gật Gù', desc: 'Pull Request được approve ngay trong 5 phút. Code structure mạch lạc chuẩn Clean Architecture.', reward: 20 },
    { grade: 'TRUNG CÁT', title: 'Thuận Buồm Xuôi Gió', desc: 'Gặp bug nan giải? Stack Overflow và Gemini sẽ mang tới câu trả lời đúng trọng tâm ngay dòng đầu tiên.', reward: 15 },
    { grade: 'ĐẠI CÁT', title: 'Pass Môn Rực Rỡ - Cóc Vàng Phù Trợ', desc: 'Kỳ thi Practical Exam (PE) điểm số mỹ mãn. Tinh thần thép, gõ phím như rồng múa.', reward: 30 },
    { grade: 'HỶ CÁT', title: 'Duyên Đến Tự Nhiên', desc: 'Hôm nay crush rủ ngồi chung bàn tại Thư Viện FUDA để thảo luận đề án Software Engineering.', reward: 20 },
    { grade: 'CÁT LÀNH', title: 'Tỉnh Táo & Sáng Tạo', desc: 'Một ngụm Cà phê muối Đà Nẵng mở khóa giải pháp thuật toán O(n) thay vì O(n^2).', reward: 15 },
    { grade: 'BÌNH HÒA', title: 'Tích Tiểu Thành Đại', desc: 'Commit đều tay, giữ vững streak xanh rờn trên GitHub. Mỗi ngày tốt hơn hôm qua 1%.', reward: 15 },
    { grade: 'KHAI TÂM', title: 'Tập Trung Cao Độ', desc: '25 phút Pomodoro không xao nhãng. Một trang giấy sạch, một tâm trí sáng.', reward: 20 }
  ];

  const todayStr = new Date().toISOString().slice(0, 10);
  const storageKey = `dever_frog_fortune_${todayStr}`;
  const savedFortuneRaw = localStorage.getItem(storageKey);

  const gradeEl = document.getElementById('oracle-grade');
  const titleEl = document.getElementById('oracle-title');
  const descEl = document.getElementById('oracle-desc');
  const rewardEl = document.getElementById('oracle-reward');
  const drawBtn = document.getElementById('btn-draw-fortune');

  const renderFortune = (fortune, alreadyClaimed = false) => {
    if (gradeEl) gradeEl.textContent = fortune.grade;
    if (titleEl) titleEl.textContent = fortune.title;
    if (descEl) descEl.textContent = fortune.desc;
    if (rewardEl) {
      rewardEl.textContent = alreadyClaimed
        ? `Đã nhận +${fortune.reward} Dever Points hôm nay`
        : `+${fortune.reward} Dever Points`;
    }
    if (drawBtn) {
      drawBtn.textContent = alreadyClaimed ? 'Hôm Nay Đã Bái Cóc Vàng' : 'Bái Cóc Vàng & Rút Quẻ';
      drawBtn.disabled = alreadyClaimed;
      drawBtn.style.opacity = alreadyClaimed ? '0.6' : '1';
      drawBtn.style.cursor = alreadyClaimed ? 'not-allowed' : 'pointer';
    }
  };

  if (savedFortuneRaw) {
    try {
      const saved = JSON.parse(savedFortuneRaw);
      renderFortune(saved, true);
      return;
    } catch (e) {}
  }

  // Reset view if not claimed today
  renderFortune({
    grade: 'QUẺ HÔM NAY',
    title: 'Bái Cóc Vàng Xin Quẻ',
    desc: 'Thành tâm bái Cóc Vàng để nhận quẻ bói may mắn coder và điểm thưởng mỗi ngày.',
    reward: 20
  }, false);

  if (drawBtn) {
    drawBtn.onclick = () => {
      const picked = fortunes[Math.floor(Math.random() * fortunes.length)];
      localStorage.setItem(storageKey, JSON.stringify(picked));
      audioManager.playVictory();
      questManager.addPoints(picked.reward, 'Bái Cóc Vàng');
      renderFortune(picked, true);
    };
  }
}

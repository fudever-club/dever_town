/**
 * InteractiveModal.code — Code editor / sandbox chạy code đa ngôn ngữ.
 *
 * Prototype patch module, following the established pattern from
 * InteractiveModal.dream.js: methods are attached to
 * InteractiveModal.prototype at import time. The class itself lives in
 * InteractiveModal.base.js; this file must be imported (via
 * InteractiveModal.js) before any instance is created.
 */
import { InteractiveModal } from './InteractiveModal.base.js';
import { INTERACTION_PRESETS } from '../../config/interactions.js';

InteractiveModal.prototype.setupCodeView = function(zoneData) {
  const pane = document.getElementById('pane-code');
  if (!pane) return;
  pane.classList.remove('hidden');

  const codeArea = document.getElementById('code-textarea');
  const langSelect = document.getElementById('code-lang-select');
  const templateBtn = document.getElementById('code-template-btn');
  const notesArea = document.getElementById('notes-textarea');

  const languages = INTERACTION_PRESETS.code_editor.languages;
  let savedLang = 'javascript';
  try {
    savedLang = localStorage.getItem('dever_code_lang') || 'javascript';
  } catch (e) {}

  if (langSelect) {
    langSelect.value = savedLang;
    if (!langSelect.dataset.initialized) {
      langSelect.dataset.initialized = 'true';
      langSelect.addEventListener('change', () => {
        const newLang = langSelect.value;
        try {
          localStorage.setItem('dever_code_lang', newLang);
        } catch (e) {}
        this.loadCodeForLanguage(newLang);
      });
    }
  }

  if (templateBtn && !templateBtn.dataset.initialized) {
    templateBtn.dataset.initialized = 'true';
    templateBtn.addEventListener('click', () => {
      const curLang = langSelect ? langSelect.value : 'javascript';
      const langDef = languages.find(l => l.id === curLang) || languages[0];
      if (codeArea && langDef) {
        codeArea.value = langDef.sample;
        try {
          localStorage.setItem(`dever_code_sandbox_${curLang}`, langDef.sample);
        } catch (e) {}
      }
    });
  }

  if (codeArea && !codeArea.dataset.initialized) {
    codeArea.dataset.initialized = 'true';
    codeArea.addEventListener('input', () => {
      const curLang = langSelect ? langSelect.value : 'javascript';
      try {
        localStorage.setItem(`dever_code_sandbox_${curLang}`, codeArea.value);
      } catch (e) {}
    });
  }

  this.loadCodeForLanguage(savedLang);

  if (notesArea && !notesArea.value) {
    const savedNotes = localStorage.getItem('dever_club_notes');
    notesArea.value = savedNotes || INTERACTION_PRESETS.code_editor.defaultNotes;
  }
}

InteractiveModal.prototype.loadCodeForLanguage = function(langId) {
  const codeArea = document.getElementById('code-textarea');
  if (!codeArea) return;

  const languages = INTERACTION_PRESETS.code_editor.languages;
  const langDef = languages.find(l => l.id === langId) || languages[0];

  let savedCode = null;
  try {
    savedCode = localStorage.getItem(`dever_code_sandbox_${langId}`);
  } catch (e) {}

  codeArea.value = savedCode !== null ? savedCode : (langDef ? langDef.sample : '');
}

InteractiveModal.prototype.executeCode = async function() {
  const codeArea = document.getElementById('code-textarea');
  const outputEl = document.getElementById('code-output');
  const runBtn = document.getElementById('code-run-btn');
  const langSelect = document.getElementById('code-lang-select');
  if (!codeArea || !outputEl) return;

  const code = codeArea.value.trim();
  if (!code) {
    outputEl.textContent = 'Vui lòng nhập mã nguồn trước khi thực thi.';
    return;
  }

  const selectedLang = langSelect ? langSelect.value : 'javascript';
  const languages = INTERACTION_PRESETS.code_editor.languages;
  const langDef = languages.find(l => l.id === selectedLang) || languages[0];

  if (runBtn) {
    runBtn.disabled = true;
    runBtn.textContent = 'Đang biên dịch & thực thi...';
  }

  outputEl.textContent = `[${langDef.name}] Đang kết nối môi trường thực thi...\n`;
  const startTime = performance.now();

  // 1. JavaScript Engine (Chạy an toàn ngay trong browser 100% Offline)
  if (selectedLang === 'javascript') {
    const logs = [];
    const customConsole = {
      log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
      error: (...args) => logs.push('[Error] ' + args.join(' ')),
      warn: (...args) => logs.push('[Warning] ' + args.join(' ')),
      info: (...args) => logs.push('[Info] ' + args.join(' '))
    };

    try {
      const runFn = new Function('console', code);
      runFn(customConsole);
      const elapsed = (performance.now() - startTime).toFixed(1);
      const outText = logs.length > 0 ? logs.join('\n') : 'Chương trình thực thi thành công (Không có console output).';
      outputEl.textContent = `=== KẾT QUẢ THỰC THI (JavaScript Browser Engine • ${elapsed}ms) ===\n${outText}`;
    } catch (err) {
      outputEl.textContent = `Lỗi thực thi JavaScript: ${err.message}`;
    } finally {
      if (runBtn) {
        runBtn.disabled = false;
        runBtn.textContent = 'Chạy Code';
      }
    }
    return;
  }

  // 2. Multi-Tier Runner cho các ngôn ngữ khác (Judge0 CE -> Paiza.io -> Wandbox)
  try {
    let result = null;
    let usedEngine = '';

    // Helper mã hóa Base64 an toàn cho Unicode tiếng Việt
    const toBase64 = (str) => {
      try {
        return btoa(unescape(encodeURIComponent(str)));
      } catch (e) {
        return btoa(str);
      }
    };

    const fromBase64 = (b64) => {
      if (!b64) return '';
      try {
        return decodeURIComponent(escape(atob(b64)));
      } catch (e) {
        try {
          return atob(b64);
        } catch (e2) {
          return b64;
        }
      }
    };

    // --- TẦNG 1: Judge0 CE Cloud Engine (Tốc độ cao, hỗ trợ CORS, độ trễ ~400ms) ---
    if (langDef.judge0Id) {
      try {
        outputEl.textContent = `[${langDef.name}] Đang biên dịch qua Judge0 Cloud Engine...\n`;
        const controller = new AbortController();
        const tId = setTimeout(() => controller.abort(), 12000);

        const b64Source = toBase64(code);
        const jRes = await fetch('https://ce.judge0.com/submissions?base64_encoded=true&wait=true', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source_code: b64Source,
            language_id: langDef.judge0Id
          }),
          signal: controller.signal
        });
        clearTimeout(tId);

        if (jRes.ok) {
          const jData = await jRes.json();
          result = {
            stdout: fromBase64(jData.stdout),
            stderr: fromBase64(jData.stderr),
            compileError: fromBase64(jData.compile_output),
            status: jData.status?.description || 'Accepted'
          };
          usedEngine = 'Judge0 Cloud Engine';
        }
      } catch (jErr) {
        console.warn('[CodeSandbox] Judge0 CE unavailable, trying fallback:', jErr.message);
      }
    }

    // --- TẦNG 2: Paiza.io Cloud Runner (Dự phòng chất lượng cao khi Judge0 bận) ---
    if (!result && langDef.paizaLang) {
      try {
        outputEl.textContent = `[${langDef.name}] Đang chuyển tiếp qua Paiza.io Runner...\n`;
        const pCreate = await fetch('https://api.paiza.io/runners/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source_code: code,
            language: langDef.paizaLang,
            longpoll: true,
            api_key: 'guest'
          })
        });

        if (pCreate.ok) {
          const pData = await pCreate.json();
          if (pData.id) {
            let pStatus = pData.status;
            for (let i = 0; i < 4; i++) {
              if (pStatus === 'completed') break;
              await new Promise(r => setTimeout(r, 600));
              const sRes = await fetch(`https://api.paiza.io/runners/get_status?id=${pData.id}&api_key=guest`);
              const sJson = await sRes.json();
              pStatus = sJson.status;
            }

            const dRes = await fetch(`https://api.paiza.io/runners/get_details?id=${pData.id}&api_key=guest`);
            if (dRes.ok) {
              const detail = await dRes.json();
              result = {
                stdout: detail.stdout || '',
                stderr: detail.stderr || '',
                compileError: detail.build_stderr || '',
                status: detail.result === 'success' ? 'Accepted' : (detail.result || 'Done')
              };
              usedEngine = 'Paiza.io Runner';
            }
          }
        }
      } catch (pErr) {
        console.warn('[CodeSandbox] Paiza.io unavailable, trying Wandbox:', pErr.message);
      }
    }

    // --- TẦNG 3: Wandbox Engine (Dự phòng cấp 3) ---
    if (!result && langDef.wandboxCompiler) {
      try {
        outputEl.textContent = `[${langDef.name}] Đang thử qua Wandbox Engine...\n`;
        const controller = new AbortController();
        const tId = setTimeout(() => controller.abort(), 12000);

        const wRes = await fetch('https://wandbox.org/api/compile.json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            compiler: langDef.wandboxCompiler,
            code: code
          }),
          signal: controller.signal
        });
        clearTimeout(tId);

        if (wRes.ok) {
          const wData = await wRes.json();
          result = {
            stdout: wData.program_output || '',
            stderr: wData.program_error || '',
            compileError: wData.compiler_error || '',
            status: wData.status === '0' ? 'Accepted' : `Exit Code ${wData.status}`
          };
          usedEngine = 'Wandbox Engine';
        }
      } catch (wErr) {
        console.warn('[CodeSandbox] Wandbox unavailable:', wErr.message);
      }
    }

    const elapsed = (performance.now() - startTime).toFixed(0);

    if (result) {
      let displayText = `=== KẾT QUẢ THỰC THI (${langDef.name} • ${usedEngine} • ${elapsed}ms) ===\nTrạng thái: ${result.status}\n\n`;

      if (result.compileError) {
        displayText += `[Lỗi Biên Dịch - Compiler Error]:\n${result.compileError}\n\n`;
      }

      if (result.stdout) {
        displayText += `[Output]:\n${result.stdout}\n`;
      }

      if (result.stderr) {
        displayText += `\n[Runtime Stderr / Cảnh Báo]:\n${result.stderr}\n`;
      }

      if (!result.stdout && !result.stderr && !result.compileError) {
        displayText += 'Chương trình thực thi hoàn tất thành công (Không có output ra màn hình).';
      }

      outputEl.textContent = displayText;
    } else {
      throw new Error('Tất cả máy chủ biên dịch trực tuyến (Judge0, Paiza, Wandbox) đều đang quá tải hoặc không thể kết nối. Vui lòng thử lại sau giây lát.');
    }
  } catch (err) {
    outputEl.textContent = `[Lỗi Biên Dịch & Thực Thi]:\n${err.message}\n\nGợi ý: Kiểm tra kết nối Internet. Riêng với JavaScript, bạn có thể chạy Offline 100% không cần mạng.`;
  } finally {
    if (runBtn) {
      runBtn.disabled = false;
      runBtn.textContent = 'Chạy Code';
    }
  }
}

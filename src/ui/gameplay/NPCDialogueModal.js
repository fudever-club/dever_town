export class NPCDialogueModal {
  constructor(scene) {
    this.scene = scene;
    this.isOpen = false;
    this.currentLines = [];
    this.currentLineIndex = 0;
    this.typewriterTimer = null;
    this.isTyping = false;
    this.currentNPC = null;
    this._createDOM();
  }
  
  _createDOM() {
    // Overlay mờ
    this.overlay = document.createElement('div');
    this.overlay.id = 'npc-dialogue-overlay';
    this.overlay.style.cssText = `
      position: fixed; inset: 0; 
      background: rgba(0,0,0,0); 
      z-index: 9000; 
      pointer-events: none;
      transition: background 0.3s;
    `;
    
    // Modal container — slide up từ bottom
    this.modal = document.createElement('div');
    this.modal.id = 'npc-dialogue-modal';
    this.modal.style.cssText = `
      position: fixed;
      bottom: -200px;
      left: 50%;
      transform: translateX(-50%);
      width: min(700px, 96vw);
      background: #0f172a;
      border: 2px solid #38bdf8;
      border-radius: 12px;
      padding: 16px;
      z-index: 9001;
      display: flex;
      gap: 16px;
      align-items: flex-start;
      pointer-events: all;
      transition: bottom 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 0 32px rgba(56,189,248,0.25), 0 8px 40px rgba(0,0,0,0.6);
      font-family: 'Outfit', system-ui, sans-serif;
    `;
    
    // Portrait container
    this.portraitContainer = document.createElement('div');
    this.portraitContainer.style.cssText = `
      flex-shrink: 0;
      width: 80px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    `;
    
    // Portrait canvas (80×96 px)
    this.portraitCanvas = document.createElement('canvas');
    this.portraitCanvas.width = 80;
    this.portraitCanvas.height = 96;
    this.portraitCanvas.style.cssText = `
      image-rendering: pixelated;
      border: 1.5px solid #334155;
      border-radius: 6px;
      background: #1e293b;
    `;
    
    // NPC name tag
    this.nameTag = document.createElement('div');
    this.nameTag.style.cssText = `
      font-size: 11px;
      font-weight: 700;
      color: #38bdf8;
      text-align: center;
      line-height: 1.2;
    `;
    
    this.roleTag = document.createElement('div');
    this.roleTag.style.cssText = `
      font-size: 9px;
      color: #64748b;
      text-align: center;
    `;
    
    this.portraitContainer.append(this.portraitCanvas, this.nameTag, this.roleTag);
    
    // Text box
    this.textBox = document.createElement('div');
    this.textBox.style.cssText = `
      flex: 1;
      min-height: 80px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    `;
    
    this.dialogueText = document.createElement('div');
    this.dialogueText.style.cssText = `
      font-size: 14px;
      line-height: 1.6;
      color: #e2e8f0;
      min-height: 68px;
    `;
    
    // Indicator row
    const indicatorRow = document.createElement('div');
    indicatorRow.style.cssText = `
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
    `;
    
    this.hintText = document.createElement('span');
    this.hintText.style.cssText = `font-size: 10px; color: #475569;`;
    this.hintText.textContent = '[E] / Space để tiếp tục  •  [F] để đóng';
    
    this.continueIndicator = document.createElement('div');
    this.continueIndicator.id = 'npc-continue-indicator';
    this.continueIndicator.style.cssText = `
      width: 14px; height: 14px;
      border-right: 2.5px solid #38bdf8;
      border-bottom: 2.5px solid #38bdf8;
      transform: rotate(45deg);
      animation: npcBlink 0.7s ease-in-out infinite;
      opacity: 0;
    `;
    
    indicatorRow.append(this.hintText, this.continueIndicator);
    this.textBox.append(this.dialogueText, indicatorRow);
    
    this.modal.append(this.portraitContainer, this.textBox);
    
    // CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes npcBlink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    
    document.body.append(this.overlay, this.modal);
    
    // Key handlers
    this._handleKey = (e) => {
      if (!this.isOpen) return;
      const key = e.code || e.key;
      if (key === 'KeyE' || key === 'e' || key === 'E' || key === 'Space' || key === ' ') {
        e.preventDefault();
        this.advance();
      }
      if (key === 'KeyF' || key === 'f' || key === 'F' || key === 'Escape') {
        e.preventDefault();
        this.close();
      }
    };
    window.addEventListener('keydown', this._handleKey);
    
    // Click to advance
    this.modal.addEventListener('click', () => { if (this.isOpen) this.advance(); });
  }
  
  show(npc) {
    this.currentNPC = npc;
    const dialogue = npc.getCurrentDialogue();
    if (!dialogue) return;
    
    this.currentLines = dialogue.lines || [];
    this.currentLineIndex = 0;
    this.isOpen = true;
    
    // Fill portrait
    this.nameTag.textContent = npc.npcName;
    this.roleTag.textContent = npc.npcRole;
    
    // Copy NPC portrait to canvas
    const portraitCtx = this.portraitCanvas.getContext('2d');
    portraitCtx.clearRect(0, 0, 80, 96);
    portraitCtx.imageSmoothingEnabled = false;

    let drawn = false;
    const charKey = `char_${npc.npcId}`;
    try {
      if (npc.scene.textures.exists(charKey)) {
        const charTex = npc.scene.textures.get(charKey);
        const charImg = charTex.getSourceImage();
        if (charImg) {
          // 1. Nền thẻ bài Chibi Metaverse
          const bgGrad = portraitCtx.createLinearGradient(0, 0, 0, 96);
          bgGrad.addColorStop(0, '#0b1329');
          bgGrad.addColorStop(1, '#020617');
          portraitCtx.fillStyle = bgGrad;
          portraitCtx.fillRect(0, 0, 80, 96);

          // Vầng sáng spotlight sau lưng
          const radial = portraitCtx.createRadialGradient(40, 48, 4, 40, 48, 40);
          radial.addColorStop(0, 'rgba(56, 189, 248, 0.28)');
          radial.addColorStop(1, 'rgba(2, 6, 23, 0)');
          portraitCtx.fillStyle = radial;
          portraitCtx.fillRect(0, 0, 80, 96);

          // Viền khung neon sắc nét
          portraitCtx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          portraitCtx.lineWidth = 1.5;
          portraitCtx.strokeRect(1, 1, 78, 94);

          // Lấy frame 0 (mặt trước 48x64 px), vẽ căn giữa 66x88 px
          portraitCtx.drawImage(charImg, 0, 0, 48, 64, 7, 6, 66, 88);
          drawn = true;
        }
      }
    } catch (e) {}

    if (!drawn) {
      const portraitKey = `npc_portrait_${npc.npcId}`;
      try {
        if (npc.scene.textures.exists(portraitKey)) {
          const tex = npc.scene.textures.get(portraitKey);
          if (tex && tex.source && tex.source[0]) {
            portraitCtx.drawImage(tex.source[0].image, 0, 0, 80, 96);
            drawn = true;
          }
        }
      } catch (err) {}
    }

    if (!drawn) {
      // Fallback: draw colored block với initial
      portraitCtx.fillStyle = '#1e293b';
      portraitCtx.fillRect(0, 0, 80, 96);
      portraitCtx.fillStyle = '#38bdf8';
      portraitCtx.font = 'bold 32px Outfit';
      portraitCtx.textAlign = 'center';
      portraitCtx.fillText(npc.npcName[0] || '?', 40, 56);
    }
    
    // Show overlay
    this.overlay.style.pointerEvents = 'all';
    this.overlay.style.background = 'rgba(0,0,0,0.45)';
    this.modal.style.bottom = '24px';
    
    // Type first line
    this._typeLine();
    
    // Pause game input
    if (this.scene?.inputController) {
      this.scene.inputController.blocked = true;
    }
  }
  
  _typeLine() {
    if (this.typewriterTimer) clearInterval(this.typewriterTimer);
    this.isTyping = true;
    this.continueIndicator.style.opacity = '0';
    
    const line = this.currentLines[this.currentLineIndex] || '';
    this.dialogueText.textContent = '';
    let i = 0;
    
    this.typewriterTimer = setInterval(() => {
      this.dialogueText.textContent += line[i] || '';
      i++;
      if (i >= line.length) {
        clearInterval(this.typewriterTimer);
        this.typewriterTimer = null;
        this.isTyping = false;
        this.continueIndicator.style.opacity = '1';
      }
    }, 30); // 33 chars/sec ≈ Pokémon speed
  }
  
  advance() {
    if (this.isTyping) {
      // Skip typewriter — show full line immediately
      if (this.typewriterTimer) { clearInterval(this.typewriterTimer); this.typewriterTimer = null; }
      this.isTyping = false;
      this.dialogueText.textContent = this.currentLines[this.currentLineIndex] || '';
      this.continueIndicator.style.opacity = '1';
      return;
    }
    
    this.currentLineIndex++;
    if (this.currentLineIndex < this.currentLines.length) {
      this._typeLine();
    } else {
      // End of dialogue block — advance NPC dialogue state
      if (this.currentNPC) {
        this.currentNPC.advanceDialogue();
      }
      this.close();
    }
  }
  
  close() {
    if (this.typewriterTimer) { clearInterval(this.typewriterTimer); this.typewriterTimer = null; }
    this.isOpen = false;
    this.overlay.style.background = 'rgba(0,0,0,0)';
    this.overlay.style.pointerEvents = 'none';
    this.modal.style.bottom = '-200px';
    
    // Resume game input
    if (this.scene?.inputController) {
      this.scene.inputController.blocked = false;
    }
    
    if (this.currentNPC) {
      this.currentNPC.state = 'aware'; // return to aware after talking
      this.currentNPC = null;
    }
  }
  
  destroy() {
    if (this.typewriterTimer) clearInterval(this.typewriterTimer);
    window.removeEventListener('keydown', this._handleKey);
    if (this.overlay.parentNode) this.overlay.remove();
    if (this.modal.parentNode) this.modal.remove();
  }
}

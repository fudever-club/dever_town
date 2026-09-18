import Phaser from 'phaser';
import { TextureGenerator } from '../utils/TextureGenerator.js';

export class NPC extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, config = {}) {
    // config: { id, name, role, spriteConfig, dialogues, portrait }
    // Tạo texture cho NPC nếu chưa có
    const textureKey = `char_${config.id}`;
    if (!scene.textures.exists(textureKey)) {
      TextureGenerator.generateCharacterSpritesheet(scene, {
        id: config.id,
        ...config.spriteConfig
      });
    }
    
    super(scene, x, y, textureKey, 0);
    
    this.npcId = config.id;
    this.npcName = config.name || 'NPC';
    this.npcRole = config.role || '';
    this.dialogues = config.dialogues || {};
    this.portrait = config.portrait || null;
    this.currentDialogueId = config.startDialogue || Object.keys(config.dialogues)[0];
    
    // FSM States: 'idle' | 'aware' | 'talking'
    this.state = 'idle';
    this.direction = config.direction || 'down';
    this.proximityRadius = 50;
    
    scene.add.existing(this);
    
    // Shadow
    this.shadowEllipse = scene.add.ellipse(x, y + 30, 22, 8, 0x000000, 0.25);
    this.shadowEllipse.setDepth(this.y - 0.1);
    
    // Speech indicator "···" bubble
    this.indicatorBubble = null;
    
    // Start idle animation
    this.setDepth(this.y + 30);
    this._playIdleAnim();
    
    // Breathing tween
    this._startBreathingTween();
    
    // Generate portrait texture
    if (config.spriteConfig) {
      const portraitKey = `npc_portrait_${config.id}`;
      if (!scene.textures.exists(portraitKey)) {
        TextureGenerator.generateNPCPortrait(scene, config.spriteConfig, portraitKey);
      }
    }
  }
  
  _playIdleAnim() {
    const key = `idle_breathe_${this.direction}_${this.npcId}`;
    if (this.scene?.anims?.exists(key)) {
      this.anims.play(key, true);
    } else {
      // fallback: try idle_down_npcId
      const fallback = `idle_${this.direction}_${this.npcId}`;
      if (this.scene?.anims?.exists(fallback)) {
        this.anims.play(fallback, true);
      }
    }
  }
  
  _startBreathingTween() {
    this._breathTween = this.scene.tweens.add({
      targets: this,
      scaleY: { from: 1.0, to: 1.01 },
      scaleX: { from: 1.0, to: 0.99 },
      duration: 1200,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }
  
  showIndicator() {
    if (this.indicatorBubble) return;
    
    const container = this.scene.add.container(this.x, this.y - 44);
    container.setDepth(999998);
    
    const bg = this.scene.add.graphics();
    bg.fillStyle(0xffffff, 0.92);
    bg.fillRoundedRect(-14, -10, 28, 20, 6);
    bg.lineStyle(1.5, 0x94a3b8, 1);
    bg.strokeRoundedRect(-14, -10, 28, 20, 6);
    // Tail
    bg.fillStyle(0xffffff, 0.92);
    bg.fillTriangle(-4, 10, 4, 10, 0, 16);
    
    const dots = this.scene.add.text(0, 0, '···', {
      fontSize: '11px',
      color: '#475569',
      fontFamily: "'Outfit', sans-serif",
      fontWeight: '700'
    }).setOrigin(0.5, 0.5);
    
    // Blink tween for dots
    this.scene.tweens.add({
      targets: dots,
      alpha: { from: 1, to: 0.3 },
      duration: 600,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
    
    container.add([bg, dots]);
    this.indicatorBubble = container;
  }
  
  hideIndicator() {
    if (this.indicatorBubble) {
      this.indicatorBubble.destroy();
      this.indicatorBubble = null;
    }
  }
  
  lookAtPlayer(playerX) {
    if (playerX < this.x) {
      this.direction = 'left';
    } else {
      this.direction = 'right';
    }
    this._playIdleAnim();
  }
  
  update(playerX, playerY) {
    const dist = Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY);
    
    if (dist < this.proximityRadius) {
      if (this.state === 'idle') {
        this.state = 'aware';
        this.lookAtPlayer(playerX);
        this.showIndicator();
      }
    } else {
      if (this.state === 'aware') {
        this.state = 'idle';
        this.direction = 'down';
        this._playIdleAnim();
        this.hideIndicator();
      }
    }
    
    // Update indicator position
    if (this.indicatorBubble) {
      this.indicatorBubble.setPosition(this.x, this.y - 44);
    }
    
    // Update shadow
    if (this.shadowEllipse) {
      this.shadowEllipse.setPosition(this.x, this.y + 28);
      this.shadowEllipse.setDepth(this.y - 0.1);
    }
  }
  
  getCurrentDialogue() {
    return this.dialogues[this.currentDialogueId] || null;
  }
  
  advanceDialogue() {
    const current = this.getCurrentDialogue();
    if (current && current.nextDialogue) {
      this.currentDialogueId = current.nextDialogue;
    }
  }
  
  isPlayerNear(playerX, playerY) {
    return Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY) < this.proximityRadius;
  }
  
  destroy(fromScene) {
    if (this._breathTween) { this._breathTween.stop(); this._breathTween = null; }
    if (this.shadowEllipse) { this.shadowEllipse.destroy(); this.shadowEllipse = null; }
    if (this.indicatorBubble) { this.indicatorBubble.destroy(); this.indicatorBubble = null; }
    super.destroy(fromScene);
  }
}

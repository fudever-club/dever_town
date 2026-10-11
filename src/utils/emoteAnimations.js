/**
 * emoteAnimations — Body animation cho emote (vẫy tay, gật đầu, power pose, dance step).
 * Dùng chung cho Player và RemotePlayer (cả 2 đều là Phaser.GameObjects.Sprite).
 *
 * Kỹ thuật: overlay cánh tay pixel-art (texture 'emote_arm_wave' / 'emote_arms_power'
 * từ TextureGenerator.generateEmoteOverlays) đặt tại vai, tween xoay; gật đầu và
 * dance dùng squash & stretch + tween tương đối nên an toàn với physics body.
 */

const SHOULDER_DX = { down: -13, left: 0, right: 0, up: 13 };
const BODY_EMOTES = new Set(['wave', 'nod', 'power', 'dance']);

export function isBodyEmote(emoteId) {
  return BODY_EMOTES.has(emoteId);
}

function trackTween(sprite, tween) {
  sprite._emoteTweens = sprite._emoteTweens || [];
  sprite._emoteTweens.push(tween);
}

function trackTimer(sprite, timer) {
  sprite._emoteTimers = sprite._emoteTimers || [];
  sprite._emoteTimers.push(timer);
}

export function clearEmoteOverlays(sprite) {
  if (!sprite) return;
  if (sprite._emoteTweens) {
    for (const tw of sprite._emoteTweens) {
      try { sprite.scene?.tweens?.killTweensOf(tw.targets || tw); } catch (e) {}
      try { tw.stop?.(); tw.remove?.(); } catch (e) {}
    }
    sprite._emoteTweens = null;
  }
  if (sprite._emoteTimers) {
    for (const t of sprite._emoteTimers) { try { t.remove(); } catch (e) {} }
    sprite._emoteTimers = null;
  }
  if (sprite._emoteOverlays) {
    for (const o of sprite._emoteOverlays) {
      try { o.obj?.destroy(); } catch (e) {}
    }
    sprite._emoteOverlays = null;
  }
  try {
    sprite.setAngle(0);
    sprite.setScale(1, 1);
  } catch (e) {}
}

/** Giữ overlay bám theo sprite — gọi mỗi frame trong update() của Player/RemotePlayer. */
export function syncEmoteOverlays(sprite) {
  if (!sprite._emoteOverlays) return;
  for (const o of sprite._emoteOverlays) {
    if (o.obj && !o.obj.destroyed) o.obj.setPosition(sprite.x + o.dx, sprite.y + o.dy);
  }
}

function addOverlay(scene, sprite, key, dx, dy) {
  if (!scene.textures.exists(key)) return null;
  const depth = (sprite.depth || 0) + 1;
  const obj = scene.add.sprite(sprite.x + dx, sprite.y + dy, key)
    .setOrigin(0.5, 0.875)
    .setDepth(depth);
  sprite._emoteOverlays = sprite._emoteOverlays || [];
  sprite._emoteOverlays.push({ obj, dx, dy });
  return obj;
}

export function playBodyEmote(scene, sprite, emoteId) {
  clearEmoteOverlays(sprite);
  if (!scene || !scene.add || !isBodyEmote(emoteId)) return;
  const dir = sprite.currentDirection || 'down';

  if (emoteId === 'wave') {
    // Vẫy tay phải: cánh tay giơ lên, xoay qua lại 8 nhịp
    const arm = addOverlay(scene, sprite, 'emote_arm_wave', SHOULDER_DX[dir] ?? -13, 4);
    if (arm) {
      trackTween(sprite, scene.tweens.add({
        targets: arm,
        angle: { from: -28, to: 28 },
        duration: 150, yoyo: true, repeat: 7, ease: 'Sine.easeInOut',
        onComplete: () => clearEmoteOverlays(sprite)
      }));
    }
  } else if (emoteId === 'nod') {
    // Gật đầu: squash 2 nhịp (cả người nhún như gật)
    trackTween(sprite, scene.tweens.add({
      targets: sprite,
      scaleY: { from: 1, to: 0.9 },
      scaleX: { from: 1, to: 1.05 },
      duration: 170, yoyo: true, repeat: 3, ease: 'Sine.easeInOut',
      onComplete: () => { try { sprite.setScale(1, 1); } catch (e) {} sprite._emoteTweens = null; }
    }));
  } else if (emoteId === 'power') {
    // Power pose: 2 tay chữ V + scale pop + sparkles
    const arms = addOverlay(scene, sprite, 'emote_arms_power', 0, 4);
    if (arms) {
      trackTween(sprite, scene.tweens.add({
        targets: arms, angle: { from: -7, to: 7 },
        duration: 200, yoyo: true, repeat: 5, ease: 'Sine.easeInOut',
        onComplete: () => clearEmoteOverlays(sprite)
      }));
    }
    trackTween(sprite, scene.tweens.add({
      targets: sprite, scaleX: 1.12, scaleY: 1.12,
      duration: 220, yoyo: true, ease: 'Back.easeOut',
      onComplete: () => { try { sprite.setScale(1, 1); } catch (e) {} }
    }));
    try {
      scene.juiceManager?.spawnSparkles?.(sprite.x, sprite.y - 30, 16, '#fbbf24');
    } catch (e) {}
  } else if (emoteId === 'dance') {
    // Dance step: 8 beats — nghiêng trái/phải, nhún nhảy, tay vẫy luân phiên, nốt nhạc bay
    const armL = addOverlay(scene, sprite, 'emote_arm_wave', -13, 4);
    const armR = addOverlay(scene, sprite, 'emote_arm_wave', 13, 4);
    if (armL) armL.setVisible(false);
    let beat = 0;
    trackTimer(sprite, scene.time.addEvent({
      delay: 240, repeat: 7,
      callback: () => {
        beat += 1;
        const goLeft = beat % 2 === 0;
        if (armL) armL.setVisible(goLeft);
        if (armR) armR.setVisible(!goLeft);
        try { sprite.setAngle(goLeft ? -10 : 10); } catch (e) {}
        const note = scene.add.text(
          sprite.x + (goLeft ? -18 : 18), sprite.y - 46, '♪',
          { fontSize: '15px', color: '#f0abfc' }
        ).setDepth((sprite.depth || 0) + 2).setOrigin(0.5, 0.5);
        scene.tweens.add({
          targets: note, y: note.y - 26, alpha: 0, duration: 650, ease: 'Cubic.easeOut',
          onComplete: () => { try { note.destroy(); } catch (e) {} }
        });
      }
    }));
    trackTween(sprite, scene.tweens.add({
      targets: sprite, y: '-=10',
      duration: 240, yoyo: true, repeat: 7, ease: 'Sine.easeInOut',
      onComplete: () => clearEmoteOverlays(sprite)
    }));
  }
}

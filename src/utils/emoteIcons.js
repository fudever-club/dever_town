/**
 * Emote pixel icons (16x16) cho EmoteBar — tách riêng khỏi TextureGenerator.js
 * để giữ mỗi file dưới ~100KB (giới hạn payload khi push qua GitHub API).
 * Tái sử dụng TextureGenerator._paintIcons / _getIconURL cho nhất quán palette
 * và cache với item/badge icons.
 */
import { TextureGenerator } from './TextureGenerator.js';
  /**
   * Lay dataURL cua emote icon cho DOM <img>. Tra ve null neu texture chua sinh.
   */
export function getEmoteIconURL(scene, emoteId) {
    return TextureGenerator._getIconURL(scene, 'emoteicon', emoteId);
  }

  /**
   * Sinh pixel icons 16x16 cho EmoteBar (dung trong EmoteBar thay emoji).
   * Key: 'emoteicon_<emoteId>'. Palette nhat quan voi item/badge icons.
   */
export function generateEmoteIcons(scene) {
    const R = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
    const drawers = {
      // Tay vay dong: ban tay + 3 vach chuyen dong xanh
      wave(ctx) {
        R(ctx, 5, 3, 6, 3, '#fcd34d');
        R(ctx, 6, 6, 4, 6, '#fcd34d');
        R(ctx, 9, 6, 1, 6, '#f59e0b');
        R(ctx, 4, 7, 2, 2, '#fcd34d');
        R(ctx, 10, 7, 2, 2, '#fcd34d');
        R(ctx, 5, 11, 6, 3, '#1e40af');
        R(ctx, 5, 11, 6, 1, '#3b82f6');
        R(ctx, 5, 13, 6, 1, '#172554');
        R(ctx, 1, 2, 1, 3, '#7dd3fc');
        R(ctx, 2, 6, 1, 2, '#7dd3fc');
        R(ctx, 14, 2, 1, 3, '#7dd3fc');
        R(ctx, 13, 6, 1, 2, '#7dd3fc');
      },
      // Trai tim do
      heart(ctx) {
        R(ctx, 4, 3, 3, 2, '#ef4444');
        R(ctx, 9, 3, 3, 2, '#ef4444');
        R(ctx, 3, 5, 10, 4, '#ef4444');
        R(ctx, 4, 9, 8, 2, '#ef4444');
        R(ctx, 6, 11, 4, 1, '#ef4444');
        R(ctx, 7, 12, 2, 1, '#b91c1c');
        R(ctx, 4, 4, 2, 1, '#fca5a5');
        R(ctx, 11, 5, 2, 4, '#b91c1c');
      },
      // Ngon lua cam vang
      fire(ctx) {
        R(ctx, 7, 1, 2, 3, '#f97316');
        R(ctx, 6, 4, 4, 4, '#f97316');
        R(ctx, 4, 8, 8, 4, '#f97316');
        R(ctx, 5, 12, 6, 2, '#c2410c');
        R(ctx, 9, 5, 2, 6, '#c2410c');
        R(ctx, 7, 7, 2, 5, '#fde047');
        R(ctx, 6, 9, 4, 3, '#fde047');
        R(ctx, 7, 11, 2, 2, '#fbbf24');
        R(ctx, 12, 3, 1, 2, '#fde047');
        R(ctx, 3, 5, 1, 2, '#fdba74');
      },
      // Hai tay vo vao nhau
      clap(ctx) {
        R(ctx, 2, 3, 3, 6, '#fcd34d');
        R(ctx, 1, 2, 2, 2, '#fcd34d');
        R(ctx, 11, 3, 3, 6, '#fcd34d');
        R(ctx, 13, 2, 2, 2, '#fcd34d');
        R(ctx, 5, 5, 6, 5, '#fcd34d');
        R(ctx, 9, 5, 2, 5, '#f59e0b');
        R(ctx, 7, 1, 2, 2, '#fde047');
        R(ctx, 7, 12, 2, 2, '#fde047');
        R(ctx, 2, 9, 3, 4, '#1e40af');
        R(ctx, 11, 9, 3, 4, '#1e40af');
        R(ctx, 2, 9, 3, 1, '#3b82f6');
        R(ctx, 11, 9, 3, 1, '#3b82f6');
      },
      // Vu cong dang nhay: tay giu len, chan da cheo
      dance(ctx) {
        R(ctx, 6, 1, 4, 4, '#fcd34d');
        R(ctx, 6, 1, 4, 1, '#fde68a');
        R(ctx, 6, 5, 4, 4, '#a855f7');
        R(ctx, 6, 5, 1, 4, '#c084fc');
        R(ctx, 9, 6, 1, 3, '#7c3aed');
        R(ctx, 10, 2, 2, 4, '#a855f7');
        R(ctx, 2, 6, 4, 2, '#a855f7');
        R(ctx, 6, 9, 2, 5, '#1e293b');
        R(ctx, 8, 9, 5, 2, '#1e293b');
        R(ctx, 12, 9, 2, 2, '#fcd34d');
        R(ctx, 1, 3, 1, 2, '#7dd3fc');
        R(ctx, 14, 12, 1, 2, '#7dd3fc');
      },
      // Dau cham hoi trang tren nen xanh
      question(ctx) {
        R(ctx, 3, 2, 10, 10, '#1e40af');
        R(ctx, 3, 2, 10, 1, '#3b82f6');
        R(ctx, 3, 11, 10, 1, '#172554');
        R(ctx, 7, 12, 2, 2, '#1e40af');
        R(ctx, 5, 3, 6, 2, '#f8fafc');
        R(ctx, 9, 5, 2, 3, '#f8fafc');
        R(ctx, 8, 8, 2, 2, '#f8fafc');
        R(ctx, 7, 10, 2, 2, '#f8fafc');
      },
      // Giong ngon tay cai (nod)
      nod(ctx) {
        R(ctx, 3, 9, 4, 5, '#1e40af');
        R(ctx, 3, 9, 4, 1, '#3b82f6');
        R(ctx, 3, 13, 4, 1, '#172554');
        R(ctx, 6, 8, 5, 4, '#fcd34d');
        R(ctx, 6, 8, 5, 1, '#fde68a');
        R(ctx, 8, 3, 3, 6, '#fcd34d');
        R(ctx, 10, 3, 1, 6, '#f59e0b');
        R(ctx, 6, 11, 5, 1, '#f59e0b');
        R(ctx, 12, 4, 1, 3, '#22c55e');
        R(ctx, 1, 10, 2, 1, '#22c55e');
      },
      // Power pose: nhan vat 2 tay giu cao
      power(ctx) {
        R(ctx, 6, 2, 4, 4, '#fcd34d');
        R(ctx, 6, 2, 4, 1, '#fde68a');
        R(ctx, 3, 3, 3, 2, '#fcd34d');
        R(ctx, 10, 3, 3, 2, '#fcd34d');
        R(ctx, 3, 5, 3, 2, '#f26f21');
        R(ctx, 10, 5, 3, 2, '#f26f21');
        R(ctx, 6, 6, 4, 4, '#f26f21');
        R(ctx, 6, 6, 1, 4, '#fdba74');
        R(ctx, 9, 6, 1, 4, '#c2410c');
        R(ctx, 6, 10, 2, 4, '#1e293b');
        R(ctx, 8, 10, 2, 4, '#1e293b');
        R(ctx, 1, 2, 1, 2, '#fde047');
        R(ctx, 14, 2, 1, 2, '#fde047');
      },
      // Touch: tia set vang (nut Dau Tri Sieu Toc)
      touch_duel(ctx) {
        R(ctx, 9, 1, 3, 3, '#fde047');
        R(ctx, 8, 4, 4, 2, '#fde047');
        R(ctx, 7, 6, 5, 2, '#fbbf24');
        R(ctx, 6, 8, 4, 2, '#fbbf24');
        R(ctx, 8, 10, 3, 2, '#f59e0b');
        R(ctx, 6, 12, 3, 3, '#f59e0b');
        R(ctx, 9, 2, 1, 5, '#fef9c3');
      },
      // Touch: tia lanh sang (nut Bieu Cam)
      touch_emote(ctx) {
        R(ctx, 7, 2, 2, 8, '#fef9c3');
        R(ctx, 4, 5, 8, 2, '#fef9c3');
        R(ctx, 12, 1, 1, 4, '#fde047');
        R(ctx, 11, 2, 3, 1, '#fde047');
        R(ctx, 2, 10, 1, 4, '#fde047');
        R(ctx, 1, 11, 3, 1, '#fde047');
      },
      // Touch: bong bong chat (nut Chat)
      touch_chat(ctx) {
        R(ctx, 2, 3, 12, 7, '#e0f2fe');
        R(ctx, 2, 3, 12, 1, '#ffffff');
        R(ctx, 2, 9, 12, 1, '#7dd3fc');
        R(ctx, 5, 10, 3, 2, '#e0f2fe');
        R(ctx, 5, 12, 2, 1, '#e0f2fe');
        R(ctx, 4, 5, 8, 1, '#0284c7');
        R(ctx, 4, 7, 5, 1, '#0284c7');
      },
      // Touch: ba lo (nut Tui Do)
      touch_bag(ctx) {
        R(ctx, 4, 4, 8, 9, '#0284c7');
        R(ctx, 4, 4, 8, 2, '#0ea5e9');
        R(ctx, 4, 11, 8, 2, '#0369a1');
        R(ctx, 6, 2, 4, 2, '#475569');
        R(ctx, 6, 6, 4, 4, '#f26f21');
        R(ctx, 6, 6, 4, 1, '#fdba74');
        R(ctx, 2, 6, 2, 5, '#0369a1');
        R(ctx, 12, 6, 2, 5, '#0369a1');
      }
    };
    TextureGenerator._paintIcons(scene, 'emoteicon', drawers);
  }

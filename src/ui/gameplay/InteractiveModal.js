/**
 * InteractiveModal — thin shell (dispatcher entry point).
 *
 * The class is defined in InteractiveModal.base.js (constructor, lifecycle,
 * event wiring, zone dispatcher). Each interaction area attaches its methods
 * to InteractiveModal.prototype via its own InteractiveModal.<area>.js
 * module, following the prototype-patch pattern established in
 * InteractiveModal.dream.js.
 *
 * Modules (import order does not matter — all patches apply at import time
 * before any instance is created):
 *   base        constructor, isOpen/openForZone/show/hide, initEvents, pomodoro
 *   slides      Slide / bài giảng CLB
 *   meeting     Phòng họp + voice engine (mic/cam/screen, giơ tay, spotlight, moderation, quiz)
 *   code        Code editor / sandbox
 *   coffee      Góc cà phê + nhạc lofi
 *   gallery     Gallery kỷ niệm CLB
 *   website     Website / portal quick links
 *   sports      Sports arcade
 *   fptu        FPTU portal
 *   canteen     Canteen menu
 *   campus      Campus map
 *   charter     Charter / điều lệ CLB
 *   arcade      Retro arcade games
 *   robot       Robot showcase
 *   frog        Cóc Vàng tâm linh / rút quẻ coder
 *   clubbooth   Gian hàng CLB FPTU
 *   rest        Giường nghỉ KTX (+ dream hooks patched separately in .dream.js)
 *   bugdungeon  Hầm ngục sự cố server / săn Dever Coin
 *
 * Do NOT add methods here — add them to the matching InteractiveModal.<area>.js
 * module file. DOM IDs, public API and behaviour are unchanged.
 */
import { InteractiveModal } from './InteractiveModal.base.js';
import './InteractiveModal.slides.js';
import './InteractiveModal.meeting.js';
import './InteractiveModal.code.js';
import './InteractiveModal.coffee.js';
import './InteractiveModal.gallery.js';
import './InteractiveModal.website.js';
import './InteractiveModal.sports.js';
import './InteractiveModal.fptu.js';
import './InteractiveModal.canteen.js';
import './InteractiveModal.campus.js';
import './InteractiveModal.charter.js';
import './InteractiveModal.arcade.js';
import './InteractiveModal.robot.js';
import './InteractiveModal.frog.js';
import './InteractiveModal.clubbooth.js';
import './InteractiveModal.rest.js';
import './InteractiveModal.bugdungeon.js';

export { InteractiveModal };

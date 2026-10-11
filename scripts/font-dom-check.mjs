import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:3030/');
await page.waitForTimeout(1500);
const res = await page.evaluate(() => {
  const check = (cls) => {
    const el = document.createElement('div');
    el.className = cls;
    el.textContent = 'Test';
    document.body.appendChild(el);
    const f = getComputedStyle(el).fontFamily;
    el.remove();
    return f;
  };
  return {
    toast: check('dever-toast'),
    campusHud: check('campus-time-hud'),
    dzcBtn: (() => {
      const wrap = document.createElement('div');
      wrap.className = 'dever-zoom-controls';
      const btn = document.createElement('button');
      btn.className = 'dzc-btn';
      wrap.appendChild(btn); document.body.appendChild(wrap);
      const f = getComputedStyle(btn).fontFamily;
      wrap.remove();
      return f;
    })(),
    body: getComputedStyle(document.body).fontFamily,
  };
});
console.log(JSON.stringify(res, null, 1));
await browser.close();

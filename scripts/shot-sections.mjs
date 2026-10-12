// Screenshot individual sections: node scripts/shot-sections.mjs url outDir selector1,selector2 [width]
import { chromium } from 'playwright';
const [,, url, out, sels, w = '1440', motionArg] = process.argv;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const mobile = Number(w) < 700;
const ctx = await browser.newContext({ viewport: { width: Number(w), height: mobile ? 844 : 900 }, isMobile: mobile, hasTouch: mobile, reducedMotion: motionArg === 'motion' ? 'no-preference' : 'reduce' });
const page = await ctx.newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(e.message));
await page.goto(url, { waitUntil: 'networkidle' });
await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 80)); } window.scrollTo(0, 0); });
await page.waitForTimeout(500);
for (const [i, s] of sels.split(',').entries()) {
  const el = page.locator(s).first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await el.screenshot({ path: `${out}/sec-${w}-${i}-${s.replace(/[^a-z0-9]/gi, '')}.png` });
}
if (errs.length) console.log('ERRORS', errs);
await browser.close();

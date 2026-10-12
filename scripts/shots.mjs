// Screenshot pages for visual review: node scripts/shots.mjs [url] [outDir] [--motion]
// Without --motion the page is captured with prefers-reduced-motion (final states).
import { chromium } from 'playwright';
import fs from 'node:fs';

const base = process.argv[2] ?? 'http://localhost:4321/';
const out = process.argv[3] ?? './.shots';
const motion = process.argv.includes('--motion');
const pages = (process.env.PAGES ?? '/').split(',');
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const viewports = [
  { name: 'desktop', width: 1440, height: 900, isMobile: false },
  { name: 'mobile', width: 390, height: 844, isMobile: true },
];
for (const vp of viewports) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    isMobile: vp.isMobile,
    hasTouch: vp.isMobile,
    reducedMotion: motion ? 'no-preference' : 'reduce',
    locale: 'he-IL',
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  for (const p of pages) {
    const url = new URL(p, base).href;
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(motion ? 2600 : 400);
    // walk down the page so lazy images load, then return to the top
    await page.evaluate(async () => {
      const step = Math.round(window.innerHeight * 0.8);
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 300));
    });
    const slug = (p.replace(/\//g, '_') || '_') + '-' + vp.name + (motion ? '-motion' : '');
    await page.screenshot({ path: `${out}/${slug}-top.png` });
    if (!motion) await page.screenshot({ path: `${out}/${slug}-full.png`, fullPage: true });
  }
  if (errors.length) console.log(vp.name, 'ERRORS:', errors);
  await ctx.close();
}
await browser.close();
console.log('shots in', out);

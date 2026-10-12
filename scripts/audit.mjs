// Accessibility (axe-core, WCAG 2.1 AA), heading, link and JSON-LD checks on every page.
//   node scripts/audit.mjs http://127.0.0.1:4321/
import { chromium } from 'playwright';
import fs from 'node:fs';

const base = process.argv[2] ?? 'http://127.0.0.1:4321/';
const sitemap = await (await fetch(new URL('/sitemap.xml', base))).text();
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(new URL(m[1]).pathname, base).href);
urls.push(new URL('/404/', base).href);
const axeSource = fs.readFileSync('node_modules/axe-core/axe.min.js', 'utf8');

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
const page = await ctx.newPage();
const seen = new Set();
let problems = 0;
for (const url of urls) {
  const errors = [];
  page.removeAllListeners('pageerror');
  page.on('pageerror', (e) => errors.push(e.message));
  const res = await page.goto(url, { waitUntil: 'networkidle' });
  await page.addScriptTag({ content: axeSource });
  const axe = await page.evaluate(async () => {
    // @ts-ignore
    const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
    return r.violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, target: v.nodes.slice(0, 3).map((x) => x.target.join(' ')), msg: v.help }));
  });
  const info = await page.evaluate(() => {
    const h1 = [...document.querySelectorAll('h1')].map((h) => h.textContent.trim());
    const levels = [...document.querySelectorAll('h1,h2,h3,h4')].map((h) => Number(h.tagName[1]));
    let skip = false;
    for (let i = 1; i < levels.length; i++) if (levels[i] - levels[i - 1] > 1) skip = true;
    const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => {
      try { JSON.parse(s.textContent); return 'ok'; } catch { return 'invalid'; }
    });
    const links = [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'));
    return {
      title: document.title,
      titleLen: document.title.length,
      desc: document.querySelector('meta[name="description"]')?.content ?? '',
      canonical: document.querySelector('link[rel="canonical"]')?.href,
      h1,
      skip,
      ld,
      links,
      imgsNoAlt: [...document.images].filter((i) => !i.hasAttribute('alt')).length,
    };
  });
  const local = info.links.filter((h) => h.startsWith('/') && !h.startsWith('//'));
  for (const l of local) seen.add(l.split('#')[0]);
  const issues = [];
  if (res.status() !== 200 && !url.includes('/404/')) issues.push(`HTTP ${res.status()}`);
  if (info.h1.length !== 1) issues.push(`H1 count ${info.h1.length}`);
  if (info.skip) issues.push('heading level skipped');
  if (info.ld.includes('invalid')) issues.push('invalid JSON-LD');
  if (info.titleLen > 65) issues.push(`title ${info.titleLen} chars`);
  if (info.desc.length < 70 || info.desc.length > 165) issues.push(`description ${info.desc.length} chars`);
  if (info.imgsNoAlt) issues.push(`${info.imgsNoAlt} img without alt`);
  if (errors.length) issues.push('JS errors: ' + errors.join(' | '));
  if (axe.length) issues.push('axe: ' + axe.map((a) => `${a.id}(${a.impact},${a.n}) ${a.target.join(', ')}`).join(' ; '));
  problems += issues.length;
  console.log(`${issues.length ? '✗' : '✓'} ${new URL(url).pathname}  [${info.titleLen}c/${info.desc.length}c] ${issues.join(' || ')}`);
}
// internal links that do not resolve
for (const l of seen) {
  if (!l || l === '/tool/') continue;
  const r = await fetch(new URL(l, base));
  if (r.status !== 200) { console.log(`✗ broken internal link ${l} -> ${r.status}`); problems++; }
}
await browser.close();
console.log(problems ? `${problems} issue(s)` : 'all clear');

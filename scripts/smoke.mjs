// Functional smoke test of the interactive parts, with motion enabled.
//   node scripts/smoke.mjs http://127.0.0.1:4321/
import { chromium } from 'playwright';
const base = process.argv[2] ?? 'http://127.0.0.1:4321/';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const results = [];
const ok = (name, cond, extra = '') => results.push(`${cond ? '✓' : '✗'} ${name}${extra ? ' — ' + extra : ''}`);

// Desktop, motion on
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  const state = await page.evaluate(() => ({
    motion: !!window.__lumeraMotion,
    ready: document.documentElement.classList.contains('motion-ready'),
    lenis: document.documentElement.classList.contains('lenis'),
    titleVisible: getComputedStyle(document.querySelector('[data-hero-title]')).visibility,
    lines: document.querySelectorAll('[data-hero-title] .line').length,
  }));
  ok('motion layer booted', state.motion && state.ready, JSON.stringify(state));
  ok('hero title visible after intro', state.titleVisible === 'visible');
  // solutions panel opens on click
  await page.click('[data-panel-toggle]');
  ok('solutions panel opens', await page.isVisible('#solutions-panel'));
  await page.keyboard.press('Escape');
  ok('solutions panel closes on Escape', !(await page.isVisible('#solutions-panel')));
  // switch demo
  const radios = page.locator('[data-switch-themes] [role="radio"]');
  await radios.nth(1).scrollIntoViewIfNeeded();
  await radios.nth(1).click();
  await page.waitForTimeout(1100);
  const sw = await page.evaluate(() => {
    const checked = document.querySelector('[data-switch-themes] [role="radio"][aria-checked="true"]')?.dataset.theme;
    const active = [...document.querySelectorAll('[data-theme-screen].is-active')].map((s) => s.dataset.themeScreen);
    return { checked, active };
  });
  ok('switch screen changes', sw.checked === 'shutters' && sw.active.includes('shutters'), JSON.stringify(sw));
  // dimmer
  await page.locator('[data-dimmer-level]').scrollIntoViewIfNeeded();
  await page.locator('[data-dimmer-level]').fill('30');
  const dim = await page.evaluate(() => ({
    level: document.querySelector('[data-dimmer]').style.getPropertyValue('--level'),
    out: document.querySelector('[data-dimmer-level-out]').textContent,
  }));
  ok('dimmer updates', dim.level === '0.3' && dim.out === '30%', JSON.stringify(dim));
  // x-ray pin + steps
  await page.evaluate(() => document.querySelector('[data-xray]').scrollIntoView());
  await page.mouse.wheel(0, 1600);
  await page.waitForTimeout(1500);
  const xr = await page.evaluate(() => ({
    animated: document.querySelector('[data-xray]').classList.contains('is-animated'),
    active: [...document.querySelectorAll('[data-xray-step]')].findIndex((s) => s.classList.contains('is-active')),
  }));
  ok('x-ray sequence runs', xr.animated && xr.active >= 0, JSON.stringify(xr));
  ok('no JS errors (desktop)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

// Mobile, menu
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.tap('[data-menu-toggle]');
  ok('mobile menu opens', await page.isVisible('#mobile-menu'));
  const inert = await page.evaluate(() => document.querySelector('main').inert);
  ok('page behind menu is inert', inert === true);
  await page.tap('[data-menu-toggle]');
  ok('mobile menu closes', !(await page.isVisible('#mobile-menu')));
  await page.evaluate(() => window.scrollTo(0, 1200));
  await page.waitForTimeout(800);
  ok('mobile contact bar appears after scrolling', await page.evaluate(() => document.querySelector('[data-mobile-bar]').classList.contains('is-visible')));
  ok('no JS errors (mobile)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}
await browser.close();
console.log(results.join('\n'));

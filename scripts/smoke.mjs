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

  // hero film: the wide cut plays muted, reframes per shot, and has a working pause button
  const hero = await page.evaluate(async () => {
    const v = document.querySelector('[data-hero] video');
    const before = { src: v.currentSrc, paused: v.paused, muted: v.muted, playing: v.closest('[data-bg-video]').classList.contains('is-playing') };
    v.currentTime = 10.5; // inside a shot framed at 100%
    await new Promise((r) => setTimeout(r, 700));
    return { ...before, x: v.style.getPropertyValue('--x'), progress: document.querySelector('[data-video-progress]').style.transform };
  });
  ok('hero film plays (wide cut, muted)', /hero-d\.(webm|mp4)$/.test(hero.src) && !hero.paused && hero.muted && hero.playing, JSON.stringify(hero));
  ok('hero film reframes by shot', hero.x === '100%' && /scaleX/.test(hero.progress), `x=${hero.x} ${hero.progress}`);
  await page.click('[data-video-toggle="hero-video"]');
  const paused = await page.evaluate(() => ({
    paused: document.querySelector('[data-hero] video').paused,
    label: document.querySelector('[data-video-toggle="hero-video"] [data-label]').textContent,
  }));
  ok('hero pause button pauses', paused.paused && paused.label === 'הפעלת סרטון הרקע', JSON.stringify(paused));
  await page.click('[data-video-toggle="hero-video"]');
  await page.waitForTimeout(400);
  ok('hero pause button resumes', await page.evaluate(() => !document.querySelector('[data-hero] video').paused));

  // the full film opens in a dialog, pauses the hero, and gives focus back when closed
  await page.click('[data-film-open]');
  await page.waitForTimeout(500);
  const film = await page.evaluate(() => ({
    open: document.querySelector('dialog[data-film]').open,
    modal: document.documentElement.dataset.modal,
    src: document.querySelector('[data-film-video]').getAttribute('src'),
    heroPaused: document.querySelector('[data-hero] video').paused,
  }));
  ok('film dialog opens with the large file', film.open && film.modal === 'open' && film.src === '/media/film-1080.mp4' && film.heroPaused, JSON.stringify(film));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  const closed = await page.evaluate(() => ({
    open: document.querySelector('dialog[data-film]').open,
    modal: document.documentElement.dataset.modal ?? null,
    focus: document.activeElement?.hasAttribute('data-film-open'),
    heroPaused: document.querySelector('[data-hero] video').paused,
    filmPaused: document.querySelector('[data-film-video]').paused,
  }));
  ok('film dialog closes on Escape, focus returns, hero resumes', !closed.open && !closed.modal && closed.focus && !closed.heroPaused && closed.filmPaused, JSON.stringify(closed));
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
  ok('switch screen changes', sw.checked === 'kids' && sw.active.includes('kids'), JSON.stringify(sw));
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
  await page.waitForTimeout(1500);
  const heroM = await page.evaluate(() => ({
    src: document.querySelector('[data-hero] video').currentSrc,
    poster: document.querySelector('[data-hero] img').currentSrc,
  }));
  ok('phones get the 4:5 cut and poster', /hero-m\.(webm|mp4)$/.test(heroM.src) && /hero-poster-m/.test(heroM.poster), JSON.stringify(heroM));
  await page.tap('[data-film-open]');
  await page.waitForTimeout(400);
  ok('phones get the 720p film', (await page.evaluate(() => document.querySelector('[data-film-video]').getAttribute('src'))) === '/media/film-720.mp4');
  await page.tap('[data-film-close]');
  await page.waitForTimeout(300);
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

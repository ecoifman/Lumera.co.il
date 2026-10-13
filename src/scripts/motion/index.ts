// Motion layer: smooth scrolling, the one page-load sequence, heading and media
// reveals, and the scroll-driven sections. Loaded only for motion-ready pages.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

const html = document.documentElement;

function fontsReady(timeout = 1200): Promise<void> {
  const ready = document.fonts?.ready ?? Promise.resolve();
  return Promise.race([ready.then(() => undefined), new Promise<void>((r) => setTimeout(r, timeout))]);
}

async function initSmoothScroll() {
  if (!window.matchMedia('(pointer: fine)').matches) return null;
  const { default: Lenis } = await import('lenis');
  const lenis = new Lenis({ lerp: 0.105, smoothWheel: true, wheelMultiplier: 0.95 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // The mobile menu and the film dialog hold the page still while they are open.
  const hold = (e: Event) => ((e as CustomEvent<boolean>).detail ? lenis.stop() : lenis.start());
  window.addEventListener('lumera:menu', hold);
  window.addEventListener('lumera:modal', hold);

  // In-page anchors glide to their target, below the fixed header.
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href*="#"]');
    if (!a || a.target === '_blank') return;
    const url = new URL(a.href);
    if (url.pathname !== window.location.pathname || !url.hash) return;
    const target = document.querySelector<HTMLElement>(decodeURIComponent(url.hash));
    if (!target) return;
    e.preventDefault();
    const header = document.querySelector<HTMLElement>('[data-header]');
    lenis.scrollTo(target, { offset: -((header?.offsetHeight ?? 0) + 8), duration: 1.4 });
    history.pushState(null, '', url.hash);
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
  return lenis;
}

/** The one orchestrated entrance: the hero comes up like a light on a dimmer. */
function heroIntro() {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;
  const title = hero.querySelector<HTMLElement>('[data-hero-title]');
  const after = hero.querySelectorAll<HTMLElement>('[data-hero-after]');
  const dim = hero.querySelector<HTMLElement>('[data-hero-dim]');
  const cue = hero.querySelector<HTMLElement>('[data-hero-cue]');

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  if (dim) tl.fromTo(dim, { opacity: 0.92 }, { opacity: 0, duration: 2.2, ease: 'power2.inOut' }, 0);

  if (title) {
    const split = SplitText.create(title, { type: 'lines', mask: 'lines', linesClass: 'line' });
    gsap.set(title, { visibility: 'visible' });
    tl.from(split.lines, { yPercent: 105, duration: 1.4, stagger: 0.12 }, 0.35);
  }
  if (after.length) {
    gsap.set(after, { visibility: 'visible' });
    tl.from(after, { opacity: 0, y: 18, duration: 1.1, stagger: 0.1 }, 0.95);
  }
  if (cue) tl.from(cue, { scaleY: 0, transformOrigin: '50% 0%', duration: 1.2, ease: 'power3.inOut' }, 1.3);

  // Scrolling away dims the hero again and lets the content rise over it.
  const media = hero.querySelector<HTMLElement>('[data-hero-media]');
  if (media) {
    gsap.to(media, {
      yPercent: 12,
      scale: 1.04,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });
  }
}

/** Display headings rise line by line from a mask when they enter. */
function revealLines() {
  document.querySelectorAll<HTMLElement>('[data-reveal="lines"]').forEach((el) => {
    const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'line' });
    gsap.set(el, { visibility: 'visible' });
    gsap.from(split.lines, {
      yPercent: 105,
      duration: 1.25,
      ease: 'expo.out',
      stagger: 0.09,
      scrollTrigger: { trigger: el, start: 'top 86%', once: true },
    });
  });
}

/** Key images open from the reading edge, like a light sweeping across a wall. */
function revealMedia() {
  document.querySelectorAll<HTMLElement>('[data-reveal="media"]').forEach((el) => {
    const img = el.querySelector('img, video');
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 82%', once: true } });
    tl.fromTo(el, { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' });
    if (img) tl.fromTo(img, { scale: 1.14 }, { scale: 1, duration: 1.9, ease: 'expo.out' }, 0.1);
  });
  document.querySelectorAll<HTMLElement>('[data-reveal="fade"]').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      translate: '0 0',
      duration: 1.1,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });
}

/** Gentle depth on large photographs; never on text. */
function parallax() {
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    const amount = Number(el.dataset.parallax || 8);
    gsap.fromTo(
      el,
      { yPercent: -amount },
      { yPercent: amount, ease: 'none', scrollTrigger: { trigger: el.parentElement ?? el, start: 'top bottom', end: 'bottom top', scrub: true } },
    );
  });
}

/** Process steps light up in order as the reader passes them. */
function stepLights() {
  document.querySelectorAll<HTMLElement>('[data-steps]').forEach((list) => {
    const items = list.querySelectorAll<HTMLElement>('[data-step]');
    items.forEach((item) => {
      ScrollTrigger.create({
        trigger: item,
        start: 'top 70%',
        onEnter: () => item.classList.add('is-lit'),
        onLeaveBack: () => item.classList.remove('is-lit'),
      });
    });
  });
}

export async function initMotion() {
  if (!html.classList.contains('motion-ready')) return;
  window.__lumeraMotion = true;
  await fontsReady();
  // The fallback timer may have fired while fonts loaded: then stay static.
  if (!html.classList.contains('motion-ready')) return;

  // The hero starts hidden (global.css), so its intro runs before anything that
  // waits on the network, such as the smooth-scroll module.
  heroIntro();
  await initSmoothScroll();
  revealLines();
  revealMedia();
  parallax();
  stepLights();

  if (document.querySelector('[data-xray]')) {
    const { initXray } = await import('./xray');
    initXray();
  }
  ScrollTrigger.refresh();
}

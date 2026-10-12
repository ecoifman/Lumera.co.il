// Entry point for every page.
// UI behaviour (menus, video controls, forms, demos) always runs.
// The motion layer (GSAP, ScrollTrigger, Lenis) loads only when the inline head
// script marked the page as motion-ready (not a crawler, no reduced-motion).
import { initUI } from './ui';

declare global {
  interface Window {
    __lumeraMotion?: boolean;
    dataLayer?: unknown[];
  }
}

initUI();

if (document.documentElement.classList.contains('motion-ready')) {
  import('./motion/index')
    .then((m) => m.initMotion())
    .catch(() => {
      // If the motion bundle cannot load, show everything in its final state.
      document.documentElement.classList.remove('motion-ready');
    });
}

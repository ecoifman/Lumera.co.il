// Scroll-scrubbed "behind the wall" sequence (see InfraXray.astro).
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

export function initXray() {
  document.querySelectorAll<HTMLElement>('[data-xray]').forEach((section) => {
    const pin = section.querySelector<HTMLElement>('[data-xray-pin]');
    const svg = section.querySelector<SVGSVGElement>('svg');
    const steps = Array.from(section.querySelectorAll<HTMLElement>('[data-xray-step]'));
    if (!pin || !svg) return;

    const q = (sel: string) => Array.from(svg.querySelectorAll<SVGElement>(sel));
    const trad = q('[data-xr-group="trad"]');
    const tradLines = q('[data-xr="trad-line"]');
    const tradLamps = q('[data-xr="trad-lamp"]');
    const chisel = q('[data-xr="chisel"]');
    const track = q('[data-xr="track"]');
    const feed = q('[data-xr="feed"]');
    const spots = q('[data-xr="spot"]');
    const cones = q('[data-xr="cone"]');
    const waves = q('[data-xr="wave"]');
    const glow = q('[data-xr="screen-glow"]');

    let current = -1;
    const setStep = (i: number) => {
      if (i === current) return;
      current = i;
      steps.forEach((s, n) => s.classList.toggle('is-active', n === i));
    };

    const mm = gsap.matchMedia();
    mm.add({ wide: '(min-width: 64.0625rem)', narrow: '(max-width: 64rem)' }, (ctx) => {
      const wide = Boolean(ctx.conditions?.wide);
      section.classList.add('is-animated');

      gsap.set(trad, { opacity: 1 });
      gsap.set(tradLamps, { opacity: 0 });
      gsap.set(tradLines, { drawSVG: '0%' });
      gsap.set(chisel, { opacity: 0, scaleY: 0, transformOrigin: '50% 100%' });
      gsap.set(track, { scaleX: 0, transformOrigin: '100% 50%' });
      gsap.set(feed, { drawSVG: '0%' });
      gsap.set(spots, { opacity: 0, y: -8 });
      gsap.set(cones, { opacity: 0 });
      gsap.set(waves, { opacity: 0, scale: 0.4, svgOrigin: '850 412' });
      gsap.set(glow, { opacity: 0 });
      setStep(0);

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: pin,
          start: 'top top',
          end: wide ? '+=260%' : '+=200%',
          scrub: 0.9,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => setStep(self.progress < 0.36 ? 0 : self.progress < 0.62 ? 1 : 2),
        },
      });

      tl.to(tradLamps, { opacity: 1, duration: 0.04, stagger: 0.01 })
        .to(tradLines, { drawSVG: '100%', duration: 0.22, stagger: 0.012 })
        .to(chisel, { opacity: 1, scaleY: 1, duration: 0.12 }, '<0.08')
        .to({}, { duration: 0.06 })
        .to(trad, { opacity: 0.18, duration: 0.1 })
        .to(track, { scaleX: 1, duration: 0.1, ease: 'power3.out' }, '<0.02')
        .to(feed, { drawSVG: '100%', duration: 0.16 }, '<')
        .to(spots, { opacity: 1, y: 0, duration: 0.08, stagger: 0.02, ease: 'power3.out' })
        .to(waves, { opacity: 1, scale: 1, duration: 0.1, stagger: 0.03, ease: 'power3.out' })
        .to(glow, { opacity: 0.55, duration: 0.05 }, '<')
        .to(cones, { opacity: 1, duration: 0.1, stagger: 0.025 })
        .to({}, { duration: 0.06 });

      return () => {
        section.classList.remove('is-animated');
        steps.forEach((s) => s.classList.remove('is-active'));
        current = -1;
      };
    });
  });
}

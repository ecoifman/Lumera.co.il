// Interface behaviour that must work with or without the motion layer.

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* -------------------------------------------------------------------------- */
/* Header: solutions panel, mobile menu, scroll states                         */
/* -------------------------------------------------------------------------- */
function initHeader() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;

  const panelRoot = header.querySelector<HTMLElement>('[data-panel-root]');
  const panelToggle = header.querySelector<HTMLButtonElement>('[data-panel-toggle]');
  const panel = header.querySelector<HTMLElement>('[data-panel]');
  const menuToggle = header.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = header.querySelector<HTMLElement>('[data-menu]');
  const menuLabel = header.querySelector<HTMLElement>('[data-menu-label]');

  let panelOpen = false;
  let menuOpen = false;
  let hoverTimer = 0;

  const setPanel = (open: boolean) => {
    if (!panel || !panelToggle) return;
    panelOpen = open;
    panelToggle.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
  };

  panelToggle?.addEventListener('click', () => setPanel(!panelOpen));

  if (panelRoot && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    panelRoot.addEventListener('pointerenter', () => {
      window.clearTimeout(hoverTimer);
      setPanel(true);
    });
    panelRoot.addEventListener('pointerleave', () => {
      hoverTimer = window.setTimeout(() => setPanel(false), 200);
    });
  }
  panelRoot?.addEventListener('focusout', (e) => {
    const next = (e as FocusEvent).relatedTarget as Node | null;
    if (!next || !panelRoot.contains(next)) setPanel(false);
  });
  document.addEventListener('click', (e) => {
    if (panelOpen && panelRoot && !panelRoot.contains(e.target as Node)) setPanel(false);
  });

  const outside = [document.querySelector('main'), document.querySelector('footer'), document.querySelector('[data-mobile-bar]')];
  const setMenu = (open: boolean) => {
    if (!menu || !menuToggle) return;
    menuOpen = open;
    menuToggle.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    header.classList.toggle('menu-open', open);
    header.classList.remove('is-hidden');
    document.documentElement.style.overflow = open ? 'hidden' : '';
    outside.forEach((el) => el && ((el as HTMLElement).inert = open));
    if (menuLabel) menuLabel.textContent = open ? 'סגירת התפריט' : 'פתיחת התפריט';
    window.dispatchEvent(new CustomEvent('lumera:menu', { detail: open }));
    if (open) menu.querySelector<HTMLElement>('a')?.focus();
  };
  menuToggle?.addEventListener('click', () => setMenu(!menuOpen));
  menu?.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) setMenu(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (panelOpen) {
      setPanel(false);
      panelToggle?.focus();
    }
    if (menuOpen) {
      setMenu(false);
      menuToggle?.focus();
    }
  });

  // Scroll states: solid background once past the hero, hide while reading down.
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const mobileBar = document.querySelector<HTMLElement>('[data-mobile-bar]');
  let lastY = window.scrollY;
  let ticking = false;

  const update = () => {
    ticking = false;
    const y = window.scrollY;
    const headerH = header.offsetHeight;
    const heroEnd = hero ? hero.offsetTop + hero.offsetHeight - headerH : 0;
    header.classList.toggle('is-solid', y > Math.max(heroEnd, 8));

    if (!menuOpen && !panelOpen) {
      if (y > lastY + 6 && y > 480) header.classList.add('is-hidden');
      else if (y < lastY - 6 || y < 120) header.classList.remove('is-hidden');
    }
    mobileBar?.classList.toggle('is-visible', y > window.innerHeight * 0.55);
    lastY = y;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  update();
}

/* -------------------------------------------------------------------------- */
/* Background videos: lazy sources, play only on screen, a real pause button   */
/* (WCAG 2.2.2: moving content longer than 5 seconds must be pausable).        */
/* -------------------------------------------------------------------------- */
function initVideos() {
  const blocks = document.querySelectorAll<HTMLElement>('[data-bg-video]');
  if (!blocks.length) return;

  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  const lowData = !!conn && (conn.saveData === true || /(^|-)2g$/.test(conn.effectiveType ?? ''));

  blocks.forEach((block) => {
    const video = block.querySelector<HTMLVideoElement>('video');
    const toggle = document.querySelector<HTMLButtonElement>(`[data-video-toggle="${block.id}"]`);
    if (!video) return;

    let userPaused = false;
    let loaded = false;

    const setButton = (playing: boolean) => {
      if (!toggle) return;
      toggle.setAttribute('aria-pressed', String(!playing));
      toggle.dataset.state = playing ? 'playing' : 'paused';
      const label = toggle.querySelector('[data-label]');
      if (label) label.textContent = playing ? 'עצירת הסרטון' : 'הפעלת הסרטון';
    };

    const load = () => {
      if (loaded) return;
      loaded = true;
      video.querySelectorAll<HTMLSourceElement>('source[data-src]').forEach((s) => {
        s.src = s.dataset.src!;
      });
      video.load();
    };

    const play = () => {
      load();
      const p = video.play();
      if (p) p.then(() => setButton(true)).catch(() => setButton(false));
      block.classList.add('is-playing');
    };
    const pause = () => {
      video.pause();
      setButton(false);
    };

    toggle?.addEventListener('click', () => {
      if (video.paused) {
        userPaused = false;
        play();
      } else {
        userPaused = true;
        pause();
      }
    });

    if (reduceMotion() || lowData) {
      setButton(false);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !userPaused) play();
        else if (!entry.isIntersecting && !video.paused) video.pause();
      },
      { threshold: 0.15 },
    );

    // Let the poster image win the LCP race before any video bytes are requested.
    const start = () => window.setTimeout(() => io.observe(block), 250);
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
  });
}

/* -------------------------------------------------------------------------- */
/* Switch themes demo: a radio group; the new screen spreads from the touch.   */
/* -------------------------------------------------------------------------- */
function initSwitchThemes() {
  document.querySelectorAll<HTMLElement>('[data-switch-themes]').forEach((demo) => {
    const radios = Array.from(demo.querySelectorAll<HTMLButtonElement>('[role="radio"][data-theme]'));
    const screens = Array.from(demo.querySelectorAll<HTMLElement>('[data-theme-screen]'));
    const stage = demo.querySelector<HTMLElement>('[data-theme-stage]');
    if (!radios.length || !screens.length || !stage) return;

    let z = 2;
    const select = (btn: HTMLButtonElement, origin?: { x: number; y: number }) => {
      const id = btn.dataset.theme;
      radios.forEach((r) => {
        const on = r === btn;
        r.setAttribute('aria-checked', String(on));
        r.tabIndex = on ? 0 : -1;
      });
      const next = screens.find((s) => s.dataset.themeScreen === id);
      if (!next || next.classList.contains('is-active')) return;
      const rect = stage.getBoundingClientRect();
      const x = origin ? ((origin.x - rect.left) / rect.width) * 100 : 50;
      const y = origin ? ((origin.y - rect.top) / rect.height) * 100 : 50;
      next.style.setProperty('--ox', `${x}%`);
      next.style.setProperty('--oy', `${y}%`);
      next.style.zIndex = String(++z);
      next.classList.remove('is-active');
      // force the closed state before opening so the transition runs every time
      void next.offsetWidth;
      screens.forEach((s) => s !== next && s.classList.remove('is-front'));
      next.classList.add('is-active', 'is-front');
      window.setTimeout(() => {
        screens.forEach((s) => s !== next && s.classList.remove('is-active'));
      }, 900);
      const live = demo.querySelector('[data-theme-live]');
      if (live) live.textContent = `העיצוב שנבחר: ${btn.textContent?.trim() ?? ''}`;
    };

    radios.forEach((btn, i) => {
      btn.addEventListener('click', (e) => {
        const pe = e as PointerEvent;
        const fromPointer = pe.clientX || pe.clientY;
        select(btn, fromPointer ? { x: pe.clientX, y: pe.clientY } : undefined);
      });
      btn.addEventListener('keydown', (e) => {
        // RTL: the left arrow moves forward in reading order
        const keys: Record<string, number> = { ArrowLeft: 1, ArrowDown: 1, ArrowRight: -1, ArrowUp: -1 };
        if (!(e.key in keys)) return;
        e.preventDefault();
        const next = radios[(i + keys[e.key] + radios.length) % radios.length];
        next.focus();
        select(next);
      });
    });
  });
}

/* -------------------------------------------------------------------------- */
/* Dimmer demo: brightness and colour temperature of a real room photo.        */
/* -------------------------------------------------------------------------- */
function initDimmers() {
  document.querySelectorAll<HTMLElement>('[data-dimmer]').forEach((dimmer) => {
    const level = dimmer.querySelector<HTMLInputElement>('[data-dimmer-level]');
    const kelvin = dimmer.querySelector<HTMLInputElement>('[data-dimmer-kelvin]');
    const levelOut = dimmer.querySelector<HTMLOutputElement>('[data-dimmer-level-out]');
    const kelvinOut = dimmer.querySelector<HTMLOutputElement>('[data-dimmer-kelvin-out]');
    if (!level || !kelvin) return;

    const apply = () => {
      const l = Number(level.value) / 100;
      const k = Number(kelvin.value);
      const warmth = 1 - (k - 2700) / (6500 - 2700);
      dimmer.style.setProperty('--level', String(l));
      dimmer.style.setProperty('--warmth', warmth.toFixed(3));
      level.style.setProperty('--fill', `${Math.round(l * 100)}%`);
      kelvin.style.setProperty('--fill', `${Math.round((1 - warmth) * 100)}%`);
      if (levelOut) levelOut.textContent = `${Math.round(l * 100)}%`;
      if (kelvinOut) kelvinOut.textContent = `${k}K`;
      level.setAttribute('aria-valuetext', `${Math.round(l * 100)} אחוז`);
      kelvin.setAttribute('aria-valuetext', `${k} קלווין, ${warmth > 0.5 ? 'אור חם' : 'אור קר'}`);
    };
    level.addEventListener('input', apply);
    kelvin.addEventListener('input', apply);
    apply();
  });
}

/* -------------------------------------------------------------------------- */
/* Contact form: composes a WhatsApp message. Nothing is stored on the site.    */
/* -------------------------------------------------------------------------- */
function initWhatsAppForms() {
  document.querySelectorAll<HTMLFormElement>('form[data-wa-form]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const get = (k: string) => String(data.get(k) ?? '').trim();
      const lines = [
        `היי, אני ${get('name')}.`,
        get('project') && `סוג הפרויקט: ${get('project')}`,
        get('city') && `מיקום: ${get('city')}`,
        get('message'),
        `(נשלח מעמוד: ${document.title})`,
      ].filter(Boolean);
      const number = form.dataset.waNumber ?? '';
      const url = `https://wa.me/${number}?text=${encodeURIComponent(lines.join('\n'))}`;
      track('whatsapp', 'form');
      const win = window.open(url, '_blank', 'noopener');
      if (!win) window.location.href = url;
      const done = form.querySelector<HTMLElement>('[data-wa-done]');
      if (done) done.hidden = false;
    });
  });
}

/* -------------------------------------------------------------------------- */
/* Conversion tracking hooks (pushed to dataLayer once analytics is added).     */
/* -------------------------------------------------------------------------- */
function track(channel: string, location: string) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: 'lead_click', channel, location });
}
function initTracking() {
  document.addEventListener('click', (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-track]');
    if (!el) return;
    const [channel, ...rest] = (el.dataset.track ?? '').split('-');
    track(channel, rest.join('-') || 'page');
  });
}

/* -------------------------------------------------------------------------- */
/* FAQ: a single open item at a time keeps the list short to scan.              */
/* -------------------------------------------------------------------------- */
function initFaq() {
  document.querySelectorAll<HTMLElement>('[data-faq]').forEach((faq) => {
    const items = Array.from(faq.querySelectorAll<HTMLDetailsElement>('details'));
    items.forEach((d) =>
      d.addEventListener('toggle', () => {
        if (d.open) items.forEach((o) => o !== d && (o.open = false));
      }),
    );
  });
}

export function initUI() {
  initHeader();
  initVideos();
  initSwitchThemes();
  initDimmers();
  initWhatsAppForms();
  initTracking();
  initFaq();
}

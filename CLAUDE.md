# Lumera website (lumera-hs.co.il)

Marketing site for Lumera (לומרה סמארט בע״מ), a smart-home company in Haifa:
wireless control, magnetic lighting, hidden audio, security and climate, "בלי חציבות".
Static Astro 7 build, Hebrew, right-to-left. Hosted on uPress; replaces a WordPress
install that was compromised in October 2026.

The strategy (keyword map, page briefs, design and motion concept) lives in the
Claude doc "לומרה בית חכם — אסטרטגיית האתר החדש". Read it before changing page targets.

## Commands

- `npm run dev` – local dev server (http://localhost:4321)
- `npm run build` – static build into `dist/`
- `npm run preview` – serve `dist/`
- `node scripts/shots.mjs http://127.0.0.1:4321/ ./.shots` – desktop + mobile screenshots
  (`PAGES=/,/lighting/` to choose pages, `--motion` to capture with animations)
- `npm run media:film` (`python3 scripts/build-film-media.py [stills] [ambient] [film]`) – rebuild
  everything cut from the explainer film: the hero loop, the full film, posters and section stills
- `bash scripts/process-media.sh <name> <video> [start] [duration] [posterSecond]` – encode any
  other background video (MP4 + WebM, 1080 and 720) and extract its poster
- `node scripts/smoke.mjs http://127.0.0.1:4321/` – interactive checks (hero film, film dialog,
  menus, demos); `node scripts/audit.mjs http://127.0.0.1:4321/` – axe, headings, links, JSON-LD

Node 22.12+ is required (Astro 7).

## Structure

- `src/pages/` – one file per URL (`build.format: 'directory'`, trailing slashes everywhere)
- `src/layouts/Base.astro` – html shell, head, header, footer, mobile contact bar, scripts
- `src/layouts/DomainPage.astro` – solution and professional pages (hero, features, FAQ, CTA)
- `src/layouts/TextPage.astro` – accessibility and privacy pages
- `src/components/Seo.astro` – title, description, canonical, Open Graph, JSON-LD @graph
- `src/data/site.ts` – business details, phone, WhatsApp, navigation. Single source of truth.
- `src/data/media.ts` – which image each section uses (all are frames from the explainer film)
- `src/data/film.ts` – the explainer film: title, files, transcript, hero loop (`film.json` is
  written by the media script: loop length and the per-shot reframing track)
- `src/components/HeroFilm.astro` – home hero: the film's muted loop edge to edge, text over it
- `src/components/FilmDialog.astro` – the full film with sound and transcript, in a `<dialog>`
- `src/components/SolutionIndex.astro` – the six solution areas under the hero (`/#solutions`)
- `src/data/schema.ts` – FAQPage, Service, VideoObject builders
- `src/scripts/ui.ts` – menus, header states, video pause buttons, switch demo, dimmer, WhatsApp form
- `src/scripts/motion/` – GSAP + ScrollTrigger + SplitText + Lenis; loaded only when motion is allowed
- `src/pages/sitemap.xml.ts` – `/sitemap.xml` built from the page files

## Design rules

- Two materials: plaster `#e6e6e1` (light surfaces) and glass `#1b1f21` (dark surfaces).
- The only colour is light: `--lumen #ffb36b` is for emitted light only (glows, the light line,
  active states). Never use it as a flat decorative accent or for text on plaster.
- Type: Bellefair for display headings, IBM Plex Sans Hebrew for text and UI. Self-hosted in
  `public/fonts` (OFL). No letter-spacing on Hebrew.
- Buttons are `.key` (pill), secondary links are `.link-line`. No arrows in button labels.
- Use logical properties (`inline-start`/`inline-end`) – the site is RTL.

## Motion rules

- One orchestrated moment per page (home: hero dimmer intro; "behind the wall" scroll sequence).
  Everything else is quiet. No fade-up on every block.
- All content is in the HTML and readable without JS. Hidden start states apply only under
  `html.motion-ready`, which the inline head script sets for non-crawlers without reduced motion,
  with a 3.5 s fallback.
- `prefers-reduced-motion` gets the final states: no Lenis, no scrub, no intro.
- Every background video has a pause button (WCAG 2.2.2) and loads only after the poster.
- Budget: ~60 KB gzipped JS total today; keep under 90 KB.

## SEO rules

- The home page ranks #1 for "בית חכם ללא חציבות" and "לומרה בית חכם". Keep its URL (`/`), its
  title ("בית חכם אלחוטי בלי חציבות | מתגים, תאורה ושמע – לומרה") and that topic.
- One H1 per page, matching the brief. Each solution page targets one cluster (see the strategy doc).
- Israeli trade terms matter: "פס צבירה מגנטי" (not only "פסים מגנטיים"), "מפסק" next to "מתג".
- FAQ text on the page and in FAQPage JSON-LD must be identical (Faq component + faqSchema).

## Content rules

- Hebrew, plain and specific. Do not invent technical specs, prices, certifications, clients or
  service areas. Facts come from the old site, the catalogs in Dropbox, or Eyal.
- Open questions (confirm before stating on the site):
  - control protocol (old site says RF; Dropbox has Zigbee material)
  - switch power / neutral-wire requirements ("מתג ללא קו אפס")
  - Shabbat mode support
  - public e-mail (info@lumera.co.il is not Lumera's domain), Instagram URL
  - service area (whole country or north), street address for Google Business Profile
  - permission to name the Gasham pilot; real installation photos
  - accessibility coordinator name; lawyer review of the privacy policy

## Media

- Originals from Dropbox (`/Lumera/Website/Videos and Pictures`) go in `media-src/` (git-ignored).
  The explainer film master is `media-src/explainer-master.mp4` (1920x1080, 25 fps, 70.9 s).
- The master has Hebrew captions burned in at the bottom (rows ~835–895). Every asset cut from
  it uses rows 0–800 only, so the site's own text never collides with the captions. The shot
  list, framing and still times live in `scripts/film_plan.py`.
- Hero loop: `hero-d` (1920x800, 2.4:1) for wide screens, reframed per shot by `--x`
  (object-position) from the track in `film.json`; `hero-m` (720x900, 4:5) for portrait screens
  (`max-aspect-ratio: 3/4`), with the text below the video. Both are muted and captionless; the
  full film (`film-1080` / `film-720`, with sound and its open captions) opens from "צפו בסרטון".
- Images used on the site go in `src/assets/img/`; Astro generates AVIF/WebP at build time.
- Encoded videos go in `public/media/`.

## Deployment (uPress)

1. `npm run build`
2. Upload the contents of `dist/` to the site root on uPress.
3. Never delete `/tool/` on the server – it is the electrical-plan analyzer, kept as is.
4. After launch: submit `https://lumera-hs.co.il/sitemap.xml` in Google Search Console and Bing
   Webmaster Tools, and request indexing of `/`.

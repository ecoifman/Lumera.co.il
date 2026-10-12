// Image and video choices for the site, in one place.
// Images live in src/assets/img and are optimised at build time (AVIF/WebP).
// Videos are pre-encoded by scripts/process-media.sh into public/media.
import type { ImageMetadata } from 'astro';

import heroPoster from '../assets/img/placeholder/hero.jpg';
import switchA from '../assets/img/placeholder/switch-a.jpg';
import switchB from '../assets/img/placeholder/switch-b.jpg';
import switchC from '../assets/img/placeholder/switch-c.jpg';
import room from '../assets/img/placeholder/room.jpg';
import audio from '../assets/img/placeholder/audio.jpg';
import security from '../assets/img/placeholder/security.jpg';
import climate from '../assets/img/placeholder/climate.jpg';

interface VideoSet {
  mp4: string;
  webm?: string;
  mp4Small?: string;
  webmSmall?: string;
}

export const MEDIA = {
  heroPoster: heroPoster as ImageMetadata,
  heroVideo: undefined as VideoSet | undefined,
  heroPreload: [] as { href: string; as: 'image'; fetchpriority?: 'high' }[],
  switchScreens: [
    { id: 'lights', label: 'תאורה', image: switchA, alt: 'מתג L10 עם מסך מגע ותפריט תאורה בעברית' },
    { id: 'shutters', label: 'תריסים', image: switchB, alt: 'מתג L10 במצב שליטה בתריסים' },
    { id: 'boiler', label: 'דוד', image: switchC, alt: 'מתג L10 במצב שליטה בדוד החשמלי' },
  ],
  room: { image: room, alt: 'סלון מואר בתאורה מגנטית שקועה בתקרה' },
  pages: {
    switches: switchA as ImageMetadata,
    lighting: room as ImageMetadata,
    audio: audio as ImageMetadata,
    security: security as ImageMetadata,
    climate: climate as ImageMetadata,
    infrastructure: heroPoster as ImageMetadata,
    professionals: heroPoster as ImageMetadata,
    about: heroPoster as ImageMetadata,
    contact: heroPoster as ImageMetadata,
  },
  domains: {
    audio: { image: audio, alt: 'רמקולים שקועים בתקרת גבס בסלון' },
    security: { image: security, alt: 'מצלמת אבטחה חכמה בכניסה לבית' },
    climate: { image: climate, alt: 'תריסים חשמליים וסלון מוצל בשעות הצהריים' },
  },
};

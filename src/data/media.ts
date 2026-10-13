// Image choices for the site, in one place.
// Every image is a frame from Lumera's explainer film, cut above the burned-in
// captions by scripts/build-film-media.py (the shot list is in scripts/film_plan.py).
// Images live in src/assets/img and are optimised at build time (AVIF/WebP).
// The home hero and the film itself are described in src/data/film.ts.
import type { ImageMetadata } from 'astro';

import switchLiving from '../assets/img/film/switch-living.jpg';
import switchKids from '../assets/img/film/switch-kids.jpg';
import switchBedroom from '../assets/img/film/switch-bedroom.jpg';
import switchKitchen from '../assets/img/film/switch-kitchen.jpg';
import roomScenes from '../assets/img/film/room-scenes.jpg';
import rowAudio from '../assets/img/film/row-audio.jpg';
import rowSecurity from '../assets/img/film/row-security.jpg';
import rowClimate from '../assets/img/film/row-climate.jpg';
import pageSwitches from '../assets/img/film/page-switches.jpg';
import pageLighting from '../assets/img/film/page-lighting.jpg';
import pageAudio from '../assets/img/film/page-audio.jpg';
import pageSecurity from '../assets/img/film/page-security.jpg';
import pageClimate from '../assets/img/film/page-climate.jpg';
import pageInfrastructure from '../assets/img/film/page-infrastructure.jpg';
import pageProfessionals from '../assets/img/film/page-professionals.jpg';
import pageArchitects from '../assets/img/film/page-architects.jpg';
import pageDevelopers from '../assets/img/film/page-developers.jpg';
import pageElectricians from '../assets/img/film/page-electricians.jpg';

export const MEDIA = {
  /** The wall screen in four rooms, each with its own design theme (SwitchShowcase). */
  switchScreens: [
    { id: 'living', label: 'סלון', image: switchLiving, alt: 'מסך המגע של לומרה על קיר הסלון, בערכת עיצוב זהובה, ליד יציאה לגינה' },
    { id: 'kids', label: 'חדר ילדים', image: switchKids, alt: 'מסך המגע בחדר ילדים, בערכת עיצוב צבעונית עם קשת, ענן וכפתורים גדולים' },
    { id: 'bedroom', label: 'חדר שינה', image: switchBedroom, alt: 'מסך המגע בחדר שינה מואר באור יום, בערכת עיצוב זהובה' },
    { id: 'kitchen', label: 'מטבח', image: switchKitchen, alt: 'מסך המגע ליד המטבח, בערכת עיצוב בגווני ירוק עם עיטור עלים' },
  ],
  /** Scene screen and pendant lights over the dining table (LightingDimmer). */
  room: {
    image: roomScenes,
    alt: 'מסך תרחישים על הקיר, עם הכפתורים בוקר טוב, מצב רומנטי ולילה טוב, ומנורות תלויות דולקות מעל פינת האוכל',
  },
  domains: {
    audio: { image: rowAudio, alt: 'זוג בסלון באור ערב חם, מנורות נייר תלויות ווילונות פשתן' },
    security: { image: rowSecurity, alt: 'מנעול חכם עם מצלמה ולחצן מואר על משקוף דלת הכניסה' },
    climate: { image: rowClimate, alt: 'חדר שינה בבוקר: התריס עולה ואור היום נכנס מהגינה' },
  },
  /** Page heroes (decorative behind the page title). */
  pages: {
    switches: pageSwitches as ImageMetadata,
    lighting: pageLighting as ImageMetadata,
    audio: pageAudio as ImageMetadata,
    security: pageSecurity as ImageMetadata,
    climate: pageClimate as ImageMetadata,
    infrastructure: pageInfrastructure as ImageMetadata,
    professionals: pageProfessionals as ImageMetadata,
    architects: pageArchitects as ImageMetadata,
    developers: pageDevelopers as ImageMetadata,
    electricians: pageElectricians as ImageMetadata,
  },
};

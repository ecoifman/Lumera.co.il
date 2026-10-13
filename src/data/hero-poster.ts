// Art-directed poster for the home hero: a 4:5 crop on portrait screens and the
// 2.4:1 film frame elsewhere. Used by the hero <picture> and by the page's preload
// links, so both always point at the same generated files.
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import posterWide from '../assets/img/film/hero-poster-d.jpg';
import posterStacked from '../assets/img/film/hero-poster-m.jpg';

/** Portrait screens get the stacked hero (video above, text below). */
export const STACKED_QUERY = '(max-aspect-ratio: 3/4)';
export const WIDE_QUERY = '(min-aspect-ratio: 751/1000)';

async function srcset(src: ImageMetadata, widths: number[], format: 'avif' | 'webp') {
  const images = await Promise.all(widths.map((width) => getImage({ src, width, format })));
  return images.map((img, i) => `${img.src} ${widths[i]}w`).join(', ');
}

export async function heroPoster() {
  const [wideAvif, wideWebp, stackedAvif, stackedWebp, fallback] = await Promise.all([
    srcset(posterWide, [960, 1440, 1920], 'avif'),
    srcset(posterWide, [960, 1440, 1920], 'webp'),
    srcset(posterStacked, [480, 720], 'avif'),
    srcset(posterStacked, [480, 720], 'webp'),
    getImage({ src: posterWide, width: 1440, format: 'jpg' }),
  ]);
  return {
    wideAvif,
    wideWebp,
    stackedAvif,
    stackedWebp,
    fallback: fallback.src,
    width: posterWide.width,
    height: posterWide.height,
  };
}

/** <link rel="preload"> entries for the poster that will actually be shown. */
export async function heroPosterPreloads() {
  const p = await heroPoster();
  const first = (set: string) => set.split(' ')[0];
  return [
    {
      href: first(p.stackedAvif),
      as: 'image' as const,
      type: 'image/avif',
      imagesrcset: p.stackedAvif,
      imagesizes: '100vw',
      media: STACKED_QUERY,
      fetchpriority: 'high' as const,
    },
    {
      href: first(p.wideAvif),
      as: 'image' as const,
      type: 'image/avif',
      imagesrcset: p.wideAvif,
      imagesizes: '100vw',
      media: WIDE_QUERY,
      fetchpriority: 'high' as const,
    },
  ];
}

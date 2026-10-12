// /sitemap.xml generated from the built pages (excluding 404 and noindex pages).
// It replaces the fake sitemap that the compromised WordPress install was serving.
import type { APIRoute } from 'astro';

const pages = import.meta.glob('./**/*.astro', { eager: true });

const EXCLUDE = new Set(['/404/']);

export const GET: APIRoute = ({ site }) => {
  const base = site!.href.replace(/\/$/, '');
  const today = new Date().toISOString().slice(0, 10);
  const paths = Object.keys(pages)
    .map((file) => file.replace(/^\.\//, '/').replace(/\.astro$/, '').replace(/\/index$/, '/').replace(/^\/index$/, '/'))
    .map((p) => (p.endsWith('/') ? p : `${p}/`))
    .filter((p) => !EXCLUDE.has(p) && !p.includes('['))
    .sort((a, b) => (a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b)));

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    paths.map((p) => `  <url><loc>${base}${p}</loc><lastmod>${today}</lastmod></url>`).join('\n') +
    `\n</urlset>\n`;

  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};

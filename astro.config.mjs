// @ts-check
import { defineConfig } from 'astro/config';

// Static build for uPress hosting. Every page is emitted as /<slug>/index.html
// so URLs are served with a trailing slash, matching the canonical tags.
export default defineConfig({
  site: 'https://lumera-hs.co.il',
  trailingSlash: 'always',
  compressHTML: true,
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
    assets: '_assets',
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
});

// JSON-LD builders for page-specific nodes. The business node (#business) is
// emitted by Seo.astro on every page; these reference it by @id.
import { SITE } from './site';
import type { FaqItem } from '../components/Faq.astro';

const businessRef = { '@id': `${SITE.url}/#business` };

export function faqSchema(items: FaqItem[], path: string) {
  return {
    '@type': 'FAQPage',
    '@id': `${new URL(path, SITE.url).href}#faq`,
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

export function serviceSchema(opts: { name: string; description: string; path: string; serviceType: string }) {
  return {
    '@type': 'Service',
    '@id': `${new URL(opts.path, SITE.url).href}#service`,
    name: opts.name,
    serviceType: opts.serviceType,
    description: opts.description,
    provider: businessRef,
    // TODO: confirm the service area (whole country or the north).
    areaServed: { '@type': 'Country', name: 'ישראל' },
    url: new URL(opts.path, SITE.url).href,
  };
}

export function videoSchema(opts: {
  /** Path plus fragment for the node's @id, e.g. '/#film'. */
  id?: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  contentUrl?: string;
  embedUrl?: string;
  uploadDate: string;
  duration?: string;
  transcript?: string;
}) {
  return {
    '@type': 'VideoObject',
    ...(opts.id ? { '@id': new URL(opts.id, SITE.url).href } : {}),
    name: opts.name,
    description: opts.description,
    thumbnailUrl: new URL(opts.thumbnailUrl, SITE.url).href,
    uploadDate: opts.uploadDate,
    inLanguage: 'he',
    ...(opts.duration ? { duration: opts.duration } : {}),
    ...(opts.contentUrl ? { contentUrl: new URL(opts.contentUrl, SITE.url).href } : {}),
    ...(opts.embedUrl ? { embedUrl: opts.embedUrl } : {}),
    ...(opts.transcript ? { transcript: opts.transcript } : {}),
    publisher: businessRef,
  };
}

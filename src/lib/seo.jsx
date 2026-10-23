import { useEffect } from 'react';

export const SITE = 'https://toolnest-sage.vercel.app';
export const OG_IMAGE = SITE + '/og-image.png';

/* ------------------------------------------------------------------ */
/* Build-time prerender support: during SSR (scripts/prerender.mjs)   */
/* the hooks below also register their data into a collector, which   */
/* the prerender script writes into the static HTML head. On the      */
/* client the collector is null and this is a no-op.                  */
/* ------------------------------------------------------------------ */
let headCollector = null;

export function __startHeadCollection() {
  headCollector = { seo: null, jsonLd: [] };
}

export function __takeHeadCollection() {
  const collected = headCollector;
  headCollector = null;
  return collected;
}

function collectSeo(entry) {
  if (headCollector) headCollector.seo = entry;
}

function collectJsonLd(id, data) {
  if (headCollector && data) headCollector.jsonLd.push({ id, data });
}

/* per-page SEO: document title, meta description, canonical, OG tags */
export function useSeo({ title, description, path, robots }) {
  collectSeo({ title, description, path, robots });
  useEffect(() => {
    document.title = title;
    const setMeta = (sel, kind, a, b) => {
      let el = document.head.querySelector(sel);
      if (!el) {
        el = document.createElement(kind);
        document.head.appendChild(el);
      }
      if (kind === 'link') { el.setAttribute('rel', 'canonical'); el.setAttribute('href', b); }
      else if (a === 'property') { el.setAttribute('property', b[0]); el.setAttribute('content', b[1]); }
      else { el.setAttribute('name', a); el.setAttribute('content', b); }
    };
    setMeta('meta[name="description"]', 'meta', 'description', description);
    setMeta('link[rel="canonical"]', 'link', 'rel', SITE + path);
    setMeta('meta[property="og:title"]', 'meta', 'property', ['og:title', title]);
    setMeta('meta[property="og:description"]', 'meta', 'property', ['og:description', description]);
    setMeta('meta[property="og:url"]', 'meta', 'property', ['og:url', SITE + path]);
    setMeta('meta[property="og:type"]', 'meta', 'property', ['og:type', 'website']);
    setMeta('meta[property="og:image"]', 'meta', 'property', ['og:image', OG_IMAGE]);
    setMeta('meta[name="twitter:card"]', 'meta', 'twitter:card', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'meta', 'twitter:title', title);
    setMeta('meta[name="twitter:description"]', 'meta', 'twitter:description', description);
    setMeta('meta[name="twitter:image"]', 'meta', 'twitter:image', OG_IMAGE);
    if (robots) setMeta('meta[name="robots"]', 'meta', 'robots', robots);
  }, [title, description, path, robots]);
}

/* inject a JSON-LD block for the lifetime of the component */
export function useJsonLd(id, data) {
  collectJsonLd(id, data);
  useEffect(() => {
    if (!data) return undefined;
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('script');
      el.type = 'application/ld+json';
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
    return () => { el.remove(); };
  }, [id, data]);
}

export function faqJsonLd(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function breadcrumbJsonLd(name, path) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name, item: SITE + path },
    ],
  };
}

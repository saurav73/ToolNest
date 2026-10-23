import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSeo, useJsonLd, faqJsonLd, breadcrumbJsonLd, SITE } from '../lib/seo.jsx';
import { relatedTools, TOOLS } from '../data/tools.js';
import ToolIcon, { tileClass } from './ToolIcon.jsx';
import FeedbackForm from './FeedbackForm.jsx';

/**
 * Shared shell for every tool page:
 * breadcrumb, title, intro, the tool itself, written content,
 * FAQ section (with FAQPage JSON-LD) and related tool cards.
 */
export default function ToolLayout({
  slug,
  path,
  title,
  description,
  h1,
  intro,
  faqs = [],
  children,
  content,
}) {
  // Record this visit for the homepage "Recently used" row. This is the
  // single shared shell for every tool page, so recording here covers all
  // tools. It runs only in an effect, after mount, so prerendering and
  // SSR never touch localStorage. Key matches Home.jsx: toolnest-recent-tools.
  useEffect(() => {
    if (!slug) return;
    try {
      const raw = window.localStorage.getItem('toolnest-recent-tools');
      let prev = [];
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) prev = parsed.filter((s) => typeof s === 'string');
      }
      const next = [slug, ...prev.filter((s) => s !== slug)].slice(0, 8);
      window.localStorage.setItem('toolnest-recent-tools', JSON.stringify(next));
    } catch (e) { /* private mode or blocked storage */ }
  }, [slug]);

  useSeo({ title, description, path });
  useJsonLd(`faq-${slug}`, faqs.length ? faqJsonLd(faqs) : null);
  useJsonLd(`crumb-${slug}`, breadcrumbJsonLd(h1, path));
  useJsonLd(`app-${slug}`, {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: h1,
    url: SITE + path,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  });
  const related = relatedTools(slug, 3);
  const self = TOOLS.find((t) => t.slug === slug);

  return (
    <main className="container page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link><span aria-hidden="true">›</span><span>{h1}</span>
      </nav>

      <div className="tool-head">
        <span className={`tool-tile tool-tile-lg ${tileClass(self && self.category)}`}><ToolIcon slug={slug} /></span>
        <div className="tool-head-text">
          <h1>{h1}</h1>
          <p className="lede">{intro}</p>
        </div>
      </div>

      <section className="tool-box" aria-label={h1}>
        {children}
      </section>

      {content && <article className="content">{content}</article>}

      {faqs.length > 0 && (
        <section className="faq" aria-label="Frequently asked questions">
          <h2>Frequently asked questions</h2>
          {faqs.map((f) => (
            <details key={f.q} className="faq-item">
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>
      )}

      <FeedbackForm toolName={(self && self.name) || h1} />

      <section className="related" aria-label="Related tools">
        <h2>Related tools</h2>
        <div className="card-grid small">
          {related.map((t) => (
            <Link key={t.slug} to={t.path} className="tool-card">
              <span className={`tool-tile ${tileClass(t.category)}`}><ToolIcon slug={t.slug} /></span>
              <h3>{t.name}</h3>
              <p>{t.blurb}</p>
              <span className="go">Open tool</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

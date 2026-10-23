import React from 'react';
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

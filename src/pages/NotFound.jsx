import React from 'react';
import { Link } from 'react-router-dom';
import { useSeo } from '../lib/seo.jsx';
import { TOOLS } from '../data/tools.js';
import ToolIcon, { tileClass } from '../components/ToolIcon.jsx';

export default function NotFound() {
  useSeo({
    title: 'Page Not Found | ToolNest',
    description: 'That page does not exist on ToolNest. Browse the full list of free online tools instead.',
    path: '/404',
    robots: 'noindex, follow',
  });
  return (
    <main className="container page">
      <h1>Page not found</h1>
      <p className="lede">
        The page you are looking for does not exist or has moved. Here are all of
        our free tools instead.
      </p>
      <div className="card-grid">
        {TOOLS.map((t) => (
          <Link key={t.slug} to={t.path} className="tool-card">
            <span className={`tool-tile ${tileClass(t.category)}`}><ToolIcon slug={t.slug} /></span>
            <h3>{t.name}</h3>
            <p>{t.blurb}</p>
            <span className="go">Open tool</span>
          </Link>
        ))}
      </div>
    </main>
  );
}

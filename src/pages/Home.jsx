import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSeo, useJsonLd, faqJsonLd, SITE } from '../lib/seo.jsx';
import { TOOLS, CATEGORIES, categoryId } from '../data/tools.js';
import ToolIcon, { tileClass } from '../components/ToolIcon.jsx';

const HOME_FAQS = [
  {
    q: 'Are ToolNest tools really free?',
    a: 'Yes. Every tool on ToolNest is free to use with no sign-up, no account and no usage limits. Open a tool, paste or type your content, and get your result instantly.',
  },
  {
    q: 'Is my text private when I use these tools?',
    a: 'Yes. All ToolNest tools run entirely in your web browser. Your text, passwords and files are never uploaded to a server, never stored and never shared. You can even disconnect from the internet after the page loads and the tools will still work.',
  },
  {
    q: 'Do I need to install anything?',
    a: 'No. ToolNest works in any modern browser on Windows, macOS, Linux, Android and iOS. There is nothing to download or install.',
  },
  {
    q: 'Which tool should I start with?',
    a: 'The Word Counter is our most popular tool. Writers and students use it to check word counts, reading time and keyword density. Developers usually start with the JSON Formatter, and anyone setting up accounts can use the Password Generator.',
  },
];

export default function Home() {
  useSeo({
    title: 'ToolNest: Free Online Tools for Text, Passwords and More',
    description: 'Free online tools for writers, students and developers: word counter, password generator, QR codes, JSON formatter and more. No sign-up.',
    path: '/',
  });
  useJsonLd('home-faq', faqJsonLd(HOME_FAQS));

  const [query, setQuery] = useState('');
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) el.scrollIntoView({ block: 'start' });
    }
  }, [location.hash]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TOOLS;
    return TOOLS.filter(
      (t) => t.name.toLowerCase().includes(q) || t.blurb.toLowerCase().includes(q) || t.keywords.includes(q),
    );
  }, [query]);

  return (
    <main className="container page">
      <section className="hero">
        <h1>Free online tools that <span className="accent">just work</span></h1>
        <p className="lede">
          ToolNest is a small collection of fast, free tools for writers, students and
          developers. No sign-up, no uploads, no waiting. Everything runs in your
          browser, so your text stays on your device.
        </p>
        <div className="search-box">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools, try &quot;word&quot; or &quot;json&quot;"
            aria-label="Search tools"
          />
        </div>
      </section>

      {CATEGORIES.map((cat) => {
        const items = filtered.filter((t) => t.category === cat);
        if (!items.length) return null;
        return (
          <section className="category-block" key={cat} id={categoryId(cat)} aria-label={cat}>
            <h2>{cat}</h2>
            <div className="card-grid">
              {items.map((t) => (
                <Link key={t.slug} to={t.path} className="tool-card">
                  <span className={`tool-tile ${tileClass(t.category)}`}><ToolIcon slug={t.slug} /></span>
                  <h3>{t.name}</h3>
                  <p>{t.blurb}</p>
                  <span className="go">Open tool</span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
      {filtered.length === 0 && (
        <p className="no-results">No tools match &quot;{query}&quot;. Try a different word, or browse the full list above.</p>
      )}

      <article className="content">
        <h2>Why people use ToolNest</h2>
        <p>
          Most online tools make you wait for uploads, create an account, or paste your
          writing into a server you know nothing about. ToolNest takes the opposite
          approach. Every tool is built with plain web technology that runs locally in
          your browser tab. Results appear as you type, your work is never sent
          anywhere, and there is nothing to install.
        </p>
        <p>
          The collection focuses on the jobs people repeat every day. Students and
          writers check essay lengths, reading time and keyword density. Marketers trim
          posts to fit character limits on X, Instagram and LinkedIn. Developers format
          JSON, encode Base64 and generate clean URL slugs. Small jobs, done in
          seconds, as often as you need them.
        </p>
        <h2>Built to respect your privacy</h2>
        <p>
          Because nothing leaves your device, ToolNest is safe for drafts, unpublished
          manuscripts, internal documents and freshly generated passwords. When you
          close the tab, everything is gone. Read more in our{' '}
          <Link to="/privacy">Privacy Policy</Link> and on the{' '}
          <Link to="/about">About page</Link>.
        </p>
      </article>

      <section className="faq" aria-label="Frequently asked questions">
        <h2>Frequently asked questions</h2>
        {HOME_FAQS.map((f) => (
          <details key={f.q} className="faq-item">
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </section>
    </main>
  );
}

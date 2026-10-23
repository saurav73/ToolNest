import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSeo, useJsonLd, faqJsonLd, SITE } from '../lib/seo.jsx';
import { TOOLS, CATEGORIES, categoryId } from '../data/tools.js';
import ToolIcon, { tileClass } from '../components/ToolIcon.jsx';

const FAVOURITES_KEY = 'toolnest-favourites';
const RECENTS_KEY = 'toolnest-recent-tools';

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

function StarIcon({ filled }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="21"
      height="21"
      aria-hidden="true"
      focusable="false"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinejoin="round"
    >
      <path d="M12 2.9 L14.9 8.8 L21.4 9.7 L16.7 14.3 L17.8 20.8 L12 17.7 L6.2 20.8 L7.3 14.3 L2.6 9.7 L9.1 8.8 Z" />
    </svg>
  );
}

/**
 * One tool, one representation everywhere on the homepage: icon tile,
 * name, a short description and a category tag, wrapped in a real link.
 * The favourite star is a sibling button over the card, never nested
 * inside the link, so it cannot trigger navigation and stays fully
 * keyboard accessible on its own.
 */
function ToolCard({ tool, isFavourite, onToggleFavourite }) {
  return (
    <div className="tool-card-wrap">
      <Link to={tool.path} className="tool-card">
        <span className={`tool-tile ${tileClass(tool.category)}`}><ToolIcon slug={tool.slug} /></span>
        <h3>{tool.name}</h3>
        <span className="tool-cat-tag">{tool.category}</span>
        <p>{tool.blurb}</p>
        <span className="go">Open tool</span>
      </Link>
      <button
        type="button"
        className={`fav-btn${isFavourite ? ' active' : ''}`}
        aria-pressed={isFavourite}
        aria-label={isFavourite ? `Remove ${tool.name} from favourites` : `Add ${tool.name} to favourites`}
        title={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
        onClick={() => onToggleFavourite(tool.slug)}
      >
        <StarIcon filled={isFavourite} />
      </button>
    </div>
  );
}

function readSlugList(key) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((s) => typeof s === 'string');
  } catch (e) {
    return [];
  }
}

export default function Home() {
  useSeo({
    title: 'ToolNest: Free Online Tools for Text, Passwords and More',
    description: 'Free online tools for writers, students and developers: word counter, password generator, QR codes, JSON formatter and more. No sign-up.',
    path: '/',
  });
  useJsonLd('home-faq', faqJsonLd(HOME_FAQS));

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  // Favourites and recents live only in localStorage. They start empty so
  // the prerendered HTML and the first client render match exactly, and
  // they are filled in after mount, so neither row ever appears in the
  // prerendered page.
  const [mounted, setMounted] = useState(false);
  const [favourites, setFavourites] = useState([]);
  const [recents, setRecents] = useState([]);
  const location = useLocation();

  useEffect(() => {
    setMounted(true);
    setFavourites(readSlugList(FAVOURITES_KEY));
    setRecents(readSlugList(RECENTS_KEY));
  }, []);

  useEffect(() => {
    if (!location.hash) return undefined;
    const id = location.hash.slice(1);
    // Header category links point at the category sections below. If a
    // chip filter is hiding that section, reset it so the target exists.
    if (CATEGORIES.some((cat) => categoryId(cat) === id)) setActiveCategory('All');
    const scroll = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ block: 'start' });
    };
    scroll();
    const timer = setTimeout(scroll, 60);
    return () => clearTimeout(timer);
  }, [location.hash]);

  const toggleFavourite = (slug) => {
    const next = favourites.includes(slug)
      ? favourites.filter((s) => s !== slug)
      : [...favourites, slug];
    setFavourites(next);
    try { window.localStorage.setItem(FAVOURITES_KEY, JSON.stringify(next)); } catch (e) { /* private mode */ }
  };

  const isFiltering = query.trim() !== '' || activeCategory !== 'All';

  const filtered = useMemo(() => {
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return TOOLS.filter((t) => {
      if (activeCategory !== 'All' && t.category !== activeCategory) return false;
      if (!tokens.length) return true;
      const haystack = `${t.name} ${t.blurb} ${t.keywords} ${t.category}`.toLowerCase();
      return tokens.every((tok) => haystack.includes(tok));
    });
  }, [query, activeCategory]);

  const popularTools = useMemo(() => TOOLS.filter((t) => t.popular), []);
  const favouriteTools = useMemo(
    () => TOOLS.filter((t) => favourites.includes(t.slug)),
    [favourites],
  );
  const recentTools = useMemo(
    () => recents.map((slug) => TOOLS.find((t) => t.slug === slug)).filter(Boolean),
    [recents],
  );

  const clearFilters = () => {
    setQuery('');
    setActiveCategory('All');
  };

  const renderCard = (t) => (
    <ToolCard
      key={t.slug}
      tool={t}
      isFavourite={favourites.includes(t.slug)}
      onToggleFavourite={toggleFavourite}
    />
  );

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
            autoComplete="off"
          />
        </div>
        <div className="filter-chips" role="group" aria-label="Filter tools by category">
          {['All', ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              type="button"
              className={`filter-chip${activeCategory === cat ? ' active' : ''}`}
              aria-pressed={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
            >
              {cat === 'All' ? 'All tools' : cat}
            </button>
          ))}
        </div>
        {isFiltering && (
          <p className="results-status" role="status" aria-live="polite">
            {filtered.length === 1 ? '1 tool found' : `${filtered.length} tools found`}
            {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
            {query.trim() ? ` for "${query.trim()}"` : ''}
          </p>
        )}
      </section>

      {!isFiltering && mounted && favouriteTools.length > 0 && (
        <section className="dashboard-row" aria-label="Your favourites">
          <h2>Your favourites</h2>
          <div className="card-grid">
            {favouriteTools.map(renderCard)}
          </div>
        </section>
      )}

      {!isFiltering && mounted && recentTools.length > 0 && (
        <section className="dashboard-row" aria-label="Recently used tools">
          <h2>Recently used</h2>
          <div className="card-grid">
            {recentTools.map(renderCard)}
          </div>
        </section>
      )}

      {!isFiltering && popularTools.length > 0 && (
        <section className="dashboard-row" aria-label="Popular tools">
          <h2>Popular tools</h2>
          <div className="card-grid">
            {popularTools.map(renderCard)}
          </div>
        </section>
      )}

      {CATEGORIES.map((cat) => {
        const items = filtered.filter((t) => t.category === cat);
        if (!items.length) return null;
        return (
          <section className="category-block" key={cat} id={categoryId(cat)} aria-label={cat}>
            <h2>{cat}</h2>
            <div className="card-grid">
              {items.map(renderCard)}
            </div>
          </section>
        );
      })}
      {filtered.length === 0 && (
        <div className="empty-state">
          <h2>No tools found</h2>
          <p>
            No tools match your current search and filters. Try a shorter word,
            check the spelling, or clear everything and browse the full list.
          </p>
          <button type="button" className="btn secondary" onClick={clearFilters}>
            Clear search and filters
          </button>
        </div>
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

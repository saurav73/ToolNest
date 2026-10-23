import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { TOOLS, CATEGORIES, categoryId } from '../data/tools.js';
import ChatWidget from './ChatWidget.jsx';

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="ToolNest home">
      <span className="logo-mark">T</span>
      <span className="logo-name">ToolNest</span>
    </Link>
  );
}

function HamburgerIcon() {
  return (
    <svg viewBox="0 0 24 24" width="25" height="25" aria-hidden="true" focusable="false">
      <path d="M4 7 H20 M4 12 H20 M4 17 H20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
      <path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg className="icon-sun" viewBox="0 0 24 24" width="21" height="21" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 2.8 V5 M12 19 V21.2 M2.8 12 H5 M19 12 H21.2 M5.2 5.2 L6.8 6.8 M17.2 17.2 L18.8 18.8 M18.8 5.2 L17.2 6.8 M6.8 17.2 L5.2 18.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="icon-moon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path d="M20 14.5 A8.5 8.5 0 0 1 9.5 4 A8.5 8.5 0 1 0 20 14.5 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Light / dark toggle. The theme itself lives on <html data-theme>, set
 * before first paint by the inline script in index.html; this button only
 * flips the attribute and persists the choice. Icon visibility is pure
 * CSS (sun in dark mode, moon in light), so SSR markup never mismatches.
 */
export function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement;
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('toolnest-theme', next); } catch (e) { /* private mode */ }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', next === 'dark' ? '#0b0f17' : '#4f46e5');
  };
  return (
    <button type="button" className="theme-toggle" onClick={toggle} aria-label="Toggle dark mode" title="Toggle dark mode">
      <SunIcon />
      <MoonIcon />
    </button>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setOpen(false); }, [location.pathname, location.hash]);

  const close = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Logo />
        <nav className={`main-nav${open ? ' open' : ''}`} id="main-nav" aria-label="Main">
          <div className="nav-main">
            <NavLink to="/" end onClick={close}>Home</NavLink>
            <NavLink to="/word-counter" onClick={close}>Word Counter</NavLink>
            <NavLink to="/password-generator" onClick={close}>Passwords</NavLink>
            <NavLink to="/qr-code-generator" onClick={close}>QR Codes</NavLink>
            <NavLink to="/about" onClick={close}>About</NavLink>
          </div>
          <div className="nav-cats">
            <span className="nav-cats-title">Tool categories</span>
            {CATEGORIES.map((cat) => (
              <Link key={cat} to={{ pathname: '/', hash: `#${categoryId(cat)}` }} onClick={close}>{cat}</Link>
            ))}
          </div>
        </nav>
        <div className="header-actions">
          <ThemeToggle />
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="main-nav"
            aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon /> : <HamburgerIcon />}
          </button>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>
            Free online tools for writers, students and developers. Every tool
            runs entirely in your browser, so your text never leaves your
            device and nothing is stored on a server.
          </p>
        </div>
        <nav className="footer-col" aria-label="Popular tools">
          <h3>Popular tools</h3>
          <ul>
            {TOOLS.slice(0, 6).map((t) => (
              <li key={t.slug}><Link to={t.path}>{t.name}</Link></li>
            ))}
          </ul>
        </nav>
        <nav className="footer-col" aria-label="More tools">
          <h3>More tools</h3>
          <ul>
            {TOOLS.slice(6).map((t) => (
              <li key={t.slug}><Link to={t.path}>{t.name}</Link></li>
            ))}
          </ul>
        </nav>
        <nav className="footer-col" aria-label="Site">
          <h3>ToolNest</h3>
          <ul>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms of Use</Link></li>
            <li><Link to="/disclaimer">Disclaimer</Link></li>
          </ul>
        </nav>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 ToolNest. Free tools, no sign-up, no tracking of your text.</span>
      </div>
    </footer>
  );
}

export default function Layout({ children }) {
  return (
    <div className="app">
      <Header />
      {children}
      <Footer />
      <ChatWidget />
    </div>
  );
}

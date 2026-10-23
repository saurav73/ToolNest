import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { TOOLS, CATEGORIES } from '../data/tools.js';
import ToolIcon, { tileClass } from './ToolIcon.jsx';

/**
 * ToolNest Helper: a rule-based tool finder that lives in the corner of
 * every page. It runs 100% in the browser: no AI service, no API keys,
 * nothing typed here is sent or stored anywhere. Matching is token
 * overlap + light fuzzy scoring against the tool registry, with a small
 * set of honest built-in answers for the questions people actually ask.
 *
 * UX patterns applied (from mainstream chat-widget practice):
 *  - the launcher never auto-opens; the greeting is the first message and
 *    pairs quick-reply chips (real buttons, short labels) with free text;
 *  - a three-dot typing indicator shows for a brief, natural beat before
 *    each reply, and bot/user bubbles are visually distinct;
 *  - fallbacks say so plainly and offer the closest categories instead of
 *    a dead end;
 *  - the header carries a one-line disclosure of what the helper is.
 */

const POPULAR = ['word-counter', 'merge-pdf', 'heic-to-jpg', 'qr-code-generator'];
const BROWSE_CATS = ['PDF Tools', 'Image Tools', 'Text Tools'];

const toolBySlug = (slug) => TOOLS.find((t) => t.slug === slug);

/* Extra plain-language phrases people actually type, mapped to tools the
   registry keywords do not already cover well. */
const EXTRA_PHRASES = [
  { phrases: ['iphone photo', 'iphone picture', 'apple photo', 'photos from my iphone'], slugs: ['heic-to-jpg', 'heic-to-png'] },
  { phrases: ['shrink photo', 'shrink image', 'make image smaller', 'photo too big', 'image too large', 'reduce photo size'], slugs: ['image-compressor'] },
  { phrases: ['combine pdfs', 'join pdfs', 'put pdfs together', 'merge pdfs'], slugs: ['merge-pdf'] },
  { phrases: ['split a pdf', 'take pages out', 'get one page from'], slugs: ['split-pdf'] },
  { phrases: ['email address variations', 'dot variations', 'more email addresses', 'gmail trick', 'email aliases'], slugs: ['gmail-dot-generator'] },
  { phrases: ['bill my client', 'make a bill', 'charge a client', 'freelance invoice'], slugs: ['invoice-generator'] },
  { phrases: ['read text from', 'copy text from image', 'copy text from photo', 'scan text'], slugs: ['image-to-text'] },
  { phrases: ['under 50kb', 'to 50kb', 'below 50kb', '50 kb'], slugs: ['compress-image-to-50kb'] },
  { phrases: ['under 100kb', 'to 100kb', 'below 100kb', '100 kb'], slugs: ['compress-image-to-100kb'] },
  { phrases: ['under 200kb', 'to 200kb', 'below 200kb', '200 kb'], slugs: ['compress-image-to-200kb'] },
];

/* Built-in answers, checked before tool matching. Replies stay 1-2 lines,
   honest about how the site works. `link` renders an in-chat link. */
const FAQ_INTENTS = [
  {
    test: (t) => /\b(free|cost|price|pay|paid|charge|subscription|premium)\b/.test(t),
    text: 'Yes, every tool on ToolNest is completely free. There is no premium tier, no trial and no checkout.',
  },
  {
    test: (t) => /\b(upload|uploaded|server|stored|store my|privacy|private|safe|secure|leave my device|sent anywhere)\b/.test(t),
    text: 'No. Every tool runs entirely in your browser, so your files and text never leave your device and nothing is uploaded or stored.',
  },
  {
    test: (t) => /\bqr\b/.test(t) && /\b(expire|expires|expiry|stop working|last)\b/.test(t),
    text: 'No, QR codes made here do not expire. Your link is encoded directly into the pattern, not stored on a server.',
    slugs: ['qr-code-generator'],
  },
  {
    test: (t) => /\b(account|sign up|signup|sign-up|register|log in|login)\b/.test(t),
    text: 'No account needed. There is no sign-up on ToolNest at all, just open a tool and use it.',
  },
  {
    test: (t) => /\b(dark mode|dark theme|night mode|light mode|theme)\b/.test(t),
    text: 'Use the sun and moon button in the top header bar to switch between light and dark mode. It remembers your choice, and by default it follows your device setting.',
  },
  {
    test: (t) => /\b(contact|support|help desk|email you|reach you|report a bug|feedback)\b/.test(t),
    text: 'You can reach us through the contact page, and we read everything that comes in.',
    link: { to: '/contact', label: 'Open the contact page' },
  },
];

const STOPWORDS = new Set([
  'i', 'a', 'an', 'the', 'to', 'for', 'me', 'my', 'please', 'want', 'need',
  'tool', 'tools', 'how', 'do', 'does', 'can', 'you', 'could', 'would', 'is',
  'it', 'of', 'in', 'on', 'and', 'or', 'with', 'that', 'this', 'have', 'has',
  'get', 'give', 'show', 'find', 'looking', 'look', 'use', 'using', 'make',
  'from', 'into', 'your', 'yours', 'there', 'here', 'any', 'some',
]);

function levenshtein(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 99;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cur = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
  }
  return row[b.length];
}

function toolTokens(tool) {
  const raw = `${tool.name} ${tool.keywords} ${tool.blurb} ${tool.category}`.toLowerCase();
  return new Set(raw.replace(/[^a-z0-9\s-]/g, ' ').split(/[\s,]+/).filter(Boolean));
}

const TOOL_INDEX = TOOLS.map((tool) => ({ tool, tokens: toolTokens(tool) }));

function scoreTools(query) {
  const q = query.toLowerCase();
  const qTokens = q.replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter((w) => w && !STOPWORDS.has(w));
  const scored = new Map();
  const bump = (slug, pts) => scored.set(slug, (scored.get(slug) || 0) + pts);

  for (const { tool, tokens } of TOOL_INDEX) {
    let score = 0;
    if (q.includes(tool.name.toLowerCase())) score += 6;
    for (const kw of tool.keywords.split(',')) {
      const phrase = kw.trim();
      if (phrase && q.includes(phrase)) score += 4;
    }
    for (const qt of qTokens) {
      if (tokens.has(qt)) score += qt.length >= 4 ? 2 : 1;
      else if (qt.length >= 4) {
        for (const tt of tokens) {
          if (tt.length >= 4 && levenshtein(qt, tt) <= (qt.length >= 7 ? 2 : 1)) { score += 1; break; }
        }
      }
    }
    if (score > 0) bump(tool.slug, score);
  }

  for (const entry of EXTRA_PHRASES) {
    if (entry.phrases.some((p) => q.includes(p))) entry.slugs.forEach((s) => bump(s, 5));
  }

  /* "png to jpg" style queries: the slug itself is the best answer. */
  const pair = q.replace(/\s+/g, ' ').match(/\b([a-z0-9]+) to ([a-z0-9]+)\b/);
  if (pair) {
    const slugGuess = `${pair[1]}-to-${pair[2]}`;
    if (toolBySlug(slugGuess)) bump(slugGuess, 8);
    if (pair[2] === 'pdf' && toolBySlug(`${pair[1]}-to-pdf`)) bump(`${pair[1]}-to-pdf`, 8);
    if (pair[1] === 'pdf' && toolBySlug(`pdf-to-${pair[2]}`)) bump(`pdf-to-${pair[2]}`, 8);
  }

  return [...scored.entries()]
    .map(([slug, score]) => ({ tool: toolBySlug(slug), score }))
    .filter((r) => r.tool)
    .sort((a, b) => b.score - a.score);
}

/* greeting / browse chip sets as labelled groups, reused across replies */
const greetingChips = () => ([
  { label: 'Popular', chips: POPULAR.map((s) => ({ label: toolBySlug(s).name, kind: 'tool', slug: s })) },
  {
    label: 'Browse by type',
    chips: [
      ...BROWSE_CATS.map((c) => ({ label: c, kind: 'category', category: c })),
      { label: 'All tools', kind: 'all' },
    ],
  },
]);

const browseChips = () => ([
  {
    chips: [
      ...CATEGORIES.map((c) => ({ label: c, kind: 'category', category: c })),
      { label: 'All tools', kind: 'all' },
    ],
  },
]);

let msgId = 0;
const botMsg = (text, extra = {}) => ({ id: ++msgId, from: 'bot', text, ...extra });
const userMsg = (text) => ({ id: ++msgId, from: 'user', text });

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" focusable="false">
      <path d="M21 11.5 a8.5 8.5 0 0 1 -8.5 8.5 c-1.2 0-2.4-.25-3.4-.7 L3 20.5 l1.2-3.6 A8.5 8.5 0 1 1 21 11.5 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="8.2" cy="11.5" r="1.25" fill="currentColor" />
      <circle cx="12" cy="11.5" r="1.25" fill="currentColor" />
      <circle cx="15.8" cy="11.5" r="1.25" fill="currentColor" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path d="M4.5 12 H19 M13 5.5 L19.5 12 L13 18.5" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ToolCard({ tool, onNavigate }) {
  return (
    <Link to={tool.path} className="chat-card" onClick={onNavigate}>
      <span className={`tool-tile ${tileClass(tool.category)}`}><ToolIcon slug={tool.slug} /></span>
      <span className="chat-card-text">
        <span className="chat-card-name">{tool.name}</span>
        <span className="chat-card-blurb">{tool.blurb}</span>
      </span>
    </Link>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState(() => [
    botMsg('Hi, I am the ToolNest Helper. Which tool do you want? Type what you need to do, like "merge two PDFs" or "shrink a photo", or pick one of these.', { chipGroups: greetingChips() }),
  ]);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  useEffect(() => {
    if (open && bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, typing, open]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open ]);

  const close = () => setOpen(false);

  const reply = (produce) => {
    setTyping(true);
    timerRef.current = setTimeout(() => {
      setMessages((m) => [...m, produce()]);
      setTyping(false);
    }, 420 + Math.random() * 280);
  };

  const answerCategory = (category) => {
    const inCat = TOOLS.filter((t) => t.category === category);
    const shown = inCat.slice(0, 6);
    const more = inCat.length - shown.length;
    return botMsg(
      `Here are the ${category.toLowerCase()} on ToolNest. Tap one to open it.${more > 0 ? ` There are ${more} more in this group on the homepage.` : ''}`,
      { tools: shown.map((t) => t.slug) },
    );
  };

  const answerAll = () => botMsg(
    'ToolNest has 33 free tools. Browse them by type here, or open the homepage to see the full grid.',
    { chipGroups: browseChips(), link: { to: '/', label: 'See all 33 tools on the homepage' } },
  );

  const answerQuery = (raw) => {
    const q = raw.toLowerCase();
    for (const intent of FAQ_INTENTS) {
      if (intent.test(q)) return botMsg(intent.text, { tools: intent.slugs, link: intent.link });
    }
    const results = scoreTools(raw);
    if (results.length && results[0].score >= 4) {
      const top = results.filter((r) => r.score >= results[0].score * 0.55).slice(0, 3);
      return botMsg(
        top.length === 1 ? 'This is the tool you want:' : 'Here is what I found for you:',
        { tools: top.map((r) => r.tool.slug) },
      );
    }
    if (results.length) {
      const top = results.slice(0, 2);
      return botMsg(
        'I am not fully sure, but these are the closest matches. You can also browse by type below.',
        { tools: top.map((r) => r.tool.slug), chipGroups: browseChips() },
      );
    }
    return botMsg(
      'I could not match that to a tool, sorry. Try describing the job in a few words, like "combine pdfs" or "count words", or browse by type:',
      { chipGroups: browseChips() },
    );
  };

  const sendText = (raw) => {
    const text = raw.trim();
    if (!text || typing) return;
    setMessages((m) => [...m, userMsg(text)]);
    setInput('');
    reply(() => answerQuery(text));
  };

  const onChip = (chip) => {
    if (typing) return;
    if (chip.kind === 'tool') {
      const tool = toolBySlug(chip.slug);
      setMessages((m) => [...m, userMsg(tool.name)]);
      reply(() => botMsg('Here it is. Tap the card to open it:', { tools: [chip.slug] }));
    } else if (chip.kind === 'category') {
      setMessages((m) => [...m, userMsg(chip.category)]);
      reply(() => answerCategory(chip.category));
    } else if (chip.kind === 'all') {
      setMessages((m) => [...m, userMsg('All tools')]);
      reply(answerAll);
    }
  };

  return (
    <>
      {!open && (
        <button type="button" className="chat-fab" onClick={() => setOpen(true)} aria-label="Open ToolNest Helper chat" title="ToolNest Helper">
          <ChatIcon />
        </button>
      )}
      {open && (
        <div
          className="chat-panel"
          role="dialog"
          aria-label="ToolNest Helper chat"
          onKeyDown={(e) => { if (e.key === 'Escape') close(); }}
        >
          <div className="chat-head">
            <span className="chat-avatar" aria-hidden="true">T</span>
            <div className="chat-head-text">
              <div className="chat-head-name">ToolNest Helper</div>
              <div className="chat-head-sub">Tool finder. Runs in your browser, nothing is sent or stored.</div>
            </div>
            <button type="button" className="chat-close" onClick={close} aria-label="Close chat">
              <CloseIcon />
            </button>
          </div>

          <div className="chat-body" ref={bodyRef} aria-live="polite">
            {messages.map((m) => (
              <React.Fragment key={m.id}>
                <div className={`chat-row ${m.from}`}>
                  <div className={`chat-msg ${m.from}`}>
                    {m.text}
                    {m.link && (
                      <>
                        {' '}
                        <Link to={m.link.to} onClick={close}>{m.link.label}</Link>
                      </>
                    )}
                  </div>
                </div>
                {m.tools && m.tools.length > 0 && (
                  <div className="chat-cards">
                    {m.tools.map((slug) => {
                      const tool = toolBySlug(slug);
                      return tool ? <ToolCard key={slug} tool={tool} onNavigate={close} /> : null;
                    })}
                  </div>
                )}
                {m.chipGroups && m.chipGroups.map((group, gi) => (
                  <div key={gi}>
                    {group.label && <div className="chat-group-label" style={{ marginBottom: 6 }}>{group.label}</div>}
                    <div className="chat-chips">
                      {group.chips.map((chip) => (
                        <button key={chip.label} type="button" className="chat-chip" onClick={() => onChip(chip)}>
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </React.Fragment>
            ))}
            {typing && (
              <div className="chat-row bot">
                <div className="chat-typing" aria-label="Helper is typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
          </div>

          <form
            className="chat-input-row"
            onSubmit={(e) => { e.preventDefault(); sendText(input); }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type what you need, e.g. merge pdf"
              aria-label="Message the ToolNest Helper"
              autoComplete="off"
            />
            <button type="submit" className="chat-send" disabled={!input.trim() || typing} aria-label="Send message">
              <SendIcon />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

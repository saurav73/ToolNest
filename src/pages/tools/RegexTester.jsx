import React, { useMemo, useState } from 'react';
import ToolLayout from '../../components/ToolLayout.jsx';
import CopyButton from '../../components/CopyButton.jsx';

const PRESETS = [
  { label: 'Email', pattern: '[\\w.+-]+@[\\w-]+\\.[\\w.]+', flags: 'i' },
  { label: 'URL', pattern: 'https?://[^\\s/$.?#].[^\\s]*', flags: 'i' },
  { label: 'US phone', pattern: '\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}', flags: '' },
  { label: 'Date (YYYY-MM-DD)', pattern: '\\d{4}-\\d{2}-\\d{2}', flags: '' },
  { label: 'Hex color', pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b', flags: '' },
  { label: 'IPv4', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', flags: '' },
];

const FAQS = [
  {
    q: 'How do I test a regular expression here?',
    a: 'Type or paste your pattern in the pattern box, pick the flags you need, then paste the text you want to test against. Matches update live: every match is highlighted in the text, listed with its position, and any capture groups are shown underneath. If the pattern is invalid, you get the exact error instead of a silent empty result.',
  },
  {
    q: 'What do the flags mean?',
    a: 'g finds every match instead of stopping at the first. i ignores letter case. m makes ^ and $ match the start and end of each line instead of the whole text. s lets the dot match line breaks. u turns on full Unicode mode, which matters for emoji and characters outside the basic set.',
  },
  {
    q: 'What are capture groups?',
    a: 'Parentheses in a pattern capture part of the match. In (\\d{4})-(\\d{2})-(\\d{2}), group 1 is the year, group 2 the month and group 3 the day. This tool lists the groups for every match, so you can check that each group captures exactly what you intended before using the pattern in code.',
  },
  {
    q: 'Is my test text sent anywhere?',
    a: 'No. The pattern runs in your browser with the built-in JavaScript engine, which is the same engine most websites use. Nothing you type or paste leaves your device, so you can safely test patterns against log lines, private data samples and production-like text.',
  },
];

const CONTENT = (
  <>
    <h2>Test regex patterns against real text, live</h2>
    <p>
      A regular expression is only as good as its test data. This tester runs your
      pattern against text you paste in and shows every match highlighted in place,
      with its position and capture groups listed below. Change the pattern or the
      flags and the results update immediately, so you can iterate on a tricky
      pattern in seconds instead of switching between your editor and a console.
    </p>
    <h2>How to use the regex tester</h2>
    <ul>
      <li><strong>Write the pattern without slashes:</strong> enter the pattern itself, such as \d+ or [A-Z][a-z]+, and choose flags separately. The tool builds the expression for you.</li>
      <li><strong>Watch the highlights:</strong> each match is marked in your sample text, so you can see at a glance whether the pattern grabs too much, too little, or the wrong part entirely.</li>
      <li><strong>Check the groups:</strong> if your pattern uses parentheses, every group is listed per match. A group that is empty or holds the wrong slice is the most common regex bug, and it shows up here first.</li>
      <li><strong>Start from a preset:</strong> the buttons above load common patterns for email addresses, URLs, phone numbers, dates, hex colors and IP addresses. Use them as-is or edit them to fit your format.</li>
    </ul>
    <h2>Common regex mistakes this tester catches</h2>
    <ul>
      <li><strong>Greedy quantifiers:</strong> .* grabs as much as possible. If your match runs past the closing quote or bracket you expected, try the lazy form .*? and watch the highlight shrink to the right span.</li>
      <li><strong>Unescaped dots:</strong> a plain dot matches any character, so a pattern meant for a file extension like .pdf also matches Xpdf. Escape it as \.pdf when you mean a literal dot.</li>
      <li><strong>Missing anchors:</strong> without ^ and $ a pattern matches anywhere inside the text. That is fine for finding things, but for validation you usually want the whole input to match, which means anchoring both ends.</li>
      <li><strong>Forgetting the global flag:</strong> without g, only the first match is found. If your match count looks too low, check that g is on.</li>
    </ul>
    <h2>Regex flavors and compatibility</h2>
    <p>
      This tester uses JavaScript regular expressions, the flavor built into every
      browser and into Node.js. Most everyday patterns work identically in Python,
      PHP, Java and other languages, but a few features differ: lookbehind, named
      groups and Unicode property escapes are supported in modern JavaScript, while
      some older or stricter flavors handle them differently. If a pattern must run
      in another language, test the final version in that language too, and keep an
      eye on the error message here: it is the same message JavaScript itself
      reports, so it tells you exactly what is wrong and where.
    </p>
  </>
);

export default function RegexTester() {
  const [pattern, setPattern] = useState('[\\w.+-]+@[\\w-]+\\.[\\w.]+');
  const [flags, setFlags] = useState({ g: true, i: true, m: false, s: false, u: false });
  const [text, setText] = useState('Contact us at hello@example.com or support@toolnest.example.org for help.');

  const toggleFlag = (key) => setFlags((f) => ({ ...f, [key]: !f[key] }));

  const result = useMemo(() => {
    const flagStr = Object.entries(flags).filter(([, v]) => v).map(([k]) => k).join('');
    if (!pattern) return { matches: [], error: null };
    let re;
    try {
      re = new RegExp(pattern, flagStr.includes('g') ? flagStr : flagStr + 'g');
    } catch (e) {
      return { matches: [], error: e.message };
    }
    const matches = [];
    let m;
    try {
      while ((m = re.exec(text)) !== null) {
        matches.push({ full: m[0], index: m.index, groups: m.slice(1) });
        if (m[0] === '') re.lastIndex += 1;
        if (matches.length > 500) break;
      }
    } catch (e) {
      return { matches: [], error: e.message };
    }
    return { matches, error: null };
  }, [pattern, flags, text]);

  const highlighted = useMemo(() => {
    if (result.error || !result.matches.length) return text;
    const parts = [];
    let pos = 0;
    result.matches.forEach((m, i) => {
      if (m.index > pos) parts.push(<span key={`t${i}`}>{text.slice(pos, m.index)}</span>);
      parts.push(<mark key={`m${i}`}>{text.slice(m.index, m.index + m.full.length)}</mark>);
      pos = m.index + m.full.length;
    });
    if (pos < text.length) parts.push(<span key="tail">{text.slice(pos)}</span>);
    return parts;
  }, [result, text]);

  const applyPreset = (p) => {
    setPattern(p.pattern);
    setFlags({ g: true, i: p.flags.includes('i'), m: false, s: false, u: false });
  };

  return (
    <ToolLayout
      slug="regex-tester"
      path="/regex-tester"
      title="Regex Tester Online: Test Patterns Live Free | ToolNest"
      description="Test regular expressions live against your own text: matches, groups and clear errors, plus ready-made patterns for email, URL and dates."
      h1="Regex Tester"
      intro="Test regular expressions live against your own text, with every match highlighted, capture groups listed, and clear errors when a pattern is invalid."
      faqs={FAQS}
      content={CONTENT}
    >
      <div className="field">
        <label htmlFor="rx-pattern">Regular expression (without / slashes)</label>
        <input id="rx-pattern" type="text" value={pattern} onChange={(e) => setPattern(e.target.value)} spellCheck={false} />
      </div>
      <div className="checks" style={{ marginBottom: 6 }}>
        {Object.keys(flags).map((k) => (
          <label key={k} style={{ marginRight: 12 }}>
            <input type="checkbox" checked={flags[k]} onChange={() => toggleFlag(k)} /> {k}
          </label>
        ))}
      </div>
      <div className="btn-row" style={{ marginBottom: 12 }}>
        {PRESETS.map((p) => (
          <button key={p.label} type="button" className="btn secondary" onClick={() => applyPreset(p)}>{p.label}</button>
        ))}
      </div>
      <div className="field">
        <label htmlFor="rx-text">Test text</label>
        <textarea id="rx-text" rows={5} value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} />
      </div>
      {result.error && <div className="message err">{result.error}</div>}
      {!result.error && (
        <p className="lede">{result.matches.length} match{result.matches.length === 1 ? '' : 'es'} found{result.matches.length >= 500 ? ' (showing first 500)' : ''}.</p>
      )}
      {!result.error && result.matches.length > 0 && (
        <div className="field">
          <label>Highlighted matches</label>
          <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: 'var(--card, #f6f6f6)', padding: 12, borderRadius: 8 }}>{highlighted}</p>
        </div>
      )}
      {!result.error && result.matches.length > 0 && (
        <div className="field">
          <label>Match details</label>
          <ul>
            {result.matches.slice(0, 50).map((m, i) => (
              <li key={i}>
                <code>{m.full === '' ? '(empty match)' : m.full}</code> at position {m.index}
                {m.groups.length > 0 && m.groups.some((g) => g !== undefined) && (
                  <> — groups: {m.groups.map((g, gi) => (
                    <span key={gi}>[{gi + 1}] {g === undefined ? '—' : g === '' ? '(empty)' : g} </span>
                  ))}</>
                )}
              </li>
            ))}
          </ul>
          {result.matches.length > 50 && <p>Showing the first 50 of {result.matches.length} matches.</p>}
        </div>
      )}
      {!result.error && result.matches.length > 0 && (
        <div className="btn-row">
          <CopyButton text={result.matches.map((m) => m.full).join('\n')} label="Copy all matches" className="btn secondary" />
        </div>
      )}
    </ToolLayout>
  );
}

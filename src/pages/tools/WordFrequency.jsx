import React, { useMemo, useState } from 'react';
import ToolLayout from '../../components/ToolLayout.jsx';
import CopyButton from '../../components/CopyButton.jsx';
import { tokenizeWords, wordCounts, STOPWORDS } from '../../lib/text.js';

const FAQS = [
  {
    q: 'How is word frequency useful?',
    a: 'Frequency counts reveal habits you cannot feel while writing: a word you lean on twenty times, a key term you mentioned only once, or filler crowding out substance. Editors use counts to vary vocabulary, SEO writers use them to check topic coverage, and students use them to spot repetition before submitting.',
  },
  {
    q: 'What does "ignore common words" hide?',
    a: 'It filters out stopwords: the, and, of, to and about 90 other small grammatical words that dominate any English text. Hiding them leaves the meaningful vocabulary, which is what most people actually want to analyze.',
  },
  {
    q: 'How are words counted?',
    a: 'Words are matched case-insensitively as runs of letters and digits, with apostrophes kept inside words like "don\'t". "Apple", "apple" and "APPLE" all count toward the same word. Numbers count as words too, which matters for data-heavy text.',
  },
  {
    q: 'Can I export the results?',
    a: 'Yes. The Copy table button copies the full table as tab-separated rows you can paste straight into a spreadsheet, where each word, count and percentage lands in its own column.',
  },
];

const CONTENT = (
  <>
    <h2>See exactly which words you use, and how often</h2>
    <p>
      Paste any text and this counter tallies every distinct word, sorted from most
      to least frequent, with each word's share of the total. Filter the view to
      your top 25, 50 or 100 words, hide common stopwords, or search the table for
      one specific term to see how often it really appears.
    </p>
    <h2>What the numbers tell you</h2>
    <ul>
      <li><strong>Repetition:</strong> one word above roughly 3 to 4 percent of a short text usually deserves synonyms.</li>
      <li><strong>Coverage:</strong> in SEO writing, your target topic terms should appear, but naturally, not stuffed.</li>
      <li><strong>Voice:</strong> frequency tables expose habits, like starting every other sentence with the same word.</li>
    </ul>
    <p>
      For overall counts, reading time and a quick top-10 keyword view, try the{' '}
      <a href="/word-counter">Word Counter</a>.
    </p>
    <h2>How the counting works under the hood</h2>
    <p>
      The counter first breaks your text into individual words, matching runs of
      letters and digits and treating every word case-insensitively, so "Garden",
      "garden" and "GARDEN" all land in the same row. It then walks through the
      word list once, keeping a running tally for each distinct word it meets.
      Percentages are worked out against the total number of words in the full
      text, and that detail matters: when you hide common words, their rows
      disappear from the table, but the remaining percentages still describe each
      word's share of the whole text, not just of the visible rows. Sorting places
      the highest counts first and breaks ties alphabetically, so equal words are
      easy to scan. The search box filters rows by partial match, which means
      searching for "photo" surfaces both "photo" and "photos", making it simple to
      add up a word and its plural. Finally, the top 25, 50 and 100 controls just
      slice the finished, sorted table, so changing the view never changes the
      underlying counts.
    </p>
    <h2>A worked example</h2>
    <p>
      Consider this short passage from a property listing: "Good photos sell homes.
      Good photos show light, space and detail. Buyers trust homes that look
      bright, and bright photos help buyers decide." The passage has 23 words in
      total. With common words hidden, the table shows "photos" at the top with 3
      uses, or about 13 percent of the text. "Good", "homes", "buyers" and
      "bright" each appear twice, at roughly 8.7 percent each, and everything else
      appears once. Two lessons stand out. First, the writer's real selling points,
      light, space and detail, are each mentioned only once, so the description
      could say more about them. Second, percentages in a very short text swing
      wildly, because a single extra use of a word moves it by over 4 points. In a
      1,000 word article, that same extra use would move the figure by just 0.1
      percent, which is why frequency percentages are most trustworthy on longer
      texts.
    </p>
    <h2>Tips for getting better results</h2>
    <ul>
      <li><strong>Analyze section by section:</strong> running a whole book chapter at once hides local habits, while pasting one section at a time shows exactly where a pet word clusters.</li>
      <li><strong>Search for word families:</strong> use the search box to group a word with its other forms, such as "write", "writes" and "writing", because the table counts each form as its own row.</li>
      <li><strong>Compare drafts in a spreadsheet:</strong> copy the table before and after editing into a spreadsheet and place the versions side by side to see whether you really reduced the words you were overusing.</li>
      <li><strong>Turn common words back on for style checks:</strong> with stopwords visible you can spot habits like overusing "very" or starting sentences with "and", which the filtered view is designed to hide.</li>
    </ul>
    <h2>Common mistakes to avoid</h2>
    <ul>
      <li><strong>Chasing a perfect percentage:</strong> there is no ideal density for most writing, and forcing a word up to an arbitrary figure produces text that sounds mechanical to a human reader.</li>
      <li><strong>Reading meaning into tiny samples:</strong> a two sentence caption will give almost any content word a huge percentage, so judge short texts by raw counts instead of percentages.</li>
      <li><strong>Forgetting that synonyms split the count:</strong> if you alternate between "buy", "purchase" and "order", each row looks modest while the idea itself is repeated far more often than any single row suggests.</li>
      <li><strong>Editing only the top row:</strong> repetition problems often sit just below the leader, in a cluster of words used eight or nine times each, so scan the top ten rows before you start revising.</li>
    </ul>
  </>
);

export default function WordFrequency() {
  const [text, setText] = useState('');
  const [hideCommon, setHideCommon] = useState(true);
  const [limit, setLimit] = useState(50);
  const [filter, setFilter] = useState('');

  const data = useMemo(() => {
    const tokens = tokenizeWords(text);
    const counts = wordCounts(tokens);
    let rows = [...counts.entries()].map(([word, count]) => ({
      word,
      count,
      pct: tokens.length ? (count / tokens.length) * 100 : 0,
    }));
    if (hideCommon) rows = rows.filter((r) => !STOPWORDS.has(r.word));
    rows.sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));
    if (filter.trim()) {
      const f = filter.trim().toLowerCase();
      rows = rows.filter((r) => r.word.includes(f));
    }
    return {
      total: tokens.length,
      unique: counts.size,
      rows,
      shown: rows.slice(0, limit),
    };
  }, [text, hideCommon, limit, filter]);

  const tableText = data.shown.map((r) => `${r.word}\t${r.count}\t${r.pct.toFixed(1)}%`).join('\n');

  return (
    <ToolLayout
      slug="word-frequency-counter"
      path="/word-frequency-counter"
      title="Word Frequency Counter: Count Every Word | ToolNest"
      description="Count how often each word appears in your text with a sorted, searchable frequency table. Hide common words, copy results to a spreadsheet."
      h1="Word Frequency Counter"
      intro="Count every word in your text and see the results in a sorted frequency table with counts and percentages. Filter, search and copy the table to a spreadsheet."
      faqs={FAQS}
      content={CONTENT}
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste or type your text here..."
        aria-label="Text to analyze"
        autoFocus
      />
      <div className="stat-grid">
        <div className="stat"><div className="num">{data.total}</div><div className="lbl">Total words</div></div>
        <div className="stat"><div className="num">{data.unique}</div><div className="lbl">Unique words</div></div>
        <div className="stat"><div className="num">{data.rows.length}</div><div className="lbl">Words in table</div></div>
      </div>
      <div className="row" style={{ marginTop: 14, alignItems: 'end' }}>
        <div className="field">
          <label htmlFor="freq-filter">Search the table</label>
          <input id="freq-filter" type="text" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter by word..." />
        </div>
        <div className="field">
          <label htmlFor="freq-limit">Show top</label>
          <select id="freq-limit" value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
            <option value={25}>25 words</option>
            <option value={50}>50 words</option>
            <option value={100}>100 words</option>
            <option value={100000}>All words</option>
          </select>
        </div>
        <div className="field">
          <label>Options</label>
          <div className="checks">
            <label><input type="checkbox" checked={hideCommon} onChange={(e) => setHideCommon(e.target.checked)} /> Hide common words (the, and, of...)</label>
          </div>
        </div>
      </div>

      {data.shown.length > 0 ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Word</th><th className="num">Count</th><th className="num">Share of text</th></tr>
            </thead>
            <tbody>
              {data.shown.map((r) => (
                <tr key={r.word}>
                  <td>{r.word}</td>
                  <td className="num">{r.count}</td>
                  <td className="num">{r.pct.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="hint" style={{ marginTop: 14 }}>Your frequency table will appear here once you add some text.</p>
      )}

      <div className="btn-row">
        <CopyButton text={tableText} label="Copy table" />
        <button type="button" className="btn ghost" onClick={() => setText('')} disabled={!text}>Clear text</button>
      </div>
    </ToolLayout>
  );
}

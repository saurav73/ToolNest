import React, { useMemo, useState } from 'react';
import ToolLayout from '../../components/ToolLayout.jsx';
import CopyButton from '../../components/CopyButton.jsx';

const FAQS = [
  {
    q: 'What counts as a duplicate line?',
    a: 'By default, lines that match exactly after trimming spaces at the start and end. Turn on case-sensitive matching if "Apple" and "apple" should count as different lines; with it off, they are treated as the same and the first version is kept.',
  },
  {
    q: 'What happens to blank lines?',
    a: 'Blank lines are removed by default, since they are rarely wanted in a cleaned list. Untick "Remove empty lines" if you need to keep them; repeated blank lines will still be deduplicated down to one unless duplicates are kept.',
  },
  {
    q: 'Can I sort the list at the same time?',
    a: 'Yes. Choose Sort A to Z for an alphabetical list, or Reverse lines to flip the current order without sorting. Both combine with duplicate removal, so you can dedupe and sort in a single pass.',
  },
  {
    q: 'How big a list can this handle?',
    a: 'Because everything runs in your browser, lists of tens of thousands of lines are fine. Very large pasted text (several megabytes) will still work, just a little more slowly.',
  },
];

const CONTENT = (
  <>
    <h2>Clean up messy lists in seconds</h2>
    <p>
      Duplicate lines creep into everything: merged spreadsheets, keyword lists,
      email lists, inventory exports and log files. Paste your list here and this
      tool removes every repeated line, with options to ignore case, trim stray
      spaces, drop empty lines, sort the result A to Z, or reverse it. The counter
      shows exactly how many duplicates were removed.
    </p>
    <h2>Everyday jobs for this tool</h2>
    <ul>
      <li>Merge two contact or keyword lists without double entries.</li>
      <li>Turn a shuffled export into a clean alphabetical list.</li>
      <li>Find how many unique values a column really contains.</li>
      <li>Prepare lists for import into spreadsheets, CRMs and email tools.</li>
    </ul>
    <h2>How the deduplication works under the hood</h2>
    <p>
      The tool splits your pasted text into separate lines and then walks through
      them from top to bottom, keeping a set of every line it has already seen. The
      first time a line appears, it is added to the set and copied into the output.
      Any later line whose comparison key is already in the set is skipped, which
      is why the first version of a repeated entry is always the one that survives.
      The options change how that comparison key is built. With trimming on, spaces
      at the start and end are removed before comparing, so a line with stray
      spaces still matches its clean twin, and the trimmed version is what appears
      in the output. With case-sensitive matching off, the key is lowercased, so
      "Apple" and "apple" collide and count as one line, though the output keeps
      the capitalization of whichever version came first. Empty lines are dropped
      before the comparison step when that option is on. Sorting and reversing
      happen only after deduplication, so they arrange the unique lines and never
      bring a duplicate back. The counters describe the non-empty input lines, the
      unique lines produced, and the difference between the two.
    </p>
    <h2>A worked example</h2>
    <p>
      Paste this eight line list: apple, banana, Apple, cherry, banana, one blank
      line, date, apple. With the default options, meaning case-insensitive
      matching, trimming on and empty lines removed, the output is four lines:
      apple, banana, cherry, date. The statistics report 7 lines in, because the
      blank line is not counted, 4 unique lines out, and 3 duplicates removed:
      the capital "Apple", the second "banana" and the second "apple". Now tick
      case-sensitive matching and run the same list again. This time "Apple" is
      treated as its own entry, the output grows to five lines, and only 2
      duplicates are removed. That one checkbox is the difference between a clean
      fruit list and a correct list of case-sensitive product codes.
    </p>
    <h2>Tips for getting better results</h2>
    <ul>
      <li><strong>Keep a copy of the original:</strong> deduplication cannot be undone once you paste over your source, so save the raw list first, especially when the removed count turns out larger than you expected.</li>
      <li><strong>Normalize before you dedupe:</strong> if entries differ only in capitalization, run the list through the <a href="/case-converter">Case Converter</a> set to lowercase first, so visually identical entries match even with case-sensitive matching on.</li>
      <li><strong>Merging two lists is just pasting:</strong> paste the second list directly underneath the first and dedupe once; every overlap between the two lists disappears in a single pass.</li>
      <li><strong>Use the removed count as a sanity check:</strong> if you expected about ten overlaps and the tool reports two hundred, your source data probably has a formatting quirk worth investigating before you import the result.</li>
    </ul>
    <h2>Common mistakes to avoid</h2>
    <ul>
      <li><strong>Expecting near duplicates to match:</strong> lines that differ by an internal extra space, a trailing word or a punctuation mark are different lines to any exact matching tool, so tidy obvious variants in your source or by hand.</li>
      <li><strong>Turning case sensitivity off for codes:</strong> in SKUs, usernames and voucher codes, upper and lower case often identify genuinely different items, and merging them silently loses real entries.</li>
      <li><strong>Forgetting the first version wins:</strong> when two variants of a line exist, the one nearer the top survives, so put your preferred spelling or capitalization first if the list mixes both.</li>
      <li><strong>Assuming A to Z sorting understands numbers:</strong> sorting compares lines as text, so "Item 10" sorts before "Item 2"; pad numbers to the same width, such as "Item 02", if numeric order matters.</li>
    </ul>
  </>
);

export default function RemoveDuplicates() {
  const [input, setInput] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [trimLines, setTrimLines] = useState(true);
  const [dropEmpty, setDropEmpty] = useState(true);
  const [order, setOrder] = useState('keep');

  const result = useMemo(() => {
    const rawLines = input === '' ? [] : input.split('\n');
    const seen = new Set();
    const unique = [];
    for (const raw of rawLines) {
      const line = trimLines ? raw.trim() : raw;
      if (dropEmpty && line === '') continue;
      const key = caseSensitive ? line : line.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(line);
      }
    }
    let out = unique;
    if (order === 'az') out = [...unique].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    if (order === 'reverse') out = [...unique].reverse();
    return {
      output: out.join('\n'),
      before: rawLines.filter((l) => l.trim() !== '').length,
      after: out.length,
      removed: rawLines.filter((l) => l.trim() !== '').length - out.length,
    };
  }, [input, caseSensitive, trimLines, dropEmpty, order]);

  return (
    <ToolLayout
      slug="remove-duplicate-lines"
      path="/remove-duplicate-lines"
      title="Remove Duplicate Lines: Clean Lists Instantly | ToolNest"
      description="Remove duplicate lines from any list, then sort A to Z or reverse the order. Shows exactly how many duplicates were removed. Free."
      h1="Remove Duplicate Lines"
      intro="Paste a list and remove every repeated line. Sort the result A to Z or reverse it, with options for case sensitivity, trimming and empty lines."
      faqs={FAQS}
      content={CONTENT}
    >
      <div className="split">
        <div className="field">
          <label htmlFor="dup-in">Your list (one item per line)</label>
          <textarea
            id="dup-in"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={'apple\nbanana\napple\ncherry\nbanana'}
            aria-label="List with duplicates"
            autoFocus
          />
        </div>
        <div className="field">
          <label htmlFor="dup-out">Cleaned list</label>
          <textarea
            id="dup-out"
            className="output"
            value={result.output}
            readOnly
            placeholder="Your unique lines will appear here..."
            aria-label="Cleaned list"
          />
        </div>
      </div>
      <div className="stat-grid">
        <div className="stat"><div className="num">{result.before}</div><div className="lbl">Lines in</div></div>
        <div className="stat"><div className="num">{result.after}</div><div className="lbl">Unique lines</div></div>
        <div className="stat"><div className="num">{result.removed}</div><div className="lbl">Duplicates removed</div></div>
      </div>
      <div className="row" style={{ marginTop: 14 }}>
        <div className="field">
          <label>Options</label>
          <div className="checks">
            <label><input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} /> Case-sensitive matching</label>
            <label><input type="checkbox" checked={trimLines} onChange={(e) => setTrimLines(e.target.checked)} /> Trim spaces</label>
            <label><input type="checkbox" checked={dropEmpty} onChange={(e) => setDropEmpty(e.target.checked)} /> Remove empty lines</label>
          </div>
        </div>
        <div className="field">
          <label>Line order</label>
          <div className="checks">
            <label><input type="radio" name="dup-order" checked={order === 'keep'} onChange={() => setOrder('keep')} /> Keep order</label>
            <label><input type="radio" name="dup-order" checked={order === 'az'} onChange={() => setOrder('az')} /> Sort A to Z</label>
            <label><input type="radio" name="dup-order" checked={order === 'reverse'} onChange={() => setOrder('reverse')} /> Reverse lines</label>
          </div>
        </div>
      </div>
      <div className="btn-row">
        <CopyButton text={result.output} label="Copy cleaned list" />
        <button type="button" className="btn ghost" onClick={() => setInput('')} disabled={!input}>Clear</button>
      </div>
    </ToolLayout>
  );
}

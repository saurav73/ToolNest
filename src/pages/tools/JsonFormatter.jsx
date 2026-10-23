import React, { useMemo, useState } from 'react';
import ToolLayout from '../../components/ToolLayout.jsx';
import CopyButton from '../../components/CopyButton.jsx';

const FAQS = [
  {
    q: 'What does JSON validation check?',
    a: 'The validator parses your text with the same strict rules every JSON parser uses: keys must be in double quotes, strings cannot use single quotes, trailing commas are not allowed, and brackets must match. When something is wrong, the error message points at the position of the problem so you can find it quickly.',
  },
  {
    q: 'What is the difference between formatting and minifying?',
    a: 'Formatting (or pretty-printing) adds line breaks and indentation so humans can read the structure. Minifying removes all unnecessary whitespace so the same data takes the fewest possible bytes, which is how JSON is usually sent between servers.',
  },
  {
    q: 'Is my JSON uploaded anywhere?',
    a: 'No. Parsing and formatting happen in your browser, so it is safe to use with configuration files, API responses and other data you would not paste into a stranger\'s server.',
  },
  {
    q: 'Why does my JSON fail with single quotes?',
    a: 'The JSON standard requires double quotes around keys and string values. Single-quoted text is valid in JavaScript object literals but not in JSON. Replace single quotes with double quotes and escape any double quotes inside the values.',
  },
];

const CONTENT = (
  <>
    <h2>Readable JSON in one click</h2>
    <p>
      JSON from an API or log file usually arrives as one dense line. Paste it here
      to format it with clean indentation, or minify readable JSON back into a
      single line for transport. If the JSON is broken, the tool tells you what the
      parser objected to and where, instead of a vague failure.
    </p>
    <h2>Common JSON mistakes this catches</h2>
    <ul>
      <li>Trailing commas after the last item in an object or array.</li>
      <li>Single quotes or unquoted keys.</li>
      <li>Missing commas between items, and unmatched braces or brackets.</li>
      <li>Comments pasted in from JavaScript, which JSON does not allow.</li>
    </ul>
    <h2>How formatting and validation work under the hood</h2>
    <p>
      When you press Format, the tool hands your text to the strict JSON parser
      built into your browser. The parser reads the text character by character,
      building objects, arrays, strings, numbers, booleans and null values, and
      it stops at the first thing it cannot make sense of. That stopping point
      is what the error message reports, converted here into a line and column
      so you can jump straight to the problem. If the text parses cleanly, the
      tool writes the data back out with your chosen indentation, two spaces,
      four spaces or tabs. Minifying does the same round trip but writes with
      no optional whitespace at all. Because the output is regenerated from the
      parsed data rather than tidied up as raw text, formatting can never
      accidentally change a value, reorder is not applied, and invalid input
      can never slip through dressed up as valid output.
    </p>
    <h2>Practical tips for debugging faster</h2>
    <ul>
      <li><strong>Start at the reported position, then look just before it:</strong> parsers often notice a mistake one token late, so a missing comma usually hides at the end of the previous line.</li>
      <li><strong>Format in stages when editing by hand:</strong> paste, format, make one change, format again. If it suddenly fails, your last change is the culprit and the search area stays small.</li>
      <li><strong>Watch string escapes:</strong> a backslash, a quote or a line break inside a value must be escaped. File paths copied from Windows and text with quotes are the usual troublemakers.</li>
      <li><strong>Check the very end of the document:</strong> truncated copies from logs and terminals often cut the closing brackets. Counting opening and closing braces after formatting is a quick sanity check.</li>
      <li><strong>Minify before measuring:</strong> if you are checking a payload size limit, minified output shows the true transfer size with no pretty printing overhead included.</li>
    </ul>
    <h2>A worked example</h2>
    <p>
      An API returns this in one line: a user object with an id of 42, a name,
      an active flag set to true, and a tags array holding admin and editor.
      Formatted with two space indentation, it becomes about ten short lines
      where the nesting is obvious at a glance, and you can see immediately
      that tags is an array while the other values are plain fields. Now add a
      trailing comma after the last tag, an easy slip when copying from
      JavaScript. Validation fails and the message points to the position
      right after that comma, around line 8 depending on layout. Delete the
      comma, format again, and the same document minifies back to a single
      line of about 90 characters, ready to paste into a request body or a
      configuration field with a strict size limit.
    </p>
    <h2>More mistakes worth knowing</h2>
    <ul>
      <li><strong>Using undefined, NaN or functions:</strong> these exist in JavaScript but have no place in JSON. Convert undefined to null and leave functions out entirely.</li>
      <li><strong>Writing numbers with leading zeros or bare decimal points:</strong> values such as 007 or .5 are rejected. Write 7 and 0.5 instead.</li>
      <li><strong>Mixing up similar looking characters:</strong> smart quotes pasted from a word processor look like double quotes but are not. Retype quotes in a plain text editor if validation keeps failing on a line that looks fine.</li>
      <li><strong>Assuming formatted means correct data:</strong> validation proves the structure is legal, not that the values are right. A price stored as a string will format beautifully and still break code that expects a number.</li>
      <li><strong>Editing the minified version by hand:</strong> one deleted character in a single line document is hard to spot. Keep a formatted copy as your working version and minify only for delivery.</li>
    </ul>
    <p>
      Working with encoded data as well? The{' '}
      <a href="/base64-encoder-decoder">Base64 Encoder and Decoder</a> handles
      the strings that often travel inside JSON payloads.
    </p>
  </>
);

function describeError(err, text) {
  const raw = err && err.message ? err.message : 'Invalid JSON.';
  const posMatch = raw.match(/position\s+(\d+)/i);
  if (posMatch) {
    const pos = Number(posMatch[1]);
    const upTo = text.slice(0, pos);
    const line = upTo.split('\n').length;
    const col = pos - upTo.lastIndexOf('\n');
    return `${raw} (around line ${line}, column ${col})`;
  }
  return raw;
}

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [indent, setIndent] = useState(2);
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState(null);

  const parsed = useMemo(() => {
    if (!input.trim()) return null;
    try {
      return { value: JSON.parse(input), error: null };
    } catch (e) {
      return { value: null, error: e };
    }
  }, [input]);

  const format = (minify) => {
    if (!input.trim()) {
      setStatus({ ok: false, msg: 'Paste some JSON first, then choose Format or Minify.' });
      return;
    }
    if (parsed.error) {
      setOutput('');
      setStatus({ ok: false, msg: `Invalid JSON: ${describeError(parsed.error, input)}` });
      return;
    }
    const out = minify
      ? JSON.stringify(parsed.value)
      : JSON.stringify(parsed.value, null, indent === 0 ? '\t' : indent);
    setOutput(out);
    setStatus({ ok: true, msg: minify ? 'Valid JSON, minified successfully.' : 'Valid JSON, formatted successfully.' });
  };

  return (
    <ToolLayout
      slug="json-formatter"
      path="/json-formatter"
      title="JSON Formatter: Format, Minify and Validate JSON | ToolNest"
      description="Format, minify and validate JSON online with clear error messages showing line and column. Free, private, runs in your browser."
      h1="JSON Formatter"
      intro="Format messy JSON into readable, indented output, minify it back to one line, and validate it with error messages that show the exact line and column of the problem."
      faqs={FAQS}
      content={CONTENT}
    >
      <div className="split">
        <div className="field">
          <label htmlFor="json-in">Your JSON</label>
          <textarea
            id="json-in"
            value={input}
            onChange={(e) => { setInput(e.target.value); setStatus(null); }}
            placeholder='{"name": "example", "items": [1, 2, 3]}'
            aria-label="JSON input"
            autoFocus
          />
        </div>
        <div className="field">
          <label htmlFor="json-out">Result</label>
          <textarea
            id="json-out"
            className="output"
            value={output}
            readOnly
            placeholder="Formatted or minified JSON will appear here..."
            aria-label="JSON result"
          />
        </div>
      </div>
      <div className="field">
        <label htmlFor="json-indent">Indentation</label>
        <select id="json-indent" value={indent} onChange={(e) => setIndent(Number(e.target.value))}>
          <option value={2}>2 spaces</option>
          <option value={4}>4 spaces</option>
          <option value={0}>Tabs</option>
        </select>
      </div>
      {status && <div className={`message ${status.ok ? 'ok' : 'err'}`}>{status.msg}</div>}
      <div className="btn-row">
        <button type="button" className="btn" onClick={() => format(false)}>Format</button>
        <button type="button" className="btn secondary" onClick={() => format(true)}>Minify</button>
        <CopyButton text={output} className="btn secondary" />
        <button type="button" className="btn ghost" onClick={() => { setInput(''); setOutput(''); setStatus(null); }} disabled={!input && !output}>Clear</button>
      </div>
    </ToolLayout>
  );
}

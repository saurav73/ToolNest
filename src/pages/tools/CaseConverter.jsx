import React, { useMemo, useState } from 'react';
import ToolLayout from '../../components/ToolLayout.jsx';
import CopyButton from '../../components/CopyButton.jsx';

const MODES = [
  { id: 'upper', label: 'UPPERCASE' },
  { id: 'lower', label: 'lowercase' },
  { id: 'title', label: 'Title Case' },
  { id: 'sentence', label: 'Sentence case' },
  { id: 'capitalized', label: 'Capitalize Each Word' },
  { id: 'alternating', label: 'aLtErNaTiNg' },
  { id: 'inverse', label: 'iNVERSE' },
];

function convert(text, mode) {
  switch (mode) {
    case 'upper': return text.toUpperCase();
    case 'lower': return text.toLowerCase();
    case 'title':
    case 'capitalized':
      return text.toLowerCase().replace(/(^|\s|[("'])(\S)/g, (m, p1, p2) => p1 + p2.toUpperCase());
    case 'sentence': {
      const lower = text.toLowerCase();
      return lower.replace(/(^\s*[a-z])|([.!?]\s+[a-z])/g, (m) => m.toUpperCase());
    }
    case 'alternating': {
      let upper = true;
      return [...text].map((ch) => {
        if (!/[a-z]/i.test(ch)) return ch;
        const out = upper ? ch.toUpperCase() : ch.toLowerCase();
        upper = !upper;
        return out;
      }).join('');
    }
    case 'inverse':
      return [...text].map((ch) => (ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase())).join('');
    default: return text;
  }
}

const FAQS = [
  {
    q: 'What is the difference between Title Case and Capitalize Each Word?',
    a: 'In this converter both produce the same practical result: every word starts with a capital letter. Strict editorial title case also keeps small words like "and", "of" and "the" lowercase in the middle of a title, which matters for book and article headlines. For headings, labels and names, capitalizing each word is what most people want.',
  },
  {
    q: 'When should I use sentence case?',
    a: 'Sentence case capitalizes only the first letter of each sentence and is the standard for body text, emails and most web content. It is the easiest style to read, and it is what style guides recommend for headings in many publications.',
  },
  {
    q: 'Why would anyone use alternating or inverse case?',
    a: 'Alternating case (aLtErNaTiNg) is mostly playful and appears in memes and social posts. Inverse case flips every letter from its current state and is handy when text arrives with the caps lock key stuck in the wrong position.',
  },
  {
    q: 'Does the converter change anything besides letters?',
    a: 'No. Numbers, punctuation, spacing and line breaks are left exactly as they are. Only the case of letters changes.',
  },
];

const CONTENT = (
  <>
    <h2>Fix text case in one click</h2>
    <p>
      Typed a whole paragraph with caps lock on? Pasted a headline that needs to be a
      normal sentence? This converter rewrites your text in seven styles: UPPERCASE
      for labels and warnings, lowercase for cleaning up shouted text, Title Case for
      headlines, Sentence case for body text, plus playful alternating and inverse
      modes. Pick a style, and the converted text appears instantly, ready to copy.
    </p>
    <h2>Which case should you choose?</h2>
    <ul>
      <li><strong>Headlines and titles:</strong> Title Case.</li>
      <li><strong>Emails and articles:</strong> Sentence case.</li>
      <li><strong>Buttons, labels and short calls to action:</strong> UPPERCASE, used sparingly.</li>
      <li><strong>Code-adjacent text and usernames:</strong> lowercase.</li>
    </ul>
    <h2>How the converter works under the hood</h2>
    <p>
      Each style applies a small, predictable rule to your text, and nothing else
      about the text changes. UPPERCASE and lowercase simply map every letter to
      its upper or lower form. Title Case works in two steps: it first lowercases
      everything, which cleans up random capitals, then capitalizes the first
      letter of each word, where a word is detected at the start of the text or
      after a space, an opening bracket or a quote mark. Sentence case also starts
      by lowercasing everything, then looks for the opening letter of the text and
      the first letter after a period, question mark or exclamation mark, and
      capitalizes just those. Alternating case walks through the text letter by
      letter, flipping between upper and lower each time it meets a letter, while
      spaces and punctuation pass through without disturbing the pattern. Inverse
      case examines each letter individually and swaps it for the opposite form, so
      the shape of the original capitalization is flipped rather than rebuilt.
    </p>
    <h2>A worked example</h2>
    <p>
      Start with this messy line, typed with caps lock partly on: "tHE QUICK brown
      FOX jumps OVER the lazy dog". UPPERCASE gives "THE QUICK BROWN FOX JUMPS OVER
      THE LAZY DOG", while lowercase gives the same sentence entirely in small
      letters. Title Case produces "The Quick Brown Fox Jumps Over The Lazy Dog",
      ready to use as a heading. Sentence case produces "The quick brown fox jumps
      over the lazy dog", which is how the line should look in normal body text,
      once you add the closing punctuation back. Inverse case gives "The quick BROWN fox JUMPS over THE LAZY DOG", preserving
      the original pattern in mirror form. Seeing all five results from one input
      shows why choosing the right mode matters more than retyping by hand.
    </p>
    <h2>Tips for getting better results</h2>
    <ul>
      <li><strong>Convert a copy, not your only version:</strong> some conversions cannot be undone, because lowercasing destroys the record of which letters were capitals, so keep the original text somewhere safe first.</li>
      <li><strong>Proofread proper nouns after Sentence case:</strong> the converter lowercases names, places and brands along with everything else, so scan the result and restore capitals for names like London, Google or Monday.</li>
      <li><strong>Fix small words manually in titles:</strong> Title Case capitalizes words like "and" and "the" in the middle of a headline, and many style guides prefer them lowercase there, so adjust those few words by hand.</li>
      <li><strong>Pair it with a cleanup pass:</strong> once the case is right, run the text through the <a href="/remove-duplicate-lines">Remove Duplicate Lines</a> tool if it is a list, or turn a lowercase heading into a web address with the <a href="/slug-generator">Slug Generator</a>.</li>
    </ul>
    <h2>Common mistakes to avoid</h2>
    <ul>
      <li><strong>Converting code, passwords or links:</strong> case is meaningful in all three, and changing it can break a URL, invalidate a password or alter a product code, so convert prose only and leave technical strings untouched.</li>
      <li><strong>Using UPPERCASE for whole paragraphs:</strong> blocks of capital letters are harder to read and look like shouting online; reserve them for short labels, warnings and buttons.</li>
      <li><strong>Trusting alternating case for anything serious:</strong> it is hard to read, unfriendly to screen readers, and makes a message look like a joke, so keep it for playful posts only.</li>
      <li><strong>Converting quoted text without checking:</strong> quotations should keep the capitalization of the original source, so leave quotes in their published form rather than restyling them to match your page.</li>
    </ul>
  </>
);

export default function CaseConverter() {
  const [text, setText] = useState('');
  const [mode, setMode] = useState('title');
  const output = useMemo(() => convert(text, mode), [text, mode]);

  return (
    <ToolLayout
      slug="case-converter"
      path="/case-converter"
      title="Case Converter: Uppercase, Lowercase, Title Case | ToolNest"
      description="Convert text to UPPERCASE, lowercase, Title Case, Sentence case, alternating or inverse case instantly. Free, private, one click."
      h1="Case Converter"
      intro="Convert any text to UPPERCASE, lowercase, Title Case, Sentence case, alternating case or inverse case. Pick a style and copy the result."
      faqs={FAQS}
      content={CONTENT}
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type or paste your text here..."
        aria-label="Text to convert"
        autoFocus
      />
      <div className="field" style={{ marginTop: 16 }}>
        <label>Choose a case style</label>
        <div className="checks">
          {MODES.map((m) => (
            <label key={m.id}>
              <input
                type="radio"
                name="case-mode"
                value={m.id}
                checked={mode === m.id}
                onChange={() => setMode(m.id)}
              />
              {m.label}
            </label>
          ))}
        </div>
      </div>
      <textarea
        className="output"
        value={output}
        readOnly
        placeholder="Your converted text will appear here..."
        aria-label="Converted text"
      />
      <div className="btn-row">
        <CopyButton text={output} />
        <button type="button" className="btn ghost" onClick={() => setText('')} disabled={!text}>Clear</button>
      </div>
    </ToolLayout>
  );
}

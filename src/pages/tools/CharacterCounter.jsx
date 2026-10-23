import React, { useMemo, useState } from 'react';
import ToolLayout from '../../components/ToolLayout.jsx';

const PLATFORMS = [
  { name: 'X (Twitter) post', limit: 280 },
  { name: 'Instagram caption', limit: 2200 },
  { name: 'LinkedIn post', limit: 3000 },
  { name: 'Facebook post', limit: 63206 },
  { name: 'Meta title (SEO)', limit: 60 },
  { name: 'Meta description (SEO)', limit: 160 },
  { name: 'SMS message', limit: 160 },
  { name: 'YouTube title', limit: 100 },
];

const FAQS = [
  {
    q: 'What is the difference between characters with and without spaces?',
    a: 'Characters with spaces counts every character including the spaces between words. Characters without spaces leaves spaces (and other whitespace) out. Some forms and assignments specify one or the other, and translation and transcription work is often priced by characters without spaces.',
  },
  {
    q: 'Why do platforms have character limits?',
    a: 'Limits keep content scannable and consistent. X caps posts at 280 characters, search engines show roughly 60 characters of a page title and about 160 of a description, and a single SMS segment holds 160 characters. Staying inside these limits stops your message being cut off.',
  },
  {
    q: 'Does this counter update live?',
    a: 'Yes. Every count updates as you type or paste, and the platform table shows how much room you have left on each channel before you post.',
  },
  {
    q: 'Is my text uploaded anywhere?',
    a: 'No. Counting happens in your browser only. Nothing you paste is sent to a server or stored.',
  },
];

const CONTENT = (
  <>
    <h2>Count characters the way each platform counts them</h2>
    <p>
      A character count sounds simple until a form rejects your text for being three
      characters too long. This counter shows six measurements at once: total
      characters, characters without spaces, letters, digits, spaces and other
      characters such as punctuation. Underneath, the platform table compares your
      text against the limits that matter most, from an X post to an SEO meta
      description, and tells you exactly how many characters you have left.
    </p>
    <h2>When character counts matter</h2>
    <ul>
      <li><strong>Social media:</strong> captions and posts that fit in full, with no cut-off text.</li>
      <li><strong>SEO:</strong> page titles near 60 characters and descriptions near 160, so search results show them in full.</li>
      <li><strong>Advertising:</strong> headlines and ad copy written to strict platform limits.</li>
      <li><strong>Applications and forms:</strong> personal statements and short answers with hard caps.</li>
    </ul>
    <p>
      Need a word count and reading time instead? Head to the{' '}
      <a href="/word-counter">Word Counter</a>.
    </p>
    <h2>How the counting works under the hood</h2>
    <p>
      Every keystroke triggers a fresh scan of the text in your browser. The total
      character count is the length of the text exactly as written, so it includes
      spaces, punctuation and the invisible character created each time you start a
      new line. The no spaces figure is produced by stripping out all whitespace,
      meaning spaces, tabs and line breaks, and counting what remains. Letters and
      digits are tallied by matching each character against those two groups, and
      anything left over, such as commas, currency signs and brackets, lands in the
      punctuation and symbols count. The platform table then does one simple piece
      of arithmetic per row: it subtracts your total from each published limit and
      reports whether the text fits and by how much. Nothing is rounded or
      estimated, so if the table says you are four characters over, deleting any
      four characters really will fix it.
    </p>
    <h2>A worked example</h2>
    <p>
      Take this advertising headline: "Free delivery on all orders over $50 this
      weekend only". The counter reports 54 characters in total and 45 characters
      with spaces removed, because the headline has ten words and therefore nine
      spaces between them. Breaking it down further gives 42 letters, 2 digits for
      the 50, and 1 symbol for the dollar sign. Against the platform table, the
      headline fits a 60 character meta title with 6 characters to spare, uses only
      a small slice of an X post, and would sit comfortably inside a single SMS
      segment. Checking a headline this way takes seconds and prevents the awkward
      surprise of a search result or ad that cuts off mid word.
    </p>
    <h2>Tips for getting better results</h2>
    <ul>
      <li><strong>Leave yourself a buffer:</strong> aim to finish five to ten characters under a limit, because platforms sometimes count links, hashtags or added tags differently from a plain text count.</li>
      <li><strong>Count the final version:</strong> mentions, hashtags, emojis and a shortened link all add characters, so paste the complete post, exactly as it will appear, rather than counting the main sentence alone.</li>
      <li><strong>Trim structure before words:</strong> removing a double space, a trailing space or an unnecessary line break often frees characters without weakening anything you actually want to say.</li>
      <li><strong>Shorten in passes:</strong> swap long phrases for short ones first, such as "in order to" for "to", then recheck the table; most over limit text fits after two or three small swaps.</li>
    </ul>
    <h2>Common mistakes to avoid</h2>
    <ul>
      <li><strong>Assuming every limit counts the same way:</strong> one form may include spaces while another ignores them, which is why this page shows both figures side by side; always match the figure the form actually asks for.</li>
      <li><strong>Judging length by eye:</strong> proportional fonts make wide letters look longer than narrow ones, so a line that looks short on screen can still be well over a limit.</li>
      <li><strong>Forgetting hidden characters:</strong> text copied from a document can carry trailing spaces or extra line breaks that quietly eat into your allowance, so paste, check, and tidy the ends.</li>
      <li><strong>Cutting the important part:</strong> when trimming a title or description, keep the main keyword and the benefit near the front, since that is the part readers and search results show first.</li>
    </ul>
  </>
);

export default function CharacterCounter() {
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const noSpaces = text.replace(/\s/g, '');
    return {
      total: text.length,
      noSpaces: noSpaces.length,
      letters: (text.match(/[A-Za-z]/g) || []).length,
      digits: (text.match(/[0-9]/g) || []).length,
      spaces: (text.match(/ /g) || []).length,
      other: noSpaces.replace(/[A-Za-z0-9]/g, '').length,
    };
  }, [text]);

  return (
    <ToolLayout
      slug="character-counter"
      path="/character-counter"
      title="Character Counter Online: With and Without Spaces | ToolNest"
      description="Count characters with and without spaces, letters and words, plus X, Instagram and LinkedIn limits. Free online, instant results."
      h1="Character Counter"
      intro="Count characters online, with and without spaces, plus letters and words, and check your text against the character limits for social media and search results."
      faqs={FAQS}
      content={CONTENT}
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste or type your text here..."
        aria-label="Text to count characters in"
        autoFocus
      />
      <div className="stat-grid">
        <div className="stat"><div className="num">{stats.total}</div><div className="lbl">Characters</div></div>
        <div className="stat"><div className="num">{stats.noSpaces}</div><div className="lbl">No spaces</div></div>
        <div className="stat"><div className="num">{stats.letters}</div><div className="lbl">Letters</div></div>
        <div className="stat"><div className="num">{stats.digits}</div><div className="lbl">Digits</div></div>
        <div className="stat"><div className="num">{stats.spaces}</div><div className="lbl">Spaces</div></div>
        <div className="stat"><div className="num">{stats.other}</div><div className="lbl">Punctuation and symbols</div></div>
      </div>

      <h3 style={{ marginTop: 24 }}>Platform limits</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Platform</th><th className="num">Limit</th><th className="num">Remaining</th><th>Status</th></tr>
          </thead>
          <tbody>
            {PLATFORMS.map((p) => {
              const remaining = p.limit - stats.total;
              return (
                <tr key={p.name}>
                  <td>{p.name}</td>
                  <td className="num">{p.limit.toLocaleString()}</td>
                  <td className="num">{remaining.toLocaleString()}</td>
                  <td>{stats.total === 0 ? 'Waiting for text' : remaining >= 0 ? 'Fits' : 'Too long'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ToolLayout>
  );
}

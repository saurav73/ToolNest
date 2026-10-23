import React, { useMemo, useState } from 'react';
import ToolLayout from '../../components/ToolLayout.jsx';
import CopyButton from '../../components/CopyButton.jsx';

function slugify(text, { separator, lower }) {
  let out = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, separator)
    .replace(new RegExp(`\\${separator}+`, 'g'), separator)
    .replace(new RegExp(`^\\${separator}+|\\${separator}+$`, 'g'), '');
  if (lower) out = out.toLowerCase();
  return out;
}

const FAQS = [
  {
    q: 'What is a URL slug?',
    a: 'A slug is the readable part at the end of a URL, such as the "how-to-bake-bread" in example.com/blog/how-to-bake-bread. Slugs identify a page in words people and search engines can understand, instead of numbers or random IDs.',
  },
  {
    q: 'What makes a good slug?',
    a: 'Short, descriptive and keyword-rich, in lowercase, with words separated by hyphens. Leave out filler words like "a" and "the" when the slug gets long, avoid dates unless the content is time-specific, and never change a slug after publishing without setting up a redirect.',
  },
  {
    q: 'Hyphens or underscores?',
    a: 'Hyphens. Google treats hyphens as word separators in URLs, while underscores are treated as joiners, so "fresh-bread-recipe" reads as three words and "fresh_bread_recipe" reads as one long word. This tool offers underscores only for systems that require them.',
  },
  {
    q: 'What happens to accents and special characters?',
    a: 'Accents are converted to their plain letter (é becomes e), and anything that is not a letter or digit becomes a separator. That keeps slugs safe in every browser, server and CMS, including WordPress, which applies the same rules to post titles automatically.',
  },
];

const CONTENT = (
  <>
    <h2>Clean, readable URLs from any title</h2>
    <p>
      Type a headline, product name or phrase and this generator produces the URL
      slug for it: lowercase letters and numbers joined by your choice of separator,
      with punctuation, accents and extra spaces handled automatically. It mirrors
      the rules WordPress and most other content systems use, so the slug you copy
      here is the slug your page will actually get.
    </p>
    <h2>Where slugs matter</h2>
    <ul>
      <li><strong>Blog posts and articles:</strong> a slug with your main keyword supports the page title in search results.</li>
      <li><strong>Product pages:</strong> product-name slugs keep store URLs tidy and shareable.</li>
      <li><strong>Documentation and help centers:</strong> predictable slugs make pages easy to link and remember.</li>
    </ul>
    <h2>How this slug generator works</h2>
    <p>
      The conversion happens in your browser in a few clear stages. First, the text is normalized so accented letters are split into a base letter plus a separate accent mark. The tool then removes those accent marks, which is why a word with an accent ends up as plain, URL safe letters instead of percent encoded characters. Next, every run of characters that is not a letter or a number, including spaces, punctuation, symbols and emoji, is replaced with a single separator. If two separators would land next to each other, they are collapsed into one, and any separator at the very start or end is trimmed away. Finally, if lowercase is enabled, the whole result is folded to lowercase. Nothing is sent to a server, so you can safely test working titles, unreleased product names and draft headlines.
    </p>
    <h2>A worked example, step by step</h2>
    <p>
      Suppose your draft title is Cafe Review: 10 Best Espresso Machines Under 300 Dollars for 2026. With hyphens and lowercase selected, the accent is stripped from the first word, the colon and the exclamation style punctuation disappear, and each gap becomes one hyphen. The result is cafe-review-10-best-espresso-machines-under-300-dollars-for-2026, which is 59 characters long. That is clear, but a little long for sharing. A tighter edit before you generate, such as Best Espresso Machines Under 300 Dollars, gives best-espresso-machines-under-300-dollars at 42 characters, keeping the keyword, the price point and the benefit while dropping the year, which you can update in the article without changing the URL later. Try both versions in the tool and compare length before you publish.
    </p>
    <h2>Practical tips for better slugs</h2>
    <ul>
      <li><strong>Put the main keyword early:</strong> the first three to five words carry the most weight for readers scanning search results, browser tabs and shared links, so lead with the topic rather than a series name or episode number.</li>
      <li><strong>Aim for three to six words:</strong> that range is long enough to describe the page and short enough to stay readable when the link is pasted into social posts, emails and chat messages without wrapping or truncation.</li>
      <li><strong>Match the slug to the page promise:</strong> if the title changes during editing, regenerate the slug from the final title so the URL, the heading and the content all describe the same thing.</li>
      <li><strong>Keep a consistent pattern across a section:</strong> if product pages use brand plus model, or guides use topic plus format, use the same pattern every time so visitors can predict URLs and find related pages by editing the address bar.</li>
      <li><strong>Check length with a counter:</strong> paste a long slug into the <a href="/word-counter">Word Counter</a> or <a href="/character-counter">Character Counter</a> if you need an exact character count for a CMS field with a strict limit.</li>
    </ul>
    <h2>Common slug mistakes to avoid</h2>
    <ul>
      <li><strong>Changing a live slug without a redirect:</strong> every bookmark, backlink and search listing still points at the old address, so an unredirected change creates a 404 page and loses the traffic you already earned.</li>
      <li><strong>Stuffing in every keyword variant:</strong> a slug that repeats the same idea three ways looks spammy to readers and adds length with no benefit. Pick the clearest phrasing once and stop.</li>
      <li><strong>Including dates, prices or stock numbers that will change:</strong> a slug that says 2025, a launch price, or a temporary discount ages badly. Keep changeable details in the page body, not in the permanent address.</li>
      <li><strong>Leaving in stop words until the slug balloons:</strong> words such as a, and, the and for are harmless in short slugs, but in a long title they waste characters. Generate first, then trim them manually if the result feels bloated.</li>
      <li><strong>Mixing separators and case in one site:</strong> using hyphens on one page, underscores on the next and capitals on a third confuses visitors and can create duplicate looking URLs on case sensitive servers. Set one house style and stick to it.</li>
    </ul>
  </>
);

export default function SlugGenerator() {
  const [text, setText] = useState('');
  const [separator, setSeparator] = useState('-');
  const [lower, setLower] = useState(true);

  const slug = useMemo(() => slugify(text, { separator, lower }), [text, separator, lower]);

  return (
    <ToolLayout
      slug="slug-generator"
      path="/slug-generator"
      title="Slug Generator: Turn Titles into Clean URLs | ToolNest"
      description="Convert any title into a clean URL slug: lowercase, hyphen separated, accents handled. Perfect for blogs, stores and docs. Free."
      h1="Slug Generator"
      intro="Turn any title or phrase into a clean, URL-friendly slug. Choose hyphens or underscores, keep or drop lowercase, and copy the result."
      faqs={FAQS}
      content={CONTENT}
    >
      <div className="field">
        <label htmlFor="slug-in">Title or phrase</label>
        <input
          id="slug-in"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. 10 Easy Ways to Bake Better Bread at Home!"
          autoFocus
        />
      </div>
      <div className="row">
        <div className="field">
          <label>Separator</label>
          <div className="checks">
            <label><input type="radio" name="slug-sep" checked={separator === '-'} onChange={() => setSeparator('-')} /> Hyphen (-)</label>
            <label><input type="radio" name="slug-sep" checked={separator === '_'} onChange={() => setSeparator('_')} /> Underscore (_)</label>
          </div>
        </div>
        <div className="field">
          <label>Letter case</label>
          <div className="checks">
            <label><input type="checkbox" checked={lower} onChange={(e) => setLower(e.target.checked)} /> Lowercase the slug</label>
          </div>
        </div>
      </div>
      <div className="field">
        <label htmlFor="slug-out">Your slug</label>
        <input id="slug-out" type="text" className="mono" value={slug} readOnly placeholder="your-slug-will-appear-here" aria-label="Generated slug" />
      </div>
      <div className="btn-row">
        <CopyButton text={slug} label="Copy slug" />
        <button type="button" className="btn ghost" onClick={() => setText('')} disabled={!text}>Clear</button>
      </div>
    </ToolLayout>
  );
}

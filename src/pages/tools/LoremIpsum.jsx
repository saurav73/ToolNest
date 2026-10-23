import React, { useCallback, useEffect, useState } from 'react';
import ToolLayout from '../../components/ToolLayout.jsx';
import CopyButton from '../../components/CopyButton.jsx';

const LOREM_WORDS = (
  'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor ' +
  'incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud ' +
  'exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute ' +
  'irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur ' +
  'excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt ' +
  'mollit anim id est laborum perspiciatis unde omnis iste natus error voluptatem ' +
  'accusantium doloremque laudantium totam rem aperiam eaque ipsa quae ab illo ' +
  'inventore veritatis quasi architecto beatae vitae dicta explicabo nemo enim ' +
  'ipsam voluptatem quia voluptas aspernatur odit fugit consequuntur magni dolores ' +
  'eos ratione sequi nesciunt neque porro quisquam dolorem numquam eius modi ' +
  'tempora incidunt magnam quaerat minima veniam nostrum exercitationem ullam ' +
  'corporis suscipit laboriosam nisi aliquid ex commodi consequatur autem vel eum ' +
  'iure quam nihil molestiae illum quo voluptas nulla pariatur at vero eos et ' +
  'accusamus dignissimos ducimus blanditiis praesentium voluptatum deleniti atque ' +
  'corrupti quos dolores quas molestias excepturi occaecati cupiditate provident'
).split(' ');

function pickWords(count, startClassic) {
  const out = [];
  let idx = Math.floor(Math.random() * LOREM_WORDS.length);
  if (startClassic) out.push('Lorem', 'ipsum', 'dolor', 'sit', 'amet,');
  while (out.length < count) {
    out.push(LOREM_WORDS[idx % LOREM_WORDS.length]);
    idx += 1 + Math.floor(Math.random() * 3);
  }
  return out.slice(0, count);
}

function makeSentence(wordCount, startClassic) {
  const words = pickWords(wordCount, startClassic);
  const joined = words.join(' ');
  return joined.charAt(0).toUpperCase() + joined.slice(1).replace(/,$/, '') + '.';
}

function generate(mode, amount, startClassic) {
  if (mode === 'words') {
    const words = pickWords(amount, startClassic);
    const joined = words.join(' ');
    return joined.charAt(0).toUpperCase() + joined.slice(1).replace(/,$/, '') + '.';
  }
  if (mode === 'sentences') {
    return Array.from({ length: amount }, (_, i) =>
      makeSentence(8 + Math.floor(Math.random() * 9), startClassic && i === 0)).join(' ');
  }
  return Array.from({ length: amount }, (_, p) => {
    const sentenceCount = 3 + Math.floor(Math.random() * 3);
    return Array.from({ length: sentenceCount }, (_, i) =>
      makeSentence(8 + Math.floor(Math.random() * 9), startClassic && p === 0 && i === 0)).join(' ');
  }).join('\n\n');
}

const FAQS = [
  {
    q: 'What is lorem ipsum?',
    a: 'Lorem ipsum is placeholder text used by designers and developers to show how a layout looks with real-looking copy before the final words exist. It is adapted from a classical Latin text by Cicero, scrambled so readers focus on the design instead of the meaning.',
  },
  {
    q: 'Why not just use real English as placeholder text?',
    a: 'Real copy distracts reviewers: they read the words instead of judging the layout, and they may treat draft text as final. Neutral placeholder text signals clearly that the words are temporary while still showing spacing, line length and typography realistically.',
  },
  {
    q: 'Can I use this text in a commercial project?',
    a: 'Yes. Lorem ipsum is centuries old and public domain. It is safe in mockups, templates and client presentations, though it should always be replaced with real copy before a design goes live.',
  },
  {
    q: 'Should lorem ipsum stay on my finished website?',
    a: 'Never. Search engines and visitors learn nothing from it, and leftover placeholder text is a classic launch mistake. Use it during design, then swap in real content before publishing.',
  },
];

const CONTENT = (
  <>
    <h2>Placeholder text for designs and mockups</h2>
    <p>
      Generate classic lorem ipsum by the paragraph, sentence or word, with an
      option to start with the traditional "Lorem ipsum dolor sit amet" opening.
      Designers use it to test layouts, developers use it to fill templates while
      building, and writers use it to hold space for copy that is still being
      written.
    </p>
    <h2>How much do you need?</h2>
    <ul>
      <li><strong>One paragraph</strong> fills a card, sidebar or short section.</li>
      <li><strong>Three to five paragraphs</strong> approximate a typical article or landing page body.</li>
      <li><strong>Words mode</strong> is handy for headlines, captions and button labels of an exact length.</li>
    </ul>
    <h2>How this generator builds the text</h2>
    <p>
      The generator works from a fixed bank of classical Latin words taken from the traditional lorem ipsum passage. When you ask for words, it picks a starting point in that bank and walks forward, skipping ahead by a small random step each time so consecutive runs do not look identical. For sentences, it groups those words into chunks of eight to sixteen words, capitalizes the first letter and adds a full stop. For paragraphs, it groups three to five sentences together and separates each paragraph with a blank line. If you tick the classic opening option, the very first words are forced to the familiar Lorem ipsum dolor sit amet opening before the random walk begins. Everything runs locally in your browser, so regenerating is instant and you can click Generate new text repeatedly until the shape of the copy suits your layout.
    </p>
    <h2>A worked example for a real layout</h2>
    <p>
      Imagine you are mocking up a three column pricing page. Each plan card needs a short description of roughly 25 words, a feature area that wraps to about four lines, and a longer explanation block below. Set the mode to Words and the amount to 25, then copy that block into the first card and regenerate twice for the other two so the cards do not repeat word for word. For the explanation block, switch to Paragraphs and generate two paragraphs, which will give you roughly 90 to 120 words in total, close to a typical short product summary. If a card still overflows, the problem is the layout, not the text, because real descriptions will vary just as much. That is exactly the stress test placeholder text is meant to provide before a client supplies final copy.
    </p>
    <h2>Practical tips for more realistic mockups</h2>
    <ul>
      <li><strong>Match the amount to the real content plan:</strong> if the final article is meant to be 800 words, test with roughly that much placeholder text, which is about nine to eleven paragraphs at the lengths this tool produces, rather than filling the page with two neat paragraphs that hide scrolling and spacing issues.</li>
      <li><strong>Test the extremes, not just the average:</strong> generate one very short block and one very long block for the same component. Headlines, cards and sidebars that only work at one perfect length will break the moment real editors write something shorter or longer.</li>
      <li><strong>Use words mode for interface text:</strong> buttons, labels, table cells and captions need exact counts. Generating 5, 10 or 15 words lets you check truncation, wrapping and ellipsis behavior in a way full paragraphs cannot.</li>
      <li><strong>Pair it with real headings and images:</strong> placeholder body text works best alongside the actual titles, photos and prices the page will carry, because contrast between finished and unfinished elements shows reviewers exactly what is still undecided.</li>
      <li><strong>Count before you hand off:</strong> if a designer or client gives you a word budget, paste your draft into the <a href="/word-counter">Word Counter</a> to compare its length with the placeholder you designed around.</li>
    </ul>
    <h2>Common mistakes to avoid</h2>
    <ul>
      <li><strong>Presenting lorem ipsum as if it were a draft:</strong> placeholder text shows shape, not quality. Stakeholders who approve a design full of Latin sometimes assume the writing is also nearly done, so label mockups clearly as layout only.</li>
      <li><strong>Using one identical paragraph everywhere:</strong> repeating the same block hides real design problems, especially rhythm, image alignment and how varied content lengths look side by side. Regenerate for each major block so every section has different sentence patterns.</li>
      <li><strong>Forgetting the mobile view:</strong> a paragraph that looks balanced on a wide desktop monitor can become a wall of text on a phone. Generate your text once, then check it at phone width before you call the layout finished.</li>
      <li><strong>Leaving placeholder text in templates and demos:</strong> demo sites, theme previews and staging links get indexed and shared. A quick search of your project for the word lorem before launch catches leftovers that everyone stopped seeing.</li>
      <li><strong>Choosing amounts at random:</strong> ten paragraphs for a testimonial or three words for a hero section teaches you nothing. Base the amount on the content you actually expect, even if that content is not written yet.</li>
    </ul>
  </>
);

export default function LoremIpsum() {
  const [mode, setMode] = useState('paragraphs');
  const [amount, setAmount] = useState(3);
  const [startClassic, setStartClassic] = useState(true);
  const [output, setOutput] = useState('');

  const regen = useCallback(() => {
    setOutput(generate(mode, amount, startClassic));
  }, [mode, amount, startClassic]);

  useEffect(() => { regen(); }, [regen]);

  return (
    <ToolLayout
      slug="lorem-ipsum-generator"
      path="/lorem-ipsum-generator"
      title="Lorem Ipsum Generator: Placeholder Text | ToolNest"
      description="Generate lorem ipsum placeholder text by paragraph, sentence or word for mockups and layouts. Free, instant, classic Latin text."
      h1="Lorem Ipsum Generator"
      intro="Generate classic lorem ipsum placeholder text by the paragraph, sentence or word, ready to drop into your designs and mockups."
      faqs={FAQS}
      content={CONTENT}
    >
      <div className="row">
        <div className="field">
          <label htmlFor="lorem-mode">Generate</label>
          <select id="lorem-mode" value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="paragraphs">Paragraphs</option>
            <option value="sentences">Sentences</option>
            <option value="words">Words</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="lorem-amount">How many {mode}</label>
          <input
            id="lorem-amount"
            type="text"
            inputMode="numeric"
            value={amount}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              setAmount(Number.isNaN(v) ? 1 : Math.min(Math.max(v, 1), mode === 'words' ? 1000 : 100));
            }}
            aria-label="Amount to generate"
          />
        </div>
      </div>
      <div className="checks" style={{ marginBottom: 16 }}>
        <label>
          <input type="checkbox" checked={startClassic} onChange={(e) => setStartClassic(e.target.checked)} />
          Start with "Lorem ipsum dolor sit amet"
        </label>
      </div>
      <textarea
        className="output"
        value={output}
        readOnly
        aria-label="Generated lorem ipsum"
        style={{ minHeight: 220 }}
      />
      <div className="btn-row">
        <button type="button" className="btn" onClick={regen}>Generate new text</button>
        <CopyButton text={output} className="btn secondary" />
      </div>
    </ToolLayout>
  );
}

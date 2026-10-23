import React, { useMemo, useState } from 'react';
import ToolLayout from '../../components/ToolLayout.jsx';
import CopyButton from '../../components/CopyButton.jsx';

const MODES = [
  { id: 'chars', label: 'Reverse characters', hint: 'The whole text backwards, letter by letter.' },
  { id: 'words', label: 'Reverse word order', hint: 'Words stay intact, their order flips.' },
  { id: 'eachWord', label: 'Reverse each word', hint: 'Every word is spelled backwards, order stays.' },
  { id: 'lines', label: 'Reverse line order', hint: 'The last line becomes the first.' },
];

function reverseText(text, mode) {
  if (!text) return '';
  switch (mode) {
    case 'chars': return [...text].reverse().join('');
    case 'words': return text.split(/\s+/).filter(Boolean).reverse().join(' ');
    case 'eachWord':
      return text.split(/(\s+)/).map((part) => (/^\s+$/.test(part) ? part : [...part].reverse().join(''))).join('');
    case 'lines': return text.split('\n').reverse().join('\n');
    default: return text;
  }
}

const FAQS = [
  {
    q: 'What is reversed text used for?',
    a: 'Reversed text shows up in puzzles, games and social posts, in testing how software handles right-to-left display, and as a quick check in programming when learning string manipulation. It is also a classic way to hide a spoiler or answer so it is not read accidentally.',
  },
  {
    q: 'What is the difference between reversing characters and reversing words?',
    a: 'Reversing characters flips every letter, turning "hello world" into "dlrow olleh". Reversing word order keeps each word intact and flips their sequence, giving "world hello". Reversing each word combines the two: letters flip inside each word but the words stay in place, giving "olleh dlrow".',
  },
  {
    q: 'Does it handle emoji and accented letters correctly?',
    a: 'Yes. Character reversal here works on proper Unicode characters rather than raw bytes, so accented letters and most emoji reverse as complete symbols instead of breaking into invalid characters.',
  },
  {
    q: 'Is reversed text the same as mirror text?',
    a: 'Not quite. Reversed text reads in the opposite order. Mirror text also flips each glyph horizontally, which needs special characters or fonts and will not survive copy and paste everywhere. This tool produces reversed text you can paste anywhere.',
  },
];

const CONTENT = (
  <>
    <h2>Flip text four different ways</h2>
    <p>
      One tool, four kinds of backwards: reverse every character, reverse the order
      of the words, reverse the letters inside each word, or reverse the order of
      the lines. Each mode updates live as you type, so you can compare results and
      copy the one you need.
    </p>
    <h2>Fun and practical uses</h2>
    <ul>
      <li>Hide answers and spoilers in posts so they take effort to read.</li>
      <li>Create puzzles, quizzes and scavenger-hunt clues.</li>
      <li>Test forms and apps with backwards input to see how they cope.</li>
      <li>Flip a list so the most recent entries, logged at the bottom, come first.</li>
    </ul>
    <h2>How the reverser works under the hood</h2>
    <p>
      Each mode rearranges your text at a different level. Character reversal first
      splits the text into complete Unicode characters rather than raw bytes, which
      is why accented letters and most emoji survive the flip instead of breaking
      into invalid symbols, then reverses that sequence and joins it back together.
      Word order reversal splits the text wherever it finds spaces, discards the
      empty pieces, reverses the list of words and rejoins them with single spaces,
      so every word keeps its original spelling. Reverse each word takes the
      opposite approach: it splits the text into alternating chunks of words and
      whitespace, flips the letters inside each word chunk, and leaves the
      whitespace, and therefore the layout, exactly where it was. Line reversal
      splits the text at each line break and reverses the stack, so the last line
      moves to the top while every line stays internally unchanged. All four modes
      run in your browser and recalculate on every keystroke, so switching modes
      lets you compare four different kinds of backwards from the same input
      instantly.
    </p>
    <h2>A worked example</h2>
    <p>
      Take the short sentence "Meet at noon." and run it through each mode.
      Reversing the characters gives ".noon ta teeM", where even the period travels
      to the front. Reversing the word order gives "noon. at Meet", keeping every
      word readable but flipping the sequence, with the period travelling along
      with the word it was attached to. Reversing each word gives "teeM ta
      .noon", with the letters flipped inside each word and the words left in
      place. Line mode needs more than one line to show its effect: if "alpha"
      sits on the first line and "beta" on the second, line reversal puts "beta"
      first and "alpha" second, untouched. Notice that "noon" reads the same
      forwards and backwards, which makes inputs containing palindromes like that
      a quick way to check you picked the mode you intended.
    </p>
    <h2>Tips for getting better results</h2>
    <ul>
      <li><strong>Match the mode to the job:</strong> use line order for logs, playlists and lists, word order for playful sentence twists, and character reversal only for short strings, since long backwards prose is genuinely hard to read.</li>
      <li><strong>Reverse twice to decode:</strong> reversal is its own undo, so pasting reversed text back into the same mode restores the original exactly, which is how readers solve the clues and spoilers you hide.</li>
      <li><strong>Clean a list after flipping it:</strong> once line mode brings the newest entries to the top, run the result through <a href="/remove-duplicate-lines">Remove Duplicate Lines</a> if repeated entries crept in while the list was growing.</li>
      <li><strong>Test unusual characters first:</strong> if your text mixes accented letters, symbols or emoji, reverse a short sample and inspect it before you process a long passage you care about.</li>
    </ul>
    <h2>Common mistakes to avoid</h2>
    <ul>
      <li><strong>Treating reversal as security:</strong> reversed text is not encryption, and anyone can flip it back in seconds with this same tool, so never use it to protect passwords, codes or private information.</li>
      <li><strong>Expecting punctuation to stay put:</strong> punctuation is part of the word chunk it touches, so "hello," reversed letter by letter inside the word becomes ",olleh"; remove punctuation first if you need clean flipped words.</li>
      <li><strong>Losing your layout in word order mode:</strong> that mode rejoins words with single spaces, so paragraph breaks and double spaces in the original are flattened; use each word mode when the original spacing matters.</li>
      <li><strong>Confusing reversed with mirrored text:</strong> a true mirror image needs flipped letter shapes, which plain text cannot carry, so do not expect this output to read correctly when held up to a mirror.</li>
    </ul>
  </>
);

export default function TextReverser() {
  const [text, setText] = useState('');
  const [mode, setMode] = useState('chars');
  const output = useMemo(() => reverseText(text, mode), [text, mode]);
  const active = MODES.find((m) => m.id === mode);

  return (
    <ToolLayout
      slug="text-reverser"
      path="/text-reverser"
      title="Text Reverser: Reverse Characters or Words | ToolNest"
      description="Reverse text by characters, word order, each word or line order. Live results, Unicode safe, free and private in your browser."
      h1="Text Reverser"
      intro="Reverse your text four ways: every character, the word order, the letters in each word, or the line order. Results update as you type."
      faqs={FAQS}
      content={CONTENT}
    >
      <div className="field">
        <label htmlFor="rev-mode">Reversal mode</label>
        <select id="rev-mode" value={mode} onChange={(e) => setMode(e.target.value)}>
          {MODES.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
        <p className="hint" style={{ marginTop: 6 }}>{active.hint}</p>
      </div>
      <div className="split">
        <div className="field">
          <label htmlFor="rev-in">Your text</label>
          <textarea
            id="rev-in"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste text to reverse..."
            aria-label="Text to reverse"
            autoFocus
          />
        </div>
        <div className="field">
          <label htmlFor="rev-out">Reversed</label>
          <textarea
            id="rev-out"
            className="output"
            value={output}
            readOnly
            placeholder="Reversed text will appear here..."
            aria-label="Reversed text"
          />
        </div>
      </div>
      <div className="btn-row">
        <CopyButton text={output} label="Copy reversed text" />
        <button type="button" className="btn ghost" onClick={() => setText('')} disabled={!text}>Clear</button>
      </div>
    </ToolLayout>
  );
}

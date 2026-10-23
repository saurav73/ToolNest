import React, { useEffect, useMemo, useState } from 'react';
import ToolLayout from '../../components/ToolLayout.jsx';
import CopyButton from '../../components/CopyButton.jsx';
import {
  tokenizeWords, countSentences, countParagraphs, topKeywords, formatDuration,
  totalSyllables, fleschReadingEase, fleschKincaidGrade, readingEaseLabel,
} from '../../lib/text.js';

const FAQS = [
  {
    q: 'How is reading time calculated?',
    a: 'Reading time uses an average silent reading speed of 200 words per minute, which is in the middle of the 180 to 250 range found in reading research. A 1,000 word article therefore takes about 5 minutes to read. Speaking time uses 130 words per minute, a comfortable pace for presentations and narration.',
  },
  {
    q: 'How does the word counter count words?',
    a: 'A word is any run of letters or numbers, with apostrophes kept inside words like "don\'t". Hyphenated words such as "well-known" count as two words, matching how most editors and assignment briefs count them. Numbers count as words too.',
  },
  {
    q: 'What is keyword density and why does it matter?',
    a: 'Keyword density is how often a word appears as a percentage of the total words. Writers and SEO specialists watch it to make sure an important term appears often enough to be noticed, but not so often that the text reads unnaturally. The table shows your top 10 keywords with common filler words removed.',
  },
  {
    q: 'What do the readability scores mean?',
    a: 'Reading ease runs from 0 to 100, where higher means easier to read. Web writing usually lands between 60 and 70, which this counter labels "Standard". The grade level is the US school grade the text reads at: a grade of 8 means an average eighth grader can read it comfortably. Both are estimated from average sentence length and syllables per word using the Flesch formulas.',
  },
  {
    q: 'Is my text saved or uploaded anywhere?',
    a: 'No. The counter runs entirely in your browser. Your text is never sent to a server, and your draft is stored only in this browser on your own device so you can resume later.',
  },
];

const CONTENT = (
  <>
    <h2>What this word counter does</h2>
    <p>
      Paste or type any text and this counter instantly reports the details writers
      actually need: total words, characters with and without spaces, sentences,
      paragraphs, estimated reading time and speaking time, the average word
      length, and two readability scores, the Flesch reading ease and the
      Flesch-Kincaid grade level. Below the counts, the keyword density table
      shows your 10 most used meaningful words, so you can spot repetition and
      check that your key terms get the attention they deserve. Your draft is
      saved automatically in your browser only, so closing the tab never loses it.
    </p>
    <h2>Who uses a word counter?</h2>
    <ul>
      <li><strong>Students</strong> checking essay and assignment lengths against a brief.</li>
      <li><strong>Bloggers and SEO writers</strong> balancing article length and keyword use.</li>
      <li><strong>Speakers and presenters</strong> timing a script with the speaking time estimate.</li>
      <li><strong>Authors</strong> tracking daily progress on chapters and manuscripts.</li>
      <li><strong>Job applicants</strong> keeping cover letters and personal statements inside limits.</li>
    </ul>
    <h2>How long should your text be?</h2>
    <p>
      Common reference points: a typical blog post runs 1,000 to 2,000 words, a
      college essay 500 to 650 words, a cover letter 250 to 400 words, and a
      five-minute speech about 650 words. Tweets and posts have character limits
      instead, and our <a href="/character-counter">Character Counter</a> includes
      quick checks for those.
    </p>
    <h2>How the counter works under the hood</h2>
    <p>
      As soon as you type or paste, the counter scans the whole text in your browser
      and rebuilds every statistic from scratch. It splits the text into words by
      looking for runs of letters and numbers, keeping apostrophes inside a word so
      a contraction counts as one item. Sentences are detected from ending
      punctuation such as periods, question marks and exclamation marks, and
      paragraphs come from the blank lines between blocks of text. Reading time and
      speaking time are simple divisions of the word total by an average speed, and
      the keyword table counts how often each meaningful word occurs, then converts
      that count into a percentage of the whole text. Because the calculation
      repeats on every keystroke, the numbers always describe the exact text in the
      box, with no button to press and no page to reload. That instant feedback is
      what makes the counter useful while you are still drafting: delete a sentence
      and watch the reading time drop, or paste a new introduction and see straight
      away whether a key term has started to dominate the keyword table.
    </p>
    <h2>A worked example</h2>
    <p>
      Suppose you paste a blog draft of 1,240 words, with 6,830 characters including
      spaces and 5,590 characters once spaces are removed. The counter reports about
      6 minutes of reading time and roughly 9 and a half minutes of speaking time,
      because spoken delivery is slower than silent reading. If the draft contains
      58 sentences, the average sentence holds just over 21 words, which is readable
      but worth scanning for a few long sentences you could split. If your main
      keyword appears 18 times, its density is about 1.5 percent, a natural level
      for a focused article. Numbers like these turn a vague feeling that a draft is
      too long into a specific editing decision.
    </p>
    <h2>Tips for getting better results</h2>
    <ul>
      <li><strong>Count the final version, not the draft:</strong> headings, captions and lists added at the end all count toward a limit, so run the complete text through the counter before you submit or publish anything.</li>
      <li><strong>Watch the average word length:</strong> a rising average often signals that jargon is creeping in, and swapping a few long technical terms for plain words makes the same word count far easier to read.</li>
      <li><strong>Check one section at a time:</strong> paste your introduction, body and conclusion separately to see where the words actually sit, which makes it easier to rebalance a piece that is top heavy or thin at the end.</li>
      <li><strong>Aim for a reading ease of 60 to 70:</strong> most web writing scores "Standard" in that band, and splitting long sentences or swapping a few heavy words for plain ones raises the score without changing your word count.</li>
      <li><strong>Use speaking time early for scripts:</strong> if a talk or video has a fixed slot, draft to the speaking estimate from the start instead of cutting a finished script down under time pressure later on.</li>
    </ul>
    <h2>Common mistakes to avoid</h2>
    <ul>
      <li><strong>Trusting a pasted total blindly:</strong> a document copied from elsewhere can include headers, footers or a reference list that inflates the count, so remove anything the limit does not cover before judging the total.</li>
      <li><strong>Padding to reach a target:</strong> filler sentences weaken writing, and readers notice repetition quickly, especially when the keyword table shows one phrase climbing fast.</li>
      <li><strong>Ignoring sentence length:</strong> two texts with the same word count can feel completely different, and a draft built from very long sentences tires readers even when the total looks perfect.</li>
      <li><strong>Mixing up units:</strong> some briefs limit characters rather than words, so check which unit is being asked for before you start cutting the wrong thing.</li>
    </ul>
  </>
);

export default function WordCounter() {
  const [text, setText] = useState(() => {
    try {
      return localStorage.getItem('toolnest:word-counter') || '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem('toolnest:word-counter', text);
      } catch {
        /* storage full or unavailable; counting still works */
      }
    }, 300);
    return () => clearTimeout(t);
  }, [text]);

  const stats = useMemo(() => {
    const words = tokenizeWords(text);
    const wordCount = words.length;
    const sentences = countSentences(text);
    const syllables = totalSyllables(words);
    const ease = fleschReadingEase(wordCount, sentences, syllables);
    const grade = fleschKincaidGrade(wordCount, sentences, syllables);
    return {
      words: wordCount,
      chars: text.length,
      charsNoSpaces: text.replace(/\s/g, '').length,
      sentences,
      paragraphs: countParagraphs(text),
      readingSecs: wordCount ? (wordCount / 200) * 60 : 0,
      speakingSecs: wordCount ? (wordCount / 130) * 60 : 0,
      avgWordLen: wordCount ? (words.join('').length / wordCount).toFixed(1) : '0.0',
      readingEase: ease == null ? 'N/A' : Math.round(ease),
      easeLabel: readingEaseLabel(ease),
      gradeLevel: grade == null ? 'N/A' : grade.toFixed(1),
      keywords: topKeywords(words, wordCount, 10),
    };
  }, [text]);

  const summary = `Words: ${stats.words}\nCharacters: ${stats.chars}\nSentences: ${stats.sentences}\nParagraphs: ${stats.paragraphs}\nReading time: ${formatDuration(stats.readingSecs)}\nSpeaking time: ${formatDuration(stats.speakingSecs)}\nReading ease: ${stats.readingEase}${stats.easeLabel ? ` (${stats.easeLabel})` : ''}\nGrade level: ${stats.gradeLevel}`;

  return (
    <ToolLayout
      slug="word-counter"
      path="/word-counter"
      title="Free Word Counter + Readability Score Online | ToolNest"
      description="Count words, sentences and characters free online, with keyword density and readability scores. No sign-up, private in-browser tool."
      h1="Word Counter"
      intro="Count words online free as you type: characters, sentences, paragraphs, reading and speaking time, readability scores and keyword density. Completely private: your text never leaves your browser."
      faqs={FAQS}
      content={CONTENT}
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste or type your text here..."
        aria-label="Text to count"
        autoFocus
      />
      <div className="stat-grid">
        <div className="stat"><div className="num">{stats.words}</div><div className="lbl">Words</div></div>
        <div className="stat"><div className="num">{stats.chars}</div><div className="lbl">Characters</div></div>
        <div className="stat"><div className="num">{stats.charsNoSpaces}</div><div className="lbl">Characters (no spaces)</div></div>
        <div className="stat"><div className="num">{stats.sentences}</div><div className="lbl">Sentences</div></div>
        <div className="stat"><div className="num">{stats.paragraphs}</div><div className="lbl">Paragraphs</div></div>
        <div className="stat"><div className="num">{formatDuration(stats.readingSecs)}</div><div className="lbl">Reading time</div></div>
        <div className="stat"><div className="num">{formatDuration(stats.speakingSecs)}</div><div className="lbl">Speaking time</div></div>
        <div className="stat"><div className="num">{stats.avgWordLen}</div><div className="lbl">Avg. word length</div></div>
        <div className="stat"><div className="num" title={stats.easeLabel}>{stats.readingEase}</div><div className="lbl">Reading ease</div></div>
        <div className="stat"><div className="num">{stats.gradeLevel}</div><div className="lbl">Grade level</div></div>
      </div>
      <div className="btn-row">
        <CopyButton text={summary} label="Copy summary" />
        <button type="button" className="btn ghost" onClick={() => setText('')} disabled={!text}>Clear text</button>
      </div>

      {stats.keywords.length > 0 && (
        <>
          <h3 style={{ marginTop: 24 }}>Keyword density: your top 10 words</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Keyword</th><th className="num">Count</th><th className="num">Density</th></tr>
              </thead>
              <tbody>
                {stats.keywords.map((k) => (
                  <tr key={k.word}>
                    <td>{k.word}</td>
                    <td className="num">{k.count}</td>
                    <td className="num">{k.density.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </ToolLayout>
  );
}

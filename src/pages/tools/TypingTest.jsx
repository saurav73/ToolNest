import React, { useEffect, useMemo, useRef, useState } from 'react';
import ToolLayout from '../../components/ToolLayout.jsx';

const SAMPLES = [
  'The quick brown fox jumps over the lazy dog while the sun rises over the quiet hills. Typing well is a skill built one accurate keystroke at a time, and speed follows naturally when your fingers learn to trust the keys.',
  'A journey of a thousand miles begins with a single step. Practice a little every day and small gains compound into real speed. Focus on accuracy first, because correcting mistakes costs far more time than typing a little slower.',
  'Technology works best when it stays out of the way. The same is true of typing: when the keyboard disappears from your attention, your thoughts flow straight onto the screen. That fluency is what this test measures in words per minute.',
  'Good writing is rewriting, and good typing is mostly about rhythm. Keep a steady pace, glance ahead to the next words, and let your hands settle into the pattern. Your score improves fastest when you stay relaxed and consistent.',
];

const FAQS = [
  {
    q: 'How is words per minute (WPM) calculated?',
    a: 'The standard formula divides the number of correctly typed characters by five (the conventional average word length, including spaces), then divides by the time in minutes. This test times you for 60 seconds, so WPM is simply your correct characters divided by five at the finish.',
  },
  {
    q: 'What is a good typing speed?',
    a: 'The average person types around 40 WPM. Office and data-entry work usually expects 50 to 70 WPM, professional typists exceed 80, and competitive typists pass 120. Accuracy matters as much as raw speed: 95 percent or better is a healthy target.',
  },
  {
    q: 'How can I type faster?',
    a: 'Use all ten fingers with the standard home-row position, look at the screen rather than the keys, and practice for ten focused minutes a day. Most people gain speed fastest by slowing down slightly to fix accuracy first, because backspacing constantly is what really drags a score down.',
  },
  {
    q: 'Why does the timer start on my first keystroke?',
    a: 'So you can read the opening words and get your hands in position without the clock running. The 60 seconds begin the moment you type the first character, and the test ends automatically when time runs out or you finish the passage.',
  },
];

const CONTENT = (
  <>
    <h2>How fast do you really type?</h2>
    <p>
      Click into the box, start typing the passage, and the clock begins on your
      first keystroke. Correct characters turn green, mistakes turn red, and after
      60 seconds you get your words per minute, accuracy and character counts.
      Retake with a fresh passage as often as you like.
    </p>
    <h2>Reading your results</h2>
    <ul>
      <li><strong>WPM</strong> uses only correct characters, so wild speed with many errors scores honestly low.</li>
      <li><strong>Accuracy</strong> above 95 percent is solid; below 90 percent, slow down and rebuild precision.</li>
      <li>Compare your scores week to week rather than test to test; passages vary a little in difficulty.</li>
    </ul>
    <h2>How this typing test measures you</h2>
    <p>
      The test compares every character you type with the same position in the passage, in real time. A character that matches turns green, a mismatch turns red, and the current position is highlighted so you always know where you are. The clock starts on your first keystroke and counts down from 60 seconds, updating once per second. At the end, the score is calculated from correct characters only: that count is divided by five, the standard length used to define a word in typing tests, and then scaled to a full minute. Accuracy is simply correct characters divided by total characters typed, shown as a percentage. Because wrong characters earn no credit, typing wildly and hoping is always slower in score terms than typing steadily and getting the letters right.
    </p>
    <h2>A worked example with real numbers</h2>
    <p>
      Suppose you finish the 60 seconds having typed 340 characters. Of those, 323 match the passage and 17 are errors. Your accuracy is 323 divided by 340, which is 95 percent. Your words per minute is 323 divided by 5, which is 64.6, rounded to 65 WPM. Compare a faster but sloppier attempt: 390 characters typed, but only 330 correct. Accuracy falls to about 85 percent, and the score is 330 divided by 5, which is 66 WPM, barely higher despite 50 extra keystrokes. The second typist worked much harder for almost no gain, and in real writing those 60 errors would each need correcting. Fix accuracy first and speed follows.
    </p>
    <h2>Practical tips for a better score</h2>
    <ul>
      <li><strong>Read three or four words ahead:</strong> your eyes should be slightly in front of your fingers. Looking at the word you are currently typing forces stop and start rhythm, while scanning ahead lets your hands prepare the next pattern and keeps the pace smooth.</li>
      <li><strong>Keep a steady rhythm instead of bursts:</strong> sprinting through easy words and stalling on hard ones wastes more time than a consistent pace. If a word trips you, finish it slowly and correctly rather than mashing keys and repairing the damage.</li>
      <li><strong>Warm up with a repeat:</strong> use Retry this passage for your first attempt of the day, then switch to New passage for a true measure. Familiar text inflates scores, so your honest benchmark is always a passage you have not just practiced.</li>
      <li><strong>Fix your weakest letters deliberately:</strong> after a test, note which characters turned red most often. Ten minutes of slow practice focused on just those keys usually lifts accuracy more than another ten full speed tests.</li>
      <li><strong>Sit and position properly:</strong> screen at eye level, wrists floating rather than resting heavily, and feet flat. A cramped posture shows up as late test errors long before early ones.</li>
    </ul>
    <h2>Common mistakes to avoid</h2>
    <ul>
      <li><strong>Backspacing through whole words:</strong> in this test, time keeps running while you correct, and in real work the habit breaks your train of thought. Unless a mistake changes meaning, many typists gain speed by noting it and moving on during timed practice.</li>
      <li><strong>Looking down at the keyboard:</strong> every glance down costs a fraction of a second to find your place again on screen. Covering your hands or using a keyboard without printed legends for a few practice sessions breaks the habit faster than willpower alone.</li>
      <li><strong>Chasing a single best score:</strong> one 70 WPM run among five 55 WPM runs means you type at about 55 to 60 WPM in practice. Track your weekly average instead.</li>
      <li><strong>Practicing only when fresh:</strong> jobs and exams do not always happen at your peak. Occasionally test at the end of a workday to see your working speed.</li>
      <li><strong>Ignoring the space bar:</strong> a surprising share of errors are missed or doubled spaces, often from a thumb that hovers too far from the key. Slow down specifically at word boundaries for one test and watch how many red marks disappear. For longer writing after your test, the <a href="/word-counter">Word Counter</a> helps you check the length of what you produced.</li>
    </ul>
  </>
);

const DURATION = 60;

export default function TypingTest() {
  const [sampleIdx, setSampleIdx] = useState(0);
  const sample = SAMPLES[sampleIdx];
  const [typed, setTyped] = useState('');
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  const stats = useMemo(() => {
    let correct = 0;
    for (let i = 0; i < typed.length; i += 1) {
      if (typed[i] === sample[i]) correct += 1;
    }
    return {
      correct,
      incorrect: typed.length - correct,
      accuracy: typed.length ? (correct / typed.length) * 100 : 100,
    };
  }, [typed, sample]);

  const finalWpm = useMemo(() => {
    const elapsed = DURATION - timeLeft;
    if (!elapsed) return 0;
    return Math.round(stats.correct / 5 / (elapsed / 60));
  }, [stats.correct, timeLeft]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const finish = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRunning(false);
    setFinished(true);
  };

  const startTimer = () => {
    setRunning(true);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const onChange = (e) => {
    if (finished) return;
    const value = e.target.value.slice(0, sample.length);
    if (!running && value.length === 1) startTimer();
    setTyped(value);
    if (value.length >= sample.length) finish();
  };

  const restart = (newSample) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (newSample) setSampleIdx((i) => (i + 1) % SAMPLES.length);
    setTyped('');
    setTimeLeft(DURATION);
    setRunning(false);
    setFinished(false);
    setTimeout(() => inputRef.current && inputRef.current.focus(), 0);
  };

  const chars = useMemo(() => sample.split('').map((ch, i) => {
    let cls = '';
    if (i < typed.length) cls = typed[i] === ch ? 'ok' : 'bad';
    else if (i === typed.length && !finished) cls = 'current';
    return (
      <span key={i} className={cls}>{ch}</span>
    );
  }), [sample, typed, finished]);

  return (
    <ToolLayout
      slug="typing-speed-test"
      path="/typing-speed-test"
      title="Typing Speed Test: Check Your WPM in 60 Seconds | ToolNest"
      description="Free 60 second typing test with live WPM, accuracy and character counts. Fresh passages, instant results, no sign-up."
      h1="Typing Speed Test"
      intro="Type the passage below and find your words per minute in 60 seconds, with live accuracy feedback as you go. The clock starts on your first keystroke."
      faqs={FAQS}
      content={CONTENT}
    >
      <div className="stat-grid" style={{ marginTop: 0 }}>
        <div className="stat"><div className="num">{timeLeft}s</div><div className="lbl">Time left</div></div>
        <div className="stat"><div className="num">{finished ? finalWpm : Math.round(stats.correct / 5 / Math.max((DURATION - timeLeft) / 60, 1 / 60) || 0)}</div><div className="lbl">Words per minute</div></div>
        <div className="stat"><div className="num">{stats.accuracy.toFixed(0)}%</div><div className="lbl">Accuracy</div></div>
        <div className="stat"><div className="num">{stats.correct} / {typed.length}</div><div className="lbl">Correct / typed characters</div></div>
      </div>

      <div className="typing-text" aria-label="Passage to type">{chars}</div>

      <div className="field" style={{ marginTop: 14 }}>
        <label htmlFor="typing-in">Type here</label>
        <textarea
          id="typing-in"
          ref={inputRef}
          value={typed}
          onChange={onChange}
          onPaste={(e) => e.preventDefault()}
          placeholder={finished ? 'Test finished. Restart to try again.' : 'Start typing the passage above...'}
          disabled={finished}
          rows={3}
          style={{ minHeight: 90 }}
          autoFocus
        />
      </div>

      {finished && (
        <div className="message ok">
          Test complete: <strong>{finalWpm} WPM</strong> with <strong>{stats.accuracy.toFixed(1)}% accuracy</strong>.
          {' '}You typed {stats.correct} correct characters and {stats.incorrect} incorrect ones.
        </div>
      )}

      <div className="btn-row">
        <button type="button" className="btn" onClick={() => restart(true)}>New passage</button>
        <button type="button" className="btn secondary" onClick={() => restart(false)}>Retry this passage</button>
      </div>
    </ToolLayout>
  );
}

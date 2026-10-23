import React, { useEffect, useMemo, useRef, useState } from 'react';
import ToolLayout from '../../components/ToolLayout.jsx';

/* ------------------------------------------------------------------ */
/* Text corpora (kept in this file so the tool is fully self-contained) */
/* ------------------------------------------------------------------ */

// 200+ high-frequency English words used for the Common words mode.
const COMMON_WORDS = [
  'the', 'of', 'and', 'a', 'to', 'in', 'is', 'you', 'that', 'it',
  'he', 'was', 'for', 'on', 'are', 'as', 'with', 'his', 'they', 'at',
  'be', 'this', 'have', 'from', 'or', 'one', 'had', 'by', 'word', 'but',
  'not', 'what', 'all', 'were', 'we', 'when', 'your', 'can', 'said', 'there',
  'use', 'an', 'each', 'which', 'she', 'do', 'how', 'their', 'will', 'up',
  'other', 'about', 'out', 'many', 'then', 'them', 'these', 'so', 'some', 'her',
  'would', 'make', 'like', 'him', 'into', 'time', 'has', 'look', 'two', 'more',
  'write', 'go', 'see', 'number', 'no', 'way', 'could', 'people', 'my', 'than',
  'first', 'water', 'been', 'call', 'who', 'oil', 'its', 'now', 'find', 'long',
  'down', 'day', 'did', 'get', 'come', 'made', 'may', 'part', 'over', 'new',
  'sound', 'take', 'only', 'little', 'work', 'know', 'place', 'year', 'live', 'me',
  'back', 'give', 'most', 'very', 'after', 'thing', 'our', 'just', 'name', 'good',
  'sentence', 'man', 'think', 'say', 'great', 'where', 'help', 'through', 'much', 'before',
  'line', 'right', 'too', 'mean', 'old', 'any', 'same', 'tell', 'boy', 'follow',
  'came', 'want', 'show', 'also', 'around', 'form', 'three', 'small', 'set', 'put',
  'end', 'does', 'another', 'well', 'large', 'must', 'big', 'even', 'such', 'because',
  'turn', 'here', 'why', 'ask', 'went', 'men', 'read', 'need', 'land', 'different',
  'home', 'us', 'move', 'try', 'kind', 'hand', 'picture', 'again', 'change', 'off',
  'play', 'spell', 'air', 'away', 'animal', 'house', 'point', 'page', 'letter', 'mother',
  'answer', 'found', 'study', 'still', 'learn', 'should', 'world', 'high', 'every', 'near',
  'add', 'food', 'between', 'own', 'below', 'country', 'plant', 'last', 'school', 'father',
  'keep', 'tree', 'never', 'start', 'city', 'earth', 'eye', 'light', 'thought', 'head',
  'under', 'story', 'saw', 'left', 'few', 'while', 'along', 'might', 'close', 'something',
  'seem', 'next', 'hard', 'open', 'example', 'begin', 'life', 'always', 'those', 'both',
  'paper', 'together', 'got', 'group', 'often', 'run', 'dog', 'horse', 'cat', 'five',
];

// Practice sentences plus short public-domain quotes. `source` is the person a
// quote is attributed to, or null for a generic practice sentence written for
// this tool. Sources are shown under the passage so quotes stay attributed.
const SENTENCES = [
  { text: 'The quick brown fox jumps over the lazy dog while the sun rises over the quiet hills and the birds begin to sing.', source: null },
  { text: 'A journey of a thousand miles begins with a single step.', source: 'Lao Tzu' },
  { text: 'Early to bed and early to rise makes a man healthy, wealthy, and wise.', source: 'Benjamin Franklin' },
  { text: 'It does not matter how slowly you go as long as you do not stop.', source: 'Confucius' },
  { text: 'The secret of getting ahead is getting started.', source: 'Mark Twain' },
  { text: 'Believe you can and you are halfway there.', source: 'Theodore Roosevelt' },
  { text: 'Learning never exhausts the mind.', source: 'Leonardo da Vinci' },
  { text: 'Whatever you are, be a good one.', source: 'Abraham Lincoln' },
  { text: 'Honesty is the best policy.', source: null },
  { text: 'Good typing is mostly about rhythm, steady hands, and looking a little ahead of the word your fingers are finishing.', source: null },
  { text: 'Technology works best when it stays out of the way and lets your thoughts flow straight onto the screen without friction.', source: null },
  { text: 'The library was quiet except for the soft sound of turning pages and a clock ticking somewhere near the tall windows.', source: null },
  { text: 'She packed a notebook, a bottle of water, and a folded map before setting out on the long trail at dawn.', source: null },
  { text: 'A steady pace beats a frantic sprint whenever the work is long and accuracy matters more than speed.', source: null },
  { text: 'When the rain finally stopped, the streets shone under the evening lamps and people came outside to walk again.', source: null },
  { text: 'The committee met on Tuesday to review the budget, question the largest costs, and agree on a plan for the spring.', source: null },
  { text: 'Fresh bread, ripe tomatoes, and a pot of strong tea waited on the table when the travellers reached the farmhouse.', source: null },
];

const TIME_OPTIONS = [15, 30, 60, 120];
const WORD_OPTIONS = [10, 25, 50];
const TEXT_TYPES = [
  { id: 'words', label: 'Common words' },
  { id: 'sentences', label: 'Sentences and quotes' },
  { id: 'numbers', label: 'Numbers' },
  { id: 'custom', label: 'Custom text' },
];
const MIN_CUSTOM_CHARS = 25;
const MAX_CUSTOM_CHARS = 2000;
// Tokens generated for a timed test: enough that even a fast typist on the
// longest (120 second) test is very unlikely to run out of text.
const TIMED_TOKENS = 260;

/* ------------------------- passage builders ------------------------ */

// Deterministic PRNG, used only for the very first passage so the prerendered
// HTML and the first client render agree exactly (no hydration mismatch).
// Every later passage is generated from a user action with Math.random.
function mulberry32(seed) {
  let a = seed;
  return function next() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(rand, arr) {
  return arr[Math.floor(rand() * arr.length)];
}

function stripPunctuation(text) {
  return text.replace(/[.,;:!?"'()]/g, '').replace(/\s+/g, ' ').trim();
}

function buildWordsText(rand, count, punctuation) {
  const words = [];
  for (let i = 0; i < count; i += 1) words.push(pick(rand, COMMON_WORDS));
  if (!punctuation) return words.join(' ');
  const out = [];
  let sinceStart = 0;
  let sentenceLen = 7 + Math.floor(rand() * 7);
  words.forEach((w, idx) => {
    let word = w;
    if (sinceStart === 0) word = word.charAt(0).toUpperCase() + word.slice(1);
    const isLast = idx === words.length - 1;
    if (isLast || sinceStart >= sentenceLen - 1) {
      word += '.';
      sinceStart = 0;
      sentenceLen = 7 + Math.floor(rand() * 7);
    } else {
      if (rand() < 0.08) word += ',';
      sinceStart += 1;
    }
    out.push(word);
  });
  return out.join(' ');
}

function formatInt(n, punctuation) {
  if (!punctuation) return String(n);
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Number passages are generated procedurally: a mix of short numbers, years,
// and (when punctuation is on) decimals and comma-grouped thousands.
function buildNumbersText(rand, count, punctuation) {
  const tokens = [];
  for (let i = 0; i < count; i += 1) {
    const r = rand();
    let tok;
    if (r < 0.18) tok = String(Math.floor(rand() * 10));
    else if (r < 0.42) tok = String(10 + Math.floor(rand() * 90));
    else if (r < 0.62) tok = String(100 + Math.floor(rand() * 900));
    else if (r < 0.76) tok = String(1970 + Math.floor(rand() * 56));
    else if (r < 0.88 && punctuation) tok = (rand() * 100).toFixed(rand() < 0.5 ? 1 : 2);
    else tok = formatInt(1000 + Math.floor(rand() * 98999), punctuation);
    tokens.push(tok);
  }
  return tokens.join(' ');
}

function buildSentencesText(rand, { punctuation, targetWords = null, targetChars = null }) {
  const sources = [];
  const chunks = [];
  let wordCount = 0;
  let charCount = 0;
  let guard = 0;
  while (guard < 300) {
    guard += 1;
    const s = pick(rand, SENTENCES);
    let text = punctuation ? s.text : stripPunctuation(s.text).toLowerCase();
    let words = text.split(/\s+/).filter(Boolean);
    if (targetWords) {
      const remaining = targetWords - wordCount;
      if (words.length > remaining) {
        words = words.slice(0, remaining);
        text = words.join(' ');
      }
    }
    if (!text) continue;
    chunks.push(text);
    if (s.source && !sources.includes(s.source)) sources.push(s.source);
    wordCount += words.length;
    charCount += text.length + 1;
    if (targetWords && wordCount >= targetWords) break;
    if (targetChars && charCount >= targetChars) break;
    if (!targetWords && !targetChars) break;
  }
  return { text: chunks.join(' '), sources };
}

// settings: { kind: 'time' | 'words', value, textType, punctuation, customText }
function buildPassage(settings, rand) {
  const { kind, value, textType, punctuation, customText } = settings;
  if (textType === 'custom') {
    return customText ? { text: customText, sources: [] } : { text: '', sources: [] };
  }
  if (textType === 'words') {
    return { text: buildWordsText(rand, kind === 'words' ? value : TIMED_TOKENS, punctuation), sources: [] };
  }
  if (textType === 'numbers') {
    return { text: buildNumbersText(rand, kind === 'words' ? value : TIMED_TOKENS, punctuation), sources: [] };
  }
  if (kind === 'words') return buildSentencesText(rand, { punctuation, targetWords: value });
  return buildSentencesText(rand, { punctuation, targetChars: 1500 });
}

// Consistency: 100 minus the coefficient of variation (percent) of the
// per-second typing speeds sampled while the test ran. Needs at least three
// full one-second samples, otherwise there is nothing honest to report.
function consistencyFromSamples(samples) {
  if (!samples || samples.length < 3) return null;
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  if (mean <= 0) return null;
  const variance = samples.reduce((a, b) => a + (b - mean) * (b - mean), 0) / samples.length;
  const sd = Math.sqrt(variance);
  return Math.max(0, Math.min(100, Math.round(100 - (sd / mean) * 100)));
}

function formatClock(ms) {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`;
}

const FAQS = [
  {
    q: 'How is words per minute (WPM) calculated?',
    a: 'The standard formula divides the number of correctly typed characters by five (the conventional average word length, including spaces), then divides by the time in minutes. Only correct characters count, so errors never inflate your score.',
  },
  {
    q: 'Which test modes can I choose?',
    a: 'Timed tests run for 15, 30, 60 or 120 seconds. Word count tests give you exactly 10, 25 or 50 words and stop the clock when you finish them. For both you can pick common words, sentences and quotes, or numbers, and turn punctuation on or off for the word and sentence tests. With punctuation on, the numbers test also includes decimals and comma-grouped thousands. You can also paste your own text and practise on that instead.',
  },
  {
    q: 'What does the consistency score mean?',
    a: 'Consistency measures how steady your pace was. The test samples your typing speed once per second, then compares the standard deviation of those samples with your average speed. A score near 100 means an even rhythm with few bursts and stalls, while a low score means your speed swung a lot. It needs a few seconds of typing before it can be calculated.',
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
    a: 'So you can read the opening words and get your hands in position without the clock running. A timed test ends the moment the countdown reaches zero. A word count test ends as soon as you type the final character of the passage, and that final character is scored like every other one, with no extra space or Enter needed.',
  },
  {
    q: 'Where is my personal best stored?',
    a: 'Your best WPM for each combination of mode, length and text type is saved in your own browser using local storage. It is never sent anywhere, it only appears on this device, and clearing your browser data removes it.',
  },
];

const CONTENT = (
  <>
    <h2>How fast do you really type?</h2>
    <p>
      Pick a timed test of 15, 30, 60 or 120 seconds, or a word count test of 10,
      25 or 50 words, then start typing the passage and the clock begins on your
      first keystroke. Correct characters turn green, mistakes turn red and are
      underlined, and at the finish you get your words per minute, accuracy,
      consistency and character counts. Retake with a fresh passage as often as
      you like, and your best score for each mode is remembered on this device.
    </p>
    <h2>Modes for every kind of practice</h2>
    <ul>
      <li><strong>Timed tests</strong> suit benchmarking: pick a duration and type as far as you can before the clock reaches zero.</li>
      <li><strong>Word count tests</strong> suit quick drills: the passage is exactly 10, 25 or 50 words and the clock stops the moment you type the last character.</li>
      <li><strong>Common words</strong> builds raw speed on the words that fill most real writing. <strong>Sentences and quotes</strong> adds natural rhythm and, with punctuation on, capitals and commas. <strong>Numbers</strong> trains the number row, including decimals and grouped thousands when punctuation is on.</li>
      <li><strong>Custom text</strong> lets you paste anything you like, from a paragraph of your own writing to a passage you need to memorise, and practise on exactly that.</li>
    </ul>
    <h2>Reading your results</h2>
    <ul>
      <li><strong>WPM</strong> uses only correct characters, so wild speed with many errors scores honestly low.</li>
      <li><strong>Accuracy</strong> above 95 percent is solid; below 90 percent, slow down and rebuild precision.</li>
      <li><strong>Consistency</strong> rewards an even pace. Two typists can share a WPM while one typed steadily and the other sprinted and stalled; the steadier typist usually makes fewer errors on real work.</li>
      <li>Compare your scores week to week rather than test to test; passages vary a little in difficulty.</li>
    </ul>
    <h2>How this typing test measures you</h2>
    <p>
      The test compares every character you type with the same position in the passage, in real time. A character that matches turns green, a mismatch turns red and underlined, and the current position is highlighted so you always know where you are. The clock starts on your first keystroke: on a timed test it counts down to zero, and on a word count test it counts up and stops when the passage is complete. At the end, the score is calculated from correct characters only: that count is divided by five, the standard length used to define a word in typing tests, and then scaled to a full minute. Accuracy is simply correct characters divided by total characters typed, shown as a percentage. Because wrong characters earn no credit, typing wildly and hoping is always slower in score terms than typing steadily and getting the letters right.
    </p>
    <h2>A worked example with real numbers</h2>
    <p>
      Suppose you finish a 60 second test having typed 340 characters. Of those, 323 match the passage and 17 are errors. Your accuracy is 323 divided by 340, which is 95 percent. Your words per minute is 323 divided by 5, which is 64.6, rounded to 65 WPM. Compare a faster but sloppier attempt: 390 characters typed, but only 330 correct. Accuracy falls to about 85 percent, and the score is 330 divided by 5, which is 66 WPM, barely higher despite 50 extra keystrokes. The second typist worked much harder for almost no gain, and in real writing those 60 errors would each need correcting. Fix accuracy first and speed follows.
    </p>
    <h2>Practical tips for a better score</h2>
    <ul>
      <li><strong>Read three or four words ahead:</strong> your eyes should be slightly in front of your fingers. Looking at the word you are currently typing forces stop and start rhythm, while scanning ahead lets your hands prepare the next pattern and keeps the pace smooth.</li>
      <li><strong>Keep a steady rhythm instead of bursts:</strong> sprinting through easy words and stalling on hard ones wastes more time than a consistent pace. If a word trips you, finish it slowly and correctly rather than mashing keys and repairing the damage.</li>
      <li><strong>Warm up with a repeat:</strong> use Restart same test for your first attempt of the day, then switch to New text for a true measure. Familiar text inflates scores, so your honest benchmark is always a passage you have not just practiced.</li>
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

export default function TypingTest() {
  const [kind, setKind] = useState('time'); // 'time' | 'words'
  const [timeValue, setTimeValue] = useState(60);
  const [wordValue, setWordValue] = useState(25);
  const [textType, setTextType] = useState('sentences');
  const [punctuation, setPunctuation] = useState(true);

  const [customText, setCustomText] = useState(''); // applied custom passage
  const [customDraft, setCustomDraft] = useState('');
  const [customError, setCustomError] = useState('');
  const [customEditorOpen, setCustomEditorOpen] = useState(false);

  // First passage is built with a fixed seed so prerendered HTML and the
  // hydrated first render are identical. New passages come from user actions.
  const [initial] = useState(() => buildPassage(
    { kind: 'time', value: 60, textType: 'sentences', punctuation: true, customText: '' },
    mulberry32(20261023),
  ));
  const [passage, setPassage] = useState(initial.text);
  const [sources, setSources] = useState(initial.sources);

  const [typed, setTyped] = useState('');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);

  const [best, setBest] = useState(null);
  const [newBest, setNewBest] = useState(false);

  const inputRef = useRef(null);
  const intervalRef = useRef(null);
  const startRef = useRef(null);
  const typedRef = useRef('');
  const finishedRef = useRef(false);
  // Per-second sampling for the consistency score:
  // { lastAt, lastCount, list: [wpmForThatSecond, ...] }
  const sampleRef = useRef(null);
  // Mirrors for use inside the timer interval, which must never read stale state.
  const kindRef = useRef(kind);
  const durationRef = useRef(timeValue);
  kindRef.current = kind;
  durationRef.current = timeValue;

  const modeValue = kind === 'time' ? timeValue : wordValue;
  const bestKey = `toolnest.typingBest.v1.${kind}.${modeValue}.${textType}.${textType === 'custom' ? 'na' : (punctuation ? 'punct' : 'plain')}`;
  const bestKeyRef = useRef(bestKey);
  bestKeyRef.current = bestKey;

  const settingsFor = (overrides = {}) => ({
    kind,
    value: modeValue,
    textType,
    punctuation,
    customText,
    ...overrides,
  });

  const stats = useMemo(() => {
    let correct = 0;
    for (let i = 0; i < typed.length; i += 1) {
      if (typed[i] === passage[i]) correct += 1;
    }
    return {
      correct,
      incorrect: typed.length - correct,
      accuracy: typed.length ? (correct / typed.length) * 100 : 100,
    };
  }, [typed, passage]);

  const liveWpm = useMemo(() => {
    if (!elapsedMs) return 0;
    const minutes = Math.max(elapsedMs, 1000) / 60000;
    return Math.round(stats.correct / 5 / minutes);
  }, [stats.correct, elapsedMs]);

  const finalStats = useMemo(() => {
    if (!finished) return null;
    const minutes = Math.max(elapsedMs, 1) / 60000;
    return {
      wpm: Math.round(stats.correct / 5 / minutes),
      accuracy: stats.accuracy,
      correct: stats.correct,
      incorrect: stats.incorrect,
      consistency: consistencyFromSamples(sampleRef.current && sampleRef.current.list),
      elapsedMs,
    };
  }, [finished, elapsedMs, stats]);

  const totalWords = useMemo(
    () => (passage ? passage.split(/\s+/).filter(Boolean).length : 0),
    [passage],
  );
  const wordsTyped = useMemo(
    () => (typed.trim() ? typed.trim().split(/\s+/).length : 0),
    [typed],
  );
  const progressPct = passage
    ? Math.min(100, Math.round((typed.length / passage.length) * 100))
    : 0;
  const timeLeftSec = Math.max(0, timeValue - Math.floor(elapsedMs / 1000));

  /* ------------------------- personal best ------------------------- */
  // Read in an effect only, never during render, so prerendering is safe.
  useEffect(() => {
    let value = null;
    try {
      const raw = window.localStorage.getItem(bestKey);
      if (raw != null) {
        const n = Number(raw);
        if (Number.isFinite(n) && n > 0) value = n;
      }
    } catch (e) { /* storage unavailable: personal bests simply do not show */ }
    setBest(value);
    setNewBest(false);
  }, [bestKey]);

  // Save at the finish, only when the score beats the stored one.
  useEffect(() => {
    if (!finished || !finalStats || !(finalStats.wpm > 0)) return;
    setBest((prev) => {
      if (prev != null && finalStats.wpm <= prev) return prev;
      try { window.localStorage.setItem(bestKeyRef.current, String(finalStats.wpm)); } catch (e) { /* ignore */ }
      setNewBest(true);
      return finalStats.wpm;
    });
  }, [finished, finalStats]);

  /* ----------------------------- timer ----------------------------- */
  const stopInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => stopInterval, []);

  const finishTest = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    stopInterval();
    setRunning(false);
    setFinished(true);
  };

  const startTimer = () => {
    startRef.current = Date.now();
    sampleRef.current = { lastAt: startRef.current, lastCount: 0, list: [] };
    setRunning(true);
    stopInterval();
    intervalRef.current = setInterval(() => {
      const start = startRef.current;
      if (!start) return;
      const now = Date.now();
      const elapsed = now - start;
      const s = sampleRef.current;
      if (s && now - s.lastAt >= 1000) {
        const chars = Math.max(0, typedRef.current.length - s.lastCount);
        s.list.push(Math.round((chars / 5) * 60));
        s.lastAt = now;
        s.lastCount = typedRef.current.length;
      }
      if (kindRef.current === 'time' && elapsed >= durationRef.current * 1000) {
        // Timed tests end exactly at zero: freeze elapsed at the full duration.
        setElapsedMs(durationRef.current * 1000);
        finishTest();
      } else {
        setElapsedMs(elapsed);
      }
    }, 100);
  };

  const resetRun = () => {
    stopInterval();
    startRef.current = null;
    sampleRef.current = null;
    typedRef.current = '';
    finishedRef.current = false;
    setTyped('');
    setElapsedMs(0);
    setRunning(false);
    setFinished(false);
    setNewBest(false);
  };

  const focusInput = () => {
    if (inputRef.current) inputRef.current.focus();
  };

  // Autofocus on desktop-class pointers only; on touch devices an automatic
  // keyboard popup would shove the layout around before the user is ready.
  useEffect(() => {
    try {
      if (window.matchMedia && window.matchMedia('(pointer: fine)').matches) focusInput();
    } catch (e) { /* no autofocus, the box is one tap away */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------- settings changes ----------------------- */
  // Every settings change resets the run with a freshly generated passage.
  const applySettings = (nextSettings) => {
    const built = buildPassage(nextSettings, Math.random);
    setPassage(built.text);
    setSources(built.sources);
    resetRun();
  };

  const chooseTimed = (seconds) => {
    if (kind === 'time' && timeValue === seconds) return;
    setKind('time');
    setTimeValue(seconds);
    applySettings(settingsFor({ kind: 'time', value: seconds }));
  };

  const chooseWords = (count) => {
    if (kind === 'words' && wordValue === count) return;
    setKind('words');
    setWordValue(count);
    applySettings(settingsFor({ kind: 'words', value: count }));
  };

  const chooseTextType = (nextType) => {
    if (nextType === textType) return;
    setTextType(nextType);
    setCustomError('');
    if (nextType === 'custom') {
      setCustomEditorOpen(!customText);
      const built = buildPassage(settingsFor({ textType: 'custom' }), Math.random);
      setPassage(built.text);
      setSources(built.sources);
      resetRun();
    } else {
      applySettings(settingsFor({ textType: nextType }));
    }
  };

  const togglePunctuation = (checked) => {
    if (checked === punctuation) return;
    setPunctuation(checked);
    applySettings(settingsFor({ punctuation: checked }));
  };

  const applyCustom = () => {
    const cleaned = customDraft.replace(/\s+/g, ' ').trim();
    if (cleaned.length < MIN_CUSTOM_CHARS) {
      setCustomError(`Your text is ${cleaned.length} characters. Paste at least ${MIN_CUSTOM_CHARS} characters to practise on.`);
      return;
    }
    if (cleaned.length > MAX_CUSTOM_CHARS) {
      setCustomError(`Your text is ${cleaned.length} characters. The limit is ${MAX_CUSTOM_CHARS}, so trim it down a little.`);
      return;
    }
    setCustomError('');
    setCustomText(cleaned);
    setCustomEditorOpen(false);
    setPassage(cleaned);
    setSources([]);
    resetRun();
    focusInput();
  };

  const useGenerated = () => {
    setCustomEditorOpen(false);
    setCustomError('');
    chooseTextType('words');
  };

  /* ---------------------------- typing ------------------------------ */
  const onChange = (e) => {
    if (finishedRef.current || !passage) return;
    const value = e.target.value.slice(0, passage.length);
    if (!startRef.current && value.length > 0) startTimer();
    typedRef.current = value;
    setTyped(value);
    // A test ends as soon as the passage is fully typed. The final character
    // is part of `value`, so it is scored exactly like every other character;
    // no trailing space or Enter press is needed. This is the normal finish
    // for word count tests and custom text, and an early finish for timed
    // tests when someone completes the whole passage before the clock ends.
    if (value.length >= passage.length) {
      if (startRef.current) setElapsedMs(Date.now() - startRef.current);
      finishTest();
    }
  };

  const restartSame = () => {
    resetRun();
    focusInput();
  };

  const newText = () => {
    if (textType === 'custom') {
      // For custom text, "new text" means pasting a different passage.
      resetRun();
      setCustomEditorOpen(true);
      return;
    }
    applySettings(settingsFor());
    focusInput();
  };

  /* ---------------------------- rendering ---------------------------- */
  // Incorrect characters get the global .bad colours (theme aware) plus an
  // underline, so an error is visible by shape as well as by colour.
  const chars = useMemo(() => passage.split('').map((ch, i) => {
    let cls = '';
    let style;
    if (i < typed.length) {
      if (typed[i] === ch) {
        cls = 'ok';
      } else {
        cls = 'bad';
        style = { textDecoration: 'underline', textUnderlineOffset: '4px' };
      }
    } else if (i === typed.length && !finished) {
      cls = 'current';
    }
    return (
      <span key={i} className={cls} style={style}>{ch}</span>
    );
  }), [passage, typed, finished]);

  const modeLabel = textType === 'custom'
    ? `${kind === 'time' ? `${timeValue} second` : 'word count'} test, custom text`
    : `${kind === 'time' ? `${timeValue} second` : `${wordValue} word`} test, ${TEXT_TYPES.find((t) => t.id === textType).label.toLowerCase()}, punctuation ${punctuation ? 'on' : 'off'}`;

  const displayWpm = finished && finalStats ? finalStats.wpm : liveWpm;

  return (
    <ToolLayout
      slug="typing-speed-test"
      path="/typing-speed-test"
      title="Typing Speed Test: Check Your WPM in 60 Seconds | ToolNest"
      description="Free typing test: timed and word count modes, live WPM, accuracy, consistency and personal bests. No sign-up needed."
      h1="Typing Speed Test"
      intro="Choose a timed or word count test, type words, sentences or numbers, and see live WPM and accuracy as you go. The clock starts on your first keystroke."
      faqs={FAQS}
      content={CONTENT}
    >
      <div className="field" style={{ marginBottom: 10 }}>
        <span style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Timed test</span>
        <div className="preset-row" role="group" aria-label="Timed test length" style={{ margin: 0 }}>
          {TIME_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              className={`preset-chip${kind === 'time' && timeValue === s ? ' active' : ''}`}
              aria-pressed={kind === 'time' && timeValue === s}
              onClick={() => chooseTimed(s)}
            >
              {s} seconds
            </button>
          ))}
        </div>
      </div>

      <div className="field" style={{ marginBottom: 10 }}>
        <span style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Word count test</span>
        <div className="preset-row" role="group" aria-label="Word count test length" style={{ margin: 0 }}>
          {WORD_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              className={`preset-chip${kind === 'words' && wordValue === n ? ' active' : ''}`}
              aria-pressed={kind === 'words' && wordValue === n}
              onClick={() => chooseWords(n)}
            >
              {n} words
            </button>
          ))}
        </div>
      </div>

      <div className="field" style={{ marginBottom: 10 }}>
        <span style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Text type</span>
        <div className="preset-row" role="group" aria-label="Text type" style={{ margin: 0 }}>
          {TEXT_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`preset-chip${textType === t.id ? ' active' : ''}`}
              aria-pressed={textType === t.id}
              onClick={() => chooseTextType(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="checks" style={{ marginBottom: 6 }}>
        <label>
          <input
            type="checkbox"
            checked={punctuation}
            disabled={textType === 'custom'}
            onChange={(e) => togglePunctuation(e.target.checked)}
          />
          Include punctuation
        </label>
        {textType === 'numbers' && <span className="hint">Adds decimals and comma-grouped thousands.</span>}
        {textType === 'custom' && <span className="hint">Your own text is used exactly as pasted.</span>}
      </div>

      <p className="hint" style={{ margin: '4px 0 0' }} aria-live="polite">
        {best != null
          ? `Your best: ${best} WPM (${modeLabel}).`
          : `No personal best yet for this mode (${modeLabel}). Finish a test to set one.`}
        {newBest && finished ? ' That was a new personal best.' : ''}
      </p>

      {textType === 'custom' && customEditorOpen && (
        <div style={{ marginTop: 14 }}>
          <div className="field">
            <label htmlFor="typing-custom">
              Your practice text
              {' '}<span className="hint">At least {MIN_CUSTOM_CHARS} characters. Line breaks and repeated spaces are tidied into single spaces.</span>
            </label>
            <textarea
              id="typing-custom"
              value={customDraft}
              onChange={(e) => setCustomDraft(e.target.value)}
              rows={4}
              style={{ minHeight: 100 }}
              placeholder="Paste the text you want to practise typing here..."
            />
          </div>
          {customError && <div className="message err" role="alert">{customError}</div>}
          <div className="btn-row">
            <button type="button" className="btn" onClick={applyCustom}>Use this text</button>
            <button type="button" className="btn ghost" onClick={useGenerated}>Use generated text instead</button>
          </div>
        </div>
      )}

      {textType === 'custom' && !customEditorOpen && customText && (
        <div className="row" style={{ alignItems: 'center', marginTop: 10 }}>
          <p className="hint" style={{ margin: 0 }}>
            Practising on your own text ({customText.length} characters).
            {kind === 'words' ? ' The word count length does not apply to custom text; the test ends when the text is fully typed.' : ''}
          </p>
          <button type="button" className="btn secondary" onClick={() => setCustomEditorOpen(true)}>Edit custom text</button>
        </div>
      )}

      <div className="stat-grid">
        <div className="stat">
          <div className="num">{kind === 'time' ? `${timeLeftSec}s` : formatClock(elapsedMs)}</div>
          <div className="lbl">{kind === 'time' ? 'Time left' : 'Time elapsed'}</div>
        </div>
        <div className="stat"><div className="num">{displayWpm}</div><div className="lbl">Words per minute</div></div>
        <div className="stat"><div className="num">{stats.accuracy.toFixed(0)}%</div><div className="lbl">Accuracy</div></div>
        <div className="stat"><div className="num">{stats.correct}</div><div className="lbl">Correct characters</div></div>
        <div className="stat"><div className="num">{stats.incorrect}</div><div className="lbl">Incorrect characters</div></div>
        <div className="stat">
          <div className="num">{kind === 'time' ? `${Math.min(100, Math.round((elapsedMs / (timeValue * 1000)) * 100))}%` : `${wordsTyped} / ${totalWords}`}</div>
          <div className="lbl">{kind === 'time' ? 'Time progress' : 'Words typed'}</div>
        </div>
      </div>

      <div className="meter" aria-hidden="true" style={{ margin: '10px 0 14px' }}>
        <div style={{ width: `${kind === 'time' ? Math.min(100, (elapsedMs / (timeValue * 1000)) * 100) : progressPct}%`, background: 'var(--accent)' }} />
      </div>

      {passage ? (
        <div className="typing-text" aria-label="Passage to type" style={{ whiteSpace: 'pre-wrap' }}>{chars}</div>
      ) : (
        <div className="typing-text" aria-label="Passage to type">
          Paste your text above and choose Use this text, and your passage will appear here.
        </div>
      )}
      {sources.length > 0 && (
        <p className="hint" style={{ marginTop: 8 }}>
          This passage includes lines attributed to {sources.join(', ')}.
        </p>
      )}

      <div className="field" style={{ marginTop: 14 }}>
        <label htmlFor="typing-in">Type here</label>
        <textarea
          id="typing-in"
          ref={inputRef}
          value={typed}
          onChange={onChange}
          onPaste={(e) => e.preventDefault()}
          placeholder={finished ? 'Test finished. Restart to try again.' : (passage ? 'Start typing the passage above...' : 'Add your custom text first...')}
          disabled={finished || !passage}
          rows={3}
          style={{ minHeight: 90 }}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
        />
      </div>

      {finished && finalStats && (
        <>
          <div className="message ok" role="status">
            Test complete: <strong>{finalStats.wpm} WPM</strong> with <strong>{finalStats.accuracy.toFixed(1)}% accuracy</strong>.
            {' '}You typed {finalStats.correct} correct characters and {finalStats.incorrect} incorrect ones
            {' '}in {formatClock(finalStats.elapsedMs)}.
            {newBest ? ' That is a new personal best for this mode.' : ''}
          </div>
          <div className="stat-grid">
            <div className="stat"><div className="num">{finalStats.wpm}</div><div className="lbl">Final WPM</div></div>
            <div className="stat"><div className="num">{finalStats.accuracy.toFixed(1)}%</div><div className="lbl">Accuracy</div></div>
            <div className="stat">
              <div className="num">{finalStats.consistency != null ? `${finalStats.consistency}%` : 'Too short'}</div>
              <div className="lbl">Consistency{finalStats.consistency == null ? ' (needs a few seconds)' : ''}</div>
            </div>
            <div className="stat"><div className="num">{finalStats.correct}</div><div className="lbl">Correct characters</div></div>
            <div className="stat"><div className="num">{finalStats.incorrect}</div><div className="lbl">Incorrect characters</div></div>
          </div>
          <div className="btn-row">
            <button type="button" className="btn" onClick={restartSame}>Restart same test</button>
            <button type="button" className="btn secondary" onClick={newText}>New text</button>
          </div>
        </>
      )}

      {!finished && (
        <div className="btn-row">
          <button type="button" className="btn" onClick={newText}>New text</button>
          <button type="button" className="btn secondary" onClick={restartSame}>Restart same test</button>
        </div>
      )}

      <p className="hint" style={{ marginTop: 12 }}>
        {running
          ? 'Test running. Changing any setting above restarts with a fresh passage.'
          : 'The clock starts on your first character. Changing any setting above restarts with a fresh passage.'}
      </p>
    </ToolLayout>
  );
}

import React, { useState } from 'react';
import ToolLayout from '../../components/ToolLayout.jsx';
import CopyButton from '../../components/CopyButton.jsx';

function secureRandomInt(max) {
  const array = new Uint32Array(1);
  const limit = Math.floor(0xffffffff / max) * max;
  let value;
  do {
    crypto.getRandomValues(array);
    value = array[0];
  } while (value >= limit);
  return value % max;
}

const FAQS = [
  {
    q: 'How random are these numbers?',
    a: 'They are drawn with the Web Crypto API, the same cryptographically secure randomness your browser uses for security tasks. Each number is chosen uniformly, meaning every value in your range is equally likely, and the no-duplicates mode uses sampling without replacement so repeats are impossible.',
  },
  {
    q: 'What is the no-duplicates option for?',
    a: 'Draws where each number can appear only once: raffles, lotteries, picking winners, assigning order, or generating a set of unique IDs. If you ask for more unique numbers than the range contains, the tool explains the problem instead of looping forever.',
  },
  {
    q: 'What ranges and counts are supported?',
    a: 'Minimum and maximum can be any whole numbers (negative ranges work too), and you can generate up to 1,000 numbers at once. The count simply has to fit inside the range when duplicates are off.',
  },
  {
    q: 'Can I use this for a giveaway or raffle?',
    a: 'Yes, for casual draws it is ideal: set the range to your ticket or entry count, generate one number (or as many as you have prizes), and the winner is chosen fairly. For regulated lotteries or high-value prizes, use a certified drawing service so the result is independently auditable.',
  },
];

const CONTENT = (
  <>
    <h2>Pick random numbers in any range</h2>
    <p>
      Set a minimum and maximum, choose how many numbers you need, and generate.
      Turn on "no duplicates" for draws and raffles where each number may appear
      only once. The total, average and sorted version of your results are shown
      too, and one click copies the list wherever you need it.
    </p>
    <h2>Everyday uses</h2>
    <ul>
      <li>Pick giveaway and raffle winners from entry numbers.</li>
      <li>Randomize lists, groups and presentation order.</li>
      <li>Generate test data and sample numbers for spreadsheets.</li>
      <li>Roll virtual dice: set the range 1 to 6 and generate as many rolls as you need.</li>
    </ul>
    <h2>How the generator picks a number</h2>
    <p>
      Under the hood, the tool asks your browser for cryptographically secure random values using the Web Crypto API, the same system your browser relies on for secure connections. It requests a large random integer, then maps that value into your chosen range in a way that avoids bias. Simple mapping with a remainder can slightly favor low numbers when the range does not divide evenly into the possible values, so the tool calculates a cutoff limit and rejects any random value above that limit, drawing again instead. The result is that every number between your minimum and maximum has an equal chance of appearing. When no duplicates is switched on, each winning value is stored in a set as it is drawn, and any repeat is discarded and redrawn until your list is full or the range is exhausted.
    </p>
    <h2>A worked example: running a small raffle</h2>
    <p>
      Say you sold 250 raffle tickets numbered 1 to 250 and you have three prizes. Set the minimum to 1, the maximum to 250 and the count to 3, then turn on no duplicates and generate. You might get a list such as 47, 182 and 9, which you read out in draw order: first prize to ticket 47, second to 182 and third to 9. Because duplicates are off, the same ticket cannot win twice. The stats panel will also show a sum of 238 and an average of 79.3 for that draw, handy when you use the same tool for sampling or classroom exercises. Screenshot or copy the list before you announce it, so the record matches what was drawn.
    </p>
    <h2>Practical tips for fair and useful draws</h2>
    <ul>
      <li><strong>Define the range from the real entries:</strong> if entries are numbered 0 to 99 in your spreadsheet, use exactly that range. A range that is even one number too wide can produce a winner that does not exist and force an awkward redraw.</li>
      <li><strong>Generate once and commit to it:</strong> decide in advance that the first valid result stands. Regenerating until you like the outcome quietly destroys the fairness the tool is meant to provide, especially for giveaways with an audience watching.</li>
      <li><strong>Use no duplicates for sampling:</strong> picking 20 survey respondents from 500 customers, 6 questions from a bank of 40, or 11 players from a squad of 18 are all sampling without replacement jobs, and the no duplicates setting is what makes each pick distinct.</li>
      <li><strong>Save the exact settings with the result:</strong> record the minimum, maximum, count and duplicate setting alongside the numbers you copied. That small note lets you explain or reproduce the conditions of the draw later. Pair it with the <a href="/password-generator">Password Generator</a> when you also need a random code or token for the same project.</li>
      <li><strong>Scale the count to the job:</strong> generating 1,000 numbers suits test data, but for a single winner, one number is cleaner to announce and verify than a long list.</li>
    </ul>
    <h2>Common mistakes to avoid</h2>
    <ul>
      <li><strong>Asking for more unique numbers than the range holds:</strong> you cannot draw 30 distinct numbers from 1 to 20. The tool will stop and explain the problem, so widen the range or lower the count rather than switching duplicates back on by accident.</li>
      <li><strong>Confusing random with evenly spread:</strong> a fair draw of 10 numbers from 1 to 100 can contain two numbers in the same decade and none in another. Clumps are normal in true randomness.</li>
      <li><strong>Using inclusive ranges without checking:</strong> both the minimum and the maximum can be drawn in this tool. If your tickets run from 1 to 249 because ticket 250 was never sold, set the maximum to 249, not 250 out of habit.</li>
      <li><strong>Treating a casual draw as a certified one:</strong> for workplace, school and community draws this generator is ideal, but regulated lotteries, legal disputes and high value promotions need an audited process with witnesses and records beyond a browser tool.</li>
      <li><strong>Forgetting negative and zero ranges work differently:</strong> a range from negative 10 to 10 contains 21 values, not 20, because zero counts as well. Check the span before you set a unique count.</li>
    </ul>
  </>
);

export default function RandomNumber() {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(5);
  const [unique, setUnique] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const generate = () => {
    setError('');
    const lo = Math.floor(Number(min));
    const hi = Math.floor(Number(max));
    const n = Math.floor(Number(count));
    if (Number.isNaN(lo) || Number.isNaN(hi) || Number.isNaN(n)) {
      setError('Enter whole numbers for minimum, maximum and count.');
      return;
    }
    if (hi < lo) {
      setError('The maximum must be greater than or equal to the minimum.');
      return;
    }
    if (n < 1 || n > 1000) {
      setError('Choose a count between 1 and 1,000.');
      return;
    }
    const range = hi - lo + 1;
    if (range > 1000000000) {
      setError('That range is too large. Keep the span under one billion.');
      return;
    }
    if (unique && n > range) {
      setError(`Cannot pick ${n} unique numbers from a range of only ${range}. Lower the count or widen the range.`);
      return;
    }
    const out = [];
    if (unique) {
      const picked = new Set();
      let guard = 0;
      while (out.length < n && guard < n * 100) {
        const v = lo + secureRandomInt(range);
        if (!picked.has(v)) {
          picked.add(v);
          out.push(v);
        }
        guard += 1;
      }
      // For dense picks, fill any shortfall deterministically.
      if (out.length < n) {
        for (let v = lo; v <= hi && out.length < n; v += 1) {
          if (!picked.has(v)) out.push(v);
        }
      }
    } else {
      for (let i = 0; i < n; i += 1) out.push(lo + secureRandomInt(range));
    }
    setResults(out);
  };

  const total = results.reduce((a, b) => a + b, 0);
  const sorted = [...results].sort((a, b) => a - b);

  return (
    <ToolLayout
      slug="random-number-generator"
      path="/random-number-generator"
      title="Random Number Generator 1-100: No Repeats Option | ToolNest"
      description="Generate random numbers in any range with secure randomness. No-duplicates mode for raffles and draws, up to 1,000 numbers at once."
      h1="Random Number Generator"
      intro="Generate random numbers in any range with cryptographically secure randomness. Add the no-duplicates rule for raffles, draws and unique picks."
      faqs={FAQS}
      content={CONTENT}
    >
      <div className="row">
        <div className="field">
          <label htmlFor="rng-min">Minimum</label>
          <input id="rng-min" type="text" inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="rng-max">Maximum</label>
          <input id="rng-max" type="text" inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="rng-count">How many numbers</label>
          <input id="rng-count" type="text" inputMode="numeric" value={count} onChange={(e) => setCount(e.target.value)} />
        </div>
      </div>
      <div className="checks" style={{ marginBottom: 6 }}>
        <label>
          <input type="checkbox" checked={unique} onChange={(e) => setUnique(e.target.checked)} />
          No duplicates (each number appears at most once)
        </label>
      </div>
      {error && <div className="message err">{error}</div>}
      <div className="btn-row">
        <button type="button" className="btn" onClick={generate}>Generate numbers</button>
        {results.length > 0 && <CopyButton text={results.join(', ')} label="Copy numbers" className="btn secondary" />}
      </div>

      {results.length > 0 && (
        <>
          <div className="message ok mono" style={{ fontSize: 17 }}>{results.join(',  ')}</div>
          <div className="stat-grid">
            <div className="stat"><div className="num">{results.length}</div><div className="lbl">Numbers generated</div></div>
            <div className="stat"><div className="num">{total.toLocaleString()}</div><div className="lbl">Sum</div></div>
            <div className="stat"><div className="num">{(total / results.length).toFixed(1)}</div><div className="lbl">Average</div></div>
            <div className="stat"><div className="num">{Math.min(...results)} to {Math.max(...results)}</div><div className="lbl">Smallest to largest</div></div>
          </div>
          <p className="hint">Sorted: {sorted.join(', ')}</p>
        </>
      )}
    </ToolLayout>
  );
}

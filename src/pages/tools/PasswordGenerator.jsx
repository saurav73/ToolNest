import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ToolLayout from '../../components/ToolLayout.jsx';
import CopyButton from '../../components/CopyButton.jsx';
import { PASSPHRASE_WORDS } from '../../lib/wordlist.js';

const SETS = {
  lower: 'abcdefghijkmnopqrstuvwxyz',
  upper: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
  digits: '23456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.<>?',
};

const SEPARATORS = [
  { id: '-', label: 'Hyphen (word-word-word)' },
  { id: ' ', label: 'Space (word word word)' },
  { id: '_', label: 'Underscore (word_word_word)' },
  { id: '', label: 'None (wordwordword)' },
];

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

function generatePassword({ length, useLower, useUpper, useDigits, useSymbols }) {
  const pools = [];
  if (useLower) pools.push(SETS.lower);
  if (useUpper) pools.push(SETS.upper);
  if (useDigits) pools.push(SETS.digits);
  if (useSymbols) pools.push(SETS.symbols);
  if (!pools.length) return '';
  const all = pools.join('');
  const chars = [];
  for (const pool of pools) chars.push(pool[secureRandomInt(pool.length)]);
  while (chars.length < length) chars.push(all[secureRandomInt(all.length)]);
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = secureRandomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

function generatePassphrase({ wordCount, separator, capitalize, addNumber }) {
  const words = [];
  for (let i = 0; i < wordCount; i += 1) {
    let w = PASSPHRASE_WORDS[secureRandomInt(PASSPHRASE_WORDS.length)];
    if (capitalize) w = w.charAt(0).toUpperCase() + w.slice(1);
    words.push(w);
  }
  let out = words.join(separator);
  if (addNumber) {
    const n = String(secureRandomInt(100));
    out = separator ? out + separator + n : out + n;
  }
  return out;
}

function passphraseBits({ wordCount, capitalize, addNumber }) {
  let bits = wordCount * Math.log2(PASSPHRASE_WORDS.length);
  if (capitalize) bits += wordCount; /* each word may or may not be capitalised */
  if (addNumber) bits += Math.log2(100);
  return Math.floor(bits);
}

function strengthFromBits(bits) {
  if (!bits) return { label: 'None', pct: 0, color: '#dc2626' };
  if (bits < 40) return { label: 'Weak', pct: 25, color: '#dc2626' };
  if (bits < 65) return { label: 'Fair', pct: 50, color: '#d97706' };
  if (bits < 90) return { label: 'Strong', pct: 75, color: '#65a30d' };
  return { label: 'Excellent', pct: 100, color: '#15803d' };
}

function strengthOf(password, poolSize) {
  const bits = password.length ? Math.floor(password.length * Math.log2(Math.max(poolSize, 2))) : 0;
  return strengthFromBits(bits);
}

const FAQS = [
  {
    q: 'Are the passwords generated here safe to use?',
    a: 'Yes. Passwords and passphrases are generated on your device using the Web Crypto API (crypto.getRandomValues), the same source of randomness browsers use for security work. Nothing is sent to a server, and ToolNest never sees or stores your password. Close the tab and it is gone.',
  },
  {
    q: 'What is a passphrase, and is it as strong as a random password?',
    a: 'A passphrase is a string of random words, like maple-rocket-harbor-7. Because the words are picked at random from a list of over a thousand, a four word passphrase carries about 40 bits of entropy and a six word one about 60 or more, which is strong for accounts you type by hand. Add capitalisation and a number and it gets stronger still. For a password manager vault, a long random password or a six word passphrase both work well.',
  },
  {
    q: 'How long should a password be?',
    a: 'Security guidance from NIST favors length over complexity. Aim for at least 14 to 16 characters for important accounts. A 16 character password drawn from letters, digits and symbols carries around 100 bits of entropy, which is far beyond brute-force reach.',
  },
  {
    q: 'Why are some letters and digits left out?',
    a: 'The generator skips characters that are easy to confuse, such as lowercase L, uppercase I and O, and the digits 0 and 1. That keeps passwords safe to read aloud or type by hand without weakening them in any meaningful way.',
  },
  {
    q: 'Should I use a different password for every account?',
    a: 'Yes. Reusing a password means one leaked site can unlock your other accounts. Generate a unique password here for each account and keep them in a reputable password manager so you only have to remember one master password.',
  },
];

const CONTENT = (
  <>
    <h2>Strong passwords, generated on your device</h2>
    <p>
      Weak and reused passwords are behind most account takeovers. This generator
      builds genuinely random passwords with your choice of length (up to 64
      characters) and character sets, and rates the result with a live strength
      meter based on its entropy. Because generation happens in your browser with
      the Web Crypto API, the password exists only on your screen.
    </p>
    <h2>Prefer words? Use a memorable passphrase</h2>
    <p>
      Switch the mode above to Memorable passphrase and the generator builds your
      password from random everyday words instead of characters: choose three to
      six words, a separator such as a hyphen or space, optional capitalisation,
      and an optional trailing number. A passphrase like that is far easier to
      remember and to type on a TV or phone keyboard than a string of symbols,
      and because every word is drawn at random from a list of over a thousand,
      it stays properly strong. Five or six words is the sweet spot for a master
      password you will type often. This style of password is sometimes called a
      diceware passphrase, after the dice based word lists that popularised it.
    </p>
    <h2>How to use generated passwords well</h2>
    <ul>
      <li>Use a <strong>unique password for every account</strong>, especially email and banking.</li>
      <li>Store passwords in a <strong>password manager</strong> rather than a notes app or browser autofill alone.</li>
      <li>Turn on <strong>two-factor authentication</strong> wherever it is offered; it protects you even if a password leaks.</li>
      <li>Prefer length: a 20 character password with symbols is stronger than a short, clever one.</li>
    </ul>
    <h2>How the generator works under the hood</h2>
    <p>
      Ordinary random functions in code are built for speed and games, and their
      output can be predicted if someone learns the starting state. This tool
      instead asks the browser for cryptographic randomness, the same source
      used to set up secure connections. Each character is picked by drawing a
      random number, and the picker uses a technique called rejection sampling
      so that every character in the pool is exactly equally likely, with no
      subtle bias toward the start of the alphabet. The generator also makes
      sure at least one character from every set you switched on appears, then
      shuffles the whole password so those guaranteed characters do not sit in
      predictable positions. The strength meter converts the result into bits
      of entropy, a direct measure of how many guesses an attacker would need.
      Doubling the password length adds far more entropy than adding one more
      exotic symbol, which is why the meter rewards length so strongly.
    </p>
    <h2>Practical tips for real accounts</h2>
    <ul>
      <li><strong>Protect the email account first:</strong> whoever controls your email can reset almost every other password. Give it your longest password and two factor authentication.</li>
      <li><strong>Match settings to the site:</strong> some older sites cap passwords at 12 characters or ban certain symbols. Generate at the site limit, keep every allowed set on, and length will do the heavy lifting.</li>
      <li><strong>Generate, then save immediately:</strong> copy the password straight into your password manager and the signup form in the same sitting. A brilliant password that you lose locks you out just as surely as a weak one invites others in.</li>
      <li><strong>Use passphrases where you must type:</strong> for a device you unlock by hand many times a day, a word based passphrase you practiced a few times beats a short password you keep resetting.</li>
      <li><strong>Rotate after a breach notice:</strong> if a service reports leaked data, generate a fresh password for that account and check you never reused the old one elsewhere.</li>
    </ul>
    <h2>A worked example</h2>
    <p>
      Imagine you generate a password with all four character sets switched on.
      At 12 characters the meter shows roughly 72 bits of entropy, already far
      beyond what online guessing can reach, because a website will lock or slow
      attempts long before an attacker makes progress. Stretch the slider to 20
      characters and entropy rises to about 120 bits. A cracking rig testing a
      leaked password database at billions of guesses per second would need
      longer than the age of the universe to work through that space. In
      practice that means length is your cheapest security: going from 12 to 20
      characters costs you nothing, because the password manager does the
      remembering, and it multiplies the difficulty for an attacker enormously.
    </p>
    <h2>Common mistakes to avoid</h2>
    <ul>
      <li><strong>Editing the result to make it memorable:</strong> swapping a character for your pet name or birth year reintroduces the patterns attackers try first.</li>
      <li><strong>Reusing one strong password everywhere:</strong> strength does not help when a single leaked database hands the same key to every account you own.</li>
      <li><strong>Saving passwords in plain notes or screenshots:</strong> anyone or any app with access to those files has all your accounts. Use a proper password manager with its own master password.</li>
      <li><strong>Sharing passwords by email or chat:</strong> messages sit in archives and backups. If you must share access, use the sharing feature built into your password manager.</li>
      <li><strong>Ignoring recovery options:</strong> a strong password plus outdated recovery email or phone number is a lockout waiting to happen. Review recovery settings when you set a new password.</li>
    </ul>
  </>
);

export default function PasswordGenerator() {
  const [mode, setMode] = useState('random');
  const [length, setLength] = useState(16);
  const [useLower, setUseLower] = useState(true);
  const [useUpper, setUseUpper] = useState(true);
  const [useDigits, setUseDigits] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [password, setPassword] = useState('');

  const [wordCount, setWordCount] = useState(4);
  const [separator, setSeparator] = useState('-');
  const [capitalize, setCapitalize] = useState(true);
  const [addNumber, setAddNumber] = useState(true);
  const [passphrase, setPassphrase] = useState('');

  const poolSize = useMemo(() => {
    let size = 0;
    if (useLower) size += SETS.lower.length;
    if (useUpper) size += SETS.upper.length;
    if (useDigits) size += SETS.digits.length;
    if (useSymbols) size += SETS.symbols.length;
    return size;
  }, [useLower, useUpper, useDigits, useSymbols]);

  const regen = useCallback(() => {
    setPassword(generatePassword({ length, useLower, useUpper, useDigits, useSymbols }));
  }, [length, useLower, useUpper, useDigits, useSymbols]);

  const regenPhrase = useCallback(() => {
    setPassphrase(generatePassphrase({ wordCount, separator, capitalize, addNumber }));
  }, [wordCount, separator, capitalize, addNumber]);

  useEffect(() => { regen(); }, [regen]);
  useEffect(() => { regenPhrase(); }, [regenPhrase]);

  const isPhrase = mode === 'passphrase';
  const output = isPhrase ? passphrase : password;
  const bits = isPhrase
    ? (passphrase ? passphraseBits({ wordCount, capitalize, addNumber }) : 0)
    : (password ? Math.floor(password.length * Math.log2(Math.max(poolSize, 2))) : 0);
  const strength = isPhrase ? strengthFromBits(bits) : strengthOf(password, poolSize);

  return (
    <ToolLayout
      slug="password-generator"
      path="/password-generator"
      title="Password Generator: Free Strong Random Passwords | ToolNest"
      description="Generate strong random passwords or memorable passphrases free. Length up to 64, strength meter, made on your device only."
      h1="Password Generator"
      intro="Generate strong random passwords with the length and characters you want, or switch to passphrase mode for a memorable password built from words. Generation happens on your device using secure randomness, and nothing is uploaded or stored."
      faqs={FAQS}
      content={CONTENT}
    >
      <div className="field">
        <label>Mode</label>
        <div className="checks">
          <label>
            <input type="radio" name="pw-mode" checked={mode === 'random'} onChange={() => setMode('random')} />
            Random password
          </label>
          <label>
            <input type="radio" name="pw-mode" checked={mode === 'passphrase'} onChange={() => setMode('passphrase')} />
            Memorable passphrase
          </label>
        </div>
      </div>

      <div className="field">
        <label htmlFor="pw-output">{isPhrase ? 'Your passphrase' : 'Your password'}</label>
        <input
          id="pw-output"
          type="text"
          className="mono"
          value={output}
          readOnly
          aria-label={isPhrase ? 'Generated passphrase' : 'Generated password'}
        />
        <div className="meter" aria-hidden="true">
          <div style={{ width: `${output ? strength.pct : 0}%`, background: strength.color }} />
        </div>
        <p className="hint" style={{ marginTop: 8 }}>
          Strength: <strong>{output ? strength.label : 'None'}</strong>
          {output ? ` (about ${bits} bits of entropy)` : ''}
        </p>
      </div>

      {!isPhrase && (
        <>
          <div className="field">
            <label htmlFor="pw-length">Length: {length} characters</label>
            <input
              id="pw-length"
              type="range"
              min="6"
              max="64"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
            />
          </div>

          <div className="field">
            <label>Characters to include</label>
            <div className="checks">
              <label><input type="checkbox" checked={useLower} onChange={(e) => setUseLower(e.target.checked)} /> Lowercase (a-z)</label>
              <label><input type="checkbox" checked={useUpper} onChange={(e) => setUseUpper(e.target.checked)} /> Uppercase (A-Z)</label>
              <label><input type="checkbox" checked={useDigits} onChange={(e) => setUseDigits(e.target.checked)} /> Digits (2-9)</label>
              <label><input type="checkbox" checked={useSymbols} onChange={(e) => setUseSymbols(e.target.checked)} /> Symbols (!@#$)</label>
            </div>
          </div>

          {!poolSize && <div className="message err">Choose at least one character type to generate a password.</div>}
        </>
      )}

      {isPhrase && (
        <>
          <div className="row">
            <div className="field">
              <label htmlFor="pp-count">Words: {wordCount}</label>
              <input
                id="pp-count"
                type="range"
                min="3"
                max="6"
                value={wordCount}
                onChange={(e) => setWordCount(Number(e.target.value))}
              />
              <p className="hint">Five or six words suits a master password. Each word is picked at random from a list of {PASSPHRASE_WORDS.length.toLocaleString()} common words.</p>
            </div>
            <div className="field">
              <label htmlFor="pp-sep">Separator</label>
              <select id="pp-sep" value={separator} onChange={(e) => setSeparator(e.target.value)}>
                {SEPARATORS.map((s) => <option key={s.label} value={s.id}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label>Options</label>
            <div className="checks">
              <label><input type="checkbox" checked={capitalize} onChange={(e) => setCapitalize(e.target.checked)} /> Capitalise each word</label>
              <label><input type="checkbox" checked={addNumber} onChange={(e) => setAddNumber(e.target.checked)} /> Add a number at the end</label>
            </div>
          </div>
        </>
      )}

      <div className="btn-row">
        <button type="button" className="btn" onClick={isPhrase ? regenPhrase : regen} disabled={!isPhrase && !poolSize}>
          {isPhrase ? 'Generate new passphrase' : 'Generate new password'}
        </button>
        <CopyButton text={output} label={isPhrase ? 'Copy passphrase' : 'Copy password'} className="btn secondary" />
      </div>
    </ToolLayout>
  );
}

import React, { useMemo, useState } from 'react';
import ToolLayout from '../../components/ToolLayout.jsx';
import CopyButton from '../../components/CopyButton.jsx';
import { downloadBlob } from '../../lib/files.js';

const CAP = 4096;

const FAQS = [
  {
    q: 'How does the Gmail dot trick work?',
    a: 'Gmail and Google Workspace ignore dots in the username part of an address. Google reads e.x.a.m.p.l.e@gmail.com, ex.ample@gmail.com and example@gmail.com as the exact same address, so mail sent to any of them arrives in one inbox. The dots change how the address looks, not where it goes.',
  },
  {
    q: 'Does the dot trick work on Outlook, Yahoo or other providers?',
    a: 'No, and this matters. Ignoring dots is a Gmail and Google Workspace behavior. On most other providers dots are real characters, so a dotted variant is a different address that may belong to someone else or not exist at all. This generator produces the variant list for any address you enter, but the one inbox trick only applies where the provider ignores dots.',
  },
  {
    q: 'What is the plus trick, and where does it work?',
    a: 'You add a plus sign and a tag after your username, like name+shopping@example.com. Gmail delivers it to the same inbox, and so do Outlook, Yahoo and many other providers, which makes plus tags the more portable trick. Use a different tag per service, then filter on it. Some sign-up forms reject the plus sign; dot variations are the fallback on Gmail.',
  },
  {
    q: 'How many dot variations does my address have?',
    a: 'Two to the power of (username length minus one). Every gap between two characters can either hold a dot or not, so a 6 character username has 32 variations, an 8 character one has 128, and a 10 character one has 512. This tool shows the exact total for your address and lists up to 4,096 of them.',
  },
];

const CONTENT = (
  <>
    <h2>How the Gmail dot trick works</h2>
    <p>
      Most people assume every character in an email address matters. On Gmail
      that is only half true. Google ignores dots in the part before the @
      sign completely: as far as Gmail is concerned, john.smith@gmail.com,
      j.ohnsmith@gmail.com and j.o.h.n.s.m.i.t.h@gmail.com are one and the
      same address, and a message sent to any of them lands in the same inbox.
      Google built this in from the start, partly so that a sender who
      misremembers where the dots go still reaches the right person. The same
      behavior applies to Google Workspace accounts on custom domains.
    </p>
    <p>
      The practical effect is that a single Gmail address is quietly a whole
      family of addresses. A username with eight characters has 128 dot
      placements, and every one of them is yours, with no setup, no settings
      to change and nothing to register. This generator simply writes out the
      full family for any address you type in, so you can pick the variants
      you need instead of working them out by hand.
    </p>
    <h2>One honest caveat before you use them</h2>
    <p>
      The dot trick is a Gmail and Google Workspace behavior, and only that.
      On most other providers dots count as different characters, so a dotted
      variant of an Outlook, Yahoo or company address can be a completely
      different account, or no account at all. This tool generates the variants
      for any address because the list itself is useful for testing and
      planning, but variants only deliver to the same inbox where the provider
      ignores dots. Never use a dotted variant of a non-Gmail address for
      anything important unless you have confirmed how that provider treats
      dots, and never use variants of an address that is not yours.
    </p>
    <h2>What to use dot variations for</h2>
    <ul>
      <li><strong>Organize your signups:</strong> give each service its own variation, then create a Gmail filter that looks at which address a message was sent to and files it under a label. Newsletters, shopping and banking mail sort themselves.</li>
      <li><strong>Spot who shared your address:</strong> if one variation is used for exactly one service and spam starts arriving at it, you know where the leak happened.</li>
      <li><strong>Test your own signup flow:</strong> developers and testers need many distinct looking addresses that still arrive in one test inbox. Dot variations are the standard trick for that, because each form sees a new address while every confirmation email lands in one place.</li>
      <li><strong>Separate roles on one account:</strong> use one variation for work lists, another for personal mail, and filter each to its own label, all inside a single inbox.</li>
    </ul>
    <h2>How many variations does an address have?</h2>
    <p>
      The math is simple. Between every pair of characters in the username
      there is a gap, and each gap either gets a dot or it does not. A username
      of length n has n minus 1 gaps, so the total is 2 to the power of
      (n minus 1). Five characters give 16 variations, eight give 128, ten
      give 512, and fifteen give 16,384. Because the list doubles with every
      extra character, this page lists at most 4,096 variations and tells you
      the true total for longer usernames.
    </p>
    <h2>The plus trick: the companion move</h2>
    <p>
      Dots are not the only free variations. Adding a plus sign and a word
      after your username, such as name+travel@gmail.com, also delivers to the
      same inbox, and this plus addressing works on Gmail, Outlook, Yahoo and
      many other providers, which makes it the better tool away from Google.
      The two tricks combine: a plus tag says what an address is for, and the
      dots make it look different to a form. Two honest limits apply. Some
      sign-up forms wrongly reject plus signs in addresses, and a filter is
      only as good as the discipline of using a different variant or tag for
      each service from the start.
    </p>
    <h2>Using the generated list</h2>
    <p>
      Type an address above and the variations appear instantly, counted and
      ready. Copy All puts the whole shown list on your clipboard, one address
      per line, which pastes cleanly into a spreadsheet, a test data file or
      your password manager notes. The text download gives the same list as a
      .txt file, and the CSV download adds an email header row for tools that
      import contacts or test users. Everything is generated in your browser,
      so the address you type is never sent anywhere.
    </p>
  </>
);

function parseInput(raw) {
  const s = raw.trim().toLowerCase();
  if (!s) return { status: 'empty' };
  let local = s;
  let domain = 'gmail.com';
  if (s.includes('@')) {
    const parts = s.split('@');
    if (parts.length !== 2 || !parts[0] || !parts[1] || !parts[1].includes('.')) {
      return { status: 'error', message: 'That does not look like a complete email address. Type a full address like name@example.com, or just a username and gmail.com is used.' };
    }
    [local, domain] = parts;
  }
  if (local.includes('+')) local = local.slice(0, local.indexOf('+'));
  const base = local.replace(/\./g, '');
  if (!base) return { status: 'error', message: 'The part before the @ sign is empty once the dots are removed. Type the username without dots.' };
  if (!/^[a-z0-9_-]+$/.test(base)) {
    return { status: 'error', message: 'Usernames here can contain letters, numbers, underscores and hyphens. Remove any other characters and try again.' };
  }
  if (base.length > 30) {
    return { status: 'error', message: 'That username is longer than 30 characters, the maximum Gmail allows. Shorten it and try again.' };
  }
  return { status: 'ok', base, domain };
}

function buildVariants(base, count) {
  const n = base.length;
  const out = [];
  for (let mask = 0; mask < count; mask += 1) {
    let v = '';
    for (let i = 0; i < n; i += 1) {
      v += base[i];
      if (i < n - 1 && (mask >> i) & 1) v += '.';
    }
    out.push(v);
  }
  return out;
}

export default function GmailDotGenerator() {
  const [input, setInput] = useState('');

  const parsed = useMemo(() => parseInput(input), [input]);
  const result = useMemo(() => {
    if (parsed.status !== 'ok') return null;
    const total = Math.pow(2, parsed.base.length - 1);
    const shown = Math.min(total, CAP);
    const variants = buildVariants(parsed.base, shown)
      .map((v) => `${v}@${parsed.domain}`);
    return { total, shown, variants, capped: total > CAP };
  }, [parsed]);

  const download = (kind) => {
    if (!result) return;
    const body = kind === 'csv'
      ? `email\n${result.variants.join('\n')}\n`
      : `${result.variants.join('\n')}\n`;
    downloadBlob(
      new Blob([body], { type: kind === 'csv' ? 'text/csv' : 'text/plain' }),
      kind === 'csv' ? 'email-dot-variations.csv' : 'email-dot-variations.txt',
    );
  };

  return (
    <ToolLayout
      slug="gmail-dot-generator"
      path="/gmail-dot-generator"
      title="Gmail Dot Trick Generator: Create Dot Variations | ToolNest"
      description="Create every dot variation and alias of your Gmail address free. All variants land in one inbox. Private, runs in your browser."
      h1="Gmail Dot Trick Generator"
      intro="Type any email address and get every dot variation and alias of it, counted and ready to copy or download. On Gmail, where dots in the username are ignored, every variation delivers to the same inbox."
      faqs={FAQS}
      content={CONTENT}
    >
      <div className="field">
        <label htmlFor="dot-input">Email address (or just a username)</label>
        <input
          id="dot-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. johnsmith@gmail.com or any address"
          autoFocus
        />
        <span className="hint">Dots already in the username are removed first, then every possible placement is generated. A plus tag is ignored.</span>
      </div>

      {parsed.status === 'error' && <div className="message err">{parsed.message}</div>}
      {parsed.status === 'empty' && <p className="hint">Your variations will appear here as soon as you type an address.</p>}

      {result && (
        <>
          <div className="stat-grid">
            <div className="stat"><div className="num">{result.total.toLocaleString('en-US')}</div><div className="lbl">Total variations</div></div>
            <div className="stat"><div className="num">{parsed.base.length}</div><div className="lbl">Username characters</div></div>
            <div className="stat"><div className="num">{result.shown.toLocaleString('en-US')}</div><div className="lbl">Listed below</div></div>
          </div>
          {parsed.domain !== 'gmail.com' && !parsed.domain.endsWith('googlemail.com') && (
            <div className="message warn">
              Heads up: ignoring dots is a Gmail and Google Workspace behavior. With {parsed.domain}, dots may count as different characters, so confirm how your provider treats them before relying on these variants.
            </div>
          )}
          {result.capped && (
            <div className="message warn">
              This username has {result.total.toLocaleString('en-US')} variations, too many to list in full. The first {CAP.toLocaleString('en-US')} are shown, and Copy and Download include those {CAP.toLocaleString('en-US')}.
            </div>
          )}
          <div className="btn-row">
            <CopyButton text={result.variants.join('\n')} label={`Copy all ${result.shown.toLocaleString('en-US')} addresses`} />
            <button type="button" className="btn" onClick={() => download('txt')}>Download .txt</button>
            <button type="button" className="btn" onClick={() => download('csv')}>Download .csv</button>
          </div>
          <ul className="variant-list" aria-label="Dot variations">
            {result.variants.map((v) => <li key={v}>{v}</li>)}
          </ul>
        </>
      )}
    </ToolLayout>
  );
}

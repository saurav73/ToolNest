import React, { useEffect, useState } from 'react';
import ToolLayout from '../../components/ToolLayout.jsx';
import CopyButton from '../../components/CopyButton.jsx';

const FAQS = [
  {
    q: 'What is a UUID?',
    a: 'A UUID is a 128-bit identifier written as 32 hexadecimal digits in five groups, like 550e8400-e29b-41d4-a716-446655440000. It is designed to be unique without a central registry: any system can generate one and be confident no other system generated the same value.',
  },
  {
    q: 'What does version 4 mean?',
    a: 'The version digit is the first digit of the third group. Version 4 means the identifier was generated from random data, which is the most common kind. Other versions encode a timestamp, a namespace and a name, or a MAC address. This generator produces version 4 UUIDs using your browser’s cryptographically secure random source.',
  },
  {
    q: 'Can two UUIDs ever collide?',
    a: 'In theory yes, in practice no. With 122 random bits, you would need to generate about a billion UUIDs per second for roughly a century before a collision became likely. For database keys, filenames, session tokens and API identifiers, version 4 UUIDs are treated as unique.',
  },
  {
    q: 'How do I check whether a UUID is valid?',
    a: 'Paste it into the validator below. It checks the 8-4-4-4-12 grouping, the hexadecimal characters, and reads the version digit and the variant bits, so you can tell at a glance whether a value is a version 4 UUID or something else entirely.',
  },
];

const CONTENT = (
  <>
    <h2>Random UUIDs, one or a hundred at a time</h2>
    <p>
      Generate version 4 UUIDs instantly for database keys, test fixtures,
      filenames, API identifiers and anywhere else you need a value that will
      never clash with another. The generator uses your browser’s secure random
      source, so every UUID is genuinely random, and nothing is sent to a server.
    </p>
    <h2>How to use the UUID generator</h2>
    <ul>
      <li><strong>Generate in bulk:</strong> choose how many you need, from 1 to 100, and press Generate. The full list appears below, ready to copy or download as a text file.</li>
      <li><strong>Copy one or all:</strong> each UUID has its own copy button, and Copy all grabs the whole list in one click for pasting into a spreadsheet, seed file or test script.</li>
      <li><strong>Validate an existing UUID:</strong> paste any value into the validator to check its format and read its version and variant. This is handy when debugging data imported from another system.</li>
    </ul>
    <h2>Where UUIDs show up</h2>
    <ul>
      <li><strong>Database primary keys:</strong> unlike auto-incrementing numbers, UUIDs can be generated on any server or device without coordination, which is why distributed systems prefer them.</li>
      <li><strong>File and object names:</strong> uploads, exports and cached files get UUID names so two users’ files never overwrite each other.</li>
      <li><strong>API and event identifiers:</strong> requests, jobs and webhook deliveries carry UUIDs so retries and duplicates can be detected safely.</li>
      <li><strong>Test data:</strong> seed scripts generate fresh UUIDs per run instead of reusing fixed examples that might collide with real data.</li>
    </ul>
    <h2>UUID format, decoded</h2>
    <p>
      A UUID has five groups of 8, 4, 4, 4 and 12 hex digits, separated by
      hyphens. The first digit of the third group is the version: 4 for random.
      The first digit of the fourth group encodes the variant and is 8, 9, a or
      b for the standard layout used today. The well-known nil UUID is all
      zeroes, and it means "no value" rather than a real identifier. The
      validator below reads these positions for you, so you do not have to count
      characters yourself.
    </p>
  </>
);

function randomUuid() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
  const bytes = new Uint8Array(16);
  window.crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function validateUuid(value) {
  const v = value.trim().toLowerCase();
  const m = /^([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})$/.exec(v);
  if (!m) return { valid: false };
  const version = m[3][0];
  const variantDigit = m[4][0];
  const variant = ['8', '9', 'a', 'b'].includes(variantDigit) ? 'Standard (RFC 4122)' : 'Other / reserved';
  return { valid: true, version, variant, nil: v === '00000000-0000-0000-0000-000000000000' };
}

export default function UuidGenerator() {
  const [count, setCount] = useState('10');
  const [uuids, setUuids] = useState([]);
  const [check, setCheck] = useState('');

  // Generate on the client only: window.crypto does not exist during prerender.
  useEffect(() => {
    setUuids(Array.from({ length: 5 }, () => randomUuid()));
  }, []);

  const generate = () => {
    const n = Math.max(1, Math.min(100, parseInt(count, 10) || 1));
    setCount(String(n));
    setUuids(Array.from({ length: n }, () => randomUuid()));
  };

  const download = () => {
    const blob = new Blob([uuids.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'uuids.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const verdict = check.trim() ? validateUuid(check) : null;

  return (
    <ToolLayout
      slug="uuid-generator"
      path="/uuid-generator"
      title="UUID Generator Online: Bulk Random UUIDs Free | ToolNest"
      description="Generate one or bulk random UUIDs (v4) instantly, validate any UUID, and copy or download the list. Free, no sign-up."
      h1="UUID Generator"
      intro="Generate one or up to 100 random UUIDs (v4) at once, validate any UUID, and copy or download the list. Free, no sign-up."
      faqs={FAQS}
      content={CONTENT}
    >
      <div className="row">
        <div className="field">
          <label htmlFor="uuid-count">How many UUIDs (1-100)</label>
          <input id="uuid-count" type="text" inputMode="numeric" value={count} onChange={(e) => setCount(e.target.value)} />
        </div>
      </div>
      <div className="btn-row">
        <button type="button" className="btn" onClick={generate}>Generate UUIDs</button>
        <CopyButton text={uuids.join('\n')} label="Copy all" className="btn secondary" />
        <button type="button" className="btn secondary" onClick={download}>Download .txt</button>
      </div>
      <div className="field">
        <label>Generated UUIDs</label>
        <ul>
          {uuids.map((u, i) => (
            <li key={`${u}-${i}`}>
              <code>{u}</code> <CopyButton text={u} label="Copy" className="btn secondary" />
            </li>
          ))}
        </ul>
      </div>
      <div className="field">
        <label htmlFor="uuid-check">Validate a UUID</label>
        <input id="uuid-check" type="text" value={check} onChange={(e) => setCheck(e.target.value)} placeholder="Paste a UUID here" spellCheck={false} />
        {verdict && !verdict.valid && <div className="message err">Not a valid UUID: it must be 32 hex digits in 8-4-4-4-12 groups separated by hyphens.</div>}
        {verdict && verdict.valid && (
          <p className="lede">
            Valid UUID{verdict.nil ? ' (nil UUID, meaning no value)' : ` — version ${verdict.version}, variant: ${verdict.variant}`}.
          </p>
        )}
      </div>
    </ToolLayout>
  );
}

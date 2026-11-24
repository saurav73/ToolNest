import React, { useEffect, useState } from 'react';
import ToolLayout from '../../components/ToolLayout.jsx';
import CopyButton from '../../components/CopyButton.jsx';

const FAQS = [
  {
    q: 'What is a UUID?',
    a: 'A UUID is a 128-bit identifier written as 32 hexadecimal digits in five groups, like 550e8400-e29b-41d4-a716-446655440000. It is designed to be unique without a central registry: any system can generate one and be confident no other system generated the same value.',
  },
  {
    q: 'Which UUID version should I use?',
    a: 'Version 4 is the safe default: fully random, it reveals nothing about when or where it was made. Version 7 starts with a millisecond timestamp, so values sort by creation time, which keeps database indexes compact; use it for new primary keys, logs and event IDs. Version 1 is the older time-based form and version 5 is deterministic: the same namespace and name always produce the same UUID, which is handy for stable IDs derived from URLs or keys.',
  },
  {
    q: 'What is a version 5 UUID?',
    a: 'A version 5 UUID is made by hashing a namespace UUID together with a name using SHA-1. Pick a namespace (DNS, URL, OID or X.500, or your own UUID), type a name, and the same inputs always give the same UUID. That makes it useful for stable identifiers, for example one ID per product page, while version 4 gives a fresh random value every time.',
  },
  {
    q: 'Can two UUIDs ever collide?',
    a: 'In theory yes, in practice no. A version 4 UUID has 122 random bits, so you would need to generate about a billion UUIDs per second for roughly a century before a collision became likely. For database keys, filenames, session tokens and API identifiers, UUIDs are treated as unique.',
  },
  {
    q: 'How do I check whether a UUID is valid?',
    a: 'Paste it into the validator below. It checks the 8-4-4-4-12 grouping, the hexadecimal characters, and reads the version digit and the variant bits, so you can tell at a glance whether a value is a version 4 UUID or something else entirely. For version 7 and version 1 values it also reads the creation time out of the timestamp.',
  },
];

const CONTENT = (
  <>
    <h2>Random UUIDs, one or a hundred at a time</h2>
    <p>
      Generate UUIDs in versions 4, 7, 1 and 5 for database keys, test fixtures,
      filenames, API identifiers and anywhere else you need a value that will
      never clash with another. Version 4 is fully random, version 7 sorts by
      creation time, version 1 is the older time-based form, and version 5 is
      deterministic from a namespace and a name. The generator uses your
      browser’s secure random source, so every UUID is genuinely random, and
      nothing is sent to a server.
    </p>
    <h2>How to use the UUID generator</h2>
    <ul>
      <li><strong>Pick a version:</strong> version 4 is the default. Choose version 7 when the IDs should sort by creation time, version 1 for legacy time-based IDs, or version 5 when the same name should always give the same ID.</li>
      <li><strong>Generate in bulk:</strong> choose how many you need, from 1 to 100, and press Generate. The full list appears below, ready to copy or download as a text file. Version 5 returns a single UUID, because the same namespace and name always give the same value.</li>
      <li><strong>Copy one or all:</strong> each UUID has its own copy button, and Copy all grabs the whole list in one click for pasting into a spreadsheet, seed file or test script.</li>
      <li><strong>Validate an existing UUID:</strong> paste any value into the validator to check its format and read its version and variant. For version 7 and version 1 values it also shows the creation time encoded in the timestamp. This is handy when debugging data imported from another system.</li>
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
      hyphens. The first digit of the third group is the version: 4 for random,
      7 for time-ordered, 1 for time-based, 5 for name-based. The first digit of
      the fourth group encodes the variant and is 8, 9, a or b for the standard
      layout used today. The well-known nil UUID is all zeroes, and it means "no
      value" rather than a real identifier. The validator below reads these
      positions for you, so you do not have to count characters yourself.
    </p>
  </>
);

const NAMESPACES = {
  dns: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  url: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
  oid: '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
  x500: '6ba7b814-9dad-11d1-80b4-00c04fd430c8',
};

function bytesToUuid(bytes) {
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function randomBytes(n) {
  const b = new Uint8Array(n);
  window.crypto.getRandomValues(b);
  return b;
}

// RFC 9562 version 7: 48-bit Unix millisecond timestamp first, then random bits,
// so values sort by creation time. The rest is random, like version 4.
function generateV7() {
  const bytes = new Uint8Array(16);
  const ms = BigInt(Date.now());
  for (let i = 0; i < 6; i++) bytes[i] = Number((ms >> BigInt(8 * (5 - i))) & 0xffn);
  bytes.set(randomBytes(10), 6);
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return bytesToUuid(bytes);
}

// RFC 9562 version 1: 60-bit timestamp in 100-nanosecond units since 1582-10-15,
// a random clock sequence and a random node with the multicast bit set, so no
// machine address is leaked the way a real MAC address would.
function generateV1() {
  const ts = (BigInt(Date.now()) + 12219292800000n) * 10000n;
  const bytes = new Uint8Array(16);
  const timeLow = Number(ts & 0xffffffffn);
  const timeMid = Number((ts >> 32n) & 0xffffn);
  const timeHi = Number((ts >> 48n) & 0x0fffn);
  bytes[0] = (timeLow >>> 24) & 0xff; bytes[1] = (timeLow >>> 16) & 0xff;
  bytes[2] = (timeLow >>> 8) & 0xff; bytes[3] = timeLow & 0xff;
  bytes[4] = (timeMid >>> 8) & 0xff; bytes[5] = timeMid & 0xff;
  bytes[6] = (timeHi >>> 8) & 0x0f; bytes[7] = timeHi & 0xff;
  bytes.set(randomBytes(8), 8);
  bytes[6] |= 0x10;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  bytes[10] |= 0x01;
  return bytesToUuid(bytes);
}

function parseUuidBytes(value) {
  const hex = value.replace(/-/g, '');
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

// RFC 9562 version 5: SHA-1 of the namespace UUID bytes followed by the UTF-8
// name. Same namespace and name always give the same UUID.
async function generateV5(namespaceUuid, name) {
  const ns = parseUuidBytes(namespaceUuid);
  const nameBytes = new TextEncoder().encode(name);
  const data = new Uint8Array(16 + nameBytes.length);
  data.set(ns, 0);
  data.set(nameBytes, 16);
  const hash = new Uint8Array(await window.crypto.subtle.digest('SHA-1', data));
  const bytes = hash.slice(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return bytesToUuid(bytes);
}

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
  let createdAt = null;
  if (version === '7') {
    // First 48 bits are a Unix millisecond timestamp.
    const ms = parseInt(m[1] + m[2], 16);
    if (Number.isFinite(ms)) createdAt = new Date(ms).toISOString();
  } else if (version === '1') {
    // 60-bit timestamp in 100-nanosecond units since 1582-10-15.
    const bytes = parseUuidBytes(v);
    const timeLow = (BigInt(bytes[0]) << 24n) | (BigInt(bytes[1]) << 16n) | (BigInt(bytes[2]) << 8n) | BigInt(bytes[3]);
    const timeMid = (BigInt(bytes[4]) << 8n) | BigInt(bytes[5]);
    const timeHi = (BigInt(bytes[6] & 0x0f) << 8n) | BigInt(bytes[7]);
    const ts = (timeHi << 48n) | (timeMid << 32n) | timeLow;
    const ms = Number(ts / 10000n - 12219292800000n);
    if (Number.isFinite(ms) && ms > 0) createdAt = new Date(ms).toISOString();
  }
  return { valid: true, version, variant, nil: v === '00000000-0000-0000-0000-000000000000', createdAt };
}

export default function UuidGenerator() {
  const [version, setVersion] = useState('4');
  const [count, setCount] = useState('10');
  const [uuids, setUuids] = useState([]);
  const [check, setCheck] = useState('');
  const [namespace, setNamespace] = useState('dns');
  const [customNamespace, setCustomNamespace] = useState('');
  const [name, setName] = useState('www.example.com');
  const [error, setError] = useState('');

  // Generate on the client only: window.crypto does not exist during prerender.
  useEffect(() => {
    setUuids(Array.from({ length: 5 }, () => randomUuid()));
  }, []);

  const generate = async () => {
    setError('');
    if (version === '5') {
      const ns = namespace === 'custom' ? customNamespace.trim() : NAMESPACES[namespace];
      if (!validateUuid(ns || '').valid) {
        setError('That namespace is not a valid UUID. Pick a preset, or paste a full UUID as a custom namespace.');
        return;
      }
      if (!name.trim()) {
        setError('Type a name to hash, for example a domain or a URL.');
        return;
      }
      try {
        setUuids([await generateV5(ns, name.trim())]);
      } catch {
        setError('Your browser did not allow the hash. Try a modern browser over HTTPS.');
      }
      return;
    }
    const n = Math.max(1, Math.min(100, parseInt(count, 10) || 1));
    setCount(String(n));
    const make = version === '7' ? generateV7 : version === '1' ? generateV1 : randomUuid;
    setUuids(Array.from({ length: n }, () => make()));
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
      title="UUID Generator: v4, v7, v1 and v5 UUIDs Online | ToolNest"
      description="Generate UUIDs in versions 4, 7, 1 and 5, in bulk, with a validator that reads the version and creation time. Free, private, in your browser."
      h1="UUID Generator"
      intro="Generate UUIDs in versions 4, 7, 1 or 5, one or up to 100 at a time, validate any UUID, and copy or download the list. Free, no sign-up."
      faqs={FAQS}
      content={CONTENT}
    >
      <div className="btn-row" role="tablist" aria-label="UUID version">
        <button type="button" className={version === '4' ? 'btn' : 'btn secondary'} onClick={() => setVersion('4')}>v4 random</button>
        <button type="button" className={version === '7' ? 'btn' : 'btn secondary'} onClick={() => setVersion('7')}>v7 time-ordered</button>
        <button type="button" className={version === '1' ? 'btn' : 'btn secondary'} onClick={() => setVersion('1')}>v1 time-based</button>
        <button type="button" className={version === '5' ? 'btn' : 'btn secondary'} onClick={() => setVersion('5')}>v5 name-based</button>
      </div>
      {version === '5' ? (
        <>
          <div className="row">
            <div className="field">
              <label htmlFor="uuid-namespace">Namespace</label>
              <select id="uuid-namespace" value={namespace} onChange={(e) => setNamespace(e.target.value)}>
                <option value="dns">DNS (6ba7b810...)</option>
                <option value="url">URL (6ba7b811...)</option>
                <option value="oid">OID (6ba7b812...)</option>
                <option value="x500">X.500 (6ba7b814...)</option>
                <option value="custom">Custom UUID</option>
              </select>
            </div>
            {namespace === 'custom' && (
              <div className="field">
                <label htmlFor="uuid-custom-namespace">Custom namespace UUID</label>
                <input id="uuid-custom-namespace" type="text" value={customNamespace} onChange={(e) => setCustomNamespace(e.target.value)} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" spellCheck={false} />
              </div>
            )}
            <div className="field">
              <label htmlFor="uuid-name">Name</label>
              <input id="uuid-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="www.example.com" spellCheck={false} />
            </div>
          </div>
          <p className="lede">Version 5 returns one UUID: the same namespace and name always give the same value.</p>
        </>
      ) : (
        <div className="row">
          <div className="field">
            <label htmlFor="uuid-count">How many UUIDs (1-100)</label>
            <input id="uuid-count" type="text" inputMode="numeric" value={count} onChange={(e) => setCount(e.target.value)} />
          </div>
        </div>
      )}
      <div className="btn-row">
        <button type="button" className="btn" onClick={generate}>Generate UUIDs</button>
        <CopyButton text={uuids.join('\n')} label="Copy all" className="btn secondary" />
        <button type="button" className="btn secondary" onClick={download}>Download .txt</button>
      </div>
      {error && <div className="message err">{error}</div>}
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
            Valid UUID{verdict.nil ? ' (nil UUID, meaning no value)' : `: version ${verdict.version}, variant: ${verdict.variant}`}{verdict.createdAt ? `, created ${verdict.createdAt}` : ''}.
          </p>
        )}
      </div>
    </ToolLayout>
  );
}

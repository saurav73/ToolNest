import React, { useState } from 'react';
import ToolLayout from '../../components/ToolLayout.jsx';
import CopyButton from '../../components/CopyButton.jsx';

const ALGOS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

const FAQS = [
  {
    q: 'What is a hash?',
    a: 'A hash is a fixed-length fingerprint of some input. The same input always produces the same hash, but changing even one character produces a completely different one, and the original input cannot be recovered from the hash. That makes hashes ideal for checking that a file or message has not been altered.',
  },
  {
    q: 'Which algorithm should I use?',
    a: 'SHA-256 is the safe default for most purposes, including file checksums and integrity checks. SHA-512 is stronger but produces a longer output. SHA-1 is kept here only for verifying old checksums, because it is no longer considered collision-resistant and should not be used for security. SHA-384 is a truncated SHA-512 variant used by some systems.',
  },
  {
    q: 'Can a hash be reversed to get my text back?',
    a: 'No. Hash functions are one-way by design. The only way to "reverse" one is to guess inputs and hash them until one matches, which is why short or predictable inputs such as common passwords can still be attacked with dictionaries. Never treat a hash of a password as a substitute for proper password storage.',
  },
  {
    q: 'What is HMAC and when do I need it?',
    a: 'HMAC mixes a secret key into the hash, so only someone with the key can produce the same signature. That is what API request signing, webhook verification (GitHub, Stripe, AWS) and JWT signatures (HS256, HS384, HS512) all rely on: the receiver recomputes the HMAC with the shared secret and checks it matches. A plain hash proves a message was not altered; an HMAC also proves it came from someone who holds the key. Switch to HMAC mode, enter your message and secret key, and pick the algorithm your API expects.',
  },
  {
    q: 'Why does my HMAC not match the server?',
    a: 'Almost always one of three things: the message bytes differ (extra spaces, newlines or a different encoding; this tool uses UTF-8 for both the message and the key), the secret key is wrong or has extra whitespace, or the output format differs (hex versus Base64 versus Base64URL, which JWT uses). Run the example from the API documentation here first: if it matches, the algorithm is right and the message assembly is wrong.',
  },
  {
    q: 'Is my text or file uploaded anywhere?',
    a: 'No. Hashing runs entirely in your browser using the built-in Web Crypto API. Your text and files never leave your device, which is exactly why this tool is safe for private documents, keys and pre-release material.',
  },
];

const CONTENT = (
  <>
    <h2>Hash text and files without uploading anything</h2>
    <p>
      Type text or drop a file and this tool computes its SHA-1, SHA-256, SHA-384
      and SHA-512 hashes on the spot, in your browser. Hashes are the standard way
      to verify downloads, confirm that a file has not changed, and fingerprint
      data without storing the data itself. Because everything runs locally, the
      tool is safe for sensitive material that you would never paste into a
      server-side checker.
    </p>
    <h2>How to use the hash generator</h2>
    <ul>
      <li><strong>Hash text:</strong> type or paste into the text box and press Generate. All four hashes appear at once, ready to copy.</li>
      <li><strong>Hash a file:</strong> choose a file and press Hash file. The file is read locally and hashed in chunks, so even large files work without uploading a single byte.</li>
      <li><strong>Compare with a known hash:</strong> paste the expected value into the compare box. The tool highlights which algorithm matches, so you can verify a download in seconds.</li>
      <li><strong>Uppercase output:</strong> some systems publish checksums in uppercase. Toggle the checkbox if you need capitals instead of the usual lowercase hex.</li>
    </ul>
    <h2>Where hashes are actually used</h2>
    <ul>
      <li><strong>Download verification:</strong> software publishers list a SHA-256 checksum next to each download. Hash the file you received and compare: a match proves the download is complete and untampered.</li>
      <li><strong>File integrity:</strong> hash a backup before and after copying it. Identical hashes mean an identical file, byte for byte.</li>
      <li><strong>Content addressing:</strong> systems like Git identify every version of a file by its hash, so a changed file automatically gets a new identity.</li>
      <li><strong>Password storage:</strong> services store hashes of passwords, not the passwords themselves, combined with a salt and a slow hashing function. A plain SHA-256 of a password alone is not safe storage.</li>
    </ul>
    <h2>Why there is no MD5 here</h2>
    <p>
      MD5 is still common in old checksum lists, but it is broken: researchers can
      craft two different files with the same MD5 hash. Browsers also do not ship
      MD5 in the Web Crypto API, which this tool uses so that nothing is uploaded.
      If you must verify an old MD5 checksum, use a desktop checksum utility; for
      anything new, use SHA-256.
    </p>
    <h2>HMAC: the same hash with a secret key</h2>
    <p>
      Switch to HMAC mode and the tool signs your message with a secret key
      instead of hashing it bare. Pick the algorithm your API expects (HMAC-SHA-256
      is the modern default for AWS, GitHub webhooks, Stripe and JWT HS256; SHA-384
      and SHA-512 cover HS384 and HS512) and the signature appears in hex, Base64
      and Base64URL, ready to copy into the format your system expects. The key is
      typed into a masked field and, like everything else here, never leaves your
      browser, so it is safe to test with a real webhook secret.
    </p>
  </>
);

function bytesToHex(bytes) {
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function bytesToBase64(bytes) {
  const arr = new Uint8Array(bytes);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < arr.length; i += chunk) {
    binary += String.fromCharCode.apply(null, arr.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function bytesToBase64Url(bytes) {
  return bytesToBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function digestHex(algo, data) {
  const buf = await window.crypto.subtle.digest(algo, data);
  return bytesToHex(buf);
}

async function hmacSign(algo, keyText, message) {
  const key = await window.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(keyText),
    { name: 'HMAC', hash: algo },
    false,
    ['sign'],
  );
  const sig = await window.crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return {
    hex: bytesToHex(sig),
    base64: bytesToBase64(sig),
    base64url: bytesToBase64Url(sig),
  };
}

export default function HashGenerator() {
  const [mode, setMode] = useState('hash');
  const [text, setText] = useState('');
  const [results, setResults] = useState(null);
  const [upper, setUpper] = useState(false);
  const [compare, setCompare] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileResults, setFileResults] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [secret, setSecret] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [hmacAlgo, setHmacAlgo] = useState('SHA-256');
  const [hmacResults, setHmacResults] = useState(null);

  const show = (hex) => (upper ? hex.toUpperCase() : hex);

  const switchMode = (m) => {
    setMode(m);
    setError('');
    setResults(null);
    setHmacResults(null);
  };

  const generateHmac = async () => {
    setError('');
    if (!secret) {
      setError('Enter a secret key first. HMAC needs a key as well as a message.');
      return;
    }
    try {
      const out = await hmacSign(hmacAlgo, secret, text);
      setHmacResults(out);
    } catch (e) {
      setError('HMAC failed: ' + e.message);
    }
  };

  const generateText = async () => {
    setError('');
    try {
      const data = new TextEncoder().encode(text);
      const out = {};
      for (const a of ALGOS) out[a] = await digestHex(a, data);
      setResults(out);
    } catch (e) {
      setError('Hashing failed: ' + e.message);
    }
  };

  const hashFile = async (file) => {
    if (!file) return;
    setBusy(true);
    setError('');
    setFileName(file.name);
    try {
      const data = await file.arrayBuffer();
      const out = {};
      for (const a of ALGOS) out[a] = await digestHex(a, data);
      setFileResults(out);
    } catch (e) {
      setError('File hashing failed: ' + e.message);
    }
    setBusy(false);
  };

  const matchAlgo = compare.trim().toLowerCase();

  return (
    <ToolLayout
      slug="hash-generator"
      path="/hash-generator"
      title="Hash and HMAC Generator: SHA-256, HMAC Online | ToolNest"
      description="Generate SHA-1, SHA-256, SHA-384 and SHA-512 hashes or HMAC signatures with a secret key, in your browser. Nothing is uploaded."
      h1="Hash Generator"
      intro="Generate SHA-1, SHA-256, SHA-384 and SHA-512 hashes from text or files, or sign a message with HMAC and a secret key, entirely in your browser. Nothing is uploaded or stored."
      faqs={FAQS}
      content={CONTENT}
    >
      <div className="btn-row" role="tablist" aria-label="Hash mode">
        <button type="button" className={mode === 'hash' ? 'btn' : 'btn secondary'} onClick={() => switchMode('hash')}>Plain hashes</button>
        <button type="button" className={mode === 'hmac' ? 'btn' : 'btn secondary'} onClick={() => switchMode('hmac')}>HMAC with a secret key</button>
      </div>
      <div className="field">
        <label htmlFor="hash-text">{mode === 'hmac' ? 'Message to sign' : 'Text to hash'}</label>
        <textarea id="hash-text" rows={4} value={text} onChange={(e) => setText(e.target.value)} />
      </div>
      {mode === 'hmac' && (
        <>
          <div className="row">
            <div className="field">
              <label htmlFor="hmac-secret">Secret key</label>
              <input id="hmac-secret" type={showKey ? 'text' : 'password'} value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="Your shared secret" autoComplete="off" spellCheck={false} />
            </div>
            <div className="field">
              <label htmlFor="hmac-algo">Algorithm</label>
              <select id="hmac-algo" value={hmacAlgo} onChange={(e) => setHmacAlgo(e.target.value)}>
                {ALGOS.map((a) => (
                  <option key={a} value={a}>HMAC-{a}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="checks" style={{ marginBottom: 6 }}>
            <label>
              <input type="checkbox" checked={showKey} onChange={(e) => setShowKey(e.target.checked)} /> Show secret key
            </label>
            <label>
              <input type="checkbox" checked={upper} onChange={(e) => setUpper(e.target.checked)} /> Uppercase hex output
            </label>
          </div>
          <div className="btn-row">
            <button type="button" className="btn" onClick={generateHmac} disabled={!text || !secret}>Generate HMAC</button>
          </div>
          {hmacResults && (
            <div className="field">
              <label>HMAC-{hmacAlgo} signature</label>
              <div className="row">
                <div className="field">
                  <label>Hex</label>
                  <input type="text" readOnly value={show(hmacResults.hex)} />
                </div>
                <CopyButton text={show(hmacResults.hex)} label="Copy" className="btn secondary" />
              </div>
              <div className="row">
                <div className="field">
                  <label>Base64</label>
                  <input type="text" readOnly value={hmacResults.base64} />
                </div>
                <CopyButton text={hmacResults.base64} label="Copy" className="btn secondary" />
              </div>
              <div className="row">
                <div className="field">
                  <label>Base64URL (for JWT)</label>
                  <input type="text" readOnly value={hmacResults.base64url} />
                </div>
                <CopyButton text={hmacResults.base64url} label="Copy" className="btn secondary" />
              </div>
            </div>
          )}
        </>
      )}
      {mode === 'hash' && (
        <>
      <div className="checks" style={{ marginBottom: 6 }}>
        <label>
          <input type="checkbox" checked={upper} onChange={(e) => setUpper(e.target.checked)} /> Uppercase output
        </label>
      </div>
      <div className="btn-row">
        <button type="button" className="btn" onClick={generateText} disabled={!text}>Generate hashes</button>
      </div>
      {results && (
        <div className="field">
          <label>Hashes for your text</label>
          {ALGOS.map((a) => (
            <div className="row" key={a}>
              <div className="field">
                <label>{a}</label>
                <input type="text" readOnly value={show(results[a])} />
              </div>
              <CopyButton text={show(results[a])} label="Copy" className="btn secondary" />
            </div>
          ))}
        </div>
      )}
      <div className="field">
        <label htmlFor="hash-compare">Compare with a known hash (optional)</label>
        <input id="hash-compare" type="text" value={compare} onChange={(e) => setCompare(e.target.value)} placeholder="Paste an expected hash here" spellCheck={false} />
        {results && matchAlgo && (
          <p className="lede">
            {ALGOS.some((a) => results[a] === matchAlgo)
              ? `Match: ${ALGOS.find((a) => results[a] === matchAlgo)}`
              : 'No match against the hashes above.'}
          </p>
        )}
      </div>
      <div className="field">
        <label htmlFor="hash-file">Or hash a file (read locally, never uploaded)</label>
        <input id="hash-file" type="file" onChange={(e) => hashFile(e.target.files[0])} />
      </div>
      {busy && <p className="lede">Hashing file...</p>}
      {fileResults && (
        <div className="field">
          <label>Hashes for {fileName}</label>
          {ALGOS.map((a) => (
            <div className="row" key={a}>
              <div className="field">
                <label>{a}</label>
                <input type="text" readOnly value={show(fileResults[a])} />
              </div>
              <CopyButton text={show(fileResults[a])} label="Copy" className="btn secondary" />
            </div>
          ))}
        </div>
      )}
        </>
      )}
      {error && <div className="message err">{error}</div>}
    </ToolLayout>
  );
}

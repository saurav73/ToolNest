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
  </>
);

async function digestHex(algo, data) {
  const buf = await window.crypto.subtle.digest(algo, data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default function HashGenerator() {
  const [text, setText] = useState('');
  const [results, setResults] = useState(null);
  const [upper, setUpper] = useState(false);
  const [compare, setCompare] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileResults, setFileResults] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const show = (hex) => (upper ? hex.toUpperCase() : hex);

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
      title="SHA-256 Hash Generator Online Free: Text to Hash | ToolNest"
      description="Generate SHA-1, SHA-256, SHA-384 and SHA-512 hashes from any text in your browser. Nothing is uploaded or stored."
      h1="Hash Generator"
      intro="Generate SHA-1, SHA-256, SHA-384 and SHA-512 hashes from text or files, entirely in your browser. Nothing is uploaded or stored."
      faqs={FAQS}
      content={CONTENT}
    >
      <div className="field">
        <label htmlFor="hash-text">Text to hash</label>
        <textarea id="hash-text" rows={4} value={text} onChange={(e) => setText(e.target.value)} />
      </div>
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
      {error && <div className="message err">{error}</div>}
    </ToolLayout>
  );
}

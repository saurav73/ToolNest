import React, { useState } from 'react';
import ToolLayout from '../../components/ToolLayout.jsx';
import CopyButton from '../../components/CopyButton.jsx';
import { downloadBlob, formatBytes } from '../../lib/files.js';

/* Files larger than this are refused so a huge Base64 string does not
   freeze the tab; 10 MB is the same cap rival file encoders use. */
const MAX_FILE_BYTES = 10 * 1024 * 1024;

const FAQS = [
  {
    q: 'What is Base64 used for?',
    a: 'Base64 turns binary data or text into a safe string of letters, digits, plus and slash characters. It is used to embed images in HTML and CSS, carry data in JSON, put attachments in email, and pass values in URLs and tokens where raw bytes would break things.',
  },
  {
    q: 'Can I encode a file to Base64?',
    a: 'Yes. Use the file picker below the input box to choose any file up to 10 MB, an image, PDF, ZIP or anything else, and its Base64 string appears in the result box, ready to copy into a data URI, JSON payload or email attachment. The file is read in your browser only and never uploaded.',
  },
  {
    q: 'Can I decode Base64 back into a file?',
    a: 'Yes. Paste the Base64 string, type the file name you want in the "Save decoded file as" box, and press "Download decoded file". The original bytes are rebuilt in your browser and saved to your device, which is how you recover an image, PDF or other file that was sent to you as Base64 text.',
  },
  {
    q: 'Is Base64 encryption?',
    a: 'No. Base64 is an encoding, not encryption. Anyone can decode a Base64 string instantly, which is exactly what the decoder above does. Never use it to protect passwords or secrets.',
  },
  {
    q: 'Does this tool handle non-English text?',
    a: 'Yes. The encoder first converts your text to UTF-8 bytes, so accents, non-Latin scripts and emoji all encode and decode correctly instead of producing errors or garbled output.',
  },
  {
    q: 'Why does encoded text end with = signs?',
    a: 'Base64 works in blocks of three bytes that become four characters. When the input does not divide evenly, padding characters (=) are added to complete the final block. One or two trailing = signs are normal.',
  },
];

const CONTENT = (
  <>
    <h2>Encode and decode Base64 instantly</h2>
    <p>
      Base64 shows up everywhere in development work: data URIs, API tokens, email
      attachments, JWT parts and configuration values. This tool converts both ways
      with full Unicode support, so text with accents or emoji survives the round
      trip, and it also handles files: upload any file up to 10 MB to encode it,
      or paste Base64 and download the original file back. Decoding validates the
      input and explains the problem if the string is not valid Base64.
    </p>
    <h2>Files in, files out</h2>
    <p>
      The most common file job is turning an image or document into a Base64
      string for embedding: pick the file below the input box and the encoded
      string lands in the result box, ready to paste after a data URI prefix
      such as data:image/png;base64,. Going the other way, paste a Base64 string
      you received, name the file you want, and download it rebuilt byte for
      byte. Both directions run entirely in your browser, so a private file
      never leaves your device.
    </p>
    <h2>A quick example</h2>
    <p>
      The word "Hello" encodes to <span className="mono">SGVsbG8=</span>. Notice the
      output is about a third longer than the input; that size increase is the
      normal cost of representing bytes in a text-safe alphabet.
    </p>
    <h2>How Base64 works under the hood</h2>
    <p>
      Computers store text as bytes, and each byte can hold 256 different
      values, many of which are invisible control characters that break when
      they pass through email systems, URLs or older protocols. Base64 solves
      this by regrouping the data. It takes your bytes three at a time, which
      is 24 bits, and splits them into four groups of 6 bits. Each 6 bit group
      names one character from a safe alphabet of 64: the capital letters, the
      lowercase letters, the digits, plus and slash. Four safe characters now
      carry what three raw bytes held, which is why the output grows by about
      a third. This tool first turns your text into UTF-8 bytes, the universal
      way to represent characters from every language, so an accented letter or
      an emoji becomes two to four bytes before encoding and comes back
      exactly as it started. When decoding, the process runs in reverse, and
      the tool checks the characters and length first, then confirms the
      decoded bytes really are valid UTF-8 before showing you the result.
    </p>
    <h2>Practical tips for everyday use</h2>
    <ul>
      <li><strong>Decode before you trust:</strong> if a link, token or config value contains a long Base64 looking string, decode it here to see the plain text it carries before pasting it anywhere sensitive.</li>
      <li><strong>Expect the size increase:</strong> budget about 33 percent more space for encoded data. A 300 KB image becomes roughly 400 KB as a data URI, which matters for page weight and email limits.</li>
      <li><strong>Keep padding intact:</strong> the equals signs at the end are part of the data. Some systems accept strings without them, but many decoders fail, so copy the full string including padding.</li>
      <li><strong>Watch for the URL safe variant:</strong> Base64 meant for web addresses swaps plus for minus and slash for underscore. If decoding fails on a string full of those two characters, it is probably the URL safe flavor.</li>
      <li><strong>Decode in layers when data is nested:</strong> JSON web tokens and some config formats encode more than once. If the decoded result still looks like Base64, run it through the decoder a second time.</li>
    </ul>
    <h2>A worked example with real values</h2>
    <p>
      Take the short text ToolNest, eight characters. Encoding produces
      VG9vbE5lc3Q=, twelve characters plus padding behavior you can verify
      above. Now picture a practical job. A settings file needs to carry the
      text admin@example.com inside a URL, where the at sign and dots can
      cause trouble in some parsers. Encoded, it becomes
      YWRtaW5AZXhhbXBsZS5jb20=, a single safe token with no special
      characters at all, and any system that receives it can decode it back to
      the exact address. Scale that idea up and you have how email attachments
      travel: the file bytes are encoded into lines of safe text, sent through
      systems designed only for text, and rebuilt byte for byte at the other
      end. Nothing about the content is hidden in the process, it is simply
      repackaged so text only channels can carry it without damage.
    </p>
    <h2>Common mistakes to avoid</h2>
    <ul>
      <li><strong>Treating Base64 as security:</strong> it hides nothing. A password stored in Base64 is a password anyone can read in seconds, as this very tool demonstrates.</li>
      <li><strong>Truncating the string:</strong> copying a selection that misses the first or last characters produces garbage or an error. Base64 length must be a multiple of four once padding is counted.</li>
      <li><strong>Letting line breaks and spaces confuse strict parsers:</strong> email style Base64 is often wrapped every 76 characters. This decoder ignores whitespace, but some systems do not, so remove stray breaks before feeding encoded text to rigid tools.</li>
      <li><strong>Encoding already encoded text by accident:</strong> double encoding is a frequent bug when data passes through two layers of code. If decoding once gives you another neat Base64 string, you have probably found it.</li>
      <li><strong>Expecting it to compress anything:</strong> Base64 always makes data larger, never smaller. Compress first with a real compression tool, then encode the result if it needs to travel as text.</li>
    </ul>
    <p>
      Base64 strings often live inside JSON. When a decoded payload needs
      tidying, paste it into the <a href="/json-formatter">JSON Formatter</a>{' '}
      to validate and pretty print it.
    </p>
  </>
);

function encodeBytes(bytes) {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function encodeBase64(text) {
  return encodeBytes(new TextEncoder().encode(text));
}

function decodeBytes(b64) {
  const clean = b64.replace(/\s/g, '');
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(clean) || clean.length % 4 === 1) {
    throw new Error('That does not look like valid Base64. Check for missing or extra characters.');
  }
  const binary = atob(clean);
  return Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
}

function decodeBase64(b64) {
  return new TextDecoder('utf-8', { fatal: true }).decode(decodeBytes(b64));
}

export default function Base64Tool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [decodeName, setDecodeName] = useState('decoded.bin');

  const run = (encode) => {
    if (!input) {
      setStatus({ ok: false, msg: 'Type or paste something first.' });
      return;
    }
    try {
      setOutput(encode ? encodeBase64(input) : decodeBase64(input));
      setStatus({ ok: true, msg: encode ? 'Encoded successfully.' : 'Decoded successfully.' });
    } catch (e) {
      setOutput('');
      setStatus({ ok: false, msg: e.message || 'Conversion failed.' });
    }
  };

  const onFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setStatus({ ok: false, msg: `That file is ${formatBytes(file.size)}. Files up to 10 MB can be encoded here; larger files are best handled with a command line encoder.` });
      return;
    }
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      setOutput(encodeBytes(bytes));
      setFileInfo({ name: file.name, size: file.size });
      setStatus({ ok: true, msg: `Encoded ${file.name} (${formatBytes(file.size)}). The Base64 string is in the result box.` });
    } catch (err) {
      setOutput('');
      setStatus({ ok: false, msg: 'That file could not be read. Try again or pick a different file.' });
    }
  };

  const downloadDecoded = () => {
    if (!input) {
      setStatus({ ok: false, msg: 'Paste a Base64 string first.' });
      return;
    }
    try {
      const bytes = decodeBytes(input);
      const name = (decodeName || '').trim() || 'decoded.bin';
      downloadBlob(new Blob([bytes]), name);
      setStatus({ ok: true, msg: `Decoded file saved as ${name} (${formatBytes(bytes.length)}).` });
    } catch (e) {
      setStatus({ ok: false, msg: e.message || 'Conversion failed.' });
    }
  };

  return (
    <ToolLayout
      slug="base64-encoder-decoder"
      path="/base64-encoder-decoder"
      title="Base64 Encoder and Decoder: Files and Text | ToolNest"
      description="Encode files or text to Base64 and decode Base64 back to text or a file, with full Unicode support. Free and private."
      h1="Base64 Encoder / Decoder"
      intro="Convert text to Base64, or decode a Base64 string back to readable text. You can also encode any file up to 10 MB, or download a decoded file."
      faqs={FAQS}
      content={CONTENT}
    >
      <div className="field">
        <label htmlFor="b64-in">Input</label>
        <textarea
          id="b64-in"
          value={input}
          onChange={(e) => { setInput(e.target.value); setStatus(null); }}
          placeholder="Text to encode, or Base64 to decode..."
          aria-label="Base64 input"
          autoFocus
        />
      </div>
      <div className="field">
        <label htmlFor="b64-file">Or upload a file to encode</label>
        <input id="b64-file" type="file" onChange={onFile} />
        {fileInfo && (
          <p className="hint">Encoded {fileInfo.name} ({formatBytes(fileInfo.size)}). The Base64 string is in the result box below.</p>
        )}
      </div>
      <div className="field">
        <label htmlFor="b64-out">Result</label>
        <textarea
          id="b64-out"
          className="output"
          value={output}
          readOnly
          placeholder="Your result will appear here..."
          aria-label="Base64 result"
        />
      </div>
      {status && <div className={`message ${status.ok ? 'ok' : 'err'}`}>{status.msg}</div>}
      <div className="btn-row">
        <button type="button" className="btn" onClick={() => run(true)}>Encode to Base64</button>
        <button type="button" className="btn secondary" onClick={() => run(false)}>Decode from Base64</button>
        <CopyButton text={output} className="btn secondary" />
        <button type="button" className="btn ghost" onClick={() => { setInput(''); setOutput(''); setStatus(null); setFileInfo(null); }} disabled={!input && !output}>Clear</button>
      </div>
      <div className="field">
        <label htmlFor="b64-filename">Save decoded file as</label>
        <input
          id="b64-filename"
          type="text"
          value={decodeName}
          onChange={(e) => setDecodeName(e.target.value)}
          placeholder="decoded.bin"
        />
        <p className="hint">Paste a Base64 string above, name the file, and download the original bytes rebuilt in your browser.</p>
        <div className="btn-row">
          <button type="button" className="btn secondary" onClick={downloadDecoded} disabled={!input}>Download decoded file</button>
        </div>
      </div>
    </ToolLayout>
  );
}

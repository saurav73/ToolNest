import React, { useEffect, useRef, useState } from 'react';
import ToolLayout from '../../components/ToolLayout.jsx';
import FileDrop from '../../components/FileDrop.jsx';
import CopyButton from '../../components/CopyButton.jsx';
import { ProcessingNote, BusyLabel } from '../../components/ProcessUI.jsx';
import { downloadBlob, loadImageFromFile } from '../../lib/files.js';

const FAQS = [
  {
    q: 'How does the text recognition work?',
    a: 'The tool loads Tesseract, the long established open source OCR engine, compiled to WebAssembly, and runs it in a background worker in your browser. It analyses the shapes in your image, matches them against its English language data, and returns the text it finds along with word positions. The first run downloads the engine and language data (a few megabytes) from a public CDN; after that it is cached by your browser.',
  },
  {
    q: 'Is my image uploaded for OCR?',
    a: 'No. Recognition runs entirely on your device, which is the point of building it this way: documents people most want OCR for, receipts, letters, statements, are exactly the ones they least want to upload. Only the OCR engine files themselves are fetched, once; your image never leaves the browser.',
  },
  {
    q: 'What kinds of images give the best results?',
    a: 'Clear, straight on photos or scans of printed text at a decent size work best: receipts, book pages, signs, documents and screenshots. Aim for sharp focus, even lighting and text that is not tiny. Handwriting, heavily stylised fonts, and text photographed at a steep angle will produce errors or fail, and the tool says so honestly rather than pretending otherwise.',
  },
  {
    q: 'Which languages are supported?',
    a: 'English, which covers the vast majority of documents people run through a quick converter. Keeping one language loaded keeps the tool fast and the download small. Mixed English documents with the odd foreign name or place usually still read well.',
  },
];

const CONTENT = (
  <>
    <h2>Pull the text out of any picture, privately</h2>
    <p>
      Text trapped inside an image is surprisingly useless: you cannot search
      it, quote it, edit it or paste it anywhere. OCR, optical character
      recognition, is the bridge, and it usually comes with a catch: upload
      your document to someone's server and wait. This converter runs the
      whole recognition on your device instead. The engine is Tesseract, the
      open source OCR that has powered everything from library archives to
      Google's own projects, compiled to WebAssembly and run in your browser.
      Your receipt, letter or statement is analysed where it sits, and only
      the extracted text ever appears on screen. For documents you would not
      email to a stranger, that difference is the entire product.
    </p>
    <h2>How to extract text from an image</h2>
    <p>
      Drop a JPG, PNG or WebP image onto the box, or click to choose one, then
      press Extract text. The first time you run it, the browser downloads
      the OCR engine and English language data (a few megabytes from a public
      CDN) and caches them for next time. A progress indicator follows the
      recognition as it works through the image. When it finishes, the text
      appears in the box below, ready to copy in one click or download as a
      plain text file. Check it over before relying on it: OCR is very good
      on clean print and honestly fallible on poor photos, and a quick proof
      read catches the handful of characters it may have mistaken.
    </p>
    <h2>Good jobs for OCR</h2>
    <ul>
      <li><strong>Receipts and invoices:</strong> pull totals, dates and item lines into a spreadsheet or expense note instead of typing them.</li>
      <li><strong>Book and document excerpts:</strong> quote a paragraph from a scanned page without retyping it.</li>
      <li><strong>Screenshots:</strong> recover the text from an error message, chat or settings screen so you can search for it.</li>
      <li><strong>Signs, labels and menus:</strong> photographed text becomes something you can paste into notes or a translator.</li>
      <li><strong>Printed forms and letters:</strong> turn a paper letter someone mailed you into an editable digital copy.</li>
    </ul>
    <h2>How OCR works under the hood</h2>
    <p>
      Tesseract first prepares the image: it works out where the blocks of
      text sit, straightens the baseline, and separates foreground letters
      from background. Then a neural network, trained on millions of lines of
      printed text, reads each line character by character while a language
      model nudges ambiguous shapes toward real words, which is why "rn" in a
      blurry photo usually resolves to the "m" the sentence needed. Running
      that in a browser used to be impossible; WebAssembly changed it, letting
      the same C++ engine that servers run execute in a sandboxed worker in
      your tab at close to native speed. The honest limits are physical ones:
      the engine cannot invent pixels that are not there, so tiny, blurred or
      shadowed text will always read worse than a clean scan, and handwriting
      is largely beyond it.
    </p>
    <h2>Tips for cleaner results</h2>
    <ul>
      <li><strong>Photograph straight on, in good light.</strong> Angle and shadow are the two biggest accuracy killers; a flat, evenly lit shot reads dramatically better.</li>
      <li><strong>Crop to the text.</strong> Trim busy borders and unrelated content before running OCR, so the engine spends its effort on the words.</li>
      <li><strong>Bigger is better.</strong> If text is small in the frame, retake the photo closer rather than zooming digitally afterwards.</li>
      <li><strong>Proofread numbers twice.</strong> OCR confuses 0 and O, 1 and l, 5 and S. Totals and reference numbers deserve a careful check against the image.</li>
      <li><strong>For a fully text PDF, start from the source.</strong> If the document began life digitally, the text is already in there; a scanned image is where OCR earns its keep.</li>
    </ul>
    <h2>A worked example</h2>
    <p>
      A freelancer photographs a paper purchase order a client handed her,
      because she needs the line items in her invoicing notes. She drops the
      photo here, runs the extraction, and in under a minute has every item,
      quantity and price as text she can paste and tidy. The purchase order
      contained the client's internal pricing, and it was never uploaded to
      any server to get there.
    </p>
  </>
);

export default function ImageToText() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [pct, setPct] = useState(0);
  const [error, setError] = useState('');
  const urlRef = useRef('');

  useEffect(() => () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
  }, []);

  const onFiles = async (files) => {
    const f = files[0];
    setError('');
    setText('');
    try {
      const { url } = await loadImageFromFile(f);
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = url;
      setFile(f);
      setPreviewUrl(url);
    } catch (e) {
      setError('That file could not be read as an image. Choose a JPG, PNG or WebP picture of printed text.');
    }
  };

  const extract = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    setText('');
    setPct(0);
    setStatus('Loading the OCR engine (first run downloads a few MB)...');
    let worker = null;
    try {
      const { createWorker } = await import('tesseract.js');
      worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setPct(Math.round((m.progress || 0) * 100));
            setStatus(`Recognising text: ${Math.round((m.progress || 0) * 100)}%`);
          } else if (m.status) {
            setStatus(`${m.status.charAt(0).toUpperCase() + m.status.slice(1)}...`);
          }
        },
      });
      const { data } = await worker.recognize(file);
      const found = (data && data.text ? data.text : '').trim();
      if (!found) {
        setError('No readable text was found in that image. OCR works best on clear, straight on photos of printed text; handwriting and very small or blurry text usually cannot be read.');
      } else {
        setText(found);
      }
    } catch (e) {
      setError('Text recognition failed. The OCR engine loads from a CDN on first use, so check your connection and try again.');
    } finally {
      if (worker) { try { await worker.terminate(); } catch { /* already gone */ } }
      setStatus('');
      setPct(0);
      setBusy(false);
    }
  };

  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;

  return (
    <ToolLayout
      slug="image-to-text"
      path="/image-to-text"
      title="Image to Text Converter Free: OCR in Your Browser | ToolNest"
      description="Extract text from images and photos with free OCR in your browser. Copy the text or download it as a file. Images are never uploaded."
      h1="Image to Text Converter"
      intro="Extract the text from photos, scans and screenshots with OCR that runs entirely in your browser. Your image is never uploaded, which makes this safe for receipts, letters and private documents."
      faqs={FAQS}
      content={CONTENT}
    >
      <FileDrop accept="image/jpeg,image/png,image/webp" onFiles={onFiles} label="Drop an image with printed text here, or click to choose one" />
      {error && <div className="message err">{error}</div>}

      {file && (
        <>
          <div className="qr-preview">
            <img src={previewUrl} alt="Image to read text from" style={{ maxWidth: 'min(420px, 100%)' }} />
          </div>
          <div className="btn-row">
            <button type="button" className="btn" onClick={extract} disabled={busy}>
              {busy ? <BusyLabel label="Reading your image..." /> : 'Extract text'}
            </button>
            {text && !busy && <CopyButton text={text} label="Copy text" className="btn secondary" />}
            {text && !busy && (
              <button type="button" className="btn secondary" onClick={() => downloadBlob(new Blob([text], { type: 'text/plain' }), 'extracted-text.txt')}>
                Download .txt
              </button>
            )}
          </div>

          {busy && <ProcessingNote label={status || 'Reading your image...'} />}
          {busy && pct > 0 && (
            <div className="meter" aria-hidden="true" style={{ marginTop: 10 }}>
              <div style={{ width: `${pct}%`, background: 'var(--accent)' }} />
            </div>
          )}

          {text && !busy && (
            <div className="field" style={{ marginTop: 16 }}>
              <label htmlFor="ocr-text">Extracted text ({wordCount} words, {text.length} characters)</label>
              <textarea id="ocr-text" className="mono" rows={12} value={text} onChange={(e) => setText(e.target.value)} />
              <p className="hint">Proofread before relying on it: OCR can mix up similar characters such as 0 and O, especially in low quality photos.</p>
            </div>
          )}
        </>
      )}
    </ToolLayout>
  );
}

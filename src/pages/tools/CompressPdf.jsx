import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import ToolLayout from '../../components/ToolLayout.jsx';
import FileDrop from '../../components/FileDrop.jsx';
import { ProcessingNote, SuccessDownload, BusyLabel } from '../../components/ProcessUI.jsx';
import { formatBytes, downloadBlob, holdAtLeast } from '../../lib/files.js';

GlobalWorkerOptions.workerSrc = workerUrl;

const LEVELS = [
  { id: 'high', label: 'High quality (gentle compression)', scale: 1.5, quality: 0.82 },
  { id: 'medium', label: 'Balanced (recommended)', scale: 1.1, quality: 0.68 },
  { id: 'small', label: 'Smallest file (lower quality)', scale: 0.8, quality: 0.5 },
];

const FAQS = [
  {
    q: 'How does this compressor shrink a PDF?',
    a: 'Each page is rendered in your browser at a reduced resolution and saved as an efficient JPEG image inside a new PDF. Most large PDFs are heavy because of oversized embedded images, so re-rendering pages at screen resolution removes most of the weight. You see the size before and after before deciding to keep the result.',
  },
  {
    q: 'Will my text stay selectable after compression?',
    a: 'No, and this matters. Because pages are rebuilt from rendered images, text in the compressed PDF is part of the picture and can no longer be selected, copied or searched. If you need searchable text, keep the original for records and use the compressed copy only for sending and sharing.',
  },
  {
    q: 'Why did my file barely shrink, or even grow?',
    a: 'Text-only PDFs are already tiny and efficient; turning their pages into images can make them larger. This tool shines on PDFs with photos and scans. If the result is not smaller, the tool tells you and you can simply keep your original.',
  },
  {
    q: 'Can I compress several PDFs at once?',
    a: 'Yes. Drop several PDFs, pick one level, and compress them in one run. Each compressed file gets its own download, and when more than one succeeds you can also download them all as a single ZIP. A file that is already efficient is left out, with a note, so you keep the original instead.',
  },
  {
    q: 'Is my document uploaded for compression?',
    a: 'No. Rendering and rebuilding happen entirely in your browser. Your PDF never leaves your device, which is why this is safe for private documents.',
  },
];

const CONTENT = (
  <>
    <h2>Make big PDFs small enough to send</h2>
    <p>
      Scanned documents and image-heavy reports routinely exceed email and portal
      limits of 5, 10 or 25 MB. This compressor rebuilds each page at a sensible
      resolution and shows you the before and after sizes, so you only download the
      result when it actually helps. Drop several PDFs at once and compress them in
      one run, with a single ZIP download for the results. Three levels let you trade quality for size:
      gentle for near-original clarity, balanced for everyday sending, and smallest
      for strict upload limits.
    </p>
    <h2>Before you compress</h2>
    <ul>
      <li>The compressed copy has <strong>image-based pages</strong>: text is not selectable or searchable.</li>
      <li><strong>Keep your original</strong> as the record copy; compress only the copy you send.</li>
      <li>Documents with forms, signatures or fine print deserve the high quality setting and a quick visual check afterwards.</li>
    </ul>
    <h2>How compression works under the hood</h2>
    <p>
      This tool takes a different approach from simply repacking a PDF file. Your browser opens the document with pdf.js, the widely used open source renderer for viewing PDFs on the web, and draws each page onto a canvas at the resolution linked to the level you choose. High quality renders at one and a half times the normal page scale, balanced at a little above normal scale, and smallest below normal scale. Each rendered page is then saved as a JPEG image at a matching quality setting and placed into a new PDF built with pdf-lib, at the same physical page size as the original. Because the work is rendering and image encoding inside your browser tab, no server ever sees the document. That design explains both the strength and the trade off of the method. Scanned pages stored as enormous images shrink dramatically when re rendered at a sensible size, while the rebuilding step is also why text becomes part of the picture and bookmarks and form fields do not carry across.
    </p>
    <h2>Practical tips for getting better results</h2>
    <ul>
      <li><strong>Start with balanced, then adjust.</strong> Balanced is the right first try for most scanned documents. If the result still misses a limit, run the original again at smallest rather than compressing an already compressed copy, which would blur pages a second time.</li>
      <li><strong>Match the level to the final use.</strong> A document read only on phones and laptops tolerates smallest well. A document that will be printed or read for small print deserves high quality, even if the saving is more modest.</li>
      <li><strong>Split before compressing a mixed document.</strong> If a 60 page file has only 5 photo heavy pages, use <a href="/split-pdf">Split PDF</a> to separate them, compress just that section, and rejoin everything with <a href="/merge-pdf">Merge PDF</a>. The text pages keep selectable text and the file still gets much smaller.</li>
      <li><strong>Check a dense page at full size.</strong> After compressing, open the result and zoom in on the page with the smallest text, such as terms or footnotes. If those lines stay comfortable to read, the rest will be fine.</li>
    </ul>
    <h2>A worked example</h2>
    <p>
      Consider a scanned 12 page rental agreement saved at 18.6 MB, far above a letting portal limit of 5 MB. The pages contain black text, a few colour stamps, and two pages of property photos. At high quality, the rebuilt file comes out at about 7.9 MB, clearer but still too large. Running the original again at balanced produces about 3.8 MB, comfortably under the limit, with text that remains easy to read on screen. At smallest the file drops to about 1.9 MB, but photo pages look softer and small print needs a closer look. For this job balanced is the sensible choice to upload, while the original stays saved as the permanent record.
    </p>
    <h2>Common mistakes to avoid</h2>
    <ul>
      <li><strong>Compressing a text only PDF and expecting a saving.</strong> A born digital report with embedded fonts may be only 220 KB to begin with. Rebuilding its pages as images can produce a file of 1 MB or more. The tool will warn you when the result is not smaller, and in that case the original is already the better file.</li>
      <li><strong>Deleting the original after compressing.</strong> Once pages are images, you cannot recover selectable text or original resolution from the compressed copy. Always keep the source file and treat the compressed version as a sending copy only.</li>
      <li><strong>Compressing twice to chase a limit.</strong> Each pass renders the previous pictures again at lower quality, so text edges get fuzzier every time. If one pass at smallest still misses the limit, splitting the document into two parts usually looks better than a second pass.</li>
      <li><strong>Ignoring interactive elements.</strong> Fillable forms, digital signatures, and clickable links do not survive rebuilding as images. Submit the original whenever the recipient needs to complete, sign, or click anything.</li>
    </ul>
  </>
);

export default function CompressPdf() {
  const [files, setFiles] = useState([]);
  const [levelId, setLevelId] = useState('medium');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);
  const [outputs, setOutputs] = useState([]);

  const onFiles = (newFiles) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setStatus(null);
    setResult(null);
    setOutputs([]);
    setProgress('');
  };
  const remove = (idx) => {
    setResult(null);
    setOutputs([]);
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const compressOne = async (file, level, onPage) => {
    const data = new Uint8Array(await file.arrayBuffer());
    const src = await getDocument({ data }).promise;
    const out = await PDFDocument.create();
    const total = src.numPages;
    for (let i = 1; i <= total; i += 1) {
      if (onPage) onPage(`Processing page ${i} of ${total}...`);
      const page = await src.getPage(i);
      const unscaled = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: level.scale });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvas, canvasContext: ctx, viewport }).promise;
      const blob = await new Promise((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('render'))), 'image/jpeg', level.quality));
      const jpg = await out.embedJpg(new Uint8Array(await blob.arrayBuffer()));
      const newPage = out.addPage([unscaled.width, unscaled.height]);
      newPage.drawImage(jpg, { x: 0, y: 0, width: unscaled.width, height: unscaled.height });
    }
    const saved = await out.save();
    const before = file.size;
    const after = saved.length;
    if (after >= before) return { skipped: true, name: file.name, before, after, pages: total };
    return {
      blob: new Blob([saved], { type: 'application/pdf' }),
      name: `compressed-${file.name}`,
      sourceName: file.name,
      before,
      after,
      pct: Math.round((1 - after / before) * 100),
      pages: total,
    };
  };

  const compress = async () => {
    if (!files.length) return;
    const level = LEVELS.find((l) => l.id === levelId);
    const started = Date.now();
    setBusy(true);
    setStatus(null);
    setResult(null);
    setOutputs([]);
    setProgress('Compressing your PDF...');
    try {
      if (files.length === 1) {
        const out = await compressOne(files[0], level, (p) => setProgress(p));
        await holdAtLeast(started);
        if (out.skipped) {
          setStatus({
            ok: false,
            msg: `The rebuilt file (${formatBytes(out.after)}) is not smaller than your original (${formatBytes(out.before)}). This PDF is already efficient, so keep the original.`,
          });
        } else {
          setResult(out);
        }
      } else {
        const done = [];
        const usedNames = new Set();
        const uniqueName = (name) => {
          if (!usedNames.has(name)) { usedNames.add(name); return name; }
          const base = name.replace(/\.pdf$/i, '');
          let i = 2;
          let candidate = `${base}-${i}.pdf`;
          while (usedNames.has(candidate)) { i += 1; candidate = `${base}-${i}.pdf`; }
          usedNames.add(candidate);
          return candidate;
        };
        for (let i = 0; i < files.length; i += 1) {
          setProgress(`Compressing PDF ${i + 1} of ${files.length}: ${files[i].name}`);
          try {
            const out = await compressOne(files[i], level, (p) => setProgress(`PDF ${i + 1} of ${files.length}: ${p}`));
            done.push({ ...out, name: uniqueName(out.name) });
          } catch (e) {
            done.push({ name: files[i].name, error: 'Compression failed. The file may be encrypted, damaged, or too large for your device\'s memory.' });
          }
          setOutputs([...done]);
        }
        await holdAtLeast(started);
        if (done.filter((d) => d.blob).length === 0) {
          setStatus({ ok: false, msg: 'None of the PDFs could be compressed to a smaller file. Keep the originals.' });
        }
      }
    } catch (e) {
      setStatus({ ok: false, msg: 'Compression failed. The file may be encrypted, damaged, or too large for your device\'s memory.' });
    }
    setProgress('');
    setBusy(false);
  };

  const downloadZip = async () => {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    outputs.filter((o) => o.blob).forEach((o) => zip.file(o.name, o.blob));
    const blob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(blob, 'compressed-pdfs.zip');
  };

  const good = outputs.filter((o) => o.blob);

  return (
    <ToolLayout
      slug="compress-pdf"
      path="/compress-pdf"
      title="Compress PDF: Reduce PDF File Size Online | ToolNest"
      description="Compress PDF files in your browser by rebuilding pages at efficient resolution. See before/after sizes. No upload, documents stay private."
      h1="Compress PDF"
      intro="Reduce the size of a PDF in your browser and compare the result before downloading. Drop several PDFs to compress them in one run, with a single ZIP download. Nothing is uploaded, so private documents stay on your device."
      faqs={FAQS}
      content={CONTENT}
    >
      <FileDrop accept="application/pdf,.pdf" multiple onFiles={onFiles} label="Drop PDFs here, or click to choose them (batch supported)" />

      {files.length > 0 && (
        <ul className="file-list">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="file-item">
              <span className="file-name">{i + 1}. {f.name}</span>
              <span className="file-size">{formatBytes(f.size)}</span>
              <span className="file-actions">
                <button type="button" className="btn ghost" onClick={() => remove(i)} disabled={busy}>Remove</button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="field" style={{ marginTop: 8 }}>
        <label htmlFor="cp-level">Compression level</label>
        <select id="cp-level" value={levelId} onChange={(e) => setLevelId(e.target.value)}>
          {LEVELS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
        </select>
      </div>

      {busy && <ProcessingNote label={progress || 'Compressing your PDF...'} />}
      {status && <div className={`message ${status.ok ? 'ok' : 'err'}`}>{status.msg}</div>}
      {result && !busy && (
        <SuccessDownload
          message={`Your PDF has been compressed: ${formatBytes(result.before)} reduced to ${formatBytes(result.after)} (${result.pct}% smaller, ${result.pages} pages). Click Download to save it. Remember the compressed pages are images, so text is not selectable.`}
          buttonLabel="Download compressed PDF"
          onDownload={() => downloadBlob(result.blob, result.name)}
        />
      )}
      <div className="btn-row">
        <button type="button" className="btn" onClick={compress} disabled={busy || !files.length}>
          {busy ? <BusyLabel label="Compressing your PDF..." /> : (files.length > 1 ? `Compress ${files.length} PDFs` : 'Compress PDF')}
        </button>
        {files.length > 0 && <button type="button" className="btn ghost" onClick={() => { setFiles([]); setResult(null); setOutputs([]); setStatus(null); }} disabled={busy}>Clear list</button>}
        {good.length > 1 && !busy && (
          <button type="button" className="btn secondary" onClick={downloadZip}>Download all as ZIP</button>
        )}
      </div>
      {outputs.length > 0 && (
        <div className="file-results">
          {outputs.map((o, i) => (
            <div className="file-row" key={`${o.name}-${i}`}>
              {o.blob ? (
                <>
                  <span className="file-name">{o.name}</span>
                  <span className="file-size">{formatBytes(o.before)} to {formatBytes(o.after)} ({o.pct}% smaller, {o.pages} pages)</span>
                  <button type="button" className="btn secondary" onClick={() => downloadBlob(o.blob, o.name)}>Download</button>
                </>
              ) : (
                <>
                  <span className="file-name">{o.name}</span>
                  <span className="file-error">{o.error || `Already efficient (${formatBytes(o.after)} vs ${formatBytes(o.before)} original), so the original was kept.`}</span>
                </>
              )}
            </div>
          ))}
        </div>
      )}
      <p className="hint">
        Honest note: pages are rebuilt as images, so text in the compressed file
        cannot be selected or searched. Best for scans and photo-heavy documents.
      </p>
    </ToolLayout>
  );
}

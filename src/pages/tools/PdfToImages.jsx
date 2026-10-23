import React, { useEffect, useRef, useState } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import ToolLayout from '../../components/ToolLayout.jsx';
import FileDrop from '../../components/FileDrop.jsx';
import { ProcessingNote, BusyLabel } from '../../components/ProcessUI.jsx';
import { formatBytes, downloadBlob, holdAtLeast, swapExt } from '../../lib/files.js';

GlobalWorkerOptions.workerSrc = workerUrl;

const SCALES = [
  { scale: 1, dpi: 72, label: '72 DPI (screen, smallest files)' },
  { scale: 1.5, dpi: 108, label: '108 DPI (balanced)' },
  { scale: 2, dpi: 144, label: '144 DPI (sharp, recommended)' },
  { scale: 3, dpi: 216, label: '216 DPI (print quality, larger files)' },
];

const MAX_PAGES_PER_RUN = 50;

/**
 * PDF to image converter: renders each selected page with pdf.js onto a
 * canvas at the chosen scale and exports JPG or PNG per page, with a ZIP
 * download for multi-page results. Runs entirely in the browser, so the
 * document is never uploaded.
 * format: { mime: 'image/jpeg', ext: 'jpg', label: 'JPG' }
 */
export default function PdfToImages({ slug, path, title, description, h1, intro, faqs, content, format }) {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [scaleId, setScaleId] = useState(2);
  const [rangeFrom, setRangeFrom] = useState(1);
  const [rangeTo, setRangeTo] = useState(1);
  const [outputs, setOutputs] = useState([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const docRef = useRef(null);
  const urlsRef = useRef([]);

  useEffect(() => () => {
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    if (docRef.current) docRef.current.destroy();
  }, []);

  const onFiles = async (files) => {
    const f = files[0];
    setError('');
    setOutputs([]);
    setFile(null);
    setPageCount(0);
    try {
      const data = new Uint8Array(await f.arrayBuffer());
      const doc = await getDocument({ data }).promise;
      if (docRef.current) docRef.current.destroy();
      docRef.current = doc;
      setFile(f);
      setPageCount(doc.numPages);
      setRangeFrom(1);
      setRangeTo(doc.numPages);
    } catch (e) {
      setError('That file could not be opened as a PDF. It may be corrupted or password protected.');
    }
  };

  const convert = async () => {
    const doc = docRef.current;
    if (!doc || !file) return;
    const from = Math.min(Math.max(1, rangeFrom || 1), pageCount);
    const to = Math.min(Math.max(from, rangeTo || pageCount), pageCount);
    if (to - from + 1 > MAX_PAGES_PER_RUN) {
      setError(`That range is ${to - from + 1} pages. To keep your browser responsive, convert at most ${MAX_PAGES_PER_RUN} pages per run and adjust the range.`);
      return;
    }
    const opt = SCALES.find((s) => s.dpi === scaleId) || SCALES[2];
    const started = Date.now();
    setBusy(true);
    setError('');
    setOutputs([]);
    const done = [];
    try {
      for (let p = from; p <= to; p += 1) {
        setProgress(`Rendering page ${p} of ${to}...`);
        const page = await doc.getPage(p);
        const viewport = page.getViewport({ scale: opt.scale });
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        const blob = await new Promise((resolve, reject) =>
          canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode'))), format.mime, format.mime === 'image/jpeg' ? 0.92 : undefined));
        const base = swapExt(file.name, format.ext).replace(/\.[^.]+$/, '');
        const url = URL.createObjectURL(blob);
        urlsRef.current.push(url);
        done.push({ page: p, name: `${base}-page-${p}.${format.ext}`, blob, url, width: canvas.width, height: canvas.height });
        setOutputs([...done]);
      }
      await holdAtLeast(started);
    } catch (e) {
      setError('A page failed to render. Very large pages at high DPI can run out of memory; try a lower DPI or a smaller page range.');
    }
    setProgress('');
    setBusy(false);
  };

  const downloadZip = async () => {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    outputs.forEach((o) => zip.file(o.name, o.blob));
    const blob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(blob, `${swapExt(file.name, 'zip')}`);
  };

  const opt = SCALES.find((s) => s.dpi === scaleId);

  return (
    <ToolLayout
      slug={slug}
      path={path}
      title={title}
      description={description}
      h1={h1}
      intro={intro}
      faqs={faqs}
      content={content}
    >
      <FileDrop accept="application/pdf,.pdf" onFiles={onFiles} label="Drop a PDF here, or click to choose one" />
      {error && <div className="message err">{error}</div>}

      {file && pageCount > 0 && (
        <>
          <div className="stat-grid" style={{ marginTop: 16 }}>
            <div className="stat"><div className="num">{formatBytes(file.size)}</div><div className="lbl">PDF size</div></div>
            <div className="stat"><div className="num">{pageCount}</div><div className="lbl">Pages</div></div>
            <div className="stat"><div className="num">{outputs.length || '...'}</div><div className="lbl">Images made</div></div>
          </div>

          <div className="row" style={{ marginTop: 16 }}>
            <div className="field">
              <label htmlFor="p2i-scale">Resolution</label>
              <select id="p2i-scale" value={scaleId} onChange={(e) => setScaleId(Number(e.target.value))}>
                {SCALES.map((s) => <option key={s.dpi} value={s.dpi}>{s.label}</option>)}
              </select>
              <p className="hint">Higher DPI means sharper images and bigger files. 144 DPI suits most sharing and slides.</p>
            </div>
            <div className="field">
              <label>Pages to convert</label>
              <div className="row" style={{ gap: 8 }}>
                <input type="number" min="1" max={pageCount} value={rangeFrom} onChange={(e) => setRangeFrom(Number(e.target.value))} aria-label="First page" />
                <input type="number" min="1" max={pageCount} value={rangeTo} onChange={(e) => setRangeTo(Number(e.target.value))} aria-label="Last page" />
              </div>
              <p className="hint">Page range, from first to last (document has {pageCount} page{pageCount > 1 ? 's' : ''}, up to {MAX_PAGES_PER_RUN} per run).</p>
            </div>
          </div>

          <div className="btn-row">
            <button type="button" className="btn" onClick={convert} disabled={busy}>
              {busy ? <BusyLabel label={`Rendering at ${opt.dpi} DPI...`} /> : `Convert pages to ${format.label}`}
            </button>
            {outputs.length > 1 && !busy && (
              <button type="button" className="btn secondary" onClick={downloadZip}>Download all as ZIP</button>
            )}
          </div>

          {busy && <ProcessingNote label={progress || 'Rendering your PDF pages...'} />}

          {outputs.length > 0 && (
            <div className="file-results">
              {outputs.map((o) => (
                <div className="file-row" key={o.page}>
                  <img src={o.url} alt="" className="file-thumb" />
                  <span className="file-name">{o.name}</span>
                  <span className="file-size">{o.width} × {o.height} px, {formatBytes(o.blob.size)}</span>
                  <button type="button" className="btn secondary" onClick={() => downloadBlob(o.blob, o.name)}>Download</button>
                </div>
              ))}
            </div>
          )}

          {outputs.length > 0 && !busy && (
            <p className="hint" style={{ marginTop: 12 }}>
              Done: {outputs.length} page{outputs.length > 1 ? 's' : ''} rendered to {format.label} at {opt.dpi} DPI on your device. The PDF was never uploaded.
            </p>
          )}
        </>
      )}
    </ToolLayout>
  );
}

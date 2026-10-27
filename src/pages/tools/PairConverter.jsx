import React, { useEffect, useRef, useState } from 'react';
import ToolLayout from '../../components/ToolLayout.jsx';
import FileDrop from '../../components/FileDrop.jsx';
import { ProcessingNote, SuccessDownload, BusyLabel } from '../../components/ProcessUI.jsx';
import { formatBytes, downloadBlob, holdAtLeast, loadImageFromFile, imageToCanvas, canvasToBlob, swapExt } from '../../lib/files.js';

/**
 * Image converter locked to one format pair (e.g. PNG to JPG).
 * Shared engine behind the per-pair pages; each page supplies its own
 * title, copy, FAQs and the from/to format definitions.
 * from/to: { label: 'PNG', sub: 'PNG', mime: 'image/png', ext: 'png' }
 * `sub` is the short badge shown on the drop label and buttons.
 * Single file: preview plus one download, as before. Several files:
 * batch mode converts each in turn and offers the results one by one
 * or all together as a ZIP, matching the batch pattern of the HEIC
 * converters and of CloudConvert-style competitors.
 */
export default function PairConverter({ slug, path, title, description, h1, intro, faqs, content, from, to, loadError }) {
  const [file, setFile] = useState(null);
  const [img, setImg] = useState(null);
  const [batch, setBatch] = useState([]); // [{ file, img, url }]
  const [outputs, setOutputs] = useState([]); // [{ name, blob, url, sourceName, error }]
  const [quality, setQuality] = useState(92);
  const [resizeWidth, setResizeWidth] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const urlRef = useRef('');
  const batchUrlsRef = useRef([]);

  const lossy = to.mime === 'image/jpeg' || to.mime === 'image/webp';

  useEffect(() => () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    if (result && result.url) URL.revokeObjectURL(result.url);
    batchUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
  }, [result]);

  const clearBatch = () => {
    batchUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    batchUrlsRef.current = [];
    setBatch([]);
    setOutputs([]);
    setProgress('');
  };

  const convertOne = async (el, maxW) => {
    let outW = el.naturalWidth;
    let outH = el.naturalHeight;
    if (Number.isFinite(maxW) && maxW > 0 && maxW < el.naturalWidth) {
      const scale = maxW / el.naturalWidth;
      outW = maxW;
      outH = Math.max(1, Math.round(el.naturalHeight * scale));
    }
    const canvas = imageToCanvas(el, outW, outH);
    if (to.mime === 'image/jpeg') {
      const ctx = canvas.getContext('2d');
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    const blob = await canvasToBlob(canvas, to.mime, lossy ? quality / 100 : undefined);
    return { blob, width: outW, height: outH };
  };

  const onFiles = async (files) => {
    const list = [...(files || [])];
    setError('');
    setResult(null);
    clearBatch();
    if (list.length <= 1) {
      const f = list[0];
      if (!f) { setFile(null); setImg(null); return; }
      if (f.type && f.type !== from.mime) {
        setFile(null);
        setImg(null);
        setError(`That file is not a ${from.label}. This page converts ${from.label} to ${to.label}; for other formats use the Image Converter, which handles JPG, PNG and WebP in any direction.`);
        return;
      }
      try {
        const { img: el, url } = await loadImageFromFile(f);
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        urlRef.current = url;
        setFile(f);
        setImg(el);
      } catch (e) {
        setError(loadError || e.message);
      }
      return;
    }
    setFile(null);
    setImg(null);
    const accepted = list.filter((f) => f.type === from.mime || f.name.toLowerCase().endsWith(`.${from.ext}`));
    if (!accepted.length) {
      setError(`None of those files are ${from.label} images. This page converts ${from.label} to ${to.label}; for other formats use the Image Converter, which handles JPG, PNG and WebP in any direction.`);
      return;
    }
    const loaded = [];
    let skipped = 0;
    for (const f of accepted) {
      try {
        const { img: el, url } = await loadImageFromFile(f);
        batchUrlsRef.current.push(url);
        loaded.push({ file: f, img: el, url });
      } catch (e) {
        skipped += 1;
      }
    }
    if (!loaded.length) {
      setError(loadError || 'None of those files could be read as images.');
      return;
    }
    if (skipped) setError(`${skipped} file${skipped > 1 ? 's' : ''} could not be read as images and were skipped.`);
    setBatch(loaded);
  };

  const convert = async () => {
    if (!img || !file) return;
    const started = Date.now();
    setBusy(true);
    setError('');
    try {
      const maxW = parseInt(resizeWidth, 10);
      const { blob, width, height } = await convertOne(img, maxW);
      await holdAtLeast(started);
      if (result && result.url) URL.revokeObjectURL(result.url);
      setResult({ blob, url: URL.createObjectURL(blob), width, height });
    } catch (e) {
      setError(e.message);
    }
    setBusy(false);
  };

  const convertAll = async () => {
    if (!batch.length) return;
    const started = Date.now();
    setBusy(true);
    setError('');
    setOutputs([]);
    const done = [];
    const usedNames = new Set();
    const uniqueName = (name) => {
      if (!usedNames.has(name)) { usedNames.add(name); return name; }
      const base = name.replace(/\.[^.]+$/, '');
      const ext = name.split('.').pop();
      let i = 2;
      let candidate = `${base}-${i}.${ext}`;
      while (usedNames.has(candidate)) { i += 1; candidate = `${base}-${i}.${ext}`; }
      usedNames.add(candidate);
      return candidate;
    };
    try {
      const maxW = parseInt(resizeWidth, 10);
      for (let i = 0; i < batch.length; i += 1) {
        const entry = batch[i];
        setProgress(`Converting image ${i + 1} of ${batch.length}: ${entry.file.name}`);
        try {
          const { blob, width, height } = await convertOne(entry.img, maxW);
          const url = URL.createObjectURL(blob);
          batchUrlsRef.current.push(url);
          done.push({ name: uniqueName(swapExt(entry.file.name, to.ext)), blob, url, sourceName: entry.file.name, width, height });
        } catch (e) {
          done.push({ name: entry.file.name, error: e.message || 'Could not be converted.' });
        }
        setOutputs([...done]);
      }
      await holdAtLeast(started);
      const failed = done.filter((d) => d.error).length;
      if (failed === done.length) setError('None of the images could be converted in this browser.');
    } catch (e) {
      setError(e.message);
    }
    setProgress('');
    setBusy(false);
  };

  const downloadZip = async () => {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    outputs.filter((o) => o.blob).forEach((o) => zip.file(o.name, o.blob));
    const blob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(blob, `${from.ext}-to-${to.ext}.zip`);
  };

  const good = outputs.filter((o) => o.blob);
  const batchIn = batch.reduce((s, b) => s + b.file.size, 0);
  const batchOut = good.reduce((s, o) => s + o.blob.size, 0);

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
      <FileDrop accept={from.accept || from.mime} multiple onFiles={onFiles} label={`Drop ${from.label} images here, or click to choose them (batch supported)`} />
      {error && <div className="message err">{error}</div>}

      {file && img && (
        <>
          <div className="stat-grid">
            <div className="stat"><div className="num">{formatBytes(file.size)}</div><div className="lbl">Original ({from.label})</div></div>
            <div className="stat"><div className="num">{img.naturalWidth} × {img.naturalHeight}</div><div className="lbl">Dimensions (px)</div></div>
            <div className="stat"><div className="num">{result ? formatBytes(result.blob.size) : '...'}</div><div className="lbl">Converted size ({to.label})</div></div>
          </div>
          <div className="btn-row">
            <button type="button" className="btn" onClick={convert} disabled={busy}>{busy ? <BusyLabel label={`Converting to ${to.label}...`} /> : `Convert to ${to.label}`}</button>
          </div>
          {lossy && (
            <div className="field" style={{ marginTop: 16 }}>
              <label htmlFor="pc-quality">Quality: {quality}%</label>
              <input
                id="pc-quality"
                type="range"
                min="10"
                max="100"
                step="1"
                value={quality}
                onChange={(e) => { setQuality(Number(e.target.value)); setResult(null); }}
              />
              <p className="hint">Higher quality means a bigger file. 92 percent is a good balance for photos; 75 to 85 percent looks nearly identical at a much smaller size.</p>
            </div>
          )}
          <div className="field">
            <label htmlFor="pc-resize">Resize while converting (optional, max width in px)</label>
            <input
              id="pc-resize"
              type="number"
              min="16"
              max="20000"
              inputMode="numeric"
              placeholder="e.g. 1200"
              value={resizeWidth}
              onChange={(e) => { setResizeWidth(e.target.value); setResult(null); }}
            />
            <p className="hint">Leave blank to keep the original size. The aspect ratio is kept, and images already smaller than this width are never enlarged.</p>
          </div>
          {busy && <ProcessingNote label={`Converting your ${from.label} to ${to.label}...`} />}
          {result && !busy && (
            <SuccessDownload
              message={`Your image has been converted to ${to.label} (${formatBytes(result.blob.size)}). Click Download to save it.`}
              buttonLabel={`Download ${to.label}`}
              onDownload={() => downloadBlob(result.blob, swapExt(file.name, to.ext))}
            />
          )}
          {result && (
            <div className="qr-preview">
              <img src={result.url} alt={`Converted ${to.label} preview`} style={{ maxWidth: 'min(420px, 100%)' }} />
              {(result.width !== img.naturalWidth || result.height !== img.naturalHeight) && (
                <p className="hint">Resized to {result.width} × {result.height} px.</p>
              )}
            </div>
          )}
        </>
      )}

      {batch.length > 0 && (
        <>
          <div className="stat-grid" style={{ marginTop: 16 }}>
            <div className="stat"><div className="num">{batch.length}</div><div className="lbl">Images selected</div></div>
            <div className="stat"><div className="num">{formatBytes(batchIn)}</div><div className="lbl">{from.label} total</div></div>
            <div className="stat"><div className="num">{good.length ? formatBytes(batchOut) : '...'}</div><div className="lbl">{to.label} total</div></div>
          </div>
          {lossy && (
            <div className="field" style={{ marginTop: 16 }}>
              <label htmlFor="pc-batch-quality">Quality: {quality}%</label>
              <input
                id="pc-batch-quality"
                type="range"
                min="10"
                max="100"
                step="1"
                value={quality}
                onChange={(e) => { setQuality(Number(e.target.value)); setOutputs([]); }}
              />
              <p className="hint">Higher quality means a bigger file. 92 percent is a good balance for photos; 75 to 85 percent looks nearly identical at a much smaller size.</p>
            </div>
          )}
          <div className="field">
            <label htmlFor="pc-batch-resize">Resize while converting (optional, max width in px)</label>
            <input
              id="pc-batch-resize"
              type="number"
              min="16"
              max="20000"
              inputMode="numeric"
              placeholder="e.g. 1200"
              value={resizeWidth}
              onChange={(e) => { setResizeWidth(e.target.value); setOutputs([]); }}
            />
            <p className="hint">Leave blank to keep the original size. The aspect ratio is kept, and images already smaller than this width are never enlarged.</p>
          </div>
          <div className="btn-row">
            <button type="button" className="btn" onClick={convertAll} disabled={busy}>
              {busy ? <BusyLabel label="Converting on your device..." /> : `Convert ${batch.length} images to ${to.label}`}
            </button>
            {good.length > 1 && !busy && (
              <button type="button" className="btn secondary" onClick={downloadZip}>Download all as ZIP</button>
            )}
          </div>
          {busy && <ProcessingNote label={progress || `Converting your ${from.label} images to ${to.label}...`} />}
          {outputs.length > 0 && (
            <div className="file-results">
              {outputs.map((o, i) => (
                <div className="file-row" key={`${o.name}-${i}`}>
                  {o.blob ? (
                    <>
                      <img src={o.url} alt="" className="file-thumb" />
                      <span className="file-name">{o.name}</span>
                      <span className="file-size">{formatBytes(o.blob.size)}</span>
                      <button type="button" className="btn secondary" onClick={() => downloadBlob(o.blob, o.name)}>Download</button>
                    </>
                  ) : (
                    <>
                      <span className="file-name">{o.name}</span>
                      <span className="file-error">{o.error}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
          {good.length > 0 && !busy && (
            <p className="hint" style={{ marginTop: 12 }}>
              Done: {good.length} image{good.length > 1 ? 's' : ''} converted to {to.label} on your device. Nothing was uploaded.
            </p>
          )}
        </>
      )}
    </ToolLayout>
  );
}

export const FORMATS = {
  png: { label: 'PNG', mime: 'image/png', ext: 'png' },
  jpg: { label: 'JPG', mime: 'image/jpeg', ext: 'jpg' },
  webp: { label: 'WebP', mime: 'image/webp', ext: 'webp' },
  avif: { label: 'AVIF', mime: 'image/avif', ext: 'avif', accept: 'image/avif,.avif' },
};

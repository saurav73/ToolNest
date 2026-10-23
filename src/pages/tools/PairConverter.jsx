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
 */
export default function PairConverter({ slug, path, title, description, h1, intro, faqs, content, from, to, loadError }) {
  const [file, setFile] = useState(null);
  const [img, setImg] = useState(null);
  const [quality, setQuality] = useState(92);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const urlRef = useRef('');

  const lossy = to.mime === 'image/jpeg' || to.mime === 'image/webp';

  useEffect(() => () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    if (result && result.url) URL.revokeObjectURL(result.url);
  }, [result]);

  const onFiles = async (files) => {
    const f = files[0];
    setError('');
    setResult(null);
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
  };

  const convert = async () => {
    if (!img || !file) return;
    const started = Date.now();
    setBusy(true);
    setError('');
    try {
      const canvas = imageToCanvas(img, img.naturalWidth, img.naturalHeight);
      if (to.mime === 'image/jpeg') {
        const ctx = canvas.getContext('2d');
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      const blob = await canvasToBlob(canvas, to.mime, lossy ? quality / 100 : undefined);
      await holdAtLeast(started);
      if (result && result.url) URL.revokeObjectURL(result.url);
      setResult({ blob, url: URL.createObjectURL(blob) });
    } catch (e) {
      setError(e.message);
    }
    setBusy(false);
  };

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
      <FileDrop accept={from.accept || from.mime} onFiles={onFiles} label={`Drop a ${from.label} image here, or click to choose one`} />
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
            </div>
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

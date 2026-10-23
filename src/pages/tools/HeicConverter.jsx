import React, { useEffect, useRef, useState } from 'react';
import ToolLayout from '../../components/ToolLayout.jsx';
import FileDrop from '../../components/FileDrop.jsx';
import { ProcessingNote, BusyLabel } from '../../components/ProcessUI.jsx';
import { formatBytes, downloadBlob, holdAtLeast, swapExt } from '../../lib/files.js';

/**
 * HEIC/HEIF to JPG or PNG converter. Decoding uses libheif compiled to
 * WebAssembly (the heic2any package), loaded lazily on first convert so
 * no other page pays for it. Everything happens on the device: the
 * photos are never uploaded, which is the whole point of this tool.
 * toFormat: { mime: 'image/jpeg', ext: 'jpg', label: 'JPG' }
 */
export default function HeicConverter({ slug, path, title, description, h1, intro, faqs, content, toFormat }) {
  const [files, setFiles] = useState([]);
  const [quality, setQuality] = useState(92);
  const [outputs, setOutputs] = useState([]); // {name, blob, url, sourceName}
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const urlsRef = useRef([]);

  useEffect(() => () => {
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  const onFiles = (list) => {
    setError('');
    setOutputs([]);
    const accepted = list.filter((f) => /\.hei[cf]$/i.test(f.name) || /hei[cf]/i.test(f.type || ''));
    if (!accepted.length) {
      setError('None of those files look like HEIC or HEIF photos. Choose files ending in .heic or .heif, the format iPhones save by default.');
      return;
    }
    setFiles(accepted);
  };

  const convertAll = async () => {
    if (!files.length) return;
    const started = Date.now();
    setBusy(true);
    setError('');
    setOutputs([]);
    try {
      const heic2any = (await import('heic2any')).default;
      const done = [];
      for (let i = 0; i < files.length; i += 1) {
        const f = files[i];
        setProgress(`Converting photo ${i + 1} of ${files.length}: ${f.name}`);
        try {
          const res = await heic2any({
            blob: f,
            toType: toFormat.mime,
            quality: toFormat.mime === 'image/jpeg' ? quality / 100 : undefined,
          });
          const blobs = Array.isArray(res) ? res : [res];
          blobs.forEach((blob, j) => {
            const base = swapExt(f.name, toFormat.ext).replace(/\.[^.]+$/, '');
            const name = blobs.length > 1 ? `${base}-${j + 1}.${toFormat.ext}` : `${base}.${toFormat.ext}`;
            const url = URL.createObjectURL(blob);
            urlsRef.current.push(url);
            done.push({ name, blob, url, sourceName: f.name });
          });
        } catch (e) {
          done.push({ name: f.name, error: 'Could not be decoded in this browser. Try Chrome or Edge on a desktop for very large photos.' });
        }
        setOutputs([...done]);
      }
      await holdAtLeast(started);
      const failed = done.filter((d) => d.error).length;
      if (failed === done.length) setError('None of the photos could be converted in this browser. HEIC decoding is heavy; Chrome or Edge on a desktop handles it best.');
    } catch (e) {
      setError('The HEIC decoder could not be loaded. Check your connection and try again.');
    }
    setProgress('');
    setBusy(false);
  };

  const downloadZip = async () => {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    outputs.filter((o) => o.blob).forEach((o) => zip.file(o.name, o.blob));
    const blob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(blob, `heic-to-${toFormat.ext}.zip`);
  };

  const good = outputs.filter((o) => o.blob);
  const totalIn = files.reduce((s, f) => s + f.size, 0);
  const totalOut = good.reduce((s, o) => s + o.blob.size, 0);

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
      <FileDrop
        accept=".heic,.heif,image/heic,image/heif"
        multiple
        onFiles={onFiles}
        label="Drop HEIC or HEIF photos here, or click to choose them (batch supported)"
      />
      {error && <div className="message err">{error}</div>}

      {files.length > 0 && (
        <>
          <div className="stat-grid" style={{ marginTop: 16 }}>
            <div className="stat"><div className="num">{files.length}</div><div className="lbl">Photos selected</div></div>
            <div className="stat"><div className="num">{formatBytes(totalIn)}</div><div className="lbl">HEIC total</div></div>
            <div className="stat"><div className="num">{good.length ? formatBytes(totalOut) : '...'}</div><div className="lbl">{toFormat.label} total</div></div>
          </div>

          {toFormat.mime === 'image/jpeg' && (
            <div className="field" style={{ marginTop: 16 }}>
              <label htmlFor="heic-quality">JPG quality: {quality}%</label>
              <input id="heic-quality" type="range" min="50" max="100" step="1" value={quality} onChange={(e) => setQuality(Number(e.target.value))} />
              <p className="hint">92% keeps photos looking identical to the original. Lower it if file size matters more than fine detail.</p>
            </div>
          )}

          <div className="btn-row">
            <button type="button" className="btn" onClick={convertAll} disabled={busy}>
              {busy ? <BusyLabel label="Converting on your device..." /> : `Convert ${files.length} photo${files.length > 1 ? 's' : ''} to ${toFormat.label}`}
            </button>
            {good.length > 1 && !busy && (
              <button type="button" className="btn secondary" onClick={downloadZip}>Download all as ZIP</button>
            )}
          </div>

          {busy && <ProcessingNote label={progress || 'Decoding HEIC photos on your device...'} />}

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
              Done: {good.length} photo{good.length > 1 ? 's' : ''} converted to {toFormat.label} on your device. Nothing was uploaded.
            </p>
          )}
        </>
      )}
    </ToolLayout>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import ToolLayout from '../../components/ToolLayout.jsx';
import FileDrop from '../../components/FileDrop.jsx';
import { ProcessingNote, SuccessDownload, BusyLabel } from '../../components/ProcessUI.jsx';
import { formatBytes, downloadBlob, holdAtLeast, loadImageFromFile, imageToCanvas, canvasToBlob, swapExt } from '../../lib/files.js';

const FORMATS = [
  { id: 'image/jpeg', label: 'JPEG (smallest for photos)', ext: 'jpg' },
  { id: 'image/webp', label: 'WebP (modern, very efficient)', ext: 'webp' },
  { id: 'image/png', label: 'PNG (lossless, quality has no effect)', ext: 'png' },
];

/** One-click target sizes, in KB (1 MB = 1024 KB). */
export const TARGET_PRESETS_KB = [20, 50, 100, 200, 500, 1024];

function presetLabel(kb) {
  return kb >= 1024 ? '1 MB' : `${kb} KB`;
}

async function encodeAt(img, width, height, formatId, quality) {
  const canvas = imageToCanvas(img, Math.max(1, Math.round(width)), Math.max(1, Math.round(height)));
  return canvasToBlob(canvas, formatId, formatId === 'image/png' ? undefined : quality);
}

/**
 * Compress to at or under targetBytes. First binary-searches the encoder
 * quality at full size; only if the lowest quality still overshoots does
 * it step the dimensions down and search again. Returns the best blob
 * found plus whether the target was met.
 */
export async function fitToTarget(img, formatId, targetBytes) {
  let w = img.naturalWidth;
  let h = img.naturalHeight;
  let fallback = null;
  for (let step = 0; step < 10; step += 1) {
    if (formatId === 'image/png') {
      const blob = await encodeAt(img, w, h, formatId, undefined);
      fallback = { blob, width: w, height: h, quality: null };
      if (blob.size <= targetBytes) return { ...fallback, missed: false };
    } else {
      let lo = 0.02;
      let hi = 1;
      let best = null;
      let smallest = null;
      for (let i = 0; i < 7; i += 1) {
        const q = (lo + hi) / 2;
        const blob = await encodeAt(img, w, h, formatId, q);
        if (!smallest || blob.size < smallest.blob.size) smallest = { blob, quality: q };
        if (blob.size <= targetBytes) { best = { blob, quality: q }; lo = q; } else { hi = q; }
      }
      if (best) return { blob: best.blob, width: w, height: h, quality: best.quality, missed: false };
      fallback = { blob: smallest.blob, width: w, height: h, quality: smallest.quality };
    }
    if (w <= 32 && h <= 32) break;
    w = Math.max(16, Math.round(w * 0.75));
    h = Math.max(16, Math.round(h * 0.75));
  }
  return { ...fallback, missed: true };
}

const FAQS = [
  {
    q: 'How does image compression work here?',
    a: 'Your image is decoded in the browser and re-encoded at the quality you choose. Lower quality means a smaller file with slightly softer detail. Because everything happens on your device, your photo is never uploaded to a server, which also makes it much faster than upload-based compressors.',
  },
  {
    q: 'Can I compress several images at once?',
    a: 'Yes. Drop several JPG, PNG or WebP images and they all compress with the same quality or target size settings. Each compressed image downloads on its own, or all of them together as one ZIP file.',
  },
  {
    q: 'How do I compress an image to 200KB, or another exact size?',
    a: 'Switch the tool to Target size mode, pick a preset such as 200KB (or type your own size), and compress. The tool searches quality settings automatically to land your file at or just under the target, and only reduces the pixel dimensions if quality alone cannot get there. The result panel always shows the achieved size next to your target.',
  },
  {
    q: 'What quality setting should I use?',
    a: 'For photos, 75 to 85 percent quality usually cuts the file size dramatically with no visible difference on screen. Go lower, around 50 to 60, for thumbnails and previews. For screenshots with sharp text, keep quality above 85 or use WebP, which handles edges better than JPEG.',
  },
  {
    q: 'JPEG, WebP or PNG: which should I pick?',
    a: 'JPEG is the safe choice for photos and works everywhere. WebP gives smaller files at the same quality and is supported by all modern browsers, which makes it ideal for websites. PNG is lossless and best for graphics that must stay pixel-perfect, but quality settings do not shrink it, so target sizes are reached by reducing dimensions.',
  },
  {
    q: 'Will compressing strip my photo\'s location data?',
    a: 'Yes. Re-encoding draws the picture onto a fresh canvas, so embedded EXIF data such as GPS coordinates and camera details is not carried into the new file. That is a privacy bonus when sharing photos online.',
  },
];

const CONTENT = (
  <>
    <h2>Shrink images without uploading them</h2>
    <p>
      Large photos straight from a camera or phone can be 5 to 15 megabytes, far too
      big for email, forms and fast web pages. This compressor re-encodes your JPG,
      PNG or WebP image at the quality you pick, shows the size before and after, and
      lets you download the smaller file. Drop several images at once and they
      compress with the same settings, with one ZIP download for the whole batch.
      Nothing is uploaded: the work happens in
      your browser, so even private photos stay private.
    </p>
    <h2>Compress to an exact size: 20KB, 50KB, 100KB, 200KB or 1MB</h2>
    <p>
      Many upload forms do not ask for "good quality", they state a hard limit: a
      passport photo under 200KB, a signature under 50KB, an attachment under 1MB.
      Guessing slider positions until you sneak under the line wastes time, so this
      tool also offers Target size mode. Pick a preset or type your own limit in KB,
      and the compressor searches quality settings automatically, testing encodes
      until it finds the highest quality that still fits under your target. Only if
      even the lowest quality is too big does it step the dimensions down, and the
      result panel always reports the size actually achieved next to the target you
      set, so you know before you upload anywhere else whether the file will pass.
    </p>
    <h2>When smaller images matter</h2>
    <ul>
      <li><strong>Websites:</strong> image weight is the biggest factor in page load time, and load time affects both visitors and search rankings.</li>
      <li><strong>Email and forms:</strong> most inboxes and application portals cap attachments at sizes phone photos easily exceed.</li>
      <li><strong>Storage and sharing:</strong> compressed copies are quicker to send and cheaper to store.</li>
    </ul>
    <p>
      Need a different format instead? The <a href="/image-converter">Image Converter</a>{' '}
      switches between JPG, PNG and WebP, and the <a href="/image-resizer">Image Resizer</a>{' '}
      changes the pixel dimensions.
    </p>
    <h2>How compression works under the hood</h2>
    <p>
      When you add a photo, your browser decodes it into raw pixels, the same grid of
      colored dots you see on screen. The compressor then draws those pixels onto a
      canvas and asks the browser encoder to write them back out at the quality level
      you set. For JPEG and WebP that encoder uses lossy compression. It groups nearby
      pixels into small blocks, keeps the broad shapes and colors your eyes notice
      most, and discards fine detail your eyes are poor at seeing, especially sharp
      color changes in busy areas like grass, hair and fabric. Lowering the quality
      tells the encoder to discard more, which is why files shrink so fast at first
      and then show visible softness or blocky patches once you go too far. PNG works
      differently. It is lossless, so the encoder only looks for repeated patterns to
      store more efficiently, and the quality slider has no effect on the result.
    </p>
    <h2>Practical tips for better results</h2>
    <ul>
      <li><strong>Resize before you compress:</strong> a photo that will only ever display at 1200 pixels wide gains nothing from staying at 4000 pixels. Shrinking dimensions first often saves more than any quality change.</li>
      <li><strong>Compress once, from the original:</strong> compressing an already compressed JPEG discards detail a second time. Always start again from the camera original if you want to try a different setting.</li>
      <li><strong>Check at full size:</strong> zoom to 100 percent and look at faces, text and straight edges. If those still look clean, most viewers will never notice the compression.</li>
      <li><strong>Match the format to the job:</strong> WebP for your own website, JPEG for maximum compatibility with forms and older software, PNG only when you need transparency or pixel perfect graphics.</li>
      <li><strong>Keep an untouched master:</strong> save the original somewhere safe and treat the compressed file as a delivery copy you can regenerate any time.</li>
    </ul>
    <h2>A worked example</h2>
    <p>
      Say you have a phone photo of a birthday cake that is 4032 by 3024 pixels and
      6.8 MB, and a school application form that accepts attachments up to 2 MB. At
      80 percent quality as a JPEG, the same photo comes out at roughly 1.4 MB, well
      under the limit, and on screen it is hard to tell from the original. If you also
      resize a copy to 1600 pixels wide for a blog post and export it as WebP at 75
      percent, the file drops to around 180 KB. That version loads almost instantly
      even on a slow mobile connection, while the 1.4 MB version stays on file for
      the application. Two minutes of work, two files, each sized for its purpose.
    </p>
    <h2>Common mistakes to avoid</h2>
    <ul>
      <li><strong>Crushing screenshots to JPEG:</strong> text and user interface edges smear badly at low quality. Use PNG or WebP for anything with sharp lines and small text.</li>
      <li><strong>Chasing the smallest possible file:</strong> saving an extra 50 KB is not worth a photo that looks muddy. Judge the result with your eyes, not just the percentage saved.</li>
      <li><strong>Compressing the compressed copy again and again:</strong> each lossy pass throws away more detail, so quality slides downhill quickly after two or three rounds.</li>
      <li><strong>Expecting PNG to shrink with the slider:</strong> PNG ignores quality settings. If a PNG stays large, convert it to WebP or JPEG instead, or reduce its dimensions.</li>
      <li><strong>Deleting the original:</strong> compression is one way. Once detail is discarded you cannot get it back, so never overwrite your only copy.</li>
    </ul>
  </>
);

export default function ImageCompressor({
  slug = 'image-compressor',
  path = '/image-compressor',
  title = 'Free Image Compressor: Compress JPG, PNG, WebP | ToolNest',
  description = 'Compress JPG and PNG images to an exact size: 20KB, 50KB, 100KB, 200KB or 1MB. Free in your browser, no upload, no sign-up.',
  h1 = 'Image Compressor',
  intro = 'Shrink JPG, PNG and WebP images two ways: with a simple quality slider, or by setting an exact target size like 200KB and letting the tool find the settings for you. Drop several images at once and they compress with the same settings, with one ZIP download for the batch. Your image is processed on your device and never uploaded, and you see the exact result before downloading.',
  faqs = FAQS,
  content = CONTENT,
  initialTargetKb = null,
} = {}) {
  // Batch mode only on the main compressor page. The 50KB, 100KB and 200KB
  // preset pages keep their single-file exact-target flow.
  const allowBatch = initialTargetKb == null;
  const [file, setFile] = useState(null);
  const [img, setImg] = useState(null);
  const [batch, setBatch] = useState([]); // [{ file, img, url }]
  const [outputs, setOutputs] = useState([]); // [{ name, blob, url, sourceName, error, origSize }]
  const [progress, setProgress] = useState('');
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState(FORMATS[0]);
  const [mode, setMode] = useState(initialTargetKb ? 'target' : 'quality');
  const [targetKb, setTargetKb] = useState(initialTargetKb || 200);
  const [customKb, setCustomKb] = useState('');
  const [result, setResult] = useState(null); // {blob, url, ext, width, height, targetBytes, missed}
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const urlRef = useRef('');
  const batchUrlsRef = useRef([]);

  useEffect(() => () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    if (result && result.url) URL.revokeObjectURL(result.url);
  }, [result]);

  const clearBatch = () => {
    batchUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    batchUrlsRef.current = [];
    setBatch([]);
    setOutputs([]);
    setProgress('');
  };

  const onFiles = async (files) => {
    const list = [...(files || [])];
    setError('');
    setResult(null);
    if (allowBatch) clearBatch();
    if (list.length > 1 && allowBatch) {
      setFile(null);
      setImg(null);
      const accepted = list.filter((f) => ['image/jpeg', 'image/png', 'image/webp'].includes(f.type)
        || /\.(jpe?g|png|webp)$/i.test(f.name));
      if (!accepted.length) {
        setError('None of those files are JPG, PNG or WebP images. This compressor handles those three formats.');
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
        setError('None of those files could be read as images.');
        return;
      }
      if (skipped) setError(`${skipped} file${skipped > 1 ? 's' : ''} could not be read as images and were skipped.`);
      setBatch(loaded);
      return;
    }
    const f = list[0];
    if (!f) { setFile(null); setImg(null); return; }
    try {
      const { img: el, url } = await loadImageFromFile(f);
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = url;
      setFile(f);
      setImg(el);
    } catch (e) {
      setError(e.message);
    }
  };

  const effectiveTargetKb = customKb !== '' ? Number(customKb) : targetKb;
  const targetBytes = Math.max(1, Math.round((effectiveTargetKb || 0) * 1024));

  const compress = async () => {
    if (!img || !file) return;
    const started = Date.now();
    setBusy(true);
    setError('');
    try {
      let out;
      if (mode === 'target') {
        if (!effectiveTargetKb || effectiveTargetKb <= 0) throw new Error('Enter a target size in KB first.');
        out = await fitToTarget(img, format.id, targetBytes);
        out = { ...out, targetBytes };
      } else {
        const blob = await encodeAt(img, img.naturalWidth, img.naturalHeight, format.id, quality / 100);
        out = { blob, width: img.naturalWidth, height: img.naturalHeight, targetBytes: null, missed: false };
      }
      await holdAtLeast(started);
      if (result && result.url) URL.revokeObjectURL(result.url);
      setResult({ blob: out.blob, url: URL.createObjectURL(out.blob), ext: format.ext, width: out.width, height: out.height, targetBytes: out.targetBytes, missed: out.missed });
    } catch (e) {
      setError(e.message);
    }
    setBusy(false);
  };

  const compressOne = async (el) => {
    if (mode === 'target') {
      if (!effectiveTargetKb || effectiveTargetKb <= 0) throw new Error('Enter a target size in KB first.');
      const out = await fitToTarget(el, format.id, targetBytes);
      return { ...out, targetBytes };
    }
    const blob = await encodeAt(el, el.naturalWidth, el.naturalHeight, format.id, quality / 100);
    return { blob, width: el.naturalWidth, height: el.naturalHeight, targetBytes: null, missed: false };
  };

  const compressAll = async () => {
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
      for (let i = 0; i < batch.length; i += 1) {
        const entry = batch[i];
        setProgress(`Compressing image ${i + 1} of ${batch.length}: ${entry.file.name}`);
        try {
          const out = await compressOne(entry.img);
          const url = URL.createObjectURL(out.blob);
          batchUrlsRef.current.push(url);
          done.push({ name: uniqueName(`compressed-${swapExt(entry.file.name, format.ext)}`), blob: out.blob, url, sourceName: entry.file.name, origSize: entry.file.size, missed: out.missed });
        } catch (e) {
          done.push({ name: entry.file.name, error: e.message || 'Could not be compressed.' });
        }
        setOutputs([...done]);
      }
      await holdAtLeast(started);
      if (done.filter((d) => d.error).length === done.length) setError('None of the images could be compressed in this browser.');
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
    downloadBlob(blob, 'compressed-images.zip');
  };

  const good = outputs.filter((o) => o.blob);
  const batchIn = batch.reduce((s, b) => s + b.file.size, 0);
  const batchOut = good.reduce((s, o) => s + o.blob.size, 0);

  const saved = result && file ? Math.max(0, Math.round((1 - result.blob.size / file.size) * 100)) : 0;
  const targetLabel = presetLabel(effectiveTargetKb || 0);
  const successMessage = result
    ? (result.targetBytes
      ? (result.missed
        ? `Your image has been compressed to ${formatBytes(result.blob.size)}, the smallest this image goes, but that is still above your ${formatBytes(result.targetBytes)} target. Click Download to save it, or try a smaller starting image.`
        : `Your image has been compressed to ${formatBytes(result.blob.size)}, at or under your ${formatBytes(result.targetBytes)} target (${formatBytes(file.size)} before, ${saved}% smaller). Click Download to save it.`)
      : `Your image has been compressed: ${formatBytes(file.size)} reduced to ${formatBytes(result.blob.size)} (${saved}% smaller). Click Download to save it.`)
    : '';

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
      <FileDrop accept="image/jpeg,image/png,image/webp" multiple={allowBatch} onFiles={onFiles} label={allowBatch ? 'Drop JPG, PNG or WebP images here, or click to choose them (batch supported)' : 'Drop a JPG, PNG or WebP image here, or click to choose one'} />
      {error && <div className="message err">{error}</div>}

      {file && img && (
        <>
          <div className="stat-grid">
            <div className="stat"><div className="num">{formatBytes(file.size)}</div><div className="lbl">Original size</div></div>
            <div className="stat"><div className="num">{img.naturalWidth} × {img.naturalHeight}</div><div className="lbl">Dimensions (px)</div></div>
            <div className="stat"><div className="num">{result ? formatBytes(result.blob.size) : '...'}</div><div className="lbl">{mode === 'target' ? `Result (target ${targetLabel})` : 'Compressed size'}</div></div>
            <div className="stat"><div className="num">{result ? `${saved}%` : '...'}</div><div className="lbl">Size saved</div></div>
          </div>

          <div className="field" style={{ marginTop: 16 }}>
            <label>How to compress</label>
            <div className="checks">
              <label>
                <input type="radio" name="cmp-mode" checked={mode === 'quality'} onChange={() => setMode('quality')} />
                Quality slider
              </label>
              <label>
                <input type="radio" name="cmp-mode" checked={mode === 'target'} onChange={() => setMode('target')} />
                Target size (KB)
              </label>
            </div>
          </div>

          {mode === 'quality' ? (
            <div className="row">
              <div className="field">
                <label htmlFor="cmp-quality">Quality: {quality}%</label>
                <input id="cmp-quality" type="range" min="10" max="100" step="1" value={quality} onChange={(e) => setQuality(Number(e.target.value))} />
                <p className="hint">Lower quality means a smaller file. 75 to 85% suits most photos.</p>
              </div>
              <div className="field">
                <label htmlFor="cmp-format">Output format</label>
                <select id="cmp-format" value={format.id} onChange={(e) => setFormat(FORMATS.find((f) => f.id === e.target.value))}>
                  {FORMATS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                </select>
              </div>
            </div>
          ) : (
            <div className="row">
              <div className="field">
                <label>Target size</label>
                <div className="btn-row" style={{ marginTop: 0 }}>
                  {TARGET_PRESETS_KB.map((kb) => (
                    <button
                      key={kb}
                      type="button"
                      className={`btn${customKb === '' && targetKb === kb ? '' : ' secondary'}`}
                      onClick={() => { setTargetKb(kb); setCustomKb(''); }}
                    >
                      {presetLabel(kb)}
                    </button>
                  ))}
                </div>
                <p className="hint">The tool adjusts quality first, then dimensions only if needed, to land at or under the target.</p>
              </div>
              <div className="field">
                <label htmlFor="cmp-custom-kb">Or a custom size (KB)</label>
                <input
                  id="cmp-custom-kb"
                  type="number"
                  min="1"
                  max="10240"
                  inputMode="numeric"
                  placeholder="e.g. 150"
                  value={customKb}
                  onChange={(e) => setCustomKb(e.target.value)}
                />
                <label htmlFor="cmp-format-t" style={{ marginTop: 12 }}>Output format</label>
                <select id="cmp-format-t" value={format.id} onChange={(e) => setFormat(FORMATS.find((f) => f.id === e.target.value))}>
                  {FORMATS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                </select>
              </div>
            </div>
          )}

          <div className="btn-row">
            <button type="button" className="btn" onClick={compress} disabled={busy}>
              {busy
                ? <BusyLabel label={mode === 'target' ? `Compressing to ${targetLabel}...` : 'Compressing your image...'} />
                : (mode === 'target' ? `Compress to ${targetLabel}` : 'Compress image')}
            </button>
          </div>

          {busy && <ProcessingNote label={mode === 'target' ? `Compressing your image to ${targetLabel}...` : 'Compressing your image...'} />}
          {result && !busy && (
            <SuccessDownload
              message={successMessage}
              buttonLabel="Download compressed image"
              onDownload={() => downloadBlob(result.blob, `compressed-${file.name.replace(/\.[^.]+$/, '')}.${result.ext}`)}
            />
          )}

          {result && (
            <div className="qr-preview">
              <img src={result.url} alt="Compressed preview" style={{ maxWidth: 'min(420px, 100%)' }} />
              {result.width !== img.naturalWidth && (
                <p className="hint">Dimensions adjusted to {result.width} × {result.height} px to reach the target size.</p>
              )}
            </div>
          )}
        </>
      )}

      {batch.length > 0 && (
        <>
          <div className="stat-grid" style={{ marginTop: 16 }}>
            <div className="stat"><div className="num">{batch.length}</div><div className="lbl">Images selected</div></div>
            <div className="stat"><div className="num">{formatBytes(batchIn)}</div><div className="lbl">Original total</div></div>
            <div className="stat"><div className="num">{good.length ? formatBytes(batchOut) : '...'}</div><div className="lbl">Compressed total</div></div>
            <div className="stat"><div className="num">{good.length ? `${Math.max(0, Math.round((1 - batchOut / batchIn) * 100))}%` : '...'}</div><div className="lbl">Size saved</div></div>
          </div>

          <div className="field" style={{ marginTop: 16 }}>
            <label>How to compress</label>
            <div className="checks">
              <label>
                <input type="radio" name="cmp-batch-mode" checked={mode === 'quality'} onChange={() => { setMode('quality'); setOutputs([]); }} />
                Quality slider
              </label>
              <label>
                <input type="radio" name="cmp-batch-mode" checked={mode === 'target'} onChange={() => { setMode('target'); setOutputs([]); }} />
                Target size (KB)
              </label>
            </div>
          </div>

          {mode === 'quality' ? (
            <div className="row">
              <div className="field">
                <label htmlFor="cmp-batch-quality">Quality: {quality}%</label>
                <input id="cmp-batch-quality" type="range" min="10" max="100" step="1" value={quality} onChange={(e) => { setQuality(Number(e.target.value)); setOutputs([]); }} />
                <p className="hint">Lower quality means a smaller file. 75 to 85% suits most photos.</p>
              </div>
              <div className="field">
                <label htmlFor="cmp-batch-format">Output format</label>
                <select id="cmp-batch-format" value={format.id} onChange={(e) => { setFormat(FORMATS.find((f) => f.id === e.target.value)); setOutputs([]); }}>
                  {FORMATS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                </select>
              </div>
            </div>
          ) : (
            <div className="row">
              <div className="field">
                <label>Target size</label>
                <div className="btn-row" style={{ marginTop: 0 }}>
                  {TARGET_PRESETS_KB.map((kb) => (
                    <button
                      key={kb}
                      type="button"
                      className={`btn${customKb === '' && targetKb === kb ? '' : ' secondary'}`}
                      onClick={() => { setTargetKb(kb); setCustomKb(''); setOutputs([]); }}
                    >
                      {presetLabel(kb)}
                    </button>
                  ))}
                </div>
                <p className="hint">The tool adjusts quality first, then dimensions only if needed, to land at or under the target.</p>
              </div>
              <div className="field">
                <label htmlFor="cmp-batch-custom-kb">Or a custom size (KB)</label>
                <input
                  id="cmp-batch-custom-kb"
                  type="number"
                  min="1"
                  max="10240"
                  inputMode="numeric"
                  placeholder="e.g. 150"
                  value={customKb}
                  onChange={(e) => { setCustomKb(e.target.value); setOutputs([]); }}
                />
                <label htmlFor="cmp-batch-format-t" style={{ marginTop: 12 }}>Output format</label>
                <select id="cmp-batch-format-t" value={format.id} onChange={(e) => { setFormat(FORMATS.find((f) => f.id === e.target.value)); setOutputs([]); }}>
                  {FORMATS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                </select>
              </div>
            </div>
          )}

          <div className="btn-row">
            <button type="button" className="btn" onClick={compressAll} disabled={busy}>
              {busy ? <BusyLabel label="Compressing your images..." /> : `Compress ${batch.length} images`}
            </button>
            {good.length > 1 && !busy && (
              <button type="button" className="btn secondary" onClick={downloadZip}>Download all as ZIP</button>
            )}
          </div>
          {busy && <ProcessingNote label={progress || 'Compressing your images...'} />}
          {outputs.length > 0 && (
            <div className="file-results">
              {outputs.map((o, i) => (
                <div className="file-row" key={`${o.name}-${i}`}>
                  {o.blob ? (
                    <>
                      <img src={o.url} alt="" className="file-thumb" />
                      <span className="file-name">{o.name}</span>
                      <span className="file-size">{formatBytes(o.origSize)} to {formatBytes(o.blob.size)}{o.missed ? ' (target not reached)' : ''}</span>
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
              Done: {good.length} image{good.length > 1 ? 's' : ''} compressed on your device. Nothing was uploaded.
            </p>
          )}
        </>
      )}
    </ToolLayout>
  );
}

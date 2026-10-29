import React, { useEffect, useRef, useState } from 'react';
import ToolLayout from '../../components/ToolLayout.jsx';
import FileDrop from '../../components/FileDrop.jsx';
import { ProcessingNote, SuccessDownload, BusyLabel } from '../../components/ProcessUI.jsx';
import { formatBytes, downloadBlob, holdAtLeast, loadImageFromFile, imageToCanvas, canvasToBlob, swapExt } from '../../lib/files.js';

const PRESETS = [25, 50, 75, 100, 150, 200];

// One-click exact dimensions for the most-used social platforms (iLoveIMG offers
// the same "social media presets" pattern on its resizer).
const SOCIAL_PRESETS = [
  { label: 'Instagram post', w: 1080, h: 1080 },
  { label: 'Instagram story', w: 1080, h: 1920 },
  { label: 'Facebook post', w: 1200, h: 630 },
  { label: 'YouTube thumbnail', w: 1280, h: 720 },
  { label: 'X post', w: 1200, h: 675 },
  { label: 'Pinterest pin', w: 1000, h: 1500 },
];

const FAQS = [
  {
    q: 'What does "keep aspect ratio" mean?',
    a: 'The aspect ratio is the relationship between width and height. With the lock on, typing a new width adjusts the height automatically by the same proportion, so the picture never looks stretched or squashed. Turn the lock off only when you deliberately need exact dimensions and accept some distortion.',
  },
  {
    q: 'Can I make an image bigger without losing quality?',
    a: 'Not really. Enlarging spreads the existing pixels over a bigger area, so the result looks softer. Browsers do a decent job of smoothing, which is fine for modest increases, but for print-quality enlargements you need dedicated upscaling tools. Resizing down, which is what most people need, loses nothing visible.',
  },
  {
    q: 'What size should I use for websites and social media?',
    a: 'Common targets: 1200 px wide for blog and Open Graph images, 1080 by 1080 for Instagram posts, 1500 px wide for Pinterest pins (with height around 2250), and 1920 px wide for full-width hero images. The social media presets above set the exact recommended dimensions for Instagram, Facebook, YouTube, X and Pinterest in one click, and they switch the aspect ratio lock off because each platform wants a precise shape. Smaller is faster, so avoid shipping images wider than they will ever be displayed.',
  },
  {
    q: 'Does resizing change the file format?',
    a: 'No. The resized image keeps your original format (JPG stays JPG, PNG stays PNG, WebP stays WebP). To change format as well, use the Image Converter after resizing.',
  },
  {
    q: 'Can I resize several images at once?',
    a: 'Yes. Drop several JPG, PNG or WebP images and they all resize with the same settings: with the aspect ratio lock on, every image is resized to the width you set while keeping its own proportions, and with the lock off, every image gets the exact width and height you set. Each resized image downloads on its own, or all of them together as one ZIP file.',
  },
];

const CONTENT = (
  <>
    <h2>Resize images to exact pixel dimensions</h2>
    <p>
      Whether a platform demands 1080 by 1080 or you just need a smaller file for a
      web page, this resizer changes an image's pixel dimensions in your browser.
      Lock the aspect ratio to keep proportions perfect, use the percentage presets
      for quick scaling, jump straight to a social media preset (Instagram, Facebook,
      YouTube and more) for exact platform dimensions, and download the result in
      the original format. Drop several images at once and they resize with the
      same settings, with one ZIP download for the whole batch.
    </p>
    <h2>Resizing versus compressing</h2>
    <p>
      Resizing changes how many pixels the image has; compressing keeps the pixels
      and stores them more efficiently. A 4000 px photo resized to 1200 px and then
      lightly <a href="/image-compressor">compressed</a> can shrink from 8 MB to
      under 300 KB, which is why the two steps pair so well for web work.
    </p>
    <h2>How resizing works under the hood</h2>
    <p>
      Every digital image is a grid of pixels. When you shrink an image from 4000
      pixels wide to 1000, the browser has to decide what each new pixel should
      look like based on the sixteen or so old pixels it replaces. It averages
      their colors, a process called resampling, which keeps the picture looking
      natural while throwing away detail you would never see at the smaller size.
      Enlarging does the opposite. The browser invents new pixels by blending the
      neighbors it has, which is why big enlargements look soft. The aspect ratio
      lock simply ties the two numbers together with the original proportion, so
      entering a width works out the correct height for you. The final image is
      then re-encoded in your original format, ready to download.
    </p>
    <h2>Practical tips for sharper results</h2>
    <ul>
      <li><strong>Size for the slot, not smaller:</strong> find out how wide the image will actually be displayed and resize to that width, or to twice that width if you want it crisp on high resolution phone and laptop screens.</li>
      <li><strong>Keep the lock on for photos:</strong> portraits, products and landscapes all look wrong when stretched. Only unlock the ratio when a platform demands exact dimensions and you plan to crop rather than stretch.</li>
      <li><strong>Resize in one step:</strong> going from 4000 to 2000 and later to 1000 softens the image twice. Work from the original and resize directly to the final size each time.</li>
      <li><strong>Do your cropping first:</strong> trim away unwanted edges in your photo app before resizing, so the pixels you keep are the ones that matter.</li>
      <li><strong>Pair resizing with compression:</strong> resizing cuts the pixel count, and a light pass through the <a href="/image-compressor">Image Compressor</a>{' '} afterwards cuts the storage cost of what remains.</li>
    </ul>
    <h2>A worked example</h2>
    <p>
      Suppose your camera produces a photo that is 6000 by 4000 pixels and 9 MB,
      and you need an image for a blog post where the text column is 800 pixels
      wide. With the aspect ratio locked, you type 1600 as the width, twice the
      display size so it stays sharp on retina screens, and the height fills in
      automatically as 1067. The resized file comes out at roughly 700 KB. A
      gentle compression pass at 80 percent quality then brings it near 250 KB,
      small enough to load quickly on mobile data. The original stays in your
      archive untouched, ready if you ever need a print or a larger banner.
    </p>
    <h2>Common mistakes to avoid</h2>
    <ul>
      <li><strong>Unlocking the ratio to force a fit:</strong> a face stretched to fill a square slot looks obviously wrong. Crop to the shape you need, or add background padding, instead of distorting.</li>
      <li><strong>Uploading the full size original just in case:</strong> browsers scale it down for display anyway, so visitors pay the download cost of pixels they never see.</li>
      <li><strong>Enlarging a small image for print:</strong> a 800 pixel wide image stretched to poster size will look blurry on paper. For print, aim for about 300 pixels per inch of finished size.</li>
      <li><strong>Resizing a copy of a copy:</strong> each generation loses a little sharpness. Keep one master file and make every resized version from it.</li>
      <li><strong>Confusing pixels with file size:</strong> halving the width quarters the pixel count, but the megabyte size also depends on format and quality. Check the download size shown after resizing.</li>
    </ul>
  </>
);

export default function ImageResizer() {
  const [file, setFile] = useState(null);
  const [img, setImg] = useState(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lock, setLock] = useState(true);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [batch, setBatch] = useState([]); // [{ file, img, url }]
  const [outputs, setOutputs] = useState([]); // [{ name, blob, url, sourceName, w, h, origSize, error }]
  const [progress, setProgress] = useState('');
  const [batchWidth, setBatchWidth] = useState(1200);
  const [batchHeight, setBatchHeight] = useState(1200);
  const [batchLock, setBatchLock] = useState(true);
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
    clearBatch();
    if (list.length > 1) {
      setFile(null);
      setImg(null);
      const accepted = list.filter((f) => ['image/jpeg', 'image/png', 'image/webp'].includes(f.type)
        || /\.(jpe?g|png|webp)$/i.test(f.name));
      if (!accepted.length) {
        setError('None of those files are JPG, PNG or WebP images. This resizer handles those three formats.');
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
      setWidth(el.naturalWidth);
      setHeight(el.naturalHeight);
    } catch (e) {
      setError(e.message);
    }
  };

  const onWidth = (v) => {
    const w = Math.max(1, parseInt(v, 10) || 0);
    setWidth(w);
    if (lock && img && w) setHeight(Math.max(1, Math.round((w * img.naturalHeight) / img.naturalWidth)));
  };
  const onHeight = (v) => {
    const h = Math.max(1, parseInt(v, 10) || 0);
    setHeight(h);
    if (lock && img && h) setWidth(Math.max(1, Math.round((h * img.naturalWidth) / img.naturalHeight)));
  };
  const applyPreset = (pct) => {
    if (!img) return;
    setWidth(Math.max(1, Math.round((img.naturalWidth * pct) / 100)));
    setHeight(Math.max(1, Math.round((img.naturalHeight * pct) / 100)));
  };
  const applySocialPreset = (w, h) => {
    if (!img) return;
    // Platforms want exact shapes, so a social preset unlocks the aspect ratio.
    setLock(false);
    setWidth(w);
    setHeight(h);
  };

  const resize = async () => {
    if (!img || !file || !width || !height) return;
    const started = Date.now();
    setBusy(true);
    setError('');
    try {
      const canvas = imageToCanvas(img, width, height);
      const type = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ? file.type : 'image/png';
      const blob = await canvasToBlob(canvas, type, 0.92);
      await holdAtLeast(started);
      if (result && result.url) URL.revokeObjectURL(result.url);
      setResult({ blob, url: URL.createObjectURL(blob), w: width, h: height, ext });
    } catch (e) {
      setError(e.message);
    }
    setBusy(false);
  };

  const resizeAll = async () => {
    if (!batch.length || !batchWidth) return;
    const started = Date.now();
    setBusy(true);
    setError('');
    setOutputs([]);
    const done = [];
    const usedNames = new Set();
    const uniqueName = (name) => {
      if (!usedNames.has(name)) { usedNames.add(name); return name; }
      const base = name.replace(/\.[^.]+$/, '');
      const ext2 = name.split('.').pop();
      let i = 2;
      let candidate = `${base}-${i}.${ext2}`;
      while (usedNames.has(candidate)) { i += 1; candidate = `${base}-${i}.${ext2}`; }
      usedNames.add(candidate);
      return candidate;
    };
    try {
      for (let i = 0; i < batch.length; i += 1) {
        const entry = batch[i];
        setProgress(`Resizing image ${i + 1} of ${batch.length}: ${entry.file.name}`);
        try {
          const w = Math.max(1, Math.round(batchWidth));
          const h = batchLock
            ? Math.max(1, Math.round((w * entry.img.naturalHeight) / entry.img.naturalWidth))
            : Math.max(1, Math.round(batchHeight));
          const canvas = imageToCanvas(entry.img, w, h);
          const type = ['image/jpeg', 'image/png', 'image/webp'].includes(entry.file.type) ? entry.file.type : 'image/png';
          const blob = await canvasToBlob(canvas, type, 0.92);
          const url = URL.createObjectURL(blob);
          batchUrlsRef.current.push(url);
          done.push({ name: uniqueName(`resized-${entry.file.name}`), blob, url, sourceName: entry.file.name, w, h, origSize: entry.file.size });
        } catch (e) {
          done.push({ name: entry.file.name, error: e.message || 'Could not be resized.' });
        }
        setOutputs([...done]);
      }
      await holdAtLeast(started);
      if (done.filter((d) => d.error).length === done.length) setError('None of the images could be resized in this browser.');
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
    downloadBlob(blob, 'resized-images.zip');
  };

  const good = outputs.filter((o) => o.blob);

  const ext = file ? (file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/webp' ? 'webp' : 'png') : 'png';

  return (
    <ToolLayout
      slug="image-resizer"
      path="/image-resizer"
      title="Image Resizer: Resize Images by Pixels Online | ToolNest"
      description="Resize JPG, PNG and WebP images to exact pixels with aspect ratio lock and scale presets. In your browser, no upload, instant download."
      h1="Image Resizer"
      intro="Resize any image to exact pixel dimensions, with an aspect ratio lock so nothing gets stretched, plus one-click scale and social media presets. Drop several images at once and they resize with the same settings, with one ZIP download for the batch. All in your browser, nothing uploaded."
      faqs={FAQS}
      content={CONTENT}
    >
      <FileDrop accept="image/jpeg,image/png,image/webp" multiple onFiles={onFiles} label="Drop images here, or click to choose them (batch supported)" />
      {error && <div className="message err">{error}</div>}

      {file && img && (
        <>
          <p className="hint" style={{ marginTop: 14 }}>
            Original: {img.naturalWidth} × {img.naturalHeight} px, {formatBytes(file.size)}
          </p>
          <div className="row">
            <div className="field">
              <label htmlFor="rs-w">Width (px)</label>
              <input id="rs-w" type="text" inputMode="numeric" value={width} onChange={(e) => onWidth(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="rs-h">Height (px)</label>
              <input id="rs-h" type="text" inputMode="numeric" value={height} onChange={(e) => onHeight(e.target.value)} />
            </div>
            <div className="field">
              <label>Aspect ratio</label>
              <div className="checks">
                <label><input type="checkbox" checked={lock} onChange={(e) => setLock(e.target.checked)} /> Keep aspect ratio</label>
              </div>
            </div>
          </div>
          <div className="field">
            <label>Quick scale</label>
            <div className="btn-row" style={{ marginTop: 0 }}>
              {PRESETS.map((p) => (
                <button key={p} type="button" className="btn ghost" onClick={() => applyPreset(p)}>{p}%</button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>Social media presets</label>
            <div className="btn-row" style={{ marginTop: 0 }}>
              {SOCIAL_PRESETS.map((p) => (
                <button key={p.label} type="button" className="btn ghost" onClick={() => applySocialPreset(p.w, p.h)}>
                  {p.label} {p.w}×{p.h}
                </button>
              ))}
            </div>
          </div>
          <div className="btn-row">
            <button type="button" className="btn" onClick={resize} disabled={busy}>{busy ? <BusyLabel label="Resizing your image..." /> : 'Resize image'}</button>
          </div>
          {busy && <ProcessingNote label="Resizing your image..." />}
          {result && !busy && (
            <SuccessDownload
              message={`Your image has been resized to ${result.w} × ${result.h} pixels (${formatBytes(result.blob.size)}). Click Download to save it.`}
              buttonLabel="Download resized image"
              onDownload={() => downloadBlob(result.blob, swapExt(file.name, result.ext))}
            />
          )}
          {result && (
            <div className="qr-preview">
              <img src={result.url} alt="Resized preview" style={{ maxWidth: 'min(420px, 100%)' }} />
            </div>
          )}
        </>
      )}

      {batch.length > 0 && (
        <>
          <p className="hint" style={{ marginTop: 14 }}>
            {batch.length} images selected. With the lock on, each image is resized to the width below while keeping its own proportions. With the lock off, every image gets the exact width and height below.
          </p>
          <div className="row">
            <div className="field">
              <label htmlFor="rs-batch-w">Width (px)</label>
              <input id="rs-batch-w" type="text" inputMode="numeric" value={batchWidth} onChange={(e) => { setBatchWidth(Math.max(1, parseInt(e.target.value, 10) || 0)); setOutputs([]); }} />
            </div>
            <div className="field">
              <label htmlFor="rs-batch-h">Height (px)</label>
              <input id="rs-batch-h" type="text" inputMode="numeric" value={batchHeight} disabled={batchLock} onChange={(e) => { setBatchHeight(Math.max(1, parseInt(e.target.value, 10) || 0)); setOutputs([]); }} />
            </div>
            <div className="field">
              <label>Aspect ratio</label>
              <div className="checks">
                <label><input type="checkbox" checked={batchLock} onChange={(e) => { setBatchLock(e.target.checked); setOutputs([]); }} /> Keep aspect ratio</label>
              </div>
            </div>
          </div>
          <div className="field">
            <label>Social media presets</label>
            <div className="btn-row" style={{ marginTop: 0 }}>
              {SOCIAL_PRESETS.map((p) => (
                <button key={p.label} type="button" className="btn ghost" onClick={() => { setBatchLock(false); setBatchWidth(p.w); setBatchHeight(p.h); setOutputs([]); }}>
                  {p.label} {p.w}×{p.h}
                </button>
              ))}
            </div>
          </div>
          <div className="btn-row">
            <button type="button" className="btn" onClick={resizeAll} disabled={busy}>{busy ? <BusyLabel label="Resizing your images..." /> : `Resize ${batch.length} images`}</button>
            {good.length > 1 && !busy && (
              <button type="button" className="btn secondary" onClick={downloadZip}>Download all as ZIP</button>
            )}
          </div>
          {busy && <ProcessingNote label={progress || 'Resizing your images...'} />}
          {outputs.length > 0 && (
            <div className="file-results">
              {outputs.map((o, i) => (
                <div className="file-row" key={`${o.name}-${i}`}>
                  {o.blob ? (
                    <>
                      <img src={o.url} alt="" className="file-thumb" />
                      <span className="file-name">{o.name}</span>
                      <span className="file-size">{formatBytes(o.origSize)} to {formatBytes(o.blob.size)} ({o.w} × {o.h} px)</span>
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
              Done: {good.length} image{good.length > 1 ? 's' : ''} resized on your device. Nothing was uploaded.
            </p>
          )}
        </>
      )}
    </ToolLayout>
  );
}

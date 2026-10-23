import React, { useEffect, useRef, useState } from 'react';
import ToolLayout from '../../components/ToolLayout.jsx';
import FileDrop from '../../components/FileDrop.jsx';
import { ProcessingNote, SuccessDownload, BusyLabel } from '../../components/ProcessUI.jsx';
import { formatBytes, downloadBlob, holdAtLeast, loadImageFromFile, imageToCanvas, canvasToBlob, swapExt } from '../../lib/files.js';

const TARGETS = [
  { id: 'image/png', label: 'PNG', ext: 'png' },
  { id: 'image/jpeg', label: 'JPG', ext: 'jpg' },
  { id: 'image/webp', label: 'WebP', ext: 'webp' },
];

const FAQS = [
  {
    q: 'When should I convert JPG to PNG?',
    a: 'PNG is lossless and supports transparency, so it suits graphics, logos and screenshots you plan to edit further. The trade-off is size: a photo saved as PNG is often five to ten times larger than the same photo as JPG.',
  },
  {
    q: 'When should I convert PNG to JPG?',
    a: 'When the image is a photo and file size matters more than pixel-perfect quality: uploading to a website, sending by email or posting where PNG is not accepted. JPG has no transparency, so transparent areas are filled with white in this converter.',
  },
  {
    q: 'Why convert to WebP?',
    a: 'WebP usually produces files 25 to 35 percent smaller than JPG at similar quality, with transparency support like PNG. All modern browsers display WebP, which makes it a great default for websites. Some older desktop apps still cannot open it, so keep a JPG copy for sharing.',
  },
  {
    q: 'Is my image uploaded for conversion?',
    a: 'No. The conversion draws your image onto a browser canvas and re-encodes it locally. The file never leaves your device.',
  },
];

const CONTENT = (
  <>
    <h2>Convert between JPG, PNG and WebP</h2>
    <p>
      Different jobs need different formats: a form that only accepts JPG, a design
      tool that wants PNG, a website that loads fastest with WebP. This converter
      switches between the three formats instantly in your browser, shows the size
      change, and downloads the converted file. Converting to JPG or WebP uses
      the quality you set with the slider (92 percent by default), high enough
      that photos show no visible difference.
    </p>
    <h2>A quick format guide</h2>
    <ul>
      <li><strong>JPG:</strong> best for photos, smallest compatible files, no transparency.</li>
      <li><strong>PNG:</strong> lossless, supports transparency, best for graphics and anything you will edit again.</li>
      <li><strong>WebP:</strong> modern all-rounder with the smallest files, ideal for web use.</li>
    </ul>
    <p>
      File still too big afterwards? Run it through the{' '}
      <a href="/image-compressor">Image Compressor</a>.
    </p>
    <h2>How conversion works under the hood</h2>
    <p>
      Converting a format is not renaming a file. Your browser first decodes the
      original image into a grid of pixels held in memory, draws that grid onto a
      canvas at the exact same width and height, and then encodes the pixels again
      using the rules of the new format. That re-encode is where the differences
      appear. Encoding to JPG applies lossy compression and drops transparency,
      which is why this converter paints a white background behind see through
      areas first. Encoding to PNG stores every pixel exactly, so nothing is lost
      but files grow. Encoding to WebP uses a newer method that can work either
      way, keeping detail while storing it more efficiently. Because the pixels
      are rebuilt from scratch, metadata such as camera settings and location
      tags from the original file do not carry across into the converted copy.
    </p>
    <h2>Practical tips for cleaner conversions</h2>
    <ul>
      <li><strong>Convert from the best source you have:</strong> converting a small, heavily compressed JPG to PNG does not restore quality, it just makes a bigger file with the same flaws.</li>
      <li><strong>Think about transparency before you start:</strong> if a logo has a transparent background and you convert it to JPG, the background becomes solid white. Keep a PNG or WebP master if you still need the transparency.</li>
      <li><strong>Check the result size before sending:</strong> a PNG converted from a large photo can be several megabytes. If the destination has an upload limit, convert to JPG or WebP instead.</li>
      <li><strong>Test where the file will be used:</strong> open the converted image in the actual app, form or website that needs it, not just in your photo viewer.</li>
      <li><strong>Rename clearly:</strong> add the new format or purpose to the file name, such as logo-web.webp, so versions do not get mixed up later.</li>
    </ul>
    <h2>A worked example</h2>
    <p>
      Imagine a designer sends you a product logo as a 2400 by 2400 PNG with a
      transparent background, weighing 1.9 MB. Your online shop accepts the PNG
      as is for the product page, so you keep it untouched. For a marketplace
      listing that only accepts JPG, you convert a copy here. The result is
      about 320 KB on a white background, which suits the marketplace layout
      perfectly. For your own website header, where the logo sits on a colored
      band, you convert another copy to WebP at roughly 90 KB, and the
      transparency survives, so the band color shows through cleanly. One
      master file, three conversions, each matched to where it will appear.
    </p>
    <h2>Common mistakes to avoid</h2>
    <ul>
      <li><strong>Just renaming the extension:</strong> changing photo.png to photo.jpg by renaming does not convert anything. The file contents stay PNG, and many apps will refuse to open it.</li>
      <li><strong>Converting back and forth repeatedly:</strong> every trip through JPG loses a little more detail. Always convert from the original master, not from a previous conversion.</li>
      <li><strong>Expecting PNG to fix a blurry JPG:</strong> conversion cannot invent detail that was never saved. If the source is soft, every format made from it will be soft.</li>
      <li><strong>Forgetting about background color:</strong> transparent areas turn white in JPG. If your design needs a dark background, convert to PNG or WebP, or place the JPG on a matching backdrop.</li>
      <li><strong>Sending WebP to software that cannot read it:</strong> a few older desktop programs and print shops still struggle with WebP. Send JPG when you are unsure what the other side uses.</li>
    </ul>
    <p>
      If dimensions are the problem rather than format, the{' '}
      <a href="/image-resizer">Image Resizer</a> changes pixel size while keeping
      the format you already have.
    </p>
  </>
);

export default function ImageConverter() {
  const [file, setFile] = useState(null);
  const [img, setImg] = useState(null);
  const [target, setTarget] = useState(TARGETS[0]);
  const [quality, setQuality] = useState(92);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const urlRef = useRef('');

  useEffect(() => () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    if (result && result.url) URL.revokeObjectURL(result.url);
  }, [result]);

  const onFiles = async (files) => {
    const f = files[0];
    setError('');
    setResult(null);
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

  const convert = async () => {
    if (!img || !file) return;
    const started = Date.now();
    setBusy(true);
    setError('');
    try {
      const canvas = imageToCanvas(img, img.naturalWidth, img.naturalHeight);
      if (target.id === 'image/jpeg') {
        const ctx = canvas.getContext('2d');
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      const blob = await canvasToBlob(canvas, target.id, target.id === 'image/png' ? undefined : quality / 100);
      await holdAtLeast(started);
      if (result && result.url) URL.revokeObjectURL(result.url);
      setResult({ blob, url: URL.createObjectURL(blob), label: target.label, ext: target.ext });
    } catch (e) {
      setError(e.message);
    }
    setBusy(false);
  };

  return (
    <ToolLayout
      slug="image-converter"
      path="/image-converter"
      title="Image Converter: JPG to PNG, PNG to JPG, WebP | ToolNest"
      description="Convert images between JPG, PNG and WebP formats in your browser. No upload, instant download, your files never leave your device."
      h1="Image Converter"
      intro="Convert any JPG, PNG or WebP image to another format, right in your browser. No upload, no waiting, and you see the new file size before downloading."
      faqs={FAQS}
      content={CONTENT}
    >
      <FileDrop accept="image/jpeg,image/png,image/webp" onFiles={onFiles} label="Drop an image here, or click to choose one" />
      {error && <div className="message err">{error}</div>}

      {file && img && (
        <>
          <div className="stat-grid">
            <div className="stat"><div className="num">{formatBytes(file.size)}</div><div className="lbl">Original ({file.type.replace('image/', '').toUpperCase() || 'image'})</div></div>
            <div className="stat"><div className="num">{img.naturalWidth} × {img.naturalHeight}</div><div className="lbl">Dimensions (px)</div></div>
            <div className="stat"><div className="num">{result ? formatBytes(result.blob.size) : '...'}</div><div className="lbl">Converted size</div></div>
          </div>
          <div className="field" style={{ marginTop: 16 }}>
            <label htmlFor="conv-target">Convert to</label>
            <select id="conv-target" value={target.id} onChange={(e) => { setTarget(TARGETS.find((t) => t.id === e.target.value)); setResult(null); }}>
              {TARGETS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          {target.id !== 'image/png' && (
            <div className="field">
              <label htmlFor="conv-quality">Quality: {quality}%</label>
              <input
                id="conv-quality"
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
          <div className="btn-row">
            <button type="button" className="btn" onClick={convert} disabled={busy}>{busy ? <BusyLabel label="Converting your image..." /> : `Convert to ${target.label}`}</button>
          </div>
          {busy && <ProcessingNote label="Converting your image..." />}
          {result && !busy && (
            <SuccessDownload
              message={`Your image has been converted to ${result.label} (${formatBytes(result.blob.size)}). Click Download to save it.`}
              buttonLabel={`Download ${result.label}`}
              onDownload={() => downloadBlob(result.blob, swapExt(file.name, result.ext))}
            />
          )}
          {result && (
            <div className="qr-preview">
              <img src={result.url} alt="Converted preview" style={{ maxWidth: 'min(420px, 100%)' }} />
            </div>
          )}
        </>
      )}
    </ToolLayout>
  );
}

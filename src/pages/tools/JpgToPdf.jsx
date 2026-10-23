import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import ToolLayout from '../../components/ToolLayout.jsx';
import FileDrop from '../../components/FileDrop.jsx';
import { ProcessingNote, SuccessDownload, BusyLabel } from '../../components/ProcessUI.jsx';
import { formatBytes, downloadBlob, holdAtLeast, loadImageFromFile, imageToCanvas, canvasToBlob } from '../../lib/files.js';

const PAGE_SIZES = [
  { id: 'fit', label: 'Fit page to image' },
  { id: 'a4', label: 'A4 (210 × 297 mm)', w: 595.28, h: 841.89 },
  { id: 'letter', label: 'US Letter (8.5 × 11 in)', w: 612, h: 792 },
];

const FAQS = [
  {
    q: 'Which image formats can I add?',
    a: 'JPG and PNG images embed directly. WebP and other browser-readable formats are converted to PNG automatically before being added, so you can drop in almost any image. Each image becomes one page, in the order shown in the list.',
  },
  {
    q: 'What page size should I choose?',
    a: 'Fit to image makes each page exactly the size of its image, which is best for viewing on screens. A4 and Letter place each image on a standard paper page with margins, scaling it to fit, which is the right choice when the PDF will be printed.',
  },
  {
    q: 'Are my images uploaded?',
    a: 'No. The PDF is assembled in your browser from the images you select. Nothing leaves your device, so photos and scans stay private.',
  },
  {
    q: 'How do I control the page order?',
    a: 'Pages follow the order of the file list. Use the up and down buttons to rearrange images before creating the PDF, or remove one and add it again to move it to the end.',
  },
];

const CONTENT = (
  <>
    <h2>Turn images into a PDF document</h2>
    <p>
      Add one image or a whole set, arrange them, and download a single PDF with one
      image per page. It is the fastest way to turn phone photos of documents,
      scanned pages or a gallery of pictures into one tidy, easy-to-share file.
      Choose fit-to-image pages for screen viewing or standard A4 or Letter pages
      for printing, all without uploading anything.
    </p>
    <h2>Good uses for image-to-PDF</h2>
    <ul>
      <li>Send photographed receipts, forms or ID pages as one professional PDF.</li>
      <li>Bundle scanned book or notebook pages in order.</li>
      <li>Create a simple photo album or portfolio file to email.</li>
      <li>Prepare images for portals that only accept PDF uploads.</li>
    </ul>
    <h2>How image to PDF conversion works under the hood</h2>
    <p>
      When you add images, your browser reads each file and the tool builds the PDF locally with pdf-lib, an open source JavaScript library. JPG files are embedded directly, which means the compressed image data from your camera or scanner is placed inside the PDF without being decoded and saved again. That keeps file sizes predictable and avoids an extra loss of quality. PNG files are embedded directly as well, which suits screenshots and scanned line art. Other formats your browser can display, such as WebP, are first drawn onto a canvas in memory and converted to PNG so they can be embedded reliably. For each image the tool creates one page. With fit to image, the page dimensions match the image. With A4 or Letter, the tool creates a standard paper page, leaves a margin of 36 points on each side, and scales the image proportionally so the whole picture fits without cropping or stretching. Nothing is uploaded, so personal photos and identity documents stay on your device.
    </p>
    <h2>Practical tips for better looking results</h2>
    <ul>
      <li><strong>Photograph documents flat and straight.</strong> Place the page on a contrasting surface, hold the phone directly above it, and avoid shadows across the text. A straight photo reads far better once it becomes a PDF page.</li>
      <li><strong>Mix portrait and landscape with care.</strong> On A4 and Letter pages, a landscape photo on a portrait page will be scaled down to fit the width and will leave large empty bands above and below. If most of your images are landscape, consider whether fit to image gives a cleaner result for screen viewing.</li>
      <li><strong>Order images before you build.</strong> Use the up and down controls so the cover, form, or first chapter comes first. File names from a phone camera rarely sort in story order, so a quick manual check prevents a jumbled document.</li>
      <li><strong>Watch total size for email.</strong> Ten full resolution phone photos at 4 MB each will produce a PDF of roughly 40 MB, which most email services will reject. If size matters, reduce the images first with <a href="/image-compressor">Image Compressor</a> or resize them with <a href="/image-resizer">Image Resizer</a> before converting.</li>
      <li><strong>Choose PNG for crisp text screenshots.</strong> Screenshots and scanned forms with sharp edges stay cleaner as PNG. Photos are usually smaller and just as clear as JPG, so keeping each image in its original format is a sensible default.</li>
    </ul>
    <h2>A worked example</h2>
    <p>
      Suppose you photographed a 6 page handwritten agreement with your phone. Each photo is a JPG of about 2.8 MB, giving a combined size of about 16.8 MB. You add the six images, arrange them so page 1 is first, and choose A4 because the recipient will print the file. The tool places each photo centered on an A4 page with even margins and produces a 6 page PDF of about 16.5 MB, since JPG data is embedded without recompression. That file is tidy but large for email. If you first compress copies of the photos to about 600 KB each, the same steps produce a PDF of roughly 3.6 MB that still prints clearly and sends without any problem.
    </p>
    <h2>Common mistakes to avoid</h2>
    <ul>
      <li><strong>Expecting searchable text.</strong> A photo of text is still a picture inside the PDF. Readers cannot select, copy, or search the words unless the document is later processed with text recognition software. Keep that in mind for archives you may need to search.</li>
      <li><strong>Stretching expectations on fit to image.</strong> Fit to image pages all have different sizes when your source images have different dimensions. That is fine on screen but awkward for home printing, where A4 or Letter gives every sheet the same shape.</li>
      <li><strong>Adding the same image twice.</strong> With similar camera file names it is easy to include a duplicate page and miss another one entirely. Compare the count in the list with the number of pages you expect before you create the PDF.</li>
      <li><strong>Using huge images for a simple form.</strong> A 6000 pixel wide photo of a single receipt adds size without adding useful detail. Cropping tightly to the document and resizing very large images first keeps the final PDF fast to open on any device.</li>
    </ul>
  </>
);

export default function JpgToPdf() {
  const [files, setFiles] = useState([]);
  const [sizeId, setSizeId] = useState('a4');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);

  const addFiles = (newFiles) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setStatus(null);
    setResult(null);
  };
  const move = (idx, dir) => {
    setResult(null);
    setFiles((prev) => {
      const next = [...prev];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });
  };
  const remove = (idx) => { setResult(null); setFiles((prev) => prev.filter((_, i) => i !== idx)); };

  const build = async () => {
    if (!files.length) {
      setStatus({ ok: false, msg: 'Add at least one image first.' });
      return;
    }
    const started = Date.now();
    setBusy(true);
    setStatus(null);
    setResult(null);
    try {
      const size = PAGE_SIZES.find((s) => s.id === sizeId);
      const doc = await PDFDocument.create();
      for (const f of files) {
        let bytes;
        let embed;
        if (f.type === 'image/jpeg') {
          bytes = new Uint8Array(await f.arrayBuffer());
          embed = await doc.embedJpg(bytes);
        } else if (f.type === 'image/png') {
          bytes = new Uint8Array(await f.arrayBuffer());
          embed = await doc.embedPng(bytes);
        } else {
          const { img, url } = await loadImageFromFile(f);
          const canvas = imageToCanvas(img, img.naturalWidth, img.naturalHeight);
          const blob = await canvasToBlob(canvas, 'image/png');
          URL.revokeObjectURL(url);
          embed = await doc.embedPng(new Uint8Array(await blob.arrayBuffer()));
        }
        if (size.id === 'fit') {
          const page = doc.addPage([embed.width, embed.height]);
          page.drawImage(embed, { x: 0, y: 0, width: embed.width, height: embed.height });
        } else {
          const page = doc.addPage([size.w, size.h]);
          const margin = 36;
          const maxW = size.w - margin * 2;
          const maxH = size.h - margin * 2;
          const scale = Math.min(maxW / embed.width, maxH / embed.height);
          const w = embed.width * scale;
          const h = embed.height * scale;
          page.drawImage(embed, { x: (size.w - w) / 2, y: (size.h - h) / 2, width: w, height: h });
        }
      }
      const saved = await doc.save();
      await holdAtLeast(started);
      setResult({
        blob: new Blob([saved], { type: 'application/pdf' }),
        pages: files.length,
        size: saved.length,
      });
    } catch (e) {
      setStatus({ ok: false, msg: 'One of the images could not be processed. Try JPG or PNG files.' });
    }
    setBusy(false);
  };

  return (
    <ToolLayout
      slug="jpg-to-pdf"
      path="/jpg-to-pdf"
      title="JPG to PDF Converter Free: Combine Images Online | ToolNest"
      description="Convert and combine JPG, PNG and WebP images into one PDF free. A4 or Letter pages, no upload, no sign-up, instant download."
      h1="JPG to PDF Converter"
      intro="Convert and combine one or more images into a single PDF document free. Choose A4, Letter or fit-to-image pages, arrange the order, and download, all without uploading your images and without signing up."
      faqs={FAQS}
      content={CONTENT}
    >
      <FileDrop accept="image/jpeg,image/png,image/webp,image/*" multiple onFiles={addFiles} label="Drop images here, or click to choose them" />

      {files.length > 0 && (
        <ul className="file-list">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="file-item">
              <span className="file-name">{i + 1}. {f.name}</span>
              <span className="file-size">{formatBytes(f.size)}</span>
              <span className="file-actions">
                <button type="button" className="btn ghost" onClick={() => move(i, -1)} disabled={i === 0}>Up</button>
                <button type="button" className="btn ghost" onClick={() => move(i, 1)} disabled={i === files.length - 1}>Down</button>
                <button type="button" className="btn ghost" onClick={() => remove(i)}>Remove</button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="field" style={{ marginTop: 16 }}>
        <label htmlFor="jpgpdf-size">Page size</label>
        <select id="jpgpdf-size" value={sizeId} onChange={(e) => setSizeId(e.target.value)}>
          {PAGE_SIZES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>

      {status && <div className={`message ${status.ok ? 'ok' : 'err'}`}>{status.msg}</div>}
      {busy && <ProcessingNote label="Building your PDF..." />}
      {result && !busy && (
        <SuccessDownload
          message={`Your PDF has been created with ${result.pages} page${result.pages === 1 ? '' : 's'} (${formatBytes(result.size)}). Click Download to save it.`}
          buttonLabel="Download PDF"
          onDownload={() => downloadBlob(result.blob, 'images.pdf')}
        />
      )}
      <div className="btn-row">
        <button type="button" className="btn" onClick={build} disabled={busy || !files.length}>
          {busy ? <BusyLabel label="Building your PDF..." /> : 'Create PDF'}
        </button>
        {files.length > 0 && <button type="button" className="btn ghost" onClick={() => { setFiles([]); setResult(null); setStatus(null); }} disabled={busy}>Clear list</button>}
      </div>
    </ToolLayout>
  );
}

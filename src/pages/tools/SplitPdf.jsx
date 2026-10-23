import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import ToolLayout from '../../components/ToolLayout.jsx';
import FileDrop from '../../components/FileDrop.jsx';
import { ProcessingNote, SuccessDownload, BusyLabel } from '../../components/ProcessUI.jsx';
import { formatBytes, downloadBlob, holdAtLeast } from '../../lib/files.js';

const FAQS = [
  {
    q: 'How do page ranges work?',
    a: 'Type the first and last page you want, counting from 1. Extracting pages 3 to 5 from a 10-page document creates a new 3-page PDF with the original quality and formatting. Leave the range at the full document and you simply get a copy.',
  },
  {
    q: 'What does "every page separately" do?',
    a: 'It creates one single-page PDF per page and downloads them one after another, named with their page numbers. Your browser may ask permission for multiple downloads; allow it and all files will save. For big documents this can mean many files, so the range option is better when you only need a few pages.',
  },
  {
    q: 'Are my files uploaded anywhere?',
    a: 'No. The PDF is opened and split in your browser\'s memory. The file never leaves your device, so it is safe for personal and confidential documents.',
  },
  {
    q: 'Can I split a password-protected PDF?',
    a: 'No. Encrypted PDFs must be unlocked first with their password in a PDF reader that can remove protection. This tool reads standard, unencrypted PDFs.',
  },
];

const CONTENT = (
  <>
    <h2>Extract pages from a PDF</h2>
    <p>
      Sometimes you need one chapter, one signed page or one section of a long
      document, not the whole thing. Add a PDF, choose a page range to extract as a
      new file, or split every page into its own PDF. Splitting copies pages
      exactly, so text, images and formatting are untouched, and it all happens in
      your browser with no upload.
    </p>
    <h2>Common reasons to split a PDF</h2>
    <ul>
      <li>Send only the relevant pages of a report or contract.</li>
      <li>Separate a scanned bundle into individual documents.</li>
      <li>Pull a single form out of a long pack.</li>
      <li>Share one chapter of an ebook or manual.</li>
    </ul>
    <p>
      Going the other way? <a href="/merge-pdf">Merge PDF</a> joins files together.
    </p>
    <h2>How splitting works under the hood</h2>
    <p>
      When you select a file, your browser reads it into memory and opens it with pdf-lib, an open source JavaScript library that runs on your device. The tool counts the pages, then copies only the pages you asked for into a brand new PDF document. That copy process matters for quality. The text, images, and layout for each selected page are carried across unchanged, so a page that was sharp and searchable in the original stays that way in the extract. Nothing is rendered as a picture and nothing is uploaded. For the every page separately option, the same step is repeated once per page, creating single page files your browser downloads one after another. A 20 page report splits in a moment, while a 300 page scanned book will take longer and use more memory, especially on a phone.
    </p>
    <h2>Practical tips for accurate splits</h2>
    <ul>
      <li><strong>Find the real page numbers first.</strong> PDF page numbers and printed page numbers often differ. A book chapter that says page 45 in its footer might be the 52nd page of the PDF file once covers and introductions are counted. Open the document, scroll to the content you want, and note the position your reader shows before you type a range.</li>
      <li><strong>Extract in blocks for large jobs.</strong> If you need three separate sections from one long manual, run the tool three times with three ranges instead of splitting every page and deleting the files you do not need. You will end up with exactly the files you want and a cleaner downloads folder.</li>
      <li><strong>Rename results right away.</strong> Files named by range, such as pages 12 to 18, are hard to identify a week later. Rename each extract to describe its content, for example chapter 4 or signed agreement.</li>
      <li><strong>Keep the original untouched.</strong> Splitting never modifies your source file. Store the original safely so you can extract a different range later without having to rebuild anything with <a href="/merge-pdf">Merge PDF</a>.</li>
    </ul>
    <h2>A worked example</h2>
    <p>
      Imagine a 96 page tenancy pack that a landlord sent as a single file. You only need to forward the inventory section to a contractor. You open the pack, find the inventory starts on PDF page 71 and ends on page 78, and enter 71 as the first page and 78 as the last page. The tool returns an 8 page PDF that keeps the original formatting, check boxes, and photos at full quality. Instead of sending a 14 MB file and asking the contractor to hunt through it, you send a file of roughly 1.5 MB that opens directly on the relevant section. If you also need the signed agreement on pages 88 to 91 for a different person, a second quick extraction gives you that as its own 4 page file, with no need to share the rest of the pack.
    </p>
    <h2>Common mistakes to avoid</h2>
    <ul>
      <li><strong>Using off by one ranges.</strong> Ranges here are inclusive. Asking for pages 5 to 10 gives you six pages, not five, because both the starting and ending pages are included. Counting inclusively before you start prevents missing a final page or including an extra one.</li>
      <li><strong>Splitting every page when you only need a few.</strong> Choosing the separate pages option on a 150 page document creates 150 downloads. Most browsers will ask for permission and the folder quickly becomes hard to manage. Use a range whenever you know which pages you need.</li>
      <li><strong>Blocking multiple downloads.</strong> If you do split every page, allow multiple downloads when your browser prompts you. If you block them, only the first file will save and it can look as if the tool stopped early.</li>
      <li><strong>Trying to split an encrypted file.</strong> A file that needs a password to open cannot be read by the browser tool. Unlock it first in a reader that supports removing protection with the correct password, save an unprotected copy, and then split that copy.</li>
    </ul>
    <p>
      After extracting, open the new file and scroll through it once. A ten second check confirms the first and last pages are the ones you intended.
    </p>
  </>
);

export default function SplitPdf() {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(1);
  const [busy, setBusy] = useState(false);
  const [action, setAction] = useState('');
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);

  const onFiles = async (files) => {
    const f = files[0];
    setStatus(null);
    setResult(null);
    setFile(null);
    setPageCount(0);
    try {
      const bytes = await f.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      setFile(f);
      setPageCount(doc.getPageCount());
      setFrom(1);
      setTo(doc.getPageCount());
    } catch (e) {
      setStatus({ ok: false, msg: 'That file could not be read as a PDF. It may be damaged or encrypted.' });
    }
  };

  const loadSource = async () => {
    const bytes = await file.arrayBuffer();
    return PDFDocument.load(bytes, { ignoreEncryption: true });
  };

  const extractRange = async () => {
    if (!file) return;
    const start = Math.max(1, Math.min(from, pageCount));
    const end = Math.max(start, Math.min(to, pageCount));
    const started = Date.now();
    setBusy(true);
    setAction('range');
    setStatus(null);
    setResult(null);
    try {
      const src = await loadSource();
      const out = await PDFDocument.create();
      const indices = [];
      for (let i = start - 1; i <= end - 1; i += 1) indices.push(i);
      const pages = await out.copyPages(src, indices);
      pages.forEach((p) => out.addPage(p));
      const saved = await out.save();
      await holdAtLeast(started);
      setResult({
        blob: new Blob([saved], { type: 'application/pdf' }),
        name: `pages-${start}-to-${end}.pdf`,
        pages: end - start + 1,
        size: saved.length,
      });
    } catch (e) {
      setStatus({ ok: false, msg: 'Splitting failed. The file may be damaged or encrypted.' });
    }
    setBusy(false);
    setAction('');
  };

  const splitEvery = async () => {
    if (!file) return;
    const started = Date.now();
    setBusy(true);
    setAction('every');
    setStatus(null);
    setResult(null);
    try {
      const src = await loadSource();
      const base = file.name.replace(/\.pdf$/i, '');
      for (let i = 0; i < pageCount; i += 1) {
        const out = await PDFDocument.create();
        const [page] = await out.copyPages(src, [i]);
        out.addPage(page);
        const saved = await out.save();
        downloadBlob(new Blob([saved], { type: 'application/pdf' }), `${base}-page-${i + 1}.pdf`);
        await new Promise((r) => setTimeout(r, 350));
      }
      await holdAtLeast(started);
      setStatus({ ok: true, msg: `Your PDF has been split into ${pageCount} single-page PDFs, saved to your downloads folder (your browser may group them).` });
    } catch (e) {
      setStatus({ ok: false, msg: 'Splitting failed. The file may be damaged or encrypted.' });
    }
    setBusy(false);
    setAction('');
  };

  return (
    <ToolLayout
      slug="split-pdf"
      path="/split-pdf"
      title="Split PDF: Extract Pages from Any PDF File | ToolNest"
      description="Split a PDF by extracting a page range, or save every page as its own file. Runs in your browser, no upload, pages copied exactly."
      h1="Split PDF"
      intro="Extract a page range from a PDF as a new file, or split every page into its own PDF. Your file is processed in your browser and never uploaded."
      faqs={FAQS}
      content={CONTENT}
    >
      <FileDrop accept="application/pdf,.pdf" onFiles={onFiles} label="Drop a PDF here, or click to choose one" />

      {file && pageCount > 0 && (
        <>
          <p className="hint" style={{ marginTop: 14 }}>
            {file.name}: {pageCount} pages, {formatBytes(file.size)}
          </p>
          <div className="row">
            <div className="field">
              <label htmlFor="split-from">From page</label>
              <input id="split-from" type="text" inputMode="numeric" value={from} onChange={(e) => setFrom(parseInt(e.target.value, 10) || 1)} />
            </div>
            <div className="field">
              <label htmlFor="split-to">To page</label>
              <input id="split-to" type="text" inputMode="numeric" value={to} onChange={(e) => setTo(parseInt(e.target.value, 10) || 1)} />
            </div>
          </div>
        </>
      )}

      {status && <div className={`message ${status.ok ? 'ok' : 'err'}`}>{status.msg}</div>}
      {busy && <ProcessingNote label={action === 'every' ? 'Splitting every page...' : 'Extracting your pages...'} />}
      {result && !busy && (
        <SuccessDownload
          message={`Your pages have been extracted into a new PDF (${result.pages} page${result.pages === 1 ? '' : 's'}, ${formatBytes(result.size)}). Click Download to save it.`}
          buttonLabel="Download extracted PDF"
          onDownload={() => downloadBlob(result.blob, result.name)}
        />
      )}
      <div className="btn-row">
        <button type="button" className="btn" onClick={extractRange} disabled={busy || !file}>
          {busy && action === 'range' ? <BusyLabel label="Extracting your pages..." /> : 'Extract page range'}
        </button>
        <button type="button" className="btn secondary" onClick={splitEvery} disabled={busy || !file}>
          {busy && action === 'every' ? <BusyLabel accent label="Splitting every page..." /> : 'Split every page separately'}
        </button>
      </div>
    </ToolLayout>
  );
}

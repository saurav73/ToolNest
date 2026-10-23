import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import ToolLayout from '../../components/ToolLayout.jsx';
import FileDrop from '../../components/FileDrop.jsx';
import { ProcessingNote, SuccessDownload, BusyLabel } from '../../components/ProcessUI.jsx';
import { formatBytes, downloadBlob, holdAtLeast } from '../../lib/files.js';

const FAQS = [
  {
    q: 'Is there a limit to how many PDFs I can merge?',
    a: 'There is no fixed limit in the tool; the practical limit is your device\'s memory, because every file is held in the browser tab while merging. Merging dozens of normal documents is fine. Very large scans (hundreds of megabytes in total) may struggle on low-memory phones.',
  },
  {
    q: 'Are my PDFs uploaded to a server?',
    a: 'No. The files are read into your browser\'s memory and combined there with an open-source library. Nothing is uploaded, which makes this safe for contracts, statements and other private documents.',
  },
  {
    q: 'Will the merged PDF keep its quality and links?',
    a: 'Yes. Merging copies pages exactly as they are, so text stays selectable, images keep their resolution, and internal links and bookmarks within each document are preserved. The page order in the result matches the order of files in your list.',
  },
  {
    q: 'How do I change the order of the documents?',
    a: 'Use the up and down buttons next to each file to arrange the list before merging. The first file in the list becomes the first pages of the merged PDF. You can also remove a file and add it again at the end.',
  },
];

const CONTENT = (
  <>
    <h2>Combine PDFs into one document</h2>
    <p>
      Add two or more PDF files, arrange them in the order you want, and download a
      single merged document. Merging is done by copying pages losslessly, so
      nothing is re-rendered or degraded, and it happens entirely in your browser:
      your documents are never uploaded to any server.
    </p>
    <h2>Everyday merging jobs</h2>
    <ul>
      <li>Join a signed contract with its annexes into one file for emailing.</li>
      <li>Combine monthly statements into a single yearly document.</li>
      <li>Assemble a portfolio or application from separate scans.</li>
      <li>Merge chapter PDFs into one book or report.</li>
    </ul>
    <p>
      Need the opposite? The <a href="/split-pdf">Split PDF</a> tool pulls pages
      back out of a document.
    </p>
    <h2>How merging works under the hood</h2>
    <p>
      When you add files, your browser reads each PDF into memory as raw bytes. The tool then uses pdf-lib, an open source JavaScript library that runs entirely on your device, to open every document, list its pages, and copy those pages into a brand new PDF in the order you set. Copying is different from printing or converting. The original page content, including embedded fonts, vector drawings, and image data, is carried across exactly as it was stored. Nothing is redrawn or sent to a remote computer. Because the work happens locally, closing the tab clears the memory and no copy is left behind on a server. A modern laptop handles hundreds of pages without trouble, while an older phone with limited memory may slow down on huge scanned files.
    </p>
    <h2>Practical tips for a cleaner merge</h2>
    <ul>
      <li><strong>Order files before you merge.</strong> Add the cover or main document first, then supporting documents in reading order. Use the up and down controls and double check the list from top to bottom, because the merged file follows that list exactly.</li>
      <li><strong>Name files with numbers if order matters.</strong> Names like 01 application, 02 certificate, and 03 reference make it easier to spot a mistake before you combine anything.</li>
      <li><strong>Check page orientation and size.</strong> Merging keeps each page at its original size and rotation. If one document is landscape and the rest are portrait, the result will switch back and forth, which is normal on screen but worth fixing in your reader first if you plan to print.</li>
      <li><strong>Compress after merging, not before.</strong> If the final file is too large to email, run the finished merge through <a href="/compress-pdf">Compress PDF</a> once at the end. Compressing each source first adds steps and can reduce quality more than a single final pass.</li>
      <li><strong>Keep a copy of the originals.</strong> Merging creates a new file and does not change your sources. Keep the separate files until you have opened the merged result and confirmed every page is present and in the right place.</li>
    </ul>
    <h2>A worked example</h2>
    <p>
      Suppose you are applying for a visa and need to send one file instead of five separate uploads. You have a 2 page application form at 180 KB, a 1 page passport scan at 1.4 MB, a 4 page bank statement at 620 KB, a 1 page photo page at 900 KB, and a 2 page invitation letter at 240 KB. Added in that order, the merge produces a 10 page document of roughly 3.3 MB. You can open the result, confirm the passport scan appears on page 3 right after the form, and send one attachment instead of five. If the portal limit is 2 MB, you would then compress that single merged file rather than shrinking each piece separately.
    </p>
    <h2>Common mistakes to avoid</h2>
    <ul>
      <li><strong>Merging in the wrong order and not checking.</strong> A signed last page that lands in the middle of a contract looks careless. Always scroll through the merged file once from start to finish before sending it.</li>
      <li><strong>Assuming bookmarks merge into one outline.</strong> Internal links inside each source document are preserved, but separate documents each bring their own structure. The merged file will not automatically gain a single combined table of contents or new page numbers.</li>
      <li><strong>Trying to merge a damaged or protected file.</strong> If one file was created with restrictions or was interrupted during download, the whole merge can fail. Open each file on its own first if you see an error, and replace the one that will not open cleanly.</li>
      <li><strong>Merging the same file twice by accident.</strong> Adding a file, removing it from view mentally, and adding it again is easy when filenames look similar. Count the files in the list and compare the final page count with what you expect.</li>
    </ul>
    <p>
      If you only need part of a source document, extract those pages first with <a href="/split-pdf">Split PDF</a>, then merge the trimmed version for a much tidier final file.
    </p>
  </>
);

export default function MergePdf() {
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);

  const addFiles = (newFiles) => {
    setFiles((prev) => [...prev, ...newFiles.filter((f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'))]);
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

  const merge = async () => {
    if (files.length < 2) {
      setStatus({ ok: false, msg: 'Add at least two PDF files to merge.' });
      return;
    }
    const started = Date.now();
    setBusy(true);
    setStatus(null);
    setResult(null);
    try {
      const out = await PDFDocument.create();
      let pages = 0;
      for (const f of files) {
        const bytes = await f.arrayBuffer();
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const copied = await out.copyPages(doc, doc.getPageIndices());
        copied.forEach((p) => out.addPage(p));
        pages += copied.length;
      }
      const merged = await out.save();
      await holdAtLeast(started);
      setResult({
        blob: new Blob([merged], { type: 'application/pdf' }),
        pages,
        size: merged.length,
        count: files.length,
      });
    } catch (e) {
      setStatus({ ok: false, msg: 'One of the files could not be read as a PDF. Encrypted or damaged files cannot be merged.' });
    }
    setBusy(false);
  };

  return (
    <ToolLayout
      slug="merge-pdf"
      path="/merge-pdf"
      title="Merge PDF: Combine PDF Files Free, No Sign-Up | ToolNest"
      description="Merge PDF files into one document free, in your browser. No upload, no sign-up, no page limit. Your files never leave your device."
      h1="Merge PDF"
      intro="Combine PDF files into one document free, in exactly the order you choose, with no sign-up and no page limit. Everything happens in your browser, so private documents are never uploaded."
      faqs={FAQS}
      content={CONTENT}
    >
      <FileDrop accept="application/pdf,.pdf" multiple onFiles={addFiles} label="Drop PDF files here, or click to choose them" />

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

      {status && <div className={`message ${status.ok ? 'ok' : 'err'}`}>{status.msg}</div>}
      {busy && <ProcessingNote label="Merging your PDFs..." />}
      {result && !busy && (
        <SuccessDownload
          message={`Your PDF has been merged: ${result.count} files combined into one PDF with ${result.pages} pages (${formatBytes(result.size)}). Click Download to save it.`}
          buttonLabel="Download merged PDF"
          onDownload={() => downloadBlob(result.blob, 'merged.pdf')}
        />
      )}
      <div className="btn-row">
        <button type="button" className="btn" onClick={merge} disabled={busy || files.length < 2}>
          {busy ? <BusyLabel label="Merging your PDFs..." /> : `Merge ${files.length || ''} PDFs`}
        </button>
        {files.length > 0 && (
          <button type="button" className="btn ghost" onClick={() => { setFiles([]); setResult(null); setStatus(null); }} disabled={busy}>Clear list</button>
        )}
      </div>
    </ToolLayout>
  );
}

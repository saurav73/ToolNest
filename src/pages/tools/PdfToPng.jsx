import React from 'react';
import PdfToImages from './PdfToImages.jsx';

const FAQS = [
  {
    q: 'Why choose PNG over JPG for PDF pages?',
    a: 'PNG is lossless, so text, line art and diagrams stay pixel perfect at any zoom, and re-saving the image never degrades it. JPG files are smaller but soften fine detail slightly. Choose PNG for pages you will crop, annotate, print or archive, and JPG for quick sharing.',
  },
  {
    q: 'What resolution should I pick?',
    a: '144 DPI is the practical default: sharp on modern screens and reasonable in size. Use 216 DPI for print work or when you will crop into a small part of the page. 72 DPI is only really for thumbnails and previews, since PNG text at that size looks soft when enlarged.',
  },
  {
    q: 'Can I convert part of a long PDF?',
    a: 'Yes. Enter a page range and only those pages render, up to 50 pages per run to protect your browser\'s memory. Multi page results can be downloaded one by one or together as a ZIP, each file named with its page number.',
  },
  {
    q: 'Can I convert several PDFs at once?',
    a: 'Yes. Drop more than one PDF and batch mode converts every page of each file at the resolution you pick, up to 50 pages per file. Results are listed per file with individual downloads, or take everything together as one ZIP.',
  },
  {
    q: 'Is the conversion private?',
    a: 'Completely. The PDF is opened and rendered inside your browser with pdf.js. The file is never uploaded to a server, so sensitive documents such as contracts and statements stay on your device from start to finish.',
  },
];

const CONTENT = (
  <>
    <h2>Crisp, lossless images of your PDF pages</h2>
    <p>
      Sometimes a PDF page needs to become an image, and a soft JPG will not
      do: the wiring diagram whose labels must stay readable, the chart going
      into a printed report, the page you plan to crop and annotate. PNG is
      the lossless choice, storing every rendered pixel exactly. This
      converter renders any page range of a PDF to PNG at up to 216 DPI,
      inside your browser, using pdf.js, the renderer built into Firefox.
      Nothing is uploaded. Server converters make you hand over the document
      and wait; here the file is opened in your own tab, rendered locally,
      and the images are yours to download page by page or as one ZIP.
    </p>
    <h2>How to convert PDF to PNG</h2>
    <p>
      Drop the PDF onto the box and its page count appears. Choose a
      resolution, 144 DPI for most jobs or 216 for print and close crops, and
      set the page range if you do not need the whole document. Convert, and
      each finished page is listed with its pixel size and file size. Download
      pages individually, or all at once as a ZIP. Files are named with their
      page numbers automatically, so a long document produces a tidy,
      ordered set of images instead of a pile of downloads to rename. Dropping
      several PDFs at once switches to batch mode, converting every page of
      each file with one combined ZIP download.
    </p>
    <h2>When PNG is worth its bigger files</h2>
    <ul>
      <li><strong>Print and close crops:</strong> lossless pixels survive cropping into a corner of a page and still print cleanly.</li>
      <li><strong>Diagrams, plans and sheet music:</strong> thin lines and small notation smear in JPG and stay exact in PNG.</li>
      <li><strong>Annotation and editing:</strong> an image you will mark up and re-save repeatedly should start lossless.</li>
      <li><strong>Documentation and evidence:</strong> screenshots of records, certificates and statements stay faithful to the original page.</li>
      <li><strong>Design assets:</strong> pulling a page into a design tool keeps text edges crisp for further work.</li>
    </ul>
    <h2>How the rendering works</h2>
    <p>
      A PDF describes each page as drawing instructions in a fixed physical
      size, not as a picture. pdf.js carries out those instructions onto a
      canvas at the scale behind your DPI choice: 144 DPI doubles the
      standard 72 point rendering, 216 triples it. Because the page is drawn
      fresh from its vector instructions and embedded images, text is
      genuinely sharper at higher settings, not merely upscaled. The canvas
      is then written out as PNG. PNG compression is lossless pattern
      matching, so a rendered page of mostly text compresses surprisingly
      well, while photo heavy pages produce larger files than JPG would.
      That trade, size for exactness, is the whole reason this page exists
      alongside the JPG version.
    </p>
    <h2>Tips for better results</h2>
    <ul>
      <li><strong>Render once at the highest DPI you might need.</strong> Downscaling a 216 DPI PNG later is clean; upscaling a 72 DPI one never is.</li>
      <li><strong>Keep ranges modest on big files.</strong> At 216 DPI a single A4 page can be 3500 pixels tall. Fifty pages at once is the built in limit for a reason.</li>
      <li><strong>Need transparency?</strong> Pages are rendered on white here, matching how PDFs are normally viewed. For transparent output you would need the original artwork, not a rendered page.</li>
      <li><strong>Shrink afterwards for the web.</strong> Run a finished PNG through the <a href="/image-compressor">Image Compressor</a> to make a light JPG or WebP copy for posting, and keep the PNG as the master.</li>
    </ul>
    <h2>A worked example</h2>
    <p>
      An electrician needs the wiring diagram from page 18 of a 60 page
      equipment manual, sharp enough to read wire labels on a printed A4
      sheet at a job site. He sets the range to page 18 only, picks 216 DPI,
      and converts: a single PNG, roughly 1800 by 2550 pixels, with labels
      crisp enough to print. The rest of the manual, including pages with
      supplier pricing, never left his laptop because the conversion never
      involved an upload.
    </p>
    <p>
      Prefer smaller files for sharing? The <a href="/pdf-to-jpg">PDF to JPG converter</a>{' '}
      renders the same pages at a fraction of the size, and{' '}
      <a href="/jpg-to-pdf">JPG to PDF</a> assembles images back into a document.
    </p>
  </>
);

export default function PdfToPng() {
  return (
    <PdfToImages
      slug="pdf-to-png"
      path="/pdf-to-png"
      title="PDF to PNG Converter Free: Turn Pages into Images | ToolNest"
      description="Convert PDF pages to crisp PNG images free in your browser. Pick a page range and resolution, download singly or as a ZIP file."
      h1="PDF to PNG Converter"
      intro="Convert PDF pages to lossless PNG images in your browser, at up to 216 DPI, by the page, in ranges, or several PDFs in one batch. Your document is rendered locally and never uploaded."
      faqs={FAQS}
      content={CONTENT}
      format={{ mime: 'image/png', ext: 'png', label: 'PNG' }}
    />
  );
}

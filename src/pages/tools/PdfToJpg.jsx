import React from 'react';
import PdfToImages from './PdfToImages.jsx';

const FAQS = [
  {
    q: 'How is a PDF page turned into a JPG here?',
    a: 'Your browser opens the PDF with pdf.js, the renderer behind Firefox\'s built in viewer, and draws each page you select onto a canvas at the resolution you pick. The canvas is then saved as a JPG at 92 percent quality. Everything happens on your device; the document is never uploaded.',
  },
  {
    q: 'What DPI should I choose?',
    a: '72 DPI is fine for quick previews and thumbnails. 144 DPI is the sweet spot for slides, social posts and sharing, sharp on modern screens without huge files. Pick 216 DPI when the image will be printed or cropped closely. File size grows fast with DPI, so do not go higher than the job needs.',
  },
  {
    q: 'Can I convert only some pages?',
    a: 'Yes. Set the page range before converting and only those pages are rendered. To keep your browser responsive the tool converts up to 50 pages per run; longer documents can be done in a few ranges, and multi page results can be downloaded together as a ZIP.',
  },
  {
    q: 'Can I convert several PDFs at once?',
    a: 'Yes. Drop more than one PDF and batch mode converts every page of each file at the resolution you pick, up to 50 pages per file. Results are listed per file with individual downloads, or take everything together as one ZIP.',
  },
  {
    q: 'Is my document private?',
    a: 'Yes. The PDF is read into your browser\'s memory and rendered locally. No server receives it, which makes this safe for contracts, statements and other documents you would not upload to a conversion site.',
  },
];

const CONTENT = (
  <>
    <h2>Turn PDF pages into shareable JPG images</h2>
    <p>
      PDFs are built for documents, not for feeds, slides and group chats. When
      you need one page as a picture, a receipt to attach to a message, a chart
      to drop into a presentation, or a form page to post where PDFs are not
      accepted, the answer is to render that page as an image. This converter
      turns any page range of a PDF into JPG files, at the resolution you
      choose, and it does the rendering inside your browser with the same
      pdf.js engine Firefox uses. Upload based converters ask you to send the
      whole document to their server first; here your file is opened in your
      tab and never leaves your device, which is exactly how a contract or a
      bank statement should be handled.
    </p>
    <h2>How to convert PDF to JPG</h2>
    <p>
      Drop your PDF onto the box above and the tool counts its pages. Pick a
      resolution: 144 DPI is recommended for most uses. Set the page range if
      you only need part of the document, then convert. Each page appears in a
      results list with its pixel dimensions and file size, ready to download
      on its own, and when there is more than one page you can take them all
      together in a ZIP. Pages are rendered in order and named with their page
      number, so a 30 page report stays organised on your disk. Dropping
      several PDFs at once switches to batch mode, converting every page of
      each file with one combined ZIP download.
    </p>
    <h2>When a JPG beats the PDF</h2>
    <ul>
      <li><strong>Slides and documents:</strong> a chart or table page drops into PowerPoint, Word or Google Docs as a picture with the layout frozen exactly as designed.</li>
      <li><strong>Social and chat:</strong> WhatsApp, Instagram and most chat apps preview images inline but bury PDF attachments; a JPG page is seen immediately.</li>
      <li><strong>Forms that reject PDFs:</strong> some portals accept only image uploads for supporting documents.</li>
      <li><strong>Previews and thumbnails:</strong> the first page as a JPG makes a perfect cover image for a report, listing or portfolio entry.</li>
      <li><strong>Archiving a look, not the text:</strong> when you need to preserve exactly how a page appeared, a rendered image cannot reflow or lose fonts.</li>
    </ul>
    <h2>How the rendering works</h2>
    <p>
      A PDF page is a list of drawing instructions: text with fonts, vector
      shapes and embedded images positioned on a page of a fixed physical
      size. pdf.js interprets those instructions and paints them onto a
      canvas, scaled by the factor behind the DPI you chose, so 144 DPI
      renders each page at twice its 72 point screen size. The canvas is then
      encoded as JPG at 92 percent quality over a white background, since JPG
      has no transparency. Text stays as sharp as the chosen resolution
      allows, because it is rendered from the original vector instructions
      rather than copied from a low resolution screenshot. That is also why
      raising the DPI gives genuinely sharper output, at the cost of larger
      files and more memory, instead of just stretching the same pixels.
    </p>
    <h2>Tips for better results</h2>
    <ul>
      <li><strong>Convert from the original PDF, never from a screenshot.</strong> Rendering uses the document's real data, so even 72 DPI output beats a screen capture for text clarity.</li>
      <li><strong>Match DPI to the destination.</strong> Screens are happy at 144 DPI; print wants 216 or more; thumbnails can drop to 72 and stay tiny.</li>
      <li><strong>Use PNG for pages you will edit or zoom hard.</strong> JPG softens fine text slightly at any quality; the <a href="/pdf-to-png">PDF to PNG converter</a> keeps pages pixel perfect.</li>
      <li><strong>Split long documents into ranges.</strong> Converting a 200 page file in four ranges of 50 is faster and safer for browser memory than one giant run.</li>
    </ul>
    <h2>A worked example</h2>
    <p>
      A teacher has a 12 page exam paper as a PDF and needs question 3's
      diagram for tomorrow's slides. She sets the range to page 4 only, picks
      216 DPI because the diagram will be projected large, and converts: one
      crisp JPG, named with its page number, dropped straight into the deck.
      The full exam file, which other students should not see early, never
      left her laptop, because there was no upload step at all.
    </p>
    <p>
      Going the other way? The <a href="/jpg-to-pdf">JPG to PDF converter</a>{' '}
      assembles images back into a PDF, and <a href="/compress-pdf">Compress PDF</a>{' '}
      shrinks a heavy document for email.
    </p>
  </>
);

export default function PdfToJpg() {
  return (
    <PdfToImages
      slug="pdf-to-jpg"
      path="/pdf-to-jpg"
      title="PDF to JPG Converter Free: Turn Pages into Images | ToolNest"
      description="Convert PDF pages to JPG images free in your browser. Choose quality and resolution, download pages one by one or all in a ZIP."
      h1="PDF to JPG Converter"
      intro="Convert PDF pages to JPG images in your browser, at 72 to 216 DPI, one page at a time, a whole range at once, or several PDFs in one batch. Your document is rendered on your device and never uploaded."
      faqs={FAQS}
      content={CONTENT}
      format={{ mime: 'image/jpeg', ext: 'jpg', label: 'JPG' }}
    />
  );
}

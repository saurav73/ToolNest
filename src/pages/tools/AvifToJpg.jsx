import React from 'react';
import PairConverter, { FORMATS } from './PairConverter.jsx';

const FAQS = [
  {
    q: 'What is AVIF, and why can some of my apps not open it?',
    a: 'AVIF is a modern image format built on the AV1 video codec. It compresses photos noticeably better than JPG, which is why websites and some cameras and phones now produce it. Support arrived later than the format itself, so older editors, office tools, printers and upload forms still refuse AVIF files. JPG remains the format everything accepts.',
  },
  {
    q: 'How does the conversion work without uploading?',
    a: 'Modern browsers (Chrome, Edge, Firefox and Safari 16.4 or later) can decode AVIF natively. This tool uses that built in decoder to draw your image onto a canvas and saves the canvas as a JPG at the quality you choose (92 percent by default). The file never leaves your device.',
  },
  {
    q: 'My browser says it cannot open the AVIF file. What now?',
    a: 'That means the browser is too old to decode AVIF, and since the decoding is done by the browser itself, there is no way around it on that device. Update the browser, or open this page in a current Chrome, Edge, Firefox or Safari and the same file will convert.',
  },
];

const CONTENT = (
  <>
    <h2>How to convert AVIF to JPG</h2>
    <p>
      Drop your AVIF image onto the box above, or click to choose one. The tool
      shows the original size and dimensions, converts in your browser, and
      shows the JPG size before you download. There is no upload, no queue and
      no account. If your browser is current, the whole job takes a second or
      two, because AVIF decoding is built into the browser itself.
    </p>
    <h2>Why AVIF files keep causing trouble</h2>
    <p>
      AVIF is one of the best image formats ever shipped: at the same visual
      quality it is routinely a third smaller than JPG, with better handling
      of gradients and dark scenes. Websites adopted it quickly to speed up
      pages, and some phones and screen capture tools now save in it too. The
      problem is the long tail of everything else. Older photo editors,
      office suites, content systems, printers, ID and application portals,
      and plenty of Windows software either never added AVIF support or hide
      it behind a paid codec. So files saved from the web or exported from
      new tools bounce off the systems people actually have to submit them
      to, and the fix that always works is converting back to JPG, the one
      image format every device and form on earth accepts.
    </p>
    <h2>How the conversion works</h2>
    <p>
      Unlike HEIC, AVIF decoding is now built into every major browser, so no
      heavy decoder download is needed. Your browser reads the AVIF file into
      pixels, this tool paints those pixels onto a canvas over a white
      background (JPG has no transparency, so see through areas need a base),
      and encodes the canvas as JPG at your chosen quality (92 percent by default), a level where
      photos show no visible difference from the original. Metadata such as
      camera details and location tags does not carry across the re-encode,
      which is a small privacy bonus when sharing images publicly. All of it
      happens locally: the image is never uploaded to a server.
    </p>
    <h2>Quality tips for AVIF to JPG</h2>
    <ul>
      <li><strong>Expect the JPG to be bigger.</strong> AVIF's whole advantage is efficiency, so the same picture as JPG commonly weighs 30 to 50 percent more. That is normal, not a failed conversion.</li>
      <li><strong>Convert from the AVIF original each time.</strong> Repeated lossy conversions stack up damage; always start from the best copy you have.</li>
      <li><strong>Keep the AVIF for your own website.</strong> If the file is yours and your site supports it, AVIF is the faster choice there; convert only the copies headed for forms, email and other people's software.</li>
      <li><strong>Check anything with fine text.</strong> JPG softens sharp edges slightly. Screenshots and diagrams survive well at this quality, but zoom into the preview if every letter matters, and consider PNG via the <a href="/image-converter">Image Converter</a> for those.</li>
    </ul>
    <h2>A worked example</h2>
    <p>
      A shop owner downloads her product photos from her own website to send
      to a marketplace, and finds they are AVIF files the marketplace upload
      form rejects with a plain "invalid format" error. She converts each one
      here in seconds, uploads the JPGs without a fight, and keeps the AVIF
      versions live on her own site where they load fastest. One format for
      her website's speed, one for everyone else's compatibility, and no
      photos uploaded to a conversion server in between.
    </p>
    <p>
      Working with iPhone photos instead? The <a href="/heic-to-jpg">HEIC to JPG converter</a>{' '}
      handles Apple's format with the same in-browser privacy, and the{' '}
      <a href="/image-converter">Image Converter</a> covers JPG, PNG and WebP in every direction.
    </p>
  </>
);

export default function AvifToJpg() {
  return (
    <PairConverter
      slug="avif-to-jpg"
      path="/avif-to-jpg"
      title="AVIF to JPG Converter: Free Online, No Upload | ToolNest"
      description="Convert AVIF images to JPG free in your browser for maximum compatibility. No upload, no sign-up, instant download."
      h1="AVIF to JPG Converter"
      intro="Turn AVIF images into JPG files that every app, form and printer accepts. The conversion runs in your browser using its built in AVIF decoder, so your image is never uploaded."
      faqs={FAQS}
      content={CONTENT}
      from={FORMATS.avif}
      to={FORMATS.jpg}
      loadError="Your browser could not open that AVIF file. AVIF decoding is built into Chrome, Edge, Firefox and Safari 16.4 or later; try updating your browser or opening this page in one of those."
    />
  );
}

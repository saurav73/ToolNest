import React from 'react';
import HeicConverter from './HeicConverter.jsx';

const FAQS = [
  {
    q: 'Why choose PNG over JPG for a HEIC photo?',
    a: 'PNG is lossless: every pixel from the decoded HEIC is stored exactly, with nothing traded away for size. That makes PNG the right choice for an archive copy, for screenshots and graphics, and for any image you plan to edit repeatedly, since re-saving a JPG loses a little quality each time.',
  },
  {
    q: 'Why are the PNG files so much bigger than the HEIC originals?',
    a: 'HEIC compresses photos extremely efficiently, often half the size of an equivalent JPG. PNG stores pixels exactly, so a full resolution phone photo commonly lands between 8 and 20 MB as PNG. That is the honest price of lossless; for sharing and uploads, JPG is usually the smarter copy.',
  },
  {
    q: 'Is my photo uploaded anywhere?',
    a: 'No. The HEIC decoder runs in your browser with WebAssembly and your photo is converted on your own device. Nothing is uploaded, queued or stored on a server, which is the key difference from upload based converters.',
  },
  {
    q: 'Can I convert a batch of HEIC photos to PNG?',
    a: 'Yes. Select or drop multiple HEIC and HEIF files and the tool converts them in sequence on your device. Results can be downloaded individually, or all together as one ZIP file when there is more than one.',
  },
];

const CONTENT = (
  <>
    <h2>A lossless way out of the HEIC format</h2>
    <p>
      HEIC is the default photo format on iPhones because it packs high quality
      into small files, but plenty of software still cannot open it, and JPG,
      the usual escape hatch, throws away a little quality on the way out. PNG
      is the other escape: completely lossless, universally supported, and the
      safest format to archive or edit. This converter decodes your HEIC and
      HEIF photos and writes them out as PNG, in batches, entirely inside your
      browser. Upload based converters ask you to hand private photos to a
      server; here the decoder runs on your own device with WebAssembly, so the
      pictures never leave your machine at all.
    </p>
    <h2>How to convert HEIC to PNG</h2>
    <p>
      Drop your HEIC photos onto the box above, one or a whole batch, and click
      convert. Each photo is decoded at full resolution and saved as a PNG,
      listed with its new size when ready. Download the results one by one, or
      take the whole batch as a single ZIP. The first conversion takes slightly
      longer while the on-device decoder loads; after that, the batch flows.
      There are no settings to tune for PNG, because lossless means the output
      is simply the decoded photo, pixel for pixel.
    </p>
    <h2>When PNG is the right target</h2>
    <ul>
      <li><strong>Archiving:</strong> a PNG copy preserves the photo exactly, so it survives as a faithful master even if you later delete the HEIC.</li>
      <li><strong>Editing workflows:</strong> editors that cannot read HEIC all read PNG, and re-saving a PNG never degrades it the way repeated JPG saves do.</li>
      <li><strong>Design and documents:</strong> placing iPhone photos into design tools, documents and slides works everywhere with PNG, including tools with no HEIC support.</li>
      <li><strong>Screenshots and graphics:</strong> anything with crisp edges or text stays perfectly sharp in PNG.</li>
    </ul>
    <h2>How the conversion works</h2>
    <p>
      HEIC files store image data compressed with HEVC, a video era codec that
      most operating systems outside Apple's do not decode out of the box. This
      tool loads libheif, the reference HEIC decoder, compiled to WebAssembly,
      and runs it in your browser tab. The decoder rebuilds the photo at full
      resolution, honoring the orientation data iPhones store, and paints the
      pixels onto a canvas. Saving that canvas as PNG writes every pixel
      exactly, with lossless compression that shrinks the file by finding
      repeated patterns, never by discarding detail. Because PNG gives up the
      lossy tricks that make HEIC and JPG small, expect generous file sizes on
      detailed photos; that is the honest cost of a perfect copy, and the
      reason PNG is an archive and editing format rather than a sharing one.
    </p>
    <h2>Tips for better results</h2>
    <ul>
      <li><strong>Convert to PNG once, then derive the rest.</strong> Keep the PNG as your working master and make JPG copies from it for email, forms and the web.</li>
      <li><strong>Mind the size jump.</strong> A 3 MB HEIC can become a 15 MB PNG. Check you actually need lossless before converting a huge batch.</li>
      <li><strong>Shrink afterwards if a form complains.</strong> The <a href="/image-compressor">Image Compressor</a> can reduce a PNG's dimensions or convert a copy to JPG at an exact target size.</li>
      <li><strong>Large batches run best on desktop.</strong> HEIC decoding is processor heavy; phones manage, but smaller groups are kinder to them.</li>
    </ul>
    <h2>A worked example</h2>
    <p>
      A designer is sent product photos from a client's iPhone for a printed
      catalog. The print workflow needs exact pixels and the studio software
      will not touch HEIC. She converts the batch here to PNG, drops the files
      straight into her layout, and keeps them as the project masters. When the
      client later asks for the same photos for a web page, she makes light JPG
      copies from the PNGs with the image compressor instead of touching the
      originals again, and none of the unreleased product photos ever sat on a
      conversion server.
    </p>
    <p>
      For everyday sharing, the <a href="/heic-to-jpg">HEIC to JPG converter</a>{' '}
      produces far smaller files with the same on-device privacy.
    </p>
  </>
);

export default function HeicToPng() {
  return (
    <HeicConverter
      slug="heic-to-png"
      path="/heic-to-png"
      title="HEIC to PNG Converter: Convert iPhone Photos Free | ToolNest"
      description="Convert HEIC and HEIF iPhone photos to lossless PNG free in your browser. Batch support, no upload, photos never leave your device."
      h1="HEIC to PNG Converter"
      intro="Convert iPhone HEIC and HEIF photos to lossless PNG, one at a time or in a batch, right in your browser. Decoding happens on your own device, so your photos are never uploaded anywhere."
      faqs={FAQS}
      content={CONTENT}
      toFormat={{ mime: 'image/png', ext: 'png', label: 'PNG' }}
    />
  );
}

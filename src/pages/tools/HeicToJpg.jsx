import React from 'react';
import HeicConverter from './HeicConverter.jsx';

const FAQS = [
  {
    q: 'Why can Windows and older apps not open my iPhone photos?',
    a: 'Since iOS 11, iPhones save photos as HEIC by default because the format stores the same quality in about half the space of JPG. Windows, Android and many websites never built in support, so the files arrive as something the other side cannot open. Converting to JPG fixes that instantly, because everything opens JPG.',
  },
  {
    q: 'Is my photo uploaded to a server for conversion?',
    a: 'No. The HEIC decoder runs inside your browser using WebAssembly, and the conversion happens on your device. Your photos never leave your computer or phone, which matters for personal pictures you would never paste into a random upload site.',
  },
  {
    q: 'Will converting HEIC to JPG lose quality?',
    a: 'JPG is lossy, so a small amount of data is traded away, but at the default 92 percent quality setting the result is visually identical to the HEIC original for normal viewing and printing. If you need a pixel perfect archive copy, use the HEIC to PNG converter instead, which is lossless.',
  },
  {
    q: 'Can I convert many photos at once?',
    a: 'Yes. Drop or select a whole batch and the tool converts them one after another on your device. When more than one photo is ready you can download them individually or all together in a single ZIP file.',
  },
];

const CONTENT = (
  <>
    <h2>The iPhone photo problem, solved privately</h2>
    <p>
      Someone sends you photos from an iPhone and every file ends in .heic. Your
      Windows PC, your Android phone, the job portal, the photo printer: none of
      them want to open it. HEIC is a genuinely better format on paper, storing
      the same image in roughly half the bytes, but a format only helps if the
      other side can read it. This converter turns HEIC and HEIF photos into
      universal JPGs, in batches, and it does the whole job inside your browser.
      Server based converters make you upload family photos to a stranger's
      computer and wait in a queue; here the decoder runs on your own device, so
      the photo of your kid never leaves your machine. That privacy difference
      is the reason this tool exists.
    </p>
    <h2>How to convert HEIC to JPG</h2>
    <p>
      Drop one photo, or a whole batch, onto the box above. Set the JPG quality
      if you like: 92 percent is the default and keeps photos looking identical
      to the original while landing at a friendly size. Click convert and watch
      each photo decode on your device. Results appear in a list with their new
      sizes; download them one by one, or grab the whole batch as a single ZIP.
      The first conversion in a session takes a moment longer while the decoder
      loads, then the rest of the batch moves quickly.
    </p>
    <h2>When you need JPG instead of HEIC</h2>
    <ul>
      <li><strong>Upload forms and portals:</strong> job applications, visa and ID portals, school systems and marketplaces mostly accept JPG and PNG only, and reject HEIC outright.</li>
      <li><strong>Sharing with Windows and Android users:</strong> a JPG just opens, everywhere, with no instructions and no extra apps for the other person.</li>
      <li><strong>Printing:</strong> print shops and home printers speak JPG fluently and HEIC almost never.</li>
      <li><strong>Older software:</strong> plenty of editors, office tools and content systems still have no HEIC support years after the format launched.</li>
      <li><strong>Email:</strong> recipients on any platform can preview a JPG inline instead of downloading a mystery attachment.</li>
    </ul>
    <h2>How the conversion works</h2>
    <p>
      HEIC stores images using HEVC, the same compression family as modern video,
      which is why no simple built in decoder ships with most operating systems.
      This tool loads libheif, the reference HEIC decoder, compiled to
      WebAssembly: a near native speed module your browser can run in a sandbox.
      The decoder reconstructs the full resolution pixels from the HEIC file,
      including its orientation and color profile handling, paints them onto a
      canvas, and then encodes that canvas as JPG at the quality you chose. All
      of it happens in the tab in front of you. No server receives the file, no
      queue forms, and nothing about the photo is logged anywhere, which is a
      claim upload based converters structurally cannot make.
    </p>
    <h2>Tips for better results</h2>
    <ul>
      <li><strong>Keep the HEIC originals as your archive.</strong> They are smaller and hold the full quality. Convert JPG copies for sharing and forms, and delete those copies freely.</li>
      <li><strong>Live Photos arrive as stills.</strong> A Live Photo's moving part is a separate video file; this converter handles the still image, which is what forms and people actually need.</li>
      <li><strong>Very large batches on phones can be slow.</strong> HEIC decoding is heavy work. On a phone, convert in smaller groups; on a desktop, batches of dozens are fine.</li>
      <li><strong>Stop the problem at the source.</strong> On the iPhone, Settings, Camera, Formats, Most Compatible makes new photos save as JPG directly, if you would rather skip converting.</li>
    </ul>
    <h2>A worked example</h2>
    <p>
      A real estate agent receives 24 listing photos from a client's iPhone, all
      HEIC, all refused by the listing portal, which accepts JPG only up to 10 MB
      each. She drops the whole batch here, leaves quality at 92 percent, and
      converts: 24 JPGs, each between 1 and 3 MB, downloaded as one ZIP in about
      a minute. The photos were of someone's home interior, and at no point did
      they pass through a third party server to get there.
    </p>
    <p>
      Need the lossless version instead? The <a href="/heic-to-png">HEIC to PNG converter</a>{' '}
      uses the same on-device decoder, and the <a href="/image-compressor">Image Compressor</a>{' '}
      can shrink the resulting JPGs to an exact target size for strict upload limits.
    </p>
  </>
);

export default function HeicToJpg() {
  return (
    <HeicConverter
      slug="heic-to-jpg"
      path="/heic-to-jpg"
      title="HEIC to JPG Converter: Convert iPhone Photos Free | ToolNest"
      description="Convert HEIC and HEIF iPhone photos to JPG free in your browser. Batch convert, adjustable quality, no upload, photos stay private."
      h1="HEIC to JPG Converter"
      intro="Convert iPhone HEIC and HEIF photos to JPG, one at a time or in a batch, right in your browser. Your photos never leave your device: the decoding happens on your own machine, not on a server."
      faqs={FAQS}
      content={CONTENT}
      toFormat={{ mime: 'image/jpeg', ext: 'jpg', label: 'JPG' }}
    />
  );
}

import React from 'react';
import ImageCompressor from './ImageCompressor.jsx';

const FAQS = [
  {
    q: 'Why is 100KB such a common target size?',
    a: 'It sits at the balance point between quality and weight. Email systems, website upload forms and content platforms settled on limits around 100KB because an image that size loads instantly on any connection while still looking good at typical display sizes. Many website speed guides also use 100KB as the rule of thumb ceiling for a content image.',
  },
  {
    q: 'How does the tool compress to exactly 100KB or under?',
    a: 'It automatically searches encoder quality settings for the highest quality whose output is at or under 100KB. If quality alone cannot get a large image there, it reduces the pixel dimensions in steps and searches again. The achieved size is always shown next to the target, so there is no guessing before you upload the file somewhere else.',
  },
  {
    q: 'Should I choose JPG or WebP for a 100KB target?',
    a: 'WebP usually reaches 100KB at noticeably better quality, because its encoder is a generation newer. Choose WebP for your own website. Choose JPG when the file is headed for email, a form, or someone else\'s older software, because JPG opens everywhere.',
  },
  {
    q: 'Will my image look worse at 100KB?',
    a: 'At normal web display sizes, most photos look essentially identical at 100KB to their multi megabyte originals. You may see softening if you zoom to 100 percent on a large photo. The preview shows the true output, so check faces and text before downloading.',
  },
];

const CONTENT = (
  <>
    <h2>The web's favourite image size, on preset</h2>
    <p>
      Ask a website speed guide how big an image should be and the answer
      comes back again and again: keep it around or under 100KB. It is the
      size that loads instantly on a weak connection, keeps email light, and
      passes the upload checker on most platforms without an argument. This
      page is the full image compressor with its target already set to
      100KB. Drop in a photo of any size and the tool searches quality
      settings, then dimensions only if needed, until the output fits. The
      compression runs in your browser, so nothing about your image is
      uploaded while it happens.
    </p>
    <h2>How to compress an image to 100KB</h2>
    <p>
      Drop your JPG, PNG or WebP image into the box above. The 100KB target
      is preset, and JPEG is the default output; switch to WebP if the file
      is for your own website and you want the best quality at the size.
      Press Compress to 100KB. The tool tests encodes on your device and
      reports the achieved size next to the target, for example "landed at
      97KB", along with the percentage saved. Download, glance at the
      preview, and the file is ready for the inbox, the form or the page it
      was meant for.
    </p>
    <h2>Where 100KB is the right size</h2>
    <ul>
      <li><strong>Website content images:</strong> blog photos, product shots and thumbnails at or under 100KB keep pages fast, which visitors and search rankings both reward.</li>
      <li><strong>Email:</strong> a newsletter or message carrying a few 100KB images stays far below the size where inboxes start clipping or flagging.</li>
      <li><strong>Marketplaces and listings:</strong> selling platforms compress uploads themselves, often badly; arriving at 100KB means their version barely changes yours.</li>
      <li><strong>Forms and portals:</strong> many application and document systems cap image attachments at 100 or 200KB; 100KB passes both.</li>
      <li><strong>Messaging and sharing:</strong> files this size send instantly even on slow mobile data, with no "processing" delay.</li>
    </ul>
    <h2>How the tool finds 100KB</h2>
    <p>
      Two things decide an image file's size: the quality the encoder is
      told to keep, and the number of pixels. This tool works them in the
      right order. First it binary searches quality at full dimensions,
      homing in on the highest quality whose file still fits under 100,000
      bytes. For most photos that search alone lands the target, which is
      why the output often looks untouched. Only when the lowest usable
      quality still overshoots, usually with very large or noisy images,
      does it step the dimensions down and search again. The panel always
      shows the achieved size and, if dimensions changed, the new pixel
      size, so what you download is exactly what the numbers promised.
    </p>
    <h2>Tips for images that live on the web</h2>
    <ul>
      <li><strong>Size for the slot, not the camera.</strong> If the image displays at 800 pixels wide, a 4000 pixel original wastes bytes even after compression. The <a href="/image-resizer">Image Resizer</a> sets exact dimensions first.</li>
      <li><strong>Use WebP on your own site.</strong> It reaches 100KB looking a full quality step better than JPG. Keep JPG copies for email and forms.</li>
      <li><strong>One compression, from the original.</strong> Recompressing a compressed copy stacks softness. Always run the camera original through again if you want a different target.</li>
      <li><strong>Check text and faces in the preview.</strong> Those are where compression shows first; if they are clean, the image is good to ship.</li>
    </ul>
    <h2>A worked example</h2>
    <p>
      A food blogger exports a hero photo for a recipe post: 5.2 MB, lovely
      and far too heavy for the page. She drops it here with the 100KB
      target and WebP output. The tool lands it at 96KB, a 98 percent saving,
      and in the post layout the compressed version is indistinguishable
      from the original. Her page now loads in about a second on mobile
      data instead of making readers wait for a 5 MB appetiser.
    </p>
    <p>
      Stricter limit? The same tool is preset to <a href="/compress-image-to-50kb">50KB</a>{' '}
      for forms, and to <a href="/compress-image-to-200kb">200KB</a> for applications,
      or open the full <a href="/image-compressor">Image Compressor</a> for any custom target.
    </p>
  </>
);

export default function CompressImageTo100kb() {
  return (
    <ImageCompressor
      slug="compress-image-to-100kb"
      path="/compress-image-to-100kb"
      title="Compress Image to 100KB: Free Online, No Upload | ToolNest"
      description="Compress images to 100KB or under free in your browser, ideal for email attachments and website uploads. No upload, no sign-up, instant."
      h1="Compress Image to 100KB"
      intro="Compress an image to 100KB or under, the size email and websites load instantly. The target is preset: drop your image in and the tool finds the settings for you. Nothing is uploaded."
      faqs={FAQS}
      content={CONTENT}
      initialTargetKb={100}
    />
  );
}

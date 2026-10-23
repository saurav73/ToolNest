import React from 'react';
import ImageCompressor from './ImageCompressor.jsx';

const FAQS = [
  {
    q: 'Why do forms ask for photos under 50KB?',
    a: 'Strict limits keep old portal software fast and storage cheap. Government application systems, exam boards and university admissions portals were often built when bandwidth was scarce, and 50KB became a standard ceiling for passport photos, signatures and document scans. The file has to fit their rule, not the other way round.',
  },
  {
    q: 'How does this tool get my image under 50KB?',
    a: 'It starts at full size and searches encoder quality settings automatically until the output lands at or under 50KB. If even the lowest quality is still too large, which is common with big phone photos, it steps the pixel dimensions down and searches again. The result panel shows the achieved size next to the 50KB target so you can verify before uploading anywhere.',
  },
  {
    q: 'Will a photo still look acceptable at 50KB?',
    a: 'For the sizes these photos are actually used at, yes. A passport style portrait or a signature shown small on a form looks fine. A detailed landscape squeezed to 50KB will soften visibly. The preview shows you the real output, so judge it at the size it will be displayed, not zoomed in.',
  },
  {
    q: 'My image still is not under 50KB. What should I do?',
    a: 'The tool reports the smallest size it could reach. If that is above 50KB, the usual cause is a very large, detailed original. Crop the image to just the part the form needs before compressing: a cropped signature or face has far fewer pixels to store, and the target becomes easy.',
  },
];

const CONTENT = (
  <>
    <h2>Built for the strictest upload limit on the internet</h2>
    <p>
      Fifty kilobytes is where upload forms stop being polite. Exam
      applications, government job portals, university admissions and visa
      systems routinely demand a passport photo, a signature scan or a
      document image at 50KB or under, and reject anything larger with no
      explanation. Your phone, meanwhile, saves that same photo at 4,000
      times the size. This page is the general image compressor preset to a
      50KB target: drop the image in, and the tool searches quality settings,
      then dimensions if needed, until the file fits under the line. It runs
      in your browser, so the ID photo or signature you are shrinking is
      never uploaded to a stranger's server on the way.
    </p>
    <h2>How to compress an image to 50KB</h2>
    <p>
      Drop your JPG, PNG or WebP image above. The target is already set to
      50KB; you can leave the output format on JPEG, which reaches small
      sizes most gracefully for photos. Press Compress to 50KB and the tool
      tests encodes automatically, showing you the achieved size next to the
      target when it lands. Download the result and check the preview: at
      the small sizes these images are displayed, a portrait or signature
      should look clean. If the tool reports it could not quite reach
      50KB, crop the original tighter and run it again; fewer pixels is the
      surest way under any limit.
    </p>
    <h2>Who actually needs 50KB images</h2>
    <ul>
      <li><strong>Exam and government forms:</strong> application portals for civil service exams, scholarships and public sector jobs commonly cap photo and signature uploads at 20 to 50KB.</li>
      <li><strong>Passport and ID photos:</strong> online renewal and application systems ask for small, tightly cropped portraits, often with a size ceiling in exactly this range.</li>
      <li><strong>Signature scans:</strong> a signature is a few pen strokes on white paper; it compresses beautifully once cropped, and forms want it tiny.</li>
      <li><strong>Thumbnails and avatars:</strong> profile systems and directories that display images at 100 pixels wide gain nothing from larger files.</li>
      <li><strong>Slow connections:</strong> a 50KB image loads on connections where a 5 MB photo simply times out.</li>
    </ul>
    <h2>How the tool reaches 50KB</h2>
    <p>
      File size comes from two levers: how much detail the encoder keeps
      (quality) and how many pixels there are (dimensions). The tool pulls
      the quality lever first, binary searching between high and low
      settings to find the best quality that still fits under 50,000 bytes.
      For a modest image that is enough. For a 12 megapixel phone photo it
      usually is not, because even a heavily compressed huge canvas carries
      a size floor. Then the tool steps the dimensions down in stages,
      searching quality again at each size, until the output fits. You
      always see the final dimensions if they changed, so a portal that
      also specifies pixel dimensions can be checked before you submit.
      PNG inputs follow the same path minus the quality lever, since PNG is
      lossless; choosing JPEG output is the practical move at this size.
    </p>
    <h2>Tips for strict form limits</h2>
    <ul>
      <li><strong>Crop first, compress second.</strong> A signature cropped to the ink, or a portrait cropped to head and shoulders, can halve the work before compression starts.</li>
      <li><strong>Check the portal's other rules too.</strong> Many forms specify pixel dimensions and a white background alongside the size. The <a href="/image-resizer">Image Resizer</a> handles exact dimensions.</li>
      <li><strong>Plain backgrounds compress smaller.</strong> A portrait against a plain wall reaches 50KB at far better quality than one against busy foliage.</li>
      <li><strong>Keep the original safe.</strong> The 50KB file is a submission copy. Your full size original stays your real photo.</li>
    </ul>
    <h2>A worked example</h2>
    <p>
      A student applying for a national exam must upload a passport photo
      under 50KB and a signature under 20KB. Her phone photo is 3.8 MB. She
      crops it to head and shoulders, drops it here, and the tool lands it
      at 46KB with the face perfectly clear at form size. The signature,
      photographed on white paper and cropped to the strokes, compresses to
      18KB on the same page with the custom target set to 20KB. Both files
      pass the portal's checker on the first attempt.
    </p>
    <p>
      Need a different ceiling? The same tool is preset to{' '}
      <a href="/compress-image-to-100kb">100KB</a> and{' '}
      <a href="/compress-image-to-200kb">200KB</a>, or open the full{' '}
      <a href="/image-compressor">Image Compressor</a> and type any target you like.
    </p>
  </>
);

export default function CompressImageTo50kb() {
  return (
    <ImageCompressor
      slug="compress-image-to-50kb"
      path="/compress-image-to-50kb"
      title="Compress Image to 50KB: Free Online, No Upload | ToolNest"
      description="Compress images to 50KB or under free in your browser, sized for government forms, exam portals and thumbnails. No upload, no sign-up."
      h1="Compress Image to 50KB"
      intro="Compress an image to 50KB or under, the size government forms, exam portals and ID photo uploads demand. The target is preset: drop your image in and the tool finds the settings. Nothing is uploaded."
      faqs={FAQS}
      content={CONTENT}
      initialTargetKb={50}
    />
  );
}

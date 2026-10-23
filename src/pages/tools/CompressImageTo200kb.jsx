import React from 'react';
import ImageCompressor from './ImageCompressor.jsx';

const FAQS = [
  {
    q: 'Which uploads ask for images under 200KB?',
    a: 'Job application portals are the classic case: applicant tracking systems and company career pages commonly cap CV attachments and photo uploads at 200KB. Government document uploads, university applications and professional licensing systems use the same ceiling. It is strict enough to reject every phone photo, and generous enough to keep documents readable once compressed properly.',
  },
  {
    q: 'How does the tool compress to 200KB?',
    a: 'It searches encoder quality automatically to find the best quality that lands at or under 200KB, and only reduces the image dimensions if quality alone cannot reach the target. The result panel shows the achieved size right next to the 200KB target, so you can confirm the file will pass before you submit it anywhere.',
  },
  {
    q: 'Can I compress a scanned document image to 200KB and keep it readable?',
    a: 'Yes, in most cases. A scanned page at sensible dimensions compresses to 200KB with text still sharp enough to read comfortably, especially saved as JPG or WebP. Check the preview at full size and read the smallest print: if that is clear, the document is safe to submit.',
  },
  {
    q: 'My file came out above 200KB. What went wrong?',
    a: 'The tool tells you the smallest size it could reach. Very large, noisy images, like a high resolution photo of a crumpled document, have a size floor. Photograph or scan the document flat and straight, crop away the desk and margins, and run it again: fewer, cleaner pixels reach 200KB easily.',
  },
];

const CONTENT = (
  <>
    <h2>The job application size limit, handled</h2>
    <p>
      You are three screens into a job application when the form asks for
      your photo, your signed declaration or a scanned certificate, "maximum
      200KB". Your phone's version is 6 MB and the form will not budge. This
      page is the ToolNest image compressor with the target locked on
      arrival at 200KB: the size that job portals, recruitment systems and
      document upload forms ask for more than any other. Drop the image in
      and the tool finds the quality and, if needed, the dimensions that
      land it under the line, reporting the achieved size so you can submit
      with confidence. It all happens in your browser, which matters when
      the image is a personal document.
    </p>
    <h2>How to compress an image to 200KB</h2>
    <p>
      Drop your JPG, PNG or WebP image above; the 200KB target is already
      set. Press Compress to 200KB and the tool tests encodes on your
      device, searching for the highest quality that fits. The result shows
      the achieved size next to the target and the percentage saved.
      Download it, open the preview at full size, and read the smallest
      text you can find: certificates, ID numbers and signatures should
      stay legible. Then upload it to the form knowing it will pass the
      size check, because you have already seen the exact byte count.
    </p>
    <h2>Uploads that demand 200KB</h2>
    <ul>
      <li><strong>Job applications:</strong> career portals and applicant tracking systems cap photos and document images at 200KB more often than any other limit.</li>
      <li><strong>University and course applications:</strong> transcripts, certificates and ID images frequently carry a 200KB ceiling per file.</li>
      <li><strong>Government document uploads:</strong> permit, licence and benefits portals use 200KB as a standard per document limit.</li>
      <li><strong>Professional registrations:</strong> licensing bodies ask for qualification scans and portraits under this size.</li>
      <li><strong>Email attachments with headroom:</strong> at 200KB you can attach several documents to one email and stay far below inbox limits.</li>
    </ul>
    <h2>How the tool reaches the target</h2>
    <p>
      An image file's size is set by its pixel count and by how faithfully
      the encoder stores them. This tool pulls the quality lever first,
      binary searching the settings to find the best quality whose output
      still fits in 200,000 bytes. Most photos and clean scans land the
      target right there, at dimensions untouched and quality barely
      reduced. If the image is enormous or full of fine noise, film grain,
      busy fabric, a photographed page at an angle, even the lowest quality
      at full size can overshoot. Only then does the tool step the
      dimensions down in stages and search again, telling you the new pixel
      size if it had to. You see the achieved size before downloading, so
      the portal's checker holds no surprises.
    </p>
    <h2>Tips for documents that must stay readable</h2>
    <ul>
      <li><strong>Straighten and crop first.</strong> A document photographed flat, cropped to its edges, compresses to 200KB far more readably than a crooked shot full of desk.</li>
      <li><strong>Prefer JPG or WebP output for scans.</strong> PNG is lossless and honest, but at 200KB it usually forces much smaller dimensions; JPG keeps the page bigger and perfectly readable.</li>
      <li><strong>Read the fine print in the preview.</strong> Footnotes and ID numbers are the first casualty of over compression; if they are clear, everything is.</li>
      <li><strong>If the source is a PDF, compress the PDF.</strong> Multi page documents belong in <a href="/compress-pdf">Compress PDF</a>; single page images belong here.</li>
    </ul>
    <h2>A worked example</h2>
    <p>
      An applicant must attach a scanned degree certificate, one page, under
      200KB. The scanner produced a 4.1 MB PNG. Dropped here as JPG output,
      the tool lands it at 187KB with dimensions unchanged: the university
      seal, the signature and the small print in the border all stay sharp
      in the preview. She attaches it, the portal accepts it on the first
      try, and her certificate never passed through a third party server on
      the way.
    </p>
    <p>
      Tighter rules? The same tool is preset to <a href="/compress-image-to-50kb">50KB</a>{' '}
      and <a href="/compress-image-to-100kb">100KB</a>, or open the full{' '}
      <a href="/image-compressor">Image Compressor</a> and type any custom target.
    </p>
  </>
);

export default function CompressImageTo200kb() {
  return (
    <ImageCompressor
      slug="compress-image-to-200kb"
      path="/compress-image-to-200kb"
      title="Compress Image to 200KB: Free Online, No Upload | ToolNest"
      description="Compress images to 200KB or under free in your browser, sized for job applications and document portals. No upload, no sign-up."
      h1="Compress Image to 200KB"
      intro="Compress an image to 200KB or under, the limit job application and document portals set most often. The target is preset: drop your image in and the tool finds the settings. Nothing is uploaded."
      faqs={FAQS}
      content={CONTENT}
      initialTargetKb={200}
    />
  );
}

import React from 'react';
import PairConverter, { FORMATS } from './PairConverter.jsx';

const FAQS = [
  {
    q: 'How much smaller is WebP than JPG?',
    a: 'At the same visual quality, WebP files are typically 25 to 35 percent smaller than JPG for photos. The saving varies with content: detailed, noisy photos gain the most, while tiny thumbnails are already so small the difference barely matters.',
  },
  {
    q: 'Will my photos look worse as WebP?',
    a: 'Not at the quality used here. The conversion encodes at a high quality setting where side by side comparisons are effectively identical for photos. Zoom in on a detailed area of the preview if you want to confirm before switching a whole set.',
  },
  {
    q: 'Should I delete my JPGs after converting?',
    a: 'No. Keep the JPGs as your masters. WebP is the delivery format for your website, but JPG remains the universal format for sharing, printing and older software. Convert copies for the site and archive the originals.',
  },
];

const CONTENT = (
  <>
    <h2>How to convert JPG to WebP</h2>
    <p>
      Drop your JPG onto the box above, or click to choose one from your
      device. You will see its size and dimensions, then a single click
      produces the WebP and shows exactly how much smaller it is before you
      download. The conversion runs entirely in your browser, so photos are
      never uploaded to any server.
    </p>
    <h2>When JPG to WebP is the right move</h2>
    <p>
      JPG has served the web well for three decades, but it was designed in
      1992, and modern formats simply store photos more efficiently. WebP,
      developed by Google for the web, squeezes the same photo into a file
      roughly a quarter to a third smaller at the same visual quality. On a
      single image that saves a few hundred kilobytes. Across a blog archive,
      a product catalog or a photo gallery, it saves gigabytes of bandwidth
      and shaves real seconds off page loads.
    </p>
    <p>
      Speed is not a vanity metric. Faster pages rank better, because Google
      measures loading performance in its Core Web Vitals, and visitors stay
      longer on sites that respond quickly. Swapping JPG for WebP is one of
      the few changes that improves those numbers without touching your
      design, your content or your hosting.
    </p>
    <h2>How the conversion works</h2>
    <p>
      Your browser decodes the JPG into its full pixel grid and re-encodes it
      with the WebP codec at a high quality setting. WebP uses smarter
      prediction than JPG: instead of treating every block of the image the
      same way, it predicts blocks from surrounding detail and stores the
      corrections, which is where the extra saving comes from. JPG metadata
      such as camera settings and GPS tags does not carry across, so the WebP
      is also a cleaner file to publish.
    </p>
    <h2>Quality tips for JPG to WebP</h2>
    <ul>
      <li><strong>Start from the best JPG you have.</strong> Converting a small, heavily compressed JPG locks in its flaws at a smaller size. Use the original export from your camera or editor.</li>
      <li><strong>Do not convert twice.</strong> WebP made from a WebP gains nothing and can lose quality. Keep a clear line between JPG masters and WebP delivery copies.</li>
      <li><strong>Match dimensions to the display size.</strong> An image shown at 900 pixels wide should not be converted from a 5000 pixel original. Resize first, then convert, for the smallest honest file.</li>
      <li><strong>Spot check skin tones and gradients.</strong> Skies and faces are where compression shows first. If those look clean at full size, the rest of the photo will too.</li>
    </ul>
    <h2>A worked example</h2>
    <p>
      A food blogger publishes recipes with six photos each, averaging 900 KB
      as JPG, and her recipe pages feel sluggish on phones. She converts the
      photos here: each comes back as WebP at around 580 KB with no visible
      difference, her page weight drops by a third, and her mobile PageSpeed
      score moves from orange to green.
    </p>
    <p>
      Have graphics with transparency instead? The <a href="/png-to-webp">PNG to WebP converter</a>{' '}
      handles those, and the <a href="/image-converter">Image Converter</a> covers JPG, PNG and
      WebP in every direction.
    </p>
  </>
);

export default function JpgToWebp() {
  return (
    <PairConverter
      slug="jpg-to-webp"
      path="/jpg-to-webp"
      title="JPG to WebP Converter: Free Online, No Upload | ToolNest"
      description="Convert JPG to WebP free in your browser. Smaller photos for faster websites, no upload, no sign-up, instant download."
      h1="JPG to WebP Converter"
      intro="Convert JPG photos to WebP for smaller files and faster pages, with quality preserved. It runs in your browser, so your photos stay on your device."
      faqs={FAQS}
      content={CONTENT}
      from={FORMATS.jpg}
      to={FORMATS.webp}
    />
  );
}

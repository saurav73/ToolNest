import React from 'react';
import PairConverter, { FORMATS } from './PairConverter.jsx';

const FAQS = [
  {
    q: 'How much smaller will my WebP be than the PNG?',
    a: 'For photos and detailed graphics, WebP is commonly 25 to 35 percent smaller than a comparable PNG, and the gap can be larger on photographic content. Simple flat graphics with few colors are already tiny as PNG, so the saving there is smaller.',
  },
  {
    q: 'Does WebP keep transparency?',
    a: 'Yes. WebP supports a full alpha channel, so transparent backgrounds in your PNG stay transparent in the WebP. That is the main reason it replaced PNG on so many websites.',
  },
  {
    q: 'Can everyone open a WebP file?',
    a: 'Every modern browser displays WebP, so it is safe for websites and web apps. Some older desktop programs and print tools still cannot open it, so keep the PNG master for anything headed to print or legacy software.',
  },
];

const CONTENT = (
  <>
    <h2>How to convert PNG to WebP</h2>
    <p>
      Drop your PNG onto the box above, or click to select one. The tool shows
      the original size and dimensions, converts on your click, and shows the
      WebP size so you can see the saving before you download. Your image is
      decoded and re-encoded inside your browser tab, never uploaded.
    </p>
    <h2>When PNG to WebP is the right move</h2>
    <p>
      PNG is a heavy format for the web. It was designed for lossless storage,
      not for fast pages, and a hero image or product gallery saved as PNG can
      quietly add megabytes to a page. WebP was built by Google specifically
      to replace PNG and JPG on websites: it compresses the same image into a
      noticeably smaller file while keeping the alpha channel that made PNG
      indispensable for logos, overlays and product shots.
    </p>
    <p>
      The practical effect is speed. Smaller images mean faster loading pages,
      better Core Web Vitals scores, less bandwidth for your visitors, and
      lower storage and CDN bills for you. For a site with many images, the
      conversion from PNG to WebP is one of the cheapest performance wins
      available, and it changes nothing about how the page looks.
    </p>
    <h2>How the conversion works</h2>
    <p>
      Your browser decodes the PNG into its full pixel grid, transparency
      included, then encodes that grid using the WebP format at high quality.
      WebP uses predictive compression: it guesses each pixel from its
      neighbors and stores only the difference, which is far more efficient
      than PNG methods on photographic content. Metadata from the PNG does
      not carry across, trimming a little extra weight from the file.
    </p>
    <h2>Quality tips for PNG to WebP</h2>
    <ul>
      <li><strong>Keep your PNG masters.</strong> WebP is for delivery, PNG is for the archive. If you ever need the image in print software or an older editor, the PNG is the one that will open.</li>
      <li><strong>Compare at full size.</strong> Check the converted file at 100 percent zoom on text and edges. At the quality used here it should match the PNG, and checking once builds trust for the whole set.</li>
      <li><strong>Convert the whole set, not one image.</strong> Mixed formats on a page look the same but load unevenly. Converting every PNG on the page gives the full speed benefit.</li>
      <li><strong>Resize before converting.</strong> A 4000 pixel wide PNG shown at 800 pixels wastes more bytes than any format choice can save. Shrink dimensions first with the Image Resizer, then convert.</li>
    </ul>
    <h2>A worked example</h2>
    <p>
      A portfolio site loads twelve project screenshots as PNGs totaling 18
      MB, and mobile visitors wait seconds for the gallery. The owner converts
      each screenshot here: the set comes back as WebP totaling just under 5
      MB, visually identical, transparency and all. The gallery now appears
      almost instantly, and her PageSpeed score climbs out of the red.
    </p>
    <p>
      Working with photos instead? The <a href="/jpg-to-webp">JPG to WebP converter</a> does
      the same job for JPG files, and the <a href="/image-converter">Image Converter</a>{' '}
      covers every direction.
    </p>
  </>
);

export default function PngToWebp() {
  return (
    <PairConverter
      slug="png-to-webp"
      path="/png-to-webp"
      title="PNG to WebP Converter: Free Online, No Upload | ToolNest"
      description="Convert PNG to WebP free in your browser. Files a third smaller with transparency kept, no upload, instant download."
      h1="PNG to WebP Converter"
      intro="Convert PNG images to WebP and cut file size by a third or more, transparency included. Everything runs in your browser, nothing is uploaded."
      faqs={FAQS}
      content={CONTENT}
      from={FORMATS.png}
      to={FORMATS.webp}
    />
  );
}

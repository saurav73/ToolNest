import React from 'react';
import PairConverter, { FORMATS } from './PairConverter.jsx';

const FAQS = [
  {
    q: 'Does converting PNG to JPG reduce quality?',
    a: 'Slightly, by design. JPG uses lossy compression, so a tiny amount of detail is traded for a much smaller file. At the default 92 percent quality, which you can adjust with the slider, photos and most graphics show no visible difference. Text and sharp line art can soften a little, so keep the PNG master for anything you will edit again.',
  },
  {
    q: 'What happens to transparent parts of my PNG?',
    a: 'JPG has no transparency, so see through areas are placed on a solid white background during conversion. If your design needs the transparency, convert to WebP instead, which keeps it.',
  },
  {
    q: 'Is my image uploaded to a server?',
    a: 'No. The conversion happens entirely in your browser using its built in image tools. Your file never leaves your device, and nothing is stored anywhere.',
  },
];

const CONTENT = (
  <>
    <h2>How to convert PNG to JPG</h2>
    <p>
      Drop your PNG onto the box above, or click to choose one from your device.
      The tool shows the original size and dimensions, then converts on your
      click and shows the new JPG size before you download. There is no queue,
      no account and no watermark. If you convert photos often, the whole job
      takes a few seconds per image.
    </p>
    <h2>When PNG to JPG is the right move</h2>
    <p>
      PNG is a wonderful working format and a heavy sharing format. A photo
      saved as PNG routinely weighs five to ten times more than the same photo
      as JPG, because PNG stores every pixel exactly while JPG throws away
      detail your eyes cannot see. That weight matters in everyday places:
      email attachments bounce at size limits, contact forms reject large
      uploads, marketplaces and job portals often accept JPG only, and a page
      full of PNG photos loads slowly for visitors on mobile data.
    </p>
    <p>
      Converting to JPG is also the safe choice when the other side uses older
      software. Government forms, school portals, printers and office tools
      that choke on newer formats all read JPG without complaint. If a file
      has to work everywhere, for everyone, with no surprises, JPG is still
      the universal answer.
    </p>
    <h2>How the conversion works</h2>
    <p>
      Your browser decodes the PNG into a grid of pixels, paints that grid onto
      a canvas, and encodes it again using the JPG rules. Two things happen in
      that re-encode. First, lossy compression groups similar colors together,
      which is where the big size saving comes from. Second, because JPG cannot
      store transparency, any see through areas are set onto a white
      background. Metadata from the original, such as camera settings and
      location tags, does not carry across, which many people count as a
      privacy bonus when sharing photos publicly.
    </p>
    <h2>Quality tips for PNG to JPG</h2>
    <ul>
      <li><strong>Always convert from the original PNG.</strong> Converting a JPG that was already made from a PNG cannot bring detail back; it only adds another round of loss.</li>
      <li><strong>Check graphics with text closely.</strong> Photos survive JPG beautifully, but screenshots with small text or thin lines can look softer. Zoom in on the preview before you rely on it.</li>
      <li><strong>Keep a PNG master of logos and artwork.</strong> Convert copies for sharing, and keep the lossless original for future edits.</li>
      <li><strong>Mind the white background.</strong> If a transparent logo will sit on a dark page, the white box from a JPG will show. Use WebP for that job instead.</li>
    </ul>
    <h2>A worked example</h2>
    <p>
      A blogger exports a featured image from a design tool as a 2400 by 1260
      PNG weighing 2.8 MB. Her blog platform accepts it, but the page loads
      slowly and her host warns about storage. She converts the image here:
      the JPG comes out at 310 KB, visually identical on screen, and the post
      loads in a fraction of the time. She keeps the PNG in her project folder
      as the master and publishes only the JPG.
    </p>
    <p>
      Need the opposite direction later? The <a href="/jpg-to-png">JPG to PNG converter</a>{' '}
      turns JPGs back into lossless PNGs, and the full{' '}
      <a href="/image-converter">Image Converter</a> covers every direction in one place.
    </p>
  </>
);

export default function PngToJpg() {
  return (
    <PairConverter
      slug="png-to-jpg"
      path="/png-to-jpg"
      title="PNG to JPG Converter: Free Online, No Upload | ToolNest"
      description="Convert PNG to JPG free in your browser. Smaller files that work everywhere, no upload, no sign-up, instant download."
      h1="PNG to JPG Converter"
      intro="Turn PNG images into JPG files that are smaller and accepted everywhere. The conversion runs in your browser, so your image is never uploaded."
      faqs={FAQS}
      content={CONTENT}
      from={FORMATS.png}
      to={FORMATS.jpg}
    />
  );
}

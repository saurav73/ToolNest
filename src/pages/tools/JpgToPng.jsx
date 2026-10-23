import React from 'react';
import PairConverter, { FORMATS } from './PairConverter.jsx';

const FAQS = [
  {
    q: 'Does converting JPG to PNG improve quality?',
    a: 'No. PNG stores pixels losslessly, but it cannot restore detail the JPG already threw away. The PNG will look identical to the JPG, just stored without further loss. The real benefit is that re-saving the PNG never degrades it again, unlike saving a JPG over and over.',
  },
  {
    q: 'Why is the PNG so much bigger than the JPG?',
    a: 'JPG achieves small files by discarding detail; PNG keeps everything. A photo converted to PNG is commonly five to ten times larger. That is expected, and it is the price of a lossless master file.',
  },
  {
    q: 'Can I get transparency back by converting to PNG?',
    a: 'No. If the JPG has a solid background, converting to PNG keeps that background as ordinary pixels. PNG supports transparency for new edits, so you can remove the background in an editor afterward, but the converter cannot recreate what was never saved.',
  },
];

const CONTENT = (
  <>
    <h2>How to convert JPG to PNG</h2>
    <p>
      Drop your JPG onto the box above, or click to choose one. You will see
      the original size and dimensions, then one click produces the PNG and
      shows its new size before you download. The work happens on your device,
      so even large photos convert in a moment and nothing is uploaded.
    </p>
    <h2>When JPG to PNG is the right move</h2>
    <p>
      JPG is built for finished photos, not for files you keep working on.
      Every time a JPG is edited and saved, it loses a little more quality, a
      slow drip of damage editors call generation loss. Converting to PNG stops
      that drip: PNG saves losslessly, so the tenth edit looks exactly like
      the first. That makes PNG the right container for screenshots you will
      annotate, graphics you will resize repeatedly, and images headed into
      design tools, presentation software or print layouts.
    </p>
    <p>
      PNG is also the safer hand-off format between programs. Some editors,
      OCR tools and upload pipelines quietly re-compress JPGs on import,
      softening text and edges. Sending a PNG master avoids that quiet damage
      and keeps sharp edges on logos, diagrams and interface captures exactly
      as you made them.
    </p>
    <h2>How the conversion works</h2>
    <p>
      Your browser decodes the JPG into a grid of pixels, exactly as it
      currently looks, and writes those pixels into a PNG file. Nothing is
      sharpened, enlarged or repaired in the process: the PNG is a perfect
      copy of the JPG as it stands, stored in a format that will not degrade
      it further. Camera metadata from the original does not carry across,
      so the PNG starts with a clean slate.
    </p>
    <h2>Quality tips for JPG to PNG</h2>
    <ul>
      <li><strong>Convert early in your workflow.</strong> The sooner a working file becomes PNG, the fewer lossy saves it suffers. Make the PNG your editing master and export JPG copies only at the end.</li>
      <li><strong>Do not expect miracles on soft photos.</strong> A blurry or heavily compressed JPG stays that way as a PNG. Convert the best JPG version you have.</li>
      <li><strong>Watch the file size for sharing.</strong> PNG photos are big. If the converted file is only passing through email or a form, the original JPG is usually the better attachment.</li>
      <li><strong>Use PNG where edges matter.</strong> Text, line art and screenshots gain the most from PNG storage, because JPG artifacts show up first around sharp contrasts.</li>
    </ul>
    <h2>A worked example</h2>
    <p>
      A support agent screenshots an error message and saves it as a 180 KB
      JPG. She needs to circle the error in an editor, add arrows, and export
      it three times for a help article. Working from the JPG, each save would
      soften the small text further. She converts it to PNG here (about 950 KB),
      does all her editing on the PNG, and the published image stays crisp
      through every export.
    </p>
    <p>
      Going the other way? The <a href="/png-to-jpg">PNG to JPG converter</a> shrinks PNGs
      back down for sharing, and the <a href="/image-converter">Image Converter</a> handles
      WebP as well.
    </p>
  </>
);

export default function JpgToPng() {
  return (
    <PairConverter
      slug="jpg-to-png"
      path="/jpg-to-png"
      title="JPG to PNG Converter: Free Online, No Upload | ToolNest"
      description="Convert JPG to PNG free in your browser. Lossless PNG for editing and graphics, no upload, no sign-up, instant download."
      h1="JPG to PNG Converter"
      intro="Convert JPG photos into lossless PNG files that survive editing without losing quality. Everything runs in your browser, nothing is uploaded."
      faqs={FAQS}
      content={CONTENT}
      from={FORMATS.jpg}
      to={FORMATS.png}
    />
  );
}

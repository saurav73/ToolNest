import React, { useEffect, useRef, useState } from 'react';
import ToolLayout from '../../components/ToolLayout.jsx';
import FileDrop from '../../components/FileDrop.jsx';
import { downloadBlob, loadImageFromFile } from '../../lib/files.js';

const FAQS = [
  {
    q: 'What can a QR code contain?',
    a: 'Any short text: a website link, WiFi network name and password in the standard format, contact details, a payment address, or a plain message. Phones read the code with the camera and act on the content, opening links in the browser or offering to join a network.',
  },
  {
    q: 'Can a QR code have a logo in the middle?',
    a: 'Yes. QR codes carry error correction data, spare information woven into the pattern so the code still reads when part of it is hidden. When you add a center image here, the generator switches automatically to the highest error correction level (H), keeps the image small (about a quarter of the code) and clears the modules behind it, so phones can still scan the code reliably. Always test a logo code with your phone before printing it.',
  },
  {
    q: 'Do QR codes expire?',
    a: 'A static QR code like the ones generated here never expires. The pattern itself holds the data, with no server in between, so a printed code keeps working for as long as it stays scannable. Only dynamic codes, which point through a tracking service, can be switched off.',
  },
  {
    q: 'What size should I print a QR code?',
    a: 'Print at least 2 cm (about 0.8 inches) square for close-range scanning, and bigger for posters or signs. Download the 1024 or 2048 pixel PNG for print so edges stay sharp. Always test your printed code with a phone before producing many copies.',
  },
  {
    q: 'Is my link or text uploaded anywhere?',
    a: 'No. The QR code is drawn on your device. The text you enter and any logo you add never leave your browser.',
  },
];

const CONTENT = (
  <>
    <h2>Create a QR code in seconds</h2>
    <p>
      Paste a link or type any text, pick a style, and download your QR code as a
      PNG or SVG. Alongside the classic black on white code you can use solid
      colors, gradients (including an Instagram gradient), rounded or dotted
      modules, shaped corner eyes, and a center image: upload your own logo or
      pick one of the built in pictures. QR codes bridge print and the web:
      menus, posters, business cards, product packaging and event signs all use
      them to send people to a page with one camera point. There are no
      watermarks, no sign-up and no download limits.
    </p>
    <h2>Tips for QR codes that scan every time</h2>
    <ul>
      <li>Keep the content short. Shorter text makes a simpler pattern that scans faster and at smaller sizes.</li>
      <li>Leave a quiet zone. The white border around the code is part of the standard, so do not crop it away.</li>
      <li>Mind the contrast. Dark modules on a light background scan best. The classic style uses black on white, and this tool warns you if you pick colors with weak contrast.</li>
      <li>Test before you print, on more than one phone if you can.</li>
    </ul>
    <h2>How a QR code works under the hood</h2>
    <p>
      A QR code stores your text as a pattern of dark and light squares called
      modules. Your text is first converted into a compact binary form, split
      into blocks, and then extra error correction data is calculated and woven
      in. That extra data is why a code still scans when part of it is dirty,
      folded or covered by a small logo. The three large squares in the corners
      tell the phone camera where the code is and which way up it sits, even at
      an angle or upside down. Smaller alignment squares help correct for
      curved surfaces and perspective. For plain codes this generator uses
      error correction level M, which restores about 15 percent of the data.
      When you add a center image it switches automatically to level H, which
      can rebuild roughly 30 percent, so the code keeps scanning with a picture
      in the middle.
    </p>
    <h2>Practical tips for real world use</h2>
    <ul>
      <li><strong>Shorten long links first:</strong> a short web address needs fewer modules, so the squares stay large and the code scans from farther away. Use a clean redirect on your own site if you can.</li>
      <li><strong>Size for distance:</strong> a useful rule is that the code should be about one tenth of the scanning distance. A poster read from two meters needs a code at least 20 centimeters wide.</li>
      <li><strong>Pick the right download size:</strong> 512 pixels is plenty for screens and small labels, 1024 suits documents and packaging, and 2048 is the safe choice for large print where edges must stay sharp. SVG is vector, so it scales to any size for design work.</li>
      <li><strong>Think about surface and light:</strong> glossy lamination, curved bottles and low light all make scanning harder. Use matte finishes and place codes where people can hold a phone steady in front of them.</li>
      <li><strong>Add a short instruction:</strong> a line such as Scan to see the menu tells people what they get. Codes with a clear promise get scanned far more often.</li>
    </ul>
    <h2>A worked example</h2>
    <p>
      Say you run a small cafe and want a code on each table that opens your
      menu page. You paste the menu link, which is 38 characters long, and
      download the 1024 pixel PNG. Printed at 5 centimeters square on a matte
      table card, it scans instantly from a seated position, because the pattern
      is simple and the modules are large. Compare that with encoding a full
      contact card with name, phone, email and address, which runs to several
      hundred characters. The pattern becomes dense, the printed size needs to
      grow to stay reliable, and scanning takes a moment longer. For the table
      card the short link wins. The detailed contact code belongs on your
      business card, where the phone is held close and size matters less.
    </p>
    <h2>Common mistakes to avoid</h2>
    <ul>
      <li><strong>Encoding the wrong link:</strong> a code cannot be edited after printing. Open the destination yourself, copy the address from the browser bar, and scan the finished code before the print run.</li>
      <li><strong>Reversing the colors:</strong> light squares on a dark background confuse many scanners. Keep dark modules on a light background, as the contrast warning above the preview will remind you.</li>
      <li><strong>Placing codes out of reach:</strong> a code on a billboard or the back of a moving vehicle cannot be scanned, however sharp it is. Put codes where people can stand still within arm reach or a short distance.</li>
      <li><strong>Stretching the image:</strong> resizing a square code into a rectangle in a design program distorts the modules and breaks scanning. Always scale it evenly from a corner.</li>
      <li><strong>Sending people to a page that fails on phones:</strong> test the landing page on mobile data. A perfect code that opens a slow or broken page wastes the scan entirely.</li>
    </ul>
  </>
);

/* ---------- preset center images: original flat SVG illustrations ---------- */

const SVG_BACKING = '<rect x="5" y="5" width="110" height="110" rx="24" fill="#ffffff" stroke="#e3e7ef" stroke-width="2"/>';

const PRESET_ART = [
  {
    id: 'lion',
    name: 'Lion',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">${SVG_BACKING}`
      + '<circle cx="38" cy="36" r="9" fill="#e07b00"/><circle cx="82" cy="36" r="9" fill="#e07b00"/>'
      + '<circle cx="38" cy="36" r="4.5" fill="#ffd23e"/><circle cx="82" cy="36" r="4.5" fill="#ffd23e"/>'
      + '<circle cx="60" cy="62" r="41" fill="#e07b00"/><circle cx="60" cy="62" r="33" fill="#f59e0b"/>'
      + '<circle cx="60" cy="64" r="25" fill="#ffcf4d"/>'
      + '<circle cx="51" cy="60" r="3.4" fill="#33302e"/><circle cx="69" cy="60" r="3.4" fill="#33302e"/>'
      + '<ellipse cx="60" cy="73" rx="11.5" ry="8.5" fill="#fff3d6"/>'
      + '<polygon points="54,68 66,68 60,75" fill="#a34d28"/>'
      + '<path d="M60 75 v3.5 M60 78.5 q-4.5 4.5 -9 1 M60 78.5 q4.5 4.5 9 1" stroke="#7c4a1e" stroke-width="2.2" fill="none" stroke-linecap="round"/>'
      + '<circle cx="42" cy="70" r="1.4" fill="#d97706"/><circle cx="46" cy="74" r="1.4" fill="#d97706"/><circle cx="78" cy="70" r="1.4" fill="#d97706"/><circle cx="74" cy="74" r="1.4" fill="#d97706"/>'
      + '</svg>',
  },
  {
    id: 'heart',
    name: 'Heart',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">${SVG_BACKING}`
      + '<path d="M60 101 C30 79 21 59 21 44.5 C21 30.5 31.5 21.5 44 21.5 C52.5 21.5 58 26.5 60 33.5 C62 26.5 67.5 21.5 76 21.5 C88.5 21.5 99 30.5 99 44.5 C99 59 90 79 60 101 Z" fill="#e5322d"/>'
      + '<ellipse cx="41" cy="42" rx="8" ry="5.5" fill="#ffffff" opacity="0.35" transform="rotate(-24 41 42)"/>'
      + '</svg>',
  },
  {
    id: 'star',
    name: 'Star',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">${SVG_BACKING}`
      + '<polygon points="60,26 68.5,49.5 93.5,50 74,65.8 80.5,90 60,76 39.5,90 46,65.8 26.5,50 51.5,49.5" fill="#f5b301" stroke="#dd8f00" stroke-width="2.5" stroke-linejoin="round"/>'
      + '</svg>',
  },
  {
    id: 'smiley',
    name: 'Smiley',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">${SVG_BACKING}`
      + '<circle cx="60" cy="60" r="37" fill="#ffd93b" stroke="#eab308" stroke-width="2.5"/>'
      + '<circle cx="46.5" cy="52" r="4.6" fill="#33302e"/><circle cx="73.5" cy="52" r="4.6" fill="#33302e"/>'
      + '<path d="M41.5 68 Q60 85.5 78.5 68" stroke="#33302e" stroke-width="4.5" fill="none" stroke-linecap="round"/>'
      + '<circle cx="39" cy="64" r="5.5" fill="#ffb020" opacity="0.55"/><circle cx="81" cy="64" r="5.5" fill="#ffb020" opacity="0.55"/>'
      + '</svg>',
  },
  {
    id: 'camera',
    name: 'Camera',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">${SVG_BACKING}`
      + '<rect x="47" y="33" width="26" height="13" rx="5" fill="#374151"/>'
      + '<rect x="24" y="42" width="72" height="52" rx="13" fill="#374151"/>'
      + '<circle cx="60" cy="68" r="16" fill="#1f2937" stroke="#f9fafb" stroke-width="4.5"/>'
      + '<circle cx="60" cy="68" r="6" fill="#9ca3af"/>'
      + '<circle cx="85" cy="53" r="3.6" fill="#f9fafb"/>'
      + '</svg>',
  },
];

const presetUrl = (art) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(art.svg);

/* ---------- themes and gradients ---------- */

const THEMES = [
  { id: 'classic', name: 'Classic', fg: '#000000', bg: '#ffffff', gradient: null, dots: 'square', cornerSq: 'square', cornerDot: 'square' },
  { id: 'instagram', name: 'Instagram', fg: '#d300c5', bg: '#ffffff', gradient: 'instagram', dots: 'rounded', cornerSq: 'extra-rounded', cornerDot: 'dot' },
  { id: 'ocean', name: 'Ocean Blue', fg: '#0b5fa5', bg: '#eaf6ff', gradient: null, dots: 'rounded', cornerSq: 'extra-rounded', cornerDot: 'dot' },
  { id: 'forest', name: 'Forest Green', fg: '#177245', bg: '#edf9f0', gradient: null, dots: 'rounded', cornerSq: 'extra-rounded', cornerDot: 'dot' },
  { id: 'sunset', name: 'Sunset Orange', fg: '#dd5e08', bg: '#fff3e4', gradient: null, dots: 'dots', cornerSq: 'dot', cornerDot: 'dot' },
  { id: 'royal', name: 'Royal Purple', fg: '#5b21b6', bg: '#f1ebff', gradient: null, dots: 'rounded', cornerSq: 'extra-rounded', cornerDot: 'dot' },
  { id: 'crimson', name: 'Crimson', fg: '#b91c1c', bg: '#fff1f1', gradient: null, dots: 'square', cornerSq: 'square', cornerDot: 'square' },
];

const GRADIENTS = {
  instagram: { name: 'Instagram', stops: ['#7638fa', '#d300c5', '#ff0069', '#ff7a00'] },
  ocean: { name: 'Deep Ocean', stops: ['#38bdf8', '#2563eb', '#1e3a8a'] },
  sunset: { name: 'Warm Sunset', stops: ['#f59e0b', '#f97316', '#ef4444'] },
  berry: { name: 'Berry Violet', stops: ['#7c3aed', '#c026d3', '#db2777'] },
};

const PREVIEW_SIZE = 280;

function luminance(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255; const g = (n >> 8) & 255; const b = n & 255;
  const f = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export default function QrGenerator() {
  const [text, setText] = useState('');
  const [fg, setFg] = useState('#000000');
  const [bg, setBg] = useState('#ffffff');
  const [gradientId, setGradientId] = useState('');
  const [dotsType, setDotsType] = useState('square');
  const [cornerSqType, setCornerSqType] = useState('square');
  const [cornerDotType, setCornerDotType] = useState('square');
  const [center, setCenter] = useState({ kind: 'none' });
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  const containerRef = useRef(null);
  const qrRef = useRef(null);
  const libRef = useRef(null);

  const gradient = gradientId ? GRADIENTS[gradientId] : null;
  const moduleLum = gradient
    ? Math.min(...gradient.stops.map(luminance))
    : luminance(fg);
  const bgLum = luminance(bg);
  const contrast = (Math.max(moduleLum, bgLum) + 0.05) / (Math.min(moduleLum, bgLum) + 0.05);
  const darkBackground = bgLum < moduleLum;
  const lowContrast = !darkBackground && contrast < 2.2;

  const centerImageUrl = center.kind === 'preset'
    ? presetUrl(PRESET_ART.find((a) => a.id === center.id))
    : center.kind === 'upload' ? center.dataUrl : undefined;

  const buildOptions = (size) => {
    const cornerColor = gradient ? gradient.stops[0] : fg;
    return {
      width: size,
      height: size,
      type: 'canvas',
      data: text,
      margin: Math.max(8, Math.round(size * 0.045)),
      qrOptions: { errorCorrectionLevel: center.kind === 'none' ? 'M' : 'H' },
      dotsOptions: gradient
        ? {
          type: dotsType,
          gradient: {
            type: 'linear',
            rotation: Math.PI / 4,
            colorStops: gradient.stops.map((c, i) => ({ offset: i / (gradient.stops.length - 1), color: c })),
          },
        }
        : { type: dotsType, color: fg },
      backgroundOptions: { color: bg },
      cornersSquareOptions: { type: cornerSqType, color: cornerColor },
      cornersDotOptions: { type: cornerDotType, color: cornerColor },
      image: centerImageUrl,
      imageOptions: {
        crossOrigin: 'anonymous',
        hideBackgroundDots: true,
        imageSize: 0.22,
        margin: Math.max(3, Math.round(size * 0.014)),
      },
    };
  };

  /* live preview: actual generated code via qr-code-styling */
  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (!container) return undefined;
    if (!text.trim()) {
      container.innerHTML = '';
      qrRef.current = null;
      setError('');
      return undefined;
    }
    (async () => {
      try {
        if (!libRef.current) {
          const mod = await import('qr-code-styling');
          libRef.current = mod.default || mod;
        }
        if (cancelled) return;
        if (!qrRef.current) {
          qrRef.current = new libRef.current(buildOptions(PREVIEW_SIZE));
          container.innerHTML = '';
          qrRef.current.append(container);
        } else {
          await qrRef.current.update(buildOptions(PREVIEW_SIZE));
        }
        if (!cancelled) setError('');
      } catch (e) {
        if (!cancelled) setError('That text is too long to fit in a QR code. Try shortening it.');
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, fg, bg, gradientId, dotsType, cornerSqType, cornerDotType, center]);

  const onLogoFiles = async (files) => {
    const f = files[0];
    try {
      const { img } = await loadImageFromFile(f);
      const S = 720; const pad = 64; const box = S - pad * 2;
      const canvas = document.createElement('canvas');
      canvas.width = S; canvas.height = S;
      const ctx = canvas.getContext('2d');
      const r = 110;
      ctx.beginPath();
      ctx.roundRect(4, 4, S - 8, S - 8, r);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#e3e7ef';
      ctx.lineWidth = 4;
      ctx.stroke();
      const scale = Math.min(box / img.naturalWidth, box / img.naturalHeight);
      const w = img.naturalWidth * scale; const h = img.naturalHeight * scale;
      ctx.drawImage(img, (S - w) / 2, (S - h) / 2, w, h);
      setCenter({ kind: 'upload', dataUrl: canvas.toDataURL('image/png') });
      setError('');
    } catch (e) {
      setError('That image could not be loaded. Try a PNG or JPG logo.');
    }
  };

  const downloadAs = async (ext, size) => {
    if (!text.trim() || downloading) return;
    setDownloading(true);
    try {
      if (!libRef.current) {
        const mod = await import('qr-code-styling');
        libRef.current = mod.default || mod;
      }
      const holder = document.createElement('div');
      holder.style.position = 'absolute';
      holder.style.left = '-9999px';
      holder.style.top = '0';
      document.body.appendChild(holder);
      const tmp = new libRef.current({ ...buildOptions(size), type: ext === 'svg' ? 'svg' : 'canvas' });
      tmp.append(holder);
      await tmp.update({ ...buildOptions(size), type: ext === 'svg' ? 'svg' : 'canvas' });
      const blob = await tmp.getRawData(ext);
      holder.remove();
      if (blob) downloadBlob(blob, ext === 'svg' ? 'qrcode.svg' : `qrcode-${size}.png`);
    } catch (e) {
      setError('The download could not be created. Try a smaller size or shorter text.');
    }
    setDownloading(false);
  };

  return (
    <ToolLayout
      slug="qr-code-generator"
      path="/qr-code-generator"
      title="QR Code Generator Free: No Expiration, With Logo | ToolNest"
      description="Make free QR codes that never expire. Add colors, gradients and a logo, download PNG or SVG. No sign-up, no watermark, private."
      h1="QR Code Generator"
      intro="Turn any link or text into a QR code, style it with colors, gradients, shapes and a center logo, and download it as PNG or SVG. The codes never expire, because your data is encoded directly into the pattern rather than stored on a server, and there is no watermark and no sign-up."
      faqs={FAQS}
      content={CONTENT}
    >
      <div className="field">
        <label htmlFor="qr-input">Link or text for your QR code</label>
        <input
          id="qr-input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. https://your-website.com or any text"
          autoFocus
        />
      </div>

      <div className="qr-stage">
        <div className="qr-canvas" ref={containerRef} aria-label="QR code preview" />
        {!text.trim() && !error && <p className="hint">Your QR code preview will appear here as soon as you type something. Try a style below to see it change live.</p>}
      </div>

      {error && <div className="message err">{error}</div>}
      {darkBackground && (
        <div className="message warn">Your background is darker than the code modules. Most scanners need dark modules on a light background, so this code may not scan. Swap the two colors or pick a lighter background.</div>
      )}
      {!darkBackground && lowContrast && (
        <div className="message warn">These colors have weak contrast, which makes scanning unreliable, especially in low light or small prints. Choose a darker module color or a lighter background.</div>
      )}

      <h2 className="tool-subhead">Style</h2>
      <div className="preset-row" role="group" aria-label="Style presets">
        {THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            className="preset-chip"
            onClick={() => {
              setFg(t.fg); setBg(t.bg); setGradientId(t.gradient || '');
              setDotsType(t.dots); setCornerSqType(t.cornerSq); setCornerDotType(t.cornerDot);
            }}
          >
            <span
              className="chip-swatch"
              style={{ background: t.gradient ? `linear-gradient(45deg, ${GRADIENTS[t.gradient].stops.join(', ')})` : t.fg }}
            />
            {t.name}
          </button>
        ))}
      </div>

      <div className="color-grid">
        <div className="field">
          <label htmlFor="qr-fg">Code color</label>
          <input id="qr-fg" type="color" value={fg} disabled={!!gradient} onChange={(e) => setFg(e.target.value)} />
          {gradient && <span className="hint">Gradient fill is on, so the single code color is not used.</span>}
        </div>
        <div className="field">
          <label htmlFor="qr-bg">Background color</label>
          <input id="qr-bg" type="color" value={bg} onChange={(e) => setBg(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="qr-gradient">Fill</label>
          <select id="qr-gradient" value={gradientId} onChange={(e) => setGradientId(e.target.value)}>
            <option value="">Solid color</option>
            {Object.entries(GRADIENTS).map(([id, g]) => <option key={id} value={id}>{g.name} gradient</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="qr-dots">Module shape</label>
          <select id="qr-dots" value={dotsType} onChange={(e) => setDotsType(e.target.value)}>
            <option value="square">Squares</option>
            <option value="rounded">Rounded</option>
            <option value="dots">Dots (circles)</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="qr-corner-sq">Corner eyes</label>
          <select id="qr-corner-sq" value={cornerSqType} onChange={(e) => setCornerSqType(e.target.value)}>
            <option value="square">Square</option>
            <option value="extra-rounded">Rounded</option>
            <option value="dot">Circle</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="qr-corner-dot">Corner centers</label>
          <select id="qr-corner-dot" value={cornerDotType} onChange={(e) => setCornerDotType(e.target.value)}>
            <option value="square">Square</option>
            <option value="dot">Circle</option>
          </select>
        </div>
      </div>

      <h2 className="tool-subhead">Center image</h2>
      <p className="hint">
        A center image uses the highest error correction (level H) automatically, so the code still scans.
        Keep it modest: the image covers about a quarter of the code.
      </p>
      <div className="preset-row" role="group" aria-label="Center image choices">
        <button type="button" className={`preset-chip${center.kind === 'none' ? ' active' : ''}`} onClick={() => setCenter({ kind: 'none' })}>None</button>
        {PRESET_ART.map((a) => (
          <button
            key={a.id}
            type="button"
            className={`preset-chip${center.kind === 'preset' && center.id === a.id ? ' active' : ''}`}
            onClick={() => setCenter({ kind: 'preset', id: a.id })}
          >
            <img className="chip-art" src={presetUrl(a)} alt="" aria-hidden="true" />
            {a.name}
          </button>
        ))}
        <button type="button" className={`preset-chip${center.kind === 'upload' ? ' active' : ''}`} onClick={() => document.getElementById('qr-logo-drop')?.scrollIntoView({ block: 'nearest' })}>
          Your logo
        </button>
      </div>
      <div id="qr-logo-drop">
        <FileDrop accept="image/png,image/jpeg,image/webp,image/svg+xml" onFiles={onLogoFiles} label="Drop your logo here, or click to upload one" />
      </div>

      <h2 className="tool-subhead">Download</h2>
      <div className="btn-row">
        {[512, 1024, 2048].map((s) => (
          <button key={s} type="button" className="btn" disabled={!text.trim() || downloading} onClick={() => downloadAs('png', s)}>
            PNG {s}px
          </button>
        ))}
        <button type="button" className="btn" disabled={!text.trim() || downloading} onClick={() => downloadAs('svg', 1024)}>
          SVG
        </button>
      </div>
      {!text.trim() && <p className="hint">Type your link or text above to enable downloads.</p>}
    </ToolLayout>
  );
}

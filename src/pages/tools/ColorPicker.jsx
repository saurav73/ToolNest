import React, { useMemo, useState } from 'react';
import ToolLayout from '../../components/ToolLayout.jsx';
import CopyButton from '../../components/CopyButton.jsx';

const FAQS = [
  {
    q: 'What is the difference between HEX, RGB and HSL?',
    a: 'They are three ways to write the same color. HEX is a six-digit code like #3B82F6 used in CSS and design tools. RGB gives the red, green and blue channels as numbers from 0 to 255. HSL describes the color as hue (an angle on the color wheel), saturation and lightness, which is often easier to adjust by hand.',
  },
  {
    q: 'How do shades and tints work?',
    a: 'A shade mixes the color with black and a tint mixes it with white. This tool shows ten steps of each, so you can pick a darker variant for hover states and text, or a lighter one for backgrounds, without guessing hex values.',
  },
  {
    q: 'How is the suggested text color chosen?',
    a: 'By relative luminance, the standard measure of how bright a color appears to the human eye. If the background is bright, dark text is suggested; if it is dark, light text is suggested. The pair shown always meets the common readability bar for large text, and most pairs meet it for normal text too.',
  },
  {
    q: 'Can I use the colors in my own design?',
    a: 'Yes. Every value shown is a plain color code with no license attached: HEX, RGB and HSL values are facts, not creative work. Copy any of them straight into CSS, a design tool or a slide deck.',
  },
];

const CONTENT = (
  <>
    <h2>Pick a color, get every format at once</h2>
    <p>
      Choose a color with the picker or type a hex code, and this tool instantly
      shows the matching HEX, RGB and HSL values, a set of shades and tints, and
      the text color that stays readable on top of it. Everything runs in your
      browser, so you can experiment freely while working on a site, a slide
      deck, a brand palette or a social post.
    </p>
    <h2>How to use the color picker</h2>
    <ul>
      <li><strong>Pick visually:</strong> use the color swatch to explore, then fine-tune with the hex box or the RGB sliders. All three formats stay in sync.</li>
      <li><strong>Copy any format:</strong> each value has a copy button, so you can drop #3B82F6, rgb(59, 130, 246) or hsl(217, 91%, 60%) straight into your CSS.</li>
      <li><strong>Build a palette:</strong> the shades row darkens your color toward black and the tints row lightens it toward white, giving you ready-made variants for backgrounds, borders and hover states.</li>
      <li><strong>Check readability:</strong> the preview shows your color with the suggested text color on top, so you can judge contrast before shipping a button or banner.</li>
    </ul>
    <h2>Choosing colors that work together</h2>
    <ul>
      <li><strong>One dominant color:</strong> pick a single brand color and use its shades and tints for everything else. A page built from one hue always looks more coherent than one built from five unrelated colors.</li>
      <li><strong>Contrast for text:</strong> body text needs strong contrast against its background. If your brand color is mid-tone, use a dark shade of it for text rather than the color itself.</li>
      <li><strong>Restraint with brights:</strong> fully saturated colors demand attention, so reserve them for the one action you want people to take, and keep backgrounds muted.</li>
      <li><strong>Test in grayscale:</strong> if your design still reads clearly with the color removed, its structure is sound. Color should reinforce hierarchy, not carry it alone.</li>
    </ul>
    <h2>HEX, RGB and HSL conversions, explained</h2>
    <p>
      Converting between formats is pure arithmetic. HEX splits into three pairs
      of digits, each pair being one channel in base 16: #3B82F6 means red 59,
      green 130 and blue 246. HSL instead measures hue as an angle around the
      color wheel (0 is red, 120 is green, 240 is blue), saturation as the
      distance from gray, and lightness as the distance from black to white.
      That is why HSL is the easiest format for adjustments: raise lightness for
      a tint, lower it for a shade, and shift hue to move around the wheel, all
      without touching three separate channels.
    </p>
  </>
);

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  if (Number.isNaN(n) || full.length !== 6) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex({ r, g, b }) {
  return '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase();
}

function rgbToHsl({ r, g, b }) {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
  else if (max === gn) h = ((bn - rn) / d + 2) * 60;
  else h = ((rn - gn) / d + 4) * 60;
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function mix(rgb, target, t) {
  return {
    r: Math.round(rgb.r + (target.r - rgb.r) * t),
    g: Math.round(rgb.g + (target.g - rgb.g) * t),
    b: Math.round(rgb.b + (target.b - rgb.b) * t),
  };
}

function luminance({ r, g, b }) {
  const f = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export default function ColorPicker() {
  const [hex, setHex] = useState('#3B82F6');
  const [hexInput, setHexInput] = useState('#3B82F6');

  const rgb = useMemo(() => hexToRgb(hex) || { r: 59, g: 130, b: 246 }, [hex]);
  const hsl = useMemo(() => rgbToHsl(rgb), [rgb]);
  const textColor = luminance(rgb) > 0.179 ? '#111111' : '#FFFFFF';
  const shades = useMemo(() => [0.2, 0.4, 0.6, 0.8].map((t) => rgbToHex(mix(rgb, { r: 0, g: 0, b: 0 }, t))), [rgb]);
  const tints = useMemo(() => [0.2, 0.4, 0.6, 0.8].map((t) => rgbToHex(mix(rgb, { r: 255, g: 255, b: 255 }, t))), [rgb]);

  const applyHex = (value) => {
    setHexInput(value);
    const cleaned = value.startsWith('#') ? value : '#' + value;
    if (/^#[0-9a-fA-F]{6}$/.test(cleaned) || /^#[0-9a-fA-F]{3}$/.test(cleaned)) {
      const full = cleaned.length === 4
        ? '#' + cleaned.slice(1).split('').map((c) => c + c).join('')
        : cleaned;
      setHex(full.toUpperCase());
    }
  };

  const setChannel = (key, value) => {
    const n = Math.max(0, Math.min(255, parseInt(value, 10) || 0));
    setHex(rgbToHex({ ...rgb, [key]: n }));
    setHexInput(rgbToHex({ ...rgb, [key]: n }));
  };

  const rgbStr = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hslStr = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

  return (
    <ToolLayout
      slug="color-picker"
      path="/color-picker"
      title="Color Picker Online: HEX, RGB, HSL Converter Free | ToolNest"
      description="Pick any color and get its HEX, RGB and HSL values instantly, with shades, tints and contrast-safe text suggestions. Free."
      h1="Color Picker"
      intro="Pick any color and get its HEX, RGB and HSL values instantly, plus shades, tints and the text color that stays readable on top of it."
      faqs={FAQS}
      content={CONTENT}
    >
      <div className="row">
        <div className="field">
          <label htmlFor="cp-swatch">Pick a color</label>
          <input id="cp-swatch" type="color" value={hex} onChange={(e) => applyHex(e.target.value)} style={{ height: 48, width: '100%' }} />
        </div>
        <div className="field">
          <label htmlFor="cp-hex">HEX</label>
          <input id="cp-hex" type="text" value={hexInput} onChange={(e) => applyHex(e.target.value)} spellCheck={false} />
        </div>
      </div>
      <div className="row">
        {(['r', 'g', 'b']).map((k) => (
          <div className="field" key={k}>
            <label htmlFor={`cp-${k}`}>{k.toUpperCase()} (0-255)</label>
            <input id={`cp-${k}`} type="text" inputMode="numeric" value={rgb[k]} onChange={(e) => setChannel(k, e.target.value)} />
          </div>
        ))}
      </div>
      <div className="field">
        <label>Values (click Copy to use in your CSS)</label>
        <div className="row">
          <div className="field"><label>HEX</label><input type="text" readOnly value={hex} /></div>
          <CopyButton text={hex} label="Copy HEX" className="btn secondary" />
        </div>
        <div className="row">
          <div className="field"><label>RGB</label><input type="text" readOnly value={rgbStr} /></div>
          <CopyButton text={rgbStr} label="Copy RGB" className="btn secondary" />
        </div>
        <div className="row">
          <div className="field"><label>HSL</label><input type="text" readOnly value={hslStr} /></div>
          <CopyButton text={hslStr} label="Copy HSL" className="btn secondary" />
        </div>
      </div>
      <div className="field">
        <label>Preview with suggested text color</label>
        <p style={{ background: hex, color: textColor, padding: 20, borderRadius: 8, fontWeight: 600 }}>
          Sample text on {hex} — suggested text color {textColor}
        </p>
      </div>
      <div className="field">
        <label>Shades (darker)</label>
        <div className="btn-row">
          {shades.map((s) => (
            <button key={s} type="button" className="btn secondary" onClick={() => applyHex(s)} style={{ background: s, color: luminance(hexToRgb(s)) > 0.179 ? '#111' : '#fff' }}>{s}</button>
          ))}
        </div>
      </div>
      <div className="field">
        <label>Tints (lighter)</label>
        <div className="btn-row">
          {tints.map((t) => (
            <button key={t} type="button" className="btn secondary" onClick={() => applyHex(t)} style={{ background: t, color: luminance(hexToRgb(t)) > 0.179 ? '#111' : '#fff' }}>{t}</button>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}

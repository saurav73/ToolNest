import React from 'react';

/**
 * ToolNest icon set: original inline SVGs drawn on one 48x48 grid with a
 * shared line weight (2.6) and corner language, so all 22 tool icons read
 * as one family. PDF tools use the universal red document style (white
 * page, folded corner, red band with PDF in white). Image tools use the
 * classic photo frame (mountain + sun). Everything else is a clean line
 * glyph with its own tasteful accent color per tool.
 */

const SW = 2.6;
const PDF_RED = '#e5322d';
const PDF_RED_DARK = '#c81e1e';
const INK = '#1c2434';

/** The classic PDF page: white sheet, folded corner, red band, PDF text. */
function PdfPage({ children }) {
  return (
    <>
      <path d="M14 5 h14 l9 9 v26 a3 3 0 0 1 -3 3 H14 a3 3 0 0 1 -3 -3 V8 a3 3 0 0 1 3 -3 z" fill="#ffffff" stroke="#c3ccd9" strokeWidth="1.8" />
      <path d="M28 5 l9 9 h-9 z" fill="#e8edf5" stroke="#c3ccd9" strokeWidth="1.4" strokeLinejoin="round" />
      {children}
      <rect x="11" y="25" width="26" height="11" fill={PDF_RED} />
      <text x="24" y="33.4" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="8.5" fontWeight="800" letterSpacing="0.6" fill="#ffffff">PDF</text>
    </>
  );
}

function PhotoFrame({ color, children }) {
  return (
    <>
      <rect x="6" y="9" width="36" height="30" rx="4.5" fill="#ffffff" stroke={color} strokeWidth={SW} />
      <circle cx="15.5" cy="18" r="3" fill="#fbbf24" />
      <path d="M10 35 L20.5 23.5 L26.5 29.5 L31.5 24.5 L38 35 Z" fill={color} opacity="0.16" />
      <path d="M10 35 L20.5 23.5 L26.5 29.5 L31.5 24.5 L38 35" fill="none" stroke={color} strokeWidth={SW} strokeLinejoin="round" strokeLinecap="round" />
      {children}
    </>
  );
}

function Badge({ cx, cy, color, children }) {
  return (
    <>
      <circle cx={cx} cy={cy} r="8.5" fill={color} stroke="#ffffff" strokeWidth="2.2" />
      {children}
    </>
  );
}

function PairGlyph({ from, to, color }) {
  const label = `${from} > ${to}`;
  const size = label.length > 8 ? 6.4 : 7.4;
  return (
    <PhotoFrame color={color}>
      <rect x="5" y="32.5" width="38" height="12" rx="4" fill="#ffffff" stroke={color} strokeWidth="1.8" />
      <text x="24" y={41.6} textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize={size} fontWeight="800" fill={INK}>{label}</text>
    </PhotoFrame>
  );
}

const GLYPHS = {
  'word-counter': () => (
    <>
      <rect x="13" y="5" width="22" height="38" rx="3" fill="#ffffff" stroke="#4f46e5" strokeWidth={SW} />
      <path d="M18.5 13.5 H29.5 M18.5 19.5 H29.5 M18.5 25.5 H26" stroke="#4f46e5" strokeWidth={SW} strokeLinecap="round" />
      <rect x="18.5" y="33" width="3" height="5" rx="1" fill="#4f46e5" />
      <rect x="23" y="31" width="3" height="7" rx="1" fill="#4f46e5" opacity="0.75" />
      <rect x="27.5" y="34" width="3" height="4" rx="1" fill="#4f46e5" opacity="0.5" />
    </>
  ),
  'character-counter': () => (
    <>
      <text x="9" y="33" fontFamily="Georgia, 'Times New Roman', serif" fontSize="27" fontWeight="700" fill="#2563eb">A</text>
      <text x="27" y="34" fontFamily="Georgia, 'Times New Roman', serif" fontSize="19" fontWeight="700" fill="#2563eb" opacity="0.7">a</text>
      <path d="M11 40.5 H37" stroke="#2563eb" strokeWidth={SW} strokeLinecap="round" />
    </>
  ),
  'case-converter': () => (
    <>
      <text x="7" y="27" fontFamily="Georgia, 'Times New Roman', serif" fontSize="22" fontWeight="700" fill="#6366f1">A</text>
      <text x="26" y="40" fontFamily="Georgia, 'Times New Roman', serif" fontSize="17" fontWeight="700" fill="#6366f1">a</text>
      <path d="M31 9.5 C37 12.5 38.5 18 35.5 23" fill="none" stroke="#6366f1" strokeWidth={SW} strokeLinecap="round" />
      <path d="M31.5 22.5 L35.8 24.8 L37.8 20.3" fill="none" stroke="#6366f1" strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  'remove-duplicate-lines': () => (
    <>
      <path d="M11 12.5 H33 M11 36.5 H33" stroke="#0284c7" strokeWidth={SW} strokeLinecap="round" />
      <path d="M11 24.5 H28" stroke="#0284c7" strokeWidth={SW} strokeLinecap="round" opacity="0.4" />
      <path d="M31.5 21 L38 27.5 M38 21 L31.5 27.5" stroke={PDF_RED} strokeWidth="2.4" strokeLinecap="round" />
    </>
  ),
  'text-reverser': () => (
    <>
      <path d="M38 16.5 H13 M17.5 11 L12 16.5 L17.5 22" fill="none" stroke="#0891b2" strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 31.5 H35 M30.5 26 L36 31.5 L30.5 37" fill="none" stroke="#0891b2" strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  'word-frequency-counter': () => (
    <>
      <path d="M9 40.5 H40" stroke="#4f46e5" strokeWidth={SW} strokeLinecap="round" />
      <rect x="13.5" y="27" width="5.5" height="13.5" rx="1.4" fill="#4f46e5" opacity="0.55" />
      <rect x="21.5" y="15" width="5.5" height="25.5" rx="1.4" fill="#4f46e5" />
      <rect x="29.5" y="21" width="5.5" height="19.5" rx="1.4" fill="#4f46e5" opacity="0.8" />
    </>
  ),
  'text-to-speech': () => (
    <>
      <path d="M10 20.5 h5.5 L24 13 v22 l-8.5 -7.5 H10 z" fill="#2563eb" stroke="#2563eb" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M28.5 19.5 a6.5 6.5 0 0 1 0 9 M32.5 16 a12 12 0 0 1 0 16" fill="none" stroke="#2563eb" strokeWidth={SW} strokeLinecap="round" />
    </>
  ),
  'typing-speed-test': () => (
    <>
      <rect x="5" y="14" width="38" height="21" rx="3.5" fill="#ffffff" stroke="#475569" strokeWidth={SW} />
      {[12, 19, 26, 33].map((x) => (
        <circle key={`a${x}`} cx={x + 1.5} cy="20.5" r="1.5" fill="#475569" />
      ))}
      {[12, 19, 26, 33].map((x) => (
        <circle key={`b${x}`} cx={x + 1.5} cy="26" r="1.5" fill="#475569" opacity="0.65" />
      ))}
      <path d="M17 31.5 H31" stroke="#475569" strokeWidth={SW} strokeLinecap="round" />
    </>
  ),
  'lorem-ipsum-generator': () => (
    <>
      <text x="8" y="37" fontFamily="Georgia, 'Times New Roman', serif" fontSize="30" fontWeight="700" fill="#4f46e5">¶</text>
      <path d="M29 15.5 H41 M29 23.5 H38.5 M29 31.5 H41" stroke="#4f46e5" strokeWidth={SW} strokeLinecap="round" opacity="0.75" />
    </>
  ),
  'merge-pdf': () => (
    <>
      <rect x="6.5" y="9" width="23" height="34" rx="3" fill="#f3f6fb" stroke="#c3ccd9" strokeWidth="1.8" />
      <PdfPage />
      <Badge cx="37.5" cy="37.5" color={PDF_RED}>
        <path d="M37.5 33.8 V41.2 M33.8 37.5 H41.2" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" />
      </Badge>
    </>
  ),
  'split-pdf': () => (
    <>
      <PdfPage>
        <path d="M24 8.5 V22 M24 37.5 V41" stroke="#94a3b8" strokeWidth="2" strokeDasharray="2.6 2.6" strokeLinecap="round" />
      </PdfPage>
      <path d="M18 11.5 L14.5 15 L18 18.5 M30 11.5 L33.5 15 L30 18.5" fill="none" stroke={PDF_RED_DARK} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  'compress-pdf': () => (
    <>
      <path d="M2.5 19 H9.5 M6.5 15.5 L10 19 L6.5 22.5 M45.5 19 H38.5 M41.5 15.5 L38 19 L41.5 22.5" fill="none" stroke={PDF_RED} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <PdfPage />
    </>
  ),
  'jpg-to-pdf': () => (
    <>
      <PdfPage />
      <g>
        <rect x="4.5" y="7" width="16" height="13" rx="2.5" fill="#ffffff" stroke="#1f9d55" strokeWidth="2" />
        <circle cx="9" cy="11.5" r="1.5" fill="#fbbf24" />
        <path d="M6.5 18.5 L10.5 13.5 L13.5 16.5 L15.5 14.5 L18.5 18.5" fill="none" stroke="#1f9d55" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" />
      </g>
    </>
  ),
  'image-compressor': () => (
    <PhotoFrame color="#1f9d55">
      <Badge cx="36.5" cy="35" color="#1f9d55">
        <path d="M36.5 30.8 V38.4 M33.2 35.4 L36.5 38.7 L39.8 35.4" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </Badge>
    </PhotoFrame>
  ),
  'image-converter': () => (
    <PhotoFrame color="#2563eb">
      <Badge cx="36.5" cy="35" color="#2563eb">
        <path d="M32.3 32.6 H40.2 M38.2 30.4 L40.4 32.6 L38.2 34.8" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M40.7 38 H32.8 M34.8 35.8 L32.6 38 L34.8 40.2" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </Badge>
    </PhotoFrame>
  ),
  'png-to-jpg': () => <PairGlyph from="PNG" to="JPG" color="#2563eb" />,
  'jpg-to-png': () => <PairGlyph from="JPG" to="PNG" color="#2563eb" />,
  'webp-to-png': () => <PairGlyph from="WEBP" to="PNG" color="#7c3aed" />,
  'webp-to-jpg': () => <PairGlyph from="WEBP" to="JPG" color="#7c3aed" />,
  'png-to-webp': () => <PairGlyph from="PNG" to="WEBP" color="#0e9594" />,
  'jpg-to-webp': () => <PairGlyph from="JPG" to="WEBP" color="#0e9594" />,
  'image-resizer': () => (
    <PhotoFrame color="#0e9594">
      <Badge cx="36.5" cy="35" color="#0e9594">
        <path d="M39.8 31.8 L32.2 39.4 M40.2 31.2 H36.6 M40.2 31.2 V34.8 M31.8 39.8 H35.4 M31.8 39.8 V36.2" fill="none" stroke="#ffffff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      </Badge>
    </PhotoFrame>
  ),
  'password-generator': () => (
    <>
      <circle cx="16.5" cy="31.5" r="8.5" fill="none" stroke="#d97706" strokeWidth="3.2" />
      <path d="M22.8 25.2 L38.5 9.5" stroke="#d97706" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M31.5 16.5 V21.5 M37 11 V15.5" stroke="#d97706" strokeWidth="3.2" strokeLinecap="round" />
    </>
  ),
  'qr-code-generator': () => (
    <>
      <rect x="7" y="7" width="14" height="14" rx="2.5" fill="none" stroke={INK} strokeWidth={SW} />
      <rect x="27" y="7" width="14" height="14" rx="2.5" fill="none" stroke={INK} strokeWidth={SW} />
      <rect x="7" y="27" width="14" height="14" rx="2.5" fill="none" stroke={INK} strokeWidth={SW} />
      <rect x="11.5" y="11.5" width="5" height="5" fill={INK} />
      <rect x="31.5" y="11.5" width="5" height="5" fill={INK} />
      <rect x="11.5" y="31.5" width="5" height="5" fill={INK} />
      <rect x="27" y="27" width="5.5" height="5.5" fill={INK} />
      <rect x="36" y="27" width="5" height="5" fill={INK} />
      <rect x="27" y="36.5" width="5" height="5" fill={INK} />
      <rect x="36.5" y="36" width="5" height="5" fill={INK} />
    </>
  ),
  'json-formatter': () => (
    <>
      <text x="6" y="34" fontFamily="'Courier New', Courier, monospace" fontSize="27" fontWeight="700" fill="#7c3aed">{'{'}</text>
      <text x="29" y="34" fontFamily="'Courier New', Courier, monospace" fontSize="27" fontWeight="700" fill="#7c3aed">{'}'}</text>
      <circle cx="24" cy="19" r="1.9" fill="#7c3aed" />
      <circle cx="24" cy="28" r="1.9" fill="#7c3aed" />
    </>
  ),
  'base64-encoder-decoder': () => (
    <>
      <path d="M17.5 13.5 L7.5 24 L17.5 34.5 M30.5 13.5 L40.5 24 L30.5 34.5" fill="none" stroke="#0d9488" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M27.5 11.5 L20.5 36.5" stroke="#0d9488" strokeWidth={SW} strokeLinecap="round" />
    </>
  ),
  'slug-generator': () => (
    <g transform="rotate(-45 24 24)">
      <rect x="4" y="18" width="23" height="12" rx="6" fill="none" stroke="#0284c7" strokeWidth={SW} />
      <rect x="21" y="18" width="23" height="12" rx="6" fill="none" stroke="#0284c7" strokeWidth={SW} />
    </g>
  ),
  'heic-to-jpg': () => <PairGlyph from="HEIC" to="JPG" color="#2563eb" />,
  'heic-to-png': () => <PairGlyph from="HEIC" to="PNG" color="#2563eb" />,
  'avif-to-jpg': () => <PairGlyph from="AVIF" to="JPG" color="#7c3aed" />,
  'pdf-to-jpg': () => (
    <>
      <PdfPage />
      <Badge cx="37.5" cy="37.5" color="#1f9d55">
        <path d="M31.5 41.2 L35.8 35.8 L38.2 38.4 L40 36.4 L43.5 41.2 Z" fill="#ffffff" />
        <circle cx="40.6" cy="33.6" r="1.4" fill="#ffffff" />
      </Badge>
    </>
  ),
  'pdf-to-png': () => (
    <>
      <PdfPage />
      <Badge cx="37.5" cy="37.5" color="#2563eb">
        <path d="M31.5 41.2 L35.8 35.8 L38.2 38.4 L40 36.4 L43.5 41.2 Z" fill="#ffffff" />
        <circle cx="40.6" cy="33.6" r="1.4" fill="#ffffff" />
      </Badge>
    </>
  ),
  'image-to-text': () => (
    <PhotoFrame color="#7c3aed">
      <Badge cx="36.5" cy="35" color="#7c3aed">
        <text x="36.5" y="39.6" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontSize="10.5" fontWeight="700" fill="#ffffff">T</text>
      </Badge>
    </PhotoFrame>
  ),
  'compress-image-to-50kb': () => (
    <PhotoFrame color="#1f9d55">
      <Badge cx="36.5" cy="35" color="#1f9d55">
        <text x="36.5" y="38.4" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="7" fontWeight="800" fill="#ffffff">50</text>
      </Badge>
    </PhotoFrame>
  ),
  'compress-image-to-100kb': () => (
    <PhotoFrame color="#1f9d55">
      <Badge cx="36.5" cy="35" color="#1f9d55">
        <text x="36.5" y="38" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="5.8" fontWeight="800" fill="#ffffff">100</text>
      </Badge>
    </PhotoFrame>
  ),
  'compress-image-to-200kb': () => (
    <PhotoFrame color="#1f9d55">
      <Badge cx="36.5" cy="35" color="#1f9d55">
        <text x="36.5" y="38" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="5.8" fontWeight="800" fill="#ffffff">200</text>
      </Badge>
    </PhotoFrame>
  ),
  'invoice-generator': () => (
    <>
      <path d="M13 4.5 H35 V43.5 L31.8 40.8 L28.6 43.5 L25.4 40.8 L22.2 43.5 L19 40.8 L15.8 43.5 L13 40.9 Z" fill="#ffffff" stroke="#0e9594" strokeWidth={SW} strokeLinejoin="round" />
      <text x="19" y="17.5" fontFamily="Georgia, 'Times New Roman', serif" fontSize="11" fontWeight="700" fill="#0e9594">$</text>
      <path d="M26.5 13.5 H31.5 M17.5 24.5 H30.5 M17.5 30.5 H30.5 M17.5 36.5 H26" stroke="#0e9594" strokeWidth={SW} strokeLinecap="round" opacity="0.75" />
    </>
  ),
  'gmail-dot-generator': () => (
    <>
      <rect x="6.5" y="12.5" width="35" height="24" rx="3.5" fill="#ffffff" stroke="#e5322d" strokeWidth={SW} />
      <path d="M9.5 16.5 L24 27.5 L38.5 16.5" fill="none" stroke="#e5322d" strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="41.5" r="1.9" fill={INK} />
      <circle cx="24" cy="41.5" r="1.9" fill={INK} />
      <circle cx="32" cy="41.5" r="1.9" fill={INK} />
    </>
  ),
  'random-number-generator': () => (
    <>
      <rect x="9.5" y="9.5" width="29" height="29" rx="6.5" fill="#ffffff" stroke="#9333ea" strokeWidth={SW} />
      <circle cx="18" cy="18" r="2.7" fill="#9333ea" />
      <circle cx="30" cy="18" r="2.7" fill="#9333ea" />
      <circle cx="24" cy="24" r="2.7" fill="#9333ea" />
      <circle cx="18" cy="30" r="2.7" fill="#9333ea" />
      <circle cx="30" cy="30" r="2.7" fill="#9333ea" />
    </>
  ),
};

export default function ToolIcon({ slug }) {
  const Glyph = GLYPHS[slug];
  return (
    <svg viewBox="0 0 48 48" className="tool-icon-svg" aria-hidden="true" focusable="false">
      {Glyph ? <Glyph /> : null}
    </svg>
  );
}

/** Maps a tool category to its soft tile tint class. */
export function tileClass(category) {
  switch (category) {
    case 'PDF Tools': return 'tile-pdf';
    case 'Image Tools': return 'tile-image';
    case 'Generators': return 'tile-gen';
    case 'Business Tools': return 'tile-biz';
    case 'Developer Tools': return 'tile-dev';
    default: return 'tile-text';
  }
}

export { INK as ICON_INK };

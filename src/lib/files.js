/* File helpers for the image and PDF tools. Everything is local:
   files are read into browser memory and never uploaded anywhere. */

/** Human-friendly byte size, e.g. 1536 -> "1.5 KB". */
export function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/** Trigger a browser download for a Blob. */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/**
 * Resolve once at least `ms` has elapsed since `start` (a Date.now()
 * timestamp). Client-side processing is often near-instant; this keeps
 * the animated processing state visible for a brief, honest moment so
 * users can actually perceive it. It never adds a fake long delay.
 */
export async function holdAtLeast(start, ms = 600) {
  const remaining = ms - (Date.now() - start);
  if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));
}

/** Replace a file name's extension, e.g. ("photo.jpg", "png") -> "photo.png". */
export function swapExt(name, ext) {
  const base = name.replace(/\.[^.]+$/, '');
  return `${base}.${ext}`;
}

/** Load an image file into an HTMLImageElement. Caller should revoke `url` when done. */
export function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, url });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('That file could not be read as an image.'));
    };
    img.src = url;
  });
}

/** Draw an image to a canvas at the given size and return the canvas. */
export function imageToCanvas(img, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
}

/** Canvas to Blob as a promise (quality applies to JPEG and WebP). */
export function canvasToBlob(canvas, type = 'image/png', quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('The image could not be encoded.'))),
      type,
      quality,
    );
  });
}

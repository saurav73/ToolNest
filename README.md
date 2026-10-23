# ToolNest

Free online tools that run 100% in your browser. No sign up, and files are never uploaded to a server: every tool processes everything on your own device.

**Live:** https://toolnest-sage.vercel.app

## What is inside

33 tools across 45 pages, including:

- **PDF:** merge, split, compress, JPG to PDF, PDF to JPG and PNG
- **Image:** compress (with target sizes like 50 KB, 100 KB, 200 KB), resize, convert between JPG, PNG, WebP, HEIC and AVIF, image to text (OCR)
- **Text:** word and character counter, case converter, duplicate line remover, word frequency
- **Generators:** styled QR codes, passwords (with passphrase mode), invoices, Gmail dot addresses
- **Utilities:** JSON formatter, Base64 encoder, typing test, text to speech

## Tech

- React 18 + Vite, fully client side
- Build-time prerendering (SSG) so every page ships real HTML with its own title, meta and structured data
- Deployed on Vercel

## Run it locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

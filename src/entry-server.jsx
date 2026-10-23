/* Build-time prerender entry: renders each route to static HTML with
   react-dom/server + StaticRouter so crawlers and no-JS visitors get the
   real title, meta, JSON-LD, H1 and article content. The client bundle
   hydrates this markup (see src/main.jsx). Imports are eager on purpose:
   lazy() chunks cannot render synchronously on the server. */
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import TermsPage from './pages/TermsPage.jsx';
import DisclaimerPage from './pages/DisclaimerPage.jsx';
import WordCounter from './pages/tools/WordCounter.jsx';
import CharacterCounter from './pages/tools/CharacterCounter.jsx';
import CaseConverter from './pages/tools/CaseConverter.jsx';
import PasswordGenerator from './pages/tools/PasswordGenerator.jsx';
import QrGenerator from './pages/tools/QrGenerator.jsx';
import JsonFormatter from './pages/tools/JsonFormatter.jsx';
import Base64Tool from './pages/tools/Base64Tool.jsx';
import LoremIpsum from './pages/tools/LoremIpsum.jsx';
import RemoveDuplicates from './pages/tools/RemoveDuplicates.jsx';
import SlugGenerator from './pages/tools/SlugGenerator.jsx';
import TextReverser from './pages/tools/TextReverser.jsx';
import WordFrequency from './pages/tools/WordFrequency.jsx';
import TextToSpeech from './pages/tools/TextToSpeech.jsx';
import TypingTest from './pages/tools/TypingTest.jsx';
import ImageCompressor from './pages/tools/ImageCompressor.jsx';
import ImageConverter from './pages/tools/ImageConverter.jsx';
import PngToJpg from './pages/tools/PngToJpg.jsx';
import JpgToPng from './pages/tools/JpgToPng.jsx';
import WebpToPng from './pages/tools/WebpToPng.jsx';
import WebpToJpg from './pages/tools/WebpToJpg.jsx';
import PngToWebp from './pages/tools/PngToWebp.jsx';
import JpgToWebp from './pages/tools/JpgToWebp.jsx';
import ImageResizer from './pages/tools/ImageResizer.jsx';
import MergePdf from './pages/tools/MergePdf.jsx';
import SplitPdf from './pages/tools/SplitPdf.jsx';
import JpgToPdf from './pages/tools/JpgToPdf.jsx';
import CompressPdf from './pages/tools/CompressPdf.jsx';
import RandomNumber from './pages/tools/RandomNumber.jsx';
import GmailDotGenerator from './pages/tools/GmailDotGenerator.jsx';
import HeicToJpg from './pages/tools/HeicToJpg.jsx';
import HeicToPng from './pages/tools/HeicToPng.jsx';
import PdfToJpg from './pages/tools/PdfToJpg.jsx';
import PdfToPng from './pages/tools/PdfToPng.jsx';
import AvifToJpg from './pages/tools/AvifToJpg.jsx';
import ImageToText from './pages/tools/ImageToText.jsx';
import CompressImageTo50kb from './pages/tools/CompressImageTo50kb.jsx';
import CompressImageTo100kb from './pages/tools/CompressImageTo100kb.jsx';
import CompressImageTo200kb from './pages/tools/CompressImageTo200kb.jsx';
import InvoiceGenerator from './pages/tools/InvoiceGenerator.jsx';
import { __startHeadCollection, __takeHeadCollection } from './lib/seo.jsx';

function SsrApp() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/word-counter" element={<WordCounter />} />
        <Route path="/character-counter" element={<CharacterCounter />} />
        <Route path="/case-converter" element={<CaseConverter />} />
        <Route path="/password-generator" element={<PasswordGenerator />} />
        <Route path="/qr-code-generator" element={<QrGenerator />} />
        <Route path="/json-formatter" element={<JsonFormatter />} />
        <Route path="/base64-encoder-decoder" element={<Base64Tool />} />
        <Route path="/lorem-ipsum-generator" element={<LoremIpsum />} />
        <Route path="/remove-duplicate-lines" element={<RemoveDuplicates />} />
        <Route path="/slug-generator" element={<SlugGenerator />} />
        <Route path="/text-reverser" element={<TextReverser />} />
        <Route path="/word-frequency-counter" element={<WordFrequency />} />
        <Route path="/text-to-speech" element={<TextToSpeech />} />
        <Route path="/typing-speed-test" element={<TypingTest />} />
        <Route path="/image-compressor" element={<ImageCompressor />} />
        <Route path="/image-converter" element={<ImageConverter />} />
        <Route path="/png-to-jpg" element={<PngToJpg />} />
        <Route path="/jpg-to-png" element={<JpgToPng />} />
        <Route path="/webp-to-png" element={<WebpToPng />} />
        <Route path="/webp-to-jpg" element={<WebpToJpg />} />
        <Route path="/png-to-webp" element={<PngToWebp />} />
        <Route path="/jpg-to-webp" element={<JpgToWebp />} />
        <Route path="/image-resizer" element={<ImageResizer />} />
        <Route path="/merge-pdf" element={<MergePdf />} />
        <Route path="/split-pdf" element={<SplitPdf />} />
        <Route path="/jpg-to-pdf" element={<JpgToPdf />} />
        <Route path="/compress-pdf" element={<CompressPdf />} />
        <Route path="/random-number-generator" element={<RandomNumber />} />
        <Route path="/gmail-dot-generator" element={<GmailDotGenerator />} />
        <Route path="/heic-to-jpg" element={<HeicToJpg />} />
        <Route path="/heic-to-png" element={<HeicToPng />} />
        <Route path="/pdf-to-jpg" element={<PdfToJpg />} />
        <Route path="/pdf-to-png" element={<PdfToPng />} />
        <Route path="/avif-to-jpg" element={<AvifToJpg />} />
        <Route path="/image-to-text" element={<ImageToText />} />
        <Route path="/compress-image-to-50kb" element={<CompressImageTo50kb />} />
        <Route path="/compress-image-to-100kb" element={<CompressImageTo100kb />} />
        <Route path="/compress-image-to-200kb" element={<CompressImageTo200kb />} />
        <Route path="/invoice-generator" element={<InvoiceGenerator />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/disclaimer" element={<DisclaimerPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

export function render(url) {
  __startHeadCollection();
  let html = '';
  let head = null;
  try {
    html = renderToString(
      <StaticRouter location={url}>
        <SsrApp />
      </StaticRouter>,
    );
  } finally {
    head = __takeHeadCollection();
  }
  return { html, head };
}

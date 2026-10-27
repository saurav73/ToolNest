import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';

const NotFound = lazy(() => import('./pages/NotFound.jsx'));
const AboutPage = lazy(() => import('./pages/AboutPage.jsx'));
const ContactPage = lazy(() => import('./pages/ContactPage.jsx'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage.jsx'));
const TermsPage = lazy(() => import('./pages/TermsPage.jsx'));
const DisclaimerPage = lazy(() => import('./pages/DisclaimerPage.jsx'));
const WordCounter = lazy(() => import('./pages/tools/WordCounter.jsx'));
const CharacterCounter = lazy(() => import('./pages/tools/CharacterCounter.jsx'));
const CaseConverter = lazy(() => import('./pages/tools/CaseConverter.jsx'));
const PasswordGenerator = lazy(() => import('./pages/tools/PasswordGenerator.jsx'));
const QrGenerator = lazy(() => import('./pages/tools/QrGenerator.jsx'));
const JsonFormatter = lazy(() => import('./pages/tools/JsonFormatter.jsx'));
const Base64Tool = lazy(() => import('./pages/tools/Base64Tool.jsx'));
const LoremIpsum = lazy(() => import('./pages/tools/LoremIpsum.jsx'));
const RemoveDuplicates = lazy(() => import('./pages/tools/RemoveDuplicates.jsx'));
const SlugGenerator = lazy(() => import('./pages/tools/SlugGenerator.jsx'));
const TextReverser = lazy(() => import('./pages/tools/TextReverser.jsx'));
const WordFrequency = lazy(() => import('./pages/tools/WordFrequency.jsx'));
const TextToSpeech = lazy(() => import('./pages/tools/TextToSpeech.jsx'));
const TypingTest = lazy(() => import('./pages/tools/TypingTest.jsx'));
const ImageCompressor = lazy(() => import('./pages/tools/ImageCompressor.jsx'));
const ImageConverter = lazy(() => import('./pages/tools/ImageConverter.jsx'));
const PngToJpg = lazy(() => import('./pages/tools/PngToJpg.jsx'));
const JpgToPng = lazy(() => import('./pages/tools/JpgToPng.jsx'));
const WebpToPng = lazy(() => import('./pages/tools/WebpToPng.jsx'));
const WebpToJpg = lazy(() => import('./pages/tools/WebpToJpg.jsx'));
const PngToWebp = lazy(() => import('./pages/tools/PngToWebp.jsx'));
const JpgToWebp = lazy(() => import('./pages/tools/JpgToWebp.jsx'));
const ImageResizer = lazy(() => import('./pages/tools/ImageResizer.jsx'));
const MergePdf = lazy(() => import('./pages/tools/MergePdf.jsx'));
const SplitPdf = lazy(() => import('./pages/tools/SplitPdf.jsx'));
const JpgToPdf = lazy(() => import('./pages/tools/JpgToPdf.jsx'));
const CompressPdf = lazy(() => import('./pages/tools/CompressPdf.jsx'));
const RandomNumber = lazy(() => import('./pages/tools/RandomNumber.jsx'));
const GmailDotGenerator = lazy(() => import('./pages/tools/GmailDotGenerator.jsx'));
const HeicToJpg = lazy(() => import('./pages/tools/HeicToJpg.jsx'));
const HeicToPng = lazy(() => import('./pages/tools/HeicToPng.jsx'));
const PdfToJpg = lazy(() => import('./pages/tools/PdfToJpg.jsx'));
const PdfToPng = lazy(() => import('./pages/tools/PdfToPng.jsx'));
const AvifToJpg = lazy(() => import('./pages/tools/AvifToJpg.jsx'));
const ImageToText = lazy(() => import('./pages/tools/ImageToText.jsx'));
const CompressImageTo50kb = lazy(() => import('./pages/tools/CompressImageTo50kb.jsx'));
const CompressImageTo100kb = lazy(() => import('./pages/tools/CompressImageTo100kb.jsx'));
const CompressImageTo200kb = lazy(() => import('./pages/tools/CompressImageTo200kb.jsx'));
const InvoiceGenerator = lazy(() => import('./pages/tools/InvoiceGenerator.jsx'));
const RegexTester = lazy(() => import('./pages/tools/RegexTester.jsx'));
const HashGenerator = lazy(() => import('./pages/tools/HashGenerator.jsx'));
const UuidGenerator = lazy(() => import('./pages/tools/UuidGenerator.jsx'));
const ColorPicker = lazy(() => import('./pages/tools/ColorPicker.jsx'));

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <Layout>
      <ScrollTop />
      <Suspense fallback={<main className="container page"><p className="lede">Loading tool...</p></main>}>
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
          <Route path="/regex-tester" element={<RegexTester />} />
          <Route path="/hash-generator" element={<HashGenerator />} />
          <Route path="/uuid-generator" element={<UuidGenerator />} />
          <Route path="/color-picker" element={<ColorPicker />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/disclaimer" element={<DisclaimerPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

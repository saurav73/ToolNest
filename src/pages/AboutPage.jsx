import React from 'react';
import { Link } from 'react-router-dom';
import { useSeo } from '../lib/seo.jsx';

export default function AboutPage() {
  useSeo({
    title: 'About ToolNest: Free Tools That Respect Your Privacy',
    description: 'ToolNest is a free collection of browser-based tools built by Saurav Shrestha. No uploads, no sign-up, your text never leaves your device.',
    path: '/about',
  });
  return (
    <main className="container page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link><span aria-hidden="true">›</span><span>About</span>
      </nav>
      <article className="prose">
        <h1>About ToolNest</h1>
        <p>
          ToolNest is a collection of free online tools for the small jobs people do
          every day: counting words in an essay, checking a character limit before
          posting, generating a strong password, cleaning up a messy list, merging a
          PDF, or formatting a block of JSON. Each tool does one thing, does it
          instantly, and gets out of your way.
        </p>
        <h2>Why ToolNest exists</h2>
        <p>
          Most tool websites are built around uploads. You hand a server your document,
          wait in a queue, and often hit a paywall or a sign-up wall before you can
          download the result. Modern browsers can do all of this work locally, so
          ToolNest is built the other way around: every tool runs entirely in your
          browser tab. Your text and files are processed on your own device and are
          never uploaded, stored, or seen by us.
        </p>
        <h2>Who builds it</h2>
        <p>
          ToolNest is designed, built and maintained by Saurav Shrestha, a web
          developer who also builds calculator and reference websites. The site is a
          one-person project, which keeps it simple: no accounts, no databases, and no
          reason to collect your data. If a tool is missing a feature you need, or you
          spot a bug, the <Link to="/contact">Contact page</Link> is the fastest way
          to reach the person who can fix it.
        </p>
        <h2>What you will find here</h2>
        <ul>
          <li><strong>Text tools</strong> for writers, students and marketers: a word counter, character counter, case converter, word frequency counter, text to speech and a typing speed test.</li>
          <li><strong>PDF and image tools</strong> that work on local files: merge, split and compress PDFs, convert images to PDF, compress, convert and resize images.</li>
          <li><strong>Generators</strong> for passwords, QR codes, random numbers and lorem ipsum placeholder text.</li>
          <li><strong>Developer tools</strong> for JSON formatting, Base64 encoding and decoding, URL slug generation and list cleanup.</li>
        </ul>
        <h2>Our promises</h2>
        <ul>
          <li>Free to use, with no sign-up and no usage limits.</li>
          <li>Your content is processed in your browser and never uploaded.</li>
          <li>Every tool page explains how the tool works and answers common questions, so you are never guessing.</li>
        </ul>
        <p>
          Start with the <Link to="/word-counter">Word Counter</Link>, or browse the
          full list on the <Link to="/">home page</Link>.
        </p>
      </article>
    </main>
  );
}

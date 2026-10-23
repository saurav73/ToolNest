import React from 'react';
import { Link } from 'react-router-dom';
import { useSeo } from '../lib/seo.jsx';

export default function TermsPage() {
  useSeo({
    title: 'Terms of Use: Free Tools, Provided As Is | ToolNest',
    description: 'The simple terms for using ToolNest: free for personal and commercial use, results provided as is, and your content stays yours.',
    path: '/terms',
  });
  return (
    <main className="container page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link><span aria-hidden="true">›</span><span>Terms of Use</span>
      </nav>
      <article className="prose">
        <h1>Terms of Use</h1>
        <div className="updated">Last updated: October 21, 2026</div>

        <h2>Using ToolNest</h2>
        <p>
          ToolNest provides free online tools for text, images, PDFs, passwords and
          data formatting. By using the site you agree to these terms. You may use
          every tool for personal or commercial work, as often as you like, with no
          account and no fee.
        </p>

        <h2>Your content stays yours</h2>
        <p>
          Everything you type, paste or open in a tool remains your property. Because
          all processing happens in your browser, ToolNest never receives a copy of
          your content and claims no rights over it or over the results you create,
          such as converted files, generated passwords or downloaded QR codes.
        </p>

        <h2>Results are provided as is</h2>
        <p>
          We work to keep every tool accurate, including counts, conversions and file
          outputs. Even so, all tools and results are provided "as is" without
          warranties of any kind. Always double-check important work, such as a legal
          document's word count or a generated password you are about to rely on,
          before using a result for anything critical.
        </p>

        <h2>Acceptable use</h2>
        <ul>
          <li>Do not use ToolNest for anything unlawful.</li>
          <li>Do not attempt to disrupt the site, overload it, or copy it wholesale to pass off as your own service.</li>
          <li>You are responsible for having the right to use any text or file you process, including copyrighted material.</li>
        </ul>

        <h2>Availability and changes</h2>
        <p>
          ToolNest is a small project and may change over time: tools can be added,
          improved or removed, and the site may be unavailable briefly during updates.
          These terms may also be updated; the current version will always be on this
          page with its date.
        </p>

        <h2>Liability</h2>
        <p>
          To the maximum extent allowed by law, ToolNest and its owner are not liable
          for any loss or damage arising from the use of the site or its results,
          including lost text or files. Since nothing is uploaded, remember to keep
          your own copies of important work.
        </p>

        <h2>Questions</h2>
        <p>
          Questions about these terms are welcome via the{' '}
          <Link to="/contact">Contact page</Link>.
        </p>
      </article>
    </main>
  );
}

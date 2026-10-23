import React from 'react';
import { Link } from 'react-router-dom';
import { useSeo } from '../lib/seo.jsx';

export default function DisclaimerPage() {
  useSeo({
    title: 'Disclaimer: Results Provided As Is | ToolNest',
    description: 'ToolNest results are provided as is, with no warranty. Files are processed locally in your browser, and external links are provided for reference only.',
    path: '/disclaimer',
  });
  return (
    <main className="container page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link><span aria-hidden="true">›</span><span>Disclaimer</span>
      </nav>
      <article className="prose">
        <h1>Disclaimer</h1>
        <div className="updated">Last updated: October 21, 2026</div>

        <h2>Results are provided as is</h2>
        <p>
          Every tool on ToolNest is provided for general use, and every result a
          tool produces, including counts, conversions, generated content and
          downloadable files, is provided "as is" without any guarantee of
          accuracy, completeness or fitness for a particular purpose. We work
          hard to make each tool correct, but software can contain errors, and
          browsers and devices can behave differently. Always review a result
          before relying on it for anything important, such as a submission
          deadline, a legal or financial document, or a password you plan to
          use for a real account.
        </p>

        <h2>No warranty</h2>
        <p>
          To the maximum extent allowed by law, ToolNest offers no warranty of
          any kind, express or implied, about the site, the tools or their
          results, and is not responsible for any loss or damage that follows
          from using them. This includes lost work: because nothing you enter
          is saved anywhere, keep your own copies of anything you would not
          want to lose.
        </p>

        <h2>Your files are processed locally</h2>
        <p>
          All ToolNest tools run entirely in your web browser. Files you open,
          such as PDFs and images, are processed on your own device and are
          never uploaded to a server, never stored, and never seen by us. The
          output of a tool is only as reliable as the file and the browser you
          provide, and very large or damaged files may produce incomplete
          results.
        </p>

        <h2>Not professional advice</h2>
        <p>
          Information published on this site, including guides, examples and
          frequently asked questions, is general information only. It is not
          legal, financial, medical or other professional advice, and it is
          not a substitute for consulting a qualified professional about your
          specific situation.
        </p>

        <h2>External links</h2>
        <p>
          Some pages link to external websites, such as Google policy pages,
          for reference. Those sites are operated by third parties: we do not
          control them, we are not responsible for their content or their
          privacy practices, and a link is not an endorsement. Anything you do
          on an external site is governed by that site's own terms and
          policies.
        </p>

        <h2>Changes to this disclaimer</h2>
        <p>
          This disclaimer may be updated from time to time as the site grows.
          The current version will always be on this page with its date.
          Questions are welcome via the <Link to="/contact">Contact page</Link>.
        </p>
      </article>
    </main>
  );
}

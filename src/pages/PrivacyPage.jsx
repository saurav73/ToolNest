import React from 'react';
import { Link } from 'react-router-dom';
import { useSeo } from '../lib/seo.jsx';

export default function PrivacyPage() {
  useSeo({
    title: 'Privacy Policy: Your Text Never Leaves Your Device',
    description: 'ToolNest tools run entirely in your browser. What that means for your text and files, plus cookies, ads and analytics explained plainly.',
    path: '/privacy',
  });
  return (
    <main className="container page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link><span aria-hidden="true">›</span><span>Privacy Policy</span>
      </nav>
      <article className="prose">
        <h1>Privacy Policy</h1>
        <div className="updated">Last updated: October 22, 2026</div>

        <h2>The short version</h2>
        <p>
          Every tool on ToolNest runs entirely in your web browser. The text you type
          or paste, the passwords you generate, and the images and PDF files you open
          are processed on your own device. They are never uploaded to a server, never
          stored, and never seen by us. There are no accounts, no sign-ups and no
          databases of user content.
        </p>

        <h2>Information we do not collect</h2>
        <p>
          We do not collect the content you use in any tool. We do not ask for your
          name, email address or any other personal details to use the site, and we do
          not sell or share personal information with anyone.
        </p>

        <h2>The feedback form</h2>
        <p>
          Each tool page has a small "Rate this tool" form. If you choose to use it,
          the name, rating and message you enter are sent to us through a form
          delivery service (FormSubmit) so we can read your feedback and improve
          the tools. Feedback is delivered privately to our inbox. It is never
          published on the site and never sold or shared with anyone else.
        </p>

        <h2>Cookies, analytics and advertising</h2>
        <p>
          ToolNest itself sets no tracking cookies. Like most websites, we may use
          Google Analytics to understand aggregate usage, such as which tools are
          popular and roughly where visitors come from. This data is anonymous and is
          never linked to the content you process in a tool.
        </p>
        <p>
          ToolNest may display advertising served by Google AdSense (publisher ID
          ca-pub-1184879199231987). Google and its partners may use cookies to serve
          ads based on your prior visits to this and other websites. You can learn how
          Google uses data at{' '}
          <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener">
            how Google uses data from partner sites
          </a>{' '}
          and read more about advertising cookies at{' '}
          <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener">
            policies.google.com/technologies/ads
          </a>. You can opt out of personalized advertising at any time through your{' '}
          <a href="https://adssettings.google.com/" target="_blank" rel="noopener">Google Ads Settings</a>.
        </p>

        <h2>Files and passwords</h2>
        <p>
          The PDF and image tools read files into your browser's memory only, and
          results are generated locally for you to download. Passwords created by the
          Password Generator are generated on your device with the Web Crypto API and
          are never transmitted anywhere.
        </p>

        <h2>Links to other sites</h2>
        <p>
          ToolNest links to a small number of external pages, such as Google policy
          pages. Once you leave ToolNest, the privacy policy of the site you visit
          applies instead of this one.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          If this policy changes, the updated version will be posted on this page with
          a new "Last updated" date.
        </p>

        <h2>Questions</h2>
        <p>
          If you have any question about privacy on ToolNest, reach us through the{' '}
          <Link to="/contact">Contact page</Link>.
        </p>
      </article>
    </main>
  );
}

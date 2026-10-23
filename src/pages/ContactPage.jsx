import React from 'react';
import { Link } from 'react-router-dom';
import { useSeo } from '../lib/seo.jsx';
import FeedbackForm from '../components/FeedbackForm.jsx';

export default function ContactPage() {
  useSeo({
    title: 'Contact ToolNest: Feedback, Bugs and Tool Requests',
    description: 'Contact ToolNest to report a bug, request a new tool or ask a question. One developer reads every message and replies personally.',
    path: '/contact',
  });
  return (
    <main className="container page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link><span aria-hidden="true">›</span><span>Contact</span>
      </nav>
      <article className="prose">
        <h1>Contact ToolNest</h1>
        <p>
          ToolNest is built and maintained by one developer, Saurav Shrestha. If you
          found a bug, want a tool that is not here yet, or have a question about how
          a result was calculated, you are welcome to get in touch.
        </p>
        <h2>Email</h2>
        <p>
          The fastest way to reach us is by email:{' '}
          <a href="mailto:sauravstha486@gmail.com">sauravstha486@gmail.com</a>
        </p>
        <p>
          A few tips for a faster reply:
        </p>
        <ul>
          <li><strong>Bug reports:</strong> tell us which tool you used, what you pasted or uploaded, and what you expected to happen. A screenshot helps a lot.</li>
          <li><strong>Tool requests:</strong> describe the job you are trying to get done. If it can run entirely in a browser, there is a good chance it will be added.</li>
          <li><strong>Privacy questions:</strong> the short answer is that your text and files never leave your device. The long answer is on the <Link to="/privacy">Privacy Policy</Link> page.</li>
        </ul>
        <h2>What we cannot help with</h2>
        <p>
          ToolNest has no accounts and stores no user files, so there is no way for us
          to recover text you processed earlier or to delete data from our servers,
          because none ever reaches them. If you closed a tab, the content in that tab
          is gone by design.
        </p>
        <div className="note">
          We read every message and reply to most within a few days. ToolNest does not
          offer phone support, and we will never ask you for a password or payment
          details by email.
        </div>
      </article>
      <FeedbackForm toolName="Website" />
    </main>
  );
}

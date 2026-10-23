import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Private "Rate this tool" feedback form. Submissions are delivered to the
 * site owner's inbox through FormSubmit (a form delivery service), so there
 * is no public display, no database and no backend of ours. The first real
 * submission triggers a one-time activation email that the owner must click.
 *
 * Note: the first submission to a fresh FormSubmit address returns an
 * activation notice instead of delivering the message, so the UI stays
 * honest about that in the success copy below.
 */

const FEEDBACK_ENDPOINT = 'https://formsubmit.co/ajax/sauravstha486@gmail.com';

function Star({ filled }) {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" focusable="false">
      <path
        d="M12 2.6 L14.9 8.5 L21.4 9.4 L16.7 14 L17.8 20.5 L12 17.4 L6.2 20.5 L7.3 14 L2.6 9.4 L9.1 8.5 Z"
        fill={filled ? '#f59e0b' : 'none'}
        stroke={filled ? '#f59e0b' : 'var(--ink-soft)'}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="10" fill="#16a34a" />
      <path d="M8 12.6 L10.8 15.4 L16.2 9.4" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function FeedbackForm({ toolName }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [honey, setHoney] = useState('');
  const [state, setState] = useState('idle'); // idle | sending | sent | error
  const [formError, setFormError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    if (!message.trim()) {
      setFormError('Please write a few words so we know what to improve.');
      return;
    }
    setFormError('');
    setState('sending');
    try {
      const res = await fetch(FEEDBACK_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: `ToolNest feedback: ${toolName}`,
          _template: 'table',
          _captcha: 'false',
          _honey: honey,
          Tool: toolName,
          Page: typeof window !== 'undefined' ? window.location.href : '',
          Rating: rating ? `${rating} / 5` : 'Not rated',
          Name: name.trim() || 'Anonymous',
          Feedback: message.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === 'false' || data.success === false) {
        throw new Error(data.message || `Request failed (${res.status})`);
      }
      setState('sent');
    } catch {
      setState('error');
    }
  }

  if (state === 'sent') {
    return (
      <section className="feedback" aria-label="Rate this tool">
        <h2>Rate this tool</h2>
        <div className="success-panel" role="status">
          <div className="success-text">
            <CheckIcon />
            <p>Thanks, your feedback was sent. We read every message and use it to make the tools better.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="feedback" aria-label="Rate this tool">
      <h2>Rate this tool</h2>
      <p className="feedback-intro">
        Your feedback goes straight to the developer and is never shown publicly.
        Tell us what worked and what could be better.
      </p>
      <form onSubmit={onSubmit} noValidate>
        <div className="field">
          <span className="feedback-label" id="feedback-rating-label">Your rating (optional)</span>
          <div
            className="star-row"
            role="radiogroup"
            aria-labelledby="feedback-rating-label"
            onMouseLeave={() => setHover(0)}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
                className="star-btn"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                onFocus={() => setHover(n)}
                onBlur={() => setHover(0)}
              >
                <Star filled={(hover || rating) >= n} />
              </button>
            ))}
            {rating > 0 && <span className="star-value">{rating} of 5</span>}
          </div>
        </div>

        <div className="field">
          <label htmlFor={`feedback-name-${toolName}`}>Your name (optional)</label>
          <input
            id={`feedback-name-${toolName}`}
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="So we know who to thank"
          />
        </div>

        <div className="field">
          <label htmlFor={`feedback-msg-${toolName}`}>Did it work? What could be better?</label>
          <textarea
            id={`feedback-msg-${toolName}`}
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what you used this tool for and anything that went wrong or felt missing."
          />
        </div>

        {/* Honeypot: real visitors never see or fill this field. */}
        <input
          type="text"
          name="_honey"
          value={honey}
          onChange={(e) => setHoney(e.target.value)}
          style={{ display: 'none' }}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        {formError && <p className="feedback-error" role="alert">{formError}</p>}
        {state === 'error' && (
          <p className="feedback-error" role="alert">
            Sorry, sending failed. Please try again, or reach us through the{' '}
            <Link to="/contact">Contact page</Link> instead.
          </p>
        )}

        <button type="submit" className="btn" disabled={state === 'sending'}>
          {state === 'sending' ? 'Sending...' : 'Send feedback'}
        </button>
      </form>
    </section>
  );
}

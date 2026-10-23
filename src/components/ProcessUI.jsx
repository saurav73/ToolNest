import React from 'react';

/**
 * Shared processing UX for the file tools: an animated spinner state while
 * work runs, and a clear success panel with a prominent Download button
 * when it finishes. Processing is client-side and fast, so callers pair
 * this with holdAtLeast() from lib/files.js to keep the processing state
 * visible for a brief, honest moment (about 600 ms).
 */

export function Spinner({ accent = false }) {
  return <span className={`spinner${accent ? ' spinner-accent' : ''}`} aria-hidden="true" />;
}

export function ProcessingNote({ label }) {
  return (
    <div className="processing-note" role="status" aria-live="polite">
      <Spinner accent />
      <span>{label}</span>
    </div>
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

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" width="21" height="21" aria-hidden="true" focusable="false">
      <path d="M12 3.5 V15 M6.8 10.4 L12 15.6 L17.2 10.4 M4.5 20 H19.5" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SuccessDownload({ message, buttonLabel = 'Download', onDownload }) {
  return (
    <div className="success-panel" role="status">
      <div className="success-text">
        <CheckIcon />
        <p>{message}</p>
      </div>
      <button type="button" className="btn download-hero" onClick={onDownload}>
        <DownloadIcon />
        {buttonLabel}
      </button>
    </div>
  );
}

/** Content for a busy action button: spinner plus the working label. */
export function BusyLabel({ label, accent = false }) {
  return (
    <>
      <Spinner accent={accent} />
      {label}
    </>
  );
}

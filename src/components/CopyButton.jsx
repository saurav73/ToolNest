import React, { useState } from 'react';
import { copyText } from '../lib/text.js';

export default function CopyButton({ text, label = 'Copy result', className = 'btn' }) {
  const [copied, setCopied] = useState(false);
  const onClick = async () => {
    if (!text) return;
    const ok = await copyText(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };
  return (
    <button type="button" className={className} onClick={onClick} disabled={!text}>
      {copied ? 'Copied' : label}
    </button>
  );
}

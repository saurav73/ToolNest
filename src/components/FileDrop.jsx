import React, { useRef, useState } from 'react';

/**
 * File picker styled as a drop zone. Calls onFiles(File[]) on selection
 * or drop. Processing always stays in the browser.
 */
export default function FileDrop({ accept, multiple = false, onFiles, label }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handle = (list) => {
    const files = [...(list || [])];
    if (files.length) onFiles(multiple ? files : files.slice(0, 1));
  };

  return (
    <div
      className={`dropzone${dragging ? ' dragging' : ''}`}
      role="button"
      tabIndex={0}
      aria-label={label || 'Choose a file'}
      onClick={() => inputRef.current && inputRef.current.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          inputRef.current && inputRef.current.click();
        }
      }}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handle(e.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={(e) => { handle(e.target.files); e.target.value = ''; }}
      />
      <p className="dz-title">{label || 'Drop a file here, or click to choose one'}</p>
      <p className="dz-sub">Your file never leaves this browser tab. Nothing is uploaded.</p>
    </div>
  );
}

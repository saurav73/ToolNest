import React, { useEffect, useMemo, useState } from 'react';
import ToolLayout from '../../components/ToolLayout.jsx';
import { downloadBlob, holdAtLeast } from '../../lib/files.js';
import { ProcessingNote, BusyLabel } from '../../components/ProcessUI.jsx';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'NPR', 'AUD', 'CAD', 'JPY', 'AED', 'SGD'];

function fmtMoney(n, currency) {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n || 0);
  } catch {
    return `${currency} ${(n || 0).toFixed(2)}`;
  }
}

/** pdf-lib standard fonts only cover Latin-1; strip anything else for PDF text. */
function pdfSafe(s) {
  return String(s || '').replace(/[^\x20-\x7E\n]/g, '');
}

function pdfMoney(n, currency) {
  const v = (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${currency} ${v}`;
}

function niceDate(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

let rowSeq = 0;
const newRow = () => ({ id: (rowSeq += 1), desc: '', qty: 1, rate: 0 });

const FAQS = [
  {
    q: 'Is this invoice generator really free, with no sign-up?',
    a: 'Yes. The whole tool runs in your browser: fill the form, watch the preview update, and download a proper PDF invoice. There is no account, no watermark, no trial and no limit on how many invoices you make. The business details you type never leave your device.',
  },
  {
    q: 'Where is my invoice data stored?',
    a: 'Nowhere but this browser tab. There is no server behind the tool, so your client names, prices and totals are not uploaded, saved or analysed. If you refresh the page the form resets, which is the honest trade for total privacy; download the PDF as your copy.',
  },
  {
    q: 'Can I add my logo and tax?',
    a: 'Yes. Upload a PNG or JPG logo and it appears at the top of the preview and the PDF. Set a tax percentage (VAT, GST or sales tax, whatever you call it) and an optional discount percentage, and the totals update live with the arithmetic shown line by line.',
  },
  {
    q: 'What currencies are supported?',
    a: 'USD by default, plus EUR, GBP, INR, NPR, AUD, CAD, JPY, AED and SGD. The on screen preview formats amounts with the proper currency symbol, and the PDF prints the currency code with the amount so it prints correctly on any system.',
  },
];

const CONTENT = (
  <>
    <h2>A professional invoice without the account, the fee or the upload</h2>
    <p>
      Freelancers and small businesses send the same document over and over:
      who you are, who owes you, what for, how much, by when. The invoicing
      platforms that dominate search results wrap that simple document in
      sign-ups, trials, watermarks and per month fees, and they store your
      client list and your rates on their servers as the price of admission.
      This generator takes the other route. It is a form and a live preview
      in your browser: type your details, add your items, set tax if you
      charge it, and download a clean, properly laid out PDF invoice. No
      account. No watermark. Your prices and your clients never leave your
      device, because there is no server for them to leave to.
    </p>
    <h2>How to make an invoice</h2>
    <p>
      Start at the top: your business name and contact details, and a logo
      if you have one, PNG or JPG. Then the client you are billing. The
      invoice number is yours to control, so keep a simple sequence your
      records can follow; the issue date defaults to today and the due date
      two weeks later, and both are yours to change. Add one row per item
      with a clear description, quantity and rate: "Website design, homepage"
      beats "work" when a client or an accountant reads it later. Set the
      tax percentage if you charge tax, and a discount percentage if you are
      offering one. The totals compute live and the preview below the form
      is the invoice itself. Download the PDF to send, or print straight
      from the preview.
    </p>
    <h2>What a good invoice always includes</h2>
    <ul>
      <li><strong>Both parties, unambiguously:</strong> your legal business name and contact details, and the client's, so there is never a question of who owes whom.</li>
      <li><strong>A unique invoice number and dates:</strong> the number makes the invoice findable in both parties' records; the issue and due dates make the payment terms real.</li>
      <li><strong>Itemised work:</strong> one line per deliverable with quantity and rate, so the client can see exactly what the total is made of.</li>
      <li><strong>Tax shown separately:</strong> if you charge VAT, GST or sales tax, show the rate and the amount as their own line; accountants on both sides will thank you.</li>
      <li><strong>A total that needs no arithmetic:</strong> subtotal, discount, tax and the final amount due, in that order, impossible to misread.</li>
    </ul>
    <h2>How the PDF is built</h2>
    <p>
      When you press Download PDF, the tool builds the document with pdf-lib,
      the same library behind this site's other PDF tools, directly in your
      browser. The invoice is drawn as real text and lines on an A4 page, not
      a screenshot of the preview, so the file stays tiny, the text stays
      selectable in any PDF reader, and it prints sharply at any size. Your
      logo is embedded as an image at the top. Long item lists flow onto a
      second page automatically with the table header repeated, and the
      totals always sit under the final row. Because generation is local,
      the tenth invoice of the month is exactly as private as the first, and
      there is nothing to log into on a deadline day.
    </p>
    <h2>Tips for getting paid on time</h2>
    <ul>
      <li><strong>Send the invoice the day the work lands.</strong> Invoices sent immediately are paid measurably faster than ones batched at month end; the job is fresh and the budget holder remembers approving it.</li>
      <li><strong>Match the client's purchase order wording.</strong> If they gave you a PO number or a project name, put it in the notes. Accounts payable teams pay the invoices they can match without emailing you.</li>
      <li><strong>Keep numbering boring and sequential.</strong> INV-0001, INV-0002. Gaps invite questions in an audit; a clean sequence reads as a clean business.</li>
      <li><strong>Say how to pay in the notes.</strong> Bank details or a payment link in the notes field removes the most common reason invoices sit unpaid: the client meant to ask.</li>
      <li><strong>Download and file every PDF.</strong> The form resets on refresh by design, so the downloaded PDF is your record. Keep a folder per year and tax season becomes a filing exercise, not an archaeology dig.</li>
    </ul>
    <h2>A worked example</h2>
    <p>
      A freelance designer finishes a homepage project: design at 1 item of
      900 dollars, two revision rounds at 75 each, and a rush fee waived as
      a 5 percent goodwill discount. She enters the three lines, sets the
      discount to 5 percent and her local tax to 13 percent, and watches the
      preview do the arithmetic: subtotal 1,050, discount 52.50, tax on the
      reduced amount, and a final total she can defend line by line. The
      PDF is in the client's inbox two minutes after the work was approved,
      with her logo at the top and her bank details in the notes.
    </p>
  </>
);

export default function InvoiceGenerator() {
  const [bizName, setBizName] = useState('');
  const [bizEmail, setBizEmail] = useState('');
  const [bizAddress, setBizAddress] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [number, setNumber] = useState('INV-0001');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [items, setItems] = useState([newRow(), newRow()]);
  const [taxPct, setTaxPct] = useState(0);
  const [discountPct, setDiscountPct] = useState(0);
  const [notes, setNotes] = useState('');
  const [logo, setLogo] = useState(null); // {dataUrl, kind: 'png'|'jpg'}
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const today = new Date();
    const iso = (d) => d.toISOString().slice(0, 10);
    setIssueDate(iso(today));
    const due = new Date(today);
    due.setDate(due.getDate() + 14);
    setDueDate(iso(due));
  }, []);

  const totals = useMemo(() => {
    const subtotal = items.reduce((s, r) => s + (Number(r.qty) || 0) * (Number(r.rate) || 0), 0);
    const discount = subtotal * ((Number(discountPct) || 0) / 100);
    const taxable = subtotal - discount;
    const tax = taxable * ((Number(taxPct) || 0) / 100);
    return { subtotal, discount, taxable, tax, total: taxable + tax };
  }, [items, taxPct, discountPct]);

  const setRow = (id, key, value) => setItems((rows) => rows.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
  const addRow = () => setItems((rows) => [...rows, newRow()]);
  const removeRow = (id) => setItems((rows) => (rows.length > 1 ? rows.filter((r) => r.id !== id) : rows));

  const onLogo = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      setLogo({ dataUrl: String(reader.result), kind: f.type === 'image/png' ? 'png' : 'jpg' });
    };
    reader.readAsDataURL(f);
    e.target.value = '';
  };

  const downloadPdf = async () => {
    const started = Date.now();
    setBusy(true);
    setDone(false);
    try {
      const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
      const doc = await PDFDocument.create();
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const bold = await doc.embedFont(StandardFonts.HelveticaBold);
      const ink = rgb(0.11, 0.14, 0.2);
      const gray = rgb(0.38, 0.42, 0.48);
      const accent = rgb(0.31, 0.27, 0.9);
      const PAGE_W = 595.28;
      const PAGE_H = 841.89;
      const M = 50;
      const RIGHT = PAGE_W - M;
      let page = doc.addPage([PAGE_W, PAGE_H]);
      let y = PAGE_H - 56;

      const text = (s, x, yy, size, fnt, color) => {
        page.drawText(pdfSafe(s), { x, y: yy, size, font: fnt, color: color || ink });
      };
      const rightText = (s, right, yy, size, fnt, color) => {
        const clean = pdfSafe(s);
        const w = fnt.widthOfTextAtSize(clean, size);
        page.drawText(clean, { x: right - w, y: yy, size, font: fnt, color: color || ink });
      };
      const wrap = (s, maxWidth, size, fnt) => {
        const words = String(s || '').split(/\s+/).filter(Boolean);
        const lines = [];
        let line = '';
        for (const word of words) {
          const trial = line ? `${line} ${word}` : word;
          if (fnt.widthOfTextAtSize(trial, size) > maxWidth && line) { lines.push(line); line = word; }
          else line = trial;
        }
        if (line) lines.push(line);
        return lines;
      };

      /* header */
      let headX = M;
      if (logo) {
        try {
          const bytes = Uint8Array.from(atob(logo.dataUrl.split(',')[1]), (c) => c.charCodeAt(0));
          const img = logo.kind === 'png' ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
          const maxW = 130;
          const maxH = 52;
          const sc = Math.min(maxW / img.width, maxH / img.height, 1);
          page.drawImage(img, { x: M, y: y - img.height * sc + 14, width: img.width * sc, height: img.height * sc });
          headX = M + img.width * sc + 16;
        } catch { /* logo is decorative; carry on without it */ }
      }
      text(bizName || 'Your Business', headX, y, 16, bold);
      const contact = [bizEmail, bizAddress].filter(Boolean).join('  |  ');
      if (contact) { y -= 16; wrap(contact, RIGHT - headX, 9, font).slice(0, 2).forEach((ln) => { text(ln, headX, y, 9, font, gray); y -= 12; }); }
      rightText('INVOICE', RIGHT, PAGE_H - 56, 24, bold, accent);
      rightText(`Invoice no: ${number || ''}`, RIGHT, PAGE_H - 86, 10, font, gray);
      rightText(`Issued: ${niceDate(issueDate)}`, RIGHT, PAGE_H - 100, 10, font, gray);
      rightText(`Due: ${niceDate(dueDate)}`, RIGHT, PAGE_H - 114, 10, font, gray);

      y = Math.min(y - 18, PAGE_H - 146);
      page.drawLine({ start: { x: M, y }, end: { x: RIGHT, y }, thickness: 1, color: accent });
      y -= 26;

      /* bill to */
      text('BILL TO', M, y, 9.5, bold, gray);
      y -= 15;
      text(clientName || 'Client name', M, y, 12, bold);
      const meta = [clientEmail, clientAddress].filter(Boolean);
      meta.forEach((line) => {
        wrap(line, 260, 9.5, font).forEach((ln) => { y -= 13; text(ln, M, y, 9.5, font, gray); });
      });
      y -= 28;

      /* items table */
      const colDesc = M;
      const colQtyR = 372;
      const colRateR = 458;
      const colAmtR = RIGHT;
      const drawHeader = () => {
        page.drawRectangle({ x: M, y: y - 4, width: RIGHT - M, height: 19, color: rgb(0.93, 0.94, 0.97) });
        text('Description', colDesc + 6, y, 9.5, bold, gray);
        rightText('Qty', colQtyR, y, 9.5, bold, gray);
        rightText('Rate', colRateR, y, 9.5, bold, gray);
        rightText('Amount', colAmtR - 4, y, 9.5, bold, gray);
        y -= 20;
      };
      drawHeader();
      const rows = items.filter((r) => r.desc || Number(r.rate) > 0 || Number(r.qty) > 0);
      (rows.length ? rows : [{ desc: '', qty: 0, rate: 0 }]).forEach((r) => {
        if (y < 170) {
          page = doc.addPage([PAGE_W, PAGE_H]);
          y = PAGE_H - 60;
          drawHeader();
        }
        const amt = (Number(r.qty) || 0) * (Number(r.rate) || 0);
        const descLines = wrap(r.desc || '', 300, 10, font).slice(0, 2);
        (descLines.length ? descLines : ['']).forEach((ln, i) => {
          text(ln, colDesc + 6, y - i * 12, 10, font);
        });
        rightText(String(Number(r.qty) || 0), colQtyR, y, 10, font);
        rightText(pdfMoney(Number(r.rate) || 0, currency), colRateR, y, 10, font);
        rightText(pdfMoney(amt, currency), colAmtR - 4, y, 10, font);
        y -= Math.max(18, descLines.length * 12 + 4);
      });

      y -= 6;
      page.drawLine({ start: { x: M, y }, end: { x: RIGHT, y }, thickness: 0.75, color: rgb(0.85, 0.87, 0.92) });
      y -= 22;

      /* totals */
      const totX = 372;
      const totRow = (label, value, isBold, size) => {
        text(label, totX, y, size || 10.5, isBold ? bold : font, isBold ? ink : gray);
        rightText(value, RIGHT, y, size || 10.5, isBold ? bold : font);
        y -= (size || 10.5) + 8;
      };
      totRow('Subtotal', pdfMoney(totals.subtotal, currency));
      if (totals.discount > 0) totRow(`Discount (${Number(discountPct) || 0}%)`, `-${pdfMoney(totals.discount, currency)}`);
      if (totals.tax > 0) totRow(`Tax (${Number(taxPct) || 0}%)`, pdfMoney(totals.tax, currency));
      page.drawLine({ start: { x: totX, y: y + 6 }, end: { x: RIGHT, y: y + 6 }, thickness: 1, color: accent });
      totRow('Total due', pdfMoney(totals.total, currency), true, 13);

      /* notes */
      if (notes) {
        y -= 12;
        if (y < 110) { page = doc.addPage([PAGE_W, PAGE_H]); y = PAGE_H - 60; }
        text('Notes', M, y, 10.5, bold);
        wrap(notes, RIGHT - M, 9.5, font).slice(0, 8).forEach((ln) => { y -= 13; text(ln, M, y, 9.5, font, gray); });
      }

      text('Generated with ToolNest, the free in-browser invoice generator.', M, 30, 8, font, gray);

      const bytes = await doc.save();
      await holdAtLeast(started);
      downloadBlob(new Blob([bytes], { type: 'application/pdf' }), `${(number || 'invoice').replace(/[^\w-]+/g, '-')}.pdf`);
      setDone(true);
    } catch (e) {
      setDone(false);
    }
    setBusy(false);
  };

  return (
    <ToolLayout
      slug="invoice-generator"
      path="/invoice-generator"
      title="Invoice Generator Free: Create PDF Invoices | ToolNest"
      description="Create professional PDF invoices free in your browser. Add items, tax and a logo, then download or print. No sign-up, nothing stored."
      h1="Invoice Generator"
      intro="Create a clean, professional PDF invoice in your browser: your details, your client, itemised work, tax and totals, computed live. No sign-up, no watermark, and your data never leaves your device."
      faqs={FAQS}
      content={CONTENT}
    >
      <div className="no-print">
        <div className="row">
          <div className="field">
            <label htmlFor="inv-biz">Your business name</label>
            <input id="inv-biz" type="text" value={bizName} onChange={(e) => setBizName(e.target.value)} placeholder="e.g. Sunrise Design Studio" />
          </div>
          <div className="field">
            <label htmlFor="inv-bizemail">Your email</label>
            <input id="inv-bizemail" type="email" value={bizEmail} onChange={(e) => setBizEmail(e.target.value)} placeholder="you@business.com" />
          </div>
        </div>
        <div className="field">
          <label htmlFor="inv-bizaddr">Your address (optional)</label>
          <input id="inv-bizaddr" type="text" value={bizAddress} onChange={(e) => setBizAddress(e.target.value)} placeholder="Street, city, country" />
        </div>
        <div className="row">
          <div className="field">
            <label htmlFor="inv-logo">Logo (optional, PNG or JPG)</label>
            <input id="inv-logo" type="file" accept="image/png,image/jpeg" onChange={onLogo} />
            {logo && <p className="hint">Logo added. <button type="button" className="link-btn" onClick={() => setLogo(null)}>Remove</button></p>}
          </div>
          <div className="field">
            <label htmlFor="inv-currency">Currency</label>
            <select id="inv-currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="row">
          <div className="field">
            <label htmlFor="inv-client">Client name</label>
            <input id="inv-client" type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Client or company name" />
          </div>
          <div className="field">
            <label htmlFor="inv-clientemail">Client email</label>
            <input id="inv-clientemail" type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="client@company.com" />
          </div>
        </div>
        <div className="field">
          <label htmlFor="inv-clientaddr">Client address (optional)</label>
          <input id="inv-clientaddr" type="text" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} placeholder="Street, city, country" />
        </div>

        <div className="row">
          <div className="field">
            <label htmlFor="inv-number">Invoice number</label>
            <input id="inv-number" type="text" value={number} onChange={(e) => setNumber(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="inv-issue">Issue date</label>
            <input id="inv-issue" type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="inv-due">Due date</label>
            <input id="inv-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label>Items</label>
          <div className="inv-row inv-head" aria-hidden="true">
            <span className="inv-desc">Description</span><span className="inv-qty">Qty</span><span className="inv-rate">Rate</span><span className="inv-amt">Amount</span><span className="inv-del" />
          </div>
          {items.map((r) => (
            <div className="inv-row" key={r.id}>
              <input type="text" className="inv-desc" placeholder="Description of work or item" value={r.desc} onChange={(e) => setRow(r.id, 'desc', e.target.value)} aria-label="Item description" />
              <input type="number" className="inv-qty" min="0" step="any" value={r.qty} onChange={(e) => setRow(r.id, 'qty', e.target.value)} aria-label="Quantity" placeholder="Qty" />
              <input type="number" className="inv-rate" min="0" step="any" value={r.rate} onChange={(e) => setRow(r.id, 'rate', e.target.value)} aria-label="Rate" placeholder="Rate" />
              <span className="inv-amt">{fmtMoney((Number(r.qty) || 0) * (Number(r.rate) || 0), currency)}</span>
              <button type="button" className="btn ghost inv-del" onClick={() => removeRow(r.id)} aria-label="Remove item">Remove</button>
            </div>
          ))}
          <button type="button" className="btn secondary" onClick={addRow} style={{ marginTop: 6 }}>Add item</button>
        </div>

        <div className="row">
          <div className="field">
            <label htmlFor="inv-discount">Discount % (optional)</label>
            <input id="inv-discount" type="number" min="0" max="100" step="any" value={discountPct} onChange={(e) => setDiscountPct(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="inv-tax">Tax % (VAT / GST / sales tax)</label>
            <input id="inv-tax" type="number" min="0" max="100" step="any" value={taxPct} onChange={(e) => setTaxPct(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="inv-notes">Notes (payment details, terms, thank you)</label>
          <textarea id="inv-notes" rows={3} style={{ minHeight: 76 }} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Please pay by bank transfer to account ..." />
        </div>

        <div className="btn-row">
          <button type="button" className="btn" onClick={downloadPdf} disabled={busy}>
            {busy ? <BusyLabel label="Building your invoice PDF..." /> : 'Download PDF invoice'}
          </button>
          <button type="button" className="btn secondary" onClick={() => window.print()}>Print invoice</button>
        </div>
        {busy && <ProcessingNote label="Building your invoice PDF on your device..." />}
        {done && !busy && <div className="message ok">Your invoice PDF has been created and downloaded. Check it once before sending, and keep a copy for your records.</div>}
      </div>

      <h2 className="no-print" style={{ marginTop: 28 }}>Live preview</h2>
      <div className="invoice-sheet" aria-label="Invoice preview">
        <div className="inv-sheet-head">
          <div>
            {logo && <img src={logo.dataUrl} alt="" className="inv-sheet-logo" />}
            <div className="inv-sheet-biz">{bizName || 'Your Business'}</div>
            <div className="inv-sheet-sub">{[bizEmail, bizAddress].filter(Boolean).join('  |  ')}</div>
          </div>
          <div className="inv-sheet-meta">
            <div className="inv-sheet-title">INVOICE</div>
            <div>Invoice no: {number}</div>
            <div>Issued: {niceDate(issueDate)}</div>
            <div>Due: {niceDate(dueDate)}</div>
          </div>
        </div>
        <div className="inv-sheet-bill">
          <div className="inv-sheet-label">Bill to</div>
          <div className="inv-sheet-client">{clientName || 'Client name'}</div>
          <div className="inv-sheet-sub">{[clientEmail, clientAddress].filter(Boolean).join('  |  ')}</div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Description</th><th style={{ textAlign: 'right' }}>Qty</th><th style={{ textAlign: 'right' }}>Rate</th><th style={{ textAlign: 'right' }}>Amount</th></tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id}>
                  <td>{r.desc || '...'}</td>
                  <td style={{ textAlign: 'right' }}>{Number(r.qty) || 0}</td>
                  <td style={{ textAlign: 'right' }}>{fmtMoney(Number(r.rate) || 0, currency)}</td>
                  <td style={{ textAlign: 'right' }}>{fmtMoney((Number(r.qty) || 0) * (Number(r.rate) || 0), currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="inv-totals">
          <div><span>Subtotal</span><span>{fmtMoney(totals.subtotal, currency)}</span></div>
          {totals.discount > 0 && <div><span>Discount ({Number(discountPct) || 0}%)</span><span>-{fmtMoney(totals.discount, currency)}</span></div>}
          {totals.tax > 0 && <div><span>Tax ({Number(taxPct) || 0}%)</span><span>{fmtMoney(totals.tax, currency)}</span></div>}
          <div className="inv-grand"><span>Total due</span><span>{fmtMoney(totals.total, currency)}</span></div>
        </div>
        {notes && <div className="inv-sheet-notes"><div className="inv-sheet-label">Notes</div><p>{notes}</p></div>}
      </div>
    </ToolLayout>
  );
}

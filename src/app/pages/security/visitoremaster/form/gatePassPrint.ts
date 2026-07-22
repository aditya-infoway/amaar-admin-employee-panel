import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QRCodeSVG } from "qrcode.react";

import { VisitorEntry } from "../data";

function getQrMarkup(value: string) {
  return renderToStaticMarkup(
    createElement(QRCodeSVG, { value, size: 140, marginSize: 1 }),
  );
}

export function printGatePass(visitor: VisitorEntry) {
  const qrSvg = getQrMarkup(visitor.gatePassNumber);

  // ✅ NEW — Visitor Photo block (agar photo nahi hai to placeholder)
  const photoBlock = visitor.visitorPhoto
    ? `<img src="${visitor.visitorPhoto}" class="visitor-photo" />`
    : `<div class="photo-placeholder">No Photo</div>`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Gate Pass - ${visitor.gatePassNumber}</title>
        <style>
          * { box-sizing: border-box; font-family: Arial, Helvetica, sans-serif; }
          body { margin: 0; padding: 24px; }
          .pass {
            width: 380px;
            border: 2px solid #1f2937;
            border-radius: 10px;
            padding: 20px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #1f2937;
            padding-bottom: 10px;
            margin-bottom: 14px;
          }
          .header h1 { margin: 0; font-size: 18px; letter-spacing: 1px; }
          .header p { margin: 2px 0 0; font-size: 11px; color: #6b7280; }

          /* ✅ NEW — row: photo left, QR right */
          .qr-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
            margin-bottom: 14px;
          }
          .qr-row > div { text-align: center; }
          .visitor-photo {
            width: 120px;
            height: 120px;
            object-fit: cover;
            border-radius: 8px;
            border: 1px solid #d1d5db;
          }
          .photo-placeholder {
            width: 120px;
            height: 120px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px dashed #d1d5db;
            border-radius: 8px;
            font-size: 11px;
            color: #9ca3af;
          }
          .qr-label {
            margin-top: 4px;
            font-size: 10px;
            color: #9ca3af;
          }

          .row {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            padding: 5px 0;
            border-bottom: 1px dashed #e5e7eb;
          }
          .row span:first-child { color: #6b7280; }
          .row span:last-child { font-weight: 600; }
          .badge {
            text-align: center;
            margin-top: 14px;
            font-size: 12px;
            color: #9ca3af;
          }
        </style>
      </head>
      <body>
        <div class="pass">
          <div class="header">
            <h1>VISITOR GATE PASS</h1>
            <p>Gate Pass No: ${visitor.gatePassNumber}</p>
          </div>

          <div class="qr-row">
            <div>
              ${photoBlock}
              <div class="qr-label">Visitor Photo</div>
            </div>
            <div>
              ${qrSvg}
              <div class="qr-label">Scan QR</div>
            </div>
          </div>

          <div class="row"><span>Visitor Name</span><span>${visitor.fullName}</span></div>
          <div class="row"><span>Badge Number</span><span>${visitor.badgeNumber}</span></div>
          <div class="row"><span>Gate Number</span><span>${visitor.gate || "—"}</span></div>
          <div class="row"><span>Security Guard</span><span>${visitor.securityGuard || "—"}</span></div>
          <div class="row"><span>Entry Time</span><span>${visitor.checkInTime ? new Date(visitor.checkInTime).toLocaleString() : "—"}</span></div>
          <div class="row"><span>Exit Time</span><span>${visitor.checkOutTime ? new Date(visitor.checkOutTime).toLocaleString() : "Pending"}</span></div>
          <div class="row"><span>Status</span><span>${visitor.status}</span></div>
          <div class="badge">Issued ${new Date(visitor.gatePassIssuedAt).toLocaleString()}</div>
        </div>
        <script>window.onload = () => window.print();</script>
      </body>
    </html>
  `;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}
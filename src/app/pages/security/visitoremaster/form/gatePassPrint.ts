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
          .qr { text-align: center; margin-bottom: 14px; }
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
          <div class="qr">${qrSvg}</div>
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

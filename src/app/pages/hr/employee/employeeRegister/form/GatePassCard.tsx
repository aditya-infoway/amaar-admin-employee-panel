import { QRCodeSVG } from "qrcode.react";

import { Card } from "@/components/ui";
import { VisitorEntry } from "../data";

export function GatePassCard({ visitor }: { visitor: VisitorEntry }) {
  return (
    <Card className="mx-auto max-w-sm space-y-3 p-5 text-center">
      <h3 className="text-sm font-bold tracking-wide text-primary">
        VISITOR GATE PASS
      </h3>
      <p className="text-xs text-gray-500">{visitor.gatePassNumber}</p>

      {/* ✅ NEW — same row: left Visitor Photo, right QR Code */}
      <div className="flex items-start justify-center gap-6">
        <div className="flex flex-col items-center gap-1">
          {visitor.visitorPhoto ? (
            <img
              src={visitor.visitorPhoto}
              alt="Visitor"
              className="h-[140px] w-[140px] rounded-lg border border-gray-200 object-cover"
            />
          ) : (
            <div className="flex h-[140px] w-[140px] items-center justify-center rounded-lg border border-dashed border-gray-300 text-xs text-gray-400">
              No Photo
            </div>
          )}
          <span className="text-[10px] text-gray-400">Visitor Photo</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <QRCodeSVG value={visitor.gatePassNumber} size={140} />
          <span className="text-[10px] text-gray-400">Scan QR</span>
        </div>
      </div>

      <div className="space-y-1 text-left text-sm">
        <div className="flex justify-between border-b border-dashed border-gray-200 py-1">
          <span className="text-gray-500">Visitor</span>
          <span className="font-medium">{visitor.fullName}</span>
        </div>
        <div className="flex justify-between border-b border-dashed border-gray-200 py-1">
          <span className="text-gray-500">Badge No.</span>
          <span className="font-medium">{visitor.badgeNumber}</span>
        </div>
        <div className="flex justify-between border-b border-dashed border-gray-200 py-1">
          <span className="text-gray-500">Gate</span>
          <span className="font-medium">{visitor.gate || "—"}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-gray-500">Status</span>
          <span className="font-medium">{visitor.status}</span>
        </div>
      </div>
    </Card>
  );
}
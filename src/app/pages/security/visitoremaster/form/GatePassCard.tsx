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
      <div className="flex justify-center">
        <QRCodeSVG value={visitor.gatePassNumber} size={140} />
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
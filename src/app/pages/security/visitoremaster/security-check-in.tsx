import { useState } from "react";

import { Page } from "@/components/shared/Page";
import { Button, Card, Input } from "@/components/ui";
import { visitorStorage } from "../../master/shared/storage";
import {
  generateBadgeNumber,
  generateGatePassNumber,
  generateTokenNumber,
  VisitorEntry,
} from "./data";
import { printGatePass } from "./form/gatePassPrint";

export default function SecurityCheckInPage() {
  const [data, setData] = useState<VisitorEntry[]>(() =>
    visitorStorage.getItems(),
  );
  const [otpInput, setOtpInput] = useState<Record<string, string>>({});
  const [errorId, setErrorId] = useState<string | null>(null);

  const awaitingOtp = data.filter(
    (v) => v.approvalStatus === "approved" && !v.otpVerified,
  );

  const persist = (next: VisitorEntry[]) => {
    setData(next);
    visitorStorage.saveItems(next);
  };

  const handleVerify = (visitor: VisitorEntry) => {
    const entered = otpInput[visitor.id] || "";
    if (entered !== visitor.otp) {
      setErrorId(visitor.id);
      return;
    }
    setErrorId(null);

    const updated: VisitorEntry = {
      ...visitor,
      otpVerified: true,
      status: "IN",
      checkInTime: new Date().toISOString(),
      badgeNumber: generateBadgeNumber(),
      tokenNumber: generateTokenNumber(),
      gatePassNumber: generateGatePassNumber(),
      gatePassIssuedAt: new Date().toISOString(),
    };

    persist(data.map((item) => (item.id === visitor.id ? updated : item)));
    printGatePass(updated);
  };

  return (
    <Page title="Security Check-In">
      <div className="transition-content w-full px-(--margin-x) pb-8">
        <h2 className="dark:text-dark-50 border-b-4 border-primary py-5 text-xl font-bold tracking-wide text-primary lg:py-6 lg:text-2xl">
          Security Check-In · Verify OTP
        </h2>

        <div className="space-y-4 pt-2">
          {awaitingOtp.length === 0 && (
            <p className="text-sm text-gray-400">
              No approved visitors waiting to check in.
            </p>
          )}
          {awaitingOtp.map((visitor) => (
            <Card
              key={visitor.id}
              className="flex flex-wrap items-center justify-between gap-4 p-4"
            >
              <div>
                <p className="font-medium text-gray-800 dark:text-dark-100">
                  {visitor.fullName}
                </p>
                <p className="text-xs text-gray-500">
                  To meet: {visitor.personToMeet} · Approved by{" "}
                  {visitor.approvedBy}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Enter OTP"
                  maxLength={6}
                  value={otpInput[visitor.id] || ""}
                  onChange={(e) =>
                    setOtpInput((prev) => ({
                      ...prev,
                      [visitor.id]: e.target.value,
                    }))
                  }
                  error={
                    errorId === visitor.id ? "Incorrect OTP" : undefined
                  }
                  className="w-32"
                />
                <Button color="primary" onClick={() => handleVerify(visitor)}>
                  Verify & Check In
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Page>
  );
}

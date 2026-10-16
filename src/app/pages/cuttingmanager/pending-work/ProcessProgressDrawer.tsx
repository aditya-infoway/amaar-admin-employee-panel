import { Fragment, useMemo } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";

import { Button } from "@/components/ui";

export interface SubProcessStatus {
  id: number;
  subProcessId?: number | null;
  subProcessName: string;
  employeeName?: string;
  status: "Pending" | "In Progress" | "Completed" | string;
  startTime?: string | null;
  endTime?: string | null;
}

interface Props {
  isOpen: boolean;
  close: () => void;
  workOrderNo: string;
  processName: string;
  subProcesses: SubProcessStatus[];
}

const STATUS_STYLES: Record<string, string> = {
  Completed: "bg-emerald-500/15 text-emerald-500",
  "In Progress": "bg-sky-500/15 text-sky-500",
  Pending: "bg-amber-500/15 text-amber-500",
};

const formatDateTime = (value?: string | null) =>
  value
    ? `${new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })} ${new Date(value)
        .toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        .toLowerCase()}`
    : "-";

export default function ProcessProgressDrawer({
  isOpen,
  close,
  workOrderNo,
  processName,
  subProcesses,
}: Props) {
  const completedCount = useMemo(
    () => subProcesses.filter((s) => s.status === "Completed").length,
    [subProcesses],
  );

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-100" onClose={close}>
        <TransitionChild
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
        />

        <TransitionChild
          as={DialogPanel}
          enter="ease-out transform-gpu transition-transform duration-200"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="ease-in transform-gpu transition-transform duration-200"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
          className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full max-w-2xl flex-col bg-white"
        >
          {/* Header */}
          <div className="bg-primary-600 flex items-center justify-between border-b px-5 py-4">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {processName || "Process"} - Sub Process Status
              </h3>
              {workOrderNo && (
                <p className="mt-0.5 text-xs text-white/80">
                  Work Order: {workOrderNo}
                </p>
              )}
            </div>
            <Button
              onClick={close}
              variant="flat"
              isIcon
              className="size-6 rounded-full text-white"
            >
              <XMarkIcon className="size-4.5" />
            </Button>
          </div>

          {/* Body */}
          <div className="flex grow flex-col overflow-hidden">
            <div className="grow overflow-y-auto px-4 py-5 sm:px-6">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  {completedCount} / {subProcesses.length} completed
                </span>
              </div>

              <div className="dark:border-dark-500 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600">
                <table className="w-full text-left text-sm">
                  <thead className="dark:bg-dark-600 bg-gray-50">
                    <tr className="border-b border-gray-200 text-xs tracking-wide text-gray-500 uppercase dark:border-gray-600">
                      <th className="px-4 py-3">Sr. No.</th>
                      <th className="px-4 py-3">Sub Process</th>
                      <th className="px-4 py-3">Employee</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">End Time</th>
                    </tr>
                  </thead>

                  <tbody>
                    {subProcesses.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-10 text-center text-gray-400"
                        >
                          No sub process found.
                        </td>
                      </tr>
                    ) : (
                      subProcesses.map((s, index) => (
                        <tr
                          key={s.id}
                          className="border-b border-gray-100 last:border-0 dark:border-gray-700"
                        >
                          <td className="px-4 py-3">{index + 1}</td>
                          <td className="px-4 py-3 font-medium">
                            {s.subProcessName || "-"}
                          </td>
                          <td className="px-4 py-3">{s.employeeName || "-"}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${
                                STATUS_STYLES[s.status] || STATUS_STYLES.Pending
                              }`}
                            >
                              {s.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {s.status === "Completed"
                              ? formatDateTime(s.endTime)
                              : "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="dark:border-dark-500 flex justify-end border-t border-gray-200 px-4 py-4 sm:px-6">
              <Button type="button" onClick={close}>
                Close
              </Button>
            </div>
          </div>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
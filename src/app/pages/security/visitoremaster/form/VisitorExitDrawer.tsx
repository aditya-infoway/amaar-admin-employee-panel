import { Fragment, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/20/solid";

import { Listbox } from "@/components/shared/form/StyledListbox";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { Button, Switch, Textarea } from "@/components/ui";
import { Put, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";
import { gateOptions } from "../../../master/shared/constants";
import { VisitorEntry } from "../data";

interface VisitorExitDrawerProps {
  visitor: VisitorEntry | null;
  onClose: () => void;
  onSaved: () => void;
}

interface ExitFields {
  exitTime: string;
  exitGate: string;
  badgeReturned: boolean;
  exitRemarks: string;
}

function getDefaultExitFields(visitor: VisitorEntry | null): ExitFields {
  return {
    exitTime: new Date().toTimeString().slice(0, 5),
    exitGate: visitor?.gate || "",
    badgeReturned: false,
    exitRemarks: "",
  };
}

function formatCheckInTime(value: string): string {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
}

function formatItems(visitor: VisitorEntry): string {
  const items: string[] = [];
  if (visitor.laptop) items.push("Laptop");
  if (visitor.camera) items.push("Camera");
  if (visitor.bagChecked) items.push("Bag checked");
  if (visitor.otherItems) items.push(visitor.otherItems);
  return items.length > 0 ? items.join(", ") : "None";
}

export function VisitorExitDrawer({
  visitor,
  onClose,
  onSaved,
}: VisitorExitDrawerProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm<ExitFields>({
    defaultValues: getDefaultExitFields(visitor),
  });

  useEffect(() => {
    reset(getDefaultExitFields(visitor));
  }, [visitor, reset]);

  if (!visitor) return null;

  // ---- Exit API call ----
  const onSubmit = async (fields: ExitFields) => {
    try {
      const response = await Put(
        "employee/security/visitorentry/exit",
        {
          visitorEntryId: visitor.id,
          exitTime: fields.exitTime,
          exitGate: fields.exitGate,
          badgeReturned: fields.badgeReturned,
          exitRemarks: fields.exitRemarks,
        },
        false,
      );
      if (response.data?.success) {
        toastsuccessmsg(response.data?.message || "Visitor exit marked successfully.");
        reset();
        onSaved();
      } else {
        toasterrormsg(response.data?.message || "Failed to mark visitor exit.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while marking visitor exit.");
    }
  };

  return (
    <Transition appear show={Boolean(visitor)} as={Fragment}>
      <Dialog as="div" className="relative z-100" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 flex justify-end">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="ease-in duration-150"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="dark:bg-dark-750 flex h-full w-full max-w-xl flex-col overflow-y-auto bg-white shadow-2xl">
              <div className="dark:border-dark-500 flex items-center justify-between border-b border-gray-200 px-5 py-4">
                <div>
                  <Dialog.Title className="dark:text-dark-100 text-lg font-semibold text-gray-800">
                    Mark Visitor Exit
                  </Dialog.Title>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Verify the visitor and collect the gate pass before
                    checkout.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="size-5" />
                </button>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-1 flex-col justify-between"
              >
                <div className="space-y-6 p-5">
                  <div>
                    <h4 className="dark:text-dark-100 mb-2 text-sm font-medium text-gray-700">
                      Entry Details (verify before exit)
                    </h4>
                    <div className="dark:bg-dark-700 dark:border-dark-500 dark:bg-dark-700/70 grid gap-3 rounded-xl border border-gray-200 bg-gray-100/70 p-3 text-sm sm:grid-cols-2">
                      <div className="dark:bg-dark-600/60 flex min-w-0 flex-col gap-1 rounded-lg bg-white p-3 shadow-sm">
                        <span className="text-gray-500">Visitor Name</span>
                        <span className="font-medium">{visitor.fullName}</span>
                      </div>
                      <div className="dark:bg-dark-600/60 flex min-w-0 flex-col gap-1 rounded-lg bg-white p-3 shadow-sm">
                        <span className="text-gray-500">Visitor ID</span>
                        <span className="font-medium">{visitor.visitorId}</span>
                      </div>
                      <div className="dark:bg-dark-600/60 flex min-w-0 flex-col gap-1 rounded-lg bg-white p-3 shadow-sm">
                        <span className="text-gray-500">Mobile</span>
                        <span className="font-medium">
                          {visitor.mobileNumber}
                        </span>
                      </div>
                      <div className="dark:bg-dark-600/60 flex min-w-0 flex-col gap-1 rounded-lg bg-white p-3 shadow-sm">
                        <span className="text-gray-500">Person to Meet</span>
                        <span className="font-medium">
                          {visitor.personToMeet}
                        </span>
                      </div>
                      <div className="dark:bg-dark-600/60 flex min-w-0 flex-col gap-1 rounded-lg bg-white p-3 shadow-sm">
                        <span className="text-gray-500">Purpose</span>
                        <span className="font-medium">{visitor.purpose}</span>
                      </div>
                      <div className="dark:bg-dark-600/60 flex min-w-0 flex-col gap-1 rounded-lg bg-white p-3 shadow-sm">
                        <span className="text-gray-500">Badge #</span>
                        <span className="font-medium">
                          {visitor.badgeNumber || "—"}
                        </span>
                      </div>
                      <div className="dark:bg-dark-600/60 flex min-w-0 flex-col gap-1 rounded-lg bg-white p-3 shadow-sm">
                        <span className="text-gray-500">Gate Pass #</span>
                        <span className="font-medium">
                          {visitor.gatePassNumber || "—"}
                        </span>
                      </div>
                      <div className="dark:bg-dark-600/60 flex min-w-0 flex-col gap-1 rounded-lg bg-white p-3 shadow-sm">
                        <span className="text-gray-500">Check-in Time</span>
                        <span className="font-medium">
                          {formatCheckInTime(visitor.checkInTime)}
                        </span>
                      </div>
                      <div className="dark:bg-dark-600/60 flex min-w-0 flex-col gap-1 rounded-lg bg-white p-3 shadow-sm">
                        <span className="text-gray-500">Items Carried</span>
                        <span className="max-w-[55%] text-right font-medium">
                          {formatItems(visitor)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="dark:text-dark-100 text-sm font-medium text-gray-700">
                      Exit Details
                    </h4>
                    <Controller
                      control={control}
                      name="exitTime"
                      rules={{ required: "Exit time is required" }}
                      render={({ field: { value, onChange } }) => (
                        <DatePicker
                          label="Exit Time"
                          placeholder="Choose exit time..."
                          value={value}
                          onChange={(_dates, timeStr) => onChange(timeStr)}
                          options={{
                            enableTime: true,
                            noCalendar: true,
                            dateFormat: "H:i",
                            time_24hr: true,
                          }}
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name="exitGate"
                      rules={{ required: "Exit gate is required" }}
                      render={({ field: { value, onChange, ...rest } }) => (
                        <Listbox
                          data={gateOptions}
                          value={
                            gateOptions.find((item) => item.id === value) ||
                            null
                          }
                          onChange={(item) => onChange(item.id)}
                          label="Exit Gate"
                          placeholder="Select exit gate"
                          displayField="label"
                          {...rest}
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name="badgeReturned"
                      render={({ field: { value, onChange } }) => (
                        <Switch
                          checked={value}
                          onChange={(e) => onChange(e.target.checked)}
                          label="Badge / gate pass returned"
                        />
                      )}
                    />
                    <Textarea
                      {...register("exitRemarks")}
                      label="Exit Remarks"
                      placeholder="Optional notes"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="dark:border-dark-500 flex justify-end gap-3 border-t border-gray-200 p-4">
                  <Button type="button" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" color="primary" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Confirm Exit"}
                  </Button>
                </div>
              </form>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
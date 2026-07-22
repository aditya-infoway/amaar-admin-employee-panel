import { Fragment, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/20/solid";

import { PhotoUpload } from "@/components/shared/form/PhotoUpload";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { Button, Input, Switch } from "@/components/ui";
import { vehicleStorage } from "../../../master/shared/storage";
import { VehicleEntry } from "../data";

interface VehicleExitDrawerProps {
  vehicle: VehicleEntry | null;
  onClose: () => void;
  onSaved: (updated: VehicleEntry) => void;
}

interface ExitFields {
  exitTime: string;
  exitVehicleCondition: string;
  conditionChangedAtExit: boolean;
  exitPhotoFront: string;
  exitPhotoBack: string;
}

function getDefaultExitFields(vehicle: VehicleEntry | null): ExitFields {
  return {
    exitTime: new Date().toTimeString().slice(0, 5),
    exitVehicleCondition: vehicle?.vehicleCondition || "",
    conditionChangedAtExit: false,
    exitPhotoFront: "",
    exitPhotoBack: "",
  };
}

export function VehicleExitDrawer({
  vehicle,
  onClose,
  onSaved,
}: VehicleExitDrawerProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<ExitFields>({
    defaultValues: getDefaultExitFields(vehicle),
  });

  useEffect(() => {
    reset(getDefaultExitFields(vehicle));
  }, [vehicle, reset]);

  const conditionChanged = watch("conditionChangedAtExit");

  if (!vehicle) return null;

  const onSubmit = (fields: ExitFields) => {
    const items = vehicleStorage.getItems();
    const updated: VehicleEntry = {
      ...vehicle,
      status: "OUT",
      exitTime: fields.exitTime,
      exitVehicleCondition: fields.exitVehicleCondition,
      conditionChangedAtExit: fields.conditionChangedAtExit,
      exitPhotoFront: fields.conditionChangedAtExit
        ? fields.exitPhotoFront
        : "",
      exitPhotoBack: fields.conditionChangedAtExit ? fields.exitPhotoBack : "",
    };

    vehicleStorage.saveItems(
      items.map((row) => (row.id === updated.id ? updated : row)),
    );
    onSaved(updated);
    reset();
    onClose();
  };

  return (
    <Transition appear show={Boolean(vehicle)} as={Fragment}>
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
                    Mark Vehicle Exit
                  </Dialog.Title>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Confirm the entry record before allowing the vehicle out.
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
                        <span className="text-gray-500">Vehicle Number</span>
                        <span className="font-medium">
                          {vehicle.vehicleNumber}
                        </span>
                      </div>
                      <div className="dark:bg-dark-600/60 flex min-w-0 flex-col gap-1 rounded-lg bg-white p-3 shadow-sm">
                        <span className="text-gray-500">Driver</span>
                        <span className="font-medium">
                          {vehicle.driverName}
                        </span>
                      </div>
                      <div className="dark:bg-dark-600/60 flex min-w-0 flex-col gap-1 rounded-lg bg-white p-3 shadow-sm">
                        <span className="text-gray-500">Mobile</span>
                        <span className="font-medium">
                          {vehicle.mobileNumber}
                        </span>
                      </div>
                      <div className="dark:bg-dark-600/60 flex min-w-0 flex-col gap-1 rounded-lg bg-white p-3 shadow-sm">
                        <span className="text-gray-500">Purpose</span>
                        <span className="font-medium">{vehicle.purpose}</span>
                      </div>
                      <div className="dark:bg-dark-600/60 flex min-w-0 flex-col gap-1 rounded-lg bg-white p-3 shadow-sm">
                        <span className="text-gray-500">Employee Met</span>
                        <span className="font-medium">
                          {vehicle.employeeToMeet || "—"}
                        </span>
                      </div>
                      <div className="dark:bg-dark-600/60 flex min-w-0 flex-col gap-1 rounded-lg bg-white p-3 shadow-sm">
                        <span className="text-gray-500">Entry Time</span>
                        <span className="font-medium">{vehicle.entryTime}</span>
                      </div>
                      <div className="dark:bg-dark-600/60 flex min-w-0 flex-col gap-1 rounded-lg bg-white p-3 shadow-sm">
                        <span className="text-gray-500">Entry Condition</span>
                        <span className="font-medium">
                          {vehicle.vehicleCondition || "—"}
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
                          error={errors.exitTime?.message}
                        />
                      )}
                    />
                    <Input
                      {...register("exitVehicleCondition", {
                        required: "Exit vehicle condition is required",
                      })}
                      label="Exit Vehicle Condition"
                      placeholder="e.g. Good, Fair, Damaged"
                      error={errors.exitVehicleCondition?.message}
                    />
                    <Controller
                      control={control}
                      name="conditionChangedAtExit"
                      render={({ field: { value, onChange } }) => (
                        <Switch
                          checked={value}
                          onChange={(e) => onChange(e.target.checked)}
                          label="Condition changed since entry"
                        />
                      )}
                    />

                    {conditionChanged && (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Controller
                          control={control}
                          name="exitPhotoFront"
                          rules={{
                            required:
                              "Front exit photo is required when condition changed",
                          }}
                          render={({ field: { value, onChange } }) => (
                            <PhotoUpload
                              label="Exit Photo (Front)"
                              value={value}
                              onChange={onChange}
                            />
                          )}
                        />
                        <Controller
                          control={control}
                          name="exitPhotoBack"
                          rules={{
                            required:
                              "Back exit photo is required when condition changed",
                          }}
                          render={({ field: { value, onChange } }) => (
                            <PhotoUpload
                              label="Exit Photo (Back)"
                              value={value}
                              onChange={onChange}
                            />
                          )}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="dark:border-dark-500 flex justify-end gap-3 border-t border-gray-200 p-4">
                  <Button type="button" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" color="primary">
                    Confirm Exit
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

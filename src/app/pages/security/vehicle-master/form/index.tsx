import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";

import { Page } from "@/components/shared/Page";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { PhotoUpload } from "@/components/shared/form/PhotoUpload";
import { Button, Card, Input } from "@/components/ui";
import { Get, Post, Put, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";
import {
  entryStatusOptions,
  gateOptions,
  vehicleBrandOptions,
  vehicleTypeOptions,
} from "../../../master/shared/constants";
import { buildFormData } from "../../../master/shared/toFormData";
import { emptyVehicle, mapApiVehicleEntryToVehicleEntry, VehicleEntry } from "../data";

export default function VehicleEntryFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<VehicleEntry>({
    defaultValues: emptyVehicle(),
  });

  // ---- Edit mode me existing record API se fetch karo ----
  useEffect(() => {
    if (!isEdit || !id) return;
    (async () => {
      try {
        const response = await Get(`employee/security/vehicleentry/${id}`, {}, false);
        if (response.data?.success) {
          reset(mapApiVehicleEntryToVehicleEntry(response.data.data));
        } else {
          toasterrormsg(response.data?.message || "Failed to fetch vehicle entry.");
        }
      } catch (error) {
        toasterrormsg("Something went wrong while fetching the vehicle entry.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit, reset]);

  const onSubmit = async (data: VehicleEntry) => {
    setSubmitting(true);
    const formData = buildFormData({
      entryDate: data.entryDate,
      entryTime: data.entryTime,
      vehicleType: data.vehicleType,
      vehicleNumber: data.vehicleNumber,
      vehicleBrand: data.vehicleBrand,
      driverName: data.driverName,
      mobileNumber: data.mobileNumber,
      company: data.company,
      purpose: data.purpose,
      employeeToMeet: data.employeeToMeet,
      gateNumber: data.gateNumber,
      vehicleCondition: data.vehicleCondition,
      status: data.status,
      driverPhoto: data.driverPhoto,
      rcPhoto: data.rcPhoto,
      vehiclePhotoFront: data.vehiclePhotoFront,
      vehiclePhotoBack: data.vehiclePhotoBack,
    });

    try {
      if (isEdit && id) {
        formData.append("vehicleEntryId", id);
        const response = await Put("employee/security/vehicleentry/update", formData, true);
        if (response.data?.success) {
          toastsuccessmsg(response.data?.message || "Vehicle entry updated successfully.");
          navigate("/vehiclemaster/vehicle-entry");
        } else {
          toasterrormsg(response.data?.message || "Failed to update vehicle entry.");
        }
      } else {
        const response = await Post("employee/security/vehicleentry/create", formData, true);
        if (response.data?.success) {
          toastsuccessmsg(response.data?.message || "Vehicle entry created successfully.");
          navigate("/vehiclemaster/vehicle-entry");
        } else {
          toasterrormsg(response.data?.message || "Failed to create vehicle entry.");
        }
      }
    } catch (error) {
      toasterrormsg("Something went wrong while saving the vehicle entry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Page title={isEdit ? "Edit Vehicle Entry" : "New Vehicle Entry"}>
      <div className="transition-content w-full px-(--margin-x) pb-8">
        <div className="flex items-center justify-between py-5 lg:py-6">
          <h2 className="dark:text-dark-50 border-b-4 border-primary text-xl font-bold tracking-wide text-primary lg:text-2xl">
            {isEdit ? "Edit Vehicle Entry" : "New Vehicle Entry"}
          </h2>
          <Link to="/vehiclemaster/vehicle-entry">
            <Button color="primary" variant="outlined">
              <ChevronLeftIcon className="size-6" />
              <span>Back</span>
            </Button>
          </Link>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            {/* Basic Information */}
            <Card className="space-y-4 p-4 sm:p-6">
              <h3 className="dark:text-dark-100 text-lg font-medium text-gray-800">
                Basic Information
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Controller
                  control={control}
                  name="entryDate"
                  rules={{ required: "Entry date is required" }}
                  render={({ field: { value, onChange } }) => (
                    <DatePicker
                      label="Entry Date"
                      placeholder="Choose date..."
                      value={value}
                      onChange={(_dates, dateStr) => onChange(dateStr)}
                      error={errors.entryDate?.message}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="entryTime"
                  rules={{ required: "Entry time is required" }}
                  render={({ field: { value, onChange } }) => (
                    <DatePicker
                      label="Entry Time"
                      placeholder="Choose time..."
                      value={value}
                      onChange={(_dates, timeStr) => onChange(timeStr)}
                      options={{
                        enableTime: true,
                        noCalendar: true,
                        dateFormat: "H:i",
                        time_24hr: true,
                      }}
                      error={errors.entryTime?.message}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="vehicleType"
                  rules={{ required: "Vehicle type is required" }}
                  render={({ field: { value, onChange, ...rest } }) => (
                    <Listbox
                      data={vehicleTypeOptions}
                      value={
                        vehicleTypeOptions.find((item) => item.id === value) ||
                        null
                      }
                      onChange={(item) => onChange(item.id)}
                      label="Vehicle Type"
                      placeholder="Select type"
                      displayField="label"
                      error={errors.vehicleType?.message}
                      {...rest}
                    />
                  )}
                />
                <Input
                  {...register("vehicleNumber", {
                    required: "Vehicle number is required",
                    pattern: {
                      value: /^[A-Za-z0-9-]{4,15}$/,
                      message: "Enter a valid vehicle number",
                    },
                  })}
                  label="Vehicle Number"
                  placeholder="e.g. MH-12-AB-1234"
                  error={errors.vehicleNumber?.message}
                />
                <Controller
                  control={control}
                  name="vehicleBrand"
                  render={({ field: { value, onChange, ...rest } }) => (
                    <Listbox
                      data={vehicleBrandOptions}
                      value={
                        vehicleBrandOptions.find(
                          (item) => item.id === value,
                        ) || null
                      }
                      onChange={(item) => onChange(item.id)}
                      label="Vehicle Brand"
                      placeholder="Select brand"
                      displayField="label"
                      {...rest}
                    />
                  )}
                />
              </div>
            </Card>

            {/* Driver Details */}
            <Card className="space-y-4 p-4 sm:p-6">
              <h3 className="dark:text-dark-100 text-lg font-medium text-gray-800">
                Driver Details
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Input
                  {...register("driverName", {
                    required: "Driver name is required",
                  })}
                  label="Driver Name"
                  placeholder="Enter driver name"
                  error={errors.driverName?.message}
                />
                <Input
                  {...register("mobileNumber", {
                    required: "Mobile number is required",
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Mobile number must be 10 digits",
                    },
                  })}
                  label="Mobile Number"
                  placeholder="Enter mobile number"
                  error={errors.mobileNumber?.message}
                />
                <Input
                  {...register("company")}
                  label="Company"
                  placeholder="Enter company name"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Controller
                  control={control}
                  name="driverPhoto"
                  rules={{ required: "Driver photo is required" }}
                  render={({ field: { value, onChange } }) => (
                    <PhotoUpload
                      label="Driver Photo"
                      value={value}
                      onChange={onChange}
                      error={errors.driverPhoto?.message as string}
                    />
                  )}
                />
              </div>
            </Card>

            {/* Visit Details */}
            <Card className="space-y-4 p-4 sm:p-6">
              <h3 className="dark:text-dark-100 text-lg font-medium text-gray-800">
                Visit Details
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Input
                  {...register("purpose", { required: "Purpose is required" })}
                  label="Purpose of Visit"
                  placeholder="Enter visit purpose"
                  error={errors.purpose?.message}
                />
                <Input
                  {...register("employeeToMeet")}
                  label="Employee To Meet"
                  placeholder="Enter employee name"
                />
                <Controller
                  control={control}
                  name="gateNumber"
                  render={({ field: { value, onChange, ...rest } }) => (
                    <Listbox
                      data={gateOptions}
                      value={
                        gateOptions.find((item) => item.id === value) || null
                      }
                      onChange={(item) => onChange(item.id)}
                      label="Gate Number"
                      placeholder="Select gate"
                      displayField="label"
                      {...rest}
                    />
                  )}
                />
              </div>
            </Card>

            {/* Security Details */}
            <Card className="space-y-4 p-4 sm:p-6">
              <h3 className="dark:text-dark-100 text-lg font-medium text-gray-800">
                Security Details
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Input
                  {...register("vehicleCondition", {
                    required: "Vehicle condition is required",
                  })}
                  label="Vehicle Condition"
                  placeholder="e.g. Good, Fair"
                  error={errors.vehicleCondition?.message}
                />
                <Controller
                  control={control}
                  name="status"
                  rules={{ required: "Status is required" }}
                  render={({ field: { value, onChange, ...rest } }) => (
                    <Listbox
                      data={entryStatusOptions.filter(
                        (item) => item.id !== "OUT",
                      )}
                      value={
                        entryStatusOptions.find((item) => item.id === value) ||
                        null
                      }
                      onChange={(item) => onChange(item.id)}
                      label="Status"
                      placeholder="Select status"
                      displayField="label"
                      error={errors.status?.message}
                      {...rest}
                    />
                  )}
                />
              </div>
            </Card>

            {/* Documents */}
            <Card className="space-y-4 p-4 sm:p-6">
              <h3 className="dark:text-dark-100 text-lg font-medium text-gray-800">
                Documents
              </h3>
              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
                <Controller
                  control={control}
                  name="rcPhoto"
                  rules={{ required: "RC photo is required" }}
                  render={({ field: { value, onChange } }) => (
                    <PhotoUpload
                      label="RC Photo"
                      value={value}
                      onChange={onChange}
                      error={errors.rcPhoto?.message as string}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="vehiclePhotoFront"
                  rules={{ required: "Front photo is required" }}
                  render={({ field: { value, onChange } }) => (
                    <PhotoUpload
                      label="Vehicle Photo (Front)"
                      value={value}
                      onChange={onChange}
                      error={errors.vehiclePhotoFront?.message as string}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="vehiclePhotoBack"
                  rules={{ required: "Back photo is required" }}
                  render={({ field: { value, onChange } }) => (
                    <PhotoUpload
                      label="Vehicle Photo (Back)"
                      value={value}
                      onChange={onChange}
                      error={errors.vehiclePhotoBack?.message as string}
                    />
                  )}
                />
              </div>
            </Card>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                onClick={() => navigate("/vehiclemaster/vehicle-entry")}
              >
                Cancel
              </Button>
              <Button type="submit" color="primary" disabled={submitting || loading}>
                {submitting ? "Saving..." : isEdit ? "Update Entry" : "Save Entry"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Page>
  );
}
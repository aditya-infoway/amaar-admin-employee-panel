import { useEffect, useMemo, useState } from "react";
import { Country, State, City } from "country-state-city";
import { Controller, useForm } from "react-hook-form";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import { Link, useNavigate, useParams } from "react-router";

import { Page } from "@/components/shared/Page";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { PhotoUpload } from "@/components/shared/form/PhotoUpload";
import { Button, Card, Input, Switch } from "@/components/ui";
import { Get, Put, toasterrormsg, toastsuccessmsg } from "@/ApiHelper";
import {
  gateOptions,
  genderOptions,
  idProofTypeOptions,
} from "../../../master/shared/constants";
import { buildFormData } from "../../../master/shared/toFormData";
import { emptyVisitor, VisitorEntry } from "../data";

const REQUIRED_FIELDS = [
  "fullName",
  "gender",
  "mobileNumber",
  "idProofType",
  "idProofNumber",
  "visitDate",
  "entryTime",
  "purpose",
  "personToMeet",
  "visitorPhoto",
] as const;

export default function VisitorEntryEditForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    control,
    watch,
    trigger,
    getValues,
    setValue,
    reset,
    formState: { errors },
  } = useForm<VisitorEntry>({
    defaultValues: emptyVisitor(),
  });

  const vehicleAvailable = watch("vehicleAvailable");

  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [selectedStateCode, setSelectedStateCode] = useState("");

  const countryOptions = useMemo(
    () => Country.getAllCountries().map((c) => ({ id: c.isoCode, label: c.name })),
    [],
  );

  const stateOptions = useMemo(() => {
    if (!selectedCountryCode) return [];
    return State.getStatesOfCountry(selectedCountryCode).map((s) => ({
      id: s.isoCode,
      label: s.name,
    }));
  }, [selectedCountryCode]);

  const cityOptions = useMemo(() => {
    if (!selectedCountryCode || !selectedStateCode) return [];
    return City.getCitiesOfState(selectedCountryCode, selectedStateCode).map((c) => ({
      id: c.name,
      label: c.name,
    }));
  }, [selectedCountryCode, selectedStateCode]);

  // ---- Existing entry fetch karo (edit ke liye prefill) ----
  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const response = await Get(`employee/security/visitorentry/${id}`, {}, false);
        if (response.data?.success) {
          const api = response.data.data;
          reset({
            ...emptyVisitor(),
            ...api,
            id: String(api.visitorEntryId ?? id),
          });

          // country/state dropdown chain ko sync karo taaki state/city list turant dikhe
          if (api.country) {
            const countryMatch = Country.getAllCountries().find((c) => c.name === api.country);
            if (countryMatch) {
              setSelectedCountryCode(countryMatch.isoCode);
              if (api.state) {
                const stateMatch = State.getStatesOfCountry(countryMatch.isoCode).find(
                  (s) => s.name === api.state,
                );
                if (stateMatch) setSelectedStateCode(stateMatch.isoCode);
              }
            }
          }
        } else {
          toasterrormsg(response.data?.message || "Failed to load visitor entry.");
          navigate("/visitoremaster/visitore-entry");
        }
      } catch (error) {
        toasterrormsg("Something went wrong while loading the visitor entry.");
        navigate("/visitoremaster/visitore-entry");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ---- Update API call ----
  const handleSave = async () => {
    const valid = await trigger(REQUIRED_FIELDS as unknown as string[]);
    if (!valid) return;
    if (!id) return;

    setSaving(true);
    const values = getValues();
    const formData = buildFormData({
      fullName: values.fullName,
      gender: values.gender,
      mobileNumber: values.mobileNumber,
      email: values.email,
      company: values.company,
      address: values.address,
      country: values.country,
      state: values.state,
      city: values.city,
      pincode: values.pincode,
      idProofType: values.idProofType,
      idProofNumber: values.idProofNumber,
      idFrontPhoto: values.idFrontPhoto,
      idBackPhoto: values.idBackPhoto,
      visitDate: values.visitDate,
      entryTime: values.entryTime,
      exitTime: values.exitTime,
      purpose: values.purpose,
      department: values.department,
      personToMeet: values.personToMeet,
      employeeId: values.employeeId,
      duration: values.duration,
      numberOfPersons: values.numberOfPersons,
      adultCount: values.adultCount,
      childCount: values.childCount,
      accompanyingPerson: values.accompanyingPerson,
      vehicleAvailable: values.vehicleAvailable,
      vehicleNumber: values.vehicleNumber,
      previousVisit: values.previousVisit,
      frequentVisitor: values.frequentVisitor,
      gate: values.gate,
      securityGuard: values.securityGuard,
      mobileCount: values.mobileCount,
      allowedAreas: values.allowedAreas,
      restrictedAreas: values.restrictedAreas,
      otherItems: values.otherItems,
      bagChecked: values.bagChecked,
      laptop: values.laptop,
      camera: values.camera,
      visitorPhoto: values.visitorPhoto,
    });

    try {
      const response = await Put(`employee/security/visitorentry/update/${id}`, formData, true);
      if (response.data?.success) {
        toastsuccessmsg(response.data?.message || "Visitor entry updated successfully.");
        navigate("/visitoremaster/visitore-entry");
      } else {
        toasterrormsg(response.data?.message || "Failed to update visitor entry.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while updating the visitor entry.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Page title="Edit Visitor Entry">
      <div className="transition-content mx-auto w-full px-(--margin-x) pb-8">
        <div className="flex items-center justify-between py-5 lg:py-6">
          <h2 className="dark:text-dark-50 border-primary text-primary border-b-4 text-xl font-bold tracking-wide lg:text-2xl">
            Edit Visitor Entry
          </h2>
          <Link to="/visitoremaster/visitore-entry">
            <Button color="primary" variant="outlined">
              <ChevronLeftIcon className="size-6" />
              <span>Back</span>
            </Button>
          </Link>
        </div>

        {loading ? (
          <Card className="p-6 text-center text-sm text-gray-500">Loading visitor entry...</Card>
        ) : (
          <div className="space-y-6">
            <Card className="space-y-4 p-4 sm:p-6">
              <h3 className="dark:text-dark-100 text-lg font-medium text-gray-800">
                Personal Details
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Input
                  {...register("fullName", { required: "Full name is required" })}
                  label="Full Name"
                  placeholder="Enter full name"
                  error={errors.fullName?.message}
                />
                <Controller
                  control={control}
                  name="gender"
                  rules={{ required: "Gender is required" }}
                  render={({ field: { value, onChange, ...rest } }) => (
                    <Listbox
                      data={genderOptions}
                      value={genderOptions.find((item) => item.id === value) || null}
                      onChange={(item) => onChange(item.id)}
                      label="Gender"
                      placeholder="Select gender"
                      displayField="label"
                      error={errors.gender?.message}
                      {...rest}
                    />
                  )}
                />
                <Input
                  {...register("mobileNumber", { required: "Mobile number is required" })}
                  label="Mobile Number"
                  placeholder="Enter mobile number"
                  error={errors.mobileNumber?.message}
                />
                <Input {...register("email")} label="Email" type="email" placeholder="Enter email" />
                <Input {...register("company")} label="Company" placeholder="Enter company name" />
                <Input
                  {...register("address")}
                  label="Address"
                  placeholder="Enter address"
                  className="sm:col-span-2 lg:col-span-1"
                />

                <Controller
                  control={control}
                  name="country"
                  render={({ field: { value, onChange, ...rest } }) => (
                    <Listbox
                      data={countryOptions}
                      value={countryOptions.find((item) => item.label === value) || null}
                      onChange={(item) => {
                        onChange(item.label);
                        setSelectedCountryCode(item.id);
                        setValue("state", "");
                        setValue("city", "");
                        setSelectedStateCode("");
                      }}
                      label="Country"
                      placeholder="Select country"
                      displayField="label"
                      {...rest}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="state"
                  render={({ field: { value, onChange, ...rest } }) => (
                    <Listbox
                      data={stateOptions}
                      value={stateOptions.find((item) => item.label === value) || null}
                      onChange={(item) => {
                        onChange(item.label);
                        setSelectedStateCode(item.id);
                        setValue("city", "");
                      }}
                      label="State"
                      placeholder={selectedCountryCode ? "Select state" : "Select country first"}
                      displayField="label"
                      disabled={!selectedCountryCode}
                      {...rest}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="city"
                  render={({ field: { value, onChange, ...rest } }) => (
                    <Listbox
                      data={cityOptions}
                      value={cityOptions.find((item) => item.label === value) || null}
                      onChange={(item) => onChange(item.label)}
                      label="City"
                      placeholder={selectedStateCode ? "Select city" : "Select state first"}
                      displayField="label"
                      disabled={!selectedStateCode}
                      {...rest}
                    />
                  )}
                />
                <Input {...register("pincode")} label="Pincode" placeholder="Enter pincode" />
              </div>
            </Card>

            <Card className="space-y-4 p-4 sm:p-6">
              <h3 className="dark:text-dark-100 text-lg font-medium text-gray-800">
                Identity Proof
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Controller
                  control={control}
                  name="idProofType"
                  rules={{ required: "ID proof type is required" }}
                  render={({ field: { value, onChange, ...rest } }) => (
                    <Listbox
                      data={idProofTypeOptions}
                      value={idProofTypeOptions.find((item) => item.id === value) || null}
                      onChange={(item) => onChange(item.id)}
                      label="ID Proof Type"
                      placeholder="Select ID proof"
                      displayField="label"
                      error={errors.idProofType?.message}
                      {...rest}
                    />
                  )}
                />
                <Input
                  {...register("idProofNumber", { required: "ID proof number is required" })}
                  label="ID Proof Number"
                  placeholder="Enter ID number"
                  error={errors.idProofNumber?.message}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  control={control}
                  name="idFrontPhoto"
                  render={({ field: { value, onChange } }) => (
                    <PhotoUpload label="ID Front Photo" value={value} onChange={onChange} />
                  )}
                />
                <Controller
                  control={control}
                  name="idBackPhoto"
                  render={({ field: { value, onChange } }) => (
                    <PhotoUpload label="ID Back Photo" value={value} onChange={onChange} />
                  )}
                />
              </div>
            </Card>

            <Card className="space-y-4 p-4 sm:p-6">
              <h3 className="dark:text-dark-100 text-lg font-medium text-gray-800">
                Visit Details
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Controller
                  control={control}
                  name="visitDate"
                  rules={{ required: "Visit date is required" }}
                  render={({ field: { value, onChange } }) => (
                    <DatePicker
                      label="Visit Date"
                      placeholder="Choose date..."
                      value={value}
                      onChange={(_dates, dateStr) => onChange(dateStr)}
                      error={errors.visitDate?.message}
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
                      options={{ enableTime: true, noCalendar: true, dateFormat: "H:i", time_24hr: true }}
                      error={errors.entryTime?.message}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="exitTime"
                  render={({ field: { value, onChange } }) => (
                    <DatePicker
                      label="Exit Time"
                      placeholder="Choose time..."
                      value={value}
                      onChange={(_dates, timeStr) => onChange(timeStr)}
                      options={{ enableTime: true, noCalendar: true, dateFormat: "H:i", time_24hr: true }}
                    />
                  )}
                />
                <Input
                  {...register("purpose", { required: "Purpose is required" })}
                  label="Purpose of Visit"
                  placeholder="Enter visit purpose"
                  error={errors.purpose?.message}
                />
                <Input {...register("department")} label="Department" placeholder="Enter department" />
                <Input
                  {...register("personToMeet", { required: "Person to meet is required" })}
                  label="Person to Meet"
                  placeholder="Enter employee name"
                  error={errors.personToMeet?.message}
                />
                <Input {...register("employeeId")} label="Employee ID" placeholder="Enter employee ID" />
                <Input {...register("duration")} label="Duration" placeholder="e.g. 1 hour" />
              </div>
            </Card>

            <Card className="space-y-4 p-4 sm:p-6">
              <h3 className="dark:text-dark-100 text-lg font-medium text-gray-800">
                Visitor Information
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Input {...register("numberOfPersons")} label="Number of Persons" type="number" />
                <Input {...register("adultCount")} label="Adult Count" type="number" />
                <Input {...register("childCount")} label="Child Count" type="number" />
                <Input {...register("accompanyingPerson")} label="Accompanying Person" placeholder="Enter name" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Controller
                  control={control}
                  name="vehicleAvailable"
                  render={({ field: { value, onChange } }) => (
                    <div className="flex items-end pb-2">
                      <Switch checked={value} onChange={(e) => onChange(e.target.checked)} label="Vehicle Available" />
                    </div>
                  )}
                />
                {vehicleAvailable && (
                  <Input {...register("vehicleNumber")} label="Vehicle Number" placeholder="Enter vehicle number" />
                )}
                <Controller
                  control={control}
                  name="previousVisit"
                  render={({ field: { value, onChange } }) => (
                    <div className="flex items-end pb-2">
                      <Switch checked={value} onChange={(e) => onChange(e.target.checked)} label="Previous Visit" />
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="frequentVisitor"
                  render={({ field: { value, onChange } }) => (
                    <div className="flex items-end pb-2">
                      <Switch checked={value} onChange={(e) => onChange(e.target.checked)} label="Frequent Visitor" />
                    </div>
                  )}
                />
              </div>
            </Card>

            <Card className="space-y-4 p-4 sm:p-6">
              <h3 className="dark:text-dark-100 text-lg font-medium text-gray-800">
                Security Details
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Controller
                  control={control}
                  name="gate"
                  render={({ field: { value, onChange, ...rest } }) => (
                    <Listbox
                      data={gateOptions}
                      value={gateOptions.find((item) => item.id === value) || null}
                      onChange={(item) => onChange(item.id)}
                      label="Gate"
                      placeholder="Select gate"
                      displayField="label"
                      {...rest}
                    />
                  )}
                />
                <Input {...register("securityGuard")} label="Security Guard" placeholder="Enter guard name" />
                <Input {...register("mobileCount")} label="Mobile Count" type="number" />
                <Input {...register("allowedAreas")} label="Allowed Areas" placeholder="Enter allowed areas" />
                <Input {...register("restrictedAreas")} label="Restricted Areas" placeholder="Enter restricted areas" />
                <Input {...register("otherItems")} label="Other Items" placeholder="Enter other items" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Controller
                  control={control}
                  name="bagChecked"
                  render={({ field: { value, onChange } }) => (
                    <div className="flex items-end pb-2">
                      <Switch checked={value} onChange={(e) => onChange(e.target.checked)} label="Bag Checked" />
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="laptop"
                  render={({ field: { value, onChange } }) => (
                    <div className="flex items-end pb-2">
                      <Switch checked={value} onChange={(e) => onChange(e.target.checked)} label="Laptop" />
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="camera"
                  render={({ field: { value, onChange } }) => (
                    <div className="flex items-end pb-2">
                      <Switch checked={value} onChange={(e) => onChange(e.target.checked)} label="Camera" />
                    </div>
                  )}
                />
              </div>
              <Controller
                control={control}
                name="visitorPhoto"
                rules={{
                    validate: (value) => (value ? true : "Visitor photo is required"),
                }}
                render={({ field: { value, onChange } }) => (
                    <PhotoUpload
                    label="Visitor Photo"
                    value={value}
                    onChange={onChange}
                    error={errors.visitorPhoto?.message as string | undefined}
                    />
                )}
                />
            </Card>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" onClick={() => navigate("/visitoremaster/visitore-entry")}>
                Cancel
              </Button>
              <Button type="button" color="primary" disabled={saving} onClick={handleSave}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Page>
  );
}
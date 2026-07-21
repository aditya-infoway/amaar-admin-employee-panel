import {
  ArrowPathIcon,
  ChevronLeftIcon,
  ClockIcon,
  InformationCircleIcon,
  PaperAirplaneIcon,
  PrinterIcon,
  ShieldCheckIcon,
} from "@heroicons/react/20/solid";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";

import { Page } from "@/components/shared/Page";
import { Stepper } from "@/components/shared/Stepper";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { PhotoUpload } from "@/components/shared/form/PhotoUpload";
import { Button, Card, Input, Switch } from "@/components/ui";
import {
  gateOptions,
  genderOptions,
  idProofTypeOptions,
} from "../../../master/shared/constants";
import { visitorStorage } from "../../../master/shared/storage";
import {
  emptyVisitor,
  generateBadgeNumber,
  generateGatePassNumber,
  generateOtp,
  VisitorEntry,
} from "../data";
import { GatePassCard } from "./GatePassCard";
import { printGatePass } from "./gatePassPrint";

const STEP_LABELS = ["Visitor Details", "Send OTP", "Verify OTP", "Gate Pass"];

const STEP1_REQUIRED_FIELDS = [
  "fullName",
  "gender",
  "mobileNumber",
  "idProofType",
  "idProofNumber",
  "visitDate",
  "entryTime",
  "purpose",
  "personToMeet",
] as const;

export default function VisitorEntryWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [entry, setEntry] = useState<VisitorEntry | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState(false);

  const {
    register,
    control,
    watch,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<VisitorEntry>({
    defaultValues: emptyVisitor(),
  });

  const vehicleAvailable = watch("vehicleAvailable");

  const persist = (item: VisitorEntry) => {
    const items = visitorStorage.getItems();
    const exists = items.some((row) => row.id === item.id);
    const next = exists
      ? items.map((row) => (row.id === item.id ? item : row))
      : [item, ...items];
    visitorStorage.saveItems(next);
  };

  // ---- Step 1: capture and validate visitor details ----
  const handleStep1Next = async () => {
    const valid = await trigger(STEP1_REQUIRED_FIELDS as unknown as string[]);
    if (!valid) return;

    const values = getValues();
    const draft: VisitorEntry = {
      ...values,
      id: crypto.randomUUID(),
      status: "HOLD",
    };
    setEntry(draft);
    persist(draft);
    setStep(2);
  };

  // ---- Step 2: generate + "send" OTP to the employee ----
  const handleSendOtp = () => {
    if (!entry) return;
    const updated: VisitorEntry = {
      ...entry,
      otp: generateOtp(),
      otpGeneratedAt: new Date().toISOString(),
    };
    setEntry(updated);
    persist(updated);
  };

  const handleResendOtp = () => handleSendOtp();

  // ---- Step 3: security verifies the OTP the visitor was told ----
  const handleVerifyOtp = () => {
    if (!entry) return;
    if (otpInput.trim() !== entry.otp) {
      setOtpError(true);
      return;
    }
    setOtpError(false);

    const updated: VisitorEntry = {
      ...entry,
      otpVerified: true,
      status: "IN",
      checkInTime: new Date().toISOString(),
      badgeNumber: generateBadgeNumber(),
      gatePassNumber: generateGatePassNumber(),
      gatePassIssuedAt: new Date().toISOString(),
    };
    setEntry(updated);
    persist(updated);
    setStep(4);
  };

  return (
    <Page title="New Visitor Entry">
      <div className="transition-content mx-auto w-full px-(--margin-x) pb-8">
        <div className="flex items-center justify-between py-5 lg:py-6">
          <h2 className="dark:text-dark-50 border-primary text-primary border-b-4 text-xl font-bold tracking-wide lg:text-2xl">
            New Visitor Entry
          </h2>
          <Link to="/visitoremaster/visitore-entry">
            <Button color="primary" variant="outlined">
              <ChevronLeftIcon className="size-6" />
              <span>Back</span>
            </Button>
          </Link>
        </div>

        <Card className="mb-6 p-4 sm:p-6">
          <Stepper steps={STEP_LABELS} currentStep={step} />
        </Card>  

        {/* ---------------- STEP 1 ---------------- */}
        {step === 1 && (
          <div className="space-y-6">
            <Card className="space-y-4 p-4 sm:p-6">
              <h3 className="dark:text-dark-100 text-lg font-medium text-gray-800">
                Personal Details
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Input
                  {...register("fullName", {
                    required: "Full name is required",
                  })} 
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
                      value={
                        genderOptions.find((item) => item.id === value) || null
                      }
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
                  {...register("mobileNumber", {
                    required: "Mobile number is required",
                  })}
                  label="Mobile Number"
                  placeholder="Enter mobile number"
                  error={errors.mobileNumber?.message}
                />
                <Input
                  {...register("email")}
                  label="Email"
                  type="email"
                  placeholder="Enter email"
                />
                <Input
                  {...register("company")}
                  label="Company"
                  placeholder="Enter company name"
                />
                <Input
                  {...register("address")}
                  label="Address"
                  placeholder="Enter address"
                  className="sm:col-span-2 lg:col-span-1"
                />
                <Input
                  {...register("city")}
                  label="City"
                  placeholder="Enter city"
                />
                <Input                            
                  {...register("state")}
                  label="State"
                  placeholder="Enter state"
                />
                <Input
                  {...register("pincode")}
                  label="Pincode"
                  placeholder="Enter pincode"
                />
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
                      value={
                        idProofTypeOptions.find((item) => item.id === value) ||
                        null
                      }
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
                  {...register("idProofNumber", {
                    required: "ID proof number is required",
                  })}
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
                    <PhotoUpload
                      label="ID Front Photo"
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="idBackPhoto"   
                  render={({ field: { value, onChange } }) => (
                    <PhotoUpload
                      label="ID Back Photo"
                      value={value}
                      onChange={onChange}
                    />
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
                  name="exitTime"
                  render={({ field: { value, onChange } }) => (
                    <DatePicker
                      label="Exit Time"
                      placeholder="Choose time..."
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
                <Input
                  {...register("purpose", { required: "Purpose is required" })}
                  label="Purpose of Visit"
                  placeholder="Enter visit purpose"
                  error={errors.purpose?.message}
                />
                <Input
                  {...register("department")}
                  label="Department"
                  placeholder="Enter department"
                />
                <Input
                  {...register("personToMeet", {
                    required: "Person to meet is required",
                  })}
                  label="Person to Meet"
                  placeholder="Enter employee name"
                  error={errors.personToMeet?.message}
                />
                <Input
                  {...register("employeeId")}
                  label="Employee ID"
                  placeholder="Enter employee ID"
                />
                <Input
                  {...register("duration")}
                  label="Duration"
                  placeholder="e.g. 1 hour"
                />
              </div>
            </Card>

            <Card className="space-y-4 p-4 sm:p-6">
              <h3 className="dark:text-dark-100 text-lg font-medium text-gray-800">
                Visitor Information
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Input
                  {...register("numberOfPersons")}
                  label="Number of Persons"
                  type="number"
                />
                <Input
                  {...register("adultCount")}
                  label="Adult Count"
                  type="number"
                />
                <Input
                  {...register("childCount")}
                  label="Child Count"
                  type="number"
                />
                <Input
                  {...register("accompanyingPerson")}
                  label="Accompanying Person"
                  placeholder="Enter name"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Controller
                  control={control}
                  name="vehicleAvailable"
                  render={({ field: { value, onChange } }) => (
                    <div className="flex items-end pb-2">
                      <Switch
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                        label="Vehicle Available"
                      />
                    </div>
                  )}
                />
                {vehicleAvailable && (
                  <Input
                    {...register("vehicleNumber")}
                    label="Vehicle Number"
                    placeholder="Enter vehicle number"
                  />
                )}
                <Controller
                  control={control}
                  name="previousVisit"
                  render={({ field: { value, onChange } }) => (
                    <div className="flex items-end pb-2">
                      <Switch
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                        label="Previous Visit"
                      />
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="frequentVisitor"
                  render={({ field: { value, onChange } }) => (
                    <div className="flex items-end pb-2">
                      <Switch
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                        label="Frequent Visitor"
                      />
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
                      value={
                        gateOptions.find((item) => item.id === value) || null
                      }
                      onChange={(item) => onChange(item.id)}
                      label="Gate"
                      placeholder="Select gate"
                      displayField="label"
                      {...rest}
                    />
                  )}
                />
                <Input
                  {...register("securityGuard")}
                  label="Security Guard"
                  placeholder="Enter guard name"
                />
                <Input
                  {...register("mobileCount")}
                  label="Mobile Count"
                  type="number"
                />       
                <Input
                  {...register("allowedAreas")}
                  label="Allowed Areas"
                  placeholder="Enter allowed areas"
                />
                <Input
                  {...register("restrictedAreas")}
                  label="Restricted Areas"
                  placeholder="Enter restricted areas"
                />
                <Input
                  {...register("otherItems")}
                  label="Other Items"
                  placeholder="Enter other items"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Controller
                  control={control}
                  name="bagChecked"
                  render={({ field: { value, onChange } }) => (
                    <div className="flex items-end pb-2">
                      <Switch
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                        label="Bag Checked"
                      />
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="laptop"
                  render={({ field: { value, onChange } }) => (
                    <div className="flex items-end pb-2">
                      <Switch
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                        label="Laptop"
                      />
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="camera"
                  render={({ field: { value, onChange } }) => (
                    <div className="flex items-end pb-2">
                      <Switch
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                        label="Camera"
                      />
                    </div>
                  )}
                />
              </div>
              <Controller
                control={control}
                name="visitorPhoto"
                render={({ field: { value, onChange } }) => (
                  <PhotoUpload
                    label="Visitor Photo"
                    value={value}
                    onChange={onChange}
                  />
                )}
              />
            </Card>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                onClick={() => navigate("/visitoremaster/visitore-entry")}
              >
                Cancel
              </Button>
              <Button type="button" color="primary" onClick={handleStep1Next}>
                Next: Send OTP
              </Button>
            </div>
          </div>
        )}

        {/* ---------------- STEP 2: SEND OTP ---------------- */}
        {step === 2 && entry && (
          <Card className="mx-auto max-w-5xl overflow-hidden p-0">
            <div className="border-primary/10 from-primary/10 dark:from-primary/15 border-b bg-gradient-to-r to-transparent px-5 py-6 sm:px-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="bg-primary text-primary-content flex size-12 shrink-0 items-center justify-center rounded-xl shadow-sm text-white">
                    <PaperAirplaneIcon className="size-6 " />
                  </div>
                  <div>
                    <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">Step 2 of 4</p>
                    <h3 className="dark:text-dark-100 mt-1 text-xl font-semibold text-gray-800">Send approval code</h3>
                    <p className="mt-1 text-sm text-gray-500">Review the visit details, then send a one-time code to the host.</p>
                  </div>
                </div>
                <div className="border-primary/15 bg-primary/5 text-primary inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium">
                  <ClockIcon className="size-4" /> Awaiting host confirmation
                </div>
              </div>
            </div>

            <div className="space-y-6 p-5 sm:p-8">

              <div className="dark:bg-dark-700 grid gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-dark-600 sm:grid-cols-2">
                <div>
                  <p className="text-primary text-xs font-semibold tracking-wide uppercase">Visitor</p>
                  <p className="dark:text-dark-100 font-medium text-gray-800">
                    {entry.fullName}
                  </p>
                </div>
                <div>
                  <p className="text-primary text-xs font-semibold tracking-wide uppercase">Host to notify</p>
                  <p className="dark:text-dark-100 font-medium text-gray-800">
                    {entry.personToMeet}{" "}
                    {entry.department && `· ${entry.department}`}
                  </p>
                </div>
                <div>
                  <p className="text-primary text-xs font-semibold tracking-wide uppercase">Purpose of visit</p>
                  <p className="dark:text-dark-100 font-medium text-gray-800">
                    {entry.purpose}
                  </p>
                </div>
                <div>
                  <p className="text-primary text-xs font-semibold tracking-wide uppercase">Visitor mobile</p>
                  <p className="dark:text-dark-100 font-medium text-gray-800">
                    {entry.mobileNumber}
                  </p>
                </div>
              </div>

              {!entry.otp ? (
                <div className="border-primary/20 bg-primary/5 rounded-xl border p-4 sm:flex sm:items-center sm:justify-between sm:gap-6">
                  <div className="flex gap-3">
                    <InformationCircleIcon className="text-primary mt-0.5 size-5 shrink-0" />
                    <div>
                      <p className="dark:text-dark-100 text-sm font-semibold text-gray-800">Ready to notify {entry.personToMeet}</p>
                      <p className="mt-1 text-xs leading-5 text-gray-500">The host receives the code and shares it with the visitor for verification at the gate.</p>
                    </div>
                  </div>
                  <Button color="primary" className="mt-4 w-full sm:mt-0 sm:w-auto" onClick={handleSendOtp}>
                    <PaperAirplaneIcon className="size-4" /> Send OTP to host
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border-primary/30 bg-primary/5 rounded-lg border border-dashed p-4 text-center">
                    <p className="text-xs text-gray-500">
                      Employee's device shows this OTP — they must tell it to the
                      visitor
                    </p>
                    <p className="text-primary mt-1 text-2xl font-bold tracking-[0.3em]">
                      {entry.otp}
                    </p>
                    <p className="mt-1 text-[11px] text-gray-400">
                      Sent {new Date(entry.otpGeneratedAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outlined"
                      onClick={handleResendOtp}
                      className="flex-1"
                    >
                      <ArrowPathIcon className="size-4" /> Resend OTP
                    </Button>
                    <Button
                      color="primary"
                      onClick={() => setStep(3)}
                      className="flex-1"
                    >
                      Continue to Verification
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex justify-start">
                <Button variant="outlined" onClick={() => setStep(1)}>   
                  <ChevronLeftIcon className="size-4" /> Back
                </Button>
              </div>
            </div>

          </Card>
        )}

        {/* ---------------- STEP 3: VERIFY OTP ---------------- */}
        {step === 3 && entry && (
          <Card className="space-y-6 p-6 sm:p-8">
            <div className="text-center">
              <div className="bg-primary/10 mx-auto flex size-14 items-center justify-center rounded-full">
                <ShieldCheckIcon className="text-primary size-7" />
              </div>
              <h3 className="dark:text-dark-100 mt-3 text-lg font-semibold text-gray-800">
                Verify OTP at Gate
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Ask the visitor for the 6-digit code the employee shared, then
                enter it below.
              </p>
            </div>

            <div className="mx-auto max-w-xs space-y-3">
              <Input
                value={otpInput}
                onChange={(e) => {
                  setOtpInput(e.target.value);
                  setOtpError(false);
                }}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="text-center text-lg tracking-[0.4em]"
                error={
                  otpError ? "Incorrect OTP. Please try again." : undefined
                }
              />
              <Button
                color="primary"
                className="w-full"
                onClick={handleVerifyOtp}
              >
                Verify & Check In
              </Button>
            </div>

            <div className="flex justify-start">
              <Button variant="outlined" onClick={() => setStep(2)}>
                <ChevronLeftIcon className="size-4" /> Back
              </Button>
            </div>
          </Card>
        )}

        {/* ---------------- STEP 4: GATE PASS ---------------- */}
        {step === 4 && entry && (
          <div className="space-y-6">
            <GatePassCard visitor={entry} />
            <div className="flex justify-center gap-3">
              <Button color="primary" onClick={() => printGatePass(entry)}>
                <PrinterIcon className="size-4" /> Print Gate Pass
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate("/visitoremaster/visitore-entry")}
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </Page>
  );
}

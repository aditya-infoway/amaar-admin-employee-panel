import { useEffect, useMemo, useState } from "react";
import { Country, State, City } from "country-state-city";
import { Controller, useForm } from "react-hook-form";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import { PaperClipIcon } from "@heroicons/react/24/solid";
import { Link, useNavigate, useParams } from "react-router";

import { Page } from "@/components/shared/Page";
import { Stepper } from "@/components/shared/Stepper";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import { Button, Card, Input, Switch } from "@/components/ui";
import { URL, Get, Put, toasterrormsg, toastsuccessmsg ,  URL as ApiUrl,} from "@/ApiHelper";

import { genderOptions } from "../../../../master/shared/constants";
import { buildFormData } from "../../../../master/shared/toFormData";

import {
  maritalStatusOptions,
  bloodGroupOptions,
  employeeTypeOptions,
  employeeStatusOptions,
  daysOfWeekOptions,
  workingShiftOptions,
} from "./constants";

import { emptyEmployee, EmployeeEntry } from "../data";

// ----------------------------------------------------------------------
// NOTE: `employeePhoto?: File | string | null` must also be added to the
// shared `EmployeeEntry` interface and `emptyEmployee()` in "../data".
// ----------------------------------------------------------------------

const STEP_LABELS = [
  "Personal Details",
  "Identity & KYC",
  "Address Details",
  "Employee Details",
  "Work Information",
];

const STEP1_REQUIRED_FIELDS = [
  "firstName",
  "lastName",
  "dateOfBirth",
  "gender",
  "maritalStatus",
  "personalMobileNo",
] as const;

const STEP3_REQUIRED_FIELDS = [
  "address",
  "country",
  "state",
  "city",
  "pincode",
] as const;

const STEP4_REQUIRED_FIELDS = [
  "joiningDate",
  "employeeType",
  "designation",
  "employeeStatus",
] as const;

const STEP5_REQUIRED_FIELDS = [
  "workingDays",
  "weeklyOff",
  "workingHoursFrom",
  "workingHoursTo",
  "workingShift",
] as const;

// ----------------------------------------------------------------------
// KYC field configuration
// ----------------------------------------------------------------------

const KYC_FIELDS: Array<{
  numberField:
    | "aadharNumber"
    | "drivingLicenceNumber"
    | "panNumber"
    | "voterIdNumber";

  uploadField:
    | "aadharCardUpload"
    | "drivingLicenceUpload"
    | "panUpload"
    | "voterIdUpload";

  label: string;
}> = [
  {
    numberField: "aadharNumber",
    uploadField: "aadharCardUpload",
    label: "Aadhar Card",
  },
  {
    numberField: "drivingLicenceNumber",
    uploadField: "drivingLicenceUpload",
    label: "Driving Licence",
  },
  {
    numberField: "panNumber",
    uploadField: "panUpload",
    label: "PAN Card",
  },
  {
    numberField: "voterIdNumber",
    uploadField: "voterIdUpload",
    label: "Voter ID",
  },
];

// ----------------------------------------------------------------------
const getFileUrl = (path?: string) => {
  if (!path) return "";

  return /^https?:\/\//i.test(path)
    ? path
    : `${ApiUrl.localurl}${path.replace(/^\/+/, "")}`;
};
export default function EmployeeEditForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [kycErrors, setKycErrors] = useState<Record<string, string>>({});

  // --------------------------------------------------------------------
  // React Hook Form
  // --------------------------------------------------------------------

  const {
    register,
    control,
    trigger,
    getValues,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EmployeeEntry>({
    defaultValues: emptyEmployee(),
  });

  // --------------------------------------------------------------------
  // Address states
  // --------------------------------------------------------------------

  const sameAsPermanentAddress = watch("sameAsPermanentAddress");
  const employeePhotoValue = watch("employeePhoto");

  const [currentCountryCode, setCurrentCountryCode] = useState("");
  const [currentStateCode, setCurrentStateCode] = useState("");

  const [permanentCountryCode, setPermanentCountryCode] = useState("");
  const [permanentStateCode, setPermanentStateCode] = useState("");

  // --------------------------------------------------------------------
  // Employee photo preview (handles both a freshly selected File and an
  // existing string URL coming back from the API)
  // --------------------------------------------------------------------

  const [employeePhotoPreview, setEmployeePhotoPreview] = useState<
    string | null
  >(null);
useEffect(() => {
  if (isFile(employeePhotoValue)) {
    const objectUrl = globalThis.URL.createObjectURL(employeePhotoValue);

    setEmployeePhotoPreview(objectUrl);

    return () => {
      globalThis.URL.revokeObjectURL(objectUrl);
    };
  }

  if (typeof employeePhotoValue === "string" && employeePhotoValue) {
    setEmployeePhotoPreview(getFileUrl(employeePhotoValue));
    return;
  }

  setEmployeePhotoPreview(null);
}, [employeePhotoValue]);

  // --------------------------------------------------------------------
  // Country options
  // --------------------------------------------------------------------

  const countryOptions = useMemo(
    () =>
      Country.getAllCountries().map((country) => ({
        id: country.isoCode,
        label: country.name,
      })),
    [],
  );

  // --------------------------------------------------------------------
  // Current State options
  // --------------------------------------------------------------------

  const currentStateOptions = useMemo(() => {
    if (!currentCountryCode) return [];

    return State.getStatesOfCountry(currentCountryCode).map((state) => ({
      id: state.isoCode,
      label: state.name,
    }));
  }, [currentCountryCode]);

  // --------------------------------------------------------------------
  // Current City options
  // --------------------------------------------------------------------

  const currentCityOptions = useMemo(() => {
    if (!currentCountryCode || !currentStateCode) return [];

    return City.getCitiesOfState(currentCountryCode, currentStateCode).map(
      (city) => ({
        id: city.name,
        label: city.name,
      }),
    );
  }, [currentCountryCode, currentStateCode]);

  // --------------------------------------------------------------------
  // Permanent State options
  // --------------------------------------------------------------------

  const permanentStateOptions = useMemo(() => {
    if (!permanentCountryCode) return [];

    return State.getStatesOfCountry(permanentCountryCode).map((state) => ({
      id: state.isoCode,
      label: state.name,
    }));
  }, [permanentCountryCode]);

  // --------------------------------------------------------------------
  // Permanent City options
  // --------------------------------------------------------------------

  const permanentCityOptions = useMemo(() => {
    if (!permanentCountryCode || !permanentStateCode) return [];

    return City.getCitiesOfState(permanentCountryCode, permanentStateCode).map(
      (city) => ({
        id: city.name,
        label: city.name,
      }),
    );
  }, [permanentCountryCode, permanentStateCode]);

  // --------------------------------------------------------------------
  // Fetch existing employee
  // --------------------------------------------------------------------

  useEffect(() => {
    if (!id) return;

    const fetchEmployee = async () => {
      setLoading(true);

      try {
        const response = await Get(`hr/employee/registered/${id}`, {}, false);

        if (response.data?.success) {
          const api = response.data.data;

          console.log("Edit Employee API response:", api);

          reset({
            ...emptyEmployee(),
            ...api,
            id: String(api.employeeEntryId ?? id),
            employeeId: api.employeeCode || String(api.employeeId ?? ""),
            workingDays:
              typeof api.workingDays === "string" && api.workingDays
                ? api.workingDays.split(",")
                : api.workingDays || [],
          });

          // --------------------------------------------------------------
          // Current country/state
          // --------------------------------------------------------------

          if (api.country) {
            const countryMatch = Country.getAllCountries().find(
              (country) => country.name === api.country,
            );

            if (countryMatch) {
              setCurrentCountryCode(countryMatch.isoCode);

              if (api.state) {
                const stateMatch = State.getStatesOfCountry(
                  countryMatch.isoCode,
                ).find((state) => state.name === api.state);

                if (stateMatch) {
                  setCurrentStateCode(stateMatch.isoCode);
                }
              }
            }
          }

          // --------------------------------------------------------------
          // Permanent country/state
          // --------------------------------------------------------------

          if (api.permanentCountry) {
            const permanentCountryMatch = Country.getAllCountries().find(
              (country) => country.name === api.permanentCountry,
            );

            if (permanentCountryMatch) {
              setPermanentCountryCode(permanentCountryMatch.isoCode);

              if (api.permanentState) {
                const permanentStateMatch = State.getStatesOfCountry(
                  permanentCountryMatch.isoCode,
                ).find((state) => state.name === api.permanentState);

                if (permanentStateMatch) {
                  setPermanentStateCode(permanentStateMatch.isoCode);
                }
              }
            }
          }
        } else {
          toasterrormsg(
            response.data?.message || "Failed to load employee record.",
          );

          navigate("/employee/employeeRegister");
        }
      } catch (error) {
        console.error("Employee fetch error:", error);

        toasterrormsg(
          "Something went wrong while loading the employee record.",
        );

        navigate("/employeemaster/employee-list");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // --------------------------------------------------------------------
  // Next step
  // --------------------------------------------------------------------

  const goNext = async (fields: readonly string[], nextStep: number) => {
    const valid = await trigger(fields as unknown as string[]);

    if (!valid) return;

    setStep(nextStep);
  };
const isFile = (value: unknown): value is File => {
  return typeof value === "object" && value !== null && value instanceof File;
};
  // --------------------------------------------------------------------
  // KYC validation
  // Same validation as Create page
  // --------------------------------------------------------------------

  const validateKycStep = () => {
    const values = getValues();

    const nextErrors: Record<string, string> = {};

    if (!values.employeePhoto) {
      nextErrors.employeePhoto = "Employee photo is required";
    }

    KYC_FIELDS.forEach(({ numberField, uploadField, label }) => {
      const number = (values[numberField] || "").toString().trim();

      const file = values[uploadField];

      /*
       * Existing uploaded image from API can be a string URL.
       * New upload will be a File.
       *
       * Both are treated as valid existing upload.
       */

      if (number && !file) {
        nextErrors[uploadField] = `Upload ${label} image`;
      }

      if (!number && file) {
        nextErrors[numberField] = `Enter ${label} number`;
      }
    });

    setKycErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  // --------------------------------------------------------------------
  // Employee photo field renderer
  // Same visual language as the KYC upload fields (existing image preview
  // link + change button), but with no paired number field.
  // --------------------------------------------------------------------

  const renderEmployeePhotoField = () => (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
        Employee Photo
      </label>

      <Controller
        control={control}
        name="employeePhoto"
        render={({ field: { value, onChange } }) => (
          <>
            <label className="border-primary bg-primary/5 text-primary inline-flex cursor-pointer items-center gap-1 rounded-lg border border-dashed px-3 py-2 text-xs">
              <PaperClipIcon className="size-4" />

              {isFile(value) || (typeof value === "string" && value)
                ? "Change Photo"
                : "Upload Photo"}

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const selectedFile = event.target.files?.[0] || null;

                  onChange(selectedFile);

                  setKycErrors((prev) => ({ ...prev, employeePhoto: "" }));
                }}
              />
            </label>

            {isFile(value) && (
              <p className="mt-1 truncate text-xs text-green-600">
                {value.name}
              </p>
            )}

            {/* Existing/preview photo */}

            {employeePhotoPreview && (
              <div className="mt-2">
                {typeof value === "string" && value && (
                  <p className="mb-2 text-xs text-green-600">
                    Existing photo uploaded
                  </p>
                )}

                <a
                  href={employeePhotoPreview}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={employeePhotoPreview}
                    alt="Employee"
                    className="h-32 w-32 cursor-pointer rounded-lg border border-gray-300 object-cover transition hover:opacity-80 dark:border-gray-600"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </a>
              </div>
            )}

            {kycErrors.employeePhoto && (
              <p className="mt-1 text-xs text-red-600">
                {kycErrors.employeePhoto}
              </p>
            )}
          </>
        )}
      />
    </div>
  );

  // --------------------------------------------------------------------
  // KYC field renderer
  // Exactly same UI as Create page
  // --------------------------------------------------------------------

  const renderKycField = (
    numberField:
      | "aadharNumber"
      | "drivingLicenceNumber"
      | "panNumber"
      | "voterIdNumber",

    uploadField:
      | "aadharCardUpload"
      | "drivingLicenceUpload"
      | "panUpload"
      | "voterIdUpload",

    label: string,
  ) => (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </label>

      <Controller
        control={control}
        name={uploadField}
        render={({ field: { value, onChange } }) => (
          <>
            <div className="flex items-stretch">
              <div className="w-[68%]">
                <input
                  type="text"
                  placeholder={`Enter ${label}`}
                  {...register(numberField, {
                    onChange: () =>
                      setKycErrors((prev) => ({
                        ...prev,
                        [numberField]: "",
                        [uploadField]: "",
                      })),
                  })}
                  className="focus:border-primary dark:bg-dark-800 w-full rounded-l-lg rounded-r-none border border-gray-300 px-3 py-2 text-sm outline-none dark:border-gray-600"
                />
              </div>

              <label className="border-primary bg-primary/5 text-primary flex w-[32%] cursor-pointer items-center justify-center gap-1 rounded-l-none rounded-r-lg border border-l-0 border-dashed px-2 py-2 text-center text-xs">
                <PaperClipIcon className="size-4" />

              {isFile(value) ? "Change" : "Upload"}

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const selectedFile = event.target.files?.[0] || null;

                    onChange(selectedFile);

                    setKycErrors((prev) => ({
                      ...prev,
                      [numberField]: "",
                      [uploadField]: "",
                    }));
                  }}
                />
              </label>
            </div>

            {isFile(value) && (
              <p className="mt-1 truncate text-xs text-green-600">
                {value.name}
              </p>
            )}

            {/* Existing uploaded image URL */}
            {/* Existing uploaded image */}
            {/* Existing uploaded image */}
            {typeof value === "string" && value && (
              <div className="mt-2">
                <p className="mb-2 text-xs text-green-600">
                  Existing document uploaded
                </p>

                <a
                  href={getFileUrl(value)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={getFileUrl(value)}
                    alt={`${label} image`}
                    className="max-h-48 w-auto cursor-pointer rounded-lg border border-gray-300 object-contain transition hover:opacity-80 dark:border-gray-600"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </a>
              </div>
            )}
            {kycErrors[numberField] && (
              <p className="mt-1 text-xs text-red-600">
                {kycErrors[numberField]}
              </p>
            )}

            {kycErrors[uploadField] && (
              <p className="mt-1 text-xs text-red-600">
                {kycErrors[uploadField]}
              </p>
            )}
          </>
        )}
      />
    </div>
  );

  // --------------------------------------------------------------------
  // Update employee (final submit — now after Work Information step)
  // --------------------------------------------------------------------

  const handleFinalSubmit = async () => {
    // --------------------------------------------------------------
    // Validate current step 5
    // --------------------------------------------------------------

    const valid = await trigger(STEP5_REQUIRED_FIELDS as unknown as string[]);

    if (!valid) return;

    if (!id) {
      toasterrormsg("Employee ID not found.");
      return;
    }

    setSaving(true);

    try {
      const values = getValues();

      console.log("Employee update values:", values);

      // ------------------------------------------------------------
      // FormData
      // Same fields as existing Edit API
      // ------------------------------------------------------------

      const formData = buildFormData({
        employeeId: values.employeeId,

        firstName: values.firstName,
        lastName: values.lastName,
        middleName: values.middleName,

        dateOfBirth: values.dateOfBirth,
        gender: values.gender,
        maritalStatus: values.maritalStatus,
        bloodGroup: values.bloodGroup,

        personalMobileNo: values.personalMobileNo,
        personalEmail: values.personalEmail,

        // ----------------------------------------------------------
        // KYC
        // ----------------------------------------------------------

        employeePhoto: values.employeePhoto,

        aadharNumber: values.aadharNumber,
        aadharCardUpload: values.aadharCardUpload,

        drivingLicenceNumber: values.drivingLicenceNumber,

        drivingLicenceUpload: values.drivingLicenceUpload,

        panNumber: values.panNumber,
        panUpload: values.panUpload,

        voterIdNumber: values.voterIdNumber,
        voterIdUpload: values.voterIdUpload,

        // ----------------------------------------------------------
        // Current address
        // ----------------------------------------------------------

        address: values.address,
        country: values.country,
        state: values.state,
        city: values.city,
        pincode: values.pincode,

        // ----------------------------------------------------------
        // Permanent address
        // ----------------------------------------------------------

        sameAsPermanentAddress: values.sameAsPermanentAddress,

        permanentAddress: values.sameAsPermanentAddress
          ? values.address
          : values.permanentAddress,

        permanentCountry: values.sameAsPermanentAddress
          ? values.country
          : values.permanentCountry,

        permanentState: values.sameAsPermanentAddress
          ? values.state
          : values.permanentState,

        permanentCity: values.sameAsPermanentAddress
          ? values.city
          : values.permanentCity,

        permanentPincode: values.sameAsPermanentAddress
          ? values.pincode
          : values.permanentPincode,

        // ----------------------------------------------------------
        // Employee details
        // ----------------------------------------------------------

        joiningDate: values.joiningDate,

        employeeType: values.employeeType,

        // Keep department because your existing Edit API supports it.
        department: values.department,

        designation: values.designation,

        branchLocation: values.branchLocation,

        employeeStatus: values.employeeStatus,

        noticePeriod: values.noticePeriod,

        // ----------------------------------------------------------
        // Work Information
        // ----------------------------------------------------------

        workingDays: (values.workingDays || []).join(","),
        weeklyOff: values.weeklyOff,
        workingHoursFrom: values.workingHoursFrom,
        workingHoursTo: values.workingHoursTo,
        workingShift: values.workingShift,
      });

      // --------------------------------------------------------------
      // UPDATE API
      // --------------------------------------------------------------

      const response = await Put(
        `hr/employee/registered/update/${id}`,
        formData,
        true,
      );

      console.log("Employee update response:", response?.data);

      if (response.data?.success) {
        toastsuccessmsg(
          response.data?.message || "Employee updated successfully.",
        );

        navigate("/employee/employeeRegister");
      } else {
        toasterrormsg(response.data?.message || "Failed to update employee.");
      }
    } catch (error) {
      console.error("Employee update error:", error);

      toasterrormsg("Something went wrong while updating the employee record.");
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------------------------
  // UI
  // --------------------------------------------------------------------

  return (
    <Page title="Edit Employee">
      <div className="transition-content mx-auto w-full px-(--margin-x) pb-8">
        {/* ============================================================
            PAGE HEADER
        ============================================================ */}

        <div className="flex items-center justify-between py-5 lg:py-6">
          <h2 className="dark:text-dark-50 border-primary text-primary border-b-4 text-xl font-bold tracking-wide lg:text-2xl">
            Edit Employee
          </h2>

          <Link to="/employee/employeeRegister">
            <Button color="primary" variant="outlined">
              <ChevronLeftIcon className="size-6" />

              <span>Back</span>
            </Button>
          </Link>
        </div>

        {/* ============================================================
            LOADING
        ============================================================ */}

        {loading ? (
          <Card className="p-6 text-center text-sm text-gray-500">
            Loading employee record...
          </Card>
        ) : (
          <>
            {/* ========================================================
                STEPPER
            ======================================================== */}

            <Card className="mb-6 p-4 sm:p-6">
              <Stepper
                steps={STEP_LABELS}
                currentStep={step}
                // onStepClick={(clickedStep) => setStep(clickedStep)}
              />
            </Card>

            {/* ========================================================
                STEP 1: PERSONAL DETAILS
            ======================================================== */}

            {step === 1 && (
              <div className="space-y-6">
                <Card className="space-y-4 p-4 sm:p-6">
                  <h3 className="dark:text-dark-50 border-primary text-primary w-37 border-b-4 text-lg font-bold tracking-wide lg:text-lg">
                    Personal Details
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Employee ID */}

                    <Input
                      {...register("employeeId")}
                      label="Employee ID"
                      readOnly
                      disabled
                      placeholder="Loading..."
                      className="dark:bg-dark-700 bg-gray-100"
                    />

                    {/* First Name */}

                    <Input
                      {...register("firstName", {
                        required: "First name is required",
                      })}
                      label="First Name"
                      placeholder="Enter first name"
                      error={errors.firstName?.message}
                    />

                    {/* Last Name */}

                    <Input
                      {...register("lastName", {
                        required: "Last name is required",
                      })}
                      label="Last Name"
                      placeholder="Enter last name"
                      error={errors.lastName?.message}
                    />

                    {/* Middle Name */}

                    <Input
                      {...register("middleName")}
                      label="Middle Name"
                      placeholder="Enter middle name"
                    />

                    {/* Date of Birth */}

                    <Controller
                      control={control}
                      name="dateOfBirth"
                      rules={{
                        required: "Date of birth is required",
                      }}
                      render={({ field: { value, onChange } }) => (
                        <DatePicker
                          label="Date of Birth"
                          placeholder="Choose date..."
                          value={value}
                          onChange={(_dates, dateStr) => onChange(dateStr)}
                          error={errors.dateOfBirth?.message}
                        />
                      )}
                    />

                    {/* Gender */}

                    <Controller
                      control={control}
                      name="gender"
                      rules={{
                        required: "Gender is required",
                      }}
                      render={({ field: { value, onChange } }) => (
                        <Combobox
                          data={genderOptions}
                          value={
                            genderOptions.find((item) => item.id === value) ||
                            null
                          }
                          onChange={(item: any) => onChange(item?.id ?? "")}
                          label="Gender"
                          placeholder="Select gender"
                          displayField="label"
                          searchFields={["label"]}
                          error={errors.gender?.message}
                        />
                      )}
                    />

                    {/* Marital Status */}

                    <Controller
                      control={control}
                      name="maritalStatus"
                      rules={{
                        required: "Marital status is required",
                      }}
                      render={({ field: { value, onChange } }) => (
                        <Combobox
                          data={maritalStatusOptions}
                          value={
                            maritalStatusOptions.find(
                              (item) => item.id === value,
                            ) || null
                          }
                          onChange={(item: any) => onChange(item?.id ?? "")}
                          label="Marital Status"
                          placeholder="Select marital status"
                          displayField="label"
                          searchFields={["label"]}
                          error={errors.maritalStatus?.message}
                        />
                      )}
                    />

                    {/* Blood Group */}

                    <Controller
                      control={control}
                      name="bloodGroup"
                      render={({ field: { value, onChange } }) => (
                        <Combobox
                          data={bloodGroupOptions}
                          value={
                            bloodGroupOptions.find(
                              (item) => item.id === value,
                            ) || null
                          }
                          onChange={(item: any) => onChange(item?.id ?? "")}
                          label="Blood Group"
                          placeholder="Select blood group"
                          displayField="label"
                          searchFields={["label"]}
                        />
                      )}
                    />

                    {/* Personal Mobile */}

                    <Input
                      {...register("personalMobileNo", {
                        required: "Personal mobile number is required",
                      })}
                      label="Personal Mobile No"
                      placeholder="Enter mobile number"
                      error={errors.personalMobileNo?.message}
                    />

                    {/* Personal Email */}

                    <Input
                      {...register("personalEmail")}
                      label="Personal Email"
                      type="email"
                      placeholder="Enter personal email"
                    />
                  </div>
                </Card>

                {/* Step buttons */}

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    onClick={() => navigate("/employee/employeeRegister")}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    color="primary"
                    onClick={() => goNext(STEP1_REQUIRED_FIELDS, 2)}
                  >
                    Next: Identity & KYC
                  </Button>
                </div>
              </div>
            )}

            {/* ========================================================
                STEP 2: IDENTITY & KYC
            ======================================================== */}

            {step === 2 && (
              <div className="space-y-6">
                <Card className="space-y-4 p-4 sm:p-6">
                  <h3 className="dark:text-dark-50 border-primary text-primary w-37 border-b-4 text-lg font-bold tracking-wide lg:text-lg">
                    Identity & KYC
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {renderEmployeePhotoField()}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {renderKycField(
                      "aadharNumber",
                      "aadharCardUpload",
                      "Aadhar Card",
                    )}

                    {renderKycField(
                      "drivingLicenceNumber",
                      "drivingLicenceUpload",
                      "Driving Licence",
                    )}

                    {renderKycField("panNumber", "panUpload", "PAN Card")}

                    {renderKycField(
                      "voterIdNumber",
                      "voterIdUpload",
                      "Voter ID",
                    )}
                  </div>
                </Card>

                {/* Step buttons */}

                <div className="flex justify-between gap-3 pt-2">
                  <Button
                    variant="outlined"
                    type="button"
                    onClick={() => setStep(1)}
                  >
                    <ChevronLeftIcon className="size-4" />
                    Back
                  </Button>

                  <Button
                    type="button"
                    color="primary"
                    onClick={() => {
                      if (!validateKycStep()) {
                        return;
                      }

                      setStep(3);
                    }}
                  >
                    Next: Address Details
                  </Button>
                </div>
              </div>
            )}

            {/* ========================================================
                STEP 3: ADDRESS DETAILS
            ======================================================== */}

            {step === 3 && (
              <div className="space-y-6">
                {/* ----------------------------------------------------
                    CURRENT ADDRESS
                ---------------------------------------------------- */}

                <Card className="space-y-4 p-4 sm:p-6">
                  <h3 className="dark:text-dark-50 border-primary text-primary w-40 border-b-4 text-lg font-bold tracking-wide lg:text-lg">
                    Current Address
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Address */}

                    <Input
                      {...register("address", {
                        required: "Address is required",
                      })}
                      label="Address"
                      placeholder="Enter address"
                      className="sm:col-span-2 lg:col-span-1"
                      error={errors.address?.message}
                    />

                    {/* Country */}

                    <Controller
                      control={control}
                      name="country"
                      rules={{
                        required: "Country is required",
                      }}
                      render={({ field: { value, onChange } }) => (
                        <Combobox
                          data={countryOptions}
                          value={
                            countryOptions.find(
                              (item) => item.label === value,
                            ) || null
                          }
                          onChange={(item: any) => {
                            onChange(item?.label ?? "");

                            setCurrentCountryCode(item?.id ?? "");

                            setValue("state", "");
                            setValue("city", "");
                            setCurrentStateCode("");
                          }}
                          label="Country"
                          placeholder="Select country"
                          displayField="label"
                          searchFields={["label"]}
                          error={errors.country?.message}
                        />
                      )}
                    />

                    {/* State */}

                    <Controller
                      control={control}
                      name="state"
                      rules={{
                        required: "State is required",
                      }}
                      render={({ field: { value, onChange } }) => (
                        <Combobox
                          data={currentStateOptions}
                          value={
                            currentStateOptions.find(
                              (item) => item.label === value,
                            ) || null
                          }
                          onChange={(item: any) => {
                            onChange(item?.label ?? "");
                            setCurrentStateCode(item?.id ?? "");
                            setValue("city", "");
                          }}
                          label="State"
                          placeholder={
                            currentCountryCode
                              ? "Select state"
                              : "Select country first"
                          }
                          displayField="label"
                          searchFields={["label"]}
                          disabled={!currentCountryCode}
                          error={errors.state?.message}
                        />
                      )}
                    />

                    {/* City */}

                    <Controller
                      control={control}
                      name="city"
                      rules={{
                        required: "District/City is required",
                      }}
                      render={({ field: { value, onChange } }) => (
                        <Combobox
                          data={currentCityOptions}
                          value={
                            currentCityOptions.find(
                              (item) => item.label === value,
                            ) || null
                          }
                          onChange={(item: any) => onChange(item?.label ?? "")}
                          label="District / City"
                          placeholder={
                            currentStateCode
                              ? "Select district/city"
                              : "Select state first"
                          }
                          displayField="label"
                          searchFields={["label"]}
                          disabled={!currentStateCode}
                          error={errors.city?.message}
                        />
                      )}
                    />

                    {/* Pincode */}

                    <Input
                      {...register("pincode", {
                        required: "Pincode is required",
                      })}
                      label="Pincode"
                      placeholder="Enter pincode"
                      error={errors.pincode?.message}
                    />
                  </div>
                </Card>

                {/* ----------------------------------------------------
                    PERMANENT ADDRESS
                ---------------------------------------------------- */}

                <Card className="space-y-4 p-4 sm:p-6">
                  <Controller
                    control={control}
                    name="sameAsPermanentAddress"
                    render={({ field: { value, onChange } }) => (
                      <Switch
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                        label="Permanent address is same as current address"
                      />
                    )}
                  />

                  {!sameAsPermanentAddress && (
                    <div className="space-y-4 pt-2">
                      <h3 className="dark:text-dark-100 text-lg font-medium text-gray-800">
                        Permanent Address
                      </h3>

                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Permanent Address */}

                        <Input
                          {...register("permanentAddress")}
                          label="Address"
                          placeholder="Enter permanent address"
                          className="sm:col-span-2 lg:col-span-1"
                        />

                        {/* Permanent Country */}

                        <Controller
                          control={control}
                          name="permanentCountry"
                          render={({ field: { value, onChange } }) => (
                            <Combobox
                              data={countryOptions}
                              value={
                                countryOptions.find(
                                  (item) => item.label === value,
                                ) || null
                              }
                              onChange={(item: any) => {
                                onChange(item?.label ?? "");

                                setPermanentCountryCode(item?.id ?? "");

                                setValue("permanentState", "");
                                setValue("permanentCity", "");
                                setPermanentStateCode("");
                              }}
                              label="Country"
                              placeholder="Select country"
                              displayField="label"
                              searchFields={["label"]}
                            />
                          )}
                        />

                        {/* Permanent State */}

                        <Controller
                          control={control}
                          name="permanentState"
                          render={({ field: { value, onChange } }) => (
                            <Combobox
                              data={permanentStateOptions}
                              value={
                                permanentStateOptions.find(
                                  (item) => item.label === value,
                                ) || null
                              }
                              onChange={(item: any) => {
                                onChange(item?.label ?? "");
                                setPermanentStateCode(item?.id ?? "");
                                setValue("permanentCity", "");
                              }}
                              label="State"
                              placeholder={
                                permanentCountryCode
                                  ? "Select state"
                                  : "Select country first"
                              }
                              displayField="label"
                              searchFields={["label"]}
                              disabled={!permanentCountryCode}
                            />
                          )}
                        />

                        {/* Permanent City */}

                        <Controller
                          control={control}
                          name="permanentCity"
                          render={({ field: { value, onChange } }) => (
                            <Combobox
                              data={permanentCityOptions}
                              value={
                                permanentCityOptions.find(
                                  (item) => item.label === value,
                                ) || null
                              }
                              onChange={(item: any) =>
                                onChange(item?.label ?? "")
                              }
                              label="District / City"
                              placeholder={
                                permanentStateCode
                                  ? "Select district/city"
                                  : "Select state first"
                              }
                              displayField="label"
                              searchFields={["label"]}
                              disabled={!permanentStateCode}
                            />
                          )}
                        />

                        {/* Permanent Pincode */}

                        <Input
                          {...register("permanentPincode")}
                          label="Pincode"
                          placeholder="Enter pincode"
                        />
                      </div>
                    </div>
                  )}
                </Card>

                {/* Step buttons */}

                <div className="flex justify-between gap-3 pt-2">
                  <Button
                    variant="outlined"
                    type="button"
                    onClick={() => setStep(2)}
                  >
                    <ChevronLeftIcon className="size-4" />
                    Back
                  </Button>

                  <Button
                    type="button"
                    color="primary"
                    onClick={() => goNext(STEP3_REQUIRED_FIELDS, 4)}
                  >
                    Next: Employee Details
                  </Button>
                </div>
              </div>
            )}

            {/* ========================================================
                STEP 4: EMPLOYEE DETAILS
            ======================================================== */}

            {step === 4 && (
              <div className="space-y-6">
                <Card className="space-y-4 p-4 sm:p-6">
                  <h3 className="dark:text-dark-50 border-primary text-primary w-40 border-b-4 text-lg font-bold tracking-wide lg:text-lg">
                    Employee Details
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Joining Date */}

                    <Controller
                      control={control}
                      name="joiningDate"
                      rules={{
                        required: "Joining date is required",
                      }}
                      render={({ field: { value, onChange } }) => (
                        <DatePicker
                          label="Joining Date"
                          placeholder="Choose date..."
                          value={value}
                          onChange={(_dates, dateStr) => onChange(dateStr)}
                          error={errors.joiningDate?.message}
                        />
                      )}
                    />

                    {/* Employee Type */}

                    <Controller
                      control={control}
                      name="employeeType"
                      rules={{
                        required: "Employee type is required",
                      }}
                      render={({ field: { value, onChange } }) => (
                        <Combobox
                          data={employeeTypeOptions}
                          value={
                            employeeTypeOptions.find(
                              (item) => item.id === value,
                            ) || null
                          }
                          onChange={(item: any) => onChange(item?.id ?? "")}
                          label="Employee Type"
                          placeholder="Select employee type"
                          displayField="label"
                          searchFields={["label"]}
                          error={errors.employeeType?.message}
                        />
                      )}
                    />

                    {/* Department */}

                    <Input
                      {...register("department")}
                      label="Department"
                      placeholder="Enter department"
                      error={errors.department?.message}
                    />

                    {/* Designation */}

                    <Input
                      {...register("designation", {
                        required: "Designation is required",
                      })}
                      label="Designation"
                      placeholder="Enter designation"
                      error={errors.designation?.message}
                    />

                    {/* Branch Location */}

                    <Input
                      {...register("branchLocation")}
                      label="Branch Location"
                      placeholder="Enter branch location"
                    />

                    {/* Employee Status */}

                    <Controller
                      control={control}
                      name="employeeStatus"
                      rules={{
                        required: "Employee status is required",
                      }}
                      render={({ field: { value, onChange } }) => (
                        <Combobox
                          data={employeeStatusOptions}
                          value={
                            employeeStatusOptions.find(
                              (item) => item.id === value,
                            ) || null
                          }
                          onChange={(item: any) => onChange(item?.id ?? "")}
                          label="Employee Status"
                          placeholder="Select employee status"
                          displayField="label"
                          searchFields={["label"]}
                          error={errors.employeeStatus?.message}
                        />
                      )}
                    />

                    {/* Notice Period */}

                    <Input
                      {...register("noticePeriod")}
                      label="Notice Period"
                      placeholder="e.g. 30 days"
                    />
                  </div>
                </Card>

                {/* Step buttons */}

                <div className="flex justify-between gap-3 pt-2">
                  <Button
                    variant="outlined"
                    type="button"
                    disabled={saving}
                    onClick={() => setStep(3)}
                  >
                    <ChevronLeftIcon className="size-4" />
                    Back
                  </Button>

                  <Button
                    type="button"
                    color="primary"
                    onClick={() => goNext(STEP4_REQUIRED_FIELDS, 5)}
                  >
                    Next: Work Information
                  </Button>
                </div>
              </div>
            )}

            {/* ========================================================
                STEP 5: WORK INFORMATION
            ======================================================== */}

            {step === 5 && (
              <div className="space-y-6">
                <Card className="space-y-6 p-4 sm:p-6">
                  <h3 className="dark:text-dark-50 border-primary text-primary w-40 border-b-4 text-lg font-bold tracking-wide lg:text-lg">
                    Work Information
                  </h3>

                  {/* Working Days — multi-select toggle pills */}

                  <Controller
                    control={control}
                    name="workingDays"
                    rules={{
                      validate: (value) =>
                        (value && value.length > 0) ||
                        "Select at least one working day",
                    }}
                    render={({ field: { value, onChange } }) => (
                      <div>
                        <label className="mb-4 block text-sm font-medium text-gray-700 dark:text-gray-200">
                          Working Days
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {daysOfWeekOptions.map((day) => {
                            const checked = value?.includes(day.id);
                            return (
                              <button
                                key={day.id}
                                type="button"
                                onClick={() => {
                                  if (checked) {
                                    onChange(value.filter((d) => d !== day.id));
                                  } else {
                                    onChange([...(value || []), day.id]);
                                  }
                                }}
                                className={
                                  checked
                                    ? "bg-primary border-primary rounded-full border px-3 py-1.5 text-xs font-medium text-white"
                                    : "rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 dark:border-gray-600 dark:text-gray-200"
                                }
                              >
                                {day.label}
                              </button>
                            );
                          })}
                        </div>
                        {errors.workingDays && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.workingDays.message as string}
                          </p>
                        )}
                      </div>
                    )}
                  />

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Weekly Off */}

                    <Controller
                      control={control}
                      name="weeklyOff"
                      rules={{
                        required: "Weekly off is required",
                      }}
                      render={({ field: { value, onChange } }) => (
                        <Combobox
                          data={daysOfWeekOptions}
                          value={
                            daysOfWeekOptions.find(
                              (item) => item.id === value,
                            ) || null
                          }
                          onChange={(item: any) => onChange(item?.id ?? "")}
                          label="Weekly Off"
                          placeholder="Select weekly off"
                          displayField="label"
                          searchFields={["label"]}
                          error={errors.weeklyOff?.message}
                        />
                      )}
                    />

                    {/* Working Hours From */}

                    <Controller
                      control={control}
                      name="workingHoursFrom"
                      rules={{
                        required: "Working hours (from) is required",
                      }}
                      render={({ field: { value, onChange } }) => (
                        <DatePicker
                          label="Working Hours From"
                          placeholder="Choose time..."
                          value={value}
                          onChange={(_dates, timeStr) => onChange(timeStr)}
                          options={{
                            enableTime: true,
                            noCalendar: true,
                            dateFormat: "H:i",
                            time_24hr: true,
                          }}
                          error={errors.workingHoursFrom?.message}
                        />
                      )}
                    />

                    {/* Working Hours To */}

                    <Controller
                      control={control}
                      name="workingHoursTo"
                      rules={{
                        required: "Working hours (to) is required",
                      }}
                      render={({ field: { value, onChange } }) => (
                        <DatePicker
                          label="Working Hours To"
                          placeholder="Choose time..."
                          value={value}
                          onChange={(_dates, timeStr) => onChange(timeStr)}
                          options={{
                            enableTime: true,
                            noCalendar: true,
                            dateFormat: "H:i",
                            time_24hr: true,
                          }}
                          error={errors.workingHoursTo?.message}
                        />
                      )}
                    />

                    {/* Working Shift */}

                    <Controller
                      control={control}
                      name="workingShift"
                      rules={{
                        required: "Working shift is required",
                      }}
                      render={({ field: { value, onChange } }) => (
                        <Combobox
                          data={workingShiftOptions}
                          value={
                            workingShiftOptions.find(
                              (item) => item.id === value,
                            ) || null
                          }
                          onChange={(item: any) => onChange(item?.id ?? "")}
                          label="Working Shift"
                          placeholder="Select working shift"
                          displayField="label"
                          searchFields={["label"]}
                          error={errors.workingShift?.message}
                        />
                      )}
                    />
                  </div>
                </Card>

                {/* Final buttons */}

                <div className="flex justify-between gap-3 pt-2">
                  <Button
                    variant="outlined"
                    type="button"
                    disabled={saving}
                    onClick={() => setStep(4)}
                  >
                    <ChevronLeftIcon className="size-4" />
                    Back
                  </Button>

                  <Button
                    type="button"
                    color="primary"
                    disabled={saving}
                    onClick={handleFinalSubmit}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Page>
  );
}
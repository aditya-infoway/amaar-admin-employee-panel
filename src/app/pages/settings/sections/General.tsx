import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Country, State, City } from "country-state-city";

import { PreviewImg } from "@/components/shared/PreviewImg";
import { Avatar, Input } from "@/components/ui";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import { URL as ApiUrl, Get, toasterrormsg } from "@/ApiHelper";
import { genderOptions } from "../../master/shared/constants";

// ---------------- Local option lists ----------------
const maritalStatusOptions = [
  { id: "single", label: "Single" },
  { id: "married", label: "Married" },
  { id: "divorced", label: "Divorced" },
  { id: "widowed", label: "Widowed" },
];

const bloodGroupOptions = [
  { id: "A+", label: "A+" },
  { id: "A-", label: "A-" },
  { id: "B+", label: "B+" },
  { id: "B-", label: "B-" },
  { id: "AB+", label: "AB+" },
  { id: "AB-", label: "AB-" },
  { id: "O+", label: "O+" },
  { id: "O-", label: "O-" },
];

// ---------------- Form data shape ----------------
interface EmployeeProfileType {
  employeeId: string;

  // Personal Details
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  bloodGroup: string;
  personalMobileNo: string;
  personalEmail: string;

  // Identity & KYC
  employeePhoto?: File | string | null;
  aadharNumber?: string;
  drivingLicenceNumber?: string;
  panNumber?: string;
  voterIdNumber?: string;

  // Address — Current
  address: string;
  country: string;
  state: string;
  city: string;
  pincode: string;

  // Address — Permanent
  sameAsPermanentAddress: boolean;
  permanentAddress?: string;
  permanentCountry?: string;
  permanentState?: string;
  permanentCity?: string;
  permanentPincode?: string;

  // Employee Details
  joiningDate: string;
  employeeType: string;
  designation: string;
  branchLocation: string;
  employeeStatus: string;
  noticePeriod: string;

  // Work Information
  workingDays: string[];
  weeklyOff: string;
  workingHoursFrom: string;
  workingHoursTo: string;
  workingShift: string;
}

const emptyEmployee = (): EmployeeProfileType => ({
  employeeId: "",
  firstName: "",
  lastName: "",
  middleName: "",
  dateOfBirth: "",
  gender: "",
  maritalStatus: "",
  bloodGroup: "",
  personalMobileNo: "",
  personalEmail: "",
  employeePhoto: null,
  aadharNumber: "",
  drivingLicenceNumber: "",
  panNumber: "",
  voterIdNumber: "",
  address: "",
  country: "",
  state: "",
  city: "",
  pincode: "",
  sameAsPermanentAddress: true,
  permanentAddress: "",
  permanentCountry: "",
  permanentState: "",
  permanentCity: "",
  permanentPincode: "",
  joiningDate: "",
  employeeType: "",
  designation: "",
  branchLocation: "",
  employeeStatus: "",
  noticePeriod: "",
  workingDays: [],
  weeklyOff: "",
  workingHoursFrom: "",
  workingHoursTo: "",
  workingShift: "",
});

// ----------------------------------------------------------------------

export default function General() {
  const [fetching, setFetching] = useState(true);

  const { register, control, watch, reset } = useForm<EmployeeProfileType>({
    defaultValues: emptyEmployee(),
  });

  const employeePhotoValue = watch("employeePhoto");
  const selectedCountry = watch("country");
  const selectedState = watch("state");

  // ===== Country / State / City option lists =====
  const countryOptions = useMemo(
    () =>
      Country.getAllCountries().map((c) => ({ id: c.isoCode, label: c.name })),
    [],
  );

  const currentCountryCode =
    Country.getAllCountries().find((c) => c.name === selectedCountry)
      ?.isoCode || "";

  const currentStateCode =
    State.getStatesOfCountry(currentCountryCode).find(
      (s) => s.name === selectedState,
    )?.isoCode || "";

  const currentStateOptions = useMemo(() => {
    if (!currentCountryCode) return [];

    return State.getStatesOfCountry(currentCountryCode).map((s) => ({
      id: s.isoCode,
      label: s.name,
    }));
  }, [currentCountryCode]);

  const currentCityOptions = useMemo(() => {
    if (!currentCountryCode || !currentStateCode) return [];

    return City.getCitiesOfState(currentCountryCode, currentStateCode).map(
      (c) => ({
        id: c.name,
        label: c.name,
      }),
    );
  }, [currentCountryCode, currentStateCode]);

  // ---- Fetch existing employee details and display them as read-only ----
  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      setFetching(true);

      try {
        const employeeId = localStorage.getItem("employeeId");

        if (!employeeId) {
          toasterrormsg("No employee found.");
          setFetching(false);
          return;
        }

        const response = await Get(
          "hr/employee/profile",
          { employeeId },
          false,
        );

        if (response.data?.success) {
          const d = response.data.data;

          reset({
            employeeId: d.employeeId || "",
            firstName: d.firstName || "",
            lastName: d.lastName || "",
            middleName: d.middleName || "",
            dateOfBirth: d.dateOfBirth || "",
            gender: d.gender || "",
            maritalStatus: d.maritalStatus || "",
            bloodGroup: d.bloodGroup || "",
            personalMobileNo: d.personalMobileNo || "",
            personalEmail: d.personalEmail || "",
            employeePhoto: d.employeePhoto || null,
            aadharNumber: d.aadharNumber || "",
            drivingLicenceNumber: d.drivingLicenceNumber || "",
            panNumber: d.panNumber || "",
            voterIdNumber: d.voterIdNumber || "",
            address: d.address || "",
            country: d.country || "",
            state: d.state || "",
            city: d.city || "",
            pincode: d.pincode || "",
            sameAsPermanentAddress: d.sameAsPermanentAddress ?? true,
            permanentAddress: d.permanentAddress || "",
            permanentCountry: d.permanentCountry || "",
            permanentState: d.permanentState || "",
            permanentCity: d.permanentCity || "",
            permanentPincode: d.permanentPincode || "",
            joiningDate: d.joiningDate || "",
            employeeType: d.employeeType || "",
            designation: d.designation || "",
            branchLocation: d.branchLocation || "",
            employeeStatus: d.employeeStatus || "",
            noticePeriod: d.noticePeriod || "",
            workingDays: d.workingDays
              ? String(d.workingDays).split(",").filter(Boolean)
              : [],
            weeklyOff: d.weeklyOff || "",
            workingHoursFrom: d.workingHoursFrom || "",
            workingHoursTo: d.workingHoursTo || "",
            workingShift: d.workingShift || "",
          });
        } else {
          toasterrormsg(
            response.data?.message || "Failed to fetch employee details.",
          );
        }
      } catch (error) {
        toasterrormsg("Something went wrong while fetching employee details.");
      } finally {
        setFetching(false);
      }
    };

    fetchEmployeeDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const getFileUrl = (path?: string) => {
    if (!path) return "";

    return /^https?:\/\//i.test(path)
      ? path
      : `${ApiUrl.localurl}${path.replace(/^\/+/, "")}`;
  };
  const renderKycField = (
    numberField:
      | "aadharNumber"
      | "drivingLicenceNumber"
      | "panNumber"
      | "voterIdNumber",
    label: string,
  ) => (
    <div>
      <Input
        {...register(numberField)}
        label={label}
        className="rounded-xl"
        readOnly
      />
    </div>
  );

  if (fetching) {
    return (
      <div className="w-full max-w-3xl 2xl:max-w-5xl">
        <p className="dark:text-dark-200 text-sm text-gray-500">
          Loading employee details...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl 2xl:max-w-5xl">
      <h5 className="dark:text-dark-50 text-lg font-medium text-gray-800">
        General
      </h5>
      <p className="dark:text-dark-200 mt-0.5 text-sm text-balance text-gray-500">
        View your employee profile.
      </p>
      <div className="dark:bg-dark-500 my-5 h-px bg-gray-200" />

      <form autoComplete="off">
        {/* Employee Photo - Read Only */}
        <div className="mt-4 flex flex-col space-y-1.5">
          <span className="dark:text-dark-100 text-base font-medium text-gray-800">
            Employee Photo
          </span>
          <Avatar
            size={20}
            src={
              typeof employeePhotoValue === "string" && employeePhotoValue
                ? getFileUrl(employeePhotoValue)
                : "/images/logos/company-placeholder.svg"
            }
            classNames={{
              root: "ring-primary-600 dark:ring-primary-500 dark:ring-offset-dark-700 rounded-xl ring-offset-[3px] ring-offset-white",
              display: "rounded-xl",
            }}
          />
        </div>

        <div className="dark:bg-dark-500 my-7 h-px bg-gray-200" />

        {/* Personal Details - Read Only */}
        <div>
          <p className="dark:text-dark-100 text-base font-medium text-gray-800">
            Personal Details
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              {...register("employeeId")}
              label="Employee ID"
              readOnly
              disabled
              className="dark:bg-dark-700 rounded-xl bg-gray-100"
            />

            <Input
              {...register("firstName")}
              label="First Name"
              readOnly
              className="rounded-xl"
            />

            <Input
              {...register("lastName")}
              label="Last Name"
              readOnly
              className="rounded-xl"
            />

            <Input
              {...register("middleName")}
              label="Middle Name"
              readOnly
              className="rounded-xl"
            />

            <Controller
              control={control}
              name="dateOfBirth"
              render={({ field: { value } }) => (
                <DatePicker label="Date of Birth" value={value} disabled />
              )}
            />

            <Controller
              control={control}
              name="gender"
              render={({ field: { value } }) => (
                <Combobox
                  data={genderOptions}
                  value={
                    genderOptions.find((item) => item.id === value) || null
                  }
                  onChange={() => {}}
                  label="Gender"
                  displayField="label"
                  searchFields={["label"]}
                  disabled
                />
              )}
            />

            <Controller
              control={control}
              name="maritalStatus"
              render={({ field: { value } }) => (
                <Combobox
                  data={maritalStatusOptions}
                  value={
                    maritalStatusOptions.find((item) => item.id === value) ||
                    null
                  }
                  onChange={() => {}}
                  label="Marital Status"
                  displayField="label"
                  searchFields={["label"]}
                  disabled
                />
              )}
            />

            <Controller
              control={control}
              name="bloodGroup"
              render={({ field: { value } }) => (
                <Combobox
                  data={bloodGroupOptions}
                  value={
                    bloodGroupOptions.find((item) => item.id === value) || null
                  }
                  onChange={() => {}}
                  label="Blood Group"
                  displayField="label"
                  searchFields={["label"]}
                  disabled
                />
              )}
            />

            <Input
              {...register("personalMobileNo")}
              label="Personal Mobile No"
              readOnly
              className="rounded-xl"
            />

            <Input
              {...register("personalEmail")}
              label="Personal Email"
              type="email"
              readOnly
              className="rounded-xl"
            />
          </div>
        </div>

        <div className="dark:bg-dark-500 my-7 h-px bg-gray-200" />

        {/* Identity & KYC - Read Only */}
        <div>
          <p className="dark:text-dark-100 text-base font-medium text-gray-800">
            Identity & KYC
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {renderKycField("aadharNumber", "Aadhar Card")}
            {renderKycField("drivingLicenceNumber", "Driving Licence")}
            {renderKycField("panNumber", "PAN Card")}
            {renderKycField("voterIdNumber", "Voter ID")}
          </div>
        </div>

        <div className="dark:bg-dark-500 my-7 h-px bg-gray-200" />

        {/* Current Address - Read Only */}
        <div>
          <p className="dark:text-dark-100 text-base font-medium text-gray-800">
            Current Address
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              {...register("address")}
              label="Address"
              readOnly
              className="rounded-xl"
            />

            <Controller
              control={control}
              name="country"
              render={({ field: { value } }) => (
                <Combobox
                  data={countryOptions}
                  value={
                    countryOptions.find((item) => item.label === value) || null
                  }
                  onChange={() => {}}
                  label="Country"
                  displayField="label"
                  searchFields={["label"]}
                  disabled
                />
              )}
            />

            <Controller
              control={control}
              name="state"
              render={({ field: { value } }) => (
                <Combobox
                  data={currentStateOptions}
                  value={
                    currentStateOptions.find((item) => item.label === value) ||
                    null
                  }
                  onChange={() => {}}
                  label="State"
                  displayField="label"
                  searchFields={["label"]}
                  disabled
                />
              )}
            />

            <Controller
              control={control}
              name="city"
              render={({ field: { value } }) => (
                <Combobox
                  data={currentCityOptions}
                  value={
                    currentCityOptions.find((item) => item.label === value) ||
                    null
                  }
                  onChange={() => {}}
                  label="District / City"
                  displayField="label"
                  searchFields={["label"]}
                  disabled
                />
              )}
            />

            <Input
              {...register("pincode")}
              label="Pincode"
              readOnly
              className="rounded-xl"
            />
          </div>
        </div>
      </form>
    </div>
  );
}

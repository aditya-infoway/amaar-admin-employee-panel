export interface EmployeeEntry {
  // Storage retains the full employee record, including optional legacy fields.
  [key: string]: string | boolean | string[];
  id: string;
  employeeId: string;

  // Personal Details
  firstName: string;
  lastName: string;
  middleName: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  bloodGroup: string;
  personalMobileNo: string;
  personalEmail: string;

  // Identity & KYC
  aadharNumber: string;
  aadharCardUpload: string;
  drivingLicenceNumber: string;
  drivingLicenceUpload: string;
  panNumber: string;
  panUpload: string;
  voterIdNumber: string;
  voterIdUpload: string;

  // Address Details — Current
  address: string;
  country: string;
  state: string;
  city: string;
  pincode: string;

  // Address Details — Permanent
  sameAsPermanentAddress: boolean;
  permanentAddress: string;
  permanentCountry: string;
  permanentState: string;
  permanentCity: string;
  permanentPincode: string;

  // Employee Details
  joiningDate: string;
  employeeType: string;
  department: string;
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

export const generateEmployeeId = () => `EMP-${Date.now().toString().slice(-6)}`;

export const emptyEmployee = (): EmployeeEntry => ({
  id: "",
  employeeId: generateEmployeeId(),

  firstName: "",
  lastName: "",
  middleName: "",
  dateOfBirth: "",
  gender: "",
  maritalStatus: "",
  bloodGroup: "",
  personalMobileNo: "",
  personalEmail: "",

  aadharNumber: "",
  aadharCardUpload: "",
  drivingLicenceNumber: "",
  drivingLicenceUpload: "",
  panNumber: "",
  panUpload: "",
  voterIdNumber: "",
  voterIdUpload: "",

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
  department: "",
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

// ---- Backend response (employeeEntryId etc.) ko frontend shape me map karna ----
export function mapApiEmployeeEntryToEmployeeEntry(api: any): EmployeeEntry {
  return {
      id: String(
      api.employeeId ??
      api.employeeEntryId ??
      api.id ??
      "",
    ),

    employeeId: String(
      api.employeeCode ??
      api.generatedEmployeeId ??
      api.employeeId ??
      "",
    ),

    firstName: api.firstName ?? "",
    lastName: api.lastName ?? "",
    middleName: api.middleName ?? "",
    dateOfBirth: api.dateOfBirth ?? "",
    gender: api.gender ?? "",
    maritalStatus: api.maritalStatus ?? "",
    bloodGroup: api.bloodGroup ?? "",
    personalMobileNo: api.personalMobileNo ?? "",
    personalEmail: api.personalEmail ?? "",

    aadharNumber: api.aadharNumber ?? "",
    aadharCardUpload: api.aadharCardUpload ?? "",
    drivingLicenceNumber: api.drivingLicenceNumber ?? "",
    drivingLicenceUpload: api.drivingLicenceUpload ?? "",
    panNumber: api.panNumber ?? "",
    panUpload: api.panUpload ?? "",
    voterIdNumber: api.voterIdNumber ?? "",
    voterIdUpload: api.voterIdUpload ?? "",

    address: api.address ?? "",
    country: api.country ?? "",
    state: api.state ?? "",
    city: api.city ?? "",
    pincode: api.pincode ?? "",

    sameAsPermanentAddress: Boolean(api.sameAsPermanentAddress),
    permanentAddress: api.permanentAddress ?? "",
    permanentCountry: api.permanentCountry ?? "",
    permanentState: api.permanentState ?? "",
    permanentCity: api.permanentCity ?? "",
    permanentPincode: api.permanentPincode ?? "",

    joiningDate: api.joiningDate ?? "",
    employeeType: api.employeeType ?? "",
    department: api.department ?? "",
    designation: api.designation ?? "",
    branchLocation: api.branchLocation ?? "",
    employeeStatus: api.employeeStatus ?? "",
    noticePeriod: api.noticePeriod ?? "",

    workingDays:
      typeof api.workingDays === "string" && api.workingDays
        ? api.workingDays.split(",")
        : Array.isArray(api.workingDays)
          ? api.workingDays
          : [],
    weeklyOff: api.weeklyOff ?? "",
    workingHoursFrom: api.workingHoursFrom ?? "",
    workingHoursTo: api.workingHoursTo ?? "",
    workingShift: api.workingShift ?? "",
  };
}
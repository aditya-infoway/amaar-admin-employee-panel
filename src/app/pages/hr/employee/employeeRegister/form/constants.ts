// ⚠️ If your project keeps a shared master/shared/constants.ts, move these
// arrays there instead (alongside genderOptions, idProofTypeOptions, etc.)
// so every employee-module file can import from one place.

export const maritalStatusOptions = [
  { id: "single", label: "Single" },
  { id: "married", label: "Married" },
  { id: "divorced", label: "Divorced" },
  { id: "widowed", label: "Widowed" },
];

export const bloodGroupOptions = [
  { id: "A+", label: "A+" },
  { id: "A-", label: "A-" },
  { id: "B+", label: "B+" },
  { id: "B-", label: "B-" },
  { id: "AB+", label: "AB+" },
  { id: "AB-", label: "AB-" },
  { id: "O+", label: "O+" },
  { id: "O-", label: "O-" },
];

export const employeeTypeOptions = [
  { id: "permanent", label: "Permanent" },
  { id: "probation", label: "Probation" },
  { id: "trainee", label: "Trainee" },
  { id: "contract", label: "Contract" },
  { id: "intern", label: "Intern" },
];

export const employeeStatusOptions = [
  { id: "active", label: "Active" },
  { id: "on_notice", label: "On Notice" },
  { id: "suspended", label: "Suspended" },
  { id: "resigned", label: "Resigned" },
  { id: "terminated", label: "Terminated" },
  { id: "retired", label: "Retired" },
];
export const daysOfWeekOptions = [
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
  { id: "friday", label: "Friday" },
  { id: "saturday", label: "Saturday" },
  { id: "sunday", label: "Sunday" },
];

export const workingShiftOptions = [
  { id: "general", label: "General Shift" },
  { id: "morning", label: "Morning Shift" },
  { id: "evening", label: "Evening Shift" },
  { id: "night", label: "Night Shift" },
];
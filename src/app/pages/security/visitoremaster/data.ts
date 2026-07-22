export interface VisitorEntry {
  // Storage retains the full visitor record, including optional legacy fields.
  [key: string]: string | boolean;
  id: string;
  visitorId: string;

  // Personal Details
  fullName: string;
  gender: string;
  mobileNumber: string;
  email: string;
  company: string;
  address: string;
  city: string;
  state: string;
  pincode: string;

  // Identity Proof
  idProofType: string;
  idProofNumber: string;
  idFrontPhoto: string;
  idBackPhoto: string;

  // Visit Details
  visitDate: string;
  entryTime: string;
  exitTime: string;
  purpose: string;
  department: string;
  personToMeet: string;
  employeeId: string;
  duration: string;

  // Visitor Information
  numberOfPersons: string;
  adultCount: string;
  childCount: string;
  accompanyingPerson: string;
  vehicleAvailable: boolean;
  vehicleNumber: string;
  previousVisit: boolean;
  frequentVisitor: boolean;

  // Security Details
  gate: string;
  securityGuard: string;
  mobileCount: string;
  allowedAreas: string;
  restrictedAreas: string;
  otherItems: string;
  bagChecked: boolean;
  laptop: boolean;
  camera: boolean;
  visitorPhoto: string;

  // OTP + Check-in
  otp: string;
  otpGeneratedAt: string;
  otpVerified: boolean;
  checkInTime: string;
  checkOutTime: string;
  status: string; // HOLD / IN / OUT

  // Gate Pass
  badgeNumber: string;
  gatePassNumber: string;
  gatePassIssuedAt: string;

  // Exit Details
  exitGate: string;
  badgeReturned: boolean;
  exitRemarks: string;
}

export const generateVisitorId = () => `VIS-${Date.now().toString().slice(-8)}`;

export const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const generateBadgeNumber = () =>
  `B-${Math.floor(1000 + Math.random() * 9000)}`;

export const generateGatePassNumber = () =>
  `GP-${Date.now().toString().slice(-8)}`;

export const generateTokenNumber = () =>
  `T-${Math.floor(1000 + Math.random() * 9000)}`;

export const emptyVisitor = (): VisitorEntry => ({
  id: "",
  visitorId: generateVisitorId(),

  fullName: "",
  gender: "",
  mobileNumber: "",
  email: "",
  company: "",
  address: "",
  city: "",
  state: "",
  pincode: "",

  idProofType: "",
  idProofNumber: "",
  idFrontPhoto: "",
  idBackPhoto: "",

  visitDate: "",
  entryTime: "",
  exitTime: "",
  purpose: "",
  department: "",
  personToMeet: "",
  employeeId: "",
  duration: "",

  numberOfPersons: "1",
  adultCount: "1",
  childCount: "0",
  accompanyingPerson: "",
  vehicleAvailable: false,
  vehicleNumber: "",
  previousVisit: false,
  frequentVisitor: false,

  gate: "",
  securityGuard: "",
  mobileCount: "0",
  allowedAreas: "",
  restrictedAreas: "",
  otherItems: "",
  bagChecked: false,
  laptop: false,
  camera: false,
  visitorPhoto: "",

  otp: "",
  otpGeneratedAt: "",
  otpVerified: false,
  checkInTime: "",
  checkOutTime: "",
  status: "HOLD",

  badgeNumber: "",
  gatePassNumber: "",
  gatePassIssuedAt: "",

  exitGate: "",
  badgeReturned: false,
  exitRemarks: "",
});

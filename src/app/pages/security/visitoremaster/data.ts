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
  country: string;
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
  country: "",
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

// ---- Backend response (visitorEntryId etc.) ko frontend shape me map karna ----
export function mapApiVisitorEntryToVisitorEntry(api: any): VisitorEntry {
  return {
    id: String(api.visitorEntryId),
    visitorId: api.visitorId ?? "",

    fullName: api.fullName ?? "",
    gender: api.gender ?? "",
    mobileNumber: api.mobileNumber ?? "",
    email: api.email ?? "",
    company: api.company ?? "",
    address: api.address ?? "",
    country: api.country ?? "",
    state: api.state ?? "",
    city: api.city ?? "",
    pincode: api.pincode ?? "",

    idProofType: api.idProofType ?? "",
    idProofNumber: api.idProofNumber ?? "",
    idFrontPhoto: api.idFrontPhoto ?? "",
    idBackPhoto: api.idBackPhoto ?? "",

    visitDate: api.visitDate ?? "",
    entryTime: api.entryTime ?? "",
    exitTime: api.exitTime ?? "",
    purpose: api.purpose ?? "",
    department: api.department ?? "",
    personToMeet: api.personToMeet ?? "",
    employeeId: api.employeeId ?? "",
    duration: api.duration ?? "",

    numberOfPersons: api.numberOfPersons ?? "",
    adultCount: api.adultCount ?? "",
    childCount: api.childCount ?? "",
    accompanyingPerson: api.accompanyingPerson ?? "",
    vehicleAvailable: Boolean(api.vehicleAvailable),
    vehicleNumber: api.vehicleNumber ?? "",
    previousVisit: Boolean(api.previousVisit),
    frequentVisitor: Boolean(api.frequentVisitor),

    gate: api.gate ?? "",
    securityGuard: api.securityGuard ?? "",
    mobileCount: api.mobileCount ?? "",
    allowedAreas: api.allowedAreas ?? "",
    restrictedAreas: api.restrictedAreas ?? "",
    otherItems: api.otherItems ?? "",
    bagChecked: Boolean(api.bagChecked),
    laptop: Boolean(api.laptop),
    camera: Boolean(api.camera),
    visitorPhoto: api.visitorPhoto ?? "",

    otp: api.otp ?? "",
    otpGeneratedAt: api.otpGeneratedAt ?? "",
    otpVerified: Boolean(api.otpVerified),
    checkInTime: api.checkInTime ?? "",
    checkOutTime: api.checkOutTime ?? "",
    status: api.status ?? "HOLD",

    badgeNumber: api.badgeNumber ?? "",
    gatePassNumber: api.gatePassNumber ?? "",
    gatePassIssuedAt: api.gatePassIssuedAt ?? "",

    exitGate: api.exitGate ?? "",
    badgeReturned: Boolean(api.badgeReturned),
    exitRemarks: api.exitRemarks ?? "",
  };
}

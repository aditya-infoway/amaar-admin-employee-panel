import type { VehicleEntry } from "../../vehicle-master/data";
import type { VisitorEntry } from "../../visitoremaster/data";

const VEHICLE_STORAGE_KEY = "vehicle-master-entries-v2";
const VISITOR_STORAGE_KEY = "visitor-master-entries-v2";

function writeStorage<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}

function normalizeGate(value: string | undefined): string {
  if (!value) return "";
  const map: Record<string, string> = {
    "Gate 1": "gate-1",
    "Gate 2": "gate-2",
    "Gate 3": "gate-3",
  };
  return map[value] || value;
}

function normalizeStatus(value: string | undefined): string {
  if (!value) return "HOLD";
  const map: Record<string, string> = {
    inside: "IN",
    exited: "OUT",
    in: "IN",
    out: "OUT",
    hold: "HOLD",
  };
  return map[value.toLowerCase()] || value.toUpperCase();
}

function normalizeIdProof(value: string | undefined): string {
  if (!value) return "";
  const map: Record<string, string> = {
    aadhar: "aadhaar",
    aadhaar: "aadhaar",
    pan: "pan",
    driving_license: "driving-license",
    "driving-license": "driving-license",
    voter_id: "voter-id",
    "voter-id": "voter-id",
    passport: "passport",
  };
  return map[value] || value;
}

function normalizeVehicle(raw: Record<string, unknown>): VehicleEntry {
  const item = raw as Partial<VehicleEntry> & {
    driverContact?: string;
  };

  return {
    id: item.id || crypto.randomUUID(),
    entryDate:
      item.entryDate ||
      (item.entryTime?.includes("T") ? item.entryTime.split("T")[0] : "") ||
      "",
    entryTime: item.entryTime || "",
    exitTime: item.exitTime || "",
    vehicleType: item.vehicleType || "",
    vehicleNumber: item.vehicleNumber || "",
    driverContact: item.driverContact || item.mobileNumber || "",
    rcNumber: item.rcNumber || "",
    vehicleBrand: item.vehicleBrand || "",
    vehicleModel: item.vehicleModel || "",
    vehicleColor: item.vehicleColor || "",
    driverName: item.driverName || "",
    mobileNumber: item.mobileNumber || item.driverContact || "",
    alternateMobile: item.alternateMobile || "",
    email: item.email || "",
    address: item.address || "",
    city: item.city || "",
    state: item.state || "",
    pincode: item.pincode || "",
    aadhaarNumber: item.aadhaarNumber || "",
    licenseNumber: item.licenseNumber || "",
    licenseExpiryDate: item.licenseExpiryDate || "",
    driverPhoto: item.driverPhoto || "",
    licensePhoto: item.licensePhoto || "",
    aadhaarPhoto: item.aadhaarPhoto || "",
    purpose: item.purpose || "",
    department: item.department || "",
    employeeToMeet: item.employeeToMeet || "",
    company: item.company || "",
    vendorName: item.vendorName || "",
    gateNumber: normalizeGate(item.gateNumber),
    entryType: item.entryType || "",
    passengerCount: item.passengerCount || "",
    passengerNames: item.passengerNames || "",
    materialCarried: item.materialCarried || "",
    remarks: item.remarks || "",
    securityGuardName: item.securityGuardName || "",
    entryGate: normalizeGate(
      typeof item.entryGate === "string"
        ? item.entryGate
        : typeof item.gateNumber === "string"
          ? item.gateNumber
          : undefined,
    ),
    exitGate: normalizeGate(
      typeof item.exitGate === "string" ? item.exitGate : undefined,
    ),
    vehicleCondition: item.vehicleCondition || "",
    fuelLevel: item.fuelLevel || "",
    damageBeforeEntry: item.damageBeforeEntry || "",
    damageAfterExit: item.damageAfterExit || "",
    securityNotes: item.securityNotes || "",
    status: normalizeStatus(item.status),
    rcPhoto: item.rcPhoto || "",
    driverLicensePhoto: item.driverLicensePhoto || "",
    aadhaarPhotoDoc: item.aadhaarPhotoDoc || "",
    vehiclePhotoFront: item.vehiclePhotoFront || "",
    vehiclePhotoBack: item.vehiclePhotoBack || "",
    vehiclePhotoLeft: item.vehiclePhotoLeft || "",
    vehiclePhotoRight: item.vehiclePhotoRight || "",
    exitVehicleCondition: item.exitVehicleCondition || "",
    conditionChangedAtExit: item.conditionChangedAtExit ?? false,
    exitPhotoFront: item.exitPhotoFront || "",
    exitPhotoBack: item.exitPhotoBack || "",
  };
}

function normalizeVisitor(raw: Record<string, unknown>): VisitorEntry {
  const item = raw as Partial<VisitorEntry> & {
    visitorName?: string;
    contactNumber?: string;
  };

  return {
    id: item.id || crypto.randomUUID(),
    visitorId: item.visitorId || `VIS-${Date.now().toString().slice(-8)}`,
    fullName: item.fullName || item.visitorName || "",
    fatherName: item.fatherName || "",
    gender: item.gender || "",
    dateOfBirth: item.dateOfBirth || "",
    age: item.age || "",
    mobileNumber: item.mobileNumber || item.contactNumber || "",
    alternateMobile: item.alternateMobile || "",
    email: item.email || "",
    company: item.company || "",
    designation: item.designation || "",
    address: item.address || "",
    city: item.city || "",
    state: item.state || "",
    pincode: item.pincode || "",
    nationality: item.nationality || "",
    idProofType: normalizeIdProof(item.idProofType),
    idProofNumber: item.idProofNumber || "",
    idFrontPhoto: item.idFrontPhoto || "",
    idBackPhoto: item.idBackPhoto || "",
    visitDate: item.visitDate || "",
    entryTime: item.entryTime || "",
    exitTime: item.exitTime || "",
    purpose: item.purpose || "",
    department: item.department || "",
    personToMeet: item.personToMeet || "",
    employeeId: item.employeeId || "",
    floor: item.floor || "",
    cabin: item.cabin || "",
    meetingRoom: item.meetingRoom || "",
    duration: item.duration || "",
    visitorPassNumber: item.visitorPassNumber || "",
    numberOfPersons: item.numberOfPersons || "1",
    adultCount: item.adultCount || "1",
    childCount: item.childCount || "0",
    vehicleAvailable: item.vehicleAvailable ?? false,
    vehicleNumber: item.vehicleNumber || "",
    accompanyingPerson: item.accompanyingPerson || "",
    previousVisit: item.previousVisit ?? false,
    frequentVisitor: item.frequentVisitor ?? false,
    visitorPhoto: item.visitorPhoto || "",
    fingerprint: item.fingerprint || "",
    signature: item.signature || "",
    gate: normalizeGate(item.gate),
    securityGuard: item.securityGuard || "",
    allowedAreas: item.allowedAreas || "",
    restrictedAreas: item.restrictedAreas || "",
    bagChecked: item.bagChecked ?? false,
    laptop: item.laptop ?? false,
    camera: item.camera ?? false,
    mobileCount: item.mobileCount || "0",
    otherItems: item.otherItems || "",
    tokenNumber: item.tokenNumber || "",
    badgeNumber: item.badgeNumber || "",
    emergencyContactName: item.emergencyContactName || "",
    emergencyRelation: item.emergencyRelation || "",
    emergencyMobile: item.emergencyMobile || "",
    emergencyAlternateMobile: item.emergencyAlternateMobile || "",
    checkInTime: item.checkInTime || "",
    checkOutTime: item.checkOutTime || "",
    status: normalizeStatus(item.status),
    approvalStatus: item.approvalStatus || "pending",
    approvedBy: item.approvedBy || "",
    remarks: item.remarks || "",
    requestId: item.requestId || crypto.randomUUID(),
    otp: item.otp || "",
    otpGeneratedAt: item.otpGeneratedAt || "",
    otpVerified: item.otpVerified ?? false,
    gatePassNumber: item.gatePassNumber || "",
    gatePassIssuedAt: item.gatePassIssuedAt || "",
    exitGate: normalizeGate(item.exitGate),
    badgeReturned: item.badgeReturned ?? false,
    exitRemarks: item.exitRemarks || "",
  };
}

function readLegacyKeys(key: string): unknown[] | null {
  const legacyKeys: Record<string, string[]> = {
    [VEHICLE_STORAGE_KEY]: ["vehicle-master-entries"],
    [VISITOR_STORAGE_KEY]: ["visitor-master-entries"],
  };

  for (const legacyKey of legacyKeys[key] || []) {
    const raw = localStorage.getItem(legacyKey);
    if (raw) {
      try {
        return JSON.parse(raw) as unknown[];
      } catch {
        return null;
      }
    }
  }

  return null;
}

function readStorage<T>(
  key: string,
  seed: T[],
  normalize: (raw: Record<string, unknown>) => T,
): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, unknown>[];
      return parsed.map(normalize);
    }

    const legacy = readLegacyKeys(key);
    if (legacy?.length) {
      const migrated = legacy.map((item) =>
        normalize(item as Record<string, unknown>),
      );
      writeStorage(key, migrated);
      return migrated;
    }

    writeStorage(key, seed);
    return seed;
  } catch {
    writeStorage(key, seed);
    return seed;
  }
}

export function createMasterStorage<T>(
  key: string,
  seed: T[],
  normalize: (raw: Record<string, unknown>) => T,
) {
  return {
    getItems(): T[] {
      return readStorage(key, seed, normalize);
    },
    saveItems(items: T[]): void {
      writeStorage(key, items);
    },
  };
}

const vehicleSeed: VehicleEntry[] = [
  {
    id: "1",
    entryDate: "2026-07-15",
    entryTime: "09:30",
    exitTime: "",
    vehicleType: "car",
    vehicleNumber: "MH-12-AB-1234",
    driverContact: "9876543210",
    rcNumber: "RC123456",
    vehicleBrand: "maruti",
    vehicleModel: "Swift",
    vehicleColor: "White",
    driverName: "Rahul Sharma",
    mobileNumber: "9876543210",
    alternateMobile: "",
    email: "rahul@tech.com",
    address: "Andheri East",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    aadhaarNumber: "",
    licenseNumber: "DL-123456",
    licenseExpiryDate: "2028-12-31",
    driverPhoto: "",
    licensePhoto: "",
    aadhaarPhoto: "",
    purpose: "Delivery",
    department: "Operations",
    employeeToMeet: "Security Manager",
    company: "Tech Solutions Pvt Ltd",
    vendorName: "",
    gateNumber: "gate-1",
    entryType: "delivery",
    passengerCount: "1",
    passengerNames: "",
    materialCarried: "",
    remarks: "",
    securityGuardName: "Guard A",
    entryGate: "gate-1",
    exitGate: "",
    vehicleCondition: "Good",
    fuelLevel: "half",
    damageBeforeEntry: "",
    damageAfterExit: "",
    securityNotes: "",
    status: "IN",
    rcPhoto: "",
    driverLicensePhoto: "",
    aadhaarPhotoDoc: "",
    vehiclePhotoFront: "",
    vehiclePhotoBack: "",
    vehiclePhotoLeft: "",
    vehiclePhotoRight: "",
    exitVehicleCondition: "",
    conditionChangedAtExit: false,
    exitPhotoFront: "",
    exitPhotoBack: "",
  },
  {
    id: "2",
    entryDate: "2026-07-15",
    entryTime: "08:15",
    exitTime: "10:45",
    vehicleType: "truck",
    vehicleNumber: "DL-01-CD-5678",
    driverContact: "9123456780",
    rcNumber: "RC789012",
    vehicleBrand: "tata",
    vehicleModel: "LPT 1613",
    vehicleColor: "Blue",
    driverName: "Amit Kumar",
    mobileNumber: "9123456780",
    alternateMobile: "",
    email: "",
    address: "",
    city: "Delhi",
    state: "Delhi",
    pincode: "",
    aadhaarNumber: "",
    licenseNumber: "DL-789012",
    licenseExpiryDate: "",
    driverPhoto: "",
    licensePhoto: "",
    aadhaarPhoto: "",
    purpose: "Material pickup",
    department: "Logistics",
    employeeToMeet: "Store Manager",
    company: "Logistics Corp",
    vendorName: "",
    gateNumber: "gate-2",
    entryType: "vendor",
    passengerCount: "2",
    passengerNames: "",
    materialCarried: "Packaged goods",
    remarks: "",
    securityGuardName: "Guard B",
    entryGate: "gate-2",
    exitGate: "gate-2",
    vehicleCondition: "Good",
    fuelLevel: "three-quarter",
    damageBeforeEntry: "",
    damageAfterExit: "",
    securityNotes: "",
    status: "OUT",
    rcPhoto: "",
    driverLicensePhoto: "",
    aadhaarPhotoDoc: "",
    vehiclePhotoFront: "",
    vehiclePhotoBack: "",
    vehiclePhotoLeft: "",
    vehiclePhotoRight: "",
    exitVehicleCondition: "",
    conditionChangedAtExit: false,
    exitPhotoFront: "",
    exitPhotoBack: "",
  },
];

const visitorSeed: VisitorEntry[] = [
  {
    id: "1",
    visitorId: "VIS-12345678",
    fullName: "Priya Patel",
    fatherName: "",
    gender: "female",
    dateOfBirth: "",
    age: "32",
    mobileNumber: "9988776655",
    alternateMobile: "",
    email: "priya@abc.com",
    company: "ABC Consultants",
    designation: "Manager",
    address: "",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "",
    nationality: "Indian",
    idProofType: "aadhaar",
    idProofNumber: "XXXX-XXXX-1234",
    idFrontPhoto: "",
    idBackPhoto: "",
    visitDate: "2026-07-15",
    entryTime: "10:00",
    exitTime: "",
    purpose: "Business meeting",
    department: "Admin",
    personToMeet: "Security Manager",
    employeeId: "",
    floor: "2",
    cabin: "201",
    meetingRoom: "",
    duration: "1 hour",
    visitorPassNumber: "",
    numberOfPersons: "1",
    adultCount: "1",
    childCount: "0",
    vehicleAvailable: false,
    vehicleNumber: "",
    accompanyingPerson: "",
    previousVisit: false,
    frequentVisitor: false,
    visitorPhoto: "",
    fingerprint: "",
    signature: "",
    gate: "gate-1",
    securityGuard: "Guard A",
    allowedAreas: "Lobby, Meeting Room",
    restrictedAreas: "",
    bagChecked: true,
    laptop: false,
    camera: false,
    mobileCount: "1",
    otherItems: "",
    tokenNumber: "",
    badgeNumber: "",
    emergencyContactName: "",
    emergencyRelation: "",
    emergencyMobile: "",
    emergencyAlternateMobile: "",
    checkInTime: "",
    checkOutTime: "",
    status: "HOLD",
    approvalStatus: "pending",
    approvedBy: "",
    remarks: "",
    requestId: "req-1",
    otp: "",
    otpGeneratedAt: "",
    otpVerified: false,
    gatePassNumber: "",
    gatePassIssuedAt: "",
    exitGate: "",
    badgeReturned: false,
    exitRemarks: "",
  },
  {
    id: "2",
    visitorId: "VIS-87654321",
    fullName: "Vikram Singh",
    fatherName: "",
    gender: "male",
    dateOfBirth: "",
    age: "40",
    mobileNumber: "8877665544",
    alternateMobile: "",
    email: "",
    company: "Vendor Services",
    designation: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    nationality: "Indian",
    idProofType: "driving-license",
    idProofNumber: "DL-09-2019-1234567",
    idFrontPhoto: "",
    idBackPhoto: "",
    visitDate: "2026-07-15",
    entryTime: "09:00",
    exitTime: "09:45",
    purpose: "Document submission",
    department: "Admin",
    personToMeet: "Admin Office",
    employeeId: "",
    floor: "1",
    cabin: "",
    meetingRoom: "",
    duration: "45 min",
    visitorPassNumber: "",
    numberOfPersons: "1",
    adultCount: "1",
    childCount: "0",
    vehicleAvailable: false,
    vehicleNumber: "",
    accompanyingPerson: "",
    previousVisit: true,
    frequentVisitor: false,
    visitorPhoto: "",
    fingerprint: "",
    signature: "",
    gate: "gate-2",
    securityGuard: "Guard B",
    allowedAreas: "Reception",
    restrictedAreas: "",
    bagChecked: false,
    laptop: false,
    camera: false,
    mobileCount: "1",
    otherItems: "",
    tokenNumber: "T-456",
    badgeNumber: "B-7890",
    emergencyContactName: "",
    emergencyRelation: "",
    emergencyMobile: "",
    emergencyAlternateMobile: "",
    checkInTime: "2026-07-15T09:00:00.000Z",
    checkOutTime: "2026-07-15T09:45:00.000Z",
    status: "OUT",
    approvalStatus: "approved",
    approvedBy: "Admin",
    remarks: "",
    requestId: "req-2",
    otp: "123456",
    otpGeneratedAt: "",
    otpVerified: true,
    gatePassNumber: "GP-12345678",
    gatePassIssuedAt: "2026-07-15T09:00:00.000Z",
    exitGate: "gate-2",
    badgeReturned: true,
    exitRemarks: "",
  },
];

export const vehicleStorage = createMasterStorage<VehicleEntry>(
  VEHICLE_STORAGE_KEY,
  vehicleSeed,
  normalizeVehicle,
);

export const visitorStorage = createMasterStorage<VisitorEntry>(
  VISITOR_STORAGE_KEY,
  visitorSeed,
  normalizeVisitor,
);

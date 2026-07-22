export interface VehicleEntry {
  // Storage retains the full entry record, including optional legacy fields.
  [key: string]: string | boolean;
  id: string;

  // Basic Information
  entryDate: string;
  entryTime: string;
  exitTime: string;
  vehicleType: string;
  vehicleNumber: string;
  vehicleBrand: string;

  // Driver Details
  driverName: string;
  mobileNumber: string;
  company: string;

  // Visit Details
  purpose: string;
  employeeToMeet: string;
  gateNumber: string;

  // Security Details (entry)
  vehicleCondition: string;
  status: string;

  // Documents (entry)
  driverPhoto: string;
  rcPhoto: string;
  vehiclePhotoFront: string;
  vehiclePhotoBack: string;

  // Exit Details
  exitVehicleCondition: string;
  conditionChangedAtExit: boolean;
  exitPhotoFront: string;
  exitPhotoBack: string;
}

export const emptyVehicle = (): VehicleEntry => ({
  id: "",
  entryDate: "",
  entryTime: "",
  exitTime: "",
  vehicleType: "",
  vehicleNumber: "",
  vehicleBrand: "",

  driverName: "",
  mobileNumber: "",
  company: "",

  purpose: "",
  employeeToMeet: "",
  gateNumber: "",

  vehicleCondition: "",
  status: "IN",

  driverPhoto: "",
  rcPhoto: "",
  vehiclePhotoFront: "",
  vehiclePhotoBack: "",

  exitVehicleCondition: "",
  conditionChangedAtExit: false,
  exitPhotoFront: "",
  exitPhotoBack: "",
});

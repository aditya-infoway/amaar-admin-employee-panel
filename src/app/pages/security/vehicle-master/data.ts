export interface VehicleEntry {
  id: string;
  entryDate: string;
  entryTime: string;
  exitTime: string;
  vehicleType: string;
  vehicleNumber: string;
  vehicleBrand: string;

  driverName: string;
  mobileNumber: string;
  company: string;

  purpose: string;
  employeeToMeet: string;
  gateNumber: string;

  vehicleCondition: string;
  status: string;

  driverPhoto: string | File;
  rcPhoto: string | File;
  vehiclePhotoFront: string | File;
  vehiclePhotoBack: string | File;

  exitVehicleCondition: string;
  conditionChangedAtExit: boolean;
  exitPhotoFront: string | File;
  exitPhotoBack: string | File;
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

// ---- Backend response (vehicleEntryId etc.) ko frontend shape me map karna ----
export function mapApiVehicleEntryToVehicleEntry(api: any): VehicleEntry {
  return {
    id: String(api.vehicleEntryId),
    entryDate: api.entryDate ?? "",
    entryTime: api.entryTime ?? "",
    exitTime: api.exitTime ?? "",
    vehicleType: api.vehicleType ?? "",
    vehicleNumber: api.vehicleNumber ?? "",
    vehicleBrand: api.vehicleBrand ?? "",
    driverName: api.driverName ?? "",
    mobileNumber: api.mobileNumber ?? "",
    company: api.company ?? "",
    purpose: api.purpose ?? "",
    employeeToMeet: api.employeeToMeet ?? "",
    gateNumber: api.gateNumber ?? "",
    vehicleCondition: api.vehicleCondition ?? "",
    status: api.status ?? "IN",
    driverPhoto: api.driverPhoto ?? "",
    rcPhoto: api.rcPhoto ?? "",
    vehiclePhotoFront: api.vehiclePhotoFront ?? "",
    vehiclePhotoBack: api.vehiclePhotoBack ?? "",
    exitVehicleCondition: api.exitVehicleCondition ?? "",
    conditionChangedAtExit: Boolean(api.conditionChangedAtExit),
    exitPhotoFront: api.exitPhotoFront ?? "",
    exitPhotoBack: api.exitPhotoBack ?? "",
  };
}
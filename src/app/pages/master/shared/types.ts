export interface ItemMaster {
  id: string;
  itemCode: string;
  itemName: string;
  shortName: string;
  hsnCode: string;
  itemCategory: string;
  group: string;
  unit: string;
  taxSlab: string;
  stockMapping: boolean;
  minQty: string;
  maxQty: string;
  itemType: string;
  suppliers: string[];
  purchasePrice: string;
  actualPurchasePrice: string;
  salesPrice: string;
  mrp: string;
  barcode: string;
}

export interface VehicleEntry {
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

export interface VisitorEntry {
  id: string;
  visitorName: string;
  contactNumber: string;
  idProofType: string;
  idProofNumber: string;
  company: string;
  personToMeet: string;
  purpose: string;
  entryTime: string;
  exitTime: string;
  status: string;
}
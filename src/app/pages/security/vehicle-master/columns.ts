import { ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import {
  createExitRowActions,
  createRowActions,
} from "../../master/shared/createRowActions";
import { TextCell } from "../../master/shared/tableCells";
import { gateOptions } from "../../master/shared/constants";
import { VehicleEntry } from "./data";

const RowActions = createRowActions<VehicleEntry>("vehicle");
const ExitRowActions = createExitRowActions<VehicleEntry>();

function displayValue(value: unknown): string {
  if (value == null || value === "") return "—";
  return String(value);
}

export function createColumns(
  getLabel: (options: { id: string; label: string }[], id: string) => string,
  vehicleTypeOptions: { id: string; label: string }[],
  statusOptions: { id: string; label: string }[],
  mode: "list" | "exit" = "list",
): ColumnDef<VehicleEntry>[] {
  const columns: ColumnDef<VehicleEntry>[] = [
    {
      id: "select",
      header: SelectHeader,
      cell: SelectCell,
      enableSorting: false,
    },
    {
      id: "entryDate",
      accessorFn: (row) => displayValue(row.entryDate),
      header: "Date",
      cell: TextCell,
    },
    {
      id: "vehicleNumber",
      accessorKey: "vehicleNumber",
      header: "Vehicle No.",
      cell: TextCell,
    },
    {
      id: "vehicleType",
      accessorFn: (row) => getLabel(vehicleTypeOptions, row.vehicleType),
      header: "Type",
      cell: TextCell,
    },
    {
      id: "driverName",
      accessorKey: "driverName",
      header: "Driver",
      cell: TextCell,
    },
    {
      id: "mobileNumber",
      accessorFn: (row) => displayValue(row.mobileNumber),
      header: "Contact",
      cell: TextCell,
    },
    {
      id: "company",
      accessorKey: "company",
      header: "Company",
      cell: TextCell,
    },
    {
      id: "purpose",
      accessorKey: "purpose",
      header: "Purpose",
      cell: TextCell,
    },
    {
      id: "gateNumber",
      accessorFn: (row) => getLabel(gateOptions, row.gateNumber),
      header: "Gate",
      cell: TextCell,
    },
    {
      id: "entryTime",
      accessorFn: (row) => displayValue(row.entryTime),
      header: "Entry Time",
      cell: TextCell,
    },
    {
      id: "status",
      accessorFn: (row) => {
        const label = getLabel(statusOptions, row.status);
        return label === "—" ? displayValue(row.status) : label;
      },
      header: "Status",
      cell: TextCell,
    },
    {
      id: "actions",
      header: "Actions",
      cell: mode === "exit" ? ExitRowActions : RowActions,
      enableSorting: false,
    },
  ];

  if (mode === "exit") {
    return columns.filter((column) => column.id !== "status");
  }

  return columns.filter((column) => column.id !== "entryTime");
}

export const exportColumns = [
  { key: "entryDate" as const, header: "Date" },
  { key: "vehicleNumber" as const, header: "Vehicle No." },
  { key: "vehicleTypeLabel" as const, header: "Type" },
  { key: "driverName" as const, header: "Driver" },
  { key: "mobileNumber" as const, header: "Contact" },
  { key: "company" as const, header: "Company" },
  { key: "purpose" as const, header: "Purpose" },
  { key: "gateNumberLabel" as const, header: "Gate" },
  { key: "entryTime" as const, header: "Entry Time" },
  { key: "exitTime" as const, header: "Exit Time" },
  { key: "statusLabel" as const, header: "Status" },
];

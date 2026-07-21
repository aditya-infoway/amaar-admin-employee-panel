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
import { VisitorEntry } from "./data";

function displayValue(value: unknown): string {
  if (value == null || value === "") return "—";
  return String(value);
}

function formatCheckInTime(value: string): string {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
}

const RowActions = createRowActions<VisitorEntry>("visitor");
const ExitRowActions = createExitRowActions<VisitorEntry>();

export function createColumns(
  getLabel: (options: { id: string; label: string }[], id: string) => string,
  idProofTypeOptions: { id: string; label: string }[],
  statusOptions: { id: string; label: string }[],
  mode: "list" | "exit" = "list",
): ColumnDef<VisitorEntry>[] {
  const columns: ColumnDef<VisitorEntry>[] = [
    {
      id: "select",
      header: SelectHeader,
      cell: SelectCell,
      enableSorting: false,
    },
    {
      id: "visitorId",
      accessorFn: (row) => displayValue(row.visitorId),
      header: "Visitor ID",
      cell: TextCell,
    },
    {
      id: "fullName",
      accessorFn: (row) => displayValue(row.fullName),
      header: "Visitor Name",
      cell: TextCell,
    },
    {
      id: "mobileNumber",
      accessorFn: (row) => displayValue(row.mobileNumber),
      header: "Contact",
      cell: TextCell,
    },
    {
      id: "idProofType",
      accessorFn: (row) => {
        const label = getLabel(idProofTypeOptions, row.idProofType);
        return label === "—" ? displayValue(row.idProofType) : label;
      },
      header: "ID Proof",
      cell: TextCell,
    },
    {
      id: "company",
      accessorKey: "company",
      header: "Company",
      cell: TextCell,
    },
    {
      id: "personToMeet",
      accessorKey: "personToMeet",
      header: "Person to Meet",
      cell: TextCell,
    },
    {
      id: "badgeNumber",
      accessorFn: (row) => displayValue(row.badgeNumber),
      header: "Badge #",
      cell: TextCell,
    },
    {
      id: "checkInTime",
      accessorFn: (row) => formatCheckInTime(row.checkInTime),
      header: "Check-in Time",
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

  return columns.filter((column) => column.id !== "checkInTime");
}

export const exportColumns = [
  { key: "visitorId" as const, header: "Visitor ID" },
  { key: "fullName" as const, header: "Visitor Name" },
  { key: "mobileNumber" as const, header: "Contact" },
  { key: "idProofTypeLabel" as const, header: "ID Proof" },
  { key: "idProofNumber" as const, header: "ID Number" },
  { key: "company" as const, header: "Company" },
  { key: "personToMeet" as const, header: "Person to Meet" },
  { key: "purpose" as const, header: "Purpose" },      
  { key: "entryTime" as const, header: "Entry Time" },
  { key: "exitTime" as const, header: "Exit Time" },
  { key: "badgeNumber" as const, header: "Badge #" },
  { key: "statusLabel" as const, header: "Status" },
];

import { ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../shared/createRowActions";
import { TextCell } from "../../../master/shared/tableCells";
import { EmployeeEntry } from "./data";

function displayValue(value: unknown): string {
  if (value == null || value === "") return "—";
  return String(value);
}

function formatDate(value: string): string {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString();
}

const RowActions = createRowActions<EmployeeEntry>("employee");

export function createColumns(
  getLabel: (options: { id: string; label: string }[], id: string) => string,
  employeeTypeOptions: { id: string; label: string }[],
  employeeStatusOptions: { id: string; label: string }[],
): ColumnDef<EmployeeEntry>[] {
  return [
    {
      id: "select",
      header: SelectHeader,
      cell: SelectCell,
      enableSorting: false,
    },
    {
      id: "employeeId",
      accessorFn: (row) => displayValue(row.employeeId),
      header: "Employee ID",
      cell: TextCell,
    },
    {
      id: "fullName",
      accessorFn: (row) =>
        displayValue([row.firstName].filter(Boolean).join(" ")),
      header: "Employee Name",
      cell: TextCell,
    },
    {
      id: "personalMobileNo",
      accessorFn: (row) => displayValue(row.personalMobileNo),
      header: "Contact",
      cell: TextCell,
    },
    {
      id: "department",
      accessorKey: "department",
      header: "Department",
      cell: TextCell,
    },
    {
      id: "designation",
      accessorKey: "designation",
      header: "Designation",
      cell: TextCell,
    },
    {
      id: "employeeType",
      accessorFn: (row) => {
        const label = getLabel(employeeTypeOptions, row.employeeType);
        return label === "—" ? displayValue(row.employeeType) : label;
      },
      header: "Employee Type",
      cell: TextCell,
    },
    {
      id: "joiningDate",
      accessorFn: (row) => formatDate(row.joiningDate),
      header: "Joining Date",
      cell: TextCell,
    },
    {
      id: "employeeStatus",
      accessorFn: (row) => {
        const label = getLabel(employeeStatusOptions, row.employeeStatus);
        return label === "—" ? displayValue(row.employeeStatus) : label;
      },
      header: "Status",
      cell: TextCell,
    },
    {
      id: "actions",
      header: "Actions",
      cell: RowActions,
      enableSorting: false,
    },
  ];
}

export const exportColumns = [
  { key: "employeeId" as const, header: "Employee ID" },
  { key: "firstName" as const, header: "First Name" },

  { key: "personalMobileNo" as const, header: "Contact" },
  { key: "personalEmail" as const, header: "Email" },
  { key: "department" as const, header: "Department" },
  { key: "designation" as const, header: "Designation" },
  { key: "employeeTypeLabel" as const, header: "Employee Type" },
  { key: "joiningDate" as const, header: "Joining Date" },
  { key: "employeeStatusLabel" as const, header: "Status" },

];
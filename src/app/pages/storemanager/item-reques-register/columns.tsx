import { ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "./shared/createRowActions"; // ✅ Using shared actions
import { TextCell } from "./shared/tableCells";
import { StockReportItem } from "./data";
import { ExportColumn } from "./shared/export";

// ✅ Using the shared createRowActions
const RowActions = createRowActions<StockReportItem>("item request");

function formatDateDDMMYYYY(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  const dd = String(parsed.getDate()).padStart(2, "0");
  const mm = String(parsed.getMonth() + 1).padStart(2, "0");
  const yyyy = parsed.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function formatDateCell(info: any) {
  const value = info.getValue() as string;
  return value ? formatDateDDMMYYYY(value) : "—";
}

export const columns: ColumnDef<StockReportItem>[] = [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableSorting: false,
  },
  {
    id: "date",
    accessorKey: "date",
    header: "Date",
    cell: formatDateCell,
  },
  {
    id: "contractorName",
    accessorKey: "contractorName",
    header: "Contractor Name",
    cell: TextCell,
  },
  {
    id: "workOrderId",
    accessorKey: "workOrderId",
    header: "Work Order ID",
    cell: TextCell,
  },
  {
    id: "issueId",
    accessorKey: "issueId",
    header: "Issue ID",
    cell: TextCell,
  },
  {
    id: "actions",
    header: "Actions",
    cell: RowActions, // ✅ Using the shared action cell
    enableSorting: false,
  },
];

export const exportColumns: ExportColumn<StockReportItem>[] = [
  {
    key: "date",
    header: "Date",
    format: (value: unknown) =>
      value ? formatDateDDMMYYYY(value as string) : "",
  },
  { key: "contractorName", header: "Contractor Name" },
  { key: "workOrderId", header: "Work Order ID" },
  { key: "issueId", header: "Issue ID" },
];

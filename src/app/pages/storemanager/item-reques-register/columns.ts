import { createElement } from "react";
import { CellContext, ColumnDef } from "@tanstack/react-table";
import { ArrowDownCircleIcon, EyeIcon } from "@heroicons/react/24/outline";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { TextCell } from "../master/shared/tableCells";
import { StockReportItem } from "./data";
import { ExportColumn } from "../master/shared/export";

function formatDateDDMMYYYY(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  const dd = String(parsed.getDate()).padStart(2, "0");
  const mm = String(parsed.getMonth() + 1).padStart(2, "0");
  const yyyy = parsed.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function formatDateCell(info: CellContext<StockReportItem, unknown>) {
  const value = info.getValue() as string;
  return value ? formatDateDDMMYYYY(value) : "—";
}

// ✅ CHANGED — status ke hisaab se icon badalta hai
function ViewActionCell({ row, table }: any) {
  const meta = table.options.meta as any;
  const isComplete = (row.original.status || "").toLowerCase() === "complete";

  return createElement(
    "button",
    {
      type: "button",
      onClick: () => meta?.viewRow?.(row.original),
      className:
        "btn-base btn shrink-0 p-0 bg-gray-150 text-gray-900 hover:bg-gray-200 focus:bg-gray-200 active:bg-gray-200/80 dark:bg-surface-2 dark:text-dark-50 dark:hover:bg-surface-1 dark:focus:bg-surface-1 dark:active:bg-surface-1/90 size-8 rounded-full",
      title: isComplete ? "View" : "Item Reques Details",
    },
    isComplete
      ? createElement(EyeIcon, { className: "size-5" })
      : createElement(ArrowDownCircleIcon, { className: "size-5" }),
  );
}

export const columns: ColumnDef<StockReportItem>[] = [
  { id: "select", header: SelectHeader, cell: SelectCell, enableSorting: false },
  { id: "date", accessorKey: "date", header: "Date", cell: formatDateCell },
  { id: "contractorName", accessorKey: "contractorName", header: "Contractor Name", cell: TextCell },
  { id: "workOrderId", accessorKey: "workOrderId", header: "Work Order ID", cell: TextCell },
  { id: "model", accessorKey: "model", header: "Model", cell: TextCell },
  { id: "actions", header: "Actions", cell: ViewActionCell, enableSorting: false },
];

export const exportColumns: ExportColumn<StockReportItem>[] = [
  {
    key: "date",
    header: "Date",
    format: (value: unknown) => (value ? formatDateDDMMYYYY(value as string) : ""),
  },
  { key: "contractorName", header: "Contractor Name" },
  { key: "workOrderId", header: "Work Order ID" },
  { key: "model", header: "Model" },
];
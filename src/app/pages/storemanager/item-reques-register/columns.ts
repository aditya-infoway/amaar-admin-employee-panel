import { createElement } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowDownCircleIcon } from "@heroicons/react/24/outline";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { TextCell } from "../master/shared/tableCells";
import { StockReportItem } from "./data";
import { ExportColumn } from "../master/shared/export";

// ✅ CHANGED — JSX hataya, createElement use kiya kyunki file .ts hai (.tsx nahi)
function ViewActionCell({ row, table }: any) {
  const meta = table.options.meta as any;
  return createElement(
    "button",
    {
      type: "button",
      onClick: () => meta?.viewRow?.(row.original),
      className: "btn-base btn shrink-0 p-0 bg-gray-150 text-gray-900 hover:bg-gray-200 focus:bg-gray-200 active:bg-gray-200/80 dark:bg-surface-2 dark:text-dark-50 dark:hover:bg-surface-1 dark:focus:bg-surface-1 dark:active:bg-surface-1/90 size-8 rounded-full",
      title: "Item Reques Details",
    },
    createElement(ArrowDownCircleIcon, { className: "size-5" }),
  );
}

export const columns: ColumnDef<StockReportItem>[] = [
  { id: "select", header: SelectHeader, cell: SelectCell, enableSorting: false },
  { id: "date", accessorKey: "date", header: "Date", cell: TextCell },
  { id: "contractorName", accessorKey: "contractorName", header: "Contractor Name", cell: TextCell },
  { id: "workOrderId", accessorKey: "workOrderId", header: "Work Order ID", cell: TextCell },
  { id: "model", accessorKey: "model", header: "Model", cell: TextCell },
  { id: "actions", header: "Actions", cell: ViewActionCell, enableSorting: false },
];

export const exportColumns: ExportColumn<StockReportItem>[] = [
  { key: "date", header: "Date" },
  { key: "contractorName", header: "Contractor Name" },
  { key: "workOrderId", header: "Work Order ID" },
  { key: "model", header: "Model" },
];
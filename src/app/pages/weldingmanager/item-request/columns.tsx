import { ColumnDef } from "@tanstack/react-table";
import { EyeIcon } from "@heroicons/react/24/outline";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { ExportColumn } from "../shared/export";
import { TextCell } from "../shared/tableCells";
import { ItemRequestRecord } from "./data";

const formatDate = (value?: string) => {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString("en-IN");
};

const getItemsText = (row: ItemRequestRecord) =>
  (row.items ?? [])
    .map((i) => i.itemName)
    .filter(Boolean)
    .join(", ");

export const columns: ColumnDef<ItemRequestRecord>[] = [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableSorting: false,
  },
  {
    id: "requestNo",
    accessorFn: (row) => row.requestNo || `#${row.id}`,
    header: "Request No",
    cell: TextCell,
  },
  {
    id: "workOrderNo",
    accessorFn: (row) => row.workOrderNo || "-",
    header: "Work Order",
    cell: TextCell,
  },
  {
    id: "items",
    accessorFn: (row) => getItemsText(row) || "-",
    header: "Items",
    cell: ({ row, table }) => {
    //   const items = row.original.items ?? [];
    //   const first = items[0]?.itemName ?? "-";
    //   const more = items.length - 1;

      return (
        <div className="flex items-center gap-2">
          {/* <span
            className="block max-w-xs truncate"
            title={getItemsText(row.original)}
          >
            {first}
            {more > 0 && (
              <span className="ml-1 text-xs font-semibold text-gray-500">
                +{more} more
              </span>
            )}
          </span> */}

          <button
            type="button"
            title="View Items"
            className="text-primary-600 hover:text-primary-700 shrink-0"
            onClick={() =>
              (table.options.meta as any)?.viewRow?.(row.original)
            }
          >
            <EyeIcon className="size-5" />
          </button>
        </div>
      );
    },
  },
  {
    id: "totalItems",
    accessorFn: (row) => row.totalItems ?? row.items?.length ?? "-",
    header: "Total Items",
    cell: TextCell,
  },
  {
    id: "createdAt",
    accessorFn: (row) => formatDate(row.createdAt),
    header: "Date",
    cell: TextCell,
  },
];

export const exportColumns: ExportColumn<ItemRequestRecord>[] = [
  { key: "requestNo", header: "Request No" },
  { key: "workOrderNo", header: "Work Order" },
  { key: "totalItems", header: "Total Items" },
  { key: "createdAt", header: "Date" },
];
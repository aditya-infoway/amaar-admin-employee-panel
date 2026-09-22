import { createColumnHelper } from "@tanstack/react-table";

import type { ExportColumn } from "../shared/export";

import type { WorkOrder } from "../shared/types";

const columnHelper = createColumnHelper<WorkOrder>();

export const createColumns = () => [
  columnHelper.display({
    id: "srNo",
    header: "Sr. No.",
    cell: ({ row, table }) => {
      const pagination = table.getState().pagination;

      return pagination.pageIndex * pagination.pageSize + row.index + 1;
    },
  }),

  columnHelper.accessor("workOrderNo", {
    header: "Work Order ID",
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue() || "-"}</span>
    ),
  }),

  columnHelper.accessor("modelName", {
    header: "Model",
    cell: ({ row }) => row.original.modelName || row.original.model || "-",
  }),
];

/*
 * Columns used for Excel/PDF export
 */
export const createExportColumns = (): ExportColumn<WorkOrder>[] => [
  {
    key: "workOrderNo",
    header: "Work Order No",
  },
  {
    key: "modelName",
    header: "Model",
  },
];

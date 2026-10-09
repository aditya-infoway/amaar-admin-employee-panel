import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  ColumnDef,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

import { Page } from "@/components/shared/Page";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { Get, toasterrormsg } from "@/ApiHelper";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface PendingTask {
  workOrderStageId: number;
  workOrderId: number;
  workOrderNo: string;
  workOrderDate: string;
  materialStatus?: string;
  model?: string;
  modelName?: string;
}

const MATERIAL_STATUS_STYLES: Record<string, string> = {
  "Pending Material": "bg-gray-500/15 text-gray-400",
  "Indent Generate": "bg-amber-500/15 text-amber-500",
  "PO Generate": "bg-sky-500/15 text-sky-500",
  "GRR Complete": "bg-violet-500/15 text-violet-500",
  "QC Complete": "bg-teal-500/15 text-teal-500",
  "Purchase Complete": "bg-emerald-500/15 text-emerald-500",
};

function MaterialStatusBadge({ status }: { status?: string }) {
  const label = status || "Pending Material";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${
        MATERIAL_STATUS_STYLES[label] ||
        MATERIAL_STATUS_STYLES["Pending Material"]
      }`}
    >
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Columns
// ─────────────────────────────────────────────────────────────
const columns: ColumnDef<PendingTask>[] = [
  {
    id: "srNo",
    header: "Sr. No.",
    cell: ({ row }) => row.index + 1,
    enableSorting: false,
  },
  {
    accessorKey: "workOrderNo",
    header: "Work Order No",
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "modelName",
    header: "Model",
    cell: ({ row }) => (
      <span>{row.original.modelName || row.original.model || "-"}</span>
    ),
  },
  {
    accessorKey: "workOrderDate",
    header: "Work Order Date",
    cell: ({ getValue }) => {
      const value = getValue<string>();
      return value
        ? new Date(value).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "-";
    },
  },
  {
    accessorKey: "materialStatus",
    header: "Status",
    cell: ({ getValue }) => <MaterialStatusBadge status={getValue<string>()} />,
  },
];

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────
export default function PendingWorkOrders() {
  const [data, setData] = useState<PendingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        setLoading(true);
        const response = await Get(
          "workordertask/my-tasks",
          { status: "Pending" },
          false,
        );

        if (response?.data?.success || response?.data?.status === 200) {
          setData(response?.data?.data || []);
        }
      } catch (error) {
        console.error("Pending work orders error:", error);
        toasterrormsg("Unable to load pending work orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchPending();
  }, []);

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, sorting },
    filterFns: { fuzzy: fuzzyFilter },
    globalFilterFn: fuzzyFilter,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Page title="Pending Work Order">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Pending Work Order"
          searchPlaceholder="Search work order no..."
          table={table}
          onExportExcel={() => {}}
          onExportPdf={() => {}}
        />

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={
            loading ? "Loading..." : "No pending work orders found."
          }
        />
      </div>
    </Page>
  );
}

import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  ColumnDef,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";

import { Page } from "@/components/shared/Page";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { Get, toasterrormsg } from "@/ApiHelper";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";

interface PendingTask {
  workOrderStageId: number;
  workOrderId: number;
  workOrderNo: string;
  workOrderDate: string;
  materialStatus?: string;
  stageProgressStatus?: string | null;
    model?: string;
  modelName?: string;
}

function StatusBadge({ task }: { task: PendingTask }) {
  const label = task.stageProgressStatus || "Pending";
  const isComplete = label.toLowerCase().includes("complete");

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${
        isComplete
          ? "bg-emerald-500/15 text-emerald-500"
          : "bg-amber-500/15 text-amber-500"
      }`}
    >
      {label}
    </span>
  );
}

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
    id: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge task={row.original} />,
  },
];

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

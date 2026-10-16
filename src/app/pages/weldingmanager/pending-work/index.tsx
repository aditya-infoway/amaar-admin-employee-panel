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
import { EyeIcon } from "@heroicons/react/24/outline";

import { Page } from "@/components/shared/Page";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { Get, toasterrormsg } from "@/ApiHelper";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import ProcessProgressDrawer, {
  type SubProcessStatus,
} from "./ProcessProgressDrawer";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface PendingTask {
  workOrderStageId: number;
  workOrderId: number;
  workOrderNo: string;
  workOrderDate: string;
  materialStatus?: string;
  stageProgressStatus?: string | null;
  isUnlocked?: boolean;
  model?: string;
  modelName?: string;
  referenceProcessName?: string;
  referenceSubProcesses?: SubProcessStatus[];
}

const MATERIAL_STATUS_STYLES: Record<string, string> = {
  "Pending Material": "bg-gray-500/15 text-gray-400",
  "Indent Generate": "bg-amber-500/15 text-amber-500",
  "PO Generate": "bg-sky-500/15 text-sky-500",
  "GRR Complete": "bg-violet-500/15 text-violet-500",
  "QC Complete": "bg-teal-500/15 text-teal-500",
  "Purchase Complete": "bg-emerald-500/15 text-emerald-500",
};

const BADGE_BASE =
  "inline-flex rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap";

function MaterialStatusBadge({ status }: { status?: string }) {
  const label = status || "Pending Material";
  return (
    <span
      className={`${BADGE_BASE} ${
        MATERIAL_STATUS_STYLES[label] ||
        MATERIAL_STATUS_STYLES["Pending Material"]
      }`}
    >
      {label}
    </span>
  );
}

// Pichhla process poora complete nahi -> "Pending Material Cutting" (amber)
// Pichhla process complete            -> "Material Cutting Complete" (green)
// Pehla process (pichhla koi nahi)    -> material status badge
function StatusBadge({ task }: { task: PendingTask }) {
  const progress = task.stageProgressStatus;

  if (progress) {
    const style = progress.startsWith("Pending")
      ? "bg-amber-500/15 text-amber-500"
      : progress.endsWith("Complete")
        ? "bg-emerald-500/15 text-emerald-500"
        : "bg-sky-500/15 text-sky-500";

    return <span className={`${BADGE_BASE} ${style}`}>{progress}</span>;
  }

  return <MaterialStatusBadge status={task.materialStatus} />;
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────
export default function PendingWorkOrders() {
  const [data, setData] = useState<PendingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const [viewTask, setViewTask] = useState<PendingTask | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

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

  const openView = (task: PendingTask) => {
    setViewTask(task);
    setIsViewOpen(true);
  };

  const columns = useMemo<ColumnDef<PendingTask>[]>(
    () => [
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
        enableSorting: false,
        cell: ({ row }) => <StatusBadge task={row.original} />,
      },
      {
        id: "view",
        header: "View",
        enableSorting: false,
        cell: ({ row }) => (
          <button
            type="button"
            title="View sub process status"
            onClick={() => openView(row.original)}
            className="dark:text-dark-200 cursor-pointer text-gray-500 hover:text-gray-700 dark:hover:text-gray-100"
          >
            <EyeIcon className="size-5" />
          </button>
        ),
      },
    ],
    [],
  );

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

      <ProcessProgressDrawer
        isOpen={isViewOpen}
        close={() => setIsViewOpen(false)}
        workOrderNo={viewTask?.workOrderNo || ""}
        processName={viewTask?.referenceProcessName || ""}
        subProcesses={viewTask?.referenceSubProcesses || []}
      />
    </Page>
  );
}
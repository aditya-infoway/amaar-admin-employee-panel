import { Fragment, useEffect, useMemo, useState } from "react";

import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";

import { XMarkIcon } from "@heroicons/react/24/solid";
import { EyeIcon, CheckIcon } from "@heroicons/react/24/outline";

import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  createColumnHelper,
} from "@tanstack/react-table";

import { Page } from "@/components/shared/Page";
import { Button, Input } from "@/components/ui";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import {
  exportToExcel,
  exportToPdf,
  type ExportColumn,
} from "../shared/export";
import { Get, Post, toasterrormsg, toastsuccessmsg } from "@/ApiHelper";

import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";

interface Task {
  workOrderStageId: number;
  workOrderId: number;
  workOrderNo: string;
  workOrderDate: string;
  status: string;
  isUnlocked: boolean;
  startTime?: string | null;
}

interface TaskOption {
  workOrderStageId: number;
  workOrderNo: string;
  label: string;
}

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "-";

const formatTime = (value?: string | number | null) =>
  value
    ? new Date(value).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    : "-";

const formatDuration = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
};

const columnHelper = createColumnHelper<Task>();

export default function StartWork() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskOption | null>(null);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const [showFilters, setShowFilters] = useState(false);
  const [filterWorkOrderNo, setFilterWorkOrderNo] = useState("");

  // ✅ define startedTasks FIRST
  const startedTasks = useMemo(
    () => tasks.filter((t) => t.status === "In Progress"),
    [tasks],
  );

  // ✅ then filteredData
  const filteredData = useMemo(() => {
    return startedTasks.filter((item) => {
      if (
        filterWorkOrderNo &&
        !String(item.workOrderNo || "")
          .toLowerCase()
          .includes(filterWorkOrderNo.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [startedTasks, filterWorkOrderNo]);

  const exportColumns = useMemo(
    (): ExportColumn<Task>[] => [
      { key: "workOrderNo", header: "Work Order No" },
      { key: "workOrderDate", header: "Work Order Date" },
      { key: "startTime", header: "Start Time" },
      { key: "status", header: "Status" },
    ],
    [],
  );

  // live clock for working-time column + drawer time
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await Get("workordertask/my-tasks", {}, false);

      if (response?.data?.success || response?.data?.status === 200) {
        setTasks(response?.data?.data || []);
      }
    } catch (error) {
      console.error("Start work list error:", error);
      toasterrormsg("Unable to load work orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const availableTasks = useMemo<TaskOption[]>(
    () =>
      tasks
        .filter((t) => t.status === "Pending" && t.isUnlocked)
        .map((t) => ({
          workOrderStageId: t.workOrderStageId,
          workOrderNo: t.workOrderNo,
          label: t.workOrderNo,
        })),
    [tasks],
  );

  const openDrawer = () => {
    setSelectedTask(null);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedTask(null);
  };

  const handleSave = async () => {
    if (!selectedTask) {
      toasterrormsg("Please select a Work Order No.");
      return;
    }

    try {
      setSaving(true);

      const response = await Post(
        "workordertask/start",
        { workOrderStageId: Number(selectedTask.workOrderStageId) },
        false,
      );

      if (response?.data?.success || response?.data?.status === 200) {
        toastsuccessmsg(
          response?.data?.message || "Work started successfully.",
        );
        closeDrawer();
        fetchTasks();
      } else {
        toasterrormsg(response?.data?.message || "Failed to start work.");
      }
    } catch (error: any) {
      console.error("Start work error:", error);
      toasterrormsg(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "srNo",
        header: "Sr. No.",
        cell: ({ row, table }) => {
          const pagination = table.getState().pagination;
          return pagination.pageIndex * pagination.pageSize + row.index + 1;
        },
      }),

      columnHelper.accessor("workOrderNo", {
        header: "Work Order No",
        cell: ({ getValue }) => (
          <span className="font-medium">{getValue() || "-"}</span>
        ),
      }),

      columnHelper.accessor("workOrderDate", {
        header: "Work Order Date",
        cell: ({ getValue }) => formatDate(getValue()),
      }),

      columnHelper.accessor("startTime", {
        header: "Start Time",
        cell: ({ getValue }) => {
          const v = getValue();
          return `${formatDate(v)} ${formatTime(v)}`;
        },
      }),

      columnHelper.display({
        id: "workingTime",
        header: "Working Time",
        cell: ({ row }) => {
          const start = row.original.startTime;
          return (
            <span className="font-mono">
              {start ? formatDuration(now - new Date(start).getTime()) : "-"}
            </span>
          );
        },
      }),

      columnHelper.display({
        id: "itemProcess",
        header: "Item Process",
        cell: () => (
          <button
            type="button"
            title="Item Process"
            className="dark:text-dark-200 text-gray-500 hover:text-gray-700 dark:hover:text-gray-100"
          >
            <EyeIcon className="mx-auto size-5" />
          </button>
        ),
      }),

      columnHelper.display({
        id: "endTime",
        header: "End Time",
        cell: () => (
          <button
            type="button"
            title="End Work"
            className="dark:text-dark-200 text-gray-500 hover:text-gray-700 dark:hover:text-gray-100"
          >
            <CheckIcon className="mx-auto size-5" />
          </button>
        ),
      }),
    ],
    [now],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      globalFilter,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => String(row.workOrderStageId),
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  return (
    <Page title="Start Work">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Start Work"
          createLabel="Add"
          searchPlaceholder="Search work orders..."
          table={table}
          showFilters={false}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={openDrawer}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "start_work")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "Start Work List",
              "start_work",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Work Order No"
                value={filterWorkOrderNo}
                onChange={(e) => setFilterWorkOrderNo(e.target.value)}
                placeholder="Filter by Work Order No"
              />
            </div>
          }
        />
        {/* Same table component as Create Work Order */}
        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage="No work started yet. Click + Add to start a work order."
        />
      </div>

      {/* RIGHT SIDE DRAWER — same as WorkOrderDrawer */}
      <Transition appear show={isDrawerOpen} as={Fragment}>
        <Dialog as="div" className="relative z-100" onClose={closeDrawer}>
          <TransitionChild
            as="div"
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
          />

          <TransitionChild
            as={DialogPanel}
            enter="ease-out transform-gpu transition-transform duration-200"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="ease-in transform-gpu transition-transform duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
            className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full max-w-md flex-col bg-white"
          >
            {/* Header */}
            <div className="bg-primary-600 flex items-center justify-between border-b px-5 py-4">
              <h3 className="text-lg font-semibold text-white">Start Work</h3>

              <Button
                onClick={closeDrawer}
                variant="flat"
                isIcon
                className="size-6 rounded-full text-white"
              >
                <XMarkIcon className="size-4.5" />
              </Button>
            </div>

            {/* Body */}
            <div className="flex grow flex-col overflow-hidden">
              <div className="hide-scrollbar grow space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
                <Combobox
                  data={availableTasks}
                  displayField="label"
                  value={selectedTask}
                  onChange={(value: any) => {
                    setSelectedTask(
                      Array.isArray(value) ? value[0] || null : value || null,
                    );
                  }}
                  placeholder="Select Work Order No"
                  label="Work Order No"
                  searchFields={["workOrderNo"]}
                />

                {availableTasks.length === 0 && (
                  <p className="text-xs text-gray-400">
                    No work orders available to start.
                  </p>
                )}

                <Input
                  label="Time"
                  value={formatTime(now)}
                  disabled
                  readOnly
                  onChange={() => {}}
                />
              </div>

              {/* Footer */}
              <div className="dark:border-dark-500 flex justify-end gap-3 border-t border-gray-200 px-4 py-4 sm:px-6">
                <Button type="button" onClick={closeDrawer}>
                  Cancel
                </Button>

                <Button
                  type="button"
                  color="primary"
                  onClick={handleSave}
                  disabled={saving || !selectedTask}
                >
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </TransitionChild>
        </Dialog>
      </Transition>
    </Page>
  );
}

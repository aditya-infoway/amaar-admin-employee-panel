import { Fragment, useEffect, useMemo, useState } from "react";

import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { useDisclosure } from "@/hooks";
import { XMarkIcon } from "@heroicons/react/24/solid";
import {
  EyeIcon,
  CheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

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
import ItemProcessDrawer from "./ItemProcessDrawer";
import { ConfirmModal } from "@/components/shared/ConfirmModal";

interface Task {
  workOrderStageId: number;
  workOrderId: number;
  workOrderNo: string;
  workOrderDate: string;
  status: string;
  isUnlocked: boolean;
  materialStatus?: string;
  startTime?: string | null;
  endTime?: string | null;
  itemsVerified?: boolean;
  stage?: string;
  model?: string;
  modelName?: string;
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

  const [isItemDrawerOpen, setIsItemDrawerOpen] = useState(false);
  const [itemTask, setItemTask] = useState<Task | null>(null);
  const [endingId, setEndingId] = useState<number | null>(null);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const [showFilters, setShowFilters] = useState(false);
  const [filterWorkOrderNo, setFilterWorkOrderNo] = useState("");

  const [isEndConfirmOpen, { open: openEndConfirm, close: closeEndConfirm }] =
    useDisclosure();
  const [endConfirmLoading, setEndConfirmLoading] = useState(false);
  const [endSuccess, setEndSuccess] = useState(false);
  const [endError, setEndError] = useState(false);
  const [taskToEnd, setTaskToEnd] = useState<Task | null>(null);

  const endState = endError ? "error" : endSuccess ? "success" : "pending";

  const endMessages = {
    pending: {
      Icon: ExclamationTriangleIcon,
      title: "End Work?",
      description: taskToEnd
        ? `Are you sure you want to end work for ${taskToEnd.workOrderNo}? The end time will be recorded and cannot be undone.`
        : "Are you sure you want to end this work?",
      actionText: "End Work",
    },
    success: {
      title: "Work Completed",
    },
    error: {
      description:
        "Something went wrong. Please try again. Contact support if the issue remains.",
    },
  };

  // ✅ define startedTasks FIRST
  const startedTasks = useMemo(
    () =>
      tasks.filter(
        (t) => t.status === "In Progress" || t.status === "Completed",
      ),
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
      { key: "endTime", header: "End Time" },
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

  const openItemDrawer = (task: Task) => {
    setItemTask(task);
    setIsItemDrawerOpen(true);
  };

  const requestEndWork = (task: Task) => {
    setTaskToEnd(task);
    setEndSuccess(false);
    setEndError(false);
    openEndConfirm();
  };

  const confirmEndWork = async () => {
    if (!taskToEnd) return;

    try {
      setEndConfirmLoading(true);
      setEndingId(taskToEnd.workOrderStageId);

      const response = await Post(
        "workordertask/end",
        { workOrderStageId: taskToEnd.workOrderStageId },
        false,
      );

      if (response?.data?.success || response?.data?.status === 200) {
        const seconds = Number(response?.data?.data?.durationSeconds) || 0;
        setEndSuccess(true);
        setEndError(false);
        toastsuccessmsg(
          `Work completed. Total time ${formatDuration(seconds * 1000)}`,
        );
        fetchTasks();
      } else {
        setEndError(true);
        setEndSuccess(false);
        toasterrormsg(response?.data?.message || "Failed to end work.");
      }
    } catch (error: any) {
      console.error("End work error:", error);
      setEndError(true);
      setEndSuccess(false);
      toasterrormsg(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong.",
      );
    } finally {
      setEndConfirmLoading(false);
      setEndingId(null);
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

      columnHelper.accessor("modelName", {
        header: "Model",
        cell: ({ row }) => (
          <span>{row.original.modelName || row.original.model || "-"}</span>
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
          const { startTime, endTime } = row.original;
          if (!startTime) return <span className="text-gray-400">-</span>;

          const end = endTime ? new Date(endTime).getTime() : now;
          const ms = end - new Date(startTime).getTime();
          const totalSec = Math.max(0, Math.floor(ms / 1000));

          const days = Math.floor(totalSec / 86400);
          const hours = Math.floor((totalSec % 86400) / 3600);
          const mins = Math.floor((totalSec % 3600) / 60);
          const secs = totalSec % 60;

          // Compact circular-style chips
          const Chip = ({ value, label }: { value: number; label: string }) => (
            <div className="flex flex-col items-center">
              <div className="border-primary-500/70 bg-primary-500/10 text-primary-600 dark:text-primary-400 flex size-9 items-center justify-center rounded-full border-2 text-xs font-semibold">
                {String(value).padStart(2, "0")}
              </div>
              <span className="mt-0.5 text-[10px] text-gray-400">{label}</span>
            </div>
          );

          return (
            <div className="flex items-center gap-1.5">
              {days > 0 && <Chip value={days} label="d" />}
              <Chip value={hours} label="h" />
              <Chip value={mins} label="m" />
              <Chip value={secs} label="s" />
            </div>
          );
        },
      }),

      // columnHelper.display({
      //   id: "itemProcess",
      //   header: "Item Process",
      //   cell: ({ row }) => (
      //     <button
      //       type="button"
      //       title="Item Process"
      //       onClick={() => openItemDrawer(row.original)}
      //       className="dark:text-dark-200 cursor-pointer text-gray-500 hover:text-gray-700 dark:hover:text-gray-100"
      //     >
      //       <EyeIcon className="mx-auto size-5" />
      //     </button>
      //   ),
      // }),

      columnHelper.display({
        id: "endTime",
        header: "End Time",
        cell: ({ row }) => {
          const task = row.original;
          const needsItems = task.stage === "CUTTING"; // only Cutting needs items

          const EyeButton = needsItems ? (
            <button
              type="button"
              title="Item Process"
              onClick={() => openItemDrawer(task)}
              className="dark:text-dark-200 cursor-pointer text-gray-500 hover:text-gray-700 dark:hover:text-gray-100"
            >
              <EyeIcon className="size-5" />
            </button>
          ) : null;

          // finished → end time badge
          if (task.endTime) {
            return (
              <div className="flex items-center gap-3">
                <div className="inline-flex flex-col items-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs">
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    {formatTime(task.endTime)}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {formatDate(task.endTime)}
                  </span>
                </div>
                {EyeButton}
              </div>
            );
          }

          // running → End enabled when verified OR stage doesn't need items
          const canEnd =
            task.status === "In Progress" &&
            (Boolean(task.itemsVerified) || !needsItems);
          const isLoading = endingId === task.workOrderStageId;

          return (
            <div className="flex items-center gap-3">
              {EyeButton}

              <button
                type="button"
                title={canEnd ? "End Work" : "Verify items first"}
                disabled={!canEnd || isLoading}
                onClick={() => requestEndWork(task)}
                className={[
                  "group relative inline-flex size-9 cursor-pointer items-center justify-center rounded-full border transition-all duration-200",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2",
                  "dark:focus-visible:ring-offset-dark-700",
                  canEnd
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 hover:border-emerald-500 hover:bg-emerald-500 hover:text-white hover:shadow-md hover:shadow-emerald-500/30 active:scale-95 dark:text-emerald-400 dark:hover:text-white"
                    : "dark:border-dark-500 dark:bg-dark-600 dark:text-dark-400 cursor-not-allowed border-gray-200 bg-gray-50 text-gray-300",
                ].join(" ")}
              >
                <CheckIcon
                  className={[
                    "size-5 transition-transform duration-200",
                    canEnd ? "group-hover:scale-110" : "",
                  ].join(" ")}
                />
                <span className="dark:bg-dark-900 pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 rounded-md bg-gray-900 px-2 py-1 text-[10px] font-medium whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
                  {canEnd ? "End Work" : "Verify items first"}
                </span>
              </button>
            </div>
          );
        },
      }),
    ],

    [now, endingId],
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
      <ItemProcessDrawer
        isOpen={isItemDrawerOpen}
        close={() => setIsItemDrawerOpen(false)}
        workOrderStageId={itemTask?.workOrderStageId ?? null}
        workOrderNo={itemTask?.workOrderNo || ""}
        onSaved={fetchTasks}
      />
      <ConfirmModal
        show={isEndConfirmOpen}
        onClose={() => {
          closeEndConfirm();
          setTaskToEnd(null);
          setEndSuccess(false);
          setEndError(false);
        }}
        messages={endMessages}
        onOk={confirmEndWork}
        confirmLoading={endConfirmLoading}
        state={endState}
      />
    </Page>
  );
}

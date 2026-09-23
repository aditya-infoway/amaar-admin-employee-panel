import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/outline";
import { Page } from "@/components/shared/Page";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { Get, toasterrormsg } from "@/ApiHelper";
import { exportToExcel, exportToPdf } from "./shared/export";
import { MasterTable } from "./shared/MasterTable";
import { MasterToolbar } from "./shared/MasterToolbar";
import { columns, exportColumns } from "./columns";
import {
  mapApiStockReportItemToStockReportItem,
  StockReportItem,
} from "./data";

export default function StockReportPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<StockReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "complete">("pending"); // ✅ naya

  const fetchAll = async () => {
    setLoading(true);
    try {
      const response = await Get("storemanager/itemRequest/list", {}, false);

      if (response.data?.success) {
        const mapped = (response.data.data || []).map(
          mapApiStockReportItemToStockReportItem,
        );
        setData(mapped);
      } else {
        toasterrormsg(
          response.data?.message || "Failed to fetch item request register.",
        );
      }
    } catch (error) {
      console.error("fetchAll error:", error);
      toasterrormsg(
        "Something went wrong while fetching item request register.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ NEW — tab ke hisaab se pehle split karo
  const tabFilteredData = useMemo(() => {
    return data.filter((item) => {
      const status = (item.status || "Pending").toLowerCase();
      if (activeTab === "pending") return status !== "complete";
      return status === "complete";
    });
  }, [data, activeTab]);

  const categoryOptions = useMemo(() => {
    const unique = Array.from(
      new Set(tabFilteredData.map((item) => item.categoryName).filter(Boolean)),
    );
    return [
      { id: "", label: "All" },
      ...unique.map((name) => ({ id: name as string, label: name as string })),
    ];
  }, [tabFilteredData]);

  const groupOptions = useMemo(() => {
    const unique = Array.from(
      new Set(tabFilteredData.map((item) => item.groupName).filter(Boolean)),
    );
    return [
      { id: "", label: "All" },
      ...unique.map((name) => ({ id: name as string, label: name as string })),
    ];
  }, [tabFilteredData]);

  const filteredData = useMemo(() => {
    return tabFilteredData.filter((item) => {
      if (filterCategory && item.categoryName !== filterCategory) return false;
      if (filterGroup && item.groupName !== filterGroup) return false;
      return true;
    });
  }, [tabFilteredData, filterCategory, filterGroup]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      viewRow: (row: StockReportItem) =>
        navigate(`/item-request-register/${row.id}`),
    },
    filterFns: { fuzzy: fuzzyFilter },
    globalFilterFn: fuzzyFilter,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Page title="Item Request Register">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Item Request Register"
          searchPlaceholder="Search date, work order id, model..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "stock-report")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "Stock Report",
              "stock-report",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-2">
              <Listbox
                data={categoryOptions}
                value={
                  categoryOptions.find((item) => item.id === filterCategory) ||
                  categoryOptions[0]
                }
                onChange={(item) => setFilterCategory(item.id)}
                label="Item Category"
                placeholder="All categories"
                displayField="label"
              />
              <Listbox
                data={groupOptions}
                value={
                  groupOptions.find((item) => item.id === filterGroup) ||
                  groupOptions[0]
                }
                onChange={(item) => setFilterGroup(item.id)}
                label="Group"
                placeholder="All groups"
                displayField="label"
              />
            </div>
          }
        />

        {/* ✅ NEW — Pending / Complete tabs, BOM/Sub BOM jaisa */}
        {/* ✅ Pending / Complete tabs — BOM/Sub BOM jaisa */}
        <div className="dark:border-dark-600 mt-5 mb-5 border-b border-gray-200">
          <div className="flex items-center gap-8 pl-4">
            <button
              type="button"
              onClick={() => setActiveTab("pending")}
              className={`relative flex items-center gap-2 pb-3 text-sm font-medium transition-colors ${
                activeTab === "pending"
                  ? "text-primary"
                  : "dark:text-dark-300 dark:hover:text-dark-100 text-gray-500 hover:text-gray-700"
              }`}
            >
              <ClockIcon className="size-4" />
              Pending
              {activeTab === "pending" && (
                <span className="bg-primary absolute right-0 -bottom-px left-0 h-0.5 rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("complete")}
              className={`relative flex items-center gap-2 pb-3 text-sm font-medium transition-colors ${
                activeTab === "complete"
                  ? "text-primary"
                  : "dark:text-dark-300 dark:hover:text-dark-100 text-gray-500 hover:text-gray-700"
              }`}
            >
              <CheckCircleIcon className="size-4" />
              Complete
              {activeTab === "complete" && (
                <span className="bg-primary absolute right-0 -bottom-px left-0 h-0.5 rounded-full" />
              )}
            </button>
          </div>
        </div>

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={
            loading
              ? "Loading item request register.."
              : activeTab === "pending"
                ? "No pending item requests."
                : "No completed item requests."
          }
        />
      </div>
    </Page>
  );
}

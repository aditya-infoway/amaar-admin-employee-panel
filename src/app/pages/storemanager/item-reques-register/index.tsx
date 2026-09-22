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

import { Page } from "@/components/shared/Page";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { Get, toasterrormsg } from "@/ApiHelper";
import { exportToExcel, exportToPdf } from "./shared/export";
import { MasterTable } from "./shared/MasterTable";
import { MasterToolbar } from "./shared/MasterToolbar";
import { columns, exportColumns } from "./columns";
import { mapApiStockReportItemToStockReportItem, StockReportItem } from "./data";

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

  // ---- API se item request register fetch karo ----
  const fetchAll = async () => {
    setLoading(true);
    try {
      const response = await Get("storemanager/item-request-register/list", {}, false);
      if (response.data?.success) {
        setData((response.data.data || []).map(mapApiStockReportItemToStockReportItem));
      } else {
        toasterrormsg(response.data?.message || "Failed to fetch item request register.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while fetching item request register.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ NEW — Item Category filter options
  const categoryOptions = useMemo(() => {
    const unique = Array.from(new Set(data.map((item) => item.categoryName).filter(Boolean)));
    return [
      { id: "", label: "All" },
      ...unique.map((name) => ({ id: name as string, label: name as string })),
    ];
  }, [data]);

  // ✅ NEW — Group filter options
  const groupOptions = useMemo(() => {
    const unique = Array.from(new Set(data.map((item) => item.groupName).filter(Boolean)));
    return [
      { id: "", label: "All" },
      ...unique.map((name) => ({ id: name as string, label: name as string })),
    ];
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filterCategory && item.categoryName !== filterCategory) return false;
      if (filterGroup && item.groupName !== filterGroup) return false;
      return true;
    });
  }, [data, filterCategory, filterGroup]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      viewRow: (row: StockReportItem) => navigate(`/item-reques-register/${row.id}`),
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
          onExportExcel={() => exportToExcel(filteredData, exportColumns, "stock-report")}
          onExportPdf={() => exportToPdf(filteredData, exportColumns, "Stock Report", "stock-report")}
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-2">
              <Listbox
                data={categoryOptions}
                value={categoryOptions.find((item) => item.id === filterCategory) || categoryOptions[0]}
                onChange={(item) => setFilterCategory(item.id)}
                label="Item Category"
                placeholder="All categories"
                displayField="label"
              />
              <Listbox
                data={groupOptions}
                value={groupOptions.find((item) => item.id === filterGroup) || groupOptions[0]}
                onChange={(item) => setFilterGroup(item.id)}
                label="Group"
                placeholder="All groups"
                displayField="label"
              />
            </div>
          }
        />
        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={loading ? "Loading item request register.." : "No item request available."}
        />
      </div>
    </Page>
  );
}
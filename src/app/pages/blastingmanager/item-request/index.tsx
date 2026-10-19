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
import { Input } from "@/components/ui";
import { Get, toasterrormsg } from "@/ApiHelper";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { exportToExcel, exportToPdf } from "../shared/export";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { columns, exportColumns } from "./columns";
import { ItemRequestRecord } from "./data";
import { ViewItemsModal } from "./ViewItemsModal";

export default function ItemRequestListPage() {
  const navigate = useNavigate();

  const [data, setData] = useState<ItemRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filterWorkOrder, setFilterWorkOrder] = useState("");

  // ---- View modal state ----
  const [viewOpen, setViewOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<ItemRequestRecord | null>(null);

  const fetchList = async () => {
    try {
      setLoading(true);
      const financialYearId = localStorage.getItem("financialYearId");
      const params: Record<string, any> = { _t: Date.now() };
      if (financialYearId) params.financialYearId = Number(financialYearId);

      const res = await Get("blasting/itemrequest", params, false);

      if (res?.data?.success || res?.data?.status === 200) {
        setData(Array.isArray(res.data.data) ? res.data.data : []);
      } else {
        setData([]);
        toasterrormsg(res?.data?.message || "Failed to load item requests.");
      }
    } catch (err: any) {
      setData([]);
      toasterrormsg(
        err?.response?.data?.message || "Failed to load item requests.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (
        filterWorkOrder &&
        !(item.workOrderNo || "")
          .toLowerCase()
          .includes(filterWorkOrder.toLowerCase())
      )
        return false;
      return true;
    });
  }, [data, filterWorkOrder]);

  const handleViewRow = (row: ItemRequestRecord) => {
    setViewRecord(row);
    setViewOpen(true);
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => String(row.id),
    meta: {
      viewRow: handleViewRow,
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
    <Page title="Item Requests">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Item Requests"
          createLabel="Add Item Request"
          searchPlaceholder="Search item requests..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => navigate("/item-request/add")}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "item-requests")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "Item Request List",
              "item-requests",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Work Order"
                value={filterWorkOrder}
                onChange={(e) => setFilterWorkOrder(e.target.value)}
                placeholder="Filter by work order no"
              />
            </div>
          }
        />

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={
            loading
              ? "Loading item requests..."
              : "No item requests found. Click Add Item Request to create one."
          }
        />
      </div>

      <ViewItemsModal
        open={viewOpen}
        record={viewRecord}
        onClose={() => setViewOpen(false)}
      />
    </Page>
  );
}
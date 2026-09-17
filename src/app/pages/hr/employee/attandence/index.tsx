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

import { Page } from "@/components/shared/Page";
import { Input } from "@/components/ui";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { Get, toasterrormsg } from "@/ApiHelper";
import { exportToExcel, exportToPdf } from "../shared/export";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { createColumns, exportColumns } from "./columns";
import { Attendance, mapApiAttendanceToAttendance } from "./data";

export default function AttendancePage() {
  const [data, setData] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // ---- Fetch attendance list ----
  const fetchAll = async () => {
    setLoading(true);
    try {
      const response = await Get("hr/attendance/list", {}, false);

      if (response.data?.success) {
        setData((response.data.data || []).map(mapApiAttendanceToAttendance));
      } else {
        toasterrormsg(response.data?.message || "Failed to fetch attendance.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while fetching attendance data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = useMemo(() => createColumns(), []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (
        filterName &&
        !item.employeeName.toLowerCase().includes(filterName.toLowerCase())
      )
        return false;
      if (filterDate && item.checkinDate !== filterDate) return false;
      return true;
    });
  }, [data, filterName, filterDate]);

  const exportRows = filteredData;

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
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
    <Page title="Attendance Register">
      <div className="transition-content w-full pb-5">
       <MasterToolbar
  title="Attendance Register"
  searchPlaceholder="Search by employee name..."
  table={table}
  showFilters={showFilters}
  onToggleFilters={() => setShowFilters((v) => !v)}
  onExportExcel={() =>
    exportToExcel(exportRows, exportColumns, "attendance")
  }
  onExportPdf={() =>
    exportToPdf(
      exportRows,
      exportColumns,
      "Attendance Register",
      "attendance",
    )
  }
  createLabel=""
  onCreate={() => {}}
  filterPanel={
    <div className="grid gap-4 sm:grid-cols-2">
      <Input
        label="Employee Name"
        value={filterName}
        onChange={(e) => setFilterName(e.target.value)}
        placeholder="Filter by employee name"
      />

      <Input
        label="Date"
        type="date"
        value={filterDate}
        onChange={(e) => setFilterDate(e.target.value)}
      />
    </div>
  }
/>

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={
            loading
              ? "Loading attendance..."
              : "No attendance records found."
          }
        />
      </div>
    </Page>
  );
}
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
import { Listbox } from "@/components/shared/form/StyledListbox";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { Get, Delete, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";
import { exportToExcel, exportToPdf } from "../../master/shared/export";
import { MasterTable } from "../../master/shared/MasterTable";
import { MasterToolbar } from "../../master/shared/MasterToolbar";
import {
  entryStatusOptions,
  idProofTypeOptions,
} from "../../master/shared/constants";
import { createColumns, exportColumns } from "./columns";
import { mapApiVisitorEntryToVisitorEntry, VisitorEntry } from "./data";
import { VisitorExitDrawer } from "./form/VisitorExitDrawer";
import { printGatePass } from "./form/gatePassPrint";

function getLabel(
  options: { id: string; label: string }[],
  id: string,
): string {
  return options.find((item) => item.id === id)?.label || "—";
}

export default function VisitorEntryListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<VisitorEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterIdProof, setFilterIdProof] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [exitVisitor, setExitVisitor] = useState<VisitorEntry | null>(null);

  // ---- API se list fetch karo ----
  const fetchList = async () => {
    setLoading(true);
    try {
      const response = await Get("employee/security/visitorentry/list", {}, false);
      if (response.data?.success) {
        setData((response.data.data || []).map(mapApiVisitorEntryToVisitorEntry));
      } else {
        toasterrormsg(response.data?.message || "Failed to fetch visitor entries.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while fetching visitor entries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = useMemo(
    () => createColumns(getLabel, idProofTypeOptions, entryStatusOptions),
    [],
  );

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (
        filterName &&
        !item.fullName.toLowerCase().includes(filterName.toLowerCase())
      ) {
        return false;
      }
      if (filterIdProof && item.idProofType !== filterIdProof) return false;
      if (filterStatus && item.status !== filterStatus) return false;
      return true;
    });
  }, [data, filterName, filterIdProof, filterStatus]);

  const exportRows = filteredData.map((row) => ({
    ...row,
    idProofTypeLabel: getLabel(idProofTypeOptions, row.idProofType),
    statusLabel: getLabel(entryStatusOptions, row.status),
  }));

  // ---- Delete API call ----
  const handleDeleteOne = async (row: VisitorEntry) => {
    try {
      const response = await Delete(
        "employee/security/visitorentry/delete",
        { visitorEntryId: Number(row.id) },
        false,
      );
      if (response.data?.success) {
        toastsuccessmsg(response.data?.message || "Visitor entry deleted successfully.");
        setData((prev) => prev.filter((item) => item.id !== row.id));
      } else {
        toasterrormsg(response.data?.message || "Failed to delete visitor entry.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while deleting the visitor entry.");
    }
  };

  const handleDeleteMany = async (rows: { original: VisitorEntry }[]) => {
    try {
      await Promise.all(
        rows.map((r) =>
          Delete("employee/security/visitorentry/delete", { visitorEntryId: Number(r.original.id) }, false),
        ),
      );
      const ids = new Set(rows.map((r) => r.original.id));
      setData((prev) => prev.filter((item) => !ids.has(item.id)));
      setRowSelection({});
      toastsuccessmsg("Selected visitor entries deleted successfully.");
    } catch (error) {
      toasterrormsg("Something went wrong while deleting visitor entries.");
    }
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row) =>
        navigate(`/visitoremaster/edit/${row.original.id}`),
      openExitDrawer: (row) => setExitVisitor(row.original),
      deleteRow: (row) => handleDeleteOne(row.original),
      deleteRows: (rows) => handleDeleteMany(rows),
      printRow: (row) => printGatePass(row.original),
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
    <Page title="Visitor Entry">
      <div className="transition-content w-full pb-8">
        <MasterToolbar
          title="Visitor Entry"
          createLabel="New Visitor Entry"
          searchPlaceholder="Search visitors..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => navigate("/visitoremaster/create")}
          onExportExcel={() =>
            exportToExcel(exportRows, exportColumns, "visitor-entry")
          }
          onExportPdf={() =>
            exportToPdf(
              exportRows,
              exportColumns,
              "Visitor Entry List",
              "visitor-entry",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Visitor Name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Filter by name"
              />
              <Listbox
                data={[{ id: "", label: "All" }, ...idProofTypeOptions]}
                value={
                  [{ id: "", label: "All" }, ...idProofTypeOptions].find(
                    (item) => item.id === filterIdProof,
                  ) || { id: "", label: "All" }
                }
                onChange={(item) => setFilterIdProof(item.id)}
                label="ID Proof Type"
                placeholder="All types"
                displayField="label"
              />
              <Listbox
                data={[{ id: "", label: "All" }, ...entryStatusOptions]}
                value={
                  [{ id: "", label: "All" }, ...entryStatusOptions].find(
                    (item) => item.id === filterStatus,
                  ) || { id: "", label: "All" }
                }
                onChange={(item) => setFilterStatus(item.id)}
                label="Status"
                placeholder="All statuses"
                displayField="label"
              />
            </div>
          }
        />
        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={
            loading
              ? "Loading visitor entries..."
              : "No visitor entries found. Click New Visitor Entry to add one."
          }
        />
      </div>

      <VisitorExitDrawer
        visitor={exitVisitor}
        onClose={() => setExitVisitor(null)}
        onSaved={() => {
          setExitVisitor(null);
          fetchList(); // exit hone ke baad list refresh — status "OUT" ho jayega
        }}
      />
    </Page>
  );
}
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { Page } from "@/components/shared/Page";
import { Input } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { exportToExcel, exportToPdf } from "../../master/shared/export";
import { MasterTable } from "../../master/shared/MasterTable";
import { MasterToolbar } from "../../master/shared/MasterToolbar";
import {
  entryStatusOptions,
  idProofTypeOptions,
} from "../../master/shared/constants";
import { visitorStorage } from "../../master/shared/storage";
import { createColumns, exportColumns } from "./columns";
import { VisitorEntry } from "./data";
import { VisitorExitDrawer } from "./form/VisitorExitDrawer";

function getLabel(
  options: { id: string; label: string }[],
  id: string,
): string {
  return options.find((item) => item.id === id)?.label || "—";
}

export default function VisitorEntryListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<VisitorEntry[]>(() =>
    visitorStorage.getItems(),
  );
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterIdProof, setFilterIdProof] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [exitVisitor, setExitVisitor] = useState<VisitorEntry | null>(null);

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

  const persist = (next: VisitorEntry[]) => {
    setData(next);
    visitorStorage.saveItems(next);
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
      deleteRow: (row) =>
        persist(data.filter((item) => item.id !== row.original.id)),
      deleteRows: (rows) => {
        const ids = new Set(rows.map((r) => r.original.id));
        persist(data.filter((item) => !ids.has(item.id)));
        setRowSelection({});
      },
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
          emptyMessage="No visitor entries found. Click New Visitor Entry to add one."
        />
      </div>

      <VisitorExitDrawer
        visitor={exitVisitor}
        onClose={() => setExitVisitor(null)}
        onSaved={(updated) =>
          persist(data.map((item) => (item.id === updated.id ? updated : item)))
        }
      />
    </Page>
  );
}

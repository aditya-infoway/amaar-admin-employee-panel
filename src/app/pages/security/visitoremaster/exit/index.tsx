import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

import { Page } from "@/components/shared/Page";
import { Input } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { Get, toasterrormsg } from "@/ApiHelper";
import { exportToExcel, exportToPdf } from "../../../master/shared/export";
import { MasterTable } from "../../../master/shared/MasterTable";
import { MasterToolbar } from "../../../master/shared/MasterToolbar";
import {
  entryStatusOptions,
  idProofTypeOptions,
} from "../../../master/shared/constants";
import { createColumns, exportColumns } from "../columns";
import { mapApiVisitorEntryToVisitorEntry, VisitorEntry } from "../data";
import { VisitorExitDrawer } from "../form/VisitorExitDrawer";

function getLabel(
  options: { id: string; label: string }[],
  id: string,
): string {
  return options.find((item) => item.id === id)?.label || "—";
}

export default function VisitorExitPage() {
  const [data, setData] = useState<VisitorEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterIdProof, setFilterIdProof] = useState("");
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
  }, []);

  const columns = useMemo(
    () =>
      createColumns(getLabel, idProofTypeOptions, entryStatusOptions, "exit"),
    [],
  );

  // ---- Sirf wahi visitors jo abhi andar hai (status = IN) ----
  const insideVisitors = useMemo(
    () => data.filter((item) => item.status === "IN"),
    [data],
  );

  const filteredData = useMemo(() => {
    return insideVisitors.filter((item) => {
      if (
        filterName &&
        !item.fullName.toLowerCase().includes(filterName.toLowerCase())
      ) {
        return false;
      }
      if (filterIdProof && item.idProofType !== filterIdProof) return false;
      return true;
    });
  }, [insideVisitors, filterName, filterIdProof]);

  const exportRows = filteredData.map((row) => ({
    ...row,
    idProofTypeLabel: getLabel(idProofTypeOptions, row.idProofType),
    statusLabel: getLabel(entryStatusOptions, row.status),
  }));

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openExitDrawer: (row: Row<VisitorEntry>) => setExitVisitor(row.original),
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
    <Page title="Visitor Exit">
      <div className="transition-content w-full pb-8">
        <MasterToolbar
          title="Visitor Exit — Currently Inside"
          searchPlaceholder="Search by name, badge, gate pass..."
          table={table}
          searchBelow
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onExportExcel={() =>
            exportToExcel(exportRows, exportColumns, "visitor-exit")
          }
          onExportPdf={() =>
            exportToPdf(
              exportRows,
              exportColumns,
              "Visitors Currently Inside",
              "visitor-exit",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Visitor Name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Search by name"
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
            </div>
          }
        />
        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={
            loading
              ? "Loading visitors..."
              : "No visitors currently inside. All visitors have exited."
          }
        />
      </div>

      <VisitorExitDrawer
        visitor={exitVisitor}
        onClose={() => setExitVisitor(null)}
        onSaved={() => {
          setExitVisitor(null);
          fetchList(); // exit hone ke baad list refresh — visitor "IN" list se hat jayega
        }}
      />
    </Page>
  );
}
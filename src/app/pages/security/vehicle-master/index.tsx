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
  gateOptions,
  vehicleTypeOptions,
} from "../../master/shared/constants";
import { vehicleStorage } from "../../master/shared/storage";
import { createColumns, exportColumns } from "./columns";
import { VehicleEntry } from "./data";
import { VehicleExitDrawer } from "./form/VehicleExitDrawer";

function getLabel(
  options: { id: string; label: string }[],
  id: string,
): string {
  return options.find((item) => item.id === id)?.label || "—";
}

export default function VehicleEntryListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<VehicleEntry[]>(() =>
    vehicleStorage.getItems(),
  );
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filterVehicleNumber, setFilterVehicleNumber] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [exitVehicle, setExitVehicle] = useState<VehicleEntry | null>(null);

  const columns = useMemo(
    () => createColumns(getLabel, vehicleTypeOptions, entryStatusOptions),
    [],
  );

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (
        filterVehicleNumber &&
        !item.vehicleNumber
          .toLowerCase()
          .includes(filterVehicleNumber.toLowerCase())
      ) {
        return false;
      }
      if (filterType && item.vehicleType !== filterType) return false;
      if (filterStatus && item.status !== filterStatus) return false;
      return true;
    });
  }, [data, filterVehicleNumber, filterType, filterStatus]);

  const exportRows = filteredData.map((row) => ({
    ...row,
    vehicleTypeLabel: getLabel(vehicleTypeOptions, row.vehicleType),
    gateNumberLabel: getLabel(gateOptions, row.gateNumber),
    statusLabel: getLabel(entryStatusOptions, row.status),
  }));

  const persist = (next: VehicleEntry[]) => {
    setData(next);
    vehicleStorage.saveItems(next);
  };

  const table = useReactTable({   
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: Row<VehicleEntry>) =>
        navigate(`/vehiclemaster/edit/${row.original.id}`),
      openExitDrawer: (row: Row<VehicleEntry>) =>
        setExitVehicle(row.original),
      deleteRow: (row: Row<VehicleEntry>) =>
        persist(data.filter((item) => item.id !== row.original.id)),
      deleteRows: (rows: Row<VehicleEntry>[]) => {
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
    <Page title="Vehicle Entry">
      <div className="transition-content w-full pb-8">
        <MasterToolbar
          title="Vehicle Entry"
          createLabel="New Vehicle Entry"
          searchPlaceholder="Search vehicles..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => navigate("/vehiclemaster/create")}
          onExportExcel={() =>
            exportToExcel(exportRows, exportColumns, "vehicle-entry")
          }
          onExportPdf={() =>
            exportToPdf(
              exportRows,
              exportColumns,
              "Vehicle Entry List",
              "vehicle-entry",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Vehicle Number"
                value={filterVehicleNumber}
                onChange={(e) => setFilterVehicleNumber(e.target.value)}
                placeholder="Filter by vehicle no."
              />
              <Listbox
                data={[{ id: "", label: "All" }, ...vehicleTypeOptions]}
                value={
                  [{ id: "", label: "All" }, ...vehicleTypeOptions].find(
                    (item) => item.id === filterType,
                  ) || { id: "", label: "All" }
                }
                onChange={(item) => setFilterType(item.id)}
                label="Vehicle Type"
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
          emptyMessage="No vehicle entries found. Click New Vehicle Entry to add one."
        />
      </div>

      <VehicleExitDrawer
        vehicle={exitVehicle}
        onClose={() => setExitVehicle(null)}
        onSaved={(updated) =>
          persist(data.map((item) => (item.id === updated.id ? updated : item)))
        }
      />
    </Page>
  );
}

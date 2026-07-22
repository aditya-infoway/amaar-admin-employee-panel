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
import { Get, Put, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";
import { exportToExcel, exportToPdf } from "../../../master/shared/export";
import { MasterTable } from "../../../master/shared/MasterTable";
import { MasterToolbar } from "../../../master/shared/MasterToolbar";
import {
  entryStatusOptions,
  gateOptions,
  vehicleTypeOptions,
} from "../../../master/shared/constants";
import { buildFormData } from "../../../master/shared/toFormData";
import { createColumns, exportColumns } from "../columns";
import { mapApiVehicleEntryToVehicleEntry, VehicleEntry } from "../data";
import { VehicleExitDrawer, ExitFields } from "../form/VehicleExitDrawer";

function getLabel(
  options: { id: string; label: string }[],
  id: string,
): string {
  return options.find((item) => item.id === id)?.label || "—";
}

export default function VehicleExitPage() {
  const [data, setData] = useState<VehicleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filterVehicleNumber, setFilterVehicleNumber] = useState("");
  const [filterType, setFilterType] = useState("");
  const [exitVehicle, setExitVehicle] = useState<VehicleEntry | null>(null);

  // ---- API se list fetch karo (same endpoint jo entry list page use karta hai) ----
  const fetchList = async () => {
    setLoading(true);
    try {
      const response = await Get("employee/security/vehicleentry/list", {}, false);
      if (response.data?.success) {
        setData((response.data.data || []).map(mapApiVehicleEntryToVehicleEntry));
      } else {
        toasterrormsg(response.data?.message || "Failed to fetch vehicle entries.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while fetching vehicle entries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = useMemo(
    () =>
      createColumns(getLabel, vehicleTypeOptions, entryStatusOptions, "exit"),
    [],
  );

  // ---- Sirf wahi vehicles jo abhi IN status me hai (andar khade hai) ----
  const insideVehicles = useMemo(
    () => data.filter((item) => item.status === "IN"),
    [data],
  );

  const filteredData = useMemo(() => {
    return insideVehicles.filter((item) => {
      if (
        filterVehicleNumber &&
        !item.vehicleNumber
          .toLowerCase()
          .includes(filterVehicleNumber.toLowerCase())
      ) {
        return false;
      }
      if (filterType && item.vehicleType !== filterType) return false;
      return true;
    });
  }, [insideVehicles, filterVehicleNumber, filterType]);

  const exportRows = filteredData.map((row) => ({
    ...row,
    vehicleTypeLabel: getLabel(vehicleTypeOptions, row.vehicleType),
    gateNumberLabel: getLabel(gateOptions, row.gateNumber),
    statusLabel: getLabel(entryStatusOptions, row.status),
  }));

  // ---- Exit API call — same jo entry list page me use ho rahi hai ----
  const handleExitSaved = async (vehicleId: string, fields: ExitFields) => {
    const formData = buildFormData({
      vehicleEntryId: vehicleId,
      exitTime: fields.exitTime,
      exitVehicleCondition: fields.exitVehicleCondition,
      conditionChangedAtExit: fields.conditionChangedAtExit,
      exitPhotoFront: fields.conditionChangedAtExit ? fields.exitPhotoFront : undefined,
      exitPhotoBack: fields.conditionChangedAtExit ? fields.exitPhotoBack : undefined,
    });

    try {
      const response = await Put("employee/security/vehicleentry/exit", formData, true);
      if (response.data?.success) {
        toastsuccessmsg(response.data?.message || "Vehicle exit marked successfully.");
        setExitVehicle(null);
        fetchList(); // list refresh — ab ye vehicle "IN" list se hat jayega
      } else {
        toasterrormsg(response.data?.message || "Failed to mark vehicle exit.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while marking vehicle exit.");
    }
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openExitDrawer: (row: Row<VehicleEntry>) => setExitVehicle(row.original),
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
    <Page title="Vehicle Exit">
      <div className="transition-content w-full pb-8">
        <MasterToolbar
          title="Vehicle Exit — Currently Inside"
          searchPlaceholder="Search by vehicle number, driver..."
          table={table}
          searchBelow
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onExportExcel={() =>
            exportToExcel(exportRows, exportColumns, "vehicle-exit")
          }
          onExportPdf={() =>
            exportToPdf(
              exportRows,
              exportColumns,
              "Vehicles Currently Inside",
              "vehicle-exit",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Vehicle Number"
                value={filterVehicleNumber}
                onChange={(e) => setFilterVehicleNumber(e.target.value)}
                placeholder="Search vehicle no."
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
            </div>
          }
        />
        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={
            loading
              ? "Loading vehicle entries..."
              : "No vehicles currently inside. All vehicles have exited."
          }
        />
      </div>

      <VehicleExitDrawer
        vehicle={exitVehicle}
        onClose={() => setExitVehicle(null)}
        onSaved={(fields) => exitVehicle && handleExitSaved(exitVehicle.id, fields)}
      />
    </Page>
  );
}
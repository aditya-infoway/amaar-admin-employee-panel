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
import { exportToExcel, exportToPdf } from "../shared/export";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { employeeTypeOptions, employeeStatusOptions } from "../employeeRegister/form/constants";
import { createColumns, exportColumns } from "./columns";
import { mapApiEmployeeEntryToEmployeeEntry, EmployeeEntry } from "./data";

function getLabel(
  options: { id: string; label: string }[],
  id: string,
): string {
  return options.find((item) => item.id === id)?.label || "—";
}

export default function EmployeeListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<EmployeeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterEmployeeType, setFilterEmployeeType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // ---- API se list fetch karo ----
 const fetchList = async () => {
  setLoading(true);

  try {
    const financialYearId =
      localStorage.getItem("financialYearId");

   

    const response = await Get(
      "hr/employee/registered-list",
      financialYearId
        ? {
            financialYearId: Number(financialYearId),
          }
        : {},
      false,
    );

   

    if (
      response?.data?.success ||
      response?.data?.status === 200
    ) {
      const apiData =
        response?.data?.data || [];

    

      const mappedData = apiData.map(
        mapApiEmployeeEntryToEmployeeEntry
      );

      setData(mappedData);
    } else {
      setData([]);

      toasterrormsg(
        response?.data?.message ||
          "Failed to fetch registered employees."
      );
    }
  } catch (error) {
    console.error(
      "Registered employee list error:",
      error
    );

    setData([]);

    toasterrormsg(
      "Something went wrong while fetching registered employees."
    );
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = useMemo(
    () => createColumns(getLabel, employeeTypeOptions, employeeStatusOptions),
    [],
  );

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const fullName = `${item.firstName} ${item.lastName}`.toLowerCase();
      if (filterName && !fullName.includes(filterName.toLowerCase())) return false;
      if (filterEmployeeType && item.employeeType !== filterEmployeeType) return false;
      if (filterStatus && item.employeeStatus !== filterStatus) return false;
      return true;
    });
  }, [data, filterName, filterEmployeeType, filterStatus]);

  const exportRows = filteredData.map((row) => ({
    ...row,
    employeeTypeLabel: getLabel(employeeTypeOptions, row.employeeType),
    employeeStatusLabel: getLabel(employeeStatusOptions, row.employeeStatus),
  }));

  // ---- Delete API call ----
  const handleDeleteOne = async (row: EmployeeEntry) => {
    try {
      const response = await Delete(
        "hr/employee/delete",
        { employeeEntryId: Number(row.id) },
        false,
      );
      if (response.data?.success) {
        toastsuccessmsg(response.data?.message || "Employee deleted successfully.");
        setData((prev) => prev.filter((item) => item.id !== row.id));
      } else {
        toasterrormsg(response.data?.message || "Failed to delete employee.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while deleting the employee.");
    }
  };

  const handleDeleteMany = async (rows: { original: EmployeeEntry }[]) => {
    try {
      await Promise.all(
        rows.map((r) =>
          Delete("hr/employee/delete", { employeeEntryId: Number(r.original.id) }, false),
        ),
      );
      const ids = new Set(rows.map((r) => r.original.id));
      setData((prev) => prev.filter((item) => !ids.has(item.id)));
      setRowSelection({});
      toastsuccessmsg("Selected employees deleted successfully.");
    } catch (error) {
      toasterrormsg("Something went wrong while deleting employees.");
    }
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
   meta: {
  openEditDrawer: (row) => navigate(`/employee/employeeRegister/edit/${row.id}`),
  deleteRow: (row) => handleDeleteOne(row.original),
  deleteRows: (rows) => handleDeleteMany(rows),
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
    <Page title="Employee Master">
      <div className="transition-content w-full pb-8">
        <MasterToolbar
          title="Employee Master"
          createLabel="New Employee"
          searchPlaceholder="Search employees..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => navigate("/employee/employeeRegister/create")}
          onExportExcel={() => exportToExcel(exportRows, exportColumns, "employee-master")}
          onExportPdf={() =>
            exportToPdf(exportRows, exportColumns, "Employee Master List", "employee-master")
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Employee Name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Filter by name"
              />
              <Listbox
                data={[{ id: "", label: "All" }, ...employeeTypeOptions]}
                value={
                  [{ id: "", label: "All" }, ...employeeTypeOptions].find(
                    (item) => item.id === filterEmployeeType,
                  ) || { id: "", label: "All" }
                }
                onChange={(item) => setFilterEmployeeType(item.id)}
                label="Employee Type"
                placeholder="All types"
                displayField="label"
              />
              <Listbox
                data={[{ id: "", label: "All" }, ...employeeStatusOptions]}
                value={
                  [{ id: "", label: "All" }, ...employeeStatusOptions].find(
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
            loading ? "Loading employees..." : "No employees found. Click New Employee to add one."
          }
        />
      </div>
    </Page>
  );
}
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
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { Get, Delete, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";
import { exportToExcel, exportToPdf } from "../shared/export";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { EnquiryDrawer } from "./CategoryDrawer";
import { createColumns, createExportColumns } from "./columns";
import { Enquiry, mapApiLeadToEnquiry } from "./data";

// TODO: apne existing FY selector/context se yaha value lo (jaise Purchase page karta hai)
const CURRENT_FINANCIAL_YEAR_ID = sessionStorage.getItem("financialYearId") || "";

export default function EnquiryPage() {
  const [data, setData] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [modelOptions, setModelOptions] = useState<{ id: string; label: string }[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Enquiry | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterCity, setFilterCity] = useState("");

  const fetchList = async () => {
    setLoading(true);
    try {
      const response = await Get("employee/sales-executive/lead/list", {}, false);
      if (response.data?.success) {
        setData((response.data.data || []).map(mapApiLeadToEnquiry));
      } else {
        toasterrormsg(response.data?.message || "Failed to fetch enquiries.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while fetching enquiries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // model dropdown ek hi baar load — drawer aur table dono use karenge
    (async () => {
      try {
        const response = await Get("employee/model/list", {}, false);
        if (response.data?.success) {
          setModelOptions(
            (response.data.data || []).map((item: any) => ({
              id: String(item.modelId ?? item.id),
              label: item.modelName ?? item.label,
            })),
          );
        }
      } catch (error) {
        // silent - table model label "—" dikha dega
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = useMemo(() => createColumns(modelOptions), [modelOptions]);
  const exportColumns = useMemo(() => createExportColumns(modelOptions), [modelOptions]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filterName && !item.name.toLowerCase().includes(filterName.toLowerCase())) return false;
      if (filterCity && !item.city.toLowerCase().includes(filterCity.toLowerCase())) return false;
      return true;
    });
  }, [data, filterName, filterCity]);

  const handleDeleteOne = async (row: Enquiry) => {
    try {
      const response = await Delete("employee/sales-executive/lead/delete", { leadId: Number(row.id) }, false);
      if (response.data?.success) {
        toastsuccessmsg(response.data?.message || "Enquiry deleted successfully.");
        setData((prev) => prev.filter((item) => item.id !== row.id));
      } else {
        toasterrormsg(response.data?.message || "Failed to delete enquiry.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while deleting the enquiry.");
    }
  };

  const handleDeleteMany = async (rows: Row<Enquiry>[]) => {
    try {
      await Promise.all(
        rows.map((r) => Delete("employee/sales-executive/lead/delete", { leadId: Number(r.original.id) }, false)),
      );
      const ids = new Set(rows.map((r) => r.original.id));
      setData((prev) => prev.filter((item) => !ids.has(item.id)));
      setRowSelection({});
      toastsuccessmsg("Selected enquiries deleted successfully.");
    } catch (error) {
      toasterrormsg("Something went wrong while deleting enquiries.");
    }
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: Row<Enquiry>) => {
        setEditing(row.original);
        setDrawerOpen(true);
      },
      deleteRow: (row: Row<Enquiry>) => handleDeleteOne(row.original),
      deleteRows: (rows: Row<Enquiry>[]) => handleDeleteMany(rows),
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
    <Page title="Enquiry Register">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Enquiry Register"
          createLabel="Add Enquiry"
          searchPlaceholder="Search enquiries..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => {
            setEditing(null);
            setDrawerOpen(true);
          }}
          onExportExcel={() => exportToExcel(filteredData, exportColumns, "enquiries")}
          onExportPdf={() => exportToPdf(filteredData, exportColumns, "Enquiry List", "enquiries")}
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Name" value={filterName} onChange={(e) => setFilterName(e.target.value)} placeholder="Filter by name" />
              <Input label="City" value={filterCity} onChange={(e) => setFilterCity(e.target.value)} placeholder="Filter by city" />
            </div>
          }
        />

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={loading ? "Loading enquiries..." : "No enquiries found. Click Add Enquiry to add one."}
        />
      </div>

      <EnquiryDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        enquiry={editing}
        financialYearId={CURRENT_FINANCIAL_YEAR_ID}
        onSaved={fetchList}
      />
    </Page>
  );
}
import { ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { TextCell } from "../shared/tableCells";
import { Attendance, formatCountTime } from "./data";


function StatusCell({ row }: { row: { original: Attendance } }) {
  const isOpen = !row.original.checkoutTime;
  return (
    <span   className={ isOpen ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400" : "rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-dark-500 dark:text-dark-200"}>
      {isOpen ? "Checked In" : "Checked Out"}
    </span>
  );
}

// ---- Photo thumbnail (checkin/checkout) ----
function PhotoCell({ url }: { url: string }) {
  if (!url) return <span className="text-gray-400">-</span>;
  return (
    <a href={url} target="_blank" rel="noreferrer">
      <img
        src={url}
        alt="attendance"
        className="size-10 rounded-lg object-cover ring-1 ring-gray-200 dark:ring-dark-500"
      />
    </a>
  );
}

// ---- Location link (opens Google Maps) ----
function LocationCell({ lat, lng }: { lat: string; lng: string }) {
  if (!lat || !lng) return <span className="text-gray-400">-</span>;
  return (
    <a
      href={`https://www.google.com/maps?q=${lat},${lng}`}
      target="_blank"
      rel="noreferrer"
      className="text-primary text-sm font-medium hover:underline"
    >
      View Location
    </a>
  );
}

export function createColumns(): ColumnDef<Attendance>[] {
  return [
    { id: "select", header: SelectHeader, cell: SelectCell, enableSorting: false },
    { id: "employeeId", accessorKey: "employeeId", header: "Employee ID", cell: TextCell },
    { id: "employeeName", accessorKey: "employeeName", header: "Employee Name", cell: TextCell },
    { id: "checkinDate", accessorKey: "checkinDate", header: "Date", cell: TextCell },
    {
      id: "checkinTime",
      accessorFn: (row) =>
        row.checkinTime ? new Date(row.checkinTime).toLocaleTimeString() : "-",
      header: "Check In",
      cell: TextCell,
    },
    {
      id: "checkoutTime",
      accessorFn: (row) =>
        row.checkoutTime ? new Date(row.checkoutTime).toLocaleTimeString() : "-",
      header: "Check Out",
      cell: TextCell,
    },
    {
      id: "countTime",
      accessorFn: (row) => formatCountTime(row.countTime),
      header: "Duration",
      cell: TextCell,
    },
    {
      id: "checkinPhoto",
      header: "Check In Photo",
      enableSorting: false,
      cell: ({ row }) => <PhotoCell url={row.original.checkinPhoto} />,
    },
    {
      id: "checkoutPhoto",
      header: "Check Out Photo",
      enableSorting: false,
      cell: ({ row }) => <PhotoCell url={row.original.checkoutPhoto} />,
    },
    {
      id: "checkinLocation",
      header: "Check In Location",
      enableSorting: false,
      cell: ({ row }) => (
        <LocationCell
          lat={row.original.checkinLatitude}
          lng={row.original.checkinLongitude}
        />
      ),
    },
    {
      id: "checkoutLocation",
      header: "Check Out Location",
      enableSorting: false,
      cell: ({ row }) => (
        <LocationCell
          lat={row.original.checkoutLatitude}
          lng={row.original.checkoutLongitude}
        />
      ),
    },
    {
      id: "status",
      header: "Status",
      enableSorting: false,
      cell: StatusCell,
    },
  ];
}

export const exportColumns = [
  { key: "employeeId" as const, header: "Employee ID" },
  { key: "employeeName" as const, header: "Employee Name" },
  { key: "checkinDate" as const, header: "Date" },
  { key: "checkinTime" as const, header: "Check In" },
  { key: "checkoutTime" as const, header: "Check Out" },
  { key: "countTime" as const, header: "Duration (sec)" },
  { key: "status" as const, header: "Status" },
];
import {
  ArrowDownTrayIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { Table } from "@tanstack/react-table";
import { ReactNode } from "react";

import { Button, Input } from "@/components/ui";
import { CollapsibleSearch } from "@/components/shared/CollapsibleSearch";

interface MasterToolbarProps<T> {
  title: string;
  createLabel?: string;
  searchPlaceholder: string;
  table: Table<T>;
  showFilters: boolean;
  onToggleFilters: () => void;
  onCreate?: () => void;
  onExportExcel: () => void;
  onExportPdf: () => void;
  filterPanel?: ReactNode;
  searchBelow?: boolean;
}

export function MasterToolbar<T>({
  title,
  createLabel,
  searchPlaceholder,
  table,
  showFilters,
  onToggleFilters,
  onCreate,
  onExportExcel,
  onExportPdf,
  filterPanel,
  searchBelow = false,
}: MasterToolbarProps<T>) {
  return (
    <div className="transition-content px-(--margin-x) pt-5 lg:pt-6">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="dark:text-dark-50 text-xl font-semibold tracking-wide text-gray-900 lg:text-2xl dark:text-white">
            {title}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            {!searchBelow && (
              <CollapsibleSearch
                placeholder={searchPlaceholder}
                value={table.getState().globalFilter ?? ""}
                onChange={(e) => table.setGlobalFilter(e.target.value)}
              />
            )}
            <Button
              variant="outlined"
              className="gap-2"
              onClick={onToggleFilters}
            >
              <FunnelIcon className="size-4" />
              <span>Filters</span>
            </Button>
            <Button
              variant="outlined"
              className="gap-2"
              onClick={onExportExcel}
            >
              <ArrowDownTrayIcon className="size-4" />
              <span>Excel</span>
            </Button>
            <Button variant="outlined" className="gap-2" onClick={onExportPdf}>
              <ArrowDownTrayIcon className="size-4" />
              <span>PDF</span>
            </Button>
            {onCreate && createLabel && (
              <Button variant="outlined" className="gap-2" onClick={onCreate}>
                <PlusIcon className="size-4" />
                <span>{createLabel}</span>
              </Button>
            )}
          </div>
        </div>

        {searchBelow && (
          <div className="max-w-md">
            <Input
              type="search"
              value={table.getState().globalFilter ?? ""}
              onChange={(e) => table.setGlobalFilter(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              prefix={<MagnifyingGlassIcon className="size-4" />}
            />
          </div>
        )}

        {showFilters && filterPanel && (
          <div className="dark:bg-dark-700 rounded-lg bg-gray-50 p-4">
            {filterPanel}
          </div>
        )}
      </div>
    </div>
  );
}

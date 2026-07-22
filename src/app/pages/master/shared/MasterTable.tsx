import { flexRender, Table } from "@tanstack/react-table";

import { Card, Table as UiTable, TBody, Td, Th, THead, Tr } from "@/components/ui";
import { PaginationSection } from "@/components/shared/table/PaginationSection";
import { SelectedRowsActions } from "@/components/shared/table/SelectedRowsActions";
import { TableSortIcon } from "@/components/shared/table/TableSortIcon";

interface MasterTableProps<T> {
  table: Table<T>;
  columnCount: number;
  emptyMessage: string;
}

export function MasterTable<T>({
  table,
  columnCount,
  emptyMessage,
}: MasterTableProps<T>) {
  const rows = table.getRowModel().rows;

  return (
    <div className="transition-content relative mt-4 px-(--margin-x)">
      <Card className="overflow-hidden">
        <div className="table-wrapper min-w-full overflow-x-auto">
          <UiTable hoverable className="w-full text-left rtl:text-right">
            <THead>
              {table.getHeaderGroups().map((headerGroup) => (
                <Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <Th
                      key={header.id}
                      className="dark:bg-dark-700 bg-gray-200 font-semibold uppercase text-gray-800 first:ltr:rounded-tl-lg last:ltr:rounded-tr-lg first:rtl:rounded-tr-lg last:rtl:rounded-tl-lg dark:text-dark-100"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? "flex cursor-pointer select-none items-center gap-2"
                              : ""
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {header.column.getCanSort() && (
                            <TableSortIcon sorted={header.column.getIsSorted()} />
                          )}
                        </div>
                      )}
                    </Th>
                  ))}
                </Tr>
              ))}
            </THead>
            <TBody>
              {rows.length > 0 ? (
                rows.map((row) => (
                  <Tr
                    key={row.id}
                    className="dark:border-b-dark-500 border-y border-transparent border-b-gray-200"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <Td key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </Td>
                    ))}
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td
                    colSpan={columnCount}
                    className="dark:text-dark-300 py-8 text-center text-gray-500"
                  >
                    {emptyMessage}
                  </Td>
                </Tr>
              )}
            </TBody>
          </UiTable>
        </div>
        <div className="dark:border-dark-500 border-t border-gray-200 px-4 py-4 sm:px-5">
          <PaginationSection table={table} />
        </div>
      </Card>
      <SelectedRowsActions table={table} />
    </div>
  );
}

import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import {
  ArrowRightStartOnRectangleIcon,
  EllipsisVerticalIcon,
  PencilSquareIcon,
  PrinterIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { CellContext, Row } from "@tanstack/react-table";
import clsx from "clsx";
import { Fragment } from "react";

import { Button } from "@/components/ui";

export interface MasterTableMeta<T> {
  openEditDrawer?: (row: Row<T>) => void;
  deleteRow?: (row: Row<T>) => void;
  openExitDrawer?: (row: Row<T>) => void;
  printRow?: (row: Row<T>) => void;
  canExit?: (row: T) => boolean;
}

function canMarkExit<T>(row: T, meta?: MasterTableMeta<T>): boolean {
  if (meta?.canExit) return meta.canExit(row);
  return (row as { status?: string }).status === "IN";
}

interface ActionMenuItemProps {
  icon: typeof ArrowRightStartOnRectangleIcon;
  label: string;
  danger?: boolean;
  onClick: () => void;
}

function ActionMenuItem({
  icon: Icon,
  label,
  danger,
  onClick,
}: ActionMenuItemProps) {
  return (
    <MenuItem>
      {({ focus }) => (
        <button
          type="button"
          onClick={onClick}
          className={clsx(
            "flex h-9 w-full items-center gap-2 px-3 text-sm tracking-wide transition-colors outline-none",
            focus &&
              "dark:bg-dark-600 dark:text-dark-100 bg-gray-100 text-gray-800",
            danger && "text-error dark:text-error-light",
          )}
        >
          <Icon className="size-4" />
          <span>{label}</span>
        </button>
      )}
    </MenuItem>
  );
}

function ActionsMenu({
  children,
  exitMenu = false,
}: {
  children: React.ReactNode;
  exitMenu?: boolean;
}) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton
        as={Button}
        isIcon
        variant="flat"
        color={exitMenu ? "primary" : undefined}
        className="size-8 rounded-full p-0"
        aria-label="Open row actions"
        title="Actions"
      >
        <EllipsisVerticalIcon className="size-4.5" />
      </MenuButton>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-150"
        enterFrom="translate-y-1 opacity-0"
        enterTo="translate-y-0 opacity-100"
        leave="transition ease-in duration-100"
        leaveFrom="translate-y-0 opacity-100"
        leaveTo="translate-y-1 opacity-0"
      >
        <MenuItems className="dark:border-dark-500 dark:bg-dark-700 absolute right-0 z-100 mt-1.5 min-w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg shadow-gray-200/50 outline-none focus-visible:outline-none dark:shadow-none">
          {children}
        </MenuItems>
      </Transition>
    </Menu>
  );
}

export function createRowActions<T>(_entityName: string) {
  return function RowActions({ row, table }: CellContext<T, unknown>) {
    const meta = table.options.meta as MasterTableMeta<T> | undefined;
    const showExit = canMarkExit(row.original, meta);

    return (
      <ActionsMenu>
        {showExit && (
          <ActionMenuItem
            icon={ArrowRightStartOnRectangleIcon}
            label="Mark exit"
            onClick={() => meta?.openExitDrawer?.(row)}
          />
        )}
        <ActionMenuItem
          icon={PencilSquareIcon}
          label="Edit entry"
          onClick={() => meta?.openEditDrawer?.(row)}
        />
        <ActionMenuItem
          icon={PrinterIcon}
          label="Print gate pass"
          onClick={() => meta?.printRow?.(row)}
        />
        <div className="dark:border-dark-500 border-gray-150 mx-3 my-1.5 border-t" />
        <ActionMenuItem
          icon={TrashIcon}
          label="Delete entry"
          danger
          onClick={() => meta?.deleteRow?.(row)}
        />
      </ActionsMenu>
    );
  };
}

export function createExitRowActions<T>() {
  return function ExitRowActions({ row, table }: CellContext<T, unknown>) {
    const meta = table.options.meta as MasterTableMeta<T> | undefined;

    if (!canMarkExit(row.original, meta)) {
      return <span className="text-xs text-gray-400">—</span>;
    }

    return (
      <ActionsMenu exitMenu>
        <ActionMenuItem
          icon={ArrowRightStartOnRectangleIcon}
          label="Mark exit"
          onClick={() => meta?.openExitDrawer?.(row)}
        />
      </ActionsMenu>
    );
  };
}
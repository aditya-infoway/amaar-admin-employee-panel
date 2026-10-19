import { Fragment } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";

import {
  Button,
  Table,
  TBody,
  Td,
  Th,
  THead,
  Tr,
} from "@/components/ui";
import { ItemRequestRecord } from "./data";

interface Props {
  open: boolean;
  record: ItemRequestRecord | null;
  onClose: () => void;
}

const thClass =
  "dark:bg-dark-800 dark:text-dark-100 bg-gray-200 text-xs font-semibold text-gray-800 uppercase";

export function ViewItemsModal({ open, record, onClose }: Props) {
  const items = record?.items ?? [];

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-100" onClose={onClose}>
        {/* Backdrop */}
        <TransitionChild
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
        />

        {/* Drawer panel */}
        <TransitionChild
          as={DialogPanel}
          enter="ease-out transform-gpu transition-transform duration-200"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="ease-in transform-gpu transition-transform duration-200"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
          className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full max-w-2xl flex-col bg-white"
        >
          {/* Header */}
          <div className="bg-primary-600 flex items-center justify-between border-b px-5 py-4">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Item Request {record?.requestNo || (record ? `#${record.id}` : "")}
              </h3>
              <p className="text-sm text-white/80">
                Work Order: {record?.workOrderNo || "-"}
              </p>
            </div>

            <Button
              onClick={onClose}
              variant="flat"
              isIcon
              className="size-6 rounded-full text-white"
            >
              <XMarkIcon className="size-4.5" />
            </Button>
          </div>

          {/* Body */}
          <div className="flex grow flex-col overflow-hidden">
            <div className="grow overflow-y-auto px-4 py-5 sm:px-6">
              <div className="dark:border-dark-500 overflow-hidden rounded-lg border border-gray-200">
                <Table hoverable className="w-full text-left">
                  <THead>
                    <Tr>
                      <Th className={thClass}>Item Code</Th>
                      <Th className={thClass}>Item Name</Th>
                      <Th className={thClass}>Order Qty</Th>
                    </Tr>
                  </THead>
                  <TBody>
                    {items.length > 0 ? (
                      items.map((item, idx) => (
                        <Tr
                          key={`${item.itemId ?? idx}-${idx}`}
                          className="dark:border-b-dark-500 border-b border-gray-200"
                        >
                          <Td className="dark:bg-dark-700 bg-white">
                            {item.itemCode || "-"}
                          </Td>
                          <Td className="dark:bg-dark-700 bg-white">
                            {item.itemName || "-"}
                          </Td>
                          <Td className="dark:bg-dark-700 bg-white">
                            {item.qty ?? "-"}
                          </Td>
                        </Tr>
                      ))
                    ) : (
                      <Tr>
                        <Td
                          colSpan={3}
                          className="py-8 text-center text-sm text-gray-500"
                        >
                          No items found.
                        </Td>
                      </Tr>
                    )}
                  </TBody>
                </Table>
              </div>
            </div>

            {/* Footer */}
            <div className="dark:border-dark-500 mt-auto flex items-center justify-between gap-3 border-t border-gray-200 px-4 py-4 sm:px-6">
              <span className="text-sm text-gray-500">
                Total items: {items.length}
              </span>
              <Button type="button" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
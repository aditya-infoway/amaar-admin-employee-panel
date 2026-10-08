import { Fragment, useEffect, useMemo, useState } from "react";

import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  XMarkIcon,
  CheckIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";

import { Button } from "@/components/ui";
import { Get, Post, toasterrormsg, toastsuccessmsg } from "@/ApiHelper";

interface StageItem {
  bomItemId: number;
  itemId: number;
  itemCode: string;
  itemName: string;
  hsnCode: string;
  category: string;
  unit: string;
  quantity: string | number;
}

interface ItemProcessDrawerProps {
  isOpen: boolean;
  close: () => void;
  workOrderStageId: number | null;
  workOrderNo: string;
  onSaved: () => void;
}

export default function ItemProcessDrawer({
  isOpen,
  close,
  workOrderStageId,
  workOrderNo,
  onSaved,
}: ItemProcessDrawerProps) {
  const [items, setItems] = useState<StageItem[]>([]);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [alreadyVerified, setAlreadyVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isOpen || !workOrderStageId) return;

    const fetchItems = async () => {
      try {
        setLoading(true);
        setLoadFailed(false);
        setItems([]);
        setChecked(new Set());
        setAlreadyVerified(false);
        setSearch("");

        const response = await Get(
          "workordertask/stage-items",
          { workOrderStageId },
          false,
        );

        if (response?.data?.success || response?.data?.status === 200) {
          const data = response?.data?.data;
          const list: StageItem[] = data?.items || [];
          const verified = Boolean(data?.itemsVerified);

          setItems(list);
          setAlreadyVerified(verified);
          setChecked(
            verified ? new Set(list.map((i) => i.bomItemId)) : new Set(),
          );
        } else {
          setLoadFailed(true);
          toasterrormsg(response?.data?.message || "Unable to load items.");
        }
      } catch (error: any) {
        console.error("Stage items error:", error);
        setLoadFailed(true);
        toasterrormsg(
          error?.response?.data?.message || "Unable to load items.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [isOpen, workOrderStageId]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.itemCode?.toLowerCase().includes(q) ||
        i.itemName?.toLowerCase().includes(q) ||
        i.category?.toLowerCase().includes(q) ||
        i.hsnCode?.toLowerCase().includes(q),
    );
  }, [items, search]);

  const allChecked = useMemo(
    () => items.length > 0 && items.every((i) => checked.has(i.bomItemId)),
    [items, checked],
  );

  const toggleOne = (id: number) => {
    if (alreadyVerified) return;
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (alreadyVerified) return;
    setChecked(
      allChecked ? new Set() : new Set(items.map((i) => i.bomItemId)),
    );
  };

  const canSave =
    !alreadyVerified &&
    !loading &&
    !loadFailed &&
    !saving &&
    (items.length === 0 || allChecked);

  const handleSave = async () => {
    if (!workOrderStageId) return;

    try {
      setSaving(true);

      const response = await Post(
        "workordertask/verify-items",
        { workOrderStageId, bomItemIds: items.map((i) => i.bomItemId) },
        false,
      );

      if (response?.data?.success || response?.data?.status === 200) {
        toastsuccessmsg(
          response?.data?.message || "Items verified successfully.",
        );
        onSaved();
        close();
      } else {
        toasterrormsg(response?.data?.message || "Failed to save.");
      }
    } catch (error: any) {
      console.error("Verify items error:", error);
      toasterrormsg(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-100" onClose={close}>
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

        <TransitionChild
          as={DialogPanel}
          enter="ease-out transform-gpu transition-transform duration-200"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="ease-in transform-gpu transition-transform duration-200"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
          className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full max-w-4xl flex-col bg-white"
        >
          {/* Header */}
          <div className="bg-primary-600 flex items-center justify-between border-b px-5 py-4">
            <h3 className="text-lg font-semibold text-white">
              Item Process{workOrderNo ? ` - ${workOrderNo}` : ""}
            </h3>

            <Button
              onClick={close}
              variant="flat"
              isIcon
              className="size-6 rounded-full text-white"
            >
              <XMarkIcon className="size-4.5" />
            </Button>
          </div>

          {/* Body */}
          <div className="flex grow flex-col overflow-hidden">
            <div className="flex flex-col gap-4 px-4 py-5 sm:px-6">
              {/* Search + Verify All */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-xs">
                  <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search item code, name, category..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="dark:border-dark-500 dark:bg-dark-600 w-full rounded-lg border border-gray-200 bg-white py-2 pr-3 pl-9 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={toggleAll}
                    disabled={alreadyVerified || items.length === 0}
                    className="text-sm font-medium text-primary-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50 dark:text-primary-400"
                  >
                    {allChecked ? "Unverify All" : "Verify All"}
                  </button>

                  <span className="text-xs text-gray-400">
                    {checked.size} / {items.length} verified
                  </span>
                </div>
              </div>

              {/* Table */}
              <div className="dark:border-dark-500 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="max-h-[min(60vh,520px)] overflow-y-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-dark-600">
                      <tr className="border-b border-gray-200 text-xs tracking-wide text-gray-500 uppercase dark:border-gray-600">
                        <th className="px-4 py-3">Sr. No.</th>
                        <th className="px-4 py-3">Item Code</th>
                        <th className="px-4 py-3">Item Name</th>
                        <th className="px-4 py-3">HSN Code</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Unit</th>
                        <th className="px-4 py-3">Qty</th>
                        <th className="px-4 py-3 text-center">Verify</th>
                      </tr>
                    </thead>

                    <tbody>
                      {loading ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="px-4 py-10 text-center text-gray-400"
                          >
                            Loading...
                          </td>
                        </tr>
                      ) : filteredItems.length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="px-4 py-10 text-center text-gray-400"
                          >
                            {items.length === 0
                              ? "No items found for this stage."
                              : "No items match your search."}
                          </td>
                        </tr>
                      ) : (
                        filteredItems.map((item, index) => {
                          const isChecked = checked.has(item.bomItemId);
                          return (
                            <tr
                              key={item.bomItemId}
                              className="border-b border-gray-100 last:border-0 dark:border-gray-700"
                            >
                              <td className="px-4 py-3">{index + 1}</td>
                              <td className="px-4 py-3 font-medium">
                                {item.itemCode || "-"}
                              </td>
                              <td className="px-4 py-3">
                                {item.itemName || "-"}
                              </td>
                              <td className="px-4 py-3">
                                {item.hsnCode || "-"}
                              </td>
                              <td className="px-4 py-3">
                                {item.category || "-"}
                              </td>
                              <td className="px-4 py-3">
                                {item.unit || "-"}
                              </td>
                              <td className="px-4 py-3">
                                {item.quantity || "-"}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => toggleOne(item.bomItemId)}
                                  disabled={alreadyVerified}
                                  className={`inline-flex size-8 items-center justify-center rounded-full transition-colors ${
                                    isChecked
                                      ? "bg-emerald-500 text-white"
                                      : "bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-dark-500 dark:hover:bg-dark-400"
                                  } disabled:cursor-not-allowed disabled:opacity-60`}
                                  title={
                                    isChecked ? "Verified" : "Mark as verified"
                                  }
                                >
                                  <CheckIcon className="size-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="dark:border-dark-500 mt-auto flex items-center justify-between gap-3 border-t border-gray-200 px-4 py-4 sm:px-6">
              <span className="text-sm text-emerald-500">
                {alreadyVerified ? "Items verified" : ""}
              </span>

              <div className="flex gap-3">
                <Button type="button" onClick={close}>
                  {alreadyVerified ? "Close" : "Cancel"}
                </Button>

                {!alreadyVerified && (
                  <Button
                    type="button"
                    color="primary"
                    onClick={handleSave}
                    disabled={!canSave}
                  >
                    {saving ? "Saving..." : "Save"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
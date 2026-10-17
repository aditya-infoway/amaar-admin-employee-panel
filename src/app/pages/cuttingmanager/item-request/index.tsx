import { useEffect, useMemo, useState } from "react";

import { Combobox } from "@/components/shared/form/StyledCombobox";
import { Page } from "@/components/shared/Page";
import {
  Button,
  Card,
  Input,
  Table,
  TBody,
  Td,
  Th,
  THead,
  Tr,
} from "@/components/ui";

import { CheckCircleIcon, TrashIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/20/solid"; // Added for the plus icon

import { Get, Post, toasterrormsg, toastsuccessmsg } from "@/ApiHelper";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface WorkOrderOption {
  id: number;
  workOrderNo: string;
  model?: number | null;
}

interface ItemOption {
  id: number; // bomItemId — unique per leaf
  itemId: number;
  itemCode: string;
  itemName: string;
  unit?: string;
  bomQty?: number;
}

interface ItemRequestRow {
  id: number;
  bomItemId: number;
  itemId: number;
  itemCode: string;
  itemName: string;
  qty: number;
  unit?: string;
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function ItemRequestPage() {
  /* ---------------- Work Orders ---------------- */

  const [workOrders, setWorkOrders] = useState<WorkOrderOption[]>([]);
  const [workOrderLoading, setWorkOrderLoading] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] =
    useState<WorkOrderOption | null>(null);

  /* ---------------- Items ---------------- */

  const [items, setItems] = useState<ItemOption[]>([]);
  const [itemLoading, setItemLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemOption | null>(null);

  /* ---------------- Item Entry ---------------- */

  const [itemCode, setItemCode] = useState("");
  const [itemName, setItemName] = useState("");
  const [qty, setQty] = useState<number | "">("");

  /* ---------------- Request Rows ---------------- */

  const [rows, setRows] = useState<ItemRequestRow[]>([]);

  /* ---------------- Submit ---------------- */

  const [submitting, setSubmitting] = useState(false);

  /* ================================================================ */
  /* LOAD ASSIGNED WORK ORDERS                                       */
  /* ================================================================ */

  useEffect(() => {
    let mounted = true;

    const loadWorkOrders = async () => {
      try {
        setWorkOrderLoading(true);
        const financialYearId = localStorage.getItem("financialYearId");
        const params: Record<string, any> = { _t: Date.now() };
        if (financialYearId) {
          params.financialYearId = Number(financialYearId);
        }

        const response = await Get(
          "contractor/itemrequest/workorders",
          params,
          false,
        );

        if (!mounted) return;

        if (response?.data?.success || response?.data?.status === 200) {
          const data = Array.isArray(response.data.data)
            ? response.data.data
            : [];
          setWorkOrders(data);
        } else {
          setWorkOrders([]);
          if (response?.data?.message) toasterrormsg(response.data.message);
        }
      } catch (error: any) {
        if (mounted) {
          setWorkOrders([]);
          toasterrormsg(
            error?.response?.data?.message ||
              error?.message ||
              "Failed to load Work Orders",
          );
        }
      } finally {
        if (mounted) {
          setWorkOrderLoading(false);
        }
      }
    };

    loadWorkOrders();
    return () => {
      mounted = false;
    };
  }, []);

  /* ================================================================ */
  /* LOAD BOM ITEMS WHEN WORK ORDER CHANGES                          */
  /* ================================================================ */

  useEffect(() => {
    let mounted = true;
    const workOrderId = selectedWorkOrder?.id;

    if (!workOrderId) {
      setItems([]);
      setSelectedItem(null);
      setItemCode("");
      setItemName("");
      setQty("");
      setItemLoading(false);
      return () => {
        mounted = false;
      };
    }

    const loadItems = async () => {
      try {
        setItemLoading(true);
        setSelectedItem(null);
        setItemCode("");
        setItemName("");
        setQty("");

        const response = await Get(
          "contractor/itemrequest/items-by-workorder",
          { workOrderId: Number(workOrderId), _t: Date.now() },
          false,
        );

        if (!mounted) return;

        if (response?.data?.success || response?.data?.status === 200) {
          const data = Array.isArray(response.data.data)
            ? response.data.data
            : [];
          setItems(data);
        } else {
          setItems([]);
          if (response?.data?.message) toasterrormsg(response.data.message);
        }
      } catch (error: any) {
        if (mounted) {
          setItems([]);
          toasterrormsg(
            error?.response?.data?.message ||
              error?.message ||
              "Failed to load items",
          );
        }
      } finally {
        if (mounted) setItemLoading(false);
      }
    };

    loadItems();
    return () => {
      mounted = false;
    };
  }, [selectedWorkOrder?.id]);

  /* ================================================================ */
  /* HANDLERS                                                         */
  /* ================================================================ */

  const handleWorkOrderChange = (workOrder: WorkOrderOption | null) => {
    setSelectedWorkOrder(workOrder);
    setSelectedItem(null);
    setItemCode("");
    setItemName("");
    setQty("");
  };

  const handleItemChange = (item: ItemOption | null) => {
    setSelectedItem(item);
    setItemCode(item?.itemCode ?? "");
    setItemName(item?.itemName ?? "");
    setQty("");
  };

  const handleAddRow = () => {
    if (!selectedItem || !itemCode || !itemName) {
      toasterrormsg("Please select an item");
      return;
    }

    if (qty === "" || Number(qty) <= 0) {
      toasterrormsg("Please enter a quantity greater than 0");
      return;
    }

    if (!Number.isInteger(Number(qty))) {
      toasterrormsg("Quantity must be a whole number");
      return;
    }

    const maxQty = selectedItem.bomQty ?? 0;
    if (Number(qty) > maxQty) {
      toasterrormsg(`Qty cannot exceed ${maxQty} (BOM quantity)`);
      return;
    }

    if (rows.some((row) => row.bomItemId === selectedItem.id)) {
      toasterrormsg("This item is already added");
      return;
    }

    const newRow: ItemRequestRow = {
      id: Date.now(),
      bomItemId: selectedItem.id,
      itemId: selectedItem.itemId,
      itemCode: itemCode,
      itemName: itemName,
      qty: Number(qty),
      unit: selectedItem.unit,
    };

    setRows((prev) => [...prev, newRow]);

    setSelectedItem(null);
    setItemCode("");
    setItemName("");
    setQty("");
  };

  const handleRemoveRow = (id: number) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleRequestToStoreManager = async () => {
    if (!selectedWorkOrder) {
      toasterrormsg("Please select a Work Order");
      return;
    }
    if (rows.length === 0) {
      toasterrormsg("Please add at least one item");
      return;
    }

    try {
      setSubmitting(true);
      const financialYearId = localStorage.getItem("financialYearId");

      const payload = {
        workOrderId: Number(selectedWorkOrder.id),
        financialYearId: financialYearId ? Number(financialYearId) : null,
        items: rows.map((row) => ({
          itemId: Number(row.itemId),
          itemCode: row.itemCode || null,
          itemName: row.itemName || null,
          qty: Number(row.qty),
          unit: row.unit || null,
        })),
      };

      const response = await Post("contractor/itemrequest", payload, false);

      if (response?.data?.success || response?.data?.status === 200) {
        toastsuccessmsg("Item Request sent to Store Manager successfully");
        setSelectedWorkOrder(null);
        setSelectedItem(null);
        setItemCode("");
        setItemName("");
        setQty("");
        setRows([]);
        setItems([]);
      } else {
        toasterrormsg(response?.data?.message || "Failed to create request");
      }
    } catch (error: any) {
      toasterrormsg(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ================================================================ */
  /* VALIDATION                                                       */
  /* ================================================================ */

  const canAdd = useMemo(
    () =>
      Boolean(
        selectedItem &&
        qty !== "" &&
        Number(qty) > 0 &&
        Number.isInteger(Number(qty)),
      ),
    [selectedItem, qty],
  );

  const canSubmit = Boolean(
    selectedWorkOrder && rows.length > 0 && !submitting,
  );

  /* ================================================================ */
  /* UI                                                               */
  /* ================================================================ */

  return (
    <Page title="Item Request">
      <div className="transition-content w-full px-(--margin-x) pt-4 pb-8">
        <Card className="p-5 sm:p-6">
          <h2 className="dark:text-dark-50 mb-5 text-xl font-medium tracking-wide text-gray-800">
            Item Request – Contractor
          </h2>

          {/* ====================================================== */}
          {/* ROW 1: WORK ORDER + ITEM DROPDOWNS                     */}
          {/* ====================================================== */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Combobox
              data={workOrders}
              displayField="workOrderNo"
              value={selectedWorkOrder}
              onChange={handleWorkOrderChange}
              placeholder={
                workOrderLoading
                  ? "Loading Work Orders..."
                  : "Search Work Order"
              }
              label="Select Work Order"
              searchFields={["workOrderNo"]}
              disabled={workOrderLoading}
            />

            <Combobox
              data={items}
              displayField="itemName"
              value={selectedItem}
              onChange={handleItemChange}
              placeholder={
                !selectedWorkOrder
                  ? "Select Work Order first"
                  : itemLoading
                    ? "Loading Items..."
                    : "Search Item"
              }
              label="Select Item"
              searchFields={["itemName", "itemCode"]}
              disabled={!selectedWorkOrder || itemLoading}
              renderItem={(item: ItemOption) => (
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm">{item.itemName}</span>
                  <span className="text-sm font-semibold dark:text-gray-200">
                    Qty: {item.bomQty ?? 0}
                  </span>
                </div>
              )}
            />
          </div>

          {/* ====================================================== */}
          {/* ROW 2: ITEM ENTRY & ADD BUTTON                         */}
          {/* ====================================================== */}
          <div className="mt-4 grid grid-cols-1 items-end gap-3 sm:grid-cols-12">
            {/* Item Code (Read Only) */}
            <div className="sm:col-span-3">
              <Input
                label="Item Code"
                value={itemCode}
                readOnly
                placeholder="Auto"
              />
            </div>

            {/* Item Name (Read Only) */}
            <div className="sm:col-span-4">
              <Input
                label="Item Name"
                value={itemName}
                readOnly
                placeholder="Auto"
              />
            </div>

            {/* Qty (Editable) */}
            <div className="sm:col-span-3">
              <Input
                label="Qty"
                type="number"
                min={1}
                max={selectedItem?.bomQty ?? undefined}
                step={1}
                value={qty}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    setQty("");
                    return;
                  }
                  const num = Number(value);
                  if (!Number.isFinite(num) || num < 0) return;
                  setQty(num);
                }}
                placeholder="Enter Qty"
              />
            </div>

            {/* Add Button */}
            <div className="sm:col-span-2">
              <Button
                color="primary"
                className="h-10 w-full gap-2 rounded-md"
                disabled={!canAdd}
                onClick={handleAddRow}
              >
                <PlusIcon className="size-5" />
                Add
              </Button>
            </div>
          </div>

          {/* ====================================================== */}
          {/* TABLE                                                  */}
          {/* ====================================================== */}
          <div className="dark:border-dark-500 mt-6 overflow-x-auto rounded-lg border border-gray-200">
            <Table hoverable className="w-full text-left rtl:text-right">
              <THead>
                <Tr>
                  <Th className="dark:bg-dark-800 dark:text-dark-100 bg-gray-200 text-xs font-semibold text-gray-800 uppercase">
                    Item Code
                  </Th>
                  <Th className="dark:bg-dark-800 dark:text-dark-100 bg-gray-200 text-xs font-semibold text-gray-800 uppercase">
                    Item Name
                  </Th>
                  <Th className="dark:bg-dark-800 dark:text-dark-100 bg-gray-200 text-xs font-semibold text-gray-800 uppercase">
                    Qty
                  </Th>
                  <Th className="dark:bg-dark-800 dark:text-dark-100 bg-gray-200 text-xs font-semibold text-gray-800 uppercase">
                    Action
                  </Th>
                </Tr>
              </THead>

              <TBody>
                {rows.length > 0 ? (
                  rows.map((row) => (
                    <Tr
                      key={row.id}
                      className="dark:border-b-dark-500 border-b border-gray-200"
                    >
                      <Td className="dark:bg-dark-700 bg-white">
                        {row.itemCode}
                      </Td>
                      <Td className="dark:bg-dark-700 bg-white">
                        {row.itemName}
                      </Td>
                      <Td className="dark:bg-dark-700 bg-white">{row.qty}</Td>
                      <Td className="dark:bg-dark-700 bg-white">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(row.id)}
                          className="text-error-600 hover:text-error-700"
                        >
                          <TrashIcon className="size-5" />
                        </button>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td
                      colSpan={4}
                      className="py-8 text-center text-sm text-gray-500"
                    >
                      No items added yet.
                    </Td>
                  </Tr>
                )}
              </TBody>
            </Table>
          </div>

          {/* ====================================================== */}
          {/* SUBMIT                                                 */}
          {/* ====================================================== */}
          <div className="mt-6 flex justify-end">
            <Button
              color="primary"
              className="h-10 rounded-md px-6"
              disabled={!canSubmit}
              onClick={handleRequestToStoreManager}
            >
              {submitting ? "Submitting..." : "Request to Store Manager"}
            </Button>
          </div>
        </Card>
      </div>
    </Page>
  );
}

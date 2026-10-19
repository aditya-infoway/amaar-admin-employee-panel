import { useEffect, useState } from "react";

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

import { TrashIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/20/solid";

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

  /* ---------------- Issue Qty (Manual Entry) ---------------- */

  const [issueQty, setIssueQty] = useState<number | "">("");

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
      setIssueQty("");
      setItemLoading(false);
      return () => {
        mounted = false;
      };
    }

    const loadItems = async () => {
      try {
        setItemLoading(true);
        setSelectedItem(null);
        setIssueQty("");

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
    setIssueQty("");
  };

  const handleItemChange = (item: ItemOption | null) => {
    setSelectedItem(item);
    setIssueQty(""); // Reset issue qty when a new item is selected
  };

  const handleAddRow = () => {
    if (!selectedItem) {
      toasterrormsg("Please select an item");
      return;
    }

    if (issueQty === "" || Number(issueQty) <= 0) {
      toasterrormsg("Please enter an Issue Qty greater than 0");
      return;
    }

    if (!Number.isInteger(Number(issueQty))) {
      toasterrormsg("Issue Qty must be a whole number");
      return;
    }

    const maxQty = selectedItem.bomQty ?? 0;
    if (Number(issueQty) > maxQty) {
      toasterrormsg(`Issue Qty cannot exceed BOM quantity (${maxQty})`);
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
      itemCode: selectedItem.itemCode,
      itemName: selectedItem.itemName,
      qty: Number(issueQty), // Add the manually entered issue qty
      unit: selectedItem.unit,
    };

    setRows((prev) => [...prev, newRow]);

    // Reset only the item and qty fields after adding
    setSelectedItem(null);
    setIssueQty("");
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
        setIssueQty("");
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

  const canAdd = Boolean(
    selectedItem &&
    issueQty !== "" &&
    Number(issueQty) > 0 &&
    Number(issueQty) <= (selectedItem.bomQty ?? 0),
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
          {/* ROW: WORK ORDER + ITEM + QTY + ISSUE QTY + ADD         */}
          {/* ====================================================== */}
          <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-12">
            {/* 1. Select Work Order */}
            <div className="sm:col-span-3">
              <Combobox
                data={workOrders}
                displayField="workOrderNo"
                value={selectedWorkOrder}
                onChange={handleWorkOrderChange}
                placeholder={
                  workOrderLoading ? "Loading..." : "Select Work Order"
                }
                label="Select Work Order"
                searchFields={["workOrderNo"]}
                disabled={workOrderLoading}
              />
            </div>

            {/* 2. Select Item */}
            <div className="sm:col-span-4">
              <Combobox
                data={items}
                displayField="itemName"
                value={selectedItem}
                onChange={handleItemChange}
                placeholder={
                  !selectedWorkOrder
                    ? "Select Work Order first"
                    : itemLoading
                      ? "Loading..."
                      : "Select Item"
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

            {/* 3. Qty (Auto-filled Read-only) */}
            <div className="sm:col-span-2">
              <Input
                label="Qty"
                value={selectedItem?.bomQty ?? ""}
                readOnly
                placeholder="Auto"
              />
            </div>

            {/* 4. Issue Qty (Manual Entry) */}
            <div className="sm:col-span-2">
              <Input
                label="Issue Qty"
                type="number"
                min={1}
                max={selectedItem?.bomQty ?? undefined}
                step={1}
                value={issueQty}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    setIssueQty("");
                    return;
                  }
                  const num = Number(value);
                  if (!Number.isFinite(num) || num < 0) return;
                  setIssueQty(num);
                }}
                placeholder="Enter Qty"
              />
            </div>

            {/* 5. Add Button */}
            <div className="sm:col-span-1">
              <Button
                color="primary"
                className="h-10 w-full gap-2 rounded-md"
                disabled={!canAdd}
                onClick={handleAddRow}
                title="Add Item"
              >
                <PlusIcon className="size-5" />
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
                    Issue Qty
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

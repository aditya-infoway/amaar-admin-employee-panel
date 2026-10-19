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

import { ArrowLeftIcon, TrashIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/20/solid";
import { useNavigate } from "react-router";
import { Get, Post, toasterrormsg, toastsuccessmsg } from "@/ApiHelper";
import { DatePicker } from "@/components/shared/form/Datepicker";
/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type RequestType = "Issue" | "Return";

interface WorkOrderOption {
  id: number;
  workOrderNo: string;
  model?: number | string | null;
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

const REQUEST_TYPES: RequestType[] = ["Issue", "Return"];
const TYPE_LABEL: Record<RequestType, string> = {
  Issue: "Order",
  Return: "Return",
};
// Local date (YYYY-MM-DD) — toISOString use nahi kiya taaki timezone se date na khiske
const getToday = () => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
};
const formatDateForApi = (date: Date) => {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${mm}-${dd}`;
};
/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function AddItemRequestPage() {
  const navigate = useNavigate();

  /* ---------------- Request Type ---------------- */
  const [requestType, setRequestType] = useState<RequestType>("Issue");

  /* ---------------- Issue ID / Issue Date ---------------- */
  const [issueDate, setIssueDate] = useState<string>(getToday());

  /* ---------------- Work Orders ---------------- */
  const [issueQtyError, setIssueQtyError] = useState("");
  const [workOrders, setWorkOrders] = useState<WorkOrderOption[]>([]);
  const [workOrderLoading, setWorkOrderLoading] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] =
    useState<WorkOrderOption | null>(null);
  const [issueNo, setIssueNo] = useState("");
  /* ---------------- Items ---------------- */
  const [items, setItems] = useState<ItemOption[]>([]);
  const [itemLoading, setItemLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemOption | null>(null);

  /* ---------------- Qty (Manual Entry) ---------------- */
  const [issueQty, setIssueQty] = useState<number | "">("");

  /* ---------------- Request Rows ---------------- */
  const [rows, setRows] = useState<ItemRequestRow[]>([]);

  /* ---------------- Submit ---------------- */
  const [submitting, setSubmitting] = useState(false);

  const qtyLabel = requestType === "Return" ? "Return Qty" : "Order Qty";

  /* ================================================================ */
  /* LOAD ASSIGNED WORK ORDERS (only my assigned tasks)               */
  /* ================================================================ */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const financialYearId = localStorage.getItem("financialYearId");
        const res = await Get(
          "paint/itemrequest/next-issue-no",
          { financialYearId, requestType },
          false,
        );
        if (!mounted) return;
        if (res?.data?.success) {
          setIssueNo(res.data.data?.issueNo || "");
        } else {
          toasterrormsg(res?.data?.message || "Failed to generate Order  ID.");
        }
      } catch (err: any) {
        if (mounted) {
          toasterrormsg(
            err?.response?.data?.message || "Failed to generate Order  ID.",
          );
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [requestType]);
  useEffect(() => {
    let mounted = true;

    const loadWorkOrders = async () => {
      try {
        setWorkOrderLoading(true);

        // Assigned work orders — same source as Pending Work Order page.
        // Agar sirf pending wale chahiye to { status: "Pending" } pass karo.
        const response = await Get("workordertask/my-tasks", {}, false);

        if (!mounted) return;

        if (response?.data?.success || response?.data?.status === 200) {
          const list: any[] = Array.isArray(response.data.data)
            ? response.data.data
            : [];

          // Ek work order ke multiple stages ho sakte hain -> unique workOrderId
          const map = new Map<number, WorkOrderOption>();
          list.forEach((task) => {
            const id = Number(task.workOrderId);
            if (!id || map.has(id)) return;
            map.set(id, {
              id,
              workOrderNo: task.workOrderNo,
              model: task.modelName || task.model || null,
            });
          });

          setWorkOrders(Array.from(map.values()));
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
          "paint/itemrequest/items-by-workorder",
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

  const handleRequestTypeChange = (type: RequestType) => {
    if (type === requestType) return;
    setRequestType(type);
    // Issue aur Return rows mix na ho, isliye reset
    setRows([]);
    setSelectedItem(null);
    setIssueQty("");
    setIssueQtyError("");
  };

  const handleWorkOrderChange = (workOrder: WorkOrderOption | null) => {
    setSelectedWorkOrder(workOrder);
    setSelectedItem(null);
    setIssueQty("");
    setIssueQtyError("");
    setRows([]);
  };

  const validateIssueQty = (value: number | "", item: ItemOption | null) => {
    if (value === "" || !item) return "";
    const max = item.bomQty ?? 0;
    if (Number(value) <= 0) return `${qtyLabel} must be greater than 0`;
    if (!Number.isInteger(Number(value)))
      return `${qtyLabel} must be a whole number`;
    if (Number(value) > max) return `${qtyLabel} cannot exceed Qty (${max})`;
    return "";
  };

  const handleItemChange = (item: ItemOption | null) => {
    setSelectedItem(item);
    setIssueQty("");
    setIssueQtyError("");
  };

  const handleAddRow = () => {
    if (!selectedItem) {
      toasterrormsg("Please select an item");
      return;
    }

    if (issueQty === "" || Number(issueQty) <= 0) {
      toasterrormsg(`Please enter a ${qtyLabel} greater than 0`);
      return;
    }

    if (!Number.isInteger(Number(issueQty))) {
      toasterrormsg(`${qtyLabel} must be a whole number`);
      return;
    }

    const maxQty = selectedItem.bomQty ?? 0;
    if (Number(issueQty) > maxQty) {
      toasterrormsg(`${qtyLabel} cannot exceed BOM quantity (${maxQty})`);
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
      qty: Number(issueQty),
      unit: selectedItem.unit,
    };

    setRows((prev) => [...prev, newRow]);

    // Reset only the item and qty fields after adding
    setSelectedItem(null);
    setIssueQty("");
    setIssueQtyError("");
  };

  const handleRemoveRow = (id: number) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleRequestToStoreManager = async () => {
    if (!selectedWorkOrder) {
      toasterrormsg("Please select a Work Order");
      return;
    }
    if (requestType === "Issue" && !issueDate) {
      toasterrormsg("Please select Order  Date");
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
        requestType, // "Issue" | "Return"
        issueDate: requestType === "Issue" ? issueDate : null,
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

      const response = await Post("paint/itemrequest", payload, false);

      if (response?.data?.success || response?.data?.status === 200) {
        toastsuccessmsg(
          requestType === "Return"
            ? "Item Return request sent to Store Manager successfully"
            : "Item Request sent to Store Manager successfully",
        );
        navigate("/item-request/itemrequestpage");
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
    Number(issueQty) <= (selectedItem.bomQty ?? 0) &&
    !issueQtyError,
  );

  const canSubmit = Boolean(
    selectedWorkOrder &&
    rows.length > 0 &&
    !submitting &&
    (requestType !== "Issue" || issueDate),
  );

  /* ================================================================ */
  /* UI                                                               */
  /* ================================================================ */

  return (
    <Page title="Item Request">
      <div className="transition-content w-full px-(--margin-x) pt-4 pb-8">
        <Card className="p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="dark:text-dark-50 text-xl font-medium tracking-wide text-gray-800">
              Item Request
            </h2>

            <Button
              type="button"
              onClick={() => navigate("/item-request/itemrequestpage")}
              className="bg-primary-500 hover:bg-primary-600 flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors"
            >
              <ArrowLeftIcon className="size-4" />
              Back
            </Button>
          </div>

          {/* ====================================================== */}
          {/* REQUEST TYPE: ISSUE / RETURN                           */}
          {/* ====================================================== */}
          <div className="mb-5 flex items-center gap-6">
            {REQUEST_TYPES.map((type) => (
              <label
                key={type}
                className="dark:text-dark-100 flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700"
              >
                <input
                  type="radio"
                  name="requestType"
                  value={type}
                  checked={requestType === type}
                  onChange={() => handleRequestTypeChange(type)}
                  className="accent-primary-600 size-4 cursor-pointer"
                />
                             {TYPE_LABEL[type]}
              </label>
            ))}
          </div>

          {/* ====================================================== */}
          {/* ISSUE ID + ISSUE DATE (only for Issue)                 */}
          {/* ====================================================== */}
          {requestType === "Issue" && (
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-12">
              <div className="sm:col-span-3">
                {/* <Input
                  label="Issue ID"
                  value=""
                  readOnly
                  placeholder="Auto"
                /> */}
                <Input
                  label="Order  ID"
                  value={issueNo}
                  readOnly
                  placeholder="Auto"
                />
              </div>

              <div className="sm:col-span-3">
                <DatePicker
                  label="Order  Date"
                  value={issueDate}
                  onChange={(selectedDates: Date[]) => {
                    const picked = selectedDates?.[0];
                    setIssueDate(picked ? formatDateForApi(picked) : "");
                  }}
                  placeholder="Select Date"
                />
              </div>
            </div>
          )}

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

            {/* 4. Issue / Return Qty (Manual Entry) */}
            <div className="sm:col-span-2">
              <Input
                label={qtyLabel}
                type="number"
                min={1}
                max={selectedItem?.bomQty ?? undefined}
                step={1}
                value={issueQty}
                error={issueQtyError}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    setIssueQty("");
                    setIssueQtyError("");
                    return;
                  }
                  const num = Number(value);
                  if (!Number.isFinite(num) || num < 0) return;
                  setIssueQty(num);
                  setIssueQtyError(validateIssueQty(num, selectedItem));
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
                    {qtyLabel}
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

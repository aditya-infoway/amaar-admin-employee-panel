import { useEffect, useState, useMemo } from "react";
import { ChevronLeftIcon, CheckIcon } from "@heroicons/react/20/solid";
import { Link, useParams, useNavigate } from "react-router";
import { Page } from "@/components/shared/Page";
import { Button, Input, Radio } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Get, Post, toasterrormsg, toastsuccessmsg } from "@/ApiHelper";

// Interfaces
interface ItemRow {
  id: number;
  itemId: number;
  itemCode: string;
  itemName: string;
  hsnCode: string;
  unit: string;
  itemLocation: string;
  itemCategory: string;
  orderQty: number;
  issuedQty: number;
  availableQty: number;
}

interface StagedItem extends ItemRow {
  issueQty: number;
}

interface ItemRequestDetail {
  itemRequestId: number;
  workOrderId: number | null;
  workOrderNo: string;
  modelName: string;
  contractorName: string;
  contractorNumber: string;
  status: string;
  items: ItemRow[];
}

export default function ItemRequestDetailPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<ItemRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form States
  const [actionType, setActionType] = useState<"issue" | "return">("issue");
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<string>("");
  const [selectedRequest, setSelectedRequest] = useState<string>("");
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [issueQtyInput, setIssueQtyInput] = useState<number | "">("");

  // Staged Items Table
  const [stagedItems, setStagedItems] = useState<StagedItem[]>([]);

  const [issueId] = useState(() => {
    return `ISS-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`;
  });
  const todayDate = new Date().toISOString().split("T")[0];

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!itemId) return;

      try {
        setLoading(true);
        const res = await Get(`storemanager/itemRequest/${itemId}`, {}, false);

        if (!isMounted) return;

        if (res.data?.success) {
          setData(res.data.data);
          if (res.data.data?.workOrderNo)
            setSelectedWorkOrder(res.data.data.workOrderNo);
          if (res.data.data?.itemRequestId)
            setSelectedRequest(String(res.data.data.itemRequestId));
        } else {
          toasterrormsg(res.data?.message || "Failed to load item request.");
        }
      } catch (err: any) {
        if (!isMounted) return;
        toasterrormsg(err?.response?.data?.message || "Something went wrong.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [itemId]);

  const selectedItemDetails = useMemo(() => {
    if (!selectedItemId || !data?.items) return null;
    return data.items.find((item) => item.itemId === selectedItemId) || null;
  }, [selectedItemId, data]);

  const handleStageItem = () => {
    if (!selectedItemDetails) return;
    if (!issueQtyInput || Number(issueQtyInput) <= 0) {
      toasterrormsg("Please enter a valid Issue Qty");
      return;
    }
    if (Number(issueQtyInput) > selectedItemDetails.availableQty) {
      toasterrormsg(
        `Issue Qty cannot exceed available stock (${selectedItemDetails.availableQty})`,
      );
      return;
    }

    if (stagedItems.some((i) => i.itemId === selectedItemDetails.itemId)) {
      toasterrormsg("Item is already staged");
      return;
    }

    setStagedItems((prev) => [
      ...prev,
      { ...selectedItemDetails, issueQty: Number(issueQtyInput) },
    ]);

    setSelectedItemId(null);
    setIssueQtyInput("");
  };

  const handleRemoveStaged = (itemId: number) => {
    setStagedItems((prev) => prev.filter((i) => i.itemId !== itemId));
  };

  const handleSaveAll = async () => {
    if (stagedItems.length === 0) {
      toasterrormsg("No items staged for issue.");
      return;
    }

    setSaving(true);
    try {
      let successCount = 0;
      const failedItems: string[] = [];

      for (const row of stagedItems) {
        try {
          const res = await Post(
            "storemanager/itemRequest/issue",
            { itemRequestDetailId: row.id, qty: row.issueQty },
            false,
          );
          if (res.data?.success) {
            successCount += 1;
          } else {
            failedItems.push(row.itemName);
          }
        } catch {
          failedItems.push(row.itemName);
        }
      }

      if (successCount > 0) {
        toastsuccessmsg(`${successCount} item(s) issued successfully`);
      }
      if (failedItems.length) {
        toasterrormsg(`Failed to issue: ${failedItems.join(", ")}`);
      }

      setStagedItems([]);

      if (successCount > 0) {
        navigate("/item-request-register");
      }
    } finally {
      setSaving(false);
    }
  };

  const workOrderOptions = data?.workOrderNo
    ? [{ id: data.workOrderNo, label: data.workOrderNo }]
    : [];
  const requestOptions = data?.itemRequestId
    ? [{ id: String(data.itemRequestId), label: `REQ-${data.itemRequestId}` }]
    : [];
  const itemOptions =
    data?.items?.map((i) => ({
      id: i.itemId,
      label: `${i.itemCode} - ${i.itemName}`,
    })) || [];

  return (
    <Page title="Item Request Detail">
      <div className="transition-content w-full pb-5">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 lg:px-6 lg:py-6">
          <h2 className="text-primary dark:text-dark-50 text-xl font-bold tracking-wide">
            Issue / Return Entry
          </h2>
          <Link to="/item-request-register">
            <Button color="primary" variant="outlined" className="gap-1">
              <ChevronLeftIcon className="size-5" /> Back
            </Button>
          </Link>
        </div>

        {/* MAIN CONTAINER */}
        <div className="dark:border-dark-600 dark:bg-dark-800 mx-5 mb-6 rounded-xl border border-gray-200 bg-white p-5 lg:mx-6">
          <div className="mb-4 flex gap-4">
            <label className="flex cursor-pointer items-center gap-2">
              <Radio
                name="actionType"
                checked={actionType === "issue"}
                onChange={() => setActionType("issue")}
              />
              <span className="text-sm font-medium">Issue</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <Radio
                name="actionType"
                checked={actionType === "return"}
                onChange={() => setActionType("return")}
              />
              <span className="text-sm font-medium">Return</span>
            </label>
          </div>

          {/* 🔴 ROW 1: 4 Columns */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Listbox
                data={[
                  { id: "", label: "Select Work Order" },
                  ...workOrderOptions,
                ]}
                value={
                  workOrderOptions.find((o) => o.id === selectedWorkOrder) || {
                    id: "",
                    label: "Select Work Order",
                  }
                }
                onChange={(item) => setSelectedWorkOrder(item.id)}
                label="Select Work Order"
                displayField="label"
              />
            </div>

            <div>
              <Listbox
                data={[{ id: "", label: "Order Request" }, ...requestOptions]}
                value={
                  requestOptions.find((o) => o.id === selectedRequest) || {
                    id: "",
                    label: "Order Request",
                  }
                }
                onChange={(item) => setSelectedRequest(item.id)}
                label="Order Request"
                displayField="label"
              />
            </div>

            <div>
              <label className="dark:text-dark-300 mb-1 block text-sm font-medium text-gray-700">
                Issue ID
              </label>
              <Input
                value={issueId}
                disabled
                className="dark:bg-dark-700 bg-gray-50"
              />
            </div>

            <div>
              <label className="dark:text-dark-300 mb-1 block text-sm font-medium text-gray-700">
                Issue Date
              </label>
              <Input
                type="date"
                value={todayDate}
                disabled
                className="dark:bg-dark-700 bg-gray-50"
              />
            </div>
          </div>

          {/* 🔴 ROW 2: 3 Columns (Select Item, Item Code, Item Name) */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="md:col-span-1">
              <Listbox
                data={[{ id: "", label: "Select Item" }, ...itemOptions]}
                value={
                  itemOptions.find((o) => o.id === selectedItemId) || {
                    id: "",
                    label: "Select Item",
                  }
                }
                onChange={(item) => setSelectedItemId(Number(item.id) || null)}
                label="Select Item"
                displayField="label"
              />
            </div>

            <div className="md:col-span-1">
              <label className="text-xs text-gray-500">Item Code</label>
              <Input value={selectedItemDetails?.itemCode || ""} disabled />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-gray-500">Item Name</label>
              <Input value={selectedItemDetails?.itemName || ""} disabled />
            </div>
          </div>

          <hr className="dark:border-dark-600 my-6 border-gray-200" />

          {/* 🔴 ROW 3: 6 Columns + Check Button */}
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-[100px] flex-1">
              <label className="text-xs text-gray-500">HSN Code</label>
              <Input value={selectedItemDetails?.hsnCode || ""} disabled />
            </div>
            <div className="min-w-[80px] flex-1">
              <label className="text-xs text-gray-500">Unit</label>
              <Input value={selectedItemDetails?.unit || ""} disabled />
            </div>
            <div className="min-w-[120px] flex-1">
              <label className="text-xs text-gray-500">Item Location</label>
              <Input value={selectedItemDetails?.itemLocation || ""} disabled />
            </div>
            <div className="min-w-[120px] flex-1">
              <label className="text-xs text-gray-500">Item Category</label>
              <Input value={selectedItemDetails?.itemCategory || ""} disabled />
            </div>
            <div className="min-w-[90px] flex-1">
              <label className="text-xs text-gray-500">Order Qty</label>
              <Input value={selectedItemDetails?.orderQty || ""} disabled />
            </div>
            <div className="min-w-[90px] flex-1">
              <label className="text-primary-600 text-xs font-semibold text-gray-500">
                Issue Qty
              </label>
              <Input
                type="number"
                min={1}
                max={selectedItemDetails?.availableQty}
                value={issueQtyInput}
                onChange={(e) =>
                  setIssueQtyInput(e.target.value ? Number(e.target.value) : "")
                }
                disabled={!selectedItemDetails}
                className="border-primary-500"
              />
            </div>

            <div className="pb-0.5">
              <Button
                color="primary"
                onClick={handleStageItem}
                disabled={!selectedItemDetails || !issueQtyInput}
                className="flex h-10 w-10 items-center justify-center rounded-md p-2.5"
                title="Confirm Item"
              >
                <CheckIcon className="size-5" />
              </Button>
            </div>
          </div>

          {/* --- BOTTOM STAGED ITEMS SECTION --- */}
          <div className="dark:border-dark-600 mt-8 border-t border-gray-200 pt-6">
            <h3 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200">
              Staged Items
            </h3>

            <div className="overflow-x-auto">
              <table className="dark:divide-dark-600 min-w-full divide-y divide-gray-200">
                <thead className="dark:bg-dark-700 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                      Item Code
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                      Item Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                      HSN Code
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                      Unit
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="dark:divide-dark-600 dark:bg-dark-800 divide-y divide-gray-200 bg-white">
                  {stagedItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        No items staged yet. Select an item above and confirm.
                      </td>
                    </tr>
                  ) : (
                    stagedItems.map((row) => (
                      <tr key={row.itemId}>
                        <td className="px-4 py-3 text-sm">{row.itemCode}</td>
                        <td className="px-4 py-3 text-sm">{row.itemName}</td>
                        <td className="px-4 py-3 text-sm">
                          {row.hsnCode || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm">{row.unit}</td>
                        <td className="px-4 py-3 text-sm">
                          {row.itemLocation || "—"}
                        </td>
                        <td className="text-primary-600 px-4 py-3 text-sm font-bold">
                          {row.issueQty}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleRemoveStaged(row.itemId)}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {stagedItems.length > 0 && (
              <div className="mt-6 flex justify-end">
                <Button
                  color="primary"
                  onClick={handleSaveAll}
                  disabled={saving}
                  className="px-8"
                >
                  {saving ? "Saving..." : "Save All Issued Items"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Page>
  );
}

import { useEffect, useState, useMemo } from "react";
import { ChevronLeftIcon, CheckIcon } from "@heroicons/react/20/solid";
import { TrashIcon } from "@heroicons/react/24/outline";
import { Link, useParams, useNavigate } from "react-router";
import { Page } from "@/components/shared/Page";
import { Button, Input, Radio } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Get, Post, toasterrormsg, toastsuccessmsg } from "@/ApiHelper";
import { DatePicker } from "@/components/shared/form/Datepicker";
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

interface OpenRequest {
  itemRequestId: number;
  requestNo: string;
  requestType: "Issue" | "Return";
  issueDate?: string | null;
  workOrderId: number;
  workOrderNo: string;
  requesterName: string;
  panel: string;
}

interface ItemRequestDetail {
  itemRequestId: number;
  requestNo?: string;
  requestType?: string;
  issueDate?: string | null;
  workOrderNo: string;
  items: ItemRow[];
}

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

export default function ItemRequestDetailPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();

  const [openRequests, setOpenRequests] = useState<OpenRequest[]>([]);
  const [detail, setDetail] = useState<ItemRequestDetail | null>(null);
  const [saving, setSaving] = useState(false);

  const [actionType, setActionType] = useState<"issue" | "return">("issue");
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string>("");
  const [selectedRequestId, setSelectedRequestId] = useState<string>("");
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [issueQtyInput, setIssueQtyInput] = useState<number | "">("");
  const [issueQtyError, setIssueQtyError] = useState("");
  const [stagedItems, setStagedItems] = useState<StagedItem[]>([]);

  // Store Manager ka Issue ID / Date
  const [issueNo, setIssueNo] = useState("");
  const todayDate = getToday();
  const [issueDate, setIssueDate] = useState<string>(getToday());
   const fetchNextIssueNo = async (
    type: "issue" | "return" = actionType,
  ): Promise<string> => {
    const financialYearId = localStorage.getItem("financialYearId");
    const res = await Get(
      "storemanager/itemrequest/next-issue-no",
      { financialYearId, requestType: type === "return" ? "Return" : "Issue" },
      false,
    );
    if (res?.data?.success) return res.data.data?.issueNo || "";
    throw new Error(res?.data?.message || "Failed to generate ID.");
  };

  useEffect(() => {
    fetchNextIssueNo(actionType)
      .then(setIssueNo)
      .catch((e) => toasterrormsg(e?.response?.data?.message || e.message));
  }, [actionType]);

  /* ---------- open requests load ---------- */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await Get("storemanager/itemrequest/open", {}, false);
        if (!mounted) return;
        if (res.data?.success) {
          const list: OpenRequest[] = res.data.data || [];
          setOpenRequests(list);

          if (itemId) {
            const found = list.find((r) => String(r.itemRequestId) === itemId);
            if (found) {
              setActionType(
                found.requestType === "Return" ? "return" : "issue",
              );
              setSelectedWorkOrderId(String(found.workOrderId));
              setSelectedRequestId(String(found.itemRequestId));
            }
          }
        } else {
          toasterrormsg(res.data?.message || "Failed to load requests.");
        }
      } catch (err: any) {
        if (mounted)
          toasterrormsg(
            err?.response?.data?.message || "Something went wrong.",
          );
      }
    })();
    return () => {
      mounted = false;
    };
  }, [itemId]);

  /* ---------- selected request ka detail (items) ---------- */
  useEffect(() => {
    let mounted = true;
    setDetail(null);
    setSelectedItemId(null);
    setIssueQtyInput("");

    if (!selectedRequestId) return;

    (async () => {
      try {
        const res = await Get(
          `storemanager/itemrequest/${selectedRequestId}`,
          {},
          false,
        );
        if (!mounted) return;
        if (res.data?.success) setDetail(res.data.data);
        else toasterrormsg(res.data?.message || "Failed to load items.");
      } catch (err: any) {
        if (mounted)
          toasterrormsg(
            err?.response?.data?.message || "Something went wrong.",
          );
      }
    })();

    return () => {
      mounted = false;
    };
  }, [selectedRequestId]);

  /* ---------- dropdown options ---------- */
  const typeRequests = useMemo(
    () =>
      openRequests.filter((r) =>
        actionType === "return"
          ? r.requestType === "Return"
          : r.requestType !== "Return",
      ),
    [openRequests, actionType],
  );

  const workOrderOptions = useMemo(() => {
    const map = new Map<number, string>();
    typeRequests.forEach((r) => {
      if (!map.has(r.workOrderId)) map.set(r.workOrderId, r.workOrderNo);
    });
    return Array.from(map, ([id, label]) => ({ id: String(id), label }));
  }, [typeRequests]);

  const requestOptions = useMemo(
    () =>
      typeRequests
        .filter((r) => String(r.workOrderId) === selectedWorkOrderId)
        .map((r) => ({
          id: String(r.itemRequestId),
          label: `${r.requestNo} | ${r.requesterName || "-"} | ${r.panel}`,
        })),
    [typeRequests, selectedWorkOrderId],
  );

  const itemOptions = useMemo(
    () =>
      detail?.items?.map((i) => ({
        id: i.itemId,
        label: `${i.itemCode} - ${i.itemName}`,
      })) || [],
    [detail],
  );

  const selectedItemDetails = useMemo(() => {
    if (!selectedItemId || !detail?.items) return null;
    return detail.items.find((i) => i.itemId === selectedItemId) || null;
  }, [selectedItemId, detail]);

  /* ---------- handlers ---------- */
  const resetSelection = () => {
    setSelectedWorkOrderId("");
    setSelectedRequestId("");
    setSelectedItemId(null);
    setIssueQtyInput("");
    setStagedItems([]);
  };

  const handleActionChange = (type: "issue" | "return") => {
    if (type === actionType) return;
    setActionType(type);
    resetSelection();
  };

  const handleWorkOrderChange = (id: string) => {
    setSelectedWorkOrderId(id);
    setSelectedRequestId("");
    setStagedItems([]);
  };

  const handleRequestChange = (id: string) => {
    setSelectedRequestId(id);
    setStagedItems([]);
  };
  const validateQty = (value: number | "", item: ItemRow | null) => {
    if (value === "" || !item) return "";
    const qty = Number(value);
    const remaining = item.orderQty - item.issuedQty;
    const label = actionType === "return" ? "Return Qty" : "Issue Qty";

    if (qty <= 0) return `${label} must be greater than 0`;
    if (!Number.isInteger(qty)) return `${label} must be a whole number`;
    if (qty > remaining)
      return `${label} cannot exceed remaining order qty (${remaining})`;
    if (actionType === "issue" && qty > item.availableQty)
      return `${label} cannot exceed available stock (${item.availableQty})`;
    return "";
  };
  const handleStageItem = () => {
    if (!selectedItemDetails) return;
    if (!issueQtyInput || Number(issueQtyInput) <= 0) {
      toasterrormsg("Please enter a valid Issue Qty");
      return;
    }
    const remaining =
      selectedItemDetails.orderQty - selectedItemDetails.issuedQty;
    if (Number(issueQtyInput) > remaining) {
      toasterrormsg(
        `Issue Qty cannot exceed remaining order qty (${remaining})`,
      );
      return;
    }
    if (
      actionType === "issue" &&
      Number(issueQtyInput) > selectedItemDetails.availableQty
    ) {
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
    setIssueQtyError("");
  };

  const handleRemoveStaged = (id: number) =>
    setStagedItems((prev) => prev.filter((i) => i.itemId !== id));

  const handleSaveAll = async () => {
    if (stagedItems.length === 0) {
      toasterrormsg("No items staged.");
      return;
    }

    setSaving(true);
    try {
      // save ke waqt fresh Issue ID, sab rows ko same jayega
      const freshIssueNo = await fetchNextIssueNo();
      const financialYearId = localStorage.getItem("financialYearId");

      let successCount = 0;
      const failedItems: string[] = [];

      for (const row of stagedItems) {
        try {
          const res = await Post(
            "storemanager/itemrequest/issue",
            {
              itemRequestDetailId: row.id,
              qty: row.issueQty,
              issueNo: freshIssueNo,
              issueDate: issueDate,
              financialYearId: financialYearId ? Number(financialYearId) : null,
            },
            false,
          );
          if (res.data?.success) successCount += 1;
          else failedItems.push(row.itemName);
        } catch {
          failedItems.push(row.itemName);
        }
      }

      if (successCount > 0)
        toastsuccessmsg(`${successCount} item(s) issued successfully`);
      if (failedItems.length)
        toasterrormsg(`Failed to issue: ${failedItems.join(", ")}`);

      setStagedItems([]);
      if (successCount > 0) navigate("/item-request-register");
    } catch (e: any) {
      toasterrormsg(
        e?.response?.data?.message || e?.message || "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  };

  const pick = (
    opts: { id: any; label: string }[],
    id: any,
    placeholder: string,
  ) => opts.find((o) => o.id === id) || { id: "", label: placeholder };

  const labelCls =
    "dark:text-dark-300 mb-1 block text-sm font-medium text-gray-700";

  return (
    <Page title="Item Request Detail">
      <div className="transition-content w-full pb-5">
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

        <div className="dark:border-dark-600 dark:bg-dark-800 mx-5 mb-6 rounded-xl border border-gray-200 bg-white p-5 lg:mx-6">
          <div className="mb-4 flex gap-4">
            <label className="flex cursor-pointer items-center gap-2">
              <Radio
                name="actionType"
                checked={actionType === "issue"}
                onChange={() => handleActionChange("issue")}
              />
              <span className="text-sm font-medium">Issue</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <Radio
                name="actionType"
                checked={actionType === "return"}
                onChange={() => handleActionChange("return")}
              />
              <span className="text-sm font-medium">Return</span>
            </label>
          </div>

          {/* ROW 1: Work Order + Order Request */}

          {/* ROW 1b: Order ID / Order Date / Issue ID / Issue Date */}
          {/* ROW 1: Work Order + Order Request + Issue ID + Issue Date */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Listbox
              data={[
                { id: "", label: "Select Work Order" },
                ...workOrderOptions,
              ]}
              value={pick(
                workOrderOptions,
                selectedWorkOrderId,
                "Select Work Order",
              )}
              onChange={(item) => handleWorkOrderChange(item.id)}
              label="Select Work Order"
              displayField="label"
            />

            <Listbox
              data={[{ id: "", label: "Order Request" }, ...requestOptions]}
              value={pick(requestOptions, selectedRequestId, "Order Request")}
              onChange={(item) => handleRequestChange(item.id)}
              label="Order Request"
              displayField="label"
              disabled={!selectedWorkOrderId}
            />

            <div>
              <label className={labelCls}>
                {actionType === "return" ? "Return ID" : "Issue ID"}
              </label>
              <Input
                value={issueNo}
                placeholder="Auto"
                disabled
                className="dark:bg-dark-700 bg-gray-50"
              />
            </div>

            <div>
              <DatePicker
                label={actionType === "return" ? "Return Date" : "Issue Date"}
                value={issueDate}
                onChange={(selectedDates: Date[]) => {
                  const picked = selectedDates?.[0];
                  setIssueDate(picked ? formatDateForApi(picked) : "");
                }}
                placeholder="Select Date"
              />
            </div>
          </div>

          {/* ROW 2 */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="md:col-span-1">
              <Listbox
                data={[{ id: "", label: "Select Item" }, ...itemOptions]}
                value={pick(itemOptions, selectedItemId, "Select Item")}
                onChange={(item) => {
                  setSelectedItemId(Number(item.id) || null);
                  setIssueQtyInput("");
                  setIssueQtyError("");
                }}
                label="Select Item"
                displayField="label"
                disabled={!selectedRequestId}
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

          {/* ROW 3 */}
          {/* ROW 3 */}
          <div className="flex flex-wrap items-start gap-4 pb-6">
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
              <Input value={selectedItemDetails?.orderQty ?? ""} disabled />
            </div>

            {/* Issue Qty: error absolute, taaki row height na badhe */}
            <div className="relative min-w-[90px] flex-1">
              <label className="text-primary-600 text-xs font-semibold">
                {actionType === "return" ? "Return Qty" : "Issue Qty"}
              </label>
              <Input
                type="number"
                min={1}
                value={issueQtyInput}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    setIssueQtyInput("");
                    setIssueQtyError("");
                    return;
                  }
                  const num = Number(value);
                  if (!Number.isFinite(num) || num < 0) return;
                  setIssueQtyInput(num);
                  setIssueQtyError(validateQty(num, selectedItemDetails));
                }}
                disabled={!selectedItemDetails}
                className={
                  issueQtyError ? "border-error-500" : "border-primary-500"
                }
              />
              {issueQtyError && (
                <p className="absolute top-full left-0 mt-1 w-full text-xs leading-tight text-red-600">
                  {issueQtyError}
                </p>
              )}
            </div>

            {/* Confirm button: label ki height (approx) ke barabar top offset */}
            <div className="pt-4">
              <Button
                color="primary"
                onClick={handleStageItem}
                disabled={
                  !selectedItemDetails || !issueQtyInput || !!issueQtyError
                }
                className="flex h-10 w-10 items-center justify-center rounded-md p-2.5"
                title="Confirm Item"
              >
                <CheckIcon className="size-5" />
              </Button>
            </div>
          </div>

          {/* STAGED ITEMS */}
          <div className="dark:border-dark-600 mt-8 border-t border-gray-200 pt-6">
            <h3 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200">
              Staged Items
            </h3>

            <div className="overflow-x-auto">
              <table className="dark:divide-dark-600 min-w-full divide-y divide-gray-200">
                <thead className="dark:bg-dark-700 bg-gray-50">
                  <tr>
                    {[
                      "Item Code",
                      "Item Name",
                      "HSN Code",
                      "Unit",
                      "Location",
                      "Qty",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase"
                      >
                        {h}
                      </th>
                    ))}
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
                            type="button"
                            onClick={() => handleRemoveStaged(row.itemId)}
                            className="text-primary-600 hover:text-primary-700 cursor-pointer"
                            title="Remove"
                          >
                            <TrashIcon className="size-5" />
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
                  {saving
                    ? "Saving..."
                    : actionType === "return"
                      ? "Save All Returned Items"
                      : "Save All Issued Items"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Page>
  );
}

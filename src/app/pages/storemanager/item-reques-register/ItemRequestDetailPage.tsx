import { useEffect, useState } from "react";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import { CheckIcon, ClockIcon } from "@heroicons/react/24/outline";
import { Link, useParams,useNavigate } from "react-router";
import { Page } from "@/components/shared/Page";
import { Button, Input } from "@/components/ui";
import { Get, Post, toasterrormsg, toastsuccessmsg } from "@/ApiHelper";

interface ItemRow {
  id: number;
  itemId: number;
  itemCode: string;
  itemName: string;
  orderQty: number;
  issuedQty: number;
  availableQty: number;
  itemLocation: string;
  unit: string;
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
  const [data, setData] = useState<ItemRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [issueQty, setIssueQty] = useState<Record<number, number>>({});
  // ✅ NEW — jo rows "Issue" click ho chuki hain lekin abhi backend save nahi hui
  const [stagedIds, setStagedIds] = useState<Set<number>>(new Set());
const navigate = useNavigate(); // ✅ NEW
 const fetchData = async () => {
  if (!itemId) return;
  setLoading(true);
  try {
    const res = await Get(`storemanager/itemRequest/${itemId}`, {}, false);
    if (res.data?.success) {
      setData(res.data.data);

      // ✅ NEW — jo items already issue ho chuke hain, unki qty input me bhar do
      const initialQty: Record<number, number> = {};
      (res.data.data?.items || []).forEach((row: ItemRow) => {
        if ((row.issuedQty ?? 0) > 0) {
          initialQty[row.id] = row.issuedQty;
        }
      });
      setIssueQty(initialQty);
    } else {
      toasterrormsg(res.data?.message || "Failed to load item request.");
    }
  } catch (err: any) {
    toasterrormsg(
      err?.response?.data?.message ||
        "Something went wrong while loading item request.",
    );
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchData();
  }, [itemId]);

  const handleIssueQtyChange = (rowId: number, value: string) => {
    setIssueQty((prev) => ({ ...prev, [rowId]: Number(value) || 0 }));
  };

  const validateRow = (row: ItemRow): string | null => {
    const qty = issueQty[row.id] ?? 0;
    if (qty <= 0) return "Please enter an issue quantity";
    if (qty > row.orderQty)
      return `Issue quantity cannot exceed the ordered quantity (${row.orderQty})`;
    if (qty > row.availableQty)
      return `Issue quantity cannot exceed the available stock (${row.availableQty})`;
    return null;
  };

  // ✅ CHANGED — ab ye API call nahi karta, sirf row ko "staged" mark karta hai
  const handleIssue = (row: ItemRow) => {
    if ((row.issuedQty ?? 0) > 0) {
      toasterrormsg("This item has already been issued");
      return;
    }

    const error = validateRow(row);
    if (error) {
      toasterrormsg(error);
      return;
    }

    setStagedIds((prev) => new Set(prev).add(row.id));
  };

  // ✅ Save button — sirf staged rows ko backend mein save karta hai
 const handleSaveAll = async () => {
  if (!data?.items?.length) return;

  const rowsToIssue = data.items.filter((row) => stagedIds.has(row.id));

  if (!rowsToIssue.length) {
    toasterrormsg("Please mark at least one item as Issue before saving");
    return;
  }

  setSaving(true);
  try {
    let successCount = 0;
    const failedItems: string[] = [];

    for (const row of rowsToIssue) {
      const qty = issueQty[row.id] ?? 0;
      try {
        const res = await Post(
          "storemanager/itemRequest/issue",
          {
            itemRequestDetailId: row.id,
            qty,
          },
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

    setIssueQty({});
    setStagedIds(new Set());

    // ✅ CHANGED — refetch ki jagah ab list page pe navigate
    if (successCount > 0) {
      navigate("/item-request-register");
    } else {
      fetchData(); // sab fail ho gaye to yahi rukke, data refresh kar do
    }
  } finally {
    setSaving(false);
  }
};

  return (
    <Page title="Item Request Detail">
      <div className="transition-content w-full pb-5">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 lg:px-6 lg:py-6">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-primary dark:text-dark-50 text-xl font-bold tracking-wide">
              Item Request Detail -
            </h2>
            {(data?.workOrderNo || data?.modelName) && (
              <span className="dark:text-dark-300 text-lg text-gray-500">
                {data?.workOrderNo && (
                  <span className="text-primary dark:text-primary-400 font-semibold">
                    {data.workOrderNo}
                  </span>
                )}
                {data?.workOrderNo && data?.modelName && (
                  <span className="mx-1">•</span>
                )}
                {data?.modelName && (
                  <span className="text-primary dark:text-primary-400 font-semibold">
                    {data.modelName}
                  </span>
                )}
              </span>
            )}
          </div>
          <Link to="/item-request-register">
            <Button color="primary" variant="outlined" className="gap-1">
              <ChevronLeftIcon className="size-5" />
              Back
            </Button>
          </Link>
        </div>

        {/* Items Table */}
        <div className="mt-6 px-5 lg:px-6">
          <div className="dark:border-dark-600 overflow-hidden rounded-xl border border-gray-200">
            <table className="dark:divide-dark-600 min-w-full divide-y divide-gray-200">
              <thead className="dark:bg-dark-700 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    Item Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    Item Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    Order Qty
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    Available Qty
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    Item Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    Issue Qty
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold tracking-wider text-gray-600 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="dark:divide-dark-600 dark:bg-dark-800 divide-y divide-gray-200 bg-white">
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : !data?.items?.length ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No items found.
                    </td>
                  </tr>
                ) : (
                  data.items.map((row) => {
                    const isIssued = (row.issuedQty ?? 0) > 0; 
                    const isStaged = stagedIds.has(row.id) && !isIssued; 

                    return (
                      <tr key={row.id}>
                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          {row.itemCode}
                        </td>
                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          {row.itemName}
                        </td>
                        <td className="px-4 py-3 text-left text-sm whitespace-nowrap">
                          {row.orderQty}
                        </td>
                        <td className="px-4 py-3 text-left text-sm whitespace-nowrap">
                          {row.availableQty}
                        </td>
                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          {row.itemLocation || "—"}
                        </td>
                        <td className="px-4 py-3 text-left text-sm whitespace-nowrap">
                          <Input
                            type="number"
                            min={0}
                            value={issueQty[row.id] ?? ""}
                            onChange={(e) =>
                              handleIssueQtyChange(row.id, e.target.value)
                            }
                            className="w-20 text-right"
                            disabled={isIssued || isStaged}
                          />
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          {isIssued ? (
                            <span
                              className="inline-flex size-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                              title="Issued"
                            >
                              <CheckIcon className="size-5" />
                            </span>
                          ) : isStaged ? (
                            // ✅ NEW — staged state: save hone ka wait, abhi backend mein nahi gaya
                            <span
                              className="inline-flex size-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
                              title="Pending save"
                            >
                              <ClockIcon className="size-5" />
                            </span>
                          ) : (
                            <Button
                              color="primary"
                              onClick={() => handleIssue(row)}
                            >
                              Issue
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ✅ Bottom-right Save button — staged rows ko backend mein commit karta hai */}
                   {/* ✅ Bottom-right Save button — staged rows ko backend mein commit karta hai */}
          {!loading && data?.items?.length ? (
            <div className="mt-4 flex justify-end">
              <Button
                color="primary"
                onClick={handleSaveAll}
                disabled={saving || (data?.status || "").toLowerCase() === "complete"}
              >
                {(data?.status || "").toLowerCase() === "complete"
                  ? "Completed"
                  : saving
                    ? "Saving..."
                    : "Save"}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </Page>
  );
}

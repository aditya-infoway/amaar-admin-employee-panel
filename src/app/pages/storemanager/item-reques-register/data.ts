export interface StockReportItem {
  id: string;
  date: string;
  contractorName: string;
  workOrderId: string;
  model: string;
  categoryName: string;
  groupName: string;
  taxSlab: string;
  currentStock: string;
  itemLocation: string;
  status: string; // ✅ naya
}

export const mapApiStockReportItemToStockReportItem = (item: any): StockReportItem => ({
  id: String(item.itemRequestId ?? item.id ?? ""),
  date: item.date ?? item.created ?? "",
  contractorName: item.contractorName ?? "",
  workOrderId: item.workOrderId ?? "",
  model: item.model ?? "",
  categoryName: item.categoryName ?? "",
  groupName: item.groupName ?? "",
  taxSlab: item.taxSlab ?? "0",
  currentStock: item.currentStock ?? "0",
  itemLocation: item.itemLocation ?? "",
  status: item.status ?? "Pending", // ✅ naya
});

export interface StockReportDetailRow {
  id?: number | string;
  date?: string;
  type?: string;
  partyName?: string;
  billNo?: string;
  qty?: number | string;
  billAmount?: number | string;
  currentStock?: number | string;
}

export interface StockReportDetail {
  itemId: string;
  itemCode: string;
  itemName: string;
  hsnCode: string;
  unit: string;
  category: string;
  group: string;
  rows: StockReportDetailRow[];
}
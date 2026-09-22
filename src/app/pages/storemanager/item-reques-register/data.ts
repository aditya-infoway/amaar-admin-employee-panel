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
}

export const mapApiStockReportItemToStockReportItem = (item: any): StockReportItem => ({
  id: String(item.id),
  date: item.date ?? "",
  contractorName: item.contractorName ?? "",
  workOrderId: item.workOrderId ?? "",
  model: item.model ?? "",
  categoryName: item.categoryName ?? "",
  groupName: item.groupName ?? "",
  taxSlab: item.taxSlab ?? "0",
  currentStock: item.currentStock ?? "0",
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
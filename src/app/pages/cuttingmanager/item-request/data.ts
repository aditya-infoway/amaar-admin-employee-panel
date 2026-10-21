export interface ItemRequestItem {
  itemId?: number;
  itemCode?: string;
  itemName?: string;
  qty?: number;
  unit?: string;
}

export interface ItemRequestRecord {
  id: number;
  requestNo?: string;
  workOrderNo?: string;
  totalItems?: number;
  items?: ItemRequestItem[];
    requestType?: "Issue" | "Return";
  createdAt?: string;
}
import { NavigationTree } from "@/@types/navigation";

export const itemrequest: NavigationTree = {
  id: "itemrequest",
  type: "collapse",
  path: "/item-request",
  title: "Item Request",
  icon: "itemRequest",
  childs: [
    {
      id: "stock_report.itemrequest",
      type: "item",
      path: "/item-request",
      title: "Item Request",
      icon: "stock_report.workorder",
    },
  ],
};
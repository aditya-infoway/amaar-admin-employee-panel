import { NavigationTree } from "@/@types/navigation";

export const itemrequest: NavigationTree = {
  id: "itemrequest",
  type: "collapse",
  path: "/itemrequest",
  title: "Item Request",
  icon: "stockReport",
  childs: [
    {
      id: "stock_report.itemrequest",
      type: "item",
      path: "/itemrequest",
      title: "Item Request",
      icon: "stock_report.workorder",
    },
  ],
};
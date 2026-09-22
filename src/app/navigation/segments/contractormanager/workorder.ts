import { NavigationTree } from "@/@types/navigation";

export const workorder: NavigationTree = {
  id: "workorder",
  type: "collapse",
  path: "/create-order",
  title: "Work order",
  icon: "stockReport",
  childs: [
    {
      id: "stock_report.workorder",
      type: "item",
      path: "/create-order",
      title: "Work Order List",
      icon: "stock_report.workorder",
    },
  ],
};
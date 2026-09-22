import { NavigationTree } from "@/@types/navigation";

export const stockReport: NavigationTree = {
  id: "stockReport",
  type: "collapse",
  path: "/stock-report",
  title: "Stock Report",
  icon: "stockReport",
  childs: [
    {
      id: "stock_report.stockReport",
      type: "item",
      path: "/stock-report",
      title: "Stock Report",
      icon: "stock_report.stockReport",
    },
  ],
};
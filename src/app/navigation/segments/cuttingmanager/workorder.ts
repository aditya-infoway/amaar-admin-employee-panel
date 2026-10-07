import { NavigationTree } from "@/@types/navigation";

export const startwork: NavigationTree = {
  id: "startwork",
  type: "collapse",
  path: "/start-work",
  title: "Work order",
  icon: "enquiryMaster",
  childs: [
    {
      id: "stock_report.startwork",
      type: "item",
      path: "/start-work",
      title: "Work Order List",
      icon: "stock_report.startwork",
    },
  ],
};

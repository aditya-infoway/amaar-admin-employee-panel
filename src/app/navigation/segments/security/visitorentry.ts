import { baseNavigationObj } from "../../baseNavigation";
import { NavigationTree } from "@/@types/navigation";

export const visitoreMaster: NavigationTree = {
  ...baseNavigationObj["visitoreMaster"],
  childs: [
    {
      id: "visitoreMaster.list",
      type: "item",
      path: "/visitoremaster/visitore-entry",
      title: "Visitor Entry",
      icon: "visitoreMaster.list",
    },
    {
      id: "visitoreMaster.exit",
      type: "item",
      path: "/visitoremaster/visitor-exit",
      title: "Visitor Exit",
      icon: "visitoreMaster.exit",
    },
  ],
};
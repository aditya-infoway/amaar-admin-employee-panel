import { NavigationTree } from "@/@types/navigation";

export const visitoreMaster: NavigationTree = {
    id: "visitoreMaster",
    type: "collapse",
    path: "/visitoremaster",
    title: "Visitor Master",
    icon: "visitoreMaster",
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
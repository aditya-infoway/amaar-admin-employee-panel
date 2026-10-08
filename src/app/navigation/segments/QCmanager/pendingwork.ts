import { NavigationTree } from "@/@types/navigation";

export const pendingWork: NavigationTree = {
  id: "pendingWork",
  type: "collapse",
  path: "/pending-work",
  title: "Pending Work",
  icon: "itemRequestRegister",
  childs: [
    {
      id: "pending_work.pendingWork",
      type: "item",
      path: "/pending-work",
      title: "Pending Work",
      icon: "pending_work.pendingWork",
    },
  ],
};

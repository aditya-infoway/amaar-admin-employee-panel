import { NavigationTree } from "@/@types/navigation";

export const itemRequestRegister: NavigationTree = {
  id: "itemRequestRegister",
  type: "collapse",
  path: "/item-request-register",
  title: "Item Request Register",
  icon: "itemRequestRegister",
  childs: [
    {
      id: "item_request_register.itemRequestRegister",
      type: "item",
      path: "/item-request-register",
      title: "Item Request Register",
      icon: "item_request_register.itemRequestRegister",
    },
  ],
};
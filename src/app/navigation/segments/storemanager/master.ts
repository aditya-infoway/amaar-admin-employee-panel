import { NavigationTree } from "@/@types/navigation";

export const master: NavigationTree = {
  id: "master",
  type: "collapse",
  path: "/master",
  title: "Master",
  icon: "master",
  childs: [
   
    {
      id: "master.itemMaster",
      type: "collapse",
      path: "/master/item-master",
      title: "Item Master",
      transKey: "Item Master",
      icon: "itemMaster.list",
      childs: [
        {
          id: "itemMaster.list",
          type: "item",
          path: "/master/item-master/item-list",
          title: "Item Master",
          transKey: "nav.itemMaster.list",
          icon: "itemMaster.list",
        },
        {
          id: "itemBarcode.list",
          type: "item",
          path: "/master/item-master/barcode-manager",
          title: "Barcode Manager",
          transKey: "Barcode Manager",
          icon: "itemBarcode.list",
        },
        {
          id: "itemlocation.list",
          type: "item",
          path: "/master/item-master/item-location",
          title: "Item Location",
          transKey: "Item Location",
          icon: "itemlocation.list",
        },
        {
          id: "itemCategory.list",
          type: "item",
          path: "/master/item-master/item-category",
          title: "Item Category",
          transKey: "Item Category",
          icon: "itemCategory.list",
        },
        {
          id: "itemGroup.list",
          type: "item",
          path: "/master/item-master/item-group",
          title: "Item Group",
          transKey: "Item Group",
          icon: "itemGroup.list",
        },
        // {
        //   id: "itemBom.bom",
        //   type: "item",
        //   path: "/master/item-master/bom",
        //   title: "BOM",
        //   transKey: "BOM",
        //   icon: "itemBom.bom",
        // },
      ],
    },
  ],
};
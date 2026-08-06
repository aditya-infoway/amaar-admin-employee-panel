import { NavigationTree } from "@/@types/navigation";

export const vehicleMaster: NavigationTree = {
    id: "vehicleMaster",
    type: "collapse",
    path: "/vehiclemaster",
    title: "Vehicle Master",
    icon: "vehicleMaster",
    childs: [
        {
        id: "vehicleMaster.list",
        type: "item",
        path: "/vehiclemaster/vehicle-entry",
        title: "Vehicle Entry",
        icon: "vehicleMaster.list",
      },
      {
        id: "vehicleMaster.exit",
        type: "item",
        path: "/vehiclemaster/vehicle-exit",
        title: "Vehicle Exit",
        icon: "vehicleMaster.exit",
      },
    ],
};
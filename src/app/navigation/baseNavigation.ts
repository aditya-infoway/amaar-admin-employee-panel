import { NavigationTree } from "@/@types/navigation";

/**
 * Object containing the base navigation items for the application.
 * This object serves as a centralized configuration for main navigation elements.
 */
export const baseNavigationObj: Record<string, NavigationTree> = {
  dashboards: {
    id: "dashboards",
    type: "item",
    path: "/dashboards/home",
    title: "Dashboard",
    transKey: "nav.dashboards.dashboards",
    icon: "dashboards",
  },

  // Vehicle Master
  vehicleMaster: {
    id: "vehicleMaster",
    type: "collapse",
    path: "/vehiclemaster",
    title: "Vehicle Master",
    icon: "vehicleMaster",
  },

  // Visitor Master
  visitoreMaster: {
    id: "visitoreMaster",
    type: "collapse",
    path: "/visitoremaster",
    title: "Visitor Master",
    icon: "visitoreMaster",
  },

  logout: {
    id: "logout",
    type: "item",
    path: "/login",
    title: "Logout",
    transKey: "nav.logout",
    icon: "logout",
  },
};

/**
 * Array of navigation items derived from baseNavigationObj.
 * This array format is used for rendering the navigation menu in the application.
 */
export const baseNavigation: NavigationTree[] = Array.from(
  Object.values(baseNavigationObj),
);
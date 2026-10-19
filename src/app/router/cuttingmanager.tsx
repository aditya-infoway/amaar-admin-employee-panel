import { Navigate } from "react-router";

// Dashboard
import Dashboard from "@/app/pages/cuttingmanager/dashboards/home/crm-analytics";
import PendingWorkOrders from "../pages/cuttingmanager/pending-work";

import StartWork from "@/app/pages/cuttingmanager/start-work";

// ✅ List page + Add page dono
import ItemRequestListPage from "../pages/cuttingmanager/item-request";
import AddItemRequestPage from "../pages/cuttingmanager/item-request/AddItemRequest";

export const cuttingmanagerRoutes = [
  {
    index: true,
    element: <Navigate to="dashboards/home" replace />,
  },

  // Dashboard
  {
    path: "dashboards",
    children: [
      {
        index: true,
        element: <Navigate to="home" replace />,
      },
      {
        path: "home",
        Component: Dashboard,
      },
    ],
  },

  {
    path: "pending-work",
    children: [
      {
        index: true,
        element: <Navigate to="pending" replace />,
      },
      {
        path: "pending",
        Component: PendingWorkOrders,
      },
    ],
  },

  {
    path: "start-work",
    children: [
      {
        index: true,
        element: <Navigate to="startwork" replace />,
      },
      {
        path: "startwork",
        Component: StartWork,
      },
    ],
  },

  {
    path: "item-request",
    children: [
      {
        index: true,
        element: <Navigate to="itemrequestpage" replace />,
      },
      {
        // List page (table + Add button)
        path: "itemrequestpage",
        Component: ItemRequestListPage,
      },
      {
        // Add form page
        path: "add",
        Component: AddItemRequestPage,
      },
    ],
  },
];
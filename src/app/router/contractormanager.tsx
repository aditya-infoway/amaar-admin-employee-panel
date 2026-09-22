import { Navigate } from "react-router";

// Dashboard
import Dashboard from "@/app/pages/contractormanager/dashboards/home/crm-analytics";

// Work Order
import WorkOrder from "@/app/pages/contractormanager/create-order";

export const contractormanagerRoutes = [
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

  // Create Order
  {
    path: "create-order",
    children: [
      {
        index: true,
        element: <Navigate to="workorder" replace />,
      },
      {
        path: "workorder",
        Component: WorkOrder,
      },
    ],
  },
];
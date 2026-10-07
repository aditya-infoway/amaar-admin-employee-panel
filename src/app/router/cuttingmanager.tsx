import { Navigate } from "react-router";

// Dashboard
import Dashboard from "@/app/pages/cuttingmanager/dashboards/home/crm-analytics";
import PendingWorkOrders from "../pages/cuttingmanager/pending-work";

// ✅ Import the actual page component, NOT the navigation tree
import StartWork from "@/app/pages/cuttingmanager/start-work"; // ← adjust path if needed

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
        element: <Navigate to="pending" replace />, // relative is better
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
        element: <Navigate to="startwork" replace />, // relative
      },
      {
        path: "startwork",
        Component: StartWork, // ✅ real component
      },
    ],
  },
];

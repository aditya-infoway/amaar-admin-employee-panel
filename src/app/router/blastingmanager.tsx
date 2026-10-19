import { Navigate } from "react-router";

// Dashboard
import Dashboard from "@/app/pages/blastingmanager/dashboards/home/crm-analytics";
import PendingWorkOrders from "../pages/blastingmanager/pending-work";

// ✅ Import the actual page component, NOT the navigation tree
import StartWork from "@/app/pages/blastingmanager/start-work";
import ItemRequestListPage from "../pages/blastingmanager/item-request";
import AddItemRequestPage from "../pages/blastingmanager/item-request/AddItemRequest";

export const blastingmanagerRoutes = [
  // ✅ FIX — root "/" ke liye index route add kiya, warna blank aata hai
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

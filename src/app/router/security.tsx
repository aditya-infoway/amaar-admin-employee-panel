import { Navigate } from "react-router";

// Dashboard
import Dashboard from "@/app/pages/dashboards/home/crm-analytics";

// Vehicle Master
import VehicleEntry from "@/app/pages/security/vehicle-master";
import VehicleForm from "@/app/pages/security/vehicle-master/form";
import VehicleExit from "@/app/pages/security/vehicle-master/exit";

// Visitor Master
import VisitorEntry from "@/app/pages/security/visitoremaster";
import VisitorForm from "@/app/pages/security/visitoremaster/form";
import VisitorExit from "@/app/pages/security/visitoremaster/exit";

export const securityRoutes = [
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

  // Vehicle Master
  {
    path: "vehiclemaster",
    children: [
      {
        index: true,
        element: <Navigate to="vehicle-entry" replace />,
      },
      {
        path: "vehicle-entry",
        Component: VehicleEntry,
      },
      {
        path: "create",
        Component: VehicleForm,
      },
      {
        path: "edit/:id",
        Component: VehicleForm,
      },
      {
        path: "vehicle-exit",
        Component: VehicleExit,
      },
    ],
  },

  // Visitor Master
  {
    path: "visitoremaster",
    children: [
      {
        index: true,
        element: <Navigate to="visitore-entry" replace />,
      },
      {
        path: "visitore-entry",
        Component: VisitorEntry,
      },
      {
        path: "create",
        Component: VisitorForm,
      },
      {
        path: "edit/:id",
        Component: VisitorForm,
      },
      {
        path: "visitor-exit",
        Component: VisitorExit,
      },
    ],
  },
];
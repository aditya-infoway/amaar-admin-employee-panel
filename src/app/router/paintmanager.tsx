import { Navigate } from "react-router";

// Dashboard
import Dashboard from "@/app/pages/paintmanager/dashboards/home/crm-analytics";
import PendingWorkOrders from "../pages/paintmanager/pending-work";

// ✅ Import the actual page component, NOT the navigation tree
import StartWork from "@/app/pages/paintmanager/start-work";
// enquiry
// import Enquiry from "@/app/pages/sale-executive/lead-master/enquiry";
// import Quotation from "@/app/pages/sale-executive/lead-master/quotation";

// // Followups
// import TodayFollowups from "@/app/pages/sale-executive/followup/todayfolloups";
// import Followup from "@/app/pages/sale-executive/followup/followup";
// import FollowupHistory from "@/app/pages/sale-executive/followup/followuphistory";

export const paintmanagerRoutes = [
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
//   {
//     path: "lead-master",
//     children: [
//       {
//         index: true,
//         element: <Navigate to="/lead-master/enquiry" replace />,
//       },
//       {
//         path: "enquiry",
//         Component: Enquiry,
//       },
//       {
//         path: "quotation",
//         Component: Quotation,
//       },
//     ],
//   },

//    // Followups
//   {
//     path: "followups",
//     children: [
//       {
//         index: true,
//         element: <Navigate to="todayfollowups" replace />,
//       },

//       {
//         path: "todayfollowups",
//         Component: TodayFollowups,
//       },

//       {
//         path: "follow-up/:id",
//         Component: Followup,
//       },

//       {
//         path: "history/:id",
//         Component: FollowupHistory,
//       },
//     ],
//   },
];
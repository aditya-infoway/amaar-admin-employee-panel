import { Navigate } from "react-router";

// Dashboard
import Dashboard from "@/app/pages/hr/dashboards/home/crm-analytics";

import employeelist from "@/app/pages/hr/employee/employeelist";
import employeeRegister from "@/app/pages/hr/employee/employeeRegister";
import EmployeeRegisterWizard from "@/app/pages/hr/employee/employeeRegister/form";
import EmployeeEditForm from "@/app/pages/hr/employee/employeeRegister/form/employeeEditForm";
import attandence from  "@/app/pages/hr/employee/attandence";
export const hrRoutes = [
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
    path: "employee",
    children: [
      {
        index: true,
        element: <Navigate to="/employee/employeelist" replace />,
      },
      {
        path: "employeelist",
        Component: employeelist,
      },
      {
        path: "employeeRegister",
        children: [
          {
            index: true,
            Component: employeeRegister, // List page
          },
          {
            path: "create",
            Component: EmployeeRegisterWizard, // New employee — 4-step form
          },
          {
            path: "edit/:id",
            Component: EmployeeEditForm, // Edit existing employee
          },
        ],
      },
       {
        path: "attandence",
        Component: attandence,
      },
    ],
  },

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
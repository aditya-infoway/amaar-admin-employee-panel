import { Navigate } from "react-router";

// Dashboard
import Dashboard from "@/app/pages/storemanager/dashboards/home/crm-analytics";

// Master - Quotation Master
import CreateMaster from "@/app/pages/storemanager/master/quotation-master/createmaster";
import CreatePricing from "@/app/pages/storemanager/master/quotation-master/createpricing";

// Master - Item Master
// Master - Item Master
import ItemList from "@/app/pages/storemanager/master/item-master";
import BarcodeManager from "@/app/pages/storemanager/master/item-master/barcode-manager";
import ItemLocation from "@/app/pages/storemanager/master/item-master/location-master";
import ItemCategory from "@/app/pages/storemanager/master/item-master/iteam-category";
import ItemGroup from "@/app/pages/storemanager/master/item-master/iteam-group";
// import Bom from "@/app/pages/storemanager/master/bom";
import ItemMasterFormPage from "@/app/pages/storemanager/master/item-master/form";
// Purchase Master
import PurchaseRegister from "@/app/pages/storemanager/purchase-master/purchase-register";
import PurchaseRegisterForm  from "@/app/pages/storemanager/purchase-master/purchase-register/form/index"
import PurchaseOrder from "@/app/pages/storemanager/purchase-master/purchase-order";
import PurchaseGrr from "@/app/pages/storemanager/purchase-master/purchase-grr";
import PurchaseGrrForm from "@/app/pages/storemanager/purchase-master/purchase-grr/grrindex"
// Stock Report
import StockReport from "@/app/pages/storemanager/stock-report";
import StockReportDetailPage from "@/app/pages/storemanager/stock-report/StockReportDetailPage";
// enquiry
// import Enquiry from "@/app/pages/sale-executive/lead-master/enquiry";
// import Quotation from "@/app/pages/sale-executive/lead-master/quotation";

// // Followups
// import TodayFollowups from "@/app/pages/sale-executive/followup/todayfolloups";
// import Followup from "@/app/pages/sale-executive/followup/followup";
// import FollowupHistory from "@/app/pages/sale-executive/followup/followuphistory";

export const storemanagerRoutes = [
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

  // Master
  {
    path: "master",
    children: [
      // Quotation Master
      {
        path: "quotation-master",
        children: [
          {
            index: true,
            element: <Navigate to="createmaster" replace />,
          },
          {
            path: "createmaster",
            Component: CreateMaster,
          },
          {
            path: "createpricing",
            Component: CreatePricing,
          },
        ],
      },
      // Item Master
      {
        path: "item-master",
        children: [
          { index: true, element: <Navigate to="item-list" replace /> },
          { path: "item-list", Component: ItemList },
          { path: "create", Component: ItemMasterFormPage },
          { path: "edit/:id", Component: ItemMasterFormPage },
          { path: "barcode-manager", Component: BarcodeManager },
          { path: "item-location", Component: ItemLocation },
          { path: "item-category", Component: ItemCategory },
          { path: "item-group", Component: ItemGroup },
          // { path: "bom", Component: Bom },
        ],
      },
    ],
  },

  // Purchase Master
  {
    path: "purchase-master",
    children: [
      {
        index: true,
        element: <Navigate to="purchase-register" replace />,
      },
      {
        path: "purchase-register",
        children: [
          {
            index: true,
            Component: PurchaseRegister, 
          },
          {
            path: "create",
            Component: PurchaseRegisterForm , 
          },
          {
            path: "edit/:id",
            Component: PurchaseRegister,
          },
        ],
      },
      {
        path: "purchase-order",
        children: [
          {
            index: true,
            Component: PurchaseOrder, // list page
          },
          {
            path: "create",
            Component: PurchaseOrder, // your form/create page
          },
        ],
      },
     {
  path: "purchase-grr",
  children: [
    {
      index: true,
      Component: PurchaseGrr, // list page
    },
    {
      path: "create",
      Component: PurchaseGrrForm, // create/verify page
    },
  ],
},
    ],
  },

  // Stock Report
  // Stock Report
  {
    path: "stock-report",
    children: [
      {
        index: true,
        Component: StockReport,
      },
      {
        path: ":itemId",
        Component: StockReportDetailPage,
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

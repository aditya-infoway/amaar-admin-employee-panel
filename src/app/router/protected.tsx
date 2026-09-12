import { Navigate, RouteObject } from "react-router";

import AuthGuard from "@/middleware/AuthGuard";
import { DynamicLayout } from "../layouts/DynamicLayout";
import { AppLayout } from "../layouts/AppLayout";
import RoleRoutes from "./RoleRoutes";

/**
 * Protected routes configuration
 * These routes require authentication to access
 * Uses AuthGuard middleware to verify user authentication
 */
const protectedRoutes: RouteObject = {
  id: "protected",
  Component: AuthGuard,
  children: [
    {
      Component: DynamicLayout,
      children: [
        {
          path: "settings",
          lazy: async () => ({
            Component: (await import("@/app/pages/settings/Layout")).default,
          }),
          children: [
            { index: true, element: <Navigate to="/settings/general" /> },
            {
              path: "general",
              lazy: async () => ({
                Component: (await import("@/app/pages/settings/sections/General")).default,
              }),
            },
            {
              path: "appearance",
              lazy: async () => ({
                Component: (await import("@/app/pages/settings/sections/Appearance")).default,
              }),
            },
          ],
        },
        {
          path: "*",
          Component: RoleRoutes,
        },
      ],
    },
  ],
};

export { protectedRoutes };
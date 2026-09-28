import { RouteObject } from "react-router";

/**
 * Public routes configuration
 * These routes are accessible without authentication
 * Includes error pages, authentication pages, and other public content
 */
const publicRoutes: RouteObject = {
  id: "public",
  // children: [],
  children: [
    {
      path: "auth-bridge",
      lazy: async () => ({
        Component: (await import("@/app/pages/AuthBridge")).default,
      }),
    },
  ],
};

export { publicRoutes };

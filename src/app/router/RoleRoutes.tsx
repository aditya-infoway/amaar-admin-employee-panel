import { useRoutes } from "react-router";
import { useAuthContext } from "@/app/contexts/auth/context";
import { securityRoutes } from "./security";
import { SaleExecutiveRoutes } from "./saleExecutive";

export default function RoleRoutes() {
 const roleIdRaw = window.localStorage.getItem("roleId");
  const roleId = Number(roleIdRaw);

const roleRoutes =
 roleId === 1
  ? SaleExecutiveRoutes
  : roleId === 5
  ? securityRoutes
  : [];

 return useRoutes(roleRoutes);
}
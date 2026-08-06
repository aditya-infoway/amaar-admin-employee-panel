import { useRoutes } from "react-router";
import { useAuthContext } from "@/app/contexts/auth/context";
import { securityRoutes } from "./security";
import { SaleExecutiveRoutes } from "./saleExecutive";

export default function RoleRoutes() {
 const roleIdRaw = window.sessionStorage.getItem("roleId");
  const roleId = Number(roleIdRaw);

const roleRoutes =
 roleId === 2
  ? SaleExecutiveRoutes
  : roleId === 14
  ? securityRoutes
  : [];

 return useRoutes(roleRoutes);
}
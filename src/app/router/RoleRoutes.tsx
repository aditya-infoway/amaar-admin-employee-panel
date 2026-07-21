import { useRoutes } from "react-router";
import { useAuthContext } from "@/app/contexts/auth/context";
import { securityRoutes } from "./security";

export default function RoleRoutes() {
 const roleIdRaw = window.sessionStorage.getItem("roleId");
  const roleId = Number(roleIdRaw);

const roleRoutes =
 roleId === 14
  ? securityRoutes
  : roleId === 16
  ? securityRoutes
  : [];

 return useRoutes(roleRoutes);
}
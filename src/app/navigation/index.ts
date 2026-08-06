import { useAuthContext } from "@/app/contexts/auth/context";
import { securityNavigation } from "./segments/security";
import { salesExecutiveNavigation } from "./segments/SaleExecutive";

export function useNavigation() {
 const { user } = useAuthContext();

 const roleId = Number(window.sessionStorage.getItem("roleId"));

 switch (roleId) {
  case 2:
   return salesExecutiveNavigation;
  case 14:
   return securityNavigation;
  default:
   return [];
 }
}
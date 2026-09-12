import { useAuthContext } from "@/app/contexts/auth/context";
import { securityNavigation } from "./segments/security";
import { salesExecutiveNavigation } from "./segments/SaleExecutive";

export function useNavigation() {
 const { user } = useAuthContext();

 const roleId = Number(window.localStorage.getItem("roleId"));

 switch (roleId) {
  case 1:
   return salesExecutiveNavigation;
  case 5:
   return securityNavigation;
  default:
   return [];
 }
}
import { useAuthContext } from "@/app/contexts/auth/context";
import { securityNavigation } from "./segments/security";

export function useNavigation() {
 const { user } = useAuthContext();

 const roleId = Number(window.sessionStorage.getItem("roleId"));

 switch (roleId) {
  case 14:
   return securityNavigation;
  case 15:
   return securityNavigation;
  default:
   return [];
 }
}
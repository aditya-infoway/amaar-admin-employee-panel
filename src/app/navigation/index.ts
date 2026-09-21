// import { useAuthContext } from "@/app/contexts/auth/context";
import { securityNavigation } from "./segments/security";
import { salesExecutiveNavigation } from "./segments/SaleExecutive";
import { cuttingManagerNavigation } from "./segments/cuttingmanager";
import {weldingManagerNavigation } from "./segments/weldingmanager"
import {fittingManagerNavigation } from "./segments/fittingmanager"
import  {blastingmanagerNavigation } from "./segments/blastingmanager"
import {paintmanagerNavigation} from "./segments/paintmanager"
import {washingmanagerNavigation} from "./segments/washingmanager"
import {QCmanagerNavigation} from "./segments/QCmanager"
import {productionmanagerNavigation} from "./segments/productionmanager"
import { hrNavigation } from "./segments/hr"
import { storemanagerNavigation } from "./segments/storemanager"
import { contractormanagerNavigation } from "./segments/contractormanager"
export function useNavigation() {
//  const { user } = useAuthContext();

 const roleId = Number(window.localStorage.getItem("roleId"));

 switch (roleId) {
  case 2:
   return salesExecutiveNavigation;
  case 14:
   return securityNavigation;
   case 6:
   return cuttingManagerNavigation;
     case 7:
   return weldingManagerNavigation;
     case 8:
   return fittingManagerNavigation;
     case 9:
   return blastingmanagerNavigation;
     case 10:
   return paintmanagerNavigation;
    case 11:
   return washingmanagerNavigation;
    case 12:
   return QCmanagerNavigation;
    case 13:
   return productionmanagerNavigation;
     case 15:
   return hrNavigation;
     case 16:
   return storemanagerNavigation;
     case 18:
   return contractormanagerNavigation;
  default:
   return [];
 }
}
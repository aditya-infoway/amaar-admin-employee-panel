import { useRoutes } from "react-router";
// import { useAuthContext } from "@/app/contexts/auth/context";
import { securityRoutes } from "./security";
import { SaleExecutiveRoutes } from "./saleExecutive";
import { cuttingmanagerRoutes } from "./cuttingmanager";
import { weldingmanagerRoutes } from "./weldingmanager";
import { fittingmanagerRoutes } from "./fittingmanager";
import { blastingmanagerRoutes } from "./blastingmanager";
import { paintmanagerRoutes } from "./paintmanager";
import { washingmanagerRoutes } from "./washingmanager";
import { QCmanagerRoutes } from "./QCmanager";
import { productionmanagerRoutes } from "./productionmanager";
import { hrRoutes } from "./hr";
export default function RoleRoutes() {
  const roleIdRaw = window.localStorage.getItem("roleId");
  const roleId = Number(roleIdRaw);

  const roleRoutes =
    roleId === 2
      ? SaleExecutiveRoutes
      : roleId === 14
        ? securityRoutes
        : roleId === 6
          ? cuttingmanagerRoutes
          : roleId === 7
            ? weldingmanagerRoutes
            : roleId === 8
              ? fittingmanagerRoutes
              : roleId === 9
                ? blastingmanagerRoutes
                : roleId === 10
                  ? paintmanagerRoutes
                  : roleId === 11
                    ? washingmanagerRoutes
                    : roleId === 12
                      ? QCmanagerRoutes
                      : roleId === 13
                        ? productionmanagerRoutes
                        : roleId === 15
                          ? hrRoutes
                          : [];

  return useRoutes(roleRoutes);
}

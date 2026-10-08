import { dashboards } from "./dashboards";
import { logout } from "./logout";
// ya jahan se bhi ye export ho raha hai
import { settings } from "./settings";
import { pendingWork } from "./pendingwork";
import { startwork } from "./workorder";
export const QCmanagerNavigation = [
  dashboards,
  pendingWork,
  startwork,
  settings,
  logout,
];

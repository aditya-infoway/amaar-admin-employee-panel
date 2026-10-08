import { dashboards } from "./dashboards";
import { logout } from "./logout";
import { pendingWork } from "./pendingwork";
// ya jahan se bhi ye export ho raha hai
import { settings } from "./settings";
import { startwork } from "./workorder";
export const cuttingManagerNavigation = [
  dashboards,
  pendingWork,
  startwork,
  settings,
  logout,
];

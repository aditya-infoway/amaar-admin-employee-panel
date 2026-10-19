import { dashboards } from "./dashboards";
import { itemrequest } from "./itemrequest";
import { logout } from "./logout";
import { pendingWork } from "./pendingwork";
// ya jahan se bhi ye export ho raha hai
import { settings } from "./settings";
import { startwork } from "./workorder";
export const cuttingManagerNavigation = [
  dashboards,
  pendingWork,
  startwork,
  itemrequest,
  settings,
  logout,
];

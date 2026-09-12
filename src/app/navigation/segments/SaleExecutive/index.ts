import { dashboards } from "./dashboards";
import { logout } from "./logout";
import { leadMaster } from "./leadMaster";
import { followups } from "./followups";
import { settings } from "./settings"; // ya jahan se bhi ye export ho raha hai

export const salesExecutiveNavigation = [
  dashboards,
  leadMaster,
  followups,
  settings,
  logout,
];
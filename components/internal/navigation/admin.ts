
import {
  LuLayoutDashboard,
  LuUsers,
  LuBuilding2,
  LuSettings,
} from "react-icons/lu";

import type { NavigationConfig } from "./types";

export const adminNavigation: NavigationConfig = {
  items: [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: LuLayoutDashboard,
    },
    {
      label: "Users",
      href: "/admin/users",
      icon: LuUsers,
    },
    {
      label: "Companies",
      href: "/admin/companies",
      icon: LuBuilding2,
    },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: LuSettings,
    },
  ],
};

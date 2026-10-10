
"use client";

import {
  LuLayoutDashboard,
  LuBuilding2,
  LuMapPin,
  LuPlus,
} from "react-icons/lu";

import type { NavigationConfig } from "./types";

export const staffNavigation: NavigationConfig = {
  items: [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LuLayoutDashboard,
    },
    {
      label: "Branches",
      href: "/branches",
      icon: LuBuilding2,
      children: [
        {
          label: "Branch 1",
          href: "/branches/branch-1",
          icon: LuMapPin,
        },
        {
          label: "Branch 2",
          href: "/branches/branch-2",
          icon: LuMapPin,
        },
        {
          label: "Add Branch",
          href: "/branches/new",
          icon: LuPlus,
        },
      ],
    },
  ],
};

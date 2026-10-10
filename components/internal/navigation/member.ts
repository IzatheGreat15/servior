import {
    LuLayoutDashboard,
    LuCalendarDays,
} from "react-icons/lu";

import type { NavigationConfig } from "./types";

export const memberNavigation: NavigationConfig = {
    items: [
        {
            label: "Dashboard",
            href: "/dashboard",
            icon: LuLayoutDashboard,
        },
        {
            label: "My Bookings",
            href: "/my-bookings",
            icon: LuCalendarDays,
        },
    ],
};


import {
  LuUsers,
  LuUserPlus,
  LuCalendarCheck,
  LuWallet,
} from "react-icons/lu";

import StatCard from "./StatCard";
import { DashboardStatsData } from "./types";

type Props = {
  stats: DashboardStatsData;
};

export default function DashboardStats({ stats }: Props) {
  const money = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  });

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="New sign-ups"
        value={stats.newUsers.toLocaleString("en-PH")}
        change={stats.newUsersChange}
        description="vs. previous period"
        icon={<LuUserPlus size={22} />}
      />

      <StatCard
        label="Total users"
        value={stats.totalUsers.toLocaleString("en-PH")}
        description="Registered users"
        icon={<LuUsers size={22} />}
      />

      <StatCard
        label="Total bookings"
        value={stats.totalBookings.toLocaleString("en-PH")}
        change={stats.bookingsChange}
        description="vs. previous period"
        icon={<LuCalendarCheck size={22} />}
      />

      <StatCard
        label="Total revenue"
        value={money.format(stats.revenue)}
        change={stats.revenueChange}
        description="vs. previous period"
        icon={<LuWallet size={22} />}
      />
    </section>
  );
}

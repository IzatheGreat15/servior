
import { LuChartNoAxesCombined } from "react-icons/lu";

type DashboardHeaderProps = {
  startDate: string;
  endDate: string;
};

export default function DashboardHeader({
  startDate,
  endDate,
}: DashboardHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="mt-1 text-2xl font-bold text-[#102d29] sm:text-3xl">
          Welcome Back, John!
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Monitor users, bookings, revenue, and branch performance.
        </p>
      </div>

      <div className="flex items-center gap-2 self-start rounded-xl border border-[#d8e2dc] bg-white px-4 py-3 text-sm text-[#102d29] sm:self-auto">
        <LuChartNoAxesCombined size={18} className="text-[#13834e]" />

        <span>
          {startDate} – {endDate}
        </span>
      </div>
    </header>
  );
}

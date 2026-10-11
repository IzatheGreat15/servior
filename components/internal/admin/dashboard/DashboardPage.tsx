
"use client";

import { useMemo, useState } from "react";
import { DateRange, mockBookingRevenue, mockBranchRevenue, mockRecentBookings, mockSports, mockStats, mockUserGrowth } from "./types";
import DashboardHeader from "./DashboardHeader";
import DashboardDateFilter from "./DashboardDateFilter";
import DashboardStats from "./DashboardStats.";
import BookingRevenueChart from "./BookingRevenueChart";
import BranchRevenueRanking from "./BranchRevenueRanking";
import PopularSportsChart from "./PopularSportsChart";
import UserGrowthChart from "./UserGrowthChart";
import RecentBookingsTable from "./RecentBookingsTable";

function getCurrentMonthRange(): DateRange {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);

  const format = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  return {
    startDate: format(start),
    endDate: format(now),
  };
}

export default function AdminDashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>(
    getCurrentMonthRange,
  );

  // Replace these mock datasets with aggregates from your data layer.
  const bookingRevenue = useMemo(
    () =>
      mockBookingRevenue.filter((item) => {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, "0");
        const day = item.date.match(/\d+/)?.[0]?.padStart(2, "0");

        if (!day) return false;

        const isoDate = `${year}-${month}-${day}`;
        return isoDate >= dateRange.startDate && isoDate <= dateRange.endDate;
      }),
    [dateRange],
  );

  const recentBookings = useMemo(
    () =>
      mockRecentBookings.filter(
        (booking) =>
          booking.date >= dateRange.startDate &&
          booking.date <= dateRange.endDate,
      ),
    [dateRange],
  );

  return (
    <main className="space-y-6">
      <DashboardHeader
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
      />

      <DashboardDateFilter
        value={dateRange}
        onApply={setDateRange}
      />

      <DashboardStats stats={mockStats} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <BookingRevenueChart data={bookingRevenue} />
        <BranchRevenueRanking data={mockBranchRevenue} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <PopularSportsChart data={mockSports} />
        <UserGrowthChart data={mockUserGrowth} />
      </div>

      <RecentBookingsTable bookings={recentBookings} />
    </main>
  );
}

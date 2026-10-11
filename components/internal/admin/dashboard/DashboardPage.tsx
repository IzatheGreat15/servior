"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DateRange,
  mockBookingRevenue,
  mockBranchRevenue,
  mockSports,
  mockStats,
  mockUserGrowth,
} from "./types";
import DashboardHeader from "./DashboardHeader";
import DashboardDateFilter from "./DashboardDateFilter";
import BookingRevenueChart from "./BookingRevenueChart";
import BranchRevenueRanking from "./BranchRevenueRanking";
import PopularSportsChart from "./PopularSportsChart";
import UserGrowthChart from "./UserGrowthChart";
import BookingsTable from "./BookingsTable";
import { mockBookings } from "../../bookings/types";
import DashboardStats from "./DashboardStats.";

function getCurrentMonthRange(): DateRange {
  const now = new Date();

  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const format = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  return {
    startDate: format(start),
    endDate: format(end),
  };
}

export default function AdminDashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    setDateRange(getCurrentMonthRange());
  }, []);

  const bookingRevenue = useMemo(
    () =>
      mockBookingRevenue.filter((item) => {
        if (!dateRange.startDate || !dateRange.endDate) return false;

        const now = new Date();
        const day = item.date.match(/\d+/)?.[0]?.padStart(2, "0");

        if (!day) return false;

        const isoDate = `${now.getFullYear()}-${String(
          now.getMonth() + 1,
        ).padStart(2, "0")}-${day}`;

        return (
          isoDate >= dateRange.startDate &&
          isoDate <= dateRange.endDate
        );
      }),
    [dateRange],
  );

  const recentBookings = useMemo(
    () =>
      mockBookings.filter((booking) =>
        booking.sessions.some(
          (session) =>
            dateRange.startDate &&
            dateRange.endDate &&
            session.date >= dateRange.startDate &&
            session.date <= dateRange.endDate,
        ),
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

      <BookingsTable bookings={recentBookings} />
    </main>
  );
}
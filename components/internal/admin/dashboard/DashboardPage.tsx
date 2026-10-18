"use client";

import { useEffect, useState } from "react";
import {
  BookingRevenuePoint,
  BranchRevenue,
  DateRange,
  DashboardStatsData,
  SportUsage,
  UserGrowthPoint,
} from "./types";
import DashboardHeader from "./DashboardHeader";
import DashboardDateFilter from "./DashboardDateFilter";
import BookingRevenueChart from "./BookingRevenueChart";
import BranchRevenueRanking from "./BranchRevenueRanking";
import PopularSportsChart from "./PopularSportsChart";
import UserGrowthChart from "./UserGrowthChart";
import BookingsTable from "./BookingsTable";
import type { Booking } from "../../bookings/types";
import DashboardStats from "./DashboardStats.";

type DashboardResponse = {
  stats: DashboardStatsData;
  bookingRevenue: BookingRevenuePoint[];
  branchRevenue: BranchRevenue[];
  sports: SportUsage[];
  userGrowth: UserGrowthPoint[];
  recentBookings: Booking[];
};

const emptyStats: DashboardStatsData = {
  newUsers: 0,
  totalUsers: 0,
  totalBookings: 0,
  revenue: 0,
  newUsersChange: 0,
  bookingsChange: 0,
  revenueChange: 0,
};

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
  const [dashboard, setDashboard] = useState<DashboardResponse>({
    stats: emptyStats,
    bookingRevenue: [],
    branchRevenue: [],
    sports: [],
    userGrowth: [],
    recentBookings: [],
  });
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setDateRange(getCurrentMonthRange());
  }, []);

  useEffect(() => {
    if (!dateRange.startDate || !dateRange.endDate) {
      return;
    }

    const controller = new AbortController();

    async function loadDashboard() {
      try {
        const params = new URLSearchParams({
          from: dateRange.startDate,
          to: dateRange.endDate,
        });
        const response = await fetch(`/api/dashboard?${params}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) {
          setErrorMessage(
            response.status === 401 || response.status === 403
              ? "Sign in with staff access to view dashboard data."
              : "Dashboard data could not be loaded.",
          );
          return;
        }

        const result = (await response.json()) as DashboardResponse;
        setDashboard(result);
        setErrorMessage("");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setErrorMessage("Dashboard data could not be loaded.");
      }
    }

    void loadDashboard();
    return () => controller.abort();
  }, [dateRange]);

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

      {errorMessage && <p role="alert" className="text-sm text-red-600">{errorMessage}</p>}

      <DashboardStats stats={dashboard.stats} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <BookingRevenueChart data={dashboard.bookingRevenue} />
        <BranchRevenueRanking data={dashboard.branchRevenue} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <PopularSportsChart data={dashboard.sports} />
        <UserGrowthChart data={dashboard.userGrowth} />
      </div>

      <BookingsTable bookings={dashboard.recentBookings} />
    </main>
  );
}
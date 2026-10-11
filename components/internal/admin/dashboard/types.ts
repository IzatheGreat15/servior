
export type DashboardStat = {
  label: string;
  value: string;
  change: number;
  description: string;
};

export type BookingRevenuePoint = {
  date: string;
  bookings: number;
  revenue: number;
};

export type BranchRevenue = {
  branchId: string;
  branchName: string;
  revenue: number;
};

export type SportUsage = {
  sport: string;
  bookings: number;
};

export type UserGrowthPoint = {
  month: string;
  users: number;
};

export type RecentBooking = {
  id: string;
  reference: string;
  customerName: string;
  branchName: string;
  date: string;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  amount: number;
};


export type DateRange = {
  startDate: string;
  endDate: string;
};

export type DashboardPeriod =
  | "today"
  | "7days"
  | "month"
  | "30days"
  | "custom";

export type DashboardStatsData = {
  newUsers: number;
  totalUsers: number;
  totalBookings: number;
  revenue: number;
  newUsersChange: number;
  bookingsChange: number;
  revenueChange: number;
};

export const mockStats: DashboardStatsData = {
  newUsers: 142,
  totalUsers: 2843,
  totalBookings: 892,
  revenue: 356780,
  newUsersChange: 12,
  bookingsChange: 15,
  revenueChange: 18,
};

export const mockBookingRevenue: BookingRevenuePoint[] = [
  { date: "Oct 1", bookings: 45, revenue: 18000 },
  { date: "Oct 3", bookings: 58, revenue: 22000 },
  { date: "Oct 5", bookings: 52, revenue: 20500 },
  { date: "Oct 7", bookings: 73, revenue: 28000 },
  { date: "Oct 9", bookings: 67, revenue: 25500 },
  { date: "Oct 11", bookings: 86, revenue: 34000 },
];

export const mockBranchRevenue: BranchRevenue[] = [
  { branchId: "1", branchName: "Greenhills", revenue: 128450 },
  { branchId: "2", branchName: "Eastwood", revenue: 98320 },
  { branchId: "3", branchName: "Alabang", revenue: 74760 },
  { branchId: "4", branchName: "Makati", revenue: 42150 },
  { branchId: "5", branchName: "Cebu", revenue: 12100 },
];

export const mockSports: SportUsage[] = [
  { sport: "Badminton", bookings: 402 },
  { sport: "Pickleball", bookings: 210 },
  { sport: "Tennis", bookings: 134 },
  { sport: "Basketball", bookings: 89 },
  { sport: "Others", bookings: 57 },
];

export const mockUserGrowth: UserGrowthPoint[] = [
  { month: "May", users: 1320 },
  { month: "Jun", users: 1510 },
  { month: "Jul", users: 1840 },
  { month: "Aug", users: 2100 },
  { month: "Sep", users: 2460 },
  { month: "Oct", users: 2843 },
];

export const mockRecentBookings: RecentBooking[] = [
  {
    id: "1",
    reference: "BK-2026-0821",
    customerName: "Maria Santos",
    branchName: "Greenhills",
    date: "2026-10-11",
    status: "confirmed",
    amount: 1200,
  },
  {
    id: "2",
    reference: "BK-2026-0820",
    customerName: "James Tan",
    branchName: "Eastwood",
    date: "2026-10-10",
    status: "pending",
    amount: 800,
  },
  {
    id: "3",
    reference: "BK-2026-0819",
    customerName: "Ana Reyes",
    branchName: "Makati",
    date: "2026-10-09",
    status: "completed",
    amount: 1600,
  },
  {
    id: "4",
    reference: "BK-2026-0818",
    customerName: "Carlo Dela Cruz",
    branchName: "Alabang",
    date: "2026-10-08",
    status: "confirmed",
    amount: 1200,
  },
  {
    id: "5",
    reference: "BK-2026-0817",
    customerName: "Bea Lim",
    branchName: "Cebu",
    date: "2026-10-07",
    status: "cancelled",
    amount: 1400,
  },
];


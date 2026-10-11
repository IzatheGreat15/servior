"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LuChevronLeft,
  LuChevronRight,
  LuEye,
  LuSearch,
  LuX,
} from "react-icons/lu";

import BookingDetailsModal from "../../bookings/BookingDetailsModal";
import { Booking } from "../../bookings/types";
import CustomSelect from "@/components/ui/CustomSelect";

type Props = {
  bookings: Booking[];
  pageSize?: number;
};

const statusStyles: Partial<Record<Booking["status"], string>> = {
  confirmed: "bg-[#e8f4ec] text-[#13834e]",
  pending: "bg-amber-50 text-amber-700",
  completed: "bg-blue-50 text-blue-700",
  cancelled: "bg-red-50 text-red-600",
};

const paymentStyles: Record<Booking["paymentStatus"], string> = {
  paid: "bg-[#e8f4ec] text-[#13834e]",
  unpaid: "bg-amber-50 text-amber-700",
  refunded: "bg-purple-50 text-purple-700",
};

const formatDate = (date: string) => {
  if (!date) return "—";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (time: string, date: Date | null) => {
  if (date === null) {
    return;
  }

  const [hours, minutes] = time.split(":").map(Number);
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatCreatedAt = (date: string) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatStatus = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

export default function BookingsTable({
  bookings,
  pageSize = 10,
}: Props) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [branch, setBranch] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [selectedBooking, setSelectedBooking] =
    useState<Booking | null>(null);
  const [date, setDate] = useState<Date|null>(null);

  useEffect(() => {
    const currentDate = new Date();
    setDate(currentDate);
  }, []);

  const branches = useMemo(
    () =>
      [...new Set(bookings.map((booking) => booking.branchName))].sort(),
    [bookings],
  );

  const statuses = useMemo(
    () => [...new Set(bookings.map((booking) => booking.status))].sort(),
    [bookings],
  );

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bookings
      .filter((booking) => {
        const matchesSearch =
          !query ||
          booking.reference.toLowerCase().includes(query) ||
          booking.venueName.toLowerCase().includes(query) ||
          booking.branchName.toLowerCase().includes(query) ||
          booking.sport.toLowerCase().includes(query) ||
          booking.courtName.toLowerCase().includes(query) ||
          booking.sessions.some((session) =>
            session.date.includes(query),
          );

        const matchesStatus =
          status === "all" || booking.status === status;

        const matchesPayment =
          paymentStatus === "all" ||
          booking.paymentStatus === paymentStatus;

        const matchesBranch =
          branch === "all" || booking.branchName === branch;

        // Filter by session dates, not booking creation dates.
        const matchesDateFrom =
          !dateFrom ||
          booking.sessions.some((session) => session.date >= dateFrom);

        const matchesDateTo =
          !dateTo ||
          booking.sessions.some((session) => session.date <= dateTo);

        return (
          matchesSearch &&
          matchesStatus &&
          matchesPayment &&
          matchesBranch &&
          matchesDateFrom &&
          matchesDateTo
        );
      })
      .sort((a, b) => {
        const latestA = a.sessions.reduce(
          (latest, session) =>
            session.date > latest ? session.date : latest,
          "",
        );

        const latestB = b.sessions.reduce(
          (latest, session) =>
            session.date > latest ? session.date : latest,
          "",
        );

        return latestB.localeCompare(latestA);
      });
  }, [
    bookings,
    search,
    status,
    paymentStatus,
    branch,
    dateFrom,
    dateTo,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBookings.length / pageSize),
  );

  const currentPage = Math.min(page, totalPages);

  const displayedBookings = filteredBookings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const resetFilters = () => {
    setSearch("");
    setStatus("all");
    setPaymentStatus("all");
    setBranch("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
  };

  const hasActiveFilters =
    search !== "" ||
    status !== "all" ||
    paymentStatus !== "all" ||
    branch !== "all" ||
    dateFrom !== "" ||
    dateTo !== "";

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="rounded-2xl border border-[#d8e2dc] bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <LuSearch
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search reference, venue, court, or sport..."
              className="w-full rounded-xl border border-[#d8e2dc] bg-[#f7faf8] py-3 pl-10 pr-4 text-sm text-[#102d29] outline-none transition placeholder:text-gray-400 focus:border-[#13834e] focus:ring-2 focus:ring-[#13834e]/10"
            />
          </div>

          {/* Dropdown filters */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label
                htmlFor="booking-status"
                className="mb-1.5 block text-xs font-medium text-gray-500"
              >
                Booking status
              </label>

              <CustomSelect
                id="booking-status"
                value={status}
                onChange={(value) => {
                  setStatus(value);
                  setPage(1);
                }}
                options={[
                  { label: "All statuses", value: "all" },
                  ...statuses.map((item) => ({
                    label: formatStatus(item),
                    value: item,
                  })),
                ]}
              />
            </div>

            <div>
              <label
                htmlFor="payment-status"
                className="mb-1.5 block text-xs font-medium text-gray-500"
              >
                Payment status
              </label>

              <CustomSelect
                id="payment-status"
                value={paymentStatus}
                onChange={(value) => {
                  setPaymentStatus(value);
                  setPage(1);
                }}
                options={[
                  { label: "All payments", value: "all" },
                  { label: "Paid", value: "paid" },
                  { label: "Unpaid", value: "unpaid" },
                  { label: "Refunded", value: "refunded" },
                ]}
              />
            </div>

            <div>
              <label
                htmlFor="booking-branch"
                className="mb-1.5 block text-xs font-medium text-gray-500"
              >
                Branch
              </label>

              <CustomSelect
                id="booking-branch"
                value={branch}
                onChange={(value) => {
                  setBranch(value);
                  setPage(1);
                }}
                options={[
                  { label: "All branches", value: "all" },
                  ...branches.map((item) => ({
                    label: item,
                    value: item,
                  })),
                ]}
              />
            </div>

            <div className="flex items-end">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-[#13834e] transition hover:bg-[#e8f4ec]"
                >
                  <LuX size={16} />
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Session date range */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="date-from"
                className="mb-1.5 block text-xs font-medium text-gray-500"
              >
                Session date from
              </label>

              <input
                id="date-from"
                type="date"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(event) => {
                  setDateFrom(event.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-[#d8e2dc] bg-white px-3 py-2.5 text-sm text-[#102d29] outline-none focus:border-[#13834e]"
              />
            </div>

            <div>
              <label
                htmlFor="date-to"
                className="mb-1.5 block text-xs font-medium text-gray-500"
              >
                Session date to
              </label>

              <input
                id="date-to"
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(event) => {
                  setDateTo(event.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-[#d8e2dc] bg-white px-3 py-2.5 text-sm text-[#102d29] outline-none focus:border-[#13834e]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-[#d8e2dc] bg-white">
        <div className="flex flex-col gap-1 border-b border-[#e8eeea] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-[#102d29]">
            Bookings
          </h2>

          <p className="text-sm text-gray-500">
            {filteredBookings.length}{" "}
            {filteredBookings.length === 1 ? "booking" : "bookings"} found
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-[#f7faf8] text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-4 font-medium">Reference</th>
                <th className="px-5 py-4 font-medium">Venue / Branch</th>
                <th className="px-5 py-4 font-medium">Sport / Court</th>
                <th className="px-5 py-4 font-medium">Sessions</th>
                <th className="px-5 py-4 font-medium">Booking status</th>
                <th className="px-5 py-4 font-medium">Payment</th>
                <th className="px-5 py-4 text-right font-medium">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#e8eeea]">
              {displayedBookings.map((booking) => {
                const sortedSessions = [...booking.sessions].sort(
                  (a, b) =>
                    `${a.date} ${a.startTime}`.localeCompare(
                      `${b.date} ${b.startTime}`,
                    ),
                );

                const firstSession = sortedSessions[0];
                const additionalSessions = sortedSessions.length - 1;

                return (
                  <tr
                    key={booking.id}
                    className="transition hover:bg-[#fbfdfb]"
                  >
                    <td className="px-5 py-4">
                      <span className="font-semibold text-[#13834e]">
                        {booking.reference}
                      </span>
                      <p className="mt-1 text-xs text-gray-400">
                        Created {formatCreatedAt(booking.createdAt)}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-[#102d29]">
                        {booking.venueName}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {booking.branchName}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-[#102d29]">
                        {booking.sport}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {booking.courtName}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      {firstSession ? (
                        <>
                          <p className="font-medium text-[#102d29]">
                            {formatDate(firstSession.date)}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {formatTime(firstSession.startTime, date)} –{" "}
                            {formatTime(firstSession.endTime, date)}
                          </p>
                          {additionalSessions > 0 && (
                            <p className="mt-1 text-xs font-medium text-[#13834e]">
                              +{additionalSessions} more{" "}
                              {additionalSessions === 1
                                ? "session"
                                : "sessions"}
                            </p>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-400">No sessions</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          statusStyles[booking.status] ??
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {formatStatus(booking.status)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${paymentStyles[booking.paymentStatus]}`}
                      >
                        {formatStatus(booking.paymentStatus)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleViewDetails(booking)}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#d8e2dc] px-3 py-2 text-xs font-medium text-[#102d29] transition hover:border-[#13834e] hover:bg-[#e8f4ec] hover:text-[#13834e]"
                      >
                        <LuEye size={15} />
                        View details
                      </button>
                    </td>
                  </tr>
                );
              })}

              {displayedBookings.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-16 text-center"
                  >
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f4ec] text-[#13834e]">
                        <LuSearch size={20} />
                      </div>

                      <p className="font-medium text-[#102d29]">
                        No bookings found
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Try adjusting your search or filters.
                      </p>

                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="mt-4 text-sm font-medium text-[#13834e] hover:underline"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t border-[#e8eeea] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            {filteredBookings.length === 0
              ? "Showing 0 bookings"
              : `Showing ${(currentPage - 1) * pageSize + 1}–${Math.min(
                  currentPage * pageSize,
                  filteredBookings.length,
                )} of ${filteredBookings.length} bookings`}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((previous) => Math.max(1, previous - 1))}
              aria-label="Previous page"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#d8e2dc] text-[#102d29] transition hover:bg-[#f7faf8] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <LuChevronLeft size={18} />
            </button>

            <span className="min-w-20 text-center text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() =>
                setPage((previous) => Math.min(totalPages, previous + 1))
              }
              aria-label="Next page"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#d8e2dc] text-[#102d29] transition hover:bg-[#f7faf8] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <LuChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Booking details modal */}
      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}

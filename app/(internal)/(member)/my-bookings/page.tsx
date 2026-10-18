
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LuCalendarPlus, LuSearch, LuX } from "react-icons/lu";
import type { Booking } from "@/components/internal/bookings/types";
import BookingTabs, { BookingTab } from "@/components/internal/bookings/BookingTabs";
import BookingList from "@/components/internal/bookings/BookingList";
import BookingDetailsModal from "@/components/internal/bookings/BookingDetailsModal";

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getFirstSessionDate(booking: Booking) {
  return [...booking.sessions]
    .sort((a, b) =>
      `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`)
    )[0]?.date ?? "";
}

function hasUpcomingSession(booking: Booking, todayKey: string) {
  return (
    booking.status !== "cancelled" &&
    booking.sessions.some((session) => session.date >= todayKey)
  );
}

function matchesTab(
  booking: Booking,
  tab: BookingTab,
  todayKey: string
) {
  if (tab === "completed") {
    return booking.status === "completed";
  }

  if (tab === "cancelled") {
    return booking.status === "cancelled";
  }

  return hasUpcomingSession(booking, todayKey);
}

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<BookingTab>("upcoming");
  const [search, setSearch] = useState("");
  const [todayKey, setTodayKey] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(
    null
  );

  useEffect(() => {
    setTodayKey(getTodayKey());
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadBookings() {
      try {
        const response = await fetch("/api/me/bookings?pageSize=1000", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) {
          setErrorMessage(
            response.status === 401
              ? "Sign in to view your bookings."
              : "Your bookings could not be loaded.",
          );
          return;
        }

        const result = (await response.json()) as { items?: Booking[] };
        if (!Array.isArray(result.items)) {
          setErrorMessage("Your bookings could not be loaded.");
          return;
        }
        setBookings(result.items);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setErrorMessage("Your bookings could not be loaded.");
      }
    }

    void loadBookings();
    return () => controller.abort();
  }, []);

  const counts = useMemo<Record<BookingTab, number>>(() => {
    return {
      upcoming: bookings.filter((booking) =>
        matchesTab(booking, "upcoming", todayKey)
      ).length,
      completed: bookings.filter((booking) =>
        matchesTab(booking, "completed", todayKey)
      ).length,
      cancelled: bookings.filter((booking) =>
        matchesTab(booking, "cancelled", todayKey)
      ).length,
    };
  }, [bookings, todayKey]);

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bookings
      .filter((booking) => matchesTab(booking, activeTab, todayKey))
      .filter((booking) => {
        if (!query) return true;

        return [
          booking.reference,
          booking.venueName,
          booking.branchName,
          booking.sport,
          booking.courtName,
          booking.address,
          booking.status,
          ...booking.sessions.map((session) => session.date),
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => {
        return getFirstSessionDate(a).localeCompare(getFirstSessionDate(b));
      });
  }, [activeTab, bookings, search, todayKey]);

  const closeModal = useCallback(() => {
    setSelectedBooking(null);
  }, []);

  return (
    <div className="min-h-screen bg-[#f7faf8]">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#102d29] sm:text-3xl">
              My Bookings
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
              View and manage your court reservations, including all the
              sessions under each booking.
            </p>
          </div>

          <Link
            href="/booking"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#13834e] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f6e40]"
          >
            <LuCalendarPlus size={18} />
            Book a court
          </Link>
        </div>

        <div className="mt-8 rounded-2xl border border-[#d8e2dc] bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-[#102d29]">
                Your reservations
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Keep track of your bookings and scheduled sessions.
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <LuSearch
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search bookings..."
                aria-label="Search bookings"
                className="w-full rounded-xl border border-[#d8e2dc] bg-white py-2.5 pl-10 pr-10 text-sm text-[#102d29] outline-none transition placeholder:text-gray-400 focus:border-[#13834e] focus:ring-2 focus:ring-[#13834e]/10"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#102d29]"
                >
                  <LuX size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="mt-6">
            <BookingTabs
              activeTab={activeTab}
              onChange={setActiveTab}
              counts={counts}
            />
          </div>

          <div className="mt-6">
            {errorMessage && (
              <p role="alert" className="mb-4 text-sm text-red-600">
                {errorMessage}
              </p>
            )}
            <BookingList
              bookings={filteredBookings}
              hasSearch={search.trim().length > 0}
              onViewDetails={setSelectedBooking}
            />
          </div>

          {filteredBookings.length > 0 && (
            <p className="mt-5 text-xs text-gray-400">
              Showing {filteredBookings.length}{" "}
              {filteredBookings.length === 1 ? "booking" : "bookings"}
            </p>
          )}
        </div>
      </div>

      <BookingDetailsModal
        booking={selectedBooking}
        onClose={closeModal}
      />
    </div>
  );
}

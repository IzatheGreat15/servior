
"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LuCalendarCheck, LuClock, LuPlus } from "react-icons/lu";
import { Booking, mockBookings } from "../../bookings/types";
import BookingCard, { getSessionDuration } from "../../bookings/BookingCard";
import BookingDetailsModal from "../../bookings/BookingDetailsModal";

// Replace these imports with your existing booking data and types.
// import { useBookings } from "@/hooks/useBookings";
// import type { Booking } from "@/types/booking";

export default function MemberDashboardPage() {
  const router = useRouter();

  // Replace with your existing bookings hook or server-fetched data.
  // const { bookings, loading } = useBookings();
  const bookings: Booking[] = mockBookings; // Replace with real booking data.
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(
    null
  );

  const upcomingBookings = useMemo(() => {
    const now = new Date();

    return bookings
      .filter(
        (booking) =>
          booking.status === "confirmed" &&
          booking.sessions.some(
            (session) => new Date(session.date) >= now,
          ),
      )
      .sort(
        (a, b) =>
          new Date(a.sessions[0]?.date ?? 0).getTime() -
          new Date(b.sessions[0]?.date ?? 0).getTime(),
      )
      .slice(0, 3);
  }, [bookings]);

  const totalHours = upcomingBookings.reduce(
    (total, booking) =>
      total + booking.sessions.reduce(
        (hours, session) => hours + getSessionDuration(session),
        0,
      ),
    0,
  );

  const closeModal = useCallback(() => {
    setSelectedBooking(null);
  }, []);

  return (
    <main className="space-y-8">
      {/* Welcome header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mt-1 text-2xl font-bold text-[#102d29] sm:text-3xl">
            Welcome back!
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage your bookings and get ready to play.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/booking")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#13834e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#106b40]"
        >
          <LuPlus size={18} />
          Book a court
        </button>
      </section>

      {/* Summary stats */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="Upcoming bookings"
          value={upcomingBookings.length.toString()}
          icon={<LuCalendarCheck size={22} />}
        />
        <StatCard
          label="Hours booked"
          value={`${totalHours} hrs`}
          icon={<LuClock size={22} />}
        />
      </section>

      {/* Upcoming bookings */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[#102d29]">
              Upcoming bookings
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Your next court sessions.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/my-bookings")}
            className="shrink-0 text-sm font-semibold text-[#13834e] hover:underline"
          >
            View all
          </button>
        </div>

        {upcomingBookings.length > 0 ? (
          <div className="space-y-4">
            {upcomingBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onViewDetails={setSelectedBooking}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#d8e2dc] bg-white px-6 py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f4ec] text-[#13834e]">
              <LuCalendarCheck size={24} />
            </div>
            <h3 className="mt-4 font-semibold text-[#102d29]">
              No upcoming bookings
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Find a court and book your next game.
            </p>
            <button
              type="button"
              onClick={() => router.push("/booking")}
              className="mt-5 rounded-xl bg-[#13834e] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#106b40]"
            >
              Book a court
            </button>
          </div>
        )}
      </section>

      <BookingDetailsModal
        booking={selectedBooking}
        onClose={closeModal}
      />
    </main>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#d8e2dc] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{label}</p>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f4ec] text-[#13834e]">
          {icon}
        </span>
      </div>
      <p className="mt-4 text-3xl font-bold text-[#102d29]">{value}</p>
    </div>
  );
}

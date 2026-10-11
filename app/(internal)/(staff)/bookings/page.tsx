"use client";

import BookingsTable from "@/components/internal/admin/dashboard/BookingsTable";
import { Booking, mockBookings } from "@/components/internal/bookings/types";
import { useState } from "react";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-[#102d29]">
          Bookings
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage all venue bookings.
        </p>
      </div>

      {/* Bookings table */}
      <BookingsTable
        bookings={bookings}
      />
    </div>
  );
}

"use client";

import BookingsTable from "@/components/internal/admin/dashboard/BookingsTable";
import type { Booking } from "@/components/internal/bookings/types";
import { useEffect, useState } from "react";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadBookings() {
      try {
        const response = await fetch("/api/bookings?pageSize=1000", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) {
          setErrorMessage(
            response.status === 401 || response.status === 403
              ? "Sign in with staff access to view bookings."
              : "Bookings could not be loaded.",
          );
          return;
        }

        const result = (await response.json()) as { items?: Booking[] };
        if (!Array.isArray(result.items)) {
          setErrorMessage("Bookings could not be loaded.");
          return;
        }
        setBookings(result.items);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setErrorMessage("Bookings could not be loaded.");
      }
    }

    void loadBookings();
    return () => controller.abort();
  }, []);

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

      {errorMessage && <p role="alert" className="text-sm text-red-600">{errorMessage}</p>}

      {/* Bookings table */}
      <BookingsTable
        bookings={bookings}
      />
    </div>
  );
}

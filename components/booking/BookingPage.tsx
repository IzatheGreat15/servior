"use client"

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import BookingHeader from "./BookingHeader";
import BookingFilters from "./BookingFilters";
import AvailabilityCalendar from "./AvailabilityCalendar";
import BookingSummary from "./BookingSummary";
import type { BookingSelection } from "./types";
import { formatDate } from "./types";
import type {
  BookingAvailability,
  BookingBranch,
  BookingCourt,
  BookingOptions,
  UnavailableSlot,
} from "@/lib/booking/options";

function localDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function subscribeToDateChanges(onChange: () => void) {
  window.addEventListener("focus", onChange);
  document.addEventListener("visibilitychange", onChange);

  return () => {
    window.removeEventListener("focus", onChange);
    document.removeEventListener("visibilitychange", onChange);
  };
}

function getTodaySnapshot() {
  return localDateString(new Date());
}

function getServerDateSnapshot() {
  return "";
}

export default function BookingPage() {
  const [branch, setBranch] = useState("");
  const [sport, setSport] = useState("");
  const today = useSyncExternalStore(
    subscribeToDateChanges,
    getTodaySnapshot,
    getServerDateSnapshot
  );
  const [date, setDate] = useState("");
  const bookingDate = date || today;
  const [selected, setSelected] = useState<BookingSelection[]>([]);
  const [branches, setBranches] = useState<BookingBranch[]>([]);
  const [courts, setCourts] = useState<BookingCourt[]>([]);
  const [unavailableSlots, setUnavailableSlots] = useState<UnavailableSlot[]>([]);
  const [availabilityVersion, setAvailabilityVersion] = useState(0);
  const [optionsError, setOptionsError] = useState("");
  const [availabilityError, setAvailabilityError] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      try {
        const response = await fetch("/api/booking/options", {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("options");

        const options = (await response.json()) as BookingOptions;
        const initialBranch = options.branches[0];
        if (!initialBranch?.sports.length || !options.sports.length) {
          throw new Error("empty-options");
        }

        if (!cancelled) {
          setBranches(options.branches);
          setBranch(initialBranch.name);
          setSport(initialBranch.sports[0].name);
        }
      } catch {
        if (!cancelled) {
          setOptionsError(
            "Booking options could not be loaded. Please try again later."
          );
        }
      }
    }

    void loadOptions();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedBranch = branches.find((option) => option.name === branch);
  const selectedSport = selectedBranch?.sports.find(
    (option) => option.name === sport
  );

  useEffect(() => {
    if (!selectedBranch || !selectedSport || !bookingDate) return;

    const branchId = selectedBranch.id;
    const sportId = selectedSport.id;
    const controller = new AbortController();

    async function loadAvailability() {
      try {
        const params = new URLSearchParams({
          date: bookingDate,
          sportId,
        });
        const response = await fetch(
          `/api/branches/${branchId}/availability?${params}`,
          { cache: "no-store", signal: controller.signal }
        );
        if (!response.ok) throw new Error("availability");

        const availability =
          (await response.json()) as BookingAvailability;
        setCourts(availability.courts);
        setUnavailableSlots(availability.unavailableSlots);
        setAvailabilityError("");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setCourts([]);
        setUnavailableSlots([]);
        setAvailabilityError(
          "Court availability could not be loaded. Please try again."
        );
      }
    }

    void loadAvailability();
    return () => controller.abort();
  }, [bookingDate, selectedBranch, selectedSport, availabilityVersion]);

  const dateLabel = useMemo(() => formatDate(bookingDate), [bookingDate]);
  const selectedHours = useMemo(
    () => selected.reduce((sum, item) => sum + item.endHour - item.startHour, 0),
    [selected]
  );
  const totalAmount = useMemo(
    () =>
      selected.reduce((total, item) => {
        const court = courts.find((option) => option.id === item.courtId);
        return total + (court?.pricePerHour ?? 0) * (item.endHour - item.startHour);
      }, 0),
    [courts, selected]
  );

  function toggleSlot(courtId: string, hour: number) {
    if (
      unavailableSlots.some(
        (slot) => slot.courtId === courtId && slot.startHour === hour
      )
    ) return;
    setSelected((current) => {
      const exists = current.some((item) => item.courtId === courtId && hour >= item.startHour && hour < item.endHour);
      // Keep each selected hour as a discrete slot; this makes individual hours easy to remove.
      if (exists) return current.filter((item) => !(item.courtId === courtId && hour >= item.startHour && hour < item.endHour));
      const courtName = courts.find((court) => court.id === courtId)?.name ?? courtId;
      return [...current, { courtId, courtName, startHour: hour, endHour: hour + 1 }]
        .sort((a, b) => a.startHour - b.startHour || a.courtName.localeCompare(b.courtName));
    });
  }

  function removeSlot(courtId: string, startHour: number) {
    setSelected((current) => current.filter((item) => !(item.courtId === courtId && item.startHour === startHour)));
  }

  function changeDate(days: number) {
    if (!bookingDate) return;
    const next = new Date(`${bookingDate}T12:00:00`);
    next.setDate(next.getDate() + days);

    const nextDate = localDateString(next);
    const today = localDateString(new Date());

    if (nextDate < today) return;

    setDate(nextDate);
    setSelected([]);
    setBookingSuccess("");
  }

  function changeBranch(value: string) {
    const nextBranch = branches.find((option) => option.name === value);
    setBranch(value);
    setSport(nextBranch?.sports[0]?.name ?? "");
    setSelected([]);
    setBookingSuccess("");
  }

  function changeSport(value: string) {
    setSport(value);
    setSelected([]);
    setBookingSuccess("");
  }

  async function submitGuestDetails(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setBookingError("");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify({
          branchId: selectedBranch?.id,
          sportId: selectedSport?.id,
          date: bookingDate,
          slots: selected.map((item) => ({
            courtId: item.courtId,
            startHour: item.startHour,
          })),
          guest: {
            name: guestName,
            email: guestEmail,
            phone: guestPhone || undefined,
          },
        }),
      });

      if (response.status === 409) {
        setBookingError(
          "One or more selected times were just booked. Refresh availability and try again."
        );
        setAvailabilityVersion((version) => version + 1);
        return;
      }
      if (!response.ok) {
        setBookingError(
          "Your booking hold could not be created. Please try again."
        );
        return;
      }

      const booking = (await response.json()) as {
        id: string;
        expiresAt: string;
      };
      setBookingSuccess(
        `Booking hold ${booking.id} created. It expires at ${new Date(
          booking.expiresAt
        ).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}.`
      );
      setShowGuestForm(false);
      setSelected([]);
      setGuestName("");
      setGuestEmail("");
      setGuestPhone("");
      setAvailabilityVersion((version) => version + 1);
    } catch {
      setBookingError(
        "The booking service could not be reached. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }


  return (
    <main className="relative min-h-screen overflow-hidden bg-brand-background text-gray-300">
      {/* Background overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=2200&q=85')",
        }}
      />

      <div className="absolute inset-0 bg-brand-dark/40" />

      <div className="relative z-10 mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-10">
        <BookingHeader />

        <section className="mb-8 mt-10 px-5">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-green-400">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            YOUR NEXT GAME STARTS HERE
          </div>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Book your court<span className="text-brand">.</span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-greay-300 sm:text-base">
            Choose a branch, sport, and time. Select multiple slots if you need
            a longer session or want to book more than one court.
          </p>
        </section>

        {(optionsError || availabilityError) && (
          <p
            className="mx-5 mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800"
            role="alert"
          >
            {optionsError || availabilityError}
          </p>
        )}

        {bookingSuccess && (
          <p
            className="mx-5 mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-900"
            role="status"
          >
            {bookingSuccess}
          </p>
        )}

        <BookingFilters
          branch={branch}
          setBranch={changeBranch}
          sport={sport}
          setSport={changeSport}
          date={bookingDate}
          today={today}
          setDate={(value) => {
            setDate(value);
            setSelected([]);
          }}
          branches={branches.map((option) => option.name)}
          sports={selectedBranch?.sports.map((option) => option.name) ?? []}
          onDateStep={changeDate}
        />

        <div className="mt-8 grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="min-w-0 rounded-2xl p-4 sm:p-6 sm:py-0">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-gray-300">
                  Choose your time
                </h2>
                <p className="mt-1 text-sm text-gray-300">
                  Tap an available hour to select or deselect it.
                </p>
              </div>

              <span className="rounded-full bg-brand-light px-3 py-1.5 text-xs font-semibold text-brand-dark">
                All times local
              </span>
            </div>

            <AvailabilityCalendar
              selected={selected}
              courts={courts}
              unavailableSlots={unavailableSlots}
              onToggle={toggleSlot}
            />
          </section>

          <BookingSummary
            branch={branch}
            sport={sport}
            dateLabel={dateLabel}
            selected={selected}
            totalAmount={totalAmount}
            onRemove={removeSlot}
            onClear={() => setSelected([])}
            onContinue={() => setShowGuestForm(true)}
          />
        </div>

        <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-brand-border py-2 text-sm text-gray-300">
          <div className="flex gap-2 items-center">
            <span className="text-gray-200">Powered by</span>
            <img
              src="/servior-name-white-logo.png"
              alt="Servior"
              className="w-16 object-contain"
            />
          </div>
          <span className="text-gray-200">Book. Play. Repeat.</span>
        </footer>
      </div>


      {showGuestForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowGuestForm(false);
          }}
        >
          <section
            className="relative my-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="guest-modal-title"
          >
            <button
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-2xl text-gray-300 transition hover:bg-slate-100 hover:text-gray-300"
              type="button"
              onClick={() => setShowGuestForm(false)}
              aria-label="Close"
            >
              ×
            </button>

            <span className="text-xs font-bold tracking-[0.2em] text-brand">
              ONE LAST STEP
            </span>

            <h2
              id="guest-modal-title"
              className="mt-3 text-2xl font-bold text-gray-300"
            >
              Your booking details
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-300">
              You can book as a guest—no account or login required.
            </p>

            {bookingError && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">
              {bookingError}
            </p>
            )}

            <div className="mt-5 rounded-xl bg-brand-light p-3 text-sm font-medium text-brand-dark">
              {selected.length} selected slot(s) · {selectedHours} court-hour(s) · {dateLabel}
            </div>

            <form onSubmit={submitGuestDetails} className="mt-6 space-y-4">
              <label className="block text-sm font-semibold text-slate-700">
                Full name
                <input
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Alex Santos"
                  autoComplete="name"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none transition placeholder:text-gray-200 focus:border-brand focus:ring-2 focus:ring-brand/15"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Email address
                <input
                  required
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none transition placeholder:text-gray-200 focus:border-brand focus:ring-2 focus:ring-brand/15"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Mobile number <span className="font-normal text-gray-200">Optional</span>
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="+63 9XX XXX XXXX"
                  autoComplete="tel"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none transition placeholder:text-gray-200 focus:border-brand focus:ring-2 focus:ring-brand/15"
                />
              </label>

              <button
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3.5 font-semibold text-white transition hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating hold..." : "Create booking hold"}{" "}
                {!isSubmitting && <span aria-hidden="true">→</span>}
              </button>
            </form>
          </section>
        </div>
      )}

    </main>
  );

}

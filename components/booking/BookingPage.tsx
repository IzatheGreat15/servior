"use client";

import { useEffect, useMemo, useState } from "react";
import BookingHeader from "./BookingHeader";
import BookingFilters from "./BookingFilters";
import AvailabilityCalendar from "./AvailabilityCalendar";
import BookingSummary from "./BookingSummary";
import type { BookingSelection } from "./types";
import { COURTS, formatDate, START_HOUR, UNAVAILABLE } from "./types";

const BRANCHES = ["Greenfield Sports Center", "Riverside Courts", "Central Sports Hub"];
const SPORTS = ["Pickleball", "Badminton", "Tennis", "Basketball"];

function localDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function BookingPage() {
  const [branch, setBranch] = useState(BRANCHES[0]);
  const [sport, setSport] = useState(SPORTS[0]);
  const [date, setDate] = useState("");
  const [selected, setSelected] = useState<BookingSelection[]>([]);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  useEffect(() => {
    setDate(localDateString(new Date()));
  }, []);

  const dateLabel = useMemo(() => formatDate(date), [date]);
  const selectedHours = useMemo(
    () => selected.reduce((sum, item) => sum + item.endHour - item.startHour, 0),
    [selected]
  );

  function toggleSlot(courtId: string, hour: number) {
    if ((UNAVAILABLE[courtId] ?? []).includes(hour)) return;
    setSelected((current) => {
      const exists = current.some((item) => item.courtId === courtId && hour >= item.startHour && hour < item.endHour);
      // Keep each selected hour as a discrete slot; this makes individual hours easy to remove.
      if (exists) return current.filter((item) => !(item.courtId === courtId && hour >= item.startHour && hour < item.endHour));
      const courtName = COURTS.find((court) => court.id === courtId)?.name ?? courtId;
      return [...current, { courtId, courtName, startHour: hour, endHour: hour + 1 }]
        .sort((a, b) => a.startHour - b.startHour || a.courtName.localeCompare(b.courtName));
    });
  }

  function removeSlot(courtId: string, startHour: number) {
    setSelected((current) => current.filter((item) => !(item.courtId === courtId && item.startHour === startHour)));
  }

  function changeDate(days: number) {
    const next = new Date(`${date}T12:00:00`);
    next.setDate(next.getDate() + days);

    const nextDate = localDateString(next);
    const today = localDateString(new Date());

    if (nextDate < today) return;

    setDate(nextDate);
    setSelected([]);
  }

  function changeBranch(value: string) {
    setBranch(value);
    setSelected([]);
  }

  function changeSport(value: string) {
    setSport(value);
    setSelected([]);
  }

  function submitGuestDetails(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const bookingDraft = {
      branch, sport, date, selections: selected,
      guest: { name: guestName, email: guestEmail, phone: guestPhone },
    };
    // Demo behaviour: replace with a Server Action/API call that creates a temporary booking hold.
    alert(`Booking details captured for ${guestName}.\\n${selectedHours} court-hour(s) selected.\\nConnect this form to your booking API to save the reservation.`);
    console.info("Servior booking draft:", bookingDraft);
    setShowGuestForm(false);
  }


  return (
    <main className="relative min-h-screen overflow-hidden bg-brand-background text-slate-900">
      {/* Background overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `
          linear-gradient(
            90deg,
            rgba(245, 251, 247, 0.75) 40%,
            rgba(245, 251, 247, 0.60) 100%,
            rgba(245, 251, 247, 0.40) 100%
          ),
          url("https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=2200&q=85")
        `,
          backgroundAttachment: "fixed",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-10">
        <BookingHeader />

        <section className="mb-8 mt-10 px-5">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-brand">
            <span className="h-2 w-2 rounded-full bg-brand" />
            YOUR NEXT GAME STARTS HERE
          </div>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Book your court<span className="text-brand">.</span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Choose a branch, sport, and time. Select multiple slots if you need
            a longer session or want to book more than one court.
          </p>
        </section>

        <BookingFilters
          branch={branch}
          setBranch={changeBranch}
          sport={sport}
          setSport={changeSport}
          date={date}
          setDate={(value) => {
            setDate(value);
            setSelected([]);
          }}
          branches={BRANCHES}
          sports={SPORTS}
          onDateStep={changeDate}
        />

        <div className="mt-8 grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="min-w-0 rounded-2xl p-4 sm:p-6 sm:py-0">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Choose your time
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Tap an available hour to select or deselect it.
                </p>
              </div>

              <span className="rounded-full bg-brand-light px-3 py-1.5 text-xs font-semibold text-brand-dark">
                All times local
              </span>
            </div>

            <AvailabilityCalendar
              selected={selected}
              onToggle={toggleSlot}
            />
          </section>

          <BookingSummary
            branch={branch}
            sport={sport}
            dateLabel={dateLabel}
            selected={selected}
            onRemove={removeSlot}
            onClear={() => setSelected([])}
            onContinue={() => setShowGuestForm(true)}
          />
        </div>

        <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-brand-border py-2 text-sm text-slate-500">
          <div className="flex gap-2 items-center">
            <img src="/servior-logo.png" alt="" className="h-8 w-8 object-contain" />
            <span>Powered by</span>
            <img
              src="/servior-name-logo.png"
              alt="Servior"
              className="w-16 object-contain"
            />
          </div>
          <span className="text-slate-400">Book. Play. Repeat.</span>
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
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-2xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
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
              className="mt-3 text-2xl font-bold text-slate-900"
            >
              Your booking details
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              You can book as a guest—no account or login required.
            </p>

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
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/15"
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
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/15"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Mobile number <span className="font-normal text-slate-400">Optional</span>
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="+63 9XX XXX XXXX"
                  autoComplete="tel"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/15"
                />
              </label>

              <button
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3.5 font-semibold text-white transition hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
                type="submit"
              >
                Continue to payment <span aria-hidden="true">→</span>
              </button>
            </form>
          </section>
        </div>
      )}

    </main>
  );

}

"use client";

import { useEffect, useMemo, useState } from "react";
import BookingHeader from "./BookingHeader";
import BookingFilters from "./BookingFilters";
import AvailabilityCalendar from "./AvailabilityCalendar";
import BookingSummary from "./BookingSummary";
import type { BookingSelection } from "./types";
import { COURTS, formatDate, START_HOUR, UNAVAILABLE } from "./types";
import "./booking.css";

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
    <main className="booking-page">
      <div className="photo-overlay" aria-hidden="true" />
      <div className="booking-shell">
        <BookingHeader />
        <section className="booking-intro">
          <div className="eyebrow"><span /> YOUR NEXT GAME STARTS HERE</div>
          <h1>Book your court<span>.</span></h1>
          <p>Choose a branch, sport, and time. Select multiple slots if you need a longer session or want to book more than one court.</p>
        </section>

        <BookingFilters
          branch={branch} setBranch={changeBranch}
          sport={sport} setSport={changeSport}
          date={date} setDate={(value) => { setDate(value); setSelected([]); }}
          branches={BRANCHES} sports={SPORTS} onDateStep={changeDate}
        />

        <div className="booking-layout">
          <section className="availability-section">
            <div className="calendar-title-row">
              <div><h2>Choose your time</h2><p>Tap an available hour to select or deselect it.</p></div>
              <span className="timezone-label">All times local</span>
            </div>
            <AvailabilityCalendar selected={selected} onToggle={toggleSlot} />
          </section>
          <BookingSummary
            branch={branch} sport={sport} dateLabel={dateLabel}
            selected={selected} onRemove={removeSlot}
            onClear={() => setSelected([])}
            onContinue={() => setShowGuestForm(true)}
          />
        </div>

        <footer className="booking-footer">
          <span className="footer-brand">
            <img src='/servior-logo.png' alt="Servior" className="w-9" />
          </span> 
          Powered by
          <img src='/servior-name-logo.png' alt="Servior" className="w-14" />
          <span>Book. Play. Repeat.</span>
        </footer>
      </div>

      {showGuestForm && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowGuestForm(false); }}>
          <section className="guest-modal" role="dialog" aria-modal="true" aria-labelledby="guest-modal-title">
            <button className="modal-close" type="button" onClick={() => setShowGuestForm(false)} aria-label="Close">×</button>
            <span className="modal-kicker">ONE LAST STEP</span>
            <h2 id="guest-modal-title">Your booking details</h2>
            <p>You can book as a guest—no account or login required.</p>
            <div className="modal-booking-chip">{selected.length} selected slot(s) · {selectedHours} court-hour(s) · {dateLabel}</div>
            <form onSubmit={submitGuestDetails}>
              <label>Full name<input required value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="e.g. Alex Santos" autoComplete="name" /></label>
              <label>Email address<input required type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" /></label>
              <label>Mobile number <span className="optional-label">Optional</span><input type="tel" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="+63 9XX XXX XXXX" autoComplete="tel" /></label>
              <button className="continue-button" type="submit">Continue to payment <span>→</span></button>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

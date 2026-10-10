
"use client";

import { useEffect } from "react";
import {
  LuX,
  LuCalendarDays,
  LuClock3,
  LuMapPin,
  LuReceipt,
  LuCircleAlert,
} from "react-icons/lu";
import { Booking, BookingSession } from "./types";
import { IoMdCheckmarkCircle } from "react-icons/io";

type BookingDetailsModalProps = {
  booking: Booking | null;
  onClose: () => void;
};

function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-PH", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date(2000, 0, 1, hours, minutes);

  return date.toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function durationInHours(session: BookingSession) {
  const [sh, sm] = session.startTime.split(":").map(Number);
  const [eh, em] = session.endTime.split(":").map(Number);

  return (eh * 60 + em - sh * 60 - sm) / 60;
}

function formatHours(hours: number) {
  return `${Number(hours.toFixed(2))} ${hours === 1 ? "hour" : "hours"}`;
}

export default function BookingDetailsModal({
  booking,
  onClose,
}: BookingDetailsModalProps) {
  useEffect(() => {
    if (!booking) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [booking, onClose]);

  if (!booking) return null;

  const sessions = [...booking.sessions].sort((a, b) =>
    `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`)
  );

  const totalPrice = sessions.reduce(
    (total, session) => total + session.price,
    0
  );

  const totalHours = sessions.reduce(
    (total, session) => total + durationInHours(session),
    0
  );

  const paymentIcon =
    booking.paymentStatus === "paid" ? IoMdCheckmarkCircle : LuCircleAlert;

  const PaymentIcon = paymentIcon;

  return (
    <div
      className="scrollbar-hide fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-[#d8e2dc] bg-white p-5 sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#13834e]">
              Booking details
            </p>
            <h2
              id="booking-modal-title"
              className="mt-1 text-xl font-bold text-[#102d29]"
            >
              {booking.venueName}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {booking.reference}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close booking details"
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-[#102d29]"
          >
            <LuX size={21} />
          </button>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-[#f7faf8] p-4">
              <p className="text-xs text-gray-500">Booking status</p>
              <p className="mt-2 font-semibold capitalize text-[#102d29]">
                {booking.status}
              </p>
            </div>

            <div className="rounded-xl bg-[#f7faf8] p-4">
              <p className="text-xs text-gray-500">Payment status</p>
              <p className="mt-2 flex items-center gap-2 font-semibold capitalize text-[#102d29]">
                <PaymentIcon
                  size={17}
                  className={
                    booking.paymentStatus === "paid"
                      ? "text-[#13834e]"
                      : "text-amber-600"
                  }
                />
                {booking.paymentStatus}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-[#102d29]">Venue information</h3>

            <div className="mt-3 rounded-xl border border-[#d8e2dc] p-4">
              <p className="font-semibold text-[#102d29]">
                {booking.branchName}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {booking.sport} · {booking.courtName}
              </p>
              <p className="mt-3 flex items-start gap-2 text-sm text-gray-500">
                <LuMapPin size={16} className="mt-0.5 shrink-0" />
                {booking.address}
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-bold text-[#102d29]">Booked sessions</h3>
              <span className="rounded-full bg-[#e8f4ec] px-3 py-1 text-xs font-semibold text-[#13834e]">
                {sessions.length}{" "}
                {sessions.length === 1 ? "session" : "sessions"}
              </span>
            </div>

            <div className="mt-3 space-y-3">
              {sessions.map((session, index) => (
                <div
                  key={session.id}
                  className="flex flex-col gap-3 rounded-xl border border-[#d8e2dc] p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e8f4ec] text-[#13834e]">
                      <LuCalendarDays size={20} />
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-400">
                        Session {index + 1}
                      </p>
                      <p className="mt-1 font-semibold text-[#102d29]">
                        {formatDate(session.date)}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                        <LuClock3 size={15} />
                        {formatTime(session.startTime)} –{" "}
                        {formatTime(session.endTime)}
                      </p>
                      {session.status && (
                        <p className="mt-1 text-xs capitalize text-gray-400">
                          {session.status}
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="pl-[52px] font-bold text-[#102d29] sm:pl-0">
                    ₱{session.price.toLocaleString("en-PH")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {booking.notes && (
            <div>
              <h3 className="font-bold text-[#102d29]">Notes</h3>
              <p className="mt-2 rounded-xl bg-[#f7faf8] p-4 text-sm leading-6 text-gray-600">
                {booking.notes}
              </p>
            </div>
          )}

          <div className="rounded-xl bg-[#102d29] p-5 text-white">
            <div className="flex items-center gap-2 text-sm text-white/70">
              <LuReceipt size={17} />
              Booking summary
            </div>

            <div className="mt-4 flex justify-between gap-4 text-sm">
              <span className="text-white/70">Total duration</span>
              <span className="font-semibold">{formatHours(totalHours)}</span>
            </div>

            <div className="mt-3 flex justify-between gap-4 text-sm">
              <span className="text-white/70">Total sessions</span>
              <span className="font-semibold">{sessions.length}</span>
            </div>

            <div className="my-4 border-t border-white/15" />

            <div className="flex items-end justify-between gap-4">
              <span className="text-sm text-white/70">Total amount</span>
              <span className="text-2xl font-bold">
                ₱{totalPrice.toLocaleString("en-PH")}
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Booked on{" "}
            {new Date(`${booking.createdAt}T12:00:00`).toLocaleDateString(
              "en-PH",
              {
                month: "long",
                day: "numeric",
                year: "numeric",
              }
            )}
          </p>
        </div>
      </section>
    </div>
  );
}


"use client";

import {
  LuCalendarDays,
  LuClock3,
  LuMapPin,
  LuChevronRight,
  LuLayers3,
} from "react-icons/lu";
import { Booking, BookingSession } from "./types";

type BookingCardProps = {
  booking: Booking;
  onViewDetails: (booking: Booking) => void;
};

function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-PH", {
    month: "short",
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

function getSessionDuration(session: BookingSession) {
  const [startHours, startMinutes] = session.startTime.split(":").map(Number);
  const [endHours, endMinutes] = session.endTime.split(":").map(Number);

  return (endHours * 60 + endMinutes - startHours * 60 - startMinutes) / 60;
}

function formatHours(hours: number) {
  return `${Number(hours.toFixed(2))} ${hours === 1 ? "hour" : "hours"}`;
}

const statusStyles: Record<string, string> = {
  confirmed: "bg-[#e8f4ec] text-[#13834e]",
  pending: "bg-amber-50 text-amber-700",
  completed: "bg-sky-50 text-sky-700",
  cancelled: "bg-red-50 text-red-600",
};

const paymentStyles: Record<string, string> = {
  paid: "text-[#13834e]",
  unpaid: "text-amber-700",
  refunded: "text-sky-700",
};

export default function BookingCard({
  booking,
  onViewDetails,
}: BookingCardProps) {
  const sessions = [...booking.sessions].sort((a, b) =>
    `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`)
  );

  const firstSession = sessions[0];

  const totalPrice = sessions.reduce(
    (total, session) => total + session.price,
    0
  );

  const totalHours = sessions.reduce(
    (total, session) => total + getSessionDuration(session),
    0
  );

  return (
    <article className="rounded-2xl border border-[#d8e2dc] bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                statusStyles[booking.status]
              }`}
            >
              {booking.status}
            </span>

            <span className="text-xs text-gray-400">
              Ref: {booking.reference}
            </span>
          </div>

          <h3 className="mt-3 text-lg font-bold text-[#102d29]">
            {booking.venueName}
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            {booking.branchName} · {booking.sport} · {booking.courtName}
          </p>

          <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
            <LuMapPin size={15} className="shrink-0" />
            {booking.address}
          </p>
        </div>

        <div className="sm:text-right">
          <p className="text-xs text-gray-400">Total amount</p>
          <p className="mt-1 text-2xl font-bold text-[#102d29]">
            ₱{totalPrice.toLocaleString("en-PH")}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {sessions.length}{" "}
            {sessions.length === 1 ? "session" : "sessions"}
          </p>
        </div>
      </div>

      <div className="my-5 border-t border-[#edf1ee]" />

      {firstSession ? (
        <div className="rounded-xl bg-[#f7faf8] p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e8f4ec] text-[#13834e]">
              <LuCalendarDays size={20} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                {sessions.length > 1 ? "Next session" : "Session date"}
              </p>

              <p className="mt-1 font-semibold text-[#102d29]">
                {formatDate(firstSession.date)}
              </p>

              <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                <LuClock3 size={15} />
                {formatTime(firstSession.startTime)} –{" "}
                {formatTime(firstSession.endTime)}
              </p>
            </div>

            {sessions.length > 1 && (
              <span className="shrink-0 rounded-lg border border-[#d8e2dc] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#13834e]">
                +{sessions.length - 1} more
              </span>
            )}
          </div>
        </div>
      ) : (
        <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
          No sessions available.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
        <span className="flex items-center gap-1.5">
          <LuLayers3 size={16} />
          {formatHours(totalHours)} total
        </span>

        <span>
          Payment:{" "}
          <span
            className={`font-semibold capitalize ${
              paymentStyles[booking.paymentStatus]
            }`}
          >
            {booking.paymentStatus}
          </span>
        </span>
      </div>

      <div className="mt-5 flex justify-end border-t border-[#edf1ee] pt-4">
        <button
          type="button"
          onClick={() => onViewDetails(booking)}
          className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-[#d8e2dc] px-4 py-2.5 text-sm font-semibold text-[#102d29] transition hover:border-[#13834e] hover:bg-[#f7faf8]"
        >
          View booking
          <LuChevronRight size={16} />
        </button>
      </div>
    </article>
  );
}

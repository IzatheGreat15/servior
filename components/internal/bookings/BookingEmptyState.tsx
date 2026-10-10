
import Link from "next/link";
import { LuCalendarDays, LuSearch } from "react-icons/lu";

type BookingEmptyStateProps = {
  hasSearch: boolean;
};

export default function BookingEmptyState({
  hasSearch,
}: BookingEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#d8e2dc] bg-white px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f4ec] text-[#13834e]">
        {hasSearch ? (
          <LuSearch size={28} />
        ) : (
          <LuCalendarDays size={28} />
        )}
      </div>

      <h3 className="text-lg font-bold text-[#102d29]">
        {hasSearch ? "No matching bookings" : "No bookings yet"}
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
        {hasSearch
          ? "Try another search term or clear your search."
          : "Your court reservations will appear here once you book a session."}
      </p>

      {!hasSearch && (
        <Link
          href="/courts"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#13834e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f6e40]"
        >
          Explore courts
        </Link>
      )}
    </div>
  );
}

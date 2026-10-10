import { PiCourtBasketball } from "react-icons/pi";
import { Court } from "./types";

export default function CourtCard({
  court,
  onEdit,
}: {
  court: Court;
  onEdit: () => void;
}) {
  const startingRate = court.rules.length
    ? Math.min(...court.rules.map((rule) => rule.hourlyRate))
    : null;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[#e3ebe6] p-4 transition hover:border-[#b8d7c4] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf8f1] text-xl">
            <PiCourtBasketball />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-bold text-[#102d29]">{court.name}</h4>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                court.active
                  ? "bg-[#e8f5ec] text-[#13834e]"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {court.active ? "Active" : "Inactive"}
            </span>
          </div>

          <p className="mt-1.5 text-sm text-slate-500">
            {court.rules.length
              ? `${court.rules.length} pricing rules configured`
              : "No pricing rules configured"}
          </p>

          <p className="mt-1 text-sm font-semibold text-[#35654d]">
            {startingRate !== null
              ? `From ₱${startingRate.toLocaleString("en-PH")} / hour`
              : "Set hourly pricing"}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onEdit}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#d8e2dc] px-4 py-2.5 text-sm font-bold text-[#29483e] transition hover:border-[#13834e] hover:bg-[#f2faf5]"
      >
        <span aria-hidden="true">✎</span>
        Edit court
      </button>
    </div>
  );
}
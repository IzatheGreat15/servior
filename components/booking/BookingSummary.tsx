import type { BookingSelection } from "./types";
import { formatRange } from "./types";
import { PiCourtBasketballBold } from "react-icons/pi";
import { CgTennis } from "react-icons/cg";
import { FaRegCalendar } from "react-icons/fa";

type Props = {
  branch: string;
  sport: string;
  dateLabel: string;
  selected: BookingSelection[];
  onRemove: (courtId: string, hour: number) => void;
  onClear: () => void;
  onContinue: () => void;
};

export default function BookingSummary({
  branch,
  sport,
  dateLabel,
  selected,
  onRemove,
  onClear,
  onContinue,
}: Props) {
  const hours = selected.reduce(
    (sum, item) => sum + item.endHour - item.startHour,
    0
  );

  // Demo rate only. Replace with the branch/court's configured rate.
  const rate = 400;
  const total = hours * rate;

  return (
    <aside className="overflow-hidden rounded-[18px] border border-[#deece3] bg-white/[0.96] shadow-[0_15px_45px_rgba(22,64,43,0.07)]">
      {/* Heading */}
      <div className="flex items-center gap-3 border-b border-[#edf2ee] px-4 py-4 sm:px-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f4ec] text-[#13834e]">
          <PiCourtBasketballBold size={21} />
        </span>

        <h2 className="min-w-0 flex-1 text-base font-bold tracking-[-0.02em] text-[#102d29]">
          Booking Summary
        </h2>

        <span className="shrink-0 rounded-full border border-[#d6eadd] bg-[#f0f8f3] px-2.5 py-1 text-xs font-semibold text-[#13834e]">
          {selected.length} {selected.length === 1 ? "slot" : "slots"}
        </span>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        {/* Booking details */}
        <div className="space-y-3 rounded-xl border border-[#e5eee8] bg-[#f8fbf9] p-3.5">
          <p className="flex min-w-0 items-start gap-3 text-sm text-[#34483d]">
            <PiCourtBasketballBold
              className="mt-0.5 shrink-0 text-[#6b8276]"
              size={17}
              aria-hidden="true"
            />
            <span className="min-w-0 break-words">{branch}</span>
          </p>

          <p className="flex min-w-0 items-start gap-3 text-sm text-[#34483d]">
            <CgTennis
              className="mt-0.5 shrink-0 text-[#6b8276]"
              size={17}
              aria-hidden="true"
            />
            <span className="min-w-0 break-words">{sport}</span>
          </p>

          <p className="flex min-w-0 items-start gap-3 text-sm text-[#34483d]">
            <FaRegCalendar
              className="mt-0.5 shrink-0 text-[#6b8276]"
              size={15}
              aria-hidden="true"
            />
            <span className="min-w-0 break-words">{dateLabel}</span>
          </p>
        </div>

        {/* Selected time slots */}
        {selected.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-[#d8e5dc] bg-[#fbfdfb] px-4 py-7 text-center">
            <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#e8f4ec] text-2xl font-light text-[#13834e]">
              +
            </span>

            <strong className="text-sm font-semibold text-[#263f35]">
              No time slots selected yet
            </strong>

            <p className="mt-1.5 max-w-[260px] text-xs leading-5 text-[#718579]">
              Choose any available hour in the calendar. You can select
              multiple courts and hours.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#718579]">
              Selected time slots
            </h3>

            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {selected.map((item) => {
                const duration = item.endHour - item.startHour;

                return (
                  <div
                    className="flex items-start gap-3 rounded-xl border border-[#e1ebe5] bg-white p-3 transition-colors hover:border-[#c8dfd0]"
                    key={`${item.courtId}-${item.startHour}`}
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f0f8f3] text-[#13834e]">
                      <PiCourtBasketballBold size={16} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <strong className="block break-words text-sm font-semibold text-[#263f35]">
                        {item.courtName}
                      </strong>

                      <span className="mt-0.5 block text-xs font-medium text-[#13834e]">
                        {formatRange(item.startHour, item.endHour)}
                      </span>

                      <small className="mt-1 block text-xs text-[#809187]">
                        {duration} {duration === 1 ? "hour" : "hours"}
                      </small>
                    </div>

                    <button
                      type="button"
                      aria-label={`Remove ${item.courtName} ${formatRange(
                        item.startHour,
                        item.endHour
                      )}`}
                      onClick={() => onRemove(item.courtId, item.startHour)}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xl leading-none text-[#809187] transition-colors hover:bg-[#fcefed] hover:text-[#b5473c] focus:outline-none focus:ring-2 focus:ring-[#13834e]/20"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pricing */}
        <div className="space-y-3 border-t border-[#e5eee8] pt-4">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-[#718579]">Duration</span>
            <strong className="font-semibold text-[#263f35]">
              {hours} {hours === 1 ? "hour" : "hours"}
            </strong>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-[#34483d]">
              Estimated total
            </span>
            <strong className="text-xl font-bold tracking-[-0.03em] text-[#13834e]">
              ₱{total.toLocaleString("en-PH")}
            </strong>
          </div>

          <p className="text-right text-[11px] text-[#809187]">
            Based on ₱{rate.toLocaleString("en-PH")} per hour
          </p>
        </div>

        {/* Selection tip */}
        <div className="flex items-start gap-2.5 rounded-lg border border-[#e1ebe5] bg-[#f4f9f5] px-3 py-2.5">
          <span
            className="mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[#80b99a] text-[10px] font-bold text-[#13834e]"
            aria-hidden="true"
          >
            i
          </span>

          <p className="text-xs leading-5 text-[#587064]">
            You can select multiple courts and time slots at once.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#13834e] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#106b40] focus:outline-none focus:ring-2 focus:ring-[#13834e]/30 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#b6cbbd] disabled:shadow-none"
            type="button"
            disabled={!selected.length}
            onClick={onContinue}
          >
            Continue
            <span aria-hidden="true" className="text-base">
              →
            </span>
          </button>

          <button
            className="h-10 w-full rounded-lg border border-[#d8e2dc] bg-white px-4 text-sm font-medium text-[#52685b] transition-colors hover:border-[#c4d9cb] hover:bg-[#f4f9f5] hover:text-[#13834e] focus:outline-none focus:ring-2 focus:ring-[#13834e]/15 disabled:cursor-not-allowed disabled:opacity-40"
            type="button"
            disabled={!selected.length}
            onClick={onClear}
          >
            Clear selection
          </button>
        </div>

        <p className="text-center text-xs leading-5 text-[#809187]">
          No account needed to start. Your details will be collected next.
        </p>
      </div>
    </aside>
  );
}

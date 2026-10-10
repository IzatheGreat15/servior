import { Fragment } from "react";
import { PiCourtBasketball } from "react-icons/pi";
import {
  COURTS,
  END_HOUR,
  START_HOUR,
  UNAVAILABLE,
  formatHour,
} from "./types";
import type { BookingSelection } from "./types";

type Props = {
  selected: BookingSelection[];
  onToggle: (courtId: string, hour: number) => void;
};

export default function AvailabilityCalendar({
  selected,
  onToggle,
}: Props) {
  const hours = Array.from(
    { length: END_HOUR - START_HOUR },
    (_, i) => START_HOUR + i
  );

  function isSelected(courtId: string, hour: number) {
    return selected.some(
      (item) =>
        item.courtId === courtId &&
        hour >= item.startHour &&
        hour < item.endHour
    );
  }

  return (
    <div className="rounded-[18px] border border-[#deece3]/95 bg-white/[0.96] px-3 pt-[13px] pb-3 shadow-[0_15px_45px_rgba(22,64,43,0.07)]">
      <div className="overflow-x-auto pb-0.5">
        <div
          className="grid min-w-[700px] gap-[3px]"
          style={{
            gridTemplateColumns: `76px repeat(${COURTS.length}, minmax(92px, 1fr))`,
          }}
        >
          <div className="flex min-h-[49px] items-center justify-start border-b border-[#eaf1ec] pl-2 text-[10px] font-extrabold text-[#405d55]">
            Time
          </div>

          {COURTS.map((court) => (
            <div
              key={court.id}
              className="flex min-h-[49px] flex-col items-center justify-center gap-[3px] border-b border-[#eaf1ec] text-[10px] font-extrabold text-[#405d55]"
            >
              <PiCourtBasketball
                className="text-[#13834e]"
                size={18}
                aria-hidden="true"
              />
              <strong className="text-[10px] font-extrabold">
                {court.name}
              </strong>
            </div>
          ))}

          {hours.map((hour) => (
            <Fragment key={`row-${hour}`}>
              <div className="flex min-h-[39px] items-center whitespace-nowrap border-b border-[#f0f5f1] pl-[5px] text-[10px] text-[#82958f]">
                {formatHour(hour)}
              </div>

              {COURTS.map((court) => {
                const unavailable = (
                  UNAVAILABLE[court.id] ?? []
                ).includes(hour);

                const active = isSelected(court.id, hour);

                return (
                  <button
                    type="button"
                    key={`${court.id}-${hour}`}
                    disabled={unavailable}
                    aria-pressed={active}
                    aria-label={`${court.name}, ${formatHour(hour)}${
                      unavailable
                        ? ", unavailable"
                        : active
                          ? ", selected"
                          : ", available"
                    }`}
                    title={
                      unavailable
                        ? "Already booked"
                        : active
                          ? "Click to deselect this hour"
                          : "Select this hour"
                    }
                    onClick={() => onToggle(court.id, hour)}
                    className={`relative min-h-[39px] rounded-[7px] border font-[inherit] transition-[background-color,border-color,transform] duration-[140ms] ${
                      unavailable
                        ? "cursor-not-allowed border-[#167c4a] bg-[#167c4a] text-white"
                        : active
                          ? "border-[#13834e] bg-[#c9f3da] text-[#12633d] shadow-[inset_0_0_0_1px_rgba(19,131,78,0.1)]"
                          : "border-transparent bg-[#f0f8f3] text-[#5c9e7e] hover:-translate-y-px hover:border-[#8bceaa] hover:bg-[#d9f3e3]"
                    }`}
                  >
                    {unavailable ? (
                      <>
                        <span className="text-[11px] font-semibold text-white">
                          Booked
                        </span>
                        <span className="absolute top-1 right-[7px] text-[8px] text-white/70">
                          ●
                        </span>
                      </>
                    ) : active ? (
                      <>
                        <span className="absolute top-[3px] right-[5px] grid h-[14px] w-[14px] place-items-center rounded-full bg-[#13834e] text-[9px] font-extrabold text-white">
                          ✓
                        </span>
                        <span className="text-[11px] font-semibold">
                          Selected
                        </span>
                      </>
                    ) : (
                      <span className="text-[11px] font-semibold">
                        Available
                      </span>
                    )}
                  </button>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2 pt-[14px] px-[5px] pb-[2px] text-[10px] text-[#657d74]">
        <span className="flex items-center gap-[6px]">
          <i className="inline-block h-2 w-2 rounded-[3px] bg-[#ccebd8]" />
          Available
        </span>

        <span className="flex items-center gap-[6px]">
          <i className="inline-block h-2 w-2 rounded-[3px] bg-[#167c4a]" />
          Unavailable
        </span>

        <span className="flex items-center gap-[6px]">
          <i className="inline-block h-2 w-2 rounded-[3px] border border-[#13834e] bg-[#8ee0af]" />
          Selected
        </span>
      </div>
    </div>
  );
}

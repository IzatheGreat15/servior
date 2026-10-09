import { PiCourtBasketball } from "react-icons/pi";
import { COURTS, END_HOUR, START_HOUR, UNAVAILABLE, formatHour } from "./types";
import type { BookingSelection } from "./types";

type Props = {
  selected: BookingSelection[];
  onToggle: (courtId: string, hour: number) => void;
};

export default function AvailabilityCalendar({ selected, onToggle }: Props) {
  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

  function isSelected(courtId: string, hour: number) {
    return selected.some((item) => item.courtId === courtId && hour >= item.startHour && hour < item.endHour);
  }

  return (
    <div className="calendar-card">
      <div className="calendar-scroll">
        <div className="calendar-grid" style={{ gridTemplateColumns: `76px repeat(${COURTS.length}, minmax(92px, 1fr))` }}>
          <div className="time-heading">Time</div>
          {COURTS.map((court) => (
            <div className="court-heading" key={court.id}>
              <span className="court-icon" aria-hidden="true">
                <PiCourtBasketball />
              </span>
              <strong>{court.name}</strong>
            </div>
          ))}
          {hours.map((hour) => (
            <div className="calendar-row-fragment" key={`row-${hour}`} style={{ display: "contents" }}>
              <div className="time-label" key={`time-${hour}`}>{formatHour(hour)}</div>
              {COURTS.map((court) => {
                const unavailable = (UNAVAILABLE[court.id] ?? []).includes(hour);
                const active = isSelected(court.id, hour);
                return (
                  <button
                    type="button"
                    key={`${court.id}-${hour}`}
                    className={`slot ${unavailable ? "slot-unavailable" : active ? "slot-selected" : ""}`}
                    disabled={unavailable}
                    aria-pressed={active}
                    aria-label={`${court.name}, ${formatHour(hour)}${unavailable ? ", unavailable" : active ? ", selected" : ", available"}`}
                    onClick={() => onToggle(court.id, hour)}
                    title={unavailable ? "Already booked" : active ? "Click to deselect this hour" : "Select this hour"}
                  >
                    {unavailable ? <><span className="slot-state">Booked</span><span className="slot-lock">●</span></> :
                      active ? <><span className="slot-check">✓</span><span className="slot-state">Selected</span></> :
                      <span className="slot-state">Available</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="calendar-legend">
        <span><i className="legend-dot available" /> Available</span>
        <span><i className="legend-dot booked" /> Unavailable</span>
        <span><i className="legend-dot chosen" /> Selected</span>
      </div>
    </div>
  );
}

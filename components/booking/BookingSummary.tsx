import { PiCourtBasketball, PiCourtBasketballBold } from "react-icons/pi";
import type { BookingSelection } from "./types";
import { formatRange } from "./types";
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

export default function BookingSummary({ branch, sport, dateLabel, selected, onRemove, onClear, onContinue }: Props) {
  const hours = selected.reduce((sum, item) => sum + item.endHour - item.startHour, 0);
  // Demo rate only. Replace with the branch/court's configured rate.
  const rate = 400;
  const total = hours * rate;

  return (
    <aside className="summary-card">
      <div className="summary-heading">
        <span className="summary-icon">▦</span>
        <h2>Booking Summary</h2>
        <span className="count-pill">{selected.length} {selected.length === 1 ? "slot" : "slots"}</span>
      </div>
      <div className="summary-meta">
        <p><span><PiCourtBasketballBold /></span>{branch}</p>
        <p><span><CgTennis /></span>{sport}</p>
        <p><span><FaRegCalendar /></span>{dateLabel}</p>
      </div>

      {selected.length === 0 ? (
        <div className="empty-summary">
          <span className="empty-icon">＋</span>
          <strong>No time slots selected yet</strong>
          <p>Choose any available hour in the calendar. You can select multiple courts and hours.</p>
        </div>
      ) : (
        <div className="selection-list">
          {selected.map((item) => (
            <div className="selection-item" key={`${item.courtId}-${item.startHour}`}>
              <div>
                <strong>{item.courtName}</strong>
                <span>{formatRange(item.startHour, item.endHour)}</span>
                <small>{item.endHour - item.startHour} {(item.endHour - item.startHour) === 1 ? "hour" : "hours"}</small>
              </div>
              <button type="button" aria-label={`Remove ${item.courtName} ${formatRange(item.startHour, item.endHour)}`} onClick={() => onRemove(item.courtId, item.startHour)}>×</button>
            </div>
          ))}
        </div>
      )}

      <div className="summary-total">
        <div><span>Duration</span><strong>{hours} {hours === 1 ? "hour" : "hours"}</strong></div>
        <div><span>Estimated total</span><strong>₱{total.toLocaleString("en-PH")}</strong></div>
      </div>

      <div className="selection-tip"><span>ⓘ</span><p>You can select multiple courts and time slots at once.</p></div>
      <button className="continue-button" type="button" disabled={!selected.length} onClick={onContinue}>Continue <span>→</span></button>
      <button className="clear-button" type="button" disabled={!selected.length} onClick={onClear}>Clear selection</button>
      <p className="guest-note">No account needed to start. Your details will be collected next.</p>
    </aside>
  );
}

import { PiCourtBasketballBold } from "react-icons/pi";
import CustomSelect from "./CustomSelect";
import { CgTennis } from "react-icons/cg";
import { FaRegCalendar } from "react-icons/fa";
import { useEffect, useState } from "react";

type Props = {
  branch: string;
  setBranch: (value: string) => void;
  sport: string;
  setSport: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
  branches: string[];
  sports: string[];
  onDateStep: (days: number) => void;
};

export default function BookingFilters({
  branch, setBranch, sport, setSport, date, setDate, branches, sports, onDateStep,
}: Props) {
  const [today, setToday] = useState("");

  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    setToday(`${year}-${month}-${day}`);
  }, []);

  return (
    <section className="filters" aria-label="Booking filters">
      <CustomSelect
        label="Branch"
        value={branch}
        options={branches}
        onChange={setBranch}
        icon={PiCourtBasketballBold}
        searchable
      />

      <CustomSelect
        label="Sport"
        value={sport}
        options={sports}
        onChange={setSport}
        icon={CgTennis}
        searchable
      />
      <div className="filter-field">
        <label htmlFor="booking-date">Date</label>
        <div className="filter-control date-control">
          <span className="field-icon" aria-hidden="true">
            <FaRegCalendar />
          </span>
          <input id="booking-date" type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} />
          <button type="button" className="date-step" onClick={() => onDateStep(-1)} aria-label="Previous day">‹</button>
          <button type="button" className="date-step" onClick={() => onDateStep(1)} aria-label="Next day">›</button>
        </div>
      </div>
    </section>
  );
}

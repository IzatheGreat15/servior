import { PiCourtBasketballBold } from "react-icons/pi";
import CustomSelect from "./CustomSelect";
import { CgTennis } from "react-icons/cg";
import { FaRegCalendar } from "react-icons/fa";

type Props = {
  branch: string;
  setBranch: (value: string) => void;
  sport: string;
  setSport: (value: string) => void;
  date: string;
  today: string;
  setDate: (value: string) => void;
  branches: string[];
  sports: string[];
  onDateStep: (days: number) => void;
};

export default function BookingFilters({
  branch,
  setBranch,
  sport,
  setSport,
  date,
  today,
  setDate,
  branches,
  sports,
  onDateStep,
}: Props) {
  return (
    <section
      className="grid grid-cols-1 gap-4 rounded-[18px] p-4 sm:grid-cols-2 sm:px-5 sm:py-2 lg:grid-cols-3"
      aria-label="Booking filters"
    >
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

      {/* Date filter */}
      <div className="flex min-w-0 flex-col gap-1.5">
        <label
          htmlFor="booking-date"
          className="text-sm font-medium text-[#102d29]"
        >
          Date
        </label>

        <div className="flex h-11 min-w-0 items-center gap-2 rounded-lg border border-[#d8e2dc] bg-white px-3 transition-colors focus-within:border-[#13834e] focus-within:ring-2 focus-within:ring-[#13834e]/10">
          <FaRegCalendar
            className="shrink-0 text-[#6b8276]"
            size={16}
            aria-hidden="true"
          />

          <input
            id="booking-date"
            type="date"
            min={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm text-[#263f35] outline-none"
          />

          <button
            type="button"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-lg leading-none text-[#718579] transition-colors hover:bg-[#e8f4ec] hover:text-[#13834e] disabled:cursor-not-allowed disabled:opacity-35"
            onClick={() => onDateStep(-1)}
            disabled={!date || date <= today}
            aria-label="Previous day"
          >
            ‹
          </button>

          <button
            type="button"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-lg leading-none text-[#718579] transition-colors hover:bg-[#e8f4ec] hover:text-[#13834e]"
            onClick={() => onDateStep(1)}
            aria-label="Next day"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}

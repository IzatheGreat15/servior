
"use client";

import { useEffect, useState } from "react";
import { LuCalendarDays, LuRotateCcw } from "react-icons/lu";
import { DashboardPeriod, DateRange } from "./types";

type Props = {
  value: DateRange;
  onApply: (range: DateRange) => void;
};

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getRange(period: DashboardPeriod): DateRange {
  const today = new Date();
  const endDate = formatDate(today);
  const start = new Date(today);

  if (period === "today") {
    return { startDate: endDate, endDate };
  }

  if (period === "7days") {
    start.setDate(start.getDate() - 6);
  } else if (period === "30days") {
    start.setDate(start.getDate() - 29);
  } else {
    start.setDate(1);
  }

  return { startDate: formatDate(start), endDate };
}

export default function DashboardDateFilter({
  value,
  onApply,
}: Props) {
  const [period, setPeriod] = useState<DashboardPeriod>("month");
  const [startDate, setStartDate] = useState(value.startDate);
  const [endDate, setEndDate] = useState(value.endDate);

  useEffect(() => {
    setStartDate(value.startDate);
    setEndDate(value.endDate);
  }, [value]);

  function handlePeriodChange(nextPeriod: DashboardPeriod) {
    setPeriod(nextPeriod);

    if (nextPeriod !== "custom") {
      const range = getRange(nextPeriod);
      setStartDate(range.startDate);
      setEndDate(range.endDate);
    }
  }

  function handleApply() {
    if (!startDate || !endDate || startDate > endDate) {
      return;
    }

    onApply({ startDate, endDate });
  }

  function handleReset() {
    const range = getRange("month");

    setPeriod("month");
    setStartDate(range.startDate);
    setEndDate(range.endDate);
    onApply(range);
  }

  return (
    <section className="rounded-2xl border border-[#d8e2dc] bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <LuCalendarDays size={18} className="text-[#13834e]" />
            <h2 className="font-semibold text-[#102d29]">
              Filter dashboard
            </h2>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {(
              [
                ["today", "Today"],
                ["7days", "Last 7 days"],
                ["month", "This month"],
                ["30days", "Last 30 days"],
                ["custom", "Custom range"],
              ] as [DashboardPeriod, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => handlePeriodChange(key)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  period === key
                    ? "border-[#13834e] bg-[#e8f4ec] text-[#13834e]"
                    : "border-[#d8e2dc] bg-white text-gray-600 hover:bg-[#f7faf8]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div>
            <label
              htmlFor="dashboard-start-date"
              className="mb-1.5 block text-xs font-medium text-gray-500"
            >
              Start date
            </label>

            <input
              id="dashboard-start-date"
              type="date"
              value={startDate}
              max={endDate}
              onChange={(event) => {
                setPeriod("custom");
                setStartDate(event.target.value);
              }}
              className="w-full rounded-xl border border-[#d8e2dc] px-3 py-2.5 text-sm text-[#102d29] outline-none focus:border-[#13834e] sm:w-auto"
            />
          </div>

          <div>
            <label
              htmlFor="dashboard-end-date"
              className="mb-1.5 block text-xs font-medium text-gray-500"
            >
              End date
            </label>

            <input
              id="dashboard-end-date"
              type="date"
              value={endDate}
              min={startDate}
              onChange={(event) => {
                setPeriod("custom");
                setEndDate(event.target.value);
              }}
              className="w-full rounded-xl border border-[#d8e2dc] px-3 py-2.5 text-sm text-[#102d29] outline-none focus:border-[#13834e] sm:w-auto"
            />
          </div>

          <button
            type="button"
            onClick={handleApply}
            disabled={!startDate || !endDate || startDate > endDate}
            className="rounded-xl bg-[#13834e] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#106b40] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Apply
          </button>

          <button
            type="button"
            onClick={handleReset}
            aria-label="Reset date filter"
            className="flex items-center justify-center rounded-xl border border-[#d8e2dc] px-3 py-2.5 text-[#102d29] transition hover:bg-[#f7faf8]"
          >
            <LuRotateCcw size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}

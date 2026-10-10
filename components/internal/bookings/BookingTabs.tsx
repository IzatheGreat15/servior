
"use client";

import { IoCheckmarkDoneCircle } from "react-icons/io5";
import { LuCalendarClock, LuCircleX } from "react-icons/lu";

export type BookingTab = "upcoming" | "completed" | "cancelled";

type BookingTabsProps = {
  activeTab: BookingTab;
  onChange: (tab: BookingTab) => void;
  counts: Record<BookingTab, number>;
};

const tabs: {
  id: BookingTab;
  label: string;
  icon: typeof LuCalendarClock;
}[] = [
  {
    id: "upcoming",
    label: "Upcoming",
    icon: LuCalendarClock,
  },
  {
    id: "completed",
    label: "Completed",
    icon: IoCheckmarkDoneCircle,
  },
  {
    id: "cancelled",
    label: "Cancelled",
    icon: LuCircleX,
  },
];

export default function BookingTabs({
  activeTab,
  onChange,
  counts,
}: BookingTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto border-b border-[#d8e2dc]">
      {tabs.map(({ id, label, icon: Icon }) => {
        const active = activeTab === id;

        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
              active
                ? "border-[#13834e] text-[#13834e]"
                : "border-transparent text-gray-500 hover:text-[#102d29]"
            }`}
          >
            <Icon size={17} />
            {label}

            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                active
                  ? "bg-[#e8f4ec] text-[#13834e]"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {counts[id]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

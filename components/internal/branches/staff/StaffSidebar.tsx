
"use client";

import {
  IoAddOutline,
  IoPeopleOutline,
  IoPersonOutline,
  IoShieldCheckmarkOutline,
} from "react-icons/io5";

type StaffFilter = "All" | "Managers" | "Staff";

type Props = {
  activeFilter: StaffFilter;
  onFilterChange: (filter: StaffFilter) => void;
  counts: Record<StaffFilter, number>;
  onAddStaff: () => void;
};

const itemClass = (active: boolean) =>
  `flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition ${
    active
      ? "bg-[#eaf6ee] font-semibold text-[#176b43]"
      : "text-[#496158] hover:bg-[#f4f8f5]"
  }`;

export default function StaffSidebar({
  activeFilter,
  onFilterChange,
  counts,
  onAddStaff,
}: Props) {
  const filters = [
    {
      id: "All" as const,
      label: "All staff",
      Icon: IoPeopleOutline,
    },
    {
      id: "Managers" as const,
      label: "Managers",
      Icon: IoShieldCheckmarkOutline,
    },
    {
      id: "Staff" as const,
      label: "Staff",
      Icon: IoPersonOutline,
    },
  ];

  return (
    <aside className="h-fit rounded-xl border border-[#e2ebe5] bg-white p-3.5 shadow-sm w-full md:w-1/3">
      <h2 className="text-lg font-bold text-[#183b30]">
        Branch staff
      </h2>

      <p className="mt-1 text-xs leading-4 text-slate-500">
        Manage which team members can access and manage this branch.
      </p>

      <button
        type="button"
        onClick={onAddStaff}
        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#13834e] px-3 py-2.5 text-xs font-bold text-white transition hover:bg-[#0f6d40]"
      >
        <IoAddOutline className="text-base" />
        Add staff
      </button>

      <div className="mt-4 space-y-1">
        {filters.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onFilterChange(id)}
            className={itemClass(activeFilter === id)}
          >
            <span className="flex items-center gap-2">
              <Icon className="text-sm" />
              {label}
            </span>

            <span
              className={`rounded-full px-1.5 py-0.5 text-xs ${
                activeFilter === id
                  ? "bg-[#d2ebdc] text-[#176b43]"
                  : "bg-[#edf3ef] text-[#52685d]"
              }`}
            >
              {counts[id]}
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}

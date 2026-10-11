
import type { ReactNode } from "react";
import { LuArrowDownRight, LuArrowUpRight } from "react-icons/lu";

type Props = {
  label: string;
  value: string;
  change?: number;
  description: string;
  icon: ReactNode;
  changeIsPositive?: boolean;
};

export default function StatCard({
  label,
  value,
  change,
  description,
  icon,
  changeIsPositive = true,
}: Props) {
  const increased = (change ?? 0) >= 0;
  const goodChange = changeIsPositive ? increased : !increased;

  return (
    <article className="rounded-2xl border border-[#d8e2dc] bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-3 break-words text-2xl font-bold tracking-tight text-[#102d29] sm:text-3xl">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8f4ec] text-[#13834e]">
          {icon}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        {change !== undefined && (
          <span
            className={`inline-flex items-center gap-1 font-semibold ${
              goodChange ? "text-[#13834e]" : "text-red-600"
            }`}
          >
            {increased ? (
              <LuArrowUpRight size={15} />
            ) : (
              <LuArrowDownRight size={15} />
            )}

            {Math.abs(change)}%
          </span>
        )}

        <span className="text-gray-400">{description}</span>
      </div>
    </article>
  );
}

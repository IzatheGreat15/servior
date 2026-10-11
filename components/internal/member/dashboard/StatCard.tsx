"use client"

export default function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#d8e2dc] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{label}</p>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f4ec] text-[#13834e]">
          {icon}
        </span>
      </div>
      <p className="mt-4 text-3xl font-bold text-[#102d29]">{value}</p>
    </div>
  );
}
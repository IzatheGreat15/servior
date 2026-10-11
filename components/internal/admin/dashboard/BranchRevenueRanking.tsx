
import { LuTrophy } from "react-icons/lu";
import { BranchRevenue } from "./types";

type Props = {
  data: BranchRevenue[];
};

const money = (amount: number) =>
  `₱${amount.toLocaleString("en-PH")}`;

export default function BranchRevenueRanking({ data }: Props) {
  const sorted = [...data].sort((a, b) => b.revenue - a.revenue);
  const maxRevenue = Math.max(...sorted.map((item) => item.revenue), 1);
  const totalRevenue = sorted.reduce(
    (sum, branch) => sum + branch.revenue,
    0,
  );

  return (
    <section className="rounded-2xl border border-[#d8e2dc] bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-[#102d29]">
            Branches by revenue
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Best-performing locations
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f4ec] text-[#13834e]">
          <LuTrophy size={20} />
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">
          No branch revenue data for this period.
        </p>
      ) : (
        <div className="space-y-5">
          {sorted.map((branch, index) => {
            const share =
              totalRevenue > 0
                ? (branch.revenue / totalRevenue) * 100
                : 0;

            return (
              <div key={branch.branchId} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                        index === 0
                          ? "bg-[#e8f4ec] text-[#13834e]"
                          : "bg-[#f0f4f1] text-[#53655c]"
                      }`}
                    >
                      {index + 1}
                    </span>

                    <span className="truncate text-sm font-medium text-[#102d29]">
                      {branch.branchName}
                    </span>
                  </div>

                  <span className="shrink-0 text-sm font-semibold text-[#102d29]">
                    {money(branch.revenue)}
                  </span>
                </div>

                <div className="ml-11 h-2 overflow-hidden rounded-full bg-[#edf1ee]">
                  <div
                    className={`h-full rounded-full ${
                      index === 0 ? "bg-[#13834e]" : "bg-[#79c8a3]"
                    }`}
                    style={{
                      width: `${(branch.revenue / maxRevenue) * 100}%`,
                    }}
                  />
                </div>

                <p className="ml-11 text-xs text-gray-400">
                  {share.toFixed(1)}% of branch revenue
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

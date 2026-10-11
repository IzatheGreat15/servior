
"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { SportUsage } from "./types";

type Props = {
  data: SportUsage[];
};

export default function PopularSportsChart({ data }: Props) {
  const sorted = [...data].sort((a, b) => b.bookings - a.bookings);

  return (
    <section className="rounded-2xl border border-[#d8e2dc] bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6">
        <h2 className="font-bold text-[#102d29]">Popular sports</h2>
        <p className="mt-1 text-sm text-gray-500">
          Ranked by number of bookings.
        </p>
      </div>

      {sorted.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">
          No sports data for this period.
        </p>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sorted}
              layout="vertical"
              margin={{ top: 0, right: 12, left: 12, bottom: 0 }}
            >
              <CartesianGrid
                stroke="#edf1ee"
                strokeDasharray="3 3"
                horizontal={false}
              />

              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64756c", fontSize: 12 }}
              />

              <YAxis
                type="category"
                dataKey="sport"
                width={90}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#53655c", fontSize: 12 }}
              />

              <Tooltip
                formatter={(value) => [
                  Number(value).toLocaleString("en-PH"),
                  "Bookings",
                ]}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #d8e2dc",
                }}
              />

              <Bar
                dataKey="bookings"
                name="Bookings"
                fill="#13834e"
                radius={[0, 5, 5, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}


"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { UserGrowthPoint } from "./types";

type Props = {
  data: UserGrowthPoint[];
};

export default function UserGrowthChart({ data }: Props) {
  return (
    <section className="rounded-2xl border border-[#d8e2dc] bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6">
        <h2 className="font-bold text-[#102d29]">User growth</h2>
        <p className="mt-1 text-sm text-gray-500">
          New user registrations over time.
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 8, left: -15, bottom: 0 }}
          >
            <defs>
              <linearGradient id="userGrowthFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#13834e" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#13834e" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="#edf1ee"
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64756c", fontSize: 12 }}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64756c", fontSize: 12 }}
            />

            <Tooltip
              formatter={(value) => [
                Number(value).toLocaleString("en-PH"),
                "Users",
              ]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #d8e2dc",
              }}
            />

            <Area
              type="monotone"
              dataKey="users"
              name="Users"
              stroke="#13834e"
              strokeWidth={2.5}
              fill="url(#userGrowthFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

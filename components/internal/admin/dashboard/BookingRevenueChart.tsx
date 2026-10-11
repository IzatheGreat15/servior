
"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { BookingRevenuePoint } from "./types";

type Props = {
  data: BookingRevenuePoint[];
};

export default function BookingRevenueChart({ data }: Props) {
  return (
    <section className="rounded-2xl border border-[#d8e2dc] bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6">
        <h2 className="font-bold text-[#102d29]">
          Bookings & revenue
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Booking volume and revenue over the selected period.
        </p>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 5, right: 8, left: -15, bottom: 0 }}
          >
            <CartesianGrid
              stroke="#edf1ee"
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64756c", fontSize: 12 }}
            />

            <YAxis
              yAxisId="bookings"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64756c", fontSize: 12 }}
            />

            <YAxis
              yAxisId="revenue"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64756c", fontSize: 12 }}
              tickFormatter={(value: number) => `₱${value / 1000}k`}
            />

            <Tooltip
              formatter={(value, name) => [
                name === "Revenue"
                  ? `₱${Number(value).toLocaleString("en-PH")}`
                  : value,
                name,
              ]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #d8e2dc",
              }}
            />

            <Legend />

            <Bar
              yAxisId="bookings"
              dataKey="bookings"
              name="Bookings"
              fill="#13834e"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />

            <Line
              yAxisId="revenue"
              dataKey="revenue"
              name="Revenue"
              type="monotone"
              stroke="#79c8a3"
              strokeWidth={3}
              dot={{ r: 3, fill: "#79c8a3" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

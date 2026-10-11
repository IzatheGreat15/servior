import { RecentBooking } from "./types";

type Props = {
  bookings: RecentBooking[];
};

const statusStyles: Record<RecentBooking["status"], string> = {
  confirmed: "bg-[#e8f4ec] text-[#13834e]",
  pending: "bg-amber-50 text-amber-700",
  completed: "bg-blue-50 text-blue-700",
  cancelled: "bg-red-50 text-red-600",
};

export default function RecentBookingsTable({ bookings }: Props) {
  const money = (amount: number) =>
    `₱${amount.toLocaleString("en-PH")}`;

  return (
    <section className="overflow-hidden rounded-2xl border border-[#d8e2dc] bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 p-5 sm:p-6">
        <div>
          <h2 className="font-bold text-[#102d29]">Recent bookings</h2>
          <p className="mt-1 text-sm text-gray-500">
            Latest activity across all branches.
          </p>
        </div>

        <span className="text-sm font-medium text-[#13834e]">
          {bookings.length} records
        </span>
      </div>

      {bookings.length === 0 ? (
        <p className="px-6 pb-6 text-sm text-gray-500">
          No bookings found for this period.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-y border-[#edf1ee] bg-[#f7faf8] text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-3 font-medium">Reference</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Branch</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Amount</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#edf1ee]">
              {bookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="transition hover:bg-[#f7faf8]"
                >
                  <td className="whitespace-nowrap px-5 py-4 font-medium text-[#102d29]">
                    {booking.reference}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                    {booking.customerName}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                    {booking.branchName}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                    {new Date(`${booking.date}T00:00:00`).toLocaleDateString(
                      "en-PH",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      },
                    )}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                        statusStyles[booking.status]
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-[#102d29]">
                    {money(booking.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

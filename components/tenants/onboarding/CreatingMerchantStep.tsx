
export default function CreatingMerchantStep() {
  const tasks = [
    ["Saving your information", "Completed"],
    ["Creating PayMongo merchant account", "In progress"],
    ["Preparing identity verification", "Pending"],
  ];

  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-700">
        ⚙
      </div>

      <h2 className="mt-6 text-2xl font-bold text-gray-900">
        Creating your merchant account
      </h2>

      <p className="mt-3 text-sm leading-6 text-gray-500">
        We're setting up your PayMongo merchant account.
        Please don't close this page.
      </p>

      <div className="mt-8 rounded-xl border border-gray-200 p-5 text-left">
        {tasks.map(([title, status], index) => (
          <div
            key={title}
            className="flex items-center gap-3 border-b border-gray-100 py-4 last:border-0"
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm ${
                index === 0
                  ? "bg-emerald-100 text-emerald-700"
                  : index === 1
                    ? "bg-blue-50 text-blue-600"
                    : "bg-gray-100 text-gray-400"
              }`}
            >
              {index === 0 ? "✓" : index === 1 ? "…" : "○"}
            </span>

            <span className="flex-1 text-sm font-medium text-gray-800">
              {title}
            </span>

            <span className="text-xs text-gray-500">{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

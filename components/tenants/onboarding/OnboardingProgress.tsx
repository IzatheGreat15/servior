
"use client";

const steps = [
  "Business Details",
  "Owner Details",
  "Subscription",
  "Review",
  "Setup",
  "Verification",
];

export default function OnboardingProgress({
  currentStep,
}: {
  currentStep: number;
}) {
  return (
    <div className="w-full overflow-x-auto">
      <ol className="flex min-w-[650px] items-start">
        {steps.map((label, index) => {
          const completed = index < currentStep;
          const active = index === currentStep;

          return (
            <li
              key={label}
              className="flex flex-1 items-start last:flex-none"
            >
              <div className="flex min-w-0 flex-col items-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                    completed || active
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {completed ? "✓" : index + 1}
                </div>

                <span
                  className={`mt-2 whitespace-nowrap text-xs sm:text-sm ${
                    active
                      ? "font-semibold text-emerald-700"
                      : completed
                        ? "text-emerald-700"
                        : "text-gray-400"
                  }`}
                >
                  {label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`mx-2 mt-[17px] h-0.5 flex-1 ${
                    completed ? "bg-emerald-600" : "bg-gray-200"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

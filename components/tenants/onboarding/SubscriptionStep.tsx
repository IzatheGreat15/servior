
"use client";

import type { SubscriptionPlan } from "./types";

type Props = {
  plans: SubscriptionPlan[];
  selectedPlanId: string;
  onSelect: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
};

export default function SubscriptionStep({
  plans,
  selectedPlanId,
  onSelect,
  onNext,
  onBack,
}: Props) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-emerald-700">
          Step 3 of 6
        </p>
        <h2 className="mt-2 text-2xl font-bold text-gray-900">
          Choose your subscription plan
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Pick the plan that fits your business. You can change it later.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {plans.map((plan) => {
          const selected = selectedPlanId === plan.id;

          return (
            <button
              key={plan.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(plan.id)}
              className={`relative flex flex-col rounded-2xl border p-6 text-left transition ${
                selected
                  ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500"
                  : "border-gray-200 bg-white hover:border-emerald-300"
              }`}
            >
              {plan.recommended && (
                <span className="absolute right-4 top-4 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                  Recommended
                </span>
              )}

              <span className="text-lg font-bold text-gray-900">
                {plan.name}
              </span>

              <span className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">
                  ₱{plan.price.toLocaleString("en-PH")}
                </span>
                <span className="text-sm text-gray-500">/ month</span>
              </span>

              <p className="mt-3 text-sm text-gray-500">
                {plan.description}
              </p>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex gap-2 text-sm text-gray-700"
                  >
                    <span className="font-bold text-emerald-600">
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <span
                className={`mt-6 rounded-lg border px-4 py-2 text-center text-sm font-semibold ${
                  selected
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-gray-300 text-gray-700"
                }`}
              >
                {selected ? "Selected plan" : "Choose plan"}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between border-t border-gray-100 pt-6">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>

        <button
          type="button"
          disabled={!selectedPlanId}
          onClick={onNext}
          className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

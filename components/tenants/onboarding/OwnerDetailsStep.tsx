
"use client";

import type { OnboardingData } from "./types";

type Props = {
  data: OnboardingData;
  update: (field: keyof OnboardingData, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const inputClass =
  "mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

const labelClass = "block text-sm font-medium text-gray-700";

export default function OwnerDetailsStep({
  data,
  update,
  onNext,
  onBack,
}: Props) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onNext();
      }}
      className="space-y-6"
    >
      <div>
        <p className="text-sm font-medium text-emerald-700">
          Step 2 of 6
        </p>
        <h2 className="mt-2 text-2xl font-bold text-gray-900">
          Who owns the business?
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Provide the primary contact details for merchant onboarding.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className={labelClass}>
          First name *
          <input
            required
            autoComplete="given-name"
            value={data.ownerFirstName}
            onChange={(e) => update("ownerFirstName", e.target.value)}
            placeholder="First name"
            className={inputClass}
          />
        </label>

        <label className={labelClass}>
          Last name *
          <input
            required
            autoComplete="family-name"
            value={data.ownerLastName}
            onChange={(e) => update("ownerLastName", e.target.value)}
            placeholder="Last name"
            className={inputClass}
          />
        </label>
      </div>

      <label className={labelClass}>
        Owner's email *
        <input
          required
          type="email"
          autoComplete="email"
          value={data.ownerEmail}
          onChange={(e) => update("ownerEmail", e.target.value)}
          placeholder="owner@example.com"
          className={inputClass}
        />
      </label>

      <label className={labelClass}>
        Owner's phone *
        <input
          required
          type="tel"
          autoComplete="tel"
          value={data.ownerPhone}
          onChange={(e) => update("ownerPhone", e.target.value)}
          placeholder="+63 9XX XXX XXXX"
          className={inputClass}
        />
      </label>

      <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
        <p className="font-semibold">Your information is important</p>
        <p className="mt-1 text-emerald-800">
          PayMongo may request additional identity or business
          verification during the next steps.
        </p>
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
          type="submit"
          className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Continue
        </button>
      </div>
    </form>
  );
}


"use client";

import type { OnboardingData } from "./types";

type Props = {
  data: OnboardingData;
  update: (field: keyof OnboardingData, value: string) => void;
  onNext: () => void;
};

const inputClass =
  "mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

const labelClass = "block text-sm font-medium text-gray-700";

export default function BusinessDetailsStep({
  data,
  update,
  onNext,
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
          Step 1 of 6
        </p>
        <h2 className="mt-2 text-2xl font-bold text-gray-900">
          Tell us about your facility
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          We'll use these details to set up your merchant account.
        </p>
      </div>

      <label className={labelClass}>
        Facility name *
        <input
          required
          value={data.facilityName}
          onChange={(e) => update("facilityName", e.target.value)}
          placeholder="e.g. Cebu Pickleball Club"
          className={inputClass}
        />
      </label>

      <label className={labelClass}>
        Registered business name *
        <input
          required
          value={data.legalBusinessName}
          onChange={(e) =>
            update("legalBusinessName", e.target.value)
          }
          placeholder="Registered business name"
          className={inputClass}
        />
        <span className="mt-1 block text-xs text-gray-500">
          Enter the legal name used for your business registration.
        </span>
      </label>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className={labelClass}>
          Business email *
          <input
            required
            type="email"
            value={data.businessEmail}
            onChange={(e) => update("businessEmail", e.target.value)}
            placeholder="business@example.com"
            className={inputClass}
          />
        </label>

        <label className={labelClass}>
          Business phone *
          <input
            required
            type="tel"
            value={data.businessPhone}
            onChange={(e) => update("businessPhone", e.target.value)}
            placeholder="+63 9XX XXX XXXX"
            className={inputClass}
          />
        </label>
      </div>

      <label className={labelClass}>
        Business address *
        <textarea
          required
          rows={3}
          value={data.businessAddress}
          onChange={(e) =>
            update("businessAddress", e.target.value)
          }
          placeholder="Street, city, province, postal code"
          className={inputClass}
        />
      </label>

      <div className="flex justify-end border-t border-gray-100 pt-6">
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


import type {
  OnboardingData,
  SubscriptionPlan,
} from "./types";

type Props = {
  data: OnboardingData;
  plan: SubscriptionPlan;
  onBack: () => void;
  onSubmit: () => void;
};

function ReviewSection({
  title,
  items,
}: {
  title: string;
  items: [string, string][];
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200">
      <h3 className="border-b border-gray-100 bg-gray-50 px-5 py-3 text-sm font-semibold text-gray-900">
        {title}
      </h3>

      <dl className="divide-y divide-gray-100 px-5">
        {items.map(([label, value]) => (
          <div
            key={label}
            className="grid gap-1 py-3 sm:grid-cols-3"
          >
            <dt className="text-sm text-gray-500">{label}</dt>
            <dd className="break-words text-sm font-medium text-gray-900 sm:col-span-2">
              {value || "—"}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default function ReviewStep({
  data,
  plan,
  onBack,
  onSubmit,
}: Props) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-emerald-700">
          Step 4 of 6
        </p>
        <h2 className="mt-2 text-2xl font-bold text-gray-900">
          Review your information
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Confirm everything before creating your merchant account.
        </p>
      </div>

      <ReviewSection
        title="Business information"
        items={[
          ["Facility name", data.facilityName],
          ["Registered business name", data.legalBusinessName],
          ["Business email", data.businessEmail],
          ["Business phone", data.businessPhone],
          ["Business address", data.businessAddress],
        ]}
      />

      <ReviewSection
        title="Owner information"
        items={[
          [
            "Full name",
            `${data.ownerFirstName} ${data.ownerLastName}`,
          ],
          ["Email", data.ownerEmail],
          ["Phone", data.ownerPhone],
        ]}
      />

      <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="text-sm font-medium text-emerald-800">
          Selected subscription
        </p>
        <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-lg font-bold text-gray-900">
            {plan.name}
          </span>
          <span className="text-xl font-bold text-emerald-700">
            ₱{plan.price.toLocaleString("en-PH")}
            <span className="text-sm font-normal"> / month</span>
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-600">
          {plan.description}
        </p>
      </section>

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
          onClick={onSubmit}
          className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Create merchant account
        </button>
      </div>
    </div>
  );
}

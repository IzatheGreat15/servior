
type Props = {
  onContinue: () => void;
};

export default function IdentityVerificationStep({
  onContinue,
}: Props) {
  return (
    <div className="mx-auto max-w-2xl py-10">
      <p className="text-sm font-medium text-emerald-700">
        Step 6 of 6
      </p>

      <h2 className="mt-2 text-2xl font-bold text-gray-900">
        Complete your identity verification
      </h2>

      <p className="mt-3 text-sm leading-6 text-gray-500">
        To activate your merchant account, complete the identity
        and business verification process with PayMongo.
      </p>

      <div className="mt-8 rounded-2xl border border-gray-200 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 font-bold text-emerald-700">
            P
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">PayMongo</h3>
            <p className="text-sm text-gray-500">
              Secure merchant verification
            </p>
          </div>
        </div>

        <ul className="mt-6 space-y-3 text-sm text-gray-600">
          <li>✓ Your information is handled through the supported verification flow.</li>
          <li>✓ PayMongo may request additional documents.</li>
          <li>✓ You can return to Servior after completing the process.</li>
        </ul>

        <button
          type="button"
          onClick={onContinue}
          className="mt-8 w-full rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
        >
          Continue to PayMongo →
        </button>

        <p className="mt-3 text-center text-xs text-gray-500">
          Demo only: this button simulates the redirect.
        </p>
      </div>
    </div>
  );
}

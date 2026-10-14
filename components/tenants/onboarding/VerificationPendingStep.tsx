
export default function VerificationPendingStep() {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">
        ◷
      </div>

      <h2 className="mt-6 text-2xl font-bold text-gray-900">
        Verification in progress
      </h2>

      <p className="mt-3 text-sm leading-6 text-gray-500">
        We're waiting for PayMongo to confirm your verification.
        You can return to your dashboard while we wait for an update.
      </p>

      <div className="mt-8 rounded-xl border border-gray-200 p-5 text-left">
        <p className="text-sm font-semibold text-gray-900">
          Merchant setup status
        </p>

        <div className="mt-4 space-y-3 text-sm text-gray-600">
          <p>✓ Merchant account created</p>
          <p>✓ Identity verification started</p>
          <p className="text-blue-700">◷ Waiting for verification result</p>
        </div>
      </div>

      <p className="mt-5 text-xs text-gray-500">
        This demo does not receive real PayMongo verification updates.
      </p>
    </div>
  );
}

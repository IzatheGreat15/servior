
type Props = {
  onGoToDashboard: () => void;
};

export default function OnboardingSuccess({
  onGoToDashboard,
}: Props) {
  return (
    <div className="mx-auto max-w-xl py-12 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-4xl text-emerald-700">
        ✓
      </div>

      <h2 className="mt-6 text-3xl font-bold text-gray-900">
        You're all set!
      </h2>

      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
        Your onboarding has been completed. You can now continue
        to your Servior dashboard.
      </p>

      <div className="mt-8 rounded-xl border border-gray-200 p-5 text-left">
        <p className="text-sm text-gray-500">Payment account</p>
        <p className="mt-1 font-semibold text-gray-900">
          PayMongo merchant
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-gray-500">Status</span>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            Verified (demo)
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onGoToDashboard}
        className="mt-8 w-full rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
      >
        Go to dashboard →
      </button>
    </div>
  );
}

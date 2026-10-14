
export default function RedirectingStep() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-600" />

      <h2 className="mt-6 text-xl font-bold text-gray-900">
        Redirecting to your dashboard…
      </h2>

      <p className="mt-2 text-sm text-gray-500">
        Welcome to Servior. Just a moment.
      </p>
    </div>
  );
}

export default function BookingHeader() {
  return (
    <header className="flex items-center justify-between gap-4 px-6">
      <a
        className="group flex min-w-0 items-center gap-3"
        href="/"
        aria-label="Servior home"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
          <img
            src="/servior-logo.png"
            alt=""
            className="h-12 w-12 object-contain"
          />
        </span>

        <span className="flex min-w-0 flex-col">
          <img
            src="/servior-name-white-logo.png"
            alt="Servior"
            className="w-28 object-contain object-left sm:w-32"
          />
          <small className="mt-0.5 text-xs font-medium tracking-wide text-gray-300">
            Book. Play. Repeat.
          </small>
        </span>
      </a>

      <div className="hidden shrink-0 items-center gap-2 rounded-full border border-emerald-100 bg-white/80 px-4 py-2 text-sm font-medium text-emerald-800 shadow-sm sm:flex">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        {/* Easy online booking */}
        LAUNCHING SOON
      </div>
    </header>
  );
}
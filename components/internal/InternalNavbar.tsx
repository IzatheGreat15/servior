
import {
  LuMenu,
  LuBell,
  LuChevronDown,
} from "react-icons/lu";

type InternalNavbarProps = {
  onMenuClick: () => void;
};

export default function InternalNavbar({
  onMenuClick,
}: InternalNavbarProps) {
  return (
    <header className="sticky top-0 z-30 flex shrink-0 items-center gap-3 border-b border-brand-border bg-white px-4 py-0.5">
      {/* Mobile menu */}
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Toggle navigation"
        className="grid size-10 place-items-center rounded-lg text-brand-dark transition-colors hover:bg-brand-light md:hidden"
      >
        <LuMenu size={23} />
      </button>

      <div className="flex-1" />

      {/* Notifications */}
      <button
        type="button"
        aria-label="Notifications"
        className="relative grid size-10 place-items-center rounded-lg text-brand-dark transition-colors hover:bg-brand-light"
      >
        <LuBell size={21} />
        <span className="absolute right-2 top-2 size-2 rounded-full bg-brand ring-2 ring-white" />
      </button>

      {/* Profile */}
      <button
        type="button"
        aria-label="Open profile menu"
        className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-brand-light sm:gap-3 sm:px-2"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-light text-sm font-bold text-brand-dark">
          KM
        </span>

        <LuChevronDown
          size={16}
          className="hidden text-brand-muted sm:block"
        />
      </button>
    </header>
  );
}

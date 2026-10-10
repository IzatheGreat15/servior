
"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LuChevronDown, LuLogOut, LuX } from "react-icons/lu";

import type { NavigationItem } from "./navigation/types";

type InternalSidebarProps = {
  open: boolean;
  onClose: () => void;
  items: NavigationItem[];
  onSignOut?: () => void;
};

export default function InternalSidebar({
  open,
  onClose,
  items,
  onSignOut,
}: InternalSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-brand-border bg-white transition-transform duration-200 ${
        open ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}
    >
      <div className="flex h-[69px] shrink-0 items-center justify-between border-brand-border px-6">
        <Link
          href="/dashboard"
          onClick={onClose}
          className="flex items-center gap-3 text-2xl font-extrabold tracking-tight text-brand-dark"
        >
          <span className="flex px-1 py-2 items-center justify-center rounded-xl bg-brand-light text-xl text-brand">
            <img src='/servior-logo.png' alt="Servior" className="w-8" />
          </span>
          <img src='/servior-name-logo.png' alt="Servior" className="w-24" />
        </Link>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close sidebar"
          className="grid size-9 place-items-center rounded-lg text-brand-muted hover:bg-brand-light md:hidden"
        >
          <LuX size={21} />
        </button>
      </div>

      <nav
        aria-label="Main navigation"
        className="flex-1 space-y-1 overflow-y-auto px-3 py-5"
      >
        {items.map((item) => (
          <SidebarItem
            key={item.href}
            item={item}
            pathname={pathname}
            onNavigate={onClose}
          />
        ))}
      </nav>

      <div className="shrink-0 border-brand-border p-3">
        <button
          type="button"
          onClick={onSignOut}
          className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3.5 text-sm text-brand-muted transition-colors hover:bg-brand-light hover:text-brand-dark"
        >
          <LuLogOut size={20} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}

function SidebarItem({
  item,
  pathname,
  onNavigate,
  nested = false,
}: {
  item: NavigationItem;
  pathname: string;
  onNavigate: () => void;
  nested?: boolean;
}) {
  const [expanded, setExpanded] = useState(true);

  const Icon = item.icon;
  const hasChildren = Boolean(item.children?.length);

  const isActive =
    pathname === item.href ||
    pathname.startsWith(`${item.href}/`);

  const childIsActive = item.children?.some(
    (child) =>
      pathname === child.href ||
      pathname.startsWith(`${child.href}/`),
  );

  const linkClass = `flex min-h-11 w-full items-center gap-3 rounded-lg px-3.5 text-sm transition-colors ${
    nested ? "pl-3" : ""
  } ${
    isActive && !hasChildren
      ? "bg-brand-light font-semibold text-brand-dark"
      : "text-brand-muted hover:bg-brand-light hover:text-brand-dark"
  }`;

  if (hasChildren) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3.5 text-sm transition-colors ${
            childIsActive
              ? "font-semibold text-brand-dark"
              : "text-brand-muted hover:bg-brand-light hover:text-brand-dark"
          }`}
        >
          {Icon && <Icon size={20} />}
          <span className="flex-1 text-left">{item.label}</span>
          <LuChevronDown
            size={16}
            className={`transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>

        {expanded && (
          <div className="ml-4 mt-1 space-y-1 border-brand-border pl-3">
            {item.children!.map((child) => (
              <SidebarItem
                key={child.href}
                item={child}
                pathname={pathname}
                onNavigate={onNavigate}
                nested
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={linkClass}
    >
      {Icon && <Icon size={nested ? 18 : 20} />}
      <span>{item.label}</span>
    </Link>
  );
}

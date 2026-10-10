"use client";

import { Suspense, useState } from "react";
import type { ReactNode } from "react";

import InternalSidebar from "./InternalSidebar";
import InternalNavbar from "./InternalNavbar";
import type { NavigationItem } from "./navigation/types";

type InternalLayoutProps = {
  children: ReactNode;
  navigationItems: NavigationItem[];
  onSignOut?: () => void;
};

export default function InternalLayout({
  children,
  navigationItems,
  onSignOut,
}: InternalLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-brand-background text-brand-dark">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      <Suspense fallback={null}>
        <InternalSidebar
          open={sidebarOpen}
          onClose={closeSidebar}
          items={navigationItems}
          onSignOut={onSignOut}
        />
      </Suspense>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col md:ml-[260px]">
        <InternalNavbar
          onMenuClick={() => setSidebarOpen((open) => !open)}
        />

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
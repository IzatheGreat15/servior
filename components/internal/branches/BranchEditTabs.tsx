"use client";

import {
  IoBusinessOutline,
  IoBasketballOutline,
  IoBagHandleOutline,
  IoPeopleOutline,
  IoSettingsOutline,
} from "react-icons/io5";
import type { ReactNode } from "react";

export type BranchTab = "general" | "sports" | "products" | "staff" | "settings";

const tabs: { id: BranchTab; label: string; icon: ReactNode }[] = [
  { id: "general", label: "General", icon: <IoBusinessOutline /> },
  { id: "sports", label: "Sports & Courts", icon: <IoBasketballOutline /> },
  { id: "products", label: "Products", icon: <IoBagHandleOutline /> },
  { id: "staff", label: "Staff", icon: <IoPeopleOutline /> },
  { id: "settings", label: "Settings", icon: <IoSettingsOutline /> },
];

export default function BranchEditTabs({ activeTab, onChange }: {
  activeTab: BranchTab;
  onChange: (tab: BranchTab) => void;
}) {
  return (
    <nav aria-label="Branch sections" className="mb-6 flex gap-2 overflow-x-auto border-b border-[#dfe9e2] px-1">
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button key={tab.id} type="button" onClick={() => onChange(tab.id)}
            aria-current={active ? "page" : undefined}
            className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
              active ? "border-[#13834e] text-[#13834e]" : "border-transparent text-slate-500 hover:border-[#b8d7c4] hover:text-[#29483e]"
            }`}>
            <span className="text-base">{tab.icon}</span>{tab.label}
          </button>
        );
      })}
    </nav>
  );
}

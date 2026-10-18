"use client";

import { useState } from "react";
import BranchDetailsForm from "@/components/internal/branches/BranchDetailForm";
import SportsCourtsPanel from "@/components/internal/branches/sports-and-courts/SportsCourtsPanel";
import BranchEditTabs, { BranchTab } from "@/components/internal/branches/BranchEditTabs";
import BranchSettingsPanel from "@/components/internal/branches/BranchSettingsPanel";
import ProductsPanel from "@/components/internal/branches/products/ProductsPanel";

export default function BranchEditPage() {
  const [activeTab, setActiveTab] = useState<BranchTab>("general");

  return (
    <main className="min-h-screen font-sans text-[#102d29]">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:p-0">
        <header className="mb-2">
          <h1 className="text-2xl font-medium">Greenfield Sports Center</h1>
          <p className="mt-1 text-sm text-slate-500">Manage branch details, facilities, products, staff, and settings.</p>
        </header>

        <BranchEditTabs activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === "general" && (
          <div className="flex flex-col gap-6">
            <div className="hidden xl:block rounded-2xl border border-dashed border-[#b8d7c4] bg-white/60 p-6">
              <h2 className="text-base font-bold text-[#102d29]">Branch overview</h2>
              <p className="mt-1 text-sm text-slate-500">General information and operating hours are managed on the left.</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#edf8f1] p-4"><p className="text-xs text-slate-500">Sports</p><p className="mt-1 text-xl font-bold">2</p></div>
                <div className="rounded-xl bg-[#edf8f1] p-4"><p className="text-xs text-slate-500">Courts</p><p className="mt-1 text-xl font-bold">4</p></div>
              </div>
            </div>
            <BranchDetailsForm />
          </div>
        )}

        {activeTab === "sports" && <SportsCourtsPanel />}
        {activeTab === "products" && <ProductsPanel />}
        {activeTab === "staff" && (
          <section className="rounded-2xl border border-[#d8e2dc] bg-white p-6 shadow-[0_4px_20px_rgba(16,45,41,0.035)]">
            <h2 className="text-lg font-bold">Branch staff</h2>
            <p className="mt-1 text-sm text-slate-500">Manage which team members can access this branch.</p>
            <div className="mt-5 rounded-xl border border-dashed border-[#b8d7c4] bg-[#fbfdfb] p-10 text-center">
              <p className="font-semibold text-[#29483e]">Staff management component not added yet</p>
              <p className="mt-1 text-sm text-slate-500">This tab is ready for a reusable BranchStaffPanel component.</p>
            </div>
          </section>
        )}
        {activeTab === "settings" && <BranchSettingsPanel />}        
      </div>
    </main>
  );
}

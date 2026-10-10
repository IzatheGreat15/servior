
"use client"

import BranchDetailsForm from "@/components/internal/branches/BranchDetailForm";
import SportsCourtsPanel from "@/components/internal/branches/SportsCourtsPanel";

export default function BranchAddPage() {
  return (
    <main className="min-h-screen bg-[#f4f8f5] font-sans text-[#102d29]">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(320px,0.82fr)_minmax(0,1.45fr)]">
          <BranchDetailsForm />
          <SportsCourtsPanel />
        </div>

        <footer className="mt-8 flex gap-3 rounded-2xl flex-row items-center justify-center sm:justify-end">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="rounded-xl border border-[#d8e2dc] px-5 py-3 text-sm font-bold text-[#29483e] hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() =>
                window.alert(
                  "UI prototype only. Connect this button to your save action."
                )
              }
              className="rounded-xl bg-[#13834e] px-5 py-3 text-sm font-bold text-white hover:bg-[#0f6d40]"
            >
              Save branch
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}

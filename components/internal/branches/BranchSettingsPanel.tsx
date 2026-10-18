"use client";

import { useState } from "react";
import SectionHeading from "./sports-and-courts/SectionHeading";
import { cardClass, inputClass } from "./types";

function Toggle({ label, description, defaultChecked = false }: {
  label: string; description: string; defaultChecked?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-[#e3ebe6] p-4">
      <span>
        <span className="block text-sm font-semibold text-[#29483e]">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span>
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="h-4 w-4 shrink-0 accent-[#13834e]" />
    </label>
  );
}

export default function BranchSettingsPanel() {
  const [advanceLimit, setAdvanceLimit] = useState("30");
  const [minDuration, setMinDuration] = useState("1");
  const [maxDuration, setMaxDuration] = useState("4");
  const [cancellationWindow, setCancellationWindow] = useState("12");
  const [timezone, setTimezone] = useState("Asia/Manila");
  const [currency, setCurrency] = useState("PHP");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#102d29]">Settings</h2>
        <p className="mt-1 text-sm text-slate-500">Manage how this branch operates. Configure booking rules, policies, and regional preferences.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className={`${cardClass} space-y-4 p-5 sm:p-6`}>
          <SectionHeading title="Booking settings" description="Control when and how customers can book courts." />
          <label className="block text-sm font-semibold text-[#29483e]">Advance booking limit (days)
            <input className={inputClass} type="number" min="1" value={advanceLimit} onChange={(e) => setAdvanceLimit(e.target.value)} />
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-[#29483e]">Minimum booking duration
              <select className={inputClass} value={minDuration} onChange={(e) => setMinDuration(e.target.value)}><option value="1">1 hour</option><option value="2">2 hours</option></select>
            </label>
            <label className="block text-sm font-semibold text-[#29483e]">Maximum booking duration
              <select className={inputClass} value={maxDuration} onChange={(e) => setMaxDuration(e.target.value)}><option value="2">2 hours</option><option value="4">4 hours</option><option value="6">6 hours</option><option value="8">8 hours</option></select>
            </label>
          </div>
          <Toggle label="Allow same-day bookings" description="Customers can book available courts on the same day." defaultChecked />
          <Toggle label="Allow back-to-back bookings" description="Allow customers to book consecutive time slots." defaultChecked />
          <Toggle label="Require approval" description="Review bookings manually before confirming them." />
        </section>
        <section className={`${cardClass} space-y-4 p-5 sm:p-6`}>
          <SectionHeading title="Cancellation policy" description="Set the default cancellation window for this branch." />
          <label className="block text-sm font-semibold text-[#29483e]">Cancellation cutoff
            <select className={inputClass} value={cancellationWindow} onChange={(e) => setCancellationWindow(e.target.value)}>
              <option value="3">3 hours before booking</option><option value="6">6 hours before booking</option><option value="12">12 hours before booking</option><option value="24">24 hours before booking</option>
            </select>
          </label>
          <Toggle label="Allow online cancellations" description="Customers can cancel from their booking confirmation." defaultChecked />
          <Toggle label="Require cancellation reason" description="Ask customers to provide a reason when cancelling." />
          <div className="rounded-xl bg-[#edf8f1] p-3 text-xs leading-5 text-[#35654d]">Prototype settings only. Connect these controls to your branch settings table before production.</div>
        </section>
        <section className={`${cardClass} space-y-4 p-5 sm:p-6`}>
          <SectionHeading title="Payment settings" description="Choose how payments are handled at this branch." />
          <Toggle label="Require payment to confirm" description="Confirm bookings only after payment succeeds." defaultChecked />
          <Toggle label="Allow partial payments" description="Let customers pay a deposit when booking." />
          <Toggle label="Accept on-site payments" description="Allow customers to pay at the venue." defaultChecked />
          <label className="block text-sm font-semibold text-[#29483e]">Refund processing estimate
            <select className={inputClass} defaultValue="5"><option value="3">3–5 business days</option><option value="5">5–7 business days</option><option value="7">7–10 business days</option></select>
          </label>
        </section>
        <section className={`${cardClass} space-y-4 p-5 sm:p-6`}>
          <SectionHeading title="Regional preferences" description="Set the timezone and currency used for this branch." />
          <label className="block text-sm font-semibold text-[#29483e]">Timezone
            <select className={inputClass} value={timezone} onChange={(e) => setTimezone(e.target.value)}><option value="Asia/Manila">Asia/Manila (GMT+8)</option><option value="Australia/Perth">Australia/Perth</option><option value="Asia/Jakarta">Asia/Jakarta</option></select>
          </label>
          <label className="block text-sm font-semibold text-[#29483e]">Currency
            <select className={inputClass} value={currency} onChange={(e) => setCurrency(e.target.value)}><option value="PHP">PHP — Philippine Peso</option><option value="AUD">AUD — Australian Dollar</option></select>
          </label>
        </section>
      </div>
    </div>
  );
}

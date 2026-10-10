export type PricingRule = {
  id: string;
  days: string[];
  startTime: string;
  endTime: string;
  hourlyRate: number;
};

export type Court = {
  id: string;
  name: string;
  active: boolean;
  rules: PricingRule[];
  photoUrl?: string | null;
  photoFile?: File | null;
  removePhoto?: boolean;
};

export type SportGroupData = {
  id: string;
  name: string;
  courts: Court[];
};

export const inputClass =
  "mt-1.5 w-full rounded-xl border border-[#d8e2dc] bg-white px-3.5 py-3 text-sm text-[#102d29] outline-none transition placeholder:text-slate-400 focus:border-[#13834e] focus:ring-4 focus:ring-[#13834e]/10";

export const cardClass =
  "rounded-2xl border border-[#d8e2dc] bg-white shadow-[0_4px_20px_rgba(16,45,41,0.035)]";

export const DAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday",
  "Friday", "Saturday", "Sunday",
];
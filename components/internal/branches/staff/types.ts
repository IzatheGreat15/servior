
export type StaffRole = "Branch Manager" | "Staff";

export type StaffMember = {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  isActive: boolean;
};

export const cardClass =
  "rounded-xl border border-[#e2ebe5] bg-white shadow-sm";

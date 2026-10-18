
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { IoCloseOutline, IoPersonAddOutline } from "react-icons/io5";
import type { StaffMember, StaffRole } from "./types";

type Props = {
  open: boolean;
  member: StaffMember | null;
  onClose: () => void;
  onSave: (member: StaffMember) => void;
};

const inputClass =
  "w-full rounded-xl border border-[#d8e2dc] bg-white px-3 py-2.5 text-sm text-[#102d29] outline-none transition focus:border-[#13834e] focus:ring-2 focus:ring-[#13834e]/10";

const labelClass =
  "mb-1.5 block text-sm font-medium text-[#29483e]";

export default function StaffModal({
  open,
  member,
  onClose,
  onSave,
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffRole>("Staff");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setName(member?.name ?? "");
    setEmail(member?.email ?? "");
    setRole(member?.role ?? "Staff");
    setIsActive(member?.isActive ?? true);
    setError("");
  }, [open, member]);

  if (!open) return null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Please enter the staff member's name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter an email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    onSave({
      id: member?.id ?? crypto.randomUUID(),
      name: name.trim(),
      email: email.trim(),
      role,
      isActive,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#102d29]/45 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="staff-modal-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#e2ebe5] bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[#e5eee8] px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f5ec] text-xl text-[#13834e]">
              <IoPersonAddOutline />
            </div>

            <div>
              <h2
                id="staff-modal-title"
                className="text-base font-bold text-[#102d29]"
              >
                {member ? "Edit staff member" : "Add staff member"}
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Configure branch access and staff details.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-[#f2f7f3]"
          >
            <IoCloseOutline className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
          <div>
            <label htmlFor="staff-name" className={labelClass}>
              Full name
            </label>

            <input
              id="staff-name"
              autoFocus
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError("");
              }}
              placeholder="e.g. Maria Santos"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="staff-email" className={labelClass}>
              Email address
            </label>

            <input
              id="staff-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
              placeholder="name@example.com"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="staff-role" className={labelClass}>
              Role
            </label>

            <select
              id="staff-role"
              value={role}
              onChange={(event) =>
                setRole(event.target.value as StaffRole)
              }
              className={inputClass}
            >
              <option value="Branch Manager">Branch Manager</option>
              <option value="Staff">Staff</option>
            </select>

            <p className="mt-1.5 text-xs leading-5 text-slate-500">
              Roles should determine which branch features the member can
              access. Enforce these permissions on the server as well.
            </p>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-[#f5f9f6] p-3.5">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[#13834e]"
            />

            <span>
              <span className="block text-sm font-semibold text-[#29483e]">
                Active staff member
              </span>

              <span className="mt-1 block text-xs leading-5 text-slate-500">
                Mark this member as active in the branch staff list.
              </span>
            </span>
          </label>

          {error && (
            <p role="alert" className="text-xs font-medium text-rose-600">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 border-t border-[#edf1ed] pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#d8e2dc] px-4 py-2.5 text-sm font-semibold text-[#29483e] hover:bg-[#f5f9f6]"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-[#13834e] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0f6d40]"
            >
              {member ? "Save changes" : "Add staff"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

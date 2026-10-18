
"use client";

import { useState } from "react";
import {
  IoCreateOutline,
  IoEllipsisVertical,
  IoSearchOutline,
} from "react-icons/io5";
import type { StaffMember } from "./types";

type Props = {
  staff: StaffMember[];
  search: string;
  onSearchChange: (value: string) => void;
  roleFilter: "All roles" | "Branch Manager" | "Staff";
  onRoleFilterChange: (
    value: "All roles" | "Branch Manager" | "Staff"
  ) => void;
  onEdit: (member: StaffMember) => void;
  onToggleStatus: (id: string) => void;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function StaffTable({
  staff,
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  onEdit,
  onToggleStatus,
  page,
  pageSize,
  onPageChange,
}: Props) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(staff.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStaff = staff.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const start = staff.length
    ? (currentPage - 1) * pageSize + 1
    : 0;

  const end = Math.min(currentPage * pageSize, staff.length);

  return (
    <section className="min-w-0 overflow-visible rounded-xl border border-[#e2ebe5] bg-white shadow-sm w-full md:w-2/3">
      {/* Table header */}
      <div className="flex flex-col gap-3 border-b border-[#edf1ed] p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-md font-bold text-[#183b30]">
            Staff list
          </h2>
          <p className="mt-1 text-xs text-slate-500 sm:hidden">
            Manage branch team members and their access.
          </p>
        </div>

        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1 sm:w-40 sm:flex-none">
            <IoSearchOutline className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                onSearchChange(event.target.value)
              }
              placeholder="Search staff..."
              aria-label="Search staff"
              className="w-full rounded-lg border border-[#dce7df] py-2 pl-8 pr-2.5 text-xs outline-none focus:border-[#13834e] focus:ring-2 focus:ring-[#13834e]/10"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(event) =>
              onRoleFilterChange(
                event.target.value as Props["roleFilter"]
              )
            }
            aria-label="Filter by role"
            className="max-w-36 rounded-lg border border-[#dce7df] bg-white px-2 py-2 text-xs outline-none focus:border-[#13834e]"
          >
            <option value="All roles">All roles</option>
            <option value="Branch Manager">Managers</option>
            <option value="Staff">Staff</option>
          </select>
        </div>
      </div>

      {/* Staff table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] border-collapse text-left">
          <thead>
            <tr className="bg-[#f6f9f7] text-sm font-semibold text-[#52685d]">
              <th className="px-3 py-3">Name</th>
              <th className="px-3 py-3">Role</th>
              <th className="px-3 py-3">Email</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#edf1ed]">
            {pageStaff.map((member) => (
              <tr
                key={member.id}
                className="text-sm text-[#29483e] transition hover:bg-[#fbfdfb]"
              >
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e4ece7] text-xs font-bold text-[#29483e]">
                      {getInitials(member.name)}
                    </div>

                    <span className="whitespace-nowrap font-semibold text-[#183b30]">
                      {member.name}
                    </span>
                  </div>
                </td>

                <td className="px-3 py-2">
                  <span
                    className={`whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium ${
                      member.role === "Branch Manager"
                        ? "bg-[#edf1f8] text-[#526781]"
                        : "bg-[#edf1f8] text-[#526781]"
                    }`}
                  >
                    {member.role}
                  </span>
                </td>

                <td className="px-3 py-2">
                  <span className="whitespace-nowrap text-slate-500">
                    {member.email}
                  </span>
                </td>

                <td className="px-3 py-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      member.isActive
                        ? "bg-[#e3f5e9] text-[#23784b]"
                        : "bg-[#e9edf5] text-[#586981]"
                    }`}
                  >
                    {member.isActive ? "Active" : "Inactive"}
                  </span>
                </td>

                <td className="px-3 py-2">
                  <div className="flex items-center justify-end gap-1.5">
                    <div className="relative">
                      <button
                        type="button"
                        aria-label={`Actions for ${member.name}`}
                        aria-expanded={openMenuId === member.id}
                        onClick={() =>
                          setOpenMenuId((current) =>
                            current === member.id ? null : member.id
                          )
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#dce7df] text-slate-500 transition hover:bg-[#f4f8f5]"
                      >
                        <IoEllipsisVertical />
                      </button>

                      {openMenuId === member.id && (
                        <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border border-[#e2ebe5] bg-white p-1 shadow-lg">
                          <button
                            type="button"
                            onClick={() => {
                              onToggleStatus(member.id);
                              setOpenMenuId(null);
                            }}
                            className="w-full rounded-md px-3 py-2 text-left text-sm text-[#29483e] hover:bg-[#f4f8f5]"
                          >
                            {member.isActive
                              ? "Deactivate staff"
                              : "Activate staff"}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              onEdit(member);
                              setOpenMenuId(null);
                            }}
                            className="w-full rounded-md px-3 py-2 text-left text-sm text-[#29483e] hover:bg-[#f4f8f5]"
                          >
                            Edit details
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}

            {!pageStaff.length && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center">
                  <p className="font-semibold text-[#29483e]">
                    No staff found
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Try changing your search or filters.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-3 border-t border-[#edf1ed] px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          {start}–{end} of {staff.length} staff
        </p>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            aria-label="Previous page"
            className="h-8 w-8 rounded-lg border border-[#dce7df] text-sm text-[#29483e] disabled:cursor-not-allowed disabled:opacity-40"
          >
            ‹
          </button>

          {Array.from({ length: totalPages }, (_, index) => index + 1)
            .filter(
              (pageNumber) =>
                pageNumber === 1 ||
                pageNumber === totalPages ||
                Math.abs(pageNumber - currentPage) <= 1
            )
            .map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => onPageChange(pageNumber)}
                aria-current={
                  pageNumber === currentPage ? "page" : undefined
                }
                className={`h-8 min-w-8 rounded-lg px-2 text-xs font-semibold ${
                  pageNumber === currentPage
                    ? "bg-[#13834e] text-white"
                    : "border border-[#dce7df] text-[#29483e] hover:bg-[#f4f8f5]"
                }`}
              >
                {pageNumber}
              </button>
            ))}

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            aria-label="Next page"
            className="h-8 w-8 rounded-lg border border-[#dce7df] text-sm text-[#29483e] disabled:cursor-not-allowed disabled:opacity-40"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}


"use client";

import { useMemo, useState } from "react";
import StaffSidebar from "./StaffSidebar";
import StaffTable from "./StaffTable";
import StaffModal from "./StaffModal";
import type { StaffMember, StaffRole } from "./types";

type StaffFilter = "All" | "Managers" | "Staff";

const initialStaff: StaffMember[] = [
  {
    id: "1",
    name: "Maria Santos",
    email: "maria@example.com",
    role: "Branch Manager",
    isActive: true,
  },
  {
    id: "2",
    name: "John Dela Cruz",
    email: "john@example.com",
    role: "Staff",
    isActive: true,
  },
  {
    id: "3",
    name: "Ana Reyes",
    email: "ana@example.com",
    role: "Staff",
    isActive: true,
  },
  {
    id: "4",
    name: "Liam Tan",
    email: "liam@example.com",
    role: "Staff",
    isActive: false,
  },
];

export default function StaffPanel() {
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
  const [activeFilter, setActiveFilter] = useState<StaffFilter>("All");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<
    "All roles" | StaffRole
  >("All roles");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] =
    useState<StaffMember | null>(null);

  const counts = useMemo(
    () => ({
      All: staff.length,
      Managers: staff.filter((member) => member.role === "Branch Manager")
        .length,
      Staff: staff.filter((member) => member.role === "Staff").length,
    }),
    [staff]
  );

  const filteredStaff = useMemo(() => {
    const query = search.trim().toLowerCase();

    return staff.filter((member) => {
      const matchesSidebar =
        activeFilter === "All" ||
        (activeFilter === "Managers" &&
          member.role === "Branch Manager") ||
        (activeFilter === "Staff" && member.role === "Staff");

      const matchesRole =
        roleFilter === "All roles" || member.role === roleFilter;

      const matchesSearch =
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query);

      return matchesSidebar && matchesRole && matchesSearch;
    });
  }, [staff, activeFilter, roleFilter, search]);

  const handleAddStaff = () => {
    setEditingMember(null);
    setModalOpen(true);
  };

  const handleEditStaff = (member: StaffMember) => {
    setEditingMember(member);
    setModalOpen(true);
  };

  const handleSaveStaff = (member: StaffMember) => {
    setStaff((previous) => {
      const exists = previous.some((item) => item.id === member.id);

      return exists
        ? previous.map((item) =>
            item.id === member.id ? member : item
          )
        : [member, ...previous];
    });

    setModalOpen(false);
    setEditingMember(null);
    setPage(1);
  };

  const handleToggleStatus = (id: string) => {
    setStaff((previous) =>
      previous.map((member) =>
        member.id === id
          ? { ...member, isActive: !member.isActive }
          : member
      )
    );
  };

  const handleSidebarFilter = (filter: StaffFilter) => {
    setActiveFilter(filter);
    setPage(1);
  };

  const handleRoleFilter = (
    value: "All roles" | StaffRole
  ) => {
    setRoleFilter(value);
    setPage(1);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row items-start gap-4">
        <StaffSidebar
          activeFilter={activeFilter}
          onFilterChange={handleSidebarFilter}
          counts={counts}
          onAddStaff={handleAddStaff}
        />

        <StaffTable
          staff={filteredStaff}
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          roleFilter={roleFilter}
          onRoleFilterChange={handleRoleFilter}
          onEdit={handleEditStaff}
          onToggleStatus={handleToggleStatus}
          page={page}
          pageSize={4}
          onPageChange={setPage}
        />
      </div>

      <StaffModal
        open={modalOpen}
        member={editingMember}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveStaff}
      />
    </>
  );
}

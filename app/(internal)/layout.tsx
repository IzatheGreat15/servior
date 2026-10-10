"use client"

import { useEffect, type ReactNode } from "react";
import InternalLayout from "@/components/internal/InternalLayout";
import { staffNavigation } from "@/components/internal/navigation/staff";
import { memberNavigation } from "@/components/internal/navigation/member";

export default function InternalRouteLayout({
  children,
}: {
  children: ReactNode;
}) {
  useEffect(() => {
    console.log(staffNavigation);
  });
  return (
    <InternalLayout navigationItems={memberNavigation.items}>
      {children}
    </InternalLayout>
  );
}
"use client";
import { usePathname } from "next/navigation";
import AdminLayout from "./AdminLayout";

export default function ConditionalAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Login page renders without the sidebar shell
  if (pathname === "/admin/login") return <>{children}</>;
  return <AdminLayout>{children}</AdminLayout>;
}

import type { Metadata } from "next";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import ConditionalAdminLayout from "./ConditionalAdminLayout";

export const metadata: Metadata = {
  title: "Admin Panel — Defacto Summer Camp 2026",
  description: "Defacto Institute Summer Camp admin dashboard",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <ConditionalAdminLayout>{children}</ConditionalAdminLayout>
    </AdminAuthProvider>
  );
}

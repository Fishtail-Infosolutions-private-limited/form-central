import React from "react";
import { getCurrentAdmin } from "@/lib/auth/guards";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();

  // If not logged in (e.g. login page), render standalone children without sidebar
  if (!admin) {
    return <>{children}</>;
  }

  return (
    <AdminShell
      admin={{
        name: admin.name,
        email: admin.email,
        role: admin.role,
      }}
    >
      {children}
    </AdminShell>
  );
}

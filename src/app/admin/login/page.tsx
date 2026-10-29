import React from "react";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/guards";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Admin Sign In | Form Central",
  description: "Administrator login for competition and event registration management.",
};

export default async function AdminLoginPage() {
  const admin = await getCurrentAdmin();
  if (admin) {
    redirect("/admin/dashboard");
  }

  return <LoginForm />;
}

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";

export default async function FormSettingsPage() {
  await requireAdmin();
  redirect("/admin/forms");
}

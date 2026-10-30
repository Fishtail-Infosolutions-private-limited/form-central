import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";

export default async function FormResponsesPage() {
  await requireAdmin();
  redirect("/admin/responses");
}

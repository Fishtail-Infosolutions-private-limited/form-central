import React from "react";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { Inbox, Download } from "lucide-react";
import { ResponsesTableView } from "@/components/responses/responses-table-view";

export default async function AdminAllResponsesPage() {
  await requireAdmin();

  const [submissions, forms] = await Promise.all([
    prisma.registrationSubmission.findMany({
      orderBy: { submittedAt: "desc" },
      include: {
        form: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        answers: true,
        uploadedFiles: true,
      },
    }),
    prisma.registrationForm.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            Submissions
          </h1>
        </div>
      </div>

      <ResponsesTableView submissions={submissions as any} forms={forms} />
    </div>
  );
}


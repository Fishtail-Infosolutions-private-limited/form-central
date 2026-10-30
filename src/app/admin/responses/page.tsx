import React from "react";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { Crown, Inbox, Download, FileText } from "lucide-react";
import { MithilaQueenApplicationsView } from "@/components/admin/mithila-queen-applications-view";
import { ResponsesTableView } from "@/components/responses/responses-table-view";

export default async function AdminAllResponsesPage() {
  await requireAdmin();

  const [mithilaQueenApps, submissions, forms] = await Promise.all([
    prisma.mithilaQueenRegistration.findMany({
      orderBy: { submittedAt: "desc" },
    }),
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
        campaignRecipients: {
          include: {
            campaign: {
              select: {
                id: true,
                name: true,
                subject: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
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
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#C5A880]">
            The Origin Foundation &bull; Participant Desk
          </span>
          <h1 className="text-3xl font-extrabold text-[#0A192F] font-serif tracking-tight flex items-center gap-2">
            <Crown className="w-7 h-7 text-[#C5A880]" />
            <span>Mithila Queen Applications & Reviews</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Independent payment verification, minor safeguarding adjudication, and confirmation PDF management.
          </p>
        </div>
      </div>

      {/* Mithila Queen Applications Review Center */}
      <MithilaQueenApplicationsView applications={mithilaQueenApps as any} />

      {/* Generic Forms Submissions Section (for complete backward compatibility) */}
      {submissions.length > 0 && (
        <div className="pt-10 border-t border-zinc-200 space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-zinc-600" />
            <h2 className="text-lg font-bold text-zinc-800">
              Legacy Form Builder Submissions
            </h2>
          </div>
          <ResponsesTableView submissions={submissions as any} forms={forms} />
        </div>
      )}
    </div>
  );
}


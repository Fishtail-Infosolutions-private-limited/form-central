import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { ArrowLeft, Inbox, FileEdit, Settings, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResponsesTableView } from "@/components/responses/responses-table-view";

export default async function FormResponsesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const form = await prisma.registrationForm.findUnique({
    where: { id },
    include: {
      submissions: {
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
      },
    },
  });

  if (!form) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/forms"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Forms</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
              {form.name}
            </h1>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                form.status === "PUBLISHED"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-zinc-100 text-zinc-600 border-zinc-200"
              }`}
            >
              {form.status === "PUBLISHED" ? "Active" : "Inactive"}
            </span>
          </div>
          <p className="text-xs text-zinc-500 font-mono mt-1">
            /register/{form.slug} &bull; {form.submissions.length} Total Registrations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/admin/forms/${form.id}/builder`}>
            <Button size="sm" variant="outline" className="text-xs gap-1.5 font-semibold">
              <FileEdit className="w-3.5 h-3.5 text-emerald-600" />
              <span>Form Builder</span>
            </Button>
          </Link>
          <Link href={`/admin/forms/${form.id}`}>
            <Button size="sm" variant="outline" className="text-xs gap-1.5 font-semibold">
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </Button>
          </Link>
          <Link href={`/register/${form.slug}`} target="_blank">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1 font-semibold">
              <span>Live Public Form</span>
              <ExternalLink className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </div>

      <ResponsesTableView
        submissions={form.submissions as any}
        forms={[{ id: form.id, name: form.name }]}
        currentFormId={form.id}
      />
    </div>
  );
}


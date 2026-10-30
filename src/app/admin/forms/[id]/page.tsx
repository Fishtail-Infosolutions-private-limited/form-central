import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import {
  ArrowLeft,
  FileEdit,
  Inbox,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormQrCard } from "@/components/admin/form-qr-card";
import { FormSettingsForm } from "@/components/admin/form-settings-form";
import { DeleteFormCard } from "@/components/admin/delete-form-card";

export default async function FormSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const form = await prisma.registrationForm.findUnique({
    where: { id },
    include: {
      _count: {
        select: { submissions: true },
      },
    },
  });

  if (!form) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/admin/forms"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Forms</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/register/${form.slug}`} target="_blank">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs border-zinc-200">
              <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
              <span>Live Form</span>
            </Button>
          </Link>
          <Link href={`/admin/forms/${form.id}/responses`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs border-zinc-200">
              <Inbox className="w-3.5 h-3.5 text-zinc-500" />
              <span>Submissions ({form._count.submissions})</span>
            </Button>
          </Link>
          <Link href={`/admin/forms/${form.id}/builder`}>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs">
              <FileEdit className="w-3.5 h-3.5" />
              <span>Open Builder</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 1. Public Registration URL & High-Quality QR Code */}
      <FormQrCard
        formId={form.id}
        formName={form.name}
        slug={form.slug}
      />

      {/* 2. Organized Settings Form (Basic Info, Capacity, Nepal Deadline, Status) */}
      <FormSettingsForm
        form={{
          id: form.id,
          name: form.name,
          slug: form.slug,
          description: form.description,
          instructions: form.instructions,
          status: form.status,
          opensAt: form.opensAt,
          closesAt: form.closesAt,
          isUnlimitedCapacity: form.isUnlimitedCapacity,
          maxParticipants: form.maxParticipants,
          isDeadlineEnabled: form.isDeadlineEnabled,
          registrationDeadline: form.registrationDeadline,
          eventDate: form.eventDate,
          eventVenue: form.eventVenue,
          enableReminder7Days: form.enableReminder7Days,
          enableReminder3Days: form.enableReminder3Days,
          enableReminder1Day: form.enableReminder1Day,
          enableReminderEventDay: form.enableReminderEventDay,
          submissionCount: form._count.submissions,
        }}
      />

      {/* 3. Delete Form Danger Zone */}
      <DeleteFormCard
        formId={form.id}
        formName={form.name}
        submissionCount={form._count.submissions}
      />
    </div>
  );
}

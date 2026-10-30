import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { RegistrationWizard } from "@/components/registration/registration-wizard";
import { FormSchemaDefinition } from "@/types/form";
import { checkFormAvailability } from "@/lib/forms/availability";
import { AlertTriangle, Clock, CalendarX2, Users, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const form = await prisma.registrationForm.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });

  if (!form) return { title: "Registration Not Found | Form Central" };
  return {
    title: `Register for ${form.name} | Form Central`,
    description: form.description || "Official event and competition registration portal.",
  };
}

export default async function PublicRegistrationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const form = await prisma.registrationForm.findUnique({
    where: { slug },
    include: {
      versions: {
        orderBy: { versionNumber: "desc" },
        take: 1,
      },
    },
  });

  if (!form) {
    notFound();
  }

  // Evaluate form availability
  const availability = await checkFormAvailability(form);

  if (!availability.isAvailable) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white p-8 text-center rounded-2xl shadow-sm border border-zinc-200">
          <div className="w-14 h-14 bg-zinc-100 text-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
            {availability.status === "CAPACITY_FULL" ? (
              <Users className="w-7 h-7 text-rose-600" />
            ) : availability.status === "DEADLINE_PASSED" ? (
              <CalendarX2 className="w-7 h-7 text-zinc-800" />
            ) : availability.status === "NOT_OPEN_YET" ? (
              <Clock className="w-7 h-7 text-emerald-600" />
            ) : availability.status === "CLOSED" ? (
              <Lock className="w-7 h-7 text-zinc-800" />
            ) : (
              <AlertTriangle className="w-7 h-7 text-amber-600" />
            )}
          </div>
          <h2 className="text-xl font-bold text-black">{availability.headline}</h2>
          <p className="text-xs text-zinc-600 mt-2 mb-4 leading-relaxed">
            {availability.message}
          </p>

          {availability.status === "DEADLINE_PASSED" && availability.formattedDeadline && (
            <div className="text-[11px] font-semibold text-zinc-600 bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 mb-2">
              Registration Deadline: {availability.formattedDeadline}
            </div>
          )}

          {availability.status === "CAPACITY_FULL" && (
            <div className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2.5 mb-2">
              Maximum Capacity: {availability.maxParticipants} participants reached.
            </div>
          )}

          <div className="text-[11px] text-zinc-400 border-t border-zinc-100 pt-3 mt-3">
            Please contact the event administrator for further inquiries.
          </div>
        </Card>
      </div>
    );
  }

  const publishedVersion = form.versions[0];
  if (!publishedVersion) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white p-8 text-center rounded-2xl border border-zinc-200 shadow-sm">
          <p className="text-sm text-zinc-600">No published version found for this event form.</p>
        </Card>
      </div>
    );
  }

  const schema = publishedVersion.schema as unknown as FormSchemaDefinition;

  return (
    <div className="min-h-screen bg-zinc-50/80 pb-16">
      <RegistrationWizard
        form={{
          id: form.id,
          name: form.name,
          slug: form.slug,
          description: form.description,
          instructions: form.instructions,
        }}
        schema={schema}
      />
    </div>
  );
}

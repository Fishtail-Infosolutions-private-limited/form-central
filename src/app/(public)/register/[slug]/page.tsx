import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { RegistrationWizard } from "@/components/registration/registration-wizard";
import { FormSchemaDefinition } from "@/types/form";
import { AlertTriangle, Clock, CalendarX2 } from "lucide-react";
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

  const now = new Date();

  // If unpublished or draft
  if (form.status !== "PUBLISHED") {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white p-8 text-center rounded-2xl shadow-sm border border-zinc-200">
          <div className="w-14 h-14 bg-zinc-100 text-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-black">Registration Unavailable</h2>
          <p className="text-xs text-zinc-600 mt-2 mb-4 leading-relaxed">
            <strong>{form.name}</strong> is currently not accepting public registrations at this time.
          </p>
          <div className="text-[11px] text-zinc-400 border-t border-zinc-100 pt-3">
            Please check back later or contact the event administrator.
          </div>
        </Card>
      </div>
    );
  }

  // If date is before opensAt
  if (form.opensAt && form.opensAt > now) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white p-8 text-center rounded-2xl shadow-sm border border-zinc-200">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Clock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-black">Registration Opening Soon</h2>
          <p className="text-xs text-zinc-600 mt-2 mb-4 leading-relaxed">
            Registration for <strong>{form.name}</strong> opens on{" "}
            <strong>{form.opensAt.toLocaleDateString()} at {form.opensAt.toLocaleTimeString()}</strong>.
          </p>
        </Card>
      </div>
    );
  }

  // If date is after closesAt
  if (form.closesAt && form.closesAt < now) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white p-8 text-center rounded-2xl shadow-sm border border-zinc-200">
          <div className="w-14 h-14 bg-zinc-100 text-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CalendarX2 className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-black">Registration Closed</h2>
          <p className="text-xs text-zinc-600 mt-2 mb-4 leading-relaxed">
            Entries for <strong>{form.name}</strong> have officially closed.
          </p>
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

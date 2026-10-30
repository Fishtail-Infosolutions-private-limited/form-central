import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import {
  ArrowLeft,
  Settings,
  FileEdit,
  Inbox,
  ExternalLink,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { updateFormSettingsAction } from "@/server/actions/form-actions";
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

  const handleUpdate = async (formData: FormData) => {
    "use server";
    await updateFormSettingsAction(id, formData);
  };

  const formatIsoForInput = (d: Date | null) => {
    if (!d) return "";
    const pad = (n: number) => n.toString().padStart(2, "0");
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

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

      {/* Main Settings Card */}
      <Card className="border-zinc-200 shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-zinc-100 text-zinc-800 flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-zinc-900">
                  Form Settings & Details
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500">
                  Configure titles, URL identifiers, and registration schedule limits.
                </CardDescription>
              </div>
            </div>

            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                form.status === "PUBLISHED"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-zinc-100 text-zinc-600 border-zinc-200"
              }`}
            >
              {form.status === "PUBLISHED" ? "Active" : "Inactive"}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <form action={handleUpdate} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name" required>
                Event Name
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={form.name}
                required
              />
            </div>

            {/* Slug editing warning */}
            <div className="space-y-1.5">
              <Label htmlFor="slug" required>
                Public Registration Slug
              </Label>
              <div className="flex rounded-lg shadow-2xs">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-zinc-200 bg-zinc-50 text-zinc-500 text-xs font-mono">
                  /register/
                </span>
                <Input
                  id="slug"
                  name="slug"
                  defaultValue={form.slug}
                  className="rounded-l-none font-mono text-sm border-zinc-300"
                  required
                />
              </div>
              <div className="flex items-start gap-2 p-2.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs mt-1">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-zinc-700" />
                <span>
                  <strong>Warning:</strong> Changing this slug changes the public URL. Any existing QR codes or shared participant registration links will no longer reach this form.
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Event Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={form.description || ""}
                rows={3}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="instructions">Participant Instructions (Optional)</Label>
              <Textarea
                id="instructions"
                name="instructions"
                defaultValue={form.instructions || ""}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div className="space-y-1.5">
                <Label htmlFor="opensAt">Registration Opens At</Label>
                <Input
                  id="opensAt"
                  name="opensAt"
                  type="datetime-local"
                  defaultValue={formatIsoForInput(form.opensAt)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="closesAt">Registration Closes At</Label>
                <Input
                  id="closesAt"
                  name="closesAt"
                  type="datetime-local"
                  defaultValue={formatIsoForInput(form.closesAt)}
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <Link
                href={`/register/${form.slug}`}
                target="_blank"
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
              >
                <span>View Public Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 font-semibold px-6"
              >
                Save Settings
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <DeleteFormCard
        formId={form.id}
        formName={form.name}
        submissionCount={form._count.submissions}
      />
    </div>
  );
}

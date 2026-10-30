import React from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import {
  FileText,
  CheckCircle2,
  Users,
  Clock,
  ArrowRight,
  PlusCircle,
  Eye,
  HardDrive,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();

  // Query actual metrics and Google Drive integration status
  const [
    totalForms,
    publishedForms,
    totalSubmissions,
    recentSubmissions,
    forms,
    driveIntegration,
  ] = await Promise.all([
    prisma.registrationForm.count(),
    prisma.registrationForm.count({ where: { status: "PUBLISHED" } }),
    prisma.registrationSubmission.count(),
    prisma.registrationSubmission.findMany({
      take: 8,
      orderBy: { submittedAt: "desc" },
      include: {
        form: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    }),
    prisma.registrationForm.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: { submissions: true },
        },
      },
    }),
    prisma.googleDriveIntegration.findUnique({
      where: { id: "primary" },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Clean Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/forms">
            <Button variant="outline" className="gap-2 text-xs h-9 border-zinc-300">
              <FileText className="w-4 h-4 text-zinc-600" />
              <span>All Forms</span>
            </Button>
          </Link>
          <Link href="/admin/forms/new">
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 font-semibold">
              <PlusCircle className="w-4 h-4" />
              <span>Create New Form</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Google Drive Status Notification (Small clean banner if disconnected) */}
      {!driveIntegration?.isConnected && (
        <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center shrink-0">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Google Drive is not connected</p>
              <p className="text-[11px] text-zinc-400">
                Connect your Google account in Settings to receive registration video uploads directly into Drive.
              </p>
            </div>
          </div>
          <Link href="/admin/settings/integrations/google-drive">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-8 px-3 shrink-0">
              Connect Drive
            </Button>
          </Link>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-zinc-200 shadow-xs hover:border-zinc-300 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Total Forms
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-zinc-900">{totalForms}</div>
            <p className="text-xs text-zinc-500 mt-1">
              Active configuration schemas
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-xs hover:border-zinc-300 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Active Forms
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-emerald-700">{publishedForms}</div>
            <p className="text-xs text-zinc-500 mt-1">
              Accepting public submissions
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-xs hover:border-zinc-300 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-800">
              Total Registrations
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-zinc-900">{totalSubmissions}</div>
            <p className="text-xs text-zinc-500 mt-1">
              Verified participant submissions
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-xs hover:border-zinc-300 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-800">
              Recent Submissions
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-800 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-black">
              {recentSubmissions.length}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Entries logged in recent batch
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Submissions Table (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-zinc-900 tracking-tight">
                Recent Submissions
              </h2>
            </div>
            <Link
              href="/admin/responses"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>View All Responses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <Card className="overflow-hidden border-zinc-200">
            {recentSubmissions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center mb-3">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-zinc-800 text-sm">No registrations yet</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
                  Once participants submit registrations, their verified records will appear here in real time.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-50 text-zinc-500 text-xs font-semibold uppercase tracking-wider border-b border-zinc-200">
                    <tr>
                      <th className="px-4 py-3">Participant</th>
                      <th className="px-4 py-3">Event / Form</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Submitted At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {recentSubmissions.map((sub) => {
                      const isRead = sub.status === "APPROVED";
                      return (
                        <tr key={sub.id} className="hover:bg-zinc-50/80 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-zinc-900">{sub.fullName}</div>
                            <div className="text-xs text-zinc-500 font-mono flex items-center gap-1.5">
                              <span className="text-emerald-700 font-bold">{sub.referenceNumber}</span>
                              <span>&bull;</span>
                              <span>{sub.email}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-zinc-600 font-medium">
                            {sub.form.name}
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                isRead
                                  ? "bg-zinc-100 text-zinc-600 border border-zinc-200"
                                  : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              }`}
                            >
                              {isRead ? "Read" : "Unread"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-zinc-500 whitespace-nowrap">
                            {formatDateTime(sub.submittedAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Competition Forms Quick Overview (1 col) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-900 tracking-tight">Active Forms</h2>
            <Link
              href="/admin/forms"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {forms.length === 0 ? (
              <Card className="p-6 text-center border-dashed border-zinc-200 bg-white">
                <p className="text-xs text-zinc-500 mb-3">No registration forms created yet.</p>
                <Link href="/admin/forms/new">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold">
                    Create First Form
                  </Button>
                </Link>
              </Card>
            ) : (
              forms.map((form) => {
                const isActive = form.status === "PUBLISHED";
                return (
                  <Card
                    key={form.id}
                    className="p-4 border-zinc-200 hover:border-zinc-300 transition-all hover:shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              isActive
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                            }`}
                          >
                            {isActive ? "Active" : "Inactive"}
                          </span>
                          <span className="text-xs text-zinc-400 font-mono truncate">
                            /{form.slug}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-zinc-900 truncate">{form.name}</h3>
                        <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">
                          {form.description || "No description provided"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                      <span className="font-semibold text-zinc-700">
                        {form._count.submissions} {form._count.submissions === 1 ? "submission" : "submissions"}
                      </span>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/register/${form.slug}`}
                          target="_blank"
                          className="text-zinc-500 hover:text-emerald-700 font-medium flex items-center gap-0.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Live</span>
                        </Link>
                        <Link
                          href={`/admin/forms/${form.id}/builder`}
                          className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-0.5"
                        >
                          <span>Builder</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

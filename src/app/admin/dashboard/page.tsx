import React from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import {
  Crown,
  FileText,
  CheckCircle2,
  Users,
  Clock,
  ArrowRight,
  PlusCircle,
  Eye,
  HardDrive,
  AlertCircle,
  AlertTriangle,
  CreditCard,
  FileCheck2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNepalDateTime } from "@/lib/utils/timezone";

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();

  // Query actual metrics for Mithila Queen and forms
  const [
    totalMithilaQueens,
    paymentsUnderReview,
    paymentsVerified,
    applicationsApproved,
    recentMithilaQueenRegistrations,
    totalForms,
    publishedForms,
    driveIntegration,
    forms,
  ] = await Promise.all([
    prisma.mithilaQueenRegistration.count(),
    prisma.mithilaQueenRegistration.count({ where: { paymentStatus: "UNDER_REVIEW" } }),
    prisma.mithilaQueenRegistration.count({ where: { paymentStatus: "VERIFIED" } }),
    prisma.mithilaQueenRegistration.count({ where: { applicationStatus: "APPROVED" } }),
    prisma.mithilaQueenRegistration.findMany({
      take: 6,
      orderBy: { submittedAt: "desc" },
    }),
    prisma.registrationForm.count(),
    prisma.registrationForm.count({ where: { status: "PUBLISHED" } }),
    prisma.googleDriveIntegration.findUnique({
      where: { id: "primary" },
    }),
    prisma.registrationForm.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { submissions: true },
        },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#C5A880]">
            The Origin Foundation • Janakpur Dham
          </span>
          <h1 className="text-3xl font-extrabold text-[#0A192F] font-serif tracking-tight">
            Origin Foundation Command Center
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Signed in as <strong>{admin.name}</strong> ({admin.email})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/responses">
            <Button className="gap-2 bg-[#0A192F] hover:bg-[#243B53] text-[#FDFBF7] text-xs h-9 font-bold shadow-xs">
              <Crown className="w-4 h-4 text-[#C5A880]" />
              <span>Review Applications</span>
            </Button>
          </Link>
          <Link href="/admin/forms/new">
            <Button variant="outline" className="gap-2 border-zinc-300 text-xs h-9 font-semibold">
              <PlusCircle className="w-4 h-4 text-zinc-600" />
              <span>New Form</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Google Drive Status Notification (Warning Alert banner if disconnected) */}
      {!driveIntegration?.isConnected && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900">Google Drive is not connected</p>
              <p className="text-[11px] text-amber-700">
                Connect your Google account in Settings to receive registration video uploads and documents directly into Drive.
              </p>
            </div>
          </div>
          <Link href="/admin/settings/integrations/google-drive">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs h-8 px-3 shrink-0 shadow-2xs">
              Connect Drive
            </Button>
          </Link>
        </div>
      )}

      {/* MITHILA QUEEN PRIMARY METRICS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A192F] font-serif flex items-center gap-2">
            <Crown className="w-4 h-4 text-[#C5A880]" />
            <span>Mithila Queen 2026 • Live Registration Metrics</span>
          </h2>
          <span className="text-xs text-zinc-500 font-mono">Fee: NPR 399</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-[#E9E2D5] shadow-xs hover:border-[#C5A880] transition-colors bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#0A192F]">
                Total Registrations
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-[#0A192F] text-[#C5A880] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-[#0A192F]">{totalMithilaQueens}</div>
              <p className="text-xs text-zinc-500 mt-1">
                Submitted applicant records
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#E9E2D5] shadow-xs hover:border-amber-400 transition-colors bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                Payments Under Review
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-amber-700">{paymentsUnderReview}</div>
              <p className="text-xs text-zinc-500 mt-1">
                Awaiting bank receipt verification
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#E9E2D5] shadow-xs hover:border-emerald-400 transition-colors bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                Payments Verified
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-emerald-700">{paymentsVerified}</div>
              <p className="text-xs text-zinc-500 mt-1">
                Settled & verified entries
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#E9E2D5] shadow-xs hover:border-[#0A192F] transition-colors bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#0A192F]">
                Approved Participants
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-[#0A192F] text-white flex items-center justify-center">
                <FileCheck2 className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-[#0A192F]">{applicationsApproved}</div>
              <p className="text-xs text-zinc-500 mt-1">
                PDF confirmation generated
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 2-COLUMN MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RECENT MITHILA QUEEN APPLICATIONS TABLE (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#0A192F] font-serif tracking-tight">
                Recent Mithila Queen Applications
              </h2>
              <p className="text-xs text-zinc-500">
                Latest participant entries with real-time payment and adjudication states.
              </p>
            </div>
            <Link
              href="/admin/responses"
              className="text-xs font-bold text-[#0A192F] hover:text-[#C5A880] flex items-center gap-1"
            >
              <span>Open All Applications</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <Card className="overflow-hidden border-[#E9E2D5] shadow-xs">
            {recentMithilaQueenRegistrations.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center mb-3">
                  <Crown className="w-6 h-6 text-[#C5A880]" />
                </div>
                <h3 className="font-semibold text-zinc-800 text-sm">No Mithila Queen registrations yet</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
                  Once participants submit their 7-step application on the website, their records will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FDFBF7] text-zinc-600 border-b border-[#E9E2D5] font-semibold">
                    <tr>
                      <th className="py-3 px-4">Registration ID</th>
                      <th className="py-3 px-4">Participant Name</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Payment Status</th>
                      <th className="py-3 px-4">Application Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9E2D5]">
                    {recentMithilaQueenRegistrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#0A192F]">
                          {reg.registrationId}
                        </td>
                        <td className="py-3 px-4 font-semibold text-zinc-900">
                          {reg.fullName} {reg.isMinor ? <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">Minor</span> : ""}
                        </td>
                        <td className="py-3 px-4 text-zinc-600 font-mono">
                          {reg.email}
                        </td>
                        <td className="py-3 px-4 text-zinc-600">
                          {reg.district}, {reg.province}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              reg.paymentStatus === "VERIFIED"
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : reg.paymentStatus === "UNDER_REVIEW"
                                ? "bg-amber-50 text-amber-800 border border-amber-200"
                                : reg.paymentStatus === "CLARIFICATION_REQUIRED"
                                ? "bg-orange-50 text-orange-800 border border-orange-200"
                                : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                            }`}
                          >
                            {reg.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              reg.applicationStatus === "APPROVED"
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : reg.applicationStatus === "REJECTED"
                                ? "bg-rose-50 text-rose-800 border border-rose-200"
                                : reg.applicationStatus === "ACTION_REQUIRED"
                                ? "bg-amber-50 text-amber-800 border border-amber-200"
                                : "bg-blue-50 text-blue-800 border border-blue-200"
                            }`}
                          >
                            {reg.applicationStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link href="/admin/responses">
                            <Button size="sm" variant="outline" className="text-xs h-7 px-2.5 border-[#E9E2D5] text-[#0A192F] hover:bg-[#E9E2D5]/50">
                              Inspect
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
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
                          href={`/admin/forms/${form.id}`}
                          className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-0.5"
                        >
                          <span>Edit</span>
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

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
  AlertTriangle,
  FileCheck2,
  XCircle,
  HelpCircle,
  Mail,
  Send,
  Calendar,
  MapPin,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  History,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MithilaHeritageMandala } from "@/components/brand/brand-logos";
import { formatNepalDateTime } from "@/lib/utils/timezone";

export const metadata = {
  title: "Admin Dashboard | The Origin Foundation",
};

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();

  // Query merged metrics across Mithila Queen and Generic Forms
  const [
    totalMithilaQueens,
    paymentsUnderReview,
    paymentsVerified,
    paymentsClarification,
    appsUnderReview,
    appsApproved,
    appsRejected,
    appsActionRequired,
    recentMithilaQueenRegistrations,
    totalForms,
    publishedForms,
    driveIntegration,
    forms,
    totalSubmissions,
    sentEmailsCount,
    failedEmailsCount,
    campaignsCount,
    recentAuditLogs,
    recentPaymentReviews,
  ] = await Promise.all([
    prisma.mithilaQueenRegistration.count(),
    prisma.mithilaQueenRegistration.count({ where: { paymentStatus: "UNDER_REVIEW" } }),
    prisma.mithilaQueenRegistration.count({ where: { paymentStatus: "VERIFIED" } }),
    prisma.mithilaQueenRegistration.count({ where: { paymentStatus: "CLARIFICATION_REQUIRED" } }),
    prisma.mithilaQueenRegistration.count({ where: { applicationStatus: { in: ["UNDER_REVIEW", "SUBMITTED"] } } }),
    prisma.mithilaQueenRegistration.count({ where: { applicationStatus: "APPROVED" } }),
    prisma.mithilaQueenRegistration.count({ where: { applicationStatus: "REJECTED" } }),
    prisma.mithilaQueenRegistration.count({ where: { applicationStatus: "ACTION_REQUIRED" } }),
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
      take: 4,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { submissions: true },
        },
      },
    }),
    prisma.registrationSubmission.count(),
    prisma.emailCampaignRecipient.count({ where: { status: { in: ["SENT", "DELIVERED"] } } }),
    prisma.emailCampaignRecipient.count({ where: { status: { in: ["FAILED", "BOUNCED"] } } }),
    prisma.emailCampaign.count(),
    prisma.auditLog.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { actor: { select: { name: true, email: true } } },
    }),
    prisma.paymentReviewLog.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        reviewer: { select: { name: true, email: true } },
        registration: { select: { registrationId: true, fullName: true } },
      },
    }),
  ]);

  const grandTotalRegistrations = totalMithilaQueens + totalSubmissions;

  return (
    <div className="space-y-8">
      {/* Editorial Cultural Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DFD0] pb-6 bg-[#FFFFFF] p-6 rounded-lg border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MithilaHeritageMandala className="w-5 h-5 text-[#B69A65]" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#B69A65]">
              The Origin Foundation &bull; Janakpur Dham
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#172B24] tracking-tight">
            Origin Foundation Command Center
          </h1>
          <p className="text-xs sm:text-sm text-[#292821]/70">
            Signed in as <strong className="text-[#172B24]">{admin.name}</strong> ({admin.email}) &bull; Nepal Standard Time (UTC+05:45)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/responses">
            <Button className="gap-2 bg-[#172B24] hover:bg-[#172B24]/90 text-[#F5F0E6] text-xs h-9 font-medium border border-[#B69A65]/40 shadow-none">
              <Crown className="w-4 h-4 text-[#B69A65]" />
              <span>Review Applications</span>
            </Button>
          </Link>
          <Link href="/admin/forms/new">
            <Button variant="outline" className="gap-2 border-[#E8DFD0] text-[#172B24] hover:bg-[#F5F0E6] text-xs h-9 font-medium shadow-none">
              <PlusCircle className="w-4 h-4 text-[#A64B36]" />
              <span>New Form</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Google Drive Status Alert if disconnected */}
      {!driveIntegration?.isConnected && (
        <div className="p-4 rounded-lg bg-[#FAF5EE] border border-[#B69A65]/30 text-[#172B24] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-[#F5F0E6] border border-[#B69A65]/50 text-[#A64B36] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-[#A64B36]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#172B24]">Google Drive is not connected</p>
              <p className="text-[11px] text-[#292821]/80">
                Connect your institutional Google account in Settings to receive participant audition videos and citizenship proofs directly into Drive.
              </p>
            </div>
          </div>
          <Link href="/admin/settings?tab=integrations">
            <Button size="sm" className="bg-[#A64B36] hover:bg-[#A64B36]/90 text-[#FFFFFF] text-xs h-8 px-3 shrink-0 shadow-none">
              Connect Drive
            </Button>
          </Link>
        </div>
      )}

      {/* FLAGSHIP COMPETITION HERO STATUS BANNER */}
      <div className="bg-[#172B24] text-[#F5F0E6] rounded-lg p-6 border border-[#B69A65]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-[#B69A65]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#B69A65]">
              Flagship Competition &bull; 2026 Edition
            </span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#F5F0E6] tracking-tight">
            Mithila Queen
          </h2>
          <p className="text-xs text-[#E8DFD0]/90 leading-relaxed">
            Celebrating Mithila&apos;s Culture, Confidence & Talent. Janakpur Dham, Nepal. Registration Fee: NPR 399. Official event date & time are currently <span className="font-semibold text-[#B69A65]">To Be Announced</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="bg-[#172B24]/80 border border-[#B69A65]/40 rounded-md p-3 px-4 min-w-[120px] text-center">
            <div className="text-[10px] uppercase font-bold tracking-wider text-[#B69A65]">Total Applicants</div>
            <div className="text-2xl font-serif font-bold text-[#FFFFFF]">{totalMithilaQueens}</div>
          </div>
          <div className="bg-[#172B24]/80 border border-[#B69A65]/40 rounded-md p-3 px-4 min-w-[120px] text-center">
            <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Verified Paid</div>
            <div className="text-2xl font-serif font-bold text-emerald-300">{paymentsVerified}</div>
          </div>
          <div className="bg-[#172B24]/80 border border-[#B69A65]/40 rounded-md p-3 px-4 min-w-[120px] text-center">
            <div className="text-[10px] uppercase font-bold tracking-wider text-[#E8DFD0]">Approved Final</div>
            <div className="text-2xl font-serif font-bold text-[#FFFFFF]">{appsApproved}</div>
          </div>
        </div>
      </div>

      {/* UNIFIED CLICKABLE METRICS GRID */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#172B24] font-serif flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#B69A65]" />
            <span>Registration & Review Statistics</span>
          </h2>
          <span className="text-xs text-[#292821]/60">Click any card to filter applications</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Registrations */}
          <Link href="/admin/responses" className="group block">
            <Card className="border-[#E8DFD0] hover:border-[#172B24] transition-all bg-[#FFFFFF] shadow-none h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#172B24]">
                  Total Registrations
                </CardTitle>
                <div className="w-8 h-8 rounded bg-[#172B24] text-[#B69A65] flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-serif font-bold text-[#172B24]">{grandTotalRegistrations}</div>
                <div className="flex items-center justify-between mt-2 text-xs text-[#292821]/70">
                  <span>{totalMithilaQueens} Queen &bull; {totalSubmissions} Others</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#B69A65] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Payments Pending Verification */}
          <Link href="/admin/responses?paymentStatus=UNDER_REVIEW" className="group block">
            <Card className="border-[#E8DFD0] hover:border-[#A64B36] transition-all bg-[#FFFFFF] shadow-none h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#A64B36]">
                  Payments Pending Review
                </CardTitle>
                <div className="w-8 h-8 rounded bg-[#FAF5EE] text-[#A64B36] border border-[#A64B36]/30 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-serif font-bold text-[#A64B36]">{paymentsUnderReview}</div>
                <div className="flex items-center justify-between mt-2 text-xs text-[#292821]/70">
                  <span>Awaiting receipt confirmation</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#A64B36] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Payments Verified */}
          <Link href="/admin/responses?paymentStatus=VERIFIED" className="group block">
            <Card className="border-[#E8DFD0] hover:border-emerald-600 transition-all bg-[#FFFFFF] shadow-none h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                  Payments Verified
                </CardTitle>
                <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-serif font-bold text-emerald-700">{paymentsVerified}</div>
                <div className="flex items-center justify-between mt-2 text-xs text-[#292821]/70">
                  <span>eSewa & bank verified entries</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Approved Participants */}
          <Link href="/admin/responses?applicationStatus=APPROVED" className="group block">
            <Card className="border-[#E8DFD0] hover:border-[#172B24] transition-all bg-[#FFFFFF] shadow-none h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#172B24]">
                  Approved Candidates
                </CardTitle>
                <div className="w-8 h-8 rounded bg-[#172B24] text-[#FFFFFF] flex items-center justify-center">
                  <FileCheck2 className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-serif font-bold text-[#172B24]">{appsApproved}</div>
                <div className="flex items-center justify-between mt-2 text-xs text-[#292821]/70">
                  <span>Adjudicated with passes</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#B69A65] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Under Review */}
          <Link href="/admin/responses?applicationStatus=UNDER_REVIEW" className="group block">
            <Card className="border-[#E8DFD0] hover:border-[#B69A65] transition-all bg-[#FFFFFF] shadow-none h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#B69A65]">
                  Applications Under Review
                </CardTitle>
                <div className="w-8 h-8 rounded bg-[#FAF5EE] text-[#B69A65] border border-[#B69A65]/40 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-serif font-bold text-[#172B24]">{appsUnderReview}</div>
                <div className="flex items-center justify-between mt-2 text-xs text-[#292821]/70">
                  <span>In jury adjudication queue</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#B69A65] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Action Required */}
          <Link href="/admin/responses?applicationStatus=ACTION_REQUIRED" className="group block">
            <Card className="border-[#E8DFD0] hover:border-amber-600 transition-all bg-[#FFFFFF] shadow-none h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                  Action Required
                </CardTitle>
                <div className="w-8 h-8 rounded bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-serif font-bold text-amber-700">{appsActionRequired + paymentsClarification}</div>
                <div className="flex items-center justify-between mt-2 text-xs text-[#292821]/70">
                  <span>Receipt or minor doc resubmission</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Rejected */}
          <Link href="/admin/responses?applicationStatus=REJECTED" className="group block">
            <Card className="border-[#E8DFD0] hover:border-rose-600 transition-all bg-[#FFFFFF] shadow-none h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-rose-800">
                  Rejected Applications
                </CardTitle>
                <div className="w-8 h-8 rounded bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center">
                  <XCircle className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-serif font-bold text-rose-700">{appsRejected}</div>
                <div className="flex items-center justify-between mt-2 text-xs text-[#292821]/70">
                  <span>Did not meet criteria</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Email Campaigns */}
          <Link href="/admin/campaigns" className="group block">
            <Card className="border-[#E8DFD0] hover:border-[#172B24] transition-all bg-[#FFFFFF] shadow-none h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#172B24]">
                  Email Campaigns
                </CardTitle>
                <div className="w-8 h-8 rounded bg-[#172B24] text-[#B69A65] flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-serif font-bold text-[#172B24]">{campaignsCount}</div>
                <div className="flex items-center justify-between mt-2 text-xs text-[#292821]/70">
                  <span>{sentEmailsCount} sent &bull; {failedEmailsCount} failed</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#B69A65] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* 2-COLUMN MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RECENT MITHILA QUEEN APPLICATIONS TABLE (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-serif font-bold text-[#172B24] tracking-tight">
                Recent Mithila Queen Registrations
              </h2>
              <p className="text-xs text-[#292821]/70">
                Latest submissions with real-time verification status.
              </p>
            </div>
            <Link
              href="/admin/responses"
              className="text-xs font-semibold text-[#A64B36] hover:text-[#172B24] flex items-center gap-1"
            >
              <span>View All Applications</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <Card className="overflow-hidden border-[#E8DFD0] bg-[#FFFFFF] shadow-none">
            {recentMithilaQueenRegistrations.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-[#FAF5EE] text-[#B69A65] mx-auto flex items-center justify-center mb-3">
                  <Crown className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-[#172B24] text-sm">No Mithila Queen registrations yet</h3>
                <p className="text-xs text-[#292821]/60 max-w-sm mx-auto mt-1">
                  Once applicants submit the registration form, their full dossiers will appear here for review.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF5EE] text-[#172B24] border-b border-[#E8DFD0] font-semibold">
                    <tr>
                      <th className="py-3 px-4 font-serif">Reg ID</th>
                      <th className="py-3 px-4 font-serif">Candidate</th>
                      <th className="py-3 px-4 font-serif">District</th>
                      <th className="py-3 px-4 font-serif">Payment</th>
                      <th className="py-3 px-4 font-serif">Status</th>
                      <th className="py-3 px-4 text-right font-serif">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DFD0]">
                    {recentMithilaQueenRegistrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-[#FAF5EE]/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#172B24]">
                          {reg.registrationId}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#172B24]">{reg.fullName}</div>
                          {reg.isMinor && (
                            <span className="text-[10px] text-[#A64B36] font-bold bg-[#FAF5EE] px-1.5 py-0.2 rounded border border-[#A64B36]/30">
                              Minor (Under 18)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-[#292821]/70">
                          {reg.district || "Janakpur Dham"}
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
                            {reg.paymentStatus.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              reg.applicationStatus === "APPROVED"
                                ? "bg-[#172B24] text-[#FFFFFF]"
                                : reg.applicationStatus === "REJECTED"
                                ? "bg-rose-50 text-rose-800 border border-rose-200"
                                : reg.applicationStatus === "ACTION_REQUIRED"
                                ? "bg-amber-50 text-amber-800 border border-amber-200"
                                : "bg-[#FAF5EE] text-[#B69A65] border border-[#B69A65]/40"
                            }`}
                          >
                            {reg.applicationStatus.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link href="/admin/responses">
                            <Button size="sm" variant="outline" className="text-xs h-7 px-2.5 border-[#E8DFD0] text-[#172B24] hover:bg-[#FAF5EE]">
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

        {/* RECENT ADMINISTRATIVE ACTIVITIES & FORMS (1 col) */}
        <div className="space-y-6">
          {/* Active Forms */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-serif font-bold text-[#172B24] tracking-tight">Active Forms</h2>
              <Link
                href="/admin/forms"
                className="text-xs font-semibold text-[#A64B36] hover:text-[#172B24] flex items-center gap-1"
              >
                <span>Manage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2">
              {forms.map((form) => {
                const isActive = form.status === "PUBLISHED";
                return (
                  <Card
                    key={form.id}
                    className="p-3 border-[#E8DFD0] bg-[#FFFFFF] shadow-none hover:border-[#B69A65]/70 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                              isActive
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                            }`}
                          >
                            {isActive ? "Active" : "Draft"}
                          </span>
                          <span className="text-[11px] text-[#292821]/50 font-mono truncate">
                            /{form.slug}
                          </span>
                        </div>
                        <h3 className="font-bold text-xs text-[#172B24] truncate">{form.name}</h3>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-semibold text-[#172B24]">
                          {form._count.submissions} subs
                        </div>
                        <Link
                          href={`/admin/forms/${form.id}/builder`}
                          className="text-[11px] text-[#A64B36] hover:underline"
                        >
                          Builder
                        </Link>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Recent Administrative Activity Log */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-serif font-bold text-[#172B24] tracking-tight flex items-center gap-1.5">
                <History className="w-4 h-4 text-[#B69A65]" />
                <span>Admin Activity</span>
              </h2>
            </div>

            <Card className="p-4 border-[#E8DFD0] bg-[#FFFFFF] shadow-none">
              {recentPaymentReviews.length === 0 && recentAuditLogs.length === 0 ? (
                <p className="text-xs text-[#292821]/60 text-center py-4">No recent administrative events recorded.</p>
              ) : (
                <div className="space-y-3">
                  {recentPaymentReviews.slice(0, 4).map((log) => (
                    <div key={log.id} className="text-xs border-b border-[#E8DFD0]/60 pb-2.5 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between text-[11px] text-[#292821]/60">
                        <span className="font-semibold text-[#172B24]">{log.reviewer.name}</span>
                        <span>{formatNepalDateTime(log.createdAt)}</span>
                      </div>
                      <div className="text-[#292821] mt-0.5">
                        Updated payment for <strong className="font-mono text-[#172B24]">{log.registration.registrationId}</strong> to{" "}
                        <span className="font-bold text-[#A64B36]">{log.status}</span>
                      </div>
                    </div>
                  ))}
                  {recentAuditLogs.slice(0, 3).map((log) => (
                    <div key={log.id} className="text-xs border-b border-[#E8DFD0]/60 pb-2.5 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between text-[11px] text-[#292821]/60">
                        <span className="font-semibold text-[#172B24]">{log.actor?.name || log.actorEmail}</span>
                        <span>{formatNepalDateTime(log.createdAt)}</span>
                      </div>
                      <div className="text-[#292821] mt-0.5">
                        {log.action.replace("_", " ")} on <span className="font-mono text-[#172B24]">{log.entityType}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

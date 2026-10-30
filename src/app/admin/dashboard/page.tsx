import React from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import {
  Crown,
  CheckCircle2,
  Users,
  Clock,
  ArrowRight,
  AlertTriangle,
  FileCheck2,
  XCircle,
  HelpCircle,
  Mail,
  Calendar,
  MapPin,
  ShieldCheck,
  CreditCard,
  HardDrive,
  FileText,
  Activity,
  AlertCircle,
  ArrowUpRight,
  Eye,
  RefreshCw,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MithilaHeritageMandala } from "@/components/brand/brand-logos";
import { formatNepalDateTime } from "@/lib/utils/timezone";

export const metadata = {
  title: "Admin Dashboard | The Origin Foundation",
};

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();

  // Query actual database metrics for Mithila Queen operational overview
  const [
    totalRegistrations,
    completedApps,
    incompleteRegs,
    paymentsUnderReview,
    verifiedPayments,
    appsUnderReview,
    appsApproved,
    appsRejected,
    siteSetting,
    driveIntegration,
    recentApplications,
    recentPaymentReviews,
    recentStatusLogs,
    recentEditLogs,
    recentEmailFailures,
  ] = await Promise.all([
    prisma.mithilaQueenRegistration.count(),
    prisma.mithilaQueenRegistration.count({ where: { isCompleted: true } }),
    prisma.mithilaQueenRegistration.count({ where: { isCompleted: false } }),
    prisma.mithilaQueenRegistration.count({ where: { paymentStatus: "UNDER_REVIEW" } }),
    prisma.mithilaQueenRegistration.count({ where: { paymentStatus: "VERIFIED" } }),
    prisma.mithilaQueenRegistration.count({
      where: { applicationStatus: { in: ["UNDER_REVIEW", "SUBMITTED"] } },
    }),
    prisma.mithilaQueenRegistration.count({ where: { applicationStatus: "APPROVED" } }),
    prisma.mithilaQueenRegistration.count({ where: { applicationStatus: "REJECTED" } }),
    prisma.siteSetting.findUnique({ where: { id: "primary" } }),
    prisma.googleDriveIntegration.findUnique({ where: { id: "primary" } }),
    prisma.mithilaQueenRegistration.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
    prisma.paymentReviewLog.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        registration: { select: { registrationId: true, fullName: true } },
        reviewer: { select: { name: true } },
      },
    }),
    prisma.registrationStatusLog.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        registration: { select: { registrationId: true, fullName: true } },
        changedBy: { select: { name: true } },
      },
    }),
    prisma.registrationEditLog.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        registration: { select: { registrationId: true, fullName: true } },
      },
    }),
    prisma.emailDeliveryLog.findMany({
      where: { event: { in: ["ATTEMPT_FAILED", "BOUNCED"] } },
      take: 4,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Combine and sort activities
  type ActivityItem = {
    id: string;
    type: "PAYMENT" | "APPLICATION" | "EDIT" | "EMAIL";
    title: string;
    description: string;
    timestamp: Date;
    actor?: string;
  };

  const activities: ActivityItem[] = [
    ...recentPaymentReviews.map((pr) => ({
      id: `pr-${pr.id}`,
      type: "PAYMENT" as const,
      title: `Payment ${pr.status === "VERIFIED" ? "Verified" : pr.status}`,
      description: `${pr.registration.fullName} (${pr.registration.registrationId}) reviewed by ${pr.reviewer?.name || pr.reviewerEmail}`,
      timestamp: pr.createdAt,
      actor: pr.reviewer?.name,
    })),
    ...recentStatusLogs.map((sl) => ({
      id: `sl-${sl.id}`,
      type: "APPLICATION" as const,
      title: `Application ${sl.newStatus}`,
      description: `${sl.registration.fullName} (${sl.registration.registrationId}) changed to ${sl.newStatus}`,
      timestamp: sl.createdAt,
      actor: sl.changedBy?.name,
    })),
    ...recentEditLogs.map((el) => ({
      id: `el-${el.id}`,
      type: "EDIT" as const,
      title: "Participant Details Updated",
      description: `${el.registration?.fullName || "Participant"} updated profile details (${el.changedByEmail})`,
      timestamp: el.createdAt,
    })),
    ...recentEmailFailures.map((ef) => ({
      id: `ef-${ef.id}`,
      type: "EMAIL" as const,
      title: "Email Delivery Issue",
      description: `Failed to deliver email to ${ef.email} (${ef.event})`,
      timestamp: ef.createdAt,
    })),
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 8);

  const isRegOpen = siteSetting?.isRegistrationOpen ?? true;

  return (
    <div className="space-y-6 pb-12">
      {/* Editorial Header */}
      <div className="bg-[#FFFFFF] p-6 rounded-lg border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MithilaHeritageMandala className="w-5 h-5 text-[#C5A880]" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#C5A880]">
              The Origin Foundation &bull; Janakpur Dham
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0A192F] tracking-tight">
            Administrative Command Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#0A192F]/70">
            Welcome back, <strong className="text-[#0A192F]">{admin.name}</strong> ({admin.email}) &bull; Flagship: Mithila Queen 2026
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/admin/responses">
            <Button className="gap-2 bg-[#0A192F] hover:bg-[#1E293B] text-[#F1F5F9] text-xs h-9 px-4 font-semibold border border-[#C5A880]/40 shadow-xs">
              <Crown className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Review Applications</span>
            </Button>
          </Link>
          <Link href="/admin/forms">
            <Button variant="outline" className="gap-2 border-[#E2E8F0] text-[#0A192F] hover:bg-[#F8FAFC] text-xs h-9 px-4 font-medium shadow-xs">
              <FileText className="w-3.5 h-3.5 text-[#A64B36]" />
              <span>Manage Competition</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Cloud Storage & System Health Alert if Disconnected */}
      {!driveIntegration?.isConnected && (
        <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#C5A880]/40 text-[#0A192F] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-[#FFFFFF] border border-[#C5A880]/50 text-[#A64B36] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-[#A64B36]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#0A192F]">
                Google Drive Storage Disconnected
              </p>
              <p className="text-[11px] text-[#0A192F]/70 mt-0.5">
                Google Drive is disconnected. Connect the official organization account in Settings to receive participant video files without exhausting server disk storage.
              </p>
            </div>
          </div>
          <Link href="/admin/settings">
            <Button
              size="sm"
              className="bg-[#0A192F] hover:bg-[#1E293B] text-[#F1F5F9] text-xs h-8 px-3 font-semibold shrink-0"
            >
              Connect Storage
            </Button>
          </Link>
        </div>
      )}

      {/* 8 Clickable Operational Metrics */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#0A192F] flex items-center gap-2">
            <span>Operational Key Performance Indicators</span>
          </h2>
          <span className="text-[11px] text-zinc-500 font-mono">
            Click any metric to view filtered dossiers
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {/* 1. Total Registrations */}
          <Link
            href="/admin/responses?tab=all"
            className="group block p-4 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#C5A880] transition-all hover:shadow-xs"
          >
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-[11px] font-semibold text-[#0A192F]/70">Total Registrations</span>
              <Users className="w-3.5 h-3.5 text-[#C5A880] group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="text-2xl font-serif font-black text-[#0A192F] tracking-tight">
              {totalRegistrations}
            </div>
            <div className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1 font-mono">
              <span>All registered entries</span>
              <ArrowUpRight className="w-3 h-3 text-[#C5A880]" />
            </div>
          </Link>

          {/* 2. Completed Applications */}
          <Link
            href="/admin/responses?tab=completed"
            className="group block p-4 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#C5A880] transition-all hover:shadow-xs"
          >
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-[11px] font-semibold text-[#0A192F]/70">Completed Dossiers</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0A192F] group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="text-2xl font-serif font-black text-[#0A192F] tracking-tight">
              {completedApps}
            </div>
            <div className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1 font-mono">
              <span>Finished all 7 steps</span>
              <ArrowUpRight className="w-3 h-3 text-[#C5A880]" />
            </div>
          </Link>

          {/* 3. Incomplete Registrations */}
          <Link
            href="/admin/responses?tab=drafts"
            className="group block p-4 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#C5A880] transition-all hover:shadow-xs"
          >
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-[11px] font-semibold text-[#0A192F]/70">Incomplete Drafts</span>
              <Clock className="w-3.5 h-3.5 text-[#C5A880] group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="text-2xl font-serif font-black text-[#0A192F] tracking-tight">
              {incompleteRegs}
            </div>
            <div className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1 font-mono">
              <span>Saved in-progress drafts</span>
              <ArrowUpRight className="w-3 h-3 text-[#C5A880]" />
            </div>
          </Link>

          {/* 4. Payments Under Review */}
          <Link
            href="/admin/responses?paymentStatus=UNDER_REVIEW"
            className="group block p-4 rounded-lg bg-[#F8FAFC] border border-[#C5A880]/60 hover:border-[#A64B36] transition-all hover:shadow-xs"
          >
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-[11px] font-bold text-[#A64B36]">Payments Under Review</span>
              <CreditCard className="w-3.5 h-3.5 text-[#A64B36] group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="text-2xl font-serif font-black text-[#A64B36] tracking-tight">
              {paymentsUnderReview}
            </div>
            <div className="text-[10px] text-[#A64B36]/80 mt-1 flex items-center gap-1 font-mono font-medium">
              <span>Awaiting manual check</span>
              <ArrowUpRight className="w-3 h-3 text-[#A64B36]" />
            </div>
          </Link>

          {/* 5. Verified Payments */}
          <Link
            href="/admin/responses?paymentStatus=VERIFIED"
            className="group block p-4 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#C5A880] transition-all hover:shadow-xs"
          >
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-[11px] font-semibold text-[#0A192F]/70">Verified Payments</span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#0A192F] group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="text-2xl font-serif font-black text-[#0A192F] tracking-tight">
              {verifiedPayments}
            </div>
            <div className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1 font-mono">
              <span>NPR {siteSetting?.registrationFee ?? 399} confirmed</span>
              <ArrowUpRight className="w-3 h-3 text-[#C5A880]" />
            </div>
          </Link>

          {/* 6. Applications Under Review */}
          <Link
            href="/admin/responses?applicationStatus=UNDER_REVIEW"
            className="group block p-4 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#C5A880] transition-all hover:shadow-xs"
          >
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-[11px] font-semibold text-[#0A192F]/70">Dossiers Under Review</span>
              <Activity className="w-3.5 h-3.5 text-[#C5A880] group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="text-2xl font-serif font-black text-[#0A192F] tracking-tight">
              {appsUnderReview}
            </div>
            <div className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1 font-mono">
              <span>Jury / Admin screening</span>
              <ArrowUpRight className="w-3 h-3 text-[#C5A880]" />
            </div>
          </Link>

          {/* 7. Approved Applications */}
          <Link
            href="/admin/responses?applicationStatus=APPROVED"
            className="group block p-4 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#C5A880] transition-all hover:shadow-xs"
          >
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-[11px] font-semibold text-[#0A192F]/70">Approved Candidates</span>
              <Crown className="w-3.5 h-3.5 text-[#C5A880] group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="text-2xl font-serif font-black text-[#0A192F] tracking-tight">
              {appsApproved}
            </div>
            <div className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1 font-mono">
              <span>Official certificates ready</span>
              <ArrowUpRight className="w-3 h-3 text-[#C5A880]" />
            </div>
          </Link>

          {/* 8. Rejected Applications */}
          <Link
            href="/admin/responses?applicationStatus=REJECTED"
            className="group block p-4 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#C5A880] transition-all hover:shadow-xs"
          >
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-[11px] font-semibold text-[#0A192F]/70">Rejected Entries</span>
              <XCircle className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="text-2xl font-serif font-black text-[#0A192F] tracking-tight">
              {appsRejected}
            </div>
            <div className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1 font-mono">
              <span>Disqualified or declined</span>
              <ArrowUpRight className="w-3 h-3 text-[#C5A880]" />
            </div>
          </Link>
        </div>
      </div>

      {/* Main Operational Split: Recent Applications Table (8 cols) & Competition Status + Activity (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Recent Applications (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A192F] flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#A64B36]" />
              <span>Recent Participant Applications</span>
            </h3>
            <Link
              href="/admin/responses"
              className="text-xs font-bold text-[#A64B36] hover:underline flex items-center gap-1"
            >
              <span>View All Applications</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#0A192F] font-bold">
                    <th className="py-3 px-4">Participant Name</th>
                    <th className="py-3 px-4">Registration ID</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Application</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]/60">
                  {recentApplications.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-400">
                        No registrations recorded yet.
                      </td>
                    </tr>
                  ) : (
                    recentApplications.map((app) => (
                      <tr
                        key={app.id}
                        className="hover:bg-[#F8FAFC]/60 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#0A192F]">
                            {app.fullName}
                          </div>
                          <div className="text-[11px] text-zinc-500 font-mono">
                            {app.email}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#0A192F]">
                          {app.registrationId}
                        </td>
                        <td className="py-3 px-4 text-zinc-600 whitespace-nowrap text-[11px]">
                          {formatNepalDateTime(app.createdAt)}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                              app.paymentStatus === "VERIFIED"
                                ? "bg-[#0A192F] text-[#F1F5F9] border-[#C5A880]/40"
                                : app.paymentStatus === "UNDER_REVIEW"
                                ? "bg-[#F8FAFC] text-[#C5A880] border-[#C5A880]/40"
                                : app.paymentStatus === "CLARIFICATION_REQUIRED"
                                ? "bg-[#F8FAFC] text-[#A64B36] border-[#A64B36]/30"
                                : "bg-[#F8FAFC] text-zinc-600 border-[#E2E8F0]"
                            }`}
                          >
                            {app.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                              app.applicationStatus === "APPROVED"
                                ? "bg-[#0A192F] text-[#C5A880] border-[#C5A880]/40"
                                : app.applicationStatus === "UNDER_REVIEW"
                                ? "bg-[#F8FAFC] text-[#C5A880] border-[#C5A880]/40"
                                : app.applicationStatus === "ACTION_REQUIRED"
                                ? "bg-[#F8FAFC] text-[#A64B36] border-[#A64B36]/30"
                                : app.applicationStatus === "REJECTED"
                                ? "bg-zinc-100 text-zinc-600 border-zinc-300"
                                : "bg-[#F8FAFC] text-zinc-700 border-[#E2E8F0]"
                            }`}
                          >
                            {app.applicationStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link href={`/admin/responses?id=${app.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2.5 text-[11px] border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0A192F] font-semibold"
                            >
                              <Eye className="w-3 h-3 mr-1 text-[#A64B36]" />
                              <span>View</span>
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Competition Status & Activity Feed (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Competition Status Card */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-[#C5A880]" />
                <h3 className="font-serif font-bold text-sm text-[#0A192F]">
                  Mithila Queen 2026
                </h3>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  isRegOpen
                    ? "bg-[#0A192F] text-[#F1F5F9] border-[#C5A880]/40"
                    : "bg-[#F8FAFC] text-[#A64B36] border-[#A64B36]/30"
                }`}
              >
                {isRegOpen ? "Registration Open" : "Registration Closed"}
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-[#0A192F]">
              <div className="flex items-center justify-between py-1 border-b border-[#E2E8F0]/50">
                <span className="text-zinc-500">Official Entry Fee</span>
                <span className="font-mono font-bold text-[#0A192F]">NPR {siteSetting?.registrationFee ?? 399}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[#E2E8F0]/50">
                <span className="text-zinc-500">Opening Date</span>
                <span className="font-mono font-medium">
                  {siteSetting?.registrationOpeningDate
                    ? formatNepalDateTime(siteSetting.registrationOpeningDate)
                    : "Open for Entries"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[#E2E8F0]/50">
                <span className="text-zinc-500">Closing Deadline</span>
                <span className="font-mono font-medium">
                  {siteSetting?.registrationClosingDate
                    ? formatNepalDateTime(siteSetting.registrationClosingDate)
                    : "Rolling Adjudication"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[#E2E8F0]/50">
                <span className="text-zinc-500">Grand Finale Schedule</span>
                <span className="font-semibold text-[#A64B36]">
                  {siteSetting?.eventSchedule || "To Be Announced"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-zinc-500">Official Venue</span>
                <span className="font-medium text-right max-w-[160px] truncate">
                  {siteSetting?.eventVenue || "Janakpur Dham, Nepal"}
                </span>
              </div>
            </div>

            <Link href="/admin/forms">
              <Button
                variant="outline"
                className="w-full text-xs h-8 border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0A192F] font-semibold"
              >
                <span>Edit Competition Details & QR</span>
                <ArrowRight className="w-3 h-3 ml-1 text-[#A64B36]" />
              </Button>
            </Link>
          </div>

          {/* Recent Operational Activity Feed */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-[#0A192F] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#A64B36]" />
                <span>Operational Activity Log</span>
              </h3>
            </div>

            <div className="space-y-3">
              {activities.length === 0 ? (
                <p className="text-xs text-zinc-400 py-3 text-center">
                  No recent admin activity recorded.
                </p>
              ) : (
                activities.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-start gap-2.5 pb-2.5 border-b border-[#E2E8F0]/50 last:border-0 last:pb-0 text-xs"
                  >
                    <div className="w-6 h-6 rounded bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center shrink-0 mt-0.5 text-[#C5A880]">
                      {act.type === "PAYMENT" ? (
                        <CreditCard className="w-3 h-3 text-[#A64B36]" />
                      ) : act.type === "APPLICATION" ? (
                        <Crown className="w-3 h-3 text-[#C5A880]" />
                      ) : act.type === "EDIT" ? (
                        <Edit3 className="w-3 h-3 text-[#0A192F]" />
                      ) : (
                        <Mail className="w-3 h-3 text-red-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-[#0A192F] leading-tight">
                        {act.title}
                      </div>
                      <p className="text-[11px] text-zinc-600 mt-0.5 leading-snug line-clamp-2">
                        {act.description}
                      </p>
                      <span className="text-[10px] text-zinc-400 font-mono block mt-1">
                        {formatNepalDateTime(act.timestamp)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

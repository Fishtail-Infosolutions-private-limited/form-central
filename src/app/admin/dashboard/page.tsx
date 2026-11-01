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
  FileCheck2,
  FileText,
  CreditCard,
  ArrowUpRight,
  Eye,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNepalDateTime } from "@/lib/utils/timezone";
import { InquiriesDeskCard } from "@/components/admin/inquiries-desk-card";

export const metadata = {
  title: "Admin Dashboard | The Origin Foundation",
};

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();

  // Query actual database metrics for Mithila Queen operational overview
  const [
    totalRegistrations,
    paymentsUnderReview,
    appsUnderReview,
    appsApproved,
    recentApplications,
    recentInquiries,
  ] = await Promise.all([
    prisma.mithilaQueenRegistration.count(),
    prisma.mithilaQueenRegistration.count({ where: { paymentStatus: "UNDER_REVIEW" } }),
    prisma.mithilaQueenRegistration.count({
      where: { applicationStatus: { in: ["UNDER_REVIEW", "SUBMITTED"] } },
    }),
    prisma.mithilaQueenRegistration.count({ where: { applicationStatus: "APPROVED" } }),
    prisma.mithilaQueenRegistration.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
    prisma.contactInquiry.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6 pb-12">
      {/* Clean Header */}
      <div className="bg-white p-5 rounded-xl border border-[#DCE5ED] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-bold text-[#183153] tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Key operations, participant metrics, and recent inquiries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/admin/responses">
            <Button className="gap-2 bg-[#183153] hover:bg-[#12243d] text-white text-xs h-9 px-4 font-semibold shadow-xs">
              <Crown className="w-3.5 h-3.5 text-[#356FA8]" />
              <span>Applications</span>
            </Button>
          </Link>
          <Link href="/admin/registration-form">
            <Button variant="outline" className="gap-2 border-[#DCE5ED] text-[#183153] hover:bg-[#F4F7FA] text-xs h-9 px-4 font-semibold shadow-xs">
              <FileText className="w-3.5 h-3.5 text-[#356FA8]" />
              <span>Registration Form</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Essential Operational Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Registrations */}
        <Link
          href="/admin/responses?tab=all"
          className="group block p-4 rounded-xl bg-white border border-[#DCE5ED] hover:border-[#356FA8] transition-all hover:shadow-xs"
        >
          <div className="flex items-center justify-between text-stone-500 mb-1.5">
            <span className="text-xs font-semibold text-stone-600">Total Registrations</span>
            <Users className="w-4 h-4 text-[#356FA8] group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-black text-[#183153] tracking-tight">
            {totalRegistrations}
          </div>
          <div className="text-[11px] text-stone-500 mt-1 flex items-center gap-1 font-mono">
            <span>All registered entries</span>
            <ArrowUpRight className="w-3 h-3 text-[#356FA8]" />
          </div>
        </Link>

        {/* 2. Payments Under Review */}
        <Link
          href="/admin/responses?paymentStatus=UNDER_REVIEW"
          className="group block p-4 rounded-xl bg-white border border-[#DCE5ED] hover:border-[#356FA8] transition-all hover:shadow-xs"
        >
          <div className="flex items-center justify-between text-stone-500 mb-1.5">
            <span className="text-xs font-semibold text-stone-600">Payments to Review</span>
            <CreditCard className="w-4 h-4 text-[#356FA8] group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-black text-[#183153] tracking-tight">
            {paymentsUnderReview}
          </div>
          <div className="text-[11px] text-amber-700 mt-1 flex items-center gap-1 font-mono">
            <span>Awaiting bank verification</span>
            <ArrowUpRight className="w-3 h-3 text-[#356FA8]" />
          </div>
        </Link>

        {/* 3. Applications Under Review */}
        <Link
          href="/admin/responses?applicationStatus=UNDER_REVIEW"
          className="group block p-4 rounded-xl bg-white border border-[#DCE5ED] hover:border-[#356FA8] transition-all hover:shadow-xs"
        >
          <div className="flex items-center justify-between text-stone-500 mb-1.5">
            <span className="text-xs font-semibold text-stone-600">Applications to Review</span>
            <Clock className="w-4 h-4 text-[#356FA8] group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-black text-[#183153] tracking-tight">
            {appsUnderReview}
          </div>
          <div className="text-[11px] text-stone-500 mt-1 flex items-center gap-1 font-mono">
            <span>Jury / Admin screening</span>
            <ArrowUpRight className="w-3 h-3 text-[#356FA8]" />
          </div>
        </Link>

        {/* 4. Approved Candidates */}
        <Link
          href="/admin/responses?applicationStatus=APPROVED"
          className="group block p-4 rounded-xl bg-white border border-[#DCE5ED] hover:border-[#356FA8] transition-all hover:shadow-xs"
        >
          <div className="flex items-center justify-between text-stone-500 mb-1.5">
            <span className="text-xs font-semibold text-stone-600">Approved Candidates</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-black text-[#183153] tracking-tight">
            {appsApproved}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-mono">
            <span>Official confirmation active</span>
            <ArrowUpRight className="w-3 h-3 text-[#356FA8]" />
          </div>
        </Link>
      </div>

      {/* Main Operational Split: Recent Applications Table (8 cols) & Inquiries Desk (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Recent Applications (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#183153] flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#356FA8]" />
              <span>Recent Participant Applications</span>
            </h3>
            <Link
              href="/admin/responses"
              className="text-xs font-bold text-[#356FA8] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white border border-[#DCE5ED] rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#DCE5ED] bg-[#F4F7FA] text-[#183153] font-bold">
                    <th className="py-3 px-4">Participant Name</th>
                    <th className="py-3 px-4">Registration ID</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Application</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-dark/70">
                  {recentApplications.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-stone-400">
                        No registrations recorded yet.
                      </td>
                    </tr>
                  ) : (
                    recentApplications.map((app) => (
                      <tr
                        key={app.id}
                        className="hover:bg-[#F4F7FA]/40 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#183153]">
                            {app.fullName}
                          </div>
                          <div className="text-[11px] text-stone-500 font-mono">
                            {app.email}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-stone-800">
                          {app.registrationId}
                        </td>
                        <td className="py-3 px-4 text-stone-600 whitespace-nowrap text-[11px]">
                          {formatNepalDateTime(app.createdAt)}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                              app.paymentStatus === "VERIFIED"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : app.paymentStatus === "UNDER_REVIEW"
                                ? "bg-amber-50 text-amber-800 border-amber-300"
                                : app.paymentStatus === "CLARIFICATION_REQUIRED"
                                ? "bg-orange-50 text-orange-800 border-orange-300"
                                : "bg-stone-50 text-stone-600 border-stone-200"
                            }`}
                          >
                            {app.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                              app.applicationStatus === "APPROVED"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : app.applicationStatus === "UNDER_REVIEW" || app.applicationStatus === "SUBMITTED"
                                ? "bg-blue-50 text-blue-800 border-blue-300"
                                : app.applicationStatus === "ACTION_REQUIRED"
                                ? "bg-amber-50 text-amber-800 border-amber-300"
                                : "bg-rose-50 text-rose-800 border-rose-300"
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
                              className="h-7 px-2.5 text-[11px] border-[#DCE5ED] hover:bg-[#F4F7FA] text-[#183153] font-semibold"
                            >
                              <Eye className="w-3 h-3 mr-1 text-[#356FA8]" />
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

        {/* Right Column: Public Inquiries Desk (4 cols) */}
        <div className="lg:col-span-4">
          <InquiriesDeskCard initialInquiries={recentInquiries} />
        </div>
      </div>
    </div>
  );
}


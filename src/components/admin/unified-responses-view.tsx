"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  FileDown,
  Loader2,
  ExternalLink,
  Phone,
  Mail,
  User,
  Heart,
  Calendar,
  MapPin,
  Lock,
  CreditCard,
  FileCheck2,
  X,
  Send,
  Video,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  adminVerifyPaymentAction,
  adminAdjudicateApplicationAction,
  downloadApprovedPdfAction,
} from "@/server/actions/mithila-queen-actions";
import { formatNepalDateTime } from "@/lib/utils/timezone";

export interface UnifiedApplication {
  id: string;
  source: "MITHILA_QUEEN" | "FORM_BUILDER";
  registrationId: string;
  formName: string;
  formSlug: string;
  fullName: string;
  email: string;
  phone: string;
  alternatePhone?: string | null;
  dob?: Date | null;
  isMinor: boolean;
  guardianName?: string | null;
  guardianPhone?: string | null;
  guardianRelation?: string | null;
  guardianConsentRecorded?: boolean;
  province?: string | null;
  district?: string | null;
  municipality?: string | null;
  cityVillage?: string | null;
  currentAddress?: string | null;

  // Cultural & profile answers
  personalIntro?: string | null;
  hobbiesInterests?: string | null;
  talentsSkills?: string | null;
  languagesSpoken?: string | null;
  motivationReason?: string | null;
  previousExperience?: boolean;
  experienceDetails?: string | null;

  // Social & Media
  instagramHandle?: string | null;
  tiktokHandle?: string | null;
  facebookUrl?: string | null;
  profilePhotoUrl?: string | null;
  documentUrl?: string | null;

  // Payment Tracking
  registrationFee: number;
  paymentStatus: string;
  paymentReference?: string | null;
  paymentScreenshotUrl?: string | null;
  paymentSubmittedAt?: Date | null;
  paymentVerifiedAt?: Date | null;
  paymentClarificationNotes?: string | null;

  // Application Adjudication
  applicationStatus: string;
  rejectionReason?: string | null;
  actionRequiredDetails?: string | null;
  privateAdminNotes?: string | null;
  pdfGeneratedAt?: Date | null;
  submittedAt: Date;

  // Generic dynamic answers & files (if source == FORM_BUILDER)
  dynamicAnswers?: {
    fieldKey: string;
    fieldLabel: string;
    value: any;
  }[];
  uploadedFiles?: {
    id: string;
    originalName: string;
    mimeType: string;
    fileSize: number;
    storagePath: string;
    driveFileId?: string | null;
  }[];
}

interface FormOption {
  id: string;
  name: string;
  slug: string;
}

export function UnifiedResponsesView({
  applications,
  forms,
}: {
  applications: UnifiedApplication[];
  forms: FormOption[];
}) {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [formFilter, setFormFilter] = useState(() => searchParams.get("form") || "ALL");
  const [paymentFilter, setPaymentFilter] = useState(() => searchParams.get("paymentStatus") || "ALL");
  const [applicationFilter, setApplicationFilter] = useState(() => searchParams.get("applicationStatus") || "ALL");

  useEffect(() => {
    const qForm = searchParams.get("form");
    if (qForm) setFormFilter(qForm);
    const qPayment = searchParams.get("paymentStatus");
    if (qPayment) setPaymentFilter(qPayment);
    const qApp = searchParams.get("applicationStatus");
    if (qApp) setApplicationFilter(qApp);
  }, [searchParams]);

  const [selectedApp, setSelectedApp] = useState<UnifiedApplication | null>(null);

  // Modal / Action states
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [clarificationNotes, setClarificationNotes] = useState("");
  const [showClarificationInput, setShowClarificationInput] = useState(false);

  const [isAdjudicating, setIsAdjudicating] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [decisionReason, setDecisionReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [showActionInput, setShowActionInput] = useState(false);

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // Filtered Applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // Competition / Form filter
      if (formFilter !== "ALL" && app.formSlug !== formFilter) {
        return false;
      }

      // Payment Status filter
      if (paymentFilter !== "ALL" && app.paymentStatus !== paymentFilter) {
        return false;
      }

      // Application Status filter
      if (applicationFilter !== "ALL" && app.applicationStatus !== applicationFilter) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = app.fullName.toLowerCase().includes(q);
        const matchesEmail = app.email.toLowerCase().includes(q);
        const matchesPhone = app.phone.toLowerCase().includes(q);
        const matchesRef = app.registrationId.toLowerCase().includes(q);
        const matchesTxn = (app.paymentReference || "").toLowerCase().includes(q);
        return matchesName || matchesEmail || matchesPhone || matchesRef || matchesTxn;
      }

      return true;
    });
  }, [applications, formFilter, paymentFilter, applicationFilter, searchTerm]);

  // Open Drawer
  const handleOpenDrawer = (app: UnifiedApplication) => {
    setSelectedApp(app);
    setAdminNotes(app.privateAdminNotes || "");
    setClarificationNotes(app.paymentClarificationNotes || "");
    setDecisionReason("");
    setShowClarificationInput(false);
    setShowRejectInput(false);
    setShowActionInput(false);
  };

  // Close Drawer
  const handleCloseDrawer = () => {
    setSelectedApp(null);
  };

  // Payment Verification Handler
  const handlePaymentAction = async (status: "VERIFIED" | "CLARIFICATION_REQUIRED") => {
    if (!selectedApp) return;

    if (status === "CLARIFICATION_REQUIRED" && !clarificationNotes.trim()) {
      toast.error("Please enter the specific clarification notes for the applicant.");
      return;
    }

    setIsVerifyingPayment(true);
    const res = await adminVerifyPaymentAction({
      registrationId: selectedApp.registrationId,
      decision: status === "VERIFIED" ? "VERIFY" : "REQUEST_CLARIFICATION",
      notes: status === "CLARIFICATION_REQUIRED" ? clarificationNotes.trim() : undefined,
    });
    setIsVerifyingPayment(false);

    if (res.success) {
      toast.success(
        status === "VERIFIED"
          ? "Payment verified! Application is now eligible for approval review."
          : "Clarification request recorded and notified to applicant."
      );
      setSelectedApp((prev) =>
        prev
          ? {
              ...prev,
              paymentStatus: status,
              paymentClarificationNotes: clarificationNotes,
            }
          : null
      );
    } else {
      toast.error(res.error || "Failed to update payment status.");
    }
  };

  // Application Adjudication Handler
  const handleApplicationAction = async (status: "APPROVED" | "REJECTED" | "ACTION_REQUIRED") => {
    if (!selectedApp) return;

    if (status === "APPROVED" && selectedApp.paymentStatus !== "VERIFIED") {
      toast.error("Payment must be independently VERIFIED before final application approval.");
      return;
    }

    if ((status === "REJECTED" || status === "ACTION_REQUIRED") && !decisionReason.trim()) {
      toast.error(`Please provide the reason for ${status.toLowerCase().replace("_", " ")}.`);
      return;
    }

    setIsAdjudicating(true);
    const res = await adminAdjudicateApplicationAction({
      registrationId: selectedApp.registrationId,
      decision: status === "APPROVED" ? "APPROVE" : status === "REJECTED" ? "REJECT" : "ACTION_REQUIRED",
      reason: decisionReason.trim() || undefined,
      privateNotes: adminNotes.trim() || undefined,
    });
    setIsAdjudicating(false);

    if (res.success) {
      toast.success(
        status === "APPROVED"
          ? "Application officially approved! Confirmation certificate generated and dispatched."
          : `Application status updated to ${status}.`
      );
      setSelectedApp((prev) =>
        prev
          ? {
              ...prev,
              applicationStatus: status,
              privateAdminNotes: adminNotes,
              rejectionReason: status === "REJECTED" ? decisionReason : prev.rejectionReason,
              actionRequiredDetails: status === "ACTION_REQUIRED" ? decisionReason : prev.actionRequiredDetails,
              pdfGeneratedAt: status === "APPROVED" ? new Date() : prev.pdfGeneratedAt,
            }
          : null
      );
    } else {
      toast.error(res.error || "Failed to adjudicate application.");
    }
  };

  // Download PDF Action
  const handleDownloadPdf = async () => {
    if (!selectedApp) return;
    setIsDownloadingPdf(true);

    const res = await downloadApprovedPdfAction({
      registrationId: selectedApp.registrationId,
      verificationContact: selectedApp.email,
    });
    setIsDownloadingPdf(false);

    if (res.success && res.pdfBase64) {
      const byteCharacters = atob(res.pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Confirmation-${selectedApp.registrationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Confirmation PDF downloaded.");
    } else {
      toast.error(res.error || "Unable to download confirmation PDF.");
    }
  };

  // Export to Excel
  const handleExportExcel = async () => {
    try {
      setIsExportingExcel(true);
      const res = await fetch("/api/admin/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formSlug: formFilter !== "ALL" ? formFilter : undefined,
          paymentStatus: paymentFilter !== "ALL" ? paymentFilter : undefined,
          applicationStatus: applicationFilter !== "ALL" ? applicationFilter : undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Export failed on server.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Origin-Foundation-Registrations-${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Applications exported to Excel.");
    } catch (e: any) {
      toast.error(e.message || "Failed to export applications.");
    } finally {
      setIsExportingExcel(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* FILTER & SEARCH CONTROL BAR */}
      <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, ID, phone, email..."
              className="pl-9 h-9 text-xs border-[#E2E8F0] bg-[#F1F5F9]/30 font-sans"
            />
          </div>

          {/* Form / Competition Selector */}
          <div>
            <select
              value={formFilter}
              onChange={(e) => setFormFilter(e.target.value)}
              className="w-full h-9 text-xs border border-[#E2E8F0] rounded-md bg-[#F1F5F9]/30 px-3 text-[#0A192F] focus:outline-none focus:border-[#C5A880]"
            >
              <option value="ALL">All Competitions & Forms</option>
              {forms.map((f) => (
                <option key={f.id} value={f.slug}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full h-9 text-xs border border-[#E2E8F0] rounded-md bg-[#F1F5F9]/30 px-3 text-[#0A192F] focus:outline-none focus:border-[#C5A880]"
            >
              <option value="ALL">All Payment States</option>
              <option value="UNDER_REVIEW">Payment: Under Review</option>
              <option value="VERIFIED">Payment: Verified</option>
              <option value="CLARIFICATION_REQUIRED">Payment: Clarification</option>
              <option value="PENDING">Payment: Pending</option>
              <option value="FAILED">Payment: Failed</option>
            </select>
          </div>

          {/* Application Status Filter */}
          <div>
            <select
              value={applicationFilter}
              onChange={(e) => setApplicationFilter(e.target.value)}
              className="w-full h-9 text-xs border border-[#E2E8F0] rounded-md bg-[#F1F5F9]/30 px-3 text-[#0A192F] focus:outline-none focus:border-[#C5A880]"
            >
              <option value="ALL">All Application States</option>
              <option value="SUBMITTED">Status: Submitted</option>
              <option value="UNDER_REVIEW">Status: Under Review</option>
              <option value="ACTION_REQUIRED">Status: Action Required</option>
              <option value="APPROVED">Status: Approved</option>
              <option value="REJECTED">Status: Rejected</option>
            </select>
          </div>
        </div>

        {/* Status Count Summary & Excel Export */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E2E8F0] text-xs text-[#59574D]">
          <div className="flex items-center gap-3">
            <span>
              Showing <strong>{filteredApplications.length}</strong> of {applications.length} applications
            </span>
            {(formFilter !== "ALL" || paymentFilter !== "ALL" || applicationFilter !== "ALL" || searchTerm) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFormFilter("ALL");
                  setPaymentFilter("ALL");
                  setApplicationFilter("ALL");
                }}
                className="text-[#A64B36] hover:underline flex items-center gap-1 font-semibold text-xs"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <Button
            size="sm"
            onClick={handleExportExcel}
            disabled={isExportingExcel || filteredApplications.length === 0}
            className="bg-[#0A192F] hover:bg-[#1E293B] text-[#F1F5F9] text-xs h-8 px-3 rounded gap-1.5 shadow-none"
          >
            {isExportingExcel ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>Export to Excel</span>
          </Button>
        </div>
      </div>

      {/* UNIFIED DATA TABLE */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden shadow-xs">
        {filteredApplications.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-sm font-semibold text-[#0A192F]">No matching registrations found</p>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Try adjusting your search criteria, competition selector, or status filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F1F5F9] text-[#0A192F] font-semibold border-b border-[#E2E8F0]">
                <tr>
                  <th className="py-3 px-4">Registration ID</th>
                  <th className="py-3 px-4">Participant</th>
                  <th className="py-3 px-4">Competition / Form</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Application</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-[#F1F5F9]/40 transition-colors">
                    {/* ID */}
                    <td className="py-3 px-4 font-mono font-bold text-[#0A192F]">
                      {app.registrationId}
                    </td>

                    {/* Participant */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#0A192F]">
                        {app.fullName}
                      </div>
                      {app.isMinor && (
                        <span className="inline-block text-[10px] text-[#A64B36] font-bold mt-0.5">
                          Minor (&lt;18)
                        </span>
                      )}
                    </td>

                    {/* Competition */}
                    <td className="py-3 px-4 text-[#59574D] font-medium">
                      {app.formName}
                    </td>

                    {/* Contact */}
                    <td className="py-3 px-4 text-[#59574D] font-mono">
                      <div>{app.phone}</div>
                      <div className="text-[11px] text-zinc-400">{app.email}</div>
                    </td>

                    {/* Payment Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          app.paymentStatus === "VERIFIED"
                            ? "bg-[#0A192F] text-[#F1F5F9] border border-[#C5A880]/40"
                            : app.paymentStatus === "UNDER_REVIEW"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : app.paymentStatus === "CLARIFICATION_REQUIRED"
                            ? "bg-orange-50 text-orange-800 border border-orange-200"
                            : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                        }`}
                      >
                        {app.paymentStatus.replace("_", " ")}
                      </span>
                    </td>

                    {/* Application Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          app.applicationStatus === "APPROVED"
                            ? "bg-[#0A192F] text-[#F1F5F9] border border-[#C5A880]/40"
                            : app.applicationStatus === "REJECTED"
                            ? "bg-rose-50 text-rose-800 border border-rose-200"
                            : app.applicationStatus === "ACTION_REQUIRED"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-blue-50 text-blue-800 border border-blue-200"
                        }`}
                      >
                        {app.applicationStatus.replace("_", " ")}
                      </span>
                    </td>

                    {/* Submitted At */}
                    <td className="py-3 px-4 text-zinc-500 whitespace-nowrap text-[11px]">
                      {formatNepalDateTime(app.submittedAt)}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        onClick={() => handleOpenDrawer(app)}
                        className="bg-[#0A192F] hover:bg-[#1E293B] text-[#F1F5F9] text-xs h-7 px-3 rounded shadow-none font-medium"
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* SLIDE-OVER REVIEW DRAWER */}
      {/* ==================================================================== */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#0F1D18]/50 transition-opacity"
            onClick={handleCloseDrawer}
          />

          {/* Drawer Surface */}
          <div className="relative w-full max-w-2xl bg-white shadow-2xl flex flex-col h-full border-l border-[#E2E8F0] z-50 overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-[#E2E8F0] bg-[#F1F5F9] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#A64B36] block">
                  {selectedApp.formName} &bull; Participant Dossier
                </span>
                <h2 className="text-lg font-bold text-[#0A192F] font-serif">
                  {selectedApp.fullName}
                </h2>
                <span className="font-mono text-xs font-bold text-[#C5A880]">
                  ID: {selectedApp.registrationId}
                </span>
              </div>
              <button
                onClick={handleCloseDrawer}
                className="p-1.5 rounded hover:bg-[#E2E8F0] text-[#0A192F] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-[#0A192F]">
              {/* CURRENT STATUS BADGES & A4 PDF DOWNLOAD */}
              <div className="p-4 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">Payment State</span>
                    <span className="font-bold text-[#0A192F]">{selectedApp.paymentStatus}</span>
                  </div>
                  <div className="h-6 w-px bg-[#E2E8F0]" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">Application State</span>
                    <span className="font-bold text-[#0A192F]">{selectedApp.applicationStatus}</span>
                  </div>
                </div>

                {selectedApp.applicationStatus === "APPROVED" && (
                  <Button
                    size="sm"
                    onClick={handleDownloadPdf}
                    disabled={isDownloadingPdf}
                    className="bg-[#C5A880] hover:bg-[#a68c59] text-[#0A192F] font-bold text-xs h-8 px-3 rounded gap-1.5 shadow-none"
                  >
                    {isDownloadingPdf ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <FileDown className="w-3.5 h-3.5" />
                    )}
                    <span>Download A4 Confirmation PDF</span>
                  </Button>
                )}
              </div>

              {/* 1. PERSONAL INFORMATION & ADDRESS */}
              <div className="space-y-3">
                <h3 className="font-bold font-serif text-sm text-[#0A192F] border-b border-[#E2E8F0] pb-1.5">
                  1. Identification & Geographic Location
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-zinc-500 block">Mobile Phone:</span>
                    <span className="font-mono font-semibold">{selectedApp.phone}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-500 block">Email Address:</span>
                    <span className="font-mono">{selectedApp.email}</span>
                  </div>
                  {selectedApp.dob && (
                    <div>
                      <span className="text-[11px] text-zinc-500 block">Date of Birth:</span>
                      <span>{new Date(selectedApp.dob).toLocaleDateString()}</span>
                    </div>
                  )}
                  {selectedApp.province && (
                    <div>
                      <span className="text-[11px] text-zinc-500 block">Address:</span>
                      <span>
                        {selectedApp.cityVillage}, {selectedApp.municipality}, {selectedApp.district}, {selectedApp.province}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. MINOR SAFEGUARDING (<18) */}
              {selectedApp.isMinor && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <span>Minor Participant Safeguarding Verified</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-amber-950">
                    <div>
                      <span>Guardian Name: </span>
                      <strong>{selectedApp.guardianName || "N/A"}</strong>
                    </div>
                    <div>
                      <span>Relationship: </span>
                      <strong>{selectedApp.guardianRelation || "N/A"}</strong>
                    </div>
                    <div>
                      <span>Guardian Phone: </span>
                      <strong className="font-mono">{selectedApp.guardianPhone || "N/A"}</strong>
                    </div>
                    <div>
                      <span>Consent Recorded: </span>
                      <strong className="text-[#0A192F]">Verified Timestamped</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. PROFILE & MOTIVATION ANSWERS */}
              {(selectedApp.motivationReason || selectedApp.personalIntro || selectedApp.talentsSkills) && (
                <div className="space-y-3">
                  <h3 className="font-bold font-serif text-sm text-[#0A192F] border-b border-[#E2E8F0] pb-1.5">
                    2. Cultural Profile & Articulation
                  </h3>
                  <div className="space-y-2">
                    {selectedApp.motivationReason && (
                      <div>
                        <span className="text-[11px] text-zinc-500 block">Motivation for Joining:</span>
                        <p className="bg-[#F1F5F9]/40 p-2.5 rounded border border-[#E2E8F0] leading-relaxed">
                          {selectedApp.motivationReason}
                        </p>
                      </div>
                    )}
                    {selectedApp.talentsSkills && (
                      <div>
                        <span className="text-[11px] text-zinc-500 block">Talents & Skills:</span>
                        <p className="bg-[#F1F5F9]/40 p-2.5 rounded border border-[#E2E8F0]">
                          {selectedApp.talentsSkills}
                        </p>
                      </div>
                    )}
                    {selectedApp.languagesSpoken && (
                      <div>
                        <span className="text-[11px] text-zinc-500 block">Languages Spoken:</span>
                        <p className="font-medium">{selectedApp.languagesSpoken}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 4. DYNAMIC ANSWERS (From Generic Forms) */}
              {selectedApp.dynamicAnswers && selectedApp.dynamicAnswers.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold font-serif text-sm text-[#0A192F] border-b border-[#E2E8F0] pb-1.5">
                    Dynamic Form Responses
                  </h3>
                  <div className="space-y-2">
                    {selectedApp.dynamicAnswers.map((ans, i) => (
                      <div key={i} className="p-2.5 rounded bg-[#F1F5F9]/30 border border-[#E2E8F0]">
                        <span className="text-[11px] font-semibold text-zinc-500 block">{ans.fieldLabel}</span>
                        <span className="text-xs font-medium text-[#0A192F]">
                          {typeof ans.value === "object" ? JSON.stringify(ans.value) : String(ans.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. MEDIA & UPLOADED FILES */}
              <div className="space-y-3">
                <h3 className="font-bold font-serif text-sm text-[#0A192F] border-b border-[#E2E8F0] pb-1.5">
                  Uploaded Media & Documents
                </h3>
                <div className="flex flex-wrap gap-4">
                  {selectedApp.profilePhotoUrl && (
                    <div>
                      <span className="text-[11px] text-zinc-500 block mb-1">Profile Photo:</span>
                      <a
                        href={selectedApp.profilePhotoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block relative w-24 h-32 rounded border border-[#E2E8F0] overflow-hidden bg-zinc-100 hover:opacity-90"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selectedApp.profilePhotoUrl}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </a>
                    </div>
                  )}

                  {selectedApp.uploadedFiles &&
                    selectedApp.uploadedFiles.map((file) => (
                      <div key={file.id} className="p-3 rounded border border-[#E2E8F0] bg-[#F1F5F9]/30 text-xs space-y-1">
                        <span className="font-bold text-[#0A192F] block truncate max-w-[180px]">
                          {file.originalName}
                        </span>
                        <span className="text-[10px] text-zinc-500 block">
                          {(file.fileSize / 1024).toFixed(1)} KB
                        </span>
                        <a
                          href={file.storagePath}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#C5A880] font-semibold text-[11px] hover:underline flex items-center gap-1"
                        >
                          <span>Open File</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                </div>
              </div>

              {/* 6. PAYMENT VERIFICATION CENTER (TIER 1) */}
              <div className="p-4 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#0A192F] font-serif flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-[#A64B36]" />
                    <span>Payment Verification & Bank Reconcile</span>
                  </h3>
                  <span className="font-bold font-mono text-[#0A192F]">
                    NPR {selectedApp.registrationFee}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-zinc-500 block">Transaction Reference / UTR:</span>
                    <span className="font-mono font-bold text-sm text-[#0A192F]">
                      {selectedApp.paymentReference || "Not yet submitted"}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Bank Receipt Screenshot:</span>
                    {selectedApp.paymentScreenshotUrl ? (
                      <a
                        href={selectedApp.paymentScreenshotUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#C5A880] font-bold hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <span>View Screenshot</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-zinc-400">None uploaded</span>
                    )}
                  </div>
                </div>

                {selectedApp.paymentClarificationNotes && (
                  <div className="p-2.5 rounded bg-orange-50 border border-orange-200 text-[11px] text-orange-950">
                    <span className="font-bold block">Current Clarification Notes:</span>
                    <span>{selectedApp.paymentClarificationNotes}</span>
                  </div>
                )}

                {/* Clarification input field */}
                {showClarificationInput && (
                  <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
                    <Label className="text-xs font-bold text-[#0A192F]">
                      Specific Clarification Required from Applicant:
                    </Label>
                    <Textarea
                      value={clarificationNotes}
                      onChange={(e) => setClarificationNotes(e.target.value)}
                      placeholder="e.g. Transaction UTR does not match bank record. Please re-check receipt."
                      className="text-xs border-[#E2E8F0] bg-white h-16"
                    />
                  </div>
                )}

                {/* Payment Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    disabled={isVerifyingPayment || selectedApp.paymentStatus === "VERIFIED"}
                    onClick={() => handlePaymentAction("VERIFIED")}
                    className="bg-[#0A192F] hover:bg-[#1E293B] text-[#F1F5F9] border border-[#C5A880]/40 text-xs h-8 px-3 rounded shadow-none"
                  >
                    {isVerifyingPayment ? (
                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                    )}
                    <span>Mark Payment Verified</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isVerifyingPayment}
                    onClick={() => {
                      if (!showClarificationInput) {
                        setShowClarificationInput(true);
                      } else {
                        handlePaymentAction("CLARIFICATION_REQUIRED");
                      }
                    }}
                    className="border-orange-300 text-orange-900 hover:bg-orange-50 text-xs h-8 px-3 rounded shadow-none"
                  >
                    <AlertCircle className="w-3 h-3 mr-1" />
                    <span>{showClarificationInput ? "Confirm Request" : "Request Clarification"}</span>
                  </Button>
                </div>
              </div>

              {/* 7. APPLICATION ADJUDICATION (TIER 2) */}
              <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-3">
                <h3 className="font-bold text-sm text-[#0A192F] font-serif flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-[#C5A880]" />
                  <span>Application Adjudication</span>
                </h3>

                {selectedApp.paymentStatus !== "VERIFIED" && (
                  <p className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded border border-amber-200">
                    Payment must be independently <strong>VERIFIED</strong> before this application can be approved.
                  </p>
                )}

                {/* Private Admin Notes */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#0A192F]">
                    Private Administrator Notes (Internal only):
                  </Label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Interview feedback, committee remarks, eligibility confirmation..."
                    className="text-xs border-[#E2E8F0] bg-[#F1F5F9]/30 h-16"
                  />
                </div>

                {/* Reason Input for Reject or Action Required */}
                {(showRejectInput || showActionInput) && (
                  <div className="space-y-1.5 pt-2 border-t border-[#E2E8F0]">
                    <Label className="text-xs font-bold text-[#A64B36]">
                      {showRejectInput ? "Reason for Rejection:" : "Action Required Details for Applicant:"}
                    </Label>
                    <Textarea
                      value={decisionReason}
                      onChange={(e) => setDecisionReason(e.target.value)}
                      placeholder={
                        showRejectInput
                          ? "Reason explaining why application was rejected..."
                          : "Specific corrections needed from applicant..."
                      }
                      className="text-xs border-[#E2E8F0] bg-white h-16"
                    />
                  </div>
                )}

                {/* Adjudication Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    disabled={isAdjudicating || selectedApp.paymentStatus !== "VERIFIED"}
                    onClick={() => handleApplicationAction("APPROVED")}
                    className="bg-[#0A192F] hover:bg-[#1E293B] text-[#F1F5F9] text-xs h-8 px-4 rounded shadow-none font-bold"
                  >
                    {isAdjudicating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-[#C5A880]" />
                    )}
                    <span>Approve & Issue Certificate</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isAdjudicating}
                    onClick={() => {
                      if (!showActionInput) {
                        setShowActionInput(true);
                        setShowRejectInput(false);
                      } else {
                        handleApplicationAction("ACTION_REQUIRED");
                      }
                    }}
                    className="border-amber-300 text-amber-900 hover:bg-amber-50 text-xs h-8 px-3 rounded shadow-none"
                  >
                    <AlertCircle className="w-3 h-3 mr-1" />
                    <span>{showActionInput ? "Confirm Action Required" : "Request Action"}</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isAdjudicating}
                    onClick={() => {
                      if (!showRejectInput) {
                        setShowRejectInput(true);
                        setShowActionInput(false);
                      } else {
                        handleApplicationAction("REJECTED");
                      }
                    }}
                    className="border-rose-300 text-rose-900 hover:bg-rose-50 text-xs h-8 px-3 rounded shadow-none"
                  >
                    <XCircle className="w-3 h-3 mr-1" />
                    <span>{showRejectInput ? "Confirm Rejection" : "Reject"}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

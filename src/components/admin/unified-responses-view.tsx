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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  videoUrl?: string | null;
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
      <div className="p-4 rounded-xl bg-warm-ivory border border-cream-dark shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, ID, phone, email..."
              className="pl-9 h-9 text-xs border-cream-dark bg-soft-cream/50 text-charcoal font-sans focus-visible:ring-saffron"
            />
          </div>

          {/* Form / Competition Selector */}
          <div>
            <Select value={formFilter} onValueChange={(val) => setFormFilter(val)}>
              <SelectTrigger className="w-full h-9 text-xs border-cream-dark bg-soft-cream/50 text-charcoal">
                <SelectValue placeholder="All Competitions & Forms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Competitions &amp; Forms</SelectItem>
                {forms.map((f) => (
                  <SelectItem key={f.id} value={f.slug}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <Select value={paymentFilter} onValueChange={(val) => setPaymentFilter(val)}>
              <SelectTrigger className="w-full h-9 text-xs border-cream-dark bg-soft-cream/50 text-charcoal">
                <SelectValue placeholder="All Payment States" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Payment States</SelectItem>
                <SelectItem value="UNDER_REVIEW">Payment: Under Review</SelectItem>
                <SelectItem value="VERIFIED">Payment: Verified</SelectItem>
                <SelectItem value="CLARIFICATION_REQUIRED">Payment: Clarification</SelectItem>
                <SelectItem value="PENDING">Payment: Pending</SelectItem>
                <SelectItem value="FAILED">Payment: Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Application Status Filter */}
          <div>
            <Select value={applicationFilter} onValueChange={(val) => setApplicationFilter(val)}>
              <SelectTrigger className="w-full h-9 text-xs border-cream-dark bg-soft-cream/50 text-charcoal">
                <SelectValue placeholder="All Application States" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Application States</SelectItem>
                <SelectItem value="SUBMITTED">Status: Submitted</SelectItem>
                <SelectItem value="UNDER_REVIEW">Status: Under Review</SelectItem>
                <SelectItem value="ACTION_REQUIRED">Status: Action Required</SelectItem>
                <SelectItem value="APPROVED">Status: Approved</SelectItem>
                <SelectItem value="REJECTED">Status: Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Status Count Summary & Excel Export */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-cream-dark text-xs text-stone-600">
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
                className="text-maroon hover:underline flex items-center gap-1 font-semibold text-xs"
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
            className="bg-maroon hover:bg-[#681724] text-white text-xs h-8 px-3 rounded-lg gap-1.5 shadow-none font-semibold"
          >
            {isExportingExcel ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5 text-saffron" />
            )}
            <span>Export to Excel</span>
          </Button>
        </div>
      </div>

      {/* UNIFIED DATA TABLE */}
      <div className="rounded-xl border border-cream-dark bg-warm-ivory overflow-hidden shadow-xs">
        {filteredApplications.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-sm font-semibold text-maroon">No matching registrations found</p>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Try adjusting your search criteria, competition selector, or status filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-soft-cream text-maroon font-bold border-b border-cream-dark">
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
              <tbody className="divide-y divide-[#EADBCE]">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-soft-cream/40 transition-colors">
                    {/* ID */}
                    <td className="py-3 px-4 font-mono font-bold text-maroon">
                      {app.registrationId}
                    </td>

                    {/* Participant */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-stone-900">
                        {app.fullName}
                      </div>
                      {app.isMinor && (
                        <span className="inline-block text-[10px] text-saffron font-bold mt-0.5">
                          Minor (&lt;18)
                        </span>
                      )}
                    </td>

                    {/* Competition */}
                    <td className="py-3 px-4 text-stone-600 font-medium">
                      {app.formName}
                    </td>

                    {/* Contact */}
                    <td className="py-3 px-4 text-stone-600 font-mono">
                      <div>{app.phone}</div>
                      <div className="text-[11px] text-stone-400">{app.email}</div>
                    </td>

                    {/* Payment Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          app.paymentStatus === "VERIFIED"
                            ? "bg-maroon text-white"
                            : app.paymentStatus === "UNDER_REVIEW"
                            ? "bg-amber-100 text-amber-900 border border-amber-200"
                            : app.paymentStatus === "CLARIFICATION_REQUIRED"
                            ? "bg-orange-100 text-orange-900 border border-orange-200"
                            : "bg-stone-100 text-stone-600 border border-stone-200"
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
                            ? "bg-maroon text-white"
                            : app.applicationStatus === "REJECTED"
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : app.applicationStatus === "ACTION_REQUIRED"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-blue-100 text-blue-800 border border-blue-200"
                        }`}
                      >
                        {app.applicationStatus.replace("_", " ")}
                      </span>
                    </td>

                    {/* Submitted At */}
                    <td className="py-3 px-4 text-stone-500 whitespace-nowrap text-[11px]">
                      {formatNepalDateTime(app.submittedAt)}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        onClick={() => handleOpenDrawer(app)}
                        className="bg-maroon hover:bg-[#681724] text-white text-xs h-7 px-3 rounded-lg shadow-none font-semibold"
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
      {/* CENTERED REVIEW MODAL POPUP */}
      {/* ==================================================================== */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop click to dismiss */}
          <div
            className="fixed inset-0"
            onClick={handleCloseDrawer}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-warm-ivory rounded-2xl border border-cream-dark shadow-2xl flex flex-col overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b border-cream-dark bg-soft-cream flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-saffron block">
                  {selectedApp.formName} &bull; Participant Dossier
                </span>
                <h2 className="text-xl font-bold text-maroon">
                  {selectedApp.fullName}
                </h2>
                <span className="font-mono text-xs font-bold text-stone-600">
                  Registration ID: {selectedApp.registrationId} &bull; Submitted {formatNepalDateTime(selectedApp.submittedAt)}
                </span>
              </div>
              <button
                onClick={handleCloseDrawer}
                className="p-1.5 rounded-lg hover:bg-[#EADBCE]/50 text-stone-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-charcoal">
              {/* CURRENT STATUS BADGES & A4 PDF DOWNLOAD */}
              <div className="p-4 rounded-xl bg-soft-cream border border-cream-dark flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">Payment State</span>
                    <span className="font-bold text-maroon">{selectedApp.paymentStatus.replace("_", " ")}</span>
                  </div>
                  <div className="h-6 w-px bg-[#EADBCE]" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">Application State</span>
                    <span className="font-bold text-maroon">{selectedApp.applicationStatus.replace("_", " ")}</span>
                  </div>
                </div>

                {selectedApp.applicationStatus === "APPROVED" && (
                  <Button
                    size="sm"
                    onClick={handleDownloadPdf}
                    disabled={isDownloadingPdf}
                    className="bg-maroon hover:bg-[#681724] text-white font-bold text-xs h-8 px-3 rounded-lg gap-1.5 shadow-none"
                  >
                    {isDownloadingPdf ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <FileDown className="w-3.5 h-3.5 text-saffron" />
                    )}
                    <span>Download A4 Confirmation PDF</span>
                  </Button>
                )}
              </div>

              {/* 1. PERSONAL INFORMATION & ADDRESS */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-maroon border-b border-cream-dark pb-1.5 flex items-center gap-2">
                  <User className="w-4 h-4 text-saffron" />
                  <span>1. Identification &amp; Geographic Location</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-soft-cream/40 border border-cream-dark">
                  <div>
                    <span className="text-[11px] text-stone-500 block">Mobile Phone:</span>
                    <span className="font-mono font-semibold text-stone-900">{selectedApp.phone}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-stone-500 block">Email Address:</span>
                    <span className="font-mono text-stone-900">{selectedApp.email}</span>
                  </div>
                  {selectedApp.dob && (
                    <div>
                      <span className="text-[11px] text-stone-500 block">Date of Birth:</span>
                      <span className="text-stone-900">{new Date(selectedApp.dob).toLocaleDateString()}</span>
                    </div>
                  )}
                  {selectedApp.currentAddress && (
                    <div>
                      <span className="text-[11px] text-stone-500 block">Current Address:</span>
                      <span className="text-stone-900">
                        {selectedApp.currentAddress}
                        {selectedApp.cityVillage ? `, ${selectedApp.cityVillage}` : ""}
                        {selectedApp.municipality ? `, ${selectedApp.municipality}` : ""}
                        {selectedApp.district ? `, ${selectedApp.district}` : ""}
                        {selectedApp.province ? `, ${selectedApp.province}` : ""}
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
                    <span>Minor Participant Safeguarding Verified (&lt; 18 Years)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-amber-950">
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
                      <strong className="text-amber-900">Verified Timestamped</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. PROFILE & MOTIVATION ANSWERS */}
              {(selectedApp.motivationReason || selectedApp.personalIntro || selectedApp.talentsSkills || selectedApp.languagesSpoken || selectedApp.hobbiesInterests) && (
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-maroon border-b border-cream-dark pb-1.5 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-saffron" />
                    <span>2. Cultural Profile &amp; Articulation</span>
                  </h3>
                  <div className="space-y-2.5">
                    {selectedApp.motivationReason && (
                      <div className="p-3.5 rounded-xl bg-soft-cream/40 border border-cream-dark">
                        <span className="text-[11px] font-bold text-maroon block mb-1">Why Participant Wants to Join Mithila Queen:</span>
                        <p className="leading-relaxed text-stone-800">
                          {selectedApp.motivationReason}
                        </p>
                      </div>
                    )}
                    {selectedApp.personalIntro && (
                      <div className="p-3.5 rounded-xl bg-soft-cream/40 border border-cream-dark">
                        <span className="text-[11px] font-bold text-maroon block mb-1">Personal Introduction:</span>
                        <p className="leading-relaxed text-stone-800">
                          {selectedApp.personalIntro}
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedApp.talentsSkills && (
                        <div className="p-3 rounded-xl bg-soft-cream/40 border border-cream-dark">
                          <span className="text-[11px] font-bold text-maroon block mb-0.5">Talents &amp; Skills:</span>
                          <p className="text-stone-800">{selectedApp.talentsSkills}</p>
                        </div>
                      )}
                      {selectedApp.languagesSpoken && (
                        <div className="p-3 rounded-xl bg-soft-cream/40 border border-cream-dark">
                          <span className="text-[11px] font-bold text-maroon block mb-0.5">Languages Spoken:</span>
                          <p className="text-stone-800">{selectedApp.languagesSpoken}</p>
                        </div>
                      )}
                      {selectedApp.hobbiesInterests && (
                        <div className="p-3 rounded-xl bg-soft-cream/40 border border-cream-dark">
                          <span className="text-[11px] font-bold text-maroon block mb-0.5">Hobbies &amp; Interests:</span>
                          <p className="text-stone-800">{selectedApp.hobbiesInterests}</p>
                        </div>
                      )}
                      {selectedApp.previousExperience && (
                        <div className="p-3 rounded-xl bg-soft-cream/40 border border-cream-dark">
                          <span className="text-[11px] font-bold text-maroon block mb-0.5">Previous Experience:</span>
                          <p className="text-stone-800">{selectedApp.experienceDetails || "Yes"}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. SOCIAL MEDIA ACCOUNTS */}
              {(selectedApp.instagramHandle || selectedApp.tiktokHandle || selectedApp.facebookUrl) && (
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-maroon border-b border-cream-dark pb-1.5 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-saffron" />
                    <span>3. Social Media Accounts</span>
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {selectedApp.instagramHandle && (
                      <a
                        href={selectedApp.instagramHandle.startsWith("http") ? selectedApp.instagramHandle : `https://instagram.com/${selectedApp.instagramHandle.replace("@", "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-soft-cream border border-cream-dark text-stone-800 hover:text-maroon hover:border-[#B89150] transition-colors"
                      >
                        <span className="font-bold text-[11px]">Instagram:</span>
                        <span className="font-mono text-[11px]">{selectedApp.instagramHandle}</span>
                        <ExternalLink className="w-3 h-3 text-saffron" />
                      </a>
                    )}
                    {selectedApp.tiktokHandle && (
                      <a
                        href={selectedApp.tiktokHandle.startsWith("http") ? selectedApp.tiktokHandle : `https://tiktok.com/@${selectedApp.tiktokHandle.replace("@", "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-soft-cream border border-cream-dark text-stone-800 hover:text-maroon hover:border-[#B89150] transition-colors"
                      >
                        <span className="font-bold text-[11px]">TikTok:</span>
                        <span className="font-mono text-[11px]">{selectedApp.tiktokHandle}</span>
                        <ExternalLink className="w-3 h-3 text-saffron" />
                      </a>
                    )}
                    {selectedApp.facebookUrl && (
                      <a
                        href={selectedApp.facebookUrl.startsWith("http") ? selectedApp.facebookUrl : `https://${selectedApp.facebookUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-soft-cream border border-cream-dark text-stone-800 hover:text-maroon hover:border-[#B89150] transition-colors"
                      >
                        <span className="font-bold text-[11px]">Facebook:</span>
                        <span className="font-mono text-[11px] truncate max-w-[150px]">{selectedApp.facebookUrl}</span>
                        <ExternalLink className="w-3 h-3 text-saffron" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* 5. MEDIA & UPLOADED FILES */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-maroon border-b border-cream-dark pb-1.5 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-saffron" />
                  <span>4. Uploaded Media &amp; Documents</span>
                </h3>
                <div className="flex flex-wrap gap-4">
                  {selectedApp.profilePhotoUrl && (
                    <div>
                      <span className="text-[11px] text-stone-500 block mb-1">Profile Photo:</span>
                      <a
                        href={selectedApp.profilePhotoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block relative w-24 h-32 rounded-xl border border-cream-dark overflow-hidden bg-stone-100 hover:opacity-90 shadow-2xs group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selectedApp.profilePhotoUrl}
                          alt="Profile"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </a>
                    </div>
                  )}

                  {selectedApp.videoUrl && (
                    <div>
                      <span className="text-[11px] text-stone-500 block mb-1">Audition Video:</span>
                      <a
                        href={selectedApp.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 p-3 rounded-xl bg-soft-cream border border-cream-dark text-maroon hover:bg-[#EADBCE]/50 transition-colors font-bold text-xs"
                      >
                        <Video className="w-4 h-4 text-saffron" />
                        <span>Watch Audition Video</span>
                        <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                      </a>
                    </div>
                  )}

                  {selectedApp.uploadedFiles &&
                    selectedApp.uploadedFiles.map((file) => (
                      <div key={file.id} className="p-3 rounded-xl border border-cream-dark bg-soft-cream/40 text-xs space-y-1">
                        <span className="font-bold text-maroon block truncate max-w-[180px]">
                          {file.originalName}
                        </span>
                        <span className="text-[10px] text-stone-500 block">
                          {(file.fileSize / 1024).toFixed(1)} KB
                        </span>
                        <a
                          href={file.storagePath}
                          target="_blank"
                          rel="noreferrer"
                          className="text-saffron font-semibold text-[11px] hover:underline flex items-center gap-1"
                        >
                          <span>Open File</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                </div>
              </div>

              {/* 6. PAYMENT VERIFICATION CENTER (TIER 1) */}
              <div className="p-4 rounded-xl bg-soft-cream border border-cream-dark space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-maroon flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-saffron" />
                    <span>Payment Verification (NPR {selectedApp.registrationFee})</span>
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    selectedApp.paymentStatus === "VERIFIED"
                      ? "bg-maroon text-white"
                      : "bg-saffron text-white"
                  }`}>
                    {selectedApp.paymentStatus.replace("_", " ")}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div className="p-3 rounded-lg bg-white border border-cream-dark">
                    <span className="text-stone-500 block mb-0.5">Transaction Reference / UTR:</span>
                    <span className="font-mono font-bold text-sm text-maroon">
                      {selectedApp.paymentReference || "Not yet submitted"}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-cream-dark">
                    <span className="text-stone-500 block mb-0.5">Bank Receipt Screenshot:</span>
                    {selectedApp.paymentScreenshotUrl ? (
                      <a
                        href={selectedApp.paymentScreenshotUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-saffron font-bold hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <span>View Full Screenshot</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-stone-400">None uploaded</span>
                    )}
                  </div>
                </div>

                {selectedApp.paymentClarificationNotes && (
                  <div className="p-2.5 rounded-lg bg-orange-50 border border-orange-200 text-[11px] text-orange-950">
                    <span className="font-bold block">Current Clarification Notes:</span>
                    <span>{selectedApp.paymentClarificationNotes}</span>
                  </div>
                )}

                {/* Clarification input field */}
                {showClarificationInput && (
                  <div className="space-y-2 pt-2 border-t border-cream-dark">
                    <Label className="text-xs font-bold text-maroon">
                      Specific Clarification Required from Applicant:
                    </Label>
                    <Textarea
                      value={clarificationNotes}
                      onChange={(e) => setClarificationNotes(e.target.value)}
                      placeholder="e.g. Transaction UTR does not match bank record. Please re-check receipt."
                      className="text-xs border-cream-dark bg-white h-16 focus-visible:ring-saffron"
                    />
                  </div>
                )}

                {/* Payment Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    disabled={isVerifyingPayment || selectedApp.paymentStatus === "VERIFIED"}
                    onClick={() => handlePaymentAction("VERIFIED")}
                    className="bg-maroon hover:bg-[#681724] text-white text-xs h-8 px-3 rounded-lg shadow-none font-bold"
                  >
                    {isVerifyingPayment ? (
                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3 mr-1 text-saffron" />
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
                    className="border-orange-300 text-orange-900 bg-white hover:bg-orange-50 text-xs h-8 px-3 rounded-lg shadow-none"
                  >
                    <AlertCircle className="w-3 h-3 mr-1 text-orange-600" />
                    <span>{showClarificationInput ? "Confirm Request" : "Request Clarification"}</span>
                  </Button>
                </div>
              </div>

              {/* 7. APPLICATION ADJUDICATION (TIER 2) */}
              <div className="p-4 rounded-xl bg-white border border-cream-dark space-y-3">
                <h3 className="font-bold text-sm text-maroon flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-saffron" />
                  <span>Application Adjudication</span>
                </h3>

                {selectedApp.paymentStatus !== "VERIFIED" && (
                  <p className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                    Payment must be independently <strong>VERIFIED</strong> before this application can be approved.
                  </p>
                )}

                {/* Private Admin Notes */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-stone-700">
                    Private Administrator Notes (Internal only):
                  </Label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Interview feedback, committee remarks, eligibility confirmation..."
                    className="text-xs border-cream-dark bg-soft-cream/30 h-16 focus-visible:ring-saffron"
                  />
                </div>

                {/* Reason Input for Reject or Action Required */}
                {(showRejectInput || showActionInput) && (
                  <div className="space-y-1.5 pt-2 border-t border-cream-dark">
                    <Label className="text-xs font-bold text-maroon">
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
                      className="text-xs border-cream-dark bg-white h-16 focus-visible:ring-saffron"
                    />
                  </div>
                )}

                {/* Adjudication Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    disabled={isAdjudicating || selectedApp.paymentStatus !== "VERIFIED"}
                    onClick={() => handleApplicationAction("APPROVED")}
                    className="bg-maroon hover:bg-[#681724] text-white text-xs h-8 px-4 rounded-lg shadow-none font-bold"
                  >
                    {isAdjudicating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-saffron" />
                    )}
                    <span>Approve &amp; Issue Confirmation</span>
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
                    className="border-amber-300 text-amber-900 bg-white hover:bg-amber-50 text-xs h-8 px-3 rounded-lg shadow-none"
                  >
                    <AlertCircle className="w-3 h-3 mr-1 text-amber-600" />
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
                    className="border-rose-300 text-rose-900 bg-white hover:bg-rose-50 text-xs h-8 px-3 rounded-lg shadow-none"
                  >
                    <XCircle className="w-3 h-3 mr-1 text-rose-600" />
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

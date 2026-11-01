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
  Check,
  ZoomIn,
  Receipt,
  Sparkles,
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

type WorkflowTab = "ALL" | "PENDING_PAYMENT" | "READY_FOR_REVIEW" | "APPROVED" | "ACTION_REQUIRED" | "REJECTED";

export function UnifiedResponsesView({
  applications,
  forms,
}: {
  applications: UnifiedApplication[];
  forms: FormOption[];
}) {
  const searchParams = useSearchParams();

  // Local state for instant real-time synchronization
  const [localApplications, setLocalApplications] = useState<UnifiedApplication[]>(applications);
  useEffect(() => {
    setLocalApplications(applications);
  }, [applications]);

  // Workflow Filter Tabs
  const [workflowTab, setWorkflowTab] = useState<WorkflowTab>("ALL");

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [formFilter, setFormFilter] = useState(() => searchParams.get("form") || "ALL");
  const [paymentFilter, setPaymentFilter] = useState(() => searchParams.get("paymentStatus") || "ALL");
  const [applicationFilter, setApplicationFilter] = useState(() => searchParams.get("applicationStatus") || "ALL");

  useEffect(() => {
    const qForm = searchParams.get("form");
    if (qForm) setFormFilter(qForm);
    const qPayment = searchParams.get("paymentStatus");
    if (qPayment) {
      setPaymentFilter(qPayment);
      if (qPayment === "UNDER_REVIEW") setWorkflowTab("PENDING_PAYMENT");
    }
    const qApp = searchParams.get("applicationStatus");
    if (qApp) {
      setApplicationFilter(qApp);
      if (qApp === "APPROVED") setWorkflowTab("APPROVED");
      else if (qApp === "UNDER_REVIEW") setWorkflowTab("READY_FOR_REVIEW");
    }
  }, [searchParams]);

  // Drawer & Modal states
  const [selectedApp, setSelectedApp] = useState<UnifiedApplication | null>(null);
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState<string>("");

  // Action states
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [quickVerifyingId, setQuickVerifyingId] = useState<string | null>(null);
  const [quickApprovingId, setQuickApprovingId] = useState<string | null>(null);
  const [quickDownloadingId, setQuickDownloadingId] = useState<string | null>(null);
  const [clarificationNotes, setClarificationNotes] = useState("");
  const [showClarificationInput, setShowClarificationInput] = useState(false);

  const [isAdjudicating, setIsAdjudicating] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [decisionReason, setDecisionReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [showActionInput, setShowActionInput] = useState(false);

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // Live Counts for Workflow Tabs
  const counts = useMemo(() => {
    return {
      all: localApplications.length,
      pendingPayment: localApplications.filter(
        (a) => a.paymentStatus === "UNDER_REVIEW" || a.paymentStatus === "PENDING"
      ).length,
      readyForReview: localApplications.filter(
        (a) => a.paymentStatus === "VERIFIED" && a.applicationStatus !== "APPROVED" && a.applicationStatus !== "REJECTED"
      ).length,
      approved: localApplications.filter((a) => a.applicationStatus === "APPROVED").length,
      actionRequired: localApplications.filter(
        (a) => a.paymentStatus === "CLARIFICATION_REQUIRED" || a.applicationStatus === "ACTION_REQUIRED"
      ).length,
      rejected: localApplications.filter((a) => a.applicationStatus === "REJECTED").length,
    };
  }, [localApplications]);

  // Filtered Applications
  const filteredApplications = useMemo(() => {
    return localApplications.filter((app) => {
      // 1. Workflow Tab
      if (workflowTab === "PENDING_PAYMENT") {
        if (app.paymentStatus !== "UNDER_REVIEW" && app.paymentStatus !== "PENDING") return false;
      } else if (workflowTab === "READY_FOR_REVIEW") {
        if (app.paymentStatus !== "VERIFIED" || app.applicationStatus === "APPROVED" || app.applicationStatus === "REJECTED") {
          return false;
        }
      } else if (workflowTab === "APPROVED") {
        if (app.applicationStatus !== "APPROVED") return false;
      } else if (workflowTab === "ACTION_REQUIRED") {
        if (app.paymentStatus !== "CLARIFICATION_REQUIRED" && app.applicationStatus !== "ACTION_REQUIRED") {
          return false;
        }
      } else if (workflowTab === "REJECTED") {
        if (app.applicationStatus !== "REJECTED") return false;
      }

      // 2. Form filter
      if (formFilter !== "ALL" && app.formSlug !== formFilter) {
        return false;
      }

      // 3. Payment Status filter
      if (paymentFilter !== "ALL" && app.paymentStatus !== paymentFilter) {
        return false;
      }

      // 4. Application Status filter
      if (applicationFilter !== "ALL" && app.applicationStatus !== applicationFilter) {
        return false;
      }

      // 5. Search query
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
  }, [localApplications, workflowTab, formFilter, paymentFilter, applicationFilter, searchTerm]);

  // Open Dossier Drawer
  const handleOpenDrawer = (app: UnifiedApplication) => {
    setSelectedApp(app);
    setAdminNotes(app.privateAdminNotes || "");
    setClarificationNotes(app.paymentClarificationNotes || "");
    setDecisionReason("");
    setShowClarificationInput(false);
    setShowRejectInput(false);
    setShowActionInput(false);
  };

  // Close Dossier Drawer
  const handleCloseDrawer = () => {
    setSelectedApp(null);
  };

  // 1-Click Quick Payment Verification from Table
  const handleQuickVerifyPayment = async (app: UnifiedApplication, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setQuickVerifyingId(app.registrationId);

    const res = await adminVerifyPaymentAction({
      registrationId: app.registrationId,
      decision: "VERIFY",
      notes: "Quick verified against official bank records by administrator.",
    });
    setQuickVerifyingId(null);

    if (res.success) {
      toast.success(`Payment verified for ${app.fullName} (${app.registrationId})!`);
      setLocalApplications((prev) =>
        prev.map((a) =>
          a.registrationId === app.registrationId
            ? {
                ...a,
                paymentStatus: "VERIFIED",
                paymentVerifiedAt: new Date(),
                applicationStatus: "UNDER_REVIEW",
              }
            : a
        )
      );
      if (selectedApp && selectedApp.registrationId === app.registrationId) {
        setSelectedApp((prev) =>
          prev
            ? {
                ...prev,
                paymentStatus: "VERIFIED",
                paymentVerifiedAt: new Date(),
                applicationStatus: "UNDER_REVIEW",
              }
            : null
        );
      }
    } else {
      toast.error(res.error || "Failed to verify payment.");
    }
  };

  // 1-Click Direct Application Approval from Table (only for VERIFIED payments)
  const handleQuickApproveApplication = async (app: UnifiedApplication, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (app.paymentStatus !== "VERIFIED") {
      toast.error("Payment must be independently verified before application approval.");
      return;
    }

    setQuickApprovingId(app.registrationId);
    const res = await adminAdjudicateApplicationAction({
      registrationId: app.registrationId,
      decision: "APPROVE",
      reason: "Approved following administrative verification of payment and documents.",
    });
    setQuickApprovingId(null);

    if (res.success) {
      toast.success(`Application officially approved for ${app.fullName} (${app.registrationId})! Confirmation PDF generated.`);
      setLocalApplications((prev) =>
        prev.map((a) =>
          a.registrationId === app.registrationId
            ? {
                ...a,
                applicationStatus: "APPROVED",
                pdfGeneratedAt: new Date(),
              }
            : a
        )
      );
      if (selectedApp && selectedApp.registrationId === app.registrationId) {
        setSelectedApp((prev) =>
          prev
            ? {
                ...prev,
                applicationStatus: "APPROVED",
                pdfGeneratedAt: new Date(),
              }
            : null
        );
      }
    } else {
      toast.error(res.error || "Failed to approve application.");
    }
  };

  // 1-Click Quick PDF Download from Table
  const handleQuickDownloadPdf = async (app: UnifiedApplication, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setQuickDownloadingId(app.registrationId);

    const res = await downloadApprovedPdfAction({
      registrationId: app.registrationId,
      verificationContact: app.email,
    });
    setQuickDownloadingId(null);

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
      a.download = `Confirmation-${app.registrationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success(`Confirmation PDF downloaded for ${app.fullName}.`);
    } else {
      toast.error(res.error || "Failed to download confirmation PDF.");
    }
  };

  // Payment Verification Handler (from Drawer)
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
      // Instant Local State update
      setLocalApplications((prev) =>
        prev.map((a) =>
          a.registrationId === selectedApp.registrationId
            ? {
                ...a,
                paymentStatus: status,
                paymentClarificationNotes: status === "CLARIFICATION_REQUIRED" ? clarificationNotes : null,
                paymentVerifiedAt: status === "VERIFIED" ? new Date() : a.paymentVerifiedAt,
                applicationStatus: status === "VERIFIED" ? "UNDER_REVIEW" : a.applicationStatus,
              }
            : a
        )
      );
      setSelectedApp((prev) =>
        prev
          ? {
              ...prev,
              paymentStatus: status,
              paymentClarificationNotes: status === "CLARIFICATION_REQUIRED" ? clarificationNotes : null,
              paymentVerifiedAt: status === "VERIFIED" ? new Date() : prev.paymentVerifiedAt,
              applicationStatus: status === "VERIFIED" ? "UNDER_REVIEW" : prev.applicationStatus,
            }
          : null
      );
    } else {
      toast.error(res.error || "Failed to update payment status.");
    }
  };

  // Application Adjudication Handler (from Drawer)
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
          ? "Application officially approved! Confirmation PDF generated and dispatched via email."
          : `Application status updated to ${status}.`
      );
      // Instant Local State update
      setLocalApplications((prev) =>
        prev.map((a) =>
          a.registrationId === selectedApp.registrationId
            ? {
                ...a,
                applicationStatus: status,
                privateAdminNotes: adminNotes,
                rejectionReason: status === "REJECTED" ? decisionReason : a.rejectionReason,
                actionRequiredDetails: status === "ACTION_REQUIRED" ? decisionReason : a.actionRequiredDetails,
                pdfGeneratedAt: status === "APPROVED" ? new Date() : a.pdfGeneratedAt,
              }
            : a
        )
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
    <div className="space-y-5">
      {/* ==================================================================== */}
      {/* 1. WORKFLOW TABS: FAST 1-CLICK APPLICATION SCREENING */}
      {/* ==================================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-[#DCE5ED]">
        <button
          type="button"
          onClick={() => setWorkflowTab("ALL")}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
            workflowTab === "ALL"
              ? "border-[#183153] text-[#183153] bg-white font-bold"
              : "border-transparent text-[#546E7A] hover:text-[#263238] hover:bg-[#F4F7FA]"
          }`}
        >
          <span>All Submissions</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#F4F7FA] text-[#183153] border border-[#DCE5ED] font-mono font-bold">
            {counts.all}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setWorkflowTab("PENDING_PAYMENT")}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
            workflowTab === "PENDING_PAYMENT"
              ? "border-amber-600 text-amber-900 bg-amber-50/50 font-bold"
              : "border-transparent text-[#546E7A] hover:text-[#263238] hover:bg-[#F4F7FA]"
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 text-amber-600" />
          <span>Needs Payment Check</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-900 font-mono font-bold border border-amber-200">
            {counts.pendingPayment}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setWorkflowTab("READY_FOR_REVIEW")}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
            workflowTab === "READY_FOR_REVIEW"
              ? "border-[#356FA8] text-[#183153] bg-blue-50/50 font-bold"
              : "border-transparent text-[#546E7A] hover:text-[#263238] hover:bg-[#F4F7FA]"
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-[#356FA8]" />
          <span>Ready for Review</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-blue-100 text-[#183153] font-mono font-bold border border-blue-200">
            {counts.readyForReview}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setWorkflowTab("APPROVED")}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
            workflowTab === "APPROVED"
              ? "border-emerald-600 text-emerald-900 bg-emerald-50/50 font-bold"
              : "border-transparent text-[#546E7A] hover:text-[#263238] hover:bg-[#F4F7FA]"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Approved Candidates</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-900 font-mono font-bold border border-emerald-200">
            {counts.approved}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setWorkflowTab("ACTION_REQUIRED")}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
            workflowTab === "ACTION_REQUIRED"
              ? "border-orange-600 text-orange-900 bg-orange-50/50 font-bold"
              : "border-transparent text-[#546E7A] hover:text-[#263238] hover:bg-[#F4F7FA]"
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-orange-600" />
          <span>Queries &amp; Clarifications</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-orange-100 text-orange-900 font-mono font-bold border border-orange-200">
            {counts.actionRequired}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setWorkflowTab("REJECTED")}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
            workflowTab === "REJECTED"
              ? "border-rose-600 text-rose-900 bg-rose-50/50 font-bold"
              : "border-transparent text-[#546E7A] hover:text-[#263238] hover:bg-[#F4F7FA]"
          }`}
        >
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          <span>Rejected</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-900 font-mono font-bold border border-rose-200">
            {counts.rejected}
          </span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* 2. FILTER & SEARCH CONTROL BAR */}
      {/* ==================================================================== */}
      <div className="p-4 rounded-xl bg-white border border-[#DCE5ED] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, ID, phone, UTR..."
              className="pl-9 h-9 text-xs border-[#DCE5ED] bg-[#F4F7FA]/50 text-[#263238] focus-visible:ring-[#356FA8]"
            />
          </div>

          {/* Form / Competition Selector */}
          <div>
            <Select value={formFilter} onValueChange={(val) => setFormFilter(val)}>
              <SelectTrigger className="w-full h-9 text-xs border-[#DCE5ED] bg-[#F4F7FA]/50 text-[#263238]">
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
              <SelectTrigger className="w-full h-9 text-xs border-[#DCE5ED] bg-[#F4F7FA]/50 text-[#263238]">
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
              <SelectTrigger className="w-full h-9 text-xs border-[#DCE5ED] bg-[#F4F7FA]/50 text-[#263238]">
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
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#DCE5ED] text-xs text-[#546E7A]">
          <div className="flex items-center gap-3">
            <span>
              Showing <strong>{filteredApplications.length}</strong> of {localApplications.length} applications
            </span>
            {(workflowTab !== "ALL" || formFilter !== "ALL" || paymentFilter !== "ALL" || applicationFilter !== "ALL" || searchTerm) && (
              <button
                type="button"
                onClick={() => {
                  setWorkflowTab("ALL");
                  setSearchTerm("");
                  setFormFilter("ALL");
                  setPaymentFilter("ALL");
                  setApplicationFilter("ALL");
                }}
                className="text-[#356FA8] hover:underline flex items-center gap-1 font-semibold text-xs"
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
            className="bg-[#183153] hover:bg-[#12243d] text-white text-xs h-8 px-3 rounded-lg gap-1.5 shadow-none font-semibold"
          >
            {isExportingExcel ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5 text-[#356FA8]" />
            )}
            <span>Export to Excel</span>
          </Button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. UNIFIED DATA TABLE WITH DIRECT RECEIPT PREVIEW & 1-CLICK VERIFY */}
      {/* ==================================================================== */}
      <div className="rounded-xl border border-[#DCE5ED] bg-white overflow-hidden shadow-xs">
        {filteredApplications.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-sm font-semibold text-[#183153]">No matching registrations found</p>
            <p className="text-xs text-[#546E7A] max-w-sm mx-auto">
              Try switching your workflow tab or clearing search criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F4F7FA] text-[#183153] font-bold border-b border-[#DCE5ED]">
                <tr>
                  <th className="py-3 px-4">Registration ID</th>
                  <th className="py-3 px-4">Participant</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Payment &amp; Proof</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE5ED]">
                {filteredApplications.map((app) => {
                  const isQuickVerifying = quickVerifyingId === app.registrationId;
                  const isQuickApproving = quickApprovingId === app.registrationId;
                  const isQuickDownloading = quickDownloadingId === app.registrationId;
                  const isPaymentUnderReview = app.paymentStatus === "UNDER_REVIEW";
                  const canQuickApprove =
                    app.paymentStatus === "VERIFIED" &&
                    app.applicationStatus !== "APPROVED" &&
                    app.applicationStatus !== "REJECTED";
                  const isApproved = app.applicationStatus === "APPROVED";

                  return (
                    <tr key={app.id} className="hover:bg-[#F4F7FA]/50 transition-colors">
                      {/* Registration ID */}
                      <td className="py-3 px-4 font-mono font-bold text-[#183153]">
                        {app.registrationId}
                      </td>

                      {/* Participant Name & Minor Flag */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#263238] flex items-center gap-1.5">
                          <span>{app.fullName}</span>
                          {app.profilePhotoUrl && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setLightboxImageUrl(app.profilePhotoUrl!);
                                setLightboxTitle(`${app.fullName} - Portrait`);
                              }}
                              className="text-[10px] text-[#356FA8] hover:underline"
                              title="View photo"
                            >
                              <User className="w-3 h-3 text-[#356FA8]" />
                            </button>
                          )}
                        </div>
                        {app.isMinor && (
                          <span className="inline-block text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded font-bold mt-0.5">
                            Minor (&lt;18)
                          </span>
                        )}
                      </td>

                      {/* Contact Info */}
                      <td className="py-3 px-4 text-[#546E7A] font-mono text-[11px]">
                        <div>{app.phone}</div>
                        <div className="text-[10px] text-stone-400">{app.email}</div>
                      </td>

                      {/* Payment, Reference & Screenshot Quick View */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                app.paymentStatus === "VERIFIED"
                                  ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                                  : app.paymentStatus === "UNDER_REVIEW"
                                  ? "bg-amber-100 text-amber-900 border border-amber-200"
                                  : app.paymentStatus === "CLARIFICATION_REQUIRED"
                                  ? "bg-orange-100 text-orange-900 border border-orange-200"
                                  : "bg-stone-100 text-stone-600 border border-stone-200"
                              }`}
                            >
                              {app.paymentStatus.replace("_", " ")}
                            </span>

                            {/* Clickable Receipt Thumbnail / Badge */}
                            {app.paymentScreenshotUrl && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLightboxImageUrl(app.paymentScreenshotUrl!);
                                  setLightboxTitle(`Receipt: ${app.fullName} (${app.registrationId})`);
                                }}
                                className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#356FA8] bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded hover:bg-blue-100 transition-colors"
                                title="Click to view full receipt screenshot"
                              >
                                <Receipt className="w-3 h-3" />
                                <span>Receipt</span>
                              </button>
                            )}
                          </div>

                          {app.paymentReference ? (
                            <span className="text-[10px] font-mono font-medium text-stone-700 block truncate max-w-[170px]" title={app.paymentReference}>
                              Ref: {app.paymentReference}
                            </span>
                          ) : (
                            <span className="text-[10px] text-stone-400 italic block">No ref submitted</span>
                          )}
                        </div>
                      </td>

                      {/* Application Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            app.applicationStatus === "APPROVED"
                              ? "bg-[#183153] text-white"
                              : app.applicationStatus === "REJECTED"
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : app.applicationStatus === "ACTION_REQUIRED"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-blue-50 text-[#183153] border border-blue-200"
                          }`}
                        >
                          {app.applicationStatus.replace("_", " ")}
                        </span>
                      </td>

                      {/* Submission Date */}
                      <td className="py-3 px-4 text-[#546E7A] whitespace-nowrap text-[11px]">
                        {formatNepalDateTime(app.submittedAt)}
                      </td>

                      {/* Action Controls */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1-Click Direct "Verify" Button for Payments Under Review */}
                          {isPaymentUnderReview && (
                            <Button
                              size="sm"
                              disabled={isQuickVerifying}
                              onClick={(e) => handleQuickVerifyPayment(app, e)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] h-7 px-2.5 rounded-lg shadow-none font-semibold gap-1"
                              title="1-Click verify payment against bank record"
                            >
                              {isQuickVerifying ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                              <span>Verify</span>
                            </Button>
                          )}

                          {/* 1-Click Direct "Approve" Button when Payment is Verified */}
                          {canQuickApprove && (
                            <Button
                              size="sm"
                              disabled={isQuickApproving}
                              onClick={(e) => handleQuickApproveApplication(app, e)}
                              className="bg-[#183153] hover:bg-[#12243D] text-white text-[11px] h-7 px-2.5 rounded-lg shadow-none font-semibold gap-1"
                              title="1-Click approve application & generate PDF"
                            >
                              {isQuickApproving ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Sparkles className="w-3 h-3 text-[#356FA8]" />
                              )}
                              <span>Approve</span>
                            </Button>
                          )}

                          {/* 1-Click Direct PDF Download for Approved Applications */}
                          {isApproved && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isQuickDownloading}
                              onClick={(e) => handleQuickDownloadPdf(app, e)}
                              className="border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] h-7 px-2 rounded-lg shadow-none font-semibold gap-1"
                              title="Download Confirmation PDF"
                            >
                              {isQuickDownloading ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <FileDown className="w-3 h-3 text-emerald-700" />
                              )}
                              <span>PDF</span>
                            </Button>
                          )}

                          {/* Full Dossier Review */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenDrawer(app)}
                            className="border-[#DCE5ED] hover:bg-[#F4F7FA] text-[#183153] text-xs h-7 px-3 rounded-lg shadow-none font-semibold"
                          >
                            Review
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 4. LIGHTBOX IMAGE PREVIEW MODAL */}
      {/* ==================================================================== */}
      {lightboxImageUrl && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100">
          <div className="relative max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-stone-700 space-y-3 p-4">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-xs font-bold text-[#183153] truncate">{lightboxTitle}</span>
              <div className="flex items-center gap-2">
                <a
                  href={lightboxImageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#356FA8] hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Open in tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => setLightboxImageUrl(null)}
                  className="p-1 rounded-lg hover:bg-stone-100 text-stone-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="max-h-[75vh] overflow-auto flex items-center justify-center bg-stone-50 rounded-xl p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightboxImageUrl}
                alt="Enlarged Document"
                className="max-h-[70vh] w-auto object-contain rounded-lg shadow-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 5. CENTERED CANDIDATE DOSSIER & ADJUDICATION MODAL */}
      {/* ==================================================================== */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop click to dismiss */}
          <div className="fixed inset-0" onClick={handleCloseDrawer} />

          {/* Modal Container */}
          <div className="relative w-full max-w-3xl max-h-[92vh] bg-white rounded-2xl border border-[#DCE5ED] shadow-2xl flex flex-col overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b border-[#DCE5ED] bg-[#F4F7FA] flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#356FA8] block">
                  {selectedApp.formName} &bull; Participant Dossier
                </span>
                <h2 className="text-xl font-bold text-[#183153]">{selectedApp.fullName}</h2>
                <span className="font-mono text-xs text-[#546E7A]">
                  Registration ID: <strong>{selectedApp.registrationId}</strong> &bull; Submitted {formatNepalDateTime(selectedApp.submittedAt)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCloseDrawer}
                className="p-1.5 rounded-lg hover:bg-[#DCE5ED] text-stone-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-[#263238]">
              {/* APPROVAL SEQUENCE PROGRESS BAR (Page 8 of Brief) */}
              <div className="p-4 rounded-xl bg-[#F4F7FA] border border-[#DCE5ED] space-y-2.5">
                <span className="text-[10px] uppercase font-bold text-[#356FA8] tracking-wider block">
                  Official Verification &amp; Approval Sequence
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
                  {/* Step 1: Submitted */}
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold">
                    1. Application Submitted
                  </div>
                  {/* Step 2: Payment Verified */}
                  <div
                    className={`p-2 rounded-lg border font-semibold ${
                      selectedApp.paymentStatus === "VERIFIED"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                        : "bg-amber-50 border-amber-200 text-amber-900 animate-pulse"
                    }`}
                  >
                    2. Payment Verified
                  </div>
                  {/* Step 3: Reviewed */}
                  <div
                    className={`p-2 rounded-lg border font-semibold ${
                      ["APPROVED", "REJECTED"].includes(selectedApp.applicationStatus)
                        ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                        : "bg-white border-[#DCE5ED] text-[#546E7A]"
                    }`}
                  >
                    3. Application Reviewed
                  </div>
                  {/* Step 4: Approved & PDF */}
                  <div
                    className={`p-2 rounded-lg border font-semibold ${
                      selectedApp.applicationStatus === "APPROVED"
                        ? "bg-[#183153] text-white border-[#183153]"
                        : "bg-white border-[#DCE5ED] text-[#546E7A]"
                    }`}
                  >
                    4. Approved &amp; PDF Issued
                  </div>
                </div>

                {selectedApp.applicationStatus === "APPROVED" && (
                  <div className="pt-2 flex items-center justify-end">
                    <Button
                      size="sm"
                      onClick={handleDownloadPdf}
                      disabled={isDownloadingPdf}
                      className="bg-[#183153] hover:bg-[#12243d] text-white font-bold text-xs h-8 px-3 rounded-lg gap-1.5 shadow-none"
                    >
                      {isDownloadingPdf ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      <span>Download Official A4 Confirmation PDF</span>
                    </Button>
                  </div>
                )}
              </div>

              {/* SECTION 1: PAYMENT VERIFICATION (Crucial Organizer Action) */}
              <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#183153] flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-amber-700" />
                    <span>Payment Verification (Fee: NPR {selectedApp.registrationFee})</span>
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      selectedApp.paymentStatus === "VERIFIED"
                        ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                        : "bg-amber-100 text-amber-900 border border-amber-200"
                    }`}
                  >
                    {selectedApp.paymentStatus.replace("_", " ")}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div className="p-3 rounded-lg bg-white border border-[#DCE5ED]">
                    <span className="text-[#546E7A] block mb-0.5 font-medium">Bank Transaction Reference / UTR:</span>
                    <span className="font-mono font-bold text-sm text-[#183153]">
                      {selectedApp.paymentReference || "Not yet submitted"}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-white border border-[#DCE5ED]">
                    <span className="text-[#546E7A] block mb-0.5 font-medium">Payment Screenshot / Receipt:</span>
                    {selectedApp.paymentScreenshotUrl ? (
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setLightboxImageUrl(selectedApp.paymentScreenshotUrl!);
                            setLightboxTitle(`Receipt: ${selectedApp.fullName}`);
                          }}
                          className="text-[#356FA8] font-bold hover:underline flex items-center gap-1"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                          <span>View Full Screenshot</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-stone-400 italic">None uploaded</span>
                    )}
                  </div>
                </div>

                {/* Screenshot Display in Dossier if Available */}
                {selectedApp.paymentScreenshotUrl && (
                  <div className="p-3 bg-white rounded-lg border border-[#DCE5ED] space-y-2">
                    <span className="text-[11px] font-bold text-[#183153] block">Receipt Image Preview:</span>
                    <div
                      className="max-h-48 overflow-hidden rounded-md border border-stone-200 cursor-pointer group relative bg-stone-50 flex items-center justify-center"
                      onClick={() => {
                        setLightboxImageUrl(selectedApp.paymentScreenshotUrl!);
                        setLightboxTitle(`Receipt: ${selectedApp.fullName}`);
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedApp.paymentScreenshotUrl}
                        alt="Receipt"
                        className="max-h-48 w-auto object-contain group-hover:scale-[1.02] transition-transform duration-150"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                        <ZoomIn className="w-4 h-4 mr-1" /> Click to enlarge
                      </div>
                    </div>
                  </div>
                )}

                {selectedApp.paymentClarificationNotes && (
                  <div className="p-2.5 rounded-lg bg-orange-50 border border-orange-200 text-[11px] text-orange-950">
                    <span className="font-bold block">Current Clarification Notes:</span>
                    <span>{selectedApp.paymentClarificationNotes}</span>
                  </div>
                )}

                {/* Clarification input field */}
                {showClarificationInput && (
                  <div className="space-y-2 pt-2 border-t border-[#DCE5ED]">
                    <Label className="text-xs font-bold text-[#183153]">
                      Specific Clarification Required from Applicant:
                    </Label>
                    <Textarea
                      value={clarificationNotes}
                      onChange={(e) => setClarificationNotes(e.target.value)}
                      placeholder="e.g. Transaction UTR does not match bank record. Please re-check receipt."
                      className="text-xs border-[#DCE5ED] bg-white h-16 focus-visible:ring-[#356FA8]"
                    />
                  </div>
                )}

                {/* Payment Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    disabled={isVerifyingPayment || selectedApp.paymentStatus === "VERIFIED"}
                    onClick={() => handlePaymentAction("VERIFIED")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-3 rounded-lg shadow-none font-bold"
                  >
                    {isVerifyingPayment ? (
                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3 mr-1 text-white" />
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

              {/* SECTION 2: PERSONAL IDENTITY & GEOGRAPHIC LOCATION */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-[#183153] border-b border-[#DCE5ED] pb-1.5 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#356FA8]" />
                  <span>1. Identification &amp; Geographic Location</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-[#F4F7FA]/60 border border-[#DCE5ED]">
                  <div>
                    <span className="text-[11px] text-[#546E7A] block">Mobile Phone:</span>
                    <span className="font-mono font-semibold text-stone-900">{selectedApp.phone}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#546E7A] block">Email Address:</span>
                    <span className="font-mono text-stone-900">{selectedApp.email}</span>
                  </div>
                  {selectedApp.dob && (
                    <div>
                      <span className="text-[11px] text-[#546E7A] block">Date of Birth:</span>
                      <span className="text-stone-900">
                        {new Date(selectedApp.dob).toLocaleDateString()} {selectedApp.isMinor ? "(Minor < 18)" : ""}
                      </span>
                    </div>
                  )}
                  {selectedApp.currentAddress && (
                    <div>
                      <span className="text-[11px] text-[#546E7A] block">Current Address:</span>
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

              {/* SECTION 3: MINOR PARTICIPANT SAFEGUARDING (<18) */}
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
                      <span>Consent Status: </span>
                      <strong className="text-emerald-800">Verified Timestamped</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 4: PROFILE, ESSAY & CULTURAL ARTICULATION */}
              {(selectedApp.motivationReason ||
                selectedApp.personalIntro ||
                selectedApp.talentsSkills ||
                selectedApp.languagesSpoken ||
                selectedApp.hobbiesInterests) && (
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-[#183153] border-b border-[#DCE5ED] pb-1.5 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-[#356FA8]" />
                    <span>2. Cultural Profile &amp; Articulation</span>
                  </h3>
                  <div className="space-y-2.5">
                    {selectedApp.motivationReason && (
                      <div className="p-3.5 rounded-xl bg-[#F4F7FA]/60 border border-[#DCE5ED]">
                        <span className="text-[11px] font-bold text-[#183153] block mb-1">
                          Why Participant Wants to Join Mithila Queen:
                        </span>
                        <p className="leading-relaxed text-stone-800">{selectedApp.motivationReason}</p>
                      </div>
                    )}
                    {selectedApp.personalIntro && (
                      <div className="p-3.5 rounded-xl bg-[#F4F7FA]/60 border border-[#DCE5ED]">
                        <span className="text-[11px] font-bold text-[#183153] block mb-1">
                          Personal Introduction:
                        </span>
                        <p className="leading-relaxed text-stone-800">{selectedApp.personalIntro}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedApp.talentsSkills && (
                        <div className="p-3 rounded-xl bg-[#F4F7FA]/60 border border-[#DCE5ED]">
                          <span className="text-[11px] font-bold text-[#183153] block mb-0.5">Talents &amp; Skills:</span>
                          <p className="text-stone-800">{selectedApp.talentsSkills}</p>
                        </div>
                      )}
                      {selectedApp.languagesSpoken && (
                        <div className="p-3 rounded-xl bg-[#F4F7FA]/60 border border-[#DCE5ED]">
                          <span className="text-[11px] font-bold text-[#183153] block mb-0.5">Languages Spoken:</span>
                          <p className="text-stone-800">{selectedApp.languagesSpoken}</p>
                        </div>
                      )}
                      {selectedApp.hobbiesInterests && (
                        <div className="p-3 rounded-xl bg-[#F4F7FA]/60 border border-[#DCE5ED]">
                          <span className="text-[11px] font-bold text-[#183153] block mb-0.5">Hobbies &amp; Interests:</span>
                          <p className="text-stone-800">{selectedApp.hobbiesInterests}</p>
                        </div>
                      )}
                      {selectedApp.previousExperience && (
                        <div className="p-3 rounded-xl bg-[#F4F7FA]/60 border border-[#DCE5ED]">
                          <span className="text-[11px] font-bold text-[#183153] block mb-0.5">Previous Experience:</span>
                          <p className="text-stone-800">{selectedApp.experienceDetails || "Yes"}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 5: SOCIAL MEDIA PROFILES */}
              {(selectedApp.instagramHandle || selectedApp.tiktokHandle || selectedApp.facebookUrl) && (
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-[#183153] border-b border-[#DCE5ED] pb-1.5 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-[#356FA8]" />
                    <span>3. Social Media Accounts</span>
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {selectedApp.instagramHandle && (
                      <a
                        href={
                          selectedApp.instagramHandle.startsWith("http")
                            ? selectedApp.instagramHandle
                            : `https://instagram.com/${selectedApp.instagramHandle.replace("@", "")}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F4F7FA] border border-[#DCE5ED] text-stone-800 hover:text-[#183153] hover:border-[#356FA8] transition-colors"
                      >
                        <span className="font-bold text-[11px]">Instagram:</span>
                        <span className="font-mono text-[11px]">{selectedApp.instagramHandle}</span>
                        <ExternalLink className="w-3 h-3 text-[#356FA8]" />
                      </a>
                    )}
                    {selectedApp.tiktokHandle && (
                      <a
                        href={
                          selectedApp.tiktokHandle.startsWith("http")
                            ? selectedApp.tiktokHandle
                            : `https://tiktok.com/@${selectedApp.tiktokHandle.replace("@", "")}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F4F7FA] border border-[#DCE5ED] text-stone-800 hover:text-[#183153] hover:border-[#356FA8] transition-colors"
                      >
                        <span className="font-bold text-[11px]">TikTok:</span>
                        <span className="font-mono text-[11px]">{selectedApp.tiktokHandle}</span>
                        <ExternalLink className="w-3 h-3 text-[#356FA8]" />
                      </a>
                    )}
                    {selectedApp.facebookUrl && (
                      <a
                        href={
                          selectedApp.facebookUrl.startsWith("http")
                            ? selectedApp.facebookUrl
                            : `https://${selectedApp.facebookUrl}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F4F7FA] border border-[#DCE5ED] text-stone-800 hover:text-[#183153] hover:border-[#356FA8] transition-colors"
                      >
                        <span className="font-bold text-[11px]">Facebook:</span>
                        <span className="font-mono text-[11px] truncate max-w-[150px]">{selectedApp.facebookUrl}</span>
                        <ExternalLink className="w-3 h-3 text-[#356FA8]" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION 6: MEDIA & UPLOADED FILES */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-[#183153] border-b border-[#DCE5ED] pb-1.5 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#356FA8]" />
                  <span>4. Uploaded Media &amp; Documents</span>
                </h3>
                <div className="flex flex-wrap gap-4">
                  {selectedApp.profilePhotoUrl && (
                    <div>
                      <span className="text-[11px] text-[#546E7A] block mb-1">Profile Photo:</span>
                      <div
                        onClick={() => {
                          setLightboxImageUrl(selectedApp.profilePhotoUrl!);
                          setLightboxTitle(`Portrait: ${selectedApp.fullName}`);
                        }}
                        className="cursor-pointer inline-block relative w-24 h-32 rounded-xl border border-[#DCE5ED] overflow-hidden bg-stone-100 hover:opacity-90 shadow-2xs group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selectedApp.profilePhotoUrl}
                          alt="Profile"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    </div>
                  )}

                  {selectedApp.videoUrl && (
                    <div>
                      <span className="text-[11px] text-[#546E7A] block mb-1">Audition Video:</span>
                      <a
                        href={selectedApp.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 p-3 rounded-xl bg-[#F4F7FA] border border-[#DCE5ED] text-[#183153] hover:bg-stone-200/50 transition-colors font-bold text-xs"
                      >
                        <Video className="w-4 h-4 text-[#356FA8]" />
                        <span>Watch Audition Video</span>
                        <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                      </a>
                    </div>
                  )}

                  {selectedApp.uploadedFiles &&
                    selectedApp.uploadedFiles.map((file) => (
                      <div key={file.id} className="p-3 rounded-xl border border-[#DCE5ED] bg-[#F4F7FA] text-xs space-y-1">
                        <span className="font-bold text-[#183153] block truncate max-w-[180px]">
                          {file.originalName}
                        </span>
                        <span className="text-[10px] text-[#546E7A] block">
                          {(file.fileSize / 1024).toFixed(1)} KB
                        </span>
                        <a
                          href={file.storagePath}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#356FA8] font-semibold text-[11px] hover:underline flex items-center gap-1"
                        >
                          <span>Open File</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                </div>
              </div>

              {/* SECTION 7: APPLICATION ADJUDICATION DECISION */}
              <div className="p-4 rounded-xl bg-white border border-[#DCE5ED] space-y-3 shadow-xs">
                <h3 className="font-bold text-sm text-[#183153] flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-[#356FA8]" />
                  <span>Application Adjudication Decision</span>
                </h3>

                {selectedApp.paymentStatus !== "VERIFIED" && (
                  <p className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                    Payment must be independently <strong>VERIFIED</strong> before this candidate application can be approved.
                  </p>
                )}

                {/* Private Admin Notes */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#263238]">
                    Private Administrator Notes (Internal only):
                  </Label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Interview feedback, committee remarks, eligibility verification..."
                    className="text-xs border-[#DCE5ED] bg-[#F4F7FA]/30 h-16 focus-visible:ring-[#356FA8]"
                  />
                </div>

                {/* Reason Input for Reject or Action Required */}
                {(showRejectInput || showActionInput) && (
                  <div className="space-y-1.5 pt-2 border-t border-[#DCE5ED]">
                    <Label className="text-xs font-bold text-[#183153]">
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
                      className="text-xs border-[#DCE5ED] bg-white h-16 focus-visible:ring-[#356FA8]"
                    />
                  </div>
                )}

                {/* Adjudication Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    disabled={isAdjudicating || selectedApp.paymentStatus !== "VERIFIED"}
                    onClick={() => handleApplicationAction("APPROVED")}
                    className="bg-[#183153] hover:bg-[#12243d] text-white text-xs h-8 px-4 rounded-lg shadow-none font-bold"
                  >
                    {isAdjudicating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
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

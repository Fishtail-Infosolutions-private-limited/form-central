"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Crown,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  FileDown,
  Loader2,
  ArrowRight,
  ExternalLink,
  QrCode,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  lookupRegistrationStatusAction,
  downloadApprovedPdfAction,
  submitPaymentDetailsAction,
} from "@/server/actions/mithila-queen-actions";
import { formatNepalDateTime } from "@/lib/utils/timezone";

function RegistrationStatusContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get("ref") || "";

  const [registrationId, setRegistrationId] = useState(initialRef);
  const [verificationContact, setVerificationContact] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [record, setRecord] = useState<{
    registrationId: string;
    fullName: string;
    province: string;
    district: string;
    paymentStatus: string;
    applicationStatus: string;
    paymentReference: string | null;
    paymentClarificationNotes: string | null;
    rejectionReason: string | null;
    actionRequiredDetails: string | null;
    submittedAt: Date;
    isPdfAvailable: boolean;
  } | null>(null);

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Clarification re-submission state
  const [newTxnRef, setNewTxnRef] = useState("");
  const [isReSubmitting, setIsReSubmitting] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationId.trim() || !verificationContact.trim()) {
      toast.error("Please enter both your Registration ID and registered email or phone.");
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setRecord(null);

    const res = await lookupRegistrationStatusAction({
      registrationId: registrationId.trim(),
      verificationContact: verificationContact.trim(),
    });
    setIsSearching(false);

    if (res.success && res.data) {
      setRecord(res.data as any);
      toast.success("Registration record verified!");
    } else {
      setSearchError(res.error || "Record not found or contact verification failed.");
      toast.error(res.error || "Verification failed.");
    }
  };

  const handleDownloadPdf = async () => {
    if (!record) return;
    setIsDownloadingPdf(true);

    const res = await downloadApprovedPdfAction({
      registrationId: record.registrationId,
      verificationContact: verificationContact.trim(),
    });
    setIsDownloadingPdf(false);

    if (res.success && res.pdfBase64) {
      // Trigger browser download of PDF
      const byteCharacters = atob(res.pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = res.filename || `Mithila-Queen-Confirmation-${record.registrationId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Official Confirmation PDF downloaded!");
    } else {
      toast.error(res.error || "Failed to download PDF confirmation.");
    }
  };

  const handleClarificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!record || !newTxnRef.trim()) return;

    setIsReSubmitting(true);
    const res = await submitPaymentDetailsAction({
      registrationId: record.registrationId,
      transactionReference: newTxnRef.trim(),
    });
    setIsReSubmitting(false);

    if (res.success) {
      toast.success("Updated payment details submitted! Re-querying status...");
      setRecord({
        ...record,
        paymentStatus: "UNDER_REVIEW",
        paymentReference: newTxnRef.trim(),
        paymentClarificationNotes: null,
      });
      setNewTxnRef("");
    } else {
      toast.error(res.error || "Failed to update payment details.");
    }
  };

  return (
    <div className="py-12 sm:py-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8DFD0]/60 border border-[#B69A65]/40 text-[#172B24] text-xs font-semibold">
          <Crown className="w-3.5 h-3.5 text-[#B69A65]" />
          <span>Mithila Queen • Official Status Desk</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black font-serif text-[#172B24] tracking-tight">
          Application Status
        </h1>
        <p className="text-xs sm:text-sm text-[#292821] max-w-lg mx-auto">
          Track the live review status of your Mithila Queen entry, payment verification, and download your official confirmation document.
        </p>
      </div>

      {/* Lookup Card */}
      <div className="p-8 sm:p-10 rounded-lg bg-white border border-[#E8DFD0] shadow-xs space-y-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="refId" required className="text-xs font-bold text-[#172B24]">
              Registration ID
            </Label>
            <Input
              id="refId"
              value={registrationId}
              onChange={(e) => setRegistrationId(e.target.value.toUpperCase())}
              placeholder="e.g. MQ-2026-X8Y7Z"
              required
              className="h-10 text-sm border-[#E8DFD0] bg-white font-mono uppercase"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact" required className="text-xs font-bold text-[#172B24]">
              Registered Email or Phone Number (Verification)
            </Label>
            <Input
              id="contact"
              value={verificationContact}
              onChange={(e) => setVerificationContact(e.target.value)}
              placeholder="Enter your registered email address or mobile number"
              required
              className="h-10 text-xs border-[#E8DFD0] bg-white"
            />
            <p className="text-[11px] text-zinc-500">
              For privacy protection, private status information is only displayed if your contact matches the registered applicant file.
            </p>
          </div>

          <Button
            type="submit"
            disabled={isSearching}
            className="w-full bg-[#172B24] hover:bg-[#292821] text-[#FAF5EE] text-xs font-bold h-11 rounded-md shadow-xs gap-2"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Details...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4 text-[#B69A65]" />
                <span>Check Application Status</span>
              </>
            )}
          </Button>
        </form>

        {searchError && (
          <div className="p-4 rounded-md bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="font-medium">{searchError}</span>
          </div>
        )}
      </div>

      {/* RECORD DETAILS DISPLAY */}
      {record && (
        <div className="p-8 sm:p-10 rounded-lg bg-white border border-[#E8DFD0] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8DFD0] pb-4">
            <div>
              <span className="text-[11px] uppercase font-bold text-zinc-500 tracking-wider">
                Applicant Record
              </span>
              <h2 className="text-xl font-bold font-serif text-[#172B24]">
                {record.fullName}
              </h2>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[11px] uppercase font-bold text-zinc-500 tracking-wider block">
                Registration ID
              </span>
              <span className="text-base font-extrabold font-mono text-[#172B24]">
                {record.registrationId}
              </span>
            </div>
          </div>

          {/* Dual Status Indicators: Payment Status & Application Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Payment Status Card */}
            <div className="p-5 rounded-md bg-[#FAF5EE] border border-[#E8DFD0] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Payment Status (NPR 399)
              </span>
              <div className="flex items-center gap-2">
                {record.paymentStatus === "VERIFIED" ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Verified
                  </span>
                ) : record.paymentStatus === "UNDER_REVIEW" ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Under Review
                  </span>
                ) : record.paymentStatus === "CLARIFICATION_REQUIRED" ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-300">
                    <AlertCircle className="w-3.5 h-3.5 text-orange-600" />
                    Clarification Required
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-700 border border-zinc-300">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    Pending Payment
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#292821]">
                {record.paymentStatus === "VERIFIED" && "Payment confirmed against official bank records."}
                {record.paymentStatus === "UNDER_REVIEW" && "Submitted receipt is being audited by the finance team."}
                {record.paymentStatus === "CLARIFICATION_REQUIRED" && "Please provide updated transaction reference."}
                {record.paymentStatus === "PENDING" && "Payment details not yet submitted."}
              </p>
            </div>

            {/* Application Status Card */}
            <div className="p-5 rounded-md bg-[#FAF5EE] border border-[#E8DFD0] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Application Review Status
              </span>
              <div className="flex items-center gap-2">
                {record.applicationStatus === "APPROVED" ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Approved & Confirmed
                  </span>
                ) : record.applicationStatus === "REJECTED" ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    Not Selected
                  </span>
                ) : record.applicationStatus === "ACTION_REQUIRED" ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    Action Required
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    Submitted / Under Review
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#292821]">
                {record.applicationStatus === "APPROVED" && "Official participation confirmed."}
                {record.applicationStatus === "SUBMITTED" && "Application submitted and queued for evaluation."}
                {record.applicationStatus === "UNDER_REVIEW" && "Application is being reviewed by the organizing committee."}
                {record.applicationStatus === "REJECTED" && "We thank you warmly for your participation."}
              </p>
            </div>
          </div>

          {/* CLARIFICATION REQUIRED BOX */}
          {record.paymentStatus === "CLARIFICATION_REQUIRED" && (
            <div className="p-5 rounded-md bg-orange-50 border border-orange-200 space-y-3">
              <h4 className="font-bold text-xs text-orange-950 uppercase tracking-wide flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-orange-700" />
                <span>Payment Clarification Requested by Admin</span>
              </h4>
              <p className="text-xs text-orange-900 leading-relaxed">
                {record.paymentClarificationNotes || "Please verify your transaction reference number and re-submit."}
              </p>

              <form onSubmit={handleClarificationSubmit} className="space-y-2 pt-2">
                <Label htmlFor="clarRef" className="text-xs font-bold text-orange-950">
                  Updated Bank / Wallet Transaction Reference
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="clarRef"
                    value={newTxnRef}
                    onChange={(e) => setNewTxnRef(e.target.value)}
                    placeholder="Enter correct transaction ID"
                    required
                    className="h-10 text-xs border-orange-300 bg-white font-mono"
                  />
                  <Button
                    type="submit"
                    disabled={isReSubmitting}
                    className="bg-orange-700 hover:bg-orange-800 text-white text-xs font-bold h-10 px-4 rounded-md shrink-0"
                  >
                    {isReSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Re-submit"}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* OFFICIAL PDF DOWNLOAD BUTTON */}
          {record.isPdfAvailable && (
            <div className="p-6 rounded-md bg-[#172B24] text-[#FAF5EE] border border-[#292821] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base font-serif">
                    Official Registration Confirmation PDF
                  </h3>
                  <p className="text-xs text-[#B69A65] mt-0.5">
                    Verified Document &bull; Issued by The Origin Foundation
                  </p>
                </div>
                <FileCheck2 className="w-6 h-6 text-[#B69A65]" />
              </div>

              <p className="text-xs text-[#E8DFD0]/80 leading-relaxed">
                Your entry has met all preliminary requirements and payment has been verified. Download your official A4 confirmation certificate for event attendance.
              </p>

              <Button
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
                className="w-full bg-[#B69A65] hover:bg-[#b8986d] text-[#172B24] font-bold text-xs h-11 rounded-md shadow-xs gap-2"
              >
                {isDownloadingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating Official PDF...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4" />
                    <span>Download Official Confirmation PDF (A4)</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function RegistrationStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#172B24]" />
          <p className="text-xs text-zinc-500 mt-2 font-mono">Loading application lookup...</p>
        </div>
      }
    >
      <RegistrationStatusContent />
    </Suspense>
  );
}


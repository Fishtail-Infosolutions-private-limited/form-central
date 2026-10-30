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
  Mail,
  RefreshCw,
  Edit3,
  Check,
  History,
  AlertTriangle,
  X,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  requestStatusLookupOtpAction,
  verifyStatusLookupOtpAction,
  participantUpdateDetailsAction,
  downloadApprovedPdfAction,
  submitPaymentDetailsAction,
} from "@/server/actions/mithila-queen-actions";
import { getPublicSiteSettingsAction } from "@/server/actions/site-settings-actions";

function RegistrationStatusContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get("ref") || "";

  // Lookup state
  const [emailInput, setEmailInput] = useState("");
  const [registrationIdInput, setRegistrationIdInput] = useState(initialRef);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  // Loaded record
  const [record, setRecord] = useState<any | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Clarification re-submission state
  const [newTxnRef, setNewTxnRef] = useState("");
  const [isReSubmittingPayment, setIsReSubmittingPayment] = useState(false);

  // Edit details modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSavingEdits, setIsSavingEdits] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});

  // Site settings for payment QR
  const [siteSettings, setSiteSettings] = useState<any>(null);

  useEffect(() => {
    getPublicSiteSettingsAction().then((res) => {
      if (res.success && res.setting) setSiteSettings(res.setting);
    });
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes("@")) {
      toast.error("Please enter a valid registered email address.");
      return;
    }

    setIsSendingOtp(true);
    const res = await requestStatusLookupOtpAction({
      email: emailInput.trim(),
      registrationId: registrationIdInput.trim() || undefined,
    });
    setIsSendingOtp(false);

    if (res.success && res.verificationId) {
      setVerificationId(res.verificationId);
      setOtpSent(true);
      setResendCooldown(60);
      toast.success("A 6-digit access code was sent to your email.");
    } else {
      toast.error(res.error || "Unable to send access code.");
    }
  };

  // Verify OTP & Load Record
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationId || !otpCode || otpCode.trim().length !== 6) {
      toast.error("Please enter the complete 6-digit access code.");
      return;
    }

    setIsVerifyingOtp(true);
    const res = await verifyStatusLookupOtpAction({
      verificationId,
      code: otpCode.trim(),
      email: emailInput.trim(),
    });
    setIsVerifyingOtp(false);

    if (res.success && res.data && res.sessionToken) {
      setSessionToken(res.sessionToken);
      setRecord(res.data);
      setEditFormData({
        fullName: res.data.fullName || "",
        dob: res.data.dob || "",
        phone: res.data.phone || "",
        alternatePhone: res.data.alternatePhone || "",
        province: res.data.province || "",
        district: res.data.district || "",
        municipality: res.data.municipality || "",
        cityVillage: res.data.cityVillage || "",
        currentAddress: res.data.currentAddress || "",
        guardianName: res.data.guardianName || "",
        guardianPhone: res.data.guardianPhone || "",
        guardianRelation: res.data.guardianRelation || "",
        guardianEmail: res.data.guardianEmail || "",
        personalIntro: res.data.personalIntro || "",
        hobbiesInterests: res.data.hobbiesInterests || "",
        talentsSkills: res.data.talentsSkills || "",
        languagesSpoken: res.data.languagesSpoken || "",
        culturalInterests: res.data.culturalInterests || "",
        motivationReason: res.data.motivationReason || "",
        mithilaMeaning: res.data.mithilaMeaning || "",
        qualitiesBrought: res.data.qualitiesBrought || "",
        educationLevel: res.data.educationLevel || "",
        institution: res.data.institution || "",
        instagramHandle: res.data.instagramHandle || "",
        tiktokHandle: res.data.tiktokHandle || "",
        facebookUrl: res.data.facebookUrl || "",
        profilePhotoUrl: res.data.profilePhotoUrl || "",
      });
      toast.success("Application dossier accessed securely!");
    } else {
      toast.error(res.error || "Invalid verification code.");
    }
  };

  // Download PDF
  const handleDownloadPdf = async () => {
    if (!record || !emailInput) return;
    setIsDownloadingPdf(true);

    const res = await downloadApprovedPdfAction({
      registrationId: record.registrationId,
      verificationContact: emailInput.trim(),
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

  // Submit payment reference
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!record || !newTxnRef.trim()) return;

    setIsReSubmittingPayment(true);
    const res = await submitPaymentDetailsAction({
      registrationId: record.registrationId,
      transactionReference: newTxnRef.trim(),
    });
    setIsReSubmittingPayment(false);

    if (res.success) {
      toast.success("Payment details submitted! Status updated to Under Review.");
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

  // Save participant edits
  const handleSaveEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionToken || !record) return;

    setIsSavingEdits(true);
    const res = await participantUpdateDetailsAction({
      sessionToken,
      email: emailInput.trim(),
      registrationId: record.registrationId,
      updatedFields: editFormData,
    });
    setIsSavingEdits(false);

    if (res.success) {
      toast.success(
        res.requiresReview
          ? "Details updated! Because sensitive fields were modified, your application is queued for administrative re-review."
          : "Application details updated successfully!"
      );
      setRecord({
        ...record,
        ...editFormData,
        applicationStatus: res.requiresReview && record.applicationStatus === "APPROVED" ? "UNDER_REVIEW" : record.applicationStatus,
      });
      setIsEditModalOpen(false);
    } else {
      toast.error(res.error || "Failed to save updates.");
    }
  };

  return (
    <div className="py-12 sm:py-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8DFD0]/60 border border-[#B69A65]/40 text-[#292821] text-xs font-semibold">
          <Crown className="w-3.5 h-3.5 text-[#B69A65]" />
          <span>Mithila Queen • Secure Status & Dossier Access</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black font-serif text-[#292821] tracking-tight">
          Application Status
        </h1>
        <p className="text-xs sm:text-sm text-[#3C332A] max-w-lg mx-auto leading-relaxed">
          Verify your identity via 6-digit email OTP to securely view your application review status, upload payment receipts, edit permitted details, and download your confirmation certificate.
        </p>
      </div>

      {/* STEP A: SECURE OTP LOOKUP CARD */}
      {!record && (
        <div className="p-8 sm:p-10 rounded-lg bg-white border border-[#E8DFD0] shadow-xs space-y-6">
          {!otpSent ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" required className="text-xs font-bold text-[#292821]">
                  Registered Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="e.g. anjali@example.com"
                  required
                  className="h-10 text-xs border-[#E8DFD0] bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="refId" className="text-xs font-bold text-[#292821]">
                  Registration ID (Optional)
                </Label>
                <Input
                  id="refId"
                  value={registrationIdInput}
                  onChange={(e) => setRegistrationIdInput(e.target.value.toUpperCase())}
                  placeholder="e.g. MQ-2026-X8Y7Z"
                  className="h-10 text-xs border-[#E8DFD0] bg-white font-mono uppercase"
                />
                <p className="text-[11px] text-zinc-500">
                  Enter your Registration ID if known, or leave blank to find your record by email.
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSendingOtp}
                className="w-full bg-[#292821] hover:bg-[#3C332A] text-[#FAF5EE] text-xs font-bold h-11 rounded-md shadow-xs gap-2"
              >
                {isSendingOtp ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending 6-Digit Access Code...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 text-[#B69A65]" />
                    <span>Send 6-Digit Access Code</span>
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-4 rounded-md bg-[#FAF5EE] border border-[#B69A65]/40 text-xs text-[#3C332A] space-y-1">
                <p className="font-bold text-[#292821]">Access Code Dispatched</p>
                <p>
                  We have sent a 6-digit access code to <strong className="font-mono text-[#292821]">{emailInput}</strong>. Enter it below to unlock your application dossier.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="otp" required className="text-xs font-bold text-[#292821]">
                  6-Digit Access Code
                </Label>
                <Input
                  id="otp"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  required
                  className="h-12 text-center text-xl font-mono font-bold tracking-widest border-[#B69A65] bg-white"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={isVerifyingOtp || otpCode.length !== 6}
                  className="flex-1 bg-[#B69A65] hover:bg-[#a68c5b] text-[#292821] text-xs font-bold h-11 rounded-md shadow-xs gap-2"
                >
                  {isVerifyingOtp ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Access...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Unlock Application Record</span>
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  disabled={resendCooldown > 0 || isSendingOtp}
                  onClick={handleRequestOtp}
                  className="border-[#E8DFD0] text-[#292821] text-xs font-semibold h-11 px-4 gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Resend Code"}</span>
                </Button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtpCode("");
                  }}
                  className="text-xs text-zinc-500 hover:text-[#292821] underline"
                >
                  Use a different email address
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* STEP B: VERIFIED APPLICATION DOSSIER */}
      {record && (
        <div className="p-8 sm:p-10 rounded-lg bg-white border border-[#E8DFD0] shadow-xs space-y-8">
          {/* Top Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DFD0] pb-5">
            <div>
              <span className="text-[11px] uppercase font-bold text-zinc-500 tracking-wider block">
                Verified Participant Dossier
              </span>
              <h2 className="text-2xl font-bold font-serif text-[#292821]">
                {record.fullName}
              </h2>
              <span className="text-xs text-[#3C332A]">{record.province} &bull; {record.district}</span>
            </div>
            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1">
              <span className="text-[11px] uppercase font-bold text-zinc-500 tracking-wider">
                Registration ID
              </span>
              <span className="text-lg font-extrabold font-mono text-[#292821]">
                {record.registrationId}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditModalOpen(true)}
                className="border-[#B69A65] text-[#292821] hover:bg-[#FAF5EE] text-xs font-semibold h-8 mt-1 gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#B69A65]" />
                <span>Edit Application Details</span>
              </Button>
            </div>
          </div>

          {/* Dual Status Indicators: Payment Status & Application Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Payment Status Card */}
            <div className="p-5 rounded-md bg-[#FAF5EE] border border-[#E8DFD0] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Payment Verification (NPR 399)
              </span>
              <div className="flex items-center gap-2">
                {record.paymentStatus === "VERIFIED" ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#292821] text-[#F5F0E6] border border-[#B69A65]/40">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#B69A65]" />
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
              <p className="text-[11px] text-[#3C332A] leading-relaxed">
                {record.paymentStatus === "VERIFIED" && "Payment confirmed against official bank records."}
                {record.paymentStatus === "UNDER_REVIEW" && "Submitted receipt is being audited by the finance team."}
                {record.paymentStatus === "CLARIFICATION_REQUIRED" && "Please provide updated transaction reference."}
                {record.paymentStatus === "PENDING" && "Fee payment has not yet been submitted."}
              </p>
            </div>

            {/* Application Status Card */}
            <div className="p-5 rounded-md bg-[#FAF5EE] border border-[#E8DFD0] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Application Review Status
              </span>
              <div className="flex items-center gap-2">
                {record.applicationStatus === "APPROVED" ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#292821] text-[#F5F0E6] border border-[#B69A65]/40">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#B69A65]" />
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
              <p className="text-[11px] text-[#3C332A] leading-relaxed">
                {record.applicationStatus === "APPROVED" && "Official participation confirmed."}
                {record.applicationStatus === "SUBMITTED" && "Application submitted and queued for evaluation."}
                {record.applicationStatus === "UNDER_REVIEW" && "Application is being reviewed by the organizing committee."}
                {record.applicationStatus === "REJECTED" && "We thank you warmly for your participation."}
              </p>
            </div>
          </div>

          {/* PAYMENT SUBMISSION BOX (IF PENDING OR CLARIFICATION REQUIRED) */}
          {(record.paymentStatus === "PENDING" || record.paymentStatus === "CLARIFICATION_REQUIRED") && (
            <div className="p-6 rounded-lg bg-[#FAF5EE] border border-[#B69A65]/50 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#292821]">
                    Submit Fee Payment Verification (NPR 399)
                  </h4>
                  <p className="text-xs text-[#3C332A] mt-0.5">
                    Scan the official QR code to pay NPR 399 and provide your transaction reference.
                  </p>
                </div>
                <QrCode className="w-6 h-6 text-[#B69A65]" />
              </div>

              {/* QR Image Display */}
              <div className="w-48 mx-auto bg-white border border-[#E8DFD0] rounded-md p-3 text-center">
                <img
                  src={siteSettings?.paymentQrCodeUrl || "/assets/brand/origin-foundation-qr.png"}
                  alt="Official Payment QR"
                  className="w-full h-auto object-contain"
                />
                <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                  The Origin Foundation &bull; NPR 399
                </span>
              </div>

              {record.paymentClarificationNotes && (
                <div className="p-3 bg-amber-50 rounded border border-amber-200 text-xs text-amber-900">
                  <strong>Admin Note:</strong> {record.paymentClarificationNotes}
                </div>
              )}

              <form onSubmit={handlePaymentSubmit} className="space-y-3 pt-2">
                <div className="space-y-1">
                  <Label htmlFor="txn" required className="text-xs font-bold text-[#292821]">
                    Bank / Digital Wallet Transaction Reference (UTR)
                  </Label>
                  <Input
                    id="txn"
                    value={newTxnRef}
                    onChange={(e) => setNewTxnRef(e.target.value)}
                    placeholder="e.g. 981200546872 or Fonepay Txn ID"
                    required
                    className="h-10 text-xs border-[#E8DFD0] bg-white font-mono"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isReSubmittingPayment}
                  className="w-full bg-[#B69A65] hover:bg-[#a68c5b] text-[#292821] text-xs font-bold h-10 gap-2"
                >
                  {isReSubmittingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Submit Payment Reference for Verification</span>
                </Button>
              </form>
            </div>
          )}

          {/* OFFICIAL PDF DOWNLOAD (IF VERIFIED & APPROVED) */}
          {record.isPdfAvailable && (
            <div className="p-6 rounded-lg bg-[#292821] text-[#FAF5EE] border border-[#B69A65] space-y-4">
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
                className="w-full bg-[#B69A65] hover:bg-[#a68c5b] text-[#292821] font-bold text-xs h-11 rounded-md shadow-xs gap-2"
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

          {/* APPLICATION DETAILS BREAKDOWN */}
          <div className="space-y-4 pt-4 border-t border-[#E8DFD0]">
            <h3 className="font-bold font-serif text-base text-[#292821]">
              Submitted Application Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-[#FAF5EE] rounded-md border border-[#E8DFD0]">
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">Email Address</span>
                <span className="font-mono text-[#292821] font-bold">{record.email}</span>
              </div>

              <div className="p-3 bg-[#FAF5EE] rounded-md border border-[#E8DFD0]">
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">Mobile Phone</span>
                <span className="font-mono text-[#292821] font-bold">{record.phone}</span>
              </div>

              <div className="p-3 bg-[#FAF5EE] rounded-md border border-[#E8DFD0]">
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">Date of Birth</span>
                <span className="text-[#292821] font-bold">{record.dob} {record.isMinor ? "(Minor < 18)" : ""}</span>
              </div>

              <div className="p-3 bg-[#FAF5EE] rounded-md border border-[#E8DFD0]">
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">Location</span>
                <span className="text-[#292821] font-bold">{record.municipality}, {record.district}</span>
              </div>
            </div>

            {record.personalIntro && (
              <div className="p-4 bg-[#FAF5EE] rounded-md border border-[#E8DFD0] text-xs space-y-1">
                <span className="text-zinc-500 uppercase font-bold text-[10px]">Personal Introduction</span>
                <p className="text-[#3C332A] leading-relaxed">{record.personalIntro}</p>
              </div>
            )}
          </div>

          {/* EDIT LOGS HISTORY */}
          {record.editLogs && record.editLogs.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-[#E8DFD0]">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#B69A65]" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#292821]">
                  Modification History & Audit Trail
                </h4>
              </div>
              <div className="space-y-2">
                {record.editLogs.map((log: any) => (
                  <div key={log.id} className="p-3 rounded bg-zinc-50 border border-zinc-200 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-[#292821]">
                        Updated {Object.keys(log.changedFields || {}).length} fields: {Object.keys(log.changedFields || {}).join(", ")}
                      </span>
                      <span className="text-[11px] text-zinc-500 block">
                        {new Date(log.createdAt).toLocaleDateString()} &bull; Review: {log.reviewStatus}
                      </span>
                    </div>
                    {log.requiresReview && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                        Under Admin Review
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* EDIT APPLICATION DETAILS MODAL */}
      {isEditModalOpen && record && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto border border-[#E8DFD0] shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E8DFD0] pb-4">
              <div>
                <h3 className="font-serif font-bold text-xl text-[#292821]">
                  Edit Application Details
                </h3>
                <p className="text-xs text-[#3C332A] mt-0.5">
                  Update your participant profile, location, or heritage answers.
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Audit Notice:</strong> Changes to sensitive information (Legal Name, Date of Birth, Guardian details) are recorded in the audit log and will trigger administrative re-review to ensure competition integrity.
              </p>
            </div>

            <form onSubmit={handleSaveEdits} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="edFullName" className="text-xs font-bold text-[#292821]">Full Legal Name</Label>
                  <Input
                    id="edFullName"
                    value={editFormData.fullName || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                    className="h-9 text-xs border-[#E8DFD0]"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edPhone" className="text-xs font-bold text-[#292821]">Mobile Phone</Label>
                  <Input
                    id="edPhone"
                    value={editFormData.phone || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="h-9 text-xs border-[#E8DFD0]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="edDob" className="text-xs font-bold text-[#292821]">Date of Birth</Label>
                  <Input
                    id="edDob"
                    type="date"
                    value={editFormData.dob || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, dob: e.target.value })}
                    className="h-9 text-xs border-[#E8DFD0]"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edAltPhone" className="text-xs font-bold text-[#292821]">Alternate Phone</Label>
                  <Input
                    id="edAltPhone"
                    value={editFormData.alternatePhone || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, alternatePhone: e.target.value })}
                    className="h-9 text-xs border-[#E8DFD0]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="edMun" className="text-xs font-bold text-[#292821]">Municipality / Rural Mun.</Label>
                  <Input
                    id="edMun"
                    value={editFormData.municipality || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, municipality: e.target.value })}
                    className="h-9 text-xs border-[#E8DFD0]"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edCity" className="text-xs font-bold text-[#292821]">City / Village</Label>
                  <Input
                    id="edCity"
                    value={editFormData.cityVillage || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, cityVillage: e.target.value })}
                    className="h-9 text-xs border-[#E8DFD0]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="edIntro" className="text-xs font-bold text-[#292821]">Personal Introduction</Label>
                <Textarea
                  id="edIntro"
                  value={editFormData.personalIntro || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, personalIntro: e.target.value })}
                  rows={2}
                  className="text-xs border-[#E8DFD0] resize-none"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edMotivation" className="text-xs font-bold text-[#292821]">Motivation for Mithila Queen</Label>
                <Textarea
                  id="edMotivation"
                  value={editFormData.motivationReason || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, motivationReason: e.target.value })}
                  rows={2}
                  className="text-xs border-[#E8DFD0] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="edIg" className="text-[11px] font-bold text-[#292821]">Instagram</Label>
                  <Input
                    id="edIg"
                    value={editFormData.instagramHandle || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, instagramHandle: e.target.value })}
                    placeholder="username"
                    className="h-8 text-xs border-[#E8DFD0]"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edTt" className="text-[11px] font-bold text-[#292821]">TikTok</Label>
                  <Input
                    id="edTt"
                    value={editFormData.tiktokHandle || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, tiktokHandle: e.target.value })}
                    placeholder="username"
                    className="h-8 text-xs border-[#E8DFD0]"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edFb" className="text-[11px] font-bold text-[#292821]">Facebook Link</Label>
                  <Input
                    id="edFb"
                    value={editFormData.facebookUrl || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, facebookUrl: e.target.value })}
                    placeholder="url"
                    className="h-8 text-xs border-[#E8DFD0]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E8DFD0]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-xs border-[#E8DFD0]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSavingEdits}
                  className="bg-[#B69A65] hover:bg-[#a68c5b] text-[#292821] text-xs font-bold gap-2"
                >
                  {isSavingEdits ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save Updated Information</span>
                </Button>
              </div>
            </form>
          </div>
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
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#292821]" />
          <p className="text-xs text-zinc-500 mt-2 font-mono">Loading application lookup...</p>
        </div>
      }
    >
      <RegistrationStatusContent />
    </Suspense>
  );
}

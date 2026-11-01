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
  Lock,
  Phone,
  Video,
  User,
  Heart,
  Calendar,
  MapPin,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  requestStatusLookupOtpAction,
  verifyStatusLookupOtpAction,
  lookupStatusByRegistrationIdAction,
  requestOtpForRegistrationIdAction,
  participantUpdateDetailsAction,
  downloadApprovedPdfAction,
  submitPaymentDetailsAction,
} from "@/server/actions/mithila-queen-actions";
import { getPublicSiteSettingsAction } from "@/server/actions/site-settings-actions";

function RegistrationStatusContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get("ref") || "";

  // Lookup mode: "email" or "registrationId"
  const [searchMode, setSearchMode] = useState<"email" | "registrationId">(
    initialRef ? "registrationId" : "email"
  );

  // Inputs
  const [emailInput, setEmailInput] = useState("");
  const [registrationIdInput, setRegistrationIdInput] = useState(initialRef);
  const [isSearching, setIsSearching] = useState(false);

  // Email OTP state (for search by email)
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Authenticated state
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");

  // Loaded candidate record
  const [record, setRecord] = useState<any | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Clarification / payment submission state
  const [newTxnRef, setNewTxnRef] = useState("");
  const [isReSubmittingPayment, setIsReSubmittingPayment] = useState(false);

  // Edit details modal & unlock modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isSavingEdits, setIsSavingEdits] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});

  // Unlock OTP state (when user came via ID and wants to edit)
  const [unlockOtpCode, setUnlockOtpCode] = useState("");
  const [unlockVerificationId, setUnlockVerificationId] = useState<string | null>(null);
  const [isSendingUnlockOtp, setIsSendingUnlockOtp] = useState(false);
  const [unlockOtpSent, setUnlockOtpSent] = useState(false);
  const [isVerifyingUnlockOtp, setIsVerifyingUnlockOtp] = useState(false);
  const [unlockCooldown, setUnlockCooldown] = useState(0);

  // Site settings for payment QR
  const [siteSettings, setSiteSettings] = useState<any>(null);

  useEffect(() => {
    getPublicSiteSettingsAction().then((res) => {
      if (res.success && res.setting) setSiteSettings(res.setting);
    });
  }, []);

  // Cooldown timers
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  useEffect(() => {
    if (unlockCooldown <= 0) return;
    const interval = setInterval(() => {
      setUnlockCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [unlockCooldown]);

  const populateEditFormData = (data: any) => {
    setEditFormData({
      fullName: data.fullName || "",
      dob: data.dob || "",
      phone: data.phone || "",
      alternatePhone: data.alternatePhone || "",
      province: data.province || "",
      district: data.district || "",
      municipality: data.municipality || "",
      cityVillage: data.cityVillage || "",
      currentAddress: data.currentAddress || "",
      guardianName: data.guardianName || "",
      guardianPhone: data.guardianPhone || "",
      guardianRelation: data.guardianRelation || "",
      guardianEmail: data.guardianEmail || "",
      personalIntro: data.personalIntro || "",
      hobbiesInterests: data.hobbiesInterests || "",
      talentsSkills: data.talentsSkills || "",
      languagesSpoken: data.languagesSpoken || "",
      culturalInterests: data.culturalInterests || "",
      motivationReason: data.motivationReason || "",
      mithilaMeaning: data.mithilaMeaning || "",
      qualitiesBrought: data.qualitiesBrought || "",
      educationLevel: data.educationLevel || "",
      institution: data.institution || "",
      instagramHandle: data.instagramHandle || "",
      tiktokHandle: data.tiktokHandle || "",
      facebookUrl: data.facebookUrl || "",
      profilePhotoUrl: data.profilePhotoUrl || "",
      videoUrl: data.videoUrl || "",
      documentUrl: data.documentUrl || "",
    });
  };

  // 1. FLOW A: Search by Email -> Request OTP
  const handleRequestEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      toast.error("Please enter a valid registered email address.");
      return;
    }

    setIsSendingOtp(true);
    const res = await requestStatusLookupOtpAction({
      email: cleanEmail,
    });
    setIsSendingOtp(false);

    if (res.success && res.verificationId) {
      setVerificationId(res.verificationId);
      setOtpSent(true);
      setResendCooldown(60);
      toast.success("A 6-digit access code was sent to your email.");
    } else {
      toast.error(res.error || "Unable to send access code. Please check your email.");
    }
  };

  // 2. FLOW A: Verify OTP & Load Record (Full Access - No OTP needed for edit)
  const handleVerifyEmailOtp = async (e: React.FormEvent) => {
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
      setIsEmailVerified(true);
      setVerifiedEmail(res.data.email || emailInput.trim());
      setMaskedEmail(res.data.email || emailInput.trim());
      setRecord(res.data);
      populateEditFormData(res.data);
      toast.success("Application dossier accessed and verified successfully!");
    } else {
      toast.error(res.error || "Invalid verification code.");
    }
  };

  // 3. FLOW B: Search directly by Registration ID (View without initial OTP)
  const handleLookupByRegistrationId = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = registrationIdInput.trim().toUpperCase();
    if (!cleanId) {
      toast.error("Please enter your Registration ID (e.g. MQ-2026-XXXXX).");
      return;
    }

    setIsSearching(true);
    const res = await lookupStatusByRegistrationIdAction({
      registrationId: cleanId,
    });
    setIsSearching(false);

    if (res.success && res.data) {
      setRecord(res.data);
      setIsEmailVerified(false);
      setSessionToken(null);
      setMaskedEmail(res.maskedEmail || "");
      setVerifiedEmail(res.registeredEmail || "");
      populateEditFormData(res.data);
      toast.success("Application record retrieved!");
    } else {
      toast.error(res.error || "Application record not found.");
    }
  };

  // 4. Trigger Edit Details (Checks if OTP verification is required)
  const handleOpenEditModal = () => {
    if (isEmailVerified && sessionToken) {
      // User already verified their email with OTP when checking! No OTP required again!
      setIsEditModalOpen(true);
    } else {
      // User checked via Registration ID: ask for email OTP verification first
      setUnlockOtpSent(false);
      setUnlockOtpCode("");
      setIsVerifyModalOpen(true);
    }
  };

  // 5. Send OTP to unlock editing for Registration ID session
  const handleSendUnlockOtp = async () => {
    if (!record?.registrationId) return;
    setIsSendingUnlockOtp(true);

    const res = await requestOtpForRegistrationIdAction({
      registrationId: record.registrationId,
    });
    setIsSendingUnlockOtp(false);

    if (res.success && res.verificationId) {
      setUnlockVerificationId(res.verificationId);
      setUnlockOtpSent(true);
      setUnlockCooldown(60);
      if (res.maskedEmail) setMaskedEmail(res.maskedEmail);
      if (res.registeredEmail) setVerifiedEmail(res.registeredEmail);
      toast.success(`Verification code dispatched to ${res.maskedEmail || "your registered email"}.`);
    } else {
      toast.error(res.error || "Failed to send verification code.");
    }
  };

  // 6. Verify Unlock OTP & Open Edit Form
  const handleVerifyUnlockOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockVerificationId || !unlockOtpCode || unlockOtpCode.trim().length !== 6) {
      toast.error("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsVerifyingUnlockOtp(true);
    const res = await verifyStatusLookupOtpAction({
      verificationId: unlockVerificationId,
      code: unlockOtpCode.trim(),
      email: verifiedEmail,
      registrationId: record.registrationId,
    });
    setIsVerifyingUnlockOtp(false);

    if (res.success && res.data && res.sessionToken) {
      // Email is now verified!
      setIsEmailVerified(true);
      setSessionToken(res.sessionToken);
      setRecord(res.data);
      populateEditFormData(res.data);
      setIsVerifyModalOpen(false);
      setIsEditModalOpen(true);
      toast.success("Email verified! You can now update your application details.");
    } else {
      toast.error(res.error || "Invalid verification code.");
    }
  };

  // 7. Save Edited Details
  const handleSaveEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionToken || !record) return;

    setIsSavingEdits(true);
    const res = await participantUpdateDetailsAction({
      sessionToken,
      email: verifiedEmail || record.email,
      registrationId: record.registrationId,
      updatedFields: editFormData,
    });
    setIsSavingEdits(false);

    if (res.success) {
      toast.success(
        res.requiresReview
          ? "Details updated! Because critical fields were modified, your application is queued for administrative review."
          : "Application details updated successfully!"
      );
      setRecord({
        ...record,
        ...editFormData,
        applicationStatus:
          res.requiresReview && record.applicationStatus === "APPROVED"
            ? "UNDER_REVIEW"
            : record.applicationStatus,
      });
      setIsEditModalOpen(false);
    } else {
      toast.error(res.error || "Failed to save updates.");
    }
  };

  // 8. Submit Payment Reference (if pending/clarification)
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
      toast.success("Payment reference submitted! Status updated to Under Review.");
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

  // 9. Download PDF Confirmation
  const handleDownloadPdf = async () => {
    if (!record) return;
    setIsDownloadingPdf(true);

    const contactParam = verifiedEmail || emailInput || record.registrationId;
    const res = await downloadApprovedPdfAction({
      registrationId: record.registrationId,
      verificationContact: contactParam,
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

  // Reset to search again
  const handleResetSearch = () => {
    setRecord(null);
    setOtpSent(false);
    setOtpCode("");
    setVerificationId(null);
    setSessionToken(null);
    setIsEmailVerified(false);
  };

  return (
    <div className="py-12 sm:py-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7F1E5] border border-[#B89150]/30 text-[#7F1D2D] text-xs font-semibold">
          <Crown className="w-3.5 h-3.5 text-[#D97706]" />
          <span>The Origin Foundation &bull; Mithila Queen 2026</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#292524] tracking-tight">
          Application Status
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto leading-relaxed">
          Look up your registration by <strong>Email Address</strong> or <strong>Registration ID</strong> to view application evaluation, payment verification, and update candidate details.
        </p>
      </div>

      {/* STEP 1: LOOKUP CARD (When no record is loaded) */}
      {!record && (
        <div className="p-6 sm:p-8 rounded-xl bg-white border border-stone-200/90 shadow-xs space-y-6">
          {/* Method Selector Tabs: Find by Email vs Find by Registration ID */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setSearchMode("email");
                setOtpSent(false);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-xs font-semibold transition-all ${
                searchMode === "email"
                  ? "bg-[#7F1D2D] text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Find by Email</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSearchMode("registrationId");
                setOtpSent(false);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-xs font-semibold transition-all ${
                searchMode === "registrationId"
                  ? "bg-[#7F1D2D] text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Hash className="w-3.5 h-3.5" />
              <span>Find by Registration ID</span>
            </button>
          </div>

          {/* TAB A: FIND BY EMAIL (Sends OTP for full authentication) */}
          {searchMode === "email" && (
            <div>
              {!otpSent ? (
                <form onSubmit={handleRequestEmailOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-semibold text-stone-700">
                      Registered Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="e.g. anjali@example.com"
                      required
                      className="h-10 text-xs border-stone-200 bg-[#FFFDF7] focus-visible:ring-[#7F1D2D]"
                    />
                    <p className="text-[11px] text-stone-500">
                      A 6-digit one-time access code will be sent to this email to unlock your full application.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSendingOtp}
                    className="w-full bg-[#7F1D2D] hover:bg-[#5B131E] text-white text-xs font-semibold h-11 rounded-lg shadow-xs gap-2"
                  >
                    {isSendingOtp ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Access Code...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        <span>Send 6-Digit Access Code</span>
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyEmailOtp} className="space-y-4">
                  <div className="p-4 rounded-lg bg-[#FFFDF7] border border-[#B89150]/30 text-xs text-stone-700 space-y-1">
                    <p className="font-semibold text-stone-900">Access Code Sent</p>
                    <p>
                      We have sent a 6-digit access code to <strong className="font-mono text-[#7F1D2D]">{emailInput}</strong>. Enter it below to access your application dossier.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="otp" className="text-xs font-semibold text-stone-700">
                      6-Digit Access Code
                    </Label>
                    <Input
                      id="otp"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="123456"
                      maxLength={6}
                      required
                      autoFocus
                      className="h-12 text-center text-xl font-mono font-bold tracking-widest border-[#B89150] bg-white"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                    <Button
                      type="submit"
                      disabled={isVerifyingOtp || otpCode.length !== 6}
                      className="flex-1 bg-[#7F1D2D] hover:bg-[#5B131E] text-white text-xs font-semibold h-11 rounded-lg shadow-xs gap-2"
                    >
                      {isVerifyingOtp ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Verifying Access...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Unlock Application Dossier</span>
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      disabled={resendCooldown > 0 || isSendingOtp}
                      onClick={handleRequestEmailOtp}
                      className="border-stone-200 text-stone-700 text-xs font-medium h-11 px-4 gap-1.5 hover:bg-[#F7F1E5]"
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
                      className="text-xs text-stone-500 hover:text-stone-900 underline"
                    >
                      Use a different email address
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB B: FIND BY REGISTRATION ID (Direct lookup without OTP upfront) */}
          {searchMode === "registrationId" && (
            <form onSubmit={handleLookupByRegistrationId} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="regId" className="text-xs font-semibold text-stone-700">
                  Registration ID / Application Number
                </Label>
                <Input
                  id="regId"
                  value={registrationIdInput}
                  onChange={(e) => setRegistrationIdInput(e.target.value.toUpperCase())}
                  placeholder="e.g. MQ-2026-X8Y7Z"
                  required
                  className="h-10 text-xs border-stone-200 bg-[#FFFDF7] font-mono uppercase focus-visible:ring-[#7F1D2D]"
                />
                <p className="text-[11px] text-stone-500">
                  Enter the unique Registration ID from your submission confirmation screen or email.
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSearching}
                className="w-full bg-[#7F1D2D] hover:bg-[#5B131E] text-white text-xs font-semibold h-11 rounded-lg shadow-xs gap-2"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Searching Application...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Check Application Status</span>
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      )}

      {/* STEP 2: LOADED APPLICATION RECORD */}
      {record && (
        <div className="p-6 sm:p-8 rounded-xl bg-white border border-stone-200/90 shadow-xs space-y-7">
          {/* Top Dossier Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#B89150]">
                  Candidate Dossier
                </span>
                {isEmailVerified ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Email Verified</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    <Lock className="w-3 h-3 text-amber-600" />
                    <span>ID Lookup View</span>
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-serif font-bold text-[#292524]">
                {record.fullName}
              </h2>
              <span className="text-xs text-stone-500">
                {record.province} &bull; {record.district} &bull; {record.municipality}
              </span>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1">
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                Registration ID
              </span>
              <span className="text-lg font-bold font-mono text-[#7F1D2D]">
                {record.registrationId}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <Button
                  size="sm"
                  onClick={handleOpenEditModal}
                  className="bg-[#7F1D2D] hover:bg-[#5B131E] text-white text-xs font-semibold h-8 px-3 gap-1.5 shadow-2xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Verification Notice Banner if entered via Registration ID without OTP */}
          {!isEmailVerified && (
            <div className="p-3.5 rounded-lg bg-[#FFFDF7] border border-[#B89150]/30 text-xs text-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#B89150] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900 block font-semibold">
                    Want to update your application details?
                  </strong>
                  <span className="text-[11px] text-stone-600">
                    You are currently viewing by Registration ID. To edit answers, you must verify your registered email ({maskedEmail || "on file"}).
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleOpenEditModal}
                className="border-[#B89150] text-[#7F1D2D] hover:bg-[#F7F1E5] text-xs font-semibold h-8 shrink-0 self-start sm:self-auto"
              >
                <span>Verify Email to Edit</span>
              </Button>
            </div>
          )}

          {/* Dual Status Indicators: Payment Status & Application Review Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Payment Status Card */}
            <div className="p-5 rounded-xl bg-[#FFFDF7] border border-stone-200/80 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Payment Verification (NPR {record?.registrationFee || siteSettings?.registrationFee || 399})
              </span>
              <div className="flex items-center gap-2">
                {record.paymentStatus === "VERIFIED" ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Payment Verified
                  </span>
                ) : record.paymentStatus === "UNDER_REVIEW" ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Receipt Under Review
                  </span>
                ) : record.paymentStatus === "CLARIFICATION_REQUIRED" ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    Clarification Required
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-300">
                    <Clock className="w-3.5 h-3.5 text-stone-500" />
                    Pending Payment
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                {record.paymentStatus === "VERIFIED" && "Payment confirmed against official bank/eSewa records."}
                {record.paymentStatus === "UNDER_REVIEW" && "Submitted receipt is being verified by the organizing team."}
                {record.paymentStatus === "CLARIFICATION_REQUIRED" && "Please provide updated transaction reference."}
                {record.paymentStatus === "PENDING" && "Fee payment has not yet been submitted."}
              </p>
            </div>

            {/* Application Review Status Card */}
            <div className="p-5 rounded-xl bg-[#FFFDF7] border border-stone-200/80 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Application Review Status
              </span>
              <div className="flex items-center gap-2">
                {record.applicationStatus === "APPROVED" ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#7F1D2D] text-white">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#F7F1E5]" />
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
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Submitted / Under Evaluation
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                {record.applicationStatus === "APPROVED" && "Official participation confirmed for Mithila Queen 2026."}
                {record.applicationStatus === "SUBMITTED" && "Application received and queued for committee review."}
                {record.applicationStatus === "UNDER_REVIEW" && "Application is being reviewed by the organizing committee."}
                {record.applicationStatus === "REJECTED" && "We thank you warmly for your interest and participation."}
              </p>
            </div>
          </div>

          {/* PAYMENT RESUBMISSION BOX (If Pending or Clarification Required) */}
          {(record.paymentStatus === "PENDING" || record.paymentStatus === "CLARIFICATION_REQUIRED") && (
            <div className="p-6 rounded-xl bg-[#FFFDF7] border border-[#B89150]/40 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#292524]">
                    Submit Fee Payment Verification (NPR {record?.registrationFee || siteSettings?.registrationFee || 399})
                  </h4>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Scan the official QR code to pay NPR {record?.registrationFee || siteSettings?.registrationFee || 399} and submit your transaction code.
                  </p>
                </div>
                <QrCode className="w-5 h-5 text-[#B89150]" />
              </div>

              {/* QR Image Display */}
              <div className="w-44 mx-auto bg-white border border-stone-200 rounded-lg p-2.5 text-center">
                <img
                  src={siteSettings?.paymentQrCodeUrl || "/assets/brand/origin-foundation-qr.png"}
                  alt="Official Payment QR"
                  className="w-full h-auto object-contain"
                />
                <span className="text-[10px] text-stone-500 font-mono mt-1 block">
                  The Origin Foundation &bull; NPR {record?.registrationFee || siteSettings?.registrationFee || 399}
                </span>
              </div>

              {record.paymentClarificationNotes && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
                  <strong>Organizers Note:</strong> {record.paymentClarificationNotes}
                </div>
              )}

              <form onSubmit={handlePaymentSubmit} className="space-y-3 pt-2">
                <div className="space-y-1">
                  <Label htmlFor="txn" className="text-xs font-semibold text-stone-700">
                    Bank / Digital Wallet Transaction Reference (UTR / Code)
                  </Label>
                  <Input
                    id="txn"
                    value={newTxnRef}
                    onChange={(e) => setNewTxnRef(e.target.value)}
                    placeholder="e.g. 981200546872 or eSewa Ref ID"
                    required
                    className="h-10 text-xs border-stone-200 bg-white font-mono"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isReSubmittingPayment}
                  className="w-full bg-[#7F1D2D] hover:bg-[#5B131E] text-white text-xs font-semibold h-10 gap-2"
                >
                  {isReSubmittingPayment ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>Submit Payment Reference for Verification</span>
                </Button>
              </form>
            </div>
          )}

          {/* OFFICIAL PDF DOWNLOAD (If Verified & Approved) */}
          {record.isPdfAvailable && (
            <div className="p-6 rounded-xl bg-[#7F1D2D] text-white space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base text-white">
                    Official Registration Confirmation PDF
                  </h3>
                  <p className="text-xs text-[#F7F1E5]/80 mt-0.5">
                    Verified Document &bull; Issued by The Origin Foundation
                  </p>
                </div>
                <FileCheck2 className="w-6 h-6 text-[#F7F1E5]" />
              </div>

              <p className="text-xs text-white/90 leading-relaxed">
                Your entry has met all preliminary requirements and payment has been verified. Download your official A4 confirmation certificate for event attendance.
              </p>

              <Button
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
                className="w-full bg-[#FFFDF7] hover:bg-[#F7F1E5] text-[#7F1D2D] font-bold text-xs h-11 rounded-lg shadow-xs gap-2"
              >
                {isDownloadingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating Official PDF...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4 text-[#7F1D2D]" />
                    <span>Download Official Confirmation Certificate (A4 PDF)</span>
                  </>
                )}
              </Button>
            </div>
          )}

          {/* APPLICATION DETAILS BREAKDOWN */}
          <div className="space-y-4 pt-4 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-[#292524]">
                Submitted Candidate Profile
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={handleOpenEditModal}
                className="border-stone-200 text-stone-700 hover:bg-[#F7F1E5] hover:text-[#7F1D2D] text-xs h-8 gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Update Profile</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-[#FFFDF7] rounded-lg border border-stone-200/80">
                <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">
                  Contact Email
                </span>
                <span className="font-mono text-stone-800 font-semibold">{record.email}</span>
              </div>

              <div className="p-3.5 bg-[#FFFDF7] rounded-lg border border-stone-200/80">
                <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">
                  Mobile Phone
                </span>
                <span className="font-mono text-stone-800 font-semibold">{record.phone}</span>
              </div>

              <div className="p-3.5 bg-[#FFFDF7] rounded-lg border border-stone-200/80">
                <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">
                  Date of Birth
                </span>
                <span className="text-stone-800 font-semibold">
                  {record.dob} {record.isMinor ? "(Minor < 18)" : ""}
                </span>
              </div>

              <div className="p-3.5 bg-[#FFFDF7] rounded-lg border border-stone-200/80">
                <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">
                  Origin & Location
                </span>
                <span className="text-stone-800 font-semibold">
                  {record.municipality}, {record.district}
                </span>
              </div>
            </div>

            {/* Cultural & Talents info if present */}
            {record.talentsSkills && (
              <div className="p-4 bg-[#FFFDF7] rounded-lg border border-stone-200/80 text-xs space-y-1">
                <span className="text-stone-400 uppercase font-bold text-[10px] tracking-wider">
                  Talent Specialization & Cultural Skills
                </span>
                <p className="text-stone-700 leading-relaxed font-medium">{record.talentsSkills}</p>
              </div>
            )}

            {record.personalIntro && (
              <div className="p-4 bg-[#FFFDF7] rounded-lg border border-stone-200/80 text-xs space-y-1">
                <span className="text-stone-400 uppercase font-bold text-[10px] tracking-wider">
                  Personal Introduction
                </span>
                <p className="text-stone-700 leading-relaxed">{record.personalIntro}</p>
              </div>
            )}

            {/* Audition Video link if present */}
            {record.videoUrl && (
              <div className="p-4 bg-[#FFFDF7] rounded-lg border border-stone-200/80 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Video className="w-4 h-4 text-[#D97706] shrink-0" />
                  <div className="min-w-0">
                    <span className="font-semibold text-stone-800 block truncate">Audition Video</span>
                    <span className="text-[11px] text-stone-500 truncate block font-mono">
                      {record.videoUrl}
                    </span>
                  </div>
                </div>
                <a
                  href={record.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7F1D2D] text-white hover:bg-[#5B131E] font-medium text-xs shrink-0"
                >
                  <span>Watch Video</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* MODIFICATION HISTORY LOGS */}
          {record.editLogs && record.editLogs.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-stone-100">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#B89150]" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-stone-800">
                  Modification History & Audit Log
                </h4>
              </div>
              <div className="space-y-2">
                {record.editLogs.map((log: any) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg bg-stone-50 border border-stone-200/80 text-xs flex justify-between items-center"
                  >
                    <div>
                      <span className="font-semibold text-stone-800">
                        Updated fields: {Object.keys(log.changedFields || {}).join(", ")}
                      </span>
                      <span className="text-[11px] text-stone-500 block">
                        {new Date(log.createdAt).toLocaleDateString()} &bull; Review: {log.reviewStatus}
                      </span>
                    </div>
                    {log.requiresReview && (
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        Under Admin Review
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reset Search / Check Another */}
          <div className="pt-4 border-t border-stone-100 text-center">
            <button
              type="button"
              onClick={handleResetSearch}
              className="text-xs text-stone-500 hover:text-[#7F1D2D] font-medium underline"
            >
              Check another registration record
            </button>
          </div>
        </div>
      )}

      {/* UNLOCK MODAL: Prompt email verification if user came via Registration ID */}
      {isVerifyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-md w-full p-6 sm:p-8 space-y-5 border border-stone-200 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#7F1D2D]" />
                <h3 className="font-serif font-bold text-base text-[#292524]">
                  Verify Email to Edit Details
                </h3>
              </div>
              <button
                onClick={() => setIsVerifyModalOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              To protect candidate privacy and ensure only you can modify your application, please verify your registered email address (<strong>{maskedEmail || "on file"}</strong>).
            </p>

            {!unlockOtpSent ? (
              <div className="space-y-4 pt-2">
                <div className="p-3.5 rounded-lg bg-[#FFFDF7] border border-[#B89150]/30 text-xs text-stone-700">
                  <div className="font-semibold text-stone-800">Dispatch Verification Code</div>
                  <div className="text-[11px] text-stone-600 mt-0.5">
                    Click the button below to receive a 6-digit access code at your registered email address.
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsVerifyModalOpen(false)}
                    className="text-xs border-stone-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    disabled={isSendingUnlockOtp}
                    onClick={handleSendUnlockOtp}
                    className="bg-[#7F1D2D] hover:bg-[#5B131E] text-white text-xs font-semibold gap-1.5"
                  >
                    {isSendingUnlockOtp ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                    <span>Send Verification Code</span>
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleVerifyUnlockOtp} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="unlockOtp" className="text-xs font-semibold text-stone-700">
                    6-Digit Verification Code
                  </Label>
                  <Input
                    id="unlockOtp"
                    value={unlockOtpCode}
                    onChange={(e) => setUnlockOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    required
                    autoFocus
                    className="h-11 text-center text-lg font-mono font-bold tracking-widest border-[#B89150] bg-white"
                  />
                  <p className="text-[11px] text-stone-500">
                    Enter the code sent to {maskedEmail || "your email"}.
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={unlockCooldown > 0 || isSendingUnlockOtp}
                    onClick={handleSendUnlockOtp}
                    className="text-xs text-stone-600 hover:text-stone-900"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1" />
                    <span>{unlockCooldown > 0 ? `Resend (${unlockCooldown}s)` : "Resend Code"}</span>
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsVerifyModalOpen(false)}
                      className="text-xs border-stone-200"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isVerifyingUnlockOtp || unlockOtpCode.length !== 6}
                      className="bg-[#7F1D2D] hover:bg-[#5B131E] text-white text-xs font-semibold"
                    >
                      {isVerifyingUnlockOtp ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                      ) : (
                        <Check className="w-3.5 h-3.5 mr-1" />
                      )}
                      <span>Verify & Open Editor</span>
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* EDIT APPLICATION DETAILS MODAL */}
      {isEditModalOpen && record && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto border border-stone-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="font-serif font-bold text-xl text-[#292524]">
                  Edit Application Details
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Update candidate information, cultural background, contact, or audition media.
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Integrity Notice:</strong> Changes to sensitive details (Full Legal Name, Date of Birth, Guardian contact) will queue your application for administrative re-evaluation.
              </p>
            </div>

            <form onSubmit={handleSaveEdits} className="space-y-4">
              {/* 1. Personal & Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="edFullName" className="text-xs font-semibold text-stone-700">
                    Full Legal Name
                  </Label>
                  <Input
                    id="edFullName"
                    value={editFormData.fullName || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                    className="h-9 text-xs border-stone-200 bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edPhone" className="text-xs font-semibold text-stone-700">
                    Mobile Phone
                  </Label>
                  <Input
                    id="edPhone"
                    value={editFormData.phone || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="h-9 text-xs border-stone-200 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="edDob" className="text-xs font-semibold text-stone-700">
                    Date of Birth
                  </Label>
                  <Input
                    id="edDob"
                    type="date"
                    value={editFormData.dob || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, dob: e.target.value })}
                    className="h-9 text-xs border-stone-200 bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edAltPhone" className="text-xs font-semibold text-stone-700">
                    Alternate Phone (Optional)
                  </Label>
                  <Input
                    id="edAltPhone"
                    value={editFormData.alternatePhone || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, alternatePhone: e.target.value })}
                    className="h-9 text-xs border-stone-200 bg-white"
                  />
                </div>
              </div>

              {/* 2. Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="edMun" className="text-xs font-semibold text-stone-700">
                    Municipality / Rural Municipality
                  </Label>
                  <Input
                    id="edMun"
                    value={editFormData.municipality || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, municipality: e.target.value })}
                    className="h-9 text-xs border-stone-200 bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edCity" className="text-xs font-semibold text-stone-700">
                    City / Ward / Village
                  </Label>
                  <Input
                    id="edCity"
                    value={editFormData.cityVillage || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, cityVillage: e.target.value })}
                    className="h-9 text-xs border-stone-200 bg-white"
                  />
                </div>
              </div>

              {/* 3. Guardian Details */}
              <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200/80 space-y-3">
                <span className="text-[11px] uppercase font-bold text-stone-600 block">
                  Parent / Legal Guardian Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="edGName" className="text-[11px] font-semibold text-stone-700">
                      Guardian Name
                    </Label>
                    <Input
                      id="edGName"
                      value={editFormData.guardianName || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, guardianName: e.target.value })}
                      className="h-8 text-xs border-stone-200 bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="edGPhone" className="text-[11px] font-semibold text-stone-700">
                      Guardian Phone
                    </Label>
                    <Input
                      id="edGPhone"
                      value={editFormData.guardianPhone || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, guardianPhone: e.target.value })}
                      className="h-8 text-xs border-stone-200 bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="edGRel" className="text-[11px] font-semibold text-stone-700">
                      Relationship
                    </Label>
                    <Input
                      id="edGRel"
                      value={editFormData.guardianRelation || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, guardianRelation: e.target.value })}
                      className="h-8 text-xs border-stone-200 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Cultural & Talents */}
              <div className="space-y-1">
                <Label htmlFor="edTalents" className="text-xs font-semibold text-stone-700">
                  Talent Specialization & Creative Skills
                </Label>
                <Input
                  id="edTalents"
                  value={editFormData.talentsSkills || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, talentsSkills: e.target.value })}
                  placeholder="e.g. Mithila Painting, Folk Dance, Singing, Public Speaking"
                  className="h-9 text-xs border-stone-200 bg-white"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edIntro" className="text-xs font-semibold text-stone-700">
                  Personal Introduction
                </Label>
                <Textarea
                  id="edIntro"
                  value={editFormData.personalIntro || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, personalIntro: e.target.value })}
                  rows={2}
                  className="text-xs border-stone-200 bg-white resize-none"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edMotivation" className="text-xs font-semibold text-stone-700">
                  Motivation for Mithila Queen
                </Label>
                <Textarea
                  id="edMotivation"
                  value={editFormData.motivationReason || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, motivationReason: e.target.value })}
                  rows={2}
                  className="text-xs border-stone-200 bg-white resize-none"
                />
              </div>

              {/* 5. Audition Video URL */}
              <div className="space-y-1">
                <Label htmlFor="edVideo" className="text-xs font-semibold text-stone-700">
                  Audition Video URL / Google Drive Link
                </Label>
                <Input
                  id="edVideo"
                  value={editFormData.videoUrl || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, videoUrl: e.target.value })}
                  placeholder="https://drive.google.com/... or youtube.com/..."
                  className="h-9 text-xs border-stone-200 bg-white font-mono"
                />
              </div>

              {/* 6. Social Handles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="edIg" className="text-[11px] font-semibold text-stone-700">
                    Instagram Handle
                  </Label>
                  <Input
                    id="edIg"
                    value={editFormData.instagramHandle || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, instagramHandle: e.target.value })}
                    placeholder="@username"
                    className="h-8 text-xs border-stone-200 bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edTt" className="text-[11px] font-semibold text-stone-700">
                    TikTok Handle
                  </Label>
                  <Input
                    id="edTt"
                    value={editFormData.tiktokHandle || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, tiktokHandle: e.target.value })}
                    placeholder="@username"
                    className="h-8 text-xs border-stone-200 bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edFb" className="text-[11px] font-semibold text-stone-700">
                    Facebook Profile Link
                  </Label>
                  <Input
                    id="edFb"
                    value={editFormData.facebookUrl || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, facebookUrl: e.target.value })}
                    placeholder="https://facebook.com/..."
                    className="h-8 text-xs border-stone-200 bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-xs border-stone-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSavingEdits}
                  className="bg-[#7F1D2D] hover:bg-[#5B131E] text-white text-xs font-semibold gap-2"
                >
                  {isSavingEdits ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
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
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#7F1D2D]" />
          <p className="text-xs text-stone-500 mt-2 font-mono">Loading application lookup...</p>
        </div>
      }
    >
      <RegistrationStatusContent />
    </Suspense>
  );
}

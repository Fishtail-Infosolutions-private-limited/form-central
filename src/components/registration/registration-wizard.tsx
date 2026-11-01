"use client";

import React, { useState, useEffect } from "react";
import {
  FormSchemaDefinition,
  FormFieldDefinition,
  FieldType,
} from "@/types/form";
import { sendOtpAction, verifyOtpAction } from "@/server/actions/otp-actions";
import { submitRegistrationAction } from "@/server/actions/registration-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RichTextView } from "@/components/ui/rich-text-view";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Trophy,
  ShieldCheck,
  Mail,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Upload,
  Copy,
  Check,
  Video,
  Image as ImageIcon,
  CheckSquare,
  FileCheck,
  FileUp,
  RefreshCw,
  Calendar,
  Clock,
  Printer,
  ExternalLink,
  QrCode,
  Building2,
  Wallet,
  X,
  Eye,
  Info,
  Lock,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { getPublicSiteSettingsAction } from "@/server/actions/site-settings-actions";

const PROVINCE_DISTRICTS: Record<string, string[]> = {
  "Madhesh Province": ["Dhanusha", "Mahottari", "Sarlahi", "Siraha", "Saptari", "Rautahat", "Bara", "Parsa"],
  "Bagmati Province": ["Kathmandu", "Lalitpur", "Bhaktapur", "Kavrepalanchok", "Chitwan", "Makwanpur", "Sindhuli", "Dhading", "Nuwakot", "Ramechhap", "Sindhupalchok", "Dolakha", "Rasuwa"],
  "Koshi Province": ["Morang", "Sunsari", "Jhapa", "Udayapur", "Ilam", "Dhankuta", "Bhojpur", "Sankhuwasabha", "Solukhumbu", "Okhaldhunga", "Khotang", "Terhathum", "Panchthar", "Taplejung"],
  "Gandaki Province": ["Kaski", "Tanahun", "Syangja", "Gorkha", "Lamjung", "Nawalpur", "Baglung", "Parbat", "Myagdi", "Manang", "Mustang"],
  "Lumbini Province": ["Rupandehi", "Kapilvastu", "Dang", "Banke", "Bardiya", "Palpa", "Parasi", "Arghakhanchi", "Gulmi", "Pyuthan", "Rolpa", "Rukum East"],
  "Karnali Province": ["Surkhet", "Dailekh", "Jajarkot", "Salyan", "Rukum West", "Jumla", "Kalikot", "Mugu", "Humla", "Dolpa"],
  "Sudurpashchim Province": ["Kailali", "Kanchanpur", "Dadeldhura", "Doti", "Achham", "Baitadi", "Bajhang", "Bajura", "Darchula"],
};

interface RegistrationWizardProps {
  form: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    instructions: string | null;
  };
  schema: FormSchemaDefinition;
}

export function RegistrationWizard({ form, schema }: RegistrationWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [uploadedFileIds, setUploadedFileIds] = useState<string[]>([]);
  const [filePreviews, setFilePreviews] = useState<
    Record<string, { id?: string; name: string; size?: string; url?: string; driveId?: string }>
  >({});

  // Payment Method & Lightbox State
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"qr" | "wallet" | "bank">("qr");
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Existing Registration Detection State
  const [existingRegistration, setExistingRegistration] = useState<{
    found: boolean;
    referenceNumber: string;
    applicationStatus: string;
    paymentStatus: string;
    submittedAt?: string;
    rejectionReason?: string | null;
    answers: Record<string, any>;
  } | null>(null);

  // Uploading state
  const [uploadingFieldKey, setUploadingFieldKey] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [completedRef, setCompletedRef] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const steps = schema.steps;
  const isReviewStep = currentStepIndex === steps.length;
  const currentStep = steps[currentStepIndex];
  const totalStepsCount = steps.length + 1;
  const currentStepNumber = currentStepIndex + 1;
  const nextStep = !isReviewStep && currentStepIndex + 1 < steps.length ? steps[currentStepIndex + 1] : null;
  const progressPercent = Math.round((currentStepNumber / totalStepsCount) * 100);

  const [dynamicFee, setDynamicFee] = useState<number>(399);
  const [siteSettings, setSiteSettings] = useState<any>(null);

  useEffect(() => {
    async function loadFee() {
      try {
        const res = await getPublicSiteSettingsAction();
        if (res.success && res.setting) {
          setSiteSettings(res.setting);
          if (res.setting.registrationFee) {
            setDynamicFee(res.setting.registrationFee);
          }
        }
      } catch (e) {}
    }
    loadFee();
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleInputChange = (fieldKey: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [fieldKey]: value }));
  };

  // OTP Handlers
  const handleSendOtp = async () => {
    const email = String(answers.email || "").trim();
    const fullName = String(answers.fullName || "").trim();
    const phone = String(answers.phone || "").trim();

    if (!email || !email.includes("@")) {
      setOtpError("Please enter a valid email address first.");
      return;
    }
    if (!fullName) {
      setOtpError("Please enter your full legal name first.");
      return;
    }
    if (!phone) {
      setOtpError("Please enter your phone number first.");
      return;
    }

    setIsSendingOtp(true);
    setOtpError(null);

    const res = await sendOtpAction({
      formId: form.id,
      email,
      fullName,
      phone,
    });

    setIsSendingOtp(false);
    if (res.success && res.verificationId) {
      setOtpSent(true);
      setVerificationId(res.verificationId);
      setResendCooldown(60);
    } else {
      setOtpError(res.error || "Failed to send verification code");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.trim().length !== 6) {
      setOtpError("Please enter the complete 6-digit code.");
      return;
    }

    if (!verificationId) {
      setOtpError("Verification session not found. Please request a new code.");
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError(null);

    const res = await verifyOtpAction({
      verificationId,
      code: otpCode,
      email: answers.email,
      formId: form.id,
    });

    setIsVerifyingOtp(false);
    if (res.success && res.token) {
      setIsEmailVerified(true);
      setVerificationToken(res.token);

      if (res.existingRegistration?.found) {
        setExistingRegistration(res.existingRegistration);
        if (res.existingRegistration.applicationStatus === "APPROVED") {
          toast.error("An approved registration already exists under this email. Details are locked.");
        } else if (res.existingRegistration.applicationStatus === "REJECTED") {
          toast.warning("Previous application was not approved. You can update and resubmit.");
        } else {
          toast.info("An existing application was found for this email. You can change your details.");
        }
      }
    } else {
      setOtpError(res.error || "Verification failed");
    }
  };

  const handleLoadPreviousAnswersAndAdvance = () => {
    if (!existingRegistration) return;
    setAnswers((prev) => ({
      ...prev,
      ...existingRegistration.answers,
    }));
    toast.success("Previous application loaded! You can now review and make changes.");
    setExistingRegistration(null);
    setCurrentStepIndex(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // File, Document & Video Upload Handlers
  const handleFileUpload = async (fieldKey: string, type: "image" | "video" | "file", file: File) => {
    // Client-side file size pre-check for instant clear feedback
    const fileSizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const maxLimitMb = type === "video" ? 100 : type === "file" ? 25 : 10;
    const maxLimitBytes = maxLimitMb * 1024 * 1024;

    if (file.size > maxLimitBytes) {
      const err = `File "${file.name}" is ${fileSizeMb} MB, which exceeds the maximum allowed ${maxLimitMb} MB limit for ${
        type === "video" ? "videos" : type === "file" ? "documents" : "images"
      }. Please select a smaller file.`;
      setUploadError(err);
      toast.error(err);
      return;
    }

    setUploadingFieldKey(fieldKey);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fieldKey", fieldKey);
    formData.append("sessionToken", verificationToken || "public_reg");

    // Pass previous file ID if replacing existing file so it can be cleaned up
    const prevPreview = filePreviews[fieldKey];
    if (prevPreview?.id) {
      formData.append("previousFileId", prevPreview.id);
    }

    try {
      const endpoint =
        type === "video"
          ? "/api/public/upload/video"
          : type === "file"
          ? "/api/public/upload/document"
          : "/api/public/upload/image";

      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setUploadError(data.error || `Failed to upload ${type}`);
        toast.error(data.error || `Failed to upload ${type}`);
        return;
      }

      setUploadedFileIds((prev) => [...prev, data.fileId]);
      setFilePreviews((prev) => ({
        ...prev,
        [fieldKey]: {
          id: data.fileId,
          name: data.filename || file.name,
          size: `${fileSizeMb} MB`,
          url: data.url,
          driveId: data.driveFileId,
        },
      }));
      handleInputChange(fieldKey, data.url || data.filename || file.name);
      // Clear any previous error on this field
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[fieldKey];
        return next;
      });
      toast.success(
        `${type === "video" ? "Video" : type === "file" ? "Document" : "Photo"} (${fileSizeMb} MB) uploaded successfully!`
      );
    } catch {
      setUploadError("Network error during file upload. Please retry.");
      toast.error("Network error during file upload. Please retry.");
    } finally {
      setUploadingFieldKey(null);
    }
  };

  const isFieldVisible = (field: FormFieldDefinition): boolean => {
    return true; // Keep all configured fields visible
  };

  // Validate current step before proceeding
  const handleProceedNext = () => {
    const errors: Record<string, string> = {};

    if (currentStepIndex === 0) {
      if (existingRegistration?.applicationStatus === "APPROVED") {
        toast.error(
          "Your registration has already been officially approved and locked. Further submissions are disabled."
        );
        return;
      }
      const nameField = steps[0]?.fields.find((f) => f.fieldKey === "fullName");
      const emailField = steps[0]?.fields.find((f) => f.fieldKey === "email");
      const phoneField = steps[0]?.fields.find((f) => f.fieldKey === "phone");

      const isNameReq = nameField ? nameField.required : true;
      const isEmailReq = emailField ? emailField.required : true;
      const isPhoneReq = phoneField ? phoneField.required : true;

      if (isNameReq && (!answers.fullName || !String(answers.fullName).trim())) {
        errors.fullName = "Full legal name is required.";
      }
      if (isEmailReq) {
        if (!answers.email || !String(answers.email).trim()) {
          errors.email = "Email address is required.";
        } else if (!isEmailVerified) {
          errors.email = "Please verify your email address with the 6-digit code first.";
          setOtpError("Email verification is required before continuing.");
        }
      } else if (answers.email && String(answers.email).trim() && !isEmailVerified) {
        errors.email = "Please verify your email address with the code or clear this field.";
      }

      if (isPhoneReq && (!answers.phone || !String(answers.phone).trim())) {
        errors.phone = "Phone number is required.";
      }
    } else if (currentStep) {
      if (currentStep.isPaymentStep) {
        // Transaction Reference is strictly optional as requested; only Screenshot is required
        if (!filePreviews["paymentScreenshot"] && !answers.paymentScreenshot) {
          errors.paymentScreenshot = "Please upload your payment receipt screenshot.";
        }
      }
      for (const field of currentStep.fields) {
        // Skip transaction reference / payment reference check since it's optional
        if (field.fieldKey === "transactionReference" || field.fieldKey === "paymentReference") {
          continue;
        }
        if (field.required && !["heading", "divider", "spacer", "notice"].includes(field.type)) {
          const val = answers[field.fieldKey];
          if (
            val === undefined ||
            val === null ||
            val === "" ||
            (Array.isArray(val) && val.length === 0) ||
            (field.type === "checkbox" && !val)
          ) {
            errors[field.fieldKey] = `${field.label} is required.`;
          }
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Please fill in all required fields to proceed.");
      return;
    }

    setFieldErrors({});
    setCurrentStepIndex((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Final submit handler
  const handleFinalSubmit = async () => {
    if (!verificationToken) {
      setSubmitError("Email verification missing. Please re-verify your email.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const res = await submitRegistrationAction({
      formSlug: form.slug,
      verificationToken,
      answers,
      fileIds: uploadedFileIds,
    });

    setIsSubmitting(false);
    if (res.success && res.referenceNumber) {
      setCompletedRef(res.referenceNumber);
    } else {
      setSubmitError(res.error || "Submission failed. Please check required fields.");
    }
  };

  const copyRefToClipboard = async () => {
    if (!completedRef) return;
    try {
      await navigator.clipboard.writeText(completedRef);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    } catch {
      prompt("Registration Reference:", completedRef);
    }
  };

  // Confirmation Success Screen
  if (completedRef) {
    const formattedDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const fullLocation = [
      answers.cityVillage,
      answers.municipality,
      answers.district,
      answers.province,
    ]
      .filter(Boolean)
      .join(", ") || answers.currentAddress || "Janakpur Dham, Nepal";

    return (
      <div className="max-w-3xl mx-auto py-8 sm:py-12 px-4">
        {/* ============================================================== */}
        {/* 1. SCREEN VIEW ONLY: INTERACTIVE SUCCESS CARD (HIDDEN ON PRINT) */}
        {/* ============================================================== */}
        <div className="print:hidden">
          <Card className="border-[#DCE5ED] bg-white shadow-xl text-center p-6 sm:p-8 overflow-hidden relative">
            <div className="w-16 h-16 bg-[#F4F7FA] border border-[#356FA8] text-[#356FA8] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F7FA] text-[#183153] text-xs font-bold tracking-wide uppercase mb-3 border border-[#356FA8]">
              <ShieldCheck className="w-4 h-4 text-[#356FA8]" />
              <span>Registration Confirmed</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#183153] tracking-tight mb-2">
              You Are Officially Registered!
            </h2>
            <p className="text-xs sm:text-sm text-[#183153]/70 max-w-md mx-auto mb-6">
              Congratulations <strong className="text-[#183153]">{answers.fullName}</strong>. Your entry for{" "}
              <strong className="text-[#183153]">{form.name}</strong> has been successfully recorded in the event system.
            </p>

            <div className="bg-[#F4F7FA] border-2 border-dashed border-[#356FA8] rounded-2xl p-6 max-w-md mx-auto mb-6">
              <span className="text-[11px] font-bold text-[#183153]/60 uppercase tracking-wider block mb-1.5">
                Official Reference Number
              </span>
              <div className="flex items-center justify-center gap-2.5">
                <span className="font-mono text-2xl font-black text-[#183153] tracking-wider">
                  {completedRef}
                </span>
                <button
                  type="button"
                  onClick={copyRefToClipboard}
                  className="p-2 rounded-lg text-[#183153] hover:bg-[#F4F7FA] bg-white border border-[#DCE5ED] transition-colors"
                  title="Copy reference"
                >
                  {copiedRef ? <Check className="w-4 h-4 text-[#356FA8]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-[#183153]/50 mt-2">
                Save or screenshot this official reference number for event check-in and entry verification.
              </p>
            </div>

            {/* Details summary */}
            <div className="p-4 bg-zinc-50 rounded-xl text-left text-xs text-zinc-600 max-w-md mx-auto space-y-2 border border-[#DCE5ED] mb-6">
              <div className="flex justify-between items-center py-1 border-b border-zinc-100">
                <span className="text-zinc-500">Event:</span>
                <span className="font-bold text-black">{form.name}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-zinc-100">
                <span className="text-zinc-500">Participant:</span>
                <span className="font-bold text-black">{answers.fullName}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-zinc-100">
                <span className="text-zinc-500">Verified Email:</span>
                <span className="font-mono text-black font-semibold">{answers.email}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-zinc-100">
                <span className="text-zinc-500">Phone:</span>
                <span className="font-mono text-black font-semibold">{answers.phone}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-zinc-500">Registration Fee:</span>
                <span className="font-bold text-[#183153]">NPR 399 (Paid)</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.print()}
                className="text-xs font-semibold h-10 px-5 gap-2 border-[#183153] text-[#183153] hover:bg-[#F4F7FA] w-full sm:w-auto cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#356FA8]" />
                <span>Print Official Confirmation Pass</span>
              </Button>
              <a href="/" className="w-full sm:w-auto">
                <Button
                  type="button"
                  className="bg-[#183153] hover:bg-[#12243d] text-white text-xs font-bold h-10 px-6 gap-1.5 w-full cursor-pointer"
                >
                  <span>Return to Home</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
            </div>
          </Card>
        </div>

        {/* ============================================================== */}
        {/* 2. PRINT-ONLY OFFICIAL DOSSIER PASS & FEE RECEIPT (A4 OPTIMIZED) */}
        {/* ============================================================== */}
        <div className="hidden print:block print-dossier-root text-black bg-white">
          <div className="border-2 border-[#183153] rounded-lg p-6 space-y-5">
            {/* Header / Letterhead */}
            <div className="border-b-2 border-[#183153] pb-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold tracking-widest text-[#356FA8] uppercase block">
                  The Origin Foundation • Cultural Initiative
                </span>
                <h1 className="text-2xl font-black text-[#183153] tracking-tight uppercase">
                  Mithila Queen 2026
                </h1>
                <p className="text-xs text-zinc-600">
                  Janakpur Dham, Madhesh Province, Nepal • originfoundation107@gmail.com • +977 9704571941
                </p>
              </div>
              <div className="text-right">
                <div className="inline-block bg-[#183153] text-white px-3 py-1 rounded text-xs font-bold tracking-wide uppercase">
                  Candidate Dossier Pass
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">Date: {formattedDate}</div>
              </div>
            </div>

            {/* Reference & Verification Status Badge */}
            <div className="bg-zinc-50 border border-zinc-300 rounded p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                  Official Registration Reference No.
                </span>
                <span className="font-mono text-2xl font-black text-[#183153] tracking-wider">
                  {completedRef}
                </span>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  ✓ Recorded & Verification Active
                </span>
                <span className="text-[10px] text-zinc-500 block mt-1">
                  Official Event Entry Authorized
                </span>
              </div>
            </div>

            {/* Candidate & Payment Credentials Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              {/* Left Column: Candidate Info */}
              <div className="border border-zinc-200 rounded p-3.5 space-y-2">
                <h3 className="font-bold text-zinc-900 border-b border-zinc-200 pb-1 text-xs uppercase tracking-wide">
                  Candidate Credentials
                </h3>
                <div className="space-y-1.5 pt-1">
                  <div>
                    <span className="text-zinc-500 text-[10px] block">Full Legal Name:</span>
                    <span className="font-bold text-zinc-900 text-sm">{answers.fullName || "-"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[10px] block">Verified Email Address:</span>
                    <span className="font-mono text-zinc-900 font-semibold">{answers.email || "-"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[10px] block">Primary Phone Number:</span>
                    <span className="font-mono text-zinc-900 font-semibold">{answers.phone || "-"}</span>
                  </div>
                  {answers.dob && (
                    <div>
                      <span className="text-zinc-500 text-[10px] block">Date of Birth:</span>
                      <span className="text-zinc-900 font-medium">{String(answers.dob)}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-zinc-500 text-[10px] block">Location / Address:</span>
                    <span className="text-zinc-900">{fullLocation}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Event & Payment Details */}
              <div className="border border-zinc-200 rounded p-3.5 space-y-2">
                <h3 className="font-bold text-zinc-900 border-b border-zinc-200 pb-1 text-xs uppercase tracking-wide">
                  Registration & Fee Receipt
                </h3>
                <div className="space-y-1.5 pt-1">
                  <div>
                    <span className="text-zinc-500 text-[10px] block">Flagship Initiative:</span>
                    <span className="font-bold text-zinc-900">Mithila Queen 2026</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[10px] block">Official Registration Fee:</span>
                    <span className="font-bold text-[#183153] text-sm">NPR 399 (Paid)</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[10px] block">Payment Method:</span>
                    <span className="text-zinc-900 font-medium">
                      {answers.paymentMethod === "bank"
                        ? "Direct Bank Account Deposit"
                        : answers.paymentMethod === "wallet"
                        ? "Digital Wallet Transfer"
                        : "Official Merchant QR Code"}
                    </span>
                  </div>
                  {answers.transactionReference && (
                    <div>
                      <span className="text-zinc-500 text-[10px] block">Transaction Reference / UTR:</span>
                      <span className="font-mono font-bold text-zinc-900">{answers.transactionReference}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-zinc-500 text-[10px] block">Receipt Verification:</span>
                    <span className="text-emerald-700 font-semibold text-[11px]">Screenshot Uploaded & Logged</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Reporting Guidelines & Notice */}
            <div className="bg-zinc-50 border border-zinc-200 rounded p-3 text-[11px] space-y-1.5 text-zinc-700">
              <span className="font-bold text-zinc-900 uppercase tracking-wide block text-[10px]">
                Important Candidate Reporting Instructions:
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-zinc-600">
                <li>Please present this printed confirmation pass at the official event desk during stage 1 check-in.</li>
                <li>Bring an original government-issued identity document (Citizenship card, Passport, National ID, or Birth Certificate).</li>
                <li>Report 30 minutes prior to your allocated audition call time in Janakpur Dham.</li>
                <li>For any status inquiries or dossier modifications, cite reference code <strong>{completedRef}</strong> to desk officers.</li>
              </ul>
            </div>

            {/* Signatures & Seal Area */}
            <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs">
              <div className="border-t border-zinc-400 pt-2">
                <span className="font-bold text-zinc-800 block">{answers.fullName}</span>
                <span className="text-[10px] text-zinc-500">Candidate Signature & Declaration</span>
              </div>
              <div className="border-t border-zinc-400 pt-2">
                <span className="font-bold text-[#183153] block">The Origin Foundation Secretariat</span>
                <span className="text-[10px] text-zinc-500">Authorized Event Officer & Verification Seal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      {/* Event Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-[#DCE5ED] relative overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-[#356FA8] animate-pulse" />
          <span className="text-xs font-bold text-[#356FA8] tracking-wide uppercase">
            Official Registration
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#183153] tracking-tight font-bold">{form.name}</h1>
        {form.description && (
          <div className="mt-2 max-w-2xl">
            <RichTextView content={form.description} className="text-zinc-600 text-sm" />
          </div>
        )}
        {form.instructions && (
          <div className="mt-4 p-3.5 rounded-xl bg-zinc-50 border border-[#DCE5ED] flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#356FA8] shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <RichTextView content={form.instructions} className="text-zinc-700 text-xs" />
            </div>
          </div>
        )}
      </div>

      {/* Redesigned Clean Stepper Progress Header — Zero Overflow */}
      <div className="bg-white rounded-2xl border border-[#DCE5ED] p-5 sm:p-6 shadow-sm space-y-4">
        {/* Step Info Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#183153] text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
              {currentStepNumber}
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold uppercase tracking-wider text-[#356FA8]">
                  Step {currentStepNumber} of {totalStepsCount}
                </span>
                <span className="text-slate-300">&bull;</span>
                <span className="font-semibold text-slate-500 font-mono">
                  {progressPercent}% Complete
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#183153] leading-tight mt-0.5">
                {isReviewStep ? "Review & Confirm Details" : currentStep?.title}
              </h2>
            </div>
          </div>

          {/* Right: Next Step Preview & Dynamic Fee Badge */}
          <div className="flex items-center gap-3 sm:self-center">
            {!isReviewStep && (
              <div className="hidden md:block text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Next Step
                </span>
                <span className="text-xs font-semibold text-slate-700 truncate max-w-[200px] block">
                  {nextStep ? nextStep.title : "Final Review"}
                </span>
              </div>
            )}
            <div className="px-3.5 py-1.5 rounded-full bg-[#F4F7FA] border border-[#356FA8] text-xs font-mono font-bold text-[#183153] shrink-0">
              Fee: NPR {dynamicFee}
            </div>
          </div>
        </div>

        {/* Clean Segmented Progress Bar (Zero text crowding) */}
        <div className="space-y-1.5">
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex gap-1 p-0.5 border border-[#DCE5ED]/70">
            {Array.from({ length: totalStepsCount }).map((_, idx) => (
              <div
                key={idx}
                className={`h-full flex-1 rounded-full transition-all duration-300 ${
                  idx < currentStepIndex
                    ? "bg-[#183153]"
                    : idx === currentStepIndex
                    ? "bg-[#356FA8]"
                    : "bg-slate-200/80"
                }`}
              />
            ))}
          </div>

          {/* Mobile Next indicator */}
          {!isReviewStep && (
            <div className="flex md:hidden items-center justify-between text-[11px] text-slate-500 pt-0.5 px-0.5">
              <span>Next: {nextStep ? nextStep.title : "Review & Submit"}</span>
              <span className="font-mono text-slate-400">{progressPercent}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Wizard Form Card */}
      <Card className="border-[#DCE5ED] shadow-sm bg-white">
        <CardHeader className="pb-4 border-b border-slate-100">
          <CardTitle className="text-xl font-extrabold text-slate-900">
            {isReviewStep
              ? "Review & Submit Registration"
              : `Step ${currentStepIndex + 1}: ${currentStep.title}`}
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            {isReviewStep
              ? "Please verify all details and uploaded files before finalizing your entry."
              : currentStep.description || "Fill out the required information below to proceed."}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {uploadError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{uploadError}</span>
            </div>
          )}

          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{submitError}</span>
            </div>
          )}

          {/* STEP 1: Personal Details & Email OTP Verification */}
          {currentStepIndex === 0 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="fullName" required={steps[0]?.fields.find((f) => f.fieldKey === "fullName")?.required !== false}>
                    Full Legal Name
                  </Label>
                  <Input
                    id="fullName"
                    value={answers.fullName || ""}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="e.g. Bibek Poudel"
                    disabled={isEmailVerified}
                  />
                  <p className="text-[11px] text-slate-400">
                    As displayed on your citizenship, passport, or official ID.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" required={steps[0]?.fields.find((f) => f.fieldKey === "email")?.required !== false}>
                    Email Address (For Verification)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={answers.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="participant@example.com"
                    disabled={isEmailVerified}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" required={steps[0]?.fields.find((f) => f.fieldKey === "phone")?.required !== false}>
                    Mobile Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={answers.phone || ""}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+977 9800000000"
                    disabled={isEmailVerified}
                  />
                </div>
              </div>

              {/* OTP Email Verification Box */}
              <div className="p-5 rounded-xl border bg-slate-50/70 border-[#DCE5ED] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-[#356FA8]" />
                    <div>
                      <h4 className="font-bold text-sm text-[#183153]">
                        Email Address Verification
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        A 6-digit one-time code is required before continuing.
                      </p>
                    </div>
                  </div>

                  {isEmailVerified && (
                    <span className="text-xs font-bold text-[#183153] bg-[#F4F7FA] px-3 py-1 rounded-full flex items-center gap-1.5 border border-[#356FA8]">
                      <ShieldCheck className="w-4 h-4 text-[#356FA8]" />
                      <span>Verified</span>
                    </span>
                  )}
                </div>

                {otpError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{otpError}</span>
                  </div>
                )}

                {!isEmailVerified && (
                  <div className="space-y-3 pt-2">
                    {!otpSent ? (
                      <Button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isSendingOtp}
                        className="bg-[#183153] hover:bg-[#12243d] text-white font-semibold text-xs h-9 gap-1.5"
                      >
                        {isSendingOtp ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Sending Verification Code...</span>
                          </>
                        ) : (
                          <>
                            <Mail className="w-3.5 h-3.5 text-[#356FA8]" />
                            <span>Send 6-Digit Verification Code</span>
                          </>
                        )}
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Input
                            value={otpCode}
                            onChange={(e) =>
                              setOtpCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))
                            }
                            placeholder="6-digit code"
                            maxLength={6}
                            className="font-mono text-center tracking-widest text-lg font-bold w-44 h-10 bg-white"
                          />
                          <Button
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={isVerifyingOtp || otpCode.length !== 6}
                            className="bg-[#183153] hover:bg-[#12243d] text-white text-xs h-10 px-4 font-bold"
                          >
                            {isVerifyingOtp ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "Verify Code"
                            )}
                          </Button>
                        </div>

                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-slate-500">Didn&apos;t receive code?</span>
                          <button
                            type="button"
                            disabled={resendCooldown > 0 || isSendingOtp}
                            onClick={handleSendOtp}
                            className="text-[#356FA8] font-semibold hover:underline disabled:text-slate-400 disabled:no-underline"
                          >
                            {resendCooldown > 0
                              ? `Resend in ${resendCooldown}s`
                              : "Resend Code"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* EXISTING REGISTRATION DETECTION BANNER */}
              {isEmailVerified && existingRegistration && (
                <div className="pt-2 animate-in fade-in duration-200">
                  {existingRegistration.applicationStatus === "APPROVED" ? (
                    /* CASE 1: FULLY APPROVED - LOCKED & CANNOT EDIT */
                    <div className="p-5 rounded-2xl bg-emerald-50/90 border-2 border-emerald-500/80 space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
                        </div>
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-wider">
                            <Lock className="w-3 h-3" />
                            <span>Application Officially Approved</span>
                          </div>
                          <h3 className="text-base font-extrabold text-emerald-950">
                            You Have Already Registered — Candidacy Approved!
                          </h3>
                          <p className="text-xs text-emerald-800 leading-relaxed">
                            An official application under email <strong className="font-semibold text-emerald-950">{answers.email}</strong> has already been recorded and <strong>officially APPROVED</strong> for {form.name}.
                          </p>
                        </div>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                            Official Reference Number
                          </span>
                          <span className="font-mono text-base font-black text-[#183153]">
                            {existingRegistration.referenceNumber}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-emerald-700">
                          ✓ Registration details are officially locked and cannot be edited.
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 pt-1">
                        <a
                          href={`/registration-status?ref=${existingRegistration.referenceNumber}`}
                          className="inline-block"
                        >
                          <Button
                            type="button"
                            className="bg-[#183153] hover:bg-[#12243d] text-white text-xs font-bold h-9 px-4 gap-1.5 cursor-pointer shadow-xs"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>View Approved Status &amp; Dossier Pass</span>
                          </Button>
                        </a>
                        <a href="/" className="inline-block">
                          <Button
                            type="button"
                            variant="outline"
                            className="text-xs font-semibold h-9 px-4 border-emerald-300 text-emerald-900 hover:bg-emerald-100 cursor-pointer"
                          >
                            <span>Return to Home</span>
                          </Button>
                        </a>
                      </div>
                    </div>
                  ) : existingRegistration.applicationStatus === "REJECTED" ? (
                    /* CASE 2: REJECTED - CAN RESUBMIT */
                    <div className="p-5 rounded-2xl bg-rose-50/90 border-2 border-rose-400/80 space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                          <AlertCircle className="w-6 h-6 stroke-[2.5]" />
                        </div>
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[11px] font-bold uppercase tracking-wider">
                            <span>Application Not Approved</span>
                          </div>
                          <h3 className="text-base font-extrabold text-rose-950">
                            Previous Registration Found: Application Rejected
                          </h3>
                          <p className="text-xs text-rose-800 leading-relaxed">
                            A previous entry from email <strong className="font-semibold text-rose-950">{answers.email}</strong> (Ref: <span className="font-mono font-bold text-rose-900">{existingRegistration.referenceNumber}</span>) was reviewed and not accepted in the previous round.
                          </p>
                          {existingRegistration.rejectionReason && (
                            <div className="p-2.5 bg-white/80 rounded-lg border border-rose-200 text-xs text-rose-900 mt-1">
                              <strong>Reviewer Note:</strong> {existingRegistration.rejectionReason}
                            </div>
                          )}
                          <p className="text-xs text-rose-800 leading-relaxed pt-1">
                            You are welcome to update your information, correct previous details, and <strong>resubmit your application for re-evaluation</strong>.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 pt-1">
                        <Button
                          type="button"
                          onClick={handleLoadPreviousAnswersAndAdvance}
                          className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold h-9 px-4 gap-1.5 cursor-pointer shadow-xs"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Load Previous Details &amp; Resubmit Application</span>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setExistingRegistration(null)}
                          className="text-xs font-semibold h-9 px-4 border-rose-300 text-rose-900 hover:bg-rose-100 cursor-pointer"
                        >
                          <span>Start Fresh Blank Application</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* CASE 3: SUBMITTED / UNDER REVIEW - CAN CHANGE DETAILS */
                    <div className="p-5 rounded-2xl bg-amber-50/90 border-2 border-amber-400/80 space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#183153] text-white flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-6 h-6 stroke-[2.5] text-amber-300" />
                        </div>
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[11px] font-bold uppercase tracking-wider">
                            <span>Already Registered</span>
                          </div>
                          <h3 className="text-base font-extrabold text-amber-950">
                            You Have Already Filled the Registration Form from this Email
                          </h3>
                          <p className="text-xs text-amber-900 leading-relaxed">
                            We found an existing active registration for <strong className="font-semibold text-amber-950">{answers.email}</strong>.
                          </p>
                        </div>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                            Official Reference Number
                          </span>
                          <span className="font-mono text-base font-black text-[#183153]">
                            {existingRegistration.referenceNumber}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-amber-900">
                          Current Status: <span className="uppercase font-bold text-[#183153]">{existingRegistration.applicationStatus}</span>
                        </div>
                      </div>

                      <p className="text-xs text-amber-900 leading-relaxed">
                        If you need to update or change any details, you can load your previous answers, make modifications, and update your submission.
                      </p>

                      <div className="flex flex-wrap items-center gap-2.5 pt-1">
                        <Button
                          type="button"
                          onClick={handleLoadPreviousAnswersAndAdvance}
                          className="bg-[#183153] hover:bg-[#12243d] text-white text-xs font-bold h-9 px-4 gap-1.5 cursor-pointer shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Load &amp; Change My Details</span>
                        </Button>
                        <a
                          href={`/registration-status?ref=${existingRegistration.referenceNumber}`}
                          className="inline-block"
                        >
                          <Button
                            type="button"
                            variant="outline"
                            className="text-xs font-semibold h-9 px-4 border-amber-300 text-amber-900 hover:bg-amber-100 cursor-pointer"
                          >
                            <span>Check Current Live Status</span>
                          </Button>
                        </a>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setExistingRegistration(null)}
                          className="text-xs font-medium text-slate-500 hover:text-slate-700 cursor-pointer"
                        >
                          <span>Dismiss</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEPS 2..N: Dynamic Configured Fields */}
          {!isReviewStep && currentStepIndex > 0 && (
            <div className="space-y-5">
              {currentStep.isPaymentStep && (
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#DCE5ED] shadow-sm space-y-5">
                  <div className="flex items-center justify-between pb-3.5 border-b border-[#DCE5ED]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F4F7FA] border border-[#356FA8] text-[#183153] flex items-center justify-center shrink-0">
                        <QrCode className="w-5 h-5 text-[#356FA8]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-[#183153]">Official Registration Fee & Payment</h3>
                        <p className="text-xs text-[#546E7A]">
                          Amount: <strong className="text-[#183153] font-black">NPR {dynamicFee}</strong> &bull; Non-refundable administrative fee
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-[#356FA8] text-[#183153] bg-[#F4F7FA] font-bold text-xs px-3 py-1">
                      NPR {dynamicFee}
                    </Badge>
                  </div>

                  {/* Payment Method Selector Tabs (If Wallet or Bank options exist) */}
                  {(Boolean(siteSettings?.enableWalletPayment && siteSettings?.walletId) ||
                    Boolean(siteSettings?.enableBankPayment && siteSettings?.bankAccountNumber)) && (
                    <div className="flex flex-wrap gap-2 p-1.5 bg-[#F4F7FA] rounded-xl border border-[#DCE5ED]">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPaymentMethod("qr");
                          handleInputChange("paymentMethod", "Official Merchant QR");
                        }}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          selectedPaymentMethod === "qr"
                            ? "bg-[#183153] text-white shadow-xs"
                            : "text-[#546E7A] hover:text-[#183153] hover:bg-white/60"
                        }`}
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Scan Official QR</span>
                      </button>

                      {siteSettings?.enableWalletPayment && siteSettings?.walletId && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPaymentMethod("wallet");
                            handleInputChange("paymentMethod", siteSettings.walletProviderName || "Digital Wallet");
                          }}
                          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            selectedPaymentMethod === "wallet"
                              ? "bg-[#183153] text-white shadow-xs"
                              : "text-[#546E7A] hover:text-[#183153] hover:bg-white/60"
                          }`}
                        >
                          <Wallet className="w-3.5 h-3.5" />
                          <span>{siteSettings.walletProviderName || "eSewa / Digital Wallet"}</span>
                        </button>
                      )}

                      {siteSettings?.enableBankPayment && siteSettings?.bankAccountNumber && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPaymentMethod("bank");
                            handleInputChange("paymentMethod", siteSettings.bankName || "Bank Transfer");
                          }}
                          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            selectedPaymentMethod === "bank"
                              ? "bg-[#183153] text-white shadow-xs"
                              : "text-[#546E7A] hover:text-[#183153] hover:bg-white/60"
                          }`}
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          <span>Direct Bank Transfer</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Method View 1: Official QR Scan */}
                  {selectedPaymentMethod === "qr" && (
                    <div className="flex flex-col items-center justify-center p-6 bg-[#F4F7FA] rounded-2xl border border-[#DCE5ED] text-center space-y-3">
                      {siteSettings?.paymentQrCodeUrl ? (
                        <div className="p-3 bg-white rounded-xl border border-[#DCE5ED] shadow-sm">
                          <img
                            src={siteSettings.paymentQrCodeUrl}
                            alt="Official Payment QR"
                            className="w-48 h-48 object-contain mx-auto cursor-pointer hover:opacity-95 transition-opacity"
                            onClick={() =>
                              setLightboxImage({
                                url: siteSettings.paymentQrCodeUrl,
                                title: "Official Payment Merchant QR Code",
                              })
                            }
                          />
                        </div>
                      ) : (
                        <div className="w-48 h-48 rounded-xl bg-white border-2 border-dashed border-[#DCE5ED] flex flex-col items-center justify-center text-[#546E7A] p-4">
                          <QrCode className="w-12 h-12 mb-2 text-[#356FA8] opacity-50" />
                          <span className="text-xs font-bold text-[#183153]">Official Payment QR</span>
                          <span className="text-[10px] text-[#546E7A] mt-1">NPR {dynamicFee}</span>
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-[#183153]">
                          {siteSettings?.paymentProviderName || "Scan with Any Banking or Wallet App"}
                        </p>
                        <p className="text-[11px] text-[#546E7A] max-w-sm mt-0.5">
                          {siteSettings?.paymentInstructions ||
                            `Scan the merchant QR code using your mobile banking app, eSewa, or Khalti to transfer NPR ${dynamicFee}. Save your transfer receipt screenshot.`}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Method View 2: Digital Wallet */}
                  {selectedPaymentMethod === "wallet" && siteSettings?.walletId && (
                    <div className="p-5 rounded-2xl bg-[#F4F7FA] border border-[#DCE5ED] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#183153] flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-[#356FA8]" />
                          <span>{siteSettings.walletProviderName || "eSewa / Digital Wallet"}</span>
                        </span>
                        <Badge className="bg-emerald-600 text-white text-[10px]">Instant Transfer</Badge>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-[#DCE5ED] flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold text-[#546E7A] uppercase tracking-wider block">Wallet ID / Mobile Number</span>
                          <span className="font-mono font-bold text-sm text-[#183153]">{siteSettings.walletId}</span>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(siteSettings.walletId);
                            setCopiedWallet(true);
                            setTimeout(() => setCopiedWallet(false), 2000);
                            toast.success("Wallet ID copied!");
                          }}
                          className="h-8 text-xs gap-1.5 font-bold"
                        >
                          {copiedWallet ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedWallet ? "Copied" : "Copy ID"}</span>
                        </Button>
                      </div>
                      {siteSettings.walletBeneficiaryName && (
                        <p className="text-xs text-[#546E7A]">
                          A/C Beneficiary Name: <strong className="text-[#183153]">{siteSettings.walletBeneficiaryName}</strong>
                        </p>
                      )}
                      {siteSettings.walletInstructions && (
                        <p className="text-[11px] text-[#546E7A] bg-white/70 p-2.5 rounded-lg border border-[#DCE5ED]">
                          {siteSettings.walletInstructions}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Method View 3: Bank Transfer */}
                  {selectedPaymentMethod === "bank" && siteSettings?.bankAccountNumber && (
                    <div className="p-5 rounded-2xl bg-[#F4F7FA] border border-[#DCE5ED] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#183153] flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#356FA8]" />
                          <span>{siteSettings.bankName || "Direct Bank Transfer"}</span>
                        </span>
                        <Badge className="bg-[#183153] text-white text-[10px]">Bank Deposit</Badge>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-[#DCE5ED] flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold text-[#546E7A] uppercase tracking-wider block">Bank Account Number</span>
                          <span className="font-mono font-bold text-sm text-[#183153]">{siteSettings.bankAccountNumber}</span>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(siteSettings.bankAccountNumber);
                            setCopiedBank(true);
                            setTimeout(() => setCopiedBank(false), 2000);
                            toast.success("Account number copied!");
                          }}
                          className="h-8 text-xs gap-1.5 font-bold"
                        >
                          {copiedBank ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedBank ? "Copied" : "Copy A/C"}</span>
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {siteSettings.bankBeneficiaryName && (
                          <div className="p-2.5 bg-white rounded-lg border border-[#DCE5ED]">
                            <span className="text-[10px] text-[#546E7A] block">Account Holder:</span>
                            <span className="font-bold text-[#183153]">{siteSettings.bankBeneficiaryName}</span>
                          </div>
                        )}
                        {siteSettings.bankBranch && (
                          <div className="p-2.5 bg-white rounded-lg border border-[#DCE5ED]">
                            <span className="text-[10px] text-[#546E7A] block">Branch Name:</span>
                            <span className="font-bold text-[#183153]">{siteSettings.bankBranch}</span>
                          </div>
                        )}
                      </div>
                      {siteSettings.bankInstructions && (
                        <p className="text-[11px] text-[#546E7A] bg-white/70 p-2.5 rounded-lg border border-[#DCE5ED]">
                          {siteSettings.bankInstructions}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Payment Inputs: Reference (Optional) & Screenshot (Required) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#DCE5ED]">
                    {/* Single Transaction Reference (Optional) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="transactionReference" className="text-xs font-bold text-[#183153]">
                          Payment Transaction Reference / UTR Code
                        </Label>
                        <span className="text-[11px] text-[#546E7A] font-medium bg-[#F4F7FA] px-2 py-0.5 rounded border border-[#DCE5ED]">
                          Optional
                        </span>
                      </div>
                      <Input
                        id="transactionReference"
                        value={answers.transactionReference || answers.paymentReference || ""}
                        onChange={(e) => {
                          handleInputChange("transactionReference", e.target.value);
                          handleInputChange("paymentReference", e.target.value);
                        }}
                        placeholder="e.g. 0284729104 (optional)"
                        className="bg-white text-xs h-10"
                      />
                      <p className="text-[11px] text-[#546E7A]">
                        Obtained from your payment receipt screenshot after completing the NPR {dynamicFee} transfer.
                      </p>
                    </div>

                    {/* Single Screenshot Upload (Required) */}
                    <div className="space-y-1.5">
                      <Label htmlFor="paymentScreenshot" required={true} className="text-xs font-bold text-[#183153]">
                        Payment Screenshot / Bank Voucher Upload
                      </Label>
                      {filePreviews["paymentScreenshot"] ? (
                        <div className="p-2.5 rounded-xl bg-[#F4F7FA] border border-[#356FA8] flex items-center justify-between gap-3 text-xs">
                          <div
                            className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                            onClick={() => {
                              if (filePreviews["paymentScreenshot"]?.url) {
                                setLightboxImage({
                                  url: filePreviews["paymentScreenshot"].url,
                                  title: "Payment Receipt Screenshot",
                                });
                              }
                            }}
                          >
                            {filePreviews["paymentScreenshot"].url ? (
                              <img
                                src={filePreviews["paymentScreenshot"].url}
                                alt="Payment receipt thumbnail"
                                className="w-10 h-10 rounded-lg object-cover border border-[#DCE5ED] shrink-0 hover:opacity-80 transition"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-white border border-[#DCE5ED] flex items-center justify-center shrink-0">
                                <FileCheck className="w-5 h-5 text-[#356FA8]" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <span className="truncate font-bold text-[#183153] block text-xs">
                                {filePreviews["paymentScreenshot"].name}
                              </span>
                              <span className="text-[10px] text-[#356FA8] font-semibold flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                <span>Click to preview</span>
                              </span>
                            </div>
                          </div>
                          <label className="cursor-pointer text-xs text-[#183153] bg-white px-2.5 py-1 rounded-lg border border-[#DCE5ED] hover:bg-slate-50 font-bold shrink-0 transition">
                            Change
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) {
                                  handleFileUpload("paymentScreenshot", "image", f);
                                  if (fieldErrors.paymentScreenshot) {
                                    setFieldErrors((prev) => {
                                      const n = { ...prev };
                                      delete n.paymentScreenshot;
                                      return n;
                                    });
                                  }
                                }
                              }}
                            />
                          </label>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-[#DCE5ED] bg-[#F4F7FA]/60 hover:border-[#356FA8] hover:bg-[#F4F7FA] cursor-pointer text-xs font-semibold text-[#183153] gap-1.5 transition-all text-center">
                          <Upload className="w-5 h-5 text-[#356FA8]" />
                          <span className="font-bold text-[#183153]">Upload Receipt (JPG, PNG, PDF)</span>
                          <span className="text-[10px] text-[#546E7A]">
                            Screenshot or bank voucher showing transaction amount & date
                          </span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) {
                                handleFileUpload("paymentScreenshot", "image", f);
                                if (fieldErrors.paymentScreenshot) {
                                  setFieldErrors((prev) => {
                                    const n = { ...prev };
                                    delete n.paymentScreenshot;
                                    return n;
                                  });
                                }
                              }
                            }}
                          />
                        </label>
                      )}
                      {fieldErrors.paymentScreenshot && (
                        <p className="text-xs text-red-600 font-semibold">{fieldErrors.paymentScreenshot}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {currentStep.fields
                .filter((f) => {
                  // Do not render duplicate payment fields below when already on the payment step
                  if (
                    currentStep.isPaymentStep &&
                    (f.fieldKey === "transactionReference" ||
                      f.fieldKey === "paymentReference" ||
                      f.fieldKey === "paymentScreenshot")
                  ) {
                    return false;
                  }
                  return isFieldVisible(f);
                })
                .map((field) => (
                <div key={field.id} className="space-y-1.5">
                  {field.type === "heading" ? (
                    <div className="pt-2 border-t border-slate-100">
                      <h3 className="font-extrabold text-base text-[#183153]">{field.label}</h3>
                      {field.description && (
                        <p className="text-xs text-slate-500">{field.description}</p>
                      )}
                    </div>
                  ) : field.type === "divider" ? (
                    <hr className="my-4 border-[#DCE5ED]" />
                  ) : field.type === "spacer" ? (
                    <div
                      style={{ height: `${Number(field.placeholder) || 28}px` }}
                      className="w-full pointer-events-none select-none"
                      aria-hidden="true"
                    />
                  ) : field.type === "notice" ? (
                    <div className="p-3.5 rounded-xl bg-[#F4F7FA] border border-[#356FA8]/30 flex items-start gap-2.5 my-2">
                      <Info className="w-4 h-4 text-[#356FA8] shrink-0 mt-0.5" />
                      <div className="space-y-0.5 text-xs">
                        {field.label && <span className="font-bold text-[#183153] block">{field.label}</span>}
                        {field.description && <p className="text-slate-600 leading-relaxed text-[11px]">{field.description}</p>}
                        {field.placeholder && !field.description && (
                          <p className="text-slate-600 leading-relaxed text-[11px]">{field.placeholder}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <Label required={field.required}>{field.label}</Label>
                      {field.description && (
                        <p className="text-[11px] text-slate-500">{field.description}</p>
                      )}

                      {field.type === "textarea" ? (
                        <Textarea
                          placeholder={field.placeholder}
                          value={answers[field.fieldKey] || ""}
                          onChange={(e) => handleInputChange(field.fieldKey, e.target.value)}
                          className="text-sm"
                          rows={3}
                        />
                      ) : field.type === "select" ? (
                        <Select
                          value={answers[field.fieldKey] || ""}
                          onValueChange={(val) => handleInputChange(field.fieldKey, val)}
                        >
                          <SelectTrigger className="w-full h-10 rounded-lg border border-[#DCE5ED] px-3 text-sm bg-white text-slate-900">
                            <SelectValue placeholder={field.placeholder || "Select option..."} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">{field.placeholder || "Select option..."}</SelectItem>
                            {(field.fieldKey === "district" &&
                            answers.province &&
                            PROVINCE_DISTRICTS[answers.province]
                              ? [
                                  ...PROVINCE_DISTRICTS[answers.province].map((d) => ({
                                    label: d,
                                    value: d,
                                  })),
                                  { label: "Other District", value: "Other District" },
                                ]
                              : field.options || []
                            ).map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : field.type === "radio" ? (
                        <div className="space-y-2 pt-1">
                          {(field.options || []).map((opt) => (
                            <label
                              key={opt.value}
                              className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer p-2 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
                            >
                              <input
                                type="radio"
                                name={field.fieldKey}
                                value={opt.value}
                                checked={answers[field.fieldKey] === opt.value}
                                onChange={() => handleInputChange(field.fieldKey, opt.value)}
                                className="w-4 h-4 text-[#356FA8] focus:ring-[#356FA8]"
                              />
                              <span className="font-medium">{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      ) : field.type === "checkbox" ? (
                        <label className="flex items-start gap-3 text-sm text-slate-700 cursor-pointer p-3 rounded-xl border border-[#DCE5ED] bg-slate-50/50 hover:bg-slate-50 transition-colors">
                          <input
                            type="checkbox"
                            checked={Boolean(answers[field.fieldKey])}
                            onChange={(e) => handleInputChange(field.fieldKey, e.target.checked)}
                            className="w-4 h-4 rounded text-[#356FA8] focus:ring-[#356FA8] mt-0.5"
                          />
                          <span className="font-medium">{field.placeholder || field.label}</span>
                        </label>
                      ) : field.type === "checkbox-group" ? (
                        <div className="space-y-2 pt-1">
                          {(field.options || []).map((opt) => {
                            const curVals: string[] = Array.isArray(answers[field.fieldKey])
                              ? answers[field.fieldKey]
                              : [];
                            const isChecked = curVals.includes(opt.value);
                            return (
                              <label
                                key={opt.value}
                                className="flex items-center gap-2.5 text-sm text-zinc-700 cursor-pointer p-2.5 rounded-lg border border-[#DCE5ED] hover:bg-zinc-50 transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      handleInputChange(field.fieldKey, [...curVals, opt.value]);
                                    } else {
                                      handleInputChange(
                                        field.fieldKey,
                                        curVals.filter((v) => v !== opt.value)
                                      );
                                    }
                                  }}
                                  className="w-4 h-4 rounded text-[#356FA8] focus:ring-[#356FA8]"
                                />
                                <span className="font-medium text-xs text-zinc-900">{opt.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      ) : ["image", "video", "file"].includes(field.type) ? (
                        <div className="space-y-2">
                          {filePreviews[field.fieldKey] ? (
                            <div className="bg-[#F4F7FA] p-4 rounded-xl border border-[#356FA8] flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-lg bg-white border border-[#DCE5ED] text-[#356FA8] flex items-center justify-center shrink-0">
                                  {field.type === "video" ? (
                                    <Video className="w-5 h-5 text-[#356FA8]" />
                                  ) : field.type === "file" ? (
                                    <FileCheck className="w-5 h-5 text-[#356FA8]" />
                                  ) : (
                                    <ImageIcon className="w-5 h-5 text-[#356FA8]" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-xs text-black truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                                    {filePreviews[field.fieldKey].name}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                    <span className="text-[10px] text-[#356FA8] font-bold">
                                      Uploaded Successfully
                                    </span>
                                    {filePreviews[field.fieldKey].size && (
                                      <span className="text-[10px] text-zinc-500 font-medium">
                                        &bull; {filePreviews[field.fieldKey].size}
                                      </span>
                                    )}
                                    <span className="text-[10px] font-semibold text-zinc-400">
                                      (Max: {field.type === "video" ? "100 MB" : field.type === "file" ? "25 MB" : "10 MB"})
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-100 text-xs font-semibold text-black transition-colors shrink-0 shadow-2xs">
                                <RefreshCw className="w-3.5 h-3.5 text-zinc-600" />
                                <span>Change File</span>
                                <input
                                  type="file"
                                  accept={
                                    field.type === "video"
                                      ? "video/mp4,video/webm,video/quicktime,video/x-msvideo,video/*"
                                      : field.type === "image"
                                      ? "image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml,image/bmp,image/tiff,image/*"
                                      : ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,application/pdf"
                                  }
                                  className="hidden"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleFileUpload(field.fieldKey, field.type as any, f);
                                  }}
                                />
                              </label>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-[#DCE5ED] rounded-xl p-5 text-center hover:border-[#356FA8] transition-colors bg-[#F4F7FA]/50">
                              <div className="space-y-2.5">
                                {field.type === "video" ? (
                                  <Video className="w-8 h-8 text-[#356FA8] mx-auto" />
                                ) : field.type === "file" ? (
                                  <FileUp className="w-8 h-8 text-[#356FA8] mx-auto" />
                                ) : (
                                  <ImageIcon className="w-8 h-8 text-[#356FA8] mx-auto" />
                                )}
                                <div className="text-xs text-[#183153]/70">
                                  {uploadingFieldKey === field.fieldKey ? (
                                    <div className="flex items-center justify-center gap-2 text-[#356FA8] font-bold py-1">
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      <span>
                                        Uploading {field.type === "video" ? "to Google Drive" : "to server"}...
                                      </span>
                                    </div>
                                  ) : (
                                    <>
                                      <label className="cursor-pointer text-[#356FA8] hover:text-[#183153] font-bold underline">
                                        <span>
                                          Click to upload {field.type === "file" ? "document (PDF, DOC)" : field.type}
                                        </span>
                                        <input
                                          type="file"
                                          accept={
                                            field.type === "video"
                                              ? "video/mp4,video/webm,video/quicktime,video/x-msvideo,video/*"
                                              : field.type === "image"
                                              ? "image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml,image/bmp,image/tiff,image/*"
                                              : ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,application/pdf"
                                          }
                                          className="hidden"
                                          onChange={(e) => {
                                            const f = e.target.files?.[0];
                                            if (f) handleFileUpload(field.fieldKey, field.type as any, f);
                                          }}
                                        />
                                      </label>

                                      <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
                                        <span className="text-[10px] font-bold text-[#183153] bg-[#F4F7FA] px-2 py-0.5 rounded border border-[#356FA8]">
                                          Max file size: {field.type === "video" ? "100 MB" : field.type === "file" ? "25 MB" : "10 MB"}
                                        </span>
                                        <span className="text-[10px] text-zinc-400">
                                          {field.type === "video"
                                            ? "Google Drive Stream (MP4, WebM, MOV)"
                                            : field.type === "file"
                                            ? "Accepted: PDF, DOC, DOCX"
                                            : "Accepted: JPG, PNG, WebP, GIF, SVG"}
                                        </span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : field.type === "date" ? (
                        <div className="relative">
                          <Input
                            type="date"
                            placeholder={field.placeholder || "YYYY-MM-DD"}
                            value={answers[field.fieldKey] || ""}
                            onChange={(e) => handleInputChange(field.fieldKey, e.target.value)}
                            className="text-sm bg-white pr-9"
                          />
                          <Calendar className="w-4 h-4 text-zinc-400 absolute right-3 top-3 pointer-events-none" />
                        </div>
                      ) : field.type === "time" ? (
                        <div className="relative">
                          <Input
                            type="time"
                            placeholder={field.placeholder || "--:--"}
                            value={answers[field.fieldKey] || ""}
                            onChange={(e) => handleInputChange(field.fieldKey, e.target.value)}
                            className="text-sm bg-white pr-9"
                          />
                          <Clock className="w-4 h-4 text-zinc-400 absolute right-3 top-3 pointer-events-none" />
                        </div>
                      ) : (
                        <Input
                          type={field.type === "number" ? "number" : "text"}
                          placeholder={field.placeholder}
                          value={answers[field.fieldKey] || ""}
                          onChange={(e) => handleInputChange(field.fieldKey, e.target.value)}
                          className="text-sm bg-white"
                        />
                      )}
                      {fieldErrors[field.fieldKey] && (
                        <p className="text-xs text-red-600 font-semibold">{fieldErrors[field.fieldKey]}</p>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* FINAL STEP: Summary Review */}
          {isReviewStep && (
            <div className="space-y-6">
              <div className="p-4 bg-[#F4F7FA] rounded-xl border border-[#356FA8] flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#356FA8] shrink-0" />
                <div className="text-xs text-[#183153]">
                  <span className="font-bold block text-sm">Review Your Information</span>
                  Please review your details carefully. Clicking <strong>&quot;Submit Official Registration&quot;</strong> will finalize your event entry.
                </div>
              </div>

              <div className="space-y-4">
                {/* Step 1 Review Card */}
                <div className="rounded-xl border border-[#DCE5ED] overflow-hidden bg-white">
                  <div className="px-4 py-2.5 bg-zinc-50 border-b border-[#DCE5ED] font-bold text-xs text-black flex items-center justify-between">
                    <span>1. Participant & Contact Information</span>
                    <span className="text-[10px] text-[#183153] font-semibold bg-[#F4F7FA] px-2 py-0.5 rounded-full flex items-center gap-1 border border-[#356FA8]">
                      <ShieldCheck className="w-3 h-3 text-[#356FA8]" />
                      <span>Email Verified</span>
                    </span>
                  </div>
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-zinc-500 font-medium block text-[11px]">Legal Name:</span>
                      <div className="font-bold text-black bg-zinc-50 px-2.5 py-1.5 rounded-lg border border-zinc-100 mt-1">
                        {answers.fullName || "-"}
                      </div>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-medium block text-[11px]">Email (Verified):</span>
                      <div className="font-mono text-zinc-900 bg-zinc-50 px-2.5 py-1.5 rounded-lg border border-zinc-100 mt-1">
                        {answers.email || "-"}
                      </div>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-medium block text-[11px]">Phone:</span>
                      <div className="font-mono text-zinc-900 bg-zinc-50 px-2.5 py-1.5 rounded-lg border border-zinc-100 mt-1">
                        {answers.phone || "-"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Steps 2..N Review Cards */}
                {steps.slice(1).map((st, idx) => (
                  <div key={st.id} className="rounded-xl border border-[#DCE5ED] overflow-hidden bg-white">
                    <div className="px-4 py-2.5 bg-zinc-50 border-b border-[#DCE5ED] font-bold text-xs text-black flex items-center justify-between">
                      <span>{idx + 2}. {st.title}</span>
                      <span className="text-[10px] text-zinc-400 font-normal">Step {idx + 2} of {steps.length}</span>
                    </div>
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {st.fields
                        .filter((f) => !["heading", "divider", "spacer", "notice"].includes(f.type))
                        .map((f) => {
                          const isFileField = ["image", "video", "file"].includes(f.type);
                          const preview = filePreviews[f.fieldKey];

                          let displayVal = "-";
                          const rawVal = answers[f.fieldKey];
                          if (rawVal !== undefined && rawVal !== null && rawVal !== "") {
                            if (f.type === "select" || f.type === "radio") {
                              const matchedOpt = f.options?.find((o) => o.value === rawVal);
                              displayVal = matchedOpt ? matchedOpt.label : String(rawVal);
                            } else if (f.type === "checkbox-group" && Array.isArray(rawVal)) {
                              displayVal = rawVal
                                .map((v) => f.options?.find((o) => o.value === v)?.label || v)
                                .join(", ") || "-";
                            } else if (f.type === "checkbox") {
                              displayVal = rawVal ? "Yes / Confirmed" : "No";
                            } else {
                              displayVal = String(rawVal);
                            }
                          }

                          return (
                            <div key={f.id} className="space-y-1">
                              <span className="text-zinc-500 font-medium block text-[11px]">{f.label}:</span>
                              {isFileField ? (
                                preview?.name || (rawVal && !String(rawVal).startsWith("/")) ? (
                                  <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#F4F7FA] border border-[#DCE5ED]">
                                    <div
                                      className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                                      onClick={() => {
                                        const imgUrl = preview?.url || (rawVal && String(rawVal).startsWith("/") ? String(rawVal) : null);
                                        if (imgUrl && (f.type === "image" || f.fieldKey.toLowerCase().includes("photo") || f.fieldKey.toLowerCase().includes("screenshot"))) {
                                          setLightboxImage({
                                            url: imgUrl,
                                            title: f.label,
                                          });
                                        }
                                      }}
                                    >
                                      {(preview?.url || (rawVal && String(rawVal).startsWith("/"))) &&
                                      (f.type === "image" || f.fieldKey.toLowerCase().includes("photo") || f.fieldKey.toLowerCase().includes("screenshot")) ? (
                                        <img
                                          src={preview?.url || String(rawVal)}
                                          alt={preview?.name || f.label}
                                          className="w-10 h-10 rounded-lg object-cover border border-[#DCE5ED] shrink-0 hover:opacity-85 transition"
                                        />
                                      ) : (
                                        <div className="w-9 h-9 rounded-lg bg-white border border-[#DCE5ED] text-[#356FA8] flex items-center justify-center shrink-0">
                                          {f.type === "video" ? (
                                            <Video className="w-4 h-4 text-[#356FA8]" />
                                          ) : f.type === "file" ? (
                                            <FileCheck className="w-4 h-4 text-[#356FA8]" />
                                          ) : (
                                            <ImageIcon className="w-4 h-4 text-[#356FA8]" />
                                          )}
                                        </div>
                                      )}
                                      <div className="min-w-0">
                                        <span className="truncate font-semibold text-xs text-[#183153] block max-w-[150px] sm:max-w-xs">
                                          {preview?.name || String(rawVal)}
                                        </span>
                                        {preview?.size && (
                                          <span className="text-[10px] text-[#546E7A] font-medium block">
                                            {preview.size}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {(preview?.url || (rawVal && String(rawVal).startsWith("/"))) &&
                                      (f.type === "image" || f.fieldKey.toLowerCase().includes("photo") || f.fieldKey.toLowerCase().includes("screenshot")) && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setLightboxImage({
                                              url: preview?.url || String(rawVal),
                                              title: f.label,
                                            });
                                          }}
                                          className="text-[11px] font-bold text-[#356FA8] hover:underline flex items-center gap-1 shrink-0 px-2 py-1 bg-white rounded-md border border-[#DCE5ED] cursor-pointer"
                                        >
                                          <Eye className="w-3 h-3" />
                                          <span>Preview</span>
                                        </button>
                                      )}
                                  </div>
                                ) : (
                                  <span className="text-zinc-400 block px-2.5 py-1.5">-</span>
                                )
                              ) : (
                                <div className="font-semibold text-black break-words bg-zinc-50 px-2.5 py-1.5 rounded-lg border border-zinc-100">
                                  {displayVal}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      {st.isPaymentStep && (
                        <div className="sm:col-span-2 pt-3 border-t border-[#DCE5ED] bg-[#F4F7FA] p-4 rounded-xl border border-[#DCE5ED] space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <span className="font-bold text-xs text-[#183153] block">Official Registration Fee</span>
                              <span className="text-xs font-black text-[#183153]">NPR {dynamicFee}</span>
                              {answers.paymentMethod && (
                                <span className="text-[11px] text-[#546E7A] block mt-0.5">
                                  Method: <strong>{answers.paymentMethod}</strong>
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-[#546E7A] uppercase font-bold block">Transaction Reference / UTR</span>
                              <code className="font-mono text-xs font-bold text-[#183153]">
                                {answers.transactionReference || answers.paymentReference || "Not provided (optional)"}
                              </code>
                            </div>
                          </div>

                          {filePreviews["paymentScreenshot"] ? (
                            <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-[#DCE5ED]">
                              <div
                                className="flex items-center gap-2.5 cursor-pointer min-w-0"
                                onClick={() => {
                                  if (filePreviews["paymentScreenshot"]?.url) {
                                    setLightboxImage({
                                      url: filePreviews["paymentScreenshot"].url,
                                      title: "Official Payment Receipt / Screenshot",
                                    });
                                  }
                                }}
                              >
                                {filePreviews["paymentScreenshot"].url ? (
                                  <img
                                    src={filePreviews["paymentScreenshot"].url}
                                    alt="Receipt"
                                    className="w-10 h-10 object-cover rounded-md border border-[#DCE5ED] shrink-0 hover:opacity-85 transition"
                                  />
                                ) : (
                                  <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                                )}
                                <div className="min-w-0">
                                  <span className="text-xs font-bold text-[#183153] truncate block">
                                    {filePreviews["paymentScreenshot"].name}
                                  </span>
                                  <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Receipt Attached &bull; Click to View</span>
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  if (filePreviews["paymentScreenshot"]?.url) {
                                    setLightboxImage({
                                      url: filePreviews["paymentScreenshot"].url,
                                      title: "Official Payment Receipt / Screenshot",
                                    });
                                  }
                                }}
                                className="px-2.5 py-1 text-xs font-bold text-[#356FA8] bg-[#F4F7FA] rounded-md border border-[#DCE5ED] hover:bg-slate-100 flex items-center gap-1 shrink-0 cursor-pointer"
                              >
                                <Eye className="w-3 h-3" />
                                <span>View Receipt</span>
                              </button>
                            </div>
                          ) : (
                            <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                              <span>Receipt pending upload</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        {/* Wizard Footer Navigation */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            disabled={currentStepIndex === 0 || isSubmitting}
            onClick={() => setCurrentStepIndex((i) => i - 1)}
            className="text-xs gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </Button>

          {!isReviewStep ? (
            <Button
              type="button"
              disabled={
                Boolean(uploadingFieldKey) ||
                (currentStepIndex === 0 && !isEmailVerified) ||
                (currentStepIndex === 0 && existingRegistration?.applicationStatus === "APPROVED")
              }
              onClick={handleProceedNext}
              className="bg-[#183153] hover:bg-[#12243d] text-white text-xs font-semibold gap-1.5 px-6 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {uploadingFieldKey ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading File...</span>
                </>
              ) : (
                <>
                  <span>Continue to Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={handleFinalSubmit}
              className="bg-[#183153] hover:bg-[#12243d] text-white text-xs font-black gap-2 px-8 h-10 shadow-md"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Entry...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Submit Official Registration</span>
                </>
              )}
            </Button>
          )}
        </div>
      </Card>

      {/* Lightbox Image Preview Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#DCE5ED] bg-[#F4F7FA]">
              <div className="flex items-center gap-2 min-w-0">
                <ImageIcon className="w-4 h-4 text-[#356FA8] shrink-0" />
                <h4 className="font-bold text-sm text-[#183153] truncate">{lightboxImage.title}</h4>
              </div>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-600 hover:text-black transition-colors cursor-pointer shrink-0"
                aria-label="Close preview"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
            <div className="p-4 sm:p-6 flex items-center justify-center bg-slate-900/5 max-h-[75vh] overflow-auto">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-md"
              />
            </div>
            <div className="px-5 py-3 bg-[#F4F7FA] border-t border-[#DCE5ED] flex items-center justify-between text-xs">
              <span className="text-[#546E7A] text-[11px]">Click outside or press X to close</span>
              {lightboxImage.url && (
                <a
                  href={lightboxImage.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#356FA8] font-bold hover:underline inline-flex items-center gap-1.5"
                >
                  <span>Open Full Resolution</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


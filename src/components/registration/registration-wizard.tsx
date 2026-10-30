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
} from "lucide-react";
import { toast } from "sonner";

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
    } else {
      setOtpError(res.error || "Verification failed");
    }
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
      handleInputChange(fieldKey, data.filename || file.name);
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
      for (const field of currentStep.fields) {
        if (field.required && !["heading", "divider"].includes(field.type)) {
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
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Card className="border-emerald-200 bg-white shadow-xl text-center p-8 overflow-hidden relative">
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold tracking-wide uppercase mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Registration Confirmed</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight mb-2">
            You Are Officially Registered!
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto mb-6">
            Congratulations <strong className="text-black">{answers.fullName}</strong>. Your entry for{" "}
            <strong className="text-black">{form.name}</strong> has been successfully recorded in the event system.
          </p>

          <div className="bg-zinc-50 border-2 border-dashed border-emerald-300 rounded-2xl p-6 max-w-md mx-auto mb-6">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">
              Official Reference Number
            </span>
            <div className="flex items-center justify-center gap-2.5">
              <span className="font-mono text-2xl font-black text-emerald-800 tracking-wider">
                {completedRef}
              </span>
              <button
                type="button"
                onClick={copyRefToClipboard}
                className="p-2 rounded-lg text-emerald-700 hover:bg-emerald-100 bg-emerald-50 border border-emerald-200 transition-colors"
                title="Copy reference"
              >
                {copiedRef ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-zinc-400 mt-2">
              Save or screenshot this official reference number for event check-in and entry verification.
            </p>
          </div>

          {/* Details summary */}
          <div className="p-4 bg-zinc-50 rounded-xl text-left text-xs text-zinc-600 max-w-md mx-auto space-y-2 border border-zinc-200 mb-6">
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
            <div className="flex justify-between items-center py-1">
              <span className="text-zinc-500">Phone:</span>
              <span className="font-mono text-black font-semibold">{answers.phone}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.print()}
              className="text-xs font-semibold h-10 px-5 gap-1.5 border-zinc-300 w-full sm:w-auto"
            >
              <Printer className="w-4 h-4" />
              <span>Print Confirmation</span>
            </Button>
            <a href="/" className="w-full sm:w-auto">
              <Button
                type="button"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-10 px-6 gap-1.5 w-full"
              >
                <span>Return to Home</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      {/* Event Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-zinc-200 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span className="text-xs font-bold text-emerald-800 tracking-wide uppercase">
            Official Registration
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">{form.name}</h1>
        {form.description && (
          <div className="mt-2 max-w-2xl">
            <RichTextView content={form.description} className="text-zinc-600 text-sm" />
          </div>
        )}
        {form.instructions && (
          <div className="mt-4 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <RichTextView content={form.instructions} className="text-zinc-700 text-xs" />
            </div>
          </div>
        )}
      </div>

      {/* Stepper Progress Bar */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3">
          {steps.map((st, i) => (
            <React.Fragment key={st.id}>
              <div className="flex-1">
                <div
                  className={`h-2 rounded-full transition-all ${
                    i < currentStepIndex
                      ? "bg-emerald-600"
                      : i === currentStepIndex
                      ? "bg-emerald-600"
                      : "bg-zinc-200"
                  }`}
                />
                <span
                  className={`text-[11px] font-semibold block mt-1.5 truncate ${
                    i === currentStepIndex ? "text-emerald-800 font-bold" : "text-zinc-500"
                  }`}
                >
                  {i + 1}. {st.title}
                </span>
              </div>
            </React.Fragment>
          ))}
          <div className="flex-1">
            <div
              className={`h-2 rounded-full transition-all ${
                isReviewStep ? "bg-emerald-600" : "bg-zinc-200"
              }`}
            />
            <span
              className={`text-[11px] font-semibold block mt-1.5 truncate ${
                isReviewStep ? "text-emerald-800 font-bold" : "text-zinc-500"
              }`}
            >
              {steps.length + 1}. Review
            </span>
          </div>
        </div>
      </div>

      {/* Main Wizard Form Card */}
      <Card className="border-slate-200 shadow-sm bg-white">
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
              <div className="p-5 rounded-xl border bg-slate-50/70 border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">
                        Email Address Verification
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        A 6-digit one-time code is required before continuing.
                      </p>
                    </div>
                  </div>

                  {isEmailVerified && (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
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
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 gap-1.5"
                      >
                        {isSendingOtp ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Sending Verification Code...</span>
                          </>
                        ) : (
                          <>
                            <Mail className="w-3.5 h-3.5" />
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
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-10 px-4 font-bold"
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
                            className="text-emerald-700 font-semibold hover:underline disabled:text-slate-400 disabled:no-underline"
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
            </div>
          )}

          {/* STEPS 2..N: Dynamic Configured Fields */}
          {!isReviewStep && currentStepIndex > 0 && (
            <div className="space-y-5">
              {currentStep.fields.filter(isFieldVisible).map((field) => (
                <div key={field.id} className="space-y-1.5">
                  {field.type === "heading" ? (
                    <div className="pt-2 border-t border-slate-100">
                      <h3 className="font-extrabold text-base text-slate-900">{field.label}</h3>
                      {field.description && (
                        <p className="text-xs text-slate-500">{field.description}</p>
                      )}
                    </div>
                  ) : field.type === "divider" ? (
                    <hr className="my-4 border-slate-200" />
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
                        <select
                          value={answers[field.fieldKey] || ""}
                          onChange={(e) => handleInputChange(field.fieldKey, e.target.value)}
                          className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm bg-white text-slate-900"
                        >
                          <option value="">{field.placeholder || "Select option..."}</option>
                          {(field.options || []).map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
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
                                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                              />
                              <span className="font-medium">{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      ) : field.type === "checkbox" ? (
                        <label className="flex items-start gap-3 text-sm text-slate-700 cursor-pointer p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                          <input
                            type="checkbox"
                            checked={Boolean(answers[field.fieldKey])}
                            onChange={(e) => handleInputChange(field.fieldKey, e.target.checked)}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-0.5"
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
                                className="flex items-center gap-2.5 text-sm text-zinc-700 cursor-pointer p-2.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors"
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
                                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="font-medium text-xs text-zinc-900">{opt.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      ) : ["image", "video", "file"].includes(field.type) ? (
                        <div className="space-y-2">
                          {filePreviews[field.fieldKey] ? (
                            <div className="bg-zinc-50 p-4 rounded-xl border border-emerald-200 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                                  {field.type === "video" ? (
                                    <Video className="w-5 h-5 text-emerald-600" />
                                  ) : field.type === "file" ? (
                                    <FileCheck className="w-5 h-5 text-emerald-600" />
                                  ) : (
                                    <ImageIcon className="w-5 h-5 text-emerald-600" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-xs text-black truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                                    {filePreviews[field.fieldKey].name}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                    <span className="text-[10px] text-emerald-700 font-bold">
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
                            <div className="border-2 border-dashed border-zinc-200 rounded-xl p-5 text-center hover:border-emerald-500 transition-colors bg-zinc-50/50">
                              <div className="space-y-2.5">
                                {field.type === "video" ? (
                                  <Video className="w-8 h-8 text-emerald-600 mx-auto" />
                                ) : field.type === "file" ? (
                                  <FileUp className="w-8 h-8 text-emerald-600 mx-auto" />
                                ) : (
                                  <ImageIcon className="w-8 h-8 text-emerald-600 mx-auto" />
                                )}
                                <div className="text-xs text-zinc-600">
                                  {uploadingFieldKey === field.fieldKey ? (
                                    <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold py-1">
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      <span>
                                        Uploading {field.type === "video" ? "to Google Drive" : "to server"}...
                                      </span>
                                    </div>
                                  ) : (
                                    <>
                                      <label className="cursor-pointer text-emerald-700 hover:text-emerald-800 font-bold underline">
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
                                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
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
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div className="text-xs text-emerald-900">
                  <span className="font-bold block text-sm">Review Your Information</span>
                  Please review your details carefully. Clicking <strong>&quot;Submit Official Registration&quot;</strong> will finalize your event entry.
                </div>
              </div>

              <div className="space-y-4">
                {/* Step 1 Review Card */}
                <div className="rounded-xl border border-zinc-200 overflow-hidden bg-white">
                  <div className="px-4 py-2.5 bg-zinc-50 border-b border-zinc-200 font-bold text-xs text-black flex items-center justify-between">
                    <span>1. Participant & Contact Information</span>
                    <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
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
                  <div key={st.id} className="rounded-xl border border-zinc-200 overflow-hidden bg-white">
                    <div className="px-4 py-2.5 bg-zinc-50 border-b border-zinc-200 font-bold text-xs text-black flex items-center justify-between">
                      <span>{idx + 2}. {st.title}</span>
                      <span className="text-[10px] text-zinc-400 font-normal">Step {idx + 2} of {steps.length}</span>
                    </div>
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {st.fields
                        .filter((f) => !["heading", "divider"].includes(f.type))
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
                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold max-w-full">
                                    {f.type === "video" ? (
                                      <Video className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    ) : f.type === "file" ? (
                                      <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    ) : (
                                      <ImageIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    )}
                                    <span className="truncate">{preview?.name || String(rawVal)}</span>
                                    {preview?.size && (
                                      <span className="text-[10px] text-emerald-700 font-normal shrink-0">
                                        ({preview.size})
                                      </span>
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
              disabled={Boolean(uploadingFieldKey)}
              onClick={handleProceedNext}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-1.5 px-6 shadow-sm"
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
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black gap-2 px-8 h-10 shadow-md"
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
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Crown,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Upload,
  Calendar,
  Lock,
  User,
  Heart,
  Video,
  FileCheck2,
  HelpCircle,
  QrCode,
  Copy,
  Check,
  Mail,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  initiateMithilaQueenStep1Action,
  verifyMithilaQueenStep1OtpAction,
  saveMithilaQueenDraftAction,
  submitMithilaQueenRegistrationAction,
  submitPaymentDetailsAction,
} from "@/server/actions/mithila-queen-actions";
import { getPublicSiteSettingsAction } from "@/server/actions/site-settings-actions";

export function MithilaQueenWizard() {
  const [step, setStep] = useState(1);
  const totalSteps = 7;

  // Site Settings (from admin CMS)
  const [siteSettings, setSiteSettings] = useState<{
    registrationFee?: number;
    paymentQrCodeUrl?: string | null;
    paymentProviderName?: string | null;
    paymentInstructions?: string | null;
    isRegistrationOpen?: boolean;
    registrationClosingDate?: Date | null;
  } | null>(null);

  useEffect(() => {
    getPublicSiteSettingsAction().then((res) => {
      if (res.success && res.setting) {
        setSiteSettings(res.setting as any);
      }
    });
  }, []);

  // Step 1: Personal Info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [alternatePhone, setAlternatePhone] = useState("");
  const [province, setProvince] = useState("Madhesh Province");
  const [district, setDistrict] = useState("Dhanusha");
  const [municipality, setMunicipality] = useState("Janakpurdham Sub-Metropolitan City");
  const [cityVillage, setCityVillage] = useState("");
  const [currentAddress, setCurrentAddress] = useState("");

  // Step 1 OTP Verification State
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Existing Completed Application Modal Notice
  const [existingNotice, setExistingNotice] = useState<{
    registrationId: string;
    fullName: string;
    status: string;
    paymentStatus: string;
  } | null>(null);

  // Minor Safeguarding detection (< 18)
  const [isMinor, setIsMinor] = useState(false);
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [guardianRelation, setGuardianRelation] = useState("Parent / Mother");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [guardianConsent, setGuardianConsent] = useState(false);

  // Step 2: Profile & Heritage
  const [personalIntro, setPersonalIntro] = useState("");
  const [hobbiesInterests, setHobbiesInterests] = useState("");
  const [talentsSkills, setTalentsSkills] = useState("");
  const [languagesSpoken, setLanguagesSpoken] = useState("Maithili, Nepali, English");
  const [culturalInterests, setCulturalInterests] = useState("");
  const [motivationReason, setMotivationReason] = useState("");
  const [mithilaMeaning, setMithilaMeaning] = useState("");
  const [qualitiesBrought, setQualitiesBrought] = useState("");
  const [educationLevel, setEducationLevel] = useState("+2 / Higher Secondary");
  const [institution, setInstitution] = useState("");
  const [previousExperience, setPreviousExperience] = useState(false);
  const [experienceDetails, setExperienceDetails] = useState("");

  // Step 4: Social Media
  const [instagramHandle, setInstagramHandle] = useState("");
  const [tiktokHandle, setTiktokHandle] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");

  // Step 5: Uploads
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Step 6: Rules & Consents
  const [agreedToRules, setAgreedToRules] = useState(false);
  const [agreedToMedia, setAgreedToMedia] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredId, setRegisteredId] = useState<string | null>(null);

  // Payment Post-Submission State
  const [transactionRef, setTransactionRef] = useState("");
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Minor detection whenever DOB changes
  useEffect(() => {
    if (!dob) {
      setIsMinor(false);
      return;
    }
    const birthDate = new Date(dob);
    if (!isNaN(birthDate.getTime())) {
      const diffMs = Date.now() - birthDate.getTime();
      const ageDate = new Date(diffMs);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);
      setIsMinor(age < 18);
    }
  }, [dob]);

  // Derived full name
  const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");

  // Handle Send OTP
  const handleSendOtp = async () => {
    if (!firstName.trim()) {
      toast.error("Please enter your first name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!phone.trim() || phone.trim().length < 7) {
      toast.error("Please enter a valid mobile number.");
      return;
    }
    if (!dob) {
      toast.error("Please select your date of birth.");
      return;
    }
    if (!province.trim() || !district.trim() || !municipality.trim()) {
      toast.error("Please fill in your administrative location.");
      return;
    }

    setIsSendingOtp(true);
    const res = await initiateMithilaQueenStep1Action({
      firstName,
      lastName,
      email,
      phone,
    });
    setIsSendingOtp(false);

    if (res.success && res.verificationId) {
      setVerificationId(res.verificationId);
      setOtpSent(true);
      setResendCooldown(60);
      toast.success("A 6-digit verification code was sent to your email!");
    } else {
      toast.error(res.error || "Failed to send verification code.");
    }
  };

  // Handle Verify OTP & Resume
  const handleVerifyOtp = async () => {
    if (!verificationId || !otpCode || otpCode.trim().length !== 6) {
      toast.error("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsVerifyingOtp(true);
    const res = await verifyMithilaQueenStep1OtpAction({
      verificationId,
      code: otpCode.trim(),
      email,
      firstName,
      lastName,
      phone,
    });
    setIsVerifyingOtp(false);

    if (res.success && res.sessionToken) {
      setSessionToken(res.sessionToken);
      setIsEmailVerified(true);

      // 1. Existing Completed Registration Check
      if (res.isExisting && res.isCompleted) {
        setExistingNotice({
          registrationId: res.registrationId || "",
          fullName: res.fullName || fullName,
          status: res.applicationStatus || "SUBMITTED",
          paymentStatus: res.paymentStatus || "PENDING",
        });
        toast.info("Existing completed application identified.");
        return;
      }

      // 2. Existing In-Progress Draft: Restore answers & resume
      if (res.isExisting && !res.isCompleted && res.draftData) {
        const d = res.draftData;
        if (d.fullName) {
          const parts = d.fullName.split(" ");
          setFirstName(parts[0] || "");
          setLastName(parts.slice(1).join(" ") || "");
        }
        if (d.dob) setDob(d.dob);
        if (d.phone) setPhone(d.phone);
        if (d.alternatePhone) setAlternatePhone(d.alternatePhone);
        if (d.province) setProvince(d.province);
        if (d.district) setDistrict(d.district);
        if (d.municipality) setMunicipality(d.municipality);
        if (d.cityVillage) setCityVillage(d.cityVillage);
        if (d.currentAddress) setCurrentAddress(d.currentAddress);

        if (d.guardianName) setGuardianName(d.guardianName);
        if (d.guardianPhone) setGuardianPhone(d.guardianPhone);
        if (d.guardianRelation) setGuardianRelation(d.guardianRelation);
        if (d.guardianEmail) setGuardianEmail(d.guardianEmail);
        if (d.guardianConsent !== undefined) setGuardianConsent(d.guardianConsent);

        if (d.personalIntro) setPersonalIntro(d.personalIntro);
        if (d.hobbiesInterests) setHobbiesInterests(d.hobbiesInterests);
        if (d.talentsSkills) setTalentsSkills(d.talentsSkills);
        if (d.languagesSpoken) setLanguagesSpoken(d.languagesSpoken);
        if (d.culturalInterests) setCulturalInterests(d.culturalInterests);
        if (d.motivationReason) setMotivationReason(d.motivationReason);
        if (d.mithilaMeaning) setMithilaMeaning(d.mithilaMeaning);
        if (d.qualitiesBrought) setQualitiesBrought(d.qualitiesBrought);
        if (d.educationLevel) setEducationLevel(d.educationLevel);
        if (d.institution) setInstitution(d.institution);
        if (d.previousExperience !== undefined) setPreviousExperience(d.previousExperience);
        if (d.experienceDetails) setExperienceDetails(d.experienceDetails);

        if (d.instagramHandle) setInstagramHandle(d.instagramHandle);
        if (d.tiktokHandle) setTiktokHandle(d.tiktokHandle);
        if (d.facebookUrl) setFacebookUrl(d.facebookUrl);
        if (d.profilePhotoUrl) setProfilePhotoUrl(d.profilePhotoUrl);

        toast.success("Welcome back! Your saved application draft has been restored.");
        setStep(res.resumeStep || 2);
        window.scrollTo({ top: 80, behavior: "smooth" });
        return;
      }

      // 3. Brand New Participant
      toast.success("Email verified successfully! You may now proceed.");
      setStep(2);
      window.scrollTo({ top: 80, behavior: "smooth" });
    } else {
      toast.error(res.error || "Verification failed. Please check the code.");
    }
  };

  // Handle Photo Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (JPG, PNG, WEBP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit.");
      return;
    }

    setIsUploadingPhoto(true);
    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/public/upload/image", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setProfilePhotoUrl(data.url);
        toast.success("Profile photo uploaded successfully!");
      } else {
        toast.error(data.error || "Failed to upload photo.");
      }
    } catch {
      toast.error("Upload network error.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Step Navigation & Auto-Save
  const handleNextStep = async () => {
    if (step === 1) {
      if (!isEmailVerified) {
        toast.error("Please complete the email OTP verification before continuing.");
        return;
      }
      if (!fullName.trim() || fullName.trim().length < 2) {
        toast.error("Please enter your full legal name.");
        return;
      }
      if (!dob) {
        toast.error("Please enter your date of birth.");
        return;
      }
      if (!phone.trim() || phone.trim().length < 7) {
        toast.error("Please enter a valid phone number.");
        return;
      }
      if (!province.trim() || !district.trim() || !municipality.trim() || !cityVillage.trim() || !currentAddress.trim()) {
        toast.error("Please fill in your complete location address.");
        return;
      }
    }

    if (step === 2) {
      if (!motivationReason.trim()) {
        toast.error("Please provide a brief reason why you want to participate in Mithila Queen.");
        return;
      }
    }

    if (step === 4) {
      const hasSocial = Boolean(instagramHandle.trim() || tiktokHandle.trim() || facebookUrl.trim());
      if (!hasSocial) {
        toast.error("Please provide at least one social media account (Instagram, TikTok, or Facebook) for video audition review.");
        return;
      }
    }

    if (step === 6) {
      if (!agreedToRules) {
        toast.error("You must accept the official competition rules.");
        return;
      }
      if (!agreedToPrivacy) {
        toast.error("You must accept the data privacy terms.");
        return;
      }
      if (isMinor) {
        if (!guardianName.trim() || !guardianPhone.trim() || !guardianRelation.trim()) {
          toast.error("Parent/legal guardian full name, relationship, and phone number are strictly required for minors.");
          return;
        }
        if (!guardianConsent) {
          toast.error("Parent/legal guardian consent checkbox must be confirmed.");
          return;
        }
      }
    }

    const nextStep = Math.min(step + 1, totalSteps);
    setStep(nextStep);
    window.scrollTo({ top: 80, behavior: "smooth" });

    // Non-blocking draft auto-save
    if (sessionToken && email) {
      saveMithilaQueenDraftAction({
        sessionToken,
        email,
        step: nextStep,
        formData: {
          fullName,
          dob,
          phone,
          alternatePhone,
          province,
          district,
          municipality,
          cityVillage,
          currentAddress,
          guardianName,
          guardianPhone,
          guardianRelation,
          guardianEmail,
          guardianConsent,
          personalIntro,
          hobbiesInterests,
          talentsSkills,
          languagesSpoken,
          culturalInterests,
          motivationReason,
          mithilaMeaning,
          qualitiesBrought,
          educationLevel,
          institution,
          previousExperience,
          experienceDetails,
          instagramHandle,
          tiktokHandle,
          facebookUrl,
          profilePhotoUrl,
        },
      }).catch((err) => console.error("Draft auto-save error:", err));
    }
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 80, behavior: "smooth" });
  };

  // Submit Final Registration (Step 7)
  const handleSubmitRegistration = async () => {
    setIsSubmitting(true);
    const res = await submitMithilaQueenRegistrationAction({
      sessionToken: sessionToken || undefined,
      fullName,
      dob,
      email,
      phone,
      alternatePhone,
      province,
      district,
      municipality,
      cityVillage,
      currentAddress,

      guardianName: isMinor ? guardianName : undefined,
      guardianPhone: isMinor ? guardianPhone : undefined,
      guardianRelation: isMinor ? guardianRelation : undefined,
      guardianEmail: isMinor ? guardianEmail : undefined,
      guardianConsent: isMinor ? guardianConsent : undefined,

      personalIntro,
      hobbiesInterests,
      talentsSkills,
      languagesSpoken,
      culturalInterests,
      motivationReason,
      mithilaMeaning,
      qualitiesBrought,
      educationLevel,
      institution,
      previousExperience,
      experienceDetails,

      instagramHandle,
      tiktokHandle,
      facebookUrl,
      profilePhotoUrl,

      agreedToRules,
      agreedToMedia,
      agreedToPrivacy,
    });
    setIsSubmitting(false);

    if (res.success && res.registrationId) {
      setRegisteredId(res.registrationId);
      toast.success("Application successfully registered!");
      window.scrollTo({ top: 80, behavior: "smooth" });
    } else {
      toast.error(res.error || "Failed to submit application.");
    }
  };

  // Submit Payment Transaction Details
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registeredId) return;

    if (!transactionRef.trim()) {
      toast.error("Please enter your transaction reference number.");
      return;
    }

    setIsSubmittingPayment(true);
    const res = await submitPaymentDetailsAction({
      registrationId: registeredId,
      transactionReference: transactionRef.trim(),
    });
    setIsSubmittingPayment(false);

    if (res.success) {
      setPaymentSuccess(true);
      toast.success("Payment details submitted! Status is now Payment Under Review.");
    } else {
      toast.error(res.error || "Failed to submit payment details.");
    }
  };

  // Copy Registration ID
  const copyRegId = () => {
    if (registeredId) {
      navigator.clipboard.writeText(registeredId);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
      toast.success("Registration ID copied to clipboard!");
    }
  };

  // ==========================================
  // EXISTING COMPLETED APPLICATION MODAL
  // ==========================================
  if (existingNotice) {
    return (
      <div className="max-w-xl mx-auto p-8 rounded-lg bg-white border border-[#E8DFD0] shadow-sm space-y-6 text-center">
        <div className="w-14 h-14 rounded-full bg-[#FAF5EE] text-[#B69A65] mx-auto flex items-center justify-center border border-[#B69A65]">
          <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#B69A65]">
            Existing Registration Found
          </span>
          <h2 className="text-2xl font-serif font-extrabold text-[#292821]">
            Application Already Submitted
          </h2>
          <p className="text-xs text-[#3C332A] max-w-md mx-auto leading-relaxed">
            An application for <strong>{existingNotice.fullName}</strong> is already registered under <strong>{email}</strong>.
          </p>
        </div>

        <div className="p-4 rounded-md bg-[#FAF5EE] border border-[#E8DFD0] space-y-2 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-[#E8DFD0]">
            <span className="text-zinc-500 font-medium">Registration ID:</span>
            <span className="font-mono font-bold text-[#292821] text-sm">{existingNotice.registrationId}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-[#E8DFD0]">
            <span className="text-zinc-500 font-medium">Application Status:</span>
            <span className="font-bold text-[#292821] uppercase text-[11px]">{existingNotice.status}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-zinc-500 font-medium">Payment Status:</span>
            <span className="font-bold text-[#292821] uppercase text-[11px]">{existingNotice.paymentStatus}</span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={`/registration-status?ref=${encodeURIComponent(existingNotice.registrationId)}`} className="w-full sm:w-auto">
            <Button className="w-full bg-[#B69A65] hover:bg-[#a68c5b] text-[#292821] font-bold text-xs h-10 px-6 gap-2">
              <span>View Application Status</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => {
              setExistingNotice(null);
              setIsEmailVerified(false);
              setOtpSent(false);
              setOtpCode("");
            }}
            className="w-full sm:w-auto border-[#E8DFD0] text-[#292821] text-xs h-10"
          >
            Use a Different Email
          </Button>
        </div>
      </div>
    );
  }

  // ==========================================
  // POST-SUBMISSION PAYMENT SCREEN
  // ==========================================
  if (registeredId) {
    const fee = siteSettings?.registrationFee || 399;
    const qrUrl = siteSettings?.paymentQrCodeUrl || "/assets/brand/origin-foundation-qr.png";
    const providerName = siteSettings?.paymentProviderName || "eSewa / Fonepay / Bank Transfer";
    const instructions = siteSettings?.paymentInstructions || "Please scan the official QR code to complete the fee payment. Enter the transaction reference code below and submit for verification.";

    return (
      <div className="max-w-2xl mx-auto p-6 sm:p-10 rounded-lg bg-white border border-[#E8DFD0] shadow-xs space-y-8">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-md bg-[#292821] text-[#B69A65] mx-auto flex items-center justify-center border border-[#B69A65]/50 shadow-xs">
            <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#B69A65]">
            Application Successfully Saved
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#292821] font-serif">
            Mithila Queen Registration
          </h2>
          <p className="text-xs text-[#3C332A] max-w-md mx-auto leading-relaxed">
            Your personal information and profile have been securely stored. Please complete the verified payment step below to submit for administrative review.
          </p>
        </div>

        {/* Registration ID Banner */}
        <div className="p-5 rounded-md bg-[#FAF5EE] border border-[#B69A65] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">
              Your Unique Registration ID
            </span>
            <span className="text-xl font-extrabold font-mono text-[#292821] tracking-wide">
              {registeredId}
            </span>
          </div>
          <Button
            size="sm"
            onClick={copyRegId}
            variant="outline"
            className="border-[#B69A65] text-[#292821] hover:bg-[#E8DFD0]/50 gap-1.5 text-xs font-semibold"
          >
            {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedRef ? "Copied" : "Copy ID"}</span>
          </Button>
        </div>

        {paymentSuccess ? (
          <div className="p-6 rounded-md bg-[#FAF5EE] border border-amber-300 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 mx-auto flex items-center justify-center">
              <Check className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h4 className="font-bold text-[#292821] text-base">Payment Details Submitted</h4>
            <p className="text-xs text-[#3C332A] max-w-md mx-auto leading-relaxed">
              Your transaction reference (<strong>{transactionRef}</strong>) has been recorded. Our finance desk will verify your payment against official bank records. You will receive an email confirmation once verified.
            </p>
            <div className="pt-2">
              <Link href={`/registration-status?ref=${encodeURIComponent(registeredId)}`}>
                <Button className="bg-[#292821] text-[#FAF5EE] hover:bg-[#3C332A] text-xs font-bold h-10 px-6 gap-2">
                  <span>Track Application Status</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#B69A65]" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Payment Instructions & QR Form */
          <div className="space-y-6 pt-2 border-t border-[#E8DFD0]">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#B69A65]">
                Payment Amount: NPR {fee}
              </span>
              <h3 className="text-lg font-bold text-[#292821] font-serif">
                Official Payment QR Code
              </h3>
              <p className="text-xs text-[#3C332A] max-w-sm mx-auto">
                Scan using eSewa, Khalti, or any Fonepay / Mobile Banking app to pay the NPR {fee} registration fee.
              </p>
            </div>

            {/* QR Container */}
            <div className="w-64 mx-auto bg-white border-2 border-dashed border-[#B69A65] rounded-lg p-5 flex flex-col items-center justify-center text-center shadow-xs">
              <div className="w-48 h-48 relative bg-white flex items-center justify-center overflow-hidden rounded-md border border-[#E8DFD0]">
                {qrUrl.startsWith("http") || qrUrl.startsWith("/") ? (
                  <img
                    src={qrUrl}
                    alt="Official Payment QR"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <QrCode className="w-28 h-28 text-[#292821] opacity-90" />
                )}
              </div>
              <span className="text-[12px] font-bold text-[#292821] font-mono mt-3">
                The Origin Foundation
              </span>
              <span className="text-[10px] text-zinc-500 mt-0.5">
                NPR {fee} • {providerName}
              </span>
            </div>

            <p className="text-[11px] text-center text-zinc-500 italic max-w-md mx-auto">
              * Note: Screenshots are independently cross-checked with official banking statements before approval.
            </p>

            {/* Transaction Reference Submission Form */}
            <form onSubmit={handlePaymentSubmit} className="space-y-4 pt-4 border-t border-[#E8DFD0]">
              <div className="space-y-1.5">
                <Label htmlFor="txnRef" required className="text-xs font-bold text-[#292821]">
                  Transaction Reference / UTR Number
                </Label>
                <Input
                  id="txnRef"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="e.g. 981200546872 or Fonepay Txn ID"
                  required
                  className="h-10 text-sm border-[#E8DFD0] bg-white font-mono"
                />
                <p className="text-[11px] text-[#3C332A]">
                  Enter the exact transaction reference shown in your banking or wallet receipt.
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSubmittingPayment}
                className="w-full bg-[#B69A65] hover:bg-[#a68c5b] text-[#292821] font-bold text-xs h-11 rounded-md shadow-xs gap-2"
              >
                {isSubmittingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Payment Details...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Payment Details for Verification</span>
                  </>
                )}
              </Button>
            </form>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // 7-STEP REGISTRATION WIZARD
  // ==========================================
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Step Indicator Header */}
      <div className="p-6 rounded-lg bg-white border border-[#E8DFD0] shadow-xs space-y-4">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-[#292821] text-[#B69A65] font-bold flex items-center justify-center text-xs">
              {step}
            </span>
            <span className="font-bold text-[#292821] font-serif">
              Step {step} of {totalSteps}:{" "}
              {step === 1 && "Personal Information & Email Verification"}
              {step === 2 && "Profile & Cultural Interests"}
              {step === 3 && "Additional Details"}
              {step === 4 && "Social Media Profiles"}
              {step === 5 && "Photo & Media Upload"}
              {step === 6 && "Rules & Minor Safeguarding"}
              {step === 7 && "Review & Submit"}
            </span>
          </div>
          <span className="font-mono text-zinc-500 font-semibold text-[11px]">
            Fee: NPR {siteSettings?.registrationFee || 399}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-[#E8DFD0]/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#B69A65] transition-all duration-300 ease-out"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Wizard Form Card */}
      <div className="p-8 sm:p-10 rounded-lg bg-white border border-[#E8DFD0] shadow-xs space-y-6">
        {/* STEP 1: PERSONAL INFORMATION & EMAIL VERIFICATION */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="border-b border-[#E8DFD0] pb-3">
              <h2 className="text-xl font-bold font-serif text-[#292821]">
                1. Personal Information & Email Verification
              </h2>
              <p className="text-xs text-[#3C332A] mt-1">
                Enter your legal name, contact details, and verify your email address to begin your application.
              </p>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" required className="text-xs font-bold text-[#292821]">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Anjali"
                  required
                  className="h-10 text-xs border-[#E8DFD0]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lastName" required className="text-xs font-bold text-[#292821]">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Jha"
                  required
                  className="h-10 text-xs border-[#E8DFD0]"
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" required className="text-xs font-bold text-[#292821]">
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setIsEmailVerified(false);
                      setOtpSent(false);
                      setOtpCode("");
                    }}
                    placeholder="anjali@example.com"
                    required
                    disabled={isEmailVerified}
                    className={`h-10 text-xs border-[#E8DFD0] ${isEmailVerified ? "bg-emerald-50/50 pr-8" : ""}`}
                  />
                  {isEmailVerified && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-2.5 top-3" />
                  )}
                </div>
                {isEmailVerified && (
                  <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Email verified via 6-digit OTP</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" required className="text-xs font-bold text-[#292821]">
                  Mobile Phone Number
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9812000000"
                  required
                  className="h-10 text-xs border-[#E8DFD0]"
                />
              </div>
            </div>

            {/* DOB & Alternate Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="dob" required className="text-xs font-bold text-[#292821]">
                  Date of Birth
                </Label>
                <Input
                  id="dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                  className="h-10 text-xs border-[#E8DFD0]"
                />
                {isMinor && (
                  <p className="text-[11px] text-[#A64B36] font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#A64B36]" />
                    <span>Minor participant detected (&lt;18). Guardian consent required in Step 6.</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="altPhone" className="text-xs font-bold text-[#292821]">
                  Alternate Phone Number (Optional)
                </Label>
                <Input
                  id="altPhone"
                  value={alternatePhone}
                  onChange={(e) => setAlternatePhone(e.target.value)}
                  placeholder="e.g. Family contact number"
                  className="h-10 text-xs border-[#E8DFD0]"
                />
              </div>
            </div>

            {/* Administrative Location */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="province" required className="text-xs font-bold text-[#292821]">
                  Province
                </Label>
                <Input
                  id="province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  required
                  className="h-10 text-xs border-[#E8DFD0]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="district" required className="text-xs font-bold text-[#292821]">
                  District
                </Label>
                <Input
                  id="district"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  required
                  className="h-10 text-xs border-[#E8DFD0]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="municipality" required className="text-xs font-bold text-[#292821]">
                  Municipality / Rural Mun.
                </Label>
                <Input
                  id="municipality"
                  value={municipality}
                  onChange={(e) => setMunicipality(e.target.value)}
                  required
                  className="h-10 text-xs border-[#E8DFD0]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cityVillage" required className="text-xs font-bold text-[#292821]">
                  City, Town or Village
                </Label>
                <Input
                  id="cityVillage"
                  value={cityVillage}
                  onChange={(e) => setCityVillage(e.target.value)}
                  placeholder="e.g. Ramanand Chowk / Janakpur"
                  required
                  className="h-10 text-xs border-[#E8DFD0]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address" required className="text-xs font-bold text-[#292821]">
                  Current Street Address
                </Label>
                <Input
                  id="address"
                  value={currentAddress}
                  onChange={(e) => setCurrentAddress(e.target.value)}
                  placeholder="Ward No. & Street Details"
                  required
                  className="h-10 text-xs border-[#E8DFD0]"
                />
              </div>
            </div>

            {/* MANDATORY EMAIL OTP VERIFICATION BOX */}
            <div className="p-5 rounded-lg bg-[#FAF5EE] border border-[#B69A65]/60 space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#B69A65]" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#292821]">
                  Mandatory Email OTP Verification
                </h3>
              </div>

              {!isEmailVerified ? (
                <div className="space-y-3">
                  <p className="text-xs text-[#3C332A] leading-relaxed">
                    To prevent automated submissions and securely save your progress, we verify your email address via a one-time 6-digit code.
                  </p>

                  {!otpSent ? (
                    <Button
                      type="button"
                      disabled={isSendingOtp}
                      onClick={handleSendOtp}
                      className="bg-[#292821] hover:bg-[#3C332A] text-[#FAF5EE] text-xs font-bold h-10 px-6 rounded-md shadow-xs gap-2"
                    >
                      {isSendingOtp ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending 6-Digit Code...</span>
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 text-[#B69A65]" />
                          <span>Send 6-Digit Verification Code</span>
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-3 pt-2 border-t border-[#E8DFD0]">
                      <p className="text-xs text-[#3C332A]">
                        We sent a 6-digit code to <strong className="font-mono text-[#292821]">{email}</strong>. Please enter it below:
                      </p>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <Input
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          placeholder="6-digit code"
                          maxLength={6}
                          className="h-10 w-full sm:w-48 text-center text-lg font-mono font-bold tracking-widest border-[#B69A65] bg-white"
                        />
                        <Button
                          type="button"
                          disabled={isVerifyingOtp || otpCode.length !== 6}
                          onClick={handleVerifyOtp}
                          className="bg-[#B69A65] hover:bg-[#a68c5b] text-[#292821] text-xs font-bold h-10 px-6 rounded-md shadow-xs gap-2"
                        >
                          {isVerifyingOtp ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Verifying...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Verify & Continue</span>
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={resendCooldown > 0 || isSendingOtp}
                          onClick={handleSendOtp}
                          className="text-xs text-zinc-600 hover:text-[#292821] h-10 px-3 gap-1"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold bg-emerald-50 p-3 rounded-md border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Your email address ({email}) is verified! You may advance to the next steps.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: PARTICIPANT PROFILE */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="border-b border-[#E8DFD0] pb-3">
              <h2 className="text-xl font-bold font-serif text-[#292821]">
                2. Participant Profile & Cultural Heritage
              </h2>
              <p className="text-xs text-[#3C332A] mt-1">
                Share your personal interests, artistic skills, and connection to Mithila.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="motivation" required className="text-xs font-bold text-[#292821]">
                Why do you want to participate in Mithila Queen?
              </Label>
              <Textarea
                id="motivation"
                value={motivationReason}
                onChange={(e) => setMotivationReason(e.target.value)}
                placeholder="What inspired you to join this cultural competition?"
                rows={3}
                required
                className="text-xs border-[#E8DFD0] resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mithilaMeaning" className="text-xs font-bold text-[#292821]">
                What does Mithila&apos;s cultural heritage mean to you?
              </Label>
              <Textarea
                id="mithilaMeaning"
                value={mithilaMeaning}
                onChange={(e) => setMithilaMeaning(e.target.value)}
                placeholder="Share your thoughts on Mithila art, traditions, or values..."
                rows={3}
                className="text-xs border-[#E8DFD0] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="talents" className="text-xs font-bold text-[#292821]">
                  Talents & Skills
                </Label>
                <Input
                  id="talents"
                  value={talentsSkills}
                  onChange={(e) => setTalentsSkills(e.target.value)}
                  placeholder="e.g. Mithila Painting, Singing, Public Speaking"
                  className="h-10 text-xs border-[#E8DFD0]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="languages" className="text-xs font-bold text-[#292821]">
                  Languages Spoken
                </Label>
                <Input
                  id="languages"
                  value={languagesSpoken}
                  onChange={(e) => setLanguagesSpoken(e.target.value)}
                  placeholder="e.g. Maithili, Nepali, Hindi, English"
                  className="h-10 text-xs border-[#E8DFD0]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="education" className="text-xs font-bold text-[#292821]">
                  Current Education Level (Voluntary)
                </Label>
                <Input
                  id="education"
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  placeholder="e.g. Bachelor's Degree"
                  className="h-10 text-xs border-[#E8DFD0]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="institution" className="text-xs font-bold text-[#292821]">
                  School / College (Voluntary)
                </Label>
                <Input
                  id="institution"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. Janakpur Higher Secondary"
                  className="h-10 text-xs border-[#E8DFD0]"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: ADDITIONAL DETAILS */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="border-b border-[#E8DFD0] pb-3">
              <h2 className="text-xl font-bold font-serif text-[#292821]">
                3. Additional Details & Aspirations
              </h2>
              <p className="text-xs text-[#3C332A] mt-1">
                Tell the selection committee about your background and interests.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="personalIntro" className="text-xs font-bold text-[#292821]">
                Brief Personal Introduction
              </Label>
              <Textarea
                id="personalIntro"
                value={personalIntro}
                onChange={(e) => setPersonalIntro(e.target.value)}
                placeholder="Introduce yourself in 2-3 sentences..."
                rows={3}
                className="text-xs border-[#E8DFD0] resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="qualities" className="text-xs font-bold text-[#292821]">
                What qualities make you a proud representative of Mithila?
              </Label>
              <Textarea
                id="qualities"
                value={qualitiesBrought}
                onChange={(e) => setQualitiesBrought(e.target.value)}
                placeholder="Confidence, cultural knowledge, community leadership..."
                rows={3}
                className="text-xs border-[#E8DFD0] resize-none"
              />
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={previousExperience}
                  onChange={(e) => setPreviousExperience(e.target.checked)}
                  className="w-4 h-4 rounded text-[#292821] focus:ring-[#B69A65]"
                />
                <span className="text-xs text-[#292821] font-medium">
                  Have you previously participated in any cultural, talent, or public events?
                </span>
              </label>

              {previousExperience && (
                <div className="space-y-1.5 pl-6">
                  <Label htmlFor="experienceDetails" className="text-xs font-bold text-[#292821]">
                    Event Details (Optional)
                  </Label>
                  <Input
                    id="experienceDetails"
                    value={experienceDetails}
                    onChange={(e) => setExperienceDetails(e.target.value)}
                    placeholder="e.g. School debate, cultural festival 2024"
                    className="h-10 text-xs border-[#E8DFD0]"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: SOCIAL MEDIA */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="border-b border-[#E8DFD0] pb-3">
              <h2 className="text-xl font-bold font-serif text-[#292821]">
                4. Social Media Profiles & Audition Channels
              </h2>
              <p className="text-xs text-[#3C332A] mt-1">
                Provide at least one active profile for our organizers to review your talent or video submissions.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="instagram" className="text-xs font-bold text-[#292821]">
                  Instagram Username
                </Label>
                <div className="flex rounded-md shadow-xs">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-[#E8DFD0] bg-[#FAF5EE] text-zinc-500 text-xs">
                    @
                  </span>
                  <Input
                    id="instagram"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value.replace(/^@/, ""))}
                    placeholder="username"
                    className="h-10 text-xs border-[#E8DFD0] rounded-l-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tiktok" className="text-xs font-bold text-[#292821]">
                  TikTok Username
                </Label>
                <div className="flex rounded-md shadow-xs">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-[#E8DFD0] bg-[#FAF5EE] text-zinc-500 text-xs">
                    @
                  </span>
                  <Input
                    id="tiktok"
                    value={tiktokHandle}
                    onChange={(e) => setTiktokHandle(e.target.value.replace(/^@/, ""))}
                    placeholder="username"
                    className="h-10 text-xs border-[#E8DFD0] rounded-l-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="facebook" className="text-xs font-bold text-[#292821]">
                  Facebook Profile Link
                </Label>
                <Input
                  id="facebook"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="https://facebook.com/yourprofile"
                  className="h-10 text-xs border-[#E8DFD0]"
                />
              </div>

              <div className="p-4 rounded-md bg-[#FAF5EE] border border-[#E8DFD0] text-xs text-[#3C332A] space-y-1.5">
                <p className="font-bold text-[#292821]">Direct WhatsApp Video Submissions:</p>
                <p className="text-[11px] leading-relaxed">
                  You can also submit your 1-minute cultural introduction video directly to our organizing desk via WhatsApp at <strong>+977 9704571941</strong> quoting your Registration ID.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: PHOTO UPLOAD */}
        {step === 5 && (
          <div className="space-y-5">
            <div className="border-b border-[#E8DFD0] pb-3">
              <h2 className="text-xl font-bold font-serif text-[#292821]">
                5. Participant Photograph
              </h2>
              <p className="text-xs text-[#3C332A] mt-1">
                Upload a clear portrait or passport-style photograph for your competition dossier and official PDF confirmation.
              </p>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-[#E8DFD0] rounded-lg p-6 text-center hover:border-[#B69A65] transition-colors bg-[#FAF5EE]/30">
                {profilePhotoUrl ? (
                  <div className="space-y-3">
                    <div className="w-32 h-40 mx-auto rounded-md overflow-hidden border border-[#E8DFD0] relative bg-white shadow-xs">
                      <img
                        src={profilePhotoUrl}
                        alt="Participant portrait"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <label className="cursor-pointer text-xs font-bold text-[#B69A65] hover:underline block">
                      <span>Change photograph</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <label className="cursor-pointer block space-y-2">
                    <div className="w-12 h-12 rounded-full bg-[#FAF5EE] text-[#B69A65] mx-auto flex items-center justify-center border border-[#B69A65]/40">
                      {isUploadingPhoto ? (
                        <Loader2 className="w-6 h-6 animate-spin text-[#B69A65]" />
                      ) : (
                        <Upload className="w-6 h-6" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-[#292821] block">
                      {isUploadingPhoto ? "Uploading photograph..." : "Click to upload recent portrait"}
                    </span>
                    <span className="text-[11px] text-zinc-500 block">
                      JPG, PNG, or WEBP up to 10MB
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingPhoto}
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: RULES & MINOR SAFEGUARDING */}
        {step === 6 && (
          <div className="space-y-6">
            <div className="border-b border-[#E8DFD0] pb-3">
              <h2 className="text-xl font-bold font-serif text-[#292821]">
                6. Rules, Safeguarding & Legal Consents
              </h2>
              <p className="text-xs text-[#3C332A] mt-1">
                Please review and accept our institutional policies and safeguarding commitments.
              </p>
            </div>

            {/* Minor Safeguarding section if < 18 */}
            {isMinor && (
              <div className="p-5 rounded-lg bg-amber-50/70 border border-amber-300 space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-800" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                    Minor Safeguarding Policy (Required for Participants Under 18)
                  </h3>
                </div>
                <p className="text-xs text-amber-950 leading-relaxed">
                  As the participant is under 18 years of age, verified parental or legal guardian authorization is strictly required by The Origin Foundation before advancing to audition reviews.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="guardianName" required className="text-[11px] font-bold text-amber-950">
                      Parent / Guardian Full Name
                    </Label>
                    <Input
                      id="guardianName"
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      placeholder="e.g. Ramesh Chandra Jha"
                      required
                      className="h-9 text-xs border-amber-300 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="guardianRelation" required className="text-[11px] font-bold text-amber-950">
                      Relationship
                    </Label>
                    <Input
                      id="guardianRelation"
                      value={guardianRelation}
                      onChange={(e) => setGuardianRelation(e.target.value)}
                      placeholder="e.g. Mother / Father / Guardian"
                      required
                      className="h-9 text-xs border-amber-300 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="guardianPhone" required className="text-[11px] font-bold text-amber-950">
                      Guardian Phone Number
                    </Label>
                    <Input
                      id="guardianPhone"
                      value={guardianPhone}
                      onChange={(e) => setGuardianPhone(e.target.value)}
                      placeholder="e.g. 9841000000"
                      required
                      className="h-9 text-xs border-amber-300 bg-white"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-200">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={guardianConsent}
                      onChange={(e) => setGuardianConsent(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-700 focus:ring-amber-500 mt-0.5"
                    />
                    <span className="text-xs text-amber-950 font-semibold leading-relaxed">
                      As the parent or legal guardian, I formally give permission for this minor to participate in Mithila Queen and agree to the competition rules and data safeguarding terms.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* General Consents */}
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer p-3 rounded-md bg-[#FAF5EE] border border-[#E8DFD0]">
                <input
                  type="checkbox"
                  checked={agreedToRules}
                  onChange={(e) => setAgreedToRules(e.target.checked)}
                  className="w-4 h-4 rounded text-[#292821] focus:ring-[#B69A65] mt-0.5"
                />
                <span className="text-xs text-[#292821] leading-relaxed">
                  I agree to the official <strong>Competition Rules & Eligibility</strong>. I confirm that I am a female participant and that all submitted details are authentic.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer p-3 rounded-md bg-[#FAF5EE] border border-[#E8DFD0]">
                <input
                  type="checkbox"
                  checked={agreedToPrivacy}
                  onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                  className="w-4 h-4 rounded text-[#292821] focus:ring-[#B69A65] mt-0.5"
                />
                <span className="text-xs text-[#292821] leading-relaxed">
                  I accept the <strong>Privacy Policy</strong> and agree that my personal data will be used strictly for competition adjudication and independent payment auditing.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer p-3 rounded-md bg-[#FAF5EE] border border-[#E8DFD0]">
                <input
                  type="checkbox"
                  checked={agreedToMedia}
                  onChange={(e) => setAgreedToMedia(e.target.checked)}
                  className="w-4 h-4 rounded text-[#292821] focus:ring-[#B69A65] mt-0.5"
                />
                <span className="text-xs text-[#292821] leading-relaxed">
                  (Optional) I grant permission for submitted audition videos and event photos to be respectfully shared for official Mithila cultural promotion.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* STEP 7: REVIEW & SUBMIT */}
        {step === 7 && (
          <div className="space-y-6">
            <div className="border-b border-[#E8DFD0] pb-3">
              <h2 className="text-xl font-bold font-serif text-[#292821]">
                7. Review Application Details
              </h2>
              <p className="text-xs text-[#3C332A] mt-1">
                Please double-check your registration details before confirming submission.
              </p>
            </div>

            <div className="p-5 rounded-md bg-[#FAF5EE] border border-[#E8DFD0] space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-zinc-500 font-medium">Participant Name:</span>
                <span className="font-bold text-[#292821]">{fullName}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-zinc-500 font-medium">Date of Birth:</span>
                <span className="font-bold text-[#292821]">{dob} {isMinor ? "(Minor < 18)" : ""}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-zinc-500 font-medium">Verified Email:</span>
                <span className="font-bold text-[#292821] font-mono">{email}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-zinc-500 font-medium">Phone:</span>
                <span className="font-bold text-[#292821] font-mono">{phone}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-zinc-500 font-medium">Location:</span>
                <span className="font-bold text-[#292821]">{cityVillage}, {district}, {province}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-zinc-500 font-medium">Registration Fee:</span>
                <span className="font-bold text-[#292821]">NPR {siteSettings?.registrationFee || 399}</span>
              </div>
              {isMinor && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E8DFD0]">
                  <span className="text-zinc-500 font-medium">Legal Guardian:</span>
                  <span className="font-bold text-[#292821]">{guardianName} ({guardianRelation})</span>
                </div>
              )}
            </div>

            <div className="p-4 rounded-md bg-[#292821]/10 border border-[#292821]/20 text-xs text-[#292821]">
              <p className="font-bold">Next Step After Clicking Submit:</p>
              <p className="text-[11px] text-[#3C332A] mt-1">
                You will be assigned your official Registration ID (<code>MQ-YYYY-XXXXXX</code>) and shown the NPR {siteSettings?.registrationFee || 399} payment QR code to finalize your entry.
              </p>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="pt-6 border-t border-[#E8DFD0] flex items-center justify-between">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevStep}
              className="border-[#292821]/20 text-xs font-semibold h-10 px-4 rounded-md gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </Button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <Button
              type="button"
              onClick={handleNextStep}
              className="bg-[#292821] hover:bg-[#3C332A] text-[#FAF5EE] text-xs font-bold h-10 px-6 rounded-md gap-2 shadow-xs"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#B69A65]" />
            </Button>
          ) : (
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitRegistration}
              className="bg-[#B69A65] hover:bg-[#a68c5b] text-[#292821] text-xs font-bold h-11 px-8 rounded-md shadow-md gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Registration...</span>
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4" />
                  <span>Submit Application (NPR {siteSettings?.registrationFee || 399})</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

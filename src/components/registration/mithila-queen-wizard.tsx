"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Crown,
  Sparkles,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { submitMithilaQueenRegistrationAction, submitPaymentDetailsAction } from "@/server/actions/mithila-queen-actions";
import { MithilaMotif } from "@/components/ui/mithila-motif";

export function MithilaQueenWizard() {
  const [step, setStep] = useState(1);
  const totalSteps = 7;

  // Step 1: Personal Info
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [alternatePhone, setAlternatePhone] = useState("");
  const [province, setProvince] = useState("Madhesh Province");
  const [district, setDistrict] = useState("Dhanusha");
  const [municipality, setMunicipality] = useState("Janakpurdham Sub-Metropolitan City");
  const [cityVillage, setCityVillage] = useState("");
  const [currentAddress, setCurrentAddress] = useState("");

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

  // Detect Minor status whenever DOB changes
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

  // Step Navigation Validators
  const handleNextStep = () => {
    if (step === 1) {
      if (!fullName.trim() || fullName.trim().length < 2) {
        toast.error("Please enter your full legal name.");
        return;
      }
      if (!dob) {
        toast.error("Please enter your date of birth.");
        return;
      }
      if (!email.trim() || !email.includes("@")) {
        toast.error("Please enter a valid email address.");
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
      if (isMinor) {
        toast.info("Minor applicant detected (under 18). Legal guardian consent will be collected in Step 6.");
      }
    }

    if (step === 2) {
      if (!motivationReason.trim()) {
        toast.error("Please provide a brief reason why you want to participate in Mithila Queen.");
        return;
      }
    }

    // Step 3 is optional / height omitted pending organizer confirmation

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

    setStep((prev) => Math.min(prev + 1, totalSteps));
    window.scrollTo({ top: 100, behavior: "smooth" });
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 100, behavior: "smooth" });
  };

  // Submit Registration
  const handleSubmitRegistration = async () => {
    setIsSubmitting(true);
    const res = await submitMithilaQueenRegistrationAction({
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
      toast.success("Application successfully submitted!");
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
  // POST-SUBMISSION PAYMENT SCREEN
  // ==========================================
  if (registeredId) {
    return (
      <div className="max-w-2xl mx-auto p-6 sm:p-10 rounded-3xl bg-white border border-[#E9E2D5] shadow-xs space-y-8">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#0A192F] text-[#C5A880] mx-auto flex items-center justify-center border border-[#C5A880]/50 shadow-xs">
            <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#C5A880]">
            Application Successfully Saved
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A192F] font-serif">
            Mithila Queen Registration
          </h2>
          <p className="text-xs text-[#243B53] max-w-md mx-auto">
            Your personal information and profile have been securely stored. Please complete the verified payment step below to submit for administrative review.
          </p>
        </div>

        {/* Registration ID Banner */}
        <div className="p-5 rounded-2xl bg-[#FDFBF7] border border-[#C5A880] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">
              Your Unique Registration ID
            </span>
            <span className="text-xl font-extrabold font-mono text-[#0A192F] tracking-wide">
              {registeredId}
            </span>
          </div>
          <Button
            size="sm"
            onClick={copyRegId}
            variant="outline"
            className="border-[#C5A880] text-[#0A192F] hover:bg-[#E9E2D5]/50 gap-1.5 text-xs font-semibold"
          >
            {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedRef ? "Copied" : "Copy ID"}</span>
          </Button>
        </div>

        {/* Payment Success State */}
        {paymentSuccess ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-emerald-950 text-base font-serif">
                Payment Details Submitted
              </h3>
              <p className="text-xs text-emerald-800 mt-1">
                Status: <strong>Payment Under Review</strong>. The organizing committee will independently reconcile your transfer within 24-48 hours.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/registration-status">
                <Button className="bg-[#0A192F] hover:bg-[#243B53] text-[#FDFBF7] text-xs font-bold h-10 px-5 rounded-xl">
                  Check Live Application Status
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="border-emerald-300 text-emerald-900 text-xs h-10 px-5 rounded-xl">
                  Return to Home
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Payment Instructions & QR Form */
          <div className="space-y-6 pt-2 border-t border-[#E9E2D5]">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C5A880]">
                Payment Amount: NPR 399
              </span>
              <h3 className="text-lg font-bold text-[#0A192F] font-serif">
                Official Payment QR Code
              </h3>
              <p className="text-xs text-[#243B53] max-w-sm mx-auto">
                Scan using eSewa, Khalti, or any Fonepay / Mobile Banking app to pay the NPR 399 registration fee.
              </p>
            </div>

            {/* QR Container */}
            <div className="w-56 h-56 mx-auto bg-white border-2 border-dashed border-[#C5A880] rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-xs relative">
              <QrCode className="w-28 h-28 text-[#0A192F] opacity-90 mb-2" />
              <span className="text-[11px] font-bold text-[#0A192F] font-mono">
                The Origin Foundation
              </span>
              <span className="text-[10px] text-zinc-500">
                NPR 399 • Fonepay / eSewa / Khalti
              </span>
            </div>

            <p className="text-[11px] text-center text-zinc-500 italic max-w-md mx-auto">
              * Note: Verified official merchant QR will be confirmed by organizers. Screenshots are independently cross-checked with bank statements before approval.
            </p>

            {/* Transaction Reference Submission Form */}
            <form onSubmit={handlePaymentSubmit} className="space-y-4 pt-4 border-t border-[#E9E2D5]">
              <div className="space-y-1.5">
                <Label htmlFor="txnRef" required className="text-xs font-bold text-[#0A192F]">
                  Transaction Reference / UTR Number
                </Label>
                <Input
                  id="txnRef"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="e.g. 981200546872 or Fonepay Txn ID"
                  required
                  className="h-10 text-sm border-[#E9E2D5] bg-white font-mono"
                />
                <p className="text-[11px] text-[#243B53]">
                  Enter the exact transaction reference shown in your banking or wallet receipt.
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSubmittingPayment}
                className="w-full bg-[#C5A880] hover:bg-[#b8986d] text-[#0A192F] font-bold text-xs h-11 rounded-xl shadow-xs gap-2"
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
      <div className="p-6 rounded-3xl bg-white border border-[#E9E2D5] shadow-xs space-y-4">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#0A192F] text-[#C5A880] font-bold flex items-center justify-center text-xs">
              {step}
            </span>
            <span className="font-bold text-[#0A192F] font-serif">
              Step {step} of {totalSteps}:{" "}
              {step === 1 && "Personal Information & Location"}
              {step === 2 && "Profile & Cultural Interests"}
              {step === 3 && "Additional Details"}
              {step === 4 && "Social Media Links"}
              {step === 5 && "Photo & Media Upload"}
              {step === 6 && "Rules & Minor Safeguarding"}
              {step === 7 && "Review & Submit"}
            </span>
          </div>
          <span className="font-mono text-zinc-500 font-semibold text-[11px]">
            Fee: NPR 399
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-[#E9E2D5]/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#C5A880] transition-all duration-300 ease-out"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Wizard Form Card */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#E9E2D5] shadow-xs space-y-6">
        {/* STEP 1: PERSONAL INFORMATION */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="border-b border-[#E9E2D5] pb-3">
              <h2 className="text-xl font-bold font-serif text-[#0A192F]">
                1. Personal Information & Location
              </h2>
              <p className="text-xs text-[#243B53] mt-1">
                Please provide your full legal name and contact details as shown on your official citizenship or academic records.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" required className="text-xs font-bold text-[#0A192F]">
                  Full Legal Name
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Anjali Kumari Jha"
                  required
                  className="h-10 text-xs border-[#E9E2D5]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dob" required className="text-xs font-bold text-[#0A192F]">
                  Date of Birth
                </Label>
                <Input
                  id="dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                  className="h-10 text-xs border-[#E9E2D5]"
                />
                {isMinor && (
                  <p className="text-[11px] text-[#C5A880] font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Minor participant detected (&lt;18). Guardian consent required in Step 6.</span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" required className="text-xs font-bold text-[#0A192F]">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="anjali@example.com"
                  required
                  className="h-10 text-xs border-[#E9E2D5]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" required className="text-xs font-bold text-[#0A192F]">
                  Mobile Phone Number
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9812000000"
                  required
                  className="h-10 text-xs border-[#E9E2D5]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="altPhone" className="text-xs font-bold text-[#0A192F]">
                Alternate Phone Number (Optional)
              </Label>
              <Input
                id="altPhone"
                value={alternatePhone}
                onChange={(e) => setAlternatePhone(e.target.value)}
                placeholder="e.g. Family contact number"
                className="h-10 text-xs border-[#E9E2D5]"
              />
            </div>

            {/* Geographical details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="province" required className="text-xs font-bold text-[#0A192F]">
                  Province
                </Label>
                <Input
                  id="province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  required
                  className="h-10 text-xs border-[#E9E2D5]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="district" required className="text-xs font-bold text-[#0A192F]">
                  District
                </Label>
                <Input
                  id="district"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  required
                  className="h-10 text-xs border-[#E9E2D5]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="municipality" required className="text-xs font-bold text-[#0A192F]">
                  Municipality / Rural Mun.
                </Label>
                <Input
                  id="municipality"
                  value={municipality}
                  onChange={(e) => setMunicipality(e.target.value)}
                  required
                  className="h-10 text-xs border-[#E9E2D5]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cityVillage" required className="text-xs font-bold text-[#0A192F]">
                  City, Town or Village
                </Label>
                <Input
                  id="cityVillage"
                  value={cityVillage}
                  onChange={(e) => setCityVillage(e.target.value)}
                  placeholder="e.g. Ramanand Chowk / Janakpur"
                  required
                  className="h-10 text-xs border-[#E9E2D5]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address" required className="text-xs font-bold text-[#0A192F]">
                  Current Street Address
                </Label>
                <Input
                  id="address"
                  value={currentAddress}
                  onChange={(e) => setCurrentAddress(e.target.value)}
                  placeholder="Ward No. & Street Details"
                  required
                  className="h-10 text-xs border-[#E9E2D5]"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PARTICIPANT PROFILE */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="border-b border-[#E9E2D5] pb-3">
              <h2 className="text-xl font-bold font-serif text-[#0A192F]">
                2. Participant Profile & Cultural Heritage
              </h2>
              <p className="text-xs text-[#243B53] mt-1">
                Share your personal interests, artistic skills, and connection to Mithila.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="motivation" required className="text-xs font-bold text-[#0A192F]">
                Why do you want to participate in Mithila Queen?
              </Label>
              <Textarea
                id="motivation"
                value={motivationReason}
                onChange={(e) => setMotivationReason(e.target.value)}
                placeholder="What inspired you to join this cultural competition?"
                rows={3}
                required
                className="text-xs border-[#E9E2D5] resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mithilaMeaning" className="text-xs font-bold text-[#0A192F]">
                What does Mithila&apos;s cultural heritage mean to you?
              </Label>
              <Textarea
                id="mithilaMeaning"
                value={mithilaMeaning}
                onChange={(e) => setMithilaMeaning(e.target.value)}
                placeholder="Share your thoughts on Mithila art, traditions, or values..."
                rows={3}
                className="text-xs border-[#E9E2D5] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="talents" className="text-xs font-bold text-[#0A192F]">
                  Talents & Skills
                </Label>
                <Input
                  id="talents"
                  value={talentsSkills}
                  onChange={(e) => setTalentsSkills(e.target.value)}
                  placeholder="e.g. Mithila Painting, Singing, Public Speaking"
                  className="h-10 text-xs border-[#E9E2D5]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="languages" className="text-xs font-bold text-[#0A192F]">
                  Languages Spoken
                </Label>
                <Input
                  id="languages"
                  value={languagesSpoken}
                  onChange={(e) => setLanguagesSpoken(e.target.value)}
                  placeholder="e.g. Maithili, Nepali, Hindi, English"
                  className="h-10 text-xs border-[#E9E2D5]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="education" className="text-xs font-bold text-[#0A192F]">
                  Current Education Level (Voluntary)
                </Label>
                <Input
                  id="education"
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  placeholder="e.g. Bachelor's Degree"
                  className="h-10 text-xs border-[#E9E2D5]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="institution" className="text-xs font-bold text-[#0A192F]">
                  School / College (Voluntary)
                </Label>
                <Input
                  id="institution"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. Janakpur College"
                  className="h-10 text-xs border-[#E9E2D5]"
                />
              </div>
            </div>

            {/* Experience */}
            <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#E9E2D5] space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={previousExperience}
                  onChange={(e) => setPreviousExperience(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0A192F] focus:ring-[#C5A880]"
                />
                <span className="text-xs font-bold text-[#0A192F]">
                  I have previous stage or competition experience
                </span>
              </label>
              <p className="text-[11px] text-zinc-500 pl-6">
                Note: Previous experience is NOT required. First-time participants are warmly welcomed and evaluated fairly.
              </p>

              {previousExperience && (
                <div className="pt-2 pl-6 space-y-1">
                  <Label htmlFor="expDetails" className="text-xs text-[#0A192F]">
                    Details of earlier participation (event, year, any recognition)
                  </Label>
                  <Input
                    id="expDetails"
                    value={experienceDetails}
                    onChange={(e) => setExperienceDetails(e.target.value)}
                    placeholder="e.g. Inter-school cultural dance 2024"
                    className="h-9 text-xs border-[#E9E2D5] bg-white"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: ADDITIONAL DETAILS (Height omitted pending confirmation) */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="border-b border-[#E9E2D5] pb-3">
              <h2 className="text-xl font-bold font-serif text-[#0A192F]">
                3. Additional Participant Information
              </h2>
              <p className="text-xs text-[#243B53] mt-1">
                Optional personal attributes and background details.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FDFBF7] border border-[#E9E2D5] space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#C5A880]">
                Notice on Physical Measurements
              </h3>
              <p className="text-xs text-[#243B53] leading-relaxed">
                As per The Origin Foundation&apos;s standards, height or body measurement fields remain omitted until organizers confirm their relevance to adjudication. Mithila Queen focuses primarily on cultural articulation, talent, confidence, and heritage knowledge.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="intro" className="text-xs font-bold text-[#0A192F]">
                Personal Introduction / Self Summary (Optional)
              </Label>
              <Textarea
                id="intro"
                value={personalIntro}
                onChange={(e) => setPersonalIntro(e.target.value)}
                placeholder="Tell us a little more about yourself, your family background, and your aspirations..."
                rows={4}
                className="text-xs border-[#E9E2D5] resize-none"
              />
            </div>
          </div>
        )}

        {/* STEP 4: SOCIAL MEDIA ACCOUNTS */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="border-b border-[#E9E2D5] pb-3">
              <h2 className="text-xl font-bold font-serif text-[#0A192F]">
                4. Social Media Accounts
              </h2>
              <p className="text-xs text-[#243B53] mt-1">
                At least one valid account (Instagram, TikTok, or Facebook) is required for video audition cross-referencing. The remaining are optional.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Security Rule</span>
              </p>
              <p className="text-[11px] text-amber-800">
                Never enter your social media password. We only collect public usernames and profile URLs to view your audition video.
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="insta" className="text-xs font-bold text-[#0A192F]">
                  Instagram Username or Profile URL
                </Label>
                <Input
                  id="insta"
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value)}
                  placeholder="e.g. @anjali_mithila or https://instagram.com/anjali"
                  className="h-10 text-xs border-[#E9E2D5]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tiktok" className="text-xs font-bold text-[#0A192F]">
                  TikTok Username or Profile URL
                </Label>
                <Input
                  id="tiktok"
                  value={tiktokHandle}
                  onChange={(e) => setTiktokHandle(e.target.value)}
                  placeholder="e.g. @anjali_queen"
                  className="h-10 text-xs border-[#E9E2D5]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fb" className="text-xs font-bold text-[#0A192F]">
                  Facebook Profile URL
                </Label>
                <Input
                  id="fb"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="e.g. https://facebook.com/anjali.kumari"
                  className="h-10 text-xs border-[#E9E2D5]"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: PHOTO UPLOAD */}
        {step === 5 && (
          <div className="space-y-5">
            <div className="border-b border-[#E9E2D5] pb-3">
              <h2 className="text-xl font-bold font-serif text-[#0A192F]">
                5. Recent Profile Photo Upload
              </h2>
              <p className="text-xs text-[#243B53] mt-1">
                Upload a clear recent portrait photo for your participant file.
              </p>
            </div>

            <div className="p-6 border-2 border-dashed border-[#E9E2D5] rounded-2xl text-center space-y-3 bg-[#FDFBF7]">
              {profilePhotoUrl ? (
                <div className="space-y-3">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto border-2 border-[#C5A880]">
                    <img
                      src={profilePhotoUrl}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs text-emerald-700 font-semibold flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Photo Uploaded</span>
                  </p>
                  <label className="cursor-pointer inline-block text-xs text-[#0A192F] underline font-medium">
                    <span>Change Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-xl bg-[#0A192F] text-[#C5A880] mx-auto flex items-center justify-center">
                    {isUploadingPhoto ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <label className="cursor-pointer font-bold text-xs text-[#0A192F] hover:text-[#C5A880]">
                      <span>Click to upload recent profile photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled={isUploadingPhoto}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      PNG, JPG or WEBP up to 10MB.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 6: RULES & MINOR SAFEGUARDING */}
        {step === 6 && (
          <div className="space-y-6">
            <div className="border-b border-[#E9E2D5] pb-3">
              <h2 className="text-xl font-bold font-serif text-[#0A192F]">
                6. Rules, Safeguarding & Consent
              </h2>
              <p className="text-xs text-[#243B53] mt-1">
                Please review and accept our institutional policies and safeguarding commitments.
              </p>
            </div>

            {/* MINOR SAFEGUARDING NOTICE IF UNDER 18 */}
            {isMinor && (
              <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 space-y-4">
                <div className="flex items-center gap-2 text-amber-900">
                  <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
                  <h3 className="font-bold text-sm font-serif">
                    Minor Participant Safeguarding Protocol (&lt;18 Years)
                  </h3>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Because the applicant is under 18 years old, a parent or legal guardian must be documented on the registration record.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <Label htmlFor="gName" required className="text-xs font-bold text-amber-950">
                      Parent / Guardian Full Legal Name
                    </Label>
                    <Input
                      id="gName"
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      placeholder="e.g. Ramesh Chandra Jha"
                      required
                      className="h-9 text-xs border-amber-300 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="gPhone" required className="text-xs font-bold text-amber-950">
                      Guardian Phone Number
                    </Label>
                    <Input
                      id="gPhone"
                      value={guardianPhone}
                      onChange={(e) => setGuardianPhone(e.target.value)}
                      placeholder="e.g. 9812000000"
                      required
                      className="h-9 text-xs border-amber-300 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="gRel" required className="text-xs font-bold text-amber-950">
                      Relationship to Minor
                    </Label>
                    <Input
                      id="gRel"
                      value={guardianRelation}
                      onChange={(e) => setGuardianRelation(e.target.value)}
                      placeholder="e.g. Mother / Father / Legal Guardian"
                      required
                      className="h-9 text-xs border-amber-300 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="gMail" className="text-xs font-bold text-amber-950">
                      Guardian Email (Optional)
                    </Label>
                    <Input
                      id="gMail"
                      type="email"
                      value={guardianEmail}
                      onChange={(e) => setGuardianEmail(e.target.value)}
                      placeholder="guardian@example.com"
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
              <label className="flex items-start gap-2.5 cursor-pointer p-3 rounded-xl bg-[#FDFBF7] border border-[#E9E2D5]">
                <input
                  type="checkbox"
                  checked={agreedToRules}
                  onChange={(e) => setAgreedToRules(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0A192F] focus:ring-[#C5A880] mt-0.5"
                />
                <span className="text-xs text-[#0A192F] leading-relaxed">
                  I agree to the official <strong>Competition Rules & Eligibility</strong>. I confirm that I am a female participant and that all submitted details are authentic.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer p-3 rounded-xl bg-[#FDFBF7] border border-[#E9E2D5]">
                <input
                  type="checkbox"
                  checked={agreedToPrivacy}
                  onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0A192F] focus:ring-[#C5A880] mt-0.5"
                />
                <span className="text-xs text-[#0A192F] leading-relaxed">
                  I accept the <strong>Privacy Policy</strong> and agree that my personal data will be used strictly for competition adjudication and independent payment auditing.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer p-3 rounded-xl bg-[#FDFBF7] border border-[#E9E2D5]">
                <input
                  type="checkbox"
                  checked={agreedToMedia}
                  onChange={(e) => setAgreedToMedia(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0A192F] focus:ring-[#C5A880] mt-0.5"
                />
                <span className="text-xs text-[#0A192F] leading-relaxed">
                  (Optional) I grant permission for submitted audition videos and event photos to be respectfully shared for official Mithila cultural promotion.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* STEP 7: REVIEW & SUBMIT */}
        {step === 7 && (
          <div className="space-y-6">
            <div className="border-b border-[#E9E2D5] pb-3">
              <h2 className="text-xl font-bold font-serif text-[#0A192F]">
                7. Review Application Details
              </h2>
              <p className="text-xs text-[#243B53] mt-1">
                Please double-check your registration details before confirming submission.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FDFBF7] border border-[#E9E2D5] space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-zinc-500 font-medium">Participant Name:</span>
                <span className="font-bold text-[#0A192F]">{fullName}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-zinc-500 font-medium">Date of Birth:</span>
                <span className="font-bold text-[#0A192F]">{dob} {isMinor ? "(Minor < 18)" : ""}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-zinc-500 font-medium">Email:</span>
                <span className="font-bold text-[#0A192F] font-mono">{email}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-zinc-500 font-medium">Phone:</span>
                <span className="font-bold text-[#0A192F] font-mono">{phone}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-zinc-500 font-medium">Location:</span>
                <span className="font-bold text-[#0A192F]">{cityVillage}, {district}, {province}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-zinc-500 font-medium">Registration Fee:</span>
                <span className="font-bold text-[#0A192F]">NPR 399</span>
              </div>
              {isMinor && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E9E2D5]">
                  <span className="text-zinc-500 font-medium">Legal Guardian:</span>
                  <span className="font-bold text-[#0A192F]">{guardianName} ({guardianRelation})</span>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-[#243B53]/10 border border-[#243B53]/20 text-xs text-[#0A192F]">
              <p className="font-bold">Next Step After Clicking Submit:</p>
              <p className="text-[11px] text-[#243B53] mt-1">
                You will be assigned your unique Registration ID (<code>MQ-YYYY-XXXXXX</code>) and shown the official NPR 399 payment QR code to finalize your entry.
              </p>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="pt-6 border-t border-[#E9E2D5] flex items-center justify-between">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevStep}
              className="border-[#243B53]/20 text-xs font-semibold h-10 px-4 rounded-xl gap-1.5"
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
              className="bg-[#0A192F] hover:bg-[#243B53] text-[#FDFBF7] text-xs font-bold h-10 px-6 rounded-xl gap-2 shadow-xs"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C5A880]" />
            </Button>
          ) : (
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitRegistration}
              className="bg-[#C5A880] hover:bg-[#b8986d] text-[#0A192F] text-xs font-bold h-11 px-8 rounded-xl shadow-md gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Registration...</span>
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4" />
                  <span>Submit Application (NPR 399)</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}


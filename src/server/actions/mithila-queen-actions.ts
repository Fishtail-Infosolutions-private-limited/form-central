"use server";

import crypto from "crypto";
import { z } from "zod";
import { customAlphabet } from "nanoid";
import { prisma } from "@/lib/db/prisma";
import { PaymentStatus, ApplicationStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth/guards";
import { revalidatePath } from "next/cache";
import {
  sendMithilaQueenSubmissionEmail,
  sendMithilaQueenApprovalEmail,
  sendOtpVerificationEmail,
  sendMithilaQueenStatusOtpEmail,
  sendMithilaQueenDetailsUpdatedEmail,
  sendMithilaQueenPaymentReceivedEmail,
} from "@/lib/email/client";
import { generateRegistrationConfirmationPdf } from "@/lib/pdf/generate-confirmation";

const generateRefCode = customAlphabet("23456789ABCDEFGHJKLMNPQRSTUVWXYZ", 6);
const generateVerifyCode = customAlphabet("23456789ABCDEFGHJKLMNPQRSTUVWXYZ", 8);
const generateSessionToken = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", 32);

function hashOtp(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

// Helper to determine minor age
function calculateAge(dob: Date): number {
  const diffMs = Date.now() - dob.getTime();
  const ageDt = new Date(diffMs);
  return Math.abs(ageDt.getUTCFullYear() - 1970);
}

// Helper to get or ensure the Mithila Queen form record
async function getMithilaQueenForm() {
  let form = await prisma.registrationForm.findFirst({
    where: { slug: "mithila-queen" },
  });
  if (!form) {
    form = await prisma.registrationForm.findFirst({
      orderBy: { createdAt: "asc" },
    });
  }
  return form;
}

// -------------------------------------------------------------
// 1. STEP 1 EMAIL OTP: INITIATE VERIFICATION
// -------------------------------------------------------------
export async function initiateMithilaQueenStep1Action({
  firstName,
  lastName,
  email,
  phone,
}: {
  firstName: string;
  lastName?: string;
  email: string;
  phone: string;
}) {
  try {
    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = phone.trim();
    const cleanFirstName = firstName.trim();
    const cleanLastName = (lastName || "").trim();
    const recipientName = [cleanFirstName, cleanLastName].filter(Boolean).join(" ") || "Applicant";

    if (!cleanFirstName) {
      return { success: false, error: "First name is required." };
    }
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { success: false, error: "Valid email address is required." };
    }
    if (!cleanPhone || cleanPhone.length < 7) {
      return { success: false, error: "Valid mobile phone number is required." };
    }

    // 1. Check SiteSetting for registration status & dates
    const setting = await prisma.siteSetting.findUnique({ where: { id: "primary" } });
    const now = new Date();

    if (setting) {
      if (!setting.isRegistrationOpen) {
        return {
          success: false,
          error: "Registration for Mithila Queen is currently closed by the organizers.",
        };
      }
      if (setting.registrationOpeningDate && now < setting.registrationOpeningDate) {
        return {
          success: false,
          error: `Registration opens on ${setting.registrationOpeningDate.toLocaleDateString("en-US", { timeZone: "Asia/Kathmandu" })}.`,
        };
      }
      if (setting.registrationClosingDate && now > setting.registrationClosingDate) {
        return {
          success: false,
          error: "The official registration deadline for Mithila Queen has passed.",
        };
      }
    }

    // 2. Rate limit check: Max 5 requests in last 15 minutes for this email
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recentRequestsCount = await prisma.emailVerification.count({
      where: {
        email: cleanEmail,
        createdAt: { gte: fifteenMinsAgo },
      },
    });

    if (recentRequestsCount >= 5) {
      return {
        success: false,
        error: "Too many verification requests. Please wait 15 minutes before requesting another code.",
      };
    }

    // 3. Find Mithila Queen form record
    const form = await getMithilaQueenForm();
    if (!form) {
      return { success: false, error: "Mithila Queen registration form is temporarily unavailable." };
    }

    // 4. Generate 6-digit OTP
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const codeHash = hashOtp(otpCode);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 5. Store verification in database
    const verification = await prisma.emailVerification.create({
      data: {
        formId: form.id,
        email: cleanEmail,
        codeHash,
        expiresAt,
      },
    });

    // 6. Send OTP Email (Anti-enumeration)
    await sendOtpVerificationEmail({
      to: cleanEmail,
      recipientName,
      otpCode,
      formName: "Mithila Queen",
      expiresInMinutes: 10,
    });

    return {
      success: true,
      verificationId: verification.id,
      expiresInSeconds: 600,
    };
  } catch (err: unknown) {
    console.error("initiateMithilaQueenStep1Action error:", err);
    return {
      success: false,
      error: "Unable to send verification code. Please check your email address and try again.",
    };
  }
}

// -------------------------------------------------------------
// 2. STEP 1 EMAIL OTP: VERIFY CODE & RESTORE DRAFT / CHECK EXISTING
// -------------------------------------------------------------
export async function verifyMithilaQueenStep1OtpAction({
  verificationId,
  code,
  email,
  firstName,
  lastName,
  phone,
}: {
  verificationId: string;
  code: string;
  email: string;
  firstName: string;
  lastName?: string;
  phone: string;
}) {
  try {
    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.trim();

    if (!verificationId || !cleanCode) {
      return { success: false, error: "Verification code is required." };
    }

    const record = await prisma.emailVerification.findUnique({
      where: { id: verificationId },
    });

    if (!record || record.email !== cleanEmail) {
      return { success: false, error: "Invalid verification session. Please request a new code." };
    }

    if (new Date() > record.expiresAt) {
      return { success: false, error: "Verification code has expired. Please request a new code." };
    }

    if (record.attempts >= 5) {
      return {
        success: false,
        error: "Too many incorrect attempts. This code has been invalidated for security. Please request a new code.",
      };
    }

    const inputHash = hashOtp(cleanCode);
    if (inputHash !== record.codeHash) {
      await prisma.emailVerification.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      return { success: false, error: "Incorrect verification code. Please check your email." };
    }

    // OTP is valid! Create session token
    const sessionToken = generateSessionToken();
    await prisma.emailVerification.update({
      where: { id: record.id },
      data: {
        verified: true,
        verifiedAt: new Date(),
        sessionToken,
      },
    });

    // Check existing registration
    const existingReg = await prisma.mithilaQueenRegistration.findFirst({
      where: { email: cleanEmail },
      orderBy: { createdAt: "desc" },
    });

    if (existingReg) {
      if (existingReg.isCompleted) {
        return {
          success: true,
          sessionToken,
          isExisting: true,
          isCompleted: true,
          registrationId: existingReg.registrationId,
          fullName: existingReg.fullName,
          applicationStatus: existingReg.applicationStatus,
          paymentStatus: existingReg.paymentStatus,
          message: "You have an existing submitted registration for Mithila Queen.",
        };
      }

      // Existing in-progress draft: return saved fields to resume
      return {
        success: true,
        sessionToken,
        isExisting: true,
        isCompleted: false,
        resumeStep: existingReg.inProgressStep || 2,
        draftData: {
          fullName: existingReg.fullName,
          dob: existingReg.dob ? existingReg.dob.toISOString().split("T")[0] : "",
          phone: existingReg.phone,
          alternatePhone: existingReg.alternatePhone || "",
          province: existingReg.province || "Madhesh Province",
          district: existingReg.district || "Dhanusha",
          municipality: existingReg.municipality || "Janakpurdham Sub-Metropolitan City",
          cityVillage: existingReg.cityVillage || "",
          currentAddress: existingReg.currentAddress || "",

          guardianName: existingReg.guardianName || "",
          guardianPhone: existingReg.guardianPhone || "",
          guardianRelation: existingReg.guardianRelation || "Parent / Mother",
          guardianEmail: existingReg.guardianEmail || "",
          guardianConsent: existingReg.guardianConsentRecorded || false,

          personalIntro: existingReg.personalIntro || "",
          hobbiesInterests: existingReg.hobbiesInterests || "",
          talentsSkills: existingReg.talentsSkills || "",
          languagesSpoken: existingReg.languagesSpoken || "Maithili, Nepali, English",
          culturalInterests: existingReg.culturalInterests || "",
          motivationReason: existingReg.motivationReason || "",
          mithilaMeaning: existingReg.mithilaMeaning || "",
          qualitiesBrought: existingReg.qualitiesBrought || "",
          educationLevel: existingReg.educationLevel || "+2 / Higher Secondary",
          institution: existingReg.institution || "",
          previousExperience: existingReg.previousExperience || false,
          experienceDetails: existingReg.experienceDetails || "",

          instagramHandle: existingReg.instagramHandle || "",
          tiktokHandle: existingReg.tiktokHandle || "",
          facebookUrl: existingReg.facebookUrl || "",
          profilePhotoUrl: existingReg.profilePhotoUrl || "",
          videoUrl: existingReg.videoUrl || "",
          documentUrl: existingReg.documentUrl || "",
        },
      };
    }

    // New participant: Initialize draft in database
    const currentYear = new Date().getFullYear();
    const draftRefId = `MQ-${currentYear}-${generateRefCode()}`;
    const cleanFullName = [firstName.trim(), (lastName || "").trim()].filter(Boolean).join(" ");

    await prisma.mithilaQueenRegistration.create({
      data: {
        registrationId: draftRefId,
        fullName: cleanFullName || "Applicant",
        email: cleanEmail,
        phone: phone.trim(),
        dob: new Date("2000-01-01"),
        province: "Madhesh Province",
        district: "Dhanusha",
        municipality: "Janakpurdham Sub-Metropolitan City",
        cityVillage: "",
        currentAddress: "",
        inProgressStep: 2,
        isCompleted: false,
        emailVerified: true,
        emailVerificationId: record.id,
      },
    });

    return {
      success: true,
      sessionToken,
      isExisting: false,
      isCompleted: false,
      resumeStep: 2,
    };
  } catch (err: unknown) {
    console.error("verifyMithilaQueenStep1OtpAction error:", err);
    return { success: false, error: "Failed to verify code. Please try again." };
  }
}

// -------------------------------------------------------------
// 3. SAVE IN-PROGRESS DRAFT
// -------------------------------------------------------------
export async function saveMithilaQueenDraftAction({
  sessionToken,
  email,
  step,
  formData,
}: {
  sessionToken: string;
  email: string;
  step: number;
  formData: any;
}) {
  try {
    const cleanEmail = email.toLowerCase().trim();

    const verification = await prisma.emailVerification.findFirst({
      where: {
        sessionToken,
        email: cleanEmail,
        verified: true,
      },
    });

    if (!verification) {
      return { success: false, error: "Invalid or expired session. Please re-verify." };
    }

    const existingReg = await prisma.mithilaQueenRegistration.findFirst({
      where: { email: cleanEmail },
      orderBy: { createdAt: "desc" },
    });

    if (!existingReg) {
      return { success: false, error: "Draft registration record not found." };
    }

    const updateData: any = {
      inProgressStep: step,
      isCompleted: false,
    };

    if (formData.fullName) updateData.fullName = formData.fullName.trim();
    if (formData.phone) updateData.phone = formData.phone.trim();
    if (formData.alternatePhone !== undefined) updateData.alternatePhone = formData.alternatePhone?.trim() || null;
    if (formData.dob) {
      const birthDate = new Date(formData.dob);
      if (!isNaN(birthDate.getTime())) {
        updateData.dob = birthDate;
        updateData.isMinor = calculateAge(birthDate) < 18;
      }
    }
    if (formData.province) updateData.province = formData.province.trim();
    if (formData.district) updateData.district = formData.district.trim();
    if (formData.municipality) updateData.municipality = formData.municipality.trim();
    if (formData.cityVillage !== undefined) updateData.cityVillage = formData.cityVillage?.trim() || "";
    if (formData.currentAddress !== undefined) updateData.currentAddress = formData.currentAddress?.trim() || "";

    if (formData.guardianName !== undefined) updateData.guardianName = formData.guardianName?.trim() || null;
    if (formData.guardianPhone !== undefined) updateData.guardianPhone = formData.guardianPhone?.trim() || null;
    if (formData.guardianRelation !== undefined) updateData.guardianRelation = formData.guardianRelation?.trim() || null;
    if (formData.guardianEmail !== undefined) updateData.guardianEmail = formData.guardianEmail?.trim() || null;
    if (formData.guardianConsent !== undefined) updateData.guardianConsentRecorded = Boolean(formData.guardianConsent);

    if (formData.personalIntro !== undefined) updateData.personalIntro = formData.personalIntro?.trim() || null;
    if (formData.hobbiesInterests !== undefined) updateData.hobbiesInterests = formData.hobbiesInterests?.trim() || null;
    if (formData.talentsSkills !== undefined) updateData.talentsSkills = formData.talentsSkills?.trim() || null;
    if (formData.languagesSpoken !== undefined) updateData.languagesSpoken = formData.languagesSpoken?.trim() || null;
    if (formData.culturalInterests !== undefined) updateData.culturalInterests = formData.culturalInterests?.trim() || null;
    if (formData.motivationReason !== undefined) updateData.motivationReason = formData.motivationReason?.trim() || null;
    if (formData.mithilaMeaning !== undefined) updateData.mithilaMeaning = formData.mithilaMeaning?.trim() || null;
    if (formData.qualitiesBrought !== undefined) updateData.qualitiesBrought = formData.qualitiesBrought?.trim() || null;
    if (formData.educationLevel !== undefined) updateData.educationLevel = formData.educationLevel?.trim() || null;
    if (formData.institution !== undefined) updateData.institution = formData.institution?.trim() || null;
    if (formData.previousExperience !== undefined) updateData.previousExperience = Boolean(formData.previousExperience);
    if (formData.experienceDetails !== undefined) updateData.experienceDetails = formData.experienceDetails?.trim() || null;

    if (formData.instagramHandle !== undefined) updateData.instagramHandle = formData.instagramHandle?.trim() || null;
    if (formData.tiktokHandle !== undefined) updateData.tiktokHandle = formData.tiktokHandle?.trim() || null;
    if (formData.facebookUrl !== undefined) updateData.facebookUrl = formData.facebookUrl?.trim() || null;
    if (formData.profilePhotoUrl !== undefined) updateData.profilePhotoUrl = formData.profilePhotoUrl?.trim() || null;
    if (formData.videoUrl !== undefined) updateData.videoUrl = formData.videoUrl?.trim() || null;
    if (formData.documentUrl !== undefined) updateData.documentUrl = formData.documentUrl?.trim() || null;

    await prisma.mithilaQueenRegistration.update({
      where: { id: existingReg.id },
      data: updateData,
    });

    return { success: true };
  } catch (err: unknown) {
    console.error("saveMithilaQueenDraftAction error:", err);
    return { success: false, error: "Failed to save progress." };
  }
}

// -------------------------------------------------------------
// 4. SUBMIT REGISTRATION WIZARD (FINAL STEP 7)
// -------------------------------------------------------------
export async function submitMithilaQueenRegistrationAction(formData: {
  sessionToken?: string;
  fullName: string;
  dob: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  province: string;
  district: string;
  municipality: string;
  cityVillage: string;
  currentAddress: string;

  // Guardian details if minor
  guardianName?: string;
  guardianPhone?: string;
  guardianRelation?: string;
  guardianEmail?: string;
  guardianConsent?: boolean;

  // Profile
  personalIntro?: string;
  hobbiesInterests?: string;
  talentsSkills?: string;
  languagesSpoken?: string;
  culturalInterests?: string;
  motivationReason?: string;
  mithilaMeaning?: string;
  qualitiesBrought?: string;
  educationLevel?: string;
  institution?: string;
  previousExperience?: boolean;
  experienceDetails?: string;

  // Socials (at least 1 required)
  instagramHandle?: string;
  tiktokHandle?: string;
  facebookUrl?: string;

  // Media & Documents
  profilePhotoUrl?: string;
  additionalPhotoUrl?: string;
  documentUrl?: string;
  videoUrl?: string;

  // Consent checkboxes
  agreedToRules: boolean;
  agreedToMedia: boolean;
  agreedToPrivacy: boolean;
}) {
  try {
    const cleanEmail = formData.email.trim().toLowerCase();

    // 1. Basic validation
    if (!formData.fullName?.trim() || formData.fullName.trim().length < 2) {
      return { success: false, error: "Full legal name is required (at least 2 characters)." };
    }
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { success: false, error: "Valid email address is required." };
    }
    if (!formData.phone?.trim() || formData.phone.trim().length < 7) {
      return { success: false, error: "Valid mobile phone number is required." };
    }
    if (!formData.dob) {
      return { success: false, error: "Date of birth is required." };
    }

    const birthDate = new Date(formData.dob);
    if (isNaN(birthDate.getTime())) {
      return { success: false, error: "Invalid date of birth provided." };
    }

    // 2. Minor calculation & safeguarding check
    const age = calculateAge(birthDate);
    const isMinor = age < 18;

    if (isMinor) {
      if (!formData.guardianName?.trim() || !formData.guardianPhone?.trim() || !formData.guardianRelation?.trim()) {
        return {
          success: false,
          error: "Participant is under 18 years old. Full parent/legal guardian details (Name, Relationship, Phone) are strictly required.",
        };
      }
      if (!formData.guardianConsent) {
        return {
          success: false,
          error: "Formal parent/legal guardian consent must be confirmed for participants under 18 years old.",
        };
      }
    }

    // 3. Social media check: at least 1 required
    const hasSocial = Boolean(
      formData.instagramHandle?.trim() ||
      formData.tiktokHandle?.trim() ||
      formData.facebookUrl?.trim()
    );
    if (!hasSocial) {
      return {
        success: false,
        error: "At least one social media profile (Instagram, TikTok, or Facebook) is required for video audition review.",
      };
    }

    // 4. Consents check
    if (!formData.agreedToRules || !formData.agreedToPrivacy) {
      return {
        success: false,
        error: "You must accept the competition rules and privacy policy to complete registration.",
      };
    }

    // Find existing draft or create new
    const siteSetting = await prisma.siteSetting.findUnique({ where: { id: "primary" } }).catch(() => null);
    const effectiveFee = siteSetting?.registrationFee ?? 399;

    const existingDraft = await prisma.mithilaQueenRegistration.findFirst({
      where: { email: cleanEmail },
      orderBy: { createdAt: "desc" },
    });

    const currentYear = new Date().getFullYear();
    const registrationId = existingDraft?.registrationId || `MQ-${currentYear}-${generateRefCode()}`;

    let registration;
    if (existingDraft) {
      registration = await prisma.mithilaQueenRegistration.update({
        where: { id: existingDraft.id },
        data: {
          fullName: formData.fullName.trim(),
          dob: birthDate,
          isMinor,
          phone: formData.phone.trim(),
          alternatePhone: formData.alternatePhone?.trim() || null,
          province: formData.province.trim(),
          district: formData.district.trim(),
          municipality: formData.municipality.trim(),
          cityVillage: formData.cityVillage.trim(),
          currentAddress: formData.currentAddress.trim(),

          guardianName: isMinor ? formData.guardianName?.trim() : null,
          guardianPhone: isMinor ? formData.guardianPhone?.trim() : null,
          guardianRelation: isMinor ? formData.guardianRelation?.trim() : null,
          guardianEmail: isMinor ? formData.guardianEmail?.trim() : null,
          guardianConsentRecorded: isMinor ? Boolean(formData.guardianConsent) : false,
          guardianConsentTimestamp: isMinor ? new Date() : null,

          personalIntro: formData.personalIntro?.trim() || null,
          hobbiesInterests: formData.hobbiesInterests?.trim() || null,
          talentsSkills: formData.talentsSkills?.trim() || null,
          languagesSpoken: formData.languagesSpoken?.trim() || null,
          culturalInterests: formData.culturalInterests?.trim() || null,
          motivationReason: formData.motivationReason?.trim() || null,
          mithilaMeaning: formData.mithilaMeaning?.trim() || null,
          qualitiesBrought: formData.qualitiesBrought?.trim() || null,
          educationLevel: formData.educationLevel?.trim() || null,
          institution: formData.institution?.trim() || null,
          previousExperience: Boolean(formData.previousExperience),
          experienceDetails: formData.experienceDetails?.trim() || null,

          instagramHandle: formData.instagramHandle?.trim() || null,
          tiktokHandle: formData.tiktokHandle?.trim() || null,
          facebookUrl: formData.facebookUrl?.trim() || null,

          profilePhotoUrl: formData.profilePhotoUrl || null,
          additionalPhotoUrl: formData.additionalPhotoUrl || null,
          documentUrl: formData.documentUrl || null,
          videoUrl: formData.videoUrl || null,

          registrationFee: effectiveFee,
          paymentStatus: PaymentStatus.PENDING,
          applicationStatus: ApplicationStatus.SUBMITTED,
          inProgressStep: 7,
          isCompleted: true,
          submittedAt: new Date(),
        },
      });
    } else {
      registration = await prisma.mithilaQueenRegistration.create({
        data: {
          registrationId,
          fullName: formData.fullName.trim(),
          dob: birthDate,
          isMinor,
          email: cleanEmail,
          phone: formData.phone.trim(),
          alternatePhone: formData.alternatePhone?.trim() || null,
          province: formData.province.trim(),
          district: formData.district.trim(),
          municipality: formData.municipality.trim(),
          cityVillage: formData.cityVillage.trim(),
          currentAddress: formData.currentAddress.trim(),

          guardianName: isMinor ? formData.guardianName?.trim() : null,
          guardianPhone: isMinor ? formData.guardianPhone?.trim() : null,
          guardianRelation: isMinor ? formData.guardianRelation?.trim() : null,
          guardianEmail: isMinor ? formData.guardianEmail?.trim() : null,
          guardianConsentRecorded: isMinor ? Boolean(formData.guardianConsent) : false,
          guardianConsentTimestamp: isMinor ? new Date() : null,

          personalIntro: formData.personalIntro?.trim() || null,
          hobbiesInterests: formData.hobbiesInterests?.trim() || null,
          talentsSkills: formData.talentsSkills?.trim() || null,
          languagesSpoken: formData.languagesSpoken?.trim() || null,
          culturalInterests: formData.culturalInterests?.trim() || null,
          motivationReason: formData.motivationReason?.trim() || null,
          mithilaMeaning: formData.mithilaMeaning?.trim() || null,
          qualitiesBrought: formData.qualitiesBrought?.trim() || null,
          educationLevel: formData.educationLevel?.trim() || null,
          institution: formData.institution?.trim() || null,
          previousExperience: Boolean(formData.previousExperience),
          experienceDetails: formData.experienceDetails?.trim() || null,

          instagramHandle: formData.instagramHandle?.trim() || null,
          tiktokHandle: formData.tiktokHandle?.trim() || null,
          facebookUrl: formData.facebookUrl?.trim() || null,

          profilePhotoUrl: formData.profilePhotoUrl || null,
          additionalPhotoUrl: formData.additionalPhotoUrl || null,
          documentUrl: formData.documentUrl || null,
          videoUrl: formData.videoUrl || null,

          registrationFee: effectiveFee,
          paymentStatus: PaymentStatus.PENDING,
          applicationStatus: ApplicationStatus.SUBMITTED,
          inProgressStep: 7,
          isCompleted: true,
          submittedAt: new Date(),
        },
      });
    }

    // 7. Record Consents
    await prisma.participantConsent.deleteMany({
      where: { registrationId: registration.id },
    });

    await prisma.participantConsent.createMany({
      data: [
        {
          registrationId: registration.id,
          consentType: "COMPETITION_RULES",
          policyVersion: "1.0",
          isAgreed: true,
        },
        {
          registrationId: registration.id,
          consentType: "PRIVACY_POLICY",
          policyVersion: "1.0",
          isAgreed: true,
        },
        ...(formData.agreedToMedia
          ? [
              {
                registrationId: registration.id,
                consentType: "MEDIA_CONSENT",
                policyVersion: "1.0",
                isAgreed: true,
              },
            ]
          : []),
        ...(isMinor
          ? [
              {
                registrationId: registration.id,
                consentType: "GUARDIAN_SAFEGUARDING",
                policyVersion: "1.0",
                guardianName: formData.guardianName?.trim(),
                guardianPhone: formData.guardianPhone?.trim(),
                guardianRelation: formData.guardianRelation?.trim(),
                isAgreed: true,
              },
            ]
          : []),
      ],
    });

    // 8. Dispatch Non-blocking Email
    const baseUrl = process.env.APP_URL || "http://localhost:3000";
    const paymentPageUrl = `${baseUrl}/register?step=payment&ref=${encodeURIComponent(registration.registrationId)}`;

    sendMithilaQueenSubmissionEmail({
      to: registration.email,
      fullName: registration.fullName,
      registrationId: registration.registrationId,
      feeAmount: effectiveFee,
      paymentPageUrl,
    }).catch((emailErr) => {
      console.error("Non-blocking submission email error:", emailErr);
    });

    return {
      success: true,
      registrationId: registration.registrationId,
      fullName: registration.fullName,
      feeAmount: effectiveFee,
    };
  } catch (err: unknown) {
    console.error("Mithila Queen submission error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to submit registration.",
    };
  }
}

// -------------------------------------------------------------
// 5. SUBMIT PAYMENT TRANSACTION DETAILS
// -------------------------------------------------------------
export async function submitPaymentDetailsAction({
  registrationId,
  transactionReference,
  screenshotUrl,
}: {
  registrationId: string;
  transactionReference: string;
  screenshotUrl?: string;
}) {
  try {
    if (!transactionReference?.trim()) {
      return { success: false, error: "Please enter your bank or digital wallet transaction reference number." };
    }

    const registration = await prisma.mithilaQueenRegistration.findUnique({
      where: { registrationId: registrationId.trim().toUpperCase() },
    });

    if (!registration) {
      return { success: false, error: "Registration not found." };
    }

    // Update payment state to UNDER_REVIEW
    await prisma.mithilaQueenRegistration.update({
      where: { id: registration.id },
      data: {
        paymentReference: transactionReference.trim(),
        paymentScreenshotUrl: screenshotUrl || registration.paymentScreenshotUrl,
        paymentSubmittedAt: new Date(),
        paymentStatus: PaymentStatus.UNDER_REVIEW,
      },
    });

    // Send confirmation of payment submission
    sendMithilaQueenPaymentReceivedEmail({
      to: registration.email,
      recipientName: registration.fullName,
      registrationId: registration.registrationId,
      transactionRef: transactionReference.trim(),
    }).catch((err: unknown) => console.error("Payment received email error:", err));

    revalidatePath("/registration-status");
    revalidatePath("/admin/responses");
    return { success: true };
  } catch (err: unknown) {
    console.error("Payment details submission error:", err);
    return { success: false, error: "Failed to submit payment details." };
  }
}

// Helper function to mask email for privacy
function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return email;
  const [localPart, domain] = email.split("@");
  if (localPart.length <= 2) {
    return `${localPart[0] || "*"}***@${domain}`;
  }
  const first = localPart.slice(0, 2);
  const last = localPart.slice(-1);
  return `${first}****${last}@${domain}`;
}

// Helper function to mask phone for privacy
function maskPhone(phone: string): string {
  if (!phone || phone.length < 6) return phone;
  const clean = phone.trim();
  const visibleStart = clean.slice(0, 4);
  const visibleEnd = clean.slice(-3);
  return `${visibleStart}****${visibleEnd}`;
}

// -------------------------------------------------------------
// 6. STATUS LOOKUP WITH EMAIL OTP (Zero Data Leaks)
// -------------------------------------------------------------
export async function requestStatusLookupOtpAction({
  email,
  registrationId,
}: {
  email: string;
  registrationId?: string;
}) {
  try {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { success: false, error: "Valid email address is required." };
    }

    // Look up registration
    const reg = await prisma.mithilaQueenRegistration.findFirst({
      where: {
        email: cleanEmail,
        ...(registrationId ? { registrationId: registrationId.trim().toUpperCase() } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    if (!reg) {
      return {
        success: false,
        error: "No registration record was found with this email address. Please verify your email or complete registration.",
      };
    }

    // Rate limit: max 5 requests in 15 minutes
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recentRequestsCount = await prisma.emailVerification.count({
      where: {
        email: cleanEmail,
        createdAt: { gte: fifteenMinsAgo },
      },
    });

    if (recentRequestsCount >= 5) {
      return {
        success: false,
        error: "Too many verification requests. Please wait 15 minutes before requesting another code.",
      };
    }

    const form = await getMithilaQueenForm();
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const codeHash = hashOtp(otpCode);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const verification = await prisma.emailVerification.create({
      data: {
        formId: form?.id || "mithila-queen",
        email: cleanEmail,
        codeHash,
        expiresAt,
      },
    });

    await sendMithilaQueenStatusOtpEmail({
      to: cleanEmail,
      recipientName: reg.fullName,
      otpCode,
      expiresInMinutes: 10,
    });

    return {
      success: true,
      verificationId: verification.id,
      expiresInSeconds: 600,
    };
  } catch (err: unknown) {
    console.error("requestStatusLookupOtpAction error:", err);
    return { success: false, error: "Unable to send status access code. Please try again." };
  }
}

export async function verifyStatusLookupOtpAction({
  verificationId,
  code,
  email,
  registrationId,
}: {
  verificationId: string;
  code: string;
  email: string;
  registrationId?: string;
}) {
  try {
    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.trim();

    const record = await prisma.emailVerification.findUnique({
      where: { id: verificationId },
    });

    if (!record || record.email !== cleanEmail) {
      return { success: false, error: "Invalid verification session." };
    }

    if (new Date() > record.expiresAt) {
      return { success: false, error: "Access code has expired. Please request a new code." };
    }

    if (record.attempts >= 5) {
      return {
        success: false,
        error: "Too many incorrect attempts. This code has been invalidated for security.",
      };
    }

    const inputHash = hashOtp(cleanCode);
    if (inputHash !== record.codeHash) {
      await prisma.emailVerification.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      return { success: false, error: "Incorrect verification code. Please check your email." };
    }

    // Validated! Generate session token
    const statusSessionToken = generateSessionToken();
    await prisma.emailVerification.update({
      where: { id: record.id },
      data: {
        verified: true,
        verifiedAt: new Date(),
        sessionToken: statusSessionToken,
      },
    });

    // Query full registration dossier (excluding internal privateAdminNotes)
    const reg = await prisma.mithilaQueenRegistration.findFirst({
      where: registrationId
        ? { registrationId: registrationId.trim().toUpperCase() }
        : { email: cleanEmail },
      include: {
        statusLogs: { orderBy: { createdAt: "desc" }, take: 5 },
        paymentReviewLogs: { orderBy: { createdAt: "desc" }, take: 5 },
        editLogs: { orderBy: { createdAt: "desc" }, take: 5 },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!reg) {
      return { success: false, error: "No registration record found." };
    }

    return {
      success: true,
      sessionToken: statusSessionToken,
      isVerifiedSession: true,
      data: {
        id: reg.id,
        registrationId: reg.registrationId,
        fullName: reg.fullName,
        email: reg.email,
        phone: reg.phone,
        alternatePhone: reg.alternatePhone,
        dob: reg.dob.toISOString().split("T")[0],
        isMinor: reg.isMinor,
        province: reg.province,
        district: reg.district,
        municipality: reg.municipality,
        cityVillage: reg.cityVillage,
        currentAddress: reg.currentAddress,

        guardianName: reg.guardianName,
        guardianPhone: reg.guardianPhone,
        guardianRelation: reg.guardianRelation,
        guardianEmail: reg.guardianEmail,

        personalIntro: reg.personalIntro,
        hobbiesInterests: reg.hobbiesInterests,
        talentsSkills: reg.talentsSkills,
        languagesSpoken: reg.languagesSpoken,
        culturalInterests: reg.culturalInterests,
        motivationReason: reg.motivationReason,
        mithilaMeaning: reg.mithilaMeaning,
        qualitiesBrought: reg.qualitiesBrought,
        educationLevel: reg.educationLevel,
        institution: reg.institution,
        previousExperience: reg.previousExperience,
        experienceDetails: reg.experienceDetails,

        instagramHandle: reg.instagramHandle,
        tiktokHandle: reg.tiktokHandle,
        facebookUrl: reg.facebookUrl,
        profilePhotoUrl: reg.profilePhotoUrl,
        videoUrl: reg.videoUrl,
        documentUrl: reg.documentUrl,

        paymentStatus: reg.paymentStatus,
        applicationStatus: reg.applicationStatus,
        paymentReference: reg.paymentReference,
        paymentScreenshotUrl: reg.paymentScreenshotUrl,
        paymentClarificationNotes: reg.paymentClarificationNotes,
        rejectionReason: reg.rejectionReason,
        actionRequiredDetails: reg.actionRequiredDetails,
        submittedAt: reg.submittedAt,
        isPdfAvailable: reg.paymentStatus === PaymentStatus.VERIFIED && reg.applicationStatus === ApplicationStatus.APPROVED,
        editLogs: reg.editLogs.map((log) => ({
          id: log.id,
          changedFields: log.changedFields,
          requiresReview: log.requiresReview,
          reviewStatus: log.reviewStatus,
          createdAt: log.createdAt,
        })),
      },
    };
  } catch (err: unknown) {
    console.error("verifyStatusLookupOtpAction error:", err);
    return { success: false, error: "Authentication failed. Unable to retrieve registration." };
  }
}

// -------------------------------------------------------------
// 6.1 LOOKUP APPLICATION BY REGISTRATION ID (Direct view without initial OTP)
// -------------------------------------------------------------
export async function lookupStatusByRegistrationIdAction({
  registrationId,
}: {
  registrationId: string;
}) {
  try {
    const cleanId = registrationId.trim().toUpperCase();
    if (!cleanId) {
      return { success: false, error: "Please enter your Registration ID (e.g. MQ-2026-XXXXX)." };
    }

    const reg = await prisma.mithilaQueenRegistration.findUnique({
      where: { registrationId: cleanId },
      include: {
        statusLogs: { orderBy: { createdAt: "desc" }, take: 5 },
        paymentReviewLogs: { orderBy: { createdAt: "desc" }, take: 5 },
        editLogs: { orderBy: { createdAt: "desc" }, take: 5 },
      },
    });

    if (!reg) {
      return {
        success: false,
        error: `No application found with Registration ID "${cleanId}". Please check the ID or search using your registered email.`,
      };
    }

    const maskedEmailStr = maskEmail(reg.email);
    const maskedPhoneStr = maskPhone(reg.phone);

    return {
      success: true,
      isVerifiedSession: false,
      maskedEmail: maskedEmailStr,
      registeredEmail: reg.email,
      data: {
        id: reg.id,
        registrationId: reg.registrationId,
        fullName: reg.fullName,
        email: maskedEmailStr,
        rawEmail: reg.email,
        phone: maskedPhoneStr,
        alternatePhone: reg.alternatePhone ? maskPhone(reg.alternatePhone) : null,
        dob: reg.dob.toISOString().split("T")[0],
        isMinor: reg.isMinor,
        province: reg.province,
        district: reg.district,
        municipality: reg.municipality,
        cityVillage: reg.cityVillage,
        currentAddress: reg.currentAddress,

        guardianName: reg.guardianName,
        guardianPhone: reg.guardianPhone ? maskPhone(reg.guardianPhone) : null,
        guardianRelation: reg.guardianRelation,
        guardianEmail: reg.guardianEmail ? maskEmail(reg.guardianEmail) : null,

        personalIntro: reg.personalIntro,
        hobbiesInterests: reg.hobbiesInterests,
        talentsSkills: reg.talentsSkills,
        languagesSpoken: reg.languagesSpoken,
        culturalInterests: reg.culturalInterests,
        motivationReason: reg.motivationReason,
        mithilaMeaning: reg.mithilaMeaning,
        qualitiesBrought: reg.qualitiesBrought,
        educationLevel: reg.educationLevel,
        institution: reg.institution,
        previousExperience: reg.previousExperience,
        experienceDetails: reg.experienceDetails,

        instagramHandle: reg.instagramHandle,
        tiktokHandle: reg.tiktokHandle,
        facebookUrl: reg.facebookUrl,
        profilePhotoUrl: reg.profilePhotoUrl,
        videoUrl: reg.videoUrl,
        documentUrl: reg.documentUrl,

        paymentStatus: reg.paymentStatus,
        applicationStatus: reg.applicationStatus,
        paymentReference: reg.paymentReference,
        paymentScreenshotUrl: reg.paymentScreenshotUrl,
        paymentClarificationNotes: reg.paymentClarificationNotes,
        rejectionReason: reg.rejectionReason,
        actionRequiredDetails: reg.actionRequiredDetails,
        submittedAt: reg.submittedAt,
        isPdfAvailable: reg.paymentStatus === PaymentStatus.VERIFIED && reg.applicationStatus === ApplicationStatus.APPROVED,
        editLogs: reg.editLogs.map((log) => ({
          id: log.id,
          changedFields: log.changedFields,
          requiresReview: log.requiresReview,
          reviewStatus: log.reviewStatus,
          createdAt: log.createdAt,
        })),
      },
    };
  } catch (err: unknown) {
    console.error("lookupStatusByRegistrationIdAction error:", err);
    return { success: false, error: "Unable to find registration record. Please try again." };
  }
}

// -------------------------------------------------------------
// 6.2 REQUEST OTP FOR REGISTRATION ID (To unlock edit permissions)
// -------------------------------------------------------------
export async function requestOtpForRegistrationIdAction({
  registrationId,
}: {
  registrationId: string;
}) {
  try {
    const cleanId = registrationId.trim().toUpperCase();
    if (!cleanId) {
      return { success: false, error: "Registration ID is required." };
    }

    const reg = await prisma.mithilaQueenRegistration.findUnique({
      where: { registrationId: cleanId },
    });

    if (!reg) {
      return { success: false, error: `No registration found with ID "${cleanId}".` };
    }

    const res = await requestStatusLookupOtpAction({
      email: reg.email,
      registrationId: reg.registrationId,
    });

    if (!res.success || !res.verificationId) {
      return { success: false, error: res.error || "Unable to dispatch verification code." };
    }

    return {
      success: true,
      verificationId: res.verificationId,
      maskedEmail: maskEmail(reg.email),
      registeredEmail: reg.email,
    };
  } catch (err: unknown) {
    console.error("requestOtpForRegistrationIdAction error:", err);
    return { success: false, error: "Unable to dispatch verification code. Please try again." };
  }
}

// -------------------------------------------------------------
// 7. PARTICIPANT SELF-SERVICE DETAIL EDITING (AUDIT TRAIL & RE-REVIEW)
// -------------------------------------------------------------
export async function participantUpdateDetailsAction({
  sessionToken,
  email,
  registrationId,
  updatedFields,
}: {
  sessionToken: string;
  email: string;
  registrationId: string;
  updatedFields: {
    fullName?: string;
    dob?: string;
    phone?: string;
    alternatePhone?: string;
    province?: string;
    district?: string;
    municipality?: string;
    cityVillage?: string;
    currentAddress?: string;

    guardianName?: string;
    guardianPhone?: string;
    guardianRelation?: string;
    guardianEmail?: string;

    personalIntro?: string;
    hobbiesInterests?: string;
    talentsSkills?: string;
    languagesSpoken?: string;
    culturalInterests?: string;
    motivationReason?: string;
    mithilaMeaning?: string;
    qualitiesBrought?: string;
    educationLevel?: string;
    institution?: string;
    previousExperience?: boolean;
    experienceDetails?: string;

    instagramHandle?: string;
    tiktokHandle?: string;
    facebookUrl?: string;
    profilePhotoUrl?: string;
    videoUrl?: string;
    documentUrl?: string;
  };
}) {
  try {
    const cleanEmail = email.toLowerCase().trim();

    const verification = await prisma.emailVerification.findFirst({
      where: {
        sessionToken,
        email: cleanEmail,
        verified: true,
      },
    });

    if (!verification) {
      return { success: false, error: "Authentication expired. Please verify your email again." };
    }

    const reg = await prisma.mithilaQueenRegistration.findUnique({
      where: { registrationId: registrationId.trim().toUpperCase() },
    });

    if (!reg || reg.email !== cleanEmail) {
      return { success: false, error: "Registration record mismatch." };
    }

    const changes: Record<string, { previous: any; updated: any }> = {};
    const sensitiveFieldsList = ["fullName", "dob", "guardianName", "guardianPhone", "guardianRelation", "guardianEmail"];
    let hasSensitiveChanges = false;

    for (const [key, val] of Object.entries(updatedFields)) {
      if (val === undefined) continue;

      let prevVal: any = (reg as any)[key];
      let newVal: any = val;

      if (key === "dob" && prevVal instanceof Date) {
        prevVal = prevVal.toISOString().split("T")[0];
      }

      if (String(prevVal ?? "").trim() !== String(newVal ?? "").trim()) {
        changes[key] = { previous: prevVal, updated: newVal };
        if (sensitiveFieldsList.includes(key)) {
          hasSensitiveChanges = true;
        }
      }
    }

    if (Object.keys(changes).length === 0) {
      return { success: true, message: "No fields were changed." };
    }

    const newApplicationStatus =
      hasSensitiveChanges && reg.applicationStatus === ApplicationStatus.APPROVED
        ? ApplicationStatus.UNDER_REVIEW
        : reg.applicationStatus;

    let updatedIsMinor = reg.isMinor;
    let updatedDob = reg.dob;
    if (updatedFields.dob) {
      const parsedDob = new Date(updatedFields.dob);
      if (!isNaN(parsedDob.getTime())) {
        updatedDob = parsedDob;
        updatedIsMinor = calculateAge(parsedDob) < 18;
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.mithilaQueenRegistration.update({
        where: { id: reg.id },
        data: {
          fullName: updatedFields.fullName?.trim() || reg.fullName,
          phone: updatedFields.phone?.trim() || reg.phone,
          alternatePhone: updatedFields.alternatePhone !== undefined ? updatedFields.alternatePhone?.trim() || null : reg.alternatePhone,
          dob: updatedDob,
          isMinor: updatedIsMinor,
          province: updatedFields.province?.trim() || reg.province,
          district: updatedFields.district?.trim() || reg.district,
          municipality: updatedFields.municipality?.trim() || reg.municipality,
          cityVillage: updatedFields.cityVillage !== undefined ? updatedFields.cityVillage?.trim() || "" : reg.cityVillage,
          currentAddress: updatedFields.currentAddress !== undefined ? updatedFields.currentAddress?.trim() || "" : reg.currentAddress,

          guardianName: updatedFields.guardianName !== undefined ? updatedFields.guardianName?.trim() || null : reg.guardianName,
          guardianPhone: updatedFields.guardianPhone !== undefined ? updatedFields.guardianPhone?.trim() || null : reg.guardianPhone,
          guardianRelation: updatedFields.guardianRelation !== undefined ? updatedFields.guardianRelation?.trim() || null : reg.guardianRelation,
          guardianEmail: updatedFields.guardianEmail !== undefined ? updatedFields.guardianEmail?.trim() || null : reg.guardianEmail,

          personalIntro: updatedFields.personalIntro !== undefined ? updatedFields.personalIntro?.trim() || null : reg.personalIntro,
          hobbiesInterests: updatedFields.hobbiesInterests !== undefined ? updatedFields.hobbiesInterests?.trim() || null : reg.hobbiesInterests,
          talentsSkills: updatedFields.talentsSkills !== undefined ? updatedFields.talentsSkills?.trim() || null : reg.talentsSkills,
          languagesSpoken: updatedFields.languagesSpoken !== undefined ? updatedFields.languagesSpoken?.trim() || null : reg.languagesSpoken,
          culturalInterests: updatedFields.culturalInterests !== undefined ? updatedFields.culturalInterests?.trim() || null : reg.culturalInterests,
          motivationReason: updatedFields.motivationReason !== undefined ? updatedFields.motivationReason?.trim() || null : reg.motivationReason,
          mithilaMeaning: updatedFields.mithilaMeaning !== undefined ? updatedFields.mithilaMeaning?.trim() || null : reg.mithilaMeaning,
          qualitiesBrought: updatedFields.qualitiesBrought !== undefined ? updatedFields.qualitiesBrought?.trim() || null : reg.qualitiesBrought,
          educationLevel: updatedFields.educationLevel !== undefined ? updatedFields.educationLevel?.trim() || null : reg.educationLevel,
          institution: updatedFields.institution !== undefined ? updatedFields.institution?.trim() || null : reg.institution,
          previousExperience: updatedFields.previousExperience !== undefined ? Boolean(updatedFields.previousExperience) : reg.previousExperience,
          experienceDetails: updatedFields.experienceDetails !== undefined ? updatedFields.experienceDetails?.trim() || null : reg.experienceDetails,

          instagramHandle: updatedFields.instagramHandle !== undefined ? updatedFields.instagramHandle?.trim() || null : reg.instagramHandle,
          tiktokHandle: updatedFields.tiktokHandle !== undefined ? updatedFields.tiktokHandle?.trim() || null : reg.tiktokHandle,
          facebookUrl: updatedFields.facebookUrl !== undefined ? updatedFields.facebookUrl?.trim() || null : reg.facebookUrl,
          profilePhotoUrl: updatedFields.profilePhotoUrl !== undefined ? updatedFields.profilePhotoUrl?.trim() || null : reg.profilePhotoUrl,
          videoUrl: updatedFields.videoUrl !== undefined ? updatedFields.videoUrl?.trim() || null : reg.videoUrl,
          documentUrl: updatedFields.documentUrl !== undefined ? updatedFields.documentUrl?.trim() || null : reg.documentUrl,

          applicationStatus: newApplicationStatus,
        },
      });

      await tx.registrationEditLog.create({
        data: {
          registrationId: reg.id,
          changedFields: changes,
          changedByEmail: cleanEmail,
          requiresReview: hasSensitiveChanges,
          reviewStatus: hasSensitiveChanges ? "PENDING" : "APPROVED",
        },
      });
    });

    sendMithilaQueenDetailsUpdatedEmail({
      to: cleanEmail,
      recipientName: reg.fullName,
      registrationId: reg.registrationId,
      updatedFieldsList: Object.keys(changes),
    }).catch((err: unknown) => console.error("Details updated email error:", err));

    revalidatePath("/registration-status");
    revalidatePath("/admin/responses");

    return {
      success: true,
      requiresReview: hasSensitiveChanges,
      updatedFieldsCount: Object.keys(changes).length,
    };
  } catch (err: unknown) {
    console.error("participantUpdateDetailsAction error:", err);
    return { success: false, error: "Failed to update details. Please try again." };
  }
}

// -------------------------------------------------------------
// 8. DOWNLOAD APPROVED PDF ACTION
// -------------------------------------------------------------
export async function downloadApprovedPdfAction({
  registrationId,
  verificationContact,
}: {
  registrationId: string;
  verificationContact: string;
}) {
  try {
    const reg = await prisma.mithilaQueenRegistration.findUnique({
      where: { registrationId: registrationId.trim().toUpperCase() },
    });

    if (!reg) {
      return { success: false, error: "Registration record not found." };
    }

    const contactInput = verificationContact.trim().toLowerCase();
    const cleanPhoneInput = verificationContact.replace(/\D/g, "");
    const cleanRegPhone = reg.phone.replace(/\D/g, "");
    const isEmailMatch = reg.email.toLowerCase() === contactInput;
    const isPhoneMatch = cleanPhoneInput.length >= 7 && cleanRegPhone.endsWith(cleanPhoneInput);

    if (!isEmailMatch && !isPhoneMatch) {
      return { success: false, error: "Authentication failed. Contact mismatch." };
    }

    if (reg.paymentStatus !== PaymentStatus.VERIFIED || reg.applicationStatus !== ApplicationStatus.APPROVED) {
      return {
        success: false,
        error: "Confirmation PDF is generated only after payment is verified and your application is approved.",
      };
    }

    const verificationCode = reg.pdfVerificationCode || generateVerifyCode();
    if (!reg.pdfVerificationCode) {
      await prisma.mithilaQueenRegistration.update({
        where: { id: reg.id },
        data: { pdfVerificationCode: verificationCode, pdfGeneratedAt: new Date() },
      });
    }

    const pdfBytes = await generateRegistrationConfirmationPdf({
      registrationId: reg.registrationId,
      fullName: reg.fullName,
      dob: reg.dob,
      email: reg.email,
      phone: reg.phone,
      province: reg.province,
      district: reg.district,
      submittedAt: reg.submittedAt,
      verifiedAt: reg.paymentVerifiedAt,
      approvedAt: reg.approvedAt,
      verificationCode,
      registrationFee: reg.registrationFee,
    });

    return {
      success: true,
      pdfBase64: Buffer.from(pdfBytes).toString("base64"),
      filename: `Mithila-Queen-Confirmation-${reg.registrationId}.pdf`,
    };
  } catch (err: unknown) {
    console.error("PDF download action error:", err);
    return { success: false, error: "Failed to generate PDF document." };
  }
}

// -------------------------------------------------------------
// 9. ADMIN VERIFY PAYMENT
// -------------------------------------------------------------
export async function adminVerifyPaymentAction({
  registrationId,
  decision,
  notes,
}: {
  registrationId: string;
  decision: "VERIFY" | "REQUEST_CLARIFICATION";
  notes?: string;
}) {
  const admin = await requireAdmin();

  const reg = await prisma.mithilaQueenRegistration.findUnique({
    where: { registrationId },
  });

  if (!reg) return { success: false, error: "Registration not found." };

  if (decision === "VERIFY") {
    await prisma.$transaction(async (tx) => {
      await tx.mithilaQueenRegistration.update({
        where: { id: reg.id },
        data: {
          paymentStatus: PaymentStatus.VERIFIED,
          paymentVerifiedAt: new Date(),
          paymentVerifiedById: admin.id,
          applicationStatus: ApplicationStatus.UNDER_REVIEW,
          paymentClarificationNotes: null,
        },
      });

      await tx.paymentReviewLog.create({
        data: {
          registrationId: reg.id,
          status: PaymentStatus.VERIFIED,
          reviewerId: admin.id,
          reviewerEmail: admin.email,
          notes: notes || "Payment verified against official bank records.",
        },
      });

      await tx.registrationStatusLog.create({
        data: {
          registrationId: reg.id,
          statusType: "PAYMENT",
          previousStatus: reg.paymentStatus,
          newStatus: PaymentStatus.VERIFIED,
          changedById: admin.id,
          changedByEmail: admin.email,
          reason: notes || "Payment verified.",
        },
      });
    });
  } else {
    await prisma.$transaction(async (tx) => {
      await tx.mithilaQueenRegistration.update({
        where: { id: reg.id },
        data: {
          paymentStatus: PaymentStatus.CLARIFICATION_REQUIRED,
          paymentClarificationNotes: notes || "Please re-upload a clear receipt or verify transaction ID.",
        },
      });

      await tx.paymentReviewLog.create({
        data: {
          registrationId: reg.id,
          status: PaymentStatus.CLARIFICATION_REQUIRED,
          reviewerId: admin.id,
          reviewerEmail: admin.email,
          notes: notes || "Clarification required.",
        },
      });
    });
  }

  revalidatePath("/admin/responses");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

// -------------------------------------------------------------
// 10. ADMIN ADJUDICATE APPLICATION
// -------------------------------------------------------------
export async function adminAdjudicateApplicationAction({
  registrationId,
  decision,
  reason,
  privateNotes,
}: {
  registrationId: string;
  decision: "APPROVE" | "REJECT" | "ACTION_REQUIRED";
  reason?: string;
  privateNotes?: string;
}) {
  const admin = await requireAdmin();

  const reg = await prisma.mithilaQueenRegistration.findUnique({
    where: { registrationId },
  });

  if (!reg) return { success: false, error: "Registration not found." };

  if (decision === "APPROVE") {
    if (reg.paymentStatus !== PaymentStatus.VERIFIED) {
      return {
        success: false,
        error: `Cannot approve application. The NPR ${reg.registrationFee} payment must be independently verified first.`,
      };
    }

    const verificationCode = reg.pdfVerificationCode || generateVerifyCode();

    const pdfBytes = await generateRegistrationConfirmationPdf({
      registrationId: reg.registrationId,
      fullName: reg.fullName,
      dob: reg.dob,
      email: reg.email,
      phone: reg.phone,
      province: reg.province,
      district: reg.district,
      submittedAt: reg.submittedAt,
      verifiedAt: reg.paymentVerifiedAt || new Date(),
      approvedAt: new Date(),
      verificationCode,
      registrationFee: reg.registrationFee,
    });

    await prisma.$transaction(async (tx) => {
      await tx.mithilaQueenRegistration.update({
        where: { id: reg.id },
        data: {
          applicationStatus: ApplicationStatus.APPROVED,
          approvedAt: new Date(),
          approvedById: admin.id,
          pdfVerificationCode: verificationCode,
          pdfGeneratedAt: new Date(),
          privateAdminNotes: privateNotes || reg.privateAdminNotes,
        },
      });

      await tx.registrationStatusLog.create({
        data: {
          registrationId: reg.id,
          statusType: "APPLICATION",
          previousStatus: reg.applicationStatus,
          newStatus: ApplicationStatus.APPROVED,
          changedById: admin.id,
          changedByEmail: admin.email,
          reason: reason || "Application approved following review.",
        },
      });
    });

    sendMithilaQueenApprovalEmail({
      to: reg.email,
      fullName: reg.fullName,
      registrationId: reg.registrationId,
      pdfBuffer: pdfBytes,
    }).catch((emailErr) => {
      console.error("Non-blocking approval email error:", emailErr);
    });
  } else if (decision === "REJECT") {
    await prisma.$transaction(async (tx) => {
      await tx.mithilaQueenRegistration.update({
        where: { id: reg.id },
        data: {
          applicationStatus: ApplicationStatus.REJECTED,
          rejectedAt: new Date(),
          rejectedById: admin.id,
          rejectionReason: reason || "Did not meet current criteria.",
          privateAdminNotes: privateNotes || reg.privateAdminNotes,
        },
      });

      await tx.registrationStatusLog.create({
        data: {
          registrationId: reg.id,
          statusType: "APPLICATION",
          previousStatus: reg.applicationStatus,
          newStatus: ApplicationStatus.REJECTED,
          changedById: admin.id,
          changedByEmail: admin.email,
          reason: reason || "Application rejected.",
        },
      });
    });
  } else {
    await prisma.$transaction(async (tx) => {
      await tx.mithilaQueenRegistration.update({
        where: { id: reg.id },
        data: {
          applicationStatus: ApplicationStatus.ACTION_REQUIRED,
          actionRequiredDetails: reason || "Please provide missing details or updated contact.",
          privateAdminNotes: privateNotes || reg.privateAdminNotes,
        },
      });

      await tx.registrationStatusLog.create({
        data: {
          registrationId: reg.id,
          statusType: "APPLICATION",
          previousStatus: reg.applicationStatus,
          newStatus: ApplicationStatus.ACTION_REQUIRED,
          changedById: admin.id,
          changedByEmail: admin.email,
          reason: reason || "Action required.",
        },
      });
    });
  }

  revalidatePath("/admin/responses");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

// -------------------------------------------------------------
// 11. LEGACY STATUS LOOKUP (Backward compatibility)
// -------------------------------------------------------------
export async function lookupRegistrationStatusAction({
  registrationId,
  verificationContact,
}: {
  registrationId: string;
  verificationContact: string;
}) {
  try {
    if (!registrationId?.trim() || !verificationContact?.trim()) {
      return { success: false, error: "Both Registration ID and verification contact (Email or Phone) are required." };
    }

    const reg = await prisma.mithilaQueenRegistration.findUnique({
      where: { registrationId: registrationId.trim().toUpperCase() },
      select: {
        id: true,
        registrationId: true,
        fullName: true,
        email: true,
        phone: true,
        province: true,
        district: true,
        paymentStatus: true,
        applicationStatus: true,
        paymentReference: true,
        paymentClarificationNotes: true,
        rejectionReason: true,
        actionRequiredDetails: true,
        submittedAt: true,
        pdfGeneratedAt: true,
        pdfVerificationCode: true,
      },
    });

    if (!reg) {
      return { success: false, error: "No registration found with this ID." };
    }

    const contactInput = verificationContact.trim().toLowerCase();
    const cleanPhoneInput = verificationContact.replace(/\D/g, "");
    const cleanRegPhone = reg.phone.replace(/\D/g, "");

    const isEmailMatch = reg.email.toLowerCase() === contactInput;
    const isPhoneMatch = cleanPhoneInput.length >= 7 && cleanRegPhone.endsWith(cleanPhoneInput);

    if (!isEmailMatch && !isPhoneMatch) {
      return {
        success: false,
        error: "The provided contact details do not match the registered record for this ID.",
      };
    }

    return {
      success: true,
      data: {
        registrationId: reg.registrationId,
        fullName: reg.fullName,
        province: reg.province,
        district: reg.district,
        paymentStatus: reg.paymentStatus,
        applicationStatus: reg.applicationStatus,
        paymentReference: reg.paymentReference,
        paymentClarificationNotes: reg.paymentClarificationNotes,
        rejectionReason: reg.rejectionReason,
        actionRequiredDetails: reg.actionRequiredDetails,
        submittedAt: reg.submittedAt,
        isPdfAvailable: reg.paymentStatus === PaymentStatus.VERIFIED && reg.applicationStatus === ApplicationStatus.APPROVED,
      },
    };
  } catch (err) {
    return { success: false, error: "Unable to retrieve registration record." };
  }
}

"use server";

import { z } from "zod";
import { customAlphabet } from "nanoid";
import { prisma } from "@/lib/db/prisma";
import { PaymentStatus, ApplicationStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth/guards";
import { revalidatePath } from "next/cache";
import {
  sendMithilaQueenSubmissionEmail,
  sendMithilaQueenApprovalEmail,
} from "@/lib/email/client";
import { generateRegistrationConfirmationPdf } from "@/lib/pdf/generate-confirmation";

const generateRefCode = customAlphabet("23456789ABCDEFGHJKLMNPQRSTUVWXYZ", 6);
const generateVerifyCode = customAlphabet("23456789ABCDEFGHJKLMNPQRSTUVWXYZ", 8);

// Helper to determine minor age
function calculateAge(dob: Date): number {
  const diffMs = Date.now() - dob.getTime();
  const ageDt = new Date(diffMs);
  return Math.abs(ageDt.getUTCFullYear() - 1970);
}

// 1. SUBMIT REGISTRATION WIZARD
export async function submitMithilaQueenRegistrationAction(formData: {
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

  // Photos
  profilePhotoUrl?: string;
  additionalPhotoUrl?: string;
  documentUrl?: string;

  // Consent checkboxes
  agreedToRules: boolean;
  agreedToMedia: boolean;
  agreedToPrivacy: boolean;
}) {
  try {
    // 1. Basic validation
    if (!formData.fullName?.trim() || formData.fullName.trim().length < 2) {
      return { success: false, error: "Full legal name is required (at least 2 characters)." };
    }
    if (!formData.email?.trim() || !formData.email.includes("@")) {
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

    // 5. Generate Reference ID: MQ-YYYY-XXXXXX
    const currentYear = new Date().getFullYear();
    const registrationId = `MQ-${currentYear}-${generateRefCode()}`;

    // 6. Database creation
    const registration = await prisma.mithilaQueenRegistration.create({
      data: {
        registrationId,
        fullName: formData.fullName.trim(),
        dob: birthDate,
        isMinor,
        email: formData.email.trim().toLowerCase(),
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

        registrationFee: 399,
        paymentStatus: PaymentStatus.PENDING,
        applicationStatus: ApplicationStatus.SUBMITTED,
      },
    });

    // 7. Record Consents
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
    const paymentPageUrl = `${baseUrl}/register?step=payment&ref=${encodeURIComponent(registrationId)}`;

    sendMithilaQueenSubmissionEmail({
      to: registration.email,
      fullName: registration.fullName,
      registrationId: registration.registrationId,
      feeAmount: 399,
      paymentPageUrl,
    }).catch((emailErr) => {
      console.error("Non-blocking submission email error:", emailErr);
    });

    return {
      success: true,
      registrationId: registration.registrationId,
      fullName: registration.fullName,
      feeAmount: 399,
    };
  } catch (err: unknown) {
    console.error("Mithila Queen submission error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to submit registration.",
    };
  }
}

// 2. SUBMIT PAYMENT TRANSACTION DETAILS
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
      where: { registrationId },
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

    return { success: true };
  } catch (err: unknown) {
    console.error("Payment details submission error:", err);
    return { success: false, error: "Failed to submit payment details." };
  }
}

// 3. SECURE STATUS LOOKUP
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

    // Strict Contact Verification to protect participant privacy
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

// 4. DOWNLOAD PDF ACTION (Client side download helper)
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

    // Verify contact
    const contactInput = verificationContact.trim().toLowerCase();
    const cleanPhoneInput = verificationContact.replace(/\D/g, "");
    const cleanRegPhone = reg.phone.replace(/\D/g, "");
    const isEmailMatch = reg.email.toLowerCase() === contactInput;
    const isPhoneMatch = cleanPhoneInput.length >= 7 && cleanRegPhone.endsWith(cleanPhoneInput);

    if (!isEmailMatch && !isPhoneMatch) {
      return { success: false, error: "Authentication failed. Contact mismatch." };
    }

    // Must be verified and approved
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

// 5. ADMIN VERIFY PAYMENT
export async function adminVerifyPaymentAction({
  registrationId,
  decision, // "VERIFY" | "REQUEST_CLARIFICATION"
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
          // Advance application to review now that payment is verified
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
    // Request clarification
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

// 6. ADMIN ADJUDICATE APPLICATION (APPROVE / REJECT / ACTION_REQUIRED)
export async function adminAdjudicateApplicationAction({
  registrationId,
  decision, // "APPROVE" | "REJECT" | "ACTION_REQUIRED"
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
    // SECURITY: Must have verified payment before approval!
    if (reg.paymentStatus !== PaymentStatus.VERIFIED) {
      return {
        success: false,
        error: "Cannot approve application. The NPR 399 payment must be independently verified first.",
      };
    }

    const verificationCode = reg.pdfVerificationCode || generateVerifyCode();

    // 1. Generate PDF Confirmation
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
    });

    // 2. Update Database Record
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

    // 3. Dispatch Approval Email with PDF attachment (non-blocking)
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
    // Action required
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


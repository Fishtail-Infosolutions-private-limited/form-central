"use server";

import crypto from "crypto";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/db/prisma";
import { sendOtpVerificationEmail } from "@/lib/email/client";

function hashOtp(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export async function sendOtpAction({
  formId,
  email,
  fullName,
  phone,
}: {
  formId: string;
  email: string;
  fullName: string;
  phone: string;
}) {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Verify form exists and is open
  const form = await prisma.registrationForm.findUnique({
    where: { id: formId },
  });

  if (!form || form.status !== "PUBLISHED") {
    return { success: false, error: "This competition is not currently accepting registrations." };
  }

  const now = new Date();
  if (form.opensAt && form.opensAt > now) {
    return { success: false, error: "Registration has not yet opened for this event." };
  }
  if (form.closesAt && form.closesAt < now) {
    return { success: false, error: "Registration for this event is now closed." };
  }

  // 2. Rate limit check: Max 4 requests in last 15 mins for this email & form
  const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
  const recentRequestsCount = await prisma.emailVerification.count({
    where: {
      formId,
      email: normalizedEmail,
      createdAt: { gte: fifteenMinsAgo },
    },
  });

  if (recentRequestsCount >= 4) {
    return {
      success: false,
      error: "Too many verification requests. Please wait 15 minutes before requesting another code.",
    };
  }

  // 3. Generate 6-digit numeric OTP
  const otpCode = crypto.randomInt(100000, 999999).toString();
  const codeHash = hashOtp(otpCode);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // 4. Save verification record in PostgreSQL
  const verification = await prisma.emailVerification.create({
    data: {
      formId,
      email: normalizedEmail,
      codeHash,
      expiresAt,
    },
  });

  // 5. Send actual email via Nodemailer
  try {
    await sendOtpVerificationEmail({
      to: normalizedEmail,
      recipientName: fullName.trim() || "Participant",
      otpCode,
      formName: form.name,
      expiresInMinutes: 10,
    });
  } catch (err: unknown) {
    console.error("Failed to send OTP email:", err);
    return {
      success: false,
      error: "Failed to deliver verification email. Please check your email address and try again.",
    };
  }

  return {
    success: true,
    verificationId: verification.id,
    expiresInSeconds: 600,
  };
}

export async function verifyOtpAction({
  verificationId,
  code,
  email,
  formId,
}: {
  verificationId: string;
  code: string;
  email: string;
  formId: string;
}) {
  const normalizedEmail = email.toLowerCase().trim();
  const cleanedCode = code.trim();

  const record = await prisma.emailVerification.findUnique({
    where: { id: verificationId },
  });

  if (!record || record.email !== normalizedEmail || record.formId !== formId) {
    return { success: false, error: "Invalid verification record. Please request a new code." };
  }

  if (record.verified) {
    return { success: true, token: record.sessionToken };
  }

  // Check expiration
  if (new Date() > record.expiresAt) {
    return { success: false, error: "Verification code has expired. Please request a new one." };
  }

  // Check brute force attempts
  if (record.attempts >= 5) {
    return {
      success: false,
      error: "Too many incorrect attempts. For security, this code has been invalidated. Please request a new code.",
    };
  }

  // Compare hash
  const inputHash = hashOtp(cleanedCode);
  if (inputHash !== record.codeHash) {
    const updated = await prisma.emailVerification.update({
      where: { id: verificationId },
      data: { attempts: { increment: 1 } },
    });
    const remaining = 5 - updated.attempts;
    return {
      success: false,
      error: `Incorrect code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
    };
  }

  // Successfully verified!
  const sessionToken = nanoid(36);
  await prisma.emailVerification.update({
    where: { id: verificationId },
    data: {
      verified: true,
      verifiedAt: new Date(),
      sessionToken,
    },
  });

  // Check if an existing registration exists for this email
  let existingRegistration: {
    found: boolean;
    referenceNumber: string;
    applicationStatus: string;
    paymentStatus: string;
    submittedAt?: string;
    rejectionReason?: string | null;
    answers: Record<string, any>;
  } | null = null;

  try {
    const mqReg = await prisma.mithilaQueenRegistration.findFirst({
      where: { email: normalizedEmail },
      orderBy: { submittedAt: "desc" },
    });

    if (mqReg) {
      existingRegistration = {
        found: true,
        referenceNumber: mqReg.registrationId,
        applicationStatus: mqReg.applicationStatus,
        paymentStatus: mqReg.paymentStatus,
        submittedAt: mqReg.submittedAt.toISOString(),
        rejectionReason: mqReg.rejectionReason || null,
        answers: {
          fullName: mqReg.fullName,
          email: mqReg.email,
          phone: mqReg.phone,
          dob: mqReg.dob ? mqReg.dob.toISOString().split("T")[0] : "",
          alternatePhone: mqReg.alternatePhone || "",
          province: mqReg.province || "",
          district: mqReg.district || "",
          municipality: mqReg.municipality || "",
          cityVillage: mqReg.cityVillage || "",
          currentAddress: mqReg.currentAddress || "",
          guardianName: mqReg.guardianName || "",
          guardianPhone: mqReg.guardianPhone || "",
          guardianRelation: mqReg.guardianRelation || "",
          guardianConsent: mqReg.guardianConsentRecorded || false,
          motivationReason: mqReg.motivationReason || "",
          mithilaMeaning: mqReg.mithilaMeaning || "",
          qualitiesBrought: mqReg.qualitiesBrought || "",
          talentsSkills: mqReg.talentsSkills || "",
          languagesSpoken: mqReg.languagesSpoken || "",
          culturalInterests: mqReg.culturalInterests || "",
          hobbiesInterests: mqReg.hobbiesInterests || "",
          educationLevel: mqReg.educationLevel || "",
          institution: mqReg.institution || "",
          previousExperience: mqReg.previousExperience || false,
          experienceDetails: mqReg.experienceDetails || "",
          heightCm: mqReg.heightCm ? String(mqReg.heightCm) : "",
          instagramHandle: mqReg.instagramHandle || "",
          tiktokHandle: mqReg.tiktokHandle || "",
          facebookUrl: mqReg.facebookUrl || "",
          paymentReference: mqReg.paymentReference || "",
          transactionReference: mqReg.paymentReference || "",
          paymentScreenshot: mqReg.paymentScreenshotUrl || "",
        },
      };
    } else {
      const sub = await prisma.registrationSubmission.findFirst({
        where: { email: normalizedEmail, formId },
        orderBy: { createdAt: "desc" },
        include: { answers: true },
      });

      if (sub) {
        const extracted: Record<string, any> = {
          fullName: sub.fullName,
          email: sub.email,
          phone: sub.phone,
        };
        for (const ans of sub.answers) {
          extracted[ans.fieldKey] = ans.value;
        }

        existingRegistration = {
          found: true,
          referenceNumber: sub.referenceNumber,
          applicationStatus:
            sub.status === "APPROVED"
              ? "APPROVED"
              : sub.status === "REJECTED"
              ? "REJECTED"
              : "SUBMITTED",
          paymentStatus: "PENDING",
          submittedAt: sub.createdAt.toISOString(),
          rejectionReason: null,
          answers: extracted,
        };
      }
    }
  } catch (lookupErr) {
    console.error("Error looking up existing registration in verifyOtpAction:", lookupErr);
  }

  return {
    success: true,
    token: sessionToken,
    existingRegistration,
  };
}


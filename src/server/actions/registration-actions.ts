"use server";

import { customAlphabet } from "nanoid";
import { prisma } from "@/lib/db/prisma";
import { FormSchemaDefinition, FormFieldDefinition } from "@/types/form";
import { checkFormAvailability } from "@/lib/forms/availability";
import { sendRegistrationConfirmationEmail } from "@/lib/email/client";
import { formatNepalDateTime } from "@/lib/utils/timezone";

const generateRefCode = customAlphabet("23456789ABCDEFGHJKLMNPQRSTUVWXYZ", 6);

export async function submitRegistrationAction({
  formSlug,
  verificationToken,
  answers,
  fileIds = [],
}: {
  formSlug: string;
  verificationToken: string;
  answers: Record<string, any>;
  fileIds?: string[];
}) {
  // 1. Fetch Form & Published Version
  const form = await prisma.registrationForm.findUnique({
    where: { slug: formSlug },
    include: {
      versions: {
        where: { status: "PUBLISHED" },
        orderBy: { versionNumber: "desc" },
        take: 1,
      },
    },
  });

  if (!form) {
    return { success: false, error: "Registration form not found." };
  }

  // 1. Centralized Form Availability Check (Pre-flight)
  const availability = await checkFormAvailability(form);
  if (!availability.isAvailable) {
    return { success: false, error: availability.message };
  }

  const publishedVersion = form.versions[0];
  if (!publishedVersion) {
    return { success: false, error: "No published form schema found for this event." };
  }

  // 2. Validate OTP Verification Session
  const verification = await prisma.emailVerification.findUnique({
    where: { sessionToken: verificationToken },
  });

  if (!verification || !verification.verified || verification.formId !== form.id) {
    return {
      success: false,
      error: "Email verification is missing or invalid. Please verify your email via code.",
    };
  }

  // 3. Extract and Validate System Fields
  const fullName = String(answers.fullName || "").trim();
  const email = String(answers.email || verification?.email || "").trim().toLowerCase();
  const phone = String(answers.phone || "").trim();

  // 4. Validate All Fields against Form Schema
  const schema = publishedVersion.schema as unknown as FormSchemaDefinition;
  const allFields = schema.steps.flatMap((s) => s.fields);

  const nameField = allFields.find((f) => f.fieldKey === "fullName");
  const emailField = allFields.find((f) => f.fieldKey === "email");
  const phoneField = allFields.find((f) => f.fieldKey === "phone");

  const isNameReq = nameField ? nameField.required : true;
  const isEmailReq = emailField ? emailField.required : true;
  const isPhoneReq = phoneField ? phoneField.required : true;

  if (isNameReq && (!fullName || fullName.length < 2)) {
    return { success: false, error: "Full legal name is required (minimum 2 characters)." };
  }
  if (isEmailReq && (!email || !email.includes("@"))) {
    return { success: false, error: "Valid email address is required." };
  }
  if (isPhoneReq && (!phone || phone.length < 5)) {
    return { success: false, error: "Valid phone number is required." };
  }

  for (const field of allFields) {
    // Check conditional visibility
    let isVisible = true;
    if (field.condition) {
      const parentVal = answers[field.condition.fieldKey];
      if (field.condition.operator === "equals") {
        isVisible = String(parentVal || "").toLowerCase() === String(field.condition.value).toLowerCase();
      } else if (field.condition.operator === "not_equals") {
        isVisible = String(parentVal || "").toLowerCase() !== String(field.condition.value).toLowerCase();
      } else if (field.condition.operator === "is_not_empty") {
        isVisible = Boolean(parentVal && String(parentVal).trim().length > 0);
      }
    }

    if (isVisible && field.required) {
      const val = answers[field.fieldKey];
      if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
        return {
          success: false,
          error: `Please answer required field: "${field.label}"`,
        };
      }
    }
  }

  // 5. Generate Unique Reference Number: FC-2026-XXXXXX
  const referenceNumber = `FC-2026-${generateRefCode()}`;

  // 6. Execute Transaction (with atomic concurrency protection)
  let submission;
  try {
    submission = await prisma.$transaction(async (tx) => {
      // Re-verify availability inside the transaction to prevent concurrent over-capacity submissions
      const txAvailability = await checkFormAvailability(form, tx);
      if (!txAvailability.isAvailable) {
        throw new Error(txAvailability.message);
      }

      // Create Submission Record
      const sub = await tx.registrationSubmission.create({
        data: {
          referenceNumber,
          formId: form.id,
          formVersionId: publishedVersion.id,
          fullName,
          email,
          phone,
          emailVerificationId: verification.id,
          status: "PENDING",
        },
      });

      // Attach Uploaded Files and map original names for file answers
      const uploadedFilesMap = new Map<string, string>();
      if (fileIds.length > 0) {
        const files = await tx.uploadedFile.findMany({
          where: { id: { in: fileIds } },
          select: { id: true, fieldKey: true, originalName: true, storagePath: true, driveFileId: true },
        });
        for (const fl of files) {
          uploadedFilesMap.set(fl.fieldKey, fl.originalName);
          if (fl.storagePath) uploadedFilesMap.set(fl.storagePath, fl.originalName);
          if (fl.driveFileId) uploadedFilesMap.set(fl.driveFileId, fl.originalName);
        }
        await tx.uploadedFile.updateMany({
          where: { id: { in: fileIds } },
          data: {
            submissionId: sub.id,
            status: "ATTACHED",
          },
        });
      }

      // Create Answers for each answered field (storing original file names instead of server paths)
      const answerEntries = allFields
        .filter((f) => answers[f.fieldKey] !== undefined && answers[f.fieldKey] !== null)
        .map((f) => {
          let val = answers[f.fieldKey];
          if (["image", "video", "file"].includes(f.type)) {
            const origName = uploadedFilesMap.get(f.fieldKey) || uploadedFilesMap.get(String(val));
            if (origName) {
              val = origName;
            }
          }
          return {
            submissionId: sub.id,
            fieldKey: f.fieldKey,
            fieldLabel: f.label,
            fieldType: f.type,
            value: val,
          };
        });

      if (answerEntries.length > 0) {
        await tx.submissionAnswer.createMany({
          data: answerEntries,
        });
      }

      return sub;
    });
  } catch (txErr: unknown) {
    const errorMsg = txErr instanceof Error ? txErr.message : "Registration submission failed.";
    return { success: false, error: errorMsg };
  }

  // 7. Dispatch Automatic Confirmation Email (Non-blocking background delivery)
  try {
    const formattedDateNpt = formatNepalDateTime(submission.submittedAt);
    const baseUrl = process.env.APP_URL || "http://localhost:3000";
    const viewDetailsUrl = `${baseUrl}/register/${form.slug}`;

    sendRegistrationConfirmationEmail({
      to: submission.email,
      participantName: submission.fullName,
      eventTitle: form.name,
      referenceNumber: submission.referenceNumber,
      submissionDate: formattedDateNpt,
      status: "Confirmed",
      viewDetailsUrl,
    }).catch((emailErr: unknown) => {
      console.error("Non-blocking confirmation email delivery error:", emailErr);
    });
  } catch (emailSetupErr) {
    console.error("Confirmation email setup error:", emailSetupErr);
  }

  return {
    success: true,
    referenceNumber: submission.referenceNumber,
    submittedAt: submission.submittedAt,
    formName: form.name,
    fullName: submission.fullName,
    email: submission.email,
  };
}


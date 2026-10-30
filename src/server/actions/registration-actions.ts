"use server";

import { customAlphabet } from "nanoid";
import { prisma } from "@/lib/db/prisma";
import { FormSchemaDefinition, FormFieldDefinition } from "@/types/form";

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

  if (!form || form.status !== "PUBLISHED") {
    return { success: false, error: "This registration form is currently unavailable or unpublished." };
  }

  const now = new Date();
  if (form.opensAt && form.opensAt > now) {
    return { success: false, error: "Registration has not yet opened for this event." };
  }
  if (form.closesAt && form.closesAt < now) {
    return { success: false, error: "Registration for this event is closed." };
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

  // 6. Execute Transaction
  const submission = await prisma.$transaction(async (tx) => {
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

  return {
    success: true,
    referenceNumber: submission.referenceNumber,
    submittedAt: submission.submittedAt,
    formName: form.name,
    fullName: submission.fullName,
    email: submission.email,
  };
}


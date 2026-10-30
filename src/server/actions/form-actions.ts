"use server";

import { z } from "zod";
import slugify from "slugify";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { FormStatus } from "@prisma/client";
import { FormSchemaDefinition } from "@/types/form";
import { deleteMultiplePhysicalFiles } from "@/lib/storage/cleanup";
import { nepalDateAndTimeToUtc } from "@/lib/utils/timezone";

const createFormSchema = z.object({
  name: z.string().min(3, "Form name must be at least 3 characters").trim(),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must only contain lowercase letters, numbers, and single hyphens")
    .trim(),
  description: z.string().optional(),
  instructions: z.string().optional(),
  opensAt: z.string().optional(),
  closesAt: z.string().optional(),
});

// Default initial schema ensuring Mandatory Participant Fields
function getInitialFormSchema(): FormSchemaDefinition {
  return {
    steps: [
      {
        id: "step-1",
        title: "Personal Information",
        description: "Mandatory participant contact information and email verification",
        order: 0,
        fields: [
          {
            id: "system-fullname",
            fieldKey: "fullName",
            type: "text",
            label: "Full Name",
            placeholder: "Official legal name",
            description: "As printed on your citizenship or passport",
            required: true,
            isSystem: true,
            order: 0,
          },
          {
            id: "system-email",
            fieldKey: "email",
            type: "email",
            label: "Email Address",
            placeholder: "participant@example.com",
            description: "Used for email verification code and registration receipts",
            required: true,
            isSystem: true,
            order: 1,
          },
          {
            id: "system-phone",
            fieldKey: "phone",
            type: "phone",
            label: "Phone Number",
            placeholder: "+977 98...",
            description: "Primary mobile contact for event notices",
            required: true,
            isSystem: true,
            order: 2,
          },
        ],
      },
      {
        id: "step-2",
        title: "Entry & Category Details",
        description: "Select division, track, or competition category",
        order: 1,
        fields: [
          {
            id: "field-category",
            fieldKey: "category",
            type: "select",
            label: "Competition / Event Category",
            placeholder: "Select category or division",
            required: true,
            order: 0,
            options: [
              { label: "General Division / Open Track", value: "open" },
              { label: "Competitive Division / Advanced", value: "competitive" },
              { label: "Student / Youth Division", value: "student" },
            ],
          },
        ],
      },
    ],
  };
}

export async function createFormAction(formData: FormData) {
  const admin = await requireAdmin();

  const name = formData.get("name") as string;
  let slug = (formData.get("slug") as string) || slugify(name, { lower: true, strict: true });
  const description = (formData.get("description") as string) || undefined;
  const instructions = (formData.get("instructions") as string) || undefined;
  const opensAtRaw = formData.get("opensAt") as string;
  const closesAtRaw = formData.get("closesAt") as string;

  const validated = createFormSchema.safeParse({
    name,
    slug,
    description,
    instructions,
    opensAt: opensAtRaw || undefined,
    closesAt: closesAtRaw || undefined,
  });

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || "Invalid input data",
    };
  }

  // Enforce unique slug
  const existing = await prisma.registrationForm.findUnique({
    where: { slug: validated.data.slug },
  });

  if (existing) {
    return {
      success: false,
      error: `The slug "${validated.data.slug}" is already in use. Please choose a unique URL identifier.`,
    };
  }

  // Registration Capacity Setting
  const capacityType = (formData.get("capacityType") as string) || "unlimited";
  const maxParticipantsRaw = (formData.get("maxParticipants") as string) || "";
  let isUnlimitedCapacity = true;
  let maxParticipants: number | null = null;

  if (capacityType === "limited") {
    const parsed = Number(maxParticipantsRaw);
    if (!maxParticipantsRaw || isNaN(parsed) || !Number.isInteger(parsed) || parsed < 100) {
      return {
        success: false,
        error: "Maximum participant capacity must be a whole number of at least 100.",
      };
    }
    isUnlimitedCapacity = false;
    maxParticipants = parsed;
  }

  // Registration Deadline Setting (Nepal Time UTC+05:45)
  const isDeadlineEnabledRaw = formData.get("isDeadlineEnabled");
  const isDeadlineEnabled = isDeadlineEnabledRaw === "true" || isDeadlineEnabledRaw === "on";
  const deadlineDate = formData.get("deadlineDate") as string;
  const deadlineTime = (formData.get("deadlineTime") as string) || "23:59";
  let registrationDeadline: Date | null = null;

  if (isDeadlineEnabled) {
    if (!deadlineDate) {
      return {
        success: false,
        error: "Please select a deadline date for Nepal Standard Time.",
      };
    }
    try {
      registrationDeadline = nepalDateAndTimeToUtc(deadlineDate, deadlineTime);
    } catch {
      return {
        success: false,
        error: "Invalid registration deadline date or time format.",
      };
    }
  }

  const initialSchema = getInitialFormSchema();

  // Create form and version 1 draft
  const form = await prisma.registrationForm.create({
    data: {
      name: validated.data.name,
      slug: validated.data.slug,
      description: validated.data.description,
      instructions: validated.data.instructions,
      opensAt: validated.data.opensAt ? new Date(validated.data.opensAt) : null,
      closesAt: validated.data.closesAt ? new Date(validated.data.closesAt) : null,
      isUnlimitedCapacity,
      maxParticipants,
      isDeadlineEnabled,
      registrationDeadline,
      status: FormStatus.DRAFT,
      createdById: admin.id,
      versions: {
        create: {
          versionNumber: 1,
          schema: initialSchema as any,
          status: "DRAFT",
        },
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      actorEmail: admin.email,
      action: "FORM_CREATED",
      entityType: "FORM",
      entityId: form.id,
      metadata: { slug: form.slug, name: form.name, isUnlimitedCapacity, maxParticipants, isDeadlineEnabled },
    },
  });

  revalidatePath("/admin/forms");
  revalidatePath("/admin/dashboard");
  return { success: true, formId: form.id };
}

export async function updateFormSettingsAction(formId: string, formData: FormData) {
  const admin = await requireAdmin();

  const name = formData.get("name") as string;
  const slug = (formData.get("slug") as string)?.toLowerCase().trim();
  const description = (formData.get("description") as string) || undefined;
  const instructions = (formData.get("instructions") as string) || undefined;
  const opensAtRaw = formData.get("opensAt") as string;
  const closesAtRaw = formData.get("closesAt") as string;

  const existingForm = await prisma.registrationForm.findUnique({
    where: { id: formId },
  });

  if (!existingForm) {
    return { success: false, error: "Form not found" };
  }

  // Check slug collision if slug changed
  if (slug && slug !== existingForm.slug) {
    const slugExists = await prisma.registrationForm.findUnique({
      where: { slug },
    });
    if (slugExists) {
      return { success: false, error: `Slug "${slug}" is already used by another form.` };
    }
  }

  // Capacity validation
  const capacityType = (formData.get("capacityType") as string) || "unlimited";
  const maxParticipantsRaw = (formData.get("maxParticipants") as string) || "";
  let isUnlimitedCapacity = true;
  let maxParticipants: number | null = null;

  if (capacityType === "limited") {
    const parsed = Number(maxParticipantsRaw);
    if (!maxParticipantsRaw || isNaN(parsed) || !Number.isInteger(parsed) || parsed < 100) {
      return {
        success: false,
        error: "Maximum participant capacity must be a whole number of at least 100.",
      };
    }
    isUnlimitedCapacity = false;
    maxParticipants = parsed;
  }

  // Deadline validation (Nepal Time UTC+05:45)
  const isDeadlineEnabledRaw = formData.get("isDeadlineEnabled");
  const isDeadlineEnabled = isDeadlineEnabledRaw === "true" || isDeadlineEnabledRaw === "on";
  const deadlineDate = formData.get("deadlineDate") as string;
  const deadlineTime = (formData.get("deadlineTime") as string) || "23:59";
  let registrationDeadline: Date | null = existingForm.registrationDeadline;

  if (isDeadlineEnabled) {
    if (!deadlineDate) {
      return {
        success: false,
        error: "Please select a deadline date for Nepal Standard Time.",
      };
    }
    try {
      registrationDeadline = nepalDateAndTimeToUtc(deadlineDate, deadlineTime);
    } catch {
      return {
        success: false,
        error: "Invalid registration deadline date or time format.",
      };
    }
  } else {
    // If toggled OFF, preserve the date or keep existing if practical
    registrationDeadline = existingForm.registrationDeadline;
  }

  await prisma.registrationForm.update({
    where: { id: formId },
    data: {
      name: name || existingForm.name,
      slug: slug || existingForm.slug,
      description,
      instructions,
      opensAt: opensAtRaw ? new Date(opensAtRaw) : null,
      closesAt: closesAtRaw ? new Date(closesAtRaw) : null,
      isUnlimitedCapacity,
      maxParticipants,
      isDeadlineEnabled,
      registrationDeadline,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      actorEmail: admin.email,
      action: "FORM_SETTINGS_UPDATED",
      entityType: "FORM",
      entityId: formId,
      metadata: { isUnlimitedCapacity, maxParticipants, isDeadlineEnabled },
    },
  });

  revalidatePath(`/admin/forms/${formId}`);
  revalidatePath("/admin/forms");
  revalidatePath(`/register/${slug || existingForm.slug}`);
  return { success: true };
}

export async function closeFormAction(
  formId: string
): Promise<{ success: boolean; error?: string }> {
  const admin = await requireAdmin();

  try {
    const form = await prisma.registrationForm.update({
      where: { id: formId },
      data: {
        status: FormStatus.CLOSED,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorEmail: admin.email,
        action: "FORM_MANUALLY_CLOSED",
        entityType: "FORM",
        entityId: formId,
      },
    });

    revalidatePath(`/admin/forms/${formId}`);
    revalidatePath("/admin/forms");
    revalidatePath(`/register/${form.slug}`);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to close form";
    return { success: false, error: message };
  }
}

export async function reopenFormAction(
  formId: string
): Promise<{ success: boolean; error?: string }> {
  const admin = await requireAdmin();

  try {
    const form = await prisma.registrationForm.update({
      where: { id: formId },
      data: {
        status: FormStatus.PUBLISHED,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorEmail: admin.email,
        action: "FORM_REOPENED",
        entityType: "FORM",
        entityId: formId,
      },
    });

    revalidatePath(`/admin/forms/${formId}`);
    revalidatePath("/admin/forms");
    revalidatePath(`/register/${form.slug}`);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to reopen form";
    return { success: false, error: message };
  }
}

export async function saveFormSchemaAction(formId: string, schema: FormSchemaDefinition) {
  const admin = await requireAdmin();

  // Validate mandatory system fields are intact
  const step1 = schema.steps[0];
  const hasFullName = step1?.fields.some((f) => f.fieldKey === "fullName" && f.required);
  const hasEmail = step1?.fields.some((f) => f.fieldKey === "email" && f.required);
  const hasPhone = step1?.fields.some((f) => f.fieldKey === "phone" && f.required);

  if (!hasFullName || !hasEmail || !hasPhone) {
    return {
      success: false,
      error: "Mandatory system fields (Full Name, Email, Phone Number) must remain present and required.",
    };
  }

  const latestVersion = await prisma.formVersion.findFirst({
    where: { formId },
    orderBy: { versionNumber: "desc" },
  });

  if (!latestVersion || latestVersion.status !== "DRAFT") {
    // Create new draft version
    const newVersionNumber = (latestVersion?.versionNumber || 0) + 1;
    await prisma.formVersion.create({
      data: {
        formId,
        versionNumber: newVersionNumber,
        schema: schema as any,
        status: "DRAFT",
      },
    });
  } else {
    // Update existing draft version
    await prisma.formVersion.update({
      where: { id: latestVersion.id },
      data: {
        schema: schema as any,
      },
    });
  }

  revalidatePath(`/admin/forms/${formId}/builder`);
  return { success: true };
}

export async function publishFormAction(
  formId: string,
  schema?: FormSchemaDefinition
): Promise<{ success: boolean; error?: string }> {
  const admin = await requireAdmin();

  const form = await prisma.registrationForm.findUnique({
    where: { id: formId },
    include: {
      versions: {
        orderBy: { versionNumber: "desc" },
        take: 1,
      },
    },
  });

  if (!form) return { success: false, error: "Form not found" };

  let versionToPublish = form.versions[0];

  // If a schema was explicitly sent during publish
  if (schema) {
    const nextVer = (versionToPublish?.versionNumber || 0) + 1;
    versionToPublish = await prisma.formVersion.create({
      data: {
        formId,
        versionNumber: nextVer,
        schema: schema as any,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
  } else if (versionToPublish) {
    versionToPublish = await prisma.formVersion.update({
      where: { id: versionToPublish.id },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
  } else {
    versionToPublish = await prisma.formVersion.create({
      data: {
        formId,
        versionNumber: 1,
        schema: getInitialFormSchema() as any,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
  }

  await prisma.registrationForm.update({
    where: { id: formId },
    data: {
      status: FormStatus.PUBLISHED,
      publishedVersionId: versionToPublish.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      actorEmail: admin.email,
      action: "FORM_PUBLISHED",
      entityType: "FORM",
      entityId: formId,
      metadata: { publishedVersionId: versionToPublish.id },
    },
  });

  revalidatePath(`/admin/forms/${formId}`);
  revalidatePath(`/admin/forms/${formId}/builder`);
  revalidatePath("/admin/forms");
  revalidatePath("/admin/dashboard");
  revalidatePath(`/register/${form.slug}`);

  return { success: true };
}

export async function unpublishFormAction(
  formId: string
): Promise<{ success: boolean; error?: string }> {
  const admin = await requireAdmin();

  try {
    const form = await prisma.registrationForm.update({
      where: { id: formId },
      data: {
        status: FormStatus.UNPUBLISHED,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorEmail: admin.email,
        action: "FORM_UNPUBLISHED",
        entityType: "FORM",
        entityId: formId,
      },
    });

    revalidatePath(`/admin/forms/${formId}`);
    revalidatePath("/admin/forms");
    revalidatePath(`/register/${form.slug}`);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to unpublish form";
    return { success: false, error: message };
  }
}

export async function duplicateFormAction(formId: string) {
  const admin = await requireAdmin();

  const source = await prisma.registrationForm.findUnique({
    where: { id: formId },
    include: {
      versions: {
        orderBy: { versionNumber: "desc" },
        take: 1,
      },
    },
  });

  if (!source) return { success: false, error: "Source form not found" };

  const newSlug = `${source.slug}-copy-${Math.floor(1000 + Math.random() * 9000)}`;
  const newName = `${source.name} (Copy)`;

  const duplicated = await prisma.registrationForm.create({
    data: {
      name: newName,
      slug: newSlug,
      description: source.description,
      instructions: source.instructions,
      status: FormStatus.DRAFT,
      createdById: admin.id,
      versions: {
        create: {
          versionNumber: 1,
          schema: source.versions[0]?.schema || (getInitialFormSchema() as any),
          status: "DRAFT",
        },
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      actorEmail: admin.email,
      action: "FORM_DUPLICATED",
      entityType: "FORM",
      entityId: duplicated.id,
      metadata: { sourceId: formId, newSlug },
    },
  });

  revalidatePath("/admin/forms");
  return { success: true, duplicatedId: duplicated.id };
}

export async function deleteFormAction(formId: string) {
  const admin = await requireAdmin();

  try {
    const form = await prisma.registrationForm.findUnique({
      where: { id: formId },
      select: { id: true, name: true, slug: true },
    });

    if (!form) {
      return { success: false, error: "Form not found" };
    }

    // Delete in a single transactional cascade to ensure complete database cleanup
    await prisma.$transaction(async (tx) => {
      // 1. Find all submissions for this form
      const submissions = await tx.registrationSubmission.findMany({
        where: { formId },
        select: { id: true },
      });
      const submissionIds = submissions.map((s) => s.id);

      if (submissionIds.length > 0) {
        // Query physical files to delete from disk and Google Drive
        const filesToDelete = await tx.uploadedFile.findMany({
          where: { submissionId: { in: submissionIds } },
          select: { storageProvider: true, storagePath: true, driveFileId: true },
        });

        // Delete all custom question answers
        await tx.submissionAnswer.deleteMany({
          where: { submissionId: { in: submissionIds } },
        });

        // Delete uploaded file records
        await tx.uploadedFile.deleteMany({
          where: { submissionId: { in: submissionIds } },
        });

        // Delete the submissions
        await tx.registrationSubmission.deleteMany({
          where: { formId },
        });

        // Clean up physical disk files and Google Drive videos
        await deleteMultiplePhysicalFiles(filesToDelete);
      }

      // 2. Delete email verification OTP tokens for this form
      await tx.emailVerification.deleteMany({
        where: { formId },
      });

      // 3. Clear publishedVersionId to prevent cyclical foreign key constraint
      await tx.registrationForm.update({
        where: { id: formId },
        data: { publishedVersionId: null },
      });

      // 4. Delete immutable version snapshots
      await tx.formVersion.deleteMany({
        where: { formId },
      });

      // 5. Delete the form record itself
      await tx.registrationForm.delete({
        where: { id: formId },
      });

      // 6. Record in audit trail
      await tx.auditLog.create({
        data: {
          actorId: admin.id,
          actorEmail: admin.email,
          action: "FORM_DELETED",
          entityType: "FORM",
          entityId: formId,
          metadata: { formName: form.name, slug: form.slug },
        },
      });
    });

    revalidatePath("/admin/forms");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/responses");
    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to delete form:", err);
    const message = err instanceof Error ? err.message : "Failed to delete form";
    return { success: false, error: message };
  }
}

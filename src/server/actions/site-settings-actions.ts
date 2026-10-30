"use server";

import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { revalidatePath } from "next/cache";

export async function getSiteSettingsAction() {
  await requireAdmin();

  let setting = await prisma.siteSetting.findUnique({
    where: { id: "primary" },
  });

  if (!setting) {
    setting = await prisma.siteSetting.create({
      data: {
        id: "primary",
        organizationName: "The Origin Foundation",
        organizationTagline: "Rooted in Identity. Driven by Purpose.",
        competitionName: "Mithila Queen",
        competitionTagline: "Celebrating Mithila's Culture, Confidence & Talent.",
        location: "Janakpur Dham, Nepal",
        officialEmail: "originfoundation107@gmail.com",
        registrationFee: 399,
        eventSchedule: "To Be Announced",
        eventVenue: "To Be Announced",
        isRegistrationOpen: true,
        whatsappContact: "+977 9704571941",
      },
    });
  }

  return { success: true, setting };
}

export async function updateSiteSettingsAction(data: {
  organizationName?: string;
  organizationTagline?: string;
  competitionName?: string;
  competitionTagline?: string;
  location?: string;
  officialEmail?: string;
  registrationFee?: number;
  eventSchedule?: string;
  eventVenue?: string;
  isRegistrationOpen?: boolean;
  paymentQrCodeUrl?: string;
  paymentInstructions?: string;
  whatsappContact?: string;
  officialInstagram?: string;
  officialTiktok?: string;
  requiredHashtags?: string;
  videoGuidelines?: string;
  prizesJson?: any;
  announcementsJson?: any;
  faqsJson?: any;
  rulesJson?: any;
}) {
  const admin = await requireAdmin();

  try {
    const updated = await prisma.siteSetting.upsert({
      where: { id: "primary" },
      update: {
        ...data,
      },
      create: {
        id: "primary",
        organizationName: data.organizationName || "The Origin Foundation",
        organizationTagline: data.organizationTagline || "Rooted in Identity. Driven by Purpose.",
        competitionName: data.competitionName || "Mithila Queen",
        competitionTagline: data.competitionTagline || "Celebrating Mithila's Culture, Confidence & Talent.",
        location: data.location || "Janakpur Dham, Nepal",
        officialEmail: data.officialEmail || "originfoundation107@gmail.com",
        registrationFee: 399,
        eventSchedule: "To Be Announced",
        eventVenue: "To Be Announced",
        isRegistrationOpen: data.isRegistrationOpen ?? true,
        whatsappContact: data.whatsappContact || "+977 9704571941",
        ...data,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorEmail: admin.email,
        action: "UPDATE_SITE_SETTINGS",
        entityType: "SITE_SETTINGS",
        entityId: "primary",
        metadata: { updatedBy: admin.name },
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/dashboard");
    revalidatePath("/register");

    return { success: true, setting: updated };
  } catch (error: any) {
    console.error("Error updating site settings:", error);
    return { success: false, error: error.message || "Failed to update settings" };
  }
}

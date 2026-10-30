"use server";

import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { revalidatePath } from "next/cache";

export async function getPublicSiteSettingsAction() {
  try {
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

    return {
      success: true,
      setting: {
        organizationName: setting.organizationName,
        organizationTagline: setting.organizationTagline,
        competitionName: setting.competitionName,
        competitionTagline: setting.competitionTagline,
        location: setting.location,
        officialEmail: setting.officialEmail,
        registrationFee: setting.registrationFee,
        eventSchedule: setting.eventSchedule,
        eventVenue: setting.eventVenue,
        eventDate: setting.eventDate,
        eventTime: setting.eventTime,
        isRegistrationOpen: setting.isRegistrationOpen,
        registrationOpeningDate: setting.registrationOpeningDate,
        registrationClosingDate: setting.registrationClosingDate,
        paymentQrCodeUrl: setting.paymentQrCodeUrl,
        paymentProviderName: setting.paymentProviderName,
        paymentInstructions: setting.paymentInstructions,
        paymentReferenceInstructions: setting.paymentReferenceInstructions,
        whatsappContact: setting.whatsappContact,
        officialInstagram: setting.officialInstagram,
        officialTiktok: setting.officialTiktok,
        requiredHashtags: setting.requiredHashtags,
        videoGuidelines: setting.videoGuidelines,
        prizesJson: setting.prizesJson,
        announcementsJson: setting.announcementsJson,
        faqsJson: setting.faqsJson,
        rulesJson: setting.rulesJson,
      },
    };
  } catch (error: any) {
    console.error("Error fetching public site settings:", error);
    return { success: false, error: "Failed to load site settings" };
  }
}

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
  eventDate?: Date | string | null;
  eventTime?: string | null;
  isRegistrationOpen?: boolean;
  registrationOpeningDate?: Date | string | null;
  registrationClosingDate?: Date | string | null;
  paymentQrCodeUrl?: string | null;
  paymentProviderName?: string | null;
  paymentInstructions?: string | null;
  paymentReferenceInstructions?: string | null;
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
    // Convert date strings to Date objects if needed
    const openingDate = data.registrationOpeningDate
      ? new Date(data.registrationOpeningDate)
      : data.registrationOpeningDate === null
      ? null
      : undefined;

    const closingDate = data.registrationClosingDate
      ? new Date(data.registrationClosingDate)
      : data.registrationClosingDate === null
      ? null
      : undefined;

    const evDate = data.eventDate
      ? new Date(data.eventDate)
      : data.eventDate === null
      ? null
      : undefined;

    const cleanData: any = { ...data };
    if (openingDate !== undefined) cleanData.registrationOpeningDate = openingDate;
    if (closingDate !== undefined) cleanData.registrationClosingDate = closingDate;
    if (evDate !== undefined) cleanData.eventDate = evDate;

    const updated = await prisma.siteSetting.upsert({
      where: { id: "primary" },
      update: {
        ...cleanData,
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
        ...cleanData,
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
    revalidatePath("/registration-status");

    return { success: true, setting: updated };
  } catch (error: any) {
    console.error("Error updating site settings:", error);
    return { success: false, error: error.message || "Failed to update settings" };
  }
}

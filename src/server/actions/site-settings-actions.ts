"use server";

import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { revalidatePath } from "next/cache";
import { DEFAULT_OFFICIAL_SETTINGS } from "@/lib/constants/official-settings";

export async function getPublicSiteSettingsAction() {
  try {
    let setting = await prisma.siteSetting.findUnique({
      where: { id: "primary" },
    });

    if (!setting) {
      setting = await prisma.siteSetting.create({
        data: {
          id: "primary",
          ...DEFAULT_OFFICIAL_SETTINGS,
        },
      });
    }

    return {
      success: true,
      setting: {
        organizationName: setting.organizationName || DEFAULT_OFFICIAL_SETTINGS.organizationName,
        organizationTagline: setting.organizationTagline || DEFAULT_OFFICIAL_SETTINGS.organizationTagline,
        competitionName: setting.competitionName || DEFAULT_OFFICIAL_SETTINGS.competitionName,
        competitionTagline: setting.competitionTagline || DEFAULT_OFFICIAL_SETTINGS.competitionTagline,
        location: setting.location || DEFAULT_OFFICIAL_SETTINGS.location,
        officialEmail: setting.officialEmail || DEFAULT_OFFICIAL_SETTINGS.officialEmail,
        registrationFee: setting.registrationFee || DEFAULT_OFFICIAL_SETTINGS.registrationFee,
        eventSchedule: setting.eventSchedule || DEFAULT_OFFICIAL_SETTINGS.eventSchedule,
        eventVenue: setting.eventVenue || DEFAULT_OFFICIAL_SETTINGS.eventVenue,
        eventDate: setting.eventDate,
        eventTime: setting.eventTime,
        isRegistrationOpen: setting.isRegistrationOpen,
        registrationOpeningDate: setting.registrationOpeningDate,
        registrationClosingDate: setting.registrationClosingDate,
        paymentQrCodeUrl: setting.paymentQrCodeUrl,
        paymentProviderName: setting.paymentProviderName,
        paymentInstructions: setting.paymentInstructions,
        paymentReferenceInstructions: setting.paymentReferenceInstructions,
        // Wallet & Bank Configuration
        enableWalletPayment: setting.enableWalletPayment,
        walletProviderName: setting.walletProviderName,
        walletId: setting.walletId,
        walletBeneficiaryName: setting.walletBeneficiaryName,
        walletInstructions: setting.walletInstructions,
        walletReferenceInstructions: setting.walletReferenceInstructions,
        enableBankPayment: setting.enableBankPayment,
        bankName: setting.bankName,
        bankBranch: setting.bankBranch,
        bankBeneficiaryName: setting.bankBeneficiaryName,
        bankAccountNumber: setting.bankAccountNumber,
        bankInstructions: setting.bankInstructions,
        bankReferenceInstructions: setting.bankReferenceInstructions,
        // Competition Details & Links
        shortIntro: setting.shortIntro || DEFAULT_OFFICIAL_SETTINGS.shortIntro,
        fullDescription: setting.fullDescription || DEFAULT_OFFICIAL_SETTINGS.fullDescription,
        officialFacebook: setting.officialFacebook || DEFAULT_OFFICIAL_SETTINGS.officialFacebook,
        officialYoutube: setting.officialYoutube || DEFAULT_OFFICIAL_SETTINGS.officialYoutube,
        // Dates & Venue
        grandFinaleDate: setting.grandFinaleDate,
        grandFinaleTime: setting.grandFinaleTime || DEFAULT_OFFICIAL_SETTINGS.grandFinaleTime,
        auditionDate: setting.auditionDate,
        auditionTime: setting.auditionTime || DEFAULT_OFFICIAL_SETTINGS.auditionTime,
        dateInstructions: setting.dateInstructions || DEFAULT_OFFICIAL_SETTINGS.dateInstructions,
        venueAddress: setting.venueAddress || DEFAULT_OFFICIAL_SETTINGS.venueAddress,
        venueCity: setting.venueCity || DEFAULT_OFFICIAL_SETTINGS.venueCity,
        venueDirections: setting.venueDirections,
        venueInstructions: setting.venueInstructions || DEFAULT_OFFICIAL_SETTINGS.venueInstructions,
        // Audition Guidelines
        videoRequirements: setting.videoRequirements || DEFAULT_OFFICIAL_SETTINGS.videoRequirements,
        videoDuration: setting.videoDuration || DEFAULT_OFFICIAL_SETTINGS.videoDuration,
        videoSubmissionDeadline: setting.videoSubmissionDeadline,
        videoSubmissionMethod: setting.videoSubmissionMethod || DEFAULT_OFFICIAL_SETTINGS.videoSubmissionMethod,
        applicantInstructions: setting.applicantInstructions || DEFAULT_OFFICIAL_SETTINGS.applicantInstructions,
        // Public Modules
        homepageIntroText: setting.homepageIntroText || DEFAULT_OFFICIAL_SETTINGS.homepageIntroText,
        competitionHighlightsJson:
          Array.isArray(setting.competitionHighlightsJson) && (setting.competitionHighlightsJson as any[]).length > 0
            ? setting.competitionHighlightsJson
            : DEFAULT_OFFICIAL_SETTINGS.competitionHighlightsJson,
        importantNoticesJson: setting.importantNoticesJson,
        contactInfoJson: setting.contactInfoJson || DEFAULT_OFFICIAL_SETTINGS.contactInfoJson,
        whatsappContact: setting.whatsappContact || DEFAULT_OFFICIAL_SETTINGS.whatsappContact,
        officialInstagram: setting.officialInstagram || DEFAULT_OFFICIAL_SETTINGS.officialInstagram,
        officialTiktok: setting.officialTiktok || DEFAULT_OFFICIAL_SETTINGS.officialTiktok,
        requiredHashtags: setting.requiredHashtags || DEFAULT_OFFICIAL_SETTINGS.requiredHashtags,
        videoGuidelines: setting.videoGuidelines || DEFAULT_OFFICIAL_SETTINGS.videoGuidelines,
        prizesJson:
          Array.isArray(setting.prizesJson) && (setting.prizesJson as any[]).length > 0
            ? setting.prizesJson
            : DEFAULT_OFFICIAL_SETTINGS.prizesJson,
        announcementsJson: setting.announcementsJson,
        faqsJson:
          Array.isArray(setting.faqsJson) && (setting.faqsJson as any[]).length > 0
            ? setting.faqsJson
            : DEFAULT_OFFICIAL_SETTINGS.faqsJson,
        rulesJson: setting.rulesJson,
      },
    };
  } catch (error: any) {
    console.error("Error fetching public site settings:", error);
    return {
      success: true,
      setting: DEFAULT_OFFICIAL_SETTINGS as any,
    };
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
        ...DEFAULT_OFFICIAL_SETTINGS,
      },
    });
  }

  // Ensure all inputs are filled by default as per the official PDF
  const mergedSetting = {
    ...DEFAULT_OFFICIAL_SETTINGS,
    ...(setting || {}),
    organizationName: setting?.organizationName || DEFAULT_OFFICIAL_SETTINGS.organizationName,
    organizationTagline: setting?.organizationTagline || DEFAULT_OFFICIAL_SETTINGS.organizationTagline,
    competitionName: setting?.competitionName || DEFAULT_OFFICIAL_SETTINGS.competitionName,
    competitionTagline: setting?.competitionTagline || DEFAULT_OFFICIAL_SETTINGS.competitionTagline,
    shortIntro: setting?.shortIntro || DEFAULT_OFFICIAL_SETTINGS.shortIntro,
    fullDescription: setting?.fullDescription || DEFAULT_OFFICIAL_SETTINGS.fullDescription,
    location: setting?.location || DEFAULT_OFFICIAL_SETTINGS.location,
    officialEmail: setting?.officialEmail || DEFAULT_OFFICIAL_SETTINGS.officialEmail,
    registrationFee: setting?.registrationFee || DEFAULT_OFFICIAL_SETTINGS.registrationFee,
    eventSchedule: setting?.eventSchedule || DEFAULT_OFFICIAL_SETTINGS.eventSchedule,
    eventVenue: setting?.eventVenue || DEFAULT_OFFICIAL_SETTINGS.eventVenue,
    venueCity: setting?.venueCity || DEFAULT_OFFICIAL_SETTINGS.venueCity,
    venueAddress: setting?.venueAddress || DEFAULT_OFFICIAL_SETTINGS.venueAddress,
    dateInstructions: setting?.dateInstructions || DEFAULT_OFFICIAL_SETTINGS.dateInstructions,
    venueInstructions: setting?.venueInstructions || DEFAULT_OFFICIAL_SETTINGS.venueInstructions,
    grandFinaleTime: setting?.grandFinaleTime || DEFAULT_OFFICIAL_SETTINGS.grandFinaleTime,
    auditionTime: setting?.auditionTime || DEFAULT_OFFICIAL_SETTINGS.auditionTime,
    whatsappContact: setting?.whatsappContact || DEFAULT_OFFICIAL_SETTINGS.whatsappContact,
    officialInstagram: setting?.officialInstagram || DEFAULT_OFFICIAL_SETTINGS.officialInstagram,
    officialTiktok: setting?.officialTiktok || DEFAULT_OFFICIAL_SETTINGS.officialTiktok,
    officialFacebook: setting?.officialFacebook || DEFAULT_OFFICIAL_SETTINGS.officialFacebook,
    officialYoutube: setting?.officialYoutube || DEFAULT_OFFICIAL_SETTINGS.officialYoutube,
    requiredHashtags: setting?.requiredHashtags || DEFAULT_OFFICIAL_SETTINGS.requiredHashtags,
    videoDuration: setting?.videoDuration || DEFAULT_OFFICIAL_SETTINGS.videoDuration,
    videoGuidelines: setting?.videoGuidelines || DEFAULT_OFFICIAL_SETTINGS.videoGuidelines,
    videoRequirements: setting?.videoRequirements || DEFAULT_OFFICIAL_SETTINGS.videoRequirements,
    videoSubmissionMethod: setting?.videoSubmissionMethod || DEFAULT_OFFICIAL_SETTINGS.videoSubmissionMethod,
    applicantInstructions: setting?.applicantInstructions || DEFAULT_OFFICIAL_SETTINGS.applicantInstructions,
    homepageIntroText: setting?.homepageIntroText || DEFAULT_OFFICIAL_SETTINGS.homepageIntroText,
    competitionHighlightsJson: setting?.competitionHighlightsJson || DEFAULT_OFFICIAL_SETTINGS.competitionHighlightsJson,
    contactInfoJson: setting?.contactInfoJson || DEFAULT_OFFICIAL_SETTINGS.contactInfoJson,
    prizesJson: setting?.prizesJson || DEFAULT_OFFICIAL_SETTINGS.prizesJson,
    faqsJson: setting?.faqsJson || DEFAULT_OFFICIAL_SETTINGS.faqsJson,
  };

  return { success: true, setting: mergedSetting };
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
  // Wallet & Bank Configuration
  enableWalletPayment?: boolean;
  walletProviderName?: string | null;
  walletId?: string | null;
  walletBeneficiaryName?: string | null;
  walletInstructions?: string | null;
  walletReferenceInstructions?: string | null;
  enableBankPayment?: boolean;
  bankName?: string | null;
  bankBranch?: string | null;
  bankBeneficiaryName?: string | null;
  bankAccountNumber?: string | null;
  bankInstructions?: string | null;
  bankReferenceInstructions?: string | null;
  // Competition Details & Links
  shortIntro?: string | null;
  fullDescription?: string | null;
  officialFacebook?: string | null;
  officialYoutube?: string | null;
  // Dates & Venue
  grandFinaleDate?: Date | string | null;
  grandFinaleTime?: string | null;
  auditionDate?: Date | string | null;
  auditionTime?: string | null;
  dateInstructions?: string | null;
  venueAddress?: string | null;
  venueCity?: string | null;
  venueDirections?: string | null;
  venueInstructions?: string | null;
  // Audition Guidelines
  videoRequirements?: string | null;
  videoDuration?: string | null;
  videoSubmissionDeadline?: Date | string | null;
  videoSubmissionMethod?: string | null;
  applicantInstructions?: string | null;
  // Public Modules
  homepageIntroText?: string | null;
  competitionHighlightsJson?: any;
  importantNoticesJson?: any;
  contactInfoJson?: any;
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

    const finaleDate = data.grandFinaleDate
      ? new Date(data.grandFinaleDate)
      : data.grandFinaleDate === null
      ? null
      : undefined;

    const audDate = data.auditionDate
      ? new Date(data.auditionDate)
      : data.auditionDate === null
      ? null
      : undefined;

    const vidDeadline = data.videoSubmissionDeadline
      ? new Date(data.videoSubmissionDeadline)
      : data.videoSubmissionDeadline === null
      ? null
      : undefined;

    const cleanData: any = { ...data };
    if (openingDate !== undefined) cleanData.registrationOpeningDate = openingDate;
    if (closingDate !== undefined) cleanData.registrationClosingDate = closingDate;
    if (evDate !== undefined) cleanData.eventDate = evDate;
    if (finaleDate !== undefined) cleanData.grandFinaleDate = finaleDate;
    if (audDate !== undefined) cleanData.auditionDate = audDate;
    if (vidDeadline !== undefined) cleanData.videoSubmissionDeadline = vidDeadline;

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
    revalidatePath("/admin/event-settings");
    revalidatePath("/admin/registration-form");
    revalidatePath("/admin/dashboard");
    revalidatePath("/register");
    revalidatePath("/faq");
    revalidatePath("/mithila-queen");
    revalidatePath("/contact");
    revalidatePath("/registration-status");

    return { success: true, setting: updated };
  } catch (error: any) {
    console.error("Error updating site settings:", error);
    return { success: false, error: error.message || "Failed to update settings" };
  }
}

export async function getUploadLimitsAction() {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { id: "primary" },
    });
    const limits = (setting as any)?.uploadLimitsJson || {
      maxVideoMb: 100,
      maxImageMb: 10,
      maxDocMb: 25,
    };
    return { success: true, limits };
  } catch {
    return {
      success: false,
      limits: { maxVideoMb: 100, maxImageMb: 10, maxDocMb: 25 },
    };
  }
}

export async function updateUploadLimitsAction(data: {
  maxVideoMb: number;
  maxImageMb: number;
  maxDocMb: number;
}) {
  const admin = await requireAdmin();

  // Validate server-side safe limits
  const maxVideoMb = Math.min(Math.max(Number(data.maxVideoMb) || 100, 10), 500);
  const maxImageMb = Math.min(Math.max(Number(data.maxImageMb) || 10, 2), 25);
  const maxDocMb = Math.min(Math.max(Number(data.maxDocMb) || 25, 5), 50);

  try {
    await (prisma.siteSetting as any).update({
      where: { id: "primary" },
      data: {
        uploadLimitsJson: {
          maxVideoMb,
          maxImageMb,
          maxDocMb,
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorEmail: admin.email,
        action: "UPDATE_UPLOAD_LIMITS",
        entityType: "SYSTEM",
        entityId: "primary",
        metadata: { maxVideoMb, maxImageMb, maxDocMb },
      },
    });

    revalidatePath("/admin/settings");
    return { success: true, limits: { maxVideoMb, maxImageMb, maxDocMb } };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update upload limits" };
  }
}

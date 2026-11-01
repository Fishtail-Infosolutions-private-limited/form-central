import { prisma } from "@/lib/db/prisma";

export const DEFAULT_SITE_SETTING = {
  id: "primary",
  organizationName: "The Origin Foundation",
  organizationTagline: "Rooted in Identity. Driven by Purpose.",
  competitionName: "Mithila Queen",
  competitionTagline: "Celebrating Mithila's Culture, Confidence & Talent.",
  location: "Janakpur Dham, Nepal",
  officialEmail: "originfoundation107@gmail.com",
  registrationFee: 399,
  eventSchedule: "To Be Announced",
  eventVenue: "Janakpur Dham, Nepal",
  eventDate: new Date("2026-05-15T00:00:00.000Z"),
  eventTime: "10:00 AM",
  isRegistrationOpen: true,
  registrationOpeningDate: new Date("2026-01-01T00:00:00.000Z"),
  registrationClosingDate: new Date("2026-04-30T23:59:59.000Z"),
  paymentQrCodeUrl: "/assets/brand/origin-foundation-qr.png",
  paymentProviderName: "Official Merchant QR Code",
  paymentInstructions:
    "Please scan the official payment QR code using eSewa, Khalti, or any Fonepay-compatible banking app.",
  paymentReferenceInstructions:
    "Obtained from your payment receipt screenshot after completing the NPR 399 transfer.",
  enableWalletPayment: false,
  walletProviderName: "eSewa",
  walletId: null,
  walletBeneficiaryName: null,
  walletInstructions: null,
  walletReferenceInstructions: null,
  enableBankPayment: false,
  bankName: null,
  bankBranch: null,
  bankBeneficiaryName: null,
  bankAccountNumber: null,
  bankInstructions: null,
  bankReferenceInstructions: null,
  shortIntro:
    "Official flagship competition celebrating Mithila's culture, confidence & talent in Janakpur Dham, Nepal.",
  rulesDocUrl: null,
  prizesDetails: "Prestigious Crown, Cultural Ambassadorship & Scholarship Grants",
  updatedAt: new Date(),
};

export async function getSafeSiteSetting() {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { id: "primary" },
    });
    return setting || (DEFAULT_SITE_SETTING as any);
  } catch {
    // If table doesn't exist yet during build/docker build, gracefully fall back
    return DEFAULT_SITE_SETTING as any;
  }
}


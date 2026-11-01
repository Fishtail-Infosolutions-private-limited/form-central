import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { MithilaQueenWizard } from "@/components/registration/mithila-queen-wizard";
import { MithilaHeritageMandala, MithilaQueenLogo } from "@/components/brand/brand-logos";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Calendar,
  Lock,
  ArrowRight,
  Search,
  Sparkles,
  Phone,
  Mail,
  AlertCircle,
} from "lucide-react";
import { FormAppearanceConfig } from "@/types/form";
import { formatNepalDateTime } from "@/lib/utils/timezone";

export const metadata: Metadata = {
  title: "Mithila Queen Registration | The Origin Foundation",
  description:
    "Official registration portal for Mithila Queen in Janakpur Dham, Nepal. Open to all girls, married or unmarried, with zero prior experience required.",
};

export default async function RegisterPage() {
  const [form, setting] = await Promise.all([
    prisma.registrationForm.findUnique({
      where: { slug: "mithila-queen" },
    }),
    prisma.siteSetting.findUnique({
      where: { id: "primary" },
    }),
  ]);

  // 1. Publication Check: Form must be Published and have a published version
  const isFormPublished = form?.status === "PUBLISHED" && Boolean(form?.publishedVersionId);

  if (!isFormPublished) {
    return (
      <div className="py-16 sm:py-24 max-w-2xl mx-auto px-4 sm:px-6 text-center space-y-8">
        <div className="w-16 h-16 rounded-2xl bg-[#F4F7FA] border border-[#DCE5ED] text-[#183153] mx-auto flex items-center justify-center shadow-xs">
          <Lock className="w-8 h-8 text-[#183153]" />
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4F7FA] border border-[#DCE5ED] text-[#546E7A] text-xs font-semibold">
            <MithilaHeritageMandala className="w-3.5 h-3.5 text-[#356FA8]" />
            <span>The Origin Foundation &bull; Janakpur Dham</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-[#183153] tracking-tight">
            Registration Not Started
          </h1>

          <p className="text-sm text-[#546E7A] leading-relaxed max-w-lg mx-auto">
            The official registration portal for Mithila Queen is currently being prepared and has not been opened yet. Please check back soon or follow our official announcements.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-[#DCE5ED] bg-white shadow-xs space-y-3 text-xs text-[#546E7A] text-left">
          <div className="flex items-center gap-2 text-[#263238] font-semibold">
            <Sparkles className="w-4 h-4 text-[#356FA8]" />
            <span>What can you do in the meantime?</span>
          </div>
          <ul className="space-y-2 list-disc list-inside">
            <li>Read the competition philosophy and cultural judging criteria.</li>
            <li>Review candidate eligibility requirements and minor safeguarding rules.</li>
            <li>Prepare your brief introduction speech in Maithili, Nepali, or English.</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/mithila-queen">
            <Button className="w-full sm:w-auto bg-[#183153] text-white hover:bg-[#12243D] text-xs font-semibold h-11 px-6 rounded-md shadow-xs gap-2">
              <span>View Competition Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>

          <Link href="/registration-status">
            <Button
              variant="outline"
              className="w-full sm:w-auto border-[#DCE5ED] text-[#183153] hover:bg-[#F4F7FA] text-xs font-semibold h-11 px-6 rounded-md gap-2"
            >
              <Search className="w-3.5 h-3.5 text-[#356FA8]" />
              <span>Check Application Status</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 2. Availability Schedule Check
  const now = new Date();
  const isMasterOpen = setting?.isRegistrationOpen ?? true;
  const openingDate = setting?.registrationOpeningDate ? new Date(setting.registrationOpeningDate) : null;
  const closingDate = setting?.registrationClosingDate ? new Date(setting.registrationClosingDate) : null;

  const isBeforeOpening = openingDate && now < openingDate;
  const isAfterClosing = closingDate && now > closingDate;
  const isEffectiveOpen = isMasterOpen && !isBeforeOpening && !isAfterClosing;

  if (!isEffectiveOpen) {
    let reasonTitle = "Registrations Are Currently Closed";
    let reasonDesc = "Online registration for Mithila Queen is currently paused by the organizing committee.";

    if (isBeforeOpening && openingDate) {
      reasonTitle = "Registration Opens Soon";
      reasonDesc = `Official online registration is scheduled to open on ${formatNepalDateTime(openingDate)} (Nepal Time).`;
    } else if (isAfterClosing && closingDate) {
      reasonTitle = "Registration Deadline Passed";
      reasonDesc = `The registration period for Mithila Queen officially closed on ${formatNepalDateTime(closingDate)} (Nepal Time).`;
    }

    return (
      <div className="py-16 sm:py-24 max-w-2xl mx-auto px-4 sm:px-6 text-center space-y-8">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 mx-auto flex items-center justify-center shadow-xs">
          <Clock className="w-8 h-8 text-amber-700" />
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4F7FA] border border-[#DCE5ED] text-[#546E7A] text-xs font-semibold">
            <MithilaHeritageMandala className="w-3.5 h-3.5 text-[#356FA8]" />
            <span>The Origin Foundation &bull; Janakpur Dham</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-[#183153] tracking-tight">
            {reasonTitle}
          </h1>

          <p className="text-sm text-[#546E7A] leading-relaxed max-w-lg mx-auto">
            {reasonDesc}
          </p>
        </div>

        <div className="p-5 rounded-xl border border-[#DCE5ED] bg-white shadow-xs space-y-3 text-xs text-left">
          <div className="flex items-center justify-between border-b border-[#DCE5ED] pb-2 text-[#263238] font-semibold">
            <span>Already Registered?</span>
            <span className="text-[11px] text-[#546E7A] font-normal">Candidate Desk</span>
          </div>
          <p className="text-[#546E7A]">
            If you have already submitted your candidate dossier, you can check your payment verification status and download your official confirmation dossier below.
          </p>
          <div className="pt-2">
            <Link href="/registration-status">
              <Button className="w-full bg-[#183153] text-white hover:bg-[#12243D] text-xs font-semibold h-10 gap-2">
                <Search className="w-3.5 h-3.5" />
                <span>Track Application / Check Status</span>
              </Button>
            </Link>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-center gap-4 text-xs text-[#546E7A]">
          <Link href="/mithila-queen" className="hover:underline">
            Competition Overview
          </Link>
          <span>&bull;</span>
          <Link href="/faq" className="hover:underline">
            Frequently Asked Questions
          </Link>
          <span>&bull;</span>
          <Link href="/contact" className="hover:underline">
            Contact Organizers
          </Link>
        </div>
      </div>
    );
  }

  // 3. Active Registration Form (Published and Open)
  const appearance = (form?.appearanceJson as FormAppearanceConfig) || {};
  const formTitle = appearance.formTitle || "Mithila Queen Registration";
  const mainHeading = appearance.mainHeading || "Mithila Queen Registration";
  const description =
    appearance.shortDescription ||
    "Celebrating Mithila's Culture, Confidence & Talent. Complete the online application below to register your candidacy.";

  return (
    <div className="py-10 sm:py-16 space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Editorial Header */}
      <div className="max-w-2xl mx-auto text-center space-y-3">
        {appearance.logoUrl ? (
          <div className="w-16 h-16 mx-auto rounded-xl overflow-hidden border border-[#DCE5ED] bg-white shadow-xs p-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={appearance.logoUrl} alt="Logo" className="w-full h-full object-contain" />
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F4F7FA] border border-[#DCE5ED] text-[#183153] text-xs font-semibold shadow-xs">
            <MithilaHeritageMandala className="w-3.5 h-3.5 text-[#356FA8]" />
            <span>The Origin Foundation &bull; Janakpur Dham</span>
          </div>
        )}

        <h1 className="text-3xl sm:text-5xl font-bold text-[#263238] tracking-tight">
          {mainHeading}
        </h1>

        <p className="text-xs sm:text-sm text-[#546E7A] leading-relaxed max-w-xl mx-auto">
          {description}
        </p>

        {appearance.instructionsBefore && (
          <div className="p-3.5 rounded-lg bg-[#F4F7FA] border border-[#DCE5ED] text-xs text-[#263238] text-left max-w-xl mx-auto mt-2">
            <p className="whitespace-pre-line">{appearance.instructionsBefore}</p>
          </div>
        )}
      </div>

      {/* Application Registration Wizard */}
      <MithilaQueenWizard />
    </div>
  );
}

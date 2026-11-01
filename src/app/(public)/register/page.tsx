import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { RegistrationWizard } from "@/components/registration/registration-wizard";
import { DEFAULT_MITHILA_QUEEN_SCHEMA } from "@/lib/constants/default-form-schema";
import { MithilaHeritageMandala } from "@/components/brand/brand-logos";
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
import { getSafeSiteSetting } from "@/lib/db/site-settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mithila Queen Registration | The Origin Foundation",
  description:
    "Official registration portal for Mithila Queen in Janakpur Dham, Nepal. Open to all girls, married or unmarried, with zero prior experience required.",
};

export default async function RegisterPage() {
  const [form, setting] = await Promise.all([
    prisma.registrationForm
      .findUnique({
        where: { slug: "mithila-queen" },
        include: {
          versions: {
            orderBy: { versionNumber: "desc" },
            take: 1,
          },
        },
      })
      .catch(() => null),
    getSafeSiteSetting(),
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
  return (
    <div className="py-8 sm:py-12 max-w-4xl mx-auto px-4 sm:px-6">
      {/* Application Registration Wizard */}
      {(() => {
        const latestSchema = form.versions?.[0]?.schema as any;
        const hasSeparatedLocationStep =
          Array.isArray(latestSchema?.steps) &&
          latestSchema.steps.some((s: any) => s.id === "step-personal-location");
        const activeSchema = hasSeparatedLocationStep ? latestSchema : DEFAULT_MITHILA_QUEEN_SCHEMA;

        return (
          <RegistrationWizard
            form={{
              id: form.id,
              name: form.name,
              slug: form.slug,
              description: form.description,
              instructions: form.instructions,
            }}
            schema={activeSchema}
          />
        );
      })()}
    </div>
  );
}

import React from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import {
  FileText,
  Crown,
  Settings,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Eye,
  Sliders,
  Users,
  QrCode,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormQrCard } from "@/components/admin/form-qr-card";
import { formatNepalDateTime } from "@/lib/utils/timezone";

export default async function AdminFormsPage() {
  await requireAdmin();

  // Find or ensure the dedicated Mithila Queen form
  let form = await prisma.registrationForm.findFirst({
    where: { slug: "mithila-queen" },
    include: {
      versions: {
        where: { status: "PUBLISHED" },
        orderBy: { versionNumber: "desc" },
        take: 1,
      },
    },
  });

  if (!form) {
    // If not found with exact slug, find first
    form = await prisma.registrationForm.findFirst({
      orderBy: { createdAt: "asc" },
      include: {
        versions: {
          where: { status: "PUBLISHED" },
          orderBy: { versionNumber: "desc" },
          take: 1,
        },
      },
    });
  }

  // Fetch Site Settings & Dossier statistics
  const [siteSetting, totalRegs, completedRegs, verifiedPayments, approvedApplications] =
    await Promise.all([
      prisma.siteSetting.findUnique({ where: { id: "primary" } }),
      prisma.mithilaQueenRegistration.count(),
      prisma.mithilaQueenRegistration.count({ where: { isCompleted: true } }),
      prisma.mithilaQueenRegistration.count({ where: { paymentStatus: "VERIFIED" } }),
      prisma.mithilaQueenRegistration.count({ where: { applicationStatus: "APPROVED" } }),
    ]);

  const stepsList = [
    {
      num: 1,
      title: "Personal Information & Email Verification",
      desc: "Legal full name, date of birth (minor safeguarding check), mobile number, and mandatory 6-digit email OTP verification.",
      isProtected: true,
    },
    {
      num: 2,
      title: "Participant Profile & Cultural Heritage",
      desc: "Personal motivation, meaning of Mithila heritage, artistic talents, spoken languages, and voluntary education details.",
      isProtected: false,
    },
    {
      num: 3,
      title: "Additional Details & Aspirations",
      desc: "Personal introduction, qualities brought to the competition, and previous cultural or talent experience.",
      isProtected: false,
    },
    {
      num: 4,
      title: "Social Media Profiles & Audition Channels",
      desc: "Instagram, TikTok, and Facebook links for audition review. Direct WhatsApp submission to Gaurav Gupta.",
      isProtected: true,
    },
    {
      num: 5,
      title: "Participant Photograph Upload",
      desc: "Clear portrait or passport photograph for candidate dossier, admin review, and official confirmation certificate.",
      isProtected: false,
    },
    {
      num: 6,
      title: "Rules, Minor Safeguarding & Legal Consents",
      desc: "Acceptance of rules, privacy policy, and parental/guardian consent with contact information for participants under 18.",
      isProtected: true,
    },
    {
      num: 7,
      title: "Fee Review & NPR 399 Payment Verification",
      desc: "Review of entered details, generation of MQ-YYYY-XXXXXX reference ID, and official QR fee payment submission.",
      isProtected: true,
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DFD0] pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#B69A65]/15 text-[#292821] text-xs font-bold border border-[#B69A65]/30">
              <Crown className="w-3.5 h-3.5 text-[#B69A65]" />
              Dedicated Competition Form
            </span>
            <span className="text-xs text-zinc-500 font-mono">The Origin Foundation</span>
          </div>
          <h1 className="text-3xl font-extrabold font-serif text-[#292821] tracking-tight">
            Mithila Queen Registration Form
          </h1>
          <p className="text-xs text-[#3C332A]">
            Single dedicated registration form for Mithila Queen 2026. Customize questions, steps, validation, and deadlines.
          </p>
        </div>

        {form && (
          <div className="flex items-center gap-3">
            <Link href="/register" target="_blank">
              <Button variant="outline" className="border-[#E8DFD0] text-[#292821] hover:bg-[#FAF5EE] text-xs font-semibold h-10 gap-1.5">
                <Eye className="w-3.5 h-3.5 text-zinc-500" />
                <span>Preview Form</span>
              </Button>
            </Link>

            <Link href={`/admin/forms/${form.id}/builder`}>
              <Button className="bg-[#B69A65] hover:bg-[#a68c5b] text-[#292821] font-bold text-xs h-10 px-5 gap-2 shadow-xs">
                <Sliders className="w-4 h-4" />
                <span>Customize in Form Builder</span>
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-lg bg-white border border-[#E8DFD0] shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
            Total Registrations
          </span>
          <p className="text-2xl font-black font-serif text-[#292821]">{totalRegs}</p>
          <span className="text-[11px] text-zinc-500">Initiated via Step 1 OTP</span>
        </div>

        <div className="p-5 rounded-lg bg-white border border-[#E8DFD0] shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
            Completed Submissions
          </span>
          <p className="text-2xl font-black font-serif text-[#292821]">{completedRegs}</p>
          <span className="text-[11px] text-zinc-500">Reached final Step 7</span>
        </div>

        <div className="p-5 rounded-lg bg-white border border-[#E8DFD0] shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
            Verified Payments
          </span>
          <p className="text-2xl font-black font-serif text-emerald-800">{verifiedPayments}</p>
          <span className="text-[11px] text-zinc-500">NPR 399 confirmed in bank</span>
        </div>

        <div className="p-5 rounded-lg bg-white border border-[#E8DFD0] shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
            Approved Finalists
          </span>
          <p className="text-2xl font-black font-serif text-[#B69A65]">{approvedApplications}</p>
          <span className="text-[11px] text-zinc-500">PDF confirmations issued</span>
        </div>
      </div>

      {/* Two-Column Form Management Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): 7-Step Breakdown & Core Protections */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-lg bg-white border border-[#E8DFD0] shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#E8DFD0] pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#292821]">
                  7-Step Form Architecture
                </h3>
                <p className="text-xs text-[#3C332A] mt-0.5">
                  Organized sequence of registration stages customized for Mithila Queen.
                </p>
              </div>
              {form && (
                <Link href={`/admin/forms/${form.id}/builder`}>
                  <Button size="sm" variant="outline" className="border-[#B69A65] text-[#292821] text-xs font-semibold h-8 gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#B69A65]" />
                    <span>Edit Fields</span>
                  </Button>
                </Link>
              )}
            </div>

            <div className="space-y-3">
              {stepsList.map((st) => (
                <div
                  key={st.num}
                  className="p-4 rounded-md bg-[#FAF5EE] border border-[#E8DFD0] space-y-1.5 hover:border-[#B69A65]/60 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-[#292821] text-[#B69A65] font-mono font-bold text-xs flex items-center justify-center">
                        {st.num}
                      </span>
                      <h4 className="font-serif font-bold text-sm text-[#292821]">
                        {st.title}
                      </h4>
                    </div>
                    {st.isProtected && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-200/80 text-zinc-700">
                        Protected Core
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#3C332A] pl-8 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-md bg-blue-50/70 border border-blue-200 text-xs text-blue-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                <span>Protected Business Integrity Rules</span>
              </p>
              <p className="text-[11px] leading-relaxed text-blue-800">
                To guarantee fair adjudication and minor child safeguarding under Nepalese law, mandatory fields (Full Legal Name, Email OTP Verification, Minor Safeguarding Consent, Social Profile verification, and Fee Tracking) are protected from accidental removal while questions, descriptions, options, and order remain fully editable in the builder.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): QR Code, Registration URLs & Deadlines */}
        <div className="lg:col-span-5 space-y-6">
          {form && (
            <FormQrCard
              formId={form.id}
              formName="Mithila Queen 2026"
              slug="mithila-queen"
            />
          )}

          {/* Configuration & Schedule Card */}
          <div className="p-6 rounded-lg bg-white border border-[#E8DFD0] shadow-xs space-y-4 text-xs">
            <h3 className="font-serif font-bold text-sm text-[#292821] uppercase tracking-wider">
              Registration & Event Schedule
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-1.5 border-b border-[#E8DFD0]">
                <span className="text-zinc-500 font-medium">Registration Status:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{siteSetting?.isRegistrationOpen ? "Open & Accepting Submissions" : "Closed"}</span>
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-[#E8DFD0]">
                <span className="text-zinc-500 font-medium">Registration Fee:</span>
                <span className="font-bold text-[#292821] font-mono">NPR {siteSetting?.registrationFee || 399}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-[#E8DFD0]">
                <span className="text-zinc-500 font-medium">Closing Deadline:</span>
                <span className="font-bold text-[#292821]">
                  {siteSetting?.registrationClosingDate
                    ? formatNepalDateTime(siteSetting.registrationClosingDate)
                    : "Open (No strict deadline set)"}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-[#E8DFD0]">
                <span className="text-zinc-500 font-medium">Auditions & Stage Event:</span>
                <span className="font-bold text-[#292821]">{siteSetting?.eventSchedule || "To Be Announced"}</span>
              </div>

              <div className="flex justify-between items-center py-1.5">
                <span className="text-zinc-500 font-medium">Event Venue:</span>
                <span className="font-bold text-[#292821]">{siteSetting?.eventVenue || "Janakpur Dham, Nepal"}</span>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/admin/settings" className="w-full block">
                <Button variant="outline" className="w-full border-[#E8DFD0] text-[#292821] hover:bg-[#FAF5EE] text-xs h-9 font-semibold gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Configure Schedule & Deadlines in Settings</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

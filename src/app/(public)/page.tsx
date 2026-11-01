import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Video,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  Lock,
  Crown,
  Heart,
  Award,
  Users,
  Building2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OriginFoundationLogo, MithilaHeritageMandala } from "@/components/brand/brand-logos";
import { prisma } from "@/lib/db/prisma";
import { formatNepalDateTime, formatNepalDateOnly } from "@/lib/utils/timezone";
import { ExpandableFaqs } from "@/components/home/expandable-faqs";

export const metadata = {
  title: "The Origin Foundation | Mithila Queen — Janakpur Dham, Nepal",
  description:
    "The Origin Foundation presents Mithila Queen: Celebrating Mithila's Culture, Confidence & Talent. An official cultural and talent competition based in Janakpur Dham, Nepal.",
};

export default async function HomePage() {
  const setting = await prisma.siteSetting.findUnique({
    where: { id: "primary" },
  });

  const regFee = setting?.registrationFee || 399;

  const eligibilityFacts = [
    {
      label: "Gender Eligibility",
      value: "Girls only. Any female participant can register.",
      detail: "Celebrating female voice and cultural leadership across Mithila.",
    },
    {
      label: "Age Requirements",
      value: "No minimum or maximum age limit.",
      detail: "Participants under 18 register with legal parent/guardian consent.",
    },
    {
      label: "Marital Status",
      value: "Open to both married and unmarried participants.",
      detail: "Fully inclusive participation representing all women in our community.",
    },
    {
      label: "Prior Experience",
      value: "Zero prior stage or competition experience required.",
      detail: "First-time newcomers are evaluated with complete impartiality.",
    },
    {
      label: "Registration Fee",
      value: `Strictly NPR ${regFee} (Nepalese rupees only).`,
      detail: "Covers candidate dossier creation, administrative review, and certificate generation.",
    },
    {
      label: "Headquarters",
      value: setting?.location || "Janakpur Dham, Nepal",
      detail: "Historical center of ancient Mithila art, literature, and culture.",
    },
  ];

  const pillars = [
    {
      step: "01",
      title: "Cultural Pride & Heritage",
      description:
        "Mithila Queen is grounded in the civilizational richness of Janakpur Dham—its folk arts, Maithili literature, classical traditions, and timeless values. Cultural appreciation takes precedence over mere appearance.",
    },
    {
      step: "02",
      title: "Confidence & Public Voice",
      description:
        "We provide a dignified, supportive platform where participants develop public speaking skills, self-assurance, and the courage to articulate their thoughts before an audience.",
    },
    {
      step: "03",
      title: "Creative & Artistic Talent",
      description:
        "Whether through traditional painting, folk dance, music, writing, poetry, or community initiative, individual talent is celebrated and evaluated with genuine fairness.",
    },
    {
      step: "04",
      title: "Equal Opportunity & Integrity",
      description:
        "Open to all communities and backgrounds. Transparent administrative review, independent payment verification, and safeguarding codes for minor participants.",
    },
  ];

  const registrationSteps = [
    {
      num: "1",
      title: "Personal Information & Contact",
      desc: "Full legal name, date of birth (minor check), address, and mandatory 6-digit email OTP verification.",
    },
    {
      num: "2",
      title: "Profile & Cultural Background",
      desc: "Personal introduction, talents, spoken languages (Maithili, Nepali, English), and motivation.",
    },
    {
      num: "3",
      title: "Additional Details & Aspirations",
      desc: "Cultural qualities you bring and voluntary educational background for jury review.",
    },
    {
      num: "4",
      title: "Social Media Channels",
      desc: "At least one active profile (Instagram, TikTok, or Facebook) for audition video tagging.",
    },
    {
      num: "5",
      title: "Photo & Media Uploads",
      desc: "Clear face portrait photograph and optional talent video file directly uploaded.",
    },
    {
      num: "6",
      title: "Rules & Minor Safeguarding",
      desc: "Official competition code agreement plus legal guardian consent if applicant is under 18.",
    },
    {
      num: "7",
      title: "Review & QR Fee Payment",
      desc: `Review dossier, obtain your unique MQ-YYYY-XXXXXX reference, and complete the NPR ${regFee} payment.`,
    },
  ];

  const prizes =
    Array.isArray(setting?.prizesJson) && (setting.prizesJson as any[]).length > 0
      ? (setting.prizesJson as any[])
      : [
          {
            position: "First Prize",
            title: "iPhone 18 Pro Max, Red, 512 GB",
            badge: "Crown Winner",
            status: "Proposed by organizers",
          },
          {
            position: "Second Prize",
            title: "MAC Beauty Products Collection",
            badge: "First Runner-Up",
            status: "Approx. NPR 30,000 value",
          },
          {
            position: "Third Prize",
            title: "Smartphone or Quality Electronic Device",
            badge: "Second Runner-Up",
            status: "To be confirmed by organizers",
          },
        ];

  const rawFaqs =
    Array.isArray(setting?.faqsJson) && (setting.faqsJson as any[]).length > 0
      ? (setting.faqsJson as any[]).filter((f) => f.published !== false)
      : null;

  const faqs = rawFaqs && rawFaqs.length > 0
    ? rawFaqs
    : [
        {
          category: "Organization",
          q: "What is The Origin Foundation?",
          a: "The Origin Foundation is a non-profit cultural initiative platform in Janakpur Dham, Nepal, created to preserve regional heritage, celebrate creative talents, and foster opportunities for participation, confidence, and community representation.",
        },
        {
          category: "Competition",
          q: "What is Mithila Queen?",
          a: "Mithila Queen is the flagship initiative of The Origin Foundation. It is an annual cultural and talent competition intended to bring together young women who want to express their talent, confidence, creativity, and connection with Mithila's heritage.",
        },
        {
          category: "Fee & Payment",
          q: "What is the registration fee?",
          a: `The registration fee is strictly NPR ${regFee} per registration, payable in Nepalese rupees only. This nominal administrative fee covers dossier preparation, independent banking verification, and certification.`,
        },
        {
          category: "Schedule & Format",
          q: "When will the audition and grand finale take place?",
          a: "Event Schedule: To Be Announced. Online registrations are conducted via this official website. Exact audition schedules and venue locations will be communicated directly to verified participants.",
        },
        {
          category: "Eligibility",
          q: "Can beginners without modeling or stage experience apply?",
          a: "Yes! Absolutely. Mithila Queen is a cultural and talent platform, not a physical beauty pageant. Beginners and first-time applicants are warmly welcomed and evaluated with complete impartiality.",
        },
      ];

  // 1. Dynamic Availability & Registration Timeline Logic
  const now = new Date();
  const isMasterOpen = setting?.isRegistrationOpen ?? true;
  const openingDate = setting?.registrationOpeningDate ? new Date(setting.registrationOpeningDate) : null;
  const closingDate = setting?.registrationClosingDate ? new Date(setting.registrationClosingDate) : null;

  const isBeforeOpening = openingDate ? now < openingDate : false;
  const isAfterClosing = closingDate ? now > closingDate : false;

  let regHeadline = "Official Online Registrations Are Currently Open";
  let regDeadlineText: string | null = null;
  let regStatusBadge = "Open";
  let regStatusVariant: "emerald" | "amber" | "rose" | "blue" = "emerald";

  if (!isMasterOpen) {
    regHeadline = "Official Registrations Are Currently Closed";
    regStatusBadge = "Closed";
    regStatusVariant = "rose";
  } else if (isAfterClosing && closingDate) {
    regHeadline = `Official Online Registrations Closed (Ended on ${formatNepalDateOnly(closingDate)})`;
    regStatusBadge = "Closed";
    regStatusVariant = "rose";
  } else if (isBeforeOpening && openingDate) {
    // If kept but not started: keep "starts"
    regHeadline = `Official Online Registrations Start on ${formatNepalDateOnly(openingDate)}`;
    regStatusBadge = `Starts ${formatNepalDateOnly(openingDate)}`;
    regStatusVariant = "amber";
  } else if (openingDate || closingDate) {
    // If admin kept opening/closing date: keep "Official Online Registrations Are Currently Open" and deadline date
    regHeadline = "Official Online Registrations Are Currently Open";
    if (closingDate) {
      regDeadlineText = `Deadline: ${formatNepalDateOnly(closingDate)}`;
      regStatusBadge = `Open • Closes ${formatNepalDateOnly(closingDate)}`;
    } else {
      regStatusBadge = "Open Now";
    }
    regStatusVariant = "emerald";
  } else {
    // If not set: keep "soon"
    regHeadline = "Official Online Registrations Opening Soon";
    regStatusBadge = "Soon";
    regStatusVariant = "blue";
  }

  // Active Notice Banner (if enabled in Event Settings)
  const noticeBanner = (setting?.importantNoticesJson as any) || null;
  const isNoticeActive = noticeBanner && noticeBanner.enabled && noticeBanner.title;

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* Optional Important Notice Banner */}
      {isNoticeActive && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/90 text-amber-900 flex items-start gap-3 shadow-xs">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <span className="font-bold block text-sm text-amber-950">{noticeBanner.title}</span>
              <p className="text-amber-800 leading-relaxed">{noticeBanner.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 1. HERO SECTION: BALANCED 2-COLUMN EDITORIAL, HIGH CONTRAST & SLEEK */}
      {/* ==================================================================== */}
      <section className="relative py-12 sm:py-20 border-b border-[#DCE5ED] bg-gradient-to-b from-[#FAFBFD] via-[#F4F7FA]/60 to-[#FFFFFF] overflow-hidden">
        {/* Subtle Ambient Radial Highlight */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(53,111,168,0.06),transparent_70%)] pointer-events-none" />

        {/* Faint Cultural Mandala Watermark */}
        <div className="absolute -right-16 top-1/2 -translate-y-1/2 opacity-[0.03] text-[#183153] pointer-events-none hidden xl:block">
          <MithilaHeritageMandala className="w-[580px] h-[580px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Headlines, Context & Prominent Actions */}
            <div className="lg:col-span-7 space-y-6">
              {/* Institution Eyebrow Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#DCE5ED] shadow-2xs text-xs font-semibold text-[#183153]">
                <span className="w-2 h-2 rounded-full bg-[#356FA8] animate-pulse" />
                <span>
                  {setting?.organizationName || "The Origin Foundation"} &bull; {setting?.location || "Janakpur Dham, Nepal"}
                </span>
              </div>

              {/* Main Title & Tagline */}
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-6xl font-black font-sans tracking-tight text-[#183153] leading-[1.1]">
                  {setting?.competitionName || "Mithila Queen"}
                </h1>
                <p className="text-xl sm:text-2xl font-serif text-[#356FA8] italic">
                  &ldquo;{setting?.competitionTagline || "Celebrating Mithila's Culture, Confidence & Talent."}&rdquo;
                </p>
              </div>

              {/* Explanatory Paragraph */}
              <p className="text-sm sm:text-base text-[#546E7A] leading-relaxed max-w-2xl">
                {setting?.shortIntro ||
                  "The Origin Foundation is a cultural platform in Janakpur Dham, Nepal. Mithila Queen is its flagship competition designed to honor regional identity, nurture public confidence, and champion the creativity of young women across Madhesh Province and Nepal."}
              </p>

              {/* Dynamic Registration Timeline Status Box */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-[#DCE5ED] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  {regStatusVariant === "emerald" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : regStatusVariant === "amber" ? (
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  ) : regStatusVariant === "rose" ? (
                    <Lock className="w-4 h-4 text-rose-600 shrink-0" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-[#356FA8] shrink-0" />
                  )}
                  <div className="text-[#263238] font-medium truncate">
                    <span className="font-semibold text-[#183153]">{regHeadline}</span>
                    {regDeadlineText && (
                      <span className="font-bold text-[#183153] ml-1.5 sm:inline block">
                        &bull; {regDeadlineText}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold border ${
                      regStatusVariant === "emerald"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : regStatusVariant === "amber"
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : regStatusVariant === "rose"
                        ? "bg-rose-50 text-rose-800 border-rose-200"
                        : "bg-blue-50 text-blue-800 border-blue-200"
                    }`}
                  >
                    {regStatusBadge}
                  </span>
                  <span className="font-mono font-bold text-[#183153] bg-[#F4F7FA] border border-[#DCE5ED] px-2.5 py-0.5 rounded">
                    NPR {regFee}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Register Now & Check Application Status */}
              <div className="space-y-3 pt-1">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                  <Link href="/register" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto bg-[#183153] hover:bg-[#12243D] text-white font-bold text-sm sm:text-base h-13 px-8 rounded-xl shadow-md gap-3 transition-all hover:scale-[1.01]">
                      <span>
                        {regStatusVariant === "amber"
                          ? `Registration Starts ${formatNepalDateOnly(openingDate)}`
                          : regStatusVariant === "rose"
                          ? "Registrations Closed"
                          : "Register for Mithila Queen"}
                      </span>
                      <span className="text-[11px] bg-white/20 text-white px-2 py-0.5 rounded-md font-mono font-bold">
                        NPR {regFee}
                      </span>
                      <ArrowRight className="w-4 h-4 text-[#DCE5ED]" />
                    </Button>
                  </Link>

                  <Link href="/registration-status" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto border-2 border-[#183153]/25 hover:border-[#183153] bg-white hover:bg-[#F4F7FA] text-[#183153] font-bold text-sm sm:text-base h-13 px-7 rounded-xl shadow-2xs gap-2.5 transition-all"
                    >
                      <Search className="w-4 h-4 text-[#356FA8]" />
                      <span>Check Application Status</span>
                    </Button>
                  </Link>
                </div>

                <p className="text-[11px] text-[#546E7A] flex items-center gap-1.5 pt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Instant 6-digit OTP verification &bull; Independent bank review &bull; Open to all girls of any age</span>
                </p>
              </div>
            </div>

            {/* Right Column: Visual Event Snapshot Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#DCE5ED] shadow-sm space-y-5 relative overflow-hidden">
                {/* Accent Top Border */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#183153] via-[#356FA8] to-[#183153]" />

                {/* Card Title & Cultural Badge */}
                <div className="flex items-center justify-between pb-4 border-b border-[#DCE5ED]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F4F7FA] border border-[#356FA8] text-[#183153] flex items-center justify-center shrink-0">
                      <Crown className="w-5 h-5 text-[#356FA8]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#183153]">Mithila Queen 2026</h3>
                      <p className="text-[11px] text-[#546E7A]">Official Cultural Competition Dossier</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#183153] bg-[#F4F7FA] px-2.5 py-1 rounded-full border border-[#DCE5ED]">
                    Janakpur Dham
                  </span>
                </div>

                {/* Quick Key Facts */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#F4F7FA] border border-[#DCE5ED] space-y-0.5">
                    <span className="text-[10px] font-bold text-[#546E7A] uppercase tracking-wider block">Candidate Fee</span>
                    <span className="font-mono font-bold text-[#183153] text-sm">NPR {regFee}</span>
                    <span className="text-[10px] text-[#546E7A] block">Nepalese Rupees</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F4F7FA] border border-[#DCE5ED] space-y-0.5">
                    <span className="text-[10px] font-bold text-[#546E7A] uppercase tracking-wider block">Eligibility</span>
                    <span className="font-bold text-[#183153] text-sm">Girls Only</span>
                    <span className="text-[10px] text-[#546E7A] block">Any age &amp; background</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F4F7FA] border border-[#DCE5ED] space-y-0.5">
                    <span className="text-[10px] font-bold text-[#546E7A] uppercase tracking-wider block">Experience</span>
                    <span className="font-bold text-[#183153] text-sm">Zero Required</span>
                    <span className="text-[10px] text-[#546E7A] block">Beginners welcome</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F4F7FA] border border-[#DCE5ED] space-y-0.5">
                    <span className="text-[10px] font-bold text-[#546E7A] uppercase tracking-wider block">Venue</span>
                    <span className="font-bold text-[#183153] text-sm">Janakpur Dham</span>
                    <span className="text-[10px] text-[#546E7A] block">Madhesh Province</span>
                  </div>
                </div>

                {/* Official Candidate Checklist */}
                <div className="p-3.5 rounded-xl bg-white border border-[#DCE5ED] space-y-2 text-xs">
                  <span className="font-bold text-[11px] text-[#183153] block">Candidate Entry Checklist</span>
                  <div className="space-y-1.5 text-[#546E7A] text-[11px]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Online application with 6-digit email OTP verification</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Upload official payment QR transfer receipt</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Instant MQ-YYYY-XXXXXX reference pass generated</span>
                    </div>
                  </div>
                </div>

                {/* Quick Link Footer */}
                <div className="pt-1 flex items-center justify-between text-xs border-t border-[#DCE5ED]/60 text-[#546E7A]">
                  <Link href="/mithila-queen" className="text-[#356FA8] hover:underline font-semibold inline-flex items-center gap-1">
                    <span>Competition Guidelines</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                  <Link href="/registration-status" className="text-[#183153] hover:underline font-semibold inline-flex items-center gap-1">
                    <span>Look up Status</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Bulletin 3-Feature Bar */}
          <div className="pt-6 border-t border-[#DCE5ED] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#546E7A]">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/70 border border-[#DCE5ED]/80 shadow-2xs">
              <div className="w-9 h-9 rounded-lg bg-[#F4F7FA] border border-[#DCE5ED] flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-[#356FA8]" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#546E7A] block">Event Schedule</span>
                <span className="font-bold text-[#183153]">{setting?.eventSchedule || "Auditions & Finale TBA"}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/70 border border-[#DCE5ED]/80 shadow-2xs">
              <div className="w-9 h-9 rounded-lg bg-[#F4F7FA] border border-[#DCE5ED] flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-[#356FA8]" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#546E7A] block">Headquarters</span>
                <span className="font-bold text-[#183153]">{setting?.location || "Janakpur Dham, Nepal"}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/70 border border-[#DCE5ED]/80 shadow-2xs">
              <div className="w-9 h-9 rounded-lg bg-[#F4F7FA] border border-[#DCE5ED] flex items-center justify-center shrink-0">
                <Award className="w-4 h-4 text-[#356FA8]" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#546E7A] block">Flagship Awards</span>
                <span className="font-bold text-[#183153]">{prizes?.[0]?.title ? "Crown & Prestigious Honors" : "Official Recognition"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 2. INSTITUTIONAL MISSION: THE ORIGIN FOUNDATION */}
      {/* ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-2xl bg-white border border-[#DCE5ED] shadow-xs space-y-6">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#356FA8]">
              About The Origin Foundation
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#263238]">
              Rooted in Identity. Driven by Purpose.
            </h2>
            <p className="text-sm text-[#546E7A] leading-relaxed">
              The Origin Foundation was established in Janakpur Dham, the historical epicenter of Mithila civilization. Our mission is to bridge ancestral cultural knowledge with contemporary youth aspiration, offering young women a respectful, prestigious platform where their intelligence, artistic talents, and cultural pride are recognized and celebrated.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            <div className="p-5 rounded-xl bg-[#F4F7FA] border border-[#DCE5ED] space-y-2">
              <Building2 className="w-5 h-5 text-[#356FA8]" />
              <h3 className="font-bold text-sm text-[#263238]">Janakpur Dham Roots</h3>
              <p className="text-xs text-[#546E7A] leading-relaxed">
                Operating directly from Dhanusha District, Madhesh Province, maintaining genuine community ties.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#F4F7FA] border border-[#DCE5ED] space-y-2">
              <Crown className="w-5 h-5 text-[#356FA8]" />
              <h3 className="font-bold text-sm text-[#263238]">Flagship Platform</h3>
              <p className="text-xs text-[#546E7A] leading-relaxed">
                Mithila Queen is the primary annual competition dedicated to female talent and cultural voice.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#F4F7FA] border border-[#DCE5ED] space-y-2">
              <ShieldCheck className="w-5 h-5 text-[#356FA8]" />
              <h3 className="font-bold text-sm text-[#263238]">Administrative Integrity</h3>
              <p className="text-xs text-[#546E7A] leading-relaxed">
                Clear rules, transparent fee structure, email OTP verification, and independent banking verification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 3. KEY FACTS & ELIGIBILITY AT A GLANCE */}
      {/* ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#356FA8]">
            Key Information
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#263238]">
            Eligibility & Competition Guidelines
          </h2>
          <p className="text-xs sm:text-sm text-[#546E7A]">
            Everything you need to know before submitting your candidacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {eligibilityFacts.map((fact, index) => (
            <div
              key={index}
              className="p-5 rounded-xl bg-white border border-[#DCE5ED] shadow-xs space-y-2 hover:border-[#356FA8] transition-colors"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#356FA8] block">
                {fact.label}
              </span>
              <p className="font-bold text-[#263238] text-sm">{fact.value}</p>
              <p className="text-xs text-[#546E7A] leading-relaxed">{fact.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4. THE 4 CULTURAL PILLARS (EVALUATION PHILOSOPHY) */}
      {/* ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#356FA8]">
            Evaluation Philosophy
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#263238]">
            A Cultural Platform &bull; Not Just a Beauty Pageant
          </h2>
          <p className="text-xs sm:text-sm text-[#546E7A]">
            Mithila Queen looks beyond appearance. Every candidate is evaluated on knowledge, poise, creative talent, and community spirit.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar) => (
            <div
              key={pillar.step}
              className="p-6 rounded-xl bg-[#F4F7FA] border border-[#DCE5ED] space-y-3"
            >
              <span className="w-8 h-8 rounded-md bg-[#183153] text-white flex items-center justify-center font-mono text-xs font-bold">
                {pillar.step}
              </span>
              <h3 className="font-bold text-sm text-[#263238]">{pillar.title}</h3>
              <p className="text-xs text-[#546E7A] leading-relaxed">{pillar.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 5. REGISTRATION PROCESS: EXPLAINED BEFORE ASKING USERS TO REGISTER */}
      {/* ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="max-w-3xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#356FA8]">
            Application Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#263238]">
            How to Register: Application Process Overview
          </h2>
          <p className="text-xs sm:text-sm text-[#546E7A]">
            Our structured application takes just a few minutes. Please have your identity details, a recent portrait photograph, and social media handle ready.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {registrationSteps.map((s) => (
            <div
              key={s.num}
              className="p-5 rounded-xl bg-white border border-[#DCE5ED] shadow-xs space-y-2 relative"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#356FA8]">
                  Stage 0{s.num}
                </span>
                <span className="text-[10px] font-mono text-[#546E7A]">Stage {s.num}</span>
              </div>
              <h3 className="font-bold text-sm text-[#263238]">{s.title}</h3>
              <p className="text-xs text-[#546E7A] leading-relaxed">{s.desc}</p>
            </div>
          ))}

          {/* Quick CTA Card */}
          <div className="p-5 rounded-xl bg-[#183153] text-white space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#356FA8]">
                Ready to begin?
              </span>
              <h4 className="font-bold text-sm text-white">Start Your Registration</h4>
              <p className="text-xs text-[#DCE5ED] leading-relaxed">
                Protected step 1 verification with instant 6-digit email OTP.
              </p>
            </div>
            <Link href="/register">
              <Button className="w-full bg-[#356FA8] hover:bg-[#2B5A88] text-white text-xs font-bold h-9 gap-1.5 shadow-xs">
                <span>Start Application</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 6. AUDITION VIDEO GUIDELINES */}
      {/* ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-2xl bg-white border border-[#DCE5ED] shadow-xs space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#356FA8]">
              Audition Video Guidelines
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#263238]">
              Introduction & Talent Video Submission
            </h2>
            <p className="text-xs sm:text-sm text-[#546E7A]">
              Candidates share a short 60-90 second introduction clip demonstrating personality, thoughts on Mithila heritage, and unique creative talent.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-[#F4F7FA] border border-[#DCE5ED] space-y-2">
              <Video className="w-5 h-5 text-[#356FA8]" />
              <h3 className="font-bold text-sm text-[#263238]">1. Record Your Video</h3>
              <p className="text-xs text-[#546E7A] leading-relaxed">
                60-90 seconds. Introduce yourself in Maithili, Nepali, or English. Speak clearly in good natural lighting without heavy digital filters.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#F4F7FA] border border-[#DCE5ED] space-y-2">
              <Sparkles className="w-5 h-5 text-[#356FA8]" />
              <h3 className="font-bold text-sm text-[#263238]">2. Post on Social Media</h3>
              <p className="text-xs text-[#546E7A] leading-relaxed">
                Post on your TikTok or Instagram profile using the official hashtag{" "}
                <strong className="text-[#183153]">{setting?.requiredHashtags || "#MithilaQueen2026"}</strong>.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#F4F7FA] border border-[#DCE5ED] space-y-2">
              <Phone className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-sm text-[#263238]">3. WhatsApp Delivery</h3>
              <p className="text-xs text-[#546E7A] leading-relaxed">
                Send the original file on WhatsApp directly to Managing Director Gaurav Gupta at{" "}
                <span className="font-mono font-bold text-[#183153]">{setting?.whatsappContact || "+977 9704571941"}</span> with your Registration ID.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 7. PRIZES & HONORS */}
      {/* ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#356FA8]">
            Awards & Recognition
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#263238]">
            Competition Prizes
          </h2>
          <p className="text-xs sm:text-sm text-[#546E7A]">
            Honoring exceptional cultural presentation, poise, and talent.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {prizes.map((p: any, i: number) => (
            <div
              key={i}
              className="p-6 rounded-xl bg-white border border-[#DCE5ED] shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F4F7FA] text-[#356FA8] px-2.5 py-0.5 rounded border border-[#DCE5ED]">
                  {p.badge || `Award 0${i + 1}`}
                </span>
                <Award className="w-4 h-4 text-[#356FA8]" />
              </div>
              <h3 className="font-bold text-base text-[#183153]">{p.position}</h3>
              <p className="text-sm font-semibold text-[#263238]">{p.title}</p>
              <p className="text-xs text-[#546E7A] pt-2 border-t border-[#DCE5ED]">{p.status}</p>
            </div>
          ))}
        </div>

        {/* 4th & 5th Prize Notice per PDF Brief */}
        <div className="p-4 rounded-xl bg-[#F4F7FA] border border-[#DCE5ED] text-xs text-[#546E7A] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#356FA8] shrink-0" />
            <span>
              <strong>Fourth &amp; Fifth Honors:</strong> Details to be announced later by the organizing committee.
            </span>
          </div>
          <span className="text-[11px] font-medium text-[#183153] hidden sm:inline">
            Status: Proposed by organizers
          </span>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 8. EXECUTIVE GOVERNANCE & LEADERSHIP DIRECTORY */}
      {/* ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#356FA8]">
            Executive Governance
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#263238]">
            Organizing Committee &bull; Managing Directors
          </h2>
          <p className="text-xs sm:text-sm text-[#546E7A]">
            Direct leadership contacts with equal operational standing for authentic, transparent correspondence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {/* Gaurav Gupta */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#DCE5ED] shadow-xs space-y-4 hover:border-[#356FA8] transition-colors">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#356FA8] block">
                Executive Leadership
              </span>
              <h3 className="text-xl font-bold text-[#183153]">Gaurav Gupta</h3>
              <p className="text-xs font-semibold text-[#546E7A]">
                Managing Director &bull; Operations &amp; Administration
              </p>
            </div>
            <p className="text-xs text-[#546E7A] leading-relaxed">
              Leading candidate relations, audition video intake, and administrative coordination for Mithila Queen.
            </p>
            <div className="pt-3 border-t border-[#DCE5ED] space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[#546E7A]">
                <span>Direct Contact:</span>
                <a
                  href="tel:+9779704571941"
                  className="font-mono font-bold text-[#183153] hover:text-[#356FA8] transition-colors"
                >
                  +977 9704571941
                </a>
              </div>
              <div className="flex items-center justify-between text-[#546E7A]">
                <span>WhatsApp:</span>
                <a
                  href="https://wa.me/9779704571941"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono font-bold text-[#356FA8] hover:underline"
                >
                  +977 9704571941
                </a>
              </div>
            </div>
          </div>

          {/* Dipendra Shah Kalwar */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#DCE5ED] shadow-xs space-y-4 hover:border-[#356FA8] transition-colors">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#356FA8] block">
                Executive Leadership
              </span>
              <h3 className="text-xl font-bold text-[#183153]">Dipendra Shah Kalwar</h3>
              <p className="text-xs font-semibold text-[#546E7A]">
                Managing Director &bull; Strategic Outreach &amp; Community Relations
              </p>
            </div>
            <p className="text-xs text-[#546E7A] leading-relaxed">
              Directing community partnerships, regional outreach across Madhesh Province, and institutional engagement.
            </p>
            <div className="pt-3 border-t border-[#DCE5ED] space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[#546E7A]">
                <span>Direct Contact:</span>
                <a
                  href="tel:+9779812005468"
                  className="font-mono font-bold text-[#183153] hover:text-[#356FA8] transition-colors"
                >
                  +977 981-2005468
                </a>
              </div>
              <div className="flex items-center justify-between text-[#546E7A]">
                <span>Location:</span>
                <span className="font-semibold text-[#183153]">Janakpur Dham, Nepal</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 9. EXPANDABLE FREQUENTLY ASKED QUESTIONS */}
      {/* ==================================================================== */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[#356FA8]">
            Information Desk
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#263238]">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-[#546E7A]">
            Click any question to view clear answers regarding registration, fees, and auditions.
          </p>
        </div>

        <ExpandableFaqs faqs={faqs} />

        <div className="text-center pt-2">
          <Link href="/faq">
            <Button
              variant="outline"
              size="sm"
              className="h-10 text-xs font-semibold border-[#DCE5ED] text-[#263238] hover:bg-[#F4F7FA] gap-1.5"
            >
              <span>View Full FAQ Directory</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#356FA8]" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 9. FINAL CALL TO ACTION BANNER */}
      {/* ==================================================================== */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="p-8 sm:p-12 rounded-2xl bg-[#183153] text-white space-y-5 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Begin Your Application for {setting?.competitionName || "Mithila Queen"}
          </h2>
          <p className="text-xs sm:text-sm text-[#DCE5ED] max-w-xl mx-auto leading-relaxed">
            Complete the online application form, submit the NPR {regFee} registration fee, and receive your official registration dossier.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/register">
              <Button className="w-full sm:w-auto bg-[#356FA8] hover:bg-[#2B5A88] text-white font-bold text-xs h-11 px-7 rounded-md shadow-xs gap-2">
                <span>Start Registration (NPR {regFee})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
            <Link href="/registration-status">
              <Button
                variant="outline"
                className="w-full sm:w-auto border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white text-xs h-11 px-6 rounded-md font-medium"
              >
                Check Application Status
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

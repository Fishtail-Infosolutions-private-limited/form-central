import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  Phone,
  Video,
  Award,
  Users,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  MessageCircle,
  Sparkles,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MithilaHeritageMandala } from "@/components/brand/brand-logos";
import { prisma } from "@/lib/db/prisma";
import { formatNepalDateOnly } from "@/lib/utils/timezone";

export const metadata = {
  title: "Mithila Queen | Flagship Competition of The Origin Foundation",
  description:
    "Mithila Queen: Celebrating Mithila's Culture, Confidence & Talent in Janakpur Dham, Nepal. Open to all girls, married or unmarried, with zero prior experience required.",
};

export default async function MithilaQueenPage() {
  const setting = await prisma.siteSetting.findUnique({
    where: { id: "primary" },
  });

  const regFee = setting?.registrationFee || 399;

  const eligibilityRules = [
    {
      rule: "Gender Eligibility",
      criteria: "Girls only. Any female candidate can participate.",
      note: "Celebrates female cultural voice and empowerment across Mithila.",
    },
    {
      rule: "Age Requirements",
      criteria: "No minimum or maximum age requirement.",
      note: "Because there is no age barrier, girls under 18 register with mandatory parent/guardian legal consent.",
    },
    {
      rule: "Marital Status",
      criteria: "Both unmarried and married girls can participate.",
      note: "Inclusive participation reflecting community life across Madhesh Province and Nepal.",
    },
    {
      rule: "Prior Experience",
      criteria: "No previous stage or competition experience required.",
      note: "First-time newcomers are warmly welcomed and evaluated with complete impartiality.",
    },
    {
      rule: "Registration Fee",
      criteria: `Strictly NPR ${regFee} per registration (Nepalese rupees only).`,
      note: "Collected via verified official QR code with independent bank reconciliation before review.",
    },
  ];

  const evaluationPillars = [
    {
      title: "Cultural Articulation",
      desc: "Knowledge and genuine appreciation of Mithila's heritage, folk art traditions, Maithili literature, and community values.",
    },
    {
      title: "Talent & Creative Expression",
      desc: "Artistic capabilities—whether in traditional or modern painting, music, dance, writing, public speaking, or social innovation.",
    },
    {
      title: "Stage Poise & Confidence",
      desc: "Graceful articulation of thoughts, dignity of bearing, and the courage to voice aspirations before an audience.",
    },
    {
      title: "Community Representation",
      desc: "The desire to represent Janakpur Dham and the Madhesh region with responsibility, integrity, and cultural pride.",
    },
  ];

  const prizes: Array<{ place: string; title: string; badge?: string; status?: string; value?: string }> =
    (setting?.prizesJson as any) || [
      {
        place: "First Prize",
        title: "iPhone 18 Pro Max, Red, 512 GB",
        status: "Proposed by organizers",
        badge: "Crown Winner",
      },
      {
        place: "Second Prize",
        title: "MAC Beauty Products Collection",
        value: "Approx. NPR 30,000 estimated value",
        status: "Proposed value",
        badge: "First Runner-Up",
      },
      {
        place: "Third Prize",
        title: "Smartphone or Quality Electronic Device",
        status: "To be confirmed",
        badge: "Second Runner-Up",
      },
    ];

  const videoSteps = [
    {
      step: "01",
      title: "Record Introduction",
      desc: "Create a 60-90 second video introducing your identity, location, and creative talents in Maithili, Nepali, or English.",
    },
    {
      step: "02",
      title: "Tag on Social Media",
      desc: "Post your video on your personal TikTok or Instagram profile using the official hashtag #MithilaQueen2026.",
    },
    {
      step: "03",
      title: "Submit on WhatsApp",
      desc: "Send the original video file directly on WhatsApp to Managing Director Gaurav Gupta at +977 9704571941.",
    },
    {
      step: "04",
      title: "Verification & Review",
      desc: "Ensure the sent message includes your Registration ID (MQ-YYYY-XXXXXX) for immediate administrative matching.",
    },
  ];

  // Dynamic Availability & Registration Timeline Logic
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
    regHeadline = `Official Online Registrations Start on ${formatNepalDateOnly(openingDate)}`;
    regStatusBadge = `Starts ${formatNepalDateOnly(openingDate)}`;
    regStatusVariant = "amber";
  } else if (openingDate || closingDate) {
    regHeadline = "Official Online Registrations Are Currently Open";
    if (closingDate) {
      regDeadlineText = `Deadline: ${formatNepalDateOnly(closingDate)}`;
      regStatusBadge = `Open • Closes ${formatNepalDateOnly(closingDate)}`;
    } else {
      regStatusBadge = "Open Now";
    }
    regStatusVariant = "emerald";
  } else {
    regHeadline = "Official Online Registrations Opening Soon";
    regStatusBadge = "Soon";
    regStatusVariant = "blue";
  }

  return (
    <div className="space-y-16 sm:space-y-24 py-12 sm:py-20">
      {/* Hero Banner - Refined Light Tint Background */}
      <section className="relative py-16 sm:py-24 border-b border-[#DCE5ED] bg-gradient-to-b from-[#FAFBFD] via-[#F4F7FA]/75 to-[#FFFFFF] overflow-hidden">
        {/* Subtle Ambient Radial Highlight */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(53,111,168,0.06),transparent_70%)] pointer-events-none" />

        <div className="absolute -right-24 top-1/2 -translate-y-1/2 opacity-[0.035] text-[#183153] pointer-events-none hidden lg:block">
          <MithilaHeritageMandala className="w-[480px] h-[480px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#DCE5ED] text-xs font-semibold text-[#183153] shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#356FA8]" />
            <span>Flagship Cultural Initiative &bull; {setting?.organizationName || "The Origin Foundation"}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black font-sans text-[#183153] tracking-tight">
            {setting?.competitionName || "Mithila Queen"}
          </h1>

          <p className="text-xl sm:text-2xl text-[#356FA8] font-serif italic max-w-2xl mx-auto">
            &ldquo;{setting?.competitionTagline || "Celebrating Mithila's Culture, Confidence & Talent."}&rdquo;
          </p>

          <p className="text-sm sm:text-base text-[#546E7A] max-w-2xl mx-auto leading-relaxed">
            {setting?.shortIntro ||
              "An official cultural and talent-oriented competition based in Janakpur Dham, Nepal. Open to girls of any age, unmarried or married, with no prior stage experience required."}
          </p>

          {/* Registration Live Status Card */}
          <div className="max-w-xl mx-auto p-3.5 rounded-xl bg-white border border-[#DCE5ED] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#263238] font-medium">
              <span
                className={`w-2 h-2 rounded-full ${
                  regStatusVariant === "emerald"
                    ? "bg-emerald-500 animate-pulse"
                    : regStatusVariant === "amber"
                    ? "bg-amber-500"
                    : regStatusVariant === "rose"
                    ? "bg-rose-500"
                    : "bg-blue-500"
                }`}
              />
              <span>{regHeadline}</span>
              {regDeadlineText && <span className="font-bold text-[#183153]">&bull; {regDeadlineText}</span>}
            </div>
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
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link href="/register" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-[#183153] hover:bg-[#12243D] text-white font-bold text-sm h-13 px-8 rounded-xl shadow-md gap-3 transition-all hover:scale-[1.01]">
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
                className="w-full sm:w-auto border-2 border-[#183153]/25 hover:border-[#183153] bg-white hover:bg-[#F4F7FA] text-[#183153] font-bold text-sm h-13 px-7 rounded-xl shadow-2xs gap-2.5 transition-all"
              >
                <Search className="w-4 h-4 text-[#356FA8]" />
                <span>Check Application Status</span>
              </Button>
            </Link>
            <Link href="/rules" className="w-full sm:w-auto">
              <Button
                variant="ghost"
                className="w-full sm:w-auto text-[#183153] hover:bg-black/5 text-xs h-13 px-5 rounded-xl font-semibold border border-[#DCE5ED]"
              >
                Rules &amp; Code
              </Button>
            </Link>
          </div>

          <div className="pt-6 border-t border-[#DCE5ED] flex flex-wrap items-center justify-center gap-6 text-xs text-[#546E7A]">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#356FA8]" />
              <span>Schedule: <strong className="text-[#183153]">{setting?.eventSchedule || "To Be Announced"}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#356FA8]" />
              <span>Location: <strong className="text-[#183153]">{setting?.location || "Janakpur Dham, Nepal"}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#356FA8]" />
              <span className="text-[#183153]">Girls Only (Any Age) &bull; Newcomers Welcome</span>
            </div>
          </div>
        </div>
      </section>

      {/* Cultural Platform Philosophy */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-2xl bg-white border border-[#DCE5ED] shadow-xs space-y-6">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#356FA8]">
              Evaluation Philosophy
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#263238]">
              A Cultural Platform &bull; Not Merely a Physical Pageant
            </h2>
            <p className="text-sm text-[#546E7A] leading-relaxed">
              Mithila Queen is consciously framed around cultural wisdom, self-confidence, articulation, and talent. Physical beauty is not the primary criteria. We evaluate each participant across four core competencies:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
            {evaluationPillars.map((p, i) => (
              <div key={i} className="p-6 rounded-xl bg-[#F4F7FA] border border-[#DCE5ED] space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#356FA8] block">
                  Criteria 0{i + 1}
                </span>
                <h3 className="font-bold text-sm text-[#263238]">{p.title}</h3>
                <p className="text-xs text-[#546E7A] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rules & Eligibility Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#356FA8]">
            Standards & Requirements
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#263238]">
            Eligibility Guidelines
          </h2>
          <p className="text-xs sm:text-sm text-[#546E7A]">
            Clear, transparent participation rules established by The Origin Foundation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {eligibilityRules.map((rule, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-white border border-[#DCE5ED] shadow-xs space-y-2 hover:border-[#356FA8] transition-colors"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#356FA8] block">
                {rule.rule}
              </span>
              <p className="font-bold text-[#263238] text-sm">{rule.criteria}</p>
              <p className="text-xs text-[#546E7A] leading-relaxed">{rule.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Video Audition & WhatsApp Submission */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#356FA8]">
            Audition Guidelines
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#263238]">
            Video Audition Process
          </h2>
          <p className="text-xs sm:text-sm text-[#546E7A]">
            Participants share a short introduction video demonstrating their personality, cultural thoughts, and talent.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {videoSteps.map((step) => (
            <div
              key={step.step}
              className="p-6 rounded-xl bg-white border border-[#DCE5ED] shadow-xs space-y-3 hover:border-[#356FA8] transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-md bg-[#183153] text-white flex items-center justify-center font-bold text-xs font-mono">
                  {step.step}
                </span>
                <Video className="w-4 h-4 text-[#356FA8]" />
              </div>
              <h3 className="text-sm font-bold text-[#263238]">{step.title}</h3>
              <p className="text-xs text-[#546E7A] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* WhatsApp Receiving Line Banner */}
        <div className="p-6 rounded-2xl bg-[#183153] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#356FA8] uppercase tracking-wider block">
              Direct WhatsApp Audition Line
            </span>
            <p className="text-sm font-semibold text-white">
              Send your video directly to Managing Director Gaurav Gupta:{" "}
              <span className="font-mono text-[#DCE5ED]">+977 9704571941</span>
            </p>
          </div>
          <a
            href="https://wa.me/9779704571941"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#356FA8] hover:bg-[#2B5A88] text-white text-xs font-bold h-10 px-5 rounded-md transition-colors shrink-0 shadow-xs"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Open WhatsApp Chat</span>
          </a>
        </div>
      </section>

      {/* Prizes Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#356FA8]">
            Recognition
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#263238]">
            Proposed Competition Awards
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {prizes.map((p, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border border-[#DCE5ED] shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F4F7FA] text-[#356FA8] px-2.5 py-0.5 rounded border border-[#DCE5ED]">
                  {p.badge}
                </span>
                <Award className="w-4 h-4 text-[#356FA8]" />
              </div>
              <h3 className="font-bold text-base text-[#183153]">{p.place}</h3>
              <p className="text-sm font-semibold text-[#263238]">{p.title}</p>
              {p.value && <p className="text-xs text-[#546E7A] font-mono">{p.value}</p>}
              <p className="text-xs text-[#546E7A] pt-2 border-t border-[#DCE5ED]">{p.status}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="p-8 sm:p-12 rounded-2xl bg-[#183153] text-white space-y-5 shadow-xs">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Begin Your Registration for {setting?.competitionName || "Mithila Queen"}
          </h2>
          <p className="text-xs sm:text-sm text-[#DCE5ED] max-w-xl mx-auto">
            Complete the online application form, submit the NPR {regFee} administrative fee, and receive your official candidate dossier.
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

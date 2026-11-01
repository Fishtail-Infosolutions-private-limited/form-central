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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MithilaQueenLogo, MithilaHeritageMandala } from "@/components/brand/brand-logos";
import { prisma } from "@/lib/db/prisma";

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
      criteria: "Girls only. Any girl can participate.",
      note: "Celebrates female cultural voice and empowerment across Mithila.",
    },
    {
      rule: "Age Requirements",
      criteria: "No minimum or maximum age requirement.",
      note: "Because there is no minimum age, girls under 18 are eligible with mandatory parent/guardian legal consent.",
    },
    {
      rule: "Marital Status",
      criteria: "Both unmarried and married girls can participate.",
      note: "Inclusive participation reflecting real community life across Madhesh Province.",
    },
    {
      rule: "Prior Experience",
      criteria: "No previous stage or competition experience required.",
      note: "First-time newcomers are warmly welcomed and evaluated with complete impartiality.",
    },
    {
      rule: "Registration Fee",
      criteria: `Strictly NPR ${regFee} per registration (Nepalese rupees only).`,
      note: "Collected via official QR code with independent bank reconciliation before review.",
    },
  ];

  const evaluationPillars = [
    {
      title: "Cultural Articulation",
      desc: "Deep knowledge and genuine appreciation of Mithila's heritage, folk art traditions, Maithili literature, and community values.",
    },
    {
      title: "Talent & Creative Expression",
      desc: "Artistic capabilities—whether in traditional or modern painting, music, dance, writing, public speaking, or social innovation.",
    },
    {
      title: "Stage Poise & Confidence",
      desc: "Self-belief, graceful articulation of thoughts, dignity of bearing, and the courage to voice aspirations before an audience.",
    },
    {
      title: "Community Representation",
      desc: "The desire to represent Janakpur Dham and the Madhesh region with responsibility, integrity, and cultural pride.",
    },
  ];

  const prizes = (setting?.prizesJson as any) || [
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
    {
      place: "Fourth & Fifth Prize",
      title: "Special Recognitions & Trophies",
      status: "Details to be announced later",
      badge: "Honorable Mention",
    },
  ];

  const videoSteps = [
    {
      step: "01",
      title: "Create Your Introduction Video",
      desc: "Record a short 60–90 second video introducing yourself, expressing why you want to participate, and demonstrating your talent or thoughts on Mithila heritage.",
    },
    {
      step: "02",
      title: "Publish on Social Media",
      desc: "Post the video on your personal TikTok and Instagram profiles using the required official tags and hashtags once announced.",
    },
    {
      step: "03",
      title: "Submit on WhatsApp to Gaurav Gupta",
      desc: "Send the original video directly on WhatsApp to Managing Director Gaurav Gupta at +977 9704571941.",
    },
    {
      step: "04",
      title: "Verification & Confirmation",
      desc: "Ensure the sent video displays your tags and registration details for seamless cross-verification by the organizing team.",
    },
  ];

  return (
    <div className="py-12 sm:py-20 space-y-16 sm:space-y-24">
      {/* ==================================================================== */}
      {/* HERO BANNER */}
      {/* ==================================================================== */}
      <section className="bg-maroon text-white py-16 sm:py-24 border-b border-white/20 relative overflow-hidden">
        {/* Ambient background mandala */}
        <div className="absolute -right-20 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden lg:block">
          <MithilaHeritageMandala className="w-[480px] h-[480px]" accent="var(--color-brand-accent, #D97706)" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/20 border border-white/20 text-antique-gold text-xs font-semibold uppercase tracking-wider">
            <span>Flagship Cultural Initiative &bull; The Origin Foundation</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black font-serif text-white tracking-tight">
            Mithila Queen
          </h1>

          <p className="text-xl sm:text-2xl text-antique-gold font-serif italic max-w-2xl mx-auto">
            &ldquo;Celebrating Mithila&apos;s Culture, Confidence & Talent.&rdquo;
          </p>

          <p className="text-sm sm:text-base text-stone-200 max-w-2xl mx-auto leading-relaxed">
            An official cultural and talent-oriented competition based in Janakpur Dham, Nepal. Open to girls of any age, unmarried or married, with no prior stage experience required.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link href="/register">
              <Button className="w-full sm:w-auto bg-saffron hover:bg-saffron-dark text-white font-bold text-sm h-12 px-7 rounded-md shadow-md gap-2 group">
                <span>Register Online</span>
                <span className="text-xs bg-black/20 px-2 py-0.5 rounded font-mono font-bold">
                  NPR {regFee}
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
            <Link href="/rules">
              <Button
                variant="outline"
                className="w-full sm:w-auto border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white text-sm h-12 px-6 rounded-md"
              >
                Read Official Rules & Safeguarding
              </Button>
            </Link>
          </div>

          <div className="pt-6 border-t border-white/15 flex flex-wrap items-center justify-center gap-6 text-xs text-stone-200">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-antique-gold" />
              <span>Schedule: <strong>{setting?.eventSchedule || "To Be Announced"}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-antique-gold" />
              <span>Format: <strong>Online Registration Portal</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-antique-gold" />
              <span>Girls Only (Any Age) &bull; Newcomers Welcome</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* CULTURAL PLATFORM PHILOSOPHY */}
      {/* ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-xl bg-white border border-cream-dark shadow-xs space-y-6">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-saffron">
              Evaluation Philosophy
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-maroon font-serif">
              A Cultural Platform — Not Merely a Physical Beauty Contest
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              Mithila Queen is consciously framed around cultural wisdom, self-confidence, articulation, and talent. Physical beauty is not the primary criteria. We evaluate each participant across four core competencies:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
            {evaluationPillars.map((p, i) => (
              <div key={i} className="p-6 rounded-xl bg-soft-cream border border-cream-dark space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-saffron block">
                  Criteria 0{i + 1}
                </span>
                <h3 className="font-bold text-maroon text-base font-serif">{p.title}</h3>
                <p className="text-xs text-stone-600 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* ELIGIBILITY CRITERIA TABLE */}
      {/* ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-saffron">
            Eligibility & Inclusivity
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-maroon font-serif">
            Who Can Participate?
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            Our eligibility rules are straightforward, fair, and designed to remove arbitrary barriers.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-cream-dark shadow-xs overflow-hidden">
          <div className="divide-y divide-cream-dark">
            {eligibilityRules.map((item, idx) => (
              <div key={idx} className="p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="md:w-1/3">
                  <span className="text-xs font-bold uppercase tracking-wider text-saffron block">
                    Rule 0{idx + 1}
                  </span>
                  <h3 className="text-base font-bold text-maroon font-serif mt-0.5">
                    {item.rule}
                  </h3>
                </div>
                <div className="md:w-1/3">
                  <span className="font-bold text-sm text-maroon block">{item.criteria}</span>
                </div>
                <div className="md:w-1/3 text-xs text-stone-500">
                  <span>{item.note}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* PROPOSED PRIZE SECTION */}
      {/* ==================================================================== */}
      <section className="bg-white py-16 sm:py-20 border-y border-cream-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-xl">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-saffron">
                Recognition
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-maroon font-serif">
                Prize Structure
              </h2>
              <p className="text-xs sm:text-sm text-stone-600">
                Honoring the hard work, courage, and regional pride demonstrated by our participants.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-soft-cream border border-cream-dark text-xs text-stone-600">
              <span className="font-bold text-maroon">Organizer Note: </span>
              <span>All unconfirmed awards are labeled per transparency guidelines.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {prizes.map((p: any, idx: number) => (
              <div
                key={idx}
                className="p-6 rounded-xl bg-soft-cream border border-cream-dark flex flex-col justify-between space-y-4 hover:border-saffron transition-colors"
              >
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-saffron">
                    {p.badge || "Prize"}
                  </span>
                  <h3 className="font-serif font-bold text-base text-maroon">{p.place || p.position}</h3>
                  <p className="text-sm font-semibold text-stone-800">{p.title}</p>
                  {p.value && <p className="text-xs text-stone-500 font-mono">{p.value}</p>}
                </div>
                <div className="pt-3 border-t border-cream-dark">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white text-maroon border border-cream-dark">
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* VIDEO AUDITION & WHATSAPP SUBMISSION */}
      {/* ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-saffron">
            Audition Guidelines
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-maroon font-serif">
            Video Submission Process
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            Participants share a short introduction video demonstrating their personality, cultural thoughts, and talent.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {videoSteps.map((step) => (
            <div
              key={step.step}
              className="p-6 rounded-xl bg-white border border-cream-dark shadow-xs space-y-3 hover:border-saffron transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-lg bg-maroon text-antique-gold flex items-center justify-center font-bold text-xs font-mono">
                  {step.step}
                </span>
                <Video className="w-4 h-4 text-saffron" />
              </div>
              <h3 className="text-base font-bold text-maroon font-serif">{step.title}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="p-6 rounded-xl bg-maroon text-white border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-antique-gold uppercase tracking-wider block">
              Direct WhatsApp Submission Line
            </span>
            <p className="text-sm font-semibold text-white">
              Send your video directly to Managing Director Gaurav Gupta:{" "}
              <span className="font-mono text-antique-gold">+977 9704571941</span>
            </p>
          </div>
          <a
            href="https://wa.me/9779704571941"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-saffron hover:bg-saffron-dark text-white text-xs font-bold h-10 px-5 rounded-md transition-colors shrink-0"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Open WhatsApp Chat</span>
          </a>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* FINAL CALL TO ACTION */}
      {/* ==================================================================== */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-maroon font-serif">
          Begin Your Registration for Mithila Queen
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto">
          Complete the 7-step online application form, submit the NPR {regFee} administrative registration fee, and receive your official registration confirmation.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/register">
            <Button className="bg-saffron hover:bg-saffron-dark text-white font-bold text-xs h-11 px-7 rounded-md shadow-xs gap-2">
              <span>Start Registration (NPR {regFee})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
          <Link href="/registration-status">
            <Button variant="outline" className="border-cream-dark text-maroon hover:bg-soft-cream text-xs h-11 px-6 rounded-md font-medium">
              Check Application Status
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

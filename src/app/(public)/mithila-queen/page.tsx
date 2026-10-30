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

export const metadata = {
  title: "Mithila Queen | Flagship Competition of The Origin Foundation",
  description:
    "Mithila Queen: Celebrating Mithila's Culture, Confidence & Talent in Janakpur Dham, Nepal. Open to all girls, married or unmarried, with zero prior experience required.",
};

export default function MithilaQueenPage() {
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
      criteria: "Strictly NPR 399 per registration (Nepalese rupees only).",
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

  const prizes = [
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
      <section className="bg-[#0A192F] text-[#FDFBF7] py-16 sm:py-24 border-b border-[#243B53] relative overflow-hidden">
        {/* Ambient background mandala */}
        <div className="absolute -right-20 top-1/2 -translate-y-1/2 opacity-15 pointer-events-none hidden lg:block">
          <MithilaHeritageMandala className="w-[480px] h-[480px]" accent="#C5A880" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#243B53]/50 border border-[#C5A880]/40 text-[#C5A880] text-xs font-semibold uppercase tracking-wider">
            <span>Flagship Cultural Initiative &bull; The Origin Foundation</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black font-serif text-[#FFFFFF] tracking-tight">
            Mithila Queen
          </h1>

          <p className="text-xl sm:text-2xl text-[#C5A880] font-serif italic max-w-2xl mx-auto">
            &ldquo;Celebrating Mithila&apos;s Culture, Confidence & Talent.&rdquo;
          </p>

          <p className="text-sm sm:text-base text-[#E9E2D5]/90 max-w-2xl mx-auto leading-relaxed">
            An official cultural and talent-oriented competition based in Janakpur Dham, Nepal. Open to girls of any age, unmarried or married, with no prior stage experience required.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link href="/register">
              <Button className="w-full sm:w-auto bg-[#C5A880] hover:bg-[#b8986d] text-[#0A192F] font-bold text-sm h-12 px-7 rounded-xl shadow-md gap-2 group">
                <span>Register Online</span>
                <span className="text-xs bg-[#0A192F]/15 px-2 py-0.5 rounded font-mono font-bold">
                  NPR 399
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
            <Link href="/rules">
              <Button
                variant="outline"
                className="w-full sm:w-auto border-[#C5A880]/50 text-[#FDFBF7] hover:bg-[#243B53]/60 text-sm h-12 px-6 rounded-xl"
              >
                Read Official Rules & Safeguarding
              </Button>
            </Link>
          </div>

          <div className="pt-6 border-t border-[#243B53]/80 flex flex-wrap items-center justify-center gap-6 text-xs text-[#E9E2D5]/80">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#C5A880]" />
              <span>Schedule: <strong>To Be Announced</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#C5A880]" />
              <span>Format: <strong>Online Registration Portal</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
              <span>Girls Only (Any Age) &bull; Newcomers Welcome</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* CULTURAL PLATFORM PHILOSOPHY */}
      {/* ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#E9E2D5] shadow-xs space-y-6">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#C5A880]">
              Evaluation Philosophy
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A192F] font-serif">
              A Cultural Platform — Not Merely a Physical Beauty Contest
            </h2>
            <p className="text-sm text-[#243B53] leading-relaxed">
              Mithila Queen is consciously framed around cultural wisdom, self-confidence, articulation, and talent. Physical beauty is not the primary criteria. We evaluate each participant across four core competencies:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
            {evaluationPillars.map((p, i) => (
              <div key={i} className="p-6 rounded-2xl bg-[#FDFBF7] border border-[#E9E2D5] space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#C5A880] block">
                  Criteria 0{i + 1}
                </span>
                <h3 className="font-bold text-[#0A192F] text-base font-serif">{p.title}</h3>
                <p className="text-xs text-[#243B53] leading-relaxed">{p.desc}</p>
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
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#C5A880]">
            Eligibility & Inclusivity
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A192F] font-serif">
            Who Can Participate?
          </h2>
          <p className="text-xs sm:text-sm text-[#243B53]">
            Our eligibility rules are straightforward, fair, and designed to remove arbitrary barriers.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-[#E9E2D5] shadow-xs overflow-hidden">
          <div className="divide-y divide-[#E9E2D5]">
            {eligibilityRules.map((item, idx) => (
              <div key={idx} className="p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="md:w-1/3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C5A880] block">
                    Rule 0{idx + 1}
                  </span>
                  <h3 className="text-base font-bold text-[#0A192F] font-serif mt-0.5">
                    {item.rule}
                  </h3>
                </div>
                <div className="md:w-1/3">
                  <span className="font-bold text-sm text-[#0A192F] block">{item.criteria}</span>
                </div>
                <div className="md:w-1/3 text-xs text-zinc-500">
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
      <section className="bg-white py-16 sm:py-20 border-y border-[#E9E2D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-xl">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#C5A880]">
                Recognition
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A192F] font-serif">
                Prize Structure
              </h2>
              <p className="text-xs sm:text-sm text-[#243B53]">
                Honoring the hard work, courage, and regional pride demonstrated by our participants.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#FDFBF7] border border-[#E9E2D5] text-xs text-[#243B53]">
              <span className="font-bold text-[#0A192F]">Organizer Note: </span>
              <span>All unconfirmed awards are labeled per transparency guidelines.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {prizes.map((p, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#FDFBF7] border border-[#E9E2D5] flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#C5A880]">
                    {p.badge}
                  </span>
                  <h3 className="font-serif font-bold text-base text-[#0A192F]">{p.place}</h3>
                  <p className="text-sm font-semibold text-[#243B53]">{p.title}</p>
                  {p.value && <p className="text-xs text-zinc-500 font-mono">{p.value}</p>}
                </div>
                <div className="pt-3 border-t border-[#E9E2D5]">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white text-[#243B53] border border-[#E9E2D5]">
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
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#C5A880]">
            Audition Guidelines
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A192F] font-serif">
            Video Submission Process
          </h2>
          <p className="text-xs sm:text-sm text-[#243B53]">
            Participants share a short introduction video demonstrating their personality, cultural thoughts, and talent.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {videoSteps.map((step) => (
            <div
              key={step.step}
              className="p-6 rounded-2xl bg-white border border-[#E9E2D5] shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-lg bg-[#0A192F] text-[#C5A880] flex items-center justify-center font-bold text-xs font-mono">
                  {step.step}
                </span>
                <Video className="w-4 h-4 text-[#C5A880]" />
              </div>
              <h3 className="text-base font-bold text-[#0A192F] font-serif">{step.title}</h3>
              <p className="text-xs text-[#243B53] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="p-6 rounded-2xl bg-[#0A192F] text-[#FDFBF7] border border-[#243B53] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#C5A880] uppercase tracking-wider block">
              Direct WhatsApp Submission Line
            </span>
            <p className="text-sm font-semibold text-white">
              Send your video directly to Managing Director Gaurav Gupta:{" "}
              <span className="font-mono text-[#C5A880]">+977 9704571941</span>
            </p>
          </div>
          <a
            href="https://wa.me/9779704571941"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#C5A880] hover:bg-[#b8986d] text-[#0A192F] text-xs font-bold h-10 px-5 rounded-xl transition-colors shrink-0"
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
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A192F] font-serif">
          Begin Your Registration for Mithila Queen
        </h2>
        <p className="text-xs sm:text-sm text-[#243B53] max-w-xl mx-auto">
          Complete the 7-step online application form, submit the NPR 399 administrative registration fee, and receive your official registration confirmation.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/register">
            <Button className="bg-[#C5A880] hover:bg-[#b8986d] text-[#0A192F] font-bold text-xs h-11 px-7 rounded-xl shadow-xs gap-2">
              <span>Start Registration (NPR 399)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
          <Link href="/registration-status">
            <Button variant="outline" className="border-[#243B53]/20 text-[#0A192F] text-xs h-11 px-6 rounded-xl font-medium">
              Check Application Status
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

import React from "react";
import Link from "next/link";
import {
  Crown,
  Sparkles,
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
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MithilaMotif, MithilaCornerMotif } from "@/components/ui/mithila-motif";

export const metadata = {
  title: "Mithila Queen | Flagship Competition of The Origin Foundation",
  description:
    "Mithila Queen: Celebrating Mithila's Culture, Confidence & Talent in Janakpur Dham, Nepal. Open to all girls, married or unmarried, with zero prior experience required.",
};

export default function MithilaQueenPage() {
  const eligibilityPoints = [
    {
      title: "Gender Eligibility",
      detail: "Girls only. Any girl can participate.",
    },
    {
      title: "No Age Restriction",
      detail: "Open to girls of any age. For minor participants under 18 years, parental or legal guardian consent is strictly recorded.",
    },
    {
      title: "Marital Status",
      detail: "Both unmarried and married girls are warmly eligible.",
    },
    {
      title: "Prior Experience",
      detail: "No previous stage or pageant experience required. Newcomers and first-time applicants are celebrated and evaluated fairly.",
    },
    {
      title: "Registration Fee",
      detail: "NPR 399 per registration, paid via verified QR code with transaction reference and payment screenshot submission.",
    },
  ];

  const videoSteps = [
    {
      step: "01",
      title: "Create Your Introduction Video",
      desc: "Record a short video introducing yourself, expressing your motivation, and demonstrating your talent or thoughts on Mithila heritage.",
    },
    {
      step: "02",
      title: "Publish to TikTok & Instagram",
      desc: "Post the video on your personal social media profile. Tag the official accounts and include the required hashtags once officially announced.",
    },
    {
      step: "03",
      title: "Send via WhatsApp to Gaurav Gupta",
      desc: "Send the original video file directly on WhatsApp to Managing Director Gaurav Gupta at +977 9704571941.",
    },
    {
      step: "04",
      title: "Administrative Review",
      desc: "Ensure the sent video displays your tags and registration details for seamless cross-verification by the organizing team.",
    },
  ];

  const prizes = [
    {
      place: "First Prize",
      title: "iPhone 18 Pro Max, Red, 512 GB",
      status: "Proposed by Organizers",
      badge: "Flagship Award",
    },
    {
      place: "Second Prize",
      title: "MAC Beauty Products Collection",
      value: "Approx. NPR 30,000 value",
      status: "Proposed Value",
      badge: "Runner Up",
    },
    {
      place: "Third Prize",
      title: "Smartphone or Premium Tech Product",
      status: "To Be Confirmed",
      badge: "Third Place",
    },
    {
      place: "Fourth & Fifth Prize",
      title: "Honorable Mention & Awards",
      status: "Details to be Announced Later",
      badge: "Special Honors",
    },
  ];

  return (
    <div className="py-12 sm:py-20 space-y-16 sm:space-y-24">
      {/* HERO BANNER */}
      <section className="bg-[#0A192F] text-[#FDFBF7] py-16 sm:py-24 border-b border-[#243B53] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#243B53]/60 border border-[#C5A880]/40 text-[#C5A880] text-xs font-semibold">
            <Crown className="w-4 h-4" />
            <span>Presented by The Origin Foundation • Janakpur Dham</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black font-serif text-[#FFFFFF] tracking-tight">
            Mithila Queen
          </h1>

          <p className="text-xl sm:text-2xl text-[#C5A880] font-serif italic max-w-2xl mx-auto">
            &ldquo;Celebrating Mithila&apos;s Culture, Confidence & Talent.&rdquo;
          </p>

          <p className="text-sm sm:text-base text-[#E9E2D5]/85 max-w-2xl mx-auto leading-relaxed">
            A cultural and talent-oriented competition intended to bring together participants who want to express their individual creativity, leadership, and connection with Mithila&apos;s heritage.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register">
              <Button className="w-full sm:w-auto bg-[#C5A880] hover:bg-[#b8986d] text-[#0A192F] font-bold text-sm h-12 px-7 rounded-xl shadow-md gap-2">
                <span>Register Online</span>
                <span className="text-xs bg-[#0A192F]/15 px-2 py-0.5 rounded font-mono">NPR 399</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/rules">
              <Button variant="outline" className="w-full sm:w-auto border-[#C5A880]/60 text-[#FDFBF7] hover:bg-[#243B53]/50 text-sm h-12 px-6 rounded-xl">
                Competition Rules & Eligibility
              </Button>
            </Link>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-[#E9E2D5]/70">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#C5A880]" />
              <span>Event Schedule: <strong>To Be Announced</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#C5A880]" />
              <span>Location: <strong>Janakpur Dham, Nepal</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
              <span>Girls Only (Any Age)</span>
            </div>
          </div>
        </div>
      </section>

      {/* COMPETITION PHILOSOPHY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#E9E2D5] shadow-xs space-y-6">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C5A880]">
              Our Philosophy
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A192F] font-serif">
              Beyond Conventional Pageantry
            </h2>
            <p className="text-sm text-[#243B53] leading-relaxed">
              Mithila Queen is consciously presented as a cultural and talent-oriented platform, not solely a physical beauty contest. The event evaluates participants on:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
            <div className="p-5 rounded-2xl bg-[#FDFBF7] border border-[#E9E2D5] space-y-2">
              <h3 className="font-bold text-[#0A192F] text-sm font-serif">Cultural Articulation</h3>
              <p className="text-xs text-[#243B53] leading-relaxed">Understanding, respect, and expression of Mithila&apos;s rich traditions, language, art, and values.</p>
            </div>
            <div className="p-5 rounded-2xl bg-[#FDFBF7] border border-[#E9E2D5] space-y-2">
              <h3 className="font-bold text-[#0A192F] text-sm font-serif">Artistic & Personal Talent</h3>
              <p className="text-xs text-[#243B53] leading-relaxed">Art, painting, music, dance, writing, public speaking, or specialized creative capabilities.</p>
            </div>
            <div className="p-5 rounded-2xl bg-[#FDFBF7] border border-[#E9E2D5] space-y-2">
              <h3 className="font-bold text-[#0A192F] text-sm font-serif">Poise & Confidence</h3>
              <p className="text-xs text-[#243B53] leading-relaxed">Dignity, self-belief, clarity of thought, and authentic community leadership representation.</p>
            </div>
            <div className="p-5 rounded-2xl bg-[#FDFBF7] border border-[#E9E2D5] space-y-2">
              <h3 className="font-bold text-[#0A192F] text-sm font-serif">Community Impact</h3>
              <p className="text-xs text-[#243B53] leading-relaxed">Desire to serve as a role model and inspire girls and women across the Madhesh region.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ELIGIBILITY CRITERIA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C5A880]">
            Participation Standards
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A192F] font-serif">
            Eligibility Rules
          </h2>
          <p className="text-xs sm:text-sm text-[#243B53]">
            Decided by the organizers of The Origin Foundation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {eligibilityPoints.map((item, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white border border-[#E9E2D5] shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2 text-[#C5A880]">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-sm text-[#0A192F] font-serif">{item.title}</h3>
              </div>
              <p className="text-xs text-[#243B53] leading-relaxed pl-7">
                {item.detail}
              </p>
            </div>
          ))}

          <div className="p-6 rounded-2xl bg-[#0A192F] text-[#FDFBF7] border border-[#243B53] space-y-2.5">
            <div className="flex items-center gap-2 text-[#C5A880]">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm text-white font-serif">Minor Safeguarding</h3>
            </div>
            <p className="text-xs text-[#E9E2D5]/80 leading-relaxed pl-7">
              Because there is no minimum age, applicants under 18 must have parental or legal guardian consent formally recorded in the system during registration.
            </p>
          </div>
        </div>
      </section>

      {/* VIDEO SUBMISSION GUIDELINES */}
      <section className="bg-[#0A192F] text-[#FDFBF7] py-16 sm:py-20 border-y border-[#243B53]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C5A880]">
              Confirmed Submission Instructions
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#FFFFFF] font-serif">
              Video Audition & Social Media Guidelines
            </h2>
            <p className="text-xs sm:text-sm text-[#E9E2D5]/80 leading-relaxed">
              To complete your competition entry, follow these confirmed instructions after registering online.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {videoSteps.map((v, i) => (
              <div key={i} className="p-6 rounded-2xl bg-[#243B53]/30 border border-[#243B53] space-y-3">
                <span className="font-mono text-2xl font-bold text-[#C5A880] block">
                  {v.step}
                </span>
                <h3 className="font-bold text-sm text-white font-serif">{v.title}</h3>
                <p className="text-xs text-[#E9E2D5]/80 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-2xl bg-[#243B53]/50 border border-[#C5A880]/40 max-w-2xl mx-auto text-center space-y-2">
            <p className="text-xs text-[#C5A880] font-semibold flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span>Official WhatsApp Video Submission:</span>
            </p>
            <p className="text-lg font-bold text-white font-mono">
              Gaurav Gupta: +977 9704571941
            </p>
            <p className="text-[11px] text-[#E9E2D5]/70">
              Official Instagram/TikTok handles and contest hashtags will be announced on this website once authorized by organizers.
            </p>
          </div>
        </div>
      </section>

      {/* PRIZE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C5A880]">
            Rewards & Recognition
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A192F] font-serif">
            Prize Structure
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {prizes.map((p, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white border border-[#E9E2D5] shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#C5A880]">{p.place}</span>
                <Award className="w-4 h-4 text-[#C5A880]" />
              </div>
              <h3 className="text-base font-bold text-[#0A192F] font-serif">{p.title}</h3>
              {p.value && <p className="text-xs font-mono font-semibold text-[#243B53]">{p.value}</p>}
              <div className="pt-2 border-t border-[#E9E2D5]">
                <span className="text-[10px] font-semibold text-[#243B53] bg-[#E9E2D5]/50 px-2 py-0.5 rounded">
                  {p.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL ACTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <MithilaMotif className="w-full h-3 text-[#C5A880]/40 mx-auto" />
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A192F] font-serif">
          Begin Your Mithila Queen Journey
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/register">
            <Button className="bg-[#C5A880] hover:bg-[#b8986d] text-[#0A192F] font-bold text-xs h-11 px-7 rounded-xl shadow-xs gap-2">
              <span>Register Now (NPR 399)</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/registration-status">
            <Button variant="outline" className="border-[#243B53]/20 text-[#0A192F] text-xs h-11 px-6 rounded-xl font-medium">
              Check Existing Registration
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}


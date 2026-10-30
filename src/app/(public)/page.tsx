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
  Mail,
  Award,
  Users,
  HeartHandshake,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Gift,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MithilaMotif, MithilaCornerMotif } from "@/components/ui/mithila-motif";

export const metadata = {
  title: "The Origin Foundation | Mithila Queen - Janakpur Dham, Nepal",
  description:
    "Rooted in Identity. Driven by Purpose. The Origin Foundation presents Mithila Queen: Celebrating Mithila's Culture, Confidence & Talent.",
};

export default function HomePage() {
  const prizes = [
    {
      position: "First Prize",
      title: "iPhone 18 Pro Max, Red, 512 GB",
      tag: "Proposed by Organizers",
      accent: "border-[#C5A880] bg-[#FDFBF7]",
    },
    {
      position: "Second Prize",
      title: "MAC Beauty Products",
      value: "Approx. NPR 30,000 value",
      tag: "Proposed Value",
      accent: "border-[#243B53]/20 bg-[#FDFBF7]",
    },
    {
      position: "Third Prize",
      title: "Smartphone / Premium Electronics",
      tag: "To Be Confirmed",
      accent: "border-[#243B53]/20 bg-[#FDFBF7]",
    },
    {
      position: "Fourth & Fifth Prize",
      title: "Special Recognition & Awards",
      tag: "Details to be Announced",
      accent: "border-[#243B53]/20 bg-[#FDFBF7]",
    },
  ];

  const highlights = [
    {
      title: "Girls Only (Any Age)",
      desc: "Open to all girls. Both unmarried and married participants are warmly eligible. Minor participants require guardian consent.",
    },
    {
      title: "No Prior Experience Required",
      desc: "Newcomers are welcome. Passion for Mithila heritage, confidence, and personal talent are prioritized over past stage titles.",
    },
    {
      title: "Cultural & Talent Expression",
      desc: "A respectful cultural platform celebrating artistic expression, traditional heritage, knowledge, and regional pride.",
    },
    {
      title: "Transparent NPR 399 Fee",
      desc: "Fair registration fee with verified QR code payment and independent administrative bank verification.",
    },
  ];

  const faqs = [
    {
      q: "What is The Origin Foundation?",
      a: "The Origin Foundation is a platform being developed in Janakpur Dham, Nepal, with an ambition to celebrate cultural identity, encourage talent, and create opportunities for participation and representation.",
    },
    {
      q: "What is Mithila Queen?",
      a: "Mithila Queen is the proposed flagship initiative of The Origin Foundation. It is a competition intended to bring together participants who want to express their talent, confidence, creativity, and connection with Mithila's cultural heritage.",
    },
    {
      q: "What is the registration fee?",
      a: "The official registration fee is strictly NPR 399 per registration, collected in Nepalese rupees only.",
    },
    {
      q: "When will the event take place?",
      a: "Event Schedule: To Be Announced. Format: Online registration via this official website. Any physical event or venue details will be published once officially confirmed by the organizers.",
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* HERO SECTION */}
      <section className="relative bg-[#0A192F] text-[#FDFBF7] py-20 sm:py-28 overflow-hidden border-b border-[#243B53]">
        {/* Subtle patterned backdrop */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#C5A880_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Cultural Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#243B53]/60 border border-[#C5A880]/40 text-[#C5A880] text-xs font-semibold tracking-wide">
              <Crown className="w-4 h-4" />
              <span>Flagship Initiative of The Origin Foundation</span>
              <span className="text-[#243B53]">•</span>
              <span className="text-[#FDFBF7]/80">Janakpur Dham, Nepal</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-black font-serif tracking-tight text-[#FFFFFF] leading-tight sm:leading-[1.15]">
              Mithila Queen
            </h1>

            {/* Tagline */}
            <p className="text-xl sm:text-2xl text-[#C5A880] font-serif italic font-medium">
              Celebrating Mithila&apos;s Culture, Confidence & Talent.
            </p>

            {/* Brief Introduction */}
            <p className="text-sm sm:text-base text-[#E9E2D5]/85 leading-relaxed max-w-2xl mx-auto font-sans">
              An authentic cultural and talent-oriented platform empowering girls across Mithila to express their identity, creativity, and regional pride on a prestigious national stage.
            </p>

            {/* Action CTAs */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link href="/register" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-[#C5A880] hover:bg-[#b8986d] text-[#0A192F] font-bold text-sm h-12 px-7 rounded-xl shadow-md transition-all gap-2">
                  <span>Register Now</span>
                  <span className="text-xs bg-[#0A192F]/15 px-2 py-0.5 rounded font-mono">NPR 399</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              <Link href="/mithila-queen" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-[#C5A880]/60 text-[#FDFBF7] hover:bg-[#243B53]/50 hover:text-[#FFFFFF] text-sm h-12 px-6 rounded-xl font-medium"
                >
                  Discover Mithila Queen
                </Button>
              </Link>
            </div>

            {/* Micro details */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-[#E9E2D5]/70">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#C5A880]" />
                <span>Event Schedule: <strong>To Be Announced</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#C5A880]" />
                <span>Format: <strong>Online Registration Portal</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
                <span>No Prior Experience Needed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: ABOUT THE FOUNDATION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C5A880] font-sans">
                About The Organization
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0A192F] font-serif">
                The Origin Foundation
              </h2>
              <p className="text-sm font-medium text-[#243B53] italic">
                Rooted in Identity. Driven by Purpose.
              </p>
            </div>

            <p className="text-sm text-[#243B53] leading-relaxed">
              The Origin Foundation is being developed as an organization based in Janakpur Dham, Nepal, with an ambition to celebrate cultural identity, encourage talent, and create genuine opportunities for participation and representation.
            </p>

            <p className="text-sm text-[#243B53] leading-relaxed">
              Its proposed flagship initiative, <strong>Mithila Queen</strong>, is a competition intended to bring together participants who want to express their talent, confidence, creativity, and connection with Mithila&apos;s rich cultural heritage.
            </p>

            <div className="pt-2">
              <Link href="/about">
                <Button variant="outline" className="border-[#243B53]/30 text-[#0A192F] hover:bg-[#E9E2D5]/50 gap-2 font-semibold text-xs h-10 px-4 rounded-xl">
                  <span>Learn More About Our Vision</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C5A880]" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="p-7 rounded-2xl bg-white border border-[#E9E2D5] shadow-xs space-y-4 relative">
              <MithilaCornerMotif className="w-10 h-10 text-[#C5A880] absolute top-4 right-4" />
              <div className="w-12 h-12 rounded-xl bg-[#0A192F] text-[#C5A880] flex items-center justify-center">
                <Crown className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h3 className="text-lg font-bold text-[#0A192F] font-serif">
                A Respectful National Platform
              </h3>
              <p className="text-xs text-[#243B53] leading-relaxed">
                Mithila Queen is framed around heritage, knowledge, creativity, and confidence—never merely appearance. We believe authentic cultural representation honors history while welcoming modern talent.
              </p>
              <div className="pt-2 border-t border-[#E9E2D5] flex items-center justify-between text-xs text-[#243B53]">
                <span>Headquarters:</span>
                <strong className="text-[#0A192F]">Janakpur Dham, Nepal</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: COMPETITION HIGHLIGHTS */}
      <section className="bg-white py-16 sm:py-20 border-y border-[#E9E2D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C5A880]">
              Eligibility & Guidelines
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A192F] font-serif">
              Who Can Participate in Mithila Queen?
            </h2>
            <p className="text-xs sm:text-sm text-[#243B53]">
              The competition welcomes eligible participants across Mithila with simple, transparent rules.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((h, i) => (
              <Card key={i} className="border-[#E9E2D5] shadow-2xs hover:border-[#C5A880] transition-colors rounded-2xl">
                <CardHeader className="pb-2">
                  <div className="w-9 h-9 rounded-lg bg-[#0A192F] text-[#C5A880] flex items-center justify-center font-bold text-xs mb-2">
                    0{i + 1}
                  </div>
                  <CardTitle className="text-base font-bold text-[#0A192F] font-serif">
                    {h.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-[#243B53] leading-relaxed">
                    {h.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center pt-2">
            <Link href="/rules">
              <Button variant="ghost" className="text-xs font-bold text-[#0A192F] hover:text-[#C5A880] gap-1.5">
                <span>View Complete Rules & Regulations</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 3: PRIZE STRUCTURE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C5A880]">
            Awards & Recognition
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A192F] font-serif">
            Prize Structure
          </h2>
          <p className="text-xs sm:text-sm text-[#243B53]">
            Official rewards proposed by the organizers to honor excellence, confidence, and cultural articulation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {prizes.map((p, i) => (
            <div
              key={i}
              className={`p-6 rounded-2xl border ${p.accent} shadow-2xs flex flex-col justify-between space-y-4`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C5A880]">
                    {p.position}
                  </span>
                  <Award className="w-4 h-4 text-[#C5A880]" />
                </div>
                <h3 className="text-base font-bold text-[#0A192F] font-serif">
                  {p.title}
                </h3>
                {p.value && (
                  <p className="text-xs font-semibold text-[#243B53] font-mono">
                    {p.value}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-[#E9E2D5]">
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-[#E9E2D5]/60 text-[#243B53] px-2 py-0.5 rounded border border-[#E9E2D5]">
                  {p.tag}
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-zinc-500 text-center max-w-xl mx-auto italic">
          * Note: Third, fourth, and fifth prize details are subject to final organizer confirmation before event commencement.
        </p>
      </section>

      {/* SECTION 4: LEADERSHIP SECTION */}
      <section className="bg-[#0A192F] text-[#FDFBF7] py-16 sm:py-20 border-y border-[#243B53]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C5A880]">
              Foundation Leadership
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#FFFFFF] font-serif">
              Managing Directors
            </h2>
            <p className="text-xs sm:text-sm text-[#E9E2D5]/80">
              Steering The Origin Foundation and Mithila Queen with cultural authenticity, institutional discipline, and equal responsibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Gaurav Gupta */}
            <div className="p-7 rounded-2xl bg-[#243B53]/30 border border-[#243B53] space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[#FFFFFF] font-serif">
                    Gaurav Gupta
                  </h3>
                  <p className="text-xs text-[#C5A880] font-medium tracking-wide">
                    Managing Director
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#0A192F] border border-[#C5A880]/50 text-[#C5A880] flex items-center justify-center font-bold">
                  GG
                </div>
              </div>
              <p className="text-xs text-[#E9E2D5]/80 leading-relaxed">
                Overseeing participant coordination, operational logistics, and official communications for Mithila Queen.
              </p>
              <div className="pt-3 border-t border-[#243B53] text-xs">
                <a
                  href="tel:+9779704571941"
                  className="text-[#C5A880] hover:text-white flex items-center gap-2 font-mono"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>+977 9704571941</span>
                </a>
              </div>
            </div>

            {/* Dipendra Shah Kalwar */}
            <div className="p-7 rounded-2xl bg-[#243B53]/30 border border-[#243B53] space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[#FFFFFF] font-serif">
                    Dipendra Shah Kalwar
                  </h3>
                  <p className="text-xs text-[#C5A880] font-medium tracking-wide">
                    Managing Director
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#0A192F] border border-[#C5A880]/50 text-[#C5A880] flex items-center justify-center font-bold">
                  DS
                </div>
              </div>
              <p className="text-xs text-[#E9E2D5]/80 leading-relaxed">
                Guiding institutional outreach, strategic vision, and cultural program alignment across Madhesh Province.
              </p>
              <div className="pt-3 border-t border-[#243B53] text-xs">
                <a
                  href="tel:+9779812005468"
                  className="text-[#C5A880] hover:text-white flex items-center gap-2 font-mono"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>+977 981-2005468</span>
                </a>
              </div>
            </div>
          </div>

          <p className="text-xs text-[#E9E2D5]/60 text-center">
            Official organizing team members are published under authorized guidance.
          </p>
        </div>
      </section>

      {/* SECTION 5: FAQs PREVIEW */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C5A880]">
            Common Queries
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A192F] font-serif">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white border border-[#E9E2D5] shadow-2xs space-y-2">
              <h3 className="text-sm font-bold text-[#0A192F] font-serif flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs text-[#243B53] pl-6 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center pt-2">
          <Link href="/faq">
            <Button variant="outline" className="border-[#243B53]/20 text-[#0A192F] hover:bg-[#E9E2D5]/50 text-xs font-semibold h-10 px-5 rounded-xl gap-2">
              <span>View All Frequently Asked Questions</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C5A880]" />
            </Button>
          </Link>
        </div>
      </section>

      {/* SECTION 6: BOTTOM CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="rounded-3xl bg-[#0A192F] text-[#FDFBF7] p-8 sm:p-14 border border-[#243B53] relative overflow-hidden text-center space-y-6">
          <MithilaMotif className="w-full h-4 text-[#C5A880]/30 mx-auto" />
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold font-serif text-[#FFFFFF]">
              Ready to Represent Your Heritage & Talent?
            </h2>
            <p className="text-xs sm:text-sm text-[#E9E2D5]/80 leading-relaxed">
              Registrations for Mithila Queen are officially open. Submit your application, verify your contact details, and join a celebration of cultural confidence.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/register" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-[#C5A880] hover:bg-[#b8986d] text-[#0A192F] font-bold text-sm h-12 px-8 rounded-xl shadow-md gap-2">
                <span>Begin Registration</span>
                <span className="text-xs bg-[#0A192F]/15 px-2 py-0.5 rounded font-mono">NPR 399</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/contact" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto border-[#C5A880]/60 text-[#FDFBF7] hover:bg-[#243B53]/50 text-sm h-12 px-6 rounded-xl">
                Contact Organizing Team
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}


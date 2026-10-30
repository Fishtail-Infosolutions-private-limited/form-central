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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  OriginFoundationLogo,
  MithilaHeritageMandala,
} from "@/components/brand/brand-logos";

export const metadata = {
  title: "The Origin Foundation | Mithila Queen — Janakpur Dham, Nepal",
  description:
    "The Origin Foundation presents Mithila Queen: Celebrating Mithila's Culture, Confidence & Talent. An official cultural and talent competition based in Janakpur Dham, Nepal.",
};

export default function HomePage() {
  const prizes = [
    {
      position: "First Prize",
      title: "iPhone 18 Pro Max, Red, 512 GB",
      status: "Proposed by organizers",
      badge: "Flagship Award",
      accent: "border-[#B69A65] bg-[#FFFFFF]",
      highlight: true,
    },
    {
      position: "Second Prize",
      title: "MAC Beauty Products Collection",
      value: "Approx. NPR 30,000 estimated value",
      status: "Proposed value",
      badge: "Runner Up",
      accent: "border-[#E8DFD0] bg-[#FFFFFF]",
      highlight: false,
    },
    {
      position: "Third Prize",
      title: "Smartphone or Quality Electronic Device",
      status: "To be confirmed",
      badge: "Third Place",
      accent: "border-[#E8DFD0] bg-[#FFFFFF]",
      highlight: false,
    },
    {
      position: "Fourth & Fifth Prize",
      title: "Honorable Recognition & Special Awards",
      status: "Details to be announced later",
      badge: "Special Honors",
      accent: "border-[#E8DFD0] bg-[#FFFFFF]",
      highlight: false,
    },
  ];

  const pillars = [
    {
      title: "Cultural Pride & Identity",
      subtitle: "Honoring Maithili Heritage",
      description:
        "Mithila Queen is grounded in the civilizational richness of Janakpur Dham—its classical folk art, historic language, traditions, and timeless values. Cultural appreciation takes precedence over mere appearance.",
    },
    {
      title: "Confidence & Articulation",
      subtitle: "Fostering Dignified Public Voice",
      description:
        "We provide a nurturing, respectful national stage where participants develop public speaking, graceful self-expression, and the courage to represent their aspirations before a wider audience.",
    },
    {
      title: "Creative & Artistic Talent",
      subtitle: "Championing Diverse Expression",
      description:
        "Whether through fine arts, Maithili folk music, dance, literature, poetry, or community initiative, individual talent is celebrated and evaluated with genuine fairness and impartiality.",
    },
    {
      title: "Inclusive Participation",
      subtitle: "Welcoming All Communities",
      description:
        "Open to all girls, both unmarried and married, of any age (with safeguarding consent for minors). No previous stage experience is required; first-time newcomers are celebrated.",
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
      title: "Publish on Social Media",
      desc: "Post your video on your personal TikTok and Instagram profiles using the official tags and hashtags once announced.",
    },
    {
      step: "03",
      title: "Submit on WhatsApp to Gaurav Gupta",
      desc: "Send the original video file directly on WhatsApp to Managing Director Gaurav Gupta at +977 9704571941.",
    },
    {
      step: "04",
      title: "Administrative Verification",
      desc: "Our review desk verifies your tags, video, and registration record for official evaluation.",
    },
  ];

  const registrationSteps = [
    { num: "1", title: "Personal Details & Address", desc: "Full legal name, DOB (minor check), contact, geographical address" },
    { num: "2", title: "Profile & Motivation", desc: "Talents, spoken languages, reasons for joining, voluntary education" },
    { num: "3", title: "Additional Details", desc: "Height field omitted pending organizer confirmation" },
    { num: "4", title: "Social Media Presence", desc: "At least one required (Instagram, TikTok, Facebook). No passwords" },
    { num: "5", title: "Photo & Media Upload", desc: "Profile photo and optional document securely uploaded" },
    { num: "6", title: "Rules & Minor Consent", desc: "Rules agreement + legal guardian consent timestamp if under 18" },
    { num: "7", title: "Review & QR Payment", desc: "Generate MQ-YYYY-XXXXXX reference and submit NPR 399 transfer" },
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
      a: "The registration fee is strictly NPR 399 per registration, collected in Nepalese rupees only. Payment is made via verified QR code with transaction reference submission.",
    },
    {
      q: "When will the event take place?",
      a: "Event Schedule: To Be Announced. Online registration is currently active via this official website. Any physical event or venue details will be published once officially confirmed by the organizers.",
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* ==================================================================== */}
      {/* HERO SECTION — EDITORIAL CULTURAL COMPOSITION */}
      {/* ==================================================================== */}
      <section className="relative bg-[#172B24] text-[#F5F0E6] py-20 sm:py-28 overflow-hidden border-b border-[#B69A65]/30">
        {/* Subtle patterned backdrop */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#B69A65_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Ambient Mithila Heritage Mandala (Right ambient illustration) */}
        <div className="absolute -right-20 top-1/2 -translate-y-1/2 opacity-15 pointer-events-none hidden lg:block">
          <MithilaHeritageMandala className="w-[520px] h-[520px]" accent="#B69A65" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-7">
            {/* Kicker Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#172B24]/90 border border-[#B69A65]/50 text-[#B69A65] text-xs font-semibold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B69A65]" />
              <span>The Origin Foundation Presents &bull; Janakpur Dham</span>
            </div>

            {/* Display Headline */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-[#FFFFFF] leading-[1.08]">
                Mithila Queen
              </h1>
              <p className="text-xl sm:text-2xl text-[#B69A65] font-serif italic font-normal tracking-wide">
                Celebrating Mithila&apos;s Culture, Confidence & Talent.
              </p>
            </div>

            {/* Respectful Mission Paragraph */}
            <p className="text-sm sm:text-base text-[#E8DFD0]/90 leading-relaxed font-sans max-w-2xl">
              An authentic cultural and talent-oriented competition based in Janakpur Dham, Nepal. Open to girls of any age, unmarried or married, with no prior pageant experience required. A distinguished platform framed around cultural heritage, artistic knowledge, and self-confidence.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <Link href="/register" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-[#B69A65] hover:bg-[#a88a55] text-[#172B24] font-bold text-sm h-12 px-7 rounded-md transition-all gap-2.5 shadow-none group">
                  <span>Register for Mithila Queen</span>
                  <span className="text-xs bg-[#172B24]/15 px-2 py-0.5 rounded font-mono font-bold">
                    NPR 399
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>

              <Link href="/mithila-queen" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-[#B69A65]/50 text-[#F5F0E6] hover:bg-[#172B24]/80 hover:text-[#FFFFFF] text-sm h-12 px-6 rounded-md font-medium shadow-none"
                >
                  Competition Overview & Rules
                </Button>
              </Link>
            </div>

            {/* Official Organizing Bulletin Bar */}
            <div className="pt-6 border-t border-[#B69A65]/30 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#E8DFD0]/90">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#B69A65] shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#B69A65] block">Schedule</span>
                  <span className="font-semibold text-white">To Be Announced</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#B69A65] shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#B69A65] block">Headquarters</span>
                  <span className="font-semibold text-white">Janakpur Dham, Nepal</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#B69A65] shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#B69A65] block">Eligibility</span>
                  <span className="font-semibold text-white">Any Girl &bull; Newcomers Welcome</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* EXECUTIVE STATEMENT — FROM THE MANAGING DIRECTORS */}
      {/* ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-lg bg-[#FFFFFF] border border-[#E8DFD0] relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#B69A65]">
                <span>Executive Statement</span>
                <span className="text-[#E8DFD0]">&bull;</span>
                <span>The Origin Foundation</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#172B24] leading-snug">
                &ldquo;Rooted in our cultural identity. Driven by genuine community purpose.&rdquo;
              </h2>

              <p className="text-sm text-[#292821]/80 leading-relaxed">
                The Origin Foundation was established in Janakpur Dham out of a profound commitment to our heritage. For generations, Mithila&apos;s art, language, and cultural wisdom have inspired civilizations. Through <strong>Mithila Queen</strong>, our goal is to offer a respected, national-level stage where girls from across our communities can celebrate who they are, showcase their talents, and step forward with confidence.
              </p>

              <p className="text-sm text-[#292821]/80 leading-relaxed">
                This is intentionally designed as a cultural and talent-oriented platform—not merely a physical beauty contest. We invite every eligible girl to participate with pride.
              </p>

              {/* Managing Directors Joint Signature (Equal Visual Weight) */}
              <div className="pt-4 border-t border-[#E8DFD0] grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-0.5 p-3 rounded-md bg-[#FAF5EE] border border-[#E8DFD0]">
                  <p className="font-serif font-bold text-[#172B24] text-sm">Gaurav Gupta</p>
                  <p className="text-xs text-[#A64B36] font-medium">Managing Director</p>
                  <p className="text-[11px] text-[#292821]/70 font-mono">+977 9704571941</p>
                </div>
                <div className="space-y-0.5 p-3 rounded-md bg-[#FAF5EE] border border-[#E8DFD0]">
                  <p className="font-serif font-bold text-[#172B24] text-sm">Dipendra Shah Kalwar</p>
                  <p className="text-xs text-[#A64B36] font-medium">Managing Director</p>
                  <p className="text-[11px] text-[#292821]/70 font-mono">+977 981-2005468</p>
                </div>
              </div>
            </div>

            {/* Foundation Seal Right Column */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-lg bg-[#FAF5EE] border border-[#E8DFD0] text-center space-y-3">
              <OriginFoundationLogo variant="stacked" theme="light" />
              <div className="pt-3 border-t border-[#E8DFD0] w-full text-[11px] text-[#292821]/80">
                <span>Official Secretariat: </span>
                <strong className="text-[#172B24]">Janakpur Dham, Nepal</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4 CORE CULTURAL PILLARS */}
      {/* ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#B69A65]">
            The Foundation Philosophy
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#172B24]">
            Four Core Pillars of Mithila Queen
          </h2>
          <p className="text-xs sm:text-sm text-[#292821]/75">
            How the competition is evaluated and conducted, emphasizing cultural knowledge, voice, and artistic talent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((pillar, idx) => (
            <div
              key={idx}
              className="p-7 rounded-lg bg-[#FFFFFF] border border-[#E8DFD0] hover:border-[#B69A65] transition-colors space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#A64B36]">
                  Pillar 0{idx + 1}
                </span>
                <span className="text-xs text-[#292821]/50 font-mono">Core Value</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-[#172B24]">
                {pillar.title}
              </h3>
              <p className="text-xs font-semibold text-[#B69A65]">
                {pillar.subtitle}
              </p>
              <p className="text-xs text-[#292821]/80 leading-relaxed pt-1">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* PROPOSED PRIZE POOL SECTION */}
      {/* ==================================================================== */}
      <section className="bg-[#FFFFFF] py-16 sm:py-20 border-y border-[#E8DFD0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-xl">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#B69A65]">
                Recognition & Rewards
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#172B24]">
                Prize Structure for Mithila Queen
              </h2>
              <p className="text-xs sm:text-sm text-[#292821]/75">
                Prizes proposed by the organizers to honor excellence, creative talent, and regional representation.
              </p>
            </div>

            <div className="p-3 rounded-md bg-[#FAF5EE] border border-[#E8DFD0] text-[11px] text-[#292821]/80 max-w-sm">
              <span className="font-bold text-[#172B24] block">Organizer Disclosure:</span>
              <span>All unconfirmed awards are labeled per transparency guidelines. Final prize specifications will be confirmed prior to stage rounds.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {prizes.map((p, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-lg border transition-all flex flex-col justify-between space-y-4 ${p.accent} ${
                  p.highlight ? "ring-1 ring-[#B69A65]" : ""
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#A64B36]">
                      {p.badge}
                    </span>
                    <span className="text-xs font-bold font-mono text-[#172B24]">
                      0{idx + 1}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-base text-[#172B24]">
                    {p.position}
                  </h3>
                  <p className="text-sm font-semibold text-[#292821]">
                    {p.title}
                  </p>
                  {p.value && (
                    <p className="text-xs text-[#292821]/60 font-mono">
                      {p.value}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#E8DFD0]">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FAF5EE] text-[#292821] border border-[#E8DFD0]">
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 7-STEP REGISTRATION ROADMAP */}
      {/* ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#B69A65]">
            How to Register
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#172B24]">
            The 7-Step Online Registration Journey
          </h2>
          <p className="text-xs sm:text-sm text-[#292821]/75">
            A structured, multi-step application with immediate reference ID generation and payment verification.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {registrationSteps.map((step) => (
            <div
              key={step.num}
              className="p-4 rounded-lg bg-[#FFFFFF] border border-[#E8DFD0] space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="w-7 h-7 rounded-md bg-[#172B24] text-[#B69A65] flex items-center justify-center font-mono font-bold text-xs">
                  {step.num}
                </div>
                <h3 className="text-xs font-serif font-bold text-[#172B24]">
                  {step.title}
                </h3>
              </div>
              <p className="text-[11px] text-[#292821]/75 leading-snug">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center pt-2">
          <Link href="/register">
            <Button className="bg-[#172B24] hover:bg-[#172B24]/90 text-[#F5F0E6] font-bold text-xs h-11 px-7 rounded-md border border-[#B69A65]/40 shadow-none gap-2">
              <span>Begin Step 1: Personal Information</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#B69A65]" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* VIDEO AUDITION & WHATSAPP SUBMISSION */}
      {/* ==================================================================== */}
      <section className="bg-[#172B24] text-[#F5F0E6] py-16 sm:py-20 border-y border-[#B69A65]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#B69A65]">
              Video Audition Process
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#FFFFFF]">
              How to Submit Your Introduction Video
            </h2>
            <p className="text-xs sm:text-sm text-[#E8DFD0]/80">
              The video audition allows the organizing committee to witness your confidence, articulation, and talent directly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {videoSteps.map((step) => (
              <div
                key={step.step}
                className="p-6 rounded-lg bg-[#172B24]/80 border border-[#B69A65]/30 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-md bg-[#B69A65] text-[#172B24] flex items-center justify-center font-bold text-xs font-mono">
                    {step.step}
                  </span>
                  <Video className="w-4 h-4 text-[#B69A65]" />
                </div>
                <h3 className="text-base font-serif font-bold text-[#FFFFFF]">
                  {step.title}
                </h3>
                <p className="text-xs text-[#E8DFD0]/80 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-lg bg-[#11201A] border border-[#B69A65]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#B69A65] uppercase tracking-wider block">
                Direct WhatsApp Video Audition Submission
              </span>
              <p className="text-sm font-semibold text-white">
                Send your video directly to Managing Director Gaurav Gupta:{" "}
                <span className="font-mono text-[#B69A65]">+977 9704571941</span>
              </p>
            </div>
            <a
              href="https://wa.me/9779704571941"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#B69A65] hover:bg-[#a88a55] text-[#172B24] text-xs font-bold h-10 px-5 rounded-md transition-colors shrink-0"
            >
              <span>Message on WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* FREQUENTLY ASKED QUESTIONS & CONTACT DESK */}
      {/* ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* FAQ Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#B69A65]">
                Frequently Asked Questions
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#172B24]">
                Questions on Registration & Process
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="p-5 rounded-lg bg-[#FFFFFF] border border-[#E8DFD0] space-y-2"
                >
                  <h3 className="font-serif font-bold text-sm text-[#172B24] flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#A64B36] shrink-0" />
                    <span>{faq.q}</span>
                  </h3>
                  <p className="text-xs text-[#292821]/80 leading-relaxed pl-6">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>

            <div>
              <Link href="/faq">
                <Button variant="outline" className="border-[#E8DFD0] text-[#172B24] hover:bg-[#FAF5EE] text-xs h-10 px-5 rounded-md gap-2 font-semibold">
                  <span>View All 10 Official FAQs</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#A64B36]" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Contact Desk Column (5 cols) */}
          <div className="lg:col-span-5">
            <div className="p-7 rounded-lg bg-[#FFFFFF] border border-[#E8DFD0] space-y-6">
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#B69A65]">
                  Official Organizing Secretariat
                </span>
                <h3 className="text-xl font-serif font-bold text-[#172B24]">
                  The Origin Foundation
                </h3>
                <p className="text-xs text-[#292821]/70">
                  Janakpur Dham, Madhesh Province, Nepal
                </p>
              </div>

              <div className="space-y-3 text-xs text-[#292821]">
                <div className="p-3.5 rounded-md bg-[#FAF5EE] border border-[#E8DFD0] space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#A64B36] block">
                    Managing Director
                  </span>
                  <p className="font-serif font-bold text-[#172B24] text-sm">Gaurav Gupta</p>
                  <a
                    href="tel:+9779704571941"
                    className="text-[#172B24] hover:text-[#A64B36] font-mono text-xs flex items-center gap-1.5 pt-0.5"
                  >
                    <Phone className="w-3 h-3 text-[#B69A65]" />
                    <span>+977 9704571941</span>
                  </a>
                </div>

                <div className="p-3.5 rounded-md bg-[#FAF5EE] border border-[#E8DFD0] space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#A64B36] block">
                    Managing Director
                  </span>
                  <p className="font-serif font-bold text-[#172B24] text-sm">Dipendra Shah Kalwar</p>
                  <a
                    href="tel:+9779812005468"
                    className="text-[#172B24] hover:text-[#A64B36] font-mono text-xs flex items-center gap-1.5 pt-0.5"
                  >
                    <Phone className="w-3 h-3 text-[#B69A65]" />
                    <span>+977 981-2005468</span>
                  </a>
                </div>

                <div className="p-3.5 rounded-md bg-[#FAF5EE] border border-[#E8DFD0] space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#A64B36] block">
                    Official Email
                  </span>
                  <a
                    href="mailto:originfoundation107@gmail.com"
                    className="text-[#172B24] hover:text-[#A64B36] font-mono font-medium text-xs flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#B69A65]" />
                    <span>originfoundation107@gmail.com</span>
                  </a>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/contact" className="w-full block">
                  <Button className="w-full bg-[#172B24] hover:bg-[#172B24]/90 text-[#F5F0E6] text-xs font-semibold h-10 rounded-md border border-[#B69A65]/40 shadow-none">
                    Open Contact & Inquiry Desk
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

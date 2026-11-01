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
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  OriginFoundationLogo,
  MithilaHeritageMandala,
} from "@/components/brand/brand-logos";
import { prisma } from "@/lib/db/prisma";
import { formatNepalDateTime } from "@/lib/utils/timezone";

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

  const prizes = (setting?.prizesJson as any) || [
    {
      position: "First Prize",
      title: "iPhone 18 Pro Max, Red, 512 GB",
      status: "Proposed by organizers",
      badge: "Flagship Award",
      accent: "border-antique-gold bg-white",
      highlight: true,
    },
    {
      position: "Second Prize",
      title: "MAC Beauty Products Collection",
      value: "Approx. NPR 30,000 estimated value",
      status: "Proposed value",
      badge: "Runner Up",
      accent: "border-slate-200 bg-white",
      highlight: false,
    },
    {
      position: "Third Prize",
      title: "Smartphone or Quality Electronic Device",
      status: "To be confirmed",
      badge: "Third Place",
      accent: "border-slate-200 bg-white",
      highlight: false,
    },
    {
      position: "Fourth & Fifth Prize",
      title: "Honorable Recognition & Special Awards",
      status: "Details to be announced later",
      badge: "Special Honors",
      accent: "border-slate-200 bg-white",
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
    { num: "3", title: "Additional Details", desc: "Background and aspirations evaluated by the review committee" },
    { num: "4", title: "Social Media Presence", desc: "At least one required (Instagram, TikTok, Facebook). No passwords" },
    { num: "5", title: "Photo & Media Upload", desc: "Profile photo and optional document securely uploaded" },
    { num: "6", title: "Rules & Minor Consent", desc: "Rules agreement + legal guardian consent timestamp if under 18" },
    { num: "7", title: "Review & QR Payment", desc: `Generate MQ-YYYY-XXXXXX reference and submit NPR ${regFee} transfer` },
  ];

  const faqs = (setting?.faqsJson as any) || [
    {
      q: "What is The Origin Foundation?",
      a: "The Origin Foundation is a platform being developed in Janakpur Dham, Nepal, with an ambition to celebrate cultural identity, encourage talent, and create opportunities for participation and representation.",
    },
    {
      q: "What is Mithila Queen?",
      a: "Mithila Queen is the flagship cultural initiative of The Origin Foundation. It is a competition intended to bring together participants who want to express their talent, confidence, creativity, and connection with Mithila's cultural heritage.",
    },
    {
      q: "What is the registration fee?",
      a: `The registration fee is strictly NPR ${regFee} per registration, collected in Nepalese rupees only. Payment is made via verified QR code with transaction reference submission.`,
    },
    {
      q: "When will the event take place?",
      a: "Event Schedule: To Be Announced. Online registration is currently active via this official website. Any physical event or venue details will be published once officially confirmed by the organizers.",
    },
  ];

  const isRegistrationOpen = setting?.isRegistrationOpen ?? true;
  const closingDateFormatted = setting?.registrationClosingDate
    ? formatNepalDateTime(setting.registrationClosingDate)
    : null;

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* ==================================================================== */}
      {/* HERO SECTION — MAROON & SAFFRON / GOLD */}
      {/* ==================================================================== */}
      <section className="relative overflow-hidden bg-maroon text-white pt-14 pb-20 sm:pt-24 sm:pb-28 border-b border-white/20">
        {/* Subtle Cultural Motif Watermark */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 opacity-10 pointer-events-none">
          <MithilaHeritageMandala className="w-full h-full text-antique-gold" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            {/* Super Header Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/20 border border-white/20 text-xs font-semibold text-antique-gold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-saffron animate-pulse" />
              <span>The Origin Foundation &bull; Janakpur Dham, Nepal</span>
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-black tracking-tight text-white leading-[1.08]">
                Mithila Queen
              </h1>
              <p className="text-xl sm:text-2xl font-serif text-antique-gold italic font-normal">
                Celebrating Mithila&apos;s Culture, Confidence & Talent
              </p>
            </div>

            {/* Subtitle / Positioning */}
            <p className="text-sm sm:text-base text-stone-200 leading-relaxed font-sans max-w-2xl">
              An institutional platform created to celebrate cultural identity, articulate personal voice, and champion the creativity of young women across Janakpur Dham and Nepal.
            </p>

            {/* Registration Status Banner */}
            <div className="p-3.5 rounded-xl bg-black/20 border border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-stone-200">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-antique-gold shrink-0" />
                <span>
                  {isRegistrationOpen
                    ? "Official Registrations Are Currently Open"
                    : "Official Registrations Are Currently Closed"}
                  {closingDateFormatted && isRegistrationOpen ? ` &bull; Deadline: ${closingDateFormatted}` : ""}
                </span>
              </div>
              <span className="font-mono font-bold text-antique-gold shrink-0">Fee: NPR {regFee}</span>
            </div>

            {/* CTA Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link href="/register" className="w-full sm:w-auto">
                <Button className="w-full bg-saffron hover:bg-saffron-dark text-white font-bold text-xs h-12 px-8 rounded-md shadow-sm gap-2">
                  <span>Register for Mithila Queen (NPR {regFee})</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              <Link href="/registration-status" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white text-xs font-semibold h-12 px-6 rounded-md gap-2"
                >
                  <Search className="w-4 h-4 text-antique-gold" />
                  <span>Check Application Status</span>
                </Button>
              </Link>
            </div>

            {/* Official Organizing Bulletin Bar */}
            <div className="pt-6 border-t border-white/15 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-stone-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-antique-gold shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-antique-gold block">Schedule</span>
                  <span className="font-semibold text-white">{setting?.eventSchedule || "To Be Announced"}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-antique-gold shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-antique-gold block">Headquarters</span>
                  <span className="font-semibold text-white">{setting?.location || "Janakpur Dham, Nepal"}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-antique-gold shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-antique-gold block">Eligibility</span>
                  <span className="font-semibold text-white">Any Girl &bull; Newcomers Welcome</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* DEDICATED INLINE APPLICATION STATUS & RESUME SECTION */}
      {/* ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-xl bg-white border border-cream-dark shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-saffron">
              <Search className="w-3.5 h-3.5 text-saffron" />
              <span>Already Registered or Resuming Draft?</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-maroon">
              Check Your Status or Resume Application
            </h3>
            <p className="text-xs text-stone-600 max-w-xl leading-relaxed">
              If you have already started or submitted an application, enter your verified email to track payment verification, complete drafts, edit allowed details, or download your official confirmation certificate.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <Link href="/registration-status" className="w-full sm:w-auto">
              <Button className="w-full bg-maroon hover:bg-maroon-dark text-white font-bold text-xs h-11 px-6 rounded-md gap-2">
                <span>Check Application Status</span>
                <ArrowRight className="w-3.5 h-3.5 text-antique-gold" />
              </Button>
            </Link>
            <Link href="/register" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full border-cream-dark text-maroon hover:bg-soft-cream text-xs font-semibold h-11 px-5">
                Resume Draft
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* EXECUTIVE STATEMENT — FROM THE MANAGING DIRECTORS */}
      {/* ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-xl bg-white border border-cream-dark relative overflow-hidden shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-saffron">
                <span>Executive Statement</span>
                <span className="text-stone-300">&bull;</span>
                <span>The Origin Foundation</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-maroon leading-snug">
                &ldquo;Rooted in our cultural identity. Driven by genuine community purpose.&rdquo;
              </h2>

              <p className="text-sm text-stone-600 leading-relaxed">
                The Origin Foundation was established in Janakpur Dham out of a profound commitment to our heritage. For generations, Mithila&apos;s art, language, and cultural wisdom have inspired civilizations. Through <strong>Mithila Queen</strong>, our goal is to offer a respected, national-level stage where girls from across our communities can celebrate who they are, showcase their talents, and step forward with confidence.
              </p>

              <p className="text-sm text-stone-600 leading-relaxed">
                This is intentionally designed as a cultural and talent-oriented platform—not merely a physical beauty contest. We invite every eligible girl to participate with pride.
              </p>

              {/* Managing Directors Joint Signature (Equal Visual Weight) */}
              <div className="pt-4 border-t border-cream-dark grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-0.5 p-3.5 rounded-xl bg-soft-cream border border-cream-dark">
                  <p className="font-serif font-bold text-maroon text-sm">Gaurav Gupta</p>
                  <p className="text-xs text-saffron font-semibold">Managing Director</p>
                  <p className="text-[11px] text-stone-500 font-mono">+977 9704571941</p>
                </div>
                <div className="space-y-0.5 p-3.5 rounded-xl bg-soft-cream border border-cream-dark">
                  <p className="font-serif font-bold text-maroon text-sm">Dipendra Shah Kalwar</p>
                  <p className="text-xs text-saffron font-semibold">Managing Director</p>
                  <p className="text-[11px] text-stone-500 font-mono">+977 981-2005468</p>
                </div>
              </div>
            </div>

            {/* Foundation Seal Right Column */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-xl bg-soft-cream border border-cream-dark text-center space-y-3">
              <OriginFoundationLogo variant="stacked" theme="light" />
              <div className="pt-3 border-t border-cream-dark w-full text-[11px] text-stone-600">
                <span>Official Secretariat: </span>
                <strong className="text-maroon">Janakpur Dham, Nepal</strong>
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
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-saffron">
            The Foundation Philosophy
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-maroon">
            Four Core Pillars of Mithila Queen
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            How the competition is evaluated and conducted, emphasizing cultural knowledge, voice, and artistic talent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((pillar, idx) => (
            <div
              key={idx}
              className="p-7 rounded-xl bg-white border border-cream-dark hover:border-saffron transition-colors space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-saffron">
                  Pillar 0{idx + 1}
                </span>
                <span className="text-xs text-stone-400 font-mono">Core Value</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-maroon">
                {pillar.title}
              </h3>
              <p className="text-xs font-semibold text-saffron">
                {pillar.subtitle}
              </p>
              <p className="text-xs text-stone-600 leading-relaxed pt-1">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* PROPOSED PRIZE POOL SECTION */}
      {/* ==================================================================== */}
      <section className="bg-white py-16 sm:py-20 border-y border-cream-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-xl">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-saffron">
                Recognition & Rewards
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-maroon">
                Prize Structure for Mithila Queen
              </h2>
              <p className="text-xs sm:text-sm text-stone-600">
                Prizes proposed by the organizers to honor excellence, creative talent, and regional representation.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-soft-cream border border-cream-dark text-[11px] text-stone-600 max-w-sm">
              <span className="font-bold text-maroon block">Organizer Disclosure:</span>
              <span>All unconfirmed awards are labeled per transparency guidelines. Final prize specifications will be confirmed prior to stage rounds.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {prizes.map((p: any, idx: number) => (
              <div
                key={idx}
                className={`p-6 rounded-xl border transition-all flex flex-col justify-between space-y-4 ${p.accent || "border-cream-dark bg-white"} ${
                  p.highlight ? "ring-1 ring-saffron border-saffron" : "border-cream-dark bg-white"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-saffron">
                      {p.badge || "Prize"}
                    </span>
                    <span className="text-xs font-bold font-mono text-maroon">
                      0{idx + 1}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-base text-maroon">
                    {p.position}
                  </h3>
                  <p className="text-sm font-semibold text-stone-800">
                    {p.title}
                  </p>
                  {p.value && (
                    <p className="text-xs text-stone-500 font-mono">
                      {p.value}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-cream-dark">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-soft-cream text-maroon border border-cream-dark">
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
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-saffron">
            How to Register
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-maroon">
            The 7-Step Online Registration Journey
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            A structured, multi-step application with immediate reference ID generation and payment verification.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {registrationSteps.map((s) => (
            <div
              key={s.num}
              className="p-4 rounded-xl bg-white border border-cream-dark space-y-2 flex flex-col justify-between shadow-xs hover:border-saffron transition-colors"
            >
              <div className="space-y-1.5">
                <div className="w-7 h-7 rounded-md bg-maroon text-antique-gold flex items-center justify-center font-mono font-bold text-xs">
                  {s.num}
                </div>
                <h3 className="text-xs font-serif font-bold text-maroon">
                  {s.title}
                </h3>
              </div>
              <p className="text-[11px] text-stone-500 leading-snug">
                {s.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center pt-2">
          <Link href="/register">
            <Button className="bg-maroon hover:bg-maroon-dark text-white font-bold text-xs h-11 px-7 rounded-md border border-antique-gold/30 shadow-sm gap-2">
              <span>Begin Step 1: Personal Information</span>
              <ArrowRight className="w-3.5 h-3.5 text-antique-gold" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* VIDEO AUDITION & WHATSAPP SUBMISSION (MAROON BAND) */}
      {/* ==================================================================== */}
      <section className="bg-maroon text-white py-16 sm:py-20 border-y border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-antique-gold">
              Video Audition Process
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white">
              How to Submit Your Introduction Video
            </h2>
            <p className="text-xs sm:text-sm text-stone-200">
              The video audition allows the organizing committee to witness your confidence, articulation, and talent directly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {videoSteps.map((s) => (
              <div
                key={s.step}
                className="p-6 rounded-xl bg-black/20 border border-white/15 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-md bg-saffron text-white flex items-center justify-center font-bold text-xs font-mono">
                    {s.step}
                  </span>
                  <Video className="w-4 h-4 text-antique-gold" />
                </div>
                <h3 className="text-base font-serif font-bold text-white">
                  {s.title}
                </h3>
                <p className="text-xs text-stone-200 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-xl bg-maroon-dark border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-antique-gold uppercase tracking-wider block">
                Direct WhatsApp Video Audition Submission
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
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-saffron">
                Frequently Asked Questions
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-maroon">
                Questions on Registration & Process
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq: any, i: number) => (
                <div
                  key={i}
                  className="p-5 rounded-xl bg-white border border-cream-dark space-y-2 shadow-xs"
                >
                  <h3 className="font-serif font-bold text-sm text-maroon flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-saffron shrink-0" />
                    <span>{faq.q}</span>
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed pl-6">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>

            <div>
              <Link href="/faq">
                <Button variant="outline" className="border-cream-dark text-maroon hover:bg-soft-cream text-xs h-10 px-5 rounded-md gap-2 font-semibold">
                  <span>View All Official FAQs</span>
                  <ArrowRight className="w-3.5 h-3.5 text-saffron" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Contact Desk Column (5 cols) */}
          <div className="lg:col-span-5">
            <div className="p-7 rounded-xl bg-white border border-cream-dark space-y-6 shadow-xs">
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-saffron">
                  Official Organizing Secretariat
                </span>
                <h3 className="text-xl font-serif font-bold text-maroon">
                  The Origin Foundation
                </h3>
                <p className="text-xs text-stone-500">
                  Janakpur Dham, Madhesh Province, Nepal
                </p>
              </div>

              <div className="space-y-3 text-xs text-stone-600">
                <div className="p-3.5 rounded-xl bg-soft-cream border border-cream-dark space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-saffron block">
                    Managing Director
                  </span>
                  <p className="font-serif font-bold text-maroon text-sm">Gaurav Gupta</p>
                  <a
                    href="tel:+9779704571941"
                    className="text-maroon hover:text-saffron font-mono text-xs flex items-center gap-1.5 pt-0.5"
                  >
                    <Phone className="w-3 h-3 text-saffron" />
                    <span>+977 9704571941</span>
                  </a>
                </div>

                <div className="p-3.5 rounded-xl bg-soft-cream border border-cream-dark space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-saffron block">
                    Managing Director
                  </span>
                  <p className="font-serif font-bold text-maroon text-sm">Dipendra Shah Kalwar</p>
                  <a
                    href="tel:+9779812005468"
                    className="text-maroon hover:text-saffron font-mono text-xs flex items-center gap-1.5 pt-0.5"
                  >
                    <Phone className="w-3 h-3 text-saffron" />
                    <span>+977 981-2005468</span>
                  </a>
                </div>

                <div className="p-3.5 rounded-xl bg-soft-cream border border-cream-dark space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-saffron block">
                    Official Email
                  </span>
                  <a
                    href="mailto:originfoundation107@gmail.com"
                    className="text-maroon hover:text-saffron font-mono font-medium text-xs flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5 text-saffron" />
                    <span>originfoundation107@gmail.com</span>
                  </a>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/contact" className="w-full block">
                  <Button className="w-full bg-maroon hover:bg-maroon-dark text-white text-xs font-semibold h-10 rounded-md border border-antique-gold/30 shadow-none">
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

import React from "react";
import Link from "next/link";
import { MapPin, Mail, Phone, Heart, Users, Target, Compass, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OriginFoundationLogo, MithilaHeritageMandala } from "@/components/brand/brand-logos";

export const metadata = {
  title: "About The Origin Foundation | Janakpur Dham, Nepal",
  description:
    "Rooted in Identity. Driven by Purpose. Discover the mission, values, and leadership of The Origin Foundation based in Janakpur Dham, Nepal.",
};

export default function AboutPage() {
  const principles = [
    {
      title: "Cultural Authenticity",
      description:
        "Honoring Mithila's artistic traditions, Maithili language, civilizational literature, and sacred folk customs with historical respect and accuracy.",
    },
    {
      title: "Confidence & Individual Talent",
      description:
        "Providing an uplifting platform where young women gain stage poise, public voice, and the self-belief to represent their communities.",
    },
    {
      title: "Inclusivity & Equal Dignity",
      description:
        "Open to all eligible girls across all communities, married and unmarried, of any age. Newcomers without stage experience are embraced with equal fairness.",
    },
    {
      title: "Administrative Integrity",
      description:
        "Transparent fee structure (NPR 399), independent banking verification, zero hidden costs, and honest, accessible communication by organizers.",
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 py-12 sm:py-20">
      {/* ==================================================================== */}
      {/* HEADER BANNER */}
      {/* ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8DFD0]/70 border border-[#B69A65]/40 text-[#172B24] text-xs font-semibold tracking-wider uppercase">
            <span>Janakpur Dham &bull; Madhesh Province &bull; Nepal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-serif text-[#172B24] tracking-tight">
            The Origin Foundation
          </h1>

          <p className="text-xl text-[#B69A65] font-serif italic">
            &ldquo;Rooted in Identity. Driven by Purpose.&rdquo;
          </p>

          <p className="text-sm sm:text-base text-[#292821] leading-relaxed max-w-2xl mx-auto pt-2">
            An independent cultural platform based in Janakpur Dham, Nepal, created to preserve regional heritage, celebrate creative talents, and foster opportunities for participation, confidence, and community representation.
          </p>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* STORY & MISSION (DUAL HERO SPREAD) */}
      {/* ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Story Card */}
          <div className="lg:col-span-7 p-8 sm:p-12 rounded-lg bg-white border border-[#E8DFD0] shadow-xs space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#B69A65]">
                Institutional Origins
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#172B24]">
                Our Background & Founding Story
              </h2>
              <p className="text-sm text-[#292821] leading-relaxed">
                The Origin Foundation was established in Janakpur Dham—the historic heart of ancient Mithila civilization. Our platform grew from a shared recognition among community organizers that while Mithila boasts world-renowned art and literature, young women across our region often lack a dedicated, prestigious platform to articulate their cultural knowledge and creative voice.
              </p>
              <p className="text-sm text-[#292821] leading-relaxed">
                We believe cultural preservation is active and forward-looking. Through our flagship initiative, <strong>Mithila Queen</strong>, we bring together tradition and contemporary aspirations—offering an inspiring stage where cultural pride translates into self-confidence, artistic expression, and community leadership.
              </p>
            </div>

            <div className="pt-4 border-t border-[#E8DFD0] text-xs text-[#292821] flex items-center justify-between">
              <span>Primary Operating Center:</span>
              <strong className="text-[#172B24]">Janakpur Dham, Nepal</strong>
            </div>
          </div>

          {/* Mission & Vision Card */}
          <div className="lg:col-span-5 p-8 sm:p-12 rounded-lg bg-[#172B24] text-[#FAF5EE] border border-[#292821] shadow-md space-y-6 flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-5 relative z-10">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#B69A65]">
                Our Purpose
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#FFFFFF]">
                Vision & Mission
              </h2>

              <div className="space-y-2">
                <p className="text-xs uppercase font-bold tracking-wider text-[#B69A65]">
                  Our Mission
                </p>
                <p className="text-xs sm:text-sm text-[#E8DFD0]/90 leading-relaxed">
                  To create credible, dignified, and inclusive platforms for cultural celebration, artistic growth, and female empowerment through well-organized competitions, talent showcases, and community programs.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#292821]">
                <p className="text-xs uppercase font-bold tracking-wider text-[#B69A65]">
                  Our Vision
                </p>
                <p className="text-xs sm:text-sm text-[#E8DFD0]/90 leading-relaxed">
                  A society where regional heritage is honored as a vital foundation for self-worth, mutual respect, and contemporary leadership across Nepal and beyond.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#292821] text-xs text-[#B69A65] flex items-center justify-between relative z-10">
              <span>Flagship Initiative:</span>
              <strong className="text-white">Mithila Queen</strong>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4 GUIDING PRINCIPLES */}
      {/* ==================================================================== */}
      <section className="bg-white py-16 sm:py-20 border-y border-[#E8DFD0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#B69A65]">
              Institutional Standards
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#172B24] font-serif">
              Our Core Principles
            </h2>
            <p className="text-xs sm:text-sm text-[#292821]">
              The bedrock values that guide our administration, communication, and event evaluation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {principles.map((item, idx) => (
              <div
                key={idx}
                className="p-7 rounded-md bg-[#FAF5EE] border border-[#E8DFD0] space-y-3"
              >
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#B69A65]">
                  Principle 0{idx + 1}
                </span>
                <h3 className="text-lg font-bold font-serif text-[#172B24]">
                  {item.title}
                </h3>
                <p className="text-xs text-[#292821] leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* EXECUTIVE LEADERSHIP DIRECTORY (EQUAL VISUAL WEIGHT) */}
      {/* ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#B69A65]">
            Executive Governance
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172B24] font-serif">
            Managing Directors
          </h2>
          <p className="text-xs sm:text-sm text-[#292821]">
            Leading The Origin Foundation with equal visual importance, shared operational accountability, and direct participant accessibility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Gaurav Gupta */}
          <div className="p-8 rounded-lg bg-white border border-[#E8DFD0] shadow-xs space-y-5 hover:border-[#B69A65] transition-colors">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#B69A65] block">
                Executive Leadership
              </span>
              <h3 className="text-2xl font-bold text-[#172B24] font-serif">
                Gaurav Gupta
              </h3>
              <p className="text-xs font-semibold text-[#292821]">
                Managing Director &bull; Operations & Administration
              </p>
            </div>

            <p className="text-xs text-[#292821] leading-relaxed">
              Overseeing platform management, participant relations, video audition intake, and day-to-day administrative execution for Mithila Queen and foundation initiatives.
            </p>

            <div className="pt-4 border-t border-[#E8DFD0] space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#292821]">
                <span>Direct Contact:</span>
                <a
                  href="tel:+9779704571941"
                  className="font-mono font-bold text-[#172B24] hover:text-[#B69A65] transition-colors"
                >
                  +977 9704571941
                </a>
              </div>
              <div className="flex items-center justify-between text-[#292821]">
                <span>WhatsApp Video Auditions:</span>
                <a
                  href="https://wa.me/9779704571941"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono font-bold text-emerald-700 hover:underline"
                >
                  Verified
                </a>
              </div>
            </div>
          </div>

          {/* Dipendra Shah Kalwar */}
          <div className="p-8 rounded-lg bg-white border border-[#E8DFD0] shadow-xs space-y-5 hover:border-[#B69A65] transition-colors">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#B69A65] block">
                Executive Leadership
              </span>
              <h3 className="text-2xl font-bold text-[#172B24] font-serif">
                Dipendra Shah Kalwar
              </h3>
              <p className="text-xs font-semibold text-[#292821]">
                Managing Director &bull; Strategic Outreach & Community Relations
              </p>
            </div>

            <p className="text-xs text-[#292821] leading-relaxed">
              Leading institutional relationships, regional community outreach across Madhesh Province, event coordination, and strategic partnerships for The Origin Foundation.
            </p>

            <div className="pt-4 border-t border-[#E8DFD0] space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#292821]">
                <span>Direct Contact:</span>
                <a
                  href="tel:+9779812005468"
                  className="font-mono font-bold text-[#172B24] hover:text-[#B69A65] transition-colors"
                >
                  +977 981-2005468
                </a>
              </div>
              <div className="flex items-center justify-between text-[#292821]">
                <span>Location:</span>
                <span className="font-semibold text-[#172B24]">Janakpur Dham, Nepal</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-md bg-white border border-[#E8DFD0] max-w-2xl mx-auto text-center text-xs text-zinc-500">
          <p>
            Per foundation policy, other organizing committee members and departmental coordinators will be published following official organizational appointment.
          </p>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* CALL TO ACTION */}
      {/* ==================================================================== */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172B24] font-serif">
          Ready to Express Your Cultural Identity?
        </h2>
        <p className="text-xs sm:text-sm text-[#292821] max-w-xl mx-auto">
          Registrations for Mithila Queen 2026 are currently open. Join us in celebrating Mithila&apos;s heritage, confidence, and creative talent.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/register">
            <Button className="bg-[#B69A65] hover:bg-[#b8986d] text-[#172B24] font-bold text-xs h-11 px-6 rounded-md shadow-xs gap-2">
              <span>Register for Mithila Queen (NPR 399)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" className="border-[#292821]/20 text-[#172B24] text-xs h-11 px-6 rounded-md font-medium">
              Contact Organizing Secretariat
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

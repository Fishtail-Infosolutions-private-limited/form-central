import React from "react";
import Link from "next/link";
import { MapPin, Mail, Phone, Heart, Users, Target, Compass, ArrowRight, ShieldCheck, Building2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OriginFoundationLogo } from "@/components/brand/brand-logos";
import { prisma } from "@/lib/db/prisma";

export const metadata = {
  title: "About The Origin Foundation | Janakpur Dham, Nepal",
  description:
    "Rooted in Identity. Driven by Purpose. Discover the mission, values, and leadership of The Origin Foundation based in Janakpur Dham, Nepal.",
};

export default async function AboutPage() {
  const setting = await prisma.siteSetting.findUnique({
    where: { id: "primary" },
  });
  const regFee = setting?.registrationFee || 399;

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
        `Transparent fee structure (NPR ${regFee}), independent banking verification, zero hidden costs, and honest, accessible communication by organizers.`,
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 py-12 sm:py-20">
      {/* Header Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F4F7FA] border border-[#DCE5ED] text-[#183153] text-xs font-semibold tracking-wider uppercase shadow-xs">
            <span>Janakpur Dham &bull; Madhesh Province &bull; Nepal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-[#263238] tracking-tight">
            The Origin Foundation
          </h1>

          <p className="text-xl text-[#356FA8] font-serif italic">
            &ldquo;Rooted in Identity. Driven by Purpose.&rdquo;
          </p>

          <p className="text-sm sm:text-base text-[#546E7A] leading-relaxed max-w-2xl mx-auto pt-2">
            An independent cultural platform based in Janakpur Dham, Nepal, created to preserve regional heritage, celebrate creative talents, and foster opportunities for participation, confidence, and community representation.
          </p>
        </div>
      </section>

      {/* Story & Mission (Dual Spread) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Story Card */}
          <div className="lg:col-span-7 p-8 sm:p-12 rounded-2xl bg-white border border-[#DCE5ED] shadow-xs space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#356FA8]">
                Institutional Origins
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#263238]">
                Our Background & Founding Story
              </h2>
              <p className="text-sm text-[#546E7A] leading-relaxed">
                The Origin Foundation was established in Janakpur Dham—the historic heart of ancient Mithila civilization. Our platform grew from a shared recognition among community organizers that while Mithila boasts world-renowned art and literature, young women across our region often lack a dedicated, prestigious platform to articulate their cultural knowledge and creative voice.
              </p>
              <p className="text-sm text-[#546E7A] leading-relaxed">
                We believe cultural preservation is active and forward-looking. Through our flagship initiative, <strong>Mithila Queen</strong>, we bring together tradition and contemporary aspirations—offering an inspiring stage where cultural pride translates into self-confidence, artistic expression, and community leadership.
              </p>
            </div>

            <div className="pt-4 border-t border-[#DCE5ED] text-xs text-[#546E7A] flex items-center justify-between">
              <span>Primary Operating Center:</span>
              <strong className="text-[#183153]">Janakpur Dham, Nepal</strong>
            </div>
          </div>

          {/* Mission & Vision Card */}
          <div className="lg:col-span-5 p-8 sm:p-12 rounded-2xl bg-[#183153] text-white shadow-xs space-y-6 flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-5 relative z-10">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#356FA8]">
                Our Purpose
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Vision & Mission
              </h2>

              <div className="space-y-2">
                <p className="text-xs uppercase font-bold tracking-wider text-[#356FA8]">
                  Our Mission
                </p>
                <p className="text-xs sm:text-sm text-[#DCE5ED] leading-relaxed">
                  To create credible, dignified, and inclusive platforms for cultural celebration, artistic growth, and female empowerment through well-organized competitions, talent showcases, and community programs.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/20">
                <p className="text-xs uppercase font-bold tracking-wider text-[#356FA8]">
                  Our Vision
                </p>
                <p className="text-xs sm:text-sm text-[#DCE5ED] leading-relaxed">
                  A society where regional heritage is honored as a vital foundation for self-worth, mutual respect, and contemporary leadership across Nepal and beyond.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/20 text-xs text-[#DCE5ED] flex items-center justify-between relative z-10">
              <span>Flagship Initiative:</span>
              <strong className="text-white">Mithila Queen</strong>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Guiding Principles */}
      <section className="bg-white py-16 sm:py-20 border-y border-[#DCE5ED]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#356FA8]">
              Institutional Standards
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-[#263238]">
              Our Core Principles
            </h2>
            <p className="text-xs sm:text-sm text-[#546E7A]">
              The bedrock values that guide our administration, communication, and event evaluation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {principles.map((item, idx) => (
              <div
                key={idx}
                className="p-7 rounded-xl bg-[#F4F7FA] border border-[#DCE5ED] space-y-3 hover:border-[#356FA8] transition-colors"
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#356FA8]">
                  Principle 0{idx + 1}
                </span>
                <h3 className="text-lg font-bold text-[#263238]">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#546E7A] leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Executive Leadership Directory */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#356FA8]">
            Executive Governance
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#263238]">
            Managing Directors
          </h2>
          <p className="text-xs sm:text-sm text-[#546E7A]">
            Leading The Origin Foundation with shared operational accountability, transparency, and direct participant accessibility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Gaurav Gupta */}
          <div className="p-8 rounded-2xl bg-white border border-[#DCE5ED] shadow-xs space-y-5 hover:border-[#356FA8] transition-colors">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#356FA8] block">
                Executive Leadership
              </span>
              <h3 className="text-2xl font-bold text-[#183153]">
                Gaurav Gupta
              </h3>
              <p className="text-xs font-semibold text-[#546E7A]">
                Managing Director &bull; Operations & Administration
              </p>
            </div>

            <p className="text-xs text-[#546E7A] leading-relaxed">
              Overseeing platform management, participant relations, video audition intake, and day-to-day administrative execution for Mithila Queen and foundation initiatives.
            </p>

            <div className="pt-4 border-t border-[#DCE5ED] space-y-2 text-xs">
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
                <span>WhatsApp Video Auditions:</span>
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
          <div className="p-8 rounded-2xl bg-white border border-[#DCE5ED] shadow-xs space-y-5 hover:border-[#356FA8] transition-colors">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#356FA8] block">
                Executive Leadership
              </span>
              <h3 className="text-2xl font-bold text-[#183153]">
                Dipendra Shah Kalwar
              </h3>
              <p className="text-xs font-semibold text-[#546E7A]">
                Managing Director &bull; Strategic Outreach & Community Relations
              </p>
            </div>

            <p className="text-xs text-[#546E7A] leading-relaxed">
              Leading institutional relationships, regional community outreach across Madhesh Province, event coordination, and strategic partnerships for The Origin Foundation.
            </p>

            <div className="pt-4 border-t border-[#DCE5ED] space-y-2 text-xs">
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

      {/* Call to Action */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="p-8 sm:p-12 rounded-2xl bg-[#183153] text-white space-y-5 shadow-xs">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Ready to Express Your Cultural Identity?
          </h2>
          <p className="text-xs sm:text-sm text-[#DCE5ED] max-w-xl mx-auto">
            Registrations for Mithila Queen 2026 are currently open. Join us in celebrating Mithila&apos;s heritage, confidence, and creative talent.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
            <Link href="/register" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-white text-[#183153] hover:bg-[#F4F7FA] font-bold text-sm h-12 px-7 rounded-xl shadow-md gap-2.5 transition-all">
                <span>Register for Mithila Queen (NPR {regFee})</span>
                <ArrowRight className="w-4 h-4 text-[#356FA8]" />
              </Button>
            </Link>
            <Link href="/registration-status" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto border-white/60 bg-white/10 hover:bg-white/20 text-white font-bold text-sm h-12 px-6 rounded-xl gap-2 transition-all"
              >
                <span>Check Application Status</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

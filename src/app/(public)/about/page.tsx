import React from "react";
import Link from "next/link";
import { Crown, Sparkles, MapPin, Mail, Phone, Heart, Users, Target, Compass, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MithilaMotif, MithilaCornerMotif } from "@/components/ui/mithila-motif";

export const metadata = {
  title: "About The Origin Foundation | Janakpur Dham, Nepal",
  description:
    "Rooted in Identity. Driven by Purpose. Learn about The Origin Foundation, its mission, core values, and cultural commitment in Janakpur Dham, Nepal.",
};

export default function AboutPage() {
  const values = [
    {
      title: "Cultural Authenticity",
      desc: "Celebrating Mithila's artistic, linguistic, and historical identity with respect and accuracy.",
    },
    {
      title: "Empowerment & Confidence",
      desc: "Providing a dignified stage for women and girls to develop self-confidence and showcase talent.",
    },
    {
      title: "Inclusivity & Dignity",
      desc: "Open to eligible participants across all communities, married and unmarried, with equal opportunity.",
    },
    {
      title: "Institutional Integrity",
      desc: "Transparent rules, fair evaluation, independent payment audits, and responsible community leadership.",
    },
  ];

  return (
    <div className="py-12 sm:py-20 space-y-16">
      {/* HEADER BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9E2D5]/60 border border-[#C5A880]/40 text-[#0A192F] text-xs font-semibold">
            <Crown className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Janakpur Dham, Nepal</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-serif text-[#0A192F] tracking-tight">
            The Origin Foundation
          </h1>
          <p className="text-lg sm:text-xl text-[#C5A880] font-serif italic">
            Rooted in Identity. Driven by Purpose.
          </p>
          <p className="text-sm text-[#243B53] leading-relaxed max-w-2xl mx-auto">
            A cultural platform established in Janakpur Dham, Nepal, with a clear purpose: honoring cultural roots while opening pathways for talent, confidence, and community representation.
          </p>
        </div>
      </section>

      {/* STORY & VISION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#E9E2D5] shadow-xs space-y-5 relative flex flex-col justify-between">
            <MithilaCornerMotif className="w-10 h-10 text-[#C5A880] absolute top-4 right-4" />
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-[#0A192F] text-[#C5A880] flex items-center justify-center">
                <Compass className="w-5 h-5 stroke-[1.8]" />
              </div>
              <h2 className="text-2xl font-bold font-serif text-[#0A192F]">
                Our Story & Purpose
              </h2>
              <p className="text-sm text-[#243B53] leading-relaxed">
                The Origin Foundation is being developed as an initiative based in Janakpur Dham—the historic heart of Mithila civilization. Our foundation emerges from a shared recognition that our regional heritage, art, and values deserve prominent, dignified, and contemporary platforms.
              </p>
              <p className="text-sm text-[#243B53] leading-relaxed">
                We believe cultural preservation is not about looking backward; it is about providing young women with the confidence, public voice, and artistic expression to carry Mithila&apos;s pride forward into the modern world.
              </p>
            </div>
            <div className="pt-4 border-t border-[#E9E2D5] text-xs text-[#243B53] flex items-center justify-between">
              <span>Operating Base:</span>
              <strong className="text-[#0A192F]">Janakpur Dham, Madhesh Province, Nepal</strong>
            </div>
          </div>

          <div className="p-8 sm:p-10 rounded-3xl bg-[#0A192F] text-[#FDFBF7] border border-[#243B53] shadow-xs space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-[#243B53] text-[#C5A880] flex items-center justify-center">
                <Target className="w-5 h-5 stroke-[1.8]" />
              </div>
              <h2 className="text-2xl font-bold font-serif text-[#FFFFFF]">
                Our Mission & Vision
              </h2>
              <p className="text-sm text-[#E9E2D5]/85 leading-relaxed">
                <strong>Mission:</strong> To create authentic opportunities for cultural representation, youth empowerment, and artistic excellence through transparent competitions, workshops, and community showcases.
              </p>
              <p className="text-sm text-[#E9E2D5]/85 leading-relaxed">
                <strong>Vision:</strong> A society where cultural roots are celebrated as sources of strength, confidence, and leadership, enabling women of all backgrounds to stand tall on regional and national stages.
              </p>
            </div>
            <div className="pt-4 border-t border-[#243B53] text-xs text-[#C5A880] flex items-center justify-between">
              <span>Flagship Platform:</span>
              <strong className="text-[#FFFFFF]">Mithila Queen</strong>
            </div>
          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="bg-white py-16 sm:py-20 border-y border-[#E9E2D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C5A880]">
              Guiding Principles
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A192F] font-serif">
              Our Core Values
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div key={i} className="p-6 rounded-2xl bg-[#FDFBF7] border border-[#E9E2D5] space-y-3">
                <div className="w-8 h-8 rounded-lg bg-[#0A192F] text-[#C5A880] flex items-center justify-center font-bold text-xs">
                  0{i + 1}
                </div>
                <h3 className="text-base font-bold text-[#0A192F] font-serif">
                  {v.title}
                </h3>
                <p className="text-xs text-[#243B53] leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LEADERSHIP SECTION (EQUAL VISUAL IMPORTANCE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C5A880]">
            Executive Governance
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A192F] font-serif">
            Managing Directors
          </h2>
          <p className="text-xs sm:text-sm text-[#243B53]">
            Leading The Origin Foundation with shared responsibility, cultural pride, and administrative transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Gaurav Gupta */}
          <div className="p-8 rounded-3xl bg-white border border-[#E9E2D5] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#0A192F] font-serif">
                  Gaurav Gupta
                </h3>
                <p className="text-xs font-medium text-[#C5A880]">
                  Managing Director
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#0A192F] text-[#C5A880] flex items-center justify-center font-bold text-sm">
                GG
              </div>
            </div>
            <p className="text-xs text-[#243B53] leading-relaxed">
              Managing Director coordinating operational planning, participant relations, and competition management for Mithila Queen.
            </p>
            <div className="pt-3 border-t border-[#E9E2D5] space-y-1 text-xs">
              <a
                href="tel:+9779704571941"
                className="text-[#0A192F] hover:text-[#C5A880] font-semibold flex items-center gap-2 font-mono"
              >
                <Phone className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>+977 9704571941</span>
              </a>
            </div>
          </div>

          {/* Dipendra Shah Kalwar */}
          <div className="p-8 rounded-3xl bg-white border border-[#E9E2D5] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#0A192F] font-serif">
                  Dipendra Shah Kalwar
                </h3>
                <p className="text-xs font-medium text-[#C5A880]">
                  Managing Director
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#0A192F] text-[#C5A880] flex items-center justify-center font-bold text-sm">
                DS
              </div>
            </div>
            <p className="text-xs text-[#243B53] leading-relaxed">
              Managing Director leading strategic outreach, institutional partnerships, and regional engagement across Janakpur Dham and Madhesh Province.
            </p>
            <div className="pt-3 border-t border-[#E9E2D5] space-y-1 text-xs">
              <a
                href="tel:+9779812005468"
                className="text-[#0A192F] hover:text-[#C5A880] font-semibold flex items-center gap-2 font-mono"
              >
                <Phone className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>+977 981-2005468</span>
              </a>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-zinc-500 max-w-md mx-auto">
          Additional organizing team members and coordinators will be published following official organizational approval.
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <MithilaMotif className="w-full h-3 text-[#C5A880]/40 mx-auto" />
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A192F] font-serif">
          Join Us in Celebrating Mithila
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/register">
            <Button className="bg-[#C5A880] hover:bg-[#b8986d] text-[#0A192F] font-bold text-xs h-11 px-6 rounded-xl shadow-xs">
              Register for Mithila Queen (NPR 399)
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" className="border-[#243B53]/20 text-[#0A192F] text-xs h-11 px-6 rounded-xl font-medium">
              Get in Touch with Organizers
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}


import React from "react";
import Link from "next/link";
import { Crown, Sparkles, Palette, BookOpen, Sun, Heart, Flame, Music, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MithilaMotif, MithilaCornerMotif } from "@/components/ui/mithila-motif";

export const metadata = {
  title: "Culture & Heritage of Mithila | The Origin Foundation",
  description:
    "Explore the deep artistic heritage, folklore, traditions, and female creativity of Mithila civilization in Janakpur Dham, Nepal.",
};

export default function CulturePage() {
  const culturalThemes = [
    {
      icon: Palette,
      title: "Mithila Painting & Folk Art",
      desc: "Characterized by intricate geometric line work, natural pigments, and narrative folklore depicting sacred harmony, nature, and community milestones.",
    },
    {
      icon: Heart,
      title: "Women as Culture Bearers",
      desc: "For centuries, Mithila's artistic legacy was preserved and evolved directly by women—passed down from mothers to daughters on home walls (Kohbar) and courtyards.",
    },
    {
      icon: Sun,
      title: "Sacred Festivals & Devotion",
      desc: "The spiritual purity of Chhath Puja, the majesty of Vivah Panchami, and sacred community rituals rooted in Janakpur Dham's sacred landscape.",
    },
    {
      icon: BookOpen,
      title: "Language & Literature",
      desc: "The melodious Maithili language, the immortal poetry of Mahakavi Vidyapati, and centuries of oral storytelling celebrating love, duty, and nature.",
    },
    {
      icon: Music,
      title: "Folk Music & Celebratory Dance",
      desc: "Traditional Sohar, Samdaun, and Jhijhiya dances expressing devotion, communal bonding, and seasonal rhythms across the Terai.",
    },
    {
      icon: Flame,
      title: "Contemporary Creative Expression",
      desc: "Bridging time-honored roots with modern education, entrepreneurship, and artistic innovation among the new generation of Mithila youth.",
    },
  ];

  return (
    <div className="py-12 sm:py-20 space-y-16">
      {/* HEADER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9E2D5]/60 border border-[#C5A880]/40 text-[#0A192F] text-xs font-semibold">
            <Crown className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Mithila Civilization • Janakpur Dham</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-serif text-[#0A192F] tracking-tight">
            Culture & Heritage
          </h1>
          <p className="text-lg sm:text-xl text-[#C5A880] font-serif italic">
            Centuries of Artistic Wisdom, Female Leadership & Living Tradition
          </p>
          <p className="text-sm text-[#243B53] leading-relaxed max-w-2xl mx-auto">
            Mithila Queen is grounded in the conviction that true elegance comes from deep cultural knowledge, genuine confidence, and creative pride in one&apos;s heritage.
          </p>
        </div>
      </section>

      {/* CORE THEMES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {culturalThemes.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="p-8 rounded-3xl bg-white border border-[#E9E2D5] shadow-xs space-y-4 relative flex flex-col justify-between"
              >
                <MithilaCornerMotif className="w-8 h-8 text-[#C5A880]/60 absolute top-4 right-4" />
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-xl bg-[#0A192F] text-[#C5A880] flex items-center justify-center">
                    <Icon className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <h3 className="text-lg font-bold font-serif text-[#0A192F]">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#243B53] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="pt-3 border-t border-[#E9E2D5] text-[11px] text-[#C5A880] font-semibold">
                  Mithila Queen Heritage Pillar
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FEATURE SECTION */}
      <section className="bg-[#0A192F] text-[#FDFBF7] py-16 sm:py-20 border-y border-[#243B53]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <MithilaMotif className="w-full h-4 text-[#C5A880]/30 mx-auto" />
          <h2 className="text-2xl sm:text-4xl font-extrabold font-serif text-[#FFFFFF]">
            Heritage in Every Step
          </h2>
          <p className="text-xs sm:text-sm text-[#E9E2D5]/80 leading-relaxed max-w-2xl mx-auto">
            In Mithila Queen, participants are not evaluated on superficial attributes, but on how articulately they express their thoughts, how authentically they honor their community, and how boldly they pursue their dreams.
          </p>
          <div className="pt-2">
            <Link href="/register">
              <Button className="bg-[#C5A880] hover:bg-[#b8986d] text-[#0A192F] font-bold text-xs h-11 px-7 rounded-xl shadow-xs gap-2">
                <span>Represent Your Heritage • Register (NPR 399)</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}


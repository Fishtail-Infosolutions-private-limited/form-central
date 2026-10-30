import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, BookOpen, Heart, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MithilaHeritageMandala } from "@/components/brand/brand-logos";
import { prisma } from "@/lib/db/prisma";

export const metadata = {
  title: "Culture & Heritage of Mithila | The Origin Foundation",
  description:
    "Explore the deep artistic heritage, folklore, traditions, and female creativity of Mithila civilization in Janakpur Dham, Nepal.",
};

export default async function CulturePage() {
  const setting = await prisma.siteSetting.findUnique({
    where: { id: "primary" },
  });
  const regFee = setting?.registrationFee || 399;

  const culturalThemes = [
    {
      title: "Mithila Painting & Folk Art",
      subtitle: "Bhitti Chitra, Kohbar & Aripan",
      desc: "Characterized by intricate geometric line work, natural earth pigments, and narrative folklore depicting sacred harmony, nature, and community milestones.",
    },
    {
      title: "Women as Living Custodians",
      subtitle: "Mothers to Daughters Tradition",
      desc: "For centuries, Mithila's artistic legacy was preserved and evolved directly by women—passed down across generations on home walls and courtyards.",
    },
    {
      title: "Sacred Festivals & Devotion",
      subtitle: "Chhath, Vivah Panchami & Sama Chakeva",
      desc: "The spiritual purity of Chhath Puja, the majesty of Vivah Panchami, and sacred community rituals rooted in Janakpur Dham's sacred landscape.",
    },
    {
      title: "Maithili Language & Literature",
      subtitle: "The Legacy of Mahakavi Vidyapati",
      desc: "The melodious Maithili language, the immortal poetry of Mahakavi Vidyapati, and centuries of oral storytelling celebrating love, duty, and nature.",
    },
    {
      title: "Folk Music & Communal Dance",
      subtitle: "Sohar, Samdaun & Jhijhiya",
      desc: "Traditional Sohar and Jhijhiya dances expressing devotion, seasonal rhythms, and communal bonding across the Terai and Madhesh Province.",
    },
    {
      title: "Contemporary Creative Expression",
      subtitle: "Heritage Meets Modern Aspiration",
      desc: "Bridging time-honored roots with modern education, public voice, and artistic innovation among the new generation of Mithila youth.",
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-20 py-12 sm:py-16">
      {/* HEADER BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F4F7FA] border border-[#DCE5ED] text-[#183153] text-xs font-semibold uppercase tracking-wider shadow-xs">
            <Landmark className="w-3.5 h-3.5 text-[#356FA8]" />
            <span>Janakpur Dham &bull; Cultural Capital of Mithila</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-[#183153] tracking-tight">
            Culture & Heritage
          </h1>

          <p className="text-lg sm:text-xl text-[#356FA8] font-medium">
            Centuries of Artistic Wisdom, Female Leadership & Living Tradition
          </p>

          <p className="text-sm sm:text-base text-[#546E7A] leading-relaxed max-w-2xl mx-auto">
            Mithila Queen is grounded in the conviction that true elegance comes from deep cultural knowledge, genuine confidence, and creative pride in one&apos;s heritage—never merely appearance.
          </p>
        </div>
      </section>

      {/* ARTISTIC HERITAGE SPREAD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-2xl bg-white border border-[#DCE5ED] shadow-xs relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#356FA8]">
                Civilizational Grounding
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#183153]">
                Mithila Art as an Act of Storytelling & Dignity
              </h2>
              <p className="text-sm text-[#546E7A] leading-relaxed">
                Mithila painting is not an ornamental luxury; it is an intimate language of prayer, memory, and celebration. In the courtyards of Janakpur, women have painted walls and floors using natural bamboo twigs, rice paste, and mineral pigments—depicting the cosmic harmony between the Sun (<em>Surya</em>), the sacred Lotus (<em>Kamal</em>), and auspicious life (<em>Matsya</em>).
              </p>
              <p className="text-sm text-[#546E7A] leading-relaxed">
                At Mithila Queen, participants are invited to connect with this lineage of creative power. Understanding these motifs, and articulating what they mean for contemporary women, forms the core of our evaluation.
              </p>
            </div>

            <div className="lg:col-span-4 flex items-center justify-center p-4">
              <MithilaHeritageMandala className="w-56 h-56 sm:w-64 sm:h-64" accent="#356FA8" />
            </div>
          </div>
        </div>
      </section>

      {/* 6 CULTURAL THEMES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#356FA8]">
            Six Pillars of Heritage
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#183153]">
            Living Traditions Celebrated in Mithila Queen
          </h2>
          <p className="text-sm text-[#546E7A]">
            How regional culture informs each stage of the competition.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {culturalThemes.map((item, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white border border-[#DCE5ED] shadow-xs space-y-3 hover:border-[#356FA8] transition-colors flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#356FA8] bg-[#F4F7FA] px-2 py-0.5 rounded border border-[#DCE5ED]">
                  Heritage Pillar 0{i + 1}
                </span>
                <h3 className="text-base font-bold text-[#183153]">
                  {item.title}
                </h3>
                <p className="text-xs font-semibold text-[#263238]">
                  {item.subtitle}
                </p>
                <p className="text-xs text-[#546E7A] leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <div className="pt-3 border-t border-[#DCE5ED] text-[11px] text-[#546E7A] font-medium">
                Mithila Queen Evaluation Focus
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="bg-[#183153] text-white py-14 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-bold text-white">
            Heritage in Every Step
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto">
            In Mithila Queen, participants are not evaluated on superficial attributes, but on how articulately they express their thoughts, how authentically they honor their community, and how boldly they pursue their dreams.
          </p>
          <div className="pt-2">
            <Link href="/register">
              <Button className="bg-[#356FA8] hover:bg-[#2c5c8c] text-white font-semibold text-xs h-11 px-7 rounded-xl shadow-xs gap-2">
                <span>Represent Your Heritage &bull; Register (NPR {regFee})</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

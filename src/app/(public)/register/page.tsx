import React from "react";
import { Crown, Sparkles, MapPin, Calendar, ShieldCheck } from "lucide-react";
import { MithilaQueenWizard } from "@/components/registration/mithila-queen-wizard";
import { MithilaMotif } from "@/components/ui/mithila-motif";

export const metadata = {
  title: "Mithila Queen Registration | The Origin Foundation",
  description:
    "Official registration portal for Mithila Queen in Janakpur Dham, Nepal. Fee: NPR 399. Open to all girls, married or unmarried, with zero prior experience required.",
};

export default function RegisterPage() {
  return (
    <div className="py-12 sm:py-20 space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-2xl mx-auto text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E9E2D5]/60 border border-[#C5A880]/40 text-[#0A192F] text-xs font-semibold">
          <Crown className="w-3.5 h-3.5 text-[#C5A880]" />
          <span>The Origin Foundation • Janakpur Dham</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black font-serif text-[#0A192F] tracking-tight">
          Mithila Queen Registration
        </h1>
        <p className="text-xs sm:text-sm text-[#243B53] leading-relaxed max-w-xl mx-auto">
          Celebrating Mithila&apos;s Culture, Confidence & Talent. Fill in the seven steps below to register your participation.
        </p>
      </div>

      {/* The 7-Step Wizard */}
      <MithilaQueenWizard />
    </div>
  );
}


import React from "react";
import { Crown, Sparkles, MapPin, Calendar, ShieldCheck } from "lucide-react";
import { MithilaQueenWizard } from "@/components/registration/mithila-queen-wizard";
import { MithilaHeritageMandala } from "@/components/brand/brand-logos";

export const metadata = {
  title: "Mithila Queen Registration | The Origin Foundation",
  description:
    "Official registration portal for Mithila Queen in Janakpur Dham, Nepal. Fee: NPR 399. Open to all girls, married or unmarried, with zero prior experience required.",
};

export default function RegisterPage() {
  return (
    <div className="py-10 sm:py-16 space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Editorial Header */}
      <div className="max-w-2xl mx-auto text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFFFFF] border border-[#E8DFD0] text-[#292821] text-xs font-semibold">
          <MithilaHeritageMandala className="w-3.5 h-3.5 text-[#B69A65]" />
          <span>The Origin Foundation &bull; Janakpur Dham</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#292821] tracking-tight">
          Mithila Queen Registration
        </h1>
        <p className="text-xs sm:text-sm text-[#292821]/75 leading-relaxed max-w-xl mx-auto">
          Celebrating Mithila&apos;s Culture, Confidence & Talent. Complete the structured 7-step application below to register your candidacy.
        </p>
      </div>

      {/* The 7-Step Wizard */}
      <MithilaQueenWizard />
    </div>
  );
}

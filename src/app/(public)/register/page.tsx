import React from "react";
import { MithilaQueenWizard } from "@/components/registration/mithila-queen-wizard";
import { MithilaHeritageMandala } from "@/components/brand/brand-logos";

export const metadata = {
  title: "Mithila Queen Registration | The Origin Foundation",
  description:
    "Official registration portal for Mithila Queen in Janakpur Dham, Nepal. Open to all girls, married or unmarried, with zero prior experience required.",
};

export default function RegisterPage() {
  return (
    <div className="py-10 sm:py-16 space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Editorial Header */}
      <div className="max-w-2xl mx-auto text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-soft-cream border border-cream-dark text-maroon text-xs font-semibold shadow-xs">
          <MithilaHeritageMandala className="w-3.5 h-3.5 text-saffron" />
          <span>The Origin Foundation &bull; Janakpur Dham</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-maroon tracking-tight">
          Mithila Queen Registration
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-xl mx-auto">
          Celebrating Mithila&apos;s Culture, Confidence & Talent. Complete the structured 7-step application below to register your candidacy.
        </p>
      </div>

      {/* The 7-Step Wizard */}
      <MithilaQueenWizard />
    </div>
  );
}

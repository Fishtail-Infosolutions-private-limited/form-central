import React from "react";
import Link from "next/link";
import { CheckCircle2, Crown, ShieldAlert, ArrowRight, Video, Calendar, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Official Competition Rules & Eligibility | Mithila Queen",
  description:
    "Official eligibility criteria, participation rules, video submission guidelines, and code of conduct for Mithila Queen.",
};

export default function RulesPage() {
  return (
    <div className="py-12 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#C5A880]">
          The Origin Foundation Official Standards
        </span>
        <h1 className="text-3xl sm:text-5xl font-black font-serif text-[#0A192F] tracking-tight">
          Competition Rules & Eligibility
        </h1>
        <p className="text-xs text-[#243B53]">
          Mithila Queen • Janakpur Dham, Nepal
        </p>
      </div>

      <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#E9E2D5] shadow-xs space-y-8 text-xs sm:text-sm text-[#243B53] leading-relaxed">
        <section className="space-y-4">
          <h2 className="text-lg font-bold font-serif text-[#0A192F] border-b border-[#E9E2D5] pb-2">
            1. Core Eligibility Rules
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#C5A880] shrink-0 mt-0.5" />
              <div>
                <strong>Gender:</strong> Girls only. Any girl belonging to or identifying with the cultural heritage of Mithila is eligible to apply.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#C5A880] shrink-0 mt-0.5" />
              <div>
                <strong>Age:</strong> There is no minimum age requirement. For participants below 18 years of age, a parent or legal guardian must provide verified consent during the registration process.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#C5A880] shrink-0 mt-0.5" />
              <div>
                <strong>Marital Status:</strong> Both unmarried and married girls are warmly eligible to participate without discrimination.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#C5A880] shrink-0 mt-0.5" />
              <div>
                <strong>Prior Experience:</strong> No previous stage, modeling, or competition experience is required. First-time participants are evaluated on an equal footing with past competitors.
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold font-serif text-[#0A192F] border-b border-[#E9E2D5] pb-2">
            2. Video Audition Requirements
          </h2>
          <p>
            Following online registration, each applicant is requested to prepare a brief introduction video showcasing personal talent, thoughts on Mithila heritage, and motivation.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Post the video on your personal TikTok or Instagram account.</li>
            <li>Tag the official organizing account and include official hashtags once published.</li>
            <li>Send the same video via WhatsApp to Managing Director Gaurav Gupta at <strong>+977 9704571941</strong>.</li>
            <li>Ensure the video maintains cultural dignity and respectful presentation.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold font-serif text-[#0A192F] border-b border-[#E9E2D5] pb-2">
            3. Registration Fee & Payment
          </h2>
          <p>
            The registration fee is fixed at <strong>NPR 399</strong>. Payment must be made using the official QR code displayed on the registration portal. Applicants must provide a legitimate bank transaction reference and clear screenshot. Any falsification of payment references results in permanent disqualification.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold font-serif text-[#0A192F] border-b border-[#E9E2D5] pb-2">
            4. Event Schedule & Venue
          </h2>
          <p>
            The official competition schedule, stage rounds, and venue are currently <strong>To Be Announced</strong>. All confirmed dates will be published through this official website and dispatched to approved participants via verified email and WhatsApp notices.
          </p>
        </section>

        <div className="pt-4 flex justify-center">
          <Link href="/register">
            <Button className="bg-[#C5A880] hover:bg-[#b8986d] text-[#0A192F] font-bold text-xs h-11 px-7 rounded-xl shadow-xs gap-2">
              <span>Accept Rules & Register (NPR 399)</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}


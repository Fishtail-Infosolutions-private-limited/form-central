import React from "react";
import { prisma } from "@/lib/db/prisma";

export const metadata = {
  title: "Terms and Conditions | The Origin Foundation",
  description:
    "Official terms and conditions governing website use, application submission, and participation in Mithila Queen.",
};

export default async function TermsPage() {
  const setting = await prisma.siteSetting.findUnique({
    where: { id: "primary" },
  });
  const regFee = setting?.registrationFee || 399;

  return (
    <div className="py-12 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#C5A880]">
          Legal Framework
        </span>
        <h1 className="text-3xl sm:text-5xl font-black font-serif text-[#0A192F] tracking-tight">
          Terms & Conditions
        </h1>
        <p className="text-xs text-slate-500">
          The Origin Foundation • Janakpur Dham, Nepal
        </p>
      </div>

      <div className="p-8 sm:p-12 rounded-lg bg-white border border-slate-200 shadow-xs space-y-8 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold font-serif text-[#0A192F]">1. Platform Use</h2>
          <p>
            By accessing this website and utilizing the Mithila Queen registration portal, you agree to comply with these terms, our Privacy Policy, and the published Competition Rules.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold font-serif text-[#0A192F]">2. Application Authenticity</h2>
          <p>
            Applicants represent and warrant that all personal, contact, and background details supplied during registration are accurate, truthful, and belong legally to the applicant. Supplying intentionally fabricated identity information or fraudulent payment references will result in immediate cancellation of the application without notice.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold font-serif text-[#0A192F]">3. Registration Fee & Payment Policy</h2>
          <p>
            The official entry fee for Mithila Queen is NPR {regFee} per registration. Submitting a transaction reference and receipt screenshot constitutes a submission for independent verification, but does not guarantee automatic approval. Approval requires both verified financial settlement and administrative application review.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold font-serif text-[#0A192F]">4. Official Disclaimers</h2>
          <p>
            The issuance of an official Registration Confirmation PDF confirms that the participant has satisfied the preliminary application criteria and payment requirements. It does not constitute an award of victory, title, certificate of winning, or guarantee of advancement to final rounds.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold font-serif text-[#0A192F]">5. Governing Jurisdiction</h2>
          <p>
            These terms are governed by the applicable laws of Nepal. Any disputes arising in connection with the competition shall be handled under the jurisdiction of the relevant courts in Janakpur Dham, Nepal.
          </p>
        </section>
      </div>
    </div>
  );
}

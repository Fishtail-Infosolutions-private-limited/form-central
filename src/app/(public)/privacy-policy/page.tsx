import React from "react";
import { ShieldCheck, Lock, Eye, FileText, UserCheck } from "lucide-react";
import { MithilaMotif } from "@/components/ui/mithila-motif";

export const metadata = {
  title: "Privacy Policy & Minor Safeguarding | The Origin Foundation",
  description:
    "Official privacy policy, data protection standards, and minor safeguarding protocols for The Origin Foundation and Mithila Queen.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="py-12 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#C5A880]">
          Data Protection & Safeguarding
        </span>
        <h1 className="text-3xl sm:text-5xl font-black font-serif text-[#0A192F] tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs text-[#243B53]">
          The Origin Foundation • Janakpur Dham, Nepal • Last updated: October 2026
        </p>
      </div>

      <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#E9E2D5] shadow-xs space-y-8 text-xs sm:text-sm text-[#243B53] leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold font-serif text-[#0A192F] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#C5A880]" />
            <span>1. Commitment to Privacy</span>
          </h2>
          <p>
            The Origin Foundation (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;the Foundation&rdquo;) is committed to handling the personal information of all competition applicants, guardians, and visitors with high standards of integrity, respect, and technical security.
          </p>
          <p>
            This Privacy Policy explains what personal data is collected through the Mithila Queen registration process, how it is verified, how it is safeguarded, and how consent is managed.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold font-serif text-[#0A192F] flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#C5A880]" />
            <span>2. Minor Safeguarding Protocol</span>
          </h2>
          <p>
            Because Mithila Queen has no minimum age limit, girls under the age of 18 (&ldquo;minors&rdquo;) are eligible to participate. To protect the rights, welfare, and privacy of minor participants, our system applies strict safeguarding protocols:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Mandatory Date of Birth:</strong> The system automatically calculates applicant age based on date of birth.</li>
            <li><strong>Legal Guardian Consent:</strong> For applicants below 18, the registration form requires legal guardian contact details (Full Name, Relationship, Phone Number, Email) and formal guardian consent.</li>
            <li><strong>Restricted Document Access:</strong> Identification documents and personal contact information of minors are strictly restricted to authorized Managing Directors and are never made public.</li>
            <li><strong>Media Safeguards:</strong> Guardian consent is specifically obtained for any video or photographic material used for broadcast, stage judging, or official cultural promotion.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold font-serif text-[#0A192F] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#C5A880]" />
            <span>3. Information We Collect</span>
          </h2>
          <p>We collect only the personal information strictly necessary for competition administration:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Identification & Contact:</strong> Full legal name, date of birth, email address, mobile phone number, province, district, municipality, and residential address.</li>
            <li><strong>Participant Profile:</strong> Introduction, hobbies, talents, spoken languages, and cultural interests.</li>
            <li><strong>Social Media Links:</strong> At least one public username/URL (Instagram, TikTok, or Facebook) for video audition verification. We never request passwords or account credentials.</li>
            <li><strong>Payment Verification:</strong> Transaction reference number and payment screenshot for bank reconciliation of the NPR 399 registration fee.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold font-serif text-[#0A192F] flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#C5A880]" />
            <span>4. Security & Document Access</span>
          </h2>
          <p>
            Uploaded payment receipts, photos, and identity documents are stored in secure cloud infrastructure with access controls. Documents are never indexed by public search engines or exposed via predictable URLs. Access is granted solely to the executive managing directors for independent verification.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold font-serif text-[#0A192F] flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#C5A880]" />
            <span>5. Contact for Privacy Inquiries</span>
          </h2>
          <p>
            If you have questions about your personal data, guardian records, or desire to update or withdraw an application, please contact:
          </p>
          <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#E9E2D5] space-y-1 text-xs">
            <p><strong>The Origin Foundation — Privacy Officer</strong></p>
            <p>Email: <a href="mailto:originfoundation107@gmail.com" className="text-[#0A192F] font-semibold underline">originfoundation107@gmail.com</a></p>
            <p>Janakpur Dham, Madhesh Province, Nepal</p>
          </div>
        </section>
      </div>
    </div>
  );
}


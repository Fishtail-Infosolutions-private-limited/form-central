import React from "react";
import Link from "next/link";
import { HelpCircle, Crown, ArrowRight, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db/prisma";

export const metadata = {
  title: "Frequently Asked Questions | The Origin Foundation",
  description:
    "Official FAQs regarding Mithila Queen registration, fee payment, eligibility, video submission, and PDF confirmation.",
};

export default async function FaqPage() {
  const setting = await prisma.siteSetting.findUnique({
    where: { id: "primary" },
  });
  const regFee = setting?.registrationFee || 399;

  const faqs = (setting?.faqsJson as any) || [
    {
      category: "Organization & Initiative",
      q: "What is The Origin Foundation?",
      a: "The Origin Foundation is a platform being developed in Janakpur Dham, Nepal, to support cultural identity, talent, and community participation through initiatives such as Mithila Queen.",
    },
    {
      category: "Organization & Initiative",
      q: "What is Mithila Queen?",
      a: "Mithila Queen is the flagship initiative of The Origin Foundation—a cultural and talent-oriented competition intended to celebrate Mithila's heritage, confidence, creativity, and individual talent.",
    },
    {
      category: "Fee & Payment",
      q: "What is the registration fee?",
      a: `The registration fee is strictly NPR ${regFee} per registration, payable in Nepalese rupees only.`,
    },
    {
      category: "Fee & Payment",
      q: "How can I pay the registration fee?",
      a: "Follow the official payment instructions on the website and scan the verified payment QR code. After completing the payment, enter your transaction reference and upload the payment screenshot for administrative review.",
    },
    {
      category: "Fee & Payment",
      q: "Does uploading a payment screenshot guarantee approval?",
      a: "No. The organizing team independently checks and verifies the bank transfer records before the application advances to the approval review workflow.",
    },
    {
      category: "Eligibility & Social Media",
      q: "Are all three social media accounts required?",
      a: "No. At least one valid Instagram, TikTok, or Facebook profile is required; the other two are optional. We never ask for passwords or account access.",
    },
    {
      category: "Schedule & Format",
      q: "When will the event take place?",
      a: "The event schedule and venue are currently To Be Announced. Registration is conducted online via this official website. Confirmed dates will be published through official announcements.",
    },
    {
      category: "Confirmation & Documents",
      q: "When will I receive my PDF confirmation?",
      a: "After the required payment verification and application approval are both completed by administrators, your official branded confirmation PDF is automatically generated and emailed to your registered address.",
    },
    {
      category: "Support & Corrections",
      q: "What if I make a mistake in my application?",
      a: "Contact the official organizing team at originfoundation107@gmail.com or follow the correction instructions provided through your registration status dashboard.",
    },
    {
      category: "Support & Corrections",
      q: "How can I contact the organizers?",
      a: "You can reach us at originfoundation107@gmail.com, or contact Managing Directors Gaurav Gupta (+977 9704571941) or Dipendra Shah Kalwar (+977 981-2005468).",
    },
  ];

  return (
    <div className="py-12 sm:py-20 space-y-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* HEADER */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-slate-200 text-[#0A192F] text-xs font-semibold shadow-xs">
          <Crown className="w-3.5 h-3.5 text-[#C5A880]" />
          <span>Official Information Desk</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black font-serif text-[#0A192F] tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Clear, verified answers regarding The Origin Foundation, Mithila Queen registration, payment verification, and competition guidelines.
        </p>
      </div>

      {/* FAQS ACCORDION / LIST */}
      <div className="space-y-4">
        {faqs.map((faq: any, i: number) => (
          <div
            key={i}
            className="p-6 rounded-md bg-white border border-slate-200 shadow-xs space-y-2.5 transition-colors hover:border-[#C5A880]"
          >
            {faq.category && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A880] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {faq.category}
                </span>
              </div>
            )}
            <h2 className="text-base font-bold text-[#0A192F] font-serif flex items-start gap-2.5">
              <HelpCircle className="w-5 h-5 text-[#C5A880] shrink-0 mt-0.5" />
              <span>{faq.q}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 pl-7 leading-relaxed">
              {faq.a}
            </p>
          </div>
        ))}
      </div>

      {/* STILL HAVE QUESTIONS */}
      <div className="p-8 rounded-lg bg-[#0A192F] text-white border border-[#C5A880]/30 text-center space-y-4 shadow-md">
        <h3 className="text-xl font-bold font-serif text-white">Still have questions?</h3>
        <p className="text-xs text-slate-300 max-w-md mx-auto">
          Our team in Janakpur Dham is here to assist with any registration or payment inquiries.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-mono">
          <a
            href="mailto:originfoundation107@gmail.com"
            className="text-[#C5A880] hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span>originfoundation107@gmail.com</span>
          </a>
          <span className="hidden sm:inline text-slate-600">•</span>
          <a
            href="tel:+9779704571941"
            className="text-[#C5A880] hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span>+977 9704571941</span>
          </a>
        </div>
      </div>
    </div>
  );
}

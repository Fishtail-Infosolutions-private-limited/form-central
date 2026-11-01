import React from "react";
import Link from "next/link";
import { HelpCircle, Mail, Phone } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { getSafeSiteSetting } from "@/lib/db/site-settings";
import { ExpandableFaqs } from "@/components/home/expandable-faqs";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Frequently Asked Questions | The Origin Foundation",
  description:
    "Official FAQs regarding Mithila Queen registration, fee payment, eligibility, video submission, and PDF confirmation.",
};

const DEFAULT_FAQS = [
  {
    category: "Organization & Initiative",
    question: "What is The Origin Foundation?",
    answer:
      "The Origin Foundation is a platform being developed in Janakpur Dham, Nepal, to support cultural identity, talent, and community participation through initiatives such as Mithila Queen.",
  },
  {
    category: "Organization & Initiative",
    question: "What is Mithila Queen?",
    answer:
      "Mithila Queen is the flagship initiative of The Origin Foundation—a cultural and talent-oriented competition intended to celebrate Mithila's heritage, confidence, creativity, and individual talent.",
  },
  {
    category: "Fee & Payment",
    question: "What is the registration fee?",
    answer:
      "The registration fee is strictly NPR 399 per registration, payable in Nepalese rupees only.",
  },
  {
    category: "Fee & Payment",
    question: "How can I pay the registration fee?",
    answer:
      "Follow the official payment instructions on the website and scan the verified payment QR code. After completing the payment, enter your transaction reference and upload the payment screenshot for administrative review.",
  },
  {
    category: "Fee & Payment",
    question: "Does uploading a payment screenshot guarantee approval?",
    answer:
      "No. The organizing team independently checks and verifies the bank transfer records before the application advances to the approval review workflow.",
  },
  {
    category: "Eligibility & Social Media",
    question: "Are all three social media accounts required?",
    answer:
      "No. At least one valid Instagram, TikTok, or Facebook profile is required; the other two are optional. We never ask for passwords or account access.",
  },
  {
    category: "Schedule & Format",
    question: "When will the event take place?",
    answer:
      "The event schedule and venue are currently To Be Announced. Registration is conducted online via this official website. Confirmed dates will be published through official announcements.",
  },
  {
    category: "Confirmation & Documents",
    question: "When will I receive my PDF confirmation?",
    answer:
      "After the required payment verification and application approval are both completed by administrators, your official branded confirmation PDF is automatically generated and emailed to your registered address.",
  },
  {
    category: "Support & Corrections",
    question: "What if I make a mistake in my application?",
    answer:
      "Contact the official organizing team at originfoundation107@gmail.com or follow the correction instructions provided through your registration status dashboard.",
  },
  {
    category: "Support & Corrections",
    question: "How can I contact the organizers?",
    answer:
      "You can reach us at originfoundation107@gmail.com, or contact Managing Directors Gaurav Gupta (+977 9704571941) or Dipendra Shah Kalwar (+977 981-2005468).",
  },
];

export default async function FaqPage() {
  const setting = await getSafeSiteSetting();

  const regFee = setting?.registrationFee || 399;
  const officialEmail = setting?.officialEmail || "originfoundation107@gmail.com";
  const whatsappContact = setting?.whatsappContact || "+977 9704571941";

  // Load and filter FAQs from DB
  const rawFaqs: any[] = Array.isArray(setting?.faqsJson) ? (setting.faqsJson as any[]) : [];

  const activeFaqs = rawFaqs
    .filter((f) => {
      const q = f.question || f.q;
      const a = f.answer || f.a;
      return f.published !== false && q && q.trim().length > 0 && a && a.trim().length > 0;
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((f) => ({
      category: f.category || "General",
      question: (f.question || f.q || "").replace("NPR 399", `NPR ${regFee}`),
      answer: (f.answer || f.a || "").replace("NPR 399", `NPR ${regFee}`),
    }));

  const displayFaqs = activeFaqs.length > 0 ? activeFaqs : DEFAULT_FAQS;

  const faqItemsForAccordion = displayFaqs.map((f) => ({
    q: f.question,
    a: f.answer,
    category: f.category,
  }));

  return (
    <div className="py-12 sm:py-16 space-y-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* HEADER */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4F7FA] border border-[#DCE5ED] text-[#183153] text-xs font-semibold shadow-xs">
          <HelpCircle className="w-3.5 h-3.5 text-[#356FA8]" />
          <span>Official Information Desk</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#183153] tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-[#546E7A] max-w-xl mx-auto leading-relaxed">
          Clear, verified answers regarding The Origin Foundation, Mithila Queen registration, payment verification, and competition guidelines.
        </p>
      </div>

      {/* FAQS ACCORDION */}
      <div>
        <ExpandableFaqs faqs={faqItemsForAccordion} />
      </div>

      {/* STILL HAVE QUESTIONS */}
      <div className="p-8 rounded-2xl bg-[#183153] text-white border border-[#DCE5ED] text-center space-y-4 shadow-sm">
        <h3 className="text-xl font-bold text-white">Still have questions?</h3>
        <p className="text-sm text-slate-300 max-w-md mx-auto">
          Our organizing team in Janakpur Dham is here to assist with any registration or payment inquiries.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs">
          <a
            href={`mailto:${officialEmail}`}
            className="text-[#F4F7FA] hover:text-white flex items-center gap-2 transition-colors font-medium bg-white/10 px-3 py-1.5 rounded-lg border border-white/10"
          >
            <Mail className="w-4 h-4 text-[#356FA8]" />
            <span>{officialEmail}</span>
          </a>
          <a
            href={`https://wa.me/${whatsappContact.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#F4F7FA] hover:text-white flex items-center gap-2 transition-colors font-medium bg-white/10 px-3 py-1.5 rounded-lg border border-white/10"
          >
            <Phone className="w-4 h-4 text-[#356FA8]" />
            <span>{whatsappContact}</span>
          </a>
        </div>

        <div className="pt-4 border-t border-white/15 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/register" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-white text-[#183153] hover:bg-[#F4F7FA] font-bold text-xs h-10 px-6 rounded-lg shadow-sm gap-2 transition-all">
              Register for Mithila Queen (NPR {regFee})
            </button>
          </Link>
          <Link href="/registration-status" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto border border-white/40 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs h-10 px-5 rounded-lg transition-all">
              Check Application Status
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

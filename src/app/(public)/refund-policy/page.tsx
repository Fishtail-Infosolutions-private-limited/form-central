import React from "react";
import { AlertCircle, HelpCircle, Mail, Phone } from "lucide-react";

export const metadata = {
  title: "Refund and Cancellation Policy | The Origin Foundation",
  description:
    "Official policy regarding registration fees, duplicate payments, and cancellation guidelines for Mithila Queen.",
};

export default function RefundPolicyPage() {
  return (
    <div className="py-12 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#C5A880]">
          Financial Transparency
        </span>
        <h1 className="text-3xl sm:text-5xl font-black font-serif text-[#0A192F] tracking-tight">
          Refund & Cancellation Policy
        </h1>
        <p className="text-xs text-[#243B53]">
          The Origin Foundation • Janakpur Dham, Nepal
        </p>
      </div>

      <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#E9E2D5] shadow-xs space-y-8 text-xs sm:text-sm text-[#243B53] leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold font-serif text-[#0A192F]">
            1. Registration Fee Overview
          </h2>
          <p>
            The registration fee for Mithila Queen is strictly <strong>NPR 399</strong> per applicant, collected in Nepalese rupees to support participant logistics, audition adjudication, administrative coordination, and certificate generation.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold font-serif text-[#0A192F]">
            2. General Non-Refundable Nature
          </h2>
          <p>
            Due to the immediate administrative processing, document validation, and resource allocation upon registration, the NPR 399 entry fee is generally non-refundable once an application has been processed and submitted for review.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold font-serif text-[#0A192F]">
            3. Duplicate & Erroneous Payments
          </h2>
          <p>
            In the event that an applicant accidentally completes multiple transactions for the same registration, or if an amount in excess of NPR 399 was transferred due to a banking technical glitch:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>The applicant must notify the organizers within <strong>7 calendar days</strong> of the transaction.</li>
            <li>Submit full bank statements, transaction IDs, and sender account details to <a href="mailto:originfoundation107@gmail.com" className="text-[#0A192F] font-semibold underline">originfoundation107@gmail.com</a>.</li>
            <li>Upon independent financial reconciliation by our finance team, verified duplicate excess amounts will be returned to the originating source account.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold font-serif text-[#0A192F]">
            4. Event Postponement or Schedule Adjustments
          </h2>
          <p>
            The event schedule is currently <strong>To Be Announced</strong>. In the event of date adjustments or venue updates mandated by organizational planning or regional circumstances, registrations remain fully valid for the rescheduled competition dates.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold font-serif text-[#0A192F]">
            5. Contact for Payment Reconciliation
          </h2>
          <p>
            For any billing questions or payment clarification inquiries, please contact:
          </p>
          <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#E9E2D5] space-y-1 text-xs">
            <p><strong>The Origin Foundation — Payment Support</strong></p>
            <p>Email: <a href="mailto:originfoundation107@gmail.com" className="text-[#0A192F] font-semibold underline">originfoundation107@gmail.com</a></p>
            <p>Gaurav Gupta: +977 9704571941 | Dipendra Shah Kalwar: +977 981-2005468</p>
            <p>Janakpur Dham, Madhesh Province, Nepal</p>
          </div>
        </section>
      </div>
    </div>
  );
}


import React from "react";
import { CreditCard, HelpCircle } from "lucide-react";
import { getSafeSiteSetting } from "@/lib/db/site-settings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Refund and Cancellation Policy | The Origin Foundation",
  description:
    "Official policy regarding registration fees, duplicate payments, and cancellation guidelines for Mithila Queen.",
};

export default async function RefundPolicyPage() {
  const setting = await getSafeSiteSetting();
  const regFee = setting?.registrationFee || 399;

  return (
    <div className="py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4F7FA] border border-[#DCE5ED] text-[#183153] text-xs font-semibold shadow-xs">
          <CreditCard className="w-3.5 h-3.5 text-[#356FA8]" />
          <span>Financial Policy</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#183153] tracking-tight">
          Refund & Cancellation Policy
        </h1>
        <p className="text-sm text-[#546E7A]">
          The Origin Foundation • Janakpur Dham, Nepal
        </p>
      </div>

      <div className="p-6 sm:p-10 rounded-2xl bg-white border border-[#DCE5ED] shadow-xs space-y-8 text-sm text-[#546E7A] leading-relaxed">
        <section className="space-y-2.5">
          <h2 className="text-base font-bold text-[#183153]">
            1. Registration Fee Overview
          </h2>
          <p>
            The registration fee for Mithila Queen is strictly <strong className="text-[#183153]">NPR {regFee}</strong> per applicant, collected in Nepalese rupees to support participant logistics, audition adjudication, administrative coordination, and certificate generation.
          </p>
        </section>

        <section className="space-y-2.5">
          <h2 className="text-base font-bold text-[#183153]">
            2. General Non-Refundable Nature
          </h2>
          <p>
            Due to the immediate administrative processing, document validation, and resource allocation upon registration, the NPR {regFee} entry fee is generally non-refundable once an application has been processed and submitted for review.
          </p>
        </section>

        <section className="space-y-2.5">
          <h2 className="text-base font-bold text-[#183153]">
            3. Duplicate & Erroneous Payments
          </h2>
          <p>
            In the event that an applicant accidentally completes multiple transactions for the same registration, or if an amount in excess of NPR {regFee} was transferred due to a banking technical glitch:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>The applicant must notify the organizers within <strong className="text-[#183153]">7 calendar days</strong> of the transaction.</li>
            <li>Submit full bank statements, transaction IDs, and sender account details to <a href="mailto:originfoundation107@gmail.com" className="text-[#356FA8] font-semibold underline">originfoundation107@gmail.com</a>.</li>
            <li>Upon independent financial reconciliation by our finance team, verified duplicate excess amounts will be returned to the originating source account.</li>
          </ul>
        </section>

        <section className="space-y-2.5">
          <h2 className="text-base font-bold text-[#183153]">
            4. Event Postponement or Schedule Adjustments
          </h2>
          <p>
            The event schedule is currently <strong className="text-[#183153]">To Be Announced</strong>. In the event of date adjustments or venue updates mandated by organizational planning or regional circumstances, registrations remain fully valid for the rescheduled competition dates.
          </p>
        </section>

        <section className="space-y-2.5">
          <h2 className="text-base font-bold text-[#183153]">
            5. Contact for Payment Reconciliation
          </h2>
          <p>
            For any billing questions or payment clarification inquiries, please contact:
          </p>
          <div className="p-4 rounded-xl bg-[#F4F7FA] border border-[#DCE5ED] space-y-1 text-xs">
            <p><strong className="text-[#183153]">The Origin Foundation — Payment Support</strong></p>
            <p>Email: <a href="mailto:originfoundation107@gmail.com" className="text-[#356FA8] font-semibold underline">originfoundation107@gmail.com</a></p>
            <p className="text-[#546E7A]">Gaurav Gupta: +977 9704571941 | Dipendra Shah Kalwar: +977 981-2005468</p>
            <p className="text-[#546E7A]">Janakpur Dham, Madhesh Province, Nepal</p>
          </div>
        </section>
      </div>
    </div>
  );
}

import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, ShieldCheck, ArrowUpRight } from "lucide-react";
import { OriginFoundationLogo } from "@/components/brand/brand-logos";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#172B24] text-[#F5F0E6] border-t border-[#233D34] mt-auto">
      {/* Restrained hairline gold line */}
      <div className="h-[1px] bg-[#B69A65]/40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Col 1 & 2: Organization & Mission */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="inline-block hover:opacity-95 transition-opacity">
              <OriginFoundationLogo variant="full" theme="light" />
            </Link>

            <p className="text-xs text-[#E8DFD0]/85 leading-relaxed max-w-sm">
              The Origin Foundation is a cultural platform established in Janakpur Dham, Nepal, committed to honoring Mithila&apos;s artistic identity, encouraging self-confidence, and creating genuine opportunities for participation and representation through its flagship initiative, <strong>Mithila Queen</strong>.
            </p>

            <div className="pt-2 text-xs text-[#E8DFD0] space-y-2.5">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#B69A65] shrink-0 mt-0.5" />
                <span>Janakpur Dham, Madhesh Province, Nepal</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#B69A65] shrink-0" />
                <a
                  href="mailto:originfoundation107@gmail.com"
                  className="hover:text-[#B69A65] transition-colors font-mono"
                >
                  originfoundation107@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Col 3: Leadership Team */}
          <div className="space-y-3.5">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#B69A65] font-sans">
              Managing Directors
            </h4>
            <div className="space-y-3 text-xs">
              {/* Gaurav Gupta */}
              <div className="p-3.5 rounded bg-[#0F1D18] border border-[#233D34] space-y-1 hover:border-[#B69A65]/50 transition-colors">
                <p className="font-bold text-[#F5F0E6] text-sm font-serif">Gaurav Gupta</p>
                <p className="text-[11px] text-[#B69A65] font-medium">Managing Director</p>
                <a
                  href="tel:+9779704571941"
                  className="text-[11px] text-[#E8DFD0]/80 hover:text-[#B69A65] flex items-center gap-1.5 font-mono pt-1 transition-colors"
                >
                  <Phone className="w-3 h-3 text-[#B69A65]" />
                  <span>+977 9704571941</span>
                </a>
              </div>

              {/* Dipendra Shah Kalwar */}
              <div className="p-3.5 rounded bg-[#0F1D18] border border-[#233D34] space-y-1 hover:border-[#B69A65]/50 transition-colors">
                <p className="font-bold text-[#F5F0E6] text-sm font-serif">Dipendra Shah Kalwar</p>
                <p className="text-[11px] text-[#B69A65] font-medium">Managing Director</p>
                <a
                  href="tel:+9779812005468"
                  className="text-[11px] text-[#E8DFD0]/80 hover:text-[#B69A65] flex items-center gap-1.5 font-mono pt-1 transition-colors"
                >
                  <Phone className="w-3 h-3 text-[#B69A65]" />
                  <span>+977 981-2005468</span>
                </a>
              </div>
            </div>
          </div>

          {/* Col 4: Mithila Queen Navigation */}
          <div className="space-y-3.5">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#B69A65] font-sans">
              Mithila Queen
            </h4>
            <ul className="space-y-2.5 text-xs text-[#E8DFD0]/90">
              <li>
                <Link href="/mithila-queen" className="hover:text-[#B69A65] transition-colors flex items-center gap-1">
                  <span>Competition Overview</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="hover:text-[#B69A65] transition-colors flex items-center gap-1 font-semibold text-[#F5F0E6]"
                >
                  <span>Online Registration (NPR 399)</span>
                  <ArrowUpRight className="w-3 h-3 text-[#B69A65]" />
                </Link>
              </li>
              <li>
                <Link href="/registration-status" className="hover:text-[#B69A65] transition-colors">
                  Applicant Status Lookup
                </Link>
              </li>
              <li>
                <Link href="/culture" className="hover:text-[#B69A65] transition-colors">
                  Culture & Heritage
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#B69A65] transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#B69A65] transition-colors">
                  Contact Organizing Desk
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Policies & Compliance */}
          <div className="space-y-3.5">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#B69A65] font-sans">
              Policies & Compliance
            </h4>
            <ul className="space-y-2.5 text-xs text-[#E8DFD0]/90">
              <li>
                <Link href="/privacy-policy" className="hover:text-[#B69A65] transition-colors">
                  Privacy Policy & Safeguarding
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#B69A65] transition-colors">
                  Terms of Participation
                </Link>
              </li>
              <li>
                <Link href="/rules" className="hover:text-[#B69A65] transition-colors">
                  Eligibility & Rules
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-[#B69A65] transition-colors">
                  Refund & Fee Policy
                </Link>
              </li>
              <li className="pt-2 border-t border-[#233D34]">
                <Link
                  href="/admin/login"
                  className="text-[11px] text-[#B69A65] hover:text-[#FFFFFF] transition-colors flex items-center gap-1.5 font-semibold"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#B69A65]" />
                  <span>Origin Foundation Admin</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright notice */}
        <div className="border-t border-[#233D34] pt-8 mt-12 flex flex-col sm:flex-row items-center justify-between text-xs text-[#E8DFD0]/70 gap-4">
          <p>
            &copy; {currentYear} The Origin Foundation. Janakpur Dham, Nepal. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px]">
            <span>Schedule: <strong className="text-[#B69A65]">To Be Announced</strong></span>
            <span>&bull;</span>
            <span>Fee: <strong className="text-[#F5F0E6]">NPR 399</strong></span>
            <span>&bull;</span>
            <span>Asia/Kathmandu (NPT)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

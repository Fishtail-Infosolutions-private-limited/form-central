import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, ShieldCheck, ArrowUpRight } from "lucide-react";
import { OriginFoundationLogo } from "@/components/brand/brand-logos";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#292821] text-[#F5F0E6] border-t border-[#3C332A] mt-auto">
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

          {/* Col 3: Leadership Team (Equal Visual Prominence) */}
          <div className="space-y-3.5">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#B69A65] font-sans">
              Managing Directors
            </h4>
            <div className="space-y-3 text-xs">
              {/* Gaurav Gupta */}
              <div className="p-3.5 rounded bg-[#1E1D18] border border-[#3C332A] space-y-1 hover:border-[#B69A65]/50 transition-colors">
                <p className="font-bold text-[#F5F0E6] text-sm font-serif">Gaurav Gupta</p>
                <p className="text-[11px] text-[#A64B36] font-medium">Managing Director</p>
                <a
                  href="tel:+9779704571941"
                  className="text-[11px] text-[#E8DFD0]/80 hover:text-[#B69A65] flex items-center gap-1.5 font-mono pt-1 transition-colors"
                >
                  <Phone className="w-3 h-3 text-[#B69A65]" />
                  <span>+977 9704571941</span>
                </a>
              </div>

              {/* Dipendra Shah Kalwar */}
              <div className="p-3.5 rounded bg-[#1E1D18] border border-[#3C332A] space-y-1 hover:border-[#B69A65]/50 transition-colors">
                <p className="font-bold text-[#F5F0E6] text-sm font-serif">Dipendra Shah Kalwar</p>
                <p className="text-[11px] text-[#A64B36] font-medium">Managing Director</p>
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
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/register" className="text-[#E8DFD0]/85 hover:text-[#FFFFFF] transition-colors flex items-center justify-between">
                  <span>Register (NPR 399)</span>
                  <ArrowUpRight className="w-3 h-3 text-[#B69A65]" />
                </Link>
              </li>
              <li>
                <Link href="/registration-status" className="text-[#E8DFD0]/85 hover:text-[#FFFFFF] transition-colors flex items-center justify-between">
                  <span>Check Application Status</span>
                  <ArrowUpRight className="w-3 h-3 text-[#B69A65]" />
                </Link>
              </li>
              <li>
                <Link href="/mithila-queen" className="text-[#E8DFD0]/85 hover:text-[#FFFFFF] transition-colors">
                  Competition Overview
                </Link>
              </li>
              <li>
                <Link href="/rules" className="text-[#E8DFD0]/85 hover:text-[#FFFFFF] transition-colors">
                  Rules & Eligibility
                </Link>
              </li>
              <li>
                <Link href="/culture" className="text-[#E8DFD0]/85 hover:text-[#FFFFFF] transition-colors">
                  Culture & Heritage
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-[#E8DFD0]/85 hover:text-[#FFFFFF] transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Legal & Institutional Governance */}
          <div className="space-y-3.5">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#B69A65] font-sans">
              Legal & Policies
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/privacy-policy" className="text-[#E8DFD0]/85 hover:text-[#FFFFFF] transition-colors">
                  Privacy Policy & Data Protection
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-[#E8DFD0]/85 hover:text-[#FFFFFF] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="text-[#E8DFD0]/85 hover:text-[#FFFFFF] transition-colors">
                  Refund & Cancellation Policy
                </Link>
              </li>
              <li>
                <Link href="/rules" className="text-[#E8DFD0]/85 hover:text-[#FFFFFF] transition-colors flex items-center gap-1.5 text-[#B69A65]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Minor Safeguarding Code</span>
                </Link>
              </li>
              <li className="pt-2">
                <Link
                  href="/admin/login"
                  className="text-[11px] font-mono text-[#E8DFD0]/50 hover:text-[#B69A65] transition-colors"
                >
                  Admin Portal &rarr;
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className="mt-14 pt-8 border-t border-[#3C332A] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#E8DFD0]/60">
          <div>
            &copy; {currentYear} The Origin Foundation. All rights reserved. &bull; Janakpur Dham, Nepal.
          </div>
          <div className="text-[11px] text-[#E8DFD0]/50 font-sans flex items-center gap-2">
            <span>Official Flagship: </span>
            <strong className="text-[#B69A65]">Mithila Queen</strong>
            <span>&bull; Registered Fee: NPR 399</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

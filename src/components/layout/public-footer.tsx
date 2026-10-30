"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, ShieldCheck, ArrowUpRight } from "lucide-react";
import { OriginFoundationLogo } from "@/components/brand/brand-logos";
import { getPublicSiteSettingsAction } from "@/server/actions/site-settings-actions";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();
  const [fee, setFee] = useState<number>(399);

  useEffect(() => {
    async function loadFee() {
      try {
        const res = await getPublicSiteSettingsAction();
        if (res.success && res.setting?.registrationFee) {
          setFee(res.setting.registrationFee);
        }
      } catch (e) {}
    }
    loadFee();
  }, []);

  return (
    <footer className="bg-[#183153] text-white border-t border-[#DCE5ED]/20 mt-auto">
      {/* Top Accent Line in Warm Blue */}
      <div className="h-1 bg-[#356FA8]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Col 1 & 2: Organization & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block hover:opacity-95 transition-opacity">
              <OriginFoundationLogo variant="full" theme="light" />
            </Link>

            <p className="text-xs text-[#DCE5ED] leading-relaxed max-w-sm">
              The Origin Foundation is a dedicated cultural platform in Janakpur Dham, Nepal, committed to honoring Mithila&apos;s artistic identity, encouraging self-confidence, and creating genuine opportunities through its flagship initiative, <strong className="text-white">Mithila Queen</strong>.
            </p>

            <div className="pt-2 text-xs text-[#DCE5ED] space-y-2.5">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#356FA8] shrink-0 mt-0.5" />
                <span>Janakpur Dham, Madhesh Province, Nepal</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#356FA8] shrink-0" />
                <a
                  href="mailto:originfoundation107@gmail.com"
                  className="hover:text-white transition-colors font-mono"
                >
                  originfoundation107@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Col 3: Leadership & Inquiries */}
          <div className="space-y-3.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#356FA8]">
              Managing Directors
            </h4>
            <div className="space-y-2.5 text-xs">
              {/* Gaurav Gupta */}
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-1">
                <p className="font-bold text-white text-xs">Gaurav Gupta</p>
                <p className="text-[11px] text-[#DCE5ED]">Managing Director</p>
                <a
                  href="tel:+9779704571941"
                  className="text-[11px] text-[#356FA8] hover:text-white flex items-center gap-1.5 font-mono pt-0.5 transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  <span>+977 9704571941</span>
                </a>
              </div>

              {/* Dipendra Shah Kalwar */}
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-1">
                <p className="font-bold text-white text-xs">Dipendra Shah Kalwar</p>
                <p className="text-[11px] text-[#DCE5ED]">Managing Director</p>
                <a
                  href="tel:+9779812005468"
                  className="text-[11px] text-[#356FA8] hover:text-white flex items-center gap-1.5 font-mono pt-0.5 transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  <span>+977 981-2005468</span>
                </a>
              </div>
            </div>
          </div>

          {/* Col 4: Mithila Queen Navigation */}
          <div className="space-y-3.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#356FA8]">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/register" className="text-[#DCE5ED] hover:text-white transition-colors flex items-center justify-between">
                  <span>Register for Candidacy</span>
                  <ArrowUpRight className="w-3 h-3 text-[#356FA8]" />
                </Link>
              </li>
              <li>
                <Link href="/registration-status" className="text-[#DCE5ED] hover:text-white transition-colors flex items-center justify-between">
                  <span>Check Application Status</span>
                  <ArrowUpRight className="w-3 h-3 text-[#356FA8]" />
                </Link>
              </li>
              <li>
                <Link href="/mithila-queen" className="text-[#DCE5ED] hover:text-white transition-colors">
                  Mithila Queen Overview
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-[#DCE5ED] hover:text-white transition-colors">
                  About Foundation
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-[#DCE5ED] hover:text-white transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[#DCE5ED] hover:text-white transition-colors">
                  Contact Desk
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Legal & Policies */}
          <div className="space-y-3.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#356FA8]">
              Policies & Safeguards
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/privacy-policy" className="text-[#DCE5ED] hover:text-white transition-colors">
                  Privacy Policy &amp; Data Protection
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-[#DCE5ED] hover:text-white transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="text-[#DCE5ED] hover:text-white transition-colors">
                  Refund &amp; Fee Policy
                </Link>
              </li>
              <li>
                <Link href="/rules" className="text-[#DCE5ED] hover:text-white transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#356FA8]" />
                  <span>Minor Safeguarding Code</span>
                </Link>
              </li>
              <li className="pt-2">
                <Link
                  href="/admin/login"
                  className="text-[11px] font-mono text-[#DCE5ED]/60 hover:text-white transition-colors"
                >
                  Admin Portal &rarr;
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#DCE5ED]/70">
          <div>
            &copy; {currentYear} The Origin Foundation. All rights reserved. &bull; Janakpur Dham, Nepal.
          </div>
          <div className="text-[11px] text-[#DCE5ED]/70 flex items-center gap-2">
            <span>Official Flagship: </span>
            <strong className="text-white">Mithila Queen</strong>
            <span>&bull; Registration Fee: NPR {fee}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

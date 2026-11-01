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
    <footer className="bg-maroon-dark text-white border-t border-white/10 mt-auto">
      {/* Restrained hairline gold line */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-antique-gold to-transparent opacity-70" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Col 1 & 2: Organization & Mission */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="inline-block hover:opacity-95 transition-opacity">
              <OriginFoundationLogo variant="full" theme="light" />
            </Link>

            <p className="text-xs text-stone-300 leading-relaxed max-w-sm">
              The Origin Foundation is a cultural platform established in Janakpur Dham, Nepal, committed to honoring Mithila&apos;s artistic identity, encouraging self-confidence, and creating genuine opportunities for participation and representation through its flagship initiative, <strong className="text-white">Mithila Queen</strong>.
            </p>

            <div className="pt-2 text-xs text-stone-200 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-antique-gold shrink-0 mt-0.5" />
                <span>Janakpur Dham, Madhesh Province, Nepal</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-antique-gold shrink-0" />
                <a
                  href="mailto:originfoundation107@gmail.com"
                  className="hover:text-antique-gold transition-colors font-mono"
                >
                  originfoundation107@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Col 3: Leadership Team (Equal Visual Prominence) */}
          <div className="space-y-3.5">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.16em] text-antique-gold font-sans">
              Managing Directors
            </h4>
            <div className="space-y-3 text-xs">
              {/* Gaurav Gupta */}
              <div className="p-3.5 rounded-xl bg-black/20 border border-white/10 space-y-1 hover:border-antique-gold/50 transition-colors">
                <p className="font-bold text-white text-sm font-serif">Gaurav Gupta</p>
                <p className="text-[11px] text-antique-gold font-medium">Managing Director</p>
                <a
                  href="tel:+9779704571941"
                  className="text-[11px] text-stone-300 hover:text-antique-gold flex items-center gap-1.5 font-mono pt-1 transition-colors"
                >
                  <Phone className="w-3 h-3 text-antique-gold" />
                  <span>+977 9704571941</span>
                </a>
              </div>

              {/* Dipendra Shah Kalwar */}
              <div className="p-3.5 rounded-xl bg-black/20 border border-white/10 space-y-1 hover:border-antique-gold/50 transition-colors">
                <p className="font-bold text-white text-sm font-serif">Dipendra Shah Kalwar</p>
                <p className="text-[11px] text-antique-gold font-medium">Managing Director</p>
                <a
                  href="tel:+9779812005468"
                  className="text-[11px] text-stone-300 hover:text-antique-gold flex items-center gap-1.5 font-mono pt-1 transition-colors"
                >
                  <Phone className="w-3 h-3 text-antique-gold" />
                  <span>+977 981-2005468</span>
                </a>
              </div>
            </div>
          </div>

          {/* Col 4: Mithila Queen Navigation */}
          <div className="space-y-3.5">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.16em] text-antique-gold font-sans">
              Mithila Queen
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/register" className="text-stone-300 hover:text-white transition-colors flex items-center justify-between">
                  <span>Register for Candidacy</span>
                  <ArrowUpRight className="w-3 h-3 text-antique-gold" />
                </Link>
              </li>
              <li>
                <Link href="/registration-status" className="text-stone-300 hover:text-white transition-colors flex items-center justify-between">
                  <span>Check Application Status</span>
                  <ArrowUpRight className="w-3 h-3 text-antique-gold" />
                </Link>
              </li>
              <li>
                <Link href="/mithila-queen" className="text-stone-300 hover:text-white transition-colors">
                  Competition Overview
                </Link>
              </li>
              <li>
                <Link href="/rules" className="text-stone-300 hover:text-white transition-colors">
                  Rules &amp; Eligibility
                </Link>
              </li>
              <li>
                <Link href="/culture" className="text-stone-300 hover:text-white transition-colors">
                  Culture &amp; Heritage
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-stone-300 hover:text-white transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Legal & Policies */}
          <div className="space-y-3.5">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.16em] text-antique-gold font-sans">
              Legal &amp; Policies
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/privacy-policy" className="text-stone-300 hover:text-white transition-colors">
                  Privacy Policy &amp; Data Protection
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-stone-300 hover:text-white transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="text-stone-300 hover:text-white transition-colors">
                  Refund &amp; Cancellation Policy
                </Link>
              </li>
              <li>
                <Link href="/rules" className="text-stone-300 hover:text-white transition-colors flex items-center gap-1.5 text-antique-gold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Minor Safeguarding Code</span>
                </Link>
              </li>
              <li className="pt-2">
                <Link
                  href="/admin/login"
                  className="text-[11px] font-mono text-stone-400 hover:text-antique-gold transition-colors"
                >
                  Admin Portal &rarr;
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div>
            &copy; {currentYear} The Origin Foundation. All rights reserved. &bull; Janakpur Dham, Nepal.
          </div>
          <div className="text-[11px] text-stone-400 font-sans flex items-center gap-2">
            <span>Official Flagship: </span>
            <strong className="text-antique-gold">Mithila Queen</strong>
            <span>&bull; Registration Fee: NPR {fee}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

import React from "react";
import Link from "next/link";
import { Crown, Mail, Phone, MapPin, ShieldCheck, Heart, ArrowUpRight } from "lucide-react";
import { MithilaMotif } from "@/components/ui/mithila-motif";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0A192F] text-[#FDFBF7] border-t border-[#243B53] mt-auto">
      {/* Subtle decorative cultural motif */}
      <div className="py-2 bg-[#071120] border-b border-[#243B53]/40">
        <MithilaMotif className="w-full h-3 text-[#C5A880]/30" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1 & 2: Organization & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0A192F] to-[#243B53] border border-[#C5A880]/60 flex items-center justify-center text-[#C5A880] shrink-0">
                <Crown className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div>
                <span className="text-xl font-bold font-serif text-[#FFFFFF] tracking-tight block">
                  The Origin Foundation
                </span>
                <span className="text-xs text-[#C5A880] font-medium tracking-wide">
                  Rooted in Identity. Driven by Purpose.
                </span>
              </div>
            </div>

            <p className="text-xs text-[#E9E2D5]/80 leading-relaxed max-w-sm">
              A platform based in Janakpur Dham, Nepal, dedicated to celebrating Mithila&apos;s rich cultural identity, empowering women&apos;s confidence, and providing national-level representation through its flagship competition, Mithila Queen.
            </p>

            <div className="pt-2 text-xs text-[#E9E2D5]/90 space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C5A880] shrink-0" />
                <span>Janakpur Dham, Madhesh Province, Nepal</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C5A880] shrink-0" />
                <a
                  href="mailto:originfoundation107@gmail.com"
                  className="hover:text-[#C5A880] transition-colors font-mono"
                >
                  originfoundation107@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Col 3: Leadership Team (Equal Visual Importance) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C5A880] font-sans">
              Leadership Team
            </h4>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#243B53]/30 border border-[#243B53] space-y-1">
                <p className="font-bold text-[#FFFFFF] text-sm">Gaurav Gupta</p>
                <p className="text-[11px] text-[#C5A880] font-medium">Managing Director</p>
                <a
                  href="tel:+9779704571941"
                  className="text-[11px] text-[#E9E2D5]/80 hover:text-[#C5A880] flex items-center gap-1 font-mono pt-1"
                >
                  <Phone className="w-3 h-3 text-[#C5A880]" />
                  <span>+977 9704571941</span>
                </a>
              </div>

              <div className="p-3 rounded-xl bg-[#243B53]/30 border border-[#243B53] space-y-1">
                <p className="font-bold text-[#FFFFFF] text-sm">Dipendra Shah Kalwar</p>
                <p className="text-[11px] text-[#C5A880] font-medium">Managing Director</p>
                <a
                  href="tel:+9779812005468"
                  className="text-[11px] text-[#E9E2D5]/80 hover:text-[#C5A880] flex items-center gap-1 font-mono pt-1"
                >
                  <Phone className="w-3 h-3 text-[#C5A880]" />
                  <span>+977 981-2005468</span>
                </a>
              </div>
            </div>
          </div>

          {/* Col 4: Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C5A880] font-sans">
              Mithila Queen
            </h4>
            <ul className="space-y-2 text-xs text-[#E9E2D5]">
              <li>
                <Link href="/mithila-queen" className="hover:text-[#C5A880] transition-colors flex items-center gap-1">
                  <span>Competition Overview</span>
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#C5A880] transition-colors flex items-center gap-1 font-semibold text-[#FFFFFF]">
                  <span>Register (NPR 399)</span>
                  <ArrowUpRight className="w-3 h-3 text-[#C5A880]" />
                </Link>
              </li>
              <li>
                <Link href="/registration-status" className="hover:text-[#C5A880] transition-colors">
                  Check Application Status
                </Link>
              </li>
              <li>
                <Link href="/culture" className="hover:text-[#C5A880] transition-colors">
                  Culture & Heritage
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#C5A880] transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#C5A880] transition-colors">
                  Official Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Legal & Institutional Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C5A880] font-sans">
              Policies & Compliance
            </h4>
            <ul className="space-y-2 text-xs text-[#E9E2D5]">
              <li>
                <Link href="/privacy-policy" className="hover:text-[#C5A880] transition-colors">
                  Privacy Policy & Safeguarding
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#C5A880] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/rules" className="hover:text-[#C5A880] transition-colors">
                  Competition Rules & Eligibility
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-[#C5A880] transition-colors">
                  Refund & Cancellation Policy
                </Link>
              </li>
              <li className="pt-2 border-t border-[#243B53]">
                <Link
                  href="/admin/login"
                  className="text-[11px] text-[#C5A880]/80 hover:text-[#C5A880] transition-colors flex items-center gap-1 font-semibold"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Origin Foundation Admin</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright notice */}
        <div className="border-t border-[#243B53]/80 pt-8 mt-12 flex flex-col sm:flex-row items-center justify-between text-xs text-[#E9E2D5]/70 gap-4">
          <p>
            © {currentYear} The Origin Foundation. Janakpur Dham, Nepal. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Event Schedule: <strong className="text-[#C5A880]">To Be Announced</strong></span>
            <span>•</span>
            <span>Registration Fee: <strong className="text-[#FFFFFF]">NPR 399</strong></span>
            <span>•</span>
            <span>Asia/Kathmandu (NPT)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}


"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Search,
  ArrowRight,
  Mail,
  MapPin,
  ChevronDown,
  BookOpen,
  ShieldCheck,
  HelpCircle,
  Phone,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OriginFoundationLogo, MithilaQueenLogo } from "@/components/brand/brand-logos";
import { getPublicSiteSettingsAction } from "@/server/actions/site-settings-actions";

export function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [registrationFee, setRegistrationFee] = useState<number>(399);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    async function loadFee() {
      try {
        const res = await getPublicSiteSettingsAction();
        if (res.success && res.setting?.registrationFee) {
          setRegistrationFee(res.setting.registrationFee);
        }
      } catch (e) {
        // Fallback default
      }
    }
    loadFee();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const isDropdownActive =
    pathname.startsWith("/culture") ||
    pathname.startsWith("/rules") ||
    pathname.startsWith("/faq");

  return (
    <header className="sticky top-0 z-50 bg-[#0A192F] text-white border-b border-[#1E293B] shadow-[0_4px_20px_rgba(10,25,47,0.25)]">
      {/* Top Institutional Bar */}
      <div className="bg-[#071324] px-4 py-2 text-[11px] border-b border-[#1E293B] text-[#94A3B8]">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[#C5A880]">
              <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
              <span className="font-semibold tracking-wider uppercase text-[10.5px]">
                Janakpur Dham &bull; Nepal
              </span>
            </div>
            <span className="text-[#334155] hidden sm:inline">&bull;</span>
            <span className="text-[#CBD5E1] hidden md:inline font-serif italic text-[11.5px]">
              &ldquo;Rooted in Identity. Driven by Purpose.&rdquo;
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <a
              href="mailto:originfoundation107@gmail.com"
              className="hidden lg:flex items-center gap-1.5 text-[#94A3B8] hover:text-[#C5A880] transition-colors"
            >
              <Mail className="w-3 h-3 text-[#C5A880]" />
              <span className="font-mono text-[11px]">originfoundation107@gmail.com</span>
            </a>
            <span className="text-[#334155] hidden lg:inline">&bull;</span>
            <Link
              href="/registration-status"
              className="text-white hover:text-[#C5A880] transition-colors flex items-center gap-1.5 font-medium tracking-wide bg-[#1E293B] px-2.5 py-0.5 rounded-full border border-[#C5A880]/30 text-xs"
            >
              <Search className="w-3 h-3 text-[#C5A880]" />
              <span>Status Lookup</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logos */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          <Link href="/" className="hover:opacity-95 transition-opacity">
            <OriginFoundationLogo variant="full" theme="light" />
          </Link>

          <div className="hidden 2xl:block h-7 w-px bg-[#1E293B]" />

          <div className="hidden 2xl:block">
            <Link href="/mithila-queen">
              <MithilaQueenLogo variant="badge" theme="light" />
            </Link>
          </div>
        </div>

        {/* Clean, Uncluttered Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2">
          {/* 1. Home */}
          <Link
            href="/"
            className={`px-3 py-2 text-xs font-semibold tracking-wide rounded-lg transition-all ${
              isActive("/") && pathname === "/"
                ? "text-[#C5A880] bg-[#1E293B] font-bold"
                : "text-[#E2E8F0] hover:text-white hover:bg-[#162C4E]"
            }`}
          >
            Home
          </Link>

          {/* 2. About Foundation */}
          <Link
            href="/about"
            className={`px-3 py-2 text-xs font-semibold tracking-wide rounded-lg transition-all ${
              isActive("/about")
                ? "text-[#C5A880] bg-[#1E293B] font-bold"
                : "text-[#E2E8F0] hover:text-white hover:bg-[#162C4E]"
            }`}
          >
            About
          </Link>

          {/* 3. Mithila Queen Flagship */}
          <Link
            href="/mithila-queen"
            className={`px-3 py-2 text-xs font-semibold tracking-wide rounded-lg transition-all flex items-center gap-1.5 ${
              isActive("/mithila-queen")
                ? "text-[#C5A880] bg-[#1E293B] font-bold"
                : "text-[#E2E8F0] hover:text-white hover:bg-[#162C4E]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Mithila Queen</span>
          </Link>

          {/* 4. Guidelines & Heritage Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`px-3 py-2 text-xs font-semibold tracking-wide rounded-lg transition-all flex items-center gap-1 ${
                isDropdownActive || dropdownOpen
                  ? "text-[#C5A880] bg-[#1E293B] font-bold"
                  : "text-[#E2E8F0] hover:text-white hover:bg-[#162C4E]"
              }`}
            >
              <span>Competition Guide</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180 text-[#C5A880]" : "text-[#94A3B8]"
                }`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-[#0A192F] border border-[#1E293B] rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <Link
                  href="/culture"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs text-[#E2E8F0] hover:text-white hover:bg-[#162C4E] transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-[#C5A880] shrink-0" />
                  <div>
                    <div className="font-bold">Culture &amp; Heritage</div>
                    <div className="text-[10px] text-[#94A3B8]">Mithila arts, traditions &amp; values</div>
                  </div>
                </Link>

                <Link
                  href="/rules"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs text-[#E2E8F0] hover:text-white hover:bg-[#162C4E] transition-colors border-t border-[#1E293B]"
                >
                  <ShieldCheck className="w-4 h-4 text-[#C5A880] shrink-0" />
                  <div>
                    <div className="font-bold">Rules &amp; Guidelines</div>
                    <div className="text-[10px] text-[#94A3B8]">Eligibility &amp; safeguarding</div>
                  </div>
                </Link>

                <Link
                  href="/faq"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs text-[#E2E8F0] hover:text-white hover:bg-[#162C4E] transition-colors border-t border-[#1E293B]"
                >
                  <HelpCircle className="w-4 h-4 text-[#C5A880] shrink-0" />
                  <div>
                    <div className="font-bold">Frequently Asked Questions</div>
                    <div className="text-[10px] text-[#94A3B8]">Registration, fees, approval &amp; dates</div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* 5. Contact Desk */}
          <Link
            href="/contact"
            className={`px-3 py-2 text-xs font-semibold tracking-wide rounded-lg transition-all ${
              isActive("/contact")
                ? "text-[#C5A880] bg-[#1E293B] font-bold"
                : "text-[#E2E8F0] hover:text-white hover:bg-[#162C4E]"
            }`}
          >
            Contact
          </Link>
        </nav>

        {/* Desktop Primary Action: Register Button */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <Link href="/register">
            <Button className="bg-[#C5A880] hover:bg-[#D4AF37] text-[#0A192F] font-extrabold text-xs h-10 px-4 rounded-xl shadow-md transition-all flex items-center gap-2 group">
              <span>Register Now</span>
              <span className="text-[11px] bg-[#0A192F]/15 px-1.5 py-0.5 rounded font-mono font-black">
                NPR {registrationFee}
              </span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Mobile menu trigger button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl text-[#E2E8F0] hover:text-white hover:bg-[#1E293B] border border-[#1E293B] transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#1E293B] bg-[#071324] px-4 pt-4 pb-8 space-y-4 shadow-2xl">
          <div className="p-3.5 rounded-xl bg-[#0A192F] border border-[#1E293B] flex items-center justify-center">
            <MithilaQueenLogo variant="badge" theme="light" />
          </div>

          {/* Group 1: Core Navigation */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#C5A880] px-3 py-1">
              Main Menu
            </div>
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-xs font-semibold ${
                pathname === "/" ? "bg-[#1E293B] text-[#C5A880]" : "text-[#E2E8F0] hover:bg-[#1E293B]/60"
              }`}
            >
              Home
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-xs font-semibold ${
                isActive("/about") ? "bg-[#1E293B] text-[#C5A880]" : "text-[#E2E8F0] hover:bg-[#1E293B]/60"
              }`}
            >
              About Foundation
            </Link>
            <Link
              href="/mithila-queen"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-xs font-semibold ${
                isActive("/mithila-queen") ? "bg-[#1E293B] text-[#C5A880]" : "text-[#E2E8F0] hover:bg-[#1E293B]/60"
              }`}
            >
              Mithila Queen (Flagship)
            </Link>
          </div>

          {/* Group 2: Event Guide & Heritage */}
          <div className="space-y-1 pt-2 border-t border-[#1E293B]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#C5A880] px-3 py-1">
              Competition Guide
            </div>
            <Link
              href="/culture"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-xs font-semibold ${
                isActive("/culture") ? "bg-[#1E293B] text-[#C5A880]" : "text-[#E2E8F0] hover:bg-[#1E293B]/60"
              }`}
            >
              Culture &amp; Heritage
            </Link>
            <Link
              href="/rules"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-xs font-semibold ${
                isActive("/rules") ? "bg-[#1E293B] text-[#C5A880]" : "text-[#E2E8F0] hover:bg-[#1E293B]/60"
              }`}
            >
              Rules &amp; Guidelines
            </Link>
            <Link
              href="/faq"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-xs font-semibold ${
                isActive("/faq") ? "bg-[#1E293B] text-[#C5A880]" : "text-[#E2E8F0] hover:bg-[#1E293B]/60"
              }`}
            >
              Frequently Asked Questions (FAQ)
            </Link>
          </div>

          {/* Group 3: Support & Contact */}
          <div className="space-y-1 pt-2 border-t border-[#1E293B]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#C5A880] px-3 py-1">
              Support &amp; Desk
            </div>
            <Link
              href="/registration-status"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-[#E2E8F0] hover:bg-[#1E293B]/60"
            >
              <span>Application Status Lookup</span>
              <Search className="w-3.5 h-3.5 text-[#C5A880]" />
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-xs font-semibold ${
                isActive("/contact") ? "bg-[#1E293B] text-[#C5A880]" : "text-[#E2E8F0] hover:bg-[#1E293B]/60"
              }`}
            >
              Contact Desk
            </Link>
          </div>

          {/* Big Mobile CTA */}
          <div className="pt-3 border-t border-[#1E293B]">
            <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="block">
              <Button className="w-full bg-[#C5A880] hover:bg-[#D4AF37] text-[#0A192F] font-black text-xs h-11 justify-between shadow-md rounded-xl">
                <span>Register for Mithila Queen</span>
                <span className="font-mono text-xs font-black bg-[#0A192F]/15 px-2 py-0.5 rounded">
                  NPR {registrationFee}
                </span>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

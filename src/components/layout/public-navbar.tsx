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
    <header className="sticky top-0 z-50 bg-maroon text-white border-b border-maroon-dark shadow-md">
      {/* Top Institutional Bar */}
      <div className="bg-maroon-dark px-4 py-2 text-[11px] border-b border-maroon-dark/60 text-stone-200">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-antique-gold">
              <MapPin className="w-3.5 h-3.5 text-antique-gold" />
              <span className="font-semibold tracking-wider uppercase text-[10.5px]">
                Janakpur Dham &bull; Nepal
              </span>
            </div>
            <span className="text-stone-400 hidden sm:inline">&bull;</span>
            <span className="text-stone-300 hidden md:inline font-serif italic text-[11.5px]">
              &ldquo;Rooted in Identity. Driven by Purpose.&rdquo;
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <a
              href="mailto:originfoundation107@gmail.com"
              className="hidden lg:flex items-center gap-1.5 text-stone-300 hover:text-antique-gold transition-colors"
            >
              <Mail className="w-3 h-3 text-antique-gold" />
              <span className="font-mono text-[11px]">originfoundation107@gmail.com</span>
            </a>
            <span className="text-stone-400 hidden lg:inline">&bull;</span>
            <Link
              href="/registration-status"
              className="text-white hover:text-antique-gold transition-colors flex items-center gap-1.5 font-medium tracking-wide bg-maroon px-2.5 py-0.5 rounded-full border border-antique-gold/40 text-xs"
            >
              <Search className="w-3 h-3 text-antique-gold" />
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

          <div className="hidden 2xl:block h-7 w-px bg-maroon-dark" />

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
                ? "text-antique-gold bg-maroon-dark font-bold"
                : "text-stone-200 hover:text-white hover:bg-maroon-dark/60"
            }`}
          >
            Home
          </Link>

          {/* 2. About Foundation */}
          <Link
            href="/about"
            className={`px-3 py-2 text-xs font-semibold tracking-wide rounded-lg transition-all ${
              isActive("/about")
                ? "text-antique-gold bg-maroon-dark font-bold"
                : "text-stone-200 hover:text-white hover:bg-maroon-dark/60"
            }`}
          >
            About
          </Link>

          {/* 3. Mithila Queen Flagship */}
          <Link
            href="/mithila-queen"
            className={`px-3 py-2 text-xs font-semibold tracking-wide rounded-lg transition-all flex items-center gap-1.5 ${
              isActive("/mithila-queen")
                ? "text-antique-gold bg-maroon-dark font-bold"
                : "text-stone-200 hover:text-white hover:bg-maroon-dark/60"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-antique-gold" />
            <span>Mithila Queen</span>
          </Link>

          {/* 4. Guidelines & Heritage Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`px-3 py-2 text-xs font-semibold tracking-wide rounded-lg transition-all flex items-center gap-1 ${
                isDropdownActive || dropdownOpen
                  ? "text-antique-gold bg-maroon-dark font-bold"
                  : "text-stone-200 hover:text-white hover:bg-maroon-dark/60"
              }`}
            >
              <span>Competition Guide</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180 text-antique-gold" : "text-stone-400"
                }`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-maroon-dark border border-cream-dark/30 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <Link
                  href="/culture"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs text-stone-200 hover:text-white hover:bg-maroon transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-antique-gold shrink-0" />
                  <div>
                    <div className="font-bold">Culture &amp; Heritage</div>
                    <div className="text-[10px] text-stone-300">Mithila arts, traditions &amp; values</div>
                  </div>
                </Link>

                <Link
                  href="/rules"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs text-stone-200 hover:text-white hover:bg-maroon transition-colors border-t border-maroon/80"
                >
                  <ShieldCheck className="w-4 h-4 text-antique-gold shrink-0" />
                  <div>
                    <div className="font-bold">Rules &amp; Guidelines</div>
                    <div className="text-[10px] text-stone-300">Eligibility &amp; safeguarding</div>
                  </div>
                </Link>

                <Link
                  href="/faq"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs text-stone-200 hover:text-white hover:bg-maroon transition-colors border-t border-maroon/80"
                >
                  <HelpCircle className="w-4 h-4 text-antique-gold shrink-0" />
                  <div>
                    <div className="font-bold">Frequently Asked Questions</div>
                    <div className="text-[10px] text-stone-300">Registration, fees, approval &amp; dates</div>
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
                ? "text-antique-gold bg-maroon-dark font-bold"
                : "text-stone-200 hover:text-white hover:bg-maroon-dark/60"
            }`}
          >
            Contact
          </Link>
        </nav>

        {/* Desktop Primary Action: Register Button */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <Link href="/register">
            <Button className="bg-saffron hover:bg-saffron-dark text-white font-extrabold text-xs h-10 px-4 rounded-xl shadow-md transition-all flex items-center gap-2 group">
              <span>Register Now</span>
              <span className="text-[11px] bg-black/20 px-1.5 py-0.5 rounded font-mono font-black">
                NPR {registrationFee}
              </span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Mobile menu trigger button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl text-stone-200 hover:text-white hover:bg-maroon-dark border border-maroon-dark transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-maroon-dark bg-maroon-dark px-4 pt-4 pb-8 space-y-4 shadow-2xl">
          <div className="p-3.5 rounded-xl bg-maroon border border-cream-dark/20 flex items-center justify-center">
            <MithilaQueenLogo variant="badge" theme="light" />
          </div>

          {/* Group 1: Core Navigation */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-antique-gold px-3 py-1">
              Main Menu
            </div>
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-xs font-semibold ${
                pathname === "/" ? "bg-maroon text-antique-gold" : "text-stone-200 hover:bg-maroon/60"
              }`}
            >
              Home
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-xs font-semibold ${
                isActive("/about") ? "bg-maroon text-antique-gold" : "text-stone-200 hover:bg-maroon/60"
              }`}
            >
              About Foundation
            </Link>
            <Link
              href="/mithila-queen"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-xs font-semibold ${
                isActive("/mithila-queen") ? "bg-maroon text-antique-gold" : "text-stone-200 hover:bg-maroon/60"
              }`}
            >
              Mithila Queen (Flagship)
            </Link>
          </div>

          {/* Group 2: Event Guide & Heritage */}
          <div className="space-y-1 pt-2 border-t border-maroon">
            <div className="text-[10px] font-bold uppercase tracking-wider text-antique-gold px-3 py-1">
              Competition Guide
            </div>
            <Link
              href="/culture"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-xs font-semibold ${
                isActive("/culture") ? "bg-maroon text-antique-gold" : "text-stone-200 hover:bg-maroon/60"
              }`}
            >
              Culture &amp; Heritage
            </Link>
            <Link
              href="/rules"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-xs font-semibold ${
                isActive("/rules") ? "bg-maroon text-antique-gold" : "text-stone-200 hover:bg-maroon/60"
              }`}
            >
              Rules &amp; Guidelines
            </Link>
            <Link
              href="/faq"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-xs font-semibold ${
                isActive("/faq") ? "bg-maroon text-antique-gold" : "text-stone-200 hover:bg-maroon/60"
              }`}
            >
              Frequently Asked Questions (FAQ)
            </Link>
          </div>

          {/* Group 3: Support & Contact */}
          <div className="space-y-1 pt-2 border-t border-maroon">
            <div className="text-[10px] font-bold uppercase tracking-wider text-antique-gold px-3 py-1">
              Support &amp; Desk
            </div>
            <Link
              href="/registration-status"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-stone-200 hover:bg-maroon/60"
            >
              <span>Application Status Lookup</span>
              <Search className="w-3.5 h-3.5 text-antique-gold" />
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-xs font-semibold ${
                isActive("/contact") ? "bg-maroon text-antique-gold" : "text-stone-200 hover:bg-maroon/60"
              }`}
            >
              Contact Desk
            </Link>
          </div>

          {/* Big Mobile CTA */}
          <div className="pt-3 border-t border-maroon">
            <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="block">
              <Button className="w-full bg-saffron hover:bg-saffron-dark text-white font-black text-xs h-11 justify-between shadow-md rounded-xl">
                <span>Register for Mithila Queen</span>
                <span className="font-mono text-xs font-black bg-black/20 px-2 py-0.5 rounded">
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

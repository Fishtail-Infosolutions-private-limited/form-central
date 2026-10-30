"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Search, ArrowRight, ShieldCheck, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OriginFoundationLogo, MithilaQueenLogo } from "@/components/brand/brand-logos";

export function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About Foundation", href: "/about" },
    { label: "Mithila Queen", href: "/mithila-queen" },
    { label: "Culture & Heritage", href: "/culture" },
    { label: "Rules & Guidelines", href: "/rules" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact Desk", href: "/contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0A192F] text-[#FDFBF7] border-b border-[#243B53] shadow-[0_4px_20px_rgba(10,25,47,0.25)]">
      {/* Top Institutional Notification Bar */}
      <div className="bg-[#071120] px-4 py-2 text-[11px] border-b border-[#243B53]/50 text-[#E9E2D5]">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[#C5A880]">
              <MapPin className="w-3.5 h-3.5" />
              <span className="font-semibold tracking-wider uppercase text-[10px]">
                Janakpur Dham &bull; Nepal
              </span>
            </div>
            <span className="text-[#243B53] hidden sm:inline">&bull;</span>
            <span className="text-[#E9E2D5]/80 hidden md:inline font-serif italic">
              &ldquo;Rooted in Identity. Driven by Purpose.&rdquo;
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <a
              href="mailto:originfoundation107@gmail.com"
              className="hidden lg:flex items-center gap-1.5 text-[#E9E2D5]/80 hover:text-[#C5A880] transition-colors"
            >
              <Mail className="w-3 h-3 text-[#C5A880]" />
              <span className="font-mono text-[10.5px]">originfoundation107@gmail.com</span>
            </a>
            <span className="text-[#243B53] hidden lg:inline">&bull;</span>
            <Link
              href="/registration-status"
              className="text-[#E9E2D5] hover:text-[#C5A880] transition-colors flex items-center gap-1.5 font-medium tracking-wide bg-[#243B53]/40 px-2.5 py-0.5 rounded-full border border-[#C5A880]/30"
            >
              <Search className="w-3 h-3 text-[#C5A880]" />
              <span>Applicant Status Lookup</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Dual Brand Identity */}
        <div className="flex items-center gap-3 sm:gap-6">
          <Link href="/" className="hover:opacity-95 transition-opacity">
            <OriginFoundationLogo variant="full" theme="light" />
          </Link>

          <div className="hidden xl:block h-8 w-px bg-[#243B53]" />

          <div className="hidden xl:block">
            <Link href="/mithila-queen">
              <MithilaQueenLogo variant="badge" theme="light" />
            </Link>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3 py-1.5 text-xs font-medium tracking-wide rounded-lg transition-all duration-150 ${
                  active
                    ? "text-[#C5A880] bg-[#243B53]/60 font-semibold"
                    : "text-[#E9E2D5] hover:text-[#FFFFFF] hover:bg-[#243B53]/35"
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#C5A880] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Primary Action */}
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/register">
            <Button className="bg-[#C5A880] hover:bg-[#b8986d] text-[#0A192F] font-bold text-xs h-10 px-4 rounded-xl shadow-[0_2px_10px_rgba(197,168,128,0.25)] transition-all flex items-center gap-2 group">
              <span>Register Now</span>
              <span className="text-[10px] bg-[#0A192F]/15 px-1.5 py-0.5 rounded font-mono font-bold">
                NPR 399
              </span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2.5 rounded-xl text-[#E9E2D5] hover:text-[#FFFFFF] hover:bg-[#243B53] border border-[#243B53] transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#243B53] bg-[#0A192F] px-4 pt-4 pb-7 space-y-4 shadow-xl">
          <div className="p-3 rounded-2xl bg-[#071120] border border-[#243B53] mb-3">
            <MithilaQueenLogo variant="stacked" theme="light" />
          </div>

          <div className="flex flex-col space-y-1">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-[#243B53] text-[#C5A880] font-bold"
                    : "text-[#E9E2D5] hover:bg-[#243B53]/40"
                }`}
              >
                {item.label}
              </Link>
            ))}

            <Link
              href="/registration-status"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#C5A880] hover:bg-[#243B53]/40 flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-[#C5A880]" />
              <span>Check Application Status</span>
            </Link>
          </div>

          <div className="pt-3 border-t border-[#243B53] flex flex-col gap-2.5">
            <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-[#C5A880] hover:bg-[#b8986d] text-[#0A192F] font-bold text-sm h-11 justify-center gap-2 rounded-xl">
                <span>Register for Mithila Queen</span>
                <span className="text-xs bg-[#0A192F]/15 px-2 py-0.5 rounded font-mono">
                  NPR 399
                </span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <div className="text-center pt-2 flex items-center justify-between text-[11px] text-[#E9E2D5]/70 px-1">
              <span>Janakpur Dham &bull; Asia/Kathmandu</span>
              <Link
                href="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#C5A880] transition-colors"
              >
                Admin Access &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

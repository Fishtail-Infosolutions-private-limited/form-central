"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Crown, Search, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Mithila Queen", href: "/mithila-queen" },
    { label: "Culture & Heritage", href: "/culture" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0A192F] text-[#FDFBF7] border-b border-[#243B53]/80 shadow-md">
      {/* Top micro bar with cultural identity */}
      <div className="bg-[#071120] px-4 py-1.5 text-[11px] border-b border-[#243B53]/40 text-[#C5A880] flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold tracking-wide">Janakpur Dham, Nepal</span>
            <span className="text-[#243B53]">•</span>
            <span className="text-[#E9E2D5]/80 hidden sm:inline">Rooted in Identity. Driven by Purpose.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/registration-status"
              className="text-[#E9E2D5] hover:text-[#C5A880] transition-colors flex items-center gap-1 font-medium"
            >
              <Search className="w-3 h-3 text-[#C5A880]" />
              <span>Check Application Status</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0A192F] to-[#243B53] border border-[#C5A880]/60 flex items-center justify-center text-[#C5A880] shadow-inner shrink-0 group-hover:border-[#C5A880] transition-colors">
            <Crown className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-[#FDFBF7] font-serif">
                The Origin Foundation
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/30 px-1.5 py-0.2 rounded">
                Janakpur
              </span>
            </div>
            <span className="text-[11px] text-[#C5A880] tracking-wide font-medium">
              Mithila Queen • Official Platform
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 text-xs font-medium tracking-wide rounded-lg transition-all ${
                isActive(item.href)
                  ? "text-[#C5A880] bg-[#243B53]/50 font-semibold"
                  : "text-[#E9E2D5] hover:text-[#FFFFFF] hover:bg-[#243B53]/30"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Call to Action */}
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/register">
            <Button className="bg-[#C5A880] hover:bg-[#b8986d] text-[#0A192F] font-bold text-xs h-10 px-4 rounded-xl shadow-xs transition-all flex items-center gap-1.5">
              <span>Register Now</span>
              <span className="text-[10px] bg-[#0A192F]/10 px-1.5 py-0.5 rounded font-mono font-bold">NPR 399</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-[#E9E2D5] hover:text-[#FFFFFF] hover:bg-[#243B53]"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#243B53] bg-[#0A192F] px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-1">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium ${
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
              className="px-3 py-2.5 rounded-lg text-sm font-medium text-[#C5A880] hover:bg-[#243B53]/40 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Check Registration Status</span>
            </Link>
          </div>

          <div className="pt-3 border-t border-[#243B53]/60 flex flex-col gap-2">
            <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-[#C5A880] hover:bg-[#b8986d] text-[#0A192F] font-bold text-sm h-11 justify-center gap-2">
                <span>Register for Mithila Queen</span>
                <span className="text-xs bg-[#0A192F]/15 px-2 py-0.5 rounded font-mono">NPR 399</span>
              </Button>
            </Link>
            <div className="text-center pt-2">
              <Link
                href="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[11px] text-[#E9E2D5]/60 hover:text-[#C5A880] transition-colors"
              >
                Origin Foundation Admin Portal
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}


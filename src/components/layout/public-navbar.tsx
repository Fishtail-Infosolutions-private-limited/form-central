"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Search, ArrowRight, Mail, MapPin } from "lucide-react";
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
    { label: "Status Lookup", href: "/registration-status" },
    { label: "Contact Desk", href: "/contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#292821] text-[#F5F0E6] border-b border-[#3C332A] shadow-[0_2px_12px_rgba(41,40,33,0.18)]">
      {/* Top Institutional Bar */}
      <div className="bg-[#1E1D18] px-4 py-2 text-[11px] border-b border-[#3C332A]/70 text-[#E8DFD0]">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[#B69A65]">
              <MapPin className="w-3.5 h-3.5" />
              <span className="font-semibold tracking-wider uppercase text-[10px]">
                Janakpur Dham &bull; Nepal
              </span>
            </div>
            <span className="text-[#3C332A] hidden sm:inline">&bull;</span>
            <span className="text-[#E8DFD0]/80 hidden md:inline font-serif italic">
              &ldquo;Rooted in Identity. Driven by Purpose.&rdquo;
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <a
              href="mailto:originfoundation107@gmail.com"
              className="hidden lg:flex items-center gap-1.5 text-[#E8DFD0]/80 hover:text-[#B69A65] transition-colors"
            >
              <Mail className="w-3 h-3 text-[#B69A65]" />
              <span className="font-mono text-[10.5px]">originfoundation107@gmail.com</span>
            </a>
            <span className="text-[#3C332A] hidden lg:inline">&bull;</span>
            <Link
              href="/registration-status"
              className="text-[#F5F0E6] hover:text-[#B69A65] transition-colors flex items-center gap-1.5 font-medium tracking-wide bg-[#3C332A]/70 px-2.5 py-0.5 rounded border border-[#B69A65]/40 text-xs"
            >
              <Search className="w-3 h-3 text-[#B69A65]" />
              <span>Status Lookup</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Dual Brand Identity */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className="hover:opacity-95 transition-opacity">
            <OriginFoundationLogo variant="full" theme="light" />
          </Link>

          <div className="hidden xl:block h-7 w-px bg-[#3C332A]" />

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
                className={`relative px-3 py-1.5 text-xs font-medium tracking-wide rounded transition-all duration-150 ${
                  active
                    ? "text-[#B69A65] bg-[#3C332A] font-semibold"
                    : "text-[#E8DFD0] hover:text-[#FFFFFF] hover:bg-[#3C332A]/50"
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#B69A65]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Primary Action */}
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/register">
            <Button className="bg-[#B69A65] hover:bg-[#a68c59] text-[#292821] font-bold text-xs h-10 px-4 rounded shadow-none transition-all flex items-center gap-2 group">
              <span>Register Now</span>
              <span className="text-[10px] bg-[#292821]/15 px-1.5 py-0.5 rounded font-mono font-bold">
                NPR 399
              </span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded text-[#E8DFD0] hover:text-[#FFFFFF] hover:bg-[#3C332A] border border-[#3C332A] transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#3C332A] bg-[#292821] px-4 pt-4 pb-7 space-y-4 shadow-xl">
          <div className="p-3 rounded bg-[#1E1D18] border border-[#3C332A] mb-3">
            <MithilaQueenLogo variant="stacked" theme="light" />
          </div>

          <div className="flex flex-col space-y-1">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded text-xs font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-[#3C332A] text-[#B69A65] font-semibold"
                    : "text-[#E8DFD0] hover:bg-[#3C332A]/50 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-[#3C332A]">
            <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="block">
              <Button className="w-full bg-[#B69A65] hover:bg-[#a68c59] text-[#292821] font-bold text-xs h-11 justify-between shadow-none">
                <span>Register for Mithila Queen</span>
                <span className="font-mono text-xs font-semibold">NPR 399</span>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

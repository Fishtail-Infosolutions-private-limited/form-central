"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Search,
  ArrowRight,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  HelpCircle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OriginFoundationLogo } from "@/components/brand/brand-logos";
import { getPublicSiteSettingsAction } from "@/server/actions/site-settings-actions";

export function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [registrationFee, setRegistrationFee] = useState<number>(399);
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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Mithila Queen", href: "/mithila-queen" },
    { label: "FAQs", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#DCE5ED] shadow-xs">
      {/* Top Institutional Information Bar */}
      <div className="bg-[#F4F7FA] border-b border-[#DCE5ED] px-4 py-2 text-xs text-[#263238]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-medium text-[#183153]">
              <MapPin className="w-3.5 h-3.5 text-[#356FA8]" />
              <span className="font-semibold text-[11px] uppercase tracking-wider">
                Janakpur Dham &bull; Nepal
              </span>
            </div>
            <span className="text-[#DCE5ED] hidden sm:inline">&bull;</span>
            <span className="text-[#546E7A] hidden md:inline text-[11px]">
              The Origin Foundation &bull; Cultural Initiative
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <a
              href="mailto:originfoundation107@gmail.com"
              className="hidden lg:flex items-center gap-1.5 text-[#546E7A] hover:text-[#183153] transition-colors"
            >
              <Mail className="w-3 h-3 text-[#356FA8]" />
              <span>originfoundation107@gmail.com</span>
            </a>
            <span className="text-[#DCE5ED] hidden lg:inline">&bull;</span>
            <a
              href="tel:+9779704571941"
              className="hidden sm:flex items-center gap-1.5 text-[#546E7A] hover:text-[#183153] transition-colors"
            >
              <Phone className="w-3 h-3 text-[#356FA8]" />
              <span>+977 9704571941</span>
            </a>
            <span className="text-[#DCE5ED] hidden sm:inline">&bull;</span>
            <Link
              href="/registration-status"
              className="inline-flex items-center gap-1 text-[#356FA8] hover:text-[#183153] font-semibold text-[11px]"
            >
              <Search className="w-3 h-3" />
              <span>Status Lookup</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4">
        {/* Brand Logo - Compact and clean */}
        <Link href="/" className="shrink-0 flex items-center hover:opacity-95 transition-opacity">
          <OriginFoundationLogo variant="full" theme="dark" size="sm" />
        </Link>

        {/* Clear Desktop Navigation: Home, About, Mithila Queen, FAQs, Contact */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors ${
                  active
                    ? "text-[#183153] bg-[#F4F7FA] font-bold"
                    : "text-[#263238] hover:text-[#183153] hover:bg-[#F4F7FA]/70"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Quick Actions: Check Application Status & Register Now */}
        <div className="hidden sm:flex items-center gap-2.5 shrink-0">
          <Link href="/registration-status">
            <Button
              variant="outline"
              size="sm"
              className="h-10 px-4 text-xs font-semibold border-[#DCE5ED] text-[#263238] hover:bg-[#F4F7FA] hover:text-[#183153] gap-1.5 shadow-none"
            >
              <Search className="w-3.5 h-3.5 text-[#356FA8]" />
              <span>Check Status</span>
            </Button>
          </Link>

          <Link href="/register">
            <Button
              size="sm"
              className="h-10 px-5 text-xs font-bold bg-[#183153] hover:bg-[#12243D] text-white gap-2 shadow-xs"
            >
              <span>Register Now</span>
              <span className="text-[10px] bg-[#356FA8] px-1.5 py-0.5 rounded text-white font-mono">
                NPR {registrationFee}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-md border border-[#DCE5ED] text-[#263238] hover:bg-[#F4F7FA]"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#DCE5ED] bg-white px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-150 shadow-md">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-md text-sm font-semibold transition-colors ${
                    active
                      ? "bg-[#F4F7FA] text-[#183153] font-bold"
                      : "text-[#263238] hover:bg-[#F4F7FA]/70"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-[#DCE5ED] flex flex-col gap-2.5">
            <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full h-11 text-xs font-bold bg-[#183153] hover:bg-[#12243D] text-white gap-2 justify-center">
                <span>Register for Mithila Queen</span>
                <span className="text-[10px] bg-[#356FA8] px-1.5 py-0.5 rounded text-white font-mono">
                  NPR {registrationFee}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>

            <Link href="/registration-status" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant="outline"
                className="w-full h-10 text-xs font-semibold border-[#DCE5ED] text-[#263238] hover:bg-[#F4F7FA] justify-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5 text-[#356FA8]" />
                <span>Check Application Status</span>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

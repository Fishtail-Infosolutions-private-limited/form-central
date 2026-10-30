import React from "react";
import Link from "next/link";
import { getCurrentAdmin } from "@/lib/auth/guards";
import {
  Trophy,
  ArrowRight,
  ShieldCheck,
  HardDrive,
  FileText,
  MailCheck,
  CheckCircle2,
  Layers,
  Sparkles,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Form Central — Event & Registration Platform",
  description:
    "Unified registration and dynamic form management system for competitions, hackathons, sports events, workshops, and participant logistics.",
};

export default async function HomePage() {
  const admin = await getCurrentAdmin();

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col selection:bg-emerald-600 selection:text-white">
      {/* Navigation Bar */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-black leading-none">
                Form Central
              </span>
              <span className="text-[10px] text-zinc-500 font-medium tracking-wide">
                Registration System
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-600">
            <a href="#how-it-works" className="hover:text-emerald-700 transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-emerald-700 transition-colors">
              Capabilities
            </a>
            <a href="#architecture" className="hover:text-emerald-700 transition-colors">
              Architecture
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {admin ? (
              <Link href="/admin/dashboard">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 gap-1.5 px-4 shadow-xs">
                  <span>Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            ) : (
              <Link href="/admin/login">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 gap-1.5 px-4 shadow-xs">
                  <span>Login</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 border-b border-zinc-200 bg-zinc-50/60">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-black tracking-tight leading-tight">
              Structured registration workflows for sports, hackathons & competitions
            </h1>

            <p className="mt-4 text-sm sm:text-base text-zinc-600 max-w-2xl mx-auto leading-relaxed">
              Deploy multi-step registration forms with instant email OTP verification, document
              collection, and private Google Drive video storage without requiring participant accounts.
            </p>

            <div className="mt-8 flex items-center justify-center">
              <Link href={admin ? "/admin/dashboard" : "/admin/login"}>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-10 px-8 gap-2 shadow-xs">
                  <span>{admin ? "Open Command Center" : "Login"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* New Section: 3-Step Registration Architecture */}
        <section id="how-it-works" className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl font-extrabold text-black tracking-tight">
              How Form Central Works
            </h2>
            <p className="text-xs text-zinc-500 mt-1.5">
              A streamlined, high-throughput pipeline engineered for event administrators and participants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl border border-zinc-200 bg-white shadow-xs space-y-3 relative">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center">
                1
              </div>
              <h3 className="font-bold text-base text-zinc-900">
                Design & Activate Forms
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Build multi-step forms with text inputs, category selectors, required document uploads,
                and custom questions using the visual canvas. Activate or deactivate forms with a single click.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl border border-zinc-200 bg-white shadow-xs space-y-3 relative">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center">
                2
              </div>
              <h3 className="font-bold text-base text-zinc-900">
                Passwordless OTP Verification
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Participants verify their email with an instant 6-digit one-time code. No account creation,
                no passwords, and zero spam entries in your participant registry.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl border border-zinc-200 bg-white shadow-xs space-y-3 relative">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center">
                3
              </div>
              <h3 className="font-bold text-base text-zinc-900">
                Cloud Ingestion & Review
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Participant videos stream directly into your private Google Drive folder. Inspect submissions,
                play videos in-site, filter read/unread entries, and send notices directly to participants.
              </p>
            </div>
          </div>
        </section>

        {/* Platform Capabilities */}
        <section id="features" className="py-16 border-t border-zinc-200 bg-zinc-50/60">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-xl mx-auto mb-12">
              <h2 className="text-2xl font-extrabold text-black tracking-tight">
                Designed for Reliability & Performance
              </h2>
              <p className="text-xs text-zinc-500 mt-1.5">
                Built specifically to solve high-volume registration logistics with clean administrative controls.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-xl border border-zinc-200 bg-white shadow-xs space-y-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <MailCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-black">Email OTP Verification</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Eliminates fake emails and sign-up passwords. Registrants enter their email and verify
                  instantly with a secure 6-digit code.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-zinc-200 bg-white shadow-xs space-y-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-black">Dynamic Multi-Step Forms</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Organize questions into structured steps. Capture custom fields, file attachments, and
                  participant categories with instant client validation.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-zinc-200 bg-white shadow-xs space-y-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <HardDrive className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-black">Google Drive Cloud Storage</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Submitted participant videos stream securely into your connected Google Drive folder,
                  keeping your application server lightweight and scalable.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Single Administrator Security Section */}
        <section id="architecture" className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="p-8 rounded-2xl border border-zinc-200 bg-zinc-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-2 max-w-xl">
              <h3 className="text-xl font-bold text-white">
                Centralized Administrative Command Center
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Full authority over event registration schemas, submission verification status,
                in-site video playback, and automated participant email delivery.
              </p>
            </div>

            <Link href={admin ? "/admin/dashboard" : "/admin/login"} className="shrink-0">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-10 px-6 gap-2">
                <span>{admin ? "Go to Dashboard" : "Login"}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-emerald-600 text-white flex items-center justify-center">
              <Trophy className="w-3 h-3" />
            </div>
            <span className="font-bold text-black">Form Central</span>
            <span>&bull;</span>
            <span>Fishtail Info Solutions</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Next.js 16</span>
            <span>PostgreSQL</span>
            <span>Google Drive API v3</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

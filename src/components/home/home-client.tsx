"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  Play,
  Download,
  Check,
  X,
  ChevronDown,
  Calendar,
  Clock,
  ExternalLink,
  Zap,
  Server,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";

interface HomeClientProps {
  admin: {
    id: string;
    email: string;
  } | null;
}

export function HomeClient({ admin }: HomeClientProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Smooth scroll handler using standard window scroll with header offset
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const el = document.getElementById(targetId);
    if (el) {
      const yOffset = -70;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // GSAP Entrance Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".gsap-hero-title",
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      );
      gsap.fromTo(
        ".gsap-hero-desc",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.15, ease: "power2.out" }
      );
      gsap.fromTo(
        ".gsap-hero-actions",
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: "power2.out" }
      );
    });

    return () => ctx.revert();
  }, []);

  const faqs = [
    {
      q: "Do participants need to create an account or password to register?",
      a: "No. Form Central uses passwordless email OTP verification. Participants simply enter their verified email address, receive an instant 6-digit code via SMTP, and complete their registration with zero friction and zero spam accounts.",
    },
    {
      q: "How does Google Drive video ingestion work for competitions?",
      a: "When a participant submits an audition, sprint demo, or pitch video, the file streams directly to your connected Google Drive storage folder via Google Drive API v3. Your application server remains fast, lightweight, and completely unburdened by multi-gigabyte video files.",
    },
    {
      q: "Can I watch uploaded participant videos without leaving Form Central?",
      a: "Yes. Form Central includes an in-site video player modal. Administrators can inspect any registration and play high-definition participant videos directly inside the dashboard with standard playback controls.",
    },
    {
      q: "What happens when a participant or admin replaces or deletes a file?",
      a: "Form Central features automated physical storage cleanup. When a participant replaces an uploaded photo, video, or document before submitting, or when an administrator deletes a form or submission, all associated physical files on disk or in Google Drive are automatically purged.",
    },
    {
      q: "Can system questions like Name, Email, or Phone be made optional?",
      a: "Yes. In the visual form builder, all fields (including default system questions) feature a dynamic required toggle so administrators can configure forms specifically for any event or competition format.",
    },
    {
      q: "How does submission read tracking and email notices work?",
      a: "Whenever an administrator clicks or inspects a submission, Form Central automatically marks it as Read. From the inspection drawer, administrators can also compose and dispatch customized email updates or rejection notices directly to the participant's verified inbox.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col selection:bg-#0A192F selection:text-white">
      {/* Navigation Bar */}
      <header className="border-b border-zinc-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-#0A192F text-white flex items-center justify-center shadow-xs">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-black leading-none">
                Form Central
              </span>
              <span className="text-[10px] text-zinc-500 font-medium tracking-wide">
                Registration Platform
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-600">
            <a
              href="#how-it-works"
              onClick={(e) => scrollToSection(e, "how-it-works")}
              className="hover:text-#0A192F transition-colors cursor-pointer"
            >
              How It Works
            </a>
            <a
              href="#capabilities"
              onClick={(e) => scrollToSection(e, "capabilities")}
              className="hover:text-#0A192F transition-colors cursor-pointer"
            >
              Capabilities
            </a>
            <a
              href="#comparison"
              onClick={(e) => scrollToSection(e, "comparison")}
              className="hover:text-#0A192F transition-colors cursor-pointer"
            >
              Comparison
            </a>
            <a
              href="#architecture"
              onClick={(e) => scrollToSection(e, "architecture")}
              className="hover:text-#0A192F transition-colors cursor-pointer"
            >
              Architecture
            </a>
            <a
              href="#faq"
              onClick={(e) => scrollToSection(e, "faq")}
              className="hover:text-#0A192F transition-colors cursor-pointer"
            >
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {admin ? (
              <Link href="/admin/dashboard">
                <Button className="bg-#0A192F hover:bg-#0A192F text-white font-bold text-xs h-9 gap-1.5 px-4 shadow-xs">
                  <span>Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            ) : (
              <Link href="/admin/login">
                <Button className="bg-#0A192F hover:bg-#0A192F text-white font-bold text-xs h-9 gap-1.5 px-4 shadow-xs">
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
        <section className="py-16 md:py-24 border-b border-zinc-200 bg-zinc-50/70">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-#F8FAFC text-#0A192F text-xs font-bold tracking-wide uppercase mb-6">
              <span className="w-2 h-2 rounded-full bg-#0A192F animate-pulse" />
              <span>Event & Competition Infrastructure</span>
            </div>

            <h1 className="gsap-hero-title text-3xl sm:text-4xl md:text-5xl font-extrabold text-black tracking-tight leading-tight">
              Structured registration workflows for sports, hackathons & competitions
            </h1>

            <p className="gsap-hero-desc mt-4 text-sm sm:text-base text-zinc-600 max-w-2xl mx-auto leading-relaxed">
              Deploy multi-step registration forms with instant email OTP verification, multi-format media
              uploads, and private Google Drive video storage without requiring participant accounts.
            </p>

            <div className="gsap-hero-actions mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href={admin ? "/admin/dashboard" : "/admin/login"}>
                <Button className="bg-#0A192F hover:bg-#0A192F text-white font-bold text-xs h-10 px-8 gap-2 shadow-xs w-full sm:w-auto">
                  <span>{admin ? "Open Command Center" : "Admin Login"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <a
                href="#how-it-works"
                onClick={(e) => scrollToSection(e, "how-it-works")}
                className="w-full sm:w-auto"
              >
                <Button
                  variant="outline"
                  className="text-xs font-semibold h-10 px-6 border-zinc-300 text-zinc-800 hover:bg-white w-full sm:w-auto"
                >
                  <span>Explore Workflow</span>
                </Button>
              </a>
            </div>

            {/* Metrics Ticker */}
            <div className="mt-12 pt-8 border-t border-zinc-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
              <div className="p-3 bg-white rounded-xl border border-zinc-200">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
                  Authentication
                </span>
                <span className="font-extrabold text-sm text-black">100% Passwordless</span>
                <p className="text-[11px] text-zinc-500 mt-0.5">Instant 6-digit email OTP</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-zinc-200">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
                  Cloud Media
                </span>
                <span className="font-extrabold text-sm text-black">Google Drive API</span>
                <p className="text-[11px] text-zinc-500 mt-0.5">Direct video stream storage</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-zinc-200">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
                  Submission Status
                </span>
                <span className="font-extrabold text-sm text-black">Auto Read Tracking</span>
                <p className="text-[11px] text-zinc-500 mt-0.5">Automatic inspection logs</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-zinc-200">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
                  Data Portability
                </span>
                <span className="font-extrabold text-sm text-black">Excel & CSV Export</span>
                <p className="text-[11px] text-zinc-500 mt-0.5">1-click formatted download</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1: How It Works */}
        <section id="how-it-works" className="py-20 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">
              How Form Central Works
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-2">
              An event logistics pipeline engineered for organizers and participants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="p-6 rounded-2xl border border-zinc-200 bg-white shadow-xs space-y-3.5 relative hover:border-#C5A880 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-#0A192F text-white font-black text-sm flex items-center justify-center shadow-xs">
                1
              </div>
              <h3 className="font-bold text-base text-black">
                Design & Activate Forms
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Build multi-step forms with rich text descriptions, participant instructions, category
                selectors, date & time pickers, and custom questions. Activate or deactivate forms with a single click.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="p-6 rounded-2xl border border-zinc-200 bg-white shadow-xs space-y-3.5 relative hover:border-#C5A880 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-#0A192F text-white font-black text-sm flex items-center justify-center shadow-xs">
                2
              </div>
              <h3 className="font-bold text-base text-black">
                Passwordless OTP Verification
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Participants verify their email with an instant 6-digit one-time code. No passwords, no
                account friction, and zero spam entries cluttering your competition registry.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="p-6 rounded-2xl border border-zinc-200 bg-white shadow-xs space-y-3.5 relative hover:border-#C5A880 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-#0A192F text-white font-black text-sm flex items-center justify-center shadow-xs">
                3
              </div>
              <h3 className="font-bold text-base text-black">
                Cloud Ingestion & Command
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Participant videos stream securely into your connected Google Drive folder. Inspect submissions,
                watch videos in-site, filter read/unread entries, and dispatch status emails.
              </p>
            </motion.div>
          </div>
        </section>

        {/* SECTION 2: Capabilities Grid */}
        <section id="capabilities" className="py-20 border-t border-zinc-200 bg-zinc-50/60">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-xl mx-auto mb-14">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">
                Engineered for High-Volume Event Operations
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 mt-2">
                Every tool needed to run sports tournaments, hackathons, and auditions smoothly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl border border-zinc-200 bg-white shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-#F8FAFC text-#0A192F flex items-center justify-center">
                  <MailCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-black">Email OTP Verification</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Eliminates invalid participant contact details. Codes are delivered in milliseconds with
                  resend cooldowns and rate protection.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-zinc-200 bg-white shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-#F8FAFC text-#0A192F flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-black">Dynamic Multi-Step Forms</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Split registration into logical steps: Personal Details, Entry Category, Media Uploads,
                  and a comprehensive Verification Review.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-zinc-200 bg-white shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-#F8FAFC text-#0A192F flex items-center justify-center">
                  <HardDrive className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-black">Google Drive Cloud Storage</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Large video submissions upload straight into your chosen Google Drive folder with automatic
                  refresh tokens and storage safeguards.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-zinc-200 bg-white shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-#F8FAFC text-#0A192F flex items-center justify-center">
                  <Play className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-black">In-Site Video Playback</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Review audition reels, performance clips, or pitch decks right in the admin drawer without
                  navigating away to external tabs.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-zinc-200 bg-white shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-#F8FAFC text-#0A192F flex items-center justify-center">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-black">Automated Physical Cleanup</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  When participants change an uploaded document or video, old physical files on disk and Google
                  Drive are purged immediately.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-zinc-200 bg-white shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-#F8FAFC text-#0A192F flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-black">Excel (.xlsx) Data Export</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Export registration logs with participant names, references, verified emails, phone numbers,
                  and all custom dynamic answers with 1 click.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: Platform Comparison Table */}
        <section id="comparison" className="py-20 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">
              Why Organizers Choose Form Central
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-2">
              See how Form Central compares against generic form tools.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200">
                    <th className="py-4 px-5 font-bold text-zinc-600 uppercase tracking-wider">
                      Feature & Capability
                    </th>
                    <th className="py-4 px-5 font-extrabold text-#0A192F bg-#F8FAFC/70 border-x border-#E2E8F0">
                      Form Central
                    </th>
                    <th className="py-4 px-5 font-semibold text-zinc-600">Google Forms</th>
                    <th className="py-4 px-5 font-semibold text-zinc-600">Typeform</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  <tr>
                    <td className="py-3.5 px-5 font-semibold text-black">
                      Video Storage & Streaming
                    </td>
                    <td className="py-3.5 px-5 font-bold text-#0A192F bg-#F8FAFC/40 border-x border-#E2E8F0">
                      Direct Private Google Drive API
                    </td>
                    <td className="py-3.5 px-5 text-zinc-500">Shared Google Account Quota</td>
                    <td className="py-3.5 px-5 text-zinc-500">Expensive Tiered Add-on</td>
                  </tr>

                  <tr>
                    <td className="py-3.5 px-5 font-semibold text-black">
                      Participant Authentication
                    </td>
                    <td className="py-3.5 px-5 font-bold text-#0A192F bg-#F8FAFC/40 border-x border-#E2E8F0">
                      Instant 6-Digit Email OTP
                    </td>
                    <td className="py-3.5 px-5 text-zinc-500">Mandatory Google Sign-in</td>
                    <td className="py-3.5 px-5 text-zinc-500">Unverified Email Field</td>
                  </tr>

                  <tr>
                    <td className="py-3.5 px-5 font-semibold text-black">
                      In-Site Video Playback
                    </td>
                    <td className="py-3.5 px-5 font-bold text-#0A192F bg-#F8FAFC/40 border-x border-#E2E8F0">
                      Native Embedded Modal
                    </td>
                    <td className="py-3.5 px-5 text-zinc-500">Opens Separate Google Drive Tab</td>
                    <td className="py-3.5 px-5 text-zinc-500">External Cloud Storage Only</td>
                  </tr>

                  <tr>
                    <td className="py-3.5 px-5 font-semibold text-black">
                      Submission Read Tracking
                    </td>
                    <td className="py-3.5 px-5 font-bold text-#0A192F bg-#F8FAFC/40 border-x border-#E2E8F0">
                      Automatic on Inspection
                    </td>
                    <td className="py-3.5 px-5 text-zinc-500">Manual Spreadsheet Editing</td>
                    <td className="py-3.5 px-5 text-zinc-500">Third-Party Zapier Webhook</td>
                  </tr>

                  <tr>
                    <td className="py-3.5 px-5 font-semibold text-black">
                      Direct Email Notice Delivery
                    </td>
                    <td className="py-3.5 px-5 font-bold text-#0A192F bg-#F8FAFC/40 border-x border-#E2E8F0">
                      Built-in SMTP Notice Dispatch
                    </td>
                    <td className="py-3.5 px-5 text-zinc-500">Requires Google Apps Script</td>
                    <td className="py-3.5 px-5 text-zinc-500">Requires Email Automation Plan</td>
                  </tr>

                  <tr>
                    <td className="py-3.5 px-5 font-semibold text-black">
                      File Replacement Cleanup
                    </td>
                    <td className="py-3.5 px-5 font-bold text-#0A192F bg-#F8FAFC/40 border-x border-#E2E8F0">
                      Automatic Physical Purge
                    </td>
                    <td className="py-3.5 px-5 text-zinc-500">Accumulates Waste in Trash</td>
                    <td className="py-3.5 px-5 text-zinc-500">Retains All Uploaded Files</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SECTION 4: Architecture & Security */}
        <section id="architecture" className="py-20 border-t border-zinc-200 bg-zinc-50/60">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-xl mx-auto mb-14">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">
                Security & Technical Architecture
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 mt-2">
                Built on modern web foundations for zero downtime and total administrative data ownership.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl border border-zinc-200 bg-white space-y-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-800 flex items-center justify-center">
                  <Server className="w-5 h-5 text-#0A192F" />
                </div>
                <h3 className="font-bold text-sm text-black">Isolated PostgreSQL Storage</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Every form, step, submission, and dynamic field is modeled in relational schema with Prisma ORM
                  and strict cascade integrity.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-zinc-200 bg-white space-y-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-800 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-#0A192F" />
                </div>
                <h3 className="font-bold text-sm text-black">Secure Google OAuth2 Engine</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Drive access credentials are encrypted at rest with automatic silent token rotation, ensuring
                  video ingestion never interrupts live registration.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-zinc-200 bg-white space-y-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-800 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-#0A192F" />
                </div>
                <h3 className="font-bold text-sm text-black">Lightweight Server Footprint</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  By offloading heavy participant media to cloud storage, the application maintains sub-50ms
                  response times even under peak event registration spikes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: Frequently Asked Questions */}
        <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-2">
              Everything you need to know about setting up and running registration workflows.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-zinc-200 bg-white overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-zinc-900 hover:text-#0A192F transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform ${
                        isOpen ? "rotate-180 text-#0A192F" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-4 sm:px-5 pb-5 pt-1 text-xs text-zinc-600 leading-relaxed border-t border-zinc-100">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="p-8 sm:p-10 rounded-2xl bg-black text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-zinc-800">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Ready to manage your next event registration?
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
                Create dynamic multi-step forms, stream videos to Google Drive, and track participant entries
                with zero spam and total administrative control.
              </p>
            </div>

            <Link href={admin ? "/admin/dashboard" : "/admin/login"} className="shrink-0">
              <Button className="bg-#0A192F hover:bg-#0A192F text-white font-extrabold text-xs h-11 px-8 gap-2 shadow-sm">
                <span>{admin ? "Enter Command Center" : "Login"}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-#0A192F text-white flex items-center justify-center">
              <Trophy className="w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold text-black">Form Central</span>
            <span>&bull;</span>
            <span>Fishtail Info Solutions</span>
          </div>

          <div className="flex items-center gap-6 text-[11px] text-zinc-400 font-medium">
            <span>Next.js 16</span>
            <span>PostgreSQL</span>
            <span>Google Drive API v3</span>
            <span>Tailwind CSS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}



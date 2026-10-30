"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Crown,
  FileText,
  CreditCard,
  Calendar,
  Info,
  ExternalLink,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  Upload,
  Loader2,
  Save,
  Plus,
  Trash2,
  Eye,
  Sliders,
  ShieldCheck,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Share2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { BuilderWorkspace } from "@/components/admin/form-builder/builder-workspace";
import { FormQrCard } from "@/components/admin/form-qr-card";
import { updateSiteSettingsAction } from "@/server/actions/site-settings-actions";
import { MithilaHeritageMandala } from "@/components/brand/brand-logos";
import { formatNepalDateTime } from "@/lib/utils/timezone";
import { FormSchemaDefinition } from "@/types/form";

interface CompetitionWorkspaceProps {
  form: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    status: string;
    versions: Array<{
      versionNumber: number;
      schema: any;
      status: string;
    }>;
  };
  siteSetting: any;
  stats: {
    totalRegs: number;
    completedRegs: number;
    verifiedPayments: number;
    appsUnderReview: number;
    approvedApps: number;
  };
}

export function CompetitionWorkspace({
  form,
  siteSetting,
  stats,
}: CompetitionWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "builder" | "payment" | "schedule" | "information" | "public_page"
  >("overview");

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingQr, setIsUploadingQr] = useState(false);

  // Payment Form States
  const [paymentProviderName, setPaymentProviderName] = useState(
    siteSetting?.paymentProviderName || "eSewa & Direct Bank Transfer"
  );
  const [esewaId, setEsewaId] = useState("9704571941 / The Origin Foundation");
  const [accountHolder, setAccountHolder] = useState("The Origin Foundation");
  const [bankName, setBankName] = useState("Nepal Bank Limited (Janakpur Branch)");
  const [accountNumber, setAccountNumber] = useState("01200100000000");
  const [paymentQrUrl, setPaymentQrUrl] = useState(
    siteSetting?.paymentQrCodeUrl || "/assets/brand/origin-foundation-qr.png"
  );
  const [paymentInstructions, setPaymentInstructions] = useState(
    siteSetting?.paymentInstructions ||
      "Please pay exactly NPR 399 via eSewa or Direct Bank Transfer. Take a clear screenshot of the transaction showing the transaction reference/code and attach it in Step 6 of registration."
  );
  const [paymentReferenceInstructions, setPaymentReferenceInstructions] = useState(
    siteSetting?.paymentReferenceInstructions ||
      "Enter your Full Name and Registered Mobile Number in the payment remarks/description."
  );

  // Schedule States
  const [isRegOpen, setIsRegOpen] = useState(siteSetting?.isRegistrationOpen ?? true);
  const [regOpeningDate, setRegOpeningDate] = useState<string>(
    siteSetting?.registrationOpeningDate
      ? new Date(siteSetting.registrationOpeningDate).toISOString().slice(0, 16)
      : ""
  );
  const [regClosingDate, setRegClosingDate] = useState<string>(
    siteSetting?.registrationClosingDate
      ? new Date(siteSetting.registrationClosingDate).toISOString().slice(0, 16)
      : ""
  );
  const [eventSchedule, setEventSchedule] = useState(siteSetting?.eventSchedule || "To Be Announced");
  const [eventVenue, setEventVenue] = useState(siteSetting?.eventVenue || "Janakpur Dham, Nepal");

  // Competition Info States
  const [compName, setCompName] = useState(siteSetting?.competitionName || "Mithila Queen");
  const [compTagline, setCompTagline] = useState(
    siteSetting?.competitionTagline || "Celebrating Mithila's Culture, Confidence & Talent."
  );
  const [regFee, setRegFee] = useState(siteSetting?.registrationFee?.toString() || "399");
  const [minAge, setMinAge] = useState("16");
  const [maxAge, setMaxAge] = useState("28");
  const [whatsappContact, setWhatsappContact] = useState(
    siteSetting?.whatsappContact || "+977 9704571941"
  );
  const [officialInstagram, setOfficialInstagram] = useState(
    siteSetting?.officialInstagram || "originfoundation.nepal"
  );
  const [officialTiktok, setOfficialTiktok] = useState(
    siteSetting?.officialTiktok || "@originfoundation"
  );
  const [videoGuidelines, setVideoGuidelines] = useState(
    siteSetting?.videoGuidelines ||
      "Record a 1-minute video introducing yourself, your connection to Mithila culture, and your unique talent. You can upload via the form or submit directly to our official WhatsApp helpline."
  );

  // FAQs
  const [faqs, setFaqs] = useState<Array<{ q: string; a: string }>>(
    (siteSetting?.faqsJson as any) || [
      {
        q: "What is The Origin Foundation?",
        a: "The Origin Foundation is a cultural organization headquartered in Janakpur Dham, dedicated to heritage preservation, women empowerment, and cultural competitions.",
      },
      {
        q: "What is Mithila Queen?",
        a: "Mithila Queen is the flagship cultural competition celebrating the talent, confidence, and heritage knowledge of young women aged 16 to 28.",
      },
      {
        q: "What is the registration fee?",
        a: "The registration fee is strictly NPR 399. No additional fees or hidden charges are required for registration.",
      },
      {
        q: "What if I am under 18 years old?",
        a: "Applicants aged 16-17 are fully welcome to participate with verified parental or legal guardian consent recorded in Step 2 of registration.",
      },
    ]
  );

  const latestVersion = form.versions?.[0];
  const initialSchema = (latestVersion?.schema as unknown as FormSchemaDefinition) || {
    steps: [],
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WebP)");
      return;
    }

    setIsUploadingQr(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fieldKey", "payment_qr");

      const res = await fetch("/api/public/upload/image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setPaymentQrUrl(data.url);
        toast.success("Payment QR image uploaded! Click 'Save Payment Settings' to apply.");
      } else {
        toast.error(data.error || "Failed to upload QR code");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setIsUploadingQr(false);
    }
  };

  const handleSaveSettings = async (section: string) => {
    setIsSaving(true);
    try {
      const res = await updateSiteSettingsAction({
        competitionName: compName,
        competitionTagline: compTagline,
        registrationFee: parseInt(regFee, 10) || 399,
        isRegistrationOpen: isRegOpen,
        registrationOpeningDate: regOpeningDate ? new Date(regOpeningDate) : null,
        registrationClosingDate: regClosingDate ? new Date(regClosingDate) : null,
        eventSchedule,
        eventVenue,
        paymentQrCodeUrl: paymentQrUrl,
        paymentProviderName,
        paymentInstructions,
        paymentReferenceInstructions,
        whatsappContact,
        officialInstagram,
        officialTiktok,
        videoGuidelines,
        faqsJson: faqs,
      });

      if (res.success) {
        toast.success(`${section} saved successfully! Public registration updated.`);
      } else {
        toast.error(res.error || "Failed to save settings");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const addFaq = () => {
    setFaqs([...faqs, { q: "New Question?", a: "Answer text goes here." }]);
  };

  const updateFaq = (index: number, field: "q" | "a", value: string) => {
    const updated = [...faqs];
    updated[index][field] = value;
    setFaqs(updated);
  };

  const removeFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const tabs = [
    { id: "overview", label: "1. Overview", icon: Crown },
    { id: "builder", label: "2. Form Builder", icon: FileText },
    { id: "payment", label: "3. Payment & QR", icon: CreditCard },
    { id: "schedule", label: "4. Schedule & Dates", icon: Calendar },
    { id: "information", label: "5. Competition Info", icon: Info },
    { id: "public_page", label: "6. Public Form & QR", icon: ExternalLink },
  ] as const;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-[#FFFFFF] p-6 rounded-lg border border-[#E8DFD0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MithilaHeritageMandala className="w-5 h-5 text-[#B69A65]" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#B69A65]">
              Dedicated Competition Workspace &bull; The Origin Foundation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#292821] tracking-tight">
            Manage Competition: Mithila Queen
          </h1>
          <p className="text-xs sm:text-sm text-[#292821]/70">
            One dedicated flagship competition. Customize questions, payment QR, dates, rules, and public preview.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/register/mithila-queen" target="_blank">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-[#E8DFD0] text-[#292821] hover:bg-[#FAF5EE] text-xs h-9 font-semibold"
            >
              <span>Test Live Form</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#A64B36]" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Structured Horizontal Workspace Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#E8DFD0]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-[#292821] text-[#F5F0E6] border border-[#B69A65]/40"
                  : "bg-[#FFFFFF] text-[#292821]/80 hover:bg-[#FAF5EE] border border-[#E8DFD0]"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#B69A65]" : "text-[#A64B36]"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-[#FFFFFF] rounded-lg border border-[#E8DFD0] p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DFD0]">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#B69A65]">
                  Flagship Competition Summary
                </span>
                <h2 className="text-xl font-serif font-bold text-[#292821]">
                  Mithila Queen 2026
                </h2>
                <p className="text-xs text-[#292821]/70">
                  Organized by <strong>The Origin Foundation</strong> &bull; Janakpur Dham, Nepal
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                    isRegOpen
                      ? "bg-[#292821] text-[#F5F0E6] border-[#B69A65]/40"
                      : "bg-[#FAF5EE] text-[#A64B36] border-[#A64B36]/30"
                  }`}
                >
                  {isRegOpen ? "Registration Open" : "Registration Closed"}
                </span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-md border border-[#E8DFD0] bg-[#FAF5EE]">
                <span className="text-[11px] text-zinc-500 font-medium">Official Entry Fee</span>
                <div className="text-2xl font-serif font-black text-[#292821] mt-1">NPR 399</div>
                <span className="text-[10px] text-zinc-400 font-mono">Enforced per brief</span>
              </div>

              <div className="p-4 rounded-md border border-[#E8DFD0] bg-[#FAF5EE]">
                <span className="text-[11px] text-zinc-500 font-medium">Total Registrations</span>
                <div className="text-2xl font-serif font-black text-[#292821] mt-1">{stats.totalRegs}</div>
                <span className="text-[10px] text-zinc-400 font-mono">All entries initiated</span>
              </div>

              <div className="p-4 rounded-md border border-[#E8DFD0] bg-[#FAF5EE]">
                <span className="text-[11px] text-zinc-500 font-medium">Completed Dossiers</span>
                <div className="text-2xl font-serif font-black text-[#292821] mt-1">{stats.completedRegs}</div>
                <span className="text-[10px] text-zinc-400 font-mono">Finished 7 steps</span>
              </div>

              <div className="p-4 rounded-md border border-[#E8DFD0] bg-[#FAF5EE]">
                <span className="text-[11px] text-zinc-500 font-medium">Verified Payments</span>
                <div className="text-2xl font-serif font-black text-[#292821] mt-1">{stats.verifiedPayments}</div>
                <span className="text-[10px] text-zinc-400 font-mono">Manually approved</span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#292821] mb-3">
                Workspace Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("builder")}
                  className="p-4 rounded-md border border-[#E8DFD0] bg-[#FFFFFF] hover:bg-[#FAF5EE] hover:border-[#B69A65] text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <FileText className="w-4 h-4 text-[#A64B36]" />
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="text-xs font-bold text-[#292821] mt-2">Edit Registration Form</div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Customize questions and steps in two-panel editor</p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("payment")}
                  className="p-4 rounded-md border border-[#E8DFD0] bg-[#FFFFFF] hover:bg-[#FAF5EE] hover:border-[#B69A65] text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <CreditCard className="w-4 h-4 text-[#B69A65]" />
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="text-xs font-bold text-[#292821] mt-2">Configure Payment & QR</div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Upload official QR code image and instructions</p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("schedule")}
                  className="p-4 rounded-md border border-[#E8DFD0] bg-[#FFFFFF] hover:bg-[#FAF5EE] hover:border-[#B69A65] text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <Calendar className="w-4 h-4 text-[#A64B36]" />
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="text-xs font-bold text-[#292821] mt-2">Manage Schedule & Dates</div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Set opening date, closing deadline, and venue</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REGISTRATION FORM BUILDER */}
      {activeTab === "builder" && (
        <div className="space-y-4">
          <BuilderWorkspace
            form={{
              id: form.id,
              name: form.name,
              slug: form.slug,
              description: form.description,
              status: form.status,
            }}
            initialSchema={initialSchema}
            publishedVersionNumber={latestVersion?.versionNumber}
          />
        </div>
      )}

      {/* TAB 3: PAYMENT CONFIGURATION */}
      {activeTab === "payment" && (
        <Card className="border-[#E8DFD0] bg-[#FFFFFF] shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-serif font-bold text-[#292821]">
                Official Payment Gateway & QR Configuration
              </CardTitle>
              <CardDescription className="text-xs text-[#292821]/70">
                Manage the official Mithila Queen payment QR code image, provider account details, and participant instructions.
              </CardDescription>
            </div>
            <Button
              onClick={() => handleSaveSettings("Payment Settings")}
              disabled={isSaving}
              className="gap-1.5 bg-[#292821] hover:bg-[#3C332A] text-[#F5F0E6] text-xs h-9 px-4 font-semibold border border-[#B69A65]/40"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#B69A65]" /> : <Save className="w-3.5 h-3.5 text-[#B69A65]" />}
              <span>Save Payment Settings</span>
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Official QR Code Upload Area */}
            <div className="p-5 rounded-md border border-[#E8DFD0] bg-[#FAF5EE] flex flex-col sm:flex-row items-center gap-6">
              <div className="relative w-44 h-44 bg-white border border-[#E8DFD0] rounded-lg p-2.5 shadow-xs shrink-0 flex items-center justify-center">
                {paymentQrUrl ? (
                  <Image
                    src={paymentQrUrl}
                    alt="Official Payment QR"
                    width={160}
                    height={160}
                    className="object-contain w-full h-full"
                    unoptimized
                  />
                ) : (
                  <div className="text-center p-2 text-zinc-400 text-xs">
                    No QR uploaded
                  </div>
                )}
              </div>
              <div className="space-y-3 flex-1 text-center sm:text-left">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#292821]">
                    Official Mithila Queen Payment QR Image
                  </h4>
                  <p className="text-xs text-[#292821]/70 mt-1 leading-relaxed">
                    This official QR is presented to every participant in Step 7 of registration and on their post-submission payment screen.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleQrUpload}
                      disabled={isUploadingQr}
                      className="hidden"
                    />
                    <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-[#292821] text-[#F5F0E6] text-xs font-semibold hover:bg-[#3C332A] transition-colors">
                      {isUploadingQr ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#B69A65]" />
                      ) : (
                        <Upload className="w-3.5 h-3.5 text-[#B69A65]" />
                      )}
                      <span>{isUploadingQr ? "Uploading..." : "Upload New QR Image"}</span>
                    </div>
                  </label>
                  {paymentQrUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPaymentQrUrl("/assets/brand/origin-foundation-qr.png")}
                      className="h-8 text-xs border-[#E8DFD0] text-[#292821] hover:bg-[#FFFFFF]"
                    >
                      Reset to Default QR
                    </Button>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 font-mono truncate max-w-md">
                  Active Asset: {paymentQrUrl}
                </p>
              </div>
            </div>

            {/* Provider and Account Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#292821]">Payment Provider Name</Label>
                <Input
                  value={paymentProviderName}
                  onChange={(e) => setPaymentProviderName(e.target.value)}
                  className="h-9 text-xs border-[#E8DFD0] bg-[#FAF5EE]"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#292821]">Official eSewa ID / Merchant Phone</Label>
                <Input
                  value={esewaId}
                  onChange={(e) => setEsewaId(e.target.value)}
                  className="h-9 text-xs border-[#E8DFD0] bg-[#FAF5EE] font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#292821]">Account Beneficiary Name</Label>
                <Input
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  className="h-9 text-xs border-[#E8DFD0] bg-[#FAF5EE]"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#292821]">Direct Bank Name & Branch</Label>
                <Input
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="h-9 text-xs border-[#E8DFD0] bg-[#FAF5EE]"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#292821]">Bank Account Number</Label>
                <Input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="h-9 text-xs border-[#E8DFD0] bg-[#FAF5EE] font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#292821]">Remarks / Transaction Reference Instructions</Label>
                <Input
                  value={paymentReferenceInstructions}
                  onChange={(e) => setPaymentReferenceInstructions(e.target.value)}
                  className="h-9 text-xs border-[#E8DFD0] bg-[#FAF5EE]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#292821]">Full Payment Instructions for Applicants</Label>
              <Textarea
                rows={3}
                value={paymentInstructions}
                onChange={(e) => setPaymentInstructions(e.target.value)}
                className="text-xs border-[#E8DFD0] bg-[#FAF5EE]"
              />
            </div>

            {/* Private Storage & Manual Verification Notice */}
            <div className="p-4 rounded-md bg-[#FAF5EE] border border-[#B69A65]/30 text-xs text-[#292821] flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#B69A65] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-[#292821]">
                  Private Screenshot Storage & Manual Verification Policy
                </div>
                <p className="text-[11px] text-[#292821]/70 leading-relaxed">
                  Participants upload transaction receipts and payment screenshots privately. Uploading a screenshot <strong>never</strong> automatically marks payment as verified. Administrators must inspect bank/eSewa statements and manually approve entries in the Applications portal.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: REGISTRATION SCHEDULE */}
      {activeTab === "schedule" && (
        <Card className="border-[#E8DFD0] bg-[#FFFFFF] shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-serif font-bold text-[#292821]">
                Registration Schedule & Event Timeline
              </CardTitle>
              <CardDescription className="text-xs text-[#292821]/70">
                Control the automated opening date, closing deadline, and event schedule in Nepal Standard Time (UTC+05:45).
              </CardDescription>
            </div>
            <Button
              onClick={() => handleSaveSettings("Schedule")}
              disabled={isSaving}
              className="gap-1.5 bg-[#292821] hover:bg-[#3C332A] text-[#F5F0E6] text-xs h-9 px-4 font-semibold border border-[#B69A65]/40"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#B69A65]" /> : <Save className="w-3.5 h-3.5 text-[#B69A65]" />}
              <span>Save Schedule</span>
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#292821]">Current Registration Status</Label>
                <select
                  value={isRegOpen ? "OPEN" : "CLOSED"}
                  onChange={(e) => setIsRegOpen(e.target.value === "OPEN")}
                  className="w-full h-9 px-3 rounded-md border border-[#E8DFD0] bg-[#FAF5EE] text-xs font-semibold text-[#292821]"
                >
                  <option value="OPEN">Registration Open</option>
                  <option value="CLOSED">Registration Closed</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#292821]">Registration Opening Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={regOpeningDate}
                  onChange={(e) => setRegOpeningDate(e.target.value)}
                  className="h-9 text-xs border-[#E8DFD0] bg-[#FAF5EE] font-mono"
                />
                <p className="text-[10px] text-zinc-500">Scheduled time when form opens automatically.</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#292821]">Registration Closing Deadline & Time</Label>
                <Input
                  type="datetime-local"
                  value={regClosingDate}
                  onChange={(e) => setRegClosingDate(e.target.value)}
                  className="h-9 text-xs border-[#E8DFD0] bg-[#FAF5EE] font-mono"
                />
                <p className="text-[10px] text-zinc-500">Scheduled deadline when submissions close.</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#292821]">Grand Finale / Auditions Date</Label>
                <Input
                  value={eventSchedule}
                  onChange={(e) => setEventSchedule(e.target.value)}
                  className="h-9 text-xs border-[#E8DFD0] bg-[#FAF5EE]"
                />
                <p className="text-[10px] text-zinc-500">Displays on public pages (default: &quot;To Be Announced&quot;).</p>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-bold text-[#292821]">Audition & Finale Venue</Label>
                <Input
                  value={eventVenue}
                  onChange={(e) => setEventVenue(e.target.value)}
                  className="h-9 text-xs border-[#E8DFD0] bg-[#FAF5EE]"
                />
                <p className="text-[10px] text-zinc-500">Official venue in Janakpur Dham, Nepal.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 5: COMPETITION INFORMATION */}
      {activeTab === "information" && (
        <Card className="border-[#E8DFD0] bg-[#FFFFFF] shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-serif font-bold text-[#292821]">
                Competition Guidelines & Editorial Content
              </CardTitle>
              <CardDescription className="text-xs text-[#292821]/70">
                Update competition title, age criteria, audition video rules, and FAQs.
              </CardDescription>
            </div>
            <Button
              onClick={() => handleSaveSettings("Competition Information")}
              disabled={isSaving}
              className="gap-1.5 bg-[#292821] hover:bg-[#3C332A] text-[#F5F0E6] text-xs h-9 px-4 font-semibold border border-[#B69A65]/40"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#B69A65]" /> : <Save className="w-3.5 h-3.5 text-[#B69A65]" />}
              <span>Save Information</span>
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#292821]">Competition Title</Label>
                <Input
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  className="h-9 text-xs border-[#E8DFD0] bg-[#FAF5EE]"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#292821]">Competition Motto & Tagline</Label>
                <Input
                  value={compTagline}
                  onChange={(e) => setCompTagline(e.target.value)}
                  className="h-9 text-xs border-[#E8DFD0] bg-[#FAF5EE]"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#292821]">Official WhatsApp Audition Helpline</Label>
                <Input
                  value={whatsappContact}
                  onChange={(e) => setWhatsappContact(e.target.value)}
                  className="h-9 text-xs border-[#E8DFD0] bg-[#FAF5EE] font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#292821]">Official Instagram Handle</Label>
                <Input
                  value={officialInstagram}
                  onChange={(e) => setOfficialInstagram(e.target.value)}
                  className="h-9 text-xs border-[#E8DFD0] bg-[#FAF5EE]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#292821]">Audition Video Submission Instructions</Label>
              <Textarea
                rows={2}
                value={videoGuidelines}
                onChange={(e) => setVideoGuidelines(e.target.value)}
                className="text-xs border-[#E8DFD0] bg-[#FAF5EE]"
              />
            </div>

            {/* FAQs Management */}
            <div className="pt-4 border-t border-[#E8DFD0]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#292821]">
                  Frequently Asked Questions (FAQs)
                </h4>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addFaq}
                  className="h-7 text-xs border-[#E8DFD0] hover:bg-[#FAF5EE] text-[#292821] gap-1"
                >
                  <Plus className="w-3 h-3 text-[#A64B36]" />
                  <span>Add FAQ</span>
                </Button>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="p-3.5 rounded-md border border-[#E8DFD0] bg-[#FAF5EE] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#B69A65] uppercase">
                        Question #{idx + 1}
                      </span>
                      {faqs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFaq(idx)}
                          className="text-[#A64B36] hover:text-rose-800 text-xs p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <Input
                      value={faq.q}
                      onChange={(e) => updateFaq(idx, "q", e.target.value)}
                      placeholder="Question..."
                      className="h-8 text-xs bg-white border-[#E8DFD0]"
                    />
                    <Textarea
                      rows={2}
                      value={faq.a}
                      onChange={(e) => updateFaq(idx, "a", e.target.value)}
                      placeholder="Answer..."
                      className="text-xs bg-white border-[#E8DFD0]"
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 6: PUBLIC REGISTRATION PAGE PREVIEW & QR */}
      {activeTab === "public_page" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <FormQrCard
            formId={form.id}
            formName={form.name}
            slug={form.slug}
          />

          <Card className="border-[#E8DFD0] bg-[#FFFFFF] shadow-none">
            <CardHeader>
              <CardTitle className="text-sm font-serif font-bold text-[#292821]">
                Live Public Registration Portal
              </CardTitle>
              <CardDescription className="text-xs text-[#292821]/70">
                Direct access to the live public registration flow for Mithila Queen 2026.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-md border border-[#E8DFD0] bg-[#FAF5EE] space-y-2 text-xs">
                <div className="font-bold text-[#292821]">Primary Public URL:</div>
                <div className="font-mono text-[11px] text-[#A64B36]">
                  /register/mithila-queen
                </div>
                <p className="text-[11px] text-zinc-500">
                  Participants can also access registration through the main website at <code>/register</code>.
                </p>
              </div>

              <Link href="/register/mithila-queen" target="_blank">
                <Button className="w-full text-xs h-9 bg-[#292821] hover:bg-[#3C332A] text-[#F5F0E6] font-semibold gap-2 border border-[#B69A65]/40 shadow-xs">
                  <span>Open Registration Form in New Tab</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#B69A65]" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}


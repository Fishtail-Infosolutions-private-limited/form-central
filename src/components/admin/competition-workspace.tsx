"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FileText,
  CreditCard,
  Calendar,
  Info,
  ExternalLink,
  Upload,
  Loader2,
  Save,
  Plus,
  Trash2,
  ShieldCheck,
  CheckCircle2,
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
  stats?: {
    totalRegs?: number;
    completedRegs?: number;
    verifiedPayments?: number;
    appsUnderReview?: number;
    approvedApps?: number;
  };
}

export function CompetitionWorkspace({
  form,
  siteSetting,
}: CompetitionWorkspaceProps) {
  // Directly open Form Editor as requested by user
  const [activeTab, setActiveTab] = useState<
    "builder" | "payment" | "schedule" | "information" | "public_page"
  >("builder");

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
      "Please pay NPR 399 via eSewa or Direct Bank Transfer. Take a clear screenshot of the transaction showing the transaction reference code and attach it in the registration payment step."
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
      "Record a 1-minute video introducing yourself, your connection to Mithila culture, and your unique talent. You can upload directly through the form or submit to our official WhatsApp helpline."
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
    { id: "builder", label: "Form Editor", icon: FileText },
    { id: "payment", label: `Payment & Fee (NPR ${regFee})`, icon: CreditCard },
    { id: "schedule", label: "Schedule & Dates", icon: Calendar },
    { id: "information", label: "Competition Details & FAQ", icon: Info },
    { id: "public_page", label: "Public Link & QR", icon: ExternalLink },
  ] as const;

  return (
    <div className="space-y-6 pb-12">
      {/* Clean, Human-Crafted Top Header */}
      <div className="bg-white p-6 rounded-xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#B89150]">
              The Origin Foundation &bull; Janakpur Dham
            </span>
            <span className="text-stone-300">•</span>
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                isRegOpen
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-stone-100 text-stone-600 border border-stone-200"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isRegOpen ? "bg-emerald-600 animate-pulse" : "bg-stone-400"
                }`}
              />
              {isRegOpen ? "Registration Open" : "Registration Closed"}
            </span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#292524] tracking-tight">
            Manage Competition: Mithila Queen
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Configure registration fields, fee (NPR {regFee}), payment QR, dates, and audition requirements.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/register/mithila-queen" target="_blank">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-stone-200 text-stone-700 hover:bg-[#F7F1E5] hover:text-[#7F1D2D] text-xs h-9 font-medium"
            >
              <span>Test Live Form</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#D97706]" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Clean Horizontal Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-stone-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? "bg-[#7F1D2D] text-white shadow-xs"
                  : "bg-white text-stone-700 hover:bg-[#F7F1E5]/70 hover:text-stone-900 border border-stone-200/80"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#F7F1E5]" : "text-[#D97706]"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: FORM BUILDER / EDITOR (PRIMARY DEFAULT VIEW) */}
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

      {/* TAB 2: PAYMENT & FEE CONFIGURATION */}
      {activeTab === "payment" && (
        <Card className="border-stone-200/80 bg-white shadow-xs">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-5">
            <div>
              <CardTitle className="text-lg font-serif font-bold text-[#292524]">
                Payment & Fee Configuration
              </CardTitle>
              <CardDescription className="text-xs text-stone-500 mt-1">
                Manage the registration fee, payment QR code image, merchant details, and instructions.
              </CardDescription>
            </div>
            <Button
              onClick={() => handleSaveSettings("Payment Settings")}
              disabled={isSaving}
              className="gap-2 bg-[#7F1D2D] hover:bg-[#5B131E] text-white text-xs h-9 px-4 font-medium"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>Save Payment Settings</span>
            </Button>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Official QR Code Upload Area */}
            <div className="p-5 rounded-xl border border-stone-200 bg-[#FFFDF7] flex flex-col sm:flex-row items-center gap-6">
              <div className="relative w-40 h-40 bg-white border border-stone-200 rounded-lg p-2.5 shadow-2xs shrink-0 flex items-center justify-center">
                {paymentQrUrl ? (
                  <Image
                    src={paymentQrUrl}
                    alt="Official Payment QR"
                    width={150}
                    height={150}
                    className="object-contain w-full h-full"
                    unoptimized
                  />
                ) : (
                  <div className="text-center p-2 text-stone-400 text-xs">
                    No QR uploaded
                  </div>
                )}
              </div>
              <div className="space-y-3 flex-1 text-center sm:text-left">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                    Official Payment QR Code
                  </h4>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    This official QR code is shown to participants during registration step 7 and on the payment submission screen.
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
                    <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#7F1D2D] text-white text-xs font-medium hover:bg-[#5B131E] transition-colors">
                      {isUploadingQr ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
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
                      className="h-8 text-xs border-stone-200 text-stone-700 hover:bg-stone-50"
                    >
                      Reset to Default QR
                    </Button>
                  )}
                </div>
                <p className="text-[11px] text-stone-400 font-mono truncate max-w-md">
                  Active Asset: {paymentQrUrl}
                </p>
              </div>
            </div>

            {/* Provider and Account Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold text-stone-700">Registration Fee (NPR)</Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={regFee}
                    onChange={(e) => setRegFee(e.target.value)}
                    className="h-10 text-xs border-stone-200 bg-white font-mono font-bold max-w-xs focus:ring-[#7F1D2D]"
                    placeholder="399"
                  />
                  <span className="text-[11px] text-stone-500">
                    Collected in Nepalese Rupees per registered candidate (Standard: NPR 399).
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-700">Payment Provider Name</Label>
                <Input
                  value={paymentProviderName}
                  onChange={(e) => setPaymentProviderName(e.target.value)}
                  className="h-9 text-xs border-stone-200 bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-700">Official eSewa ID / Merchant Phone</Label>
                <Input
                  value={esewaId}
                  onChange={(e) => setEsewaId(e.target.value)}
                  className="h-9 text-xs border-stone-200 bg-stone-50 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-700">Account Beneficiary Name</Label>
                <Input
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  className="h-9 text-xs border-stone-200 bg-stone-50"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-700">Direct Bank Name & Branch</Label>
                <Input
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="h-9 text-xs border-stone-200 bg-stone-50"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-700">Bank Account Number</Label>
                <Input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="h-9 text-xs border-stone-200 bg-stone-50 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-700">Remarks / Transaction Reference Instructions</Label>
                <Input
                  value={paymentReferenceInstructions}
                  onChange={(e) => setPaymentReferenceInstructions(e.target.value)}
                  className="h-9 text-xs border-stone-200 bg-stone-50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-stone-700">Full Payment Instructions for Applicants</Label>
              <Textarea
                rows={3}
                value={paymentInstructions}
                onChange={(e) => setPaymentInstructions(e.target.value)}
                className="text-xs border-stone-200 bg-stone-50"
              />
            </div>

            {/* Verification Notice */}
            <div className="p-4 rounded-lg bg-[#FFFDF7] border border-[#B89150]/30 text-xs text-stone-700 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#B89150] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-semibold text-stone-800">
                  Private Screenshot Storage & Manual Verification
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Participants upload transaction receipts and payment screenshots securely. All entries are manually reviewed and verified by administrators in the Applications portal.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: SCHEDULE & DATES */}
      {activeTab === "schedule" && (
        <Card className="border-stone-200/80 bg-white shadow-xs">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-5">
            <div>
              <CardTitle className="text-lg font-serif font-bold text-[#292524]">
                Registration Schedule & Timeline
              </CardTitle>
              <CardDescription className="text-xs text-stone-500 mt-1">
                Set the automated opening date, closing deadline, and audition timeline in Nepal Standard Time (UTC+05:45).
              </CardDescription>
            </div>
            <Button
              onClick={() => handleSaveSettings("Schedule")}
              disabled={isSaving}
              className="gap-2 bg-[#7F1D2D] hover:bg-[#5B131E] text-white text-xs h-9 px-4 font-medium"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>Save Schedule</span>
            </Button>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-700">Current Registration Status</Label>
                <select
                  value={isRegOpen ? "OPEN" : "CLOSED"}
                  onChange={(e) => setIsRegOpen(e.target.value === "OPEN")}
                  className="w-full h-9 px-3 rounded-lg border border-stone-200 bg-stone-50 text-xs font-medium text-stone-800"
                >
                  <option value="OPEN">Registration Open</option>
                  <option value="CLOSED">Registration Closed</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-700">Registration Opening Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={regOpeningDate}
                  onChange={(e) => setRegOpeningDate(e.target.value)}
                  className="h-9 text-xs border-stone-200 bg-stone-50 font-mono"
                />
                <p className="text-[10px] text-stone-400">Scheduled time when form opens automatically.</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-700">Registration Closing Deadline & Time</Label>
                <Input
                  type="datetime-local"
                  value={regClosingDate}
                  onChange={(e) => setRegClosingDate(e.target.value)}
                  className="h-9 text-xs border-stone-200 bg-stone-50 font-mono"
                />
                <p className="text-[10px] text-stone-400">Scheduled deadline when submissions close.</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-700">Grand Finale / Auditions Date</Label>
                <Input
                  value={eventSchedule}
                  onChange={(e) => setEventSchedule(e.target.value)}
                  className="h-9 text-xs border-stone-200 bg-stone-50"
                />
                <p className="text-[10px] text-stone-400">Publicly visible date (default: &quot;To Be Announced&quot;).</p>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold text-stone-700">Audition & Finale Venue</Label>
                <Input
                  value={eventVenue}
                  onChange={(e) => setEventVenue(e.target.value)}
                  className="h-9 text-xs border-stone-200 bg-stone-50"
                />
                <p className="text-[10px] text-stone-400">Official venue in Janakpur Dham, Nepal.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: COMPETITION DETAILS & FAQ */}
      {activeTab === "information" && (
        <Card className="border-stone-200/80 bg-white shadow-xs">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-5">
            <div>
              <CardTitle className="text-lg font-serif font-bold text-[#292524]">
                Competition Details & FAQ
              </CardTitle>
              <CardDescription className="text-xs text-stone-500 mt-1">
                Update competition title, tagline, WhatsApp audition helpline, and public FAQs.
              </CardDescription>
            </div>
            <Button
              onClick={() => handleSaveSettings("Competition Information")}
              disabled={isSaving}
              className="gap-2 bg-[#7F1D2D] hover:bg-[#5B131E] text-white text-xs h-9 px-4 font-medium"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>Save Details</span>
            </Button>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-700">Competition Title</Label>
                <Input
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  className="h-9 text-xs border-stone-200 bg-stone-50"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-700">Competition Motto & Tagline</Label>
                <Input
                  value={compTagline}
                  onChange={(e) => setCompTagline(e.target.value)}
                  className="h-9 text-xs border-stone-200 bg-stone-50"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-700">Official WhatsApp Audition Helpline</Label>
                <Input
                  value={whatsappContact}
                  onChange={(e) => setWhatsappContact(e.target.value)}
                  className="h-9 text-xs border-stone-200 bg-stone-50 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-700">Official Instagram Handle</Label>
                <Input
                  value={officialInstagram}
                  onChange={(e) => setOfficialInstagram(e.target.value)}
                  className="h-9 text-xs border-stone-200 bg-stone-50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-stone-700">Audition Video Submission Instructions</Label>
              <Textarea
                rows={2}
                value={videoGuidelines}
                onChange={(e) => setVideoGuidelines(e.target.value)}
                className="text-xs border-stone-200 bg-stone-50"
              />
            </div>

            {/* FAQs Management */}
            <div className="pt-4 border-t border-stone-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                  Frequently Asked Questions (FAQs)
                </h4>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addFaq}
                  className="h-8 text-xs border-stone-200 hover:bg-stone-50 text-stone-700 gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>Add FAQ</span>
                </Button>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-stone-200 bg-[#FFFDF7] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-[#B89150] uppercase tracking-wider">
                        Question #{idx + 1}
                      </span>
                      {faqs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFaq(idx)}
                          className="text-stone-400 hover:text-red-600 text-xs p-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <Input
                      value={faq.q}
                      onChange={(e) => updateFaq(idx, "q", e.target.value)}
                      placeholder="Question..."
                      className="h-8 text-xs bg-white border-stone-200"
                    />
                    <Textarea
                      rows={2}
                      value={faq.a}
                      onChange={(e) => updateFaq(idx, "a", e.target.value)}
                      placeholder="Answer..."
                      className="text-xs bg-white border-stone-200"
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 5: PUBLIC LINK & QR */}
      {activeTab === "public_page" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <FormQrCard
            formId={form.id}
            formName={form.name}
            slug={form.slug}
          />

          <Card className="border-stone-200/80 bg-white shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-serif font-bold text-[#292524]">
                Live Public Registration Link
              </CardTitle>
              <CardDescription className="text-xs text-stone-500">
                Direct access to the live public registration flow for Mithila Queen 2026.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg border border-stone-200 bg-[#FFFDF7] space-y-2 text-xs">
                <div className="font-semibold text-stone-700">Primary Public URL:</div>
                <div className="font-mono text-xs text-[#7F1D2D] font-semibold">
                  /register/mithila-queen
                </div>
                <p className="text-[11px] text-stone-500">
                  Participants can also access registration through the main website at <code>/register</code>.
                </p>
              </div>

              <Link href="/register/mithila-queen" target="_blank">
                <Button className="w-full text-xs h-9 bg-[#7F1D2D] hover:bg-[#5B131E] text-white font-medium gap-2 shadow-xs">
                  <span>Open Registration Form in New Tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

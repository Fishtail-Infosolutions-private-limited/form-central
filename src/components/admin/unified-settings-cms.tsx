"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  Crown,
  FileText,
  CreditCard,
  Share2,
  HelpCircle,
  ShieldCheck,
  HardDrive,
  Save,
  Loader2,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Lock,
  ArrowRight,
  Info,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { updateSiteSettingsAction } from "@/server/actions/site-settings-actions";
import { UploadSettingsCard } from "@/components/admin/upload-settings-card";
import { ChangePasswordCard } from "@/components/admin/change-password-card";
import { MithilaHeritageMandala } from "@/components/brand/brand-logos";

interface UnifiedSettingsProps {
  initialSettings: any;
  driveIntegration: any;
}

export function UnifiedSettingsCMS({
  initialSettings,
  driveIntegration,
}: UnifiedSettingsProps) {
  const [activeTab, setActiveTab] = useState<
    | "foundation"
    | "mithila_queen"
    | "cms"
    | "payment"
    | "social_video"
    | "faqs_announcements"
    | "legal"
    | "integrations"
  >("foundation");

  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [orgName, setOrgName] = useState(initialSettings?.organizationName || "The Origin Foundation");
  const [orgTagline, setOrgTagline] = useState(
    initialSettings?.organizationTagline || "Rooted in Identity. Driven by Purpose."
  );
  const [officialEmail, setOfficialEmail] = useState(
    initialSettings?.officialEmail || "originfoundation107@gmail.com"
  );
  const [primaryPhone, setPrimaryPhone] = useState("+977 9704571941");
  const [secondaryPhone, setSecondaryPhone] = useState("+977 981-2005468");
  const [registeredAddress, setRegisteredAddress] = useState(
    "Janakpur Dham, Dhanusha, Madhesh Province, Nepal"
  );

  // Mithila Queen Settings
  const [compName, setCompName] = useState(initialSettings?.competitionName || "Mithila Queen");
  const [compTagline, setCompTagline] = useState(
    initialSettings?.competitionTagline || "Celebrating Mithila's Culture, Confidence & Talent."
  );
  const [regFee, setRegFee] = useState(initialSettings?.registrationFee?.toString() || "399");
  const [isRegOpen, setIsRegOpen] = useState(initialSettings?.isRegistrationOpen ?? true);
  const [eventSchedule, setEventSchedule] = useState(initialSettings?.eventSchedule || "To Be Announced");
  const [eventVenue, setEventVenue] = useState(initialSettings?.eventVenue || "To Be Announced");
  const [minAge, setMinAge] = useState("16");
  const [maxAge, setMaxAge] = useState("28");

  // CMS Content
  const [heroHeadline, setHeroHeadline] = useState(
    "Celebrating Mithila's Culture, Confidence & Talent"
  );
  const [heroSubtitle, setHeroSubtitle] = useState(
    "An institutional platform dedicated to preserving heritage, empowering young women, and fostering ethical creative leadership across Janakpur Dham and Nepal."
  );
  const [aboutStatement, setAboutStatement] = useState(
    "The Origin Foundation was established in Janakpur Dham, Nepal, to provide a structured and transparent cultural platform for Mithila heritage preservation, youth empowerment, and creative talent."
  );
  const [announcementBanner, setAnnouncementBanner] = useState(
    "Official Registrations are now open for Mithila Queen 2026. Auditions and grand finale dates to be announced."
  );

  // Payment Settings
  const [esewaId, setEsewaId] = useState("9704571941 / The Origin Foundation");
  const [paymentQrUrl, setPaymentQrUrl] = useState(
    initialSettings?.paymentQrCodeUrl || "/assets/brand/origin-foundation-qr.png"
  );
  const [accountHolder, setAccountHolder] = useState("The Origin Foundation");
  const [bankName, setBankName] = useState("Nepal Bank Limited (Janakpur Branch)");
  const [accountNumber, setAccountNumber] = useState("01200100000000");
  const [paymentInstructions, setPaymentInstructions] = useState(
    initialSettings?.paymentInstructions ||
      "Please pay exactly NPR 399 via eSewa or Direct Bank Transfer. Take a clear screenshot of the transaction showing the transaction reference/code and attach it in Step 6 of registration."
  );

  // Social & Video
  const [whatsappContact, setWhatsappContact] = useState(
    initialSettings?.whatsappContact || "+977 9704571941"
  );
  const [facebookUrl, setFacebookUrl] = useState("https://facebook.com/originfoundation.nepal");
  const [officialInstagram, setOfficialInstagram] = useState(
    initialSettings?.officialInstagram || "originfoundation.nepal"
  );
  const [officialTiktok, setOfficialTiktok] = useState(
    initialSettings?.officialTiktok || "@originfoundation"
  );
  const [videoGuidelines, setVideoGuidelines] = useState(
    initialSettings?.videoGuidelines ||
      "Record a 1-minute video introducing yourself, your connection to Mithila culture, and your unique talent. You can upload via the form or submit directly to our official WhatsApp line: +977 9704571941."
  );

  // FAQs
  const [faqs, setFaqs] = useState<Array<{ q: string; a: string }>>(
    (initialSettings?.faqsJson as any) || [
      {
        q: "What is The Origin Foundation?",
        a: "The Origin Foundation is a non-governmental cultural organization headquartered in Janakpur Dham, dedicated to heritage preservation, women empowerment, and cultural competitions.",
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

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const res = await updateSiteSettingsAction({
        organizationName: orgName,
        organizationTagline: orgTagline,
        competitionName: compName,
        competitionTagline: compTagline,
        officialEmail,
        registrationFee: parseInt(regFee, 10) || 399,
        isRegistrationOpen: isRegOpen,
        eventSchedule,
        eventVenue,
        paymentQrCodeUrl: paymentQrUrl,
        paymentInstructions,
        whatsappContact,
        officialInstagram,
        officialTiktok,
        videoGuidelines,
        faqsJson: faqs,
      });

      if (res.success) {
        toast.success("Settings saved and public website updated successfully!");
      } else {
        toast.error(res.error || "Failed to update settings");
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
    { id: "foundation", label: "1. Foundation Info", icon: Building2 },
    { id: "mithila_queen", label: "2. Mithila Queen", icon: Crown },
    { id: "cms", label: "3. Website CMS", icon: FileText },
    { id: "payment", label: "4. Payment Settings", icon: CreditCard },
    { id: "social_video", label: "5. Social & Video", icon: Share2 },
    { id: "faqs_announcements", label: "6. FAQs & Updates", icon: HelpCircle },
    { id: "legal", label: "7. Legal Policies", icon: ShieldCheck },
    { id: "integrations", label: "8. Integrations & Security", icon: HardDrive },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DFD0] pb-6 bg-[#FFFFFF] p-6 rounded-lg border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MithilaHeritageMandala className="w-5 h-5 text-[#B69A65]" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#B69A65]">
              Administrative Settings &bull; The Origin Foundation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#172B24] tracking-tight">
            Website & Competition Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#292821]/70">
            Configure institutional profiles, competition fees, live site copy, legal terms, and cloud integrations.
          </p>
        </div>

        <Button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="gap-2 bg-[#172B24] hover:bg-[#172B24]/90 text-[#F5F0E6] text-xs h-10 px-5 font-semibold border border-[#B69A65]/40 shadow-none shrink-0"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-[#B69A65]" /> : <Save className="w-4 h-4 text-[#B69A65]" />}
          <span>Save All Changes</span>
        </Button>
      </div>

      {/* Structured Horizontal Tab Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#E8DFD0]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-[#172B24] text-[#F5F0E6] border border-[#B69A65]/40"
                  : "bg-[#FFFFFF] text-[#292821]/80 hover:bg-[#FAF5EE] border border-[#E8DFD0]"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#B69A65]" : "text-[#A64B36]"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: FOUNDATION INFORMATION */}
      {activeTab === "foundation" && (
        <Card className="border-[#E8DFD0] bg-[#FFFFFF] shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-serif font-bold text-[#172B24]">
              Institutional Foundation Information
            </CardTitle>
            <CardDescription className="text-xs text-[#292821]/70">
              Official organization credentials displayed across the public navbar, footer, registration verification, and email signatures.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#172B24]">Organization Name</Label>
                <Input
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="h-10 text-xs border-[#E8DFD0] bg-[#FAF5EE]"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#172B24]">Motto & Tagline</Label>
                <Input
                  value={orgTagline}
                  onChange={(e) => setOrgTagline(e.target.value)}
                  className="h-10 text-xs border-[#E8DFD0] bg-[#FAF5EE]"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#172B24]">Official Contact Email</Label>
                <Input
                  value={officialEmail}
                  onChange={(e) => setOfficialEmail(e.target.value)}
                  className="h-10 text-xs border-[#E8DFD0] bg-[#FAF5EE] font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#172B24]">Registered Headquarters</Label>
                <Input
                  value={registeredAddress}
                  onChange={(e) => setRegisteredAddress(e.target.value)}
                  className="h-10 text-xs border-[#E8DFD0] bg-[#FAF5EE]"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#172B24]">Primary Helpline Number</Label>
                <Input
                  value={primaryPhone}
                  onChange={(e) => setPrimaryPhone(e.target.value)}
                  className="h-10 text-xs border-[#E8DFD0] bg-[#FAF5EE] font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#172B24]">Secondary Helpline Number</Label>
                <Input
                  value={secondaryPhone}
                  onChange={(e) => setSecondaryPhone(e.target.value)}
                  className="h-10 text-xs border-[#E8DFD0] bg-[#FAF5EE] font-mono"
                />
              </div>
            </div>

            {/* Equal Leadership Cards */}
            <div className="pt-4 border-t border-[#E8DFD0]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#172B24] mb-3">
                Executive Leadership (Equal Representation)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-md border border-[#E8DFD0] bg-[#FAF5EE] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#A64B36] uppercase">Managing Director</span>
                    <span className="text-[10px] text-zinc-500 font-mono">Executive Lead</span>
                  </div>
                  <div className="text-sm font-serif font-bold text-[#172B24]">Gaurav Gupta</div>
                  <div className="text-xs text-[#292821]/70 font-mono flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#B69A65]" />
                    <span>+977 9704571941</span>
                  </div>
                </div>

                <div className="p-4 rounded-md border border-[#E8DFD0] bg-[#FAF5EE] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#A64B36] uppercase">Managing Director</span>
                    <span className="text-[10px] text-zinc-500 font-mono">Executive Lead</span>
                  </div>
                  <div className="text-sm font-serif font-bold text-[#172B24]">Dipendra Shah Kalwar</div>
                  <div className="text-xs text-[#292821]/70 font-mono flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#B69A65]" />
                    <span>+977 981-2005468</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 2: MITHILA QUEEN SETTINGS */}
      {activeTab === "mithila_queen" && (
        <Card className="border-[#E8DFD0] bg-[#FFFFFF] shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-serif font-bold text-[#172B24]">
              Mithila Queen Competition Parameters
            </CardTitle>
            <CardDescription className="text-xs text-[#292821]/70">
              Manage flagship registration status, strictly controlled schedules, and eligibility constraints.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#172B24]">Competition Title</Label>
                <Input
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  className="h-10 text-xs border-[#E8DFD0] bg-[#FAF5EE]"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#172B24]">Registration Fee (NPR)</Label>
                <Input
                  value={regFee}
                  disabled
                  className="h-10 text-xs border-[#E8DFD0] bg-[#FAF5EE] font-mono font-bold"
                />
                <p className="text-[10px] text-[#A64B36] font-medium">Enforced at NPR 399 per official brief.</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#172B24]">Registration Status</Label>
                <select
                  value={isRegOpen ? "OPEN" : "CLOSED"}
                  onChange={(e) => setIsRegOpen(e.target.value === "OPEN")}
                  className="w-full h-10 px-3 rounded-md border border-[#E8DFD0] bg-[#FAF5EE] text-xs font-semibold text-[#172B24]"
                >
                  <option value="OPEN">Registration Open</option>
                  <option value="CLOSED">Registration Closed</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#172B24]">Event Date & Time</Label>
                <Input
                  value={eventSchedule}
                  disabled
                  className="h-10 text-xs border-[#E8DFD0] bg-[#FAF5EE] font-semibold text-[#172B24]"
                />
                <p className="text-[10px] text-zinc-500">Strictly &quot;To Be Announced&quot; (no unverified dates).</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#172B24]">Competition Venue</Label>
                <Input
                  value={eventVenue}
                  disabled
                  className="h-10 text-xs border-[#E8DFD0] bg-[#FAF5EE] font-semibold text-[#172B24]"
                />
                <p className="text-[10px] text-zinc-500">Janakpur Dham &bull; Specific auditorium TBA.</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#172B24]">Age Eligibility Window</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={minAge}
                    onChange={(e) => setMinAge(e.target.value)}
                    className="h-10 text-xs border-[#E8DFD0] bg-[#FAF5EE] text-center font-mono"
                  />
                  <span className="text-xs text-zinc-500">to</span>
                  <Input
                    value={maxAge}
                    onChange={(e) => setMaxAge(e.target.value)}
                    className="h-10 text-xs border-[#E8DFD0] bg-[#FAF5EE] text-center font-mono"
                  />
                  <span className="text-xs text-zinc-500">years</span>
                </div>
                <p className="text-[10px] text-zinc-500">Ages 16-17 require minor parental safeguarding consent.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: WEBSITE PAGE CONTENT CMS */}
      {activeTab === "cms" && (
        <Card className="border-[#E8DFD0] bg-[#FFFFFF] shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-serif font-bold text-[#172B24]">
              Public Website Editorial Copy
            </CardTitle>
            <CardDescription className="text-xs text-[#292821]/70">
              Customize the institutional statements, hero titles, and live alert banners across the public homepage.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#172B24]">Hero Section Headline</Label>
              <Input
                value={heroHeadline}
                onChange={(e) => setHeroHeadline(e.target.value)}
                className="h-10 text-xs border-[#E8DFD0] bg-[#FAF5EE]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#172B24]">Hero Section Subtitle</Label>
              <Textarea
                rows={2}
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                className="text-xs border-[#E8DFD0] bg-[#FAF5EE]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#172B24]">About The Origin Foundation Statement</Label>
              <Textarea
                rows={3}
                value={aboutStatement}
                onChange={(e) => setAboutStatement(e.target.value)}
                className="text-xs border-[#E8DFD0] bg-[#FAF5EE]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#172B24]">Site Announcements Ticker Banner</Label>
              <Input
                value={announcementBanner}
                onChange={(e) => setAnnouncementBanner(e.target.value)}
                className="h-10 text-xs border-[#E8DFD0] bg-[#FAF5EE]"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: PAYMENT SETTINGS */}
      {activeTab === "payment" && (
        <Card className="border-[#E8DFD0] bg-[#FFFFFF] shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-serif font-bold text-[#172B24]">
              Payment Gateway & eSewa Settings
            </CardTitle>
            <CardDescription className="text-xs text-[#292821]/70">
              Configure eSewa recipient identifier, direct bank transfer details, and applicant payment instructions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#172B24]">Official eSewa ID / Merchant Phone</Label>
                <Input
                  value={esewaId}
                  onChange={(e) => setEsewaId(e.target.value)}
                  className="h-10 text-xs border-[#E8DFD0] bg-[#FAF5EE] font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#172B24]">Account Beneficiary Name</Label>
                <Input
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  className="h-10 text-xs border-[#E8DFD0] bg-[#FAF5EE]"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#172B24]">Direct Bank Name & Branch</Label>
                <Input
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="h-10 text-xs border-[#E8DFD0] bg-[#FAF5EE]"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#172B24]">Bank Account Number</Label>
                <Input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="h-10 text-xs border-[#E8DFD0] bg-[#FAF5EE] font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#172B24]">Payment Instructions for Applicants</Label>
              <Textarea
                rows={3}
                value={paymentInstructions}
                onChange={(e) => setPaymentInstructions(e.target.value)}
                className="text-xs border-[#E8DFD0] bg-[#FAF5EE]"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 5: SOCIAL MEDIA & VIDEO AUDITION */}
      {activeTab === "social_video" && (
        <Card className="border-[#E8DFD0] bg-[#FFFFFF] shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-serif font-bold text-[#172B24]">
              Social Media Channels & Video Submission Rules
            </CardTitle>
            <CardDescription className="text-xs text-[#292821]/70">
              Manage the official WhatsApp submission channel and audition guidelines provided to applicants.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#172B24]">Official WhatsApp Audition Helpline</Label>
                <Input
                  value={whatsappContact}
                  onChange={(e) => setWhatsappContact(e.target.value)}
                  className="h-10 text-xs border-[#E8DFD0] bg-[#FAF5EE] font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#172B24]">Official Facebook Page</Label>
                <Input
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  className="h-10 text-xs border-[#E8DFD0] bg-[#FAF5EE]"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#172B24]">Instagram Handle</Label>
                <Input
                  value={officialInstagram}
                  onChange={(e) => setOfficialInstagram(e.target.value)}
                  className="h-10 text-xs border-[#E8DFD0] bg-[#FAF5EE]"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#172B24]">TikTok Handle</Label>
                <Input
                  value={officialTiktok}
                  onChange={(e) => setOfficialTiktok(e.target.value)}
                  className="h-10 text-xs border-[#E8DFD0] bg-[#FAF5EE]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#172B24]">Video Audition Guidelines & Duration Rules</Label>
              <Textarea
                rows={3}
                value={videoGuidelines}
                onChange={(e) => setVideoGuidelines(e.target.value)}
                className="text-xs border-[#E8DFD0] bg-[#FAF5EE]"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 6: FAQS & ANNOUNCEMENTS CMS */}
      {activeTab === "faqs_announcements" && (
        <Card className="border-[#E8DFD0] bg-[#FFFFFF] shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-serif font-bold text-[#172B24]">
                Frequently Asked Questions (FAQs)
              </CardTitle>
              <CardDescription className="text-xs text-[#292821]/70">
                Live FAQs displayed on the homepage and registration status portal.
              </CardDescription>
            </div>
            <Button
              type="button"
              onClick={addFaq}
              size="sm"
              variant="outline"
              className="gap-1.5 border-[#E8DFD0] text-[#172B24] hover:bg-[#FAF5EE] text-xs h-8"
            >
              <Plus className="w-3.5 h-3.5 text-[#A64B36]" />
              <span>Add FAQ</span>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-4 rounded-md border border-[#E8DFD0] bg-[#FAF5EE] space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#B69A65] uppercase tracking-wider">
                    FAQ #{idx + 1}
                  </span>
                  {faqs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFaq(idx)}
                      className="text-rose-600 hover:text-rose-800 text-xs p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#172B24]">Question</Label>
                  <Input
                    value={faq.q}
                    onChange={(e) => updateFaq(idx, "q", e.target.value)}
                    className="h-9 text-xs bg-[#FFFFFF] border-[#E8DFD0]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#172B24]">Answer</Label>
                  <Textarea
                    rows={2}
                    value={faq.a}
                    onChange={(e) => updateFaq(idx, "a", e.target.value)}
                    className="text-xs bg-[#FFFFFF] border-[#E8DFD0]"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* TAB 7: LEGAL POLICIES */}
      {activeTab === "legal" && (
        <Card className="border-[#E8DFD0] bg-[#FFFFFF] shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-serif font-bold text-[#172B24]">
              Legal Policies & Minor Safeguarding Framework
            </CardTitle>
            <CardDescription className="text-xs text-[#292821]/70">
              Institutional policies governing competition adjudication, participant terms, and privacy compliance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-md border border-[#E8DFD0] bg-[#FAF5EE] space-y-2">
                <div className="text-xs font-bold text-[#172B24] flex items-center justify-between">
                  <span>Competition Rules & Eligibility</span>
                  <Link href="/rules" target="_blank" className="text-[#A64B36] hover:underline flex items-center gap-1 text-[11px]">
                    <span>View Live</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <p className="text-[11px] text-[#292821]/70">
                  Defines age constraints (16-28), citizenship verification, code of conduct, and jury adjudication standards.
                </p>
              </div>

              <div className="p-4 rounded-md border border-[#E8DFD0] bg-[#FAF5EE] space-y-2">
                <div className="text-xs font-bold text-[#172B24] flex items-center justify-between">
                  <span>Terms of Service</span>
                  <Link href="/terms" target="_blank" className="text-[#A64B36] hover:underline flex items-center gap-1 text-[11px]">
                    <span>View Live</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <p className="text-[11px] text-[#292821]/70">
                  Governs website access, intellectual property of Mithila Queen media, and user obligations.
                </p>
              </div>

              <div className="p-4 rounded-md border border-[#E8DFD0] bg-[#FAF5EE] space-y-2">
                <div className="text-xs font-bold text-[#172B24] flex items-center justify-between">
                  <span>Privacy Policy</span>
                  <Link href="/privacy-policy" target="_blank" className="text-[#A64B36] hover:underline flex items-center gap-1 text-[11px]">
                    <span>View Live</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <p className="text-[11px] text-[#292821]/70">
                  Data protection policies detailing encrypted storage of participant identity proofs, contacts, and photos.
                </p>
              </div>

              <div className="p-4 rounded-md border border-[#E8DFD0] bg-[#FAF5EE] space-y-2">
                <div className="text-xs font-bold text-[#172B24] flex items-center justify-between">
                  <span>Refund Policy</span>
                  <Link href="/refund-policy" target="_blank" className="text-[#A64B36] hover:underline flex items-center gap-1 text-[11px]">
                    <span>View Live</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <p className="text-[11px] text-[#292821]/70">
                  Covers the NPR 399 entry fee terms: non-refundable once administrative review commences, except upon official cancellation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 8: INTEGRATIONS & SYSTEM SECURITY */}
      {activeTab === "integrations" && (
        <div className="space-y-6">
          {/* Google Drive Status */}
          <Card className="border-[#E8DFD0] bg-[#FFFFFF] shadow-none">
            <CardHeader>
              <div className="flex items-center justify-between mb-1">
                <div className="w-9 h-9 rounded-md bg-[#FAF5EE] text-[#172B24] border border-[#B69A65]/40 flex items-center justify-center">
                  <HardDrive className="w-4 h-4 text-[#A64B36]" />
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                    driveIntegration?.isConnected
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-[#FAF5EE] text-amber-800 border-amber-200"
                  }`}
                >
                  {driveIntegration?.isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <CardTitle className="text-lg font-serif font-bold text-[#172B24]">
                Google Drive Storage Integration
              </CardTitle>
              <CardDescription className="text-xs text-[#292821]/70">
                Direct OAuth 2.0 connection to stream large audition video uploads and identity documents into cloud storage.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {driveIntegration?.isConnected ? (
                <div className="p-3.5 rounded-md bg-[#FAF5EE] border border-[#E8DFD0] text-xs text-[#292821] space-y-1">
                  <div className="font-semibold text-[#172B24] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-mono text-xs">{driveIntegration.accountEmail}</span>
                  </div>
                  <div className="text-xs text-[#292821]/70 flex items-center justify-between pt-1 border-t border-[#E8DFD0]">
                    <span>Destination Folder:</span>
                    <span className="font-semibold text-[#172B24]">{driveIntegration.folderName || "Root Drive"}</span>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-md bg-[#FAF5EE] border border-[#E8DFD0] text-xs text-[#292821] flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-[#A64B36] shrink-0 mt-0.5" />
                  <span>
                    Google Drive is disconnected. Connect the official organization account to receive participant video files without exhausting server disk storage.
                  </span>
                </div>
              )}

              <Link href="/admin/settings/integrations/google-drive">
                <Button
                  variant="outline"
                  className="w-full justify-between text-xs font-semibold h-10 border-[#E8DFD0] text-[#172B24] hover:bg-[#FAF5EE]"
                >
                  <span>
                    {driveIntegration?.isConnected ? "Manage Drive & Change Folder" : "Connect Google Drive Account"}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#A64B36]" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* File Upload Size & Policies */}
            <UploadSettingsCard />

            {/* Admin Password Change Card */}
            <ChangePasswordCard />
          </div>
        </div>
      )}
    </div>
  );
}

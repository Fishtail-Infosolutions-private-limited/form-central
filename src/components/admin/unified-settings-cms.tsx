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
  Upload,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [regOpeningDate, setRegOpeningDate] = useState<string>(
    initialSettings?.registrationOpeningDate
      ? new Date(initialSettings.registrationOpeningDate).toISOString().slice(0, 16)
      : ""
  );
  const [regClosingDate, setRegClosingDate] = useState<string>(
    initialSettings?.registrationClosingDate
      ? new Date(initialSettings.registrationClosingDate).toISOString().slice(0, 16)
      : ""
  );
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
  const [paymentProviderName, setPaymentProviderName] = useState(
    initialSettings?.paymentProviderName || "eSewa & Direct Bank Transfer"
  );
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
  const [paymentReferenceInstructions, setPaymentReferenceInstructions] = useState(
    initialSettings?.paymentReferenceInstructions ||
      "Enter your Full Name and Registered Mobile Number in the payment remarks/description."
  );
  const [isUploadingQr, setIsUploadingQr] = useState(false);

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
        toast.success("Official payment QR code uploaded! Click 'Save All Changes' to apply.");
      } else {
        toast.error(data.error || "Failed to upload QR code");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setIsUploadingQr(false);
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-dark pb-6 bg-white p-6 rounded-lg border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MithilaHeritageMandala className="w-5 h-5 text-saffron" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-saffron">
              Administrative Settings &bull; The Origin Foundation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-maroon tracking-tight">
            Website & Competition Settings
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Configure institutional profiles, competition fees, live site copy, legal terms, and cloud integrations.
          </p>
        </div>

        <Button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="gap-2 bg-maroon hover:bg-maroon/90 text-white text-xs h-10 px-5 font-semibold border border-antique-gold/40 shadow-none shrink-0"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-saffron" /> : <Save className="w-4 h-4 text-saffron" />}
          <span>Save All Changes</span>
        </Button>
      </div>

      {/* Structured Horizontal Tab Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-cream-dark">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-maroon text-white border border-antique-gold/40"
                  : "bg-white text-stone-700 hover:bg-soft-cream border border-cream-dark"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-saffron" : "text-maroon"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: FOUNDATION INFORMATION */}
      {activeTab === "foundation" && (
        <Card className="border-cream-dark bg-white shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-serif font-bold text-maroon">
              Institutional Foundation Information
            </CardTitle>
            <CardDescription className="text-xs text-stone-600">
              Official organization credentials displayed across the public navbar, footer, registration verification, and email signatures.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-maroon">Organization Name</Label>
                <Input
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="h-10 text-xs border-cream-dark bg-soft-cream"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-maroon">Motto & Tagline</Label>
                <Input
                  value={orgTagline}
                  onChange={(e) => setOrgTagline(e.target.value)}
                  className="h-10 text-xs border-cream-dark bg-soft-cream"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-maroon">Official Contact Email</Label>
                <Input
                  value={officialEmail}
                  onChange={(e) => setOfficialEmail(e.target.value)}
                  className="h-10 text-xs border-cream-dark bg-soft-cream font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-maroon">Registered Headquarters</Label>
                <Input
                  value={registeredAddress}
                  onChange={(e) => setRegisteredAddress(e.target.value)}
                  className="h-10 text-xs border-cream-dark bg-soft-cream"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-maroon">Primary Helpline Number</Label>
                <Input
                  value={primaryPhone}
                  onChange={(e) => setPrimaryPhone(e.target.value)}
                  className="h-10 text-xs border-cream-dark bg-soft-cream font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-maroon">Secondary Helpline Number</Label>
                <Input
                  value={secondaryPhone}
                  onChange={(e) => setSecondaryPhone(e.target.value)}
                  className="h-10 text-xs border-cream-dark bg-soft-cream font-mono"
                />
              </div>
            </div>

            {/* Equal Leadership Cards */}
            <div className="pt-4 border-t border-cream-dark">
              <h3 className="text-xs font-bold uppercase tracking-wider text-maroon mb-3">
                Executive Leadership (Equal Representation)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-md border border-cream-dark bg-soft-cream space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-maroon uppercase">Managing Director</span>
                    <span className="text-[10px] text-zinc-500 font-mono">Executive Lead</span>
                  </div>
                  <div className="text-sm font-serif font-bold text-maroon">Gaurav Gupta</div>
                  <div className="text-xs text-stone-600 font-mono flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-saffron" />
                    <span>+977 9704571941</span>
                  </div>
                </div>

                <div className="p-4 rounded-md border border-cream-dark bg-soft-cream space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-maroon uppercase">Managing Director</span>
                    <span className="text-[10px] text-zinc-500 font-mono">Executive Lead</span>
                  </div>
                  <div className="text-sm font-serif font-bold text-maroon">Dipendra Shah Kalwar</div>
                  <div className="text-xs text-stone-600 font-mono flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-saffron" />
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
        <Card className="border-cream-dark bg-white shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-serif font-bold text-maroon">
              Mithila Queen Competition Parameters
            </CardTitle>
            <CardDescription className="text-xs text-stone-600">
              Manage flagship registration status, strictly controlled schedules, and eligibility constraints.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-maroon">Competition Title</Label>
                <Input
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  className="h-10 text-xs border-cream-dark bg-soft-cream"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-maroon">Registration Fee (NPR)</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={regFee}
                  onChange={(e) => setRegFee(e.target.value)}
                  className="h-10 text-xs border-slate-200 bg-white font-mono font-bold"
                  placeholder="399"
                />
                <p className="text-[10px] text-slate-500 font-medium">
                  Official candidate registration fee collected in Nepalese Rupees.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-maroon">Registration Status</Label>
                <Select
                  value={isRegOpen ? "OPEN" : "CLOSED"}
                  onValueChange={(val) => setIsRegOpen(val === "OPEN")}
                >
                  <SelectTrigger className="h-10 border-cream-dark bg-soft-cream text-xs font-semibold text-maroon">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEN">Registration Open</SelectItem>
                    <SelectItem value="CLOSED">Registration Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-maroon">Registration Opening Date</Label>
                <Input
                  type="datetime-local"
                  value={regOpeningDate}
                  onChange={(e) => setRegOpeningDate(e.target.value)}
                  className="h-10 text-xs border-cream-dark bg-soft-cream font-mono"
                />
                <p className="text-[10px] text-zinc-500">Scheduled time when form opens automatically.</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-maroon">Registration Deadline / Closing</Label>
                <Input
                  type="datetime-local"
                  value={regClosingDate}
                  onChange={(e) => setRegClosingDate(e.target.value)}
                  className="h-10 text-xs border-cream-dark bg-soft-cream font-mono"
                />
                <p className="text-[10px] text-zinc-500">Scheduled deadline when submissions close.</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-maroon">Event Date & Time</Label>
                <Input
                  value={eventSchedule}
                  disabled
                  className="h-10 text-xs border-cream-dark bg-soft-cream font-semibold text-maroon"
                />
                <p className="text-[10px] text-zinc-500">Strictly &quot;To Be Announced&quot; (no unverified dates).</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-maroon">Competition Venue</Label>
                <Input
                  value={eventVenue}
                  disabled
                  className="h-10 text-xs border-cream-dark bg-soft-cream font-semibold text-maroon"
                />
                <p className="text-[10px] text-zinc-500">Janakpur Dham &bull; Specific auditorium TBA.</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-maroon">Age Eligibility Window</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={minAge}
                    onChange={(e) => setMinAge(e.target.value)}
                    className="h-10 text-xs border-cream-dark bg-soft-cream text-center font-mono"
                  />
                  <span className="text-xs text-zinc-500">to</span>
                  <Input
                    value={maxAge}
                    onChange={(e) => setMaxAge(e.target.value)}
                    className="h-10 text-xs border-cream-dark bg-soft-cream text-center font-mono"
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
        <Card className="border-cream-dark bg-white shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-serif font-bold text-maroon">
              Public Website Editorial Copy
            </CardTitle>
            <CardDescription className="text-xs text-stone-600">
              Customize the institutional statements, hero titles, and live alert banners across the public homepage.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-maroon">Hero Section Headline</Label>
              <Input
                value={heroHeadline}
                onChange={(e) => setHeroHeadline(e.target.value)}
                className="h-10 text-xs border-cream-dark bg-soft-cream"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-maroon">Hero Section Subtitle</Label>
              <Textarea
                rows={2}
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                className="text-xs border-cream-dark bg-soft-cream"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-maroon">About The Origin Foundation Statement</Label>
              <Textarea
                rows={3}
                value={aboutStatement}
                onChange={(e) => setAboutStatement(e.target.value)}
                className="text-xs border-cream-dark bg-soft-cream"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-maroon">Site Announcements Ticker Banner</Label>
              <Input
                value={announcementBanner}
                onChange={(e) => setAnnouncementBanner(e.target.value)}
                className="h-10 text-xs border-cream-dark bg-soft-cream"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: PAYMENT SETTINGS */}
      {activeTab === "payment" && (
        <Card className="border-cream-dark bg-white shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-serif font-bold text-maroon">
              Payment Gateway & eSewa Settings
            </CardTitle>
            <CardDescription className="text-xs text-stone-600">
              Configure official payment QR code, recipient details, and instructions provided to participants.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Official QR Code Upload & Preview */}
            <div className="p-4 rounded-md border border-cream-dark bg-soft-cream flex flex-col sm:flex-row items-center gap-6">
              <div className="relative w-40 h-40 bg-white border border-cream-dark rounded-lg p-2 shadow-sm shrink-0 flex items-center justify-center">
                {paymentQrUrl ? (
                  <Image
                    src={paymentQrUrl}
                    alt="Official Payment QR"
                    width={140}
                    height={140}
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
                  <h4 className="text-xs font-bold uppercase tracking-wider text-maroon">
                    Official Payment QR Code
                  </h4>
                  <p className="text-xs text-stone-600 mt-1">
                    This QR image is displayed in Step 6 of the participant registration wizard and on the post-submission payment screen.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQrUpload}
                      disabled={isUploadingQr}
                      className="hidden"
                    />
                    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-maroon text-white text-xs font-semibold hover:bg-maroon/90 transition-colors">
                      {isUploadingQr ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-saffron" />
                      ) : (
                        <Upload className="w-3.5 h-3.5 text-saffron" />
                      )}
                      <span>{isUploadingQr ? "Uploading..." : "Upload New QR Code"}</span>
                    </div>
                  </label>
                  {paymentQrUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPaymentQrUrl("/assets/brand/origin-foundation-qr.png")}
                      className="h-8 text-xs border-cream-dark text-maroon"
                    >
                      Reset to Default
                    </Button>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 font-mono truncate max-w-md">
                  Active URL: {paymentQrUrl}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-maroon">Payment Provider Name</Label>
                <Input
                  value={paymentProviderName}
                  onChange={(e) => setPaymentProviderName(e.target.value)}
                  className="h-10 text-xs border-cream-dark bg-soft-cream"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-maroon">Official eSewa ID / Merchant Phone</Label>
                <Input
                  value={esewaId}
                  onChange={(e) => setEsewaId(e.target.value)}
                  className="h-10 text-xs border-cream-dark bg-soft-cream font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-maroon">Account Beneficiary Name</Label>
                <Input
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  className="h-10 text-xs border-cream-dark bg-soft-cream"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-maroon">Direct Bank Name & Branch</Label>
                <Input
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="h-10 text-xs border-cream-dark bg-soft-cream"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-maroon">Bank Account Number</Label>
                <Input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="h-10 text-xs border-cream-dark bg-soft-cream font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-maroon">Payment Reference / Remarks Instructions</Label>
                <Input
                  value={paymentReferenceInstructions}
                  onChange={(e) => setPaymentReferenceInstructions(e.target.value)}
                  className="h-10 text-xs border-cream-dark bg-soft-cream"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-maroon">Payment Instructions for Applicants</Label>
              <Textarea
                rows={3}
                value={paymentInstructions}
                onChange={(e) => setPaymentInstructions(e.target.value)}
                className="text-xs border-cream-dark bg-soft-cream"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 5: SOCIAL MEDIA & VIDEO AUDITION */}
      {activeTab === "social_video" && (
        <Card className="border-cream-dark bg-white shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-serif font-bold text-maroon">
              Social Media Channels & Video Submission Rules
            </CardTitle>
            <CardDescription className="text-xs text-stone-600">
              Manage the official WhatsApp submission channel and audition guidelines provided to applicants.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-maroon">Official WhatsApp Audition Helpline</Label>
                <Input
                  value={whatsappContact}
                  onChange={(e) => setWhatsappContact(e.target.value)}
                  className="h-10 text-xs border-cream-dark bg-soft-cream font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-maroon">Official Facebook Page</Label>
                <Input
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  className="h-10 text-xs border-cream-dark bg-soft-cream"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-maroon">Instagram Handle</Label>
                <Input
                  value={officialInstagram}
                  onChange={(e) => setOfficialInstagram(e.target.value)}
                  className="h-10 text-xs border-cream-dark bg-soft-cream"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-maroon">TikTok Handle</Label>
                <Input
                  value={officialTiktok}
                  onChange={(e) => setOfficialTiktok(e.target.value)}
                  className="h-10 text-xs border-cream-dark bg-soft-cream"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-maroon">Video Audition Guidelines & Duration Rules</Label>
              <Textarea
                rows={3}
                value={videoGuidelines}
                onChange={(e) => setVideoGuidelines(e.target.value)}
                className="text-xs border-cream-dark bg-soft-cream"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 6: FAQS & ANNOUNCEMENTS CMS */}
      {activeTab === "faqs_announcements" && (
        <Card className="border-cream-dark bg-white shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-serif font-bold text-maroon">
                Frequently Asked Questions (FAQs)
              </CardTitle>
              <CardDescription className="text-xs text-stone-600">
                Live FAQs displayed on the homepage and registration status portal.
              </CardDescription>
            </div>
            <Button
              type="button"
              onClick={addFaq}
              size="sm"
              variant="outline"
              className="gap-1.5 border-cream-dark text-maroon hover:bg-soft-cream text-xs h-8"
            >
              <Plus className="w-3.5 h-3.5 text-maroon" />
              <span>Add FAQ</span>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-4 rounded-md border border-cream-dark bg-soft-cream space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-saffron uppercase tracking-wider">
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
                  <Label className="text-xs font-bold text-maroon">Question</Label>
                  <Input
                    value={faq.q}
                    onChange={(e) => updateFaq(idx, "q", e.target.value)}
                    className="h-9 text-xs bg-white border-cream-dark"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-maroon">Answer</Label>
                  <Textarea
                    rows={2}
                    value={faq.a}
                    onChange={(e) => updateFaq(idx, "a", e.target.value)}
                    className="text-xs bg-white border-cream-dark"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* TAB 7: LEGAL POLICIES */}
      {activeTab === "legal" && (
        <Card className="border-cream-dark bg-white shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-serif font-bold text-maroon">
              Legal Policies & Minor Safeguarding Framework
            </CardTitle>
            <CardDescription className="text-xs text-stone-600">
              Institutional policies governing competition adjudication, participant terms, and privacy compliance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-md border border-cream-dark bg-soft-cream space-y-2">
                <div className="text-xs font-bold text-maroon flex items-center justify-between">
                  <span>Competition Rules & Eligibility</span>
                  <Link href="/rules" target="_blank" className="text-maroon hover:underline flex items-center gap-1 text-[11px]">
                    <span>View Live</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <p className="text-[11px] text-stone-600">
                  Defines age constraints (16-28), citizenship verification, code of conduct, and jury adjudication standards.
                </p>
              </div>

              <div className="p-4 rounded-md border border-cream-dark bg-soft-cream space-y-2">
                <div className="text-xs font-bold text-maroon flex items-center justify-between">
                  <span>Terms of Service</span>
                  <Link href="/terms" target="_blank" className="text-maroon hover:underline flex items-center gap-1 text-[11px]">
                    <span>View Live</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <p className="text-[11px] text-stone-600">
                  Governs website access, intellectual property of Mithila Queen media, and user obligations.
                </p>
              </div>

              <div className="p-4 rounded-md border border-cream-dark bg-soft-cream space-y-2">
                <div className="text-xs font-bold text-maroon flex items-center justify-between">
                  <span>Privacy Policy</span>
                  <Link href="/privacy-policy" target="_blank" className="text-maroon hover:underline flex items-center gap-1 text-[11px]">
                    <span>View Live</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <p className="text-[11px] text-stone-600">
                  Data protection policies detailing encrypted storage of participant identity proofs, contacts, and photos.
                </p>
              </div>

              <div className="p-4 rounded-md border border-cream-dark bg-soft-cream space-y-2">
                <div className="text-xs font-bold text-maroon flex items-center justify-between">
                  <span>Refund Policy</span>
                  <Link href="/refund-policy" target="_blank" className="text-maroon hover:underline flex items-center gap-1 text-[11px]">
                    <span>View Live</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <p className="text-[11px] text-stone-600">
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
          <Card className="border-cream-dark bg-white shadow-none">
            <CardHeader>
              <div className="flex items-center justify-between mb-1">
                <div className="w-9 h-9 rounded-md bg-soft-cream text-maroon border border-antique-gold/40 flex items-center justify-center">
                  <HardDrive className="w-4 h-4 text-maroon" />
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                    driveIntegration?.isConnected
                      ? "bg-soft-cream text-maroon border-saffron"
                      : "bg-soft-cream text-amber-800 border-amber-200"
                  }`}
                >
                  {driveIntegration?.isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <CardTitle className="text-lg font-serif font-bold text-maroon">
                Google Drive Storage Integration
              </CardTitle>
              <CardDescription className="text-xs text-stone-600">
                Direct OAuth 2.0 connection to stream large audition video uploads and identity documents into cloud storage.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {driveIntegration?.isConnected ? (
                <div className="p-3.5 rounded-md bg-soft-cream border border-cream-dark text-xs text-maroon space-y-1">
                  <div className="font-semibold text-maroon flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-saffron shrink-0" />
                    <span className="font-mono text-xs">{driveIntegration.accountEmail}</span>
                  </div>
                  <div className="text-xs text-stone-600 flex items-center justify-between pt-1 border-t border-cream-dark">
                    <span>Destination Folder:</span>
                    <span className="font-semibold text-maroon">{driveIntegration.folderName || "Root Drive"}</span>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-md bg-soft-cream border border-cream-dark text-xs text-maroon flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-maroon shrink-0 mt-0.5" />
                  <span>
                    Google Drive is disconnected. Connect the official organization account to receive participant video files without exhausting server disk storage.
                  </span>
                </div>
              )}

              <Link href="/admin/settings/integrations/google-drive">
                <Button
                  variant="outline"
                  className="w-full justify-between text-xs font-semibold h-10 border-cream-dark text-maroon hover:bg-soft-cream"
                >
                  <span>
                    {driveIntegration?.isConnected ? "Manage Drive & Change Folder" : "Connect Google Drive Account"}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-maroon" />
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

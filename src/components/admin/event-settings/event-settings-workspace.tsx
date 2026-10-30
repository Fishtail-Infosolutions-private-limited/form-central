"use client";

import React, { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import {
  Trophy,
  Calendar,
  Video,
  HelpCircle,
  Globe,
  Save,
  Loader2,
  ExternalLink,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateSiteSettingsAction } from "@/server/actions/site-settings-actions";
import { DEFAULT_OFFICIAL_SETTINGS } from "@/lib/constants/official-settings";
import { CompetitionDetailsTab } from "./competition-details-tab";
import { DatesVenueTab } from "./dates-venue-tab";
import { AuditionInfoTab } from "./audition-info-tab";
import { FaqsManagerTab, FaqItem } from "./faqs-manager-tab";
import {
  PublicInformationTab,
  CompetitionHighlight,
  NoticeBanner,
  ContactInfo,
  AnnouncementItem,
} from "./public-information-tab";

interface EventSettingsWorkspaceProps {
  initialSetting: any;
}

export function EventSettingsWorkspace({ initialSetting }: EventSettingsWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<
    "competition" | "dates-venue" | "auditions" | "faqs" | "public-info"
  >("competition");

  const [isPending, startTransition] = useTransition();
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // 1. Competition Details state (Pre-filled by default from official brief)
  const [competitionData, setCompetitionData] = useState({
    competitionName: initialSetting?.competitionName || DEFAULT_OFFICIAL_SETTINGS.competitionName,
    competitionTagline:
      initialSetting?.competitionTagline ||
      DEFAULT_OFFICIAL_SETTINGS.competitionTagline,
    shortIntro: initialSetting?.shortIntro || DEFAULT_OFFICIAL_SETTINGS.shortIntro,
    fullDescription: initialSetting?.fullDescription || DEFAULT_OFFICIAL_SETTINGS.fullDescription,
    organizationName: initialSetting?.organizationName || DEFAULT_OFFICIAL_SETTINGS.organizationName,
    organizationTagline:
      initialSetting?.organizationTagline || DEFAULT_OFFICIAL_SETTINGS.organizationTagline,
    officialEmail: initialSetting?.officialEmail || DEFAULT_OFFICIAL_SETTINGS.officialEmail,
    location: initialSetting?.location || DEFAULT_OFFICIAL_SETTINGS.location,
    whatsappContact: initialSetting?.whatsappContact || DEFAULT_OFFICIAL_SETTINGS.whatsappContact,
    officialInstagram: initialSetting?.officialInstagram || DEFAULT_OFFICIAL_SETTINGS.officialInstagram,
    officialTiktok: initialSetting?.officialTiktok || DEFAULT_OFFICIAL_SETTINGS.officialTiktok,
    officialFacebook: initialSetting?.officialFacebook || DEFAULT_OFFICIAL_SETTINGS.officialFacebook,
    officialYoutube: initialSetting?.officialYoutube || DEFAULT_OFFICIAL_SETTINGS.officialYoutube,
  });

  // 2. Dates & Venue state
  const formatDateToInput = (d: any) => {
    if (!d) return "";
    try {
      const dateObj = new Date(d);
      if (isNaN(dateObj.getTime())) return "";
      return dateObj.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const [datesVenueData, setDatesVenueData] = useState({
    grandFinaleDate: formatDateToInput(initialSetting?.grandFinaleDate),
    grandFinaleTime: initialSetting?.grandFinaleTime || DEFAULT_OFFICIAL_SETTINGS.grandFinaleTime,
    auditionDate: formatDateToInput(initialSetting?.auditionDate),
    auditionTime: initialSetting?.auditionTime || DEFAULT_OFFICIAL_SETTINGS.auditionTime,
    eventSchedule: initialSetting?.eventSchedule || DEFAULT_OFFICIAL_SETTINGS.eventSchedule,
    dateInstructions: initialSetting?.dateInstructions || DEFAULT_OFFICIAL_SETTINGS.dateInstructions,
    eventVenue: initialSetting?.eventVenue || DEFAULT_OFFICIAL_SETTINGS.eventVenue,
    venueAddress: initialSetting?.venueAddress || DEFAULT_OFFICIAL_SETTINGS.venueAddress,
    venueCity: initialSetting?.venueCity || DEFAULT_OFFICIAL_SETTINGS.venueCity,
    venueDirections: initialSetting?.venueDirections || "",
    venueInstructions: initialSetting?.venueInstructions || DEFAULT_OFFICIAL_SETTINGS.venueInstructions,
    registrationOpeningDate: formatDateToInput(initialSetting?.registrationOpeningDate),
    registrationClosingDate: formatDateToInput(initialSetting?.registrationClosingDate),
    isRegistrationOpen: initialSetting?.isRegistrationOpen ?? true,
  });

  // 3. Auditions state (Pre-filled from confirmed instructions)
  const [auditionData, setAuditionData] = useState({
    videoGuidelines: initialSetting?.videoGuidelines || DEFAULT_OFFICIAL_SETTINGS.videoGuidelines,
    videoDuration: initialSetting?.videoDuration || DEFAULT_OFFICIAL_SETTINGS.videoDuration,
    videoRequirements: initialSetting?.videoRequirements || DEFAULT_OFFICIAL_SETTINGS.videoRequirements,
    whatsappContact: initialSetting?.whatsappContact || DEFAULT_OFFICIAL_SETTINGS.whatsappContact,
    requiredHashtags: initialSetting?.requiredHashtags || DEFAULT_OFFICIAL_SETTINGS.requiredHashtags,
    videoSubmissionDeadline: formatDateToInput(initialSetting?.videoSubmissionDeadline),
    videoSubmissionMethod:
      initialSetting?.videoSubmissionMethod ||
      DEFAULT_OFFICIAL_SETTINGS.videoSubmissionMethod,
    applicantInstructions: initialSetting?.applicantInstructions || DEFAULT_OFFICIAL_SETTINGS.applicantInstructions,
  });

  // 4. FAQs state (normalize into FaqItem[])
  const [faqs, setFaqs] = useState<FaqItem[]>(() => {
    const raw = initialSetting?.faqsJson;
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map((item: any, idx: number) => ({
        id: item.id || `faq-${idx + 1}`,
        question: item.question || item.q || `Question #${idx + 1}`,
        answer: item.answer || item.a || "",
        category: item.category || "General",
        order: item.order || idx + 1,
        published: item.published !== false,
      }));
    }
    return [
      {
        id: "faq-1",
        question: "What is The Origin Foundation?",
        answer:
          "The Origin Foundation is a platform being developed in Janakpur Dham, Nepal, to support cultural identity, talent, and community participation through initiatives such as Mithila Queen.",
        category: "Organization & Initiative",
        order: 1,
        published: true,
      },
      {
        id: "faq-2",
        question: "What is Mithila Queen?",
        answer:
          "Mithila Queen is the flagship initiative of The Origin Foundation—a cultural and talent-oriented competition intended to celebrate Mithila's heritage, confidence, creativity, and individual talent.",
        category: "Organization & Initiative",
        order: 2,
        published: true,
      },
      {
        id: "faq-3",
        question: "What is the registration fee?",
        answer:
          "The registration fee is strictly NPR 399 per registration, payable in Nepalese rupees only.",
        category: "Fee & Payment",
        order: 3,
        published: true,
      },
      {
        id: "faq-4",
        question: "How can I pay the registration fee?",
        answer:
          "Follow the official payment instructions on the website and scan the verified payment QR code. After completing the payment, enter your transaction reference and upload the payment screenshot for administrative review.",
        category: "Fee & Payment",
        order: 4,
        published: true,
      },
      {
        id: "faq-5",
        question: "Does uploading a payment screenshot guarantee approval?",
        answer:
          "No. The organizing team independently checks and verifies the bank transfer records before the application advances to the approval review workflow.",
        category: "Fee & Payment",
        order: 5,
        published: true,
      },
      {
        id: "faq-6",
        question: "Are all three social media accounts required?",
        answer:
          "No. At least one valid Instagram, TikTok, or Facebook profile is required; the other two are optional. We never ask for passwords or private account access.",
        category: "Eligibility & Social Media",
        order: 6,
        published: true,
      },
      {
        id: "faq-7",
        question: "Who is eligible to participate?",
        answer:
          "Any female participant can join. There is no minimum or maximum age requirement. Both unmarried and married girls are welcomed. Participants under 18 years must provide legal parent/guardian consent.",
        category: "Eligibility & Social Media",
        order: 7,
        published: true,
      },
      {
        id: "faq-8",
        question: "When will the event take place?",
        answer:
          "The event schedule and venue are currently To Be Announced. Registration is conducted online via this official website. Confirmed dates will be published through official announcements.",
        category: "Schedule & Format",
        order: 8,
        published: true,
      },
      {
        id: "faq-9",
        question: "When will I receive my PDF confirmation?",
        answer:
          "After the required payment verification and application approval are both completed by administrators, your official branded confirmation PDF is automatically generated and emailed to your registered address.",
        category: "Confirmation & Documents",
        order: 9,
        published: true,
      },
      {
        id: "faq-10",
        question: "How can I contact the organizers for help?",
        answer:
          "You can reach us at originfoundation107@gmail.com, or contact Managing Directors Gaurav Gupta (+977 9704571941) or Dipendra Shah Kalwar (+977 981-2005468).",
        category: "Support & Corrections",
        order: 10,
        published: true,
      },
    ];
  });

  // 5. Public Info state
  const [publicInfoData, setPublicInfoData] = useState<{
    homepageIntroText: string;
    highlights: CompetitionHighlight[];
    notice: NoticeBanner;
    contact: ContactInfo;
    announcements: AnnouncementItem[];
  }>({
    homepageIntroText:
      initialSetting?.homepageIntroText || DEFAULT_OFFICIAL_SETTINGS.homepageIntroText,
    highlights:
      (initialSetting?.competitionHighlightsJson as any) ||
      DEFAULT_OFFICIAL_SETTINGS.competitionHighlightsJson,
    notice: (initialSetting?.importantNoticesJson as any) || {
      enabled: false,
      type: "info",
      title: "",
      message: "",
    },
    contact:
      (initialSetting?.contactInfoJson as any) || DEFAULT_OFFICIAL_SETTINGS.contactInfoJson,
    announcements:
      (initialSetting?.announcementsJson as any) &&
      (initialSetting?.announcementsJson as any).length > 0
        ? (initialSetting?.announcementsJson as any)
        : [
            {
              id: "ann-1",
              title: "Official Registrations Open for Mithila Queen",
              date: new Date().toISOString().split("T")[0],
              content:
                "Online candidate registrations are officially accepted through the website. Registration fee: NPR 399. Open to all female participants with zero prior experience required.",
              isPublished: true,
            },
          ],
  });

  // Save handler
  const handleSaveAll = () => {
    startTransition(async () => {
      try {
        const payload = {
          // Competition details
          competitionName: competitionData.competitionName,
          competitionTagline: competitionData.competitionTagline,
          shortIntro: competitionData.shortIntro,
          fullDescription: competitionData.fullDescription,
          organizationName: competitionData.organizationName,
          organizationTagline: competitionData.organizationTagline,
          officialEmail: competitionData.officialEmail,
          location: competitionData.location,
          whatsappContact: competitionData.whatsappContact,
          officialInstagram: competitionData.officialInstagram,
          officialTiktok: competitionData.officialTiktok,
          officialFacebook: competitionData.officialFacebook,
          officialYoutube: competitionData.officialYoutube,

          // Dates & Venue
          grandFinaleDate: datesVenueData.grandFinaleDate ? datesVenueData.grandFinaleDate : null,
          grandFinaleTime: datesVenueData.grandFinaleTime || null,
          auditionDate: datesVenueData.auditionDate ? datesVenueData.auditionDate : null,
          auditionTime: datesVenueData.auditionTime || null,
          eventSchedule: datesVenueData.eventSchedule || "To Be Announced",
          dateInstructions: datesVenueData.dateInstructions || null,
          eventVenue: datesVenueData.eventVenue || "To Be Announced",
          venueAddress: datesVenueData.venueAddress || null,
          venueCity: datesVenueData.venueCity || "Janakpur Dham, Nepal",
          venueDirections: datesVenueData.venueDirections || null,
          venueInstructions: datesVenueData.venueInstructions || null,
          registrationOpeningDate: datesVenueData.registrationOpeningDate ? datesVenueData.registrationOpeningDate : null,
          registrationClosingDate: datesVenueData.registrationClosingDate ? datesVenueData.registrationClosingDate : null,
          isRegistrationOpen: datesVenueData.isRegistrationOpen ?? true,

          // Audition details
          videoGuidelines: auditionData.videoGuidelines || null,
          videoDuration: auditionData.videoDuration || null,
          videoRequirements: auditionData.videoRequirements || null,
          requiredHashtags: auditionData.requiredHashtags || null,
          videoSubmissionDeadline: auditionData.videoSubmissionDeadline
            ? auditionData.videoSubmissionDeadline
            : null,
          videoSubmissionMethod: auditionData.videoSubmissionMethod || null,
          applicantInstructions: auditionData.applicantInstructions || null,

          // FAQs (persisted as JSON)
          faqsJson: faqs,

          // Public Info (persisted as JSON)
          homepageIntroText: publicInfoData.homepageIntroText || null,
          competitionHighlightsJson: publicInfoData.highlights,
          importantNoticesJson: publicInfoData.notice,
          contactInfoJson: publicInfoData.contact,
          announcementsJson: publicInfoData.announcements,
        };

        const result = await updateSiteSettingsAction(payload);
        if (result.success) {
          setLastSavedAt(new Date());
          toast.success("Event settings saved and updated across the public website.");
        } else {
          toast.error(result.error || "Failed to update event settings.");
        }
      } catch (err: any) {
        console.error("Save error:", err);
        toast.error("An unexpected error occurred while saving.");
      }
    });
  };

  // Keyboard shortcut Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSaveAll();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const publishedFaqCount = faqs.filter(
    (f) => f.published && f.question.trim().length > 0 && f.answer.trim().length > 0
  ).length;

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      {/* Top Header Bar */}
      <div className="bg-white p-5 rounded-xl border border-[var(--color-brand-border,#DCD8D1)] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-[var(--color-brand-text,#292824)] tracking-tight">
              Event Settings
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--color-brand-surface,#F3F1ED)] text-[var(--color-brand-muted,#8A8580)] border border-[var(--color-brand-border,#DCD8D1)]">
              Mithila Queen
            </span>
          </div>
          <p className="text-xs text-[var(--color-brand-muted,#8A8580)] mt-1">
            Manage competition details, audition guidelines, dates, venue, FAQs, and public presentation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastSavedAt && (
            <span className="text-[11px] text-stone-500 font-mono hidden sm:inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Saved {lastSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </span>
          )}

          <Link href="/mithila-queen" target="_blank" rel="noopener noreferrer">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-9 border-[var(--color-brand-border,#DCD8D1)] text-[var(--color-brand-text,#292824)] hover:bg-[var(--color-brand-surface,#F3F1ED)] gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[var(--color-brand-muted,#8A8580)]" />
              <span>View Public Site</span>
            </Button>
          </Link>

          <Button
            type="button"
            size="sm"
            disabled={isPending}
            onClick={handleSaveAll}
            className="text-xs h-9 bg-[var(--color-brand-primary,#5C5751)] hover:bg-[var(--color-brand-primary,#5C5751)]/90 text-white font-semibold gap-1.5 shadow-xs"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 5-Tab Navigation Bar */}
      <div className="flex items-center gap-1 border-b border-[var(--color-brand-border,#DCD8D1)] pb-px overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("competition")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors shrink-0 ${
            activeTab === "competition"
              ? "bg-white border-t-2 border-t-[var(--color-brand-primary,#5C5751)] text-[var(--color-brand-text,#292824)] border-x border-[var(--color-brand-border,#DCD8D1)] -mb-px"
              : "text-[var(--color-brand-muted,#8A8580)] hover:text-[var(--color-brand-text,#292824)] hover:bg-[var(--color-brand-surface,#F3F1ED)]/50"
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Competition Details</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("dates-venue")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors shrink-0 ${
            activeTab === "dates-venue"
              ? "bg-white border-t-2 border-t-[var(--color-brand-primary,#5C5751)] text-[var(--color-brand-text,#292824)] border-x border-[var(--color-brand-border,#DCD8D1)] -mb-px"
              : "text-[var(--color-brand-muted,#8A8580)] hover:text-[var(--color-brand-text,#292824)] hover:bg-[var(--color-brand-surface,#F3F1ED)]/50"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Dates & Venue</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--color-brand-surface,#F3F1ED)] border border-[var(--color-brand-border,#DCD8D1)]">
            {datesVenueData.grandFinaleDate ? "Confirmed" : "TBA"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("auditions")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors shrink-0 ${
            activeTab === "auditions"
              ? "bg-white border-t-2 border-t-[var(--color-brand-primary,#5C5751)] text-[var(--color-brand-text,#292824)] border-x border-[var(--color-brand-border,#DCD8D1)] -mb-px"
              : "text-[var(--color-brand-muted,#8A8580)] hover:text-[var(--color-brand-text,#292824)] hover:bg-[var(--color-brand-surface,#F3F1ED)]/50"
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>Audition Information</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("faqs")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors shrink-0 ${
            activeTab === "faqs"
              ? "bg-white border-t-2 border-t-[var(--color-brand-primary,#5C5751)] text-[var(--color-brand-text,#292824)] border-x border-[var(--color-brand-border,#DCD8D1)] -mb-px"
              : "text-[var(--color-brand-muted,#8A8580)] hover:text-[var(--color-brand-text,#292824)] hover:bg-[var(--color-brand-surface,#F3F1ED)]/50"
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>FAQs</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--color-brand-surface,#F3F1ED)] border border-[var(--color-brand-border,#DCD8D1)]">
            {publishedFaqCount}/10
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("public-info")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors shrink-0 ${
            activeTab === "public-info"
              ? "bg-white border-t-2 border-t-[var(--color-brand-primary,#5C5751)] text-[var(--color-brand-text,#292824)] border-x border-[var(--color-brand-border,#DCD8D1)] -mb-px"
              : "text-[var(--color-brand-muted,#8A8580)] hover:text-[var(--color-brand-text,#292824)] hover:bg-[var(--color-brand-surface,#F3F1ED)]/50"
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Public Information</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "competition" && (
          <CompetitionDetailsTab
            data={competitionData}
            onChange={(updates) => setCompetitionData((prev) => ({ ...prev, ...updates }))}
          />
        )}

        {activeTab === "dates-venue" && (
          <DatesVenueTab
            data={datesVenueData}
            onChange={(updates) => setDatesVenueData((prev) => ({ ...prev, ...updates }))}
          />
        )}

        {activeTab === "auditions" && (
          <AuditionInfoTab
            data={auditionData}
            onChange={(updates) => setAuditionData((prev) => ({ ...prev, ...updates }))}
          />
        )}

        {activeTab === "faqs" && (
          <FaqsManagerTab
            faqs={faqs}
            onChange={(updatedFaqs) => setFaqs(updatedFaqs)}
          />
        )}

        {activeTab === "public-info" && (
          <PublicInformationTab
            data={publicInfoData}
            onChange={(updates) => setPublicInfoData((prev) => ({ ...prev, ...updates }))}
          />
        )}
      </div>
    </div>
  );
}


"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  ArrowLeft,
  Users,
  Eye,
  Send,
  Clock,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Monitor,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  AVAILABLE_EMAIL_VARIABLES,
  renderEmailTemplate,
  getSamplePreviewContext,
  EmailVariableDefinition,
} from "@/lib/email/variables";
import { wrapInFormSuiteEmailLayout } from "@/lib/email/html-wrapper";
import {
  estimateRecipientsAction,
  sendTestEmailAction,
  createCampaignAction,
} from "@/server/actions/campaign-actions";
import { toast } from "sonner";

interface FormOption {
  id: string;
  name: string;
  slug: string;
  eventDate?: string | null;
  eventVenue?: string | null;
  categories: string[];
}

interface TemplateOption {
  id: string;
  name: string;
  category: string;
  subject: string;
  bodyHtml: string;
}

interface CampaignCreatorFormProps {
  forms: FormOption[];
  templates: TemplateOption[];
  previousCampaigns: { id: string; name: string }[];
  adminEmail: string;
}

export function CampaignCreatorForm({
  forms,
  templates,
  previousCampaigns,
  adminEmail,
}: CampaignCreatorFormProps) {
  const router = useRouter();

  // Basic Details
  const [name, setName] = useState("");
  const [selectedFormId, setSelectedFormId] = useState(forms[0]?.id || "");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  // Recipient Selection
  const [recipientType, setRecipientType] = useState<
    "ALL" | "APPROVED" | "PENDING" | "REJECTED" | "CATEGORY" | "MANUAL" | "EXCLUDE_CAMPAIGN"
  >("ALL");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [excludeCampaignId, setExcludeCampaignId] = useState("");
  const [excludeUnsubscribed, setExcludeUnsubscribed] = useState(true);

  // Scheduling (Nepal Time)
  const [sendOption, setSendOption] = useState<"immediate" | "scheduled">("immediate");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("08:00");

  // Recipient Estimation State
  const [estimatedCount, setEstimatedCount] = useState<number | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [sampleRecipients, setSampleRecipients] = useState<string[]>([]);

  // Preview & Test Email State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testEmailInput, setTestEmailInput] = useState(adminEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedForm = forms.find((f) => f.id === selectedFormId);

  // Recalculate estimated recipients when form or criteria change
  useEffect(() => {
    if (!selectedFormId) return;

    let isMounted = true;
    setIsEstimating(true);

    const timer = setTimeout(async () => {
      const res = await estimateRecipientsAction(selectedFormId, {
        type: recipientType,
        categoryValue: recipientType === "CATEGORY" ? selectedCategory : undefined,
        excludeCampaignId: recipientType === "EXCLUDE_CAMPAIGN" ? excludeCampaignId : undefined,
        excludeUnsubscribed,
      });

      if (isMounted) {
        setIsEstimating(false);
        if (res.success) {
          setEstimatedCount(res.count);
          setSampleRecipients(res.sampleNames || []);
        } else {
          setEstimatedCount(0);
        }
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [selectedFormId, recipientType, selectedCategory, excludeCampaignId, excludeUnsubscribed]);

  // Handle template selection
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (!templateId) return;

    const tpl = templates.find((t) => t.id === templateId);
    if (tpl) {
      setSubject(tpl.subject);
      setContent(tpl.bodyHtml);
      if (!name) {
        setName(`${tpl.name} – ${selectedForm?.name || "Run"}`);
      }
    }
  };

  // Insert variable into active editor
  const handleInsertVariable = (varKey: string) => {
    const token = `{{${varKey}}}`;
    setContent((prev) => prev + token);
    toast.success(`Inserted ${token}`);
  };

  // Send Test Email
  const handleSendTestEmail = async () => {
    if (!testEmailInput || !testEmailInput.includes("@")) {
      toast.error("Please enter a valid test email address.");
      return;
    }
    if (!subject.trim() || !content.trim()) {
      toast.error("Please provide both subject and email content first.");
      return;
    }

    setIsSendingTest(true);
    const res = await sendTestEmailAction({
      formId: selectedFormId,
      subject,
      content,
      testEmail: testEmailInput.trim(),
    });
    setIsSendingTest(false);

    if (res.success) {
      toast.success(`Test email successfully delivered to ${testEmailInput}!`);
    } else {
      toast.error(res.error || "Failed to send test email");
    }
  };

  // Submit Campaign
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Please enter an internal campaign name.");
      return;
    }
    if (!subject.trim()) {
      setErrorMessage("Please enter an email subject.");
      return;
    }
    if (!content.trim()) {
      setErrorMessage("Please write email content.");
      return;
    }
    if (sendOption === "scheduled" && !scheduledDate) {
      setErrorMessage("Please select a scheduled date in Nepal Time.");
      return;
    }

    setIsSubmitting(true);

    const res = await createCampaignAction({
      name: name.trim(),
      formId: selectedFormId,
      templateId: selectedTemplateId || undefined,
      subject: subject.trim(),
      content: content.trim(),
      criteria: {
        type: recipientType,
        categoryValue: recipientType === "CATEGORY" ? selectedCategory : undefined,
        excludeCampaignId: recipientType === "EXCLUDE_CAMPAIGN" ? excludeCampaignId : undefined,
        excludeUnsubscribed,
      },
      sendOption,
      scheduledDate: sendOption === "scheduled" ? scheduledDate : undefined,
      scheduledTime: sendOption === "scheduled" ? scheduledTime : undefined,
    });

    setIsSubmitting(false);

    if (res.success && res.campaignId) {
      toast.success(
        sendOption === "immediate"
          ? "Campaign enqueued! Background delivery started."
          : "Campaign scheduled successfully!"
      );
      router.push(`/admin/campaigns/${res.campaignId}`);
    } else {
      setErrorMessage(res.error || "Failed to create campaign.");
    }
  };

  // Live HTML Preview Generation
  const previewContext = getSamplePreviewContext({
    event_name: selectedForm?.name || "Pokhara City Run 2026",
    event_date: selectedForm?.eventDate || "November 15, 2026",
    event_venue: selectedForm?.eventVenue || "Pokhara Stadium",
    participant_name: "Bibek Poudel",
    participant_email: "runner@example.com",
    participant_category: selectedCategory || "21K Half Marathon",
  });

  const renderedPreviewSubject = renderEmailTemplate(subject || "Email Subject Preview", previewContext, {
    isHtml: false,
  });
  const renderedPreviewBody = renderEmailTemplate(content || "<p>Write your email content...</p>", previewContext, {
    isHtml: true,
  });
  const renderedPreviewHtml = wrapInFormSuiteEmailLayout({
    eventTitle: selectedForm?.name || "FormSuite Event",
    badgeText: "Official Participant Notice",
    bodyHtml: renderedPreviewBody,
    unsubscribeUrl: "http://localhost:3000/unsubscribe?token=preview-token",
    showUnsubscribe: true,
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/campaigns"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Campaigns</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewOpen(true)}
            className="text-xs font-bold gap-1.5 h-8 border-zinc-200"
          >
            <Eye className="w-3.5 h-3.5 text-zinc-500" />
            <span>Preview Email</span>
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campaign Info Card */}
        <Card className="border-zinc-200 shadow-2xs">
          <CardHeader className="pb-4 border-b border-zinc-100">
            <CardTitle className="text-lg font-bold text-zinc-900">
              1. Campaign Details & Event Selection
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              Select the competition form and name this internal campaign.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-900">
                  Select Event / Form <span className="text-rose-500">*</span>
                </Label>
                <select
                  value={selectedFormId}
                  onChange={(e) => setSelectedFormId(e.target.value)}
                  className="w-full text-xs bg-white border border-zinc-200 rounded-lg px-3 py-2 text-zinc-900 focus:outline-emerald-600 font-medium"
                >
                  {forms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-900">
                  Campaign Name (Internal) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="e.g. Pokhara City Run 2026 – Bib Collection Notice"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-xs h-9 font-medium"
                  required
                />
              </div>
            </div>

            {/* Template Selector */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-zinc-900">
                  Predefined Email Template (Optional)
                </Label>
                <span className="text-[11px] text-zinc-400">Choose a template to pre-fill subject & body</span>
              </div>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleSelectTemplate(e.target.value)}
                className="w-full text-xs bg-white border border-zinc-200 rounded-lg px-3 py-2 text-zinc-900 focus:outline-emerald-600 font-medium"
              >
                <option value="">-- Custom Email (Start from scratch) --</option>
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    [{tpl.category}] {tpl.name}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Email Content Editor Card */}
        <Card className="border-zinc-200 shadow-2xs">
          <CardHeader className="pb-4 border-b border-zinc-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-zinc-900">
                2. Email Subject & Message Content
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                Compose your message. Dynamic tokens like <code className="bg-zinc-100 px-1 py-0.5 rounded text-[11px] text-emerald-700">{"{{participant_name}}"}</code> will be substituted automatically.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            {/* Dynamic Variable Chips */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Available Dynamic Variables (Click to Insert):</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_EMAIL_VARIABLES.map((v) => (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => handleInsertVariable(v.key)}
                    className="inline-flex items-center gap-1 text-[11px] bg-white border border-zinc-200 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded-md font-mono transition-colors shadow-2xs"
                    title={v.description}
                  >
                    <span>{`{{${v.key}}}`}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Input */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-900">
                Email Subject <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder="e.g. Important Announcement – {{event_name}}"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="text-xs h-9 font-medium"
                required
              />
            </div>

            {/* Body Editor */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-zinc-900">
                  Email Message Body (HTML / Formatted Text) <span className="text-rose-500">*</span>
                </Label>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="text-[11px] text-emerald-700 hover:underline font-bold"
                >
                  View live render &rarr;
                </button>
              </div>
              <textarea
                rows={10}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your email body here. HTML formatting (e.g. <p>, <strong>, <ul>) is supported."
                className="w-full text-xs font-mono bg-white border border-zinc-200 rounded-lg p-3 text-zinc-900 focus:outline-emerald-600 leading-relaxed"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Recipient Targeting Card */}
        <Card className="border-zinc-200 shadow-2xs">
          <CardHeader className="pb-4 border-b border-zinc-100">
            <CardTitle className="text-lg font-bold text-zinc-900">
              3. Recipient Targeting & Audience
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              Target specific groups of registered participants. Only verified submissions are included.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-900">
                  Recipient Audience Selection
                </Label>
                <select
                  value={recipientType}
                  onChange={(e) => setRecipientType(e.target.value as any)}
                  className="w-full text-xs bg-white border border-zinc-200 rounded-lg px-3 py-2 text-zinc-900 focus:outline-emerald-600 font-medium"
                >
                  <option value="ALL">All Registered Participants</option>
                  <option value="APPROVED">Approved Participants Only</option>
                  <option value="PENDING">Pending Approval Only</option>
                  <option value="REJECTED">Rejected Participants Only</option>
                  <option value="CATEGORY">By Registration Category</option>
                  <option value="EXCLUDE_CAMPAIGN">Exclude Previous Campaign</option>
                </select>
              </div>

              {/* Conditional Sub-selectors */}
              {recipientType === "CATEGORY" && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-900">Select Category</Label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full text-xs bg-white border border-zinc-200 rounded-lg px-3 py-2 text-zinc-900 focus:outline-emerald-600 font-medium"
                  >
                    <option value="">-- Choose Category --</option>
                    {selectedForm?.categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {recipientType === "EXCLUDE_CAMPAIGN" && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-900">Exclude Recipients Of</Label>
                  <select
                    value={excludeCampaignId}
                    onChange={(e) => setExcludeCampaignId(e.target.value)}
                    className="w-full text-xs bg-white border border-zinc-200 rounded-lg px-3 py-2 text-zinc-900 focus:outline-emerald-600 font-medium"
                  >
                    <option value="">-- Choose Campaign to Exclude --</option>
                    {previousCampaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Recipient Count Indicator */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900">
                    Estimated Recipients:
                  </div>
                  <div className="text-lg font-black text-emerald-800 font-mono">
                    {isEstimating ? (
                      <span className="flex items-center gap-1.5 text-xs text-emerald-700">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Estimating audience...</span>
                      </span>
                    ) : (
                      `${estimatedCount !== null ? estimatedCount.toLocaleString() : 0} Participants`
                    )}
                  </div>
                </div>
              </div>

              {sampleRecipients.length > 0 && (
                <div className="text-[11px] text-emerald-900/80 max-w-xs truncate">
                  Sample: {sampleRecipients.slice(0, 2).join(", ")}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Scheduling & Send Options Card */}
        <Card className="border-zinc-200 shadow-2xs">
          <CardHeader className="pb-4 border-b border-zinc-100">
            <CardTitle className="text-lg font-bold text-zinc-900">
              4. Delivery Schedule (Nepal Time - Asia/Kathmandu)
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              Send immediately or schedule for a future date/time.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  sendOption === "immediate"
                    ? "border-emerald-600 bg-emerald-50/40 text-black shadow-2xs"
                    : "border-zinc-200 hover:bg-zinc-50 text-zinc-600"
                }`}
              >
                <input
                  type="radio"
                  name="sendOption"
                  checked={sendOption === "immediate"}
                  onChange={() => setSendOption("immediate")}
                  className="accent-emerald-600"
                />
                <div>
                  <span className="text-xs font-bold block text-zinc-900">Send Immediately</span>
                  <span className="text-[11px] text-zinc-500">Queue and start delivery right away</span>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  sendOption === "scheduled"
                    ? "border-emerald-600 bg-emerald-50/40 text-black shadow-2xs"
                    : "border-zinc-200 hover:bg-zinc-50 text-zinc-600"
                }`}
              >
                <input
                  type="radio"
                  name="sendOption"
                  checked={sendOption === "scheduled"}
                  onChange={() => setSendOption("scheduled")}
                  className="accent-emerald-600"
                />
                <div>
                  <span className="text-xs font-bold block text-zinc-900">Schedule for Later</span>
                  <span className="text-[11px] text-zinc-500">Deliver at a specific date and time (NPT)</span>
                </div>
              </label>
            </div>

            {sendOption === "scheduled" && (
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  <span>Configure Schedule in Nepal Time (UTC+05:45):</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-zinc-900">Date (YYYY-MM-DD)</Label>
                    <Input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="text-xs h-9 bg-white"
                      required={sendOption === "scheduled"}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-zinc-900">Time (NPT)</Label>
                    <Input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="text-xs h-9 bg-white"
                      required={sendOption === "scheduled"}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Test Email & Action Footer */}
        <div className="bg-zinc-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg border border-zinc-800">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Input
              type="email"
              placeholder="admin@example.com"
              value={testEmailInput}
              onChange={(e) => setTestEmailInput(e.target.value)}
              className="text-xs h-9 bg-zinc-800 border-zinc-700 text-white w-full sm:w-64"
            />
            <Button
              type="button"
              variant="outline"
              disabled={isSendingTest}
              onClick={handleSendTestEmail}
              className="h-9 px-3 text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700 shrink-0"
            >
              {isSendingTest ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              )}
              <span>Send Test</span>
            </Button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <Link href="/admin/campaigns">
              <Button type="button" variant="ghost" className="h-9 text-xs text-zinc-400 hover:text-white">
                Cancel
              </Button>
            </Link>

            <Button
              type="submit"
              disabled={isSubmitting || isEstimating}
              className="h-9 px-6 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shadow-sm rounded-xl"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : sendOption === "immediate" ? (
                <Send className="w-3.5 h-3.5" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
              <span>
                {sendOption === "immediate"
                  ? `Send Campaign (${estimatedCount !== null ? estimatedCount : 0})`
                  : "Schedule Campaign"}
              </span>
            </Button>
          </div>
        </div>
      </form>

      {/* Live Email Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-zinc-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-zinc-900">Email Client Preview</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Device Switcher */}
                <div className="bg-zinc-200/80 p-0.5 rounded-lg flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={`p-1 rounded text-xs font-semibold flex items-center gap-1 ${
                      previewDevice === "desktop" ? "bg-white text-zinc-900 shadow-2xs" : "text-zinc-600"
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Desktop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className={`p-1 rounded text-xs font-semibold flex items-center gap-1 ${
                      previewDevice === "mobile" ? "bg-white text-zinc-900 shadow-2xs" : "text-zinc-600"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile</span>
                  </button>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsPreviewOpen(false)}
                  className="h-8 px-2.5 text-xs font-bold"
                >
                  Close
                </Button>
              </div>
            </div>

            {/* Subject preview */}
            <div className="px-6 py-3 bg-zinc-100 border-b border-zinc-200 text-xs">
              <span className="font-bold text-zinc-500 mr-2">Subject:</span>
              <span className="font-semibold text-zinc-900">{renderedPreviewSubject}</span>
            </div>

            {/* Preview Frame */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-zinc-100 flex justify-center">
              <div
                className={`bg-white rounded-xl shadow-md border border-zinc-200 overflow-hidden transition-all duration-200 ${
                  previewDevice === "mobile" ? "max-w-sm w-full" : "max-w-xl w-full"
                }`}
              >
                <div dangerouslySetInnerHTML={{ __html: renderedPreviewHtml }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  ArrowLeft,
  Play,
  Pause,
  XCircle,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Loader2,
  Users,
  Search,
  ExternalLink,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  pauseCampaignAction,
  resumeCampaignAction,
  cancelCampaignAction,
  retryFailedRecipientsAction,
  getCampaignProgressAction,
} from "@/server/actions/campaign-actions";
import { toast } from "sonner";
import { formatNepalTime } from "@/lib/utils/timezone";

interface RecipientItem {
  id: string;
  fullName: string;
  email: string;
  status: string;
  attemptCount: number;
  lastError: string | null;
  sentAt: string | null;
  deliveredAt: string | null;
  providerMessageId: string | null;
}

interface LogItem {
  id: string;
  email: string;
  event: string;
  details: string | null;
  createdAt: string;
}

interface CampaignDetail {
  id: string;
  name: string;
  subject: string;
  content: string;
  status: string;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  skippedCount: number;
  scheduledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  form: {
    id: string;
    name: string;
    slug: string;
  };
  recipients: RecipientItem[];
  logs: LogItem[];
}

interface CampaignDetailViewProps {
  campaign: CampaignDetail;
}

export function CampaignDetailView({ campaign: initialCampaign }: CampaignDetailViewProps) {
  const [campaign, setCampaign] = useState<CampaignDetail>(initialCampaign);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [recipientFilter, setRecipientFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState<"recipients" | "logs">("recipients");

  // Lightweight polling while campaign is QUEUED or PROCESSING
  useEffect(() => {
    if (!["QUEUED", "PROCESSING"].includes(campaign.status)) return;

    const interval = setInterval(async () => {
      const res = await getCampaignProgressAction(campaign.id);
      if (res.success && res.campaign) {
        setCampaign((prev) => ({
          ...prev,
          status: res.campaign!.status,
          totalRecipients: res.campaign!.totalRecipients,
          sentCount: res.campaign!.sentCount,
          failedCount: res.campaign!.failedCount,
          skippedCount: res.campaign!.skippedCount,
          startedAt: res.campaign!.startedAt?.toISOString() || prev.startedAt,
          completedAt: res.campaign!.completedAt?.toISOString() || prev.completedAt,
        }));
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [campaign.id, campaign.status]);

  const handlePause = async () => {
    setActionLoading(true);
    const res = await pauseCampaignAction(campaign.id);
    setActionLoading(false);
    if (res.success) {
      toast.success("Campaign paused.");
      setCampaign((prev) => ({ ...prev, status: "PAUSED" }));
    } else {
      toast.error(res.error || "Failed to pause campaign");
    }
  };

  const handleResume = async () => {
    setActionLoading(true);
    const res = await resumeCampaignAction(campaign.id);
    setActionLoading(false);
    if (res.success) {
      toast.success("Campaign resumed.");
      setCampaign((prev) => ({ ...prev, status: "PROCESSING" }));
    } else {
      toast.error(res.error || "Failed to resume campaign");
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel remaining unsent recipients for this campaign?")) {
      return;
    }
    setActionLoading(true);
    const res = await cancelCampaignAction(campaign.id);
    setActionLoading(false);
    if (res.success) {
      toast.success("Campaign cancelled.");
      setCampaign((prev) => ({ ...prev, status: "CANCELLED" }));
    } else {
      toast.error(res.error || "Failed to cancel campaign");
    }
  };

  const handleRetryFailed = async () => {
    setActionLoading(true);
    const res = await retryFailedRecipientsAction(campaign.id);
    setActionLoading(false);
    if (res.success) {
      toast.success(`Retrying ${res.retriedCount} failed recipients.`);
      setCampaign((prev) => ({ ...prev, status: "PROCESSING", failedCount: 0 }));
    } else {
      toast.error(res.error || "Failed to retry recipients");
    }
  };

  const processedCount = campaign.sentCount + campaign.failedCount + campaign.skippedCount;
  const progressPercent =
    campaign.totalRecipients > 0 ? Math.round((processedCount / campaign.totalRecipients) * 100) : 0;
  const inQueueCount = Math.max(0, campaign.totalRecipients - processedCount);

  const filteredRecipients = campaign.recipients.filter((r) => {
    if (recipientFilter !== "ALL" && r.status !== recipientFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return r.fullName.toLowerCase().includes(q) || r.email.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <Link
            href="/admin/campaigns"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Campaigns</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              {campaign.name}
            </h1>
            <Badge
              className={`text-xs px-2.5 py-0.5 font-bold uppercase tracking-wide ${
                campaign.status === "COMPLETED"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : campaign.status === "PROCESSING"
                  ? "bg-blue-50 text-blue-800 border-blue-200 animate-pulse"
                  : campaign.status === "QUEUED"
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : campaign.status === "SCHEDULED"
                  ? "bg-purple-50 text-purple-800 border-purple-200"
                  : "bg-zinc-100 text-zinc-800 border-zinc-200"
              }`}
            >
              {campaign.status}
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Associated Form:{" "}
            <Link
              href={`/admin/forms/${campaign.form.id}`}
              className="text-emerald-700 font-bold hover:underline"
            >
              {campaign.form.name}
            </Link>{" "}
            &bull; Subject: <span className="font-medium text-zinc-700">{campaign.subject}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {campaign.status === "PROCESSING" && (
            <Button
              size="sm"
              variant="outline"
              disabled={actionLoading}
              onClick={handlePause}
              className="h-8 text-xs font-bold text-amber-700 border-amber-200 hover:bg-amber-50"
            >
              <Pause className="w-3.5 h-3.5 mr-1.5" />
              <span>Pause Campaign</span>
            </Button>
          )}

          {campaign.status === "PAUSED" && (
            <Button
              size="sm"
              variant="outline"
              disabled={actionLoading}
              onClick={handleResume}
              className="h-8 text-xs font-bold text-emerald-700 border-emerald-200 hover:bg-emerald-50"
            >
              <Play className="w-3.5 h-3.5 mr-1.5" />
              <span>Resume Sending</span>
            </Button>
          )}

          {campaign.failedCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              disabled={actionLoading}
              onClick={handleRetryFailed}
              className="h-8 text-xs font-bold text-zinc-700 border-zinc-200 hover:bg-zinc-100"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              <span>Retry Failed ({campaign.failedCount})</span>
            </Button>
          )}

          {["QUEUED", "SCHEDULED", "PROCESSING", "PAUSED"].includes(campaign.status) && (
            <Button
              size="sm"
              variant="outline"
              disabled={actionLoading}
              onClick={handleCancel}
              className="h-8 text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50"
            >
              <XCircle className="w-3.5 h-3.5 mr-1.5" />
              <span>Cancel Campaign</span>
            </Button>
          )}
        </div>
      </div>

      {/* Progress & Metrics */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs space-y-6">
        <div>
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-zinc-700">Delivery Completion Progress</span>
            <span className="text-emerald-700 font-mono text-sm">{progressPercent}%</span>
          </div>
          <div className="w-full bg-zinc-100 h-3 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                campaign.status === "COMPLETED" ? "bg-emerald-500" : "bg-emerald-600"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-zinc-100">
          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
            <span className="text-[11px] font-medium text-zinc-500 block">Total Recipients</span>
            <span className="text-xl font-black text-zinc-900 font-mono">
              {campaign.totalRecipients.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
            <span className="text-[11px] font-medium text-emerald-800 block">Successfully Sent</span>
            <span className="text-xl font-black text-emerald-700 font-mono">
              {campaign.sentCount.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100">
            <span className="text-[11px] font-medium text-amber-800 block">Pending In Queue</span>
            <span className="text-xl font-black text-amber-700 font-mono">
              {inQueueCount.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100">
            <span className="text-[11px] font-medium text-rose-800 block">Failed / Bounced</span>
            <span className="text-xl font-black text-rose-700 font-mono">
              {campaign.failedCount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs: Recipients vs Delivery Logs */}
      <div className="flex items-center justify-between border-b border-zinc-200">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setActiveTab("recipients")}
            className={`pb-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "recipients"
                ? "border-emerald-600 text-black"
                : "border-transparent text-zinc-400 hover:text-zinc-700"
            }`}
          >
            Recipient Records ({campaign.recipients.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("logs")}
            className={`pb-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "logs"
                ? "border-emerald-600 text-black"
                : "border-transparent text-zinc-400 hover:text-zinc-700"
            }`}
          >
            Audit & Delivery Logs ({campaign.logs.length})
          </button>
        </div>
      </div>

      {/* Recipient Table */}
      {activeTab === "recipients" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-zinc-200 p-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {["ALL", "SENT", "DELIVERED", "QUEUED", "PROCESSING", "FAILED", "SKIPPED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setRecipientFilter(st)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all ${
                    recipientFilter === st
                      ? "bg-black text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search participant name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-lg pl-9 pr-3 py-1.5 focus:outline-emerald-600"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-zinc-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/75 text-zinc-500 font-semibold">
                  <th className="py-3 px-4">Participant</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Attempts</th>
                  <th className="py-3 px-4">Sent / Delivery Time</th>
                  <th className="py-3 px-4">Details / Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredRecipients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-400">
                      No matching recipients found.
                    </td>
                  </tr>
                ) : (
                  filteredRecipients.map((rec) => (
                    <tr key={rec.id} className="hover:bg-zinc-50/50">
                      <td className="py-3 px-4 font-bold text-zinc-900">{rec.fullName}</td>
                      <td className="py-3 px-4 text-zinc-600 font-mono text-[11px]">{rec.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            rec.status === "SENT" || rec.status === "DELIVERED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : rec.status === "FAILED" || rec.status === "BOUNCED"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : rec.status === "SKIPPED"
                              ? "bg-zinc-100 text-zinc-600 border border-zinc-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-zinc-600">
                        {rec.attemptCount} / 3
                      </td>
                      <td className="py-3 px-4 text-zinc-500 text-[11px] whitespace-nowrap">
                        {rec.sentAt ? formatNepalTime(new Date(rec.sentAt), "MMM dd, yyyy hh:mm a") : "—"}
                      </td>
                      <td className="py-3 px-4 text-zinc-500 text-[11px] max-w-xs truncate" title={rec.lastError || ""}>
                        {rec.lastError || (rec.providerMessageId ? `Msg ID: ${rec.providerMessageId}` : "—")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Logs Table */}
      {activeTab === "logs" && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-2xs overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/75 text-zinc-500 font-semibold">
                <th className="py-3 px-4">Timestamp (Nepal Time)</th>
                <th className="py-3 px-4">Target / Entity</th>
                <th className="py-3 px-4">Event</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-mono text-[11px]">
              {campaign.logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-zinc-400 font-sans text-xs">
                    No log entries recorded.
                  </td>
                </tr>
              ) : (
                campaign.logs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-50/50">
                    <td className="py-2.5 px-4 text-zinc-500 whitespace-nowrap">
                      {formatNepalTime(new Date(log.createdAt), "MMM dd, hh:mm:ss a")}
                    </td>
                    <td className="py-2.5 px-4 text-zinc-700">{log.email}</td>
                    <td className="py-2.5 px-4 font-bold text-zinc-900">{log.event}</td>
                    <td className="py-2.5 px-4 text-zinc-600 font-sans max-w-md truncate" title={log.details || ""}>
                      {log.details || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

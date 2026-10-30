"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Plus,
  Play,
  Pause,
  XCircle,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Send,
  Users,
  Search,
  Copy,
  Calendar,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  pauseCampaignAction,
  resumeCampaignAction,
  cancelCampaignAction,
  retryFailedRecipientsAction,
} from "@/server/actions/campaign-actions";
import { toast } from "sonner";
import { formatNepalTime } from "@/lib/utils/timezone";

interface CampaignItem {
  id: string;
  name: string;
  subject: string;
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
}

interface CampaignListViewProps {
  campaigns: CampaignItem[];
  stats: {
    totalSent: number;
    totalScheduled: number;
    totalQueued: number;
    totalFailed: number;
  };
}

const STATUS_FILTERS = [
  { id: "ALL", label: "All" },
  { id: "DRAFT", label: "Drafts" },
  { id: "SCHEDULED", label: "Scheduled" },
  { id: "QUEUED", label: "Queued" },
  { id: "PROCESSING", label: "Sending" },
  { id: "COMPLETED", label: "Completed" },
  { id: "FAILED", label: "Failed" },
  { id: "PAUSED", label: "Paused" },
  { id: "CANCELLED", label: "Cancelled" },
];

export function CampaignListView({
  campaigns: initialCampaigns,
  stats,
}: CampaignListViewProps) {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(initialCampaigns);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const handlePause = async (id: string) => {
    setActionLoadingId(id);
    const res = await pauseCampaignAction(id);
    setActionLoadingId(null);
    if (res.success) {
      toast.success("Delivery paused.");
      setCampaigns((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "PAUSED" } : c))
      );
    } else {
      toast.error(res.error || "Failed to pause delivery");
    }
  };

  const handleResume = async (id: string) => {
    setActionLoadingId(id);
    const res = await resumeCampaignAction(id);
    setActionLoadingId(null);
    if (res.success) {
      toast.success("Delivery resumed. Processing started.");
      setCampaigns((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "PROCESSING" } : c))
      );
    } else {
      toast.error(res.error || "Failed to resume delivery");
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this communication? Pending messages will not be sent.")) {
      return;
    }
    setActionLoadingId(id);
    const res = await cancelCampaignAction(id);
    setActionLoadingId(null);
    if (res.success) {
      toast.success("Communication cancelled.");
      setCampaigns((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "CANCELLED" } : c))
      );
    } else {
      toast.error(res.error || "Failed to cancel communication");
    }
  };

  const handleRetryFailed = async (id: string) => {
    setActionLoadingId(id);
    const res = await retryFailedRecipientsAction(id);
    setActionLoadingId(null);
    if (res.success) {
      toast.success(`Retrying ${res.retriedCount} failed recipients.`);
      setCampaigns((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "PROCESSING", failedCount: 0 } : c))
      );
    } else {
      toast.error(res.error || "Failed to retry recipients");
    }
  };

  const filteredCampaigns = campaigns.filter((c) => {
    if (statusFilter !== "ALL") {
      if (statusFilter === "PROCESSING" && c.status !== "PROCESSING") return false;
      if (statusFilter !== "PROCESSING" && c.status !== statusFilter) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.subject.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
            <Send className="w-3 h-3" />
            <span>Sending...</span>
          </span>
        );
      case "QUEUED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            <span>Queued</span>
          </span>
        );
      case "SCHEDULED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Calendar className="w-3 h-3" />
            <span>Scheduled</span>
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F8FAFC] text-[#A64B36] border border-[#E2E8F0]">
            <CheckCircle2 className="w-3 h-3" />
            <span>Completed</span>
          </span>
        );
      case "PAUSED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
            <Pause className="w-3 h-3" />
            <span>Paused</span>
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3" />
            <span>Cancelled</span>
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3" />
            <span>Failed</span>
          </span>
        );
      case "DRAFT":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-100 text-zinc-600 border border-zinc-200">
            <span>Draft</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#A64B36] uppercase tracking-wider">
              The Origin Foundation
            </span>
            <span className="text-zinc-300">&bull;</span>
            <span className="text-xs font-bold text-[#C5A880] flex items-center gap-1">
              <Crown className="w-3 h-3" />
              <span>Mithila Queen</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A192F] tracking-tight font-serif mt-0.5">
            Communications
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Send announcements, updates, reminders and important information to Mithila Queen participants.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/admin/campaigns/new">
            <Button className="bg-[#0A192F] hover:bg-[#1E293B] text-white font-bold text-xs h-9 px-4 rounded-xl gap-2 shadow-xs">
              <Plus className="w-4 h-4 text-[#C5A880]" />
              <span>Compose Email</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Database KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Emails Sent */}
        <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Total Emails Sent</span>
            <CheckCircle2 className="w-4 h-4 text-[#C5A880]" />
          </div>
          <div className="text-2xl font-black text-[#0A192F] mt-2 font-mono">
            {stats.totalSent.toLocaleString()}
          </div>
        </div>

        {/* Emails Scheduled */}
        <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Emails Scheduled</span>
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700 mt-2 font-mono">
            {stats.totalScheduled.toLocaleString()}
          </div>
        </div>

        {/* Emails Currently Queued */}
        <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Emails Currently Queued</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2 font-mono">
            {stats.totalQueued.toLocaleString()}
          </div>
        </div>

        {/* Failed Deliveries */}
        <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Failed Deliveries</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 mt-2 font-mono">
            {stats.totalFailed.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-zinc-200 p-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Status Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {STATUS_FILTERS.map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all whitespace-nowrap ${
                statusFilter === st.id
                  ? "bg-[#0A192F] text-white shadow-2xs"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search communications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-lg pl-9 pr-3 py-1.5 focus:outline-[#C5A880]"
          />
        </div>
      </div>

      {/* Email History Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-2xs overflow-hidden">
        {filteredCampaigns.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mx-auto text-[#C5A880]">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 font-serif">
              No messages sent yet
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Send your first announcement or update to Mithila Queen participants.
            </p>
            <Link href="/admin/campaigns/new">
              <Button size="sm" className="bg-[#0A192F] hover:bg-[#1E293B] text-white font-bold text-xs h-8 px-4 rounded-lg mt-2 gap-1.5 shadow-xs">
                <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Compose Email</span>
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/75 text-zinc-500 font-semibold">
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Recipients</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4">Scheduled</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredCampaigns.map((camp) => {
                  const processed = camp.sentCount + camp.failedCount + camp.skippedCount;
                  const percent =
                    camp.totalRecipients > 0
                      ? Math.round((processed / camp.totalRecipients) * 100)
                      : 0;
                  const isActionLoading = actionLoadingId === camp.id;

                  return (
                    <tr key={camp.id} className="hover:bg-zinc-50/60 transition-colors">
                      {/* Subject */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <Link
                          href={`/admin/campaigns/${camp.id}`}
                          className="font-bold text-zinc-900 hover:text-[#A64B36] block transition-colors truncate"
                          title={camp.subject}
                        >
                          {camp.subject}
                        </Link>
                        {camp.name && camp.name !== camp.subject && (
                          <div className="text-[11px] text-zinc-400 mt-0.5 truncate">
                            {camp.name}
                          </div>
                        )}
                      </td>

                      {/* Recipients Progress */}
                      <td className="py-3.5 px-4 min-w-[160px]">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="font-semibold text-zinc-700">
                              {camp.sentCount} / {camp.totalRecipients}
                            </span>
                            <span className="text-zinc-400 font-bold">{percent}%</span>
                          </div>
                          <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 rounded-full ${
                                camp.status === "COMPLETED"
                                  ? "bg-[#C5A880]"
                                  : camp.status === "FAILED"
                                  ? "bg-rose-500"
                                  : "bg-[#0A192F]"
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          {camp.failedCount > 0 && (
                            <span className="text-[10px] text-rose-600 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>{camp.failedCount} failed</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-4 text-zinc-500 whitespace-nowrap text-[11px]">
                        {formatNepalTime(new Date(camp.createdAt), "MMM dd, yyyy")}
                      </td>

                      {/* Scheduled Date */}
                      <td className="py-3.5 px-4 text-zinc-500 whitespace-nowrap text-[11px]">
                        {camp.scheduledAt ? (
                          <div className="text-purple-700 font-semibold" title="Nepal Standard Time">
                            {formatNepalTime(new Date(camp.scheduledAt), "MMM dd, yyyy hh:mm a")} NPT
                          </div>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(camp.status)}
                      </td>

                      {/* Row Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Duplicate Campaign */}
                          <Link href={`/admin/campaigns/new?duplicate=${camp.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-[11px] px-2 font-semibold text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                              title="Duplicate message as new draft"
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              <span>Duplicate</span>
                            </Button>
                          </Link>

                          {/* Pause sending */}
                          {camp.status === "PROCESSING" && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isActionLoading}
                              onClick={() => handlePause(camp.id)}
                              className="h-7 text-[11px] px-2 font-semibold text-amber-700 border-amber-200 hover:bg-amber-50"
                              title="Pause sending"
                            >
                              <Pause className="w-3 h-3 mr-1" />
                              <span>Pause</span>
                            </Button>
                          )}

                          {/* Resume sending */}
                          {camp.status === "PAUSED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isActionLoading}
                              onClick={() => handleResume(camp.id)}
                              className="h-7 text-[11px] px-2 font-semibold text-[#A64B36] border-[#E2E8F0] hover:bg-[#F8FAFC]"
                              title="Resume sending"
                            >
                              <Play className="w-3 h-3 mr-1" />
                              <span>Resume</span>
                            </Button>
                          )}

                          {/* Retry failed */}
                          {camp.failedCount > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isActionLoading}
                              onClick={() => handleRetryFailed(camp.id)}
                              className="h-7 text-[11px] px-2 font-semibold text-rose-700 border-rose-200 hover:bg-rose-50"
                              title="Retry failed recipients"
                            >
                              <RotateCcw className="w-3 h-3 mr-1" />
                              <span>Retry ({camp.failedCount})</span>
                            </Button>
                          )}

                          {/* Cancel scheduled/queued */}
                          {["QUEUED", "SCHEDULED", "PROCESSING", "PAUSED"].includes(camp.status) && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isActionLoading}
                              onClick={() => handleCancel(camp.id)}
                              className="h-7 text-[11px] px-2 font-semibold text-rose-600 border-rose-200 hover:bg-rose-50"
                              title="Cancel communication"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              <span>Cancel</span>
                            </Button>
                          )}

                          {/* View Details */}
                          <Link href={`/admin/campaigns/${camp.id}`}>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-[11px] px-2 text-zinc-600 hover:text-black font-semibold"
                            >
                              <span>Details</span>
                              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

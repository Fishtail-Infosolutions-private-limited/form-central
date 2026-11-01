"use client";

import React, { useState, useTransition } from "react";
import {
  MessageSquare,
  Mail,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  Reply,
  ShieldAlert,
  Calendar,
  User,
  Send,
  AlertCircle,
  Eye,
  Check,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { formatNepalDateTime } from "@/lib/utils/timezone";
import {
  toggleContactInquiryReadAction,
  deleteContactInquiryAction,
  replyToContactInquiryAction,
} from "@/server/actions/contact-actions";

export interface ContactInquiryItem {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  ipAddress: string | null;
  isRead: boolean;
  replyMessage: string | null;
  repliedAt: Date | string | null;
  repliedBy: string | null;
  createdAt: Date | string;
}

interface InquiriesManagementViewProps {
  initialInquiries: ContactInquiryItem[];
}

export function InquiriesManagementView({ initialInquiries }: InquiriesManagementViewProps) {
  const [inquiries, setInquiries] = useState<ContactInquiryItem[]>(initialInquiries);
  const [filter, setFilter] = useState<"all" | "unread" | "replied">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // Reply Modal State
  const [replyTarget, setReplyTarget] = useState<ContactInquiryItem | null>(null);
  const [replySubject, setReplySubject] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);

  // View Details Modal State
  const [viewTarget, setViewTarget] = useState<ContactInquiryItem | null>(null);

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState<ContactInquiryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtered & Searched inquiries
  const filteredInquiries = inquiries.filter((inq) => {
    // Tab filter
    if (filter === "unread" && (inq.isRead || inq.replyMessage)) return false;
    if (filter === "replied" && !inq.replyMessage) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = inq.name.toLowerCase().includes(q);
      const matchEmail = inq.email.toLowerCase().includes(q);
      const matchSubject = (inq.subject || "").toLowerCase().includes(q);
      const matchMessage = inq.message.toLowerCase().includes(q);
      return matchName || matchEmail || matchSubject || matchMessage;
    }
    return true;
  });

  const totalCount = inquiries.length;
  const unreadCount = inquiries.filter((i) => !i.isRead && !i.replyMessage).length;
  const repliedCount = inquiries.filter((i) => Boolean(i.replyMessage)).length;

  // Handlers
  const handleToggleRead = async (inquiry: ContactInquiryItem) => {
    const newStatus = !inquiry.isRead;
    // Optimistic update
    setInquiries((prev) =>
      prev.map((item) => (item.id === inquiry.id ? { ...item, isRead: newStatus } : item))
    );

    const res = await toggleContactInquiryReadAction(inquiry.id, newStatus);
    if (res.success) {
      toast.success(newStatus ? "Marked as read." : "Marked as unread.");
    } else {
      // Revert on failure
      setInquiries((prev) =>
        prev.map((item) => (item.id === inquiry.id ? { ...item, isRead: inquiry.isRead } : item))
      );
      toast.error(res.error || "Failed to update status.");
    }
  };

  const handleOpenReplyModal = (inquiry: ContactInquiryItem) => {
    setReplyTarget(inquiry);
    setReplySubject(
      inquiry.subject?.startsWith("Re:")
        ? inquiry.subject
        : `Re: ${inquiry.subject || "The Origin Foundation Inquiry"}`
    );
    setReplyMessage(
      `Dear ${inquiry.name},\n\nThank you for reaching out to The Origin Foundation regarding your inquiry.\n\n`
    );
  };

  const handleSendReply = async () => {
    if (!replyTarget) return;
    if (!replyMessage.trim()) {
      toast.error("Please enter a reply message before sending.");
      return;
    }

    setIsSendingReply(true);
    try {
      const res = await replyToContactInquiryAction({
        inquiryId: replyTarget.id,
        replySubject,
        replyMessage,
      });

      if (res.success) {
        toast.success(`Reply email sent successfully to ${replyTarget.email}!`);
        // Update local state
        setInquiries((prev) =>
          prev.map((item) =>
            item.id === replyTarget.id
              ? {
                  ...item,
                  isRead: true,
                  replyMessage,
                  repliedAt: new Date().toISOString(),
                  repliedBy: "The Origin Foundation Directorate",
                }
              : item
          )
        );
        setReplyTarget(null);
      } else {
        toast.error(res.error || "Failed to send email reply.");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred while sending reply.");
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await deleteContactInquiryAction(deleteTarget.id);
      if (res.success) {
        setInquiries((prev) => prev.filter((i) => i.id !== deleteTarget.id));
        toast.success("Inquiry deleted.");
        setDeleteTarget(null);
      } else {
        toast.error(res.error || "Failed to delete inquiry.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Overview */}
      <div className="bg-white rounded-2xl border border-[#DCE5ED] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#356FA8] animate-pulse" />
            <span className="text-xs font-bold text-[#356FA8] tracking-wide uppercase">
              Public Correspondence & Guidance
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#263238] tracking-tight">
            Inquiries Desk
          </h1>
          <p className="text-xs text-[#546E7A] max-w-xl">
            Messages received through the official contact form. Rate-limiting guard is active (max 4 submissions per 24h per IP/Email) to eliminate automated spam.
          </p>
        </div>

        {/* Quick Summary Pill Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-[#F4F7FA] border border-[#DCE5ED] text-xs font-semibold text-[#183153]">
            Total: <span className="font-bold">{totalCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800">
            Unread: <span className="font-bold">{unreadCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
            Replied: <span className="font-bold">{repliedCount}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#DCE5ED] p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F4F7FA] rounded-xl border border-[#DCE5ED] w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === "all"
                ? "bg-white text-[#183153] shadow-xs"
                : "text-[#546E7A] hover:text-[#263238]"
            }`}
          >
            All Messages ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === "unread"
                ? "bg-white text-amber-800 shadow-xs"
                : "text-[#546E7A] hover:text-[#263238]"
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("replied")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === "replied"
                ? "bg-white text-emerald-800 shadow-xs"
                : "text-[#546E7A] hover:text-[#263238]"
            }`}
          >
            Replied ({repliedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-[#546E7A] absolute left-3 top-3 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, topic..."
            className="pl-8 text-xs h-9 bg-white border-[#DCE5ED]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2.5 text-xs text-[#546E7A] hover:text-[#263238]"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Inquiries List */}
      {filteredInquiries.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#DCE5ED] shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#F4F7FA] border border-[#DCE5ED] text-[#546E7A] flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6 text-[#356FA8]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-[#263238]">No Inquiries Found</h3>
            <p className="text-xs text-[#546E7A] max-w-sm mx-auto">
              {searchQuery
                ? `No messages match your search "${searchQuery}".`
                : filter === "unread"
                ? "All public messages have been marked as read or answered."
                : "No inquiries submitted yet through the official contact form."}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInquiries.map((inquiry) => {
            const hasReplied = Boolean(inquiry.replyMessage);
            const isUnread = !inquiry.isRead && !hasReplied;

            return (
              <div
                key={inquiry.id}
                className={`p-5 rounded-2xl border transition-all space-y-3 bg-white ${
                  isUnread
                    ? "border-amber-300 ring-1 ring-amber-100 shadow-xs"
                    : "border-[#DCE5ED] hover:border-slate-300 shadow-2xs"
                }`}
              >
                {/* Header row: Inquirer Name, Email, Status Badges, Timestamp */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                    <span className="font-bold text-sm text-[#263238] truncate">
                      {inquiry.name}
                    </span>
                    <a
                      href={`mailto:${inquiry.email}`}
                      className="text-xs font-mono text-[#356FA8] hover:underline truncate"
                    >
                      {inquiry.email}
                    </a>
                    {inquiry.ipAddress && (
                      <span className="text-[10px] font-mono text-[#546E7A] bg-[#F4F7FA] px-2 py-0.5 rounded border border-[#DCE5ED]">
                        IP: {inquiry.ipAddress}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {hasReplied ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Replied</span>
                      </span>
                    ) : isUnread ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        <Clock className="w-3.5 h-3.5" />
                        <span>New &bull; Unread</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#546E7A] bg-[#F4F7FA] px-2.5 py-0.5 rounded-full border border-[#DCE5ED]">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Read</span>
                      </span>
                    )}

                    <span className="text-[11px] font-mono text-[#546E7A]">
                      {formatNepalDateTime(inquiry.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Subject / Topic */}
                {inquiry.subject && (
                  <div className="text-xs font-bold text-[#183153] flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-[#F4F7FA] border border-[#DCE5ED] font-mono text-[10px] uppercase text-[#356FA8]">
                      Subject
                    </span>
                    <span>{inquiry.subject}</span>
                  </div>
                )}

                {/* Message Body */}
                <div className="p-3.5 rounded-xl bg-[#F4F7FA]/70 border border-[#DCE5ED] text-xs text-[#263238] leading-relaxed whitespace-pre-wrap">
                  {inquiry.message}
                </div>

                {/* Reply Record (If replied) */}
                {hasReplied && (
                  <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5 text-xs text-emerald-950">
                    <div className="flex items-center justify-between text-[11px] text-emerald-800 font-semibold border-b border-emerald-200 pb-1">
                      <span className="flex items-center gap-1.5">
                        <Reply className="w-3.5 h-3.5" />
                        <span>Reply sent by {inquiry.repliedBy || "Event Admin"}</span>
                      </span>
                      {inquiry.repliedAt && (
                        <span className="font-mono text-[10px]">
                          {formatNepalDateTime(inquiry.repliedAt)}
                        </span>
                      )}
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed text-[11px] text-emerald-900">
                      {inquiry.replyMessage}
                    </p>
                  </div>
                )}

                {/* Action Buttons Row */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#DCE5ED]/60 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleOpenReplyModal(inquiry)}
                      className="h-8 text-xs font-semibold bg-[#183153] hover:bg-[#12243d] text-white gap-1.5 shadow-xs"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      <span>{hasReplied ? "Send Another Reply" : "Reply to Email"}</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleRead(inquiry)}
                      className="h-8 text-xs border-[#DCE5ED] text-[#263238] hover:bg-[#F4F7FA] gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#546E7A]" />
                      <span>{inquiry.isRead ? "Mark Unread" : "Mark Read"}</span>
                    </Button>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(inquiry)}
                    className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================================================================== */}
      {/* 1. DIRECT EMAIL REPLY MODAL */}
      {/* ==================================================================== */}
      {replyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[#DCE5ED] space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCE5ED] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#F4F7FA] border border-[#DCE5ED] flex items-center justify-center text-[#183153]">
                  <Reply className="w-4 h-4 text-[#356FA8]" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#263238]">
                    Reply to {replyTarget.name}
                  </h3>
                  <p className="text-xs text-[#546E7A] font-mono">{replyTarget.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReplyTarget(null)}
                className="text-[#546E7A] hover:text-[#263238] text-lg font-bold p-1"
              >
                &times;
              </button>
            </div>

            {/* Original message snippet */}
            <div className="p-3 bg-[#F4F7FA] rounded-xl border border-[#DCE5ED] text-xs text-[#546E7A] space-y-1">
              <span className="font-bold uppercase tracking-wider text-[10px] text-[#183153] block">
                Inquirer&apos;s Message:
              </span>
              <p className="italic text-[11px] leading-relaxed line-clamp-3">
                &ldquo;{replyTarget.message}&rdquo;
              </p>
            </div>

            {/* Composer */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#263238]">
                  Email Subject
                </label>
                <Input
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                  placeholder="Subject of reply..."
                  className="text-xs h-9 border-[#DCE5ED]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#263238]">
                  Response Message
                </label>
                <Textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your official reply to the inquirer..."
                  rows={6}
                  className="text-xs border-[#DCE5ED] leading-relaxed"
                />
              </div>
            </div>

            {/* Notice */}
            <p className="text-[11px] text-[#546E7A] bg-slate-50 p-2.5 rounded-lg border border-[#DCE5ED]">
              This response will be sent from <strong>originfoundation107@gmail.com</strong> formatted with official The Origin Foundation branding and contact details.
            </p>

            {/* Controls */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCE5ED]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setReplyTarget(null)}
                disabled={isSendingReply}
                className="border-[#DCE5ED] text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSendReply}
                disabled={isSendingReply}
                className="bg-[#183153] hover:bg-[#12243d] text-white text-xs font-semibold gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSendingReply ? "Sending Email..." : "Send Official Reply"}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. DELETE INQUIRY CONFIRMATION MODAL */}
      {/* ==================================================================== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#DCE5ED] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#263238]">Delete Inquiry?</h3>
                <p className="text-xs text-[#546E7A]">From {deleteTarget.name}</p>
              </div>
            </div>
            <p className="text-xs text-[#263238] leading-relaxed bg-rose-50/50 p-3 rounded-lg border border-rose-100 text-rose-900">
              Are you sure you want to permanently delete this inquiry record from {deleteTarget.email}? This action cannot be reversed.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="border-[#DCE5ED] text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


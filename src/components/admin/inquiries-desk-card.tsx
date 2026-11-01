"use client";

import React, { useState } from "react";
import { Mail, CheckCircle2, MessageSquare, Clock, Eye, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNepalDateTime } from "@/lib/utils/timezone";
import { toggleContactInquiryReadAction, deleteContactInquiryAction } from "@/server/actions/contact-actions";
import { toast } from "sonner";

interface InquiryItem {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export function InquiriesDeskCard({ initialInquiries }: { initialInquiries: InquiryItem[] }) {
  const [inquiries, setInquiries] = useState<InquiryItem[]>(initialInquiries);
  const [activeModalInquiry, setActiveModalInquiry] = useState<InquiryItem | null>(null);

  const handleToggleRead = async (inquiry: InquiryItem) => {
    const newStatus = !inquiry.isRead;
    setInquiries((prev) =>
      prev.map((item) => (item.id === inquiry.id ? { ...item, isRead: newStatus } : item))
    );
    if (activeModalInquiry && activeModalInquiry.id === inquiry.id) {
      setActiveModalInquiry({ ...activeModalInquiry, isRead: newStatus });
    }
    const res = await toggleContactInquiryReadAction(inquiry.id, newStatus);
    if (!res.success) {
      toast.error("Failed to update status");
      // Revert
      setInquiries((prev) =>
        prev.map((item) => (item.id === inquiry.id ? { ...item, isRead: inquiry.isRead } : item))
      );
    } else {
      toast.success(newStatus ? "Inquiry marked as read" : "Inquiry marked as unread");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;
    setInquiries((prev) => prev.filter((item) => item.id !== id));
    if (activeModalInquiry?.id === id) setActiveModalInquiry(null);

    const res = await deleteContactInquiryAction(id);
    if (!res.success) {
      toast.error("Failed to delete inquiry");
    } else {
      toast.success("Inquiry removed");
    }
  };

  return (
    <>
      <div className="bg-warm-ivory border border-cream-dark rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-cream-dark">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-saffron" />
            <h3 className="font-serif font-bold text-sm text-maroon">
              Public Inquiries & Messages
            </h3>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-soft-cream text-maroon border border-[#B89150]/40">
            {inquiries.filter((i) => !i.isRead).length} Unread
          </span>
        </div>

        {inquiries.length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-500">
            No inquiries received yet.
          </div>
        ) : (
          <div className="divide-y divide-[#EADBCE]/70 max-h-[420px] overflow-y-auto pr-1">
            {inquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className={`py-3 px-1.5 transition-colors rounded-lg flex items-start justify-between gap-3 ${
                  !inquiry.isRead ? "bg-soft-cream/50" : "hover:bg-soft-cream/20"
                }`}
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-xs text-maroon truncate">
                      {inquiry.name}
                    </span>
                    {!inquiry.isRead && (
                      <span className="inline-block w-2 h-2 rounded-full bg-saffron" />
                    )}
                    <span className="text-[10px] text-stone-500 font-mono">
                      {formatNepalDateTime(inquiry.createdAt)}
                    </span>
                  </div>

                  <p className="text-[11px] font-medium text-stone-700 truncate">
                    {inquiry.subject || "No Subject"}
                  </p>

                  <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                    {inquiry.message}
                  </p>

                  <div className="text-[10px] text-stone-500 font-mono">
                    <a href={`mailto:${inquiry.email}`} className="text-saffron hover:underline">
                      {inquiry.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 pt-1">
                  <button
                    onClick={() => {
                      setActiveModalInquiry(inquiry);
                      if (!inquiry.isRead) handleToggleRead(inquiry);
                    }}
                    title="View Message"
                    className="p-1.5 rounded hover:bg-soft-cream text-maroon transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(inquiry.id)}
                    title="Delete Inquiry"
                    className="p-1.5 rounded hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inquiry Detail Modal */}
      {activeModalInquiry && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-warm-ivory border border-cream-dark rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-cream-dark">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-saffron" />
                <h3 className="font-serif font-bold text-base text-maroon">
                  Inquiry from {activeModalInquiry.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalInquiry(null)}
                className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-soft-cream"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-charcoal">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-soft-cream border border-cream-dark">
                <div>
                  <span className="text-[10px] font-bold uppercase text-maroon block">Sender Name</span>
                  <span className="font-semibold text-stone-900">{activeModalInquiry.name}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-maroon block">Email Address</span>
                  <a href={`mailto:${activeModalInquiry.email}`} className="font-mono text-saffron hover:underline">
                    {activeModalInquiry.email}
                  </a>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] font-bold uppercase text-maroon block">Subject</span>
                  <span className="font-medium text-stone-800">{activeModalInquiry.subject || "General Inquiry"}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] font-bold uppercase text-maroon block">Received Date</span>
                  <span className="font-mono text-stone-600">{formatNepalDateTime(activeModalInquiry.createdAt)}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-maroon block mb-1">Message Content</span>
                <div className="p-3.5 rounded-lg bg-white border border-cream-dark text-stone-800 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                  {activeModalInquiry.message}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-cream-dark">
              <a
                href={`mailto:${activeModalInquiry.email}?subject=${encodeURIComponent(
                  `Re: ${activeModalInquiry.subject || "The Origin Foundation Inquiry"}`
                )}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-saffron hover:bg-saffron-dark text-white text-xs font-bold transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Reply via Email</span>
              </a>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveModalInquiry(null)}
                className="border-cream-dark text-maroon hover:bg-soft-cream text-xs h-9"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


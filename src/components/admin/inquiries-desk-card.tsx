"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, CheckCircle2, MessageSquare, Clock, Eye, Trash2, X, ExternalLink } from "lucide-react";
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
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    const id = deleteConfirmId;
    setDeleteConfirmId(null);
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
      <div className="bg-white border border-[#DCE5ED] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#DCE5ED]">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#356FA8]" />
            <h3 className="font-bold font-bold text-sm text-[#183153]">
              Public Inquiries & Messages
            </h3>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#F4F7FA] text-[#183153] border border-[#DCE5ED]">
            {inquiries.filter((i) => !i.isRead).length} Unread
          </span>
        </div>

        {inquiries.length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-500">
            No inquiries received yet.
          </div>
        ) : (
          <div className="divide-y divide-cream-dark/70 max-h-[420px] overflow-y-auto pr-1">
            {inquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className={`py-3 px-1.5 transition-colors rounded-lg flex items-start justify-between gap-3 ${
                  !inquiry.isRead ? "bg-[#F4F7FA]/50" : "hover:bg-[#F4F7FA]/20"
                }`}
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-xs text-[#183153] truncate">
                      {inquiry.name}
                    </span>
                    {!inquiry.isRead && (
                      <span className="inline-block w-2 h-2 rounded-full bg-[#356FA8]" />
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
                    <a href={`mailto:${inquiry.email}`} className="text-[#356FA8] hover:underline">
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
                    className="p-1.5 rounded hover:bg-[#F4F7FA] text-[#183153] transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(inquiry.id)}
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

        <div className="pt-2 border-t border-[#DCE5ED]">
          <Link href="/admin/inquiries">
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-xs font-semibold text-[#183153] border-[#DCE5ED] hover:bg-[#F4F7FA] gap-1.5"
            >
              <span>Open Inquiries Desk & Reply</span>
              <ExternalLink className="w-3 h-3 text-[#356FA8]" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Inquiry Detail Modal */}
      {activeModalInquiry && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#DCE5ED] rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE5ED]">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#356FA8]" />
                <h3 className="font-bold font-bold text-base text-[#183153]">
                  Inquiry from {activeModalInquiry.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalInquiry(null)}
                className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-[#F4F7FA]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#263238]">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-[#F4F7FA] border border-[#DCE5ED]">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#183153] block">Sender Name</span>
                  <span className="font-semibold text-stone-900">{activeModalInquiry.name}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#183153] block">Email Address</span>
                  <a href={`mailto:${activeModalInquiry.email}`} className="font-mono text-[#356FA8] hover:underline">
                    {activeModalInquiry.email}
                  </a>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] font-bold uppercase text-[#183153] block">Subject</span>
                  <span className="font-medium text-stone-800">{activeModalInquiry.subject || "General Inquiry"}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] font-bold uppercase text-[#183153] block">Received Date</span>
                  <span className="font-mono text-stone-600">{formatNepalDateTime(activeModalInquiry.createdAt)}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-[#183153] block mb-1">Message Content</span>
                <div className="p-3.5 rounded-lg bg-white border border-[#DCE5ED] text-stone-800 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                  {activeModalInquiry.message}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#DCE5ED]">
              <a
                href={`mailto:${activeModalInquiry.email}?subject=${encodeURIComponent(
                  `Re: ${activeModalInquiry.subject || "The Origin Foundation Inquiry"}`
                )}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#356FA8] hover:bg-[#2c5c8c] text-white text-xs font-bold transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Reply via Email</span>
              </a>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveModalInquiry(null)}
                className="border-[#DCE5ED] text-[#183153] hover:bg-[#F4F7FA] text-xs h-9"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#DCE5ED] p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-[#263238]">Delete Inquiry?</h4>
              <p className="text-xs text-[#546E7A] leading-relaxed">
                Are you sure you want to delete this inquiry message? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmId(null)}
                className="h-8 text-xs border-[#DCE5ED]"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={confirmDelete}
                className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold"
              >
                Delete Inquiry
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}



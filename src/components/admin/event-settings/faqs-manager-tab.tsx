"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  HelpCircle,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order: number;
  published: boolean;
}

const DEFAULT_MITHILA_QUEEN_FAQS: FaqItem[] = [
  {
    id: "faq-1",
    question: "What is The Origin Foundation?",
    answer: "The Origin Foundation is a platform being developed in Janakpur Dham, Nepal, to support cultural identity, talent, and community participation through initiatives such as Mithila Queen.",
    category: "Organization & Initiative",
    order: 1,
    published: true,
  },
  {
    id: "faq-2",
    question: "What is Mithila Queen?",
    answer: "Mithila Queen is the flagship initiative of The Origin Foundation—a cultural and talent-oriented competition intended to celebrate Mithila's heritage, confidence, creativity, and individual talent.",
    category: "Organization & Initiative",
    order: 2,
    published: true,
  },
  {
    id: "faq-3",
    question: "What is the registration fee?",
    answer: "The registration fee is strictly NPR 399 per registration, payable in Nepalese rupees only. This nominal fee covers administrative registration, audition review, and dossier preparation.",
    category: "Fee & Payment",
    order: 3,
    published: true,
  },
  {
    id: "faq-4",
    question: "How can I pay the registration fee?",
    answer: "Follow the official payment instructions on the website and scan the verified payment QR code (eSewa / Fonepay / Bank Transfer). After completing the payment, enter your transaction reference and upload the payment screenshot for administrative review.",
    category: "Fee & Payment",
    order: 4,
    published: true,
  },
  {
    id: "faq-5",
    question: "Does uploading a payment screenshot guarantee approval?",
    answer: "No. The organizing team independently checks and verifies the bank transfer records before the application advances to the approval review workflow.",
    category: "Fee & Payment",
    order: 5,
    published: true,
  },
  {
    id: "faq-6",
    question: "Are all three social media accounts required?",
    answer: "No. At least one valid Instagram, TikTok, or Facebook profile is required; the other two are optional. We never ask for passwords or private account access.",
    category: "Eligibility & Social Media",
    order: 6,
    published: true,
  },
  {
    id: "faq-7",
    question: "Who is eligible to participate?",
    answer: "Any girl can participate. There is no minimum or maximum age requirement. Both unmarried and married girls are welcomed. Participants under 18 years must provide legal parent/guardian consent.",
    category: "Eligibility & Social Media",
    order: 7,
    published: true,
  },
  {
    id: "faq-8",
    question: "When will the event take place?",
    answer: "The event schedule and venue are currently To Be Announced. Registration is conducted online via this official website. Confirmed dates will be published through official announcements.",
    category: "Schedule & Format",
    order: 8,
    published: true,
  },
  {
    id: "faq-9",
    question: "When will I receive my PDF confirmation?",
    answer: "After the required payment verification and application approval are both completed by administrators, your official branded confirmation PDF is automatically generated and emailed to your registered address.",
    category: "Confirmation & Documents",
    order: 9,
    published: true,
  },
  {
    id: "faq-10",
    question: "How can I contact the organizers for help?",
    answer: "You can reach us at originfoundation107@gmail.com, or contact Managing Directors Gaurav Gupta (+977 9704571941) or Dipendra Shah Kalwar (+977 981-2005468).",
    category: "Support & Corrections",
    order: 10,
    published: true,
  },
];

interface FaqsManagerTabProps {
  faqs: FaqItem[];
  onChange: (faqs: FaqItem[]) => void;
}

export function FaqsManagerTab({ faqs = [], onChange }: FaqsManagerTabProps) {
  const [expandedId, setExpandedId] = useState<string | null>(faqs[0]?.id || null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const publishedCount = faqs.filter((f) => f.published && f.question.trim().length > 0).length;

  const handleAddFaq = () => {
    const newId = `faq-${Date.now()}`;
    const nextOrder = faqs.length + 1;
    const newFaq: FaqItem = {
      id: newId,
      question: `Question #${nextOrder}`,
      answer: "",
      category: "General",
      order: nextOrder,
      published: true,
    };
    const updated = [...faqs, newFaq];
    onChange(updated);
    setExpandedId(newId);
    toast.success(`Slot #${nextOrder} created. Complete the question and answer below.`);
  };

  const handleUpdate = (id: string, updates: Partial<FaqItem>) => {
    const updated = faqs.map((f) => (f.id === id ? { ...f, ...updates } : f));
    onChange(updated);
  };

  const handleDelete = (id: string) => {
    const filtered = faqs.filter((f) => f.id !== id);
    // Re-index orders 1..N
    const reindexed = filtered.map((f, idx) => ({ ...f, order: idx + 1 }));
    onChange(reindexed);
    toast.success("FAQ removed.");
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= faqs.length) return;

    const copy = [...faqs];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    const reindexed = copy.map((f, idx) => ({ ...f, order: idx + 1 }));
    onChange(reindexed);
  };

  const handleResetDefaults = () => {
    setShowResetConfirm(true);
  };

  const confirmResetDefaults = () => {
    onChange(DEFAULT_MITHILA_QUEEN_FAQS);
    setShowResetConfirm(false);
    toast.success("Reset to 10 standard Mithila Queen FAQs.");
  };

  return (
    <div className="space-y-6">
      {/* Overview & Actions Top Bar */}
      <div className="p-4 rounded-xl border border-[#DCE5ED] bg-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#183153] text-white flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-[#356FA8]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#263238]">
                Frequently Asked Questions ({faqs.length} Slots)
              </h3>
              <p className="text-xs text-[#546E7A]">
                {publishedCount} published on public website &bull; Empty or draft slots are automatically hidden.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            className="text-xs h-9 border-[#DCE5ED] text-[#263238] hover:bg-[#F4F7FA] gap-1.5"
            title="Restore default Mithila Queen FAQs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#546E7A]" />
            <span>Reset Standards</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleAddFaq}
            className="text-xs h-9 bg-[#183153] hover:bg-[#12243d] text-white font-semibold gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add FAQ Slot</span>
          </Button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#DCE5ED] p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-[#263238]">Reset to Standard FAQs?</h4>
              <p className="text-xs text-[#546E7A] leading-relaxed">
                This will replace all current FAQs with the official Mithila Queen standard 10 questions.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowResetConfirm(false)}
                className="h-8 text-xs border-[#DCE5ED]"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={confirmResetDefaults}
                className="h-8 text-xs bg-[#183153] hover:bg-[#12243d] text-white font-semibold"
              >
                Reset to Standard
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {faqs.length === 0 ? (
        <Card className="border-[var(--color-brand-border,#DCD8D1)] bg-white text-center p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-[var(--color-brand-surface,#F3F1ED)] text-[var(--color-brand-muted,#8A8580)] mx-auto flex items-center justify-center">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[var(--color-brand-text,#292824)]">No FAQ Slots Configured</h4>
            <p className="text-xs text-[var(--color-brand-muted,#8A8580)] max-w-sm mx-auto">
              Add your own custom question slots or load the 10 official Mithila Queen questions.
            </p>
          </div>
          <div className="flex justify-center gap-2 pt-2">
            <Button
              type="button"
              onClick={handleResetDefaults}
              className="text-xs h-9 bg-[var(--color-brand-primary,#5C5751)] text-white font-semibold"
            >
              Load Standard 10 FAQs
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddFaq}
              className="text-xs h-9 border-[var(--color-brand-border,#DCD8D1)]"
            >
              Add First Question
            </Button>
          </div>
        </Card>
      ) : (
        /* FAQ Slots List */
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isExpanded = expandedId === faq.id;
            const slotNumber = index + 1;

            return (
              <div
                key={faq.id}
                className={`rounded-xl border transition-all ${
                  faq.published
                    ? "border-[var(--color-brand-border,#DCD8D1)] bg-white"
                    : "border-[var(--color-brand-border,#DCD8D1)]/70 bg-[var(--color-brand-surface,#F3F1ED)]/30 opacity-80"
                } shadow-xs overflow-hidden`}
              >
                {/* Header row */}
                <div className="p-3.5 flex items-center justify-between gap-3 bg-white">
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                    className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer select-none"
                  >
                    <span className="w-7 h-7 rounded-md bg-[var(--color-brand-surface,#F3F1ED)] border border-[var(--color-brand-border,#DCD8D1)] text-[var(--color-brand-text,#292824)] font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      #{slotNumber}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[var(--color-brand-text,#292824)] truncate">
                          {faq.question || `Question #${slotNumber}`}
                        </span>
                        {faq.category && (
                          <span className="text-[10px] font-semibold text-[var(--color-brand-muted,#8A8580)] bg-[var(--color-brand-surface,#F3F1ED)] px-2 py-0.5 rounded border border-[var(--color-brand-border,#DCD8D1)]/50 shrink-0 hidden sm:inline-block">
                            {faq.category}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[var(--color-brand-muted,#8A8580)] truncate mt-0.5">
                        {faq.answer || "No answer text provided yet."}
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Published Toggle */}
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleUpdate(faq.id, { published: !faq.published })}
                      className={`h-8 px-2 text-xs font-semibold gap-1 ${
                        faq.published
                          ? "text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
                          : "text-[var(--color-brand-muted,#8A8580)] hover:text-[var(--color-brand-text,#292824)] hover:bg-[var(--color-brand-surface,#F3F1ED)]"
                      }`}
                      title={faq.published ? "Click to set as Draft" : "Click to Publish"}
                    >
                      {faq.published ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden md:inline">Published</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span className="hidden md:inline">Draft</span>
                        </>
                      )}
                    </Button>

                    {/* Move Up */}
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={index === 0}
                      onClick={() => handleMove(index, "up")}
                      className="h-8 w-8 p-0 text-[var(--color-brand-muted,#8A8580)] hover:text-[var(--color-brand-text,#292824)]"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </Button>

                    {/* Move Down */}
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={index === faqs.length - 1}
                      onClick={() => handleMove(index, "down")}
                      className="h-8 w-8 p-0 text-[var(--color-brand-muted,#8A8580)] hover:text-[var(--color-brand-text,#292824)]"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </Button>

                    {/* Expand/Collapse */}
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                      className="h-8 w-8 p-0 text-[var(--color-brand-muted,#8A8580)]"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>

                    {/* Delete */}
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(faq.id)}
                      className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                      title="Delete Slot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Expanded Editing Panel */}
                {isExpanded && (
                  <div className="p-4 border-t border-[var(--color-brand-border,#DCD8D1)]/60 bg-[var(--color-brand-surface,#F3F1ED)]/30 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 space-y-1.5">
                        <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)]">
                          Question #{slotNumber} Text <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          value={faq.question}
                          onChange={(e) => handleUpdate(faq.id, { question: e.target.value })}
                          placeholder="e.g. What is the registration fee?"
                          className="h-9 text-xs border-[var(--color-brand-border,#DCD8D1)] bg-white focus-visible:ring-[var(--color-brand-primary,#5C5751)]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)]">
                          Category Grouping
                        </Label>
                        <Input
                          value={faq.category || ""}
                          onChange={(e) => handleUpdate(faq.id, { category: e.target.value })}
                          placeholder="e.g. Fee & Payment"
                          className="h-9 text-xs border-[var(--color-brand-border,#DCD8D1)] bg-white focus-visible:ring-[var(--color-brand-primary,#5C5751)]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-[var(--color-brand-text,#292824)]">
                        Detailed Answer <span className="text-rose-500">*</span>
                      </Label>
                      <Textarea
                        value={faq.answer}
                        onChange={(e) => handleUpdate(faq.id, { answer: e.target.value })}
                        placeholder="Provide the clear, factual explanation to be shown to participants..."
                        rows={3}
                        className="text-xs border-[var(--color-brand-border,#DCD8D1)] bg-white focus-visible:ring-[var(--color-brand-primary,#5C5751)] resize-none"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-[var(--color-brand-muted,#8A8580)]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono">Display Order: {slotNumber}</span>
                        <span>&bull;</span>
                        <span>
                          Status:{" "}
                          <strong className={faq.published ? "text-emerald-700" : "text-amber-700"}>
                            {faq.published ? "Active on Public FAQ Page" : "Hidden (Draft)"}
                          </strong>
                        </span>
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setExpandedId(null)}
                        className="text-xs h-7 px-3 border-[var(--color-brand-border,#DCD8D1)]"
                      >
                        Collapse
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


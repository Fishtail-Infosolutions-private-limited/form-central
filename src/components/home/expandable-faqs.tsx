"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
  category?: string;
}

interface ExpandableFaqsProps {
  faqs: FaqItem[];
}

export function ExpandableFaqs({ faqs }: ExpandableFaqsProps) {
  // First item open by default
  const [openIndexes, setOpenIndexes] = useState<number[]>([0]);

  const toggleIndex = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="space-y-3">
      {faqs.map((faq, index) => {
        const isOpen = openIndexes.includes(index);

        return (
          <div
            key={index}
            className={`rounded-xl border transition-colors duration-150 overflow-hidden ${
              isOpen
                ? "bg-white border-[#356FA8] shadow-xs"
                : "bg-white border-[#DCE5ED] hover:border-[#CBD8E3]"
            }`}
          >
            <button
              type="button"
              onClick={() => toggleIndex(index)}
              className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-4 cursor-pointer select-none"
              aria-expanded={isOpen}
            >
              <div className="space-y-1 pr-2">
                {faq.category && (
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#356FA8] bg-[#F4F7FA] px-2 py-0.5 rounded border border-[#DCE5ED]">
                    {faq.category}
                  </span>
                )}
                <h3 className="text-sm sm:text-base font-bold text-[#263238] flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#356FA8] shrink-0" />
                  <span>{faq.q}</span>
                </h3>
              </div>

              <div
                className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 border transition-transform duration-200 ${
                  isOpen
                    ? "bg-[#F4F7FA] border-[#DCE5ED] text-[#183153] rotate-180"
                    : "bg-white border-[#DCE5ED] text-[#546E7A]"
                }`}
              >
                <ChevronDown className="w-4 h-4" />
              </div>
            </button>

            {isOpen && (
              <div className="px-5 pb-5 pt-1 border-t border-[#DCE5ED]/60 text-xs sm:text-sm text-[#546E7A] leading-relaxed animate-in fade-in-50 duration-150">
                <p className="whitespace-pre-line pl-6">{faq.a}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


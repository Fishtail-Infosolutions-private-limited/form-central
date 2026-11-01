"use client";

import React, { useState, KeyboardEvent, ClipboardEvent } from "react";
import { X, AlertCircle, Mail, Plus, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GmailRecipientInputProps {
  value: string[];
  onChange: (emails: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function GmailRecipientInput({
  value = [],
  onChange,
  placeholder = "Type email and press Enter or comma...",
  disabled = false,
}: GmailRecipientInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const addEmails = (rawInputs: string[]) => {
    const newItems: string[] = [];
    let hadDuplicate = false;

    for (const raw of rawInputs) {
      const trimmed = raw.trim().replace(/^[<"]+|[>"]+$/g, "");
      if (!trimmed) continue;

      const normalized = trimmed.toLowerCase();
      if (value.some((v) => v.toLowerCase() === normalized) || newItems.some((v) => v.toLowerCase() === normalized)) {
        hadDuplicate = true;
        continue;
      }
      newItems.push(trimmed);
    }

    if (hadDuplicate) {
      setDuplicateWarning("Duplicate addresses were automatically ignored.");
      setTimeout(() => setDuplicateWarning(null), 3500);
    }

    if (newItems.length > 0) {
      onChange([...value, ...newItems]);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === ";") {
      e.preventDefault();
      if (inputValue.trim()) {
        addEmails([inputValue]);
      }
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      // Remove last chip when pressing backspace on empty input
      e.preventDefault();
      onChange(value.slice(0, -1));
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    if (!pastedText) return;

    // Split on commas, semicolons, whitespace, or newlines
    const parts = pastedText.split(/[\s,;]+/).filter(Boolean);
    addEmails(parts);
  };

  const removeEmail = (indexToRemove: number) => {
    onChange(value.filter((_, i) => i !== indexToRemove));
  };

  const clearAll = () => {
    onChange([]);
    setInputValue("");
    setDuplicateWarning(null);
  };

  const invalidEmails = value.filter((email) => !EMAIL_REGEX.test(email));

  return (
    <div className="space-y-2">
      <div
        className={`min-h-[52px] w-full rounded-xl border bg-white p-2 text-xs transition-all flex flex-wrap items-center gap-1.5 cursor-text ${
          disabled ? "opacity-60 bg-zinc-50 cursor-not-allowed" : "border-cream-dark focus-within:border-maroon focus-within:ring-2 focus-within:ring-maroon/15"
        }`}
        onClick={(e) => {
          const input = e.currentTarget.querySelector("input");
          input?.focus();
        }}
      >
        <span className="text-[11px] font-bold text-zinc-400 select-none mr-1 flex items-center gap-1">
          <Mail className="w-3.5 h-3.5 text-zinc-400" />
          <span>To:</span>
        </span>

        {/* Chips */}
        {value.map((email, idx) => {
          const isValid = EMAIL_REGEX.test(email);
          return (
            <span
              key={`${email}-${idx}`}
              className={`inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-full text-xs font-medium transition-all ${
                isValid
                  ? "bg-soft-cream text-maroon border border-cream-dark"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {!isValid && <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />}
              <span className="font-mono text-[11px] select-all">{email}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeEmail(idx);
                }}
                disabled={disabled}
                className="hover:bg-zinc-200/80 rounded-full p-0.5 text-zinc-500 hover:text-zinc-800 transition-colors ml-0.5"
                title="Remove recipient"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          );
        })}

        {/* Direct text input */}
        <input
          type="text"
          value={inputValue}
          disabled={disabled}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={() => {
            if (inputValue.trim()) {
              addEmails([inputValue]);
            }
          }}
          placeholder={value.length === 0 ? placeholder : "Add more..."}
          className="flex-1 min-w-[160px] bg-transparent outline-none text-xs text-zinc-900 placeholder:text-zinc-400 py-1"
        />
      </div>

      {/* Warnings & Summary Bar */}
      <div className="flex items-center justify-between text-[11px] px-1">
        <div className="flex items-center gap-2">
          {duplicateWarning && (
            <span className="text-amber-700 font-semibold">{duplicateWarning}</span>
          )}
          {invalidEmails.length > 0 && (
            <span className="text-rose-600 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{invalidEmails.length} invalid email address{invalidEmails.length > 1 ? "es" : ""} entered.</span>
            </span>
          )}
          {!duplicateWarning && invalidEmails.length === 0 && (
            <span className="text-zinc-500">
              Paste multiple addresses or press Enter/comma to separate.
            </span>
          )}
        </div>

        {value.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-700 font-mono">
              {value.length} manual recipient{value.length > 1 ? "s" : ""}
            </span>
            <button
              type="button"
              onClick={clearAll}
              disabled={disabled}
              className="text-[11px] text-zinc-400 hover:text-rose-600 transition-colors underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  Undo2,
  Redo2,
  Heading2,
  Heading3,
  Pilcrow,
  Sparkles,
  Info,
  Check,
} from "lucide-react";
const ESSENTIAL_VARIABLES = [
  {
    key: "participant_name",
    label: "Participant Name",
    token: "{{participant_name}}",
    description: "Inserts the contestant's full name",
  },
  {
    key: "registration_id",
    label: "Registration ID",
    token: "{{registration_id}}",
    description: "Inserts unique ID (e.g. MQ-2026-001)",
  },
  {
    key: "participant_email",
    label: "Participant Email",
    token: "{{participant_email}}",
    description: "Inserts candidate's email address",
  },
  {
    key: "event_name",
    label: "Competition Name",
    token: "{{event_name}}",
    description: "Mithila Queen",
  },
  {
    key: "event_date",
    label: "Event Date",
    token: "{{event_date}}",
    description: "Audition or event date",
  },
  {
    key: "event_venue",
    label: "Event Venue",
    token: "{{event_venue}}",
    description: "Official venue location",
  },
];

interface EmailRichEditorProps {
  value: string;
  onChange: (htmlContent: string) => void;
  disabled?: boolean;
}

export function EmailRichEditor({ value, onChange, disabled = false }: EmailRichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastRangeRef = useRef<Range | null>(null);
  const isUpdatingFromPropRef = useRef(false);
  const [justInsertedKey, setJustInsertedKey] = useState<string | null>(null);

  // Sync prop value into contentEditable when prop changes externally
  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== value) {
      isUpdatingFromPropRef.current = true;
      editorRef.current.innerHTML = value || "<p><br></p>";
      isUpdatingFromPropRef.current = false;
    }
  }, [value]);

  // Save selection range on mouse or keyboard events inside editor
  const saveSelection = useCallback(() => {
    if (typeof window === "undefined") return;
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
        lastRangeRef.current = range.cloneRange();
      }
    }
  }, []);

  const handleInput = () => {
    if (isUpdatingFromPropRef.current) return;
    if (editorRef.current) {
      saveSelection();
      onChange(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command: string, val: string | undefined = undefined) => {
    if (disabled || !editorRef.current) return;
    editorRef.current.focus();
    if (lastRangeRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(lastRangeRef.current);
      }
    }

    if (command === "createLink") {
      const url = prompt("Enter link URL (e.g. https://...):");
      if (url) {
        document.execCommand(command, false, url);
      }
    } else {
      document.execCommand(command, false, val);
    }

    saveSelection();
    handleInput();
  };

  const insertVariable = (variableKey: string) => {
    if (disabled || !editorRef.current) return;
    editorRef.current.focus();

    const selection = window.getSelection();
    let range: Range | null = null;

    if (
      lastRangeRef.current &&
      editorRef.current.contains(lastRangeRef.current.commonAncestorContainer)
    ) {
      range = lastRangeRef.current;
    } else if (selection && selection.rangeCount > 0) {
      range = selection.getRangeAt(0);
    }

    const tokenText = `{{${variableKey}}}`;

    if (range && editorRef.current.contains(range.commonAncestorContainer)) {
      range.deleteContents();
      const textNode = document.createTextNode(tokenText);
      range.insertNode(textNode);

      // Move cursor right after the inserted text
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
      lastRangeRef.current = range.cloneRange();
    } else {
      // Fallback: append to end
      const textNode = document.createTextNode(tokenText);
      editorRef.current.appendChild(textNode);
    }

    setJustInsertedKey(variableKey);
    setTimeout(() => setJustInsertedKey(null), 1800);
    handleInput();
  };

  return (
    <div className="space-y-3">
      {/* Visual Editor Card */}
      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-2xs focus-within:border-saffron focus-within:ring-2 focus-within:ring-[#B89150]/15 transition-all">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 bg-soft-cream/70 border-b border-zinc-200 text-zinc-700">
          {/* Paragraph / Headings */}
          <button
            type="button"
            onClick={() => executeCommand("formatBlock", "<p>")}
            disabled={disabled}
            className="p-1.5 rounded hover:bg-white hover:text-black hover:shadow-2xs text-xs font-semibold flex items-center gap-1 transition-all"
            title="Normal Paragraph"
          >
            <Pilcrow className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Normal</span>
          </button>
          <button
            type="button"
            onClick={() => executeCommand("formatBlock", "<h2>")}
            disabled={disabled}
            className="p-1.5 rounded hover:bg-white hover:text-black hover:shadow-2xs text-xs font-semibold flex items-center gap-1 transition-all"
            title="Heading 2"
          >
            <Heading2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">H2</span>
          </button>
          <button
            type="button"
            onClick={() => executeCommand("formatBlock", "<h3>")}
            disabled={disabled}
            className="p-1.5 rounded hover:bg-white hover:text-black hover:shadow-2xs text-xs font-semibold flex items-center gap-1 transition-all"
            title="Heading 3"
          >
            <Heading3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">H3</span>
          </button>

          <div className="w-px h-5 bg-zinc-300 mx-1" />

          {/* Formatting */}
          <button
            type="button"
            onClick={() => executeCommand("bold")}
            disabled={disabled}
            className="p-1.5 rounded hover:bg-white hover:text-black hover:shadow-2xs transition-all"
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand("italic")}
            disabled={disabled}
            className="p-1.5 rounded hover:bg-white hover:text-black hover:shadow-2xs transition-all"
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand("underline")}
            disabled={disabled}
            className="p-1.5 rounded hover:bg-white hover:text-black hover:shadow-2xs transition-all"
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-5 bg-zinc-300 mx-1" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => executeCommand("insertUnorderedList")}
            disabled={disabled}
            className="p-1.5 rounded hover:bg-white hover:text-black hover:shadow-2xs transition-all"
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand("insertOrderedList")}
            disabled={disabled}
            className="p-1.5 rounded hover:bg-white hover:text-black hover:shadow-2xs transition-all"
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand("createLink")}
            disabled={disabled}
            className="p-1.5 rounded hover:bg-white hover:text-black hover:shadow-2xs transition-all"
            title="Add Link"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-5 bg-zinc-300 mx-1" />

          {/* Undo / Redo */}
          <button
            type="button"
            onClick={() => executeCommand("undo")}
            disabled={disabled}
            className="p-1.5 rounded hover:bg-white hover:text-black hover:shadow-2xs transition-all ml-auto"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand("redo")}
            disabled={disabled}
            className="p-1.5 rounded hover:bg-white hover:text-black hover:shadow-2xs transition-all"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Editable Content Area */}
        <div
          ref={editorRef}
          contentEditable={!disabled}
          onInput={handleInput}
          onKeyUp={saveSelection}
          onMouseUp={saveSelection}
          className="min-h-[260px] p-4 text-xs sm:text-sm text-zinc-800 leading-relaxed outline-none focus:outline-none bg-white font-sans prose prose-sm max-w-none prose-p:my-2 prose-headings:font-bold prose-headings:text-zinc-900 prose-a:text-saffron prose-a:underline"
          style={{ minHeight: "260px" }}
        />
      </div>

      {/* Personalize Your Email (Essential Dynamic Variables Bar) */}
      <div className="bg-soft-cream rounded-xl border border-cream-dark p-3.5 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-saffron" />
            <span className="text-xs font-bold text-maroon">
              Insert Dynamic Info:
            </span>
            <span className="text-[11px] text-stone-500">
              Click any tag below to insert participant information at your cursor
            </span>
          </div>
        </div>

        {/* 6 Essential Variable Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          {ESSENTIAL_VARIABLES.map((v) => {
            const isJustInserted = justInsertedKey === v.key;
            return (
              <button
                key={v.key}
                type="button"
                onClick={() => insertVariable(v.key)}
                disabled={disabled}
                title={v.description}
                className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border shadow-2xs ${
                  isJustInserted
                    ? "bg-maroon text-white border-maroon scale-95"
                    : "bg-white text-stone-800 border-cream-dark hover:border-saffron hover:bg-soft-cream"
                }`}
              >
                {isJustInserted ? (
                  <Check className="w-3.5 h-3.5 text-saffron" />
                ) : (
                  <span className="text-saffron font-bold text-xs">+</span>
                )}
                <span>{v.label}</span>
                <code className="text-[10px] font-mono text-stone-500 font-normal">
                  {v.token}
                </code>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}


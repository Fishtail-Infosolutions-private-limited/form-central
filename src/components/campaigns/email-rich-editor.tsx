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
import { AVAILABLE_EMAIL_VARIABLES, EmailVariableDefinition } from "@/lib/email/variables";

interface EmailRichEditorProps {
  value: string;
  onChange: (htmlContent: string) => void;
  disabled?: boolean;
}

export function EmailRichEditor({ value, onChange, disabled = false }: EmailRichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastRangeRef = useRef<Range | null>(null);
  const isUpdatingFromPropRef = useRef(false);
  const [activeTab, setActiveTab] = useState<"participant" | "competition" | "organization" | "links">("participant");
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

  // Group variables
  const groupedVariables: Record<string, EmailVariableDefinition[]> = {
    participant: AVAILABLE_EMAIL_VARIABLES.filter(
      (v) => !v.group || v.group === "participant"
    ),
    competition: AVAILABLE_EMAIL_VARIABLES.filter((v) => v.group === "competition"),
    organization: AVAILABLE_EMAIL_VARIABLES.filter((v) => v.group === "organization"),
    links: AVAILABLE_EMAIL_VARIABLES.filter((v) => v.group === "links"),
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

      {/* Personalize Your Email (Dynamic Variables Section) */}
      <div className="bg-soft-cream rounded-xl border border-cream-dark p-3.5 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-saffron" />
            <h4 className="text-xs font-bold text-maroon tracking-tight">
              Personalize Your Email
            </h4>
            <span className="text-[10px] text-zinc-500 hidden md:inline">
              — Insert participant information automatically at your cursor position
            </span>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 bg-white/70 p-0.5 rounded-lg border border-cream-dark">
            {(
              [
                { key: "participant", label: "Participant" },
                { key: "competition", label: "Competition" },
                { key: "organization", label: "Organization" },
                { key: "links", label: "Links" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                  activeTab === tab.key
                    ? "bg-maroon text-white shadow-2xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Variable Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {groupedVariables[activeTab]?.map((variable) => {
            const isJustInserted = justInsertedKey === variable.key;
            return (
              <button
                key={variable.key}
                type="button"
                onClick={() => insertVariable(variable.key)}
                disabled={disabled}
                title={`${variable.description} (Example: "${variable.sampleValue}")`}
                className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  isJustInserted
                    ? "bg-maroon text-white scale-95"
                    : "bg-white text-zinc-800 border border-cream-dark hover:border-saffron hover:bg-soft-cream"
                }`}
              >
                {isJustInserted ? (
                  <Check className="w-3 h-3 text-saffron" />
                ) : (
                  <span className="text-[10px] font-mono text-saffron font-bold">
                    +
                  </span>
                )}
                <span>{variable.label}</span>
                <span className="text-[10px] font-mono text-zinc-400 group-hover:text-zinc-600">
                  {`{{${variable.key}}}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}


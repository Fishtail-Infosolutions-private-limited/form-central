"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
  RotateCcw,
  RotateCw,
  RemoveFormatting,
} from "lucide-react";

interface RichTextEditorProps {
  id?: string;
  name: string;
  defaultValue?: string | null;
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
}

export function RichTextEditor({
  id,
  name,
  defaultValue = "",
  value,
  onChange,
  placeholder = "Write details here...",
  minHeight = "120px",
  className = "",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);
  const [currentHtml, setCurrentHtml] = useState<string>(value ?? defaultValue ?? "");
  const [activeStyles, setActiveStyles] = useState<{
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strike: boolean;
    h1: boolean;
    h2: boolean;
    ul: boolean;
    ol: boolean;
    quote: boolean;
  }>({
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    h1: false,
    h2: false,
    ul: false,
    ol: false,
    quote: false,
  });

  // Initialize content on mount
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      const initial = value ?? defaultValue ?? "";
      if (editorRef.current.innerHTML !== initial) {
        editorRef.current.innerHTML = initial;
        setCurrentHtml(initial);
      }
    }
  }, [defaultValue, value]);

  const updateActiveStyles = useCallback(() => {
    if (typeof document === "undefined") return;
    try {
      const bold = document.queryCommandState("bold");
      const italic = document.queryCommandState("italic");
      const underline = document.queryCommandState("underline");
      const strike = document.queryCommandState("strikeThrough");
      const ul = document.queryCommandState("insertUnorderedList");
      const ol = document.queryCommandState("insertOrderedList");

      // Check current block tag
      let h1 = false;
      let h2 = false;
      let quote = false;

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        let node: Node | null = selection.anchorNode;
        while (node && node !== editorRef.current) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            const tag = el.tagName.toLowerCase();
            if (tag === "h1") h1 = true;
            if (tag === "h2") h2 = true;
            if (tag === "blockquote") quote = true;
          }
          node = node.parentNode;
        }
      }

      setActiveStyles({ bold, italic, underline, strike, h1, h2, ul, ol, quote });
    } catch {
      // Ignore queryCommand errors if outside editor
    }
  }, []);

  const handleInput = () => {
    if (!editorRef.current) return;
    isInternalChange.current = true;
    const html = editorRef.current.innerHTML;
    // Treat empty tags as empty string
    const cleanHtml = html === "<p><br></p>" || html === "<br>" ? "" : html;
    setCurrentHtml(cleanHtml);
    if (onChange) onChange(cleanHtml);
    updateActiveStyles();
    setTimeout(() => {
      isInternalChange.current = false;
    }, 50);
  };

  const exec = (command: string, value: string | undefined = undefined) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
    handleInput();
  };

  const toggleHeading = (level: "h1" | "h2") => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    const currentBlock = document.queryCommandValue("formatBlock")?.toLowerCase();
    if (currentBlock === level) {
      document.execCommand("formatBlock", false, "<p>");
    } else {
      document.execCommand("formatBlock", false, `<${level}>`);
    }
    handleInput();
  };

  const toggleQuote = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const currentBlock = document.queryCommandValue("formatBlock")?.toLowerCase();
    if (currentBlock === "blockquote") {
      document.execCommand("formatBlock", false, "<p>");
    } else {
      document.execCommand("formatBlock", false, "<blockquote>");
    }
    handleInput();
  };

  const toggleCodeBlock = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const currentBlock = document.queryCommandValue("formatBlock")?.toLowerCase();
    if (currentBlock === "pre") {
      document.execCommand("formatBlock", false, "<p>");
    } else {
      document.execCommand("formatBlock", false, "<pre>");
    }
    handleInput();
  };

  return (
    <div
      className={`rounded-xl border border-zinc-300 bg-white shadow-2xs overflow-hidden focus-within:border-[#0A192F] focus-within:ring-2 focus-within:ring-[#C5A880]/20 transition-all ${className}`}
    >
      {/* Hidden input to support native Server Actions & forms */}
      <input type="hidden" id={id} name={name} value={currentHtml} />

      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 bg-zinc-50 border-b border-zinc-200 text-zinc-700">
        {/* Headings */}
        <button
          type="button"
          onClick={() => toggleHeading("h1")}
          className={`px-2 py-1 rounded text-xs font-bold transition-colors flex items-center gap-1 ${
            activeStyles.h1
              ? "bg-[#0A192F] text-white"
              : "hover:bg-zinc-200 text-zinc-800"
          }`}
          title="Heading 1"
        >
          <Heading1 className="w-3.5 h-3.5" />
          <span>H1</span>
        </button>

        <button
          type="button"
          onClick={() => toggleHeading("h2")}
          className={`px-2 py-1 rounded text-xs font-bold transition-colors flex items-center gap-1 ${
            activeStyles.h2
              ? "bg-[#0A192F] text-white"
              : "hover:bg-zinc-200 text-zinc-800"
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-3.5 h-3.5" />
          <span>H2</span>
        </button>

        <div className="w-px h-4 bg-zinc-300 mx-1" />

        {/* Inline Formatting */}
        <button
          type="button"
          onClick={() => exec("bold")}
          className={`p-1.5 rounded transition-colors ${
            activeStyles.bold
              ? "bg-[#0A192F] text-white"
              : "hover:bg-zinc-200 text-zinc-700"
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => exec("italic")}
          className={`p-1.5 rounded transition-colors ${
            activeStyles.italic
              ? "bg-[#0A192F] text-white"
              : "hover:bg-zinc-200 text-zinc-700"
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => exec("underline")}
          className={`p-1.5 rounded transition-colors ${
            activeStyles.underline
              ? "bg-[#0A192F] text-white"
              : "hover:bg-zinc-200 text-zinc-700"
          }`}
          title="Underline (Ctrl+U)"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => exec("strikeThrough")}
          className={`p-1.5 rounded transition-colors ${
            activeStyles.strike
              ? "bg-[#0A192F] text-white"
              : "hover:bg-zinc-200 text-zinc-700"
          }`}
          title="Strikethrough"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-zinc-300 mx-1" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => exec("insertUnorderedList")}
          className={`p-1.5 rounded transition-colors ${
            activeStyles.ul
              ? "bg-[#0A192F] text-white"
              : "hover:bg-zinc-200 text-zinc-700"
          }`}
          title="Bullet List"
        >
          <List className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => exec("insertOrderedList")}
          className={`p-1.5 rounded transition-colors ${
            activeStyles.ol
              ? "bg-[#0A192F] text-white"
              : "hover:bg-zinc-200 text-zinc-700"
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={toggleQuote}
          className={`p-1.5 rounded transition-colors ${
            activeStyles.quote
              ? "bg-[#0A192F] text-white"
              : "hover:bg-zinc-200 text-zinc-700"
          }`}
          title="Quote Block"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={toggleCodeBlock}
          className="p-1.5 rounded hover:bg-zinc-200 text-zinc-700 transition-colors"
          title="Code Block"
        >
          <Code className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-zinc-300 mx-1" />

        {/* Undo / Redo & Clear */}
        <button
          type="button"
          onClick={() => exec("undo")}
          className="p-1.5 rounded hover:bg-zinc-200 text-zinc-700 transition-colors"
          title="Undo"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => exec("redo")}
          className="p-1.5 rounded hover:bg-zinc-200 text-zinc-700 transition-colors"
          title="Redo"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => exec("removeFormat")}
          className="p-1.5 rounded hover:bg-zinc-200 text-zinc-700 transition-colors ml-auto"
          title="Clear Formatting"
        >
          <RemoveFormatting className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Editable Canvas */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyUp={updateActiveStyles}
        onMouseUp={updateActiveStyles}
        style={{ minHeight }}
        className="p-3 text-xs text-zinc-800 leading-relaxed outline-hidden overflow-y-auto focus:outline-hidden prose prose-sm max-w-none [&_h1]:text-base [&_h1]:font-extrabold [&_h1]:text-black [&_h1]:my-1.5 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-zinc-900 [&_h2]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1 [&_blockquote]:border-l-2 [&_blockquote]:border-[#C5A880] [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-zinc-600 [&_pre]:bg-zinc-900 [&_pre]:text-zinc-100 [&_pre]:p-2 [&_pre]:rounded [&_pre]:text-[11px]"
        data-placeholder={placeholder}
      />
    </div>
  );
}

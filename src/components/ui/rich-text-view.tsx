"use client";

import React from "react";

interface RichTextViewProps {
  content?: string | null;
  className?: string;
}

export function RichTextView({ content, className = "" }: RichTextViewProps) {
  if (!content || !content.trim()) return null;

  // If content contains HTML tags, render via dangerouslySetInnerHTML
  const hasHtmlTags = /<[a-z][\s\S]*>/i.test(content);

  if (hasHtmlTags) {
    return (
      <div
        className={`prose prose-sm max-w-none text-xs text-zinc-700 leading-relaxed break-words [&_h1]:text-base [&_h1]:font-extrabold [&_h1]:text-black [&_h1]:mt-2 [&_h1]:mb-1 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-zinc-900 [&_h2]:mt-1.5 [&_h2]:mb-0.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1.5 [&_li]:my-0.5 [&_strong]:font-bold [&_strong]:text-black [&_em]:italic [&_u]:underline [&_s]:line-through [&_blockquote]:border-l-2 [&_blockquote]:border-saffron [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-zinc-600 [&_blockquote]:my-1.5 [&_pre]:bg-zinc-900 [&_pre]:text-zinc-100 [&_pre]:p-2 [&_pre]:rounded-lg [&_pre]:text-[11px] [&_p]:my-1 ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Plain text fallback (preserves newlines)
  return (
    <div className={`text-xs text-zinc-700 leading-relaxed whitespace-pre-line ${className}`}>
      {content}
    </div>
  );
}

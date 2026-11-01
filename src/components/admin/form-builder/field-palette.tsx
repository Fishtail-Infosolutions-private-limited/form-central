"use client";

import React from "react";
import {
  Type,
  Mail,
  Phone,
  Hash,
  AlignLeft,
  ListFilter,
  CheckSquare,
  CircleDot,
  Calendar,
  Clock,
  FileUp,
  Image,
  Video,
  Heading,
  Minus,
  Check,
  Plus,
} from "lucide-react";
import { FieldType } from "@/types/form";

interface PaletteItem {
  type: FieldType;
  label: string;
  category: "standard" | "choice" | "media" | "layout";
  icon: React.ElementType;
  description: string;
}

const PALETTE_ITEMS: PaletteItem[] = [
  // Standard inputs
  { type: "text", label: "Text Input", category: "standard", icon: Type, description: "Single-line text (e.g. Handle, Team)" },
  { type: "email", label: "Email Address", category: "standard", icon: Mail, description: "Email format validation" },
  { type: "phone", label: "Phone Number", category: "standard", icon: Phone, description: "Mobile/telephone contact" },
  { type: "number", label: "Number", category: "standard", icon: Hash, description: "Numeric values, team size, age" },
  { type: "textarea", label: "Text Area", category: "standard", icon: AlignLeft, description: "Multi-line text, abstract, remarks" },
  { type: "date", label: "Date Picker", category: "standard", icon: Calendar, description: "Date of birth or milestone" },
  { type: "time", label: "Time Picker", category: "standard", icon: Clock, description: "Time slot or schedule preference" },

  // Choices
  { type: "select", label: "Dropdown Select", category: "choice", icon: ListFilter, description: "Category, division, or track selection" },
  { type: "radio", label: "Radio Buttons", category: "choice", icon: CircleDot, description: "Single choice selection" },
  { type: "checkbox-group", label: "Multiple Checkboxes", category: "choice", icon: CheckSquare, description: "Multiple option preferences" },
  { type: "checkbox", label: "Single Checkbox", category: "choice", icon: Check, description: "Terms, agreement, or consent" },

  // Media
  { type: "image", label: "Photo Upload", category: "media", icon: Image, description: "Image upload (Profile, badge, or ID)" },
  { type: "video", label: "Video Upload", category: "media", icon: Video, description: "Video upload (Google Drive storage)" },
  { type: "file", label: "Document Upload", category: "media", icon: FileUp, description: "Document upload (Resume, PDF, doc)" },

  // Layout
  { type: "heading", label: "Section Heading", category: "layout", icon: Heading, description: "Sub-section titles and guidance" },
  { type: "divider", label: "Divider Line", category: "layout", icon: Minus, description: "Visual separator" },
];

interface FieldPaletteProps {
  onAddField: (type: FieldType) => void;
}

export function FieldPalette({ onAddField }: FieldPaletteProps) {
  const renderCategory = (category: PaletteItem["category"], title: string) => {
    const items = PALETTE_ITEMS.filter((i) => i.category === category);
    return (
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block px-1">
          {title}
        </span>
        <div className="grid grid-cols-1 gap-1">
          {items.map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => onAddField(item.type)}
              className="flex items-center justify-between p-2 rounded-lg border border-stone-100 hover:border-[#B89150] hover:bg-warm-ivory text-left transition-all group w-full"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-6 h-6 rounded-md bg-stone-100 group-hover:bg-maroon group-hover:text-white text-stone-600 flex items-center justify-center shrink-0 transition-colors">
                  <item.icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-stone-800 group-hover:text-maroon truncate">
                    {item.label}
                  </div>
                  <div className="text-[10px] text-stone-400 truncate">{item.description}</div>
                </div>
              </div>
              <Plus className="w-3.5 h-3.5 text-stone-300 group-hover:text-saffron shrink-0 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-xs p-3.5 flex flex-col h-full overflow-hidden">
      <div className="mb-3 px-1">
        <h3 className="font-bold text-xs text-zinc-900 uppercase tracking-wider">Field Library</h3>
        <p className="text-[11px] text-zinc-500">Click to add to active step</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {renderCategory("standard", "Standard Fields")}
        {renderCategory("choice", "Options & Selection")}
        {renderCategory("media", "Media & Attachments")}
        {renderCategory("layout", "Layout & Text")}
      </div>
    </div>
  );
}

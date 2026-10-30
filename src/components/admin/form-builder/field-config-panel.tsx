"use client";

import React from "react";
import { FormFieldDefinition, FormStepDefinition } from "@/types/form";
import { X, Lock, Plus, Trash2, ShieldAlert, Sparkles, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface FieldConfigPanelProps {
  field: FormFieldDefinition | null;
  allSteps?: FormStepDefinition[];
  allFields?: FormFieldDefinition[];
  onChange: (updatedField: FormFieldDefinition) => void;
  onClose: () => void;
}

export function FieldConfigPanel({
  field,
  onChange,
  onClose,
}: FieldConfigPanelProps) {
  if (!field) {
    return (
      <div className="bg-[#FFFFFF] rounded-lg border border-[#E2E8F0] p-6 flex flex-col items-center justify-center text-center h-full min-h-[350px]">
        <div className="w-10 h-10 rounded-md bg-[#F8FAFC] border border-[#C5A880]/30 text-[#C5A880] flex items-center justify-center mb-3">
          <Sliders className="w-5 h-5" />
        </div>
        <p className="font-serif font-bold text-sm text-[#0A192F]">No Question Selected</p>
        <p className="text-xs text-[#0A192F]/70 max-w-xs mt-1.5 leading-relaxed">
          Select any question on the left panel to edit its label, help text, choices, or constraints.
        </p>
      </div>
    );
  }

  const isChoiceField = ["select", "radio", "checkbox-group"].includes(field.type);
  const isLayoutField = ["heading", "divider"].includes(field.type);

  const handleLabelChange = (newLabel: string) => {
    const updates: Partial<FormFieldDefinition> = { label: newLabel };
    if (!field.isSystem) {
      const autoKey = newLabel
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 32);
      if (autoKey) updates.fieldKey = autoKey;
    }
    onChange({ ...field, ...updates });
  };

  const handleAddOption = () => {
    const currentOptions = field.options || [];
    const count = currentOptions.length + 1;
    const newOpt = { label: `Option ${count}`, value: `opt_${count}` };
    onChange({
      ...field,
      options: [...currentOptions, newOpt],
    });
  };

  const handleUpdateOption = (index: number, label: string, value: string) => {
    const currentOptions = [...(field.options || [])];
    currentOptions[index] = { label, value };
    onChange({ ...field, options: currentOptions });
  };

  const handleDeleteOption = (index: number) => {
    const currentOptions = (field.options || []).filter((_, i) => i !== index);
    onChange({ ...field, options: currentOptions });
  };

  return (
    <div className="bg-[#FFFFFF] rounded-lg border border-[#E2E8F0] shadow-xs p-5 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#E2E8F0] shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="font-serif font-bold text-sm text-[#0A192F] capitalize">
            Configure {field.type.replace("-", " ")}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {field.isSystem && (
            <span className="text-[10px] font-bold text-[#C5A880] bg-[#F8FAFC] border border-[#C5A880]/40 px-2 py-0.5 rounded flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" />
              <span>Protected Requirement</span>
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-[#0A192F] p-1 rounded-md hover:bg-[#F8FAFC]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1 text-xs">
        {field.isSystem && (
          <div className="p-3 rounded-md bg-[#F8FAFC] border border-[#C5A880]/30 text-[11px] text-[#0A192F]/80 leading-relaxed flex items-start gap-2">
            <Lock className="w-3.5 h-3.5 text-[#C5A880] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#0A192F]">Core Requirement:</strong> You can customize the visible label, helper text, and placeholders. This question cannot be deleted because it is required for candidate identity verification and adjudication.
            </div>
          </div>
        )}

        {/* Field Label */}
        <div className="space-y-1.5">
          <Label htmlFor="fieldLabel" className="text-xs font-bold text-[#0A192F]">
            Question / Field Label
          </Label>
          <Input
            id="fieldLabel"
            value={field.label}
            onChange={(e) => handleLabelChange(e.target.value)}
            className="text-xs h-9 font-medium border-[#E2E8F0] bg-[#F8FAFC]"
            placeholder="e.g. Talent Specialization or Audition Link"
          />
        </div>

        {/* Internal Field Key */}
        {!field.isSystem && (
          <div className="space-y-1.5">
            <Label htmlFor="fieldKey" className="text-xs font-bold text-[#0A192F]">
              Internal Field Identifier
            </Label>
            <Input
              id="fieldKey"
              value={field.fieldKey}
              onChange={(e) => onChange({ ...field, fieldKey: e.target.value })}
              className="text-xs h-8 font-mono border-[#E2E8F0] bg-[#F8FAFC]"
            />
            <p className="text-[10px] text-zinc-500 font-mono">Unique key used in export tables and receipts.</p>
          </div>
        )}

        {/* Placeholder (if applicable) */}
        {!isLayoutField && field.type !== "checkbox" && (
          <div className="space-y-1.5">
            <Label htmlFor="fieldPlaceholder" className="text-xs font-bold text-[#0A192F]">
              Placeholder Text
            </Label>
            <Input
              id="fieldPlaceholder"
              value={field.placeholder || ""}
              onChange={(e) => onChange({ ...field, placeholder: e.target.value })}
              className="text-xs h-9 border-[#E2E8F0] bg-[#F8FAFC]"
              placeholder="e.g. Enter your response..."
            />
          </div>
        )}

        {/* Sub-description */}
        <div className="space-y-1.5">
          <Label htmlFor="fieldDescription" className="text-xs font-bold text-[#0A192F]">
            Instructions / Guidance Note
          </Label>
          <Textarea
            id="fieldDescription"
            value={field.description || ""}
            onChange={(e) => onChange({ ...field, description: e.target.value })}
            className="text-xs border-[#E2E8F0] bg-[#F8FAFC]"
            rows={2}
            placeholder="Sub-instruction shown beneath the input..."
          />
        </div>

        {/* Required Toggle */}
        {!isLayoutField && (
          <div className="pt-2 border-t border-[#E2E8F0]">
            <label className="flex items-center justify-between cursor-pointer p-2.5 rounded-md hover:bg-[#F8FAFC] border border-[#E2E8F0]">
              <div>
                <span className="font-bold text-xs text-[#0A192F] block">Mandatory Question</span>
                <span className="text-[10px] text-zinc-500">
                  Must be provided before moving to the next step
                </span>
              </div>
              <input
                type="checkbox"
                checked={field.required}
                disabled={field.isSystem}
                onChange={(e) => onChange({ ...field, required: e.target.checked })}
                className="w-4 h-4 rounded text-[#A64B36] focus:ring-[#C5A880] cursor-pointer"
              />
            </label>
          </div>
        )}

        {/* Choice Options Editor (for select, radio, checkbox-group) */}
        {isChoiceField && (
          <div className="space-y-2.5 pt-3 border-t border-[#E2E8F0]">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-[#0A192F]">Choice Options</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddOption}
                className="h-7 text-xs font-semibold gap-1 text-[#0A192F] hover:bg-[#F8FAFC] border-[#E2E8F0]"
              >
                <Plus className="w-3 h-3 text-[#A64B36]" />
                <span>Add Option</span>
              </Button>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {(field.options || []).map((opt, i) => (
                <div key={i} className="flex items-center gap-1.5 p-1.5 rounded-md border border-[#E2E8F0] bg-[#F8FAFC]">
                  <Input
                    value={opt.label}
                    onChange={(e) => handleUpdateOption(i, e.target.value, e.target.value.toLowerCase().replace(/\s+/g, "_"))}
                    placeholder={`Option ${i + 1}`}
                    className="h-7 text-xs flex-1 bg-white border-[#E2E8F0]"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteOption(i)}
                    className="p-1 text-zinc-400 hover:text-[#A64B36] rounded"
                    title="Delete Option"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Numeric limits */}
        {field.type === "number" && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E2E8F0]">
            <div className="space-y-1">
              <Label htmlFor="minVal" className="text-xs font-bold text-[#0A192F]">Minimum</Label>
              <Input
                id="minVal"
                type="number"
                value={field.validation?.min ?? ""}
                onChange={(e) =>
                  onChange({
                    ...field,
                    validation: {
                      ...field.validation,
                      min: e.target.value ? Number(e.target.value) : undefined,
                    },
                  })
                }
                className="text-xs h-8 border-[#E2E8F0] bg-[#F8FAFC]"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="maxVal" className="text-xs font-bold text-[#0A192F]">Maximum</Label>
              <Input
                id="maxVal"
                type="number"
                value={field.validation?.max ?? ""}
                onChange={(e) =>
                  onChange({
                    ...field,
                    validation: {
                      ...field.validation,
                      max: e.target.value ? Number(e.target.value) : undefined,
                    },
                  })
                }
                className="text-xs h-8 border-[#E2E8F0] bg-[#F8FAFC]"
              />
            </div>
          </div>
        )}

        {/* Text character limits */}
        {(field.type === "text" || field.type === "textarea") && !field.isSystem && (
          <div className="space-y-1 pt-2 border-t border-[#E2E8F0]">
            <Label htmlFor="maxLen" className="text-xs font-bold text-[#0A192F]">Max Characters</Label>
            <Input
              id="maxLen"
              type="number"
              value={field.validation?.maxLength ?? ""}
              onChange={(e) =>
                onChange({
                  ...field,
                  validation: {
                    ...field.validation,
                    maxLength: e.target.value ? Number(e.target.value) : undefined,
                  },
                })
              }
              placeholder="e.g. 500"
              className="text-xs h-8 border-[#E2E8F0] bg-[#F8FAFC]"
            />
          </div>
        )}
      </div>
    </div>
  );
}

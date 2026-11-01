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
      <div className="bg-white rounded-xl border border-stone-200/80 p-6 flex flex-col items-center justify-center text-center h-full min-h-[350px] shadow-xs">
        <div className="w-10 h-10 rounded-lg bg-warm-ivory border border-[#B89150]/30 text-[#B89150] flex items-center justify-center mb-3">
          <Sliders className="w-5 h-5" />
        </div>
        <p className="font-serif font-bold text-sm text-charcoal">No Question Selected</p>
        <p className="text-xs text-stone-500 max-w-xs mt-1.5 leading-relaxed">
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
    <div className="bg-white rounded-xl border border-stone-200/80 shadow-xs p-5 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-stone-100 shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="font-serif font-bold text-sm text-charcoal capitalize">
            Configure {field.type.replace("-", " ")}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {field.isSystem && (
            <span className="text-[10px] font-semibold text-[#B89150] bg-warm-ivory border border-[#B89150]/30 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" />
              <span>Protected Requirement</span>
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-800 p-1 rounded-md hover:bg-stone-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1 text-xs">
        {field.isSystem && (
          <div className="p-3 rounded-lg bg-warm-ivory border border-[#B89150]/30 text-[11px] text-stone-700 leading-relaxed flex items-start gap-2">
            <Lock className="w-3.5 h-3.5 text-[#B89150] shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-900">Core Requirement:</strong> You can customize the visible label, helper text, and placeholders. This question cannot be deleted because it is required for candidate identity verification.
            </div>
          </div>
        )}

        {/* Field Label */}
        <div className="space-y-1.5">
          <Label htmlFor="fieldLabel" className="text-xs font-semibold text-stone-700">
            Question / Field Label
          </Label>
          <Input
            id="fieldLabel"
            value={field.label}
            onChange={(e) => handleLabelChange(e.target.value)}
            className="text-xs h-9 font-medium border-stone-200 bg-warm-ivory"
            placeholder="e.g. Talent Specialization or Audition Link"
          />
        </div>

        {/* Internal Field Key */}
        {!field.isSystem && (
          <div className="space-y-1.5">
            <Label htmlFor="fieldKey" className="text-xs font-semibold text-stone-700">
              Internal Field Identifier
            </Label>
            <Input
              id="fieldKey"
              value={field.fieldKey}
              onChange={(e) => onChange({ ...field, fieldKey: e.target.value })}
              className="text-xs h-8 font-mono border-stone-200 bg-stone-50"
            />
            <p className="text-[10px] text-stone-400 font-mono">Unique key used in export tables and receipts.</p>
          </div>
        )}

        {/* Placeholder (if applicable) */}
        {!isLayoutField && field.type !== "checkbox" && (
          <div className="space-y-1.5">
            <Label htmlFor="fieldPlaceholder" className="text-xs font-semibold text-stone-700">
              Placeholder Text
            </Label>
            <Input
              id="fieldPlaceholder"
              value={field.placeholder || ""}
              onChange={(e) => onChange({ ...field, placeholder: e.target.value })}
              className="text-xs h-9 border-stone-200 bg-stone-50"
              placeholder="e.g. Enter your response..."
            />
          </div>
        )}

        {/* Sub-description */}
        <div className="space-y-1.5">
          <Label htmlFor="fieldDescription" className="text-xs font-semibold text-stone-700">
            Instructions / Guidance Note
          </Label>
          <Textarea
            id="fieldDescription"
            value={field.description || ""}
            onChange={(e) => onChange({ ...field, description: e.target.value })}
            className="text-xs border-stone-200 bg-stone-50"
            rows={2}
            placeholder="Sub-instruction shown beneath the input..."
          />
        </div>

        {/* Required Toggle */}
        {!isLayoutField && (
          <div className="pt-2 border-t border-stone-100">
            <label className="flex items-center justify-between cursor-pointer p-2.5 rounded-lg hover:bg-warm-ivory border border-stone-200">
              <div>
                <span className="font-semibold text-xs text-stone-800 block">Mandatory Question</span>
                <span className="text-[10px] text-stone-500">
                  Must be provided before moving to next step
                </span>
              </div>
              <input
                type="checkbox"
                checked={field.required}
                disabled={field.isSystem}
                onChange={(e) => onChange({ ...field, required: e.target.checked })}
                className="w-4 h-4 rounded text-maroon focus:ring-[#7F1D2D] cursor-pointer"
              />
            </label>
          </div>
        )}

        {/* Choice Options Editor (for select, radio, checkbox-group) */}
        {isChoiceField && (
          <div className="space-y-2.5 pt-3 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-stone-700">Choice Options</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddOption}
                className="h-7 text-xs font-medium gap-1 text-stone-700 hover:bg-stone-50 border-stone-200"
              >
                <Plus className="w-3 h-3 text-saffron" />
                <span>Add Option</span>
              </Button>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {(field.options || []).map((opt, i) => (
                <div key={i} className="flex items-center gap-1.5 p-1.5 rounded-lg border border-stone-200 bg-stone-50">
                  <Input
                    value={opt.label}
                    onChange={(e) => handleUpdateOption(i, e.target.value, e.target.value.toLowerCase().replace(/\s+/g, "_"))}
                    placeholder={`Option ${i + 1}`}
                    className="h-7 text-xs flex-1 bg-white border-stone-200"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteOption(i)}
                    className="p-1 text-stone-400 hover:text-rose-600 rounded transition-colors"
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
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100">
            <div className="space-y-1">
              <Label htmlFor="minVal" className="text-xs font-semibold text-stone-700">Minimum</Label>
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
                className="text-xs h-8 border-stone-200 bg-stone-50"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="maxVal" className="text-xs font-semibold text-stone-700">Maximum</Label>
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
                className="text-xs h-8 border-stone-200 bg-stone-50"
              />
            </div>
          </div>
        )}

        {/* Text character limits */}
        {(field.type === "text" || field.type === "textarea") && !field.isSystem && (
          <div className="space-y-1 pt-2 border-t border-stone-100">
            <Label htmlFor="maxLen" className="text-xs font-semibold text-stone-700">Max Characters</Label>
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
              className="text-xs h-8 border-stone-200 bg-stone-50"
            />
          </div>
        )}
      </div>
    </div>
  );
}

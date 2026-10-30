"use client";

import React from "react";
import { FormFieldDefinition, FormStepDefinition } from "@/types/form";
import { X, Lock, Plus, Trash2 } from "lucide-react";
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
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs p-6 flex flex-col items-center justify-center text-center h-full">
        <p className="font-bold text-xs text-zinc-800">No Field Selected</p>
        <p className="text-[11px] text-zinc-400 max-w-xs mt-1">
          Click on any field on the canvas to configure its label, placeholder, choices, or validation rules.
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
    <div className="bg-white rounded-xl border border-zinc-200 shadow-xs p-4 flex flex-col h-full overflow-hidden">
      {/* Drawer Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-sm text-zinc-900 capitalize">
            Configure {field.type.replace("-", " ")}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {field.isSystem && (
            <span className="text-[10px] font-bold text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" />
              <span>System Field</span>
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-black p-1 rounded-md hover:bg-zinc-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 py-3 pr-1 text-xs">
        {/* Field Label */}
        <div className="space-y-1">
          <Label htmlFor="fieldLabel" required>
            Display Question / Title
          </Label>
          <Input
            id="fieldLabel"
            value={field.label}
            onChange={(e) => handleLabelChange(e.target.value)}
            className="text-xs h-9 font-medium"
            placeholder="e.g. T-Shirt Size or Project Repository URL"
          />
        </div>

        {/* Placeholder (if applicable) */}
        {!isLayoutField && field.type !== "checkbox" && (
          <div className="space-y-1">
            <Label htmlFor="fieldPlaceholder">Input Placeholder</Label>
            <Input
              id="fieldPlaceholder"
              value={field.placeholder || ""}
              onChange={(e) => onChange({ ...field, placeholder: e.target.value })}
              className="text-xs h-9"
              placeholder="e.g. Enter your GitHub profile URL..."
            />
          </div>
        )}

        {/* Sub-description */}
        <div className="space-y-1">
          <Label htmlFor="fieldDescription">Help Text / Instructions (Optional)</Label>
          <Textarea
            id="fieldDescription"
            value={field.description || ""}
            onChange={(e) => onChange({ ...field, description: e.target.value })}
            className="text-xs"
            rows={2}
            placeholder="Sub-instruction shown beneath the input..."
          />
        </div>

        {/* Required Toggle */}
        {!isLayoutField && (
          <div className="pt-2 border-t border-zinc-100">
            <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-zinc-50 border border-zinc-100">
              <div>
                <span className="font-bold text-xs text-zinc-900 block">Required Question</span>
                <span className="text-[10px] text-zinc-500">
                  Must be filled before completing registration
                </span>
              </div>
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => onChange({ ...field, required: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
            </label>
          </div>
        )}

        {/* Choice Options Editor (for select, radio, checkbox-group) */}
        {isChoiceField && (
          <div className="space-y-2 pt-3 border-t border-zinc-100">
            <div className="flex items-center justify-between">
              <Label required>Choice Options</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddOption}
                className="h-7 text-xs font-semibold gap-1 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200"
              >
                <Plus className="w-3 h-3" />
                <span>Add Choice</span>
              </Button>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {(field.options || []).map((opt, i) => (
                <div key={i} className="flex items-center gap-1.5 p-1.5 rounded-lg border border-zinc-200 bg-zinc-50">
                  <Input
                    value={opt.label}
                    onChange={(e) => handleUpdateOption(i, e.target.value, e.target.value.toLowerCase().replace(/\s+/g, "_"))}
                    placeholder={`Option ${i + 1}`}
                    className="h-7 text-xs flex-1 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteOption(i)}
                    className="p-1 text-zinc-400 hover:text-red-600 rounded"
                    title="Delete Option"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Numeric / Text validation */}
        {field.type === "number" && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100">
            <div className="space-y-1">
              <Label htmlFor="minVal">Minimum Value</Label>
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
                className="text-xs h-8"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="maxVal">Maximum Value</Label>
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
                className="text-xs h-8"
              />
            </div>
          </div>
        )}

        {field.type === "text" && !field.isSystem && (
          <div className="space-y-1 pt-2 border-t border-zinc-100">
            <Label htmlFor="maxLen">Max Characters</Label>
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
              placeholder="e.g. 100"
              className="text-xs h-8"
            />
          </div>
        )}
      </div>
    </div>
  );
}

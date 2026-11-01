"use client";

import React, { useState } from "react";
import {
  X,
  Lock,
  Plus,
  Trash2,
  Copy,
  Settings,
  Sliders,
  CheckCircle2,
  Info,
} from "lucide-react";
import { FormFieldDefinition, FieldOption } from "@/types/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface QuestionConfigDrawerProps {
  field: FormFieldDefinition | null;
  onUpdate: (updatedField: FormFieldDefinition) => void;
  onDelete: (fieldId: string) => void;
  onDuplicate: (field: FormFieldDefinition) => void;
  onClose: () => void;
}

export function QuestionConfigDrawer({
  field,
  onUpdate,
  onDelete,
  onDuplicate,
  onClose,
}: QuestionConfigDrawerProps) {
  const [activeTab, setActiveTab] = useState<"general" | "validation">("general");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!field) return null;

  const isSystemField = Boolean(
    field.isSystem || ["fullName", "email", "phone"].includes(field.fieldKey)
  );

  const hasOptions = ["select", "radio", "checkbox-group"].includes(field.type);
  const isUploadField = ["image", "video", "file"].includes(field.type);
  const isTextField = ["text", "textarea"].includes(field.type);
  const isNumberField = field.type === "number";

  const handleLabelChange = (val: string) => {
    onUpdate({ ...field, label: val });
  };

  const handleKeyChange = (val: string) => {
    if (isSystemField) return;
    // sanitize key: only alphanumeric and underscores
    const sanitized = val.toLowerCase().replace(/[^a-z0-9_]/g, "");
    onUpdate({ ...field, fieldKey: sanitized });
  };

  const handleAddOption = () => {
    const currentOptions = field.options || [];
    const count = currentOptions.length + 1;
    const newOptions: FieldOption[] = [
      ...currentOptions,
      { label: `Option ${count}`, value: `option_${count}` },
    ];
    onUpdate({ ...field, options: newOptions });
  };

  const handleUpdateOption = (index: number, key: "label" | "value", val: string) => {
    const currentOptions = [...(field.options || [])];
    if (!currentOptions[index]) return;
    currentOptions[index] = {
      ...currentOptions[index],
      [key]: val,
    };
    onUpdate({ ...field, options: currentOptions });
  };

  const handleDeleteOption = (index: number) => {
    const currentOptions = (field.options || []).filter((_, i) => i !== index);
    onUpdate({ ...field, options: currentOptions });
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-[#DCE5ED] shadow-lg">
      {/* Drawer Header */}
      <div className="p-4 border-b border-[#DCE5ED] bg-[#F4F7FA] flex items-center justify-between">
        <div className="space-y-0.5 min-w-0 pr-2">
          <div className="flex items-center gap-1.5">
            {isSystemField && <Lock className="w-3.5 h-3.5 text-[#356FA8]" />}
            <span className="text-xs font-bold text-[#183153] truncate block">
              {field.label || "Untitled Question"}
            </span>
          </div>
          <span className="text-[10px] text-[#546E7A] font-medium uppercase tracking-wider block">
            Type: {field.type}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-[#546E7A] hover:text-[#183153] hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center border-b border-[#DCE5ED] bg-white px-3">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-bold border-b-2 transition-colors ${
            activeTab === "general"
              ? "border-[#183153] text-[#183153]"
              : "border-transparent text-[#546E7A] hover:text-[#183153]"
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>General</span>
        </button>
        <button
          onClick={() => setActiveTab("validation")}
          className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-bold border-b-2 transition-colors ${
            activeTab === "validation"
              ? "border-[#183153] text-[#183153]"
              : "border-transparent text-[#546E7A] hover:text-[#183153]"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Validation &amp; Rules</span>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* System Protected Notice */}
        {isSystemField && (
          <div className="p-3 rounded-lg bg-[#F4F7FA] border border-[#DCE5ED] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#263238]">
              <Lock className="w-3.5 h-3.5 text-dark-taupe" />
              <span>System-Protected Identity Question</span>
            </div>
            <p className="text-[11px] text-taupe-grey leading-relaxed">
              This field is mandatory for applicant identity and email OTP verification. You may edit the displayed label and placeholder, but the field cannot be deleted or set as optional.
            </p>
          </div>
        )}

        {activeTab === "general" ? (
          <>
            {/* Label */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#263238]">Question Label *</Label>
              <Input
                value={field.label}
                onChange={(e) => handleLabelChange(e.target.value)}
                className="h-9 text-xs border-[#DCE5ED] bg-white"
                placeholder="Question title..."
              />
            </div>

            {/* Placeholder */}
            {!["checkbox", "radio", "heading"].includes(field.type) && (
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#263238]">Placeholder Text</Label>
                <Input
                  value={field.placeholder || ""}
                  onChange={(e) => onUpdate({ ...field, placeholder: e.target.value })}
                  className="h-9 text-xs border-[#DCE5ED] bg-white"
                  placeholder="Placeholder shown in empty field..."
                />
              </div>
            )}

            {/* Description / Help Text */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#263238]">Help / Description Text</Label>
              <Textarea
                rows={2}
                value={field.description || ""}
                onChange={(e) => onUpdate({ ...field, description: e.target.value })}
                className="text-xs border-[#DCE5ED] bg-white"
                placeholder="Helpful guidance for participants..."
              />
            </div>

            {/* Required Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-[#DCE5ED] bg-[#F4F7FA]">
              <div>
                <span className="font-bold text-xs text-[#183153] block">Mandatory Field</span>
                <span className="text-[11px] text-[#546E7A]">
                  Participant must answer this question to proceed.
                </span>
              </div>
              <button
                type="button"
                disabled={isSystemField}
                onClick={() => onUpdate({ ...field, required: !field.required })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 border transition-colors duration-200 ease-in-out ${
                  field.required ? "bg-[#183153] border-[#183153]" : "bg-slate-300 border-slate-300"
                } ${isSystemField ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    field.required ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Options Manager for Select / Radio / Checkbox-group */}
            {hasOptions && (
              <div className="space-y-2 pt-2 border-t border-[#DCE5ED]">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-[#263238]">Answer Choices</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddOption}
                    className="h-7 text-[11px] gap-1 border-[#DCE5ED] hover:bg-[#F4F7FA]"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Choice</span>
                  </Button>
                </div>
                <div className="space-y-2">
                  {(field.options || []).map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        value={opt.label}
                        onChange={(e) => handleUpdateOption(idx, "label", e.target.value)}
                        placeholder="Label"
                        className="h-8 text-xs border-[#DCE5ED] bg-white flex-1"
                      />
                      <Input
                        value={opt.value}
                        onChange={(e) => handleUpdateOption(idx, "value", e.target.value)}
                        placeholder="Value"
                        className="h-8 text-xs border-[#DCE5ED] bg-[#F4F7FA] font-mono w-24"
                      />
                      {(field.options?.length || 0) > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteOption(idx)}
                          className="p-1 text-taupe-grey hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Validation Tab */
          <div className="space-y-4">
            {isTextField && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-[#263238]">Min Characters</Label>
                  <Input
                    type="number"
                    min="0"
                    value={field.validation?.minLength ?? ""}
                    onChange={(e) =>
                      onUpdate({
                        ...field,
                        validation: {
                          ...field.validation,
                          minLength: e.target.value ? Number(e.target.value) : undefined,
                        },
                      })
                    }
                    className="h-8 text-xs border-[#DCE5ED] bg-white font-mono"
                    placeholder="None"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-[#263238]">Max Characters</Label>
                  <Input
                    type="number"
                    min="1"
                    value={field.validation?.maxLength ?? ""}
                    onChange={(e) =>
                      onUpdate({
                        ...field,
                        validation: {
                          ...field.validation,
                          maxLength: e.target.value ? Number(e.target.value) : undefined,
                        },
                      })
                    }
                    className="h-8 text-xs border-[#DCE5ED] bg-white font-mono"
                    placeholder="None"
                  />
                </div>
              </div>
            )}

            {isNumberField && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-[#263238]">Minimum Value</Label>
                  <Input
                    type="number"
                    value={field.validation?.min ?? ""}
                    onChange={(e) =>
                      onUpdate({
                        ...field,
                        validation: {
                          ...field.validation,
                          min: e.target.value ? Number(e.target.value) : undefined,
                        },
                      })
                    }
                    className="h-8 text-xs border-[#DCE5ED] bg-white font-mono"
                    placeholder="None"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-[#263238]">Maximum Value</Label>
                  <Input
                    type="number"
                    value={field.validation?.max ?? ""}
                    onChange={(e) =>
                      onUpdate({
                        ...field,
                        validation: {
                          ...field.validation,
                          max: e.target.value ? Number(e.target.value) : undefined,
                        },
                      })
                    }
                    className="h-8 text-xs border-[#DCE5ED] bg-white font-mono"
                    placeholder="None"
                  />
                </div>
              </div>
            )}

            {isUploadField && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-[#263238]">
                    Max Upload File Size (MB)
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max="500"
                    value={field.validation?.maxFileSizeMb ?? ""}
                    onChange={(e) =>
                      onUpdate({
                        ...field,
                        validation: {
                          ...field.validation,
                          maxFileSizeMb: e.target.value ? Number(e.target.value) : undefined,
                        },
                      })
                    }
                    className="h-8 text-xs border-[#DCE5ED] bg-white font-mono"
                    placeholder={field.type === "video" ? "100" : "10"}
                  />
                </div>

                <div className="p-3 rounded-lg bg-[#F4F7FA] border border-[#DCE5ED] text-[11px] text-taupe-grey space-y-1">
                  <span className="font-semibold text-[#263238] block">Supported Media Ingestion</span>
                  <p>
                    {field.type === "video"
                      ? "Videos stream directly to your authenticated Google Drive folder."
                      : field.type === "image"
                      ? "Images are safely optimized and stored on local disk or drive."
                      : "PDF, DOCX and identity papers are verified in the review drawer."}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Drawer Footer Actions */}
      <div className="p-4 border-t border-[#DCE5ED] bg-[#F4F7FA] flex items-center justify-between gap-2">
        {!isSystemField && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            className="h-8 text-xs border-[#DCE5ED] text-rose-600 hover:bg-rose-50 hover:border-rose-200 gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </Button>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-[#DCE5ED] p-6 max-w-sm w-full space-y-4 shadow-xl">
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-[#263238]">Delete Question?</h4>
                <p className="text-xs text-[#546E7A] leading-relaxed">
                  Are you sure you want to delete &quot;<strong className="text-[#263238]">{field.label}</strong>&quot;? This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="h-8 text-xs border-[#DCE5ED]"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    onDelete(field.id);
                  }}
                  className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                >
                  Delete Question
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {!isSystemField && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onDuplicate(field)}
              className="h-8 text-xs border-[#DCE5ED] text-[#263238] hover:bg-white gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Duplicate</span>
            </Button>
          )}

          <Button
            type="button"
            size="sm"
            onClick={onClose}
            className="h-8 text-xs bg-[#183153] hover:bg-[#12243D] text-white font-bold px-4"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}



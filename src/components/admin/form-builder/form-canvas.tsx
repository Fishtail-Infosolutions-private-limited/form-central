"use client";

import React, { useState } from "react";
import {
  FormStepDefinition,
  FormFieldDefinition,
} from "@/types/form";
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Copy,
  Lock,
  Plus,
  Pencil,
  Check,
  GripVertical,
  HelpCircle,
  FileQuestion,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormCanvasProps {
  steps: FormStepDefinition[];
  activeStepIndex: number;
  selectedFieldId: string | null;
  onSelectStep: (index: number) => void;
  onAddStep: () => void;
  onDeleteStep: (index: number) => void;
  onUpdateStepMeta: (index: number, title: string, description?: string) => void;
  onSelectField: (field: FormFieldDefinition) => void;
  onMoveField: (stepIndex: number, fieldIndex: number, direction: "up" | "down") => void;
  onReorderFields?: (stepIndex: number, newFields: FormFieldDefinition[]) => void;
  onDuplicateField: (stepIndex: number, fieldIndex: number) => void;
  onDeleteField: (stepIndex: number, fieldIndex: number) => void;
}

function reorderFields(
  fields: FormFieldDefinition[],
  fromIndex: number,
  toIndex: number,
  position: "top" | "bottom"
): FormFieldDefinition[] {
  if (fromIndex === toIndex) return fields;
  const result = [...fields];
  const [removed] = result.splice(fromIndex, 1);

  let insertAt = toIndex;
  if (fromIndex < toIndex) {
    insertAt = position === "top" ? toIndex - 1 : toIndex;
  } else {
    insertAt = position === "top" ? toIndex : toIndex + 1;
  }

  insertAt = Math.max(0, Math.min(insertAt, result.length));
  result.splice(insertAt, 0, removed);
  return result;
}

export function FormCanvas({
  steps,
  activeStepIndex,
  selectedFieldId,
  onSelectStep,
  onAddStep,
  onDeleteStep,
  onUpdateStepMeta,
  onSelectField,
  onMoveField,
  onReorderFields,
  onDuplicateField,
  onDeleteField,
}: FormCanvasProps) {
  const currentStep = steps[activeStepIndex] || steps[0];
  const [isEditingStepTitle, setIsEditingStepTitle] = useState(false);
  const [stepTitleInput, setStepTitleInput] = useState(currentStep?.title || "");

  // Drag and Drop States
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dropPosition, setDropPosition] = useState<"top" | "bottom" | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("input") || target.closest("select")) {
      e.preventDefault();
      return;
    }
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedIndex === null) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const pos = e.clientY < midY ? "top" : "bottom";

    setDragOverIndex(index);
    setDropPosition(pos);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
    setDropPosition(null);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || dropPosition === null) return;

    if (onReorderFields) {
      const newFields = reorderFields(
        currentStep.fields,
        draggedIndex,
        toIndex,
        dropPosition
      );
      onReorderFields(activeStepIndex, newFields);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
    setDropPosition(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setDropPosition(null);
  };

  const handleSaveStepTitle = () => {
    if (!stepTitleInput.trim()) return;
    onUpdateStepMeta(activeStepIndex, stepTitleInput.trim());
    setIsEditingStepTitle(false);
  };

  return (
    <div className="bg-[#FFFFFF] rounded-lg border border-[#E8DFD0] shadow-xs flex flex-col h-full overflow-hidden">
      {/* Top Step Selector Tabs */}
      <div className="bg-[#FAF5EE] border-b border-[#E8DFD0] px-4 pt-3 flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-0">
          {steps.map((step, idx) => {
            const isActive = idx === activeStepIndex;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  onSelectStep(idx);
                  setStepTitleInput(steps[idx].title);
                  setIsEditingStepTitle(false);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs rounded-t-md transition-all border-t-2 border-x whitespace-nowrap ${
                  isActive
                    ? "bg-[#FFFFFF] text-[#292821] border-t-[#A64B36] border-x-[#E8DFD0] font-bold shadow-2xs"
                    : "bg-[#FAF5EE] text-[#292821]/70 border-transparent hover:bg-[#E8DFD0]/60 font-medium"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded text-[10px] flex items-center justify-center font-bold ${
                    isActive ? "bg-[#292821] text-[#F5F0E6]" : "bg-[#E8DFD0] text-[#292821]"
                  }`}
                >
                  {idx + 1}
                </span>
                <span>{step.title}</span>
                <span className="text-[10px] text-zinc-400">({step.fields.length})</span>
              </button>
            );
          })}

          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={onAddStep}
            className="h-8 text-xs text-[#292821] border-dashed border-[#E8DFD0] hover:border-[#B69A65] hover:bg-[#FAF5EE] gap-1 px-3 font-semibold ml-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-[#A64B36]" />
            <span>Add Step</span>
          </Button>
        </div>
      </div>

      {/* Step Header */}
      <div className="p-4 border-b border-[#E8DFD0] bg-[#FFFFFF] flex items-center justify-between gap-4">
        <div className="flex-1">
          {isEditingStepTitle ? (
            <div className="flex items-center gap-2 max-w-md">
              <input
                type="text"
                value={stepTitleInput}
                onChange={(e) => setStepTitleInput(e.target.value)}
                className="text-xs font-bold text-[#292821] border border-[#E8DFD0] bg-[#FAF5EE] rounded px-3 py-1 flex-1 focus:outline-[#B69A65]"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleSaveStepTitle()}
              />
              <Button size="sm" onClick={handleSaveStepTitle} className="h-8 text-xs bg-[#292821] text-[#F5F0E6] font-bold gap-1">
                <Check className="w-3.5 h-3.5 text-[#B69A65]" />
                <span>Save</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-serif font-bold text-[#292821]">
                Step {activeStepIndex + 1}: {currentStep.title}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setStepTitleInput(currentStep.title);
                  setIsEditingStepTitle(true);
                }}
                className="p-1 rounded text-zinc-400 hover:text-[#292821] hover:bg-[#FAF5EE] transition-colors"
                title="Rename step"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {activeStepIndex === 0 ? (
            <span className="text-[10px] font-bold text-[#B69A65] bg-[#FAF5EE] border border-[#B69A65]/40 px-2.5 py-1 rounded flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-[#B69A65]" />
              <span>Mandatory OTP Verification Step</span>
            </span>
          ) : (
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={() => onDeleteStep(activeStepIndex)}
              className="text-[#A64B36] hover:bg-rose-50 border-rose-200 h-8 text-xs px-3 font-semibold gap-1.5 transition-colors"
              title="Delete this step"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Step</span>
            </Button>
          )}
        </div>
      </div>

      {/* Canvas Field List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-[#FAF5EE]/40">
        {currentStep.fields.length === 0 ? (
          <div className="border border-dashed border-[#E8DFD0] rounded-lg p-10 text-center bg-[#FFFFFF] space-y-2">
            <div className="w-9 h-9 rounded-md bg-[#FAF5EE] text-[#B69A65] mx-auto flex items-center justify-center border border-[#B69A65]/30">
              <FileQuestion className="w-4 h-4 text-[#A64B36]" />
            </div>
            <h4 className="font-serif font-bold text-xs text-[#292821]">No questions in this step</h4>
            <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
              Select questions or uploads from the Field Palette to add them to Step {activeStepIndex + 1}.
            </p>
          </div>
        ) : (
          currentStep.fields.map((field, fIdx) => {
            const isSelected = field.id === selectedFieldId;
            const isDragging = draggedIndex === fIdx;
            const isDragOver =
              dragOverIndex === fIdx && draggedIndex !== null && draggedIndex !== fIdx;

            return (
              <div
                key={field.id}
                draggable
                onDragStart={(e) => handleDragStart(e, fIdx)}
                onDragOver={(e) => handleDragOver(e, fIdx)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, fIdx)}
                onDragEnd={handleDragEnd}
                onClick={() => onSelectField(field)}
                className={`group p-3.5 rounded-lg border transition-all cursor-pointer bg-[#FFFFFF] relative ${
                  isDragging
                    ? "opacity-40 border-dashed border-[#B69A65] bg-[#FAF5EE] scale-[0.99]"
                    : isSelected
                    ? "border-[#B69A65] ring-2 ring-[#B69A65]/20 shadow-xs bg-[#FAF5EE]/30"
                    : "border-[#E8DFD0] hover:border-[#B69A65]/60 hover:shadow-2xs"
                } ${
                  isDragOver && dropPosition === "top"
                    ? "before:absolute before:-top-1 before:left-2 before:right-2 before:h-0.5 before:bg-[#A64B36] before:z-20"
                    : ""
                } ${
                  isDragOver && dropPosition === "bottom"
                    ? "after:absolute after:-bottom-1 after:left-2 after:right-2 after:h-0.5 after:bg-[#A64B36] after:z-20"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Drag Handle & Field Info */}
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div
                      className="p-1 -ml-1 text-zinc-300 group-hover:text-zinc-600 cursor-grab active:cursor-grabbing transition-colors shrink-0"
                      title="Drag to reorder"
                    >
                      <GripVertical className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-[#292821] truncate">
                          {field.label}
                        </span>
                        {field.required && (
                          <span className="text-[10px] font-bold text-[#A64B36] bg-[#FAF5EE] px-1.5 py-0.5 rounded border border-[#E8DFD0]">
                            Required
                          </span>
                        )}
                        <span className="text-[10px] font-semibold text-[#292821]/80 bg-[#FAF5EE] border border-[#E8DFD0] px-1.5 py-0.5 rounded uppercase">
                          {field.type.replace("-", " ")}
                        </span>
                        {field.isSystem && (
                          <span className="text-[10px] font-bold text-[#B69A65] bg-[#FAF5EE] px-1.5 py-0.5 rounded flex items-center gap-1 border border-[#B69A65]/30">
                            <Lock className="w-2.5 h-2.5" />
                            <span>Protected</span>
                          </span>
                        )}
                      </div>

                      {field.description && (
                        <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">
                          {field.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      disabled={fIdx === 0}
                      onClick={() => onMoveField(activeStepIndex, fIdx, "up")}
                      className="p-1.5 rounded text-zinc-400 hover:text-[#292821] hover:bg-[#FAF5EE] disabled:opacity-20 transition-colors"
                      title="Move Up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={fIdx === currentStep.fields.length - 1}
                      onClick={() => onMoveField(activeStepIndex, fIdx, "down")}
                      className="p-1.5 rounded text-zinc-400 hover:text-[#292821] hover:bg-[#FAF5EE] disabled:opacity-20 transition-colors"
                      title="Move Down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDuplicateField(activeStepIndex, fIdx)}
                      className="p-1.5 rounded text-zinc-400 hover:text-[#292821] hover:bg-[#FAF5EE] transition-colors"
                      title="Duplicate Question"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {!field.isSystem && (
                      <button
                        type="button"
                        onClick={() => onDeleteField(activeStepIndex, fIdx)}
                        className="p-1.5 rounded text-zinc-400 hover:text-[#A64B36] hover:bg-rose-50 transition-colors"
                        title="Delete Question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

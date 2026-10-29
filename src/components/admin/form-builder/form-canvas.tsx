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
  Sparkles,
  Pencil,
  Check,
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
  onDuplicateField: (stepIndex: number, fieldIndex: number) => void;
  onDeleteField: (stepIndex: number, fieldIndex: number) => void;
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
  onDuplicateField,
  onDeleteField,
}: FormCanvasProps) {
  const currentStep = steps[activeStepIndex] || steps[0];
  const [isEditingStepTitle, setIsEditingStepTitle] = useState(false);
  const [stepTitleInput, setStepTitleInput] = useState(currentStep?.title || "");

  const handleSaveStepTitle = () => {
    if (stepTitleInput.trim()) {
      onUpdateStepMeta(activeStepIndex, stepTitleInput.trim(), currentStep.description);
    }
    setIsEditingStepTitle(false);
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Step Tabs Navigation */}
      <div className="bg-zinc-50 border-b border-zinc-200 px-4 pt-3 flex items-center justify-between gap-3 overflow-x-auto">
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
                className={`flex items-center gap-2 px-3.5 py-2 text-xs rounded-t-lg transition-all border-t-2 border-x whitespace-nowrap ${
                  isActive
                    ? "bg-white text-black border-t-emerald-600 border-x-zinc-200 shadow-2xs font-bold"
                    : "bg-zinc-100 text-zinc-600 border-transparent hover:bg-zinc-200 font-medium"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                    isActive ? "bg-emerald-600 text-white" : "bg-zinc-200 text-zinc-700"
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
            className="h-8 text-xs text-black border-dashed border-zinc-300 hover:border-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 gap-1 px-3 font-semibold ml-1"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            <span>Add Step</span>
          </Button>
        </div>
      </div>

      {/* Step Header */}
      <div className="p-4 border-b border-zinc-100 bg-white flex items-center justify-between gap-4">
        <div className="flex-1">
          {isEditingStepTitle ? (
            <div className="flex items-center gap-2 max-w-md">
              <input
                type="text"
                value={stepTitleInput}
                onChange={(e) => setStepTitleInput(e.target.value)}
                className="text-sm font-bold text-black border border-zinc-300 rounded-lg px-3 py-1 flex-1 focus:outline-emerald-600"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleSaveStepTitle()}
              />
              <Button size="sm" onClick={handleSaveStepTitle} className="h-8 text-xs bg-black text-white font-bold gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Save</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-black">
                Step {activeStepIndex + 1}: {currentStep.title}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setStepTitleInput(currentStep.title);
                  setIsEditingStepTitle(true);
                }}
                className="p-1 rounded text-zinc-400 hover:text-black hover:bg-zinc-100 transition-colors"
                title="Rename step"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {activeStepIndex === 0 ? (
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>Email OTP Verification Stage</span>
            </span>
          ) : (
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={() => onDeleteStep(activeStepIndex)}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 h-8 text-xs px-3 font-semibold gap-1.5 transition-colors"
              title="Delete this step"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Step</span>
            </Button>
          )}
        </div>
      </div>

      {/* Canvas Field List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50/50">
        {currentStep.fields.length === 0 ? (
          <div className="border-2 border-dashed border-zinc-200 rounded-2xl p-12 text-center bg-white space-y-2">
            <div className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
            <h4 className="font-bold text-sm text-zinc-800">No fields added to this step yet</h4>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              Select questions, uploads, or dividers from the Field Palette on the left to add them here.
            </p>
          </div>
        ) : (
          currentStep.fields.map((field, fIdx) => {
            const isSelected = field.id === selectedFieldId;

            return (
              <div
                key={field.id}
                onClick={() => onSelectField(field)}
                className={`group p-4 rounded-xl border transition-all cursor-pointer bg-white relative ${
                  isSelected
                    ? "border-emerald-600 ring-2 ring-emerald-500/20 shadow-sm"
                    : "border-zinc-200 hover:border-zinc-300 hover:shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Field Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-black truncate">
                          {field.label}
                        </span>
                        {field.required && (
                          <span className="text-[10px] font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200">
                            Required
                          </span>
                        )}
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase">
                          {field.type.replace("-", " ")}
                        </span>
                        {field.isSystem && (
                          <span className="text-[10px] font-bold text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded-full flex items-center gap-1 border border-zinc-200">
                            <Lock className="w-2.5 h-2.5" />
                            <span>System</span>
                          </span>
                        )}
                      </div>

                      {field.description && (
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
                          {field.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Reorder & Action Buttons */}
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      disabled={fIdx === 0}
                      onClick={() => onMoveField(activeStepIndex, fIdx, "up")}
                      className="p-1.5 rounded-md text-zinc-400 hover:text-black hover:bg-zinc-100 disabled:opacity-30 transition-colors"
                      title="Move Up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={fIdx === currentStep.fields.length - 1}
                      onClick={() => onMoveField(activeStepIndex, fIdx, "down")}
                      className="p-1.5 rounded-md text-zinc-400 hover:text-black hover:bg-zinc-100 disabled:opacity-30 transition-colors"
                      title="Move Down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    {!field.isSystem && (
                      <>
                        <button
                          type="button"
                          onClick={() => onDuplicateField(activeStepIndex, fIdx)}
                          className="p-1.5 rounded-md text-zinc-400 hover:text-black hover:bg-zinc-100 transition-colors"
                          title="Duplicate Question"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteField(activeStepIndex, fIdx)}
                          className="p-1.5 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
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

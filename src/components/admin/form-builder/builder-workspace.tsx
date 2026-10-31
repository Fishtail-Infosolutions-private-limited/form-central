"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import {
  FormSchemaDefinition,
  FormFieldDefinition,
  FormStepDefinition,
  FieldType,
} from "@/types/form";
import { FieldPalette } from "./field-palette";
import { FormCanvas } from "./form-canvas";
import { FieldConfigPanel } from "./field-config-panel";
import { FormPreview } from "./form-preview";
import {
  saveFormSchemaAction,
  publishFormAction,
} from "@/server/actions/form-actions";
import {
  Save,
  CheckCircle2,
  Eye,
  ArrowLeft,
  ExternalLink,
  Loader2,
  Copy,
  Check,
  AlertCircle,
  RotateCcw,
  Undo2,
  X,
  Crown,
  Plus,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface BuilderWorkspaceProps {
  form: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    status: string;
  };
  initialSchema: FormSchemaDefinition;
  publishedVersionNumber?: number;
}

interface DeletedStepSnapshot {
  step: FormStepDefinition;
  originalIndex: number;
  deletedAt: number;
  expiresAt: number;
}

export function BuilderWorkspace({
  form,
  initialSchema,
  publishedVersionNumber,
}: BuilderWorkspaceProps) {
  const router = useRouter();
  const [schema, setSchema] = useState<FormSchemaDefinition>(initialSchema);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Step Undo State (up to 10 seconds)
  const [deletedStepSnapshot, setDeletedStepSnapshot] = useState<DeletedStepSnapshot | null>(null);
  const [undoSecondsLeft, setUndoSecondsLeft] = useState<number>(10);
  const [undoProgressPercent, setUndoProgressPercent] = useState<number>(100);
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const undoIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Find active field
  const currentStep = schema.steps[activeStepIndex] || schema.steps[0];
  const selectedField =
    schema.steps
      .flatMap((s) => s.fields)
      .find((f) => f.id === selectedFieldId) || null;

  const copyUrl = async () => {
    const url = `${window.location.origin}/register/${form.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      prompt("Copy URL:", url);
    }
  };

  // Add field to active step
  const handleAddField = (type: FieldType) => {
    const id = `field-${nanoid(8)}`;
    const fieldKey = `custom_${type}_${nanoid(4)}`;

    let defaultLabel = "New Question";
    if (type === "text") defaultLabel = "Text Field";
    if (type === "number") defaultLabel = "Number";
    if (type === "textarea") defaultLabel = "Detailed Response";
    if (type === "select") defaultLabel = "Dropdown Question";
    if (type === "radio") defaultLabel = "Single Choice Selection";
    if (type === "checkbox-group") defaultLabel = "Multiple Selections";
    if (type === "checkbox") defaultLabel = "Agreement / Consent";
    if (type === "image") defaultLabel = "Photo Upload";
    if (type === "video") defaultLabel = "Video Upload (Google Drive)";
    if (type === "file") defaultLabel = "Document Upload (PDF)";
    if (type === "date") defaultLabel = "Date of Birth / Event";
    if (type === "time") defaultLabel = "Time Selection";
    if (type === "heading") defaultLabel = "Section Header";
    if (type === "divider") defaultLabel = "Divider";

    const newField: FormFieldDefinition = {
      id,
      fieldKey,
      type,
      label: defaultLabel,
      required: false,
      order: currentStep.fields.length,
      options: ["select", "radio", "checkbox-group"].includes(type)
        ? [
            { label: "Option 1", value: "opt_1" },
            { label: "Option 2", value: "opt_2" },
          ]
        : undefined,
    };

    setSchema((prev) => {
      const updatedSteps = [...prev.steps];
      const step = { ...updatedSteps[activeStepIndex] };
      step.fields = [...step.fields, newField];
      updatedSteps[activeStepIndex] = step;
      return { ...prev, steps: updatedSteps };
    });

    setSelectedFieldId(id);
    setIsPaletteOpen(false);
    setHasUnsavedChanges(true);
  };

  // Update selected field
  const handleUpdateField = (updated: FormFieldDefinition) => {
    setSchema((prev) => {
      const updatedSteps = prev.steps.map((st) => ({
        ...st,
        fields: st.fields.map((f) => (f.id === updated.id ? updated : f)),
      }));
      return { ...prev, steps: updatedSteps };
    });
    setHasUnsavedChanges(true);
  };

  // Move field order
  const handleMoveField = (
    stepIndex: number,
    fieldIndex: number,
    direction: "up" | "down"
  ) => {
    setSchema((prev) => {
      const updatedSteps = [...prev.steps];
      const fields = [...updatedSteps[stepIndex].fields];
      const targetIndex = direction === "up" ? fieldIndex - 1 : fieldIndex + 1;

      if (targetIndex < 0 || targetIndex >= fields.length) return prev;

      const [moved] = fields.splice(fieldIndex, 1);
      fields.splice(targetIndex, 0, moved);

      fields.forEach((f, idx) => (f.order = idx));
      updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], fields };
      return { ...prev, steps: updatedSteps };
    });
    setHasUnsavedChanges(true);
  };

  const handleReorderFields = (stepIndex: number, newFields: FormFieldDefinition[]) => {
    setSchema((prev) => {
      const updatedSteps = [...prev.steps];
      newFields.forEach((f, idx) => (f.order = idx));
      updatedSteps[stepIndex] = {
        ...updatedSteps[stepIndex],
        fields: newFields,
      };
      return { ...prev, steps: updatedSteps };
    });
    setHasUnsavedChanges(true);
  };

  // Duplicate field
  const handleDuplicateField = (stepIndex: number, fieldIndex: number) => {
    const field = schema.steps[stepIndex].fields[fieldIndex];
    if (field.isSystem) {
      toast.error("Mandatory protected system questions cannot be duplicated.");
      return;
    }

    const clonedId = `field-${nanoid(8)}`;
    const clonedFieldKey = `${field.fieldKey}_copy_${nanoid(3)}`;

    const cloned: FormFieldDefinition = {
      ...JSON.parse(JSON.stringify(field)),
      id: clonedId,
      fieldKey: clonedFieldKey,
      label: `${field.label} (Copy)`,
      order: fieldIndex + 1,
      isSystem: false,
    };

    setSchema((prev) => {
      const updatedSteps = [...prev.steps];
      const fields = [...updatedSteps[stepIndex].fields];
      fields.splice(fieldIndex + 1, 0, cloned);
      fields.forEach((f, idx) => (f.order = idx));
      updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], fields };
      return { ...prev, steps: updatedSteps };
    });

    setSelectedFieldId(clonedId);
    setHasUnsavedChanges(true);
  };

  // Delete field
  const handleDeleteField = (stepIndex: number, fieldIndex: number) => {
    const field = schema.steps[stepIndex].fields[fieldIndex];
    if (field.isSystem) {
      toast.error("Protected system questions cannot be deleted.");
      return;
    }

    setSchema((prev) => {
      const updatedSteps = [...prev.steps];
      const fields = updatedSteps[stepIndex].fields.filter((_, idx) => idx !== fieldIndex);
      fields.forEach((f, idx) => (f.order = idx));
      updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], fields };
      return { ...prev, steps: updatedSteps };
    });

    if (selectedFieldId === field.id) {
      setSelectedFieldId(null);
    }
    setHasUnsavedChanges(true);
  };

  // Add step
  const handleAddStep = () => {
    const newStepNum = schema.steps.length + 1;
    const newStep: FormStepDefinition = {
      id: `step-${nanoid(8)}`,
      title: `Step ${newStepNum}: Additional Details`,
      order: schema.steps.length,
      fields: [],
    };

    setSchema((prev) => ({
      ...prev,
      steps: [...prev.steps, newStep],
    }));

    setActiveStepIndex(schema.steps.length);
    setHasUnsavedChanges(true);
  };

  const clearUndoTimers = useCallback(() => {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    if (undoIntervalRef.current) {
      clearInterval(undoIntervalRef.current);
      undoIntervalRef.current = null;
    }
  }, []);

  const handleDismissUndo = useCallback(() => {
    clearUndoTimers();
    setDeletedStepSnapshot(null);
  }, [clearUndoTimers]);

  useEffect(() => {
    return () => {
      clearUndoTimers();
    };
  }, [clearUndoTimers]);

  // Delete step with 10s undo
  const handleDeleteStep = (stepIndex: number) => {
    if (stepIndex === 0) {
      toast.error("Step 1 (Email Verification & Contact) is protected and cannot be deleted.");
      return;
    }

    if (schema.steps.length <= 1) {
      toast.error("The registration form must retain at least one step.");
      return;
    }

    const stepToDelete = schema.steps[stepIndex];
    clearUndoTimers();

    const now = Date.now();
    const durationMs = 10000;
    const expiresAt = now + durationMs;

    setDeletedStepSnapshot({
      step: JSON.parse(JSON.stringify(stepToDelete)),
      originalIndex: stepIndex,
      deletedAt: now,
      expiresAt,
    });
    setUndoSecondsLeft(10);
    setUndoProgressPercent(100);

    undoIntervalRef.current = setInterval(() => {
      const remainingMs = expiresAt - Date.now();
      if (remainingMs <= 0) {
        handleDismissUndo();
      } else {
        const seconds = Math.ceil(remainingMs / 1000);
        const percent = Math.max(0, (remainingMs / durationMs) * 100);
        setUndoSecondsLeft(seconds);
        setUndoProgressPercent(percent);
      }
    }, 100);

    undoTimerRef.current = setTimeout(() => {
      handleDismissUndo();
    }, durationMs);

    setSchema((prev) => {
      const updatedSteps = prev.steps.filter((_, idx) => idx !== stepIndex);
      updatedSteps.forEach((st, idx) => (st.order = idx));
      return { ...prev, steps: updatedSteps };
    });

    if (activeStepIndex >= stepIndex) {
      setActiveStepIndex(Math.max(0, activeStepIndex - 1));
    }
    setSelectedFieldId(null);
    setHasUnsavedChanges(true);
  };

  const handleUndoStep = () => {
    if (!deletedStepSnapshot) return;

    const restoredStep = deletedStepSnapshot.step;
    const targetIndex = Math.min(deletedStepSnapshot.originalIndex, schema.steps.length);

    setSchema((prev) => {
      const updatedSteps = [...prev.steps];
      updatedSteps.splice(targetIndex, 0, restoredStep);
      updatedSteps.forEach((st, idx) => (st.order = idx));
      return { ...prev, steps: updatedSteps };
    });

    setActiveStepIndex(targetIndex);
    setHasUnsavedChanges(true);
    handleDismissUndo();
    toast.success(`Restored "${restoredStep.title}" successfully.`);
  };

  // Update step meta
  const handleUpdateStepMeta = (stepIndex: number, title: string, description?: string) => {
    setSchema((prev) => {
      const updatedSteps = [...prev.steps];
      updatedSteps[stepIndex] = {
        ...updatedSteps[stepIndex],
        title,
        description,
      };
      return { ...prev, steps: updatedSteps };
    });
    setHasUnsavedChanges(true);
  };

  // Save draft
  const handleSaveDraft = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await saveFormSchemaAction(form.id, schema);
      if (res.success) {
        setHasUnsavedChanges(false);
        setMessage({ type: "success", text: "Draft form schema saved successfully." });
        toast.success("Draft saved.");
      } else {
        setMessage({ type: "error", text: res.error || "Failed to save draft." });
        toast.error(res.error || "Failed to save draft.");
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "An error occurred." });
    } finally {
      setIsSaving(false);
    }
  };

  // Publish form
  const handlePublish = async () => {
    setIsPublishing(true);
    setMessage(null);
    try {
      const res = await publishFormAction(form.id, schema);
      if (res.success) {
        setHasUnsavedChanges(false);
        setMessage({
          type: "success",
          text: "Registration form activated & published! New version saved without affecting historical records.",
        });
        toast.success("Mithila Queen form published!");
        router.refresh();
      } else {
        setMessage({ type: "error", text: res.error || "Failed to publish." });
        toast.error(res.error || "Failed to publish.");
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "An error occurred." });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 min-h-[600px]">
      {/* Workspace Sub-Header */}
      <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-warm-ivory border border-cream-dark text-maroon flex items-center justify-center shrink-0 shadow-2xs">
            <Crown className="w-5 h-5 text-saffron" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-serif font-bold text-charcoal">
                {form.name} &bull; Form Customizer
              </h2>
              {publishedVersionNumber && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-700 font-semibold">
                  v{publishedVersionNumber} Live
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-500">
              Customize questions, media uploads (including audition videos), and rules.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {hasUnsavedChanges && (
            <span className="text-[10px] font-semibold text-saffron bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-saffron animate-pulse" />
              <span>Unsaved changes</span>
            </span>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPaletteOpen(!isPaletteOpen)}
            className="text-xs h-8 font-medium gap-1.5 border-stone-200 text-stone-700 hover:bg-soft-cream"
          >
            <Plus className="w-3.5 h-3.5 text-saffron" />
            <span>{isPaletteOpen ? "Close Palette" : "Add Question"}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewOpen(true)}
            className="text-xs h-8 font-medium gap-1.5 border-stone-200 text-stone-700 hover:bg-soft-cream"
          >
            <Eye className="w-3.5 h-3.5 text-maroon" />
            <span>Full Form Preview</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSaving}
            onClick={handleSaveDraft}
            className="text-xs h-8 font-medium gap-1.5 border-stone-200 text-stone-700 hover:bg-soft-cream"
          >
            {isSaving ? (
              <Loader2 className="w-3 h-3 animate-spin text-maroon" />
            ) : (
              <Save className="w-3.5 h-3.5 text-maroon" />
            )}
            <span>Save Draft</span>
          </Button>

          <Button
            type="button"
            size="sm"
            disabled={isPublishing}
            onClick={handlePublish}
            className="text-xs h-8 font-semibold gap-1.5 bg-maroon hover:bg-maroon-dark text-white shadow-xs"
          >
            {isPublishing ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            <span>Publish Changes</span>
          </Button>
        </div>
      </div>

      {/* Field Palette Popout Tray */}
      {isPaletteOpen && (
        <div className="bg-white p-4 rounded-xl border border-cream-dark shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100">
            <div>
              <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-charcoal">
                Add Question to Step {activeStepIndex + 1}: {currentStep.title}
              </h3>
              <p className="text-[11px] text-stone-500">
                Click any input type below to insert it into the active step.
              </p>
            </div>
            <button
              onClick={() => setIsPaletteOpen(false)}
              className="p-1 rounded text-stone-400 hover:text-charcoal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <FieldPalette onAddField={handleAddField} />
        </div>
      )}

      {/* Status Alert Banner */}
      {message && (
        <div
          className={`px-4 py-2.5 rounded-lg border flex items-center justify-between text-xs shrink-0 ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-[11px] font-bold opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[500px] items-start">
        {/* Left Panel: Form Steps & Questions in Selected Step (5 cols) */}
        <div className="lg:col-span-5 h-[620px]">
          <FormCanvas
            steps={schema.steps}
            activeStepIndex={activeStepIndex}
            selectedFieldId={selectedFieldId}
            onSelectStep={setActiveStepIndex}
            onAddStep={handleAddStep}
            onDeleteStep={handleDeleteStep}
            onUpdateStepMeta={handleUpdateStepMeta}
            onSelectField={(f) => setSelectedFieldId(f.id)}
            onMoveField={handleMoveField}
            onReorderFields={handleReorderFields}
            onDuplicateField={handleDuplicateField}
            onDeleteField={handleDeleteField}
          />
        </div>

        {/* Right Panel: In-Place Field Configuration & Step Preview (7 cols) */}
        <div className="lg:col-span-7 h-[620px] flex flex-col gap-4">
          {selectedField ? (
            <FieldConfigPanel
              field={selectedField}
              allSteps={schema.steps}
              onChange={handleUpdateField}
              onClose={() => setSelectedFieldId(null)}
            />
          ) : (
            <div className="bg-white rounded-xl border border-stone-200/80 p-6 h-full flex flex-col justify-between overflow-y-auto shadow-xs">
              <div className="space-y-4">
                <div className="border-b border-stone-100 pb-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-maroon">
                    Step Preview &bull; Step {activeStepIndex + 1}
                  </span>
                  <h3 className="font-serif font-bold text-lg text-charcoal">
                    {currentStep.title}
                  </h3>
                  {currentStep.description && (
                    <p className="text-xs text-stone-500 mt-1">
                      {currentStep.description}
                    </p>
                  )}
                </div>

                <div className="space-y-3 pt-2">
                  {currentStep.fields.map((f, idx) => (
                    <div
                      key={f.id}
                      onClick={() => setSelectedFieldId(f.id)}
                      className="p-3.5 rounded-lg border border-stone-200/80 bg-warm-ivory/50 hover:border-maroon transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                          <span>{f.label}</span>
                          {f.required && <span className="text-saffron">*</span>}
                        </label>
                        <span className="text-[10px] text-stone-400 group-hover:text-maroon font-mono">
                          Click to edit
                        </span>
                      </div>
                      {f.description && (
                        <p className="text-[11px] text-stone-500 mb-2">{f.description}</p>
                      )}
                      <div className="h-8 rounded bg-white border border-stone-200 px-3 flex items-center text-xs text-stone-400">
                        {f.placeholder || `[${f.type} input placeholder]`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 text-center">
                <p className="text-xs text-stone-500">
                  Select any question on the left to configure label, help text, or choices.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full Live Preview Modal */}
      {isPreviewOpen && (
        <FormPreview
          formName={form.name}
          formDescription={form.description}
          schema={schema}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}

      {/* Floating 10-Second Undo Banner */}
      {deletedStepSnapshot && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 w-[92vw] max-w-lg bg-maroon text-white rounded-lg shadow-2xl border border-cream-dark overflow-hidden"
        >
          <div className="p-3 sm:p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded bg-maroon-dark border border-cream-dark/30 flex items-center justify-center shrink-0 text-saffron">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  Deleted &ldquo;{deletedStepSnapshot.step.title}&rdquo;
                </div>
                <div className="text-[11px] text-warm-ivory/80 flex items-center gap-1.5">
                  <span>
                    {deletedStepSnapshot.step.fields.length}{" "}
                    {deletedStepSnapshot.step.fields.length === 1 ? "question" : "questions"}
                  </span>
                  <span>&bull;</span>
                  <span className="text-saffron font-medium font-mono">
                    Undo expires in {undoSecondsLeft}s
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                size="sm"
                onClick={() => handleUndoStep()}
                className="h-8 px-3 text-xs font-bold bg-maroon hover:bg-maroon-dark text-white gap-1.5 shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Undo</span>
                <span className="bg-maroon-dark px-1.5 py-0.5 rounded text-[10px] tabular-nums font-mono">
                  {undoSecondsLeft}s
                </span>
              </Button>

              <button
                type="button"
                onClick={handleDismissUndo}
                className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-maroon-dark transition-colors"
                title="Dismiss undo"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 10-second Animated Countdown Progress Bar */}
          <div className="w-full bg-maroon-dark h-1 overflow-hidden">
            <div
              className="bg-saffron h-full transition-all duration-100 ease-linear"
              style={{
                width: `${undoProgressPercent}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

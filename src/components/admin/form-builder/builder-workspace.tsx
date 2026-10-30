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
  const handleMoveField = (stepIndex: number, fieldIndex: number, direction: "up" | "down") => {
    setSchema((prev) => {
      const updatedSteps = [...prev.steps];
      const step = { ...updatedSteps[stepIndex] };
      const fields = [...step.fields];
      const targetIndex = direction === "up" ? fieldIndex - 1 : fieldIndex + 1;

      if (targetIndex < 0 || targetIndex >= fields.length) return prev;

      const temp = fields[fieldIndex];
      fields[fieldIndex] = fields[targetIndex];
      fields[targetIndex] = temp;

      // Re-assign order indices
      step.fields = fields.map((f, i) => ({ ...f, order: i }));
      updatedSteps[stepIndex] = step;
      return { ...prev, steps: updatedSteps };
    });
    setHasUnsavedChanges(true);
  };

  // Reorder fields directly (e.g. via drag-and-drop)
  const handleReorderFields = (stepIndex: number, newFields: FormFieldDefinition[]) => {
    setSchema((prev) => {
      const updatedSteps = [...prev.steps];
      const step = { ...updatedSteps[stepIndex] };
      step.fields = newFields.map((f, i) => ({ ...f, order: i }));
      updatedSteps[stepIndex] = step;
      return { ...prev, steps: updatedSteps };
    });
    setHasUnsavedChanges(true);
  };

  // Duplicate field
  const handleDuplicateField = (stepIndex: number, fieldIndex: number) => {
    setSchema((prev) => {
      const updatedSteps = [...prev.steps];
      const step = { ...updatedSteps[stepIndex] };
      const target = step.fields[fieldIndex];
      const copy: FormFieldDefinition = {
        ...target,
        id: `field-${nanoid(8)}`,
        fieldKey: `${target.fieldKey}_copy_${nanoid(3)}`,
        label: `${target.label} (Copy)`,
        isSystem: false,
        order: fieldIndex + 1,
      };

      const fields = [...step.fields];
      fields.splice(fieldIndex + 1, 0, copy);
      step.fields = fields.map((f, i) => ({ ...f, order: i }));
      updatedSteps[stepIndex] = step;
      return { ...prev, steps: updatedSteps };
    });
    setHasUnsavedChanges(true);
  };

  // Delete field
  const handleDeleteField = (stepIndex: number, fieldIndex: number) => {
    setSchema((prev) => {
      const updatedSteps = [...prev.steps];
      const step = { ...updatedSteps[stepIndex] };
      const deletedField = step.fields[fieldIndex];
      if (deletedField.isSystem) return prev;

      step.fields = step.fields.filter((_, i) => i !== fieldIndex).map((f, i) => ({ ...f, order: i }));
      updatedSteps[stepIndex] = step;
      return { ...prev, steps: updatedSteps };
    });
    if (selectedFieldId === currentStep.fields[fieldIndex]?.id) {
      setSelectedFieldId(null);
    }
    setHasUnsavedChanges(true);
  };

  // Add Step
  const handleAddStep = () => {
    const newStepNum = schema.steps.length + 1;
    const newStep: FormStepDefinition = {
      id: `step-${nanoid(6)}`,
      title: `Step ${newStepNum}: Details`,
      order: schema.steps.length,
      fields: [],
    };
    setSchema((prev) => ({
      ...prev,
      steps: [...prev.steps, newStep],
    }));
    setActiveStepIndex(schema.steps.length);
    setSelectedFieldId(null);
    setHasUnsavedChanges(true);
  };

  // Restore deleted step
  const handleUndoStep = useCallback((snapshotToUse?: DeletedStepSnapshot) => {
    const snapshot = snapshotToUse || deletedStepSnapshot;
    if (!snapshot) return;

    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    if (undoIntervalRef.current) clearInterval(undoIntervalRef.current);
    setDeletedStepSnapshot(null);
    toast.dismiss("undo-step-toast");

    setSchema((prev) => {
      const steps = [...prev.steps];
      const insertAt = Math.min(Math.max(0, snapshot.originalIndex), steps.length);
      steps.splice(insertAt, 0, snapshot.step);
      return {
        ...prev,
        steps: steps.map((s, i) => ({ ...s, order: i })),
      };
    });

    setActiveStepIndex(snapshot.originalIndex);
    setSelectedFieldId(null);
    setHasUnsavedChanges(true);
    toast.success(`Restored "${snapshot.step.title}" successfully!`);
  }, [deletedStepSnapshot]);

  // Dismiss undo banner early
  const handleDismissUndo = useCallback(() => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    if (undoIntervalRef.current) clearInterval(undoIntervalRef.current);
    setDeletedStepSnapshot(null);
    toast.dismiss("undo-step-toast");
  }, []);

  // Cleanup undo timers on unmount
  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      if (undoIntervalRef.current) clearInterval(undoIntervalRef.current);
    };
  }, []);

  // Keyboard shortcut Ctrl+Z / Cmd+Z to undo step deletion
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        const activeEl = document.activeElement;
        const isInput =
          activeEl &&
          (activeEl.tagName === "INPUT" ||
            activeEl.tagName === "TEXTAREA" ||
            (activeEl as HTMLElement).isContentEditable);
        if (isInput) return;

        if (deletedStepSnapshot) {
          e.preventDefault();
          handleUndoStep();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deletedStepSnapshot, handleUndoStep]);

  // Delete Step (cannot delete step 0, provides 10-second undo window)
  const handleDeleteStep = (stepIndex: number) => {
    if (stepIndex === 0) return;
    const stepToDelete = schema.steps[stepIndex];
    if (!stepToDelete) return;

    // Clear any existing undo timers
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    if (undoIntervalRef.current) clearInterval(undoIntervalRef.current);

    const now = Date.now();
    const expiresAt = now + 10000;
    const snapshot: DeletedStepSnapshot = {
      step: JSON.parse(JSON.stringify(stepToDelete)),
      originalIndex: stepIndex,
      deletedAt: now,
      expiresAt,
    };

    setDeletedStepSnapshot(snapshot);
    setUndoSecondsLeft(10);
    setUndoProgressPercent(100);

    // Remove step from schema
    setSchema((prev) => {
      const steps = prev.steps.filter((_, i) => i !== stepIndex).map((s, i) => ({ ...s, order: i }));
      return { ...prev, steps };
    });
    setActiveStepIndex(Math.max(0, stepIndex - 1));
    setSelectedFieldId(null);
    setHasUnsavedChanges(true);

    // High frequency interval (100ms) for smooth progress bar and countdown
    undoIntervalRef.current = setInterval(() => {
      const remainingMs = Math.max(0, expiresAt - Date.now());
      const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));
      const percent = Math.max(0, Math.min(100, (remainingMs / 10000) * 100));

      setUndoSecondsLeft(remainingSec);
      setUndoProgressPercent(percent);

      if (remainingMs <= 0) {
        if (undoIntervalRef.current) clearInterval(undoIntervalRef.current);
        setDeletedStepSnapshot(null);
      }
    }, 100);

    undoTimerRef.current = setTimeout(() => {
      setDeletedStepSnapshot(null);
      if (undoIntervalRef.current) clearInterval(undoIntervalRef.current);
    }, 10000);

    // Sonner toast with instant Undo action button
    toast(`Step "${stepToDelete.title}" deleted`, {
      id: "undo-step-toast",
      duration: 10000,
      description: "Click Undo within 10 seconds to restore this step.",
      action: {
        label: "Undo",
        onClick: () => {
          handleUndoStep(snapshot);
        },
      },
    });
  };

  // Update Step Title & Description
  const handleUpdateStepMeta = (stepIndex: number, title: string, description?: string) => {
    setSchema((prev) => {
      const steps = [...prev.steps];
      steps[stepIndex] = { ...steps[stepIndex], title, description };
      return { ...prev, steps };
    });
    setHasUnsavedChanges(true);
  };

  // Save Draft
  const handleSaveDraft = async () => {
    setIsSaving(true);
    setMessage(null);
    const res = await saveFormSchemaAction(form.id, schema);
    setIsSaving(false);
    if (res.success) {
      setHasUnsavedChanges(false);
      toast.success("Draft saved successfully.");
      setMessage({ type: "success", text: "Draft schema saved to database." });
    } else {
      toast.error(res.error || "Failed to save draft");
      setMessage({ type: "error", text: res.error || "Failed to save draft" });
    }
  };

  // Publish Form (Generates immutable version snapshot in PostgreSQL)
  const handlePublish = async () => {
    setIsPublishing(true);
    setMessage(null);
    const res = await publishFormAction(form.id, schema);
    setIsPublishing(false);
    if (res.success) {
      setHasUnsavedChanges(false);
      toast.success("Form version published successfully!");
      setMessage({
        type: "success",
        text: "Form published successfully! Registrants can now access this live version.",
      });
      router.refresh();
    } else {
      toast.error(res.error || "Failed to publish form");
      setMessage({ type: "error", text: res.error || "Failed to publish form" });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] space-y-3">
      {/* Top Bar */}
      <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/admin/forms"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100"
            title="Back to all forms"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-zinc-900 truncate">{form.name}</h1>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  form.status === "PUBLISHED"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-zinc-100 text-zinc-600 border-zinc-200"
                }`}
              >
                {form.status === "PUBLISHED" ? "Active" : "Inactive"}
              </span>
              {publishedVersionNumber && (
                <span className="text-[10px] font-mono text-zinc-400">
                  v{publishedVersionNumber}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono mt-0.5">
              <span>/register/{form.slug}</span>
              <button
                type="button"
                onClick={copyUrl}
                className="text-zinc-400 hover:text-emerald-700 p-0.5"
                title="Copy public link"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <Link
                href={`/register/${form.slug}`}
                target="_blank"
                className="text-zinc-400 hover:text-emerald-700 p-0.5"
                title="Open live public form"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {hasUnsavedChanges && (
            <span className="text-[11px] font-semibold text-emerald-900 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Unsaved changes</span>
            </span>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewOpen(true)}
            className="text-xs h-9 font-semibold gap-1.5 border-zinc-300"
          >
            <Eye className="w-4 h-4 text-zinc-600" />
            <span>Interactive Preview</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSaving}
            onClick={handleSaveDraft}
            className="text-xs h-9 font-semibold gap-1.5 text-zinc-800 border-zinc-300 hover:bg-zinc-50"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>Save Form</span>
          </Button>

          <Button
            type="button"
            size="sm"
            disabled={isPublishing}
            onClick={handlePublish}
            className="text-xs h-9 font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          >
            {isPublishing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            <span>Activate & Publish</span>
          </Button>
        </div>
      </div>

      {/* Status Alert Banner if any */}
      {message && (
        <div
          className={`px-4 py-2.5 rounded-xl border flex items-center justify-between text-xs shrink-0 ${
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

      {/* 3-Column Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
        {/* Left: Field Palette (3 cols) */}
        <div className="lg:col-span-3 h-full min-h-[300px]">
          <FieldPalette onAddField={handleAddField} />
        </div>

        {/* Center: Form Canvas (6 cols) */}
        <div className="lg:col-span-6 h-full min-h-[400px]">
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

        {/* Right: Selected Field Properties (3 cols) */}
        <div className="lg:col-span-3 h-full min-h-[300px]">
          <FieldConfigPanel
            field={selectedField}
            allSteps={schema.steps}
            onChange={handleUpdateField}
            onClose={() => setSelectedFieldId(null)}
          />
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
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 w-[92vw] max-w-lg bg-zinc-950 text-white rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden"
        >
          <div className="p-3 sm:p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  Deleted &ldquo;{deletedStepSnapshot.step.title}&rdquo;
                </div>
                <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                  <span>
                    {deletedStepSnapshot.step.fields.length}{" "}
                    {deletedStepSnapshot.step.fields.length === 1 ? "field" : "fields"}
                  </span>
                  <span>•</span>
                  <span className="text-emerald-400 font-medium">
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
                className="h-8 px-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Undo</span>
                <span className="bg-emerald-700/80 px-1.5 py-0.5 rounded text-[10px] tabular-nums font-mono">
                  {undoSecondsLeft}s
                </span>
              </Button>

              <button
                type="button"
                onClick={handleDismissUndo}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                title="Dismiss undo"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 10-second Animated Countdown Progress Bar */}
          <div className="w-full bg-zinc-900 h-1 overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-100 ease-linear"
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


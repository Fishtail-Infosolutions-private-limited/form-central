"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { nanoid } from "nanoid";
import {
  FileText,
  CreditCard,
  Eye,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Lock,
  Loader2,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
  Sliders,
  Type,
  AlignLeft,
  Mail,
  Phone,
  Hash,
  List,
  CheckSquare,
  Image as ImageIcon,
  Video,
  FileUp,
  HelpCircle,
  Check,
  ChevronDown,
  RotateCcw,
  GripVertical,
  EyeOff,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  FormSchemaDefinition,
  FormFieldDefinition,
  FormStepDefinition,
  FieldType,
  FormAppearanceConfig,
} from "@/types/form";
import {
  saveFormSchemaAction,
  publishFormAction,
  unpublishFormAction,
} from "@/server/actions/form-actions";
import { DEFAULT_MITHILA_QUEEN_SCHEMA } from "@/lib/constants/default-form-schema";
import { PaymentFeeSettings } from "./payment-fee-settings";
import { FormAppearanceSettings } from "./form-appearance-settings";
import { RegistrationAvailabilityCard } from "./registration-availability-card";
import { QuestionConfigDrawer } from "./question-config-drawer";

interface RegistrationFormWorkspaceProps {
  form: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    status: string;
    publishedVersionId: string | null;
    appearanceJson: any;
    versions: Array<{
      id: string;
      versionNumber: number;
      schema: any;
      status: string;
      publishedAt: string | Date | null;
      createdAt: string | Date;
    }>;
  };
  siteSetting: any;
}

const FIELD_TYPE_OPTIONS: Array<{
  type: FieldType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}> = [
  { type: "text", label: "Short Text", icon: Type, description: "Single-line response" },
  { type: "textarea", label: "Long Text", icon: AlignLeft, description: "Multi-line paragraph or bio" },
  { type: "email", label: "Email Address", icon: Mail, description: "Email format with validation" },
  { type: "phone", label: "Phone Number", icon: Phone, description: "Contact number with validation" },
  { type: "number", label: "Number", icon: Hash, description: "Numeric value or age" },
  { type: "date", label: "Date", icon: Calendar, description: "Date picker" },
  { type: "select", label: "Dropdown", icon: List, description: "Select from options list" },
  { type: "radio", label: "Single Choice", icon: CheckCircle2, description: "Radio button choice" },
  { type: "checkbox-group", label: "Checkboxes", icon: CheckSquare, description: "Multiple selections" },
  { type: "checkbox", label: "Yes / No Consent", icon: Check, description: "Single agreement checkbox" },
  { type: "image", label: "Photo Upload", icon: ImageIcon, description: "Portrait or document image" },
  { type: "video", label: "Audition Video", icon: Video, description: "Direct Google Drive video upload" },
  { type: "file", label: "Document File", icon: FileUp, description: "PDF or identification document" },
];

export function RegistrationFormWorkspace({
  form,
  siteSetting: initialSiteSetting,
}: RegistrationFormWorkspaceProps) {
  const [siteSetting, setSiteSetting] = useState(initialSiteSetting);
  const [activeArea, setActiveArea] = useState<"builder" | "payment">("builder");
  const [viewMode, setViewMode] = useState<"editor" | "preview">("editor");

  // Determine latest version & initial schema (Defaults to official verified PDF brief)
  const latestVersion = form.versions?.[0];
  const initialSchema: FormSchemaDefinition = (() => {
    const raw = latestVersion?.schema as unknown as FormSchemaDefinition;
    if (raw && Array.isArray(raw.steps) && raw.steps.length > 0) {
      return raw;
    }
    return DEFAULT_MITHILA_QUEEN_SCHEMA;
  })();

  const [schema, setSchema] = useState<FormSchemaDefinition>(initialSchema);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  // Appearance
  const [appearance, setAppearance] = useState<FormAppearanceConfig>(
    schema.appearance ||
      form.appearanceJson || {
        formTitle: form.name || "Mithila Queen 2026 Registration",
        mainHeading: "Mithila Queen Official Registration",
        shortDescription: "Celebrating Mithila's Culture, Confidence & Talent",
        welcomeMessage:
          "Welcome to the official registration for Mithila Queen 2026. Please complete the following steps to submit your candidacy.",
        instructionsBefore:
          "Please have your legal identity details, high-resolution portrait photo, and audition video link ready.",
        textBeforeFirstStep: "Identity verification code will be sent to your email.",
        submitButtonText: "Complete Registration & Proceed to Review",
        successMessage:
          "Your candidacy application has been recorded successfully! Please complete the verified fee payment to finalize.",
        footerInformation:
          "The Origin Foundation • Janakpur Dham, Nepal • originfoundation107@gmail.com",
      }
  );

  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const [isAddQuestionMenuOpen, setIsAddQuestionMenuOpen] = useState(false);

  // Drag & Drop reorder states
  const [draggedStepIdx, setDraggedStepIdx] = useState<number | null>(null);
  const [dragOverStepIdx, setDragOverStepIdx] = useState<number | null>(null);
  const [draggedFieldIdx, setDraggedFieldIdx] = useState<number | null>(null);
  const [dragOverFieldIdx, setDragOverFieldIdx] = useState<number | null>(null);

  // Modal states (No window.confirm)
  const [showUnpublishModal, setShowUnpublishModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const [showDeleteStepModal, setShowDeleteStepModal] = useState<{
    index: number;
    title: string;
    count: number;
  } | null>(null);

  // Save / Publish states
  const [currentFormStatus, setCurrentFormStatus] = useState<string>(form.status);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const currentStep = schema.steps[activeStepIndex] || schema.steps[0];
  const selectedField =
    schema.steps.flatMap((s) => s.fields).find((f) => f.id === selectedFieldId) || null;

  // Publication Status calculation: QR MUST be uploaded by organizer (no dummy fallback allowed)
  const isPublished = currentFormStatus === "PUBLISHED" && Boolean(form.publishedVersionId);
  const isDummyQr = siteSetting?.paymentQrCodeUrl === "/assets/brand/origin-foundation-qr.png";
  const hasValidQr = Boolean(
    siteSetting?.paymentQrCodeUrl && siteSetting.paymentQrCodeUrl.trim() !== "" && !isDummyQr
  );

  // Update schema with appearance
  const getFullSchema = (): FormSchemaDefinition => ({
    ...schema,
    appearance,
  });

  const handleRestoreOfficialTemplate = () => {
    setSchema(DEFAULT_MITHILA_QUEEN_SCHEMA);
    setActiveStepIndex(0);
    setSelectedFieldId(null);
    setShowRestoreModal(false);
    toast.success("Official verified Mithila Queen registration template restored!");
  };

  // -------------------------------------------------------------
  // STEP ACTIONS & DRAG-AND-DROP REORDER
  // -------------------------------------------------------------
  const handleAddStep = () => {
    const newStepNumber = schema.steps.length + 1;
    const newStep: FormStepDefinition = {
      id: `step-${nanoid(6)}`,
      title: `Step ${newStepNumber}: Custom Section`,
      description: "Additional questions or instructions for applicants",
      order: schema.steps.length,
      fields: [],
    };
    setSchema({
      ...schema,
      steps: [...schema.steps, newStep],
    });
    setActiveStepIndex(schema.steps.length);
    toast.success("New step added!");
  };

  const handleUpdateStepTitle = (title: string) => {
    const updated = [...schema.steps];
    if (!updated[activeStepIndex]) return;
    updated[activeStepIndex] = {
      ...updated[activeStepIndex],
      title,
    };
    setSchema({ ...schema, steps: updated });
  };

  const handleUpdateStepDescription = (description: string) => {
    const updated = [...schema.steps];
    if (!updated[activeStepIndex]) return;
    updated[activeStepIndex] = {
      ...updated[activeStepIndex],
      description,
    };
    setSchema({ ...schema, steps: updated });
  };

  const promptDeleteStep = (stepIndex: number) => {
    if (stepIndex === 0) {
      toast.error("Step 1 contains mandatory identity verification and cannot be deleted.");
      return;
    }
    const stepToDelete = schema.steps[stepIndex];
    setShowDeleteStepModal({
      index: stepIndex,
      title: stepToDelete?.title || `Step ${stepIndex + 1}`,
      count: stepToDelete?.fields?.length || 0,
    });
  };

  const confirmDeleteStep = (stepIndex: number) => {
    const updated = schema.steps.filter((_, i) => i !== stepIndex);
    setSchema({ ...schema, steps: updated });
    setActiveStepIndex(Math.max(0, stepIndex - 1));
    toast.success("Step deleted.");
  };

  // Reorder steps via Drag and Drop (Step 1 is strictly locked!)
  const handleReorderSteps = (fromIndex: number, toIndex: number) => {
    if (fromIndex === 0 || toIndex === 0) {
      toast.error("Step 1 contains mandatory identity verification and must remain first.");
      return;
    }
    if (fromIndex === toIndex) return;

    const updated = [...schema.steps];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    const reordered = updated.map((st, i) => ({ ...st, order: i }));
    setSchema({ ...schema, steps: reordered });
    setActiveStepIndex(toIndex);
    toast.success("Step reordered successfully!");
  };

  // Reorder fields via Drag and Drop within active step
  const handleReorderFields = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || !currentStep) return;
    const newFields = [...currentStep.fields];
    const [moved] = newFields.splice(fromIndex, 1);
    newFields.splice(toIndex, 0, moved);
    const reordered = newFields.map((f, i) => ({ ...f, order: i }));
    const updatedSteps = [...schema.steps];
    updatedSteps[activeStepIndex] = {
      ...currentStep,
      fields: reordered,
    };
    setSchema({ ...schema, steps: updatedSteps });
    toast.success("Question reordered!");
  };

  const handleMoveStep = (fromIndex: number, toIndex: number) => {
    if (fromIndex === 0 || toIndex === 0) {
      toast.error("Step 1 contains mandatory identity verification and must remain first.");
      return;
    }
    if (toIndex < 1 || toIndex >= schema.steps.length) return;
    const updated = [...schema.steps];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setSchema({ ...schema, steps: updated });
    setActiveStepIndex(toIndex);
  };

  const handleTogglePaymentStep = (stepIndex: number, isPayment: boolean) => {
    const updated = schema.steps.map((st, i) => ({
      ...st,
      isPaymentStep: i === stepIndex ? isPayment : false,
    }));
    setSchema({ ...schema, steps: updated });
    if (isPayment) {
      toast.success(`Step ${stepIndex + 1} set as Payment & Receipt Upload step.`);
    } else {
      toast.info("Payment step unset.");
    }
  };

  const handleDuplicateStep = (stepIndex: number) => {
    if (stepIndex === 0) {
      toast.error("System-protected identity step cannot be duplicated.");
      return;
    }
    const sourceStep = schema.steps[stepIndex];
    const duplicatedStep: FormStepDefinition = {
      id: `step-${nanoid(6)}`,
      title: `${sourceStep.title} (Copy)`,
      description: sourceStep.description,
      order: schema.steps.length,
      fields: sourceStep.fields.map((f) => ({
        ...f,
        id: `field-${nanoid(8)}`,
        fieldKey: `${f.fieldKey}_copy_${nanoid(3)}`,
        isSystem: false,
      })),
    };
    setSchema({
      ...schema,
      steps: [...schema.steps, duplicatedStep],
    });
    setActiveStepIndex(schema.steps.length);
    toast.success("Step duplicated!");
  };

  // -------------------------------------------------------------
  // QUESTION ACTIONS
  // -------------------------------------------------------------
  const handleAddQuestion = (type: FieldType) => {
    const id = `field-${nanoid(8)}`;
    const fieldKey = `custom_${type}_${nanoid(4)}`;

    let defaultLabel = "New Question";
    if (type === "text") defaultLabel = "Short Answer";
    if (type === "textarea") defaultLabel = "Detailed Response";
    if (type === "email") defaultLabel = "Email Address";
    if (type === "phone") defaultLabel = "Phone Number";
    if (type === "number") defaultLabel = "Numeric Value";
    if (type === "date") defaultLabel = "Date";
    if (type === "select") defaultLabel = "Select Option";
    if (type === "radio") defaultLabel = "Choose One";
    if (type === "checkbox-group") defaultLabel = "Select All That Apply";
    if (type === "checkbox") defaultLabel = "I agree to the terms";
    if (type === "image") defaultLabel = "Upload Image";
    if (type === "video") defaultLabel = "Audition Video";
    if (type === "file") defaultLabel = "Upload Document";

    const newField: FormFieldDefinition = {
      id,
      fieldKey,
      type,
      label: defaultLabel,
      required: false,
      order: currentStep?.fields?.length || 0,
      options: ["select", "radio", "checkbox-group"].includes(type)
        ? [
            { label: "Option 1", value: "option_1" },
            { label: "Option 2", value: "option_2" },
          ]
        : undefined,
    };

    const updatedSteps = [...schema.steps];
    updatedSteps[activeStepIndex] = {
      ...currentStep,
      fields: [...(currentStep.fields || []), newField],
    };

    setSchema({ ...schema, steps: updatedSteps });
    setSelectedFieldId(id);
    setIsAddQuestionMenuOpen(false);
    toast.success(`Added ${newField.label}`);
  };

  const handleUpdateField = (updatedField: FormFieldDefinition) => {
    const updatedSteps = schema.steps.map((st) => ({
      ...st,
      fields: st.fields.map((f) => (f.id === updatedField.id ? updatedField : f)),
    }));
    setSchema({ ...schema, steps: updatedSteps });
  };

  const handleDeleteField = (fieldId: string) => {
    const field = schema.steps.flatMap((s) => s.fields).find((f) => f.id === fieldId);
    if (field?.isSystem || ["fullName", "email", "phone"].includes(field?.fieldKey || "")) {
      toast.error("Mandatory identity verification fields cannot be deleted.");
      return;
    }

    const updatedSteps = schema.steps.map((st) => ({
      ...st,
      fields: st.fields.filter((f) => f.id !== fieldId),
    }));
    setSchema({ ...schema, steps: updatedSteps });
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
    toast.success("Question deleted.");
  };

  const handleDuplicateField = (field: FormFieldDefinition) => {
    const duplicated: FormFieldDefinition = {
      ...field,
      id: `field-${nanoid(8)}`,
      fieldKey: `${field.fieldKey}_copy_${nanoid(3)}`,
      label: `${field.label} (Copy)`,
      isSystem: false,
      order: (currentStep?.fields?.length || 0) + 1,
    };

    const updatedSteps = [...schema.steps];
    updatedSteps[activeStepIndex] = {
      ...currentStep,
      fields: [...currentStep.fields, duplicated],
    };
    setSchema({ ...schema, steps: updatedSteps });
    setSelectedFieldId(duplicated.id);
    toast.success("Question duplicated!");
  };

  const handleMoveField = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= currentStep.fields.length) return;
    const updatedFields = [...currentStep.fields];
    const [moved] = updatedFields.splice(fromIndex, 1);
    updatedFields.splice(toIndex, 0, moved);

    const updatedSteps = [...schema.steps];
    updatedSteps[activeStepIndex] = {
      ...currentStep,
      fields: updatedFields,
    };
    setSchema({ ...schema, steps: updatedSteps });
  };

  // -------------------------------------------------------------
  // SAVE DRAFT
  // -------------------------------------------------------------
  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    setValidationErrors([]);
    try {
      const fullSchema = getFullSchema();
      const res = await saveFormSchemaAction(form.id, fullSchema);
      if (res.success) {
        toast.success("Draft saved successfully! (Not publicly live until published)");
      } else {
        toast.error(res.error || "Failed to save draft");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIsSavingDraft(false);
    }
  };

  // -------------------------------------------------------------
  // PUBLISH FORM (Strict Validation)
  // -------------------------------------------------------------
  const handlePublish = async () => {
    setValidationErrors([]);

    // 1. Check QR code locally first for immediate feedback
    if (!hasValidQr) {
      const msg =
        "Publication blocked: Official merchant payment QR code must be uploaded before publishing. Please go to 'Payment & Fee Settings' and upload your merchant QR image.";
      setValidationErrors([msg]);
      toast.error(msg);
      setActiveArea("payment");
      return;
    }

    // 2. Check Registration Start Opening Date & Time
    if (!siteSetting?.registrationOpeningDate && !(form as any).opensAt) {
      const msg =
        "Publication blocked: Registration Start Opening Date & Time must be configured before publishing. Please set the opening schedule under Registration Availability.";
      setValidationErrors([msg]);
      toast.error(msg);
      setIsAvailabilityOpen(true);
      return;
    }

    setIsPublishing(true);
    try {
      const fullSchema = getFullSchema();
      const res = await publishFormAction(form.id, fullSchema);

      if (res.success) {
        setCurrentFormStatus("PUBLISHED");
        toast.success("Registration form successfully published! Live for participants.");
      } else {
        if (res.errors && res.errors.length > 0) {
          setValidationErrors(res.errors);
        }
        toast.error(res.error || "Failed to publish form");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred during publish");
    } finally {
      setIsPublishing(false);
    }
  };

  // -------------------------------------------------------------
  // UNPUBLISH FORM
  // -------------------------------------------------------------
  const handleUnpublish = async () => {
    setIsUnpublishing(true);
    try {
      const res = await unpublishFormAction(form.id);
      if (res.success) {
        setCurrentFormStatus("UNPUBLISHED");
        setShowUnpublishModal(false);
        toast.success("Registration form unpublished! Public registration is now closed.");
      } else {
        toast.error(res.error || "Failed to unpublish form");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIsUnpublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ==================================================================== */}
      {/* TOP COMMAND HEADER */}
      {/* ==================================================================== */}
      <div className="p-5 rounded-2xl border border-[#DCE5ED] bg-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-[#183153]">
              Registration Form Workspace
            </h1>
            {/* Publication Status Badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                isPublished
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
            >
              {isPublished ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Published &bull; Live for Participants</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                  <span>Unpublished &bull; Form Closed</span>
                </>
              )}
            </span>
          </div>
          <p className="text-xs text-[#546E7A]">
            Manage the multi-step registration wizard, custom questions, and payment configuration.
          </p>
        </div>

        {/* Global Header Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Live Preview Toggle */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === "editor" ? "preview" : "editor")}
            className="h-9 text-xs border-[#DCE5ED] text-[#263238] hover:bg-[#F4F7FA] gap-1.5 font-semibold"
          >
            <Eye className="w-3.5 h-3.5 text-[#356FA8]" />
            <span>{viewMode === "editor" ? "Preview Form" : "Back to Editor"}</span>
          </Button>

          {/* Save Draft */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSavingDraft || isPublishing || isUnpublishing}
            onClick={handleSaveDraft}
            className="h-9 text-xs border-[#DCE5ED] text-[#263238] hover:bg-[#F4F7FA] gap-1.5 font-semibold"
          >
            {isSavingDraft ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5 text-[#546E7A]" />
            )}
            <span>Save Draft</span>
          </Button>

          {/* Publish / Unpublish Toggle Action */}
          {isPublished ? (
            <Button
              type="button"
              size="sm"
              disabled={isUnpublishing || isPublishing}
              onClick={() => setShowUnpublishModal(true)}
              className="h-9 text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 gap-1.5 font-semibold shadow-xs"
            >
              {isUnpublishing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-amber-700" />
              )}
              <span>Unpublish Form</span>
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              disabled={isPublishing || isSavingDraft}
              onClick={handlePublish}
              className="h-9 text-xs bg-[#183153] hover:bg-[#12243d] text-white gap-1.5 font-semibold shadow-xs"
            >
              {isPublishing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span>Publish Form</span>
            </Button>
          )}

          {/* Public Link */}
          <Link href="/register/mithila-queen" target="_blank">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 text-xs border-[#DCE5ED] text-[#546E7A] hover:text-[#263238] hover:bg-[#F4F7FA] gap-1"
              title="Open public registration page in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Validation Errors Box (Shown if publish was blocked) */}
      {validationErrors.length > 0 && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/70 text-rose-800 text-xs space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 font-bold text-sm text-rose-900">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Please resolve the following requirements before publishing:</span>
          </div>
          <ul className="list-disc pl-6 space-y-1 text-[11px] leading-relaxed">
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ==================================================================== */}
      {/* WORKSPACE AREA SWITCHER: FORM BUILDER vs PAYMENT SETTINGS */}
      {/* ==================================================================== */}
      <div className="flex items-center border-b border-[#DCE5ED] gap-2">
        <button
          type="button"
          onClick={() => setActiveArea("builder")}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
            activeArea === "builder"
              ? "border-dark-taupe text-[#263238]"
              : "border-transparent text-taupe-grey hover:text-[#263238]"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Form Builder ({schema.steps.length} Steps)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveArea("payment")}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
            activeArea === "payment"
              ? "border-dark-taupe text-[#263238]"
              : "border-transparent text-taupe-grey hover:text-[#263238]"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payment &amp; Fee Settings</span>
          {hasValidQr ? (
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </button>
      </div>

      {/* ==================================================================== */}
      {/* AREA 1: FORM BUILDER */}
      {/* ==================================================================== */}
      {activeArea === "builder" && (
        <div className="space-y-6">
          {/* Live Preview Mode Container */}
          {viewMode === "preview" ? (
            <div className="p-6 rounded-2xl border border-[#DCE5ED] bg-white shadow-xs space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-[#DCE5ED] pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-taupe-grey">
                    Live Public Participant Preview
                  </span>
                  <h3 className="text-lg font-bold text-[#263238] font-serif">
                    {appearance.mainHeading || "Official Registration"}
                  </h3>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setViewMode("editor")}
                  className="h-8 text-xs border-[#DCE5ED] hover:bg-[#F4F7FA]"
                >
                  Exit Preview
                </Button>
              </div>

              {/* Live Preview Step View */}
              <div className="max-w-2xl mx-auto space-y-6 py-4">
                <div className="p-4 rounded-xl bg-[#F4F7FA] border border-[#DCE5ED] text-center space-y-1">
                  <h4 className="text-base font-bold text-[#263238]">{currentStep?.title}</h4>
                  {currentStep?.description && (
                    <p className="text-xs text-taupe-grey">{currentStep.description}</p>
                  )}
                </div>

                <div className="space-y-4">
                  {currentStep?.fields?.map((field) => (
                    <div
                      key={field.id}
                      className="p-4 rounded-xl border border-[#DCE5ED] bg-white space-y-1.5 shadow-2xs"
                    >
                      <Label className="text-xs font-bold text-[#263238] flex items-center justify-between">
                        <span>
                          {field.label} {field.required && <span className="text-rose-600">*</span>}
                        </span>
                        <span className="text-[10px] text-taupe-grey font-mono">[{field.type}]</span>
                      </Label>
                      {field.description && (
                        <p className="text-[11px] text-taupe-grey">{field.description}</p>
                      )}
                      <Input
                        disabled
                        placeholder={field.placeholder || "Candidate answer..."}
                        className="h-9 text-xs border-[#DCE5ED] bg-[#F4F7FA]/50 cursor-not-allowed"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#DCE5ED]">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={activeStepIndex === 0}
                    onClick={() => setActiveStepIndex((i) => Math.max(0, i - 1))}
                    className="h-8 text-xs border-[#DCE5ED] hover:bg-[#F4F7FA]"
                  >
                    Previous Step
                  </Button>
                  <span className="text-xs text-taupe-grey font-medium">
                    Step {activeStepIndex + 1} of {schema.steps.length}
                  </span>
                  <Button
                    size="sm"
                    disabled={activeStepIndex === schema.steps.length - 1}
                    onClick={() => setActiveStepIndex((i) => Math.min(schema.steps.length - 1, i + 1))}
                    className="h-8 text-xs bg-dark-taupe hover:bg-dark-taupe-hover text-white"
                  >
                    Next Step
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Standard Editor Workspace */
            <div className="space-y-6">
              {/* Collapsible: Form Appearance & Introduction */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setIsAppearanceOpen(!isAppearanceOpen)}
                  className="w-full p-4 rounded-xl border border-[#DCE5ED] bg-white hover:bg-[#F4F7FA]/50 transition-colors flex items-center justify-between shadow-xs"
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <Sparkles className="w-4 h-4 text-dark-taupe" />
                    <div>
                      <span className="text-xs font-bold text-[#263238] block">
                        Form Appearance &amp; Introduction
                      </span>
                      <span className="text-[11px] text-taupe-grey">
                        Customize page heading, welcome message, logo, and submission notices.
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-taupe-grey transition-transform ${
                      isAppearanceOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isAppearanceOpen && (
                  <div className="pt-1">
                    <FormAppearanceSettings
                      appearance={appearance}
                      onChange={(updated) => setAppearance(updated)}
                    />
                  </div>
                )}
              </div>

              {/* Collapsible: Registration Availability */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setIsAvailabilityOpen(!isAvailabilityOpen)}
                  className="w-full p-4 rounded-xl border border-[#DCE5ED] bg-white hover:bg-[#F4F7FA]/50 transition-colors flex items-center justify-between shadow-xs"
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <Calendar className="w-4 h-4 text-dark-taupe" />
                    <div>
                      <span className="text-xs font-bold text-[#263238] block">
                        Registration Availability &amp; Deadlines
                      </span>
                      <span className="text-[11px] text-taupe-grey">
                        Opening date, closing deadline, and manual open/close controls.
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-taupe-grey transition-transform ${
                      isAvailabilityOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isAvailabilityOpen && (
                  <div className="pt-1">
                    <RegistrationAvailabilityCard
                      siteSetting={siteSetting}
                      onSaved={(updated) => setSiteSetting(updated)}
                    />
                  </div>
                )}
              </div>

              {/* 3-PART STEP & QUESTION MANAGEMENT WORKSPACE */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* PART 1 (LEFT): Step Navigation & Controls */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="p-4 rounded-xl border border-[#DCE5ED] bg-white shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-[#263238] flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-dark-taupe" />
                        <span>Steps ({schema.steps.length})</span>
                      </h3>
                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setShowRestoreModal(true)}
                          className="h-7 text-[11px] border-[#DCE5ED] hover:bg-[#F4F7FA] text-[#546E7A] gap-1 px-2"
                          title="Restore the official 7-step Mithila Queen registration template"
                        >
                          <RotateCcw className="w-3 h-3 text-[#356FA8]" />
                          <span>Official Template</span>
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={handleAddStep}
                          className="h-7 text-[11px] border-[#DCE5ED] hover:bg-[#F4F7FA] gap-1 px-2"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Step</span>
                        </Button>
                      </div>
                    </div>

                    {/* Step Cards List */}
                    <div className="space-y-1.5">
                      {schema.steps.map((st, idx) => {
                        const isActive = idx === activeStepIndex;
                        const isFirstStep = idx === 0;
                        const isDragOver = dragOverStepIdx === idx;
                        const isDragging = draggedStepIdx === idx;

                        return (
                          <div
                            key={st.id}
                            draggable={!isFirstStep}
                            onDragStart={(e) => {
                              if (!isFirstStep) {
                                e.dataTransfer.setData("text/plain", String(idx));
                                e.dataTransfer.effectAllowed = "move";
                                setDraggedStepIdx(idx);
                              }
                            }}
                            onDragOver={(e) => {
                              if (draggedStepIdx !== null && idx > 0 && draggedStepIdx !== idx) {
                                e.preventDefault();
                                e.dataTransfer.dropEffect = "move";
                                if (dragOverStepIdx !== idx) {
                                  setDragOverStepIdx(idx);
                                }
                              }
                            }}
                            onDragLeave={(e) => {
                              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                if (dragOverStepIdx === idx) setDragOverStepIdx(null);
                              }
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              if (draggedStepIdx !== null && idx > 0 && draggedStepIdx !== idx) {
                                handleReorderSteps(draggedStepIdx, idx);
                              }
                              setDraggedStepIdx(null);
                              setDragOverStepIdx(null);
                            }}
                            onDragEnd={() => {
                              setDraggedStepIdx(null);
                              setDragOverStepIdx(null);
                            }}
                            onClick={() => {
                              setActiveStepIndex(idx);
                              setSelectedFieldId(null);
                            }}
                            className={`relative p-3 rounded-xl border cursor-pointer transition-all duration-150 flex items-center justify-between gap-2 select-none ${
                              isDragging
                                ? "opacity-40 border-dashed border-[#356FA8] bg-blue-50/30 scale-[0.99]"
                                : isDragOver
                                ? "border-[#356FA8] bg-blue-50/40 ring-2 ring-[#356FA8]/30 shadow-sm"
                                : isActive
                                ? "bg-[#F4F7FA] border-warm-stone shadow-2xs"
                                : "bg-white border-[#DCE5ED] hover:border-warm-stone hover:bg-[#F4F7FA]/40"
                            }`}
                          >
                            {/* Visual insertion indicator line if dragged over */}
                            {isDragOver && (
                              <div
                                className={`absolute left-0 right-0 h-1 bg-[#356FA8] rounded-full shadow-sm z-10 ${
                                  draggedStepIdx !== null && draggedStepIdx < idx ? "-bottom-0.5" : "-top-0.5"
                                }`}
                              />
                            )}
                            <div className="flex items-center gap-2 min-w-0 flex-1 pointer-events-none">
                              {isFirstStep ? (
                                <span title="Identity Step is locked in 1st position">
                                  <Lock className="w-3.5 h-3.5 text-dark-taupe shrink-0" />
                                </span>
                              ) : (
                                <span title="Drag to reorder step" className="cursor-grab active:cursor-grabbing shrink-0 flex items-center">
                                  <GripVertical className="w-3.5 h-3.5 text-taupe-grey" />
                                </span>
                              )}
                              <span className="text-[11px] font-mono font-bold text-taupe-grey shrink-0">
                                {idx + 1}.
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span
                                    className={`text-xs block truncate ${
                                      isActive ? "font-bold text-[#263238]" : "font-medium text-[#263238]"
                                    }`}
                                  >
                                    {st.title}
                                  </span>
                                  {st.isPaymentStep && (
                                    <span className="inline-flex items-center text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                      Payment
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-taupe-grey block truncate">
                                  {st.fields?.length || 0} questions
                                  {isFirstStep && " • Identity Locked"}
                                </span>
                              </div>
                            </div>

                            {/* Reorder / Action Controls */}
                            <div className="flex items-center gap-1 shrink-0 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                              {!isFirstStep && (
                                <>
                                  <button
                                    type="button"
                                    disabled={idx === 1}
                                    onClick={() => handleMoveStep(idx, idx - 1)}
                                    className="p-1 text-taupe-grey hover:text-[#263238] disabled:opacity-30"
                                    title="Move step up"
                                  >
                                    <ArrowUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === schema.steps.length - 1}
                                    onClick={() => handleMoveStep(idx, idx + 1)}
                                    className="p-1 text-taupe-grey hover:text-[#263238] disabled:opacity-30"
                                    title="Move step down"
                                  >
                                    <ArrowDown className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDuplicateStep(idx)}
                                    className="p-1 text-taupe-grey hover:text-[#263238]"
                                    title="Duplicate step"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => promptDeleteStep(idx)}
                                    className="p-1 text-taupe-grey hover:text-rose-600"
                                    title="Delete step"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* PART 2 (CENTER): Selected Step & Questions Canvas */}
                <div
                  className={`${
                    selectedField ? "lg:col-span-5" : "lg:col-span-8"
                  } space-y-4`}
                >
                  <Card className="border-[#DCE5ED] bg-white shadow-xs">
                    <CardHeader className="pb-3 border-b border-[#DCE5ED]/50">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-taupe-grey">
                              Step {activeStepIndex + 1} of {schema.steps.length}
                            </span>
                            {activeStepIndex === 0 ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-dark-taupe bg-[#F4F7FA] px-2 py-0.5 rounded-full border border-warm-stone">
                                <Lock className="w-3 h-3" />
                                <span>Mandatory Identity Verification</span>
                              </span>
                            ) : (
                              <label className="inline-flex items-center gap-1.5 text-[11px] text-[#263238] font-medium cursor-pointer bg-[#F4F7FA] px-2 py-0.5 rounded-md border border-[#DCE5ED] hover:border-warm-stone select-none">
                                <input
                                  type="checkbox"
                                  checked={Boolean(currentStep?.isPaymentStep)}
                                  onChange={(e) => handleTogglePaymentStep(activeStepIndex, e.target.checked)}
                                  className="rounded text-dark-taupe focus:ring-dark-taupe w-3.5 h-3.5"
                                />
                                <span>Include Payment QR & Receipt Upload in this step</span>
                              </label>
                            )}
                          </div>
                          <Input
                            value={currentStep?.title || ""}
                            onChange={(e) => handleUpdateStepTitle(e.target.value)}
                            className="font-bold text-sm h-8 border-transparent hover:border-[#DCE5ED] focus:border-[#DCE5ED] bg-transparent px-1 text-[#263238]"
                            placeholder="Step Title..."
                          />
                        </div>

                        {/* Add Question Dropdown Trigger */}
                        <div className="relative">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => setIsAddQuestionMenuOpen(!isAddQuestionMenuOpen)}
                            className="gap-1.5 bg-dark-taupe hover:bg-dark-taupe-hover text-white text-xs h-8 px-3 font-semibold shadow-2xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Question</span>
                          </Button>

                          {/* Field Palette Menu with Outside Click Dismiss Backdrop */}
                          {isAddQuestionMenuOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-20 cursor-default"
                                onClick={() => setIsAddQuestionMenuOpen(false)}
                              />
                              <div className="absolute right-0 top-10 w-72 bg-white rounded-xl border border-[#DCE5ED] shadow-xl z-30 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-100 max-h-96 overflow-y-auto">
                                <span className="text-[10px] font-bold text-taupe-grey uppercase tracking-wider px-2 py-1 block">
                                  Choose Question Type
                                </span>
                                {FIELD_TYPE_OPTIONS.map((opt) => {
                                  const IconComponent = opt.icon;
                                  return (
                                    <button
                                      key={opt.type}
                                      type="button"
                                      onClick={() => handleAddQuestion(opt.type)}
                                      className="w-full p-2 rounded-lg text-left hover:bg-[#F4F7FA] flex items-start gap-2.5 transition-colors"
                                    >
                                      <IconComponent className="w-4 h-4 text-dark-taupe shrink-0 mt-0.5" />
                                      <div>
                                        <span className="text-xs font-semibold text-[#263238] block leading-tight">
                                          {opt.label}
                                        </span>
                                        <span className="text-[10px] text-taupe-grey block">
                                          {opt.description}
                                        </span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Step Description Editor */}
                      <Input
                        value={currentStep?.description || ""}
                        onChange={(e) => handleUpdateStepDescription(e.target.value)}
                        className="text-xs h-7 border-transparent hover:border-[#DCE5ED] focus:border-[#DCE5ED] bg-transparent px-1 text-taupe-grey mt-1"
                        placeholder="Optional instructions for candidates in this step..."
                      />
                    </CardHeader>

                    <CardContent className="pt-4 space-y-3">
                      {/* STEP 1 IDENTITY LOCK BANNER */}
                      {activeStepIndex === 0 && (
                        <div className="p-3.5 rounded-xl bg-[#F4F7FA] border border-[#DCE5ED] flex items-start gap-3">
                          <Lock className="w-4 h-4 text-dark-taupe shrink-0 mt-0.5" />
                          <div className="space-y-0.5 text-xs">
                            <span className="font-bold text-[#263238] block">
                              Identity Verification Guard Active
                            </span>
                            <p className="text-[11px] text-taupe-grey leading-relaxed">
                              Full Name, Email Address, and Phone Number are system-enforced for candidate authenticity. A 6-digit OTP code is sent to the candidate&apos;s email before they can advance to Step 2.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Questions List */}
                      {currentStep?.fields?.length === 0 ? (
                        <div className="py-12 text-center text-xs text-taupe-grey space-y-2">
                          <HelpCircle className="w-8 h-8 mx-auto opacity-30 text-dark-taupe" />
                          <p>No questions in this step yet.</p>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setIsAddQuestionMenuOpen(true)}
                            className="h-8 text-xs border-[#DCE5ED]"
                          >
                            Add Your First Question
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {currentStep?.fields?.map((field, fIdx) => {
                            const isSelected = selectedFieldId === field.id;
                            const isSystem = Boolean(
                              field.isSystem || ["fullName", "email", "phone"].includes(field.fieldKey)
                            );
                            const isDragOverField = dragOverFieldIdx === fIdx;
                            const isDraggingField = draggedFieldIdx === fIdx;

                            return (
                              <div
                                key={field.id}
                                draggable={true}
                                onDragStart={(e) => {
                                  e.stopPropagation();
                                  setDraggedFieldIdx(fIdx);
                                  e.dataTransfer.setData("text/plain", String(fIdx));
                                  e.dataTransfer.effectAllowed = "move";
                                }}
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (draggedFieldIdx !== null && draggedFieldIdx !== fIdx) {
                                    e.dataTransfer.dropEffect = "move";
                                    if (dragOverFieldIdx !== fIdx) {
                                      setDragOverFieldIdx(fIdx);
                                    }
                                  }
                                }}
                                onDragLeave={(e) => {
                                  e.stopPropagation();
                                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                    if (dragOverFieldIdx === fIdx) setDragOverFieldIdx(null);
                                  }
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (draggedFieldIdx !== null && draggedFieldIdx !== fIdx) {
                                    handleReorderFields(draggedFieldIdx, fIdx);
                                  }
                                  setDraggedFieldIdx(null);
                                  setDragOverFieldIdx(null);
                                }}
                                onDragEnd={() => {
                                  setDraggedFieldIdx(null);
                                  setDragOverFieldIdx(null);
                                }}
                                onClick={() => setSelectedFieldId(field.id)}
                                className={`relative p-3 rounded-xl border cursor-pointer transition-all duration-150 flex items-center justify-between gap-3 select-none ${
                                  isDraggingField
                                    ? "opacity-40 border-dashed border-[#356FA8] bg-blue-50/30 scale-[0.99]"
                                    : isDragOverField
                                    ? "border-[#356FA8] bg-blue-50/40 ring-2 ring-[#356FA8]/30 shadow-sm"
                                    : isSelected
                                    ? "bg-[#F4F7FA] border-warm-stone shadow-xs ring-1 ring-warm-stone"
                                    : "bg-white border-[#DCE5ED] hover:border-warm-stone hover:bg-[#F4F7FA]/40"
                                }`}
                              >
                                {isDragOverField && (
                                  <div
                                    className={`absolute left-0 right-0 h-1 bg-[#356FA8] rounded-full shadow-sm z-10 ${
                                      draggedFieldIdx !== null && draggedFieldIdx < fIdx ? "-bottom-0.5" : "-top-0.5"
                                    }`}
                                  />
                                )}
                                {/* Clean preview: only label, required asterisk, and input type badge */}
                                <div className="flex items-center gap-2.5 min-w-0 flex-1 pointer-events-none">
                                  <span title="Drag to reorder question" className="cursor-grab active:cursor-grabbing shrink-0 flex items-center">
                                    <GripVertical className="w-3.5 h-3.5 text-taupe-grey" />
                                  </span>
                                  {isSystem && (
                                    <span title="Mandatory system field">
                                      <Lock className="w-3.5 h-3.5 text-dark-taupe shrink-0" />
                                    </span>
                                  )}
                                  <span className="text-xs font-semibold text-[#263238] truncate">
                                    {field.label}
                                  </span>
                                  {field.required && (
                                    <span className="text-rose-600 font-bold text-xs shrink-0">*</span>
                                  )}
                                  <span className="text-[10px] uppercase font-mono font-medium px-2 py-0.5 rounded bg-[#F4F7FA] text-dark-taupe border border-warm-stone/50 shrink-0">
                                    {field.type}
                                  </span>
                                </div>

                                {/* Question Row Controls */}
                                <div
                                  className="flex items-center gap-1 shrink-0 pointer-events-auto"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    type="button"
                                    disabled={fIdx === 0}
                                    onClick={() => handleMoveField(fIdx, fIdx - 1)}
                                    className="p-1 text-taupe-grey hover:text-[#263238] disabled:opacity-30"
                                    title="Move question up"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={fIdx === currentStep.fields.length - 1}
                                    onClick={() => handleMoveField(fIdx, fIdx + 1)}
                                    className="p-1 text-taupe-grey hover:text-[#263238] disabled:opacity-30"
                                    title="Move question down"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setSelectedFieldId(field.id)}
                                    className="p-1 text-taupe-grey hover:text-dark-taupe"
                                    title="Configure question"
                                  >
                                    <Sliders className="w-3.5 h-3.5" />
                                  </button>

                                  {!isSystem && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleDuplicateField(field)}
                                        className="p-1 text-taupe-grey hover:text-[#263238]"
                                        title="Duplicate question"
                                      >
                                        <Copy className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteField(field.id)}
                                        className="p-1 text-taupe-grey hover:text-rose-600"
                                        title="Delete question"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* PART 3 (RIGHT): Selected Question Configuration Drawer */}
                {selectedField && (
                  <div className="lg:col-span-3 sticky top-4">
                    <div className="rounded-2xl border border-[#DCE5ED] overflow-hidden shadow-xs">
                      <QuestionConfigDrawer
                        field={selectedField}
                        onUpdate={handleUpdateField}
                        onDelete={handleDeleteField}
                        onDuplicate={handleDuplicateField}
                        onClose={() => setSelectedFieldId(null)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* AREA 2: PAYMENT & FEE SETTINGS */}
      {/* ==================================================================== */}
      {activeArea === "payment" && (
        <PaymentFeeSettings
          siteSetting={siteSetting}
          onPaymentSettingsSaved={(updated) => setSiteSetting(updated)}
        />
      )}

      {/* ==================================================================== */}
      {/* UNPUBLISH CONFIRMATION MODAL */}
      {/* ==================================================================== */}
      {showUnpublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#DCE5ED] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                <EyeOff className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#263238]">Unpublish Registration Form?</h3>
                <p className="text-xs text-taupe-grey">Public candidate access will be disabled.</p>
              </div>
            </div>
            <p className="text-xs text-[#263238] leading-relaxed bg-[#F4F7FA] p-3 rounded-lg border border-[#DCE5ED]">
              Candidates visiting the public registration page will see an official notification that registrations are currently closed or under maintenance. Your form structure, schema, and existing responses will remain completely intact.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowUnpublishModal(false)}
                disabled={isUnpublishing}
                className="border-[#DCE5ED]"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleUnpublish}
                disabled={isUnpublishing}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold"
              >
                {isUnpublishing ? "Unpublishing..." : "Confirm Unpublish"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* DELETE STEP CONFIRMATION MODAL */}
      {/* ==================================================================== */}
      {showDeleteStepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#DCE5ED] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#263238]">Delete Step?</h3>
                <p className="text-xs text-taupe-grey">{showDeleteStepModal.title}</p>
              </div>
            </div>
            <p className="text-xs text-[#263238] leading-relaxed bg-rose-50/50 p-3 rounded-lg border border-rose-100 text-rose-900">
              This step contains <strong>{showDeleteStepModal.count} questions</strong>. Deleting this step will remove all of its questions from this form draft.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteStepModal(null)}
                className="border-[#DCE5ED]"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  confirmDeleteStep(showDeleteStepModal.index);
                  setShowDeleteStepModal(null);
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
              >
                Delete Step
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* RESTORE OFFICIAL TEMPLATE CONFIRMATION MODAL */}
      {/* ==================================================================== */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#DCE5ED] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-[#356FA8] shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#263238]">Restore Official Template?</h3>
                <p className="text-xs text-taupe-grey">Official Mithila Queen form specification</p>
              </div>
            </div>
            <p className="text-xs text-[#263238] leading-relaxed bg-[#F4F7FA] p-3 rounded-lg border border-[#DCE5ED]">
              This will reload the complete, official 7-step Mithila Queen registration schema (Personal Information with OTP guard, Participant Profile &amp; Essay Questions, Voluntary Education &amp; Talents, Physical Attributes, Social Profiles, Document Uploads, Safeguarding &amp; Minor Consents, and Fee Payment). Any unsaved changes in this session will be replaced.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowRestoreModal(false)}
                className="border-[#DCE5ED]"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleRestoreOfficialTemplate}
                className="bg-[#183153] hover:bg-[#12243d] text-white font-semibold"
              >
                Restore Official Template
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


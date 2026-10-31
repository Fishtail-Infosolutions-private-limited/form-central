"use client";

import React, { useState } from "react";
import { FormSchemaDefinition, FormFieldDefinition } from "@/types/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, CheckCircle2, ArrowRight, ArrowLeft, Eye, ShieldCheck, Upload, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { RichTextView } from "@/components/ui/rich-text-view";

interface FormPreviewProps {
  formName: string;
  formDescription?: string | null;
  schema: FormSchemaDefinition;
  onClose: () => void;
}

export function FormPreview({
  formName,
  formDescription,
  schema,
  onClose,
}: FormPreviewProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({
    fullName: "Alex Rivera",
    email: "alex.participant@example.com",
    phone: "+977 9812345678",
  });
  const [isEmailVerified, setIsEmailVerified] = useState(true);

  const steps = schema.steps;
  const currentStep = steps[currentStepIndex] || steps[0];

  const handleAnswerChange = (key: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  // Evaluate conditional visibility
  const isFieldVisible = (field: FormFieldDefinition): boolean => {
    if (!field.condition) return true;
    const { fieldKey, operator, value } = field.condition;
    const targetValue = answers[fieldKey];

    switch (operator) {
      case "equals":
        return String(targetValue || "").toLowerCase() === String(value).toLowerCase();
      case "not_equals":
        return String(targetValue || "").toLowerCase() !== String(value).toLowerCase();
      case "contains":
        return String(targetValue || "").toLowerCase().includes(String(value).toLowerCase());
      case "is_not_empty":
        return Boolean(targetValue && String(targetValue).trim().length > 0);
      default:
        return true;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-zinc-200">
        {/* Preview Top Banner */}
        <div className="bg-black text-white px-6 py-3 flex items-center justify-between text-xs border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-saffron animate-pulse" />
            <span className="font-semibold uppercase tracking-wider text-saffron">
              Interactive Live Preview
            </span>
            <span className="text-zinc-500">&bull;</span>
            <span className="text-zinc-300">Simulates real participant journey</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs h-7"
          >
            Exit Preview
          </Button>
        </div>

        {/* Form Header */}
        <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
          <h2 className="text-2xl font-black text-zinc-900">{formName}</h2>
          {formDescription && (
            <div className="mt-1 max-w-xl">
              <RichTextView content={formDescription} className="text-xs text-zinc-500" />
            </div>
          )}

          {/* Stepper Dots */}
          <div className="flex items-center gap-2 mt-5">
            {steps.map((st, i) => (
              <div key={st.id} className="flex items-center gap-2 flex-1">
                <div
                  className={`flex-1 h-1.5 rounded-full ${
                    i <= currentStepIndex ? "bg-maroon" : "bg-stone-200"
                  }`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center text-[11px] text-zinc-400 mt-1 font-semibold">
            <span>
              Step {currentStepIndex + 1} of {steps.length}: {currentStep.title}
            </span>
          </div>
        </div>

        {/* Step Content OR Simulation Success Screen */}
        {isSubmitted ? (
          <div className="p-10 flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-soft-cream text-maroon flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h3 className="text-xl font-black text-zinc-900">Simulation Complete!</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 leading-relaxed">
                All participant details, custom questions, and upload parameters were successfully validated in the test sandbox.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50 max-w-xs w-full text-left text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-500">Ref Code:</span>
                <span className="font-bold text-maroon">MQ-2026-SIMULATED</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Participant:</span>
                <span className="text-zinc-800">{answers.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Email:</span>
                <span className="text-zinc-800 truncate max-w-[150px]">{answers.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsSubmitted(false);
                  setCurrentStepIndex(0);
                }}
                className="text-xs h-9 gap-1.5 border-zinc-300"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Test Again</span>
              </Button>
              <Button
                size="sm"
                onClick={onClose}
                className="bg-maroon hover:bg-maroon-dark text-white text-xs h-9 px-4 font-bold"
              >
                Exit Preview
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 overflow-y-auto flex-1 space-y-5">
            {currentStepIndex === 0 && (
              <div className="p-3 bg-soft-cream border border-cream-dark rounded-xl text-maroon text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-maroon shrink-0" />
                <span>
                  <strong>Simulated State:</strong> Email is verified via OTP. You can navigate forward through all custom steps.
                </span>
              </div>
            )}

            {currentStep.fields.filter(isFieldVisible).map((field) => (
              <div key={field.id} className="space-y-1.5">
                {field.type === "heading" ? (
                  <div className="pt-2">
                    <h3 className="font-extrabold text-base text-zinc-900">{field.label}</h3>
                    {field.description && (
                      <p className="text-xs text-zinc-500">{field.description}</p>
                    )}
                  </div>
                ) : field.type === "divider" ? (
                  <hr className="my-4 border-zinc-200" />
                ) : (
                  <>
                    <Label required={field.required}>{field.label}</Label>
                    {field.description && (
                      <p className="text-[11px] text-zinc-400">{field.description}</p>
                    )}

                    {field.type === "textarea" ? (
                      <Textarea
                        placeholder={field.placeholder}
                        value={answers[field.fieldKey] || ""}
                        onChange={(e) => handleAnswerChange(field.fieldKey, e.target.value)}
                        className="text-xs"
                        rows={3}
                      />
                    ) : field.type === "select" ? (
                      <Select
                        value={answers[field.fieldKey] || ""}
                        onValueChange={(val) => handleAnswerChange(field.fieldKey, val)}
                      >
                        <SelectTrigger className="w-full h-10 text-xs border-zinc-200 bg-white">
                          <SelectValue placeholder={field.placeholder || "Select an option..."} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Select an option...</SelectItem>
                          {(field.options || []).map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : field.type === "radio" ? (
                      <div className="space-y-2 pt-1">
                        {(field.options || []).map((opt) => (
                          <label
                            key={opt.value}
                            className="flex items-center gap-2 text-xs text-zinc-700 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name={field.fieldKey}
                              value={opt.value}
                              checked={answers[field.fieldKey] === opt.value}
                              onChange={() => handleAnswerChange(field.fieldKey, opt.value)}
                              className="text-maroon focus:ring-saffron"
                            />
                            <span>{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    ) : field.type === "checkbox" ? (
                      <label className="flex items-start gap-2.5 text-xs text-zinc-700 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={Boolean(answers[field.fieldKey])}
                          onChange={(e) => handleAnswerChange(field.fieldKey, e.target.checked)}
                          className="w-4 h-4 rounded text-maroon focus:ring-saffron mt-0.5"
                        />
                        <span>{field.placeholder || field.label}</span>
                      </label>
                    ) : ["image", "video", "file"].includes(field.type) ? (
                      <div className="border-2 border-dashed border-zinc-200 rounded-xl p-4 text-center hover:border-saffron transition-colors bg-zinc-50/50">
                        <Upload className="w-5 h-5 text-zinc-400 mx-auto mb-1" />
                        <span className="text-xs font-semibold text-zinc-700 block">
                          Upload {field.type.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {field.type === "video"
                            ? "Stored securely in Google Drive"
                            : "Stored locally on server"}
                        </span>
                      </div>
                    ) : (
                      <Input
                        type={field.type === "number" ? "number" : "text"}
                        placeholder={field.placeholder}
                        value={answers[field.fieldKey] || ""}
                        onChange={(e) => handleAnswerChange(field.fieldKey, e.target.value)}
                        className="text-xs h-9"
                      />
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer Navigation */}
        {!isSubmitted && (
          <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
            <Button
              size="sm"
              variant="outline"
              disabled={currentStepIndex === 0}
              onClick={() => setCurrentStepIndex((i) => i - 1)}
              className="text-xs gap-1 border-zinc-300"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous Step</span>
            </Button>

            {currentStepIndex < steps.length - 1 ? (
              <Button
                size="sm"
                onClick={() => setCurrentStepIndex((i) => i + 1)}
                className="bg-maroon hover:bg-maroon-dark text-white text-xs gap-1 font-semibold"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => {
                  setIsSubmitted(true);
                  toast.success("Simulation Complete: All form fields validated!");
                }}
                className="bg-maroon hover:bg-maroon-dark text-white text-xs gap-1 font-bold shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Complete Registration</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


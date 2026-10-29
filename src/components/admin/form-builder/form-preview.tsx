"use client";

import React, { useState } from "react";
import { FormSchemaDefinition, FormFieldDefinition } from "@/types/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, CheckCircle2, ArrowRight, ArrowLeft, Eye, ShieldCheck, Upload } from "lucide-react";

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
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold uppercase tracking-wider text-emerald-400">
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
            <p className="text-xs text-zinc-500 mt-1 max-w-xl">{formDescription}</p>
          )}

          {/* Stepper Dots */}
          <div className="flex items-center gap-2 mt-5">
            {steps.map((st, i) => (
              <div key={st.id} className="flex items-center gap-2 flex-1">
                <div
                  className={`flex-1 h-1.5 rounded-full ${
                    i <= currentStepIndex ? "bg-emerald-600" : "bg-zinc-200"
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

        {/* Step Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {currentStepIndex === 0 && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Simulated State:</strong> Email is verified via OTP. You can navigate forward through all custom steps.
              </span>
            </div>
          )}

          {currentStep.fields.filter(isFieldVisible).map((field) => (
            <div key={field.id} className="space-y-1.5">
              {field.type === "heading" ? (
                <div className="pt-2">
                  <h3 className="font-extrabold text-base text-slate-900">{field.label}</h3>
                  {field.description && (
                    <p className="text-xs text-slate-500">{field.description}</p>
                  )}
                </div>
              ) : field.type === "divider" ? (
                <hr className="my-4 border-slate-200" />
              ) : (
                <>
                  <Label required={field.required}>{field.label}</Label>
                  {field.description && (
                    <p className="text-[11px] text-slate-400">{field.description}</p>
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
                    <select
                      value={answers[field.fieldKey] || ""}
                      onChange={(e) => handleAnswerChange(field.fieldKey, e.target.value)}
                      className="w-full h-10 rounded-lg border border-slate-200 px-3 text-xs bg-white text-slate-900"
                    >
                      <option value="">{field.placeholder || "Select an option..."}</option>
                      {(field.options || []).map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "radio" ? (
                    <div className="space-y-2 pt-1">
                      {(field.options || []).map((opt) => (
                        <label
                          key={opt.value}
                          className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name={field.fieldKey}
                            value={opt.value}
                            checked={answers[field.fieldKey] === opt.value}
                            onChange={() => handleAnswerChange(field.fieldKey, opt.value)}
                            className="text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  ) : field.type === "checkbox" ? (
                    <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={Boolean(answers[field.fieldKey])}
                        onChange={(e) => handleAnswerChange(field.fieldKey, e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-0.5"
                      />
                      <span>{field.placeholder || field.label}</span>
                    </label>
                  ) : ["image", "video", "file"].includes(field.type) ? (
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-emerald-300 transition-colors bg-slate-50/50">
                      <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                      <span className="text-xs font-semibold text-slate-700 block">
                        Upload {field.type.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-slate-400">
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

        {/* Footer Navigation */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <Button
            size="sm"
            variant="outline"
            disabled={currentStepIndex === 0}
            onClick={() => setCurrentStepIndex((i) => i - 1)}
            className="text-xs gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous Step</span>
          </Button>

          {currentStepIndex < steps.length - 1 ? (
            <Button
              size="sm"
              onClick={() => setCurrentStepIndex((i) => i + 1)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1 font-semibold"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                alert("Simulated registration submit! All fields validated.");
                onClose();
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1 font-bold"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Complete Registration</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}


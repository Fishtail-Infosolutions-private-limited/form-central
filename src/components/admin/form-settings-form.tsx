"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormStatus } from "@prisma/client";
import {
  Settings,
  AlertTriangle,
  ExternalLink,
  Users,
  Clock,
  Loader2,
  Lock,
  Unlock,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  updateFormSettingsAction,
  closeFormAction,
  reopenFormAction,
} from "@/server/actions/form-actions";
import { utcToNepalParts } from "@/lib/utils/timezone";
import { toast } from "sonner";

interface FormSettingsFormProps {
  form: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    instructions: string | null;
    status: FormStatus | string;
    opensAt: Date | null;
    closesAt: Date | null;
    isUnlimitedCapacity: boolean;
    maxParticipants: number | null;
    isDeadlineEnabled: boolean;
    registrationDeadline: Date | null;
    submissionCount: number;
  };
}

export function FormSettingsForm({ form }: FormSettingsFormProps) {
  const router = useRouter();

  // Basic Information State
  const [name, setName] = useState(form.name);
  const [slug, setSlug] = useState(form.slug);

  // Capacity State
  const [capacityType, setCapacityType] = useState<"unlimited" | "limited">(
    form.isUnlimitedCapacity ? "unlimited" : "limited"
  );
  const [maxParticipants, setMaxParticipants] = useState<string>(
    form.maxParticipants ? String(form.maxParticipants) : "500"
  );

  // Deadline State (Nepal Time)
  const [isDeadlineEnabled, setIsDeadlineEnabled] = useState(form.isDeadlineEnabled);
  const nepalParts = utcToNepalParts(form.registrationDeadline);
  const [deadlineDate, setDeadlineDate] = useState<string>(nepalParts?.dateStr || "");
  const [deadlineTime, setDeadlineTime] = useState<string>(nepalParts?.timeStr || "23:59");

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate Capacity
    if (capacityType === "limited") {
      const parsed = Number(maxParticipants);
      if (!maxParticipants || isNaN(parsed) || !Number.isInteger(parsed) || parsed < 100) {
        setErrorMessage("Maximum participant capacity must be a whole number of at least 100.");
        return;
      }
    }

    // Validate Deadline
    if (isDeadlineEnabled && !deadlineDate) {
      setErrorMessage("Please select a valid deadline date in Nepal Time.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const res = await updateFormSettingsAction(form.id, formData);
    setIsSubmitting(false);

    if (res.success) {
      toast.success("Form settings saved successfully!");
      router.refresh();
    } else {
      setErrorMessage(res.error || "Failed to update form settings");
      toast.error(res.error || "Failed to update form settings");
    }
  };

  const handleToggleCloseStatus = async () => {
    setIsTogglingStatus(true);
    if (form.status === FormStatus.CLOSED) {
      const res = await reopenFormAction(form.id);
      setIsTogglingStatus(false);
      if (res.success) {
        toast.success("Registration reopened successfully!");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to reopen registration");
      }
    } else {
      const res = await closeFormAction(form.id);
      setIsTogglingStatus(false);
      if (res.success) {
        toast.success("Registration manually closed.");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to close registration");
      }
    }
  };

  // Capacity calculation
  const isCurrentlyLimited = capacityType === "limited";
  const numCap = Number(maxParticipants);
  const isCapValid = !isNaN(numCap) && numCap > 0;
  const isAtOrOverCapacity =
    isCurrentlyLimited && isCapValid && form.submissionCount >= numCap;
  const percentage =
    isCurrentlyLimited && isCapValid
      ? Math.min(100, Math.round((form.submissionCount / numCap) * 100))
      : 0;

  return (
    <Card className="border-zinc-200 shadow-xs bg-white overflow-hidden">
      <CardHeader className="pb-4 border-b border-zinc-100 bg-zinc-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-800 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-zinc-900">
                Form Configuration & Settings
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                Configure event metadata, participant capacity limits, and registration deadlines.
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                form.status === FormStatus.PUBLISHED
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : form.status === FormStatus.CLOSED
                  ? "bg-rose-50 text-rose-800 border-rose-200"
                  : "bg-zinc-100 text-zinc-600 border-zinc-200"
              }`}
            >
              {form.status === FormStatus.PUBLISHED
                ? "Active (Published)"
                : form.status === FormStatus.CLOSED
                ? "Closed Manually"
                : form.status}
            </span>

            {/* Quick Manual Close / Reopen Button */}
            {form.status === FormStatus.CLOSED ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isTogglingStatus}
                onClick={handleToggleCloseStatus}
                className="h-7 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-semibold gap-1"
              >
                {isTogglingStatus ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Unlock className="w-3.5 h-3.5" />
                )}
                <span>Reopen Form</span>
              </Button>
            ) : form.status === FormStatus.PUBLISHED ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isTogglingStatus}
                onClick={handleToggleCloseStatus}
                className="h-7 text-xs border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold gap-1"
                title="Temporarily stop new entries"
              >
                {isTogglingStatus ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Lock className="w-3.5 h-3.5" />
                )}
                <span>Close Form</span>
              </Button>
            ) : null}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5">
        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. BASIC INFORMATION */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-900">1. Basic Information</h3>

            <div className="space-y-1.5">
              <Label htmlFor="name" required className="text-xs font-bold text-zinc-800">
                Event / Competition Name
              </Label>
              <Input
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-10 text-sm border-zinc-300"
              />
            </div>

            {/* Slug editing */}
            <div className="space-y-1.5">
              <Label htmlFor="slug" required className="text-xs font-bold text-zinc-800">
                Public Registration Slug
              </Label>
              <div className="flex rounded-lg shadow-2xs">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-zinc-200 bg-zinc-50 text-zinc-500 text-xs font-mono">
                  /register/
                </span>
                <Input
                  id="slug"
                  name="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="rounded-l-none font-mono text-sm border-zinc-300"
                  required
                />
              </div>
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs mt-1">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-zinc-500" />
                <span>
                  <strong>Note:</strong> Modifying the slug updates the public URL. Any printed QR codes or shared links pointing to the previous slug will need to be re-shared.
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-bold text-zinc-800">
                Event Description
              </Label>
              <RichTextEditor
                id="description"
                name="description"
                defaultValue={form.description}
                minHeight="120px"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="instructions" className="text-xs font-bold text-zinc-800">
                Participant Instructions (Optional)
              </Label>
              <RichTextEditor
                id="instructions"
                name="instructions"
                defaultValue={form.instructions}
                minHeight="100px"
              />
            </div>
          </div>

          {/* 2. REGISTRATION CAPACITY */}
          <div className="pt-4 border-t border-zinc-100 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>2. Registration Capacity</span>
              </h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Set whether registration is open without limit or restricted to a maximum participant cap.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  capacityType === "unlimited"
                    ? "border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-500"
                    : "border-zinc-200 bg-white hover:border-zinc-300"
                }`}
              >
                <input
                  type="radio"
                  name="capacityType"
                  value="unlimited"
                  checked={capacityType === "unlimited"}
                  onChange={() => setCapacityType("unlimited")}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="text-xs font-bold text-zinc-900 block">Unlimited Participants</span>
                  <span className="text-[11px] text-zinc-500">No participant quota limit will apply.</span>
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  capacityType === "limited"
                    ? "border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-500"
                    : "border-zinc-200 bg-white hover:border-zinc-300"
                }`}
              >
                <input
                  type="radio"
                  name="capacityType"
                  value="limited"
                  checked={capacityType === "limited"}
                  onChange={() => setCapacityType("limited")}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="text-xs font-bold text-zinc-900 block">Limited Participants</span>
                  <span className="text-[11px] text-zinc-500">Cap event entries at a specific quota (min 100).</span>
                </div>
              </label>
            </div>

            {capacityType === "limited" && (
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3 animate-in fade-in duration-150">
                <div className="space-y-1.5">
                  <Label htmlFor="maxParticipants" required className="text-xs font-bold text-zinc-800">
                    Maximum Participants (Min: 100)
                  </Label>
                  <div className="max-w-xs">
                    <Input
                      id="maxParticipants"
                      name="maxParticipants"
                      type="number"
                      min={100}
                      step={1}
                      value={maxParticipants}
                      onChange={(e) => setMaxParticipants(e.target.value)}
                      placeholder="e.g. 500"
                      className="h-10 text-sm border-zinc-300 bg-white font-mono"
                      required={capacityType === "limited"}
                    />
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Minimum allowed capacity is <strong>100</strong>. Setting a limit below the existing submission count will mark the form as full without deleting any existing records.
                  </p>
                </div>

                {/* Real-time Capacity Progress Meter */}
                <div className="p-3 rounded-lg bg-white border border-zinc-200 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-zinc-600">Current Registration Usage:</span>
                    <span className={isAtOrOverCapacity ? "text-rose-600 font-bold" : "text-emerald-700 font-bold"}>
                      {form.submissionCount} / {isCapValid ? numCap : "—"} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isAtOrOverCapacity ? "bg-rose-600" : "bg-emerald-600"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  {isAtOrOverCapacity && (
                    <p className="text-[11px] text-rose-600 font-bold">
                      • Form is currently at maximum capacity. New submissions are blocked.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 3. REGISTRATION DEADLINE (NEPAL TIME) */}
          <div className="pt-4 border-t border-zinc-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>3. Registration Deadline</span>
                </h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Timezone: <strong>Nepal Standard Time (Asia/Kathmandu) [UTC+05:45]</strong>
                </p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-lg">
                <span className="text-xs font-semibold text-zinc-800">
                  Close after deadline:
                </span>
                <input
                  type="checkbox"
                  name="isDeadlineEnabled"
                  value="true"
                  checked={isDeadlineEnabled}
                  onChange={(e) => setIsDeadlineEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-bold text-emerald-700">
                  {isDeadlineEnabled ? "ON" : "OFF"}
                </span>
              </label>
            </div>

            {isDeadlineEnabled ? (
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-150">
                <div className="space-y-1.5">
                  <Label htmlFor="deadlineDate" required className="text-xs font-bold text-zinc-800">
                    Deadline Date (Nepal Date)
                  </Label>
                  <Input
                    id="deadlineDate"
                    name="deadlineDate"
                    type="date"
                    value={deadlineDate}
                    onChange={(e) => setDeadlineDate(e.target.value)}
                    className="h-10 text-sm border-zinc-300 bg-white"
                    required={isDeadlineEnabled}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="deadlineTime" required className="text-xs font-bold text-zinc-800">
                    Deadline Time (NPT)
                  </Label>
                  <Input
                    id="deadlineTime"
                    name="deadlineTime"
                    type="time"
                    value={deadlineTime}
                    onChange={(e) => setDeadlineTime(e.target.value)}
                    className="h-10 text-sm border-zinc-300 bg-white"
                    required={isDeadlineEnabled}
                  />
                </div>

                <div className="sm:col-span-2 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
                  New participant entries will automatically stop at <strong>{deadlineTime || "23:59"} NPT</strong> on{" "}
                  <strong>{deadlineDate || "the selected date"}</strong>.
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-zinc-50 border border-dashed border-zinc-200 text-xs text-zinc-500">
                Registration deadline is currently <strong>disabled</strong>. The event remains open until manually closed or full.
              </div>
            )}
          </div>

          {/* ACTION BUTTONS */}
          <div className="pt-4 flex items-center justify-between border-t border-zinc-100">
            <Link
              href={`/register/${slug || form.slug}`}
              target="_blank"
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
            >
              <span>View Public Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-6 gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Settings...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Form Settings</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import slugify from "slugify";
import { ArrowLeft, Sparkles, Loader2, ArrowRight, Clock, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createFormAction } from "@/server/actions/form-actions";

export default function CreateFormPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugCustomized, setIsSlugCustomized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Registration Capacity State
  const [capacityType, setCapacityType] = useState<"unlimited" | "limited">("unlimited");
  const [maxParticipants, setMaxParticipants] = useState("500");

  // Registration Deadline State (Nepal Time)
  const [isDeadlineEnabled, setIsDeadlineEnabled] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("23:59");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!isSlugCustomized) {
      setSlug(slugify(val, { lower: true, strict: true }));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugCustomized(true);
    setSlug(
      e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (capacityType === "limited") {
      const parsed = Number(maxParticipants);
      if (!maxParticipants || isNaN(parsed) || !Number.isInteger(parsed) || parsed < 100) {
        setErrorMessage("Maximum participant capacity must be a whole number of at least 100.");
        return;
      }
    }

    if (isDeadlineEnabled && !deadlineDate) {
      setErrorMessage("Please select a valid deadline date in Nepal Time.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const res = await createFormAction(formData);

    if (res && res.success && res.formId) {
      router.push(`/admin/forms/${res.formId}/builder`);
    } else if (res && !res.success) {
      setErrorMessage(res.error || "Failed to create form");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/admin/forms"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Registration Forms</span>
        </Link>
      </div>

      <Card className="border-zinc-200 shadow-xs">
        <CardHeader className="pb-4 border-b border-zinc-100">
          <CardTitle className="text-xl font-bold text-zinc-900">
            Create Registration Form
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500">
            Configure event information, participant quota capacity, and Nepal timezone deadline.
          </CardDescription>
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
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <span>1. Basic Information</span>
              </h3>

              {/* Form Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name" required className="text-xs font-bold text-zinc-800">
                  Event / Competition Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={name}
                  onChange={handleNameChange}
                  placeholder="e.g. Pokhara City Marathon 2026"
                  className="h-10 text-sm border-zinc-300"
                  required
                />
              </div>

              {/* Form Slug */}
              <div className="space-y-1.5">
                <Label htmlFor="slug" required className="text-xs font-bold text-zinc-800">
                  Public URL Slug
                </Label>
                <div className="flex rounded-lg shadow-2xs">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-zinc-200 bg-zinc-50 text-zinc-500 text-xs font-mono">
                    /register/
                  </span>
                  <Input
                    id="slug"
                    name="slug"
                    value={slug}
                    onChange={handleSlugChange}
                    className="rounded-l-none font-mono text-sm border-zinc-300"
                    placeholder="pokhara-city-marathon-2026"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs font-bold text-zinc-800">
                  Event Description
                </Label>
                <RichTextEditor
                  id="description"
                  name="description"
                  placeholder="Summary of the competition, tracks, prizes, venue, or online platform..."
                  minHeight="110px"
                />
              </div>

              {/* Instructions */}
              <div className="space-y-1.5">
                <Label htmlFor="instructions" className="text-xs font-bold text-zinc-800">
                  Participant Instructions (Optional)
                </Label>
                <RichTextEditor
                  id="instructions"
                  name="instructions"
                  placeholder="Important guidelines, document checklists, or rules displayed to registrants..."
                  minHeight="90px"
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
                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2 animate-in fade-in duration-150">
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
                    The minimum allowed value is <strong>100</strong>. When this quota is reached, the public registration page will automatically reject new entries.
                  </p>
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
                    Close registration after deadline:
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
                    Registration will automatically close at <strong>{deadlineTime || "23:59"} NPT</strong> on{" "}
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
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-100">
              <Link href="/admin/forms">
                <Button type="button" variant="outline" className="text-xs h-9 border-zinc-300">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isSubmitting || !name.trim() || !slug.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 px-4 gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating Form...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Form Builder</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

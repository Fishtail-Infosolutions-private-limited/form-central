"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import slugify from "slugify";
import { ArrowLeft, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createFormAction } from "@/server/actions/form-actions";

export default function CreateFormPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugCustomized, setIsSlugCustomized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    setIsSubmitting(true);
    setErrorMessage(null);

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
    <div className="max-w-2xl mx-auto space-y-6">
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
        </CardHeader>
        <CardContent className="pt-5">
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="e.g. Pokhara Tech Hackathon 2026"
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
                  placeholder="pokhara-tech-hackathon-2026"
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
                placeholder="Detailed summary of the competition, tracks, prizes, venue, or online platform..."
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

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-zinc-100">
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
                    <span>Creating...</span>
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

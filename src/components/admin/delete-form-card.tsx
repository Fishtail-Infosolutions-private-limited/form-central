"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteFormAction } from "@/server/actions/form-actions";

interface DeleteFormCardProps {
  formId: string;
  formName: string;
  submissionCount: number;
}

export function DeleteFormCard({
  formId,
  formName,
  submissionCount,
}: DeleteFormCardProps) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    const res = await deleteFormAction(formId);
    setIsDeleting(false);

    if (res.success) {
      router.push("/admin/forms");
    } else {
      setError(res.error || "Failed to delete form");
    }
  };

  return (
    <Card className="border-cream-dark bg-white shadow-xs overflow-hidden mt-8">
      <CardHeader className="bg-soft-cream/70 border-b border-cream-dark pb-4">
        <div className="flex items-center gap-2 text-maroon font-bold text-xs uppercase tracking-wider">
          <Trash2 className="w-4 h-4 text-maroon" />
          <span>Danger Zone</span>
        </div>
        <CardTitle className="text-lg font-bold text-maroon">
          Delete This Registration Form
        </CardTitle>
        <CardDescription className="text-xs text-stone-500">
          Permanently delete &quot;{formName}&quot; and all of its associated version snapshots, participant responses, and uploaded file records.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {error && (
          <div className="p-3 bg-soft-cream border border-rose-200 rounded-xl text-xs text-maroon flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-maroon shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {submissionCount > 0 && (
          <div className="p-3 bg-soft-cream border border-cream-dark rounded-xl text-xs text-maroon">
            <strong>Warning:</strong> This form currently contains{" "}
            <strong>{submissionCount} participant submission(s)</strong>. Deleting will permanently remove them from the system.
          </div>
        )}

        {!isConfirming ? (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirming(true)}
              className="text-maroon hover:text-maroon hover:bg-rose-50 border-cream-dark text-xs font-bold gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Form</span>
            </Button>
          </div>
        ) : (
          <div className="p-4 bg-soft-cream border border-rose-200 rounded-xl space-y-3">
            <p className="text-xs font-bold text-maroon">
              Confirm Deletion: Are you absolutely sure? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsConfirming(false)}
                disabled={isDeleting}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-maroon hover:bg-maroon-dark text-white font-bold text-xs gap-1.5 px-4 shadow-sm"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Deleting Form...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5 text-white" />
                    <span>Yes, Permanently Delete</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


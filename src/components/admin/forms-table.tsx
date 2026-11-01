"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileEdit,
  Copy,
  Check,
  ExternalLink,
  Inbox,
  Trash2,
  AlertTriangle,
  Loader2,
  X,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  publishFormAction,
  unpublishFormAction,
  deleteFormAction,
} from "@/server/actions/form-actions";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface FormItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    submissions: number;
  };
}

export function FormsTable({ forms }: { forms: FormItem[] }) {
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [formToDelete, setFormToDelete] = useState<FormItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const copyPublicUrl = async (e: React.MouseEvent, form: FormItem) => {
    e.stopPropagation();
    const url = `${window.location.origin}/register/${form.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(form.id);
      toast.success("Public link copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      prompt("Copy public URL:", url);
    }
  };

  const handleToggleStatus = async (e: React.MouseEvent, form: FormItem) => {
    e.stopPropagation();
    setTogglingId(form.id);
    const isCurrentlyActive = form.status === "PUBLISHED";
    let res;
    if (isCurrentlyActive) {
      res = await unpublishFormAction(form.id);
    } else {
      res = await publishFormAction(form.id);
    }
    setTogglingId(null);

    if (res && !res.success) {
      toast.error(res.error || "Failed to update form status");
    } else {
      toast.success(isCurrentlyActive ? "Form deactivated" : "Form activated & accepting submissions");
      router.refresh();
    }
  };

  const handleConfirmDelete = async () => {
    if (!formToDelete) return;
    setIsDeleting(true);
    const res = await deleteFormAction(formToDelete.id);
    setIsDeleting(false);
    if (!res.success) {
      toast.error(res.error || "Failed to delete form");
    } else {
      toast.success(`"${formToDelete.name}" deleted successfully`);
      setFormToDelete(null);
      router.refresh();
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-500 text-xs font-semibold uppercase tracking-wider border-b border-zinc-200">
              <tr>
                <th className="px-5 py-3.5">Event / Form Name</th>
                <th className="px-5 py-3.5">Public URL</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-center">Submissions</th>
                <th className="px-5 py-3.5">Last Updated</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {forms.map((form) => {
                const isActive = form.status === "PUBLISHED";
                const isToggling = togglingId === form.id;

                return (
                  <tr
                    key={form.id}
                    onClick={() => router.push(`/admin/forms/${form.id}`)}
                    className="hover:bg-zinc-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <div className="font-bold text-zinc-900 text-sm group-hover:text-saffron transition-colors">
                        {form.name}
                      </div>
                      <p className="text-xs text-zinc-500 line-clamp-1 max-w-sm mt-0.5">
                        {form.description || "No description provided"}
                      </p>
                    </td>

                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                          /register/{form.slug}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => copyPublicUrl(e, form)}
                          className="text-zinc-400 hover:text-saffron p-1 rounded hover:bg-zinc-100 transition-colors"
                          title="Copy public URL"
                        >
                          {copiedId === form.id ? (
                            <Check className="w-3.5 h-3.5 text-saffron" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <Link
                          href={`/register/${form.slug}`}
                          target="_blank"
                          onClick={(e) => e.stopPropagation()}
                          className="text-zinc-400 hover:text-saffron p-1 rounded hover:bg-zinc-100 transition-colors"
                          title="Open live public form in new tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => handleToggleStatus(e, form)}
                        disabled={isToggling}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all shadow-2xs border ${
                          isActive
                            ? "bg-soft-cream text-maroon border-saffron hover:bg-soft-cream/80"
                            : "bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200"
                        }`}
                        title={isActive ? "Click to deactivate form" : "Click to activate form"}
                      >
                        {isToggling ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-saffron" />
                        ) : (
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isActive ? "bg-saffron" : "bg-zinc-400"
                            }`}
                          />
                        )}
                        <span>{isActive ? "Active" : "Inactive"}</span>
                      </button>
                    </td>

                    <td className="px-5 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <Link
                        href={`/admin/forms/${form.id}/responses`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 hover:bg-soft-cream hover:text-maroon text-xs font-bold text-zinc-700 transition-colors"
                        title="View Submissions"
                      >
                        <Inbox className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{form._count.submissions}</span>
                      </Link>
                    </td>

                    <td className="px-5 py-4 text-xs text-zinc-500 whitespace-nowrap">
                      {formatDateTime(form.updatedAt)}
                    </td>

                    <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/admin/forms/${form.id}`}>
                          <Button
                            size="sm"
                            className="bg-maroon hover:bg-maroon-dark text-white font-bold gap-1 text-xs h-8 px-2.5 shadow-2xs"
                            title="Edit Form (Name, Slug, Capacity, Deadline, Settings)"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </Button>
                        </Link>

                        <Link href={`/admin/forms/${form.id}/builder`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-zinc-700 text-xs h-8 px-2 gap-1 border-zinc-200 hover:bg-zinc-100"
                            title="Form Canvas Builder"
                          >
                            <FileEdit className="w-3.5 h-3.5 text-zinc-500" />
                            <span className="hidden sm:inline">Builder</span>
                          </Button>
                        </Link>

                        <Link href={`/admin/forms/${form.id}/responses`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-zinc-700 text-xs h-8 px-2.5 gap-1 border-zinc-200"
                            title="View Responses"
                          >
                            <Inbox className="w-3.5 h-3.5" />
                            <span>Responses</span>
                          </Button>
                        </Link>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setFormToDelete(form)}
                          className="text-zinc-400 hover:text-red-600 hover:bg-red-50 text-xs h-8 w-8 p-0"
                          title="Delete Form"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Popup Modal */}
      <AnimatePresence>
        {formToDelete && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-zinc-200"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <button
                    onClick={() => setFormToDelete(null)}
                    disabled={isDeleting}
                    className="text-zinc-400 hover:text-black p-1 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-zinc-900 mb-1">
                  Delete Registration Form?
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed mb-4">
                  Are you sure you want to delete{" "}
                  <strong className="text-zinc-900 font-semibold">
                    &quot;{formToDelete.name}&quot;
                  </strong>
                  ? All form versions, questions, and {formToDelete._count.submissions} participant
                  submission records will be permanently removed. This action cannot be undone.
                </p>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormToDelete(null)}
                    disabled={isDeleting}
                    className="text-xs font-semibold h-9 border-zinc-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs h-9 gap-1.5"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Confirm & Delete</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Video,
  FileText,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  X,
  Mail,
  Phone,
  Send,
  Loader2,
  AlertTriangle,
  RotateCcw,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateTime } from "@/lib/utils";
import {
  toggleSubmissionReadStatusAction,
  markSubmissionAsReadAction,
  sendRegistrationEmailNoticeAction,
} from "@/server/actions/response-actions";
import { SubmissionStatus } from "@prisma/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface SubmissionItem {
  id: string;
  referenceNumber: string;
  fullName: string;
  email: string;
  phone: string;
  status: SubmissionStatus;
  submittedAt: Date;
  form: {
    id: string;
    name: string;
    slug: string;
  };
  answers: {
    id: string;
    fieldKey: string;
    fieldLabel: string;
    fieldType: string;
    value: any;
  }[];
  uploadedFiles: {
    id: string;
    fieldKey: string;
    originalName: string;
    storageProvider: string;
    storagePath: string;
    driveFileId: string | null;
    mimeType: string;
    fileSize: number;
  }[];
  campaignRecipients?: {
    id: string;
    status: string;
    attemptCount: number;
    lastError: string | null;
    sentAt: Date | string | null;
    deliveredAt: Date | string | null;
    campaign: {
      id: string;
      name: string;
      subject: string;
    };
  }[];
}

interface ResponsesTableViewProps {
  submissions: SubmissionItem[];
  forms: { id: string; name: string }[];
  currentFormId?: string;
}

export function ResponsesTableView({
  submissions,
  forms,
  currentFormId,
}: ResponsesTableViewProps) {
  const [submissionList, setSubmissionList] = useState<SubmissionItem[]>(submissions);
  const [searchTerm, setSearchTerm] = useState("");
  const [readFilter, setReadFilter] = useState<"ALL" | "UNREAD" | "READ">("ALL");
  const [selectedFormId, setSelectedFormId] = useState<string>(currentFormId || "ALL");
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // In-site Video Player Modal State
  const [activeVideoFile, setActiveVideoFile] = useState<SubmissionItem["uploadedFiles"][0] | null>(null);

  // Email Notice Modal State
  const [emailModalSubmission, setEmailModalSubmission] = useState<SubmissionItem | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Update submissionList if props change
  React.useEffect(() => {
    setSubmissionList(submissions);
  }, [submissions]);

  // Filter submissions by search, form, and read/unread status
  const filteredSubmissions = useMemo(() => {
    return submissionList.filter((sub) => {
      const matchesSearch =
        sub.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.phone.includes(searchTerm) ||
        sub.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const isRead = sub.status === SubmissionStatus.APPROVED;
      const matchesRead =
        readFilter === "ALL" ||
        (readFilter === "READ" && isRead) ||
        (readFilter === "UNREAD" && !isRead);

      const matchesForm = selectedFormId === "ALL" || sub.form.id === selectedFormId;

      return matchesSearch && matchesRead && matchesForm;
    });
  }, [submissionList, searchTerm, readFilter, selectedFormId]);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success("Reference copied");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      prompt("Copy:", text);
    }
  };

  const handleToggleReadStatus = async (sub: SubmissionItem) => {
    setTogglingId(sub.id);
    const res = await toggleSubmissionReadStatusAction(sub.id);
    setTogglingId(null);

    if (res.success && res.submission) {
      const updatedStatus = res.submission.status;
      setSubmissionList((prev) =>
        prev.map((s) => (s.id === sub.id ? { ...s, status: updatedStatus } : s))
      );
      if (selectedSubmission?.id === sub.id) {
        setSelectedSubmission((prev) => (prev ? { ...prev, status: updatedStatus } : null));
      }
      toast.success(res.isRead ? "Marked as Read" : "Marked as Unread");
    } else {
      toast.error(res.error || "Failed to update status");
    }
  };

  const handleSelectSubmission = (sub: SubmissionItem) => {
    setSelectedSubmission(sub);
    // Auto mark as read when inspected if currently unread
    if (sub.status !== SubmissionStatus.APPROVED) {
      setSubmissionList((prev) =>
        prev.map((s) => (s.id === sub.id ? { ...s, status: SubmissionStatus.APPROVED } : s))
      );
      setSelectedSubmission((prev) =>
        prev && prev.id === sub.id ? { ...prev, status: SubmissionStatus.APPROVED } : prev
      );
      markSubmissionAsReadAction(sub.id).catch(console.error);
    }
  };

  const handleOpenEmailModal = (sub: SubmissionItem, defaultType: "reject" | "general" = "general") => {
    setEmailModalSubmission(sub);
    if (defaultType === "reject") {
      setEmailSubject("Registration Application Status: Unable to Approve");
      setEmailMessage(
        `Dear ${sub.fullName},\n\nThank you for your interest and registration for "${sub.form.name}".\n\nAfter reviewing your registration submission (Reference: ${sub.referenceNumber}), we regret to inform you that we are unable to accept your application at this time.\n\nReason: Details or uploaded credentials do not fulfill the required participation criteria.\n\nIf you have any questions or would like to submit updated information, please reply directly to this email.\n\nSincerely,\nEvent Organizing Committee`
      );
    } else {
      setEmailSubject(`Registration Update: ${sub.form.name}`);
      setEmailMessage(
        `Dear ${sub.fullName},\n\nWe are writing regarding your registration for "${sub.form.name}" (Reference: ${sub.referenceNumber}).\n\n[Please enter your message or event update here]\n\nBest regards,\nEvent Operations Team`
      );
    }
  };

  const handleSendEmail = async () => {
    if (!emailModalSubmission) return;
    if (!emailSubject.trim() || !emailMessage.trim()) {
      toast.error("Please provide both a subject and message content");
      return;
    }

    setIsSendingEmail(true);
    const res = await sendRegistrationEmailNoticeAction({
      submissionId: emailModalSubmission.id,
      subject: emailSubject,
      messageText: emailMessage,
    });
    setIsSendingEmail(false);

    if (res.success) {
      toast.success(`Notice successfully delivered to ${emailModalSubmission.email}`);
      setEmailModalSubmission(null);
    } else {
      toast.error(res.error || "Failed to deliver email");
    }
  };

  const getExportUrl = () => {
    const params = new URLSearchParams();
    if (selectedFormId !== "ALL") params.set("formId", selectedFormId);
    if (readFilter !== "ALL") {
      params.set("status", readFilter === "READ" ? "APPROVED" : "PENDING");
    }
    return `/api/admin/export?${params.toString()}`;
  };

  const unreadCount = submissionList.filter((s) => s.status !== SubmissionStatus.APPROVED).length;
  const readCount = submissionList.filter((s) => s.status === SubmissionStatus.APPROVED).length;

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search participant, email, phone, reference..."
              className="pl-9 text-xs h-10 border-zinc-200 bg-white"
            />
          </div>

          {/* Form Filter */}
          {!currentFormId && (
            <div className="w-[240px]">
              <Select value={selectedFormId} onValueChange={(val) => setSelectedFormId(val)}>
                <SelectTrigger className="h-10 text-xs border-cream-dark bg-white text-zinc-800">
                  <SelectValue placeholder="All Events & Competitions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Events &amp; Competitions ({submissions.length})</SelectItem>
                  {forms.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Read / Unread Status Filter */}
          <div className="inline-flex rounded-lg border border-zinc-200 p-0.5 bg-zinc-50 shrink-0">
            <button
              type="button"
              onClick={() => setReadFilter("ALL")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                readFilter === "ALL"
                  ? "bg-white text-zinc-900 shadow-2xs font-bold"
                  : "text-zinc-600 hover:text-black"
              }`}
            >
              All ({submissionList.length})
            </button>
            <button
              type="button"
              onClick={() => setReadFilter("UNREAD")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                readFilter === "UNREAD"
                  ? "bg-white text-maroon shadow-2xs font-bold"
                  : "text-zinc-600 hover:text-black"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-saffron" />
              <span>Unread ({unreadCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setReadFilter("READ")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                readFilter === "READ"
                  ? "bg-white text-zinc-900 shadow-2xs font-bold"
                  : "text-zinc-600 hover:text-black"
              }`}
            >
              Read ({readCount})
            </button>
          </div>
        </div>

        {/* Excel Export Button */}
        <a href={getExportUrl()} download>
          <Button className="bg-maroon hover:bg-maroon-dark text-white font-semibold text-xs h-10 gap-2 shrink-0">
            <Download className="w-4 h-4" />
            <span>Export to Excel (.xlsx)</span>
          </Button>
        </a>
      </div>

      {/* Responses Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-500 text-xs font-semibold uppercase tracking-wider border-b border-zinc-200">
              <tr>
                <th className="px-5 py-3.5">Reference & Participant</th>
                <th className="px-5 py-3.5">Event / Form</th>
                <th className="px-5 py-3.5">Contact Details</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5">Submitted</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-zinc-400 text-xs">
                    No registrations found matching your query criteria.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => {
                  const isRead = sub.status === SubmissionStatus.APPROVED;
                  const isToggling = togglingId === sub.id;

                  return (
                    <tr
                      key={sub.id}
                      onClick={() => handleSelectSubmission(sub)}
                      className="hover:bg-zinc-50/80 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="font-bold text-zinc-900 text-sm">{sub.fullName}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-xs text-maroon font-bold bg-soft-cream px-1.5 py-0.2 rounded border border-saffron">
                            {sub.referenceNumber}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(sub.referenceNumber, sub.id);
                            }}
                            className="text-zinc-400 hover:text-saffron p-0.5"
                            title="Copy reference"
                          >
                            {copiedId === sub.id ? (
                              <Check className="w-3 h-3 text-saffron" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-xs font-medium text-zinc-700">
                        {sub.form.name}
                      </td>

                      <td className="px-5 py-4 text-xs space-y-0.5 text-zinc-500 font-mono">
                        <div>{sub.email}</div>
                        <div>{sub.phone}</div>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            isRead
                              ? "bg-zinc-100 text-zinc-600 border-zinc-200"
                              : "bg-soft-cream text-maroon border-saffron font-bold"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isRead ? "bg-zinc-400" : "bg-saffron animate-pulse"
                            }`}
                          />
                          <span>{isRead ? "Read" : "Unread"}</span>
                        </span>
                      </td>

                      <td className="px-5 py-4 text-xs text-zinc-500 whitespace-nowrap">
                        {formatDateTime(sub.submittedAt)}
                      </td>

                      <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {sub.uploadedFiles.some(
                            (f) => f.storageProvider === "GOOGLE_DRIVE" || f.mimeType.startsWith("video/")
                          ) && (
                            <Button
                              size="sm"
                              onClick={() => {
                                const vFile = sub.uploadedFiles.find(
                                  (f) => f.storageProvider === "GOOGLE_DRIVE" || f.mimeType.startsWith("video/")
                                );
                                if (vFile) setActiveVideoFile(vFile);
                              }}
                              className="bg-maroon hover:bg-maroon-dark text-white font-bold text-xs h-8 px-2.5 gap-1 shadow-2xs"
                              title="Play participant video in site"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Play Video</span>
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSelectSubmission(sub)}
                            className="text-saffron hover:bg-soft-cream font-semibold text-xs h-8 px-2.5 gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect</span>
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEmailModal(sub, "general")}
                            className="text-zinc-700 hover:text-black hover:bg-zinc-100 border-zinc-200 text-xs h-8 px-2.5 gap-1"
                            title="Send email notice to participant"
                          >
                            <Mail className="w-3.5 h-3.5 text-zinc-500" />
                            <span>Notice</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submission Detail Modal */}
      <AnimatePresence>
        {selectedSubmission && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-zinc-200"
            >
              {/* Modal Header */}
              <div className="p-5 bg-black text-white flex items-start justify-between border-b border-zinc-800">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs text-saffron font-bold bg-maroon px-2 py-0.5 rounded border border-antique-gold/40">
                      {selectedSubmission.referenceNumber}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase border ${
                        selectedSubmission.status === SubmissionStatus.APPROVED
                          ? "bg-zinc-800 text-zinc-300 border-zinc-700"
                          : "bg-maroon text-warm-ivory border-saffron"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          selectedSubmission.status === SubmissionStatus.APPROVED
                            ? "bg-zinc-400"
                            : "bg-saffron animate-pulse"
                        }`}
                      />
                      <span>
                        {selectedSubmission.status === SubmissionStatus.APPROVED ? "Read" : "Unread"}
                      </span>
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white">{selectedSubmission.fullName}</h3>
                  <p className="text-xs text-zinc-400">{selectedSubmission.form.name}</p>
                </div>

                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                {/* Contact Records */}
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                    Participant Contact Information
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-zinc-500 block">Full Legal Name:</span>
                      <span className="font-bold text-zinc-900 text-sm">
                        {selectedSubmission.fullName}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Submitted At:</span>
                      <span className="font-medium text-zinc-700">
                        {formatDateTime(selectedSubmission.submittedAt)}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Verified Email:</span>
                      <span className="font-mono text-zinc-900 font-medium">
                        {selectedSubmission.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Mobile Phone:</span>
                      <span className="font-mono text-zinc-900 font-medium">
                        {selectedSubmission.phone}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dynamic Answers */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                    Form Responses ({selectedSubmission.answers.length})
                  </span>

                  {selectedSubmission.answers.length === 0 ? (
                    <p className="text-zinc-400 italic">No additional questions answered.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedSubmission.answers.map((ans) => {
                        const matchingFile = selectedSubmission.uploadedFiles.find(
                          (f) =>
                            f.fieldKey === ans.fieldKey ||
                            f.driveFileId === String(ans.value) ||
                            f.storagePath === String(ans.value) ||
                            (typeof ans.value === "string" &&
                              (ans.value.includes(f.originalName) || f.originalName.includes(ans.value)))
                        );

                        return (
                          <div
                            key={ans.id}
                            className="p-3 rounded-lg border border-zinc-200 bg-white space-y-1.5"
                          >
                            <span className="text-zinc-500 text-[11px] block font-medium">
                              {ans.fieldLabel}
                            </span>
                            {matchingFile ? (
                              <div className="flex items-center justify-between gap-2 pt-0.5">
                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-soft-cream text-maroon border border-saffron text-xs font-semibold truncate max-w-[200px]">
                                  {matchingFile.storageProvider === "GOOGLE_DRIVE" ||
                                  matchingFile.mimeType.startsWith("video/") ? (
                                    <Video className="w-3.5 h-3.5 text-saffron shrink-0" />
                                  ) : (
                                    <FileText className="w-3.5 h-3.5 text-saffron shrink-0" />
                                  )}
                                  <span className="truncate">{matchingFile.originalName}</span>
                                </span>
                                {matchingFile.storageProvider === "GOOGLE_DRIVE" ||
                                matchingFile.mimeType.startsWith("video/") ? (
                                  <Button
                                    size="sm"
                                    onClick={() => setActiveVideoFile(matchingFile)}
                                    className="h-7 text-[11px] font-bold bg-maroon hover:bg-maroon-dark text-white px-2 gap-1 shrink-0"
                                  >
                                    <Play className="w-3 h-3 fill-current" />
                                    <span>Play</span>
                                  </Button>
                                ) : (
                                  <a href={matchingFile.storagePath} target="_blank" rel="noreferrer">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 text-[11px] px-2 gap-1 border-zinc-300 shrink-0"
                                    >
                                      <span>View</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </Button>
                                  </a>
                                )}
                              </div>
                            ) : (
                              <div className="font-semibold text-zinc-900 text-xs break-words">
                                {typeof ans.value === "boolean"
                                  ? ans.value
                                    ? "Yes / Accepted"
                                    : "No"
                                  : Array.isArray(ans.value)
                                  ? ans.value.join(", ")
                                  : String(ans.value || "-")}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Uploaded Files & Drive Videos */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                    Attached Media & Files ({selectedSubmission.uploadedFiles.length})
                  </span>

                  {selectedSubmission.uploadedFiles.length === 0 ? (
                    <p className="text-zinc-400 italic">No media uploaded.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedSubmission.uploadedFiles.map((file) => (
                        <div
                          key={file.id}
                          className="p-3 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            {file.storageProvider === "GOOGLE_DRIVE" ? (
                              <div className="w-9 h-9 rounded-lg bg-soft-cream text-saffron flex items-center justify-center">
                                <Video className="w-5 h-5" />
                              </div>
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-zinc-200 text-zinc-800 flex items-center justify-center">
                                <FileText className="w-5 h-5" />
                              </div>
                            )}

                            <div>
                              <span className="font-bold text-zinc-900 block truncate max-w-xs">
                                {file.originalName}
                              </span>
                              <span className="text-[11px] text-zinc-500">
                                {file.storageProvider === "GOOGLE_DRIVE"
                                  ? "Google Drive Video"
                                  : file.mimeType.includes("pdf")
                                  ? "Document (PDF)"
                                  : "Image File"}{" "}
                                &bull; {(file.fileSize / (1024 * 1024)).toFixed(1)} MB
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {file.storageProvider === "GOOGLE_DRIVE" || file.mimeType.startsWith("video/") ? (
                              <Button
                                size="sm"
                                onClick={() => setActiveVideoFile(file)}
                                className="h-8 text-xs gap-1.5 font-bold bg-maroon hover:bg-maroon-dark text-white shadow-2xs"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Play Video</span>
                              </Button>
                            ) : (
                              <a href={file.storagePath} target="_blank" rel="noreferrer">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-xs gap-1 font-semibold border-zinc-300"
                                >
                                  <span>View File</span>
                                  <ExternalLink className="w-3 h-3" />
                                </Button>
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Participant Email Delivery History */}
                <div className="space-y-3 pt-4 border-t border-zinc-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-saffron" />
                      <span>Email Delivery History ({selectedSubmission.campaignRecipients?.length || 0})</span>
                    </span>
                  </div>

                  {!selectedSubmission.campaignRecipients || selectedSubmission.campaignRecipients.length === 0 ? (
                    <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-center text-zinc-400 text-xs">
                      No automated campaign or notification emails have been sent to this participant yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedSubmission.campaignRecipients.map((rec) => (
                        <div
                          key={rec.id}
                          className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-zinc-900 text-xs truncate">
                                {rec.campaign.subject}
                              </span>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  rec.status === "DELIVERED"
                                    ? "bg-soft-cream text-maroon"
                                    : rec.status === "SENT"
                                    ? "bg-soft-cream text-maroon border border-saffron"
                                    : rec.status === "FAILED" || rec.status === "BOUNCED"
                                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                                    : rec.status === "SKIPPED"
                                    ? "bg-zinc-200 text-zinc-700"
                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                                }`}
                              >
                                {rec.status}
                              </span>
                            </div>
                            <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                              <span>Campaign: <strong>{rec.campaign.name}</strong></span>
                              <span>&bull;</span>
                              <span>
                                {rec.sentAt ? formatDateTime(new Date(rec.sentAt)) : "Queued"}
                              </span>
                            </div>
                            {rec.lastError && (
                              <p className="text-[10px] text-rose-600 mt-1 truncate" title={rec.lastError}>
                                Error: {rec.lastError}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer: Email Notice & Status */}
              <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between gap-3">
                <span className="text-[11px] text-zinc-400">
                  Status: Automatically marked as Read
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenEmailModal(selectedSubmission, "reject")}
                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 h-8 font-semibold"
                  >
                    Send Rejection Email
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => handleOpenEmailModal(selectedSubmission, "general")}
                    className="bg-maroon hover:bg-maroon-dark text-white text-xs h-8 font-bold gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Send Email Notice</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Compose Email Notice Modal */}
      <AnimatePresence>
        {emailModalSubmission && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-zinc-200"
            >
              <div className="p-5 bg-black text-white flex items-center justify-between border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-maroon text-saffron border border-antique-gold/30 flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Send Email Notice</h3>
                    <p className="text-[11px] text-zinc-400">Delivered directly via SMTP</p>
                  </div>
                </div>
                <button
                  onClick={() => setEmailModalSubmission(null)}
                  disabled={isSendingEmail}
                  className="text-zinc-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs">
                {/* Recipient */}
                <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                  <span className="text-zinc-500 font-medium">Recipient:</span>
                  <span className="font-mono font-semibold text-zinc-900">
                    {emailModalSubmission.fullName} &lt;{emailModalSubmission.email}&gt;
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700">Quick Template Presets:</Label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEmailModal(emailModalSubmission, "reject")}
                      className="text-[11px] px-2.5 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold border border-zinc-200 transition-colors"
                    >
                      Rejection Notice
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEmailModal(emailModalSubmission, "general")}
                      className="text-[11px] px-2.5 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold border border-zinc-200 transition-colors"
                    >
                      General Update
                    </button>
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <Label htmlFor="emailSubject" className="text-xs font-semibold text-zinc-800">
                    Email Subject
                  </Label>
                  <Input
                    id="emailSubject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Enter email subject line..."
                    className="h-9 text-xs border-zinc-300 bg-white"
                  />
                </div>

                {/* Message Body */}
                <div className="space-y-1.5">
                  <Label htmlFor="emailMessage" className="text-xs font-semibold text-zinc-800">
                    Message Body
                  </Label>
                  <Textarea
                    id="emailMessage"
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    rows={7}
                    placeholder="Write your email message..."
                    className="text-xs border-zinc-300 bg-white leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEmailModalSubmission(null)}
                    disabled={isSendingEmail}
                    className="text-xs font-semibold h-9 border-zinc-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSendEmail}
                    disabled={isSendingEmail}
                    className="bg-maroon hover:bg-maroon-dark text-white font-semibold text-xs h-9 gap-1.5 px-4"
                  >
                    {isSendingEmail ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending Email...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Email Notice</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* In-Site Video Player Modal */}
      <AnimatePresence>
        {activeVideoFile && (
          <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="bg-black rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-zinc-800 flex flex-col"
            >
              {/* Video Header */}
              <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between text-white">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-maroon text-saffron border border-antique-gold/40 flex items-center justify-center shrink-0">
                    <Video className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-white truncate max-w-md">
                      {activeVideoFile.originalName}
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      In-Site Video Playback &bull; {(activeVideoFile.fileSize / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveVideoFile(null)}
                  className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
                  title="Close Player"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Video Player Frame */}
              <div className="relative aspect-video w-full bg-black flex items-center justify-center">
                {activeVideoFile.storageProvider === "GOOGLE_DRIVE" ? (
                  <iframe
                    src={`https://drive.google.com/file/d/${activeVideoFile.driveFileId}/preview`}
                    className="w-full h-full border-0"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={activeVideoFile.storagePath}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              {/* Video Footer */}
              <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                <span className="flex items-center gap-1.5 text-saffron font-semibold">
                  <span className="w-2 h-2 rounded-full bg-saffron animate-pulse" />
                  <span>Playing video directly inside Mithila Queen Portal</span>
                </span>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveVideoFile(null)}
                  className="text-xs h-8 border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white"
                >
                  Close Player
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

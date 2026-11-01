"use client";

import React, { useState } from "react";
import {
  Search,
  Crown,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  FileDown,
  Loader2,
  ExternalLink,
  Phone,
  Mail,
  User,
  Heart,
  Calendar,
  MapPin,
  Lock,
  Download,
  Filter,
  Check,
  X,
  CreditCard,
  FileCheck2,
  Eye,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  adminVerifyPaymentAction,
  adminAdjudicateApplicationAction,
  downloadApprovedPdfAction,
} from "@/server/actions/mithila-queen-actions";
import { formatNepalDateTime } from "@/lib/utils/timezone";

export interface MithilaQueenApplicant {
  id: string;
  registrationId: string;
  fullName: string;
  dob: Date;
  isMinor: boolean;
  email: string;
  phone: string;
  alternatePhone?: string | null;
  province: string;
  district: string;
  municipality: string;
  cityVillage: string;
  currentAddress: string;

  guardianName?: string | null;
  guardianPhone?: string | null;
  guardianRelation?: string | null;
  guardianEmail?: string | null;
  guardianConsentRecorded: boolean;

  personalIntro?: string | null;
  hobbiesInterests?: string | null;
  talentsSkills?: string | null;
  languagesSpoken?: string | null;
  culturalInterests?: string | null;
  motivationReason?: string | null;
  mithilaMeaning?: string | null;
  qualitiesBrought?: string | null;
  educationLevel?: string | null;
  institution?: string | null;
  previousExperience: boolean;
  experienceDetails?: string | null;

  instagramHandle?: string | null;
  tiktokHandle?: string | null;
  facebookUrl?: string | null;
  profilePhotoUrl?: string | null;
  videoUrl?: string | null;
  documentUrl?: string | null;

  registrationFee: number;
  paymentStatus: string;
  paymentReference?: string | null;
  paymentScreenshotUrl?: string | null;
  paymentSubmittedAt?: Date | null;
  paymentVerifiedAt?: Date | null;
  paymentClarificationNotes?: string | null;

  applicationStatus: string;
  rejectionReason?: string | null;
  actionRequiredDetails?: string | null;
  privateAdminNotes?: string | null;
  pdfGeneratedAt?: Date | null;
  submittedAt: Date;
}

export function MithilaQueenApplicationsView({
  applications,
}: {
  applications: MithilaQueenApplicant[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [appFilter, setAppFilter] = useState("ALL");
  const [selectedApp, setSelectedApp] = useState<MithilaQueenApplicant | null>(null);

  // Verification & Decision State
  const [actionNotes, setActionNotes] = useState("");
  const [privateNotes, setPrivateNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter list
  const filtered = applications.filter((app) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      app.fullName.toLowerCase().includes(q) ||
      app.registrationId.toLowerCase().includes(q) ||
      app.email.toLowerCase().includes(q) ||
      app.phone.includes(q) ||
      app.district.toLowerCase().includes(q);

    const matchesPayment = paymentFilter === "ALL" || app.paymentStatus === paymentFilter;
    const matchesApp = appFilter === "ALL" || app.applicationStatus === appFilter;

    return matchesSearch && matchesPayment && matchesApp;
  });

  // Verify Payment
  const handleVerifyPayment = async (decision: "VERIFY" | "REQUEST_CLARIFICATION") => {
    if (!selectedApp) return;
    setIsProcessing(true);

    const res = await adminVerifyPaymentAction({
      registrationId: selectedApp.registrationId,
      decision,
      notes: actionNotes,
    });
    setIsProcessing(false);

    if (res.success) {
      toast.success(
        decision === "VERIFY"
          ? "Payment verified! Application advanced to review."
          : "Payment clarification requested from participant."
      );
      setSelectedApp({
        ...selectedApp,
        paymentStatus: decision === "VERIFY" ? "VERIFIED" : "CLARIFICATION_REQUIRED",
        applicationStatus: decision === "VERIFY" ? "UNDER_REVIEW" : selectedApp.applicationStatus,
      });
      setActionNotes("");
    } else {
      toast.error(res.error || "Failed to update payment status.");
    }
  };

  // Adjudicate Application
  const handleAdjudicate = async (decision: "APPROVE" | "REJECT" | "ACTION_REQUIRED") => {
    if (!selectedApp) return;

    if (decision === "APPROVE" && selectedApp.paymentStatus !== "VERIFIED") {
      toast.error("Security rule: Payment must be independently verified before application approval.");
      return;
    }

    setIsProcessing(true);
    const res = await adminAdjudicateApplicationAction({
      registrationId: selectedApp.registrationId,
      decision,
      reason: actionNotes,
      privateNotes,
    });
    setIsProcessing(false);

    if (res.success) {
      toast.success(
        decision === "APPROVE"
          ? "Application approved and Confirmation PDF generated!"
          : decision === "REJECT"
          ? "Application marked as rejected."
          : "Action required details sent."
      );
      setSelectedApp({
        ...selectedApp,
        applicationStatus: decision === "APPROVE" ? "APPROVED" : decision === "REJECT" ? "REJECTED" : "ACTION_REQUIRED",
      });
      setActionNotes("");
    } else {
      toast.error(res.error || "Adjudication failed.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-md border border-zinc-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, ID (MQ-...), email, phone..."
            className="pl-9 h-10 text-xs border-zinc-200 bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Payment Filter */}
          <div className="w-[170px]">
            <Select value={paymentFilter} onValueChange={(val) => setPaymentFilter(val)}>
              <SelectTrigger className="h-10 text-xs border-cream-dark bg-white font-medium">
                <SelectValue placeholder="Payment: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Payment: All</SelectItem>
                <SelectItem value="PENDING">Payment: Pending</SelectItem>
                <SelectItem value="UNDER_REVIEW">Payment: Under Review</SelectItem>
                <SelectItem value="VERIFIED">Payment: Verified</SelectItem>
                <SelectItem value="CLARIFICATION_REQUIRED">Payment: Clarification</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Application Filter */}
          <div className="w-[175px]">
            <Select value={appFilter} onValueChange={(val) => setAppFilter(val)}>
              <SelectTrigger className="h-10 text-xs border-cream-dark bg-white font-medium">
                <SelectValue placeholder="Application: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Application: All</SelectItem>
                <SelectItem value="SUBMITTED">App: Submitted</SelectItem>
                <SelectItem value="UNDER_REVIEW">App: Under Review</SelectItem>
                <SelectItem value="APPROVED">App: Approved</SelectItem>
                <SelectItem value="REJECTED">App: Rejected</SelectItem>
                <SelectItem value="ACTION_REQUIRED">App: Action Required</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <span className="text-xs text-stone-500 font-mono font-bold pl-2">
            Total: {filtered.length}
          </span>
        </div>
      </div>

      {/* Applications Table */}
      <Card className="border-zinc-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-soft-cream text-zinc-700 border-b border-zinc-200 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Registration ID</th>
                <th className="py-3 px-4">Applicant Name</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">District / Location</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4">Application Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    No matching Mithila Queen registration records found.
                  </td>
                </tr>
              ) : (
                filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-maroon">
                      {app.registrationId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-zinc-900">{app.fullName}</div>
                      {app.isMinor && (
                        <span className="inline-block text-[9px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 mt-0.5">
                          Minor (&lt;18)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-600">
                      <div>{app.phone}</div>
                      <div className="text-[11px] text-zinc-400">{app.email}</div>
                    </td>
                    <td className="py-3 px-4 text-zinc-700">
                      {app.district}, {app.province}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          app.paymentStatus === "VERIFIED"
                            ? "bg-soft-cream text-maroon border border-saffron"
                            : app.paymentStatus === "UNDER_REVIEW"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : app.paymentStatus === "CLARIFICATION_REQUIRED"
                            ? "bg-orange-50 text-orange-800 border border-orange-200"
                            : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                        }`}
                      >
                        {app.paymentStatus}
                      </span>
                      {app.paymentReference && (
                        <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                          Ref: {app.paymentReference}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          app.applicationStatus === "APPROVED"
                            ? "bg-soft-cream text-maroon border border-saffron"
                            : app.applicationStatus === "REJECTED"
                            ? "bg-rose-50 text-rose-800 border border-rose-200"
                            : app.applicationStatus === "ACTION_REQUIRED"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-blue-50 text-blue-800 border border-blue-200"
                        }`}
                      >
                        {app.applicationStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        onClick={() => setSelectedApp(app)}
                        className="bg-maroon hover:bg-maroon-dark text-warm-ivory text-xs h-7 px-2.5 font-bold shadow-2xs gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-saffron" />
                        <span>Inspect & Review</span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* INSPECTION & ADJUDICATION MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div
            className="fixed inset-0"
            onClick={() => setSelectedApp(null)}
          />

          <div className="relative w-full max-w-3xl max-h-[90vh] bg-warm-ivory rounded-2xl border border-cream-dark shadow-2xl flex flex-col overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b border-cream-dark bg-soft-cream flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-saffron block">
                  Mithila Queen 2026 &bull; Participant Dossier
                </span>
                <h3 className="text-xl font-bold text-maroon">
                  {selectedApp.fullName}
                </h3>
                <span className="font-mono text-xs font-bold text-stone-600">
                  {selectedApp.registrationId} &bull; Submitted {formatNepalDateTime(selectedApp.submittedAt)}
                </span>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-cream-dark/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-charcoal">
              {/* Minor Safeguarding Banner if < 18 */}
              {selectedApp.isMinor && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-amber-900">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <span>Minor Participant Record (&lt; 18 Years)</span>
                  </p>
                  <p className="text-[11px] text-amber-800">
                    Guardian: <strong>{selectedApp.guardianName}</strong> ({selectedApp.guardianRelation}) &bull; Phone: <strong>{selectedApp.guardianPhone}</strong>
                  </p>
                </div>
              )}

              {/* Profile Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-soft-cream/40 border border-cream-dark space-y-1.5">
                  <p className="text-stone-500 font-bold text-[11px] uppercase tracking-wider">Contact &amp; Location</p>
                  <p><strong>Phone:</strong> {selectedApp.phone}</p>
                  <p><strong>Email:</strong> {selectedApp.email}</p>
                  <p><strong>Location:</strong> {selectedApp.currentAddress}, {selectedApp.cityVillage}, {selectedApp.district}, {selectedApp.province}</p>
                </div>

                <div className="p-4 rounded-xl bg-soft-cream/40 border border-cream-dark space-y-1.5">
                  <p className="text-stone-500 font-bold text-[11px] uppercase tracking-wider">Profile &amp; Cultural Talents</p>
                  <p><strong>Languages:</strong> {selectedApp.languagesSpoken || "None specified"}</p>
                  <p><strong>Talents:</strong> {selectedApp.talentsSkills || "None specified"}</p>
                  <p><strong>Hobbies:</strong> {selectedApp.hobbiesInterests || "None specified"}</p>
                </div>
              </div>

              {/* Social Media Links */}
              {(selectedApp.instagramHandle || selectedApp.tiktokHandle || selectedApp.facebookUrl) && (
                <div className="p-4 rounded-xl bg-soft-cream/40 border border-cream-dark space-y-2">
                  <span className="text-[11px] font-bold text-maroon uppercase tracking-wider block">
                    Social Media Profiles
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedApp.instagramHandle && (
                      <a
                        href={selectedApp.instagramHandle.startsWith("http") ? selectedApp.instagramHandle : `https://instagram.com/${selectedApp.instagramHandle.replace("@", "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-cream-dark text-stone-800 hover:text-maroon transition-colors"
                      >
                        <span className="font-bold text-[11px]">Instagram:</span>
                        <span className="font-mono text-[11px]">{selectedApp.instagramHandle}</span>
                        <ExternalLink className="w-3 h-3 text-saffron" />
                      </a>
                    )}
                    {selectedApp.tiktokHandle && (
                      <a
                        href={selectedApp.tiktokHandle.startsWith("http") ? selectedApp.tiktokHandle : `https://tiktok.com/@${selectedApp.tiktokHandle.replace("@", "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-cream-dark text-stone-800 hover:text-maroon transition-colors"
                      >
                        <span className="font-bold text-[11px]">TikTok:</span>
                        <span className="font-mono text-[11px]">{selectedApp.tiktokHandle}</span>
                        <ExternalLink className="w-3 h-3 text-saffron" />
                      </a>
                    )}
                    {selectedApp.facebookUrl && (
                      <a
                        href={selectedApp.facebookUrl.startsWith("http") ? selectedApp.facebookUrl : `https://${selectedApp.facebookUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-cream-dark text-stone-800 hover:text-maroon transition-colors"
                      >
                        <span className="font-bold text-[11px]">Facebook:</span>
                        <span className="font-mono text-[11px] truncate max-w-[140px]">{selectedApp.facebookUrl}</span>
                        <ExternalLink className="w-3 h-3 text-saffron" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Motivation & Heritage Response */}
              {selectedApp.motivationReason && (
                <div className="p-4 rounded-xl bg-soft-cream/40 border border-cream-dark text-xs space-y-1.5">
                  <p className="font-bold text-maroon">Why participant wants to join Mithila Queen:</p>
                  <p className="text-stone-800 leading-relaxed">{selectedApp.motivationReason}</p>
                </div>
              )}

              {/* Uploaded Photos & Proofs */}
              <div className="p-4 rounded-xl bg-soft-cream/40 border border-cream-dark space-y-3">
                <p className="text-[11px] font-bold text-maroon uppercase tracking-wider">
                  Uploaded Media &amp; Proofs
                </p>
                <div className="flex flex-wrap gap-4">
                  {selectedApp.profilePhotoUrl ? (
                    <div>
                      <span className="text-[11px] text-stone-500 block mb-1">Profile Photo:</span>
                      <a
                        href={selectedApp.profilePhotoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block relative w-24 h-32 rounded-xl border border-cream-dark overflow-hidden bg-stone-100 shadow-2xs group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selectedApp.profilePhotoUrl}
                          alt="Profile"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </a>
                    </div>
                  ) : (
                    <div className="text-stone-400 text-xs">No profile photo uploaded</div>
                  )}

                  {selectedApp.videoUrl && (
                    <div>
                      <span className="text-[11px] text-stone-500 block mb-1">Audition Video:</span>
                      <a
                        href={selectedApp.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 p-3 rounded-xl bg-white border border-cream-dark text-maroon hover:bg-soft-cream transition-colors font-bold text-xs"
                      >
                        <Video className="w-4 h-4 text-saffron" />
                        <span>Watch Audition Video</span>
                        <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                      </a>
                    </div>
                  )}

                  {selectedApp.paymentScreenshotUrl && (
                    <div>
                      <span className="text-[11px] text-stone-500 block mb-1">Receipt Screenshot:</span>
                      <a
                        href={selectedApp.paymentScreenshotUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block relative w-24 h-32 rounded-xl border border-cream-dark overflow-hidden bg-stone-100 shadow-2xs group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selectedApp.paymentScreenshotUrl}
                          alt="Receipt"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* PAYMENT VERIFICATION SECTION */}
              <div className="p-5 rounded-xl bg-soft-cream border border-cream-dark space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-maroon flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-saffron" />
                    <span>NPR {selectedApp.registrationFee || 399} Registration Fee Verification</span>
                  </h4>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    selectedApp.paymentStatus === "VERIFIED"
                      ? "bg-maroon text-white"
                      : "bg-saffron text-white"
                  }`}>
                    Status: {selectedApp.paymentStatus}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-lg border border-cream-dark text-xs space-y-1">
                  <p><strong>Transaction Reference:</strong> <span className="font-mono text-maroon font-bold">{selectedApp.paymentReference || "Not yet submitted"}</span></p>
                </div>

                {/* Action Buttons for Payment */}
                <div className="pt-1 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    disabled={isProcessing || selectedApp.paymentStatus === "VERIFIED"}
                    onClick={() => handleVerifyPayment("VERIFY")}
                    className="bg-maroon hover:bg-maroon-dark text-white font-bold text-xs h-8 px-4 rounded-lg gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-saffron" />
                    <span>Verify Payment (Settled)</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isProcessing}
                    onClick={() => handleVerifyPayment("REQUEST_CLARIFICATION")}
                    className="border-amber-300 text-amber-900 bg-white hover:bg-amber-50 text-xs h-8 px-3 rounded-lg gap-1.5"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Request Clarification</span>
                  </Button>
                </div>
              </div>

              {/* APPLICATION ADJUDICATION (Only permitted after payment is verified) */}
              <div className="p-5 rounded-xl bg-white border border-cream-dark space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-maroon">
                  Application Review &amp; Decision
                </h4>

                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="text-xs font-bold text-stone-700">
                    Decision Notes / Participant Notice
                  </Label>
                  <Input
                    id="notes"
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="Enter reason for rejection or details for action required..."
                    className="h-9 text-xs border-cream-dark bg-white focus-visible:ring-saffron"
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    size="sm"
                    disabled={isProcessing || selectedApp.paymentStatus !== "VERIFIED"}
                    onClick={() => handleAdjudicate("APPROVE")}
                    className="bg-maroon hover:bg-maroon-dark text-white font-bold text-xs h-9 px-4 rounded-lg gap-1.5"
                    title={selectedApp.paymentStatus !== "VERIFIED" ? "Payment must be verified first" : "Approve Application"}
                  >
                    <FileCheck2 className="w-3.5 h-3.5 text-saffron" />
                    <span>Approve &amp; Dispatch Confirmation</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isProcessing}
                    onClick={() => handleAdjudicate("ACTION_REQUIRED")}
                    className="border-amber-300 text-amber-900 bg-white hover:bg-amber-50 text-xs h-9 px-4 rounded-lg"
                  >
                    Request Information
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isProcessing}
                    onClick={() => handleAdjudicate("REJECT")}
                    className="border-rose-300 text-rose-800 bg-white hover:bg-rose-50 text-xs h-9 px-4 rounded-lg"
                  >
                    Reject Application
                  </Button>
                </div>

                {selectedApp.paymentStatus !== "VERIFIED" && (
                  <p className="text-[11px] text-amber-800 font-semibold bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                    * Note: Applications cannot be approved until payment verification has been confirmed above.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


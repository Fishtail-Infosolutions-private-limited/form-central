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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
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
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="h-10 text-xs border border-zinc-200 rounded-md px-3 bg-white font-medium text-zinc-800"
          >
            <option value="ALL">Payment: All</option>
            <option value="PENDING">Payment: Pending</option>
            <option value="UNDER_REVIEW">Payment: Under Review</option>
            <option value="VERIFIED">Payment: Verified</option>
            <option value="CLARIFICATION_REQUIRED">Payment: Clarification</option>
          </select>

          {/* Application Filter */}
          <select
            value={appFilter}
            onChange={(e) => setAppFilter(e.target.value)}
            className="h-10 text-xs border border-zinc-200 rounded-md px-3 bg-white font-medium text-zinc-800"
          >
            <option value="ALL">Application: All</option>
            <option value="SUBMITTED">App: Submitted</option>
            <option value="UNDER_REVIEW">App: Under Review</option>
            <option value="APPROVED">App: Approved</option>
            <option value="REJECTED">App: Rejected</option>
            <option value="ACTION_REQUIRED">App: Action Required</option>
          </select>

          <span className="text-xs text-zinc-500 font-mono font-bold pl-2">
            Total: {filtered.length}
          </span>
        </div>
      </div>

      {/* Applications Table */}
      <Card className="border-zinc-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF5EE] text-zinc-700 border-b border-zinc-200 font-bold uppercase tracking-wider text-[11px]">
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
                    <td className="py-3 px-4 font-mono font-bold text-[#292821]">
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
                            ? "bg-[#FAF5EE] text-[#292821] border border-[#B69A65]"
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
                            ? "bg-[#FAF5EE] text-[#292821] border border-[#B69A65]"
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
                        className="bg-[#292821] hover:bg-[#3C332A] text-[#FAF5EE] text-xs h-7 px-2.5 font-bold shadow-2xs gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#B69A65]" />
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

      {/* INSPECTION & ADJUDICATION DRAWER / MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[#E8DFD0] shadow-2xl p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-zinc-200 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#B69A65]">
                  Participant File
                </span>
                <h3 className="text-xl font-extrabold text-[#292821] font-serif">
                  {selectedApp.fullName}
                </h3>
                <span className="font-mono text-xs font-bold text-zinc-500">
                  {selectedApp.registrationId} &bull; Submitted {formatNepalDateTime(selectedApp.submittedAt)}
                </span>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 rounded-md text-zinc-400 hover:text-black hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Minor Safeguarding Banner if < 18 */}
            {selectedApp.isMinor && (
              <div className="p-4 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-900">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>Minor Participant Record (&lt;18 Years)</span>
                </p>
                <p className="text-[11px] text-amber-800">
                  Guardian: <strong>{selectedApp.guardianName}</strong> ({selectedApp.guardianRelation}) &bull; Phone: <strong>{selectedApp.guardianPhone}</strong>
                </p>
              </div>
            )}

            {/* Profile Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-md bg-[#FAF5EE] border border-[#E8DFD0] space-y-1.5">
                <p className="text-zinc-500 font-medium">Contact Details</p>
                <p><strong>Phone:</strong> {selectedApp.phone}</p>
                <p><strong>Email:</strong> {selectedApp.email}</p>
                <p><strong>Location:</strong> {selectedApp.currentAddress}, {selectedApp.cityVillage}, {selectedApp.district}, {selectedApp.province}</p>
              </div>

              <div className="p-4 rounded-md bg-[#FAF5EE] border border-[#E8DFD0] space-y-1.5">
                <p className="text-zinc-500 font-medium">Profile & Social Accounts</p>
                <p><strong>Languages:</strong> {selectedApp.languagesSpoken || "None specified"}</p>
                <p><strong>Talents:</strong> {selectedApp.talentsSkills || "None specified"}</p>
                <p className="truncate">
                  <strong>Socials:</strong> {selectedApp.instagramHandle || selectedApp.tiktokHandle || selectedApp.facebookUrl || "None"}
                </p>
              </div>
            </div>

            {/* Motivation & Heritage Response */}
            {selectedApp.motivationReason && (
              <div className="p-4 rounded-md bg-zinc-50 border border-zinc-200 text-xs space-y-1">
                <p className="font-bold text-[#292821]">Why participant wants to join Mithila Queen:</p>
                <p className="text-zinc-700 leading-relaxed">{selectedApp.motivationReason}</p>
              </div>
            )}

            {/* PAYMENT VERIFICATION SECTION */}
            <div className="p-5 rounded-md bg-[#292821] text-white space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm font-serif text-[#B69A65] flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span>NPR 399 Registration Fee Verification</span>
                </h4>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white/10 text-white">
                  Status: {selectedApp.paymentStatus}
                </span>
              </div>

              <div className="text-xs space-y-1">
                <p><strong>Transaction Reference:</strong> <span className="font-mono text-amber-300">{selectedApp.paymentReference || "Not yet submitted"}</span></p>
              </div>

              {/* Action Buttons for Payment */}
              <div className="pt-2 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  disabled={isProcessing || selectedApp.paymentStatus === "VERIFIED"}
                  onClick={() => handleVerifyPayment("VERIFY")}
                  className="bg-[#B69A65] hover:bg-[#9A7F4F] text-white font-bold text-xs h-8 gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verify Payment (Settled)</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={isProcessing}
                  onClick={() => handleVerifyPayment("REQUEST_CLARIFICATION")}
                  className="border-amber-400 text-amber-300 hover:bg-amber-400/20 text-xs h-8 gap-1.5"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Request Payment Clarification</span>
                </Button>
              </div>
            </div>

            {/* APPLICATION ADJUDICATION (Only permitted after payment is verified) */}
            <div className="p-5 rounded-md bg-zinc-50 border border-zinc-200 space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#292821]">
                Application Review & Decision
              </h4>

              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-xs font-bold text-zinc-700">
                  Decision Notes / Participant Notice
                </Label>
                <Input
                  id="notes"
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Enter reason for rejection or details for action required..."
                  className="h-9 text-xs border-zinc-300 bg-white"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  size="sm"
                  disabled={isProcessing || selectedApp.paymentStatus !== "VERIFIED"}
                  onClick={() => handleAdjudicate("APPROVE")}
                  className="bg-[#292821] hover:bg-[#3C332A] text-white font-bold text-xs h-9 px-4 rounded-md gap-1.5"
                  title={selectedApp.paymentStatus !== "VERIFIED" ? "Payment must be verified first" : "Approve Application"}
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Approve & Dispatch PDF</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={isProcessing}
                  onClick={() => handleAdjudicate("REJECT")}
                  className="border-rose-300 text-rose-700 hover:bg-rose-50 text-xs h-9 px-4 rounded-md"
                >
                  Reject Application
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={isProcessing}
                  onClick={() => handleAdjudicate("ACTION_REQUIRED")}
                  className="border-zinc-300 text-zinc-700 hover:bg-zinc-100 text-xs h-9 px-4 rounded-md"
                >
                  Request Information
                </Button>
              </div>

              {selectedApp.paymentStatus !== "VERIFIED" && (
                <p className="text-[11px] text-amber-700 font-semibold">
                  * Note: Applications cannot be approved until payment verification has been confirmed above.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


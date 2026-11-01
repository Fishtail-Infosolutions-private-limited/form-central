import React, { Suspense } from "react";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { UnifiedResponsesView, UnifiedApplication } from "@/components/admin/unified-responses-view";
import { MithilaHeritageMandala } from "@/components/brand/brand-logos";
import { Crown, Sparkles, Filter, Loader2 } from "lucide-react";

export const metadata = {
  title: "Mithila Queen Applications & Reviews | Origin Foundation Admin",
};

export default async function AdminAllResponsesPage() {
  await requireAdmin();

  const [mithilaQueenApps, submissions, forms] = await Promise.all([
    prisma.mithilaQueenRegistration.findMany({
      orderBy: { submittedAt: "desc" },
    }),
    prisma.registrationSubmission.findMany({
      orderBy: { submittedAt: "desc" },
      include: {
        form: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        answers: true,
        uploadedFiles: true,
      },
    }),
    prisma.registrationForm.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ]);

  // Map Mithila Queen records to UnifiedApplication format
  const mappedMithilaQueen: UnifiedApplication[] = mithilaQueenApps.map((app) => ({
    id: app.id,
    source: "MITHILA_QUEEN",
    registrationId: app.registrationId,
    formName: "Mithila Queen 2026",
    formSlug: "mithila-queen",
    fullName: app.fullName,
    email: app.email,
    phone: app.phone,
    alternatePhone: app.alternatePhone,
    dob: app.dob,
    isMinor: app.isMinor,
    guardianName: app.guardianName,
    guardianPhone: app.guardianPhone,
    guardianRelation: app.guardianRelation,
    guardianConsentRecorded: app.guardianConsentRecorded,
    province: app.province,
    district: app.district,
    municipality: app.municipality,
    cityVillage: app.cityVillage,
    currentAddress: app.currentAddress,
    personalIntro: app.personalIntro,
    hobbiesInterests: app.hobbiesInterests,
    talentsSkills: app.talentsSkills,
    languagesSpoken: app.languagesSpoken,
    motivationReason: app.motivationReason,
    previousExperience: app.previousExperience,
    experienceDetails: app.experienceDetails,
    instagramHandle: app.instagramHandle,
    tiktokHandle: app.tiktokHandle,
    facebookUrl: app.facebookUrl,
    profilePhotoUrl: app.profilePhotoUrl,
    videoUrl: app.videoUrl,
    documentUrl: app.documentUrl,
    registrationFee: app.registrationFee,
    paymentStatus: app.paymentStatus,
    paymentReference: app.paymentReference,
    paymentScreenshotUrl: app.paymentScreenshotUrl,
    paymentSubmittedAt: app.paymentSubmittedAt,
    paymentVerifiedAt: app.paymentVerifiedAt,
    paymentClarificationNotes: app.paymentClarificationNotes,
    applicationStatus: app.applicationStatus,
    rejectionReason: app.rejectionReason,
    actionRequiredDetails: app.actionRequiredDetails,
    privateAdminNotes: app.privateAdminNotes,
    pdfGeneratedAt: app.pdfGeneratedAt,
    submittedAt: app.submittedAt,
  }));

  // Map generic form builder submissions to UnifiedApplication format
  const mappedSubmissions: UnifiedApplication[] = submissions.map((sub) => {
    // Map status
    let appStatus = "PENDING_REVIEW";
    if (sub.status === "APPROVED") appStatus = "APPROVED";
    else if (sub.status === "REJECTED") appStatus = "REJECTED";
    else if (sub.status === "CANCELLED") appStatus = "REJECTED";
    else if (sub.status === "PENDING") appStatus = "UNDER_REVIEW";

    return {
      id: sub.id,
      source: "FORM_BUILDER",
      registrationId: sub.referenceNumber || sub.id.substring(0, 8).toUpperCase(),
      formName: sub.form?.name || "Dynamic Form",
      formSlug: sub.form?.slug || "",
      fullName: sub.fullName || "Anonymous Participant",
      email: sub.email || "N/A",
      phone: sub.phone || "N/A",
      isMinor: false,
      registrationFee: 0,
      paymentStatus: "NOT_APPLICABLE",
      applicationStatus: appStatus,
      submittedAt: sub.submittedAt,
      dynamicAnswers: sub.answers?.map((a) => ({
        fieldKey: a.fieldKey,
        fieldLabel: a.fieldLabel,
        value: a.value,
      })),
      uploadedFiles: sub.uploadedFiles?.map((f) => ({
        id: f.id,
        originalName: f.originalName,
        mimeType: f.mimeType,
        fileSize: f.fileSize,
        storagePath: f.storagePath,
        driveFileId: f.driveFileId,
      })),
    };
  });

  const allApplications = [...mappedMithilaQueen, ...mappedSubmissions];

  // Build unique form options list
  const formOptions = [
    { id: "mithila-queen", name: "Mithila Queen 2026 (Flagship)", slug: "mithila-queen" },
    ...forms
      .filter((f) => f.slug !== "mithila-queen")
      .map((f) => ({ id: f.id, name: f.name, slug: f.slug })),
  ];

  return (
    <div className="space-y-6">
      {/* Header with Charcoal and Antique Gold cultural branding */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-dark pb-6 bg-[#FFFFFF] p-6 rounded-lg border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MithilaHeritageMandala className="w-5 h-5 text-saffron" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-saffron">
              The Origin Foundation &bull; Adjudication Desk
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-maroon tracking-tight">
            Applications & Payment Reviews
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-2xl">
            Unified participant review desk: verify eSewa/bank payments, review minor safeguarding consent, adjudicate Mithila Queen candidates, and manage confirmation passes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-maroon">
              {allApplications.length} Total Submissions
            </div>
            <div className="text-[11px] text-maroon font-medium">
              {mappedMithilaQueen.length} Mithila Queen &bull; {mappedSubmissions.length} Other Forms
            </div>
          </div>
        </div>
      </div>

      {/* Unified Responses Interface */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-16 bg-[#FFFFFF] border border-cream-dark rounded-lg">
            <Loader2 className="w-6 h-6 animate-spin text-saffron" />
            <span className="ml-3 text-xs font-medium text-stone-600">
              Loading participant records...
            </span>
          </div>
        }
      >
        <UnifiedResponsesView applications={allApplications} forms={formOptions} />
      </Suspense>
    </div>
  );
}

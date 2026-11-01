import React from "react";
import { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { InquiriesManagementView } from "@/components/admin/inquiries-management-view";

export const metadata: Metadata = {
  title: "Inquiries Desk | The Origin Foundation Admin",
  description: "Official public inquiries received through the contact form.",
};

export default async function InquiriesAdminPage() {
  await requireAdmin();

  const inquiries = await prisma.contactInquiry.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <InquiriesManagementView initialInquiries={inquiries as any} />
    </div>
  );
}


import React from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { PlusCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormsTable } from "@/components/admin/forms-table";

export default async function AdminFormsPage() {
  await requireAdmin();

  const forms = await prisma.registrationForm.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: { submissions: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            Registration Forms
          </h1>
        </div>

        <Link href="/admin/forms/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-semibold text-xs h-9">
            <PlusCircle className="w-4 h-4" />
            <span>Create New Form</span>
          </Button>
        </Link>
      </div>

      {forms.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-zinc-900 text-base">No registration forms yet</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-6">
            Get started by creating your first registration form with custom steps and questions.
          </p>
          <Link href="/admin/forms/new">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2 text-xs">
              <PlusCircle className="w-4 h-4" />
              <span>Create First Form</span>
            </Button>
          </Link>
        </div>
      ) : (
        <FormsTable forms={forms} />
      )}
    </div>
  );
}

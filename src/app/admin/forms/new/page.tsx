import React from "react";
import Link from "next/link";
import { ArrowLeft, Crown, Sliders, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";

export default async function CreateFormPage() {
  await requireAdmin();

  const form = await prisma.registrationForm.findFirst({
    where: { slug: "mithila-queen" },
  });

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 space-y-6 text-center">
      <div className="w-16 h-16 rounded-full bg-soft-cream text-saffron mx-auto flex items-center justify-center border border-saffron">
        <Crown className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-saffron">
          Dedicated Competition Platform
        </span>
        <h1 className="text-3xl font-serif font-extrabold text-maroon">
          Mithila Queen is the Dedicated Form
        </h1>
        <p className="text-xs text-stone-700 max-w-md mx-auto leading-relaxed">
          The Origin Foundation platform is dedicated exclusively to Mithila Queen. Rather than creating generic multiple forms, all 7 registration steps, fields, and questions can be customized directly in the Mithila Queen Form Builder.
        </p>
      </div>

      <div className="p-5 rounded-lg bg-white border border-cream-dark shadow-xs text-left text-xs space-y-2">
        <div className="flex items-center gap-2 text-zinc-900 font-bold">
          <ShieldCheck className="w-4 h-4 text-saffron" />
          <span>Active Flagship Form: Mithila Queen 2026</span>
        </div>
        <p className="text-zinc-600 leading-relaxed">
          You can add custom questions, adjust step descriptions, modify validation rules, and preview changes without creating duplicate registration links.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        {form && (
          <Link href={`/admin/forms/${form.id}/builder`} className="w-full sm:w-auto">
            <Button className="w-full bg-saffron hover:bg-saffron-dark text-maroon font-bold text-xs h-10 px-6 gap-2">
              <Sliders className="w-4 h-4" />
              <span>Customize Mithila Queen Form</span>
            </Button>
          </Link>
        )}
        <Link href="/admin/forms" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full border-cream-dark text-maroon text-xs h-10 px-5 gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Form Management</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}

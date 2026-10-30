import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { generateResponsesWorkbook } from "@/lib/excel/exporter";

export async function GET(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const formId = searchParams.get("formId");
  const status = searchParams.get("status");

  const whereClause: any = {};
  if (formId && formId !== "ALL") whereClause.formId = formId;
  if (status && status !== "ALL") whereClause.status = status;

  let formName = "All Events & Competitions";
  if (formId && formId !== "ALL") {
    const form = await prisma.registrationForm.findUnique({
      where: { id: formId },
      select: { name: true },
    });
    if (form) formName = form.name;
  }

  const submissions = await prisma.registrationSubmission.findMany({
    where: whereClause,
    orderBy: { submittedAt: "desc" },
    include: {
      answers: true,
      uploadedFiles: true,
    },
  });

  const buffer = await generateResponsesWorkbook({
    formName,
    submissions,
  });

  const filename = `${formName.replace(/[^a-zA-Z0-9_-]/g, "_")}_Registrations_${new Date()
    .toISOString()
    .slice(0, 10)}.xlsx`;

  return new Response(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}


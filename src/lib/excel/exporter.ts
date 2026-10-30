import "server-only";
import ExcelJS from "exceljs";
import { formatDateTime } from "@/lib/utils";

// Neutralize spreadsheet formula injection for values beginning with =, +, -, @
export function sanitizeCellValue(val: any): any {
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (
      trimmed.startsWith("=") ||
      trimmed.startsWith("+") ||
      trimmed.startsWith("-") ||
      trimmed.startsWith("@")
    ) {
      return `'${val}`;
    }
    return val;
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeCellValue).join(", ");
  }
  if (typeof val === "object" && val !== null) {
    return JSON.stringify(val);
  }
  return val;
}

export async function generateResponsesWorkbook({
  formName,
  submissions,
}: {
  formName: string;
  submissions: Array<{
    referenceNumber: string;
    fullName: string;
    email: string;
    phone: string;
    status: string;
    submittedAt: Date;
    answers: Array<{
      fieldKey: string;
      fieldLabel: string;
      value: any;
    }>;
    uploadedFiles: Array<{
      fieldKey: string;
      originalName: string;
      storageProvider: string;
      storagePath: string;
      driveFileId: string | null;
    }>;
  }>;
}): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "FormSuite Event Management";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(
    formName.slice(0, 30).replace(/[*?:/\\\[\]]/g, "_") || "Registrations"
  );

  // Discover all custom field labels across all submissions
  const customFieldsMap = new Map<string, string>();
  for (const sub of submissions) {
    for (const ans of sub.answers) {
      if (!customFieldsMap.has(ans.fieldKey)) {
        customFieldsMap.set(ans.fieldKey, ans.fieldLabel || ans.fieldKey);
      }
    }
  }

  // Base Columns
  const columns: { header: string; key: string; width: number }[] = [
    { header: "Reference No", key: "referenceNumber", width: 18 },
    { header: "Full Name", key: "fullName", width: 24 },
    { header: "Email Address", key: "email", width: 28 },
    { header: "Phone Number", key: "phone", width: 18 },
    { header: "Status", key: "status", width: 14 },
    { header: "Submission Date", key: "submittedAt", width: 22 },
  ];

  // Append custom columns
  for (const [key, label] of customFieldsMap.entries()) {
    columns.push({
      header: label,
      key: `custom_${key}`,
      width: Math.max(16, label.length + 4),
    });
  }

  // Media references column
  columns.push({ header: "Attached Files & Videos", key: "files", width: 32 });

  worksheet.columns = columns;

  // Style Header Row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF292821" }, // Charcoal #292821 (The Origin Foundation)
  };
  headerRow.alignment = { vertical: "middle", horizontal: "left" };
  headerRow.height = 26;

  // Add submission rows
  for (const sub of submissions) {
    const rowData: Record<string, any> = {
      referenceNumber: sanitizeCellValue(sub.referenceNumber),
      fullName: sanitizeCellValue(sub.fullName),
      email: sanitizeCellValue(sub.email),
      phone: sanitizeCellValue(sub.phone),
      status: sanitizeCellValue(sub.status),
      submittedAt: formatDateTime(sub.submittedAt),
    };

    // Custom answers map
    const answerMap = new Map<string, any>();
    for (const a of sub.answers) {
      answerMap.set(a.fieldKey, a.value);
    }

    for (const [key] of customFieldsMap.entries()) {
      const val = answerMap.get(key);
      rowData[`custom_${key}`] = val !== undefined ? sanitizeCellValue(val) : "-";
    }

    // Uploaded files summary
    const fileSummary = sub.uploadedFiles
      .map((f) =>
        f.storageProvider === "GOOGLE_DRIVE"
          ? `[Drive Video: ${f.originalName}] (ID: ${f.driveFileId || f.storagePath})`
          : `[Local Image: ${f.originalName}] (${f.storagePath})`
      )
      .join("; ");

    rowData["files"] = sanitizeCellValue(fileSummary || "None");

    const row = worksheet.addRow(rowData);
    row.height = 20;
    row.alignment = { vertical: "middle" };
  }

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}


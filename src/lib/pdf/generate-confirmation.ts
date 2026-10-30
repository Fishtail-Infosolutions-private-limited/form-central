import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";
import { formatNepalDateTime } from "@/lib/utils/timezone";

export interface PdfConfirmationData {
  registrationId: string;
  fullName: string;
  dob: Date;
  email: string;
  phone: string;
  province: string;
  district: string;
  submittedAt: Date;
  verifiedAt?: Date | null;
  approvedAt?: Date | null;
  verificationCode: string;
}

export async function generateRegistrationConfirmationPdf(data: PdfConfirmationData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // Standard A4 Dimensions in points (210mm x 297mm)
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Brand Palette RGB Colors (0 - 1) — Forest Green, Antique Gold, Terracotta & Warm Ivory
  const colorNavy = rgb(23 / 255, 43 / 255, 36 / 255);       // #172B24 (Forest Green)
  const colorGold = rgb(182 / 255, 154 / 255, 101 / 255);   // #B69A65 (Antique Gold)
  const colorIvory = rgb(245 / 255, 240 / 255, 230 / 255);  // #F5F0E6 (Warm Ivory)
  const colorTerracotta = rgb(166 / 255, 75 / 255, 54 / 255); // #A64B36 (Terracotta)
  const colorDark = rgb(41 / 255, 40 / 255, 33 / 255);      // #292821 (Charcoal)
  const colorGray = rgb(110 / 255, 108 / 255, 98 / 255);
  const colorSlate = rgb(50 / 255, 60 / 255, 55 / 255);

  // 1. Decorative Double Outer Border
  page.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: colorGold,
    borderWidth: 2,
  });

  page.drawRectangle({
    x: 24,
    y: 24,
    width: width - 48,
    height: height - 48,
    borderColor: colorNavy,
    borderWidth: 0.75,
  });

  // 2. Header Banner Background
  page.drawRectangle({
    x: 26,
    y: height - 130,
    width: width - 52,
    height: 104,
    color: colorNavy,
  });

  // Header Typography
  page.drawText("THE ORIGIN FOUNDATION", {
    x: 45,
    y: height - 60,
    size: 20,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText("Rooted in Identity. Driven by Purpose.", {
    x: 45,
    y: height - 76,
    size: 9.5,
    font: fontOblique,
    color: colorGold,
  });

  page.drawText("Janakpur Dham, Madhesh Province, Nepal • originfoundation107@gmail.com", {
    x: 45,
    y: height - 94,
    size: 8,
    font: fontRegular,
    color: rgb(0.9, 0.9, 0.9),
  });

  page.drawText("FLAGSHIP INITIATIVE: MITHILA QUEEN", {
    x: 45,
    y: height - 114,
    size: 8.5,
    font: fontBold,
    color: colorGold,
  });

  // 3. Document Title Ribbon
  page.drawRectangle({
    x: 40,
    y: height - 170,
    width: width - 80,
    height: 30,
    color: rgb(245 / 255, 240 / 255, 230 / 255),
    borderColor: colorGold,
    borderWidth: 1,
  });

  page.drawText("OFFICIAL REGISTRATION CONFIRMATION", {
    x: 140,
    y: height - 158,
    size: 13,
    font: fontBold,
    color: colorNavy,
  });

  // 4. Registration Reference & Status Grid
  let yPos = height - 200;

  // Status Badge
  page.drawRectangle({
    x: 40,
    y: yPos - 35,
    width: width - 80,
    height: 38,
    color: rgb(240 / 255, 248 / 255, 242 / 255),
    borderColor: rgb(46 / 255, 133 / 255, 64 / 255),
    borderWidth: 1,
  });

  page.drawText(`REGISTRATION ID: ${data.registrationId}`, {
    x: 55,
    y: yPos - 18,
    size: 11,
    font: fontBold,
    color: colorNavy,
  });

  page.drawText("STATUS: APPROVED & PAYMENT VERIFIED (NPR 399)", {
    x: 55,
    y: yPos - 30,
    size: 9,
    font: fontBold,
    color: rgb(20 / 255, 110 / 255, 40 / 255),
  });

  page.drawText(`VERIFICATION CODE: ${data.verificationCode}`, {
    x: 360,
    y: yPos - 24,
    size: 8.5,
    font: fontBold,
    color: colorSlate,
  });

  yPos -= 65;

  // Section Header: Participant Details
  page.drawText("PARTICIPANT DETAILS", {
    x: 40,
    y: yPos,
    size: 10,
    font: fontBold,
    color: colorGold,
  });
  page.drawLine({
    start: { x: 40, y: yPos - 4 },
    end: { x: width - 40, y: yPos - 4 },
    thickness: 1,
    color: colorGold,
  });

  yPos -= 22;

  const details = [
    { label: "Full Legal Name", value: data.fullName },
    { label: "Date of Birth", value: data.dob.toISOString().split("T")[0] },
    { label: "Registered Email", value: data.email },
    { label: "Mobile Phone", value: data.phone },
    { label: "Province & District", value: `${data.district}, ${data.province}` },
    { label: "Submission Date (NPT)", value: formatNepalDateTime(data.submittedAt) },
    { label: "Payment Verification", value: "Verified by The Origin Foundation Finance Team" },
    { label: "Competition Category", value: "Mithila Queen 2026 / Women's Cultural & Talent Showcase" },
  ];

  for (const item of details) {
    page.drawText(item.label + ":", {
      x: 45,
      y: yPos,
      size: 9,
      font: fontBold,
      color: colorNavy,
    });

    page.drawText(item.value, {
      x: 200,
      y: yPos,
      size: 9,
      font: fontRegular,
      color: colorDark,
    });

    yPos -= 18;
  }

  yPos -= 10;

  // 5. Verification QR Code Generation
  const qrUrl = `${process.env.APP_URL || "https://theoriginfoundation.org"}/registration-status?ref=${encodeURIComponent(data.registrationId)}`;
  try {
    const qrBuffer = await QRCode.toBuffer(qrUrl, {
      width: 120,
      margin: 1,
      color: {
        dark: "#172B24FF",
        light: "#FFFFFFFF",
      },
    });

    const qrImage = await pdfDoc.embedPng(qrBuffer);
    page.drawImage(qrImage, {
      x: width - 150,
      y: yPos - 85,
      width: 85,
      height: 85,
    });

    page.drawText("Scan to verify official record", {
      x: width - 165,
      y: yPos - 95,
      size: 6.5,
      font: fontRegular,
      color: colorGray,
    });
  } catch (qrErr) {
    console.error("QR embed error in PDF:", qrErr);
  }

  // 6. Competition Notice & Next Steps
  page.drawText("NEXT STEPS & VIDEO AUDITION GUIDELINES", {
    x: 40,
    y: yPos,
    size: 10,
    font: fontBold,
    color: colorGold,
  });
  page.drawLine({
    start: { x: 40, y: yPos - 4 },
    end: { x: width - 170, y: yPos - 4 },
    thickness: 1,
    color: colorGold,
  });

  yPos -= 18;

  const steps = [
    "1. Video Audition: Record a brief video highlighting your introduction, talent, and connection to Mithila.",
    "2. Social Media: Post on TikTok and Instagram tagging official handles once supplied by organizers.",
    "3. WhatsApp Submission: Send the same video directly to Managing Director Gaurav Gupta at +977 9704571941.",
    "4. Official Updates: Stay tuned to email notifications and the website for official event date announcements.",
  ];

  for (const s of steps) {
    page.drawText(s, {
      x: 45,
      y: yPos,
      size: 7.5,
      font: fontRegular,
      color: colorSlate,
    });
    yPos -= 14;
  }

  yPos -= 20;

  // 7. Mandatory Legal Disclaimer
  page.drawRectangle({
    x: 40,
    y: yPos - 35,
    width: width - 80,
    height: 42,
    color: rgb(250 / 255, 248 / 255, 244 / 255),
    borderColor: rgb(220 / 255, 210 / 255, 190 / 255),
    borderWidth: 0.75,
  });

  page.drawText("IMPORTANT OFFICIAL DISCLAIMER:", {
    x: 50,
    y: yPos - 12,
    size: 7.5,
    font: fontBold,
    color: rgb(150 / 255, 30 / 255, 30 / 255),
  });

  page.drawText(
    "This certificate strictly confirms that your registration application and NPR 399 fee have been received and verified for Mithila Queen.",
    {
      x: 50,
      y: yPos - 22,
      size: 7,
      font: fontRegular,
      color: colorDark,
    }
  );

  page.drawText(
    "It is NOT a certificate of winning, title award, or guarantee of final selection or placement. Audition judging is conducted separately.",
    {
      x: 50,
      y: yPos - 31,
      size: 7,
      font: fontBold,
      color: colorDark,
    }
  );

  // 8. Signatures & Footer
  const footerY = 55;

  page.drawLine({
    start: { x: 50, y: footerY + 35 },
    end: { x: 200, y: footerY + 35 },
    thickness: 1,
    color: colorGray,
  });
  page.drawText("Gaurav Gupta", {
    x: 95,
    y: footerY + 24,
    size: 8.5,
    font: fontBold,
    color: colorNavy,
  });
  page.drawText("Managing Director", {
    x: 90,
    y: footerY + 14,
    size: 7.5,
    font: fontRegular,
    color: colorGray,
  });

  page.drawLine({
    start: { x: width - 200, y: footerY + 35 },
    end: { x: width - 50, y: footerY + 35 },
    thickness: 1,
    color: colorGray,
  });
  page.drawText("Dipendra Shah Kalwar", {
    x: width - 175,
    y: footerY + 24,
    size: 8.5,
    font: fontBold,
    color: colorNavy,
  });
  page.drawText("Managing Director", {
    x: width - 165,
    y: footerY + 14,
    size: 7.5,
    font: fontRegular,
    color: colorGray,
  });

  return await pdfDoc.save();
}


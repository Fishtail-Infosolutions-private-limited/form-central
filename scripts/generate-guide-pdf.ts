import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import * as fs from "fs";
import * as path from "path";

async function generateUserGuidePdf() {
  const pdfDoc = await PDFDocument.create();

  // Embed standard typography
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Palette
  const cNavy = rgb(24 / 255, 49 / 255, 83 / 255);       // #183153
  const cBlue = rgb(53 / 255, 111 / 255, 168 / 255);     // #356FA8
  const cBg = rgb(244 / 255, 247 / 255, 250 / 255);      // #F4F7FA
  const cDark = rgb(38 / 255, 50 / 255, 56 / 255);       // #263238
  const cMuted = rgb(84 / 255, 110 / 255, 122 / 255);    // #546E7A
  const cBorder = rgb(220 / 255, 229 / 255, 237 / 255);  // #DCE5ED
  const cWhite = rgb(1, 1, 1);
  const cEmerald = rgb(16 / 255, 185 / 255, 129 / 255);
  const cAmber = rgb(217 / 255, 119 / 255, 6 / 255);

  // =========================================================================
  // PAGE 1: PARTICIPANT QUICK START GUIDE
  // =========================================================================
  const p1 = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = p1.getSize();

  // Decorative border
  p1.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: cBorder,
    borderWidth: 1.5,
  });

  // Top Navy Header
  p1.drawRectangle({
    x: 22,
    y: height - 100,
    width: width - 44,
    height: 78,
    color: cNavy,
  });

  p1.drawText("THE ORIGIN FOUNDATION", {
    x: 42,
    y: height - 50,
    size: 16,
    font: fontBold,
    color: cWhite,
  });

  p1.drawText("MITHILA QUEEN PLATFORM • USER & OPERATOR GUIDE", {
    x: 42,
    y: height - 68,
    size: 9.5,
    font: fontBold,
    color: rgb(180 / 255, 215 / 255, 255 / 255),
  });

  p1.drawText("Rooted in Identity. Driven by Purpose.  |  Janakpur Dham, Nepal", {
    x: 42,
    y: height - 84,
    size: 8,
    font: fontOblique,
    color: rgb(220 / 255, 235 / 255, 255 / 255),
  });

  // Page 1 Title
  p1.drawText("PART 1: CANDIDATE & PUBLIC PARTICIPANT GUIDE", {
    x: 42,
    y: height - 125,
    size: 12,
    font: fontBold,
    color: cBlue,
  });

  // Section 1: Overview Card
  p1.drawRectangle({
    x: 42,
    y: height - 200,
    width: width - 84,
    height: 65,
    color: cBg,
    borderColor: cBorder,
    borderWidth: 1,
  });

  p1.drawText("Platform Overview & Eligibility", {
    x: 54,
    y: height - 148,
    size: 10,
    font: fontBold,
    color: cNavy,
  });
  p1.drawText("• Flagship Competition: Mithila Queen celebrates cultural wisdom, confidence, and talent.", {
    x: 54,
    y: height - 164,
    size: 8.5,
    font: fontRegular,
    color: cDark,
  });
  p1.drawText("• Eligibility: Open to all girls of any age, unmarried or married. No prior stage experience required.", {
    x: 54,
    y: height - 178,
    size: 8.5,
    font: fontRegular,
    color: cDark,
  });
  p1.drawText("• Minor Safeguarding: Applicants under 18 must provide parental / legal guardian verified consent.", {
    x: 54,
    y: height - 192,
    size: 8.5,
    font: fontRegular,
    color: cDark,
  });

  // Section 2: Step-by-Step Registration Workflow
  p1.drawText("How to Apply (7-Step Online Registration)", {
    x: 42,
    y: height - 225,
    size: 11,
    font: fontBold,
    color: cNavy,
  });

  const steps = [
    { num: "Step 1", title: "Identity & OTP Guard", desc: "Enter full name, DOB, phone, address, and verify email via a secure 6-digit OTP code." },
    { num: "Step 2", title: "Profile & Essays", desc: "Answer short questions: reason to join, cultural heritage meaning, and voluntary education/experience." },
    { num: "Step 3", title: "Physical Attributes", desc: "Voluntary height field in feet and inches (non-discriminatory; newcomers are welcome)." },
    { num: "Step 4", title: "Social Profiles", desc: "Provide at least one active profile (Instagram, TikTok, or Facebook) for video review." },
    { num: "Step 5", title: "Document Uploads", desc: "Upload citizenship/birth certificate ID, high-resolution portrait headshot, and photo." },
    { num: "Step 6", title: "Safeguarding & Consent", desc: "Accept official rules, privacy terms, media consent, and parent/guardian authorization if under 18." },
    { num: "Step 7", title: "Review & Submission", desc: "Review dossier summary, receive your unique Registration ID (MQ-YYYY-XXXXXX), and proceed to fee." },
  ];

  let currentY = height - 245;
  for (const st of steps) {
    p1.drawRectangle({
      x: 42,
      y: currentY - 26,
      width: width - 84,
      height: 28,
      color: cWhite,
      borderColor: cBorder,
      borderWidth: 0.75,
    });

    p1.drawText(st.num, {
      x: 52,
      y: currentY - 14,
      size: 8.5,
      font: fontBold,
      color: cBlue,
    });

    p1.drawText(st.title + " — ", {
      x: 95,
      y: currentY - 14,
      size: 8.5,
      font: fontBold,
      color: cNavy,
    });

    p1.drawText(st.desc, {
      x: 180,
      y: currentY - 14,
      size: 8,
      font: fontRegular,
      color: cDark,
    });

    currentY -= 33;
  }

  // Section 3: Fee Payment & Receipt Submission
  currentY -= 10;
  p1.drawText("Registration Fee Payment (NPR 399)", {
    x: 42,
    y: currentY,
    size: 11,
    font: fontBold,
    color: cNavy,
  });

  currentY -= 15;
  p1.drawRectangle({
    x: 42,
    y: currentY - 70,
    width: width - 84,
    height: 70,
    color: cBg,
    borderColor: cBorder,
    borderWidth: 1,
  });

  p1.drawText("1. Scan Official QR Code: Use eSewa, Khalti, or mobile banking to pay the NPR 399 fee.", {
    x: 54,
    y: currentY - 18,
    size: 8.5,
    font: fontRegular,
    color: cDark,
  });
  p1.drawText("2. Enter Transaction UTR: Enter the exact bank reference number shown in your payment app.", {
    x: 54,
    y: currentY - 33,
    size: 8.5,
    font: fontRegular,
    color: cDark,
  });
  p1.drawText("3. Upload Receipt Screenshot: Attach your payment receipt (PNG/JPG) for instant organizer verification.", {
    x: 54,
    y: currentY - 48,
    size: 8.5,
    font: fontRegular,
    color: cDark,
  });
  p1.drawText("4. Verification Notice: Payment status updates to 'Payment Under Review' until verified by finance admin.", {
    x: 54,
    y: currentY - 63,
    size: 8.5,
    font: fontOblique,
    color: cMuted,
  });

  // Section 4: Status Check & Video Audition Box
  currentY -= 85;
  const colW = (width - 84 - 12) / 2;

  // Box Left: Status Check
  p1.drawRectangle({
    x: 42,
    y: currentY - 95,
    width: colW,
    height: 95,
    color: cWhite,
    borderColor: cBorder,
    borderWidth: 1,
  });
  p1.drawText("Track Status & Download PDF", {
    x: 52,
    y: currentY - 18,
    size: 9.5,
    font: fontBold,
    color: cNavy,
  });
  p1.drawText("• Go to /registration-status at any time.", {
    x: 52,
    y: currentY - 33,
    size: 8,
    font: fontRegular,
    color: cDark,
  });
  p1.drawText("• Look up by Email (OTP) or Registration ID.", {
    x: 52,
    y: currentY - 47,
    size: 8,
    font: fontRegular,
    color: cDark,
  });
  p1.drawText("• Update candidate details if needed.", {
    x: 52,
    y: currentY - 61,
    size: 8,
    font: fontRegular,
    color: cDark,
  });
  p1.drawText("• Download A4 Confirmation Pass upon approval.", {
    x: 52,
    y: currentY - 75,
    size: 8,
    font: fontBold,
    color: cEmerald,
  });

  // Box Right: Video Audition
  p1.drawRectangle({
    x: 42 + colW + 12,
    y: currentY - 95,
    width: colW,
    height: 95,
    color: cWhite,
    borderColor: cBorder,
    borderWidth: 1,
  });
  p1.drawText("Video Audition Guidelines", {
    x: 42 + colW + 22,
    y: currentY - 18,
    size: 9.5,
    font: fontBold,
    color: cNavy,
  });
  p1.drawText("• Record a 1-minute intro & cultural talent video.", {
    x: 42 + colW + 22,
    y: currentY - 33,
    size: 8,
    font: fontRegular,
    color: cDark,
  });
  p1.drawText("• Post on TikTok / Instagram using event hashtags.", {
    x: 42 + colW + 22,
    y: currentY - 47,
    size: 8,
    font: fontRegular,
    color: cDark,
  });
  p1.drawText("• WhatsApp video directly to Managing Director:", {
    x: 42 + colW + 22,
    y: currentY - 61,
    size: 8,
    font: fontRegular,
    color: cDark,
  });
  p1.drawText("  Gaurav Gupta: +977 9704571941", {
    x: 42 + colW + 22,
    y: currentY - 75,
    size: 8.5,
    font: fontBold,
    color: cBlue,
  });

  // Page 1 Footer
  p1.drawText("Page 1 of 2  •  Official Guide  •  The Origin Foundation", {
    x: 42,
    y: 30,
    size: 8,
    font: fontRegular,
    color: cMuted,
  });

  // =========================================================================
  // PAGE 2: ADMINISTRATOR & ORGANIZER OPERATIONS MANUAL
  // =========================================================================
  const p2 = pdfDoc.addPage([595.28, 841.89]);

  // Decorative border
  p2.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: cBorder,
    borderWidth: 1.5,
  });

  // Top Navy Header
  p2.drawRectangle({
    x: 22,
    y: height - 100,
    width: width - 44,
    height: 78,
    color: cNavy,
  });

  p2.drawText("THE ORIGIN FOUNDATION", {
    x: 42,
    y: height - 50,
    size: 16,
    font: fontBold,
    color: cWhite,
  });

  p2.drawText("MITHILA QUEEN PLATFORM • ADMINISTRATOR & ORGANIZER MANUAL", {
    x: 42,
    y: height - 68,
    size: 9.5,
    font: fontBold,
    color: rgb(180 / 255, 215 / 255, 255 / 255),
  });

  p2.drawText("Private Operations Desk  |  Leadership: Gaurav Gupta & Dipendra Shah Kalwar", {
    x: 42,
    y: height - 84,
    size: 8,
    font: fontOblique,
    color: rgb(220 / 255, 235 / 255, 255 / 255),
  });

  // Page 2 Title
  p2.drawText("PART 2: ADMIN WORKSPACES & REVIEW WORKFLOW", {
    x: 42,
    y: height - 125,
    size: 12,
    font: fontBold,
    color: cBlue,
  });

  // Admin Credentials Card
  p2.drawRectangle({
    x: 42,
    y: height - 190,
    width: width - 84,
    height: 55,
    color: cBg,
    borderColor: cBorder,
    borderWidth: 1,
  });

  p2.drawText("Admin Login Credentials (/admin/login)", {
    x: 54,
    y: height - 146,
    size: 10,
    font: fontBold,
    color: cNavy,
  });
  p2.drawText("• Primary Admin: originfoundation107@gmail.com   |   Password: originfoundation107", {
    x: 54,
    y: height - 162,
    size: 8.5,
    font: fontBold,
    color: cDark,
  });
  p2.drawText("• Secondary Admin: admin@originfoundation.com      |   Password: originfoundation107", {
    x: 54,
    y: height - 176,
    size: 8.5,
    font: fontBold,
    color: cDark,
  });

  // Section: The 6 Admin Workspaces
  let aY = height - 215;
  p2.drawText("Sidebar Navigation & Workspaces", {
    x: 42,
    y: aY,
    size: 11,
    font: fontBold,
    color: cNavy,
  });

  const adminModules = [
    { name: "1. Dashboard", desc: "Live KPI metrics: total registrations, pending payments, applications under review, and approved candidates." },
    { name: "2. Registration Form", desc: "Drag-and-drop form builder, step reordering, payment QR upload, availability dates, and publish controls." },
    { name: "3. Event Settings", desc: "Configure competition schedule, venue, proposed prizes, FAQs (>10 items), and social media instructions." },
    { name: "4. Mithila Queen Apps", desc: "Review candidate dossiers, inspect receipts with lightbox zoom, 1-click verify payments, and adjudicate entries." },
    { name: "5. Inquiries Desk", desc: "View incoming public inquiries from contact page, check timestamps, and reply directly via official email." },
    { name: "6. Communications", desc: "Send targeted broadcast emails, audition updates, and announcements to registered candidates." },
  ];

  aY -= 20;
  for (const mod of adminModules) {
    p2.drawRectangle({
      x: 42,
      y: aY - 24,
      width: width - 84,
      height: 25,
      color: cWhite,
      borderColor: cBorder,
      borderWidth: 0.75,
    });

    p2.drawText(mod.name, {
      x: 52,
      y: aY - 13,
      size: 8.5,
      font: fontBold,
      color: cNavy,
    });

    p2.drawText(mod.desc, {
      x: 165,
      y: aY - 13,
      size: 7.8,
      font: fontRegular,
      color: cDark,
    });

    aY -= 30;
  }

  // Section: Payment & Application Adjudication Procedure
  aY -= 10;
  p2.drawText("Payment Verification & Candidate Adjudication Protocol", {
    x: 42,
    y: aY,
    size: 11,
    font: fontBold,
    color: cNavy,
  });

  aY -= 18;
  p2.drawRectangle({
    x: 42,
    y: aY - 135,
    width: width - 84,
    height: 135,
    color: cBg,
    borderColor: cBorder,
    borderWidth: 1,
  });

  p2.drawText("Workflow Tabs (/admin/responses):", {
    x: 54,
    y: aY - 18,
    size: 9,
    font: fontBold,
    color: cNavy,
  });
  p2.drawText("Use the 6 top tabs: 'Needs Payment Check', 'Ready for Review', 'Approved', 'Clarifications', etc.", {
    x: 54,
    y: aY - 32,
    size: 8.5,
    font: fontRegular,
    color: cDark,
  });

  p2.drawText("Step A: Fast Payment Verification", {
    x: 54,
    y: aY - 50,
    size: 9,
    font: fontBold,
    color: cAmber,
  });
  p2.drawText("• Click the 'Receipt' badge on any row to open the full-resolution screenshot preview in lightbox.", {
    x: 54,
    y: aY - 64,
    size: 8.5,
    font: fontRegular,
    color: cDark,
  });
  p2.drawText("• Check against bank records. Click the green 'Verify' button on the row to verify with 1 click.", {
    x: 54,
    y: aY - 78,
    size: 8.5,
    font: fontRegular,
    color: cDark,
  });

  p2.drawText("Step B: Candidate Adjudication & Official PDF Generation", {
    x: 54,
    y: aY - 96,
    size: 9,
    font: fontBold,
    color: cEmerald,
  });
  p2.drawText("• Open candidate dossier. Review essays, minor safeguarding consent, video link, and identity document.", {
    x: 54,
    y: aY - 110,
    size: 8.5,
    font: fontRegular,
    color: cDark,
  });
  p2.drawText("• Click 'Approve & Issue Confirmation' -> Automatically creates verified A4 PDF Pass & emails it to candidate.", {
    x: 54,
    y: aY - 124,
    size: 8.5,
    font: fontBold,
    color: cNavy,
  });

  // Section: Publishing Rules & Safeguards
  aY -= 155;
  p2.drawText("Important Operational Safeguards", {
    x: 42,
    y: aY,
    size: 11,
    font: fontBold,
    color: cNavy,
  });

  aY -= 16;
  p2.drawRectangle({
    x: 42,
    y: aY - 65,
    width: width - 84,
    height: 65,
    color: cWhite,
    borderColor: cBorder,
    borderWidth: 1,
  });

  p2.drawText("• Merchant Payment QR Guard: Form cannot be published until the official merchant QR is uploaded.", {
    x: 54,
    y: aY - 16,
    size: 8.5,
    font: fontRegular,
    color: cDark,
  });
  p2.drawText("• Official Template Restore: In Form Builder, click 'Official Template' to restore verified 7-step structure.", {
    x: 54,
    y: aY - 30,
    size: 8.5,
    font: fontRegular,
    color: cDark,
  });
  p2.drawText("• Minor Verification: System strictly enforces guardian info & timestamped consent for participants < 18.", {
    x: 54,
    y: aY - 44,
    size: 8.5,
    font: fontRegular,
    color: cDark,
  });
  p2.drawText("• Excel Export: 1-click administrative data export from the responses desk for reporting.", {
    x: 54,
    y: aY - 58,
    size: 8.5,
    font: fontRegular,
    color: cDark,
  });

  // Page 2 Footer
  p2.drawText("Page 2 of 2  •  Official Guide  •  The Origin Foundation  •  Janakpur Dham, Nepal", {
    x: 42,
    y: 30,
    size: 8,
    font: fontRegular,
    color: cMuted,
  });

  // Save to file
  const pdfBytes = await pdfDoc.save();

  // 1. Save in public directory
  const publicPath = path.join(process.cwd(), "public", "ORIGIN_FOUNDATION_USER_GUIDE.pdf");
  fs.writeFileSync(publicPath, pdfBytes);
  console.log("✅ PDF saved to:", publicPath);

  // 2. Save in Artifacts directory
  const artifactDir = "C:\\Users\\NITRO\\.gemini\\antigravity\\brain\\eafdf489-3935-44f9-b346-d18b0a6ac593";
  if (fs.existsSync(artifactDir)) {
    const artifactPath = path.join(artifactDir, "ORIGIN_FOUNDATION_USER_GUIDE.pdf");
    fs.writeFileSync(artifactPath, pdfBytes);
    console.log("✅ PDF saved to Artifacts:", artifactPath);
  }

  // 3. Save in root directory
  const rootPath = path.join(process.cwd(), "ORIGIN_FOUNDATION_USER_GUIDE.pdf");
  fs.writeFileSync(rootPath, pdfBytes);
  console.log("✅ PDF saved to root:", rootPath);
}

generateUserGuidePdf().catch(console.error);


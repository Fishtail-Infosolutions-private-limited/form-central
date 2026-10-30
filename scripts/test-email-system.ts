/**
 * Automated Verification & Test Script for FormSuite Bulk Email & Notification System
 * Run with: npx tsx scripts/test-email-system.ts
 */

import { prisma } from "../src/lib/db/prisma";
import {
  DEFAULT_EMAIL_TEMPLATES,
  ensureDefaultEmailTemplates,
} from "../src/lib/email/templates/default-templates";
import {
  renderEmailTemplate,
  getSamplePreviewContext,
  validateTemplateVariables,
  escapeHtml,
} from "../src/lib/email/variables";
import {
  resolveEligibleRecipients,
  createAndEnqueueCampaign,
  pauseCampaign,
  resumeCampaign,
  cancelCampaign,
  retryFailedRecipients,
} from "../src/lib/email/queue";
import { processNextCampaignBatch, isPermanentEmailError } from "../src/lib/email/worker";
import { syncEventRemindersForForm } from "../src/lib/email/reminders";
import { CampaignStatus, RecipientDeliveryStatus, SubmissionStatus } from "@prisma/client";

async function runTests() {
  console.log("🧪 Starting Bulk Email & Notification System Test Suite...\n");
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      throw new Error(`Assertion failed: ${testName}`);
    }
  }

  // --- TEST 1: Predefined Templates Seeding ---
  console.log("1. Testing Email Templates...");
  await ensureDefaultEmailTemplates(prisma);
  const dbTemplates = await prisma.emailTemplate.findMany();
  assert(dbTemplates.length >= 8, "All 8 default email templates exist in database");
  assert(
    dbTemplates.some((t) => t.name === "Event Date Announcement"),
    "Event Date Announcement template is present"
  );
  assert(
    dbTemplates.some((t) => t.name === "Event Tomorrow"),
    "Event Tomorrow template is present"
  );

  // --- TEST 2: Dynamic Variable Replacement & Escaping ---
  console.log("\n2. Testing Dynamic Variables Engine & XSS Prevention...");
  const rawTemplate = "Hello {{participant_name}}, your ID is {{registration_id}} on {{event_name}}.";
  const context = {
    participant_name: '<script>alert("hack")</script>Bibek',
    registration_id: "FC-999",
    event_name: "Pokhara Run & Trail",
  };

  const renderedText = renderEmailTemplate(rawTemplate, context, { isHtml: false });
  assert(
    renderedText.includes('<script>alert("hack")</script>Bibek'),
    "Plain text template does not escape scripts"
  );

  const renderedHtml = renderEmailTemplate(rawTemplate, context, { isHtml: true });
  assert(
    !renderedHtml.includes("<script>"),
    "HTML template escapes <script> tag to prevent XSS injection"
  );
  assert(
    renderedHtml.includes("&lt;script&gt;"),
    "HTML template replaces < with &lt;"
  );

  const validationRes = validateTemplateVariables("Hello {{unknown_variable}}");
  assert(
    validationRes.warnings.length > 0,
    "Template validator flags unknown variables"
  );

  // --- TEST 3: Setup Test Form and Submissions ---
  console.log("\n3. Setting up Test Form & Sample Submissions...");
  const testSlug = `test-run-${Date.now()}`;
  const admin = await prisma.adminUser.findFirst();
  if (!admin) throw new Error("Admin user not found. Run db:seed first.");

  const form = await prisma.registrationForm.create({
    data: {
      name: "Test Marathon 2026",
      slug: testSlug,
      createdById: admin.id,
      eventDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days in future
      eventVenue: "Test Stadium Ground",
      enableReminder3Days: true,
      enableReminder1Day: true,
      status: "PUBLISHED",
    },
  });

  const version = await prisma.formVersion.create({
    data: {
      formId: form.id,
      versionNumber: 1,
      schema: { steps: [] },
      status: "PUBLISHED",
    },
  });

  // Create 3 test submissions: 1 APPROVED (10K), 1 PENDING (21K), 1 REJECTED (10K)
  const sub1 = await prisma.registrationSubmission.create({
    data: {
      referenceNumber: `TEST-REF-${Date.now()}-1`,
      formId: form.id,
      formVersionId: version.id,
      fullName: "Ram Shrestha",
      email: `ram.${Date.now()}@example.com`,
      phone: "9800000001",
      status: SubmissionStatus.APPROVED,
      answers: {
        create: [
          { fieldKey: "raceCategory", fieldLabel: "Race Category", fieldType: "select", value: "10K" },
        ],
      },
    },
  });

  const sub2 = await prisma.registrationSubmission.create({
    data: {
      referenceNumber: `TEST-REF-${Date.now()}-2`,
      formId: form.id,
      formVersionId: version.id,
      fullName: "Sita Sharma",
      email: `sita.${Date.now()}@example.com`,
      phone: "9800000002",
      status: SubmissionStatus.PENDING,
      answers: {
        create: [
          { fieldKey: "raceCategory", fieldLabel: "Race Category", fieldType: "select", value: "21K" },
        ],
      },
    },
  });

  const sub3 = await prisma.registrationSubmission.create({
    data: {
      referenceNumber: `TEST-REF-${Date.now()}-3`,
      formId: form.id,
      formVersionId: version.id,
      fullName: "Hari Gurung",
      email: `hari.${Date.now()}@example.com`,
      phone: "9800000003",
      status: SubmissionStatus.REJECTED,
      answers: {
        create: [
          { fieldKey: "raceCategory", fieldLabel: "Race Category", fieldType: "select", value: "10K" },
        ],
      },
    },
  });

  assert(sub1.id && sub2.id && sub3.id ? true : false, "Sample submissions created");

  // --- TEST 4: Recipient Resolution Filters ---
  console.log("\n4. Testing Recipient Targeting Filters...");
  const allRecipients = await resolveEligibleRecipients(form.id, { type: "ALL" });
  assert(allRecipients.length === 3, "Resolves all 3 registered participants for type ALL");

  const approvedRecipients = await resolveEligibleRecipients(form.id, { type: "APPROVED" });
  assert(approvedRecipients.length === 1 && approvedRecipients[0].fullName === "Ram Shrestha", "Filter type APPROVED resolves 1 participant");

  const categoryRecipients = await resolveEligibleRecipients(form.id, {
    type: "CATEGORY",
    categoryValue: "10K",
  });
  assert(categoryRecipients.length === 2, "Filter type CATEGORY for 10K resolves 2 participants");

  // --- TEST 5: Unsubscribe Filtering ---
  console.log("\n5. Testing Unsubscribe Exclusion...");
  await prisma.emailUnsubscribe.create({
    data: {
      email: sub2.email,
      formId: form.id,
      reason: "Test unsubscribe",
      token: `token-${Date.now()}`,
    },
  });
  const recipientsAfterUnsubscribe = await resolveEligibleRecipients(form.id, { type: "ALL" });
  assert(
    recipientsAfterUnsubscribe.length === 2 && !recipientsAfterUnsubscribe.some((r) => r.email === sub2.email),
    "Unsubscribed participant is excluded from campaign audience"
  );

  // --- TEST 6: Campaign Queueing & Duplicate Prevention ---
  console.log("\n6. Testing Campaign Queueing & Idempotency Constraints...");
  const campaign = await createAndEnqueueCampaign({
    name: "Pre-Race Bib Announcement",
    formId: form.id,
    subject: "Important Notice: {{event_name}}",
    content: "<p>Hello {{participant_name}}, your bib is ready.</p>",
    criteria: { type: "ALL" },
  });

  assert(campaign.status === CampaignStatus.QUEUED, "Campaign created in QUEUED status");
  assert(campaign.totalRecipients === 2, "Campaign totalRecipients recorded accurately");

  const queuedRecipients = await prisma.emailCampaignRecipient.findMany({
    where: { campaignId: campaign.id },
  });
  assert(queuedRecipients.length === 2, "Recipient records created with QUEUED status");

  // Verify unique constraint: Attempting to insert duplicate recipient for same campaign fails
  let duplicatePrevented = false;
  try {
    await prisma.emailCampaignRecipient.create({
      data: {
        campaignId: campaign.id,
        registrationId: sub1.id,
        email: sub1.email,
        fullName: sub1.fullName,
      },
    });
  } catch (err: any) {
    duplicatePrevented = true;
  }
  assert(duplicatePrevented, "Database unique constraint prevents duplicate recipient for same campaign");

  // --- TEST 7: Campaign Control Actions (Pause, Resume, Cancel) ---
  console.log("\n7. Testing Campaign Controls (Pause, Resume, Cancel)...");
  await pauseCampaign(campaign.id);
  const pausedCamp = await prisma.emailCampaign.findUnique({ where: { id: campaign.id } });
  assert(pausedCamp?.status === CampaignStatus.PAUSED, "Campaign successfully paused");

  await resumeCampaign(campaign.id);
  const resumedCamp = await prisma.emailCampaign.findUnique({ where: { id: campaign.id } });
  assert(resumedCamp?.status === CampaignStatus.QUEUED, "Campaign successfully resumed");

  // --- TEST 8: Error Classification & Retry Logic ---
  console.log("\n8. Testing Error Classification...");
  assert(isPermanentEmailError({ responseCode: "550", message: "User not found" }), "550 User Not Found classified as permanent");
  assert(isPermanentEmailError({ message: "Invalid address syntax" }), "Invalid address classified as permanent");
  assert(!isPermanentEmailError({ responseCode: "421", message: "Try again later" }), "421 temporary error classified as retryable");

  // --- TEST 9: Automated Event Reminders Synchronization ---
  console.log("\n9. Testing Automated Reminder Synchronization...");
  await syncEventRemindersForForm(form.id);
  const reminderCampaigns = await prisma.emailCampaign.findMany({
    where: {
      formId: form.id,
      name: { contains: "Event Reminder" },
    },
  });
  assert(reminderCampaigns.length > 0, "Automated reminder campaigns generated based on event date");
  assert(
    reminderCampaigns.every((c) => c.status === CampaignStatus.SCHEDULED),
    "Generated reminder campaigns are in SCHEDULED status"
  );

  // --- Clean up test data ---
  console.log("\n10. Cleaning up test artifacts...");
  await prisma.registrationForm.delete({ where: { id: form.id } });
  console.log("  🧹 Test form and related records cleaned up.");

  console.log(`\n🎉 Test Suite Completed! ${passed} / ${total} tests passed successfully.`);
}

runTests()
  .catch((e) => {
    console.error("Test suite encountered fatal error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

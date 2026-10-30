import { PrismaClient, AdminRole, FormStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ensureDefaultEmailTemplates } from "../src/lib/email/templates/default-templates";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Create or update Default Super Admin
  const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || "admin@formcentral.com";
  const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || "fishtailinfosolutions123";
  const passwordHash = await bcrypt.hash(defaultPassword, 12);

  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      name: "Event Administrator",
    },
    create: {
      email: adminEmail,
      name: "Event Administrator",
      passwordHash,
      role: AdminRole.SUPER_ADMIN,
    },
  });

  console.log(`✅ Admin user seeded: ${admin.email}`);

  // 2. Create Sample Running Competition Form: "Pokhara City Run 2026"
  const sampleSlug = "pokhara-city-run-2026";
  const existingForm = await prisma.registrationForm.findUnique({
    where: { slug: sampleSlug },
  });

  if (!existingForm) {
    const formSchema = {
      steps: [
        {
          id: "step-1",
          title: "Personal Information",
          description: "Basic participant details and email verification",
          order: 0,
          fields: [
            {
              id: "field-fullname",
              fieldKey: "fullName",
              type: "text",
              label: "Full Name",
              placeholder: "e.g. Bibek Poudel",
              description: "Enter your legal name as on your official ID",
              required: true,
              isSystem: true,
              order: 0,
            },
            {
              id: "field-email",
              fieldKey: "email",
              type: "email",
              label: "Email Address",
              placeholder: "e.g. runner@example.com",
              description: "Verification code will be sent to this email",
              required: true,
              isSystem: true,
              order: 1,
            },
            {
              id: "field-phone",
              fieldKey: "phone",
              type: "phone",
              label: "Phone Number",
              placeholder: "e.g. +977 9800000000",
              description: "Active mobile number for race day SMS updates",
              required: true,
              isSystem: true,
              order: 2,
            },
          ],
        },
        {
          id: "step-2",
          title: "Race Category & Profile",
          description: "Choose your race category and gear preferences",
          order: 1,
          fields: [
            {
              id: "field-race-cat",
              fieldKey: "raceCategory",
              type: "select",
              label: "Race Category",
              placeholder: "Select your race distance",
              description: "Official timing chip provided for 10K and 21K",
              required: true,
              order: 0,
              options: [
                { label: "5K Open Fun Run", value: "5k" },
                { label: "10K Competitive Road Race", value: "10k" },
                { label: "21K Half Marathon Championship", value: "21k" },
              ],
            },
            {
              id: "field-tshirt",
              fieldKey: "tshirtSize",
              type: "radio",
              label: "Technical Race T-Shirt Size",
              required: true,
              order: 1,
              options: [
                { label: "Small (S - 36\")", value: "S" },
                { label: "Medium (M - 38\")", value: "M" },
                { label: "Large (L - 40\")", value: "L" },
                { label: "Extra Large (XL - 42\")", value: "XL" },
                { label: "Double XL (XXL - 44\")", value: "XXL" },
              ],
            },
            {
              id: "field-bib-name",
              fieldKey: "bibName",
              type: "text",
              label: "Custom Bib Name",
              placeholder: "Name printed on your bib (Max 12 chars)",
              required: false,
              order: 2,
              validation: {
                maxLength: 12,
              },
            },
            {
              id: "field-emergency-name",
              fieldKey: "emergencyName",
              type: "text",
              label: "Emergency Contact Name",
              placeholder: "Full name of contact person",
              required: true,
              order: 3,
            },
            {
              id: "field-emergency-phone",
              fieldKey: "emergencyPhone",
              type: "phone",
              label: "Emergency Contact Phone",
              placeholder: "+977 98...",
              required: true,
              order: 4,
            },
            {
              id: "field-has-medical",
              fieldKey: "hasMedicalCondition",
              type: "radio",
              label: "Do you have any pre-existing medical conditions or allergies?",
              required: true,
              order: 5,
              options: [
                { label: "No", value: "no" },
                { label: "Yes", value: "yes" },
              ],
            },
            {
              id: "field-medical-details",
              fieldKey: "medicalDetails",
              type: "textarea",
              label: "Please specify your medical condition / medication",
              placeholder: "Asthma, heart condition, allergies, current medications...",
              required: false,
              order: 6,
              condition: {
                fieldKey: "hasMedicalCondition",
                operator: "equals",
                value: "yes",
              },
            },
          ],
        },
        {
          id: "step-3",
          title: "Photo & Verification",
          description: "Upload runner identification and acknowledge waiver",
          order: 2,
          fields: [
            {
              id: "field-photo",
              fieldKey: "runnerPhoto",
              type: "image",
              label: "Passport Size Runner Photo",
              description: "Recent portrait photograph for race accreditation (JPEG/PNG up to 10MB)",
              required: true,
              order: 0,
            },
            {
              id: "field-intro-video",
              fieldKey: "motivationVideo",
              type: "video",
              label: "Runner Introduction Video (Optional)",
              description: "Short 30-sec video sharing your training goal (MP4/WebM up to 100MB)",
              required: false,
              order: 1,
            },
            {
              id: "field-terms",
              fieldKey: "termsAccepted",
              type: "checkbox",
              label: "I agree to the Pokhara City Run 2026 Rules, Medical Waiver & Liability Release",
              required: true,
              order: 2,
            },
          ],
        },
      ],
    };

    const form = await prisma.registrationForm.create({
      data: {
        name: "Pokhara City Run 2026",
        slug: sampleSlug,
        description:
          "Official registration for the prestigious Pokhara City Run 2026. Scenic lakeside route with Annapurna mountain views.",
        instructions:
          "Please verify your email address to begin. Have your emergency contact and profile photo ready.",
        status: FormStatus.PUBLISHED,
        createdById: admin.id,
      },
    });

    const version = await prisma.formVersion.create({
      data: {
        formId: form.id,
        versionNumber: 1,
        schema: formSchema,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });

    await prisma.registrationForm.update({
      where: { id: form.id },
      data: {
        publishedVersionId: version.id,
      },
    });

    console.log(`✅ Sample competition form created: /register/${sampleSlug}`);
  }

  // 3. Seed Default Bulk Email Templates
  await ensureDefaultEmailTemplates(prisma);
  console.log("✅ Default email templates seeded successfully!");

  console.log("✨ Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

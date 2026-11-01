import { PrismaClient, AdminRole, FormStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ensureDefaultEmailTemplates } from "../src/lib/email/templates/default-templates";
import { DEFAULT_MITHILA_QUEEN_SCHEMA } from "../src/lib/constants/default-form-schema";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Create or update Default Admins
  const defaultPassword = "originfoundation107";
  const passwordHash = await bcrypt.hash(defaultPassword, 12);

  // Primary Admin
  const primaryEmail = "originfoundation107@gmail.com";
  const primaryAdmin = await prisma.adminUser.upsert({
    where: { email: primaryEmail },
    update: {
      passwordHash,
      name: "The Origin Foundation Admin",
      role: AdminRole.SUPER_ADMIN,
    },
    create: {
      email: primaryEmail,
      name: "The Origin Foundation Admin",
      passwordHash,
      role: AdminRole.SUPER_ADMIN,
    },
  });

  // Secondary Admin
  const secondaryEmail = "admin@originfoundation.com";
  await prisma.adminUser.upsert({
    where: { email: secondaryEmail },
    update: {
      passwordHash,
      name: "Origin Administrator",
      role: AdminRole.SUPER_ADMIN,
    },
    create: {
      email: secondaryEmail,
      name: "Origin Administrator",
      passwordHash,
      role: AdminRole.SUPER_ADMIN,
    },
  });

  // Default Admins are safely upserted without deleting existing accounts
  console.log(`✅ Default administrators seeded: ${primaryEmail} and ${secondaryEmail}`);

  // Seed Default Official Site Settings for The Origin Foundation & Mithila Queen
  await prisma.siteSetting.upsert({
    where: { id: "primary" },
    update: {},
    create: {
      id: "primary",
      organizationName: "The Origin Foundation",
      organizationTagline: "Rooted in Identity. Driven by Purpose.",
      competitionName: "Mithila Queen",
      competitionTagline: "Celebrating Mithila's Culture, Confidence & Talent.",
      location: "Janakpur Dham, Nepal",
      officialEmail: "originfoundation107@gmail.com",
      registrationFee: 399,
      eventSchedule: "To Be Announced",
      eventVenue: "To Be Announced",
      isRegistrationOpen: true,
      whatsappContact: "+977 9704571941",
      prizesJson: [
        {
          position: "First Prize",
          title: "iPhone 18 Pro Max, Red, 512 GB",
          status: "Proposed by organizers",
        },
        {
          position: "Second Prize",
          title: "MAC beauty products (approx. NPR 30,000 value)",
          status: "Proposed value",
        },
        {
          position: "Third Prize",
          title: "Smartphone / Premium Electronics",
          status: "To be confirmed by organizers",
        },
        {
          position: "Fourth & Fifth Prize",
          title: "To be announced",
          status: "Pending authorization",
        },
      ],
      faqsJson: [
        {
          q: "What is The Origin Foundation?",
          a: "The Origin Foundation is a platform being developed in Janakpur Dham, Nepal, to support cultural identity, talent, and community participation through initiatives such as Mithila Queen.",
        },
        {
          q: "What is Mithila Queen?",
          a: "Mithila Queen is a cultural and talent-oriented competition intended to celebrate Mithila's heritage, confidence, creativity, and individual talent.",
        },
        {
          q: "What is the registration fee?",
          a: "The registration fee is strictly NPR 399 per registration, collected in Nepalese rupees only.",
        },
        {
          q: "How can I pay the registration fee?",
          a: "Follow the official payment instructions on the website and scan the official QR code. Submit your transaction reference and payment screenshot for administrative verification.",
        },
        {
          q: "Does uploading a payment screenshot guarantee registration approval?",
          a: "No. The organizing team independently verifies the actual bank transfer before the application advances to the approval review workflow.",
        },
        {
          q: "Are all three social media accounts required?",
          a: "No. At least one valid Instagram, TikTok, or Facebook profile is required; the other two are optional. We never ask for passwords.",
        },
        {
          q: "When will the event take place?",
          a: "The event schedule and venue are currently To Be Announced. Confirmed dates will be published through official announcements.",
        },
        {
          q: "When will I receive my PDF confirmation?",
          a: "Your official PDF registration confirmation is generated and dispatched to your email only after payment is verified and your application is approved by the organizers.",
        },
        {
          q: "What if I make a mistake in my application?",
          a: "Contact the organizing team at originfoundation107@gmail.com or follow the correction instructions provided through your registration status dashboard.",
        },
        {
          q: "How can I contact the organizers?",
          a: "Email: originfoundation107@gmail.com | Gaurav Gupta: +977 9704571941 | Dipendra Shah Kalwar: +977 981-2005468.",
        },
      ],
    },
  });

  // 2. Create or Update Flagship Form: "Mithila Queen 2026"
  const mithilaSlug = "mithila-queen";
  let mithilaForm = await prisma.registrationForm.findUnique({
    where: { slug: mithilaSlug },
    include: {
      versions: {
        orderBy: { versionNumber: "desc" },
      },
    },
  });

  if (!mithilaForm) {
    mithilaForm = await prisma.registrationForm.create({
      data: {
        name: "Mithila Queen 2026",
        slug: mithilaSlug,
        description:
          "Official flagship competition celebrating Mithila's culture, confidence & talent in Janakpur Dham, Nepal. Fee: NPR 399.",
        instructions:
          "Complete the structured online application. For applicants under 18, legal guardian consent is recorded. Keep your transaction reference ready.",
        status: FormStatus.PUBLISHED,
        createdById: primaryAdmin.id,
        isUnlimitedCapacity: true,
        isDeadlineEnabled: false,
      },
      include: {
        versions: true,
      },
    });

    const v1 = await prisma.formVersion.create({
      data: {
        formId: mithilaForm.id,
        versionNumber: 1,
        schema: DEFAULT_MITHILA_QUEEN_SCHEMA as any,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });

    await prisma.registrationForm.update({
      where: { id: mithilaForm.id },
      data: { publishedVersionId: v1.id },
    });

    console.log(`✅ Created and published flagship form: /register/${mithilaSlug}`);
  } else {
    // If form exists, ensure the published version has the verified default schema
    const latestVersion = mithilaForm.versions?.[0];
    if (!latestVersion) {
      const v1 = await prisma.formVersion.create({
        data: {
          formId: mithilaForm.id,
          versionNumber: 1,
          schema: DEFAULT_MITHILA_QUEEN_SCHEMA as any,
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      });
      await prisma.registrationForm.update({
        where: { id: mithilaForm.id },
        data: { publishedVersionId: v1.id, status: FormStatus.PUBLISHED },
      });
      console.log(`✅ Seeded version 1 schema for existing form: ${mithilaForm.id}`);
    } else {
      // Update latest version to have the official complete schema
      await prisma.formVersion.update({
        where: { id: latestVersion.id },
        data: {
          schema: DEFAULT_MITHILA_QUEEN_SCHEMA as any,
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      });
      await prisma.registrationForm.update({
        where: { id: mithilaForm.id },
        data: { publishedVersionId: latestVersion.id, status: FormStatus.PUBLISHED },
      });
      console.log(`✅ Updated form version ${latestVersion.versionNumber} with verified official PDF schema`);
    }
  }

  // 3. Seed Default Bulk Email Templates
  await ensureDefaultEmailTemplates(prisma);
  console.log("✅ Default email templates seeded successfully!");
  console.log(defaultPassword);
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

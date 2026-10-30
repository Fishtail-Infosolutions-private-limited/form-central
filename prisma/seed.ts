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

  // 1. Seed Managing Directors for The Origin Foundation
  const gauravEmail = process.env.ADMIN_GAURAV_EMAIL || "gaurav.gupta@originfoundation.org";
  const gauravPassword = process.env.ADMIN_GAURAV_PASSWORD || defaultPassword;
  const gauravHash = await bcrypt.hash(gauravPassword, 12);

  await prisma.adminUser.upsert({
    where: { email: gauravEmail },
    update: {
      name: "Gaurav Gupta",
      role: AdminRole.SUPER_ADMIN,
    },
    create: {
      email: gauravEmail,
      name: "Gaurav Gupta",
      passwordHash: gauravHash,
      role: AdminRole.SUPER_ADMIN,
    },
  });

  const dipendraEmail = process.env.ADMIN_DIPENDRA_EMAIL || "dipendra.kalwar@originfoundation.org";
  const dipendraPassword = process.env.ADMIN_DIPENDRA_PASSWORD || defaultPassword;
  const dipendraHash = await bcrypt.hash(dipendraPassword, 12);

  await prisma.adminUser.upsert({
    where: { email: dipendraEmail },
    update: {
      name: "Dipendra Shah Kalwar",
      role: AdminRole.SUPER_ADMIN,
    },
    create: {
      email: dipendraEmail,
      name: "Dipendra Shah Kalwar",
      passwordHash: dipendraHash,
      role: AdminRole.SUPER_ADMIN,
    },
  });

  console.log(`✅ Managing Directors seeded: ${gauravEmail} and ${dipendraEmail}`);

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

  // 2. Create Flagship Form: "Mithila Queen 2026"
  const mithilaSlug = "mithila-queen";
  let mithilaForm = await prisma.registrationForm.findUnique({
    where: { slug: mithilaSlug },
  });

  const mithilaSchema = {
    steps: [
      {
        id: "step-1",
        title: "Personal Information & Location",
        description: "Official legal identification, contact, and geographical address",
        order: 0,
        fields: [
          {
            id: "field-fullname",
            fieldKey: "fullName",
            type: "text",
            label: "Full Legal Name",
            placeholder: "e.g. Anjali Kumari Jha",
            description: "As indicated on official citizenship or birth certificate",
            required: true,
            isSystem: true,
            order: 0,
          },
          {
            id: "field-dob",
            fieldKey: "dob",
            type: "date",
            label: "Date of Birth",
            description: "Used to determine minor safeguarding (<18) requirements",
            required: true,
            order: 1,
          },
          {
            id: "field-email",
            fieldKey: "email",
            type: "email",
            label: "Email Address",
            placeholder: "e.g. anjali@example.com",
            description: "For status updates and official PDF confirmation delivery",
            required: true,
            isSystem: true,
            order: 2,
          },
          {
            id: "field-phone",
            fieldKey: "phone",
            type: "phone",
            label: "Mobile Number",
            placeholder: "e.g. +977 9800000000",
            description: "Primary mobile number for SMS and phone contact",
            required: true,
            isSystem: true,
            order: 3,
          },
          {
            id: "field-alt-phone",
            fieldKey: "alternatePhone",
            type: "phone",
            label: "Alternate Contact Number (Optional)",
            placeholder: "+977 98...",
            required: false,
            order: 4,
          },
          {
            id: "field-province",
            fieldKey: "province",
            type: "select",
            label: "Province",
            required: true,
            order: 5,
            options: [
              { label: "Madhesh Province", value: "Madhesh Province" },
              { label: "Bagmati Province", value: "Bagmati Province" },
              { label: "Koshi Province", value: "Koshi Province" },
              { label: "Gandaki Province", value: "Gandaki Province" },
              { label: "Lumbini Province", value: "Lumbini Province" },
              { label: "Karnali Province", value: "Karnali Province" },
              { label: "Sudurpashchim Province", value: "Sudurpashchim Province" },
            ],
          },
          {
            id: "field-district",
            fieldKey: "district",
            type: "select",
            label: "District",
            required: true,
            order: 6,
            options: [
              { label: "Dhanusha", value: "Dhanusha" },
              { label: "Mahottari", value: "Mahottari" },
              { label: "Sarlahi", value: "Sarlahi" },
              { label: "Siraha", value: "Siraha" },
              { label: "Saptari", value: "Saptari" },
              { label: "Rautahat", value: "Rautahat" },
              { label: "Bara", value: "Bara" },
              { label: "Parsa", value: "Parsa" },
              { label: "Kathmandu Valley", value: "Kathmandu Valley" },
              { label: "Other District", value: "Other District" },
            ],
          },
          {
            id: "field-municipality",
            fieldKey: "municipality",
            type: "text",
            label: "Municipality / Rural Municipality",
            placeholder: "e.g. Janakpurdham Sub-Metropolitan City",
            required: true,
            order: 7,
          },
          {
            id: "field-city-village",
            fieldKey: "cityVillage",
            type: "text",
            label: "City / Village / Tole",
            placeholder: "e.g. Ramanand Chowk, Janakpur",
            required: true,
            order: 8,
          },
          {
            id: "field-current-address",
            fieldKey: "currentAddress",
            type: "textarea",
            label: "Full Current Residential Address",
            placeholder: "House no., street, ward, permanent landmarks...",
            required: true,
            order: 9,
          },
        ],
      },
      {
        id: "step-2",
        title: "Participant Profile & Cultural Heritage",
        description: "Your creative talents, spoken languages, and cultural aspirations",
        order: 1,
        fields: [
          {
            id: "field-motivation",
            fieldKey: "motivationReason",
            type: "textarea",
            label: "Why do you want to participate in Mithila Queen?",
            placeholder: "Share your motivation and aspirations for participating...",
            required: true,
            order: 0,
          },
          {
            id: "field-talents",
            fieldKey: "talentsSkills",
            type: "textarea",
            label: "Talents & Creative Skills",
            placeholder: "Painting, folk music, dance, writing, public speaking...",
            required: false,
            order: 1,
          },
          {
            id: "field-languages",
            fieldKey: "languagesSpoken",
            type: "text",
            label: "Languages Spoken Fluently",
            placeholder: "e.g. Maithili, Nepali, English, Hindi",
            required: true,
            order: 2,
          },
          {
            id: "field-mithila-meaning",
            fieldKey: "mithilaMeaning",
            type: "textarea",
            label: "What does Mithila's cultural heritage mean to you?",
            placeholder: "Reflect on how regional heritage inspires your identity...",
            required: false,
            order: 3,
          },
          {
            id: "field-experience",
            fieldKey: "previousExperience",
            type: "radio",
            label: "Do you have prior competition or stage experience?",
            required: true,
            order: 4,
            options: [
              { label: "No (Newcomer - warmly encouraged)", value: "no" },
              { label: "Yes (Experienced)", value: "yes" },
            ],
          },
        ],
      },
      {
        id: "step-3",
        title: "Additional Details",
        description: "Physical measurements omitted by default to prioritize cultural talent",
        order: 2,
        fields: [
          {
            id: "field-height-note",
            fieldKey: "heightNote",
            type: "text",
            label: "Height & Physical Measurement Notice",
            description: "Height measurements are omitted pending organizer confirmation.",
            required: false,
            order: 0,
          },
        ],
      },
      {
        id: "step-4",
        title: "Social Media Accounts",
        description: "At least one social account required for video audition cross-referencing",
        order: 3,
        fields: [
          {
            id: "field-instagram",
            fieldKey: "instagramHandle",
            type: "text",
            label: "Instagram Username / Profile URL",
            placeholder: "@username or instagram.com/username",
            required: false,
            order: 0,
          },
          {
            id: "field-tiktok",
            fieldKey: "tiktokHandle",
            type: "text",
            label: "TikTok Username / Profile URL",
            placeholder: "@username or tiktok.com/@username",
            required: false,
            order: 1,
          },
          {
            id: "field-facebook",
            fieldKey: "facebookUrl",
            type: "text",
            label: "Facebook Profile URL",
            placeholder: "facebook.com/your.profile",
            required: false,
            order: 2,
          },
        ],
      },
      {
        id: "step-5",
        title: "Photo & Media Uploads",
        description: "Clear portrait photograph for participant identification",
        order: 4,
        fields: [
          {
            id: "field-profile-photo",
            fieldKey: "profilePhotoUrl",
            type: "image",
            label: "Recent Portrait Photo",
            description: "Clear photograph of participant (JPEG/PNG up to 10MB)",
            required: true,
            order: 0,
          },
          {
            id: "field-document",
            fieldKey: "documentUrl",
            type: "file",
            label: "Identity Document / Age Verification (Optional)",
            description: "Citizenship, school ID, or birth certificate (PDF/JPEG up to 10MB)",
            required: false,
            order: 1,
          },
        ],
      },
      {
        id: "step-6",
        title: "Competition Rules & Minor Safeguarding",
        description: "Legal consent and parental acknowledgment for participants under 18",
        order: 5,
        fields: [
          {
            id: "field-agree-rules",
            fieldKey: "agreedToRules",
            type: "checkbox",
            label: "I agree to the official Mithila Queen competition rules and code of conduct",
            required: true,
            order: 0,
          },
          {
            id: "field-agree-privacy",
            fieldKey: "agreedToPrivacy",
            type: "checkbox",
            label: "I accept the privacy policy and consent to administrative data processing",
            required: true,
            order: 1,
          },
        ],
      },
      {
        id: "step-7",
        title: "Review & Registration Fee (NPR 399)",
        description: "Final verification and official QR payment submission",
        order: 6,
        fields: [
          {
            id: "field-fee-notice",
            fieldKey: "feeNotice",
            type: "text",
            label: "Administrative Registration Fee",
            description: "NPR 399 per registration. Payment instructions are provided upon submission.",
            required: false,
            order: 0,
          },
        ],
      },
    ],
  };

  if (!mithilaForm) {
    mithilaForm = await prisma.registrationForm.create({
      data: {
        name: "Mithila Queen 2026",
        slug: mithilaSlug,
        description:
          "Official flagship competition celebrating Mithila's culture, confidence & talent in Janakpur Dham, Nepal. Fee: NPR 399.",
        instructions:
          "Complete all 7 steps. For applicants under 18, guardian consent is recorded. Keep your transaction reference ready.",
        status: FormStatus.PUBLISHED,
        createdById: admin.id,
        isUnlimitedCapacity: true,
        isDeadlineEnabled: false,
      },
    });

    const v1 = await prisma.formVersion.create({
      data: {
        formId: mithilaForm.id,
        versionNumber: 1,
        schema: mithilaSchema,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });

    await prisma.registrationForm.update({
      where: { id: mithilaForm.id },
      data: { publishedVersionId: v1.id },
    });

    console.log(`✅ Seeded flagship form: /register/${mithilaSlug} (ID: ${mithilaForm.id})`);
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

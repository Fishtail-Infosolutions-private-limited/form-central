import { FormSchemaDefinition } from "@/types/form";

/**
 * Official Default Registration Schema for Mithila Queen 2026.
 * Derived strictly from the official project brief and requirements document:
 * - Step 1: Personal Information & Location (Mandatory identity with email OTP guard)
 * - Step 2: Participant Profile & Cultural Background (Specific motivation & cultural questions)
 * - Step 3: Height & Voluntary Details (Voluntary cm measurement, never mandatory)
 * - Step 4: Social Media Accounts (At least 1 required: Instagram, TikTok, or Facebook)
 * - Step 5: Photo & Document Uploads (Clear portrait photo required, optional video/docs)
 * - Step 6: Rules, Minor Safeguarding & Consent (Mandatory parent/guardian consent if < 18)
 * - Step 7: Review & Registration Fee (NPR 399 administrative fee & screenshot verification)
 */
export const DEFAULT_MITHILA_QUEEN_SCHEMA: FormSchemaDefinition = {
  steps: [
    // -------------------------------------------------------------------------
    // STEP 1: Contact & Email Verification (Locked System Step)
    // -------------------------------------------------------------------------
    {
      id: "step-1",
      title: "Contact & Email Verification",
      description: "Official legal identification, contact, and email OTP verification",
      order: 0,
      fields: [
        {
          id: "field-fullname",
          fieldKey: "fullName",
          type: "text",
          label: "Full Legal Name",
          placeholder: "e.g. Anjali Kumari Jha",
          description: "Full legal name as indicated on official citizenship card, birth certificate, or student ID.",
          required: true,
          isSystem: true,
          order: 0,
        },
        {
          id: "field-email",
          fieldKey: "email",
          type: "email",
          label: "Email Address",
          placeholder: "e.g. anjali@example.com",
          description: "Mandatory 6-digit OTP verification code is sent to this address to verify your identity.",
          required: true,
          isSystem: true,
          order: 1,
        },
        {
          id: "field-phone",
          fieldKey: "phone",
          type: "phone",
          label: "Mobile Number",
          placeholder: "e.g. +977 9800000000",
          description: "Primary active WhatsApp or mobile number for event notifications and audition updates.",
          required: true,
          isSystem: true,
          order: 2,
        },
      ],
    },

    // -------------------------------------------------------------------------
    // STEP 2: Personal Information & Location
    // -------------------------------------------------------------------------
    {
      id: "step-personal-location",
      title: "Personal Information & Location",
      description: "Date of birth (minor check) and full residential address in Nepal",
      order: 1,
      fields: [
        {
          id: "field-dob",
          fieldKey: "dob",
          type: "date",
          label: "Date of Birth",
          description: "Required to determine participant age and minor safeguarding (<18) consent requirements.",
          required: true,
          order: 0,
        },
        {
          id: "field-alt-phone",
          fieldKey: "alternatePhone",
          type: "phone",
          label: "Alternate Contact Number (Optional)",
          placeholder: "e.g. +977 98...",
          description: "Optional secondary number or family contact number.",
          required: false,
          order: 1,
        },
        {
          id: "field-province",
          fieldKey: "province",
          type: "select",
          label: "Province",
          description: "Select your current residential province in Nepal.",
          required: true,
          order: 2,
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
          description: "Select your residential district.",
          required: true,
          order: 3,
          options: [
            { label: "Dhanusha", value: "Dhanusha" },
            { label: "Mahottari", value: "Mahottari" },
            { label: "Sarlahi", value: "Sarlahi" },
            { label: "Siraha", value: "Siraha" },
            { label: "Saptari", value: "Saptari" },
            { label: "Rautahat", value: "Rautahat" },
            { label: "Bara", value: "Bara" },
            { label: "Parsa", value: "Parsa" },
            { label: "Kathmandu", value: "Kathmandu" },
            { label: "Lalitpur", value: "Lalitpur" },
            { label: "Bhaktapur", value: "Bhaktapur" },
            { label: "Morang", value: "Morang" },
            { label: "Sunsari", value: "Sunsari" },
            { label: "Other District", value: "Other District" },
          ],
        },
        {
          id: "field-municipality",
          fieldKey: "municipality",
          type: "text",
          label: "Municipality / Rural Municipality",
          placeholder: "e.g. Janakpurdham Sub-Metropolitan City",
          description: "Official municipality, sub-metropolitan city, or gaunpalika name.",
          required: true,
          order: 4,
        },
        {
          id: "field-city-village",
          fieldKey: "cityVillage",
          type: "text",
          label: "City / Village / Tole",
          placeholder: "e.g. Ramanand Chowk, Janakpur",
          description: "Neighborhood, village, or tole name.",
          required: true,
          order: 5,
        },
        {
          id: "field-current-address",
          fieldKey: "currentAddress",
          type: "textarea",
          label: "Full Current Residential Address",
          placeholder: "Ward number, street name, house landmark...",
          description: "Detailed current residential address.",
          required: true,
          order: 6,
        },
        {
          id: "field-short-intro",
          fieldKey: "shortPersonalIntro",
          type: "textarea",
          label: "Short Personal Introduction (Optional)",
          placeholder: "Brief one-paragraph summary introducing yourself...",
          description: "Optional brief overview of your background and interests.",
          required: false,
          order: 7,
        },
      ],
    },

    // -------------------------------------------------------------------------
    // STEP 3: Participant Profile & Cultural Background
    // -------------------------------------------------------------------------
    {
      id: "step-2",
      title: "Participant Profile & Cultural Background",
      description: "Creative aspirations, spoken languages, and cultural connection to Mithila",
      order: 2,
      fields: [
        {
          id: "field-motivation",
          fieldKey: "motivationReason",
          type: "textarea",
          label: "Why do you want to participate in Mithila Queen?",
          placeholder: "Share what inspired you to apply and what you hope to achieve on this platform...",
          description: "Explain your personal motivation, goals, and ambition.",
          required: true,
          order: 0,
        },
        {
          id: "field-mithila-meaning",
          fieldKey: "mithilaMeaning",
          type: "textarea",
          label: "What does Mithila's cultural heritage mean to you?",
          placeholder: "Reflect on how regional arts, traditions, language, or values shape your identity...",
          description: "Reflect on your personal connection to Mithila culture.",
          required: true,
          order: 1,
        },
        {
          id: "field-qualities",
          fieldKey: "qualitiesBrought",
          type: "textarea",
          label: "What qualities or talents would you bring to the competition?",
          placeholder: "Describe the specific skills, poise, leadership, or creativity you bring to the stage...",
          description: "Highlight your unique personal strengths and stage presence.",
          required: true,
          order: 2,
        },
        {
          id: "field-talents",
          fieldKey: "talentsSkills",
          type: "textarea",
          label: "Talents & Creative Skills",
          placeholder: "e.g. Mithila painting, Maithili folk singing, traditional dance, poetry, public speaking...",
          description: "Artistic, creative, or communicative skills you excel in.",
          required: false,
          order: 3,
        },
        {
          id: "field-languages",
          fieldKey: "languagesSpoken",
          type: "text",
          label: "Languages Spoken Fluently",
          placeholder: "e.g. Maithili, Nepali, English, Hindi",
          description: "Languages you can comfortably converse or present in.",
          required: true,
          order: 4,
        },
        {
          id: "field-cultural-interests",
          fieldKey: "culturalInterests",
          type: "textarea",
          label: "Cultural Interests & Community Activities",
          placeholder: "Folk rituals, Madhubani art, festivals (Chhath, Sama Chakeva), community service...",
          description: "Aspects of cultural heritage and social initiative you are passionate about.",
          required: false,
          order: 5,
        },
        {
          id: "field-hobbies",
          fieldKey: "hobbiesInterests",
          type: "textarea",
          label: "Hobbies & Personal Interests",
          placeholder: "Reading, arts, sports, photography, music...",
          required: false,
          order: 6,
        },
        {
          id: "field-education-level",
          fieldKey: "educationLevel",
          type: "select",
          label: "Current Education Level (Voluntary)",
          description: "Optional educational background for jury context.",
          required: false,
          order: 7,
          options: [
            { label: "Secondary School (SEE / Class 10)", value: "SEE" },
            { label: "+2 / Higher Secondary (Class 12)", value: "+2" },
            { label: "Bachelor's Degree", value: "Bachelors" },
            { label: "Master's Degree", value: "Masters" },
            { label: "Professional / Vocational", value: "Vocational" },
            { label: "Other", value: "Other" },
          ],
        },
        {
          id: "field-institution",
          fieldKey: "institution",
          type: "text",
          label: "School / College / Institution (Voluntary)",
          placeholder: "e.g. Janaki Multiple Campus, Janakpur",
          required: false,
          order: 8,
        },
        {
          id: "field-experience",
          fieldKey: "previousExperience",
          type: "radio",
          label: "Do you have prior competition or stage experience?",
          description: "Zero prior experience is required. First-time newcomers are warmly welcomed and evaluated with complete impartiality.",
          required: true,
          order: 9,
          options: [
            { label: "No (First-time newcomer - warmly welcomed)", value: "no" },
            { label: "Yes (Have participated in earlier stage/school events)", value: "yes" },
          ],
        },
        {
          id: "field-experience-details",
          fieldKey: "experienceDetails",
          type: "textarea",
          label: "If yes, please share competition details (Optional)",
          placeholder: "Name of competition, year, position or award achieved...",
          description: "Brief note on earlier stage or cultural events, if any.",
          required: false,
          order: 10,
        },
      ],
    },

    // -------------------------------------------------------------------------
    // STEP 4: Height & Voluntary Details
    // -------------------------------------------------------------------------
    {
      id: "step-3",
      title: "Height & Voluntary Details",
      description: "Voluntary physical information. Mithila Queen is a cultural and talent platform, not a physical modeling contest.",
      order: 3,
      fields: [
        {
          id: "field-height",
          fieldKey: "heightCm",
          type: "number",
          label: "Height in Centimeters (Optional)",
          placeholder: "e.g. 162",
          description: "Voluntary. Height is not mandatory and does not disqualify or influence talent judging.",
          required: false,
          order: 0,
        },
        {
          id: "field-additional-notes",
          fieldKey: "additionalAspirations",
          type: "textarea",
          label: "Additional Aspirations / Notes for Organizers (Optional)",
          placeholder: "Anything else you would like the organizing committee to know about you...",
          required: false,
          order: 1,
        },
      ],
    },

    // -------------------------------------------------------------------------
    // STEP 5: Social Media Accounts
    // -------------------------------------------------------------------------
    {
      id: "step-4",
      title: "Social Media Accounts",
      description: "At least one social account (Instagram, TikTok, or Facebook) is required for video audition cross-referencing.",
      order: 4,
      fields: [
        {
          id: "field-instagram",
          fieldKey: "instagramHandle",
          type: "text",
          label: "Instagram Profile (Username or URL)",
          placeholder: "@yourusername or instagram.com/yourusername",
          description: "Used to tag you in audition promotions and verify social video submissions.",
          required: false,
          order: 0,
        },
        {
          id: "field-tiktok",
          fieldKey: "tiktokHandle",
          type: "text",
          label: "TikTok Profile (Username or URL)",
          placeholder: "@yourusername or tiktok.com/@yourusername",
          description: "Optional TikTok handle for #MithilaQueen2026 video tagging.",
          required: false,
          order: 1,
        },
        {
          id: "field-facebook",
          fieldKey: "facebookUrl",
          type: "text",
          label: "Facebook Profile URL",
          placeholder: "facebook.com/your.profile",
          description: "Optional Facebook profile link.",
          required: false,
          order: 2,
        },
      ],
    },

    // -------------------------------------------------------------------------
    // STEP 6: Photo & Document Uploads
    // -------------------------------------------------------------------------
    {
      id: "step-5",
      title: "Photo & Media Uploads",
      description: "Clear portrait photograph for candidate identification dossier.",
      order: 5,
      fields: [
        {
          id: "field-profile-photo",
          fieldKey: "profilePhotoUrl",
          type: "image",
          label: "Recent Portrait Photograph",
          description: "Clear portrait photo showing your face in good natural lighting (JPEG, PNG up to 10MB).",
          required: true,
          order: 0,
        },
        {
          id: "field-additional-photo",
          fieldKey: "additionalPhotoUrl",
          type: "image",
          label: "Additional Full-Length / Traditional Attire Photo (Optional)",
          description: "Optional full-length photo in cultural, traditional, or formal attire (JPEG, PNG up to 10MB).",
          required: false,
          order: 1,
        },
        {
          id: "field-document",
          fieldKey: "documentUrl",
          type: "file",
          label: "Identity Document / Age Verification (Optional)",
          description: "Citizenship card, school/college student ID, or birth certificate (PDF, JPG up to 10MB). Securely stored for private verification.",
          required: false,
          order: 2,
        },
        {
          id: "field-video",
          fieldKey: "videoUrl",
          type: "video",
          label: "Audition Video File / Introduction (Optional)",
          description: "Optional direct video upload (MP4, MOV up to 100MB). You can also send your video directly via WhatsApp to +977 9704571941.",
          required: false,
          order: 3,
        },
      ],
    },

    // -------------------------------------------------------------------------
    // STEP 7: Rules, Minor Safeguarding & Legal Consents
    // -------------------------------------------------------------------------
    {
      id: "step-6",
      title: "Competition Rules, Minor Safeguarding & Consent",
      description: "Official code of conduct, safeguarding for participants under 18, and data privacy agreements.",
      order: 6,
      fields: [
        {
          id: "field-agree-rules",
          fieldKey: "agreedToRules",
          type: "checkbox",
          label: "I agree to the official Mithila Queen Competition Rules and Regulations.",
          description: "Covers evaluation fairness, event etiquette, and adherence to organizing guidelines.",
          required: true,
          order: 0,
        },
        {
          id: "field-agree-eligibility",
          fieldKey: "agreedToEligibility",
          type: "checkbox",
          label: "I confirm that I meet the eligibility criteria (female participant, any age, married or unmarried) and all submitted information is truthful and accurate.",
          description: "Open to all women of any age, married or unmarried, with zero prior experience required.",
          required: true,
          order: 1,
        },
        {
          id: "field-agree-media",
          fieldKey: "agreedToMedia",
          type: "checkbox",
          label: "Media Consent: I grant permission to The Origin Foundation to use submitted audition videos, portrait photographs, and official event footage for competition broadcast and cultural documentation.",
          description: "Ensures respectful and dignified media usage across official event channels.",
          required: true,
          order: 2,
        },
        {
          id: "field-agree-privacy",
          fieldKey: "agreedToPrivacy",
          type: "checkbox",
          label: "I accept the Privacy Policy, Payment Terms (NPR 399 administrative fee), and data processing procedures.",
          description: "Your confidential data is stored securely and never sold or shared with external advertisers.",
          required: true,
          order: 3,
        },
        {
          id: "field-guardian-name",
          fieldKey: "guardianName",
          type: "text",
          label: "Parent / Legal Guardian Full Name (Required if under 18)",
          placeholder: "Full legal name of parent or legal guardian",
          description: "If participant is under 18 years of age, guardian name is legally required.",
          required: false,
          order: 4,
        },
        {
          id: "field-guardian-phone",
          fieldKey: "guardianPhone",
          type: "phone",
          label: "Parent / Legal Guardian Mobile Number (Required if under 18)",
          placeholder: "+977 9800000000",
          description: "Contact number of parent or legal guardian for minor safeguarding verification.",
          required: false,
          order: 5,
        },
        {
          id: "field-guardian-relation",
          fieldKey: "guardianRelation",
          type: "select",
          label: "Relationship to Participant (If under 18)",
          description: "Select relationship of the legal guardian.",
          required: false,
          order: 6,
          options: [
            { label: "Mother", value: "Mother" },
            { label: "Father", value: "Father" },
            { label: "Legal Guardian", value: "Legal Guardian" },
            { label: "Not Applicable (Participant is 18 or older)", value: "N/A" },
          ],
        },
        {
          id: "field-guardian-consent",
          fieldKey: "guardianConsent",
          type: "checkbox",
          label: "Parent / Legal Guardian Consent: As parent or legal guardian, I give my formal consent for my minor daughter/ward to participate in Mithila Queen and agree to safeguarding policies.",
          description: "Mandatory legal parental acknowledgment for any participant under 18.",
          required: false,
          order: 7,
        },
      ],
    },

    // -------------------------------------------------------------------------
    // STEP 8: Official Registration Fee & Payment (Separate Drag-and-Drop Step)
    // -------------------------------------------------------------------------
    {
      id: "step-payment",
      title: "Official Registration Fee & Payment",
      description: "Scan official payment QR code, or transfer to the account, and upload transfer receipt.",
      order: 7,
      isPaymentStep: true,
      fields: [
        {
          id: "field-tx-reference",
          fieldKey: "transactionReference",
          type: "text",
          label: "Payment Transaction Reference / UTR Code (Optional)",
          placeholder: "e.g. 12-digit transaction ID, bank journal number, or wallet ref",
          description: "Optional transaction reference or journal code from your payment receipt.",
          required: false,
          order: 0,
        },
        {
          id: "field-payment-screenshot",
          fieldKey: "paymentScreenshot",
          type: "image",
          label: "Payment Screenshot / Bank Voucher Upload",
          description: "Upload clear screenshot or transfer receipt showing transaction reference and date (JPEG, PNG).",
          required: true,
          order: 1,
        },
      ],
    },
  ],
};


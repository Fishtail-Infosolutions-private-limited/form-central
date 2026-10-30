# The Origin Foundation — Mithila Queen Official Platform

The official online presence and competition management platform for **The Origin Foundation** and its flagship initiative, **Mithila Queen**, based in **Janakpur Dham, Nepal**. Built with **Next.js 16 (App Router)**, **React 19**, **PostgreSQL**, **Prisma ORM**, **Tailwind CSS**, and **Google Drive API v3**.

---

## ⚡ Organization & Competition Identity

- **Organization:** The Origin Foundation
- **Proposed Tagline:** *"Rooted in Identity. Driven by Purpose."*
- **Flagship Initiative:** Mithila Queen
- **Competition Tagline:** *"Celebrating Mithila's Culture, Confidence & Talent."*
- **Location:** Janakpur Dham, Madhesh Province, Nepal
- **Official Email:** `originfoundation107@gmail.com`
- **Registration Fee:** NPR 399 per registration
- **Event Schedule:** To Be Announced (Asia/Kathmandu)
- **Leadership Team:**
  - **Gaurav Gupta** — Managing Director — `+977 9704571941`
  - **Dipendra Shah Kalwar** — Managing Director — `+977 981-2005468`

---

## 🎨 Cultural Design System

- **Deep Navy (`#0A192F`):** Headers, navigation, footer, and primary brand surfaces.
- **Warm Ivory (`#FDFBF7`):** Website background and soft page surfaces.
- **Muted Gold (`#C5A880`):** Action highlights, decorative borders, and cultural motifs.
- **Slate Navy (`#243B53`):** Sub-headers, secondary panels, and borders.
- **Pure White (`#FFFFFF`):** Form cards, modal surfaces, and detail views.
- **Soft Beige (`#E9E2D5`):** Dividers, borders, and pattern fills.

---

## ⚡ Key Architecture & Features

### 1. Dedicated Public Portal (12 Pages)
- **Home (`/`):** Cultural hero section, Discover/Register CTA, prize structure, leadership, announcements, FAQ preview.
- **About (`/about`):** Organization story, vision, mission, and leadership profiles.
- **Mithila Queen (`/mithila-queen`):** Competition overview, eligibility, prizes, and video guidelines.
- **Registration (`/register`):** Dedicated 7-step wizard with minor safeguarding and payment workflow.
- **Registration Status (`/registration-status`):** Secure applicant status verification and official PDF download.
- **Culture & Heritage (`/culture`):** Celebrating Mithila art, folk painting, language, literature, and female empowerment.
- **FAQ (`/faq`):** 10 verified questions and answers.
- **Contact (`/contact`):** Direct phone lines, email, and inquiry form.
- **Policies:** Privacy Policy & Minor Safeguarding (`/privacy-policy`), Terms (`/terms`), Competition Rules (`/rules`), and Refund Policy (`/refund-policy`).

### 2. Dedicated 7-Step Registration Workflow
1. **Personal Information:** Full legal name, date of birth, contact details, geographical address (automatic minor detection for age < 18).
2. **Participant Profile:** Cultural interests, motivation, talents, spoken languages, and education.
3. **Additional Details:** Height field omitted pending organizer confirmation.
4. **Social Media Accounts:** At least one required among Instagram, TikTok, Facebook (passwords never requested).
5. **Photo & Media Uploads:** Profile photo upload with file type and size validation.
6. **Rules, Media & Minor Safeguarding Consent:** Formal parental/guardian consent recorded for minors under 18.
7. **Review & Final Submission:** Summary confirmation screen, generates `MQ-YYYY-XXXXXX` reference ID.

### 3. Decoupled Payment & Review Architecture
- **Payment Workflow:** NPR 399 fee with official QR code, transaction reference input, and payment screenshot upload.
- **Independent States:**
  - `PaymentStatus`: `PENDING`, `UNDER_REVIEW`, `VERIFIED`, `CLARIFICATION_REQUIRED`, `FAILED`
  - `ApplicationStatus`: `SUBMITTED`, `UNDER_REVIEW`, `ACTION_REQUIRED`, `APPROVED`, `REJECTED`
- **Admin Verification Center:** Independent verification of banking records before applications can advance to approval.

### 4. Automatic Branded PDF Confirmation
- Generated strictly following: **Application Submitted $\rightarrow$ Payment Verified $\rightarrow$ Application Approved**.
- High-resolution vector A4 certificate with The Origin Foundation logo, Mithila Queen branding, participant name, registration ID, date, verification QR code, and explicit disclaimer ("Administrative registration confirmation, not a winning certificate").
- Delivered automatically as an email attachment.

### 5. Managing Directors Command Portal
- Independent secure logins for **Gaurav Gupta** and **Dipendra Shah Kalwar**.
- Live application metrics, payment verification, application adjudication, email campaign delivery, and competition settings.
- **3-Panel Builder Interface:**
  - **Field Palette:** 16 supported field types (Text, Email, Phone, Number, Text Area, Date Picker, Time Picker, Dropdown Select, Radio Buttons, Checkboxes, Single Consent Checkbox, Image Upload, Video Upload, Document Upload, Section Header, Divider).
  - **Canvas:** Drag-and-drop / click-to-add step builder with step duplication, reordering, and deletion.
  - **Field Inspector:** Real-time property configuration (Labels, Data Keys, Required Toggles, Choices, Limits, Helper text).
- **Rich Text Editor (WYSIWYG):** Event descriptions and participant instructions support bold, italic, H1, H2, H3, bullet points, numbered lists, blockquotes, and dividers.
- **Interactive Live Preview:** Test participant journeys and validations inside an interactive simulation modal.
- **Form Versioning:** Publishing creates an immutable `FormVersion` snapshot, guaranteeing historical registrations remain intact when forms are updated.

### 5. Responses & Submission Management
- **Search & Filter:** Search across participant names, emails, phone numbers, and reference codes.
- **Automatic Read Tracking:** Automatically marks submissions as read when viewed.
- **Direct Email Notice:** Send custom broadcast or individual email notices directly to participants from the dashboard.
- **Cascade Deletion:** When an admin deletes a registration, all associated local image/document files and Google Drive video files are automatically purged.
- **Excel (.xlsx) Export:** Export submissions with dynamic column mapping, formatted dates, and formula injection sanitization.

### 6. Design & User Experience
- **Color Theme:** Strictly High-Contrast Black, White, and Emerald Green (`#059669` / `#10b981`).
- **Typography:** Modern Google Poppins font family throughout all public and admin views.
- **Smooth Animations:** Framer Motion transitions and smooth scroll navigation on the home page.
- **Collapsible Sidebar:** Admin sidebar supports full expansion and icon-only compact mode.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16.4.3 (App Router, Turbopack) |
| **Language** | TypeScript 5 (Strict Mode) |
| **Frontend** | React 19, Tailwind CSS, Lucide Icons, Framer Motion |
| **Database** | PostgreSQL 14+ |
| **ORM** | Prisma ORM 5.22 |
| **Authentication** | Bcrypt.js, Jose (Stateless JWT in HttpOnly Cookies) |
| **Email (SMTP)** | Nodemailer |
| **Storage / OAuth** | Google Drive API v3 (googleapis) |
| **Spreadsheets** | ExcelJS |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js:** `v20.x` or `v22.x` (LTS)
- **PostgreSQL:** Running locally or remotely
- **npm** or **pnpm**

### 2. Environment Configuration

Copy or configure your `.env` file in the project root:

```env
# PostgreSQL Connection URL
DATABASE_URL="postgresql://postgres:root@localhost:5432/form_central?schema=public"

# Application URL & Name
APP_URL="http://localhost:3000"
APP_NAME="Form Central"

# Admin Authentication Secret (min 32 random characters)
AUTH_SECRET="fc_production_grade_secret_super_key_32chars"

# Email Delivery (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-google-app-password"
EMAIL_FROM="your-email@gmail.com"
EMAIL_FROM_NAME="Form Central"

# Google Drive OAuth 2.0 Credentials
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/google-drive/callback"

# File Upload Constraints (in MB)
MAX_IMAGE_SIZE_MB=10
MAX_VIDEO_SIZE_MB=100
MAX_DOCUMENT_SIZE_MB=25
```

### 3. Database Initialization & Seeding

```bash
# Push schema migrations to PostgreSQL
npx prisma db push

# Seed master administrator and demo competition form
npm run db:seed
```

**Master Admin Credentials:**
- **URL:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **Email:** `admin@formcentral.com`
- **Password:** Configured via `ADMIN_DEFAULT_PASSWORD` in your `.env` file (or set upon database initialization)

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the homepage and public registration portal.

---

## 🧪 Verification & Build

```bash
# Run TypeScript compilation check
npx tsc --noEmit

# Run Next.js production build
npm run build

# Start production server
npm start
```

---

## 🌐 Production Deployment (Contabo VPS)

A complete guide for deploying Form Central to a **Contabo VPS (Ubuntu 22.04 / 24.04)** with PostgreSQL, PM2 process management, Nginx reverse proxy, and free Let's Encrypt SSL is available in:

👉 **[deployment.md](deployment.md)**

---

## 📄 License

Proprietary — Developed for Fishtail Info Solutions Private Limited. All rights reserved.

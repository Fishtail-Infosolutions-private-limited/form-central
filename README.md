# Form Central - Event & Registration Platform

A production-ready event registration and dynamic form builder platform for competitions, hackathons, sports tournaments, marathon events, and participant logistics. Built with **Next.js 16 (App Router)**, **React 19**, **PostgreSQL**, **Prisma ORM**, **Tailwind CSS**, and **Google Drive API v3**.

---

## ⚡ Key Architecture & Features

### 1. Single Administrator Security Model
- **Exclusive Command Portal:** Strictly one administrator manages the application. No public registration for admins or accounts for users.
- **Master Credentials (Seeded):**
  - **Email:** `admin@formcentral.com`
  - **Password:** `fishtailinfosolutions123`
- **Password Management & In-App Change:**
  - Administrators can change their password directly in `/admin/settings` (requires current password verification and enforces bcrypt hashing).
- **Forgot Password Recovery via Connected Google Account:**
  - Forgot password flow on `/admin/login` restricted exclusively to the verified internal connected Google account.
  - Generates a 6-digit OTP code sent via SMTP with a 10-minute expiry and 5-attempt rate-limit protection.

### 2. Google Drive Video Storage (OAuth 2.0)
- **Direct Integration:** Administrator connects an organizational or personal Google account via official Google OAuth 2.0 with offline access.
- **Interactive Folder Browser:** Browse Drive directories, create new destination folders, and select where participant videos stream directly.
- **Account History Management:** View previously linked accounts and permanently delete historical account records with instant UI synchronization.
- **Direct In-Site Video Playback:** Admin dashboard plays participant submission videos directly within the platform using custom embedded HTML5 / Drive players (no external Google Drive redirects).
- **Graceful Disconnection:** Custom confirmation dialog replaces browser alerts, properly disconnecting credentials while safeguarding historical records.

### 3. Public Registrant Journey (Zero Account Creation)
- **Published Event Slugs:** Participants access clean URLs (e.g., `/register/pokhara-city-run-2026`).
- **Cryptographic Email OTP Verification:**
  - Registrant enters legal name, email, and phone in Step 1.
  - Server sends a 6-digit OTP code to verify real email ownership.
  - Verified state is managed via secure server-side tokens without requiring user accounts or sessions.
- **Multi-Step Dynamic Forms:** Clean stepped participant experience with live progress bar and step validation.
- **Smart Media Uploads with File Replacement:**
  - Supports image, document (PDF), and video uploads with explicit file size badges.
  - When a participant clicks **"Change File"**, the previously uploaded file is automatically purged to eliminate orphaned storage.
  - Displays original user file names (e.g., `passport_photo.png`) instead of internal server hashes.
- **Reference Code & Confirmation:** On submission, generates a unique tracking reference code (`FC-2026-XXXXXX`) and displays a confirmation screen.

### 4. Dynamic Visual Form Studio
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
- **Password:** `fishtailinfosolutions123`

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

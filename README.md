# Form Central - Event & Registration Platform

A high-performance event registration and dynamic form builder platform for competitions, hackathons, sports events, and participant logistics. Built with Next.js 16 (App Router), React 19, PostgreSQL, Prisma ORM, Tailwind CSS, and Google Drive API v3.

---

## Key Architecture & Capabilities

1. **Single Administrator Model**
   - Strictly one administrator manages the entire application.
   - No public account sign-up, no multiple admin accounts, and no general user accounts.
   - Initial administrator is created securely via `npm run db:seed`.
   - Admin authentication powered by bcrypt (cost 12) + HttpOnly stateless JWT cookies with `jose`.

2. **Google Drive Integration (OAuth 2.0)**
   - Located at `/admin/settings/integrations/google-drive`.
   - Administrator connects Google account via official OAuth 2.0 with offline access.
   - Administrator browses accessible Google Drive folders, navigates subfolders, selects an existing folder, or creates a new folder.
   - Selected folder ID & name are stored in PostgreSQL (`GoogleDriveIntegration` singleton).
   - Public participant video uploads stream securely to this administrator-configured Drive folder via Google Drive API v3.
   - Videos remain private by default; administrators can inspect and play them directly in the dashboard.

3. **Public Registrant Flow (Zero Account Creation)**
   - Registrants access published events via unique URLs (e.g., `/register/pokhara-marathon-2026`).
   - **Step 1:** Registrant inputs Full Name, Email, and Phone number.
   - **OTP Email Challenge:** Server generates a cryptographically random 6-digit OTP, stores a SHA-256 hash in PostgreSQL with a 10-minute expiry, and emails the code via SMTP.
   - **Verification:** Registrant enters the 6-digit code. Once verified, a server token is issued. No user account or session is created.
   - **Step 2..N:** Registrant completes dynamic fields, uploads profile photo (local) and motivation video (Google Drive) with instant file replacement support.
   - **Review & Submit:** Idempotent submission transaction generates a unique reference code (`FC-2026-XXXXXX`) and stores all answers linked to the form version.

4. **Dynamic Visual Form Builder**
   - 3-panel studio interface:
     - **Left:** Palette of 16 supported field types (text, email, phone, number, textarea, select, radio, checkbox-group, checkbox, date, time, file, image, video, heading, divider).
     - **Center:** Form Canvas with multi-step organizer, reorder controls, duplicate, and delete.
     - **Right:** Selected field configuration (label, data key, placeholder, description, required toggle, choices editor, numeric/text limits).
   - **Mandatory System Fields:** `fullName`, `email`, and `phone` are locked and permanently required.
   - **Live Preview:** Instant interactive simulation of registrant journey without publishing.
   - **Form Versioning:** Each publish action writes an immutable `FormVersion` snapshot to PostgreSQL, ensuring historical registrations are never corrupted when a form is edited.

5. **Responses & Excel Export**
   - Live searchable and filterable table across participant name, email, phone, and reference code.
   - In-site HTML5 and Google Drive video player modal.
   - Read / Unread status tracking.
   - Direct email notification modal to send updates or rejection notices to registrants.
   - **Excel Export (.xlsx):** Export all or filtered submissions with dynamic custom field columns, formula injection sanitization, and auto-adjusted column widths.

---

## Quick Start Guide

### 1. Environment Setup

Create `.env` using `.env.example`:

```bash
# PostgreSQL Connection
DATABASE_URL="postgresql://postgres:root@localhost:5432/form_central?schema=public"

# App URL & Name
NEXT_PUBLIC_APP_URL="http://localhost:3000"
APP_NAME="Form Central"

# Admin Authentication Secret (min 32 chars)
AUTH_SECRET="fc_production_grade_secret_running_comp_2026_super_key_32chars"

# Email Delivery (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="neosparknepal@gmail.com"
SMTP_PASSWORD="your-google-app-password"
EMAIL_FROM="neosparknepal@gmail.com"
EMAIL_FROM_NAME="Form Central"

# Google Drive OAuth 2.0 Credentials
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/google-drive/callback"

# Upload Limits
MAX_IMAGE_SIZE_MB=10
MAX_VIDEO_SIZE_MB=100
MAX_DOCUMENT_SIZE_MB=25
```

### 2. Database Migration & Seeding

```bash
# Run Prisma migrations
npx prisma migrate dev --name init

# Seed default administrator & sample form
npm run db:seed
```

**Default Seed Admin Credentials:**

- **Email:** `admin@formcentral.com`
- **Password:** `fishtailinfosolutions123`

### 3. Run Development Server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Verification & Build

Run TypeScript verification:

```bash
npx tsc --noEmit
```

Run production build:

```bash
npm run build
```

---

## Production Deployment (Contabo VPS)

See [deployment.md](deployment.md) for full step-by-step Contabo VPS setup with Ubuntu 22.04 / 24.04, PostgreSQL, PM2, and Nginx reverse proxy.

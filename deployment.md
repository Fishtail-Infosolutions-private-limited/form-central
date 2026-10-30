# Form Central - Contabo VPS Deployment Guide

Simple, step-by-step production deployment instructions for **Contabo VPS** (Ubuntu 22.04 / 24.04 LTS).

---

## 1. Connect to Contabo Server & Install Prerequisites

SSH into your Contabo server as `root`:

```bash
ssh root@YOUR_CONTABO_SERVER_IP
```

Update system packages:

```bash
sudo apt update && sudo apt upgrade -y
```

Install **Node.js 20 LTS**, **PostgreSQL**, **Nginx**, and **Git**:

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx postgresql postgresql-contrib

# Install PM2 process manager globally
sudo npm install -g pm2
```

Verify installations:

```bash
node -v   # Should show v20.x
npm -v    # Should show 10.x
```

---

## 2. Setup PostgreSQL Database

Switch to the postgres user and create the database and user:

```bash
sudo -u postgres psql
```

Run these SQL commands inside the `psql` console:

```sql
CREATE DATABASE form_central;
CREATE USER fcadmin WITH ENCRYPTED PASSWORD 'StrongSecretPassword123!';
GRANT ALL PRIVILEGES ON DATABASE form_central TO fcadmin;
ALTER DATABASE form_central OWNER TO fcadmin;
\q
```

---

## 3. Clone Repository & Setup Files

Navigate to `/var/www` and clone your project:

```bash
cd /var/www
git clone <YOUR_GIT_REPO_URL> form-central
cd form-central
```

Install dependencies:

```bash
npm install
```

---

## 4. Configure Environment Variables (`.env`)

Create your production environment file:

```bash
nano .env
```

Paste the configuration below (replace placeholders with your actual domain, database password, and Google credentials):

```env
# Application Settings
NODE_ENV="production"
PORT=3000
NEXT_PUBLIC_APP_URL="https://your-domain.com"

# Session Security (32+ character random string)
# Generate with: openssl rand -base64 32
AUTH_SECRET="replace-with-a-very-long-random-secret-key-32chars"

# Contabo PostgreSQL Connection
DATABASE_URL="postgresql://fcadmin:StrongSecretPassword123!@localhost:5432/form_central?schema=public"

# Google Cloud OAuth (for Google Drive Video Storage)
GOOGLE_CLIENT_ID="your-google-oauth-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
GOOGLE_REDIRECT_URI="https://your-domain.com/api/google-drive/callback"

# Gmail SMTP (Email OTP Verification & Participant Notices)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="neosparknepal@gmail.com"
SMTP_PASSWORD="your-google-app-password"
EMAIL_FROM="neosparknepal@gmail.com"
EMAIL_FROM_NAME="Form Central"
```

Save with `Ctrl + O`, then `Enter`, then exit with `Ctrl + X`.

---

## 5. Initialize Database & Build Application

Sync Prisma schema to PostgreSQL and seed initial super admin account:

```bash
# Push database tables to PostgreSQL
npx prisma db push

# Seed default Super Admin account (admin@formcentral.com / fishtailinfosolutions123)
npm run db:seed

# Create production build
npm run build
```

---

## 6. Run with PM2 Process Manager

Start the application under PM2 so it restarts automatically on reboots:

```bash
# Start Next.js with PM2
pm2 start npm --name "form-central" -- start

# Save PM2 process list
pm2 save

# Setup automatic startup on server reboot
pm2 startup
```

Check status:

```bash
pm2 status
pm2 logs form-central --lines 30
```

---

## 7. Configure Nginx Reverse Proxy

Create an Nginx configuration file for your domain:

```bash
sudo nano /etc/nginx/sites-available/form-central
```

Paste the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Allow participant video and file uploads up to 100MB
    client_max_body_size 100M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
    }
}
```

Enable site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/form-central /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 8. Setup Free SSL (HTTPS) with Certbot

Install Certbot and obtain an SSL certificate:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Select the option to automatically redirect HTTP traffic to HTTPS.

---

## 9. Update Google Cloud OAuth Redirect URI

Open **Google Cloud Console** > **APIs & Services** > **Credentials**:

1. Edit your OAuth 2.0 Web Client ID
2. Under **Authorized redirect URIs**, add your production URL:
   ```
   https://your-domain.com/api/google-drive/callback
   ```
3. Save changes.

---

## 10. Verification & Login

1. Open `https://your-domain.com` in your browser.
2. Click **Sign In** in the top-right navbar to access the command center at `/admin/login`.
3. Sign in with:
   - **Email:** `admin@formcentral.com`
   - **Password:** `fishtailinfosolutions123`
4. Go to **Settings** > **Google Drive Cloud Storage** > click **Connect Google Drive** to authenticate and select your destination video upload folder.

---

## Useful Maintenance Commands

```bash
# View live application logs
pm2 logs form-central

# Restart app after code changes
git pull
npm install
npm run build
pm2 restart form-central

# Check PostgreSQL service status
sudo systemctl status postgresql

# Check Nginx status
sudo systemctl status nginx
```

import "server-only";
import { google } from "googleapis";
import { prisma } from "@/lib/db/prisma";
import { Readable } from "stream";

export function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Missing Google OAuth credentials. Ensure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI are set."
    );
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

const SCOPES = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/userinfo.email",
];

export function getAuthorizationUrl(state: string): string {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "select_account consent", // Force account chooser & consent to allow changing accounts
    scope: SCOPES,
    state,
  });
}

export async function handleOAuthCallback(code: string) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Fetch connected account email
  const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
  const { data: userInfo } = await oauth2.userinfo.get();
  const email = userInfo.email || "Unknown";

  const expiryDate = tokens.expiry_date ? new Date(tokens.expiry_date) : null;

  // 1. Persist as currently active primary integration
  const integration = await prisma.googleDriveIntegration.upsert({
    where: { id: "primary" },
    update: {
      isConnected: true,
      accountEmail: email,
      accessToken: tokens.access_token || undefined,
      refreshToken: tokens.refresh_token || undefined,
      tokenExpiry: expiryDate,
      scope: tokens.scope || undefined,
      lastConnectedAt: new Date(),
    },
    create: {
      id: "primary",
      isConnected: true,
      accountEmail: email,
      accessToken: tokens.access_token || undefined,
      refreshToken: tokens.refresh_token || undefined,
      tokenExpiry: expiryDate,
      scope: tokens.scope || undefined,
      lastConnectedAt: new Date(),
    },
  });

  // 2. Also save to account history row so user can switch between accounts
  await prisma.googleDriveIntegration.upsert({
    where: { id: `account_${email}` },
    update: {
      isConnected: true,
      accountEmail: email,
      accessToken: tokens.access_token || undefined,
      refreshToken: tokens.refresh_token || undefined,
      tokenExpiry: expiryDate,
      scope: tokens.scope || undefined,
      lastConnectedAt: new Date(),
    },
    create: {
      id: `account_${email}`,
      isConnected: true,
      accountEmail: email,
      accessToken: tokens.access_token || undefined,
      refreshToken: tokens.refresh_token || undefined,
      tokenExpiry: expiryDate,
      scope: tokens.scope || undefined,
      lastConnectedAt: new Date(),
    },
  });

  return integration;
}

export async function getAuthenticatedDriveClient() {
  const integration = await prisma.googleDriveIntegration.findUnique({
    where: { id: "primary" },
  });

  if (!integration || !integration.isConnected || !integration.refreshToken) {
    return null;
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: integration.accessToken || undefined,
    refresh_token: integration.refreshToken || undefined,
    expiry_date: integration.tokenExpiry ? integration.tokenExpiry.getTime() : undefined,
  });

  // Listen for automatic token refreshes
  oauth2Client.on("tokens", async (newTokens) => {
    await prisma.googleDriveIntegration.update({
      where: { id: "primary" },
      data: {
        accessToken: newTokens.access_token || undefined,
        refreshToken: newTokens.refresh_token || undefined,
        tokenExpiry: newTokens.expiry_date ? new Date(newTokens.expiry_date) : undefined,
      },
    });
  });

  return {
    drive: google.drive({ version: "v3", auth: oauth2Client }),
    integration,
  };
}

export async function listFolders(parentId?: string) {
  const auth = await getAuthenticatedDriveClient();
  if (!auth) {
    throw new Error("Google Drive is not connected. Please connect your Google account in Settings.");
  }

  const parentQuery = parentId ? `'${parentId}' in parents` : `'root' in parents`;
  const q = `mimeType = 'application/vnd.google-apps.folder' and trashed = false and ${parentQuery}`;

  const res = await auth.drive.files.list({
    q,
    fields: "files(id, name, modifiedTime, webViewLink)",
    orderBy: "name",
    pageSize: 100,
  });

  return res.data.files || [];
}

export async function createFolder(name: string, parentId?: string) {
  const auth = await getAuthenticatedDriveClient();
  if (!auth) {
    throw new Error("Google Drive is not connected");
  }

  const res = await auth.drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: parentId ? [parentId] : undefined,
    },
    fields: "id, name, webViewLink",
  });

  return res.data;
}

export async function selectDestinationFolder(folderId: string, folderName: string) {
  const primary = await prisma.googleDriveIntegration.update({
    where: { id: "primary" },
    data: {
      folderId,
      folderName,
    },
  });

  if (primary.accountEmail) {
    try {
      await prisma.googleDriveIntegration.update({
        where: { id: `account_${primary.accountEmail}` },
        data: { folderId, folderName },
      });
    } catch {}
  }

  return primary;
}

export async function disconnectDrive() {
  return prisma.googleDriveIntegration.update({
    where: { id: "primary" },
    data: {
      isConnected: false,
      accessToken: null,
      refreshToken: null,
      tokenExpiry: null,
      folderId: null,
      folderName: null,
    },
  });
}

export async function uploadVideoToDrive(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  folderId?: string
) {
  const auth = await getAuthenticatedDriveClient();
  if (!auth) {
    throw new Error("Google Drive is not connected");
  }

  const targetFolderId = folderId || auth.integration.folderId;
  if (!targetFolderId) {
    throw new Error(
      "No Google Drive destination folder configured. Please select a folder in Settings."
    );
  }

  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);

  const res = await auth.drive.files.create({
    requestBody: {
      name: filename,
      parents: [targetFolderId],
    },
    media: {
      mimeType,
      body: stream,
    },
    fields: "id, name, size, mimeType, webViewLink, webContentLink",
  });

  return res.data;
}

export async function getDriveFileDetails(fileId: string) {
  const auth = await getAuthenticatedDriveClient();
  if (!auth) return null;

  try {
    const res = await auth.drive.files.get({
      fileId,
      fields: "id, name, size, mimeType, webViewLink, webContentLink, thumbnailLink",
    });
    return res.data;
  } catch {
    return null;
  }
}


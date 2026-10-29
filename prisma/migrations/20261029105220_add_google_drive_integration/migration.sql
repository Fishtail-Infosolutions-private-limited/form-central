-- CreateTable
CREATE TABLE "google_drive_integrations" (
    "id" TEXT NOT NULL DEFAULT 'primary',
    "isConnected" BOOLEAN NOT NULL DEFAULT false,
    "accountEmail" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiry" TIMESTAMP(3),
    "folderId" TEXT,
    "folderName" TEXT,
    "scope" TEXT,
    "lastConnectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "google_drive_integrations_pkey" PRIMARY KEY ("id")
);

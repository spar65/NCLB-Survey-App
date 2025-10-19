-- CreateTable
CREATE TABLE "SurveyVersion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "version" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxResponses" INTEGER
);

-- CreateTable
CREATE TABLE "InvitedUser" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "invitedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hasTaken" BOOLEAN NOT NULL DEFAULT false,
    "otpCode" TEXT,
    "otpExpiry" DATETIME,
    "consented" BOOLEAN NOT NULL DEFAULT false,
    "remindersSent" INTEGER NOT NULL DEFAULT 0,
    "lastReminderAt" DATETIME
);

-- CreateTable
CREATE TABLE "SurveyResponse" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "versionId" INTEGER NOT NULL,
    "responses" JSONB NOT NULL,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completionTime" INTEGER,
    "partial" BOOLEAN NOT NULL DEFAULT false,
    "userAgent" TEXT,
    "deviceType" TEXT,
    "ipAddressHash" TEXT,
    CONSTRAINT "SurveyResponse_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "SurveyVersion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLogin" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "SurveyVersion_version_key" ON "SurveyVersion"("version");

-- CreateIndex
CREATE INDEX "SurveyVersion_group_isActive_idx" ON "SurveyVersion"("group", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "InvitedUser_email_key" ON "InvitedUser"("email");

-- CreateIndex
CREATE INDEX "InvitedUser_group_idx" ON "InvitedUser"("group");

-- CreateIndex
CREATE INDEX "InvitedUser_email_hasTaken_idx" ON "InvitedUser"("email", "hasTaken");

-- CreateIndex
CREATE INDEX "SurveyResponse_email_group_versionId_idx" ON "SurveyResponse"("email", "group", "versionId");

-- CreateIndex
CREATE INDEX "SurveyResponse_submittedAt_idx" ON "SurveyResponse"("submittedAt");

-- CreateIndex
CREATE INDEX "SurveyResponse_group_partial_idx" ON "SurveyResponse"("group", "partial");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE INDEX "AdminUser_email_idx" ON "AdminUser"("email");

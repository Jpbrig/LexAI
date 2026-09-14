ALTER TABLE "Membership"
  ADD COLUMN "inviteTokenHash" TEXT,
  ADD COLUMN "inviteExpiresAt" TIMESTAMP(3),
  ADD COLUMN "inviteAcceptedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Membership_inviteTokenHash_key" ON "Membership"("inviteTokenHash");
CREATE INDEX "Membership_inviteExpiresAt_idx" ON "Membership"("inviteExpiresAt");

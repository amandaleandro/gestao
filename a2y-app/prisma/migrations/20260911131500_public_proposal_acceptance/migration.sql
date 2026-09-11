ALTER TABLE "Proposal"
  ADD COLUMN "publicToken" TEXT,
  ADD COLUMN "acceptanceName" TEXT,
  ADD COLUMN "acceptanceEmail" TEXT,
  ADD COLUMN "acceptedTermsAt" TIMESTAMP(3);

UPDATE "Proposal"
SET "publicToken" = gen_random_uuid()::text
WHERE "publicToken" IS NULL;

ALTER TABLE "Proposal"
  ALTER COLUMN "publicToken" SET NOT NULL;

CREATE UNIQUE INDEX "Proposal_publicToken_key" ON "Proposal"("publicToken");

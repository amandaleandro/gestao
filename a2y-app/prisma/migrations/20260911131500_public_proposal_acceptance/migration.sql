ALTER TABLE "Proposal"
  ADD COLUMN "publicToken" TEXT,
  ADD COLUMN "acceptanceName" TEXT,
  ADD COLUMN "acceptanceEmail" TEXT,
  ADD COLUMN "acceptedTermsAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Proposal_publicToken_key" ON "Proposal"("publicToken");

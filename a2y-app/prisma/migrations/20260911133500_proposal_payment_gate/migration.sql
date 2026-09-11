ALTER TABLE "Proposal"
  ADD COLUMN "paymentUrl" TEXT,
  ADD COLUMN "paidAt" TIMESTAMP(3);

CREATE INDEX "Proposal_paidAt_idx" ON "Proposal"("paidAt");

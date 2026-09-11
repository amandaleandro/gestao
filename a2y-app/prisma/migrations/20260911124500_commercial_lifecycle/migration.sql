-- Expand commercial pipeline stages
ALTER TYPE "StageStatus" ADD VALUE IF NOT EXISTS 'REUNIAO_MARCADA';
ALTER TYPE "StageStatus" ADD VALUE IF NOT EXISTS 'DIAGNOSTICO_REALIZADO';
ALTER TYPE "StageStatus" ADD VALUE IF NOT EXISTS 'NEGOCIACAO';
ALTER TYPE "StageStatus" ADD VALUE IF NOT EXISTS 'ONBOARDING';
ALTER TYPE "StageStatus" ADD VALUE IF NOT EXISTS 'IMPLANTACAO';
ALTER TYPE "StageStatus" ADD VALUE IF NOT EXISTS 'ATIVO';

-- New lifecycle enums
CREATE TYPE "ProposalStatus" AS ENUM ('RASCUNHO', 'ENVIADA', 'VISUALIZADA', 'ACEITA', 'RECUSADA', 'EXPIRADA');
CREATE TYPE "OnboardingStatus" AS ENUM ('RASCUNHO', 'EM_ANDAMENTO', 'CONCLUIDO');
CREATE TYPE "ImplementationStatus" AS ENUM ('PLANEJADA', 'EM_ANDAMENTO', 'BLOQUEADA', 'CONCLUIDA');

-- Opportunity fields on existing Client
ALTER TABLE "Client"
  ADD COLUMN "externalId" TEXT,
  ADD COLUMN "meetingAt" TIMESTAMP(3),
  ADD COLUMN "opportunityValue" DOUBLE PRECISION,
  ADD COLUMN "recurringValue" DOUBLE PRECISION,
  ADD COLUMN "closedAt" TIMESTAMP(3),
  ADD COLUMN "lostReason" TEXT;

CREATE UNIQUE INDEX "Client_externalId_key" ON "Client"("externalId");
CREATE INDEX "Client_source_idx" ON "Client"("source");
CREATE INDEX "Client_meetingAt_idx" ON "Client"("meetingAt");

-- Diagnosis
CREATE TABLE "Diagnosis" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "leadSource" TEXT,
  "monthlyLeadVolume" INTEGER,
  "channels" TEXT,
  "teamSize" INTEGER,
  "currentControl" TEXT,
  "quoteProcess" TEXT,
  "followUpProcess" TEXT,
  "averageTicket" DOUBLE PRECISION,
  "bottlenecks" TEXT,
  "priority" TEXT,
  "recommendedSolution" TEXT,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Diagnosis_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Diagnosis_clientId_key" ON "Diagnosis"("clientId");
ALTER TABLE "Diagnosis" ADD CONSTRAINT "Diagnosis_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Proposal
CREATE TABLE "Proposal" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "title" TEXT NOT NULL,
  "context" TEXT,
  "problems" TEXT,
  "solution" TEXT,
  "scope" TEXT,
  "exclusions" TEXT,
  "timeline" TEXT,
  "setupPrice" DOUBLE PRECISION,
  "monthlyPrice" DOUBLE PRECISION,
  "validUntil" TIMESTAMP(3),
  "status" "ProposalStatus" NOT NULL DEFAULT 'RASCUNHO',
  "sentAt" TIMESTAMP(3),
  "viewedAt" TIMESTAMP(3),
  "acceptedAt" TIMESTAMP(3),
  "rejectedAt" TIMESTAMP(3),
  "rejectionNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Proposal_clientId_status_idx" ON "Proposal"("clientId", "status");
CREATE INDEX "Proposal_createdAt_idx" ON "Proposal"("createdAt");
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Onboarding
CREATE TABLE "Onboarding" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "status" "OnboardingStatus" NOT NULL DEFAULT 'RASCUNHO',
  "data" JSONB,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Onboarding_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Onboarding_clientId_key" ON "Onboarding"("clientId");
ALTER TABLE "Onboarding" ADD CONSTRAINT "Onboarding_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Implementation / delivery
CREATE TABLE "Implementation" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "status" "ImplementationStatus" NOT NULL DEFAULT 'PLANEJADA',
  "checklist" JSONB,
  "startedAt" TIMESTAMP(3),
  "dueAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "metricsBefore" JSONB,
  "metricsAfter" JSONB,
  "caseConsent" BOOLEAN,
  "caseAnonymous" BOOLEAN NOT NULL DEFAULT false,
  "caseNotes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Implementation_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Implementation_clientId_key" ON "Implementation"("clientId");
ALTER TABLE "Implementation" ADD CONSTRAINT "Implementation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

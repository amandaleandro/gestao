-- CreateEnum
CREATE TYPE "StageStatus" AS ENUM ('NOVO', 'CONTATADO', 'INTERESSADO', 'PROPOSTA_ENVIADA', 'FECHADO_GANHO', 'FECHADO_PERDIDO');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('NOTA', 'LIGACAO', 'WHATSAPP', 'EMAIL', 'REUNIAO', 'MUDANCA_ETAPA');

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "website" TEXT,
    "googleMapsUrl" TEXT,
    "rating" DOUBLE PRECISION,
    "reviewsCount" INTEGER,
    "notes" TEXT,
    "stage" "StageStatus" NOT NULL DEFAULT 'NOVO',
    "source" TEXT NOT NULL DEFAULT 'google_maps',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "content" TEXT,
    "fromStage" "StageStatus",
    "toStage" "StageStatus",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportBatch" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "totalRows" INTEGER NOT NULL,
    "importedRows" INTEGER NOT NULL,
    "skippedRows" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportBatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Client_stage_idx" ON "Client"("stage");

-- CreateIndex
CREATE INDEX "Client_city_idx" ON "Client"("city");

-- CreateIndex
CREATE INDEX "Activity_clientId_idx" ON "Activity"("clientId");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

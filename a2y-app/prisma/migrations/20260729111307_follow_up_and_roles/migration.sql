-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'VENDEDOR');

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "nextContactAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'VENDEDOR';

-- CreateIndex
CREATE INDEX "Client_nextContactAt_idx" ON "Client"("nextContactAt");

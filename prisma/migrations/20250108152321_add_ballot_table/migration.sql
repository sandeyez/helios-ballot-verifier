/*
  Warnings:

  - You are about to drop the column `createdAt` on the `MerkleNode` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `MerkleNode` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `RadixNode` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `RadixNode` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[leftBallotId]` on the table `MerkleNode` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[rightBallotId]` on the table `MerkleNode` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[leftBallotId]` on the table `RadixNode` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[rightBallotId]` on the table `RadixNode` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "MerkleNode" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "leftBallotId" TEXT,
ADD COLUMN     "rightBallotId" TEXT;

-- AlterTable
ALTER TABLE "RadixNode" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "leftBallotId" TEXT,
ADD COLUMN     "rightBallotId" TEXT;

-- CreateTable
CREATE TABLE "Ballot" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Ballot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MerkleNode_leftBallotId_key" ON "MerkleNode"("leftBallotId");

-- CreateIndex
CREATE UNIQUE INDEX "MerkleNode_rightBallotId_key" ON "MerkleNode"("rightBallotId");

-- CreateIndex
CREATE UNIQUE INDEX "RadixNode_leftBallotId_key" ON "RadixNode"("leftBallotId");

-- CreateIndex
CREATE UNIQUE INDEX "RadixNode_rightBallotId_key" ON "RadixNode"("rightBallotId");

-- AddForeignKey
ALTER TABLE "MerkleNode" ADD CONSTRAINT "MerkleNode_leftBallotId_fkey" FOREIGN KEY ("leftBallotId") REFERENCES "Ballot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerkleNode" ADD CONSTRAINT "MerkleNode_rightBallotId_fkey" FOREIGN KEY ("rightBallotId") REFERENCES "Ballot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RadixNode" ADD CONSTRAINT "RadixNode_leftBallotId_fkey" FOREIGN KEY ("leftBallotId") REFERENCES "Ballot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RadixNode" ADD CONSTRAINT "RadixNode_rightBallotId_fkey" FOREIGN KEY ("rightBallotId") REFERENCES "Ballot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

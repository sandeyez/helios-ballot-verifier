/*
  Warnings:

  - You are about to drop the `Node` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Node" DROP CONSTRAINT "Node_leftId_fkey";

-- DropForeignKey
ALTER TABLE "Node" DROP CONSTRAINT "Node_rightId_fkey";

-- DropTable
DROP TABLE "Node";

-- CreateTable
CREATE TABLE "MerkleNode" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "value" TEXT NOT NULL,
    "isLeaf" BOOLEAN NOT NULL,
    "leftId" TEXT,
    "rightId" TEXT,

    CONSTRAINT "MerkleNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RadixNode" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "value" TEXT NOT NULL,
    "isLeaf" BOOLEAN NOT NULL,
    "leftId" TEXT,
    "rightId" TEXT,

    CONSTRAINT "RadixNode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MerkleNode_id_key" ON "MerkleNode"("id");

-- CreateIndex
CREATE UNIQUE INDEX "MerkleNode_leftId_key" ON "MerkleNode"("leftId");

-- CreateIndex
CREATE UNIQUE INDEX "MerkleNode_rightId_key" ON "MerkleNode"("rightId");

-- CreateIndex
CREATE UNIQUE INDEX "RadixNode_id_key" ON "RadixNode"("id");

-- CreateIndex
CREATE UNIQUE INDEX "RadixNode_leftId_key" ON "RadixNode"("leftId");

-- CreateIndex
CREATE UNIQUE INDEX "RadixNode_rightId_key" ON "RadixNode"("rightId");

-- AddForeignKey
ALTER TABLE "MerkleNode" ADD CONSTRAINT "MerkleNode_leftId_fkey" FOREIGN KEY ("leftId") REFERENCES "MerkleNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerkleNode" ADD CONSTRAINT "MerkleNode_rightId_fkey" FOREIGN KEY ("rightId") REFERENCES "MerkleNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RadixNode" ADD CONSTRAINT "RadixNode_leftId_fkey" FOREIGN KEY ("leftId") REFERENCES "RadixNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RadixNode" ADD CONSTRAINT "RadixNode_rightId_fkey" FOREIGN KEY ("rightId") REFERENCES "RadixNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

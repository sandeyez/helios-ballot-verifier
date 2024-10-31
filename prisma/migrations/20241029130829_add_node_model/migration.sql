-- CreateTable
CREATE TABLE "Node" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "value" TEXT NOT NULL,
    "leftId" TEXT,
    "rightId" TEXT,
    "isLeaf" BOOLEAN NOT NULL,

    CONSTRAINT "Node_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
CREATE UNIQUE INDEX "Node_id_key" ON "Node"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Node_leftId_key" ON "Node"("leftId");

-- CreateIndex
CREATE UNIQUE INDEX "Node_rightId_key" ON "Node"("rightId");

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_leftId_fkey" FOREIGN KEY ("leftId") REFERENCES "Node"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_rightId_fkey" FOREIGN KEY ("rightId") REFERENCES "Node"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "SellerInfo" (
    "id" SERIAL NOT NULL,
    "encryptedFlowApiKey" TEXT,
    "userId" TEXT,

    CONSTRAINT "SellerInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SellerInfo_userId_key" ON "SellerInfo"("userId");

-- AddForeignKey
ALTER TABLE "SellerInfo" ADD CONSTRAINT "SellerInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

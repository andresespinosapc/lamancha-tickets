/*
  Warnings:

  - Made the column `userId` on table `SellerInfo` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "SellerInfo" DROP CONSTRAINT "SellerInfo_userId_fkey";

-- AlterTable
ALTER TABLE "SellerInfo" ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "SellerInfo" ADD CONSTRAINT "SellerInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

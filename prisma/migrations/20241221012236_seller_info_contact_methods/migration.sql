-- CreateEnum
CREATE TYPE "ContactMethod" AS ENUM ('instagram', 'email', 'phone');

-- AlterTable
ALTER TABLE "SellerInfo" ADD COLUMN     "email" TEXT,
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "preferredContactMethod" "ContactMethod";
